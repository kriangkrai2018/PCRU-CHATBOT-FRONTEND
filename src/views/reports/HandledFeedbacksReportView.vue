<template>
  <div class="report-page-container">
    <Sidebar :userType="userType" :userInfoObject="userInfoObject" />
    <main class="main-content flex-grow-1">
      <div class="apple-dashboard">
        <div class="dashboard-hero">
          <div class="hero-content">
            <h1 class="hero-title">Handled Feedbacks</h1>
            <p class="hero-subtitle">รายงาน Feedback ที่จัดการแล้ว</p>
          </div>
        </div>
        <div class="reports-grid">
          <HandledFeedbacksReport />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import Sidebar from '@/components/Sidebar.vue';
import HandledFeedbacksReport from '@/views/reports/HandledFeedbacksReport.vue';
import { bindSidebarResize } from '@/stores/sidebarState';
import '@/assets/sidebar.css';
import '@/assets/dashboard-styles.css';

const router = useRouter();
const { appContext } = getCurrentInstance();
const { $axios } = appContext.config.globalProperties;

const userInfoObject = ref({});
const userType = ref('');

let unbindSidebarResize = null;

onMounted(() => {
  unbindSidebarResize = bindSidebarResize();
  const token = localStorage.getItem('userToken');
  const type = localStorage.getItem('userType');
  const userInfoString = localStorage.getItem('userInfo');
  if (!token) { router.replace({ name: 'login' }); return; }
  if (type) userType.value = type;
  if (userInfoString) { try { userInfoObject.value = JSON.parse(userInfoString); } catch(e) {} }
});

onUnmounted(() => { if (typeof unbindSidebarResize === 'function') unbindSidebarResize(); });
</script>

<style scoped>
@import '@/assets/dashboard-styles.css';
@import '@/assets/sidebar.css';
.report-page-container {
  width: 100%;
  min-height: 100vh;
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 20px; /* add breathing room between sidebar and content */
  align-items: flex-start;
  overflow-x: hidden;
}
.main-content {
  grid-column: 2/3;
  flex: 1 1 auto;
  min-width: 0;
  overflow: auto;
  padding: 1.25rem;
}
</style>
