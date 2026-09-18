import { z } from 'zod'
import { withErrorHandler, badRequest, notFound } from '../../../utils/error'
import { requireAdmin } from '../../../utils/auth'
import { logAdminAction } from '../../../utils/adminLog'
import { sendSuccess } from '../../../utils/response'
import { getDepositSettings, saveDepositSettings } from '../../../utils/depositSettings'

const updateWalletSchema = z.object({
  coin: z.string().min(1, 'Coin identifier is required').transform(v => v.toUpperCase().trim()),
  address: z.string().min(6, 'Wallet address is too short').trim().optional(),
  network: z.string().optional(),
  label: z.string().optional(),
  active: z.boolean().optional()
})

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody(event)

  const validated = updateWalletSchema.safeParse(body)
  if (!validated.success) {
    badRequest(validated.error.errors[0]?.message || 'Invalid request body')
    return
  }

  const { coin, address, network, label, active } = validated.data
  const settings = getDepositSettings()

  const idx = settings.wallets.findIndex(w => w.coin.toUpperCase() === coin)
  if (idx === -1) {
    notFound(`Coin "${coin}" not found in wallet configuration`)
    return
  }

  const oldWallet = { ...settings.wallets[idx] }

  settings.wallets[idx] = {
    ...settings.wallets[idx],
    ...(address ? { address } : {}),
    ...(network !== undefined ? { network } : {}),
    ...(label !== undefined ? { label } : {}),
    ...(active !== undefined ? { active } : {})
  }

  saveDepositSettings(settings)

  // Audit log
  await logAdminAction(event, {
    adminId: admin.id,
    action: 'UPDATE_WALLET_ADDRESS',
    targetType: 'crypto_wallets',
    targetId: coin,
    details: { coin, oldWallet, updatedWallet: settings.wallets[idx] }
  })

  return sendSuccess(event, settings.wallets[idx], `${coin} wallet updated successfully`)
})
