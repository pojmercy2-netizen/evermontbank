import { z } from 'zod'
import { withErrorHandler, badRequest } from '../../../utils/error'
import { requireAdmin } from '../../../utils/auth'
import { logAdminAction } from '../../../utils/adminLog'
import { sendSuccess } from '../../../utils/response'
import { getDepositSettings, saveDepositSettings } from '../../../utils/depositSettings'

const bankTransferSchema = z.object({
  enabled: z.boolean().optional(),
  bankName: z.string().min(2, 'Bank name is required').optional(),
  accountName: z.string().min(2, 'Beneficiary name is required').optional(),
  accountNumber: z.string().min(3, 'Account number is too short').optional(),
  routingNumber: z.string().optional(),
  swiftCode: z.string().optional(),
  bankAddress: z.string().optional(),
  instructions: z.string().optional(),
  minAmount: z.number().nonnegative().optional(),
  processingTime: z.string().optional()
}).optional()

const otherMethodsSchema = z.object({
  paypal: z.object({
    enabled: z.boolean(),
    email: z.string().optional(),
    instructions: z.string().optional()
  }).optional(),
  cashapp: z.object({
    enabled: z.boolean(),
    cashtag: z.string().optional(),
    instructions: z.string().optional()
  }).optional(),
  zelle: z.object({
    enabled: z.boolean(),
    email: z.string().optional(),
    phone: z.string().optional(),
    instructions: z.string().optional()
  }).optional()
}).optional()

const updateDepositSettingsSchema = z.object({
  bankTransfer: bankTransferSchema,
  otherMethods: otherMethodsSchema
})

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody(event)

  const validated = updateDepositSettingsSchema.safeParse(body)
  if (!validated.success) {
    badRequest(validated.error.errors[0]?.message || 'Invalid deposit settings payload')
    return
  }

  const current = getDepositSettings()

  if (validated.data.bankTransfer) {
    current.bankTransfer = {
      ...current.bankTransfer,
      ...validated.data.bankTransfer
    }
  }

  if (validated.data.otherMethods) {
    current.otherMethods = {
      ...current.otherMethods,
      ...(validated.data.otherMethods.paypal ? { paypal: { ...(current.otherMethods.paypal || {}), ...validated.data.otherMethods.paypal } } : {}),
      ...(validated.data.otherMethods.cashapp ? { cashapp: { ...(current.otherMethods.cashapp || {}), ...validated.data.otherMethods.cashapp } } : {}),
      ...(validated.data.otherMethods.zelle ? { zelle: { ...(current.otherMethods.zelle || {}), ...validated.data.otherMethods.zelle } } : {})
    }
  }

  saveDepositSettings(current)

  await logAdminAction(event, {
    adminId: admin.id,
    action: 'UPDATE_DEPOSIT_SETTINGS',
    targetType: 'deposit_settings',
    details: { bankTransfer: current.bankTransfer, otherMethods: current.otherMethods }
  })

  return sendSuccess(event, {
    bankTransfer: current.bankTransfer,
    otherMethods: current.otherMethods
  }, 'Deposit details updated successfully')
})
