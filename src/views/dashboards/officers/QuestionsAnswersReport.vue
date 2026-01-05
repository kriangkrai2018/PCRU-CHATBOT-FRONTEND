<template>
  <div class="dashboard-container">
    <!-- Main Content -->
    <div class="container-fluid pt-2 px-4 pb-5">
      <!-- Header with Apple-style Icon -->
      <div class="d-flex flex-column flex-md-row align-items-center justify-content-between mb-4 fade-in-up gap-3 gap-md-0">
        <div class="d-flex flex-column flex-md-row align-items-center gap-3 text-center text-md-start">
          <!-- New Apple Icon Box -->
          <div class="apple-icon-box purple-gradient">
            <i class="bi bi-chat-quote-fill text-white"></i>
          </div>
          <div>
            <h3 class="page-title m-0">Questions & Answers Report</h3>
            <span class="text-secondary small">Overview & Feedback Stats</span>
          </div>
        </div>
        
        <!-- Live Status Badge -->
        <div class="d-flex align-items-center gap-2">
          <div class="apple-status-badge" :class="{ 'online': wsConnected }">
            <span class="status-dot"></span>
            <span>{{ wsConnected ? 'Live' : 'Offline' }}</span>
          </div>
        </div>
      </div>

      <div v-if="questionsAnswersLoading" class="text-center py-5 fade-in">
        <div class="apple-spinner"></div>
        <p class="mt-3 text-secondary">Loading data...</p>
      </div>

      <div v-else-if="questionsAnswersError" class="alert apple-alert-danger mx-auto" role="alert">
        <i class="bi bi-exclamation-circle-fill me-2"></i> {{ questionsAnswersError }}
      </div>

      <div v-else class="fade-in-up" style="animation-delay: 0.1s;">
        <!-- Stats Cards Row (Optional Summary) -->
        <div class="row mb-4 g-3">
          <div class="col-md-4">
            <div class="apple-stat-card">
              <div class="stat-icon-wrapper blue-gradient">
                <i class="bi bi-question-circle-fill"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ totalEntries }}</div>
                <div class="stat-label">Total Questions</div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="apple-stat-card">
              <div class="stat-icon-wrapper green-gradient">
                <i class="bi bi-hand-thumbs-up-fill"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ totalLikes }}</div>
                <div class="stat-label">Total Likes</div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="apple-stat-card">
              <div class="stat-icon-wrapper red-gradient">
                <i class="bi bi-hand-thumbs-down-fill"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ totalUnlikes }}</div>
                <div class="stat-label">Total Unlikes</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section (hidden when no data) -->
        <div v-if="chartTotal > 0" class="row mb-4 g-4">
          <div class="col-12 col-lg-6">
            <div class="apple-card chart-card h-100">
              <div class="card-header-clean">
                <h5>Keyword Frequency</h5>
              </div>
              <div class="chart-area">
                <canvas ref="scatterCanvas"></canvas>
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-6">
            <div class="apple-card chart-card h-100">
              <div class="card-header-clean">
                <h5>Category Distribution</h5>
              </div>
              <div class="chart-area">
                <canvas ref="barCanvas"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters Section -->
        <AppleFilters
          v-model="qaFilters"
          :sort-options="qaSortOptions"
          :statuses="qaStatuses"
          status-label="สถานะ"
          :show-date-range="true"
          :show-date-presets="true"
          date-preset-direction="future"
          :show-number-range="false"
          @change="onFiltersChange"
        />

        <!-- Table Section -->
        <div class="apple-card table-wrapper">
          <div class="card-header-actions p-3 d-flex justify-content-between align-items-center">
            
            <!-- Redesigned Total Counter -->
            <div class="apple-counter-capsule">
              <span class="label">Total</span>
              <span class="separator">|</span>
              <span class="count">{{ totalEntries }}</span>
            </div>

            <div class="search-container">
              <i class="bi bi-search search-icon"></i>
              <input
                type="text"
                class="search-input"
                placeholder="Search..."
                v-model="localSearch"
              />
              <button v-if="localSearch" class="search-clear" @click="localSearch = ''">
                <i class="bi bi-x-circle-fill"></i>
              </button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table apple-table mb-0">
              <thead>
                <tr>
                  <th class="ps-4">ID</th>
                  <th>Question Title</th>
                  <th>Review Date</th>
                  <th>Answer Preview</th>
                  <th>Category</th>
                  <th>Keywords</th>
                  <th class="text-center">👍 Like</th>
                  <th class="text-center">👎 Unlike</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="qa in paginatedQuestions" :key="qa.QuestionsAnswersID">
                  <tr class="align-middle apple-row">
                    <td class="ps-4 fw-medium text-secondary" data-label="ID">{{ qa.QuestionsAnswersID }}</td>
                    <td class="py-3" data-label="Question Title">
                      <div class="question-text-cell fw-medium text-dark" :title="qa.QuestionTitle">{{ qa.QuestionTitle }}</div>
                    </td>
                    <td class="py-3" data-label="Review Date">
                      <span 
                        :class="['apple-badge', getReviewDateBadgeClass(qa.ReviewDate)]"
                        data-bs-toggle="tooltip" 
                        data-bs-placement="top" 
                        :title="formatFullDateTime(qa.ReviewDate)"
                      >
                        {{ formatRelativeTime(qa.ReviewDate) }}
                      </span>
                    </td>
                    <td class="py-3" data-label="Answer Preview">
                      <div class="question-text-cell text-muted small" :title="qa.QuestionText">{{ truncateText(qa.QuestionText, 60) }}</div>
                    </td>
                    <td class="py-3" data-label="Category">
                      <span
                        class="tag-badge"
                        :style="{ backgroundColor: tagColors[(qa.CategoriesID || 0) % tagColors.length] + '20', color: tagColors[(qa.CategoriesID || 0) % tagColors.length] }"
                      >
                        {{ categoriesNameMapSafe[qa.CategoriesID] || qa.CategoriesID }}
                      </span>
                    </td>
                    <td class="py-3" data-label="Keywords">
                      <div class="d-flex flex-wrap gap-1" v-if="qa.keywords && qa.keywords.length">
                        <span
                          v-for="(k, i) in qa.keywords.slice(0, 3)"
                          :key="k.KeywordID || (k.KeywordText + i)"
                          class="keyword-tag"
                        >
                          {{ k.KeywordText }}
                        </span>
                        <span v-if="qa.keywords.length > 3" class="keyword-tag-more">+{{ qa.keywords.length - 3 }}</span>
                      </div>
                      <span v-else class="text-muted small opacity-50">—</span>
                    </td>
                    <td class="py-3 text-center" data-label="Like">
                      <div class="feedback-stat-container justify-content-center">
                        <div
                          class="feedback-stat like-stat"
                          :class="{ 'has-count': qa.likeCount > 0, 'zero-count': qa.likeCount === 0 }"
                          @click.prevent="goToFeedbacks(qa.QuestionsAnswersID)"
                        >
                          <div class="feedback-icon-wrapper">
                            <i class="bi bi-hand-thumbs-up-fill"></i>
                          </div>
                          <span class="feedback-count">{{ qa.likeCount || 0 }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="py-3 text-center" data-label="Unlike">
                      <div class="feedback-stat-container justify-content-center">
                        <div
                          class="feedback-stat unlike-stat"
                          :class="{ 'has-count': qa.unlikeCount > 0, 'zero-count': qa.unlikeCount === 0 }"
                          @click.prevent="goToFeedbacks(qa.QuestionsAnswersID)"
                        >
                          <div class="feedback-icon-wrapper">
                            <i class="bi bi-hand-thumbs-down-fill"></i>
                          </div>
                          <span class="feedback-count">{{ qa.unlikeCount || 0 }}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>

                <tr v-if="filteredQuestions.length === 0">
                  <td colspan="8" class="text-center text-muted py-5">
                    <div class="empty-state">
                      <i class="bi bi-search"></i>
                      <p>No data found matching your search</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="d-flex justify-content-between align-items-center p-3 border-top bg-white rounded-bottom-4">
            <div class="small text-secondary">
              Showing {{ startIndex }} - {{ endIndex }} of {{ totalEntries }}
            </div>
            <nav aria-label="Page navigation">
              <ul class="pagination pagination-sm mb-0 align-items-center">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="firstPage">&laquo;</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="prevPage">&lsaquo;</a>
                </li>
                <li v-for="p in pagesToShow" :key="p" class="page-item" :class="{ active: currentPage === p }">
                  <a class="page-link page-num" href="#" @click.prevent="goToPage(p)">{{ p }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages || totalPages === 0 }">
                  <a class="page-link" href="#" @click.prevent="nextPage">&rsaquo;</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages || totalPages === 0 }">
                  <a class="page-link" href="#" @click.prevent="lastPage">&raquo;</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatRelativeTime } from '@/utils/formatTime';
import { ref, computed, watch, onMounted, onUnmounted, getCurrentInstance, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { createWebSocketConnection, WS_ENDPOINTS } from '@/config/websocket';
import { Tooltip } from 'bootstrap';
import Chart from 'chart.js/auto';
import ReportSearch from '@/components/ReportSearch.vue';
import AppleFilters from '@/components/AppleFilters.vue';

const scatterCanvas = ref(null);
const barCanvas = ref(null);
let scatterChart = null;
let barChart = null;

const props = defineProps({
  questionsAnswers: { type: Array, default: () => [] },
  questionsAnswersLoading: { type: Boolean, default: false },
  questionsAnswersError: { type: [String, null], default: null },
  questionsAnswersPieChartData: Object,
  questionsAnswersBarChartData: Object,
  chartOptions: Object,
  barChartOptions: Object,
  categoriesNameMap: { type: Object, default: () => ({}) },
  formatThaiDateTime: Function,
});

const emit = defineEmits(['refresh']);

// Filters state
const qaFilters = ref({
  sortBy: 'date',
  sortOrder: 'desc',
  status: '',
  dateFrom: '',
  dateTo: '',
  datePreset: ''
});

const qaSortOptions = [
  { value: 'date', label: 'วันที่ตรวจสอบ' },
  { value: 'id', label: 'ID' },
  { value: 'title', label: 'หัวข้อคำถาม' },
  { value: 'likes', label: 'ถูกใจมากสุด' },
  { value: 'unlikes', label: 'ไม่พอใจมากสุด' },
];

const qaStatuses = [
  { value: 'ok', label: 'ปกติ', icon: 'bi bi-check-circle-fill', color: 'status-green' },
  { value: 'expiring', label: 'ใกล้หมดอายุ', icon: 'bi bi-exclamation-triangle-fill', color: 'status-orange' },
  { value: 'expired', label: 'หมดอายุ', icon: 'bi bi-x-circle-fill', color: 'status-red' },
];

const onFiltersChange = () => {
  currentPage.value = 1;
};

// WebSocket state
const wsConnected = ref(false);
const { appContext } = getCurrentInstance();
const $axios = appContext.config.globalProperties.$axios;
let ws = null;
const router = useRouter();

// Added: color palette for charts
const tagColors = ['#0071e3', '#34C759', '#FF3B30', '#FF9500', '#AF52DE', '#5856D6', '#FF2D55', '#5AC8FA'];

onMounted(() => {
  initTooltips();
  
  ws = createWebSocketConnection(WS_ENDPOINTS.QUESTIONS_ANSWERS, {
    axios: $axios,
    onMessage: (message) => {
      if (message.type === 'QUESTION_ANSWER_UPDATE') {
        emit('refresh');
      }
    },
    onOpen: () => {
      wsConnected.value = true;
    },
    onClose: () => {
      wsConnected.value = false;
    },
  });

  // Ensure charts initialize on mount
  nextTick(() => initCharts());
});

onUnmounted(() => {
  if (ws) ws.disconnect();
});

// local search + pagination
const localSearch = ref('');
watch(localSearch, () => { currentPage.value = 1; });

// safe source array
const allQuestions = computed(() => Array.isArray(props.questionsAnswers) ? props.questionsAnswers : []);

// categories name safe map
const categoriesNameMapSafe = computed(() => props.categoriesNameMap || {});

// Helper to get item status based on ReviewDate
const getItemStatus = (item) => {
  if (!item.ReviewDate) return 'ok';
  const now = new Date();
  const reviewDate = new Date(item.ReviewDate);
  const diffDays = Math.floor((reviewDate - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays <= 7) return 'expiring';
  return 'ok';
};

// filtered by search and filters
const filteredQuestions = computed(() => {
  let result = [...allQuestions.value];
  
  // Search filter
  const q = (localSearch.value || '').toString().trim().toLowerCase();
  if (q) {
    result = result.filter(item => {
      const id = item.QuestionsAnswersID != null ? String(item.QuestionsAnswersID).toLowerCase() : '';
      const title = item.QuestionTitle ? String(item.QuestionTitle).toLowerCase() : '';
      const text = item.QuestionText ? String(item.QuestionText).toLowerCase() : '';
      const catName = (categoriesNameMapSafe.value[item.CategoriesID] || item.CategoriesID || '').toString().toLowerCase();
      const keywordsStr = item.keywords ? item.keywords.map(k => k.KeywordText).join(' ').toLowerCase() : '';
      const reviewDate = item.ReviewDate ? String(item.ReviewDate).toLowerCase() : '';
      return id.includes(q) || title.includes(q) || text.includes(q) || keywordsStr.includes(q) || catName.includes(q) || reviewDate.includes(q);
    });
  }
  
  // Status filter
  if (qaFilters.value.status) {
    result = result.filter(item => getItemStatus(item) === qaFilters.value.status);
  }
  
  // Date range filter
  if (qaFilters.value.dateFrom) {
    const fromDate = new Date(qaFilters.value.dateFrom);
    result = result.filter(item => {
      if (!item.ReviewDate) return false;
      return new Date(item.ReviewDate) >= fromDate;
    });
  }
  if (qaFilters.value.dateTo) {
    const toDate = new Date(qaFilters.value.dateTo);
    toDate.setHours(23, 59, 59, 999);
    result = result.filter(item => {
      if (!item.ReviewDate) return false;
      return new Date(item.ReviewDate) <= toDate;
    });
  }
  
  // Sorting
  const sortBy = qaFilters.value.sortBy;
  const sortOrder = qaFilters.value.sortOrder;
  result.sort((a, b) => {
    let valA, valB;
    switch (sortBy) {
      case 'date':
        valA = a.ReviewDate ? new Date(a.ReviewDate).getTime() : 0;
        valB = b.ReviewDate ? new Date(b.ReviewDate).getTime() : 0;
        break;
      case 'id':
        valA = Number(a.QuestionsAnswersID) || 0;
        valB = Number(b.QuestionsAnswersID) || 0;
        break;
      case 'title':
        valA = (a.QuestionTitle || '').toLowerCase();
        valB = (b.QuestionTitle || '').toLowerCase();
        break;
      case 'likes':
        valA = Number(a.likeCount) || 0;
        valB = Number(b.likeCount) || 0;
        break;
      case 'unlikes':
        valA = Number(a.unlikeCount) || 0;
        valB = Number(b.unlikeCount) || 0;
        break;
      default:
        valA = a.QuestionsAnswersID;
        valB = b.QuestionsAnswersID;
    }
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  
  return result;
});

// Chart total - used to hide charts when no data
const chartTotal = computed(() => {
  return allQuestions.value.length;
});

// pagination
const currentPage = ref(1);
const itemsPerPage = ref(5);

const totalEntries = computed(() => filteredQuestions.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(totalEntries.value / itemsPerPage.value)));
const startIndex = computed(() => totalEntries.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1);
const endIndex = computed(() => totalEntries.value === 0 ? 0 : Math.min(currentPage.value * itemsPerPage.value, totalEntries.value));
const paginatedQuestions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredQuestions.value.slice(start, start + itemsPerPage.value);
});

// stats totals
const totalLikes = computed(() => allQuestions.value.reduce((acc, curr) => acc + (Number(curr.likeCount) || 0), 0));
const totalUnlikes = computed(() => allQuestions.value.reduce((acc, curr) => acc + (Number(curr.unlikeCount) || 0), 0));

// pages to show (max 4)
const pagesToShow = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const maxButtons = 4;
  if (total <= maxButtons) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 2) return [1,2,3,4];
  if (current >= total - 1) return [total-3, total-2, total-1, total];
  return [current-1, current, current+1, current+2];
});

function goToPage(p) { if (p >= 1 && p <= totalPages.value) currentPage.value = p; }
function prevPage() { goToPage(Math.max(1, currentPage.value - 1)); }
function nextPage() { goToPage(Math.min(totalPages.value, currentPage.value + 1)); }
function firstPage() { goToPage(1); }
function lastPage() { goToPage(totalPages.value); }

// Initialize Bootstrap tooltips
const initTooltips = () => {
  nextTick(() => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new Tooltip(tooltipTriggerEl));
  });
};

// Watch paginated data to reinitialize tooltips
watch(paginatedQuestions, () => {
  initTooltips();
});

// Helper: Truncate Text
function truncateText(text, length) {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

// Format full date time for tooltip (date only)
function formatFullDateTime(timestamp) {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp;
  return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Badge class helper
function getReviewDateBadgeClass(timestamp) {
  if (!timestamp) return 'apple-badge-gray';
  const now = new Date();
  const reviewDate = new Date(timestamp);
  const diffDays = Math.floor((reviewDate - now) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'apple-badge-red'; // Expired
  if (diffDays <= 7) return 'apple-badge-orange'; // Expiring soon
  return 'apple-badge-green'; // OK
}

// Chart data: Category distribution (Bar chart)
const categoryCounts = computed(() => {
  const counts = {};
  const list = allQuestions.value || [];
  list.forEach(qa => {
    const id = qa.CategoriesID;
    const nameFromMap = categoriesNameMapSafe.value[id];
    const resolvedName = nameFromMap || qa.CategoriesName || (id != null ? `Category ${id}` : '');
    if (!resolvedName) return;
    counts[resolvedName] = (counts[resolvedName] || 0) + 1;
  });
  return counts;
});

const barChartData = computed(() => ({
  labels: Object.keys(categoryCounts.value).length ? Object.keys(categoryCounts.value) : ['No data'],
  datasets: [{
    label: 'Questions by Category',
    data: Object.values(categoryCounts.value).length ? Object.values(categoryCounts.value) : [0],
    backgroundColor: Object.keys(categoryCounts.value).map((_, i) => tagColors[i % tagColors.length]),
    borderWidth: 0,
    borderRadius: 6
  }]
}));

// Chart data: Keywords scatter (showing keyword frequency)
const keywordCounts = computed(() => {
  const counts = {};
  allQuestions.value.forEach(qa => {
    if (qa.keywords && qa.keywords.length) {
      qa.keywords.forEach(k => {
        const text = k.KeywordText;
        counts[text] = (counts[text] || 0) + 1;
      });
    }
  });
  return counts;
});

const scatterChartData = computed(() => {
  const entries = Object.entries(keywordCounts.value);
  const hasData = entries.length > 0;
  return {
    datasets: [{
      label: 'Keyword Frequency',
      data: hasData ? entries.map((entry, i) => ({ x: i, y: entry[1] })) : [{ x: 0, y: 0 }],
      backgroundColor: (hasData ? entries : [0]).map((_, i) => tagColors[i % tagColors.length]),
      pointRadius: 6,
      pointHoverRadius: 8
    }],
    labels: hasData ? entries.map(e => e[0]) : ['No data']
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } },
    tooltip: {
      backgroundColor: 'rgba(0,0,0,0.8)',
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: function(context) {
          if (context.parsed.y !== null) {
            const label = scatterChartData.value.labels[context.dataIndex] || '';
            return `${label}: ${context.parsed.y} times`;
          }
          return '';
        }
      }
    }
  },
  scales: {
    y: { beginAtZero: true, grid: { borderDash: [4, 4], color: '#f0f0f0' }, ticks: { font: { family: '-apple-system' } } },
    x: { display: false }
  }
};

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { 
    y: { beginAtZero: true, grid: { borderDash: [4, 4], color: '#f0f0f0' } },
    x: { grid: { display: false } }
  }
};

// Initialize charts
function initCharts() {
  if (scatterChart) { scatterChart.destroy(); scatterChart = null; }
  if (barChart) { barChart.destroy(); barChart = null; }

  nextTick(() => {
    if (scatterCanvas.value && scatterChartData.value) {
      scatterChart = new Chart(scatterCanvas.value, {
        type: 'scatter',
        data: scatterChartData.value,
        options: chartOptions
      });
    }
    if (barCanvas.value && barChartData.value) {
      barChart = new Chart(barCanvas.value, {
        type: 'bar',
        data: barChartData.value,
        options: barChartOptions
      });
    }
  });
}

// Re-init charts when data or loading state changes
watch(() => props.questionsAnswers, () => {
  if (!props.questionsAnswersLoading && !props.questionsAnswersError) {
    initCharts();
  }
}, { deep: true });

watch(() => props.questionsAnswersLoading, (isLoading) => {
  if (!isLoading && !props.questionsAnswersError) {
    nextTick(() => initCharts());
  }
});

function goToFeedbacks(questionId) {
  if (!questionId) return;
  router.push({ name: 'report-feedbacks', query: { questionId } });
}
</script>

<style scoped>
@import '@/assets/dashboard-styles.css';
@import '@/assets/main.css';
@import '@/assets/pagination-styles.css';

:root {
  --apple-blue: #0071e3;
  --apple-gray: #86868b;
  --apple-light-bg: #F5F5F7;
  --apple-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --card-radius: 18px;
  --card-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.dashboard-container {
  font-family: var(--apple-font);
  background-color: var(--apple-light-bg);
}

.page-title {
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #1d1d1f;
}

/* Animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }

/* Apple Icon Box */
.apple-icon-box {
  width: 48px; height: 48px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 1.5rem;
}
.purple-gradient { background: linear-gradient(135deg, #AF52DE 0%, #ff9a9e 100%); }

/* Status Badge */
.apple-status-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255, 255, 255, 0.9); padding: 6px 12px;
  border-radius: 20px; font-size: 0.8rem; font-weight: 600; color: #86868b;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05);
}
.apple-status-badge.online {
  color: #34C759; border-color: rgba(52, 199, 89, 0.2); background: rgba(52, 199, 89, 0.05);
}
.status-dot { width: 8px; height: 8px; border-radius: 50%; background: #86868b; }
.apple-status-badge.online .status-dot { background: #34C759; box-shadow: 0 0 8px rgba(52, 199, 89, 0.4); }

/* Stats Cards */
.apple-stat-card {
  background: white; border-radius: var(--card-radius); padding: 20px;
  box-shadow: var(--card-shadow); display: flex; align-items: center; gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s; border: 1px solid rgba(0,0,0,0.02);
}
.apple-stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }

.stat-icon-wrapper {
  width: 50px; height: 50px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.6rem; color: white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.blue-gradient { background: linear-gradient(135deg, #0071e3 0%, #4facfe 100%); }
.green-gradient { background: linear-gradient(135deg, #34C759 0%, #a8ff78 100%); }
.red-gradient { background: linear-gradient(135deg, #FF3B30 0%, #ff6b6b 100%); }

.stat-value { font-size: 1.6rem; font-weight: 700; color: #1d1d1f; line-height: 1.1; }
.stat-label { font-size: 0.85rem; color: #86868b; margin-top: 4px; font-weight: 500; }

/* Cards & Charts */
.apple-card {
  background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);
  border-radius: var(--card-radius); box-shadow: var(--card-shadow);
  overflow: hidden; border: 1px solid rgba(0,0,0,0.05);
}
.chart-card { padding: 20px; }
.chart-area { position: relative; height: 260px; width: 100%; }
.card-header-clean h5 { font-size: 1rem; font-weight: 600; color: #1d1d1f; margin: 0 0 16px 0; }

/* Counter Capsule */
.apple-counter-capsule {
  display: inline-flex; align-items: center; background: #F2F2F7;
  padding: 6px 14px; border-radius: 30px; color: #1d1d1f;
  font-size: 0.9rem; font-weight: 500; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
}
.apple-counter-capsule .label { color: #86868b; margin-right: 8px; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; }
.apple-counter-capsule .separator { color: #d1d1d6; margin-right: 8px; font-weight: 300; }
.apple-counter-capsule .count { font-weight: 700; color: #0071e3; }

/* Search */
.search-container { position: relative; width: 240px; }
.search-input {
  width: 100%; padding: 8px 36px; border-radius: 10px; border: 1px solid rgba(0,0,0,0.1);
  background: rgba(118, 118, 128, 0.08); font-size: 0.9rem; transition: all 0.2s;
}
.search-input:focus { background: white; border-color: var(--apple-blue); outline: none; box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15); }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #86868b; }
.search-clear { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); border: none; background: none; color: #86868b; cursor: pointer; }

/* Table */
.apple-table thead th {
  background: rgba(249, 249, 251, 0.95); font-weight: 600; color: #86868b;
  font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(0,0,0,0.08); padding: 16px;
}
.apple-table tbody td { padding: 14px 16px; border-bottom: 1px solid rgba(0,0,0,0.03); color: #1d1d1f; }
.apple-table tr.apple-row:hover { background-color: rgba(0, 113, 227, 0.03); }

/* Badges */
.apple-badge { padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; display: inline-block; }
.apple-badge-red { background: rgba(255, 59, 48, 0.1); color: #FF3B30; }
.apple-badge-orange { background: rgba(255, 149, 0, 0.1); color: #FF9500; }
.apple-badge-green { background: rgba(52, 199, 89, 0.1); color: #34C759; }
.apple-badge-gray { background: rgba(142, 142, 147, 0.1); color: #86868b; }

.tag-badge {
  display: inline-block; padding: 4px 10px; border-radius: 6px;
  font-size: 0.8rem; font-weight: 600;
}

.keyword-tag {
  background: rgba(0,0,0,0.05); color: #1d1d1f; padding: 2px 8px;
  border-radius: 4px; font-size: 0.75rem;
}
.keyword-tag-more { font-size: 0.75rem; color: #86868b; padding: 2px 6px; }

/* Feedback Stats */
.feedback-stat-container { display: flex; align-items: center; }
.feedback-stat {
  display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px;
  border-radius: 20px; font-size: 0.8rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s; border: 1px solid transparent;
}
.feedback-stat.like-stat.has-count { background: rgba(52, 199, 89, 0.1); color: #34C759; border-color: rgba(52, 199, 89, 0.2); }
.feedback-stat.unlike-stat.has-count { background: rgba(255, 59, 48, 0.1); color: #FF3B30; border-color: rgba(255, 59, 48, 0.2); }
.feedback-stat.zero-count { background: rgba(0,0,0,0.03); color: #86868b; opacity: 0.7; }
.feedback-stat:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

/* Pagination Override */
.pagination .page-link { border: none; color: #1d1d1f; border-radius: 8px; margin: 0 2px; }
.pagination .page-item.active .page-link { background: var(--apple-blue); color: white; box-shadow: 0 2px 8px rgba(0, 113, 227, 0.3); }

/* Empty State */
.empty-state { display: flex; flex-direction: column; align-items: center; color: var(--apple-gray); }
.empty-state i { font-size: 2.5rem; margin-bottom: 8px; opacity: 0.5; }

@media (max-width: 992px) {
  .table-wrapper .table-responsive { overflow-x: auto; }
}

@media (max-width: 768px) {
  .table-wrapper .table-responsive { box-shadow: none; }
  .table-wrapper table { display: block; border: none; }
  .table-wrapper thead { display: none; }
  .table-wrapper tbody tr { display: block; margin-bottom: 1rem; border-radius: 18px; background: white; box-shadow: 0 10px 24px rgba(15, 15, 15, 0.08); border: 1px solid rgba(0, 0, 0, 0.05); }
  .table-wrapper tbody td { display: flex; justify-content: space-between; gap: 1rem; padding: 0.85rem 1rem; border: none; border-bottom: 1px solid rgba(0, 0, 0, 0.05); }
  .table-wrapper tbody td:last-child { border-bottom: none; }
  .table-wrapper tbody td::before { content: attr(data-label); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: #8c8c92; font-weight: 600; flex: 1; }
  .table-wrapper tbody td .question-text-cell { max-width: 60%; }
  .table-wrapper tbody td .feedback-stat-container { justify-content: flex-end; }
  .table-wrapper tbody td .feedback-stat { width: auto; }
  .table-wrapper tbody td[data-label="Keywords"] { flex-wrap: wrap; }
}
</style>