<template>
  <div class="row">
    <!-- Organizations Report (left column) -->
    <div class="mb-4">
      <div class="report-section mb-4">
        <div v-if="organizationLoading" class="text-center py-3">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Loading organization data...</p>
        </div>
        <div v-else-if="organizationError" class="alert alert-danger" role="alert">
          Error: {{ organizationError }}
        </div>
        <div v-else>
          <!-- Overview & Chart: set fixed min-height for equal height -->
          <div class="card p-4 bg-light shadow-sm mb-4 rounded-4 overview-equal-height">
            <h2 class="fs-5 fw-bold mb-3">Organizations Report</h2>
            <div class="org-overview-grid">
              <div
                class="org-overview-item"
                v-for="org in organizationsWithOfficerCount"
                :key="org.orgName"
              >
                <div class="card text-center p-3 rounded-4 org-officer-card">
                  <p class="h6 text-muted mb-1 org-name-text">{{ org.OrgName }}</p>
                  <p class="h3 fw-bold mb-0">
                    {{ org.officerCount }}
                  </p>
                  <small class="text-muted">
                    officer{{ org.officerCount === 1 ? '' : 's' }}
                  </small>
                </div>
              </div>
            </div>
            <div class="chart-area mt-4 p-3 border rounded bg-white">
              <BarChart :chart-data="orgsOfficerBarChartData" :chart-options="chartOptions" />
            </div>
          </div>
          <div class="card p-4 bg-light shadow-sm rounded-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h3 class="fs-5 m-0 fw-bold">Organizations List</h3>
              <div class="input-group search-input-group" style="max-width: 320px;">
                <input type="text" class="form-control rounded-pill px-3 py-2 border-0" placeholder="Search Organizations..." aria-label="Search" v-model="searchQueryOrganizations">
                <span class="input-group-text bg-transparent border-0 pe-3 position-absolute end-0 top-50 translate-middle-y">
                  <i class="bi bi-search"></i>
                </span>
              </div>
            </div>
            <div class="table-responsive">
              <table class="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(org, idx) in paginatedOrganizations" :key="org.orgName">
                    <td>{{ organizationStartIndex + idx }}</td>
                    <td>{{ org.OrgName }}</td>
                    <td>{{ org.OrgDescription || '-' }}</td>
                  </tr>
                  <tr v-if="filteredOrganizations.length === 0">
                    <td colspan="3" class="text-center text-muted py-3">No organization data found</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- Pagination Footer for Organizations -->
            <div class="d-flex justify-content-between align-items-center p-3 border-top mt-auto">
              <div class="small text-muted">
                Showing {{ organizationStartIndex }} to {{ organizationEndIndex }} of {{ organizationTotalEntries }} entries
              </div>
              <nav aria-label="Page navigation for organizations">
                <ul class="pagination pagination-sm mb-0 align-items-center">
                  <li class="page-item" :class="{ disabled: organizationCurrentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="organizationFirstPage" aria-label="First">&laquo;</a>
                  </li>
                  <li class="page-item" :class="{ disabled: organizationCurrentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="organizationPrevPage" aria-label="Previous">&lsaquo;</a>
                  </li>

                  <li v-for="page in organizationPagesToShow" :key="page" class="page-item" :class="{ active: organizationCurrentPage === page }">
                    <a class="page-link page-num rounded-3" href="#" @click.prevent="organizationGoToPage(page)">{{ page }}</a>
                  </li>

                  <li class="page-item" :class="{ disabled: organizationCurrentPage === organizationTotalPages || organizationTotalPages === 0 }">
                    <a class="page-link" href="#" @click.prevent="organizationNextPage" aria-label="Next">&rsaquo;</a>
                  </li>
                  <li class="page-item" :class="{ disabled: organizationCurrentPage === organizationTotalPages || organizationTotalPages === 0 }">
                    <a class="page-link" href="#" @click.prevent="organizationLastPage" aria-label="Last">&raquo;</a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Officers Report (right column) -->
    <div class="mb-4">
      <div class="report-section mb-4">
        <div v-if="officerLoading" class="text-center py-3">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Loading officer data...</p>
        </div>
        <div v-else-if="officerError" class="alert alert-danger" role="alert">
          Error: {{ officerError }}
        </div>
        <div v-else>
          <!-- Overview & Chart: set fixed min-height for equal height -->
          <div class="card p-4 bg-light shadow-sm mb-4 rounded-4 overview-equal-height">
            <h2 class="fs-5 fw-bold mb-3">Officers Report</h2>
            <div class="row row-cols-1 row-cols-md-2 g-3">
              <div class="col">
                <div class="card text-center p-3 pb-4 mb-3 rounded-4">
                  <p class="h6 text-muted mb-1">Total Officers</p>
                  <p class="h3 fw-bold">{{ displayTotalOfficers }}</p>
                </div>
              </div>
              <div class="col">
                <div class="card text-center p-3 pb-4 mb-3 rounded-4">
                  <p class="h6 text-muted mb-1">Active Status</p>
                  <p class="h3 fw-bold">{{ displayActiveOfficers }}</p>
                </div>
              </div>
            </div>
            <div class="chart-area mt-4 p-3 border rounded bg-white">
              <PieChart :chart-data="officerChartData" :chart-options="chartOptions" />
            </div>
          </div>
          <div class="card p-4 bg-light shadow-sm rounded-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h3 class="fs-5 m-0 fw-bold">Officers List</h3>
              <div class="input-group search-input-group" style="max-width: 320px;">
                <input type="text" class="form-control rounded-pill px-3 py-2 border-0" placeholder="Search Officers..." aria-label="Search" v-model="searchQueryOfficers">
                <span class="input-group-text bg-transparent border-0 pe-3 position-absolute end-0 top-50 translate-middle-y">
                  <i class="bi bi-search"></i>
                </span>
              </div>
            </div>
            <div class="table-responsive mt-4">
              <table class="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>OrgName</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(officer, idx) in paginatedOfficers" :key="officer.OfficerID">
                    <td data-label="ID">{{ officerStartIndex + idx }}</td>
                    <td data-label="Name">{{ officer.OfficerName }}</td>
                    <td data-label="Phone">{{ officer.OfficerPhone }}</td>
                    <td data-label="Email">{{ officer.OfficerEmail }}</td>
                    <td data-label="Status">
                      <span :class="officer.OfficerStatus === 1 ? 'text-success' : 'text-danger'">{{ officer.OfficerStatus === 1 ? 'Active' : 'Inactive' }}</span>
                    </td>
                    <td data-label="OrgName">{{ officer.OrgName || '-' }}</td>
                  </tr>
                  <tr v-if="filteredOfficers.length === 0">
                    <td colspan="6" class="text-center text-muted py-3">No officer data found</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- Pagination Footer for Officers -->
            <div class="d-flex justify-content-between align-items-center p-3 border-top mt-auto">
              <div class="small text-muted">
                Showing {{ officerStartIndex }} to {{ officerEndIndex }} of {{ officerTotalEntries }} entries
              </div>
              <nav aria-label="Page navigation for officers">
                <ul class="pagination pagination-sm mb-0 align-items-center">
                  <li class="page-item" :class="{ disabled: officerCurrentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="officerFirstPage" aria-label="First">&laquo;</a>
                  </li>
                  <li class="page-item" :class="{ disabled: officerCurrentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="officerPrevPage" aria-label="Previous">&lsaquo;</a>
                  </li>

                  <li v-for="page in officerPagesToShow" :key="page" class="page-item" :class="{ active: officerCurrentPage === page }">
                    <a class="page-link page-num rounded-3" href="#" @click.prevent="officerGoToPage(page)">{{ page }}</a>
                  </li>

                  <li class="page-item" :class="{ disabled: officerCurrentPage === officerTotalPages || officerTotalPages === 0 }">
                    <a class="page-link" href="#" @click.prevent="officerNextPage" aria-label="Next">&rsaquo;</a>
                  </li>
                  <li class="page-item" :class="{ disabled: officerCurrentPage === officerTotalPages || officerTotalPages === 0 }">
                    <a class="page-link" href="#" @click.prevent="officerLastPage" aria-label="Last">&raquo;</a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, getCurrentInstance, watch, onUnmounted } from 'vue'; 
import { PieChart, BarChart } from 'vue-chart-3';
import { Chart as ChartJS, registerables } from 'chart.js';
import { bindSidebarResize } from '@/stores/sidebarState';
import '@/assets/sidebar.css';

ChartJS.register(...registerables); 

const { appContext } = getCurrentInstance();
const { $axios } = appContext.config.globalProperties; 

const props = defineProps({
  userInfoObject: Object
});

const searchQueryOrganizations = ref(''); 
const searchQueryOfficers = ref(''); 

// --- Organization Report Data ---
const organizations = ref([]);
const organizationLoading = ref(true);
const organizationError = ref(null);

const officers = ref([]); // already declared for officer report

// --- Organizations with officer count ---
const organizationsWithOfficerCount = computed(() => {
  if (!Array.isArray(organizations.value) || !Array.isArray(officers.value)) return [];
  return organizations.value.map(org => {
    const count = officers.value.filter(o => o.OrgName === org.OrgName).length;
    return {
      ...org,
      officerCount: count,
    };
  });
});

// --- Bar chart for orgs with officer count ---
const orgsOfficerBarChartData = computed(() => {
  return {
    labels: organizationsWithOfficerCount.value.map(org => org.OrgName),
    datasets: [
      {
        label: 'Number of Officers',
        data: organizationsWithOfficerCount.value.map(org => org.officerCount),
        backgroundColor: '#42A5F5',
      },
    ],
  };
});

// --- Organization Report Data ---
const fetchOrganizations = async () => {
  organizationLoading.value = true;
  organizationError.value = null;
  try {
    const response = await $axios.get('/organizations');
    organizations.value = response.data?.data || response.data || [];
  } catch (err) {
    console.error('Failed to fetch organization data:', err);
    organizationError.value = err.response?.data?.message || 'Failed to load organization data.';
  } finally {
    organizationLoading.value = false;
  }
};

const filteredOrganizations = computed(() => {
  const data = organizations.value;
  if (!searchQueryOrganizations.value) { 
    return data;
  }
  const query = searchQueryOrganizations.value.toLowerCase(); 
  return data.filter(org =>
    (org.OrgName && org.OrgName.toLowerCase().includes(query)) ||
    (org.OrgDescription && org.OrgDescription.toLowerCase().includes(query)) ||
    (org.OrgName && org.OrgName.toString().includes(query))
  );
});

// Computed properties for Organization Report Overview
const displayTotalOrganizations = computed(() => organizations.value.length);

// Chart Data for Organization Report (Bar Chart: Total Organizations)
const organizationChartData = computed(() => ({
  labels: ['Total Organizations'],
  datasets: [
    {
      label: 'Number of Organizations',
      data: [displayTotalOrganizations.value],
      backgroundColor: ['#FFC107'], // Yellow
    },
  ],
}));

// --- Pagination State for Organizations ---
const organizationCurrentPage = ref(1);
const organizationItemsPerPage = ref(8); 

// --- Organizations Pagination Computed Properties ---
const organizationTotalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredOrganizations.value.length / organizationItemsPerPage.value));
});
const organizationTotalEntries = computed(() => filteredOrganizations.value.length);
const organizationStartIndex = computed(() => {
  if (organizationTotalEntries.value === 0) return 0;
  return (organizationCurrentPage.value - 1) * organizationItemsPerPage.value + 1;
});
const organizationEndIndex = computed(() => {
  if (organizationTotalEntries.value === 0) return 0;
  return Math.min(organizationCurrentPage.value * organizationItemsPerPage.value, organizationTotalEntries.value);
});
const paginatedOrganizations = computed(() => {
  const start = (organizationCurrentPage.value - 1) * organizationItemsPerPage.value;
  const end = start + organizationItemsPerPage.value;
  return filteredOrganizations.value.slice(start, end);
});
const organizationPagesToShow = computed(() => {
    const total = organizationTotalPages.value;
    const current = organizationCurrentPage.value;
    const maxButtons = 4;
    if (total <= maxButtons) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 2) {
        return [1, 2, 3, 4];
    }
    if (current >= total - 1) {
        return [total - 3, total - 2, total - 1, total];
    }
    return [current - 1, current, current + 1, current + 2];
});

// --- Organizations Pagination Methods ---
function organizationGoToPage(page) {
  if (page >= 1 && page <= organizationTotalPages.value) {
    organizationCurrentPage.value = page;
  }
}
function organizationPrevPage() {
  organizationGoToPage(Math.max(1, organizationCurrentPage.value - 1));
}
function organizationNextPage() {
  organizationGoToPage(Math.min(organizationTotalPages.value, organizationCurrentPage.value + 1));
}
function organizationFirstPage() {
  organizationGoToPage(1);
}
function organizationLastPage() {
  organizationGoToPage(organizationTotalPages.value);
}


// --- Officer Report Data --- (Combined to fetchOfficers for officersByOrgData)
const officerLoading = ref(true);
const officerError = ref(null);

const fetchOfficers = async () => {
  officerLoading.value = true;
  officerError.value = null;
  try {
    const response = await $axios.get('/officers');
    officers.value = response.data?.data || response.data || [];
    // Debug: log officers length and data
    console.log('officers.value.length:', officers.value?.length);
    console.log('officers.value:', officers.value);
  } catch (err) {
    console.error('Failed to fetch officer data for AdminDashboard:', err);
    officerError.value = err.response?.data?.message || 'Failed to load officer data.';
  } finally {
    officerLoading.value = false;
  }
};

// --- Officers Filtered List ---
const filteredOfficers = computed(() => {
  const data = officers.value;
  if (!searchQueryOfficers.value) { 
    return data;
  }
  const query = searchQueryOfficers.value.toLowerCase(); 
  return data.filter(officer =>
    (officer.OfficerName && officer.OfficerName.toLowerCase().includes(query)) ||
    (officer.OfficerEmail && officer.OfficerEmail.toLowerCase().includes(query)) ||
    (officer.OfficerPhone && officer.OfficerPhone.toLowerCase().includes(query)) ||
    (officer.OfficerID && officer.OfficerID.toString().includes(query))
  );
});

// --- Officers Overview/Chart Computed (MISSING, add these) ---
const displayTotalOfficers = computed(() => officers.value.length);
const displayActiveOfficers = computed(() => officers.value.filter(officer => officer.OfficerStatus === 1).length);
const displayInactiveOfficers = computed(() => officers.value.filter(officer => officer.OfficerStatus === 0).length);

const officerChartData = computed(() => ({
  labels: ['Active', 'Inactive/Other'],
  datasets: [
    {
      data: [displayActiveOfficers.value, displayInactiveOfficers.value],
      backgroundColor: ['#28A745', '#DC3545'],
    },
  ],
}));

// --- Officers Pagination State (make sure these are defined before use) ---
const officerCurrentPage = ref(1);
const officerItemsPerPage = ref(8);

// --- Officers Pagination Computed Properties ---
const officerTotalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredOfficers.value.length / officerItemsPerPage.value));
});
const officerTotalEntries = computed(() => filteredOfficers.value.length);
const officerStartIndex = computed(() => {
  if (officerTotalEntries.value === 0) return 0;
  return (officerCurrentPage.value - 1) * officerItemsPerPage.value + 1;
});
const officerEndIndex = computed(() => {
  if (officerTotalEntries.value === 0) return 0;
  return Math.min(officerCurrentPage.value * officerItemsPerPage.value, officerTotalEntries.value);
});
const paginatedOfficers = computed(() => {
  const start = (officerCurrentPage.value - 1) * officerItemsPerPage.value;
  const end = start + officerItemsPerPage.value;
  return filteredOfficers.value.slice(start, end);
});
const officerPagesToShow = computed(() => {
    const total = officerTotalPages.value;
    const current = officerCurrentPage.value;
    const maxButtons = 4;
    if (total <= maxButtons) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 2) {
        return [1, 2, 3, 4];
    }
    if (current >= total - 1) {
        return [total - 3, total - 2, total - 1, total];
    }
    return [current - 1, current, current + 1, current + 2];
});

// --- Officers Pagination Methods ---
function officerGoToPage(page) {
  if (page >= 1 && page <= officerTotalPages.value) {
    officerCurrentPage.value = page;
  }
}
function officerPrevPage() {
  officerGoToPage(Math.max(1, officerCurrentPage.value - 1));
}
function officerNextPage() {
  officerGoToPage(Math.min(officerTotalPages.value, officerCurrentPage.value + 1));
}
function officerFirstPage() {
  officerGoToPage(1);
}
function officerLastPage() {
  officerGoToPage(officerTotalPages.value);
}


// --- Officers by Organization Report Data ---
const officersByOrgData = computed(() => {
  // Defensive: always return [] if officers.value is not an array
  if (!Array.isArray(organizations.value) || !Array.isArray(officers.value) || !organizations.value.length || !officers.value.length) {
    return [];
  }
  return organizations.value.map(org => {
    const officerCount = officers.value.filter(officer => officer.orgName === org.orgName).length;
    return {
      orgName: org.orgName,
      orgName: org.OrgName,
      officerCount: officerCount,
    };
  }).filter(item => item.officerCount > 0); 
});

const filteredOfficersByOrg = computed(() => {
  const data = officersByOrgData.value;
  if (!searchQueryOfficersByOrg.value) { 
    return data;
  }
  const query = searchQueryOfficersByOrg.value.toLowerCase(); 
  return data.filter(item =>
    item.orgName.toLowerCase().includes(query)
  );
});

const officersByOrgChartData = computed(() => {
  const colors = ['#42A5F5', '#FFC107', '#66BB6A', '#EF5350']; 
  return {
    labels: officersByOrgData.value.map(item => item.orgName),
    datasets: [
      {
        label: 'Number of Officers',
        data: officersByOrgData.value.map(item => item.officerCount),
        backgroundColor: officersByOrgData.value.map((_, index) => colors[index % colors.length]),
      },
    ],
  };
});

// --- Pagination State for Officers by Organization ---
const officerOrgCurrentPage = ref(1);
const officerOrgItemsPerPage = ref(8); 

// --- Officers by Organization Pagination Computed Properties ---
const officerOrgTotalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredOfficersByOrg.value.length / officerOrgItemsPerPage.value));
});
const officerOrgTotalEntries = computed(() => filteredOfficersByOrg.value.length);
const officerOrgStartIndex = computed(() => {
  if (officerOrgTotalEntries.value === 0) return 0;
  return (officerOrgCurrentPage.value - 1) * officerOrgItemsPerPage.value + 1;
});
const officerOrgEndIndex = computed(() => {
  if (officerOrgTotalEntries.value === 0) return 0;
  return Math.min(officerOrgCurrentPage.value * officerOrgItemsPerPage.value, officerOrgTotalEntries.value);
});
const paginatedOfficersByOrg = computed(() => {
  const start = (officerOrgCurrentPage.value - 1) * officerOrgItemsPerPage.value;
  const end = start + officerOrgItemsPerPage.value;
  return filteredOfficersByOrg.value.slice(start, end);
});
const officerOrgPagesToShow = computed(() => {
    const total = officerOrgTotalPages.value;
    const current = officerOrgCurrentPage.value;
    const maxButtons = 4;
    if (total <= maxButtons) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 2) {
        return [1, 2, 3, 4];
    }
    if (current >= total - 1) {
        return [total - 3, total - 2, total - 1, total];
    }
    return [current - 1, current, current + 1, current + 2];
});

// --- Officers by Organization Pagination Methods ---
function officerOrgGoToPage(page) {
  if (page >= 1 && page <= officerOrgTotalPages.value) {
    officerOrgCurrentPage.value = page;
  }
}
function officerOrgPrevPage() {
  officerOrgGoToPage(Math.max(1, officerOrgCurrentPage.value - 1));
}
function officerOrgNextPage() {
  officerOrgGoToPage(Math.min(officerOrgTotalPages.value, officerOrgCurrentPage.value + 1));
}
function officerOrgFirstPage() {
  officerOrgGoToPage(1);
}
function officerOrgLastPage() {
  officerOrgGoToPage(officerOrgTotalPages.value);
}


// --- General Chart Options ---
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  aspectRatio: 2.5, 
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Data Report',
    },
  },
});

watch(searchQueryOrganizations, () => {
  organizationCurrentPage.value = 1;
});

watch(searchQueryOfficers, () => {
  officerCurrentPage.value = 1;
});

// <-- ADDED: reset officer-related pagination when officers data changes -->
watch(officers, (newVal) => {
  // reset officers list pagination
  officerCurrentPage.value = 1;
  // reset officers-by-org pagination because counts may have changed
  officerOrgCurrentPage.value = 1;
});

let unbindSidebarResize = null;
onMounted(() => {
  if (typeof bindSidebarResize === 'function') {
    unbindSidebarResize = bindSidebarResize();
  }
  fetchOrganizations(); 
  fetchOfficers(); // Still need to fetch officers for officersByOrgData
});

onUnmounted(() => {
  if (typeof unbindSidebarResize === 'function') unbindSidebarResize();
});
</script>

<style scoped>
@import '@/assets/pagination-styles.css';
/* Ensure all org-officer-card have the same min-height for visual alignment */
.org-overview-grid {
  display: flex;
  flex-wrap: wrap;          /* allow wrapping to next row */
  gap: 1rem;
  align-items: flex-start;
  padding-bottom: 0.5rem;
  -webkit-overflow-scrolling: touch;
}

.org-overview-item {
  flex: 0 0 calc(50% - 0.5rem); /* two columns */
  max-width: calc(50% - 0.5rem);
  box-sizing: border-box;
}

/* ensure card fills the item width */
.org-officer-card {
  width: 100%;
  box-sizing: border-box;
}

/* Responsive: single column on small screens */
@media (max-width: 767.98px) {
  .org-overview-item {
    flex: 0 0 100%;
    max-width: 100%;
  }
}

/* Optional: hide native scrollbar for a cleaner look (can be removed) */
.org-overview-grid::-webkit-scrollbar { height: 8px; }
.org-overview-grid::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 4px; }

/* Prevent org name text from wrapping; show ellipsis when too long */
.org-name-text {
  display: block;
  white-space: nowrap;       /* prevent wrapping */
  overflow: hidden;         /* hide overflow */
  text-overflow: ellipsis;  /* show "..." when truncated */
  max-width: 100%;
}
</style>
