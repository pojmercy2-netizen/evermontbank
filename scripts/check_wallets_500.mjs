import postgres from 'postgres'
import jwt from 'jsonwebtoken'

async function check() {
  const sql = postgres(process.env.DATABASE_URL)
  const [admin] = await sql`SELECT id, email, role FROM users WHERE role IN ('admin', 'superadmin') LIMIT 1`
  const token = jwt.sign(
    { sub: admin.id, email: admin.email, role: admin.role, type: 'access' },
    process.env.JWT_ACCESS_SECRET || 'evermont-access-secret-change-me-in-production-min-32-chars',
    { expiresIn: '1h' }
  )

  // Try without token
  const noAuthRes = await fetch('http://localhost:3000/api/admin/wallets')
  console.log('Without token Status:', noAuthRes.status)
  console.log('Without token Body:', await noAuthRes.text())

  // Try with admin token
  const res = await fetch('http://localhost:3000/api/admin/wallets', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  console.log('With token Status:', res.status)
  console.log('With token Body:', await res.text())

  await sql.end()
}

check().catch(console.error)
