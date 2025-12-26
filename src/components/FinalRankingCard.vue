<template>
  <div class="ranking-card synonyms-apple-card synonyms-shadow-apple apple-card-animate">
    <div class="ranking-header">
      <div class="left">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#007AFF" stroke-width="2" />
          <path d="M8 12 L11 15 L16 9" stroke="#34C759" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <h5>Final Ranking</h5>
      </div>
      <div class="score-pill" v-if="result">
        <span class="label">Total</span>
        <span class="value">{{ result.total.toFixed(2) }}</span>
      </div>
      <div class="score-pill" v-if="result && typeof result.textFactor === 'number'">
        <span class="label">Text ×</span>
        <span class="value">{{ Number(result.textFactor).toFixed(2) }}</span>
      </div>
    </div>

    <div class="ranking-body">
      <div v-if="showSampleText" class="section-label">ข้อความทดสอบ (ไม่บันทึก ใช้ประกอบการคิดคะแนน)</div>
      <textarea v-if="showSampleText" class="sample-text" rows="2" placeholder="พิมพ์ข้อความ เช่น หอใน อยากได้หอพัก" v-model="sampleText"></textarea>

      <div class="two-column" :class="{ 'single-column': !showScoreInputs }">
        <div v-if="showScoreInputs">
          <div class="section-label">คะแนนที่ได้จากการจับคู่ (0-1 ต่อเคส)</div>
          <div class="inputs-grid">
            <div class="input-item">
              <label>Core Score</label>
              <input type="number" step="0.01" min="0" max="1" v-model.number="scores.core" />
            </div>
            <div class="input-item">
              <label>Synonym Score</label>
              <input type="number" step="0.01" min="0" max="1" v-model.number="scores.synonym_support" />
            </div>
            <div class="input-item">
              <label>Domain Score</label>
              <input type="number" step="0.01" min="0" max="1" v-model.number="scores.domain_support" />
            </div>
            <div class="input-item">
              <label>Application Score</label>
              <input type="number" step="0.01" min="0" max="1" v-model.number="scores.application_support" />
            </div>
          </div>
          <div class="helper-text">ใช้ปรับคะแนนรายคำ เช่น คำพ้องเหมือนมากให้ 0.95, คำสแลงให้ 0.60</div>
        </div>

        <div>
          <div class="d-flex justify-content-between align-items-center">
            <div class="section-label">ค่าน้ำหนักรวมสูตร (ปรับแล้วมีผลทั้งระบบ)</div>
            <button class="btn-preset" @click="loadDefaults" title="โหลดค่ามาตรฐาน">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="margin-right:4px">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              ค่ามาตรฐาน
            </button>
          </div>
          <div class="inputs-grid">
            <div class="input-item">
              <label>Core Weight</label>
              <input type="number" step="0.01" min="0" max="2" v-model.number="weights.core" />
            </div>
            <div class="input-item">
              <label>Synonym Weight</label>
              <input type="number" step="0.01" min="0" max="2" v-model.number="weights.synonym_support" />
            </div>
            <div class="input-item">
              <label>Domain Weight</label>
              <input type="number" step="0.01" min="0" max="2" v-model.number="weights.domain_support" />
            </div>
            <div class="input-item">
              <label>Application Weight</label>
              <input type="number" step="0.01" min="0" max="2" v-model.number="weights.application_support" />
            </div>
          </div>
          <div class="helper-text">ค่านี้คือ global weight ใช้กับทุกคำถาม/คำตอบ (บันทึกลงระบบได้)</div>
        </div>
      </div>

      <div class="actions">
        <button v-if="showCalculate" class="ranking-btn" @click="calculate">คำนวณ Final Ranking</button>
        <button v-if="showSave" class="ranking-btn" style="margin-left:12px;background:linear-gradient(135deg,#34c759,#0bb34a)" @click="saveWeights">บันทึกค่า</button>
      </div>

      <transition name="fade">
        <div v-if="result" class="breakdown-grid" :class="{ 'single-row': !showScoreInputs }">
          <div class="breakdown-item">
            <span class="label">Core {{ scores.core.toFixed(2) }} × {{ (result.weights?.core ?? 1).toFixed(2) }}</span>
            <span class="value">{{ result.breakdown.core.toFixed(2) }}</span>
          </div>
          <div class="breakdown-item">
            <span class="label">Synonym {{ scores.synonym_support.toFixed(2) }} × {{ (result.weights?.synonym_support ?? 0.95).toFixed(2) }}</span>
            <span class="value">{{ result.breakdown.synonym_support.toFixed(2) }}</span>
          </div>
          <div class="breakdown-item">
            <span class="label">Domain {{ scores.domain_support.toFixed(2) }} × {{ (result.weights?.domain_support ?? 0.90).toFixed(2) }}</span>
            <span class="value">{{ result.breakdown.domain_support.toFixed(2) }}</span>
          </div>
          <div class="breakdown-item">
            <span class="label">Application {{ scores.application_support.toFixed(2) }} × {{ (result.weights?.application_support ?? 0.20).toFixed(2) }}</span>
            <span class="value">{{ result.breakdown.application_support.toFixed(2) }}</span>
          </div>
        </div>
      </transition>

      <div v-if="result?.notes && result.notes.length" class="helper-text" style="margin-top:8px;">
        <strong>Notes:</strong>
        <span v-for="(n,i) in result.notes" :key="i">{{ i>0 ? ' • ' : '' }}{{ n }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, inject } from 'vue';
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

// The form on this page edits the weighting multipliers (core, synonym_support, domain_support, application_support).
// To compute the breakdown (weight * score) we call the ranking API with a sample score vector of 1.0 for each component
// and pass the user-provided weights as the `weights` argument. This ensures the breakdown reflects the multipliers.
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

// Initialize scores from parent if provided
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

// Auto-calc when weights change if calculate button is hidden (manage view wants live preview)
watch(() => ({ ...weights.value, ...scores.value }), () => {
  autoCalculateIfNeeded();
}, { deep: true });

// Watch sampleText changes to auto-calculate
watch(sampleText, () => {
  if (sampleText.value.trim()) {
    autoCalculateIfNeeded();
  }
});

const result = ref(null);

async function calculate() {
  result.value = await calculateFinalRanking(scores.value, weights.value, sampleText.value || '');
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

onMounted(async () => {
  await reloadWeights();
});

// Expose methods to parent
defineExpose({ reloadWeights, resetToDefaults });

async function saveWeights() {
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
      // Show more detailed message when server returns error info
      const msg = res && res.message ? res.message : (res && res.weights ? 'Saved (no message)' : 'Unknown error');
      showError('ไม่สามารถบันทึกได้: ' + msg);
    }
  } catch (e) {
    console.error('Save weights error', e);
    // Try to read server response message for clearer feedback
    const serverMsg = e?.response?.data?.message || e?.message || 'เกิดข้อผิดพลาดขณะบันทึกค่าน้ำหนัก';
    const status = e?.response?.status ? ' (status ' + e.response.status + ')' : '';
    showError(serverMsg + status);
  }
}
</script>

<style scoped>
.ranking-card {
  padding: 16px;
}
.apple-card-animate {
  animation: apple-pop-in 420ms cubic-bezier(0.22, 0.61, 0.36, 1);
  transform-origin: center;
}
@keyframes apple-pop-in {
  0% { opacity: 0; transform: translateY(12px) scale(0.97); }
  60% { opacity: 1; transform: translateY(0) scale(1.01); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.ranking-header .left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ranking-header h5 {
  margin: 0;
  font-weight: 700;
}
.score-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1565c0;
  border-radius: 20px;
  padding: 6px 12px;
  font-weight: 700;
}
.ranking-body .inputs-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.two-column {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}
.two-column.single-column {
  grid-template-columns: 1fr;
}
.breakdown-grid.single-row {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
.section-label {
  font-weight: 700;
  margin: 8px 0 6px;
}
.helper-text {
  font-size: 0.8rem;
  color: #7a7a80;
  margin-top: 6px;
}
.sample-text {
  width: 100%;
  border: 1px solid #e5e5ea;
  border-radius: 10px;
  padding: 10px;
  resize: vertical;
  min-height: 60px;
}
.btn-preset {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: linear-gradient(135deg, #5856D6, #4F4BC2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(88, 86, 214, 0.25);
}
.btn-preset:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(88, 86, 214, 0.35);
}
.btn-preset:active {
  transform: translateY(0);
}
.input-item label {
  font-size: 0.85rem;
  color: #86868b;
}
.input-item input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #e5e5ea;
  border-radius: 10px;
  background: #ffffff;
}
.actions {
  margin-top: 12px;
}
.ranking-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, #ff9500 0%, #ff6b00 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.ranking-btn:hover {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 6px 18px rgba(255, 149, 0, 0.35);
}
.ranking-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 149, 0, 0.35);
}
.input-item input:focus {
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.15);
}
.breakdown-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}
.breakdown-item {
  background: #f5f7fa;
  border-radius: 12px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.breakdown-item .label {
  color: #86868b;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
