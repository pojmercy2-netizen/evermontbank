import postgres from 'postgres'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import bcrypt from 'bcryptjs'

// Load .env
const envPath = join(process.cwd(), '.env')
const envContent = readFileSync(envPath, 'utf-8')
envContent.split('\n').forEach(line => {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return
  const eqIdx = trimmed.indexOf('=')
  if (eqIdx === -1) return
  const key = trimmed.substring(0, eqIdx).trim()
  const val = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
  if (key && !process.env[key]) process.env[key] = val
})

const db = postgres(process.env.DATABASE_URL)

// Set a known password for the admin account so we can test
const newPassword = 'TestAdmin@2026'
const hash = await bcrypt.hash(newPassword, 12)

await db`UPDATE users SET password_hash = ${hash} WHERE email = 'admin@evermontbank.com'`
console.log(`Admin password reset to: ${newPassword}`)

// Verify
const user = await db`SELECT id, email, role, status FROM users WHERE email = 'admin@evermontbank.com'`
console.log('Admin user:', user[0])

await db.end()
