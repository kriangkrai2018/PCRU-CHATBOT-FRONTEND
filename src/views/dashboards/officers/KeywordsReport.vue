<template>
  <div class="dashboard-container">
    <!-- Main Content -->
    <div class="container-fluid pt-2 px-4 pb-5">
      <!-- Header -->
      <div class="d-flex align-items-center justify-content-between mb-4 fade-in-up">
        <div class="d-flex align-items-center gap-3">
          <!-- Apple Icon Box (Teal for Keywords) -->
          <div class="apple-icon-box teal-gradient">
            <i class="bi bi-tags-fill text-white"></i>
          </div>
          <div>
            <h3 class="page-title m-0">Keywords Report</h3>
            <span class="text-secondary small">Search terms & trending topics</span>
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

      <!-- Loading State -->
      <div v-if="keywordsLoading" class="text-center py-5 fade-in">
        <div class="apple-spinner"></div>
        <p class="mt-3 text-secondary">Loading keywords...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="keywordsError" class="alert apple-alert-danger mx-auto" role="alert">
        <i class="bi bi-exclamation-circle-fill me-2"></i> {{ keywordsError }}
      </div>

      <div v-else class="fade-in-up" style="animation-delay: 0.1s;">
        
        <!-- Stats Cards -->
        <div class="row mb-4 g-3">
          <div class="col-md-6">
            <div class="apple-stat-card">
              <div class="stat-icon-wrapper blue-gradient">
                <i class="bi bi-hash"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ totalEntries }}</div>
                <div class="stat-label">Total Keywords</div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="apple-stat-card">
              <div class="stat-icon-wrapper orange-gradient">
                <i class="bi bi-trophy-fill"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value text-truncate" style="max-width: 200px;" :title="topKeyword">{{ topKeyword }}</div>
                <div class="stat-label">Top Keyword</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="row mb-4 g-4">
          <div class="col-12 col-lg-6">
            <div class="apple-card chart-card h-100">
              <div class="card-header-clean">
                <h5>Distribution</h5>
              </div>
              <div class="chart-area">
                <PieChart :chart-data="keywordsPieChartData" :chart-options="chartOptions" style="height: 260px;" />
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-6">
            <div class="apple-card chart-card h-100">
              <div class="card-header-clean">
                <h5>Frequency Analysis</h5>
              </div>
              <div class="chart-area">
                <BarChart :chart-data="keywordsBarChartData" :chart-options="barChartOptions" style="height: 260px;" />
              </div>
            </div>
          </div>
        </div>

        <!-- Table Section -->
        <div class="apple-card table-wrapper">
          <div class="card-header-actions p-3 d-flex justify-content-between align-items-center">
            
            <!-- Total Counter -->
            <div class="apple-counter-capsule">
              <span class="label">Count</span>
              <span class="separator">|</span>
              <span class="count">{{ totalEntries }}</span>
            </div>

            <!-- Search -->
            <div class="search-container">
              <i class="bi bi-search search-icon"></i>
              <input
                type="text"
                class="search-input"
                placeholder="Search keywords..."
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
                  <th class="ps-4" style="width: 100px;">ID</th>
                  <th>Keyword Text</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="kw in paginatedKeywords" :key="kw.KeywordID" class="align-middle apple-row">
                  <td class="ps-4 fw-medium text-secondary">#{{ kw.KeywordID }}</td>
                  <td class="py-3">
                    <span class="keyword-pill">{{ kw.KeywordText }}</span>
                  </td>
                </tr>
                <tr v-if="filteredKeywords.length === 0">
                  <td colspan="2" class="text-center text-muted py-5">
                    <div class="empty-state">
                      <i class="bi bi-search"></i>
                      <p>No keywords found</p>
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
import { ref, computed, watch, onMounted, onUnmounted, getCurrentInstance } from 'vue';
import { PieChart, BarChart } from 'vue-chart-3';
import { createWebSocketConnection, WS_ENDPOINTS } from '@/config/websocket';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const props = defineProps({
  keywords: { type: Array, default: () => [] },
  keywordsLoading: { type: Boolean, default: false },
  keywordsError: { type: [String, null], default: null },
  keywordsPieChartData: Object,
  keywordsBarChartData: Object,
  chartOptions: Object,
  barChartOptions: Object,
  searchQueryKeywords: { type: String, default: '' },
});

// emit update if parent wants to sync (optional)
const emit = defineEmits(['update:searchQueryKeywords', 'refresh']);

// WebSocket state
const wsConnected = ref(false);
const { appContext } = getCurrentInstance();
const $axios = appContext.config.globalProperties.$axios;
let ws = null;

onMounted(() => {
  ws = createWebSocketConnection(WS_ENDPOINTS.KEYWORDS, {
    axios: $axios,
    onMessage: (message) => {
      if (message.type === 'KEYWORD_UPDATE') {
        emit('refresh');
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

// local search state (keeps in sync with parent prop when provided)
const localSearch = ref(props.searchQueryKeywords || '');
watch(() => props.searchQueryKeywords, v => { if (v !== localSearch.value) localSearch.value = v; });
watch(localSearch, v => emit('update:searchQueryKeywords', v));

// Defensive keyword list
const allKeywords = computed(() => Array.isArray(props.keywords) ? props.keywords : []);

// Compute top keyword from bar chart data if available
const topKeyword = computed(() => {
  if (props.keywordsBarChartData?.labels?.length > 0) {
    // Assuming the chart is sorted or we just pick the first one for now
    // A more robust way would be to find the index of max data
    const data = props.keywordsBarChartData.datasets?.[0]?.data || [];
    if (data.length === 0) return '-';
    const maxIndex = data.indexOf(Math.max(...data));
    return props.keywordsBarChartData.labels[maxIndex] || '-';
  }
  return '-';
});

// Filtered list by search (search KeywordID or KeywordText)
const filteredKeywords = computed(() => {
  const q = (localSearch.value || '').toString().trim().toLowerCase();
  if (!q) return allKeywords.value;
  return allKeywords.value.filter(k =>
    (k.KeywordID != null && String(k.KeywordID).includes(q)) ||
    (k.KeywordText && String(k.KeywordText).toLowerCase().includes(q))
  );
});

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10); // Updated to 10 for better view

watch(localSearch, () => { currentPage.value = 1; });

const totalEntries = computed(() => filteredKeywords.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(totalEntries.value / itemsPerPage.value)));

const startIndex = computed(() => totalEntries.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1);
const endIndex = computed(() => totalEntries.value === 0 ? 0 : Math.min(currentPage.value * itemsPerPage.value, totalEntries.value));

const paginatedKeywords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredKeywords.value.slice(start, start + itemsPerPage.value);
});

// Pagination helpers for UI (max 4 buttons similar to other components)
const pagesToShow = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const maxButtons = 4;
  if (total <= maxButtons) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 2) return [1,2,3,4];
  if (current >= total - 1) return [total-3, total-2, total-1, total];
  return [current-1, current, current+1, current+2];
});

function goToPage(p) { if (p >= 1 && p <= totalPages.value) currentPage.value = p; }
function prevPage() { goToPage(Math.max(1, currentPage.value - 1)); }
function nextPage() { goToPage(Math.min(totalPages.value, currentPage.value + 1)); }
function firstPage() { goToPage(1); }
function lastPage() { goToPage(totalPages.value); }
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
  box-shadow: 0 4px 12px rgba(52, 199, 89, 0.25);
  font-size: 1.5rem;
}
.teal-gradient { background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); } /* A rich teal/purple mix or similar */
/* Overriding teal gradient for a fresher look */
.teal-gradient { background: linear-gradient(135deg, #2AF598 0%, #009EFD 100%); }

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
.orange-gradient { background: linear-gradient(135deg, #FF9500 0%, #ffc371 100%); }

.stat-value { font-size: 1.6rem; font-weight: 700; color: #1d1d1f; line-height: 1.1; }
.stat-label { font-size: 0.85rem; color: #86868b; margin-top: 4px; font-weight: 500; }

/* Cards & Charts */
.apple-card {
  background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);
  border-radius: var(--card-radius); box-shadow: var(--card-shadow);
  overflow: hidden; border: 1px solid rgba(0,0,0,0.05);
}
.chart-card { padding: 20px; }
.chart-area { position: relative; height: 260px; width: 100%; }
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

/* Keyword Pill */
.keyword-pill {
  display: inline-block; padding: 6px 14px; border-radius: 20px;
  background: rgba(0, 113, 227, 0.08); color: var(--apple-blue);
  font-size: 0.9rem; font-weight: 500;
  transition: all 0.2s;
}
.apple-row:hover .keyword-pill { background: rgba(0, 113, 227, 0.15); transform: translateX(2px); }

/* Empty State */
.empty-state { display: flex; flex-direction: column; align-items: center; color: var(--apple-gray); }
.empty-state i { font-size: 2.5rem; margin-bottom: 8px; opacity: 0.5; }

/* Pagination Override */
.pagination .page-link { border: none; color: #1d1d1f; border-radius: 8px; margin: 0 2px; }
.pagination .page-item.active .page-link { background: var(--apple-blue); color: white; box-shadow: 0 2px 8px rgba(0, 113, 227, 0.3); }
</style>