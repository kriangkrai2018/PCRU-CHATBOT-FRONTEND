<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <Sidebar :userType="userType" :userInfoObject="userInfoObject" />

    <!-- Main Content -->
    <main class="main-content">
      <AppleDashboardHome :userType="userType" :userInfo="userInfoObject" />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Sidebar from '@/components/Sidebar.vue';
import AppleDashboardHome from '@/views/dashboards/AppleDashboardHome.vue';
import { bindSidebarResize } from '@/stores/sidebarState';
import '@/assets/sidebar.css';

const router = useRouter();
const userInfoObject = ref({});
const userType = ref('');

// bind sidebar resize handler
let unbindSidebarResize = null;
onMounted(() => {
  unbindSidebarResize = bindSidebarResize();

  const token = localStorage.getItem("userToken");
  const type = localStorage.getItem("userType");
  const userInfoString = localStorage.getItem("userInfo");

  if (!token) {
    router.replace({ name: "login" });
    return;
  }
  if (type) userType.value = type;
  if (userInfoString) {
    try { userInfoObject.value = JSON.parse(userInfoString); } catch(e){ console.error(e); }
  }
});

onUnmounted(() => {
  if (typeof unbindSidebarResize === 'function') unbindSidebarResize();
});
</script>

<style scoped>
@import '@/assets/dashboard-styles.css';
@import '@/assets/main.css';
@import '@/assets/sidebar.css';

/* Dashboard grid layout - responsive to sidebar collapse */
.dashboard-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  gap: 0;
  align-items: stretch;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-x: hidden;
  box-sizing: border-box;
  background: linear-gradient(180deg, #f5f5f7 0%, #ffffff 100%);
}

:deep(.sidebar) {
  position: relative !important;
  width: 250px !important;
  min-width: 250px !important;
  height: 100vh !important;
  overflow: auto !important;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

:deep(.sidebar.collapsed) {
  width: 70px !important;
  min-width: 70px !important;
}

.main-content {
  flex: 1 1 auto;
  min-width: 0;
  background: transparent;
  overflow: auto;
  /* remove horizontal padding so cards can be flush with viewport */
  /* add comfortable horizontal gutter to content */
  padding: 32px 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-x: hidden;
  box-sizing: border-box;
}

/* When sidebar is collapsed */
:deep(.sidebar.collapsed) ~ .main-content {
  padding-left: 24px !important;
}

:deep(.sidebar.collapsed) ~ .main-content .container-fluid {
  padding-left: 0.25rem !important;
}

/* internal tables scroll instead of expanding page */
:deep(.main-content .table-responsive) {
  overflow-x: auto;
  padding-left: 0 !important;
  padding-right: 0 !important;
  box-sizing: border-box;
}

/* Reduce container-fluid padding */
:deep(.main-content .container-fluid) {
  padding-left: 0.5rem !important;
  padding-right: 0.5rem !important;
  padding-top: 0.5rem !important;
}

@media (max-width: 768px) {
  .main-content {
    padding: 20px 16px;
  }
  
  .dashboard-container {
    display: block;
  }
  
  :deep(.sidebar) {
    width: 100% !important;
    min-width: 100% !important;
    height: auto !important;
  }
}

.card .small {
  font-size: 0.8rem;
  white-space: nowrap;
}
</style>
