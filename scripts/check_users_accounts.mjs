import postgres from 'postgres'
import 'dotenv/config'

const sql = postgres(process.env.DATABASE_URL)
async function run() {
  const users = await sql`SELECT id, email, full_name, role FROM users`
  console.log('Total users:', users.length)
  const accounts = await sql`SELECT id, user_id, account_number, account_type, balance FROM accounts`
  console.log('Total accounts:', accounts.length)
  
  for (const u of users) {
    const uAccounts = accounts.filter(a => a.user_id === u.id)
    console.log(`User: ${u.email} (${u.full_name}) -> Accounts: ${uAccounts.map(a => a.account_type + ':' + a.account_number).join(', ') || 'NONE'}`)
  }
  await sql.end()
}
run().catch(console.error)
