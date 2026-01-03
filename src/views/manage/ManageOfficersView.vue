<template>
  <div class="dashboard-container">
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
          <p class="mt-2">Loading officer data...</p>
        </div>

        <div v-else>
          <div class="d-block d-md-flex align-items-center justify-content-between mb-3">
            <div class="d-flex align-items-center justify-content-center gap-3 header-buttons">
              <h2 class="page-title">Manage Officers</h2>
              <button class="btn-add-apple" @click="openCrudModal">
                <i class="bi bi-plus-lg me-1"></i> เพิ่มเจ้าหน้าที่
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
                placeholder="ค้นหาเจ้าหน้าที่..."
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
                    <th class="fw-bold py-3">โทรศัพท์</th>
                    <th class="fw-bold py-3">อีเมล</th>
                    <th class="fw-bold py-3">สถานะ</th>
                    <th class="fw-bold py-3">หน่วยงาน</th>
                    <th class="fw-bold py-3 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="off in paginatedOrgs" :key="off.OfficerID" class="align-middle table-row-hover">
                    <td class="py-3 ps-3">{{ off.OfficerID }}</td>
                    <td data-label="ชื่อ" class="py-3">{{ off.OfficerName }}</td>
                    <td data-label="โทรศัพท์" class="py-3">{{ off.OfficerPhone || '-' }}</td>
                    <td data-label="อีเมล" class="py-3">{{ off.OfficerEmail || '-' }}</td>
                    <td data-label="สถานะ" class="py-3">
                      <span :class="off.OfficerStatus === 1 ? 'badge-active' : 'badge-inactive'">
                        {{ off.OfficerStatus === 1 ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td data-label="หน่วยงาน" class="py-3">{{ off.OrgName || '-' }}</td>
                    <td class="py-3 text-center">
                      <div class="row-actions">
                        <button class="action-btn action-btn-edit" @click="openEditModal(off)" title="แก้ไข">
                          <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="action-btn action-btn-delete" @click="confirmDelete(off)" title="ลบ">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="paginatedOrgs.length === 0">
                    <td colspan="7" class="text-center text-muted py-3">ไม่พบข้อมูลเจ้าหน้าที่</td>
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
              <div class="text-muted fs-6">เจ้าหน้าที่ CSV</div>
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

    <!-- CRUD Modal for Add/Edit Officer -->
    <div class="modal fade" ref="crudModalRef" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content apple-modal rounded-4 p-3 shadow-lg">
          <div class="modal-header border-0">
            <h5 class="modal-title">{{ isEditing ? 'แก้ไขเจ้าหน้าที่' : 'เพิ่มเจ้าหน้าที่ใหม่' }}</h5>
            <button type="button" class="btn-close" @click="hideCrudModal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveCrudForm">
              <div class="mb-3">
                <label class="form-label fw-bold">ชื่อเจ้าหน้าที่ <span class="text-danger">*</span></label>
                <input type="text" class="form-control" v-model="crudFormData.OfficerName" required placeholder="เช่น นายสมชาย ใจดี">
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">โทรศัพท์</label>
                <input type="tel" class="form-control" v-model="crudFormData.OfficerPhone" placeholder="08xxxxxxxx">
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">อีเมล <span class="text-danger">*</span></label>
                <input type="email" class="form-control" v-model="crudFormData.OfficerEmail" required placeholder="example@pcru.ac.th">
              </div>
              <!-- Status hidden: always set to Active (1) -->
              <div class="mb-3">
                <label class="form-label fw-bold">หน่วยงาน <span class="text-danger">*</span></label>
                <select class="form-select" v-model="crudFormData.OrgID" required>
                  <option value="" disabled v-if="!crudFormData.OrgID">เลือกหน่วยงาน</option>
                  <option v-for="org in orgOptions" :key="org.OrgID" :value="Number(org.OrgID)">
                    {{ org.OrgName }}
                  </option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-secondary rounded-3" @click="hideCrudModal">ยกเลิก</button>
            <button type="button" class="btn btn-primary rounded-3" @click="saveCrudForm" :disabled="isSaving">
              <span v-if="isSaving" class="spinner-border spinner-border-sm me-1"></span>
              {{ isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มเจ้าหน้าที่' }}
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
import { ref, onMounted, onUnmounted, computed, nextTick, watch, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { Modal, Tooltip } from 'bootstrap';

import Sidebar from '@/components/Sidebar.vue';
import { bindSidebarResize, isSidebarCollapsed, isMobileSidebarOpen } from '@/stores/sidebarState';
import { useConfirm } from '@/composables/useConfirm';
import '@/assets/sidebar.css';
import ex3Url from '@/assets/ex3.svg';

const router = useRouter();
const { appContext } = getCurrentInstance();
const $axios = appContext.config.globalProperties.$axios;
const $swal = appContext.config.globalProperties.$swal;

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

const organizations = ref([]);
const orgOptions = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');

// pagination
const currentPage = ref(1);
const itemsPerPage = ref(5);

// upload state
const uploadedFile = ref(null);
const isUploading = ref(false);
const bsModalRef = ref(null);
let bsModalInstance = null;

// Download state
const isDownloadingFile = ref(false);
const isDownloadingTemplate = ref(false);

// Template modal
const templateModalRef = ref(null);
let templateModalInstance = null;

// CRUD state
const crudModalRef = ref(null);
let crudModalInstance = null;
const isEditing = ref(false);
const editingId = ref(null);
const isSaving = ref(false);
const crudFormData = ref({
  OfficerName: '',
  OfficerPhone: '',
  OfficerEmail: '',
  OfficerPassword: '',
  OfficerStatus: 1,
  OrgID: ''
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
    const resp = await $axios.post('/officers/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    $swal?.fire({ icon: 'success', title: resp.data?.message || 'อัปโหลดสำเร็จ!', position: 'bottom-end', toast: true, timer: 3000, showConfirmButton: false });
    await fetchOrgs();
    hideModal();
  } catch (err) {
    console.error('Upload failed', err);
    const msg = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาด';
    $swal?.fire({ icon: 'error', title: 'อัปโหลดไม่สำเร็จ', text: msg, position: 'bottom-end', toast: true, timer: 4000, showConfirmButton: false });
  } finally {
    isUploading.value = false;
  }
};

// ======= CRUD Functions =======
function resetCrudForm() {
  crudFormData.value = {
    OfficerName: '',
    OfficerPhone: '',
    OfficerEmail: '',
    OfficerPassword: '',
    OfficerStatus: 1,
    OrgID: ''
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

async function openEditModal(officer) {
  isEditing.value = true;
  editingId.value = officer.OfficerID;

  // Ensure organization options are loaded so the select can match the value
  if (!orgOptions.value || orgOptions.value.length === 0) {
    try {
      await fetchOrgOptions();
    } catch (e) {
      console.error('Failed to load org options before opening edit modal', e);
    }
  }

  // Find matching organization in orgOptions (compare numerically) and set OrgID accordingly
  let selectedOrgId = '';
  if (officer.OrgID != null) {
    const numOrgId = Number(officer.OrgID);
    const match = orgOptions.value.find(o => Number(o.OrgID) === numOrgId);
    if (match) selectedOrgId = Number(match.OrgID);
  }
  // Fallback: match by name when OrgID is null but OrgName exists
  if (!selectedOrgId && officer.OrgName) {
    const byName = orgOptions.value.find(o => (o.OrgName || '').trim() === (officer.OrgName || '').trim());
    if (byName) selectedOrgId = Number(byName.OrgID);
  }

  crudFormData.value = {
    OfficerName: officer.OfficerName || '',
    OfficerPhone: officer.OfficerPhone || '',
    OfficerEmail: officer.OfficerEmail || '',
    OfficerPassword: '',
    OfficerStatus: officer.OfficerStatus ?? 1,
    OrgID: selectedOrgId
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
  if (!crudFormData.value.OfficerName?.trim()) {
    $swal?.fire({ icon: 'warning', title: 'กรุณากรอกชื่อเจ้าหน้าที่', position: 'bottom-end', toast: true, timer: 3000, showConfirmButton: false });
    return;
  }
  if (!crudFormData.value.OfficerEmail?.trim()) {
    $swal?.fire({ icon: 'warning', title: 'กรุณากรอกอีเมล', position: 'bottom-end', toast: true, timer: 3000, showConfirmButton: false });
    return;
  }
  // Require organization selection
  if (!crudFormData.value.OrgID) {
    $swal?.fire({ icon: 'warning', title: 'กรุณาเลือกหน่วยงาน', position: 'bottom-end', toast: true, timer: 3000, showConfirmButton: false });
    return;
  }
  
  isSaving.value = true;
  try {
    const payload = {
      officerName: crudFormData.value.OfficerName.trim(),
      officerPhone: crudFormData.value.OfficerPhone?.trim() || null,
      officerEmail: crudFormData.value.OfficerEmail.trim(),
      officerStatus: 1, // Always Active
      orgID: crudFormData.value.OrgID !== '' ? Number(crudFormData.value.OrgID) : null
    };

    if (isEditing.value && editingId.value) {
      await $axios.put(`/officers/crud/update/${editingId.value}`, payload);
      $swal?.fire({ icon: 'success', title: 'แก้ไขเจ้าหน้าที่สำเร็จ', position: 'bottom-end', toast: true, timer: 2000, showConfirmButton: false });
    } else {
      const res = await $axios.post('/officers/crud/create', payload);
      // Show generated password to admin
      const generatedPassword = res.data?.generatedPassword;
      if (generatedPassword) {
        $swal?.fire({
          icon: 'success',
          title: 'เพิ่มเจ้าหน้าที่สำเร็จ',
          html: `<p>รหัสผ่านที่สร้างให้: <strong style="font-family: monospace; font-size: 1.2em; color: #007AFF;">${generatedPassword}</strong></p><p class="text-muted small">กรุณาบันทึกหรือแจ้งรหัสผ่านนี้ให้เจ้าหน้าที่</p>`,
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#007AFF'
        });
      } else {
        $swal?.fire({ icon: 'success', title: 'เพิ่มเจ้าหน้าที่สำเร็จ', position: 'bottom-end', toast: true, timer: 2000, showConfirmButton: false });
      }
    }

    hideCrudModal();
    await fetchOrgs();
  } catch (err) {
    console.error('Save officer error:', err);
    const msg = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาด';
    $swal?.fire({ icon: 'error', title: 'Error', text: msg, position: 'bottom-end', toast: true, timer: 4000, showConfirmButton: false });
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = async (officer) => {
  try {
    await confirmAction({
      title: 'ยืนยันการลบ',
      message: `คุณต้องการลบเจ้าหน้าที่ "<strong>${officer.OfficerName}</strong>" หรือไม่?`,
      variant: 'danger',
      confirmText: 'ลบ',
      loadingText: 'กำลังลบ...',
      onConfirm: async () => {
        await $axios.delete(`/officers/crud/delete/${officer.OfficerID}`);
        $swal?.fire({ icon: 'success', title: 'ลบเจ้าหน้าที่สำเร็จ', position: 'bottom-end', toast: true, timer: 2000, showConfirmButton: false });
        await fetchOrgs();
      }
    });
  } catch (err) {
    console.error('Delete officer error:', err);
    const msg = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาด';
    $swal?.fire({ icon: 'error', title: 'ลบไม่สำเร็จ', text: msg, position: 'bottom-end', toast: true, timer: 4000, showConfirmButton: false });
  }
};

// ======= Fetch Data =======
const fetchOrgs = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await $axios.get('/officers');
    organizations.value = response.data?.data || response.data || [];
  } catch (err) {
    console.error('Failed to fetch officers:', err);
    error.value = err.response?.data?.message || 'Failed to load officer data.';
  } finally {
    loading.value = false;
  }
};

const fetchOrgOptions = async () => {
  try {
    const response = await $axios.get('/officers/crud/organizations');
    orgOptions.value = response.data?.data || [];
  } catch (err) {
    console.error('Failed to fetch organizations:', err);
  }
};

// ======= Computed & Pagination =======
const filteredOrgs = computed(() => {
  const q = (searchQuery.value || '').toString().trim().toLowerCase();
  if (!q) return organizations.value;
  return organizations.value.filter(off => {
    const idStr = off.OfficerID != null ? off.OfficerID.toString().toLowerCase() : '';
    const name = (off.OfficerName || '').toLowerCase();
    const phone = (off.OfficerPhone || '').toLowerCase();
    const email = (off.OfficerEmail || '').toLowerCase();
    return idStr.includes(q) || name.includes(q) || phone.includes(q) || email.includes(q);
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredOrgs.value.length / itemsPerPage.value)));
const totalEntries = computed(() => filteredOrgs.value.length);
const startIndex = computed(() => totalEntries.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1);
const endIndex = computed(() => totalEntries.value === 0 ? 0 : Math.min(currentPage.value * itemsPerPage.value, totalEntries.value));
const paginatedOrgs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredOrgs.value.slice(start, start + itemsPerPage.value);
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

// ======= Template Modal =======
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
    const response = await $axios.get('/officers/crud/template', { responseType: 'blob' });
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'officers_template.csv';
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

const downloadLastUploadedFile = async () => {
  if (isDownloadingFile.value) return;
  isDownloadingFile.value = true;
  try {
    const response = await $axios.get('/officers/last-upload', { responseType: 'blob' });
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'last_uploaded_officers.csv';
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
    const msg = err.response?.status === 404 ? 'ไม่พบไฟล์ที่อัปโหลดก่อนหน้า' : 'ไม่สามารถดาวน์โหลดไฟล์ได้';
    $swal?.fire({ icon: 'error', title: 'ดาวน์โหลดไม่สำเร็จ', text: msg, position: 'bottom-end', toast: true, timer: 3000, showConfirmButton: false });
  } finally {
    isDownloadingFile.value = false;
  }
};

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

  fetchOrgs();
  fetchOrgOptions();
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

  .header-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .header-buttons h2 {
    width: 100%;
    text-align: center;
  }

  .header-buttons button {
    width: 100%;
  }
}

/* Apple Design System Variables */
:root {
  --apple-blue: #007AFF;
  --apple-blue-hover: #0056b3;
  --apple-gray: #8E8E93;
  --apple-gray-light: #F2F2F7;
  --apple-red: #FF3B30;
  --apple-green: #34C759;
  --apple-transition: cubic-bezier(0.25, 0.1, 0.25, 1);
}

.dashboard-container {
  display: flex;
  width: 100%;
  min-height: 100vh;
}

.main-content {
  flex-grow: 1;
  background-color: #f8f9fa;
  overflow-x: hidden;
  padding: 0.5rem !important;
}

.main-content .container-fluid {
  padding: 0 !important;
  margin: 0;
}

/* Page Title */
.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
}
.header-buttons {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

/* Apple Style Buttons */
.btn-add-apple {
  background: linear-gradient(135deg, #007AFF 0%, #0056b3 100%) !important;
  color: #ffffff !important;
  border: none !important;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s var(--apple-transition);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
  cursor: pointer;
}

.btn-add-apple:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 122, 255, 0.4);
  background: linear-gradient(135deg, #0056b3 0%, #003d80 100%) !important;
  color: #ffffff !important;
}

.btn-upload-apple {
  background: linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%);
  color: #1d1d1f;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s var(--apple-transition);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-upload-apple:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #e8e8ed 0%, #d1d1d6 100%);
}

/* Search Container */
.search-container {
  position: relative;
  max-width: 320px;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 12px 44px 12px 44px;
  border: 2px solid #e8e8ed;
  border-radius: 14px;
  font-size: 0.95rem;
  transition: all 0.3s var(--apple-transition);
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: var(--apple-blue);
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
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
  background: #e8e8ed;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-clear:hover {
  background: #d1d1d6;
}

/* Table Styles */
.table-row-hover {
  transition: all 0.2s var(--apple-transition);
}

.table-row-hover:hover {
  background: linear-gradient(90deg, rgba(0, 122, 255, 0.05) 0%, rgba(0, 122, 255, 0.02) 100%);
}

/* Action Buttons */
.row-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s var(--apple-transition);
  cursor: pointer;
}

.action-btn-edit {
  background: rgba(0, 122, 255, 0.1);
  color: var(--apple-blue);
}

.action-btn-edit:hover {
  background: var(--apple-blue);
  color: white;
  transform: scale(1.1);
}

.action-btn-delete {
  background: rgba(255, 59, 48, 0.1);
  color: var(--apple-red);
}

.action-btn-delete:hover {
  background: var(--apple-red);
  color: white;
  transform: scale(1.1);
}

/* Status Badges */
.badge-active {
  background: linear-gradient(135deg, #34C759 0%, #30D158 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-inactive {
  background: linear-gradient(135deg, #FF3B30 0%, #FF453A 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Apple Modal */
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

.apple-modal .modal-header {
  padding-bottom: 0;
}

.apple-modal .modal-title {
  font-weight: 700;
  color: #1d1d1f;
}

/* Upload Drop Area Apple Style */
.upload-drop-area-apple {
  background: linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%);
  border: 2px dashed #c7c7cc;
  border-radius: 16px;
  padding: 40px 20px;
  cursor: pointer;
  transition: all 0.3s var(--apple-transition);
}

.upload-drop-area-apple:hover {
  border-color: var(--apple-blue);
  background: linear-gradient(135deg, #e8f4ff 0%, #d6e9ff 100%);
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

.upload-icon-wrapper i {
  font-size: 1.75rem;
  color: white;
}

.upload-drop-area-apple:hover .upload-icon-wrapper {
  transform: scale(1.1);
  box-shadow: 0 8px 24px rgba(0, 122, 255, 0.3);
}

.upload-drop-area-apple.has-file {
  border-color: var(--apple-green);
  background: linear-gradient(180deg, #F0FFF4 0%, #E8FFE8 100%);
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

/* Pagination Apple Style */
.pagination-apple .page-link {
  border: none;
  color: var(--apple-gray);
  padding: 8px 14px;
  margin: 0 2px;
  border-radius: 8px;
  transition: all 0.2s var(--apple-transition);
}

.pagination-apple .page-item.active .page-link {
  background: var(--apple-blue);
  color: white;
}

.pagination-apple .page-link:hover {
  background: var(--apple-gray-light);
}

/* Responsive */
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
  }

  .table-responsive > .table td::before {
    content: attr(data-label);
    font-weight: bold;
    color: #6c757d;
  }
}
</style>
