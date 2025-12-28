<template>
  <div class="report-page-container">
    <Sidebar :userType="userType" :userInfoObject="userInfoObject" />
    <main class="main-content flex-grow-1">
      <div class="apple-dashboard">
        <div class="dashboard-hero">
          <div class="hero-content">
            <h1 class="hero-title">QuestionsAnswers Report</h1>
            <p class="hero-subtitle">รายงานคำถาม-คำตอบ</p>
          </div>
        </div>
        <div class="reports-grid">
          <QuestionsAnswersReport
            :questionsAnswers="questionsAnswers"
            :questionsAnswersLoading="questionsAnswersLoading"
            :questionsAnswersError="questionsAnswersError"
            :questionsAnswersPieChartData="questionsAnswersPieChartData"
            :questionsAnswersBarChartData="questionsAnswersBarChartData"
            :chartOptions="chartOptions"
            :barChartOptions="barChartOptions"
            :categoriesNameMap="categoriesNameMap"
            :formatThaiDateTime="formatThaiDateTime"
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
import QuestionsAnswersReport from '@/views/dashboards/officers/QuestionsAnswersReport.vue';
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

const questionsAnswers = ref([]);
const questionsAnswersLoading = ref(true);
const questionsAnswersError = ref(null);
const categories = ref([]);

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

const fetchQuestionsAnswers = async () => {
  questionsAnswersLoading.value = true;
  try {
    const response = await $axios.get('/questionsanswers');
    questionsAnswers.value = Array.isArray(response.data) ? response.data : (response.data?.data || []);
  } catch (err) {
    questionsAnswersError.value = err.response?.data?.message || 'Failed to load.';
  } finally {
    questionsAnswersLoading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const response = await $axios.get('/getcategories');
    let data = response.data;
    // Handle API response structure: { success: true, categories: [...], count: ... }
    if (data && !Array.isArray(data) && Array.isArray(data.categories)) {
      data = data.categories;
    }
    categories.value = data;
  } catch (err) { console.error(err); }
};

const categoriesNameMap = computed(() => {
  const map = {};
  categories.value.forEach(c => { map[c.CategoriesID] = c.CategoriesName; });
  return map;
});

const questionsAnswersPieChartData = computed(() => ({
  labels: questionsAnswers.value.slice(0, 10).map(q => q.QuestionTitle?.substring(0, 20) + '...'),
  datasets: [{ data: questionsAnswers.value.slice(0, 10).map(() => 1), backgroundColor: appleColors }]
}));

const questionsAnswersBarChartData = computed(() => ({
  labels: questionsAnswers.value.slice(0, 10).map(q => q.QuestionTitle?.substring(0, 15)),
  datasets: [{ label: 'Q&A', data: questionsAnswers.value.slice(0, 10).map(() => 1), backgroundColor: appleColors }]
}));

const formatThaiDateTime = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
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
  fetchQuestionsAnswers();
  fetchCategories();
});

onUnmounted(() => { if (typeof unbindSidebarResize === 'function') unbindSidebarResize(); });
</script>

<style scoped>
@import '@/assets/dashboard-styles.css';
@import '@/assets/sidebar.css';
.report-page-container { width: 100%; min-height: 100vh; display: grid; overflow-x: hidden; }
.main-content { grid-column: 2/3; flex: 1 1 auto; min-width: 0; overflow: auto; padding: 1rem; }
</style>
