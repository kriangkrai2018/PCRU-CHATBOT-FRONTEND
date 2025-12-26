<template>
  <div class="">
    <div class="card p-4 bg-light shadow-sm mb-4 rounded-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="fs-5 mb-0">ChatLogHasAnswers Report</h3>
        <span v-if="wsConnected" class="badge bg-success">
          <i class="bi bi-wifi"></i> Live
        </span>
        <span v-else class="badge bg-secondary">
          <i class="bi bi-wifi-off"></i> Offline
        </span>
      </div>
      <div class="alert alert-warning alert-dismissible fade show py-2 px-3 small" role="alert">
        <i class="bi bi-info-circle me-1"></i>
        <strong>หมายเหตุ:</strong> ข้อมูลจะถูกลบอัตโนมัติหลังจากจัดเก็บครบ 7 วัน (คำนวณจากวันที่บันทึก)
        <button type="button" class="btn-close btn-close-sm" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
      <div v-if="loading" class="text-center py-3">
        <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>
        <p class="mt-2">Loading ChatLogHasAnswers data...</p>
      </div>
      <div v-else-if="error" class="alert alert-danger" role="alert">
        Error: {{ error }}
      </div>
      <div v-else>
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div class="chart-area w-100">
            <BarChart :chart-data="byQuestionsChartData" :chart-options="barChartOptions" style="height: 260px;" />
          </div>
          <!-- removed standalone search area (moved above table, aligned over ChatLogID column) -->
        </div>

        <div class="table-responsive mt-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="small text-muted flex-grow-1 text-start">Total: {{ totalEntries }}</div>
            <div class="search-wrapper">
              <ReportSearch v-model="localSearch" placeholder="ค้นหา chatlog..." />
            </div>
          </div>

          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th class="align-middle">ChatLogID</th>
                <th class="align-middle">Timestamp</th>
                <th class="align-middle">UserQuery</th>
                <th class="align-middle">QuestionTitle</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in paginated" :key="log.ChatLogID">
                <td>{{ log.ChatLogID }}</td>
                <td>
                  <span 
                    class="badge bg-secondary"
                    data-bs-toggle="tooltip" 
                    data-bs-placement="top" 
                    :title="formatFullDateTime(log.Timestamp)"
                  >
                    {{ formatRelativeTime(log.Timestamp) }}
                  </span>
                </td>
                <td>{{ log.UserQuery }}</td>
                <td>{{ questionsTitleMap[log.QuestionsAnswersID] || log.QuestionsAnswersID }}</td>
              </tr>
              <tr v-if="filtered.length === 0">
                <td colspan="4" class="text-center text-muted py-3">No ChatLogHasAnswers data found</td>
              </tr>
            </tbody>
          </table>

          <div class="d-flex justify-content-between align-items-center p-3 border-top mt-auto">
            <div class="small text-muted">Showing {{ startIndex }} to {{ endIndex }} of {{ totalEntries }} entries</div>
            <nav aria-label="Page navigation for chatLogHasAnswers">
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
// filepath: .../officers/ChatLogHasAnswersReport.vue
import { ref, onMounted, computed, getCurrentInstance, watch, onUnmounted, nextTick } from 'vue';
import { formatRelativeTime } from '@/utils/formatTime';
import { BarChart } from 'vue-chart-3';
import { createWebSocketConnection, WS_ENDPOINTS } from '@/config/websocket';
import { Tooltip } from 'bootstrap';
import ReportSearch from '@/components/ReportSearch.vue';

const props = defineProps({
  questionsTitleMap: { type: Object, default: () => ({}) },
  chartOptions: Object,
  barChartOptions: Object,
});

const { appContext } = getCurrentInstance();
const $axios = appContext.config.globalProperties.$axios;
const $swal = appContext.config.globalProperties.$swal;

const items = ref([]);
const loading = ref(true);
const error = ref(null);

// WebSocket state
const wsConnected = ref(false);
let ws = null;

// local search already defined and watched
const localSearch = ref('');
watch(localSearch, () => { currentPage.value = 1; });

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


// Replace filtered computed to check every column.
const filtered = computed(() => {
  const q = (localSearch.value || '').toString().trim().toLowerCase();
  if (!q) return Array.isArray(items.value) ? items.value : [];
  return (items.value || []).filter(log => {
    const id = log.ChatLogID != null ? String(log.ChatLogID).toLowerCase() : '';
    const ts = log.Timestamp ? String(log.Timestamp).toLowerCase() : '';
    const uq = log.UserQuery ? String(log.UserQuery).toLowerCase() : '';
    const title = (props.questionsTitleMap && props.questionsTitleMap[log.QuestionsAnswersID])
      ? String(props.questionsTitleMap[log.QuestionsAnswersID]).toLowerCase()
      : (log.QuestionsAnswersID != null ? String(log.QuestionsAnswersID).toLowerCase() : '');
    // search in all columns
    return id.includes(q) || ts.includes(q) || uq.includes(q) || title.includes(q);
  });
});

// fetch data
const fetchData = async () => {
  loading.value = true; error.value = null;
  try {
    const res = await $axios.get('/getChatLogHasAnswers');
    items.value = res.data || [];
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Failed to load data.';
  } finally {
    loading.value = false;
  }
};

// pagination
const currentPage = ref(1);
const itemsPerPage = ref(8);
const totalEntries = computed(() => filtered.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(totalEntries.value / itemsPerPage.value)));
const startIndex = computed(() => totalEntries.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1);
const endIndex = computed(() => totalEntries.value === 0 ? 0 : Math.min(currentPage.value * itemsPerPage.value, totalEntries.value));
const paginated = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filtered.value.slice(start, start + itemsPerPage.value);
});
const pagesToShow = computed(() => {
  const total = totalPages.value; const current = currentPage.value; const maxButtons=4;
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

// chart grouped by QuestionsAnswers (use provided questionsTitleMap)
const byQuestionsChartData = computed(() => {
  const counts = {};
  (items.value || []).forEach(log => {
    const qaId = log.QuestionsAnswersID;
    const title = (props.questionsTitleMap && props.questionsTitleMap[qaId]) ? props.questionsTitleMap[qaId] : (qaId != null ? String(qaId) : 'Unknown');
    counts[title] = (counts[title] || 0) + 1;
  });
  const labels = Object.keys(counts);
  const data = Object.values(counts);
  const colors = ['#007bff','#28A745','#DC3545','#FFC107','#6c757d','#17a2b8','#8e44ad','#e67e22'];
  return { labels, datasets: [{ label: 'ChatLog Count', data, backgroundColor: labels.map((_,i)=>colors[i%colors.length]) }] };
});

onMounted(() => {
  fetchData();
  initTooltips();
  
  // Initialize WebSocket
  ws = createWebSocketConnection(WS_ENDPOINTS.CHAT_LOGS, {
    axios: $axios,
    onMessage: (message) => {
      console.log('📥 ChatLogHasAnswers received:', message);
      // Check for action in data object or direct action property
      const action = message?.data?.action || message?.action || '';
      const type = message?.type || '';
      const hasUpdate = action || type === 'CHATLOG_UPDATE' || type === 'CHATLOGS_UPDATE';
      if (hasUpdate) {
        console.log('✅ ChatLogHasAnswers refreshing data...');
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
});
</script>

<style scoped>
@import '@/assets/pagination-styles.css';
.chart-area { min-height: 80px; }
.search-input-group { position: relative; }

/* Search input sizing and icon alignment to match the screenshot */
.search-wrapper {
  max-width: 320px;
  width: 100%;
  margin-left: auto;
}
.input-group.search-input-group {
  position: relative;
  width: 100%;
}
.header-search-input {
  width: 100%;
  height: 48px;
  font-size: 1.15rem;
  padding: 0 20px 0 20px;
  box-shadow: none;
  outline: none;
  border: none;
  background: #fff;
}
.search-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent !important;
  border: none !important;
  padding: 0;
  color: #444;
  font-size: 1.35rem;
  pointer-events: none;
  z-index: 2;
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

/* keep table vertical alignment */
.table td,.table th{ vertical-align: middle; }
</style>
