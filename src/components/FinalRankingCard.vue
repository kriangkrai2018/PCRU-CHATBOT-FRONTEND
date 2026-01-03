<template>
  <div class="ranking-card-wrapper">
    <div class="ranking-card" :class="{ 'is-calculating': isCalculating }">
      <!-- Animated Header -->
      <div class="ranking-header">
        <div class="header-left">
          <div class="icon-container">
            <svg class="check-icon" width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle class="circle-bg" cx="12" cy="12" r="10" />
              <circle class="circle-progress" cx="12" cy="12" r="10" />
              <path class="checkmark" d="M7 12.5L10.5 16L17 9" />
            </svg>
          </div>
          <div class="title-group">
            <h5 class="card-title">Final Ranking</h5>
            <span class="card-subtitle">คำนวณคะแนนการจัดอันดับ</span>
          </div>
        </div>
        
        <div class="score-pills">
          <transition name="score-pop">
            <div v-if="result" class="score-pill total-pill">
              <span class="pill-label">Total</span>
              <span class="pill-value">{{ result.total.toFixed(2) }}</span>
              <div class="pill-glow"></div>
            </div>
          </transition>
          <transition name="score-pop">
            <div v-if="result && typeof result.textFactor === 'number'" class="score-pill text-pill">
              <span class="pill-label">Text ×</span>
              <span class="pill-value">{{ Number(result.textFactor).toFixed(2) }}</span>
            </div>
          </transition>
        </div>
      </div>

      <!-- Body Content -->
      <div class="ranking-body">
        <!-- Sample Text Section -->
        <div v-if="showSampleText" class="input-section sample-section">
          <div class="section-header">
            <svg class="section-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="section-label">ข้อความทดสอบ</span>
            <span class="section-hint">(ไม่บันทึก)</span>
          </div>
          <div class="textarea-wrapper">
            <textarea 
              class="apple-textarea" 
              rows="2" 
              placeholder="พิมพ์ข้อความ เช่น หอใน อยากได้หอพัก"
              v-model="sampleText"
              @focus="textareaFocused = true"
              @blur="textareaFocused = false"
            ></textarea>
            <div class="textarea-border" :class="{ focused: textareaFocused }"></div>
          </div>
        </div>

        <!-- Two Column Layout -->
        <div class="columns-container" :class="{ 'single-column': !showScoreInputs }">
          <!-- Scores Column -->
          <div v-if="showScoreInputs" class="column scores-column">
            <div class="column-header">
              <div class="column-icon blue-gradient">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                </svg>
              </div>
              <div>
                <h6 class="column-title">คะแนนจับคู่</h6>
                <span class="column-subtitle">0-1 ต่อเคส</span>
              </div>
            </div>
            
            <div class="inputs-grid">
              <div class="input-group" v-for="(item, key) in scoreFields" :key="key">
                <label class="input-label">
                  <span class="label-dot" :style="{ background: item.color }"></span>
                  {{ item.label }}
                </label>
                <div class="input-wrapper">
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    max="1" 
                    v-model.number="scores[key]"
                    class="apple-input"
                    @focus="focusedInput = key"
                    @blur="focusedInput = null"
                  />
                  <div class="input-ring" :class="{ active: focusedInput === key }" :style="{ '--ring-color': item.color }"></div>
                </div>
              </div>
            </div>
            
            <p class="helper-text">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
                <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              ใช้ปรับคะแนนรายคำ เช่น คำพ้องเหมือนมากให้ 0.95
            </p>
          </div>

          <!-- Weights Column -->
          <div class="column weights-column">
            <div class="column-header">
              <div class="column-icon purple-gradient">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="flex-grow-1">
                <h6 class="column-title">ค่าน้ำหนัก</h6>
                <span class="column-subtitle">ปรับแล้วมีผลทั้งระบบ</span>
              </div>
              <button class="preset-btn" @click="loadDefaults" title="โหลดค่ามาตรฐาน">
                <svg class="preset-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>ค่ามาตรฐาน</span>
              </button>
            </div>
            
            <div class="inputs-grid">
              <div class="input-group" v-for="(item, key) in weightFields" :key="key">
                <label class="input-label">
                  <span class="label-dot" :style="{ background: item.color }"></span>
                  {{ item.label }}
                </label>
                <div class="input-wrapper">
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    max="2" 
                    v-model.number="weights[key]"
                    class="apple-input"
                    @focus="focusedInput = 'w_' + key"
                    @blur="focusedInput = null"
                  />
                  <div class="input-ring" :class="{ active: focusedInput === 'w_' + key }" :style="{ '--ring-color': item.color }"></div>
                </div>
              </div>
            </div>
            
            <p class="helper-text">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" stroke-width="1.5"/>
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              ค่านี้คือ global weight ใช้กับทุกคำถาม/คำตอบ
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions-row">
          <button v-if="showCalculate" class="action-btn calculate-btn" @click="calculate" :disabled="isCalculating">
            <svg v-if="!isCalculating" class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M8 12h8M12 8v8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <svg v-else class="btn-icon spinning" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-dasharray="31.4 31.4" stroke-linecap="round"/>
            </svg>
            <span>{{ isCalculating ? 'กำลังคำนวณ...' : 'คำนวณ Final Ranking' }}</span>
          </button>
          
          <button v-if="showSave" class="action-btn save-btn" @click="saveWeights" :disabled="isSaving">
            <svg v-if="!isSaving" class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2"/>
              <polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" stroke-width="2"/>
              <polyline points="7,3 7,8 15,8" stroke="currentColor" stroke-width="2"/>
            </svg>
            <svg v-else class="btn-icon spinning" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-dasharray="31.4 31.4" stroke-linecap="round"/>
            </svg>
            <span>{{ isSaving ? 'กำลังบันทึก...' : 'บันทึกค่า' }}</span>
          </button>
        </div>

        <!-- Breakdown Results -->
        <transition name="results-slide">
          <div v-if="result" class="breakdown-section">
            <div class="breakdown-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 3v18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18 17V9M13 17V5M8 17v-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>Breakdown</span>
            </div>
            
            <div class="breakdown-grid">
              <div 
                v-for="(item, key) in breakdownItems" 
                :key="key"
                class="breakdown-card"
                :style="{ '--card-color': item.color, '--delay': item.delay }"
              >
                <div class="card-icon" :style="{ background: item.gradient }">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path :d="item.icon" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="card-content">
                  <span class="card-label">{{ item.label }}</span>
                  <span class="card-formula">{{ scores[key].toFixed(2) }} × {{ (result.weights?.[key] ?? item.defaultWeight).toFixed(2) }}</span>
                </div>
                <div class="card-value">
                  <span class="value-number">{{ result.breakdown[key].toFixed(2) }}</span>
                </div>
                <div class="card-progress">
                  <div class="progress-bar" :style="{ width: (result.breakdown[key] / result.total * 100) + '%', background: item.gradient }"></div>
                </div>
              </div>
            </div>
          </div>
        </transition>

        <!-- Notes -->
        <transition name="fade">
          <div v-if="result?.notes && result.notes.length" class="notes-section">
            <div class="notes-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="notes-content">
              <strong>Notes:</strong>
              <span v-for="(n,i) in result.notes" :key="i">{{ i > 0 ? ' • ' : '' }}{{ n }}</span>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { calculateFinalRanking, getRankingWeights, setRankingWeights } from '@/plugins/apiRanking';
import { useAppleToast } from '@/composables/useAppleToast';

const { success: showSuccess, error: showError } = useAppleToast();

const props = defineProps({
  showScoreInputs: { type: Boolean, default: true },
  showSampleText: { type: Boolean, default: true },
  showSave: { type: Boolean, default: true },
  showCalculate: { type: Boolean, default: true },
  initialScores: {
    type: Object,
    default: () => ({ core: 1.0, synonym_support: 0.95, domain_support: 0.90, application_support: 0.20 })
  }
});

// UI State
const textareaFocused = ref(false);
const focusedInput = ref(null);
const isCalculating = ref(false);
const isSaving = ref(false);

// Field configurations
const scoreFields = {
  core: { label: 'Core Score', color: '#007AFF' },
  synonym_support: { label: 'Synonym Score', color: '#5856D6' },
  domain_support: { label: 'Domain Score', color: '#FF9500' },
  application_support: { label: 'Application Score', color: '#34C759' }
};

const weightFields = {
  core: { label: 'Core Weight', color: '#007AFF' },
  synonym_support: { label: 'Synonym Weight', color: '#5856D6' },
  domain_support: { label: 'Domain Weight', color: '#FF9500' },
  application_support: { label: 'Application Weight', color: '#34C759' }
};

const breakdownItems = computed(() => ({
  core: { 
    label: 'Core', 
    color: '#007AFF', 
    gradient: 'linear-gradient(135deg, #007AFF, #5AC8FA)',
    icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    defaultWeight: 1.0,
    delay: '0ms'
  },
  synonym_support: { 
    label: 'Synonym', 
    color: '#5856D6', 
    gradient: 'linear-gradient(135deg, #5856D6, #AF52DE)',
    icon: 'M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z',
    defaultWeight: 0.95,
    delay: '50ms'
  },
  domain_support: { 
    label: 'Domain', 
    color: '#FF9500', 
    gradient: 'linear-gradient(135deg, #FF9500, #FF2D55)',
    icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
    defaultWeight: 0.90,
    delay: '100ms'
  },
  application_support: { 
    label: 'Application', 
    color: '#34C759', 
    gradient: 'linear-gradient(135deg, #34C759, #30D158)',
    icon: 'M22 11.08V12a10 10 0 11-5.93-9.14',
    defaultWeight: 0.20,
    delay: '150ms'
  }
}));

// Data
const weights = ref({
  core: 1.0,
  synonym_support: 0.95,
  domain_support: 0.90,
  application_support: 0.20,
});

const scores = ref({
  core: 1.0,
  synonym_support: 0.95,
  domain_support: 0.90,
  application_support: 0.20,
});

const sampleText = ref('');
const result = ref(null);

// Watchers
watch(() => props.initialScores, (val) => {
  if (val) {
    scores.value = {
      core: Number(val.core ?? scores.value.core),
      synonym_support: Number(val.synonym_support ?? scores.value.synonym_support),
      domain_support: Number(val.domain_support ?? scores.value.domain_support),
      application_support: Number(val.application_support ?? scores.value.application_support),
    };
  }
}, { immediate: true });

watch(() => ({ ...weights.value, ...scores.value }), () => {
  autoCalculateIfNeeded();
}, { deep: true });

watch(sampleText, () => {
  if (sampleText.value.trim()) {
    autoCalculateIfNeeded();
  }
});

// Methods
async function calculate() {
  isCalculating.value = true;
  try {
    await new Promise(r => setTimeout(r, 300)); // Smooth animation
    result.value = await calculateFinalRanking(scores.value, weights.value, sampleText.value || '');
  } finally {
    isCalculating.value = false;
  }
}

function loadDefaults() {
  weights.value.core = 1.0;
  weights.value.synonym_support = 0.95;
  weights.value.domain_support = 0.90;
  weights.value.application_support = 0.20;
  autoCalculateIfNeeded();
  showSuccess('โหลดค่ามาตรฐานแล้ว');
}

function autoCalculateIfNeeded() {
  if (!props.showCalculate) {
    calculate();
  }
}

async function reloadWeights() {
  try {
    const w = await getRankingWeights();
    if (w) {
      weights.value.core = Number(w.core ?? weights.value.core);
      weights.value.synonym_support = Number(w.synonym_support ?? weights.value.synonym_support);
      weights.value.domain_support = Number(w.domain_support ?? weights.value.domain_support);
      weights.value.application_support = Number(w.application_support ?? weights.value.application_support);
    }
    autoCalculateIfNeeded();
  } catch (e) {
    console.error('Failed to reload weights:', e);
  }
}

async function resetToDefaults(defaultWeights) {
  weights.value.core = Number(defaultWeights.core);
  weights.value.synonym_support = Number(defaultWeights.synonym_support);
  weights.value.domain_support = Number(defaultWeights.domain_support);
  weights.value.application_support = Number(defaultWeights.application_support);
  autoCalculateIfNeeded();
}

async function saveWeights() {
  isSaving.value = true;
  try {
    const payload = {
      core: weights.value.core,
      synonym_support: weights.value.synonym_support,
      domain_support: weights.value.domain_support,
      application_support: weights.value.application_support,
    };
    const res = await setRankingWeights(payload);
    if (res && res.ok) {
      showSuccess('บันทึกค่าน้ำหนักเรียบร้อยแล้ว');
    } else {
      const msg = res && res.message ? res.message : (res && res.weights ? 'Saved (no message)' : 'Unknown error');
      showError('ไม่สามารถบันทึกได้: ' + msg);
    }
  } catch (e) {
    console.error('Save weights error', e);
    const serverMsg = e?.response?.data?.message || e?.message || 'เกิดข้อผิดพลาดขณะบันทึกค่าน้ำหนัก';
    const status = e?.response?.status ? ' (status ' + e.response.status + ')' : '';
    showError(serverMsg + status);
  } finally {
    isSaving.value = false;
  }
}

onMounted(async () => {
  await reloadWeights();
});

defineExpose({ reloadWeights, resetToDefaults });
</script>

<style scoped>
/* ========== Apple Design System Variables ========== */
.ranking-card-wrapper {
  --apple-blue: #007AFF;
  --apple-purple: #5856D6;
  --apple-orange: #FF9500;
  --apple-green: #34C759;
  --apple-red: #FF3B30;
  --apple-gray: #8E8E93;
  --apple-light-gray: #F2F2F7;
  --apple-border: rgba(0, 0, 0, 0.06);
  --card-radius: 20px;
  --transition-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --transition-smooth: cubic-bezier(0.4, 0, 0.2, 1);
}

/* ========== Card Container ========== */
.ranking-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--card-radius);
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.04),
    inset 0 0 0 0.5px rgba(255, 255, 255, 0.8);
  padding: 24px;
  animation: cardEntrance 0.6s var(--transition-spring);
  transition: transform 0.3s var(--transition-smooth), box-shadow 0.3s var(--transition-smooth);
}

.ranking-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.1),
    0 2px 4px rgba(0, 0, 0, 0.04),
    inset 0 0 0 0.5px rgba(255, 255, 255, 0.9);
}

.ranking-card.is-calculating {
  pointer-events: none;
  opacity: 0.8;
}

@keyframes cardEntrance {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ========== Header ========== */
.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.icon-container {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Animated Check Icon */
.check-icon {
  filter: drop-shadow(0 2px 8px rgba(0, 122, 255, 0.3));
}

.check-icon .circle-bg {
  fill: none;
  stroke: var(--apple-light-gray);
  stroke-width: 2;
}

.check-icon .circle-progress {
  fill: none;
  stroke: var(--apple-blue);
  stroke-width: 2;
  stroke-dasharray: 62.83;
  stroke-dashoffset: 62.83;
  stroke-linecap: round;
  transform-origin: center;
  animation: circleProgress 1.5s var(--transition-smooth) forwards;
}

.check-icon .checkmark {
  fill: none;
  stroke: var(--apple-green);
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  animation: checkmarkDraw 0.4s var(--transition-smooth) 0.8s forwards;
}

@keyframes circleProgress {
  to { stroke-dashoffset: 0; }
}

@keyframes checkmarkDraw {
  to { stroke-dashoffset: 0; }
}

.title-group {
  display: flex;
  flex-direction: column;
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.02em;
}

.card-subtitle {
  font-size: 0.8rem;
  color: var(--apple-gray);
  margin-top: 2px;
}

/* Score Pills */
.score-pills {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.score-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 100px;
  position: relative;
  overflow: hidden;
}

.total-pill {
  background: linear-gradient(135deg, #e8f4ff 0%, #d4e8ff 100%);
  color: var(--apple-blue);
}

.text-pill {
  background: linear-gradient(135deg, #f0e8ff 0%, #e4d8ff 100%);
  color: var(--apple-purple);
}

.pill-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
}

.pill-value {
  font-size: 1.1rem;
  font-weight: 800;
}

.pill-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 60%);
  animation: glowPulse 2s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { transform: scale(0.8); opacity: 0.5; }
  50% { transform: scale(1); opacity: 1; }
}

/* ========== Body ========== */
.ranking-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Sample Text Section */
.sample-section {
  animation: slideDown 0.4s var(--transition-smooth);
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.section-icon {
  color: var(--apple-gray);
}

.section-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1d1d1f;
}

.section-hint {
  font-size: 0.75rem;
  color: var(--apple-gray);
}

.textarea-wrapper {
  position: relative;
}

.apple-textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid #e5e5ea;
  border-radius: 14px;
  background: #ffffff;
  font-size: 0.95rem;
  resize: vertical;
  min-height: 70px;
  transition: all 0.2s ease;
  outline: none;
}

.apple-textarea:focus {
  background: #ffffff;
  border-color: var(--apple-blue);
}

.apple-textarea::placeholder {
  color: #c7c7cc;
}

.textarea-border {
  position: absolute;
  inset: 0;
  border-radius: 14px;
  border: 2px solid transparent;
  pointer-events: none;
  transition: border-color 0.3s var(--transition-smooth), box-shadow 0.3s var(--transition-smooth);
}

.textarea-border.focused {
  border-color: var(--apple-blue);
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.15);
}

/* ========== Columns ========== */
.columns-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.columns-container.single-column {
  grid-template-columns: 1fr;
}

.scores-column {
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 100%);
  border: 1px solid rgba(0, 122, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.weights-column {
  background: linear-gradient(135deg, #f5f0ff 0%, #ede8ff 100%);
  border: 1px solid rgba(88, 86, 214, 0.1);
  border-radius: 16px;
  padding: 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.scores-column:hover,
.weights-column:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.column-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.column-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.blue-gradient {
  background: linear-gradient(135deg, #007AFF, #5AC8FA);
}

.purple-gradient {
  background: linear-gradient(135deg, #5856D6, #AF52DE);
}

.column-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #1d1d1f;
}

.column-subtitle {
  font-size: 0.75rem;
  color: var(--apple-gray);
}

/* Preset Button */
.preset-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #5856D6, #AF52DE);
  color: white;
  border: none;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s var(--transition-smooth);
  box-shadow: 0 2px 8px rgba(88, 86, 214, 0.3);
  margin-left: auto;
}

.preset-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(88, 86, 214, 0.4);
}

.preset-btn:active {
  transform: scale(0.98);
}

.preset-icon {
  animation: iconSpin 10s linear infinite;
}

@keyframes iconSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Inputs Grid */
.inputs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #666;
}

.label-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.input-wrapper {
  position: relative;
}

.apple-input {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #e5e5ea;
  border-radius: 12px;
  background: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  color: #1d1d1f;
  outline: none;
  transition: all 0.2s ease;
  -moz-appearance: textfield;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.apple-input:hover {
  border-color: #d1d1d6;
}

.apple-input:focus {
  border-color: transparent;
}

.apple-input::-webkit-outer-spin-button,
.apple-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input-ring {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  border: 2px solid transparent;
  pointer-events: none;
  transition: all 0.3s var(--transition-smooth);
}

.input-ring.active {
  border-color: var(--ring-color, var(--apple-blue));
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--ring-color, var(--apple-blue)) 15%, transparent);
}

.helper-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--apple-gray);
  margin-top: 12px;
}

/* ========== Actions ========== */
.actions-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 24px;
  border: none;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s var(--transition-smooth);
  flex: 1;
  min-width: 180px;
}

.calculate-btn {
  background: linear-gradient(135deg, #FF9500 0%, #FF6B00 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(255, 149, 0, 0.35);
}

.calculate-btn:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 24px rgba(255, 149, 0, 0.45);
}

.calculate-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.save-btn {
  background: linear-gradient(135deg, #34C759 0%, #0BB34A 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(52, 199, 89, 0.35);
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 24px rgba(52, 199, 89, 0.45);
}

.save-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  flex-shrink: 0;
}

.btn-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ========== Breakdown Section ========== */
.breakdown-section {
  margin-top: 8px;
}

.breakdown-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: var(--apple-gray);
  font-weight: 600;
  font-size: 0.85rem;
}

.breakdown-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.breakdown-card {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  animation: cardSlideUp 0.5s var(--transition-spring) backwards;
  animation-delay: var(--delay, 0ms);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.breakdown-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

@keyframes cardSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1d1d1f;
}

.card-formula {
  font-size: 0.7rem;
  color: var(--apple-gray);
  font-weight: 500;
}

.card-value {
  margin-top: auto;
}

.value-number {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--card-color, #1d1d1f);
}

.card-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--apple-light-gray);
}

.progress-bar {
  height: 100%;
  border-radius: 2px;
  transition: width 0.8s var(--transition-smooth);
}

/* ========== Notes Section ========== */
.notes-section {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fff8e8 0%, #fff3d4 100%);
  border-radius: 12px;
  border-left: 4px solid var(--apple-orange);
}

.notes-icon {
  color: var(--apple-orange);
  flex-shrink: 0;
  margin-top: 2px;
}

.notes-content {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.5;
}

/* ========== Transitions ========== */
.score-pop-enter-active {
  animation: scorePop 0.4s var(--transition-spring);
}

.score-pop-leave-active {
  animation: scorePop 0.3s var(--transition-smooth) reverse;
}

@keyframes scorePop {
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}

.results-slide-enter-active {
  animation: resultsSlide 0.5s var(--transition-spring);
}

.results-slide-leave-active {
  animation: resultsSlide 0.3s var(--transition-smooth) reverse;
}

@keyframes resultsSlide {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* ========== Responsive Design ========== */
@media (max-width: 992px) {
  .columns-container {
    grid-template-columns: 1fr;
  }
  
  .breakdown-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .ranking-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .score-pills {
    width: 100%;
  }
  
  .score-pill {
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .ranking-card {
    padding: 16px;
    border-radius: 16px;
  }
  
  .inputs-grid {
    grid-template-columns: 1fr;
  }
  
  .breakdown-grid {
    grid-template-columns: 1fr;
  }
  
  .breakdown-card {
    flex-direction: row;
    align-items: center;
    padding: 14px 16px;
  }
  
  .card-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }
  
  .card-content {
    flex: 1;
  }
  
  .card-value {
    margin-top: 0;
  }
  
  .value-number {
    font-size: 1.3rem;
  }
  
  .card-progress {
    display: none;
  }
  
  .actions-row {
    flex-direction: column;
  }
  
  .action-btn {
    min-width: 100%;
  }
  
  .column-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .preset-btn {
    margin-left: 0;
    width: 100%;
    justify-content: center;
  }
  
  .header-left {
    width: 100%;
  }
  
  .icon-container {
    width: 40px;
    height: 40px;
  }
  
  .check-icon {
    width: 28px;
    height: 28px;
  }
}

@media (max-width: 480px) {
  .ranking-card {
    padding: 14px;
  }
  
  .card-title {
    font-size: 1.1rem;
  }
  
  .apple-textarea {
    padding: 12px;
    font-size: 0.9rem;
  }
  
  .column {
    padding: 14px;
    border-radius: 14px;
  }
  
  .apple-input {
    padding: 10px 12px;
  }
  
  .score-pill {
    padding: 8px 14px;
  }
  
  .pill-value {
    font-size: 1rem;
  }
}

/* ========== Force Light Mode ========== */
/* Dark mode disabled - always use light theme */
</style>
