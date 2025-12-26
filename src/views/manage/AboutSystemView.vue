<template>
  <div class="about-system-container">
    <!-- Header Section -->
    <div class="header-section fade-in">
      <!-- Apple-style back button -->
      <button class="apple-back-button pop-in" @click="goBack" aria-label="Go back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="system-icon-wrapper pop-in">
        <svg class="system-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#007AFF;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#5856D6;stop-opacity:1" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#iconGradient)" class="pulse-circle"/>
          <path d="M 50 20 L 50 50 L 70 60" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" class="clock-hand"/>
          <circle cx="50" cy="50" r="3" fill="white"/>
        </svg>
      </div>
      <h1 class="page-title slide-in-down">เกี่ยวกับระบบแชทบอท</h1>
      <p class="page-subtitle slide-in-up">PCRU Chatbot System Information</p>
    </div>

    <!-- System Overview Cards -->
    <div class="cards-grid">
      <!-- What Can It Do Card -->
      <div class="info-card card-1 slide-in-left" :style="{animationDelay: '0.1s'}">
        <div class="card-icon-wrapper">
          <svg class="card-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2 class="card-title">ความสามารถของระบบ</h2>
        <ul class="feature-list">
          <li class="feature-item" v-for="(feature, index) in features" :key="index" :style="{animationDelay: `${0.2 + index * 0.05}s`}">
            <span class="feature-bullet">•</span>
            <span>{{ feature }}</span>
          </li>
        </ul>
      </div>

      <!-- AI Model Card -->
      <div class="info-card card-2 slide-in-right" :style="{animationDelay: '0.15s'}">
        <div class="card-icon-wrapper">
          <svg class="card-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2 class="card-title">โมเดล AI ที่ใช้</h2>
        <div class="model-info">
          <div class="model-item pop-in" :style="{animationDelay: '0.3s'}">
            <div class="model-label">Primary Model</div>
            <div class="model-value">Hybrid Keyword Matching</div>
            <div class="model-desc">การค้นหาแบบผสมผสานด้วยคำสำคัญ</div>
          </div>
          <div class="model-item pop-in" :style="{animationDelay: '0.35s'}">
            <div class="model-label">Ranking Algorithm</div>
            <div class="model-value">Final Ranking System</div>
            <div class="model-desc">คำนวณคะแนนจาก Core, Synonym, Domain, Application</div>
          </div>
          <div class="model-item pop-in" :style="{animationDelay: '0.4s'}">
            <div class="model-label">Fuzzy Matching</div>
            <div class="model-value">Levenshtein Distance</div>
            <div class="model-desc">ค้นหาคำที่สะกดผิด ด้วย similarity threshold 75-80%</div>
          </div>
          <div class="model-item pop-in" :style="{animationDelay: '0.45s'}">
            <div class="model-label">NLP Tokenizer</div>
            <div class="model-value">PyThaiNLP (Optional)</div>
            <div class="model-desc">แยกคำภาษาไทย สำหรับการวิเคราะห์ขั้นสูง</div>
          </div>
        </div>
      </div>

      <!-- Database Card -->
      <div class="info-card card-3 slide-in-left" :style="{animationDelay: '0.2s'}">
        <div class="card-icon-wrapper">
          <svg class="card-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2 class="card-title">ฐานข้อมูล</h2>
        <div class="database-info">
          <div class="db-item pop-in" :style="{animationDelay: '0.35s'}">
            <div class="db-label">ระบบจัดการฐานข้อมูล</div>
            <div class="db-value">MySQL</div>
          </div>
          <div class="db-item pop-in" :style="{animationDelay: '0.4s'}">
            <div class="db-label">ชื่อฐานข้อมูล</div>
            <div class="db-value">{{ databaseName }}</div>
          </div>
          <div class="db-item pop-in" :style="{animationDelay: '0.45s'}">
            <div class="db-label">ตารางหลัก</div>
            <div class="db-value-list">
              <span class="db-table">questions_answers</span>
              <span class="db-table">keywords</span>
              <span class="db-table">categories</span>
              <span class="db-table">organizations</span>
              <span class="db-table">feedbacks</span>
              <span class="db-table">keyword_synonyms</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Developers Card -->
      <div class="info-card card-4 slide-in-right" :style="{animationDelay: '0.25s'}">
        <div class="card-icon-wrapper">
          <svg class="card-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2 class="card-title">ทีมพัฒนา</h2>
        <div class="developers-list">
          <div class="developer-card pop-in" :style="{animationDelay: '0.4s'}">
            <div class="dev-avatar">
              <span class="dev-initial">K</span>
            </div>
            <div class="dev-info">
              <div class="dev-name">Kriangkrai Kongmueng</div>
              <div class="dev-name-th">เกรียงไกร คงเมือง</div>
              <div class="dev-role">Lead Developer</div>
            </div>
          </div>
          <div class="developer-card pop-in" :style="{animationDelay: '0.45s'}">
            <div class="dev-avatar">
              <span class="dev-initial">N</span>
            </div>
            <div class="dev-info">
              <div class="dev-name">Nichapa Noichan</div>
              <div class="dev-name-th">ณิชาภา น้อยจันทร์</div>
              <div class="dev-role">Co-Developer</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Technology Stack Card -->
      <div class="info-card card-5 slide-in-left" :style="{animationDelay: '0.3s'}">
        <div class="card-icon-wrapper">
          <svg class="card-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2 class="card-title">เทคโนโลยีที่ใช้</h2>
        <div class="tech-grid">
          <div class="tech-badge pop-in" v-for="(tech, index) in technologies" :key="index" :style="{animationDelay: `${0.4 + index * 0.03}s`}">
            {{ tech }}
          </div>
        </div>
      </div>

      <!-- System Stats Card -->
      <div class="info-card card-6 slide-in-right" :style="{animationDelay: '0.35s'}">
        <div class="card-icon-wrapper">
          <svg class="card-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2 class="card-title">สถิติระบบ</h2>
        <div class="stats-grid">
          <div class="stat-item pop-in" :style="{animationDelay: '0.45s'}">
            <div class="stat-value">{{ systemInfo.totalQuestions || '---' }}</div>
            <div class="stat-label">คำถามในระบบ</div>
          </div>
          <div class="stat-item pop-in" :style="{animationDelay: '0.5s'}">
            <div class="stat-value">{{ systemInfo.totalKeywords || '---' }}</div>
            <div class="stat-label">คำสำคัญ</div>
          </div>
          <div class="stat-item pop-in" :style="{animationDelay: '0.55s'}">
            <div class="stat-value">{{ systemInfo.totalCategories || '---' }}</div>
            <div class="stat-label">หมวดหมู่</div>
          </div>
          <div class="stat-item pop-in" :style="{animationDelay: '0.6s'}">
            <div class="stat-value">{{ systemInfo.uptime || '---' }}</div>
            <div class="stat-label">Uptime</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Info -->
    <div class="footer-info fade-in" :style="{animationDelay: '0.8s'}">
      <p class="footer-text">© 2026 PCRU Chatbot System • Version {{ version }}</p>
      <p class="footer-subtext">Developed with ❤️ by Students, Faculty of Science and Technology</p>
      <p class="footer-detail">Computer Science Program, Year 4, Class of 2022</p>
      <p class="footer-detail">Phetchabun Rajabhat University</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { axiosInstance } from '@/plugins/axios';

// Read app version from Vite env
const version = ref(import.meta.env.VITE_APP_VERSION || 'v0.0.0');
const databaseName = ref('pcru_chatbot');

const features = ref([
  'ตอบคำถามอัตโนมัติด้วย AI Matching',
  'ค้นหาคำถามด้วย Keyword และ Synonym',
  'ระบบ Fuzzy Matching สำหรับคำสะกดผิด (75-80% similarity)',
  'จัดอันดับคำตอบด้วย Final Ranking System',
  'รองรับหลายหมวดหมู่และหน่วยงาน',
  'ระบบ Feedback และการเรียนรู้อัตโนมัติ',
  'จัดการ Stopwords และ Domain Terms',
  'Real-time WebSocket สำหรับอัปเดตแบบทันที',
  'Dashboard และ Analytics สำหรับเจ้าหน้าที่',
  'Export/Import ข้อมูลเป็น Excel'
]);

const technologies = ref([
  'Vue.js 3',
  'Node.js + Express',
  'MySQL',
  'WebSocket',
  'PyThaiNLP',
  'Vite',
  'JWT Authentication',
  'Levenshtein Distance',
  'REST API',
  'Bootstrap Icons'
]);

const systemInfo = ref({
  totalQuestions: null,
  totalKeywords: null,
  totalCategories: null,
  uptime: null
});

onMounted(async () => {
  try {
    // Fetch system information from backend
    const response = await axiosInstance.get('/system/info');
    if (response.data.ok) {
      systemInfo.value = response.data.data;
    }
  } catch (error) {
    console.error('Could not fetch system info:', error);
    // Show error to user
    systemInfo.value = {
      totalQuestions: 'Error',
      totalKeywords: 'Error',
      totalCategories: 'Error',
      uptime: 'Error'
    };
  }
});
import { useRouter } from 'vue-router';

const router = useRouter();
const goBack = () => {
  // prefer history back, fallback to route push to dashboard
  if (window.history.length > 1) router.back();
  else router.push({ name: 'dashboard' }).catch(() => {});
};
</script>

<style scoped>
.about-system-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
}

/* Header Section */
.header-section {
  text-align: center;
  margin-bottom: 4rem;
  position: relative;
}

.system-icon-wrapper {
  display: inline-block;
  margin-bottom: 1.5rem;
}

.system-icon {
  width: 120px;
  height: 120px;
  filter: drop-shadow(0 10px 30px rgba(0, 122, 255, 0.3));
}

/* Apple-style back button */
.apple-back-button {
  position: absolute;
  left: 1.25rem;
  top: 1.25rem;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(0,122,255,0.08);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,250,252,0.99));
  color: #007AFF; /* blue chevron */
  box-shadow: 0 10px 30px rgba(0,122,255,0.08), inset 0 1px 0 rgba(255,255,255,0.8);
  backdrop-filter: blur(6px);
  cursor: pointer;
  transition: transform 160ms cubic-bezier(0.2,0.8,0.2,1), box-shadow 160ms;
  z-index: 40;
}

.apple-back-button svg { transform: translateX(-1px); }

.apple-back-button:active { transform: translateY(1px) scale(0.985); }
.apple-back-button:focus { outline: none; box-shadow: 0 12px 30px rgba(0,122,255,0.16); }

.apple-back-button:hover { transform: translateY(-2px); box-shadow: 0 18px 40px rgba(0,122,255,0.12); }

/* back button subtle continuous glow + radial halo */
.apple-back-button::after {
  content: '';
  position: absolute;
  width: 160px;
  height: 160px;
  left: -58px;
  top: -58px;
  border-radius: 50%;
  background: radial-gradient(circle at center, rgba(0,122,255,0.12) 0%, rgba(0,122,255,0.06) 25%, transparent 40%);
  filter: blur(12px);
  opacity: 0.0;
  pointer-events: none;
  transform: scale(0.95);
  animation: back-halo 3.2s ease-in-out infinite;
  z-index: -1;
}

@keyframes back-halo {
  0% { opacity: 0.0; transform: scale(0.95); }
  40% { opacity: 0.9; transform: scale(1); }
  100% { opacity: 0.0; transform: scale(1.02); }
}

/* small pulse to the button shadow to make it feel alive */
@keyframes back-shadow-pulse {
  0% { box-shadow: 0 10px 30px rgba(0,122,255,0.04); }
  50% { box-shadow: 0 18px 40px rgba(0,122,255,0.12); }
  100% { box-shadow: 0 10px 30px rgba(0,122,255,0.04); }
}

.apple-back-button {
  animation: back-shadow-pulse 3.2s ease-in-out infinite, pop-in 0.6s cubic-bezier(0.4,0,0.2,1) forwards;
}

.pulse-circle {
  animation: pulse-grow 2s ease-in-out infinite;
  transform-origin: center;
}

.clock-hand {
  animation: rotate-hand 3s ease-in-out infinite;
  transform-origin: 50px 50px;
}

@keyframes pulse-grow {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.9; }
}

@keyframes rotate-hand {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(90deg); }
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 1.25rem;
  color: #8E8E93;
  font-weight: 500;
  margin: 0;
}

/* Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.info-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.info-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #007AFF 0%, #5856D6 100%);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.info-card:hover {
  transform: translateY(-8px) scale(1.01);
  box-shadow: 0 12px 40px rgba(0, 122, 255, 0.15);
}

.info-card:hover::before {
  transform: scaleX(1);
}

.card-icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 20px rgba(0, 122, 255, 0.3);
  transition: transform 0.3s ease;
}

.info-card:hover .card-icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}

.card-icon {
  width: 32px;
  height: 32px;
  color: white;
}

.card-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1D1D1F;
  margin: 0 0 1.5rem 0;
  letter-spacing: -0.01em;
}

/* Feature List */
.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  padding: 0.75rem 0;
  font-size: 1rem;
  color: #424245;
  line-height: 1.6;
  opacity: 0;
  animation: slide-in-fade 0.5s ease forwards;
}

.feature-bullet {
  color: #007AFF;
  font-size: 1.5rem;
  margin-right: 0.75rem;
  line-height: 1;
}

/* Model Info */
.model-info {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.model-item {
  padding: 1rem;
  background: #F5F5F7;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.model-item:hover {
  background: #EBEBED;
  transform: translateX(4px);
}

.model-label {
  font-size: 0.875rem;
  color: #8E8E93;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.model-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1D1D1F;
  margin-bottom: 0.25rem;
}

.model-desc {
  font-size: 0.9rem;
  color: #6E6E73;
  line-height: 1.5;
}

/* Database Info */
.database-info {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.db-item {
  padding: 1rem;
  background: #F5F5F7;
  border-radius: 12px;
}

.db-label {
  font-size: 0.875rem;
  color: #8E8E93;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.db-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #007AFF;
}

.db-value-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.db-table {
  padding: 0.4rem 0.8rem;
  background: white;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #5856D6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Developers */
.developers-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.developer-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #F5F5F7;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.developer-card:hover {
  background: #EBEBED;
  transform: scale(1.02);
}

.dev-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #34C759 0%, #30D158 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(52, 199, 89, 0.3);
}

.dev-initial {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.dev-name {

  .dev-name-th {
    font-size: 0.95rem;
    font-weight: 600;
    color: #6E6E73;
    margin-top: 0.1rem;
  }
  font-size: 1.125rem;
  font-weight: 700;
  color: #1D1D1F;
}

.dev-role {
  font-size: 0.9rem;
  color: #8E8E93;
  margin-top: 0.25rem;
}

/* Technology Stack */
.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
}

.tech-badge {
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #F5F5F7 0%, #EBEBED 100%);
  border-radius: 10px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1D1D1F;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tech-badge:hover {
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

/* System Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1.5rem;
  background: #F5F5F7;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  transform: scale(1.05);
}

.stat-item:hover .stat-value,
.stat-item:hover .stat-label {
  color: white;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: #007AFF;
  margin-bottom: 0.25rem;
  transition: color 0.3s ease;
}

.stat-label {
  font-size: 0.875rem;
  color: #8E8E93;
  font-weight: 600;
  transition: color 0.3s ease;
}

/* Footer */
.footer-info {
  text-align: center;
  padding: 2rem 0;
  border-top: 1px solid #E5E5EA;
}

.footer-text {
  font-size: 1rem;
  color: #6E6E73;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.footer-subtext {

  .footer-detail {
    font-size: 0.85rem;
    color: #A0A0A5;
    margin: 0.25rem 0 0 0;
  }
  font-size: 0.9rem;
  color: #8E8E93;
  margin: 0;
}

/* Apple-style Animations */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slide-in-down {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pop-in {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slide-in-fade {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.fade-in {
  animation: fade-in 0.8s ease forwards;
}

.slide-in-down {
  animation: slide-in-down 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.slide-in-up {
  animation: slide-in-up 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.slide-in-left {
  animation: slide-in-left 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.slide-in-right {
  animation: slide-in-right 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.pop-in {
  animation: pop-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  opacity: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .system-icon {
    width: 80px;
    height: 80px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
