<template>
  <div class="dashboard-container">
    <!-- Main Content -->
    <div class="container-fluid pt-2 px-4 pb-5">
      <!-- Header with Apple-style Icon -->
      <div class="d-flex align-items-center justify-content-between mb-4 fade-in-up">
        <div class="d-flex align-items-center gap-3">
          <!-- New Apple Icon Box -->
          <div class="apple-icon-box">
            <i class="bi bi-folder2-open text-white"></i>
          </div>
          <div>
            <h3 class="page-title m-0">Categories Report</h3>
            <span class="text-secondary small">ภาพรวมและโครงสร้างหมวดหมู่</span>
          </div>
        </div>
        
        <!-- Live Status Badge -->
        <div class="d-flex align-items-center gap-2">
          <div class="apple-status-badge" :class="{ 'online': wsConnected }">
            <span class="status-dot"></span>
            <span>{{ wsConnected ? 'Live' : 'Offline' }}</span>
          </div>
        </div>
      </div>

      <div v-if="categoriesLoading" class="text-center py-5 fade-in">
        <div class="apple-spinner"></div>
        <p class="mt-3 text-secondary">Loading categories...</p>
      </div>

      <div v-else-if="categoriesError" class="alert apple-alert-danger mx-auto" role="alert">
        <i class="bi bi-exclamation-circle-fill me-2"></i> {{ categoriesError }}
      </div>

      <div v-else class="fade-in-up" style="animation-delay: 0.1s;">
        <!-- Stats Cards Row -->
        <div class="row mb-4 g-3">
          <div class="col-md-4">
            <div class="apple-stat-card">
              <div class="stat-icon-wrapper blue-gradient">
                <i class="bi bi-collection-fill"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ categoriesTotalEntries }}</div>
                <div class="stat-label">หมวดหมู่ทั้งหมด</div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="apple-stat-card">
              <div class="stat-icon-wrapper purple-gradient">
                <i class="bi bi-diagram-3-fill"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ visibleParentsTotal }}</div>
                <div class="stat-label">หมวดหมู่หลัก</div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="apple-stat-card">
              <div class="stat-icon-wrapper orange-gradient">
                <i class="bi bi-file-earmark-text-fill"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ totalFilesCount }}</div>
                <div class="stat-label">เอกสารที่แนบ</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div v-if="showCharts" class="row mb-4 g-4">
          <div class="col-12 col-lg-6">
            <div class="apple-card chart-card h-100">
              <div class="card-header-clean">
                <h5>Distribution</h5>
              </div>
              <div class="chart-area">
                <DoughnutChart :chart-data="categoriesPieChartData" :chart-options="chartOptions" style="height: 260px;" />
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-6">
            <div class="apple-card chart-card h-100">
              <div class="card-header-clean">
                <h5>Structure Analysis</h5>
              </div>
              <div class="chart-area">
                <BarChart :chart-data="filteredBarChartData" :chart-options="localBarChartOptions" style="height: 260px;" />
              </div>
            </div>
          </div>
        </div>

        <!-- Filters Section -->
        <AppleFilters
          v-model="catFilters"
          :sort-options="catSortOptions"
          :statuses="catStatuses"
          status-label="ประเภท"
          :show-date-range="false"
          :show-date-presets="false"
          :show-number-range="false"
          @change="onFiltersChange"
        />

        <!-- Table Section -->
        <div class="apple-card table-wrapper">
          <div class="card-header-actions p-3 d-flex justify-content-between align-items-center">
            
            <!-- Redesigned Total Counter (Apple Style) -->
            <div class="apple-counter-capsule">
              <span class="label">Total</span>
              <span class="separator">|</span>
              <span class="count">{{ categoriesTotalEntries }}</span>
            </div>

            <div class="search-container">
              <i class="bi bi-search search-icon"></i>
              <input
                type="text"
                class="search-input"
                placeholder="ค้นหาหมวดหมู่..."
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
                  <th class="ps-4" style="width: 60px;"></th>
                  <th>ID</th>
                  <th>Category Name</th>
                  <th>Type</th>
                  <th>Contact</th>
                  <th>File</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(cat, idx) in visibleParents" :key="cat.CategoriesID">
                  <!-- Main Parent Row -->
                  <tr class="align-middle parent-row">
                    <td class="ps-4" data-label="Actions">
                      <button 
                        v-if="hasSubCategories(cat.CategoriesID, cat.CategoriesID)" 
                        class="expand-btn" 
                        @click="toggleExpand(cat.CategoriesID)"
                      >
                        <i class="bi" :class="expandedMap[cat.CategoriesID] ? 'bi-chevron-up' : 'bi-chevron-right'"></i>
                      </button>
                    </td>
                    <td class="cat-id-cell fw-semibold text-primary" data-label="ID">{{ cat.CategoriesID }}</td>
                    <td class="fw-medium text-dark" data-label="Category">{{ cat.CategoriesName }}</td>
                    <td data-label="Type">
                      <span :class="isMain(cat) ? 'apple-badge-blue' : 'apple-badge-gray'">
                        {{ isMain(cat) ? 'Main' : 'Sub' }}
                      </span>
                    </td>
                    <td class="contact-cell" data-label="Contact">
                      <div v-if="(aggregatedContacts(cat.CategoriesID) || []).length">
                        <div v-for="(cc, i) in aggregatedContacts(cat.CategoriesID)" :key="i" class="small text-secondary">{{ cc }}</div>
                      </div>
                      <span v-else class="text-muted small">-</span>
                    </td>
                    <td data-label="File">
                      <template v-if="cat.CategoriesPDF">
                        <button @click.prevent="openFile(cat.CategoriesPDF, cat.CategoriesName)" class="file-link-btn">
                          <i :class="pdfIconClass(cat.CategoriesPDF)"></i>
                          <span>View File</span>
                        </button>
                      </template>
                      <span v-else class="text-muted small opacity-50">-</span>
                    </td>
                  </tr>

                  <!-- Sub Categories Rows (Animated) -->
                  <transition-group name="list-slide">
                    <tr
                      v-for="sub in expandedMap[cat.CategoriesID] ? subCategories(cat.CategoriesID, cat.CategoriesID) : []"
                      :key="sub.CategoriesID"
                      class="sub-row"
                    >
                      <td></td>
                      <td class="cat-id-cell ps-4 text-secondary" data-label="ID">
                        <span class="tree-line">└</span> {{ sub.CategoriesID }}
                      </td>
                      <td class="ps-4 text-secondary" data-label="Category">{{ sub.CategoriesName }}</td>
                      <td data-label="Type"><span class="apple-badge-gray-outline">Sub</span></td>
                      <td class="contact-cell" data-label="Contact">
                        <div v-if="sub.Contact">
                          <div v-for="(cc, i) in parseContacts(sub.Contact).filter(p => !isContactCoveredByParent(cat.CategoriesID, p))" :key="i" class="small text-secondary">{{ cc }}</div>
                        </div>
                        <span v-else class="text-muted small">-</span>
                      </td>
                      <td data-label="File">
                        <template v-if="sub.CategoriesPDF">
                          <button @click.prevent="openFile(sub.CategoriesPDF, sub.CategoriesName)" class="file-link-btn">
                            <i :class="pdfIconClass(sub.CategoriesPDF)"></i>
                            <span>View File</span>
                          </button>
                        </template>
                        <span v-else class="text-muted small opacity-50">-</span>
                      </td>
                    </tr>
                  </transition-group>
                </template>

                <tr v-if="(Array.isArray(visibleParents) ? visibleParents.length : (visibleParents || []).length) === 0">
                  <td colspan="6" class="text-center text-muted py-5">
                    <div class="empty-state">
                      <i class="bi bi-folder-x"></i>
                      <p>No categories found</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="pagination-footer">
            <div class="pagination-info">
              แสดง {{ localStartIndex }} - {{ localEndIndex }} รายการ
            </div>
            <nav v-if="localTotalPages > 0" aria-label="Pagination">
              <ul class="pagination pagination-sm mb-0">
                <li class="page-item" :class="{ disabled: displayPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="categoriesFirstPage">&laquo;</a>
                </li>
                <li class="page-item" :class="{ disabled: displayPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="categoriesPrevPage">&lsaquo;</a>
                </li>
                <li v-for="page in localPagesToShow" :key="`page-${page}`" class="page-item" :class="{ active: displayPage === page }">
                  <a class="page-link page-num" href="#" @click.prevent="categoriesGoToPage(page)">{{ page }}</a>
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

      <!-- Glassmorphism File Modal -->
      <transition name="apple-zoom">
        <div v-if="showFileModal" class="apple-modal-overlay" @click.self="closeModal">
          <div class="apple-modal-content large-modal">
            <div class="apple-modal-header py-3 px-4">
              <div class="d-flex align-items-center gap-3">
                <div class="icon-circle bg-danger-subtle text-danger">
                  <i class="bi bi-file-earmark-pdf-fill"></i>
                </div>
                <div>
                  <h6 class="m-0 fw-semibold text-dark">File Preview</h6>
                  <small class="text-secondary text-truncate d-block" style="max-width: 300px;">{{ modalFileName }}</small>
                </div>
              </div>
              <div class="d-flex gap-2">
                <a :href="modalFileUrl" target="_blank" rel="noopener" class="apple-icon-btn" title="Open in new tab">
                  <i class="bi bi-box-arrow-up-right"></i>
                </a>
                <button class="apple-close-btn" @click="closeModal">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
            </div>
            <div class="apple-modal-body p-0 bg-light position-relative">
              <div v-if="isPdf(modalFileUrl)" class="h-100 w-100">
                <iframe :src="modalFileUrl" frameborder="0" class="w-100 h-100"></iframe>
              </div>
              <div v-else class="d-flex flex-column align-items-center justify-content-center h-100 text-center p-5">
                <div class="mb-3 text-secondary opacity-50">
                  <i class="bi bi-file-earmark-x" style="font-size: 3rem;"></i>
                </div>
                <h6 class="text-dark">Preview Unavailable</h6>
                <p class="text-secondary small mb-4">This file type cannot be previewed directly.</p>
                <a :href="modalFileUrl" target="_blank" rel="noopener" class="btn-apple-primary">
                  Download File
                </a>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onUnmounted, onMounted, getCurrentInstance } from 'vue';
import { DoughnutChart, BarChart } from 'vue-chart-3';
import { createWebSocketConnection, WS_ENDPOINTS } from '@/config/websocket';
import { Chart, registerables } from 'chart.js';
import AppleFilters from '@/components/AppleFilters.vue';

Chart.register(...registerables);

const props = defineProps({
  categories: Array,
  categoriesLoading: Boolean,
  categoriesError: String,
  categoriesPieChartData: Object,
  categoriesBarChartData: Object,
  qaCountsByCategoryId: Object,
  qaCountsByCategoryName: Object,
  searchQueryCategories: String,
  filteredCategories: Array,
  paginatedCategories: Array,
  categoriesStartIndex: Number,
  categoriesEndIndex: Number,
  categoriesTotalEntries: Number,
  categoriesCurrentPage: Number,
  categoriesTotalPages: Number,
  chartOptions: Object,
  barChartOptions: Object,
  showCharts: { type: Boolean, default: true },
});

const emit = defineEmits(['update:searchQueryCategories', 'refresh']);

const expanded = ref({});

// Filters state
const catFilters = ref({
  sortBy: 'id',
  sortOrder: 'asc',
  status: ''
});

const catSortOptions = [
  { value: 'id', label: 'ID' },
  { value: 'name', label: 'ชื่อหมวดหมู่' },
];

const catStatuses = [
  { value: 'main', label: 'Main', icon: 'bi bi-folder-fill', color: 'status-blue' },
  { value: 'sub', label: 'Sub', icon: 'bi bi-folder', color: 'status-gray' },
];

// onFiltersChange will be defined after localCurrentPage
let onFiltersChange = () => {};
const localSearch = ref((props.searchQueryCategories || '').toString());
const showFileModal = ref(false);
const modalFileUrl = ref('');
const modalFileName = ref('');

// WebSocket
const wsConnected = ref(false);
const { appContext } = getCurrentInstance();
const $axios = appContext.config.globalProperties.$axios;
let ws = null;

onMounted(() => {
  ws = createWebSocketConnection(WS_ENDPOINTS.CATEGORIES, {
    axios: $axios,
    onMessage: (message) => {
      if (message.type === 'CATEGORY_UPDATE') {
        $axios.get('/getcategories').catch(() => {});
        emit('refresh');
      }
    },
    onOpen: () => { wsConnected.value = true; },
    onClose: () => { wsConnected.value = false; },
  });
  try { $axios.get('/getcategories'); } catch (e) {}
});

onUnmounted(() => { if (ws) ws.disconnect(); });

// Helpers
function hideIfFour(id) { return id != null && /^\d{4}$/.test(String(id).trim()); }
function isThreeDigits(id) { return id != null && /^\d{3}$/.test(String(id).trim()); }
function toggleExpand(id) { expanded.value[id] = !expanded.value[id]; }

// Parse contact field into lines (supports ' ||| ' separator and newlines)
function parseContacts(str) {
  if (!str) return [];
  return String(str).split(/ \|\|\| |\n/).map(s => s.trim()).filter(Boolean);
}

// Data Computations

// Normalize a contact line into a canonical key for deduplication
function normalizeContactKey(line) {
  if (!line) return null;
  const s = String(line).trim();
  // extract phone
  const phoneMatch = s.match(/0(?:2|[3-9]\d)[-\s]?\d{3}[-\s]?\d{3,4}|0\d{2}[-\s]?\d{3}[-\s]?\d{4}/);
  if (phoneMatch) return `phone:${phoneMatch[0].replace(/\D/g, '')}`;
  // extract url
  const urlMatch = s.match(/https?:\/\/[^\s]+/i);
  if (urlMatch) return `url:${urlMatch[0].trim().toLowerCase().replace(/\/$/, '').split('?')[0]}`;
  const txt = s.toLowerCase().replace(/\s+/g, ' ').trim();
  return `text:${txt}`;
}

// Aggregate contacts for a parent category and dedupe phones and urls (merge extensions)
function aggregatedContacts(parentId) {
  const parentStr = String(parentId ?? '').trim();
  const list = [ ...(allItems.value || []).filter(c => String(c.CategoriesID || '').trim() === parentStr), ...subCategories(parentId, parentId) ];
  const lines = [];
  for (const c of list) {
    if (c && c.Contact) {
      const parts = parseContacts(c.Contact);
      for (const p of parts) {
        const cleaned = String(p || '').trim();
        if (cleaned) lines.push(cleaned);
      }
    }
  }

  // Merge phone extensions for same base phone
  const phoneMap = new Map(); // basePhone -> { exts:Set, urls:Set }
  const urls = new Set();
  const others = new Set();

  for (const l of lines) {
    const phoneMatch = l.match(/(0(?:2|[3-9]\d)[-\s]?\d{3}[-\s]?\d{3,4}|0\d{2}[-\s]?\d{3}[-\s]?\d{4})/);
    const urlMatch = l.match(/https?:\/\/[^\s]+/i);
    if (phoneMatch) {
      const phoneDigits = phoneMatch[0].replace(/\D/g, '');
      const extMatch = l.match(/(?:ต่อ|ext\.?|x)\s*[:\.]?\s*(\d{1,6})/i);
      const ext = extMatch ? extMatch[1] : null;
      const u = urlMatch ? urlMatch[0].trim().toLowerCase().replace(/\/$/, '').split('?')[0] : null;
      if (!phoneMap.has(phoneDigits)) phoneMap.set(phoneDigits, { exts: new Set(), urls: new Set() });
      if (ext) phoneMap.get(phoneDigits).exts.add(ext);
      if (u) phoneMap.get(phoneDigits).urls.add(u);
    } else if (urlMatch) {
      urls.add(urlMatch[0].trim().toLowerCase().replace(/\/$/, '').split('?')[0]);
    } else {
      others.add(l);
    }
  }

  // Build output lines
  const out = [];
  // phones first
  const formatPhone = (digits) => {
    if (!digits) return '';
    if (digits.length === 9) return digits.slice(0,3) + '-' + digits.slice(3);
    if (digits.length === 10) return digits.slice(0,3) + '-' + digits.slice(3,6) + '-' + digits.slice(6);
    return digits;
  }

  // Collect urls globally to dedupe across phones and standalone entries
  const globalUrlSet = new Set();

  for (const [phone, data] of phoneMap.entries()) {
    const extArr = Array.from(data.exts.values()).sort((a,b)=>a-b);
    let line = `เบอร์โทรศัพท์ : ${formatPhone(phone)}`;
    if (extArr.length) line += ` ต่อ ${extArr.join(' หรือ ')}`;
    out.push(line);
    for (const u of data.urls) globalUrlSet.add(u);
  }

  // then standalone urls
  for (const u of urls) globalUrlSet.add(u);

  // push unique urls as a single line separated by ' หรือ '
  if (globalUrlSet.size > 0) {
    out.push(`ลิงค์ : ${Array.from(globalUrlSet).join(' หรือ ')}`);
  }

  // then other free text
  for (const o of others) out.push(o);

  return out;
}

// check if a contact line is covered by parent's aggregated set
function isContactCoveredByParent(parentId, contactLine) {
  const ag = aggregatedContacts(parentId);
  const key = normalizeContactKey(contactLine);
  if (!key) return false;
  for (const a of ag) {
    if (normalizeContactKey(a) === key) return true;
  }
  return false;
}

// Data Computations
const allItems = computed(() => {
  if (Array.isArray(props.categories) && props.categories.length) return props.categories;
  if (Array.isArray(props.filteredCategories) && props.filteredCategories.length) return props.filteredCategories;
  return [];
});

const totalFilesCount = computed(() => {
  return allItems.value.filter(c => c.CategoriesPDF).length;
});

// Local pagination state (must be declared before filteredAndSortedParents)
const localCurrentPage = ref(1);
const itemsPerPage = ref(5);

// Now define onFiltersChange
onFiltersChange = () => {
  localCurrentPage.value = 1;
};

// Filter and Sort Logic for visibleParents
const filteredAndSortedParents = computed(() => {
  const source = Array.isArray(props.filteredCategories) && props.filteredCategories.length 
    ? props.filteredCategories 
    : (Array.isArray(props.categories) ? props.categories : []);
  
  let result = [];
  
  // Apply status filter first, then determine what to show
  if (catFilters.value.status === 'sub') {
    // Show only sub-categories (not main)
    result = source.filter(cat => {
      if (!cat) return false;
      const id = String(cat.CategoriesID ?? '').trim();
      if (hideIfFour(id)) return false;
      return !isMain(cat);
    });
  } else if (catFilters.value.status === 'main') {
    // Show only main categories
    result = source.filter(cat => {
      if (!cat) return false;
      const id = String(cat.CategoriesID ?? '').trim();
      if (hideIfFour(id)) return false;
      return isMain(cat);
    });
  } else {
    // No filter - show parent categories only (original behavior for tree view)
    result = source.filter(cat => {
      if (!cat) return false;
      const id = String(cat.CategoriesID ?? '').trim();
      if (hideIfFour(id)) return false;
      const parent = String(cat.ParentCategoriesID ?? '').trim();
      if (parent && parent === id) return true;
      if (!parent) return true;
      if (!parentExists(parent)) return true;
      return false;
    });
  }

  // Apply sorting
  const sortBy = catFilters.value.sortBy;
  const sortOrder = catFilters.value.sortOrder;
  result.sort((a, b) => {
    let valA, valB;
    if (sortBy === 'id') {
      // Handle IDs like "5-5", "1-7" - sort by string comparison for mixed formats
      const idA = String(a.CategoriesID || '');
      const idB = String(b.CategoriesID || '');
      // Try numeric sort first if both are pure numbers
      const numA = Number(idA);
      const numB = Number(idB);
      if (!isNaN(numA) && !isNaN(numB)) {
        valA = numA;
        valB = numB;
      } else {
        // Use localeCompare for string IDs like "1-7", "5-5"
        return sortOrder === 'asc' 
          ? idA.localeCompare(idB, undefined, { numeric: true })
          : idB.localeCompare(idA, undefined, { numeric: true });
      }
    } else if (sortBy === 'name') {
      valA = (a.CategoriesName || '').toLowerCase();
      valB = (b.CategoriesName || '').toLowerCase();
    } else {
      valA = String(a.CategoriesID || '');
      valB = String(b.CategoriesID || '');
      return sortOrder === 'asc'
        ? valA.localeCompare(valB, undefined, { numeric: true })
        : valB.localeCompare(valA, undefined, { numeric: true });
    }
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return result;
});

// Chart Logic
const visibleParents = computed(() => {
  const q = searchTerm.value;
  if (!q) {
    const parentsAll = filteredAndSortedParents.value;
    const p = Number(localCurrentPage.value || 1);
    const perPage = Number(itemsPerPage.value || 5);
    const start = (p - 1) * perPage;
    return parentsAll.slice(start, start + perPage);
  }
  const ids = matchedParentIds.value;
  if (!ids || ids.size === 0) return [];
  const list = allItems.value || [];
  return list.filter(c => {
    if (!c) return false;
    const id = String(c.CategoriesID ?? '').trim();
    if (hideIfFour(id)) return false;
    return ids.has(id);
  });
});

const filteredBarChartData = computed(() => {
  const vp = Array.isArray(visibleParents.value) ? visibleParents.value : [];
  if (!vp.length) return { labels: [], datasets: [] };
  const mains = vp.filter(c => isMain(c));
  const labels = mains.map(c => c.CategoriesName || String(c.CategoriesID));
  const childrenByMain = mains.map(m => (subCategories(m.CategoriesID, m.CategoriesID) || []));
  const allChildNamesSet = new Set();
  childrenByMain.forEach(list => list.forEach(s => {
    const nm = String(s.CategoriesName || s.CategoriesID || '').trim();
    if (nm) allChildNamesSet.add(nm);
  }));
  const childNames = Array.from(allChildNamesSet);
  const palette = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#5856D6', '#AF52DE', '#5AC8FA', '#FF2D55'];
  const datasets = childNames.map((childName, idx) => {
    const data = mains.map((m, i) => {
      const subs = childrenByMain[i];
      const childObj = subs.find(s => String(s.CategoriesName || s.CategoriesID || '').trim() === childName);
      if (!childObj) return 0;
      const cid = String(childObj.CategoriesID ?? '').trim();
      const countMap = props.qaCountsByCategoryId || {};
      let val = countMap[cid];
      if (val == null) {
        const nameMap = props.qaCountsByCategoryName || {};
        val = nameMap[String(childObj.CategoriesName || '').trim()];
      }
      const num = Number(val);
      return isNaN(num) ? 1 : num;
    });
    return { label: childName, data, backgroundColor: palette[idx % palette.length], borderRadius: 4 };
  });
  return { labels, datasets };
});

const localBarChartOptions = computed(() => {
  const base = props.barChartOptions || {};
  return {
    ...base,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { font: { family: '-apple-system, sans-serif' } } },
      y: { stacked: true, grid: { borderDash: [4, 4], color: '#f0f0f0' }, beginAtZero: true }
    },
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } }
    },
    datasets: { bar: { maxBarThickness: 32 } }
  };
});

// Search Logic
function itemMatchesQuery(item, q) {
  if (!item || !q) return false;
  const s = String(q || '').toLowerCase().trim().normalize('NFC');
  const id = String(item.CategoriesID ?? '').toLowerCase().trim().normalize('NFC');
  const name = String(item.CategoriesName ?? '').toLowerCase().trim().normalize('NFC');
  return id.includes(s) || name.includes(s);
}

function findParentIdsForItem(item) {
  const parents = [];
  if (!item) return parents;
  const list = allItems.value;
  const parentId = String(item.ParentCategoriesID ?? '').trim();
  if (parentId && parentId !== String(item.CategoriesID ?? '').trim() && list.some(c => String(c.CategoriesID ?? '').trim() === parentId)) {
    parents.push(parentId);
  }
  const cid = String(item.CategoriesID ?? '').trim();
  if (hideIfFour(cid)) {
    const threeParent = list.find(c => isThreeDigits(String(c.CategoriesID ?? '').trim()) && cid.startsWith(String(c.CategoriesID ?? '').trim()));
    if (threeParent) parents.push(String(threeParent.CategoriesID));
  }
  if (isMain(item)) parents.push(String(item.CategoriesID));
  return [...new Set(parents)];
}

const searchTerm = computed(() => {
  const raw = (localSearch.value && localSearch.value.toString().trim() !== '') ? localSearch.value : (props.searchQueryCategories || '');
  return String(raw).toLowerCase().trim().normalize('NFC');
});

const matchedParentIds = computed(() => {
  const q = searchTerm.value;
  if (!q) return new Set();
  const matches = allItems.value.filter(item => itemMatchesQuery(item, q));
  const ids = new Set();
  matches.forEach(item => {
    findParentIdsForItem(item).forEach(id => { if (id) ids.add(String(id)); });
  });
  return ids;
});

watch(() => props.searchQueryCategories, (val) => {
  const v = (val || '').toString();
  if (v !== localSearch.value) localSearch.value = v;
});

watch(localSearch, (val) => {
  emit('update:searchQueryCategories', val);
  const q = (val || '').toString().trim();
  if (q) expandParentsForMatches(q);
}, { immediate: false });

function expandParentsForMatches(q) {
  if (!q) return;
  const matches = allItems.value.filter(item => itemMatchesQuery(item, q));
  const ids = new Set();
  matches.forEach(item => {
    findParentIdsForItem(item).forEach(id => { if (id) ids.add(String(id)); });
  });
  const newExpanded = {};
  ids.forEach(id => { if (id) newExpanded[id] = true; });
  expanded.value = newExpanded;
}

const autoExpanded = computed(() => {
  const out = {};
  const ids = matchedParentIds.value || new Set();
  ids.forEach(id => { if (id) out[String(id)] = true; });
  return out;
});

const expandedMap = computed(() => Object.assign({}, expanded.value || {}, autoExpanded.value || {}));

// Category Hierarchy
function subCategories(parentId, selfId) {
  const parentStr = String(parentId ?? '').trim();
  const list = allItems.value.slice();
  const q = searchTerm.value;
  return list.filter(c => {
    if (c == null) return false;
    const cid = String(c.CategoriesID ?? '').trim();
    if (String(c.CategoriesID) === String(selfId)) return false;
    if (hideIfFour(cid)) {
      const isChildOfPrefix = isThreeDigits(parentStr) && cid.startsWith(parentStr);
      if (!isChildOfPrefix) return false;
      return q ? itemMatchesQuery(c, q) : true;
    }
    const isParentMatch = String(c.ParentCategoriesID ?? '').trim() === parentStr;
    if (!isParentMatch) return false;
    return q ? itemMatchesQuery(c, q) : true;
  }).sort((a, b) => {
    // Sort by CategoriesID ascending (e.g., 1-1, 1-2, 1-3...)
    const aId = String(a.CategoriesID || '');
    const bId = String(b.CategoriesID || '');
    return aId.localeCompare(bId, undefined, { numeric: true, sensitivity: 'base' });
  });
}

function hasSubCategories(parentId, selfId) { return subCategories(parentId, selfId).length > 0; }

function parentExists(parentId) {
  if (parentId == null || parentId === '') return false;
  const list = Array.isArray(props.filteredCategories) && props.filteredCategories.length ? props.filteredCategories : (Array.isArray(props.categories) ? props.categories : []);
  return list.some(c => String(c?.CategoriesID ?? '').trim() === String(parentId).trim());
}

function isMain(cat) {
  if (!cat) return false;
  const id = String(cat.CategoriesID ?? '').trim();
  const parent = String(cat.ParentCategoriesID ?? '').trim();
  
  // If ParentCategoriesID equals CategoriesID, it's a main category
  if (parent && parent === id) return true;
  
  // If no parent, it's a main category
  if (!parent) return true;
  
  // If ParentCategoriesID is different from CategoriesID, it's a sub-category
  // regardless of whether parent exists in the current list
  if (parent && parent !== id) return false;
  
  return true;
}

// Pagination computed properties
const visibleParentsTotal = computed(() => {
  const q = searchTerm.value;
  if (q) return visibleParents.value.length;
  // Use filteredAndSortedParents which already applies the status filter
  return filteredAndSortedParents.value.length;
});

const localTotalPages = computed(() => {
  const total = filteredAndSortedParents.value.length;
  return Math.max(1, Math.ceil(total / itemsPerPage.value));
});

const displayPage = computed(() => Math.min(Math.max(1, localCurrentPage.value), localTotalPages.value));

// Start and End index for pagination display
const localStartIndex = computed(() => {
  if (visibleParentsTotal.value === 0) return 0;
  return (displayPage.value - 1) * itemsPerPage.value + 1;
});

const localEndIndex = computed(() => {
  return Math.min(displayPage.value * itemsPerPage.value, visibleParentsTotal.value);
});

const localPagesToShow = computed(() => {
  const total = localTotalPages.value || 1;
  const current = displayPage.value || 1;
  const maxButtons = 4;
  if (total <= maxButtons) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 2) return [1, 2, 3, 4];
  if (current >= total - 1) return [total - 3, total - 2, total - 1, total];
  return [current - 1, current, current + 1, current + 2];
});

// Reset to page 1 when filter changes
watch(() => catFilters.value.status, () => { localCurrentPage.value = 1; });
watch(localSearch, () => { localCurrentPage.value = 1; });

function categoriesGoToPage(p) { if(p>=1 && p<=localTotalPages.value) localCurrentPage.value = p; }
function categoriesPrevPage() { if(displayPage.value > 1) localCurrentPage.value--; }
function categoriesNextPage() { if(displayPage.value < localTotalPages.value) localCurrentPage.value++; }
function categoriesFirstPage() { localCurrentPage.value = 1; }
function categoriesLastPage() { localCurrentPage.value = localTotalPages.value; }

// File Modal
function isUrl(val) { return val && /^https?:\/\//i.test(val); }
function pdfUrl(val) { if (!val) return '#'; return isUrl(val) ? val : `/uploads/${val}`; }
function isPdf(url) { return String(url).toLowerCase().trim().endsWith('.pdf'); }
function pdfIconClass(val) {
  const s = String(val).toLowerCase();
  if (s.endsWith('.pdf')) return 'bi bi-file-earmark-pdf-fill text-danger';
  if (s.endsWith('.doc') || s.endsWith('.docx')) return 'bi bi-file-earmark-word-fill text-primary';
  return 'bi bi-file-earmark-text text-secondary';
}

function openFile(fileValue, name) {
  modalFileUrl.value = pdfUrl(fileValue);
  modalFileName.value = name || 'File';
  showFileModal.value = true;
}
function closeModal() { showFileModal.value = false; }
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

.dashboard-container > .container-fluid {
  padding-left: clamp(0.4rem, 2vw, 1.5rem);
  padding-right: clamp(0.4rem, 2vw, 1.5rem);
  padding-top: 1rem;
  max-width: none;
  margin: 0;
}

/* Mobile container spacing fix */
@media (max-width: 768px) {
  .dashboard-container > .container-fluid {
    padding: 12px !important;
  }
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

/* New Apple Icon Box */
.apple-icon-box {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #0071e3 0%, #00c6ff 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.25);
  font-size: 1.5rem;
  color: white;
}

/* Status Badge */
.apple-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.9);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #86868b;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.05);
}
.apple-status-badge.online {
  color: #34C759;
  border-color: rgba(52, 199, 89, 0.2);
  background: rgba(52, 199, 89, 0.05);
}
.status-dot {
  width: 8px; height: 8px; border-radius: 50%; background: #86868b;
}
.apple-status-badge.online .status-dot {
  background: #34C759;
  box-shadow: 0 0 8px rgba(52, 199, 89, 0.4);
}

/* Stats Cards with Gradient Icons */
.apple-stat-card {
  background: white;
  border-radius: var(--card-radius);
  padding: 20px;
  box-shadow: var(--card-shadow);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid rgba(0,0,0,0.02);
}
.apple-stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }

.stat-icon-wrapper {
  width: 50px; height: 50px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.6rem;
  color: white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.blue-gradient { background: linear-gradient(135deg, #0071e3 0%, #4facfe 100%); }
.purple-gradient { background: linear-gradient(135deg, #AF52DE 0%, #ff9a9e 100%); }
.orange-gradient { background: linear-gradient(135deg, #FF9500 0%, #ffc371 100%); }

.stat-value { font-size: 1.6rem; font-weight: 700; color: #1d1d1f; line-height: 1.1; }
.stat-label { font-size: 0.85rem; color: #86868b; margin-top: 4px; font-weight: 500; }

/* Cards & Charts */
.apple-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.05);
}
.chart-card { padding: 20px; }
.card-header-clean h5 { font-size: 1rem; font-weight: 600; color: #1d1d1f; margin: 0 0 16px 0; }

/* New Total Counter Capsule */
.apple-counter-capsule {
  display: inline-flex;
  align-items: center;
  background: #F2F2F7;
  padding: 6px 14px;
  border-radius: 30px;
  color: #1d1d1f;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
}
.apple-counter-capsule .label { color: #86868b; margin-right: 8px; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; }
.apple-counter-capsule .separator { color: #d1d1d6; margin-right: 8px; font-weight: 300; }
.apple-counter-capsule .count { font-weight: 700; color: #0071e3; }

/* Search */
.search-container { position: relative; width: 240px; }
.search-input {
  width: 100%; padding: 8px 36px;
  border-radius: 10px; border: 1px solid rgba(0,0,0,0.1);
  background: rgba(118, 118, 128, 0.08);
  font-size: 0.9rem; transition: all 0.2s;
}
.search-input:focus { background: white; border-color: var(--apple-blue); outline: none; box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15); }

/* Contact column: show full text, multi-line */
.contact-cell { min-width: 220px; max-width: 380px; word-break: break-word; }
.contact-cell .small { display: block; white-space: normal; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #86868b; }
.search-clear { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); border: none; background: none; color: #86868b; cursor: pointer; }

/* Table */
.apple-table thead th {
  background: rgba(249, 249, 251, 0.95);
  font-weight: 600; color: #86868b;
  font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(0,0,0,0.08); padding: 16px;
}
.apple-table tbody td { padding: 14px 16px; border-bottom: 1px solid rgba(0,0,0,0.03); color: #1d1d1f; }
.apple-table tr.parent-row:hover { background-color: rgba(0, 113, 227, 0.03); }
.sub-row { background-color: #FAFAFC; }
.sub-row:hover { background-color: #F2F2F5; }

/* Badges */
.apple-badge-blue { background: rgba(0, 113, 227, 0.1); color: var(--apple-blue); padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
.apple-badge-gray { background: rgba(142, 142, 147, 0.1); color: #636366; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
.apple-badge-gray-outline { border: 1px solid rgba(142, 142, 147, 0.3); color: #86868b; padding: 3px 9px; border-radius: 6px; font-size: 0.75rem; font-weight: 500; }

/* File Link */
.file-link-btn {
  border: none; background: transparent; padding: 4px 8px; border-radius: 6px;
  color: #1d1d1f; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px;
  transition: background 0.2s;
}
.file-link-btn:hover { background: rgba(0,0,0,0.05); color: var(--apple-blue); }

/* Expand Button */
.expand-btn {
  background: transparent; border: none; width: 24px; height: 24px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  color: #86868b; transition: all 0.2s;
}
.expand-btn:hover { background: rgba(0,0,0,0.08); color: #1d1d1f; }

/* Modal */
.apple-modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(8px);
  z-index: 99; display: flex; align-items: center; justify-content: center; padding: 20px;
}
.apple-modal-content {
  background: rgba(255,255,255,0.95); backdrop-filter: blur(20px);
  border-radius: 18px; width: 100%; max-width: 900px;
  box-shadow: 0 24px 48px rgba(0,0,0,0.2); overflow: hidden; display: flex; flex-direction: column; height: 85vh;
}
.apple-modal-header { border-bottom: 1px solid rgba(0,0,0,0.06); background: white; }
.apple-icon-btn, .apple-close-btn {
  width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  border: none; background: rgba(0,0,0,0.05); color: #1d1d1f; transition: all 0.2s; text-decoration: none;
}
.apple-icon-btn:hover, .apple-close-btn:hover { background: rgba(0,0,0,0.1); color: var(--apple-blue); }
.btn-apple-primary {
  background: var(--apple-blue); color: white; padding: 10px 24px; border-radius: 99px; text-decoration: none; font-weight: 500; transition: transform 0.2s;
}
.btn-apple-primary:hover { transform: scale(1.02); }

/* Animation Transitions */
.list-slide-enter-active, .list-slide-leave-active { transition: all 0.3s ease; }
.list-slide-enter-from, .list-slide-leave-to { opacity: 0; transform: translateY(-10px); }
.apple-zoom-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.apple-zoom-leave-active { transition: all 0.2s ease; }
.apple-zoom-enter-from, .apple-zoom-leave-to { opacity: 0; transform: scale(0.95); }

/* Pagination Override */
.pagination .page-link { 
  border: none; 
  color: #1d1d1f; 
  border-radius: 8px; 
  margin: 0 2px;
  background: rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
}
.pagination .page-link:hover {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
}
.pagination .page-item.active .page-link { 
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%) !important; 
  color: #FFFFFF !important; 
  border: none !important;
  box-shadow: 0 2px 8px rgba(0, 113, 227, 0.3); 
}
.pagination .page-item.disabled .page-link {
  background: transparent;
  color: #c7c7cc;
}

/* Pagination Footer - Apple Style */
.pagination-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 0 0 16px 16px;
}
.pagination-info {
  font-size: 13px;
  color: #86868b;
  font-weight: 500;
}

@media (max-width: 992px) {
  .d-flex.align-items-center.justify-content-between.mb-4 {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.75rem;
  }

  .apple-status-badge {
    align-self: center;
  }

  .row.mb-4.g-3 {
    margin-left: 0;
    margin-right: 0;
  }

  .row.mb-4.g-3 > .col-md-4 {
    width: 100%;
    flex: 0 0 100%;
    max-width: 100%;
  }

  .apple-card.chart-card {
    padding: 16px;
  }

  .apple-card.table-wrapper {
    padding: 0;
  }

  .card-header-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .search-container { width: 100%; }
}

@media (max-width: 768px) {
  .apple-stat-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .apple-counter-capsule {
    width: 100%;
    justify-content: space-between;
  }

  .table-responsive {
    overflow-x: visible;
    overflow-y: visible;
  }

  .contact-cell { min-width: unset; }
  .search-input { padding-right: 2.5rem; }

  .apple-table { display: block; }
  .apple-table thead { display: none; }
  .apple-table tbody { 
    display: flex; 
    flex-direction: column; 
    gap: 12px;
    padding: 12px;
  }
  .apple-table tbody tr {
    display: flex;
    flex-direction: column;
    background: #FFFFFF;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    margin: 0;
    padding: 0;
    border: none;
  }
  .apple-table tbody tr.sub-row {
    background: rgba(0, 122, 255, 0.04);
    margin-left: 16px;
    border-left: 3px solid #007AFF;
  }
  .apple-table tbody td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: transparent;
    border-radius: 0;
    gap: 1rem;
    border: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  }
  .apple-table tbody td:last-child {
    border-bottom: none;
  }
  .apple-table tbody td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #86868b;
    flex: 0 0 auto;
    min-width: 80px;
    text-transform: uppercase;
    font-size: 0.65rem;
    letter-spacing: 0.5px;
  }
  .apple-table tbody td[data-label="Actions"] {
    display: none;
  }
  .apple-table tbody td button.file-link-btn {
    justify-content: flex-end;
  }
  
  /* Hide empty first column for mobile */
  .apple-table tbody tr td:first-child:empty {
    display: none;
  }
  
  /* Tree line hide on mobile */
  .tree-line {
    display: none;
  }
}

@media (max-width: 576px) {
  .container-fluid { padding: 12px !important; }
  .apple-status-badge { width: 100%; justify-content: center; }
  .apple-card.chart-card { padding: 12px; }
  .pagination { flex-wrap: wrap; gap: 0.5rem; justify-content: center; }
  
  /* Pagination Footer Mobile */
  .pagination-footer,
  .d-flex.justify-content-between.align-items-center.p-3.border-top {
    flex-direction: column;
    gap: 12px;
    text-align: center;
    padding: 16px !important;
  }
  
  .pagination .page-link {
    min-width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>