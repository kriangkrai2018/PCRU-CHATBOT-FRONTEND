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
          <p class="mt-2">Loading questionsanswers data...</p>
        </div>

        <div v-else>
          <div class="d-block d-md-flex align-items-center justify-content-between mb-4">
            <div class="d-flex align-items-center gap-3">
              <h2 class="page-title m-0">จัดการคำถาม-คำตอบ</h2>
              <button class="btn-add-apple" @click="openCrudModal" title="เพิ่มรายการใหม่">
                <i class="bi bi-plus-lg"></i>
                <span>เพิ่มคำถาม</span>
              </button>
              <button class="btn-upload-apple" @click="openAddModal" title="อัพโหลด CSV">
                <i class="bi bi-cloud-upload"></i>
              </button>
            </div>

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

          <div class="bg-white shadow-apple rounded-4 overflow-hidden apple-card">
            <div class="table-responsive">
              <table class="table table-hover mb-0 apple-table">
                <thead>
                  <tr>
                    <th class=""><small>QuestionsAnswersID</small></th>
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
                  <tr v-for="(item, idx) in paginatedQuestions" :key="item.QuestionsAnswersID" class="align-middle apple-row" @click="openPreview(item)" style="cursor: pointer;">
                    <td class="py-3 ps-3">{{ item.QuestionsAnswersID }}</td>
                    <td data-label="QuestionTitle" class="py-3">
                      <div class="question-text-cell line-clamp-2" :title="item.QuestionTitle">{{ item.QuestionTitle }}</div>
                    </td>
                    <td data-label="ReviewDate" class="py-3">
                      <span 
                        :class="['badge', getReviewDateBadgeClass(item.ReviewDate)]"
                        data-bs-toggle="tooltip" 
                        data-bs-placement="top" 
                        :title="formatFullDateTime(item.ReviewDate)"
                      >
                        {{ formatRelativeTime(item.ReviewDate) }}
                      </span>
                    </td>
                    <td data-label="QuestionText" class="py-3">
                      <div class="question-text-cell line-clamp-3" :title="item.QuestionText">{{ item.QuestionText }}</div>
                    </td>
                    <!-- category badge (grey) -->
                    <td data-label="CategoriesName" class="py-3">
                      <span
                        class="tag-badge bg-dark fw-bold"
                        :style="{ backgroundColor: tagColors[(item.CategoriesID || 0) % tagColors.length] }"
                      >
                        {{ categoriesNameMapSafe[item.CategoriesID] || item.CategoriesID }}
                      </span>
                    </td>
                    <!-- keywords badges from backend (item.keywords) -->
                    <td data-label="KeywordText" class="py-3">
                      <template v-if="item.keywords && item.keywords.length">
                        <span
                          v-for="(k, i) in item.keywords"
                          :key="k.KeywordID || (k.KeywordText + i)"
                          class="tag-badge me-1 mb-1"
                          :style="{ backgroundColor: tagColors[i % tagColors.length] }"
                        >
                          {{ k.KeywordText }}
                        </span>
                      </template>
                      <span v-else class="text-muted small">—</span>
                    </td>
                    <!-- Like Count - Apple Style -->
                    <td data-label="Like" class="py-3 text-center" @click.stop>
                      <div class="feedback-stat-container">
                        <div 
                          class="feedback-stat like-stat"
                          :class="{ 'has-count': item.likeCount > 0, 'zero-count': item.likeCount === 0 }"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          :title="`${item.likeCount} ${item.likeCount === 1 ? 'person' : 'people'} liked this answer`"
                          @click="goToFeedbacks(item.QuestionsAnswersID)"
                        >
                          <div class="feedback-icon-wrapper">
                            <svg class="feedback-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                              <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.125c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V3a.75.75 0 0 1 .75-.75A2.25 2.25 0 0 1 17.25 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.777ZM2.331 10.727a11.969 11.969 0 0 0-.831 4.398 12 12 0 0 0 .52 3.507C2.28 19.482 3.105 20 3.994 20H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 0 1-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227Z" />
                            </svg>
                          </div>
                          <span class="feedback-count">{{ item.likeCount || 0 }}</span>
                        </div>
                      </div>
                    </td>
                    <!-- Unlike Count - Apple Style -->
                    <td data-label="Unlike" class="py-3 text-center" @click.stop>
                      <div class="feedback-stat-container">
                        <div 
                          class="feedback-stat unlike-stat"
                          :class="{ 'has-count': item.unlikeCount > 0, 'zero-count': item.unlikeCount === 0 }"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          :title="`${item.unlikeCount} ${item.unlikeCount === 1 ? 'person' : 'people'} disliked this answer`"
                          @click="goToFeedbacks(item.QuestionsAnswersID)"
                        >
                          <div class="feedback-icon-wrapper">
                            <svg class="feedback-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                              <path d="M15.73 5.5h1.035A7.465 7.465 0 0 1 18 9.625a7.465 7.465 0 0 1-1.235 4.125h-.148c-.806 0-1.54.446-1.917 1.164-1.084 2.066-3.13 3.466-5.455 3.466h-.354c-.51 0-.915-.405-.915-.916v-.533c0-.83.337-1.596.93-2.145 1.155-1.07 1.97-2.49 2.31-4.05.123-.567.253-1.146.445-1.69.19-.545.425-1.07.735-1.53a9.016 9.016 0 0 1 3.377-3.016ZM21.75 9.625a11.966 11.966 0 0 0-.831-4.398A2.25 2.25 0 0 0 19 3.999h-.906c-.445 0-.72.498-.523.898.345.703.582 1.458.697 2.25a11.94 11.94 0 0 1 0 5.156 8.963 8.963 0 0 1-.697 2.25c-.197.4.078.898.523.898h.906c.832 0 1.613-.453 1.919-1.228.395-.99.61-2.06.831-4.275Z" />
                            </svg>
                          </div>
                          <span class="feedback-count">{{ item.unlikeCount || 0 }}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="paginatedQuestions.length === 0">
                    <td colspan="8" class="text-center text-muted py-3">No questionsanswers data found.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination footer -->
            <div class="d-flex justify-content-between align-items-center p-3">
              <div class="small text-muted">
                Showing {{ startIndex }} to {{ endIndex }} of {{ totalEntries }} entries
              </div>
              <nav aria-label="Page navigation">
                <ul class="pagination mb-0 align-items-center">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="firstPage" aria-label="First">&laquo;</a>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="prevPage" aria-label="Previous">&lsaquo;</a>
                  </li>

                  <li v-for="page in pagesToShow" :key="page" class="page-item" :class="{ active: currentPage === page }">
                    <a class="page-link page-num rounded-3" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
                  </li>

                  <li class="page-item" :class="{ disabled: currentPage === totalPages || totalPages === 0 }">
                    <a class="page-link" href="#" @click.prevent="nextPage" aria-label="Next">&rsaquo;</a>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === totalPages || totalPages === 0 }">
                    <a class="page-link" href="#" @click.prevent="lastPage" aria-label="Last">&raquo;</a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Upload Modal - Apple Style -->
    <div class="modal fade" ref="bsModalRef" id="addOrgModal" tabindex="-1" aria-labelledby="addOrgModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content apple-modal rounded-4 p-3 shadow-lg">
          <div class="modal-header border-0">
            <div class="modal-title w-100 text-center" id="addOrgModalLabel">
              <div class="fs-5 fw-bold">อัพโหลดไฟล์</div>
              <div class="text-muted fs-6">คำถาม-คำตอบ CSV</div>
            </div>
            <button type="button" class="btn-close btn-close-custom" aria-label="Close" @click="hideModal()"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <div
                class="upload-drop-area-apple"
                :class="{ 'has-file': uploadedFile }"
                @drop.prevent="onFileDrop"
                @dragover.prevent
                @click="$refs.fileInput && $refs.fileInput.click()"
              >
                <div class="upload-icon-wrapper">
                  <i class="bi bi-cloud-arrow-up"></i>
                </div>
                <div class="upload-text">
                  <span v-if="!uploadedFile">ลากไฟล์มาวางที่นี่ หรือ <strong>คลิกเลือกไฟล์</strong></span>
                  <span v-else class="file-selected">
                    <i class="bi bi-file-earmark-check me-2"></i>{{ uploadedFile.name }}
                  </span>
                </div>
                <div class="upload-hint">รองรับไฟล์ .csv เท่านั้น</div>
                <input ref="fileInput" type="file" accept=".csv" class="d-none" @change="onFileChange" />
              </div>

              <!-- Template / Download actions -->
              <div class="d-flex align-items-center justify-content-center gap-3 mt-4">
                <button type="button" class="btn-apple-secondary"
                        @click.prevent="downloadTemplateFile"
                        :disabled="isDownloadingTemplate">
                  <i class="bi bi-file-earmark-text"></i>
                  <span>Template</span>
                  <span v-if="isDownloadingTemplate" class="spinner-border spinner-border-sm ms-2"></span>
                </button>

                <button type="button" class="btn-apple-secondary" @click.prevent="openTemplateModal">
                  <i class="bi bi-eye"></i>
                  <span>ดูตัวอย่าง</span>
                </button>

                <button type="button" class="btn-apple-secondary" @click.prevent="exportCurrentDataAsCsv" :disabled="isDownloadingFile">
                  <i class="bi bi-download"></i>
                  <span>Export CSV</span>
                  <span v-if="isDownloadingFile" class="spinner-border spinner-border-sm ms-2"></span>
                </button>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 justify-content-center gap-3">
            <button type="button" class="btn btn-secondary rounded-3 px-4" @click="hideModal()" :disabled="isUploading">
              ยกเลิก
            </button>
            <button type="button" class="btn btn-primary rounded-3 px-4" @click="saveUpload" :disabled="!uploadedFile || isUploading">
              <span v-if="isUploading" class="spinner-border spinner-border-sm me-2"></span>
              <i v-if="!isUploading" class="bi bi-cloud-upload me-2"></i>
              อัพโหลด
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Template Image Modal -->
    <div class="modal fade" ref="templateModalRef" id="templateModal" tabindex="-1" aria-labelledby="templateModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header border-0">
            <h5 class="modal-title w-100 text-center" id="templateModalLabel">QuestionsAnswers Template Example</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body text-center">
            <img :src="ex5Url" alt="Template Example" class="img-fluid">
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Drawer -->
    <div class="drawer-overlay" v-if="showDrawer" @click="closeDrawer"></div>
    <div class="apple-drawer" :class="{ 'drawer-open': showDrawer }">
      <div class="drawer-header">
        <h5 class="drawer-title">รายละเอียดคำถาม/คำตอบ</h5>
        <button type="button" class="btn-close-drawer" @click="closeDrawer">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <div class="drawer-body">
        <div class="drawer-section">
          <div class="drawer-label">ID</div>
          <div class="drawer-value">{{ previewItem?.QuestionsAnswersID || '-' }}</div>
        </div>
        <div class="drawer-section">
          <div class="drawer-label">QuestionTitle</div>
          <div class="drawer-value fw-bold">{{ previewItem?.QuestionTitle || '-' }}</div>
        </div>
        <div class="drawer-section">
          <div class="drawer-label">QuestionText</div>
          <div class="drawer-value whitespace-prewrap">{{ previewItem?.QuestionText || '-' }}</div>
        </div>
        <div class="drawer-section">
          <div class="drawer-label">Keywords</div>
          <div class="drawer-value" v-if="previewItem?.keywords && previewItem.keywords.length">
            <span
              v-for="(k, i) in previewItem.keywords"
              :key="k.KeywordID || (k.KeywordText + i)"
              class="tag-badge me-1 mb-1"
              :style="{ backgroundColor: tagColors[i % tagColors.length] }"
            >
              {{ k.KeywordText }}
            </span>
          </div>
          <div class="drawer-value text-muted" v-else>—</div>
        </div>
        <div class="drawer-section">
          <div class="drawer-label">หมวดหมู่</div>
          <div class="drawer-value">
            <span class="tag-badge bg-dark fw-bold">
              {{ categoriesNameMapSafe[previewItem?.CategoriesID] || previewItem?.CategoriesID || '-' }}
            </span>
          </div>
        </div>
        <div class="drawer-section">
          <div class="drawer-label">ReviewDate (วันที่หมดอายุ)</div>
          <div class="drawer-value">
            <span :class="['badge', getReviewDateBadgeClass(previewItem?.ReviewDate)]">{{ formatFullDateTime(previewItem?.ReviewDate) }}</span>
            <div class="text-muted small mt-1">{{ formatRelativeTime(previewItem?.ReviewDate) }}</div>
          </div>
        </div>
      </div>
      <!-- CRUD Action Buttons - Fixed at bottom -->
      <div class="drawer-footer">
        <div class="drawer-actions d-flex gap-2">
          <button class="btn btn-primary flex-fill" @click="openEditModalFromPreview">
            <i class="bi bi-pencil-square me-1"></i> แก้ไข
          </button>
          <button class="btn btn-danger flex-fill" @click="confirmDeleteFromPreview">
            <i class="bi bi-trash me-1"></i> ลบ
          </button>
        </div>
      </div>
    </div>

    <!-- CRUD Modal for Add/Edit -->
    <div class="modal fade" ref="crudModalRef" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content apple-modal modal-with-fixed-buttons">
          <div class="modal-header modal-header-sticky">
            <h5 class="modal-title">{{ isEditing ? 'แก้ไขคำถาม/คำตอบ' : 'เพิ่มคำถาม/คำตอบ' }}</h5>
            <button type="button" class="btn-close" @click="hideCrudModal" aria-label="Close"></button>
          </div>
          <div class="modal-body modal-body-scrollable">
            <form @submit.prevent="saveCrudForm">
              <div class="mb-3">
                <label class="form-label fw-bold">QuestionTitle <span class="text-danger">*</span></label>
                <input type="text" class="form-control" v-model="formData.QuestionTitle" required placeholder="เช่น ทุนเรียนดีมีกี่อย่าง?">
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">QuestionText <span class="text-danger">*</span></label>
                <textarea class="form-control" v-model="formData.QuestionText" rows="4" required placeholder="คำตอบของคำถาม..."></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">ReviewDate (วันที่หมดอายุ) <span class="text-danger">*</span></label>
                <input type="date" class="form-control" v-model="formData.ReviewDate" required>
                <div class="d-flex flex-wrap gap-2 mt-2">
                  <button
                    v-for="opt in reviewDateOptions"
                    :key="opt.months"
                    type="button"
                    class="btn btn-sm btn-outline-primary"
                    @click="setReviewDateMonths(opt.months)"
                  >
                    {{ opt.label }}
                  </button>
                </div>
                <small class="text-muted">เลือกวันหมดอายุอย่างรวดเร็ว เช่น ตั้งไว้ล่วงหน้า 6 เดือน</small>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">หมวดหมู่ <span class="text-danger">*</span></label>
                <select class="form-select" v-model="formData.CategoriesID" required>
                  <option :value="null" disabled>-- เลือกหมวดหมู่ ({{ sortedCategoriesForDropdown.length }}) --</option>
                  <option 
                    v-for="cat in sortedCategoriesForDropdown" 
                    :key="cat.CategoriesID" 
                    :value="cat.CategoriesID"
                    :class="cat.isMain ? 'fw-bold' : ''"
                  >
                    {{ cat.isMain ? '▸ ' : '  └ ' }}{{ cat.CategoriesName }}
                  </option>
                </select>
                <small class="text-muted">Selected: {{ formData.CategoriesID }} | Options: {{ sortedCategoriesForDropdown.length }}</small>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">Keywords</label>
                <div class="input-group mb-2">
                  <input type="text" class="form-control" v-model="keywordInput" placeholder="พิมพ์ keyword แล้วกด Enter หรือ + — รองรับหลายค่า คั่นด้วย , ; หรือขึ้นบรรทัดใหม่" @keydown.enter.prevent="addKeyword">
                  <button class="btn btn-outline-secondary" type="button" @click="addKeyword">+</button>
                </div>
                <div class="keywords-tags">
                  <span v-for="(kw, i) in formData.keywords" :key="i" class="tag-badge me-1 mb-1" :style="{ backgroundColor: tagColors[i % tagColors.length] }">
                    {{ kw }}
                    <i class="bi bi-x ms-1 cursor-pointer" @click="removeKeyword(i)"></i>
                  </span>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer modal-footer-sticky">
            <button type="button" class="btn btn-secondary" @click="hideCrudModal">ยกเลิก</button>
            <button type="button" class="btn btn-primary" @click="saveCrudForm" :disabled="isSaving">
              <span v-if="isSaving" class="spinner-border spinner-border-sm me-1"></span>
              {{ isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มรายการ' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, watch, getCurrentInstance } from 'vue'; // Ensure getCurrentInstance is imported
import { useRouter } from 'vue-router';
import { Modal, Tooltip } from 'bootstrap';

import Sidebar from '@/components/Sidebar.vue';
import { bindSidebarResize } from '@/stores/sidebarState';
import { useAppleToast } from '@/composables/useAppleToast';
import '@/assets/sidebar.css';
import ex5Url from '@/assets/ex5.svg'; // ensure imported

const router = useRouter();
const { appContext } = getCurrentInstance(); // Correctly use getCurrentInstance
const $axios = appContext.config.globalProperties.$axios;
const $swal = appContext.config.globalProperties.$swal;

// Apple Toast
const { success: toastSuccess, error: toastError, warning: toastWarning } = useAppleToast();

const userInfoObject = ref({});
const userType = ref("");

let unbindSidebarResize = null;

const questionsAnswers = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');

// pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);

// upload state
const uploadedFile = ref(null);
const isUploading = ref(false);
const bsModalRef = ref(null);
let bsModalInstance = null;

// Preview drawer state
const showDrawer = ref(false);
const previewItem = ref(null);
let previewModalInstance = null; // defensive: ensure cleanup hook has a defined handle

// CRUD state
const crudModalRef = ref(null);
let crudModalInstance = null;
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

// Add download state flags
const isDownloadingFile = ref(false);
const isDownloadingTemplate = ref(false);
const templateModalRef = ref(null);
let templateModalInstance = null;

import { formatRelativeTime } from '@/utils/formatTime';

const props = defineProps({
  categoriesNameMap: { type: Object, default: () => ({}) },
  formatThaiDateTime: { type: Function, default: (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    return d.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } },
});

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


function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function formatDateInput(date) {
  return new Date(date).toISOString().split('T')[0];
}

// Get ReviewDate badge color based on urgency (detailed color scheme)
function getReviewDateBadgeClass(timestamp) {
  if (!timestamp) return 'bg-secondary';
  
  const now = new Date();
  const reviewDate = new Date(timestamp);
  if (isNaN(reviewDate.getTime())) return 'bg-secondary';
  
  const diffMs = reviewDate - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffSeconds = Math.floor(diffMs / 1000);
  
  // 🔴 Dark Red: OVERDUE or < 1 hour remaining
  if (diffMs <= 0) return 'bg-danger';
  if (diffHours < 1 && diffMinutes >= 0) return 'bg-danger';
  
  // 🔴 Red: < 6 hours
  if (diffHours < 6 && diffHours >= 1) return 'bg-danger';
  
  // 🟠 Orange: 6 hours - 1 day
  if (diffHours < 24 && diffHours >= 6) return 'bg-warning text-dark fw-bold';
  
  // 🟡 Light Orange: 1 - 3 days
  if (diffDays <= 3 && diffDays > 0) return 'bg-warning text-dark';
  
  // 🟢 Light Green: 4 - 7 days
  if (diffDays <= 7 && diffDays > 3) return 'bg-info text-white';
  
  // 🟢 Light Blue: 8 - 14 days
  if (diffDays <= 14 && diffDays > 7) return 'bg-info text-white';
  
  // 🟢 Teal: 15 - 30 days
  if (diffDays <= 30 && diffDays > 14) return 'bg-success text-white';
  
  // 🟢 Green: 31 - 60 days
  if (diffDays <= 60 && diffDays > 30) return 'bg-success text-white';
  
  // 💙 Blue: 61 - 90 days
  if (diffDays <= 90 && diffDays > 60) return 'bg-primary text-white';
  
  // 💜 Purple: > 90 days
  if (diffDays > 90) return 'bg-secondary text-white';
  
  return 'bg-secondary';
}

function setReviewDateMonths(months) {
  const target = addMonths(new Date(), months);
  formData.value.ReviewDate = formatDateInput(target);
}

function openPreview(item) {
  previewItem.value = item;
  showDrawer.value = true;
}

function closeDrawer() {
  showDrawer.value = false;
}

function goToFeedbacks(questionId) {
  // Navigate to feedbacks report page with questionId query so it filters the feedbacks
  router.push({ name: 'report-feedbacks', query: { questionId: questionId } });
}

// ======= CRUD Functions =======
// Fetch categories for dropdown
const fetchCategories = async () => {
  try {
    const resp = await $axios.get('/questionsanswers/categories');
    categoriesList.value = (resp.data?.data) || (Array.isArray(resp.data) ? resp.data : []);
    console.log('Categories loaded:', categoriesList.value.length, 'items');
    console.log('Main categories:', mainCategories.value);
  } catch (err) {
    console.error('Failed to fetch categories:', err);
  }
};

// Reset form
function resetCrudForm() {
  // Default ReviewDate to today if creating new
  const defaultReviewDate = formatDateInput(addMonths(new Date(), 6));
  formData.value = {
    QuestionTitle: '',
    QuestionText: '',
    ReviewDate: defaultReviewDate,
    CategoriesID: null,
    keywords: []
  };
  keywordInput.value = '';
  isEditing.value = false;
  editingId.value = null;
  console.log('Form reset, categoriesList:', categoriesList.value.length);
}

// Open modal for Add
async function openCrudModal() {
  resetCrudForm();
  await fetchCategories();
  nextTick(() => {
    if (!crudModalInstance && crudModalRef.value) {
      crudModalInstance = new Modal(crudModalRef.value, { backdrop: true, keyboard: true });
    }
    crudModalInstance?.show();
  });
}

// Open modal for Edit from Preview
async function openEditModalFromPreview() {
  if (!previewItem.value) return;
  await fetchCategories();
  isEditing.value = true;
  editingId.value = previewItem.value.QuestionsAnswersID;
  // Resolve CategoriesID: sometimes API returns name instead of ID
  const resolveCategoryId = (catVal) => {
    if (!catVal) return null;
    // 1) exact ID match
    const byId = categoriesList.value.find(c => String(c.CategoriesID) === String(catVal));
    if (byId) return byId.CategoriesID;
    // 2) match by name
    const byName = categoriesList.value.find(c => String(c.CategoriesName) === String(catVal));
    return byName ? byName.CategoriesID : null;
  };

  const rawCatVal = previewItem.value.CategoriesID
    || previewItem.value.CategoryID
    || previewItem.value.categoriesId
    || previewItem.value.categoryId
    || null;

  const catId = resolveCategoryId(rawCatVal);

  // Format ReviewDate to YYYY-MM-DD for input[type=date]
  let reviewDateStr = new Date().toISOString().split('T')[0]; // Default to today
  if (previewItem.value.ReviewDate) {
    try {
      const reviewDate = new Date(previewItem.value.ReviewDate);
      if (!isNaN(reviewDate.getTime())) {
        reviewDateStr = reviewDate.toISOString().split('T')[0];
      }
    } catch (e) {
      console.warn('Could not parse ReviewDate:', previewItem.value.ReviewDate);
    }
  }

  formData.value = {
    QuestionTitle: previewItem.value.QuestionTitle || '',
    QuestionText: previewItem.value.QuestionText || '',
    ReviewDate: reviewDateStr,
    CategoriesID: catId,
    keywords: (previewItem.value.keywords || []).map(k => k.KeywordText)
  };
  
  console.log('Edit form loaded with ReviewDate:', reviewDateStr);

  closeDrawer();
  nextTick(() => {
    if (!crudModalInstance && crudModalRef.value) {
      crudModalInstance = new Modal(crudModalRef.value, { backdrop: true, keyboard: true });
    }
    crudModalInstance?.show();
    // Scroll to ReviewDate field if editing
    if (isEditing.value) {
      nextTick(() => {
        const dateInput = crudModalRef.value?.querySelector('input[type="date"]');
        if (dateInput) {
          dateInput.focus();
          dateInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }
  });
}

function hideCrudModal() {
  if (crudModalInstance) crudModalInstance.hide();
  resetCrudForm();
}

// Add keyword
function addKeyword() {
  const raw = (keywordInput.value || '').trim();
  if (!raw) return;
  // Support multi-add when user pastes comma/semicolon/newline separated keywords
  const parts = raw.split(/[;,\n]+/).map(p => p.trim()).filter(Boolean);
  parts.forEach(part => {
    if (!formData.value.keywords.includes(part)) {
      formData.value.keywords.push(part);
    }
  });
  keywordInput.value = '';
}

// Remove keyword
function removeKeyword(index) {
  formData.value.keywords.splice(index, 1);
}

// Save (Create or Update)
const saveCrudForm = async () => {
  if (!formData.value.QuestionTitle || !formData.value.QuestionText || !formData.value.CategoriesID || !formData.value.ReviewDate) {
    toastWarning('กรุณากรอกข้อมูลให้ครบ');
    return;
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

    let response;
    if (isEditing.value && editingId.value) {
      // Update
      response = await $axios.put(`/questionsanswers/update/${editingId.value}`, payload);
      toastSuccess('แก้ไขสำเร็จ!', 2000);
    } else {
      // Create
      response = await $axios.post('/questionsanswers/create', payload);
      toastSuccess('เพิ่มรายการสำเร็จ!', 2000);
    }
    
    // Show warning if there are skipped stopwords
    if (response.data?.skippedKeywords && response.data.skippedKeywords.length > 0) {
      setTimeout(() => {
        toastWarning(`ข้ามคำสำคัญ: ${response.data.skippedKeywords.join(', ')}`, 3500);
      }, 500);
    }
    
    hideCrudModal();
    await fetchQuestionsAnswers();
  } catch (err) {
    console.error('Save failed:', err);
    const msg = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาด';
    toastError(msg, 4000);
  } finally {
    isSaving.value = false;
  }
};

// Confirm Delete from Preview
const confirmDeleteFromPreview = async () => {
  if (!previewItem.value) return;
  const id = previewItem.value.QuestionsAnswersID;
  const title = previewItem.value.QuestionTitle || 'รายการนี้';

  // Fetch related data before showing confirmation
  let relatedInfo = '';
  try {
    const previewRes = await $axios.get(`/questionsanswers/delete-preview/${id}`);
    const related = previewRes.data?.data?.relatedData;
    if (related) {
      const items = [];
      if (related.keywords > 0) items.push(`🏷️ Keywords ที่เชื่อมโยง: <strong>${related.keywords}</strong> รายการ`);
      if (related.chatLogs > 0) items.push(`💬 ประวัติการสนทนา: <strong>${related.chatLogs}</strong> รายการ`);
      if (related.feedbacks > 0) items.push(`⭐ Feedback จากผู้ใช้: <strong>${related.feedbacks}</strong> รายการ`);
      
      if (items.length > 0) {
        relatedInfo = `
          <div class="alert alert-warning text-start mt-3 mb-0" style="font-size: 0.9rem;">
            <strong>⚠️ ข้อมูลที่จะถูกลบไปด้วย:</strong>
            <ul class="mb-0 mt-2 ps-3">
              ${items.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
        `;
      }
    }
  } catch (err) {
    console.warn('Could not fetch delete preview:', err);
  }

  const result = await $swal?.fire({
    title: 'ยืนยันการลบ?',
    html: `คุณต้องการลบ <strong>"${title}"</strong> หรือไม่?<br><small class="text-muted">ID: ${id}</small>${relatedInfo}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'ลบ',
    cancelButtonText: 'ยกเลิก'
  });

  if (result?.isConfirmed) {
    try {
      await $axios.delete(`/questionsanswers/delete/${id}`);
      toastSuccess('ลบสำเร็จ!', 2000);
      closeDrawer();
      await fetchQuestionsAnswers();
    } catch (err) {
      console.error('Delete failed:', err);
      const msg = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาด';
      toastError(msg, 4000);
    }
  }
};

// Same palette as dashboard questions/keywords badges
const tagColors = ['#007bff', '#28A745', '#DC3545', '#FFC107', '#6c757d', '#17a2b8', '#8e44ad', '#e67e22'];

// Filter main categories (หมวดหมู่หลัก) - ID ไม่มี "-" (เช่น 1, 2, 3)
const mainCategories = computed(() => {
  const main = categoriesList.value.filter(cat => {
    const id = String(cat.CategoriesID ?? '');
    // Main = ID ไม่มี "-" (เช่น "1", "2", "3")
    return !id.includes('-');
  });
  // Sort by CategoriesID (1, 2, 3, ...)
  return main.sort((a, b) => {
    const idA = String(a.CategoriesID ?? '');
    const idB = String(b.CategoriesID ?? '');
    return idA.localeCompare(idB, undefined, { numeric: true });
  });
});

// All sub categories (หมวดหมู่ย่อยทั้งหมด)
const allSubCategories = computed(() => {
  const subs = categoriesList.value.filter(cat => {
    const parent = String(cat.ParentCategoriesID ?? '').trim();
    const id = String(cat.CategoriesID ?? '').trim();
    // Sub category = has parent AND parent != self
    return parent && parent !== id;
  });
  // Sort by parent first, then by ID
  return subs.sort((a, b) => {
    const parentA = String(a.ParentCategoriesID ?? '');
    const parentB = String(b.ParentCategoriesID ?? '');
    const cmp = parentA.localeCompare(parentB, undefined, { numeric: true });
    if (cmp !== 0) return cmp;
    const idA = String(a.CategoriesID ?? '');
    const idB = String(b.CategoriesID ?? '');
    return idA.localeCompare(idB, undefined, { numeric: true });
  });
});

// Get sub categories for a specific parent (ID มี "-" และขึ้นต้นด้วย parentId)
function getSubsByParent(parentId) {
  const pId = String(parentId ?? '');
  return categoriesList.value
    .filter(cat => {
      const id = String(cat.CategoriesID ?? '');
      // Sub = ID starts with parentId + "-" (เช่น "1-1", "1-2" for parent "1")
      return id.startsWith(pId + '-');
    })
    .sort((a, b) => {
      const idA = String(a.CategoriesID ?? '');
      const idB = String(b.CategoriesID ?? '');
      return idA.localeCompare(idB, undefined, { numeric: true });
    });
}

// Sorted categories for dropdown (Main → Subs grouped)
const sortedCategoriesForDropdown = computed(() => {
  const result = [];
  console.log('Building dropdown, mainCategories:', mainCategories.value);
  // Loop through each main category
  for (const main of mainCategories.value) {
    // Add main category
    result.push({
      ...main,
      isMain: true
    });
    // Add its sub categories
    const subs = getSubsByParent(main.CategoriesID);
    console.log(`Subs for ${main.CategoriesID}:`, subs);
    for (const sub of subs) {
      result.push({
        ...sub,
        isMain: false
      });
    }
  }
  console.log('Final sorted dropdown:', result);
  return result;
});

function openAddModal() {
  uploadedFile.value = null;
  nextTick(() => {
    if (!bsModalInstance && bsModalRef.value) {
      bsModalInstance = new Modal(bsModalRef.value, { backdrop: true, keyboard: true });
    }
    bsModalInstance?.show();
  });
}
function hideModal() {
  if (bsModalInstance) bsModalInstance.hide();
  // Accessibility fix: blur active element if inside modal
  nextTick(() => {
    const active = document.activeElement;
    // ตรวจสอบว่ามี focus อยู่ใน modal ใด modal หนึ่ง (addOrgModal หรือ templateModal)
    if (
      (active && bsModalRef.value && bsModalRef.value.contains(active)) ||
      (active && templateModalRef.value && templateModalRef.value.contains(active))
    ) {
      active.blur();
    }
  });
}

function onFileChange(e) {
  const f = e.target.files?.[0];
  if (!f) return;
  if (!f.name.toLowerCase().endsWith('.csv')) {
    toastError('Invalid file: Please upload a CSV file.');
    return;
  }
  uploadedFile.value = f;
  if (e.target) e.target.value = '';
}
function onFileDrop(e) {
  const f = e.dataTransfer?.files?.[0];
  if (!f) return;
  if (!f.name.toLowerCase().endsWith('.csv')) {
    toastError('Invalid file: Please upload a CSV file.');
    return;
  }
  uploadedFile.value = f;
}

const saveUpload = async () => {
  if (!uploadedFile.value || !$axios) return;
  
  console.log('🚀 Starting upload...', {
    fileName: uploadedFile.value.name,
    fileSize: uploadedFile.value.size,
    fileType: uploadedFile.value.type
  });
  
  isUploading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', uploadedFile.value);
    
    console.log('📤 Sending file to /questionsanswers/upload...');
    const resp = await $axios.post('/questionsanswers/upload', formData, { 
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000
    });
    
    console.log('✅ Upload response:', resp.data);
    toastSuccess(resp.data?.message || 'Upload successful!');
    await fetchQuestionsAnswers();
    hideModal();
  } catch (err) {
    console.error('❌ Upload failed:', err);
    console.error('Error response:', err.response?.data);
    console.error('Error status:', err.response?.status);
    const payload = err.response?.data || {};
    const serverMessage = payload?.message || err.message || 'An error occurred during upload.';
    const detail = payload?.detail;

    // Build minimal toast HTML: detail then message
    let html = '';
    if (detail) {
      html += `<div><strong>detail:</strong><pre style="white-space:pre-wrap;margin:0;">${detail}</pre></div>`;
    }
    html += `<div class="mt-2"><strong>message:</strong> "${serverMessage}"</div>`;

    $swal?.fire({
      icon: 'error',
      title: 'Upload Failed',
      html,
      position: 'bottom-end',
      toast: true,
      timer: 3000,
      showConfirmButton: false,
    });

    // keep error state (plain text) for logging if needed
    error.value = (detail ? detail + '\n' : '') + serverMessage;
     } finally {
       isUploading.value = false;
      console.log('🏁 Upload process finished');
     }
};

const fetchQuestionsAnswers = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await $axios.get('/questionsanswers');
    questionsAnswers.value = Array.isArray(response.data) ? response.data : (response.data?.data || []);
  } catch (err) {
    console.error('Failed to fetch questionsanswers:', err);
    // Build a detailed error message for the UI alert
    const status = err.response?.status;
    const serverData = err.response?.data;
    const serverMsg =
      serverData?.message ||
      (typeof serverData === 'string' ? serverData : (serverData && Object.keys(serverData).length ? JSON.stringify(serverData) : null));
    error.value = status
      ? `Error ${status}: ${serverMsg || err.message || 'Server returned an error.'}`
      : (err.message || 'Failed to load questionsanswers data.');
  } finally {
    loading.value = false;
  }
};

// Defensive questions list (keywords already included in API response)
const allQuestions = computed(() => Array.isArray(questionsAnswers.value) ? questionsAnswers.value : []);

// categories name safe map
const categoriesNameMapSafe = computed(() => props.categoriesNameMap || {});

// filtered by search: include keywords from item.keywords
const filteredQuestions = computed(() => {
  const q = (searchQuery.value || '').toString().trim().toLowerCase();
  if (!q) return allQuestions.value;
  return allQuestions.value.filter(item => {
    const id = item.QuestionsAnswersID != null ? String(item.QuestionsAnswersID).toLowerCase() : '';
    const title = item.QuestionTitle ? String(item.QuestionTitle).toLowerCase() : '';
    const text = item.QuestionText ? String(item.QuestionText).toLowerCase() : '';
    const keywordsStr = item.keywords ? item.keywords.map(k => k.KeywordText).join(' ').toLowerCase() : '';
    const catName = (categoriesNameMapSafe.value[item.CategoriesID] || item.CategoriesID || '').toString().toLowerCase();
    const reviewDate = item.ReviewDate ? String(item.ReviewDate).toLowerCase() : '';
    return id.includes(q) || title.includes(q) || text.includes(q) || keywordsStr.includes(q) || catName.includes(q) || reviewDate.includes(q);
  });
});

// pagination computed
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
  const maxButtons = 4;
  if (total <= maxButtons) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 2) return [1,2,3,4];
  if (current >= total - 1) return [total-3, total-2, total-1, total];
  return [current-1, current, current+1, current+2];
});

function goToPage(page) { if (page>=1 && page<=totalPages.value) currentPage.value = page; }
function prevPage() { goToPage(Math.max(1, currentPage.value - 1)); }
function nextPage() { goToPage(Math.min(totalPages.value, currentPage.value + 1)); }
function firstPage() { goToPage(1); }
function lastPage() { goToPage(totalPages.value); }

watch(searchQuery, () => { currentPage.value = 1; });

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

onMounted(() => {
  unbindSidebarResize = bindSidebarResize();

  // init tooltips
  initTooltips();

  const token = localStorage.getItem("userToken");
  const type = localStorage.getItem("userType");
  const userInfoString = localStorage.getItem("userInfo");

  if (!token) {
    router.replace({ name: "login" });
    return;
  }

  if (type) userType.value = type;
  if (userInfoString) {
    try { userInfoObject.value = JSON.parse(userInfoString); } catch(e) { console.error(e); }
  }

  fetchQuestionsAnswers();
});

onUnmounted(() => {
  if (typeof unbindSidebarResize === 'function') unbindSidebarResize();
  if (bsModalInstance) { try { bsModalInstance.dispose(); } catch(e) {} bsModalInstance = null; }
  if (templateModalInstance) { try { templateModalInstance.dispose(); } catch(e) {} templateModalInstance = null; }
  if (previewModalInstance) { try { previewModalInstance.dispose(); } catch(e) {} previewModalInstance = null; }
  if (crudModalInstance) { try { crudModalInstance.dispose(); } catch(e) {} crudModalInstance = null; }
});

// เพิ่มฟังก์ชันเปิด modal template
function openTemplateModal() {
  if (!templateModalInstance && templateModalRef.value) {
    templateModalInstance = new Modal(templateModalRef.value, { backdrop: true, keyboard: true });
  }
  templateModalInstance?.show();
}
function closeTemplateModal() {
  templateModalInstance?.hide();
}

const downloadTemplateFile = async () => {
  if (isDownloadingTemplate.value) return;
  isDownloadingTemplate.value = true;
  try {
    const response = await $axios.get('/questionsanswers/template', { responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', 'questionsanswers_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toastSuccess('ดาวน์โหลดสำเร็จ!');
  } catch (err) {
    console.error('Failed to download template:', err);
    toastError('ดาวน์โหลดไม่สำเร็จ: ไม่สามารถดาวน์โหลดไฟล์ Template ได้');
  } finally {
    isDownloadingTemplate.value = false;
  }
};

const exportCurrentDataAsCsv = () => {
  if (!questionsAnswers.value || questionsAnswers.value.length === 0) {
    toastWarning('No data to export.');
    return;
  }

  isDownloadingFile.value = true;
  try {
    const headers = ['QuestionTitle', 'QuestionText', 'ReviewDate', 'CategoriesID', 'Keywords'];
    const rows = questionsAnswers.value.map(item => {
      const title = `"${(item.QuestionTitle || '').replace(/"/g, '""')}"`;
      const text = `"${(item.QuestionText || '').replace(/"/g, '""')}"`;
      const reviewDate = item.ReviewDate ? new Date(item.ReviewDate).toISOString().split('T')[0] : '';
      const categoryId = item.CategoriesID || '';
      const keywords = (item.keywords || []).map(k => k.KeywordText).join(',');
      return [title, text, reviewDate, categoryId, `"${keywords}"`].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', 'questions_answers_export.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toastSuccess('Data exported successfully!');
  } catch (err) {
    console.error('Export error', err);
    toastError('Could not export data.');
  } finally {
    isDownloadingFile.value = false;
  }
};
</script>

<style scoped>
@import '@/assets/dashboard-styles.css';
@import '@/assets/main.css';
@import '@/assets/pagination-styles.css';
@import '@/assets/sidebar.css';

/* ===== Apple-Style Design System ===== */
:root {
  --apple-blue: #007AFF;
  --apple-green: #34C759;
  --apple-red: #FF3B30;
  --apple-gray: #8E8E93;
  --apple-light-gray: #F2F2F7;
  --apple-bg: #FFFFFF;
  --apple-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  --apple-shadow-hover: 0 8px 32px rgba(0, 0, 0, 0.12);
  --apple-radius: 12px;
  --apple-transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

/* Adjust top spacing to be smaller */
.dashboard-container {
  display: flex;
  width: 100%;
  min-height: 100vh;
}

/* reduced top padding so content sits closer to top */
.main-content {
  flex-grow: 1;
  background-color: var(--apple-light-gray);
  overflow-x: hidden;
  padding-top: 0.5rem;
}

/* override template pt-4 to a smaller value */
.main-content .container-fluid {
  padding-top: 0.5rem !important;
  padding-left: 1rem;
  padding-right: 1rem;
}

/* ===== Page Title ===== */
.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.5px;
}

/* ===== Add Button - Apple Style ===== */
.btn-add-apple {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 24px;
  border: none;
  background: linear-gradient(135deg, #007AFF 0%, #0056CC 100%);
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--apple-transition);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.btn-add-apple:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 122, 255, 0.4);
}

.btn-add-apple:active {
  transform: scale(0.98);
}

.btn-add-apple i {
  font-size: 1rem;
}

/* ===== Upload Button - Apple Style ===== */
.btn-upload-apple {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: var(--apple-light-gray);
  color: var(--apple-gray);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--apple-transition);
}

.btn-upload-apple:hover {
  background: #E5E5EA;
  color: var(--apple-blue);
  transform: scale(1.05);
}

.btn-upload-apple i {
  font-size: 1.1rem;
}

/* ===== Search Container - Apple Style ===== */
.search-container {
  position: relative;
  width: 100%;
  max-width: 360px;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 44px;
  border-radius: 12px;
  border: 1px solid #E5E5EA;
  background: white;
  font-size: 0.95rem;
  transition: var(--apple-transition);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.search-input:focus {
  outline: none;
  border-color: var(--apple-blue);
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.15);
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--apple-gray);
  font-size: 1rem;
}

.search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--apple-gray);
  cursor: pointer;
  padding: 4px;
  transition: var(--apple-transition);
}

.search-clear:hover {
  color: var(--apple-red);
}

/* ===== Apple Card Style ===== */
.bg-white.shadow-apple {
  background: var(--apple-bg) !important;
  border-radius: var(--apple-radius) !important;
  box-shadow: var(--apple-shadow) !important;
  overflow: hidden;
  transition: var(--apple-transition);
}

/* Ensure consistent table styling */
.table {
  width: 100%;
  margin-bottom: 0;
  color: #1d1d1f;
}

.table th {
  font-weight: 600;
  color: var(--apple-gray);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-top: none !important;
  border-bottom: 1px solid #E5E5EA !important;
  padding: 1rem 0.75rem;
}

.table td {
  padding: 0.875rem 0.75rem;
  vertical-align: middle;
  border-top: none;
  border-bottom: 1px solid #F2F2F7;
}

/* ===== Row Hover Effect - Apple Style ===== */
.table tbody tr {
  transition: var(--apple-transition);
}

.table tbody tr:hover {
  background-color: rgba(0, 122, 255, 0.04) !important;
}

/* ===== Pagination - Apple Style ===== */
.pagination {
  gap: 4px;
}

.pagination .page-link {
  border: none;
  border-radius: 8px !important;
  padding: 8px 14px;
  color: #1d1d1f;
  font-weight: 500;
  transition: var(--apple-transition);
  background: transparent;
}

.pagination .page-link:hover {
  background: var(--apple-light-gray);
  color: var(--apple-blue);
}

.pagination .page-item.active .page-link {
  background: var(--apple-blue);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.pagination .page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
  background-color: transparent;
}

/* ===== Apple Modal Style ===== */
.apple-modal {
  border: none !important;
  border-radius: 16px !important;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.2) !important;
  animation: modalSlideIn 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.apple-modal .modal-title {
  font-weight: 600;
  font-size: 1.25rem;
  color: #1d1d1f;
}

.apple-modal .form-control,
.apple-modal .form-select {
  border-radius: 10px;
  border: 1px solid #E5E5EA;
  padding: 12px 16px;
  font-size: 0.95rem;
  transition: var(--apple-transition);
}

.apple-modal .form-control:focus,
.apple-modal .form-select:focus {
  border-color: var(--apple-blue);
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.15);
}

.apple-modal .form-label {
  font-size: 0.875rem;
  color: #86868B;
  margin-bottom: 8px;
}

.apple-modal .btn {
  padding: 12px 24px;
  font-weight: 500;
  border-radius: 12px !important;
  transition: var(--apple-transition);
}

.apple-modal .btn-primary {
  background: linear-gradient(135deg, #007AFF 0%, #0056CC 100%);
  border: none;
}

.apple-modal .btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 122, 255, 0.4);
}

.apple-modal .btn-secondary {
  background: var(--apple-light-gray);
  border: none;
  color: #1d1d1f;
}

.apple-modal .btn-secondary:hover {
  background: #E5E5EA;
}

/* ===== Upload Drop Area - Apple Style ===== */
.upload-drop-area-apple {
  border: 2px dashed #E5E5EA;
  border-radius: 16px;
  padding: 2.5rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: var(--apple-transition);
  background: linear-gradient(180deg, #FAFAFA 0%, #F5F5F7 100%);
}

.upload-drop-area-apple:hover {
  border-color: var(--apple-blue);
  background: linear-gradient(180deg, #F0F7FF 0%, #E8F2FF 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 122, 255, 0.1);
}

.upload-drop-area-apple.has-file {
  border-color: var(--apple-green);
  background: linear-gradient(180deg, #F0FFF4 0%, #E8FFE8 100%);
}

.upload-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #007AFF 0%, #0056CC 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  transition: var(--apple-transition);
}

.upload-drop-area-apple:hover .upload-icon-wrapper {
  transform: scale(1.1);
  box-shadow: 0 8px 24px rgba(0, 122, 255, 0.3);
}

.upload-icon-wrapper i {
  font-size: 1.75rem;
  color: white;
}

.upload-text {
  font-size: 1rem;
  color: #1d1d1f;
  margin-bottom: 0.5rem;
}

.upload-text strong {
  color: var(--apple-blue);
}

.upload-text .file-selected {
  color: var(--apple-green);
  font-weight: 600;
}

.upload-hint {
  font-size: 0.8rem;
  color: var(--apple-gray);
}

/* ===== Apple Secondary Button ===== */
.btn-apple-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 12px;
  border: none;
  background: var(--apple-light-gray);
  color: #1d1d1f;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--apple-transition);
}

.btn-apple-secondary:hover:not(:disabled) {
  background: #E5E5EA;
  transform: translateY(-1px);
}

.btn-apple-secondary:active {
  transform: scale(0.98);
}

.btn-apple-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-header {
  border-bottom: none;
}

.modal-footer {
  border-top: none;
}

.modal-footer {
  border-top: none;
}

/* Fixed header and footer for CRUD modal when content is long */
.modal-with-fixed-buttons {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header-sticky {
  flex-shrink: 0;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 10;
  border-bottom: 1px solid #dee2e6 !important;
}

.modal-footer-sticky {
  flex-shrink: 0;
  position: sticky;
  bottom: 0;
  background: #fff;
  z-index: 10;
  border-top: 1px solid #dee2e6 !important;
}

.modal-body-scrollable {
  flex: 1 1 auto;
  overflow-y: auto;
  max-height: calc(90vh - 120px);
}

/* Buttons */
.btn-outline-secondary {
  color: #6c757d;
  border-color: #6c757d;
}

.btn-outline-secondary:hover {
  color: #fff;
  background-color: #6c757d;
  border-color: #6c757d;
}

.btn-black {
  background-color: #000;
  color: #fff;
  border: none;
}

.btn-black:hover {
  background-color: #333;
}

/* Question text cell styling */
.question-text-cell {
  white-space: normal;
  word-break: break-word;
  border-radius: 4px;
  padding: 4px 8px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.whitespace-prewrap {
  white-space: pre-wrap;
  word-break: break-word;
}

/* Apple-style animations and effects */
.apple-card {
  transition: var(--apple-transition);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95) !important;
  border-radius: var(--apple-radius) !important;
  box-shadow: var(--apple-shadow) !important;
}

.apple-card:hover {
  box-shadow: var(--apple-shadow-hover);
}

.apple-table tbody tr.apple-row {
  transition: var(--apple-transition);
  cursor: pointer;
}

.apple-table tbody tr.apple-row:hover {
  background: linear-gradient(90deg, rgba(0, 122, 255, 0.04) 0%, rgba(0, 122, 255, 0.08) 100%) !important;
}

.apple-table tbody tr.apple-row:active {
  background: rgba(0, 122, 255, 0.1) !important;
  transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
}

.apple-btn {
  transition: var(--apple-transition);
  border: none;
  font-weight: 500;
  letter-spacing: 0.02em;
  border-radius: 20px !important;
}

.apple-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.apple-btn:active {
  transform: scale(0.98);
}

.btn-apple-primary {
  background: linear-gradient(135deg, #007aff 0%, #005ecb 100%);
  color: white;
}

.btn-apple-primary:hover {
  background: linear-gradient(135deg, #0062cc 0%, #004a99 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 122, 255, 0.4);
}

.apple-modal {
  backdrop-filter: blur(20px);
}

.apple-modal-content {
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95) !important;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15), 0 15px 30px rgba(0, 0, 0, 0.1);
  animation: appleModalSlide 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes appleModalSlide {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.question-text-cell {
  transition: var(--apple-transition);
}

.apple-row:hover .question-text-cell {
  color: var(--apple-blue);
}

/* tag-badge styles */
.tag-badge {
  display: inline-block;
  color: #fff;
  padding: 4px 10px;
  font-size: 0.8rem;
  border-radius: 20px;
  line-height: 1;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: var(--apple-transition);
}

.tag-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}
.tag-badge.me-1 { margin-right: 0.25rem; }
.tag-badge.mb-1 { margin-bottom: 0.25rem; }

/* Apple Drawer Styles */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1049;
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.apple-drawer {
  position: fixed;
  top: 0;
  right: -480px;
  width: 480px;
  max-width: 90vw;
  height: 100vh;
  background: #ffffff;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
  z-index: 1050;
  transition: right 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.apple-drawer.drawer-open {
  right: 0;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: linear-gradient(180deg, #ffffff 0%, #fafafa 100%);
  backdrop-filter: blur(10px);
}

.drawer-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.btn-close-drawer {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.06);
  color: #1d1d1f;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-close-drawer:hover {
  background: rgba(0, 0, 0, 0.12);
  transform: rotate(90deg);
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  padding-bottom: 0;
}

.drawer-footer {
  flex-shrink: 0;
  padding: 16px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
  backdrop-filter: blur(10px);
}

.drawer-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.drawer-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.drawer-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #86868b;
  margin-bottom: 8px;
}

.drawer-value {
  font-size: 1rem;
  color: #1d1d1f;
  line-height: 1.6;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* ===== Apple-Style Feedback Stats ===== */
.feedback-stat-container {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 4px;
}

.feedback-stat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

/* Like Stats */
.feedback-stat.like-stat {
  background: rgba(52, 199, 89, 0.1);
  color: #34C759;
  border: 1.5px solid rgba(52, 199, 89, 0.2);
}

.feedback-stat.like-stat.zero-count {
  background: rgba(142, 142, 147, 0.08);
  color: #8E8E93;
  border: 1.5px solid rgba(142, 142, 147, 0.12);
}

.feedback-stat.like-stat.has-count {
  background: linear-gradient(135deg, rgba(52, 199, 89, 0.15) 0%, rgba(52, 199, 89, 0.08) 100%);
  box-shadow: 
    0 2px 8px rgba(52, 199, 89, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.feedback-stat.like-stat:hover {
  background: linear-gradient(135deg, rgba(52, 199, 89, 0.25) 0%, rgba(52, 199, 89, 0.15) 100%);
  border-color: rgba(52, 199, 89, 0.35);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 
    0 4px 16px rgba(52, 199, 89, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

/* Unlike Stats */
.feedback-stat.unlike-stat {
  background: rgba(255, 59, 48, 0.1);
  color: #FF3B30;
  border: 1.5px solid rgba(255, 59, 48, 0.2);
}

.feedback-stat.unlike-stat.zero-count {
  background: rgba(142, 142, 147, 0.08);
  color: #8E8E93;
  border: 1.5px solid rgba(142, 142, 147, 0.12);
}

.feedback-stat.unlike-stat.has-count {
  background: linear-gradient(135deg, rgba(255, 59, 48, 0.15) 0%, rgba(255, 59, 48, 0.08) 100%);
  box-shadow: 
    0 2px 8px rgba(255, 59, 48, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.feedback-stat.unlike-stat:hover {
  background: linear-gradient(135deg, rgba(255, 59, 48, 0.25) 0%, rgba(255, 59, 48, 0.15) 100%);
  border-color: rgba(255, 59, 48, 0.35);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 
    0 4px 16px rgba(255, 59, 48, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

/* Icon Wrapper with Pulse Animation */
.feedback-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.feedback-stat.like-stat .feedback-icon-wrapper {
  background: rgba(52, 199, 89, 0.15);
}

.feedback-stat.unlike-stat .feedback-icon-wrapper {
  background: rgba(255, 59, 48, 0.15);
}

.feedback-stat.zero-count .feedback-icon-wrapper {
  background: rgba(142, 142, 147, 0.1);
}

.feedback-stat:hover .feedback-icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}

.feedback-stat.like-stat:hover .feedback-icon-wrapper {
  background: rgba(52, 199, 89, 0.25);
  box-shadow: 0 0 12px rgba(52, 199, 89, 0.4);
}

.feedback-stat.unlike-stat:hover .feedback-icon-wrapper {
  background: rgba(255, 59, 48, 0.25);
  box-shadow: 0 0 12px rgba(255, 59, 48, 0.4);
}

/* SVG Icon Styling */
.feedback-icon {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.feedback-stat.like-stat .feedback-icon {
  fill: #34C759;
  filter: drop-shadow(0 1px 2px rgba(52, 199, 89, 0.3));
}

.feedback-stat.unlike-stat .feedback-icon {
  fill: #FF3B30;
  filter: drop-shadow(0 1px 2px rgba(255, 59, 48, 0.3));
}

.feedback-stat.zero-count .feedback-icon {
  fill: #8E8E93;
  filter: none;
  opacity: 0.6;
}

.feedback-stat:hover .feedback-icon {
  filter: drop-shadow(0 2px 4px currentColor);
  transform: scale(1.1);
}

/* Count Badge */
.feedback-count {
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  min-width: 20px;
  text-align: center;
  font-weight: 600;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.feedback-stat:hover .feedback-count {
  transform: scale(1.1);
  font-weight: 700;
}

/* Pulse Animation for Active Stats */
.feedback-stat.has-count::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 20px;
  padding: 2px;
  background: linear-gradient(45deg, currentColor, transparent);
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.feedback-stat.has-count:hover::before {
  opacity: 0.3;
  animation: pulse-ring 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
}

/* Shimmer Effect on Hover */
.feedback-stat.has-count::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  transition: left 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.feedback-stat.has-count:hover::after {
  left: 100%;
}

/* Active/Click Animation */
.feedback-stat:active {
  transform: translateY(-1px) scale(0.98);
  transition-duration: 0.1s;
}

/* Tooltip Enhancement */
.feedback-stat[data-bs-toggle="tooltip"] {
  position: relative;
}

/* Accessibility: Focus States */
.feedback-stat:focus-visible {
  outline: 2px solid #007AFF;
  outline-offset: 2px;
}

/* Number Animation on Update */
@keyframes number-pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

.feedback-count.updated {
  animation: number-pop 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Responsive Design */
@media (max-width: 991.98px) {
  .feedback-stat {
    padding: 5px 10px;
    gap: 5px;
    font-size: 0.8rem;
  }
  
  .feedback-icon-wrapper {
    width: 20px;
    height: 20px;
  }
  
  .feedback-icon {
    width: 16px;
    height: 16px;
  }
}

@media (max-width: 767.98px) {
  .feedback-stat-container {
    justify-content: flex-start;
    padding: 2px;
  }
  
  .feedback-stat {
    padding: 4px 8px;
    font-size: 0.75rem;
  }
}

@media (max-width: 768px) {
  .apple-drawer {
    width: 100vw;
    max-width: 100vw;
    right: -100vw;
  }
}

/* Responsive adjustments */
@media (max-width: 767.98px) {
  .table-responsive > .table thead {
    display: none;
  }

  .table-responsive > .table tbody,
  .table-responsive > .table tr {
    display: block;
    width: 100%;
  }

  .table-responsive > .table tr {
    margin-bottom: 1rem;
    border: 1px solid #dee2e6;
    border-radius: 0.5rem;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  }

  .table-responsive > .table td {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem;
/* CRUD Modal and Drawer Styles */
.drawer-actions {
  /* Removed padding-top and border-top as they're handled by drawer-footer */
}   font-weight: bold;
    color: #6c757d;
  }
}

/* CRUD Modal and Drawer Styles */
.drawer-actions {
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.cursor-pointer {
  cursor: pointer;
}

.keywords-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.keywords-tags .tag-badge i {
  cursor: pointer;
  opacity: 0.7;
}

.keywords-tags .tag-badge i:hover {
  opacity: 1;
}
</style>
