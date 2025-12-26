<template>
  <div>
    <div class="text-center">
      <i class="bi bi-check-lg" style="font-size: 5rem; color: #44FF00; font-weight: bold;"></i>
    </div>
    <div class="text-center text-lg-start">
      <header class="fs-1 fw-bold mt-4 mb-2">
        Password Updated!
      </header>
      <p class="mb-4">
        Your password has been changed successfully.
      </p>
      <div class="d-flex justify-content-center justify-content-lg-start">
        <button @click="goToLogin" class="btn rounded-3 fw-bold py-3 px-5 fs-5" style="background-color: #E3E3E3; color: black;">
          Back to Login <span v-if="countdown > 0" class="ms-2">{{ countdown }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const countdown = ref(5);
let countdownInterval = null;

const goToLogin = () => {
  // เมื่อกดปุ่มจะกลับไปที่หน้า login
  router.push({ name: 'login' });
};

const startCountdown = () => {
  countdownInterval = setInterval(() => {
    if (countdown.value > 1) {
      countdown.value--;
    } else {
      clearInterval(countdownInterval); // หยุดการนับ
      goToLogin(); // เมื่อนับถอยหลังถึง 0 ให้ไปหน้า login
    }
  }, 1000);
};

onMounted(() => {
  startCountdown();
});

onUnmounted(() => {
  // Clear interval เมื่อออกจาก component นี้เพื่อป้องกัน memory leak
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
});
</script>