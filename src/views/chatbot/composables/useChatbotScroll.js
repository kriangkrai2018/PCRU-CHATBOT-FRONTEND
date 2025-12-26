/**
 * Chatbot Scroll Composable
 */
import { ref } from 'vue'

export function useChatbotScroll() {
  const showScrollTop = ref(false)
  const anchorBottom = ref(true)
  const lastScrollTop = ref(0)

  function handleScroll(panelBody) {
    if (!panelBody) return
    const currentScrollTop = panelBody.scrollTop
    if (currentScrollTop < lastScrollTop.value && currentScrollTop > 100) showScrollTop.value = true
    else if (currentScrollTop <= 50) showScrollTop.value = false
    else if (currentScrollTop > lastScrollTop.value) showScrollTop.value = false
    lastScrollTop.value = currentScrollTop
  }

  function scrollToBottom(panelBody) {
    if (panelBody) panelBody.scrollTo({ top: panelBody.scrollHeight, behavior: 'smooth' })
  }

  function scrollToTop(panelBody) {
    if (panelBody) panelBody.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function updateAnchoring(panelBody) {
    if (!panelBody) return
    const buffer = 16
    anchorBottom.value = panelBody.scrollHeight <= (panelBody.clientHeight + buffer)
  }

  return { showScrollTop, anchorBottom, lastScrollTop, handleScroll, scrollToBottom, scrollToTop, updateAnchoring }
}
