<template>
  <div>
    <!-- Above the fold: load immediately -->
    <HeroSection />
    <TrustBar />

    <!-- Below the fold: lazy load (code-split + deferred hydration) -->
    <LazyFeaturesSection />
    <LazyServicesSection />
    <LazyStatsSection />
    <LazyTestimonialsSection />
    <LazyAboutSection />
    <LazyFaqSection />
    <LazyContactSection />
    <LazyCtaSection />
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Evermont Bank — Bank Smarter. Live Better.',
  meta: [
    { name: 'description', content: 'Evermont Bank — premium digital banking. Open savings, current accounts, virtual cards, transfers, bill pay, loans, investments and foreign exchange in one powerful app.' }
  ]
})
</script>
