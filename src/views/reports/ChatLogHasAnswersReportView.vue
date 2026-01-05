<template>
  <div class="report-page-container">
    <Sidebar :userType="userType" :userInfoObject="userInfoObject" />
    <div v-if="isMobileSidebarOpen" class="mobile-sidebar-backdrop" @click="toggleSidebar" aria-hidden="true"></div>
    <main class="main-content flex-grow-1">
      <div class="apple-dashboard">
        <div class="dashboard-hero">
          <div class="hero-content">
            <button class="mobile-sidebar-toggle mobile-inline-toggle" @click.stop="toggleSidebar" :aria-label="isMobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'">
              <AnimatedToggleIcon :isOpen="isMobileSidebarOpen" />
            </button>
            <div class="hero-heading">
              <div class="hero-icon apple-icon-box indigo-gradient">
                <svg class="chat-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  <path d="M9 10h6m-6 4h4" />
                </svg>
              </div>
              <div class="hero-text">
                <h3 class="page-title m-0">Chat Logs (Has Answers)</h3>
                <span class="text-secondary small">User queries matched with answers</span>
              </div>
            </div>
          </div>
          
          <!-- Live Status Badge -->
          <div class="hero-status">
            <div class="apple-status-badge" :class="{ 'online': wsConnected }">
              <span class="status-dot"></span>
              <span>{{ wsConnected ? 'Live' : 'Offline' }}</span>
            </div>
          </div>
        </div>
        <div class="reports-grid">
          <ChatLogHasAnswersReport
            :questionsTitleMap="questionsTitleMap"
            :chartOptions="chartOptions"
            :barChartOptions="barChartOptions"
            @ws-status="handleWsStatus"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import Sidebar from '@/components/Sidebar.vue';
import AnimatedToggleIcon from '@/components/AnimatedToggleIcon.vue';
import ChatLogHasAnswersReport from '@/views/dashboards/officers/ChatLogHasAnswersReport.vue';
import { bindSidebarResize, isSidebarCollapsed, isMobileSidebarOpen } from '@/stores/sidebarState';
import { Chart as ChartJS, registerables } from 'chart.js';
import '@/assets/sidebar.css';
import '@/assets/dashboard-styles.css';

ChartJS.register(...registerables);

const router = useRouter();
const { appContext } = getCurrentInstance();
const { $axios } = appContext.config.globalProperties;

const userInfoObject = ref({});
const userType = ref('');
const questionsAnswers = ref([]);
const wsConnected = ref(false);
let _savedSidebarCollapsed = null;

// Handle WebSocket status from child component
const handleWsStatus = (status) => {
  wsConnected.value = status;
};

const toggleSidebar = () => {
  const sb = document.querySelector('.sidebar');
  const isOpen = !isMobileSidebarOpen.value;

  if (isOpen) {
    _savedSidebarCollapsed = isSidebarCollapsed.value;
    isSidebarCollapsed.value = false;
    if (sb) sb.classList.remove('collapsed');
    document.body.classList.add('sidebar-open');
    document.body.classList.add('sidebar-mobile-expanded');
    isMobileSidebarOpen.value = true;
  } else {
    isSidebarCollapsed.value = !!_savedSidebarCollapsed;
    if (sb && _savedSidebarCollapsed) sb.classList.add('collapsed');
    document.body.classList.remove('sidebar-open');
    document.body.classList.remove('sidebar-mobile-expanded');
    isMobileSidebarOpen.value = false;
    _savedSidebarCollapsed = null;
  }
};

const chartOptions = ref({
  responsive: true, maintainAspectRatio: false, cutout: '65%',
  plugins: { legend: { position: 'right' }, tooltip: { cornerRadius: 12 } }
});

const barChartOptions = ref({
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true }, x: { grid: { display: false } } },
  borderRadius: 8
});

const fetchQuestionsAnswers = async () => {
  try {
    const response = await $axios.get('/questionsanswers');
    questionsAnswers.value = Array.isArray(response.data) ? response.data : (response.data?.data || []);
  } catch (err) { console.error(err); }
};

const questionsTitleMap = computed(() => {
  const map = {};
  questionsAnswers.value.forEach(q => { map[q.QuestionsAnswersID] = q.QuestionTitle; });
  return map;
});

let unbindSidebarResize = null;

onMounted(() => {
  unbindSidebarResize = bindSidebarResize();
  const token = localStorage.getItem('userToken');
  const type = localStorage.getItem('userType');
  const userInfoString = localStorage.getItem('userInfo');
  if (!token) { router.replace({ name: 'login' }); return; }
  if (type) userType.value = type;
  if (userInfoString) { try { userInfoObject.value = JSON.parse(userInfoString); } catch(e) {} }
  fetchQuestionsAnswers();
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
@import '@/assets/sidebar.css';
.report-page-container { width: 100%; min-height: 100vh; display: grid; grid-template-columns: auto 1fr; overflow-x: hidden; }
.main-content { grid-column: 2/3; flex: 1 1 auto; min-width: 0; overflow: auto;   padding: 0.5rem !important; }

.hero-heading {
  margin-left: clamp(0.75rem, 2vw, 1.5rem);
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  text-align: left;
}

.dashboard-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.hero-content {
  display: flex;
  align-items: center;
}

.hero-status {
  margin-left: auto;
}

/* Apple Status Badge */
.apple-status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: #86868b;
  transition: all 0.3s ease;
}

.apple-status-badge.online {
  background: rgba(52, 199, 89, 0.15);
  color: #34c759;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #86868b;
  transition: all 0.3s ease;
}

.apple-status-badge.online .status-dot {
  background: #34c759;
  box-shadow: 0 0 8px rgba(52, 199, 89, 0.6);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Apple Icon Box */
.apple-icon-box {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(88, 86, 214, 0.3);
}

.indigo-gradient {
  background: linear-gradient(135deg, #5856D6 0%, #a29bfe 100%);
}

.mobile-sidebar-toggle {
  display: none !important;
  background: none;
  border: none;
  color: currentColor;
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1.25rem;
  line-height: 1;
  margin-right: 0.5rem;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .report-page-container { grid-template-columns: 1fr; }
  .main-content { grid-column: 1/-1; padding: 0 !important; }
  
  .mobile-sidebar-toggle { 
    display: flex !important; 
  }
  
  .mobile-sidebar-backdrop {
    display: block;
  }

  :deep(.dashboard-hero) {
    border-radius: 0;
    position: relative;
    flex-direction: column;
    padding: 1rem;
  }

  :deep(.hero-heading) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    margin-left: 0;
  }

  :deep(.mobile-sidebar-toggle) {
    position: relative;
    left: auto;
    top: auto;
  }

  :deep(.hero-title), :deep(.page-title) {
    text-align: center;
    font-size: 1.5rem;
  }

  :deep(.hero-subtitle) {
    text-align: center;
  }
  
  /* Fix container-fluid spacing on mobile */
  :deep(.container-fluid) {
    padding: 12px !important;
  }
  
  :deep(.dashboard-container > .container-fluid) {
    padding: 12px !important;
  }
  
  /* Apple Card responsive */
  :deep(.apple-card) {
    border-radius: 16px;
    margin-bottom: 12px;
  }
  
  /* Reports Grid responsive */
  .reports-grid {
    padding: 0 !important;
  }
  
  :global(.sidebar) {
    display: none;
    position: fixed !important;
    left: 0 !important;
    top: 0 !important;
    width: 250px !important;
    height: 100vh !important;
    z-index: 999 !important;
    transform: translateX(-100%) !important;
    transition: transform 0.3s ease !important;
  }
  
  :global(body.sidebar-open .sidebar) {
    display: block !important;
    transform: translateX(0) !important;
  }
}

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

.mobile-sidebar-toggle {
  display: none;
  background: none;
  border: none;
  color: currentColor;
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1.25rem;
  line-height: 1;
  margin-right: 0.5rem;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .main-content { grid-column: 1/-1; }
  
  .mobile-sidebar-toggle { display: flex; }
  
  .mobile-sidebar-backdrop {
    display: block;
  }
  
  :global(.sidebar) {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 999;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  :global(body.sidebar-open .sidebar) {
    transform: translateX(0);
  }
}
</style>
