<template>
  <div class="effects-section">
    <div class="effects-card">
      <div class="effects-card-header">
        <div class="card-icon-wrapper">
          <svg class="card-icon" width="28" height="28" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="effectGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#3B82F6"/>
                <stop offset="100%" stop-color="#8B5CF6"/>
              </linearGradient>
            </defs>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="url(#effectGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </div>
        <div class="card-title-group">
          <h3 class="card-title">จัดการเอฟเฟกต์</h3>
          <p class="card-subtitle">ตั้งค่าเอฟเฟกต์ภาพและแอนิเมชันในหน้า Chatbot</p>
        </div>
      </div>

      <div class="effects-card-body">
        <!-- Master Effects Toggle -->
        <div class="effect-item master-toggle">
          <div class="effect-info">
            <div class="effect-icon master-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none" opacity="0.5"/>
              </svg>
            </div>
            <div class="effect-text">
              <h4 class="effect-title">เอฟเฟกต์ทั้งหมด (Master)</h4>
              <p class="effect-desc">เปิด/ปิกเอฟเฟกต์ทั้งหมดพร้อมกัน - ปิดแล้วไม่สามารถเปิดแต่ละตัวได้</p>
            </div>
          </div>
          <div class="effect-toggle">
            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="masterEnabled"
                @change="toggleMaster"
                :disabled="isSaving"
              />
              <span class="toggle-slider"></span>
            </label>
            <span class="toggle-status" :class="{ active: masterEnabled }">
              {{ masterEnabled ? 'เปิด' : 'ปิด' }}
            </span>
          </div>
        </div>

        <!-- Snow Effect Toggle -->
        <div class="effect-item">
          <div class="effect-info">
            <div class="effect-icon snow-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2v20M2 12h20M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="2" r="1.5" fill="currentColor"/>
                <circle cx="12" cy="22" r="1.5" fill="currentColor"/>
                <circle cx="2" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="22" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="6" cy="6" r="1.5" fill="currentColor"/>
                <circle cx="18" cy="18" r="1.5" fill="currentColor"/>
                <circle cx="6" cy="18" r="1.5" fill="currentColor"/>
                <circle cx="18" cy="6" r="1.5" fill="currentColor"/>
              </svg>
            </div>
            <div class="effect-text">
              <h4 class="effect-title">เอฟเฟกต์หิมะ (Snow)</h4>
              <p class="effect-desc">แสดงหิมะตกในหน้า Chatbot (โดยปกติจะแสดงเฉพาะช่วงฤดูหนาว)</p>
            </div>
          </div>
          <div class="effect-toggle">
            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="snowEnabled"
                @change="toggleSnow"
                :disabled="isSaving || !masterEnabled"
              />
              <span class="toggle-slider"></span>
            </label>
            <span class="toggle-status" :class="{ active: snowEnabled }">
              {{ snowEnabled ? 'เปิด' : 'ปิด' }}
            </span>
          </div>
        </div>

        <!-- Particle Effect Toggle -->
        <div class="effect-item">
          <div class="effect-info">
            <div class="effect-icon particle-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" fill="currentColor"/>
                <circle cx="6" cy="6" r="2" fill="currentColor" opacity="0.6"/>
                <circle cx="18" cy="6" r="2" fill="currentColor" opacity="0.6"/>
                <circle cx="6" cy="18" r="2" fill="currentColor" opacity="0.6"/>
                <circle cx="18" cy="18" r="2" fill="currentColor" opacity="0.6"/>
                <line x1="12" y1="12" x2="6" y2="6" stroke="currentColor" stroke-width="1" opacity="0.4"/>
                <line x1="12" y1="12" x2="18" y2="6" stroke="currentColor" stroke-width="1" opacity="0.4"/>
                <line x1="12" y1="12" x2="6" y2="18" stroke="currentColor" stroke-width="1" opacity="0.4"/>
                <line x1="12" y1="12" x2="18" y2="18" stroke="currentColor" stroke-width="1" opacity="0.4"/>
              </svg>
            </div>
            <div class="effect-text">
              <h4 class="effect-title">เอฟเฟกต์อนุภาค (Particle)</h4>
              <p class="effect-desc">แสดงอนุภาคเคลื่อนไหวเมื่อพิมพ์ข้อความในช่อง Input</p>
            </div>
          </div>
          <div class="effect-toggle">
            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="particleEnabled"
                @change="toggleParticle"
                :disabled="isSaving || !masterEnabled"
              />
              <span class="toggle-slider"></span>
            </label>
            <span class="toggle-status" :class="{ active: particleEnabled }">
              {{ particleEnabled ? 'เปิด' : 'ปิด' }}
            </span>
          </div>
        </div>

        <!-- Box Shadow Toggle -->
        <div class="effect-item">
          <div class="effect-info">
            <div class="effect-icon shadow-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
                <path d="M7 20l-2 2M17 20l2 2M20 7l2-2M20 17l2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
              </svg>
            </div>
            <div class="effect-text">
              <h4 class="effect-title">เงา (Box Shadow)</h4>
              <p class="effect-desc">เปิด/ปิดเงาของปุ่มและการ์ดต่างๆ ในหน้า Chatbot</p>
            </div>
          </div>
          <div class="effect-toggle">
            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="shadowEnabled"
                @change="toggleShadow"
                :disabled="isSaving || !masterEnabled"
              />
              <span class="toggle-slider"></span>
            </label>
            <span class="toggle-status" :class="{ active: shadowEnabled }">
              {{ shadowEnabled ? 'เปิด' : 'ปิด' }}
            </span>
          </div>
        </div>

        <!-- Animation Toggle -->
        <div class="effect-item">
          <div class="effect-info">
            <div class="effect-icon animation-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                <path d="M2 17l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="effect-text">
              <h4 class="effect-title">แอนิเมชันทั้งหมด</h4>
              <p class="effect-desc">เปิด/ปิดแอนิเมชันทั้งหมด รวมถึง Flying Text และเอฟเฟกต์อื่นๆ</p>
            </div>
          </div>
          <div class="effect-toggle">
            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="animationEnabled"
                @change="toggleAnimation"
                :disabled="isSaving || !masterEnabled"
              />
              <span class="toggle-slider"></span>
            </label>
            <span class="toggle-status" :class="{ active: animationEnabled }">
              {{ animationEnabled ? 'เปิด' : 'ปิด' }}
            </span>
          </div>
        </div>

        <!-- Save Button -->
        <div class="effects-actions">
          <button
            class="btn-save-effects"
            @click="saveSettings"
            :disabled="isSaving || !hasChanges"
          >
            <span v-if="!isSaving" class="btn-content">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>บันทึกการตั้งค่า</span>
            </span>
            <span v-else class="btn-content">
              <span class="spinner"></span>
              <span>กำลังบันทึก...</span>
            </span>
          </button>
          
          <button
            v-if="hasChanges"
            class="btn-reset-effects"
            @click="resetSettings"
            :disabled="isSaving"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 3v5h-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>ยกเลิก</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Apple-style Alert Modal -->
    <transition name="apple-alert-fade">
      <div v-if="showAlert" class="apple-alert-backdrop" @click="closeAlert">
        <div class="apple-alert-container" @click.stop>
          <div class="apple-alert-icon">
            <svg v-if="alertType === 'success'" class="alert-icon-svg" viewBox="0 0 52 52">
              <circle class="alert-icon-circle" cx="26" cy="26" r="25" fill="none"/>
              <path class="alert-icon-check" fill="none" d="M14 27l7.5 7.5L38 18"/>
            </svg>
            <svg v-else class="alert-icon-svg" viewBox="0 0 52 52">
              <circle class="alert-icon-circle-error" cx="26" cy="26" r="25" fill="none"/>
              <path class="alert-icon-x" fill="none" d="M16 16l20 20M36 16L16 36"/>
            </svg>
          </div>
          <h3 class="apple-alert-title">{{ alertTitle }}</h3>
          <p class="apple-alert-text">{{ alertText }}</p>
        </div>
      </div>
    </transition>

    <!-- Info Card -->
    <div class="info-card">
      <div class="info-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="info-text">
        <h4 class="info-title">ข้อมูลเพิ่มเติม</h4>
        <ul class="info-list">
          <li>
            <strong>เอฟเฟกต์ทั้งหมด (Master):</strong> สวิตช์หลักในการควบคุมเอฟเฟกต์ทั้งหมด เมื่อปิดจะทำให้ไม่สามารถเปิดเอฟเฟกต์อื่นได้ และจะปิดเอฟเฟกต์การเคลื่อนไหวทุกประเภทพร้อมกัน รวมถึงปุ่มต่างๆ, การเคลื่อนไหวของ Avatar และ Animation ทั้งหมด เหมาะสำหรับอุปกรณ์ที่ต้องการประหยัดพลังงานหรือเพิ่มประสิทธิภาพสูงสุด
          </li>
          <li>
            <strong>เอฟเฟกต์หิมะ (Snow):</strong> แสดงหิมะตกลงมาในหน้า Chatbot โดยปกติจะแสดงเฉพาะช่วงฤดูหนาวในประเทศไทย (เดือนพฤศจิกายน - กุมภาพันธ์) สามารถเปิด-ปิดได้ตามต้องการโดยไม่ขึ้นกับฤดูกาล ช่วยสร้างบรรยากาศที่สนุกสนานและเป็นมิตรในการใช้งาน
          </li>
          <li>
            <strong>เอฟเฟกต์อนุภาค (Particle):</strong> แสดงอนุภาคประกายไฟสีสันสดใสเมื่อผู้ใช้พิมพ์ข้อความในช่องแชท (Power Mode Effect) ช่วยเพิ่มความสนุกและมีชีวิตชีวาในการสนทนา เหมาะสำหรับผู้ที่ชอบความสดใสและการตอบสนองทางภาพ
          </li>
          <li>
            <strong>เงา (Box Shadow):</strong> เปิด-ปิดเงาของปุ่ม การ์ด และองค์ประกอบต่างๆ ในหน้า Chatbot การปิดเงาจะช่วยลดภาระการประมวลผลกราฟิกและทำให้หน้าจอดูแบนราบ เหมาะสำหรับผู้ที่ชอบ Flat Design หรือต้องการเพิ่มความเร็วในการแสดงผล
          </li>
          <li>
            <strong>แอนิเมชันทั้งหมด:</strong> ควบคุมการเคลื่อนไหวพิเศษต่างๆ รวมถึง Flying Text (ข้อความลอยขึ้น), Fade Effect, Slide Animation และเอฟเฟกต์การเปลี่ยนหน้าต่างๆ การปิดจะช่วยเพิ่มประสิทธิภาพการทำงานบนอุปกรณ์ที่มีสเปคต่ำ ลดการใช้แบตเตอรี่ และทำให้การตอบสนองเร็วขึ้น เหมาะสำหรับผู้ใช้ที่ต้องการประสิทธิภาพสูงสุด
          </li>
        </ul>
        <p class="info-note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span><strong>หมายเหตุ:</strong> การเปลี่ยนแปลงการตั้งค่าจะมีผลทันทีหลังจากกดปุ่ม "บันทึกการตั้งค่า" และจะบันทึกลงในอุปกรณ์ของคุณ ไม่จำเป็นต้อง Refresh หน้าเว็บ</span>
        </p>
      </div>
    </div>

    <!-- Apple-style Alert Modal -->
    <transition name="apple-alert-fade">
      <div v-if="showAlert" class="apple-alert-backdrop" @click="closeAlert">
        <div class="apple-alert-container" @click.stop>
          <div class="apple-alert-icon">
            <svg v-if="alertType === 'success'" class="alert-icon-svg" viewBox="0 0 52 52">
              <circle class="alert-icon-circle" cx="26" cy="26" r="25" fill="none"/>
              <path class="alert-icon-check" fill="none" d="M14 27l7.5 7.5L38 18"/>
            </svg>
            <svg v-else class="alert-icon-svg" viewBox="0 0 52 52">
              <circle class="alert-icon-circle-error" cx="26" cy="26" r="25" fill="none"/>
              <path class="alert-icon-x" fill="none" d="M16 16l20 20M36 16L16 36"/>
            </svg>
          </div>
          <h3 class="apple-alert-title">{{ alertTitle }}</h3>
          <p class="apple-alert-text">{{ alertText }}</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'

// Get global properties
const { appContext } = getCurrentInstance()
const { $axios, $swal } = appContext.config.globalProperties

// Loading states
const isSaving = ref(false)

// Apple alert states
const showAlert = ref(false)
const alertType = ref('success')
const alertTitle = ref('')
const alertText = ref('')
let alertTimeout = null

// Effect states
const masterEnabled = ref(true)
const snowEnabled = ref(true)
const particleEnabled = ref(true)
const shadowEnabled = ref(true)
const animationEnabled = ref(true)

// Original states for comparison
const originalMaster = ref(true)
const originalSnow = ref(true)
const originalParticle = ref(true)
const originalShadow = ref(true)
const originalAnimation = ref(true)

// Check if there are unsaved changes
const hasChanges = computed(() => {
  return (
    masterEnabled.value !== originalMaster.value ||
    snowEnabled.value !== originalSnow.value ||
    particleEnabled.value !== originalParticle.value ||
    shadowEnabled.value !== originalShadow.value ||
    animationEnabled.value !== originalAnimation.value
  )
})

// Load settings from localStorage or API
const loadSettings = () => {
  try {
    // Load from localStorage
    const savedMaster = localStorage.getItem('chatbot_master_enabled')
    const savedSnow = localStorage.getItem('chatbot_snow_enabled')
    const savedParticle = localStorage.getItem('chatbot_particle_enabled')
    const savedShadow = localStorage.getItem('chatbot_shadow_enabled')
    const savedAnimation = localStorage.getItem('chatbot_animation_enabled')

    if (savedMaster !== null) {
      masterEnabled.value = savedMaster === 'true'
      originalMaster.value = savedMaster === 'true'
    }

    if (savedSnow !== null) {
      snowEnabled.value = savedSnow === 'true'
      originalSnow.value = savedSnow === 'true'
    }

    if (savedParticle !== null) {
      particleEnabled.value = savedParticle === 'true'
      originalParticle.value = savedParticle === 'true'
    }

    if (savedShadow !== null) {
      shadowEnabled.value = savedShadow === 'true'
      originalShadow.value = savedShadow === 'true'
    }

    if (savedAnimation !== null) {
      animationEnabled.value = savedAnimation === 'true'
      originalAnimation.value = savedAnimation === 'true'
    }
  } catch (error) {
    console.error('Error loading settings:', error)
  }
}

// Apple alert functions
const showAppleAlert = (type, title, text, duration = 2000) => {
  alertType.value = type
  alertTitle.value = title
  alertText.value = text
  showAlert.value = true
  
  if (alertTimeout) clearTimeout(alertTimeout)
  alertTimeout = setTimeout(() => {
    closeAlert()
  }, duration)
}

const closeAlert = () => {
  showAlert.value = false
  if (alertTimeout) {
    clearTimeout(alertTimeout)
    alertTimeout = null
  }
}

// Toggle functions
const toggleMaster = (event) => {
  masterEnabled.value = event.target.checked
  // When master is turned off, turn off all effects
  if (!event.target.checked) {
    snowEnabled.value = false
    particleEnabled.value = false
    shadowEnabled.value = false
    animationEnabled.value = false
  }
}

const toggleSnow = (event) => {
  snowEnabled.value = event.target.checked
}

const toggleParticle = (event) => {
  particleEnabled.value = event.target.checked
}

const toggleShadow = (event) => {
  shadowEnabled.value = event.target.checked
}

const toggleAnimation = (event) => {
  animationEnabled.value = event.target.checked
}

// Save settings
const saveSettings = async () => {
  try {
    isSaving.value = true

    // Save to localStorage
    localStorage.setItem('chatbot_master_enabled', masterEnabled.value.toString())
    localStorage.setItem('chatbot_snow_enabled', snowEnabled.value.toString())
    localStorage.setItem('chatbot_particle_enabled', particleEnabled.value.toString())
    localStorage.setItem('chatbot_shadow_enabled', shadowEnabled.value.toString())
    localStorage.setItem('chatbot_animation_enabled', animationEnabled.value.toString())

    // Update original values
    originalMaster.value = masterEnabled.value
    originalSnow.value = snowEnabled.value
    originalParticle.value = particleEnabled.value
    originalShadow.value = shadowEnabled.value
    originalAnimation.value = animationEnabled.value

    // Apply or remove no-effects class based on master toggle
    if (masterEnabled.value) {
      document.body.classList.remove('no-effects')
    } else {
      document.body.classList.add('no-effects')
    }

    // Apply or remove no-shadows class based on shadow toggle
    if (shadowEnabled.value && masterEnabled.value) {
      document.body.classList.remove('no-shadows')
    } else {
      document.body.classList.add('no-shadows')
    }

    // Optional: Save to backend
    try {
      await $axios.post('/api/chatbot-settings', {
        snow_enabled: snowEnabled.value,
        particle_enabled: particleEnabled.value,
        animation_enabled: animationEnabled.value
      })
    } catch (apiError) {
      console.warn('Could not save to backend:', apiError)
    }

    // Show success message - Apple style
    showAppleAlert('success', 'บันทึกสำเร็จ', 'การตั้งค่าเอฟเฟกต์ถูกบันทึกแล้ว', 2000)

  } catch (error) {
    console.error('Error saving settings:', error)
    showAppleAlert('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกการตั้งค่าได้', 3000)
  } finally {
    isSaving.value = false
  }
}

// Reset settings to original
const resetSettings = () => {
  snowEnabled.value = originalSnow.value
  particleEnabled.value = originalParticle.value
  animationEnabled.value = originalAnimation.value
}

// Load settings on mount
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.effects-section {
  margin-top: 2rem;
  animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.effects-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(139, 92, 184, 0.1);
  box-shadow: 
    0 8px 32px rgba(139, 92, 184, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.effects-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 12px 48px rgba(139, 92, 184, 0.12),
    0 4px 12px rgba(0, 0, 0, 0.06);
}

.effects-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 28px;
  background: linear-gradient(135deg, rgba(139, 92, 184, 0.05) 0%, rgba(167, 139, 250, 0.03) 100%);
  border-bottom: 1px solid rgba(139, 92, 184, 0.08);
}

.card-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(139, 92, 184, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%);
  flex-shrink: 0;
}

.card-icon {
  filter: drop-shadow(0 2px 4px rgba(139, 92, 184, 0.2));
}

.card-title-group {
  flex: 1;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
  background: linear-gradient(135deg, #8B4CB8 0%, #A78BFA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.card-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.effects-card-body {
  padding: 28px;
}

.effect-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px;
  border-radius: 16px;
  background: rgba(249, 250, 251, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 16px;
}

.effect-item:last-of-type {
  margin-bottom: 24px;
}

.effect-item:hover {
  background: rgba(139, 92, 184, 0.05);
  transform: translateX(4px);
}

.effect-item.master-toggle {
  background: linear-gradient(135deg, rgba(139, 92, 184, 0.1) 0%, rgba(107, 44, 145, 0.08) 100%);
  border: 2px solid rgba(139, 92, 184, 0.2);
  margin-bottom: 24px;
}

.effect-item.master-toggle:hover {
  background: linear-gradient(135deg, rgba(139, 92, 184, 0.15) 0%, rgba(107, 44, 145, 0.12) 100%);
  border-color: rgba(139, 92, 184, 0.3);
}

.effect-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.effect-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.effect-item:hover .effect-icon {
  transform: scale(1.1) rotate(5deg);
}

.master-icon {
  background: linear-gradient(135deg, #8B4CB8 0%, #6B2C91 100%);
  color: white;
}

.snow-icon {
  background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%);
  color: white;
}

.particle-icon {
  background: linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%);
  color: white;
}

.shadow-icon {
  background: linear-gradient(135deg, #64748B 0%, #475569 100%);
  color: white;
}

.animation-icon {
  background: linear-gradient(135deg, #F472B6 0%, #EC4899 100%);
  color: white;
}

.effect-text {
  flex: 1;
}

.effect-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.effect-desc {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.effect-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #d1d5db;
  border-radius: 34px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch input:checked + .toggle-slider {
  background: linear-gradient(135deg, #8B4CB8 0%, #A78BFA 100%);
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.toggle-switch input:disabled + .toggle-slider {
  opacity: 0.5;
  cursor: not-allowed;
}

.toggle-status {
  font-size: 13px;
  font-weight: 600;
  color: #9ca3af;
  min-width: 32px;
  transition: color 0.3s;
}

.toggle-status.active {
  color: #8B4CB8;
}

.effects-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn-save-effects,
.btn-reset-effects {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
}

.btn-save-effects {
  flex: 1;
  background: linear-gradient(135deg, #8B4CB8 0%, #A78BFA 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(139, 76, 184, 0.3);
}

.btn-save-effects:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 76, 184, 0.4);
}

.btn-save-effects:active:not(:disabled) {
  transform: translateY(0);
}

.btn-save-effects:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-reset-effects {
  padding: 12px 20px;
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.btn-reset-effects:hover:not(:disabled) {
  background: rgba(107, 114, 128, 0.15);
  color: #4b5563;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Info Card */
.info-card {
  margin-top: 16px;
  padding: 20px 24px;
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: 16px;
  display: flex;
  gap: 16px;
  animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.info-icon {
  flex-shrink: 0;
  color: #3b82f6;
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
}

.info-text {
  flex: 1;
}

.info-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.info-list {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.8;
}

.info-list li {
  margin-bottom: 12px;
}

.info-list li:last-child {
  margin-bottom: 0;
}

.info-list strong {
  font-weight: 600;
  color: #1f2937;
  display: block;
  margin-bottom: 4px;
}

.info-note {
  margin: 16px 0 0 0;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.08) 100%);
  border-left: 3px solid #f59e0b;
  border-radius: 8px;
  font-size: 13px;
  color: #92400e;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  line-height: 1.6;
}

.info-note svg {
  flex-shrink: 0;
  color: #f59e0b;
  margin-top: 1px;
}

.info-note strong {
  color: #78350f;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .effects-card-header {
    padding: 20px;
  }

  .effects-card-body {
    padding: 20px;
  }

  .effect-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .effect-toggle {
    width: 100%;
    justify-content: space-between;
  }

  .effects-actions {
    flex-direction: column;
  }

  .btn-save-effects,
  .btn-reset-effects {
    width: 100%;
  }

  .info-card {
    flex-direction: column;
    gap: 12px;
  }
}

/* Apple-style Alert Modal */
.apple-alert-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.apple-alert-container {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-radius: 20px;
  padding: 40px 32px 32px;
  max-width: 340px;
  width: 100%;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  text-align: center;
  animation: appleAlertSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes appleAlertSlideIn {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.apple-alert-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
}

.alert-icon-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.alert-icon-circle {
  stroke: #34D399;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  animation: alertCircle 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  animation-delay: 0.1s;
}

.alert-icon-check {
  stroke: #34D399;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: alertCheck 0.4s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  animation-delay: 0.4s;
}

.alert-icon-circle-error {
  stroke: #EF4444;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  animation: alertCircle 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  animation-delay: 0.1s;
}

.alert-icon-x {
  stroke: #EF4444;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 54;
  stroke-dashoffset: 54;
  animation: alertCheck 0.4s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  animation-delay: 0.4s;
}

@keyframes alertCircle {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes alertCheck {
  to {
    stroke-dashoffset: 0;
  }
}

.apple-alert-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 12px 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.apple-alert-text {
  font-size: 15px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

/* Fade transition */
.apple-alert-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.apple-alert-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
}

.apple-alert-fade-enter-from {
  opacity: 0;
}

.apple-alert-fade-leave-to {
  opacity: 0;
}

.apple-alert-fade-enter-from .apple-alert-container {
  transform: scale(0.92) translateY(12px);
}

.apple-alert-fade-leave-to .apple-alert-container {
  transform: scale(0.96);
}
</style>
