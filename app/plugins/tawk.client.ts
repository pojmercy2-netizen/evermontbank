export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return

  if ((window as any)._tawk_injected || document.querySelector('script[src*="tawk.to"]')) return
  ;(window as any)._tawk_injected = true

  // Start of Tawk.to Script
  ;(window as any).Tawk_API = (window as any).Tawk_API || {}
  ;(window as any).Tawk_LoadStart = new Date()

  const s1 = document.createElement('script')
  const s0 = document.getElementsByTagName('script')[0]
  s1.async = true
  s1.src = 'https://embed.tawk.to/6aac22b97fdcb5344518795e/1k2o6f9uc'
  s1.charset = 'UTF-8'
  s1.setAttribute('crossorigin', '*')

  if (s0 && s0.parentNode) {
    s0.parentNode.insertBefore(s1, s0)
  } else {
    document.head.appendChild(s1)
  }
  // End of Tawk.to Script
})
