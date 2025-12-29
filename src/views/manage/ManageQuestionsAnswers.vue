<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <Sidebar :userType="userType" :userInfoObject="userInfoObject" />

    <!-- Main Content -->
    <main class="main-content">
      <div class="container-fluid pt-4 px-4">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-secondary">กำลังโหลดข้อมูลคำถาม-คำตอบ...</p>
        </div>

        <div v-else>
          <!-- Header Section -->
          <div class="d-block d-md-flex align-items-center justify-content-between mb-4">
            <div class="d-flex align-items-center gap-3">
              <h2 class="page-title m-0">จัดการคำถาม-คำตอบ</h2>
              <button class="btn-apple-primary" @click="openCrudModal" title="เพิ่มรายการใหม่">
                <i class="bi bi-plus-lg me-2"></i>
                <span>เพิ่มคำถาม</span>
              </button>
              <button class="btn-apple-icon" @click="openUploadModal" title="อัพโหลด CSV">
                <i class="bi bi-cloud-upload"></i>
              </button>
            </div>

            <!-- Search Bar -->
            <div class="search-container mt-3 mt-md-0">
              <i class="bi bi-search search-icon"></i>
              <input
                type="text"
                class="search-input"
                placeholder="ค้นหาคำถาม / คำตอบ / หัวข้อ..."
                v-model="searchQuery"
              />
              <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
                <i class="bi bi-x-circle-fill"></i>
              </button>
            </div>
          </div>

          <!-- Table Section -->
          <div class="bg-white shadow-apple rounded-4 overflow-hidden apple-card">
            <div class="table-responsive">
              <table class="table apple-table mb-0">
                <thead>
                  <tr>
                    <th class="ps-4">ID</th>
                    <th>หัวข้อคำถาม</th>
                    <th class="col-review-date text-center">วันหมดอายุ</th>
                    <th>คำตอบ</th>
                    <th>หมวดหมู่</th>
                    <th>Keywords</th>
                    <th class="text-center">👍 Like</th>
                    <th class="text-center">👎 Unlike</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in paginatedQuestions" :key="item.QuestionsAnswersID" class="align-middle apple-row" @click="openPreview(item)">
                    <td class="ps-4 fw-medium text-secondary">{{ item.QuestionsAnswersID }}</td>
                    <td class="py-3">
                      <div class="question-title-cell line-clamp-2" :title="item.QuestionTitle">{{ item.QuestionTitle }}</div>
                    </td>
                    <td class="py-3 review-date-cell text-center">
                      <div class="review-date-wrap">
                        <span 
                          :class="['badge-pill', getReviewDateBadgeClass(item.ReviewDate)]"
                          data-bs-toggle="tooltip" 
                          data-bs-placement="top" 
                          :title="formatFullDateTime(item.ReviewDate)"
                        >
                          {{ formatRelativeTime(item.ReviewDate) }}
                        </span>
                      </div>
                    </td>
                    <td class="py-3">
                      <div class="question-text-cell line-clamp-2 text-muted" :title="item.QuestionText">{{ item.QuestionText }}</div>
                    </td>
                    <td class="py-3">
                      <span
                        class="category-badge"
                        :style="{ backgroundColor: tagColors[(item.CategoriesID || 0) % tagColors.length] + '20', color: tagColors[(item.CategoriesID || 0) % tagColors.length] }"
                      >
                        {{ categoriesNameMapSafe[item.CategoriesID] || item.CategoriesID }}
                      </span>
                    </td>
                    <td class="py-3">
                      <div class="d-flex flex-wrap gap-1" v-if="item.keywords && item.keywords.length">
                        <span
                          v-for="(k, i) in item.keywords.slice(0, 3)"
                          :key="k.KeywordID || (k.KeywordText + i)"
                          class="keyword-tag"
                        >
                          {{ k.KeywordText }}
                        </span>
                        <span v-if="item.keywords.length > 3" class="keyword-tag-more">+{{ item.keywords.length - 3 }}</span>
                      </div>
                      <span v-else class="text-muted small">-</span>
                    </td>
                    <td class="py-3 text-center" @click.stop>
                      <div class="stat-pill like" :class="{ 'active': item.likeCount > 0 }" @click="goToFeedbacks(item.QuestionsAnswersID)">
                        <i class="bi bi-hand-thumbs-up-fill"></i>
                        <span>{{ item.likeCount || 0 }}</span>
                      </div>
                    </td>
                    <td class="py-3 text-center" @click.stop>
                      <div class="stat-pill unlike" :class="{ 'active': item.unlikeCount > 0 }" @click="goToFeedbacks(item.QuestionsAnswersID)">
                        <i class="bi bi-hand-thumbs-down-fill"></i>
                        <span>{{ item.unlikeCount || 0 }}</span>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="paginatedQuestions.length === 0">
                    <td colspan="8" class="text-center text-muted py-5">
                      <div class="empty-state">
                        <i class="bi bi-search"></i>
                        <p>ไม่พบข้อมูลคำถาม-คำตอบ</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div class="d-flex justify-content-between align-items-center p-3 border-top">
              <div class="small text-secondary">
                แสดง {{ startIndex }} ถึง {{ endIndex }} จาก {{ totalEntries }} รายการ
              </div>
              <nav aria-label="Page navigation">
                <ul class="pagination pagination-sm mb-0 align-items-center">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="firstPage">&laquo;</a>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="prevPage">&lsaquo;</a>
                  </li>
                  <li v-for="page in pagesToShow" :key="page" class="page-item" :class="{ active: currentPage === page }">
                    <a class="page-link page-num" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
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
    </main>

    <!-- Upload Modal -->
    <transition name="apple-zoom">
      <div v-if="showUploadModal" class="apple-modal-overlay" @click.self="closeUploadModal">
        <div class="apple-modal-content">
          <div class="apple-modal-header-bg"></div>
          <div class="apple-modal-header">
            <div class="d-flex flex-column">
              <h5 class="apple-modal-title">อัพโหลดไฟล์</h5>
              <span class="apple-modal-subtitle">Import CSV Data</span>
            </div>
            <button class="apple-close-btn" @click="closeUploadModal">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="apple-modal-body">
            <div 
              class="upload-drop-area-apple" 
              :class="{ 'has-file': uploadedFile }"
              @drop.prevent="onFileDrop"
              @dragover.prevent
              @click="$refs.fileInput.click()"
            >
              <div class="upload-icon-wrapper">
                <i class="bi bi-cloud-arrow-up-fill"></i>
              </div>
              <div class="upload-text">
                <span v-if="!uploadedFile">ลากไฟล์มาวางที่นี่ หรือ <strong>คลิกเลือกไฟล์</strong></span>
                <span v-else class="file-selected">
                  <i class="bi bi-file-earmark-spreadsheet-fill me-2 text-success"></i>{{ uploadedFile.name }}
                </span>
              </div>
              <div class="upload-hint">รองรับไฟล์ .csv เท่านั้น</div>
              <input ref="fileInput" type="file" accept=".csv" class="d-none" @change="onFileChange" />
            </div>

            <div class="d-flex justify-content-center gap-2 mt-4">
              <button class="btn-apple-secondary small" @click.stop="downloadTemplateFile" :disabled="isDownloadingTemplate">
                <i class="bi bi-file-earmark-arrow-down me-1"></i> Template
              </button>
              <button class="btn-apple-secondary small" @click.stop="openTemplateModal">
                <i class="bi bi-eye me-1"></i> ตัวอย่าง
              </button>
              <button class="btn-apple-secondary small" @click.stop="exportCurrentDataAsCsv" :disabled="isDownloadingFile">
                <i class="bi bi-download me-1"></i> Export CSV
              </button>
            </div>

            <div class="apple-actions mt-4">
              <button class="btn-apple-secondary" @click="closeUploadModal" :disabled="isUploading">ยกเลิก</button>
              <button class="btn-apple-primary" @click="saveUpload" :disabled="!uploadedFile || isUploading">
                <span v-if="isUploading" class="spinner-border spinner-border-sm me-2"></span>
                อัพโหลด
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Template Image Modal -->
    <transition name="apple-zoom">
      <div v-if="showTemplateModal" class="apple-modal-overlay" @click.self="closeTemplateModal">
        <div class="apple-modal-content wide-modal">
          <div class="apple-modal-header">
            <h5 class="apple-modal-title">ตัวอย่าง Template</h5>
            <button class="apple-close-btn" @click="closeTemplateModal"><i class="bi bi-x-lg"></i></button>
          </div>
          <div class="apple-modal-body p-0 d-flex justify-content-center bg-light">
             <img :src="ex5Url" alt="Template Example" class="img-fluid" style="max-height: 70vh;">
          </div>
        </div>
      </div>
    </transition>

    <!-- Preview Drawer -->
    <div class="drawer-overlay" v-if="showDrawer" @click="closeDrawer"></div>
    <div class="apple-drawer" :class="{ 'drawer-open': showDrawer }">
      <div class="drawer-header">
        <h5 class="drawer-title">รายละเอียด</h5>
        <button class="btn-close-drawer" @click="closeDrawer">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <div class="drawer-body">
        <div class="drawer-section">
          <div class="drawer-label">ID</div>
          <div class="drawer-value text-secondary">{{ previewItem?.QuestionsAnswersID || '-' }}</div>
        </div>
        <div class="drawer-section">
          <div class="drawer-label">หัวข้อคำถาม</div>
          <div class="drawer-value fw-bold text-dark">{{ previewItem?.QuestionTitle || '-' }}</div>
        </div>
        <div class="drawer-section">
          <div class="drawer-label">คำตอบ</div>
          <div class="drawer-value text-dark whitespace-prewrap">{{ previewItem?.QuestionText || '-' }}</div>
        </div>
        <div class="drawer-section">
          <div class="drawer-label">Keywords</div>
          <div class="d-flex flex-wrap gap-2 mt-2" v-if="previewItem?.keywords && previewItem.keywords.length">
            <span
              v-for="(k, i) in previewItem.keywords"
              :key="k.KeywordID || (k.KeywordText + i)"
              class="keyword-tag large"
            >
              {{ k.KeywordText }}
            </span>
          </div>
          <div class="text-muted" v-else>—</div>
        </div>
        <div class="drawer-section">
          <div class="drawer-label">หมวดหมู่</div>
          <div class="mt-2">
            <span class="category-badge large" 
              :style="{ backgroundColor: tagColors[(previewItem?.CategoriesID || 0) % tagColors.length] + '20', color: tagColors[(previewItem?.CategoriesID || 0) % tagColors.length] }">
              {{ categoriesNameMapSafe[previewItem?.CategoriesID] || previewItem?.CategoriesID || '-' }}
            </span>
          </div>
        </div>
        <div class="drawer-section">
          <div class="drawer-label">วันหมดอายุ</div>
          <div class="mt-2 d-flex align-items-center gap-2">
            <span :class="['badge-pill', getReviewDateBadgeClass(previewItem?.ReviewDate)]">{{ formatFullDateTime(previewItem?.ReviewDate) }}</span>
            <span class="text-muted small">({{ formatRelativeTime(previewItem?.ReviewDate) }})</span>
          </div>
        </div>
      </div>
      <div class="drawer-footer">
        <div class="d-flex gap-2">
          <button class="btn-apple-primary flex-fill" @click="openEditModalFromPreview">
            <i class="bi bi-pencil-square me-2"></i> แก้ไข
          </button>
          <button class="btn-apple-secondary text-danger flex-fill" @click="confirmDeleteFromPreview">
            <i class="bi bi-trash me-2"></i> ลบ
          </button>
        </div>
      </div>
    </div>

    <!-- CRUD Modal -->
    <transition name="apple-zoom">
      <div v-if="showCrudModal" class="apple-modal-overlay" @click.self="closeCrudModal">
        <div class="apple-modal-content wide-modal">
          <div class="apple-modal-header-bg"></div>
          <div class="apple-modal-header">
            <div class="d-flex flex-column">
              <h5 class="apple-modal-title">{{ isEditing ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่' }}</h5>
              <span class="apple-modal-subtitle">{{ isEditing ? 'Edit Question & Answer' : 'Create New Question & Answer' }}</span>
            </div>
            <button class="apple-close-btn" @click="closeCrudModal">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="apple-modal-body">
            <form @submit.prevent="saveCrudForm" class="apple-form-container">
              
              <div class="apple-input-group">
                <label>หัวข้อคำถาม (Question Title) <span class="text-danger">*</span></label>
                <input type="text" class="apple-input" v-model="formData.QuestionTitle" required placeholder="เช่น ทุนเรียนดีมีกี่อย่าง?" />
              </div>

              <div class="apple-input-group">
                <label>คำตอบ (Answer) <span class="text-danger">*</span></label>
                <textarea class="apple-input apple-textarea" v-model="formData.QuestionText" rows="5" required placeholder="รายละเอียดคำตอบ..."></textarea>
              </div>

              <div class="row g-3">
                <div class="col-md-7">
                  <div class="apple-input-group">
                    <label>วันหมดอายุ (Review Date) <span class="text-danger">*</span></label>
                    <input type="date" class="apple-input" v-model="formData.ReviewDate" required />
                    <div class="d-flex flex-wrap gap-2 mt-2">
                      <button v-for="opt in reviewDateOptions" :key="opt.months" type="button" class="btn-tag-option" @click="setReviewDateMonths(opt.months)">
                        {{ opt.label }}
                      </button>
                    </div>
                  </div>
                </div>
                <div class="col-md-5">
                  <div class="apple-input-group">
                    <label>หมวดหมู่ (Category) <span class="text-danger">*</span></label>
                    <div class="select-wrapper">
                      <select class="apple-input" v-model="formData.CategoriesID" required>
                        <option :value="null" disabled>-- เลือกหมวดหมู่ --</option>
                        <option v-for="cat in sortedCategoriesForDropdown" :key="cat.CategoriesID" :value="cat.CategoriesID" :disabled="cat.isMain" :class="cat.isMain ? 'fw-bold text-muted bg-light' : ''">
                          {{ cat.isMain ? '▸ ' : ' └ ' }}{{ cat.CategoriesName }}
                        </option>
                      </select>
                      <i class="bi bi-chevron-down select-icon"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div class="apple-input-group">
                <label>Keywords</label>
                <div class="keyword-input-wrapper">
                  <input type="text" class="apple-input pe-5" v-model="keywordInput" placeholder="พิมพ์แล้วกด Enter หรือ +" @keydown.enter.prevent="addKeyword" />
                  <button class="btn-icon-absolute" type="button" @click="addKeyword"><i class="bi bi-plus-lg"></i></button>
                </div>
                <div class="d-flex flex-wrap gap-2 mt-2">
                  <span v-for="(kw, i) in formData.keywords" :key="i" class="keyword-tag removable" @click="removeKeyword(i)">
                    {{ kw }} <i class="bi bi-x"></i>
                  </span>
                </div>
              </div>

              <div class="apple-actions">
                <button type="button" class="btn-apple-secondary" @click="closeCrudModal">ยกเลิก</button>
                <button type="submit" class="btn-apple-primary" :disabled="isSaving">
                  <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มรายการ' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, watch, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { Modal, Tooltip } from 'bootstrap';
import Sidebar from '@/components/Sidebar.vue';
import { bindSidebarResize } from '@/stores/sidebarState';
import { useAppleToast } from '@/composables/useAppleToast';
import '@/assets/sidebar.css';
import ex5Url from '@/assets/ex5.svg';
import { formatRelativeTime } from '@/utils/formatTime';

const router = useRouter();
const { appContext } = getCurrentInstance();
const $axios = appContext.config.globalProperties.$axios;
const $swal = appContext.config.globalProperties.$swal;
const { success: toastSuccess, error: toastError, warning: toastWarning } = useAppleToast();

const userInfoObject = ref({});
const userType = ref("");
let unbindSidebarResize = null;

const questionsAnswers = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');

const currentPage = ref(1);
const itemsPerPage = ref(10);

const uploadedFile = ref(null);
const isUploading = ref(false);
const showUploadModal = ref(false);

const showDrawer = ref(false);
const previewItem = ref(null);

const showCrudModal = ref(false);
const showTemplateModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const isSaving = ref(false);
const keywordInput = ref('');
const categoriesList = ref([]);
const formData = ref({
  QuestionTitle: '',
  QuestionText: '',
  ReviewDate: '',
  CategoriesID: null,
  keywords: []
});

const reviewDateOptions = [
  { label: '+1 เดือน', months: 1 },
  { label: '+3 เดือน', months: 3 },
  { label: '+6 เดือน', months: 6 },
  { label: '+12 เดือน', months: 12 }
];

const isDownloadingFile = ref(false);
const isDownloadingTemplate = ref(false);

const props = defineProps({
  categoriesNameMap: { type: Object, default: () => ({}) },
  formatThaiDateTime: { type: Function, default: (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } },
});

// Helpers
function formatFullDateTime(timestamp) {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp;
  return date.toLocaleString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function formatDateInput(date) {
  return new Date(date).toISOString().split('T')[0];
}

function getReviewDateBadgeClass(timestamp) {
  if (!timestamp) return 'bg-light text-muted border';
  const now = new Date();
  const reviewDate = new Date(timestamp);
  if (isNaN(reviewDate.getTime())) return 'bg-light text-muted border';
  
  const diffMs = reviewDate - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMs <= 0) return 'bg-danger-subtle text-danger border border-danger'; // Expired
  if (diffDays <= 3) return 'bg-warning-subtle text-warning-emphasis border border-warning';
  if (diffDays <= 14) return 'bg-info-subtle text-info-emphasis border border-info';
  return 'bg-success-subtle text-success border border-success';
}

function setReviewDateMonths(months) {
  const target = addMonths(new Date(), months);
  formData.value.ReviewDate = formatDateInput(target);
}

// Drawer & Modal Controls
function openPreview(item) {
  previewItem.value = item;
  showDrawer.value = true;
}
function closeDrawer() { showDrawer.value = false; }

function openUploadModal() { uploadedFile.value = null; showUploadModal.value = true; }
function closeUploadModal() { showUploadModal.value = false; }

function openTemplateModal() { showTemplateModal.value = true; }
function closeTemplateModal() { showTemplateModal.value = false; }

function goToFeedbacks(questionId) {
  router.push({ name: 'report-feedbacks', query: { questionId: questionId } });
}

// CRUD Logic
const fetchCategories = async () => {
  try {
    const resp = await $axios.get('/questionsanswers/categories');
    categoriesList.value = (resp.data?.data) || (Array.isArray(resp.data) ? resp.data : []);
  } catch (err) { console.error('Failed to fetch categories:', err); }
};

function resetCrudForm() {
  const defaultReviewDate = formatDateInput(addMonths(new Date(), 6));
  formData.value = { QuestionTitle: '', QuestionText: '', ReviewDate: defaultReviewDate, CategoriesID: null, keywords: [] };
  keywordInput.value = '';
  isEditing.value = false;
  editingId.value = null;
}

async function openCrudModal() {
  resetCrudForm();
  await fetchCategories();
  showCrudModal.value = true;
}

function closeCrudModal() {
  showCrudModal.value = false;
  resetCrudForm();
}

async function openEditModalFromPreview() {
  if (!previewItem.value) return;
  await fetchCategories();
  isEditing.value = true;
  editingId.value = previewItem.value.QuestionsAnswersID;
  
  // Cat ID Match
  const resolveCategoryId = (catVal) => {
    if (!catVal) return null;
    const byId = categoriesList.value.find(c => String(c.CategoriesID) === String(catVal));
    if (byId) return byId.CategoriesID;
    const byName = categoriesList.value.find(c => String(c.CategoriesName) === String(catVal));
    return byName ? byName.CategoriesID : null;
  };
  const catId = resolveCategoryId(previewItem.value.CategoriesID || previewItem.value.CategoryID);

  let reviewDateStr = new Date().toISOString().split('T')[0];
  if (previewItem.value.ReviewDate) {
    try { reviewDateStr = new Date(previewItem.value.ReviewDate).toISOString().split('T')[0]; } catch(e){}
  }

  formData.value = {
    QuestionTitle: previewItem.value.QuestionTitle || '',
    QuestionText: previewItem.value.QuestionText || '',
    ReviewDate: reviewDateStr,
    CategoriesID: catId,
    keywords: (previewItem.value.keywords || []).map(k => k.KeywordText)
  };
  
  closeDrawer();
  showCrudModal.value = true;
}

function addKeyword() {
  const raw = (keywordInput.value || '').trim();
  if (!raw) return;
  const parts = raw.split(/[;,\n]+/).map(p => p.trim()).filter(Boolean);
  parts.forEach(part => {
    if (!formData.value.keywords.includes(part)) formData.value.keywords.push(part);
  });
  keywordInput.value = '';
}
function removeKeyword(index) { formData.value.keywords.splice(index, 1); }

const saveCrudForm = async () => {
  if (!formData.value.QuestionTitle || !formData.value.QuestionText || !formData.value.CategoriesID || !formData.value.ReviewDate) {
    toastWarning('กรุณากรอกข้อมูลให้ครบ'); return;
  }
  isSaving.value = true;
  try {
    const payload = {
      questionTitle: formData.value.QuestionTitle,
      questionText: formData.value.QuestionText,
      reviewDate: formData.value.ReviewDate,
      categoriesId: formData.value.CategoriesID,
      keywords: formData.value.keywords
    };
    if (isEditing.value && editingId.value) {
      await $axios.put(`/questionsanswers/update/${editingId.value}`, payload);
      toastSuccess('แก้ไขสำเร็จ!', 2000);
    } else {
      const res = await $axios.post('/questionsanswers/create', payload);
      toastSuccess('เพิ่มรายการสำเร็จ!', 2000);
      if (res.data?.skippedKeywords?.length > 0) setTimeout(() => toastWarning(`ข้ามคำสำคัญ: ${res.data.skippedKeywords.join(', ')}`, 3500), 500);
    }
    closeCrudModal();
    await fetchQuestionsAnswers();
  } catch (err) {
    toastError(err.response?.data?.message || err.message || 'เกิดข้อผิดพลาด', 4000);
  } finally { isSaving.value = false; }
};

const confirmDeleteFromPreview = async () => {
  if (!previewItem.value) return;
  const id = previewItem.value.QuestionsAnswersID;
  const result = await $swal?.fire({
    title: 'ยืนยันการลบ?',
    text: `ต้องการลบรายการนี้หรือไม่?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#FF3B30',
    cancelButtonColor: '#8E8E93',
    confirmButtonText: 'ลบ',
    cancelButtonText: 'ยกเลิก',
    customClass: { popup: 'apple-swal-popup' }
  });

  if (result?.isConfirmed) {
    try {
      await $axios.delete(`/questionsanswers/delete/${id}`);
      toastSuccess('ลบสำเร็จ!', 2000);
      closeDrawer();
      await fetchQuestionsAnswers();
    } catch (err) {
      toastError(err.response?.data?.message || 'เกิดข้อผิดพลาด', 4000);
    }
  }
};

// Data & Pagination
const tagColors = ['#0071e3', '#34C759', '#FF3B30', '#FF9500', '#AF52DE', '#5856D6', '#FF2D55', '#5AC8FA'];

const categoriesNameMapSafe = computed(() => props.categoriesNameMap || {});

const fetchQuestionsAnswers = async () => {
  loading.value = true;
  try {
    const response = await $axios.get('/questionsanswers');
    questionsAnswers.value = Array.isArray(response.data) ? response.data : (response.data?.data || []);
  } catch (err) { error.value = 'Failed to load'; } 
  finally { loading.value = false; }
};

const allQuestions = computed(() => Array.isArray(questionsAnswers.value) ? questionsAnswers.value : []);
const filteredQuestions = computed(() => {
  const q = (searchQuery.value || '').toString().trim().toLowerCase();
  if (!q) return allQuestions.value;
  return allQuestions.value.filter(item => {
    const str = JSON.stringify(item).toLowerCase();
    return str.includes(q);
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredQuestions.value.length / itemsPerPage.value)));
const totalEntries = computed(() => filteredQuestions.value.length);
const startIndex = computed(() => totalEntries.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1);
const endIndex = computed(() => totalEntries.value === 0 ? 0 : Math.min(currentPage.value * itemsPerPage.value, totalEntries.value));
const paginatedQuestions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredQuestions.value.slice(start, start + itemsPerPage.value);
});

const pagesToShow = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  if(total<=5) return Array.from({length:total},(_,i)=>i+1);
  if(current<=3) return [1,2,3,4,5];
  if(current>=total-2) return [total-4,total-3,total-2,total-1,total];
  return [current-2,current-1,current,current+1,current+2];
});

function goToPage(page) { if (page>=1 && page<=totalPages.value) currentPage.value = page; }
function prevPage() { goToPage(Math.max(1, currentPage.value - 1)); }
function nextPage() { goToPage(Math.min(totalPages.value, currentPage.value + 1)); }
function firstPage() { goToPage(1); }
function lastPage() { goToPage(totalPages.value); }

watch(searchQuery, () => { currentPage.value = 1; });

// Category Logic
const mainCategories = computed(() => {
  return categoriesList.value.filter(cat => !String(cat.CategoriesID).includes('-'))
    .sort((a, b) => String(a.CategoriesID).localeCompare(String(b.CategoriesID), undefined, { numeric: true }));
});
const getSubsByParent = (parentId) => {
  const pId = String(parentId);
  return categoriesList.value.filter(cat => String(cat.CategoriesID).startsWith(pId + '-') && String(cat.CategoriesID) !== pId)
    .sort((a, b) => String(a.CategoriesID).localeCompare(String(b.CategoriesID), undefined, { numeric: true }));
};
const sortedCategoriesForDropdown = computed(() => {
  const result = [];
  for (const main of mainCategories.value) {
    result.push({ ...main, isMain: true });
    const subs = getSubsByParent(main.CategoriesID);
    for (const sub of subs) result.push({ ...sub, isMain: false });
  }
  return result;
});

// Upload Logic
function onFileChange(e) {
  const f = e.target.files?.[0];
  if(f) uploadedFile.value = f;
  e.target.value = '';
}
function onFileDrop(e) {
  const f = e.dataTransfer?.files?.[0];
  if(f) uploadedFile.value = f;
}
const saveUpload = async () => {
  if (!uploadedFile.value) return;
  isUploading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', uploadedFile.value);
    const resp = await $axios.post('/questionsanswers/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 });
    toastSuccess(resp.data?.message || 'Upload successful!');
    await fetchQuestionsAnswers();
    closeUploadModal();
  } catch (err) { toastError('Upload Failed: ' + (err.response?.data?.message || err.message)); }
  finally { isUploading.value = false; }
};
const downloadTemplateFile = async () => {
  try {
    const res = await $axios.get('/questionsanswers/template', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a'); a.href=url; a.download='template.csv'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  } catch(e) { toastError('Download Failed'); }
};
const exportCurrentDataAsCsv = () => {
  if (!questionsAnswers.value.length) return;
  try {
    const headers = ['QuestionTitle', 'QuestionText', 'ReviewDate', 'CategoriesID', 'Keywords'];
    const rows = questionsAnswers.value.map(item => [
      `"${(item.QuestionTitle||'').replace(/"/g,'""')}"`,
      `"${(item.QuestionText||'').replace(/"/g,'""')}"`,
      item.ReviewDate ? item.ReviewDate.split('T')[0] : '',
      item.CategoriesID || '',
      `"${(item.keywords||[]).map(k=>k.KeywordText).join(',')}"`
    ]);
    const csv = [headers.join(','), ...rows.join('\n')].join('\n'); // oops logic fix
    // Fix join logic
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const url = URL.createObjectURL(new Blob(["\uFEFF"+csvContent], {type: 'text/csv;charset=utf-8;'}));
    const a = document.createElement('a'); a.href=url; a.download='export.csv'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  } catch(e) { toastError('Export Failed'); }
};

onMounted(() => {
  unbindSidebarResize = bindSidebarResize();
  const token = localStorage.getItem("userToken");
  if (!token) { router.replace({ name: "login" }); return; }
  const info = localStorage.getItem("userInfo");
  if (info) userInfoObject.value = JSON.parse(info);
  userType.value = localStorage.getItem("userType") || "";
  fetchQuestionsAnswers();
  fetchCategories();
  nextTick(() => document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new Tooltip(el)));
});
onUnmounted(() => { if (unbindSidebarResize) unbindSidebarResize(); });
</script>

<style scoped>
@import '@/assets/dashboard-styles.css';
@import '@/assets/main.css';
@import '@/assets/pagination-styles.css';
@import '@/assets/sidebar.css';

/* =========================================
   Apple Design System
   ========================================= */
:root {
  --apple-blue: #0071e3;
  --apple-blue-hover: #0077ED;
  --apple-red: #FF3B30;
  --apple-gray: #86868b;
  --apple-light-bg: #F5F5F7;
  --apple-card-bg: #FFFFFF;
  --apple-border: #E5E5EA;
  --apple-radius: 12px;
  --apple-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  --apple-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.dashboard-container {
  font-family: var(--apple-font);
  background-color: var(--apple-light-bg);
  min-height: 100vh;
  display: flex;
}

.main-content {
  flex-grow: 1;
  padding-bottom: 40px;
}

.page-title {
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #1d1d1f;
}

/* =========================================
   Buttons & Inputs (Improved contrast for non-primary actions)
   ========================================= */
.btn-apple-primary {
  background: linear-gradient(135deg, #007AFF 0%, #0051D4 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 8px 18px;
  font-weight: 700;
  font-size: 0.95rem;
  transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 6px 18px rgba(0, 90, 255, 0.12);
}
.btn-apple-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 30px rgba(0, 90, 255, 0.18);
  background: linear-gradient(135deg, #0A8AFF 0%, #0046C4 100%);
}

.btn-apple-secondary {
  background: #F4F6F8; /* light neutral background */
  color: #1d1d1f;
  border: 1px solid rgba(13, 20, 25, 0.06);
  border-radius: 12px;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 120ms ease, border-color 120ms ease;
}
.btn-apple-secondary:hover:not(:disabled) {
  background: #E9EDF2;
  border-color: rgba(13,20,25,0.08);
}
.btn-apple-secondary.small {
  padding: 6px 12px;
  font-size: 0.85rem;
}

/* Small tag-style buttons used for quick options (+1 month, +3 months etc) */
.btn-tag-option {
  background: #F4F6F8;
  color: #1d1d1f;
  border: 1px solid rgba(13,20,25,0.06);
  border-radius: 12px;
  padding: 6px 10px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 120ms ease, border-color 120ms ease, transform 120ms ease;
  cursor: pointer;
}
.btn-tag-option:hover:not(:disabled) {
  background: #E9EDF2;
  border-color: rgba(13,20,25,0.08);
  transform: translateY(-1px);
}
.btn-tag-option:active {
  transform: translateY(0) scale(0.995);
}
.btn-tag-option:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-apple-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #007AFF 0%, #0051D4 100%);
  border: none;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
  font-size: 1.2rem;
  box-shadow: 0 6px 16px rgba(0, 90, 255, 0.12);
}
.btn-apple-icon:hover {
  transform: translateY(-1px) scale(1.02);
  background: linear-gradient(135deg, #0A8AFF 0%, #0046C4 100%);
  color: #ffffff;
}

/* Search Bar */
.search-container { position: relative; width: 100%; max-width: 360px; }
.search-input {
  width: 100%;
  padding: 10px 40px;
  border-radius: 12px;
  border: 1px solid var(--apple-border);
  background: white;
  font-size: 0.95rem;
  transition: all 0.2s;
}
.search-input:focus {
  outline: none;
  border-color: var(--apple-blue);
  box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.15);
}
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #86868b; }
.search-clear { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); border: none; background: none; color: #86868b; cursor: pointer; }

/* =========================================
   Apple Card & Table
   ========================================= */
.apple-card {
  background: var(--apple-card-bg);
  border-radius: var(--apple-radius);
  box-shadow: var(--apple-shadow);
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.02);
}

.apple-table thead th {
  background: #F9F9FB;
  font-weight: 600;
  color: #1d1d1f;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  border-bottom: 1px solid var(--apple-border);
  padding: 14px 16px;
}

.apple-table tbody td {
  padding: 14px 16px;
  border-bottom: 1px solid #F5F5F5;
  color: #1d1d1f;
  font-size: 0.95rem;
}

.apple-table tr.apple-row:hover {
  background-color: rgba(0, 113, 227, 0.04);
  cursor: pointer;
}

/* Badges */
.badge-pill {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap; /* prevent wrapping inside the badge */
}
.category-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}
.category-badge.large { font-size: 0.9rem; padding: 6px 12px; }

/* Review date column: ensure enough space and center alignment */
.col-review-date { width: 160px; min-width: 140px; max-width: 220px; }
.review-date-cell { min-width: 140px; }
.review-date-wrap { display: flex; justify-content: center; align-items: center; }

@media (max-width: 768px) {
  .col-review-date { width: 120px; min-width: 100px; }
  .review-date-cell { min-width: 100px; }
}

.keyword-tag {
  background: rgba(0,0,0,0.05);
  color: #1d1d1f;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
}
.keyword-tag.large { font-size: 0.85rem; padding: 4px 10px; }
.keyword-tag.removable { cursor: pointer; transition: background 0.2s; }
.keyword-tag.removable:hover { background: rgba(255, 59, 48, 0.1); color: var(--apple-red); }
.keyword-tag-more { font-size: 0.75rem; color: #86868b; padding: 2px 6px; }

/* Stats */
.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s;
  background: rgba(0,0,0,0.03);
  color: #86868b;
}
.stat-pill.like.active { background: rgba(52, 199, 89, 0.1); color: #34C759; }
.stat-pill.unlike.active { background: rgba(255, 59, 48, 0.1); color: #FF3B30; }
.stat-pill:hover { transform: scale(1.05); }

/* Pagination */
.pagination { gap: 4px; }
.pagination .page-link {
  border: none;
  border-radius: 8px !important;
  padding: 6px 12px;
  color: #1d1d1f;
  font-weight: 500;
  transition: all 0.2s;
}
.pagination .page-link:hover { background: rgba(0,0,0,0.05); }
.pagination .page-item.active .page-link {
  background: var(--apple-blue);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 113, 227, 0.25);
}

/* =========================================
   Apple Modals (Glassmorphism)
   ========================================= */
.apple-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.apple-modal-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  width: 100%;
  max-width: 550px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.4) inset;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.apple-modal-content.wide-modal { max-width: 800px; }

.apple-modal-header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  z-index: 2;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.apple-modal-header-bg {
  position: absolute; top: 0; left: 0; right: 0; height: 80px;
  background: linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%);
  pointer-events: none; z-index: 1;
}

.apple-modal-title { font-size: 1.25rem; font-weight: 700; color: #1d1d1f; margin: 0; }
.apple-modal-subtitle { font-size: 0.9rem; color: #86868b; }

.apple-close-btn {
  background: rgba(0,0,0,0.05);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #1d1d1f;
  transition: all 0.2s;
}
.apple-close-btn:hover { background: rgba(0,0,0,0.1); transform: rotate(90deg); }

.apple-modal-body {
  padding: 24px;
  overflow-y: auto;
  max-height: 80vh;
  position: relative;
  z-index: 2;
}

/* Modal Inputs */
.apple-input-group { margin-bottom: 16px; }
.apple-input-group label { font-size: 0.85rem; font-weight: 600; color: #1d1d1f; margin-bottom: 6px; display: block; }
.apple-input {
  width: 100%;
  background: rgba(118, 118, 128, 0.12);
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 1rem;
  color: #1d1d1f;
  transition: all 0.2s;
}
.apple-input:focus { outline: none; background: white; box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.15); }
.apple-input[type="date"] { min-width: 200px; max-width: 100%; }
.apple-textarea { resize: vertical; min-height: 100px; }

.select-wrapper { position: relative; }
.select-icon { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 0.8rem; color: #86868b; pointer-events: none; }
.select-wrapper select { appearance: none; padding-right: 36px; }

.keyword-input-wrapper { position: relative; }
.btn-icon-absolute {
  position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
  width: 28px; height: 28px; border-radius: 6px;
  background: white; border: none; color: var(--apple-blue);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.apple-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }

/* Upload Area */
.upload-drop-area-apple {
  border: 2px dashed #C7C7CC;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  background: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: all 0.2s;
}
.upload-drop-area-apple:hover { border-color: var(--apple-blue); background: rgba(0, 113, 227, 0.04); }
.upload-icon-wrapper { font-size: 2.5rem; color: var(--apple-blue); margin-bottom: 8px; }
.upload-text { font-size: 1rem; color: #1d1d1f; }
.upload-hint { font-size: 0.85rem; color: #86868b; margin-top: 4px; }

/* Transitions */
.apple-zoom-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.apple-zoom-leave-active { transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1); }
.apple-zoom-enter-from, .apple-zoom-leave-to { opacity: 0; transform: scale(0.95); }

/* Drawer */
.apple-drawer {
  position: fixed; top: 0; right: -500px; width: 500px; max-width: 100vw; height: 100vh;
  background: white; box-shadow: -4px 0 24px rgba(0,0,0,0.1); z-index: 1050;
  transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex; flex-direction: column;
}
.apple-drawer.drawer-open { right: 0; }
.drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(4px); z-index: 1049; }
.drawer-header { padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.05); }
.drawer-title { font-size: 1.1rem; font-weight: 700; margin: 0; }
.btn-close-drawer { border: none; background: rgba(0,0,0,0.05); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.btn-close-drawer:hover { background: rgba(0,0,0,0.1); }
.drawer-body { flex: 1; overflow-y: auto; padding: 24px; }
.drawer-section { margin-bottom: 24px; }
.drawer-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #86868b; margin-bottom: 4px; }
.drawer-value { font-size: 1rem; color: #1d1d1f; line-height: 1.5; }
.drawer-footer { padding: 20px 24px; border-top: 1px solid rgba(0,0,0,0.05); background: #F9F9FB; }

.empty-state { display: flex; flex-direction: column; align-items: center; color: var(--apple-gray); }
.empty-state i { font-size: 2.5rem; margin-bottom: 8px; opacity: 0.5; }

.whitespace-prewrap { white-space: pre-wrap; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>