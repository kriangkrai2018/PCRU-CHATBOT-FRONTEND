<template>
  <form ref="passwordForm" @submit.prevent="handleUpdatePassword" class="needs-validation" novalidate>
    <div class="">
      <header class="fs-1 fw-bold mb-3 text-center text-lg-start">
        Set New Password
      </header>
      <p class="text-center text-lg-start mb-4">
        Please create a new password for your account.
      </p>

      <div class="mb-3 position-relative pt-2 col-lg-10">
        <input 
          ref="passwordInput" 
          :type="passwordFieldType" 
          name="password" 
          class="form-control border-dark border-2 rounded-3 pt-3 pe-5" 
          id="floatingPassword" 
          placeholder="" 
          v-model="password" 
          required 
          pattern="(?=.*\d)(?=.*[A-Z]).{8,}"
          @input="validatePasswordRealtime"
        >
        
        <label class="fw-bold position-absolute top-0 ms-2 bg-light rounded-3 px-2 mb-0" for="floatingPassword">New Password</label>
        
        <button 
          type="button" 
          @click="togglePasswordVisibility"
          class="btn btn-sm btn-link text-muted position-absolute end-0 top-0 mt-3 pt-1 me-2"
          v-show="password.length > 0"
        >
          <span v-if="passwordFieldType === 'password'"><i class="bi bi-eye fs-5"></i></span>
          <span v-else><i class="bi bi-eye-slash fs-5"></i></span>
        </button>
      </div>

      <div class="mb-4 col-lg-10">
        <p class="mb-1 text-center text-lg-start">Your password must have:</p>
        <ul class="list-unstyled small">
          <li :class="{ 'text-success': validations.has8Chars }">
            <i class="bi me-1" :class="validations.has8Chars ? 'bi-check-circle-fill' : 'bi-circle'"></i>
            At least 8 characters
          </li>
          <li :class="{ 'text-success': validations.hasUppercase }">
            <i class="bi me-1" :class="validations.hasUppercase ? 'bi-check-circle-fill' : 'bi-circle'"></i>
            At least one uppercase letter (A-Z)
          </li>
          <li :class="{ 'text-success': validations.hasNumber }">
            <i class="bi me-1" :class="validations.hasNumber ? 'bi-check-circle-fill' : 'bi-circle'"></i>
            At least one number (0-9)
          </li>
        </ul>
      </div>

      <div class="d-grid gap-2 mb-5 col-12 col-lg-8 mx-auto mx-lg-0">
        <button type="submit" class="btn rounded-3 fw-bold py-3 px-5 mt-2 fs-5 text-nowrap" style="background-color: #E3E3E3;" :disabled="isSubmitting || !isFormValid">
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
          <span role="status">{{ isSubmitting ? 'Updating...' : 'Update Password' }}</span>
        </button>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, computed, getCurrentInstance, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// ดึง Global Properties ($axios, $swal) มาใช้งาน
const { appContext } = getCurrentInstance();
const { $axios, $swal } = appContext.config.globalProperties;

const router = useRouter();
const password = ref('');
const passwordForm = ref(null);
const passwordInput = ref(null);
const isSubmitting = ref(false);
const passwordFieldType = ref('password');

const validations = reactive({
  has8Chars: false,
  hasUppercase: false,
  hasNumber: false,
});

const isFormValid = computed(() => {
  return validations.has8Chars && validations.hasUppercase && validations.hasNumber;
});

const validatePasswordRealtime = () => {
  validations.has8Chars = password.value.length >= 8;
  validations.hasUppercase = /[A-Z]/.test(password.value);
  validations.hasNumber = /[0-9]/.test(password.value);
};

const togglePasswordVisibility = () => {
  passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password';
};

const handleUpdatePassword = async () => {
  if (!isFormValid.value) {
    passwordInput.value.classList.add('is-invalid');
    return;
  }
  passwordInput.value.classList.remove('is-invalid');
  isSubmitting.value = true;

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const email = urlParams.get('email');

  if (!token) {
    $swal.fire({
      toast: true,
      icon: 'error',
      title: 'Invalid Link',
      text: 'The password reset link is invalid or has expired.',
      position: 'bottom-end', // เปลี่ยนเป็น 'bottom-end'
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true // คงไว้
    });
    isSubmitting.value = false;
    router.replace('/forgotpassword');
    return;
  }

  try {
    const payload = { token: token, email, newPassword: password.value };
    const response = await $axios.post('/setnewpassword', payload);

    if (response.data && response.data.success === true) {
        $swal.fire({
            toast: true,
            icon: 'success',
            title: 'Password Updated!',
            text: 'You can now log in with your new password.',
            position: 'bottom-end', // เปลี่ยนเป็น 'bottom-end'
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true // คงไว้
        });
        router.push({ name: 'passwordupdated' });
    } else {
        $swal.fire({
            toast: true,
            icon: 'error',
            title: 'Update Failed',
            text: response.data?.message || 'An unexpected error occurred. Please try again.',
            position: 'bottom-end', // เปลี่ยนเป็น 'bottom-end'
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true // คงไว้
        });
    }
  } catch (error) {
      console.error('API Error during password update:', error);
      $swal.fire({
          toast: true,
          icon: 'error',
          title: 'Update Failed',
          text: error.response?.data?.message || 'Could not connect to the server. Please try again.',
          position: 'bottom-end', // เปลี่ยนเป็น 'bottom-end'
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true // คงไว้
      });
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const email = urlParams.get('email');

  if (!token || !email) {
    $swal.fire({
      toast: true,
      icon: 'error',
      title: 'Invalid Link',
      text: 'The password reset link is incomplete or invalid.',
      position: 'bottom-end', // เปลี่ยนเป็น 'bottom-end'
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true // คงไว้
    });
    router.replace('/forgotpassword');
    return;
  }

  try {
    const response = await $axios.post('/validateresettoken', { token, email });

    if (response.data.success === true) {
      console.log('Token is valid, user can set a new password.');
    } else {
      throw new Error(response.data.message || 'Token validation failed.');
    }
  } catch (error) {
    $swal.fire({
      toast: true,
      icon: 'error',
      title: 'Invalid or Expired Link',
      text: error.response?.data?.message || 'This password reset link is no longer valid.',
      position: 'bottom-end', // เปลี่ยนเป็น 'bottom-end'
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true // คงไว้
    });
    router.replace('/forgotpassword');
  }
});
</script>

<style scoped>
  @import '@/assets/main.css';
  .list-unstyled li {
    transition: color 0.3s ease;
  }
</style>