<template>
  <div class="report-page-container">
    <Sidebar :userType="userType" :userInfoObject="userInfoObject" />
    <!-- Backdrop: clicking the darkened area closes the mobile sidebar overlay -->
    <div v-if="isMobileSidebarOpen" class="mobile-sidebar-backdrop" @click="toggleSidebar" aria-hidden="true"></div>
    <main class="main-content flex-grow-1">
      <div class="apple-dashboard">
        <div class="dashboard-hero">
          <div class="hero-content">
          <button class="mobile-sidebar-toggle mobile-inline-toggle" @click.stop="toggleSidebar" :aria-label="isMobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'">
            <AnimatedToggleIcon :isOpen="isMobileSidebarOpen" />
          </button>
            <h1 class="hero-title">
              Keywords Report</h1>
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
import AnimatedToggleIcon from '@/components/AnimatedToggleIcon.vue';
import KeywordsReport from '@/views/dashboards/officers/KeywordsReport.vue';
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
    keywords.value = response.data?.data || response.data || [];
  } catch (err) {
    keywordsError.value = err.response?.data?.message || 'Failed to load keywords.';
  } finally {
    keywordsLoading.value = false;
  }
};

const keywordsPieChartData = computed(() => {
  const kw = Array.isArray(keywords.value) ? keywords.value : [];
  return {
    labels: kw.slice(0, 10).map(k => k.KeywordText),
    datasets: [{ data: kw.slice(0, 10).map(k => k.HitCount || 1), backgroundColor: appleColors }]
  };
});

const keywordsBarChartData = computed(() => {
  const kw = Array.isArray(keywords.value) ? keywords.value : [];
  return {
    labels: kw.slice(0, 10).map(k => k.KeywordText),
    datasets: [{ label: 'Hit Count', data: kw.slice(0, 10).map(k => k.HitCount || 1), backgroundColor: appleColors }]
  };
});

let unbindSidebarResize = null;
let _savedSidebarCollapsed = null;

const toggleSidebar = () => {
  const sb = document.querySelector('.sidebar');
  const isOpen = !isMobileSidebarOpen.value;

  if (isOpen) {
    // Opening: save current collapsed state, force expand for mobile overlay
    _savedSidebarCollapsed = isSidebarCollapsed.value;
    isSidebarCollapsed.value = false;
    if (sb) sb.classList.remove('collapsed');
    document.body.classList.add('sidebar-open');
    document.body.classList.add('sidebar-mobile-expanded');
    isMobileSidebarOpen.value = true;
  } else {
    // Closing: restore previous collapsed state and hide overlay
    isSidebarCollapsed.value = !!_savedSidebarCollapsed;
    if (sb && _savedSidebarCollapsed) sb.classList.add('collapsed');
    document.body.classList.remove('sidebar-open');
    document.body.classList.remove('sidebar-mobile-expanded');
    isMobileSidebarOpen.value = false;
    _savedSidebarCollapsed = null;
  }
};

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

onUnmounted(() => {
  if (typeof unbindSidebarResize === 'function') unbindSidebarResize();
  // Ensure mobile overlay is removed when leaving this view
  isMobileSidebarOpen.value = false;
  document.body.classList.remove('sidebar-open');
  document.body.classList.remove('sidebar-mobile-expanded');
});
</script>

<style scoped>
@import '@/assets/dashboard-styles.css';
@import '@/assets/sidebar.css';
.report-page-container { width: 100%; min-height: 100vh; display: grid; overflow-x: hidden; }
.main-content { grid-column: 2/3; flex: 1 1 auto; min-width: 0; overflow: auto; padding: 0.5rem !important; }

/* Remove main-content padding on small screens to maximize usable space */
@media (max-width: 768px) {
  /* Hide sidebar by default on mobile */
  .sidebar, .sidebar.collapsed {
    display: none !important;
  }

  /* Show sidebar when explicitly opened */
  body.sidebar-open .sidebar, 
  body.sidebar-mobile-expanded .sidebar {
    display: flex !important;
    flex-direction: column !important;
    position: fixed !important;
    left: 0; 
    top: 0; 
    bottom: 0;
    width: 280px !important;
    z-index: 2600 !important;
    background: #E3E3E3;
    box-shadow: 0 12px 50px rgba(0,0,0,0.24);
    transform: translateX(0) !important;
    transition: transform 280ms cubic-bezier(.22,.9,.33,1), opacity 180ms ease;
  }

  /* Ensure backdrop is visible */
  .mobile-sidebar-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.42); z-index: 2500;
  }

  .main-content {
    padding: 0 !important;
  }

  /* Keep the header comfortable on mobile: give the hero content internal padding */
  .dashboard-hero .hero-content {
    padding: 1rem !important;
  }

  /* Center hero title/subtitle on mobile and stack the mobile toggle above */
  .dashboard-hero .hero-content {
    flex-direction: column !important;
    align-items: center !important;
    text-align: center !important;
  }

  .dashboard-hero .hero-content .mobile-sidebar-toggle.mobile-inline-toggle {
    margin: 0 0 10px 0 !important; /* place above title */
    align-self: flex-start !important; /* left-align on mobile */
    margin-left: -1rem !important; /* offset the internal padding so button sits at the left edge */
  }
}

/* Non-mobile: keep hero left-aligned and inline */
@media (min-width: 769px) {
  .dashboard-hero .hero-content {
    flex-direction: row !important;
    align-items: center !important;
    justify-content: flex-start !important;
    text-align: left !important;
  }
  .dashboard-hero .hero-content .mobile-sidebar-toggle.mobile-inline-toggle {
    margin: 0 12px 0 0 !important; /* place inline to the left */
    align-self: center !important;
  }

  /* Force title and subtitle onto separate lines on non-mobile */
  .dashboard-hero .hero-content .hero-title { display: block; width: 100%; margin: 0; flex-basis: 100%; }
  .dashboard-hero .hero-content .hero-subtitle { display: block; width: 100%; margin: 6px 0 0 0; color: var(--text-secondary); font-size: 0.95rem; flex-basis: 100%; }

  /* Small adjustment to avoid overlap with page chrome */
  .dashboard-hero { padding-top: 8px; }

  .dashboard-hero .hero-content .hero-title,
  .dashboard-hero .hero-content .hero-subtitle {
    text-align: left !important;
  }
}
</style>
