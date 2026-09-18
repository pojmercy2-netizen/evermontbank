import postgres from 'postgres'
import jwt from 'jsonwebtoken'

const BASE_URL = 'http://localhost:3000'

async function run() {
  console.log('====================================================')
  console.log(' EVERMONT BANK — COMPREHENSIVE ADMIN FUNCTION SUITE ')
  console.log('====================================================\n')

  const dbUrl = process.env.DATABASE_URL
  const jwtSecret = process.env.JWT_ACCESS_SECRET || 'evermont-access-secret-change-me-in-production-min-32-chars'

  const sql = postgres(dbUrl)

  // 1. Fetch admin user
  const [adminUser] = await sql`SELECT id, email, role, full_name, status FROM users WHERE role IN ('admin', 'superadmin') LIMIT 1`
  if (!adminUser) {
    throw new Error('No admin user found in database!')
  }
  console.log(`[AUTH] Found Admin User: ${adminUser.email} (${adminUser.role}) - ID: ${adminUser.id}`)

  // 2. Fetch regular active user
  const [regularUser] = await sql`SELECT id, email, role, full_name, status FROM users WHERE role = 'user' AND status = 'active' LIMIT 1`
  console.log(`[AUTH] Found Regular User: ${regularUser?.email || 'N/A'}`)

  // Generate tokens
  const adminToken = jwt.sign(
    { sub: adminUser.id, email: adminUser.email, role: adminUser.role, type: 'access' },
    jwtSecret,
    { expiresIn: '1h' }
  )

  const userToken = regularUser ? jwt.sign(
    { sub: regularUser.id, email: regularUser.email, role: regularUser.role, type: 'access' },
    jwtSecret,
    { expiresIn: '1h' }
  ) : null

  const adminHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  }

  const userHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  }

  let passed = 0
  let failed = 0

  async function test(name, fn) {
    process.stdout.write(`Testing: ${name}... `)
    try {
      await fn()
      console.log('✓ PASSED')
      passed++
    } catch (err) {
      console.log(`✗ FAILED: ${err.message}`)
      failed++
    }
  }

  // 1. Admin Dashboard Stats
  await test('GET /api/admin/dashboard', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/dashboard`, { headers: adminHeaders })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(JSON.stringify(json))
    if (json.data?.total_users === undefined && json.data?.data?.total_users === undefined) {
      throw new Error('Invalid dashboard stats payload')
    }
  })

  // 2. Admin Wallets GET
  await test('GET /api/admin/wallets (Load deposit settings & wallets)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/wallets`, { headers: adminHeaders })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(JSON.stringify(json))
    const wallets = json.data?.wallets || json.data
    if (!Array.isArray(wallets) || wallets.length === 0) throw new Error('Wallets list is empty')
  })

  // 3. Admin Wallets POST (Add new wallet address)
  await test('POST /api/admin/wallets (Add SOL wallet address)', async () => {
    // Delete first if already exists from prior test
    await fetch(`${BASE_URL}/api/admin/wallets?coin=SOL`, { method: 'DELETE', headers: adminHeaders })

    const res = await fetch(`${BASE_URL}/api/admin/wallets`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        coin: 'SOL',
        label: 'Solana (SOL)',
        network: 'Solana Mainnet',
        address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        active: true
      })
    })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(JSON.stringify(json))
  })

  // 4. Admin Wallets PUT (Change wallet address & details)
  await test('PUT /api/admin/wallets (Update SOL wallet address)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/wallets`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        coin: 'SOL',
        address: '9xNEWaddressForSolanaEvermontDepositAddress123',
        network: 'Solana Mainnet-Beta',
        label: 'Solana Pay (SOL)',
        active: true
      })
    })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(JSON.stringify(json))
  })

  // 5. Admin Deposit Settings PUT (Update bank transfer & alternative methods)
  await test('PUT /api/admin/wallets/deposit-settings (Update Bank Wire Details)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/wallets/deposit-settings`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        bankTransfer: {
          enabled: true,
          bankName: 'Evermont National Bank NA',
          accountName: 'Evermont Treasury Operations Corp',
          accountNumber: '9988776655',
          routingNumber: '021000021',
          swiftCode: 'EVBKUS33NYC',
          bankAddress: '100 Wall Street, New York, NY 10005',
          instructions: 'Include reference memo in the transfer description',
          minAmount: 100,
          processingTime: '1 Business Day'
        },
        otherMethods: {
          paypal: {
            enabled: true,
            email: 'deposits@evermontbank.com',
            instructions: 'Send via Friends & Family with Account Number'
          }
        }
      })
    })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(JSON.stringify(json))
  })

  // 6. User Dashboard Wallets GET (Verify user receives dynamic deposit details)
  await test('GET /api/dashboard/wallets (User fetches active wallets & bank details)', async () => {
    const res = await fetch(`${BASE_URL}/api/dashboard/wallets`, { headers: userHeaders })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(JSON.stringify(json))
    const wallets = json.data?.wallets || json.data
    const solFound = wallets.find(w => w.coin === 'SOL')
    if (!solFound) throw new Error('Newly added SOL wallet not found in user dashboard response')
    if (json.data?.bankTransfer?.accountNumber !== '9988776655') {
      throw new Error('Updated bank wire details not received by user')
    }
  })

  // 7. Admin Wallets DELETE (Delete test wallet)
  await test('DELETE /api/admin/wallets (Delete test wallet)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/wallets?coin=SOL`, {
      method: 'DELETE',
      headers: adminHeaders
    })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(JSON.stringify(json))
  })

  // 8. Admin Users GET
  await test('GET /api/admin/users', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/users`, { headers: adminHeaders })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(JSON.stringify(json))
  })

  // 9. Admin Create User POST
  let createdUserId = null
  const testEmail = `admintest_${Date.now()}@example.com`
  await test('POST /api/admin/users/create (Create new user with account)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/users/create`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'AdminCreated',
        email: testEmail,
        phone: '+15554443333',
        balance: 500,
        currency: 'USD',
        role: 'user',
        kycStatus: 'verified'
      })
    })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(JSON.stringify(json))
    createdUserId = json.data?.id
    if (!createdUserId) throw new Error('Missing created user ID')
  })

  // 10. Admin User Deposit POST
  await test('POST /api/admin/users/:id/deposit (Admin credit user balance)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/users/${createdUserId}/deposit`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        amount: 250,
        note: 'Admin bonus credit test'
      })
    })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(JSON.stringify(json))
  })

  // 11. Admin User Deduct POST
  await test('POST /api/admin/users/:id/deduct (Admin debit user balance)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/users/${createdUserId}/deduct`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        amount: 50,
        note: 'Fee adjustment debit test'
      })
    })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(JSON.stringify(json))
  })

  // 12. Admin User Contact PUT
  await test('PUT /api/admin/users/:id/contact (Update user contact)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/users/${createdUserId}/contact`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        email: testEmail,
        phone: '+15559998888'
      })
    })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(JSON.stringify(json))
  })

  // 13. Admin User Ban PUT
  await test('PUT /api/admin/users/:id/ban (Ban and Unban)', async () => {
    // Ban
    const banRes = await fetch(`${BASE_URL}/api/admin/users/${createdUserId}/ban`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ ban: true })
    })
    const banJson = await banRes.json()
    if (!banRes.ok || !banJson.success) throw new Error(JSON.stringify(banJson))

    // Unban
    const unbanRes = await fetch(`${BASE_URL}/api/admin/users/${createdUserId}/ban`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ ban: false })
    })
    const unbanJson = await unbanRes.json()
    if (!unbanRes.ok || !unbanJson.success) throw new Error(JSON.stringify(unbanJson))
  })

  // 14. Admin User Transactions GET
  await test('GET /api/admin/users/:id/transactions', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/users/${createdUserId}/transactions`, { headers: adminHeaders })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(JSON.stringify(json))
  })

  // 15. Admin KYC GET
  await test('GET /api/admin/kyc', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/kyc`, { headers: adminHeaders })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(JSON.stringify(json))
  })

  // 16. Admin Transactions GET
  await test('GET /api/admin/transactions', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/transactions`, { headers: adminHeaders })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(JSON.stringify(json))
  })

  // 17. User Submit Deposit POST -> Admin Deposit Approval
  let createdDepId = null
  await test('POST /api/dashboard/deposits (User submits deposit request)', async () => {
    const res = await fetch(`${BASE_URL}/api/dashboard/deposits`, {
      method: 'POST',
      headers: userHeaders,
      body: JSON.stringify({
        method: 'Bank Transfer',
        amount: 350.00,
        note: 'Wire transfer test from user'
      })
    })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(JSON.stringify(json))
    createdDepId = json.data?.id
    if (!createdDepId) throw new Error('Missing deposit ID')
  })

  // 18. Admin Deposits GET
  await test('GET /api/admin/deposits', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/deposits`, { headers: adminHeaders })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(JSON.stringify(json))
  })

  // 19. Admin Approve Deposit PUT
  await test('PUT /api/admin/deposits/:id/approve (Admin approves deposit)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/deposits/${createdDepId}/approve`, {
      method: 'PUT',
      headers: adminHeaders
    })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(JSON.stringify(json))
  })

  // 20. Admin Transfers GET
  await test('GET /api/admin/transfers', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/transfers`, { headers: adminHeaders })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(JSON.stringify(json))
  })

  // 21. Admin Cards GET
  await test('GET /api/admin/cards', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/cards`, { headers: adminHeaders })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(JSON.stringify(json))
  })

  // 22. Admin Notifications POST
  await test('POST /api/admin/notifications/send (Broadcast notification)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/notifications/send`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        title: 'System Security Notice',
        body: 'Evermont Bank scheduled maintenance completed.',
        audience: 'all',
        type: 'info'
      })
    })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(JSON.stringify(json))
  })

  // 23. Admin Platform Settings PUT
  await test('PUT /api/admin/settings (Update support contacts)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        supportEmail: 'support@evermontbank.com',
        supportPhone: '+1 (800) 555-0199'
      })
    })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(JSON.stringify(json))
  })

  // 24. Admin Withdrawal Decline PUT
  let testWithdrawalTx = null
  await test('PUT /api/admin/withdrawals/:id/reject (Decline withdrawal)', async () => {
    // Insert a pending withdrawal for regular user
    const [tx] = await sql`
      INSERT INTO transactions (user_id, type, amount, status, method, reference)
      VALUES (${regularUser.id}, 'withdrawal', -80.00, 'pending', 'Wire Withdrawal', ${'WTH-TEST-' + Date.now()})
      RETURNING id
    `
    testWithdrawalTx = tx.id

    const res = await fetch(`${BASE_URL}/api/admin/withdrawals/${testWithdrawalTx}/reject`, {
      method: 'PUT',
      headers: adminHeaders
    })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(JSON.stringify(json))
  })

  // 24. Clean up test user
  if (createdUserId) {
    await sql`DELETE FROM users WHERE id = ${createdUserId}`
  }
  if (createdDepId) {
    await sql`DELETE FROM deposits WHERE id = ${createdDepId}`
  }
  if (testWithdrawalTx) {
    await sql`DELETE FROM transactions WHERE id = ${testWithdrawalTx}`
  }

  await sql.end()

  console.log('\n====================================================')
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`)
  console.log('====================================================')

  if (failed > 0) {
    process.exit(1)
  }
}

run().catch((err) => {
  console.error('\nSUITE CRASHED:', err)
  process.exit(1)
})
