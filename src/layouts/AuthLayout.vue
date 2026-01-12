<template>
  <div class="overflow-hidden">
    <div class="bg-c vh-100 px-xl-c pt-xl-c vh-100 overflow-hidden justify-content-center align-items-center row">
      <div class="col-xl-12 col-xxl-8">
        <div class="card-c px-5 pe-xl-5 row rounded-top-0 overflow-auto overflow-hidden-lg rounded-top-5 justify-content-center align-items-lg-center bg-light vh-100" data-aos="fade-in" data-aos-duration="600">
          <div class="col-lg-6 col-xl-6 col-xl-4 pt-5 mt-5 pt-lg-0 mt-lg-0">
            <div class="logo-section d-flex justify-content-center align-items-center mb-lg-5 pb-lg-5">
              <img 
                src="@/assets/logo.png" 
                alt="Phetchabun Rajabhat University Logo" 
                class="logo-img"
                :style="{ transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`, cursor: isDragging ? 'grabbing' : 'grab' }"
                @mousedown.prevent="handleMouseDown"
                @touchstart.prevent="handleTouchStart"
              >
            </div>
          </div>
          <div class="col-lg-6 col-xl-6 pe-xl-5">
            <!-- เนื้อหาของแต่ละหน้า (Login, ForgotPassword) จะถูกแสดงที่นี่ -->
            <router-view v-slot="{ Component }">
              <transition name="form-fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useInteractiveLogo } from '@/composables/useInteractiveLogo.js';
import { useLogoState } from '@/stores/logoStore.js';

// --- เรียกใช้ Composable และ State สำหรับโลโก้ ---
const { rotateX, rotateY } = useLogoState(); // ดึงค่าองศาการหมุนจาก Global Store
const { isDragging, handleMouseDown, handleTouchStart } = useInteractiveLogo(); // ดึงฟังก์ชันการควบคุมจาก Composable
</script>

<style>
  .bg-c {
    background-color: #E3E3E3;
  }
  @media (min-width: 992px) {
    .rounded-top-5 {
      border-top-left-radius: 3rem !important;
      border-top-right-radius: 3rem !important;
    }
    .card-c {
      box-shadow: rgba(17, 17, 26, 0.1) 0px 8px 24px, rgba(17, 17, 26, 0.1) 0px 16px 56px, rgba(17, 17, 26, 0.1) 0px 24px 80px;
    }
    .px-xl-c {
      padding-top: 6rem !important;
      padding-left: 8.5rem !important;
      padding-right: 8.5rem !important;
    }
  }
  .rounded-top-0 {
    border-radius: 0rem !important;
  }
  .logo-section {
    perspective: 1000px;
  }
  .logo-img {
    width: 20vh;
  }

  /* Transition สำหรับสลับฟอร์มด้านใน */
  .form-fade-enter-active,
  .form-fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .form-fade-enter-from,
  .form-fade-leave-to {
    opacity: 0;
  }
</style>

