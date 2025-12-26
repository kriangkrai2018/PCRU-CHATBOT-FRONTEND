<template>
  <div class="">
    <div class="card p-4 bg-light shadow-sm mb-4 rounded-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="fs-5 mb-0">Feedbacks Report</h3>
        <span v-if="wsConnected" class="badge bg-success">
          <i class="bi bi-wifi"></i> Live
        </span>
        <span v-else class="badge bg-secondary">
          <i class="bi bi-wifi-off"></i> Offline
        </span>
      </div>
      <!-- Note: Removed Live badge and auto-delete note as requested -->
      <div v-if="feedbacksLoading" class="text-center py-3">
        <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>
        <p class="mt-2">Loading feedbacks data...</p>
      </div>
      <div v-else-if="feedbacksError" class="alert alert-danger" role="alert">Error: {{ feedbacksError }}</div>
      <div v-else>
        <div v-if="questionIdFilter" class="mb-3">
          <div class="alert alert-info py-2 px-3 small mb-0">
            กำลังแสดงผลสำหรับคำถาม ID: <strong>{{ questionIdFilter }}</strong>
          </div>
        </div>
        <!-- Charts Section -->
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="chart-container">
              <canvas ref="pieCanvas"></canvas>
            </div>
          </div>
          <div class="col-md-6">
            <div class="chart-container">
              <canvas ref="barCanvas"></canvas>
            </div>
          </div>
        </div>
        
        <!-- Controls: Total, Type Filter, Search -->
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-2 gap-2">
          <div class="small text-muted">Total: {{ totalEntries }}</div>
          <div class="segmented-filter" role="group" aria-label="Filter by type">
            <button 
              type="button" 
              class="segment-btn" 
              :class="{ active: feedbackTypeFilter === 'all' }" 
              @click="feedbackTypeFilter = 'all'"
            >
              ทั้งหมด
            </button>
            <button 
              type="button" 
              class="segment-btn" 
              :class="{ active: feedbackTypeFilter === 'unlike' }" 
              @click="feedbackTypeFilter = 'unlike'"
            >
              <i class="bi bi-hand-thumbs-down-fill me-1 text-danger"></i> Unlike
              <span class="badge rounded-pill ms-2 bg-danger-subtle text-danger">{{ unlikeCount }}</span>
            </button>
            <button 
              type="button" 
              class="segment-btn" 
              :class="{ active: feedbackTypeFilter === 'like' }" 
              @click="feedbackTypeFilter = 'like'"
            >
              <i class="bi bi-hand-thumbs-up-fill me-1 text-success"></i> Like
              <span class="badge rounded-pill ms-2 bg-success-subtle text-success">{{ likeCount }}</span>
            </button>
          </div>
          <div class="search-wrapper ms-auto">
            <ReportSearch v-model="localSearch" placeholder="ค้นหา feedback หรือ chatlog..." />
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>FeedbackID</th>
                <th>FeedbackValue</th>
                <th>Timestamp</th>
                <th>UserQuery</th>
                <th>QuestionText</th>
                <th>Reason</th>
                <th>Comment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="fb in paginatedFeedbacks" :key="fb.FeedbackID" :class="{ 'unlike-row': fb.FeedbackValue === 0 }">
                <td>{{ fb.FeedbackID }}</td>
                <td>
                  <template v-if="fb.FeedbackValue === 1">
                    <i class="bi bi-hand-thumbs-up-fill text-success me-2" aria-hidden="true"></i>
                    <span class="fw-semibold">Like</span>
                  </template>
                  <template v-else-if="fb.FeedbackValue === 0">
                    <i class="bi bi-hand-thumbs-down-fill text-danger me-2" aria-hidden="true"></i>
                    <span class="fw-semibold">Unlike</span>
                  </template>
                  <template v-else>
                    <span>{{ fb.FeedbackValue }}</span>
                  </template>
                </td>
                <td>
                  <span class="badge" :class="getTimeBadgeClass(fb.Timestamp)">{{ formatRelativeTime(fb.Timestamp) }}</span>
                </td>
                <td>{{ fb.UserQuery || '-' }}</td>
                <td>{{ fb.QuestionText || '-' }}</td>
                <td>
                  <span v-if="fb.FeedbackReason" class="reason-badge" :class="getReasonClass(fb.FeedbackReason)">
                    {{ formatReason(fb.FeedbackReason) }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <div v-if="fb.FeedbackComment" class="comment-cell">
                    <button class="comment-preview-btn" @click="showFullComment(fb)">
                      <i class="bi bi-chat-square-text me-1"></i>
                      <span class="comment-preview">{{ truncateComment(fb.FeedbackComment) }}</span>
                    </button>
                  </div>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <div class="d-flex justify-content-center align-items-center gap-2">
                    <button 
                      v-if="fb.FeedbackValue === 0 && fb.QuestionsAnswersID"
                      class="handle-btn"
                      @click="openInlineEdit(fb)"
                      :disabled="handlingFeedbackId === fb.FeedbackID || savingInlineEdit"
                    >
                      <span v-if="handlingFeedbackId === fb.FeedbackID || savingInlineEdit" class="handle-btn-loading">
                        <i class="bi bi-arrow-repeat spinning"></i>
                      </span>
                      <span v-else class="handle-btn-content">
                        <i class="bi bi-pencil-square me-1"></i>
                        จัดการ
                      </span>
                    </button>

                    <button
                      class="delete-btn"
                      @click="handleFeedback(fb)"
                      :disabled="deletingFeedbackId === fb.FeedbackID"
                      title="ย้ายไปหน้า Feedbacks ที่จัดการแล้ว"
                    >
                      <span v-if="deletingFeedbackId === fb.FeedbackID" class="spinner-border spinner-border-sm me-1"></span>
                      <i v-else class="bi bi-trash me-1"></i>
                      ลบ
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredFeedbacks.length === 0">
                <td colspan="8" class="text-center text-muted py-3">No feedbacks data found</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="d-flex justify-content-between align-items-center p-3 border-top mt-2">
          <div class="small text-muted">Showing {{ startIndex }} to {{ endIndex }} of {{ totalEntries }} entries</div>
          <nav aria-label="Page navigation for feedbacks">
            <ul class="pagination pagination-sm mb-0 align-items-center">
              <li class="page-item" :class="{ disabled: currentPage === 1 }"><a class="page-link" href="#" @click.prevent="firstPage">&laquo;</a></li>
              <li class="page-item" :class="{ disabled: currentPage === 1 }"><a class="page-link" href="#" @click.prevent="prevPage">&lsaquo;</a></li>
              <li v-for="p in pagesToShow" :key="p" class="page-item" :class="{ active: currentPage === p }"><a class="page-link" href="#" @click.prevent="goToPage(p)">{{ p }}</a></li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages || totalPages === 0 }"><a class="page-link" href="#" @click.prevent="nextPage">&rsaquo;</a></li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages || totalPages === 0 }"><a class="page-link" href="#" @click.prevent="lastPage">&raquo;</a></li>
            </ul>
          </nav>
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
      </div>
    </div>
    
    <!-- Comment Modal -->
    <transition name="modal-fade">
      <div v-if="showCommentModal" class="comment-modal-overlay" @click.self="closeCommentModal">
        <div class="comment-modal-content">
          <div class="comment-modal-header">
            <h5 class="comment-modal-title">
              <i class="bi bi-chat-square-text me-2"></i>
              Feedback Comment
            </h5>
            <button class="comment-modal-close" @click="closeCommentModal" aria-label="ปิด">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="comment-modal-body">
            <div class="comment-metadata">
              <div class="comment-meta-item">
                <span class="comment-meta-label">Feedback ID:</span>
                <span class="comment-meta-value">{{ selectedFeedback?.FeedbackID }}</span>
              </div>
              <div class="comment-meta-item" v-if="selectedFeedback?.FeedbackReason">
                <span class="comment-meta-label">Reason:</span>
                <span class="reason-badge" :class="getReasonClass(selectedFeedback.FeedbackReason)">
                  {{ formatReason(selectedFeedback.FeedbackReason) }}
                </span>
              </div>
            </div>
            <div class="comment-text-container">
              <p class="comment-full-text">{{ selectedFeedback?.FeedbackComment }}</p>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Apple-style Alert / Confirm Modal -->
    <transition name="modal-fade">
      <div v-if="showAlertModal" class="alert-modal-overlay" @click.self="closeAlertModal">
        <div class="alert-modal-content">
          <div class="alert-modal-header">
            <h5 class="alert-modal-title">{{ alertModalTitle || (alertModalType === 'confirm' ? 'ยืนยัน' : 'แจ้งเตือน') }}</h5>
            <button class="alert-modal-close" @click="closeAlertModal" aria-label="ปิด">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="alert-modal-body">
            <p class="alert-modal-message" v-html="alertModalMessage"></p>
          </div>
          <div class="alert-modal-footer" v-if="alertModalType === 'confirm'">
            <button class="btn btn-outline-secondary btn-modal-cancel" @click="onAlertCancel">ยกเลิก</button>
            <button class="btn btn-primary btn-modal-confirm" @click="onAlertConfirm">ตกลง</button>
          </div>
          <div class="alert-modal-footer" v-else>
            <button class="btn btn-primary btn-modal-confirm w-100" @click="closeAlertModal">ตกลง</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { formatRelativeTime } from '@/utils/formatTime';
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import ReportSearch from '@/components/ReportSearch.vue';
// Updated: Import Chart.js directly
import Chart from 'chart.js/auto';
// Import WebSocket utilities
import { createWebSocketConnection, WS_ENDPOINTS } from '@/config/websocket.js';
// Use the configured Axios instance with auth interceptors
import { axiosInstance } from '@/plugins/axios';
import { useAppleToast } from '@/composables/useAppleToast';

const router = useRouter();
const route = useRoute();

// Optional pre-filter from query (e.g. ?questionId=123)
const questionIdFilter = ref(route.query?.questionId ? String(route.query.questionId) : '');
watch(() => route.query, (q) => {
  questionIdFilter.value = q?.questionId ? String(q.questionId) : '';
});

const props = defineProps({
  feedbacks: { type: Array, default: () => [] },
  feedbacksLoading: { type: Boolean, default: false },
  feedbacksError: { type: [String, null], default: null },
  showLiveBadge: { type: Boolean, default: true },
});

const emit = defineEmits(['refresh']);

// WebSocket state
const wsConnected = ref(false);
let wsConnection = null;
// Proper axios instance (with token via interceptors)
const $axios = axiosInstance;
const { success: showSuccessToast, error: showErrorToast, info: showInfoToast } = useAppleToast();

const localSearch = ref('');
watch(localSearch, () => { currentPage.value = 1; });

const all = computed(() => Array.isArray(props.feedbacks) ? props.feedbacks : []);

const feedbackTypeFilter = ref('unlike'); // 'all' | 'like' | 'unlike' (default unlike)

function isLikeValue(v) {
  const s = (v ?? '').toString().toLowerCase().trim();
  return s === '1' || s === 'like' || s === 'true';
}
function isUnlikeValue(v) {
  const s = (v ?? '').toString().toLowerCase().trim();
  return s === '0' || s === 'unlike' || s === 'false';
}

const filteredFeedbacks = computed(() => {
  let arr = all.value;
  // If questionId filter present, restrict to feedbacks for that QuestionsAnswersID
  if (questionIdFilter.value) {
    arr = arr.filter(fb => String(fb?.QuestionsAnswersID || '') === String(questionIdFilter.value));
  }
  // If questionIdFilter is present, ignore type filter and show all feedbacks for that question
  const effectiveType = questionIdFilter.value ? 'all' : feedbackTypeFilter.value;
  if (effectiveType === 'like') {
    arr = arr.filter(fb => isLikeValue(fb?.FeedbackValue));
  } else if (effectiveType === 'unlike') {
    arr = arr.filter(fb => isUnlikeValue(fb?.FeedbackValue));
  }

  // Apply search filter
  const q = (localSearch.value || '').toString().trim().toLowerCase();
  if (!q) return arr;
  return arr.filter(fb =>
    String(fb.FeedbackID || '').toLowerCase().includes(q) ||
    (fb.FeedbackValue != null && String(fb.FeedbackValue).toLowerCase().includes(q)) ||
    (fb.UserQuery && String(fb.UserQuery).toLowerCase().includes(q)) ||
    (fb.QuestionText && String(fb.QuestionText).toLowerCase().includes(q)) ||
    (fb.FeedbackReason && String(fb.FeedbackReason).toLowerCase().includes(q)) ||
    (fb.FeedbackComment && String(fb.FeedbackComment).toLowerCase().includes(q)) ||
    (fb.Timestamp && String(fb.Timestamp).toLowerCase().includes(q))
  );
});

watch(feedbackTypeFilter, () => { currentPage.value = 1; });
// When filter/search changes, re-render charts to reflect new dataset
watch(filteredFeedbacks, () => {
  nextTick(() => initCharts());
});

// pagination
const currentPage = ref(1);
const itemsPerPage = ref(8);
const totalEntries = computed(() => filteredFeedbacks.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(totalEntries.value / itemsPerPage.value)));
const startIndex = computed(() => totalEntries.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1);
const endIndex = computed(() => totalEntries.value === 0 ? 0 : Math.min(currentPage.value * itemsPerPage.value, totalEntries.value));
// Sort so that Unlike appears before Like
const sortedFeedbacks = computed(() => {
  const arr = filteredFeedbacks.value.slice();
  return arr.sort((a, b) => {
    const aUnlike = isUnlikeValue(a?.FeedbackValue) ? 1 : 0;
    const bUnlike = isUnlikeValue(b?.FeedbackValue) ? 1 : 0;
    if (aUnlike !== bUnlike) return bUnlike - aUnlike; // put unlike first
    // Secondary sort: newest first by Timestamp if available
    const aTime = a?.Timestamp ? new Date(a.Timestamp).getTime() : 0;
    const bTime = b?.Timestamp ? new Date(b.Timestamp).getTime() : 0;
    return bTime - aTime;
  });
});

const paginatedFeedbacks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return sortedFeedbacks.value.slice(start, start + itemsPerPage.value);
});
const pagesToShow = computed(() => {
  const total = totalPages.value; const current = currentPage.value; const maxButtons = 4;
  if (total <= maxButtons) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 2) return [1, 2, 3, 4];
  if (current >= total - 1) return [total - 3, total - 2, total - 1, total];
  return [current - 1, current, current + 1, current + 2];
});
function goToPage(p) { if (p >= 1 && p <= totalPages.value) currentPage.value = p; }
function prevPage() { goToPage(Math.max(1, currentPage.value - 1)); }
function nextPage() { goToPage(Math.min(totalPages.value, currentPage.value + 1)); }
function firstPage() { goToPage(1); }
function lastPage() { goToPage(totalPages.value); }

// Feedback reason formatting
const reasonLabels = {
  'wrong_answer': 'คำตอบไม่ถูกต้อง',
  'incomplete': 'ข้อมูลไม่ครบถ้วน',
  'outdated': 'ข้อมูลล้าสมัย',
  'not_relevant': 'ไม่เกี่ยวข้องกับคำถาม',
  'confusing': 'เข้าใจยาก/สับสน',
  'too_long': 'ยาวเกินไป',
  'too_short': 'สั้นเกินไป',
  'wrong_format': 'รูปแบบไม่ถูกต้อง',
  'missing_details': 'ขาดรายละเอียดสำคัญ',
  'other': 'อื่นๆ'
};

function formatReason(reason) {
  return reasonLabels[reason] || reason;
}

function getReasonClass(reason) {
  const classes = {
    'wrong_answer': 'reason-wrong',
    'incomplete': 'reason-incomplete',
    'outdated': 'reason-outdated',
    'not_relevant': 'reason-irrelevant',
    'confusing': 'reason-confusing',
    'other': 'reason-other'
  };
  return classes[reason] || 'reason-default';
}

function truncateComment(comment, maxLength = 50) {
  if (!comment) return '';
  return comment.length > maxLength ? comment.substring(0, maxLength) + '...' : comment;
}

// Comment modal
const showCommentModal = ref(false);
const selectedFeedback = ref(null);

function showFullComment(feedback) {
  selectedFeedback.value = feedback;
  showCommentModal.value = true;
}

function closeCommentModal() {
  showCommentModal.value = false;
  setTimeout(() => {
    selectedFeedback.value = null;
  }, 300);
}

// Apple-style Alert / Confirm modal state
const showAlertModal = ref(false);
const alertModalMessage = ref('');
const alertModalTitle = ref('');
const alertModalType = ref('info'); // 'info' | 'error' | 'confirm'
let alertConfirmResolve = null;

function openAlert({ title = '', message = '', type = 'info' } = {}) {
  alertModalTitle.value = title || (type === 'confirm' ? 'ยืนยัน' : 'แจ้งเตือน');
  alertModalMessage.value = message || '';
  alertModalType.value = type;
  showAlertModal.value = true;
  return Promise.resolve();
}

function openConfirm({ title = '', message = '' } = {}) {
  alertModalTitle.value = title || 'ยืนยัน';
  alertModalMessage.value = message || '';
  alertModalType.value = 'confirm';
  showAlertModal.value = true;
  return new Promise((resolve) => { alertConfirmResolve = resolve; });
}

function closeAlertModal() {
  showAlertModal.value = false;
  setTimeout(() => {
    alertModalMessage.value = '';
    alertModalTitle.value = '';
    alertModalType.value = 'info';
    alertConfirmResolve = null;
  }, 300);
}

function onAlertConfirm() {
  showAlertModal.value = false;
  if (alertConfirmResolve) {
    alertConfirmResolve(true);
    alertConfirmResolve = null;
  }
}

function onAlertCancel() {
  showAlertModal.value = false;
  if (alertConfirmResolve) {
    alertConfirmResolve(false);
    alertConfirmResolve = null;
  }
}

// Using shared Thai relative time formatter
// formatRelativeTime imported from '@/utils/formatTime';


// Get badge class based on time elapsed
function getTimeBadgeClass(timestamp) {
  if (!timestamp) return 'bg-secondary';
  
  const now = new Date();
  const past = new Date(timestamp);
  
  if (isNaN(past.getTime())) return 'bg-secondary';
  
  const diffMs = now - past;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  // ✨ Green: ล่าสุด (< 1 นาที)
  if (diffSeconds < 60) return 'bg-success';
  // 🔵 Blue: ใหม่ (< 1 ชั่วโมง)
  if (diffMinutes < 60) return 'bg-info';
  // 🟡 Warning: วันนี้ (< 24 ชั่วโมง)
  if (diffHours < 24) return 'bg-warning text-dark';
  // 🟠 Orange: อีก 7 วัน
  if (diffDays < 7) return 'bg-orange';
  // 🔴 Danger: มากกว่า 7 วัน
  return 'bg-danger';
}

// Changed: compute counts from filteredFeedbacks and handle numeric/string forms
const likeCount = computed(() => {
  return filteredFeedbacks.value.reduce((acc, fb) => {
    const v = (fb?.FeedbackValue ?? '').toString().toLowerCase().trim();
    if (v === '1' || v === 'like' || v === 'true') return acc + 1;
    return acc;
  }, 0);
});
const unlikeCount = computed(() => {
  return filteredFeedbacks.value.reduce((acc, fb) => {
    const v = (fb?.FeedbackValue ?? '').toString().toLowerCase().trim();
    if (v === '0' || v === 'unlike' || v === 'false') return acc + 1;
    return acc;
  }, 0);
});

// Added: Pie chart data (green for like, red for unlike)
const pieData = computed(() => ({
  labels: ['Unlike', 'Like'],
  datasets: [{
    data: [unlikeCount.value, likeCount.value],
    backgroundColor: ['#dc3545', '#28a745'],
    borderWidth: 1
  }]
}));
const pieOptions = { 
  responsive: true, 
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
};

// Added: labels derived from feedback timestamps (group by ISO date)
const lineLabels = computed(() => {
  const dates = filteredFeedbacks.value.map(fb => {
    const ts = fb?.Timestamp;
    if (!ts) return 'Unknown';
    const d = new Date(ts);
    if (isNaN(d.getTime())) {
      // try to extract date-like part
      return String(ts).split('T')[0] || String(ts);
    }
    return d.toISOString().slice(0, 10);
  });
  const uniq = Array.from(new Set(dates)).sort();
  return uniq.length ? uniq : ['All'];
});

// Added: line chart data (counts per date for like/unlike)
const lineData = computed(() => {
  const labels = lineLabels.value;
  const likeSeries = labels.map(lbl =>
    filteredFeedbacks.value.filter(fb => {
      const ts = fb?.Timestamp;
      const d = ts ? (isNaN(new Date(ts).getTime()) ? String(ts).split('T')[0] : new Date(ts).toISOString().slice(0,10)) : 'Unknown';
      const v = (fb?.FeedbackValue ?? '').toString().toLowerCase().trim();
      return d === lbl && (v === '1' || v === 'like' || v === 'true');
    }).length
  );
  const unlikeSeries = labels.map(lbl =>
    filteredFeedbacks.value.filter(fb => {
      const ts = fb?.Timestamp;
      const d = ts ? (isNaN(new Date(ts).getTime()) ? String(ts).split('T')[0] : new Date(ts).toISOString().slice(0,10)) : 'Unknown';
      const v = (fb?.FeedbackValue ?? '').toString().toLowerCase().trim();
      return d === lbl && (v === '0' || v === 'unlike' || v === 'false');
    }).length
  );
  return {
    labels,
    datasets: [
      { label: 'Unlike', data: unlikeSeries, borderColor: '#dc3545', backgroundColor: 'rgba(220,53,69,0.15)', fill: true, tension: 0.35 },
      { label: 'Like', data: likeSeries, borderColor: '#28a745', backgroundColor: 'rgba(40,167,69,0.15)', fill: true, tension: 0.35 }
    ]
  };
});
const lineOptions = { 
  responsive: true, 
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
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

// Added: Refs for canvas elements
const pieCanvas = ref(null);
const barCanvas = ref(null);

// Added: Chart instances
let pieChart, barChart;

// WebSocket connection for real-time updates (optional, graceful degradation)
function connectWebSocket() {
  // Only attempt WebSocket connection if enabled
  const enableWebSocket = import.meta.env.VITE_ENABLE_WEBSOCKET !== 'false';
  
  if (!enableWebSocket) {
    console.log('WebSocket disabled via environment variable');
    return;
  }
  
  try {
    wsConnection = createWebSocketConnection(WS_ENDPOINTS.FEEDBACKS, {
      axios: $axios,
      onOpen: () => {
        wsConnected.value = true;
        console.log('FeedbacksReport: WebSocket connected');
      },
      onMessage: (data) => {
        console.log('🔔 FeedbacksReport: Received WebSocket message:', data);
        // Normalize type to lowercase and support nested payloads from backend
        const type = (data?.type || '').toString().toLowerCase();
        const payload = data?.data || {};
        const action = (payload?.action || data?.action || '').toString().toLowerCase();
        const feedbackId = payload?.feedbackId ?? data?.feedbackId ?? null;

        console.log('🔍 normalized type:', type);
        console.log('🔍 action:', action);
        console.log('🔍 feedbackId:', feedbackId);

        // Trigger refresh on any recognized signal
        const shouldRefresh = (
          type === 'feedback_update' ||
          type === 'update' ||
          action === 'updated' ||
          action === 'created' ||
          action === 'deleted' ||
          feedbackId !== null
        );

        if (shouldRefresh) {
          console.log('✅ FeedbacksReport: Conditions met, refreshing data...');
          emit('refresh');
        } else {
          console.log('❌ FeedbacksReport: Conditions NOT met, skipping refresh');
        }
      },
      onError: (error) => {
        wsConnected.value = false;
        // Silently fail - WebSocket is optional feature
        console.debug('FeedbacksReport: WebSocket error (this is optional, continuing without real-time updates)');
      },
      onClose: () => {
        wsConnected.value = false;
        console.debug('FeedbacksReport: WebSocket closed');
      },
      autoReconnect: true, // Enable auto-reconnect
    });
  } catch (error) {
    console.debug('FeedbacksReport: Failed to initialize WebSocket (continuing without real-time updates):', error);
    wsConnected.value = false;
  }
}

function disconnectWebSocket() {
  if (wsConnection) {
    wsConnection.disconnect();
    wsConnection = null;
    wsConnected.value = false;
  }
}

// Added: Initialize charts
function initCharts() {
  // Destroy existing charts first
  if (pieChart) {
    pieChart.destroy();
    pieChart = null;
  }
  if (barChart) {
    barChart.destroy();
    barChart = null;
  }

  // Wait for next tick to ensure canvas is rendered
  nextTick(() => {
    // doughnut (was pie)
    if (pieCanvas.value && pieData.value) {
      pieChart = new Chart(pieCanvas.value, {
        type: 'doughnut',
        data: pieData.value,
        options: pieOptions
      });
    }

    // line (was bar)
    if (barCanvas.value && lineData.value) {
      barChart = new Chart(barCanvas.value, {
        type: 'line',
        data: lineData.value,
        options: lineOptions
      });
    }
  });
}

onMounted(() => {
  // Initialize charts after data is loaded
  initCharts();
  
  // Connect WebSocket for real-time updates
  connectWebSocket();
});

// Watch for data changes and reinitialize charts
watch(() => props.feedbacks, () => {
  if (!props.feedbacksLoading && !props.feedbacksError) {
    initCharts();
  }
}, { deep: true });

// Also watch for loading state change
watch(() => props.feedbacksLoading, (newVal) => {
  if (!newVal && !props.feedbacksError && props.feedbacks.length > 0) {
    nextTick(() => {
      initCharts();
    });
  }
});

// Added: destroy charts on unmount
onBeforeUnmount(() => {
  if (pieChart) { pieChart.destroy(); pieChart = null; }
  if (barChart) { barChart.destroy(); barChart = null; }
  // Disconnect WebSocket
  disconnectWebSocket();
});

// Inline edit flow: open modal, edit Q&A, then mark handled after save
const handlingFeedbackId = ref(null);
const deletingFeedbackId = ref(null);
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
const editingFeedback = ref(null);

function resetInlineForm() {
  inlineForm.value = {
    questionTitle: '',
    questionText: '',
    reviewDate: new Date().toISOString().slice(0,10),
    categoriesId: '',
    keywords: []
  };
  inlineKeywordsInput.value = '';
}

function closeInlineEdit() {
  showInlineEdit.value = false;
  editingFeedback.value = null;
  resetInlineForm();
}

function addInlineKeyword() {
  const raw = inlineKeywordsInput.value || '';
  const parts = raw.split(/[;,\n]/).map(p => p.trim()).filter(Boolean);
  parts.forEach(p => {
    if (!inlineForm.value.keywords.includes(p)) inlineForm.value.keywords.push(p);
  });
  inlineKeywordsInput.value = '';
}

function removeInlineKeyword(idx) {
  inlineForm.value.keywords.splice(idx, 1);
}

async function fetchInlineCategories() {
  try {
    const resp = await $axios.get('/questionsanswers/categories');
    inlineCategories.value = resp.data?.data || resp.data || [];
  } catch (err) {
    console.error('Failed to load categories:', err);
    inlineCategories.value = [];
  }
}

async function fetchInlineQuestion(questionId) {
  const resp = await $axios.get('/questionsanswers');
  const list = Array.isArray(resp.data) ? resp.data : (resp.data?.data || []);
  const item = list.find(it => String(it.QuestionsAnswersID) === String(questionId));
  return item || null;
}

async function openInlineEdit(feedback) {
  if (!feedback?.FeedbackID || !feedback?.QuestionsAnswersID) return;
  handlingFeedbackId.value = feedback.FeedbackID;
  showInlineEdit.value = true;
  editLoading.value = true;
  editingFeedback.value = feedback;
  resetInlineForm();
  try {
    await fetchInlineCategories();
    const qa = await fetchInlineQuestion(feedback.QuestionsAnswersID);
    if (!qa) {
      await openAlert({ message: 'ไม่พบคำถาม/คำตอบสำหรับ Feedback นี้', type: 'error' });
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
    const catId = resolveCategoryId(qa.CategoriesID || qa.CategoryID || qa.categoriesId || qa.categoryId || qa.CategoriesName || qa.CategoryName);

    inlineForm.value.questionTitle = qa.QuestionTitle || '';
    inlineForm.value.questionText = qa.QuestionText || '';
    inlineForm.value.reviewDate = qa.ReviewDate ? new Date(qa.ReviewDate).toISOString().slice(0,10) : new Date().toISOString().slice(0,10);
    inlineForm.value.categoriesId = catId ? String(catId) : '';
    inlineForm.value.keywords = (qa.keywords || []).map(k => k.KeywordText || k);
  } catch (err) {
    console.error('Failed to load inline edit data:', err);
    await openAlert({ message: 'โหลดข้อมูลไม่สำเร็จ', type: 'error' });
    closeInlineEdit();
  } finally {
    editLoading.value = false;
    handlingFeedbackId.value = null;
  }
}

async function saveInlineEdit() {
  if (!editingFeedback.value) return;
  if (!inlineForm.value.questionTitle || !inlineForm.value.questionText || !inlineForm.value.categoriesId || !inlineForm.value.reviewDate) {
    await openAlert({ message: 'กรอกข้อมูลให้ครบก่อนบันทึก', type: 'error' });
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
    await $axios.put(`/questionsanswers/update/${editingFeedback.value.QuestionsAnswersID}`, payload);
    await $axios.put(`/feedbacks/${editingFeedback.value.FeedbackID}/handle`);
    closeInlineEdit();
    emit('refresh');
  } catch (err) {
    console.error('Inline edit save failed:', err);
    const msg = err.response?.data?.message || err.message || 'บันทึกไม่สำเร็จ';
    await openAlert({ message: msg, type: 'error' });
  } finally {
    savingInlineEdit.value = false;
  }
}

// Directly mark a feedback as handled (moves it to handled feedbacks)
async function handleFeedback(fb) {
  if (!fb?.FeedbackID) return;
  const ok = await openConfirm({ message: 'ยืนยันย้าย Feedback นี้ไปยังรายการที่จัดการแล้ว?' });
  if (!ok) return;
  deletingFeedbackId.value = fb.FeedbackID;
  try {
    await $axios.put(`/feedbacks/${fb.FeedbackID}/handle`);
    showSuccessToast('ย้าย Feedback ไปยังรายการที่จัดการแล้ว');
    emit('refresh');
    router.push({ name: 'report-feedbacks-handled' });
  } catch (err) {
    console.error('Failed to handle feedback:', err);
    const msg = err.response?.data?.message || 'การดำเนินการล้มเหลว';
    showErrorToast(msg);
    await openAlert({ message: msg, type: 'error' });
  } finally {
    deletingFeedbackId.value = null;
  }
}
</script>

<style scoped>
.search-wrapper {
  min-width: 220px;
  max-width: 320px;
  width: auto; /* keep compact and aligned to the right */
  margin-left: auto;
  display: flex;
  justify-content: flex-end;
  flex: 0 0 auto;
}
.search-wrapper .search-input-group {
  width: 100%;
  max-width: 320px;
}
.input-group.search-input-group {
  position: relative;
}

/* Segmented filter (Apple-style) */
.segmented-filter {
  display: inline-flex;
  background: #f1f3f5;
  border-radius: 999px;
  padding: 4px;
  gap: 4px;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
}
.segment-btn {
  border: none;
  background: transparent;
  color: #1d1d1f;
  font-weight: 600;
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 999px;
  transition: all 0.2s ease;
}
.segment-btn:hover { background: rgba(255,255,255,0.7); }
.segment-btn.active {
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
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

.pagination .page-item.active .page-link {
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%) !important;
  color: #FFFFFF !important;
  border: none !important;
  font-weight: 600;
  box-shadow: none;
}

.pagination .page-item.disabled .page-link {
  color: #adb5bd;
  pointer-events: none;
}

.pagination .page-link:focus,
.pagination .page-link:hover {
  background: transparent !important;
  color: #495057;
  box-shadow: none;
}

.pagination .page-num {
  border-radius: 0.5rem !important;
}

.pagination {
  margin-bottom: 0 !important;
}

/* Added: Style for charts */
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

/* Reason badges - Apple style */
.reason-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: -0.01em;
  white-space: nowrap;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.reason-wrong {
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.12) 0%, rgba(220, 53, 69, 0.08) 100%);
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.2);
}

.reason-incomplete {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.12) 0%, rgba(255, 193, 7, 0.08) 100%);
  color: #f59f00;
  border: 1px solid rgba(255, 193, 7, 0.2);
}

.reason-outdated {
  background: linear-gradient(135deg, rgba(253, 126, 20, 0.12) 0%, rgba(253, 126, 20, 0.08) 100%);
  color: #fd7e14;
  border: 1px solid rgba(253, 126, 20, 0.2);
}

.reason-irrelevant {
  background: linear-gradient(135deg, rgba(108, 117, 125, 0.12) 0%, rgba(108, 117, 125, 0.08) 100%);
  color: #6c757d;
  border: 1px solid rgba(108, 117, 125, 0.2);
}

.reason-confusing {
  background: linear-gradient(135deg, rgba(102, 16, 242, 0.12) 0%, rgba(102, 16, 242, 0.08) 100%);
  color: #6610f2;
  border: 1px solid rgba(102, 16, 242, 0.2);
}

.reason-other {
  background: linear-gradient(135deg, rgba(13, 202, 240, 0.12) 0%, rgba(13, 202, 240, 0.08) 100%);
  color: #0dcaf0;
  border: 1px solid rgba(13, 202, 240, 0.2);
}

.reason-default {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.06) 0%, rgba(0, 0, 0, 0.04) 100%);
  color: #495057;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

/* Comment cell */
.comment-cell {
  max-width: 280px;
}

.comment-preview-btn {
  all: unset;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(107, 44, 145, 0.06);
  border-radius: 10px;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(107, 44, 145, 0.1);
  max-width: 100%;
}

.comment-preview-btn:hover {
  background: rgba(107, 44, 145, 0.12);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(107, 44, 145, 0.15);
}

.comment-preview-btn:active {
  transform: translateY(0);
}

.comment-preview {
  font-size: 13px;
  color: #6B2C91;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}

.comment-preview-btn i {
  color: #6B2C91;
  flex-shrink: 0;
}

/* Comment Modal - Apple style */
.comment-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.comment-modal-content {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  box-shadow: 
    0 0 0 0.5px rgba(0,0,0,0.04),
    0 20px 40px rgba(0,0,0,0.15),
    0 40px 80px rgba(0,0,0,0.1);
  overflow: hidden;
  border: 0.5px solid rgba(0, 0, 0, 0.06);
}

.comment-modal-content.wide {
  max-width: 900px;
}

.comment-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #8B4CB8 0%, #6B2C91 100%);
  color: #fff;
}

.comment-modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
}

.comment-modal-close {
  all: unset;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 150ms ease;
  color: #fff;
}

.comment-modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.comment-modal-body {
  padding: 24px;
}

.comment-metadata {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.comment-meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-meta-label {
  font-size: 13px;
  color: #6c757d;
  font-weight: 500;
}

.comment-meta-value {
  font-size: 14px;
  color: #212529;
  font-weight: 600;
}

.comment-text-container {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.comment-full-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #212529;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Modal animations */
/* Overlay transition: fade + blur */
.modal-fade-enter-active {
  animation: overlayFadeIn 220ms cubic-bezier(0.2,0.9,0.2,1) both;
}

.modal-fade-leave-active {
  animation: overlayFadeOut 180ms cubic-bezier(0.4,0,1,1) both;
}

/* Content pop animations for alert/comment modals */
.modal-fade-enter-active .alert-modal-content,
.modal-fade-enter-active .comment-modal-content {
  animation: modalPopIn 360ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.modal-fade-leave-active .alert-modal-content,
.modal-fade-leave-active .comment-modal-content {
  animation: modalPopOut 220ms cubic-bezier(0.4, 0.0, 1, 1) both;
}

/* Alert / Confirm Modal (Apple-style) */
.alert-modal-overlay {
  position: fixed;
  inset: 0;
  /* the overlay container is transparent; actual blur is performed by ::before */
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 18px;
  isolation: isolate; /* create new stacking context so children sit above the pseudo-element */
}
/* Pseudo-element creates the dim + blur layer behind modal content */
.alert-modal-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: rgba(8,10,12,0.42);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 1;
  transition: opacity 200ms ease, backdrop-filter 220ms ease;
}

/* Ensure modal content sits above the blurred layer and stays sharp */
.alert-modal-content {
  position: relative;
  z-index: 2;
  /* explicitly disable any backdrop filters on the modal itself */
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  transform: translateZ(0); /* ensure its own layer */
}
.alert-modal-content {
  width: 640px;
  max-width: 100%;
  /* White/light theme for alert */
  background: linear-gradient(180deg, #ffffff, #fbfdff);
  color: #0b1220;
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(15,23,42,0.08);
  border: 1px solid rgba(14,20,30,0.06);
  overflow: hidden;
  transform-origin: center;
}
.alert-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 24px;
}
.alert-modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #0b1220;
}
.alert-modal-close {
  all: unset;
  cursor: pointer;
  color: rgba(11,18,32,0.6);
  padding: 8px;
  border-radius: 8px;
}
.alert-modal-body {
  padding: 18px 24px 20px 24px;
}
.alert-modal-message {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: rgba(11,18,32,0.92);
}
.alert-modal-footer {
  display: flex;
  gap: 12px;
  padding: 14px 18px 20px 18px;
  justify-content: flex-end;
}
.btn-modal-cancel {
  background: rgba(11,18,32,0.06);
  color: #0b1220;
  border-radius: 16px;
  padding: 8px 18px;
  border: none;
}
.btn-modal-confirm {
  background: linear-gradient(135deg, #007AFF 0%, #0055DD 100%);
  color: #ffffff;
  border-radius: 16px;
  padding: 8px 18px;
  border: none;
  box-shadow: 0 8px 20px rgba(0,85,221,0.16);
}

/* Overlay blur fade */
@keyframes overlayFadeIn {
  0% { opacity: 0; backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px); }
  100% { opacity: 1; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
}
@keyframes overlayFadeOut {
  0% { opacity: 1; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
  100% { opacity: 0; backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px); }
}

/* Modal pop in/out keyframes */
@keyframes modalPopIn {
  0% { transform: translateY(-10px) scale(0.98); opacity: 0; filter: blur(4px); }
  60% { transform: translateY(6px) scale(1.03); opacity: 1; filter: blur(0); }
  100% { transform: translateY(0) scale(1); opacity: 1; filter: none; }
}
@keyframes modalPopOut {
  0% { transform: translateY(0) scale(1); opacity: 1; filter: none; }
  100% { transform: translateY(-8px) scale(0.98); opacity: 0; filter: blur(4px); }
}

.bg-orange {
  background-color: #FD7E14 !important;
  color: white;
}

/* keep existing comment modal slide for fallback */
.modal-fade-enter-active .comment-modal-content {
  animation: modalSlideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.modal-fade-leave-active .comment-modal-content {
  animation: modalSlideDown 0.2s cubic-bezier(0.6, 0, 0.8, 0.2);
}

@keyframes modalSlideUp {
  0% {
    transform: translateY(40px) scale(0.96);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes modalSlideDown {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(20px) scale(0.98);
    opacity: 0;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .comment-modal-content {
    max-width: 95%;
    margin: 0 auto;
  }
  
  .comment-cell {
    max-width: 180px;
  }
  
  .comment-preview {
    max-width: 140px;
  }
}

/* ===== Apple-style Handle Button ===== */
.unlike-row {
  background: linear-gradient(135deg, rgba(255, 59, 48, 0.03) 0%, rgba(255, 149, 0, 0.02) 100%);
}

.unlike-row:hover {
  background: linear-gradient(135deg, rgba(255, 59, 48, 0.06) 0%, rgba(255, 149, 0, 0.04) 100%);
}

.handle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #007AFF 0%, #0051D4 100%);
  border: none;
  border-radius: 20px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 
    0 2px 8px rgba(0, 122, 255, 0.25),
    0 1px 3px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  min-width: 90px;
}

.handle-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: left 0.5s ease;
}

.handle-btn:hover::before {
  left: 100%;
}

.handle-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 
    0 6px 20px rgba(0, 122, 255, 0.35),
    0 3px 8px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  background: linear-gradient(135deg, #0088FF 0%, #0055DD 100%);
}

.handle-btn:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 
    0 2px 6px rgba(0, 122, 255, 0.2),
    0 1px 2px rgba(0, 0, 0, 0.1),
    inset 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.1s ease;
}

.handle-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 6px rgba(0, 122, 255, 0.15);
}

.handle-btn-content {
  display: flex;
  align-items: center;
  gap: 4px;
}

.handle-btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinning {
  animation: spin 0.8s linear infinite;
}

/* Apple-style ripple effect */
.handle-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transform: translate(-50%, -50%);
  transition: width 0.4s ease, height 0.4s ease, opacity 0.4s ease;
  opacity: 0;
}

.handle-btn:active::after {
  width: 200px;
  height: 200px;
  opacity: 1;
  transition: 0s;
}

/* Delete button (red) */
.delete-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #ff3b30 0%, #c2231f 100%);
  border: none;
  border-radius: 18px;
  cursor: pointer;
  min-width: 68px;
}

.delete-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 20px rgba(255, 59, 48, 0.18);
}

.delete-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Table action column styling */
table th:last-child,
table td:last-child {
  text-align: center;
  white-space: nowrap;
}
</style>
