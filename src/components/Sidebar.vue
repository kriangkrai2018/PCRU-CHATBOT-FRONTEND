<template>
  <div class="sidebar d-flex flex-column flex-shrink-0 pt-3 ps-0 pe-0" :class="{ 'collapsed': isCollapsed }">
    <div class="sidebar-header d-flex align-items-center">
      <button class="btn btn-link text-dark p-0 toggle-btn" @click="toggleSidebar">
        <AnimatedToggleIcon :isOpen="!isCollapsed" />
      </button>
      <span class="fs-4 fw-bold pcru-text" :class="{ 'collapsed-text': isCollapsed }">PCRU</span>
    </div>
    <hr>
    <ul class="nav nav-pills flex-column mb-auto">
      <li class="nav-item">
        <router-link
          to="/dashboard"
          class="nav-link d-flex align-items-center gap-2"
          :class="{ 'active': isDashboardActive, 'justify-content-flex-start': !isCollapsed, 'justify-content-center': isCollapsed }"
          :aria-current="isDashboardActive ? 'page' : null"
        >
          <i :class="['bi bi-house-door fs-4', { 'ms-2': !isCollapsed }]"></i>
          <span :class="{ 'collapsed-text': isCollapsed }">Dashboard</span>
        </router-link>
      </li>

      <!-- Reports Dropdown (Officer only) -->
      <li v-if="userType === 'Officer'" class="nav-item">
        <div 
          class="nav-link d-flex align-items-center gap-2 dropdown-toggle-custom"
          :class="{ 'active': isReportsActive, 'justify-content-flex-start': !isCollapsed, 'justify-content-center': isCollapsed }"
          @click="toggleReportsDropdown"
          role="button"
        >
          <i :class="['bi bi-bar-chart-line fs-4', { 'ms-2': !isCollapsed }]"></i>
          <span :class="{ 'collapsed-text': isCollapsed }" class="flex-grow-1">Reports</span>
          <i v-if="!isCollapsed" :class="['bi', isReportsOpen ? 'bi-chevron-up' : 'bi-chevron-down', 'me-2']"></i>
        </div>
        <!-- Dropdown Menu -->
        <ul v-show="isReportsOpen && !isCollapsed" class="nav flex-column ms-3 reports-dropdown">
          <li class="nav-item">
            <router-link to="/reports/categories" class="nav-link py-2 d-flex align-items-center gap-2" :class="{ 'active': route.path === '/reports/categories' }">
              <i class="bi bi-tags"></i>
              <span>Categories</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/reports/questionsanswers" class="nav-link py-2 d-flex align-items-center gap-2" :class="{ 'active': route.path === '/reports/questionsanswers' }">
              <i class="bi bi-question-circle"></i>
              <span>Q&A</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/reports/questions-need-review" class="nav-link py-2 d-flex align-items-center gap-2" :class="{ 'active': route.path === '/reports/questions-need-review' }">
              <i class="bi bi-exclamation-triangle"></i>
              <span>Need Review</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/reports/keywords" class="nav-link py-2 d-flex align-items-center gap-2" :class="{ 'active': route.path === '/reports/keywords' }">
              <i class="bi bi-key"></i>
              <span>Keywords</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/reports/chatlog-has-answers" class="nav-link py-2 d-flex align-items-center gap-2" :class="{ 'active': route.path === '/reports/chatlog-has-answers' }">
              <i class="bi bi-chat-left-text"></i>
              <span>ChatLog (Answered)</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/reports/feedbacks" class="nav-link py-2 d-flex align-items-center gap-2" :class="{ 'active': route.path === '/reports/feedbacks' }">
              <i class="bi bi-hand-thumbs-up"></i>
              <span>Feedbacks</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/reports/feedbacks-handled" class="nav-link py-2 d-flex align-items-center gap-2" :class="{ 'active': route.path === '/reports/feedbacks-handled' }">
              <i class="bi bi-check-circle"></i>
              <span>Handled Feedbacks</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/reports/chatlog-no-answers" class="nav-link py-2 d-flex align-items-center gap-2" :class="{ 'active': route.path === '/reports/chatlog-no-answers' }">
              <i class="bi bi-chat-left-dots"></i>
              <span>ChatLog (No Answer)</span>
            </router-link>
          </li>
        </ul>
      </li>

      <li v-if="userType === 'Super Admin'" class="nav-item">
        <router-link
          to="/manageadminuser"
          class="nav-link d-flex align-items-center gap-2"
          :class="{ 'active': isManageAdminActive, 'justify-content-flex-start': !isCollapsed, 'justify-content-center': isCollapsed }"
          :aria-current="isManageAdminActive ? 'page' : null"
        >
          <i :class="['bi bi-people fs-4', { 'ms-2': !isCollapsed }]"></i>
          <span :class="{ 'collapsed-text': isCollapsed }">Manage Admins</span>
        </router-link>
      </li>
      <li v-if="userType === 'Admin'" class="nav-item">
        <router-link
          to="/manageorganizations"
          class="nav-link d-flex align-items-center gap-2"
          :class="{ 'active': isManageOrganizationsActive, 'justify-content-flex-start': !isCollapsed, 'justify-content-center': isCollapsed }"
          :aria-current="isManageOrganizationsActive ? 'page' : null"
        >
          <i :class="['bi bi-building fs-4', { 'ms-2': !isCollapsed }]"></i>
          <span :class="{ 'collapsed-text': isCollapsed }">Manage Organizations</span>
        </router-link>
      </li>
      <li v-if="userType === 'Admin'" class="nav-item">
        <router-link
          to="/manageofficers"
          class="nav-link d-flex align-items-center gap-2"
          :class="{ 'active': isManageOfficersActive, 'justify-content-flex-start': !isCollapsed, 'justify-content-center': isCollapsed }"
          :aria-current="isManageOfficersActive ? 'page' : null"
        >
          <i :class="['bi bi-person-badge fs-4', { 'ms-2': !isCollapsed }]"></i>
          <span :class="{ 'collapsed-text': isCollapsed }">Manage Officers</span>
        </router-link>
      </li>
      <li v-if="userType === 'Admin'" class="nav-item">
        <router-link
          to="/manageaiimage"
          class="nav-link d-flex align-items-center gap-2"
          :class="{ 'active': isManageAIImageActive, 'justify-content-flex-start': !isCollapsed, 'justify-content-center': isCollapsed }"
          :aria-current="isManageAIImageActive ? 'page' : null"
        >
          <i :class="['bi bi-robot fs-4', { 'ms-2': !isCollapsed }]"></i>
          <span :class="{ 'collapsed-text': isCollapsed }">Manage AI Assistant</span>
        </router-link>
      </li>

      <!-- Manage Dropdown (Officer only) - 5 items -->
      <li v-if="userType === 'Officer'" class="nav-item">
        <div 
          class="nav-link d-flex align-items-center gap-2 dropdown-toggle-custom"
          :class="{ 'active': isManageActive, 'justify-content-flex-start': !isCollapsed, 'justify-content-center': isCollapsed }"
          @click="toggleManageDropdown"
          role="button"
        >
          <i :class="['bi bi-gear fs-4', { 'ms-2': !isCollapsed }]"></i>
          <span :class="{ 'collapsed-text': isCollapsed }" class="flex-grow-1">Manage</span>
          <i v-if="!isCollapsed" :class="['bi', isManageOpen ? 'bi-chevron-up' : 'bi-chevron-down', 'me-2']"></i>
        </div>
        <!-- Manage Dropdown Menu -->
        <ul v-show="isManageOpen && !isCollapsed" class="nav flex-column ms-3 reports-dropdown manage-dropdown">
          <li class="nav-item">
            <router-link to="/managecategories" class="nav-link py-2 d-flex align-items-center gap-2" :class="{ 'active': route.path === '/managecategories' }">
              <i class="bi bi-tags"></i>
              <span>Categories</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/managequestionsanswers" class="nav-link py-2 d-flex align-items-center gap-2" :class="{ 'active': route.path === '/managequestionsanswers' }">
              <i class="bi bi-question-circle"></i>
              <span>Q&A</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/managestopwords" class="nav-link py-2 d-flex align-items-center gap-2" :class="{ 'active': route.path === '/managestopwords' }">
              <i class="bi bi-funnel"></i>
              <span>Stopwords</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/managenegativekeywords" class="nav-link py-2 d-flex align-items-center gap-2" :class="{ 'active': route.path === '/managenegativekeywords' }">
              <i class="bi bi-x-circle"></i>
              <span>Negative Keywords</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/managesynonyms" class="nav-link py-2 d-flex align-items-center gap-2" :class="{ 'active': route.path === '/managesynonyms' }">
              <i class="bi bi-link-45deg"></i>
              <span>Synonyms</span>
            </router-link>
          </li>
        </ul>
      </li>

      <!-- Ranking Dropdown (group Final Ranking + Ranking Simulator) -->
      <li v-if="userType === 'Officer'" class="nav-item">
        <div
          class="nav-link d-flex align-items-center gap-2 dropdown-toggle-custom"
          :class="{ 'active': isRankingActive, 'justify-content-flex-start': !isCollapsed, 'justify-content-center': isCollapsed }"
          @click="toggleRankingDropdown"
          role="button"
        >
          <i :class="['bi bi-bar-chart fs-4', { 'ms-2': !isCollapsed }]"></i>
          <span :class="{ 'collapsed-text': isCollapsed }" class="flex-grow-1">Ranking</span>
          <i v-if="!isCollapsed" :class="['bi', isRankingOpen ? 'bi-chevron-up' : 'bi-chevron-down', 'me-2']"></i>
        </div>
        <ul v-show="isRankingOpen && !isCollapsed" class="nav flex-column ms-3 reports-dropdown manage-dropdown">
          <li class="nav-item">
            <router-link to="/manageranking" class="nav-link py-2 d-flex align-items-center gap-2" :class="{ 'active': route.path === '/manageranking' }">
              <i class="bi bi-bar-chart-line"></i>
              <span>Final Ranking</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/ranking-simulator" class="nav-link py-2 d-flex align-items-center gap-2" :class="{ 'active': route.path === '/ranking-simulator' }">
              <i class="bi bi-cpu"></i>
              <span>Ranking Simulator</span>
            </router-link>
          </li>
        </ul>
      </li>
        <!-- <li v-if="userType === 'Officer'" class="nav-item">
          <router-link
            class="nav-link d-flex align-items-center gap-2"
            to="/about-system"
            :class="{ 'active': isAboutSystemActive, 'justify-content-flex-start': !isCollapsed, 'justify-content-center': isCollapsed }"
            :aria-current="isAboutSystemActive ? 'page' : null"
          >
            <i :class="['bi bi-info-circle fs-4', { 'ms-2': !isCollapsed }]"></i>
            <span :class="{ 'd-none': isCollapsed }">About System</span>
          </router-link>
        </li> -->
      <!-- <li v-if="userType === 'Officer'" class="nav-item">
        <router-link
          to="/managethaipatterns"
          class="nav-link d-flex align-items-center gap-2"
          :class="{ 'active': isManageThaiPatternsActive, 'justify-content-flex-start': !isCollapsed, 'justify-content-center': isCollapsed }"
          :aria-current="isManageThaiPatternsActive ? 'page' : null"
        >
          <i :class="['bi bi-translate fs-4', { 'ms-2': !isCollapsed }]"></i>
          <span :class="{ 'd-none': isCollapsed }">Thai Word Learning</span>
        </router-link>
      </li> -->
    </ul>
    <div
      class="user-profile d-flex flex-column align-items-center justify-content-center gap-2"
      @mouseenter="isHoveringProfile = true"
      @mouseleave="isHoveringProfile = false"
      role="button"
      tabindex="0"
    >
      <!-- Icon on top -->
      <div class="w-100 d-flex align-items-center justify-content-start position-relative ps-2">
        <i v-if="isCollapsed && isHoveringProfile" class="bi bi-box-arrow-right fs-5" @click="handleLogout"></i>
        <i v-else class="bi bi-person-circle fs-2"></i>
        <i v-if="!isCollapsed" class="bi bi-box-arrow-right fs-5 position-absolute end-0 me-2" @click="handleLogout" style="cursor: pointer;"></i>
      </div>
      
      <!-- Text info below icon -->
      <div v-if="!isCollapsed" class="w-100">
        <strong class="d-block" style="font-size: 13px; line-height: 1.3;">
          <!-- Officer: show full name, Admin: show first name, fallback 'Admin' -->
          {{ userType === 'Officer'
            ? (userInfoObject?.OfficerName || 'Officer')
            : ((userInfoObject?.AdminName?.split(' ')[0]) || 'Admin')
          }}
        </strong>
        <small class="text-muted d-block" style="font-size: 11px;">{{ userType }}</small>
        <!-- Show Organization for Officers -->
        <small v-if="userType === 'Officer' && userInfoObject?.OrgName" class="text-muted d-block" style="font-size: 10px; margin-top: 2px;">
          {{ userInfoObject.OrgName }}
        </small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { logout } from '@/utils/auth';
import AnimatedToggleIcon from '@/components/AnimatedToggleIcon.vue';
import { isSidebarCollapsed, isReportsOpen, isManageOpen, isRankingOpen } from '@/stores/sidebarState';

const props = defineProps({
  userType: { type: String, default: '' },
  userInfoObject: { type: Object, default: () => ({}) },
});

const route = useRoute();
const router = useRouter();
const isHoveringProfile = ref(false);
const isCollapsed = isSidebarCollapsed;

// Reports dropdown toggle
const toggleReportsDropdown = () => {
  if (!isCollapsed.value) {
    isReportsOpen.value = !isReportsOpen.value;
  }
};

// Manage dropdown toggle
const toggleManageDropdown = () => {
  if (!isCollapsed.value) {
    isManageOpen.value = !isManageOpen.value;
  }
};

// Check if any report route is active
const isReportsActive = computed(() => route.path.startsWith('/reports'));

// Check if any manage route is active (5 items)
const manageRoutes = ['/managecategories', '/managequestionsanswers', '/managestopwords', '/managenegativekeywords', '/managesynonyms'];
const isManageActive = computed(() => manageRoutes.includes(route.path));

// Ranking group active when either ranking routes are active
const rankingRoutes = ['/manageranking', '/ranking-simulator'];
const isRankingActive = computed(() => rankingRoutes.includes(route.path));

// Auto-open dropdown when on a report page. The state is persisted by the store.
watch(() => route.path, (newPath) => {
  if (newPath.startsWith('/reports')) {
    isReportsOpen.value = true;
  }
  if (manageRoutes.includes(newPath)) {
    isManageOpen.value = true;
  }
  if (rankingRoutes.includes(newPath)) {
    isRankingOpen.value = true;
  }
}, { immediate: true });

const toggleRankingDropdown = () => {
  if (!isCollapsed.value) {
    isRankingOpen.value = !isRankingOpen.value;
  }
};

const isManageAdminActive = computed(() =>
  route.path === '/manageadminuser'
);
const isManageOrganizationsActive = computed(() =>
  route.path === '/manageorganizations'
);
const isManageOfficersActive = computed(() =>
  route.path === '/manageofficers'
);
const isManageAIImageActive = computed(() =>
  route.path === '/manageaiimage'
);
const isManageBotPronounActive = computed(() =>
  route.path === '/managebotpronoun'
);
const isManageCategoriesActive = computed(() =>
  route.path === '/managecategories'
);
const isManageQuestionsAnswersActive = computed(() =>
  route.path === '/managequestionsanswers'
);
const isManageThaiPatternsActive = computed(() =>
  route.path === '/managethaipatterns'
);
const isManageStopwordsActive = computed(() =>
  route.path === '/managestopwords'
);
const isManageNegativeKeywordsActive = computed(() =>
  route.path === '/managenegativekeywords'
);
const isManageSynonymsActive = computed(() =>
  route.path === '/managesynonyms'
);
const isManageRankingActive = computed(() =>
  route.path === '/manageranking'
);
const isRankingSimulatorActive = computed(() =>
  route.path === '/ranking-simulator'
);
const isAboutSystemActive = computed(() =>
  route.path === '/about-system'
);
const isDashboardActive = computed(() => route.path === '/dashboard');

// --- Only auto-collapse on route change for small screens (mobile) ---
let lastPath = route.path;
watch(() => route.path, (newPath, oldPath) => {
  // Only auto-collapse on actual route change AND when viewport is narrow
  if (newPath !== oldPath && window.innerWidth < 768) {
    isCollapsed.value = true;
    isMobileSidebarOpen.value = false;
    document.body.classList.remove('sidebar-open');
    document.body.classList.remove('sidebar-mobile-expanded');
  }
  lastPath = newPath;
});

// On mount, do NOT auto-collapse (preserve sidebar state after reload)
onMounted(() => {
  // No auto-collapse here; sidebar stays as user left it
});

import { isMobileSidebarOpen } from '@/stores/sidebarState';
const toggleSidebar = () => {
  // If the viewport is narrow, the collapse button should hide the mobile overlay entirely
  if (window.innerWidth < 768) {
    isMobileSidebarOpen.value = false;
    document.body.classList.remove('sidebar-open');
    document.body.classList.remove('sidebar-mobile-expanded');
    // make sure sidebar becomes collapsed as well
    isCollapsed.value = true;
  } else {
    isCollapsed.value = !isCollapsed.value;
  }
};
const handleLogout = () => { logout(router); };
</script>

<style scoped>
.sidebar { 
  width: 250px;
  transition: width 340ms cubic-bezier(0.22, 0.9, 0.28, 1), background-color 180ms ease-in-out;
  background-color: #E3E3E3;
  box-sizing: border-box;
  position: sticky; /* keep sidebar fixed while main scrolls */
  top: 0;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden; /* hide horizontal overflow but allow vertical scrolling */
  will-change: width, transform;
}
.sidebar.collapsed { 
  width: 70px !important;        /* force collapsed width to take precedence */
  min-width: 70px !important;
  overflow-x: hidden !important; /* keep horizontal overflow hidden when collapsed */
  overflow-y: auto !important;   /* still allow vertical scrolling when collapsed */
}
.sidebar-header { 
  min-height: 50px; 
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 0.75rem;
  gap: 0.5rem;
}
.pcru-text {
  flex: 1;
  text-align: left;
}
.toggle-btn { 
  flex-shrink: 0;
  z-index: 10;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
}
.nav-link { 
  color: rgba(0,0,0,0.65);
  transition: color 220ms ease, background-color 220ms ease, padding 260ms cubic-bezier(0.22, 0.9, 0.28, 1);
  padding-left: 0; /* remove left padding so items align flush */
}
.nav-link:hover { background-color: rgba(0,0,0,0.03); }
.nav-link.active { color: #000 !important; background-color: #D9D9D9 !important; }
.user-profile { padding: 0.5rem; margin-top: auto; }
.manage-questions-answers-link {
  font-size: 0.75em !important;
}

/* Reports Dropdown Styles */
.dropdown-toggle-custom {
  cursor: pointer;
  user-select: none;
}
.dropdown-toggle-custom:hover {
  background-color: rgba(0,0,0,0.03);
}
.dropdown-toggle-custom.active {
  color: #000 !important;
  background-color: #D9D9D9 !important;
}
.reports-dropdown {
  background-color: rgba(0,0,0,0.02);
  border-radius: 8px;
  margin-top: 4px;
  margin-bottom: 8px;
  padding: 4px 0;
  border-left: 3px solid #007AFF;
  animation: slideDown 0.2s ease-out;
}
.reports-dropdown .nav-link {
  font-size: 0.85rem;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  margin: 2px 4px;
}
.reports-dropdown .nav-link:hover {
  background-color: rgba(0,122,255,0.1);
}
.reports-dropdown .nav-link.active {
  background-color: rgba(0,122,255,0.15) !important;
  color: #007AFF !important;
}
.reports-dropdown .nav-link i {
  font-size: 0.9rem;
  width: 20px;
}

/* Manage Dropdown - different accent color */
.manage-dropdown {
  border-left: 3px solid #34C759 !important;
}
.manage-dropdown .nav-link:hover {
  background-color: rgba(52,199,89,0.1) !important;
}
.manage-dropdown .nav-link.active {
  background-color: rgba(52,199,89,0.15) !important;
  color: #34C759 !important;
}

/* Ranking dropdown accent */
/* Ranking dropdown reuses manage-dropdown styles so accent color matches */

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Smooth collapse/expand animations */
.sidebar { 
  will-change: width;
  /* slightly faster easing for feel */
  transition: width 240ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* text elements that previously used d-none now animate */
.sidebar .collapsed-text {
  opacity: 0;
  transform: translateX(-8px);
  pointer-events: none;
  max-width: 0;
  display: inline-block;
  vertical-align: middle;
  overflow: hidden;
  transition: opacity 260ms cubic-bezier(0.22, 0.9, 0.28, 1), transform 260ms cubic-bezier(0.22, 0.9, 0.28, 1), max-width 260ms cubic-bezier(0.22, 0.9, 0.28, 1);
}
.sidebar .nav-link span,
.sidebar .pcru-text {
  transition: opacity 260ms cubic-bezier(0.22, 0.9, 0.28, 1), transform 260ms cubic-bezier(0.22, 0.9, 0.28, 1), max-width 260ms cubic-bezier(0.22, 0.9, 0.28, 1);
  display: inline-block;
  opacity: 1;
  transform: translateX(0);
}

/* collapsed parent state - ensures consistent animation when sidebar toggles */
.sidebar.collapsed .nav-link span,
.sidebar.collapsed .pcru-text {
  opacity: 0;
  transform: translateX(-8px);
  pointer-events: none;
  max-width: 0;
}

/* Toggle icon rotation to indicate action */
.toggle-btn i {
  transition: transform 260ms cubic-bezier(0.4, 0, 0.2, 1);
}
.sidebar.collapsed .toggle-btn i {
  transform: rotate(180deg);
}

/* Smooth icon movement when collapsing */
.nav-link i {
  transition: margin 260ms cubic-bezier(0.22, 0.9, 0.28, 1), transform 260ms cubic-bezier(0.22, 0.9, 0.28, 1);
}
.sidebar.collapsed .nav-link i {
  margin-left: 0 !important;
}

/* Smoothly reveal dropdown when sidebar expands */
.reports-dropdown {
  transition: opacity 180ms ease, transform 180ms ease;
}

/* Toggle button - only show on mobile */
.toggle-btn {
  display: none;
}
@media (max-width: 768px) {
  .toggle-btn {
    display: block;
  }
}
</style>
