import { z } from 'zod'
import { eq, or } from 'drizzle-orm'
import { useDb } from '../../database/client'
import { users } from '../../database/schema/users'
import { accounts } from '../../database/schema/accounts'
import { hashPassword } from '../../utils/hash'
import { withErrorHandler, conflict } from '../../utils/error'
import { sendSuccess } from '../../utils/response'
import { sendEmail, getWelcomeEmailTemplate } from '../../utils/email'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Name is too short'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  phone: z.string().max(30).optional().nullable(),
  account_type: z.enum(['checking', 'savings', 'business']).optional().default('checking')
})

export default withErrorHandler(async (event) => {
  const body = await readBody(event)
  const validated = registerSchema.parse(body)

  const db = useDb()

  // Check if email or username is already taken
  const checkQuery = [eq(users.email, validated.email.toLowerCase().trim())]
  if (validated.username) {
    checkQuery.push(eq(users.username, validated.username.trim()))
  }
  const existingUsers = await db.select().from(users).where(or(...checkQuery)).limit(1)

  if (existingUsers.length > 0) {
    throw conflict('This email address or username is already registered. Please log in instead.')
  }

  // Hash password
  const passwordHash = await hashPassword(validated.password)

  // Generate a clean safe unique username if not provided
  const rawBase = (validated.username || validated.email.split('@')[0] || 'user').trim()
  const cleanBase = rawBase.replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 30)
  const finalUsername = validated.username || `${cleanBase}_${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`

  // Clean phone
  const cleanPhone = validated.phone ? validated.phone.trim() : null

  // Insert user inside transaction
  const result = await db.transaction(async (tx) => {
    const [newUser] = await tx.insert(users).values({
      email: validated.email.toLowerCase().trim(),
      fullName: validated.full_name.trim(),
      username: finalUsername,
      phone: cleanPhone,
      passwordHash,
      role: 'user',
      status: 'active',
      kycStatus: 'unverified'
    }).returning({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      username: users.username,
      phone: users.phone,
      role: users.role,
      status: users.status,
      kycStatus: users.kycStatus
    })

    if (!newUser) {
      throw new Error('Failed to create user record')
    }

    // Create an initial account based on selected account type
    const randAcct = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('')
    await tx.insert(accounts).values({
      userId: newUser.id,
      accountNumber: randAcct,
      accountType: validated.account_type || 'checking',
      balance: '0.00',
      currency: 'USD'
    })

    return newUser
  })

  // Trigger welcome email asynchronously
  const emailContent = getWelcomeEmailTemplate(result.fullName, result.email)
  sendEmail({
    to: result.email,
    subject: 'Welcome to Evermont Bank!',
    text: emailContent.text,
    html: emailContent.html
  }).catch((err) => {
    console.error('[Registration Email Error]', err)
  })

  return sendSuccess(event, result, 'Registration successful', 201)
})

