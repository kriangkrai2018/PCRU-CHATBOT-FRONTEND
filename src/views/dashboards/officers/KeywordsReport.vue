<template>
  <div class="">
    <div class="card p-4 bg-light shadow-sm mb-4 rounded-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="fs-5 mb-0">Keywords Report</h3>
        <span v-if="wsConnected" class="badge bg-success">
          <i class="bi bi-wifi"></i> Live
        </span>
        <span v-else class="badge bg-secondary">
          <i class="bi bi-wifi-off"></i> Offline
        </span>
      </div>
      <div v-if="keywordsLoading" class="text-center py-3">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading keywords data...</p>
      </div>
      <div v-else-if="keywordsError" class="alert alert-danger" role="alert">
        Error: {{ keywordsError }}
      </div>
      <div v-else>
        <div class="row">
          <div class="col-12 col-md-6 mb-3">
            <!-- removed card/heading; keep chart only -->
            <div class="p-0">
              <PieChart :chart-data="keywordsPieChartData" :chart-options="chartOptions" style="height: 260px;" />
            </div>
          </div>
          <div class="col-12 col-md-6 mb-3">
            <!-- removed card/heading; keep chart only -->
            <div class="p-0">
              <BarChart :chart-data="keywordsBarChartData" :chart-options="barChartOptions" style="height: 260px;" />
            </div>
          </div>
        </div>

        <div class="table-responsive mt-3">
          <!-- Updated: total left, search right, same row -->
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="small text-muted flex-grow-1 text-start">Total: {{ totalEntries }}</div>
            <div class="search-wrapper">
              <ReportSearch v-model="localSearch" placeholder="ค้นหา keywords..." />
            </div>
          </div>

          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>KeywordID</th>
                <th>KeywordText</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="kw in paginatedKeywords" :key="kw.KeywordID">
                <td>{{ kw.KeywordID }}</td>
                <td>{{ kw.KeywordText }}</td>
              </tr>
              <tr v-if="filteredKeywords.length === 0">
                <td colspan="2" class="text-center text-muted py-3">No keywords data found</td>
              </tr>
            </tbody>
          </table>

          <div class="d-flex justify-content-between align-items-center p-3 border-top mt-auto">
            <div class="small text-muted">
              Showing {{ startIndex }} to {{ endIndex }} of {{ totalEntries }} entries
            </div>
            <nav aria-label="Page navigation for keywords">
              <ul class="pagination pagination-sm mb-0 align-items-center">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="firstPage" aria-label="First">&laquo;</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="prevPage" aria-label="Previous">&lsaquo;</a>
                </li>
                <li v-for="p in pagesToShow" :key="p" class="page-item" :class="{ active: currentPage === p }">
                  <a class="page-link page-num rounded-3" href="#" @click.prevent="goToPage(p)">{{ p }}</a>
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
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, getCurrentInstance } from 'vue';
import { PieChart, BarChart } from 'vue-chart-3';
import { createWebSocketConnection, WS_ENDPOINTS } from '@/config/websocket';
import ReportSearch from '@/components/ReportSearch.vue';

const props = defineProps({
  keywords: { type: Array, default: () => [] },
  keywordsLoading: { type: Boolean, default: false },
  keywordsError: { type: [String, null], default: null },
  keywordsPieChartData: Object,
  keywordsBarChartData: Object,
  chartOptions: Object,
  barChartOptions: Object,
  // optional initial search from parent
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
const itemsPerPage = ref(8);

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
.search-wrapper {
  min-width: 260px;
  max-width: 320px;
  width: 100%;
  margin-left: auto;
}
.input-group.search-input-group {
  position: relative;
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
</style>
