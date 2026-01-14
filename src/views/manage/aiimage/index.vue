<template>
  <div class="dashboard-container">
    <!-- Mobile Sidebar Backdrop -->
    <div v-if="isMobileSidebarOpen" class="mobile-sidebar-backdrop" @click="toggleSidebar" aria-hidden="true"></div>
    <!-- Sidebar -->
    <Sidebar :userType="userType" :userInfoObject="userInfoObject" />

    <!-- Main Content -->
    <main class="main-content">
      <!-- Mobile Sidebar Toggle -->
      <button v-if="isMobile" class="mobile-sidebar-toggle mobile-inline-toggle" @click.stop="toggleSidebar" :aria-label="isMobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'">
        <i class="bi bi-list"></i>
      </button>
      <!-- Animated Background -->
      <div class="animated-bg">
        <div class="floating-orb orb-1"></div>
        <div class="floating-orb orb-2"></div>
        <div class="floating-orb orb-3"></div>
        <div class="floating-orb orb-4"></div>
        <div class="gradient-mesh"></div>
      </div>

      <div class="container-fluid">
        <!-- Header with animated title -->
        <div class="page-header">
          <div class="header-content">
            <div class="header-icon-wrapper">
              <div class="header-icon-glow"></div>
              <svg class="header-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#A855F7">
                      <animate attributeName="stop-color" values="#A855F7;#8B5CF6;#7C3AED;#A855F7" dur="4s" repeatCount="indefinite"/>
                    </stop>
                    <stop offset="50%" stop-color="#8B5CF6">
                      <animate attributeName="stop-color" values="#8B5CF6;#7C3AED;#A855F7;#8B5CF6" dur="4s" repeatCount="indefinite"/>
                    </stop>
                    <stop offset="100%" stop-color="#7C3AED">
                      <animate attributeName="stop-color" values="#7C3AED;#A855F7;#8B5CF6;#7C3AED" dur="4s" repeatCount="indefinite"/>
                    </stop>
                  </linearGradient>
                  <linearGradient id="sparkleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#F59E0B"/>
                    <stop offset="100%" stop-color="#F97316"/>
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <!-- Outer ring with rotation -->
                <circle cx="32" cy="32" r="28" stroke="url(#aiGradient)" stroke-width="2" fill="none" class="icon-outer-ring" opacity="0.3">
                  <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="20s" repeatCount="indefinite"/>
                </circle>
                <!-- Main circle -->
                <circle cx="32" cy="32" r="24" stroke="url(#aiGradient)" stroke-width="2.5" fill="none" class="icon-circle" filter="url(#glow)"/>
                <!-- AI Face - Eyes with blink animation -->
                <g class="icon-face">
                  <ellipse cx="24" cy="28" rx="3" ry="3.5" fill="url(#aiGradient)">
                    <animate attributeName="ry" values="3.5;0.5;3.5" dur="4s" repeatCount="indefinite" begin="2s"/>
                  </ellipse>
                  <ellipse cx="40" cy="28" rx="3" ry="3.5" fill="url(#aiGradient)">
                    <animate attributeName="ry" values="3.5;0.5;3.5" dur="4s" repeatCount="indefinite" begin="2s"/>
                  </ellipse>
                  <!-- Eye shine -->
                  <circle cx="25" cy="27" r="1" fill="white" opacity="0.8"/>
                  <circle cx="41" cy="27" r="1" fill="white" opacity="0.8"/>
                </g>
                <!-- Animated smile -->
                <path class="icon-smile" d="M22 38C22 38 26 44 32 44C38 44 42 38 42 38" stroke="url(#aiGradient)" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                <!-- Sparkles with animation -->
                <g class="icon-sparkles">
                  <path class="icon-sparkle sparkle-1" d="M52 12L54 16L58 18L54 20L52 24L50 20L46 18L50 16L52 12Z" fill="url(#sparkleGradient)">
                    <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
                    <animateTransform attributeName="transform" type="scale" values="1;1.2;1" dur="2s" repeatCount="indefinite"/>
                  </path>
                  <path class="icon-sparkle sparkle-2" d="M10 48L11.5 51L14.5 52.5L11.5 54L10 57L8.5 54L5.5 52.5L8.5 51L10 48Z" fill="url(#sparkleGradient)">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
                    <animateTransform attributeName="transform" type="scale" values="1;1.3;1" dur="2.5s" repeatCount="indefinite"/>
                  </path>
                  <path class="icon-sparkle sparkle-3" d="M56 42L57 44L59 45L57 46L56 48L55 46L53 45L55 44L56 42Z" fill="url(#sparkleGradient)">
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>
                  </path>
                </g>
                <!-- Neural network lines -->
                <g class="neural-lines" opacity="0.4">
                  <line x1="8" y1="32" x2="18" y2="32" stroke="url(#aiGradient)" stroke-width="1" stroke-dasharray="2,2">
                    <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite"/>
                  </line>
                  <line x1="46" y1="32" x2="56" y2="32" stroke="url(#aiGradient)" stroke-width="1" stroke-dasharray="2,2">
                    <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite"/>
                  </line>
                </g>
              </svg>
            </div>
            <div class="header-text">
              <div class="title-wrapper">
                <h1 class="page-title">
                  <span class="title-word" v-for="(word, i) in ['Manage', 'AI', 'Assistant']" :key="i" :style="{ animationDelay: `${i * 0.1}s` }">{{ word }}</span>
                </h1>
                <div class="title-shimmer"></div>
              </div>
              <p class="page-subtitle">
                <span class="subtitle-text">จัดการชื่อ รูปภาพ และตั้งค่า AI Assistant</span>
                <span
                  class="subtitle-badge"
                  role="button"
                  tabindex="0"
                  aria-describedby="badge-tooltip"
                  @keydown.enter="null"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ appVersion }}
                </span>
                <div id="badge-tooltip" class="badge-tooltip" role="tooltip">
                  v{{ appVersion }}
                </div>
              </p>
            </div>
          </div>
          <!-- Decorative elements -->
          <div class="header-decoration">
            <div class="decoration-line"></div>
            <div class="decoration-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <!-- Loading State - Apple Style Skeleton -->
        <div v-if="loading" class="loading-container">
          <div class="skeleton-wrapper">
            <div class="skeleton-card">
              <div class="skeleton-shine"></div>
              <div class="skeleton-header">
                <div class="skeleton-icon"></div>
                <div class="skeleton-title"></div>
              </div>
              <div class="skeleton-body">
                <div class="skeleton-image"></div>
              </div>
            </div>
            <div class="skeleton-card">
              <div class="skeleton-shine"></div>
              <div class="skeleton-header">
                <div class="skeleton-icon"></div>
                <div class="skeleton-title"></div>
              </div>
              <div class="skeleton-body">
                <div class="skeleton-line w-full"></div>
                <div class="skeleton-line w-75"></div>
                <div class="skeleton-line w-50"></div>
              </div>
            </div>
          </div>
          <div class="loading-indicator">
            <div class="loading-dots">
              <span></span><span></span><span></span>
            </div>
            <p class="loading-text">กำลังโหลดข้อมูล</p>
          </div>
        </div>

        <!-- Error State - Apple Style -->
        <div v-else-if="error" class="error-container">
          <div class="error-card">
            <div class="error-icon-wrapper">
              <svg class="error-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
                <defs>
                  <linearGradient id="errorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#F87171"/>
                    <stop offset="100%" stop-color="#EF4444"/>
                  </linearGradient>
                </defs>
                <circle cx="32" cy="32" r="28" stroke="url(#errorGradient)" stroke-width="2" fill="none" class="error-circle"/>
                <path d="M32 20v16" stroke="url(#errorGradient)" stroke-width="3" stroke-linecap="round" class="error-line"/>
                <circle cx="32" cy="44" r="2" fill="url(#errorGradient)" class="error-dot"/>
              </svg>
            </div>
            <h3 class="error-title">เกิดข้อผิดพลาด</h3>
            <p class="error-text">{{ error }}</p>
            <button class="btn-retry" @click="fetchImages">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>ลองใหม่อีกครั้ง</span>
            </button>
          </div>
        </div>

        <!-- Main Content -->
        <template v-if="!loading && !error">
          <!-- Bot Name Management Section -->
          <ManageBotName
            v-model:botName="botName"
            :originalBotName="originalBotName"
            :isSaving="isSaving"
            @save="updateBotName"
          />

          <!-- Bot Image Management Section -->
          <ManageBotImage
            :currentImage="currentImage"
            :currentImageName="currentImageName"
            :currentImageSize="currentImageSize"
            :uploadFile="uploadFile"
            :uploadPreview="uploadPreview"
            :uploadProgress="uploadProgress"
            :isDragging="isDragging"
            :isUploading="isUploading"
            :imageHistory="imageHistory"
            @upload="uploadImage"
            @file-select="onFileSelect"
            @clear-file="clearFile"
            @drag-over="onDragOver"
            @drag-leave="onDragLeave"
            @drop="onDrop"
            @use-image="useImage"
            @delete-image="deleteImage"
            @select-image="selectHistoryImage"
          />

          <!-- Visual Effects Management Section -->
          <ManageVisualEffects />
        </template>
      </div>
    </main>

    <!-- Success Toast - Apple Style -->
    <transition name="toast">
      <div v-if="showSuccessToast" class="toast-notification success">
        <div class="toast-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M8 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="toast-message">{{ toastMessage }}</span>
        <div class="toast-progress"></div>
      </div>
    </transition>

    <!-- Image Crop Modal -->
    <ImageCropModal
      :visible="showCropModal"
      :imageSrc="uploadPreview"
      @close="showCropModal = false"
      @crop="handleCropComplete"
    />

    <!-- Apple Style Delete Confirm -->
    <transition name="modal-fade">
      <div v-if="showDeleteConfirm" class="alert-overlay" @click.self="cancelDeleteImage">
        <div class="alert-modal">
          <div class="alert-icon warning">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 7v6M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h3 class="alert-title">ยืนยันการลบ?</h3>
          <p class="alert-message">คุณต้องการลบรูปภาพนี้หรือไม่?</p>
          <div class="alert-actions">
            <button class="alert-button secondary" @click="cancelDeleteImage" :disabled="isDeleting">ยกเลิก</button>
            <button class="alert-button danger" @click="confirmDeleteImage" :disabled="isDeleting">
              <span v-if="!isDeleting">ลบ</span>
              <span v-else class="spinner"></span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import ImageCropModal from '@/components/ImageCropModal.vue'
import { ref, onMounted, onUnmounted, getCurrentInstance, computed } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import ManageBotName from './ManageBotName.vue'
import ManageBotImage from './ManageBotImage.vue'
import ManageVisualEffects from './ManageVisualEffects.vue'
import { bindSidebarResize, isSidebarCollapsed, isMobileSidebarOpen } from '@/stores/sidebarState'
import '@/assets/sidebar.css'

// Get global properties
const { appContext } = getCurrentInstance()
const { $axios, $swal } = appContext.config.globalProperties
const router = useRouter()

// App Configuration from Environment
const appVersion = computed(() => import.meta.env.VITE_APP_VERSION)

// User state
const userType = ref('')
const userInfoObject = ref({})
let unbindSidebarResize = null

// Mobile sidebar
const isMobile = ref(window.innerWidth <= 768)
let _savedSidebarCollapsed = null
let resizeHandler = null

const toggleSidebar = () => {
  const sb = document.querySelector('.sidebar')
  const isOpen = !isMobileSidebarOpen.value

  if (isOpen) {
    _savedSidebarCollapsed = isSidebarCollapsed.value
    isSidebarCollapsed.value = false
    if (sb) sb.classList.remove('collapsed')
    document.body.classList.add('sidebar-open')
    document.body.classList.add('sidebar-mobile-expanded')
    isMobileSidebarOpen.value = true
  } else {
    isSidebarCollapsed.value = !!_savedSidebarCollapsed
    if (sb && _savedSidebarCollapsed) sb.classList.add('collapsed')
    document.body.classList.remove('sidebar-open')
    document.body.classList.remove('sidebar-mobile-expanded')
    isMobileSidebarOpen.value = false
    _savedSidebarCollapsed = null
  }
}

// Loading states
const loading = ref(true)
const error = ref(null)

// Current image
const currentImage = ref(null)
const currentImageName = ref('')
const currentImageSize = ref('')

// Upload states
const uploadFile = ref(null)
const uploadPreview = ref(null)
const isDragging = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)

// Crop Modal
const showCropModal = ref(false)
const croppedBlob = ref(null)

// History
const imageHistory = ref([])

// Toast
const showSuccessToast = ref(false)
const toastMessage = ref('')

// Bot Name
const botName = ref('ปลายฟ้า')
const originalBotName = ref('ปลายฟ้า')
const isSaving = ref(false)

// Computed
const isAdmin = computed(() => userType.value === 'Admin')

// Methods
function onDragOver() {
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function onDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) handleFile(file)
}

function onFileSelect(e) {
  const file = e.target.files?.[0]
  if (file) handleFile(file)
}

function handleFile(file) {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    $swal.fire({
      icon: 'error',
      title: 'ไฟล์ไม่ถูกต้อง',
      text: 'กรุณาเลือกไฟล์รูปภาพเท่านั้น',
      timer: 3000,
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false
    })
    return
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    $swal.fire({
      icon: 'error',
      title: 'ไฟล์ใหญ่เกินไป',
      text: 'ขนาดไฟล์ต้องไม่เกิน 5MB',
      timer: 3000,
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false
    })
    return
  }

  uploadFile.value = file
  
  // Create preview and open crop modal automatically
  const reader = new FileReader()
  reader.onload = (e) => {
    uploadPreview.value = e.target.result
    showCropModal.value = true
  }
  reader.readAsDataURL(file)
}

function clearFile() {
  uploadFile.value = null
  uploadPreview.value = null
}

async function uploadImage() {
  if (!uploadFile.value || isUploading.value) return
  showCropModal.value = true
}

async function handleCropComplete(blob) {
  if (!blob) return
  
  showCropModal.value = false
  isUploading.value = true
  croppedBlob.value = blob
  
  try {
    const formData = new FormData()
    formData.append('image', blob, 'cropped-image.jpg')
    
    const response = await $axios.post('/ai-image/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      }
    })
    
    // Update current image
    if (response.data?.imageUrl) {
      // DO NOT automatically set as active - just show in preview
      currentImageName.value = 'cropped-image.jpg'
      
      // Show success
      showToast('อัปโหลดรูปภาพสำเร็จ! กรุณาเลือกใช้รูปภาพที่ต้องการ')
      
      // Clear upload
      clearFile()
      
      // Refresh history
      await fetchImages()
      
      return
    }
    
  } catch (err) {
    console.error('Upload failed:', err)
    $swal.fire({
      icon: 'error',
      title: 'อัปโหลดไม่สำเร็จ',
      text: err.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปโหลด',
      timer: 4000,
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false
    })
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

async function useImage(img) {
  try {
    await $axios.post('/ai-image/set-active', { imageId: img.id })
    
    // Update current image
    currentImage.value = img.url
    currentImageName.value = img.name
    
    // Update history
    imageHistory.value = imageHistory.value.map(h => ({
      ...h,
      isActive: h.id === img.id
    }))
    
    // Store selected image ใน localStorage เพื่อให้ ChatbotView ใช้ได้
    try {
      localStorage.setItem('aiImageId', img.id)
      localStorage.setItem('aiImageUrl', img.url)
      localStorage.setItem('aiImageName', img.name)
    } catch (e) { /* ignore */ }
    
    showToast('เปลี่ยนรูปภาพ AI สำเร็จ!')
    
  } catch (err) {
    console.error('Set active failed:', err)
    $swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: err.response?.data?.message || 'ไม่สามารถเปลี่ยนรูปภาพได้',
      timer: 3000,
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false
    })
  }
}

const showDeleteConfirm = ref(false)
const deleteTarget = ref(null)
const isDeleting = ref(false)

function deleteImage(img) {
  deleteTarget.value = img
  showDeleteConfirm.value = true
}

async function confirmDeleteImage() {
  if (!deleteTarget.value) return
  isDeleting.value = true
  try {
    await $axios.delete(`/ai-image/${deleteTarget.value.id}`)
    imageHistory.value = imageHistory.value.filter(h => h.id !== deleteTarget.value.id)
    showToast('ลบรูปภาพสำเร็จ!')
  } catch (err) {
    console.error('Delete failed:', err)
    $swal.fire({
      icon: 'error',
      title: 'ลบไม่สำเร็จ',
      text: err.response?.data?.message || 'ไม่สามารถลบรูปภาพได้',
      timer: 3000,
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false
    })
  } finally {
    isDeleting.value = false
    showDeleteConfirm.value = false
    deleteTarget.value = null
  }
}

function cancelDeleteImage() {
  showDeleteConfirm.value = false
  deleteTarget.value = null
}

function selectHistoryImage(img) {
  // Optional: preview selected image
}

function showToast(message) {
  toastMessage.value = message
  showSuccessToast.value = true
  setTimeout(() => {
    showSuccessToast.value = false
  }, 3000)
}

async function fetchImages() {
  loading.value = true
  error.value = null
  
  try {
    const response = await $axios.get('/ai-image')
    
    if (response.data) {
      // Set current active image
      const activeImage = response.data.active
      if (activeImage) {
        currentImage.value = activeImage.url
        currentImageName.value = activeImage.name
        currentImageSize.value = formatFileSize(activeImage.size)
      }
      
      // Set history
      if (Array.isArray(response.data.history)) {
        imageHistory.value = response.data.history
      }
    }
  } catch (err) {
    console.error('Fetch images failed:', err)
    // Use default bot image if API not available
    currentImage.value = new URL('@/assets/bots/bot2.jpg', import.meta.url).href
    currentImageName.value = 'bot2.jpg'
    imageHistory.value = []
  } finally {
    loading.value = false
  }
}

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function getBotName() {
  try {
    const response = await $axios.get('/ai-image/bot-name')
    botName.value = response.data.botName || 'ปลายฟ้า'
    originalBotName.value = botName.value
  } catch (err) {
    console.error('Failed to get bot name:', err)
    botName.value = 'ปลายฟ้า'
    originalBotName.value = 'ปลายฟ้า'
  }
}

async function updateBotName() {
  if (!botName.value.trim()) {
    $swal.fire({
      icon: 'warning',
      title: 'ข้อมูลไม่ครบ',
      text: 'กรุณากรอกชื่อ AI Assistant',
      timer: 3000,
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false
    })
    return
  }
  
  isSaving.value = true
  try {
    await $axios.put('/ai-image/bot-name', {
      botName: botName.value.trim()
    })
    
    originalBotName.value = botName.value
    
    // Store bot name in localStorage
    localStorage.setItem('botName', botName.value)
    
    showToast('บันทึกชื่อ AI Assistant สำเร็จ!')
  } catch (err) {
    console.error('Update bot name failed:', err)
    $swal.fire({
      icon: 'error',
      title: 'บันทึกไม่สำเร็จ',
      text: err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก',
      timer: 3000,
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false
    })
  } finally {
    isSaving.value = false
  }
}

// Lifecycle
onMounted(() => {
  unbindSidebarResize = bindSidebarResize()
  
  const token = localStorage.getItem('userToken')
  const type = localStorage.getItem('userType')
  const userInfoString = localStorage.getItem('userInfo')
  
  if (!token) {
    router.replace({ name: 'login' })
    return
  }
  
  // Only admin can access this page
  if (type !== 'Admin') {
    $swal.fire({
      icon: 'error',
      title: 'ไม่มีสิทธิ์เข้าถึง',
      text: 'เฉพาะ Admin เท่านั้นที่สามารถจัดการรูปภาพ AI ได้',
      confirmButtonColor: '#8B4CB8'
    }).then(() => {
      router.replace({ name: 'dashboard' })
    })
    return
  }
  
  if (type) userType.value = type
  if (userInfoString) {
    try {
      userInfoObject.value = JSON.parse(userInfoString)
    } catch (e) {
      console.error(e)
    }
  }
  
  // Mobile resize listener
  resizeHandler = () => {
    const newIsMobile = window.innerWidth <= 768
    if (newIsMobile !== isMobile.value) {
      isMobile.value = newIsMobile
      if (!newIsMobile && isMobileSidebarOpen.value) {
        isMobileSidebarOpen.value = false
        document.body.classList.remove('sidebar-open', 'sidebar-mobile-expanded')
        isSidebarCollapsed.value = _savedSidebarCollapsed ?? isSidebarCollapsed.value
        _savedSidebarCollapsed = null
      }
    }
  }
  window.addEventListener('resize', resizeHandler)
  
  fetchImages()
  getBotName()
})

onUnmounted(() => {
  if (typeof unbindSidebarResize === 'function') unbindSidebarResize()
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  isMobileSidebarOpen.value = false
  document.body.classList.remove('sidebar-open', 'sidebar-mobile-expanded')
})
</script>

<style scoped>
@import '@/assets/dashboard-styles.css';
@import '@/assets/sidebar.css';

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
  position: relative;
  z-index: 10;
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

.alert-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: grid;
  place-items: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.alert-modal {
  width: min(460px, 90vw);
  background: rgba(255, 255, 255, 0.95);
  border-radius: 28px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6);
  padding: 28px 26px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.alert-modal::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 20%, rgba(255, 237, 213, 0.4), transparent 45%),
              radial-gradient(circle at 80% 30%, rgba(221, 214, 254, 0.4), transparent 40%);
  z-index: 0;
}

.alert-icon {
  width: 68px;
  height: 68px;
  margin: 0 auto 14px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(255, 224, 178, 0.4);
  color: #f59e0b;
  position: relative;
  z-index: 1;
}

.alert-icon.warning {
  background: rgba(255, 224, 178, 0.45);
  color: #f97316;
}

.alert-title {
  font-size: 20px;
  font-weight: 700;
  color: #2d2d35;
  margin: 0 0 8px;
  position: relative;
  z-index: 1;
}

.alert-message {
  color: #4b5563;
  margin: 0 0 18px;
  position: relative;
  z-index: 1;
}

.alert-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.alert-button {
  border: none;
  border-radius: 12px;
  padding: 12px 18px;
  font-weight: 650;
  cursor: pointer;
  min-width: 120px;
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}

.alert-button.secondary {
  background: #eef2ff;
  color: #4338ca;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.alert-button.danger {
  background: linear-gradient(135deg, #f87171, #ef4444);
  color: white;
  box-shadow: 0 10px 30px rgba(239, 68, 68, 0.35);
}

.alert-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.alert-button:not(:disabled):hover {
  transform: translateY(-1px);
}

.alert-button:not(:disabled):active {
  transform: translateY(0);
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-top-color: white;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* ========================================
   ANIMATED BACKGROUND
   ======================================== */
.animated-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.floating-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  animation: floatOrb 20s ease-in-out infinite;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(124, 58, 237, 0.2));
  top: -100px;
  right: -100px;
  animation-delay: 0s;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2));
  bottom: -50px;
  left: -50px;
  animation-delay: -5s;
}

.orb-3 {
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.2));
  top: 50%;
  left: 30%;
  animation-delay: -10s;
}

.orb-4 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(249, 115, 22, 0.15));
  top: 20%;
  right: 20%;
  animation-delay: -15s;
}

@keyframes floatOrb {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(30px, -30px) scale(1.05);
  }
  50% {
    transform: translate(-20px, 20px) scale(0.95);
  }
  75% {
    transform: translate(-30px, -10px) scale(1.02);
  }
}

.gradient-mesh {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(at 40% 20%, rgba(168, 85, 247, 0.03) 0px, transparent 50%),
    radial-gradient(at 80% 0%, rgba(59, 130, 246, 0.03) 0px, transparent 50%),
    radial-gradient(at 0% 50%, rgba(16, 185, 129, 0.03) 0px, transparent 50%),
    radial-gradient(at 80% 50%, rgba(245, 158, 11, 0.02) 0px, transparent 50%),
    radial-gradient(at 0% 100%, rgba(168, 85, 247, 0.03) 0px, transparent 50%);
}

/* ========================================
   PAGE HEADER
   ======================================== */
.page-header {
  margin-bottom: 32px;
  animation: fadeInDown 0.6s cubic-bezier(0.2, 0.9, 0.2, 1);
  position: relative;
  z-index: 1;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.header-icon-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(124, 58, 237, 0.15));
  border-radius: 28px;
  animation: iconFloat 4s ease-in-out infinite;
}

.header-icon-glow {
  position: absolute;
  inset: -8px;
  background: linear-gradient(135deg, #A855F7, #7C3AED);
  border-radius: 28px;
  opacity: 0.2;
  filter: blur(16px);
  animation: glowPulse 3s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(1.05); }
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.header-icon {
  width: 56px;
  height: 56px;
  position: relative;
  z-index: 1;
}

.icon-circle {
  stroke-dasharray: 160;
  stroke-dashoffset: 160;
  animation: drawCircle 2s ease-out forwards;
}

@keyframes drawCircle {
  to { stroke-dashoffset: 0; }
}

.icon-smile {
  stroke-dasharray: 40;
  stroke-dashoffset: 40;
  animation: drawSmile 0.8s ease-out 1.2s forwards;
}

@keyframes drawSmile {
  to { stroke-dashoffset: 0; }
}

.header-text {
  flex: 1;
}

.title-wrapper {
  position: relative;
  display: inline-block;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
  display: flex;
  gap: 10px;
}

.title-word {
  display: inline-block;
  animation: titleWordIn 0.6s cubic-bezier(0.2, 0.9, 0.2, 1) backwards;
}

@keyframes titleWordIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.title-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(168, 85, 247, 0.1),
    transparent
  );
  animation: shimmerMove 3s ease-in-out infinite;
}

@keyframes shimmerMove {
  0% { left: -100%; }
  50%, 100% { left: 100%; }
}

.page-subtitle {
  font-size: 16px;
  color: #86868b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.subtitle-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(249, 115, 22, 0.1));
  color: #F59E0B;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.subtitle-badge:hover {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(249, 115, 22, 0.2));
  transform: scale(1.05);
}

.subtitle-badge:focus {
  outline: 2px solid #F59E0B;
  outline-offset: 2px;
}

.badge-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-8px);
  margin-bottom: 8px;
  padding: 8px 12px;
  background: rgba(29, 29, 31, 0.95);
  color: white;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: all 0.2s ease;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.subtitle-badge:hover ~ .badge-tooltip,
.subtitle-badge:focus ~ .badge-tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(-16px);
  pointer-events: auto;
}


/* Header Decoration */
.header-decoration {
  margin-top: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.decoration-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(168, 85, 247, 0.3), transparent);
}

.decoration-dots {
  display: flex;
  gap: 6px;
}

.decoration-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(168, 85, 247, 0.3);
  animation: dotPulse 2s ease-in-out infinite;
}

.decoration-dots span:nth-child(2) { animation-delay: 0.2s; }
.decoration-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dotPulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* ========================================
   LOADING SKELETON
   ======================================== */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 40px 0;
}

.skeleton-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  width: 100%;
}

.skeleton-card {
  position: relative;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 28px;
  padding: 24px;
  overflow: hidden;
}

.skeleton-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: skeletonShine 2s ease-in-out infinite;
}

@keyframes skeletonShine {
  0% { left: -100%; }
  100% { left: 100%; }
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.skeleton-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #f0f0f0, #e0e0e0);
}

.skeleton-title {
  flex: 1;
  height: 20px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f0f0f0, #e0e0e0);
}

.skeleton-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-image {
  width: 100%;
  aspect-ratio: 1;
  max-width: 200px;
  margin: 0 auto;
  border-radius: 20px;
  background: linear-gradient(135deg, #f0f0f0, #e0e0e0);
}

.skeleton-line {
  height: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f0f0f0, #e0e0e0);
}

.skeleton-line.w-full { width: 100%; }
.skeleton-line.w-75 { width: 75%; }
.skeleton-line.w-50 { width: 50%; }

/* Loading Indicator */
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-dots {
  display: flex;
  gap: 8px;
}

.loading-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: linear-gradient(135deg, #A855F7, #7C3AED);
  animation: loadingDot 1.4s ease-in-out infinite;
}

.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes loadingDot {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.loading-text {
  font-size: 15px;
  color: #86868b;
  margin: 0;
}

/* ========================================
   ERROR STATE
   ======================================== */
.error-container {
  display: flex;
  justify-content: center;
  padding: 60px 20px;
}

.error-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 400px;
  padding: 48px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 28px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.error-icon-wrapper {
  margin-bottom: 24px;
}

.error-icon {
  animation: errorShake 0.6s ease-in-out;
}

@keyframes errorShake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

.error-circle {
  stroke-dasharray: 180;
  stroke-dashoffset: 180;
  animation: drawErrorCircle 1s ease-out forwards;
}

@keyframes drawErrorCircle {
  to { stroke-dashoffset: 0; }
}

.error-line {
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  animation: drawErrorLine 0.5s ease-out 0.5s forwards;
}

@keyframes drawErrorLine {
  to { stroke-dashoffset: 0; }
}

.error-dot {
  opacity: 0;
  animation: errorDotPop 0.3s ease-out 0.8s forwards;
}

@keyframes errorDotPop {
  to { opacity: 1; }
}

.error-title {
  font-size: 20px;
  font-weight: 650;
  color: #1d1d1f;
  margin: 0 0 8px 0;
}

.error-text {
  font-size: 15px;
  color: #86868b;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.btn-retry {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #A855F7, #7C3AED);
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0.9, 0.2, 1);
  box-shadow: 0 4px 16px rgba(168, 85, 247, 0.3);
}

.btn-retry:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(168, 85, 247, 0.4);
}

/* ========================================
   TOAST NOTIFICATION
   ======================================== */
.toast-notification {
  position: fixed;
  bottom: 32px;
  right: 32px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 18px;
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.15),
    0 4px 12px rgba(0, 0, 0, 0.05);
  z-index: 9999;
  overflow: hidden;
}

.toast-notification.success {
  border-left: 4px solid #10B981;
}

.toast-icon {
  color: #10B981;
  animation: toastIconPop 0.4s cubic-bezier(0.2, 0.9, 0.2, 1);
}

@keyframes toastIconPop {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.toast-message {
  font-size: 15px;
  font-weight: 500;
  color: #1d1d1f;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #10B981, #34D399);
  animation: toastProgress 3s linear forwards;
}

@keyframes toastProgress {
  from { width: 100%; }
  to { width: 0%; }
}

/* Toast Transition */
.toast-enter-active {
  animation: toastIn 0.5s cubic-bezier(0.2, 0.9, 0.2, 1);
}

.toast-leave-active {
  animation: toastOut 0.4s ease-in forwards;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateX(100px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes toastOut {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(100px) scale(0.8);
  }
}

/* ========================================
   DASHBOARD LAYOUT
   ======================================== */
.dashboard-container {
  width: 100%;
  min-height: 100vh;
  display: grid !important;
  grid-template-columns: auto 1fr;
  gap: 0 !important;
  align-items: stretch;
  overflow-x: hidden;
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f7 100%);
}

::v-deep .dashboard-container > .sidebar {
  position: relative !important;
  width: 250px !important;
  min-width: 250px !important;
  height: 100vh !important;
  overflow: auto !important;
}

.main-content {
  position: relative;
  overflow-y: auto !important;
  max-height: 100vh;
  padding: 0.5rem !important;
  padding-bottom: 40px;
}

/* ========================================
   RESPONSIVE
   ======================================== */
@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
  }
  
  .header-icon-wrapper {
    width: 64px;
    height: 64px;
  }
  
  .header-icon {
    width: 44px;
    height: 44px;
  }
  
  .header-content {
    gap: 16px;
  }
  
  .toast-notification {
    left: 16px;
    right: 16px;
    bottom: 16px;
  }
}
</style>
