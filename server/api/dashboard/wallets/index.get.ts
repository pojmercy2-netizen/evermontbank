import { withErrorHandler } from '../../../utils/error'
import { requireActiveUser } from '../../../utils/auth'
import { sendSuccess } from '../../../utils/response'
import { getDepositSettings } from '../../../utils/depositSettings'

export default withErrorHandler(async (event) => {
  await requireActiveUser(event)

  const settings = getDepositSettings()

  // Filter only active wallets for users
  const activeWallets = settings.wallets.filter(w => w.active !== false)

  return sendSuccess(event, {
    wallets: activeWallets,
    bankTransfer: settings.bankTransfer,
    otherMethods: settings.otherMethods,
    data: activeWallets // direct array alias
  })
})
