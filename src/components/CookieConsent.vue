<template>
  <!-- Overlay variant (used when not in chatbot route) -->
  <transition name="fade">
    <div v-if="visible && !inlineMode" class="cookie-overlay" role="dialog" aria-modal="true" aria-label="Cookie consent">
      <transition name="pop">
        <div class="cookie-card" v-show="visible" role="document">
          <div class="cookie-header">
            <h3>เราใช้คุกกี้</h3>
            <button class="cookie-close" @click="skipToContent" aria-label="ข้ามไปที่เนื้อหา">✕</button>
          </div>
          <div class="cookie-body">
            <p class="cookie-text"><strong>สรุป:</strong> เว็บไซต์นี้เก็บ "ประวัติการสนทนา" เพื่อให้บริการแชตทำงานต่อเนื่อง ใช้เพื่อปรับปรุงระบบและตรวจสอบคุณภาพ ไม่มีการใช้ข้อมูลเพื่อโฆษณาหรือส่งต่อให้บุคคลที่สาม</p>

            <div class="cookie-actions">
              <button class="btn policy" @click="openPrivacy">ดูนโยบายความเป็นส่วนตัว</button>
              <button class="btn acknowledge" @click="skipToContent">ข้ามไปที่เนื้อหา</button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>

  <!-- Inline variant: teleport into the chatbot panel when on the chatbot route -->
  <teleport to=".chat-panel" v-if="visible && inlineMode">
    <!-- Backdrop overlay with blur -->
    <div class="cookie-backdrop">
      <transition name="pop">
        <div class="cookie-inline" role="region" aria-label="Cookie consent (chat)">
          <div class="cookie-card cookie-card-inline" role="document">
            <div class="cookie-header">
              <h3>เราใช้คุกกี้</h3>
              <button class="cookie-close" @click="skipToContent" aria-label="ข้ามไปที่เนื้อหา">✕</button>
            </div>
            <div class="cookie-body">
              <p class="cookie-text"><strong>สรุป:</strong> เว็บไซต์นี้เก็บ "ประวัติการสนทนา" เพื่อให้บริการแชตทำงานต่อเนื่อง ใช้เพื่อปรับปรุงระบบและตรวจสอบคุณภาพ</p>
              <div class="cookie-actions">
                <button class="btn policy" @click="openPrivacy">ดูนโยบาย</button>
                <button class="btn acknowledge" @click="skipToContent">ข้าม</button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </teleport>

  <!-- Inline privacy panel (embedded into chat panel when on chatbot route) - full panel inside chat -->
  <teleport to=".chat-panel" v-if="showPrivacy && inlineMode">
    <transition name="slide-fade">
      <div class="privacy-inline" role="dialog" aria-modal="true" aria-label="Privacy policy (chat)">
        <div class="privacy-panel">
          <div class="privacy-panel-header">
            <h4>นโยบายความเป็นส่วนตัว</h4>
            <button class="privacy-panel-close" @click="closePrivacy" aria-label="ปิด">✕</button>
          </div>
          <div class="privacy-panel-body">
            <PrivacyPolicy :inModal="true" @close="closePrivacy" />
          </div>
        </div>
      </div>
    </transition>
  </teleport>

  <!-- Privacy modal (in-app, does not change route) -->
  <transition name="fade">
    <div v-if="showPrivacy" class="privacy-modal-overlay" role="dialog" aria-modal="true" aria-label="Privacy policy">
      <div class="privacy-modal">
        <button class="privacy-full-close" @click="closePrivacy" aria-label="ปิด" title="ปิด">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="privacy-modal-header">
          <h4>นโยบายความเป็นส่วนตัว</h4>
        </div>
        <div class="privacy-modal-body">
          <PrivacyPolicy :inModal="true" @close="closePrivacy" />
        </div>
      </div>
    </div>
  </transition> 
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import PrivacyPolicy from '@/views/PrivacyPolicy.vue'

// delay before showing popup (ms)
const SHOW_DELAY_MS = 320

// reactive prefs and visibility
const visible = ref(false) // shown on first visit when consent not recorded
const prefs = reactive({ storeChatHistory: true })
const showManage = ref(false)

const STORAGE_KEY = 'pcru_cookie_consent'
const privacyPath = '/privacy'

function loadPrefs() {
  // Try localStorage first, fallback to cookie if localStorage unavailable (private browsing)
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const obj = JSON.parse(raw)
      if (typeof obj.storeChatHistory === 'boolean') prefs.storeChatHistory = obj.storeChatHistory
      return true
    }
  } catch (e) {
    // ignore and fallthrough to cookie
  }

  try {
    const m = document.cookie.match('(?:^|;)\\s*' + STORAGE_KEY + '=([^;]+)')
    if (m) {
      const obj = JSON.parse(decodeURIComponent(m[1]))
      if (typeof obj.storeChatHistory === 'boolean') prefs.storeChatHistory = obj.storeChatHistory
      return true
    }
  } catch (e) {
    // ignore
  }

  return false
}

const privacyUrl = (typeof window !== 'undefined' && window.location.origin) ? (window.location.origin + privacyPath) : privacyPath

function setConsentInStorage(obj) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj))
    return true
  } catch (e) {
    // fallback: set as cookie for environments where localStorage is disabled
    try {
      document.cookie = `${STORAGE_KEY}=${encodeURIComponent(JSON.stringify(obj))}; path=/; max-age=${60*60*24*365}`
      return true
    } catch (e2) {
      return false
    }
  }
}

function save(persist = true, storeChat = true) {
  const obj = {
    storeChatHistory: !!storeChat,
    acceptedAt: Date.now()
  }
  if (persist) setConsentInStorage(obj)
}

function skipToContent() {
  // Persist acknowledgement; chat history is considered necessary
  save(true, true)
  visible.value = false
  // Move focus to app content (accessibility)
  setTimeout(() => {
    const app = document.getElementById('app')
    if (app) app.focus()
  }, 50)
}

function openManage() {
  showManage.value = true
}

function savePrefs() {
  // prefs.storeChatHistory is required and disabled, so just persist acknowledgement
  save(true)
  showManage.value = false
  visible.value = false
}

function cancelManage() {
  showManage.value = false
}

const route = useRoute()
const inlineMode = computed(() => route.name === 'chatbot')

onMounted(() => {
  const existed = loadPrefs()
  if (!existed) {
    // Show consent popup only when not previously set
    // Slight delay to avoid interfering with initial render (spinner)
    setTimeout(() => { visible.value = true }, SHOW_DELAY_MS)
  }
})

// In-app privacy modal (doesn't navigate away)
const showPrivacy = ref(false)
function openPrivacy() {
  showPrivacy.value = true
}
function closePrivacy() {
  showPrivacy.value = false
}

// Prevent page scroll when modal overlay is open (allow scroll when privacy is shown inline in chat)
watch(showPrivacy, (v) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = (v && !inlineMode.value) ? 'hidden' : ''
  }
})


</script>

<style scoped>
.cookie-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2200;
  /* lighter translucent overlay + stronger blur for gentle soft-focus */
  background: rgba(0,0,0,0.14);
  -webkit-backdrop-filter: blur(10px) saturate(120%);
  backdrop-filter: blur(10px) saturate(120%);
  transition: background-color .18s ease, backdrop-filter .18s ease;
  /* ensure overlay blocks interaction with background */
  pointer-events: auto;
} 
.cookie-card {
  width: min(720px, calc(100% - 32px));
  background: rgba(0, 0, 0, 0.748);
  color: var(--cb-text-primary);
  border-radius: 34px;
  box-shadow: var(--cb-shadow);
  padding: 18px;
  border: 1px solid var(--cb-border-color);
}

/* Inline variant placed inside chat panel */
.cookie-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cookie-inline { position: relative; z-index: 2100; pointer-events: auto }
.cookie-card-inline { width: 320px; padding: 25px; border-radius:34px }

@media (max-width: 640px) {
  .cookie-inline { margin-right: 10px; margin-left: 10px; top: auto; }
  .cookie-card-inline { width: auto }
}
.cookie-header { display:flex; justify-content: space-between; align-items:center; }
.cookie-header h3 { margin:0; font-size:18px; color: var(--cb-text-primary) }
.cookie-close { background:transparent; border:none; font-size:18px; cursor:pointer; color: var(--cb-icon-primary) }
[data-theme="dark"] .cookie-close { color: var(--cb-text-inverse) }
.cookie-body { margin-top:12px }
.cookie-text { color: var(--cb-text-secondary); margin-bottom:12px }
.cookie-actions { display:flex; gap:8px; }
.cookie-actions .btn { padding:10px 12px; border-radius:8px; cursor:pointer; border:1px solid var(--cb-border-color); background: var(--cb-bg-input); color: var(--cb-text-primary) }
.cookie-actions .policy { border-color: var(--cb-border-purple); color: var(--cb-accent-purple-1); background: transparent }
.cookie-actions .acknowledge { background: var(--cb-accent-purple-1); color: var(--cb-text-inverse); border: none }
.cookie-actions .btn:focus { outline: 3px solid rgba(139,76,184,0.08); outline-offset: 2px }

/* Dark mode overlay tweak */
[data-theme="dark"] .cookie-overlay { background: var(--cb-surface-dim-50); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px) }
[data-theme="dark"] .cookie-card { border-color: var(--cb-border-subtle); box-shadow: var(--cb-shadow-strong) }

.cookie-manage { margin-top:12px; border-top:1px solid #eee; padding-top:12px }
.manage-row { display:flex; gap:12px; align-items:flex-start }
.manage-row input { width:20px; height:20px }
.manage-row .label { font-weight:600 }
.manage-row .desc { color:#666; font-size:13px }
.manage-actions { margin-top:10px; display:flex; gap:8px }
.manage-actions .save { background:#8B4CB8; color:#fff; padding:8px 12px; border-radius:8px }
.manage-actions .cancel { background:transparent }

.fade-enter-active, .fade-leave-active { transition: opacity .18s ease }
.fade-enter-from, .fade-leave-to { opacity:0 }

/* Pop/scale transition for the card */
.pop-enter-active, .pop-leave-active { transition: transform .22s cubic-bezier(.2,.9,.24,1), opacity .22s cubic-bezier(.2,.9,.24,1) }
.pop-enter-from { transform: translateY(10px) scale(.992); opacity:0 }
.pop-enter-to { transform: translateY(0) scale(1); opacity:1 }
.pop-leave-from { transform: translateY(0) scale(1); opacity:1 }
.pop-leave-to { transform: translateY(6px) scale(.996); opacity:0 }

/* Privacy modal styles (full-screen, no padding) */
.privacy-modal-overlay { position: fixed; inset:0; display:flex; align-items:flex-start; justify-content:center; z-index: 2300; /* lighter translucent backdrop + stronger blur for soft-focus */ background: rgba(0,0,0,0.16); -webkit-backdrop-filter: blur(12px) saturate(120%); backdrop-filter: blur(12px) saturate(120%); transition: background-color .18s ease, backdrop-filter .18s ease; padding:0 }
.privacy-modal { width:100%; height:100vh; min-height:0; max-width:none; max-height:none; overflow:hidden; background: transparent; border-radius:0; box-shadow:none; color: var(--cb-text-primary); display:flex; flex-direction:column }
.privacy-modal-header { display:flex; justify-content:space-between; align-items:center; padding:22px 16px; border-bottom:1px solid var(--cb-border-color) }
.privacy-modal-body { padding:0; flex:1; overflow:auto; -webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior: contain; min-height:0 }
.privacy-modal-body .card { box-shadow:none; padding:0; background:transparent; margin:0; color: var(--cb-text-primary) }
.privacy-modal h4 { margin:0; font-size:16px }

/* Dark mode for privacy modal */
[data-theme="dark"] .privacy-modal-overlay { background: rgba(0,0,0,0.28); -webkit-backdrop-filter: blur(12px) saturate(120%); backdrop-filter: blur(12px) saturate(120%); }
[data-theme="dark"] .privacy-modal-header { border-bottom-color: var(--cb-border-subtle) }
[data-theme="dark"] .privacy-full-close { background: rgba(255,255,255,0.06); border-color: var(--cb-border-muted); color: var(--cb-text-inverse) }

/* Ensure modal content is high-contrast white in dark mode */
[data-theme="dark"] .privacy-modal-body .card { color: var(--cb-text-inverse); }
[data-theme="dark"] .privacy-modal-body .card h1,
[data-theme="dark"] .privacy-modal-body .card h2,
[data-theme="dark"] .privacy-modal-body .card h3,
[data-theme="dark"] .privacy-modal-body .card p,
[data-theme="dark"] .privacy-modal-body .card li { color: var(--cb-text-inverse); }
[data-theme="dark"] .privacy-modal-body .card .lead { color: rgba(255,255,255,0.92); }

/* Circular close in the top-right for full-screen modal */
.privacy-full-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
  cursor: pointer;
  z-index: 2350;
  color: #222; /* ensures svg stroke (currentColor) is visible */
  padding: 0;
}
.privacy-full-close svg { width: 14px; height: 14px; display: block }
.privacy-full-close svg path { stroke: currentColor; stroke-width: 2 }
.privacy-full-close:hover { background: #fff; box-shadow: 0 8px 20px rgba(0,0,0,0.16) }
.privacy-full-close:focus { outline: 3px solid rgba(139,76,184,0.12); outline-offset: 2px }
/* Inline privacy panel (embedded inside chat panel) */
.privacy-inline { position: absolute; inset: 0; z-index: 2150; display:block; background: transparent; }
.privacy-panel { width: 100%; height: 100%; background: var(--cb-bg-panel); border-radius: 0; padding: 0; box-shadow: none; border: none; display:flex; flex-direction:column }
.privacy-panel-header { display:flex; align-items:center; justify-content:space-between; padding: 14px 16px; border-bottom:1px solid var(--cb-border-color); background: linear-gradient(0deg, rgba(0,0,0,0.04), rgba(0,0,0,0.02)); }
.privacy-panel-header h4 { margin:0; font-size:16px }
.privacy-panel-body { flex:1; overflow:auto; -webkit-overflow-scrolling: touch; padding: 16px }
.privacy-panel-close { background: transparent; border: none; font-size: 18px; cursor:pointer; color: var(--cb-icon-primary) }

@media (max-width: 640px) {
  .privacy-panel-body { padding: 12px }
}</style>