<template>
  <div class="overflow-hidden">
    <div class="bg-c px-xl-c pt-xl-c vh-100 overflow-hidden justify-content-center align-items-center row">
      <div class="col-xl-12 col-xxl-8">
        <div class="card-c px-5 pe-xl-5 row rounded-top-0 overflow-hidden rounded-top-5 justify-content-center align-items-lg-center bg-light vh-100">
          <div class="col-lg-6 col-xl-6 col-xl-4 pt-4 pt-lg-0" data-aos="zoom-in">
            <div class="logo-section d-flex justify-content-center align-items-center mb-lg-5 pb-lg-5">
              <img src="@/assets/logo.png" alt="Phetchabun Rajabhat University Logo" style="width: 20vh;">
            </div>
          </div>
          <div class="col-lg-6 col-xl-6 pe-xl-5">
            <form @submit.prevent="handleResetPassword" class="needs-validation" novalidate>
                <div class="">
                    <header class="fs-1 fw-bold mb-3 text-center text-lg-start">
                        Reset your password
                    </header>
                    <p class="text-center text-lg-start mb-4">Enter your new password below:</p>
                    
                    <div class="mb-3">
                        <label for="newPassword" class="form-label">New Password</label>
                        <input type="password" id="newPassword" v-model="newPassword" class="form-control" required>
                        <div class="invalid-feedback">
                            Please enter your new password.
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <label for="confirmPassword" class="form-label">Confirm New Password</label>
                        <input type="password" id="confirmPassword" v-model="confirmPassword" class="form-control" required>
                        <div class="invalid-feedback">
                            Please confirm your new password.
                        </div>
                        <div v-if="passwordsMismatch" class="text-danger mt-2">
                            Passwords do not match.
                        </div>
                    </div>
                    
                    <div class="col-12 col-lg-auto mx-auto mx-lg-0 d-flex justify-content-center justify-content-lg-start">
                        <button type="submit" class="btn btn-primary rounded-3 fw-bold px-4 py-3 mt-3 fs-5" :disabled="isResetting">
                            <span v-if="isResetting" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                            <span role="status">{{ isResetting ? 'Resetting...' : 'Reset Password' }}</span>
                        </button>
                    </div>
                </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, getCurrentInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const { appContext } = getCurrentInstance();
const { $axios, $swal } = appContext.config.globalProperties;

const route = useRoute();
const router = useRouter();

const token = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const isResetting = ref(false);

const passwordsMismatch = computed(() => newPassword.value !== confirmPassword.value && confirmPassword.value !== '');

const handleResetPassword = async () => {
    // Basic form validation
    const form = document.querySelector('.needs-validation');
    form.classList.add('was-validated');

    if (!form.checkValidity() || passwordsMismatch.value) {
        return;
    }

    isResetting.value = true;
    try {
        await $axios.post('/resetpassword', {
            token: token.value,
            newPassword: newPassword.value
        });
        
        $swal.fire({
            icon: 'success',
            title: 'Password Reset!',
            text: 'Your password has been successfully reset. Please log in with your new password.',
            confirmButtonText: 'Go to Login'
        }).then(() => {
            router.push('/login');
        });
    } catch (error) {
        $swal.fire({
            icon: 'error',
            title: 'Reset Failed',
            text: error.response?.data?.message || 'Failed to reset password. The link might be invalid or expired.'
        });
    } finally {
        isResetting.value = false;
    }
};

onMounted(() => {
    token.value = route.params.token;
    if (!token.value) {
        $swal.fire({
            icon: 'error',
            title: 'Invalid Link',
            text: 'The password reset link is missing a token. Please try again from the "Forgot Password" page.'
        }).then(() => {
            router.replace('/forgotpassword');
        });
    }
});
</script>

<style scoped>
/* Add any component-specific styles here if needed */
</style>
