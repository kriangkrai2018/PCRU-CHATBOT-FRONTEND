<template>
  <div class="report-page-container">
    <Sidebar :userType="userType" :userInfoObject="userInfoObject" />
    <main class="main-content flex-grow-1">
      <div class="apple-dashboard">
        <div class="dashboard-hero">
          <div class="hero-content">
            <h1 class="hero-title">Feedbacks Report</h1>
            <p class="hero-subtitle">รายงานความพึงพอใจ</p>
          </div>
        </div>
        <div class="reports-grid">
          <FeedbacksReport
            :feedbacks="feedbacks"
            :feedbacksLoading="feedbacksLoading"
            :feedbacksError="feedbacksError"
            :feedbacksPieChartData="feedbacksPieChartData"
            :feedbacksBarChartData="feedbacksBarChartData"
            :chartOptions="chartOptions"
            :barChartOptions="barChartOptions"
            :showLiveBadge="true"
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
import FeedbacksReport from '@/views/dashboards/officers/FeedbacksReport.vue';
import { bindSidebarResize } from '@/stores/sidebarState';
import { Chart as ChartJS, registerables } from 'chart.js';
import '@/assets/sidebar.css';
import '@/assets/dashboard-styles.css';

ChartJS.register(...registerables);

const router = useRouter();
const { appContext } = getCurrentInstance();
const { $axios } = appContext.config.globalProperties;

const userInfoObject = ref({});
const userType = ref('');

const feedbacks = ref([]);
const feedbacksLoading = ref(true);
const feedbacksError = ref(null);

const appleColors = ['#34C759', '#FF3B30', '#FF9500'];

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

const fetchFeedbacks = async () => {
  feedbacksLoading.value = true;
  try {
    const response = await $axios.get('/feedbacks');
    feedbacks.value = response.data;
  } catch (err) {
    feedbacksError.value = err.response?.data?.message || 'Failed to load feedbacks.';
  } finally {
    feedbacksLoading.value = false;
  }
};

const feedbacksPieChartData = computed(() => {
  const likes = feedbacks.value.filter(f => f.FeedbackValue === 1).length;
  const dislikes = feedbacks.value.filter(f => f.FeedbackValue === 0).length;
  return {
    labels: ['Like', 'Unlike'],
    datasets: [{ data: [likes, dislikes], backgroundColor: ['#34C759', '#FF3B30'] }]
  };
});

const feedbacksBarChartData = computed(() => {
  const likes = feedbacks.value.filter(f => f.FeedbackValue === 1).length;
  const dislikes = feedbacks.value.filter(f => f.FeedbackValue === 0).length;
  return {
    labels: ['Like', 'Unlike'],
    datasets: [{ label: 'Feedbacks', data: [likes, dislikes], backgroundColor: ['#34C759', '#FF3B30'] }]
  };
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
  fetchFeedbacks();
});

onUnmounted(() => { if (typeof unbindSidebarResize === 'function') unbindSidebarResize(); });
</script>

<style scoped>
@import '@/assets/dashboard-styles.css';
@import '@/assets/sidebar.css';
.report-page-container { width: 100%; min-height: 100vh; display: grid; overflow-x: hidden; }
.main-content { grid-column: 2/3; flex: 1 1 auto; min-width: 0; overflow: auto; padding: 1rem; }
</style>
