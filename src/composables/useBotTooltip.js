/**
 * useBotTooltip.js - Bot Speech Bubble Tooltip (ข้อความแบบ Bot พูด)
 * แสดง tooltip เหมือน bot กำลังพิมพ์ข้อความ พร้อม avatar และ typing effect
 * สามารถใช้ได้ทุกหน้าทุก component
 */

import { ref } from 'vue';

// Global shared state - all instances use the same tooltips array
const tooltips = ref([]);
let tooltipId = 0;

// Export tooltips globally so components can share the same ref
export const getBotTooltips = () => tooltips;

export function useBotTooltip() {
  /**
   * Show a bot speech bubble tooltip
   * @param {string} message - ข้อความที่ bot จะพูด
   * @param {Object} options - ตัวเลือกเพิ่มเติม
   * @param {string} options.type - 'info' | 'success' | 'warning' | 'error' | 'cute' (default: 'info')
   * @param {number} options.duration - ระยะเวลาแสดง (ms) (default: 4000, set 0 to disable auto-dismiss)
   * @param {boolean} options.typing - แสดง typing effect ก่อนข้อความ (default: true)
   * @param {number} options.typingDuration - ระยะเวลา typing effect (ms) (default: 800)
   * @param {string} options.position - ตำแหน่ง 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'center' (default: 'bottom-left')
   */
  const show = (message, options = {}) => {
    const {
      type = 'info',
      duration = 4000,
      typing = true,
      typingDuration = 800,
      position = 'bottom-left'
    } = options;

    const id = ++tooltipId;
    const tooltip = {
      id,
      message,
      type,
      position,
      visible: true,
      isClosing: false,
      isTyping: typing,
      showMessage: !typing
    };

    tooltips.value.push(tooltip);

    // If typing effect is enabled, show message after typing duration
    if (typing) {
      setTimeout(() => {
        const t = tooltips.value.find(x => x.id === id);
        if (t) {
          t.isTyping = false;
          t.showMessage = true;
        }
      }, typingDuration);
    }

    // Auto-dismiss after duration (counted from when message appears)
    if (duration > 0) {
      const totalDelay = typing ? typingDuration + duration : duration;
      setTimeout(() => {
        dismiss(id);
      }, totalDelay);
    }

    return id;
  };

  /**
   * Bot พูดข้อความน่ารัก (สำหรับ feedback)
   */
  const cute = (message, duration = 4000) => {
    return show(message, { type: 'cute', duration });
  };

  /**
   * Bot พูดข้อความขอบคุณ
   */
  const thanks = (message, duration = 3500) => {
    return show(message, { type: 'success', duration });
  };

  /**
   * Bot พูดข้อความเตือน
   */
  const warn = (message, duration = 4000) => {
    return show(message, { type: 'warning', duration });
  };

  /**
   * Bot พูดข้อความแจ้งเตือน
   */
  const info = (message, duration = 4000) => {
    return show(message, { type: 'info', duration });
  };

  /**
   * Bot พูดข้อความ error
   */
  const error = (message, duration = 5000) => {
    return show(message, { type: 'error', duration });
  };

  /**
   * Dismiss a specific tooltip
   */
  const dismiss = (id) => {
    const tooltip = tooltips.value.find(t => t.id === id);
    if (tooltip) {
      tooltip.isClosing = true;
      // Remove from list after animation completes
      setTimeout(() => {
        tooltips.value = tooltips.value.filter(t => t.id !== id);
      }, 400);
    }
  };

  /**
   * Dismiss all tooltips
   */
  const dismissAll = () => {
    tooltips.value.forEach(t => (t.isClosing = true));
    setTimeout(() => {
      tooltips.value = [];
    }, 400);
  };

  return {
    tooltips,
    show,
    cute,
    thanks,
    warn,
    info,
    error,
    dismiss,
    dismissAll
  };
}
