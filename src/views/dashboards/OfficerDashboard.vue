<template>
  <div class="apple-dashboard">
    <!-- Hero Header -->
    <div class="dashboard-hero">
      <div class="hero-content">
        <h1 class="hero-title">Dashboard</h1>
        <p class="hero-subtitle">Real-time insights at a glance</p>
      </div>
    </div>

    <!-- Reports Section -->
    <div class="reports-grid">
        <!-- Categories Report Section -->
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
        <!-- QuestionsAnswers Report Section -->
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
        <!-- Questions Need Review Report Section -->
        <QuestionsNeedReviewReport
          :categoriesNameMap="categoriesNameMap"
          :formatThaiDateTime="formatThaiDateTime"
          :daysThreshold="30"
        />
        <!-- Keywords Report Section -->
        <KeywordsReport
          :keywords="keywords"
          :keywordsLoading="keywordsLoading"
          :keywordsError="keywordsError"
          :keywordsPieChartData="keywordsPieChartData"
          :keywordsBarChartData="keywordsBarChartData"
          :chartOptions="chartOptions"
          :barChartOptions="barChartOptions"
        />
        <!-- ChatLogHasAnswers Report Section -->
        <ChatLogHasAnswersReport
          :questionsTitleMap="questionsAnswersTitleMap"
          :chartOptions="chartOptions"
          :barChartOptions="barChartOptions"
        />
        <!-- Feedbacks Report Section -->
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
        <!-- ChatLogNoAnswers Report Section -->
        <ChatLogNoAnswersReport
          :chartOptions="chartOptions"
          :barChartOptions="barChartOptions"
        />

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, getCurrentInstance, watch, onUnmounted } from 'vue'; 
import { useRealtime, REALTIME_ENDPOINTS } from '@/composables/useRealtime.js'
import { PieChart, BarChart, DoughnutChart, LineChart } from 'vue-chart-3';
import { Chart as ChartJS, registerables } from 'chart.js';
import { bindSidebarResize } from '@/stores/sidebarState';
import '@/assets/sidebar.css';
import KeywordsReport from './officers/KeywordsReport.vue';
import FeedbacksReport from './officers/FeedbacksReport.vue';
import CategoriesReport from './officers/CategoriesReport.vue';
import QuestionsAnswersReport from './officers/QuestionsAnswersReport.vue';
import QuestionsNeedReviewReport from './officers/QuestionsNeedReviewReport.vue';
import ChatLogHasAnswersReport from './officers/ChatLogHasAnswersReport.vue';
import ChatLogNoAnswersReport from './officers/ChatLogNoAnswersReport.vue';

ChartJS.register(...registerables); 

const { appContext } = getCurrentInstance();
const { $axios } = appContext.config.globalProperties; 

const props = defineProps({
  userInfoObject: Object
});

const searchQueryOfficers = ref(''); 
const searchQueryCategories = ref('');

// --- Officer Report Data ---
const officers = ref([]);
const officerLoading = ref(true);
const officerError = ref(null);

const fetchOfficers = async () => {
  officerLoading.value = true;
  officerError.value = null;
  try {
    const response = await $axios.get('/officers');
    officers.value = response.data?.data || response.data || [];
  } catch (err) {
    console.error('Failed to fetch officer data:', err);
    officerError.value = err.response?.data?.message || 'Failed to load officer data.';
  } finally {
    officerLoading.value = false;
  }
};

// Computed properties for Officer Report Overview
const displayTotalOfficers = computed(() => officers.value.length);
const displayActiveOfficers = computed(() => officers.value.filter(officer => officer.OfficerStatus === 1).length);
const displayInactiveOfficers = computed(() => officers.value.filter(officer => officer.OfficerStatus === 0).length);

// Chart Data for Officer Report (Pie/Doughnut Chart: Active vs. Inactive)
const officerChartData = computed(() => ({
  labels: ['Active', 'Inactive/Other'],
  datasets: [
    {
      data: [displayActiveOfficers.value, displayInactiveOfficers.value],
      backgroundColor: ['#28A745', '#DC3545'],
    },
  ],
}));

// Bar Chart: Officers by Status
const officerBarChartData = computed(() => ({
  labels: ['Active', 'Inactive/Other'],
  datasets: [
    {
      label: 'Officers',
      data: [displayActiveOfficers.value, displayInactiveOfficers.value],
      backgroundColor: ['#28A745', '#DC3545'],
    },
  ],
}));

// Apple Colors Palette
const appleColors = [
  '#007AFF', // Blue
  '#5856D6', // Purple
  '#FF9500', // Orange
  '#34C759', // Green
  '#FF3B30', // Red
  '#AF52DE', // Violet
  '#00C7BE', // Teal
  '#FF2D55', // Pink
  '#5AC8FA', // Light Blue
  '#FFCC00', // Yellow
  '#FF6482', // Coral
  '#30D158', // Mint
];

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  aspectRatio: 2.5, 
  cutout: '65%',
  plugins: {
    legend: {
      position: 'right',
      labels: {
        padding: 20,
        font: {
          family: "-apple-system, 'SF Pro Display', sans-serif",
          size: 12,
          weight: '500'
        },
        color: '#1D1D1F',
        usePointStyle: true,
        pointStyle: 'circle'
      }
    },
    title: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(29, 29, 31, 0.9)',
      titleColor: '#FFFFFF',
      bodyColor: '#FFFFFF',
      padding: 16,
      titleFont: {
        family: "-apple-system, 'SF Pro Display', sans-serif",
        size: 14,
        weight: '600'
      },
      bodyFont: {
        family: "-apple-system, 'SF Pro Display', sans-serif",
        size: 13
      },
      cornerRadius: 12,
      displayColors: true,
      boxPadding: 6
    }
  },
  animation: {
    animateRotate: true,
    animateScale: true,
    duration: 800,
    easing: 'easeOutQuart'
  }
});

const barChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: false },
    tooltip: {
      backgroundColor: 'rgba(29, 29, 31, 0.9)',
      titleColor: '#FFFFFF',
      bodyColor: '#FFFFFF',
      padding: 16,
      titleFont: {
        family: "-apple-system, 'SF Pro Display', sans-serif",
        size: 14,
        weight: '600'
      },
      bodyFont: {
        family: "-apple-system, 'SF Pro Display', sans-serif",
        size: 13
      },
      cornerRadius: 12,
      displayColors: true,
      boxPadding: 6
    }
  },
  scales: {
    y: { 
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.06)',
        drawBorder: false
      },
      ticks: {
        font: {
          family: "-apple-system, 'SF Pro Display', sans-serif",
          size: 11
        },
        color: '#8E8E93',
        padding: 8
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          family: "-apple-system, 'SF Pro Display', sans-serif",
          size: 11
        },
        color: '#8E8E93',
        padding: 8
      }
    }
  },
  animation: {
    duration: 800,
    easing: 'easeOutQuart'
  },
  borderRadius: 8,
  borderSkipped: false
});

// --- Pagination State for Officers ---
const officerCurrentPage = ref(1);
const officerItemsPerPage = ref(8); 

// --- Officers Pagination Computed Properties ---
const officerTotalPages = computed(() => {
  return Math.max(1, Math.ceil(officers.value.length / officerItemsPerPage.value));
});
const officerTotalEntries = computed(() => officers.value.length);
const officerStartIndex = computed(() => {
  if (officerTotalEntries.value === 0) return 0;
  return (officerCurrentPage.value - 1) * officerItemsPerPage.value + 1;
});
const officerEndIndex = computed(() => {
  if (officerTotalEntries.value === 0) return 0;
  return Math.min(officerCurrentPage.value * officerItemsPerPage.value, officerTotalEntries.value);
});
const paginatedOfficers = computed(() => {
  const start = (officerCurrentPage.value - 1) * officerItemsPerPage.value;
  const end = start + officerItemsPerPage.value;
  return officers.value.slice(start, end);
});
const officerPagesToShow = computed(() => {
    const total = officerTotalPages.value;
    const current = officerCurrentPage.value;
    const maxButtons = 4;
    if (total <= maxButtons) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 2) {
        return [1, 2, 3, 4];
    }
    if (current >= total - 1) {
        return [total - 3, total - 2, total - 1, total];
    }
    return [current - 1, current, current + 1, current + 2];
});

// --- Officers Pagination Methods ---
function officerGoToPage(page) {
  if (page >= 1 && page <= officerTotalPages.value) {
    officerCurrentPage.value = page;
  }
}
function officerPrevPage() {
  officerGoToPage(Math.max(1, officerCurrentPage.value - 1));
}
function officerNextPage() {
  officerGoToPage(Math.min(officerTotalPages.value, officerCurrentPage.value + 1));
}
function officerFirstPage() {
  officerGoToPage(1);
}
function officerLastPage() {
  officerGoToPage(officerTotalPages.value);
}

watch(searchQueryOfficers, () => {
  officerCurrentPage.value = 1;
});

// --- Keyword Report Data ---
const keywords = ref([]);
const keywordsLoading = ref(true);
const keywordsError = ref(null);

const fetchKeywords = async () => {
  keywordsLoading.value = true;
  keywordsError.value = null;
  try {
    const response = await $axios.get('/keywords');
    keywords.value = response.data;
  } catch (err) {
    keywordsError.value = err.response?.data?.message || 'Failed to load keywords data.';
  } finally {
    keywordsLoading.value = false;
  }
};

// Chart data for keywords
const keywordsPieChartData = computed(() => {
  // Count keywords by KeywordText
  const counts = {};
  keywords.value.forEach(kw => {
    const text = kw.KeywordText ?? 'Unknown';
    counts[text] = (counts[text] || 0) + 1;
  });
  return {
    labels: Object.keys(counts),
    datasets: [
      {
        data: Object.values(counts),
        backgroundColor: ['#007bff', '#28A745', '#DC3545', '#FFC107', '#6c757d', '#17a2b8'],
      },
    ],
  };
});

const keywordsBarChartData = computed(() => {
  // Count keywords by KeywordText
  const counts = {};
  keywords.value.forEach(kw => {
    const text = kw.KeywordText ?? 'Unknown';
    counts[text] = (counts[text] || 0) + 1;
  });
  return {
    labels: Object.keys(counts),
    datasets: [
      {
        label: 'Keyword Count',
        data: Object.values(counts),
        backgroundColor: ['#007bff', '#28A745', '#DC3545', '#FFC107', '#6c757d', '#17a2b8'],
      },
    ],
  };
});

// --- Feedbacks Report Data ---
const feedbacks = ref([]);
const feedbacksLoading = ref(true);
const feedbacksError = ref(null);

const fetchFeedbacks = async () => {
  feedbacksLoading.value = true;
  feedbacksError.value = null;
  try {
    const response = await $axios.get('/feedbacks');
    feedbacks.value = response.data;
  } catch (err) {
    feedbacksError.value = err.response?.data?.message || 'Failed to load feedbacks data.';
  } finally {
    feedbacksLoading.value = false;
  }
};

// Realtime subscriptions: refresh on WS messages
// Note: ChatLogHasAnswers and ChatLogNoAnswers handle their own WebSocket connections and refresh internally
const { statusMap } = useRealtime([
  { name: 'feedbacks', endpoint: REALTIME_ENDPOINTS.feedbacks, onUpdate: () => fetchFeedbacks() },
  { name: 'categories', endpoint: REALTIME_ENDPOINTS.categories, onUpdate: () => fetchCategories && fetchCategories() },
  { name: 'keywords', endpoint: REALTIME_ENDPOINTS.keywords, onUpdate: () => fetchKeywords && fetchKeywords() },
  { name: 'questionsAnswers', endpoint: REALTIME_ENDPOINTS.questionsAnswers, onUpdate: () => fetchQuestionsAnswers && fetchQuestionsAnswers() },
]);

function isLive(name) {
  try { return !!(statusMap.value && statusMap.value[name]) } catch (_) { return false }
}

const isAnyLive = computed(() => {
  try {
    const m = statusMap.value || {}
    return Object.values(m).some(Boolean)
  } catch (_) {
    return false
  }
})

// Chart data for feedbacks
const feedbacksPieChartData = computed(() => {
  // Count feedbacks by value
  const counts = {};
  feedbacks.value.forEach(fb => {
    const val = fb.FeedbackValue ?? 'Unknown';
    counts[val] = (counts[val] || 0) + 1;
  });
  return {
    labels: Object.keys(counts),
    datasets: [
      {
        data: Object.values(counts),
        backgroundColor: ['#28A745', '#DC3545', '#FFC107', '#007bff', '#6c757d'],
      },
    ],
  };
});

const feedbacksBarChartData = computed(() => {
  // Map 0 -> unlike icon, 1 -> like icon, others as string
  const counts = {};
  feedbacks.value.forEach(fb => {
    let label = '';
    if (fb.FeedbackValue === 1) label = '👍';
    else if (fb.FeedbackValue === 0) label = '👎';
    else label = String(fb.FeedbackValue ?? 'Unknown');
    counts[label] = (counts[label] || 0) + 1;
  });
  const labels = Object.keys(counts);
  const data = Object.values(counts);
  // Use green for like, red for unlike, others gray
  const colorMap = { '👍': '#28A745', '👎': '#DC3545' };
  const colors = labels.map(l => colorMap[l] || '#6c757d');
  return {
    labels,
    datasets: [
      {
        label: 'Feedback Count',
        data,
        backgroundColor: colors,
      },
    ],
  };
});

// --- Categories Report Data ---
const categories = ref([]);
const categoriesLoading = ref(true);
const categoriesError = ref(null);

const fetchCategories = async () => {
  categoriesLoading.value = true;
  categoriesError.value = null;
  try {
    const response = await $axios.get('/getcategories');
    categories.value = response.data?.categories || [];
  } catch (err) {
    categoriesError.value = err.response?.data?.message || 'Failed to load categories data.';
  } finally {
    categoriesLoading.value = false;
  }
};

// --- Categories Pagination State ---
const categoriesCurrentPage = ref(1);
const categoriesItemsPerPage = ref(8);

// --- Categories Filtered List ---
const filteredCategories = computed(() => {
  // Defensive: always return [] if categories.value is not an array
  if (!Array.isArray(categories.value)) return [];
  const data = categories.value;
  if (!searchQueryCategories.value) { 
    return data;
  }
  const query = searchQueryCategories.value.toLowerCase(); 
  return data.filter(cat =>
    (cat.CategoriesID && cat.CategoriesID.toString().includes(query)) ||
    (cat.CategoriesName && cat.CategoriesName.toLowerCase().includes(query)) ||
    (cat.ParentCategoriesID && cat.ParentCategoriesID.toString().includes(query)) ||
    (cat.CategoriesPDF && cat.CategoriesPDF.toLowerCase().includes(query))
  );
});

// --- Categories Pagination Computed Properties ---
const categoriesTotalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredCategories.value.length / categoriesItemsPerPage.value));
});
const categoriesTotalEntries = computed(() => filteredCategories.value.length);
const categoriesStartIndex = computed(() => {
  if (categoriesTotalEntries.value === 0) return 0;
  return (categoriesCurrentPage.value - 1) * categoriesItemsPerPage.value + 1;
});
const categoriesEndIndex = computed(() => {
  if (categoriesTotalEntries.value === 0) return 0;
  return Math.min(categoriesCurrentPage.value * categoriesItemsPerPage.value, categoriesTotalEntries.value);
});
const paginatedCategories = computed(() => {
  const start = (categoriesCurrentPage.value - 1) * categoriesItemsPerPage.value;
  const end = start + categoriesItemsPerPage.value;
  return filteredCategories.value.slice(start, end);
});
const categoriesPagesToShow = computed(() => {
    const total = categoriesTotalPages.value;
    const current = categoriesCurrentPage.value;
    const maxButtons = 4;
    if (total <= maxButtons) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 2) {
        return [1, 2, 3, 4];
    }
    if (current >= total - 1) {
        return [total - 3, total - 2, total - 1, total];
    }
    return [current - 1, current, current + 1, current + 2];
});

// --- Categories Pagination Methods ---
function categoriesGoToPage(page) {
  if (page >= 1 && page <= categoriesTotalPages.value) {
    categoriesCurrentPage.value = page;
  }
}
function categoriesPrevPage() {
  categoriesGoToPage(Math.max(1, categoriesCurrentPage.value - 1));
}
function categoriesNextPage() {
  categoriesGoToPage(Math.min(categoriesTotalPages.value, categoriesCurrentPage.value + 1));
}
function categoriesFirstPage() {
  categoriesGoToPage(1);
}
function categoriesLastPage() {
  categoriesGoToPage(categoriesTotalPages.value);
}

watch(searchQueryCategories, () => {
  categoriesCurrentPage.value = 1;
});

// --- QuestionsAnswers Report Data ---
const questionsAnswers = ref([]);
const questionsAnswersLoading = ref(true);
const questionsAnswersError = ref(null);

const fetchQuestionsAnswers = async () => {
  questionsAnswersLoading.value = true;
  questionsAnswersError.value = null;
  try {
    const response = await $axios.get('/questionsanswers');
    const _qa_data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
    questionsAnswers.value = normalize(_qa_data);
    questionsAnswers.value = response.data;
  } catch (err) {
    questionsAnswersError.value = err.response?.data?.message || 'Failed to load questions-answers data.';
  } finally {
    questionsAnswersLoading.value = false;
  }
};

// Replace the existing questionsAnswersPieChartData / questionsAnswersBarChartData with these:

const questionsAnswersPieChartData = computed(() => {
  if (!Array.isArray(questionsAnswers.value) || questionsAnswers.value.length === 0) {
    return { labels: [], datasets: [{ data: [], backgroundColor: [] }] };
  }
  const counts = {};
  questionsAnswers.value.forEach(qa => {
    // prefer CategoriesName mapped from ID, fallback to the ID or 'Unknown'
    const catName = (categoriesNameMap.value && categoriesNameMap.value[qa.CategoriesID]) ||
                    (qa.CategoriesID != null ? String(qa.CategoriesID) : 'Unknown');
    counts[catName] = (counts[catName] || 0) + 1;
  });
  const labels = Object.keys(counts);
  const data = Object.values(counts);
  const colors = [
    '#007bff', '#28A745', '#DC3545', '#FFC107', '#6c757d', '#17a2b8',
    '#8e44ad', '#e67e22', '#2ecc71', '#e74c3c', '#1abc9c', '#f39c12'
  ];
  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: labels.map((_, i) => colors[i % colors.length]),
      },
    ],
  };
});

const questionsAnswersBarChartData = computed(() => {
  if (!Array.isArray(questionsAnswers.value) || questionsAnswers.value.length === 0) {
    return { labels: [], datasets: [{ label: 'Questions Count', data: [], backgroundColor: [] }] };
  }
  const counts = {};
  questionsAnswers.value.forEach(qa => {
    const catName = (categoriesNameMap.value && categoriesNameMap.value[qa.CategoriesID]) ||
                    (qa.CategoriesID != null ? String(qa.CategoriesID) : 'Unknown');
    counts[catName] = (counts[catName] || 0) + 1;
  });
  const labels = Object.keys(counts);
  const data = Object.values(counts);
  const colors = [
    '#007bff', '#28A745', '#DC3545', '#FFC107', '#6c757d', '#17a2b8',
    '#8e44ad', '#e67e22', '#2ecc71', '#e74c3c', '#1abc9c', '#f39c12'
  ];
  return {
    labels,
    datasets: [
      {
        label: 'Questions Count',
        data,
        backgroundColor: labels.map((_, i) => colors[i % colors.length]),
      },
    ],
  };
});

// --- Keyword Search (Officer Dashboard) ---
const keywordSearch = ref('');

// Filtered questionsAnswers for keyword search
const filteredQuestionsAnswers = computed(() => {
  if (!Array.isArray(questionsAnswers.value)) return [];
  if (!keywordSearch.value) return questionsAnswers.value;
  const query = keywordSearch.value.toLowerCase();
  return questionsAnswers.value.filter(qa =>
    (qa.QuestionTitle && qa.QuestionTitle.toLowerCase().includes(query)) ||
    (qa.AnswerText && qa.AnswerText.toLowerCase().includes(query)) ||
    (qa.CategoriesID != null && String(qa.CategoriesID).includes(query)) ||
    (qa.OfficerID != null && String(qa.OfficerID).includes(query))
  );
});

// --- Officer Dashboard Computed Properties ---
const totalQuestions = computed(() => questionsAnswers.value.length);
const totalFilteredQuestions = computed(() => filteredQuestionsAnswers.value.length);

// --- Officer Dashboard Pagination ---
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Total pages based on filtered questions
const totalPages = computed(() => {
  return Math.ceil(totalFilteredQuestions.value / itemsPerPage.value) || 1;
});

// Paginated questions
const paginatedQuestions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredQuestionsAnswers.value.slice(start, end);
});

// --- Officer Dashboard Methods ---
function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}
function prevPage() {
  goToPage(currentPage.value - 1);
}
function nextPage() {
  goToPage(currentPage.value + 1);
}
function firstPage() {
  goToPage(1);
}
function lastPage() {
  goToPage(totalPages.value);
}

// Watch for search query changes
watch(keywordSearch, () => {
  currentPage.value = 1;
});

// --- Categories Name Map ---
const categoriesNameMap = computed(() => {
  const map = {};
  categories.value.forEach(cat => {
    map[cat.CategoriesID] = cat.CategoriesName;
  });
  return map;
});

// --- QuestionsAnswers Title Map ---
const questionsAnswersTitleMap = computed(() => {
  const map = {};
  questionsAnswers.value.forEach(qa => {
    map[qa.QuestionsAnswersID] = qa.QuestionTitle;
  });
  return map;
});

const unbindSidebarResize = ref(null);

onMounted(() => {
  if (typeof bindSidebarResize === 'function') {
    unbindSidebarResize.value = bindSidebarResize();
  }
  fetchOfficers(); 
  fetchKeywords();
  fetchFeedbacks();
  fetchCategories();
  fetchQuestionsAnswers();
});

onUnmounted(() => {
  if (typeof unbindSidebarResize.value === 'function') unbindSidebarResize.value();
});

function formatThaiDateTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// Chart data for categories (add if missing)
const categoriesPieChartData = computed(() => {
  if (!Array.isArray(categories.value) || categories.value.length === 0) {
    return { labels: [], datasets: [{ data: [], backgroundColor: [] }] };
  }
  const counts = {};
  categories.value.forEach(cat => {
    const label = (cat.CategoriesName && cat.CategoriesName.toString()) || (cat.CategoriesID && cat.CategoriesID.toString()) || 'Unknown';
    counts[label] = (counts[label] || 0) + 1;
  });
  const labels = Object.keys(counts);
  const data = Object.values(counts);
  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: labels.map((_, i) => appleColors[i % appleColors.length]),
        borderWidth: 0,
        spacing: 2,
        borderRadius: 4,
        hoverOffset: 8
      },
    ],
  };
});

const categoriesBarChartData = computed(() => {
  if (!Array.isArray(categories.value) || categories.value.length === 0) {
    return { labels: [], datasets: [{ label: 'Category Count', data: [], backgroundColor: [] }] };
  }
  const counts = {};
  categories.value.forEach(cat => {
    const label = (cat.CategoriesName && cat.CategoriesName.toString()) || (cat.CategoriesID && cat.CategoriesID.toString()) || 'Unknown';
    counts[label] = (counts[label] || 0) + 1;
  });
  const labels = Object.keys(counts);
  const data = Object.values(counts);
  return {
    labels,
    datasets: [
      {
        label: 'Category Count',
        data,
        backgroundColor: labels.map((_, i) => appleColors[i % appleColors.length]),
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 24,
        maxBarThickness: 32
      },
    ],
  };
});
</script>

<style scoped>
@import '@/assets/pagination-styles.css';

/* Apple System Fonts */
.apple-dashboard {
  font-family: -apple-system, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  background: linear-gradient(180deg, #F5F5F7 0%, #FFFFFF 100%);
  padding: 2rem;
  animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Hero Header */
.dashboard-hero {
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  border-radius: 28px;
  padding: 3rem 2rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 122, 255, 0.15), 0 8px 40px rgba(88, 86, 214, 0.1);
  animation: slideDown 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}

.dashboard-hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: heroGlow 8s ease-in-out infinite alternate;
}

@keyframes heroGlow {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(-50px, 50px) scale(1.1); }
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #FFFFFF;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
  text-align: center;
}

.hero-subtitle {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-weight: 400;
}

/* Reports Grid */
.reports-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.reports-grid > :deep(*) {
  animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) backwards;
}

.reports-grid > :deep(*:nth-child(1)) { animation-delay: 0s; }
.reports-grid > :deep(*:nth-child(2)) { animation-delay: 0.08s; }
.reports-grid > :deep(*:nth-child(3)) { animation-delay: 0.16s; }
.reports-grid > :deep(*:nth-child(4)) { animation-delay: 0.24s; }
.reports-grid > :deep(*:nth-child(5)) { animation-delay: 0.32s; }
.reports-grid > :deep(*:nth-child(6)) { animation-delay: 0.4s; }
.reports-grid > :deep(*:nth-child(7)) { animation-delay: 0.48s; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Card Style Override */
.reports-grid :deep(.card) {
  background: #FFFFFF;
  border: none;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.reports-grid :deep(.card:hover) {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04);
}

.reports-grid :deep(.card-header) {
  background: transparent;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  font-weight: 600;
  color: #1D1D1F;
}

/* Chart Area Styling */
.reports-grid :deep(.chart-area) {
  background: linear-gradient(135deg, #FAFAFA 0%, #FFFFFF 100%);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
}

.reports-grid :deep(.chart-area:hover) {
  background: linear-gradient(135deg, #F5F5F7 0%, #FFFFFF 100%);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.04);
}

/* Table Styling */
.reports-grid :deep(.table) {
  border-collapse: separate;
  border-spacing: 0;
}

.reports-grid :deep(.table thead th) {
  background: #F5F5F7;
  color: #1D1D1F;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 1rem;
  border: none;
}

.reports-grid :deep(.table thead th:first-child) {
  border-radius: 12px 0 0 12px;
}

.reports-grid :deep(.table thead th:last-child) {
  border-radius: 0 12px 12px 0;
}

.reports-grid :deep(.table tbody tr) {
  transition: all 0.2s ease;
}

.reports-grid :deep(.table tbody tr:hover) {
  background: rgba(0, 122, 255, 0.04);
}

.reports-grid :deep(.table tbody td) {
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  vertical-align: middle;
}

/* Badge Styling */
.reports-grid :deep(.badge) {
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
}

.reports-grid :deep(.badge.bg-success),
.reports-grid :deep(.badge.bg-primary) {
  background: linear-gradient(135deg, #34C759 0%, #30D158 100%) !important;
}

.reports-grid :deep(.badge.bg-info) {
  background: linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%) !important;
}

.reports-grid :deep(.badge.bg-secondary) {
  background: linear-gradient(135deg, #8E8E93 0%, #AEAEB2 100%) !important;
}

/* Search Input Styling */
.reports-grid :deep(.search-input-group input) {
  background: #F5F5F7;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.reports-grid :deep(.search-input-group input:focus) {
  background: #FFFFFF;
  border-color: #007AFF;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
}

/* Pagination Styling */
.reports-grid :deep(.pagination .page-link) {
  border: none;
  color: #007AFF;
  font-weight: 500;
  padding: 0.5rem 0.875rem;
  margin: 0 2px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.reports-grid :deep(.pagination .page-link:hover) {
  background: rgba(0, 122, 255, 0.1);
}

.reports-grid :deep(.pagination .page-item.active .page-link) {
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  color: #FFFFFF;
}

/* Legacy Support */
.question-text-cell {
  max-height: 42px;
  overflow-y: auto;
  white-space: pre-line;
  word-break: break-word;
  background: #f8f9fa;
  border-radius: 4px;
  padding: 4px 8px;
}

/* Responsive */
@media (max-width: 768px) {
  .apple-dashboard { 
    padding: 1rem; 
  }
  .dashboard-hero { 
    padding: 2rem 1.5rem;
    border-radius: 20px;
    position: relative;
  }
  .hero-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .mobile-sidebar-toggle {
    position: absolute;
    left: 1rem;
    top: 1rem;
  }
  .hero-title { 
    font-size: 1.75rem;
    text-align: center;
  }
  .hero-subtitle {
    text-align: center;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
