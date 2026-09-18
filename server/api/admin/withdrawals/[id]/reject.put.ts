import { eq } from 'drizzle-orm'
import { useDb } from '../../../../database/client'
import { transactions } from '../../../../database/schema/transactions'
import { accounts } from '../../../../database/schema/accounts'
import { withErrorHandler, badRequest, notFound } from '../../../../utils/error'
import { requireAdmin } from '../../../../utils/auth'
import { logAdminAction } from '../../../../utils/adminLog'
import { sendSuccess } from '../../../../utils/response'

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const txId = event.context.params?.id

  if (!txId) {
    throw badRequest('Withdrawal Transaction ID is required')
  }

  const db = useDb()

  const [tx] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, txId))
    .limit(1)

  if (!tx) {
    throw notFound('Withdrawal Transaction')
  }

  if (tx.status !== 'pending') {
    throw badRequest('Only pending withdrawals can be declined')
  }

  const amountVal = parseFloat(tx.amount)

  await db.transaction(async (dbTx) => {
    // If the withdrawal had already debited an account balance, restore it
    if (tx.accountId) {
      const [account] = await dbTx
        .select()
        .from(accounts)
        .where(eq(accounts.id, tx.accountId))
        .limit(1)

      if (account) {
        // If amount was negative (e.g. -150.00), subtracting it adds 150 back:
        // currentBalance - (-150) = currentBalance + 150
        const currentBalance = parseFloat(account.balance)
        const restoredBalance = (currentBalance - amountVal).toFixed(2)

        await dbTx
          .update(accounts)
          .set({
            balance: restoredBalance,
            updatedAt: new Date()
          })
          .where(eq(accounts.id, account.id))
      }
    }

    // Update transaction status to failed
    await dbTx
      .update(transactions)
      .set({
        status: 'failed'
      })
      .where(eq(transactions.id, txId))
  })

  // Log admin audit action
  await logAdminAction(event, {
    adminId: admin.id,
    action: 'REJECT_WITHDRAWAL',
    targetType: 'transactions',
    targetId: txId,
    details: { amount: tx.amount, reference: tx.reference }
  })

  return sendSuccess(event, null, 'Withdrawal request declined successfully')
})
