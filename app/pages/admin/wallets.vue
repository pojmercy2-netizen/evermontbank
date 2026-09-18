<template>
  <div class="wallets-page">
    <div class="page-header">
      <div class="header-icon">
        <Icon name="lucide:wallet" class="w-5 h-5" />
      </div>
      <div>
        <h1>Deposit Methods & Addresses</h1>
        <p>Configure crypto wallet addresses, bank wire details, and alternative payment channels for user deposits.</p>
      </div>
    </div>

    <!-- Alert Banner -->
    <div v-if="alert.show" :class="['alert-banner', alert.type]">
      <Icon :name="alert.type === 'success' ? 'lucide:check-circle' : 'lucide:alert-circle'" class="w-4 h-4 flex-shrink-0" />
      <span>{{ alert.message }}</span>
      <button class="alert-close" @click="alert.show = false">
        <Icon name="lucide:x" class="w-4 h-4" />
      </button>
    </div>

    <!-- Tabs Navigation -->
    <div class="tabs-nav">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'crypto' }"
        @click="activeTab = 'crypto'"
      >
        <Icon name="lucide:bitcoin" class="w-4 h-4" />
        <span>Crypto Wallets ({{ wallets.length }})</span>
      </button>

      <button
        class="tab-btn"
        :class="{ active: activeTab === 'bank' }"
        @click="activeTab = 'bank'"
      >
        <Icon name="lucide:building-2" class="w-4 h-4" />
        <span>Bank Wire & Transfer</span>
        <span v-if="bankForm.enabled" class="badge-active">Active</span>
      </button>

      <button
        class="tab-btn"
        :class="{ active: activeTab === 'other' }"
        @click="activeTab = 'other'"
      >
        <Icon name="lucide:credit-card" class="w-4 h-4" />
        <span>Alternative Methods</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <Icon name="lucide:loader-2" class="w-6 h-6 animate-spin" />
      <span>Loading deposit configuration...</span>
    </div>

    <div v-else>
      <!-- TAB 1: CRYPTO WALLETS -->
      <div v-if="activeTab === 'crypto'" class="tab-content">
        <div class="section-actions-bar">
          <div>
            <h2 class="section-title">Cryptocurrency Deposit Wallets</h2>
            <p class="section-desc">Add or modify the crypto deposit addresses shown to customers in their dashboard.</p>
          </div>
          <button class="btn-primary" @click="openAddModal">
            <Icon name="lucide:plus" class="w-4 h-4" />
            Add New Wallet
          </button>
        </div>

        <div class="wallets-grid">
          <div
            v-for="wallet in wallets"
            :key="wallet.coin"
            class="wallet-card"
            :class="{ 'card-inactive': wallet.active === false }"
          >
            <!-- Card Top Bar -->
            <div class="wallet-card-header">
              <div class="coin-badge" :class="`coin-${wallet.coin.toLowerCase()}`">
                <Icon :name="coinIcon(wallet.coin)" class="w-5 h-5" />
              </div>
              <div class="coin-info">
                <div class="coin-title-row">
                  <h3>{{ wallet.label }}</h3>
                  <span class="coin-sym">{{ wallet.coin }}</span>
                </div>
                <span class="network-tag">{{ wallet.network }}</span>
              </div>

              <div class="wallet-status-actions">
                <button
                  class="status-toggle-btn"
                  :class="wallet.active !== false ? 'status-on' : 'status-off'"
                  @click="toggleWalletActive(wallet)"
                  :title="wallet.active !== false ? 'Click to disable' : 'Click to enable'"
                >
                  <Icon :name="wallet.active !== false ? 'lucide:check' : 'lucide:pause'" class="w-3.5 h-3.5" />
                  <span>{{ wallet.active !== false ? 'Active' : 'Disabled' }}</span>
                </button>

                <button
                  v-if="editingCoin !== wallet.coin"
                  class="action-icon-btn edit-icon-btn"
                  @click="startEdit(wallet)"
                  title="Edit wallet details"
                >
                  <Icon name="lucide:pencil" class="w-4 h-4" />
                </button>

                <button
                  class="action-icon-btn delete-icon-btn"
                  @click="confirmDeleteWallet(wallet)"
                  title="Delete wallet"
                >
                  <Icon name="lucide:trash-2" class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Current Address Display -->
            <div v-if="editingCoin !== wallet.coin" class="address-display">
              <div class="address-label">Deposit Address</div>
              <div class="address-row">
                <code class="address-value">{{ wallet.address }}</code>
                <button class="copy-btn" @click="copyAddress(wallet.address)" :title="'Copy ' + wallet.coin + ' address'">
                  <Icon name="lucide:copy" class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Edit Form -->
            <div v-else class="edit-form">
              <div class="form-group">
                <label class="form-label">Wallet Address</label>
                <input
                  v-model="editForm.address"
                  type="text"
                  class="form-input"
                  :placeholder="`Enter ${wallet.coin} address`"
                  autocomplete="off"
                />
              </div>
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Network Label</label>
                  <input
                    v-model="editForm.network"
                    type="text"
                    class="form-input"
                    placeholder="e.g. TRC20, ERC20, Solana"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Display Label</label>
                  <input
                    v-model="editForm.label"
                    type="text"
                    class="form-input"
                    :placeholder="wallet.label"
                  />
                </div>
              </div>

              <div class="form-group-checkbox">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="editForm.active" />
                  <span>Active (visible to users during deposit)</span>
                </label>
              </div>

              <div class="form-actions">
                <button class="btn-cancel" @click="cancelEdit">
                  <Icon name="lucide:x" class="w-4 h-4" />
                  Cancel
                </button>
                <button
                  class="btn-save"
                  :disabled="saving"
                  @click="saveWallet(wallet.coin)"
                >
                  <Icon :name="saving ? 'lucide:loader-2' : 'lucide:save'" :class="['w-4 h-4', saving && 'animate-spin']" />
                  {{ saving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </div>
          </div>

          <div v-if="wallets.length === 0" class="empty-state-box">
            <Icon name="lucide:wallet" class="w-10 h-10 text-slate-500 mb-2" />
            <h3>No wallet addresses configured</h3>
            <p>Click "Add New Wallet" above to add your first deposit address.</p>
          </div>
        </div>
      </div>

      <!-- TAB 2: BANK WIRE & TRANSFER -->
      <div v-if="activeTab === 'bank'" class="tab-content">
        <div class="section-actions-bar">
          <div>
            <h2 class="section-title">Bank Wire / ACH Deposit Instructions</h2>
            <p class="section-desc">Customers selecting "Bank Transfer" on their deposit screen will see these wire instructions.</p>
          </div>
          <div class="toggle-switch-wrap">
            <label class="toggle-label">
              <span>Enable Bank Transfer:</span>
              <input type="checkbox" v-model="bankForm.enabled" class="toggle-checkbox" />
              <span class="toggle-slider" />
            </label>
          </div>
        </div>

        <div class="admin-card form-card">
          <form @submit.prevent="saveBankSettings" class="deposit-details-form">
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="bankName">Bank Name *</label>
                <input
                  id="bankName"
                  v-model="bankForm.bankName"
                  type="text"
                  class="form-input"
                  placeholder="e.g. Evermont National Bank"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="accountName">Beneficiary / Account Name *</label>
                <input
                  id="accountName"
                  v-model="bankForm.accountName"
                  type="text"
                  class="form-input"
                  placeholder="e.g. Evermont Treasury Clearing LLC"
                  required
                />
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="accountNumber">Account Number *</label>
                <input
                  id="accountNumber"
                  v-model="bankForm.accountNumber"
                  type="text"
                  class="form-input monospace-input"
                  placeholder="e.g. 4892019482"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="routingNumber">Routing / ABA / Sort Code</label>
                <input
                  id="routingNumber"
                  v-model="bankForm.routingNumber"
                  type="text"
                  class="form-input monospace-input"
                  placeholder="e.g. 021000021"
                />
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="swiftCode">SWIFT / BIC Code</label>
                <input
                  id="swiftCode"
                  v-model="bankForm.swiftCode"
                  type="text"
                  class="form-input monospace-input"
                  placeholder="e.g. EVBKUS33XXX"
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="minAmount">Minimum Deposit ($)</label>
                <input
                  id="minAmount"
                  v-model.number="bankForm.minAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-input"
                  placeholder="50.00"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="bankAddress">Bank Physical Address</label>
              <input
                id="bankAddress"
                v-model="bankForm.bankAddress"
                type="text"
                class="form-input"
                placeholder="e.g. 100 Wall Street, New York, NY 10005, USA"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="processingTime">Estimated Processing Time</label>
              <input
                id="processingTime"
                v-model="bankForm.processingTime"
                type="text"
                class="form-input"
                placeholder="e.g. 1 - 2 Business Days"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="instructions">Deposit Instructions / Reference Memo</label>
              <textarea
                id="instructions"
                v-model="bankForm.instructions"
                rows="3"
                class="form-textarea"
                placeholder="Specify what notes or reference codes users should include when initiating the transfer..."
              />
              <span class="input-help">These instructions appear directly under the wire information on the user's screen.</span>
            </div>

            <div class="form-actions-bar">
              <button type="submit" class="btn-primary btn-lg" :disabled="savingBank">
                <Icon :name="savingBank ? 'lucide:loader-2' : 'lucide:save'" :class="['w-4 h-4', savingBank && 'animate-spin']" />
                <span>{{ savingBank ? 'Saving Details...' : 'Save Bank Details' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- TAB 3: ALTERNATIVE METHODS -->
      <div v-if="activeTab === 'other'" class="tab-content">
        <div class="section-actions-bar">
          <div>
            <h2 class="section-title">Alternative Deposit Methods</h2>
            <p class="section-desc">Enable and configure online payment channels (PayPal, CashApp, Zelle) for customer funding.</p>
          </div>
        </div>

        <div class="methods-grid">
          <!-- PayPal Card -->
          <div class="admin-card method-card">
            <div class="method-card-header">
              <div class="method-icon bg-blue-light">
                <Icon name="lucide:credit-card" class="w-5 h-5 text-blue-500" />
              </div>
              <div class="method-info">
                <h3>PayPal</h3>
                <span class="method-desc-text">Allow direct PayPal transfers</span>
              </div>
              <label class="toggle-label mini">
                <input type="checkbox" v-model="otherForm.paypal.enabled" class="toggle-checkbox" />
                <span class="toggle-slider" />
              </label>
            </div>

            <div class="method-card-body">
              <div class="form-group">
                <label class="form-label">PayPal Email</label>
                <input
                  v-model="otherForm.paypal.email"
                  type="email"
                  class="form-input"
                  placeholder="payments@evermontbank.com"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Instructions / Note</label>
                <input
                  v-model="otherForm.paypal.instructions"
                  type="text"
                  class="form-input"
                  placeholder="Send as Friends & Family with Account Number in note"
                />
              </div>
            </div>
          </div>

          <!-- CashApp Card -->
          <div class="admin-card method-card">
            <div class="method-card-header">
              <div class="method-icon bg-green-light">
                <Icon name="lucide:dollar-sign" class="w-5 h-5 text-emerald-500" />
              </div>
              <div class="method-info">
                <h3>Cash App</h3>
                <span class="method-desc-text">Receive funds via $cashtag</span>
              </div>
              <label class="toggle-label mini">
                <input type="checkbox" v-model="otherForm.cashapp.enabled" class="toggle-checkbox" />
                <span class="toggle-slider" />
              </label>
            </div>

            <div class="method-card-body">
              <div class="form-group">
                <label class="form-label">Cashtag</label>
                <input
                  v-model="otherForm.cashapp.cashtag"
                  type="text"
                  class="form-input"
                  placeholder="$EvermontBank"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Instructions / Note</label>
                <input
                  v-model="otherForm.cashapp.instructions"
                  type="text"
                  class="form-input"
                  placeholder="Include your account number in the memo"
                />
              </div>
            </div>
          </div>

          <!-- Zelle Card -->
          <div class="admin-card method-card">
            <div class="method-card-header">
              <div class="method-icon bg-purple-light">
                <Icon name="lucide:zap" class="w-5 h-5 text-purple-400" />
              </div>
              <div class="method-info">
                <h3>Zelle</h3>
                <span class="method-desc-text">Instant transfer via email or phone</span>
              </div>
              <label class="toggle-label mini">
                <input type="checkbox" v-model="otherForm.zelle.enabled" class="toggle-checkbox" />
                <span class="toggle-slider" />
              </label>
            </div>

            <div class="method-card-body">
              <div class="form-group">
                <label class="form-label">Zelle Registered Email</label>
                <input
                  v-model="otherForm.zelle.email"
                  type="email"
                  class="form-input"
                  placeholder="transfers@evermontbank.com"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Zelle Phone Number</label>
                <input
                  v-model="otherForm.zelle.phone"
                  type="text"
                  class="form-input"
                  placeholder="+1 (800) 555-0199"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Instructions</label>
                <input
                  v-model="otherForm.zelle.instructions"
                  type="text"
                  class="form-input"
                  placeholder="Send via Zelle and upload confirmation screenshot"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions-bar mt-4">
          <button class="btn-primary btn-lg" :disabled="savingOther" @click="saveOtherSettings">
            <Icon :name="savingOther ? 'lucide:loader-2' : 'lucide:save'" :class="['w-4 h-4', savingOther && 'animate-spin']" />
            <span>{{ savingOther ? 'Saving Details...' : 'Save Alternative Methods' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ADD WALLET MODAL -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-box">
        <div class="modal-header">
          <div class="modal-title-row">
            <Icon name="lucide:plus-circle" class="w-5 h-5 text-indigo-400" />
            <h2>Add New Crypto Wallet</h2>
          </div>
          <button class="modal-close" @click="showAddModal = false">
            <Icon name="lucide:x" class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleAddWallet" class="modal-body">
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="newCoin">Coin Symbol *</label>
              <input
                id="newCoin"
                v-model="addForm.coin"
                type="text"
                class="form-input uppercase-input"
                placeholder="e.g. SOL, BNB, DOGE"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label" for="newLabel">Display Name</label>
              <input
                id="newLabel"
                v-model="addForm.label"
                type="text"
                class="form-input"
                placeholder="e.g. Solana (SOL)"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="newNetwork">Network *</label>
            <input
              id="newNetwork"
              v-model="addForm.network"
              type="text"
              class="form-input"
              placeholder="e.g. Solana Mainnet, BEP20 (BSC), TRC20"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="newAddress">Deposit Wallet Address *</label>
            <input
              id="newAddress"
              v-model="addForm.address"
              type="text"
              class="form-input monospace-input"
              placeholder="Enter receiving wallet address"
              required
            />
          </div>

          <div class="form-group-checkbox">
            <label class="checkbox-label">
              <input type="checkbox" v-model="addForm.active" />
              <span>Make active immediately for user deposits</span>
            </label>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="showAddModal = false">Cancel</button>
            <button type="submit" class="btn-save" :disabled="saving">
              <Icon :name="saving ? 'lucide:loader-2' : 'lucide:plus'" :class="['w-4 h-4', saving && 'animate-spin']" />
              <span>{{ saving ? 'Adding...' : 'Add Wallet' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Deposit Details & Wallets | Admin — Evermont Bank' })

interface Wallet {
  coin: string
  label: string
  network: string
  address: string
  active?: boolean
}

const auth = useAuth()

const activeTab = ref<'crypto' | 'bank' | 'other'>('crypto')
const wallets = ref<Wallet[]>([])
const loading = ref(true)
const saving = ref(false)
const savingBank = ref(false)
const savingOther = ref(false)
const editingCoin = ref<string | null>(null)
const showAddModal = ref(false)

const editForm = reactive({
  address: '',
  network: '',
  label: '',
  active: true
})

const addForm = reactive({
  coin: '',
  label: '',
  network: '',
  address: '',
  active: true
})

const bankForm = reactive({
  enabled: true,
  bankName: '',
  accountName: '',
  accountNumber: '',
  routingNumber: '',
  swiftCode: '',
  bankAddress: '',
  instructions: '',
  minAmount: 50,
  processingTime: '1 - 2 Business Days'
})

const otherForm = reactive({
  paypal: { enabled: false, email: '', instructions: '' },
  cashapp: { enabled: false, cashtag: '', instructions: '' },
  zelle: { enabled: false, email: '', phone: '', instructions: '' }
})

const alert = reactive({
  show: false,
  type: 'success' as 'success' | 'error',
  message: ''
})

const showAlert = (type: 'success' | 'error', message: string) => {
  alert.type = type
  alert.message = message
  alert.show = true
  setTimeout(() => { alert.show = false }, 5000)
}

const coinIcon = (coin: string) => {
  const c = coin.toUpperCase()
  if (c === 'BTC') return 'lucide:bitcoin'
  if (c === 'ETH') return 'lucide:zap'
  if (c === 'USDT') return 'lucide:dollar-sign'
  if (c === 'SOL') return 'lucide:sun'
  if (c === 'BNB') return 'lucide:coins'
  return 'lucide:wallet'
}

const loadSettings = async () => {
  loading.value = true
  try {
    const res = await auth.apiCall<any>('/admin/wallets', 'GET')
    if (res.success && res.data) {
      const data = res.data?.data ?? res.data
      if (Array.isArray(data)) {
        wallets.value = data
      } else if (data && typeof data === 'object') {
        wallets.value = Array.isArray(data.wallets) ? data.wallets : []
        if (data.bankTransfer) {
          Object.assign(bankForm, data.bankTransfer)
        }
        if (data.otherMethods) {
          if (data.otherMethods.paypal) Object.assign(otherForm.paypal, data.otherMethods.paypal)
          if (data.otherMethods.cashapp) Object.assign(otherForm.cashapp, data.otherMethods.cashapp)
          if (data.otherMethods.zelle) Object.assign(otherForm.zelle, data.otherMethods.zelle)
        }
      }
    } else {
      showAlert('error', res.error || 'Failed to load deposit settings.')
    }
  } catch (err: any) {
    showAlert('error', err.message || 'Error loading settings.')
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  addForm.coin = ''
  addForm.label = ''
  addForm.network = ''
  addForm.address = ''
  addForm.active = true
  showAddModal.value = true
}

const handleAddWallet = async () => {
  if (!addForm.coin.trim() || !addForm.address.trim() || !addForm.network.trim()) {
    showAlert('error', 'Please fill in all required wallet fields.')
    return
  }

  saving.value = true
  try {
    const res = await auth.apiCall<any>('/admin/wallets', 'POST', {
      coin: addForm.coin.trim().toUpperCase(),
      label: addForm.label.trim() || addForm.coin.trim().toUpperCase(),
      network: addForm.network.trim(),
      address: addForm.address.trim(),
      active: addForm.active
    })

    if (res.success) {
      showAlert('success', `${addForm.coin.toUpperCase()} wallet added successfully!`)
      showAddModal.value = false
      await loadSettings()
    } else {
      showAlert('error', res.error || 'Failed to add wallet.')
    }
  } catch (err: any) {
    showAlert('error', err.message || 'Error adding wallet.')
  } finally {
    saving.value = false
  }
}

const startEdit = (wallet: Wallet) => {
  editingCoin.value = wallet.coin
  editForm.address = wallet.address
  editForm.network = wallet.network
  editForm.label = wallet.label
  editForm.active = wallet.active !== false
}

const cancelEdit = () => {
  editingCoin.value = null
  editForm.address = ''
  editForm.network = ''
  editForm.label = ''
  editForm.active = true
}

const saveWallet = async (coin: string) => {
  if (!editForm.address.trim()) {
    showAlert('error', 'Wallet address cannot be empty.')
    return
  }

  saving.value = true
  try {
    const res = await auth.apiCall<any>('/admin/wallets', 'PUT', {
      coin,
      address: editForm.address.trim(),
      network: editForm.network.trim() || undefined,
      label: editForm.label.trim() || undefined,
      active: editForm.active
    })

    if (res.success) {
      showAlert('success', `${coin} wallet updated successfully.`)
      await loadSettings()
      cancelEdit()
    } else {
      showAlert('error', res.error || 'Failed to update wallet address.')
    }
  } catch (err: any) {
    showAlert('error', err.message || 'Error updating wallet.')
  } finally {
    saving.value = false
  }
}

const toggleWalletActive = async (wallet: Wallet) => {
  const newActive = wallet.active === false
  try {
    const res = await auth.apiCall<any>('/admin/wallets', 'PUT', {
      coin: wallet.coin,
      active: newActive
    })
    if (res.success) {
      wallet.active = newActive
      showAlert('success', `${wallet.coin} is now ${newActive ? 'active' : 'disabled'}.`)
    }
  } catch {
    showAlert('error', 'Failed to toggle wallet status.')
  }
}

const confirmDeleteWallet = async (wallet: Wallet) => {
  if (!confirm(`Are you sure you want to delete the ${wallet.coin} (${wallet.label}) wallet?`)) return

  try {
    const res = await auth.apiCall<any>(`/admin/wallets?coin=${encodeURIComponent(wallet.coin)}`, 'DELETE')
    if (res.success) {
      showAlert('success', `${wallet.coin} wallet deleted successfully.`)
      await loadSettings()
    } else {
      showAlert('error', res.error || 'Failed to delete wallet.')
    }
  } catch (err: any) {
    showAlert('error', err.message || 'Error deleting wallet.')
  }
}

const saveBankSettings = async () => {
  savingBank.value = true
  try {
    const res = await auth.apiCall<any>('/admin/wallets/deposit-settings', 'PUT', {
      bankTransfer: {
        enabled: bankForm.enabled,
        bankName: bankForm.bankName.trim(),
        accountName: bankForm.accountName.trim(),
        accountNumber: bankForm.accountNumber.trim(),
        routingNumber: bankForm.routingNumber.trim(),
        swiftCode: bankForm.swiftCode.trim(),
        bankAddress: bankForm.bankAddress.trim(),
        instructions: bankForm.instructions.trim(),
        minAmount: Number(bankForm.minAmount) || 0,
        processingTime: bankForm.processingTime.trim()
      }
    })

    if (res.success) {
      showAlert('success', 'Bank transfer details saved successfully!')
    } else {
      showAlert('error', res.error || 'Failed to save bank details.')
    }
  } catch (err: any) {
    showAlert('error', err.message || 'Error saving bank details.')
  } finally {
    savingBank.value = false
  }
}

const saveOtherSettings = async () => {
  savingOther.value = true
  try {
    const res = await auth.apiCall<any>('/admin/wallets/deposit-settings', 'PUT', {
      otherMethods: otherForm
    })

    if (res.success) {
      showAlert('success', 'Alternative payment methods saved successfully!')
    } else {
      showAlert('error', res.error || 'Failed to save alternative methods.')
    }
  } catch (err: any) {
    showAlert('error', err.message || 'Error saving alternative methods.')
  } finally {
    savingOther.value = false
  }
}

const copyAddress = (address: string) => {
  if (import.meta.client && navigator.clipboard) {
    navigator.clipboard.writeText(address).then(() => {
      showAlert('success', 'Address copied to clipboard!')
    })
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.wallets-page {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.header-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a5b4fc;
  flex-shrink: 0;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0 0 4px;
}

.page-header p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

/* Tabs */
.tabs-nav {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 8px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid transparent;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.tab-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.04);
}

.tab-btn.active {
  background: rgba(99, 102, 241, 0.16);
  border-color: rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
}

.badge-active {
  font-size: 10px;
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  padding: 1px 6px;
  border-radius: 99px;
  font-weight: 700;
}

/* Alert */
.alert-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 500;
}

.alert-banner.success {
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.25);
  color: #6ee7b7;
}

.alert-banner.error {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #fca5a5;
}

.alert-close {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  padding: 2px;
}

/* Section Header */
.section-actions-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 4px;
}

.section-desc {
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

/* Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
  font-family: inherit;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  transform: translateY(-1px);
}

.btn-primary.btn-lg {
  padding: 11px 24px;
  font-size: 14px;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Wallets Grid */
.wallets-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wallet-card {
  background: #0d1424;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: border-color 0.2s;
}

.wallet-card:hover {
  border-color: rgba(99, 102, 241, 0.25);
}

.wallet-card.card-inactive {
  opacity: 0.65;
  background: #090e1a;
}

.wallet-card-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.coin-badge {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #93c5fd;
}

.coin-btc {
  background: rgba(247, 147, 26, 0.15);
  border: 1px solid rgba(247, 147, 26, 0.25);
  color: #f7931a;
}

.coin-eth {
  background: rgba(98, 126, 234, 0.15);
  border: 1px solid rgba(98, 126, 234, 0.25);
  color: #627eea;
}

.coin-usdt {
  background: rgba(38, 161, 123, 0.15);
  border: 1px solid rgba(38, 161, 123, 0.25);
  color: #26a17b;
}

.coin-sol {
  background: rgba(147, 51, 234, 0.15);
  border: 1px solid rgba(147, 51, 234, 0.25);
  color: #a855f7;
}

.coin-bnb {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.25);
  color: #f59e0b;
}

.coin-info {
  flex: 1;
}

.coin-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 3px;
}

.coin-title-row h3 {
  font-size: 15px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
}

.coin-sym {
  font-size: 11px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.08);
  padding: 1px 6px;
  border-radius: 4px;
  color: #cbd5e1;
}

.network-tag {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.04);
  padding: 2px 8px;
  border-radius: 99px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.wallet-status-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-toggle-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  border: none;
}

.status-on {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #34d399;
}

.status-on:hover {
  background: rgba(16, 185, 129, 0.25);
}

.status-off {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.4);
}

.status-off:hover {
  background: rgba(255, 255, 255, 0.1);
}

.action-icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.2s;
  color: rgba(255, 255, 255, 0.5);
}

.edit-icon-btn:hover {
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
}

.delete-icon-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

/* Address display */
.address-display {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.address-label {
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.35);
}

.address-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.address-value {
  flex: 1;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #cbd5e1;
  word-break: break-all;
}

.copy-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.4);
  color: #a5b4fc;
}

/* Edit form */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 10px;
  padding: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

@media (max-width: 640px) {
  .form-row-2 {
    grid-template-columns: 1fr;
  }
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-input, .form-textarea {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 14px;
  color: #f1f5f9;
  font-size: 13.5px;
  font-family: inherit;
  transition: border-color 0.2s;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus, .form-textarea:focus {
  border-color: rgba(99, 102, 241, 0.6);
  background: rgba(99, 102, 241, 0.05);
}

.form-textarea {
  resize: vertical;
}

.monospace-input {
  font-family: 'JetBrains Mono', monospace;
}

.uppercase-input {
  text-transform: uppercase;
}

.form-group-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #cbd5e1;
  cursor: pointer;
}

.input-help {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.btn-save {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 8px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
  font-family: inherit;
}

.btn-save:hover:not(:disabled) {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Card Form */
.admin-card {
  background: #0d1424;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  padding: 24px;
}

.deposit-details-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-actions-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

/* Toggle switch */
.toggle-switch-wrap {
  display: flex;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #cbd5e1;
  cursor: pointer;
}

.toggle-checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.toggle-slider {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 34px;
  transition: .3s;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: .3s;
}

.toggle-checkbox:checked + .toggle-slider {
  background-color: #6366f1;
}

.toggle-checkbox:checked + .toggle-slider:before {
  transform: translateX(20px);
}

/* Methods Grid */
.methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.method-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.method-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.method-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-blue-light { background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.25); }
.bg-green-light { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.25); }
.bg-purple-light { background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.25); }

.method-info {
  flex: 1;
}

.method-info h3 {
  font-size: 15px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
}

.method-desc-text {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.method-card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Empty State */
.empty-state-box {
  padding: 40px;
  text-align: center;
  border: 1px dashed rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.empty-state-box h3 {
  color: #f1f5f9;
  margin: 0 0 4px;
}

.empty-state-box p {
  font-size: 13px;
  margin: 0;
}

/* Loading */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 50px;
  color: rgba(255, 255, 255, 0.4);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-box {
  background: #0d1424;
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 14px;
  max-width: 520px;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-title-row h2 {
  font-size: 16px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 4px;
}

.modal-close:hover {
  color: #fff;
}

.modal-body {
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
