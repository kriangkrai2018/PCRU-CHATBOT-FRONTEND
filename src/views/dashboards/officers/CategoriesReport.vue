<template>
    <div class="">
      <div class="card p-4 bg-light shadow-sm mb-4 rounded-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 class="fs-5 mb-0">Categories Report</h3>
          <span v-if="wsConnected" class="badge bg-success">
            <i class="bi bi-wifi"></i> Live
          </span>
          <span v-else class="badge bg-secondary">
            <i class="bi bi-wifi-off"></i> Offline
          </span>
        </div>
        <div v-if="categoriesLoading" class="text-center py-3">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Loading categories data...</p>
        </div>
        <div v-else-if="categoriesError" class="alert alert-danger" role="alert">
          Error: {{ categoriesError }}
        </div>
        <div v-else>
          <!-- Charts: render only when showCharts is true -->
          <div v-if="showCharts" class="row">
            <div class="col-12 col-md-6 mb-3">
              <div class="chart-area">
                <DoughnutChart :chart-data="categoriesPieChartData" :chart-options="chartOptions" style="height: 260px;" />
              </div>
            </div>
            <div class="col-12 col-md-6 mb-3">
              <div class="chart-area">
                <BarChart :chart-data="filteredBarChartData" :chart-options="localBarChartOptions" style="height: 260px;" />
              </div>
            </div>
          </div>
          <div class="table-responsive mt-3">
            <!-- Updated: flex row, total left, search right -->
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div class="small text-muted flex-grow-1 text-start">Total: {{ categoriesTotalEntries }}</div>
              <div class="search-wrapper">
                <ReportSearch v-model="localSearch" placeholder="ค้นหาหมวดหมู่..." />
              </div>
            </div>
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th></th>
                  <th>CategoriesID</th>
                  <th>CategoriesName</th>
                  <th>Parent</th>
                  <th>CategoriesPDF</th>
                </tr>
              </thead>
              <tbody>
                <!-- iterate visibleParents (excludes 4-digit IDs) -->
                <template v-for="(cat, idx) in visibleParents" :key="cat.CategoriesID">
                  <tr class="align-middle" :class="isMain(cat) ? 'bg-primary-subtle' : ''">
                    <td class="py-3 ps-3"></td>
                    <td class="py-3">
                      <div class="d-flex align-items-center">
                        <div v-if="hasSubCategories(cat.CategoriesID, cat.CategoriesID)" class="me-2">
                          <button class="btn btn-link btn-sm p-0" @click="toggleExpand(cat.CategoriesID)" style="font-size:1.0rem;">
                            <i :class="expandedMap[cat.CategoriesID] ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
                          </button>
                        </div>
                        <div>{{ cat.CategoriesID }}</div>
                      </div>
                    </td>
                    <td class="py-3">{{ cat.CategoriesName }}</td>
                    <td class="py-3">
                      <span :class="isMain(cat) ? 'badge bg-primary' : 'badge bg-info'">
                        {{ isMain(cat) ? 'main' : 'sub' }}
                      </span>
                    </td>
                    <td class="py-3">
                      <template v-if="cat.CategoriesPDF">
                        <a href="#" @click.prevent="openFile(cat.CategoriesPDF, cat.CategoriesName)" class="d-inline-flex align-items-center text-decoration-none">
                          <i :class="pdfIconClass(cat.CategoriesPDF) + ' me-2'"></i>
                          <span class="small">Read file</span>
                        </a>
                      </template>
                      <span v-else class="text-muted">-</span>
                    </td>
                  </tr>

                  <!-- sub rows: use subCategories (already excludes 4-digit children) -->
                  <tr
                    v-for="sub in expandedMap[cat.CategoriesID] ? subCategories(cat.CategoriesID, cat.CategoriesID) : []"
                    :key="sub.CategoriesID"
                    class="bg-light align-middle"
                  >
                    <td class="py-3"></td>
                    <td class="py-3 ps-4">{{ sub.CategoriesID }}</td>
                    <td class="py-3">{{ sub.CategoriesName }}</td>
                    <td class="py-3"><span class="badge bg-info">sub</span></td>
                    <td class="py-3">
                      <template v-if="sub.CategoriesPDF">
                        <a href="#" @click.prevent="openFile(sub.CategoriesPDF, sub.CategoriesName)" class="d-inline-flex align-items-center text-decoration-none">
                          <i :class="pdfIconClass(sub.CategoriesPDF) + ' me-2'"></i>
                          <span class="small">Read file</span>
                        </a>
                      </template>
                      <span v-else class="text-muted">-</span>
                    </td>
                  </tr>
                </template>

                <tr v-if="(Array.isArray(visibleParents) ? visibleParents.length : (visibleParents || []).length) === 0">
                  <td colspan="5" class="text-center text-muted py-3">No categories data found</td>
                </tr>
              </tbody>
            </table>
            <div class="d-flex justify-content-between align-items-center p-3 border-top mt-auto">
              <div class="small text-muted">
                Showing {{ categoriesStartIndex }} to {{ categoriesEndIndex }} of {{ categoriesTotalEntries }} entries
              </div>

              <!-- always render pagination (removed v-if so it shows even when single page) -->
              <nav v-if="localTotalPages > 0" aria-label="Page navigation for categories">
                <ul class="pagination pagination-sm mb-0 align-items-center">
                  <li class="page-item" :class="{ disabled: displayPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="categoriesFirstPage" aria-label="First">&laquo;</a>
                  </li>
                  <li class="page-item" :class="{ disabled: displayPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="categoriesPrevPage" aria-label="Previous">&lsaquo;</a>
                  </li>

                  <li v-for="page in localPagesToShow" :key="`page-${page}`" class="page-item" :class="{ active: displayPage === page }">
                    <a class="page-link page-num rounded-3" href="#" @click.prevent="categoriesGoToPage(page)" :title="`Go to page ${page}`">{{ page }}</a>
                  </li>

                  <li class="page-item" :class="{ disabled: displayPage === localTotalPages }">
                    <a class="page-link" href="#" @click.prevent="categoriesNextPage" aria-label="Next">&rsaquo;</a>
                  </li>
                  <li class="page-item" :class="{ disabled: displayPage === localTotalPages }">
                    <a class="page-link" href="#" @click.prevent="categoriesLastPage" aria-label="Last">&raquo;</a>
                  </li>
                </ul>
              </nav>

            </div>
          </div>
        </div>
      </div>

      <!-- Replace the modal block with a minimal, backdrop-less modal that has only a close button -->
      <div ref="fileModalEl" class="modal fade file-modal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered">
          <div class="modal-content">
            <!-- header buttons: open-in-new-tab left, close right -->
            <div class="file-modal-header-btns">
              <a
                v-if="modalFileUrl"
                :href="modalFileUrl"
                target="_blank"
                rel="noopener"
                class="btn file-modal-open"
                :title="'Open in new tab'"
              >
                <span aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M6.364 13.657a.5.5 0 0 1 0-.707l6.647-6.647H9.5a.5.5 0 0 1 0-1h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V7.343l-6.647 6.647a.5.5 0 0 1-.707 0z"/>
                    <path d="M13.5 2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11A.5.5 0 0 1 2.5 2h11zm-11-1A1.5 1.5 0 0 0 1 2.5v11A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 13.5 1h-11z"/>
                  </svg>
                </span>
              </a>
              <button type="button" class="btn file-modal-close" aria-label="Close" @click="closeModal()">
                <span aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2.146 2.146a.5.5 0 0 1 .708 0L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854a.5.5 0 0 1 0-.708z"/>
                  </svg>
                </span>
              </button>
            </div>
            <div class="modal-body p-0">
              <div v-if="isPdf(modalFileUrl)" style="height:80vh;">
                <iframe :src="modalFileUrl" frameborder="0" style="width:100%; height:100%;"></iframe>
              </div>
              <div v-else class="py-4 text-center">
                <p class="mb-3">Preview not available for this file type.</p>
                <a :href="modalFileUrl" target="_blank" rel="noopener" class="btn btn-primary">Open / Download</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
// filepath: /Users/kriangkrai/Library/CloudStorage/GoogleDrive-kriangkrai2018@gmail.com/ไดรฟ์ของฉัน/PCRU-Chatbot Project/pcru-chatbot-frontend/src/views/dashboards/officers/CategoriesReport.vue
import { ref, computed, watch, nextTick, onUnmounted, onMounted, getCurrentInstance } from 'vue';
import { Modal } from 'bootstrap';
import { DoughnutChart, BarChart } from 'vue-chart-3';
import { createWebSocketConnection, WS_ENDPOINTS } from '@/config/websocket';
import ReportSearch from '@/components/ReportSearch.vue';

const props = defineProps({
  categories: Array,
  categoriesLoading: Boolean,
  categoriesError: String,
  categoriesPieChartData: Object,
  categoriesBarChartData: Object,
  // Optional: map of CategoriesID -> Q&A count to drive bar segment values
  qaCountsByCategoryId: Object,
  // Optional: map of CategoriesName -> Q&A count (fallback if ID map not available)
  qaCountsByCategoryName: Object,
  searchQueryCategories: String,
  filteredCategories: Array,
  paginatedCategories: Array,
  categoriesStartIndex: Number,
  categoriesEndIndex: Number,
  categoriesTotalEntries: Number,
  categoriesCurrentPage: Number,
  categoriesTotalPages: Number,
  categoriesPagesToShow: Array,
  categoriesFirstPage: Function,
  categoriesPrevPage: Function,
  categoriesGoToPage: Function,
  categoriesNextPage: Function,
  categoriesLastPage: Function,
  chartOptions: Object,
  barChartOptions: Object,
  showCharts: { type: Boolean, default: true },
});

const emit = defineEmits(['update:searchQueryCategories', 'refresh']);

const expanded = ref({});

// WebSocket state
const wsConnected = ref(false);
const { appContext } = getCurrentInstance();
const $axios = appContext.config.globalProperties.$axios;
let ws = null;

// Initialize WebSocket connection
onMounted(() => {
  ws = createWebSocketConnection(WS_ENDPOINTS.CATEGORIES, {
    axios: $axios,
    onMessage: (message) => {
      if (message.type === 'CATEGORY_UPDATE') {
        // Ensure backend gets a refresh trigger by hitting getcategories
        $axios.get('/getcategories').catch(() => {/* ignore */});
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

  // Initial fetch to getcategories to ensure categories are up to date
  try {
    $axios.get('/getcategories');
  } catch (e) {
    // silently ignore
  }
});

onUnmounted(() => {
  if (ws) {
    ws.disconnect();
  }
});

// helper: hide if exactly 4 digits
function hideIfFour(id) {
  if (id == null) return false;
  return /^\d{4}$/.test(String(id).trim());
}

// NEW helper: true if id is exactly 3 digits
function isThreeDigits(id) {
  if (id == null) return false;
  return /^\d{3}$/.test(String(id).trim());
}

function toggleExpand(id) {
  expanded.value[id] = !expanded.value[id];
}

// use a canonical items array (prefer full categories for searching by name)
const allItems = computed(() => {
	// prefer the full categories array so name search checks every item
	if (Array.isArray(props.categories) && props.categories.length) return props.categories;
	if (Array.isArray(props.filteredCategories) && props.filteredCategories.length) return props.filteredCategories;
	return [];
});

  // Select the self-referencing main category currently visible (first one)
  const selectedMainName = computed(() => {
    const vp = Array.isArray(visibleParents.value) ? visibleParents.value : [];
    const selfMain = vp.find(c => {
      if (!c) return false;
      const id = String(c.CategoriesID ?? '').trim();
      const parentId = String(c.ParentCategoriesID ?? '').trim();
      return parentId && parentId === id;
    });
    return (selfMain && (selfMain.CategoriesName || String(selfMain.CategoriesID))) || '';
  });

  // Compute stacked bar chart: each segment is a subcategory name under its main
  const filteredBarChartData = computed(() => {
    const vp = Array.isArray(visibleParents.value) ? visibleParents.value : [];
    if (!vp.length) return { labels: [], datasets: [] };
    // Consider only main categories in the current visible list
    const mains = vp.filter(c => isMain(c));
    const labels = mains.map(c => c.CategoriesName || String(c.CategoriesID));
    // Gather subcategory names across mains
    const childrenByMain = mains.map(m => (subCategories(m.CategoriesID, m.CategoriesID) || []));
    const allChildNamesSet = new Set();
    childrenByMain.forEach(list => {
      list.forEach(s => {
        const nm = String(s.CategoriesName || s.CategoriesID || '').trim();
        if (nm) allChildNamesSet.add(nm);
      });
    });
    const childNames = Array.from(allChildNamesSet);
    // Build one dataset per subcategory name; data[i] is Q&A count for that child under mains[i]
    const palette = ['#4e79a7','#f28e2b','#e15759','#76b7b2','#59a14f','#edc948','#b07aa1','#ff9da7','#9c755f','#bab0ab'];
    const datasets = childNames.map((childName, idx) => {
      const data = mains.map((m, i) => {
        const subs = childrenByMain[i];
        // find the child object matching the name
        const childObj = subs.find(s => String(s.CategoriesName || s.CategoriesID || '').trim() === childName);
        if (!childObj) return 0;
        const cid = String(childObj.CategoriesID ?? '').trim();
        const countMap = props.qaCountsByCategoryId || {};
        let val = countMap[cid];
        // Fallback to name-based map if ID-based missing
        if (val == null) {
          const nameMap = props.qaCountsByCategoryName || {};
          val = nameMap[String(childObj.CategoriesName || '').trim()];
        }
        // Final fallback: show presence as 1
        const num = Number(val);
        return isNaN(num) ? 1 : num;
      });
      return {
        label: childName,
        data,
        backgroundColor: palette[idx % palette.length],
      };
    });
    return { labels, datasets };
  });

  // Enable stacked bars while preserving incoming options
  const localBarChartOptions = computed(() => {
    const base = props.barChartOptions || {};
    const scales = Object.assign({}, base.scales || {}, {
      x: Object.assign({}, base.scales?.x || {}, {
        stacked: true,
        grid: { display: true },
        ticks: { maxRotation: 0, autoSkip: true },
        categoryPercentage: 0.7,
        barPercentage: 0.9,
      }),
      y: Object.assign({}, base.scales?.y || {}, {
        stacked: true,
        grid: { display: true },
        beginAtZero: true,
      })
    });
    return Object.assign({}, base, {
      responsive: true,
      maintainAspectRatio: false,
      scales,
      plugins: Object.assign({}, base.plugins || {}, {
        legend: Object.assign({}, base.plugins?.legend || {}, { position: 'top' })
      }),
      datasets: {
        bar: {
          maxBarThickness: 48,
          borderSkipped: false,
        }
      }
    });
  });

// helper: check if item matches query (explicitly include CategoriesName)
// normalize Unicode (NFC) and compare lowercased trimmed strings
function itemMatchesQuery(item, q) {
  if (!item || !q) return false;
  const s = String(q || '').toLowerCase().trim().normalize('NFC');
  const id = String(item.CategoriesID ?? '').toLowerCase().trim().normalize('NFC');
  const name = String(item.CategoriesName ?? '').toLowerCase().trim().normalize('NFC');
  const parent = String(item.ParentCategoriesID ?? '').toLowerCase().trim().normalize('NFC');
  const pdf = String(item.CategoriesPDF ?? '').toLowerCase().trim().normalize('NFC');
  return id.includes(s) || name.includes(s) || parent.includes(s) || pdf.includes(s);
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

// subCategories: use allItems as source and when searching filter children by itemMatchesQuery
function subCategories(parentId, selfId) {
  const parentStr = String(parentId ?? '').trim();
  const list = allItems.value.slice();
  const q = searchTerm.value;
  return list.filter(c => {
    if (c == null) return false;
    const cid = String(c.CategoriesID ?? '').trim();
    // exclude self
    if (String(c.CategoriesID) === String(selfId)) return false;

    // 4-digit child: attach when parent's ID is 3-digit and cid starts with parentStr
    if (hideIfFour(cid)) {
      const isChildOfPrefix = isThreeDigits(parentStr) && cid.startsWith(parentStr);
      if (!isChildOfPrefix) return false;
      // when searching: show only children that themselves match the query
      return q ? itemMatchesQuery(c, q) : true;
    }

    // non-4-digit child: attach when ParentCategoriesID equals parentId
    const isParentMatch = String(c.ParentCategoriesID ?? '').trim() === parentStr;
    if (!isParentMatch) return false;
    // when searching: show only children that themselves match the query
    return q ? itemMatchesQuery(c, q) : true;
  });
}

// check if any visible children exist (non-4-digit children OR 4-digit prefixed children)
function hasSubCategories(parentId, selfId) {
  return subCategories(parentId, selfId).length > 0;
}

// helper: check whether a parent ID exists in the current filtered list or full categories list
function parentExists(parentId) {
  if (parentId == null || parentId === '') return false;
  const list = Array.isArray(props.filteredCategories) && props.filteredCategories.length ? props.filteredCategories : (Array.isArray(props.categories) ? props.categories : []);
  return list.some(c => String(c?.CategoriesID ?? '').trim() === String(parentId).trim());
}

// NEW helper: determine whether a row is a "main" category
function isMain(cat) {
  if (!cat) return false;
  const id = String(cat.CategoriesID ?? '').trim();
  const parent = String(cat.ParentCategoriesID ?? '').trim();
  // if parent equals self => explicit main
  if (parent && parent === id) return true;
  // if no parent specified => main
  if (!parent) return true;
  // if parent not present in dataset => treat as main
  if (!parentExists(parent)) return true;
  // otherwise it's a child referencing another main => sub
  return false;
}

// --- NEW: compute search term and matched parent ids ---
// normalize incoming query as NFC to match against normalized fields
const searchTerm = computed(() => {
  const raw = (localSearch.value && localSearch.value.toString().trim() !== '') ? localSearch.value : (props.searchQueryCategories || '');
  return String(raw).toLowerCase().trim().normalize('NFC');
});

// --- NEW: localSearch for immediate input handling ---
const localSearch = ref((props.searchQueryCategories || '').toString());

// keep localSearch in sync when parent updates the prop
watch(() => props.searchQueryCategories, (val) => {
  const v = (val || '').toString();
  if (v !== localSearch.value) localSearch.value = v;
});
    const parentChildrenCounts = computed(() => {
      const counts = {};
      const list = allItems.value || [];
      // Count children for each potential parent (by explicit ParentCategoriesID or 4-digit prefix mapping)
      list.forEach(c => {
        if (!c) return;
        const id = String(c.CategoriesID ?? '').trim();
        const parentId = String(c.ParentCategoriesID ?? '').trim();

        // If c references a different parent explicitly, increment that parent's count
        if (parentId && parentId !== id) {
          counts[parentId] = (counts[parentId] || 0) + 1;
          return;
        }

        // If c is a 4-digit code, try to map it to a 3-digit prefix parent
        if (/^\d{4}$/.test(id)) {
          const threeParent = list.find(x => /^\d{3}$/.test(String(x.CategoriesID)) && id.startsWith(String(x.CategoriesID)));
          if (threeParent) {
            const pid = String(threeParent.CategoriesID);
            counts[pid] = (counts[pid] || 0) + 1;
            return;
          }
        }

        // Ensure parent key exists even if it has zero children
        counts[id] = counts[id] || 0;
      });
      return counts;
    });

// when user types, emit to parent and expand matches immediately
watch(localSearch, (val) => {
  emit('update:searchQueryCategories', val);
  const q = (val || '').toString().trim();
  if (q) expandParentsForMatches(q);
}, { immediate: false });

// on Enter handler (optional) to ensure expansion
function onSearchEnter() {
  emit('update:searchQueryCategories', localSearch.value);
  expandParentsForMatches(localSearch.value);
}

// --- MODIFY visibleParents: when searching return parent objects from allItems (not only paginatedCategories) ---
const visibleParents = computed(() => {
  const page = Array.isArray(props.paginatedCategories) ? props.paginatedCategories : [];
  const q = searchTerm.value;
  if (!q) {
    // Build full parents list from all filtered categories (so we don't accidentally use a paginated slice that contains only children)
    const source = Array.isArray(props.filteredCategories) && props.filteredCategories.length ? props.filteredCategories : (Array.isArray(props.categories) ? props.categories : []);
    const parentsAll = source.filter(cat => {
      if (!cat) return false;
      const id = String(cat.CategoriesID ?? '').trim();
      if (hideIfFour(id)) return false;
      const parent = String(cat.ParentCategoriesID ?? '').trim();
      if (parent && parent === id) return true;
      if (!parent) return true;
      if (!parentExists(parent)) return true;
      return false;
    });
    // Paginate parents using displayPage and itemsPerPageLocal
    const p = Number(displayPage.value || 1);
    const perPage = Number(itemsPerPageLocal.value || 10);
    const start = (p - 1) * perPage;
    return parentsAll.slice(start, start + perPage);
  }
  // When searching: build parent rows from matchedParentIds using allItems (so parent appears even if not in paginatedCategories)
  const ids = matchedParentIds.value;
  if (!ids || ids.size === 0) return [];
  // preserve order as in allItems
  const list = allItems.value || [];
  const parents = list.filter(c => {
    if (!c) return false;
    const id = String(c.CategoriesID ?? '').trim();
    if (hideIfFour(id)) return false;
    return ids.has(id);
  });
  return parents;
});

// New: compute total number of visible parent rows (mains only)
const visibleParentsTotal = computed(() => {
  const q = searchTerm.value;
  // When searching, use the computed visibleParents length directly
  if (q) {
    const vp = Array.isArray(visibleParents.value) ? visibleParents.value : [];
    return vp.length;
  }
  // No search: count mains only from full/filtered list
  const source = Array.isArray(props.filteredCategories) && props.filteredCategories.length
    ? props.filteredCategories
    : (Array.isArray(props.categories) ? props.categories : []);
  return source.filter(cat => {
    if (!cat) return false;
    const id = String(cat.CategoriesID ?? '').trim();
    if (hideIfFour(id)) return false; // exclude 4-digit children
    const parent = String(cat.ParentCategoriesID ?? '').trim();
    if (parent && parent === id) return true; // explicit main
    if (!parent) return true; // no parent -> main
    return !parentExists(parent); // parent not present -> treat as main
  }).length;
});

// --- WATCH search: expand matched parents and collapse others ---
watch(searchTerm, (q) => {
  if (!q) return; // do not auto-collapse on clear
  const ids = matchedParentIds.value;
  // open matched parents, close others
  // keep expanded only for matched parents
  const newExpanded = {};
  ids.forEach(id => { if (id) newExpanded[id] = true; });
  expanded.value = newExpanded;
}, { immediate: true });

// Add watcher: when parent search prop changes, expand matched parents immediately
watch(() => props.searchQueryCategories, (val) => {
  const q = (val || '').toString().trim().toLowerCase();
  if (!q) return;
  // compute matched parent ids and expand them
  const matches = allItems.value.filter(item => itemMatchesQuery(item, q));
  const ids = new Set();
  matches.forEach(item => {
    findParentIdsForItem(item).forEach(id => { if (id) ids.add(String(id)); });
  });
  // set expanded to include matched parents (preserve any existing manual expands)
  const newExpanded = Object.assign({}, expanded.value || {});
  ids.forEach(id => { if (id) newExpanded[id] = true; });
  expanded.value = newExpanded;
}, { immediate: true });

// Derive itemsPerPageLocal from the shown start/end if available, otherwise fallback to paginated length
const itemsPerPageLocal = computed(() => {
  const start = Number(props.categoriesStartIndex || 0);
  const end = Number(props.categoriesEndIndex || 0);
  if (end >= start && start > 0) return end - start + 1;
  return Array.isArray(props.paginatedCategories) ? props.paginatedCategories.length || 8 : 8;
});

// Local total pages - use props.categoriesTotalPages if available (from parent), otherwise compute
const localTotalPages = computed(() => {
  // If parent provides total pages, use that
  if (Number.isInteger(props.categoriesTotalPages) && props.categoriesTotalPages > 0) {
    return props.categoriesTotalPages;
  }
  // Otherwise compute from visible items
  return Math.max(1, Math.ceil((visibleParentsTotal.value || props.categoriesTotalEntries || 1) / itemsPerPageLocal.value));
});

// Clamp display page to localTotalPages using parent's current page as source
const displayPage = computed(() => {
  const p = Number(props.categoriesCurrentPage || 1);
  return Math.min(Math.max(1, p), localTotalPages.value);
});

// Local pages to show (max 4) similar to previous logic but using localTotalPages/displayPage
const localPagesToShow = computed(() => {
  const total = localTotalPages.value || 1;
  const current = displayPage.value || 1;
  const maxButtons = 4;
  if (total <= maxButtons) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 2) return [1, 2, 3, 4];
  if (current >= total - 1) return [total - 3, total - 2, total - 1, total];
  return [current - 1, current, current + 1, current + 2];
});

// helper: determine if value looks like an absolute URL or path
function isUrl(val) {
  if (!val) return false;
  return /^https?:\/\//i.test(val) || val.startsWith('/');
}

// build href for file value (use raw if absolute, otherwise prefix /uploads/)
function pdfUrl(val) {
  if (!val) return '#';
  const s = String(val).trim();
  if (isUrl(s)) return s;
  // adjust path as needed by your backend storage location
  return `/uploads/${s}`;
}

// choose icon class by extension
function pdfIconClass(val) {
  if (!val) return 'bi bi-file-earmark-text text-secondary';
  const s = String(val).trim().toLowerCase();
  if (s.endsWith('.pdf')) return 'bi bi-file-earmark-pdf-fill text-danger';
  if (s.endsWith('.doc') || s.endsWith('.docx')) return 'bi bi-file-earmark-word-fill text-primary';
  if (s.endsWith('.xls') || s.endsWith('.xlsx')) return 'bi bi-file-earmark-excel-fill text-success';
  // default file icon
  return 'bi bi-file-earmark-text text-secondary';
}

// Add missing expandParentsForMatches function
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

/* Add autoExpanded (from matchedParentIds) and merged expandedMap */
const autoExpanded = computed(() => {
  const out = {};
  const ids = matchedParentIds.value || new Set();
  ids.forEach(id => { if (id) out[String(id)] = true; });
  return out;
});

// merged map: manual expanded OR auto-expanded due to search matches
const expandedMap = computed(() => {
  return Object.assign({}, expanded.value || {}, autoExpanded.value || {});
});

// Add modal state and refs
const fileModalEl = ref(null);
const modalFileUrl = ref('');
const modalFileName = ref('');
let bsFileModal = null;

// helper: check pdf by url (simple)
function isPdf(url) {
  if (!url) return false;
  return String(url).toLowerCase().trim().endsWith('.pdf');
}

function openFile(fileValue, name) {
  const url = pdfUrl(fileValue);
  modalFileUrl.value = url;
  modalFileName.value = name || String(fileValue || '').split('/').pop();
  nextTick(() => {
    if (bsFileModal) {
      try { bsFileModal.dispose(); } catch(e){ /* ignore */ }
      bsFileModal = null;
    }
    if (fileModalEl.value) {
      // no backdrop and no keyboard-close (optional) — only close via the close button
      bsFileModal = new Modal(fileModalEl.value, { backdrop: false, keyboard: true });
      bsFileModal.show();
    }
  });
}

function closeModal() {
  if (bsFileModal) {
    try { bsFileModal.hide(); } catch(e) { /* ignore */ }
  }
}

// cleanup
onUnmounted(() => {
  if (bsFileModal) {
    try { bsFileModal.dispose(); } catch(e) { /* ignore */ }
    bsFileModal = null;
  }
});
</script>

<style scoped>
/* Right-align search, left-align total */
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
  gap: 0.15rem; /* reduce gap for tighter spacing */
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

/* Active page: gradient background, white text */
.pagination .page-item.active .page-link {
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%) !important;
  color: #FFFFFF !important;
  border: none !important;
  font-weight: 600;
  box-shadow: none;
}

/* Disabled page: keep default look */
.pagination .page-item.disabled .page-link {
  color: #adb5bd;
  pointer-events: none;
}

/* Focus/hover: no background/border */
.pagination .page-link:focus,
.pagination .page-link:hover {
  background: transparent !important;
  color: #495057;
  box-shadow: none;
}

.pagination .page-num {
  border-radius: 0.5rem !important;
}

/* Remove default margin from ul.pagination if any */
.pagination {
  margin-bottom: 0 !important;
}

.btn-link {
  color: #495057;
  text-decoration: none;
}
.btn-link:hover {
  color: #007bff;
  text-decoration: none;
}
.ps-4 {
  padding-left: 2rem !important;
}

/* small spacing & alignment for file link */
.table a.text-decoration-none {
  color: inherit;
}
.table a.text-decoration-none:hover {
  text-decoration: underline;
}

/* Modal: transparent content, no border/shadow, header buttons row */
.file-modal .modal-content {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  overflow: hidden;
  position: relative;
}
.file-modal .modal-body {
  padding: 0;
}

/* header buttons container */
.file-modal-header-btns {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 1055;
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}
.file-modal-open {
  order: 1;
}
.file-modal-close {
  order: 2;
}

/* close and open-in-new-tab buttons */
.file-modal-close,
.file-modal-open {
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%) !important;
  border-radius: 0.375rem;
  width: 2.2rem;
  height: 2.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  padding: 0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  color: #212529;
  transition: background 0.15s;
}
.file-modal-close:hover,
.file-modal-open:hover {
  background: #f1f3f5 !important;
  color: #007bff;
}
.file-modal-close svg,
.file-modal-open svg {
  display: block;
}

/* ensure iframe fills area */
.file-modal iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
