<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <Sidebar :userType="userType" :userInfoObject="userInfoObject" />

    <!-- Main Content -->
    <main class="main-content">
      <div class="container-fluid pt-4 px-4">
        <div v-if="categoriesLoading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Loading categories data...</p>
        </div>

        <div v-else>
          <div class="d-block d-md-flex align-items-center justify-content-between mb-4">
            <div class="d-flex align-items-center gap-3">
              <h2 class="page-title m-0">จัดการหมวดหมู่</h2>
              <button class="btn-add-apple" @click="openCrudModal" title="เพิ่มหมวดหมู่ใหม่">
                <i class="bi bi-plus-lg"></i>
                <span>เพิ่มหมวดหมู่</span>
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
                placeholder="ค้นหาหมวดหมู่..."
                v-model="searchQueryCategories"
              />
              <button v-if="searchQueryCategories" class="search-clear" @click="searchQueryCategories = ''">
                <i class="bi bi-x-circle-fill"></i>
              </button>
            </div>
          </div>

          <div class="bg-white shadow-apple rounded-0 overflow-hidden">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th class="fw-bold py-3 ps-3"></th>
                    <th class="fw-bold py-3">CategoriesID</th>
                    <th class="fw-bold py-3">CategoriesName</th>
                    <th class="fw-bold py-3">Parent</th>
                    <th class="fw-bold py-3">CategoriesPDF</th>
                    <th class="fw-bold py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(cat, idx) in visibleParents" :key="cat.CategoriesID">
                    <tr class="align-middle" :class="isMain(cat) ? 'bg-primary-subtle' : ''">
                      <td class="py-3 ps-3"></td>
                      <td class="py-3 cat-id-cell">
                        <div class="d-flex align-items-center">
                          <div class="me-2" style="width:22px; display:flex; justify-content:center;">
                            <template v-if="hasSubCategories(cat.CategoriesID, cat.CategoriesID)">
                              <button class="btn btn-link btn-sm p-0" @click="toggleExpand(cat.CategoriesID)" style="font-size:1.0rem;">
                                <i :class="expandedMap[cat.CategoriesID] ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
                              </button>
                            </template>
                            <template v-else>
                              <span aria-hidden="true" style="display:inline-block; width:14px;"></span>
                            </template>
                          </div>
                          <div>{{ cat.CategoriesID }}</div>
                        </div>
                      </td>
                      <td class="py-3">{{ cat.CategoriesName }}</td>
                      <td class="py-3">
                        <span :class="isMain(cat) ? 'badge bg-primary' : 'badge bg-info'">
                          {{ isMain(cat) ? 'main' : 'sub' }}
                        </span>
                      </td>
                      <td class="py-3">
                        <template v-if="cat.CategoriesPDF">
                          <a href="#" @click.prevent="openFile(cat.CategoriesPDF, cat.CategoriesName)" class="d-inline-flex align-items-center text-decoration-none">
                            <i :class="pdfIconClass(cat.CategoriesPDF) + ' me-2'"></i>
                            <span class="small">Read file</span>
                          </a>
                        </template>
                        <span v-else class="text-muted">-</span>
                      </td>
                      <td class="py-3 text-center">
                        <div class="row-actions">
                          <button class="action-btn action-btn-edit" @click.stop="openEditModal(cat)" title="แก้ไข">
                            <i class="bi bi-pencil-square"></i>
                          </button>
                          <button class="action-btn action-btn-delete" @click.stop="confirmDelete(cat)" title="ลบ">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      v-for="sub in expandedMap[cat.CategoriesID] ? subCategories(cat.CategoriesID, cat.CategoriesID) : []"
                      :key="sub.CategoriesID"
                      class="bg-light align-middle sub-row"
                    >
                      <td class="py-3"></td>
                      <td class="py-3 cat-id-cell cat-id-sub">
                        <div class="d-flex align-items-center">
                          <div class="me-2" style="width:22px; display:flex; justify-content:center;">
                            <span aria-hidden="true" style="display:inline-block; width:14px;"></span>
                          </div>
                          <div>{{ sub.CategoriesID }}</div>
                        </div>
                      </td>
                      <td class="py-3">{{ sub.CategoriesName }}</td>
                      <td class="py-3"><span class="badge bg-info">sub</span></td>
                      <td class="py-3">
                        <template v-if="sub.CategoriesPDF">
                          <a href="#" @click.prevent="openFile(sub.CategoriesPDF, sub.CategoriesName)" class="d-inline-flex align-items-center text-decoration-none">
                            <i :class="pdfIconClass(sub.CategoriesPDF) + ' me-2'"></i>
                            <span class="small">Read file</span>
                          </a>
                        </template>
                        <span v-else class="text-muted">-</span>
                      </td>
                      <td class="py-3 text-center">
                        <div class="row-actions">
                          <button class="action-btn action-btn-edit" @click.stop="openEditModal(sub)" title="แก้ไข">
                            <i class="bi bi-pencil-square"></i>
                          </button>
                          <button class="action-btn action-btn-delete" @click.stop="confirmDelete(sub)" title="ลบ">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </template>

                  <tr v-if="visibleParents.length === 0">
                    <td colspan="6" class="text-center text-muted py-3">No categories data found</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination footer -->
            <div class="d-flex justify-content-between align-items-center p-3">
              <div class="small text-muted">
                Showing {{ categoriesStartIndex }} to {{ categoriesEndIndex }} of {{ categoriesTotalEntries }} entries
              </div>
              <nav aria-label="Page navigation">
                <ul class="pagination mb-0 align-items-center">
                  <li class="page-item" :class="{ disabled: displayPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="categoriesFirstPage" aria-label="First">&laquo;</a>
                  </li>
                  <li class="page-item" :class="{ disabled: displayPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="categoriesPrevPage" aria-label="Previous">&lsaquo;</a>
                  </li>

                  <li v-for="page in localPagesToShow" :key="page" class="page-item" :class="{ active: displayPage === page }">
                    <a class="page-link page-num rounded-3" href="#" @click.prevent="categoriesGoToPage(page)">{{ page }}</a>
                  </li>

                  <li class="page-item" :class="{ disabled: displayPage === localTotalPages }">
                    <a class="page-link" href="#" @click.prevent="categoriesNextPage" aria-label="Next">&rsaquo;</a>
                  </li>
                  <li class="page-item" :class="{ disabled: displayPage === localTotalPages }">
                    <a class="page-link" href="#" @click.prevent="categoriesLastPage" aria-label="Last">&raquo;</a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- File Modal -->
    <div ref="fileModalEl" class="modal fade file-modal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content">
          <div class="file-modal-header-btns">
            <a
              v-if="modalFileUrl"
              :href="modalFileUrl"
              target="_blank"
              rel="noopener"
              class="btn file-modal-open"
              :title="'Open in new tab'"
            >
              <span aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6.364 13.657a.5.5 0 0 1 0-.707l6.647-6.647H9.5a.5.5 0 0 1 0-1h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V7.343l-6.647 6.647a.5.5 0 0 1-.707 0z"/>
                  <path d="M13.5 2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11A.5.5 0 0 1 2.5 2h11zm-11-1A1.5 1.5 0 0 0 1 2.5v11A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 13.5 1h-11z"/>
                </svg>
              </span>
            </a>
            <button type="button" class="btn file-modal-close" aria-label="Close" @click="closeModal()">
              <span aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2.146 2.146a.5.5 0 0 1 .708 0L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854a.5.5 0 0 1 0-.708z"/>
                </svg>
              </span>
            </button>
          </div>
          <div class="modal-body p-0">
            <div v-if="isPdf(modalFileUrl)" style="height:80vh;">
              <iframe :src="modalFileUrl" frameborder="0" style="width:100%; height:100%;"></iframe>
            </div>
            <div v-else class="py-4 text-center">
              <p class="mb-3">Preview not available for this file type.</p>
              <a :href="modalFileUrl" target="_blank" rel="noopener" class="btn btn-primary">Open / Download</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Modal - Apple Style -->
    <div class="modal fade" ref="bsModalRef" id="addCategoryModal" tabindex="-1" aria-labelledby="addCategoryModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content apple-modal rounded-4 p-3 shadow-lg">
          <div class="modal-header border-0">
            <div class="modal-title w-100 text-center" id="addCategoryModalLabel">
              <div class="fs-5 fw-bold">อัพโหลดไฟล์</div>
              <div class="text-muted fs-6">Categories CSV</div>
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
                        @click.prevent="downloadTemplateFile" :disabled="isDownloadingTemplate">
                  <i class="bi bi-file-earmark-text"></i>
                  <span>Template</span>
                  <span v-if="isDownloadingTemplate" class="spinner-border spinner-border-sm ms-2"></span>
                </button>

                <button type="button" class="btn-apple-secondary" @click.prevent="openTemplateModal">
                  <i class="bi bi-eye"></i>
                  <span>ดูตัวอย่าง</span>
                </button>

                <button type="button" class="btn-apple-secondary" @click.prevent="downloadLastUploadedFile" :disabled="isDownloadingFile">
                  <i class="bi bi-download"></i>
                  <span>ดาวน์โหลด</span>
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
            <h5 class="modal-title w-100 text-center" id="templateModalLabel">Template Example</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="closeTemplateModal()"></button>
          </div>
          <div class="modal-body text-center">
            <img :src="ex4Url" alt="Template Example" class="img-fluid">
          </div>
        </div>
      </div>
    </div>

    <!-- CRUD Modal for Add/Edit Category -->
    <div class="modal fade" ref="crudModalRef" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content apple-modal rounded-4 p-3 shadow-lg">
          <div class="modal-header border-0">
            <h5 class="modal-title">{{ isEditing ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่' }}</h5>
            <button type="button" class="btn-close" @click="hideCrudModal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveCrudForm">
              <div class="mb-3">
                <label class="form-label fw-bold">ชื่อหมวดหมู่ <span class="text-danger">*</span></label>
                <input type="text" class="form-control" v-model="crudFormData.CategoriesName" required placeholder="เช่น ทุนการศึกษา">
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">ประเภทหมวดหมู่</label>
                <select class="form-select" v-model="crudFormData.ParentCategoriesID">
                  <option value="">หมวดหมู่หลัก (ไม่มี Parent)</option>
                  <optgroup label="เลือกหมวดหมู่หลัก (เป็นหมวดหมู่ย่อย)">
                    <option 
                      v-for="cat in parentCategoryOptions" 
                      :key="cat.CategoriesID" 
                      :value="cat.CategoriesID"
                      :disabled="isEditing && editingId === cat.CategoriesID"
                    >
                      {{ cat.CategoriesID }} - {{ cat.CategoriesName }}
                    </option>
                  </optgroup>
                </select>
                <small class="text-muted">เลือก "หมวดหมู่หลัก" ถ้าต้องการสร้างเป็นหมวดหมู่หลัก หรือเลือกหมวดหมู่ที่ต้องการเป็น parent</small>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">ลิงก์ PDF (ถ้ามี)</label>
                <input type="url" class="form-control" v-model="crudFormData.CategoriesPDF" placeholder="https://example.com/document.pdf">
                <small class="text-muted">ใส่ URL ของไฟล์ PDF ที่เกี่ยวข้องกับหมวดหมู่นี้</small>
              </div>
            </form>
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-secondary rounded-3" @click="hideCrudModal">ยกเลิก</button>
            <button type="button" class="btn btn-primary rounded-3" @click="saveCrudForm" :disabled="isSaving">
              <span v-if="isSaving" class="spinner-border spinner-border-sm me-1"></span>
              {{ isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มหมวดหมู่' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, getCurrentInstance, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { Modal, Tooltip } from 'bootstrap';
import Sidebar from '@/components/Sidebar.vue';
import { bindSidebarResize } from '@/stores/sidebarState';
import '@/assets/sidebar.css';
import ex4Url from '@/assets/ex4.svg';

const router = useRouter();
const { appContext } = getCurrentInstance();
const { $axios, $swal } = appContext.config.globalProperties;

const userInfoObject = ref({});
const userType = ref("");

let unbindSidebarResize = null;

const searchQueryCategories = ref('');
const expanded = ref({});

// --- Categories Report Data ---
const categories = ref([]);
const categoriesLoading = ref(true);
const categoriesError = ref(null);

// upload state
const uploadedFile = ref(null);
const isUploading = ref(false);
const bsModalRef = ref(null);
let bsModalInstance = null;

const isDownloadingFile = ref(false);
const isDownloadingTemplate = ref(false);

const templateModalRef = ref(null);
let templateModalInstance = null;

// CRUD state
const crudModalRef = ref(null);
let crudModalInstance = null;
const isEditing = ref(false);
const editingId = ref(null);
const isSaving = ref(false);
const crudFormData = ref({
  CategoriesName: '',
  ParentCategoriesID: '',
  CategoriesPDF: ''
});

// Computed: list หมวดหมู่หลัก (สำหรับ dropdown เลือก parent)
const parentCategoryOptions = computed(() => {
  // หมวดหมู่หลัก = ParentCategoriesID เป็น null หรือ '' หรือเท่ากับ CategoriesID ของตัวเอง
  return (categories.value || []).filter(c => {
    const pid = String(c.ParentCategoriesID ?? '').trim();
    const cid = String(c.CategoriesID ?? '').trim();
    return !pid || pid === cid;
  });
});

function openAddModal() {
  uploadedFile.value = null;
  const el = bsModalRef.value;
  if (!el) return;
  bsModalInstance = Modal.getOrCreateInstance(el, { backdrop: 'static', keyboard: true });
  bsModalInstance.show();
}

function hideModal() {
  bsModalInstance?.hide();
}

function onFileChange(e) {
  const f = e.target.files?.[0];
  if (!f) return;
  if (!f.name.toLowerCase().endsWith('.csv')) {
    $swal?.fire({ icon: 'error', title: 'Invalid file', text: 'Please upload a CSV file.', position: 'bottom-end', toast: true, timer: 3000 });
    return;
  }
  uploadedFile.value = f;
  if (e.target) e.target.value = '';
}

function onFileDrop(e) {
  const f = e.dataTransfer?.files?.[0];
  if (!f) return;
  if (!f.name.toLowerCase().endsWith('.csv')) {
    $swal?.fire({ icon: 'error', title: 'Invalid file', text: 'Please upload a CSV file.', position: 'bottom-end', toast: true, timer: 3000 });
    return;
  }
  uploadedFile.value = f;
}

const saveUpload = async () => {
  if (!uploadedFile.value || !$axios) return;
  isUploading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', uploadedFile.value);
    const resp = await $axios.post('/categories/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    $swal?.fire({ icon: 'success', title: resp.data?.message || 'Upload successful!', position: 'bottom-end', toast: true, timer: 3000, showConfirmButton: false });
    await fetchCategories();
    hideModal();
  } catch (err) {
    console.error('Upload failed', err);
    const payload = err.response?.data || {};
    const serverMessage = payload?.message || err.message || 'An error occurred during upload.';
    const detail = payload?.detail;

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

    categoriesError.value = (detail ? detail + '\n' : '') + serverMessage;
  } finally {
    isUploading.value = false;
  }
};

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
    const response = await $axios.get('/categories/crud/template', { responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', 'categories_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    $swal?.fire({ icon: 'success', title: 'ดาวน์โหลดสำเร็จ!', position: 'bottom-end', toast: true, timer: 2000, showConfirmButton: false });
  } catch (err) {
    console.error('Failed to download template:', err);
    $swal?.fire({ icon: 'error', title: 'ดาวน์โหลดไม่สำเร็จ', text: 'ไม่สามารถดาวน์โหลดไฟล์ Template ได้', position: 'bottom-end', toast: true, timer: 3000, showConfirmButton: false });
  } finally {
    isDownloadingTemplate.value = false;
  }
};

// ======= CRUD Functions =======
function resetCrudForm() {
  crudFormData.value = {
    CategoriesName: '',
    ParentCategoriesID: '',
    CategoriesPDF: ''
  };
  isEditing.value = false;
  editingId.value = null;
}

function openCrudModal() {
  resetCrudForm();
  nextTick(() => {
    if (!crudModalInstance && crudModalRef.value) {
      crudModalInstance = new Modal(crudModalRef.value, { backdrop: true, keyboard: true });
    }
    crudModalInstance?.show();
  });
}

function openEditModal(cat) {
  isEditing.value = true;
  editingId.value = cat.CategoriesID;
  crudFormData.value = {
    CategoriesName: cat.CategoriesName || '',
    ParentCategoriesID: cat.ParentCategoriesID || '',
    CategoriesPDF: cat.CategoriesPDF || ''
  };
  nextTick(() => {
    if (!crudModalInstance && crudModalRef.value) {
      crudModalInstance = new Modal(crudModalRef.value, { backdrop: true, keyboard: true });
    }
    crudModalInstance?.show();
  });
}

function hideCrudModal() {
  if (crudModalInstance) crudModalInstance.hide();
  resetCrudForm();
}

const saveCrudForm = async () => {
  if (!crudFormData.value.CategoriesName?.trim()) {
    $swal?.fire({ icon: 'warning', title: 'กรุณากรอกชื่อหมวดหมู่', position: 'bottom-end', toast: true, timer: 3000, showConfirmButton: false });
    return;
  }
  isSaving.value = true;
  try {
    const payload = {
      categoriesName: crudFormData.value.CategoriesName.trim(),
      parentCategoriesID: crudFormData.value.ParentCategoriesID || null,
      categoriesPDF: crudFormData.value.CategoriesPDF?.trim() || null
    };

    if (isEditing.value && editingId.value) {
      // Update
      await $axios.put(`/categories/crud/update/${editingId.value}`, payload);
      $swal?.fire({ icon: 'success', title: 'แก้ไขหมวดหมู่สำเร็จ', position: 'bottom-end', toast: true, timer: 2000, showConfirmButton: false });
    } else {
      // Create
      await $axios.post('/categories/crud/create', payload);
      $swal?.fire({ icon: 'success', title: 'เพิ่มหมวดหมู่สำเร็จ', position: 'bottom-end', toast: true, timer: 2000, showConfirmButton: false });
    }

    hideCrudModal();
    await fetchCategories();
  } catch (err) {
    console.error('Save category error:', err);
    const msg = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาด';
    $swal?.fire({ icon: 'error', title: 'Error', text: msg, position: 'bottom-end', toast: true, timer: 4000, showConfirmButton: false });
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = async (cat) => {
  const result = await $swal?.fire({
    title: 'ยืนยันการลบ',
    html: `คุณต้องการลบหมวดหมู่ "<strong>${cat.CategoriesName}</strong>" หรือไม่?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'ลบ',
    cancelButtonText: 'ยกเลิก'
  });

  if (result?.isConfirmed) {
    try {
      await $axios.delete(`/categories/crud/delete/${cat.CategoriesID}`);
      $swal?.fire({ icon: 'success', title: 'ลบหมวดหมู่สำเร็จ', position: 'bottom-end', toast: true, timer: 2000, showConfirmButton: false });
      await fetchCategories();
    } catch (err) {
      console.error('Delete category error:', err);
      const msg = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาด';
      $swal?.fire({ icon: 'error', title: 'ลบไม่สำเร็จ', text: msg, position: 'bottom-end', toast: true, timer: 4000, showConfirmButton: false });
    }
  }
};

const downloadLastUploadedFile = async () => {
  if (isDownloadingFile.value) return;
  isDownloadingFile.value = true;
  try {
    const response = await $axios.get('/categories/last-upload', { responseType: 'blob' });
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'last_uploaded_categories.csv';
    if (contentDisposition) {
      const m = contentDisposition.match(/filename="?(.+)"?/);
      if (m && m[1]) filename = m[1];
    }
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to download last uploaded file:', err);
    const msg = err.response?.status === 404 ? 'No previously uploaded file found.' : 'Could not download the file.';
    $swal?.fire({ icon: 'error', title: 'Download Failed', text: msg, position: 'bottom-end', toast: true, timer: 3000, showConfirmButton: false });
  } finally {
    isDownloadingFile.value = false;
  }
};

// Fetch categories data from API
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
// Show all categories on a single page to ensure every main category (including "3") appears
const categoriesItemsPerPage = ref(100);

// Helper functions
function hideIfFour(id) {
  // Don't hide anything - we want to show all categories including "3"
  // The original logic was hiding 4-digit IDs but we don't want that
  return false;
}

function isThreeDigits(id) {
  if (id == null) return false;
  const str = String(id).trim();
  // Check if it's a single digit (1, 2, 3) or pattern like 1-1, 2-1, 2-2
  return /^\d$/.test(str) || /^\d-\d$/.test(str);
}

// Remove duplicate categories by CategoriesID (keep first occurrence)
function dedupeById(list) {
  const seen = new Set();
  return (Array.isArray(list) ? list : []).filter(item => {
    const id = String(item?.CategoriesID ?? '').trim();
    if (!id) return false;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function toggleExpand(id) {
  expanded.value[id] = !expanded.value[id];
}

const allItems = computed(() => {
  if (Array.isArray(categories.value) && categories.value.length) return categories.value;
  if (Array.isArray(filteredCategories.value) && filteredCategories.value.length) return filteredCategories.value;
  return [];
});

function itemMatchesQuery(item, q) {
  if (!item || !q) return false;
  const s = String(q || '').toLowerCase().trim().normalize('NFC');
  const id = String(item.CategoriesID ?? '').toLowerCase().trim().normalize('NFC');
  const name = String(item.CategoriesName ?? '').toLowerCase().trim().normalize('NFC');
  const parent = String(item.ParentCategoriesID ?? '').toLowerCase().trim().normalize('NFC');
  const pdf = String(item.CategoriesPDF ?? '').toLowerCase().trim().normalize('NFC');
  return id.includes(s) || name.includes(s) || parent.includes(s) || pdf.includes(s);
}

function findParentIdsForItem(item) {
  const parents = [];
  if (!item) return parents;
  const list = allItems.value;
  const parentId = String(item.ParentCategoriesID ?? '').trim();
  if (parentId && parentId !== String(item.CategoriesID ?? '').trim() && list.some(c => String(c.CategoriesID ?? '').trim() === parentId)) {
    parents.push(parentId);
  }
  const cid = String(item.CategoriesID ?? '').trim();
  if (hideIfFour(cid)) {
    const threeParent = list.find(c => isThreeDigits(String(c.CategoriesID ?? '').trim()) && cid.startsWith(String(c.CategoriesID ?? '').trim()));
    if (threeParent) parents.push(String(threeParent.CategoriesID));
  }
  if (isMain(item)) parents.push(String(item.CategoriesID));
  return [...new Set(parents)];
}

const searchTerm = computed(() => {
  const raw = searchQueryCategories.value || '';
  return String(raw).toLowerCase().trim().normalize('NFC');
});

const matchedParentIds = computed(() => {
  const q = searchTerm.value;
  if (!q) return new Set();
  const matches = allItems.value.filter(item => itemMatchesQuery(item, q));
  const ids = new Set();
  matches.forEach(item => {
    findParentIdsForItem(item).forEach(id => { if (id) ids.add(String(id)); });
  });
  return ids;
});

function subCategories(parentId, selfId) {
  const parentStr = String(parentId ?? '').trim();
  const list = allItems.value.slice();
  const q = searchTerm.value;
  return list.filter(c => {
    if (c == null) return false;
    const cid = String(c.CategoriesID ?? '').trim();
    if (String(c.CategoriesID) === String(selfId)) return false;

    if (hideIfFour(cid)) {
      const isChildOfPrefix = isThreeDigits(parentStr) && cid.startsWith(parentStr);
      if (!isChildOfPrefix) return false;
      return q ? itemMatchesQuery(c, q) : true;
    }

    const isParentMatch = String(c.ParentCategoriesID ?? '').trim() === parentStr;
    if (!isParentMatch) return false;
    return q ? itemMatchesQuery(c, q) : true;
  });
}

function hasSubCategories(parentId, selfId) {
  return subCategories(parentId, selfId).length > 0;
}

function parentExists(parentId) {
  if (parentId == null || parentId === '') return false;
  const list = Array.isArray(filteredCategories.value) && filteredCategories.value.length ? filteredCategories.value : (Array.isArray(categories.value) ? categories.value : []);
  return list.some(c => String(c?.CategoriesID ?? '').trim() === String(parentId).trim());
}

function isMain(cat) {
  if (!cat) return false;
  const id = String(cat.CategoriesID ?? '').trim();
  const parent = String(cat.ParentCategoriesID ?? '').trim();
  if (parent && parent === id) return true;
  if (!parent) return true;
  if (!parentExists(parent)) return true;
  return false;
}

// --- Categories Filtered List ---
const filteredCategories = computed(() => {
  if (!Array.isArray(categories.value)) return [];
  const data = dedupeById(categories.value);
  if (!searchQueryCategories.value) return data;
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

const visibleParents = computed(() => {
  const page = Array.isArray(paginatedCategories.value) ? paginatedCategories.value : [];
  const q = searchTerm.value;
  if (!q) {
    return page.filter(cat => {
      if (!cat) return false;
      const id = String(cat.CategoriesID ?? '').trim();
      if (hideIfFour(id)) return false;
      const parent = String(cat.ParentCategoriesID ?? '').trim();
      if (parent && parent === id) return true;
      if (!parent) return true;
      if (!parentExists(parent)) return true;
      return false;
    });
  }
  const ids = matchedParentIds.value;
  if (!ids || ids.size === 0) return [];
  const list = allItems.value || [];
  const parents = list.filter(c => {
    if (!c) return false;
    const id = String(c.CategoriesID ?? '').trim();
    if (hideIfFour(id)) return false;
    return ids.has(id);
  });
  return parents;
});

const visibleParentsTotal = computed(() => {
  const q = searchTerm.value;
  if (q) {
    const vp = Array.isArray(visibleParents.value) ? visibleParents.value : [];
    return vp.length;
  }
  const source = Array.isArray(filteredCategories.value) && filteredCategories.value.length
    ? filteredCategories.value
    : (Array.isArray(categories.value) ? categories.value : []);
  return source.filter(cat => {
    if (!cat) return false;
    const id = String(cat.CategoriesID ?? '').trim();
    if (hideIfFour(id)) return false;
    const parent = String(cat.ParentCategoriesID ?? '').trim();
    if (parent && parent === id) return true;
    if (!parent) return true;
    return !parentExists(parent);
  }).length;
});

const itemsPerPageLocal = computed(() => {
  const start = Number(categoriesStartIndex.value || 0);
  const end = Number(categoriesEndIndex.value || 0);
  if (end >= start && start > 0) return end - start + 1;
  return Array.isArray(paginatedCategories.value) ? paginatedCategories.value.length || 8 : 8;
});

const localTotalPages = computed(() => Math.max(1, Math.ceil(visibleParentsTotal.value / itemsPerPageLocal.value)));

const displayPage = computed(() => {
  const p = Number(categoriesCurrentPage.value || 1);
  return Math.min(Math.max(1, p), localTotalPages.value);
});

const localPagesToShow = computed(() => {
  const total = localTotalPages.value;
  const current = displayPage.value;
  const maxButtons = 4;
  if (total <= maxButtons) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 2) return [1,2,3,4];
  if (current >= total - 1) return [total-3, total-2, total-1, total];
  return [current-1, current, current+1, current+2];
});

const autoExpanded = computed(() => {
  const out = {};
  const ids = matchedParentIds.value || new Set();
  ids.forEach(id => { if (id) out[String(id)] = true; });
  return out;
});

const expandedMap = computed(() => {
  return Object.assign({}, expanded.value || {}, autoExpanded.value || {});
});

// --- Categories Pagination Methods ---
function categoriesGoToPage(page) {
  if (page >= 1 && page <= localTotalPages.value) {
    categoriesCurrentPage.value = page;
  }
}
function categoriesPrevPage() {
  categoriesGoToPage(Math.max(1, categoriesCurrentPage.value - 1));
}
function categoriesNextPage() {
  categoriesGoToPage(Math.min(localTotalPages.value, categoriesCurrentPage.value + 1));
}
function categoriesFirstPage() {
  categoriesGoToPage(1);
}
function categoriesLastPage() {
  categoriesGoToPage(localTotalPages.value);
}

watch(searchQueryCategories, () => {
  categoriesCurrentPage.value = 1;
});

// File handling
function isUrl(val) {
  if (!val) return false;
  return /^https?:\/\//i.test(val) || val.startsWith('/');
}

function pdfUrl(val) {
  if (!val) return '#';
  const s = String(val).trim();
  if (isUrl(s)) return s;
  return `/uploads/${s}`;
}

function pdfIconClass(val) {
  if (!val) return 'bi bi-file-earmark-text text-secondary';
  const s = String(val).trim().toLowerCase();
  if (s.endsWith('.pdf')) return 'bi bi-file-earmark-pdf-fill text-danger';
  if (s.endsWith('.doc') || s.endsWith('.docx')) return 'bi bi-file-earmark-word-fill text-primary';
  if (s.endsWith('.xls') || s.endsWith('.xlsx')) return 'bi bi-file-earmark-excel-fill text-success';
  return 'bi bi-file-earmark-text text-secondary';
}

const fileModalEl = ref(null);
const modalFileUrl = ref('');
const modalFileName = ref('');
let bsFileModal = null;

function isPdf(url) {
  if (!url) return false;
  return String(url).toLowerCase().trim().endsWith('.pdf');
}

function openFile(fileValue, name) {
  const url = pdfUrl(fileValue);
  modalFileUrl.value = url;
  modalFileName.value = name || String(fileValue || '').split('/').pop();
  nextTick(() => {
    if (bsFileModal) {
      try { bsFileModal.dispose(); } catch(e){ /* ignore */ }
      bsFileModal = null;
    }
    if (fileModalEl.value) {
      bsFileModal = new Modal(fileModalEl.value, { backdrop: false, keyboard: true });
      bsFileModal.show();
    }
  });
}

function closeModal() {
  if (bsFileModal) {
    try { bsFileModal.hide(); } catch(e) { /* ignore */ }
  }
}

onMounted(() => {
  unbindSidebarResize = bindSidebarResize();

  // init tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map((el) => new Tooltip(el));

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

  fetchCategories();
});

onUnmounted(() => {
  if (typeof unbindSidebarResize === 'function') unbindSidebarResize();
  if (bsFileModal) {
    try { bsFileModal.dispose(); } catch(e) { /* ignore */ }
    bsFileModal = null;
  }
  if (bsModalInstance) { try { bsModalInstance.dispose(); } catch(e) {} bsModalInstance = null; }
  if (templateModalInstance) { try { templateModalInstance.dispose(); } catch(e) {} templateModalInstance = null; }
  if (crudModalInstance) { try { crudModalInstance.dispose(); } catch(e) {} crudModalInstance = null; }
});
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

.dashboard-container {
  display: flex;
  width: 100%;
  min-height: 100vh;
}

.main-content {
  flex-grow: 1;
  background-color: var(--apple-light-gray);
  overflow-x: hidden;
  padding-top: 0.5rem;
}

.main-content .container-fluid {
  padding-top: 0.5rem !important;
  padding-left: 1rem;
  padding-right: 1rem;
}

/* ===== Apple Card Style ===== */
.bg-white.shadow-apple {
  background: var(--apple-bg) !important;
  border-radius: var(--apple-radius) !important;
  box-shadow: var(--apple-shadow) !important;
  overflow: hidden;
  transition: var(--apple-transition);
}

/* ===== Apple Button Style ===== */
.apple-btn {
  border-radius: 20px !important;
  padding: 8px 16px !important;
  font-weight: 500 !important;
  transition: var(--apple-transition) !important;
  border: none !important;
}

.apple-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.apple-btn:active {
  transform: scale(0.98);
}

.btn-primary.apple-btn {
  background: linear-gradient(135deg, #007AFF 0%, #0056CC 100%) !important;
}

/* ===== Table Styles ===== */
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

.cat-id-cell {
  font-variant-numeric: tabular-nums;
  font-weight: 500;
}

.cat-id-sub {
  padding-left: 0.75rem !important;
}

/* ===== Row Hover Effect - Apple Style ===== */
.table tbody tr {
  transition: var(--apple-transition);
  cursor: default;
}

.table tbody tr:hover {
  background-color: rgba(0, 122, 255, 0.04) !important;
}

.table tbody tr:hover .row-actions {
  opacity: 1;
  transform: translateX(0);
}

/* Main category row */
.table tbody tr.bg-primary-subtle {
  background: linear-gradient(90deg, rgba(0, 122, 255, 0.08) 0%, rgba(0, 122, 255, 0.03) 100%) !important;
}

/* Sub category row */
.sub-row {
  background: #FAFAFA !important;
  animation: slideIn 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== Action Buttons - Apple Style ===== */
.row-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  opacity: 0.7;
  transition: var(--apple-transition);
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px !important;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none !important;
  padding: 0 !important;
  transition: var(--apple-transition) !important;
  background: transparent;
}

.action-btn-edit {
  color: var(--apple-blue);
  background: rgba(0, 122, 255, 0.1);
}

.action-btn-edit:hover {
  background: var(--apple-blue);
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.4);
}

.action-btn-delete {
  color: var(--apple-red);
  background: rgba(255, 59, 48, 0.1);
}

.action-btn-delete:hover {
  background: var(--apple-red);
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 59, 48, 0.4);
}

.action-btn:active {
  transform: scale(0.95) !important;
}

/* ===== Badge Style ===== */
.badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.75rem;
  letter-spacing: 0.3px;
}

.badge.bg-primary {
  background: linear-gradient(135deg, #007AFF 0%, #0056CC 100%) !important;
}

.badge.bg-info {
  background: linear-gradient(135deg, #5AC8FA 0%, #32ADE6 100%) !important;
}

/* ===== Search Input - Apple Style ===== */
.search-input-group {
  position: relative;
}

.search-input-group .form-control {
  background: var(--apple-bg);
  border: 1px solid #E5E5EA !important;
  border-radius: 12px !important;
  padding: 10px 40px 10px 16px !important;
  font-size: 0.95rem;
  transition: var(--apple-transition);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.search-input-group .form-control:focus {
  border-color: var(--apple-blue) !important;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.15);
  outline: none;
}

.search-input-group .input-group-text {
  color: var(--apple-gray);
}

/* ===== Modal - Apple Style ===== */
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
  max-width: 320px;
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

/* ===== Expand/Collapse Button ===== */
.btn-link {
  color: var(--apple-gray);
  text-decoration: none;
  transition: var(--apple-transition);
}

.btn-link:hover {
  color: var(--apple-blue);
  transform: scale(1.2);
}

.btn-link i {
  transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
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
  background-color: #fff;
  border-color: #dee2e6;
}

.btn-link {
  color: #495057;
  text-decoration: none;
}
.btn-link:hover {
  color: #007bff;
  text-decoration: none;
}
.ps-4 {
  padding-left: 2rem !important;
}

.table a.text-decoration-none {
  color: inherit;
}
.table a.text-decoration-none:hover {
  text-decoration: underline;
}

.file-modal .modal-content {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  overflow: hidden;
  position: relative;
}
.file-modal .modal-body {
  padding: 0;
}

.file-modal-header-btns {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 1055;
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}
.file-modal-open {
  order: 1;
}
.file-modal-close {
  order: 2;
}

.file-modal-close,
.file-modal-open {
  background: #fff !important;
  border-radius: 0.375rem;
  width: 2.2rem;
  height: 2.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  padding: 0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  color: #212529;
  transition: background 0.15s;
}
.file-modal-close:hover,
.file-modal-open:hover {
  background: #f1f3f5 !important;
  color: #007bff;
}
.file-modal-close svg,
.file-modal-open svg {
  display: block;
}

.file-modal iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
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

/* ===== Toast Animation ===== */
@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== Success Animation ===== */
@keyframes successPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.success-animation {
  animation: successPulse 0.5s ease-in-out;
}

/* ===== Loading Skeleton ===== */
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: 200px 0;
  }
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
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

/* Modal styles */
.modal-content {
  border-radius: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.modal-header {
  border-bottom: none;
}

.modal-footer {
  border-top: none;
}

/* ===== Empty State ===== */
.empty-state {
  padding: 3rem;
  text-align: center;
}

.empty-state i {
  font-size: 3rem;
  color: var(--apple-gray);
  margin-bottom: 1rem;
}

.empty-state p {
  color: var(--apple-gray);
  font-size: 1rem;
}
</style>
