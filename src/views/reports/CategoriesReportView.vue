<template>
  <div class="report-page-container">
    <Sidebar :userType="userType" :userInfoObject="userInfoObject" />
    <main class="main-content flex-grow-1">
      <div class="apple-dashboard">
        <div class="dashboard-hero">
          <div class="hero-content">
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
import CategoriesReport from '@/views/dashboards/officers/CategoriesReport.vue';
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

// Categories data
const categories = ref([]);
const categoriesLoading = ref(true);
const categoriesError = ref(null);
const searchQueryCategories = ref('');
const categoriesCurrentPage = ref(1);
const categoriesItemsPerPage = ref(10);

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
  padding: 1rem;
}
</style>
