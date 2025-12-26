/**
 * Chatbot Settings Composable
 */
import { ref } from 'vue'
import { getBotAvatar } from '@/config/botConfig'

export function useChatbotSettings() {
  const masterEnabled = ref(true)
  const snowEnabled = ref(true)
  const particleEnabled = ref(true)
  const shadowEnabled = ref(true)
  const animationEnabled = ref(true)
  const isWinterSeason = ref(false)
  const botAvatar = ref(null)
  const botName = ref('ปลายฟ้า')
  const botPronoun = ref(import.meta.env.VITE_BOT_PRONOUN || 'หนู')
  const userType = ref('')
  const drawerWidth = ref('400px')

  function checkWinterSeason() {
    const month = new Date().getMonth() + 1
    isWinterSeason.value = month === 11 || month === 12 || month === 1 || month === 2
  }

  function loadEffectsSettings() {
    try {
      const savedMaster = localStorage.getItem('chatbot_master_enabled')
      const savedSnow = localStorage.getItem('chatbot_snow_enabled')
      const savedParticle = localStorage.getItem('chatbot_particle_enabled')
      const savedShadow = localStorage.getItem('chatbot_shadow_enabled')
      const savedAnimation = localStorage.getItem('chatbot_animation_enabled')
      if (savedMaster !== null) masterEnabled.value = savedMaster === 'true'
      if (savedSnow !== null) snowEnabled.value = savedSnow === 'true'
      if (savedParticle !== null) particleEnabled.value = savedParticle === 'true'
      if (savedShadow !== null) shadowEnabled.value = savedShadow === 'true'
      if (savedAnimation !== null) animationEnabled.value = savedAnimation === 'true'
      if (savedMaster === 'false') {
        snowEnabled.value = false; particleEnabled.value = false
        shadowEnabled.value = false; animationEnabled.value = false
        document.body.classList.add('no-effects')
      }
      if (savedShadow === 'false' || savedMaster === 'false') document.body.classList.add('no-shadows')
    } catch (e) {}
  }

  function initBotAvatar() {
    const storedUserType = localStorage.getItem('userType')
    if (storedUserType) {
      userType.value = storedUserType
      botAvatar.value = getBotAvatar(storedUserType)
    } else {
      botAvatar.value = getBotAvatar()
    }
    try {
      const aiImageUrl = localStorage.getItem('aiImageUrl')
      if (aiImageUrl) botAvatar.value = aiImageUrl
    } catch (e) {}
  }

  function setBotAvatar(url) { if (url) botAvatar.value = url }
  function loadBotName() {
    try {
      const saved = localStorage.getItem('botName')
      if (saved) botName.value = saved
    } catch (e) {}
  }
  function setBotPronoun(p) { if (p) botPronoun.value = p }

  function computeTimeGreeting() {
    const formatter = new Intl.DateTimeFormat('th-TH', { timeZone: 'Asia/Bangkok', hour: 'numeric', hour12: false })
    const hour = Number(formatter.format(new Date()))
    if (hour >= 5 && hour < 11) return 'สวัสดีตอนเช้า ☀️ ขอให้วันนี้สดใสจัง'
    if (hour >= 11 && hour < 13) return 'สวัสดีตอนเที่ยง 🍚 อย่าลืมพักทานข้าวนะคะ'
    if (hour >= 13 && hour < 17) return 'สวัสดีตอนบ่าย 🌤 รีเฟรชพลังแล้วลุยกันต่อ'
    if (hour >= 17 && hour < 20) return 'สวัสดีตอนเย็น 🌇 วันนี้เป็นไงบ้างคะ'
    if (hour >= 20 && hour < 23) return 'สวัสดีตอนค่ำ 🌙 พักผ่อนสายตาบ้างนะ'
    return 'สวัสดีดึกแล้ว 💤 อย่าลืมพักผ่อนให้เพียงพอนะคะ'
  }

  return {
    masterEnabled, snowEnabled, particleEnabled, shadowEnabled, animationEnabled,
    isWinterSeason, botAvatar, botName, botPronoun, userType, drawerWidth,
    checkWinterSeason, loadEffectsSettings, initBotAvatar, setBotAvatar, loadBotName, setBotPronoun, computeTimeGreeting
  }
}
