<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <Sidebar :userType="userType" :userInfoObject="userInfoObject" />
    <div v-if="isMobileSidebarOpen" class="mobile-sidebar-backdrop" @click="toggleSidebar" aria-hidden="true"></div>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container-fluid pt-2 px-4 pb-5">
        
        <!-- Header -->
        <div class="d-flex align-items-center justify-content-between mb-4 fade-in-up">
          <div class="d-flex align-items-center gap-3">
            <button class="mobile-sidebar-toggle mobile-inline-toggle" @click.stop="toggleSidebar" :aria-label="isMobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'">
              <AnimatedToggleIcon :isOpen="isMobileSidebarOpen" />
            </button>
            <!-- Animated Icon Box (Green Gradient) -->
            <div class="apple-icon-box green-gradient">
              <svg class="check-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path class="check-path" d="M20 6L9 17l-5-5"></path>
              </svg>
            </div>
            <div>
              <h3 class="page-title m-0">Handled Feedbacks</h3>
              <span class="text-secondary small">ประวัติ Feedback ที่ตรวจสอบแล้ว</span>
            </div>
          </div>

          <!-- Auto-delete Warning -->
          <div class="auto-delete-notice">
            <i class="bi bi-info-circle-fill"></i>
            <span>ระบบจะลบ Feedback ที่จัดการแล้วโดยอัตโนมัติหลังจาก <strong>30 วัน</strong></span>
          </div>
          
          <!-- Live Status Badge -->
          <div class="d-flex align-items-center gap-2">
            <div class="apple-status-badge" :class="{ 'online': wsConnected }">
              <span class="status-dot"></span>
              <span>{{ wsConnected ? 'Live' : 'Offline' }}</span>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5 fade-in">
          <div class="apple-spinner"></div>
          <p class="mt-3 text-secondary">กำลังโหลดข้อมูล...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="alert apple-alert-danger mx-auto" role="alert">
          <i class="bi bi-exclamation-circle-fill me-2"></i> {{ error }}
        </div>

        <div v-else class="fade-in-up" style="animation-delay: 0.1s;">
          
          <!-- Stats Cards -->
          <div class="row mb-4 g-3">
            <div class="col-12">
              <div class="apple-stat-card">
                <div class="stat-icon-wrapper green-gradient">
                  <i class="bi bi-check2-circle"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ totalEntries }}</div>
                  <div class="stat-label">จัดการแล้วทั้งหมด</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Charts Section (hidden when no data) -->
          <div v-if="hasChartData" class="row mb-4 g-4">
            <div class="col-12 col-lg-6">
              <div class="apple-card chart-card h-100">
                <div class="card-header-clean">
                  <h5>สัดส่วนปัญหา (Reasons)</h5>
                </div>
                <div class="chart-area w-100">
                  <div class="chart-wrapper">
                    <DoughnutChart :chart-data="pieData" :chart-options="chartOptions" style="height: 260px;" />
                  </div>
                </div>
              </div>
            </div>
            <div class="col-12 col-lg-6">
              <div class="apple-card chart-card h-100">
                <div class="card-header-clean">
                  <h5>กิจกรรมย้อนหลัง (Activity)</h5>
                </div>
                <div class="chart-area w-100">
                  <div class="chart-wrapper">
                    <BarChart :chart-data="barChartData" :chart-options="barChartOptions" style="height: 260px;" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Table Section -->
          <div class="apple-card table-wrapper">
            <div class="card-header-actions p-3 d-flex justify-content-between align-items-center">
              
              <!-- Total Counter -->
              <div class="apple-counter-capsule">
                <span class="label">Total</span>
                <span class="separator">|</span>
                <span class="count">{{ totalEntries }}</span>
              </div>

              <!-- Search -->
              <div class="search-container">
                <i class="bi bi-search search-icon"></i>
                <input
                  type="text"
                  class="search-input"
                  placeholder="ค้นหา..."
                  v-model="localSearch"
                />
                <button v-if="localSearch" class="search-clear" @click="localSearch = ''">
                  <i class="bi bi-x-circle-fill"></i>
                </button>
              </div>
            </div>
            
            <!-- Apple Filters -->
            <AppleFilters
              v-model="handledFilters"
              :show-sort="true"
              :sort-options="handledSortOptions"
              default-sort-by="date"
              default-sort-order="desc"
              :show-date-presets="true"
              :custom-date-presets="handledDatePresets"
              :show-date-range="true"
              @change="onHandledFiltersChange"
            />

            <div class="table-responsive">
              <table class="table apple-table mb-0">
                <thead>
                  <tr>
                    <th class="ps-4" style="width: 80px;">ID</th>
                    <th style="width: 120px;">สถานะ</th>
                    <th>วันที่</th>
                    <th>คำถามผู้ใช้</th>
                    <th>เหตุผล & ความเห็น</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in paginatedItems" :key="item.FeedbackID" class="align-middle apple-row" @click="openDetails(item)">
                    <td data-label="ID" class="ps-4 fw-medium text-secondary">{{ item.FeedbackID }}</td>
                    <td data-label="สถานะ" class="py-3">
                       <span class="feedback-pill unlike">
                          <i class="bi bi-hand-thumbs-down-fill me-1"></i> Unlike
                       </span>
                    </td>
                    <td data-label="วันที่" class="py-3">
                      <span 
                        class="apple-badge-gray"
                        data-bs-toggle="tooltip" 
                        data-bs-placement="top" 
                        :title="formatFullDateTime(item.Timestamp)"
                      >
                        {{ formatRelativeTime(item.Timestamp) }}
                      </span>
                    </td>
                    <td data-label="คำถาม" class="py-3">
                      <div class="text-dark fw-medium text-truncate" style="max-width: 250px;" :title="item.UserQuery">
                        {{ item.UserQuery || '-' }}
                      </div>
                    </td>
                    <td data-label="เหตุผล" class="py-3">
                      <div v-if="item.FeedbackReason" class="d-flex align-items-center gap-2 flex-wrap">
                         <span class="reason-tag">{{ formatReason(item.FeedbackReason) }}</span>
                         <span v-if="item.FeedbackComment" class="text-secondary small text-truncate" style="max-width: 150px;" :title="item.FeedbackComment">
                           — {{ item.FeedbackComment }}
                         </span>
                      </div>
                      <span v-else class="text-muted small opacity-50">-</span>
                    </td>

                  </tr>
                  <tr v-if="filteredItems.length === 0">
                    <td colspan="6" class="text-center text-muted py-5">
                      <div class="empty-state">
                        <i class="bi bi-folder-check fs-1 mb-2 opacity-50"></i>
                        <p>ไม่พบรายการที่ค้นหา</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div class="d-flex justify-content-between align-items-center p-3 border-top bg-white rounded-bottom-4">
              <div class="small text-secondary">
                แสดง {{ startIndex }} - {{ endIndex }} จาก {{ totalEntries }} รายการ
              </div>
              <nav aria-label="Page navigation">
                <ul class="pagination pagination-sm mb-0 align-items-center">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="firstPage">&laquo;</a>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="prevPage">&lsaquo;</a>
                  </li>
                  <li v-for="p in pagesToShow" :key="p" class="page-item" :class="{ active: currentPage === p }">
                    <a class="page-link page-num" href="#" @click.prevent="goToPage(p)">{{ p }}</a>
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

    <!-- Details Modal (Apple Style) - Teleported to body for proper z-index layering -->
    <Teleport to="body">
      <transition name="apple-zoom">
        <div v-if="showDetailModal" class="apple-modal-overlay" @click.self="closeDetailModal">
          <div class="apple-modal-content">
            <div class="apple-modal-header">
              <div class="d-flex flex-column">
                <h5 class="apple-modal-title">รายละเอียด Feedback</h5>
                <span class="apple-modal-subtitle">ID: {{ selectedItem?.FeedbackID }}</span>
              </div>
              <button class="apple-close-btn" @click="closeDetailModal">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            <div class="apple-modal-body">
               
               <div class="detail-section">
                  <label>คำถามจากผู้ใช้ (User Query)</label>
                  <div class="detail-value text-dark fw-medium">{{ selectedItem?.UserQuery || '-' }}</div>
               </div>

               <div class="detail-section">
                  <label>คำตอบที่ระบบจับคู่ (Matched Answer)</label>
                  <div class="detail-value text-primary">
                    <i class="bi bi-arrow-return-right me-2"></i>{{ selectedItem?.QuestionText || '-' }}
                  </div>
               </div>

               <div class="row g-3 mb-3">
                  <div class="col-6">
                     <div class="detail-section">
                        <label>สถานะ (Status)</label>
                        <div>
                           <span class="feedback-pill unlike">
                             <i class="bi bi-hand-thumbs-down-fill me-1"></i> Unlike
                           </span>
                        </div>
                     </div>
                  </div>
                  <div class="col-6">
                     <div class="detail-section">
                        <label>เหตุผล (Reason)</label>
                        <div class="detail-value">{{ formatReason(selectedItem?.FeedbackReason) }}</div>
                     </div>
                  </div>
               </div>

               <div class="detail-section">
                  <label>ความคิดเห็น (Comment)</label>
                  <div class="detail-value bg-light p-3 rounded-3 border-0 text-secondary">
                    {{ selectedItem?.FeedbackComment || 'ไม่มีความคิดเห็นเพิ่มเติม' }}
                  </div>
               </div>

               <div class="detail-section mt-4 pt-3 border-top">
                  <div class="d-flex align-items-center justify-content-between text-secondary small">
                     <span><i class="bi bi-clock me-1"></i> บันทึกเมื่อ: {{ formatFullDateTime(selectedItem?.Timestamp) }}</span>
                     <span class="text-success fw-medium"><i class="bi bi-check-circle-fill me-1"></i> ดำเนินการแล้ว</span>
                  </div>
               </div>
            </div>
            <div class="apple-modal-footer">
               <button class="btn-apple-secondary" @click="closeDetailModal">ปิดหน้าต่าง</button>
               <button 
                  class="btn-apple-primary" 
                  @click="restoreFeedbackAndClose(selectedItem)" 
                  :disabled="restoringId === selectedItem?.FeedbackID"
               >
                  <span v-if="restoringId === selectedItem?.FeedbackID" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-arrow-counterclockwise me-2"></i>
                  กู้คืน Feedback
               </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { DoughnutChart, BarChart } from 'vue-chart-3';
import { Chart, registerables } from 'chart.js';
import { createWebSocketConnection, WS_ENDPOINTS } from '@/config/websocket';
import { formatRelativeTime } from '@/utils/formatTime';
import { Tooltip } from 'bootstrap';
import Sidebar from '@/components/Sidebar.vue';
import AnimatedToggleIcon from '@/components/AnimatedToggleIcon.vue';
import AppleFilters from '@/components/AppleFilters.vue';
import { bindSidebarResize, isSidebarCollapsed, isMobileSidebarOpen } from '@/stores/sidebarState';
import '@/assets/sidebar.css';
import '@/assets/dashboard-styles.css';

Chart.register(...registerables);

const router = useRouter();
const { appContext } = getCurrentInstance();
const $axios = appContext.config.globalProperties.$axios;

// User Info & Sidebar
const userInfoObject = ref({});
const userType = ref('');
let unbindSidebarResize = null;
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

// State
const items = ref([]);
const loading = ref(true);
const error = ref(null);
const localSearch = ref('');
const wsConnected = ref(false);
const restoringId = ref(null);
let ws = null;

// Apple Filters Configuration
const handledFilters = ref({
  sortBy: 'date',
  sortOrder: 'desc',
  status: '',
  datePreset: 'all',
  dateFrom: '',
  dateTo: ''
});

const handledSortOptions = [
  { value: 'date', label: 'วันที่' },
  { value: 'id', label: 'รหัส' },
  { value: 'reason', label: 'เหตุผล' }
];

// Custom date presets สำหรับ Handled Feedbacks (เก็บแค่ 30 วัน)
const handledDatePresets = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'today', label: 'วันนี้' },
  { value: 'week', label: '7 วัน' },
  { value: 'month', label: '30 วัน' }
];

function onHandledFiltersChange() {
  currentPage.value = 1;
}

// Modal State
const showDetailModal = ref(false);
const selectedItem = ref(null);

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(5);

// Colors
const colors = ['#34C759', '#FF3B30', '#007AFF', '#FF9500', '#AF52DE', '#5856D6'];

// Lifecycle
onMounted(() => {
  // Sidebar Logic
  unbindSidebarResize = bindSidebarResize();
  const token = localStorage.getItem('userToken');
  const type = localStorage.getItem('userType');
  const userInfoString = localStorage.getItem('userInfo');
  if (!token) { router.replace({ name: 'login' }); return; }
  if (type) userType.value = type;
  if (userInfoString) { try { userInfoObject.value = JSON.parse(userInfoString); } catch(e) {} }

  // Close sidebar on mount
  isMobileSidebarOpen.value = false;
  document.body.classList.remove('sidebar-open');
  document.body.classList.remove('sidebar-mobile-expanded');

  fetchData();
  
  ws = createWebSocketConnection(WS_ENDPOINTS.FEEDBACKS, {
    axios: $axios,
    onMessage: (message) => {
      // Refresh on update (handled feedback might be deleted or modified, though less likely)
      if (message?.type?.includes('UPDATE') || message?.action?.includes('handle')) {
        fetchData();
      }
    },
    onOpen: () => { wsConnected.value = true; },
    onClose: () => { wsConnected.value = false; }
  });
});

onUnmounted(() => { 
  if (ws) ws.disconnect(); 
  if (typeof unbindSidebarResize === 'function') unbindSidebarResize();
  isMobileSidebarOpen.value = false;
  document.body.classList.remove('sidebar-open');
  document.body.classList.remove('sidebar-mobile-expanded');
});

// Watchers
watch(localSearch, () => { currentPage.value = 1; });
watch(items, () => { nextTick(() => initTooltips()); });
watch(handledFilters, () => { currentPage.value = 1; }, { deep: true });

// Fetch Data
const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await $axios.get('/feedbacks/handled');
    // Normalize response: backend returns array directly, but guard against unexpected shapes
    const raw = res.data?.data ?? res.data;
    if (Array.isArray(raw)) {
      items.value = raw;
    } else if (raw && typeof raw === 'object' && Array.isArray(raw.rows)) {
      items.value = raw.rows; // fallback if backend wraps rows
    } else if (raw && typeof raw === 'object' && raw.success && Array.isArray(raw.data)) {
      items.value = raw.data; // fallback for success wrapper
    } else {
      console.warn('HandledFeedbacks: unexpected response shape for /feedbacks/handled', raw);
      items.value = [];
    }
  } catch (err) {
    console.error('Failed to fetch handled feedbacks:', err);
    items.value = []; 
    error.value = "Failed to load history.";
  } finally {
    loading.value = false;
    nextTick(() => initTooltips());
  }
};

// Computed
const filteredItems = computed(() => {
  let arr = Array.isArray(items.value) ? items.value : [];
  
  // Force filter: Only Unlikes (This page is for handled unlikes only)
  arr = arr.filter(i => !isLike(i));
  
  // Apply date range filter
  if (handledFilters.value.dateFrom) {
    const fromDate = new Date(handledFilters.value.dateFrom);
    fromDate.setHours(0, 0, 0, 0);
    arr = arr.filter(i => {
      if (!i.Timestamp) return false;
      return new Date(i.Timestamp) >= fromDate;
    });
  }
  if (handledFilters.value.dateTo) {
    const toDate = new Date(handledFilters.value.dateTo);
    toDate.setHours(23, 59, 59, 999);
    arr = arr.filter(i => {
      if (!i.Timestamp) return false;
      return new Date(i.Timestamp) <= toDate;
    });
  }
  
  // Apply search filter
  const q = (localSearch.value || '').toLowerCase().trim();
  if (q) {
    arr = arr.filter(i => 
      String(i.UserQuery || '').toLowerCase().includes(q) ||
      String(i.FeedbackComment || '').toLowerCase().includes(q) ||
      String(i.FeedbackReason || '').toLowerCase().includes(q)
    );
  }
  
  return arr;
});

// Sort filtered items based on AppleFilters settings
const sortedItems = computed(() => {
  const arr = filteredItems.value.slice();
  const { sortBy, sortOrder } = handledFilters.value;
  const order = sortOrder === 'asc' ? 1 : -1;
  
  return arr.sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'date') {
      const aTime = a?.Timestamp ? new Date(a.Timestamp).getTime() : 0;
      const bTime = b?.Timestamp ? new Date(b.Timestamp).getTime() : 0;
      comparison = aTime - bTime;
    } else if (sortBy === 'id') {
      comparison = (a?.FeedbackID || 0) - (b?.FeedbackID || 0);
    } else if (sortBy === 'reason') {
      comparison = (a?.FeedbackReason || '').localeCompare(b?.FeedbackReason || '', 'th');
    }
    
    return comparison * order;
  });
});

// Helper for check like
function isLike(item) {
  return item?.FeedbackValue === 1 || item?.FeedbackValue === true;
}

// Stats
const totalEntries = computed(() => filteredItems.value.length);
const likeCount = computed(() => Array.isArray(filteredItems.value) ? filteredItems.value.filter(i => isLike(i)).length : 0);
const unlikeCount = computed(() => Array.isArray(filteredItems.value) ? filteredItems.value.filter(i => !isLike(i)).length : 0);
const hasChartData = computed(() => totalEntries.value > 0);

// Charts
const pieData = computed(() => {
  const source = Array.isArray(filteredItems.value) ? filteredItems.value : [];
  const reasons = {};
  source.forEach(i => {
    if (i && i.FeedbackReason) {
      const r = formatReason(i.FeedbackReason);
      reasons[r] = (reasons[r] || 0) + 1;
    }
  });
  return {
    labels: Object.keys(reasons),
    datasets: [{
      data: Object.values(reasons),
      backgroundColor: colors,
      borderWidth: 0
    }]
  };
});

const barChartData = computed(() => {
  const source = Array.isArray(filteredItems.value) ? filteredItems.value : [];
  const days = {};
  source.forEach(i => {
    if (i && i.Timestamp) {
      const d = String(i.Timestamp).split('T')[0];
      days[d] = (days[d] || 0) + 1;
    }
  });
  const labels = Object.keys(days).sort().slice(-7); // Last 7 days
  const data = labels.map(d => days[d] || 0);
  
  return {
    labels,
    datasets: [{
      label: 'Handled Feedbacks',
      data,
      backgroundColor: '#34C759',
      borderRadius: 4,
      barThickness: 20
    }]
  };
});

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
    y: { beginAtZero: true, grid: { borderDash: [4,4], color: '#f0f0f0' }, ticks: { precision: 0 } },
    x: { grid: { display: false } } 
  }
};

// Pagination
const totalPages = computed(() => Math.ceil(totalEntries.value / itemsPerPage.value) || 1);
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value + 1);
const endIndex = computed(() => Math.min(currentPage.value * itemsPerPage.value, totalEntries.value));
const paginatedItems = computed(() => {
  const arr = Array.isArray(sortedItems.value) ? sortedItems.value : [];
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return arr.slice(start, start + itemsPerPage.value);
});

const pagesToShow = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  if (total <= 5) return Array.from({length: total}, (_, i) => i + 1);
  if (current <= 3) return [1,2,3,4,5];
  if (current >= total - 2) return [total-4, total-3, total-2, total-1, total];
  return [current-1, current, current+1, current+2];
});

// Methods
function goToPage(p) { if(p>=1 && p<=totalPages.value) currentPage.value = p; }
function prevPage() { goToPage(currentPage.value - 1); }
function nextPage() { goToPage(currentPage.value + 1); }
function firstPage() { goToPage(1); }
function lastPage() { goToPage(totalPages.value); }

function formatFullDateTime(ts) {
  if (!ts) return '-';
  return new Date(ts).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatReason(r) {
  const map = {
    'wrong_answer': 'คำตอบไม่ถูกต้อง',
    'incomplete': 'ข้อมูลไม่ครบ',
    'outdated': 'ข้อมูลล้าสมัย',
    'not_relevant': 'ไม่เกี่ยวข้อง',
    'confusing': 'สับสน/เข้าใจยาก',
    'other': 'อื่นๆ'
  };
  return map[r] || r || '-';
}

function openDetails(item) {
  selectedItem.value = item;
  showDetailModal.value = true;
}
function closeDetailModal() {
  showDetailModal.value = false;
}

async function restoreFeedback(item) {
  if (!item?.FeedbackID) return;
  restoringId.value = item.FeedbackID;
  try {
    await $axios.put(`/feedbacks/${item.FeedbackID}/unhandle`);
    // Remove from list
    items.value = items.value.filter(i => i.FeedbackID !== item.FeedbackID);
    // Show success notification (optional - use toast if available)
    console.log('Feedback restored successfully');
    return true;
  } catch (err) {
    console.error('Failed to restore feedback:', err);
    alert('กู้คืนไม่สำเร็จ');
    return false;
  } finally {
    restoringId.value = null;
  }
}

async function restoreFeedbackAndClose(item) {
  const success = await restoreFeedback(item);
  if (success) {
    closeDetailModal();
  }
}

function initTooltips() {
  nextTick(() => {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new Tooltip(el));
  });
}
</script>

<style scoped>
@import '@/assets/dashboard-styles.css';
@import '@/assets/main.css';
@import '@/assets/pagination-styles.css';
@import '@/assets/sidebar.css';

:root {
  --apple-blue: #0071e3;
  --apple-green: #34C759;
  --apple-red: #FF3B30;
  --apple-gray: #86868b;
  --apple-light-bg: #F5F5F7;
  --card-radius: 18px;
  --card-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.dashboard-container {
  display: flex;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: var(--apple-light-bg);
}

.main-content {
  flex-grow: 1;
  padding-bottom: 40px;
  overflow-x: hidden;
}

.container-fluid {
  padding-top: 1rem !important;
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

/* SVG Animation */
@keyframes drawCheck {
  0% { stroke-dasharray: 24; stroke-dashoffset: 24; opacity: 0; }
  100% { stroke-dashoffset: 0; opacity: 1; }
}
@keyframes scaleUp {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.check-path {
  stroke-dasharray: 24;
  stroke-dashoffset: 0;
  animation: drawCheck 0.8s ease-out forwards;
}

/* Header Icons */
.apple-icon-box {
  width: 48px; height: 48px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(52, 199, 89, 0.25);
  color: white;
  animation: scaleUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
.green-gradient { background: linear-gradient(135deg, #34C759 0%, #28a745 100%); }
.blue-gradient { background: linear-gradient(135deg, #0071e3 0%, #0056CC 100%); }
.red-gradient { background: linear-gradient(135deg, #FF3B30 0%, #FF2D55 100%); }

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
  transition: transform 0.2s; border: 1px solid rgba(0,0,0,0.02);
}
.apple-stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }

.stat-icon-wrapper {
  width: 50px; height: 50px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.6rem; color: white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.stat-value { font-size: 1.6rem; font-weight: 700; color: #1d1d1f; line-height: 1.1; }
.stat-label { font-size: 0.85rem; color: #86868b; margin-top: 4px; font-weight: 500; }

/* Cards & Charts */
.apple-card {
  background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);
  border-radius: var(--card-radius); box-shadow: var(--card-shadow);
  overflow: hidden; border: 1px solid rgba(0,0,0,0.05);
}
.chart-card { padding: 20px; }
.chart-area { position: relative; height: 260px; width: 100%; display: flex; align-items: center; justify-content: center; }
.card-header-clean h5 { font-size: 1rem; font-weight: 600; color: #1d1d1f; margin: 0 0 16px 0; }
.empty-state-chart { text-align: center; color: #ccc; }

/* Table Actions */
.card-header-actions { border-bottom: 1px solid rgba(0,0,0,0.05); }
.apple-counter-capsule {
  display: inline-flex; align-items: center; background: #F2F2F7;
  padding: 6px 14px; border-radius: 30px; color: #1d1d1f;
  font-size: 0.9rem; font-weight: 500; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
}
.apple-counter-capsule .label { color: #86868b; margin-right: 8px; font-size: 0.8rem; text-transform: uppercase; }
.apple-counter-capsule .count { font-weight: 700; color: var(--apple-green); }

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
.apple-table tr.apple-row:hover { background-color: rgba(52, 199, 89, 0.04); cursor: pointer; }

/* Badges & Pills */
.feedback-pill {
  display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;
}
.feedback-pill.like { background: rgba(52, 199, 89, 0.1); color: #34C759; }
.feedback-pill.unlike { background: rgba(255, 59, 48, 0.1); color: #FF3B30; }

.apple-badge-gray {
  background: rgba(142, 142, 147, 0.1); color: #636366; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600;
}
.reason-tag {
  background: #F2F2F7; color: #1d1d1f; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; border: 1px solid rgba(0,0,0,0.05);
}

/* Actions */
.btn-icon-circle {
  width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  border: none; background: rgba(0,0,0,0.05); color: #1d1d1f; transition: all 0.2s;
}
.btn-icon-circle:hover { background: var(--apple-blue); color: white; }

/* Modal */
.apple-modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(10px);
  z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;
}
.apple-modal-content {
  background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);
  border-radius: 18px; width: 100%; max-width: 500px;
  box-shadow: 0 24px 48px rgba(0,0,0,0.2); overflow: hidden; display: flex; flex-direction: column;
}
.apple-modal-header { padding: 20px 24px; border-bottom: 1px solid rgba(0,0,0,0.06); display: flex; justify-content: space-between; align-items: center; background: white; }
.apple-modal-title { font-size: 1.1rem; font-weight: 700; color: #1d1d1f; margin: 0; }
.apple-close-btn { border: none; background: rgba(0,0,0,0.05); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1d1d1f; transition: 0.2s; }
.apple-close-btn:hover { background: rgba(0,0,0,0.1); }
.apple-modal-body { padding: 24px; }
.apple-modal-footer { padding: 16px 24px; border-top: 1px solid rgba(0,0,0,0.05); background: #F9F9FB; display: flex; gap: 12px; justify-content: flex-end; }
.btn-apple-primary { background: linear-gradient(180deg, #007AFF 0%, #0051D4 100%); color: white; border: none; border-radius: 10px; padding: 12px 20px; font-weight: 600; transition: 0.2s; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.btn-apple-primary:hover { background: linear-gradient(180deg, #0066E6 0%, #0044B8 100%); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 122, 255, 0.35); }
.btn-apple-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
.btn-apple-secondary { background: rgba(0,0,0,0.05); color: #1d1d1f; border: none; border-radius: 10px; padding: 12px 20px; font-weight: 600; transition: 0.2s; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.btn-apple-secondary:hover { background: rgba(0,0,0,0.1); }

.detail-section { margin-bottom: 16px; }
.detail-section label { display: block; font-size: 0.75rem; color: #86868b; text-transform: uppercase; font-weight: 600; margin-bottom: 4px; }
.detail-value { font-size: 0.95rem; color: #1d1d1f; word-break: break-word; }

/* Auto-delete Notice */
.auto-delete-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #FFF3CD 0%, #FFEAA7 100%);
  border: 1px solid #F0C36D;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #856404;
}

.auto-delete-notice i {
  font-size: 18px;
  color: #D68910;
}

.auto-delete-notice strong {
  color: #B7791F;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.restore-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(180deg, #34C759 0%, #28A745 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.restore-btn:hover:not(:disabled) {
  background: linear-gradient(180deg, #2DB84D 0%, #229A3B 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 199, 89, 0.4);
}

.restore-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.restore-btn i {
  font-size: 14px;
}

/* Transitions */
.apple-zoom-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.apple-zoom-leave-active { transition: all 0.2s ease; }
.apple-zoom-enter-from, .apple-zoom-leave-to { opacity: 0; transform: scale(0.95); }

/* Pagination Override */
.pagination .page-link { border: none; color: #1d1d1f; border-radius: 8px; margin: 0 2px; }
.pagination .page-item.active .page-link { background: var(--apple-blue); color: white; box-shadow: 0 2px 8px rgba(0, 113, 227, 0.3); }

/* Empty State */
.empty-state { display: flex; flex-direction: column; align-items: center; color: #86868b; }
.empty-state i { font-size: 2.5rem; margin-bottom: 8px; opacity: 0.5; }

.mobile-sidebar-backdrop {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

.mobile-sidebar-toggle {
  display: none;
  background: none;
  border: none;
  color: currentColor;
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1.25rem;
  line-height: 1;
  margin-right: 0.5rem;
  align-items: center;
  justify-content: center;
}

/* ========== Apple-style Responsive Design ========== */

/* Tablet */
@media (max-width: 991px) {
  .page-title {
    font-size: 1.5rem;
  }
  
  .apple-icon-box {
    width: 40px;
    height: 40px;
  }
  
  .apple-icon-box svg {
    width: 24px;
    height: 24px;
  }
  
  .apple-stat-card {
    padding: 16px;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .chart-area {
    height: 220px;
  }
  
  .auto-delete-notice {
    font-size: 12px;
    padding: 10px 12px;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .main-content { 
    padding: 0 !important; 
    grid-column: 1/-1; 
    width: 100%; 
  }
  
  .container-fluid {
    padding: 12px !important;
  }
  
  .mobile-sidebar-toggle { display: flex; }
  
  .mobile-sidebar-backdrop {
    display: block;
  }
  
  /* Header */
  .d-flex.align-items-center.justify-content-between.mb-4 {
    flex-direction: column;
    align-items: center !important;
    gap: 16px;
    text-align: center;
  }
  
  .d-flex.align-items-center.gap-3 {
    flex-direction: column;
    position: relative;
    width: 100%;
  }
  
  .mobile-sidebar-toggle.mobile-inline-toggle {
    position: absolute;
    left: 0;
    top: 0;
  }
  
  .page-title {
    font-size: 1.4rem;
    text-align: center;
  }
  
  .auto-delete-notice {
    width: 100%;
    justify-content: center;
    text-align: center;
    flex-wrap: wrap;
    font-size: 12px;
    padding: 10px 12px;
    margin-bottom: 12px;
  }
  
  /* Stats Cards */
  .row.mb-4.g-3 {
    margin-bottom: 16px !important;
  }
  
  .col-md-4 {
    flex: 0 0 100%;
    max-width: 100%;
  }
  
  .apple-stat-card {
    padding: 14px;
    border-radius: 14px;
  }
  
  .stat-icon-wrapper {
    width: 40px;
    height: 40px;
  }
  
  .stat-value {
    font-size: 1.4rem;
  }
  
  .stat-label {
    font-size: 0.75rem;
  }
  
  /* Charts */
  .row.mb-4.g-4 {
    margin-bottom: 16px !important;
  }
  
  .col-12.col-lg-6 {
    margin-bottom: 12px;
  }
  
  .chart-card {
    border-radius: 14px;
  }
  
  .card-header-clean h5 {
    font-size: 0.95rem;
  }
  
  .chart-area {
    height: 200px;
  }
  
  .chart-wrapper {
    height: 180px !important;
  }
  
  /* Table Controls */
  .card-header-actions {
    flex-direction: column;
    gap: 12px;
    align-items: stretch !important;
  }
  
  .apple-counter-capsule {
    justify-content: center;
  }
  
  .search-container {
    width: 100% !important;
  }
  
  /* Table: Mobile card view */
  .table-responsive {
    overflow-x: visible;
  }
  
  .apple-table {
    display: block;
  }
  
  .apple-table thead {
    display: none;
  }
  
  .apple-table tbody {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }
  
  .apple-table tbody tr {
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    border: 1px solid rgba(0,0,0,0.05);
    gap: 10px;
  }
  
  .apple-table tbody tr:hover {
    background: rgba(52, 199, 89, 0.02);
  }
  
  .apple-table tbody td {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 4px 0 !important;
    border: none !important;
    width: 100%;
  }
  
  .apple-table tbody td::before {
    content: attr(data-label);
    font-weight: 600;
    font-size: 11px;
    color: #86868b;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    min-width: 80px;
    flex-shrink: 0;
  }
  
  .apple-table tbody td:first-child {
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    border-radius: 8px;
    padding: 10px 12px !important;
  }
  
  .apple-table tbody td:last-child {
    justify-content: center;
    padding-top: 12px !important;
    border-top: 1px solid rgba(0,0,0,0.06) !important;
    margin-top: 4px;
  }
  
  .apple-table tbody td:last-child::before {
    display: none;
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
    font-size: 0.85rem;
    padding: 6px 10px;
  }
  
  /* Modal */
  .apple-modal-content {
    max-width: 95%;
    margin: 0 auto;
    border-radius: 16px;
  }
  
  .apple-modal-header {
    padding: 16px;
  }
  
  .apple-modal-body {
    padding: 16px;
  }
  
  .apple-modal-footer {
    padding: 12px 16px;
  }
  
  /* Action Buttons */
  .action-buttons {
    width: 100%;
    justify-content: center;
    gap: 12px;
  }
  
  .btn-icon-circle,
  .restore-btn {
    width: 36px;
    height: 36px;
  }
  
  :global(.sidebar) {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 999;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  :global(body.sidebar-open .sidebar) {
    transform: translateX(0);
  }
}

/* Small Mobile */
@media (max-width: 480px) {
  .container-fluid {
    padding: 8px !important;
  }
  
  .page-title {
    font-size: 1.25rem;
  }
  
  .apple-icon-box {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }
  
  .apple-status-badge {
    font-size: 0.7rem;
    padding: 4px 10px;
  }
  
  .auto-delete-notice {
    font-size: 11px;
    padding: 8px 10px;
  }
  
  .apple-stat-card {
    padding: 12px;
    border-radius: 12px;
  }
  
  .stat-icon-wrapper {
    width: 36px;
    height: 36px;
  }
  
  .stat-icon-wrapper i {
    font-size: 16px;
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
  
  .chart-card {
    border-radius: 12px;
  }
  
  .chart-area {
    height: 180px;
  }
  
  .apple-table tbody tr {
    padding: 12px;
    border-radius: 14px;
  }
  
  .apple-table tbody td {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .apple-table tbody td::before {
    min-width: auto;
    margin-bottom: 2px;
  }
  
  .feedback-pill {
    font-size: 0.7rem;
    padding: 3px 8px;
  }
  
  .apple-badge-gray {
    font-size: 0.7rem;
    padding: 3px 8px;
  }
  
  .reason-tag {
    font-size: 0.7rem;
  }
  
  .detail-section label {
    font-size: 0.7rem;
  }
  
  .detail-value {
    font-size: 0.85rem;
  }
}
</style>