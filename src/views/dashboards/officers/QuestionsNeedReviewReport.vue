<template>
  <div class="">
    <div class="card p-4 bg-light shadow-sm mb-4 rounded-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="fs-5 mb-0">Questions Need Review Report</h3>
        <span v-if="wsConnected" class="badge bg-success">
          <i class="bi bi-wifi"></i> Live
        </span>
        <span v-else class="badge bg-secondary">
          <i class="bi bi-wifi-off"></i> Offline
        </span>
      </div>
      <div v-if="loading" class="text-center py-3">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading questions need review...</p>
      </div>
      <div v-else-if="error" class="alert alert-danger" role="alert">
        Error: {{ error }}
      </div>
      <div v-else>
        <!-- Charts Section -->
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="chart-container chart-has-data" :class="{ 'chart-empty': pieTotal === 0 }">
              <canvas v-if="pieTotal > 0" ref="pieCanvas"></canvas>
              <div v-else class="empty-donut" aria-hidden="true" title="No data"></div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="chart-container">
              <canvas ref="barCanvas"></canvas>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-2">
          <div class="small text-muted flex-grow-1 text-start">Total: {{ totalEntries }}</div>
          <div class="search-wrapper">
            <ReportSearch v-model="localSearch" placeholder="ค้นหา..." />
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Question Title</th>
                <th>Review Date</th>
                <th>Category</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="qa in paginatedQuestions" :key="qa.QuestionsAnswersID" :class="getRowClass(qa)">
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
                  <span class="tag-badge bg-dark fw-bold" :style="{ backgroundColor: getCategoryColor(qa.CategoriesID) }">
                    {{ categoriesNameMapSafe[qa.CategoriesID] || qa.CategoriesID }}
                  </span>
                </td>
                <td>
                  <span :class="getStatusBadgeClass(qa)" class="badge">
                    {{ getStatusText(qa) }}
                  </span>
                </td>
                <td>
                  <button class="handle-btn" @click="openInlineEdit(qa)">
                    <i class="bi bi-pencil-square me-1"></i>
                    จัดการ
                  </button>
                </td>
              </tr>
              <tr v-if="filteredQuestions.length === 0">
                <td colspan="6" class="text-center text-muted py-3">No questions need review</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="d-flex justify-content-between align-items-center p-3 border-top mt-2">
          <div class="small text-muted">
            Showing {{ startIndex }} to {{ endIndex }} of {{ totalEntries }} entries
          </div>
          <nav aria-label="Page navigation">
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="currentPage = 1">&laquo;</a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="currentPage = Math.max(1, currentPage - 1)">&lsaquo;</a>
              </li>
              <li v-for="page in pagesToShow" :key="page" class="page-item" :class="{ active: currentPage === page }">
                <a class="page-link page-num rounded-3" href="#" @click.prevent="currentPage = page">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" href="#" @click.prevent="currentPage = Math.min(totalPages, currentPage + 1)">&rsaquo;</a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" href="#" @click.prevent="currentPage = totalPages">&raquo;</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>

  <!-- Inline Edit Modal -->
  <transition name="modal-fade">
    <div v-if="showInlineEdit" class="comment-modal-overlay" @click.self="closeInlineEdit">
      <div class="comment-modal-content wide">
        <div class="comment-modal-header">
          <h5 class="comment-modal-title d-flex align-items-center gap-2">
            <i class="bi bi-pencil-square"></i>
            แก้ไขคำถาม-คำตอบ (ไม่เปลี่ยนหน้า)
          </h5>
          <button class="comment-modal-close" @click="closeInlineEdit" aria-label="ปิด">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="comment-modal-body">
          <div v-if="editLoading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>
            <p class="mt-2 small text-muted">กำลังโหลดข้อมูลคำถาม-คำตอบ...</p>
          </div>
          <div v-else>
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label fw-semibold">Question Title</label>
                <input type="text" class="form-control" v-model="inlineForm.questionTitle" />
              </div>
              <div class="col-12">
                <label class="form-label fw-semibold">Question Text</label>
                <textarea class="form-control" rows="4" v-model="inlineForm.questionText"></textarea>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Review Date</label>
                <input type="date" class="form-control" v-model="inlineForm.reviewDate" />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Category</label>
                <select class="form-select" v-model="inlineForm.categoriesId">
                  <option value="">-- เลือกหมวดหมู่ --</option>
                  <option v-for="cat in inlineCategories" :key="cat.CategoriesID" :value="cat.CategoriesID">
                    {{ cat.CategoriesName || cat.CategoriesID }}
                  </option>
                </select>
              </div>
              <div class="col-12">
                <label class="form-label fw-semibold">Keywords (คั่นด้วย , )</label>
                <input type="text" class="form-control" v-model="inlineKeywordsInput" @keyup.enter.prevent="addInlineKeyword" placeholder="เช่น ความรู้,ข้อมูล,คำตอบ" />
                <div class="mt-2 d-flex flex-wrap gap-2">
                  <span v-for="(k, idx) in inlineForm.keywords" :key="k+idx" class="badge bg-light text-dark border">
                    {{ k }}
                    <button type="button" class="btn btn-sm btn-link text-danger p-0 ps-1" @click="removeInlineKeyword(idx)">
                      <i class="bi bi-x"></i>
                    </button>
                  </span>
                </div>
              </div>
            </div>
            <div class="d-flex justify-content-end gap-2 mt-4">
              <button class="btn btn-outline-secondary" @click="closeInlineEdit" :disabled="savingInlineEdit">ปิด</button>
              <button class="btn btn-primary" @click="saveInlineEdit" :disabled="savingInlineEdit">
                <span v-if="savingInlineEdit" class="spinner-border spinner-border-sm me-2"></span>
                บันทึกและทำเครื่องหมายว่าแก้ไขแล้ว
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { formatRelativeTime } from '@/utils/formatTime';
import { ref, computed, watch, onMounted, onUnmounted, getCurrentInstance, nextTick } from 'vue';
import { createWebSocketConnection, WS_ENDPOINTS } from '@/config/websocket';
import { Tooltip } from 'bootstrap';
import Chart from 'chart.js/auto';
import ReportSearch from '@/components/ReportSearch.vue';

const props = defineProps({
  categoriesNameMap: { type: Object, default: () => ({}) },
  formatThaiDateTime: Function,
  daysThreshold: { type: Number, default: 30 } // Show questions with ReviewDate within next 30 days
});

const { appContext } = getCurrentInstance();
const $axios = appContext.config.globalProperties.$axios;

const items = ref([]);
const loading = ref(true);
const error = ref(null);
const showInlineEdit = ref(false);
const editLoading = ref(false);
const savingInlineEdit = ref(false);
const inlineCategories = ref([]);
const inlineKeywordsInput = ref('');
const inlineForm = ref({
  questionTitle: '',
  questionText: '',
  reviewDate: '',
  categoriesId: '',
  keywords: []
});
const editingQuestion = ref(null);

// Chart refs
const pieCanvas = ref(null);
const barCanvas = ref(null);
let pieChart = null;
let barChart = null;

// WebSocket state
const wsConnected = ref(false);
let ws = null;

// Local search + pagination
const localSearch = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(8);

watch(localSearch, () => { currentPage.value = 1; });

const categoriesNameMapSafe = computed(() => props.categoriesNameMap || {});

const tagColors = ['#007bff', '#28A745', '#DC3545', '#FFC107', '#6c757d', '#17a2b8', '#8e44ad', '#e67e22'];

const getCategoryColor = (catId) => {
  return tagColors[(catId || 0) % tagColors.length];
};

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

// Using shared Thai relative time formatter
// formatRelativeTime imported from '@/utils/formatTime';


const getDaysUntil = (qa) => {
  if (!qa.ReviewDate) return 'N/A';
  const reviewDate = new Date(qa.ReviewDate);
  const today = new Date();
  const diffTime = reviewDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return `${diffDays} days`;
};

const getDaysUntilClass = (qa) => {
  if (!qa.ReviewDate) return 'bg-secondary';
  const reviewDate = new Date(qa.ReviewDate);
  const today = new Date();
  const diffTime = reviewDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'bg-danger';
  if (diffDays <= 7) return 'bg-warning text-dark';
  if (diffDays <= 30) return 'bg-info';
  return 'bg-secondary';
};

const getStatusText = (qa) => {
  if (!qa.ReviewDate) return 'ไม่มีกำหนด';
  const reviewDate = new Date(qa.ReviewDate);
  const today = new Date();
  const diffTime = reviewDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'เกินกำหนด';
  if (diffDays <= 7) return 'เร่งด่วน';
  if (diffDays <= 30) return 'เร็วๆ นี้';
  return 'ตามกำหนดการ';
};

const getStatusBadgeClass = (qa) => {
  if (!qa.ReviewDate) return 'bg-secondary';
  const reviewDate = new Date(qa.ReviewDate);
  const today = new Date();
  const diffTime = reviewDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'bg-danger';
  if (diffDays <= 7) return 'bg-warning text-dark';
  if (diffDays <= 30) return 'bg-info';
  return 'bg-secondary';
};

const resetInlineForm = () => {
  inlineForm.value = {
    questionTitle: '',
    questionText: '',
    reviewDate: new Date().toISOString().slice(0, 10),
    categoriesId: '',
    keywords: []
  };
  inlineKeywordsInput.value = '';
};

const addInlineKeyword = () => {
  const raw = inlineKeywordsInput.value || '';
  const parts = raw.split(/[;,\n]/).map(p => p.trim()).filter(Boolean);
  parts.forEach(p => {
    if (!inlineForm.value.keywords.includes(p)) inlineForm.value.keywords.push(p);
  });
  inlineKeywordsInput.value = '';
};

const removeInlineKeyword = (idx) => {
  inlineForm.value.keywords.splice(idx, 1);
};

const fetchInlineCategories = async () => {
  try {
    const resp = await $axios.get('/questionsanswers/categories');
    inlineCategories.value = resp.data?.data || resp.data || [];
  } catch (err) {
    console.error('Failed to load categories:', err);
    inlineCategories.value = [];
  }
};

const fetchInlineQuestion = async (questionId) => {
  const resp = await $axios.get('/questionsanswers');
  const list = Array.isArray(resp.data) ? resp.data : (resp.data?.data || []);
  return list.find(it => String(it.QuestionsAnswersID) === String(questionId)) || null;
};

const openInlineEdit = async (qa) => {
  if (!qa?.QuestionsAnswersID) return;
  showInlineEdit.value = true;
  editLoading.value = true;
  editingQuestion.value = qa;
  resetInlineForm();
  try {
    await fetchInlineCategories();
    const detail = await fetchInlineQuestion(qa.QuestionsAnswersID);
    if (!detail) {
      alert('ไม่พบคำถาม/คำตอบ');
      closeInlineEdit();
      return;
    }
    const resolveCategoryId = (catVal) => {
      if (!catVal) return '';
      const asString = String(catVal);
      const byId = inlineCategories.value.find(c => String(c.CategoriesID) === asString);
      if (byId) return byId.CategoriesID;
      const byName = inlineCategories.value.find(c => String(c.CategoriesName) === asString);
      return byName ? byName.CategoriesID : '';
    };

    inlineForm.value.questionTitle = detail.QuestionTitle || '';
    inlineForm.value.questionText = detail.QuestionText || '';
    inlineForm.value.reviewDate = detail.ReviewDate
      ? new Date(detail.ReviewDate).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);
    inlineForm.value.categoriesId = resolveCategoryId(detail.CategoriesID || detail.CategoryID || detail.categoryId || detail.CategoriesName || detail.CategoryName) || '';
    inlineForm.value.keywords = (detail.keywords || []).map(k => k.KeywordText || k);
  } catch (err) {
    console.error('Failed to load inline edit data:', err);
    alert('โหลดข้อมูลไม่สำเร็จ');
    closeInlineEdit();
  } finally {
    editLoading.value = false;
  }
};

const closeInlineEdit = () => {
  showInlineEdit.value = false;
  editingQuestion.value = null;
  resetInlineForm();
};

const saveInlineEdit = async () => {
  if (!editingQuestion.value) return;
  if (!inlineForm.value.questionTitle || !inlineForm.value.questionText || !inlineForm.value.categoriesId || !inlineForm.value.reviewDate) {
    alert('กรอกข้อมูลให้ครบก่อนบันทึก');
    return;
  }
  savingInlineEdit.value = true;
  try {
    const payload = {
      questionTitle: inlineForm.value.questionTitle,
      questionText: inlineForm.value.questionText,
      reviewDate: inlineForm.value.reviewDate,
      categoriesId: inlineForm.value.categoriesId,
      keywords: inlineForm.value.keywords
    };
    await $axios.put(`/questionsanswers/update/${editingQuestion.value.QuestionsAnswersID}`, payload);
    closeInlineEdit();
    fetchData();
  } catch (err) {
    console.error('Inline edit save failed:', err);
    const msg = err.response?.data?.message || err.message || 'บันทึกไม่สำเร็จ';
    alert(msg);
  } finally {
    savingInlineEdit.value = false;
  }
};

const getRowClass = (qa) => {
  if (!qa.ReviewDate) return '';
  const reviewDate = new Date(qa.ReviewDate);
  const today = new Date();
  const diffTime = reviewDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'table-danger';
  if (diffDays <= 7) return 'table-warning';
  return '';
};

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await $axios.get('/getQuestionsAnswers');
    let data = res.data || [];
    
    // Filter questions that need review (ReviewDate within threshold or overdue)
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + props.daysThreshold);
    
    items.value = data.filter(qa => {
      if (!qa.ReviewDate) return false;
      const reviewDate = new Date(qa.ReviewDate);
      return reviewDate <= thresholdDate;
    }).sort((a, b) => {
      // Sort by ReviewDate ascending (most urgent first)
      if (!a.ReviewDate) return 1;
      if (!b.ReviewDate) return -1;
      return new Date(a.ReviewDate) - new Date(b.ReviewDate);
    });
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Failed to load data.';
  } finally {
    loading.value = false;
  }
};

const filteredQuestions = computed(() => {
  const q = (localSearch.value || '').toString().trim().toLowerCase();
  if (!q) return items.value;
  return items.value.filter(qa => {
    const id = String(qa.QuestionsAnswersID || '').toLowerCase();
    const title = String(qa.QuestionTitle || '').toLowerCase();
    const text = String(qa.QuestionText || '').toLowerCase();
    const cat = String(categoriesNameMapSafe.value[qa.CategoriesID] || '').toLowerCase();
    return id.includes(q) || title.includes(q) || text.includes(q) || cat.includes(q);
  });
});

const totalEntries = computed(() => filteredQuestions.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(totalEntries.value / itemsPerPage.value)));

const startIndex = computed(() => {
  if (totalEntries.value === 0) return 0;
  return (currentPage.value - 1) * itemsPerPage.value + 1;
});

const endIndex = computed(() => {
  const end = currentPage.value * itemsPerPage.value;
  return Math.min(end, totalEntries.value);
});

const paginatedQuestions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredQuestions.value.slice(start, end);
});

const pagesToShow = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const delta = 2;
  const range = [];
  const rangeWithDots = [];

  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i);
  }

  if (current - delta > 2) rangeWithDots.push(1, '...');
  else rangeWithDots.push(1);

  rangeWithDots.push(...range);

  if (current + delta < total - 1) rangeWithDots.push('...', total);
  else if (total > 1) rangeWithDots.push(total);

  return rangeWithDots.filter((v, i, arr) => arr.indexOf(v) === i && v !== '...' || v === '...');
});

// Chart data: Status distribution (Pie chart)
const statusCounts = computed(() => {
  const counts = { 'เกินกำหนด': 0, 'เร่งด่วน': 0, 'เร็วๆ นี้': 0, 'ตามกำหนดการ': 0 };
  items.value.forEach(qa => {
    const status = getStatusText(qa);
    if (counts[status] !== undefined) counts[status]++;
  });
  return counts;
});

const pieChartData = computed(() => ({
  labels: Object.keys(statusCounts.value),
  datasets: [{
    data: Object.values(statusCounts.value),
    backgroundColor: ['#dc3545', '#ffc107', '#17a2b8', '#6c757d'],
    borderWidth: 1
  }]
}));

// Total count used to decide whether to render a pie (hide when all zeros)
const pieTotal = computed(() => Object.values(statusCounts.value).reduce((acc, v) => acc + (Number(v) || 0), 0));

// Chart data: Category distribution (Bar chart)
const categoryCounts = computed(() => {
  const counts = {};
  items.value.forEach(qa => {
    const catName = categoriesNameMapSafe.value[qa.CategoriesID] || 'Unknown';
    counts[catName] = (counts[catName] || 0) + 1;
  });
  return counts;
});

const barChartData = computed(() => ({
  labels: Object.keys(categoryCounts.value),
  datasets: [{
    label: 'Questions by Category',
    data: Object.values(categoryCounts.value),
    backgroundColor: Object.keys(categoryCounts.value).map((_, i) => tagColors[i % tagColors.length]),
    borderWidth: 1
  }]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
};

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0
      }
    }
  }
};

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

// Initialize charts
function initCharts() {
  if (pieChart) {
    pieChart.destroy();
    pieChart = null;
  }
  if (barChart) {
    barChart.destroy();
    barChart = null;
  }

  nextTick(() => {
    // Only draw pie chart when there is at least one non-zero data point
    if (pieTotal.value > 0 && pieCanvas.value && pieChartData.value) {
      pieChart = new Chart(pieCanvas.value, {
        type: 'pie',
        data: pieChartData.value,
        options: chartOptions
      });
    }

    if (barCanvas.value && barChartData.value) {
      barChart = new Chart(barCanvas.value, {
        type: 'bar',
        data: barChartData.value,
        options: {
          ...barChartOptions,
          indexAxis: 'y',
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }
  });
}

// Re-init charts when the pieTotal changes (ensures pie is created/destroyed appropriately)
watch(pieTotal, () => {
  if (!loading.value && !error.value) {
    initCharts();
  }
});

// Watch items to reinitialize charts
watch(items, () => {
  if (!loading.value && !error.value && items.value.length > 0) {
    initCharts();
  }
}, { deep: true });

onMounted(() => {
  fetchData();
  initTooltips();
  
  // Initialize WebSocket
  ws = createWebSocketConnection(WS_ENDPOINTS.QUESTIONS_ANSWERS, {
    axios: $axios,
    onMessage: (message) => {
      console.log('📥 QuestionsNeedReview received:', message);
      const action = message?.data?.action || message?.action || '';
      const type = message?.type || '';
      const hasUpdate = action || type === 'QUESTION_ANSWER_UPDATE';
      if (hasUpdate) {
        console.log('✅ QuestionsNeedReview refreshing data...');
        fetchData();
      }
    },
    onOpen: () => {
      wsConnected.value = true;
    },
    onClose: () => {
      wsConnected.value = false;
    },
  });
});

onUnmounted(() => {
  if (ws) ws.disconnect();
  if (pieChart) pieChart.destroy();
  if (barChart) barChart.destroy();
});
</script>

<style scoped>
@import '@/assets/pagination-styles.css';

.question-text-cell {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag-badge {
  display: inline-block;
  padding: 0.35em 0.65em;
  font-size: 0.85em;
  font-weight: 500;
  border-radius: 0.5rem;
  color: white;
  white-space: nowrap;
}

.search-wrapper {
  max-width: 320px;
  width: 100%;
  margin-left: auto;
}

.input-group.search-input-group {
  position: relative;
  width: 100%;
}

.table-danger {
  background-color: rgba(220, 53, 69, 0.1) !important;
}

.table-warning {
  background-color: rgba(255, 193, 7, 0.1) !important;
}

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

/* Empty donut placeholder when no data */
.chart-container.chart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
}
.empty-donut {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  box-sizing: border-box;
  border: 20px solid rgba(0,0,0,0.03);
  background-clip: padding-box;
}

.handle-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #007aff, #5865f2);
  color: white;
  font-weight: 600;
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.25);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.handle-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 122, 255, 0.35);
}

.handle-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Modal styles (reused from feedback inline edit) */
.comment-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.comment-modal-content {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 640px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.comment-modal-content.wide {
  max-width: 720px;
}

.comment-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #007AFF 0%, #0051D4 100%);
  color: white;
}

.comment-modal-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.comment-modal-close {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: background 0.2s ease;
}

.comment-modal-close:hover {
  background: rgba(255, 255, 255, 0.25);
}

.comment-modal-body {
  padding: 24px;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
