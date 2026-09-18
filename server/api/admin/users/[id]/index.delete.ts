import { eq } from 'drizzle-orm'
import { useDb } from '../../../../database/client'
import { users } from '../../../../database/schema/users'
import { withErrorHandler, badRequest, notFound, forbidden } from '../../../../utils/error'
import { requireAdmin } from '../../../../utils/auth'
import { logAdminAction } from '../../../../utils/adminLog'
import { sendSuccess } from '../../../../utils/response'

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const userId = event.context.params?.id

  if (!userId) {
    throw badRequest('User ID is required')
  }

  const db = useDb()

  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!targetUser) {
    throw notFound('User')
  }

  // Guard: Admin cannot delete themselves
  if (targetUser.id === admin.id) {
    throw badRequest('You cannot delete your own administrator account')
  }

  // Guard: Only superadmin can delete another superadmin
  if (targetUser.role === 'superadmin' && admin.role !== 'superadmin') {
    throw forbidden('Only a superadmin can delete a superadmin account')
  }

  // Perform deletion (all child records cascade or set null)
  await db.delete(users).where(eq(users.id, userId))

  // Audit log
  await logAdminAction(event, {
    adminId: admin.id,
    action: 'DELETE_USER',
    targetType: 'users',
    targetId: userId,
    details: {
      email: targetUser.email,
      fullName: targetUser.fullName,
      role: targetUser.role
    }
  })

  return sendSuccess(event, { id: userId }, `User "${targetUser.fullName || targetUser.email}" deleted successfully`)
})
