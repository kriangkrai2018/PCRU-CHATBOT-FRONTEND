<template>
  <div class="dashboard-container">
    <Sidebar :userType="userType" :userInfoObject="userInfoObject" />
    <main class="main-content">
      <div class="negative-keywords-container">
        <!-- Header Section -->
        <div class="header-section fade-in">
      <div class="header-icon-wrapper pop-in">
        <svg class="header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <h1 class="page-title slide-in-down">จัดการคำปฏิเสธ</h1>
      <p class="page-subtitle slide-in-up">Negative Keywords Management</p>

      <!-- 🆕 ปุ่ม Seed (Auto-Fill) เพิ่มตรงนี้ -->
      <div class="header-actions slide-in-up" :style="{animationDelay: '0.1s'}">
        <button class="btn-seed" @click="confirmSeed" :disabled="isSeeding">
          <i class="bi bi-magic me-2"></i>
          {{ isSeeding ? 'กำลังเติมข้อมูล...' : 'เติมคำมาตรฐานอัตโนมัติ' }}
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-row slide-in-up" :style="{animationDelay: '0.1s'}">
      <div class="stat-card">
        <div class="stat-value">{{ stats.total || 0 }}</div>
        <div class="stat-label">คำทั้งหมด</div>
      </div>
      <div class="stat-card">
        <div class="stat-value text-success">{{ stats.active || 0 }}</div>
        <div class="stat-label">ใช้งานอยู่</div>
      </div>
      <div class="stat-card">
        <div class="stat-value text-danger">{{ stats.negativeModifier || 0 }}</div>
        <div class="stat-label">ตัวคูณ -1.0</div>
      </div>
      <div class="stat-card">
        <div class="stat-value text-warning">{{ stats.zeroModifier || 0 }}</div>
        <div class="stat-label">ตัวคูณ 0.0</div>
      </div>
    </div>

    <!-- Add Form Card -->
    <div class="form-card slide-in-left" :style="{animationDelay: '0.15s'}">
      <h2 class="card-title">
        <i class="bi bi-plus-circle me-2"></i>
        เพิ่มคำปฏิเสธ
      </h2>
      <form @submit.prevent="addKeyword" class="add-form">
        <div class="form-row">
          <div class="form-group flex-grow-1">
            <label class="form-label">คำปฏิเสธ</label>
            <input 
              type="text" 
              v-model="newKeyword.word" 
              class="form-control"
              placeholder="เช่น ไม่, ยกเว้น, อย่า, ห้าม"
              required
            />
            <small class="form-hint">ใส่หลายคำได้ คั่นด้วยเครื่องหมาย , (comma)</small>
          </div>
          <div class="form-group" style="width: 180px;">
            <label class="form-label">ตัวคูณคะแนน</label>
            <select v-model="newKeyword.weightModifier" class="form-control">
              <option :value="-1.0">-1.0 (กลับเป็นลบ)</option>
              <option :value="0.0">0.0 (ทำให้เป็นศูนย์)</option>
              <option :value="-0.5">-0.5 (ลดครึ่งหนึ่ง)</option>
            </select>
          </div>
          <div class="form-group" style="width: 250px;">
            <label class="form-label">คำอธิบาย (ไม่บังคับ)</label>
            <input 
              type="text" 
              v-model="newKeyword.description" 
              class="form-control"
              placeholder="อธิบายการใช้งาน"
            />
          </div>
          <div class="form-group" style="width: auto; align-self: flex-end;">
            <button type="submit" class="btn-primary-apple" :disabled="!newKeyword.word.trim() || isAdding">
              <i class="bi bi-plus-lg me-1"></i>
              {{ isAdding ? 'กำลังเพิ่ม...' : 'เพิ่ม' }}
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Search & Filter -->
    <div class="filter-card slide-in-right" :style="{animationDelay: '0.2s'}">
      <div class="filter-row">
        <div class="search-box">
          <i class="bi bi-search"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="ค้นหาคำปฏิเสธ..."
            @input="debouncedSearch"
          />
        </div>
        <div class="filter-buttons">
          <button 
            class="filter-btn" 
            :class="{ active: filterActive === undefined }"
            @click="filterActive = undefined; fetchKeywords()"
          >
            ทั้งหมด
          </button>
          <button 
            class="filter-btn" 
            :class="{ active: filterActive === 1 }"
            @click="filterActive = 1; fetchKeywords()"
          >
            ใช้งาน
          </button>
          <button 
            class="filter-btn" 
            :class="{ active: filterActive === 0 }"
            @click="filterActive = 0; fetchKeywords()"
          >
            ปิดใช้งาน
          </button>
        </div>
      </div>
    </div>

    <!-- Keywords Table -->
    <div class="table-card slide-in-up" :style="{animationDelay: '0.25s'}">
      <div class="table-responsive">
        <table class="keywords-table">
          <thead>
            <tr>
              <th style="width: 60px;">#</th>
              <th>คำปฏิเสธ</th>
              <th style="width: 150px;">ตัวคูณ</th>
              <th>คำอธิบาย</th>
              <th style="width: 100px;">สถานะ</th>
              <th style="width: 150px;">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="6" class="text-center py-4">
                <div class="loading-spinner"></div>
                <p class="mt-2 text-muted">กำลังโหลด...</p>
              </td>
            </tr>
            <tr v-else-if="keywords.length === 0">
              <td colspan="6" class="text-center py-4">
                <i class="bi bi-inbox text-muted" style="font-size: 3rem;"></i>
                <p class="mt-2 text-muted">ไม่พบคำปฏิเสธ</p>
              </td>
            </tr>
            <tr v-for="(keyword, index) in keywords" :key="keyword.NegativeKeywordID" class="keyword-row pop-in" :style="{animationDelay: `${0.05 * index}s`}">
              <td class="text-muted">{{ (pagination.page - 1) * pagination.limit + index + 1 }}</td>
              <td>
                <span v-if="editingId !== keyword.NegativeKeywordID" class="keyword-word">{{ keyword.Word }}</span>
                <input v-else v-model="editForm.word" class="form-control form-control-sm" />
              </td>
              <td>
                <span v-if="editingId !== keyword.NegativeKeywordID" class="weight-badge" :class="getWeightClass(keyword.WeightModifier)">
                  {{ keyword.WeightModifier }}
                </span>
                <select v-else v-model="editForm.weightModifier" class="form-control form-control-sm">
                  <option :value="-1.0">-1.0</option>
                  <option :value="0.0">0.0</option>
                  <option :value="-0.5">-0.5</option>
                </select>
              </td>
              <td>
                <span v-if="editingId !== keyword.NegativeKeywordID" class="text-muted">{{ keyword.Description || '-' }}</span>
                <input v-else v-model="editForm.description" class="form-control form-control-sm" />
              </td>
              <td>
                <button 
                  class="status-toggle" 
                  :class="{ active: keyword.IsActive }"
                  @click="toggleActive(keyword)"
                  :title="keyword.IsActive ? 'คลิกเพื่อปิดใช้งาน' : 'คลิกเพื่อเปิดใช้งาน'"
                >
                  {{ keyword.IsActive ? 'ใช้งาน' : 'ปิด' }}
                </button>
              </td>
              <td>
                <div class="action-buttons">
                  <template v-if="editingId !== keyword.NegativeKeywordID">
                    <button class="btn-icon btn-edit" @click="startEdit(keyword)" title="แก้ไข">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn-icon btn-delete" @click="confirmDelete(keyword)" title="ลบ">
                      <i class="bi bi-trash"></i>
                    </button>
                  </template>
                  <template v-else>
                    <button class="btn-icon btn-save" @click="saveEdit(keyword)" title="บันทึก">
                      <i class="bi bi-check-lg"></i>
                    </button>
                    <button class="btn-icon btn-cancel" @click="cancelEdit" title="ยกเลิก">
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination-wrapper" v-if="pagination.totalPages > 1">
        <button 
          class="page-btn" 
          :disabled="pagination.page <= 1"
          @click="goToPage(pagination.page - 1)"
        >
          <i class="bi bi-chevron-left"></i>
        </button>
        <span class="page-info">
          หน้า {{ pagination.page }} จาก {{ pagination.totalPages }}
        </span>
        <button 
          class="page-btn" 
          :disabled="pagination.page >= pagination.totalPages"
          @click="goToPage(pagination.page + 1)"
        >
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Info Card -->
    <div class="info-card slide-in-up" :style="{animationDelay: '0.3s'}">
      <h3 class="info-title">
        <i class="bi bi-info-circle me-2"></i>
        วิธีการทำงาน
      </h3>
      <div class="info-content">
        <p><strong>คำปฏิเสธ</strong> คือคำที่ใช้บ่งบอกความหมายในเชิงลบหรือยกเว้น</p>
        <p>เมื่อ User พิมพ์ <code>"ไม่เอาหอใน"</code> ระบบจะ:</p>
        <ol>
          <li>ตัดคำเป็น: <code>['ไม่', 'เอา', 'หอใน']</code></li>
          <li>พบ Keyword <code>"หอใน"</code> (คะแนนปกติ 0.95)</li>
          <li>ตรวจสอบย้อนหลัง → พบ <code>"ไม่"</code> (ตัวคูณ -1.0)</li>
          <li>คะแนนสุดท้าย: <code>0.95 × -1.0 = -0.95</code></li>
        </ol>
        <p class="text-muted mt-3">ผลลัพธ์: เอกสารเกี่ยวกับ "หอใน" จะถูกผลักไปท้ายสุดหรือไม่แสดง</p>
      </div>
    </div>

    <!-- Toast Notification -->
    <Teleport to="body">
      <div class="toast-container" v-if="toast.show">
        <div class="toast-message" :class="toast.type">
          <i :class="toastIcon"></i>
          <span>{{ toast.message }}</span>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div class="modal-overlay" v-if="deleteModal.show" @click.self="deleteModal.show = false">
        <div class="modal-content pop-in">
          <div class="modal-icon danger">
            <i class="bi bi-exclamation-triangle"></i>
          </div>
          <h3 class="modal-title">ยืนยันการลบ</h3>
          <p class="modal-text">
            คุณต้องการลบคำปฏิเสธ "<strong>{{ deleteModal.keyword?.Word }}</strong>" ใช่หรือไม่?
          </p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="deleteModal.show = false">ยกเลิก</button>
            <button class="btn-danger" @click="deleteKeyword" :disabled="isDeleting">
              {{ isDeleting ? 'กำลังลบ...' : 'ลบ' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 🆕 Seed Confirmation Modal -->
    <Teleport to="body">
      <div class="modal-overlay" v-if="seedModal.show" @click.self="seedModal.show = false">
        <div class="modal-content pop-in">
          <div class="modal-icon primary">
            <i class="bi bi-magic"></i>
          </div>
          <h3 class="modal-title">เติมคำอัตโนมัติ</h3>
          <p class="modal-text">
            ระบบจะเติมคำปฏิเสธมาตรฐานประมาณ 50 คำ (เช่น ไม่, อย่า, ห้าม) ลงในระบบ<br>
            <small class="text-muted">คำที่คุณเคยลบไปแล้วจะไม่ถูกเติมกลับมา</small>
          </p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="seedModal.show = false">ยกเลิก</button>
            <button class="btn-primary-apple" @click="seedKeywords" :disabled="isSeeding">
              {{ isSeeding ? 'กำลังเติม...' : 'ยืนยัน' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { axiosInstance } from '@/plugins/axios';
import Sidebar from '@/components/Sidebar.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const userInfoObject = ref({});
const userType = ref('');

// State
const keywords = ref([]);
const stats = ref({});
const pagination = ref({ page: 1, limit: 50, total: 0, totalPages: 1 });
const searchQuery = ref('');
const filterActive = ref(undefined);
const isLoading = ref(false);
const isAdding = ref(false);
const isDeleting = ref(false);
const isSeeding = ref(false); // 🆕
const editingId = ref(null);

// Seed modal state
const seedModal = reactive({ show: false }); // 🆕

// Forms
const newKeyword = reactive({
  word: '',
  weightModifier: -1.0,
  description: ''
});

const editForm = reactive({
  word: '',
  weightModifier: -1.0,
  description: ''
});

// Modal
const deleteModal = reactive({
  show: false,
  keyword: null
});

// Toast
const toast = reactive({
  show: false,
  message: '',
  type: 'success'
});

const toastIcon = computed(() => {
  const icons = {
    success: 'bi bi-check-circle-fill',
    error: 'bi bi-x-circle-fill',
    warning: 'bi bi-exclamation-circle-fill'
  };
  return icons[toast.type] || icons.success;
});

// Debounce search
let searchTimeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1;
    fetchKeywords();
  }, 300);
};

// Fetch keywords
const fetchKeywords = async () => {
  isLoading.value = true;
  try {
    const params = new URLSearchParams({
      page: pagination.value.page,
      limit: pagination.value.limit,
      search: searchQuery.value
    });
    if (filterActive.value !== undefined) {
      params.append('active', filterActive.value);
    }

    const response = await axiosInstance.get(`/negativekeywords?${params}`);
    if (response.data.ok) {
      keywords.value = response.data.data;
      pagination.value = response.data.pagination;
      stats.value = response.data.stats;
    }
  } catch (error) {
    showToast('ไม่สามารถโหลดข้อมูลได้: ' + error.message, 'error');
  } finally {
    isLoading.value = false;
  }
};

// Add keyword
const addKeyword = async () => {
  if (!newKeyword.word.trim()) return;
  
  isAdding.value = true;
  try {
    const isBulk = newKeyword.word.includes(',');
    const endpoint = isBulk ? '/negativekeywords/bulk' : '/negativekeywords';
    const payload = isBulk 
      ? { words: newKeyword.word, weightModifier: newKeyword.weightModifier }
      : { word: newKeyword.word, weightModifier: newKeyword.weightModifier, description: newKeyword.description };

    const response = await axiosInstance.post(endpoint, payload);
    if (response.data.ok) {
      showToast(response.data.message, 'success');
      newKeyword.word = '';
      newKeyword.description = '';
      fetchKeywords();
    }
  } catch (error) {
    showToast(error.response?.data?.message || error.message, 'error');
  } finally {
    isAdding.value = false;
  }
};

// Toggle active
const toggleActive = async (keyword) => {
  try {
    const response = await axiosInstance.post(`/negativekeywords/toggle/${keyword.NegativeKeywordID}`);
    if (response.data.ok) {
      keyword.IsActive = response.data.data.isActive ? 1 : 0;
      showToast(response.data.message, 'success');
      // Refresh stats
      fetchKeywords();
    }
  } catch (error) {
    showToast(error.response?.data?.message || error.message, 'error');
  }
};

// Edit
const startEdit = (keyword) => {
  editingId.value = keyword.NegativeKeywordID;
  editForm.word = keyword.Word;
  editForm.weightModifier = keyword.WeightModifier;
  editForm.description = keyword.Description || '';
};

const cancelEdit = () => {
  editingId.value = null;
};

const saveEdit = async (keyword) => {
  try {
    const response = await axiosInstance.put(`/negativekeywords/${keyword.NegativeKeywordID}`, {
      word: editForm.word,
      weightModifier: editForm.weightModifier,
      description: editForm.description
    });
    if (response.data.ok) {
      showToast(response.data.message, 'success');
      editingId.value = null;
      fetchKeywords();
    }
  } catch (error) {
    showToast(error.response?.data?.message || error.message, 'error');
  }
};

// Delete
const confirmDelete = (keyword) => {
  deleteModal.keyword = keyword;
  deleteModal.show = true;
};

// 🆕 Seed helpers
const confirmSeed = () => {
  seedModal.show = true;
};

const seedKeywords = async () => {
  isSeeding.value = true;
  try {
    const response = await axiosInstance.post('/negativekeywords/seed');
    if (response.data && response.data.ok) {
      const added = response.data.addedCount || 0;
      if (added > 0) {
        showToast(`เติมข้อมูลสำเร็จ! เพิ่มคำใหม่ ${added} คำ`, 'success');
      } else {
        showToast('ข้อมูลเป็นปัจจุบันอยู่แล้ว ไม่มีคำใหม่ที่ต้องเพิ่ม', 'warning');
      }
      seedModal.show = false;
      // Refresh table
      pagination.value.page = 1;
      await fetchKeywords();
    } else {
      showToast(response.data?.message || 'ไม่สามารถเติมคำได้', 'error');
    }
  } catch (error) {
    showToast(error.response?.data?.message || error.message || 'เกิดข้อผิดพลาดในการเติมข้อมูล', 'error');
  } finally {
    isSeeding.value = false;
  }
};

const deleteKeyword = async () => {
  if (!deleteModal.keyword) return;
  
  isDeleting.value = true;
  try {
    console.log('🗑️ Deleting keyword ID:', deleteModal.keyword.NegativeKeywordID, 'Word:', deleteModal.keyword.Word);
    const response = await axiosInstance.delete(`/negativekeywords/${deleteModal.keyword.NegativeKeywordID}`);
    console.log('✅ Delete response:', response.data);
    
    if (response.data && response.data.ok) {
      showToast(response.data.message, 'success');
      deleteModal.show = false;
      deleteModal.keyword = null;
      // Reset to page 1 to fetch fresh data
      pagination.value.page = 1;
      console.log('🔄 Fetching keywords after delete...');
      await fetchKeywords();
      console.log('✅ Keywords reloaded');
    } else {
      const errorMsg = response.data?.message || 'เกิดข้อผิดพลาดในการลบ';
      console.error('❌ Delete failed:', errorMsg);
      showToast(errorMsg, 'error');
    }
  } catch (error) {
    console.error('❌ Delete error:', error);
    console.error('❌ Delete error response:', error.response?.data);
    const errorMsg = error.response?.data?.message || error.message || 'ไม่สามารถลบได้';
    showToast(errorMsg, 'error');
  } finally {
    isDeleting.value = false;
  }
};

// Pagination
const goToPage = (page) => {
  pagination.value.page = page;
  fetchKeywords();
};

// Helpers
const getWeightClass = (weight) => {
  if (weight === -1.0) return 'weight-negative';
  if (weight === 0.0) return 'weight-zero';
  return 'weight-partial';
};

const showToast = (message, type = 'success') => {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => {
    toast.show = false;
  }, 3000);
};

// Init
onMounted(() => {
  const token = localStorage.getItem('userToken');
  const type = localStorage.getItem('userType');
  const userInfoString = localStorage.getItem('userInfo');
  if (!token) {
    router.replace({ name: 'login' });
    return;
  }
  if (type) userType.value = type;
  if (userInfoString) {
    try { userInfoObject.value = JSON.parse(userInfoString); } catch (e) { console.error(e); }
  }
  fetchKeywords();
});
</script>

<style scoped>
@import '@/assets/dashboard-styles.css';
@import '@/assets/main.css';

.negative-keywords-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.header-section {
  text-align: center;
  margin-bottom: 2rem;
}

.header-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, #FF3B30 0%, #FF6B6B 100%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: 0 10px 30px rgba(255, 59, 48, 0.3);
}

.header-icon {
  width: 40px;
  height: 40px;
  color: white;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #FF3B30 0%, #FF6B6B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #8E8E93;
  font-weight: 500;
  margin: 0;
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* 🆕 Seed Button */
.header-actions {
  margin-top: 1rem;
}

.btn-seed {
  background: #E5F0FF;
  color: #007AFF;
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1.2rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
}

.btn-seed:hover:not(:disabled) {
  background: #007AFF;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.2);
}

.btn-seed:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 🆕 Modal Icon Primary */
.modal-icon.primary {
  background: #E5F0FF;
  color: #007AFF;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: #1D1D1F;
}

.stat-value.text-success { color: #34C759; }
.stat-value.text-danger { color: #FF3B30; }
.stat-value.text-warning { color: #FF9500; }

.stat-label {
  font-size: 0.875rem;
  color: #8E8E93;
  margin-top: 0.25rem;
}

/* Form Card */
.form-card {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1D1D1F;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
}

.form-row {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6E6E73;
  margin-bottom: 0.5rem;
}

.form-control {
  padding: 0.75rem 1rem;
  border: 1px solid #E5E5EA;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #FF3B30;
  box-shadow: 0 0 0 3px rgba(255, 59, 48, 0.1);
}

.form-control-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
}

.form-hint {
  font-size: 0.8rem;
  color: #8E8E93;
  margin-top: 0.25rem;
}

.btn-primary-apple {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #FF3B30 0%, #FF6B6B 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  white-space: nowrap;
}

.btn-primary-apple:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 59, 48, 0.3);
}

.btn-primary-apple:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Filter Card */
.filter-card {
  background: white;
  border-radius: 16px;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #8E8E93;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #E5E5EA;
  border-radius: 10px;
  font-size: 1rem;
}

.search-box input:focus {
  outline: none;
  border-color: #FF3B30;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  background: #F5F5F7;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #6E6E73;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #EBEBED;
}

.filter-btn.active {
  background: linear-gradient(135deg, #FF3B30 0%, #FF6B6B 100%);
  color: white;
}

/* Table Card */
.table-card {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.table-responsive {
  overflow-x: auto;
}

.keywords-table {
  width: 100%;
  border-collapse: collapse;
}

.keywords-table th {
  text-align: left;
  padding: 1rem;
  background: #F5F5F7;
  font-weight: 600;
  color: #6E6E73;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.keywords-table th:first-child {
  border-radius: 10px 0 0 10px;
}

.keywords-table th:last-child {
  border-radius: 0 10px 10px 0;
}

.keywords-table td {
  padding: 1rem;
  border-bottom: 1px solid #F5F5F7;
  vertical-align: middle;
}

.keyword-row:hover {
  background: #FAFAFA;
}

.keyword-word {
  font-weight: 600;
  color: #1D1D1F;
  font-size: 1.1rem;
}

.weight-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
}

.weight-negative {
  background: #FFE5E5;
  color: #FF3B30;
}

.weight-zero {
  background: #FFF3E0;
  color: #FF9500;
}

.weight-partial {
  background: #E5F0FF;
  color: #007AFF;
}

.status-toggle {
  padding: 0.35rem 0.75rem;
  border: none;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: #F5F5F7;
  color: #8E8E93;
}

.status-toggle.active {
  background: #E8F5E9;
  color: #34C759;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit {
  background: #E5F0FF;
  color: #007AFF;
}

.btn-edit:hover {
  background: #007AFF;
  color: white;
}

.btn-delete {
  background: #FFE5E5;
  color: #FF3B30;
}

.btn-delete:hover {
  background: #FF3B30;
  color: white;
}

.btn-save {
  background: #E8F5E9;
  color: #34C759;
}

.btn-save:hover {
  background: #34C759;
  color: white;
}

.btn-cancel {
  background: #F5F5F7;
  color: #8E8E93;
}

.btn-cancel:hover {
  background: #8E8E93;
  color: white;
}

/* Pagination */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #F5F5F7;
}

.page-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #E5E5EA;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #FF3B30;
  color: white;
  border-color: #FF3B30;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #6E6E73;
  font-size: 0.9rem;
}

/* Info Card */
.info-card {
  background: linear-gradient(135deg, #FFF5F5 0%, #FFEBEE 100%);
  border-radius: 20px;
  padding: 1.5rem;
  border-left: 4px solid #FF3B30;
}

.info-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1D1D1F;
  margin: 0 0 1rem 0;
}

.info-content {
  font-size: 0.95rem;
  color: #424245;
  line-height: 1.7;
}

.info-content p {
  margin: 0 0 0.75rem 0;
}

.info-content ol {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.info-content li {
  margin-bottom: 0.5rem;
}

.info-content code {
  background: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-family: 'SF Mono', monospace;
  font-size: 0.9em;
  color: #FF3B30;
}

/* Toast */
.toast-container {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 9999;
}

.toast-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  background: white;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  animation: slideInRight 0.3s ease;
}

.toast-message.success {
  border-left: 4px solid #34C759;
}

.toast-message.success i {
  color: #34C759;
}

.toast-message.error {
  border-left: 4px solid #FF3B30;
}

.toast-message.error i {
  color: #FF3B30;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.modal-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.modal-icon.danger {
  background: #FFE5E5;
  color: #FF3B30;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.modal-text {
  color: #6E6E73;
  margin: 0 0 1.5rem 0;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: #F5F5F7;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #EBEBED;
}

.btn-danger {
  padding: 0.75rem 1.5rem;
  background: #FF3B30;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-danger:hover:not(:disabled) {
  transform: scale(1.02);
}

.btn-danger:disabled {
  opacity: 0.6;
}

/* Loading */
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #F5F5F7;
  border-top-color: #FF3B30;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Animations */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-in-down {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-in-left {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes pop-in {
  0% { opacity: 0; transform: scale(0.9); }
  50% { transform: scale(1.02); }
  100% { opacity: 1; transform: scale(1); }
}

.fade-in { animation: fade-in 0.6s ease forwards; }
.slide-in-down { animation: slide-in-down 0.6s ease forwards; }
.slide-in-up { animation: slide-in-up 0.6s ease forwards; }
.slide-in-left { animation: slide-in-left 0.6s ease forwards; }
.slide-in-right { animation: slide-in-right 0.6s ease forwards; }
.pop-in { animation: pop-in 0.5s ease forwards; opacity: 0; }

/* Responsive */
@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .form-row {
    flex-direction: column;
  }
  
  .form-row .form-group {
    width: 100% !important;
  }
  
  .filter-row {
    flex-direction: column;
  }
  
  .filter-buttons {
    width: 100%;
    justify-content: center;
  }
}
</style>
