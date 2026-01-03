<template>
  <div class="dashboard-container">
    <!-- Mobile Sidebar Backdrop -->
    <div v-if="isMobileSidebarOpen" class="mobile-sidebar-backdrop" @click="toggleSidebar" aria-hidden="true"></div>
    <Sidebar :userType="userType" :userInfoObject="userInfoObject" />
    <main class="main-content">
      <!-- Mobile Sidebar Toggle -->
      <button v-if="isMobile" class="mobile-sidebar-toggle mobile-inline-toggle" @click.stop="toggleSidebar" :aria-label="isMobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'">
        <i class="bi bi-list"></i>
      </button>
      <div class="container-fluid">
        <div class="card synonyms-info-card synonyms-shadow-apple mb-3 apple-fade">
          <div class="card-body">
            <div class="fw-bold mb-2">ใช้อย่างไร</div>
            <ul class="mb-2">
              <li>พิมพ์ข้อความตัวอย่างเพื่ออ้างอิงบริบท (ไม่ส่งไปคำนวณอัตโนมัติ)</li>
              <li>กรอกคะแนนต่อเคส (Core/Synonym/Domain/Application) ตามความเหมือนของคำพ้อง</li>
              <li>ปรับน้ำหนักสูตรชั่วคราว แล้วกดคำนวณเพื่อดู Total และ Breakdown</li>
              <li>ปุ่มบันทึกถูกปิดในโหมดนี้ (ไม่กระทบระบบจริง)</li>
            </ul>
          </div>
        </div>

        <div class="synonyms-apple-card synonyms-shadow-apple p-3 apple-pop">
          <FinalRankingCard
            :show-score-inputs="true"
            :show-sample-text="true"
            :show-save="false"
            :initial-scores="initialScores"
          />
        </div>

        <!-- Negation Test Section -->
        <div class="card synonyms-shadow-apple mt-4 apple-fade" :style="{animationDelay: '0.1s'}">
          <div class="card-body">
            <div class="d-flex align-items-center mb-3">
              <div class="negation-icon me-3">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#FF3B30" stroke-width="2"/>
                  <path d="M15 9l-6 6M9 9l6 6" stroke="#FF3B30" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <div>
                <h5 class="mb-0 fw-bold">ทดสอบคำปฏิเสธ (Negative Keywords)</h5>
                <small class="text-muted">ทดสอบว่าระบบจะตรวจจับคำปฏิเสธได้หรือไม่</small>
              </div>
            </div>

            <div class="input-group mb-3">
              <input 
                type="text" 
                v-model="negationTestQuery" 
                class="form-control"
                placeholder="ลองพิมพ์ เช่น: ไม่เอาหอใน, ยกเว้นหอพัก, อย่าแนะนำทุน"
                @keyup.enter="testNegation"
              />
              <button class="btn btn-danger" @click="testNegation" :disabled="isTestingNegation || !negationTestQuery.trim()">
                <i v-if="isTestingNegation" class="bi bi-hourglass-split me-1"></i>
                <i v-else class="bi bi-search me-1"></i>
                {{ isTestingNegation ? 'กำลังทดสอบ...' : 'ทดสอบ' }}
              </button>
            </div>

            <!-- Test Results -->
            <transition name="fade">
              <div v-if="negationResult" class="negation-results mt-3">
                <!-- Token Analysis -->
                <div class="token-analysis mb-3 p-3 bg-light rounded">
                  <div class="fw-bold mb-2"><i class="bi bi-diagram-3 me-2"></i>Token Analysis</div>
                  <div class="d-flex flex-wrap gap-2">
                    <span 
                      v-for="(token, idx) in negationResult.tokens" 
                      :key="idx"
                      class="token-badge"
                      :class="{ 
                        'token-negative': token.isNegative, 
                        'token-negated': token.isNegated,
                        'token-keyword': token.isKeyword
                      }"
                      :title="token.isNegative ? `Modifier: ${token.modifier}` : (token.isNegated ? 'This keyword was negated' : '')"
                    >
                      {{ token.text }}
                      <span v-if="token.isNegative" class="badge bg-danger ms-1">{{ token.modifier }}</span>
                    </span>
                  </div>
                </div>

                <!-- Negation Info -->
                <div v-if="negationResult.hasNegation" class="negation-info p-3 border rounded border-danger bg-danger bg-opacity-10">
                  <div class="fw-bold text-danger mb-2">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    พบคำปฏิเสธ!
                  </div>
                  <ul class="mb-0">
                    <li v-for="(neg, idx) in negationResult.negatedKeywords" :key="idx">
                      <strong class="text-danger">"{{ neg.negativeWord }}"</strong> 
                      ทำให้ <strong>"{{ neg.keyword }}"</strong> 
                      มีตัวคูณ <code class="bg-white px-2 py-1 rounded">{{ neg.modifier }}</code>
                    </li>
                  </ul>
                </div>

                <div v-else class="negation-info p-3 border rounded border-success bg-success bg-opacity-10">
                  <div class="fw-bold text-success">
                    <i class="bi bi-check-circle me-2"></i>
                    ไม่พบคำปฏิเสธในประโยคนี้
                  </div>
                </div>

                <!-- Chat Results Preview -->
                <div v-if="negationResult.alternatives && negationResult.alternatives.length > 0" class="mt-3">
                  <div class="fw-bold mb-2"><i class="bi bi-list-ol me-2"></i>ผลลัพธ์ที่ได้</div>
                  <div class="results-list">
                    <div 
                      v-for="(alt, idx) in negationResult.alternatives.slice(0, 3)" 
                      :key="alt.id"
                      class="result-item p-2 mb-2 border rounded"
                      :class="{ 'border-danger': alt.finalRanking?.negationPenalty }"
                    >
                      <div class="d-flex justify-content-between">
                        <strong>{{ idx + 1 }}. {{ alt.title }}</strong>
                        <span class="badge" :class="alt.finalRanking?.score > 0 ? 'bg-success' : 'bg-danger'">
                          Score: {{ (alt.finalRanking?.score || 0).toFixed(3) }}
                        </span>
                      </div>
                      <small class="text-muted">{{ alt.preview?.slice(0, 100) }}...</small>
                      <div v-if="alt.finalRanking?.negationPenalty" class="mt-1">
                        <span class="badge bg-danger">Negation Penalty: {{ alt.finalRanking.negationPenalty }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import FinalRankingCard from '@/components/FinalRankingCard.vue';
import { axiosInstance } from '@/plugins/axios';
import { useRouter } from 'vue-router';
import { isSidebarCollapsed, isMobileSidebarOpen } from '@/stores/sidebarState';

const router = useRouter();
const userInfoObject = ref({});
const userType = ref('');
const initialScores = ref({ core: 1.0, synonym_support: 0.95, domain_support: 0.90, application_support: 0.20 });

// Mobile sidebar
const isMobile = ref(window.innerWidth <= 768);
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

let resizeHandler = null;

// Negation test
const negationTestQuery = ref('');
const isTestingNegation = ref(false);
const negationResult = ref(null);

onMounted(() => {
  const token = localStorage.getItem('userToken');
  const type = localStorage.getItem('userType');
  const userInfoString = localStorage.getItem('userInfo');
  if (!token) {
    router.replace({ name: 'login' });
    return;
  }
  if (type) userType.value = type;
  if (userInfoString) {
    try { userInfoObject.value = JSON.parse(userInfoString); } catch (e) { console.error(e); }
  }
  
  // Mobile resize listener
  resizeHandler = () => {
    const newIsMobile = window.innerWidth <= 768;
    if (newIsMobile !== isMobile.value) {
      isMobile.value = newIsMobile;
      if (!newIsMobile && isMobileSidebarOpen.value) {
        isMobileSidebarOpen.value = false;
        document.body.classList.remove('sidebar-open', 'sidebar-mobile-expanded');
        isSidebarCollapsed.value = _savedSidebarCollapsed ?? isSidebarCollapsed.value;
        _savedSidebarCollapsed = null;
      }
    }
  };
  window.addEventListener('resize', resizeHandler);
});

onUnmounted(() => {
  if (resizeHandler) window.removeEventListener('resize', resizeHandler);
  isMobileSidebarOpen.value = false;
  document.body.classList.remove('sidebar-open', 'sidebar-mobile-expanded');
});

async function testNegation() {
  if (!negationTestQuery.value.trim()) return;
  
  isTestingNegation.value = true;
  negationResult.value = null;
  
  try {
    const response = await axiosInstance.post('/chat/respond', {
      message: negationTestQuery.value.trim()
    });
    
    const data = response.data;
    
    // Build token analysis from raw query
    const query = negationTestQuery.value.toLowerCase();
    
    // 🆕 Better tokenization: keep compound words together for Thai
    // Split by spaces first, then we'll mark inline negations
    const rawTokens = query.split(/\s+/).filter(Boolean);
    
    // Get negative words from the response
    const negativeWordsMap = {};
    if (data.negationInfo?.negativeWordsFound) {
      for (const neg of data.negationInfo.negativeWordsFound) {
        negativeWordsMap[neg.word] = neg.modifier;
        // Also mark the target keyword if present
        if (neg.targetKeyword) {
          negativeWordsMap[neg.targetKeyword] = neg.modifier;
        }
      }
    }
    
    // Get negated keywords
    const negatedKeywordsSet = new Set();
    const negatedKeywordsMap = {};
    if (data.negationInfo?.negatedKeywords) {
      for (const neg of data.negationInfo.negatedKeywords) {
        negatedKeywordsSet.add(neg.keyword);
        negatedKeywordsMap[neg.keyword] = neg.negativeWord;
      }
    }
    
    // Also check blockedKeywordsDisplay from response
    const blockedKeywords = data.blockedKeywordsDisplay || [];
    for (const kw of blockedKeywords) {
      negatedKeywordsSet.add(kw);
    }
    
    // Build token list with inline negation detection
    const tokens = [];
    for (const word of rawTokens) {
      // Check if this token contains an inline negation pattern
      const inlinePatterns = ['ไม่เอา', 'ไม่ต้อง', 'ไม่อยาก', 'ไม่ต้องการ', 'ไม่สนใจ', 'ไม่'];
      let foundInlineNegation = null;
      let targetWord = null;
      
      // Sort by length desc to match longer patterns first
      const sortedPatterns = inlinePatterns.sort((a, b) => b.length - a.length);
      for (const pattern of sortedPatterns) {
        if (word.includes(pattern)) {
          const patternIdx = word.indexOf(pattern);
          if (patternIdx >= 0) {
            foundInlineNegation = pattern;
            targetWord = word.slice(patternIdx + pattern.length);
            break;
          }
        }
      }
      
      if (foundInlineNegation && targetWord) {
        // Split into negation word and target
        tokens.push({
          text: foundInlineNegation,
          isNegative: true,
          modifier: -1.0,
          isKeyword: false,
          isNegated: false
        });
        if (targetWord) {
          tokens.push({
            text: targetWord,
            isNegative: false,
            modifier: null,
            isKeyword: negatedKeywordsSet.has(targetWord) || blockedKeywords.includes(targetWord),
            isNegated: negatedKeywordsSet.has(targetWord) || blockedKeywords.includes(targetWord)
          });
        }
      } else {
        // No inline negation, add as single token
        tokens.push({
          text: word,
          isNegative: negativeWordsMap.hasOwnProperty(word) || inlinePatterns.includes(word),
          modifier: negativeWordsMap[word] || (inlinePatterns.includes(word) ? -1.0 : null),
          isKeyword: negatedKeywordsSet.has(word) || blockedKeywords.includes(word) || data.alternatives?.some(alt => alt.keywords?.some(kw => kw.toLowerCase().includes(word) || word.includes(kw.toLowerCase()))),
          isNegated: negatedKeywordsSet.has(word) || blockedKeywords.includes(word)
        });
      }
    }
    
    // Determine if negation was found
    const hasNegation = data.negationInfo?.hasNegation || 
                        blockedKeywords.length > 0 || 
                        (data.blockedKeywords && data.blockedKeywords.length > 0);
    
    negationResult.value = {
      query: negationTestQuery.value,
      tokens,
      hasNegation: hasNegation,
      negatedKeywords: data.negationInfo?.negatedKeywords || blockedKeywords.map(kw => ({ keyword: kw, negativeWord: 'ไม่เอา', modifier: -1.0 })),
      negativeWordsFound: data.negationInfo?.negativeWordsFound || [],
      alternatives: data.alternatives || []
    };
  } catch (error) {
    console.error('Negation test error:', error);
    negationResult.value = {
      query: negationTestQuery.value,
      tokens: negationTestQuery.value.split(/\s+/).map(t => ({ text: t, isNegative: false, isKeyword: false, isNegated: false })),
      hasNegation: false,
      negatedKeywords: [],
      negativeWordsFound: [],
      alternatives: [],
      error: error.message
    };
  } finally {
    isTestingNegation.value = false;
  }
}
</script>

<style scoped>
@import '@/assets/dashboard-styles.css';
@import '@/assets/main.css';
@import '@/assets/manage-synonyms.css';

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

.apple-fade {
  animation: apple-fade-in 380ms ease;
}
.apple-pop {
  animation: apple-pop-in 420ms cubic-bezier(0.22, 0.61, 0.36, 1);
  transform-origin: center;
}
@keyframes apple-fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes apple-pop-in {
  0% { opacity: 0; transform: translateY(12px) scale(0.97); }
  60% { opacity: 1; transform: translateY(0) scale(1.01); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
.title-icon {
  display: inline-block;
  vertical-align: middle;
  margin-right: 12px;
  animation: icon-bounce 700ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
@keyframes icon-bounce {
  0% { opacity: 0; transform: scale(0.5) translateY(-20px); }
  60% { transform: scale(1.15) translateY(0); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
.title-icon .flask-icon {
  animation: flask-shake 1200ms ease-in-out 400ms;
}
@keyframes flask-shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-8deg); }
  75% { transform: rotate(8deg); }
}

/* Negation Test Styles */
.negation-icon {
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.token-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  background: #f0f0f0;
  border-radius: 20px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.token-badge.token-negative {
  background: linear-gradient(135deg, #FF3B30, #FF6B6B);
  color: white;
  font-weight: 600;
}

.token-badge.token-keyword {
  background: linear-gradient(135deg, #007AFF, #5AC8FA);
  color: white;
}

.token-badge.token-negated {
  background: linear-gradient(135deg, #FF9500, #FFCC00);
  color: #333;
  text-decoration: line-through;
}

.negation-results {
  animation: apple-fade-in 380ms ease;
}

.result-item {
  transition: all 0.2s ease;
}

.result-item:hover {
  background: #f8f9fa;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
