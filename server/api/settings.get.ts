import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { withErrorHandler } from '../utils/error'
import { sendSuccess } from '../utils/response'

const DEFAULT_SETTINGS = {
  supportEmail: 'support@evermontbank.com',
  supportPhone: '+1 (800) 555-0199'
}

export default withErrorHandler(async (event) => {
  // In Nuxt/Nitro, process.cwd() is the project root in dev, and .output/server in production.
  const candidates = [
    join(process.cwd(), 'server', 'data', 'global_settings.json'),
    join(process.cwd(), '..', 'server', 'data', 'global_settings.json'),
    resolve(process.cwd(), 'server', 'data', 'global_settings.json')
  ]

  const filePath = candidates.find(p => existsSync(p)) || candidates[0]!

  // Ensure the default file exists (only write in dev — skip in read-only production builds)
  if (!existsSync(filePath)) {
    try {
      writeFileSync(filePath, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8')
    } catch (writeErr) {
      // In a read-only production env the file won't exist — return defaults gracefully
      console.warn('[Settings API] Could not write default settings file:', writeErr)
      return sendSuccess(event, DEFAULT_SETTINGS)
    }
  }

  try {
    const settings = JSON.parse(readFileSync(filePath, 'utf-8'))
    return sendSuccess(event, settings)
  } catch (readErr) {
    console.error('[Settings API] Failed to read settings file at:', filePath, readErr)
    // Return defaults rather than crashing with a 500
    return sendSuccess(event, DEFAULT_SETTINGS)
  }
})
