/**
 * useConfirm - Composable สำหรับแสดง Confirm Dialog
 * 
 * วิธีใช้งาน:
 * 
 * 1. Import และ setup:
 *    import { useConfirm } from '@/composables/useConfirm';
 *    const { confirm, confirmDelete, confirmAction, ConfirmModalComponent, confirmState } = useConfirm();
 * 
 * 2. ใส่ component ใน template:
 *    <ConfirmModalComponent />
 * 
 * 3. เรียกใช้งาน:
 *    // Basic confirm
 *    const result = await confirm({
 *      title: 'ยืนยัน',
 *      message: 'ต้องการดำเนินการใช่ไหม?'
 *    });
 *    if (result) { ... }
 * 
 *    // Delete confirm (shortcut)
 *    const result = await confirmDelete('ชื่อรายการ');
 *    if (result) { ... }
 * 
 *    // Action with loading state
 *    await confirmAction({
 *      title: 'ลบรายการ',
 *      message: 'ต้องการลบ "xxx" ใช่ไหม?',
 *      onConfirm: async () => {
 *        await api.delete(...);
 *      }
 *    });
 */

import { ref, h, defineComponent } from 'vue';
import ConfirmModal from '@/components/ConfirmModal.vue';

export function useConfirm() {
  const confirmState = ref({
    isOpen: false,
    title: 'ยืนยัน',
    message: 'คุณต้องการดำเนินการนี้ใช่หรือไม่?',
    variant: 'danger',
    icon: '',
    confirmText: 'ยืนยัน',
    cancelText: 'ยกเลิก',
    loadingText: 'กำลังดำเนินการ...',
    loading: false,
    showCancel: true,
    teleportTo: 'body',
    resolve: null
  });

  /**
   * แสดง confirm dialog
   * @param {Object} options - ตัวเลือก
   * @returns {Promise<boolean>} - true ถ้า confirm, false ถ้า cancel
   */
  const confirm = (options = {}) => {
    return new Promise((resolve) => {
      confirmState.value = {
        ...confirmState.value,
        isOpen: true,
        title: options.title || 'ยืนยัน',
        message: options.message || 'คุณต้องการดำเนินการนี้ใช่หรือไม่?',
        variant: options.variant || 'danger',
        icon: options.icon || '',
        confirmText: options.confirmText || 'ยืนยัน',
        cancelText: options.cancelText || 'ยกเลิก',
        loadingText: options.loadingText || 'กำลังดำเนินการ...',
        showCancel: options.showCancel !== false,
        loading: false,
        teleportTo: options.teleportTo !== undefined ? options.teleportTo : 'body',
        resolve
      };
    });
  };

  /**
   * Shortcut สำหรับ confirm การลบ
   * @param {string} itemName - ชื่อรายการที่จะลบ
   * @param {Object} options - ตัวเลือกเพิ่มเติม
   */
  const confirmDelete = (itemName, options = {}) => {
    return confirm({
      title: 'ยืนยันการลบ',
      message: `คุณต้องการลบ "<strong>${itemName}</strong>" ใช่หรือไม่?`,
      variant: 'danger',
      confirmText: 'ลบ',
      cancelText: 'ยกเลิก',
      loadingText: 'กำลังลบ...',
      ...options
    });
  };

  /**
   * Confirm พร้อม loading state และ auto-close
   * @param {Object} options - ตัวเลือก + onConfirm callback
   */
  const confirmAction = async (options = {}) => {
    const { onConfirm, onCancel, ...confirmOptions } = options;
    
    return new Promise((resolve) => {
      confirmState.value = {
        ...confirmState.value,
        isOpen: true,
        title: confirmOptions.title || 'ยืนยัน',
        message: confirmOptions.message || 'คุณต้องการดำเนินการนี้ใช่หรือไม่?',
        variant: confirmOptions.variant || 'danger',
        icon: confirmOptions.icon || '',
        confirmText: confirmOptions.confirmText || 'ยืนยัน',
        cancelText: confirmOptions.cancelText || 'ยกเลิก',
        loadingText: confirmOptions.loadingText || 'กำลังดำเนินการ...',
        showCancel: confirmOptions.showCancel !== false,
        loading: false,
        teleportTo: confirmOptions.teleportTo !== undefined ? confirmOptions.teleportTo : 'body',
        resolve: async (confirmed) => {
          if (confirmed && onConfirm) {
            confirmState.value.loading = true;
            try {
              await onConfirm();
              confirmState.value.isOpen = false;
              resolve(true);
            } catch (err) {
              confirmState.value.loading = false;
              throw err;
            }
          } else {
            if (onCancel) await onCancel();
            confirmState.value.isOpen = false;
            resolve(false);
          }
        }
      };
    });
  };

  /**
   * Alert dialog (no cancel button)
   */
  const alert = (options = {}) => {
    return confirm({
      title: options.title || 'แจ้งเตือน',
      message: options.message || '',
      variant: options.variant || 'info',
      confirmText: options.confirmText || 'ตกลง',
      showCancel: false,
      ...options
    });
  };

  // Handle confirm
  const handleConfirm = () => {
    if (confirmState.value.resolve) {
      confirmState.value.resolve(true);
      // Don't close here if using confirmAction (it handles closing)
      if (!confirmState.value.loading) {
        confirmState.value.isOpen = false;
      }
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (confirmState.value.resolve) {
      confirmState.value.resolve(false);
    }
    confirmState.value.isOpen = false;
  };

  // Component wrapper for easy use in templates
  const ConfirmModalComponent = defineComponent({
    name: 'ConfirmModalWrapper',
    setup() {
      return () => h(ConfirmModal, {
        isOpen: confirmState.value.isOpen,
        title: confirmState.value.title,
        message: confirmState.value.message,
        variant: confirmState.value.variant,
        icon: confirmState.value.icon,
        confirmText: confirmState.value.confirmText,
        cancelText: confirmState.value.cancelText,
        loadingText: confirmState.value.loadingText,
        loading: confirmState.value.loading,
        showCancel: confirmState.value.showCancel,
        teleportTo: confirmState.value.teleportTo,
        onConfirm: handleConfirm,
        onCancel: handleCancel,
        'onUpdate:isOpen': (val) => {
          confirmState.value.isOpen = val;
        }
      });
    }
  });

  return {
    confirm,
    confirmDelete,
    confirmAction,
    alert,
    confirmState,
    ConfirmModalComponent,
    handleConfirm,
    handleCancel
  };
}

export default useConfirm;
