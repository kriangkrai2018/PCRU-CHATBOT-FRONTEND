<template>
  <Teleport to="body">
    <Transition name="crop-modal">
      <div v-if="visible" class="crop-overlay" @wheel.prevent="onWheel">
        <!-- Header -->
        <div class="crop-header">
          <button class="header-btn cancel" @click="cancel">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <h2 class="header-title">เลื่อนและปรับขนาด</h2>
          <button class="header-btn confirm" @click="confirm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 12l5 5L20 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <!-- Canvas Container -->
        <div class="crop-container" ref="containerRef">
          <!-- Image -->
          <img
            ref="imageRef"
            :src="imageSrc"
            class="crop-image"
            :style="imageStyle"
            @load="onImageLoad"
            @mousedown.prevent="startDrag"
            @touchstart.prevent="startTouch"
            draggable="false"
          />

          <!-- Circle Mask Overlay -->
          <div class="crop-mask">
            <div class="mask-top"></div>
            <div class="mask-middle">
              <div class="mask-left"></div>
              <div class="circle-hole"></div>
              <div class="mask-right"></div>
            </div>
            <div class="mask-bottom"></div>
          </div>

          <!-- Circle Border -->
          <div class="crop-circle-border"></div>
        </div>

        <!-- Zoom Slider -->
        <div class="zoom-control">
          <svg class="zoom-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="white" stroke-width="1.5"/>
            <path d="M21 21l-4.35-4.35M8 11h6" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <input
            type="range"
            v-model.number="scale"
            :min="minScale"
            :max="maxScale"
            step="0.01"
            class="zoom-slider"
          />
          <svg class="zoom-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="white" stroke-width="1.5"/>
            <path d="M21 21l-4.35-4.35M8 11h6M11 8v6" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  imageSrc: { type: String, default: '' }
})

const emit = defineEmits(['close', 'crop'])

// Refs
const containerRef = ref(null)
const imageRef = ref(null)

// Image dimensions
const naturalWidth = ref(0)
const naturalHeight = ref(0)
const displayWidth = ref(0)
const displayHeight = ref(0)

// Transform
const scale = ref(1)
const minScale = ref(0.5)
const maxScale = ref(3)
const translateX = ref(0)
const translateY = ref(0)

// Circle size
const circleSize = ref(300)

// Drag
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const startTranslateX = ref(0)
const startTranslateY = ref(0)

// Pinch zoom
const lastPinchDistance = ref(0)
const lastPinchScale = ref(1)

// Image style
const imageStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
  width: displayWidth.value + 'px',
  height: displayHeight.value + 'px'
}))

// Watch visibility
watch(() => props.visible, async (val) => {
  if (val) {
    await nextTick()
    initCrop()
  }
})

// Watch scale
watch(scale, () => {
  constrainPosition()
})

// Init
const initCrop = () => {
  if (!containerRef.value) return
  
  const containerW = containerRef.value.clientWidth
  const containerH = containerRef.value.clientHeight
  circleSize.value = Math.min(containerW, containerH) * 1.9
}

// Image loaded
const onImageLoad = () => {
  if (!imageRef.value || !containerRef.value) return
  
  naturalWidth.value = imageRef.value.naturalWidth
  naturalHeight.value = imageRef.value.naturalHeight
  
  const containerW = containerRef.value.clientWidth
  const containerH = containerRef.value.clientHeight
  circleSize.value = Math.min(containerW, containerH) * 0.9
  
  // Set display size เป็น original aspect ratio
  // displayWidth/Height คือขนาดรูปที่ไม่ scale ยัง
  displayWidth.value = naturalWidth.value
  displayHeight.value = naturalHeight.value
  
  // คำนวณ scale ที่ทำให้รูปพอดี circle (cover)
  const scaleForCover = Math.max(
    circleSize.value / displayWidth.value,
    circleSize.value / displayHeight.value
  )
  
  // minScale = scaleForCover (ไม่ให้ zoom out ออกไป)
  minScale.value = scaleForCover
  
  // Max scale เพื่อให้ซูมได้
  maxScale.value = scaleForCover * 8
  
  // เริ่มต้นที่ scale ที่ทำให้รูปพอดี circle
  scale.value = scaleForCover
  
  // Center
  translateX.value = 0
  translateY.value = 0
}

// Start drag
const startDrag = (e) => {
  isDragging.value = true
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
  startTranslateX.value = translateX.value
  startTranslateY.value = translateY.value
}

// Handle drag
const onMouseMove = (e) => {
  if (!isDragging.value) return
  
  const dx = e.clientX - dragStartX.value
  const dy = e.clientY - dragStartY.value
  
  translateX.value = startTranslateX.value + dx
  translateY.value = startTranslateY.value + dy
  
  constrainPosition()
}

// End drag
const onMouseUp = () => {
  isDragging.value = false
}

// Touch start
const startTouch = (e) => {
  if (e.touches.length === 1) {
    isDragging.value = true
    dragStartX.value = e.touches[0].clientX
    dragStartY.value = e.touches[0].clientY
    startTranslateX.value = translateX.value
    startTranslateY.value = translateY.value
  } else if (e.touches.length === 2) {
    isDragging.value = false
    lastPinchDistance.value = getPinchDistance(e.touches)
    lastPinchScale.value = scale.value
  }
}

// Touch move
const onTouchMove = (e) => {
  e.preventDefault()
  
  if (e.touches.length === 1 && isDragging.value) {
    const dx = e.touches[0].clientX - dragStartX.value
    const dy = e.touches[0].clientY - dragStartY.value
    translateX.value = startTranslateX.value + dx
    translateY.value = startTranslateY.value + dy
    constrainPosition()
  } else if (e.touches.length === 2) {
    const dist = getPinchDistance(e.touches)
    const scaleChange = dist / lastPinchDistance.value
    scale.value = Math.min(maxScale.value, Math.max(minScale.value, lastPinchScale.value * scaleChange))
  }
}

// Touch end
const onTouchEnd = () => {
  isDragging.value = false
  lastPinchDistance.value = 0
}

// Pinch distance
const getPinchDistance = (touches) => {
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.sqrt(dx * dx + dy * dy)
}

// Mouse wheel
const onWheel = (e) => {
  const delta = e.deltaY > 0 ? -0.05 : 0.05
  scale.value = Math.min(maxScale.value, Math.max(minScale.value, scale.value + delta))
}

// Constrain position
const constrainPosition = () => {
  const scaledW = displayWidth.value * scale.value
  const scaledH = displayHeight.value * scale.value
  
  // X axis: ถ้ารูปใหญ่กว่า circle ให้ constrain, ถ้าเล็กให้ center
  const maxX = Math.max(0, (scaledW - circleSize.value) / 2)
  translateX.value = Math.min(maxX, Math.max(-maxX, translateX.value))
  
  // Y axis: เสมอให้ constrain เพื่อให้ circle ครอบรูป
  const maxY = Math.max(0, (scaledH - circleSize.value) / 2)
  translateY.value = Math.min(maxY, Math.max(-maxY, translateY.value))
}

// Cancel
const cancel = () => {
  resetState()
  emit('close')
}

// Reset
const resetState = () => {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

// Confirm
const confirm = () => {
  if (!imageRef.value) return
  
  const outputSize = 400
  const canvas = document.createElement('canvas')
  canvas.width = outputSize
  canvas.height = outputSize
  const ctx = canvas.getContext('2d')
  
  // Calculate source area
  const scaledW = displayWidth.value * scale.value
  const scaledH = displayHeight.value * scale.value
  
  // Center offset
  const offsetX = (scaledW / 2) - translateX.value - (circleSize.value / 2)
  const offsetY = (scaledH / 2) - translateY.value - (circleSize.value / 2)
  
  // Source on original image
  const srcX = (offsetX / scaledW) * naturalWidth.value
  const srcY = (offsetY / scaledH) * naturalHeight.value
  const srcSize = (circleSize.value / scaledW) * naturalWidth.value
  
  // Draw circular mask
  ctx.beginPath()
  ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  
  // Draw image
  ctx.drawImage(
    imageRef.value,
    srcX, srcY, srcSize, srcSize,
    0, 0, outputSize, outputSize
  )
  
  canvas.toBlob((blob) => {
    emit('crop', blob)
    resetState()
  }, 'image/png', 1)
}

// Lifecycle
onMounted(() => {
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
  document.addEventListener('touchmove', onTouchMove, { passive: false })
  document.addEventListener('touchend', onTouchEnd)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
  document.removeEventListener('touchmove', onTouchMove)
  document.removeEventListener('touchend', onTouchEnd)
})
</script>

<style scoped>
.crop-overlay {
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 99999;
  display: flex;
  flex-direction: column;
}

/* Header */
.crop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  padding-top: max(12px, env(safe-area-inset-top));
  background: #000;
  z-index: 10;
}

.header-title {
  font-size: 17px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.header-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-btn:hover {
  background: #444;
  transform: scale(1.05);
}

.header-btn:active {
  transform: scale(0.95);
}

/* Container */
.crop-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  touch-action: none;
}

.crop-image {
  position: absolute;
  cursor: grab;
  user-select: none;
  -webkit-user-drag: none;
  will-change: transform;
}

.crop-image:active {
  cursor: grabbing;
}

/* Mask */
.crop-mask {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  pointer-events: none;
}

.mask-top,
.mask-bottom {
  flex: 1;
  background: rgba(0, 0, 0, 0.6);
}

.mask-middle {
  display: flex;
  height: 80vmin;
  max-height: 770px;
}

.mask-left,
.mask-right {
  flex: 1;
  background: rgba(0, 0, 0, 0.6);
}

.circle-hole {
  width: 80vmin;
  max-width: 770px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: transparent;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
}

/* Circle Border */
.crop-circle-border {
  position: absolute;
  width: 80vmin;
  max-width: 770px;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.7);
  pointer-events: none;
}

/* Zoom Control */
.zoom-control {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  padding-bottom: max(24px, env(safe-area-inset-bottom));
  background: #000;
}

.zoom-icon {
  opacity: 0.5;
  flex-shrink: 0;
}

.zoom-slider {
  flex: 1;
  height: 3px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  outline: none;
}

.zoom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  transition: transform 0.15s ease;
}

.zoom-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.zoom-slider::-webkit-slider-thumb:active {
  transform: scale(0.95);
}

.zoom-slider::-moz-range-thumb {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

/* Transitions */
.crop-modal-enter-active {
  animation: modalIn 0.3s ease-out;
}

.crop-modal-leave-active {
  animation: modalOut 0.2s ease-in forwards;
}

@keyframes modalIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
