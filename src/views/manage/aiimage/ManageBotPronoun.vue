<template>
  <div class="pronoun-section">

    <!-- Pronoun Card -->
    <div class="pronoun-card" :class="{ 'card-loading': isLoading }">
      <div class="card-header">
        <div class="card-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="card-title-group">
          <h3 class="card-title">เลือกสรรพนาม</h3>
          <p class="card-subtitle">กำหนดสรรพนามที่บอทจะใช้เรียกตัวเอง</p>
        </div>
      </div>

      <div class="card-body">
        <!-- Pronoun Options -->
        <div class="pronoun-options">
          <div 
            v-for="option in pronounOptions" 
            :key="option.value"
            class="pronoun-option"
            :class="{ 
              'selected': selectedPronoun === option.value,
              'custom-selected': option.value === 'custom' && selectedPronoun === 'custom'
            }"
            @click="selectPronoun(option.value)"
          >
            <div class="option-content">
              <div class="option-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle v-if="option.value !== 'custom'" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <text v-if="option.value !== 'custom'" x="12" y="16" text-anchor="middle" fill="currentColor" font-size="8" font-weight="600">{{ option.icon }}</text>
                  <rect v-else x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" stroke-width="2"/>
                  <path v-if="option.value === 'custom'" d="M8 12h8M12 8v8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="option-text">
                <span class="option-label">{{ option.label }}</span>
                <span class="option-description">{{ option.description }}</span>
              </div>
            </div>
            <div class="option-check" v-if="selectedPronoun === option.value">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Custom Input -->
        <transition name="slide-fade">
          <div v-if="selectedPronoun === 'custom'" class="custom-input-wrapper">
            <label class="custom-label">กรอกสรรพนามที่ต้องการ</label>
            <div class="custom-input-container">
              <input 
                type="text" 
                v-model="customPronoun"
                class="custom-input"
                placeholder="เช่น เรา, ข้าพเจ้า, กระผม..."
                maxlength="20"
              />
              <span class="input-counter">{{ customPronoun.length }}/20</span>
            </div>
          </div>
        </transition>

        <!-- Info Box -->
        <div class="info-box">
          <div class="info-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="info-content">
            <span class="info-text">ตัวอย่าง: "{{ displayPronoun }}ยินดีที่จะช่วยเหลือคุณค่ะ"</span>
          </div>
        </div>

        <!-- Save Button -->
        <div class="action-area">
          <button 
            class="save-button"
            :class="{ 'saving': isSaving }"
            @click="savePronoun"
            :disabled="isSaving || (selectedPronoun === 'custom' && !customPronoun.trim())"
          >
            <span v-if="!isSaving" class="button-content">
              <svg class="button-icon" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              บันทึกสรรพนาม
            </span>
            <span v-else class="button-content">
              <div class="spinner"></div>
              กำลังบันทึก...
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Apple Style Alert Modal -->
    <transition name="modal-fade">
      <div v-if="showAlert" class="alert-overlay" @click.self="closeAlert">
        <div class="alert-modal">
          <div class="alert-icon" :class="alertType">
            <svg v-if="alertType === 'success'" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M8 12l3 3 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h3 class="alert-title">{{ alertTitle }}</h3>
          <p class="alert-message">{{ alertMessage }}</p>
          <button class="alert-button" @click="closeAlert">ตกลง</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'

// Get global properties
const { appContext } = getCurrentInstance()
const { $axios } = appContext.config.globalProperties

// State
const isLoading = ref(true)
const isSaving = ref(false)
const selectedPronoun = ref('หนู')
const customPronoun = ref('')

// Alert State
const showAlert = ref(false)
const alertType = ref('success')
const alertTitle = ref('')
const alertMessage = ref('')

// Pronoun Options (Female only)
const pronounOptions = [
  { 
    value: 'หนู', 
    label: 'หนู', 
    description: 'สุภาพ น่ารัก เป็นกันเอง',
    icon: 'หนู'
  },
  { 
    value: 'ดิฉัน', 
    label: 'ดิฉัน', 
    description: 'สุภาพ เป็นทางการ (หญิง)',
    icon: 'ดิฉัน'
  },
  { 
    value: 'ข้าพเจ้า', 
    label: 'ข้าพเจ้า', 
    description: 'ทางการมาก ราชการ (หญิง)',
    icon: 'ข้า'
  },
  { 
    value: 'ฉัน', 
    label: 'ฉัน', 
    description: 'เป็นกันเอง สบายๆ',
    icon: 'ฉัน'
  },
  { 
    value: 'custom', 
    label: 'กำหนดเอง', 
    description: 'ใส่สรรพนามที่คุณต้องการ',
    icon: '+'
  }
]

// Computed
const displayPronoun = computed(() => {
  if (selectedPronoun.value === 'custom') {
    return customPronoun.value || 'สรรพนาม'
  }
  return selectedPronoun.value
})

// Methods
const selectPronoun = (value) => {
  selectedPronoun.value = value
  if (value !== 'custom') {
    customPronoun.value = ''
  }
}

const showAlertModal = (type, title, message) => {
  alertType.value = type
  alertTitle.value = title
  alertMessage.value = message
  showAlert.value = true
}

const closeAlert = () => {
  showAlert.value = false
}

const loadPronoun = async () => {
  isLoading.value = true
  try {
    const response = await $axios.get('/ai-image/bot-pronoun')
    if (response.data && response.data.pronoun) {
      const savedPronoun = response.data.pronoun
      const isPreset = pronounOptions.some(opt => opt.value === savedPronoun && opt.value !== 'custom')
      
      if (isPreset) {
        selectedPronoun.value = savedPronoun
      } else {
        selectedPronoun.value = 'custom'
        customPronoun.value = savedPronoun
      }
    }
  } catch (error) {
    console.error('Error loading pronoun:', error)
  } finally {
    isLoading.value = false
  }
}

const savePronoun = async () => {
  if (isSaving.value) return
  
  const pronounToSave = selectedPronoun.value === 'custom' 
    ? customPronoun.value.trim() 
    : selectedPronoun.value
    
  if (!pronounToSave) {
    showAlertModal('error', 'ไม่สามารถบันทึกได้', 'กรุณาระบุสรรพนามที่ต้องการ')
    return
  }
  
  isSaving.value = true
  
  try {
    await $axios.post('/ai-image/bot-pronoun', { pronoun: pronounToSave })
    showAlertModal('success', 'บันทึกสำเร็จ', `บอทจะใช้สรรพนาม "${pronounToSave}" ในการสนทนา`)
  } catch (error) {
    console.error('Error saving pronoun:', error)
    showAlertModal('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกสรรพนามได้ กรุณาลองใหม่อีกครั้ง')
  } finally {
    isSaving.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadPronoun()
})
</script>

<style scoped>
/* Section Container */
.pronoun-section {
  margin-bottom: 2rem;
}

/* Section Header */
.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.header-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-icon-wrapper.pronoun-icon {
  background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%);
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3);
}

.header-icon-wrapper svg {
  width: 24px;
  height: 24px;
  color: white;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
  letter-spacing: -0.02em;
}

.section-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

/* Pronoun Card */
.pronoun-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.02),
    0 12px 24px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: all 0.3s ease;
}

.pronoun-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 12px rgba(0, 0, 0, 0.04),
    0 16px 32px rgba(0, 0, 0, 0.06);
}

.pronoun-card.card-loading {
  opacity: 0.7;
  pointer-events: none;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
  border-bottom: 1px solid rgba(139, 92, 246, 0.1);
}

.card-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon svg {
  width: 22px;
  height: 22px;
  color: white;
}

.card-title-group {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}

.card-subtitle {
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0;
}

.card-body {
  padding: 1.5rem;
}

/* Pronoun Options */
.pronoun-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

.pronoun-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.6);
  border: 2px solid rgba(0, 0, 0, 0.06);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.pronoun-option:hover {
  background: rgba(139, 92, 246, 0.08);
  border-color: rgba(139, 92, 246, 0.2);
  transform: translateY(-2px);
}

.pronoun-option.selected {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%);
  border-color: #8B5CF6;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

.option-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.option-icon {
  width: 40px;
  height: 40px;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.pronoun-option.selected .option-icon {
  background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%);
}

.option-icon svg {
  width: 22px;
  height: 22px;
  color: #8B5CF6;
  transition: all 0.25s ease;
}

.pronoun-option.selected .option-icon svg {
  color: white;
}

.option-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.option-label {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a2e;
}

.option-description {
  font-size: 0.75rem;
  color: #64748b;
}

.option-check {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: check-pop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  flex-shrink: 0;
}

@keyframes check-pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.option-check svg {
  width: 14px;
  height: 14px;
  color: white;
}

/* Custom Input */
.custom-input-wrapper {
  margin-top: 1.25rem;
  padding: 1.25rem;
  background: rgba(139, 92, 246, 0.05);
  border-radius: 14px;
  border: 1px solid rgba(139, 92, 246, 0.1);
}

.custom-label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
}

.custom-input-container {
  position: relative;
}

.custom-input {
  width: 100%;
  padding: 0.875rem 1rem;
  font-size: 0.9375rem;
  border: 2px solid rgba(139, 92, 246, 0.2);
  border-radius: 10px;
  background: white;
  color: #1a1a2e;
  transition: all 0.25s ease;
  outline: none;
}

.custom-input:focus {
  border-color: #8B5CF6;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
}

.custom-input::placeholder {
  color: #94a3b8;
}

.input-counter {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.6875rem;
  color: #94a3b8;
}

/* Slide Fade Transition */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* Info Box */
.info-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.25rem;
  padding: 1rem;
  background: rgba(79, 172, 254, 0.08);
  border-radius: 12px;
  border: 1px solid rgba(79, 172, 254, 0.15);
}

.info-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-icon svg {
  width: 16px;
  height: 16px;
  color: white;
}

.info-content {
  flex: 1;
}

.info-text {
  font-size: 0.8125rem;
  color: #4facfe;
  font-weight: 500;
}

/* Action Area */
.action-area {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.save-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%);
  color: white;
  font-size: 0.9375rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  min-width: 160px;
}

.save-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4);
}

.save-button:active:not(:disabled) {
  transform: translateY(0);
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.button-icon {
  width: 18px;
  height: 18px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Alert Modal */
.alert-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.alert-modal {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 340px;
  width: 100%;
  text-align: center;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  animation: modal-pop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes modal-pop {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.alert-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.alert-icon.success {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.alert-icon.error {
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
}

.alert-icon svg {
  width: 28px;
  height: 28px;
  color: white;
}

.alert-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 0.5rem;
}

.alert-message {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 1.25rem;
  line-height: 1.5;
}

.alert-button {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%);
  color: white;
  font-size: 0.9375rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.alert-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
}

/* Modal Fade Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-active .alert-modal,
.modal-fade-leave-active .alert-modal {
  transition: transform 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .alert-modal,
.modal-fade-leave-to .alert-modal {
  transform: scale(0.8);
}

/* Responsive */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .card-header {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
    padding: 1rem;
  }

  .card-body {
    padding: 1rem;
  }

  .pronoun-options {
    grid-template-columns: 1fr;
  }

  .pronoun-option {
    padding: 0.75rem;
  }

  .save-button {
    width: 100%;
  }

  .info-box {
    flex-direction: column;
    text-align: center;
  }
}
</style>
