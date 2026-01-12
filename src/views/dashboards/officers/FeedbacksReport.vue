<template>
  <div class="">
    <div class="card p-4 bg-light shadow-sm mb-4 rounded-4">
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
        <!-- Charts Section (hidden when no data) -->
        <div v-if="chartTotal > 0" class="row mb-4">
          <div class="col-md-6">
            <div class="chart-container">
              <canvas id="feedbacks-pie-chart" ref="pieCanvas"></canvas>
            </div>
          </div>
          <div class="col-md-6">
            <div class="chart-container">
              <canvas id="feedbacks-bar-chart" ref="barCanvas"></canvas>
            </div>
          </div>
        </div>
        
        <!-- Controls: Apple Filters + Search -->
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-2 gap-2">
          <div class="small text-muted">Total: {{ totalEntries }}</div>
          <div class="search-container">
            <i class="bi bi-search search-icon"></i>
            <input
              type="text"
              class="search-input"
              placeholder="ค้นหา feedback หรือ chatlog..."
              v-model="localSearch"
            />
            <button v-if="localSearch" class="search-clear" @click="localSearch = ''">
              <i class="bi bi-x-circle-fill"></i>
            </button>
          </div>
        </div>
        
        <AppleFilters
          v-model="filters"
          :show-sort="true"
          :sort-options="feedbackSortOptions"
          default-sort-by="date"
          default-sort-order="desc"
          :statuses="feedbackStatuses"
          status-label="ประเภท"
          :show-date-presets="true"
          :show-date-range="true"
          @change="onFiltersChange"
        />

        <div class="table-responsive">
          <table class="table table-striped table-hover feedbacks-table">
            <thead>
              <tr>
                <th>FeedbackID</th>
                <th>FeedbackValue</th>
                <th>Timestamp</th>
                <th>UserQuery</th>
                <th>QuestionText</th>
                <th>Reason</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="fb in paginatedFeedbacks" 
                :key="fb.FeedbackID" 
                :class="['clickable-row', { 'unlike-row': fb.FeedbackValue === 0 }]"
                @click="openDrawer(fb)"
              >
                <td data-label="ID">{{ fb.FeedbackID }}</td>
                <td data-label="สถานะ">
                  <template v-if="fb.FeedbackValue === 1">
                    <i class="bi bi-hand-thumbs-up-fill text-success me-2" aria-hidden="true"></i>
                    <span class="fw-semibold">Like</span>
                  </template>
                  <template v-else-if="fb.FeedbackValue === 0">
                    <i class="bi bi-hand-thumbs-down-fill text-danger me-2" aria-hidden="true"></i>
                    <span class="fw-semibold">Unlike</span>
                  </template>
                  <template v-else-if="fb.FeedbackValue === 2">
                    <i class="bi bi-hourglass-split text-warning me-2" aria-hidden="true"></i>
                    <span class="fw-semibold">Pending</span>
                  </template>
                  <template v-else>
                    <span>{{ fb.FeedbackValue }}</span>
                  </template>
                </td>
                <td data-label="เวลา">
                  <span class="badge" :class="getTimeBadgeClass(fb.Timestamp)">{{ formatRelativeTime(fb.Timestamp) }}</span>
                </td>
                <td data-label="คำถามผู้ใช้">
                  <div class="cell-ellipsis" :title="fb.UserQuery || ''">{{ fb.UserQuery || '-' }}</div>
                </td>
                <td data-label="คำตอบ">
                  <div class="cell-ellipsis" :title="fb.QuestionText || ''">{{ fb.QuestionText || '-' }}</div>
                </td>
                <td data-label="เหตุผล">
                  <span v-if="fb.FeedbackReason" class="reason-badge" :class="getReasonClass(fb.FeedbackReason)">
                    {{ formatReason(fb.FeedbackReason) }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td data-label="ความคิดเห็น">
                  <div v-if="fb.FeedbackComment" class="comment-cell">
                    <button class="comment-preview-btn" @click.stop="showFullComment(fb)">
                      <i class="bi bi-chat-square-text me-1"></i>
                      <span class="comment-preview">{{ truncateComment(fb.FeedbackComment) }}</span>
                    </button>
                  </div>
                  <span v-else class="text-muted">-</span>
                </td>
              </tr>
              <tr v-if="filteredFeedbacks.length === 0">
                <td colspan="7" class="text-center text-muted py-3">No feedbacks data found</td>
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

      </div>
    </div>
    
    <!-- Inline Edit Modal (Apple Style) - Teleported to body for proper z-index layering -->
    <Teleport to="body">
      <transition name="apple-zoom">
        <div v-if="showInlineEdit" class="apple-modal-overlay" @click.self="closeInlineEdit">
          <div class="apple-modal-content wide-modal">
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
                      <input type="text" class="apple-input" v-model="inlineKeywordsInput" @keyup.enter.prevent="addInlineKeyword" placeholder="Type and press Enter..." style="padding-right: 40px;" />
                      <button class="apple-icon-btn-abs" @click="addInlineKeyword" title="Add keyword"><i class="bi bi-plus-lg"></i></button>
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
      </Teleport>
    
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

    <!-- Preview Drawer (Sidebar) - Teleported to body for proper z-index layering -->
    <Teleport to="body">
      <div class="drawer-overlay" v-if="showDrawer" @click="closeDrawer"></div>
      <div class="apple-drawer" :class="{ 'drawer-open': showDrawer }">
        <div class="drawer-header">
        <h5 class="drawer-title">รายละเอียด Feedback</h5>
        <button class="btn-close-drawer" @click="closeDrawer">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <div class="drawer-body">
        <div class="drawer-section">
          <div class="drawer-label">Feedback ID</div>
          <div class="drawer-value text-secondary">{{ drawerFeedback?.FeedbackID || '-' }}</div>
        </div>
        <div class="drawer-section">
          <div class="drawer-label">สถานะ</div>
          <div class="drawer-value">
            <span v-if="drawerFeedback?.FeedbackValue === 1" class="d-flex align-items-center gap-2">
              <i class="bi bi-hand-thumbs-up-fill text-success fs-5"></i>
              <span class="fw-semibold text-success">Like</span>
            </span>
            <span v-else-if="drawerFeedback?.FeedbackValue === 0" class="d-flex align-items-center gap-2">
              <i class="bi bi-hand-thumbs-down-fill text-danger fs-5"></i>
              <span class="fw-semibold text-danger">Unlike</span>
            </span>
            <span v-else-if="drawerFeedback?.FeedbackValue === 2" class="d-flex align-items-center gap-2">
              <i class="bi bi-hourglass-split text-warning fs-5"></i>
              <span class="fw-semibold text-warning">Pending</span>
            </span>
            <span v-else class="text-muted">-</span>
          </div>
        </div>
        <div class="drawer-section">
          <div class="drawer-label">เวลา</div>
          <div class="drawer-value d-flex align-items-center gap-2">
            <span class="badge" :class="getTimeBadgeClass(drawerFeedback?.Timestamp)">
              {{ formatRelativeTime(drawerFeedback?.Timestamp) }}
            </span>
            <span class="text-muted small">({{ formatFullTimestamp(drawerFeedback?.Timestamp) }})</span>
          </div>
        </div>
        <div class="drawer-section">
          <div class="drawer-label">คำถามผู้ใช้ (User Query)</div>
          <div class="drawer-value text-dark whitespace-prewrap">{{ drawerFeedback?.UserQuery || '-' }}</div>
        </div>
        <div class="drawer-section">
          <div class="drawer-label">คำตอบ (Question Text)</div>
          <div class="drawer-value text-dark whitespace-prewrap">{{ drawerFeedback?.QuestionText || '-' }}</div>
        </div>
        <div class="drawer-section" v-if="drawerFeedback?.FeedbackReason">
          <div class="drawer-label">เหตุผล</div>
          <div class="mt-2">
            <span class="reason-badge" :class="getReasonClass(drawerFeedback.FeedbackReason)">
              {{ formatReason(drawerFeedback.FeedbackReason) }}
            </span>
          </div>
        </div>
        <div class="drawer-section" v-if="drawerFeedback?.FeedbackComment">
          <div class="drawer-label">ความคิดเห็น</div>
          <div class="drawer-value text-dark whitespace-prewrap comment-text-box">{{ drawerFeedback.FeedbackComment }}</div>
        </div>
      </div>
      <div class="drawer-footer">
        <div class="d-flex gap-2">
          <button 
            v-if="drawerFeedback?.FeedbackValue === 0 && drawerFeedback?.QuestionsAnswersID"
            class="btn-apple-primary flex-fill" 
            @click="openInlineEditFromDrawer"
            :disabled="handlingFeedbackId === drawerFeedback?.FeedbackID || savingInlineEdit"
          >
            <i class="bi bi-pencil-square me-2"></i> แก้ไขคำถาม
          </button>
          <button 
            v-if="drawerFeedback?.FeedbackValue !== 1"
            class="btn-apple-secondary text-danger flex-fill" 
            @click="handleFeedbackFromDrawer"
            :disabled="deletingFeedbackId === drawerFeedback?.FeedbackID"
          >
            <span v-if="deletingFeedbackId === drawerFeedback?.FeedbackID" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="bi bi-trash me-2"></i> ลบ
          </button>
        </div>
      </div>
    </div>
    </Teleport>
  </div>
</template>

<script setup>
import { formatRelativeTime } from '@/utils/formatTime';
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AppleFilters from '@/components/AppleFilters.vue';
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

// Apple Filters Configuration
const filters = ref({
  sortBy: 'date',
  sortOrder: 'desc',
  status: '',
  datePreset: 'all',
  dateFrom: '',
  dateTo: ''
});

// Initialize status from query if present
if (route.query?.status) {
  filters.value.status = route.query.status;
}

watch(() => route.query, (q) => {
  questionIdFilter.value = q?.questionId ? String(q.questionId) : '';
  if (q?.status) {
    filters.value.status = q.status;
  }
});

const feedbackSortOptions = [
  { value: 'date', label: 'วันที่' },
  { value: 'id', label: 'รหัส' },
  { value: 'type', label: 'ประเภท' }
];

const feedbackStatuses = [
  { value: 'unlike', label: 'Unlike', icon: 'bi bi-hand-thumbs-down-fill', color: 'danger' },
  { value: 'like', label: 'Like', icon: 'bi bi-hand-thumbs-up-fill', color: 'success' },
  { value: 'pending', label: 'Pending', icon: 'bi bi-hourglass-split', color: 'warning' }
];

function onFiltersChange(newFilters) {
  currentPage.value = 1;
}

// Legacy filter for backward compatibility
const feedbackTypeFilter = computed(() => filters.value.status || 'all');

function isLikeValue(v) {
  const s = (v ?? '').toString().toLowerCase().trim();
  return s === '1' || s === 'like' || s === 'true';
}
function isUnlikeValue(v) {
  const s = (v ?? '').toString().toLowerCase().trim();
  return s === '0' || s === 'unlike' || s === 'false';
}
function isPendingValue(v) {
  const s = (v ?? '').toString().toLowerCase().trim();
  return s === '2' || s === 'pending';
}

const filteredFeedbacks = computed(() => {
  let arr = all.value;
  // If questionId filter present, restrict to feedbacks for that QuestionsAnswersID
  if (questionIdFilter.value) {
    arr = arr.filter(fb => String(fb?.QuestionsAnswersID || '') === String(questionIdFilter.value));
  }
  
  // Apply type/status filter from AppleFilters
  const effectiveType = filters.value.status || 'all';
  if (effectiveType === 'like') {
    arr = arr.filter(fb => isLikeValue(fb?.FeedbackValue));
  } else if (effectiveType === 'unlike') {
    arr = arr.filter(fb => isUnlikeValue(fb?.FeedbackValue));
  } else if (effectiveType === 'pending') {
    arr = arr.filter(fb => isPendingValue(fb?.FeedbackValue));
  }
  
  // Apply date range filter
  if (filters.value.dateFrom) {
    const fromDate = new Date(filters.value.dateFrom);
    fromDate.setHours(0, 0, 0, 0);
    arr = arr.filter(fb => {
      if (!fb.Timestamp) return false;
      return new Date(fb.Timestamp) >= fromDate;
    });
  }
  if (filters.value.dateTo) {
    const toDate = new Date(filters.value.dateTo);
    toDate.setHours(23, 59, 59, 999);
    arr = arr.filter(fb => {
      if (!fb.Timestamp) return false;
      return new Date(fb.Timestamp) <= toDate;
    });
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

watch(filters, () => { currentPage.value = 1; }, { deep: true });

// Chart total - used to hide charts when no data
const chartTotal = computed(() => {
  const arr = Array.isArray(props.feedbacks) ? props.feedbacks : [];
  return arr.length;
});

// pagination
const currentPage = ref(1);
const itemsPerPage = ref(5);
const totalEntries = computed(() => filteredFeedbacks.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(totalEntries.value / itemsPerPage.value)));
const startIndex = computed(() => totalEntries.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1);
const endIndex = computed(() => totalEntries.value === 0 ? 0 : Math.min(currentPage.value * itemsPerPage.value, totalEntries.value));

// Sort feedbacks based on AppleFilters settings
const sortedFeedbacks = computed(() => {
  const arr = filteredFeedbacks.value.slice();
  const { sortBy, sortOrder } = filters.value;
  const order = sortOrder === 'asc' ? 1 : -1;
  
  return arr.sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'date') {
      const aTime = a?.Timestamp ? new Date(a.Timestamp).getTime() : 0;
      const bTime = b?.Timestamp ? new Date(b.Timestamp).getTime() : 0;
      comparison = aTime - bTime;
    } else if (sortBy === 'id') {
      comparison = (a?.FeedbackID || 0) - (b?.FeedbackID || 0);
    } else if (sortBy === 'type') {
      const aUnlike = isUnlikeValue(a?.FeedbackValue) ? 1 : 0;
      const bUnlike = isUnlikeValue(b?.FeedbackValue) ? 1 : 0;
      comparison = aUnlike - bUnlike;
    }
    
    return comparison * order;
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

// Drawer (sidebar) state
const showDrawer = ref(false);
const drawerFeedback = ref(null);

function openDrawer(fb) {
  drawerFeedback.value = fb;
  showDrawer.value = true;
}

function closeDrawer() {
  showDrawer.value = false;
  setTimeout(() => {
    drawerFeedback.value = null;
  }, 300);
}

function formatFullTimestamp(timestamp) {
  if (!timestamp) return '-';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return timestamp;
  return d.toLocaleString('th-TH', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function openInlineEditFromDrawer() {
  if (drawerFeedback.value) {
    closeDrawer();
    openInlineEdit(drawerFeedback.value);
  }
}

async function handleFeedbackFromDrawer() {
  if (drawerFeedback.value) {
    closeDrawer();
    await handleFeedback(drawerFeedback.value);
  }
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
const pendingCount = computed(() => {
  return filteredFeedbacks.value.reduce((acc, fb) => {
    const v = (fb?.FeedbackValue ?? '').toString().toLowerCase().trim();
    if (v === '2' || v === 'pending') return acc + 1;
    return acc;
  }, 0);
});

// Added: Pie chart data (green for like, red for unlike, orange for pending)
const pieData = computed(() => ({
  labels: ['Unlike', 'Like', 'Pending'],
  datasets: [{
    data: [unlikeCount.value, likeCount.value, pendingCount.value],
    backgroundColor: ['#FF3B30', '#34C759', '#FF9500'],
    borderWidth: 0
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

// Added: line chart data (counts per date for like/unlike/pending)
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
  const pendingSeries = labels.map(lbl =>
    filteredFeedbacks.value.filter(fb => {
      const ts = fb?.Timestamp;
      const d = ts ? (isNaN(new Date(ts).getTime()) ? String(ts).split('T')[0] : new Date(ts).toISOString().slice(0,10)) : 'Unknown';
      const v = (fb?.FeedbackValue ?? '').toString().toLowerCase().trim();
      return d === lbl && (v === '2' || v === 'pending');
    }).length
  );
  return {
    labels,
    datasets: [
      { label: 'Unlike', data: unlikeSeries, borderColor: '#FF3B30', backgroundColor: 'rgba(255,59,48,0.15)', fill: true, tension: 0.35 },
      { label: 'Like', data: likeSeries, borderColor: '#34C759', backgroundColor: 'rgba(52,199,89,0.15)', fill: true, tension: 0.35 },
      { label: 'Pending', data: pendingSeries, borderColor: '#FF9500', backgroundColor: 'rgba(255,149,0,0.15)', fill: true, tension: 0.35 }
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
let chartsInitializing = false;

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
  if (chartsInitializing) return; // Prevent concurrent calls
  chartsInitializing = true;

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
    chartsInitializing = false;
  });
}

onMounted(() => {
  // Initialize charts after data is loaded
  initCharts();
  
  // Connect WebSocket for real-time updates
  connectWebSocket();
});

// Watch for data changes and reinitialize charts
watch([pieData, lineData], () => {
  initCharts();
}, { deep: true });

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

// จัดเรียงหมวดหมู่สำหรับ Dropdown (แยก Main/Sub และกำหนด isMain)
const sortedInlineCategories = computed(() => {
  const raw = inlineCategories.value || [];
  const result = [];
  
  // 1. หาหมวดหมู่หลัก (ไม่มีขีด -)
  const mains = raw.filter(c => !String(c.CategoriesID).includes('-'))
    .sort((a, b) => String(a.CategoriesID).localeCompare(String(b.CategoriesID), undefined, { numeric: true }));

  for (const m of mains) {
    // เพิ่มแม่ (isMain = true)
    result.push({ ...m, isMain: true });
    
    // 2. หาหมวดหมู่ลูกของแม่นี้ (ขึ้นต้นด้วย "แม่-")
    const pId = String(m.CategoriesID);
    const subs = raw.filter(c => {
      const cId = String(c.CategoriesID);
      return cId !== pId && cId.startsWith(pId + '-');
    }).sort((a, b) => String(a.CategoriesID).localeCompare(String(b.CategoriesID), undefined, { numeric: true }));
    
    // เพิ่มลูก (isMain = false)
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
  const qaList = Array.isArray(resp.data) ? resp.data : (resp.data?.data || []);
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
  // Prevent handling feedback that is not of the expected type (server expects FeedbackValue === 0)
  if (fb.FeedbackValue != null && Number(fb.FeedbackValue) !== 0) {
    const msg = 'Feedback cannot be marked as handled (already handled or unsupported feedback type).';
    console.warn('handleFeedback prevented for unsupported FeedbackValue:', fb.FeedbackValue, fb);
    showErrorToast(msg);
    await openAlert({ message: msg, type: 'error' });
    return;
  }
  const ok = await openConfirm({ message: 'ยืนยันย้าย Feedback นี้ไปยังรายการที่จัดการแล้ว?' });
  if (!ok) return;
  deletingFeedbackId.value = fb.FeedbackID;
  try {
    console.log('🔧 handleFeedback called for:', fb);
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

/* Feedbacks table: force single-line rows + ellipsis */
.feedbacks-table {
  table-layout: fixed;
  width: 100%;
}

.feedbacks-table th,
.feedbacks-table td {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}

.cell-ellipsis {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* Column widths (will overflow horizontally on smaller screens via .table-responsive) */
.feedbacks-table th:nth-child(1),
.feedbacks-table td:nth-child(1) { width: 90px; }
.feedbacks-table th:nth-child(2),
.feedbacks-table td:nth-child(2) { width: 130px; }
.feedbacks-table th:nth-child(3),
.feedbacks-table td:nth-child(3) { width: 120px; }
.feedbacks-table th:nth-child(4),
.feedbacks-table td:nth-child(4) { width: 220px; }
.feedbacks-table th:nth-child(5),
.feedbacks-table td:nth-child(5) { width: 360px; }
.feedbacks-table th:nth-child(6),
.feedbacks-table td:nth-child(6) { width: 160px; }
.feedbacks-table th:nth-child(7),
.feedbacks-table td:nth-child(7) { width: 200px; }

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

/* ========== Apple-style Responsive Design ========== */

/* Tablet */
@media (max-width: 991px) {
  .chart-container {
    height: 220px;
  }
  
  .segmented-filter {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .segment-btn {
    font-size: 12px;
    padding: 5px 10px;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .card.p-4 {
    padding: 16px !important;
    border-radius: 16px;
  }
  
  /* Controls: Stack vertically */
  .d-flex.flex-wrap.justify-content-between {
    flex-direction: column;
    align-items: stretch !important;
    gap: 12px;
  }
  
  .segmented-filter {
    width: 100%;
    justify-content: center;
    order: 1;
  }
  
  .search-wrapper {
    width: 100% !important;
    max-width: 100% !important;
    margin-left: 0 !important;
    order: 2;
  }
  
  /* Charts: Stack vertically */
  .row.mb-4 .col-md-6 {
    margin-bottom: 16px;
  }
  
  .chart-container {
    height: 200px;
  }
  
  /* Table: Mobile card view */
  .table-responsive {
    overflow-x: visible;
  }
  
  .table {
    display: block;
  }
  
  .table thead {
    display: none;
  }
  
  .table tbody {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .table tbody tr {
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    border: 1px solid rgba(0,0,0,0.05);
    gap: 8px;
  }
  
  .table tbody tr.unlike-row {
    background: linear-gradient(135deg, rgba(255, 59, 48, 0.04) 0%, rgba(255, 255, 255, 1) 100%);
    border-left: 3px solid #FF3B30;
  }
  
  .table tbody td {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 6px 0;
    border: none;
    width: 100%;
  }
  
  .table tbody td::before {
    content: attr(data-label);
    font-weight: 600;
    font-size: 12px;
    color: #86868b;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    min-width: 100px;
    flex-shrink: 0;
  }
  
  /* Hide FeedbackID on mobile - use data attribute instead */
  .table tbody td:first-child {
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    border-radius: 8px;
    padding: 8px 12px;
    margin-bottom: 4px;
  }
  
  .table tbody td:last-child {
    justify-content: center;
    padding-top: 12px;
    border-top: 1px solid rgba(0,0,0,0.06);
    margin-top: 4px;
  }
  
  .table tbody td:last-child::before {
    display: none;
  }
  
  /* Comment modal */
  .comment-modal-content {
    max-width: 95%;
    margin: 0 auto;
    border-radius: 16px;
  }
  
  .comment-modal-content.wide {
    max-width: 95%;
  }
  
  .comment-cell {
    max-width: 100%;
  }
  
  .comment-preview {
    max-width: 100%;
  }
  
  .comment-preview-btn {
    width: 100%;
    justify-content: center;
  }
  
  /* Buttons */
  .handle-btn,
  .delete-btn {
    flex: 1;
    justify-content: center;
  }
  
  /* Pagination */
  .d-flex.justify-content-between.align-items-center.p-3 {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .pagination {
    justify-content: center;
  }
  
  .pagination .page-link {
    min-width: 32px;
    min-height: 32px;
    font-size: 0.9rem;
  }
  
  /* Alert modal */
  .alert-modal-content {
    width: 95%;
    max-width: 400px;
  }
}

/* Small Mobile */
@media (max-width: 480px) {
  .card.p-4 {
    padding: 12px !important;
    border-radius: 14px;
  }
  
  .card h3.fs-5 {
    font-size: 1rem !important;
  }
  
  .segmented-filter {
    padding: 3px;
    gap: 2px;
  }
  
  .segment-btn {
    font-size: 11px;
    padding: 4px 8px;
  }
  
  .segment-btn .badge {
    display: none;
  }
  
  .chart-container {
    height: 180px;
  }
  
  .table tbody tr {
    padding: 12px;
    border-radius: 14px;
  }
  
  .table tbody td {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .table tbody td::before {
    min-width: auto;
    margin-bottom: 2px;
  }
  
  .handle-btn,
  .delete-btn {
    font-size: 12px;
    padding: 6px 12px;
  }
  
  .reason-badge {
    font-size: 11px;
    padding: 3px 8px;
  }
  
  .comment-modal-header {
    padding: 16px;
  }
  
  .comment-modal-body {
    padding: 16px;
  }
  
  .comment-metadata {
    flex-direction: column;
    gap: 8px;
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

/* Clickable Row */
.clickable-row {
  cursor: pointer;
  transition: all 0.2s ease;
}
.clickable-row:hover {
  background-color: rgba(0, 113, 227, 0.06) !important;
  transform: none;
}

/* Drawer (Sidebar) Styles */
.apple-drawer {
  position: fixed;
  top: 0;
  right: -500px;
  width: 500px;
  max-width: 100vw;
  height: 100vh;
  background: white;
  box-shadow: -8px 0 32px rgba(0,0,0,0.15);
  z-index: 100001;
  transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
}
.apple-drawer.drawer-open {
  right: 0;
}
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 100000;
}
.drawer-header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  background: white;
}
.drawer-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: #1d1d1f;
}
.btn-close-drawer {
  border: none;
  background: rgba(0,0,0,0.05);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1d1d1f;
  transition: background 0.2s;
}
.btn-close-drawer:hover {
  background: rgba(0,0,0,0.1);
}
.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}
.drawer-section {
  margin-bottom: 24px;
}
.drawer-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #86868b;
  margin-bottom: 6px;
  letter-spacing: 0.05em;
}
.drawer-value {
  font-size: 1rem;
  color: #1d1d1f;
  line-height: 1.5;
}
.drawer-footer {
  padding: 20px 24px;
  border-top: 1px solid rgba(0,0,0,0.05);
  background: #F9F9FB;
}
.whitespace-prewrap {
  white-space: pre-wrap;
}
.comment-text-box {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  margin-top: 8px;
}

/* Search */
.search-container { position: relative; width: 240px; }
.search-input {
  width: 100%; padding: 8px 36px;
  border-radius: 10px; border: 1px solid rgba(0,0,0,0.1);
  background: rgba(118, 118, 128, 0.08);
  font-size: 0.9rem; transition: all 0.2s;
}
.search-input:focus { background: white; border-color: var(--apple-blue); outline: none; box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15); }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #86868b; }
.search-clear { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); border: none; background: none; color: #86868b; cursor: pointer; }

/* Apple buttons for drawer */
.btn-apple-primary {
  background: linear-gradient(135deg, #007AFF 0%, #0055DD 100%);
  color: white;
  padding: 10px 16px;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.2);
}
.btn-apple-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 122, 255, 0.3);
}
.btn-apple-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
.btn-apple-secondary {
  background: rgba(0,0,0,0.05);
  color: #1d1d1f;
  padding: 10px 16px;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn-apple-secondary:hover {
  background: rgba(0,0,0,0.1);
}
.btn-apple-secondary.text-danger {
  color: #FF3B30;
}
.btn-apple-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Apple Modal Styles */
.apple-modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(8px);
  z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px;
}
.apple-modal-content {
  background: rgba(255,255,255,0.98); backdrop-filter: blur(20px);
  border-radius: 18px; width: 100%; max-width: 600px;
  box-shadow: 0 24px 48px rgba(0,0,0,0.2); overflow: hidden; display: flex; flex-direction: column;
}
.apple-modal-content.wide-modal { max-width: 800px; }
.apple-modal-header { 
  padding: 20px 24px; border-bottom: 1px solid rgba(0,0,0,0.06); 
  display: flex; justify-content: space-between; align-items: center; background: white; 
}
.apple-modal-title { font-size: 1.25rem; font-weight: 700; color: #1d1d1f; margin: 0; }
.apple-modal-subtitle { font-size: 0.9rem; color: #86868b; }
.apple-close-btn { 
  width: 32px; height: 32px; border-radius: 50%; border: none; 
  background: rgba(0,0,0,0.05); color: #1d1d1f; 
  display: flex; align-items: center; justify-content: center; transition: all 0.2s; cursor: pointer;
}
.apple-close-btn:hover { background: rgba(0,0,0,0.1); transform: rotate(90deg); }
.apple-modal-body { padding: 24px; overflow-y: auto; max-height: 80vh; }

.apple-input-group { margin-bottom: 16px; }
.apple-input-group label { font-size: 0.85rem; font-weight: 600; color: #1d1d1f; margin-bottom: 6px; display: block; }
.apple-input {
  width: 100%; background: rgba(118, 118, 128, 0.12); border: none; border-radius: 10px; padding: 10px 14px; font-size: 1rem; color: #1d1d1f; transition: all 0.2s;
}
.apple-input:focus { outline: none; background: white; box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.15); }
.apple-textarea { resize: vertical; min-height: 100px; }

.keyword-input-wrapper { position: relative; display: flex; align-items: center; }
.apple-icon-btn-abs { 
  position: absolute; right: 6px; width: 32px; height: 32px; border-radius: 8px; 
  background: linear-gradient(135deg, #007AFF 0%, #0055DD 100%); 
  border: none; color: white; display: flex; align-items: center; justify-content: center; 
  box-shadow: 0 3px 8px rgba(0,113,227,0.3); cursor: pointer; transition: all 0.2s; z-index: 10;
}
.apple-icon-btn-abs i { color: white; font-size: 18px; font-weight: 700; }
.apple-icon-btn-abs:hover { background: linear-gradient(135deg, #0055DD 0%, #003AAA 100%); transform: scale(1.1); }

.select-wrapper { position: relative; }
.select-icon { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 0.8rem; color: #86868b; pointer-events: none; }
.select-wrapper select { appearance: none; padding-right: 36px; }

.keyword-tag {
  background: rgba(0,0,0,0.05); color: #1d1d1f; padding: 4px 10px;
  border-radius: 6px; font-size: 0.85rem; font-weight: 500;
}
.keyword-tag.removable { cursor: pointer; transition: background 0.2s; }
.keyword-tag.removable:hover { background: rgba(255, 59, 48, 0.1); color: #FF3B30; }

.apple-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }

.apple-spinner {
  width: 40px; height: 40px; border: 3px solid rgba(0, 113, 227, 0.2);
  border-top-color: #007AFF; border-radius: 50%; animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Apple Modal Transitions */
.apple-zoom-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.apple-zoom-leave-active { transition: all 0.2s ease; }
.apple-zoom-enter-from, .apple-zoom-leave-to { opacity: 0; transform: scale(0.95); }

/* Mobile responsive for drawer */
@media (max-width: 576px) {
  .apple-drawer {
    width: 100%;
    right: -100%;
  }
  .apple-modal-content { border-radius: 0; max-width: 100%; height: 100vh; max-height: 100vh; }
  .apple-modal-body { padding: 16px; }
}
</style>
