export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return

  const loadTawk = () => {
    if ((window as any)._tawk_injected || document.querySelector('script[src*="tawk.to"]')) return
    ;(window as any)._tawk_injected = true

    // Initialise Tawk globals
    ;(window as any).Tawk_API = (window as any).Tawk_API || {}
    ;(window as any).Tawk_LoadStart = new Date()

    const s1 = document.createElement('script')
    s1.async = true
    s1.src = 'https://embed.tawk.to/6a4a38f58f99461d47cf6e21/1jsout0ho'
    s1.charset = 'UTF-8'
    s1.setAttribute('crossorigin', '*')

    document.head.appendChild(s1)
  }

  // Defer until browser is idle or user interacts
  const initDeferred = () => {
    const timer = setTimeout(loadTawk, 2500)
    const onInteract = () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', onInteract)
      window.removeEventListener('click', onInteract)
      loadTawk()
    }
    window.addEventListener('scroll', onInteract, { passive: true, once: true })
    window.addEventListener('click', onInteract, { passive: true, once: true })
  }

  if (document.readyState === 'complete') {
    initDeferred()
  } else {
    window.addEventListener('load', initDeferred, { once: true })
  }
})

