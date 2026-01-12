<template>
  <div class="sidebar d-flex flex-column flex-shrink-0 ps-0 pe-0" :class="{ 'collapsed': isCollapsed }">
    <!-- Fixed Header -->
    <div class="sidebar-header-fixed">
      <div class="sidebar-header d-flex align-items-center">
        <button class="btn btn-link text-dark p-0 toggle-btn" @click="toggleSidebar">
          <AnimatedToggleIcon :isOpen="!isCollapsed" />
        </button>
        <span class="fs-4 fw-bold pcru-text" :class="{ 'collapsed-text': isCollapsed }">PCRU</span>
      </div>
      <hr>
    </div>
    
    <!-- Scrollable Navigation -->
    <div class="sidebar-nav-wrapper">
      <ul class="nav nav-pills flex-column">
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
    </div>
    
    <!-- Fixed User Profile -->
    <div class="sidebar-footer-fixed">
      <!-- User Profile Button (Avatar) -->
      <div class="user-profile-wrapper position-relative">
        <div
          class="user-profile-trigger d-flex align-items-center"
          :class="{ 'justify-content-center': isCollapsed, 'justify-content-start': !isCollapsed }"
          @click="toggleProfileDropdown"
          role="button"
          tabindex="0"
        >
          <!-- Google Profile Picture if linked -->
          <div v-if="googleLinked && googlePicture" class="animated-google-avatar-container">
            <svg class="avatar-ring" viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="googleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#4285F4;stop-opacity:1">
                    <animate attributeName="stop-color" values="#4285F4;#EA4335;#FBBC05;#34A853;#4285F4" dur="5s" repeatCount="indefinite"/>
                  </stop>
                  <stop offset="100%" style="stop-color:#EA4335;stop-opacity:1">
                    <animate attributeName="stop-color" values="#EA4335;#FBBC05;#34A853;#4285F4;#EA4335" dur="5s" repeatCount="indefinite"/>
                  </stop>
                </linearGradient>
              </defs>
              <circle cx="29" cy="29" r="27" fill="none" stroke="url(#googleGradient)" stroke-width="2" opacity="0.4">
                <animateTransform attributeName="transform" type="rotate" from="0 29 29" to="360 29 29" dur="15s" repeatCount="indefinite"/>
              </circle>
            </svg>
            <img 
              :src="googlePicture" 
              :alt="googleName || 'Google Profile'" 
              class="profile-avatar"
              referrerpolicy="no-referrer"
            >
          </div>
          <!-- Animated SVG Avatar if not linked to Google -->
          <div v-else class="animated-avatar-container">
            <svg class="animated-avatar" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <!-- Background circle with gradient -->
              <defs>
                <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#007AFF;stop-opacity:1">
                    <animate attributeName="stop-color" values="#007AFF;#5856D6;#AF52DE;#007AFF" dur="4s" repeatCount="indefinite"/>
                  </stop>
                  <stop offset="100%" style="stop-color:#5856D6;stop-opacity:1">
                    <animate attributeName="stop-color" values="#5856D6;#AF52DE;#007AFF;#5856D6" dur="4s" repeatCount="indefinite"/>
                  </stop>
                </linearGradient>
                <filter id="avatarGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              <!-- Outer ring with rotation -->
              <circle cx="50" cy="50" r="46" fill="none" stroke="url(#avatarGradient)" stroke-width="2" opacity="0.3">
                <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="20s" repeatCount="indefinite"/>
              </circle>
              
              <!-- Main background circle -->
              <circle cx="50" cy="50" r="42" fill="url(#avatarGradient)" filter="url(#avatarGlow)">
                <animate attributeName="r" values="42;44;42" dur="2s" repeatCount="indefinite"/>
              </circle>
              
              <!-- Head -->
              <circle cx="50" cy="38" r="14" fill="white" opacity="0.95">
                <animate attributeName="cy" values="38;36;38" dur="3s" repeatCount="indefinite"/>
              </circle>
              
              <!-- Body (shoulders) -->
              <path d="M 26 75 Q 26 58, 50 55 Q 74 58, 74 75" fill="white" opacity="0.95">
                <animate attributeName="d" values="M 26 75 Q 26 58, 50 55 Q 74 58, 74 75;M 26 75 Q 26 56, 50 53 Q 74 56, 74 75;M 26 75 Q 26 58, 50 55 Q 74 58, 74 75" dur="3s" repeatCount="indefinite"/>
              </path>
              
              <!-- Floating particles -->
              <circle cx="25" cy="25" r="2" fill="white" opacity="0.6">
                <animate attributeName="cy" values="25;20;25" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="75" cy="30" r="1.5" fill="white" opacity="0.5">
                <animate attributeName="cy" values="30;25;30" dur="2.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" repeatCount="indefinite"/>
              </circle>
              <circle cx="80" cy="70" r="1" fill="white" opacity="0.4">
                <animate attributeName="cx" values="80;82;80" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite"/>
              </circle>
            </svg>
          </div>
          
          <!-- User Name (show when not collapsed) -->
          <div v-if="!isCollapsed" class="user-info-inline ms-3">
            <div class="user-name-inline">{{ userDisplayName }}</div>
            <div class="user-org-inline">{{ userOrgName || 'มหาวิทยาลัยราชภัฏเพชรบูรณ์' }}</div>
          </div>
        </div>

        <!-- Profile Dropdown Menu -->
        <transition name="dropdown-fade">
          <div v-if="showProfileDropdown" class="profile-dropdown" @click.stop>
            <!-- Header with Name and Details -->
            <div class="profile-dropdown-header">
              <div class="profile-info-full">
                <strong class="profile-name-full">{{ userDisplayName }}</strong>
                <div class="profile-badge">
                  <span class="badge-type" :class="userType === 'Admin' ? 'badge-admin' : 'badge-officer'">
                    {{ userType === 'Admin' ? 'ผู้ดูแลระบบ' : 'เจ้าหน้าที่' }}
                  </span>
                </div>
                <small class="profile-org-full">
                  <i class="bi bi-building me-1"></i>{{ userOrgName || 'มหาวิทยาลัยราชภัฏเพชรบูรณ์' }}
                </small>
                <small v-if="googleLinked && googleEmail" class="profile-email">
                  <i class="bi bi-envelope me-1"></i>{{ googleEmail }}
                </small>
              </div>
            </div>

            <!-- Divider -->
            <div class="dropdown-divider"></div>

            <!-- Menu Items -->
            <div class="profile-dropdown-menu">
              <!-- Google Account Link -->
              <router-link 
                to="/managegoogleaccount" 
                class="dropdown-item"
                @click="showProfileDropdown = false"
              >
                <svg class="item-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>บัญชี Google</span>
              </router-link>

              <!-- Logout -->
              <button class="dropdown-item text-danger" @click="handleLogout">
                <i class="bi bi-box-arrow-right item-icon"></i>
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </transition>

        <!-- Backdrop to close dropdown -->
        <div 
          v-if="showProfileDropdown" 
          class="profile-dropdown-backdrop" 
          @click="showProfileDropdown = false"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, getCurrentInstance } from 'vue';
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
const showProfileDropdown = ref(false);

// Google account status
const googleLinked = ref(false);
const googlePicture = ref('');
const googleName = ref('');
const googleEmail = ref('');

// Computed: Full name display
const userDisplayName = computed(() => {
  if (props.userType === 'Officer') {
    return props.userInfoObject?.OfficerName || 'เจ้าหน้าที่';
  } else if (props.userType === 'Admin') {
    return props.userInfoObject?.AdminName || 'ผู้ดูแลระบบ';
  }
  return 'ผู้ใช้งาน';
});

// Computed: Organization name
const userOrgName = computed(() => {
  return props.userInfoObject?.OrgName || '';
});

// Fetch Google account status
const { appContext } = getCurrentInstance();
const $axios = appContext.config.globalProperties.$axios;

const fetchGoogleStatus = async () => {
  try {
    const response = await $axios.get('/auth/google/status');
    if (response.data && response.data.linked) {
      googleLinked.value = true;
      googlePicture.value = response.data.googlePicture || '';
      googleName.value = response.data.googleName || '';
      googleEmail.value = response.data.googleEmail || '';
    } else {
      googleLinked.value = false;
      googlePicture.value = '';
      googleName.value = '';
      googleEmail.value = '';
    }
  } catch (err) {
    console.warn('Could not fetch Google status:', err);
  }
};

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
  // Fetch Google account status
  fetchGoogleStatus();
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

const toggleProfileDropdown = () => {
  showProfileDropdown.value = !showProfileDropdown.value;
};

const handleLogout = () => { logout(router); };
</script>

<style scoped>
.sidebar { 
  width: 250px;
  transition: width 340ms cubic-bezier(0.22, 0.9, 0.28, 1), background-color 180ms ease-in-out;
  background-color: #E3E3E3;
  box-sizing: border-box;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden; /* Prevent scrolling on the sidebar itself */
  will-change: width, transform;
  display: flex;
  flex-direction: column;
}

.sidebar.collapsed { 
  width: 70px !important;
  min-width: 70px !important;
}

/* Fixed Header */
.sidebar-header-fixed {
  position: sticky;
  top: 0;
  background-color: #E3E3E3;
  z-index: 10;
  padding-top: 1rem;
  flex-shrink: 0;
}

.sidebar-header { 
  min-height: 50px; 
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 0.75rem;
  gap: 0.5rem;
}

.sidebar-header-fixed hr {
  margin: 0.5rem 0;
  border-color: rgba(0,0,0,0.1);
}

/* Scrollable Navigation */
.sidebar-nav-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 1rem;
}

.sidebar-nav-wrapper::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav-wrapper::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.2);
  border-radius: 3px;
}

.sidebar-nav-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(0,0,0,0.3);
}

/* Fixed Footer (User Profile) */
.sidebar-footer-fixed {
  position: sticky;
  bottom: 0;
  background-color: #E3E3E3;
  z-index: 10;
  flex-shrink: 0;
  border-top: 1px solid rgba(0,0,0,0.1);
  padding-top: 0.5rem;
}

/* Google Account Link */
.google-account-link {
  padding: 0 8px;
}

.google-account-link .btn {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.google-account-link .btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.google-account-link .btn.active {
  background-color: rgba(0, 0, 0, 0.1);
  border-color: rgba(0, 0, 0, 0.2);
}

.google-icon-collapsed {
  display: flex;
  justify-content: center;
  padding: 8px;
  transition: all 0.2s ease;
}

.google-icon-collapsed:hover {
  opacity: 0.7;
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
  padding-left: 0;
}

.nav-link:hover { background-color: rgba(0,0,0,0.03); }
.nav-link.active { color: #000 !important; background-color: #D9D9D9 !important; }

.user-profile { 
  padding: 0.5rem;
}

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

/* Toggle button - show on all sizes */
.toggle-btn {
  display: flex;
}

/* User Profile Wrapper */
.user-profile-wrapper {
  position: relative;
  padding: 12px;
}

.user-profile-trigger {
  width: 100%;
  min-height: 60px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  gap: 0;
}

.user-profile-trigger:hover {
  background: rgba(0, 122, 255, 0.05);
}

.user-profile-trigger:active {
  transform: scale(0.98);
}

/* Animated Google Avatar Container */
.animated-google-avatar-container {
  width: 48px;
  height: 48px;
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-ring {
  position: absolute;
  width: 58px;
  height: 58px;
  top: -5px;
  left: -5px;
  z-index: 0;
  pointer-events: none;
}

.animated-google-avatar-container .profile-avatar {
  position: relative;
  z-index: 1;
  animation: float-avatar 3s ease-in-out infinite;
}

@keyframes float-avatar {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-4px);
  }
}

.animated-google-avatar-container::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4285F4, #EA4335, #FBBC05, #34A853);
  opacity: 0;
  z-index: 0;
  transition: opacity 0.3s ease;
  animation: pulse-ring 2s ease-out infinite;
}

.animated-google-avatar-container:hover::before {
  opacity: 0.3;
}

/* User Info Inline (when sidebar expanded) */
.user-info-inline {
  flex: 1;
  min-width: 0;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.user-name-inline {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  line-height: 1.3;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-org-inline {
  font-size: 11px;
  color: #86868b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Profile Avatar in Trigger */
.profile-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid transparent;
  background: linear-gradient(white, white) padding-box,
              linear-gradient(135deg, #4285F4, #EA4335, #FBBC05, #34A853) border-box;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.profile-avatar:hover {
  box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
}

/* Animated SVG Avatar Container */
.animated-avatar-container {
  width: 48px;
  height: 48px;
  position: relative;
}

.animated-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.animated-avatar:hover {
  transform: scale(1.1);
}

/* Pulse animation on hover */
.animated-avatar-container::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border-radius: 50%;
  background: linear-gradient(135deg, #007AFF, #5856D6, #AF52DE);
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s ease;
  animation: pulse-ring 2s ease-out infinite;
}

.animated-avatar-container:hover::before {
  opacity: 0.5;
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

/* Profile Dropdown */
.profile-dropdown {
  position: fixed;
  bottom: 80px;
  left: 16px;
  width: 280px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 
              0 2px 8px rgba(0, 0, 0, 0.12);
  z-index: 99999 !important;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

/* Adjust dropdown position when sidebar is collapsed */
.sidebar.collapsed .profile-dropdown {
  left: 16px;
  width: 280px;
}

.profile-dropdown-header {
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.profile-info-full {
  width: 100%;
}

.profile-name-full {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  line-height: 1.3;
  margin-bottom: 8px;
}

.profile-badge {
  margin-bottom: 8px;
}

.badge-type {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-admin {
  background: linear-gradient(135deg, #FF3B30, #FF6B6B);
  color: white;
}

.badge-officer {
  background: linear-gradient(135deg, #007AFF, #5AC8FA);
  color: white;
}

.profile-org-full {
  display: block;
  font-size: 12px;
  color: #86868b;
  margin-bottom: 4px;
}

.profile-email {
  display: block;
  font-size: 11px;
  color: #86868b;
}

.dropdown-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
  margin: 0;
}

.profile-dropdown-menu {
  padding: 8px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  font-size: 14px;
  color: #1d1d1f;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.dropdown-item:hover {
  background: rgba(0, 122, 255, 0.08);
  color: #007AFF;
}

.dropdown-item.text-danger:hover {
  background: rgba(255, 59, 48, 0.08);
  color: #FF3B30;
}

.dropdown-item .item-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  font-size: 18px;
}

.dropdown-item span {
  flex: 1;
}

/* Dropdown Backdrop */
.profile-dropdown-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1040;
  background: transparent;
}

/* Dropdown Fade Animation */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.2s ease;
}

.dropdown-fade-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(5px) scale(0.98);
}

.dropdown-fade-enter-to,
.dropdown-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Google Profile Avatar (legacy - kept for compatibility) */
.google-profile-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid transparent;
  background: linear-gradient(white, white) padding-box,
              linear-gradient(135deg, #4285F4, #EA4335, #FBBC05, #34A853) border-box;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.google-profile-avatar:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
}
</style>
