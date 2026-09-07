// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],

  devtools: {
    enabled: false
  },

  runtimeConfig: {
    // Server-only secrets (never exposed to client)
    databaseUrl: process.env.DATABASE_URL || '',
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'evermont-access-secret-change-me',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'evermont-refresh-secret-change-me',
    jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    jwtRefreshExpiryRememberMe: process.env.JWT_REFRESH_EXPIRY_REMEMBER_ME || '30d',
    // Public (safe to expose)
    public: {
      appName: 'Evermont Bank'
    }
  },

  routeRules: {
    // In production, cache static pages at edge/CDN
    ...(process.env.NODE_ENV === 'production' ? {
      '/': { cache: { maxAge: 600, staleMaxAge: 3600 } },
      '/about': { cache: { maxAge: 600, staleMaxAge: 3600 } },
      '/personal': { cache: { maxAge: 600, staleMaxAge: 3600 } },
      '/business': { cache: { maxAge: 600, staleMaxAge: 3600 } },
      '/loans': { cache: { maxAge: 600, staleMaxAge: 3600 } },
      '/investments': { cache: { maxAge: 600, staleMaxAge: 3600 } },
    } : {}),
    // API: public settings cached for 5 minutes
    '/api/settings': { cache: { maxAge: 300, staleMaxAge: 3600 } },
    // API: health check cached briefly
    '/api/health': { cache: { maxAge: 30 } },
    // Redirects
    '/resources': { redirect: '/' },
    '/resources/**': { redirect: '/' }
  },

  css: ['~/assets/css/main.css'],

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2025-01-15',

  colorMode: {
    classSuffix: '',
    preference: 'light',
    fallback: 'light',
    storageKey: 'evermont-color-mode-v2'
  },

  // Nitro server-side config
  nitro: {
    compressPublicAssets: {
      gzip: true,
      brotli: true
    },
    // Minify server output
    minify: true
  },

  experimental: {
    payloadExtraction: false,
    viewTransition: true,
    renderJsonPayloads: true
  },

  // Vite build config
  vite: {
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia', '@vueuse/core']
    },
    build: {
      // Split chunks intelligently to improve parallel loading
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-vue': ['vue', 'vue-router'],
            'vendor-pinia': ['pinia'],
            'vendor-vueuse': ['@vueuse/core']
          }
        }
      },
      // Remove console.log in production builds
      minify: 'esbuild'
    },
    // Enable CSS code splitting
    css: {
      devSourcemap: false
    }
  },

  app: {
    // Smooth page transitions for perceived speed
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      title: 'Evermont Bank — Bank Smarter. Live Better.',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Evermont Bank is a secure, premium digital banking platform designed to help you manage today and build for tomorrow.' },
        { name: 'theme-color', content: '#0A192F' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', sizes: '64x64', href: '/favicon.png?v=evermont2' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png?v=evermont2' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png?v=evermont2' },
        { rel: 'shortcut icon', type: 'image/x-icon', href: '/favicon.ico?v=evermont2' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png?v=evermont2' },
        // Preconnect to font origins first (no render blocking)
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        // Load Google Fonts non-blocking via media trick
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
          media: 'print',
          onload: "this.media='all'"
        }
      ],
      // Inline noscript fallback for fonts
      noscript: [
        { innerHTML: '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">' }
      ]
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
