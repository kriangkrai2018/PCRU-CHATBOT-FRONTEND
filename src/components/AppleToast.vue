<template>
  <!-- Apple-style Toast Container -->
  <div class="apple-toast-container">
    <transition-group name="toast-slide" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['apple-toast', `apple-toast-${toast.type}`, { 'is-closing': toast.isClosing }]"
      >
        <div class="toast-icon">
          <i :class="getIconClass(toast.type)"></i>
        </div>
        <div class="toast-message">{{ toast.message }}</div>
        <button class="toast-close" @click="dismiss(toast.id)">
          <i class="bi bi-x"></i>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { getToasts } from '@/composables/useAppleToast';

const toasts = getToasts();

const dismiss = (id) => {
  const toast = toasts.value.find(t => t.id === id);
  if (toast) {
    toast.isClosing = true;
    // Remove from list after animation completes
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id);
    }, 300);
  }
};

const getIconClass = (type) => {
  switch (type) {
    case 'success':
      return 'bi bi-check-circle-fill';
    case 'error':
      return 'bi bi-x-circle-fill';
    case 'warning':
      return 'bi bi-exclamation-circle-fill';
    case 'info':
    default:
      return 'bi bi-info-circle-fill';
  }
};
</script>

<style scoped>
/* Apple Toast Container (bottom-right) */
.apple-toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

/* Individual Toast */
.apple-toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  backdrop-filter: blur(30px);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  pointer-events: auto;
  animation: toastSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  min-width: 280px;
  max-width: 380px;
  border-left: 4px solid #999;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.apple-toast.is-closing {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
}

/* Success Toast */
.apple-toast-success {
  border-left-color: #34c759;
}

.apple-toast-success .toast-icon {
  color: #34c759;
}

/* Error Toast */
.apple-toast-error {
  border-left-color: #ff3b30;
}

.apple-toast-error .toast-icon {
  color: #ff3b30;
}

/* Warning Toast */
.apple-toast-warning {
  border-left-color: #ffc107;
}

.apple-toast-warning .toast-icon {
  color: #ffc107;
}

/* Info Toast */
.apple-toast-info {
  border-left-color: #007aff;
}

.apple-toast-info .toast-icon {
  color: #007aff;
}

/* Toast Icon */
.toast-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Toast Message */
.toast-message {
  font-size: 0.95rem;
  font-weight: 500;
  color: #1d1d1f;
  flex: 1;
  line-height: 1.4;
  word-break: break-word;
}

/* Toast Close Button */
.toast-close {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #86868b;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.toast-close:hover {
  color: #1d1d1f;
  transform: scale(1.1);
}

/* Animation: Slide In */
@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

/* Transition Group Animation */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-slide-move {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Responsive: Mobile */
@media (max-width: 640px) {
  .apple-toast-container {
    bottom: 16px;
    right: 16px;
    left: auto;
  }

  .apple-toast {
    min-width: auto;
    max-width: none;
  }
}

/* Dark Mode Support */
.dark .apple-toast {
  background: rgba(28, 28, 30, 0.95) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}

.dark .toast-message {
  color: #f5f5f7 !important;
}

.dark .toast-close {
  color: #98989d !important;
}

.dark .toast-close:hover {
  color: #f5f5f7 !important;
}

/* Dark Mode Toast Types */
.dark .apple-toast-success {
  border-left-color: #30d158 !important;
}

.dark .apple-toast-success .toast-icon {
  color: #30d158 !important;
}

.dark .apple-toast-error {
  border-left-color: #ff453a !important;
}

.dark .apple-toast-error .toast-icon {
  color: #ff453a !important;
}

.dark .apple-toast-warning {
  border-left-color: #ff9f0a !important;
}

.dark .apple-toast-warning .toast-icon {
  color: #ff9f0a !important;
}

.dark .apple-toast-info {
  border-left-color: #0a84ff !important;
}

.dark .apple-toast-info .toast-icon {
  color: #0a84ff !important;
}
</style>

