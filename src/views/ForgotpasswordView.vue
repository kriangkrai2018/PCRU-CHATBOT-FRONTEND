<template>
  <form ref="loginForm" @submit.prevent="handleResetPassword" class="needs-validation" novalidate>
                <div class="">
                    <header class="fs-1 fw-bold mb-4 text-center text-lg-start">
                        Forgot password
                    </header>
                    <p>Remember your password? <router-link to="/login" class="text-dark fw-bold">Login here</router-link></p>
                    
                    <div class="mb-3 position-relative pt-2 pe-xl-5">
                        <input ref="emailInput" type="email" class="form-control border-dark border-2 rounded-3 pt-3" id="floatingInput" 
                              placeholder="" v-model="email" required @input="emailInput.classList.remove('is-invalid')">
                        <label class="fw-bold position-absolute top-0 ms-2 bg-light rounded-3 px-2 mb-0" for="floatingInput">Email</label>
                        <div class="invalid-feedback">
                            {{ emailErrorMsg }}
                        </div>
                    </div>
                    
                    <div class="mb-5 col-12 col-lg-auto mx-auto mx-lg-0 d-flex justify-content-center justify-content-lg-start">
                        <button 
                            type="submit" 
                            class="btn rounded-3 fw-bold px-4 py-3 mt-4 fs-5" 
                            style="background-color: #E3E3E3;"
                            :disabled="isSubmitting">
                            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                            <span role="status">{{ isSubmitting ? 'Processing...' : 'Reset Password' }}</span>
                        </button>
                    </div>
                    
                </div>
  </form>
</template>


<script setup>
  import { ref, getCurrentInstance } from 'vue';
  import { useRouter } from 'vue-router';

  // ดึง Global Properties ($axios, $swal) มาใช้งาน
  const { appContext } = getCurrentInstance();
  const { $axios, $swal } = appContext.config.globalProperties;

  const email = ref('');
  const loginForm = ref('');
  const emailInput = ref(null);
  const router = useRouter();
  const isSubmitting = ref(false);
  const emailErrorMsg = ref('Please enter a valid email'); 
  
  async function handleResetPassword() {
      const formElement = loginForm.value;
      if (formElement.checkValidity() === false) {
          if (emailInput.value.validity.valueMissing) {
              emailErrorMsg.value = 'Please enter an email to proceed';
          } else if (emailInput.value.validity.typeMismatch) {
              emailErrorMsg.value = 'Please check the email format (must contain @ and a domain name)';
          }
          formElement.classList.add('was-validated');
          return;
      }
      formElement.classList.remove('was-validated');

      isSubmitting.value = true;
      try {
          const payload = { 
              email: email.value,
          };
          
          const response = await $axios.post('/forgotpassword', payload, { timeout: 10000 });
          const { success, maskedEmail } = response.data;
          
          if (success && maskedEmail) {
              $swal.fire({
                  toast: true,
                  icon: 'success',
                  title: 'A new reset link has been sent!',
                  position: 'bottom-end', // เปลี่ยนเป็น 'bottom-end'
                  showConfirmButton: false,
                  timer: 3000,
                  timerProgressBar: true // คงไว้
              });
              localStorage.setItem('resetFlowActive', 'true');
              localStorage.setItem('resetEmail', email.value);
              localStorage.setItem('resendTimestamp', Date.now().toString());
              router.push({ path: '/checkemail' });
              
          } else {
              $swal.fire({
                icon: 'error',
                title: 'Request Failed',
                text: response.data.message || 'An error occurred while processing the request.',
                position: 'bottom-end', // เปลี่ยนเป็น 'bottom-end'
                timerProgressBar: true // คงไว้
              });
          }
          
      } catch (error) {
          console.error('Forgot Password API Error:', error);
          if (error.response) console.error('Server Response:', error.response.data);
          if (error.response?.data?.stack) console.error('Server Stack:', error.response.data.stack);
          $swal.fire({
            icon: 'error',
            title: 'API Error',
            text: (error.response?.data?.message || 'Could not connect to the server.') + (error.response?.data?.error ? ' (' + error.response.data.error + ')' : ''),
            position: 'bottom-end', // เปลี่ยนเป็น 'bottom-end'
            timerProgressBar: true // คงไว้
          });
      } finally {
          isSubmitting.value = false;
      }
  }
</script>

<style scoped>
@import '@/assets/main.css';
</style>
