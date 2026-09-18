import postgres from 'postgres'
import 'dotenv/config'

const sql = postgres(process.env.DATABASE_URL)

async function backfill() {
  console.log('--- Checking users for missing accounts ---')
  const users = await sql`SELECT id, email, full_name FROM users`
  const accounts = await sql`SELECT id, user_id, account_number, account_type FROM accounts`

  let createdCount = 0

  for (const u of users) {
    const userAccts = accounts.filter(a => a.user_id === u.id)
    if (userAccts.length === 0) {
      // Generate a unique 10-digit account number
      let acctNum = ''
      let isUnique = false
      while (!isUnique) {
        acctNum = (Math.floor(1000000000 + Math.random() * 9000000000)).toString()
        const existing = accounts.some(a => a.account_number === acctNum)
        if (!existing) isUnique = true
      }

      await sql`
        INSERT INTO accounts (user_id, account_number, account_type, balance, currency)
        VALUES (${u.id}, ${acctNum}, 'checking', '0.00', 'USD')
      `
      console.log(`Generated account ${acctNum} for user ${u.email} (${u.full_name})`)
      createdCount++
    }
  }

  console.log(`Backfill complete. Created ${createdCount} accounts.`)
  
  // Verify final state
  const allAccounts = await sql`SELECT u.email, a.account_number, a.account_type, a.balance FROM users u JOIN accounts a ON u.id = a.user_id`
  console.log(`Verified: ${allAccounts.length} accounts in database across all users.`)
  
  await sql.end()
}

backfill().catch(console.error)
