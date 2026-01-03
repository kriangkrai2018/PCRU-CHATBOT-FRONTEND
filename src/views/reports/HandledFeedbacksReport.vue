<template>
  <div class="handled-feedbacks-report">
    <!-- Header Section -->
    <div class="report-header mb-4">
      <div class="header-content">
        <div class="header-title-section">
          <div class="header-icon">
            <i class="bi bi-check-circle-fill"></i>
          </div>
          <div class="header-text">
            <h3 class="mb-1">รายงาน Feedback ที่จัดการแล้ว</h3>
            <p class="text-muted mb-0">Feedback ที่ถูกจัดการและจะลบอัตโนมัติหลัง 30 วัน</p>
          </div>
        </div>
        <div class="header-actions">
          <button 
            class="cleanup-btn" 
            @click="cleanupExpired"
            :disabled="isCleaningUp"
          >
            <span v-if="isCleaningUp" class="cleanup-loading">
              <i class="bi bi-arrow-repeat spinning"></i>
            </span>
            <span v-else>
              <i class="bi bi-trash3 me-2"></i>
              ลบที่หมดอายุ
            </span>
          </button>
          <button class="refresh-btn" @click="fetchHandledFeedbacks">
            <i class="bi bi-arrow-clockwise"></i>
            รีเฟรช
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-row mb-4">
      <div class="stat-card stat-total">
        <div class="stat-icon">
          <i class="bi bi-clipboard-check"></i>
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ totalHandled }}</span>
          <span class="stat-label">จัดการแล้วทั้งหมด</span>
        </div>
      </div>
      <div class="stat-card stat-expiring">
        <div class="stat-icon">
          <i class="bi bi-exclamation-triangle"></i>
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ expiringCount }}</span>
          <span class="stat-label">จะหมดอายุใน 7 วัน</span>
        </div>
      </div>
      <div class="stat-card stat-safe">
        <div class="stat-icon">
          <i class="bi bi-shield-check"></i>
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ safeCount }}</span>
          <span class="stat-label">เหลือมากกว่า 7 วัน</span>
        </div>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="search-section mb-3">
      <ReportSearch v-model="searchQuery" placeholder="ค้นหา feedback..." :maxWidth="'380px'" align="right" />
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <p class="loading-text">กำลังโหลดข้อมูล...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">
        <i class="bi bi-exclamation-circle"></i>
      </div>
      <p class="error-text">{{ error }}</p>
      <button class="retry-btn" @click="fetchHandledFeedbacks">
        <i class="bi bi-arrow-clockwise me-2"></i>
        ลองใหม่
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredFeedbacks.length === 0" class="empty-container">
      <div class="empty-icon">
        <i class="bi bi-inbox"></i>
      </div>
      <h5 class="empty-title">ไม่มี Feedback ที่จัดการแล้ว</h5>
      <p class="empty-text">Feedback ที่ถูกจัดการจะปรากฏที่นี่</p>
    </div>

    <!-- Table -->
    <div v-else class="table-container card">
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>คำถาม</th>
              <th>ข้อความผู้ใช้</th>
              <th>เหตุผล</th>
              <th>ความคิดเห็น</th>
              <th>จัดการเมื่อ</th>
              <th>เหลือเวลา</th>
              <th class="text-center">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            <transition-group name="list">
              <tr 
                v-for="fb in paginatedFeedbacks" 
                :key="fb.FeedbackID"
                :class="getRowClass(fb.DaysUntilDelete)"
              >
                <td>
                  <span class="feedback-id">#{{ fb.FeedbackID }}</span>
                </td>
                <td>
                  <span class="question-text">{{ truncate(fb.QuestionText, 40) || '-' }}</span>
                </td>
                <td>
                  <span class="user-query">{{ truncate(fb.UserQuery, 40) || '-' }}</span>
                </td>
                <td>
                  <span v-if="fb.FeedbackReason" class="reason-badge" :class="getReasonClass(fb.FeedbackReason)">
                    {{ formatReason(fb.FeedbackReason) }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <div v-if="fb.FeedbackComment" class="comment-cell">
                    <button class="comment-preview-btn" @click="showComment(fb)">
                      <i class="bi bi-chat-square-text me-1"></i>
                      {{ truncate(fb.FeedbackComment, 25) }}
                    </button>
                  </div>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <span class="handled-date">{{ formatDate(fb.HandledAt) }}</span>
                </td>
                <td>
                  <div class="countdown-cell" :class="getCountdownClass(fb.DaysUntilDelete)">
                    <div class="countdown-progress">
                      <div 
                        class="countdown-bar" 
                        :style="{ width: getProgressWidth(fb.DaysUntilDelete) }"
                      ></div>
                    </div>
                    <span class="countdown-text">{{ fb.DaysUntilDelete }} วัน</span>
                  </div>
                </td>
                <td class="text-center">
                  <div class="action-buttons">
                    <button 
                      v-if="fb.QuestionsAnswersID"
                      class="edit-keyword-btn" 
                      @click="openKeywordModal(fb)" 
                      :disabled="editingKeywordId === fb.FeedbackID"
                      title="แก้ไข Keywords"
                    >
                      <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="restore-btn" @click="restoreFeedback(fb)" :disabled="restoringId === fb.FeedbackID">
                      <span v-if="restoringId === fb.FeedbackID" class="spinner-border spinner-border-sm me-1"></span>
                      กู้คืน
                    </button>
                  </div>
                </td>
              </tr>
            </transition-group>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination-section">
        <div class="pagination-info">
          แสดง {{ startIndex }} - {{ endIndex }} จาก {{ totalItems }} รายการ
        </div>
        <nav aria-label="Pagination">
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="goToPage(1)">&laquo;</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="goToPage(currentPage - 1)">&lsaquo;</a>
            </li>
            <li 
              v-for="page in visiblePages" 
              :key="page" 
              class="page-item" 
              :class="{ active: currentPage === page }"
            >
              <a class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="goToPage(currentPage + 1)">&rsaquo;</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="goToPage(totalPages)">&raquo;</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Comment Modal -->
    <transition name="modal-fade">
      <div v-if="showCommentModal" class="modal-overlay" @click.self="closeCommentModal">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-chat-square-text me-2"></i>
              ความคิดเห็น
            </h5>
            <button class="modal-close" @click="closeCommentModal">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="comment-meta">
              <div class="meta-item">
                <span class="meta-label">ID:</span>
                <span class="meta-value">#{{ selectedFeedback?.FeedbackID }}</span>
              </div>
              <div v-if="selectedFeedback?.FeedbackReason" class="meta-item">
                <span class="meta-label">เหตุผล:</span>
                <span class="reason-badge" :class="getReasonClass(selectedFeedback.FeedbackReason)">
                  {{ formatReason(selectedFeedback.FeedbackReason) }}
                </span>
              </div>
            </div>
            <div class="comment-content">
              <p>{{ selectedFeedback?.FeedbackComment }}</p>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Edit Keywords Modal (Apple Style) -->
    <transition name="modal-fade">
      <div v-if="showKeywordModal" class="modal-overlay keyword-modal-overlay" @click.self="closeKeywordModal">
        <div class="modal-content keyword-modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-pencil-square me-2"></i>
              แก้ไขคำถาม-คำตอบ
            </h5>
            <button class="modal-close" @click="closeKeywordModal">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="modal-body">
            <div v-if="keywordModalLoading" class="loading-content">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2 text-muted">กำลังโหลดข้อมูล...</p>
            </div>
            <div v-else>
              <!-- Question Info -->
              <div class="qa-info-card mb-3">
                <div class="info-item">
                  <span class="info-label">คำถาม:</span>
                  <span class="info-value">{{ keywordForm.questionText || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">User Query:</span>
                  <span class="info-value text-muted">{{ selectedKeywordFeedback?.UserQuery || '-' }}</span>
                </div>
              </div>

              <!-- Question Title -->
              <div class="form-group mb-3">
                <label class="form-label fw-semibold">Question Title</label>
                <input type="text" class="form-control apple-input" v-model="keywordForm.questionTitle" />
              </div>

              <!-- Question Text -->
              <div class="form-group mb-3">
                <label class="form-label fw-semibold">Question Text</label>
                <textarea class="form-control apple-input" rows="3" v-model="keywordForm.questionText"></textarea>
              </div>

              <!-- Category -->
              <div class="form-group mb-3">
                <label class="form-label fw-semibold">Category</label>
                <select class="form-select apple-select" v-model="keywordForm.categoriesId">
                  <option value="">-- เลือกหมวดหมู่ --</option>
                  <option v-for="cat in categories" :key="cat.CategoriesID" :value="cat.CategoriesID">
                    {{ cat.CategoriesName || cat.CategoriesID }}
                  </option>
                </select>
              </div>

              <!-- Keywords -->
              <div class="form-group mb-3">
                <label class="form-label fw-semibold">Keywords (คั่นด้วย , )</label>
                <input 
                  type="text" 
                  class="form-control apple-input" 
                  v-model="keywordInput" 
                  @keyup.enter.prevent="addKeyword"
                  placeholder="พิมพ์ keyword แล้วกด Enter" 
                />
                <div class="keywords-tags mt-2">
                  <span 
                    v-for="(kw, idx) in keywordForm.keywords" 
                    :key="kw + idx" 
                    class="keyword-tag"
                  >
                    {{ kw }}
                    <button type="button" class="tag-remove" @click="removeKeyword(idx)">
                      <i class="bi bi-x"></i>
                    </button>
                  </span>
                  <span v-if="keywordForm.keywords.length === 0" class="text-muted small">ยังไม่มี keyword</span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeKeywordModal" :disabled="savingKeyword">
              ยกเลิก
            </button>
            <button class="btn-save" @click="saveKeywords" :disabled="savingKeyword || keywordModalLoading">
              <span v-if="savingKeyword" class="spinner-border spinner-border-sm me-2"></span>
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { axiosInstance } from '@/plugins/axios';
import { useAppleToast } from '@/composables/useAppleToast';
import ReportSearch from '@/components/ReportSearch.vue';

const $axios = axiosInstance;
const { success: showSuccessToast, error: showErrorToast, info: showInfoToast } = useAppleToast();

// State
const handledFeedbacks = ref([]);
const isLoading = ref(true);
const error = ref(null);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 5;
const isCleaningUp = ref(false);
const restoringId = ref(null);

// Comment Modal
const showCommentModal = ref(false);
const selectedFeedback = ref(null);

// Keyword Modal State
const showKeywordModal = ref(false);
const selectedKeywordFeedback = ref(null);
const keywordModalLoading = ref(false);
const savingKeyword = ref(false);
const editingKeywordId = ref(null);
const categories = ref([]);
const keywordInput = ref('');
const keywordForm = ref({
  questionTitle: '',
  questionText: '',
  categoriesId: '',
  keywords: []
});

// Reason labels
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

// Computed
const filteredFeedbacks = computed(() => {
  if (!searchQuery.value.trim()) return handledFeedbacks.value;
  
  const q = searchQuery.value.toLowerCase();
  return handledFeedbacks.value.filter(fb =>
    String(fb.FeedbackID).includes(q) ||
    (fb.QuestionText && fb.QuestionText.toLowerCase().includes(q)) ||
    (fb.UserQuery && fb.UserQuery.toLowerCase().includes(q)) ||
    (fb.FeedbackReason && fb.FeedbackReason.toLowerCase().includes(q)) ||
    (fb.FeedbackComment && fb.FeedbackComment.toLowerCase().includes(q))
  );
});

const totalItems = computed(() => filteredFeedbacks.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage)));
const startIndex = computed(() => totalItems.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage + 1);
const endIndex = computed(() => Math.min(currentPage.value * itemsPerPage, totalItems.value));

const paginatedFeedbacks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredFeedbacks.value.slice(start, start + itemsPerPage);
});

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const maxButtons = 5;
  
  if (total <= maxButtons) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, 5];
  if (current >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total];
  return [current - 2, current - 1, current, current + 1, current + 2];
});

// Stats
const totalHandled = computed(() => handledFeedbacks.value.length);
const expiringCount = computed(() => handledFeedbacks.value.filter(fb => fb.DaysUntilDelete <= 7).length);
const safeCount = computed(() => handledFeedbacks.value.filter(fb => fb.DaysUntilDelete > 7).length);

// Methods
async function fetchHandledFeedbacks() {
  isLoading.value = true;
  error.value = null;
  
  try {
    const response = await $axios.get('/feedbacks/handled');
    handledFeedbacks.value = response.data;
  } catch (err) {
    console.error('Failed to fetch handled feedbacks:', err);
    error.value = 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง';
  } finally {
    isLoading.value = false;
  }
}

async function cleanupExpired() {
  isCleaningUp.value = true;
  
  try {
    const response = await $axios.delete('/feedbacks/cleanup-handled');
    const deleted = response.data?.deletedCount || 0;
    
    if (deleted > 0) {
      showSuccessToast(`ลบ Feedback ที่หมดอายุแล้ว ${deleted} รายการ`);
      fetchHandledFeedbacks();
    } else {
      showInfoToast('ไม่มี Feedback ที่หมดอายุ');
    }
  } catch (err) {
    console.error('Failed to cleanup feedbacks:', err);
    showErrorToast('เกิดข้อผิดพลาดในการลบ');
  } finally {
    isCleaningUp.value = false;
  }
}

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}

function truncate(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

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

function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getRowClass(daysUntilDelete) {
  if (daysUntilDelete <= 3) return 'row-critical';
  if (daysUntilDelete <= 7) return 'row-warning';
  return '';
}

function getCountdownClass(days) {
  if (days <= 3) return 'countdown-critical';
  if (days <= 7) return 'countdown-warning';
  if (days <= 14) return 'countdown-moderate';
  return 'countdown-safe';
}

function getProgressWidth(days) {
  const percentage = Math.min(100, (days / 30) * 100);
  return `${percentage}%`;
}

function showComment(feedback) {
  selectedFeedback.value = feedback;
  showCommentModal.value = true;
}

function closeCommentModal() {
  showCommentModal.value = false;
  setTimeout(() => {
    selectedFeedback.value = null;
  }, 300);
}

async function restoreFeedback(fb) {
  if (!fb?.FeedbackID) return;
  restoringId.value = fb.FeedbackID;
  try {
    await $axios.put(`/feedbacks/${fb.FeedbackID}/unhandle`);
    await fetchHandledFeedbacks();
    showSuccessToast('กู้คืน Feedback กลับไปยังรายการที่ยังไม่จัดการแล้ว');
  } catch (err) {
    console.error('Failed to restore feedback:', err);
    showErrorToast('กู้คืนไม่สำเร็จ');
  } finally {
    restoringId.value = null;
  }
}

// Keyword Modal Functions
async function fetchCategories() {
  try {
    const response = await $axios.get('/categories');
    categories.value = response.data;
  } catch (err) {
    console.error('Failed to fetch categories:', err);
  }
}

async function openKeywordModal(fb) {
  selectedKeywordFeedback.value = fb;
  showKeywordModal.value = true;
  keywordModalLoading.value = true;
  
  try {
    // Load QA data if feedback has QuestionsAnswersID
    if (fb.QuestionsAnswersID) {
      const response = await $axios.get(`/questions-answers/${fb.QuestionsAnswersID}`);
      const qa = response.data;
      
      keywordForm.value = {
        questionTitle: qa.QuestionTitle || '',
        questionText: qa.QuestionText || '',
        categoriesId: qa.CategoriesID || '',
        keywords: qa.Keywords ? qa.Keywords.split(',').map(k => k.trim()).filter(k => k) : []
      };
      editingKeywordId.value = fb.QuestionsAnswersID;
    } else {
      // New QA from feedback
      keywordForm.value = {
        questionTitle: fb.UserQuery || '',
        questionText: fb.UserQuery || '',
        categoriesId: '',
        keywords: []
      };
      editingKeywordId.value = null;
    }
  } catch (err) {
    console.error('Failed to load QA data:', err);
    // Fallback to feedback data
    keywordForm.value = {
      questionTitle: fb.UserQuery || '',
      questionText: fb.UserQuery || '',
      categoriesId: '',
      keywords: []
    };
    editingKeywordId.value = null;
  } finally {
    keywordModalLoading.value = false;
  }
}

function closeKeywordModal() {
  showKeywordModal.value = false;
  setTimeout(() => {
    selectedKeywordFeedback.value = null;
    keywordForm.value = {
      questionTitle: '',
      questionText: '',
      categoriesId: '',
      keywords: []
    };
    keywordInput.value = '';
    editingKeywordId.value = null;
  }, 300);
}

function addKeyword() {
  const kw = keywordInput.value.trim();
  if (kw && !keywordForm.value.keywords.includes(kw)) {
    keywordForm.value.keywords.push(kw);
    keywordInput.value = '';
  }
}

function removeKeyword(index) {
  keywordForm.value.keywords.splice(index, 1);
}

async function saveKeywords() {
  if (!keywordForm.value.categoriesId) {
    showErrorToast('กรุณาเลือกหมวดหมู่');
    return;
  }
  if (keywordForm.value.keywords.length === 0) {
    showErrorToast('กรุณาเพิ่มอย่างน้อย 1 keyword');
    return;
  }
  
  savingKeyword.value = true;
  
  try {
    const payload = {
      QuestionTitle: keywordForm.value.questionTitle,
      QuestionText: keywordForm.value.questionText,
      CategoriesID: keywordForm.value.categoriesId,
      Keywords: keywordForm.value.keywords.join(',')
    };
    
    if (editingKeywordId.value) {
      // Update existing QA
      await $axios.put(`/questions-answers/${editingKeywordId.value}`, payload);
      showSuccessToast('อัปเดต Keywords สำเร็จ');
    } else {
      // Create new QA
      await $axios.post('/questions-answers', payload);
      showSuccessToast('เพิ่ม Keywords สำเร็จ');
    }
    
    closeKeywordModal();
    await fetchHandledFeedbacks();
  } catch (err) {
    console.error('Failed to save keywords:', err);
    showErrorToast('บันทึกไม่สำเร็จ');
  } finally {
    savingKeyword.value = false;
  }
}

// Lifecycle
onMounted(() => {
  fetchHandledFeedbacks();
  fetchCategories();
});
</script>

<style scoped>
.handled-feedbacks-report {
  padding: 1rem;
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
}

/* Header */
.report-header {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  border-radius: 16px;
  padding: 24px;
  color: white;
  box-shadow: 0 8px 32px rgba(40, 167, 69, 0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.header-title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.header-text h3 {
  font-size: 20px;
  font-weight: 700;
}

.header-text p {
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.cleanup-btn,
.refresh-btn {
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  align-items: center;
  gap: 8px;
}

.cleanup-btn {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  backdrop-filter: blur(10px);
}

.cleanup-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.refresh-btn {
  background: white;
  color: #28a745;
}

.refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Stats */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: white;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.stat-total .stat-icon {
  background: linear-gradient(135deg, #007AFF 0%, #0051D4 100%);
  color: white;
}

.stat-expiring .stat-icon {
  background: linear-gradient(135deg, #FF9500 0%, #FF6B00 100%);
  color: white;
}

.stat-safe .stat-icon {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
}

.stat-label {
  font-size: 13px;
  color: #6c757d;
}

/* Search (Apple style) */
.search-section {
  max-width: 100%;
  width: 100%;
  display: flex;
  justify-content: flex-end; /* align the search to the right */
  padding-right: 0; /* make sure it's not inset */
}

/* Pin the search pill to the right edge and give it a fixed max width */
.report-search {
  width: 380px; /* fixed width to ensure flush alignment */
  max-width: 42%;
  margin-left: auto;
}

/* Ensure the internal apple-search aligns to right properly */
.apple-search-inner.align-right {
  margin-left: 0 !important;
  margin-right: 0;
}

/* For very wide screens, keep search compact */
@media (min-width: 1200px) {
  .report-search { width: 420px; }
}
@media (max-width: 600px) {
  .report-search { width: 100%; max-width: 100%; }
}

.apple-search {
  width: 100%;
}

.apple-search-inner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  background: linear-gradient(180deg, #ffffff, #fbfdff);
  box-shadow: 0 6px 20px rgba(14,20,30,0.06);
  border: 1px solid rgba(14,20,30,0.06);
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.apple-search-inner:focus-within {
  transform: translateY(-2px);
  box-shadow: 0 12px 36px rgba(14,20,30,0.10);
}

.search-icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f1f3f5;
  color: #6c757d;
  font-size: 16px;
  flex: 0 0 36px;
}

.apple-search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 15px;
  color: #0b1220;
  padding: 6px 0;
  width: 100%;
}

.apple-search-input::placeholder {
  color: #9aa0a6;
}

.search-clear-btn {
  all: unset;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: rgba(11,18,32,0.04);
  color: #6c757d;
  cursor: pointer;
  flex: 0 0 34px;
  transition: background 120ms ease, transform 120ms ease;
}

.search-clear-btn:hover {
  background: rgba(11,18,32,0.08);
  transform: translateY(-2px);
}

.search-clear-btn:active {
  transform: translateY(0);
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.loading-spinner {
  position: relative;
  width: 50px;
  height: 50px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-ring:nth-child(1) {
  border-top-color: #007AFF;
  animation-delay: -0.45s;
}

.spinner-ring:nth-child(2) {
  border-right-color: #007AFF;
  animation-delay: -0.3s;
}

.spinner-ring:nth-child(3) {
  border-bottom-color: #007AFF;
  animation-delay: -0.15s;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 16px;
  color: #6c757d;
  font-size: 14px;
}

/* Error */
.error-container {
  text-align: center;
  padding: 60px;
}

.error-icon {
  font-size: 48px;
  color: #dc3545;
  margin-bottom: 16px;
}

.error-text {
  color: #6c757d;
  margin-bottom: 16px;
}

.retry-btn {
  padding: 10px 24px;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #0056b3;
  transform: translateY(-2px);
}

/* Empty */
.empty-container {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  color: #dee2e6;
  margin-bottom: 16px;
}

.empty-title {
  color: #495057;
  font-weight: 600;
}

.empty-text {
  color: #6c757d;
}

/* Table */
.table-container {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
}

.table {
  margin-bottom: 0;
}

.table thead th {
  background: #f8f9fa;
  border-bottom: 2px solid #e9ecef;
  font-weight: 600;
  font-size: 13px;
  color: #495057;
  padding: 14px 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table tbody td {
  padding: 14px 12px;
  vertical-align: middle;
  font-size: 14px;
  border-bottom: 1px solid #f1f3f5;
}

.table tbody tr {
  transition: all 0.2s ease;
}

.table tbody tr:hover {
  background: #f8f9fa;
}

.row-warning {
  background: rgba(255, 149, 0, 0.05) !important;
}

.row-critical {
  background: rgba(255, 59, 48, 0.05) !important;
  animation: pulse-row 2s ease-in-out infinite;
}

@keyframes pulse-row {
  0%, 100% { background: rgba(255, 59, 48, 0.05); }
  50% { background: rgba(255, 59, 48, 0.1); }
}

.feedback-id {
  font-weight: 600;
  color: #007AFF;
  font-size: 13px;
}

.question-text,
.user-query {
  color: #495057;
  font-size: 13px;
}

.handled-date {
  font-size: 12px;
  color: #6c757d;
}

/* Countdown */
.countdown-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 80px;
}

.countdown-progress {
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.countdown-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.countdown-safe .countdown-bar {
  background: linear-gradient(90deg, #28a745, #20c997);
}

.countdown-moderate .countdown-bar {
  background: linear-gradient(90deg, #ffc107, #ffca2c);
}

.countdown-warning .countdown-bar {
  background: linear-gradient(90deg, #FF9500, #FF6B00);
}

.countdown-critical .countdown-bar {
  background: linear-gradient(90deg, #FF3B30, #FF453A);
  animation: pulse-bar 1s ease-in-out infinite;
}

@keyframes pulse-bar {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.countdown-text {
  font-size: 12px;
  font-weight: 600;
}

.countdown-safe .countdown-text { color: #28a745; }
.countdown-moderate .countdown-text { color: #ffc107; }
.countdown-warning .countdown-text { color: #FF9500; }
.countdown-critical .countdown-text { color: #FF3B30; }

/* Reason Badge */
.reason-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.reason-wrong { background: rgba(220, 53, 69, 0.1); color: #dc3545; }
.reason-incomplete { background: rgba(255, 193, 7, 0.15); color: #a67c00; }
.reason-outdated { background: rgba(108, 117, 125, 0.1); color: #6c757d; }
.reason-irrelevant { background: rgba(0, 123, 255, 0.1); color: #007bff; }
.reason-confusing { background: rgba(111, 66, 193, 0.1); color: #6f42c1; }
.reason-other { background: rgba(23, 162, 184, 0.1); color: #17a2b8; }
.reason-default { background: rgba(108, 117, 125, 0.1); color: #6c757d; }

/* Comment Cell */
.comment-cell {
  max-width: 180px;
}

.comment-preview-btn {
  background: rgba(0, 122, 255, 0.08);
  border: none;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  color: #007AFF;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.comment-preview-btn:hover {
  background: rgba(0, 122, 255, 0.15);
}

/* Pagination */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.pagination-info {
  font-size: 13px;
  color: #6c757d;
}

.pagination .page-link {
  border: none;
  color: #495057;
  padding: 8px 12px;
  border-radius: 8px;
  margin: 0 2px;
  transition: all 0.2s ease;
}

.pagination .page-link:hover {
  background: #e9ecef;
}

.pagination .page-item.active .page-link {
  background: #007AFF;
  color: white;
}

.restore-btn {
  padding: 8px 14px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #0abf53, #0a9e4a);
  color: white;
  font-weight: 600;
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(10, 191, 83, 0.25);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.restore-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(10, 191, 83, 0.35);
}

.restore-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* List Transition */
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Modal */
.modal-overlay {
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

.modal-content {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #007AFF 0%, #0051D4 100%);
  color: white;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.modal-close {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: background 0.2s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.25);
}

.modal-body {
  padding: 24px;
}

.comment-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-label {
  font-size: 13px;
  color: #6c757d;
}

.meta-value {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.comment-content {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
}

.comment-content p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #495057;
  white-space: pre-wrap;
}

/* Modal Animation */
.modal-fade-enter-active {
  animation: fadeIn 0.3s ease;
}

.modal-fade-leave-active {
  animation: fadeOut 0.2s ease;
}

.modal-fade-enter-active .modal-content {
  animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.modal-fade-leave-active .modal-content {
  animation: slideDown 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes slideUp {
  from { transform: translateY(40px) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

@keyframes slideDown {
  from { transform: translateY(0) scale(1); opacity: 1; }
  to { transform: translateY(20px) scale(0.98); opacity: 0; }
}

.spinning {
  animation: spin 0.8s linear infinite;
}

/* Edit Keyword Button */
.edit-keyword-btn {
  padding: 6px 12px;
  background: linear-gradient(180deg, #007AFF 0%, #0051D4 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.edit-keyword-btn:hover {
  background: linear-gradient(180deg, #0066E6 0%, #0044B8 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.35);
}

.edit-keyword-btn:active {
  transform: translateY(0);
}

/* Keyword Modal */
.keyword-modal-overlay {
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
  z-index: 1050;
  padding: 20px;
}

.keyword-modal-content {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);
}

.keyword-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #007AFF 0%, #0051D4 100%);
  color: white;
}

.keyword-modal-header h4 {
  font-size: 17px;
  font-weight: 600;
  margin: 0;
}

.keyword-modal-body {
  padding: 24px;
  max-height: calc(90vh - 160px);
  overflow-y: auto;
}

.qa-info-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border: 1px solid #e9ecef;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 20px;
}

.info-item {
  margin-bottom: 12px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  color: #1d1d1f;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.apple-input,
.apple-select {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #d1d5db;
  border-radius: 12px;
  font-size: 15px;
  color: #1d1d1f;
  background: #ffffff;
  transition: all 0.2s ease;
  -webkit-appearance: none;
  appearance: none;
}

.apple-input:focus,
.apple-select:focus {
  outline: none;
  border-color: #007AFF;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
}

.apple-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236c757d' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 40px;
}

.keyword-input-group {
  display: flex;
  gap: 10px;
}

.keyword-input-group .apple-input {
  flex: 1;
}

.add-keyword-btn {
  padding: 12px 18px;
  background: linear-gradient(180deg, #34C759 0%, #28A745 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.add-keyword-btn:hover {
  background: linear-gradient(180deg, #2DB84D 0%, #229A3B 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 199, 89, 0.35);
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  min-height: 40px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px dashed #d1d5db;
}

.keyword-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(180deg, #007AFF 0%, #0051D4 100%);
  color: white;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  animation: tagAppear 0.2s ease;
}

@keyframes tagAppear {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.tag-remove {
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: background 0.2s ease;
}

.tag-remove:hover {
  background: rgba(255, 255, 255, 0.35);
}

.empty-keywords {
  color: #adb5bd;
  font-size: 13px;
  font-style: italic;
}

.keyword-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.btn-cancel {
  padding: 10px 20px;
  background: #ffffff;
  color: #1d1d1f;
  border: 1.5px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.btn-save {
  padding: 10px 24px;
  background: linear-gradient(180deg, #007AFF 0%, #0051D4 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-save:hover:not(:disabled) {
  background: linear-gradient(180deg, #0066E6 0%, #0044B8 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.35);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.loading-spinner-large {
  width: 48px;
  height: 48px;
  border: 3px solid #e9ecef;
  border-top-color: #007AFF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .header-title-section {
    flex-direction: column;
  }
  
  .stats-row {
    grid-template-columns: 1fr;
  }
  
  .pagination-section {
    flex-direction: column;
    gap: 12px;
  }
  
  .keyword-modal-content {
    max-width: 100%;
    margin: 10px;
  }
  
  .keyword-input-group {
    flex-direction: column;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 6px;
  }
}
</style>
