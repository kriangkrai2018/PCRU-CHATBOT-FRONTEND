<template>
  <div class="dashboard-container">
    <Sidebar :userType="userType" :userInfoObject="userInfoObject" />
    
    <!-- Mobile Sidebar Backdrop -->
    <div v-if="isMobileSidebarOpen" class="mobile-sidebar-backdrop" @click="toggleSidebar" aria-hidden="true"></div>
    
    <main class="main-content">
      <div class="negative-keywords-container">
        <!-- Header Section -->
        <div class="header-section my-4">
          <div class="header-top d-flex align-items-center gap-3 mb-3" style="justify-content: space-between;">
            <div class="d-flex align-items-center gap-3">
              <button class="mobile-sidebar-toggle mobile-inline-toggle" @click.stop="toggleSidebar" :aria-label="isMobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'">
                <i :class="isMobileSidebarOpen ? 'bi bi-x' : 'bi bi-list'"></i>
              </button>

              <svg class="brain-icon" width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Background Circle -->
                <circle cx="32" cy="32" r="30" fill="#dc2626" opacity="0.08"/>
                
                <!-- X mark / Negative symbol -->
                <circle class="brain-outline brain-left" 
                  cx="32" cy="32" r="18"
                  stroke="#dc2626" stroke-width="3" stroke-linecap="round" fill="none"/>
                
                <!-- Diagonal lines forming X -->
                <path class="brain-wrinkle wrinkle-1" 
                  d="M 18 18 L 46 46" 
                  stroke="#dc2626" stroke-width="3" stroke-linecap="round" fill="none"/>
                <path class="brain-wrinkle wrinkle-2" 
                  d="M 46 18 L 18 46" 
                  stroke="#dc2626" stroke-width="3" stroke-linecap="round" fill="none"/>
                
                <!-- Dots -->
                <g class="neuron-group">
                  <circle class="neuron-glow" cx="20" cy="20" r="5" fill="#dc2626" opacity="0.2"/>
                  <circle class="neuron neuron-1" cx="20" cy="20" r="2.5" fill="#dc2626"/>
                </g>
                <g class="neuron-group">
                  <circle class="neuron-glow" cx="44" cy="44" r="5" fill="#ef4444" opacity="0.2"/>
                  <circle class="neuron neuron-2" cx="44" cy="44" r="2.5" fill="#ef4444"/>
                </g>
              </svg>

              <h2 class="page-title m-0">Manage Negative Keywords</h2>
            </div>
            
            <!-- Action buttons group -->
            <div class="header-actions d-flex gap-2">
              <button class="btn-deleted" @click="openDeletedModal" :disabled="isLoadingDeleted" title="คำที่ลบล่าสุด">
                <i class="bi bi-trash3"></i>
                <span class="deleted-badge" v-if="deletedCount > 0">{{ deletedCount }}</span>
              </button>
              <button class="btn-seed" @click="confirmSeed" :disabled="isSeeding" title="เติมคำมาตรฐานอัตโนมัติ">
                <i class="bi bi-magic"></i>
                <span class="d-none d-sm-inline">เติมอัตโนมัติ</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Info Card: Guide -->
        <div class="info-card apple-card mb-4 p-4 rounded-4 shadow-apple">
          <!-- SVG X Icon Animation -->
          <svg class="book-icon float-start me-3" width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Background Circle -->
            <circle cx="36" cy="36" r="32" fill="#dc2626" opacity="0.08"/>
            <!-- Circle -->
            <circle cx="36" cy="36" r="20" stroke="#dc2626" stroke-width="2.5" fill="none"/>
            <!-- X lines -->
            <path d="M 22 22 L 50 50" stroke="#dc2626" stroke-width="3" stroke-linecap="round"/>
            <path d="M 50 22 L 22 50" stroke="#dc2626" stroke-width="3" stroke-linecap="round"/>
            <!-- Dots for animation -->
            <circle cx="24" cy="24" r="3" fill="#dc2626" opacity="0.6"/>
            <circle cx="48" cy="48" r="3" fill="#ef4444" opacity="0.6"/>
          </svg>
          <h5 class="fw-bold mb-3">Negative Keywords คืออะไร?</h5>
          <p class="mb-2 text-muted"><strong>Negative Keywords</strong> คือคำที่ทำให้คะแนนลดลง หรือเป็นคำปฏิเสธที่ไม่ต้องการให้ระบบนำไปใช้ เช่น "ไม่", "ยกเว้น", "อย่า" เพื่อให้การค้นหาแม่นยำขึ้น</p>
          <ul class="mb-3 text-muted small">
            <li class="d-flex align-items-center gap-2 mb-2">
              <svg class="icon-svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="#dc2626" stroke-width="2"/>
                <path d="M6 10 L14 10" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span>คำปฏิเสธจะลดคะแนนของผลลัพธ์ที่ค้นหา</span>
            </li>
            <li class="d-flex align-items-center gap-2 mb-2">
              <svg class="icon-svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="#dc2626" stroke-width="2"/>
                <path d="M6 10 L9 13 L14 7" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>ปรับตัวคูณคะแนน: -1.0 (ลบ), 0.0 (ศูนย์), -0.5 (ลดครึ่ง)</span>
            </li>
            <li class="d-flex align-items-center gap-2">
              <svg class="icon-svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="#dc2626" stroke-width="2"/>
                <path d="M10 6 V10 L13 13" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>เพิ่ม/ลบ/แก้ไข negative keywords ได้ตลอด</span>
            </li>
          </ul>
          <p class="mb-0 small text-danger fw-bold d-flex align-items-center gap-2">
            <svg class="icon-svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="#dc2626" stroke-width="2"/>
              <path d="M10 6 L10 11" stroke="#ffd60a" stroke-width="2" stroke-linecap="round"/>
              <path d="M8 14 L12 14" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
              <circle cx="10" cy="8" r="4" fill="#ffd60a" opacity="0.3"/>
            </svg>
            <span>ใช้ "เติมคำมาตรฐานอัตโนมัติ" เพื่อโหลดข้อมูลเริ่มต้น</span>
          </p>
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
          <div class="form-group form-group-modifier">
            <label class="form-label">ตัวคูณคะแนน</label>
            <select v-model="newKeyword.weightModifier" class="form-control">
              <option :value="-1.0">-1.0 (กลับเป็นลบ)</option>
              <option :value="0.0">0.0 (ทำให้เป็นศูนย์)</option>
              <option :value="-0.5">-0.5 (ลดครึ่งหนึ่ง)</option>
            </select>
          </div>
          <div class="form-group form-group-description">
            <label class="form-label">คำอธิบาย (ไม่บังคับ)</label>
            <input 
              type="text" 
              v-model="newKeyword.description" 
              class="form-control"
              placeholder="อธิบายการใช้งาน"
            />
          </div>
          <div class="form-group form-group-button">
            <button type="submit" class="btn-primary-apple" :disabled="!newKeyword.word.trim() || isAdding">
              <i class="bi bi-plus-lg me-1"></i>
              {{ isAdding ? 'กำลังเพิ่ม...' : 'เพิ่ม' }}
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Filters Section -->
    <AppleFilters
      v-model="nkFilters"
      :sort-options="nkSortOptions"
      :statuses="nkStatuses"
      status-label="สถานะ"
      :show-date-range="false"
      :show-date-presets="false"
      :show-number-range="false"
      class="mb-4"
      @change="onFiltersChange"
    />

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
              <td class="text-muted" data-label="#">{{ (pagination.page - 1) * pagination.limit + index + 1 }}</td>
              <td data-label="คำปฏิเสธ">
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
              <td data-label="คำอธิบาย">
                <span v-if="editingId !== keyword.NegativeKeywordID" class="text-muted">{{ keyword.Description || '-' }}</span>
                <input v-else v-model="editForm.description" class="form-control form-control-sm" />
              </td>
              <td data-label="สถานะ">
                <button 
                  class="status-toggle" 
                  :class="{ active: keyword.IsActive }"
                  @click="toggleActive(keyword)"
                  :title="keyword.IsActive ? 'คลิกเพื่อปิดใช้งาน' : 'คลิกเพื่อเปิดใช้งาน'"
                >
                  {{ keyword.IsActive ? 'ใช้งาน' : 'ปิด' }}
                </button>
              </td>
              <td data-label="จัดการ">
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

    <!-- 🆕 Seed Confirmation Modal with Preview -->
    <Teleport to="body">
      <div class="modal-overlay" v-if="seedModal.show" @click.self="seedModal.show = false">
        <div class="modal-content seed-modal-content pop-in">
          <div class="modal-icon primary">
            <i class="bi bi-magic"></i>
          </div>
          <h3 class="modal-title">เติมคำอัตโนมัติ</h3>
          
          <!-- Loading state -->
          <div v-if="seedModal.loading" class="seed-loading">
            <div class="loading-spinner"></div>
            <p class="text-muted mt-2">กำลังโหลดรายการ...</p>
          </div>
          
          <!-- Preview content -->
          <div v-else class="seed-preview">
            <!-- Words to add -->
            <div v-if="seedModal.toAdd.length > 0" class="seed-section">
              <h4 class="seed-section-title text-success">
                <i class="bi bi-plus-circle me-2"></i>
                คำที่จะเพิ่มใหม่ ({{ seedModal.toAdd.length }} คำ)
              </h4>
              <div class="seed-words-list">
                <span v-for="item in seedModal.toAdd" :key="item.word" class="seed-word-tag new">
                  {{ item.word }}
                  <small class="modifier">({{ item.modifier }})</small>
                </span>
              </div>
            </div>
            
            <!-- Already exists -->
            <div v-if="seedModal.alreadyExists.length > 0" class="seed-section">
              <h4 class="seed-section-title text-muted">
                <i class="bi bi-check-circle me-2"></i>
                มีในระบบแล้ว ({{ seedModal.alreadyExists.length }} คำ)
              </h4>
              <div class="seed-words-list">
                <span v-for="item in seedModal.alreadyExists" :key="item.word" class="seed-word-tag exists">
                  {{ item.word }}
                </span>
              </div>
            </div>
            
            <!-- Ignored (previously deleted) -->
            <div v-if="seedModal.ignored.length > 0" class="seed-section">
              <h4 class="seed-section-title text-warning">
                <i class="bi bi-eye-slash me-2"></i>
                ถูกลบไปแล้ว - จะไม่เพิ่มกลับ ({{ seedModal.ignored.length }} คำ)
              </h4>
              <div class="seed-words-list">
                <span v-for="item in seedModal.ignored" :key="item.word" class="seed-word-tag ignored">
                  {{ item.word }}
                </span>
              </div>
            </div>
            
            <!-- No words to add -->
            <div v-if="seedModal.toAdd.length === 0" class="seed-empty">
              <i class="bi bi-check-circle-fill text-success" style="font-size: 2rem;"></i>
              <p class="mt-2 mb-0">ข้อมูลครบถ้วนแล้ว ไม่มีคำใหม่ที่ต้องเพิ่ม</p>
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="btn-secondary" @click="seedModal.show = false">ยกเลิก</button>
            <button 
              class="btn-primary-apple" 
              @click="seedKeywords" 
              :disabled="isSeeding || seedModal.toAdd.length === 0"
            >
              {{ isSeeding ? 'กำลังเติม...' : `เพิ่ม ${seedModal.toAdd.length} คำ` }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 🗑️ Recently Deleted Modal (Apple Style) -->
    <Teleport to="body">
      <div class="modal-overlay recently-deleted-overlay" v-if="deletedModal.show" @click.self="deletedModal.show = false">
        <div class="recently-deleted-modal pop-in">
          <!-- Header -->
          <div class="rd-header">
            <div class="rd-header-left">
              <button class="rd-close-btn" @click="deletedModal.show = false">
                <i class="bi bi-chevron-left"></i>
                <span>กลับ</span>
              </button>
            </div>
            <h3 class="rd-title">ลบล่าสุด</h3>
            <div class="rd-header-right">
              <button 
                v-if="deletedModal.items.length > 0"
                class="rd-action-btn select-btn"
                @click="toggleSelectMode"
              >
                {{ deletedModal.selectMode ? 'เสร็จ' : 'เลือก' }}
              </button>
            </div>
          </div>
          
          <!-- Info banner -->
          <div class="rd-info-banner" v-if="deletedModal.items.length > 0">
            <i class="bi bi-info-circle"></i>
            <span>คำที่ลบจะถูกเก็บไว้ที่นี่ คุณสามารถกู้คืนได้ตลอดเวลา</span>
          </div>
          
          <!-- Content -->
          <div class="rd-content">
            <!-- Loading -->
            <div v-if="isLoadingDeleted" class="rd-loading">
              <div class="loading-spinner"></div>
              <p>กำลังโหลด...</p>
            </div>
            
            <!-- Empty state -->
            <div v-else-if="deletedModal.items.length === 0" class="rd-empty">
              <div class="rd-empty-icon">
                <i class="bi bi-trash3"></i>
              </div>
              <h4>ไม่มีคำที่ลบล่าสุด</h4>
              <p>คำที่คุณลบจะปรากฏที่นี่</p>
            </div>
            
            <!-- Items grid (Apple Photos style) -->
            <div v-else class="rd-grid">
              <div 
                v-for="item in deletedModal.items" 
                :key="item.Id"
                class="rd-item"
                :class="{ selected: deletedModal.selectedIds.includes(item.Id) }"
                @click="deletedModal.selectMode ? toggleSelectItem(item.Id) : null"
              >
                <div class="rd-item-select" v-if="deletedModal.selectMode">
                  <i :class="deletedModal.selectedIds.includes(item.Id) ? 'bi bi-check-circle-fill' : 'bi bi-circle'"></i>
                </div>
                <div class="rd-item-content">
                  <span class="rd-word">{{ item.Word }}</span>
                  <span class="rd-date">{{ formatDeletedDate(item.DeletedAt) }}</span>
                </div>
                <div class="rd-item-actions" v-if="!deletedModal.selectMode">
                  <button class="rd-restore-btn" @click.stop="restoreItem(item)" title="กู้คืน">
                    <i class="bi bi-arrow-counterclockwise"></i>
                  </button>
                  <button class="rd-delete-btn" @click.stop="permanentDeleteItem(item)" title="ลบถาวร">
                    <i class="bi bi-trash3-fill"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Footer actions (when in select mode) -->
          <div class="rd-footer" v-if="deletedModal.selectMode && deletedModal.items.length > 0">
            <button 
              class="rd-footer-btn restore"
              :disabled="deletedModal.selectedIds.length === 0"
              @click="restoreSelected"
            >
              <i class="bi bi-arrow-counterclockwise"></i>
              <span>กู้คืน {{ deletedModal.selectedIds.length > 0 ? `(${deletedModal.selectedIds.length})` : '' }}</span>
            </button>
            <button 
              class="rd-footer-btn delete"
              :disabled="deletedModal.selectedIds.length === 0"
              @click="permanentDeleteSelected"
            >
              <i class="bi bi-trash3-fill"></i>
              <span>ลบถาวร {{ deletedModal.selectedIds.length > 0 ? `(${deletedModal.selectedIds.length})` : '' }}</span>
            </button>
          </div>
          
          <!-- Footer actions (when not in select mode) -->
          <div class="rd-footer" v-if="!deletedModal.selectMode && deletedModal.items.length > 0">
            <button class="rd-footer-btn restore-all" @click="restoreAll">
              <i class="bi bi-arrow-counterclockwise"></i>
              <span>กู้คืนทั้งหมด</span>
            </button>
            <button class="rd-footer-btn delete-all" @click="confirmDeleteAll">
              <i class="bi bi-trash3-fill"></i>
              <span>ลบทั้งหมด</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Confirm Delete All Modal -->
    <Teleport to="body">
      <div class="modal-overlay" v-if="confirmDeleteAllModal.show" @click.self="confirmDeleteAllModal.show = false">
        <div class="modal-content pop-in">
          <div class="modal-icon danger">
            <i class="bi bi-exclamation-triangle"></i>
          </div>
          <h3 class="modal-title">ลบถาวรทั้งหมด?</h3>
          <p class="modal-text">
            คำทั้งหมด {{ deletedModal.items.length }} คำจะถูกลบถาวร<br>
            <strong class="text-danger">ไม่สามารถกู้คืนได้อีก</strong>
          </p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="confirmDeleteAllModal.show = false">ยกเลิก</button>
            <button class="btn-danger" @click="executeDeleteAll" :disabled="isDeletingAll">
              {{ isDeletingAll ? 'กำลังลบ...' : 'ลบถาวรทั้งหมด' }}
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
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { axiosInstance } from '@/plugins/axios';
import Sidebar from '@/components/Sidebar.vue';
import AppleFilters from '@/components/AppleFilters.vue';
import { useRouter } from 'vue-router';
import { bindSidebarResize, isSidebarCollapsed, isMobileSidebarOpen } from '@/stores/sidebarState';

const router = useRouter();
const userInfoObject = ref({});
const userType = ref('');

// Mobile sidebar
const isMobile = ref(window.innerWidth <= 768);
let _savedSidebarCollapsed = null;

const toggleSidebar = () => {
  const sb = document.querySelector('.sidebar');
  const isOpen = !isMobileSidebarOpen.value;

  if (isOpen) {
    _savedSidebarCollapsed = isSidebarCollapsed.value;
    isSidebarCollapsed.value = false;
    if (sb) sb.classList.remove('collapsed');
    document.body.classList.add('sidebar-open');
    document.body.classList.add('sidebar-mobile-expanded');
    isMobileSidebarOpen.value = true;
  } else {
    isSidebarCollapsed.value = !!_savedSidebarCollapsed;
    if (sb && _savedSidebarCollapsed) sb.classList.add('collapsed');
    document.body.classList.remove('sidebar-open');
    document.body.classList.remove('sidebar-mobile-expanded');
    isMobileSidebarOpen.value = false;
    _savedSidebarCollapsed = null;
  }
};

// State
const keywords = ref([]);
const existingKeywords = ref([]); // Keywords from Keywords table to prevent adding them as negative keywords
const stats = ref({});
const pagination = ref({ page: 1, limit: 5, total: 0, totalPages: 1 });
const searchQuery = ref('');
const filterActive = ref(undefined);
const isLoading = ref(false);
const isAdding = ref(false);
const isDeleting = ref(false);
const isSeeding = ref(false); // 🆕
const editingId = ref(null);

// Filters state
const nkFilters = ref({
  sortBy: 'id',
  sortOrder: 'asc',
  status: ''
});

const nkSortOptions = [
  { value: 'id', label: 'ID' },
  { value: 'word', label: 'คำ' },
  { value: 'modifier', label: 'ตัวคูณ' },
];

const nkStatuses = [
  { value: 'active', label: 'ใช้งาน', icon: 'bi bi-check-circle-fill', color: 'status-green' },
  { value: 'inactive', label: 'ปิดใช้งาน', icon: 'bi bi-x-circle', color: 'status-gray' },
];

const onFiltersChange = () => {
  pagination.value.page = 1;
  fetchKeywords();
};

// Seed modal state
const seedModal = reactive({ 
  show: false, 
  loading: false,
  toAdd: [],
  alreadyExists: [],
  ignored: [],
  totalStandard: 0
}); // 🆕

// 🗑️ Recently Deleted modal state (Apple Style)
const deletedModal = reactive({
  show: false,
  items: [],
  selectMode: false,
  selectedIds: []
});
const deletedCount = ref(0);
const isLoadingDeleted = ref(false);
const isDeletingAll = ref(false);
const confirmDeleteAllModal = reactive({ show: false });

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
    
    // Use filter status from AppleFilters
    if (nkFilters.value.status === 'active') {
      params.append('active', 1);
    } else if (nkFilters.value.status === 'inactive') {
      params.append('active', 0);
    }
    
    // Add sorting params
    if (nkFilters.value.sortBy) {
      params.append('sortBy', nkFilters.value.sortBy);
      params.append('sortOrder', nkFilters.value.sortOrder);
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
  
  // Check if word is already a keyword
  const wordsToAdd = newKeyword.word.includes(',') 
    ? newKeyword.word.split(',').map(w => w.trim().toLowerCase()).filter(w => w)
    : [newKeyword.word.trim().toLowerCase()];
  
  const existingKwSet = new Set(existingKeywords.value.map(k => (k.KeywordText || '').toLowerCase()));
  const conflictWords = wordsToAdd.filter(w => existingKwSet.has(w));
  
  if (conflictWords.length > 0) {
    showToast(`ไม่สามารถเพิ่มได้: "${conflictWords.join(', ')}" เป็น Keyword อยู่แล้ว`, 'error');
    return;
  }
  
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
const confirmSeed = async () => {
  seedModal.show = true;
  seedModal.loading = true;
  seedModal.toAdd = [];
  seedModal.alreadyExists = [];
  seedModal.ignored = [];
  
  try {
    const response = await axiosInstance.get('/negativekeywords/seed/preview');
    if (response.data && response.data.ok) {
      seedModal.toAdd = response.data.data.toAdd || [];
      seedModal.alreadyExists = response.data.data.alreadyExists || [];
      seedModal.ignored = response.data.data.ignored || [];
      seedModal.totalStandard = response.data.data.totalStandard || 0;
    }
  } catch (error) {
    console.error('Error fetching seed preview:', error);
    showToast('ไม่สามารถโหลดรายการคำได้', 'error');
  } finally {
    seedModal.loading = false;
  }
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

// 🗑️ Recently Deleted Functions (Apple Style)
const fetchDeletedCount = async () => {
  try {
    const response = await axiosInstance.get('/negativekeywords/deleted');
    if (response.data && response.data.ok) {
      deletedCount.value = response.data.total || 0;
    }
  } catch (error) {
    console.warn('Could not fetch deleted count:', error);
  }
};

const openDeletedModal = async () => {
  deletedModal.show = true;
  deletedModal.selectMode = false;
  deletedModal.selectedIds = [];
  isLoadingDeleted.value = true;
  
  try {
    const response = await axiosInstance.get('/negativekeywords/deleted');
    if (response.data && response.data.ok) {
      deletedModal.items = response.data.data || [];
      deletedCount.value = response.data.total || 0;
    }
  } catch (error) {
    showToast('ไม่สามารถโหลดรายการคำที่ลบได้', 'error');
  } finally {
    isLoadingDeleted.value = false;
  }
};

const toggleSelectMode = () => {
  deletedModal.selectMode = !deletedModal.selectMode;
  if (!deletedModal.selectMode) {
    deletedModal.selectedIds = [];
  }
};

const toggleSelectItem = (id) => {
  const index = deletedModal.selectedIds.indexOf(id);
  if (index > -1) {
    deletedModal.selectedIds.splice(index, 1);
  } else {
    deletedModal.selectedIds.push(id);
  }
};

const formatDeletedDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'วันนี้';
  if (diffDays === 1) return 'เมื่อวาน';
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} สัปดาห์ที่แล้ว`;
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
};

const restoreItem = async (item) => {
  try {
    const response = await axiosInstance.post(`/negativekeywords/restore/${item.Id}`);
    if (response.data && response.data.ok) {
      showToast(`กู้คืน "${item.Word}" สำเร็จ`, 'success');
      deletedModal.items = deletedModal.items.filter(i => i.Id !== item.Id);
      deletedCount.value = Math.max(0, deletedCount.value - 1);
      await fetchKeywords();
    } else {
      showToast(response.data?.message || 'ไม่สามารถกู้คืนได้', 'error');
    }
  } catch (error) {
    showToast(error.response?.data?.message || 'เกิดข้อผิดพลาด', 'error');
  }
};

const permanentDeleteItem = async (item) => {
  if (!confirm(`ลบ "${item.Word}" ถาวร? ไม่สามารถกู้คืนได้อีก`)) return;
  
  try {
    const response = await axiosInstance.delete(`/negativekeywords/deleted/${item.Id}`);
    if (response.data && response.data.ok) {
      showToast(`ลบ "${item.Word}" ถาวรแล้ว`, 'success');
      deletedModal.items = deletedModal.items.filter(i => i.Id !== item.Id);
      deletedCount.value = Math.max(0, deletedCount.value - 1);
    } else {
      showToast(response.data?.message || 'ไม่สามารถลบได้', 'error');
    }
  } catch (error) {
    showToast(error.response?.data?.message || 'เกิดข้อผิดพลาด', 'error');
  }
};

const restoreSelected = async () => {
  if (deletedModal.selectedIds.length === 0) return;
  
  let successCount = 0;
  for (const id of deletedModal.selectedIds) {
    try {
      const response = await axiosInstance.post(`/negativekeywords/restore/${id}`);
      if (response.data && response.data.ok) successCount++;
    } catch (error) {
      console.warn('Restore failed for ID:', id);
    }
  }
  
  showToast(`กู้คืนสำเร็จ ${successCount} คำ`, 'success');
  deletedModal.selectedIds = [];
  deletedModal.selectMode = false;
  await openDeletedModal();
  await fetchKeywords();
};

const permanentDeleteSelected = async () => {
  if (deletedModal.selectedIds.length === 0) return;
  if (!confirm(`ลบถาวร ${deletedModal.selectedIds.length} คำ? ไม่สามารถกู้คืนได้อีก`)) return;
  
  let successCount = 0;
  for (const id of deletedModal.selectedIds) {
    try {
      const response = await axiosInstance.delete(`/negativekeywords/deleted/${id}`);
      if (response.data && response.data.ok) successCount++;
    } catch (error) {
      console.warn('Delete failed for ID:', id);
    }
  }
  
  showToast(`ลบถาวร ${successCount} คำแล้ว`, 'success');
  deletedModal.selectedIds = [];
  deletedModal.selectMode = false;
  await openDeletedModal();
};

const restoreAll = async () => {
  if (!confirm(`กู้คืนทั้งหมด ${deletedModal.items.length} คำ?`)) return;
  
  try {
    const response = await axiosInstance.post('/negativekeywords/restore-all');
    if (response.data && response.data.ok) {
      showToast(response.data.message, 'success');
      deletedModal.items = [];
      deletedCount.value = 0;
      await fetchKeywords();
    } else {
      showToast(response.data?.message || 'ไม่สามารถกู้คืนได้', 'error');
    }
  } catch (error) {
    showToast(error.response?.data?.message || 'เกิดข้อผิดพลาด', 'error');
  }
};

const confirmDeleteAll = () => {
  confirmDeleteAllModal.show = true;
};

const executeDeleteAll = async () => {
  isDeletingAll.value = true;
  try {
    const response = await axiosInstance.delete('/negativekeywords/deleted-all');
    if (response.data && response.data.ok) {
      showToast(response.data.message, 'success');
      deletedModal.items = [];
      deletedCount.value = 0;
      confirmDeleteAllModal.show = false;
    } else {
      showToast(response.data?.message || 'ไม่สามารถลบได้', 'error');
    }
  } catch (error) {
    showToast(error.response?.data?.message || 'เกิดข้อผิดพลาด', 'error');
  } finally {
    isDeletingAll.value = false;
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
      await fetchDeletedCount(); // Update deleted badge count
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
onMounted(async () => {
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
  
  bindSidebarResize();
  fetchKeywords();
  fetchDeletedCount(); // Load deleted count for badge
  
  // Fetch existing keywords to prevent conflicts
  try {
    const kwRes = await axiosInstance.get('/keywords/public');
    existingKeywords.value = kwRes.data?.data || kwRes.data || [];
  } catch (e) {
    console.warn('Could not load existing keywords:', e.message);
  }
  
  // Handle window resize for mobile detection
  const handleResize = () => {
    isMobile.value = window.innerWidth <= 768;
  };
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
});

onUnmounted(() => {
  isMobileSidebarOpen.value = false;
  document.body.classList.remove('sidebar-open');
  document.body.classList.remove('sidebar-mobile-expanded');
});
</script>

<style scoped>
@import '@/assets/dashboard-styles.css';
@import '@/assets/main.css';

.negative-keywords-container {
  padding: 2rem;
  width: 100%;
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
  align-items: flex-end;
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

@media (max-width: 992px) {
  .table-responsive { box-shadow: none; }
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

@media (max-width: 768px) {
  .keywords-table thead { display: none; }
  .keywords-table { display: block; }
  .keywords-table tbody { display: flex; flex-direction: column; gap: 1rem; }
  .keywords-table tbody tr {
    display: block;
    background: white;
    border-radius: 16px;
    border: 1px solid rgba(0,0,0,0.05);
    box-shadow: 0 12px 30px rgba(0,0,0,0.08);
    padding: 0.75rem 0;
  }
  .keywords-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.85rem 1rem;
    border: none;
    border-bottom: 1px solid rgba(0,0,0,0.05);
  }
  .keywords-table td:last-child { border-bottom: none; }
  .keywords-table td::before {
    content: attr(data-label);
    flex: 1;
    font-size: 0.65rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #8c8c92;
    font-weight: 600;
    margin-right: 0.8rem;
    white-space: nowrap;
  }
  .keywords-table td[data-label=""]::before { display: none; }
}

@media (max-width: 480px) {
  .keywords-table td { flex-direction: column; align-items: flex-start; }
  .keywords-table td::before { margin-bottom: 0.3rem; }
  .keywords-table td .action-buttons { width: 100%; justify-content: flex-start; }
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

.modal-icon.primary {
  background: linear-gradient(135deg, #FF9500 0%, #FF6B00 100%);
  color: white;
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

/* Seed Modal with Preview */
.seed-modal-content {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 600px;
  width: 95%;
  max-height: 80vh;
  overflow-y: auto;
  text-align: center;
}

.seed-loading {
  padding: 2rem 0;
}

.seed-preview {
  text-align: left;
  margin: 1rem 0 1.5rem 0;
}

.seed-section {
  margin-bottom: 1.25rem;
  padding: 1rem;
  background: #F9F9F9;
  border-radius: 12px;
}

.seed-section-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: center;
}

.seed-words-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.seed-word-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.seed-word-tag.new {
  background: linear-gradient(135deg, #34C759 0%, #32D74B 100%);
  color: white;
}

.seed-word-tag.new .modifier {
  opacity: 0.8;
  font-size: 0.75rem;
}

.seed-word-tag.exists {
  background: #E5E5EA;
  color: #6E6E73;
}

.seed-word-tag.ignored {
  background: #FFF3CD;
  color: #856404;
  text-decoration: line-through;
}

.seed-empty {
  padding: 2rem 0;
  text-align: center;
  color: #6E6E73;
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

  .mobile-sidebar-toggle {
    display: flex;
  }

  .mobile-sidebar-backdrop {
    display: block;
  }

  .dashboard-container {
    grid-template-columns: 1fr;
  }

  .main-content {
    grid-column: 1 / -1;
  }
}

/* Mobile sidebar toggle */
.mobile-sidebar-toggle {
  background: none;
  border: none;
  color: currentColor;
  cursor: pointer;
  padding: 0.5rem !important;
  font-size: 1.25rem;
  line-height: 1;
  margin-bottom: 1rem;
  display: none;
}

.mobile-sidebar-backdrop {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

@media (max-width: 768px) {
  .mobile-sidebar-toggle {
    display: flex !important;
    align-items: center;
    justify-content: center;
  }
}

/* 🗑️ Recently Deleted Modal - Apple Style */
.btn-deleted {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #8E8E93 0%, #636366 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-deleted:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.btn-deleted:active:not(:disabled) {
  transform: scale(0.95);
}

.deleted-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 20px;
  height: 20px;
  background: #FF3B30;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  box-shadow: 0 2px 6px rgba(255, 59, 48, 0.4);
}

.recently-deleted-overlay {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.recently-deleted-modal {
  background: #F2F2F7;
  border-radius: 20px;
  width: 95%;
  max-width: 600px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.35);
}

/* Header */
.rd-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.rd-header-left,
.rd-header-right {
  min-width: 80px;
}

.rd-header-right {
  text-align: right;
}

.rd-close-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #007AFF;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.2s;
}

.rd-close-btn:hover {
  opacity: 0.7;
}

.rd-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1D1D1F;
  margin: 0;
  text-align: center;
}

.rd-action-btn {
  background: none;
  border: none;
  color: #007AFF;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.2s;
}

.rd-action-btn:hover {
  opacity: 0.7;
}

/* Info banner */
.rd-info-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  color: #636366;
}

.rd-info-banner i {
  color: #8E8E93;
}

/* Content */
.rd-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  -webkit-overflow-scrolling: touch;
}

.rd-loading,
.rd-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
  color: #8E8E93;
}

.rd-empty-icon {
  width: 80px;
  height: 80px;
  background: #E5E5EA;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.rd-empty-icon i {
  font-size: 2rem;
  color: #8E8E93;
}

.rd-empty h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1D1D1F;
  margin: 0 0 8px 0;
}

.rd-empty p {
  font-size: 0.9rem;
  color: #8E8E93;
  margin: 0;
}

/* Grid */
.rd-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.rd-item {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: default;
}

.rd-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.rd-item.selected {
  background: #E8F0FE;
  box-shadow: 0 0 0 2px #007AFF;
}

.rd-item-select {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 1.25rem;
  color: #007AFF;
}

/* When select icon is shown, reserve space so it won't overlap text */
.rd-item-select + .rd-item-content {
  padding-left: 28px;
}

.rd-item-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rd-word {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1D1D1F;
  word-break: break-word;
}

.rd-date {
  font-size: 0.8rem;
  color: #8E8E93;
}

.rd-item-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #F2F2F7;
}

.rd-restore-btn,
.rd-delete-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.rd-restore-btn {
  background: #E8F8EF;
  color: #34C759;
}

.rd-restore-btn:hover {
  background: #34C759;
  color: white;
}

.rd-delete-btn {
  background: #FFE5E5;
  color: #FF3B30;
}

.rd-delete-btn:hover {
  background: #FF3B30;
  color: white;
}

/* Footer */
.rd-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.rd-footer-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border: none;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.rd-footer-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.rd-footer-btn.restore,
.rd-footer-btn.restore-all {
  background: linear-gradient(135deg, #34C759 0%, #30D158 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(52, 199, 89, 0.3);
}

.rd-footer-btn.restore:hover:not(:disabled),
.rd-footer-btn.restore-all:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(52, 199, 89, 0.4);
}

.rd-footer-btn.delete,
.rd-footer-btn.delete-all {
  background: linear-gradient(135deg, #FF3B30 0%, #FF453A 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 59, 48, 0.3);
}

.rd-footer-btn.delete:hover:not(:disabled),
.rd-footer-btn.delete-all:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 59, 48, 0.4);
}

/* Dark mode support */
[data-theme="dark"] .recently-deleted-modal {
  background: #1C1C1E;
}

[data-theme="dark"] .rd-header {
  background: rgba(28, 28, 30, 0.9);
  border-color: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .rd-title {
  color: #F5F5F7;
}

[data-theme="dark"] .rd-info-banner {
  background: rgba(44, 44, 46, 0.6);
  color: #AEAEB2;
}

[data-theme="dark"] .rd-empty-icon {
  background: #2C2C2E;
}

[data-theme="dark"] .rd-empty h4 {
  color: #F5F5F7;
}

[data-theme="dark"] .rd-item {
  background: #2C2C2E;
}

[data-theme="dark"] .rd-item.selected {
  background: #1C3A5E;
}

[data-theme="dark"] .rd-word {
  color: #F5F5F7;
}

[data-theme="dark"] .rd-item-actions {
  border-color: #3A3A3C;
}

[data-theme="dark"] .rd-footer {
  background: rgba(28, 28, 30, 0.9);
  border-color: rgba(255, 255, 255, 0.1);
}

/* Responsive */
@media (max-width: 480px) {
  .recently-deleted-modal {
    width: 100%;
    max-width: 100%;
    max-height: 100%;
    border-radius: 0;
  }
  
  .rd-grid {
    grid-template-columns: 1fr;
  }
  
  .rd-footer-btn {
    padding: 12px 16px;
    font-size: 0.9rem;
  }
}
</style>
