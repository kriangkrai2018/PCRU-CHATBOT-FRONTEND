<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <Sidebar :userType="userType" :userInfoObject="userInfoObject" />
    
    <!-- Mobile Sidebar Backdrop -->
    <div v-if="isMobileSidebarOpen" class="mobile-sidebar-backdrop" @click="toggleSidebar" aria-hidden="true"></div>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container-fluid">
        <!-- Mobile Sidebar Toggle -->
        <button v-if="isMobile" class="mobile-sidebar-toggle mobile-inline-toggle" @click.stop="toggleSidebar" :aria-label="isMobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'">
          <i class="bi bi-list"></i>
        </button>
        
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-warning" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">กำลังโหลดข้อมูล...</p>
        </div>

        <div v-else>
          <!-- Header with SVG Animation -->
          <div class="d-block d-md-flex align-items-center justify-content-between mb-4">
            <div class="d-flex align-items-center gap-3">
              <!-- SVG Link Icon Animation -->
              <svg class="synonyms-link-icon" width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Background Circle -->
                <circle cx="32" cy="32" r="30" fill="#ff9500" opacity="0.08"/>
                
                <!-- Link Chain Left -->
                <path class="synonyms-link-chain" 
                  d="M20 28 C20 24, 24 20, 28 20 L32 20 C36 20, 40 24, 40 28 C40 32, 36 36, 32 36 L28 36"
                  stroke="#ff9500" stroke-width="4" stroke-linecap="round" fill="none"/>
                
                <!-- Link Chain Right -->
                <path class="synonyms-link-chain" 
                  d="M44 36 C44 40, 40 44, 36 44 L32 44 C28 44, 24 40, 24 36 C24 32, 28 28, 32 28 L36 28"
                  stroke="#ff9500" stroke-width="4" stroke-linecap="round" fill="none"/>
                
                <!-- Connecting Dots -->
                <g class="synonyms-link-dots">
                  <circle class="synonyms-link-dot synonyms-link-dot-1" cx="26" cy="32" r="2" fill="#ff9500"/>
                  <circle class="synonyms-link-dot synonyms-link-dot-2" cx="32" cy="32" r="2" fill="#ff6b00"/>
                  <circle class="synonyms-link-dot synonyms-link-dot-3" cx="38" cy="32" r="2" fill="#ff9500"/>
                </g>
                
                <!-- Glow Effect -->
                <circle class="synonyms-link-pulse" cx="32" cy="32" r="6" fill="#ff9500" opacity="0.2"/>
              </svg>
              <h2 class="page-title m-0">Manage Synonyms</h2>
            </div>
            
            <div class="mt-3 mt-md-0">
              <button class="btn-add-apple" @click="openAddModal" title="เพิ่มคำพ้องใหม่">
                <i class="bi bi-plus-lg"></i>
                <span>Add Synonym</span>
              </button>
            </div>
          </div>

          <!-- Info Card -->
          <div class="info-card apple-card mb-4 p-4 rounded-4 shadow-apple">
            <!-- SVG Book Icon Animation -->
            <svg class="synonyms-book-icon float-start me-3" width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Book Cover -->
              <rect class="synonyms-book-cover" x="12" y="12" width="48" height="48" rx="3" fill="#ff9500" opacity="0.15"/>
              
              <!-- Book Spine -->
              <rect class="synonyms-book-spine" x="12" y="12" width="6" height="48" rx="1" fill="#ff9500" opacity="0.3"/>
              
              <!-- Pages with Link Symbol -->
              <path class="synonyms-book-page synonyms-book-page-1" d="M22 20 L54 20" stroke="#ff9500" stroke-width="2.5" stroke-linecap="round"/>
              <path class="synonyms-book-page synonyms-book-page-2" d="M22 28 L54 28" stroke="#ff9500" stroke-width="2.5" stroke-linecap="round"/>
              <path class="synonyms-book-page synonyms-book-page-3" d="M22 36 L50 36" stroke="#ff9500" stroke-width="2.5" stroke-linecap="round"/>
              <path class="synonyms-book-page synonyms-book-page-4" d="M22 44 L48 44" stroke="#ff9500" stroke-width="2.5" stroke-linecap="round"/>
              
              <!-- Link Symbol on Book -->
              <circle cx="44" cy="52" r="6" fill="#ff6b00" opacity="0.3"/>
              <path d="M41 52 L47 52" stroke="#ff6b00" stroke-width="2" stroke-linecap="round"/>
              
              <!-- Book Border -->
              <rect x="12" y="12" width="48" height="48" rx="3" stroke="#ff9500" stroke-width="2" fill="none"/>
            </svg>
            
            <h5 class="fw-bold mb-3">คำพ้อง/คำสนับสนุน (Synonyms) คืออะไร?</h5>
            <p class="mb-2 text-muted">
              <strong>Synonyms</strong> คือระบบจับคู่คำที่ผู้ใช้พิมพ์ กับ Keyword หลักในระบบ พร้อมคะแนนความคล้ายคลึง
            </p>
            <ul class="mb-3 text-muted small">
              <li class="d-flex align-items-center gap-2 mb-2">
                <svg class="icon-svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="#ff9500" stroke-width="2"/>
                  <path d="M7 10 L9 12 L13 8" stroke="#ff9500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>เช่น "หอใน" → "หอพัก" (คะแนน 0.95 = ความหมายใกล้เคียงมาก)</span>
              </li>
              <li class="d-flex align-items-center gap-2 mb-2">
                <svg class="icon-svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="#34c759" stroke-width="2"/>
                  <path d="M7 10 L9 12 L13 8" stroke="#34c759" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>ช่วยให้ Chatbot เข้าใจคำที่ผู้ใช้พิมพ์หลากหลายรูปแบบ</span>
              </li>
              <li class="d-flex align-items-center gap-2">
                <svg class="icon-svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="#007aff" stroke-width="2"/>
                  <path d="M10 6 L10 11 M10 14 L10 14.5" stroke="#007aff" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>ปรับจูนคะแนนความคล้ายคลึงได้ตามต้องการ (0.00 - 1.00)</span>
              </li>
            </ul>
            <p class="mb-0 small text-warning fw-bold d-flex align-items-center gap-2">
              <svg class="icon-svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="#ff9500" stroke-width="2"/>
                <path d="M10 6 L10 11" stroke="#ff9500" stroke-width="2" stroke-linecap="round"/>
                <circle cx="10" cy="14" r="1" fill="#ff9500"/>
              </svg>
              <span>ยิ่งคะแนนสูง ยิ่งมีโอกาสจับคู่มากขึ้น!</span>
            </p>
          </div>

          <!-- Stats Cards with SVG Icons -->
          <div class="row g-4 mb-4">
            <!-- Total Synonyms -->
            <div class="col-md-3">
              <div class="stat-card apple-card p-4 rounded-4 shadow-apple text-center">
                <svg class="synonyms-stat-svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle class="synonyms-stat-circle-bg" cx="32" cy="32" r="24" fill="#ff9500" opacity="0.2"/>
                  <path class="synonyms-stat-wave" d="M16 32 Q24 26, 32 32 T48 32" stroke="#ff9500" stroke-width="3" fill="none"/>
                  <circle class="synonyms-link-dot synonyms-link-dot-1" cx="24" cy="32" r="3" fill="#ff9500"/>
                  <circle class="synonyms-link-dot synonyms-link-dot-2" cx="32" cy="32" r="3" fill="#ff6b00"/>
                  <circle class="synonyms-link-dot synonyms-link-dot-3" cx="40" cy="32" r="3" fill="#ff9500"/>
                </svg>
                <div class="stat-number">
                  <transition name="number-change" mode="out-in">
                    <span :key="stats.total">{{ stats.total || 0 }}</span>
                  </transition>
                </div>
                <div class="stat-label">คำพ้องทั้งหมด</div>
              </div>
            </div>
            
            <!-- Active Synonyms -->
            <div class="col-md-3">
              <div class="stat-card apple-card p-4 rounded-4 shadow-apple text-center">
                <svg class="synonyms-stat-svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle class="synonyms-stat-circle-bg" cx="32" cy="32" r="24" fill="#34c759" opacity="0.2"/>
                  <path class="synonyms-stat-checkmark" d="M20 32 L28 40 L44 24" stroke="#34c759" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle class="synonyms-stat-circle" cx="32" cy="32" r="20" stroke="#34c759" stroke-width="3" fill="none"/>
                </svg>
                <div class="stat-number">
                  <transition name="number-change" mode="out-in">
                    <span :key="stats.active">{{ stats.active || 0 }}</span>
                  </transition>
                </div>
                <div class="stat-label">กำลังใช้งาน</div>
              </div>
            </div>
            
            <!-- Average Score -->
            <div class="col-md-3">
              <div class="stat-card apple-card p-4 rounded-4 shadow-apple text-center">
                <svg class="synonyms-stat-svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle class="synonyms-stat-circle-bg" cx="32" cy="32" r="24" fill="#007aff" opacity="0.2"/>
                  <!-- Score Meter -->
                  <path class="synonyms-score-meter" d="M20 44 A16 16 0 1 1 44 44" stroke="#007aff" stroke-width="4" stroke-linecap="round" fill="none"/>
                  <!-- Needle -->
                  <line x1="32" y1="32" x2="32" y2="22" stroke="#007aff" stroke-width="3" stroke-linecap="round"/>
                  <circle cx="32" cy="32" r="4" fill="#007aff"/>
                </svg>
                <div class="stat-number">
                  <transition name="number-change" mode="out-in">
                    <span :key="stats.avgScore">{{ stats.avgScore || '0.00' }}</span>
                  </transition>
                </div>
                <div class="stat-label">คะแนนเฉลี่ย</div>
              </div>
            </div>
            
            <!-- Keywords with Synonyms -->
            <div class="col-md-3">
              <div class="stat-card apple-card p-4 rounded-4 shadow-apple text-center">
                <svg class="synonyms-stat-svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle class="synonyms-stat-circle-bg" cx="32" cy="32" r="24" fill="#5856d6" opacity="0.2"/>
                  <!-- Key Icon -->
                  <circle cx="26" cy="28" r="8" stroke="#5856d6" stroke-width="3" fill="none"/>
                  <path d="M32 34 L44 46 M40 42 L44 46 L40 50" stroke="#5856d6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div class="stat-number">
                  <transition name="number-change" mode="out-in">
                    <span :key="stats.keywordsWithSynonyms">{{ stats.keywordsWithSynonyms || 0 }}</span>
                  </transition>
                </div>
                <div class="stat-label">Keywords ที่มีคำพ้อง</div>
              </div>
            </div>
          </div>

          <!-- Apple Filters -->
          <AppleFilters
            v-model="synFilters"
            :sort-options="synSortOptions"
            :statuses="synStatuses"
            status-label="สถานะ"
            :show-date-range="false"
            :show-date-presets="false"
            :show-number-range="false"
            @change="onFiltersChange"
          />

          <!-- Synonyms Table -->
          <div class="apple-card rounded-4 shadow-apple overflow-hidden mb-4">
            <div class="p-4 border-bottom">
              <div class="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                <div class="d-flex align-items-center gap-2">
                  <svg class="icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="4" width="16" height="16" rx="2" stroke="#ff9500" stroke-width="2"/>
                    <path d="M8 8 L16 8 M8 12 L16 12 M8 16 L12 16" stroke="#ff9500" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <h5 class="fw-bold m-0">Synonyms</h5>
                  <span class="badge bg-warning text-dark ms-2">{{ filteredSynonyms.length }} items</span>
                </div>
                <div class="search-container-table">
                  <svg class="search-icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" stroke="#ff9500" stroke-width="2" />
                    <path d="M16 16 L21 21" stroke="#ff9500" stroke-width="2" stroke-linecap="round" />
                  </svg>
                  <input
                    type="text"
                    class="search-input"
                    placeholder="Search synonym..."
                    v-model="searchQuery"
                  />
                  <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
                    <i class="bi bi-x-circle-fill"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div class="table-responsive">
              <table class="table table-hover mb-0 apple-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>คำที่ผู้ใช้พิมพ์ → Keyword เป้าหมาย</th>
                    <th>คะแนน</th>
                    <th>บทบาท</th>
                    <th>สถานะ</th>
                    <th>การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  <transition-group name="row-fade">
                    <tr v-for="item in paginatedSynonyms" :key="item.SynonymID" class="apple-row">
                      <td class="py-3" data-label="ID">{{ item.SynonymID }}</td>
                      <td class="py-3" data-label="คำที่ผู้ใช้พิมพ์ → Keyword เป้าหมาย">
                        <div class="d-flex align-items-center gap-1">
                          <span class="input-word">{{ item.InputWord }}</span>
                          <svg class="arrow-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M4 10 L14 10 M10 6 L14 10 L10 14" stroke="#ff9500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                          <span class="target-word">{{ item.TargetKeyword || 'N/A' }}</span>
                        </div>
                      </td>
                      <td class="py-3" data-label="คะแนน">
                        <span 
                          class="synonyms-score-badge"
                          :class="getScoreClass(item.SimilarityScore)"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="2"/>
                          </svg>
                          {{ parseFloat(item.SimilarityScore).toFixed(2) }}
                        </span>
                      </td>
                      <td class="py-3" data-label="บทบาท">
                        <span class="synonyms-role-tag">{{ item.RoleDescription || 'คำพ้อง' }}</span>
                      </td>
                      <td class="py-3" data-label="สถานะ">
                        <span 
                          class="synonyms-status-badge"
                          :class="item.IsActive ? 'active' : 'inactive'"
                        >
                          <i :class="item.IsActive ? 'bi bi-check-circle-fill' : 'bi bi-x-circle'"></i>
                          {{ item.IsActive ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                      <td class="py-3" data-label="การดำเนินการ">
                        <div class="d-flex gap-2">
                          <button 
                            class="btn-action"
                            :class="{ inactive: !item.IsActive }"
                            @click="toggleStatus(item)"
                            :title="item.IsActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
                              <path v-if="item.IsActive" d="M5 8 L7 10 L11 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                              <path v-else d="M6 6 L10 10 M10 6 L6 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            </svg>
                          </button>
                          <button 
                            class="btn-action btn-edit" 
                            @click="openEditModal(item)"
                            title="แก้ไข"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M11 2 L14 5 L5 14 L2 14 L2 11 Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                          </button>
                          <button 
                            class="btn-action btn-reject" 
                            @click="confirmDelete(item)"
                            title="ลบ"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M4 4 L12 12 M12 4 L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </transition-group>
                  
                  <!-- Empty State -->
                  <tr v-if="filteredSynonyms.length === 0">
                    <td colspan="6" class="text-center text-muted py-5">
                      <div class="empty-state">
                        <svg class="synonyms-empty-svg" width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle class="synonyms-empty-circle" cx="60" cy="60" r="50" stroke="#ff9500" stroke-width="4" fill="none"/>
                          <!-- Link Symbol -->
                          <path class="synonyms-empty-link" d="M40 55 C40 48, 46 42, 53 42 L58 42 C65 42, 71 48, 71 55" stroke="#ff9500" stroke-width="4" stroke-linecap="round" fill="none"/>
                          <path class="synonyms-empty-link" d="M80 65 C80 72, 74 78, 67 78 L62 78 C55 78, 49 72, 49 65" stroke="#ff9500" stroke-width="4" stroke-linecap="round" fill="none"/>
                          <!-- Sparkles -->
                          <circle class="synonyms-empty-sparkle synonyms-empty-sparkle-1" cx="30" cy="30" r="3" fill="#ffd60a"/>
                          <circle class="synonyms-empty-sparkle synonyms-empty-sparkle-2" cx="90" cy="30" r="3" fill="#ff9500"/>
                          <circle class="synonyms-empty-sparkle synonyms-empty-sparkle-3" cx="90" cy="90" r="3" fill="#ff6b00"/>
                        </svg>
                        <p class="mb-0 mt-3 fw-bold">ไม่พบคำพ้องที่ตรงกับการค้นหา</p>
                        <small>ลองค้นหาด้วยคำอื่น หรือเพิ่มคำพ้องใหม่</small>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination Footer -->
            <div class="d-flex justify-content-between align-items-center p-3 border-top flex-wrap gap-2">
              <div class="small text-muted">
                แสดง {{ startIndex }} ถึง {{ endIndex }} จาก {{ filteredSynonyms.length }} รายการ
              </div>
              <nav aria-label="Page navigation">
                <ul class="pagination mb-0 align-items-center">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="firstPage" aria-label="First">&laquo;</a>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="prevPage" aria-label="Previous">&lsaquo;</a>
                  </li>

                  <li v-for="page in pagesToShow" :key="page" class="page-item" :class="{ active: currentPage === page }">
                    <a class="page-link page-num rounded-3" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
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
    </main>

    <!-- Add/Edit Modal -->
    <div class="modal fade" ref="crudModalRef" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content apple-modal rounded-4 p-3 shadow-lg">
          <div class="modal-header border-0">
            <div class="modal-title w-100 text-center">
              <div class="fs-5 fw-bold">{{ isEditing ? 'แก้ไขคำพ้อง' : 'เพิ่มคำพ้องใหม่' }}</div>
              <div class="text-muted fs-6">{{ isEditing ? 'แก้ไขการจับคู่คำพ้องที่มีอยู่' : 'เพิ่มการจับคู่คำพ้องกับ Keyword หลัก' }}</div>
            </div>
            <button type="button" class="btn-close btn-close-custom" aria-label="Close" @click="hideCrudModal"></button>
          </div>
          
          <div class="modal-body">
            <form @submit.prevent="saveCrudForm">
              <div class="row g-3">
                <!-- Input Word -->
                <div class="col-md-6">
                  <label class="form-label fw-bold">คำที่ผู้ใช้พิมพ์ <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="formData.inputWord" 
                    required 
                    placeholder="เช่น หอใน, เทอม, ค่าเทอม"
                  >
                  <small class="text-muted">คำที่ผู้ใช้มักพิมพ์เข้ามา</small>
                </div>
                
                <!-- Target Keyword -->
                <div class="col-md-6">
                  <label class="form-label fw-bold">Keyword เป้าหมาย <span class="text-danger">*</span></label>
                  <select 
                    class="form-select" 
                    v-model.number="formData.targetKeywordId"
                    required
                  >
                    <option :value="null">-- เลือก Keyword --</option>
                    <option v-for="kw in keywords" :key="kw.KeywordID" :value="kw.KeywordID">
                      {{ kw.KeywordText }}
                    </option>
                  </select>
                  <small class="text-muted">Keyword หลักที่ต้องการจับคู่</small>
                </div>
                
                <!-- Similarity Score Slider -->
                <div class="col-12">
                  <label class="form-label fw-bold">คะแนนความคล้ายคลึง: <span class="text-warning">{{ formData.similarityScore.toFixed(2) }}</span></label>
                  <div style="display: flex; align-items: center; gap: 1rem;">
                    <span class="d-none">{{ formData.similarityScore.toFixed(2) }}</span>
                    <input 
                      type="range" 
                      class="form-range flex-grow-1" 
                      v-model.number="formData.similarityScore"
                      min="0"
                      max="1"
                      step="0.05"
                    >
                  </div>
                  <div class="d-flex justify-content-between small text-muted mt-1">
                    <span>0.00 (ต่ำ)</span>
                    <span>0.50 (กลาง)</span>
                    <span>1.00 (สูง)</span>
                  </div>
                </div>
                
                <!-- Role Description -->
                <div class="col-md-6">
                  <label class="form-label fw-bold">บทบาท/คำอธิบาย</label>
                  <input 
                    type="text" 
                    class="form-control synonyms-form-control" 
                    v-model="formData.roleDescription" 
                    placeholder="เช่น คำพ้อง, คำสนับสนุน, คำย่อ"
                  >
                </div>
                
                <!-- Active Status -->
                <div class="col-md-6">
                  <label class="form-label fw-bold">สถานะ</label>
                  <div class="form-check form-switch mt-2">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      role="switch" 
                      id="activeSwitch"
                      v-model="formData.isActive"
                      style="width: 3rem; height: 1.5rem;"
                    >
                    <label class="form-check-label ms-2" for="activeSwitch">
                      {{ formData.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
                    </label>
                  </div>
                </div>
              </div>
              
              <!-- Error Message -->
              <div v-if="formError" class="alert alert-danger small py-2 mt-3">
                {{ formError }}
              </div>
            </form>
          </div>
          
          <div class="modal-footer border-0 justify-content-center gap-3">
            <button type="button" class="btn btn-secondary rounded-3 px-4" @click="hideCrudModal" :disabled="isSaving">
              ยกเลิก
            </button>
            <button type="button" class="btn btn-primary rounded-3 px-4" @click="saveCrudForm" :disabled="!isFormValid || isSaving">
              <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
              <i v-if="!isSaving" class="bi bi-check-lg me-1"></i>
              {{ isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มคำพ้อง' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Modal Component -->
    <ConfirmModalComponent />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, getCurrentInstance, nextTick } from 'vue';
import { Modal } from 'bootstrap';
import Sidebar from '@/components/Sidebar.vue';
import AppleFilters from '@/components/AppleFilters.vue';
import { bindSidebarResize, isSidebarCollapsed, isMobileSidebarOpen } from '@/stores/sidebarState';
import { useAppleToast } from '@/composables/useAppleToast';
import { useConfirm } from '@/composables/useConfirm';
import '@/assets/sidebar.css';
import '@/assets/manage-synonyms.css';

const { appContext } = getCurrentInstance();
const $axios = appContext.config.globalProperties.$axios;
const $swal = appContext.config.globalProperties.$swal;

// Apple Toast
const { success: toastSuccess, error: toastError } = useAppleToast();

// Confirm Modal
const { confirmAction, ConfirmModalComponent } = useConfirm();

// User info
const userType = ref('Officer');
const userInfoObject = ref({});

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

let unbindSidebarResize = null;

// Data
const loading = ref(true);
const synonyms = ref([]);
const keywords = ref([]);
const stats = ref({
  total: 0,
  active: 0,
  inactive: 0,
  avgScore: '0.00',
  keywordsWithSynonyms: 0
});
const searchQuery = ref('');

// Filters state
const synFilters = ref({
  sortBy: 'id',
  sortOrder: 'asc',
  status: ''
});

const synSortOptions = [
  { value: 'id', label: 'ID' },
  { value: 'inputWord', label: 'คำที่พิมพ์' },
  { value: 'score', label: 'คะแนน' },
];

const synStatuses = [
  { value: 'active', label: 'ใช้งาน', icon: 'bi bi-check-circle-fill', color: 'status-green' },
  { value: 'inactive', label: 'ปิดใช้งาน', icon: 'bi bi-x-circle', color: 'status-gray' },
];

const onFiltersChange = () => {
  currentPage.value = 1;
};

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(5);

// CRUD state
const crudModalRef = ref(null);
let crudModalInstance = null;
const isEditing = ref(false);
const editingId = ref(null);
const isSaving = ref(false);
const formError = ref('');
const formData = ref({
  inputWord: '',
  targetKeywordId: '',
  similarityScore: 0.80,
  roleDescription: 'คำพ้อง',
  isActive: true
});

// ============================================
// Computed Properties
// ============================================
const filteredSynonyms = computed(() => {
  let result = [...synonyms.value];
  
  // Text search filter
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(s => 
      (s.InputWord && s.InputWord.toLowerCase().includes(q)) ||
      (s.TargetKeyword && s.TargetKeyword.toLowerCase().includes(q)) ||
      (s.RoleDescription && s.RoleDescription.toLowerCase().includes(q))
    );
  }
  
  // Status filter
  if (synFilters.value.status) {
    if (synFilters.value.status === 'active') {
      result = result.filter(s => s.IsActive === 1 || s.IsActive === true);
    } else if (synFilters.value.status === 'inactive') {
      result = result.filter(s => s.IsActive === 0 || s.IsActive === false);
    }
  }
  
  // Sorting
  if (synFilters.value.sortBy) {
    result.sort((a, b) => {
      let aVal, bVal;
      switch (synFilters.value.sortBy) {
        case 'id':
          aVal = a.SynonymID || 0;
          bVal = b.SynonymID || 0;
          break;
        case 'inputWord':
          aVal = (a.InputWord || '').toLowerCase();
          bVal = (b.InputWord || '').toLowerCase();
          break;
        case 'score':
          aVal = a.Score || 0;
          bVal = b.Score || 0;
          break;
        default:
          return 0;
      }
      if (aVal < bVal) return synFilters.value.sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return synFilters.value.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  return result;
});

const totalPages = computed(() => Math.ceil(filteredSynonyms.value.length / itemsPerPage.value) || 1);
const startIndex = computed(() => filteredSynonyms.value.length === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1);
const endIndex = computed(() => Math.min(currentPage.value * itemsPerPage.value, filteredSynonyms.value.length));

const paginatedSynonyms = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredSynonyms.value.slice(start, start + itemsPerPage.value);
});

const pagesToShow = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;
  let start = Math.max(1, current - 2);
  let end = Math.min(total, current + 2);
  if (end - start < 4) {
    if (start === 1) end = Math.min(total, 5);
    else start = Math.max(1, total - 4);
  }
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

const isFormValid = computed(() => {
  return formData.value.inputWord?.trim() && formData.value.targetKeywordId;
});

// ============================================
// Lifecycle
// ============================================
onMounted(async () => {
  console.log('🎯 ManageSynonyms component mounted!');
  
  // Mobile resize listener
  const handleResize = () => {
    const newIsMobile = window.innerWidth <= 768;
    if (newIsMobile !== isMobile.value) {
      isMobile.value = newIsMobile;
      if (!newIsMobile && isMobileSidebarOpen.value) {
        // If resized to desktop and mobile sidebar was open, close it
        isMobileSidebarOpen.value = false;
        document.body.classList.remove('sidebar-open', 'sidebar-mobile-expanded');
        isSidebarCollapsed.value = _savedSidebarCollapsed ?? isSidebarCollapsed.value;
        _savedSidebarCollapsed = null;
      }
    }
  };
  
  window.addEventListener('resize', handleResize);
  
  const storedUser = localStorage.getItem('userInfo');
  if (storedUser) {
    try {
      userInfoObject.value = JSON.parse(storedUser);
      userType.value = userInfoObject.value.usertype || 'Officer';
      console.log('✅ User loaded:', userType.value);
    } catch (e) {
      console.error('Error parsing user info:', e);
    }
  }
  
  unbindSidebarResize = bindSidebarResize();
  console.log('📝 Loading keywords...');
  await loadKeywords();
  console.log('📝 Keywords loaded:', keywords.value.length, 'items');
  
  console.log('📝 Refreshing data...');
  await refreshData();
  console.log('📝 Data refreshed');
  
  // Cleanup function stored for onUnmounted
  onUnmounted.cleanup = () => window.removeEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (unbindSidebarResize) unbindSidebarResize();
  isMobileSidebarOpen.value = false;
  document.body.classList.remove('sidebar-open', 'sidebar-mobile-expanded');
  if (crudModalInstance) {
    crudModalInstance.dispose();
    crudModalInstance = null;
  }
  if (onUnmounted.cleanup) onUnmounted.cleanup();
});

// ============================================
// Pagination Methods
// ============================================
function firstPage() { currentPage.value = 1; }
function prevPage() { if (currentPage.value > 1) currentPage.value--; }
function nextPage() { if (currentPage.value < totalPages.value) currentPage.value++; }
function lastPage() { currentPage.value = totalPages.value; }
function goToPage(page) { currentPage.value = page; }

// ============================================
// API Calls
// ============================================
async function loadKeywords() {
  try {
    const res = await $axios.get('/keywords/public');
    const data = res.data?.data || res.data || [];
    keywords.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error loading keywords:', error);
    keywords.value = [];
  }
}

async function refreshData() {
  loading.value = true;
  try {
    console.log('🔄 Fetching synonyms and stats...');
    const [synonymsRes, statsRes] = await Promise.all([
      $axios.get('/synonyms'),
      $axios.get('/synonyms/stats')
    ]);
    
    console.log('✅ Synonyms response:', synonymsRes.data);
    console.log('✅ Stats response:', statsRes.data);
    
    const synonymsData = synonymsRes.data?.data || synonymsRes.data || [];
    synonyms.value = Array.isArray(synonymsData) ? synonymsData : [];
    
    console.log('✅ Set synonyms.value:', synonyms.value.length, 'items');
    
    const statsData = statsRes.data?.data || statsRes.data || {};
    stats.value = {
      total: statsData.total || 0,
      active: statsData.active || 0,
      inactive: statsData.inactive || 0,
      avgScore: statsData.avgScore || '0.00',
      keywordsWithSynonyms: statsData.keywordsWithSynonyms || 0
    };
    
    console.log('✅ Stats updated:', stats.value);
    
    // Reset to first page after refresh
    currentPage.value = 1;
    
  } catch (error) {
    console.error('❌ Error loading data:', error);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error message:', error.response?.data?.message || error.message);
    toastError('โหลดข้อมูลไม่สำเร็จ: ' + (error.response?.data?.message || error.message));
  } finally {
    loading.value = false;
  }
}

// ============================================
// Helper Functions
// ============================================
function getScoreClass(score) {
  const s = parseFloat(score);
  if (s >= 0.8) return 'score-high';
  if (s >= 0.5) return 'score-medium';
  return 'score-low';
}

// ============================================
// CRUD Modal
// ============================================
function openAddModal() {
  isEditing.value = false;
  editingId.value = null;
  formData.value = {
    inputWord: '',
    targetKeywordId: '',
    similarityScore: 0.80,
    roleDescription: 'คำพ้อง',
    isActive: true
  };
  formError.value = '';
  showCrudModal();
}

function openEditModal(item) {
  isEditing.value = true;
  editingId.value = item.SynonymID;
  formData.value = {
    inputWord: item.InputWord || '',
    targetKeywordId: item.TargetKeywordID || null,
    similarityScore: parseFloat(item.SimilarityScore) || 0.80,
    roleDescription: item.RoleDescription || 'คำพ้อง',
    isActive: !!item.IsActive
  };
  formError.value = '';
  nextTick(() => {
    showCrudModal();
  });
}

function showCrudModal() {
  if (!crudModalInstance && crudModalRef.value) {
    crudModalInstance = new Modal(crudModalRef.value);
  }
  crudModalInstance?.show();
}

function hideCrudModal() {
  crudModalInstance?.hide();
}

async function saveCrudForm() {
  if (!formData.value.inputWord?.trim()) {
    formError.value = 'กรุณาระบุคำที่ผู้ใช้พิมพ์';
    return;
  }
  if (!formData.value.targetKeywordId) {
    formError.value = 'กรุณาเลือก Keyword เป้าหมาย';
    return;
  }
  
  isSaving.value = true;
  formError.value = '';
  
  const payload = {
    inputWord: formData.value.inputWord.trim(),
    targetKeywordId: formData.value.targetKeywordId,
    similarityScore: formData.value.similarityScore,
    roleDescription: formData.value.roleDescription || 'คำพ้อง',
    isActive: formData.value.isActive
  };
  
  try {
    if (isEditing.value) {
      await $axios.put(`/synonyms/${editingId.value}`, payload);
      toastSuccess('แก้ไขคำพ้องสำเร็จ');
    } else {
      await $axios.post('/synonyms', payload);
      toastSuccess('เพิ่มคำพ้องสำเร็จ');
    }
    
    hideCrudModal();
    await refreshData();
  } catch (error) {
    const msg = error.response?.data?.message || error.message;
    formError.value = msg;
    toastError('ไม่สำเร็จ: ' + msg);
  } finally {
    isSaving.value = false;
  }
}

// ============================================
// Toggle Status
// ============================================
async function toggleStatus(item) {
  try {
    const response = await $axios.patch(`/synonyms/${item.SynonymID}/toggle`);
    console.log('✅ Toggle response:', response.data);
    toastSuccess(item.IsActive ? 'ปิดใช้งานแล้ว' : 'เปิดใช้งานแล้ว');
    
    // Update local state immediately
    item.IsActive = !item.IsActive;
    
    // Then refresh to sync from server
    await refreshData();
  } catch (error) {
    console.error('❌ Toggle error:', error);
    toastError('ไม่สำเร็จ: ' + (error.response?.data?.message || error.message));
  }
}

// ============================================
// Delete
// ============================================
async function confirmDelete(item) {
  try {
    await confirmAction({
      title: 'ยืนยันการลบ',
      message: `คุณต้องการลบคำพ้อง "<strong>${item.InputWord}</strong> → <strong>${item.TargetKeyword || 'N/A'}</strong>" หรือไม่?`,
      variant: 'danger',
      confirmText: 'ลบ',
      loadingText: 'กำลังลบ...',
      onConfirm: async () => {
        await $axios.delete(`/synonyms/${item.SynonymID}`);
        toastSuccess('ลบคำพ้องสำเร็จ');
        await refreshData();
      }
    });
  } catch (error) {
    toastError('ลบไม่สำเร็จ: ' + (error.response?.data?.message || error.message));
  }
}
</script>

<style scoped>
@import '@/assets/dashboard-styles.css';
@import '@/assets/main.css';
@import '@/assets/manage-synonyms.css';

.mobile-sidebar-toggle {
  display: none;
  background: #fff;
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  padding: 0.6rem 0.8rem;
  font-size: 1.4rem;
  line-height: 1;
  margin-left: 1rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
  color: #007AFF;
}

.mobile-sidebar-backdrop {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

@media (max-width: 768px) {
  .mobile-sidebar-toggle {
    display: flex !important;
    align-items: center;
    justify-content: center;
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

.table-responsive {
  overflow-x: hidden;
}

.apple-table {
  min-width: 0;
}

@media (max-width: 992px) {
  .table-responsive {
    overflow-x: hidden;
  }
}

@media (max-width: 768px) {
  .apple-table {
    display: block;
    border: none;
  }
  .apple-table thead {
    display: none;
  }
  .apple-table tbody {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .apple-table tbody tr {
    display: block;
    background: white;
    border-radius: 16px;
    border: 1px solid rgba(0,0,0,0.05);
    box-shadow: 0 12px 30px rgba(0,0,0,0.08);
    padding: 0.75rem 0;
  }
  .apple-table tbody td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border: none;
    border-bottom: 1px solid rgba(0,0,0,0.05);
    text-align: left;
  }
  .apple-table tbody td:last-child {
    border-bottom: none;
  }
  .apple-table tbody td::before {
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
  .apple-table tbody td[data-label=""]::before {
    display: none;
  }
  .apple-table tbody td .d-flex {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .apple-table tbody td {
    flex-direction: column;
    align-items: flex-start;
  }
  .apple-table tbody td::before {
    margin-bottom: 0.35rem;
  }
  .apple-table tbody td .btn-action {
    width: 42px;
    height: 42px;
  }
}
</style>
