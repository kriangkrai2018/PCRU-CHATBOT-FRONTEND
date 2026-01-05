<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <Sidebar :userType="userType" :userInfoObject="userInfoObject" />
    
    <!-- Mobile Sidebar Backdrop -->
    <div v-if="isMobileSidebarOpen" class="mobile-sidebar-backdrop" @click="toggleSidebar" aria-hidden="true"></div>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container-fluid">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">กำลังโหลดข้อมูล...</p>
        </div>

        <div v-else>
          <!-- Header Section -->
          <div class="header-section my-4">
            <div class="header-top d-flex align-items-center gap-3 mb-3">
              <button class="mobile-sidebar-toggle mobile-inline-toggle" @click.stop="toggleSidebar" :aria-label="isMobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'">
                <i :class="isMobileSidebarOpen ? 'bi bi-x' : 'bi bi-list'"></i>
              </button>

              <svg class="brain-icon" width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Background Circle -->
                <circle cx="32" cy="32" r="30" fill="#007aff" opacity="0.08"/>
                
                <!-- Filter Funnel -->
                <path class="brain-outline brain-left" 
                  d="M 14 16 L 50 16 L 38 32 L 38 48 L 26 52 L 26 32 Z"
                  stroke="#007aff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                
                <!-- Filter Lines -->
                <path class="brain-wrinkle wrinkle-1" 
                  d="M 20 22 L 44 22" 
                  stroke="#007aff" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                <path class="brain-wrinkle wrinkle-2" 
                  d="M 24 28 L 40 28" 
                  stroke="#007aff" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                
                <!-- Dots -->
                <g class="neuron-group">
                  <circle class="neuron-glow" cx="32" cy="22" r="6" fill="#007aff" opacity="0.2"/>
                  <circle class="neuron neuron-1" cx="32" cy="22" r="3" fill="#007aff"/>
                </g>
                <g class="neuron-group">
                  <circle class="neuron-glow" cx="32" cy="40" r="6" fill="#ff9500" opacity="0.2"/>
                  <circle class="neuron neuron-2" cx="32" cy="40" r="3" fill="#ff9500"/>
                </g>
              </svg>

              <h2 class="page-title m-0">Manage Stopwords</h2>
              
              <div class="header-actions d-flex gap-2 ms-auto">
                <button class="btn-seed" @click="confirmSeed" :disabled="isSeeding" title="เติมคำมาตรฐานอัตโนมัติ">
                  <i class="bi bi-magic"></i>
                  <span class="d-none d-sm-inline">เติมอัตโนมัติ</span>
                </button>
                <button class="btn-add-apple" @click="openAddModal" title="เพิ่ม Stopword ใหม่">
                  <i class="bi bi-plus-lg"></i>
                  <span class="d-none d-sm-inline">Add Stopword</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Info Card: อธิบายระบบแบบง่าย -->
          <div class="info-card apple-card mb-4 p-4 rounded-4 shadow-apple">
            <!-- SVG Book Icon Animation -->
            <svg class="book-icon float-start me-3" width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Book Cover/Background -->
              <rect class="book-cover" x="12" y="12" width="48" height="48" rx="3" fill="#007aff" opacity="0.15"/>
              
              <!-- Book Spine -->
              <rect class="book-spine" x="12" y="12" width="6" height="48" rx="1" fill="#007aff" opacity="0.3"/>
              
              <!-- Pages -->
              <path class="book-page page-1" d="M22 20 L54 20" stroke="#007aff" stroke-width="2.5" stroke-linecap="round"/>
              <path class="book-page page-2" d="M22 28 L54 28" stroke="#007aff" stroke-width="2.5" stroke-linecap="round"/>
              <path class="book-page page-3" d="M22 36 L50 36" stroke="#007aff" stroke-width="2.5" stroke-linecap="round"/>
              <path class="book-page page-4" d="M22 44 L48 44" stroke="#007aff" stroke-width="2.5" stroke-linecap="round"/>
              <path class="book-page page-5" d="M22 52 L46 52" stroke="#007aff" stroke-width="2.5" stroke-linecap="round"/>
              
              <!-- Book Border -->
              <rect x="12" y="12" width="48" height="48" rx="3" stroke="#007aff" stroke-width="2" fill="none"/>
              
              <!-- Bookmark -->
              <rect class="bookmark" x="52" y="12" width="4" height="20" fill="#ff9500"/>
            </svg>
            <h5 class="fw-bold mb-3">Stopwords คืออะไร?</h5>
            <p class="mb-2 text-muted">
              <strong>Stopwords</strong> คือคำที่ระบบจะไม่นำมาใช้ในการจับคู่คำถาม เช่น "ผม", "อยาก", "ที่", "จะ", "ขอ" เพื่อให้การค้นหาแม่นยำขึ้น
            </p>
            <ul class="mb-3 text-muted small">
              <li class="d-flex align-items-center gap-2 mb-2">
                <span>คำที่อยู่ในรายการนี้จะถูกตัดออกก่อนประมวลผลคำถาม</span>
              </li>
              <li class="d-flex align-items-center gap-2 mb-2">
                <svg class="icon-svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="#34c759" stroke-width="2"/>
                  <path class="checkmark-path" d="M6 10 L9 13 L14 7" stroke="#34c759" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>คำที่อยู่ในตาราง <strong>Keywords</strong> จะถูกป้องกันอัตโนมัติ (ไม่ถูกกรอง)</span>
              </li>
              <li class="d-flex align-items-center gap-2">
                <svg class="icon-svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path class="broom-handle" d="M8 2 L6 10" stroke="#ff9500" stroke-width="2" stroke-linecap="round"/>
                  <path class="broom-bristles" d="M4 10 Q6 12, 8 10 Q10 12, 12 10" stroke="#ff9500" stroke-width="2" fill="none"/>
                  <circle class="sparkle-dot sparkle-1" cx="14" cy="6" r="1" fill="#ffd60a"/>
                  <circle class="sparkle-dot sparkle-2" cx="16" cy="8" r="1" fill="#ffd60a"/>
                </svg>
                <span>เพิ่ม/ลบ stopword ได้ตามต้องการ</span>
              </li>
            </ul>
            <p class="mb-0 small text-success fw-bold d-flex align-items-center gap-2">
              <svg class="icon-svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="#34c759" stroke-width="2"/>
                <path class="lightbulb-filament" d="M10 6 L10 11" stroke="#ffd60a" stroke-width="2" stroke-linecap="round"/>
                <path d="M8 14 L12 14" stroke="#34c759" stroke-width="2" stroke-linecap="round"/>
                <circle class="bulb-glow" cx="10" cy="8" r="4" fill="#ffd60a" opacity="0.3"/>
              </svg>
              <span>ระบบโหลด stopwords จาก pythainlp แล้ว สามารถเพิ่ม/ลบได้ที่นี่</span>
            </p>
          </div>

          <!-- Stats Cards with SVG Icons -->
          <div class="row g-4 mb-4">
            <div class="col-md-3">
              <div class="stat-card apple-card p-4 rounded-4 shadow-apple text-center">
                <!-- SVG Total Icon -->
                <svg class="stat-svg" width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle class="stat-circle-bg" cx="32" cy="32" r="24" fill="#007aff" opacity="0.2"/>
                  <path class="stat-brain-wave" d="M16 32 Q20 28, 24 32 T32 32 T40 32 T48 32" stroke="#007aff" stroke-width="3" fill="none"/>
                  <circle class="stat-dot stat-dot-1" cx="24" cy="32" r="2" fill="#007aff"/>
                  <circle class="stat-dot stat-dot-2" cx="32" cy="32" r="2" fill="#007aff"/>
                  <circle class="stat-dot stat-dot-3" cx="40" cy="32" r="2" fill="#007aff"/>
                </svg>
                <div class="stat-number">
                  <transition name="number-change" mode="out-in">
                    <span :key="stats.total">{{ stats.total || 0 }}</span>
                  </transition>
                </div>
                <div class="stat-label">Stopwords ทั้งหมด</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card apple-card p-4 rounded-4 shadow-apple text-center">
                <!-- SVG Protected Icon -->
                <svg class="stat-svg" width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle class="stat-circle-bg" cx="32" cy="32" r="24" fill="#34c759" opacity="0.2"/>
                  <path class="stat-checkmark" d="M20 32 L28 40 L44 24" stroke="#34c759" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle class="stat-circle" cx="32" cy="32" r="20" stroke="#34c759" stroke-width="3" fill="none"/>
                </svg>
                <div class="stat-number">
                  <transition name="number-change" mode="out-in">
                    <span :key="stats.protected">{{ stats.protected || 0 }}</span>
                  </transition>
                </div>
                <div class="stat-label">ป้องกันโดย Keywords</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card apple-card p-4 rounded-4 shadow-apple text-center">
                <!-- SVG Negative Keyword Icon -->
                <svg class="stat-svg" width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle class="stat-circle-bg" cx="32" cy="32" r="24" fill="#af52de" opacity="0.2"/>
                  <circle class="stat-circle" cx="32" cy="32" r="18" stroke="#af52de" stroke-width="3" fill="none"/>
                  <path d="M24 32 L40 32" stroke="#af52de" stroke-width="4" stroke-linecap="round"/>
                </svg>
                <div class="stat-number">
                  <transition name="number-change" mode="out-in">
                    <span :key="stats.negativeProtected">{{ stats.negativeProtected || 0 }}</span>
                  </transition>
                </div>
                <div class="stat-label">ป้องกันโดย คำปฏิเสธ</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card apple-card p-4 rounded-4 shadow-apple text-center">
                <!-- SVG Filter Icon -->
                <svg class="stat-svg" width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle class="stat-circle-bg" cx="32" cy="32" r="24" fill="#ff9500" opacity="0.2"/>
                  <path class="stat-clock-hand" d="M22 20 L42 20 L36 32 L36 44 L28 46 L28 32 Z" stroke="#ff9500" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                </svg>
                <div class="stat-number">
                  <transition name="number-change" mode="out-in">
                    <span :key="stats.active">{{ stats.active || 0 }}</span>
                  </transition>
                </div>
                <div class="stat-label">กำลังใช้งาน (Active)</div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <!-- Quick actions removed to keep single Add button in header -->

          <!-- Filters Section -->
          <AppleFilters
            v-model="swFilters"
            :sort-options="swSortOptions"
            :statuses="swStatuses"
            status-label="สถานะ"
            :show-date-range="false"
            :show-date-presets="false"
            :show-number-range="false"
            class="mb-4"
            @change="onFiltersChange"
          />

          <!-- Stopwords Table -->
          <div class="apple-card rounded-4 shadow-apple overflow-hidden mb-4">
            <div class="p-4 border-bottom">
              <div class="d-flex align-items-center justify-content-between gap-2">
                <div class="d-flex align-items-center gap-2">
                  <svg class="icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="4" width="16" height="16" rx="2" stroke="#007aff" stroke-width="2"/>
                    <path d="M8 8 L16 8 M8 12 L16 12 M8 16 L12 16" stroke="#007aff" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <h5 class="fw-bold m-0">Stopwords</h5>
                  <span class="badge bg-secondary ms-2">{{ filteredStopwords.length }} items</span>
                </div>
                <div class="search-container-table ms-3" style="min-width:260px; max-width:420px; width:40%">
                  <svg class="search-icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" stroke="#007aff" stroke-width="2" />
                    <path d="M16 16 L21 21" stroke="#007aff" stroke-width="2" stroke-linecap="round" />
                  </svg>
                  <input
                    type="text"
                    class="search-input"
                    placeholder="Search stopword..."
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
                    <th>ลำดับ</th>
                    <th>คำ (Stopword)</th>
                    <th>สถานะ</th>
                    <th>การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  <transition-group name="row-fade">
                    <tr v-for="item in paginatedStopwords" :key="item.StopwordID" class="apple-row">
                      <td class="py-3" data-label="ลำดับ">{{ item.RowNum }}</td>
                      <td class="py-3 fw-bold" data-label="คำ">{{ item.StopwordText }}</td>
                      <td class="py-3" data-label="สถานะ">
                        <div class="d-flex flex-column gap-1">
                          <span v-if="item.isProtected" class="badge bg-success">
                            <i class="bi bi-shield-check me-1"></i> ป้องกันโดย Keywords
                          </span>
                          <span v-if="item.isNegativeKeyword" class="badge bg-danger">
                            <i class="bi bi-dash-circle me-1"></i> ป้องกันโดย Negative Keywords
                          </span>
                          <span v-if="!item.isProtected && !item.isNegativeKeyword" class="badge bg-warning text-dark">
                            <i class="bi bi-funnel me-1"></i> กำลังกรอง
                          </span>
                        </div>
                      </td>
                      <td class="py-3" data-label="การดำเนินการ">
                        <div class="d-flex gap-2">
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
                  <tr v-if="filteredStopwords.length === 0">
                    <td colspan="4" class="text-center text-muted py-5">
                      <div class="empty-state">
                        <!-- SVG Empty State Animation -->
                        <svg class="empty-svg" width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle class="empty-circle" cx="60" cy="60" r="50" stroke="#007aff" stroke-width="4" fill="none"/>
                          <path class="empty-checkmark" d="M40 60 L55 75 L80 45" stroke="#007aff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
                          <circle class="empty-sparkle sparkle-1" cx="30" cy="30" r="3" fill="#ffd60a"/>
                          <circle class="empty-sparkle sparkle-2" cx="90" cy="30" r="3" fill="#ff9500"/>
                          <circle class="empty-sparkle sparkle-3" cx="90" cy="90" r="3" fill="#007aff"/>
                        </svg>
                        <p class="mb-0 mt-3 fw-bold">ไม่พบ stopword ที่ตรงกับการค้นหา</p>
                        <small>ลองค้นหาด้วยคำอื่น หรือเพิ่ม stopword ใหม่</small>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination footer -->
            <div class="d-flex justify-content-between align-items-center p-3 border-top">
              <div class="small text-muted">
                แสดง {{ startIndex }} ถึง {{ endIndex }} จาก {{ filteredStopwords.length }} รายการ
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
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content apple-modal rounded-4 p-3 shadow-lg">
          <div class="modal-header border-0">
            <div class="modal-title w-100 text-center" id="crudModalLabel">
              <div class="fs-5 fw-bold">{{ isEditing ? 'แก้ไข Stopword' : 'เพิ่ม Stopword ใหม่' }}</div>
              <div class="text-muted fs-6">{{ isEditing ? 'แก้ไขคำกรองที่มีอยู่' : 'เพิ่มคำที่ต้องการกรองออก' }}</div>
            </div>
            <button type="button" class="btn-close btn-close-custom" aria-label="Close" @click="hideCrudModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveCrudForm">
              <div class="mb-3">
                <label class="form-label fw-bold">Stopword <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control form-control-lg" 
                  v-model="formData.StopwordText" 
                  required 
                  placeholder="เช่น ผม, อยาก, ที่, จะ"
                  :disabled="isEditing"
                >
                <small class="text-muted">คำนี้จะถูกตัดออกก่อนประมวลผลคำถาม</small>
              </div>
              <div v-if="formError" class="alert alert-danger small py-2">
                {{ formError }}
              </div>
            </form>
          </div>
          <div class="modal-footer border-0 justify-content-center gap-3">
            <button type="button" class="btn btn-secondary rounded-3 px-4" @click="hideCrudModal" :disabled="isSaving">
              ยกเลิก
            </button>
            <button type="button" class="btn btn-primary rounded-3 px-4" @click="saveCrudForm" :disabled="!formData.StopwordText || isSaving">
              <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
              <i v-if="!isSaving" class="bi bi-check-lg me-1"></i>
              {{ isEditing ? 'บันทึกการแก้ไข' : 'เพิ่ม Stopword' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Seed Confirmation Modal with Preview -->
    <Teleport to="body">
      <div v-if="showSeedModal" class="modal-overlay" @click.self="showSeedModal = false">
        <div class="apple-modal-card seed-modal-content">
          <div class="modal-icon primary">
            <i class="bi bi-magic"></i>
          </div>
          <h3 class="modal-title">เติมคำอัตโนมัติ</h3>
          
          <!-- Loading -->
          <div v-if="seedModal.loading" class="seed-loading">
            <div class="loading-spinner"></div>
            <p class="mt-2 text-muted">กำลังโหลดรายการคำ...</p>
          </div>
          
          <!-- Preview content -->
          <div v-else class="seed-preview">
            <!-- Words to add -->
            <div v-if="seedModal.toAdd.length > 0" class="seed-section">
              <h4 class="seed-section-title text-success">
                <i class="bi bi-plus-circle-fill me-2"></i>
                คำที่จะเพิ่มใหม่ ({{ seedModal.toAdd.length }} คำ)
              </h4>
              <div class="seed-words-list">
                <span v-for="word in seedModal.toAdd" :key="word" class="seed-word-tag new">
                  {{ word }}
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
                <span v-for="word in seedModal.alreadyExists" :key="word" class="seed-word-tag exists">
                  {{ word }}
                </span>
              </div>
            </div>
            
            <!-- Empty state -->
            <div v-if="seedModal.toAdd.length === 0" class="seed-empty">
              <i class="bi bi-check-circle-fill text-success" style="font-size: 2rem;"></i>
              <p class="mt-2 mb-0">ข้อมูลครบถ้วนแล้ว ไม่มีคำใหม่ที่ต้องเพิ่ม</p>
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="btn-secondary" @click="showSeedModal = false">ยกเลิก</button>
            <button 
              class="btn-primary-apple" 
              @click="seedStopwords" 
              :disabled="isSeeding || seedModal.toAdd.length === 0"
            >
              {{ isSeeding ? 'กำลังเติม...' : `เพิ่ม ${seedModal.toAdd.length} คำ` }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Confirm Modal Component -->
    <ConfirmModalComponent />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, getCurrentInstance } from 'vue';
import { Modal } from 'bootstrap';
import Sidebar from '@/components/Sidebar.vue';
import AppleFilters from '@/components/AppleFilters.vue';
import { bindSidebarResize, isSidebarCollapsed, isMobileSidebarOpen } from '@/stores/sidebarState';
import { useAppleToast } from '@/composables/useAppleToast';
import { useConfirm } from '@/composables/useConfirm';
import '@/assets/sidebar.css';

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
const stopwords = ref([]);
const keywords = ref([]);
const stats = ref({ total: 0, protected: 0, negativeProtected: 0, active: 0 });
const searchQuery = ref('');

// Filters state
const swFilters = ref({
  sortBy: 'id',
  sortOrder: 'desc',
  status: ''
});

const swSortOptions = [
  { value: 'id', label: 'ID' },
  { value: 'word', label: 'คำ' },
];

const swStatuses = [
  { value: 'protected', label: 'ป้องกันโดย Keywords', icon: 'bi bi-shield-check', color: 'status-green' },
  { value: 'negative', label: 'ป้องกันโดย Negative', icon: 'bi bi-dash-circle', color: 'status-red' },
  { value: 'active', label: 'กำลังกรอง', icon: 'bi bi-funnel', color: 'status-orange' },
];

const onFiltersChange = () => {
  currentPage.value = 1;
};

// Seed modal state
const showSeedModal = ref(false);
const isSeeding = ref(false);
const seedModal = ref({
  loading: false,
  toAdd: [],
  alreadyExists: [],
  totalStandard: 0
});

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(5);

// Action states
const actionLoading = ref(null);
const actionMessage = ref('');
const actionMessageClass = ref('text-success');

// CRUD state
const crudModalRef = ref(null);
let crudModalInstance = null;
const isEditing = ref(false);
const editingId = ref(null);
const isSaving = ref(false);
const formError = ref('');
const formData = ref({
  StopwordText: ''
});

// Computed
const filteredStopwords = computed(() => {
  let result = [...stopwords.value];
  
  // Search filter
  const q = (searchQuery.value || '').toLowerCase();
  if (q) {
    result = result.filter(s => s.StopwordText && s.StopwordText.toLowerCase().includes(q));
  }
  
  // Status filter
  if (swFilters.value.status === 'protected') {
    result = result.filter(s => s.isProtected);
  } else if (swFilters.value.status === 'negative') {
    result = result.filter(s => s.isNegativeKeyword);
  } else if (swFilters.value.status === 'active') {
    result = result.filter(s => !s.isProtected && !s.isNegativeKeyword);
  }
  
  // Sorting
  const sortBy = swFilters.value.sortBy;
  const sortOrder = swFilters.value.sortOrder;
  result.sort((a, b) => {
    let valA, valB;
    if (sortBy === 'id') {
      valA = Number(a.StopwordID) || 0;
      valB = Number(b.StopwordID) || 0;
    } else if (sortBy === 'word') {
      valA = (a.StopwordText || '').toLowerCase();
      valB = (b.StopwordText || '').toLowerCase();
    } else {
      valA = a.StopwordID;
      valB = b.StopwordID;
    }
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  
  return result;
});

const totalPages = computed(() => Math.ceil(filteredStopwords.value.length / itemsPerPage.value) || 1);
const startIndex = computed(() => filteredStopwords.value.length === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1);
const endIndex = computed(() => Math.min(currentPage.value * itemsPerPage.value, filteredStopwords.value.length));
const paginatedStopwords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredStopwords.value.slice(start, start + itemsPerPage.value);
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

// Pagination methods
function firstPage() { currentPage.value = 1; }
function prevPage() { if (currentPage.value > 1) currentPage.value--; }
function nextPage() { if (currentPage.value < totalPages.value) currentPage.value++; }
function lastPage() { currentPage.value = totalPages.value; }
function goToPage(page) { currentPage.value = page; }

// Load user info
onMounted(async () => {
  const storedUser = localStorage.getItem('userInfo');
  if (storedUser) {
    try {
      userInfoObject.value = JSON.parse(storedUser);
      userType.value = userInfoObject.value.usertype || 'Officer';
    } catch (e) {
      console.error('Error parsing user info:', e);
    }
  }
  
  unbindSidebarResize = bindSidebarResize();
  await refreshData();
  
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
  if (unbindSidebarResize) unbindSidebarResize();
  if (crudModalInstance) {
    crudModalInstance.dispose();
    crudModalInstance = null;
  }
  isMobileSidebarOpen.value = false;
  document.body.classList.remove('sidebar-open');
  document.body.classList.remove('sidebar-mobile-expanded');
});

// API calls
async function refreshData() {
  loading.value = true;
  actionLoading.value = 'refresh';
  try {
    const [stopwordsRes, keywordsRes] = await Promise.all([
      $axios.get('/stopwords/public'),
      $axios.get('/keywords/public')
    ]);
    
    // Try to get negative keywords (may need auth)
    let negativeKeywordsData = [];
    try {
      const negativeKeywordsRes = await $axios.get('/negativekeywords');
      negativeKeywordsData = negativeKeywordsRes.data?.data || negativeKeywordsRes.data || [];
    } catch (nkErr) {
      console.warn('Could not load negative keywords:', nkErr.message);
    }
    
    // API returns { success: true, data: [...] }
    const stopwordsData = stopwordsRes.data?.data || stopwordsRes.data || [];
    const keywordsData = keywordsRes.data?.data || keywordsRes.data || [];
    
    const kwSet = new Set((Array.isArray(keywordsData) ? keywordsData : []).map(k => (k.KeywordText || '').toLowerCase()));
    // Negative keywords use "Word" field and "IsActive" field
    const nkwList = (Array.isArray(negativeKeywordsData) ? negativeKeywordsData : [])
      .filter(k => k.IsActive === 1)
      .map(k => (k.Word || '').toLowerCase())
      .filter(w => w.length > 0);
    
    // Helper function to check if stopword contains any negative keyword
    const containsNegativeKeyword = (stopwordText) => {
      const text = (stopwordText || '').toLowerCase();
      return nkwList.some(nkw => text.includes(nkw));
    };
    
    stopwords.value = (Array.isArray(stopwordsData) ? stopwordsData : []).map(s => ({
      ...s,
      isProtected: kwSet.has((s.StopwordText || '').toLowerCase()),
      isNegativeKeyword: containsNegativeKeyword(s.StopwordText)
    }));
    
    keywords.value = Array.isArray(keywordsData) ? keywordsData : [];
    
    // Calculate stats
    stats.value = {
      total: stopwords.value.length,
      protected: stopwords.value.filter(s => s.isProtected).length,
      negativeProtected: stopwords.value.filter(s => s.isNegativeKeyword && !s.isProtected).length,
      active: stopwords.value.filter(s => !s.isProtected && !s.isNegativeKeyword).length
    };
    
    showMessage('โหลดข้อมูลสำเร็จ', 'success');
  } catch (error) {
    console.error('Error loading data:', error);
    showMessage('โหลดข้อมูลไม่สำเร็จ: ' + (error.response?.data?.message || error.message), 'error');
  } finally {
    loading.value = false;
    actionLoading.value = null;
  }
}

// CRUD Modal
function openAddModal() {
  isEditing.value = false;
  editingId.value = null;
  formData.value = { StopwordText: '' };
  formError.value = '';
  showCrudModal();
}

function openEditModal(item) {
  isEditing.value = true;
  editingId.value = item.StopwordID;
  formData.value = { StopwordText: item.StopwordText };
  formError.value = '';
  showCrudModal();
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
  if (!formData.value.StopwordText?.trim()) {
    formError.value = 'กรุณาระบุคำ';
    return;
  }
  
  isSaving.value = true;
  formError.value = '';
  
  try {
    if (isEditing.value) {
      // Edit mode - for stopwords, we delete old and add new
      await $axios.delete(`/stopwords/${editingId.value}`);
      await $axios.post('/stopwords', { text: formData.value.StopwordText.trim().toLowerCase() });
      toastSuccess('แก้ไข Stopword สำเร็จ');
    } else {
      // Add mode
      await $axios.post('/stopwords', { text: formData.value.StopwordText.trim().toLowerCase() });
      toastSuccess('เพิ่ม Stopword สำเร็จ');
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

async function confirmDelete(item) {
  try {
    await confirmAction({
      title: 'ยืนยันการลบ',
      message: `คุณต้องการลบ stopword "<strong>${item.StopwordText}</strong>" หรือไม่?`,
      variant: 'danger',
      confirmText: 'ลบ',
      loadingText: 'กำลังลบ...',
      onConfirm: async () => {
        await $axios.delete(`/stopwords/${item.StopwordID}`);
        toastSuccess('ลบ Stopword สำเร็จ');
        await refreshData();
      }
    });
  } catch (error) {
    toastError('ลบไม่สำเร็จ: ' + (error.response?.data?.message || error.message));
  }
}

// Seed helpers
async function confirmSeed() {
  showSeedModal.value = true;
  seedModal.value.loading = true;
  seedModal.value.toAdd = [];
  seedModal.value.alreadyExists = [];
  
  try {
    const response = await $axios.get('/stopwords/seed/preview');
    if (response.data && response.data.ok) {
      seedModal.value.toAdd = response.data.data.toAdd || [];
      seedModal.value.alreadyExists = response.data.data.alreadyExists || [];
      seedModal.value.totalStandard = response.data.data.totalStandard || 0;
    }
  } catch (error) {
    console.error('Error fetching seed preview:', error);
    toastError('ไม่สามารถโหลดรายการคำได้');
  } finally {
    seedModal.value.loading = false;
  }
}

async function seedStopwords() {
  isSeeding.value = true;
  try {
    const response = await $axios.post('/stopwords/seed');
    if (response.data && response.data.ok) {
      const added = response.data.addedCount || 0;
      if (added > 0) {
        toastSuccess(`เติมข้อมูลสำเร็จ! เพิ่มคำใหม่ ${added} คำ`);
      } else {
        showMessage('ข้อมูลเป็นปัจจุบันอยู่แล้ว ไม่มีคำใหม่ที่ต้องเพิ่ม', 'warning');
      }
      showSeedModal.value = false;
      // Refresh table
      await refreshData();
    } else {
      toastError(response.data?.message || 'ไม่สามารถเติมคำได้');
    }
  } catch (error) {
    toastError(error.response?.data?.message || error.message || 'เกิดข้อผิดพลาดในการเติมข้อมูล');
  } finally {
    isSeeding.value = false;
  }
}

// Helpers
function showMessage(msg, type) {
  actionMessage.value = msg;
  actionMessageClass.value = type === 'error' ? 'text-danger' : 'text-success';
  setTimeout(() => { actionMessage.value = ''; }, 3000);
}
</script>

<style scoped>
@import '@/assets/dashboard-styles.css';
@import '@/assets/main.css';

/* Mobile sidebar toggle button styles (inline here so it's local to this view) */
button.mobile-sidebar-toggle.mobile-inline-toggle { display: none !important; border: none; background: #fff; width: 36px; height: 36px; align-items: center; justify-content: center; border-radius: 8px; box-shadow: 0 6px 18px rgba(0,0,0,0.08); padding: 0; }
.mobile-sidebar-toggle i { font-size: 1.05rem; }
@media (max-width: 768px) { button.mobile-sidebar-toggle.mobile-inline-toggle { display: flex !important; margin-right: 8px; align-self: center; } }
.mobile-sidebar-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.36); z-index: 98; }

.dashboard-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
}

.main-content {
  flex: 1;
  padding: 0.5rem !important;
  overflow-x: hidden;
}

.header-section {
  width: 100%;
}

.header-top {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-actions {
  margin-left: auto;
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 576px) {
  .btn-add-apple span {
    display: none !important;
  }
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1d1d1f;
}

/* Search Container */
.search-container {
  position: relative;
  width: 100%;
  max-width: 320px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #86868b;
  font-size: 0.9rem;
}

.search-input {
  width: 100%;
  padding: 0.6rem 2.5rem 0.6rem 2.5rem;
  border: 1px solid #e5e5ea;
  border-radius: 12px;
  font-size: 0.9rem;
  background: #ffffff;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.15);
}

.search-clear {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #86868b;
  cursor: pointer;
  padding: 0;
}

.search-clear:hover {
  color: #ff3b30;
}

/* Add Button - Apple Style */
.btn-add-apple {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #34c759 0%, #28a745 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Seed Button - Magic Style */
.btn-seed {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #ff9500 0%, #ff7b00 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(255, 149, 0, 0.3);
}

.btn-seed:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 149, 0, 0.4);
  background: linear-gradient(135deg, #ff7b00 0%, #ff6600 100%);
}

.btn-seed:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-seed i {
  font-size: 1rem;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

/* Seed Modal Card */
.apple-modal-card.seed-modal {
  background: white;
  border-radius: 20px;
  padding: 32px;
  max-width: 420px;
  width: 100%;
  text-align: center;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 28px;
}

.modal-icon.primary {
  background: linear-gradient(135deg, #ff9500 0%, #ff7b00 100%);
  color: white;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 12px;
}

.modal-text {
  font-size: 0.9rem;
  color: #6e6e73;
  line-height: 1.5;
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.modal-actions .btn-secondary {
  padding: 10px 24px;
  border: 1px solid #e5e5ea;
  background: #f5f5f7;
  color: #1d1d1f;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-actions .btn-secondary:hover {
  background: #e5e5ea;
}

.modal-actions .btn-primary-apple {
  padding: 10px 24px;
  background: linear-gradient(135deg, #ff9500 0%, #ff7b00 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-actions .btn-primary-apple:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 149, 0, 0.4);
}

.modal-actions .btn-primary-apple:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-add-apple:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(52, 199, 89, 0.4);
}

/* Apple-style Cards */
.apple-card {
  background: #ffffff;
  border: none;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.apple-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12) !important;
}

.shadow-apple {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* Info Card */
.info-card {
  background: linear-gradient(135deg, #e8f4fd 0%, #f0f9ff 100%);
  border-left: 4px solid #007aff;
}

/* Stat Cards */
.stat-card {
  background: #ffffff;
  transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s;
}

.stat-card:hover::before {
  left: 100%;
}

.stat-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15) !important;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1d1d1f;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #86868b;
  margin-top: 0.5rem;
}

/* Apple-style Buttons */
.btn-apple {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-apple:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-apple-primary {
  background: linear-gradient(135deg, #007aff 0%, #0056b3 100%);
  color: white;
}

.btn-apple-primary:hover:not(:disabled) {
  transform: scale(1.02);
  box-shadow: 0 4px 15px rgba(0, 122, 255, 0.4);
}

.btn-apple-outline {
  background: transparent;
  border: 2px solid #007aff;
  color: #007aff;
}

.btn-apple-outline:hover:not(:disabled) {
  background: #007aff;
  color: white;
}

/* Table Styles */
.apple-table {
  border-collapse: separate;
  border-spacing: 0;
}

.apple-table thead th {
  background: #f5f5f7;
  color: #1d1d1f;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 1rem;
  border: none;
}

.apple-row {
  transition: all 0.2s ease;
  animation: slideIn 0.4s ease-out forwards;
  opacity: 0;
}

.apple-row:nth-child(1) { animation-delay: 0.1s; }
.apple-row:nth-child(2) { animation-delay: 0.15s; }
.apple-row:nth-child(3) { animation-delay: 0.2s; }
.apple-row:nth-child(4) { animation-delay: 0.25s; }
.apple-row:nth-child(5) { animation-delay: 0.3s; }

.apple-row:hover {
  background: #f5f5f7;
}

/* Action Buttons */
.btn-action {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-edit {
  background: #e8f4fd;
  color: #007aff;
}

.btn-edit:hover {
  background: #007aff;
  color: white;
  transform: scale(1.1);
}

.btn-reject {
  background: #ffebee;
  color: #ff3b30;
}

.btn-reject:hover {
  background: #ff3b30;
  color: white;
  transform: scale(1.1);
}

/* Empty State */
.empty-state {
  padding: 2rem;
}

/* Modal Styles */
.apple-modal {
  border: none;
  overflow: hidden;
}

.btn-close-custom {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

/* Pagination */
.pagination .page-link {
  border: none;
  color: #007aff;
  padding: 0.5rem 0.75rem;
  margin: 0 2px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.pagination .page-link:hover {
  background: #e8f4fd;
}

.pagination .page-item.active .page-link {
  background: #007aff;
  color: white;
}

.pagination .page-item.disabled .page-link {
  color: #86868b;
}

/* ============================================ */
/* SVG ANIMATIONS - APPLE STYLE */
/* ============================================ */

/* Icon SVG General Styles */
.icon-svg {
  flex-shrink: 0;
}

/* Search Icon Animation */
.search-circle {
  stroke-dasharray: 38;
  stroke-dashoffset: 38;
  animation: drawCircle 0.8s ease-out forwards;
}

.search-handle {
  stroke-dasharray: 7;
  stroke-dashoffset: 7;
  animation: drawLine 0.4s ease-out 0.6s forwards;
}

@keyframes drawLine {
  to { stroke-dashoffset: 0; }
}

/* Checkmark Animation */
.checkmark-path {
  stroke-dasharray: 15;
  stroke-dashoffset: 15;
  animation: drawCheck 0.4s ease-out 0.2s forwards;
}

/* Broom Animation */
.broom-handle {
  stroke-dasharray: 10;
  stroke-dashoffset: 10;
  animation: drawLine 0.4s ease-out forwards;
}

.broom-bristles {
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  animation: drawLine 0.6s ease-out 0.3s forwards;
}

.sparkle-dot {
  animation: sparkle 2s ease-in-out infinite;
}

.sparkle-1 { animation-delay: 0s; }
.sparkle-2 { animation-delay: 0.3s; }

/* Lightbulb Animation */
.lightbulb-filament {
  stroke-dasharray: 5;
  stroke-dashoffset: 5;
  animation: drawLine 0.4s ease-out forwards;
}

.bulb-glow {
  animation: glowPulse 2s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.5; }
}

/* Lightning Bolt Animation */
.lightning-bolt {
  animation: lightning 1.5s ease-in-out infinite;
}

@keyframes lightning {
  0%, 90%, 100% { opacity: 1; }
  93%, 97% { opacity: 0.3; }
}

/* Button Icon Styles */
.btn-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}

.btn-icon-spin.spinning {
  animation: spinIcon 1s ease-in-out infinite;
}

@keyframes spinIcon {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Brain Icon Animation */
.brain-icon {
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 20px rgba(0, 122, 255, 0.3));
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}

/* Brain Outline */
.brain-outline {
  stroke-dasharray: 180;
  stroke-dashoffset: 180;
  animation: drawBrainOutline 2s ease-out forwards;
}

.brain-left {
  animation-delay: 0s;
}

@keyframes drawBrainOutline {
  to { stroke-dashoffset: 0; }
}

/* Brain Wrinkles */
.brain-wrinkle {
  stroke-dasharray: 25;
  stroke-dashoffset: 25;
  animation: drawWrinkle 0.6s ease-out forwards;
  opacity: 0.75;
}

.wrinkle-1 { animation-delay: 1s; }
.wrinkle-2 { animation-delay: 1.2s; }

@keyframes drawWrinkle {
  to { stroke-dashoffset: 0; }
}

/* Neurons */
.neuron {
  animation: neuronPulse 2s ease-in-out infinite;
  opacity: 0;
}

.neuron-1 { animation-delay: 1.8s; }
.neuron-2 { animation-delay: 2s; }

@keyframes neuronPulse {
  0%, 100% { 
    opacity: 0.6;
    transform: scale(1);
  }
  50% { 
    opacity: 1;
    transform: scale(1.3);
  }
}

/* Neuron Glow */
.neuron-glow {
  animation: glowPulse 2s ease-in-out infinite;
  opacity: 0;
}

/* Book Icon Animation */
.book-icon {
  animation: float 3s ease-in-out infinite 0.5s;
  filter: drop-shadow(0 2px 8px rgba(0, 122, 255, 0.12));
}

.book-cover {
  animation: bookOpen 0.8s ease-out forwards;
  transform-origin: left center;
}

@keyframes bookOpen {
  from {
    transform: scaleX(0);
    opacity: 0;
  }
  to {
    transform: scaleX(1);
    opacity: 1;
  }
}

.book-spine {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 0.3; }
}

.book-page {
  stroke-dasharray: 32;
  stroke-dashoffset: 32;
  animation: writeLine 0.6s ease-out forwards;
}

.page-1 { animation-delay: 0.4s; }
.page-2 { animation-delay: 0.6s; }
.page-3 { animation-delay: 0.8s; }
.page-4 { animation-delay: 1s; }
.page-5 { animation-delay: 1.2s; }

@keyframes writeLine {
  to { stroke-dashoffset: 0; }
}

.bookmark {
  animation: bookmarkDrop 0.5s ease-out 1.4s forwards;
  transform-origin: top center;
  opacity: 0;
}

@keyframes bookmarkDrop {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Stat Card SVG Animations */
.stat-svg {
  animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  opacity: 0;
}

@keyframes scaleIn {
  to {
    opacity: 1;
    transform: scale(1);
  }
  from {
    opacity: 0;
    transform: scale(0.5);
  }
}

.stat-circle {
  stroke-dasharray: 126;
  stroke-dashoffset: 126;
  animation: drawCircle 1s ease-out forwards;
}

@keyframes drawCircle {
  to { stroke-dashoffset: 0; }
}

.stat-circle-bg {
  animation: expandCircle 0.8s ease-out forwards;
  transform: scale(0);
}

@keyframes expandCircle {
  to { transform: scale(1); }
}

/* Clock Hand Animation */
.stat-clock-hand {
  animation: filterPulse 2s ease-in-out infinite;
  transform-origin: center center;
}

@keyframes filterPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Checkmark Animation */
.stat-checkmark {
  stroke-dasharray: 40;
  stroke-dashoffset: 40;
  animation: drawCheck 0.6s ease-out 0.4s forwards;
}

@keyframes drawCheck {
  to { stroke-dashoffset: 0; }
}

/* Brain Wave Animation */
.stat-brain-wave {
  stroke-dasharray: 80;
  animation: waveMove 2s ease-in-out infinite;
}

@keyframes waveMove {
  0%, 100% { stroke-dashoffset: 0; }
  50% { stroke-dashoffset: 40; }
}

.stat-dot {
  animation: dotPulse 1.5s ease-in-out infinite;
}

.stat-dot-1 { animation-delay: 0s; }
.stat-dot-2 { animation-delay: 0.2s; }
.stat-dot-3 { animation-delay: 0.4s; }

@keyframes dotPulse {
  0%, 100% {
    r: 2;
    opacity: 0.5;
  }
  50% {
    r: 4;
    opacity: 1;
  }
}

/* Empty State SVG Animation */
.empty-svg {
  animation: float 3s ease-in-out infinite;
}

.empty-circle {
  stroke-dasharray: 314;
  stroke-dashoffset: 314;
  animation: drawCircle 1.5s ease-out forwards;
}

.empty-checkmark {
  stroke-dasharray: 70;
  stroke-dashoffset: 70;
  animation: drawCheck 0.8s ease-out 1s forwards;
}

.empty-sparkle {
  animation: sparkle 2s ease-in-out infinite;
}

.sparkle-1 { animation-delay: 0s; }
.sparkle-2 { animation-delay: 0.4s; }
.sparkle-3 { animation-delay: 0.8s; }

@keyframes sparkle {
  0%, 100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1.5);
  }
}

/* Stat Card Hover Effects */
.stat-card:hover .stat-svg {
  animation: bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

/* Button Ripple Effect - Apple Style */
.btn-apple {
  position: relative;
  overflow: hidden;
}

.btn-apple::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn-apple:active::after {
  width: 300px;
  height: 300px;
}

/* Table Row Animation */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Action Button Hover - Apple Style */
.btn-action {
  position: relative;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-action::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.btn-edit::before {
  background: radial-gradient(circle, #007aff 0%, transparent 70%);
}

.btn-reject::before {
  background: radial-gradient(circle, #ff3b30 0%, transparent 70%);
}

.btn-action:hover::before {
  opacity: 0.3;
}

/* Loading Spinner - Apple Style */
.spinner-border {
  animation: appleSpinner 0.8s linear infinite;
}

@keyframes appleSpinner {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Search input with icon */
.search-container-table {
  position: relative;
}

.search-container-table .search-icon-svg {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.search-container-table .search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  padding-left: 2.75rem; /* space for the search icon */
  border: 2px solid #007aff33;
  border-radius: 16px;
  outline: none;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.search-container-table .search-input:focus {
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.2);
  border-color: #007aff;
}

.search-container-table .search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Page Title Animation */
.page-title {
  animation: slideInTitle 0.6s ease-out;
}

@keyframes slideInTitle {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Info Card Animation */
.info-card {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ============================================ */
/* ROW TRANSITION - SMOOTH DELETE ANIMATION */
/* ============================================ */
.row-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.row-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53);
}

.row-fade-enter-from {
  opacity: 0;
  transform: translateX(-30px) scale(0.95);
}

.row-fade-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
}

.row-fade-move {
  transition: transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
}

/* ============================================ */
/* NUMBER CHANGE ANIMATION - STAT CARDS */
/* ============================================ */
.number-change-enter-active,
.number-change-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.number-change-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.8);
}

.number-change-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

/* Responsive */
@media (max-width: 768px) {
  .stat-number {
    font-size: 1.75rem;
  }
  
  .btn-apple {
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
  }
  
  .brain-icon,
  .book-icon {
    width: 40px;
    height: 40px;
  }
  
  .stat-svg {
    width: 48px;
    height: 48px;
  }
}

/* Mobile sidebar toggle */
.mobile-sidebar-toggle {
  background: none;
  border: none;
  color: currentColor;
  cursor: pointer;
  padding: 0.5rem;
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
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
    padding: 0.75rem 0;
  }
  .apple-table tbody td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    text-align: left;
    gap: 0.75rem;
  }
  .apple-table tbody td:last-child {
    border-bottom: none;
  }
  .apple-table tbody td::before {
    content: attr(data-label);
    flex: 1;
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #8c8c92;
    font-weight: 600;
    margin-right: 0.85rem;
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

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
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
  background: linear-gradient(135deg, #FF9500 0%, #FF6B00 100%);
  color: white;
}

.seed-word-tag.exists {
  background: #E5E5EA;
  color: #6E6E73;
}

.seed-empty {
  padding: 2rem 0;
  text-align: center;
  color: #6E6E73;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #F5F5F7;
  border-top-color: #FF9500;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>