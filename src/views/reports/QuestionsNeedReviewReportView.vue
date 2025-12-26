<template>
  <div class="report-page-container">
    <Sidebar :userType="userType" :userInfoObject="userInfoObject" />
    <main class="main-content flex-grow-1">
      <div class="apple-dashboard">
        <div class="dashboard-hero">
          <div class="hero-content">
            <h1 class="hero-title">Questions Need Review</h1>
            <p class="hero-subtitle">คำถามที่ต้องทบทวน</p>
          </div>
        </div>
        <div class="reports-grid">
          <QuestionsNeedReviewReport
            :categoriesNameMap="categoriesNameMap"
            :formatThaiDateTime="formatThaiDateTime"
            :daysThreshold="30"
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
import QuestionsNeedReviewReport from '@/views/dashboards/officers/QuestionsNeedReviewReport.vue';
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
const categories = ref([]);

const fetchCategories = async () => {
  try {
    const response = await $axios.get('/categories');
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
