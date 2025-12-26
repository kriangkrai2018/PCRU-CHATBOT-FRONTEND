<template>
  <div class="">
    <div class="card p-4 bg-light shadow-sm mb-4 rounded-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="fs-5 mb-0">QuestionsAnswers Report</h3>
        <span v-if="wsConnected" class="badge bg-success">
          <i class="bi bi-wifi"></i> Live
        </span>
        <span v-else class="badge bg-secondary">
          <i class="bi bi-wifi-off"></i> Offline
        </span>
      </div>
      <div v-if="questionsAnswersLoading" class="text-center py-3">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading questions-answers data...</p>
      </div>
      <div v-else-if="questionsAnswersError" class="alert alert-danger" role="alert">
        Error: {{ questionsAnswersError }}
      </div>
      <div v-else>
        <div class="row mb-3">
          <div class="col-12 col-md-6">
            <div class="chart-container">
              <canvas ref="scatterCanvas"></canvas>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="chart-container">
              <canvas ref="barCanvas"></canvas>
            </div>
          </div>
        </div>

        <!-- Updated: flex row, total left, search right -->
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div class="small text-muted flex-grow-1 text-start">Total: {{ totalEntries }}</div>
          <div class="search-wrapper">
            <ReportSearch v-model="localSearch" placeholder="ค้นหา คำถาม / คำตอบ / หมวดหมู่..." />
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th class=""><small>Questions<br>Answers</small></th>
                <th>QuestionTitle</th>
                <th>ReviewDate</th>
                <th>QuestionText</th>
                <th>CategoriesName</th>
                <th>KeywordText</th>
                <th class="text-center">👍 Like</th>
                <th class="text-center">👎 Unlike</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="qa in paginatedQuestions" :key="qa.QuestionsAnswersID">
                <td>{{ qa.QuestionsAnswersID }}</td>
                <td>
                  <div class="question-text-cell">{{ qa.QuestionTitle }}</div>
                </td>
                <td>
                  <span 
                    class="badge bg-secondary"
                    data-bs-toggle="tooltip" 
                    data-bs-placement="top" 
                    :title="formatFullDateTime(qa.ReviewDate)"
                  >
                    {{ formatRelativeTime(qa.ReviewDate) }}
                  </span>
                </td>
                <td>
                  <div class="question-text-cell">{{ qa.QuestionText }}</div>
                </td>
                <!-- category badge (color chosen by CategoriesID modulo palette) -->
                <td>
                  <span
                    class="tag-badge bg-dark fw-bold"
                    :style="{ backgroundColor: tagColors[(qa.CategoriesID || 0) % tagColors.length] }"
                  >
                    {{ categoriesNameMapSafe[qa.CategoriesID] || qa.CategoriesID }}
                  </span>
                </td>
                <!-- keywords as multiple rounded badges -->
                <td>
                  <template v-if="qa.keywords && qa.keywords.length">
                    <span
                      v-for="(k, i) in qa.keywords"
                      :key="k.KeywordID || (k.KeywordText + i)"
                      class="tag-badge me-1 mb-1"
                      :style="{ backgroundColor: tagColors[i % tagColors.length] }"
                    >
                      {{ k.KeywordText }}
                    </span>
                  </template>
                  <span v-else class="text-muted small">—</span>
                </td>
                <td class="text-center">
                  <div class="feedback-stat-container">
                    <div
                      class="feedback-stat like-stat"
                      :class="{ 'has-count': qa.likeCount > 0, 'zero-count': qa.likeCount === 0 }"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      :title="`${qa.likeCount || 0} like`"
                      @click.prevent="goToFeedbacks(qa.QuestionsAnswersID)"
                    >
                      <div class="feedback-icon-wrapper">
                        <svg class="feedback-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.125c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V3a.75.75 0 0 1 .75-.75A2.25 2.25 0 0 1 17.25 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.777ZM2.331 10.727a11.969 11.969 0 0 0-.831 4.398 12 12 0 0 0 .52 3.507C2.28 19.482 3.105 20 3.994 20H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 0 1-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227Z" />
                        </svg>
                      </div>
                      <span class="feedback-count">{{ qa.likeCount || 0 }}</span>
                    </div>
                  </div>
                </td>
                <td class="text-center">
                  <div class="feedback-stat-container">
                    <div
                      class="feedback-stat unlike-stat"
                      :class="{ 'has-count': qa.unlikeCount > 0, 'zero-count': qa.unlikeCount === 0 }"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      :title="`${qa.unlikeCount || 0} unlike`"
                      @click.prevent="goToFeedbacks(qa.QuestionsAnswersID)"
                    >
                      <div class="feedback-icon-wrapper">
                        <svg class="feedback-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
                        </svg>
                      </div>
                      <span class="feedback-count">{{ qa.unlikeCount || 0 }}</span>
                    </div>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredQuestions.length === 0">
                <td colspan="8" class="text-center text-muted py-3">No questions-answers data found</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="d-flex justify-content-between align-items-center p-3 border-top mt-2">
          <div class="small text-muted">
            Showing {{ startIndex }} to {{ endIndex }} of {{ totalEntries }} entries
          </div>
          <nav aria-label="Page navigation for questions">
            <ul class="pagination pagination-sm mb-0 align-items-center">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="firstPage">&laquo;</a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="prevPage">&lsaquo;</a>
              </li>
              <li v-for="p in pagesToShow" :key="p" class="page-item" :class="{ active: currentPage === p }">
                <a class="page-link" href="#" @click.prevent="goToPage(p)">{{ p }}</a>
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
</template>

<script setup>
import { formatRelativeTime } from '@/utils/formatTime';
import { ref, computed, watch, onMounted, onUnmounted, getCurrentInstance, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { createWebSocketConnection, WS_ENDPOINTS } from '@/config/websocket';
import { Tooltip } from 'bootstrap';
import Chart from 'chart.js/auto';
import ReportSearch from '@/components/ReportSearch.vue';

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

// WebSocket state
const wsConnected = ref(false);
const { appContext } = getCurrentInstance();
const $axios = appContext.config.globalProperties.$axios;
let ws = null;
const router = useRouter();

// Added: color palette for charts
const tagColors = ['#007bff', '#28A745', '#DC3545', '#FFC107', '#6c757d', '#17a2b8', '#8e44ad', '#e67e22'];

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

// filtered by search: search in all table columns
const filteredQuestions = computed(() => {
  const q = (localSearch.value || '').toString().trim().toLowerCase();
  if (!q) return allQuestions.value;
  return allQuestions.value.filter(item => {
    const id = item.QuestionsAnswersID != null ? String(item.QuestionsAnswersID).toLowerCase() : '';
    const title = item.QuestionTitle ? String(item.QuestionTitle).toLowerCase() : '';
    const text = item.QuestionText ? String(item.QuestionText).toLowerCase() : '';
    const catName = (categoriesNameMapSafe.value[item.CategoriesID] || item.CategoriesID || '').toString().toLowerCase();
    const keywordsStr = item.keywords ? item.keywords.map(k => k.KeywordText).join(' ').toLowerCase() : '';
    const reviewDate = item.ReviewDate ? String(item.ReviewDate).toLowerCase() : '';
    // search in all columns
    return id.includes(q) || title.includes(q) || text.includes(q) || keywordsStr.includes(q) || catName.includes(q) || reviewDate.includes(q);
  });
});

// pagination
const currentPage = ref(1);
const itemsPerPage = ref(8);

const totalEntries = computed(() => filteredQuestions.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(totalEntries.value / itemsPerPage.value)));
const startIndex = computed(() => totalEntries.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1);
const endIndex = computed(() => totalEntries.value === 0 ? 0 : Math.min(currentPage.value * itemsPerPage.value, totalEntries.value));
const paginatedQuestions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredQuestions.value.slice(start, start + itemsPerPage.value);
});

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

// Removed duplicate tagColors declaration (palette is defined earlier)

// Format full date time for tooltip
function formatFullDateTime(timestamp) {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp;
  return date.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}
// Chart data: Category distribution (Bar chart)
const categoryCounts = computed(() => {
  const counts = {};
  const list = allQuestions.value || [];
  list.forEach(qa => {
    const id = qa.CategoriesID;
    const nameFromMap = categoriesNameMapSafe.value[id];
    const resolvedName = nameFromMap || qa.CategoriesName || (id != null ? `หมวด ${id}` : '');
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
    borderWidth: 1
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
    legend: { position: 'bottom' },
    tooltip: {
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
    y: { beginAtZero: true, ticks: { precision: 0 } },
    x: { display: false }
  }
};

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
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

// Using shared Thai relative time formatter
// formatRelativeTime imported from '@/utils/formatTime';


function goToFeedbacks(questionId) {
  if (!questionId) return;
  router.push({ name: 'report-feedbacks', query: { questionId } });
}
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 260px;
  width: 100%;
}

.chart-container canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.question-text-cell {
  max-height: 70px;
  overflow-y: auto;
  white-space: pre-line;
  word-break: break-word;
  background: #f8f9fa;
  border-radius: 4px;
  padding: 4px 8px;
}

/* Right-align search, left-align total */
.search-wrapper {
  min-width: 320px;
  max-width: 400px;
  width: 100%;
  margin-left: auto;
}
.input-group.search-input-group {
  position: relative;
}

/* Pagination: NO border, NO background for arrows/non-active, but active page (current) has border/background */
.pagination {
  gap: 0.15rem;
}

.pagination .page-link,
.pagination .page-item.disabled .page-link {
  border: none !important;
  background: transparent !important;
  color: #6c757d;
  font-size: 1.05rem;
  border-radius: 0.5rem !important;
  min-width: 38px;
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
  box-shadow: none;
  outline: none;
  padding: 0.375rem 0.75rem;
}

/* Active page: white background, border #E3E3E3 */
.pagination .page-item.active .page-link {
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%) !important;
  color: #FFFFFF !important;
  border: none !important;
  font-weight: 600;
  box-shadow: none;
}

/* Disabled page: keep default look */
.pagination .page-item.disabled .page-link {
  color: #adb5bd;
  pointer-events: none;
}

/* Focus/hover: no background/border */
.pagination .page-link:focus,
.pagination .page-link:hover {
  background: transparent !important;
  color: #495057;
  box-shadow: none;
}

.pagination .page-num {
  border-radius: 0.5rem !important;
}

/* Remove default margin from ul.pagination if any */
.pagination {
  margin-bottom: 0 !important;
}

/* badge/tag styles */
.tag-badge {
  display: inline-block;
  color: #fff;
  padding: 4px 8px;
  font-size: 0.85rem;
  border-radius: 0.5rem;
  line-height: 1;
  white-space: nowrap;
  box-shadow: 0 1px 0 rgba(0,0,0,0.06);
}

/* ensure small spacing for multiple tags */
.tag-badge.me-1 { margin-right: 0.25rem; }
.tag-badge.mb-1 { margin-bottom: 0.25rem; }

/* Feedback stats (like/unlike) */
.feedback-stat-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.feedback-stat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 14px;
  background: linear-gradient(135deg, #f6f7fb 0%, #edf0f7 100%);
  border: 1px solid #e5e7ef;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.7), 0 1px 3px rgba(0,0,0,0.06);
  transition: all 0.2s ease;
  min-width: 72px;
  justify-content: center;
}

.feedback-stat.has-count { box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 8px rgba(0,0,0,0.1); }
.feedback-stat.zero-count { opacity: 0.7; }

.feedback-stat.like-stat {
  color: #0f8d5f;
  background: linear-gradient(135deg, #e8fff3 0%, #d7f5ea 100%);
  border-color: #c7f1de;
}

.feedback-stat.unlike-stat {
  color: #b33939;
  background: linear-gradient(135deg, #fff1f1 0%, #ffe5e5 100%);
  border-color: #ffd6d6;
}

.feedback-icon-wrapper { display: flex; align-items: center; }
.feedback-icon { width: 18px; height: 18px; fill: currentColor; }
.feedback-count { font-weight: 700; font-variant-numeric: tabular-nums; }
</style>
