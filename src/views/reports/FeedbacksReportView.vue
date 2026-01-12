<template>
  <div class="report-page-container">
    <!-- Sidebar -->
    <Sidebar :userType="userType" :userInfoObject="userInfoObject" />
    <div v-if="isMobileSidebarOpen" class="mobile-sidebar-backdrop" @click="toggleSidebar" aria-hidden="true"></div>

    <!-- Main Content -->
    <main class="main-content flex-grow-1">
      <div class="apple-dashboard">
        
        <!-- Dashboard Hero (Header) -->
        <div class="dashboard-hero fade-in-up">
          <div class="hero-content">
            <button class="mobile-sidebar-toggle mobile-inline-toggle" @click.stop="toggleSidebar" :aria-label="isMobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'">
              <AnimatedToggleIcon :isOpen="isMobileSidebarOpen" />
            </button>
            <div class="hero-heading d-flex align-items-center gap-3">
              <!-- Animated Icon Box (Blue Gradient for General Feedbacks) -->
              <div class="apple-icon-box blue-gradient">
                <svg class="chat-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <path class="chat-path" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </div>
              <div>
                <h1 class="hero-title">Feedbacks Report</h1>
                <p class="hero-subtitle">รายงานความพึงพอใจและข้อเสนอแนะทั้งหมด</p>
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

        <!-- Reports Grid / Content -->
        <div class="reports-grid px-4 pb-5 fade-in-up" style="animation-delay: 0.1s;">
          <FeedbacksReport
            :feedbacks="feedbacks"
            :feedbacksLoading="feedbacksLoading"
            :feedbacksError="feedbacksError"
            :feedbacksPieChartData="feedbacksPieChartData"
            :feedbacksBarChartData="feedbacksBarChartData"
            :chartOptions="chartOptions"
            :barChartOptions="barChartOptions"
            :showLiveBadge="false" 
            @refresh="fetchFeedbacks"
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
import FeedbacksReport from '@/views/dashboards/officers/FeedbacksReport.vue';
import { bindSidebarResize, isSidebarCollapsed, isMobileSidebarOpen } from '@/stores/sidebarState';
import { Chart as ChartJS, registerables } from 'chart.js';
import { createWebSocketConnection, WS_ENDPOINTS } from '@/config/websocket'; // Import WebSocket
import '@/assets/sidebar.css';
import '@/assets/dashboard-styles.css';

ChartJS.register(...registerables);

const router = useRouter();
const { appContext } = getCurrentInstance();
const { $axios } = appContext.config.globalProperties;

// User Info
const userInfoObject = ref({});
const userType = ref('');
let _savedSidebarCollapsed = null;

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

// Data State
const feedbacks = ref([]);
const feedbacksLoading = ref(true);
const feedbacksError = ref(null);

// WebSocket State
const wsConnected = ref(false);
let ws = null;

// Chart Options
const chartOptions = ref({
  responsive: true, maintainAspectRatio: false, cutout: '70%',
  plugins: { legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8, font: { family: '-apple-system, sans-serif' } } }, tooltip: { cornerRadius: 12, padding: 12 } }
});

const barChartOptions = ref({
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { 
    y: { beginAtZero: true, grid: { borderDash: [4, 4], color: '#f0f0f0' }, ticks: { font: { family: '-apple-system, sans-serif' } } }, 
    x: { grid: { display: false }, ticks: { font: { family: '-apple-system, sans-serif' } } } 
  },
  borderRadius: 6,
  barThickness: 24
});

// Fetch Data
const fetchFeedbacks = async () => {
  feedbacksLoading.value = true;
  try {
    // Fetch ALL feedbacks (including handled) for total count display
    const response = await $axios.get('/feedbacks?all=true');
    feedbacks.value = response.data?.data || response.data || [];
  } catch (err) {
    console.error('❌ fetchFeedbacks error:', err);
    if (err.response?.status === 401) {
      router.replace('/login');
      return;
    }
    feedbacksError.value = err.response?.data?.message || 'Failed to load feedbacks.';
  } finally {
    feedbacksLoading.value = false;
  }
};

// Computed Charts
const feedbacksPieChartData = computed(() => {
  const data = Array.isArray(feedbacks.value) ? feedbacks.value : [];
  const likes = data.filter(f => f.FeedbackValue === 1 || f.FeedbackValue === true).length;
  const dislikes = data.filter(f => f.FeedbackValue === 0 || f.FeedbackValue === false).length;
  const pending = data.filter(f => f.FeedbackValue === 2).length;
  return {
    labels: ['Like', 'Unlike', 'Pending'],
    datasets: [{ data: [likes, dislikes, pending], backgroundColor: ['#34C759', '#FF3B30', '#FF9500'], borderWidth: 0 }]
  };
});

const feedbacksBarChartData = computed(() => {
  const data = Array.isArray(feedbacks.value) ? feedbacks.value : [];
  const likes = data.filter(f => f.FeedbackValue === 1 || f.FeedbackValue === true).length;
  const dislikes = data.filter(f => f.FeedbackValue === 0 || f.FeedbackValue === false).length;
  const pending = data.filter(f => f.FeedbackValue === 2).length;
  return {
    labels: ['Like', 'Unlike', 'Pending'],
    datasets: [{ label: 'Feedbacks', data: [likes, dislikes, pending], backgroundColor: ['#34C759', '#FF3B30', '#FF9500'], borderRadius: 6 }]
  };
});

let unbindSidebarResize = null;

onMounted(() => {
  // Sidebar & User Init
  unbindSidebarResize = bindSidebarResize();
  const token = localStorage.getItem('userToken');
  const type = localStorage.getItem('userType');
  const userInfoString = localStorage.getItem('userInfo');
  if (!token) { router.replace({ name: 'login' }); return; }
  if (type) userType.value = type;
  if (userInfoString) { try { userInfoObject.value = JSON.parse(userInfoString); } catch(e) {} }
  
  // Initial Fetch
  fetchFeedbacks();

  // WebSocket Connection
  ws = createWebSocketConnection(WS_ENDPOINTS.FEEDBACKS, {
    axios: $axios,
    onMessage: (message) => {
      // Refresh if feedback updated
      if (message?.type === 'feedback_update' || message?.action === 'created' || message?.action === 'updated') {
        fetchFeedbacks();
      }
    },
    onOpen: () => { wsConnected.value = true; },
    onClose: () => { wsConnected.value = false; }
  });
});

onUnmounted(() => { 
  if (ws) ws.disconnect();
  if (typeof unbindSidebarResize === 'function') unbindSidebarResize(); 
});
</script>

<style scoped>
@import '@/assets/dashboard-styles.css';
@import '@/assets/sidebar.css';

:root {
  --apple-blue: #0071e3;
  --apple-light-bg: #F5F5F7;
}

.report-page-container {
  width: 100%;
  min-height: 100vh;
  display: grid;
  grid-template-columns: auto 1fr;
  background-color: var(--apple-light-bg);
  overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.main-content {
  flex: 1;
  min-width: 0;
  overflow: auto;
}

/* Dashboard Hero */
.dashboard-hero {
  background: #ffffff;
  padding: 3px 4px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
}

.hero-heading {
  margin-left: clamp(0.75rem, 2vw, 1.5rem);
}

.hero-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 1rem;
  color: #86868b;
  margin-top: 4px;
}

/* Animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }

/* SVG Animation */
@keyframes drawChat {
  0% { stroke-dasharray: 60; stroke-dashoffset: 60; opacity: 0; }
  100% { stroke-dashoffset: 0; opacity: 1; }
}
@keyframes scaleUp {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.chat-path {
  stroke-dasharray: 60;
  stroke-dashoffset: 0;
  animation: drawChat 1.2s ease-out forwards;
}

/* Header Icons */
.apple-icon-box {
  width: 48px; height: 48px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.25);
  color: white;
  animation: scaleUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
.blue-gradient { background: linear-gradient(135deg, #0071e3 0%, #00C6FF 100%); }

/* Status Badge */
.apple-status-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255, 255, 255, 0.9); padding: 6px 12px;
  border-radius: 20px; font-size: 0.8rem; font-weight: 600; color: #86868b;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05);
}
.apple-status-badge.online {
  color: #34C759; border-color: rgba(52, 199, 89, 0.2); background: rgba(52, 199, 89, 0.05);
}
.status-dot { width: 8px; height: 8px; border-radius: 50%; background: #86868b; }
.apple-status-badge.online .status-dot { background: #34C759; box-shadow: 0 0 8px rgba(52, 199, 89, 0.4); }

/* Reports Grid */
.reports-grid {
  /* Using standard block layout for the component inside */
  width: 100%;
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
  .main-content { grid-column: 1/-1; padding: 0 !important; }
  
  .mobile-sidebar-toggle { display: flex; }
  
  .mobile-sidebar-backdrop {
    display: block;
  }

  .dashboard-hero {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 0;
    position: relative;
  }

  .hero-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .mobile-sidebar-toggle {
    position: absolute;
    left: 0;
    top: 50%;
  }

  .hero-title {
    text-align: center;
    font-size: 1.5rem;
  }

  .hero-subtitle {
    text-align: center;
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

@media (max-width: 991px) {
  .hero-title {
    font-size: 1.5rem;
  }
  
  .hero-subtitle {
    font-size: 0.9rem;
  }
  
  .apple-icon-box {
    width: 40px;
    height: 40px;
  }
  
  .apple-icon-box svg {
    width: 22px;
    height: 22px;
  }
}

@media (max-width: 768px) {
  .report-page-container {
    grid-template-columns: 1fr;
  }
  
  .main-content { 
    grid-column: 1/-1; 
    padding: 0 !important; 
  }
  
  .mobile-sidebar-toggle { display: flex; }
  
  .mobile-sidebar-backdrop {
    display: block;
  }
  
  .dashboard-hero {
    padding: 16px;
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .hero-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .hero-heading {
    flex-direction: column;
    text-align: center;
    margin-left: 0;
    gap: 12px;
  }
  
  .hero-title {
    font-size: 1.4rem;
    text-align: center;
  }
  
  .hero-subtitle {
    text-align: center;
    font-size: 0.85rem;
  }
  
  .hero-status {
    margin-top: 8px;
  }
  
  .mobile-sidebar-toggle.mobile-inline-toggle {
    position: absolute;
    left: 12px;
    top: 16px;
  }
  
  .reports-grid {
    padding: 12px !important;
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

@media (max-width: 480px) {
  .dashboard-hero {
    padding: 12px;
  }
  
  .hero-title {
    font-size: 1.25rem;
  }
  
  .apple-icon-box {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }
  
  .apple-status-badge {
    font-size: 0.7rem;
    padding: 4px 10px;
  }
  
  .reports-grid {
    padding: 8px !important;
  }
}
</style>