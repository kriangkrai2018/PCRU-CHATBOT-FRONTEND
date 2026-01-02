<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <Sidebar :userType="userType" :userInfoObject="userInfoObject" />
    <div v-if="isMobileSidebarOpen" class="mobile-sidebar-backdrop" @click="closeMobileSidebar" aria-hidden="true"></div>

    <!-- Main Content -->
    <main class="main-content">
      <AppleDashboardHome :userType="userType" :userInfo="userInfoObject" />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { isSidebarCollapsed, isMobileSidebarOpen } from '@/stores/sidebarState';
import { useRouter } from 'vue-router';
import Sidebar from '@/components/Sidebar.vue';
import AppleDashboardHome from '@/views/dashboards/AppleDashboardHome.vue';
import { bindSidebarResize } from '@/stores/sidebarState';
import '@/assets/sidebar.css';

const router = useRouter();
const userInfoObject = ref({});
const userType = ref('');

const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false;
  document.body.classList.remove('sidebar-open');
  document.body.classList.remove('sidebar-mobile-expanded');
};

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
  // On large desktop screens, ensure sidebar is expanded by default
  try {
    if (window.innerWidth >= 1024) {
      isSidebarCollapsed.value = false;
    }
  } catch (e) {}
});

onUnmounted(() => {
  if (typeof unbindSidebarResize === 'function') unbindSidebarResize();
  isMobileSidebarOpen.value = false;
  document.body.classList.remove('sidebar-open');
  document.body.classList.remove('sidebar-mobile-expanded');
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
  align-items: flex-start;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-x: hidden;
  box-sizing: border-box;
  background: linear-gradient(180deg, #f5f5f7 0%, #ffffff 100%);
}


:deep(.sidebar) {
  position: sticky !important;
  top: 0 !important;
  width: 250px !important;
  min-width: 250px !important;
  height: 100vh !important;
  overflow: auto !important;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  flex: 0 0 250px !important;
  z-index: 2 !important;
}

/* keep sidebar collapsed widths consistent */

:deep(.sidebar.collapsed) {
 

.mobile-sidebar-backdrop {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

@media (max-width: 768px) {
  .dashboard-container {
    flex-direction: column;
  }
  
  :deep(.sidebar) {
    display: none;
    position: fixed !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    max-width: 250px !important;
    min-width: 250px !important;
    height: 100vh !important;
    z-index: 999 !important;
    transform: translateX(-100%) !important;
    transition: transform 0.3s ease !important;
  }
  
  :deep(body.sidebar-open .sidebar) {
    display: block !important;
    transform: translateX(0) !important;
  }
  
  .mobile-sidebar-backdrop {
    display: block;
  }

  .main-content {
    width: 100% !important;
  }
} width: 70px !important;
  min-width: 70px !important;
  flex: 0 0 70px !important;
}

  .main-content {
  flex: 1 1 auto;
  min-width: 0;
  background: transparent;
  overflow: auto;
  /* force top flush with sidebar */
  padding: 0 16px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-x: hidden;
  box-sizing: border-box;
}

/* When sidebar is collapsed */


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



@media (max-width: 768px) {
  .main-content {
    padding: 0.5rem !important;
  }
  
  /* Keep flex layout even on small screens so sidebar and content stay side-by-side */
  .dashboard-container {
    display: flex !important;
    flex-direction: row !important;
  }
  
  :deep(.sidebar) {
    width: 70px !important;
    min-width: 70px !important;
    height: 100vh !important;
  }
}

.card .small {
  font-size: 0.8rem;
  white-space: nowrap;
}
</style>
