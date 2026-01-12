<template>
  <div class="google-callback-wrapper">
    <div class="callback-container">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">กำลังดำเนินการ...</span>
        </div>
        <p class="text-muted">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="text-center">
        <div class="error-icon mb-3">
          <i class="bi bi-exclamation-circle text-danger" style="font-size: 48px;"></i>
        </div>
        <h4 class="text-danger mb-3">เกิดข้อผิดพลาด</h4>
        <p class="text-muted mb-4">{{ errorMessage }}</p>
        <router-link to="/login" class="btn btn-primary">กลับไปหน้าล็อกอิน</router-link>
      </div>

      <!-- Need Link Account State -->
      <div v-else-if="needLink" class="link-account-form">
        <div class="google-info-card mb-4">
          <img :src="googleUser.picture" alt="Google Profile" class="google-avatar" v-if="googleUser.picture">
          <div class="google-details">
            <h5 class="mb-1">{{ googleUser.name }}</h5>
            <p class="text-muted mb-0">{{ googleUser.email }}</p>
          </div>
        </div>

        <div class="alert alert-info mb-4">
          <i class="bi bi-info-circle me-2"></i>
          บัญชี Google นี้ยังไม่ได้ผูกกับบัญชีในระบบ กรุณาระบุ ID และ Password เพื่อผูกบัญชี
        </div>

        <form @submit.prevent="handleLinkAccount">
          <div class="mb-3 position-relative pt-2">
            <input type="number" class="form-control border-dark border-2 rounded-3 pt-3" 
                   v-model="linkId" required placeholder="">
            <label class="fw-bold position-absolute top-0 ms-2 bg-white rounded-3 px-2 mb-0">ID</label>
          </div>

          <div class="mb-3 position-relative pt-2">
            <input :type="passwordVisible ? 'text' : 'password'" 
                   class="form-control border-dark border-2 rounded-3 pt-3 pe-5" 
                   v-model="linkPassword" required minlength="8" placeholder="">
            <label class="fw-bold position-absolute top-0 ms-2 bg-white rounded-3 px-2 mb-0">Password</label>
            <button type="button" @click="passwordVisible = !passwordVisible"
                    class="btn btn-sm btn-link text-muted position-absolute end-0 top-0 mt-3 pt-1 me-2">
              <i class="bi" :class="passwordVisible ? 'bi-eye-slash' : 'bi-eye'" style="font-size: 1.25rem;"></i>
            </button>
          </div>

          <div class="d-grid gap-2 mt-4">
            <button type="submit" class="btn btn-primary py-3 rounded-3" :disabled="isLinking">
              <span v-if="isLinking" class="spinner-border spinner-border-sm me-2"></span>
              {{ isLinking ? 'กำลังผูกบัญชี...' : 'ผูกบัญชีและเข้าสู่ระบบ' }}
            </button>
            <router-link to="/login" class="btn btn-outline-secondary py-2 rounded-3">
              ยกเลิก
            </router-link>
          </div>
        </form>
      </div>

      <!-- Success (should redirect) -->
      <div v-else class="text-center">
        <div class="success-icon mb-3">
          <i class="bi bi-check-circle text-success" style="font-size: 48px;"></i>
        </div>
        <h4 class="text-success mb-3">เข้าสู่ระบบสำเร็จ</h4>
        <p class="text-muted">กำลังเปลี่ยนหน้า...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.google-callback-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #f5f5f7;
}

.callback-container {
  max-width: 420px;
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.google-info-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
}

.google-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
}

.google-details h5 {
  font-weight: 600;
  color: #1d1d1f;
}

.google-details p {
  font-size: 14px;
}

.link-account-form h4 {
  color: #1d1d1f;
  font-weight: 600;
}

/* Hide number input spinners */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const { appContext } = getCurrentInstance();
const { $axios, $swal } = appContext.config.globalProperties;

const router = useRouter();
const route = useRoute();

const isLoading = ref(true);
const errorMessage = ref('');
const needLink = ref(false);
const googleUser = ref({});
const linkId = ref('');
const linkPassword = ref('');
const passwordVisible = ref(false);
const isLinking = ref(false);

onMounted(async () => {
  // Parse query parameters
  const { token, usertype, userInfo, needLink: needLinkParam, googleData, error } = route.query;

  if (error) {
    isLoading.value = false;
    errorMessage.value = decodeURIComponent(error);
    return;
  }

  // If needLink is true, show the link account form
  if (needLinkParam === 'true' && googleData) {
    try {
      googleUser.value = JSON.parse(decodeURIComponent(googleData));
      needLink.value = true;
      isLoading.value = false;
      return;
    } catch (e) {
      errorMessage.value = 'ข้อมูล Google ไม่ถูกต้อง';
      isLoading.value = false;
      return;
    }
  }

  // If we have a token, login was successful
  if (token) {
    try {
      localStorage.setItem('userToken', token);
      localStorage.setItem('userType', decodeURIComponent(usertype));
      
      if (userInfo) {
        localStorage.setItem('userInfo', decodeURIComponent(userInfo));
      }

      $swal.fire({
        toast: true,
        icon: 'success',
        title: 'เข้าสู่ระบบสำเร็จ!',
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (e) {
      errorMessage.value = 'เกิดข้อผิดพลาดในการประมวลผลข้อมูล';
      isLoading.value = false;
    }
    return;
  }

  // No valid parameters
  errorMessage.value = 'ไม่พบข้อมูลการเข้าสู่ระบบ';
  isLoading.value = false;
});

async function handleLinkAccount() {
  if (!linkId.value || !linkPassword.value) {
    $swal.fire({
      icon: 'warning',
      title: 'กรุณากรอกข้อมูลให้ครบ',
      text: 'ต้องระบุ ID และ Password'
    });
    return;
  }

  isLinking.value = true;

  try {
    const response = await $axios.post('/auth/google/link-with-credentials', {
      id: linkId.value,
      password: linkPassword.value,
      googleId: googleUser.value.googleId,
      email: googleUser.value.email,
      name: googleUser.value.name,
      picture: googleUser.value.picture
    });

    if (response.data.success) {
      // Save login info
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userType', response.data.usertype);
      localStorage.setItem('userInfo', JSON.stringify(response.data.userInfo));

      $swal.fire({
        toast: true,
        icon: 'success',
        title: 'ผูกบัญชีและเข้าสู่ระบบสำเร็จ!',
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });

      router.push('/dashboard');
    } else {
      $swal.fire({
        icon: 'error',
        title: 'ไม่สามารถผูกบัญชีได้',
        text: response.data.message || 'เกิดข้อผิดพลาด'
      });
    }
  } catch (error) {
    console.error('Link account error:', error);
    $swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: error.response?.data?.message || 'ไม่สามารถผูกบัญชีได้'
    });
  } finally {
    isLinking.value = false;
  }
}
</script>
