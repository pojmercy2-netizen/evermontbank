<template>
  <section
    class="hero"
    ref="heroRef"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <!-- Background: Deep Navy & Radiant Gold Aura -->
    <div class="hero-background">
      <div class="mesh-gradient">
        <!-- Radiant Gold Aura -->
        <div class="mesh-color mesh-gold-main" />
        <div class="mesh-color mesh-gold-subtle" />
        <!-- Deep Royal Sapphire Glows -->
        <div class="mesh-color mesh-navy-sapphire" />
        <div class="mesh-color mesh-navy-deep" />
      </div>

      <!-- Precision Geometric Grid with Radial Fade -->
      <div class="hero-grid-overlay" />

      <!-- Concentric Luxury Radial Rings -->
      <div class="hero-rings" aria-hidden="true">
        <div class="ring ring-1" />
        <div class="ring ring-2" />
        <div class="ring ring-3" />
      </div>

      <!-- Ambient Light Flares -->
      <div class="hero-gradient-orb orb-gold" />
      <div class="hero-gradient-orb orb-sapphire" />
    </div>

    <div class="container hero-container">
      <div class="hero-inner">
        <!-- Content -->
        <div class="hero-content">
          <!-- Live High-Yield Badge -->
          <div class="hero-badge">
            <span class="badge-dot"></span>
            <span class="badge-highlight">5.25% APY</span>
            <span class="badge-text">High-Yield Savings &amp; Private Wealth</span>
          </div>

          <!-- Hero Title -->
          <h1 class="hero-title">
            Next-Generation Banking.<br />
            <span class="text-gradient">Built for Modern Wealth.</span>
          </h1>

          <!-- Hero Description -->
          <p class="hero-description">
            Experience seamless digital finance engineered for ambition. Institutional-grade security, instant global transfers, and high-yield savings designed to compound your financial future.
          </p>

          <!-- Action Buttons -->
          <div class="hero-actions">
            <NuxtLink to="/register" class="btn btn-primary hero-btn btn-glow">
              <span>Open an Account</span>
              <Icon name="lucide:arrow-right" :size="18" />
            </NuxtLink>
            <NuxtLink to="/personal" class="btn hero-btn-secondary hero-btn-outline">
              <span>Explore Wealth Plans</span>
              <Icon name="lucide:sparkles" :size="16" class="icon-sparkle" />
            </NuxtLink>
          </div>

          <!-- Trust Proof Metrics Row -->
          <div class="hero-trust-row">
            <div class="hero-trust-pill">
              <Icon name="lucide:shield-check" :size="15" class="trust-icon-gold" />
              <span>FDIC Insured to $250,000</span>
            </div>
            <div class="hero-trust-pill">
              <Icon name="lucide:lock" :size="14" class="trust-icon-gold" />
              <span>256-Bit Bank Encryption</span>
            </div>
            <div class="hero-trust-pill">
              <Icon name="lucide:check-circle-2" :size="14" class="trust-icon-gold" />
              <span>Zero Hidden Fees</span>
            </div>
          </div>
        </div>

        <!-- Visual 3D Interactive Wealth Card & Floating Badges -->
        <div class="hero-visual" aria-hidden="true">
          <!-- Main 3D Card -->
          <div
            class="hero-card"
            :class="{ hovering: isHovering }"
            :style="{
              transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateZ(30px)`
            }"
          >
            <div class="hero-card-glow" />
            <div class="hero-card-sheen" />
            
            <div class="hero-card-inner">
              <!-- Top Row: Bank Badge & Contactless -->
              <div class="card-header">
                <div class="card-brand">
                  <div class="card-emblem">
                    <Icon name="lucide:landmark" :size="16" />
                  </div>
                  <div>
                    <span class="card-bank-name">EVERMONT</span>
                    <span class="card-tier-tag">PRIVATE WEALTH</span>
                  </div>
                </div>
                <div class="contactless-icon">
                  <Icon name="lucide:wifi" :size="18" />
                </div>
              </div>

              <!-- Chip Graphic -->
              <div class="card-chip">
                <div class="chip-line chip-h"></div>
                <div class="chip-line chip-v"></div>
              </div>

              <!-- Balance Display -->
              <div class="card-balance-box">
                <span class="balance-label">Total Portfolio Balance</span>
                <div class="balance-row">
                  <span class="balance-value">$248,650.00</span>
                  <div class="balance-growth-pill">
                    <Icon name="lucide:trending-up" :size="13" />
                    <span>+14.8%</span>
                  </div>
                </div>
              </div>

              <!-- Card Bottom Details -->
              <div class="card-footer">
                <div class="card-holder-info">
                  <span class="card-holder-label">CARDHOLDER</span>
                  <strong class="card-holder-name">ALEXANDER M. VANCE</strong>
                </div>
                <div class="card-number-info">
                  <span class="card-number-digits">•••• 8892</span>
                  <span class="card-validity">EXP 08/29</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Floating Stat Badge 1: Monthly Yield (Top Right) -->
          <div
            class="hero-floating-pill float-yield"
            :style="{
              transform: `translateZ(65px) rotate(3deg) translateX(${rotate.y * -0.6}px) translateY(${rotate.x * -0.6}px)`
            }"
          >
            <div class="floating-icon-box gold-box">
              <Icon name="lucide:trending-up" :size="16" />
            </div>
            <div class="floating-text">
              <span class="float-title">Monthly Interest Yield</span>
              <strong class="float-value">+$1,087.80 <span class="float-sub">earned</span></strong>
            </div>
          </div>

          <!-- Floating Stat Badge 2: Security & Protection (Bottom Left) -->
          <div
            class="hero-floating-pill float-security"
            :style="{
              transform: `translateZ(50px) rotate(-4deg) translateX(${rotate.y * 0.5}px) translateY(${rotate.x * 0.5}px)`
            }"
          >
            <div class="floating-icon-box emerald-box">
              <Icon name="lucide:shield-check" :size="18" />
            </div>
            <div class="floating-text">
              <span class="float-title">FDIC Protection</span>
              <strong class="float-value">100% Guaranteed</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const heroRef = ref<HTMLElement | null>(null)
const rotate = ref({ x: 12, y: -14 })
const isHovering = ref(false)

// Throttle via rAF — prevents reactive updates faster than 60fps
let rafPending = false

const handleMouseMove = (e: MouseEvent) => {
  if (rafPending || !heroRef.value) return
  rafPending = true
  requestAnimationFrame(() => {
    if (!heroRef.value) { rafPending = false; return }
    const rect = heroRef.value.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    rotate.value = {
      x: ((y - centerY) / centerY) * -16,
      y: ((x - centerX) / centerX) * 16
    }
    isHovering.value = true
    rafPending = false
  })
}

const handleMouseLeave = () => {
  rotate.value = { x: 12, y: -14 }
  isHovering.value = false
  rafPending = false
}
</script>

<style scoped>
/* ============================================================
   HERO SECTION — DEEP NAVY & RADIANT GOLD AURA
   ============================================================ */
.hero {
  position: relative;
  min-height: calc(100vh - 10px);
  display: flex;
  align-items: center;
  overflow: hidden;
  background: radial-gradient(circle at 50% 10%, #0c2149 0%, #07152f 40%, #030a17 100%);
  color: #ffffff;
}

/* ── Ambient Background & Aura Layers ── */
.hero-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.mesh-gradient {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.mesh-color {
  position: absolute;
  border-radius: 50%;
  /* Reduced from 95px — blur is O(radius²), so 60px is ~60% cheaper on GPU */
  filter: blur(60px);
  will-change: transform;
  transform: translateZ(0);
}

/* Warm Radiant Gold Aura on the right / visual side */
.mesh-gold-main {
  width: 650px;
  height: 650px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.24) 0%, rgba(245, 158, 11, 0.12) 40%, transparent 70%);
  top: -100px;
  right: -50px;
  animation: floatGold 10s ease-in-out infinite;
}

.mesh-gold-subtle {
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(253, 224, 71, 0.16) 0%, rgba(212, 175, 55, 0.05) 50%, transparent 70%);
  bottom: 50px;
  right: 25%;
  animation: floatGoldRev 12s ease-in-out infinite;
}

/* Deep Royal Sapphire & Cobalt Glow on the left */
.mesh-navy-sapphire {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(30, 64, 175, 0.35) 0%, rgba(14, 165, 233, 0.12) 45%, transparent 70%);
  bottom: -150px;
  left: -100px;
  animation: floatSapphire 11s ease-in-out infinite;
}

.mesh-navy-deep {
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%);
  top: 15%;
  left: 20%;
  animation: floatSapphire 9s ease-in-out infinite reverse;
}

@keyframes floatGold {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-20px, 15px) scale(1.04); }
}
@keyframes floatGoldRev {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(15px, -18px) scale(0.97); }
}
@keyframes floatSapphire {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(18px, -15px) scale(1.03); }
}

/* Precision Geometric Line Grid */
.hero-grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse at center, rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 0) 75%);
  -webkit-mask-image: radial-gradient(ellipse at center, rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 0) 75%);
}

/* Concentric Luxury Radial Rings */
.hero-rings {
  position: absolute;
  right: -50px;
  top: 50%;
  transform: translateY(-50%);
  width: 750px;
  height: 750px;
  pointer-events: none;
  mask-image: radial-gradient(circle at center, rgba(0, 0, 0, 1) 15%, rgba(0, 0, 0, 0) 70%);
  -webkit-mask-image: radial-gradient(circle at center, rgba(0, 0, 0, 1) 15%, rgba(0, 0, 0, 0) 70%);
}
.ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
}
.ring-1 { width: 340px; height: 340px; border: 1px solid rgba(212, 175, 55, 0.18); }
.ring-2 { width: 500px; height: 500px; border: 1px dashed rgba(212, 175, 55, 0.12); }
.ring-3 { width: 660px; height: 660px; border: 1px solid rgba(99, 102, 241, 0.08); }

/* Ambient Orbs — reduced blur from 140px for GPU performance */
.hero-gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  will-change: transform;
  transform: translateZ(0);
}
.orb-gold {
  width: 500px;
  height: 500px;
  background: rgba(212, 175, 55, 0.18);
  top: -100px;
  right: 5%;
}
.orb-sapphire {
  width: 600px;
  height: 600px;
  background: rgba(10, 36, 99, 0.6);
  bottom: -200px;
  left: -100px;
}

/* ── Container & Layout ── */
.hero-container {
  position: relative;
  z-index: 1;
  padding-top: 108px;
  padding-bottom: 48px;
  max-width: 1320px;
  margin: 0 auto;
}

.hero-inner {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 48px;
  align-items: center;
}

@media (max-width: 1024px) {
  .hero-inner {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 40px;
  }
  .hero-actions { justify-content: center; }
  .hero-trust-row { justify-content: center; }
  .hero-badge { margin: 0 auto; }
}

@media (max-width: 640px) {
  .hero-container {
    padding-top: 96px;
    padding-bottom: 40px;
  }
}

/* ── Hero Content ── */
.hero-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* Pill Badge */
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 5px 14px 5px 8px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 999px;
  width: fit-content;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
}

.hero-badge:hover {
  border-color: rgba(212, 175, 55, 0.6);
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #E5C158;
  box-shadow: 0 0 10px #E5C158;
  animation: pulseDot 2s infinite ease-in-out;
}

@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}

.badge-highlight {
  background: linear-gradient(135deg, #E5C158 0%, #D4AF37 100%);
  color: #07152f;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 999px;
  letter-spacing: 0.04em;
}

.badge-text {
  font-size: 13px;
  color: #E2E8F0;
  font-weight: 500;
}

/* Hero Typography */
.hero-title {
  font-size: clamp(32px, 4.4vw, 56px);
  font-weight: 800;
  line-height: 1.12;
  color: #ffffff;
  letter-spacing: -0.035em;
  text-wrap: balance;
}

/* Radiant Gold & Champagne Text Gradient */
.text-gradient {
  background: linear-gradient(135deg, #FFF8DB 0%, #F5D77F 25%, #D4AF37 60%, #E2C067 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: inline-block;
  text-shadow: 0 0 40px rgba(212, 175, 55, 0.25);
}

.hero-description {
  font-size: 16.5px;
  color: #CBD5E1;
  line-height: 1.62;
  max-width: 560px;
}

@media (max-width: 1024px) {
  .hero-description {
    margin: 0 auto;
  }
}

/* Action Buttons */
.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 6px;
}

@media (max-width: 480px) {
  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .hero-btn, .hero-btn-outline {
    width: 100%;
    justify-content: center;
  }
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 15px 30px;
  font-size: 15.5px;
  font-weight: 700;
  border-radius: 12px;
  transition: all 0.25s ease;
  cursor: pointer;
}

.btn-glow {
  background: linear-gradient(135deg, #0066FF 0%, #0044CC 100%);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 25px rgba(0, 102, 255, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.4);
}

.btn-glow:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 35px rgba(0, 102, 255, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.6);
  background: linear-gradient(135deg, #0070FF 0%, #004fe6 100%);
}

.hero-btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 15px 28px;
  font-size: 15.5px;
  font-weight: 600;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid rgba(212, 175, 55, 0.4);
  color: #F8FAFC;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.25s ease;
}

.hero-btn-outline:hover {
  background: rgba(212, 175, 55, 0.12);
  border-color: rgba(212, 175, 55, 0.7);
  color: #FFFDF0;
  transform: translateY(-2px);
}

.icon-sparkle {
  color: #E5C158;
}

/* Trust Proof Row */
.hero-trust-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  padding-top: 10px;
}

.hero-trust-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 500;
  color: #94A3B8;
  letter-spacing: 0.01em;
}

.trust-icon-gold {
  color: #D4AF37;
}

/* ============================================================
   3D VISUAL: EVERMONT PRIVATE WEALTH TITANIUM CARD
   ============================================================ */
.hero-visual {
  perspective: 1200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 400px;
}

@media (max-width: 1024px) {
  .hero-visual {
    margin-top: 20px;
  }
}

.hero-card {
  width: 380px;
  max-width: 100%;
  aspect-ratio: 1.58 / 1;
  background: linear-gradient(135deg, #101c34 0%, #091325 50%, #060c18 100%);
  border: 1.5px solid rgba(212, 175, 55, 0.35);
  border-radius: 24px;
  padding: 28px;
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  box-shadow:
    0 25px 60px rgba(0, 0, 0, 0.6),
    0 0 50px rgba(212, 175, 55, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.25);
  transition: transform 0.12s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
}

.hero-card.hovering {
  box-shadow:
    0 35px 80px rgba(0, 0, 0, 0.75),
    0 0 80px rgba(212, 175, 55, 0.28),
    inset 0 1px 2px rgba(255, 255, 255, 0.4);
}

.hero-card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 80% 20%, rgba(212, 175, 55, 0.25) 0%, transparent 55%);
  pointer-events: none;
}

.hero-card-sheen {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.16),
    transparent
  );
  transform: skewX(-25deg);
  pointer-events: none;
}

.hero-card-inner {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  position: relative;
  z-index: 2;
}

/* Card Header */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-emblem {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #E5C158 0%, #D4AF37 100%);
  color: #07152f;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.4);
}

.card-bank-name {
  display: block;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #FFFFFF;
}

.card-tier-tag {
  display: block;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: #D4AF37;
  text-transform: uppercase;
}

.contactless-icon {
  color: rgba(212, 175, 55, 0.8);
  transform: rotate(90deg);
}

/* EMV Chip */
.card-chip {
  width: 42px;
  height: 32px;
  border-radius: 6px;
  background: linear-gradient(135deg, #fce084 0%, #c4962b 100%);
  border: 1px solid #7c5c16;
  position: relative;
  margin: 10px 0 6px 0;
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.6);
}

.chip-line {
  position: absolute;
  background: rgba(124, 92, 22, 0.5);
}
.chip-h {
  width: 100%;
  height: 1px;
  top: 50%;
  left: 0;
}
.chip-v {
  width: 1px;
  height: 100%;
  left: 50%;
  top: 0;
}

/* Card Balance */
.card-balance-box {
  margin: 4px 0 10px;
}

.balance-label {
  display: block;
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.balance-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.balance-value {
  font-size: 26px;
  font-weight: 800;
  color: #FFFFFF;
  letter-spacing: -0.02em;
  font-feature-settings: 'tnum';
}

.balance-growth-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(16, 185, 129, 0.16);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #34D399;
  font-size: 11.5px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
}

/* Card Footer Details */
.card-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.card-holder-label {
  display: block;
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #64748B;
}

.card-holder-name {
  display: block;
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #F1F5F9;
}

.card-number-info {
  text-align: right;
}

.card-number-digits {
  display: block;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.7);
  font-family: var(--font-mono, monospace);
}

.card-validity {
  display: block;
  font-size: 9px;
  font-weight: 600;
  color: #64748B;
  letter-spacing: 0.05em;
}

/* ── Floating Badges ── */
.hero-floating-pill {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  background: rgba(10, 25, 47, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(212, 175, 55, 0.12);
  pointer-events: none;
  transition: transform 0.15s ease;
  z-index: 4;
}

.float-yield {
  top: -15px;
  right: -20px;
  border-color: rgba(212, 175, 55, 0.4);
}

.float-security {
  bottom: -20px;
  left: -20px;
  border-color: rgba(16, 185, 129, 0.35);
}

@media (max-width: 480px) {
  .hero-floating-pill { display: none; }
}

.floating-icon-box {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.gold-box {
  background: rgba(212, 175, 55, 0.18);
  border: 1px solid rgba(212, 175, 55, 0.4);
  color: #F5D77F;
}

.emerald-box {
  background: rgba(16, 185, 129, 0.18);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #34D399;
}

.floating-text {
  display: flex;
  flex-direction: column;
}

.float-title {
  font-size: 10.5px;
  font-weight: 600;
  color: #94A3B8;
  letter-spacing: 0.02em;
}

.float-value {
  font-size: 14px;
  font-weight: 800;
  color: #FFFFFF;
}

.float-sub {
  font-size: 11px;
  font-weight: 500;
  color: #34D399;
}
</style>
