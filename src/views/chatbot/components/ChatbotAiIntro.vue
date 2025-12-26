<template>
  <transition name="ai-fade">
    <div v-if="visible" class="ai-intro-overlay" @click.self="$emit('close')" @keydown.esc="$emit('close')" tabindex="-1" aria-modal="true" role="dialog">
      <button class="ai-close" @click="$emit('close')" aria-label="ปิด">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
      <div class="ai-intro-content" @mousemove="onMouseMove" @mouseleave="onMouseLeave">
        <div class="ai-hero">
          <img :src="botAvatar" alt="PCRU AI" class="ai-hero-img" :style="tiltTransform" />
          <div class="ai-hero-glow"></div>
        </div>
        <div class="ai-hero-text">
          <div class="ai-hero-title">PCRU AI Assistant</div>
          <div class="ai-hero-sub">ช่วยคุณค้นหาทุน การเรียน การบริการ และอีกมากมาย</div>
        </div>
        <button class="ai-help-btn" @click="$emit('openHelp')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span>วิธีใช้งาน Bot</span>
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ChatbotAiIntro',
  props: {
    visible: { type: Boolean, default: false },
    botAvatar: { type: String, default: '' }
  },
  emits: ['close', 'openHelp'],
  data() { return { tilt: { x: 0, y: 0, s: 1 } } },
  computed: {
    tiltTransform() {
      return { transform: 'perspective(800px) rotateX(' + this.tilt.y + 'deg) rotateY(' + this.tilt.x + 'deg) scale(' + this.tilt.s + ')' }
    }
  },
  methods: {
    onMouseMove(e) {
      const rect = e.currentTarget.getBoundingClientRect()
      const rx = (e.clientX - rect.left) / rect.width - 0.5
      const ry = (e.clientY - rect.top) / rect.height - 0.5
      this.tilt.x = rx * 8
      this.tilt.y = -ry * 8
      this.tilt.s = 1.02
    },
    onMouseLeave() { this.tilt.x = 0; this.tilt.y = 0; this.tilt.s = 1 }
  }
}
</script>
