<template>
  <div class="dashboard-wrapper">
    <!-- Clean white background -->
    <div class="ambient-background"></div>

    <!-- Main Content -->
    <div class="container-fluid pt-4 px-4 pb-5 content-layer">
      
      <!-- Header Section -->
      <div class="d-flex align-items-end justify-content-between mb-5 header-animate">
        <div class="d-flex align-items-center gap-4">
          <!-- Animated Logo Icon -->
          <div class="hero-icon-container">
            <svg viewBox="0 0 24 24" class="hero-svg" fill="none" stroke="currentColor" stroke-width="2">
              <path class="path-draw" d="M21 21l-4.35-4.35" stroke-linecap="round"/>
              <circle class="circle-pulse" cx="11" cy="11" r="8"/>
              <path class="sparkle-1" d="M21 5l-2 2" stroke-linecap="round"/>
              <path class="sparkle-2" d="M5 21l2-2" stroke-linecap="round"/>
            </svg>
            <div class="glow-effect"></div>
          </div>
          <div>
            <h1 class="display-title">Keywords</h1>
            <p class="subtitle">Real-time search intent & Q&A analysis</p>
          </div>
        </div>
        
        <!-- Glass Status Capsule -->
        <div class="status-capsule glass-panel" :class="{ 'is-live': wsConnected }">
          <div class="pulse-ring"></div>
          <span class="status-text">{{ wsConnected ? 'Live Sync' : 'Connecting...' }}</span>
        </div>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="keywordsLoading" class="loader-container fade-in">
        <div class="spinner-apple">
          <div class="bar" v-for="i in 12" :key="i" :style="{ animationDelay: `-${1.2 - (i * 0.1)}s`, transform: `rotate(${i * 30}deg) translate(0, -142%)` }"></div>
        </div>
        <p class="loading-text">Syncing Data...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="keywordsError" class="error-card glass-panel mx-auto fade-in">
        <div class="error-icon">
          <i class="bi bi-exclamation-triangle-fill"></i>
        </div>
        <h3>Unable to Load</h3>
        <p>{{ keywordsError }}</p>
      </div>

      <div v-else class="content-animate">
        
        <!-- Modern Stats Grid -->
        <div class="stats-grid mb-5">
          <!-- Total Keywords -->
          <div class="stat-card glass-panel hover-lift">
            <div class="stat-icon blue-glow">
              <i class="bi bi-grid-fill"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">Total Index</span>
              <span class="stat-number">{{ totalEntries }}</span>
            </div>
            <div class="stat-chart-mini">
              <svg viewBox="0 0 100 20" class="wave-svg">
                <path d="M0 10 Q 25 20, 50 10 T 100 10" fill="none" stroke="rgba(0,113,227,0.3)" stroke-width="2"/>
              </svg>
            </div>
          </div>

          <!-- Top Trending -->
          <div class="stat-card glass-panel hover-lift">
            <div class="stat-icon orange-glow">
              <i class="bi bi-lightning-charge-fill"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">Trending Now</span>
              <span class="stat-number text-truncate" :title="topKeyword">{{ topKeyword }}</span>
            </div>
          </div>

          <!-- Interaction Rate -->
          <div class="stat-card glass-panel hover-lift">
            <div class="stat-icon purple-glow">
              <i class="bi bi-chat-quote-fill"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">Q&A Engagement</span>
              <span class="stat-number">98.2%</span>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="row mb-5 g-4">
          <div class="col-12 col-lg-6">
            <div class="chart-container glass-panel h-100">
              <div class="panel-header">
                <h5>Distribution</h5>
              </div>
              <div class="chart-wrapper">
                <PieChart :chart-data="keywordsPieChartData" :chart-options="chartOptions" style="height: 240px;" />
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-6">
            <div class="chart-container glass-panel h-100">
              <div class="panel-header">
                <h5>Frequency Volume</h5>
              </div>
              <div class="chart-wrapper">
                <BarChart :chart-data="keywordsBarChartData" :chart-options="barChartOptions" style="height: 240px;" />
              </div>
            </div>
          </div>
        </div>

        <!-- Master-Detail Table Section -->
        <div class="glass-panel main-table-panel">
          <!-- Toolbar -->
          <div class="panel-toolbar p-4 d-flex justify-content-between align-items-center">
            <div class="toolbar-left">
              <h4 class="m-0">Keyword Insights</h4>
            </div>
            
            <div class="search-capsule">
              <i class="bi bi-search"></i>
              <input
                type="text"
                placeholder="Search keywords..."
                v-model="localSearch"
              />
              <button v-if="localSearch" @click="localSearch = ''" class="clear-btn">
                <i class="bi bi-x-circle-fill"></i>
              </button>
            </div>
          </div>

          <!-- List Header -->
          <div class="custom-list-container">
            <div class="list-header">
              <div class="col-id">ID</div>
              <div class="col-kw">KEYWORD</div>
              <div class="col-context">CONTEXT</div>
              <div class="col-action"></div>
            </div>

            <div class="list-body">
              <div 
                v-for="kw in paginatedKeywords" 
                :key="kw.KeywordID" 
                class="list-row-wrapper"
              >
                <!-- Main Row -->
                <div 
                  class="list-row" 
                  :class="{ 'is-expanded': expandedId === kw.KeywordID }"
                  @click="onRowClick(kw)"
                >
                  <div class="col-id"><span class="id-badge">#{{ kw.KeywordID }}</span></div>
                  <div class="col-kw">
                    <span class="keyword-text">{{ kw.KeywordText }}</span>
                  </div>
                  <div class="col-context">
                    <span class="badge-soft">
                      {{ matchesCountText(kw) }}
                    </span>
                  </div>
                  <div class="col-action">
                    <div class="chevron-circle" :class="{ 'rotated': expandedId === kw.KeywordID }">
                      <i class="bi bi-chevron-down"></i>
                    </div>
                  </div>
                </div>

                <!-- EXPANDED VIEW: Match List (All Related Q&A from DB) -->
                <transition name="expand-fade">
                  <div v-if="expandedId === kw.KeywordID" class="ai-expand-panel">
                    <!-- Clean White Background -->
                    <div class="ai-ambient-layer-white"></div>

                    <!-- Loading State inside Expansion -->
                    <div v-if="insightsFor(kw)?.loading" class="text-center py-5">
                      <div class="spinner-border text-primary mb-2" role="status"></div>
                      <div class="text-muted small">กำลังโหลดข้อมูลคำถาม-คำตอบ...</div>
                    </div>

                    <!-- Scrollable Container for matches -->
                    <div v-else class="matches-container">
                      
                      <!-- Loop through all matched Q&A pairs retrieved from DB -->
                      <div v-if="getAllMatches(kw).length > 0">
                        <div 
                          v-for="(match, mIndex) in getAllMatches(kw)" 
                          :key="match.QuestionsAnswersID || mIndex" 
                          class="ai-content-wrapper mb-4 border-bottom pb-4"
                        >
                          <!-- LEFT: User Query Card (QuestionTitle) -->
                          <div class="ai-card user-card slide-in-left">
                            <div class="card-header-row">
                              <div class="icon-bubble user-bubble-clean">
                                <i class="bi bi-person-fill"></i>
                              </div>
                              <span class="card-label">คำถาม (QuestionTitle)</span>
                            </div>
                            <div class="card-body-text">
                              <!-- DB Column: QuestionTitle -->
                              {{ match.QuestionTitle || '-' }}
                            </div>
                          </div>

                          <!-- CENTER: Flow Animation -->
                          <div class="ai-flow-connector">
                            <svg class="flow-svg" viewBox="0 0 200 60" preserveAspectRatio="none">
                              <path class="path-track" d="M0,30 C60,30 80,30 100,30 C120,30 140,30 200,30" />
                              <circle class="energy-dot" r="4" fill="#1d1d1f">
                                <animateMotion 
                                  dur="2s" 
                                  repeatCount="indefinite" 
                                  path="M0,30 C60,30 80,30 100,30 C120,30 140,30 200,30"
                                  keyPoints="0;1"
                                  keyTimes="0;1"
                                  calcMode="spline"
                                  keySplines="0.4 0 0.2 1"
                                />
                              </circle>
                            </svg>
                            <div class="core-wrapper">
                              <div class="ai-core-pulse-clean"></div>
                              <div class="ai-core-ring-clean"></div>
                            </div>
                          </div>

                          <!-- RIGHT: AI Answer Card (QuestionText) -->
                          <div class="ai-card system-card slide-in-right">
                            <div class="card-header-row">
                              <div class="icon-bubble ai-bubble-clean">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="#1d1d1f">
                                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/>
                                </svg>
                              </div>
                              <span class="card-label">คำตอบ (QuestionText)</span>
                            </div>
                            <div class="card-body-text">
                              <!-- DB Column: QuestionText or Answer -->
                              {{ match.QuestionText || '-' }}
                            </div>
                            <div class="ai-tags">
                              <span class="ai-pill">QA ID: {{ match.QuestionsAnswersID }}</span>
                              <span class="ai-pill" v-if="match.CategoriesID">Cat ID: {{ match.CategoriesID }}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Empty State if no matches found -->
                      <div v-else class="text-center py-5 text-secondary">
                        <i class="bi bi-inbox-fill fs-3 mb-2 d-block"></i>
                        <span>ไม่พบข้อมูลคำถาม-คำตอบที่เชื่อมโยงกับ Keyword นี้ในฐานข้อมูล</span>
                      </div>

                    </div>
                  </div>
                </transition>
              </div>

              <!-- Empty Keyword Search State -->
              <div v-if="filteredKeywords.length === 0" class="empty-placeholder">
                <div class="floating-magnifier">
                  <i class="bi bi-search"></i>
                </div>
                <p>No keywords found</p>
              </div>
            </div>
          </div>

          <!-- Footer / Pagination -->
          <div class="panel-footer p-3">
             <div class="pagination-ios">
               <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">
                 <i class="bi bi-chevron-left"></i>
               </button>
               <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
               <button class="page-btn" :disabled="currentPage === totalPages" @click="nextPage">
                 <i class="bi bi-chevron-right"></i>
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, getCurrentInstance } from 'vue';
import { PieChart, BarChart } from 'vue-chart-3';
import { createWebSocketConnection, WS_ENDPOINTS } from '@/config/websocket';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const props = defineProps({
  keywords: { type: Array, default: () => [] },
  keywordsLoading: { type: Boolean, default: false },
  keywordsError: { type: [String, null], default: null },
  keywordsPieChartData: Object,
  keywordsBarChartData: Object,
  chartOptions: Object,
  barChartOptions: Object,
  searchQueryKeywords: { type: String, default: '' },
});

const emit = defineEmits(['update:searchQueryKeywords', 'refresh']);
const wsConnected = ref(false);
const expandedId = ref(null); 
const { appContext } = getCurrentInstance();
const $axios = appContext.config.globalProperties.$axios;
let ws = null;

const toggleExpand = (id) => {
  expandedId.value = expandedId.value === id ? null : id;
};

// Helper to extract matches based on Database Relationships
// Robust check for different property names (QuestionText vs Answer)
const getMatches = (kw) => {
  // Option 1: Nested object named 'Matches' (Recommended format from Backend)
  if (kw.Matches && Array.isArray(kw.Matches) && kw.Matches.length > 0) {
    return kw.Matches.map(m => ({
      ...m,
      QuestionText: m.QuestionText || m.Answer // Normalize
    }));
  }
  // Option 2: Nested object named 'RelatedQuestions' or 'Questions'
  if (kw.Questions && Array.isArray(kw.Questions) && kw.Questions.length > 0) {
    return kw.Questions.map(m => ({
      ...m,
      QuestionText: m.QuestionText || m.Answer // Normalize
    }));
  }
  
  // Option 3: Fallback for single Flat Object (if Backend returns one row per keyword join)
  // Mapping SQL Columns: QuestionTitle, QuestionText (or Answer)
  if (kw.QuestionTitle || kw.QuestionText || kw.Answer) {
     return [{
       QuestionsAnswersID: kw.QuestionsAnswersID,
       QuestionTitle: kw.QuestionTitle || kw.Question,
       QuestionText: kw.QuestionText || kw.Answer,
       CategoriesID: kw.CategoriesID
     }];
  }
  
  return [];
};

// Per-keyword insights cache (populated from /keywords/insights)
const insightsCache = ref({});

const insightsFor = (kw) => insightsCache.value[kw.KeywordID] || null;

const fetchKeywordInsights = async (kw) => {
  if (!kw || !kw.KeywordText) return;
  const id = kw.KeywordID;
  // prevent duplicate in-flight requests
  if (insightsCache.value[id] && insightsCache.value[id].loading) return;
  
  insightsCache.value = { ...insightsCache.value, [id]: { loading: true, error: null, data: null } };
  
  try {
    const resp = await $axios.get('/keywords/insights', { params: { keyword: kw.KeywordText } });
    const data = resp.data || null;
    insightsCache.value = { ...insightsCache.value, [id]: { loading: false, error: null, data } };
  } catch (err) {
    console.error("Failed to fetch insights", err);
    insightsCache.value = { ...insightsCache.value, [id]: { loading: false, error: err.message || 'Failed to fetch insights', data: null } };
  }
};

const onRowClick = (kw) => {
  const newId = expandedId.value === kw.KeywordID ? null : kw.KeywordID;
  expandedId.value = newId;
  
  // Fetch if we don't have data yet
  if (newId && !insightsCache.value[kw.KeywordID]) {
    fetchKeywordInsights(kw);
  }
};

// Combine insights relatedQAs with local fallback (getMatches)
const getAllMatches = (kw) => {
  const ins = insightsCache.value[kw.KeywordID];
  
  // If we have API data, use it
  if (ins && ins.data && Array.isArray(ins.data.relatedQAs) && ins.data.relatedQAs.length > 0) {
    return ins.data.relatedQAs.map(r => ({
      QuestionsAnswersID: r.QuestionsAnswersID,
      QuestionTitle: r.QuestionTitle,
      QuestionText: r.QuestionText || r.Answer || null, // Robust check
      CategoriesID: r.CategoriesID || null
    }));
  }
  
  // Otherwise fall back to local props data
  return getMatches(kw);
};

const matchesCountText = (kw) => {
  const ins = insightsCache.value[kw.KeywordID];
  if (ins && ins.loading) return 'Loading...';
  
  // Prefer precomputed backend count if available
  if (kw && (kw.MatchesCount != null)) {
    return Number(kw.MatchesCount) > 0 ? `${kw.MatchesCount} Matches` : 'No Data';
  }
  
  // If loaded from API
  if (ins && ins.data && Array.isArray(ins.data.relatedQAs)) {
    const n = ins.data.relatedQAs.length;
    return n > 0 ? `${n} Matches` : 'No Data';
  }
  
  // Fallback local check
  const gm = getMatches(kw);
  return gm.length > 0 ? `${gm.length} Matches` : 'No Data';
};

onMounted(() => {
  ws = createWebSocketConnection(WS_ENDPOINTS.KEYWORDS, {
    axios: $axios,
    onMessage: (message) => {
      if (message.type === 'KEYWORD_UPDATE') emit('refresh');
    },
    onOpen: () => wsConnected.value = true,
    onClose: () => wsConnected.value = false,
  });
});

onUnmounted(() => {
  if (ws) ws.disconnect();
});

const localSearch = ref(props.searchQueryKeywords || '');
watch(() => props.searchQueryKeywords, v => { if (v !== localSearch.value) localSearch.value = v; });
watch(localSearch, v => emit('update:searchQueryKeywords', v));

const allKeywords = computed(() => Array.isArray(props.keywords) ? props.keywords : []);
const topKeyword = computed(() => {
  if (props.keywordsBarChartData?.labels?.length > 0) {
    const data = props.keywordsBarChartData.datasets?.[0]?.data || [];
    if (data.length === 0) return 'None';
    const maxIndex = data.indexOf(Math.max(...data));
    return props.keywordsBarChartData.labels[maxIndex] || 'None';
  }
  return 'None';
});

const filteredKeywords = computed(() => {
  const q = (localSearch.value || '').toString().trim().toLowerCase();
  if (!q) return allKeywords.value;
  return allKeywords.value.filter(k =>
    (k.KeywordID != null && String(k.KeywordID).includes(q)) ||
    (k.KeywordText && String(k.KeywordText).toLowerCase().includes(q))
  );
});

const currentPage = ref(1);
const itemsPerPage = ref(8);
watch(localSearch, () => { currentPage.value = 1; });

const totalEntries = computed(() => filteredKeywords.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(totalEntries.value / itemsPerPage.value)));

const paginatedKeywords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredKeywords.value.slice(start, start + itemsPerPage.value);
});

function prevPage() { if (currentPage.value > 1) currentPage.value--; }
function nextPage() { if (currentPage.value < totalPages.value) currentPage.value++; }

</script>

<style scoped>
/* -----------------------------------------
  FUTURE APPLE DESIGN SYSTEM
  -----------------------------------------
*/

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.8);
  --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
  
  --text-primary: #1d1d1f;
  --text-secondary: #86868b;
  
  --accent-blue: #0071e3;
  --accent-blue-gradient: linear-gradient(135deg, #0071e3, #4facfe);
  --ai-gradient: linear-gradient(135deg, #2E86DE, #A29BFE, #FF7675);
}

.dashboard-wrapper {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #F5F5F7; 
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  color: var(--text-primary);
}

/* ---------------- BACKGROUND AMBIENCE ---------------- */
/* Clean white background */
.ambient-background {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background-color: #F5F5F7;
  z-index: 0; pointer-events: none;
}

.content-layer { position: relative; z-index: 1; }

/* ---------------- HERO HEADER ---------------- */
.header-animate { animation: fadeInDown 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); }

.display-title {
  font-weight: 700; font-size: 2.5rem; letter-spacing: -0.03em;
  background: linear-gradient(90deg, #1d1d1f, #5e5e60);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  margin: 0;
}
.subtitle { color: var(--text-secondary); font-size: 1.1rem; font-weight: 500; }

.hero-icon-container { width: 64px; height: 64px; position: relative; }
.hero-svg { width: 100%; height: 100%; color: var(--accent-blue); filter: drop-shadow(0 4px 6px rgba(0, 113, 227, 0.2)); }
.circle-pulse { transform-origin: center; animation: pulse-scale 3s infinite ease-in-out; }
.path-draw { stroke-dasharray: 20; stroke-dashoffset: 20; animation: draw 2s ease-out forwards; }
@keyframes draw { to { stroke-dashoffset: 0; } }

/* ---------------- GLASS PANELS ---------------- */
.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  box-shadow: 
    0 4px 20px -2px rgba(0, 0, 0, 0.02), 
    0 10px 25px -5px rgba(0, 0, 0, 0.03),
    inset 0 0 0 1px rgba(255,255,255,0.6);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.hover-lift:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 20px 40px rgba(0,0,0,0.06);
  background: rgba(255, 255, 255, 0.9);
}

/* ---------------- STATS & CHARTS ---------------- */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
.stat-card { padding: 24px; display: flex; align-items: center; gap: 20px; position: relative; overflow: hidden; }
.stat-icon {
  width: 56px; height: 56px; border-radius: 18px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; color: white;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}
.blue-glow { background: var(--accent-blue-gradient); }
.orange-glow { background: linear-gradient(135deg, #FF9500, #FFCC00); }
.purple-glow { background: linear-gradient(135deg, #AF52DE, #FF2D55); }
.stat-info { display: flex; flex-direction: column; }
.stat-label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
.stat-number { font-size: 1.8rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; }
.stat-chart-mini { position: absolute; right: 0; bottom: 0; width: 120px; height: 50px; opacity: 0.6; }

/* ---------------- LIST TABLE ---------------- */
.main-table-panel { padding-bottom: 20px; }
.panel-toolbar { border-bottom: 1px solid rgba(0,0,0,0.04); }

.search-capsule {
  position: relative; background: rgba(118, 118, 128, 0.08);
  border-radius: 14px; display: flex; align-items: center;
  padding: 10px 14px; width: 320px; transition: all 0.3s;
}
.search-capsule:focus-within { background: white; box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15); }
.search-capsule input { border: none; background: transparent; flex: 1; padding-left: 10px; font-size: 0.95rem; outline: none; }
.search-capsule i { color: var(--text-secondary); }

.list-header {
  display: grid; grid-template-columns: 80px 2fr 1.5fr 60px;
  padding: 16px 24px; font-size: 0.75rem; font-weight: 600;
  color: var(--text-secondary); letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(0,0,0,0.04);
}
.list-row {
  display: grid; grid-template-columns: 80px 2fr 1.5fr 60px;
  padding: 20px 24px; align-items: center; cursor: pointer;
  transition: background 0.25s ease; border-bottom: 1px solid rgba(0,0,0,0.03);
  position: relative;
}
.list-row:hover { background: rgba(0, 113, 227, 0.02); }
.list-row.is-expanded { background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.03); z-index: 2; border-bottom: none; }

.id-badge { font-family: 'SF Mono', monospace; background: rgba(0,0,0,0.04); padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; color: #555; }
.keyword-text { font-weight: 600; font-size: 1.05rem; color: #1d1d1f; }
.badge-soft { background: rgba(52, 199, 89, 0.08); color: #34C759; padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }

.chevron-circle {
  width: 32px; height: 32px; background: #F2F2F7; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s;
  color: var(--text-secondary);
}
.chevron-circle.rotated { transform: rotate(180deg); background: var(--accent-blue); color: white; }

/* ----------------------------------------------------
   NEW APPLE INTELLIGENCE EXPANDED VIEW (CLEAN WHITE)
   ---------------------------------------------------- */
.ai-expand-panel {
  position: relative;
  background: #fff;
  overflow: hidden;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  min-height: 250px;
}

/* Matches Container */
.matches-container {
  padding: 40px;
  max-width: 1100px; margin: 0 auto;
}

/* White Ambient Layer */
.ai-ambient-layer-white {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: white;
  pointer-events: none; z-index: 0;
}

/* 2. Content Layout */
.ai-content-wrapper {
  position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: center;
  gap: 0;
}

/* Clean Cards */
.ai-card {
  flex: 1;
  background: #ffffff;
  border: 1px solid #e5e5ea;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  max-width: 380px;
  transition: transform 0.4s ease;
}
.ai-card:hover { 
  transform: translateY(-4px); 
  box-shadow: 0 10px 30px rgba(0,0,0,0.06); 
}

.card-header-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }

/* Clean Bubbles (Gray/Monochrome) */
.icon-bubble {
  width: 40px; height: 40px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem;
}
.user-bubble-clean { background: #F2F2F7; color: #1d1d1f; }
.ai-bubble-clean { background: #F2F2F7; color: #1d1d1f; }

.card-label {
  font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px;
  font-weight: 700; color: #86868b;
}

.card-body-text { font-size: 1.1rem; line-height: 1.6; color: #1d1d1f; font-weight: 450; }
.highlight-term { color: #1d1d1f; font-weight: 600; background: #F2F2F7; padding: 0 6px; border-radius: 4px;}
.action-text { text-decoration: underline; text-decoration-color: #d1d1d6; text-underline-offset: 4px; }

.ai-tags { margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap; }
.ai-pill {
  font-size: 0.75rem; background: #F2F2F7; padding: 6px 12px;
  border-radius: 20px; font-weight: 600; color: #1d1d1f;
  display: flex; align-items: center; gap: 6px; border: 1px solid #e5e5ea;
}

/* Connector & Animation (Monochrome) */
.ai-flow-connector {
  flex-shrink: 0; width: 140px; height: 80px;
  position: relative; display: flex; align-items: center; justify-content: center;
}

.flow-svg {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none; z-index: 1;
}
.path-track {
  fill: none; stroke: #e5e5ea; stroke-width: 2;
  stroke-dasharray: 6 6;
}
.energy-dot { fill: #86868b; }

.core-wrapper {
  position: relative; width: 48px; height: 48px; z-index: 2;
  display: flex; align-items: center; justify-content: center;
}
.ai-core-pulse-clean {
  width: 12px; height: 12px; background: #1d1d1f; border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.05);
  z-index: 2;
}
.ai-core-ring-clean {
  position: absolute; width: 100%; height: 100%; border-radius: 50%;
  border: 1px solid #d1d1d6;
  border-top-color: #1d1d1f; 
  animation: spin 2s linear infinite;
}
@keyframes spin { 100% { transform: rotate(360deg); } }

/* Slide Animations */
.slide-in-left { animation: slideLeft 0.5s ease-out forwards; opacity: 0; transform: translateX(-30px); }
.slide-in-right { animation: slideRight 0.5s ease-out forwards; opacity: 0; transform: translateX(30px); animation-delay: 0.2s; }

@keyframes slideLeft { to { opacity: 1; transform: translateX(0); } }
@keyframes slideRight { to { opacity: 1; transform: translateX(0); } }

.expand-fade-enter-active, .expand-fade-leave-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); max-height: 800px; opacity: 1; }
.expand-fade-enter-from, .expand-fade-leave-to { max-height: 0; opacity: 0; }


/* Status Capsule */
.status-capsule {
  padding: 8px 16px; display: flex; align-items: center; gap: 8px;
  font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);
}
.status-capsule.is-live { color: #34C759; background: rgba(52, 199, 89, 0.08); border-color: rgba(52, 199, 89, 0.2); }
.pulse-ring { width: 8px; height: 8px; background: currentColor; border-radius: 50%; }
.is-live .pulse-ring { box-shadow: 0 0 0 0 rgba(52, 199, 89, 0.6); animation: pulse-green 2s infinite; }

@keyframes pulse-green {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 199, 89, 0.6); }
  70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(52, 199, 89, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 199, 89, 0); }
}

/* Spinner */
.spinner-apple { position: relative; width: 40px; height: 40px; margin: 0 auto; }
.spinner-apple .bar { width: 10%; height: 28%; background: #8e8e93; position: absolute; left: 45%; top: 45%; border-radius: 50px; opacity: 0; animation: fade 1s linear infinite; }
@keyframes fade { from { opacity: 1; } to { opacity: 0.25; } }

/* Pagination iOS */
.pagination-ios { display: flex; justify-content: center; align-items: center; gap: 15px; }
.page-btn {
  border: none; background: white; width: 36px; height: 36px;
  border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  color: var(--accent-blue); transition: all 0.2s; display: flex; align-items: center; justify-content: center;
}
.page-btn:disabled { opacity: 0.5; box-shadow: none; cursor: not-allowed; }
.page-btn:hover:not(:disabled) { transform: scale(1.1); box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
.page-info { font-size: 0.9rem; font-weight: 500; color: var(--text-secondary); }

</style>