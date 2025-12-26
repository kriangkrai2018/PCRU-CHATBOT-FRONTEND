import { ref, watch } from 'vue';

// Default: if user previously set a preference (in localStorage) use it.
// Otherwise default to expanded (not collapsed) so the sidebar opens wide.
const initial = localStorage.getItem('sidebarCollapsed') !== null
  ? JSON.parse(localStorage.getItem('sidebarCollapsed'))
  : false;

export const isSidebarCollapsed = ref(initial);

// Dropdown states
const reportsOpenInitial = localStorage.getItem('sidebarReportsOpen') !== null ? JSON.parse(localStorage.getItem('sidebarReportsOpen')) : false;
const manageOpenInitial = localStorage.getItem('sidebarManageOpen') !== null ? JSON.parse(localStorage.getItem('sidebarManageOpen')) : false;
const rankingOpenInitial = localStorage.getItem('sidebarRankingOpen') !== null ? JSON.parse(localStorage.getItem('sidebarRankingOpen')) : false;

export const isReportsOpen = ref(reportsOpenInitial);
export const isManageOpen = ref(manageOpenInitial);
export const isRankingOpen = ref(rankingOpenInitial);

// persist changes for sidebar collapse
watch(isSidebarCollapsed, (val) => {
  try {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(val));
  } catch (e) {
    // ignore storage errors
  }
});

// persist changes for dropdowns
watch(isReportsOpen, (val) => {
  try {
    localStorage.setItem('sidebarReportsOpen', JSON.stringify(val));
  } catch (e) {
    // ignore storage errors
  }
});

watch(isManageOpen, (val) => {
  try {
    localStorage.setItem('sidebarManageOpen', JSON.stringify(val));
  } catch (e) {
    // ignore storage errors
  }
});

watch(isRankingOpen, (val) => {
  try {
    localStorage.setItem('sidebarRankingOpen', JSON.stringify(val));
  } catch (e) {
    // ignore storage errors
  }
});


// helper to bind resize handler and return unbind function
export function bindSidebarResize() {
  const handler = () => {
    // Only auto-change on resize if user hasn't explicitly chosen state.
    if (localStorage.getItem('sidebarCollapsed') === null) {
      isSidebarCollapsed.value = window.innerWidth < 768;
    }
  };
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}
