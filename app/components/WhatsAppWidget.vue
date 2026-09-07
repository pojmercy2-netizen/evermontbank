<template>
  <div class="whatsapp-widget-container" :class="{ 'in-dashboard': isDashboard }">
    <a
      :href="whatsappUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="whatsapp-btn"
      aria-label="Chat with Support on WhatsApp"
    >
      <!-- Ripple Effect -->
      <span class="ripple-glow"></span>
      <span class="ripple-glow secondary"></span>

      <!-- Icon (inline SVG for instant zero-network rendering) -->
      <svg class="whatsapp-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382C17.115 14.203 15.361 13.342 15.034 13.223C14.707 13.104 14.469 13.045 14.231 13.402C13.993 13.759 13.308 14.563 13.099 14.801C12.891 15.039 12.683 15.069 12.326 14.89C11.969 14.712 10.822 14.336 9.463 13.125C8.398 12.176 7.679 10.999 7.471 10.642C7.263 10.285 7.449 10.092 7.628 9.914C7.789 9.754 7.987 9.492 8.165 9.284C8.344 9.076 8.403 8.927 8.522 8.689C8.641 8.451 8.582 8.243 8.493 8.065C8.403 7.886 7.689 6.13 7.391 5.416C7.102 4.72 6.809 4.814 6.589 4.803C6.381 4.793 6.143 4.793 5.905 4.793C5.667 4.793 5.28 4.882 4.953 5.239C4.626 5.596 3.703 6.459 3.703 8.215C3.703 9.971 4.983 11.667 5.161 11.905C5.34 12.143 7.679 15.751 11.261 17.299C12.113 17.667 12.777 17.886 13.296 18.051C14.153 18.323 14.933 18.285 15.551 18.193C16.241 18.09 17.671 17.327 17.969 16.494C18.267 15.661 18.267 14.947 18.177 14.798C18.088 14.65 17.829 14.561 17.472 14.382Z" fill="#FFFFFF"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M12.004 2C6.484 2 2.008 6.477 2.008 12C2.008 13.766 2.468 15.426 3.272 16.87L2.052 21.328L6.643 20.125C8.033 20.883 9.621 21.314 12.004 21.314C17.524 21.314 22 16.837 22 11.314C22 5.792 17.524 2 12.004 2ZM12.004 19.628C9.988 19.628 8.163 19.006 6.666 17.938L6.31 17.685L3.587 18.4L4.316 15.744L4.038 15.302C2.887 13.469 2.25 11.304 2.25 12C2.25 6.615 6.619 2.246 12.004 2.246C17.389 2.246 21.758 6.615 21.758 12C21.758 17.385 17.389 19.628 12.004 19.628Z" fill="#FFFFFF"/>
      </svg>

      <!-- Tooltip / Label -->
      <span class="widget-tooltip">
        <span class="tooltip-status"></span>
        Chat Support
      </span>
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const route = useRoute()
const { settings, fetchSettings } = useSettings()

// Detect if we are inside the dashboard to adjust mobile layout offset
const isDashboard = computed(() => route.path.startsWith('/dashboard'))

// Strip non-digits to get a clean number for wa.me/ link
const formattedPhone = computed(() => settings.value.supportPhone.replace(/[^0-9]/g, ''))

const whatsappUrl = computed(() => {
  const text = encodeURIComponent('Hello! I need support with my Evermont Bank account.')
  return `https://wa.me/${formattedPhone.value}?text=${text}`
})

onMounted(() => {
  fetchSettings()
})
</script>

<style scoped>
.whatsapp-widget-container {
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.whatsapp-btn {
  position: relative;
  width: 58px;
  height: 58px;
  background: linear-gradient(135deg, #25D366, #128C7E);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(18, 140, 126, 0.4);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  text-decoration: none;
}

.whatsapp-icon {
  width: 32px;
  height: 32px;
  transition: transform 0.3s ease;
  z-index: 2;
}

/* Tooltip / Bubble */
.widget-tooltip {
  position: absolute;
  left: 74px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 8px;
}

.tooltip-status {
  width: 8px;
  height: 8px;
  background-color: #25D366;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 6px #25D366;
}

/* Hover States */
.whatsapp-btn:hover {
  transform: scale(1.08) translateY(-2px);
  box-shadow: 0 6px 20px rgba(18, 140, 126, 0.6);
}

.whatsapp-btn:hover .whatsapp-icon {
  transform: rotate(8deg) scale(1.05);
}

.whatsapp-btn:hover .widget-tooltip {
  opacity: 1;
  transform: translateX(0);
}

/* Ripple animations */
.ripple-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: rgba(37, 211, 102, 0.4);
  animation: pulse-ring 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  z-index: 0;
}

.ripple-glow.secondary {
  animation-delay: 1.25s;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.4);
    opacity: 0;
  }
  100% {
    transform: scale(0.95);
    opacity: 0;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .whatsapp-widget-container {
    bottom: 20px;
    left: 20px;
  }

  .whatsapp-btn {
    width: 52px;
    height: 52px;
  }

  .whatsapp-icon {
    width: 28px;
    height: 28px;
  }

  /* Adjust offset if user is inside the dashboard layout to avoid covering bottom tabs */
  .whatsapp-widget-container.in-dashboard {
    bottom: 84px;
    left: 20px;
  }

  .widget-tooltip {
    display: none; /* Hide tooltip on small mobile screens to keep view clean */
  }
}
</style>
