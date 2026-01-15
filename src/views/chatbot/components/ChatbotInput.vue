<!-- <template>
  <div class="panel-footer">
    <canvas ref="particleCanvas" class="particle-canvas"></canvas>
    <transition name="fly-to-message" @before-enter="beforeFlyEnter" @enter="flyEnter">
      <div v-if="showFlyingText" class="flying-text" :style="flyingTextStyle" ref="flyingText">{{ flyingText }}</div>
    </transition>
    <input v-model="inputValue" class="input-pill" :class="{ 'shake': isTyping }" :style="typingStyle" :placeholder="placeholderText" @keyup.enter="onSend" @input="onTyping" @focus="onFocus" @blur="onBlur" ref="inputBox" />
    <button class="btn-send" @click="onSend" aria-label="send" ref="sendBtn">
      <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="send-icon" aria-hidden="true" focusable="false">
        <path class="send-bubble" fill="white" d="M21 6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h2v3l4-3h6a3 3 0 0 0 3-3V6z"/>
        <circle class="send-dot" cx="12" cy="10" r="0" fill="rgba(107,44,145,0.6)">
          <animate attributeName="r" values="0;2;0" dur="1.5s" repeatCount="indefinite"/>
        </circle>
      </svg>
    </button>
  </div>
</template>

<script>
export default {
  name: 'ChatbotInput',
  props: {
    modelValue: { type: String, default: '' },
    placeholderText: { type: String, default: 'ขอความช่วยเหลือจาก ปลายฟ้า' },
    isTyping: { type: Boolean, default: false },
    showFlyingText: { type: Boolean, default: false },
    flyingText: { type: String, default: '' },
    flyingTextStyle: { type: Object, default: () => ({}) },
    animationEnabled: { type: Boolean, default: true }
  },
  emits: ['update:modelValue', 'send', 'typing', 'focus', 'blur'],
  computed: {
    inputValue: {
      get() { return this.modelValue },
      set(v) { this.$emit('update:modelValue', v) }
    },
    typingStyle() {
      if (!this.isTyping) return {}
      return {
        textShadow: '0 0 20px rgba(139, 76, 184, 0.6), 0 0 40px rgba(107, 44, 145, 0.4)',
        color: '#8B4CB8',
        transition: 'text-shadow 0.15s ease-out, color 0.15s ease-out'
      }
    }
  },
  methods: {
    onSend() { this.$emit('send') },
    onTyping() { this.$emit('typing') },
    onFocus() { this.$emit('focus') },
    onBlur() { this.$emit('blur') },
    beforeFlyEnter(el) {
      const inputBox = this.$refs.inputBox
      if (!inputBox) return
      const inputRect = inputBox.getBoundingClientRect()
      el.style.position = 'fixed'
      el.style.left = inputRect.left + 'px'
      el.style.top = inputRect.top + 'px'
      el.style.width = (inputRect.width - 80) + 'px'
      el.style.opacity = '0'
      el.style.transform = 'scale(0.8)'
    },
    flyEnter(el, done) {
      const panelBody = this.$parent?.$refs?.panelBody
      if (!panelBody) { done(); return }
      const panelRect = panelBody.getBoundingClientRect()
      el.offsetHeight
      el.style.transition = 'all 0.8s cubic-bezier(.2,.9,.2,1)'
      el.style.left = (panelRect.right - 60) + 'px'
      el.style.top = (panelRect.top + 100) + 'px'
      el.style.opacity = '1'
      el.style.transform = 'scale(0.6) rotate(5deg)'
      setTimeout(() => {
        el.style.opacity = '0'
        el.style.transform = 'scale(0.3) rotate(10deg)'
        setTimeout(done, 200)
      }, 600)
    },
    focus() { this.$refs.inputBox?.focus() },
    blur() { this.$refs.inputBox?.blur() },
    getInputRect() { return this.$refs.inputBox?.getBoundingClientRect() },
    getCanvas() { return this.$refs.particleCanvas }
  }
}
</script> -->
