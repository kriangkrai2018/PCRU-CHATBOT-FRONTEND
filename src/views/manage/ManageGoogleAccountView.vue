<template>
  <div class="dashboard-container">
    <!-- Mobile Sidebar Backdrop -->
    <div v-if="isMobileSidebarOpen" class="mobile-sidebar-backdrop" @click="toggleSidebar" aria-hidden="true"></div>
    
    <!-- Sidebar -->
    <Sidebar :userType="userType" :userInfoObject="userInfoObject" />

    <!-- Main Content -->
    <main class="main-content">
      <!-- Mobile Sidebar Toggle -->
      <button v-if="isMobile" class="mobile-sidebar-toggle mobile-inline-toggle" @click.stop="toggleSidebar" :aria-label="isMobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'">
        <i class="bi bi-list"></i>
      </button>
      
      <div class="container-fluid">
        <div class="manage-google-account">
          <div class="page-header mb-4">
            <h4 class="mb-1">
              <i class="bi bi-google me-2"></i>
              จัดการบัญชี Google
            </h4>
            <p class="text-muted mb-0">ผูกหรือยกเลิกการผูกบัญชี Google กับบัญชีของคุณ</p>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">กำลังโหลด...</span>
            </div>
            <p class="text-muted mt-3">กำลังโหลดข้อมูล...</p>
          </div>

          <!-- Content -->
          <div v-else class="google-account-content">
      <!-- Already Linked -->
      <div v-if="isLinked" class="linked-card">
        <div class="card">
          <div class="card-body p-4">
            <div class="d-flex align-items-center mb-4">
              <div class="status-badge status-linked me-2">
                <i class="bi bi-check-circle-fill"></i>
              </div>
              <span class="fw-semibold text-success">บัญชี Google ผูกเรียบร้อยแล้ว</span>
            </div>

            <div class="google-info-row">
              <img :src="googleData.googlePicture" alt="Google Profile" class="google-avatar" v-if="googleData.googlePicture">
              <div class="google-avatar-placeholder" v-else>
                <i class="bi bi-person-fill"></i>
              </div>
              <div class="google-info-details">
                <h5 class="mb-1">{{ googleData.googleName }}</h5>
                <p class="text-muted mb-1">{{ googleData.googleEmail }}</p>
                <small class="text-muted">
                  <i class="bi bi-calendar3 me-1"></i>
                  ผูกเมื่อ {{ formatDate(googleData.linkedAt) }}
                </small>
              </div>
            </div>

            <hr class="my-4">

            <div class="d-flex justify-content-end">
              <button class="btn btn-outline-danger" @click="confirmUnlink" :disabled="isUnlinking">
                <span v-if="isUnlinking" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-x-circle me-2"></i>
                ยกเลิกการผูกบัญชี
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Not Linked -->
      <div v-else class="not-linked-card">
        <div class="card">
          <div class="card-body p-4">
            <div class="d-flex align-items-center mb-4">
              <div class="status-badge status-not-linked me-2">
                <i class="bi bi-exclamation-circle"></i>
              </div>
              <span class="fw-semibold text-muted">ยังไม่ได้ผูกบัญชี Google</span>
            </div>

            <div class="not-linked-info mb-4">
              <p class="text-muted mb-3">
                ผูกบัญชี Google เพื่อเข้าสู่ระบบได้ง่ายและรวดเร็วขึ้น โดยไม่ต้องจำ ID และ Password
              </p>
              <ul class="benefits-list">
                <li><i class="bi bi-check2 text-success me-2"></i>เข้าสู่ระบบด้วยคลิกเดียว</li>
                <li><i class="bi bi-check2 text-success me-2"></i>ปลอดภัยด้วยการยืนยันตัวตนจาก Google</li>
                <li><i class="bi bi-check2 text-success me-2"></i>ไม่ต้องจำรหัสผ่าน</li>
              </ul>
            </div>

            <div class="d-grid">
              <button class="btn btn-google py-3" @click="handleLinkGoogle" :disabled="isLinking">
                <span v-if="isLinking" class="spinner-border spinner-border-sm me-2"></span>
                <svg v-else class="google-icon me-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                ผูกบัญชี Google
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Box -->
      <div class="info-box mt-4">
        <div class="card bg-light border-0">
          <div class="card-body">
            <h6 class="mb-3">
              <i class="bi bi-info-circle text-primary me-2"></i>
              หมายเหตุ
            </h6>
            <ul class="mb-0 text-muted small">
              <li>บัญชี Google หนึ่งสามารถผูกกับบัญชีผู้ใช้ได้เพียงหนึ่งบัญชีเท่านั้น</li>
              <li>หากบัญชี Google ถูกผูกกับบัญชีอื่นอยู่แล้ว จะไม่สามารถผูกซ้ำได้</li>
              <li>คุณยังสามารถLog in withID และ Password ได้ตามปกติ</li>
              <li>การยกเลิกการผูกบัญชีจะไม่ลบข้อมูลใดๆ ในระบบ</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
        </div>
      </div>
    </main>
    
    <!-- Confirm Modal Component -->
    <ConfirmModalComponent />
  </div>
</template>

<style scoped>
@import '@/assets/dashboard-styles.css';
@import '@/assets/sidebar.css';

.dashboard-container {
  display: flex;
  width: 100%;
  min-height: 100vh;
}

.main-content {
  flex-grow: 1;
  background-color: #f5f5f7;
  overflow-x: hidden;
  padding: 0.5rem !important;
}

.mobile-sidebar-toggle {
  display: none;
  background: #fff;
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  padding: 0.6rem 0.8rem;
  font-size: 1.4rem;
  line-height: 1;
  margin-left: 1rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
  color: #007AFF;
}

.mobile-sidebar-backdrop {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

@media (max-width: 768px) {
  .mobile-sidebar-toggle {
    display: flex !important;
    align-items: center;
    justify-content: center;
  }

  .mobile-sidebar-backdrop {
    display: block;
  }

  .dashboard-container {
    grid-template-columns: 1fr;
  }

  .main-content {
    grid-column: 1 / -1;
  }
}

.manage-google-account {
  max-width: 100%;
  margin: 0;
  padding: 20px;
}

.page-header h4 {
  color: #1d1d1f;
  font-weight: 600;
}

.status-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-linked {
  background-color: #d4edda;
  color: #28a745;
}

.status-not-linked {
  background-color: #f8f9fa;
  color: #6c757d;
}

.google-info-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
}

.google-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}

.google-avatar-placeholder {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #adb5bd;
  font-size: 32px;
}

.google-info-details h5 {
  font-weight: 600;
  color: #1d1d1f;
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.benefits-list li {
  padding: 8px 0;
  color: #495057;
}

/* Google Button */
.btn-google {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border: 2px solid #dadce0;
  color: #3c4043;
  font-weight: 500;
  font-size: 15px;
  transition: all 0.2s ease;
}

.btn-google:hover {
  background-color: #f8f9fa;
  border-color: #c1c3c5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-google:active {
  background-color: #e8e9ea;
}

.btn-google:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-google .google-icon {
  flex-shrink: 0;
}

.card {
  border-radius: 16px;
  border: 1px solid #e5e5e5;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.info-box .card {
  border-radius: 12px;
}

.info-box ul li {
  margin-bottom: 4px;
}
</style>

<script setup>
import { ref, onMounted, onUnmounted, getCurrentInstance, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Sidebar from '@/components/Sidebar.vue';
import { bindSidebarResize, isSidebarCollapsed, isMobileSidebarOpen } from '@/stores/sidebarState';
import { useConfirm } from '@/composables/useConfirm';

const route = useRoute();
const router = useRouter();

const { appContext } = getCurrentInstance();
const { $axios, $swal } = appContext.config.globalProperties;

// Confirm Modal
const { confirmAction, ConfirmModalComponent } = useConfirm();

// User state
const userType = ref('');
const userInfoObject = ref({});

// Sidebar state
const isMobile = ref(window.innerWidth <= 768);
let unbindSidebarResize = null;
let resizeHandler = null;
let _savedSidebarCollapsed = null;

const isLoading = ref(true);
const isLinked = ref(false);
const isLinking = ref(false);
const isUnlinking = ref(false);
const googleData = ref({});

function toggleSidebar() {
  if (isMobile.value) {
    isMobileSidebarOpen.value = !isMobileSidebarOpen.value;
    if (isMobileSidebarOpen.value) {
      if (_savedSidebarCollapsed === null) {
        _savedSidebarCollapsed = isSidebarCollapsed.value;
      }
      isSidebarCollapsed.value = false;
      document.body.classList.add('sidebar-open', 'sidebar-mobile-expanded');
    } else {
      document.body.classList.remove('sidebar-open', 'sidebar-mobile-expanded');
      if (_savedSidebarCollapsed !== null) {
        isSidebarCollapsed.value = _savedSidebarCollapsed;
        _savedSidebarCollapsed = null;
      }
    }
  }
}

onMounted(async () => {
  unbindSidebarResize = bindSidebarResize();

  const token = localStorage.getItem('userToken');
  const type = localStorage.getItem('userType');
  const userInfoString = localStorage.getItem('userInfo');

  if (!token) {
    router.replace({ name: 'login' });
    return;
  }

  if (type) userType.value = type;
  if (userInfoString) {
    try {
      userInfoObject.value = JSON.parse(userInfoString);
    } catch (e) {
      console.error(e);
    }
  }

  // Mobile resize listener
  resizeHandler = () => {
    const newIsMobile = window.innerWidth <= 768;
    if (newIsMobile !== isMobile.value) {
      isMobile.value = newIsMobile;
      if (!newIsMobile && isMobileSidebarOpen.value) {
        isMobileSidebarOpen.value = false;
        document.body.classList.remove('sidebar-open', 'sidebar-mobile-expanded');
        isSidebarCollapsed.value = _savedSidebarCollapsed ?? isSidebarCollapsed.value;
        _savedSidebarCollapsed = null;
      }
    }
  };
  window.addEventListener('resize', resizeHandler);

  // ตรวจสอบว่ามีการผูกบัญชีสำเร็จหรือไม่
  if (route.query.linked === 'success') {
    $swal.fire({
      toast: true,
      icon: 'success',
      title: 'ผูกบัญชี Google สำเร็จ!',
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
    // ลบ query parameter ออก
    router.replace({ query: {} });
  }
  
  await fetchGoogleLinkStatus();
});

onUnmounted(() => {
  if (typeof unbindSidebarResize === 'function') unbindSidebarResize();
  if (resizeHandler) window.removeEventListener('resize', resizeHandler);
  isMobileSidebarOpen.value = false;
  document.body.classList.remove('sidebar-open', 'sidebar-mobile-expanded');
});

async function fetchGoogleLinkStatus() {
  isLoading.value = true;
  try {
    const response = await $axios.get('/auth/google/status');
    if (response.data.success) {
      isLinked.value = response.data.linked;
      if (response.data.linked) {
        googleData.value = {
          googleEmail: response.data.googleEmail,
          googleName: response.data.googleName,
          googlePicture: response.data.googlePicture,
          linkedAt: response.data.linkedAt
        };
      }
    }
  } catch (error) {
    console.error('Error fetching Google link status:', error);
    $swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถดึงข้อมูลสถานะการผูกบัญชีได้'
    });
  } finally {
    isLoading.value = false;
  }
}

function handleLinkGoogle() {
  isLinking.value = true;
  
  // ดึง token จาก localStorage
  const token = localStorage.getItem('userToken');
  
  // Redirect to Google OAuth with token as state
  $axios.get('/auth/google/url', {
    params: { state: token }
  })
    .then(response => {
      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('ไม่สามารถสร้าง URL ได้');
      }
    })
    .catch(error => {
      console.error('Error getting Google auth URL:', error);
      $swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเชื่อมต่อกับ Google ได้'
      });
      isLinking.value = false;
    });
}

async function confirmUnlink() {
  try {
    await confirmAction({
      title: 'ยืนยันการยกเลิก',
      message: 'คุณต้องการยกเลิกการผูกบัญชี Google หรือไม่?',
      variant: 'danger',
      confirmText: 'ยกเลิกการผูก',
      loadingText: 'กำลังยกเลิก...',
      onConfirm: async () => {
        await unlinkGoogle();
      }
    });
  } catch (err) {
    // User cancelled
  }
}

async function unlinkGoogle() {
  isUnlinking.value = true;
  try {
    const response = await $axios.delete('/auth/google/unlink');
    if (response.data.success) {
      isLinked.value = false;
      googleData.value = {};
      $swal.fire({
        toast: true,
        icon: 'success',
        title: 'ยกเลิกการผูกบัญชีเรียบร้อยแล้ว',
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('Error unlinking Google:', error);
    $swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: error.response?.data?.message || 'ไม่สามารถยกเลิกการผูกบัญชีได้'
    });
  } finally {
    isUnlinking.value = false;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
</script>
