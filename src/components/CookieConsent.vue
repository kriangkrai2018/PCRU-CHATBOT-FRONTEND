<template>
  <transition name="fade">
    <div v-if="visible" class="cookie-overlay" role="dialog" aria-modal="true" aria-label="Cookie consent">
      <div class="cookie-card">
        <div class="cookie-header">
          <h3>เราใช้คุกกี้</h3>
          <button class="cookie-close" @click="skipToContent" aria-label="ข้ามไปที่เนื้อหา">✕</button>
        </div>
        <div class="cookie-body">
          <p class="cookie-text"><strong>สรุป:</strong> เว็บไซต์นี้เก็บ "ประวัติการสนทนา" เพื่อให้บริการแชตทำงานต่อเนื่อง ใช้เพื่อปรับปรุงระบบและตรวจสอบคุณภาพ ไม่มีการใช้ข้อมูลเพื่อโฆษณาหรือส่งต่อให้บุคคลที่สาม</p>

          <div class="cookie-actions">
            <a class="btn policy" :href="privacyUrl" target="_blank" rel="noreferrer">ดูนโยบายความเป็นส่วนตัว</a>
            <button class="btn acknowledge" @click="skipToContent">ข้ามไปที่เนื้อหา</button>
          </div>
        </div>


      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const visible = ref(false) // shown on first visit when consent not recorded

const STORAGE_KEY = 'pcru_cookie_consent'
const privacyPath = '/privacy'

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const obj = JSON.parse(raw)
    if (typeof obj.storeChatHistory === 'boolean') prefs.storeChatHistory = obj.storeChatHistory
    return true
  } catch (e) {
    return false
  }
}

const privacyUrl = (typeof window !== 'undefined' && window.location.origin) ? (window.location.origin + privacyPath) : privacyPath

function save(persist = true, storeChat = true) {
  const obj = {
    storeChatHistory: !!storeChat,
    acceptedAt: Date.now()
  }
  if (persist) localStorage.setItem(STORAGE_KEY, JSON.stringify(obj))
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

onMounted(() => {
  const existed = loadPrefs()
  if (!existed) {
    // Show consent popup only when not previously set
    // Delay slightly so spinner and initial render are not affected
    setTimeout(() => { visible.value = true }, 120)
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
  /* dim & blur the background behind the modal */
  background: rgba(0,0,0,0.28);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  transition: background-color .18s ease, backdrop-filter .18s ease;
  /* ensure overlay blocks interaction with background */
  pointer-events: auto;
}
.cookie-card {
  width: min(720px, calc(100% - 32px)); background: linear-gradient(180deg,#fff,#fafafa); border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.24); padding: 18px; color: #111;
}
.cookie-header { display:flex; justify-content: space-between; align-items:center; }
.cookie-header h3 { margin:0; font-size:18px }
.cookie-close { background:transparent; border:none; font-size:18px; cursor:pointer }
.cookie-body { margin-top:12px }
.cookie-text { color:#444; margin-bottom:12px }
.cookie-actions { display:flex; gap:8px; }
.cookie-actions .btn { padding:10px 12px; border-radius:8px; cursor:pointer; border:1px solid rgba(0,0,0,0.06) }
.cookie-actions .accept { background:#8B4CB8; color:#fff; border: none }
.cookie-actions .deny { background:transparent }
.cookie-actions .manage { background:transparent }

.cookie-manage { margin-top:12px; border-top:1px solid #eee; padding-top:12px }
.manage-row { display:flex; gap:12px; align-items:flex-start }
.manage-row input { width:20px; height:20px }
.manage-row .label { font-weight:600 }
.manage-row .desc { color:#666; font-size:13px }
.manage-actions { margin-top:10px; display:flex; gap:8px }
.manage-actions .save { background:#8B4CB8; color:#fff; padding:8px 12px; border-radius:8px }
.manage-actions .cancel { background:transparent }

.fade-enter-active, .fade-leave-active { transition: opacity .15s ease }
.fade-enter-from, .fade-leave-to { opacity:0 }
</style>