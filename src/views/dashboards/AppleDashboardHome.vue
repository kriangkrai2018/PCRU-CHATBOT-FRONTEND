<template>
  <div class="apple-dashboard container-fluid">
    <div v-if="isMobileSidebarOpen" class="mobile-sidebar-backdrop" @click="toggleSidebar" aria-hidden="true"></div>
    
    <!-- Apple-style Hero Section -->
    <transition name="hero-enter" appear>
      <div class="apple-hero">
        <button class="mobile-sidebar-toggle mobile-inline-toggle" @click.stop="toggleSidebar" :aria-label="isMobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'">
          <svg v-if="!isMobileSidebarOpen" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        
        <div class="hero-content">
          <div class="hero-icon-wrap">
            <svg class="hero-icon" width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle class="hero-circle-bg" cx="28" cy="28" r="26" />
              <circle class="hero-circle-progress" cx="28" cy="28" r="26" />
              <path class="hero-wave" d="M14 28 Q21 20, 28 28 T42 28" />
            </svg>
          </div>
          <div class="hero-text">
            <h1 class="apple-title">{{ greetingText }}</h1>
            <p class="apple-sub">{{ roleDescription }}</p>
          </div>
        </div>
        
        <div class="role-badge" :class="roleBadgeClass">
          <span class="role-icon-emoji">{{ roleIcon }}</span>
          <span class="role-text">{{ roleLabel }}</span>
          <span class="role-glow"></span>
        </div>
      </div>
    </transition>

    <!-- Apple Stats Cards -->
    <transition-group name="stat-pop" tag="div" class="stats-grid" appear>
      <router-link v-for="(stat, idx) in visibleStats" :key="stat.key" :to="stat.link" class="stat-card" :style="{ '--delay': `${idx * 80}ms` }">
        <div class="stat-icon-wrap">
          <div class="stat-icon" :style="{ background: stat.color }">
            <DashboardIcons :name="stat.icon" />
          </div>
          <div class="stat-icon-glow" :style="{ background: stat.color }"></div>
        </div>
        <div class="stat-info">
          <div class="stat-value">
            <span class="stat-number" :data-value="stat.value">{{ stat.value }}</span>
          </div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
        <svg class="stat-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </router-link>
    </transition-group>

    <!-- Charts Section - Apple Style -->
    <transition name="section-slide" appear>
      <div class="charts-section">
        <div class="charts-header">
          <div class="section-title-group">
            <svg class="section-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect class="chart-bar bar-1" x="3" y="12" width="4" height="9" rx="1" />
              <rect class="chart-bar bar-2" x="10" y="6" width="4" height="15" rx="1" />
              <rect class="chart-bar bar-3" x="17" y="3" width="4" height="18" rx="1" />
            </svg>
            <h3 class="section-title">{{ chartsSectionTitle }}</h3>
          </div>
          <div class="report-pills">
            <router-link v-for="btn in reportButtons" :key="btn.key" :to="btn.link" class="report-pill">
              <span>{{ btn.title }}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </router-link>
          </div>
        </div>
        <div class="mini-grid">
          <transition-group name="chart-pop" appear v-if="normalizedRole === 'officer'">
            <div v-for="(card, idx) in visibleCards" :key="card.key" class="mini-card" :style="{ '--delay': `${idx * 60}ms` }">
              <div class="mini-header">
                <div class="mini-dot" :style="{ background: cardColor(card.key) }"></div>
                <div class="mini-title">{{ card.title }}</div>
              </div>
              <div class="mini-chart">
                <template v-if="card.key === 'needReview'">
                  <div v-if="needReviewCount > 0">
                    <component :is="card.chartType" :chart-data="card.data" :options="chartOptions" />
                  </div>
                  <div v-else class="mini-empty-donut" aria-hidden="true" title="No data">
                    <svg width="86" height="86" viewBox="0 0 86 86">
                      <circle cx="43" cy="43" r="38" fill="none" stroke="#f5f5f7" stroke-width="10"/>
                    </svg>
                  </div>
                </template>
                <template v-else>
                  <component :is="card.chartType" :chart-data="card.data" :options="chartOptions" />
                </template>
              </div>
              <div class="mini-counts">
                <template v-if="card.key === 'needReview'">
                  <div class="status-badge" v-for="(c, idx) in ['overdue','urgent','soon']" :key="c">
                    <span class="dot" :style="{ background: needReviewColor(c) }"></span>
                    <div class="badge-label">{{ needReviewLabel(c) }}</div>
                    <div class="badge-value">{{ needReviewBreakdown[c] || 0 }}</div>
                  </div>
                </template>
                <template v-else>
                  <div class="count-label">{{ card.title }}</div>
                  <div class="count-value">{{ cardCount(card.key) }}</div>
                </template>
              </div>
              <router-link class="mini-link" :to="card.link">
                <span>Open</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </router-link>
            </div>
          </transition-group>

          <div v-else class="mini-card featured-card">
            <div class="mini-header">
              <div class="mini-dot" style="background: linear-gradient(135deg, #007AFF, #5AC8FA)"></div>
              <div class="mini-title">{{ mainChartTitle }}</div>
            </div>
            <div class="mini-chart">
              <component :is="mainChartType" :chart-data="mainChart" :options="chartOptions" />
            </div>
            <div class="chart-counts">
              <div v-for="(lbl, i) in mainChart.labels" :key="lbl" class="count-item">
                <div class="count-label">{{ lbl }}</div>
                <div class="count-value">{{ mainChartCounts[i] ?? 0 }}</div>
              </div>
            </div>
            <div class="mini-actions">
              <router-link v-if="normalizedRole === 'admin'" class="mini-link" to="/manageorganizations">
                <span>Organizations</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </router-link>

              <router-link v-if="normalizedRole === 'admin'" class="mini-link" to="/manageofficers">
                <span>Officers</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </router-link>

              <router-link v-else class="mini-link" :to="mainChartLink">
                <span>Open</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Quick Actions - Apple Style -->
    <transition name="section-slide" appear>
      <div v-if="quickActions.length > 0" class="quick-actions">
        <div class="section-title-group">
          <svg class="section-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path class="bolt-path" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <h3 class="section-title">Quick Actions</h3>
        </div>
        <div class="actions-grid">
          <router-link v-for="(action, idx) in quickActions" :key="action.key" :to="action.link" class="action-card" :style="{ '--delay': `${idx * 80}ms` }">
            <div class="action-icon-wrap">
              <div class="action-icon" :style="{ background: action.color }">
                <DashboardIcons :name="action.icon" />
              </div>
              <div class="action-icon-ring" :style="{ '--ring-color': action.color }"></div>
            </div>
            <div class="action-info">
              <div class="action-title">{{ action.title }}</div>
              <div class="action-desc">{{ action.desc }}</div>
            </div>
            <div class="action-arrow-wrap">
              <svg class="action-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </router-link>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, getCurrentInstance } from 'vue';
import { bindSidebarResize, isSidebarCollapsed, isMobileSidebarOpen } from '@/stores/sidebarState';
import { PieChart, BarChart } from 'vue-chart-3';
import DashboardIcons from '@/components/icons/DashboardIcons.vue';
import { Chart as ChartJS, registerables } from 'chart.js';
ChartJS.register(...registerables);

const props = defineProps({
  userType: { type: String, default: '' },
  userInfo: { type: Object, default: () => ({}) }
});

const { appContext } = getCurrentInstance();
const $axios = appContext.config.globalProperties.$axios;

const appleColors = ['#007AFF', '#34C759', '#AF52DE', '#FF9500', '#FF3B30', '#5AC8FA', '#5856D6', '#FFCC00'];

// Data refs
const categories = ref([]);
const questionsAnswers = ref([]);
const keywords = ref([]);
const feedbacks = ref([]);
const chatHas = ref([]);
const chatNo = ref([]);
const organizations = ref([]);
const officers = ref([]);
const admins = ref([]);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context) => {
          const ds = context.dataset || {};
          const idx = context.dataIndex || 0;
          // support per-slice realCounts array or single realCount
          let real = null;
          if (Array.isArray(ds.realCounts) && ds.realCounts[idx] != null) real = ds.realCounts[idx];
          else if (Array.isArray(ds.realCount) && ds.realCount[idx] != null) real = ds.realCount[idx];
          else if (ds.realCount != null && !Array.isArray(ds.realCount)) real = ds.realCount;
          else real = context.parsed || context.raw || 0;
          const label = context.label || '';
          return `${label}: ${real}`;
        }
      }
    }
  },
  cutout: '65%'
};

// Role-based computed properties
const normalizedRole = computed(() => {
  const role = (props.userType || '').toLowerCase().trim();
  if (role.includes('super') || role === 'superadmin') return 'superadmin';
  if (role === 'admin') return 'admin';
  if (role === 'officer') return 'officer';
  return 'officer'; // default
});

const greetingText = computed(() => {
  const name = props.userInfo?.Name || props.userInfo?.Username || 'นางสาววิพาดา';
  const hour = new Date().getHours();
  let greeting = 'สวัสดี';
  if (hour < 12) greeting = 'สวัสดีตอนเช้า ☀️';
  else if (hour < 17) greeting = 'สวัสดีตอนบ่าย 🌤️';
  else greeting = 'สวัสดีตอนเย็น 🌙';
  return `${greeting} ${name}`;
});

const roleDescription = computed(() => {
  switch (normalizedRole.value) {
    case 'superadmin': return 'คุณมีสิทธิ์เข้าถึงแค่ฟังค์ชันของผู้ดูแลระบบสูงสุด';
    case 'admin': return 'จัดการข้อมูลและดูรายงานต่างๆ';
    case 'officer': return 'ดูรายงานและManage Question Answer';
    default: return 'ยินดีต้อนรับสู่ระบบ';
  }
});

const roleLabel = computed(() => {
  switch (normalizedRole.value) {
    case 'superadmin': return 'Super Admin';
    case 'admin': return 'Admin';
    case 'officer': return 'Officer';
    default: return 'User';
  }
});

const roleIcon = computed(() => {
  switch (normalizedRole.value) {
    case 'superadmin': return '👑';
    case 'admin': return '⚙️';
    case 'officer': return '👤';
    default: return '👤';
  }
});

// Buttons shown in the header for quick access to report pages
const reportButtons = computed(() => {
  // Use path strings so router-link :to works consistently
  if (normalizedRole.value === 'admin' || normalizedRole.value === 'superadmin') {
    return [
      { key: 'feedbacks', title: 'Feedbacks (ข้อเสนอแนะ)', link: '/reports/feedbacks' },
      { key: 'keywords', title: 'Keywords (คำสำคัญ)', link: '/reports/keywords' },
      { key: 'qa', title: 'Q & A (คำถาม-คำตอบ)', link: '/reports/questionsanswers' }
    ]
  }
  // Officer sees a broader set of report shortcuts — use clearer, localized titles
  return [
    { key: 'categories', title: 'Categories (หมวดหมู่)', link: '/reports/categories' },
    { key: 'qa', title: 'Q & A (คำถาม-คำตอบ)', link: '/reports/questionsanswers' },
    { key: 'needreview', title: "Need Review (รอตรวจสอบ)", link: '/reports/questions-need-review' },
    { key: 'keywords', title: 'Keywords (คำสำคัญ)', link: '/reports/keywords' },
    { key: 'chatlog_has', title: 'Chats — Answered (แชทที่ตอบแล้ว)', link: '/reports/chatlog-has-answers' },
    { key: 'feedbacks', title: 'Feedbacks (ข้อเสนอแนะ)', link: '/reports/feedbacks' }
  ]
});

const roleBadgeClass = computed(() => normalizedRole.value);

// Stats based on role
const visibleStats = computed(() => {
  const allStats = [
    { key: 'categories', icon: 'categories', label: 'Categories', value: categories.value.length, color: 'linear-gradient(135deg, #007AFF, #5AC8FA)', link: '/reports/categories' },
    { key: 'qa', icon: 'qa', label: 'Q&A', value: questionsAnswers.value.length, color: 'linear-gradient(135deg, #34C759, #30D158)', link: '/reports/questionsanswers' },
    { key: 'keywords', icon: 'keywords', label: 'Keywords', value: keywords.value.length, color: 'linear-gradient(135deg, #FF9500, #FFCC00)', link: '/reports/keywords' },
    { key: 'feedbacks', icon: 'feedbacks', label: 'Feedbacks', value: feedbacks.value.length, color: 'linear-gradient(135deg, #AF52DE, #BF5AF2)', link: '/reports/feedbacks' },
    { key: 'chatHas', icon: 'answered', label: 'Answered', value: chatHas.value.length, color: 'linear-gradient(135deg, #5856D6, #AF52DE)', link: '/reports/chatlog-has-answers' },
    { key: 'chatNo', icon: 'noanswer', label: 'No Answer', value: chatNo.value.length, color: 'linear-gradient(135deg, #FF3B30, #FF9500)', link: '/reports/chatlog-no-answers' },
    { key: 'organizations', icon: 'organizations', label: 'Organizations', value: organizationsCount.value, color: 'linear-gradient(135deg, #007AFF, #5AC8FA)', link: '/manageorganizations' },
    { key: 'officers', icon: 'officers', label: 'Officers', value: officersCount.value, color: 'linear-gradient(135deg, #34C759, #30D158)', link: '/manageofficers' },
  ];

  switch (normalizedRole.value) {
    case 'superadmin':
      // Superadmin: show counts separated for Admins and Super Admins
      return [
        { key: 'admins', icon: 'officers', label: 'Admins', value: adminsCount.value, color: 'linear-gradient(135deg, #FF9500, #FFCC00)', link: '/manageadmins' },
        { key: 'superadmins', icon: 'officers', label: 'Super Admins', value: superadminsCount.value, color: 'linear-gradient(135deg, #FF3B30, #FF7A7A)', link: '/manageadmins' },
      ];
    case 'admin':
      // Admin should only see organization and officer related stats
      return allStats.filter(s => s.key === 'organizations' || s.key === 'officers');
    case 'officer': return allStats.slice(0, 4);
    default: return allStats.slice(0, 3);
  }
});

// Charts based on role
const chartsSectionTitle = computed(() => {
  switch (normalizedRole.value) {
    case 'superadmin': return 'All Reports';
    case 'admin': return 'Reports Overview';
    case 'officer': return 'My Reports';
    default: return 'Reports';
  }
});

const categoriesChart = computed(() => ({
  labels: categories.value.map(c => c.CategoriesName || String(c.CategoriesID)),
  datasets: [{ data: categories.value.map(() => 1), backgroundColor: appleColors.slice(0, categories.value.length) }]
}));

const qaChart = computed(() => {
  const counts = {};
  questionsAnswers.value.forEach(qa => {
    const key = qa.CategoriesID != null ? String(qa.CategoriesID) : 'Uncategorized';
    counts[key] = (counts[key] || 0) + 1;
  });
  return { labels: Object.keys(counts), datasets: [{ data: Object.values(counts), backgroundColor: appleColors.slice(0, Object.keys(counts).length) }] };
});

const keywordsChart = computed(() => {
  const counts = {};
  (keywords.value || []).forEach(k => { const t = k.KeywordText || 'Unknown'; counts[t] = (counts[t]||0)+1; });
  const labels = Object.keys(counts).slice(0,6);
  return { labels, datasets: [{ data: labels.map(l => counts[l]), backgroundColor: appleColors.slice(0, labels.length) }] };
});

const feedbacksChart = computed(() => {
  const counts = {};
  feedbacks.value.forEach(f => { 
    const v = f.FeedbackValue == null ? 'Other' : (f.FeedbackValue === 1 ? 'Like' : (f.FeedbackValue === 0 ? 'Unlike' : (f.FeedbackValue === 2 ? 'Pending' : String(f.FeedbackValue)))); 
    counts[v] = (counts[v]||0)+1; 
  });
  return { labels: Object.keys(counts), datasets: [{ data: Object.values(counts), backgroundColor: ['#34C759','#FF3B30','#FF9500','#6e6e73'] }] };
});

const chatHasChart = computed(() => ({ labels: ['Answered'], datasets: [{ data: [chatHas.value.length], backgroundColor: ['#007AFF'] }] }));
const chatNoChart = computed(() => ({ labels: ['No Answer'], datasets: [{ data: [chatNo.value.length], backgroundColor: ['#AF52DE'] }] }));

// Charts for organizations/officers/admins to ensure reactive updates

// Helper to ensure charts render even when count is zero
const chartFromCount = (count, label, color) => {
  if (count != null && count > 0) {
    return { labels: [label], datasets: [{ data: [count], backgroundColor: [color], realCount: count }] };
  }
  // placeholder single gray slice so chart shows up when count === 0
  return { labels: [label], datasets: [{ data: [1], backgroundColor: ['#e9e9ee'], realCount: 0 }] };
};

const organizationsChart = computed(() => chartFromCount(organizationsCount.value, 'Organizations', '#007AFF'));
const officersChart = computed(() => chartFromCount(officersCount.value, 'Officers', '#34C759'));
const adminsChart = computed(() => chartFromCount(adminsCount.value, 'Admins', '#FF9500'));


// Main single chart (role-aware)
const mainChartType = PieChart;
const mainChartTitle = computed(() => {
  switch (normalizedRole.value) {
    case 'superadmin': return 'Admin Accounts';
    case 'admin': return 'Organizations & Officers';
    case 'officer': return 'Q&A & Feedbacks';
    default: return 'Overview';
  }
});

const mainChart = computed(() => {
  switch (normalizedRole.value) {
    case 'superadmin': {
      const a = adminsCount.value || 0;
      const s = superadminsCount.value || 0;
      // Place Super Admins first and use red (#FF3B30) for Super Admins
      const data = [s > 0 ? s : 1, a > 0 ? a : 1];
      return { labels: ['Super Admins','Admins'], datasets: [{ data, backgroundColor: ['#FF3B30','#FF9500'], realCounts: [s, a] }] };
    }
    case 'admin': {
      const o = organizationsCount.value || 0;
      const of = officersCount.value || 0;
      const data = [o > 0 ? o : 1, of > 0 ? of : 1];
      return { labels: ['Organizations','Officers'], datasets: [{ data, backgroundColor: ['#007AFF','#34C759'], realCounts: [o, of] }] };
    }
    case 'officer': {
      const q = questionsAnswers.value.length || 0;
      const f = feedbacks.value.length || 0;
      const data = [q > 0 ? q : 1, f > 0 ? f : 1];
      return { labels: ['Q&A','Feedbacks'], datasets: [{ data, backgroundColor: ['#AF52DE','#FFCC00'], realCounts: [q, f] }] };
    }
    default:
      return { labels: categories.value.map(c => c.CategoriesName || String(c.CategoriesID)), datasets: [{ data: categories.value.map(() => 1), backgroundColor: appleColors.slice(0, categories.value.length) }] };
  }
});

const mainChartLink = computed(() => {
  switch (normalizedRole.value) {
    case 'superadmin': return '/manageadminuser';
    case 'admin': return '/manageorganizations';
    case 'officer': return '/reports/questionsanswers';
    default: return '/reports/categories';
  }
});

// Expose the real counts for display under the chart (so zero is visible)
const mainChartCounts = computed(() => {
  switch (normalizedRole.value) {
    // match the chart label order above: Super Admins first, Admins second
    case 'superadmin': return [superadminsCount.value || 0, adminsCount.value || 0];
    case 'admin': return [organizationsCount.value || 0, officersCount.value || 0];
    case 'officer': return [questionsAnswers.value.length || 0, feedbacks.value.length || 0];
    default: return categories.value.map(() => 0);
  }
});

const visibleCards = computed(() => {
  const allCards = [
    { key: 'categories', title: 'Categories', chartType: PieChart, data: categoriesChart.value, link: '/reports/categories' },
    { key: 'qa', title: 'Q&A', chartType: PieChart, data: qaChart.value, link: '/reports/questionsanswers' },
    { key: 'keywords', title: 'Keywords', chartType: PieChart, data: keywordsChart.value, link: '/reports/keywords' },
    { key: 'feedbacks', title: 'Feedbacks', chartType: PieChart, data: feedbacksChart.value, link: '/reports/feedbacks' },
    { key: 'chatHas', title: 'ChatLog (Answered)', chartType: BarChart, data: chatHasChart.value, link: '/reports/chatlog-has-answers' },
    { key: 'chatNo', title: 'ChatLog (No Answer)', chartType: BarChart, data: chatNoChart.value, link: '/reports/chatlog-no-answers' },
    { key: 'organizations', title: 'Organizations', chartType: PieChart, data: organizationsChart.value, link: '/manageorganizations' },
    { key: 'officers', title: 'Officers', chartType: PieChart, data: officersChart.value, link: '/manageofficers' },
    { key: 'admins', title: 'Admins', chartType: PieChart, data: adminsChart.value, link: '/manageadminuser' },
    { key: 'superadmins', title: 'Super Admins', chartType: PieChart, data: chartFromCount(superadminsCount.value, 'Super Admins', '#FF3B30'), link: '/manageadminuser' },
  ];

  switch (normalizedRole.value) {
    case 'superadmin':
      // Superadmin sees both Admins and Super Admins management cards
      return [ allCards.find(c => c.key === 'admins'), allCards.find(c => c.key === 'superadmins') ].filter(Boolean);
    case 'admin':
      // Admin only sees organization & officer reports
      return allCards.filter(c => c.key === 'organizations' || c.key === 'officers');
    case 'officer':
      // Officers: show many report cards as charts (no buttons)
      return [
        allCards.find(c => c.key === 'categories'),
        allCards.find(c => c.key === 'qa'),
        { key: 'needReview', title: 'A Need Review', chartType: PieChart, data: needReviewChart.value, link: '/reports/questions-need-review' },
        allCards.find(c => c.key === 'keywords'),
        allCards.find(c => c.key === 'chatHas'),
        allCards.find(c => c.key === 'feedbacks'),
        { key: 'handledFeedbacks', title: 'Handled Feedbacks', chartType: PieChart, data: handledFeedbacksChart.value, link: '/reports/feedbacks-handled' },
        allCards.find(c => c.key === 'chatNo')
      ].filter(Boolean);
    default: return allCards.slice(0, 3);
  }
});

// Helper to read an appropriate count for a card key
const cardCount = (key) => {
  switch (key) {
    case 'categories': return (categories.value || []).length;
    case 'qa': return (questionsAnswers.value || []).length;
    case 'needReview': return needReviewCount.value;
    case 'keywords': return (keywords.value || []).length;
    case 'chatHas': return (chatHas.value || []).length;
    case 'feedbacks': return (feedbacks.value || []).length;
    case 'handledFeedbacks': return handledFeedbacksCount.value;
    case 'chatNo': return (chatNo.value || []).length;
    default: return 0;
  }
};

// Helper to get card color by key
const cardColor = (key) => {
  const colors = {
    categories: 'linear-gradient(135deg, #007AFF, #5AC8FA)',
    qa: 'linear-gradient(135deg, #34C759, #30D158)',
    needReview: 'linear-gradient(135deg, #FF9500, #FFCC00)',
    keywords: 'linear-gradient(135deg, #FF9500, #FFCC00)',
    chatHas: 'linear-gradient(135deg, #5856D6, #AF52DE)',
    feedbacks: 'linear-gradient(135deg, #AF52DE, #BF5AF2)',
    handledFeedbacks: 'linear-gradient(135deg, #34C759, #30D158)',
    chatNo: 'linear-gradient(135deg, #FF3B30, #FF9500)',
    organizations: 'linear-gradient(135deg, #007AFF, #5AC8FA)',
    officers: 'linear-gradient(135deg, #34C759, #30D158)',
    admins: 'linear-gradient(135deg, #FF9500, #FFCC00)',
    superadmins: 'linear-gradient(135deg, #FF3B30, #FF7A7A)'
  };
  return colors[key] || 'linear-gradient(135deg, #007AFF, #5AC8FA)';
};

// Helpers for needReview labels and colors
const needReviewLabel = (key) => ({ overdue: 'เกินกำหนด', urgent: 'เร่งด่วน', soon: 'เร็วๆ นี้' }[key] || key);
const needReviewColor = (key) => ({ overdue: '#FF3B30', urgent: '#FFC107', soon: '#FF9500' }[key] || '#c7c7cc');


// Quick Actions based on role — include all relevant manage pages the user can access
const allManageActions = [
  { key: 'manage-admins', icon: 'officers', title: 'Manage Admins', desc: 'จัดการผู้ดูแลระบบ', link: '/manageadminuser', color: 'linear-gradient(135deg, #FF9500, #FFCC00)', allowed: ['superadmin','admin'] },
  { key: 'manage-orgs', icon: 'organizations', title: 'Manage Organizations', desc: 'จัดการองค์กร', link: '/manageorganizations', color: 'linear-gradient(135deg, #007AFF, #5AC8FA)', allowed: ['superadmin','admin'] },
  { key: 'manage-officers', icon: 'officers', title: 'Manage Officers', desc: 'จัดการเจ้าหน้าที่', link: '/manageofficers', color: 'linear-gradient(135deg, #34C759, #30D158)', allowed: ['superadmin','admin'] },
  { key: 'manage-categories', icon: 'categories', title: 'Manage Categories', desc: 'Manage Categories', link: '/managecategories', color: 'linear-gradient(135deg, #AF52DE, #BF5AF2)', allowed: ['admin','officer'] },
  { key: 'manage-qa', icon: 'qa', title: 'Manage Q&A', desc: 'Manage Question Answer', link: '/managequestionsanswers', color: 'linear-gradient(135deg, #007AFF, #5AC8FA)', allowed: ['admin','officer'] },
  { key: 'manage-ai', icon: 'ai', title: 'Manage AI Images', desc: 'จัดการรูปภาพ AI', link: '/manageaiimage', color: 'linear-gradient(135deg, #5856D6, #5AC8FA)', allowed: ['superadmin','admin'] },
  { key: 'managestopwords', icon: 'stopwords', title: 'Manage Stopwords', desc: 'จัดการ Stopwords', link: '/managestopwords', color: 'linear-gradient(135deg, #FF3B30, #FF7A7A)', allowed: ['officer'] },
  { key: 'managenegativekeywords', icon: 'negative', title: 'Manage Negative Keywords', desc: 'จัดการ Negative Keywords', link: '/managenegativekeywords', color: 'linear-gradient(135deg, #34C759, #6ee77a)', allowed: ['officer'] },
  { key: 'managesynonyms', icon: 'synonyms', title: 'Manage Synonyms', desc: 'จัดการคำพ้อง', link: '/managesynonyms', color: 'linear-gradient(135deg, #FF9500, #FFCC00)', allowed: ['officer'] },
  { key: 'manageranking', icon: 'ranking', title: 'Manage Ranking', desc: 'จัดการ Ranking', link: '/manageranking', color: 'linear-gradient(135deg, #007AFF, #5856D6)', allowed: ['officer'] },
  { key: 'ranking-simulator', icon: 'simulator', title: 'Ranking Simulator', desc: 'จำลอง Ranking', link: '/ranking-simulator', color: 'linear-gradient(135deg, #5856D6, #AF52DE)', allowed: ['officer'] }
];

const quickActions = computed(() => {
  const role = normalizedRole.value;
  // include manage actions that list current role in allowed
  return allManageActions.filter(a => (a.allowed || []).includes(role));
});

const fetchAll = async () => {
  try {
    console.time('fetchAll');
    // Fetch everything in parallel (original behavior) — preserve previous fast-loading perception
    const [cRes, qRes, kRes, fRes, chRes, cnRes, orgRes, offRes, handledRes, adminsRes] = await Promise.all([
      // Use public categories endpoint on the public dashboard (no auth required)
      $axios.get('/categories').catch(() => ({ data: { categories: [] } })),
      $axios.get('/questionsanswers').catch(() => ({ data: [] })),
      $axios.get('/keywords').catch(() => ({ data: [] })),
      $axios.get('/feedbacks').catch(() => ({ data: [] })),
      $axios.get('/getChatLogHasAnswers').catch(() => ({ data: [] })),
      $axios.get('/getChatLogNoAnswers').catch(() => ({ data: [] })),
      $axios.get('/organizations').then(r => r.data?.data || r.data || []).catch(() => ([])),
      $axios.get('/officers').then(r => r.data?.data || r.data || []).catch(() => ([])),
      $axios.get('/feedbacks/handled').catch(() => ({ data: [] })),
      $axios.get('/adminusers').catch(() => ({ data: [] })),
    ]);

    categories.value = cRes.data?.categories || cRes.data || [];
    questionsAnswers.value = qRes.data?.data || qRes.data || [];
    keywords.value = kRes.data?.data || kRes.data || [];
    feedbacks.value = fRes.data?.data || fRes.data || [];
    chatHas.value = chRes.data?.data || chRes.data || [];
    chatNo.value = cnRes.data?.data || cnRes.data || [];
    organizations.value = orgRes.data?.data || orgRes.data || [];
    officers.value = offRes.data?.data || offRes.data || [];
    handledFeedbacks.value = handledRes.data?.data || handledRes.data || [];
    admins.value = adminsRes.data?.data || adminsRes.data || adminsRes || [];

    // Normalize responses: some endpoints return object wrappers
    const normalize = (v) => {
      if (!v) return [];
      if (Array.isArray(v)) return v;
      // common wrapper fields
      for (const key of ['data','rows','result','users','items','list']) {
        if (Array.isArray(v[key])) return v[key];
      }
      // if object with numeric keys, convert to array
      if (typeof v === 'object') {
        const vals = Object.values(v).filter(x => Array.isArray(x));
        if (vals.length > 0) return vals[0];
      }
      return [];
    };

    organizations.value = normalize(organizations.value);
    officers.value = normalize(officers.value);
    handledFeedbacks.value = normalize(handledRes.data || handledRes) || [];
    admins.value = normalize(admins.value);
    // If current user is an admin, only show their own reports on the dashboard
    applyRoleFilter();
    console.timeEnd('fetchAll');
  } catch (e) {
    console.error('Failed to fetch dashboard data', e);
  }
};

// Helper: determine if an item belongs to current user (flexible field checks)
const belongsToCurrentUser = (item) => {
  if (!props.userInfo) return false;
  const user = props.userInfo || {};
  const candidates = [user.ID, user.Id, user.UserID, user.UserId, user.OfficerID, user.OfficerId, user.Username, user.Name];
  // string-safe comparisons
  for (const key of ['OwnerID','OwnerId','CreatedBy','created_by','UserID','UserId','OfficerID','OfficerId','username','Username','name','Name']) {
    if (item && Object.prototype.hasOwnProperty.call(item, key)) {
      const v = item[key];
      if (v == null) continue;
      for (const c of candidates) {
        if (c == null) continue;
        if (String(v) === String(c)) return true;
      }
    }
  }
  return false;
};

// Apply role-based filtering on the client for admin users only
const applyRoleFilter = () => {
  if (normalizedRole.value !== 'admin') return;
  // Keep only items that belong to the logged-in admin
  feedbacks.value = (feedbacks.value || []).filter(belongsToCurrentUser);
  chatHas.value = (chatHas.value || []).filter(belongsToCurrentUser);
  chatNo.value = (chatNo.value || []).filter(belongsToCurrentUser);
  questionsAnswers.value = (questionsAnswers.value || []).filter(belongsToCurrentUser);
  handledFeedbacks.value = (handledFeedbacks.value || []).filter(belongsToCurrentUser);
  // keywords and categories are likely global; keep as-is
};

// Helper: determine if a record is related to an admin (used by superadmin view)
const isAdminRelated = (item) => {
  if (!item) return false;
  // check explicit role/type fields
  for (const f of ['UserType','usertype','Role','role','Type','type']) {
    if (item[f] && String(item[f]).toLowerCase().includes('admin')) return true;
  }
  // check common admin id fields presence (if an org has an AdminID, consider it admin-related)
  for (const f of ['AdminID','AdminId','ManagerID','ManagerId','OwnerID','OwnerId']) {
    if (item[f]) return true;
  }
  // fallback: if there's a username that contains 'admin'
  for (const f of ['Username','username','Name','name']) {
    if (item[f] && String(item[f]).toLowerCase().includes('admin')) return true;
  }
  return false;
};

const organizationsForAdmin = computed(() => (organizations.value || []).filter(isAdminRelated));
const officersForAdmin = computed(() => (officers.value || []).filter(isAdminRelated));

// Computed counts: handle arrays, numbers, or wrapped objects from API
const makeCountGetter = (refValue) => computed(() => {
  const v = refValue.value;
  if (Array.isArray(v)) return v.length;
  if (typeof v === 'number') return v;
  if (v && typeof v === 'object') {
    if (typeof v.total === 'number') return v.total;
    if (typeof v.count === 'number') return v.count;
    if (typeof v.length === 'number') return v.length;
    for (const key of ['data','rows','items','list','users']) {
      if (Array.isArray(v[key])) return v[key].length;
    }
  }
  return 0;
});

// Separate admin vs superadmin lists so counts are not combined
const adminsList = computed(() => {
  const list = admins.value || [];
  return list.filter(u => {
    // Prefer explicit role fields when available
    const role = String(u.UserType || u.usertype || u.Role || u.role || u.Type || '').toLowerCase();
    if (role) return role.includes('admin') && !role.includes('super');
    // Fallback: use ParentAdminID convention (if ParentAdminID === AdminUserID => superadmin)
    if (u && (u.AdminUserID != null) && (u.ParentAdminID != null)) {
      return String(u.AdminUserID) !== String(u.ParentAdminID);
    }
    // If no distinguishing info, consider it an admin (safe default)
    return true;
  });
});

const superadminsList = computed(() => {
  const list = admins.value || [];
  return list.filter(u => {
    const role = String(u.UserType || u.usertype || u.Role || u.role || u.Type || '').toLowerCase();
    if (role) return role.includes('super');
    if (u && (u.AdminUserID != null) && (u.ParentAdminID != null)) {
      return String(u.AdminUserID) === String(u.ParentAdminID);
    }
    return false;
  });
});

const organizationsCount = makeCountGetter(organizations);
const officersCount = makeCountGetter(officers);
const adminsCount = computed(() => adminsList.value.length);
const superadminsCount = computed(() => superadminsList.value.length);

// Handled feedbacks for officer reports (defined after makeCountGetter)
const handledFeedbacks = ref([]);
const handledFeedbacksCount = makeCountGetter(handledFeedbacks);
const handledFeedbacksChart = computed(() => chartFromCount(handledFeedbacksCount.value, 'Handled Feedbacks', '#5856D6'));

// Need review breakdown for Q&A — split into Overdue / Urgent(<=7d) / Soon(<=30d)
const needReviewBreakdown = computed(() => {
  const list = questionsAnswers.value || [];
  const now = new Date();
  const counts = { overdue: 0, urgent: 0, soon: 0 };
  for (const q of list) {
    if (!q || !q.ReviewDate) continue;
    const rd = new Date(q.ReviewDate);
    if (isNaN(rd.getTime())) continue;
    const diffDays = Math.ceil((rd - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) counts.overdue++;
    else if (diffDays <= 7) counts.urgent++;
    else if (diffDays <= 30) counts.soon++;
  }
  return counts;
});
const needReviewCount = computed(() => {
  const b = needReviewBreakdown.value;
  return (b.overdue || 0) + (b.urgent || 0) + (b.soon || 0);
});
const needReviewChart = computed(() => {
  const b = needReviewBreakdown.value;
  const data = [b.overdue || 0, b.urgent || 0, b.soon || 0];
  const total = data.reduce((a, v) => a + v, 0);
  if (total === 0) return null; // no data -> don't render chart
  return {
    labels: ['เกินกำหนด','เร่งด่วน','เร็วๆ นี้'],
    datasets: [{ data, backgroundColor: ['#FF3B30','#FFC107','#FF9500'], realCounts: [b.overdue||0,b.urgent||0,b.soon||0] }]
  };
});

let unbindSidebarResize = null;
let _savedSidebarCollapsed = null;

const toggleSidebar = () => {
  console.log('toggleSidebar called, current isMobileSidebarOpen:', isMobileSidebarOpen.value);
  const sb = document.querySelector('.sidebar');
  const isOpen = !isMobileSidebarOpen.value;

  if (isOpen) {
    // Opening: save current collapsed state, force expand for mobile overlay
    _savedSidebarCollapsed = isSidebarCollapsed.value;
    isSidebarCollapsed.value = false;
    if (sb) sb.classList.remove('collapsed');
    document.body.classList.add('sidebar-open');
    document.body.classList.add('sidebar-mobile-expanded');
    isMobileSidebarOpen.value = true;
    console.log('Sidebar opened, body classes added');
  } else {
    // Closing: restore previous collapsed state and hide overlay
    isSidebarCollapsed.value = !!_savedSidebarCollapsed;
    if (sb && _savedSidebarCollapsed) sb.classList.add('collapsed');
    document.body.classList.remove('sidebar-open');
    document.body.classList.remove('sidebar-mobile-expanded');
    isMobileSidebarOpen.value = false;
    _savedSidebarCollapsed = null;
    console.log('Sidebar closed, body classes removed');
  }
};

onMounted(() => {
  unbindSidebarResize = bindSidebarResize();
  fetchAll();
});

onUnmounted(() => {
  if (typeof unbindSidebarResize === 'function') unbindSidebarResize();
  // Ensure mobile overlay is removed when leaving this view
  isMobileSidebarOpen.value = false;
  document.body.classList.remove('sidebar-open');
  document.body.classList.remove('sidebar-mobile-expanded');
});


</script>

<script>
// Add sidebar resize binding when used standalone (defensive)
import { onMounted, onUnmounted } from 'vue';
import { bindSidebarResize } from '@/stores/sidebarState';
import '@/assets/sidebar.css';

let _unbindSidebarResize = null;
onMounted(() => {
  try {
    _unbindSidebarResize = bindSidebarResize();
  } catch (e) {
    // ignore if called in a context where store isn't available
  }
});

onUnmounted(() => {
  if (typeof _unbindSidebarResize === 'function') _unbindSidebarResize();
});
</script>

<style scoped>
/* ========== Apple Design System ========== */
.apple-dashboard {
  --apple-blue: #007AFF;
  --apple-green: #34C759;
  --apple-orange: #FF9500;
  --apple-purple: #AF52DE;
  --apple-red: #FF3B30;
  --apple-gray: #8E8E93;
  --apple-light: #F5F5F7;
  --transition-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --transition-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  
  font-family: -apple-system, 'SF Pro Display', 'SF Pro Text', BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
  padding: 0;
  width: 100%;
  box-sizing: border-box;
  background: linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%);
  min-height: 100vh;
}

/* ========== Hero Section - Apple Style ========== */
.apple-hero {
  margin: 0 0 40px 0;
  padding: 32px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 24px;
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.04),
    0 1px 2px rgba(0, 0, 0, 0.02),
    inset 0 0 0 0.5px rgba(255, 255, 255, 0.8);
  position: relative;
  overflow: hidden;
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.hero-icon-wrap {
  flex-shrink: 0;
}

.hero-icon {
  filter: drop-shadow(0 4px 12px rgba(0, 122, 255, 0.25));
}

.hero-icon .hero-circle-bg {
  fill: none;
  stroke: #f0f0f5;
  stroke-width: 3;
}

.hero-icon .hero-circle-progress {
  fill: none;
  stroke: url(#heroGradient);
  stroke: var(--apple-blue);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 163.36;
  stroke-dashoffset: 163.36;
  animation: heroCircle 1.5s var(--transition-smooth) 0.3s forwards;
  transform-origin: center;
}

.hero-icon .hero-wave {
  fill: none;
  stroke: var(--apple-green);
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-dasharray: 60;
  stroke-dashoffset: 60;
  animation: heroWave 1s var(--transition-smooth) 0.8s forwards;
}

@keyframes heroCircle {
  to { stroke-dashoffset: 40; }
}

@keyframes heroWave {
  to { stroke-dashoffset: 0; }
}

.hero-text {
  flex: 1;
}

.apple-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 8px;
  color: #1d1d1f;
  letter-spacing: -0.5px;
  line-height: 1.1;
}

.apple-sub {
  margin: 0;
  color: #6e6e73;
  font-size: 17px;
  line-height: 1.4;
}

/* Role Badge */
.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 600;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.role-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 50%, rgba(255,255,255,0.4), transparent 60%);
  animation: roleGlow 3s ease-in-out infinite;
}

@keyframes roleGlow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.role-badge.superadmin {
  background: linear-gradient(135deg, #FFF5E6 0%, #FFEDCC 100%);
  color: #CC7A00;
  border: 1px solid rgba(255, 149, 0, 0.2);
}

.role-badge.admin {
  background: linear-gradient(135deg, #E8F4FF 0%, #D4E8FF 100%);
  color: #0066CC;
  border: 1px solid rgba(0, 122, 255, 0.2);
}

.role-badge.officer {
  background: linear-gradient(135deg, #E8FFF0 0%, #D4FFE8 100%);
  color: #00994D;
  border: 1px solid rgba(52, 199, 89, 0.2);
}

.role-icon-emoji {
  font-size: 20px;
}

/* ========== Stats Grid - Apple Style ========== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 40px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 
    0 2px 16px rgba(0, 0, 0, 0.04),
    0 1px 2px rgba(0, 0, 0, 0.02),
    inset 0 0 0 0.5px rgba(255, 255, 255, 0.9);
  transition: all 0.4s var(--transition-spring);
  cursor: pointer;
  position: relative;
  animation: statPop 0.6s var(--transition-spring) backwards;
  animation-delay: var(--delay, 0ms);
  text-decoration: none;
  color: inherit;
}

.stat-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.05),
    inset 0 0 0 0.5px rgba(255, 255, 255, 1);
}

.stat-icon-wrap {
  position: relative;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.stat-icon-glow {
  position: absolute;
  inset: -4px;
  border-radius: 20px;
  opacity: 0.25;
  filter: blur(8px);
  z-index: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover .stat-icon-glow {
  opacity: 0.4;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  color: #1d1d1f;
  line-height: 1;
  letter-spacing: -1px;
}

.stat-label {
  font-size: 13px;
  color: #6e6e73;
  font-weight: 500;
  margin-top: 4px;
}

.stat-arrow {
  color: #c7c7cc;
  transition: all 0.3s var(--transition-smooth);
  flex-shrink: 0;
}

.stat-card:hover .stat-arrow {
  color: var(--apple-blue);
  transform: translateX(4px);
}

@keyframes statPop {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* ========== Section Title ========== */
.section-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.section-icon {
  color: var(--apple-blue);
}

.section-icon .chart-bar {
  fill: var(--apple-blue);
  animation: barGrow 0.8s var(--transition-spring) backwards;
}

.section-icon .bar-1 { animation-delay: 0ms; }
.section-icon .bar-2 { animation-delay: 100ms; }
.section-icon .bar-3 { animation-delay: 200ms; }

@keyframes barGrow {
  from { transform: scaleY(0); transform-origin: bottom; }
  to { transform: scaleY(1); }
}

.section-icon .bolt-path {
  fill: none;
  stroke: var(--apple-orange);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 60;
  stroke-dashoffset: 60;
  animation: boltDraw 0.8s var(--transition-smooth) forwards;
}

@keyframes boltDraw {
  to { stroke-dashoffset: 0; }
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
  letter-spacing: -0.3px;
}

/* ========== Charts Section ========== */
.charts-section {
  margin-bottom: 40px;
}

.charts-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}

/* Report Pills */
.report-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.report-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 100px;
  color: var(--apple-blue);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s var(--transition-smooth);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.report-pill:hover {
  background: var(--apple-blue);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.25);
}

/* Mini Cards Grid */
.mini-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.mini-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  min-height: 220px;
  box-shadow: 
    0 2px 16px rgba(0, 0, 0, 0.04),
    0 1px 2px rgba(0, 0, 0, 0.02),
    inset 0 0 0 0.5px rgba(255, 255, 255, 0.9);
  transition: all 0.4s var(--transition-spring);
  animation: chartPop 0.6s var(--transition-spring) backwards;
  animation-delay: var(--delay, 0ms);
}

.mini-card:hover {
  transform: translateY(-6px);
  box-shadow: 
    0 16px 48px rgba(0, 0, 0, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.05);
}

.mini-card.featured-card {
  grid-column: span 2;
}

.mini-header {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.mini-dot {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  flex-shrink: 0;
}

.mini-title {
  font-weight: 600;
  color: #1d1d1f;
  font-size: 16px;
}

.mini-chart {
  width: 140px;
  height: 120px;
}

.mini-empty-donut {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  width: 140px;
}

.mini-counts {
  margin-top: 8px;
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: baseline;
  flex-wrap: wrap;
}

.mini-counts .count-label {
  font-size: 13px;
  color: #6e6e73;
}

.mini-counts .count-value {
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
}

.status-badge {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 70px;
}

.status-badge .dot {
  width: 16px;
  height: 16px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-badge .badge-label {
  font-size: 12px;
  color: #6e6e73;
}

.status-badge .badge-value {
  font-weight: 700;
  font-size: 18px;
  color: #1d1d1f;
}

.mini-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 14px;
  text-decoration: none;
  color: var(--apple-blue);
  background: linear-gradient(135deg, #E8F4FF 0%, #D4E8FF 100%);
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s var(--transition-smooth);
  border: 1px solid rgba(0, 122, 255, 0.1);
}

.mini-link:hover {
  background: var(--apple-blue);
  color: #ffffff;
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 20px rgba(0, 122, 255, 0.3);
}

.mini-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
  flex-wrap: wrap;
}

.chart-counts {
  display: flex;
  gap: 24px;
  margin-top: 12px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}

.count-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.count-label {
  font-size: 13px;
  color: #6e6e73;
}

.count-value {
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
}

@keyframes chartPop {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* ========== Quick Actions ========== */
.quick-actions {
  margin-bottom: 40px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: #ffffff;
  border-radius: 20px;
  text-decoration: none;
  box-shadow: 
    0 2px 16px rgba(0, 0, 0, 0.04),
    0 1px 2px rgba(0, 0, 0, 0.02),
    inset 0 0 0 0.5px rgba(255, 255, 255, 0.9);
  transition: all 0.4s var(--transition-spring);
  animation: actionPop 0.6s var(--transition-spring) backwards;
  animation-delay: var(--delay, 0ms);
}

.action-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 
    0 16px 48px rgba(0, 0, 0, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.05);
}

.action-icon-wrap {
  position: relative;
}

.action-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  color: white;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.action-icon-ring {
  position: absolute;
  inset: -3px;
  border-radius: 19px;
  background: var(--ring-color);
  opacity: 0;
  filter: blur(8px);
  z-index: 0;
  transition: opacity 0.3s ease;
}

.action-card:hover .action-icon-ring {
  opacity: 0.3;
}

.action-info {
  flex: 1;
  min-width: 0;
}

.action-title {
  font-size: 17px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.action-desc {
  font-size: 14px;
  color: #6e6e73;
}

.action-arrow-wrap {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f5f5f7;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s var(--transition-smooth);
}

.action-arrow {
  color: #c7c7cc;
  transition: all 0.3s var(--transition-smooth);
}

.action-card:hover .action-arrow-wrap {
  background: var(--apple-blue);
}

.action-card:hover .action-arrow {
  color: white;
  transform: translateX(2px);
}

@keyframes actionPop {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* ========== Transitions ========== */
.hero-enter-enter-active {
  animation: heroEnter 0.8s var(--transition-spring);
}

@keyframes heroEnter {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-slide-enter-active {
  animation: sectionSlide 0.6s var(--transition-smooth);
}

@keyframes sectionSlide {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-pop-enter-active {
  animation: statPop 0.6s var(--transition-spring) backwards;
}

.chart-pop-enter-active {
  animation: chartPop 0.6s var(--transition-spring) backwards;
}

/* Keep old transitions for compatibility */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s var(--transition-smooth);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.card-pop-enter-active {
  animation: statPop 0.5s var(--transition-spring) both;
}

.card-pop-leave-active {
  animation: statPop 0.3s var(--transition-smooth) reverse both;
}

/* ========== Mobile Sidebar Toggle ========== */
.mobile-sidebar-toggle.mobile-inline-toggle {
  display: none;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04);
  border: none;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  color: var(--apple-blue);
  transition: all 0.3s var(--transition-smooth);
  margin-bottom: 16px;
}

.mobile-sidebar-toggle.mobile-inline-toggle:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.mobile-sidebar-toggle.mobile-inline-toggle:active {
  transform: scale(0.95);
}

/* ========== Responsive ========== */
@media (max-width: 992px) {
  .mini-card.featured-card {
    grid-column: span 1;
  }
  
  .report-pills {
    width: 100%;
  }
  
  .charts-header {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .mobile-sidebar-toggle.mobile-inline-toggle {
    display: flex;
  }
  
  .apple-hero {
    padding: 20px;
    border-radius: 20px;
    margin-bottom: 24px;
  }
  
  .hero-content {
    flex-direction: column;
    text-align: center;
  }
  
  .apple-title {
    font-size: 28px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .stat-card {
    padding: 16px;
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .stat-arrow {
    display: none;
  }
  
  .stat-icon {
    width: 44px;
    height: 44px;
  }
  
  .stat-value {
    font-size: 26px;
  }
  
  .mini-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .section-title {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .apple-hero {
    padding: 16px;
  }
  
  .apple-title {
    font-size: 24px;
  }
  
  .stat-card {
    padding: 14px;
  }
  
  .stat-value {
    font-size: 22px;
  }
  
  .stat-label {
    font-size: 12px;
  }
  
  .report-pill {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>

<style>
/* Global overrides for mobile sidebar behavior on Dashboard */
@media (max-width: 768px) {
  /* Hide sidebar by default on mobile */
  .sidebar, .sidebar.collapsed {
    display: none !important;
  }

  /* Show sidebar when explicitly opened */
  body.sidebar-open .sidebar, 
  body.sidebar-mobile-expanded .sidebar {
    display: flex !important;
    flex-direction: column !important;
    position: fixed !important;
    left: 0; 
    top: 0; 
    bottom: 0;
    width: 280px !important;
    z-index: 2600 !important;
    background: #ffffff;
    box-shadow: 0 12px 50px rgba(0,0,0,0.15);
    transform: translateX(0) !important;
    transition: transform 280ms cubic-bezier(.22,.9,.33,1), opacity 180ms ease;
  }

  /* Ensure backdrop is visible */
  .mobile-sidebar-backdrop {
    position: fixed; 
    inset: 0; 
    background: rgba(0,0,0,0.3); 
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 2500;
  }
}
</style>
