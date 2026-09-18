import { readFileSync, writeFileSync } from 'node:fs'

const filePath = 'app/pages/dashboard/deposits.vue'
let content = readFileSync(filePath, 'utf-8')

// Find the crypto step2 div and inject loading/empty states before the form
const oldCryptoSection = `        <div v-else-if="isCryptoStep2" class="crypto-step2-state">
          <form @submit.prevent="handleCryptoSubmit" class="dashboard-form">`

const newCryptoSection = `        <div v-else-if="isCryptoStep2" class="crypto-step2-state">
          <div v-if="loadingSettings" style="text-align:center;padding:24px;color:#94a3b8;">
            <Icon name="lucide:loader-2" class="w-6 h-6 animate-spin" style="margin:0 auto 8px;display:block;" />
            <span>Loading wallet addresses...</span>
          </div>
          <div v-else-if="coins.length === 0" style="text-align:center;padding:24px;color:#94a3b8;">
            <p style="font-size:14px;margin-bottom:12px;">No crypto deposit addresses configured. Please contact support.</p>
            <button class="btn btn-outline" @click="isCryptoStep2 = false">Go Back</button>
          </div>
          <form v-else @submit.prevent="handleCryptoSubmit" class="dashboard-form">`

if (content.includes(oldCryptoSection)) {
  content = content.replace(oldCryptoSection, newCryptoSection)
  console.log('✅ Replaced crypto step2 section with loading/empty states')
} else {
  // Try to find what's actually there
  const idx = content.indexOf('isCryptoStep2" class="crypto-step2-state">')
  if (idx >= 0) {
    console.log('Found div at index', idx)
    console.log('Next 200 chars:', JSON.stringify(content.substring(idx, idx + 200)))
  } else {
    console.log('❌ Could not find crypto step2 div')
  }
}

// Also ensure the closing </form> at the end of crypto step2 is correct
// The form tag got wrapped in v-else, so we need to make sure the form closes before the </div>
// Find the matching close - let's check the section around the Go Back button
const goBk = content.indexOf(`@click="isCryptoStep2 = false">Go Back</button>`)
if (goBk >= 0) {
  console.log('Go Back button context:', JSON.stringify(content.substring(goBk - 20, goBk + 100)))
}

writeFileSync(filePath, content, 'utf-8')
console.log('File saved')
