import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

export interface CryptoWalletItem {
  coin: string
  label: string
  network: string
  address: string
  active?: boolean
  createdAt?: string
}

export interface BankTransferDetails {
  enabled: boolean
  bankName: string
  accountName: string
  accountNumber: string
  routingNumber: string
  swiftCode: string
  bankAddress: string
  instructions: string
  minAmount: number
  processingTime: string
}

export interface OtherDepositMethods {
  paypal?: {
    enabled: boolean
    email: string
    instructions: string
  }
  cashapp?: {
    enabled: boolean
    cashtag: string
    instructions: string
  }
  zelle?: {
    enabled: boolean
    email: string
    phone: string
    instructions: string
  }
}

export interface DepositSettings {
  wallets: CryptoWalletItem[]
  bankTransfer: BankTransferDetails
  otherMethods: OtherDepositMethods
}

const DEFAULT_SETTINGS: DepositSettings = {
  wallets: [
    {
      coin: 'BTC',
      label: 'Bitcoin (BTC)',
      network: 'Bitcoin',
      address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      active: true
    },
    {
      coin: 'ETH',
      label: 'Ethereum (ETH)',
      network: 'ERC20 (Ethereum)',
      address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      active: true
    },
    {
      coin: 'USDT',
      label: 'Tether (USDT)',
      network: 'TRC20 (Tron)',
      address: 'TR7NHqju6dC8GyqKz2763z54X5157mock',
      active: true
    }
  ],
  bankTransfer: {
    enabled: true,
    bankName: 'Evermont National Bank',
    accountName: 'Evermont Financial Clearing Corp',
    accountNumber: '4892019482',
    routingNumber: '021000021',
    swiftCode: 'EVBKUS33XXX',
    bankAddress: '100 Wall Street, New York, NY 10005, USA',
    instructions: 'Please include your Account Number and Reference Code in the wire/transfer description to ensure prompt crediting.',
    minAmount: 50,
    processingTime: '1 - 2 Business Days'
  },
  otherMethods: {
    paypal: {
      enabled: false,
      email: 'deposits@evermontbank.com',
      instructions: 'Send via PayPal Friends & Family with your Account Number in the note.'
    },
    cashapp: {
      enabled: false,
      cashtag: '$EvermontBank',
      instructions: 'Include your Evermont account number in the memo field.'
    },
    zelle: {
      enabled: false,
      email: 'transfers@evermontbank.com',
      phone: '+1 (800) 555-0199',
      instructions: 'Send via Zelle and upload your payment confirmation receipt.'
    }
  }
}

const getDepositSettingsPath = () => join(process.cwd(), 'server', 'data', 'deposit_settings.json')
const getCryptoWalletsPath = () => join(process.cwd(), 'server', 'data', 'crypto_wallets.json')

export function getDepositSettings(): DepositSettings {
  const filePath = getDepositSettingsPath()
  const legacyPath = getCryptoWalletsPath()

  if (existsSync(filePath)) {
    try {
      const data = JSON.parse(readFileSync(filePath, 'utf-8'))
      return {
        wallets: Array.isArray(data.wallets) ? data.wallets : DEFAULT_SETTINGS.wallets,
        bankTransfer: { ...DEFAULT_SETTINGS.bankTransfer, ...(data.bankTransfer || {}) },
        otherMethods: { ...DEFAULT_SETTINGS.otherMethods, ...(data.otherMethods || {}) }
      }
    } catch {
      // Fallback
    }
  }

  // Check legacy crypto_wallets.json
  if (existsSync(legacyPath)) {
    try {
      const legacyWallets = JSON.parse(readFileSync(legacyPath, 'utf-8'))
      if (Array.isArray(legacyWallets) && legacyWallets.length > 0) {
        const settings: DepositSettings = {
          ...DEFAULT_SETTINGS,
          wallets: legacyWallets.map(w => ({
            coin: w.coin,
            label: w.label || `${w.coin}`,
            network: w.network || 'Default',
            address: w.address,
            active: w.active !== false
          }))
        }
        saveDepositSettings(settings)
        return settings
      }
    } catch {
      // Fallback
    }
  }

  // Create default
  saveDepositSettings(DEFAULT_SETTINGS)
  return DEFAULT_SETTINGS
}

export function saveDepositSettings(settings: DepositSettings): void {
  const filePath = getDepositSettingsPath()
  const legacyPath = getCryptoWalletsPath()

  writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf-8')

  // Keep legacy crypto_wallets.json in sync for backward compatibility
  try {
    const legacyWallets = settings.wallets.map(w => ({
      coin: w.coin,
      label: w.label,
      network: w.network,
      address: w.address,
      active: w.active !== false
    }))
    writeFileSync(legacyPath, JSON.stringify(legacyWallets, null, 2), 'utf-8')
  } catch {
    // Ignore legacy file write failure
  }
}
