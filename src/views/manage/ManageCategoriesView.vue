<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <Sidebar :userType="userType" :userInfoObject="userInfoObject" />

    <!-- Main Content -->
    <main class="main-content">
      <div class="container-fluid">
        <div v-if="categoriesLoading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Loading categories data...</p>
        </div>

        <div v-else>
          <!-- Header Section -->
          <!-- Mobile sidebar backdrop (click to close) -->
          <div v-if="isMobileSidebarOpen" class="mobile-sidebar-backdrop" @click="toggleSidebar" aria-hidden="true"></div>

          <!-- Header Section: Title + Action Buttons -->
          <div class="header-section my-4">
            <div class="header-top d-flex align-items-center gap-3 mb-3">
              <button class="mobile-sidebar-toggle mobile-inline-toggle" @click.stop="toggleSidebar" :aria-label="isMobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'">
                <i :class="isMobileSidebarOpen ? 'bi bi-x' : 'bi bi-list'"></i>
              </button>

              <svg class="brain-icon" width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Background Circle -->
                <circle cx="32" cy="32" r="30" fill="#059669" opacity="0.08"/>
                
                <!-- Grid Box 1 (Top-Left) -->
                <rect class="brain-outline brain-left" 
                  x="14" y="14" width="16" height="16" 
                  stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                
                <!-- Grid Box 2 (Top-Right) -->
                <rect class="brain-wrinkle wrinkle-1" 
                  x="34" y="14" width="16" height="16" 
                  stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                
                <!-- Grid Box 3 (Bottom-Left) -->
                <rect class="brain-wrinkle wrinkle-2" 
                  x="14" y="34" width="16" height="16" 
                  stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                
                <!-- Grid Box 4 (Bottom-Right) -->
                <rect class="brain-wrinkle wrinkle-1" 
                  x="34" y="34" width="16" height="16" 
                  stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                
                <!-- Dots for animation -->
                <g class="neuron-group">
                  <circle class="neuron-glow" cx="22" cy="22" r="5" fill="#059669" opacity="0.2"/>
                  <circle class="neuron neuron-1" cx="22" cy="22" r="2.5" fill="#059669"/>
                </g>
                <g class="neuron-group">
                  <circle class="neuron-glow" cx="42" cy="42" r="5" fill="#10b981" opacity="0.2"/>
                  <circle class="neuron neuron-2" cx="42" cy="42" r="2.5" fill="#10b981"/>
                </g>
              </svg>

              <h2 class="page-title m-0">Manage Categories</h2>
              
              <!-- Action buttons group -->
              <div class="header-actions d-flex gap-2">
                <button class="apple-btn-primary" @click="openCrudModal()">
                  <i class="bi bi-plus-lg"></i>
                  <span class="d-none d-sm-inline">เพิ่มหมวดหมู่</span>
                </button>
                <button class="apple-icon-btn-large" @click="openUploadModal" title="อัพโหลด CSV">
                  <i class="bi bi-cloud-upload"></i>
                </button>
              </div>
            </div>

            <!-- Info Card: Guide -->
            <div class="info-card apple-card mb-4 p-4 rounded-4 shadow-apple">
              <!-- SVG Grid Icon Animation -->
              <svg class="book-icon float-start me-3" width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Background -->
                <circle cx="36" cy="36" r="32" fill="#059669" opacity="0.08"/>
                <!-- Grid Box 1 (Top-Left) -->
                <rect x="14" y="14" width="18" height="18" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                <!-- Grid Box 2 (Top-Right) -->
                <rect x="40" y="14" width="18" height="18" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                <!-- Grid Box 3 (Bottom-Left) -->
                <rect x="14" y="40" width="18" height="18" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                <!-- Grid Box 4 (Bottom-Right) -->
                <rect x="40" y="40" width="18" height="18" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                <!-- Dots -->
                <circle class="neuron" cx="23" cy="23" r="2.5" fill="#059669" opacity="0"/>
                <circle class="neuron" cx="49" cy="49" r="2.5" fill="#10b981" opacity="0"/>
              </svg>
              <h5 class="fw-bold mb-3">หมวดหมู่คืออะไร?</h5>
              <p class="mb-2 text-muted"><strong>หมวดหมู่</strong> คือการจัดหมวดหมู่คำถาม-คำตอบให้เป็นระเบียบ เพื่อให้ระบบสามารถค้นหาและจัดการข้อมูลได้อย่างมีประสิทธิภาพ</p>
              <ul class="mb-3 text-muted small">
                <li class="d-flex align-items-center gap-2 mb-2">
                  <svg class="icon-svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="2" y="2" width="8" height="8" stroke="#059669" stroke-width="2"/>
                    <rect x="12" y="2" width="6" height="8" stroke="#059669" stroke-width="2"/>
                    <rect x="2" y="12" width="8" height="6" stroke="#059669" stroke-width="2"/>
                    <rect x="12" y="12" width="6" height="6" stroke="#059669" stroke-width="2"/>
                  </svg>
                  <span>องค์กายสามารถสร้างหมวดหมู่ตามกระทำการบริการที่ต้องการ</span>
                </li>
                <li class="d-flex align-items-center gap-2 mb-2">
                  <svg class="icon-svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" stroke="#059669" stroke-width="2"/>
                    <path d="M6 10 L9 13 L14 7" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>ทำให้การค้นหาและการจัดการข้อมูลเป็นระเบียบและง่ายขึ้น</span>
                </li>
                <li class="d-flex align-items-center gap-2">
                  <svg class="icon-svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 5 L16 5 M4 10 L16 10 M4 15 L16 15" stroke="#059669" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <span>สามารถอัพโหลด CSV เพื่อเพิ่มหมวดหมู่จำนวนมากได้ทีเดียว</span>
                </li>
              </ul>
              <p class="mb-0 small text-success fw-bold d-flex align-items-center gap-2">
                <svg class="icon-svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="#059669" stroke-width="2"/>
                  <path d="M10 6 L10 11" stroke="#ffd60a" stroke-width="2" stroke-linecap="round"/>
                  <path d="M8 14 L12 14" stroke="#059669" stroke-width="2" stroke-linecap="round"/>
                  <circle cx="10" cy="8" r="4" fill="#ffd60a" opacity="0.3"/>
                </svg>
                <span>สามารถเพิ่ม/ลบ/แก้ไข หมวดหมู่ได้ตลอดเวลา</span>
              </p>
            </div>

            <!-- Search bar: Full width on mobile, normal on desktop -->
            <div class="search-container-wrapper">
              <div class="search-container">
                <i class="bi bi-search search-icon"></i>
                <input
                  type="text"
                  class="search-input"
                  placeholder="ค้นหาหมวดหมู่..."
                  v-model="searchQueryCategories"
                />
                <button v-if="searchQueryCategories" class="search-clear" @click="searchQueryCategories = ''">
                  <i class="bi bi-x-circle-fill"></i>
                </button>
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
            class="px-3 mb-3"
            @change="onFiltersChange"
          />

          <!-- Table Section -->
          <div class="apple-card">
            <div class="table-responsive">
              <table class="table apple-table mb-0">
                <thead>
                  <tr>
                    <th class="ps-4" style="width: 50px;"></th>
                    <th>CategoriesID</th>
                    <th>CategoriesName</th>
                    <th>Type</th>
                    <th>Contact</th>
                    <th>File</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(cat, idx) in visibleParents" :key="cat.CategoriesID">
                    <tr class="align-middle parent-row clickable-row" @click="openPreview(cat)">
                      <td class="ps-4" data-label="">
                        <button 
                          v-if="hasSubCategories(cat.CategoriesID, cat.CategoriesID)" 
                          class="expand-btn" 
                          @click.stop="toggleExpand(cat.CategoriesID)"
                        >
                          <i class="bi" :class="expandedMap[cat.CategoriesID] ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                        </button>
                      </td>
                      <td class="cat-id-cell fw-semibold text-primary" data-label="CategoriesID">
                        {{ cat.CategoriesID }}
                      </td>
                      <td class="fw-medium text-dark" data-label="CategoriesName">{{ cat.CategoriesName }}</td>
                      <td data-label="Type">
                        <span :class="isMain(cat) ? 'apple-badge-blue' : 'apple-badge-gray'">
                          {{ isMain(cat) ? 'Main' : 'Sub' }}
                        </span>
                      </td>
                      <td class="contact-cell" data-label="Contact">
                        <div v-if="cat.Contact">
                          <div v-for="(cc, i) in parseContacts(cat.Contact)" :key="i" class="small text-secondary text-truncate" style="max-width: 200px;">{{ cc }}</div>
                        </div>
                        <span v-else class="text-muted small">-</span>
                      </td>
                      <td data-label="File">
                        <template v-if="cat.CategoriesPDF">
                          <button @click.stop.prevent="openFile(cat.CategoriesPDF, cat.CategoriesName)" class="file-link-btn">
                            <i :class="pdfIconClass(cat.CategoriesPDF)"></i>
                            <span>View</span>
                          </button>
                        </template>
                        <span v-else class="text-muted small">-</span>
                      </td>
                    </tr>

                    <!-- Sub Categories -->
                    <tr
                      v-for="sub in expandedMap[cat.CategoriesID] ? subCategories(cat.CategoriesID, cat.CategoriesID) : []"
                      :key="sub.CategoriesID"
                      class="sub-row clickable-row"
                      @click="openPreview(sub)"
                    >
                      <td data-label=""></td>
                      <td class="cat-id-cell ps-4 text-secondary" data-label="CategoriesID">
                        <span class="tree-line">└</span> {{ sub.CategoriesID }}
                      </td>
                      <td class="ps-4 text-dark" data-label="CategoriesName">{{ sub.CategoriesName }}</td>
                      <td data-label="Type"><span class="apple-badge-gray">Sub</span></td>
                      <td class="contact-cell" data-label="Contact">
                        <div v-if="sub.Contact">
                          <div v-for="(cc, i) in parseContacts(sub.Contact)" :key="i" class="small text-secondary text-truncate">{{ cc }}</div>
                        </div>
                        <span v-else class="text-muted small">-</span>
                      </td>
                      <td data-label="File">
                        <template v-if="sub.CategoriesPDF">
                          <button @click.stop.prevent="openFile(sub.CategoriesPDF, sub.CategoriesName)" class="file-link-btn">
                            <i :class="pdfIconClass(sub.CategoriesPDF)"></i>
                            <span>View</span>
                          </button>
                        </template>
                        <span v-else class="text-muted small">-</span>
                      </td>
                    </tr>
                  </template>

                  <tr v-if="visibleParents.length === 0">
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

            <!-- Pagination footer -->
            <div class="d-flex justify-content-between align-items-center p-3 border-top">
              <div class="small text-secondary">
                Showing {{ categoriesStartIndex }} to {{ categoriesEndIndex }} of {{ categoriesTotalEntries }} entries
              </div>
              <nav aria-label="Page navigation">
                <ul class="pagination pagination-sm mb-0">
                  <li class="page-item" :class="{ disabled: displayPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="categoriesFirstPage">&laquo;</a>
                  </li>
                  <li class="page-item" :class="{ disabled: displayPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="categoriesPrevPage">&lsaquo;</a>
                  </li>
                  <li v-for="page in localPagesToShow" :key="page" class="page-item" :class="{ active: displayPage === page }">
                    <a class="page-link" href="#" @click.prevent="categoriesGoToPage(page)">{{ page }}</a>
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
      </div>
    </main>

    <!-- 1. CRUD Modal (Apple Style) -->
    <transition name="apple-zoom">
      <div v-if="showCrudModal" class="apple-modal-overlay" @click.self="closeCrudModal">
        <div class="apple-modal-content">
          <div class="apple-modal-header-bg"></div>
          <div class="apple-modal-header">
            <div class="d-flex flex-column">
              <h5 class="apple-modal-title">{{ isEditing ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่' }}</h5>
              <span class="apple-modal-subtitle">{{ isEditing ? 'Edit Category' : 'Create New Category' }}</span>
            </div>
            <button class="apple-close-btn" @click="closeCrudModal">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="apple-modal-body">
            <form @submit.prevent="saveCrudForm" class="apple-form-container">
              
              <div class="apple-input-group">
                <label>ชื่อหมวดหมู่ (Category Name) <span class="text-danger">*</span></label>
                <input type="text" class="apple-input" v-model="crudFormData.CategoriesName" required placeholder="เช่น ทุนการศึกษา" />
              </div>

              <div class="apple-input-group">
                <label>ประเภทหมวดหมู่ (Parent Category)</label>
                <div class="select-wrapper">
                  <select class="apple-input" v-model="crudFormData.ParentCategoriesID">
                    <option value="">หมวดหมู่หลัก (Main Category)</option>
                    <option 
                      v-for="cat in parentCategoryOptions" 
                      :key="cat.CategoriesID" 
                      :value="cat.CategoriesID"
                      :disabled="isEditing && editingId === cat.CategoriesID"
                    >
                      {{ cat.CategoriesID }} - {{ cat.CategoriesName }}
                    </option>
                  </select>
                  <i class="bi bi-chevron-down select-icon"></i>
                </div>
              </div>

              <div class="apple-input-group">
                <label>ลิงก์ PDF (Optional)</label>
                <div class="input-with-icon">
                  <i class="bi bi-link-45deg input-icon"></i>
                  <input type="url" class="apple-input ps-5" v-model="crudFormData.CategoriesPDF" placeholder="https://example.com/file.pdf" />
                </div>
              </div>

              <div class="apple-input-group">
                <label>ข้อมูลติดต่อ (Contact / Notes)</label>
                <textarea rows="3" class="apple-input apple-textarea" v-model="crudFormData.Contact" placeholder="เบอร์โทรศัพท์, หมายเหตุ..."></textarea>
              </div>

              <div class="apple-actions">
                <button type="button" class="apple-btn-secondary" @click="closeCrudModal">ยกเลิก</button>
                <button type="submit" class="apple-btn-primary" :disabled="isSaving">
                  <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มหมวดหมู่' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>

    <!-- 2. Upload Modal (Apple Style) -->
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
              <button class="apple-btn-secondary small" @click.stop="downloadTemplateFile" :disabled="isDownloadingTemplate">
                <i class="bi bi-file-earmark-arrow-down me-1"></i> Template
              </button>
              <button class="apple-btn-secondary small" @click.stop="openTemplateModal">
                <i class="bi bi-eye me-1"></i> ตัวอย่าง
              </button>
              <button class="apple-btn-secondary small" @click.stop="downloadLastUploadedFile" :disabled="isDownloadingFile">
                <i class="bi bi-clock-history me-1"></i> ไฟล์ล่าสุด
              </button>
            </div>

            <div class="apple-actions mt-4">
              <button class="apple-btn-secondary" @click="closeUploadModal" :disabled="isUploading">ยกเลิก</button>
              <button class="apple-btn-primary" @click="saveUpload" :disabled="!uploadedFile || isUploading">
                <span v-if="isUploading" class="spinner-border spinner-border-sm me-2"></span>
                อัพโหลด
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 3. Template Preview Modal -->
    <transition name="apple-zoom">
      <div v-if="showTemplateModal" class="apple-modal-overlay" @click.self="closeTemplateModal">
        <div class="apple-modal-content wide-modal">
          <div class="apple-modal-header">
            <h5 class="apple-modal-title">Template Example</h5>
            <button class="apple-close-btn" @click="closeTemplateModal"><i class="bi bi-x-lg"></i></button>
          </div>
          <div class="apple-modal-body p-0 d-flex justify-content-center bg-light">
             <img :src="ex4Url" alt="Template Example" class="img-fluid" style="max-height: 70vh;">
          </div>
        </div>
      </div>
    </transition>

    <!-- 4. File Preview Modal -->
    <transition name="apple-zoom">
      <div v-if="showFileModal" class="apple-modal-overlay" @click.self="closeFileModal">
        <div class="apple-modal-content large-modal" style="height: 90vh;">
          <div class="apple-modal-header py-2">
             <div class="d-flex align-items-center gap-2">
                <i class="bi bi-file-earmark-pdf text-danger fs-5"></i>
                <span class="fw-semibold text-truncate" style="max-width: 300px;">{{ modalFileName }}</span>
             </div>
             <div class="d-flex gap-2">
                <a :href="modalFileUrl" target="_blank" class="apple-icon-btn"><i class="bi bi-box-arrow-up-right"></i></a>
                <button class="apple-close-btn" @click="closeFileModal"><i class="bi bi-x-lg"></i></button>
             </div>
          </div>
          <div class="apple-modal-body p-0 h-100 bg-light position-relative">
            <iframe v-if="isPdf(modalFileUrl)" :src="modalFileUrl" frameborder="0" class="w-100 h-100"></iframe>
            <div v-else class="d-flex flex-column align-items-center justify-content-center h-100">
               <i class="bi bi-file-earmark-x fs-1 text-muted mb-3"></i>
               <p>Preview not available</p>
               <a :href="modalFileUrl" target="_blank" class="apple-btn-primary">Download File</a>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 5. Preview Drawer (Right Sidebar) -->
    <div class="drawer-overlay" v-if="showDrawer" @click="closeDrawer"></div>
    <div class="apple-drawer" :class="{ 'drawer-open': showDrawer }">
      <div class="drawer-header">
        <h5 class="drawer-title">รายละเอียดหมวดหมู่</h5>
        <button class="btn-close-drawer" @click="closeDrawer">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <div class="drawer-body">
        <div class="drawer-section">
          <div class="drawer-label">CategoriesID</div>
          <div class="drawer-value text-primary fw-bold">{{ previewItem?.CategoriesID || '-' }}</div>
        </div>
        <div class="drawer-section">
          <div class="drawer-label">ชื่อหมวดหมู่</div>
          <div class="drawer-value fw-bold text-dark">{{ previewItem?.CategoriesName || '-' }}</div>
        </div>
        <div class="drawer-section">
          <div class="drawer-label">ประเภท</div>
          <div class="drawer-value">
            <span :class="isMain(previewItem) ? 'apple-badge-blue' : 'apple-badge-gray'">
              {{ isMain(previewItem) ? 'Main Category' : 'Sub Category' }}
            </span>
          </div>
        </div>
        <div class="drawer-section" v-if="previewItem?.ParentCategoriesID && !isMain(previewItem)">
          <div class="drawer-label">หมวดหมู่หลัก (Parent)</div>
          <div class="drawer-value">
            <span class="apple-badge-gray">{{ getParentName(previewItem?.ParentCategoriesID) }}</span>
          </div>
        </div>
        <div class="drawer-section">
          <div class="drawer-label">ข้อมูลติดต่อ</div>
          <div class="drawer-value text-dark whitespace-prewrap" v-if="previewItem?.Contact">
            <div v-for="(cc, i) in parseContacts(previewItem.Contact)" :key="i" class="contact-item mb-1">
              <i class="bi bi-telephone-fill text-success me-2"></i>{{ cc }}
            </div>
          </div>
          <div class="drawer-value text-muted" v-else>—</div>
        </div>
        <div class="drawer-section">
          <div class="drawer-label">ไฟล์แนบ</div>
          <div class="drawer-value" v-if="previewItem?.CategoriesPDF">
            <button @click="openFile(previewItem.CategoriesPDF, previewItem.CategoriesName)" class="file-link-btn-large">
              <i :class="pdfIconClass(previewItem.CategoriesPDF)"></i>
              <span>ดูไฟล์</span>
            </button>
          </div>
          <div class="drawer-value text-muted" v-else>—</div>
        </div>
        <div class="drawer-section" v-if="getSubCategoriesCount(previewItem?.CategoriesID) > 0">
          <div class="drawer-label">หมวดหมู่ย่อย</div>
          <div class="drawer-value">
            <span class="apple-badge-green">{{ getSubCategoriesCount(previewItem?.CategoriesID) }} รายการ</span>
          </div>
        </div>
      </div>
      <div class="drawer-footer">
        <div class="d-flex gap-2">
          <button class="apple-btn-primary flex-fill" @click="openEditModalFromPreview">
            <i class="bi bi-pencil-square me-2"></i> แก้ไข
          </button>
          <button class="apple-btn-secondary text-danger flex-fill" @click="confirmDeleteFromPreview">
            <i class="bi bi-trash me-2"></i> ลบ
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm Modal Component -->
    <ConfirmModalComponent />

  </div>
</template>

<script setup>
import { ref, computed, watch, getCurrentInstance, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { Tooltip } from 'bootstrap';
import Sidebar from '@/components/Sidebar.vue';
import AppleFilters from '@/components/AppleFilters.vue';
import { bindSidebarResize, isSidebarCollapsed, isMobileSidebarOpen } from '@/stores/sidebarState';
import { useConfirm } from '@/composables/useConfirm';
import '@/assets/sidebar.css';
import ex4Url from '@/assets/ex4.svg';

const router = useRouter();
const { appContext } = getCurrentInstance();
const { $axios, $swal } = appContext.config.globalProperties;

// Confirm Modal
const { confirmAction, ConfirmModalComponent } = useConfirm();

const userInfoObject = ref({});
const userType = ref("");
let unbindSidebarResize = null;
let _savedSidebarCollapsed = null;

const searchQueryCategories = ref('');
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

const onFiltersChange = () => {
  displayPage.value = 1;
};

// Data
const categories = ref([]);
const categoriesLoading = ref(true);
const categoriesError = ref(null);

// Modals Visibility State (Replaces Bootstrap Instances)
const showUploadModal = ref(false);
const showCrudModal = ref(false);
const showTemplateModal = ref(false);
const showFileModal = ref(false);

// Upload State
const uploadedFile = ref(null);
const isUploading = ref(false);
const isDownloadingFile = ref(false);
const isDownloadingTemplate = ref(false);

// CRUD State
const isEditing = ref(false);
const editingId = ref(null);
const isSaving = ref(false);
const crudFormData = ref({
  CategoriesName: '',
  ParentCategoriesID: '',
  CategoriesPDF: '',
  Contact: ''
});

// File Preview State
const modalFileUrl = ref('');
const modalFileName = ref('');

// Drawer State
const showDrawer = ref(false);
const previewItem = ref(null);

// Computed: Parent Options
const parentCategoryOptions = computed(() => {
  return (categories.value || []).filter(c => {
    const pid = String(c.ParentCategoriesID ?? '').trim();
    const cid = String(c.CategoriesID ?? '').trim();
    return !pid || pid === cid;
  });
});

// --- Modal Functions ---
function openUploadModal() {
  uploadedFile.value = null;
  showUploadModal.value = true;
}
function closeUploadModal() {
  showUploadModal.value = false;
}

function openTemplateModal() {
  showTemplateModal.value = true;
}
function closeTemplateModal() {
  showTemplateModal.value = false;
}

function openFile(fileValue, name) {
  modalFileUrl.value = pdfUrl(fileValue);
  modalFileName.value = name || 'Document';
  showFileModal.value = true;
}
function closeFileModal() {
  showFileModal.value = false;
  modalFileUrl.value = '';
}

// --- Drawer Functions ---
function openPreview(item) {
  previewItem.value = item;
  showDrawer.value = true;
}
function closeDrawer() {
  showDrawer.value = false;
}
function openEditModalFromPreview() {
  if (previewItem.value) {
    openEditModal(previewItem.value);
    closeDrawer();
  }
}
function confirmDeleteFromPreview() {
  if (previewItem.value) {
    confirmDelete(previewItem.value);
    closeDrawer();
  }
}

// --- CRUD Functions ---
function resetCrudForm() {
  crudFormData.value = {
    CategoriesName: '',
    ParentCategoriesID: '',
    CategoriesPDF: '',
    Contact: ''
  };
  isEditing.value = false;
  editingId.value = null;
}

function openCrudModal() {
  resetCrudForm();
  showCrudModal.value = true;
}

function closeCrudModal() {
  showCrudModal.value = false;
  resetCrudForm();
}

async function openEditModal(cat) {
  isEditing.value = true;
  editingId.value = cat.CategoriesID;
  
  // Pre-fill
  crudFormData.value = {
    CategoriesName: cat.CategoriesName || '',
    ParentCategoriesID: cat.ParentCategoriesID || '',
    CategoriesPDF: cat.CategoriesPDF || '',
    Contact: cat.Contact || ''
  };

  // Try fetching fresh details
  try {
    const resp = await $axios.get(`/categories/crud/single/${encodeURIComponent(cat.CategoriesID)}`);
    if (resp?.data?.success && resp.data.data) {
      const d = resp.data.data;
      crudFormData.value = {
        CategoriesName: d.CategoriesName || cat.CategoriesName,
        ParentCategoriesID: d.ParentCategoriesID || cat.ParentCategoriesID,
        CategoriesPDF: d.CategoriesPDF || cat.CategoriesPDF,
        Contact: d.Contact || ''
      };
    }
  } catch (err) {
    console.warn('Fetch single category failed, utilizing list data.');
  }
  showCrudModal.value = true;
}

const saveCrudForm = async () => {
  if (!crudFormData.value.CategoriesName?.trim()) {
    $swal?.fire({ icon: 'warning', title: 'Required', text: 'กรุณากรอกชื่อหมวดหมู่', toast: true, position: 'bottom-end', timer: 3000, showConfirmButton: false });
    return;
  }
  isSaving.value = true;
  try {
    const payload = {
      categoriesName: crudFormData.value.CategoriesName.trim(),
      parentCategoriesID: crudFormData.value.ParentCategoriesID || null,
      categoriesPDF: crudFormData.value.CategoriesPDF?.trim() || null,
      contact: crudFormData.value.Contact?.trim() || null
    };

    if (isEditing.value && editingId.value) {
      await $axios.put(`/categories/crud/update/${editingId.value}`, payload);
      $swal?.fire({ icon: 'success', title: 'Saved', text: 'แก้ไขหมวดหมู่สำเร็จ', toast: true, position: 'bottom-end', timer: 2000, showConfirmButton: false });
    } else {
      await $axios.post('/categories/crud/create', payload);
      $swal?.fire({ icon: 'success', title: 'Created', text: 'เพิ่มหมวดหมู่สำเร็จ', toast: true, position: 'bottom-end', timer: 2000, showConfirmButton: false });
    }
    closeCrudModal();
    await fetchCategories();
  } catch (err) {
    console.error(err);
    $swal?.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Operation failed', toast: true, position: 'bottom-end', timer: 4000, showConfirmButton: false });
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = async (cat) => {
  try {
    await confirmAction({
      title: 'ยืนยันการลบ',
      message: `ต้องการลบหมวดหมู่ "<strong>${cat.CategoriesName}</strong>" ใช่หรือไม่?`,
      variant: 'danger',
      confirmText: 'ลบ',
      loadingText: 'กำลังลบ...',
      onConfirm: async () => {
        const resp = await $axios.delete(`/categories/crud/delete/${cat.CategoriesID}`);
        // If backend indicates it was already removed, show info and refresh
        if (resp?.data && resp.data.data && resp.data.data.alreadyRemoved) {
          await fetchCategories();
          $swal?.fire({ icon: 'info', title: 'Removed', text: 'หมวดหมู่นี้ถูกลบไปแล้ว', toast: true, position: 'bottom-end', timer: 2000, showConfirmButton: false });
        } else {
          $swal?.fire({ icon: 'success', title: 'Deleted', text: 'ลบหมวดหมู่เรียบร้อย', toast: true, position: 'bottom-end', timer: 2000, showConfirmButton: false });
          await fetchCategories();
        }
      }
    });
  } catch (err) {
    // If there are linked Q&A entries, show message from server
    if (err.response?.status === 400 && err.response?.data?.qaCount) {
      $swal?.fire({ icon: 'error', title: 'Failed', text: err.response?.data?.message || 'Delete failed' });
    } else if (err.response?.status === 404) {
      // Resource not found: refresh list and show informative message
      await fetchCategories();
      $swal?.fire({ icon: 'info', title: 'Not Found', text: 'ไม่พบหมวดหมู่ที่ต้องการลบ (อาจถูกลบไปแล้ว)' });
    } else if (err.response) {
      $swal?.fire({ icon: 'error', title: 'Failed', text: err.response?.data?.message || 'Delete failed' });
    }
  }
};

// --- Upload Logic ---
function onFileChange(e) {
  const f = e.target.files?.[0];
  if (!f) return;
  if (!f.name.toLowerCase().endsWith('.csv')) {
    $swal?.fire({ icon: 'error', title: 'Invalid File', text: 'Please upload a CSV file' });
    return;
  }
  uploadedFile.value = f;
  e.target.value = '';
}
function onFileDrop(e) {
  const f = e.dataTransfer?.files?.[0];
  if (f && f.name.toLowerCase().endsWith('.csv')) {
    uploadedFile.value = f;
  }
}
const saveUpload = async () => {
  if (!uploadedFile.value) return;
  isUploading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', uploadedFile.value);
    await $axios.post('/categories/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    $swal?.fire({ icon: 'success', title: 'Uploaded!', toast: true, position: 'bottom-end', timer: 3000, showConfirmButton: false });
    await fetchCategories();
    closeUploadModal();
  } catch (err) {
    $swal?.fire({ icon: 'error', title: 'Upload Failed', text: err.response?.data?.message || err.message, toast: true, position: 'bottom-end', timer: 4000, showConfirmButton: false });
  } finally {
    isUploading.value = false;
  }
};

const downloadTemplateFile = async () => {
  if (isDownloadingTemplate.value) return;
  isDownloadingTemplate.value = true;
  try {
    const res = await $axios.get('/categories/crud/template', { responseType: 'blob' });
    downloadBlob(res.data, 'categories_template.csv');
  } catch(e) { console.error(e); } 
  finally { isDownloadingTemplate.value = false; }
};

const downloadLastUploadedFile = async () => {
  if (isDownloadingFile.value) return;
  isDownloadingFile.value = true;
  try {
    const res = await $axios.get('/categories/last-upload', { responseType: 'blob' });
    downloadBlob(res.data, 'last_uploaded.csv');
  } catch(e) { 
    $swal?.fire({ icon: 'info', title: 'No File', text: 'No previously uploaded file found' });
  } 
  finally { isDownloadingFile.value = false; }
};

function downloadBlob(blobData, filename) {
  const url = window.URL.createObjectURL(new Blob([blobData]));
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// --- Fetch Data ---
const fetchCategories = async () => {
  categoriesLoading.value = true;
  try {
    const res = await $axios.get('/getcategories');
    categories.value = res.data?.categories || [];
  } catch (err) {
    categoriesError.value = 'Failed to load';
  } finally {
    categoriesLoading.value = false;
  }
};

// --- Table Logic & Helpers ---
const categoriesCurrentPage = ref(1);
const categoriesItemsPerPage = ref(5);

// FIX: Robust isMain check to handle orphans
function isMain(cat) {
  if (!cat) return false;
  const id = String(cat.CategoriesID ?? '').trim();
  const parent = String(cat.ParentCategoriesID ?? '').trim();
  
  // 1. If it has no parent or parent is itself => Main
  if (!parent || parent === id) return true;
  
  // 2. If it has a parent, check if that parent actually exists in our data
  const parentExists = (categories.value || []).some(c => String(c.CategoriesID) === parent);
  
  // 3. If parent does NOT exist => It's an orphan => Show as Main so we can edit/delete it
  if (!parentExists) return true;
  
  // 4. Parent exists => It is a Sub
  return false;
}

function pdfUrl(val) {
  if (!val) return '#';
  return /^https?:\/\//i.test(val) ? val : `/uploads/${val}`;
}
function isPdf(url) {
  return String(url).toLowerCase().trim().endsWith('.pdf');
}
function pdfIconClass(val) {
  const s = String(val).toLowerCase();
  if (s.endsWith('.pdf')) return 'bi bi-file-earmark-pdf-fill text-danger';
  if (s.endsWith('.doc') || s.endsWith('.docx')) return 'bi bi-file-earmark-word-fill text-primary';
  return 'bi bi-file-earmark-text-fill text-secondary';
}

// FIX: Handle newlines in contacts
function parseContacts(str) {
  if (!str) return [];
  // Split by " ||| " OR newline
  return String(str).split(/ \|\|\| |\n/).map(s => s.trim()).filter(Boolean);
}

// Helper: Get parent category name by ID
function getParentName(parentId) {
  if (!parentId) return '-';
  const parent = (categories.value || []).find(c => String(c.CategoriesID) === String(parentId));
  return parent?.CategoriesName || '-';
}

// Helper: Get sub-categories count for a parent
function getSubCategoriesCount(parentId) {
  if (!parentId) return 0;
  return (categories.value || []).filter(c => 
    String(c.ParentCategoriesID) === String(parentId) && 
    String(c.CategoriesID) !== String(parentId)
  ).length;
}

// ============================================
// MODIFIED: toggleExpand function (Single Open Logic)
// ============================================
function toggleExpand(id) {
  // 1. Check if this ID is currently expanded (before we clear anything)
  const isCurrentlyExpanded = expanded.value[id];
  
  // 2. Clear ALL expanded states (collapse everything)
  expanded.value = {};
  
  // 3. If the clicked ID was NOT expanded, then expand it now.
  //    (If it WAS expanded, we effectively just closed it by step 2, creating a toggle effect)
  if (!isCurrentlyExpanded) {
    expanded.value[id] = true;
  }
}

// ADDED: expandedMap definition
const expandedMap = computed(() => expanded.value);

// Filtering & Pagination
const filteredCategories = computed(() => {
  const list = (categories.value || []).filter((v,i,a)=>a.findIndex(t=>(t.CategoriesID===v.CategoriesID))===i);
  if (!searchQueryCategories.value) return list;
  const q = searchQueryCategories.value.toLowerCase();
  return list.filter(c => 
    String(c.CategoriesID).toLowerCase().includes(q) || 
    String(c.CategoriesName).toLowerCase().includes(q)
  );
});

const visibleParents = computed(() => {
  // Filter to parent categories only
  let parents = filteredCategories.value.filter(c => isMain(c));
  
  // Apply status filter (main/sub)
  if (catFilters.value.status === 'main') {
    // Only show categories that are main (no subcategories under them - or are root)
    parents = parents.filter(c => isMain(c));
  } else if (catFilters.value.status === 'sub') {
    // Show sub-categories as roots when filtering by sub
    parents = filteredCategories.value.filter(c => !isMain(c));
  }
  
  // Apply sorting
  const sortBy = catFilters.value.sortBy;
  const sortOrder = catFilters.value.sortOrder;
  parents.sort((a, b) => {
    let valA, valB;
    if (sortBy === 'id') {
      // Use numeric locale comparison for IDs (handles both simple numbers and composite IDs like "1-1", "2-3")
      const aId = String(a.CategoriesID || '');
      const bId = String(b.CategoriesID || '');
      const cmp = aId.localeCompare(bId, undefined, { numeric: true, sensitivity: 'base' });
      return sortOrder === 'asc' ? cmp : -cmp;
    } else if (sortBy === 'name') {
      valA = (a.CategoriesName || '').toLowerCase();
      valB = (b.CategoriesName || '').toLowerCase();
    } else {
      valA = a.CategoriesID;
      valB = b.CategoriesID;
    }
    if (sortBy !== 'id') {
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  // Apply pagination
  const start = (categoriesCurrentPage.value - 1) * categoriesItemsPerPage.value;
  const end = start + categoriesItemsPerPage.value;
  
  return parents.slice(start, end);
});

// Subcategory lookup
function subCategories(parentId, selfId) {
  return (categories.value || []).filter(c => 
    String(c.ParentCategoriesID) === String(parentId) && 
    String(c.CategoriesID) !== String(selfId)
  ).sort((a, b) => {
    // Sort by CategoriesID ascending (e.g., 1-1, 1-2, 1-3...)
    const aId = String(a.CategoriesID || '');
    const bId = String(b.CategoriesID || '');
    return aId.localeCompare(bId, undefined, { numeric: true, sensitivity: 'base' });
  });
}
function hasSubCategories(parentId, selfId) {
  return subCategories(parentId, selfId).length > 0;
}

// Pagination - count based on current filter status
const categoriesTotalEntries = computed(() => {
  if (catFilters.value.status === 'sub') {
    // When filtering by Sub, count subcategories
    return filteredCategories.value.filter(c => !isMain(c)).length;
  }
  // Default: count main categories
  return filteredCategories.value.filter(c => isMain(c)).length;
});
const localTotalPages = computed(() => Math.ceil(categoriesTotalEntries.value / categoriesItemsPerPage.value) || 1);
const displayPage = computed(() => categoriesCurrentPage.value);
const categoriesStartIndex = computed(() => (categoriesCurrentPage.value - 1) * categoriesItemsPerPage.value + 1);
const categoriesEndIndex = computed(() => Math.min(categoriesCurrentPage.value * categoriesItemsPerPage.value, categoriesTotalEntries.value));
const localPagesToShow = computed(() => {
  const total = localTotalPages.value;
  const current = displayPage.value;
  if (total <= 5) return Array.from({length: total}, (_, i) => i + 1);
  if (current <= 3) return [1,2,3,4,5];
  if (current >= total - 2) return [total-4, total-3, total-2, total-1, total];
  return [current-2, current-1, current, current+1, current+2];
});

function categoriesGoToPage(p) { if(p>=1 && p<=localTotalPages.value) categoriesCurrentPage.value = p; }
function categoriesPrevPage() { categoriesGoToPage(displayPage.value - 1); }
function categoriesNextPage() { categoriesGoToPage(displayPage.value + 1); }
function categoriesFirstPage() { categoriesGoToPage(1); }
function categoriesLastPage() { categoriesGoToPage(localTotalPages.value); }

watch(searchQueryCategories, () => categoriesCurrentPage.value = 1);

onMounted(() => {
  unbindSidebarResize = bindSidebarResize();
  const token = localStorage.getItem("userToken");
  if (!token) { router.replace({ name: "login" }); return; }
  
  const userInfoString = localStorage.getItem("userInfo");
  if (userInfoString) userInfoObject.value = JSON.parse(userInfoString);
  userType.value = localStorage.getItem("userType") || "";

  fetchCategories();
  
  // Init tooltips
  nextTick(() => {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new Tooltip(el));
  });
});

const toggleSidebar = () => {
  const sb = document.querySelector('.sidebar');
  const isOpen = !isMobileSidebarOpen.value;

  if (isOpen) {
    // Opening: save current collapsed state, force expand for mobile overlay
    _savedSidebarCollapsed = isSidebarCollapsed.value;
    isSidebarCollapsed.value = false;
    if (sb) sb.classList.remove('collapsed');
    document.body.classList.add('sidebar-open');
    document.body.classList.add('sidebar-mobile-expanded');
    isMobileSidebarOpen.value = true;
  } else {
    // Closing: restore previous collapsed state and hide overlay
    isSidebarCollapsed.value = !!_savedSidebarCollapsed;
    if (sb && _savedSidebarCollapsed) sb.classList.add('collapsed');
    document.body.classList.remove('sidebar-open');
    document.body.classList.remove('sidebar-mobile-expanded');
    isMobileSidebarOpen.value = false;
    _savedSidebarCollapsed = null;
  }
};

onUnmounted(() => {
  if (unbindSidebarResize) unbindSidebarResize();
});
</script>

<style scoped>
@import '@/assets/dashboard-styles.css';
@import '@/assets/main.css';
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
  background: linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%);
  border-left: 4px solid #059669;
}

.book-icon {
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 2px 8px rgba(5, 150, 105, 0.12));
}

.icon-svg {
  animation: iconBounce 0.6s ease-out forwards;
  opacity: 0;
}

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

.mobile-sidebar-toggle i { font-size: 1.05rem; }
@media (max-width: 768px) { button.mobile-sidebar-toggle.mobile-inline-toggle { display: flex !important; margin-right: 8px; align-self: center; } }
.mobile-sidebar-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.36); z-index: 98; }


/* =========================================
   Apple Design System - Colors & Variables
   ========================================= */
:root {
  --apple-blue: #0071e3; /* Changed to Web Apple Blue */
  --apple-blue-hover: #0077ED;
  --apple-red: #FF3B30;
  --apple-red-hover: #D70015;
  --apple-gray: #86868b; /* Slightly softer gray */
  --apple-light-bg: #F5F5F7;
  --apple-card-bg: #FFFFFF;
  --apple-border: #E5E5EA;
  --apple-radius: 16px;
  --apple-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  --apple-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.dashboard-container {
  font-family: var(--apple-font);
  background-color: var(--apple-light-bg);
  min-height: 100vh;
}

.main-content {
  padding-bottom: 40px;
}

.page-title {
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #1d1d1f;
}

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

.apple-table thead th {
  background: #F9F9FB;
  font-weight: 600;
  color: #6e6e73; /* Darker gray for readability */
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

.apple-table tr:last-child td {
  border-bottom: none;
}

.apple-table tr.parent-row:hover {
  background-color: rgba(0, 113, 227, 0.04); /* Subtle blue tint */
}

.sub-row {
  background-color: #FAFAFC;
}

@media (max-width: 1024px) {
  .table-responsive { overflow-x: auto; }
}

@media (max-width: 768px) {
  .table-responsive { box-shadow: none; }
  .apple-table { display: block; border: none; }
  .apple-table thead { display: none; }
  .apple-table tbody { display: flex; flex-direction: column; gap: 1rem; }
  .apple-table tbody tr { display: block; background: white; border-radius: 16px; border: 1px solid rgba(0,0,0,0.04); box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08); margin: 0; }
  .apple-table tbody td { display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1rem; border: none; font-size: 0.9rem; }
  .apple-table tbody td::before {
    content: attr(data-label);
    flex: 1;
    font-size: 0.65rem;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: #8c8c92;
    font-weight: 600;
    margin-right: 0.75rem;
  }
  .apple-table tbody td[data-label=""]::before { display: none; }
  .apple-table tbody td:last-child { border-bottom: none; }
  .apple-table tbody td .row-actions { gap: 6px; }
  .contact-cell > div > div { max-width: 100%; }
}

.tree-line {
  color: #C7C7CC;
  margin-right: 6px;
  font-weight: 300;
}

/* Badges */
.apple-badge-blue {
  background: rgba(0, 113, 227, 0.1);
  color: var(--apple-blue);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.apple-badge-gray {
  background: rgba(142, 142, 147, 0.1);
  color: var(--apple-gray);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

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

  .apple-btn-primary {
    padding: 8px 14px;
    font-size: 0.9rem;
    border-radius: 10px;
  }

  .apple-btn-primary i {
    margin-right: 0;
  }

  .apple-icon-btn-large {
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

  .apple-btn-primary {
    padding: 7px 12px;
    font-size: 0.85rem;
    border-radius: 10px;
  }

  .apple-btn-primary span {
    display: none;
  }

  .apple-icon-btn-large {
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

/* =========================================
   Buttons & Inputs (Updated: improved contrast & typography, rounded corners)
   ========================================= */
.apple-btn-primary {
  background: linear-gradient(135deg, #007AFF 0%, #0051D4 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px; /* changed from pill to rounded */
  padding: 9px 16px; /* slightly reduced horizontal padding for balanced look */
  font-weight: 700;
  font-size: 0.95rem;
  transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 6px 18px rgba(0, 90, 255, 0.18);
}

.apple-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 30px rgba(0, 90, 255, 0.22);
  background: linear-gradient(135deg, #0A8AFF 0%, #0046C4 100%);
}

.apple-btn-primary:disabled {
  opacity: 0.62;
  cursor: not-allowed;
  box-shadow: none;
}

.apple-btn-secondary {
  background: rgba(0, 0, 0, 0.06);
  color: #1d1d1f;
  border: none;
  border-radius: 12px;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 120ms ease, color 120ms ease;
}

.apple-btn-secondary:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.12);
}

.apple-btn-secondary.small {
  padding: 6px 12px;
  font-size: 0.85rem;
}

.apple-icon-btn-large {
  width: 40px;
  height: 40px;
  border-radius: 12px; /* changed rounded shape to match cancel button */
  background: linear-gradient(135deg, #007AFF 0%, #0051D4 100%);
  border: none;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
  font-size: 1.05rem;
  box-shadow: 0 6px 16px rgba(0, 90, 255, 0.12);
  padding: 6px; /* keep icon centered while non-circular */
}

.apple-icon-btn-large:hover {
  transform: translateY(-1px) scale(1.02);
  background: linear-gradient(135deg, #0A8AFF 0%, #0046C4 100%);
  color: #ffffff;
}


/* Action Buttons in Table */
.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 2px;
  transition: all 0.2s;
  background: transparent;
}

.action-btn.edit { color: var(--apple-blue); }
.action-btn.edit:hover { background: rgba(0, 113, 227, 0.1); transform: scale(1.1); }

.action-btn.delete { color: var(--apple-red); }
.action-btn.delete:hover { background: rgba(255, 59, 48, 0.1); transform: scale(1.1); }

.expand-btn {
  background: transparent;
  border: none;
  color: #86868b;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.expand-btn:hover { background: rgba(0,0,0,0.05); color: #1d1d1f; }

.file-link-btn {
  border: none;
  background: rgba(0,0,0,0.04);
  padding: 4px 10px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #1d1d1f;
  transition: all 0.2s;
}
.file-link-btn:hover { background: rgba(0,0,0,0.08); color: var(--apple-blue); }

/* Search Input */
.search-container {
  position: relative;
  width: 100%;
  max-width: 320px;
}
.search-input {
  width: 100%;
  background: white;
  border: 1px solid var(--apple-border);
  border-radius: 12px;
  padding: 10px 40px 10px 40px;
  font-size: 0.95rem;
  transition: all 0.2s;
}
.search-input:focus {
  outline: none;
  border-color: var(--apple-blue);
  box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.15);
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #86868b;
}
.search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  color: #86868b;
  cursor: pointer;
}
.search-clear:hover { color: #1d1d1f; }


/* =========================================
   Apple Modals (Custom Implementation)
   ========================================= */
.apple-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 99; /* FIX: Increased Z-Index to prevent sidebar overlap */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.apple-modal-content {
  background: rgba(255, 255, 255, 0.92); /* Higher opacity for readability */
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 20px;
  width: 100%;
  max-width: 550px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.4) inset;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.apple-modal-content.wide-modal { max-width: 800px; }
.apple-modal-content.large-modal { max-width: 90vw; }

.apple-modal-header {
  padding: 24px 24px 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  z-index: 2;
}

.apple-modal-header-bg {
  position: absolute;
  top: 0; left: 0; right: 0; height: 100px;
  background: linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%);
  pointer-events: none;
  z-index: 1;
}

.apple-modal-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.02em;
}

.apple-modal-subtitle {
  font-size: 0.9rem;
  color: #86868b;
  margin-top: 4px;
}

.apple-close-btn {
  background: rgba(0,0,0,0.05);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #1d1d1f;
}
.apple-close-btn:hover { background: rgba(0,0,0,0.1); transform: rotate(90deg); }

.apple-modal-body {
  padding: 0 24px 24px;
  position: relative;
  z-index: 2;
  overflow-y: auto;
  max-height: 80vh;
}

/* Modal Inputs */
.apple-form-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.apple-input-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1d1d1f; /* Darker label for better contrast */
  margin-bottom: 6px;
  display: block;
  margin-left: 4px;
}

.apple-input {
  width: 100%;
  background: rgba(118, 118, 128, 0.12);
  border: none;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 1rem;
  color: #1d1d1f;
  transition: all 0.2s;
}

.apple-input:focus {
  outline: none;
  background: white;
  box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.15);
}

.apple-textarea {
  resize: vertical;
  min-height: 80px;
}

.select-wrapper { position: relative; }
.select-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 0.8rem;
  color: #86868b;
}
.select-wrapper select { appearance: none; padding-right: 40px; }

.input-with-icon { position: relative; }
.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #86868b;
  font-size: 1.2rem;
}

/* Upload Drop Area */
.upload-drop-area-apple {
  border: 2px dashed #C7C7CC;
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
  background: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: all 0.2s;
}

.upload-drop-area-apple:hover {
  border-color: var(--apple-blue);
  background: rgba(0, 113, 227, 0.04);
}

.upload-drop-area-apple.has-file {
  border-color: #34C759;
  background: rgba(52, 199, 89, 0.05);
}

.upload-icon-wrapper {
  font-size: 3rem;
  color: var(--apple-blue);
  margin-bottom: 12px;
}
.upload-text { font-size: 1rem; color: #1d1d1f; }
.upload-hint { font-size: 0.85rem; color: #86868b; margin-top: 4px; }

.apple-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}

/* Transitions */
.apple-zoom-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.apple-zoom-leave-active { transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1); }
.apple-zoom-enter-from, .apple-zoom-leave-to { opacity: 0; transform: scale(0.95); }

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--apple-gray);
}
.empty-state i { font-size: 2.5rem; margin-bottom: 0.5rem; opacity: 0.5; }

/* Drawer Styles */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1050;
  backdrop-filter: blur(2px);
}

.apple-drawer {
  position: fixed;
  top: 0;
  right: -420px;
  width: 400px;
  max-width: 90vw;
  height: 100vh;
  background: #fff;
  box-shadow: -4px 0 30px rgba(0, 0, 0, 0.15);
  z-index: 1060;
  display: flex;
  flex-direction: column;
  transition: right 0.35s cubic-bezier(0.25, 1, 0.5, 1);
}

.apple-drawer.drawer-open {
  right: 0;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5e5;
  background: linear-gradient(135deg, #f5f5f7 0%, #fff 100%);
}

.drawer-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.btn-close-drawer {
  background: rgba(0, 0, 0, 0.04);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
}
.btn-close-drawer:hover {
  background: rgba(0, 0, 0, 0.08);
  color: #1d1d1f;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.drawer-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}
.drawer-section:last-child {
  border-bottom: none;
}

.drawer-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #86868b;
  margin-bottom: 6px;
}

.drawer-value {
  font-size: 0.95rem;
  color: #1d1d1f;
  line-height: 1.5;
}

.drawer-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e5e5;
  background: #fafafa;
}

/* Clickable Row */
.clickable-row {
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.clickable-row:hover {
  background-color: rgba(0, 122, 255, 0.04) !important;
}

/* File Link Button Large (for drawer) */
.file-link-btn-large {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.08) 0%, rgba(0, 122, 255, 0.04) 100%);
  border: 1px solid rgba(0, 122, 255, 0.2);
  border-radius: 10px;
  color: var(--apple-blue);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.file-link-btn-large:hover {
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.12) 0%, rgba(0, 122, 255, 0.08) 100%);
  transform: translateY(-1px);
}
.file-link-btn-large i {
  font-size: 1.1rem;
}

/* Contact Item */
.contact-item {
  display: flex;
  align-items: center;
  padding: 4px 0;
}

/* Apple Badge Green */
.apple-badge-green {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: linear-gradient(135deg, rgba(52, 199, 89, 0.1) 0%, rgba(52, 199, 89, 0.05) 100%);
  color: #34C759;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Responsive Drawer */
@media (max-width: 480px) {
  .apple-drawer {
    width: 100%;
    max-width: 100%;
    right: -100%;
  }
}

</style>

<!-- Non-scoped styles for mobile sidebar toggle -->
<style>
.mobile-sidebar-toggle.mobile-inline-toggle {
  display: none !important;
}
@media (max-width: 768px) {
  .mobile-sidebar-toggle.mobile-inline-toggle {
    display: flex !important;
  }
}
</style>