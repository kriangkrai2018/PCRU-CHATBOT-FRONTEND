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
            <h1 class="hero-title">Categories Report</h1>
            <p class="hero-subtitle">รายงานหมวดหมู่คำถาม-คำตอบ</p>
          </div>
        </div>
        <div class="reports-grid">
          <CategoriesReport
            :categories="categories"
            :categoriesLoading="categoriesLoading"
            :categoriesError="categoriesError"
            :categoriesPieChartData="categoriesPieChartData"
            :categoriesBarChartData="categoriesBarChartData"
            :searchQueryCategories="searchQueryCategories"
            :filteredCategories="filteredCategories"
            :paginatedCategories="paginatedCategories"
            :categoriesStartIndex="categoriesStartIndex"
            :categoriesEndIndex="categoriesEndIndex"
            :categoriesTotalEntries="categoriesTotalEntries"
            :categoriesCurrentPage="categoriesCurrentPage"
            :categoriesTotalPages="categoriesTotalPages"
            :categoriesPagesToShow="categoriesPagesToShow"
            :categoriesFirstPage="categoriesFirstPage"
            :categoriesPrevPage="categoriesPrevPage"
            :categoriesGoToPage="categoriesGoToPage"
            :categoriesNextPage="categoriesNextPage"
            :categoriesLastPage="categoriesLastPage"
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
import CategoriesReport from '@/views/dashboards/officers/CategoriesReport.vue';
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

// Categories data
const categories = ref([]);
const categoriesLoading = ref(true);
const categoriesError = ref(null);
const searchQueryCategories = ref('');
const categoriesCurrentPage = ref(1);
const categoriesItemsPerPage = ref(5);

// Apple Colors
const appleColors = [
  '#007AFF', '#5856D6', '#FF9500', '#34C759', '#FF3B30', '#AF52DE',
  '#00C7BE', '#FF2D55', '#5AC8FA', '#FFCC00', '#FF6482', '#30D158'
];

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: { position: 'right', labels: { padding: 20, usePointStyle: true } },
    tooltip: { backgroundColor: 'rgba(29, 29, 31, 0.9)', cornerRadius: 12 }
  }
});

const barChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.06)' } },
    x: { grid: { display: false } }
  },
  borderRadius: 8
});

const fetchCategories = async () => {
  categoriesLoading.value = true;
  categoriesError.value = null;
  try {
    const response = await $axios.get('/getcategories');
    let data = response.data;
    // Handle API response structure: { success: true, categories: [...], count: ... }
    if (data && !Array.isArray(data) && Array.isArray(data.categories)) {
      data = data.categories;
    }
    categories.value = data;
  } catch (err) {
    categoriesError.value = err.response?.data?.message || 'Failed to load categories.';
  } finally {
    categoriesLoading.value = false;
  }
};

const filteredCategories = computed(() => {
  if (!searchQueryCategories.value) return categories.value;
  const q = searchQueryCategories.value.toLowerCase();
  return categories.value.filter(c =>
    c.CategoriesName?.toLowerCase().includes(q) ||
    String(c.CategoriesID).includes(q)
  );
});

const categoriesTotalEntries = computed(() => filteredCategories.value.length);
const categoriesTotalPages = computed(() => Math.ceil(categoriesTotalEntries.value / categoriesItemsPerPage.value) || 1);
const categoriesStartIndex = computed(() => (categoriesCurrentPage.value - 1) * categoriesItemsPerPage.value);
const categoriesEndIndex = computed(() => Math.min(categoriesStartIndex.value + categoriesItemsPerPage.value, categoriesTotalEntries.value));
const paginatedCategories = computed(() => filteredCategories.value.slice(categoriesStartIndex.value, categoriesEndIndex.value));

const categoriesPagesToShow = computed(() => {
  const pages = [];
  for (let i = 1; i <= categoriesTotalPages.value; i++) pages.push(i);
  return pages;
});

const categoriesFirstPage = () => { categoriesCurrentPage.value = 1; };
const categoriesPrevPage = () => { if (categoriesCurrentPage.value > 1) categoriesCurrentPage.value--; };
const categoriesGoToPage = (p) => { categoriesCurrentPage.value = p; };
const categoriesNextPage = () => { if (categoriesCurrentPage.value < categoriesTotalPages.value) categoriesCurrentPage.value++; };
const categoriesLastPage = () => { categoriesCurrentPage.value = categoriesTotalPages.value; };

const categoriesPieChartData = computed(() => ({
  labels: categories.value.map(c => c.CategoriesName),
  datasets: [{
    data: categories.value.map(() => 1),
    backgroundColor: appleColors.slice(0, categories.value.length)
  }]
}));

const categoriesBarChartData = computed(() => ({
  labels: categories.value.map(c => c.CategoriesName),
  datasets: [{
    label: 'Categories',
    data: categories.value.map(() => 1),
    backgroundColor: appleColors.slice(0, categories.value.length)
  }]
}));

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
  if (userInfoString) {
    try { userInfoObject.value = JSON.parse(userInfoString); } catch(e) {}
  }
  fetchCategories();
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

.report-page-container {
  width: 100%;
  min-height: 100vh;
  display: grid;
  gap: 0;
  align-items: stretch;
  transition: all 0.3s ease;
  overflow-x: hidden;
}

.main-content {
  grid-column: 2 / 3;
  flex: 1 1 auto;
  min-width: 0;
  overflow: auto;
  transition: all 0.3s ease;
  padding: 0.5rem !important;
}

/* Mobile Sidebar Toggle & Backdrop */
.mobile-sidebar-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.42); z-index: 2500;
}

.mobile-sidebar-toggle.mobile-inline-toggle {
  display: none; /* Hidden by default */
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04);
  border: none;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  color: #007AFF;
  transition: all 0.2s ease;
}

.mobile-sidebar-toggle.mobile-inline-toggle:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0,0,0,0.1);
}

.mobile-sidebar-toggle.mobile-inline-toggle i {
  font-size: 1.25rem;
  line-height: 1;
}

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
  
  /* Fix container-fluid spacing on mobile */
  :deep(.container-fluid) {
    padding: 12px !important;
  }
  
  :deep(.dashboard-container > .container-fluid) {
    padding: 12px !important;
  }

  /* Keep the header comfortable on mobile: give the hero content internal padding */
  .dashboard-hero .hero-content {
    padding: 1rem !important;
    flex-direction: column !important;
    align-items: center !important;
    text-align: center !important;
  }

  .mobile-sidebar-toggle.mobile-inline-toggle {
    display: flex; /* Show on mobile */
    margin: 0 0 10px 0 !important; /* place above title */
    align-self: flex-start !important; /* left-align on mobile */
    margin-left: -1rem !important; /* offset the internal padding so button sits at the left edge */
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
}

/* Non-mobile: keep hero left-aligned and inline */
@media (min-width: 769px) {
  .dashboard-hero .hero-content {
    flex-direction: row !important;
    align-items: center !important;
    justify-content: flex-start !important;
    text-align: left !important;
  }
  .mobile-sidebar-toggle.mobile-inline-toggle {
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
