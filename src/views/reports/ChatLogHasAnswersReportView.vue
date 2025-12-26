<template>
  <div class="report-page-container">
    <Sidebar :userType="userType" :userInfoObject="userInfoObject" />
    <main class="main-content flex-grow-1">
      <div class="apple-dashboard">
        <div class="dashboard-hero">
          <div class="hero-content">
            <h1 class="hero-title">ChatLog Has Answers</h1>
            <p class="hero-subtitle">รายงานการสนทนาที่มีคำตอบ</p>
          </div>
        </div>
        <div class="reports-grid">
          <ChatLogHasAnswersReport
            :questionsTitleMap="questionsTitleMap"
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
import ChatLogHasAnswersReport from '@/views/dashboards/officers/ChatLogHasAnswersReport.vue';
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
    questionsAnswers.value = response.data;
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

onUnmounted(() => { if (typeof unbindSidebarResize === 'function') unbindSidebarResize(); });
</script>

<style scoped>
@import '@/assets/dashboard-styles.css';
@import '@/assets/sidebar.css';
.report-page-container { width: 100%; min-height: 100vh; display: grid; overflow-x: hidden; }
.main-content { grid-column: 2/3; flex: 1 1 auto; min-width: 0; overflow: auto; padding: 1rem; }
</style>
