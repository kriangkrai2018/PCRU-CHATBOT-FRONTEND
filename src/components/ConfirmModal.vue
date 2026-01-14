<template>
  <!-- Teleport into specified container when teleportTo is provided (e.g., '.chat-panel') -->
  <Teleport v-if="teleportTo" :to="teleportTo">
    <Transition name="confirm-modal">
      <div v-if="isOpen" class="confirm-modal-overlay" :class="{ inline: teleportTo !== 'body' }" @click.self="handleCancel">
        <div class="confirm-modal-content" :class="[variant, { 'pop-in': isOpen }]">
          <!-- Icon -->
          <div class="confirm-modal-icon" :class="variant">
            <i :class="iconClass"></i>
          </div>
          
          <!-- Title -->
          <h3 class="confirm-modal-title">{{ title }}</h3>
          
          <!-- Message -->
          <p class="confirm-modal-text" v-html="message"></p>
          
          <!-- Actions -->
          <div class="confirm-modal-actions">
            <button 
              v-if="showCancel"
              class="btn-modal-secondary" 
              @click="handleCancel"
              :disabled="loading"
            >
              {{ cancelText }}
            </button>
            <button 
              class="btn-modal-primary" 
              :class="variant"
              @click="handleConfirm"
              :disabled="loading"
            >
              <span v-if="loading" class="loading-spinner"></span>
              {{ loading ? loadingText : confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Inline rendering when teleportTo is falsy (render where component is used) -->
  <div v-else v-if="isOpen" class="confirm-modal-overlay inline" @click.self="handleCancel">
    <div class="confirm-modal-content" :class="[variant, { 'pop-in': isOpen }]">
      <!-- Icon -->
      <div class="confirm-modal-icon" :class="variant">
        <i :class="iconClass"></i>
      </div>
      
      <!-- Title -->
      <h3 class="confirm-modal-title">{{ title }}</h3>
      
      <!-- Message -->
      <p class="confirm-modal-text" v-html="message"></p>
      
      <!-- Actions -->
      <div class="confirm-modal-actions">
        <button 
          v-if="showCancel"
          class="btn-modal-secondary" 
          @click="handleCancel"
          :disabled="loading"
        >
          {{ cancelText }}
        </button>
        <button 
          class="btn-modal-primary" 
          :class="variant"
          @click="handleConfirm"
          :disabled="loading"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? loadingText : confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'ยืนยัน'
  },
  message: {
    type: String,
    default: 'คุณต้องการดำเนินการนี้ใช่หรือไม่?'
  },
  variant: {
    type: String,
    default: 'danger', // 'danger', 'warning', 'success', 'info', 'primary'
    validator: (v) => ['danger', 'warning', 'success', 'info', 'primary'].includes(v)
  },
  icon: {
    type: String,
    default: '' // custom icon class, if empty will use default based on variant
  },
  confirmText: {
    type: String,
    default: 'ยืนยัน'
  },
  cancelText: {
    type: String,
    default: 'ยกเลิก'
  },
  loadingText: {
    type: String,
    default: 'กำลังดำเนินการ...'
  },
  loading: {
    type: Boolean,
    default: false
  },
  showCancel: {
    type: Boolean,
    default: true
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  },
  teleportTo: {
    type: [String, Boolean],
    default: 'body' // set to selector (e.g., '.chat-panel') or false to render inline where used
  }
});

const emit = defineEmits(['confirm', 'cancel', 'update:isOpen']);

const iconClass = computed(() => {
  if (props.icon) return props.icon;
  
  const icons = {
    danger: 'bi bi-exclamation-triangle',
    warning: 'bi bi-exclamation-circle',
    success: 'bi bi-check-circle',
    info: 'bi bi-info-circle',
    primary: 'bi bi-question-circle'
  };
  return icons[props.variant] || icons.primary;
});

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  if (props.closeOnOverlay && !props.loading) {
    emit('cancel');
    emit('update:isOpen', false);
  }
};
</script>

<style scoped>
/* Modal Overlay */
.confirm-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Inline variant used when modal is rendered inside a container (e.g., .chat-panel) */
.confirm-modal-overlay.inline {
  position: absolute; /* position relative to parent container */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* darker translucent background plus blur to clearly separate modal from content */
  background: rgba(20,20,35,0.45);
  z-index: 1001;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: backdrop-filter 0.18s ease, background 0.18s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}


/* Modal Content */
.confirm-modal-content {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.confirm-modal-content.pop-in {
  animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes popIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* Icon */
.confirm-modal-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.confirm-modal-icon.danger {
  background: #FFE5E5;
  color: #FF3B30;
}

.confirm-modal-icon.warning {
  /* Purple warning (align with brand purple) */
  background: #F3E8FF; /* very light purple */
  color: #5856D6; /* brand purple */
}

.confirm-modal-icon.success {
  background: #E8F5E9;
  color: #34C759;
}

.confirm-modal-icon.info {
  background: #E3F2FD;
  color: #007AFF;
}

.confirm-modal-icon.primary {
  background: #E8EAF6;
  color: #5856D6;
}

/* Title */
.confirm-modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #1d1d1f;
}

/* Message */
.confirm-modal-text {
  color: #6E6E73;
  margin: 0 0 1.5rem 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.confirm-modal-text :deep(strong) {
  color: #1d1d1f;
  font-weight: 600;
}

/* Actions */
.confirm-modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* Secondary Button */
.btn-modal-secondary {
  padding: 0.75rem 1.5rem;
  background: #F5F5F7;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  color: #1d1d1f;
  font-size: 0.95rem;
}

.btn-modal-secondary:hover:not(:disabled) {
  background: #EBEBED;
}

.btn-modal-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Primary Button - Base */
.btn-modal-primary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
  color: white;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-modal-primary:hover:not(:disabled) {
  transform: scale(1.02);
}

.btn-modal-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Primary Button Variants */
.btn-modal-primary.danger {
  background: #FF3B30;
}

.btn-modal-primary.warning {
  /* Use brand purple for warning actions */
  background: #5856D6;
}

.btn-modal-primary.success {
  background: #34C759;
}

.btn-modal-primary.info {
  background: #007AFF;
}

.btn-modal-primary.primary {
  background: #5856D6;
}

/* Loading Spinner */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Transition */
.confirm-modal-enter-active,
.confirm-modal-leave-active {
  transition: opacity 0.2s ease;
}

.confirm-modal-enter-active .confirm-modal-content,
.confirm-modal-leave-active .confirm-modal-content {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.confirm-modal-enter-from,
.confirm-modal-leave-to {
  opacity: 0;
}

.confirm-modal-enter-from .confirm-modal-content,
.confirm-modal-leave-to .confirm-modal-content {
  transform: scale(0.9);
  opacity: 0;
}

/* Dark mode overrides */
html[data-theme="dark"] .confirm-modal-overlay {
  background: rgba(0, 0, 0, 0.6);
}

/* Dark-mode inline overlay: stronger blur/overlay so the chat panel is visually obscured */
html[data-theme="dark"] .confirm-modal-overlay.inline {
  background: rgba(6,6,8,0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

html[data-theme="dark"] .confirm-modal-content {
  background: #1c1c1e; /* surface */
  color: #f2f2f7; /* text */
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
}

html[data-theme="dark"] .confirm-modal-title {
  color: #ffffff;
}

html[data-theme="dark"] .confirm-modal-text {
  color: #d1d1d6;
}

html[data-theme="dark"] .confirm-modal-icon.danger {
  background: rgba(255, 69, 58, 0.12);
  color: #ff6b6b;
}

html[data-theme="dark"] .confirm-modal-icon.warning {
  background: rgba(88, 86, 214, 0.08); /* subtle purple tint */
  color: #cfc6ff; /* light purple text/icon */
}

html[data-theme="dark"] .btn-modal-primary.warning {
  background: #6a5afc; /* slightly brighter purple for contrast */
  color: #ffffff;
}

html[data-theme="dark"] .confirm-modal-icon.info {
  background: rgba(0, 122, 255, 0.08);
  color: #9ad1ff;
}

html[data-theme="dark"] .confirm-modal-icon.success {
  background: rgba(52, 199, 89, 0.08);
  color: #7ee38f;
}

html[data-theme="dark"] .btn-modal-secondary {
  background: #2c2c2e;
  color: #ffffff;
}

html[data-theme="dark"] .btn-modal-secondary:hover:not(:disabled) {
  background: #353537;
}

html[data-theme="dark"] .btn-modal-primary {
  /* keep primary variants but ensure text contrast */
  color: #ffffff;
}

html[data-theme="dark"] .loading-spinner {
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-top-color: #ffffff;
}

</style>
