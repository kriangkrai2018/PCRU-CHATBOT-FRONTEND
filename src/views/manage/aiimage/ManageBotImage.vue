<template>
  <div class="bot-image-container">
    <!-- Current AI Image Card -->
    <div class="image-card current-image-card glass-card">
      <div class="card-glow glow-purple"></div>
      <div class="card-header">
        <div class="card-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="currentIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#A855F7"/>
                <stop offset="100%" stop-color="#7C3AED"/>
              </linearGradient>
            </defs>
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="url(#currentIconGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3 class="card-title">รูปภาพปัจจุบัน</h3>
        <span class="status-badge active">
          <span class="status-dot"></span>
          <span class="status-pulse"></span>
          กำลังใช้งาน
        </span>
      </div>
      <div class="card-body">
        <div class="image-preview-wrapper">
          <div class="image-preview" :class="{ 'has-image': currentImage }">
            <div class="image-border-glow"></div>
            <img 
              v-if="currentImage" 
              :src="currentImage" 
              alt="Current AI Image"
              class="preview-image"
              @load="onImageLoad"
            />
            <div v-else class="no-image-placeholder">
              <div class="placeholder-animation">
                <svg class="placeholder-icon" width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/>
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                  <path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span>ยังไม่มีรูปภาพ</span>
            </div>
          </div>
          <div v-if="currentImage" class="image-info">
            <div class="info-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="image-name">{{ currentImageName || 'bot2.jpg' }}</span>
            </div>
            <div class="info-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span class="image-size">{{ currentImageSize }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload New Image Card -->
    <div class="image-card upload-card glass-card">
      <div class="card-glow glow-green"></div>
      <div class="card-header">
        <div class="card-icon upload-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="uploadIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#34D399"/>
                <stop offset="100%" stop-color="#10B981"/>
              </linearGradient>
            </defs>
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="url(#uploadIconGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="17,8 12,3 7,8" stroke="url(#uploadIconGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="12" y1="3" x2="12" y2="15" stroke="url(#uploadIconGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3 class="card-title">อัปโหลดรูปภาพใหม่</h3>
      </div>
      <div class="card-body">
        <div 
          class="upload-drop-zone"
          :class="{ 
            'is-dragging': isDragging,
            'has-file': uploadFile,
            'is-uploading': isUploading
          }"
          @dragover.prevent="onDragOver"
          @dragleave.prevent="onDragLeave"
          @drop.prevent="onDrop"
          @click="triggerFileInput"
        >
          <!-- Background animation -->
          <div class="drop-zone-bg">
            <div class="bg-gradient"></div>
          </div>

          <input 
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden-input"
            @change="onFileSelect"
          />
          
          <!-- Upload Icon Animation -->
          <div class="upload-icon-container" :class="{ 'bounce': isDragging }">
            <div v-if="!uploadFile && !isUploading" class="upload-icon-wrapper">
              <svg class="upload-svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
                <defs>
                  <linearGradient id="cloudGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#A855F7"/>
                    <stop offset="100%" stop-color="#8B5CF6"/>
                  </linearGradient>
                </defs>
                <!-- Cloud shape -->
                <path class="upload-cloud" d="M52 42.5C56.4183 42.5 60 38.9183 60 34.5C60 30.0817 56.4183 26.5 52 26.5C51.9986 26.5 51.9971 26.5 51.9957 26.5C51.4282 20.4477 46.2735 15.5 40 15.5C35.5 15.5 31.5 17.5 29 21C27.5 19.5 25.3 18.5 23 18.5C18.0294 18.5 14 22.5294 14 27.5C14 27.6678 14.0035 27.8348 14.0104 28.0009C9.0401 28.5081 5 32.8546 5 38.0001C5 43.523 9.47715 48.0001 15 48.0001H52C52 48.0001 52 42.5 52 42.5Z" fill="url(#cloudGrad)" opacity="0.15"/>
                <path class="upload-cloud-stroke" d="M52 42.5C56.4183 42.5 60 38.9183 60 34.5C60 30.0817 56.4183 26.5 52 26.5H51.9957C51.4282 20.4477 46.2735 15.5 40 15.5C35.5 15.5 31.5 17.5 29 21C27.5 19.5 25.3 18.5 23 18.5C18.0294 18.5 14 22.5294 14 27.5V28.0009C9.0401 28.5081 5 32.8546 5 38C5 43.5229 9.47715 48 15 48H52" stroke="url(#cloudGrad)" stroke-width="2" stroke-linecap="round"/>
                <!-- Arrow -->
                <g class="upload-arrow-group">
                  <path class="upload-arrow" d="M32 52V32" stroke="url(#cloudGrad)" stroke-width="3" stroke-linecap="round"/>
                  <path class="upload-arrow-head" d="M24 40L32 32L40 40" stroke="url(#cloudGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </g>
              </svg>
              <div class="upload-ripple">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            
            <!-- File Selected Icon -->
            <div v-else-if="uploadFile && !isUploading" class="file-selected-wrapper">
              <svg class="file-selected-svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
                <defs>
                  <linearGradient id="successGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#34D399"/>
                    <stop offset="100%" stop-color="#10B981"/>
                  </linearGradient>
                </defs>
                <rect x="12" y="6" width="40" height="52" rx="4" fill="url(#successGrad)" opacity="0.1"/>
                <rect x="12" y="6" width="40" height="52" rx="4" stroke="url(#successGrad)" stroke-width="2"/>
                <path class="check-path" d="M24 32L30 38L42 26" stroke="url(#successGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            
            <!-- Uploading Spinner -->
            <div v-else class="upload-spinner-wrapper">
              <svg class="upload-spinner" viewBox="0 0 64 64">
                <defs>
                  <linearGradient id="spinnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#A855F7"/>
                    <stop offset="100%" stop-color="#7C3AED"/>
                  </linearGradient>
                </defs>
                <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(168, 85, 247, 0.2)" stroke-width="4"/>
                <circle cx="32" cy="32" r="26" fill="none" stroke="url(#spinnerGrad)" stroke-width="4" stroke-dasharray="120" stroke-linecap="round">
                  <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="1s" repeatCount="indefinite"/>
                </circle>
              </svg>
              <div class="spinner-percentage">{{ uploadProgress }}%</div>
            </div>
          </div>

          <div class="upload-text">
            <span v-if="isUploading" class="uploading-text">
              <span class="text-shimmer">กำลังอัปโหลด...</span>
            </span>
            <span v-else-if="uploadFile" class="file-name">
              <strong>{{ uploadFile.name }}</strong>
              <button class="clear-file-btn" @click.stop="clearFile">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </span>
            <span v-else class="placeholder-text">
              ลากไฟล์มาวางที่นี่ หรือ <strong>คลิกเพื่อเลือก</strong>
            </span>
          </div>

          <div class="upload-hint">
            <span class="hint-icon">💡</span>
            รองรับ: JPG, PNG, WebP (สูงสุด 5MB)
          </div>

          <!-- Preview of selected file -->
          <transition name="preview-pop">
            <div v-if="uploadPreview" class="upload-preview">
              <img :src="uploadPreview" alt="Preview" class="preview-thumb" />
              <div class="preview-overlay">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
            </div>
          </transition>
        </div>

        <!-- Upload Button -->
        <button 
          class="btn-upload"
          :class="{ 'is-uploading': isUploading, 'is-ready': uploadFile && !isUploading }"
          :disabled="!uploadFile || isUploading"
          @click="$emit('upload')"
        >
          <span class="btn-bg"></span>
          <span class="btn-content">
            <svg v-if="isUploading" class="btn-spinner" width="20" height="20" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="32" stroke-linecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
              </circle>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <polyline points="17,8 12,3 7,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>{{ isUploading ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปภาพ' }}</span>
          </span>
          <span class="btn-shine"></span>
        </button>
      </div>
    </div>

    <!-- Image History Card -->
    <div class="image-card history-card glass-card">
      <div class="card-glow glow-blue"></div>
      <div class="card-header">
        <div class="card-icon history-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="historyIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#60A5FA"/>
                <stop offset="100%" stop-color="#3B82F6"/>
              </linearGradient>
            </defs>
            <circle cx="12" cy="12" r="10" stroke="url(#historyIconGrad)" stroke-width="2"/>
            <polyline points="12,6 12,12 16,14" stroke="url(#historyIconGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3 class="card-title">ประวัติรูปภาพ</h3>
        <span class="history-count">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
            <path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          {{ imageHistory.length }} รูป
        </span>
      </div>
      <div class="card-body">
        <div v-if="imageHistory.length === 0" class="empty-history">
          <div class="empty-icon-wrapper">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </div>
          <span>ยังไม่มีประวัติรูปภาพ</span>
          <p class="empty-hint">อัปโหลดรูปภาพเพื่อเริ่มสร้างประวัติ</p>
        </div>
        <div v-else class="history-scroll-container" :class="{ 'expanded': showAll }">
          <div class="history-grid">
            <transition-group name="history-item">
              <div 
                v-for="(img, index) in imageHistory" 
                :key="img.id || index"
                class="history-item"
                :class="{ 'is-active': img.isActive }"
                :style="{ '--index': index }"
                @click="$emit('select-image', img)"
              >
              <div class="history-thumb-wrapper">
                <img :src="img.url" :alt="img.name" class="history-thumb" />
                <div class="history-overlay">
                  <button class="history-action-btn use-btn" @click.stop="$emit('use-image', img)" title="ใช้รูปนี้">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <button 
                    class="history-action-btn delete-btn" 
                    @click.stop="$emit('delete-image', img)" 
                    :disabled="imageHistory.length === 1"
                    :title="imageHistory.length === 1 ? 'ไม่สามารถลบรูปสุดท้าย' : 'ลบ'"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </button>
                </div>
                <transition name="badge-pop">
                  <div v-if="img.isActive" class="active-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </transition>
              </div>
              <div class="history-info">
                <span class="history-name">{{ img.name }}</span>
                <span class="history-date">{{ formatDate(img.uploadedAt) }}</span>
              </div>
            </div>
            </transition-group>
          </div>
        </div>
        
        <!-- Show More/Less Button -->
        <transition name="fade">
          <div v-if="hasMore" class="show-more-container">
            <button class="show-more-btn" @click="toggleShowAll">
              <span class="btn-text">{{ showAll ? 'แสดงน้อยลง' : `ดูเพิ่มเติม (${imageHistory.length - INITIAL_DISPLAY_COUNT})` }}</span>
              <svg 
                class="btn-icon" 
                :class="{ 'rotated': showAll }"
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none"
              >
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'

const props = defineProps({
  currentImage: String,
  currentImageName: String,
  currentImageSize: String,
  uploadFile: Object,
  uploadPreview: String,
  uploadProgress: {
    type: Number,
    default: 0
  },
  isDragging: Boolean,
  isUploading: Boolean,
  imageHistory: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'upload',
  'file-select',
  'clear-file',
  'drag-over',
  'drag-leave',
  'drop',
  'use-image',
  'delete-image',
  'select-image'
])

const fileInput = ref(null)
const showAll = ref(false)
const INITIAL_DISPLAY_COUNT = 3

const hasMore = computed(() => {
  return props.imageHistory.length > INITIAL_DISPLAY_COUNT
})

function toggleShowAll() {
  showAll.value = !showAll.value
}

function triggerFileInput() {
  if (!props.isUploading) {
    fileInput.value?.click()
  }
}

function onDragOver() {
  emit('drag-over')
}

function onDragLeave() {
  emit('drag-leave')
}

function onDrop(e) {
  emit('drop', e)
}

function onFileSelect(e) {
  emit('file-select', e)
  e.target.value = ''
}

function clearFile() {
  emit('clear-file')
}

function onImageLoad() {
  // Animation trigger when image loads
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<style scoped>
/* Container */
.bot-image-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

/* Glass Card Base */
.glass-card {
  position: relative;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.2, 0.9, 0.2, 1);
}

.glass-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.12),
    0 8px 20px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

/* Card Animation */
.image-card {
  animation: cardSlideUp 0.6s cubic-bezier(0.2, 0.9, 0.2, 1) backwards;
}

.image-card:nth-child(1) { animation-delay: 0.1s; }
.image-card:nth-child(2) { animation-delay: 0.2s; }
.image-card:nth-child(3) { animation-delay: 0.3s; }

@keyframes cardSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Card Glow Effect */
.card-glow {
  position: absolute;
  top: -100%;
  left: -100%;
  width: 300%;
  height: 300%;
  opacity: 0;
  transition: opacity 0.6s ease;
  pointer-events: none;
}

.glow-purple {
  background: radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.15) 0%, transparent 50%);
}

.glow-green {
  background: radial-gradient(circle at 50% 50%, rgba(52, 211, 153, 0.15) 0%, transparent 50%);
}

.glow-blue {
  background: radial-gradient(circle at 50% 50%, rgba(96, 165, 250, 0.15) 0%, transparent 50%);
}

.glass-card:hover .card-glow {
  opacity: 1;
}

/* Card Header */
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.card-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(124, 58, 237, 0.1));
  border-radius: 14px;
  transition: transform 0.3s ease;
}

.glass-card:hover .card-icon {
  transform: scale(1.05);
}

.upload-icon {
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.15), rgba(16, 185, 129, 0.1));
}

.history-icon {
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.15), rgba(59, 130, 246, 0.1));
}

.card-title {
  flex: 1;
  font-size: 17px;
  font-weight: 650;
  color: #1d1d1f;
  margin: 0;
  letter-spacing: -0.2px;
}

/* Status Badge */
.status-badge {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10B981;
}

.status-pulse {
  position: absolute;
  left: 14px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10B981;
  animation: statusPulse 2s ease-in-out infinite;
}

@keyframes statusPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(2); opacity: 0; }
}

.history-count {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.card-body {
  padding: 24px;
}

/* Current Image Preview */
.image-preview-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.image-preview {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 28px;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.04));
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  transition: all 0.4s cubic-bezier(0.2, 0.9, 0.2, 1);
}

.image-preview::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 30px;
  border: 2px dashed rgba(168, 85, 247, 0.2);
  transition: all 0.3s ease;
}

.image-preview.has-image::before {
  border: none;
}

.image-preview.has-image {
  box-shadow: 
    0 20px 60px rgba(168, 85, 247, 0.2),
    0 8px 20px rgba(0, 0, 0, 0.08);
}

.image-border-glow {
  position: absolute;
  inset: -4px;
  border-radius: 32px;
  background: linear-gradient(135deg, #A855F7, #7C3AED);
  opacity: 0;
  z-index: -1;
  transition: opacity 0.4s ease;
  filter: blur(8px);
}

.image-preview.has-image:hover .image-border-glow {
  opacity: 0.4;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 28px;
  animation: imageReveal 0.8s cubic-bezier(0.2, 0.9, 0.2, 1);
}

@keyframes imageReveal {
  from {
    opacity: 0;
    transform: scale(0.9);
    filter: blur(10px);
  }
  to {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
}

/* Placeholder */
.no-image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #86868b;
}

.placeholder-animation {
  animation: placeholderPulse 2s ease-in-out infinite;
}

@keyframes placeholderPulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 0.7; }
}

.placeholder-icon {
  opacity: 0.5;
}

/* Image Info */
.image-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  width: 100%;
  max-width: 200px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #86868b;
  font-size: 13px;
}

.image-name {
  font-weight: 600;
  color: #1d1d1f;
}

/* Upload Drop Zone */
.upload-drop-zone {
  position: relative;
  padding: 48px 24px;
  border: 2px dashed rgba(168, 85, 247, 0.3);
  border-radius: 20px;
  background: rgba(168, 85, 247, 0.02);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.2, 0.9, 0.2, 1);
  text-align: center;
  overflow: hidden;
}

.upload-drop-zone:hover {
  border-color: rgba(168, 85, 247, 0.5);
  background: rgba(168, 85, 247, 0.05);
}

.upload-drop-zone.is-dragging {
  border-color: #A855F7;
  background: rgba(168, 85, 247, 0.1);
  transform: scale(1.02);
  box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.1);
}

.upload-drop-zone.has-file {
  border-color: #10B981;
  background: rgba(16, 185, 129, 0.05);
}

/* Drop Zone Background */
.drop-zone-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.upload-drop-zone:hover .bg-gradient,
.upload-drop-zone.is-dragging .bg-gradient {
  opacity: 1;
}

.hidden-input {
  display: none;
}

/* Upload Icon Container */
.upload-icon-container {
  position: relative;
  margin-bottom: 20px;
  z-index: 1;
}

.upload-icon-container.bounce {
  animation: bounce 0.6s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

.upload-icon-wrapper {
  position: relative;
}

/* Upload Ripple */
.upload-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.upload-ripple span {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid rgba(168, 85, 247, 0.3);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  animation: ripple 3s ease-out infinite;
}

.upload-ripple span:nth-child(2) { animation-delay: 1s; }
.upload-ripple span:nth-child(3) { animation-delay: 2s; }

@keyframes ripple {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

/* Upload Cloud Animation */
.upload-cloud {
  animation: cloudFloat 4s ease-in-out infinite;
}

@keyframes cloudFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.upload-cloud-stroke {
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  animation: drawCloud 2s ease-out forwards;
}

@keyframes drawCloud {
  to { stroke-dashoffset: 0; }
}

.upload-arrow-group {
  animation: arrowBounce 2s ease-in-out infinite;
}

@keyframes arrowBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

/* File Selected Animation */
.file-selected-wrapper {
  position: relative;
}

.file-selected-svg {
  animation: filePopIn 0.5s cubic-bezier(0.2, 0.9, 0.2, 1);
}

@keyframes filePopIn {
  0% { transform: scale(0) rotate(-10deg); }
  50% { transform: scale(1.1) rotate(5deg); }
  100% { transform: scale(1) rotate(0); }
}

.check-path {
  stroke-dasharray: 30;
  stroke-dashoffset: 30;
  animation: drawCheck 0.5s ease-out 0.3s forwards;
}

@keyframes drawCheck {
  to { stroke-dashoffset: 0; }
}

/* Spinner */
.upload-spinner-wrapper {
  position: relative;
  width: 64px;
  height: 64px;
}

.upload-spinner {
  width: 100%;
  height: 100%;
}

.spinner-percentage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  font-weight: 700;
  color: #A855F7;
}

/* Upload Text */
.upload-text {
  font-size: 15px;
  color: #1d1d1f;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
}

.uploading-text {
  color: #A855F7;
  font-weight: 600;
}

.text-shimmer {
  background: linear-gradient(90deg, #A855F7, #7C3AED, #A855F7);
  background-size: 200%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 2s linear infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.file-name {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #10B981;
  font-weight: 500;
}

.clear-file-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.clear-file-btn:hover {
  background: #EF4444;
  color: white;
  transform: scale(1.1);
}

.placeholder-text {
  color: #86868b;
}

.placeholder-text strong {
  color: #A855F7;
}

/* Upload Hint */
.upload-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  color: #86868b;
  position: relative;
  z-index: 1;
}

.hint-icon {
  font-size: 14px;
}

/* Upload Preview */
.upload-preview {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 72px;
  height: 72px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 2;
}

.preview-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.upload-preview:hover .preview-overlay {
  opacity: 1;
}

.preview-pop-enter-active {
  animation: previewPop 0.4s cubic-bezier(0.2, 0.9, 0.2, 1);
}

.preview-pop-leave-active {
  animation: previewPop 0.3s ease-in reverse;
}

@keyframes previewPop {
  from {
    transform: scale(0) rotate(-10deg);
    opacity: 0;
  }
  to {
    transform: scale(1) rotate(0);
    opacity: 1;
  }
}

/* Upload Button */
.btn-upload {
  position: relative;
  width: 100%;
  padding: 16px 24px;
  margin-top: 20px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #A855F7, #7C3AED);
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.2, 0.9, 0.2, 1);
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.3);
}

.btn-upload .btn-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #9333EA, #6B21A8);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.btn-upload:hover:not(:disabled) .btn-bg {
  opacity: 1;
}

.btn-upload:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(168, 85, 247, 0.4);
}

.btn-upload:active:not(:disabled) {
  transform: translateY(0);
}

.btn-upload:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-upload.is-ready {
  animation: readyPulse 2s ease-in-out infinite;
}

@keyframes readyPulse {
  0%, 100% { box-shadow: 0 4px 20px rgba(168, 85, 247, 0.3); }
  50% { box-shadow: 0 4px 30px rgba(168, 85, 247, 0.5); }
}

.btn-upload .btn-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-spinner {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

.btn-upload .btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.6s ease;
}

.btn-upload:hover:not(:disabled) .btn-shine {
  left: 100%;
}

/* History Grid */
.empty-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 24px;
  color: #86868b;
}

.empty-icon-wrapper {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 28px;
  animation: emptyPulse 3s ease-in-out infinite;
}

@keyframes emptyPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.empty-history span {
  font-weight: 600;
  font-size: 15px;
  color: #1d1d1f;
}

.empty-hint {
  font-size: 13px;
  margin: 0;
}

/* History Scroll Container */
.history-scroll-container {
  max-height: 220px;
  overflow-y: auto;
  overflow-x: hidden;
  transition: max-height 0.4s cubic-bezier(0.2, 0.9, 0.2, 1);
  scrollbar-width: thin;
  scrollbar-color: rgba(168, 85, 247, 0.3) transparent;
}

.history-scroll-container.expanded {
  max-height: 500px;
}

.history-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.history-scroll-container::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 10px;
}

.history-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(168, 85, 247, 0.3);
  border-radius: 10px;
  transition: background 0.3s ease;
}

.history-scroll-container::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 85, 247, 0.5);
}

.history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
  padding-right: 4px;
}

/* History Item */
.history-item {
  cursor: pointer;
  animation: historyItemIn 0.4s cubic-bezier(0.2, 0.9, 0.2, 1) backwards;
  animation-delay: calc(var(--index) * 0.05s);
}

@keyframes historyItemIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.history-item:hover .history-thumb-wrapper {
  transform: translateY(-6px) scale(1.02);
}

.history-thumb-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 18px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.2, 0.9, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.history-item.is-active .history-thumb-wrapper {
  box-shadow: 
    0 0 0 3px #10B981,
    0 8px 24px rgba(16, 185, 129, 0.3);
}

.history-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.history-item:hover .history-thumb {
  transform: scale(1.1);
}

/* History Overlay */
.history-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 50%);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
  padding-bottom: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.history-item:hover .history-overlay {
  opacity: 1;
}

.history-action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0.9, 0.2, 1);
  backdrop-filter: blur(8px);
}

.use-btn {
  background: rgba(16, 185, 129, 0.9);
  color: white;
}

.use-btn:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.5);
}

.delete-btn {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.delete-btn:hover:not(:disabled) {
  transform: scale(1.15);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.5);
}

.delete-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Active Badge */
.active-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 26px;
  height: 26px;
  background: linear-gradient(135deg, #34D399, #10B981);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.badge-pop-enter-active {
  animation: badgePop 0.4s cubic-bezier(0.2, 0.9, 0.2, 1);
}

.badge-pop-leave-active {
  animation: badgePop 0.3s ease-in reverse;
}

@keyframes badgePop {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* History Info */
.history-info {
  margin-top: 10px;
  text-align: center;
}

.history-name {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #1d1d1f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-date {
  font-size: 11px;
  color: #86868b;
}

/* History Item Transition */
.history-item-enter-active,
.history-item-leave-active {
  transition: all 0.4s cubic-bezier(0.2, 0.9, 0.2, 1);
}

.history-item-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.history-item-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Show More Container */
.show-more-container {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: center;
}

.show-more-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: rgba(168, 85, 247, 0.08);
  color: #A855F7;
  font-size: 14px;
  font-weight: 600;
  border: 2px solid rgba(168, 85, 247, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0.9, 0.2, 1);
  outline: none;
}

.show-more-btn:hover {
  background: rgba(168, 85, 247, 0.12);
  border-color: rgba(168, 85, 247, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.2);
}

.show-more-btn:active {
  transform: translateY(0);
}

.btn-text {
  transition: all 0.3s ease;
}

.btn-icon {
  transition: transform 0.3s cubic-bezier(0.2, 0.9, 0.2, 1);
}

.btn-icon.rotated {
  transform: rotate(180deg);
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .bot-image-container {
    grid-template-columns: 1fr;
  }
  
  .image-preview {
    width: 160px;
    height: 160px;
  }
  
  .history-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .show-more-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
