<template>
  <div class="dashboard-container">
    <!-- Main Content -->
    <div class="container-fluid pt-2 px-4 pb-5">
      <!-- Header -->
      <div class="d-flex align-items-center justify-content-between mb-4 fade-in-up">
        <div class="d-flex align-items-center gap-3">
          <!-- Apple Icon Box (Indigo for Chat Logs) -->
          <div class="apple-icon-box indigo-gradient">
            <i class="bi bi-chat-text-fill text-white"></i>
          </div>
          <div>
            <h3 class="page-title m-0">Chat Logs (Has Answers)</h3>
            <span class="text-secondary small">User queries matched with answers</span>
          </div>
        </div>
        
        <!-- Live Status -->
        <div class="d-flex align-items-center gap-2">
          <div class="apple-status-badge" :class="{ 'online': wsConnected }">
            <span class="status-dot"></span>
            <span>{{ wsConnected ? 'Live Updates' : 'Offline' }}</span>
          </div>
        </div>
      </div>

      <!-- Retention Warning Alert -->
      <div class="alert apple-alert-warning d-flex align-items-center fade-in-up" role="alert" style="animation-delay: 0.05s;">
        <i class="bi bi-info-circle-fill me-2 fs-5"></i>
        <div>
          <strong>Data Retention Policy:</strong> Logs are automatically deleted after 7 days.
        </div>
        <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5 fade-in">
        <div class="apple-spinner"></div>
        <p class="mt-3 text-secondary">Loading chat logs...</p>
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
              <div class="stat-icon-wrapper blue-gradient">
                <i class="bi bi-collection"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ totalEntries }}</div>
                <div class="stat-label">Total Logs</div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="apple-stat-card">
              <div class="stat-icon-wrapper green-gradient">
                <i class="bi bi-calendar-check"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ todayCount }}</div>
                <div class="stat-label">Today</div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="apple-stat-card">
              <div class="stat-icon-wrapper orange-gradient">
                <i class="bi bi-star-fill"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value text-truncate" style="max-width: 200px;" :title="topQuestion">{{ topQuestion }}</div>
                <div class="stat-label">Top Question</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chart Section -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="apple-card chart-card">
              <div class="card-header-clean">
                <h5>Frequent Questions</h5>
              </div>
              <div class="chart-area w-100">
                <BarChart :chart-data="byQuestionsChartData" :chart-options="localBarChartOptions" style="height: 260px;" />
              </div>
            </div>
          </div>
        </div>

        <!-- Table Section -->
        <div class="apple-card table-wrapper">
          <div class="card-header-actions p-3 d-flex justify-content-between align-items-center">
            
            <!-- Total Counter -->
            <div class="apple-counter-capsule">
              <span class="label">Logs</span>
              <span class="separator">|</span>
              <span class="count">{{ totalEntries }}</span>
            </div>

            <!-- Search -->
            <div class="search-container">
              <i class="bi bi-search search-icon"></i>
              <input
                type="text"
                class="search-input"
                placeholder="Search logs..."
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
                  <th class="ps-4">ID</th>
                  <th>Timestamp</th>
                  <th>User Query</th>
                  <th>Matched Question</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in paginated" :key="log.ChatLogID" class="align-middle apple-row">
                  <td class="ps-4 fw-medium text-secondary">{{ log.ChatLogID }}</td>
                  <td class="py-3">
                    <span 
                      class="apple-badge-gray"
                      data-bs-toggle="tooltip" 
                      data-bs-placement="top" 
                      :title="formatFullDateTime(log.Timestamp)"
                    >
                      {{ formatRelativeTime(log.Timestamp) }}
                    </span>
                  </td>
                  <td class="py-3">
                    <div class="text-dark fw-medium">{{ log.UserQuery }}</div>
                  </td>
                  <td class="py-3">
                    <div class="text-secondary small">
                      <i class="bi bi-arrow-return-right me-1"></i>
                      {{ questionsTitleMap[log.QuestionsAnswersID] || log.QuestionsAnswersID }}
                    </div>
                  </td>
                </tr>
                <tr v-if="filtered.length === 0">
                  <td colspan="4" class="text-center text-muted py-5">
                    <div class="empty-state">
                      <i class="bi bi-search"></i>
                      <p>No chat logs found</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="d-flex justify-content-between align-items-center p-3 border-top bg-white rounded-bottom-4">
            <div class="small text-secondary">
              Showing {{ startIndex }} - {{ endIndex }} of {{ totalEntries }}
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed, getCurrentInstance, watch, onUnmounted, nextTick } from 'vue';
import { formatRelativeTime } from '@/utils/formatTime';
import { BarChart } from 'vue-chart-3';
import { createWebSocketConnection, WS_ENDPOINTS } from '@/config/websocket';
import { Tooltip } from 'bootstrap';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const props = defineProps({
  questionsTitleMap: { type: Object, default: () => ({}) },
  chartOptions: Object,
  barChartOptions: Object,
});

const { appContext } = getCurrentInstance();
const $axios = appContext.config.globalProperties.$axios;

const items = ref([]);
const loading = ref(true);
const error = ref(null);

// WebSocket state
const wsConnected = ref(false);
let ws = null;

const localSearch = ref('');
watch(localSearch, () => { currentPage.value = 1; });

// Format full date time for tooltip
function formatFullDateTime(timestamp) {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp;
  return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Compute stats
const todayCount = computed(() => {
  const now = new Date().toISOString().slice(0, 10);
  return items.value.filter(i => i.Timestamp && i.Timestamp.startsWith(now)).length;
});

const topQuestion = computed(() => {
  if (items.value.length === 0) return '-';
  const counts = {};
  items.value.forEach(log => {
    const title = props.questionsTitleMap[log.QuestionsAnswersID] || log.QuestionsAnswersID || 'Unknown';
    counts[title] = (counts[title] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0][0] : '-';
});

// Filter logic
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
    return id.includes(q) || ts.includes(q) || uq.includes(q) || title.includes(q);
  });
});

// fetch data
const fetchData = async () => {
  loading.value = true; error.value = null;
  try {
    const res = await $axios.get('/getChatLogHasAnswers');
    items.value = res.data?.data || res.data || [];
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Failed to load data.';
  } finally {
    loading.value = false;
  }
};

// pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);
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

watch(paginated, () => { initTooltips(); });

// chart grouped by QuestionsAnswers
const byQuestionsChartData = computed(() => {
  const logs = Array.isArray(items.value) ? items.value : [];
  const counts = {};
  logs.forEach(log => {
    const qaId = log.QuestionsAnswersID;
    const title = (props.questionsTitleMap && props.questionsTitleMap[qaId]) ? props.questionsTitleMap[qaId] : (qaId != null ? String(qaId) : 'Unknown');
    counts[title] = (counts[title] || 0) + 1;
  });
  const labels = Object.keys(counts);
  const data = Object.values(counts);
  const colors = ['#0071e3', '#34C759', '#FF9500', '#FF3B30', '#5856D6', '#AF52DE'];
  return { labels, datasets: [{ label: 'Chat Logs', data, backgroundColor: labels.map((_,i)=>colors[i%colors.length]), borderRadius: 4 }] };
});

const localBarChartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, grid: { borderDash: [4, 4], color: '#f0f0f0' }, ticks: { precision: 0 } },
      x: { grid: { display: false } }
    },
    plugins: { legend: { display: false } }
  };
});

onMounted(() => {
  fetchData();
  initTooltips();
  
  ws = createWebSocketConnection(WS_ENDPOINTS.CHAT_LOGS, {
    axios: $axios,
    onMessage: (message) => {
      const action = message?.data?.action || message?.action || '';
      const type = message?.type || '';
      if (action || type === 'CHATLOG_UPDATE' || type === 'CHATLOGS_UPDATE') {
        fetchData();
      }
    },
    onOpen: () => { wsConnected.value = true; },
    onClose: () => { wsConnected.value = false; },
  });
});

onUnmounted(() => { if (ws) ws.disconnect(); });
</script>

<style scoped>
@import '@/assets/dashboard-styles.css';
@import '@/assets/main.css';
@import '@/assets/pagination-styles.css';

:root {
  --apple-blue: #0071e3;
  --apple-gray: #86868b;
  --apple-light-bg: #F5F5F7;
  --apple-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --card-radius: 18px;
  --card-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.dashboard-container {
  font-family: var(--apple-font);
  background-color: var(--apple-light-bg);
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

/* Apple Icon Box */
.apple-icon-box {
  width: 48px; height: 48px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(88, 86, 214, 0.25);
  font-size: 1.5rem;
}
.indigo-gradient { background: linear-gradient(135deg, #5856D6 0%, #a29bfe 100%); }

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

/* Warning Alert */
.apple-alert-warning {
  background-color: #fff8e1;
  border: 1px solid #ffeeba;
  color: #856404;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(255, 193, 7, 0.1);
  padding: 12px 16px;
  margin-bottom: 24px;
  font-size: 0.95rem;
}

/* Stats Cards */
.apple-stat-card {
  background: white; border-radius: var(--card-radius); padding: 20px;
  box-shadow: var(--card-shadow); display: flex; align-items: center; gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s; border: 1px solid rgba(0,0,0,0.02);
}
.apple-stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }

.stat-icon-wrapper {
  width: 50px; height: 50px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.6rem; color: white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.blue-gradient { background: linear-gradient(135deg, #0071e3 0%, #4facfe 100%); }
.green-gradient { background: linear-gradient(135deg, #34C759 0%, #a8ff78 100%); }
.orange-gradient { background: linear-gradient(135deg, #FF9500 0%, #ffc371 100%); }

.stat-value { font-size: 1.6rem; font-weight: 700; color: #1d1d1f; line-height: 1.1; }
.stat-label { font-size: 0.85rem; color: #86868b; margin-top: 4px; font-weight: 500; }

/* Cards */
.apple-card {
  background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);
  border-radius: var(--card-radius); box-shadow: var(--card-shadow);
  overflow: hidden; border: 1px solid rgba(0,0,0,0.05);
}
.chart-card { padding: 20px; }
.card-header-clean h5 { font-size: 1rem; font-weight: 600; color: #1d1d1f; margin: 0 0 16px 0; }

/* Counter Capsule */
.apple-counter-capsule {
  display: inline-flex; align-items: center; background: #F2F2F7;
  padding: 6px 14px; border-radius: 30px; color: #1d1d1f;
  font-size: 0.9rem; font-weight: 500; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
}
.apple-counter-capsule .label { color: #86868b; margin-right: 8px; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; }
.apple-counter-capsule .separator { color: #d1d1d6; margin-right: 8px; font-weight: 300; }
.apple-counter-capsule .count { font-weight: 700; color: #0071e3; }

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
.apple-table tr.apple-row:hover { background-color: rgba(0, 113, 227, 0.03); }

/* Badges */
.apple-badge-gray { background: rgba(142, 142, 147, 0.1); color: #636366; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }

/* Empty State */
.empty-state { display: flex; flex-direction: column; align-items: center; color: var(--apple-gray); }
.empty-state i { font-size: 2.5rem; margin-bottom: 8px; opacity: 0.5; }

/* Pagination Override */
.pagination .page-link { border: none; color: #1d1d1f; border-radius: 8px; margin: 0 2px; }
.pagination .page-item.active .page-link { background: var(--apple-blue); color: white; box-shadow: 0 2px 8px rgba(0, 113, 227, 0.3); }
</style>