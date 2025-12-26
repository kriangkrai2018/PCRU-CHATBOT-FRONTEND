<template>
  <div class="report-page-container">
    <Sidebar :userType="userType" :userInfoObject="userInfoObject" />
    <main class="main-content flex-grow-1">
      <div class="apple-dashboard">
        <div class="dashboard-hero">
          <div class="hero-content">
            <h1 class="hero-title">Keywords Report</h1>
            <p class="hero-subtitle">รายงานคีย์เวิร์ด</p>
          </div>
        </div>
        <div class="reports-grid">
          <KeywordsReport
            :keywords="keywords"
            :keywordsLoading="keywordsLoading"
            :keywordsError="keywordsError"
            :keywordsPieChartData="keywordsPieChartData"
            :keywordsBarChartData="keywordsBarChartData"
            :chartOptions="chartOptions"
            :barChartOptions="barChartOptions"
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
import KeywordsReport from '@/views/dashboards/officers/KeywordsReport.vue';
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

const keywords = ref([]);
const keywordsLoading = ref(true);
const keywordsError = ref(null);

const appleColors = [
  '#007AFF', '#5856D6', '#FF9500', '#34C759', '#FF3B30', '#AF52DE',
  '#00C7BE', '#FF2D55', '#5AC8FA', '#FFCC00', '#FF6482', '#30D158'
];

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

const fetchKeywords = async () => {
  keywordsLoading.value = true;
  try {
    const response = await $axios.get('/keywords');
    keywords.value = response.data;
  } catch (err) {
    keywordsError.value = err.response?.data?.message || 'Failed to load keywords.';
  } finally {
    keywordsLoading.value = false;
  }
};

const keywordsPieChartData = computed(() => ({
  labels: keywords.value.slice(0, 10).map(k => k.KeywordText),
  datasets: [{ data: keywords.value.slice(0, 10).map(k => k.HitCount || 1), backgroundColor: appleColors }]
}));

const keywordsBarChartData = computed(() => ({
  labels: keywords.value.slice(0, 10).map(k => k.KeywordText),
  datasets: [{ label: 'Hit Count', data: keywords.value.slice(0, 10).map(k => k.HitCount || 1), backgroundColor: appleColors }]
}));

let unbindSidebarResize = null;

onMounted(() => {
  unbindSidebarResize = bindSidebarResize();
  const token = localStorage.getItem('userToken');
  const type = localStorage.getItem('userType');
  const userInfoString = localStorage.getItem('userInfo');
  if (!token) { router.replace({ name: 'login' }); return; }
  if (type) userType.value = type;
  if (userInfoString) { try { userInfoObject.value = JSON.parse(userInfoString); } catch(e) {} }
  fetchKeywords();
});

onUnmounted(() => { if (typeof unbindSidebarResize === 'function') unbindSidebarResize(); });
</script>

<style scoped>
@import '@/assets/dashboard-styles.css';
@import '@/assets/sidebar.css';
.report-page-container { width: 100%; min-height: 100vh; display: grid; overflow-x: hidden; }
.main-content { grid-column: 2/3; flex: 1 1 auto; min-width: 0; overflow: auto; padding: 1rem; }
</style>
