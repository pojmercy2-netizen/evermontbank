<template>
  <div :class="['balance-card', type === 'premium' ? 'premium-balance-card' : type]">
    <!-- Diagonal green accent line for premium card -->
    <div v-if="type === 'premium'" class="balance-card-diagonal" />

    <!-- Premium Card Layout -->
    <div v-if="type === 'premium'" class="premium-card-header">
      <div class="premium-card-left">
        <span class="premium-label-muted">TOTAL BALANCE</span>
        <div class="premium-balance-display">
          <h2 class="premium-balance-val">
            {{ isBalanceVisible ? formatCurrency(balance) : '$ ••••••' }}
          </h2>
          <button 
            type="button"
            class="premium-toggle-btn" 
            @click="toggleBalance" 
            :aria-label="isBalanceVisible ? 'Hide balance' : 'Show balance'"
          >
            <Icon :name="isBalanceVisible ? 'lucide:eye' : 'lucide:eye-off'" class="w-4 h-4" />
          </button>
        </div>
        <div class="premium-change-text">{{ subtitle }}</div>

        <!-- Account Number Row -->
        <div v-if="accountNumber" class="premium-acct-row">
          <span class="premium-acct-label">ACCOUNT NO.</span>
          <span class="premium-acct-value">{{ isBalanceVisible ? formatAccountNumber(accountNumber) : '•••• •••• ••' }}</span>
          <button
            type="button"
            class="premium-copy-btn"
            :aria-label="copyDone ? 'Copied!' : 'Copy account number'"
            @click="copyAccountNumber"
          >
            <Icon :name="copyDone ? 'lucide:check' : 'lucide:copy'" class="w-3 h-3" />
          </button>
        </div>
      </div>

      <div class="premium-card-right" v-if="showKyc">
        <span :class="['kyc-pill', kycStatus.toLowerCase().replace(' ', '-')]">{{ kycStatus }}</span>
        <span class="premium-label-muted">KYC STATUS</span>
      </div>
    </div>

    <!-- Legacy / Default Card Layout -->
    <div v-else>
      <div class="card-header">
        <span class="account-name">{{ name }}</span>
        <span class="account-number">{{ accountNumber }}</span>
      </div>
      <h2 class="account-balance">{{ formatCurrency(balance) }}</h2>
      <span class="available-balance">{{ subtitle }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  accountNumber?: string
  balance: number
  subtitle: string
  type?: 'checking' | 'savings' | 'premium'
  showKyc?: boolean
}>(), {
  accountNumber: '',
  type: 'checking',
  showKyc: false
})

const isBalanceVisible = ref(true)
const kycStatus = ref('Unverified')
const copyDone = ref(false)

const toggleBalance = () => {
  isBalanceVisible.value = !isBalanceVisible.value
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}

// Format account number with spaces every 4 digits: 1234 5678 90
const formatAccountNumber = (num: string) => {
  if (!num) return ''
  return num.replace(/(\d{4})(\d{4})(\d{2,})/, '$1 $2 $3')
}

const copyAccountNumber = async () => {
  if (!props.accountNumber) return
  try {
    await navigator.clipboard.writeText(props.accountNumber)
    copyDone.value = true
    setTimeout(() => { copyDone.value = false }, 2000)
  } catch {
    // fallback
  }
}

const auth = useAuth()

onMounted(async () => {
  if (import.meta.client) {
    const status = localStorage.getItem('kyc_status')
    if (status) {
      kycStatus.value = status
    } else {
      localStorage.setItem('kyc_status', 'Unverified')
      kycStatus.value = 'Unverified'
    }

    if (props.showKyc) {
      try {
        // Use profile kycStatus as the most authoritative source
        // (admin approval writes directly to users.kycStatus)
        const profileRes = await auth.apiCall<any>('/dashboard/profile', 'GET')
        if (profileRes.success && profileRes.data) {
          const profileData = profileRes.data?.data ?? profileRes.data
          const raw = profileData.kycStatus as string | undefined
          let displayStatus = 'Unverified'
          if (raw === 'verified') displayStatus = 'Verified'
          else if (raw === 'pending') displayStatus = 'Pending Verification'
          else if (raw === 'rejected') displayStatus = 'Unverified'
          kycStatus.value = displayStatus
          localStorage.setItem('kyc_status', displayStatus)
        } else {
          // Fallback: read kycDocuments status
          const kycRes = await auth.apiCall<any>('/dashboard/kyc', 'GET')
          if (kycRes.success && kycRes.data) {
            const data = kycRes.data?.data ?? kycRes.data
            let displayStatus = 'Unverified'
            if (data.status === 'PENDING') displayStatus = 'Pending Verification'
            else if (data.status === 'APPROVED') displayStatus = 'Verified'
            kycStatus.value = displayStatus
            localStorage.setItem('kyc_status', displayStatus)
          }
        }
      } catch (err) {
        console.error('Error fetching KYC status:', err)
      }
    }
  }
})
</script>

<style scoped>
/* ── Base card ── */
.balance-card {
  background: var(--color-surface);
  padding: 22px 20px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-border);
  position: relative;
  overflow: hidden;
}
.dark .balance-card {
  background: var(--color-background-dark-card);
  border-color: var(--color-border-dark);
}
.balance-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 4px;
  background-color: var(--color-secondary);
}
.balance-card.savings::before { background-color: var(--color-success); }

/* ── Legacy layout ── */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.account-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-muted);
}
.dark .account-name { color: #94a3b8; }
.account-number {
  font-size: 13px;
  color: var(--color-text-muted);
  opacity: 0.8;
}
.dark .account-number { color: #94a3b8; }
.account-balance {
  font-size: 30px;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: -0.5px;
  margin-bottom: 6px;
}
.dark .account-balance { color: var(--color-text-light); }
.available-balance {
  font-size: 13px;
  color: var(--color-text-muted);
}
.dark .available-balance { color: #94a3b8; }

/* ── Tablet ── */
@media (max-width: 768px) {
  .balance-card { padding: 18px 16px; border-radius: 14px; }
  .account-balance { font-size: 24px; }
}
/* ── Phone ── */
@media (max-width: 480px) {
  .balance-card { padding: 14px 12px; border-radius: 12px; }
  .card-header { margin-bottom: 10px; }
  .account-name { font-size: 12px; }
  .account-balance { font-size: 20px; margin-bottom: 4px; }
  .available-balance { font-size: 11px; }
}
</style>
