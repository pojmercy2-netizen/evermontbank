<template>
  <div class="gtranslate_wrapper" :class="{ 'in-dashboard': isDashboard }"></div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'

const route = useRoute()
const isDashboard = computed(() => route.path.startsWith('/dashboard'))

onMounted(() => {
  if (typeof window === 'undefined') return

  const loadGTranslate = () => {
    if ((window as any)._gt_injected || document.querySelector('script[src*="gtranslate"]')) return
    ;(window as any)._gt_injected = true

    ;(window as any).gtranslateSettings = {
      default_language: 'en',
      wrapper_selector: '.gtranslate_wrapper',
      flag_style: '3d'
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.gtranslate.net/widgets/latest/float.js'
    script.defer = true
    document.body.appendChild(script)
  }

  // Defer slightly so page loads instantly first
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => setTimeout(loadGTranslate, 1500))
  } else {
    setTimeout(loadGTranslate, 2000)
  }
})
</script>

<style>
/* Position the GTranslate float widget neatly beside the WhatsApp button on the bottom left */
#gt_float_wrapper {
  position: fixed !important;
  bottom: 33px !important;
  left: 94px !important;
  z-index: 9998 !important;
  top: auto !important;
  right: auto !important;
}

#gt_float_wrapper .gt_float_switcher {
  border-radius: 999px !important;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.18) !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  font-family: inherit !important;
}

#gt_float_wrapper .gt_float_switcher .gt-selected {
  background: #ffffff !important;
  border-radius: 999px !important;
}

#gt_float_wrapper .gt_float_switcher .gt-selected .gt-current-lang {
  padding: 6px 14px 6px 10px !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  color: #1e293b !important;
}

#gt_float_wrapper .gt_float_switcher .gt_options {
  border-radius: 14px !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18) !important;
}

@media (max-width: 768px) {
  #gt_float_wrapper {
    bottom: 27px !important;
    left: 82px !important;
  }

  .gtranslate_wrapper.in-dashboard #gt_float_wrapper {
    bottom: 91px !important;
    left: 82px !important;
  }
}
</style>
