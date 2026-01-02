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
import AnimatedToggleIcon from '@/components/AnimatedToggleIcon.vue';
import QuestionsAnswersReport from '@/views/dashboards/officers/QuestionsAnswersReport.vue';
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
  
  // Close sidebar on mount
  isMobileSidebarOpen.value = false;
  document.body.classList.remove('sidebar-open');
  document.body.classList.remove('sidebar-mobile-expanded');
  
  fetchQuestionsAnswers();
  fetchCategories();
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
.main-content { grid-column: 2/3; flex: 1 1 auto; min-width: 0; overflow: auto; padding: 0.5rem !important; }

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

.hero-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  text-align: left;
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
  }

  :deep(.hero-content) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  :deep(.mobile-sidebar-toggle) {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
  }

  :deep(.hero-title) {
    text-align: center;
    font-size: 1.75rem;
  }

  :deep(.hero-subtitle) {
    text-align: center;
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
</style>
