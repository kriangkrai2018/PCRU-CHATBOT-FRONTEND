import { createRouter, createWebHistory } from 'vue-router'
import ChatbotView from '../views/ChatbotView.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import ManageQuestionsAnswers from '@/views/manage/ManageQuestionsAnswers.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'chatbot',
      component: ChatbotView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    // === Report Pages (แยกแต่ละ report) ===
    {
      path: '/reports/categories',
      name: 'report-categories',
      component: () => import('@/views/reports/CategoriesReportView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['officer'] }
    },
    {
      path: '/reports/questionsanswers',
      name: 'report-questionsanswers',
      component: () => import('@/views/reports/QuestionsAnswersReportView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['officer'] }
    },
    {
      path: '/reports/questions-need-review',
      name: 'report-questions-need-review',
      component: () => import('@/views/reports/QuestionsNeedReviewReportView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['officer'] }
    },
    {
      path: '/reports/keywords',
      name: 'report-keywords',
      component: () => import('@/views/reports/KeywordsReportView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['officer'] }
    },
    {
      path: '/reports/chatlog-has-answers',
      name: 'report-chatlog-has-answers',
      component: () => import('@/views/reports/ChatLogHasAnswersReportView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['officer'] }
    },
    {
      path: '/reports/feedbacks',
      name: 'report-feedbacks',
      component: () => import('@/views/reports/FeedbacksReportView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['officer'] }
    },
    {
      path: '/reports/chatlog-no-answers',
      name: 'report-chatlog-no-answers',
      component: () => import('@/views/reports/ChatLogNoAnswersReportView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['officer'] }
    },
    {
      path: '/reports/feedbacks-handled',
      name: 'report-feedbacks-handled',
      component: () => import('@/views/reports/HandledFeedbacksReportView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['officer'] }
    },
    {
      path: '/managethaipatterns',
      name: 'managethaipatterns',
      component: () => import('@/views/manage/ManageThaiPatterns.vue'),
      meta: { requiresAuth: true, allowedRoles: ['officer'] } // Only Officer can access
    },
    {
      path: '/managestopwords',
      name: 'managestopwords',
      component: () => import('@/views/manage/ManageStopwords.vue'),
      meta: { requiresAuth: true, allowedRoles: ['officer'] } // Only Officer can access
    },
    {
      path: '/managenegativekeywords',
      name: 'managenegativekeywords',
      component: () => import('@/views/manage/ManageNegativeKeywords.vue'),
      meta: { requiresAuth: true, allowedRoles: ['officer'] } // Only Officer can access
    },
    {
      path: '/managesynonyms',
      name: 'managesynonyms',
      component: () => import('@/views/manage/ManageSynonyms.vue'),
      meta: { requiresAuth: true, allowedRoles: ['officer'] } // Only Officer can access
    },
    {
      path: '/manageranking',
      name: 'manageranking',
      component: () => import('@/views/manage/ManageRanking.vue'),
      meta: { requiresAuth: true, allowedRoles: ['officer'] }
    },
    {
      path: '/ranking-simulator',
      name: 'ranking-simulator',
      component: () => import('@/views/manage/ManageRankingSimulator.vue'),
      meta: { requiresAuth: true, allowedRoles: ['officer'] }
    },
    {
      path: '/about-system',
      name: 'about-system',
      component: () => import('@/views/manage/AboutSystemView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['officer'] }
    },
    {
      path: '/manageaiimage',
      name: 'manageaiimage',
      component: () => import('@/views/manage/aiimage/index.vue'),
      meta: { requiresAuth: true, allowedRoles: ['admin', 'officer'] } // Admin and Officer can access
    },
    {
      path: '/managebotpronoun',
      name: 'managebotpronoun',
      component: () => import('@/views/manage/aiimage/ManageBotPronoun.vue'),
      meta: { requiresAuth: true, allowedRoles: ['admin', 'officer'] }
    },
    {
      path: '/managegoogleaccount',
      name: 'managegoogleaccount',
      component: () => import('@/views/manage/ManageGoogleAccountView.vue'),
      meta: { requiresAuth: true } // All logged in users can access
    },
    {
      path: '/manageadminuser',
      name: 'manageadminuser',
      component: () => import('@/views/manage/ManageAdminUserView.vue'),
      meta: { requiresAuth: true } // Protected route
    },
    {
      path: '/manageorganizations',
      name: 'manageorganizations',
      component: () => import('@/views/manage/ManageOrganizationsView.vue'),
      meta: { requiresAuth: true } // Protected route
    },
    {
      path: '/manageofficers',
      name: 'manageofficers',
      component: () => import('@/views/manage/ManageOfficersView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/managecategories',
      component: () => import('@/views/manage/ManageCategoriesView.vue')
    },
    {
      path: '/managequestionsanswers',
      name: 'ManageQuestionsAnswers',
      component: ManageQuestionsAnswers,
      // meta: { ... } // optional
    },
    // --- Nested Routes สำหรับหน้า Authentication ---
    {
      path: '/',
      component: AuthLayout,
      redirect: '/login', // ถ้าเข้า path '/' ให้ไปที่ /login
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('../views/LoginView.vue')
        },
        {
          path: 'forgotpassword',
          name: 'forgotpassword',
          component: () => import('../views/ForgotpasswordView.vue')
        },
        {
          path: 'checkemail',
          name: 'checkemail',
          component: () => import('../views/CheckemailView.vue')
        },
        {
          path: 'setnewpassword',
          name: 'setnewpassword',
          component: () => import('../views/SetnewpasswordView.vue')
        }
      ]
    },
    // Google OAuth Callback route (outside AuthLayout)
    {
      path: '/auth/google/callback',
      name: 'google-callback',
      component: () => import('../views/GoogleCallbackView.vue')
    },
    {
      path: '/passwordupdated',
      name: 'passwordupdated',
      // You can create a simple component for "Password Updated" or just redirect
      redirect: '/login' // Redirect to login page after successful password update
      // Or, if you prefer a dedicated page:
      // component: () => import('../views/PasswordUpdatedConfirmation.vue') 
    }
  ],
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = localStorage.getItem('userToken');

  if (requiresAuth && !isAuthenticated) {
    console.log("Access blocked: Redirecting to login.");
    next({ name: 'login' }); 
  } else {
    next();
  }
});


router.beforeEach((to, from, next) => {
    
    if (to.meta.requiresResetFlow) {
        
        const isFlowActive = sessionStorage.getItem('resetFlowActive');

        if (isFlowActive === 'true') {
            next();
        } else {
            next({ name: 'forgotpassword' });
        }

    } else {
        next();
    }
});

export default router