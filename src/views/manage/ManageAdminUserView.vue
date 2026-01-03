<template>
  <div class="dashboard-container ">
    <!-- Mobile Sidebar Backdrop -->
    <div v-if="isMobileSidebarOpen" class="mobile-sidebar-backdrop" @click="toggleSidebar" aria-hidden="true"></div>
    <!-- Sidebar -->
    <Sidebar :userType="userType" :userInfoObject="userInfoObject" />

    <!-- Main Content -->
    <main class="main-content">
      <!-- Mobile Sidebar Toggle -->
      <button v-if="isMobile" class="mobile-sidebar-toggle mobile-inline-toggle" @click.stop="toggleSidebar" :aria-label="isMobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'">
        <i class="bi bi-list"></i>
      </button>
      <div class="container-fluid">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Loading admin data...</p>
        </div>

        <div v-else-if="error" class="alert alert-danger" role="alert">
          <strong>Error:</strong> {{ error }}
        </div>

        <div v-else>
          <div class="d-block d-md-flex align-items-center justify-content-between mb-3">
            <div class="d-flex align-items-center justify-content-center gap-3">
              <h2 class="page-title">จัดการผู้ดูแลระบบ</h2>
              <button class="btn-add-apple" @click="openCrudModal">
                <i class="bi bi-plus-lg me-1"></i> เพิ่มผู้ดูแล
              </button>
              <button class="btn-upload-apple" @click="openAddModal">
                <i class="bi bi-cloud-arrow-up"></i>
              </button>
            </div>

            <div class="search-container mt-3 mt-md-0">
              <i class="bi bi-search search-icon"></i>
              <input
                type="text"
                class="search-input"
                placeholder="ค้นหาผู้ดูแลระบบ..."
                v-model="searchQuery"
              />
              <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          <div class="bg-white shadow-apple rounded-4 overflow-hidden">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th class="fw-bold py-3 ps-3">ID</th>
                    <th class="fw-bold py-3">ชื่อ</th>
                    <th class="fw-bold py-3">อีเมล</th>
                    <th class="fw-bold py-3">บทบาท</th>
                    <th class="fw-bold py-3 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="admin in paginatedAdmins" :key="admin.AdminUserID" class="align-middle table-row-hover">
                    <td class="py-3 ps-3">{{ admin.AdminUserID }}</td>
                    <td data-label="ชื่อ" class="py-3">{{ admin.AdminName }}</td>
                    <td data-label="อีเมล" class="py-3">{{ admin.AdminEmail }}</td>
                    <td data-label="บทบาท" class="py-3">
                      <span :class="admin.ParentAdminID === admin.AdminUserID ? 'badge-super-admin' : 'badge-admin'">
                        <i :class="admin.ParentAdminID === admin.AdminUserID ? 'bi bi-shield-lock-fill me-1' : 'bi bi-person-fill me-1'"></i>
                        {{ admin.ParentAdminID === admin.AdminUserID ? 'Super Admin' : 'Admin' }}
                      </span>
                    </td>
                    <td class="py-3 text-center">
                      <div class="row-actions">
                        <button 
                          class="action-btn action-btn-edit" 
                          @click="openEditModal(admin)" 
                          title="แก้ไข"
                          :disabled="admin.ParentAdminID === admin.AdminUserID"
                        >
                          <i class="bi bi-pencil-square"></i>
                        </button>
                        <button 
                          class="action-btn action-btn-delete" 
                          @click="confirmDelete(admin)" 
                          title="ลบ"
                          :disabled="admin.ParentAdminID === admin.AdminUserID"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="paginatedAdmins.length === 0">
                    <td colspan="5" class="text-center text-muted py-3">ไม่พบข้อมูลผู้ดูแลระบบ</td>
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
                <ul class="pagination pagination-apple mb-0 align-items-center">
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
    <div class="modal fade" ref="bsModalRef" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content apple-modal rounded-4 p-3 shadow-lg">
          <div class="modal-header border-0">
            <div class="modal-title w-100 text-center">
              <div class="fs-5 fw-bold">อัพโหลดไฟล์</div>
              <div class="text-muted fs-6">ผู้ดูแลระบบ CSV</div>
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
                <button type="button" class="btn-apple-secondary"
                        @click.prevent="openTemplateModal" :disabled="isDownloadingTemplate">
                  <i class="bi bi-image"></i>
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
    <div class="modal fade" ref="templateModalRef" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-fullscreen">
        <div class="modal-content">
          <div class="modal-header border-0">
            <h5 class="modal-title w-100 text-center">Template Example</h5>
            <button type="button" class="btn-close" @click="closeTemplateModal()"></button>
          </div>
          <div class="modal-body text-center">
            <img :src="ex4Url" alt="Template Example" class="img-fluid" width="100%" height="100%">
          </div>
        </div>
      </div>
    </div>

    <!-- CRUD Modal for Add/Edit Admin -->
    <div class="modal fade" ref="crudModalRef" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content apple-modal rounded-4 p-3 shadow-lg">
          <div class="modal-header border-0">
            <h5 class="modal-title">{{ isEditing ? 'แก้ไขผู้ดูแลระบบ' : 'เพิ่มผู้ดูแลระบบใหม่' }}</h5>
            <button type="button" class="btn-close" @click="hideCrudModal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveCrudForm">
              <div class="mb-3">
                <label class="form-label fw-bold">ชื่อผู้ดูแลระบบ <span class="text-danger">*</span></label>
                <input type="text" class="form-control" v-model="crudFormData.AdminName" required placeholder="เช่น นายสมชาย ใจดี">
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">อีเมล <span class="text-danger">*</span></label>
                <input type="email" class="form-control" v-model="crudFormData.AdminEmail" required placeholder="example@pcru.ac.th">
              </div>
            </form>
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-secondary rounded-3" @click="hideCrudModal">ยกเลิก</button>
            <button type="button" class="btn btn-primary rounded-3" @click="saveCrudForm" :disabled="isSaving">
              <span v-if="isSaving" class="spinner-border spinner-border-sm me-1"></span>
              {{ isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ดูแล' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Modal Component -->
    <ConfirmModalComponent />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, getCurrentInstance, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Modal, Tooltip } from 'bootstrap';

import Sidebar from '@/components/Sidebar.vue';
import { bindSidebarResize, isSidebarCollapsed, isMobileSidebarOpen } from '@/stores/sidebarState';
import { useConfirm } from '@/composables/useConfirm';
import '@/assets/sidebar.css';

const { appContext } = getCurrentInstance();
const { $axios, $swal } = appContext.config.globalProperties;

const router = useRouter();

// Confirm Modal
const { confirmAction, ConfirmModalComponent } = useConfirm();

const userInfoObject = ref({});
const userType = ref("");

// Mobile sidebar
const isMobile = ref(window.innerWidth <= 768);
let _savedSidebarCollapsed = null;

const toggleSidebar = () => {
  const sb = document.querySelector('.sidebar');
  const isOpen = !isMobileSidebarOpen.value;

  if (isOpen) {
    _savedSidebarCollapsed = isSidebarCollapsed.value;
    isSidebarCollapsed.value = false;
    if (sb) sb.classList.remove('collapsed');
    document.body.classList.add('sidebar-open');
    document.body.classList.add('sidebar-mobile-expanded');
    isMobileSidebarOpen.value = true;
  } else {
    isSidebarCollapsed.value = !!_savedSidebarCollapsed;
    if (sb && _savedSidebarCollapsed) sb.classList.add('collapsed');
    document.body.classList.remove('sidebar-open');
    document.body.classList.remove('sidebar-mobile-expanded');
    isMobileSidebarOpen.value = false;
    _savedSidebarCollapsed = null;
  }
};

let resizeHandler = null;
let unbindSidebarResize = null;

const admins = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');

// Pagination State
const currentPage = ref(1);
const itemsPerPage = ref(5);

// Upload modal state
const uploadedFile = ref(null);
const isUploading = ref(false);
const isDownloadingFile = ref(false);
const isDownloadingTemplate = ref(false);
const bsModalRef = ref(null);
let bsModalInstance = null;
const templateModalRef = ref(null);
let templateModalInstance = null;

// CRUD state
const crudModalRef = ref(null);
let crudModalInstance = null;
const isEditing = ref(false);
const editingId = ref(null);
const isSaving = ref(false);
const crudFormData = ref({
  AdminName: '',
  AdminEmail: ''
});

// ======= Upload Modal Functions =======
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
}

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
    const response = await $axios.get('/adminusers/template', { responseType: 'blob' });
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'adminusers_template.csv';
    if (contentDisposition) {
      const m = contentDisposition.match(/filename="?(.+?)"?$/);
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
    console.error('Failed to download template file:', err);
    $swal?.fire({ icon: 'error', title: 'ดาวน์โหลดไม่สำเร็จ', text: 'ไม่สามารถดาวน์โหลดไฟล์ตัวอย่างได้', position: 'bottom-end', toast: true, timer: 3000, showConfirmButton: false });
  } finally {
    isDownloadingTemplate.value = false;
  }
};

async function saveUpload() {
  if (!uploadedFile.value) return;
  isUploading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', uploadedFile.value);
    const resp = await $axios.post('/adminusers/upload', formData, { 
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    $swal.fire({ icon: 'success', title: resp.data?.message || 'อัปโหลดสำเร็จ!', position: 'bottom-end', toast: true, timer: 3000, showConfirmButton: false });
    await fetchAdmins();
    hideModal();
  } catch (err) {
    console.error('Upload failed', err);
    const msg = err.response?.data?.message || 'เกิดข้อผิดพลาด';
    $swal.fire({ icon: 'error', title: 'อัปโหลดไม่สำเร็จ', text: msg, position: 'bottom-end', toast: true, timer: 4000, showConfirmButton: false });
  } finally {
    isUploading.value = false;
  }
}

function onFileChange(e) {
  const f = e.target.files?.[0];
  if (!f) return;
  if (!f.name.toLowerCase().endsWith('.csv')) {
    $swal.fire({ icon: 'error', title: 'Invalid file', text: 'Please upload a CSV file.', position: 'bottom-end', toast: true, timer: 3000 });
    return;
  }
  uploadedFile.value = f;
  if (e.target) e.target.value = '';
}

function onFileDrop(e) {
  const f = e.dataTransfer?.files?.[0];
  if (!f) return;
  if (!f.name.toLowerCase().endsWith('.csv')) {
    $swal.fire({ icon: 'error', title: 'Invalid file', text: 'Please upload a CSV file.', position: 'bottom-end', toast: true, timer: 3000 });
    return;
  }
  uploadedFile.value = f;
}

const downloadLastUploadedFile = async () => {
  if (isDownloadingFile.value) return;
  isDownloadingFile.value = true;
  try {
    const response = await $axios.get('/adminusers/last-upload', { responseType: 'blob' });
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'last_uploaded_admins.csv';
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
    console.error('Failed to download:', err);
    const msg = err.response?.status === 404 ? 'ไม่พบไฟล์ที่อัปโหลดก่อนหน้า' : 'ไม่สามารถดาวน์โหลดไฟล์ได้';
    $swal.fire({ icon: 'error', title: 'ดาวน์โหลดไม่สำเร็จ', text: msg, position: 'bottom-end', toast: true, timer: 3000, showConfirmButton: false });
  } finally {
    isDownloadingFile.value = false;
  }
};

// ======= CRUD Functions =======
function resetCrudForm() {
  crudFormData.value = {
    AdminName: '',
    AdminEmail: ''
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

function openEditModal(admin) {
  // Prevent editing Super Admin
  if (admin.ParentAdminID === admin.AdminUserID) {
    $swal.fire({ icon: 'warning', title: 'ไม่สามารถแก้ไข Super Admin ได้', position: 'bottom-end', toast: true, timer: 3000, showConfirmButton: false });
    return;
  }
  
  isEditing.value = true;
  editingId.value = admin.AdminUserID;

  crudFormData.value = {
    AdminName: admin.AdminName || '',
    AdminEmail: admin.AdminEmail || ''
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
  if (!crudFormData.value.AdminName?.trim()) {
    $swal.fire({ icon: 'warning', title: 'กรุณากรอกชื่อผู้ดูแลระบบ', position: 'bottom-end', toast: true, timer: 3000, showConfirmButton: false });
    return;
  }
  if (!crudFormData.value.AdminEmail?.trim()) {
    $swal.fire({ icon: 'warning', title: 'กรุณากรอกอีเมล', position: 'bottom-end', toast: true, timer: 3000, showConfirmButton: false });
    return;
  }
  
  isSaving.value = true;
  try {
    const payload = {
      adminName: crudFormData.value.AdminName.trim(),
      adminEmail: crudFormData.value.AdminEmail.trim()
    };

    if (isEditing.value && editingId.value) {
      await $axios.put(`/adminusers/${editingId.value}`, payload);
      $swal.fire({ icon: 'success', title: 'แก้ไขผู้ดูแลระบบสำเร็จ', position: 'bottom-end', toast: true, timer: 2000, showConfirmButton: false });
    } else {
      const res = await $axios.post('/adminusers', payload);
      const generatedPassword = res.data?.data?.generatedPassword;
      if (generatedPassword) {
        $swal.fire({
          icon: 'success',
          title: 'เพิ่มผู้ดูแลระบบสำเร็จ',
          html: `<p>รหัสผ่านที่สร้างให้: <strong style="font-family: monospace; font-size: 1.2em; color: #007AFF;">${generatedPassword}</strong></p><p class="text-muted small">กรุณาบันทึกหรือแจ้งรหัสผ่านนี้ให้ผู้ดูแล</p>`,
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#007AFF'
        });
      } else {
        $swal.fire({ icon: 'success', title: 'เพิ่มผู้ดูแลระบบสำเร็จ', position: 'bottom-end', toast: true, timer: 2000, showConfirmButton: false });
      }
    }

    hideCrudModal();
    await fetchAdmins();
  } catch (err) {
    console.error('Save admin error:', err);
    const msg = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาด';
    $swal.fire({ icon: 'error', title: 'Error', text: msg, position: 'bottom-end', toast: true, timer: 4000, showConfirmButton: false });
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = async (admin) => {
  // Prevent deleting Super Admin
  if (admin.ParentAdminID === admin.AdminUserID) {
    $swal.fire({ icon: 'warning', title: 'ไม่สามารถลบ Super Admin ได้', position: 'bottom-end', toast: true, timer: 3000, showConfirmButton: false });
    return;
  }

  try {
    await confirmAction({
      title: 'ยืนยันการลบ',
      message: `คุณต้องการลบผู้ดูแลระบบ "<strong>${admin.AdminName}</strong>" หรือไม่?`,
      variant: 'danger',
      confirmText: 'ลบ',
      loadingText: 'กำลังลบ...',
      onConfirm: async () => {
        await $axios.delete(`/adminusers/${admin.AdminUserID}`);
        $swal.fire({ icon: 'success', title: 'ลบผู้ดูแลระบบสำเร็จ', position: 'bottom-end', toast: true, timer: 2000, showConfirmButton: false });
        await fetchAdmins();
      }
    });
  } catch (err) {
    console.error('Delete admin error:', err);
    const msg = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาด';
    $swal.fire({ icon: 'error', title: 'ลบไม่สำเร็จ', text: msg, position: 'bottom-end', toast: true, timer: 4000, showConfirmButton: false });
  }
};

// ======= Fetch Data =======
const fetchAdmins = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await $axios.get('/adminusers');
    // API may return either the raw array or { success: true, data: array }
    admins.value = response.data?.data || response.data || [];
  } catch (err) {
    console.error('Failed to fetch admin data:', err);
    error.value = err.response?.data?.message || 'Failed to load admin data.';
  } finally {
    loading.value = false;
  }
};

// ======= Computed & Pagination =======
const filteredAdmins = computed(() => {
  const q = (searchQuery.value || '').toString().trim().toLowerCase();
  if (!q) return admins.value;
  return admins.value.filter(admin => {
    const idStr = admin.AdminUserID != null ? admin.AdminUserID.toString().toLowerCase() : '';
    const name = (admin.AdminName || '').toLowerCase();
    const email = (admin.AdminEmail || '').toLowerCase();
    return idStr.includes(q) || name.includes(q) || email.includes(q);
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredAdmins.value.length / itemsPerPage.value)));
const totalEntries = computed(() => filteredAdmins.value.length);
const startIndex = computed(() => totalEntries.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1);
const endIndex = computed(() => totalEntries.value === 0 ? 0 : Math.min(currentPage.value * itemsPerPage.value, totalEntries.value));
const paginatedAdmins = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredAdmins.value.slice(start, start + itemsPerPage.value);
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

// ======= Lifecycle =======
onMounted(() => {
  unbindSidebarResize = bindSidebarResize();

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

  // Mobile resize listener
  resizeHandler = () => {
    const newIsMobile = window.innerWidth <= 768;
    if (newIsMobile !== isMobile.value) {
      isMobile.value = newIsMobile;
      if (!newIsMobile && isMobileSidebarOpen.value) {
        isMobileSidebarOpen.value = false;
        document.body.classList.remove('sidebar-open', 'sidebar-mobile-expanded');
        isSidebarCollapsed.value = _savedSidebarCollapsed ?? isSidebarCollapsed.value;
        _savedSidebarCollapsed = null;
      }
    }
  };
  window.addEventListener('resize', resizeHandler);

  fetchAdmins();
});

onUnmounted(() => {
  if (typeof unbindSidebarResize === 'function') unbindSidebarResize();
  if (resizeHandler) window.removeEventListener('resize', resizeHandler);
  isMobileSidebarOpen.value = false;
  document.body.classList.remove('sidebar-open', 'sidebar-mobile-expanded');
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

.mobile-sidebar-toggle {
  display: none;
  background: #fff;
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  padding: 0.6rem 0.8rem;
  font-size: 1.4rem;
  line-height: 1;
  margin-left: 1rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
  color: #007AFF;
}

.mobile-sidebar-backdrop {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

@media (max-width: 768px) {
  .mobile-sidebar-toggle {
    display: flex !important;
    align-items: center;
    justify-content: center;
  }

  .mobile-sidebar-backdrop {
    display: block;
  }

  .dashboard-container {
    grid-template-columns: 1fr;
  }

  .main-content {
    grid-column: 1 / -1;
  }
}

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
  padding: 0.5rem !important;
}



/* ===== Apple Card Style ===== */
.bg-white.shadow-apple {
  background: var(--apple-bg) !important;
  border-radius: var(--apple-radius) !important;
  box-shadow: var(--apple-shadow) !important;
  overflow: hidden;
  transition: var(--apple-transition);
}

/* ===== Page Title ===== */
.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
}

/* ===== Apple Button Style ===== */
.btn-add-apple {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(135deg, #007AFF 0%, #0056CC 100%);
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: var(--apple-transition);
  white-space: nowrap;
}

.btn-add-apple:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.btn-add-apple:active {
  transform: scale(0.98);
}

.btn-upload-apple {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: var(--apple-light-gray);
  border: 1px solid #E5E5EA;
  border-radius: 10px;
  color: #1d1d1f;
  cursor: pointer;
  font-size: 1.1rem;
  transition: var(--apple-transition);
}

.btn-upload-apple:hover {
  background: #E5E5EA;
  border-color: #D2D2D7;
}

/* ===== Search Input - Apple Style ===== */
.search-container {
  position: relative;
  width: 100%;
  max-width: 320px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--apple-gray);
  font-size: 0.95rem;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.625rem 2.5rem 0.625rem 2.25rem;
  font-size: 0.9rem;
  color: #1d1d1f;
  background: var(--apple-light-gray);
  border: 1px solid transparent;
  border-radius: 12px;
  transition: var(--apple-transition);
}

.search-input:focus {
  outline: none;
  background: var(--apple-bg);
  border-color: var(--apple-blue);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.15);
}

.search-input::placeholder {
  color: var(--apple-gray);
}

.search-clear {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--apple-gray);
  cursor: pointer;
  padding: 0.25rem;
  font-size: 0.9rem;
  transition: var(--apple-transition);
}

.search-clear:hover {
  color: #1d1d1f;
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

/* ===== Row Hover Effect - Apple Style ===== */
.table tbody tr {
  transition: var(--apple-transition);
  cursor: default;
}

.table tbody tr:hover {
  background-color: rgba(0, 122, 255, 0.04) !important;
}

.table-row-hover:hover .row-actions {
  opacity: 1;
  transform: translateX(0);
}

/* ===== Action Buttons - Apple Style ===== */
.row-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  transition: var(--apple-transition);
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none !important;
  transition: all 0.2s var(--apple-transition);
  cursor: pointer;
}

.action-btn-edit {
  color: var(--apple-blue) !important;
  background: rgba(0, 122, 255, 0.1) !important;
}

.action-btn-edit:hover:not(:disabled) {
  background: var(--apple-blue) !important;
  color: white !important;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.4);
}

.action-btn-delete {
  color: var(--apple-red) !important;
  background: rgba(255, 59, 48, 0.1) !important;
}

.action-btn-delete:hover:not(:disabled) {
  background: var(--apple-red) !important;
  color: white !important;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 59, 48, 0.4);
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-btn:active:not(:disabled) {
  transform: scale(0.95) !important;
}

/* ===== Badge Styles ===== */
.badge-super-admin {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.3px;
  color: #5e5ce6;
  background: rgba(94, 92, 230, 0.1);
  border-radius: 20px;
}

.badge-admin {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.3px;
  color: #1d1d1f;
  background: var(--apple-light-gray);
  border-radius: 20px;
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

.apple-modal .btn-secondary:hover:not(:disabled) {
  background: #E5E5EA;
}

/* ===== Upload Area - Apple Style ===== */
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

/* ===== Apple Secondary Buttons ===== */
.btn-apple-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: #1d1d1f;
  background: var(--apple-light-gray);
  border: 1px solid #E5E5EA;
  border-radius: 10px;
  cursor: pointer;
  transition: var(--apple-transition);
}

.btn-apple-secondary:hover:not(:disabled) {
  background: #E5E5EA;
  border-color: #D2D2D7;
}

.btn-apple-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===== Pagination ===== */
.pagination .page-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.6rem;
  line-height: 1;
  min-width: 2.25rem;
  height: 2.25rem;
  box-sizing: border-box;
  color: rgba(0,0,0,0.65);
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 8px;
  transition: var(--apple-transition);
}

.pagination .page-link:hover:not(.disabled) {
  background-color: rgba(0, 122, 255, 0.1);
  color: var(--apple-blue);
}

.pagination .page-item.active .page-link {
  background: var(--apple-blue);
  color: white;
  border-color: var(--apple-blue);
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }

  .search-container {
    max-width: 100%;
  }

  .btn-add-apple {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }

  .table th,
  .table td {
    padding: 0.5rem;
  }

  .action-btn {
    width: 32px;
    height: 32px;
  }
}

.main-content {
  grid-column: 2 / 3;
  flex: 1 1 auto;
  min-width: 0;
  background: #ffffff;
  overflow: auto;
  padding: 0.5rem !important;
  transition: all 0.3s ease;
}

::v-deep .dashboard-container > .sidebar.collapsed ~ .main-content {
  padding-left: 0 !important;
}

::v-deep .dashboard-container > .sidebar.collapsed ~ .main-content .container-fluid {
  padding-left: 0.25rem !important;
}

::v-deep .main-content .container-fluid {
  padding-left: 0.25rem !important;
  padding-right: 0.25rem !important;
  padding-top: 0.25rem !important;
}

.bg-white {
  margin-left: 0 !important;
  margin-right: 0 !important;
  width: 100% !important;
  box-shadow: rgba(0,0,0,0.08) 0px 6px 18px;
}

.table-responsive {
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}

.table {
  width: 100% !important;
}

/* Modal styling */
.modal-content {
  background-color: #ffffff !important;
  background-image: none !important;
  opacity: 1 !important;
}

/* Search input Apple style */
.input-group .form-control {
  background-color: #e9ecef;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 999px;
  padding: 0.55rem 1rem;
  color: #212529;
}
.input-group .form-control::placeholder {
  color: rgba(33,37,41,0.45);
}
.input-group .input-group-text {
  background: transparent;
  border: none;
  color: var(--muted-text);
}

/* Table rows hover */
.table.table-hover tbody tr:hover {
  background-color: rgba(13,110,253,0.03);
}

/* Badges */
.badge.bg-primary {
  background-color: var(--brand) !important;
}
.badge.bg-success {
  background-color: var(--accent-green) !important;
}

.shadow-apple {
  box-shadow: rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px;
}

/* Page title */
.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

/* Apple-style Add Button */
.btn-add-apple {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  background-color: #000;
  border: none;
  border-radius: 980px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-add-apple:hover {
  background-color: #333;
  transform: scale(1.02);
}

.btn-add-apple:active {
  transform: scale(0.98);
}

/* Apple-style Upload Button */
.btn-upload-apple {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-size: 1rem;
  color: #1d1d1f;
  background-color: #f5f5f7;
  border: 1px solid #d2d2d7;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-upload-apple:hover {
  background-color: #e8e8ed;
  border-color: #86868b;
}

/* Search container Apple style */
.search-container {
  position: relative;
  width: 100%;
  max-width: 280px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #86868b;
  font-size: 0.875rem;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.5rem 2rem 0.5rem 2.25rem;
  font-size: 0.875rem;
  color: #1d1d1f;
  background-color: #f5f5f7;
  border: 1px solid transparent;
  border-radius: 980px;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  background-color: #fff;
  border-color: #0071e3;
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15);
}

.search-input::placeholder {
  color: #86868b;
}

.search-clear {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #86868b;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-clear:hover {
  color: #1d1d1f;
}

/* Row Actions */
.row-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  background-color: #fff;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover:not(:disabled) {
  background-color: #f5f5f7;
  border-color: #86868b;
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Badge styles */
.badge-super-admin {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #5e5ce6;
  background-color: rgba(94, 92, 230, 0.1);
  border-radius: 980px;
}

.badge-admin {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #1d1d1f;
  background-color: #f5f5f7;
  border-radius: 980px;
}

/* Buttons */
.btn {
  border-radius: 0.5rem;
}

.btn-black {
  background-color: #000000 !important;
  color: #ffffff !important;
  border-color: #000000 !important;
  padding: 0.48rem 0.9rem;
  min-width: 96px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}

.btn-black:hover:not(:disabled) {
  background-color: #111111 !important;
  border-color: #111111 !important;
  color: #ffffff !important;
}

.btn-black:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* Apple-style small buttons */
.btn-sm {
  padding: 0.4rem 0.75rem;
  font-size: 0.813rem;
  border-radius: 0.5rem;
}

.btn-light {
  background-color: #f5f5f7 !important;
  border-color: #d2d2d7 !important;
  color: #1d1d1f !important;
}

.btn-light:hover:not(:disabled) {
  background-color: #e8e8ed !important;
  border-color: #86868b !important;
}

.btn-secondary {
  background-color: #d2d2d7 !important;
  border-color: #d2d2d7 !important;
  color: #1d1d1f !important;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #86868b !important;
  border-color: #86868b !important;
  color: #fff !important;
}

.btn-primary {
  background-color: #0071e3 !important;
  border-color: #0071e3 !important;
  color: #fff !important;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0077ed !important;
  border-color: #0077ed !important;
}

/* Modal header styling */
.modal-header {
  padding-bottom: 0;
  border-bottom: none;
}
.modal-title .fs-5 {
  color: #111827;
}

/* Apple Modal styling */
.apple-modal {
  background-color: #fff !important;
  border: none !important;
}

/* CRUD Modal styles */
.crud-modal .modal-content {
  background: #ffffff !important;
  border-radius: 1rem;
  border: none;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.crud-modal .modal-header {
  border-bottom: 1px solid #e5e7eb;
  padding: 1.25rem 1.5rem;
}

.crud-modal .modal-body {
  padding: 1.5rem;
}

.crud-modal .modal-footer {
  border-top: 1px solid #e5e7eb;
  padding: 1rem 1.5rem;
}

.crud-modal .form-label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.crud-modal .form-control {
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.625rem 0.875rem;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.crud-modal .form-control:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.crud-modal .form-control:disabled {
  background-color: #f3f4f6;
  color: #6b7280;
}

/* Pagination controls */
.pagination .page-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.6rem;
  line-height: 1;
  min-width: 2.25rem;
  height: 2.25rem;
  box-sizing: border-box;
}

.page-num {
  border: none !important;
  background-color: transparent !important;
  color: rgba(0,0,0,0.65) !important;
  padding: 0.35rem 0.6rem;
  min-width: 2.25rem;
  height: 2.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
  transition: all 0.2s ease;
}

.page-num:hover {
  border: none !important;
  color: rgba(0,0,0,0.65) !important;
  background-color: transparent !important;
}

.pagination .page-link[aria-label="First"],
.pagination .page-link[aria-label="Previous"],
.pagination .page-link[aria-label="Next"],
.pagination .page-link[aria-label="Last"] {
  border: none !important;
  background: transparent !important;
  color: rgba(0,0,0,0.55) !important;
}

/* Small / muted text */
.small, .text-muted {
  color: var(--muted-text) !important;
}

/* Responsive */
@media (max-width: 767.98px) {
  .dashboard-container {
    display: block;
  }
  ::v-deep .dashboard-container > .sidebar {
    width: 100% !important;
    min-width: 100% !important;
    height: auto !important;
  }

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
    border-radius: 0.5rem;
    box-shadow: 0 4px 12px rgba(13, 42, 76, 0.04);
    overflow: hidden;
    border: 1px solid rgba(0,0,0,0.07);
    background: var(--surface);
  }
  
  .table-responsive > .table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 1rem;
    text-align: right;
    border: none;
  }

  .table-responsive > .table td:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }

  .table-responsive > .table td[data-label]::before {
    content: attr(data-label);
    font-weight: 500;
    color: #6c757d;
    text-align: left;
    margin-right: 1rem;
  }

  .table-responsive > .table td[data-label="Role"] {
    padding: 0.5rem 1rem;
  }

  .table-responsive > .table td .role-cell {
    padding: 0;
  }

  .table-responsive > .table tr:has(td[colspan="5"]) {
    box-shadow: none;
    border: none;
    background: transparent;
  }
  
  .table-responsive > .table tr td[colspan="5"] {
    text-align: center;
    justify-content: center;
    padding: 2rem 1rem;
    color: var(--muted-text);
  }
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }

  .search-container {
    max-width: 100%;
  }

  .btn-add-apple {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }

  .table th,
  .table td {
    padding: 0.5rem;
  }

  .action-btn {
    width: 32px;
    height: 32px;
  }
}

/* Custom close button */
.btn-close-custom {
  background-color: #f1f1f1;
  border-radius: 50%;
  width: 2rem;
  height: 1.8rem;
  padding: 0.5rem;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}
.btn-close-custom:hover {
  opacity: 1;
}
</style>