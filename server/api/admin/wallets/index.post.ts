import { z } from 'zod'
import { withErrorHandler, badRequest, conflict } from '../../../utils/error'
import { requireAdmin } from '../../../utils/auth'
import { logAdminAction } from '../../../utils/adminLog'
import { sendSuccess } from '../../../utils/response'
import { getDepositSettings, saveDepositSettings } from '../../../utils/depositSettings'

const addWalletSchema = z.object({
  coin: z.string().min(2, 'Coin symbol must be at least 2 characters').max(15, 'Coin symbol is too long').transform(v => v.toUpperCase().trim()),
  address: z.string().min(6, 'Wallet address is too short').trim(),
  network: z.string().optional().default('Mainnet'),
  label: z.string().optional(),
  active: z.boolean().optional().default(true)
})

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody(event)

  const validated = addWalletSchema.safeParse(body)
  if (!validated.success) {
    badRequest(validated.error.errors[0]?.message || 'Invalid wallet parameters')
    return
  }

  const { coin, address, network, label, active } = validated.data
  const settings = getDepositSettings()

  // Check if coin already exists
  const existingIdx = settings.wallets.findIndex(w => w.coin.toUpperCase() === coin)
  if (existingIdx !== -1) {
    conflict(`A wallet for "${coin}" already exists. You can edit its address instead.`)
    return
  }

  const newWallet = {
    coin,
    label: label?.trim() || `${coin}`,
    network: network?.trim() || `${coin} Network`,
    address,
    active,
    createdAt: new Date().toISOString()
  }

  settings.wallets.push(newWallet)
  saveDepositSettings(settings)

  // Audit log
  await logAdminAction(event, {
    adminId: admin.id,
    action: 'ADD_WALLET_ADDRESS',
    targetType: 'crypto_wallets',
    targetId: coin,
    details: { coin, address, network, label: newWallet.label }
  })

  return sendSuccess(event, newWallet, `${coin} wallet address added successfully`, 201)
})
