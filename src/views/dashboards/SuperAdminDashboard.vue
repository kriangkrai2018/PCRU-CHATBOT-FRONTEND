<template>
  <div class="row">
    <div class="col-12">
      <div class="report-section mb-4">
        <div v-if="adminLoading" class="text-center py-3">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Loading admin data...</p>
        </div>
        <div v-else-if="adminError" class="alert alert-danger" role="alert">
          Error: {{ adminError }}
        </div>
        <div v-else>
          <div class="card p-4 bg-light shadow-sm mb-4 rounded-4">
            <h3 class="fs-5 mb-3 fw-bold">Overview & Chart</h3>
            <div class="row row-cols-1 row-cols-md-3 g-3">
              <div class="col">
                <div class="card text-center p-3 rounded-4 h-100 d-flex flex-column justify-content-center">
                  <p class="small fw-bold text-muted mb-1">Total Admins</p>
                  <p class="h3 fw-bold mb-0">{{ displayTotalAdmins }}</p>
                </div>
              </div>
              <div class="col">
                <div class="card text-center p-3 rounded-4 h-100 d-flex flex-column justify-content-center">
                  <p class="small fw-bold text-muted mb-1">Super Admins</p>
                  <p class="h3 fw-bold mb-0">{{ displayTopLevelAdmins }}</p>
                </div>
              </div>
              <div class="col">
                <div class="card text-center p-3 rounded-4 h-100 d-flex flex-column justify-content-center">
                  <p class="small fw-bold text-muted mb-1">Sub-Admins</p>
                  <p class="h3 fw-bold mb-0">{{ displaySubAdmins }}</p>
                </div>
              </div>
            </div>
            <div class="chart-area mt-4 p-3 border rounded bg-white">
              <PieChart :chart-data="adminChartData" :chart-options="chartOptions" />
            </div>
          </div>
          <div class="card p-4 bg-light shadow-sm rounded-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h3 class="fs-5 m-0 fw-bold">Admin Users List</h3>
              <div class="input-group search-input-group" style="max-width: 320px;">
                <input type="text" class="form-control rounded-pill px-3 py-2 border-0" placeholder="Search Admins..." aria-label="Search" v-model="searchQuery">
                <span class="input-group-text bg-transparent border-0 pe-3 position-absolute end-0 top-50 translate-middle-y">
                  <i class="bi bi-search"></i>
                </span>
              </div>
            </div>

            <div class="table-responsive mt-4">
              <table class="table table-striped table-hover">
                <thead>
                  <tr>
                    <th class="fw-bold">Num</th>
                    <th class="fw-bold">Name</th>
                    <th class="fw-bold">Email</th>
                    <th class="fw-bold">Role</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(admin, idx) in paginatedAdmins" :key="admin.AdminUserID">
                    <td>{{ adminStartIndex + idx }}</td>
                    <td>{{ admin.AdminName }}</td>
                    <td>{{ admin.AdminEmail }}</td>
                    <td>
                      <div class="d-flex align-items-center gap-2 role-cell">
                        <i
                          v-if="admin.ParentAdminID === admin.AdminUserID"
                          class="bi bi-shield-lock-fill role-icon role-super"
                          aria-hidden="true"
                        ></i>
                        <i
                          v-else
                          class="bi bi-person-fill role-icon role-admin"
                          aria-hidden="true"
                        ></i>
                        <span class="role-text">
                          {{ admin.ParentAdminID === admin.AdminUserID ? 'Super Admin' : 'Admin' }}
                        </span>
                        <span v-if="admin.AdminUserID === userInfoObject.AdminUserID" class="text-danger fw-bold ms-2">(You)</span>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredAdmins.length === 0">
                    <td colspan="4" class="text-center text-muted py-3">No admin data found</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- Pagination Footer -->
            <div class="d-flex justify-content-between align-items-center p-2 border-top mt-auto">
              <div class="small text-muted">
                Showing {{ adminStartIndex }} to {{ adminEndIndex }} of {{ adminTotalEntries }} entries
              </div>
              <nav aria-label="Page navigation">
                <ul class="pagination pagination-sm mb-0 align-items-center">
                  <li class="page-item" :class="{ disabled: adminCurrentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="adminFirstPage" aria-label="First">&laquo;</a>
                  </li>
                  <li class="page-item" :class="{ disabled: adminCurrentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="adminPrevPage" aria-label="Previous">&lsaquo;</a>
                  </li>

                  <li v-for="page in adminPagesToShow" :key="page" class="page-item" :class="{ active: adminCurrentPage === page }">
                    <a class="page-link page-num rounded-3" href="#" @click.prevent="adminGoToPage(page)">{{ page }}</a>
                  </li>

                  <li class="page-item" :class="{ disabled: adminCurrentPage === adminTotalPages || adminTotalPages === 0 }">
                    <a class="page-link" href="#" @click.prevent="adminNextPage" aria-label="Next">&rsaquo;</a>
                  </li>
                  <li class="page-item" :class="{ disabled: adminCurrentPage === adminTotalPages || adminTotalPages === 0 }">
                    <a class="page-link" href="#" @click.prevent="adminLastPage" aria-label="Last">&raquo;</a>
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
import { ref, onMounted, computed, getCurrentInstance, watch } from 'vue'; 
import { PieChart } from 'vue-chart-3';
import { Chart as ChartJS, registerables } from 'chart.js';

ChartJS.register(...registerables); 

const { appContext } = getCurrentInstance();
const { $axios } = appContext.config.globalProperties; 

const props = defineProps({
  userInfoObject: Object
});

const searchQuery = ref('');

// --- Pagination State for Admins ---
const adminCurrentPage = ref(1);
const adminItemsPerPage = ref(8);

// --- Admin Pagination Computed Properties ---
const adminTotalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredAdmins.value.length / adminItemsPerPage.value));
});
const adminTotalEntries = computed(() => filteredAdmins.value.length);
const adminStartIndex = computed(() => {
  if (adminTotalEntries.value === 0) return 0;
  return (adminCurrentPage.value - 1) * adminItemsPerPage.value + 1;
});
const adminEndIndex = computed(() => {
  if (adminTotalEntries.value === 0) return 0;
  return Math.min(adminCurrentPage.value * adminItemsPerPage.value, adminTotalEntries.value);
});
const paginatedAdmins = computed(() => {
  const start = (adminCurrentPage.value - 1) * adminItemsPerPage.value;
  const end = start + adminItemsPerPage.value;
  return filteredAdmins.value.slice(start, end);
});
const adminPagesToShow = computed(() => {
    const total = adminTotalPages.value;
    const current = adminCurrentPage.value;
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

// --- Admin Pagination Methods ---
function adminGoToPage(page) {
  if (page >= 1 && page <= adminTotalPages.value) {
    adminCurrentPage.value = page;
  }
}
function adminPrevPage() {
  adminGoToPage(Math.max(1, adminCurrentPage.value - 1));
}
function adminNextPage() {
  adminGoToPage(Math.min(adminTotalPages.value, adminCurrentPage.value + 1));
}
function adminFirstPage() {
  adminGoToPage(1);
}
function adminLastPage() {
  adminGoToPage(adminTotalPages.value);
}

// --- Admin Report Data ---
const admins = ref([]);
const adminLoading = ref(true);
const adminError = ref(null);

const fetchAdmins = async () => {
  adminLoading.value = true;
  adminError.value = null;
  try {
    const response = await $axios.get('/adminusers');
    // API returns { success: true, data: [...] } — keep backward compatibility
    admins.value = response.data?.data || response.data || [];
  } catch (err) {
    console.error('Failed to fetch admin data:', err);
    adminError.value = err.response?.data?.message || 'Failed to load admin data.';
  } finally {
    adminLoading.value = false;
  }
};

const filteredAdmins = computed(() => {
  if (!searchQuery.value) {
    return admins.value;
  }
  const query = searchQuery.value.toLowerCase();
  return admins.value.filter(admin =>
    (admin.AdminName && admin.AdminName.toLowerCase().includes(query)) ||
    (admin.AdminEmail && admin.AdminEmail.toLowerCase().includes(query)) ||
    (admin.AdminUserID && admin.AdminUserID.toString().includes(query))
  );
});

// Computed properties for Admin Report Overview
const displayTotalAdmins = computed(() => admins.value.length);
const displayTopLevelAdmins = computed(() => admins.value.filter(admin => admin.ParentAdminID === admin.AdminUserID).length);
const displaySubAdmins = computed(() => admins.value.filter(admin => admin.ParentAdminID !== admin.AdminUserID).length);

// Chart Data for Admin Report (Pie Chart: Top-Level vs. Sub-Admins)
const adminChartData = computed(() => ({
  labels: ['Super Admins', 'Sub-Admins'],
  datasets: [
    {
      data: [displayTopLevelAdmins.value, displaySubAdmins.value],
      backgroundColor: ['#42A5F5', '#66BB6A'], // Blue for Top-Level, Green for Sub-Admins
    },
  ],
}));

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

watch(searchQuery, () => {
  adminCurrentPage.value = 1;
});

onMounted(() => {
  fetchAdmins();
});
</script>

<style scoped>
/* Pagination controls - ensure numbers are centered */
.pagination .page-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.6rem;
  line-height: 1;
  min-width: 2.25rem;
  height: 2.25rem;
  box-sizing: border-box;
}

/* Numbered page buttons: no border and no background by default */
.page-num {
  border: none !important;
  background-color: transparent !important;
  color: rgba(0,0,0,0.65) !important;
  padding: 0.35rem 0.6rem;
  min-width: 2.25rem;
  height: 2.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
  transition: all 0.2s ease;
  margin-start: 0.25rem; /* reduce left margin */
}

.page-num:hover {
  border: none !important;
  color: rgba(0,0,0,0.65) !important;
  background-color: transparent !important;
}

/* Active numbered page shows gray border */
.pagination .page-item.active .page-num {
  border: 1px solid #dee2e6 !important;
  background-color: transparent !important;
  color: rgba(0,0,0,0.65) !important;
  font-weight: 600;
}

/* Ensure chevrons remain borderless */
.pagination .page-link[aria-label="First"],
.pagination .page-link[aria-label="Previous"],
.pagination .page-link[aria-label="Next"],
.pagination .page-link[aria-label="Last"] {
  border: none !important;
  background: transparent !important;
  color: rgba(0,0,0,0.55) !important;
  margin-start: 0.25rem; /* reduce left margin */
}

.pagination .page-link[aria-label="First"]:hover,
.pagination .page-link[aria-label="Previous"]:hover,
.pagination .page-link[aria-label="Next"]:hover,
.pagination .page-link[aria-label="Last"]:hover {
  color: rgba(0,0,0,0.75) !important;
  background: transparent !important;
}

/* Disabled pagination items */
.pagination .page-item.disabled .page-link {
  color: rgba(0,0,0,0.3) !important;
  cursor: not-allowed;
  pointer-events: none;
  background-color: transparent !important;
  border-color: transparent !important;
}

/* Search input group spacing */
.search-input-group {
  margin-start: 0 !important; /* remove left margin */
}
</style>
