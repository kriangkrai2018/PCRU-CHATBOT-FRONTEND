<template>
  <div class="icon-wrapper">
    <!-- Categories Icon -->
    <svg v-if="name === 'categories'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="dashboard-icon">
      <defs>
        <linearGradient id="gradCategories" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="currentColor" stop-opacity="1"/>
          <stop offset="100%" stop-color="currentColor" stop-opacity="0.6"/>
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="8" height="8" rx="2" stroke="url(#gradCategories)" stroke-width="1.5" class="icon-stroke"/>
      <rect x="13" y="3" width="8" height="8" rx="2" stroke="url(#gradCategories)" stroke-width="1.5" class="icon-stroke"/>
      <rect x="3" y="13" width="8" height="8" rx="2" stroke="url(#gradCategories)" stroke-width="1.5" class="icon-stroke"/>
      <rect x="13" y="13" width="8" height="8" rx="2" stroke="url(#gradCategories)" stroke-width="1.5" class="icon-stroke"/>
    </svg>

    <!-- Q&A Icon -->
    <svg v-else-if="name === 'qa'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="dashboard-icon">
      <defs>
        <linearGradient id="gradQA" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="currentColor" stop-opacity="1"/>
          <stop offset="100%" stop-color="currentColor" stop-opacity="0.6"/>
        </linearGradient>
      </defs>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="url(#gradQA)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon-stroke"/>
      <path d="M9 10h.01M15 10h.01" stroke="url(#gradQA)" stroke-width="1.5" stroke-linecap="round" class="icon-stroke"/>
    </svg>

    <!-- Keywords Icon -->
    <svg v-else-if="name === 'keywords'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="dashboard-icon">
      <defs>
        <linearGradient id="gradKeywords" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="currentColor" stop-opacity="1"/>
          <stop offset="100%" stop-color="currentColor" stop-opacity="0.6"/>
        </linearGradient>
      </defs>
      <path d="M12 2L15.09 8.26H22L17.09 12.74L19.18 18.97L12 15.24L4.82 18.97L6.91 12.74L2 8.26H8.91L12 2Z" stroke="url(#gradKeywords)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon-stroke"/>
    </svg>

    <!-- Feedbacks Icon -->
    <svg v-else-if="name === 'feedbacks'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="dashboard-icon">
      <defs>
        <linearGradient id="gradFeedbacks" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="currentColor" stop-opacity="1"/>
          <stop offset="100%" stop-color="currentColor" stop-opacity="0.6"/>
        </linearGradient>
      </defs>
      <path d="M14 9V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2M18 13v6a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-6M9 5h4" stroke="url(#gradFeedbacks)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon-stroke"/>
      <path d="M17 9h.01M21 9h.01" stroke="url(#gradFeedbacks)" stroke-width="1.5" stroke-linecap="round" class="icon-stroke"/>
    </svg>

    <!-- Answered Icon -->
    <svg v-else-if="name === 'answered'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="dashboard-icon">
      <defs>
        <linearGradient id="gradAnswered" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="currentColor" stop-opacity="1"/>
          <stop offset="100%" stop-color="currentColor" stop-opacity="0.6"/>
        </linearGradient>
      </defs>
      <path d="M20 6L9 17L4 12" stroke="url(#gradAnswered)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-stroke icon-check"/>
    </svg>

    <!-- No Answer Icon -->
    <svg v-else-if="name === 'noanswer'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="dashboard-icon">
      <defs>
        <linearGradient id="gradNoAnswer" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="currentColor" stop-opacity="1"/>
          <stop offset="100%" stop-color="currentColor" stop-opacity="0.6"/>
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="9" stroke="url(#gradNoAnswer)" stroke-width="1.5" class="icon-stroke"/>
      <path d="M12 8V12M12 16H12.01" stroke="url(#gradNoAnswer)" stroke-width="1.5" stroke-linecap="round" class="icon-stroke"/>
    </svg>

    <!-- Organizations Icon -->
    <svg v-else-if="name === 'organizations'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="dashboard-icon">
      <defs>
        <linearGradient id="gradOrganizations" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="currentColor" stop-opacity="1"/>
          <stop offset="100%" stop-color="currentColor" stop-opacity="0.6"/>
        </linearGradient>
      </defs>
      <path d="M3 21V7a2 2 0 0 1 2-2h7M3 21H21M3 21V7a2 2 0 0 0 2 2h14a2 2 0 0 1 2 2v12" stroke="url(#gradOrganizations)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon-stroke"/>
      <rect x="12" y="3" width="4" height="4" rx="1" stroke="url(#gradOrganizations)" stroke-width="1.5" class="icon-stroke"/>
    </svg>

    <!-- Officers Icon -->
    <svg v-else-if="name === 'officers'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="dashboard-icon">
      <defs>
        <linearGradient id="gradOfficers" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="currentColor" stop-opacity="1"/>
          <stop offset="100%" stop-color="currentColor" stop-opacity="0.6"/>
        </linearGradient>
      </defs>
      <path d="M17 21V19a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21V19a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M9 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" stroke="url(#gradOfficers)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon-stroke"/>
    </svg>

    <!-- AI Icon -->
    <svg v-else-if="name === 'ai'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="dashboard-icon">
      <defs>
        <linearGradient id="gradAI" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="currentColor" stop-opacity="1"/>
          <stop offset="100%" stop-color="currentColor" stop-opacity="0.6"/>
        </linearGradient>
      </defs>
      <circle cx="9" cy="9" r="2" stroke="url(#gradAI)" stroke-width="1.5" class="icon-dot"/>
      <circle cx="15" cy="9" r="2" stroke="url(#gradAI)" stroke-width="1.5" class="icon-dot"/>
      <path d="M12 15a3 3 0 0 1 2.5-2.94M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Z" stroke="url(#gradAI)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon-stroke"/>
    </svg>

    <!-- Stopwords Icon -->
    <svg v-else-if="name === 'stopwords'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="dashboard-icon">
      <defs>
        <linearGradient id="gradStopwords" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="currentColor" stop-opacity="1"/>
          <stop offset="100%" stop-color="currentColor" stop-opacity="0.6"/>
        </linearGradient>
      </defs>
      <rect x="4" y="5" width="16" height="4" rx="2" stroke="url(#gradStopwords)" stroke-width="1.5" class="icon-stroke"/>
      <rect x="4" y="11" width="16" height="4" rx="2" stroke="url(#gradStopwords)" stroke-width="1.5" class="icon-stroke"/>
      <rect x="4" y="17" width="10" height="4" rx="2" stroke="url(#gradStopwords)" stroke-width="1.5" class="icon-stroke"/>
    </svg>

    <!-- Patterns Icon -->
    <svg v-else-if="name === 'patterns'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="dashboard-icon">
      <defs>
        <linearGradient id="gradPatterns" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="currentColor" stop-opacity="1"/>
          <stop offset="100%" stop-color="currentColor" stop-opacity="0.6"/>
        </linearGradient>
      </defs>
      <path d="M4 6h16M4 12h16M4 18h16" stroke="url(#gradPatterns)" stroke-width="1.5" stroke-linecap="round" class="icon-stroke"/>
      <circle cx="6" cy="6" r="1.5" fill="url(#gradPatterns)" class="icon-dot"/>
      <circle cx="12" cy="12" r="1.5" fill="url(#gradPatterns)" class="icon-dot"/>
      <circle cx="18" cy="18" r="1.5" fill="url(#gradPatterns)" class="icon-dot"/>
    </svg>

    <!-- Synonyms Icon -->
    <svg v-else-if="name === 'synonyms'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="dashboard-icon">
      <defs>
        <linearGradient id="gradSynonyms" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="currentColor" stop-opacity="1"/>
          <stop offset="100%" stop-color="currentColor" stop-opacity="0.6"/>
        </linearGradient>
      </defs>
      <circle cx="7" cy="12" r="2" stroke="url(#gradSynonyms)" stroke-width="1.5" class="icon-stroke"/>
      <circle cx="12" cy="7" r="2" stroke="url(#gradSynonyms)" stroke-width="1.5" class="icon-stroke"/>
      <circle cx="17" cy="12" r="2" stroke="url(#gradSynonyms)" stroke-width="1.5" class="icon-stroke"/>
      <path d="M9 12h6" stroke="url(#gradSynonyms)" stroke-width="1.2" stroke-linecap="round" class="icon-stroke"/>
    </svg>

    <!-- Simulator Icon -->
    <svg v-else-if="name === 'simulator'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="dashboard-icon">
      <defs>
        <linearGradient id="gradSim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="currentColor" stop-opacity="1"/>
          <stop offset="100%" stop-color="currentColor" stop-opacity="0.6"/>
        </linearGradient>
      </defs>
      <path d="M12 2v4M12 18v4M4.2 4.2l2.8 2.8M17 17l2.8 2.8M2 12h4M18 12h4" stroke="url(#gradSim)" stroke-width="1.5" stroke-linecap="round" class="icon-stroke"/>
      <circle cx="12" cy="12" r="3" stroke="url(#gradSim)" stroke-width="1.5" class="icon-stroke"/>
    </svg>

    <!-- Admins Icon -->
    <svg v-else-if="name === 'admins'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="dashboard-icon">
      <defs>
        <linearGradient id="gradAdmins" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="currentColor" stop-opacity="1"/>
          <stop offset="100%" stop-color="currentColor" stop-opacity="0.6"/>
        </linearGradient>
      </defs>
      <path d="M12 2L14.2 7.5H20L15.4 11L17.6 16.5L12 13L6.4 16.5L8.6 11L4 7.5H9.8L12 2Z" stroke="url(#gradAdmins)" stroke-width="1.2" class="icon-stroke"/>
    </svg>

    <!-- Negative Icon (circle with X) -->
    <svg v-else-if="name === 'negative'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="dashboard-icon">
      <defs>
        <linearGradient id="gradNegative" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="currentColor" stop-opacity="1"/>
          <stop offset="100%" stop-color="currentColor" stop-opacity="0.6"/>
        </linearGradient>
      </defs>
      <!-- Outer circle -->
      <circle cx="12" cy="12" r="9" stroke="url(#gradNegative)" stroke-width="1.6" class="icon-stroke" />
      <!-- Cross / X inside circle -->
      <path d="M8 8 L16 16 M16 8 L8 16" stroke="url(#gradNegative)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="icon-stroke icon-cross"/>
    </svg>

    <!-- Ranking Icon -->
    <svg v-else-if="name === 'ranking'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="dashboard-icon">
      <defs>
        <linearGradient id="gradRanking" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="currentColor" stop-opacity="1"/>
          <stop offset="100%" stop-color="currentColor" stop-opacity="0.6"/>
        </linearGradient>
      </defs>
      <path d="M3 3h7v7H3V3ZM14 3h7v7h-7V3ZM3 14h7v7H3v-7ZM14 14h7v7h-7v-7Z" stroke="url(#gradRanking)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon-stroke"/>
    </svg>

    <!-- Fallback (generic square) -->
    <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="dashboard-icon">
      <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" stroke-width="1.5" class="icon-stroke"/>
      <rect x="8" y="8" width="8" height="8" rx="2" fill="currentColor" opacity="0.08"/>
    </svg>
  </div>
</template>

<script setup>
defineProps({
  name: { type: String, required: true }
});
</script>

<style scoped>
.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.dashboard-icon {
  width: 100%;
  height: 100%;
  color: inherit;
  animation: iconFloat 4s ease-in-out infinite;
}

/* Stroke Drawing Animation (use large dash to ensure full draw) */
.icon-stroke {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: dashDrawing 1.2s ease-out forwards, glowPulse 3s ease-in-out infinite 0.4s;
}

/* Dot Animation */
.icon-dot {
  opacity: 0.9;
  animation: glowPulse 3s ease-in-out infinite;
}

/* Check Mark Animation (shorter length) */
.icon-check {
  stroke-dasharray: 120;
  stroke-dashoffset: 120;
  animation: dashDrawing 0.9s ease-out 0.3s forwards, glowPulse 3s ease-in-out infinite 0.6s !important;
}

/* Hover Effect — emphasize with shimmer instead of stopping animation */
.dashboard-icon:hover {
  animation: iconFloat 1.6s ease-in-out infinite;
}

.dashboard-icon:hover .icon-stroke {
  animation: shimmerPulse 0.6s ease-out !important, glowPulse 1.6s ease-in-out infinite !important;
}

.dashboard-icon:hover .icon-dot {
  animation: shimmerPulse 0.6s ease-out !important, glowPulse 1.6s ease-in-out infinite !important;
}

/* ========================================
   KEY FRAME ANIMATIONS
   ======================================== */

@keyframes iconFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

@keyframes dashDrawing {
  from {
    stroke-dashoffset: 100;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes glowPulse {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

@keyframes shimmerPulse {
  0%, 100% {
    filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.2));
  }
  50% {
    filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.4));
  }
}
</style>
