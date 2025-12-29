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
          <!-- Header Section -->
          <div class="d-block d-md-flex align-items-center justify-content-between mb-4">
            <div class="d-flex align-items-center gap-3">
              <h2 class="page-title m-0">จัดการหมวดหมู่</h2>
              <button class="apple-btn-primary" @click="openCrudModal()">
                <i class="bi bi-plus-lg me-2"></i>
                <span>เพิ่มหมวดหมู่</span>
              </button>
              <button class="apple-icon-btn-large" @click="openUploadModal" title="อัพโหลด CSV">
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

          <!-- Table Section -->
          <div class="apple-card">
            <div class="table-responsive">
              <table class="table apple-table mb-0">
                <thead>
                  <tr>
                    <th class="ps-4" style="width: 50px;"></th>
                    <th>CategoriesID</th>
                    <th>CategoriesName</th>
                    <th>Type</th>
                    <th>Contact</th>
                    <th>File</th>
                    <th class="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(cat, idx) in visibleParents" :key="cat.CategoriesID">
                    <tr class="align-middle parent-row">
                      <td class="ps-4">
                        <button 
                          v-if="hasSubCategories(cat.CategoriesID, cat.CategoriesID)" 
                          class="expand-btn" 
                          @click="toggleExpand(cat.CategoriesID)"
                        >
                          <i class="bi" :class="expandedMap[cat.CategoriesID] ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                        </button>
                      </td>
                      <td class="cat-id-cell fw-semibold text-primary">
                        {{ cat.CategoriesID }}
                      </td>
                      <td class="fw-medium text-dark">{{ cat.CategoriesName }}</td>
                      <td>
                        <span :class="isMain(cat) ? 'apple-badge-blue' : 'apple-badge-gray'">
                          {{ isMain(cat) ? 'Main' : 'Sub' }}
                        </span>
                      </td>
                      <td class="contact-cell">
                        <div v-if="cat.Contact">
                          <div v-for="(cc, i) in parseContacts(cat.Contact)" :key="i" class="small text-secondary text-truncate" style="max-width: 200px;">{{ cc }}</div>
                        </div>
                        <span v-else class="text-muted small">-</span>
                      </td>
                      <td>
                        <template v-if="cat.CategoriesPDF">
                          <button @click.prevent="openFile(cat.CategoriesPDF, cat.CategoriesName)" class="file-link-btn">
                            <i :class="pdfIconClass(cat.CategoriesPDF)"></i>
                            <span>View</span>
                          </button>
                        </template>
                        <span v-else class="text-muted small">-</span>
                      </td>
                      <td class="text-center">
                        <div class="row-actions">
                          <button class="action-btn edit" @click.stop="openEditModal(cat)" title="แก้ไข">
                            <i class="bi bi-pencil-square"></i>
                          </button>
                          <button class="action-btn delete" @click.stop="confirmDelete(cat)" title="ลบ">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <!-- Sub Categories -->
                    <tr
                      v-for="sub in expandedMap[cat.CategoriesID] ? subCategories(cat.CategoriesID, cat.CategoriesID) : []"
                      :key="sub.CategoriesID"
                      class="sub-row"
                    >
                      <td></td>
                      <td class="cat-id-cell ps-4 text-secondary">
                        <span class="tree-line">└</span> {{ sub.CategoriesID }}
                      </td>
                      <td class="ps-4 text-dark">{{ sub.CategoriesName }}</td>
                      <td><span class="apple-badge-gray">Sub</span></td>
                      <td class="contact-cell">
                        <div v-if="sub.Contact">
                          <div v-for="(cc, i) in parseContacts(sub.Contact)" :key="i" class="small text-secondary text-truncate">{{ cc }}</div>
                        </div>
                        <span v-else class="text-muted small">-</span>
                      </td>
                      <td>
                        <template v-if="sub.CategoriesPDF">
                          <button @click.prevent="openFile(sub.CategoriesPDF, sub.CategoriesName)" class="file-link-btn">
                            <i :class="pdfIconClass(sub.CategoriesPDF)"></i>
                            <span>View</span>
                          </button>
                        </template>
                        <span v-else class="text-muted small">-</span>
                      </td>
                      <td class="text-center">
                        <div class="row-actions">
                          <button class="action-btn edit" @click.stop="openEditModal(sub)" title="แก้ไข">
                            <i class="bi bi-pencil-square"></i>
                          </button>
                          <button class="action-btn delete" @click.stop="confirmDelete(sub)" title="ลบ">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </template>

                  <tr v-if="visibleParents.length === 0">
                    <td colspan="7" class="text-center text-muted py-5">
                      <div class="empty-state">
                        <i class="bi bi-folder-x"></i>
                        <p>No categories found</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination footer -->
            <div class="d-flex justify-content-between align-items-center p-3 border-top">
              <div class="small text-secondary">
                Showing {{ categoriesStartIndex }} to {{ categoriesEndIndex }} of {{ categoriesTotalEntries }} entries
              </div>
              <nav aria-label="Page navigation">
                <ul class="pagination pagination-sm mb-0">
                  <li class="page-item" :class="{ disabled: displayPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="categoriesFirstPage">&laquo;</a>
                  </li>
                  <li class="page-item" :class="{ disabled: displayPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="categoriesPrevPage">&lsaquo;</a>
                  </li>
                  <li v-for="page in localPagesToShow" :key="page" class="page-item" :class="{ active: displayPage === page }">
                    <a class="page-link" href="#" @click.prevent="categoriesGoToPage(page)">{{ page }}</a>
                  </li>
                  <li class="page-item" :class="{ disabled: displayPage === localTotalPages }">
                    <a class="page-link" href="#" @click.prevent="categoriesNextPage">&rsaquo;</a>
                  </li>
                  <li class="page-item" :class="{ disabled: displayPage === localTotalPages }">
                    <a class="page-link" href="#" @click.prevent="categoriesLastPage">&raquo;</a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 1. CRUD Modal (Apple Style) -->
    <transition name="apple-zoom">
      <div v-if="showCrudModal" class="apple-modal-overlay" @click.self="closeCrudModal">
        <div class="apple-modal-content">
          <div class="apple-modal-header-bg"></div>
          <div class="apple-modal-header">
            <div class="d-flex flex-column">
              <h5 class="apple-modal-title">{{ isEditing ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่' }}</h5>
              <span class="apple-modal-subtitle">{{ isEditing ? 'Edit Category' : 'Create New Category' }}</span>
            </div>
            <button class="apple-close-btn" @click="closeCrudModal">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="apple-modal-body">
            <form @submit.prevent="saveCrudForm" class="apple-form-container">
              
              <div class="apple-input-group">
                <label>ชื่อหมวดหมู่ (Category Name) <span class="text-danger">*</span></label>
                <input type="text" class="apple-input" v-model="crudFormData.CategoriesName" required placeholder="เช่น ทุนการศึกษา" />
              </div>

              <div class="apple-input-group">
                <label>ประเภทหมวดหมู่ (Parent Category)</label>
                <div class="select-wrapper">
                  <select class="apple-input" v-model="crudFormData.ParentCategoriesID">
                    <option value="">หมวดหมู่หลัก (Main Category)</option>
                    <option 
                      v-for="cat in parentCategoryOptions" 
                      :key="cat.CategoriesID" 
                      :value="cat.CategoriesID"
                      :disabled="isEditing && editingId === cat.CategoriesID"
                    >
                      {{ cat.CategoriesID }} - {{ cat.CategoriesName }}
                    </option>
                  </select>
                  <i class="bi bi-chevron-down select-icon"></i>
                </div>
              </div>

              <div class="apple-input-group">
                <label>ลิงก์ PDF (Optional)</label>
                <div class="input-with-icon">
                  <i class="bi bi-link-45deg input-icon"></i>
                  <input type="url" class="apple-input ps-5" v-model="crudFormData.CategoriesPDF" placeholder="https://example.com/file.pdf" />
                </div>
              </div>

              <div class="apple-input-group">
                <label>ข้อมูลติดต่อ (Contact / Notes)</label>
                <textarea rows="3" class="apple-input apple-textarea" v-model="crudFormData.Contact" placeholder="เบอร์โทรศัพท์, หมายเหตุ..."></textarea>
              </div>

              <div class="apple-actions">
                <button type="button" class="apple-btn-secondary" @click="closeCrudModal">ยกเลิก</button>
                <button type="submit" class="apple-btn-primary" :disabled="isSaving">
                  <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มหมวดหมู่' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>

    <!-- 2. Upload Modal (Apple Style) -->
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
              <button class="apple-btn-secondary small" @click.stop="downloadTemplateFile" :disabled="isDownloadingTemplate">
                <i class="bi bi-file-earmark-arrow-down me-1"></i> Template
              </button>
              <button class="apple-btn-secondary small" @click.stop="openTemplateModal">
                <i class="bi bi-eye me-1"></i> ตัวอย่าง
              </button>
              <button class="apple-btn-secondary small" @click.stop="downloadLastUploadedFile" :disabled="isDownloadingFile">
                <i class="bi bi-clock-history me-1"></i> ไฟล์ล่าสุด
              </button>
            </div>

            <div class="apple-actions mt-4">
              <button class="apple-btn-secondary" @click="closeUploadModal" :disabled="isUploading">ยกเลิก</button>
              <button class="apple-btn-primary" @click="saveUpload" :disabled="!uploadedFile || isUploading">
                <span v-if="isUploading" class="spinner-border spinner-border-sm me-2"></span>
                อัพโหลด
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 3. Template Preview Modal -->
    <transition name="apple-zoom">
      <div v-if="showTemplateModal" class="apple-modal-overlay" @click.self="closeTemplateModal">
        <div class="apple-modal-content wide-modal">
          <div class="apple-modal-header">
            <h5 class="apple-modal-title">Template Example</h5>
            <button class="apple-close-btn" @click="closeTemplateModal"><i class="bi bi-x-lg"></i></button>
          </div>
          <div class="apple-modal-body p-0 d-flex justify-content-center bg-light">
             <img :src="ex4Url" alt="Template Example" class="img-fluid" style="max-height: 70vh;">
          </div>
        </div>
      </div>
    </transition>

    <!-- 4. File Preview Modal -->
    <transition name="apple-zoom">
      <div v-if="showFileModal" class="apple-modal-overlay" @click.self="closeFileModal">
        <div class="apple-modal-content large-modal" style="height: 90vh;">
          <div class="apple-modal-header py-2">
             <div class="d-flex align-items-center gap-2">
                <i class="bi bi-file-earmark-pdf text-danger fs-5"></i>
                <span class="fw-semibold text-truncate" style="max-width: 300px;">{{ modalFileName }}</span>
             </div>
             <div class="d-flex gap-2">
                <a :href="modalFileUrl" target="_blank" class="apple-icon-btn"><i class="bi bi-box-arrow-up-right"></i></a>
                <button class="apple-close-btn" @click="closeFileModal"><i class="bi bi-x-lg"></i></button>
             </div>
          </div>
          <div class="apple-modal-body p-0 h-100 bg-light position-relative">
            <iframe v-if="isPdf(modalFileUrl)" :src="modalFileUrl" frameborder="0" class="w-100 h-100"></iframe>
            <div v-else class="d-flex flex-column align-items-center justify-content-center h-100">
               <i class="bi bi-file-earmark-x fs-1 text-muted mb-3"></i>
               <p>Preview not available</p>
               <a :href="modalFileUrl" target="_blank" class="apple-btn-primary">Download File</a>
            </div>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, watch, getCurrentInstance, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { Tooltip } from 'bootstrap';
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

// Data
const categories = ref([]);
const categoriesLoading = ref(true);
const categoriesError = ref(null);

// Modals Visibility State (Replaces Bootstrap Instances)
const showUploadModal = ref(false);
const showCrudModal = ref(false);
const showTemplateModal = ref(false);
const showFileModal = ref(false);

// Upload State
const uploadedFile = ref(null);
const isUploading = ref(false);
const isDownloadingFile = ref(false);
const isDownloadingTemplate = ref(false);

// CRUD State
const isEditing = ref(false);
const editingId = ref(null);
const isSaving = ref(false);
const crudFormData = ref({
  CategoriesName: '',
  ParentCategoriesID: '',
  CategoriesPDF: '',
  Contact: ''
});

// File Preview State
const modalFileUrl = ref('');
const modalFileName = ref('');

// Computed: Parent Options
const parentCategoryOptions = computed(() => {
  return (categories.value || []).filter(c => {
    const pid = String(c.ParentCategoriesID ?? '').trim();
    const cid = String(c.CategoriesID ?? '').trim();
    return !pid || pid === cid;
  });
});

// --- Modal Functions ---
function openUploadModal() {
  uploadedFile.value = null;
  showUploadModal.value = true;
}
function closeUploadModal() {
  showUploadModal.value = false;
}

function openTemplateModal() {
  showTemplateModal.value = true;
}
function closeTemplateModal() {
  showTemplateModal.value = false;
}

function openFile(fileValue, name) {
  modalFileUrl.value = pdfUrl(fileValue);
  modalFileName.value = name || 'Document';
  showFileModal.value = true;
}
function closeFileModal() {
  showFileModal.value = false;
  modalFileUrl.value = '';
}

// --- CRUD Functions ---
function resetCrudForm() {
  crudFormData.value = {
    CategoriesName: '',
    ParentCategoriesID: '',
    CategoriesPDF: '',
    Contact: ''
  };
  isEditing.value = false;
  editingId.value = null;
}

function openCrudModal() {
  resetCrudForm();
  showCrudModal.value = true;
}

function closeCrudModal() {
  showCrudModal.value = false;
  resetCrudForm();
}

async function openEditModal(cat) {
  isEditing.value = true;
  editingId.value = cat.CategoriesID;
  
  // Pre-fill
  crudFormData.value = {
    CategoriesName: cat.CategoriesName || '',
    ParentCategoriesID: cat.ParentCategoriesID || '',
    CategoriesPDF: cat.CategoriesPDF || '',
    Contact: cat.Contact || ''
  };

  // Try fetching fresh details
  try {
    const resp = await $axios.get(`/categories/crud/single/${encodeURIComponent(cat.CategoriesID)}`);
    if (resp?.data?.success && resp.data.data) {
      const d = resp.data.data;
      crudFormData.value = {
        CategoriesName: d.CategoriesName || cat.CategoriesName,
        ParentCategoriesID: d.ParentCategoriesID || cat.ParentCategoriesID,
        CategoriesPDF: d.CategoriesPDF || cat.CategoriesPDF,
        Contact: d.Contact || ''
      };
    }
  } catch (err) {
    console.warn('Fetch single category failed, utilizing list data.');
  }
  showCrudModal.value = true;
}

const saveCrudForm = async () => {
  if (!crudFormData.value.CategoriesName?.trim()) {
    $swal?.fire({ icon: 'warning', title: 'Required', text: 'กรุณากรอกชื่อหมวดหมู่', toast: true, position: 'bottom-end', timer: 3000, showConfirmButton: false });
    return;
  }
  isSaving.value = true;
  try {
    const payload = {
      categoriesName: crudFormData.value.CategoriesName.trim(),
      parentCategoriesID: crudFormData.value.ParentCategoriesID || null,
      categoriesPDF: crudFormData.value.CategoriesPDF?.trim() || null,
      contact: crudFormData.value.Contact?.trim() || null
    };

    if (isEditing.value && editingId.value) {
      await $axios.put(`/categories/crud/update/${editingId.value}`, payload);
      $swal?.fire({ icon: 'success', title: 'Saved', text: 'แก้ไขหมวดหมู่สำเร็จ', toast: true, position: 'bottom-end', timer: 2000, showConfirmButton: false });
    } else {
      await $axios.post('/categories/crud/create', payload);
      $swal?.fire({ icon: 'success', title: 'Created', text: 'เพิ่มหมวดหมู่สำเร็จ', toast: true, position: 'bottom-end', timer: 2000, showConfirmButton: false });
    }
    closeCrudModal();
    await fetchCategories();
  } catch (err) {
    console.error(err);
    $swal?.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Operation failed', toast: true, position: 'bottom-end', timer: 4000, showConfirmButton: false });
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = async (cat) => {
  const result = await $swal?.fire({
    title: 'ยืนยันการลบ?',
    text: `ต้องการลบหมวดหมู่ "${cat.CategoriesName}" ใช่หรือไม่?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#FF3B30', // Apple Red
    cancelButtonColor: '#8E8E93',   // Apple Gray
    confirmButtonText: 'ลบ',
    cancelButtonText: 'ยกเลิก',
    customClass: {
      popup: 'apple-swal-popup',
      confirmButton: 'apple-swal-confirm',
      cancelButton: 'apple-swal-cancel'
    }
  });

  if (result?.isConfirmed) {
    try {
      await $axios.delete(`/categories/crud/delete/${cat.CategoriesID}`);
      $swal?.fire({ icon: 'success', title: 'Deleted', text: 'ลบหมวดหมู่เรียบร้อย', toast: true, position: 'bottom-end', timer: 2000, showConfirmButton: false });
      await fetchCategories();
    } catch (err) {
      $swal?.fire({ icon: 'error', title: 'Failed', text: err.response?.data?.message || 'Delete failed' });
    }
  }
};

// --- Upload Logic ---
function onFileChange(e) {
  const f = e.target.files?.[0];
  if (!f) return;
  if (!f.name.toLowerCase().endsWith('.csv')) {
    $swal?.fire({ icon: 'error', title: 'Invalid File', text: 'Please upload a CSV file' });
    return;
  }
  uploadedFile.value = f;
  e.target.value = '';
}
function onFileDrop(e) {
  const f = e.dataTransfer?.files?.[0];
  if (f && f.name.toLowerCase().endsWith('.csv')) {
    uploadedFile.value = f;
  }
}
const saveUpload = async () => {
  if (!uploadedFile.value) return;
  isUploading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', uploadedFile.value);
    await $axios.post('/categories/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    $swal?.fire({ icon: 'success', title: 'Uploaded!', toast: true, position: 'bottom-end', timer: 3000, showConfirmButton: false });
    await fetchCategories();
    closeUploadModal();
  } catch (err) {
    $swal?.fire({ icon: 'error', title: 'Upload Failed', text: err.response?.data?.message || err.message, toast: true, position: 'bottom-end', timer: 4000, showConfirmButton: false });
  } finally {
    isUploading.value = false;
  }
};

const downloadTemplateFile = async () => {
  if (isDownloadingTemplate.value) return;
  isDownloadingTemplate.value = true;
  try {
    const res = await $axios.get('/categories/crud/template', { responseType: 'blob' });
    downloadBlob(res.data, 'categories_template.csv');
  } catch(e) { console.error(e); } 
  finally { isDownloadingTemplate.value = false; }
};

const downloadLastUploadedFile = async () => {
  if (isDownloadingFile.value) return;
  isDownloadingFile.value = true;
  try {
    const res = await $axios.get('/categories/last-upload', { responseType: 'blob' });
    downloadBlob(res.data, 'last_uploaded.csv');
  } catch(e) { 
    $swal?.fire({ icon: 'info', title: 'No File', text: 'No previously uploaded file found' });
  } 
  finally { isDownloadingFile.value = false; }
};

function downloadBlob(blobData, filename) {
  const url = window.URL.createObjectURL(new Blob([blobData]));
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// --- Fetch Data ---
const fetchCategories = async () => {
  categoriesLoading.value = true;
  try {
    const res = await $axios.get('/getcategories');
    categories.value = res.data?.categories || [];
  } catch (err) {
    categoriesError.value = 'Failed to load';
  } finally {
    categoriesLoading.value = false;
  }
};

// --- Table Logic & Helpers ---
const categoriesCurrentPage = ref(1);
const categoriesItemsPerPage = ref(100);

// FIX: Robust isMain check to handle orphans
function isMain(cat) {
  if (!cat) return false;
  const id = String(cat.CategoriesID ?? '').trim();
  const parent = String(cat.ParentCategoriesID ?? '').trim();
  
  // 1. If it has no parent or parent is itself => Main
  if (!parent || parent === id) return true;
  
  // 2. If it has a parent, check if that parent actually exists in our data
  const parentExists = (categories.value || []).some(c => String(c.CategoriesID) === parent);
  
  // 3. If parent does NOT exist => It's an orphan => Show as Main so we can edit/delete it
  if (!parentExists) return true;
  
  // 4. Parent exists => It is a Sub
  return false;
}

function pdfUrl(val) {
  if (!val) return '#';
  return /^https?:\/\//i.test(val) ? val : `/uploads/${val}`;
}
function isPdf(url) {
  return String(url).toLowerCase().trim().endsWith('.pdf');
}
function pdfIconClass(val) {
  const s = String(val).toLowerCase();
  if (s.endsWith('.pdf')) return 'bi bi-file-earmark-pdf-fill text-danger';
  if (s.endsWith('.doc') || s.endsWith('.docx')) return 'bi bi-file-earmark-word-fill text-primary';
  return 'bi bi-file-earmark-text-fill text-secondary';
}

// FIX: Handle newlines in contacts
function parseContacts(str) {
  if (!str) return [];
  // Split by " ||| " OR newline
  return String(str).split(/ \|\|\| |\n/).map(s => s.trim()).filter(Boolean);
}

function toggleExpand(id) {
  expanded.value[id] = !expanded.value[id];
}

// ADDED: expandedMap definition
const expandedMap = computed(() => expanded.value);

// Filtering & Pagination
const filteredCategories = computed(() => {
  const list = (categories.value || []).filter((v,i,a)=>a.findIndex(t=>(t.CategoriesID===v.CategoriesID))===i);
  if (!searchQueryCategories.value) return list;
  const q = searchQueryCategories.value.toLowerCase();
  return list.filter(c => 
    String(c.CategoriesID).toLowerCase().includes(q) || 
    String(c.CategoriesName).toLowerCase().includes(q)
  );
});

const visibleParents = computed(() => {
  // Logic to show parents based on filter or pagination
  // Simplified for display:
  const all = filteredCategories.value;
  const start = (categoriesCurrentPage.value - 1) * categoriesItemsPerPage.value;
  const end = start + categoriesItemsPerPage.value;
  
  // If searching, just show matched items that are parents, or whose children match
  if (searchQueryCategories.value) {
    return all.filter(c => isMain(c)).slice(start, end); // Simplified view
  }
  
  return all.filter(c => isMain(c)).slice(start, end);
});

// Subcategory lookup
function subCategories(parentId, selfId) {
  return (categories.value || []).filter(c => 
    String(c.ParentCategoriesID) === String(parentId) && 
    String(c.CategoriesID) !== String(selfId)
  );
}
function hasSubCategories(parentId, selfId) {
  return subCategories(parentId, selfId).length > 0;
}

// Pagination
const categoriesTotalEntries = computed(() => filteredCategories.value.filter(c => isMain(c)).length);
const localTotalPages = computed(() => Math.ceil(categoriesTotalEntries.value / categoriesItemsPerPage.value));
const displayPage = computed(() => categoriesCurrentPage.value);
const categoriesStartIndex = computed(() => (categoriesCurrentPage.value - 1) * categoriesItemsPerPage.value + 1);
const categoriesEndIndex = computed(() => Math.min(categoriesCurrentPage.value * categoriesItemsPerPage.value, categoriesTotalEntries.value));
const localPagesToShow = computed(() => {
  const total = localTotalPages.value;
  const current = displayPage.value;
  if (total <= 5) return Array.from({length: total}, (_, i) => i + 1);
  if (current <= 3) return [1,2,3,4,5];
  if (current >= total - 2) return [total-4, total-3, total-2, total-1, total];
  return [current-2, current-1, current, current+1, current+2];
});

function categoriesGoToPage(p) { if(p>=1 && p<=localTotalPages.value) categoriesCurrentPage.value = p; }
function categoriesPrevPage() { categoriesGoToPage(displayPage.value - 1); }
function categoriesNextPage() { categoriesGoToPage(displayPage.value + 1); }
function categoriesFirstPage() { categoriesGoToPage(1); }
function categoriesLastPage() { categoriesGoToPage(localTotalPages.value); }

watch(searchQueryCategories, () => categoriesCurrentPage.value = 1);

onMounted(() => {
  unbindSidebarResize = bindSidebarResize();
  const token = localStorage.getItem("userToken");
  if (!token) { router.replace({ name: "login" }); return; }
  
  const userInfoString = localStorage.getItem("userInfo");
  if (userInfoString) userInfoObject.value = JSON.parse(userInfoString);
  userType.value = localStorage.getItem("userType") || "";

  fetchCategories();
  
  // Init tooltips
  nextTick(() => {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new Tooltip(el));
  });
});

onUnmounted(() => {
  if (unbindSidebarResize) unbindSidebarResize();
});
</script>

<style scoped>
@import '@/assets/dashboard-styles.css';
@import '@/assets/main.css';
@import '@/assets/sidebar.css';

/* =========================================
   Apple Design System - Colors & Variables
   ========================================= */
:root {
  --apple-blue: #0071e3; /* Changed to Web Apple Blue */
  --apple-blue-hover: #0077ED;
  --apple-red: #FF3B30;
  --apple-red-hover: #D70015;
  --apple-gray: #86868b; /* Slightly softer gray */
  --apple-light-bg: #F5F5F7;
  --apple-card-bg: #FFFFFF;
  --apple-border: #E5E5EA;
  --apple-radius: 16px;
  --apple-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  --apple-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.dashboard-container {
  font-family: var(--apple-font);
  background-color: var(--apple-light-bg);
  min-height: 100vh;
}

.main-content {
  padding-bottom: 40px;
}

.page-title {
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #1d1d1f;
}

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
  color: #6e6e73; /* Darker gray for readability */
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

.apple-table tr:last-child td {
  border-bottom: none;
}

.apple-table tr.parent-row:hover {
  background-color: rgba(0, 113, 227, 0.04); /* Subtle blue tint */
}

.sub-row {
  background-color: #FAFAFC;
}

.tree-line {
  color: #C7C7CC;
  margin-right: 6px;
  font-weight: 300;
}

/* Badges */
.apple-badge-blue {
  background: rgba(0, 113, 227, 0.1);
  color: var(--apple-blue);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.apple-badge-gray {
  background: rgba(142, 142, 147, 0.1);
  color: var(--apple-gray);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* =========================================
   Buttons & Inputs (Updated: improved contrast & typography, rounded corners)
   ========================================= */
.apple-btn-primary {
  background: linear-gradient(135deg, #007AFF 0%, #0051D4 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px; /* changed from pill to rounded */
  padding: 9px 16px; /* slightly reduced horizontal padding for balanced look */
  font-weight: 700;
  font-size: 0.95rem;
  transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 6px 18px rgba(0, 90, 255, 0.18);
}

.apple-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 30px rgba(0, 90, 255, 0.22);
  background: linear-gradient(135deg, #0A8AFF 0%, #0046C4 100%);
}

.apple-btn-primary:disabled {
  opacity: 0.62;
  cursor: not-allowed;
  box-shadow: none;
}

.apple-btn-secondary {
  background: rgba(0, 0, 0, 0.06);
  color: #1d1d1f;
  border: none;
  border-radius: 12px;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 120ms ease, color 120ms ease;
}

.apple-btn-secondary:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.12);
}

.apple-btn-secondary.small {
  padding: 6px 12px;
  font-size: 0.85rem;
}

.apple-icon-btn-large {
  width: 40px;
  height: 40px;
  border-radius: 12px; /* changed rounded shape to match cancel button */
  background: linear-gradient(135deg, #007AFF 0%, #0051D4 100%);
  border: none;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
  font-size: 1.05rem;
  box-shadow: 0 6px 16px rgba(0, 90, 255, 0.12);
  padding: 6px; /* keep icon centered while non-circular */
}

.apple-icon-btn-large:hover {
  transform: translateY(-1px) scale(1.02);
  background: linear-gradient(135deg, #0A8AFF 0%, #0046C4 100%);
  color: #ffffff;
}


/* Action Buttons in Table */
.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 2px;
  transition: all 0.2s;
  background: transparent;
}

.action-btn.edit { color: var(--apple-blue); }
.action-btn.edit:hover { background: rgba(0, 113, 227, 0.1); transform: scale(1.1); }

.action-btn.delete { color: var(--apple-red); }
.action-btn.delete:hover { background: rgba(255, 59, 48, 0.1); transform: scale(1.1); }

.expand-btn {
  background: transparent;
  border: none;
  color: #86868b;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.expand-btn:hover { background: rgba(0,0,0,0.05); color: #1d1d1f; }

.file-link-btn {
  border: none;
  background: rgba(0,0,0,0.04);
  padding: 4px 10px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #1d1d1f;
  transition: all 0.2s;
}
.file-link-btn:hover { background: rgba(0,0,0,0.08); color: var(--apple-blue); }

/* Search Input */
.search-container {
  position: relative;
  width: 100%;
  max-width: 320px;
}
.search-input {
  width: 100%;
  background: white;
  border: 1px solid var(--apple-border);
  border-radius: 12px;
  padding: 10px 40px 10px 40px;
  font-size: 0.95rem;
  transition: all 0.2s;
}
.search-input:focus {
  outline: none;
  border-color: var(--apple-blue);
  box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.15);
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #86868b;
}
.search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  color: #86868b;
  cursor: pointer;
}
.search-clear:hover { color: #1d1d1f; }


/* =========================================
   Apple Modals (Custom Implementation)
   ========================================= */
.apple-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 99; /* FIX: Increased Z-Index to prevent sidebar overlap */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.apple-modal-content {
  background: rgba(255, 255, 255, 0.92); /* Higher opacity for readability */
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 20px;
  width: 100%;
  max-width: 550px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.4) inset;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.apple-modal-content.wide-modal { max-width: 800px; }
.apple-modal-content.large-modal { max-width: 90vw; }

.apple-modal-header {
  padding: 24px 24px 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  z-index: 2;
}

.apple-modal-header-bg {
  position: absolute;
  top: 0; left: 0; right: 0; height: 100px;
  background: linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%);
  pointer-events: none;
  z-index: 1;
}

.apple-modal-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.02em;
}

.apple-modal-subtitle {
  font-size: 0.9rem;
  color: #86868b;
  margin-top: 4px;
}

.apple-close-btn {
  background: rgba(0,0,0,0.05);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #1d1d1f;
}
.apple-close-btn:hover { background: rgba(0,0,0,0.1); transform: rotate(90deg); }

.apple-modal-body {
  padding: 0 24px 24px;
  position: relative;
  z-index: 2;
  overflow-y: auto;
  max-height: 80vh;
}

/* Modal Inputs */
.apple-form-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.apple-input-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1d1d1f; /* Darker label for better contrast */
  margin-bottom: 6px;
  display: block;
  margin-left: 4px;
}

.apple-input {
  width: 100%;
  background: rgba(118, 118, 128, 0.12);
  border: none;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 1rem;
  color: #1d1d1f;
  transition: all 0.2s;
}

.apple-input:focus {
  outline: none;
  background: white;
  box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.15);
}

.apple-textarea {
  resize: vertical;
  min-height: 80px;
}

.select-wrapper { position: relative; }
.select-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 0.8rem;
  color: #86868b;
}
.select-wrapper select { appearance: none; padding-right: 40px; }

.input-with-icon { position: relative; }
.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #86868b;
  font-size: 1.2rem;
}

/* Upload Drop Area */
.upload-drop-area-apple {
  border: 2px dashed #C7C7CC;
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
  background: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: all 0.2s;
}

.upload-drop-area-apple:hover {
  border-color: var(--apple-blue);
  background: rgba(0, 113, 227, 0.04);
}

.upload-drop-area-apple.has-file {
  border-color: #34C759;
  background: rgba(52, 199, 89, 0.05);
}

.upload-icon-wrapper {
  font-size: 3rem;
  color: var(--apple-blue);
  margin-bottom: 12px;
}
.upload-text { font-size: 1rem; color: #1d1d1f; }
.upload-hint { font-size: 0.85rem; color: #86868b; margin-top: 4px; }

.apple-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}

/* Transitions */
.apple-zoom-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.apple-zoom-leave-active { transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1); }
.apple-zoom-enter-from, .apple-zoom-leave-to { opacity: 0; transform: scale(0.95); }

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--apple-gray);
}
.empty-state i { font-size: 2.5rem; margin-bottom: 0.5rem; opacity: 0.5; }

</style>