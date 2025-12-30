<template>
  <div class="dashboard-container">
    <!-- Main Content -->
    <div class="container-fluid pt-2 px-4 pb-5">
      <!-- Header -->
      <div class="d-flex align-items-center justify-content-between mb-4 fade-in-up">
        <div class="d-flex align-items-center gap-3">
          <!-- Apple Icon Box (Orange for "Action Required") -->
          <div class="apple-icon-box orange-gradient">
            <i class="bi bi-clipboard-check-fill text-white"></i>
          </div>
          <div>
            <h3 class="page-title m-0">Review Pending</h3>
            <span class="text-secondary small">Questions requiring update or verification</span>
          </div>
        </div>
        
        <!-- Live Status -->
        <div class="d-flex align-items-center gap-2">
          <div class="apple-status-badge" :class="{ 'online': wsConnected }">
            <span class="status-dot"></span>
            <span>{{ wsConnected ? 'Live Updates' : 'Offline' }}</span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5 fade-in">
        <div class="apple-spinner"></div>
        <p class="mt-3 text-secondary">Checking for updates...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert apple-alert-danger mx-auto" role="alert">
        <i class="bi bi-exclamation-circle-fill me-2"></i> {{ error }}
      </div>

      <div v-else class="fade-in-up" style="animation-delay: 0.1s;">
        
        <!-- Stats Cards -->
        <div class="row mb-4 g-3">
          <div class="col-md-4">
            <div class="apple-stat-card">
              <div class="stat-icon-wrapper blue-gradient">
                <i class="bi bi-list-task"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ totalEntries }}</div>
                <div class="stat-label">Total Pending</div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="apple-stat-card">
              <div class="stat-icon-wrapper red-gradient">
                <i class="bi bi-exclamation-diamond-fill"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ overdueCount }}</div>
                <div class="stat-label">Overdue</div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="apple-stat-card">
              <div class="stat-icon-wrapper yellow-gradient">
                <i class="bi bi-hourglass-split"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ urgentCount }}</div>
                <div class="stat-label">Due Soon</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="row mb-4 g-4">
          <div class="col-12 col-lg-6">
            <div class="apple-card chart-card h-100">
              <div class="card-header-clean">
                <h5>Status Breakdown</h5>
              </div>
              <div class="chart-area" :class="{ 'd-flex align-items-center justify-content-center': pieTotal === 0 }">
                <canvas v-if="pieTotal > 0" ref="pieCanvas"></canvas>
                <div v-else class="empty-state-chart text-muted">
                  <i class="bi bi-pie-chart mb-2 fs-3 d-block opacity-50"></i>
                  No Data
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-6">
            <div class="apple-card chart-card h-100">
              <div class="card-header-clean">
                <h5>By Category</h5>
              </div>
              <div class="chart-area">
                <canvas ref="barCanvas"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Table Section -->
        <div class="apple-card table-wrapper">
          <div class="card-header-actions p-3 d-flex justify-content-between align-items-center">
            
            <!-- Total Counter -->
            <div class="apple-counter-capsule">
              <span class="label">Items</span>
              <span class="separator">|</span>
              <span class="count">{{ totalEntries }}</span>
            </div>

            <!-- Search -->
            <div class="search-container">
              <i class="bi bi-search search-icon"></i>
              <input
                type="text"
                class="search-input"
                placeholder="Search items..."
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
                  <th>Category</th>
                  <th>Status</th>
                  <th class="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="qa in paginatedQuestions" :key="qa.QuestionsAnswersID" class="align-middle apple-row">
                  <td class="ps-4 fw-medium text-secondary">{{ qa.QuestionsAnswersID }}</td>
                  <td class="py-3">
                    <div class="question-text-cell fw-medium text-dark" :title="qa.QuestionTitle">{{ qa.QuestionTitle }}</div>
                  </td>
                  <td class="py-3">
                    <span 
                      :class="['apple-badge', getReviewDateBadgeClass(qa.ReviewDate)]"
                      data-bs-toggle="tooltip" 
                      data-bs-placement="top" 
                      :title="formatFullDateTime(qa.ReviewDate)"
                    >
                      {{ formatRelativeTime(qa.ReviewDate) }}
                    </span>
                  </td>
                  <td class="py-3">
                    <span class="tag-badge" :style="{ backgroundColor: getCategoryColor(qa.CategoriesID) }">
                      {{ categoriesNameMapSafe[qa.CategoriesID] || qa.CategoriesID }}
                    </span>
                  </td>
                  <td class="py-3">
                    <span :class="getStatusBadgeClass(qa)">
                      {{ getStatusText(qa) }}
                    </span>
                  </td>
                  <td class="py-3 text-center">
                    <button class="btn-apple-primary small" @click="openInlineEdit(qa)">
                      <i class="bi bi-pencil-square me-2"></i> Update
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredQuestions.length === 0">
                  <td colspan="6" class="text-center text-muted py-5">
                    <div class="empty-state">
                      <i class="bi bi-check2-circle"></i>
                      <p>All questions are up to date</p>
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
                  <a class="page-link" href="#" @click.prevent="currentPage = 1">&laquo;</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="currentPage = Math.max(1, currentPage - 1)">&lsaquo;</a>
                </li>
                <li v-for="page in pagesToShow" :key="page" class="page-item" :class="{ active: currentPage === page }">
                  <a class="page-link page-num" href="#" @click.prevent="currentPage = page">{{ page }}</a>
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

    <!-- Inline Edit Modal (Apple Style) -->
    <transition name="apple-zoom">
      <div v-if="showInlineEdit" class="apple-modal-overlay" @click.self="closeInlineEdit">
        <div class="apple-modal-content wide-modal">
          <div class="apple-modal-header-bg"></div>
          
          <div class="apple-modal-header">
            <div class="d-flex flex-column">
              <h5 class="apple-modal-title">Edit Question</h5>
              <span class="apple-modal-subtitle">Update review details inline</span>
            </div>
            <button class="apple-close-btn" @click="closeInlineEdit" aria-label="Close">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <div class="apple-modal-body">
            <div v-if="editLoading" class="text-center py-5">
              <div class="apple-spinner mx-auto mb-3"></div>
              <p class="text-secondary">Loading details...</p>
            </div>
            <div v-else class="apple-form-container">
              
              <div class="apple-input-group">
                <label>Question Title</label>
                <input type="text" class="apple-input" v-model="inlineForm.questionTitle" />
              </div>

              <div class="apple-input-group">
                <label>Question Text</label>
                <textarea class="apple-input apple-textarea" rows="4" v-model="inlineForm.questionText"></textarea>
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <div class="apple-input-group">
                    <label>Review Date</label>
                    <input type="date" class="apple-input" v-model="inlineForm.reviewDate" />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="apple-input-group">
                    <label>Category</label>
                    <div class="select-wrapper">
                      <select class="apple-input" v-model="inlineForm.categoriesId">
                        <option value="">-- Select Category --</option>
                        <option 
                          v-for="cat in sortedInlineCategories" 
                          :key="cat.CategoriesID" 
                          :value="cat.CategoriesID"
                          :class="cat.isMain ? 'fw-bold text-muted bg-light' : ''"
                          :disabled="cat.isMain"
                        >
                          {{ cat.isMain ? '▸ ' : '  └ ' }}{{ cat.CategoriesName || cat.CategoriesID }}
                        </option>
                      </select>
                      <i class="bi bi-chevron-down select-icon"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div class="apple-input-group">
                <label>Keywords (comma separated)</label>
                <div class="keyword-input-wrapper">
                  <input type="text" class="apple-input pe-5" v-model="inlineKeywordsInput" @keyup.enter.prevent="addInlineKeyword" placeholder="Type and press Enter..." />
                  <button class="apple-icon-btn-abs" @click="addInlineKeyword"><i class="bi bi-plus-lg"></i></button>
                </div>
                <div class="d-flex flex-wrap gap-2 mt-2">
                  <span v-for="(k, idx) in inlineForm.keywords" :key="k+idx" class="keyword-tag removable" @click="removeInlineKeyword(idx)">
                    {{ k }} <i class="bi bi-x ms-1"></i>
                  </span>
                </div>
              </div>

              <div class="apple-actions">
                <button class="btn-apple-secondary" @click="closeInlineEdit" :disabled="savingInlineEdit">Cancel</button>
                <button class="btn-apple-primary" @click="saveInlineEdit" :disabled="savingInlineEdit">
                  <span v-if="savingInlineEdit" class="spinner-border spinner-border-sm me-2"></span>
                  Save & Mark Reviewed
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
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

// จัดเรียงหมวดหมู่สำหรับ Dropdown (แยก Main/Sub และกำหนด isMain)
const sortedInlineCategories = computed(() => {
  const raw = inlineCategories.value || [];
  const validRaw = Array.isArray(raw) ? raw.filter(c => c && c.CategoriesID != null) : [];
  const mains = validRaw.filter(c => !String(c.CategoriesID).includes('-'))
    .sort((a, b) => String(a.CategoriesID).localeCompare(String(b.CategoriesID), undefined, { numeric: true }));

  const result = [];
  for (const m of mains) {
    result.push({ ...m, isMain: true });
    const pId = String(m.CategoriesID);
    const subs = validRaw.filter(c => {
      const cId = String(c.CategoriesID);
      return cId !== pId && cId.startsWith(pId + '-');
    }).sort((a, b) => String(a.CategoriesID).localeCompare(String(b.CategoriesID), undefined, { numeric: true }));
    for (const s of subs) {
      result.push({ ...s, isMain: false });
    }
  }
  return result;
});

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

// Apple-style Palette
const tagColors = ['#0071e3', '#34C759', '#FF9500', '#FF3B30', '#5856D6', '#AF52DE', '#5AC8FA', '#FF2D55'];

const getCategoryColor = (catId) => {
  return tagColors[(catId || 0) % tagColors.length];
};

// Format full date time for tooltip (date only)
function formatFullDateTime(timestamp) {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp;
  return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
}

const getStatusText = (qa) => {
  if (!qa.ReviewDate) return 'No Date';
  const reviewDate = new Date(qa.ReviewDate);
  const today = new Date();
  const diffTime = reviewDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Overdue';
  if (diffDays <= 7) return 'Urgent';
  if (diffDays <= 30) return 'Review Soon';
  return 'On Schedule';
};

// Return badge class for the text status
const getStatusBadgeClass = (qa) => {
  if (!qa.ReviewDate) return 'status-pill gray';
  const reviewDate = new Date(qa.ReviewDate);
  const today = new Date();
  const diffTime = reviewDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'status-pill red';
  if (diffDays <= 7) return 'status-pill orange';
  if (diffDays <= 30) return 'status-pill yellow';
  return 'status-pill green';
};

// Return small badge for the date itself
const getReviewDateBadgeClass = (timestamp) => {
  if (!timestamp) return 'apple-badge-gray';
  const now = new Date();
  const reviewDate = new Date(timestamp);
  if (isNaN(reviewDate.getTime())) return 'apple-badge-gray';
  const diffDays = Math.ceil((reviewDate - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'apple-badge-red';
  if (diffDays <= 7) return 'apple-badge-orange';
  if (diffDays <= 30) return 'apple-badge-yellow';
  return 'apple-badge-green';
}

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
    const data = resp.data?.data || resp.data;
    inlineCategories.value = Array.isArray(data) ? data : [];
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

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await $axios.get('/getQuestionsAnswers');
    // Support both direct-array responses and { success: true, data: [...] } wrappers
    let data = Array.isArray(res.data) ? res.data : (res.data?.data || []);

    if (!Array.isArray(data) && res.data && res.data.success === false) {
      throw new Error(res.data.message || 'Failed to load questions');
    }

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
    console.error('QuestionsNeedReview fetchData error:', err);
    if (!err.response) {
      error.value = 'Network Error: Unable to reach backend.';
    } else {
      error.value = err.response?.data?.message || err.message || 'Failed to load data.';
    }
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

// Stats
const overdueCount = computed(() => {
  return items.value.filter(qa => {
    if (!qa.ReviewDate) return false;
    return new Date(qa.ReviewDate) < new Date();
  }).length;
});

const urgentCount = computed(() => {
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);
  return items.value.filter(qa => {
    if (!qa.ReviewDate) return false;
    const d = new Date(qa.ReviewDate);
    return d >= now && d <= nextWeek;
  }).length;
});

// Chart data: Status distribution (Pie chart)
const statusCounts = computed(() => {
  const counts = { 'Overdue': 0, 'Urgent': 0, 'Review Soon': 0, 'No Date': 0 };
  items.value.forEach(qa => {
    const status = getStatusText(qa);
    if (counts[status] !== undefined) counts[status]++;
    else counts['Review Soon']++; // Fallback group
  });
  return counts;
});

const pieChartData = computed(() => ({
  labels: Object.keys(statusCounts.value),
  datasets: [{
    data: Object.values(statusCounts.value),
    backgroundColor: ['#FF3B30', '#FF9500', '#FFCC00', '#8E8E93'],
    borderWidth: 0
  }]
}));

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
    borderWidth: 0,
    borderRadius: 4
  }]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8 } } },
  cutout: '70%'
};

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, grid: { borderDash: [4, 4], color: '#f0f0f0' }, ticks: { precision: 0 } },
    x: { grid: { display: false } }
  }
};

// Initialize Bootstrap tooltips
const initTooltips = () => {
  nextTick(() => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new Tooltip(tooltipTriggerEl));
  });
};

watch(paginatedQuestions, () => initTooltips());

// Initialize charts
function initCharts() {
  if (pieChart) { pieChart.destroy(); pieChart = null; }
  if (barChart) { barChart.destroy(); barChart = null; }

  nextTick(() => {
    if (pieTotal.value > 0 && pieCanvas.value && pieChartData.value) {
      pieChart = new Chart(pieCanvas.value, {
        type: 'doughnut',
        data: pieChartData.value,
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

watch(pieTotal, () => { if (!loading.value && !error.value) initCharts(); });
watch(items, () => { if (!loading.value && !error.value && items.value.length > 0) initCharts(); }, { deep: true });

onMounted(() => {
  fetchData();
  initTooltips();
  
  ws = createWebSocketConnection(WS_ENDPOINTS.QUESTIONS_ANSWERS, {
    axios: $axios,
    onMessage: (message) => {
      const action = message?.data?.action || message?.action || '';
      const type = message?.type || '';
      if (action || type === 'QUESTION_ANSWER_UPDATE') fetchData();
    },
    onOpen: () => { wsConnected.value = true; },
    onClose: () => { wsConnected.value = false; },
  });
});

onUnmounted(() => {
  if (ws) ws.disconnect();
  if (pieChart) pieChart.destroy();
  if (barChart) barChart.destroy();
});
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
  box-shadow: 0 4px 12px rgba(255, 149, 0, 0.25);
  font-size: 1.5rem;
}
.orange-gradient { background: linear-gradient(135deg, #FF9500 0%, #ffc371 100%); }

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
.red-gradient { background: linear-gradient(135deg, #FF3B30 0%, #ff6b6b 100%); }
.yellow-gradient { background: linear-gradient(135deg, #FFCC00 0%, #ffe066 100%); }

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
.apple-badge-yellow { background: rgba(255, 204, 0, 0.1); color: #dcb000; }
.apple-badge-green { background: rgba(52, 199, 89, 0.1); color: #34C759; }
.apple-badge-gray { background: rgba(142, 142, 147, 0.1); color: #86868b; }

.status-pill { padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; display: inline-block; }
.status-pill.red { background: #ffe5e5; color: #d63031; }
.status-pill.orange { background: #fff4e5; color: #e67e22; }
.status-pill.yellow { background: #fff9db; color: #f1c40f; }
.status-pill.green { background: #e8f8f5; color: #2ecc71; }
.status-pill.gray { background: #f2f2f7; color: #8e8e93; }

.tag-badge {
  display: inline-block; padding: 4px 10px; border-radius: 6px;
  font-size: 0.8rem; font-weight: 600; color: white; opacity: 0.9;
}

.keyword-tag {
  background: rgba(0,0,0,0.05); color: #1d1d1f; padding: 2px 8px;
  border-radius: 4px; font-size: 0.75rem;
}
.keyword-tag.removable { cursor: pointer; transition: background 0.2s; }
.keyword-tag.removable:hover { background: rgba(255, 59, 48, 0.1); color: var(--apple-red); }

/* Buttons */
.btn-apple-primary {
  background: var(--apple-blue); color: white; padding: 8px 16px; border-radius: 10px; border: none; font-weight: 500; transition: transform 0.2s, box-shadow 0.2s; display: inline-flex; align-items: center;
}
.btn-apple-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 113, 227, 0.3); }
.btn-apple-primary.small { padding: 6px 12px; font-size: 0.85rem; }

.btn-apple-secondary {
  background: rgba(0,0,0,0.05); color: #1d1d1f; padding: 8px 16px; border-radius: 10px; border: none; font-weight: 500; transition: background 0.2s;
}
.btn-apple-secondary:hover { background: rgba(0,0,0,0.1); }

/* Modal & Form */
.apple-modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(8px);
  z-index: 99; display: flex; align-items: center; justify-content: center; padding: 20px;
}
.apple-modal-content {
  background: rgba(255,255,255,0.95); backdrop-filter: blur(20px);
  border-radius: 18px; width: 100%; max-width: 900px;
  box-shadow: 0 24px 48px rgba(0,0,0,0.2); overflow: hidden; display: flex; flex-direction: column;
}
.apple-modal-header { padding: 20px 24px; border-bottom: 1px solid rgba(0,0,0,0.06); display: flex; justify-content: space-between; align-items: center; background: white; }
.apple-modal-title { font-size: 1.25rem; font-weight: 700; color: #1d1d1f; margin: 0; }
.apple-modal-subtitle { font-size: 0.9rem; color: #86868b; }
.apple-close-btn { width: 32px; height: 32px; border-radius: 50%; border: none; background: rgba(0,0,0,0.05); color: #1d1d1f; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.apple-close-btn:hover { background: rgba(0,0,0,0.1); transform: rotate(90deg); }
.apple-modal-body { padding: 24px; overflow-y: auto; max-height: 80vh; }

.apple-input-group { margin-bottom: 16px; }
.apple-input-group label { font-size: 0.85rem; font-weight: 600; color: #1d1d1f; margin-bottom: 6px; display: block; }
.apple-input {
  width: 100%; background: rgba(118, 118, 128, 0.12); border: none; border-radius: 10px; padding: 10px 14px; font-size: 1rem; color: #1d1d1f; transition: all 0.2s;
}
.apple-input:focus { outline: none; background: white; box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.15); }
.apple-textarea { resize: vertical; min-height: 100px; }
.apple-icon-btn-abs { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); width: 28px; height: 28px; border-radius: 6px; background: white; border: none; color: var(--apple-blue); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.select-wrapper { position: relative; }
.select-icon { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 0.8rem; color: #86868b; pointer-events: none; }
.select-wrapper select { appearance: none; padding-right: 36px; }
.apple-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }

.empty-state-chart { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #86868b; }
.question-text-cell { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px; }

/* Transitions */
.apple-zoom-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.apple-zoom-leave-active { transition: all 0.2s ease; }
.apple-zoom-enter-from, .apple-zoom-leave-to { opacity: 0; transform: scale(0.95); }

/* Pagination Override */
.pagination .page-link { border: none; color: #1d1d1f; border-radius: 8px; margin: 0 2px; }
.pagination .page-item.active .page-link { background: var(--apple-blue); color: white; box-shadow: 0 2px 8px rgba(0, 113, 227, 0.3); }
</style>