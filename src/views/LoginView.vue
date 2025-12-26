<template>
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
              
                    <div class=""><router-link to="/forgotpassword" class="fw-bold text-dark">Forgot password</router-link></div>
                    <div class="d-grid gap-2 mb-5 col-12 col-lg-4 mx-auto mx-lg-0">
                        <button type="submit" class="btn rounded-3 fw-bold py-3 px-5 mt-4 fs-5 text-nowrap" style="background-color: #E3E3E3;" :disabled="isSubmitting">
                            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                            <span role="status">{{ isSubmitting ? 'Logging in...' : 'Login' }}</span>
                        </button>
                    </div>
                    
                </div>
  </form>
</template>


<style>
  @import '@/assets/main.css';
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
