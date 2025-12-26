/**
 * Chatbot Tooltips Composable
 */
import { ref } from 'vue'

export function useChatbotTooltips(botPronoun) {
  const showUnlikeTooltip = ref(false)
  const unlikeTooltipText = ref('')
  let unlikeTooltipTimer = null
  const showLikeTooltip = ref(false)
  const likeTooltipText = ref('')
  let likeTooltipTimer = null
  const showUserTypingTooltip = ref(false)
  const userTypingTooltipText = ref('')
  const userTypingTooltipStyle = ref({})

  function getDynamicUnlikeMessages() {
    const p = botPronoun?.value || 'หนู'
    return [
      'อืมม... จะถามอะไรดีนะ 🤔', p + 'รอฟังอยู่นะคะ 👂✨', 'กำลังจะถามอะไรหรอคะ 😊',
      'เอ่อ... พิมพ์ช้าๆ ก็ได้นะคะ 🐌💕', p + 'พร้อมตอบแล้วค่ะ 💪✨', 'ถามอะไรมาเลยค่ะ 🙋‍♀️',
      'อ่า... น่าจะเป็นคำถามดีๆ นะ 👀', p + 'ตั้งใจฟังอยู่เลยค่ะ 🎧', 'เอ๊ะ... กำลังคิดคำถามอยู่หรอคะ 💭',
      'มีอะไรให้' + p + 'ช่วยดีคะ 🌸', 'ถามได้เลยนะคะ ไม่ต้องกลัว 😌', 'อืม... คำถามยากๆ หรือเปล่านะ 🧐'
    ]
  }

  function getDynamicLikeMessages() {
    const p = botPronoun?.value || 'หนู'
    return [
      'ขอบคุณนะคะ 💖✨', 'ยินดีมากเลยค่ะ 🥰', 'ดีใจที่ช่วยได้นะคะ 💜',
      'ขอบคุณที่ให้โอกาส' + p + 'ค่ะ 🌸', p + 'ดีใจมากเลย 😊💕', 'ขอบพระคุณค่ะ 🙏💫', 'ยินดีที่ได้ช่วยเหลือค่ะ 🌟'
    ]
  }

  function getDynamicWarningMessages() {
    const p = botPronoun?.value || 'หนู'
    return [
      'เอ่อ... กดบ่อยไปแล้วนะคะ 😅', 'แกล้ง' + p + 'หรอคะ 🙈💦', 'เลือกอันเดียวได้แล้วนะ 😂',
      p + 'งง... ชอบหรือไม่ชอบกันแน่คะ 🤔', 'ทำไมเปลี่ยนใจบ่อยจัง 😵', 'ขอแค่ครั้งเดียวได้มั้ยคะ 🥺', p + 'เหนื่อยแล้วค่ะ 😩💫'
    ]
  }

  function hideAllTooltips() {
    showUnlikeTooltip.value = false
    showLikeTooltip.value = false
    showUserTypingTooltip.value = false
    if (unlikeTooltipTimer) { clearTimeout(unlikeTooltipTimer); unlikeTooltipTimer = null }
    if (likeTooltipTimer) { clearTimeout(likeTooltipTimer); likeTooltipTimer = null }
  }

  function openTooltip(type) {
    hideAllTooltips()
    if (type === 'unlike') showUnlikeTooltip.value = true
    if (type === 'like') showLikeTooltip.value = true
    if (type === 'typing') showUserTypingTooltip.value = true
  }

  function showUnlikeTooltipMessage(delay = 400) {
    hideAllTooltips()
    const msgs = getDynamicUnlikeMessages()
    unlikeTooltipText.value = msgs[Math.floor(Math.random() * msgs.length)]
    setTimeout(() => {
      openTooltip('unlike')
      unlikeTooltipTimer = setTimeout(() => { showUnlikeTooltip.value = false; unlikeTooltipTimer = null }, 5000)
    }, delay)
  }

  function showLikeTooltipMessage(delay = 600) {
    hideAllTooltips()
    const msgs = getDynamicLikeMessages()
    likeTooltipText.value = msgs[Math.floor(Math.random() * msgs.length)]
    setTimeout(() => {
      openTooltip('like')
      likeTooltipTimer = setTimeout(() => { showLikeTooltip.value = false; likeTooltipTimer = null }, 4000)
    }, delay)
  }

  function showFeedbackWarning() {
    hideAllTooltips()
    const msgs = getDynamicWarningMessages()
    unlikeTooltipText.value = msgs[Math.floor(Math.random() * msgs.length)]
    setTimeout(() => {
      openTooltip('unlike')
      unlikeTooltipTimer = setTimeout(() => { showUnlikeTooltip.value = false; unlikeTooltipTimer = null }, 5000)
    }, 400)
  }

  function setUnlikeTooltipText(text) { unlikeTooltipText.value = text }

  function cleanup() {
    if (unlikeTooltipTimer) { clearTimeout(unlikeTooltipTimer); unlikeTooltipTimer = null }
    if (likeTooltipTimer) { clearTimeout(likeTooltipTimer); likeTooltipTimer = null }
  }

  return {
    showUnlikeTooltip, unlikeTooltipText, showLikeTooltip, likeTooltipText,
    showUserTypingTooltip, userTypingTooltipText, userTypingTooltipStyle,
    getDynamicUnlikeMessages, getDynamicLikeMessages, getDynamicWarningMessages,
    hideAllTooltips, openTooltip, showUnlikeTooltipMessage, showLikeTooltipMessage, showFeedbackWarning, setUnlikeTooltipText, cleanup
  }
}
