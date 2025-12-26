<template>
  <form @submit.prevent="handleResendEmail">
                <div class="">
                    <header class="fs-1 fw-bold mb-4 text-center text-lg-start">
                        Check your email
                    </header>
                    <p class="text-center text-lg-start">we've sent a password reset link to:</p>
                    
                    <div class="bg-c p-3 rounded-4 px-5 d-inline-block text-decoration-underline"> <!-- เพิ่ม text-decoration-underline -->
                        {{ maskedEmail }}
                    </div>
                    <div class="mt-3">
                         <div>
                            If you don't receive the email within a few minutes, 
                            please check your spam or junk folder.
                        </div>
                        <div class="mt-3">
                            Go to your email <a :href="emailProviderLink" target="_blank" rel="noopener noreferrer" class="fw-bold text-dark" @click="handleGoToEmail">Click here</a>
                        </div>
                    </div>
                    <div class="mb-3 col-12 col-lg-auto mx-auto mx-lg-0 d-flex justify-content-center justify-content-lg-start">
                        <div class="d-flex align-items-center gap-3">
                            <button 
                                type="submit" 
                                class="btn rounded-3 fw-bold px-4 py-3 mt-4 fs-5 text" 
                                :style="buttonStyle"
                                :disabled="countdown > 0 || isResending"
                            >
                                <span v-if="isResending" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                                <span role="status">{{ isResending ? 'Sending...' : (countdown > 0 ? 'Resend Link' : 'Resend Link') }}</span>
                            </button>
                            <span v-if="countdown > 0" class="mt-4">{{ countdown }} Sec.</span>
                        </div>
                    </div>
                    
                    <div class="col-12 col-lg-auto mx-auto mx-lg-0 d-flex justify-content-center justify-content-lg-start">
                        <button @click="backToLogin" class="btn btn-link fw-bold text-decoration-none" style="color: black;">
                            Back to Login
                        </button>
                    </div>
                </div>
  </form>
</template>

<script setup>
    import { ref, onMounted, onUnmounted, computed, getCurrentInstance } from 'vue';
    import { useRouter } from 'vue-router';

    // ดึง Global Properties ($axios, $swal) มาใช้งาน
    const { appContext } = getCurrentInstance();
    const { $axios, $swal } = appContext.config.globalProperties;

    const RESEND_COOLDOWN_SECONDS = 60;

    const maskedEmail = ref('');
    const originalEmail = ref(''); // เก็บอีเมลจริงไว้สำหรับส่งซ้ำ
    const countdown = ref(RESEND_COOLDOWN_SECONDS);
    let countdownInterval = null;
    const router = useRouter();
    const isResending = ref(false);

    const backToLogin = () => {
        router.push('/login');
    };

    const handleGoToEmail = () => {
        // หน้านี้จะถูกเปิดในแท็บใหม่ และโค้ดด้านล่างจะพยายามปิดแท็บปัจจุบัน
        window.close();
    };

    async function handleResendEmail() {
        if (countdown.value > 0 || isResending.value) return;

        isResending.value = true;
        try {
            await $axios.post('/forgotpassword', { email: originalEmail.value });
            $swal.fire({
                toast: true,
                icon: 'success',
                title: 'A new reset link has been sent!',
                position: 'bottom-end', // เปลี่ยนเป็น 'bottom-end'
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true // คงไว้
            });
            localStorage.setItem('resendTimestamp', Date.now().toString()); // อัปเดตเวลาที่กด
            countdown.value = RESEND_COOLDOWN_SECONDS; // รีเซ็ตเวลา
            startCountdown(); // เริ่มนับถอยหลังใหม่
        } catch (error) {
            $swal.fire({
                icon: 'error',
                title: 'Failed to resend',
                text: error.response?.data?.message || 'Could not connect to the server.',
                position: 'bottom-end', // เปลี่ยนเป็น 'bottom-end'
                timerProgressBar: true // คงไว้
            });
        } finally {
            isResending.value = false;
        }
    };

    const buttonStyle = computed(() => {
        if (countdown.value > 0) {
            return { 'background-color': '#E3E3E3', color: '#A3A3A3' };
        } else {
            return { 'background-color': '#E3E3E3', color: 'black' };
        }
    });

    const emailProviderLink = computed(() => {
        if (!originalEmail.value) return '#';
        const domain = originalEmail.value.split('@')[1];
        if (domain === 'gmail.com') {
            return 'https://mail.google.com';
        }
        if (['outlook.com', 'hotmail.com', 'live.com'].includes(domain)) {
            return 'https://outlook.live.com';
        }
        // สำหรับผู้ให้บริการรายอื่น จะสร้างลิงก์ไปยังโดเมนนั้นๆ โดยตรง
        return `https://${domain}`;
    });

    const maskEmail = (email) => {
        if (!email || email.indexOf('@') === -1) {
            return email;
        }
        const [localPart, domain] = email.split('@');
        if (localPart.length <= 3) {
            return `${localPart.slice(0, 1)}**@${domain}`;
        }
        return `${localPart.slice(0, 3)}***@${domain}`;
    };

    const startCountdown = () => {
        countdownInterval = setInterval(() => {
            if (countdown.value > 0) {
                countdown.value--;
            } else {
                clearInterval(countdownInterval);
                countdownInterval = null;
            }
        }, 1000);
    };

    onMounted(() => {
        const flowActive = localStorage.getItem('resetFlowActive');
        const emailFromStorage = localStorage.getItem('resetEmail');
        const resendTimestamp = localStorage.getItem('resendTimestamp');
        
        if (!flowActive || !emailFromStorage) {
            router.replace('/forgotpassword');
            return;
        }
        
        localStorage.removeItem('resetFlowActive');
        originalEmail.value = emailFromStorage;
        maskedEmail.value = maskEmail(emailFromStorage);

        if (resendTimestamp) {
            const timePassed = Math.floor((Date.now() - parseInt(resendTimestamp, 10)) / 1000);
            const remainingTime = RESEND_COOLDOWN_SECONDS - timePassed;

            if (remainingTime > 0) {
                countdown.value = remainingTime;
            } else {
                countdown.value = 0;
            }
        } else {
            countdown.value = 0;
        }

        startCountdown();
    });

    onUnmounted(() => {
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        localStorage.removeItem('resetEmail'); // ล้างอีเมลเมื่อออกจากหน้านี้
        localStorage.removeItem('resendTimestamp');
    });
</script>

<style scoped>
@import '@/assets/main.css';
</style>