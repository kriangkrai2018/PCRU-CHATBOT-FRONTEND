<template>
  <div class="login-page-wrapper">
    <!-- Apple-style Back Button -->
    <router-link to="/" class="apple-back-btn">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
      <span>Back</span>
    </router-link>

    <form ref="loginForm" @submit.prevent="handleLogin" class="needs-validation" novalidate>
                <div class="">
                    <header class="fs-1 fw-bold mb-4 text-center text-lg-start">
                        Login
                    </header>
                    
                    <div class="mb-3 position-relative pt-2">
                        <input ref="idInput" type="number" name="ID" class="form-control border-dark border-2 rounded-3 pt-3" id="floatingInput" 
                              placeholder="" v-model="id" required @input="idInput.classList.remove('is-invalid')">
                        <label class="fw-bold position-absolute top-0 ms-2 bg-light rounded-3 px-2 mb-0" for="floatingInput">ID</label>
                        <div class="invalid-feedback">
                            Please provide a valid ID
                        </div>
                    </div>
                    
                    <div class="mb-3 position-relative pt-2">
                        <input ref="passwordInput" :type="passwordFieldType" name="password" class="form-control border-dark border-2 rounded-3 pt-3 pe-5" id="floatingPassword" 
                              placeholder="" v-model="password" required minlength="8" @input="password.length >= 8 && passwordInput.classList.remove('is-invalid')">
                        
                        <label class="fw-bold position-absolute top-0 ms-2 bg-light rounded-3 px-2 mb-0" for="floatingPassword">Password</label>
                        
                        <button type="button" @click="togglePasswordVisibility"
                                class="btn btn-sm btn-link text-muted position-absolute end-0 top-0 mt-3 pt-1 me-2 "
                                v-show="validations.has8Chars && !passwordInput?.classList.contains('is-invalid')"> <span v-if="passwordFieldType === 'password'">
                                  <i class="bi bi-eye fs-5"></i></span>

                            <span v-else>
                                <i class="bi bi-eye-slash fs-5"></i>
                            </span>
                        </button>
                      
                        <div class="invalid-feedback">
                            Please provide a password (min 8 characters, at least one uppercase, at least one number)
                        </div>
                    </div>
                    <div class="mb-4 col-lg-10" v-if="showPasswordHelp">
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
              
                    <div class="mb-3"><router-link to="/forgotpassword" class="fw-bold text-dark">Forgot password</router-link></div>
                    <div class="d-grid gap-2 mb-3 col-12 col-lg-4 mx-auto mx-lg-0">
                        <button type="submit" class="btn rounded-3 fw-bold py-3 px-5 mt-4 fs-5 text-nowrap" style="background-color: #E3E3E3;" :disabled="isSubmitting">
                            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                            <span role="status">{{ isSubmitting ? 'Logging in...' : 'Login' }}</span>
                        </button>
                    </div>

                    <!-- Divider -->
                    <div class="divider-with-text mb-3">
                      <span>OR</span>
                    </div>

                    <!-- Google Sign-In Button -->
                    <div class="google-btn-container mb-4">
                        <button type="button" class="btn btn-google rounded-3" @click="handleGoogleLogin" :disabled="isGoogleLoading">
                            <span v-if="isGoogleLoading" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                            <svg v-else class="google-icon me-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24">
                              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                            </svg>
                            <span class="google-btn-text">Log in withGoogle</span>
                        </button>
                    </div>
                    
                </div>
  </form>
  </div>
</template>


<style>
  @import '@/assets/main.css';

  .login-page-wrapper {
    position: relative;
  }

  /* Apple-style Back Button */
  .apple-back-btn {
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 1000;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 8px 16px 8px 10px;
    font-size: 16px;
    font-weight: 500;
    color: #007AFF;
    text-decoration: none;
    border-radius: 20px;
    background: rgba(0, 122, 255, 0.08);
    transition: all 0.2s ease;
  }

  .apple-back-btn:hover {
    background: rgba(0, 122, 255, 0.15);
    color: #0056b3;
    transform: translateX(-2px);
  }

  .apple-back-btn:active {
    transform: scale(0.96);
  }

  .apple-back-btn svg {
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    .apple-back-btn {
      top: 15px;
      left: 15px;
      padding: 6px 12px 6px 8px;
      font-size: 14px;
    }
    
    .apple-back-btn svg {
      width: 18px;
      height: 18px;
    }
  }

  @media (max-width: 480px) {
    .apple-back-btn {
      top: 12px;
      left: 12px;
      padding: 5px 10px 5px 6px;
      font-size: 13px;
      gap: 2px;
      border-radius: 16px;
    }
    
    .apple-back-btn svg {
      width: 16px;
      height: 16px;
    }
  }

  @media (max-width: 375px) {
    .apple-back-btn {
      top: 10px;
      left: 10px;
      padding: 4px 8px 4px 5px;
      font-size: 12px;
      border-radius: 14px;
    }
    
    .apple-back-btn svg {
      width: 14px;
      height: 14px;
    }
  }

  #floatingInput::-webkit-outer-spin-button,
  #floatingInput::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
  }

  #floatingInput {
      -moz-appearance: textfield;
  }

.was-validated .form-control:invalid,
.form-control.is-invalid {
    border-color: #dc3545 !important; 
    box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25) !important; 
}

.was-validated .form-control:valid,
.form-control.is-valid {
    border-color: #212529 !important; 
    border-width: 2px !important;    
    background-image: none !important; 
    box-shadow: none !important;
}

/* ซ่อนไอคอน validation ของ Bootstrap เพื่อไม่ให้ทับกับไอคอนรูปตา */
.was-validated .form-control:invalid {
    background-image: none !important;
}

/* Divider with text */
.divider-with-text {
  display: flex;
  align-items: center;
  text-align: center;
  color: #6c757d;
  font-size: 14px;
  margin-top: 20px;
}

.divider-with-text::before,
.divider-with-text::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #dee2e6;
}

.divider-with-text span {
  padding: 0 16px;
}

/* Google button container */
.google-btn-container {
  width: 100%;
  margin-top: 16px;
}

/* Google Sign-In Button */
.btn-google {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border: 2px solid #dadce0;
  color: #3c4043;
  font-weight: 500;
  font-size: 15px;
  transition: all 0.2s ease;
  white-space: nowrap;
  padding: 12px 16px;
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

.btn-google .google-btn-text {
  flex-shrink: 0;
}

/* Responsive adjustments for Google button */
@media (max-width: 375px) {
  /* Very small phones */
  .btn-google {
    font-size: 13px;
    padding: 10px 12px !important;
  }
  
  .btn-google .google-icon {
    width: 18px;
    height: 18px;
    margin-right: 8px !important;
  }
  
  .btn-google .google-btn-text {
    font-size: 13px;
  }
  
  .google-btn-container {
    margin-top: 12px;
  }
}

@media (min-width: 376px) and (max-width: 575px) {
  /* Mobile phones */
  .btn-google {
    font-size: 14px;
    padding: 12px 16px !important;
  }
  
  .btn-google .google-icon {
    width: 20px;
    height: 20px;
  }
}

@media (min-width: 576px) and (max-width: 767px) {
  /* Large phones / Small tablets */
  .btn-google {
    font-size: 15px;
    padding: 14px 20px !important;
  }
  
  .btn-google .google-icon {
    width: 22px;
    height: 22px;
  }
  
  .google-btn-container {
    max-width: 400px;
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  /* Tablets / iPad */
  .btn-google {
    font-size: 15px;
    padding: 16px 24px !important;
  }
  
  .btn-google .google-icon {
    width: 24px;
    height: 24px;
  }
  
  .google-btn-container {
    max-width: 450px;
  }
}

@media (min-width: 992px) {
  /* Notebooks / Desktops */
  .btn-google {
    font-size: 16px;
    padding: 16px 28px !important;
  }
  
  .btn-google .google-icon {
    width: 24px;
    height: 24px;
  }
  
  .google-btn-container {
    max-width: 500px;
  }
}

</style>

<script setup>
  import { ref, getCurrentInstance, watch } from 'vue'; 
  import { useRouter } from 'vue-router';

  // ดึง Global Properties ($axios, $swal) มาใช้งาน
  const { appContext } = getCurrentInstance();
  const { $axios, $swal } = appContext.config.globalProperties;

  const id = ref('');
  const password = ref('');
  const loginForm = ref(''); 
  const isSubmitting = ref(false);
  const isGoogleLoading = ref(false);
  const idInput = ref(null); 
  const passwordInput = ref(null); 
  const showPasswordHelp = ref(false); // New ref for showing password rules

  const router = useRouter();

  const validations = ref({
    has8Chars: false,
    hasUppercase: false,
    hasNumber: false,
  });

  watch(password, (newPassword) => {
    validations.value.has8Chars = newPassword.length >= 8;
    validations.value.hasUppercase = /[A-Z]/.test(newPassword);
    validations.value.hasNumber = /\d/.test(newPassword);

    // If help is already visible, keep it visible while typing
    if (showPasswordHelp.value) {
      // No change needed, it should stay visible for continuous feedback
    }
  });

  // Google Login Handler
  async function handleGoogleLogin() {
    isGoogleLoading.value = true;
    try {
      // Get Google OAuth URL from backend
      const response = await $axios.get('/auth/google/url');
      if (response.data && response.data.url) {
        // Redirect to Google OAuth
        window.location.href = response.data.url;
      } else {
        showToast('error', 'ไม่สามารถเชื่อมต่อกับ Google ได้');
      }
    } catch (error) {
      console.error('Google Login Error:', error);
      showToast('error', 'เกิดข้อผิดพลาดในการLog in withGoogle');
    } finally {
      isGoogleLoading.value = false;
    }
  }

  async function handleLogin() {
      const formElement = loginForm.value;
      
      // Clear previous custom invalid states for password
      if (passwordInput.value) {
        passwordInput.value.classList.remove('is-invalid');
      }

      if (formElement.checkValidity() === false) {
          formElement.classList.add('was-validated');
          showPasswordHelp.value = true; // Show help if browser validation fails
          return;
      }

      // Custom validation for uppercase and number rules
      if (!validations.value.hasUppercase || !validations.value.hasNumber) {
          if (passwordInput.value) passwordInput.value.classList.add('is-invalid');
          formElement.classList.add('was-validated'); // Ensure validation styles are applied
          showPasswordHelp.value = true; // Show help if custom validation fails
          return; // Stop if custom rules are not met
      }

      formElement.classList.remove('was-validated');
      isSubmitting.value = true;
      showPasswordHelp.value = false; // Hide help if form is valid before submission

      // Reset previous invalid states for ID field only
      if (idInput.value) idInput.value.classList.remove('is-invalid');

      try {
          const payload = { 
              id: id.value, 
              password: password.value 
          };
          
          const response = await $axios.post('/login', payload);
          
          // ตรวจสอบ usertype ที่ได้รับจาก API
          if (response.data && response.data.usertype === 'No User') {
              console.error('Login failed: User has "No User" type.');
              if (idInput.value) idInput.value.classList.add('is-invalid');
              if (passwordInput.value) passwordInput.value.classList.add('is-invalid'); 
              showPasswordHelp.value = true; // Show help on specific API failure
              return; 
          }

          if (response.data && response.data.token) {
              localStorage.setItem('userToken', response.data.token);
              localStorage.setItem('userType', response.data.usertype);
              localStorage.setItem('userInfo', JSON.stringify(response.data.userInfo) );
              
              showToast('success', 'Login Successful!'); 
              
              router.push({ path: '/dashboard' });
              showPasswordHelp.value = false; // Hide help on successful login
              
          } else {
              console.error('SERVER ERROR: Response OK, but missing token.');
              
              if (idInput.value) idInput.value.classList.add('is-invalid');
              if (passwordInput.value) passwordInput.value.classList.add('is-invalid'); 
              showPasswordHelp.value = true; // Show help if no token
              
          }

      } catch (error) {
          
          console.error('❌ Login API Failed:', error.response ? error.response.data : error.message);
          
          if (idInput.value) idInput.value.classList.add('is-invalid');
          if (passwordInput.value) passwordInput.value.classList.add('is-invalid'); 
          showPasswordHelp.value = true; // Show help on API error
          
      } finally {
          isSubmitting.value = false;
      }
  }

  const passwordFieldType = ref('password');

  function togglePasswordVisibility() {
      passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password';
  }

  const showToast = (icon, title) => {
      $swal.fire({
          toast: true, 
          icon: icon,
          title: title,
          position: 'bottom-end', 
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true 
      });
  };
</script>
