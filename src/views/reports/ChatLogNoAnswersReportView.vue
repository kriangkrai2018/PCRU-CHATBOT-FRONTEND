<template>
  <div class="report-page-container">
    <!-- Sidebar -->
    <Sidebar :userType="userType" :userInfoObject="userInfoObject" />

    <!-- Main Content -->
    <main class="main-content flex-grow-1">
      <div class="apple-dashboard">
        
        <!-- Dashboard Hero (Header) -->
        <div class="dashboard-hero fade-in-up">
          <div class="hero-content">
            <div class="d-flex align-items-center gap-3">
              <!-- Animated Icon Box (Orange Gradient for No Answers/Attention) -->
              <div class="apple-icon-box orange-gradient">
                <svg class="chat-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path class="chat-bubble" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  <path class="question-mark" d="M12 7v2m0 4h.01"></path>
                </svg>
              </div>
              <div>
                <h1 class="hero-title">ChatLog No Answers</h1>
                <p class="hero-subtitle">รายงานการสนทนาที่ไม่มีคำตอบจากระบบ</p>
              </div>
            </div>
          </div>
          
          <!-- Live Status Badge -->
          <div class="hero-status">
            <div class="apple-status-badge" :class="{ 'online': wsConnected }">
              <span class="status-dot"></span>
              <span>{{ wsConnected ? 'Live Updates' : 'Offline' }}</span>
            </div>
          </div>
        </div>

        <!-- Reports Grid / Content -->
        <div class="reports-grid px-4 pb-5 fade-in-up" style="animation-delay: 0.1s;">
          <ChatLogNoAnswersReport
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
import { ref, onMounted, onUnmounted, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import Sidebar from '@/components/Sidebar.vue';
import ChatLogNoAnswersReport from '@/views/dashboards/officers/ChatLogNoAnswersReport.vue';
import { bindSidebarResize } from '@/stores/sidebarState';
import { Chart as ChartJS, registerables } from 'chart.js';
import { createWebSocketConnection, WS_ENDPOINTS } from '@/config/websocket';
import '@/assets/sidebar.css';
import '@/assets/dashboard-styles.css';

ChartJS.register(...registerables);

const router = useRouter();
const { appContext } = getCurrentInstance();
const { $axios } = appContext.config.globalProperties;

const userInfoObject = ref({});
const userType = ref('');
const wsConnected = ref(false);
let ws = null;

const chartOptions = ref({
  responsive: true, maintainAspectRatio: false, cutout: '70%',
  plugins: { 
    legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8, font: { family: '-apple-system, sans-serif' } } }, 
    tooltip: { cornerRadius: 12, padding: 12, backgroundColor: 'rgba(0,0,0,0.8)' } 
  }
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

// Handle WebSocket status from child component if emitted, or manage here
const handleWsStatus = (status) => {
  wsConnected.value = status;
};

let unbindSidebarResize = null;

onMounted(() => {
  unbindSidebarResize = bindSidebarResize();
  const token = localStorage.getItem('userToken');
  const type = localStorage.getItem('userType');
  const userInfoString = localStorage.getItem('userInfo');
  if (!token) { router.replace({ name: 'login' }); return; }
  if (type) userType.value = type;
  if (userInfoString) { try { userInfoObject.value = JSON.parse(userInfoString); } catch(e) {} }

  // Establish WS connection for status indicator
  ws = createWebSocketConnection(WS_ENDPOINTS.CHAT_LOGS, {
    axios: $axios,
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
  padding: 30px 40px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
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
@keyframes draw {
  0% { stroke-dasharray: 60; stroke-dashoffset: 60; opacity: 0; }
  100% { stroke-dashoffset: 0; opacity: 1; }
}
@keyframes scaleUp {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.chat-bubble {
  stroke-dasharray: 60;
  stroke-dashoffset: 0;
  animation: draw 1.2s ease-out forwards;
}
.question-mark {
  stroke-dasharray: 10;
  stroke-dashoffset: 0;
  animation: draw 1.2s ease-out 0.5s forwards; /* Delayed start */
  opacity: 0; 
  animation-fill-mode: forwards;
}

/* Header Icons */
.apple-icon-box {
  width: 48px; height: 48px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(255, 149, 0, 0.25);
  color: white;
  animation: scaleUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
.orange-gradient { background: linear-gradient(135deg, #FF9500 0%, #FF5E3A 100%); }

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
  width: 100%;
}
</style>