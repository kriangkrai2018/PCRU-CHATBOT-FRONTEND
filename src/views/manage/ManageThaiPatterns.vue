<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <Sidebar :userType="userType" :userInfoObject="userInfoObject" />

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
          <!-- Header with SVG Animation -->
          <div class="d-block d-md-flex align-items-center justify-content-between mb-4">
            <div class="d-flex align-items-center gap-3">
              <!-- SVG Brain Animation - แบบเรียบง่ายชัดเจน -->
              <svg class="brain-icon" width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Background Circle -->
                <circle cx="32" cy="32" r="30" fill="#007aff" opacity="0.08"/>
                
                <!-- Brain Outline - Left Side -->
                <path class="brain-outline brain-left" 
                  d="M 32 10 
                     C 20 10 14 16 14 26 
                     Q 12 32 14 38
                     C 16 44 20 48 24 52
                     Q 28 54 32 54"
                  stroke="#007aff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                
                <!-- Brain Outline - Right Side -->
                <path class="brain-outline brain-right" 
                  d="M 32 10 
                     C 44 10 50 16 50 26 
                     Q 52 32 50 38
                     C 48 44 44 48 40 52
                     Q 36 54 32 54"
                  stroke="#007aff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                
                <!-- Brain Wrinkles - Left -->
                <path class="brain-wrinkle wrinkle-1" 
                  d="M 20 20 Q 18 24 20 28" 
                  stroke="#007aff" stroke-width="3.5" stroke-linecap="round" fill="none"/>
                <path class="brain-wrinkle wrinkle-2" 
                  d="M 18 32 Q 16 36 18 40" 
                  stroke="#007aff" stroke-width="3.5" stroke-linecap="round" fill="none"/>
                <path class="brain-wrinkle wrinkle-3" 
                  d="M 22 44 Q 20 46 24 48" 
                  stroke="#007aff" stroke-width="3.5" stroke-linecap="round" fill="none"/>
                
                <!-- Brain Wrinkles - Right -->
                <path class="brain-wrinkle wrinkle-4" 
                  d="M 44 20 Q 46 24 44 28" 
                  stroke="#007aff" stroke-width="3.5" stroke-linecap="round" fill="none"/>
                <path class="brain-wrinkle wrinkle-5" 
                  d="M 46 32 Q 48 36 46 40" 
                  stroke="#007aff" stroke-width="3.5" stroke-linecap="round" fill="none"/>
                <path class="brain-wrinkle wrinkle-6" 
                  d="M 42 44 Q 44 46 40 48" 
                  stroke="#007aff" stroke-width="3.5" stroke-linecap="round" fill="none"/>
                
                <!-- Center Connection -->
                <line class="brain-center" x1="32" y1="16" x2="32" y2="48" stroke="#007aff" stroke-width="2" stroke-dasharray="3 3" opacity="0.3"/>
                
                <!-- Neurons with Glow -->
                <g class="neuron-group">
                  <circle class="neuron-glow" cx="24" cy="24" r="6" fill="#007aff" opacity="0.2"/>
                  <circle class="neuron neuron-1" cx="24" cy="24" r="4" fill="#007aff"/>
                </g>
                <g class="neuron-group">
                  <circle class="neuron-glow" cx="32" cy="18" r="6" fill="#34c759" opacity="0.2"/>
                  <circle class="neuron neuron-2" cx="32" cy="18" r="4" fill="#34c759"/>
                </g>
                <g class="neuron-group">
                  <circle class="neuron-glow" cx="40" cy="24" r="6" fill="#ff9500" opacity="0.2"/>
                  <circle class="neuron neuron-3" cx="40" cy="24" r="4" fill="#ff9500"/>
                </g>
                <g class="neuron-group">
                  <circle class="neuron-glow" cx="24" cy="40" r="6" fill="#af52de" opacity="0.2"/>
                  <circle class="neuron neuron-4" cx="24" cy="40" r="4" fill="#af52de"/>
                </g>
                <g class="neuron-group">
                  <circle class="neuron-glow" cx="40" cy="40" r="6" fill="#ff3b30" opacity="0.2"/>
                  <circle class="neuron neuron-5" cx="40" cy="40" r="4" fill="#ff3b30"/>
                </g>
                <g class="neuron-group">
                  <circle class="neuron-glow" cx="32" cy="46" r="6" fill="#34c759" opacity="0.2"/>
                  <circle class="neuron neuron-6" cx="32" cy="46" r="4" fill="#34c759"/>
                </g>
              </svg>
              <h2 class="page-title m-0">ระบบเรียนรู้คำไทยอัตโนมัติ</h2>
            </div>
          </div>

          <!-- Info Card: อธิบายระบบแบบง่าย -->
          <div class="info-card apple-card mb-4 p-4 rounded-4 shadow-apple">
            <!-- SVG Book Icon Animation - ชัดเจนขึ้น -->
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
            <h5 class="fw-bold mb-3">ระบบนี้คืออะไร?</h5>
            <p class="mb-2 text-muted">
              ระบบจะ <strong>เรียนรู้คำใหม่อัตโนมัติ</strong> จากคำถามที่ผู้ใช้พิมพ์ และช่วยให้ chatbot ตอบได้แม่นยำขึ้น
            </p>
            <ul class="mb-3 text-muted small">
              <li class="d-flex align-items-center gap-2 mb-2">
                <svg class="icon-svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle class="search-circle" cx="8" cy="8" r="6" stroke="#007aff" stroke-width="2"/>
                  <path class="search-handle" d="M13 13 L18 18" stroke="#007aff" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>เมื่อผู้ใช้ถามแล้ว chatbot ตอบได้ถูกต้อง → ระบบจะจำคำสำคัญไว้เป็น "ผู้สมัคร"</span>
              </li>
              <li class="d-flex align-items-center gap-2 mb-2">
                <svg class="icon-svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="#34c759" stroke-width="2"/>
                  <path class="checkmark-path" d="M6 10 L9 13 L14 7" stroke="#34c759" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>คำที่มีคุณภาพดี (พบบ่อย + ตอบถูกทุกครั้ง) จะถูก <strong>อนุมัติอัตโนมัติ</strong></span>
              </li>
              <li class="d-flex align-items-center gap-2">
                <svg class="icon-svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path class="broom-handle" d="M8 2 L6 10" stroke="#ff9500" stroke-width="2" stroke-linecap="round"/>
                  <path class="broom-bristles" d="M4 10 Q6 12, 8 10 Q10 12, 12 10" stroke="#ff9500" stroke-width="2" fill="none"/>
                  <circle class="sparkle-dot sparkle-1" cx="14" cy="6" r="1" fill="#ffd60a"/>
                  <circle class="sparkle-dot sparkle-2" cx="16" cy="8" r="1" fill="#ffd60a"/>
                </svg>
                <span>คำที่ไม่ได้ใช้หรือคุณภาพต่ำจะถูกลบทิ้งอัตโนมัติ</span>
              </li>
            </ul>
            <p class="mb-0 small text-success fw-bold d-flex align-items-center gap-2">
              <svg class="icon-svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="#34c759" stroke-width="2"/>
                <path class="lightbulb-filament" d="M10 6 L10 11" stroke="#ffd60a" stroke-width="2" stroke-linecap="round"/>
                <path d="M8 14 L12 14" stroke="#34c759" stroke-width="2" stroke-linecap="round"/>
                <circle class="bulb-glow" cx="10" cy="8" r="4" fill="#ffd60a" opacity="0.3"/>
              </svg>
              <span>ปกติแล้วไม่ต้องทำอะไร ระบบจะจัดการเอง! แต่ถ้าต้องการดูหรือปรับแต่ง สามารถทำได้ที่นี่</span>
            </p>
          </div>

          <!-- Stats Cards with SVG Icons -->
          <div class="row g-4 mb-4">
            <div class="col-md-4">
              <div class="stat-card apple-card p-4 rounded-4 shadow-apple text-center">
                <!-- SVG Pending Icon -->
                <svg class="stat-svg" width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle class="stat-circle-bg" cx="32" cy="32" r="24" fill="#ffd60a" opacity="0.2"/>
                  <path class="stat-clock-hand" d="M32 20 L32 32 L40 32" stroke="#ffd60a" stroke-width="3" stroke-linecap="round"/>
                  <circle class="stat-circle" cx="32" cy="32" r="20" stroke="#ffd60a" stroke-width="3" fill="none"/>
                </svg>
                <div class="stat-number">
                  <transition name="number-change" mode="out-in">
                    <span :key="stats.pending">{{ stats.pending || 0 }}</span>
                  </transition>
                </div>
                <div class="stat-label">รอพิจารณา</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="stat-card apple-card p-4 rounded-4 shadow-apple text-center">
                <!-- SVG Checkmark Icon -->
                <svg class="stat-svg" width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle class="stat-circle-bg" cx="32" cy="32" r="24" fill="#34c759" opacity="0.2"/>
                  <path class="stat-checkmark" d="M20 32 L28 40 L44 24" stroke="#34c759" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle class="stat-circle" cx="32" cy="32" r="20" stroke="#34c759" stroke-width="3" fill="none"/>
                </svg>
                <div class="stat-number">
                  <transition name="number-change" mode="out-in">
                    <span :key="stats.approved">{{ stats.approved || 0 }}</span>
                  </transition>
                </div>
                <div class="stat-label">อนุมัติแล้ว</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="stat-card apple-card p-4 rounded-4 shadow-apple text-center">
                <!-- SVG Brain Learning Icon -->
                <svg class="stat-svg" width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle class="stat-circle-bg" cx="32" cy="32" r="24" fill="#007aff" opacity="0.2"/>
                  <path class="stat-brain-wave" d="M16 32 Q20 28, 24 32 T32 32 T40 32 T48 32" stroke="#007aff" stroke-width="3" fill="none"/>
                  <circle class="stat-dot stat-dot-1" cx="24" cy="32" r="2" fill="#007aff"/>
                  <circle class="stat-dot stat-dot-2" cx="32" cy="32" r="2" fill="#007aff"/>
                  <circle class="stat-dot stat-dot-3" cx="40" cy="32" r="2" fill="#007aff"/>
                </svg>
                <div class="stat-number">
                  <transition name="number-change" mode="out-in">
                    <span :key="stats.totalAutoLearned">{{ stats.totalAutoLearned || 0 }}</span>
                  </transition>
                </div>
                <div class="stat-label">คำที่เรียนรู้ทั้งหมด</div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="apple-card p-4 rounded-4 shadow-apple mb-4">
            <div class="d-flex align-items-center gap-2 mb-3">
              <svg class="icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path class="lightning-bolt" d="M13 2 L4 14 L11 14 L10 22 L20 10 L13 10 Z" fill="#ff9500" stroke="#ff9500" stroke-width="1"/>
              </svg>
              <h5 class="fw-bold m-0">การดำเนินการด่วน</h5>
            </div>
            <div class="d-flex gap-3 flex-wrap">
              <button 
                class="btn-apple btn-apple-primary" 
                @click="runAutoApproval" 
                :disabled="actionLoading"
              >
                <span v-if="actionLoading === 'approval'" class="spinner-border spinner-border-sm me-2"></span>
                <svg v-else class="btn-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="2"/>
                  <path d="M5 9 L8 12 L13 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                อนุมัติอัตโนมัติเดี๋ยวนี้
              </button>
              <button 
                class="btn-apple btn-apple-secondary" 
                @click="runCleanup" 
                :disabled="actionLoading"
              >
                <span v-if="actionLoading === 'cleanup'" class="spinner-border spinner-border-sm me-2"></span>
                <svg v-else class="btn-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M6 2 L4 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M2 10 Q4 12, 6 10 Q8 12, 10 10" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
                ทำความสะอาดเดี๋ยวนี้
              </button>
              <button 
                class="btn-apple btn-apple-outline" 
                @click="refreshData" 
                :disabled="actionLoading"
              >
                <svg class="btn-icon btn-icon-spin" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M15 9 A6 6 0 1 1 9 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M9 3 L9 0 L12 3 L9 6 L9 3" fill="currentColor"/>
                </svg>
                รีเฟรชข้อมูล
              </button>
            </div>
            <p v-if="actionMessage" class="mt-3 mb-0 small" :class="actionMessageClass">
              {{ actionMessage }}
            </p>
          </div>

          <!-- Candidates Table -->
          <div class="apple-card rounded-4 shadow-apple overflow-hidden mb-4">
            <div class="p-4 border-bottom">
              <div class="d-flex align-items-center gap-2">
                <svg class="icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="4" width="16" height="16" rx="2" stroke="#007aff" stroke-width="2"/>
                  <path d="M8 8 L16 8 M8 12 L16 12 M8 16 L12 16" stroke="#007aff" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <h5 class="fw-bold m-0">คำที่รอพิจารณา</h5>
              </div>
              <p class="text-muted small mb-0 mt-2">คำเหล่านี้กำลังรอให้ผ่านเกณฑ์ก่อนจะถูกอนุมัติอัตโนมัติ (หรือคุณสามารถอนุมัติ/ปฏิเสธด้วยตนเอง)</p>
            </div>
            <div class="table-responsive">
              <table class="table table-hover mb-0 apple-table">
                <thead>
                  <tr>
                    <th>คำ</th>
                    <th>ประเภท</th>
                    <th>พบกี่ครั้ง</th>
                    <th>ความมั่นใจเฉลี่ย</th>
                    <th>อัตราสำเร็จ</th>
                    <th>การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  <transition-group name="row-fade">
                    <tr v-for="candidate in candidates" :key="candidate.ID" class="apple-row">
                      <td class="py-3 fw-bold">{{ candidate.Word }}</td>
                      <td class="py-3">
                        <span class="badge-type d-inline-flex align-items-center gap-1" :class="'type-' + candidate.SuggestedType">
                          <svg class="badge-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <circle v-if="candidate.SuggestedType === 'questions'" cx="7" cy="7" r="5" stroke="currentColor" stroke-width="2"/>
                            <path v-if="candidate.SuggestedType === 'questions'" d="M7 4 Q7 5, 7 6 L7 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            <circle v-if="candidate.SuggestedType === 'questions'" cx="7" cy="10" r="0.5" fill="currentColor"/>
                            
                            <path v-if="candidate.SuggestedType === 'actions'" d="M2 7 L6 7 L6 3 L12 7 L6 11 L6 7" fill="currentColor"/>
                            
                            <rect v-if="candidate.SuggestedType === 'documents'" x="4" y="2" width="6" height="10" rx="1" stroke="currentColor" stroke-width="1.5"/>
                            <path v-if="candidate.SuggestedType === 'documents'" d="M6 5 L8 5 M6 7 L8 7 M6 9 L8 9" stroke="currentColor" stroke-width="1"/>
                            
                            <path v-if="candidate.SuggestedType === 'education'" d="M7 2 L12 5 L7 8 L2 5 Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                            <path v-if="candidate.SuggestedType === 'education'" d="M2 5 L2 9 L7 12 L12 9 L12 5" stroke="currentColor" stroke-width="1.5" fill="none"/>
                          </svg>
                          {{ getTypeLabelText(candidate.SuggestedType) }}
                        </span>
                      </td>
                      <td class="py-3">{{ candidate.Frequency }} ครั้ง</td>
                      <td class="py-3">
                        <div class="progress-bar-mini">
                          <div class="progress-fill" :style="{ width: (candidate.AvgConfidence * 100) + '%' }"></div>
                        </div>
                        <span class="small">{{ (candidate.AvgConfidence * 100).toFixed(0) }}%</span>
                      </td>
                      <td class="py-3">
                        <span :class="getSuccessRateClass(candidate.SuccessRate)">
                          {{ candidate.SuccessRate }}%
                        </span>
                      </td>
                      <td class="py-3">
                        <div class="d-flex gap-2">
                          <button 
                            class="btn-action btn-approve" 
                            @click="approveCandidate(candidate.ID)"
                            title="อนุมัติคำนี้"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M3 8 L7 12 L13 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                          </button>
                          <button 
                            class="btn-action btn-reject" 
                            @click="rejectCandidate(candidate.ID)"
                            title="ปฏิเสธคำนี้"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M4 4 L12 12 M12 4 L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </transition-group>
                  <tr v-if="candidates.length === 0">
                    <td colspan="6" class="text-center text-muted py-5">
                      <div class="empty-state">
                        <!-- SVG Empty State Animation -->
                        <svg class="empty-svg" width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle class="empty-circle" cx="60" cy="60" r="50" stroke="#34c759" stroke-width="4" fill="none"/>
                          <path class="empty-checkmark" d="M35 60 L50 75 L85 40" stroke="#34c759" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
                          <circle class="empty-sparkle sparkle-1" cx="30" cy="30" r="3" fill="#ffd60a"/>
                          <circle class="empty-sparkle sparkle-2" cx="90" cy="30" r="3" fill="#ff9500"/>
                          <circle class="empty-sparkle sparkle-3" cx="90" cy="90" r="3" fill="#007aff"/>
                        </svg>
                        <p class="mb-0 mt-3 fw-bold">ไม่มีคำที่รอพิจารณา</p>
                        <small>ระบบจะเก็บคำใหม่เมื่อผู้ใช้ถามคำถามและได้คำตอบที่ถูกต้อง</small>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Config Section (Collapsible) -->
          <div class="apple-card rounded-4 shadow-apple overflow-hidden">
            <div 
              class="p-4 d-flex justify-content-between align-items-center cursor-pointer" 
              @click="showConfig = !showConfig"
            >
              <div class="d-flex align-items-center gap-2">
                <svg class="icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="#86868b" stroke-width="2"/>
                  <path d="M12 2 L12 5 M12 19 L12 22 M22 12 L19 12 M5 12 L2 12" stroke="#86868b" stroke-width="2" stroke-linecap="round"/>
                  <path d="M17 7 L15 9 M9 15 L7 17 M17 17 L15 15 M9 9 L7 7" stroke="#86868b" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <div>
                  <h5 class="fw-bold m-0">ตั้งค่าขั้นสูง</h5>
                  <p class="text-muted small mb-0 mt-1">ปรับเกณฑ์การเรียนรู้ (สำหรับผู้เชี่ยวชาญ)</p>
                </div>
              </div>
              <svg class="chevron-icon" :class="{ 'rotated': showConfig }" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M6 9 L12 15 L18 9" stroke="#86868b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            
            <div v-if="showConfig" class="p-4 pt-0 config-section">
              <div class="alert alert-info small mb-4 d-flex align-items-start gap-2">
                <svg class="flex-shrink-0 mt-1" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="#0dcaf0" stroke-width="2"/>
                  <path d="M10 6 L10 11" stroke="#ffd60a" stroke-width="2" stroke-linecap="round"/>
                  <path d="M8 14 L12 14" stroke="#0dcaf0" stroke-width="2" stroke-linecap="round"/>
                  <circle class="bulb-glow" cx="10" cy="8" r="4" fill="#ffd60a" opacity="0.2"/>
                </svg>
                <div>
                  <strong>คำแนะนำ:</strong> ค่าเริ่มต้นเหมาะสมแล้วสำหรับการใช้งานทั่วไป เปลี่ยนเฉพาะเมื่อจำเป็นจริงๆ
                </div>
              </div>
              
              <div class="row g-4">
                <div class="col-md-6" v-for="(configItem, key) in configItems" :key="key">
                  <div class="config-item">
                    <label class="form-label fw-bold">{{ configItem.label }}</label>
                    <p class="text-muted small mb-2">{{ configItem.description }}</p>
                    <div class="input-group">
                      <input 
                        type="text" 
                        class="form-control" 
                        :value="config[key]" 
                        @change="updateConfig(key, $event.target.value)"
                      />
                      <button class="btn btn-outline-primary" @click="updateConfig(key, config[key])">
                        บันทึก
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import { axiosInstance as axios } from '@/plugins/axios';

// User info
const userType = ref('Officer');
const userInfoObject = ref({});

// Data
const loading = ref(true);
const candidates = ref([]);
const stats = ref({ pending: 0, approved: 0, totalAutoLearned: 0 });
const config = ref({});
const showConfig = ref(false);

// Action states
const actionLoading = ref(null);
const actionMessage = ref('');
const actionMessageClass = ref('text-success');

// Config items with labels and descriptions
const configItems = {
  MIN_CONFIDENCE: {
    label: 'ความมั่นใจขั้นต่ำ',
    description: 'คำตอบต้องมีความมั่นใจอย่างน้อยเท่านี้ถึงจะบันทึกคำ (0-1)'
  },
  MIN_FREQUENCY: {
    label: 'จำนวนครั้งขั้นต่ำ',
    description: 'ต้องพบคำนี้กี่ครั้งก่อนพิจารณา'
  },
  AUTO_APPROVE_FREQUENCY: {
    label: 'จำนวนครั้งสำหรับอนุมัติอัตโนมัติ',
    description: 'ต้องพบคำนี้กี่ครั้งถึงจะอนุมัติอัตโนมัติ'
  },
  AUTO_APPROVE_CONFIDENCE: {
    label: 'ความมั่นใจสำหรับอนุมัติอัตโนมัติ',
    description: 'ความมั่นใจเฉลี่ยขั้นต่ำสำหรับอนุมัติอัตโนมัติ (0-1)'
  },
  AUTO_APPROVE_SUCCESS_RATE: {
    label: 'อัตราสำเร็จสำหรับอนุมัติอัตโนมัติ',
    description: 'อัตราส่วนที่ตอบถูกขั้นต่ำสำหรับอนุมัติอัตโนมัติ (0-1)'
  },
  CANDIDATE_EXPIRE_DAYS: {
    label: 'วันหมดอายุ',
    description: 'คำที่ไม่มีกิจกรรมจะถูกลบหลังกี่วัน'
  },
  AUTO_LEARN_ENABLED: {
    label: 'เปิดใช้งานการเรียนรู้',
    description: 'true = เปิด, false = ปิด'
  }
};

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
  await refreshData();
});

// API calls
async function refreshData() {
  loading.value = true;
  try {
    const [candidatesRes, statsRes, configRes] = await Promise.all([
      axios.get('/admin/thai-patterns/candidates'),
      axios.get('/admin/thai-patterns/stats'),
      axios.get('/admin/thai-patterns/config')
    ]);
    
    candidates.value = candidatesRes.data.candidates || [];
    
    // Process stats
    const rawStats = statsRes.data.stats || {};
    stats.value = {
      pending: rawStats.candidates?.find(c => c.Status === 'pending')?.Count || 0,
      approved: rawStats.candidates?.find(c => c.Status === 'approved')?.Count || 0,
      totalAutoLearned: rawStats.totalAutoLearned || 0
    };
    
    config.value = configRes.data.config || {};
  } catch (error) {
    console.error('Error loading data:', error);
    showMessage('โหลดข้อมูลไม่สำเร็จ: ' + (error.response?.data?.message || error.message), 'error');
  } finally {
    loading.value = false;
  }
}

async function runAutoApproval() {
  actionLoading.value = 'approval';
  try {
    const res = await axios.post('/admin/thai-patterns/run-approval');
    showMessage(`✅ อนุมัติอัตโนมัติสำเร็จ: ${res.data.result?.approved || 0} คำ`, 'success');
    // Smooth data refresh without reload
    await refreshData();
  } catch (error) {
    showMessage('ไม่สำเร็จ: ' + (error.response?.data?.message || error.message), 'error');
  } finally {
    actionLoading.value = null;
  }
}

async function runCleanup() {
  actionLoading.value = 'cleanup';
  try {
    const res = await axios.post('/admin/thai-patterns/run-cleanup');
    showMessage(`🧹 ทำความสะอาดสำเร็จ: ${res.data.result?.expired || 0} หมดอายุ, ${res.data.result?.deleted || 0} ลบแล้ว`, 'success');
    // Smooth data refresh without reload
    await refreshData();
  } catch (error) {
    showMessage('ไม่สำเร็จ: ' + (error.response?.data?.message || error.message), 'error');
  } finally {
    actionLoading.value = null;
  }
}

async function approveCandidate(id) {
  // Optimistic UI: Remove from list immediately
  const candidateIndex = candidates.value.findIndex(c => c.ID === id);
  let removedCandidate = null;
  if (candidateIndex !== -1) {
    removedCandidate = candidates.value.splice(candidateIndex, 1)[0];
    stats.value.pending = Math.max(0, stats.value.pending - 1);
    stats.value.approved += 1;
  }
  
  try {
    await axios.post(`/admin/thai-patterns/candidates/${id}/approve`);
    showMessage('✅ อนุมัติคำสำเร็จ', 'success');
    // Refresh to get accurate data from server
    await refreshData();
  } catch (error) {
    // Rollback on error
    if (removedCandidate) {
      candidates.value.splice(candidateIndex, 0, removedCandidate);
      stats.value.pending += 1;
      stats.value.approved = Math.max(0, stats.value.approved - 1);
    }
    showMessage('ไม่สำเร็จ: ' + (error.response?.data?.message || error.message), 'error');
  }
}

async function rejectCandidate(id) {
  // Optimistic UI: Remove from list immediately
  const candidateIndex = candidates.value.findIndex(c => c.ID === id);
  let removedCandidate = null;
  if (candidateIndex !== -1) {
    removedCandidate = candidates.value.splice(candidateIndex, 1)[0];
    stats.value.pending = Math.max(0, stats.value.pending - 1);
  }
  
  try {
    await axios.post(`/admin/thai-patterns/candidates/${id}/reject`);
    showMessage('❌ ปฏิเสธคำสำเร็จ', 'success');
    // Refresh to get accurate data from server
    await refreshData();
  } catch (error) {
    // Rollback on error
    if (removedCandidate) {
      candidates.value.splice(candidateIndex, 0, removedCandidate);
      stats.value.pending += 1;
    }
    showMessage('ไม่สำเร็จ: ' + (error.response?.data?.message || error.message), 'error');
  }
}

async function updateConfig(key, value) {
  // Optimistic UI: Update immediately
  const oldValue = config.value[key];
  config.value[key] = value;
  
  try {
    await axios.post('/admin/thai-patterns/config', { key, value });
    showMessage(`✅ บันทึกค่า ${key} สำเร็จ`, 'success');
  } catch (error) {
    // Rollback on error
    config.value[key] = oldValue;
    showMessage('ไม่สำเร็จ: ' + (error.response?.data?.message || error.message), 'error');
  }
}

// Helpers
function showMessage(msg, type) {
  actionMessage.value = msg;
  actionMessageClass.value = type === 'error' ? 'text-danger' : 'text-success';
  setTimeout(() => { actionMessage.value = ''; }, 5000);
}

function getTypeLabelText(type) {
  const labels = {
    questions: 'คำถาม',
    actions: 'การกระทำ',
    documents: 'เอกสาร',
    education: 'การศึกษา'
  };
  return labels[type] || type;
}

function getSuccessRateClass(rate) {
  if (rate >= 90) return 'text-success fw-bold';
  if (rate >= 70) return 'text-warning fw-bold';
  return 'text-danger fw-bold';
}
</script>

<style scoped>
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

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1d1d1f;
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
}

.stat-icon {
  font-size: 2rem;
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

.btn-apple-secondary {
  background: linear-gradient(135deg, #ff9500 0%, #ff6b00 100%);
  color: white;
}

.btn-apple-secondary:hover:not(:disabled) {
  transform: scale(1.02);
  box-shadow: 0 4px 15px rgba(255, 149, 0, 0.4);
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
}

.apple-row:hover {
  background: #f5f5f7;
}

/* Badge Types */
.badge-type {
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.type-questions { background: #e8f4fd; color: #007aff; }
.type-actions { background: #fff3e0; color: #ff9500; }
.type-documents { background: #e8f5e9; color: #34c759; }
.type-education { background: #f3e5f5; color: #af52de; }

/* Progress Bar */
.progress-bar-mini {
  width: 60px;
  height: 6px;
  background: #e5e5ea;
  border-radius: 3px;
  overflow: hidden;
  display: inline-block;
  margin-right: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #34c759 0%, #30d158 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
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

.btn-approve {
  background: #e8f5e9;
  color: #34c759;
}

.btn-approve:hover {
  background: #34c759;
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

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Config Section */
.config-section {
  border-top: 1px solid #e5e5ea;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.config-item {
  padding: 1rem;
  background: #f5f5f7;
  border-radius: 12px;
}

.cursor-pointer {
  cursor: pointer;
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
  margin-right: 0.35rem;
  flex-shrink: 0;
}

.btn-icon-spin {
  animation: spinIcon 1s ease-in-out infinite;
}

@keyframes spinIcon {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Badge Icon Animation */
.badge-icon {
  flex-shrink: 0;
  animation: fadeInScale 0.3s ease-out;
}

/* Chevron Icon Rotation */
.chevron-icon {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.chevron-icon.rotated {
  transform: rotate(180deg);
}

/* Brain Icon Animation - เรียบง่ายชัดเจน */
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

.brain-right {
  animation-delay: 0.4s;
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
.wrinkle-3 { animation-delay: 1.4s; }
.wrinkle-4 { animation-delay: 1.1s; }
.wrinkle-5 { animation-delay: 1.3s; }
.wrinkle-6 { animation-delay: 1.5s; }

@keyframes drawWrinkle {
  to { stroke-dashoffset: 0; }
}

/* Center Line */
.brain-center {
  stroke-dasharray: 3 3;
  animation: dashFlow 2s linear infinite;
}

@keyframes dashFlow {
  to { stroke-dashoffset: -6; }
}

/* Neurons */
.neuron {
  animation: neuronPulse 2s ease-in-out infinite;
  opacity: 0;
}

.neuron-1 { animation-delay: 1.8s; }
.neuron-2 { animation-delay: 2s; }
.neuron-3 { animation-delay: 2.2s; }
.neuron-4 { animation-delay: 2.4s; }
.neuron-5 { animation-delay: 2.6s; }
.neuron-6 { animation-delay: 2.8s; }

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

.neuron-group:nth-child(1) .neuron-glow { animation-delay: 1.8s; }
.neuron-group:nth-child(2) .neuron-glow { animation-delay: 2s; }
.neuron-group:nth-child(3) .neuron-glow { animation-delay: 2.2s; }
.neuron-group:nth-child(4) .neuron-glow { animation-delay: 2.4s; }
.neuron-group:nth-child(5) .neuron-glow { animation-delay: 2.6s; }
.neuron-group:nth-child(6) .neuron-glow { animation-delay: 2.8s; }

@keyframes glowPulse {
  0%, 100% { 
    opacity: 0;
    transform: scale(0.5);
  }
  50% { 
    opacity: 0.4;
    transform: scale(1.5);
  }
}

/* Book Icon Animation - ปรับปรุงใหม่ */
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
  animation: rotateClock 2s ease-in-out infinite;
  transform-origin: 32px 32px;
}

@keyframes rotateClock {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(180deg); }
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

/* Stat Card Hover Effects - Apple Style */
.stat-card {
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

.stat-card:hover .stat-svg {
  animation: bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

/* Progress Bar Animation */
.progress-fill {
  animation: fillProgress 1s ease-out forwards;
  transform-origin: left;
}

@keyframes fillProgress {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
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

/* Table Row Slide-in Animation */
.apple-row {
  animation: slideIn 0.4s ease-out forwards;
  opacity: 0;
}

.apple-row:nth-child(1) { animation-delay: 0.1s; }
.apple-row:nth-child(2) { animation-delay: 0.15s; }
.apple-row:nth-child(3) { animation-delay: 0.2s; }
.apple-row:nth-child(4) { animation-delay: 0.25s; }
.apple-row:nth-child(5) { animation-delay: 0.3s; }

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

/* Badge Type Animation */
.badge-type {
  animation: fadeInScale 0.4s ease-out forwards;
  display: inline-block;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
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

.btn-approve::before {
  background: radial-gradient(circle, #34c759 0%, transparent 70%);
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

/* Config Section Smooth Expand */
.config-section {
  animation: expandDown 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
  transform-origin: top;
}

@keyframes expandDown {
  from {
    opacity: 0;
    transform: scaleY(0.95);
  }
  to {
    opacity: 1;
    transform: scaleY(1);
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
</style>
