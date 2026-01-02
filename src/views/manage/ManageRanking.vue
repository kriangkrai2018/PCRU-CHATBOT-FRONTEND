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
      <div class="container-fluid">
      <!-- Info Card / How to Use (Detailed) -->
      <div class="card synonyms-info-card synonyms-shadow-apple mb-3 apple-fade">
        <div class="card-body">
          <div class="d-flex align-items-center mb-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="me-2">
              <circle cx="12" cy="12" r="9" stroke="#ff9500" stroke-width="2" />
              <path d="M8 12 L11 15 L16 9" stroke="#34C759" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <h5 class="m-0 fw-bold">วิธีใช้งาน Final Ranking (โหมดปรับน้ำหนักระบบ)</h5>
          </div>
          <div class="mb-2"><strong>หน้านี้มีไว้เพื่ออะไร?</strong> ใช้ตั้งค่า <em>global weight</em> ของสูตร (Core, Synonym, Domain, Application) ที่มีผลกับทุกคำตอบ/เอกสารในระบบ ไม่ใช่หน้าทดลองคำต่อคำ</div>
          <div class="mb-2"><strong>น้ำหนักแต่ละช่องคืออะไร?</strong>
            <ul class="mb-2">
              <li><strong>Core Weight</strong>: น้ำหนักความตรงกับคำตอบหลัก</li>
              <li><strong>Synonym Weight</strong>: น้ำหนักคะแนนสนับสนุนจากคำพ้อง/คำช่วย</li>
              <li><strong>Domain Weight</strong>: น้ำหนักเทอมในโดเมนหรือบริบทเฉพาะ</li>
              <li><strong>Application Weight</strong>: น้ำหนักปัจจัยด้านสมัคร/เงื่อนไขเพิ่มเติม</li>
            </ul>
          </div>
          <div class="mb-2"><strong>การคำนวณ</strong>: ระบบคูณคะแนนที่ได้จากแต่ละปัจจัย (0–1) เข้ากับน้ำหนักเหล่านี้ รวมเป็น <em>Total</em> และแสดง <em>Breakdown</em> ให้ตรวจสอบ</div>
          <div class="mb-2"><strong>การใช้งาน</strong>: ปรับน้ำหนัก → ดู Breakdown อัปเดตทันที → กด “บันทึกค่า” เพื่อให้สูตรใหม่มีผลกับระบบ</div>
          <div class="mb-2"><strong>ต้องการทดลองคำ/คะแนนรายเคส?</strong> ไปที่หน้า <em>Ranking Simulator</em> เพื่อกรอกคะแนนต่อเคสและกดคำนวณโดยไม่กระทบฐานข้อมูล</div>
        </div>
      </div>

      <!-- Ranking Calculator Card -->
      <div class="synonyms-apple-card synonyms-shadow-apple p-3 apple-pop">
        <FinalRankingCard
          ref="cardRef"
          :show-score-inputs="false"
          :show-sample-text="false"
          :show-save="true"
          :show-calculate="false"
          :initial-scores="{ core: 1.0, synonym_support: 1.0, domain_support: 1.0, application_support: 1.0 }"
        />
      </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import FinalRankingCard from '@/components/FinalRankingCard.vue';
import { useRouter } from 'vue-router';
import { isSidebarCollapsed, isMobileSidebarOpen } from '@/stores/sidebarState';
const cardRef = ref(null);

// Load user info similar to other manage pages
const router = useRouter();
const userInfoObject = ref({});
const userType = ref('');

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

onMounted(() => {
  const token = localStorage.getItem("userToken");
  const type = localStorage.getItem("userType");
  const userInfoString = localStorage.getItem("userInfo");
  if (!token) {
    router.replace({ name: "login" });
    return;
  }
  if (type) userType.value = type;
  if (userInfoString) {
    try { userInfoObject.value = JSON.parse(userInfoString); } catch(e){ console.error(e); }
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
    padding: 0.75rem;
  }
  
  .container-fluid {
    padding: 0.5rem;
  }
  
  .synonyms-info-card .card-body {
    padding: 1rem;
    font-size: 0.9rem;
  }
  
  .synonyms-info-card h5 {
    font-size: 1rem;
  }
  
  .synonyms-info-card ul {
    padding-left: 1.25rem;
  }
  
  .synonyms-info-card li {
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
  }
  
  .synonyms-apple-card {
    padding: 1rem !important;
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
  animation: icon-pop 600ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
@keyframes icon-pop {
  0% { opacity: 0; transform: scale(0.7) rotate(-10deg); }
  50% { transform: scale(1.1) rotate(5deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}
.title-icon .bar-1 {
  animation: bar-grow 800ms cubic-bezier(0.34, 1.56, 0.64, 1) 200ms backwards;
}
.title-icon .bar-2 {
  animation: bar-grow 800ms cubic-bezier(0.34, 1.56, 0.64, 1) 350ms backwards;
}
.title-icon .bar-3 {
  animation: bar-grow 800ms cubic-bezier(0.34, 1.56, 0.64, 1) 500ms backwards;
}
@keyframes bar-grow {
  0% { transform: scaleY(0); opacity: 0; }
  100% { transform: scaleY(1); opacity: 1; }
}
</style>
