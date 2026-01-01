<template>
  <!-- Bot Name Management Card - Apple Style -->
  <div class="bot-name-card glass-card">
    <div class="card-glow"></div>
    <div class="bot-name-section">
      <div class="bot-name-header">
        <div class="bot-name-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="nameIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#A855F7"/>
                <stop offset="100%" stop-color="#7C3AED"/>
              </linearGradient>
            </defs>
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="url(#nameIconGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="url(#nameIconGrad)" stroke-width="2"/>
            <!-- Sparkle -->
            <path class="sparkle-animate" d="M18 2l.5 1.5L20 4l-1.5.5L18 6l-.5-1.5L16 4l1.5-.5L18 2z" fill="#F59E0B" opacity="0.8">
              <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>
            </path>
          </svg>
        </div>
        <div class="header-text-content">
          <h3 class="bot-name-title">ชื่อ AI Assistant</h3>
          <p class="bot-name-subtitle">กำหนดชื่อของ AI Assistant ที่ปรากฏในการแชท</p>
        </div>
      </div>
      
      <div class="bot-name-input-group">
        <div class="input-wrapper">
          <div class="input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <input 
            v-model="localBotName" 
            type="text" 
            class="bot-name-input"
            placeholder="ป้อนชื่อ AI Assistant"
            @keyup.enter="handleSave"
            @focus="inputFocused = true"
            @blur="inputFocused = false"
          />
          <div class="input-focus-ring" :class="{ active: inputFocused }"></div>
          <div class="input-highlight"></div>
        </div>
        
        <button 
          class="btn-save-name"
          :class="{ 
            'is-saving': isSaving, 
            'has-changes': hasChanges,
            'is-disabled': !canSave
          }"
          :disabled="!canSave"
          @click="handleSave"
        >
          <span class="btn-bg"></span>
          <span class="btn-content">
            <svg v-if="isSaving" class="btn-spinner" width="18" height="18" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="32" stroke-linecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
              </circle>
            </svg>
            <svg v-else-if="saveSuccess" class="btn-check" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="7,3 7,8 15,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ buttonText }}</span>
          </span>
          <span class="btn-shine"></span>
        </button>
      </div>

      <!-- Preview Animation -->
      <transition name="preview-slide">
        <div class="bot-name-preview">
          <div class="preview-header">
            <span class="preview-icon">✨</span>
            <span class="preview-label">ตัวอย่าง</span>
          </div>
          <div class="preview-content">
            <div class="preview-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="url(#previewGrad)"/>
                <defs>
                  <linearGradient id="previewGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#A855F7"/>
                    <stop offset="100%" stop-color="#7C3AED"/>
                  </linearGradient>
                </defs>
                <circle cx="9" cy="10" r="1.5" fill="white"/>
                <circle cx="15" cy="10" r="1.5" fill="white"/>
                <path d="M9 14c0 0 1.5 2 3 2s3-2 3-2" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="preview-bubble">
              <span>สวัสดี 👋 {{ botPronoun }}ชื่อ <strong>{{ localBotName }}</strong> ผู้ช่วย AI ของคุณ</span>
              <div class="bubble-tail"></div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, getCurrentInstance } from 'vue'

const { appContext } = getCurrentInstance()
const { $axios } = appContext.config.globalProperties

const botPronoun = ref('หนู')

const props = defineProps({
  botName: {
    type: String,
    default: 'ปลายฟ้า'
  },
  originalBotName: {
    type: String,
    default: 'ปลายฟ้า'
  },
  isSaving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:botName', 'save'])

const localBotName = ref(props.botName)
const inputFocused = ref(false)
const saveSuccess = ref(false)

// Watch for prop changes
watch(() => props.botName, (newVal) => {
  localBotName.value = newVal
})

// Update parent when local changes
watch(localBotName, (newVal) => {
  emit('update:botName', newVal)
})

const hasChanges = computed(() => {
  return localBotName.value.trim() && localBotName.value !== props.originalBotName
})

// Load bot pronoun from API
onMounted(async () => {
  try {
    const response = await $axios.get('/ai-image/bot-pronoun')
    if (response?.data?.pronoun) {
      botPronoun.value = response.data.pronoun
    }
  } catch (error) {
    console.log('Using default pronoun:', botPronoun.value)
  }
})

const canSave = computed(() => {
  return hasChanges.value && !props.isSaving
})

const buttonText = computed(() => {
  if (props.isSaving) return 'กำลังบันทึก...'
  if (saveSuccess.value) return 'บันทึกแล้ว!'
  return 'บันทึก'
})

function handleSave() {
  if (!canSave.value) return
  emit('save')
  
  // Show success state briefly
  saveSuccess.value = true
  setTimeout(() => {
    saveSuccess.value = false
  }, 2000)
}
</script>

<style scoped>
/* Glass Card Base */
.glass-card {
  position: relative;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.2, 0.9, 0.2, 1);
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

/* Card Glow Effect */
.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at center,
    rgba(168, 85, 247, 0.1) 0%,
    transparent 50%
  );
  opacity: 0;
  transition: opacity 0.6s ease;
  pointer-events: none;
}

.glass-card:hover .card-glow {
  opacity: 1;
}

/* Bot Name Card */
.bot-name-card {
  margin-bottom: 32px;
  padding: 28px;
  animation: cardSlideUp 0.6s cubic-bezier(0.2, 0.9, 0.2, 1) 0.05s backwards;
}

@keyframes cardSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bot-name-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header */
.bot-name-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.bot-name-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(124, 58, 237, 0.1));
  border-radius: 14px;
  flex-shrink: 0;
  animation: iconPulse 3s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.header-text-content {
  flex: 1;
}

.bot-name-title {
  font-size: 18px;
  font-weight: 650;
  color: #1d1d1f;
  margin: 0 0 4px 0;
  letter-spacing: -0.3px;
}

.bot-name-subtitle {
  font-size: 14px;
  color: #86868b;
  margin: 0;
  line-height: 1.4;
}

/* Input Group */
.bot-name-input-group {
  display: flex;
  gap: 12px;
  align-items: stretch;
}

.input-wrapper {
  flex: 1;
  position: relative;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #86868b;
  z-index: 1;
  transition: color 0.3s ease;
}

.bot-name-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  font-size: 15px;
  font-family: inherit;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.2, 0.9, 0.2, 1);
  background: rgba(255, 255, 255, 0.8);
  color: #1d1d1f;
}

.bot-name-input::placeholder {
  color: #c7c7cc;
}

.bot-name-input:hover {
  border-color: rgba(168, 85, 247, 0.3);
}

.bot-name-input:focus {
  outline: none;
  border-color: #A855F7;
  background: white;
  box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.1);
}

.bot-name-input:focus + .input-focus-ring + .input-highlight {
  opacity: 1;
}

.input-wrapper:focus-within .input-icon {
  color: #A855F7;
}

.input-focus-ring {
  position: absolute;
  inset: -4px;
  border-radius: 18px;
  border: 2px solid transparent;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
}

.input-focus-ring.active {
  border-color: rgba(168, 85, 247, 0.2);
  opacity: 1;
}

.input-highlight {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #A855F7, #7C3AED);
  transition: all 0.3s ease;
  transform: translateX(-50%);
  opacity: 0;
}

.bot-name-input:focus ~ .input-highlight {
  width: calc(100% - 32px);
  opacity: 1;
}

/* Save Button */
.btn-save-name {
  position: relative;
  padding: 14px 28px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #A855F7, #7C3AED);
  color: white;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.2, 0.9, 0.2, 1);
  box-shadow: 0 4px 16px rgba(168, 85, 247, 0.3);
  min-width: 140px;
}

.btn-save-name .btn-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #9333EA, #6B21A8);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.btn-save-name:hover:not(:disabled) .btn-bg {
  opacity: 1;
}

.btn-save-name:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(168, 85, 247, 0.4);
}

.btn-save-name:active:not(:disabled) {
  transform: translateY(0);
}

.btn-save-name:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-save-name.has-changes {
  animation: btnPulse 2s ease-in-out infinite;
}

@keyframes btnPulse {
  0%, 100% { box-shadow: 0 4px 16px rgba(168, 85, 247, 0.3); }
  50% { box-shadow: 0 4px 24px rgba(168, 85, 247, 0.5); }
}

.btn-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-spinner {
  animation: spin 0.8s linear infinite;
}

.btn-check {
  animation: checkPop 0.4s cubic-bezier(0.2, 0.9, 0.2, 1);
}

@keyframes checkPop {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s ease;
}

.btn-save-name:hover:not(:disabled) .btn-shine {
  left: 100%;
}


/* Preview */
.bot-name-preview {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(124, 58, 237, 0.05));
  border-radius: 16px;
  padding: 16px 20px;
  border: 1px solid rgba(168, 85, 247, 0.15);
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.preview-icon {
  font-size: 16px;
  animation: sparkleRotate 3s ease-in-out infinite;
}

@keyframes sparkleRotate {
  0%, 100% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(10deg) scale(1.1); }
}

.preview-label {
  font-size: 12px;
  font-weight: 600;
  color: #A855F7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.preview-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  box-shadow: 0 2px 8px rgba(168, 85, 247, 0.2);
  flex-shrink: 0;
}

.preview-bubble {
  position: relative;
  background: white;
  padding: 12px 16px;
  border-radius: 18px 18px 18px 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  font-size: 14px;
  color: #1d1d1f;
  line-height: 1.5;
}

.preview-bubble strong {
  color: #A855F7;
  font-weight: 600;
}

/* Transitions */
.preview-slide-enter-active {
  animation: previewSlideIn 0.4s cubic-bezier(0.2, 0.9, 0.2, 1);
}

.preview-slide-leave-active {
  animation: previewSlideOut 0.3s ease-in forwards;
}

@keyframes previewSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    max-height: 200px;
  }
}

@keyframes previewSlideOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .bot-name-card {
    padding: 20px;
  }
  
  .bot-name-input-group {
    flex-direction: column;
  }
  
  .btn-save-name {
    width: 100%;
  }
}
</style>
