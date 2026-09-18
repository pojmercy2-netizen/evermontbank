import postgres from 'postgres'
import { readFileSync } from 'node:fs'
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

const db = postgres(process.env.DATABASE_URL)

try {
  // Check current column type first
  const typeCheck = await db`
    SELECT column_name, data_type, character_maximum_length, udt_name
    FROM information_schema.columns
    WHERE table_name = 'admin_logs' AND column_name = 'target_id'
  `
  console.log('Current target_id column:', typeCheck[0])

  if (typeCheck[0]?.udt_name === 'uuid') {
    console.log('Changing target_id from UUID to VARCHAR(100)...')
    // Drop any existing data that isn't a valid UUID (there shouldn't be any real UUIDs stored here for wallets)
    await db`ALTER TABLE admin_logs ALTER COLUMN target_id DROP DEFAULT`
    await db`ALTER TABLE admin_logs ALTER COLUMN target_id SET DATA TYPE varchar(100) USING CASE WHEN target_id IS NULL THEN NULL ELSE target_id::text END`
    console.log('SUCCESS: target_id column changed to varchar(100)')
  } else {
    console.log('Column is already varchar or different type - no migration needed')
  }

  // Verify
  const verify = await db`
    SELECT column_name, data_type, character_maximum_length, udt_name
    FROM information_schema.columns
    WHERE table_name = 'admin_logs' AND column_name = 'target_id'
  `
  console.log('After migration target_id:', verify[0])
} catch (err) {
  console.error('Migration error:', err.message)
} finally {
  await db.end()
}
