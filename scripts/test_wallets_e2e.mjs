import postgres from 'postgres'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

// Load .env manually
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

const BASE = 'http://localhost:3000/api'

async function run() {
  // 1. Login
  console.log('=== 1. Logging in ===')
  const loginRes = await fetch(BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@evermontbank.com', password: 'Admin1234!' })
  })
  const loginJson = await loginRes.json()
  console.log('Login status:', loginRes.status)

  let token = loginJson?.data?.access_token || loginJson?.data?.data?.access_token
  if (!token) {
    console.log('Login failed:', JSON.stringify(loginJson))
    // Try to find any user in DB
    const db = postgres(process.env.DATABASE_URL)
    const users = await db`SELECT id, email, role FROM users WHERE role IN ('admin','superadmin') LIMIT 5`
    console.log('Admin users in DB:', users)
    await db.end()
    return
  }
  console.log('Token obtained:', token.substring(0, 30) + '...')

  // 2. GET admin wallets
  console.log('\n=== 2. GET /api/admin/wallets ===')
  const getRes = await fetch(BASE + '/admin/wallets', {
    headers: { Authorization: 'Bearer ' + token }
  })
  console.log('GET status:', getRes.status)
  const getJson = await getRes.json()
  console.log('GET response:', JSON.stringify(getJson, null, 2).substring(0, 500))

  // 3. PUT admin wallets (update BTC address)
  console.log('\n=== 3. PUT /api/admin/wallets (update BTC) ===')
  const putRes = await fetch(BASE + '/admin/wallets', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify({
      coin: 'BTC',
      address: 'bc1qtest_new_address_123',
      network: 'Bitcoin',
      label: 'Bitcoin (BTC)',
      active: true
    })
  })
  console.log('PUT status:', putRes.status)
  const putJson = await putRes.json()
  console.log('PUT response:', JSON.stringify(putJson, null, 2))

  // 4. GET dashboard/wallets (user side)
  console.log('\n=== 4. GET /api/dashboard/wallets (user side) ===')
  const dashRes = await fetch(BASE + '/dashboard/wallets', {
    headers: { Authorization: 'Bearer ' + token }
  })
  console.log('Dashboard wallets status:', dashRes.status)
  const dashJson = await dashRes.json()
  console.log('Dashboard wallets:', JSON.stringify(dashJson, null, 2).substring(0, 600))
}

run().catch(err => console.error('Fatal:', err.message))
