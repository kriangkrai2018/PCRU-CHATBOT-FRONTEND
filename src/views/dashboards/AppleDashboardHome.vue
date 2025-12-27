<template>
  <div class="apple-dashboard container-fluid">
    <!-- Hero Section with Role-based greeting -->
    <transition name="fade-slide" appear>
      <div class="apple-hero">
        <h2 class="apple-title">{{ greetingText }}</h2>
        <p class="apple-sub">{{ roleDescription }}</p>
        <div class="role-badge" :class="roleBadgeClass">
          <span class="role-icon">{{ roleIcon }}</span>
          <span class="role-text">{{ roleLabel }}</span>
        </div>
      </div>
    </transition>

    <!-- Stats Overview - visible to all -->
    <transition-group name="card-pop" tag="div" class="stats-grid" appear>
      <div v-for="(stat, idx) in visibleStats" :key="stat.key" class="stat-card" :style="{ animationDelay: `${idx * 0.1}s` }">
        <div class="stat-icon" :style="{ background: stat.color }">
          <DashboardIcons :name="stat.icon" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </transition-group>

    <!-- Charts Section - Role based -->
    <transition name="fade-slide" appear>
      <div class="charts-section">
        <div class="charts-header">
          <h3 class="section-title">{{ chartsSectionTitle }}</h3>
          <div class="report-buttons">
            <router-link v-for="btn in reportButtons" :key="btn.key" :to="btn.link" class="report-btn">
              {{ btn.title }}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </router-link>
          </div>
        </div>
        <div class="mini-grid">
          <transition-group name="card-pop" appear v-if="normalizedRole === 'officer'">
            <div v-for="(card, idx) in visibleCards" :key="card.key" class="mini-card" :style="{ animationDelay: `${idx * 0.08}s` }">
              <div class="mini-title">{{ card.title }}</div>
              <div class="mini-chart">
                <template v-if="card.key === 'needReview'">
                  <div v-if="needReviewCount > 0">
                    <component :is="card.chartType" :chart-data="card.data" :options="chartOptions" />
                  </div>
                  <div v-else class="mini-empty-donut" aria-hidden="true" title="No data">
                    <div class="empty-ring"></div>
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

          <div v-else class="mini-card">
            <div class="mini-title">{{ mainChartTitle }}</div>
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

    <!-- Quick Actions - Role based -->
    <transition name="fade-slide" appear>
      <div v-if="quickActions.length > 0" class="quick-actions">
        <h3 class="section-title">Quick Actions</h3>
        <div class="actions-grid">
          <router-link v-for="(action, idx) in quickActions" :key="action.key" :to="action.link" class="action-card" :style="{ animationDelay: `${idx * 0.1}s` }">
            <div class="action-icon" :style="{ background: action.color }">
              <DashboardIcons :name="action.icon" />
            </div>
            <div class="action-info">
              <div class="action-title">{{ action.title }}</div>
              <div class="action-desc">{{ action.desc }}</div>
            </div>
            <svg class="action-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </router-link>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue';
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
    case 'officer': return 'ดูรายงานและจัดการคำถาม-คำตอบ';
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
    { key: 'categories', icon: 'categories', label: 'Categories', value: categories.value.length, color: 'linear-gradient(135deg, #007AFF, #5AC8FA)' },
    { key: 'qa', icon: 'qa', label: 'Q&A', value: questionsAnswers.value.length, color: 'linear-gradient(135deg, #34C759, #30D158)' },
    { key: 'keywords', icon: 'keywords', label: 'Keywords', value: keywords.value.length, color: 'linear-gradient(135deg, #FF9500, #FFCC00)' },
    { key: 'feedbacks', icon: 'feedbacks', label: 'Feedbacks', value: feedbacks.value.length, color: 'linear-gradient(135deg, #AF52DE, #BF5AF2)' },
    { key: 'chatHas', icon: 'answered', label: 'Answered', value: chatHas.value.length, color: 'linear-gradient(135deg, #5856D6, #AF52DE)' },
    { key: 'chatNo', icon: 'noanswer', label: 'No Answer', value: chatNo.value.length, color: 'linear-gradient(135deg, #FF3B30, #FF9500)' },
    { key: 'organizations', icon: 'organizations', label: 'Organizations', value: organizationsCount.value, color: 'linear-gradient(135deg, #007AFF, #5AC8FA)' },
    { key: 'officers', icon: 'officers', label: 'Officers', value: officersCount.value, color: 'linear-gradient(135deg, #34C759, #30D158)' },
  ];

  switch (normalizedRole.value) {
    case 'superadmin':
      // Superadmin: show counts separated for Admins and Super Admins
      return [
        { key: 'admins', icon: 'officers', label: 'Admins', value: adminsCount.value, color: 'linear-gradient(135deg, #FF9500, #FFCC00)' },
        { key: 'superadmins', icon: 'officers', label: 'Super Admins', value: superadminsCount.value, color: 'linear-gradient(135deg, #FF3B30, #FF7A7A)' },
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
    const v = f.FeedbackValue == null ? 'Other' : (f.FeedbackValue === 1 ? 'Like' : (f.FeedbackValue === 0 ? 'Unlike' : String(f.FeedbackValue))); 
    counts[v] = (counts[v]||0)+1; 
  });
  return { labels: Object.keys(counts), datasets: [{ data: Object.values(counts), backgroundColor: ['#34C759','#FF3B30','#FFC107','#6e6e73'] }] };
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

// Helpers for needReview labels and colors
const needReviewLabel = (key) => ({ overdue: 'เกินกำหนด', urgent: 'เร่งด่วน', soon: 'เร็วๆ นี้' }[key] || key);
const needReviewColor = (key) => ({ overdue: '#FF3B30', urgent: '#FFC107', soon: '#FF9500' }[key] || '#c7c7cc');


// Quick Actions based on role — include all relevant manage pages the user can access
const allManageActions = [
  { key: 'manage-admins', icon: 'officers', title: 'Manage Admins', desc: 'จัดการผู้ดูแลระบบ', link: '/manageadminuser', color: 'linear-gradient(135deg, #FF9500, #FFCC00)', allowed: ['superadmin','admin'] },
  { key: 'manage-orgs', icon: 'organizations', title: 'Manage Organizations', desc: 'จัดการองค์กร', link: '/manageorganizations', color: 'linear-gradient(135deg, #007AFF, #5AC8FA)', allowed: ['superadmin','admin'] },
  { key: 'manage-officers', icon: 'officers', title: 'Manage Officers', desc: 'จัดการเจ้าหน้าที่', link: '/manageofficers', color: 'linear-gradient(135deg, #34C759, #30D158)', allowed: ['superadmin','admin'] },
  { key: 'manage-categories', icon: 'categories', title: 'Manage Categories', desc: 'จัดการหมวดหมู่', link: '/managecategories', color: 'linear-gradient(135deg, #AF52DE, #BF5AF2)', allowed: ['admin','officer'] },
  { key: 'manage-qa', icon: 'qa', title: 'Manage Q&A', desc: 'จัดการคำถาม-คำตอบ', link: '/managequestionsanswers', color: 'linear-gradient(135deg, #007AFF, #5AC8FA)', allowed: ['admin','officer'] },
  { key: 'manage-ai', icon: 'ai', title: 'Manage AI Images', desc: 'จัดการรูปภาพ AI', link: '/manageaiimage', color: 'linear-gradient(135deg, #5856D6, #5AC8FA)', allowed: ['superadmin','admin'] },
  { key: 'managethaipatterns', icon: 'patterns', title: 'Manage Thai Patterns', desc: 'จัดการแพตเทิร์นภาษาไทย', link: '/managethaipatterns', color: 'linear-gradient(135deg, #FFCC00, #FF9500)', allowed: ['officer'] },
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
      $axios.get('/getcategories').catch(() => ({ data: { categories: [] } })),
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

    categories.value = cRes.data?.categories || [];
    questionsAnswers.value = qRes.data || [];
    keywords.value = kRes.data || [];
    feedbacks.value = fRes.data || [];
    chatHas.value = chRes.data || [];
    chatNo.value = cnRes.data || [];
    organizations.value = orgRes.data || [];
    officers.value = offRes.data || [];
    admins.value = Array.isArray(adminsRes.data) ? adminsRes.data : (Array.isArray(adminsRes) ? adminsRes : []);

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

onMounted(() => { fetchAll(); });


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
.apple-dashboard {
  font-family: -apple-system, 'SF Pro Display', 'SF Pro Text', Roboto, 'Helvetica Neue', Arial, sans-serif;
  padding: 0; /* let parent .main-content provide gutter */
  width: 100%;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .apple-home { padding: 0 12px; }
}

/* Hero Section */
.apple-hero {
  margin: 0 0 32px 0;
  padding-top: 0; /* remove extra top padding so content aligns with sidebar */
}

.apple-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px;
  color: #1d1d1f;
  letter-spacing: -0.5px;
}

.apple-sub {
  margin: 0 0 16px;
  color: #6e6e73;
  font-size: 17px;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.role-badge.superadmin {
  background: linear-gradient(135deg, rgba(255, 149, 0, 0.15), rgba(255, 204, 0, 0.15));
  color: #FF9500;
}

.role-badge.admin {
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.15), rgba(90, 200, 250, 0.15));
  color: #007AFF;
}

.role-badge.officer {
  background: linear-gradient(135deg, rgba(52, 199, 89, 0.15), rgba(48, 209, 88, 0.15));
  color: #34C759;
}

.role-icon {
  font-size: 18px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: white;
  flex-shrink: 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
  line-height: 1.1;
}

.stat-label {
  font-size: 13px;
  color: #6e6e73;
  font-weight: 500;
}

/* Section Title */
.section-title {
  font-size: 22px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 20px;
  letter-spacing: -0.3px;
}

/* Charts Section */
.charts-section {
  margin-bottom: 32px;
}

/* Report Buttons */
.report-buttons {
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* Report link tweaks */
.report-btn {
  padding-right: 0 !important;
  margin-right: 0 !important;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #007AFF;
  text-decoration: underline;
  background: transparent;
}

.mini-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.mini-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  min-height: 200px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.mini-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.mini-title {
  font-weight: 600;
  color: #1d1d1f;
  font-size: 15px;
}

.mini-chart {
  width: 140px;
  height: 120px;
}

/* Empty placeholder for mini donut when no data */
.mini-empty-donut {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  width: 140px;
}
.mini-empty-donut .empty-ring {
  width: 86px;
  height: 86px;
  border-radius: 50%;
  border: 12px solid rgba(0,0,0,0.04);
  box-sizing: border-box;
}
.mini-counts {
  margin-top: 8px;
  display: flex;
  gap: 18px;
  justify-content: center;
  align-items: baseline;
}
.mini-counts .count-label {
  font-size: 13px;
  color: #6e6e73;
}
.mini-counts .count-value {
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
}
.status-badge {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 68px;
}
.status-badge .dot {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  box-shadow: 0 1px 0 rgba(0,0,0,0.08);
}
.status-badge .badge-label {
  font-size: 12px;
  color: #6e6e73;
}
.status-badge .badge-value {
  font-weight: 700;
  font-size: 16px;
}

.mini-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 12px;
  text-decoration: none;
  color: #007AFF;
  background: rgba(0, 122, 255, 0.08);
  font-weight: 600;
  font-size: 14px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.mini-link:hover {
  background: #007AFF;
  color: #ffffff;
  transform: scale(1.02);
}

.mini-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
}
.chart-counts {
  display: flex;
  gap: 18px;
  margin-top: 12px;
  align-items: center;
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
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
}


/* Quick Actions */
.quick-actions {
  margin-bottom: 32px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #ffffff;
  border-radius: 16px;
  text-decoration: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.action-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.action-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
}

.action-info {
  flex: 1;
  min-width: 0;
}

.action-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.action-desc {
  font-size: 13px;
  color: #6e6e73;
}

.action-arrow {
  color: #c7c7cc;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.action-card:hover .action-arrow {
  transform: translateX(4px);
  color: #007AFF;
}

/* Apple-style Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
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
  animation: cardPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.card-pop-leave-active {
  animation: cardPop 0.3s cubic-bezier(0.4, 0, 0.2, 1) reverse both;
}

@keyframes cardPop {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .apple-title {
    font-size: 26px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .mini-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
  
  .stat-value {
    font-size: 22px;
  }
}
</style>
