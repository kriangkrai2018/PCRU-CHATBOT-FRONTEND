/**
 * Chatbot Mutter Composable
 */
import { ref } from 'vue'
import { getRandomMutterByHour, replacePronoun } from '@/config/botMutterQuotes'

export function useChatbotMutter(botPronoun) {
  const showMutterTooltip = ref(false)
  const currentMutterText = ref('')
  const lastMutterSlot = ref(null)
  let mutterTimer = null
  let mutterIntervalId = null

  function getBotMutterText() {
    const text = currentMutterText.value || getRandomMutterByHour()
    return replacePronoun(text, botPronoun?.value || 'หนู')
  }

  function triggerMutter(hideAllTooltips) {
    currentMutterText.value = getRandomMutterByHour()
    if (hideAllTooltips) hideAllTooltips()
    showMutterTooltip.value = true
    if (mutterTimer) clearTimeout(mutterTimer)
    mutterTimer = setTimeout(() => { showMutterTooltip.value = false; mutterTimer = null }, 5000)
  }

  function checkMutterTime(isVisible) {
    const now = new Date()
    const bangkokTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))
    const hour = bangkokTime.getHours()
    const minute = bangkokTime.getMinutes()
    const slot = Math.floor(minute / 5) * 5
    const currentSlot = hour + ':' + slot.toString().padStart(2, '0')
    if (currentSlot !== lastMutterSlot.value) {
      lastMutterSlot.value = currentSlot
      if (isVisible) triggerMutter()
    }
  }

  function startMutterScheduler(getIsVisible) {
    checkMutterTime(getIsVisible())
    mutterIntervalId = setInterval(() => checkMutterTime(getIsVisible()), 10000)
  }

  function stopMutterScheduler() {
    if (mutterIntervalId) { clearInterval(mutterIntervalId); mutterIntervalId = null }
    if (mutterTimer) { clearTimeout(mutterTimer); mutterTimer = null }
  }

  function hideMutterTooltip() {
    showMutterTooltip.value = false
    if (mutterTimer) { clearTimeout(mutterTimer); mutterTimer = null }
  }

  return { showMutterTooltip, currentMutterText, getBotMutterText, triggerMutter, checkMutterTime, startMutterScheduler, stopMutterScheduler, hideMutterTooltip }
}
