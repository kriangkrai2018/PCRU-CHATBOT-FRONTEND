/**
 * useAppleToast.js - Apple-style toast notifications (no SweetAlert)
 * Minimal, elegant, auto-dismiss toasts positioned at top-right (iOS style)
 */

import { ref } from 'vue';

// Global shared state - all instances use the same toasts array
const toasts = ref([]);
let toastId = 0;

// Export toasts globally so components can share the same ref
export const getToasts = () => toasts;

export function useAppleToast() {
  /**
   * Show a toast notification
   * @param {string} message - Toast message
   * @param {string} type - 'success' | 'error' | 'warning' | 'info' (default: 'info')
   * @param {number} duration - Auto-dismiss duration in ms (default: 3000, set 0 to disable auto-dismiss)
   */
  const show = (message, type = 'info', duration = 3000) => {
    const id = ++toastId;
    const toast = {
      id,
      message,
      type,
      visible: true,
      isClosing: false
    };

    toasts.value.push(toast);

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }

    return id;
  };

  /**
   * Success toast
   */
  const success = (message, duration = 2500) => {
    return show(message, 'success', duration);
  };

  /**
   * Error toast
   */
  const error = (message, duration = 3500) => {
    return show(message, 'error', duration);
  };

  /**
   * Warning toast
   */
  const warning = (message, duration = 3000) => {
    return show(message, 'warning', duration);
  };

  /**
   * Info toast
   */
  const info = (message, duration = 3000) => {
    return show(message, 'info', duration);
  };

  /**
   * Dismiss a specific toast
   */
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

  /**
   * Dismiss all toasts
   */
  const dismissAll = () => {
    toasts.value.forEach(t => (t.isClosing = true));
    setTimeout(() => {
      toasts.value = [];
    }, 300);
  };

  return {
    toasts,
    show,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll
  };
}
