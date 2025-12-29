<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <Sidebar :userType="userType" :userInfoObject="userInfoObject" />

    <!-- Main Content -->
    <main class="main-content">
      <div class="container-fluid pt-2 px-4 pb-5">
        
        <!-- Header -->
        <div class="d-flex align-items-center justify-content-between mb-4 fade-in-up">
          <div class="d-flex align-items-center gap-3">
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
          
          <!-- Live Status Badge -->
          <div class="d-flex align-items-center gap-2">
            <div class="apple-status-badge" :class="{ 'online': wsConnected }">
              <span class="status-dot"></span>
              <span>{{ wsConnected ? 'Live Updates' : 'Offline' }}</span>
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
            <div class="col-md-4">
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
            <div class="col-md-4">
              <div class="apple-stat-card">
                <div class="stat-icon-wrapper blue-gradient">
                  <i class="bi bi-hand-thumbs-up-fill"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ likeCount }}</div>
                  <div class="stat-label">Resolved Likes</div>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="apple-stat-card">
                <div class="stat-icon-wrapper red-gradient">
                  <i class="bi bi-hand-thumbs-down-fill"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ unlikeCount }}</div>
                  <div class="stat-label">Resolved Unlikes</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Charts Section -->
          <div class="row mb-4 g-4">
            <div class="col-12 col-lg-6">
              <div class="apple-card chart-card h-100">
                <div class="card-header-clean">
                  <h5>สัดส่วนปัญหา (Reasons)</h5>
                </div>
                <div class="chart-area w-100">
                  <div v-if="hasChartData" class="chart-wrapper">
                    <DoughnutChart :chart-data="pieData" :chart-options="chartOptions" style="height: 260px;" />
                  </div>
                  <div v-else class="empty-state-chart">
                    <i class="bi bi-pie-chart text-muted opacity-25" style="font-size: 3rem;"></i>
                    <p class="text-muted small mt-2">No data available</p>
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
                  <div v-if="hasChartData" class="chart-wrapper">
                    <BarChart :chart-data="barChartData" :chart-options="barChartOptions" style="height: 260px;" />
                  </div>
                  <div v-else class="empty-state-chart">
                    <i class="bi bi-bar-chart text-muted opacity-25" style="font-size: 3rem;"></i>
                    <p class="text-muted small mt-2">No activity recorded</p>
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

            <div class="table-responsive">
              <table class="table apple-table mb-0">
                <thead>
                  <tr>
                    <th class="ps-4" style="width: 80px;">ID</th>
                    <th style="width: 120px;">สถานะ</th>
                    <th>วันที่</th>
                    <th>คำถามผู้ใช้</th>
                    <th>เหตุผล & ความเห็น</th>
                    <th class="text-center" style="width: 100px;">ดูข้อมูล</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in paginatedItems" :key="item.FeedbackID" class="align-middle apple-row" @click="openDetails(item)">
                    <td class="ps-4 fw-medium text-secondary">{{ item.FeedbackID }}</td>
                    <td class="py-3">
                       <span v-if="isLike(item)" class="feedback-pill like">
                          <i class="bi bi-hand-thumbs-up-fill me-1"></i> Like
                       </span>
                       <span v-else class="feedback-pill unlike">
                          <i class="bi bi-hand-thumbs-down-fill me-1"></i> Unlike
                       </span>
                    </td>
                    <td class="py-3">
                      <span 
                        class="apple-badge-gray"
                        data-bs-toggle="tooltip" 
                        data-bs-placement="top" 
                        :title="formatFullDateTime(item.Timestamp)"
                      >
                        {{ formatRelativeTime(item.Timestamp) }}
                      </span>
                    </td>
                    <td class="py-3">
                      <div class="text-dark fw-medium text-truncate" style="max-width: 250px;" :title="item.UserQuery">
                        {{ item.UserQuery || '-' }}
                      </div>
                    </td>
                    <td class="py-3">
                      <div v-if="item.FeedbackReason" class="d-flex align-items-center gap-2">
                         <span class="reason-tag">{{ formatReason(item.FeedbackReason) }}</span>
                         <span v-if="item.FeedbackComment" class="text-secondary small text-truncate" style="max-width: 150px;" :title="item.FeedbackComment">
                           — {{ item.FeedbackComment }}
                         </span>
                      </div>
                      <span v-else class="text-muted small opacity-50">-</span>
                    </td>
                    <td class="py-3 text-center">
                      <button class="btn-icon-circle" @click.stop="openDetails(item)">
                        <i class="bi bi-chevron-right"></i>
                      </button>
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

      <!-- Details Modal (Apple Style) -->
      <transition name="apple-zoom">
        <div v-if="showDetailModal" class="apple-modal-overlay" @click.self="closeDetailModal">
          <div class="apple-modal-content">
            <div class="apple-modal-header-bg"></div>
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
                           <span v-if="isLike(selectedItem)" class="feedback-pill like">
                             <i class="bi bi-hand-thumbs-up-fill me-1"></i> Like
                           </span>
                           <span v-else class="feedback-pill unlike">
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
               <button class="btn-apple-primary w-100" @click="closeDetailModal">ปิดหน้าต่าง</button>
            </div>
          </div>
        </div>
      </transition>

    </main>
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
import { bindSidebarResize } from '@/stores/sidebarState';
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

// State
const items = ref([]);
const loading = ref(true);
const error = ref(null);
const localSearch = ref('');
const wsConnected = ref(false);
let ws = null;

// Modal State
const showDetailModal = ref(false);
const selectedItem = ref(null);

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);

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
});

// Watchers
watch(localSearch, () => { currentPage.value = 1; });
watch(items, () => { nextTick(() => initTooltips()); });

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
  const base = Array.isArray(items.value) ? items.value : [];
  const q = (localSearch.value || '').toLowerCase().trim();
  if (!q) return base;
  return base.filter(i => 
    String(i.UserQuery || '').toLowerCase().includes(q) ||
    String(i.FeedbackComment || '').toLowerCase().includes(q) ||
    String(i.FeedbackReason || '').toLowerCase().includes(q)
  );
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
  const arr = Array.isArray(filteredItems.value) ? filteredItems.value : [];
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
  return new Date(ts).toLocaleString('th-TH', { 
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });
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
.apple-modal-footer { padding: 16px 24px; border-top: 1px solid rgba(0,0,0,0.05); background: #F9F9FB; }
.btn-apple-primary { background: var(--apple-blue); color: white; border: none; border-radius: 10px; padding: 10px; font-weight: 600; transition: 0.2s; }
.btn-apple-primary:hover { background: #005ecb; }

.detail-section { margin-bottom: 16px; }
.detail-section label { display: block; font-size: 0.75rem; color: #86868b; text-transform: uppercase; font-weight: 600; margin-bottom: 4px; }
.detail-value { font-size: 0.95rem; color: #1d1d1f; word-break: break-word; }

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
</style>