<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <Sidebar :userType="userType" :userInfoObject="userInfoObject" />
    <div v-if="isMobileSidebarOpen" class="mobile-sidebar-backdrop" @click="toggleSidebar" aria-hidden="true"></div>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container-fluid">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-secondary">กำลังโหลดข้อมูลคำถาม-คำตอบ...</p>
        </div>

        <div v-else>
          <!-- Header Section: Title + Action Buttons -->
          <div class="header-section my-4">
            <div class="header-top d-flex align-items-center gap-3 mb-3">
              <button class="mobile-sidebar-toggle mobile-inline-toggle" @click.stop="toggleSidebar" :aria-label="isMobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'">
                <i :class="isMobileSidebarOpen ? 'bi bi-x' : 'bi bi-list'"></i>
              </button>

              <svg class="book-icon" width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Background Circle -->
                <circle cx="32" cy="32" r="30" fill="#7c3aed" opacity="0.08"/>
                
                <!-- Book Cover -->
                <path class="brain-outline brain-left" 
                  d="M 16 14 L 48 14 Q 50 14 50 16 L 50 50 Q 50 52 48 52 L 16 52 Q 14 52 14 50 L 14 16 Q 14 14 16 14 Z"
                  stroke="#7c3aed" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                
                <!-- Book Spine -->
                <path class="brain-wrinkle wrinkle-1" 
                  d="M 32 16 L 32 52" 
                  stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                
                <!-- Page Lines -->
                <path class="brain-wrinkle wrinkle-2" 
                  d="M 22 26 L 28 26" 
                  stroke="#7c3aed" stroke-width="1.5" stroke-linecap="round" fill="none"/>
                <path class="brain-wrinkle wrinkle-2" 
                  d="M 22 32 L 28 32" 
                  stroke="#7c3aed" stroke-width="1.5" stroke-linecap="round" fill="none"/>
                <path class="brain-wrinkle wrinkle-2" 
                  d="M 22 38 L 28 38" 
                  stroke="#7c3aed" stroke-width="1.5" stroke-linecap="round" fill="none"/>
                <path class="brain-wrinkle wrinkle-2" 
                  d="M 36 26 L 42 26" 
                  stroke="#7c3aed" stroke-width="1.5" stroke-linecap="round" fill="none"/>
                <path class="brain-wrinkle wrinkle-2" 
                  d="M 36 32 L 42 32" 
                  stroke="#7c3aed" stroke-width="1.5" stroke-linecap="round" fill="none"/>
                <path class="brain-wrinkle wrinkle-2" 
                  d="M 36 38 L 42 38" 
                  stroke="#7c3aed" stroke-width="1.5" stroke-linecap="round" fill="none"/>
                
                <!-- Dots -->
                <g class="neuron-group">
                  <circle class="neuron-glow" cx="25" cy="45" r="5" fill="#7c3aed" opacity="0.2"/>
                  <circle class="neuron neuron-1" cx="25" cy="45" r="2.5" fill="#7c3aed"/>
                </g>
                <g class="neuron-group">
                  <circle class="neuron-glow" cx="39" cy="45" r="5" fill="#a78bfa" opacity="0.2"/>
                  <circle class="neuron neuron-2" cx="39" cy="45" r="2.5" fill="#a78bfa"/>
                </g>
              </svg>

              <h2 class="page-title m-0">Manage Question Answer</h2>
              
              <!-- Action buttons group -->
              <div class="header-actions d-flex gap-2">
                <button class="btn-apple-primary" @click="openCrudModal" title="เพิ่มรายการใหม่">
                  <i class="bi bi-plus-lg"></i>
                  <span class="d-none d-sm-inline">เพิ่มคำถาม</span>
                </button>
                <button class="btn-apple-icon" @click="openUploadModal" title="อัพโหลด CSV">
                  <i class="bi bi-cloud-upload"></i>
                </button>
              </div>
            </div>

            <!-- Info Card: Guide -->
            <div class="info-card apple-card mb-4 p-4 rounded-4 shadow-apple">
              <!-- SVG Book Icon Animation -->
              <svg class="book-icon float-start me-3" width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Book Cover/Background -->
                <rect class="book-cover" x="12" y="12" width="48" height="48" rx="3" fill="#7c3aed" opacity="0.15"/>
                <!-- Book Spine -->
                <rect class="book-spine" x="12" y="12" width="6" height="48" rx="1" fill="#7c3aed" opacity="0.3"/>
                <!-- Pages -->
                <path class="book-page page-1" d="M22 20 L54 20" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round"/>
                <path class="book-page page-2" d="M22 28 L54 28" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round"/>
                <path class="book-page page-3" d="M22 36 L50 36" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round"/>
                <path class="book-page page-4" d="M22 44 L48 44" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round"/>
                <path class="book-page page-5" d="M22 52 L46 52" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round"/>
                <!-- Book Border -->
                <rect x="12" y="12" width="48" height="48" rx="3" stroke="#7c3aed" stroke-width="2" fill="none"/>
                <!-- Bookmark -->
                <rect class="bookmark" x="52" y="12" width="4" height="20" fill="#a78bfa"/>
              </svg>
              <h5 class="fw-bold mb-3">คำถาม-คำตอบคืออะไร?</h5>
              <p class="mb-2 text-muted"><strong>คำถาม-คำตอบ</strong> คือข้อมูลที่ใช้สำหรับตอบกลับข้อความจากผู้ใช้ เมื่อระบบค้นหากับคำถามตรงกัน ก็จะแสดงคำตอบที่เหมาะสม</p>
              <ul class="mb-3 text-muted small">
                <li class="d-flex align-items-center gap-2 mb-2">
                  <svg class="icon-svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" stroke="#7c3aed" stroke-width="2"/>
                    <path d="M6 10 L9 13 L14 7" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>คำตอบจะถูกส่งไปหาผู้ใช้เมื่อมีการค้นหาตรงกับคำถาม</span>
                </li>
                <li class="d-flex align-items-center gap-2 mb-2">
                  <svg class="icon-svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7 4 L13 4 L15 8 L13 16 L7 16 L5 8 Z" stroke="#7c3aed" stroke-width="2" stroke-linejoin="round"/>
                    <path d="M10 6 L10 12" stroke="#7c3aed" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                  <span>สามารถกำหนดวันหมดอายุของคำถาม-คำตอบได้</span>
                </li>
                <li class="d-flex align-items-center gap-2">
                  <svg class="icon-svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" stroke="#7c3aed" stroke-width="2"/>
                    <path d="M10 6 V10 L13 13" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>เพิ่ม/ลบ หรืออัพเดตคำถาม-คำตอบได้ตลอด</span>
                </li>
              </ul>
              <p class="mb-0 small text-success fw-bold d-flex align-items-center gap-2">
                <svg class="icon-svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="#7c3aed" stroke-width="2"/>
                  <path d="M10 6 L10 11" stroke="#ffd60a" stroke-width="2" stroke-linecap="round"/>
                  <path d="M8 14 L12 14" stroke="#7c3aed" stroke-width="2" stroke-linecap="round"/>
                  <circle cx="10" cy="8" r="4" fill="#ffd60a" opacity="0.3"/>
                </svg>
                <span>ระบบจะค้นหาคำถามที่เหมาะสมที่สุดสำหรับผู้ใช้อัตโนมัติ</span>
              </p>
            </div>

            <!-- Search bar: Full width on mobile, normal on desktop -->
            <div class="search-container-wrapper">
              <div class="search-container">
                <i class="bi bi-search search-icon"></i>
                <input
                  type="text"
                  class="search-input"
                  placeholder="ค้นหาคำถาม / คำตอบ / หัวข้อ..."
                  v-model="searchQuery"
                />
                <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
                  <i class="bi bi-x-circle-fill"></i>
                </button>
              </div>
            </div>
            
            <!-- Apple Filters -->
            <AppleFilters
              v-model="qaFilters"
              :show-sort="true"
              :sort-options="qaSortOptions"
              default-sort-by="id"
              default-sort-order="desc"
              :categories="categoryOptions"
              category-label="หมวดหมู่"
              :statuses="qaStatuses"
              status-label="สถานะ"
              :show-date-presets="true"
              date-preset-direction="future"
              :show-number-range="true"
              number-range-label="Like/Unlike"
              min-placeholder="ต่ำสุด"
              max-placeholder="สูงสุด"
              @change="onQaFiltersChange"
            />
          </div>

          <!-- Table Section -->
          <div class="bg-white shadow-apple rounded-4 overflow-hidden apple-card">
            <div class="table-responsive">
              <table class="table apple-table qa-table mb-0">
                <thead>
                  <tr>
                    <th class="ps-4">ID</th>
                    <th>หัวข้อคำถาม</th>
                    <th class="col-review-date text-center">วันหมดอายุ</th>
                    <th>คำตอบ</th>
                    <th>หมวดหมู่</th>
                    <th>Keywords</th>
                    <th class="text-center">👍 Like</th>
                    <th class="text-center">👎 Unlike</th>
                    <th class="text-center">⏳ Pending</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in paginatedQuestions" :key="item.QuestionsAnswersID" class="align-middle apple-row" @click="openPreview(item)">
                    <td data-label="ID" class="ps-4 fw-medium text-secondary">{{ item.QuestionsAnswersID }}</td>
                    <td data-label="หัวข้อคำถาม" class="py-3">
                      <div class="question-title-cell cell-ellipsis" :title="item.QuestionTitle">{{ item.QuestionTitle }}</div>
                    </td>
                    <td data-label="วันหมดอายุ" class="py-3 review-date-cell text-center">
                      <div class="review-date-wrap">
                        <span 
                          :class="['badge-pill', getReviewDateBadgeClass(item.ReviewDate)]"
                          data-bs-toggle="tooltip" 
                          data-bs-placement="top" 
                          :title="formatFullDateTime(item.ReviewDate)"
                        >
                          {{ formatRelativeTime(item.ReviewDate) }}
                        </span>
                      </div>
                    </td>
                    <td data-label="คำตอบ" class="py-3">
                      <div class="question-text-cell cell-ellipsis text-muted" :title="item.QuestionText">{{ item.QuestionText }}</div>
                    </td>
                    <td data-label="หมวดหมู่" class="py-3">
                      <span
                        class="category-badge"
                        :style="{ backgroundColor: tagColors[(item.CategoriesID || 0) % tagColors.length] + '20', color: tagColors[(item.CategoriesID || 0) % tagColors.length] }"
                      >
                        <span class="cell-ellipsis">{{ item.CategoriesName || categoriesNameMapSafe[item.CategoriesID] || item.CategoriesID }}</span>
                      </span>
                    </td>
                    <td data-label="Keywords" class="py-3">
                      <div class="d-flex flex-nowrap gap-1 keywords-nowrap" v-if="item.keywords && item.keywords.length">
                        <span
                          v-for="(k, i) in item.keywords.slice(0, 3)"
                          :key="k.KeywordID || (k.KeywordText + i)"
                          class="keyword-tag"
                        >
                          {{ k.KeywordText }}
                        </span>
                        <span v-if="item.keywords.length > 3" class="keyword-tag-more">+{{ item.keywords.length - 3 }}</span>
                      </div>
                      <span v-else class="text-muted small">-</span>
                    </td>
                    <td data-label="Like" class="py-3 text-center" @click.stop>
                      <div class="stat-pill like" :class="{ 'active': item.likeCount > 0 }" @click="goToFeedbacks(item.QuestionsAnswersID, 'like')">
                        <i class="bi bi-hand-thumbs-up-fill"></i>
                        <span>{{ item.likeCount || 0 }}</span>
                      </div>
                    </td>
                    <td data-label="Unlike" class="py-3 text-center" @click.stop>
                      <div class="stat-pill unlike" :class="{ 'active': item.unlikeCount > 0 }" @click="goToFeedbacks(item.QuestionsAnswersID, 'unlike')">
                        <i class="bi bi-hand-thumbs-down-fill"></i>
                        <span>{{ item.unlikeCount || 0 }}</span>
                      </div>
                    </td>
                    <td data-label="Pending" class="py-3 text-center" @click.stop>
                      <div class="stat-pill pending" :class="{ 'active': item.pendingCount > 0 }" @click="goToFeedbacks(item.QuestionsAnswersID, 'pending')">
                        <i class="bi bi-hourglass-split"></i>
                        <span>{{ item.pendingCount || 0 }}</span>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="paginatedQuestions.length === 0">
                    <td colspan="9" class="text-center text-muted py-5">
                      <div class="empty-state">
                        <i class="bi bi-search"></i>
                        <p>ไม่พบข้อมูลคำถาม-คำตอบ</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div class="d-flex justify-content-between align-items-center p-3 border-top">
              <div class="small text-secondary">
                แสดง {{ startIndex }} ถึง {{ endIndex }} จาก {{ totalEntries }} รายการ
              </div>
              <nav aria-label="Page navigation">
                <ul class="pagination pagination-sm mb-0 align-items-center">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="firstPage">&laquo;</a>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="prevPage">&lsaquo;</a>
                  </li>
                  <li v-for="page in pagesToShow" :key="page" class="page-item" :class="{ active: currentPage === page }">
                    <a class="page-link page-num" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
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
    </main>

    <!-- Upload Modal -->
    <transition name="apple-zoom">
      <div v-if="showUploadModal" class="apple-modal-overlay" @click.self="closeUploadModal">
        <div class="apple-modal-content">
          <div class="apple-modal-header-bg"></div>
          <div class="apple-modal-header">
            <div class="d-flex flex-column">
              <h5 class="apple-modal-title">อัพโหลดไฟล์</h5>
              <span class="apple-modal-subtitle">Import CSV Data</span>
            </div>
            <button class="apple-close-btn" @click="closeUploadModal">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="apple-modal-body">
            <div 
              class="upload-drop-area-apple" 
              :class="{ 'has-file': uploadedFile }"
              @drop.prevent="onFileDrop"
              @dragover.prevent
              @click="$refs.fileInput.click()"
            >
              <div class="upload-icon-wrapper">
                <i class="bi bi-cloud-arrow-up-fill"></i>
              </div>
              <div class="upload-text">
                <span v-if="!uploadedFile">ลากไฟล์มาวางที่นี่ หรือ <strong>คลิกเลือกไฟล์</strong></span>
                <span v-else class="file-selected">
                  <i class="bi bi-file-earmark-spreadsheet-fill me-2 text-success"></i>{{ uploadedFile.name }}
                </span>
              </div>
              <div class="upload-hint">รองรับไฟล์ .csv เท่านั้น</div>
              <input ref="fileInput" type="file" accept=".csv" class="d-none" @change="onFileChange" />
            </div>

            <div class="d-flex justify-content-center gap-2 mt-4">
              <button class="btn-apple-secondary small" @click.stop="downloadTemplateFile" :disabled="isDownloadingTemplate">
                <i class="bi bi-file-earmark-arrow-down me-1"></i> Template
              </button>
              <button class="btn-apple-secondary small" @click.stop="openTemplateModal">
                <i class="bi bi-eye me-1"></i> ตัวอย่าง
              </button>
              <button class="btn-apple-secondary small" @click.stop="exportCurrentDataAsCsv" :disabled="isDownloadingFile">
                <i class="bi bi-download me-1"></i> Export CSV
              </button>
            </div>

            <div class="apple-actions mt-4">
              <button class="btn-apple-secondary" @click="closeUploadModal" :disabled="isUploading">ยกเลิก</button>
              <button class="btn-apple-primary" @click="saveUpload" :disabled="!uploadedFile || isUploading">
                <span v-if="isUploading" class="spinner-border spinner-border-sm me-2"></span>
                อัพโหลด
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Template Image Modal -->
    <transition name="apple-zoom">
      <div v-if="showTemplateModal" class="apple-modal-overlay" @click.self="closeTemplateModal">
        <div class="apple-modal-content wide-modal">
          <div class="apple-modal-header">
            <h5 class="apple-modal-title">ตัวอย่าง Template</h5>
            <button class="apple-close-btn" @click="closeTemplateModal"><i class="bi bi-x-lg"></i></button>
          </div>
          <div class="apple-modal-body p-0 d-flex justify-content-center bg-light">
             <img :src="ex5Url" alt="Template Example" class="img-fluid" style="max-height: 70vh;">
          </div>
        </div>
      </div>
    </transition>

    <!-- Preview Drawer -->
    <div class="drawer-overlay" v-if="showDrawer" @click="closeDrawer"></div>
    <div class="apple-drawer" :class="{ 'drawer-open': showDrawer }">
      <div class="drawer-header">
        <h5 class="drawer-title">รายละเอียด</h5>
        <button class="btn-close-drawer" @click="closeDrawer">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <div class="drawer-body">
        <div class="drawer-section">
          <div class="drawer-label">ID</div>
          <div class="drawer-value text-secondary">{{ previewItem?.QuestionsAnswersID || '-' }}</div>
        </div>
        <div class="drawer-section">
          <div class="drawer-label">หัวข้อคำถาม</div>
          <div class="drawer-value fw-bold text-dark">{{ previewItem?.QuestionTitle || '-' }}</div>
        </div>
        <div class="drawer-section">
          <div class="drawer-label">คำตอบ</div>
          <div class="drawer-value text-dark whitespace-prewrap">{{ previewItem?.QuestionText || '-' }}</div>
        </div>
        <div class="drawer-section">
          <div class="drawer-label">Keywords</div>
          <div class="d-flex flex-wrap gap-2 mt-2" v-if="previewItem?.keywords && previewItem.keywords.length">
            <span
              v-for="(k, i) in previewItem.keywords"
              :key="k.KeywordID || (k.KeywordText + i)"
              class="keyword-tag large"
            >
              {{ k.KeywordText }}
            </span>
          </div>
          <div class="text-muted" v-else>—</div>
        </div>
        <div class="drawer-section">
          <div class="drawer-label">หมวดหมู่</div>
          <div class="mt-2">
            <span class="category-badge large" 
              :style="{ backgroundColor: tagColors[(previewItem?.CategoriesID || 0) % tagColors.length] + '20', color: tagColors[(previewItem?.CategoriesID || 0) % tagColors.length] }">
              {{ previewItem?.CategoriesName || categoriesNameMapSafe[previewItem?.CategoriesID] || previewItem?.CategoriesID || '-' }}
            </span>
          </div>
        </div>
        <div class="drawer-section">
          <div class="drawer-label">วันหมดอายุ</div>
          <div class="mt-2 d-flex align-items-center gap-2">
            <span :class="['badge-pill', getReviewDateBadgeClass(previewItem?.ReviewDate)]">{{ formatFullDateTime(previewItem?.ReviewDate) }}</span>
            <span class="text-muted small">({{ formatRelativeTime(previewItem?.ReviewDate) }})</span>
          </div>
        </div>
      </div>
      <div class="drawer-footer">
        <div class="d-flex gap-2">
          <button class="btn-apple-primary flex-fill" @click="openEditModalFromPreview">
            <i class="bi bi-pencil-square me-2"></i> แก้ไข
          </button>
          <button class="btn-apple-secondary text-danger flex-fill" @click="confirmDeleteFromPreview">
            <i class="bi bi-trash me-2"></i> ลบ
          </button>
        </div>
      </div>
    </div>

    <!-- CRUD Modal -->
    <transition name="apple-zoom">
      <div v-if="showCrudModal" class="apple-modal-overlay" @click.self="closeCrudModal">
        <div class="apple-modal-content wide-modal">
          <div class="apple-modal-header-bg"></div>
          <div class="apple-modal-header">
            <div class="d-flex flex-column">
              <h5 class="apple-modal-title">{{ isEditing ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่' }}</h5>
              <span class="apple-modal-subtitle">{{ isEditing ? 'Edit Question & Answer' : 'Create New Question & Answer' }}</span>
            </div>
            <button class="apple-close-btn" @click="closeCrudModal">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="apple-modal-body">
            <form @submit.prevent="saveCrudForm" class="apple-form-container">
              
              <div class="apple-input-group">
                <label>หัวข้อคำถาม (Question Title) <span class="text-danger">*</span></label>
                <input type="text" class="apple-input" v-model="formData.QuestionTitle" required placeholder="เช่น ทุนเรียนดีมีกี่อย่าง?" />
              </div>

              <div class="apple-input-group">
                <label>คำตอบ (Answer) <span class="text-danger">*</span></label>
                
                <!-- Answer Type Toggle -->
                <div class="answer-type-toggle mb-3">
                  <div class="d-flex gap-2">
                    <button type="button" 
                      class="btn-type-option" 
                      :class="{ active: answerType === 'text' }" 
                      @click="answerType = 'text'">
                      <i class="bi bi-chat-left-text me-2"></i>ข้อความปกติ
                    </button>
                    <button type="button" 
                      class="btn-type-option" 
                      :class="{ active: answerType === 'gps' }" 
                      @click="answerType = 'gps'">
                      <i class="bi bi-geo-alt me-2"></i>ตำแหน่ง GPS
                    </button>
                  </div>
                </div>
                
                <!-- Normal Text Input -->
                <div v-if="answerType === 'text'">
                  <textarea class="apple-input apple-textarea" v-model="formData.QuestionText" rows="5" required placeholder="รายละเอียดคำตอบ..."></textarea>
                </div>
                
                <!-- GPS Input -->
                <div v-else class="gps-input-section">
                  <div class="gps-type-toggle mb-3">
                    <div class="d-flex gap-2">
                      <button type="button" 
                        class="btn-gps-option" 
                        :class="{ active: gpsType === 'url' }" 
                        @click="gpsType = 'url'">
                        <i class="bi bi-link-45deg me-1"></i>Google Maps URL
                      </button>
                      <button type="button" 
                        class="btn-gps-option" 
                        :class="{ active: gpsType === 'coords' }" 
                        @click="gpsType = 'coords'">
                        <i class="bi bi-pin-map me-1"></i>ละติจูด/ลองจิจูด
                      </button>
                    </div>
                  </div>
                  
                  <!-- Google Maps URL -->
                  <div v-if="gpsType === 'url'">
                    <div class="input-with-icon">
                      <i class="bi bi-google input-icon-left"></i>
                      <input 
                        type="url" 
                        class="apple-input ps-5" 
                        v-model="gpsUrl" 
                        placeholder="https://maps.app.goo.gl/xxxxx หรือ https://goo.gl/maps/xxxxx"
                        :required="answerType === 'gps' && gpsType === 'url'" />
                    </div>
                    <small class="text-muted d-block mt-2">
                      <i class="bi bi-info-circle me-1"></i>
                      วิธีรับ URL: เปิด Google Maps → คลิกสถานที่ → แชร์ → คัดลอกลิงก์
                    </small>
                  </div>
                  
                  <!-- Latitude/Longitude (Single Input - Paste Friendly) -->
                  <div v-else>
                    <label class="small text-secondary mb-1">พิกัด GPS (Latitude, Longitude)</label>
                    <input 
                      type="text" 
                      class="apple-input" 
                      v-model="gpsCoords" 
                      placeholder="วาง พิกัด เช่น 16.4321, 102.8236"
                      @paste="handleCoordsPaste"
                      :required="answerType === 'gps' && gpsType === 'coords'" />
                    <small class="text-muted d-block mt-2">
                      <i class="bi bi-info-circle me-1"></i>
                      วิธีหาพิกัด: เปิด Google Maps → คลิกขวาที่ตำแหน่ง → คัดลอกพิกัด → วางที่นี่
                    </small>
                    <!-- แสดงพิกัดที่แยกแล้ว -->
                    <div v-if="parsedLat && parsedLng" class="coords-parsed mt-2 p-2 bg-success bg-opacity-10 rounded small">
                      <i class="bi bi-check-circle text-success me-1"></i>
                      <span class="text-success">พิกัดถูกต้อง: </span>
                      <span class="text-dark">Lat: <strong>{{ parsedLat }}</strong>, Lng: <strong>{{ parsedLng }}</strong></span>
                    </div>
                    <div v-else-if="gpsCoords && !parsedLat" class="coords-error mt-2 p-2 bg-danger bg-opacity-10 rounded small">
                      <i class="bi bi-exclamation-circle text-danger me-1"></i>
                      <span class="text-danger">รูปแบบไม่ถูกต้อง - ต้องเป็น "ละติจูด, ลองจิจูด" เช่น 16.4321, 102.8236</span>
                    </div>
                  </div>
                  
                  <!-- Preview GPS Link -->
                  <div v-if="(gpsType === 'url' && gpsUrl) || (gpsType === 'coords' && parsedLat && parsedLng)" class="gps-preview mt-3">
                    <div class="d-flex align-items-center gap-2">
                      <i class="bi bi-eye text-primary"></i>
                      <span class="small text-secondary">ข้อมูลที่จะบันทึก:</span>
                    </div>
                    <code class="d-block mt-1 p-2 bg-light rounded small">{{ gpsType === 'url' ? gpsUrl : `${parsedLat},${parsedLng}` }}</code>
                  </div>
                </div>
              </div>

              <div class="row g-3">
                <div class="col-md-7">
                  <div class="apple-input-group">
                    <label>วันหมดอายุ (Review Date) <span class="text-danger">*</span></label>
                    <input type="date" class="apple-input" v-model="formData.ReviewDate" required />
                    <div class="d-flex flex-wrap gap-2 mt-2">
                      <button v-for="opt in reviewDateOptions" :key="opt.months" type="button" class="btn-tag-option" @click="setReviewDateMonths(opt.months)">
                        {{ opt.label }}
                      </button>
                    </div>
                  </div>
                </div>
                <div class="col-md-5">
                  <div class="apple-input-group">
                    <label>หมวดหมู่ (Category) <span class="text-danger">*</span></label>
                    <div class="select-wrapper">
                      <select class="apple-input" v-model="formData.CategoriesID" required>
                        <option :value="null" disabled>-- เลือกหมวดหมู่ --</option>
                        <option v-for="cat in sortedCategoriesForDropdown" :key="cat.CategoriesID" :value="cat.CategoriesID" :disabled="cat.isMain" :class="cat.isMain ? 'fw-bold text-muted bg-light' : ''">
                          {{ cat.isMain ? '▸ ' : ' └ ' }}{{ cat.CategoriesName }}
                        </option>
                      </select>
                      <i class="bi bi-chevron-down select-icon"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div class="apple-input-group">
                <div class="d-flex align-items-center justify-content-between mb-1">
                  <label class="mb-0">Keywords</label>
                  <button 
                    v-if="canGenerateKeywords" 
                    type="button" 
                    class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                    @click="generateKeywordsFromContent"
                    :disabled="isGeneratingKeywords"
                  >
                    <i class="bi" :class="isGeneratingKeywords ? 'bi-hourglass-split' : 'bi-magic'"></i>
                    <span>{{ isGeneratingKeywords ? 'กำลังสร้าง...' : 'Gen Keywords' }}</span>
                  </button>
                </div>
                <div class="keyword-input-wrapper">
                  <input type="text" class="apple-input pe-5" v-model="keywordInput" placeholder="พิมพ์แล้วกด Enter หรือ +" @keydown.enter.prevent="addKeyword" />
                  <button class="btn-icon-absolute" type="button" @click="addKeyword"><i class="bi bi-plus-lg"></i></button>
                </div>
                <div class="d-flex flex-wrap gap-2 mt-2">
                  <span v-for="(kw, i) in formData.keywords" :key="i" class="keyword-tag removable" @click="removeKeyword(i)">
                    {{ kw }} <i class="bi bi-x"></i>
                  </span>
                </div>
              </div>

              <div class="apple-actions">
                <button type="button" class="btn-apple-secondary" @click="closeCrudModal">ยกเลิก</button>
                <button type="submit" class="btn-apple-primary" :disabled="isSaving">
                  <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มรายการ' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>

    <!-- Confirm Modal Component (from useConfirm composable) -->
    <ConfirmModalComponent />

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, watch, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { Modal, Tooltip } from 'bootstrap';
import Sidebar from '@/components/Sidebar.vue';
import AppleFilters from '@/components/AppleFilters.vue';
import { bindSidebarResize, isSidebarCollapsed, isMobileSidebarOpen } from '@/stores/sidebarState';
import { useAppleToast } from '@/composables/useAppleToast';
import { useConfirm } from '@/composables/useConfirm';
import '@/assets/sidebar.css';
import ex5Url from '@/assets/ex5.svg';
import { formatRelativeTime } from '@/utils/formatTime';

const router = useRouter();
const { appContext } = getCurrentInstance();
const $axios = appContext.config.globalProperties.$axios;
const $swal = appContext.config.globalProperties.$swal;
const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useAppleToast();
const { confirmDelete, confirmAction, ConfirmModalComponent } = useConfirm();

const userInfoObject = ref({});
const userType = ref("");
let unbindSidebarResize = null;
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

const questionsAnswers = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');

// Apple Filters Configuration
const qaFilters = ref({
  sortBy: 'id',
  sortOrder: 'desc',
  category: '',
  status: '',
  datePreset: 'all',
  dateFrom: '',
  dateTo: '',
  minValue: null,
  maxValue: null
});

const qaSortOptions = [
  { value: 'date', label: 'วันหมดอายุ' },
  { value: 'id', label: 'รหัส' },
  { value: 'title', label: 'หัวข้อ' },
  { value: 'likes', label: 'Likes' },
  { value: 'unlikes', label: 'Unlikes' }
];

const qaStatuses = [
  { value: 'active', label: 'ยังใช้งาน', icon: 'bi bi-check-circle-fill', color: 'success' },
  { value: 'expired', label: 'หมดอายุ', icon: 'bi bi-exclamation-circle-fill', color: 'danger' },
  { value: 'expiring', label: 'ใกล้หมดอายุ', icon: 'bi bi-clock-fill', color: 'warning' }
];

// Category options for filter (computed from categoriesList)
const categoryOptions = computed(() => {
  return categoriesList.value.map(cat => ({
    value: cat.CategoriesID,
    label: cat.CategoriesName || cat.CategoriesID
  }));
});

function onQaFiltersChange() {
  currentPage.value = 1;
}

const currentPage = ref(1);
const itemsPerPage = ref(5);

const uploadedFile = ref(null);
const isUploading = ref(false);
const showUploadModal = ref(false);

const showDrawer = ref(false);
const previewItem = ref(null);

const showCrudModal = ref(false);
const showTemplateModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const isSaving = ref(false);
const keywordInput = ref('');
const categoriesList = ref([]);

const formData = ref({
  QuestionTitle: '',
  QuestionText: '',
  ReviewDate: '',
  CategoriesID: null,
  keywords: []
});

// Answer type: 'text' | 'gps'
const answerType = ref('text');
// GPS type: 'url' | 'coords'
const gpsType = ref('url');
const gpsUrl = ref('');
// Single input for coordinates (user can paste "lat, lng" directly)
const gpsCoords = ref('');

// Computed: parse lat/lng from gpsCoords
const parsedLat = computed(() => {
  const match = gpsCoords.value.trim().match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
  return match ? match[1] : '';
});
const parsedLng = computed(() => {
  const match = gpsCoords.value.trim().match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
  return match ? match[2] : '';
});

// Handle paste event to clean up coordinates
function handleCoordsPaste(event) {
  // Allow paste to happen normally, then clean up the value
  setTimeout(() => {
    let value = gpsCoords.value.trim();
    // Clean up common formats:
    // - "16.4321, 102.8236" (Google Maps format)
    // - "16.4321,102.8236" (no space)
    // - "16°26'19.6"N 102°49'25.0"E" (DMS format - not supported, keep as is)
    value = value.replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', ');
    gpsCoords.value = value;
  }, 0);
}

// Helper function to detect GPS content
function detectAnswerType(text) {
  if (!text) return { type: 'text', gpsType: 'url', url: '', lat: '', lng: '' };
  
  // Check for Google Maps URL patterns
  const googleMapsUrlPattern = /https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps|www\.google\.com\/maps|maps\.google\.com)\/[^\s]+/i;
  const urlMatch = text.match(googleMapsUrlPattern);
  if (urlMatch) {
    return { type: 'gps', gpsType: 'url', url: urlMatch[0], lat: '', lng: '' };
  }
  
  // Check for latitude,longitude pattern (e.g., "16.4321, 102.8236" or "16.4321,102.8236")
  const coordsPattern = /^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/;
  const coordsMatch = text.trim().match(coordsPattern);
  if (coordsMatch) {
    return { type: 'gps', gpsType: 'coords', url: '', lat: coordsMatch[1], lng: coordsMatch[2] };
  }
  
  return { type: 'text', gpsType: 'url', url: '', lat: '', lng: '' };
}

// Generate answer text based on answer type
function generateAnswerText() {
  if (answerType.value === 'text') {
    return formData.value.QuestionText;
  }
  
  if (gpsType.value === 'url') {
    return gpsUrl.value.trim();
  } else {
    return `${parsedLat.value},${parsedLng.value}`;
  }
}

// Watch answerType changes to sync QuestionText
watch([answerType, gpsType, gpsUrl, gpsCoords], () => {
  if (answerType.value === 'gps') {
    // Auto-update QuestionText when GPS fields change
    formData.value.QuestionText = generateAnswerText();
  }
});

// Reset GPS fields when switching to text
watch(answerType, (newVal) => {
  if (newVal === 'text') {
    // Clear GPS fields but keep QuestionText as is
    gpsUrl.value = '';
    gpsCoords.value = '';
  }
});

// 🆕 Auto-add category name as keyword when selecting category
watch(() => formData.value.CategoriesID, (newCatId, oldCatId) => {
  if (!newCatId || newCatId === oldCatId) return;
  
  // Find category name
  const selectedCat = categoriesList.value.find(c => String(c.CategoriesID) === String(newCatId));
  if (selectedCat && selectedCat.CategoriesName) {
    const catName = selectedCat.CategoriesName.trim();
    // Add to keywords if not already present
    if (catName && !formData.value.keywords.includes(catName)) {
      formData.value.keywords.push(catName);
    }
  }
});

// 🆕 Computed: Check if can generate keywords (both title and answer are filled)
const canGenerateKeywords = computed(() => {
  const hasTitle = formData.value.QuestionTitle && formData.value.QuestionTitle.trim().length > 0;
  const hasAnswer = formData.value.QuestionText && formData.value.QuestionText.trim().length > 0;
  return hasTitle && hasAnswer;
});

const isGeneratingKeywords = ref(false);

// 🆕 Function: Generate keywords from title and answer
async function generateKeywordsFromContent() {
  if (!canGenerateKeywords.value) return;
  
  isGeneratingKeywords.value = true;
  
  try {
    // Combine title and answer
    const title = formData.value.QuestionTitle.trim();
    const answer = formData.value.QuestionText.trim();
    const combinedText = `${title} ${answer}`;
    
    // Call tokenizer API to extract keywords
    const response = await $axios.post('/tokenize', { text: combinedText });
    
    if (response.data && response.data.tokens) {
      // Filter tokens: keep only meaningful words (length > 1, not numbers only)
      const tokens = response.data.tokens
        .filter(t => t && t.length > 1 && !/^\d+$/.test(t))
        .map(t => t.trim())
        .filter(Boolean);
      
      // Add unique tokens to keywords
      let addedCount = 0;
      tokens.forEach(token => {
        if (!formData.value.keywords.includes(token)) {
          formData.value.keywords.push(token);
          addedCount++;
        }
      });
      
      if (addedCount > 0) {
        toastSuccess(`เพิ่ม ${addedCount} keywords สำเร็จ`);
      } else {
        toastInfo('Keywords ที่สร้างมีอยู่ในรายการแล้ว');
      }
    } else {
      // Fallback: simple word extraction
      const words = combinedText
        .split(/[\s,.、。\n]+/)
        .map(w => w.trim())
        .filter(w => w.length > 1 && !/^\d+$/.test(w));
      
      let addedCount = 0;
      words.slice(0, 10).forEach(word => {
        if (!formData.value.keywords.includes(word)) {
          formData.value.keywords.push(word);
          addedCount++;
        }
      });
      
      if (addedCount > 0) {
        toastSuccess(`เพิ่ม ${addedCount} keywords สำเร็จ`);
      }
    }
  } catch (error) {
    console.error('Gen keywords error:', error);
    // Fallback: simple word extraction on error
    const title = formData.value.QuestionTitle.trim();
    const answer = formData.value.QuestionText.trim();
    const combinedText = `${title} ${answer}`;
    
    const words = combinedText
      .split(/[\s,.、。\n]+/)
      .map(w => w.trim())
      .filter(w => w.length > 2 && !/^\d+$/.test(w));
    
    let addedCount = 0;
    words.slice(0, 8).forEach(word => {
      if (!formData.value.keywords.includes(word)) {
        formData.value.keywords.push(word);
        addedCount++;
      }
    });
    
    if (addedCount > 0) {
      toastSuccess(`เพิ่ม ${addedCount} keywords สำเร็จ (fallback)`);
    } else {
      toastWarning('ไม่สามารถสร้าง keywords ได้');
    }
  } finally {
    isGeneratingKeywords.value = false;
  }
}

const reviewDateOptions = [
  { label: '+1 เดือน', months: 1 },
  { label: '+3 เดือน', months: 3 },
  { label: '+6 เดือน', months: 6 },
  { label: '+12 เดือน', months: 12 }
];

const isDownloadingFile = ref(false);
const isDownloadingTemplate = ref(false);

const props = defineProps({
  categoriesNameMap: { type: Object, default: () => ({}) },
  formatThaiDateTime: { type: Function, default: (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  } },
});

// Helpers
function formatFullDateTime(timestamp) {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp;
  return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function formatDateInput(date) {
  return new Date(date).toISOString().split('T')[0];
}

function getReviewDateBadgeClass(timestamp) {
  if (!timestamp) return 'bg-light text-muted border';
  const now = new Date();
  const reviewDate = new Date(timestamp);
  if (isNaN(reviewDate.getTime())) return 'bg-light text-muted border';
  
  const diffMs = reviewDate - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMs <= 0) return 'bg-danger-subtle text-danger border border-danger'; // Expired
  if (diffDays <= 3) return 'bg-warning-subtle text-warning-emphasis border border-warning';
  if (diffDays <= 14) return 'bg-info-subtle text-info-emphasis border border-info';
  return 'bg-success-subtle text-success border border-success';
}

function setReviewDateMonths(months) {
  const target = addMonths(new Date(), months);
  formData.value.ReviewDate = formatDateInput(target);
}

// Drawer & Modal Controls
function openPreview(item) {
  previewItem.value = item;
  showDrawer.value = true;
}
function closeDrawer() { showDrawer.value = false; }

function openUploadModal() { uploadedFile.value = null; showUploadModal.value = true; }
function closeUploadModal() { showUploadModal.value = false; }

function openTemplateModal() { showTemplateModal.value = true; }
function closeTemplateModal() { showTemplateModal.value = false; }

function goToFeedbacks(questionId, status = null) {
  const query = { questionId: questionId };
  if (status) {
    query.status = status;
  }
  router.push({ name: 'report-feedbacks', query: query });
}

// CRUD Logic
const fetchCategories = async () => {
  try {
    const resp = await $axios.get('/questionsanswers/categories');
    categoriesList.value = (resp.data?.data) || (Array.isArray(resp.data) ? resp.data : []);
  } catch (err) { console.error('Failed to fetch categories:', err); }
};

function resetCrudForm() {
  const defaultReviewDate = formatDateInput(addMonths(new Date(), 6));
  formData.value = { QuestionTitle: '', QuestionText: '', ReviewDate: defaultReviewDate, CategoriesID: null, keywords: [] };
  keywordInput.value = '';
  isEditing.value = false;
  editingId.value = null;
  // Reset GPS fields
  answerType.value = 'text';
  gpsType.value = 'url';
  gpsUrl.value = '';
  gpsCoords.value = '';
}

async function openCrudModal() {
  resetCrudForm();
  await fetchCategories();
  showCrudModal.value = true;
}

function closeCrudModal() {
  showCrudModal.value = false;
  resetCrudForm();
}

async function openEditModalFromPreview() {
  if (!previewItem.value) return;
  await fetchCategories();
  isEditing.value = true;
  editingId.value = previewItem.value.QuestionsAnswersID;
  
  // Cat ID Match
  const resolveCategoryId = (catVal) => {
    if (!catVal) return null;
    const byId = categoriesList.value.find(c => String(c.CategoriesID) === String(catVal));
    if (byId) return byId.CategoriesID;
    const byName = categoriesList.value.find(c => String(c.CategoriesName) === String(catVal));
    return byName ? byName.CategoriesID : null;
  };
  const catId = resolveCategoryId(previewItem.value.CategoriesID || previewItem.value.CategoryID);

  let reviewDateStr = new Date().toISOString().split('T')[0];
  if (previewItem.value.ReviewDate) {
    try { reviewDateStr = new Date(previewItem.value.ReviewDate).toISOString().split('T')[0]; } catch(e){}
  }

  // Detect answer type from existing content
  const detectedType = detectAnswerType(previewItem.value.QuestionText);
  answerType.value = detectedType.type;
  gpsType.value = detectedType.gpsType;
  gpsUrl.value = detectedType.url;
  // Set gpsCoords from detected lat/lng
  if (detectedType.lat && detectedType.lng) {
    gpsCoords.value = `${detectedType.lat}, ${detectedType.lng}`;
  } else {
    gpsCoords.value = '';
  }

  formData.value = {
    QuestionTitle: previewItem.value.QuestionTitle || '',
    QuestionText: previewItem.value.QuestionText || '',
    ReviewDate: reviewDateStr,
    CategoriesID: catId,
    keywords: (previewItem.value.keywords || []).map(k => k.KeywordText)
  };
  
  closeDrawer();
  showCrudModal.value = true;
}

function addKeyword() {
  const raw = (keywordInput.value || '').trim();
  if (!raw) return;
  const parts = raw.split(/[;,\n]+/).map(p => p.trim()).filter(Boolean);
  parts.forEach(part => {
    if (!formData.value.keywords.includes(part)) formData.value.keywords.push(part);
  });
  keywordInput.value = '';
}
function removeKeyword(index) { formData.value.keywords.splice(index, 1); }

const saveCrudForm = async () => {
  // 🆕 Auto-add any keywords in the input field before saving
  if (keywordInput.value && keywordInput.value.trim()) {
    addKeyword();
  }

  // Validate GPS fields if GPS mode is selected
  if (answerType.value === 'gps') {
    if (gpsType.value === 'url' && !gpsUrl.value.trim()) {
      toastWarning('กรุณากรอก Google Maps URL'); return;
    }
    if (gpsType.value === 'coords') {
      if (!parsedLat.value || !parsedLng.value) {
        toastWarning('กรุณากรอกพิกัด GPS ให้ถูกต้อง เช่น 16.4321, 102.8236'); return;
      }
      // Validate lat/lng format
      const latNum = parseFloat(parsedLat.value);
      const lngNum = parseFloat(parsedLng.value);
      if (isNaN(latNum) || isNaN(lngNum)) {
        toastWarning('ละติจูดหรือลองจิจูดไม่ถูกต้อง'); return;
      }
      if (latNum < -90 || latNum > 90) {
        toastWarning('ละติจูดต้องอยู่ระหว่าง -90 ถึง 90'); return;
      }
      if (lngNum < -180 || lngNum > 180) {
        toastWarning('ลองจิจูดต้องอยู่ระหว่าง -180 ถึง 180'); return;
      }
    }
    // Update QuestionText with GPS data
    formData.value.QuestionText = generateAnswerText();
  }

  if (!formData.value.QuestionTitle || !formData.value.QuestionText || !formData.value.CategoriesID || !formData.value.ReviewDate) {
    toastWarning('กรุณากรอกข้อมูลให้ครบ'); return;
  }
  isSaving.value = true;
  try {
    const payload = {
      questionTitle: formData.value.QuestionTitle,
      questionText: formData.value.QuestionText,
      reviewDate: formData.value.ReviewDate,
      categoriesId: formData.value.CategoriesID,
      keywords: formData.value.keywords
    };
    if (isEditing.value && editingId.value) {
      await $axios.put(`/questionsanswers/update/${editingId.value}`, payload);
      toastSuccess('แก้ไขสำเร็จ!', 2000);
    } else {
      const res = await $axios.post('/questionsanswers/create', payload);
      toastSuccess('เพิ่มรายการสำเร็จ!', 2000);
      if (res.data?.skippedKeywords?.length > 0) setTimeout(() => toastWarning(`ข้ามคำสำคัญ: ${res.data.skippedKeywords.join(', ')}`, 3500), 500);
    }
    closeCrudModal();
    await fetchQuestionsAnswers();
  } catch (err) {
    toastError(err.response?.data?.message || err.message || 'เกิดข้อผิดพลาด', 4000);
  } finally { isSaving.value = false; }
};

const confirmDeleteFromPreview = async () => {
  if (!previewItem.value) return;
  const item = previewItem.value;
  const id = item.QuestionsAnswersID;
  
  try {
    await confirmAction({
      title: 'ยืนยันการลบ',
      message: `คุณต้องการลบรายการ "<strong>${item.QuestionTitle}</strong>" ใช่หรือไม่?`,
      variant: 'danger',
      confirmText: 'ลบ',
      loadingText: 'กำลังลบ...',
      onConfirm: async () => {
        await $axios.delete(`/questionsanswers/delete/${id}`);
        toastSuccess('ลบสำเร็จ!', 2000);
        closeDrawer();
        await fetchQuestionsAnswers();
      }
    });
  } catch (err) {
    toastError(err.response?.data?.message || 'เกิดข้อผิดพลาด', 4000);
  }
};

// Data & Pagination
const tagColors = ['#0071e3', '#34C759', '#FF3B30', '#FF9500', '#AF52DE', '#5856D6', '#FF2D55', '#5AC8FA'];

const categoriesNameMapSafe = computed(() => props.categoriesNameMap || {});

const fetchQuestionsAnswers = async () => {
  loading.value = true;
  try {
    const response = await $axios.get('/questionsanswers');
    questionsAnswers.value = Array.isArray(response.data) ? response.data : (response.data?.data || []);
  } catch (err) { error.value = 'Failed to load'; } 
  finally { loading.value = false; }
};

const allQuestions = computed(() => Array.isArray(questionsAnswers.value) ? questionsAnswers.value : []);

// Helper to check if a question is expired/expiring
function getQuestionStatus(item) {
  if (!item.ReviewDate) return 'active';
  const now = new Date();
  const reviewDate = new Date(item.ReviewDate);
  if (isNaN(reviewDate.getTime())) return 'active';
  
  const diffMs = reviewDate - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMs <= 0) return 'expired';
  if (diffDays <= 14) return 'expiring';
  return 'active';
}

const filteredQuestions = computed(() => {
  let arr = allQuestions.value;
  
  // Apply category filter
  if (qaFilters.value.category) {
    const filterCat = String(qaFilters.value.category);
    arr = arr.filter(item => {
      const itemCat = String(item.CategoriesID);
      // Match exact category OR sub-category (e.g. filter "5" matches "5", "5-1", "5-2")
      return itemCat === filterCat || itemCat.startsWith(filterCat + '-');
    });
  }
  
  // Apply status filter (active/expired/expiring)
  if (qaFilters.value.status) {
    arr = arr.filter(item => getQuestionStatus(item) === qaFilters.value.status);
  }
  
  // Apply date range filter (based on ReviewDate)
  if (qaFilters.value.dateFrom) {
    const fromDate = new Date(qaFilters.value.dateFrom);
    fromDate.setHours(0, 0, 0, 0);
    arr = arr.filter(item => {
      if (!item.ReviewDate) return false;
      return new Date(item.ReviewDate) >= fromDate;
    });
  }
  if (qaFilters.value.dateTo) {
    const toDate = new Date(qaFilters.value.dateTo);
    toDate.setHours(23, 59, 59, 999);
    arr = arr.filter(item => {
      if (!item.ReviewDate) return false;
      return new Date(item.ReviewDate) <= toDate;
    });
  }
  
  // Apply min/max likes filter
  if (qaFilters.value.minValue !== null) {
    arr = arr.filter(item => (item.likeCount || 0) >= qaFilters.value.minValue);
  }
  if (qaFilters.value.maxValue !== null) {
    arr = arr.filter(item => (item.likeCount || 0) <= qaFilters.value.maxValue);
  }
  
  // Apply search filter
  const q = (searchQuery.value || '').toString().trim().toLowerCase();
  if (q) {
    arr = arr.filter(item => {
      const str = JSON.stringify(item).toLowerCase();
      return str.includes(q);
    });
  }
  
  return arr;
});

// Sort filtered questions based on AppleFilters settings
const sortedQuestions = computed(() => {
  const arr = filteredQuestions.value.slice();
  const { sortBy, sortOrder } = qaFilters.value;
  const order = sortOrder === 'asc' ? 1 : -1;
  
  return arr.sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'date') {
      const aTime = a?.ReviewDate ? new Date(a.ReviewDate).getTime() : 0;
      const bTime = b?.ReviewDate ? new Date(b.ReviewDate).getTime() : 0;
      comparison = aTime - bTime;
    } else if (sortBy === 'id') {
      comparison = (a?.QuestionsAnswersID || 0) - (b?.QuestionsAnswersID || 0);
    } else if (sortBy === 'title') {
      comparison = (a?.QuestionTitle || '').localeCompare(b?.QuestionTitle || '', 'th');
    } else if (sortBy === 'likes') {
      comparison = (a?.likeCount || 0) - (b?.likeCount || 0);
    } else if (sortBy === 'unlikes') {
      comparison = (a?.unlikeCount || 0) - (b?.unlikeCount || 0);
    }
    
    return comparison * order;
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(sortedQuestions.value.length / itemsPerPage.value)));
const totalEntries = computed(() => sortedQuestions.value.length);
const startIndex = computed(() => totalEntries.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1);
const endIndex = computed(() => totalEntries.value === 0 ? 0 : Math.min(currentPage.value * itemsPerPage.value, totalEntries.value));
const paginatedQuestions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return sortedQuestions.value.slice(start, start + itemsPerPage.value);
});

const pagesToShow = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  if(total<=5) return Array.from({length:total},(_,i)=>i+1);
  if(current<=3) return [1,2,3,4,5];
  if(current>=total-2) return [total-4,total-3,total-2,total-1,total];
  return [current-2,current-1,current,current+1,current+2];
});

function goToPage(page) { if (page>=1 && page<=totalPages.value) currentPage.value = page; }
function prevPage() { goToPage(Math.max(1, currentPage.value - 1)); }
function nextPage() { goToPage(Math.min(totalPages.value, currentPage.value + 1)); }
function firstPage() { goToPage(1); }
function lastPage() { goToPage(totalPages.value); }

watch(searchQuery, () => { currentPage.value = 1; });
watch(qaFilters, () => { currentPage.value = 1; }, { deep: true });

// Category Logic
const mainCategories = computed(() => {
  return categoriesList.value.filter(cat => !String(cat.CategoriesID).includes('-'))
    .sort((a, b) => String(a.CategoriesID).localeCompare(String(b.CategoriesID), undefined, { numeric: true }));
});
const getSubsByParent = (parentId) => {
  const pId = String(parentId);
  return categoriesList.value.filter(cat => String(cat.CategoriesID).startsWith(pId + '-') && String(cat.CategoriesID) !== pId)
    .sort((a, b) => String(a.CategoriesID).localeCompare(String(b.CategoriesID), undefined, { numeric: true }));
};
const sortedCategoriesForDropdown = computed(() => {
  const result = [];
  for (const main of mainCategories.value) {
    result.push({ ...main, isMain: true });
    const subs = getSubsByParent(main.CategoriesID);
    for (const sub of subs) result.push({ ...sub, isMain: false });
  }
  return result;
});

// Upload Logic
function onFileChange(e) {
  const f = e.target.files?.[0];
  if(f) uploadedFile.value = f;
  e.target.value = '';
}
function onFileDrop(e) {
  const f = e.dataTransfer?.files?.[0];
  if(f) uploadedFile.value = f;
}
const saveUpload = async () => {
  if (!uploadedFile.value) return;
  isUploading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', uploadedFile.value);
    const resp = await $axios.post('/questionsanswers/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 });
    toastSuccess(resp.data?.message || 'Upload successful!');
    await fetchQuestionsAnswers();
    closeUploadModal();
  } catch (err) { toastError('Upload Failed: ' + (err.response?.data?.message || err.message)); }
  finally { isUploading.value = false; }
};
const downloadTemplateFile = async () => {
  try {
    const res = await $axios.get('/questionsanswers/template', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a'); a.href=url; a.download='template.csv'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  } catch(e) { toastError('Download Failed'); }
};
const exportCurrentDataAsCsv = () => {
  if (!questionsAnswers.value.length) return;
  try {
    const headers = ['QuestionTitle', 'QuestionText', 'ReviewDate', 'CategoriesID', 'Keywords'];
    const rows = questionsAnswers.value.map(item => [
      `"${(item.QuestionTitle||'').replace(/"/g,'""')}"`,
      `"${(item.QuestionText||'').replace(/"/g,'""')}"`,
      item.ReviewDate ? item.ReviewDate.split('T')[0] : '',
      item.CategoriesID || '',
      `"${(item.keywords||[]).map(k=>k.KeywordText).join(',')}"`
    ]);
    const csv = [headers.join(','), ...rows.join('\n')].join('\n'); // oops logic fix
    // Fix join logic
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const url = URL.createObjectURL(new Blob(["\uFEFF"+csvContent], {type: 'text/csv;charset=utf-8;'}));
    const a = document.createElement('a'); a.href=url; a.download='export.csv'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  } catch(e) { toastError('Export Failed'); }
};

onMounted(() => {
  unbindSidebarResize = bindSidebarResize();
  const token = localStorage.getItem("userToken");
  if (!token) { router.replace({ name: "login" }); return; }
  const info = localStorage.getItem("userInfo");
  if (info) userInfoObject.value = JSON.parse(info);
  userType.value = localStorage.getItem("userType") || "";
  
  // Close sidebar on mount
  isMobileSidebarOpen.value = false;
  document.body.classList.remove('sidebar-open');
  document.body.classList.remove('sidebar-mobile-expanded');
  
  fetchQuestionsAnswers();
  fetchCategories();
  nextTick(() => document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new Tooltip(el)));
});
onUnmounted(() => {
  if (unbindSidebarResize) unbindSidebarResize();
  isMobileSidebarOpen.value = false;
  document.body.classList.remove('sidebar-open');
  document.body.classList.remove('sidebar-mobile-expanded');
});
</script>

<style scoped>
@import '@/assets/dashboard-styles.css';
@import '@/assets/main.css';
@import '@/assets/pagination-styles.css';
@import '@/assets/sidebar.css';

/* Mobile sidebar toggle button styles (inline here so it's local to this view) */
button.mobile-sidebar-toggle.mobile-inline-toggle { display: none !important; border: none; background: #fff; width: 36px; height: 36px; align-items: center; justify-content: center; border-radius: 8px; box-shadow: 0 6px 18px rgba(0,0,0,0.08); padding: 0; }
.mobile-sidebar-toggle i { font-size: 1.05rem; }
@media (max-width: 768px) { button.mobile-sidebar-toggle.mobile-inline-toggle { display: flex !important; margin-right: 8px; align-self: center; } }
.mobile-sidebar-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.36); z-index: 98; }

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

@keyframes glowPulse {
  0%, 100% { 
    opacity: 0.2;
    r: 6px;
  }
  50% { 
    opacity: 0.4;
    r: 10px;
  }
}

/* Info Card Styles */
.info-card {
  background: linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%);
  border-left: 4px solid #7c3aed;
}

.book-icon {
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 2px 8px rgba(124, 58, 237, 0.12));
}

.book-cover {
  animation: fadeIn 0.4s ease-out forwards;
}

.book-spine {
  animation: fadeIn 0.4s ease-out 0.1s forwards;
}

.book-page {
  animation: slideIn 0.3s ease-out forwards;
  opacity: 0;
}

.page-1 { animation-delay: 0.2s; }
.page-2 { animation-delay: 0.3s; }
.page-3 { animation-delay: 0.4s; }
.page-4 { animation-delay: 0.5s; }
.page-5 { animation-delay: 0.6s; }

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateX(-8px);
  }
  to { 
    opacity: 1;
    transform: translateX(0);
  }
}

.bookmark {
  animation: bookmarkWave 2s ease-in-out infinite;
  animation-delay: 0.8s;
}

@keyframes bookmarkWave {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(6px); }
}

.icon-svg {
  animation: iconBounce 0.6s ease-out forwards;
  opacity: 0;
}

.icon-svg:nth-child(n) { animation-delay: calc(0.1s * var(--svg-index, 1)); }

@keyframes iconBounce {
  0% { 
    opacity: 0;
    transform: scale(0.8) translateY(-4px);
  }
  100% { 
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Mobile sidebar toggle button styles (inline here so it's local to this view) */
button.mobile-sidebar-toggle.mobile-inline-toggle { display: none !important; border: none; background: #fff; width: 36px; height: 36px; align-items: center; justify-content: center; border-radius: 8px; box-shadow: 0 6px 18px rgba(0,0,0,0.08); padding: 0; }
.mobile-sidebar-toggle i { font-size: 1.05rem; }
@media (max-width: 768px) { button.mobile-sidebar-toggle.mobile-inline-toggle { display: flex !important; margin-right: 8px; align-self: center; } }
.mobile-sidebar-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.36); z-index: 98; }

/* =========================================
   Apple Design System
   ========================================= */
:root {
  --apple-blue: #0071e3;
  --apple-blue-hover: #0077ED;
  --apple-red: #FF3B30;
  --apple-gray: #86868b;
  --apple-light-bg: #F5F5F7;
  --apple-card-bg: #FFFFFF;
  --apple-border: #E5E5EA;
  --apple-radius: 12px;
  --apple-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  --apple-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.dashboard-container {
  font-family: var(--apple-font);
  background-color: var(--apple-light-bg);
  min-height: 100vh;
  display: flex;
}

.main-content {
  flex-grow: 1;
  padding-bottom: 40px;
}

.page-title {
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
  .main-content { grid-column: 1/-1; width: 100%; }
  
  .mobile-sidebar-backdrop {
    display: block;
  }
  
  :global(.sidebar) {
    display: none;
    position: fixed !important;
    left: 0 !important;
    top: 0 !important;
    width: 250px !important;
    height: 100vh !important;
    z-index: 999 !important;
    transform: translateX(-100%) !important;
    transition: transform 0.3s ease !important;
  }
  
  :global(body.sidebar-open .sidebar) {
    display: block !important;
    transform: translateX(0) !important;
  }
}

  font-weight: 700;
  letter-spacing: -0.02em;
  color: #1d1d1f;
}

/* =========================================
   Buttons & Inputs (Improved contrast for non-primary actions)
   ========================================= */
/* =========================================
   Header Section (Apple Responsive)
   ========================================= */
.header-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: fadeIn 0.3s ease-out;
}

.header-top {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.5px;
  flex: 1;
  min-width: 200px;
}

.header-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.search-container-wrapper {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}

.search-container {
  position: relative;
  width: 100%;
  max-width: 340px;
  display: flex;
  align-items: center;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .header-section {
    gap: 12px;
  }

  .header-top {
    gap: 8px;
    width: 100%;
  }

  .page-title {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .header-actions {
    gap: 6px;
  }

  .btn-apple-primary {
    padding: 8px 14px;
    font-size: 0.9rem;
    border-radius: 10px;
  }

  .btn-apple-primary i {
    margin-right: 0;
  }

  .btn-apple-icon {
    width: 38px;
    height: 38px;
    font-size: 0.95rem;
  }

  .search-container-wrapper {
    width: 100%;
    justify-content: stretch;
  }

  .search-container {
    max-width: 100%;
  }

  .search-input {
    font-size: 1rem;
  }
}

@media (max-width: 576px) {
  .header-top {
    gap: 6px;
    margin-bottom: 8px;
  }

  .page-title {
    font-size: 1.25rem;
    min-width: auto;
  }

  .header-actions {
    gap: 4px;
  }

  .btn-apple-primary {
    padding: 7px 12px;
    font-size: 0.85rem;
    border-radius: 10px;
  }

  .btn-apple-primary span {
    display: none;
  }

  .btn-apple-icon {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }

  .search-input {
    padding: 8px 36px;
    font-size: 0.95rem;
  }

  .search-icon {
    left: 10px;
  }

  .search-clear {
    right: 10px;
  }
}

.btn-apple-primary {
  background: linear-gradient(135deg, #007AFF 0%, #0051D4 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 8px 18px;
  font-weight: 700;
  font-size: 0.95rem;
  transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 6px 18px rgba(0, 90, 255, 0.12);
}
.btn-apple-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 30px rgba(0, 90, 255, 0.18);
  background: linear-gradient(135deg, #0A8AFF 0%, #0046C4 100%);
}

.btn-apple-secondary {
  background: #F4F6F8; /* light neutral background */
  color: #1d1d1f;
  border: 1px solid rgba(13, 20, 25, 0.06);
  border-radius: 12px;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 120ms ease, border-color 120ms ease;
}
.btn-apple-secondary:hover:not(:disabled) {
  background: #E9EDF2;
  border-color: rgba(13,20,25,0.08);
}
.btn-apple-secondary.small {
  padding: 6px 12px;
  font-size: 0.85rem;
}

/* Small tag-style buttons used for quick options (+1 month, +3 months etc) */
.btn-tag-option {
  background: #F4F6F8;
  color: #1d1d1f;
  border: 1px solid rgba(13,20,25,0.06);
  border-radius: 12px;
  padding: 6px 10px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 120ms ease, border-color 120ms ease, transform 120ms ease;
  cursor: pointer;
}
.btn-tag-option:hover:not(:disabled) {
  background: #E9EDF2;
  border-color: rgba(13,20,25,0.08);
  transform: translateY(-1px);
}
.btn-tag-option:active {
  transform: translateY(0) scale(0.995);
}
.btn-tag-option:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Answer Type Toggle Buttons */
.btn-type-option {
  background: #F4F6F8;
  color: #1d1d1f;
  border: 1px solid rgba(13,20,25,0.06);
  border-radius: 10px;
  padding: 10px 16px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 150ms ease;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.btn-type-option:hover:not(.active) {
  background: #E9EDF2;
  border-color: rgba(13,20,25,0.08);
}
.btn-type-option.active {
  background: linear-gradient(135deg, #007AFF 0%, #0051D4 100%);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(0, 90, 255, 0.25);
}

/* GPS Type Toggle Buttons */
.btn-gps-option {
  background: #F4F6F8;
  color: #6b6b6b;
  border: 1px solid rgba(13,20,25,0.06);
  border-radius: 8px;
  padding: 8px 14px;
  font-weight: 500;
  font-size: 0.85rem;
  transition: all 150ms ease;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.btn-gps-option:hover:not(.active) {
  background: #E9EDF2;
  color: #1d1d1f;
}
.btn-gps-option.active {
  background: #34C759;
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(52, 199, 89, 0.3);
}

/* GPS Input Section */
.gps-input-section {
  background: rgba(0, 113, 227, 0.04);
  border: 1px solid rgba(0, 113, 227, 0.1);
  border-radius: 12px;
  padding: 16px;
}

.input-with-icon {
  position: relative;
}
.input-icon-left {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #86868b;
  font-size: 1rem;
}

.gps-preview {
  background: rgba(52, 199, 89, 0.08);
  border: 1px solid rgba(52, 199, 89, 0.2);
  border-radius: 8px;
  padding: 12px;
}

/* Map Picker Styles */
.map-picker-container {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  overflow: hidden;
}

.map-picker-box {
  height: 280px;
  width: 100%;
  border-radius: 10px;
  border: 2px solid rgba(0, 113, 227, 0.15);
  z-index: 1;
}

.map-picker-box .leaflet-container {
  border-radius: 10px;
}

.btn-locate-me {
  background: linear-gradient(135deg, #34C759 0%, #28a745 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 150ms ease;
}
.btn-locate-me:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 199, 89, 0.3);
}
.btn-locate-me:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.map-search-box {
  position: relative;
}
.map-search-box .input-with-icon {
  position: relative;
}
.btn-search-map {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--apple-blue);
  color: white;
  border: none;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 150ms ease;
  z-index: 2;
}
.btn-search-map:hover:not(:disabled) {
  background: var(--apple-blue-hover);
}
.btn-search-map:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Spin animation for loading */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.spin {
  animation: spin 1s linear infinite;
}

.btn-apple-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #007AFF 0%, #0051D4 100%);
  border: none;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
  font-size: 1.2rem;
  box-shadow: 0 6px 16px rgba(0, 90, 255, 0.12);
}
.btn-apple-icon:hover {
  transform: translateY(-1px) scale(1.02);
  background: linear-gradient(135deg, #0A8AFF 0%, #0046C4 100%);
  color: #ffffff;
}

/* Search Bar */
.search-container { position: relative; width: 100%; max-width: 360px; }
.search-input {
  width: 100%;
  padding: 10px 40px;
  border-radius: 12px;
  border: 1px solid var(--apple-border);
  background: white;
  font-size: 0.95rem;
  transition: all 0.2s;
}
.search-input:focus {
  outline: none;
  border-color: var(--apple-blue);
  box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.15);
}
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #86868b; }
.search-clear { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); border: none; background: none; color: #86868b; cursor: pointer; }

/* =========================================
   Apple Card & Table
   ========================================= */
.apple-card {
  background: var(--apple-card-bg);
  border-radius: var(--apple-radius);
  box-shadow: var(--apple-shadow);
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.02);
}

.qa-table {
  width: 100%;
  table-layout: fixed;
}

.qa-table th,
.qa-table td {
  overflow: hidden;
}

.qa-table tbody td {
  white-space: nowrap;
}

.cell-ellipsis {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.keywords-nowrap {
  flex-wrap: nowrap !important;
  overflow: hidden;
  min-width: 0;
}

.keywords-nowrap > * {
  flex: 0 0 auto;
}

.apple-table thead th {
  background: #F9F9FB;
  font-weight: 600;
  color: #1d1d1f;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  border-bottom: 1px solid var(--apple-border);
  padding: 14px 16px;
}

.apple-table tbody td {
  padding: 14px 16px;
  border-bottom: 1px solid #F5F5F5;
  color: #1d1d1f;
  font-size: 0.95rem;
}

.apple-table tr.apple-row:hover {
  background-color: rgba(0, 113, 227, 0.04);
  cursor: pointer;
}

/* Badges */
.badge-pill {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap; /* prevent wrapping inside the badge */
}
.category-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 120px; /* ensure badges are not too narrow */
  max-width: 260px; /* prevent badges from stretching too wide */
  text-align: center;
}
.category-badge.large { font-size: 0.95rem; padding: 8px 14px; min-width: 160px; }
.category-badge.large { font-size: 0.9rem; padding: 6px 12px; }

/* Review date column: ensure enough space and center alignment */
.col-review-date { width: 160px; min-width: 140px; max-width: 220px; }
.review-date-cell { min-width: 140px; }
.review-date-wrap { display: flex; justify-content: center; align-items: center; }

@media (max-width: 992px) {
  .table-responsive { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .apple-table { min-width: 860px; }
}

@media (max-width: 768px) {
  .col-review-date { width: 180px; min-width: 140px; }
  .review-date-cell { min-width: 140px; }

  .table-responsive { box-shadow: none; }
  .apple-table { min-width: 0; }
  .apple-table thead { display: none; }
  .apple-table tbody { display: flex; flex-direction: column; gap: 1rem; }
  .apple-table tbody tr { display: block; background: white; border-radius: 16px; border: 1px solid rgba(0,0,0,0.04); box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08); padding: 0.75rem 0; }
  .apple-table tbody td { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; border: none; border-bottom: 1px solid rgba(0,0,0,0.04); }
  .apple-table tbody td:last-child { border-bottom: none; }
  .apple-table tbody td::before {
    content: attr(data-label);
    flex: 1;
    font-size: 0.65rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #8c8c92;
    font-weight: 600;
    margin-right: 0.75rem;
    white-space: nowrap;
  }
  .apple-table tbody td[data-label=""]::before { display: none; }
  .apple-table tbody td .question-title-cell,
  .apple-table tbody td .question-text-cell { max-width: 60%; min-width: 0; }
  .apple-table tbody td .category-badge { margin-left: 8px; }
  .apple-table tbody td .stat-pill { margin-left: 8px; }
}

@media (max-width: 480px) {
  .apple-table tbody td { flex-direction: column; align-items: flex-start; }
  .apple-table tbody td::before { margin-bottom: 0.25rem; }
  .stat-pill { width: 100%; justify-content: flex-start; }
}

.keyword-tag {
  background: rgba(0,0,0,0.05);
  color: #1d1d1f;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
}
.keyword-tag.large { font-size: 0.85rem; padding: 4px 10px; }
.keyword-tag.removable { cursor: pointer; transition: background 0.2s; }
.keyword-tag.removable:hover { background: rgba(255, 59, 48, 0.1); color: var(--apple-red); }
.keyword-tag-more { font-size: 0.75rem; color: #86868b; padding: 2px 6px; }

/* Stats */
.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s;
  background: rgba(0,0,0,0.03);
  color: #86868b;
}
.stat-pill.like.active { background: rgba(52, 199, 89, 0.1); color: #34C759; }
.stat-pill.unlike.active { background: rgba(255, 59, 48, 0.1); color: #FF3B30; }
.stat-pill.pending.active { background: rgba(255, 149, 0, 0.1); color: #FF9500; }
.stat-pill:hover { transform: scale(1.05); }

/* Pagination */
.pagination { gap: 4px; }
.pagination .page-link {
  border: none;
  border-radius: 8px !important;
  padding: 6px 12px;
  color: #1d1d1f;
  font-weight: 500;
  transition: all 0.2s;
}
.pagination .page-link:hover { background: rgba(0,0,0,0.05); }
.pagination .page-item.active .page-link {
  background: var(--apple-blue);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 113, 227, 0.25);
}

/* =========================================
   Apple Modals (Glassmorphism)
   ========================================= */
.apple-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.apple-modal-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  width: 100%;
  max-width: 550px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.4) inset;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.apple-modal-content.wide-modal { max-width: 800px; }

.apple-modal-header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  z-index: 2;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.apple-modal-header-bg {
  position: absolute; top: 0; left: 0; right: 0; height: 80px;
  background: linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%);
  pointer-events: none; z-index: 1;
}

.apple-modal-title { font-size: 1.25rem; font-weight: 700; color: #1d1d1f; margin: 0; }
.apple-modal-subtitle { font-size: 0.9rem; color: #86868b; }

.apple-close-btn {
  background: rgba(0,0,0,0.05);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #1d1d1f;
  transition: all 0.2s;
}
.apple-close-btn:hover { background: rgba(0,0,0,0.1); transform: rotate(90deg); }

.apple-modal-body {
  padding: 24px;
  overflow-y: auto;
  max-height: 80vh;
  position: relative;
  z-index: 2;
}

/* Modal Inputs */
.apple-input-group { margin-bottom: 16px; }
.apple-input-group label { font-size: 0.85rem; font-weight: 600; color: #1d1d1f; margin-bottom: 6px; display: block; }
.apple-input {
  width: 100%;
  background: rgba(118, 118, 128, 0.12);
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 1rem;
  color: #1d1d1f;
  transition: all 0.2s;
}
.apple-input:focus { outline: none; background: white; box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.15); }
.apple-input[type="date"] { min-width: 200px; max-width: 100%; }
.apple-textarea { resize: vertical; min-height: 100px; }

.select-wrapper { position: relative; }
.select-icon { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 0.8rem; color: #86868b; pointer-events: none; }
.select-wrapper select { appearance: none; padding-right: 36px; }

.keyword-input-wrapper { position: relative; }
.btn-icon-absolute {
  position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
  width: 28px; height: 28px; border-radius: 6px;
  background: white; border: none; color: var(--apple-blue);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.apple-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }

/* Upload Area */
.upload-drop-area-apple {
  border: 2px dashed #C7C7CC;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  background: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: all 0.2s;
}
.upload-drop-area-apple:hover { border-color: var(--apple-blue); background: rgba(0, 113, 227, 0.04); }
.upload-icon-wrapper { font-size: 2.5rem; color: var(--apple-blue); margin-bottom: 8px; }
.upload-text { font-size: 1rem; color: #1d1d1f; }
.upload-hint { font-size: 0.85rem; color: #86868b; margin-top: 4px; }

/* Transitions */
.apple-zoom-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.apple-zoom-leave-active { transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1); }
.apple-zoom-enter-from, .apple-zoom-leave-to { opacity: 0; transform: scale(0.95); }

/* Drawer */
.apple-drawer {
  position: fixed; top: 0; right: -500px; width: 500px; max-width: 100vw; height: 100vh;
  background: white; box-shadow: -4px 0 24px rgba(0,0,0,0.1); z-index: 1050;
  transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex; flex-direction: column;
}
.apple-drawer.drawer-open { right: 0; }
.drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(4px); z-index: 1049; }
.drawer-header { padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.05); }
.drawer-title { font-size: 1.1rem; font-weight: 700; margin: 0; }
.btn-close-drawer { border: none; background: rgba(0,0,0,0.05); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.btn-close-drawer:hover { background: rgba(0,0,0,0.1); }
.drawer-body { flex: 1; overflow-y: auto; padding: 24px; }
.drawer-section { margin-bottom: 24px; }
.drawer-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #86868b; margin-bottom: 4px; }
.drawer-value { font-size: 1rem; color: #1d1d1f; line-height: 1.5; }
.drawer-footer { padding: 20px 24px; border-top: 1px solid rgba(0,0,0,0.05); background: #F9F9FB; }

.empty-state { display: flex; flex-direction: column; align-items: center; color: var(--apple-gray); }
.empty-state i { font-size: 2.5rem; margin-bottom: 8px; opacity: 0.5; }

.whitespace-prewrap { white-space: pre-wrap; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
</style>