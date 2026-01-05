<template>
  <div class="">
    <div class="card p-4 bg-light shadow-sm mb-4 rounded-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="fs-5 mb-0">ChatLogNoAnswers Report</h3>
        <span v-if="wsConnected" class="badge bg-success">
          <i class="bi bi-wifi"></i> Live
        </span>
        <span v-else class="badge bg-secondary">
          <i class="bi bi-wifi-off"></i> Offline
        </span>
      </div>
      <div class="alert alert-warning alert-dismissible fade show py-2 px-3 small" role="alert">
        <i class="bi bi-info-circle me-1"></i>
        <strong>หมายเหตุ:</strong> ข้อมูลจะถูกลบอัตโนมัติหลังจากจัดเก็บครบ 30 วัน (คำนวณจากวันที่บันทึก)
        <button type="button" class="btn-close btn-close-sm" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
      <div v-if="loading" class="text-center py-3">
        <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>
        <p class="mt-2">Loading ChatLogNoAnswers data...</p>
      </div>
      <div v-else-if="error" class="alert alert-danger" role="alert">Error: {{ error }}</div>
      <div v-else>
        <!-- Charts Section (hidden when no data) -->
        <div v-if="chartTotal > 0" class="row mb-3">
          <div class="col-lg-6">
            <div class="chart-container">
              <canvas ref="pieCanvas"></canvas>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="chart-container">
              <canvas ref="barCanvas"></canvas>
            </div>
          </div>
        </div>

        <!-- Updated: total left, search right, same row -->
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div class="small text-muted flex-grow-1 text-start">Total: {{ totalEntries }}</div>
          <div class="search-wrapper">
            <ReportSearch v-model="localSearch" placeholder="ค้นหา chatlog..." />
          </div>
        </div>
        
        <!-- Apple Filters -->
        <AppleFilters
          v-model="noAnswerFilters"
          :show-sort="true"
          :sort-options="noAnswerSortOptions"
          default-sort-by="date"
          default-sort-order="desc"
          :show-date-presets="true"
          :custom-date-presets="noAnswerDatePresets"
          :show-date-range="true"
          @change="onNoAnswerFiltersChange"
        />

        <div class="table-responsive mt-3">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>ChatLogID</th>
                <th>Timestamp</th>
                <th>UserQuery</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in paginated" :key="log.ChatLogID">
                <td data-label="ID">{{ log.ChatLogID }}</td>
                <td data-label="เวลา">
                  <span 
                    class="badge bg-secondary"
                    data-bs-toggle="tooltip" 
                    data-bs-placement="top" 
                    :title="formatFullDateTime(log.Timestamp)"
                  >
                    {{ formatRelativeTime(log.Timestamp) }}
                  </span>
                </td>
                <td data-label="คำถาม">{{ log.UserQuery || '-' }}</td>
              </tr>
              <tr v-if="filtered.length === 0">
                <td colspan="3" class="text-center text-muted py-3">No ChatLogNoAnswers data found</td>
              </tr>
            </tbody>
          </table>

          <div class="d-flex justify-content-between align-items-center p-3 border-top mt-auto">
            <div class="small text-muted">Showing {{ startIndex }} to {{ endIndex }} of {{ totalEntries }} entries</div>
            <nav aria-label="Page navigation for chatLogNoAnswers">
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
    </div>
  </div>
</template>

<script setup>
// filepath: .../officers/ChatLogNoAnswersReport.vue
import { ref, onMounted, computed, getCurrentInstance, watch, onUnmounted, nextTick } from 'vue';
import { formatRelativeTime } from '@/utils/formatTime';
import { createWebSocketConnection, WS_ENDPOINTS } from '@/config/websocket';
import { Tooltip } from 'bootstrap';
import Chart from 'chart.js/auto';
import ReportSearch from '@/components/ReportSearch.vue';
import AppleFilters from '@/components/AppleFilters.vue';

const props = defineProps({
  chartOptions: Object,
  barChartOptions: Object,
});

const { appContext } = getCurrentInstance();
const $axios = appContext.config.globalProperties.$axios;
const $swal = appContext.config.globalProperties.$swal;

const items = ref([]);
const loading = ref(true);
const error = ref(null);

const pieCanvas = ref(null);
const barCanvas = ref(null);
let pieChart = null;
let barChart = null;

// WebSocket state
const wsConnected = ref(false);
let ws = null;

const localSearch = ref('');
watch(localSearch, () => { currentPage.value = 1; });

// Apple Filters Configuration
const noAnswerFilters = ref({
  sortBy: 'date',
  sortOrder: 'desc',
  datePreset: 'all',
  dateFrom: '',
  dateTo: ''
});

const noAnswerSortOptions = [
  { value: 'date', label: 'วันที่' },
  { value: 'id', label: 'รหัส' },
  { value: 'query', label: 'คำถาม' }
];

// Custom date presets สำหรับ ChatLogNoAnswers (เก็บแค่ 30 วัน)
const noAnswerDatePresets = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'today', label: 'วันนี้' },
  { value: 'week', label: '7 วัน' },
  { value: 'month', label: '30 วัน' }
];

function onNoAnswerFiltersChange() {
  currentPage.value = 1;
}

watch(noAnswerFilters, () => { currentPage.value = 1; }, { deep: true });

// Format full date time for tooltip (date only, no time)
function formatFullDateTime(timestamp) {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp;
  return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Using shared Thai relative time formatter
// formatRelativeTime imported from '@/utils/formatTime';


const fetchData = async () => {
  loading.value = true; error.value = null;
  try {
    const res = await $axios.get('/getChatLogNoAnswers');
    console.log('📥 getChatLogNoAnswers response (raw):', res.data);
    // Normalize responses that may be either an array or an object { success, data }
    let rows = Array.isArray(res.data) ? res.data : (res.data?.data || res.data || []);

    // Defensive: map/normalize field names so template always finds expected keys
    const normalized = rows.map(r => {
      const row = r || {};
      const ChatLogID = row.ChatLogID ?? row.chatLogID ?? row.chatlogid ?? row.chat_log_id ?? row.id ?? null;
      const Timestamp = row.Timestamp ?? row.timestamp ?? row.time ?? row.created_at ?? null;
      const UserQuery = row.UserQuery ?? row.userQuery ?? row.user_query ?? row.query ?? row.message ?? '';
      return { ...row, ChatLogID, Timestamp, UserQuery };
    });

    // Extra debug: log first item keys and types to help diagnose missing fields
    if (normalized.length > 0) {
      try {
        console.log('📥 getChatLogNoAnswers first item (normalized):', normalized[0]);
        console.log('📥 getChatLogNoAnswers first item keys:', Object.keys(normalized[0]));
      } catch (e) {
        console.log('📥 getChatLogNoAnswers cannot stringify first item', e);
      }
    }

    items.value = normalized;
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Failed to load data.';
  } finally {
    loading.value = false;
  }
};

// pagination
const currentPage = ref(1);
const itemsPerPage = ref(5);

const filtered = computed(() => {
  let arr = Array.isArray(items.value) ? items.value : [];
  
  // Force re-evaluation when noAnswerFilters changes
  const filters = noAnswerFilters.value;
  
  // Apply date preset filter
  const now = new Date();
  const preset = filters.datePreset;
  let fromDate = null;
  
  if (preset && preset !== 'all') {
    switch (preset) {
      case 'today':
        fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }
  }
  
  // Apply date range from preset or custom dateFrom/dateTo
  if (fromDate) {
    fromDate.setHours(0, 0, 0, 0);
    arr = arr.filter(log => {
      if (!log.Timestamp) return false;
      return new Date(log.Timestamp) >= fromDate;
    });
  }
  if (filters.dateFrom) {
    const customFromDate = new Date(filters.dateFrom);
    customFromDate.setHours(0, 0, 0, 0);
    arr = arr.filter(log => {
      if (!log.Timestamp) return false;
      return new Date(log.Timestamp) >= customFromDate;
    });
  }
  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo);
    toDate.setHours(23, 59, 59, 999);
    arr = arr.filter(log => {
      if (!log.Timestamp) return false;
      return new Date(log.Timestamp) <= toDate;
    });
  }
  
  // Apply search filter
  const q = (localSearch.value || '').toString().trim().toLowerCase();
  if (q) {
    arr = arr.filter(log => {
      const id = log.ChatLogID != null ? String(log.ChatLogID).toLowerCase() : '';
      const uq = log.UserQuery ? String(log.UserQuery).toLowerCase() : '';
      return id.includes(q) || uq.includes(q);
    });
  }
  
  return arr;
});

// Sort filtered items based on AppleFilters settings
const sorted = computed(() => {
  const arr = filtered.value.slice();
  const { sortBy, sortOrder } = noAnswerFilters.value;
  const order = sortOrder === 'asc' ? 1 : -1;
  
  return arr.sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'date') {
      const aTime = a?.Timestamp ? new Date(a.Timestamp).getTime() : 0;
      const bTime = b?.Timestamp ? new Date(b.Timestamp).getTime() : 0;
      comparison = aTime - bTime;
    } else if (sortBy === 'id') {
      comparison = (a?.ChatLogID || 0) - (b?.ChatLogID || 0);
    } else if (sortBy === 'query') {
      comparison = (a?.UserQuery || '').localeCompare(b?.UserQuery || '', 'th');
    }
    
    return comparison * order;
  });
});

// Chart total - used to hide charts when no data
const chartTotal = computed(() => {
  const arr = Array.isArray(items.value) ? items.value : [];
  return arr.length;
});

const totalEntries = computed(() => sorted.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(totalEntries.value / itemsPerPage.value)));
const startIndex = computed(() => totalEntries.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1);
const endIndex = computed(() => totalEntries.value === 0 ? 0 : Math.min(currentPage.value * itemsPerPage.value, totalEntries.value));
const paginated = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return sorted.value.slice(start, start + itemsPerPage.value);
});
const pagesToShow = computed(() => {
  const total = totalPages.value; const current = currentPage.value; const maxButtons = 4;
  if (total <= maxButtons) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 2) return [1,2,3,4];
  if (current >= total - 1) return [total-3,total-2,total-1,total];
  return [current-1,current,current+1,current+2];
});
function goToPage(p){ if (p>=1&&p<=totalPages.value) currentPage.value = p; }
function prevPage(){ goToPage(Math.max(1,currentPage.value-1)); }
function nextPage(){ goToPage(Math.min(totalPages.value,currentPage.value+1)); }
function firstPage(){ goToPage(1); }
function lastPage(){ goToPage(totalPages.value); }

// Initialize Bootstrap tooltips
const initTooltips = () => {
  nextTick(() => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new Tooltip(tooltipTriggerEl));
  });
};

// Watch paginated data to reinitialize tooltips
watch(paginated, () => {
  initTooltips();
});

// New: counts grouped by day (YYYY-MM-DD) for bar chart
const timeCountsByDay = computed(() => {
  const map = {};
  const arr = Array.isArray(items.value) ? items.value : [];
  arr.forEach(log => {
    const t = log.Timestamp;
    if (!t) return;
    const d = new Date(t);
    if (isNaN(d.getTime())) return;
    const key = d.toISOString().slice(0,10); // YYYY-MM-DD
    map[key] = (map[key] || 0) + 1;
  });
  // sort keys ascending
  const keys = Object.keys(map).sort();
  const values = keys.map(k => map[k]);
  return { labels: keys, values };
});

// New: counts grouped by time-of-day buckets for pie chart
const timeOfDayCounts = computed(() => {
  const buckets = {
    'เที่ยงคืน - รุ่งเช้า': 0,
    'เช้า - เที่ยงวัน': 0,
    'บ่าย - เย็น': 0,
    'ค่ำ - กลางคืน': 0,
  };
  const arr2 = Array.isArray(items.value) ? items.value : [];
  arr2.forEach(log => {
    const t = log.Timestamp;
    if (!t) return;
    const d = new Date(t);
    if (isNaN(d.getTime())) return;
    const h = d.getHours();
    if (h >= 0 && h <= 5) buckets['เที่ยงคืน - รุ่งเช้า']++;
    else if (h >= 6 && h <= 11) buckets['เช้า - เที่ยงวัน']++;
    else if (h >= 12 && h <= 17) buckets['บ่าย - เย็น']++;
    else buckets['ค่ำ - กลางคืน']++;
  });
  const labels = Object.keys(buckets);
  const data = labels.map(l => buckets[l]);
  return { labels, data };
});

// pieData: time-of-day distribution (polarArea for variety)
const pieData = computed(() => {
  const { labels, data } = timeOfDayCounts.value;
  const colors = ['#007bff','#28A745','#FFC107','#6c757d'];
  return { labels, datasets: [{ data, backgroundColor: labels.map((_,i)=>colors[i%colors.length]) }] };
});

// barData: counts per day (area line chart for trend)
const barData = computed(() => {
  const { labels, values } = timeCountsByDay.value;
  return {
    labels,
    datasets: [
      {
        label: 'Messages per Day',
        data: values,
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        fill: true,
        tension: 0.4
      },
    ],
  };
});

// Initialize charts
function initCharts() {
  if (pieChart) {
    pieChart.destroy();
    pieChart = null;
  }
  if (barChart) {
    barChart.destroy();
    barChart = null;
  }

  nextTick(() => {
    if (pieCanvas.value && pieData.value) {
      pieChart = new Chart(pieCanvas.value, {
        type: 'polarArea',
        data: pieData.value,
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
      });
    }
    if (barCanvas.value && barData.value) {
      barChart = new Chart(barCanvas.value, {
        type: 'line',
        data: barData.value,
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
      });
    }
  });
}

// Watch items to reinitialize charts when data changes
watch(items, () => {
  if (!loading.value && !error.value && items.value.length > 0) {
    initCharts();
  }
}, { deep: true });

onMounted(() => {
  fetchData();
  initTooltips();
  
  // Initialize WebSocket
  ws = createWebSocketConnection(WS_ENDPOINTS.CHAT_LOGS, {
    axios: $axios,
    onMessage: (message) => {
      console.log('📥 ChatLogNoAnswers received:', message);
      // Check for action in data object or direct action property
      const action = message?.data?.action || message?.action || '';
      const type = message?.type || '';
      const hasUpdate = action || type === 'CHATLOG_UPDATE' || type === 'CHATLOGS_UPDATE';
      if (hasUpdate) {
        console.log('✅ ChatLogNoAnswers refreshing data...');
        fetchData();
      }
    },
    onOpen: () => {
      wsConnected.value = true;
    },
    onClose: () => {
      wsConnected.value = false;
    },
  });
});

onUnmounted(() => {
  if (ws) ws.disconnect();
  if (pieChart) pieChart.destroy();
  if (barChart) barChart.destroy();
});
</script>

<style scoped>
@import '@/assets/pagination-styles.css';
.chart-area { min-height: 80px; }

/* Chart container styles */
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

/* Search wrapper */
.search-wrapper {
  min-width: 220px;
  max-width: 320px;
}

/* ========== Apple-style Responsive Design ========== */

/* Tablet */
@media (max-width: 991px) {
  .chart-container {
    height: 220px;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .card.p-4 {
    padding: 16px !important;
    border-radius: 16px;
  }
  
  .card h3.fs-5 {
    font-size: 1rem !important;
  }
  
  /* Alert */
  .alert {
    font-size: 12px;
    padding: 10px 12px !important;
  }
  
  /* Controls: Stack vertically */
  .d-flex.justify-content-between.align-items-center.mb-2 {
    flex-direction: column;
    align-items: stretch !important;
    gap: 12px;
  }
  
  .search-wrapper {
    width: 100% !important;
    max-width: 100% !important;
  }
  
  /* Charts: Stack vertically */
  .row.mb-3 .col-lg-6 {
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
    min-width: 80px;
    flex-shrink: 0;
  }
  
  .table tbody td:first-child {
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    border-radius: 8px;
    padding: 8px 12px;
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
}

/* Small Mobile */
@media (max-width: 480px) {
  .card.p-4 {
    padding: 12px !important;
    border-radius: 14px;
  }
  
  .card h3.fs-5 {
    font-size: 0.9rem !important;
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
  
  .badge {
    font-size: 0.7rem;
  }
}
</style>
