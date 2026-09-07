/**
 * Shared settings composable — fetches /api/settings exactly ONCE per page lifecycle
 * and caches the result in Nuxt's useState so every component reads the same value
 * without triggering extra network requests.
 */

export interface PublicSettings {
  supportEmail: string
  supportPhone: string
}

const DEFAULT_SETTINGS: PublicSettings = {
  supportEmail: 'support@evermontbank.com',
  supportPhone: '+1 (800) 555-0199'
}

export const useSettings = () => {
  const settings = useState<PublicSettings>('public-settings', () => ({ ...DEFAULT_SETTINGS }))
  const loaded = useState<boolean>('public-settings-loaded', () => false)
  const loading = useState<boolean>('public-settings-loading', () => false)

  const fetchSettings = async () => {
    // Already fetched or in-flight — return cached value
    if (loaded.value || loading.value) return settings.value

    loading.value = true
    try {
      const res = await $fetch<any>('/api/settings')
      if (res?.success && res?.data) {
        const data = res.data?.data ?? res.data
        settings.value = {
          supportEmail: data.supportEmail || DEFAULT_SETTINGS.supportEmail,
          supportPhone: data.supportPhone || DEFAULT_SETTINGS.supportPhone
        }
      }
    } catch {
      // Silently fall back to defaults already set in useState initializer
    } finally {
      loaded.value = true
      loading.value = false
    }

    return settings.value
  }

  return {
    settings,
    fetchSettings
  }
}
