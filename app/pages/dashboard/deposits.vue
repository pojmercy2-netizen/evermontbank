<template>
  <div class="dashboard-page-container">
    <div class="dashboard-page-header">
      <h2>Fund Your Account</h2>
      <p>Add money to your Evermont Bank accounts instantly using your preferred method.</p>
    </div>

    <div class="page-grid">
      <!-- Add Funds Section -->
      <div class="dashboard-card">
        <div class="card-header-main">
          <h3>Add Funds</h3>
        </div>

        <!-- Maintenance / Not Available State -->
        <div v-if="notAvailable" class="not-available-state">
          <Icon name="lucide:alert-circle" class="w-12 h-12 text-amber-500 mb-2" />
          <h4>Not available at the moment</h4>
          <p>This payment method is temporarily down for maintenance. Please select another option.</p>
          <button class="btn btn-outline back-btn" @click="resetForm">Go Back</button>
        </div>

        <!-- STEP 2: CRYPTO DEPOSIT -->
        <div v-else-if="isCryptoStep2" class="crypto-step2-state">
          <div v-if="loadingSettings" style="text-align:center;padding:24px;color:#94a3b8;">
            <Icon name="lucide:loader-2" class="w-6 h-6 animate-spin" style="margin:0 auto 8px;display:block;" />
            <span>Loading wallet addresses...</span>
          </div>
          <div v-else-if="coins.length === 0" style="text-align:center;padding:24px;color:#94a3b8;">
            <p style="font-size:14px;margin-bottom:12px;">No crypto deposit addresses configured. Please contact support.</p>
            <button class="btn btn-outline" @click="isCryptoStep2 = false">Go Back</button>
          </div>
          <form v-else @submit.prevent="handleCryptoSubmit" class="dashboard-form">
            <div class="form-group">
              <label class="form-label text-left block mb-1" for="selectedCoin">Select Cryptocurrency</label>
              <select id="selectedCoin" v-model="selectedCoin" class="form-input form-select" required>
                <option v-for="c in coins" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>

            <!-- Destination Info Box -->
            <div class="dest-info-box text-left">
              <span class="dest-label">Send to Address (Network: {{ currentCoinNetwork }})</span>
              <div class="copy-address-row">
                <input type="text" readonly :value="currentCoinAddress" class="form-input read-only-input" />
                <button type="button" class="btn btn-outline" @click="copyText(currentCoinAddress, 'Wallet address copied!')">Copy</button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label text-left block mb-1">Upload Receipt of Payment</label>
              <div class="file-upload-wrapper">
                <input 
                  type="file" 
                  id="receiptUpload" 
                  accept="image/*" 
                  class="hidden-file-input" 
                  @change="handleReceiptChange" 
                  required 
                />
                <label for="receiptUpload" class="file-upload-label text-left">
                  <Icon name="lucide:image" class="w-5 h-5 text-slate-400" />
                  <span>{{ receiptFileName || 'Choose receipt image...' }}</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label text-left block mb-1" for="cryptoAmount">Amount (USD)</label>
              <input 
                id="cryptoAmount" 
                type="number" 
                v-model.number="cryptoAmount" 
                placeholder="$ 0.00" 
                min="0.01" 
                step="0.01" 
                class="form-input" 
                required 
              />
            </div>

            <div class="form-actions-row">
              <button type="button" class="btn btn-outline" @click="isCryptoStep2 = false">Go Back</button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                {{ submitting ? 'Submitting...' : 'Proceed with Deposit' }}
              </button>
            </div>
          </form>
        </div>

        <!-- STEP 2: BANK WIRE / TRANSFER -->
        <div v-else-if="isBankStep2" class="bank-step2-state">
          <form @submit.prevent="handleBankSubmit" class="dashboard-form">
            <div class="bank-instructions-header mb-3 text-left">
              <h4 class="text-sm font-semibold text-slate-200 mb-1">Wire Transfer Instructions</h4>
              <p class="text-xs text-slate-400">Initiate a domestic or international wire using the details below, then submit your confirmation receipt.</p>
            </div>

            <!-- Wire Details Table -->
            <div class="bank-details-box text-left">
              <div class="detail-row">
                <span class="detail-key">Bank Name:</span>
                <span class="detail-val">{{ bankDetails.bankName || 'Evermont National Bank' }}</span>
                <button type="button" class="mini-copy-btn" @click="copyText(bankDetails.bankName, 'Bank Name copied!')">Copy</button>
              </div>

              <div class="detail-row">
                <span class="detail-key">Beneficiary Name:</span>
                <span class="detail-val font-semibold">{{ bankDetails.accountName || 'Evermont Clearing LLC' }}</span>
                <button type="button" class="mini-copy-btn" @click="copyText(bankDetails.accountName, 'Beneficiary Name copied!')">Copy</button>
              </div>

              <div class="detail-row">
                <span class="detail-key">Account Number:</span>
                <span class="detail-val monospace">{{ bankDetails.accountNumber }}</span>
                <button type="button" class="mini-copy-btn" @click="copyText(bankDetails.accountNumber, 'Account Number copied!')">Copy</button>
              </div>

              <div v-if="bankDetails.routingNumber" class="detail-row">
                <span class="detail-key">Routing / ABA:</span>
                <span class="detail-val monospace">{{ bankDetails.routingNumber }}</span>
                <button type="button" class="mini-copy-btn" @click="copyText(bankDetails.routingNumber, 'Routing Number copied!')">Copy</button>
              </div>

              <div v-if="bankDetails.swiftCode" class="detail-row">
                <span class="detail-key">SWIFT / BIC:</span>
                <span class="detail-val monospace">{{ bankDetails.swiftCode }}</span>
                <button type="button" class="mini-copy-btn" @click="copyText(bankDetails.swiftCode, 'SWIFT Code copied!')">Copy</button>
              </div>

              <div v-if="bankDetails.bankAddress" class="detail-row">
                <span class="detail-key">Bank Address:</span>
                <span class="detail-val">{{ bankDetails.bankAddress }}</span>
              </div>

              <div v-if="bankDetails.instructions" class="instructions-notice">
                <Icon name="lucide:info" class="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>{{ bankDetails.instructions }}</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label text-left block mb-1" for="bankAmount">
                Amount (USD) <span v-if="bankDetails.minAmount" class="text-xs text-slate-400">(Min: ${{ bankDetails.minAmount }})</span>
              </label>
              <input 
                id="bankAmount" 
                type="number" 
                v-model.number="bankAmount" 
                placeholder="$ 0.00" 
                :min="bankDetails.minAmount || 0.01" 
                step="0.01" 
                class="form-input" 
                required 
              />
            </div>

            <div class="form-group">
              <label class="form-label text-left block mb-1">Upload Transfer Slip / Receipt</label>
              <div class="file-upload-wrapper">
                <input 
                  type="file" 
                  id="bankReceiptUpload" 
                  accept="image/*,.pdf" 
                  class="hidden-file-input" 
                  @change="handleReceiptChange" 
                  required 
                />
                <label for="bankReceiptUpload" class="file-upload-label text-left">
                  <Icon name="lucide:file-text" class="w-5 h-5 text-slate-400" />
                  <span>{{ receiptFileName || 'Choose transfer receipt / wire slip...' }}</span>
                </label>
              </div>
            </div>

            <div class="form-actions-row">
              <button type="button" class="btn btn-outline" @click="isBankStep2 = false">Go Back</button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                {{ submitting ? 'Submitting...' : 'Submit Bank Deposit' }}
              </button>
            </div>
          </form>
        </div>

        <!-- STEP 2: PAYPAL DEPOSIT -->
        <div v-else-if="isPayPalStep2" class="paypal-step2-state">
          <form @submit.prevent="handlePayPalSubmit" class="dashboard-form">
            <div class="dest-info-box text-left mb-3">
              <span class="dest-label">Send PayPal Payment To</span>
              <div class="copy-address-row">
                <input type="text" readonly :value="paypalDetails.email" class="form-input read-only-input" />
                <button type="button" class="btn btn-outline" @click="copyText(paypalDetails.email, 'PayPal email copied!')">Copy</button>
              </div>
              <p v-if="paypalDetails.instructions" class="text-xs text-slate-400 mt-2">{{ paypalDetails.instructions }}</p>
            </div>

            <div class="form-group">
              <label class="form-label text-left block mb-1" for="paypalAmount">Amount (USD)</label>
              <input 
                id="paypalAmount" 
                type="number" 
                v-model.number="paypalAmount" 
                placeholder="$ 0.00" 
                min="0.01" 
                step="0.01" 
                class="form-input" 
                required 
              />
            </div>

            <div class="form-group">
              <label class="form-label text-left block mb-1">Upload Payment Screenshot</label>
              <div class="file-upload-wrapper">
                <input 
                  type="file" 
                  id="paypalReceiptUpload" 
                  accept="image/*" 
                  class="hidden-file-input" 
                  @change="handleReceiptChange" 
                  required 
                />
                <label for="paypalReceiptUpload" class="file-upload-label text-left">
                  <Icon name="lucide:image" class="w-5 h-5 text-slate-400" />
                  <span>{{ receiptFileName || 'Choose payment screenshot...' }}</span>
                </label>
              </div>
            </div>

            <div class="form-actions-row">
              <button type="button" class="btn btn-outline" @click="isPayPalStep2 = false">Go Back</button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                {{ submitting ? 'Submitting...' : 'Submit Deposit' }}
              </button>
            </div>
          </form>
        </div>

        <!-- STEP 1: METHOD SELECTION -->
        <form v-else class="dashboard-form" @submit.prevent="handleDeposit">
          <div class="form-group mb-3">
            <label class="form-label block mb-3 text-left">Select Deposit Method</label>
            <div class="payment-method-grid">
              <div 
                v-for="method in methods"
                :key="method.id"
                :class="['payment-method-card', { selected: selectedMethod === method.id }]"
                @click="selectedMethod = method.id"
              >
                <div class="payment-icon-wrapper">
                  <Icon :name="method.icon" class="w-6 h-6" :class="method.color" />
                </div>
                <span class="payment-method-name">{{ method.name }}</span>
              </div>
            </div>
          </div>

          <button type="submit" class="btn btn-primary submit-btn-fit">Proceed with Deposit</button>
        </form>
      </div>

      <!-- Recent Deposits Section -->
      <div class="dashboard-card h-fit">
        <div class="card-header-main">
          <h3>Recent Deposits</h3>
        </div>
        <div v-if="recentDeposits.length === 0" class="empty-text">
          No recent deposits.
        </div>
        <div v-else class="transaction-list">
          <div v-for="dep in recentDeposits" :key="dep.id" class="transaction-item">
            <div class="transaction-info">
              <div class="transaction-icon bg-orange-light">
                <Icon name="i-lucide-clock" class="w-5 h-5 text-orange-500" />
              </div>
              <div class="transaction-details">
                <h4>{{ dep.method }} Deposit</h4>
                <p>{{ dep.status }} • {{ dep.date }} • ${{ Number(dep.amount || 0).toFixed(2) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'Fund Your Account | Evermont Bank'
})

interface Deposit {
  id: string
  method: string
  status: string
  amount?: number
  date: string
}

const auth = useAuth()

const recentDeposits = ref<Deposit[]>([])
const selectedMethod = ref('Crypto Deposit')
const notAvailable = ref(false)
const isCryptoStep2 = ref(false)
const isBankStep2 = ref(false)
const isPayPalStep2 = ref(false)
const submitting = ref(false)
const loadingSettings = ref(true)

const selectedCoin = ref('')
const receiptFileName = ref('')
const cryptoAmount = ref<number | ''>('')
const bankAmount = ref<number | ''>('')
const paypalAmount = ref<number | ''>('')

// Start empty — always populated from admin-configured deposit_settings.json via API
const coins = ref<{ id: string; name: string; address: string; network: string }[]>([])

const bankDetails = ref<any>({
  enabled: true,
  bankName: '',
  accountName: '',
  accountNumber: '',
  routingNumber: '',
  swiftCode: '',
  bankAddress: '',
  instructions: '',
  minAmount: 0
})

const paypalDetails = ref<any>({
  enabled: false,
  email: '',
  instructions: ''
})

const currentCoinAddress = computed(() => {
  const coin = coins.value.find(c => c.id === selectedCoin.value)
  return coin ? coin.address : ''
})

const currentCoinNetwork = computed(() => {
  const coin = coins.value.find(c => c.id === selectedCoin.value)
  return coin ? coin.network : ''
})

const methods = [
  { id: 'Crypto Deposit', name: 'Crypto Deposit', icon: 'i-lucide-bitcoin', color: 'text-amber-500' },
  { id: 'Bank Transfer', name: 'Bank Transfer', icon: 'i-lucide-building-2', color: 'text-blue-500' },
  { id: 'PayPal', name: 'PayPal', icon: 'i-lucide-credit-card', color: 'text-blue-700' }
]

const resetForm = () => {
  notAvailable.value = false
  isCryptoStep2.value = false
  isBankStep2.value = false
  isPayPalStep2.value = false
  receiptFileName.value = ''
  cryptoAmount.value = ''
  bankAmount.value = ''
  paypalAmount.value = ''
}

const loadDepositSettings = async () => {
  loadingSettings.value = true
  try {
    const res = await auth.apiCall<any>('/dashboard/wallets', 'GET')
    if (res.success && res.data) {
      // apiCall wraps server response: res.data = { success, data: { wallets, bankTransfer, ... } }
      const payload = res.data?.data ?? res.data

      // Load Crypto wallets — always overwrite with live admin data
      const walletsList = Array.isArray(payload?.wallets) ? payload.wallets
        : Array.isArray(payload) ? payload
        : []

      coins.value = walletsList.map((w: any) => ({
        id: w.coin,
        name: w.label || w.coin,
        address: w.address,
        network: w.network || 'Mainnet'
      }))

      // Auto-select first available coin
      if (coins.value.length > 0 && !coins.value.some(c => c.id === selectedCoin.value)) {
        selectedCoin.value = coins.value[0]!.id
      }

      // Load Bank Transfer details
      if (payload?.bankTransfer) {
        bankDetails.value = payload.bankTransfer
      }

      // Load PayPal / other details
      if (payload?.otherMethods?.paypal) {
        paypalDetails.value = payload.otherMethods.paypal
      }
    } else {
      console.warn('[Deposits] Failed to load deposit settings:', res.error)
    }
  } catch (err: any) {
    console.error('[Deposits] Error loading deposit settings:', err.message)
  } finally {
    loadingSettings.value = false
  }
}

const loadDeposits = async () => {
  try {
    const res = await auth.apiCall<any>('/dashboard/deposits', 'GET')
    if (res.success && res.data) {
      const list: any[] = res.data?.data ?? res.data ?? []
      recentDeposits.value = list.map((d: any) => ({
        id: d.id,
        method: d.method,
        status: d.status,
        amount: d.amount ? parseFloat(d.amount) : 0,
        date: new Date(d.created_at || d.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
      }))
    }
  } catch {
    // Silently fall back
  }
}

const alertPrompt = (msg: string) => {
  if (import.meta.client) {
    window.alert(msg)
  }
}

const copyText = (text: string, successMsg = 'Copied to clipboard!') => {
  if (import.meta.client && navigator.clipboard && text) {
    navigator.clipboard.writeText(text).then(() => {
      alertPrompt(successMsg)
    })
  }
}

const handleReceiptChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (file) receiptFileName.value = file.name
  } else {
    receiptFileName.value = ''
  }
}

const proceedToStep2 = () => {
  if (!selectedMethod.value) {
    alertPrompt('Please select a deposit method first.')
    return
  }

  if (selectedMethod.value === 'Crypto Deposit') {
    isCryptoStep2.value = true
    return
  }

  if (selectedMethod.value === 'Bank Transfer') {
    if (bankDetails.value?.enabled !== false && bankDetails.value?.accountNumber) {
      isBankStep2.value = true
    } else {
      notAvailable.value = true
    }
    return
  }

  if (selectedMethod.value === 'PayPal') {
    if (paypalDetails.value?.enabled && paypalDetails.value?.email) {
      isPayPalStep2.value = true
    } else {
      notAvailable.value = true
    }
    return
  }
}

const handleDeposit = proceedToStep2

const handleCryptoSubmit = async () => {
  if (!cryptoAmount.value || cryptoAmount.value <= 0) {
    alertPrompt('Please enter a valid amount.')
    return
  }
  if (!receiptFileName.value) {
    alertPrompt('Please upload your receipt image.')
    return
  }

  submitting.value = true
  try {
    const res = await auth.apiCall<any>('/dashboard/deposits', 'POST', {
      method: `Crypto (${selectedCoin.value})`,
      amount: Number(cryptoAmount.value),
      coin: selectedCoin.value,
      walletAddress: currentCoinAddress.value,
      note: `Crypto Deposit via ${selectedCoin.value}`
    })

    if (res.success) {
      await loadDeposits()
      alertPrompt(`✓ Crypto deposit of $${Number(cryptoAmount.value).toFixed(2)} submitted for review!\n\nTransaction verification is in progress.`)
      resetForm()
    } else {
      alertPrompt(`Error: ${res.error || 'Failed to submit deposit.'}`)
    }
  } catch (err: any) {
    alertPrompt(`Error: ${err.message || 'Failed to submit deposit.'}`)
  } finally {
    submitting.value = false
  }
}

const handleBankSubmit = async () => {
  const amt = Number(bankAmount.value)
  if (!amt || amt <= 0) {
    alertPrompt('Please enter a valid deposit amount.')
    return
  }
  if (bankDetails.value?.minAmount && amt < bankDetails.value.minAmount) {
    alertPrompt(`Minimum deposit amount for bank transfer is $${bankDetails.value.minAmount}.`)
    return
  }
  if (!receiptFileName.value) {
    alertPrompt('Please upload your wire transfer receipt or slip.')
    return
  }

  submitting.value = true
  try {
    const res = await auth.apiCall<any>('/dashboard/deposits', 'POST', {
      method: 'Bank Transfer',
      amount: amt,
      note: `Bank Wire to ${bankDetails.value.bankName} (Acct: ${bankDetails.value.accountNumber})`
    })

    if (res.success) {
      await loadDeposits()
      alertPrompt(`✓ Bank Wire deposit of $${amt.toFixed(2)} submitted for review!\n\nOur treasury team will verify and fund your account.`)
      resetForm()
    } else {
      alertPrompt(`Error: ${res.error || 'Failed to submit deposit.'}`)
    }
  } catch (err: any) {
    alertPrompt(`Error: ${err.message || 'Failed to submit deposit.'}`)
  } finally {
    submitting.value = false
  }
}

const handlePayPalSubmit = async () => {
  const amt = Number(paypalAmount.value)
  if (!amt || amt <= 0) {
    alertPrompt('Please enter a valid deposit amount.')
    return
  }
  if (!receiptFileName.value) {
    alertPrompt('Please upload your PayPal payment screenshot.')
    return
  }

  submitting.value = true
  try {
    const res = await auth.apiCall<any>('/dashboard/deposits', 'POST', {
      method: 'PayPal',
      amount: amt,
      note: `PayPal Deposit to ${paypalDetails.value.email}`
    })

    if (res.success) {
      await loadDeposits()
      alertPrompt(`✓ PayPal deposit of $${amt.toFixed(2)} submitted for review!`)
      resetForm()
    } else {
      alertPrompt(`Error: ${res.error || 'Failed to submit deposit.'}`)
    }
  } catch (err: any) {
    alertPrompt(`Error: ${err.message || 'Failed to submit deposit.'}`)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadDepositSettings()
  loadDeposits()
})
</script>

<style scoped>
.dashboard-page-container {
  max-width: 1000px;
  margin: 0 auto;
}

.dashboard-page-header {
  margin-bottom: 24px;
}

.dashboard-page-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary, #0f172a);
  margin-bottom: 6px;
}

.dashboard-page-header p {
  font-size: 14px;
  color: #64748b;
}

.page-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
}

@media (max-width: 900px) {
  .page-grid {
    grid-template-columns: 1fr;
  }
}

.dashboard-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  padding: 24px;
}

:global(.dark) .dashboard-card {
  background: #0d1424;
  border-color: rgba(255, 255, 255, 0.08);
  color: #f8fafc;
}

:global(.dark) .dashboard-page-header h2 {
  color: #f8fafc;
}

:global(.dark) .dashboard-page-header p {
  color: #94a3b8;
}

.card-header-main {
  margin-bottom: 20px;
}

.card-header-main h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

/* Payment Method Grid */
.payment-method-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

@media (max-width: 600px) {
  .payment-method-grid {
    grid-template-columns: 1fr;
  }
}

.payment-method-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 18px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8fafc;
}

:global(.dark) .payment-method-card {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
}

.payment-method-card:hover {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.04);
}

.payment-method-card.selected {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.08);
}

.payment-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

:global(.dark) .payment-icon-wrapper {
  background: #1e293b;
}

.payment-method-name {
  font-size: 13px;
  font-weight: 600;
}

/* Forms */
.dashboard-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

:global(.dark) .form-label {
  color: #cbd5e1;
}

.form-input {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  background: #fff;
  color: #0f172a;
}

:global(.dark) .form-input {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
  color: #f8fafc;
}

.form-input:focus {
  border-color: #6366f1;
}

.dest-info-box {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 14px;
}

:global(.dark) .dest-info-box {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}

.dest-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 6px;
}

:global(.dark) .dest-label {
  color: #94a3b8;
}

.copy-address-row {
  display: flex;
  gap: 8px;
}

.read-only-input {
  flex: 1;
  font-family: monospace;
  font-size: 12.5px;
  background: transparent !important;
}

/* Bank Details Box */
.bank-details-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

:global(.dark) .bank-details-box {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding: 4px 0;
  border-bottom: 1px dashed #e2e8f0;
}

:global(.dark) .detail-row {
  border-color: rgba(255, 255, 255, 0.06);
}

.detail-key {
  color: #64748b;
  min-width: 120px;
}

:global(.dark) .detail-key {
  color: #94a3b8;
}

.detail-val {
  flex: 1;
  color: #0f172a;
}

:global(.dark) .detail-val {
  color: #f1f5f9;
}

.monospace {
  font-family: monospace;
  font-size: 13px;
}

.mini-copy-btn {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  color: #6366f1;
  cursor: pointer;
  font-weight: 600;
}

.mini-copy-btn:hover {
  background: #6366f1;
  color: #fff;
}

.instructions-notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(59, 130, 246, 0.08);
  border-radius: 6px;
  font-size: 12px;
  color: #3b82f6;
  margin-top: 4px;
}

/* File Upload */
.file-upload-wrapper {
  position: relative;
}

.hidden-file-input {
  display: none;
}

.file-upload-label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13.5px;
  color: #64748b;
  transition: all 0.2s;
}

:global(.dark) .file-upload-label {
  border-color: rgba(255, 255, 255, 0.15);
  color: #94a3b8;
}

.file-upload-label:hover {
  border-color: #6366f1;
}

/* Buttons */
.btn {
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-primary {
  background: #6366f1;
  border: none;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #4f46e5;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background: transparent;
  border: 1px solid #cbd5e1;
  color: #475569;
}

:global(.dark) .btn-outline {
  border-color: rgba(255, 255, 255, 0.15);
  color: #cbd5e1;
}

.btn-outline:hover {
  background: rgba(0, 0, 0, 0.05);
}

.form-actions-row {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

.submit-btn-fit {
  align-self: flex-start;
}

/* Maintenance */
.not-available-state {
  text-align: center;
  padding: 30px 16px;
}

.not-available-state h4 {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 6px;
}

.not-available-state p {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 16px;
}

.back-btn {
  margin: 0 auto;
}

/* Recent list */
.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
}

:global(.dark) .transaction-item {
  border-color: rgba(255, 255, 255, 0.05);
}

.transaction-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.transaction-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-orange-light {
  background: rgba(249, 115, 22, 0.12);
}

.transaction-details h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 2px;
}

.transaction-details p {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}

.empty-text {
  font-size: 13px;
  color: #94a3b8;
  padding: 20px 0;
  text-align: center;
}
</style>
