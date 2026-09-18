import { z } from 'zod'
import { withErrorHandler, badRequest, notFound } from '../../../utils/error'
import { requireAdmin } from '../../../utils/auth'
import { logAdminAction } from '../../../utils/adminLog'
import { sendSuccess } from '../../../utils/response'
import { getDepositSettings, saveDepositSettings } from '../../../utils/depositSettings'

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const query = getQuery(event)
  let coin = query.coin ? String(query.coin).toUpperCase().trim() : ''

  if (!coin) {
    try {
      const body = await readBody(event)
      if (body?.coin) coin = String(body.coin).toUpperCase().trim()
    } catch {
      // Body might be empty
    }
  }

  if (!coin) {
    badRequest('Coin identifier is required')
    return
  }

  const settings = getDepositSettings()
  const idx = settings.wallets.findIndex(w => w.coin.toUpperCase() === coin)

  if (idx === -1) {
    notFound(`Coin "${coin}" not found in wallet configuration`)
    return
  }

  const removed = settings.wallets.splice(idx, 1)[0]
  saveDepositSettings(settings)

  // Audit log
  await logAdminAction(event, {
    adminId: admin.id,
    action: 'DELETE_WALLET_ADDRESS',
    targetType: 'crypto_wallets',
    targetId: coin,
    details: { removedWallet: removed }
  })

  return sendSuccess(event, { coin }, `${coin} wallet removed successfully`)
})
