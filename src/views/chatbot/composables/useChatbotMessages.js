/**
 * Chatbot Messages Composable
 * Handles message logic, history, and pagination
 */
import { ref, computed } from 'vue'

export function useChatbotMessages() {
  const messages = ref([])
  const suggestionVisibleCounts = ref({})

  function saveChatHistory() {
    try {
      localStorage.setItem('chatbot_messages', JSON.stringify(messages.value))
    } catch (error) {
      console.error('Failed to save chat history:', error)
    }
  }

  function loadChatHistory() {
    try {
      const savedMessages = localStorage.getItem('chatbot_messages')
      if (savedMessages) {
        messages.value = JSON.parse(savedMessages)
        return true
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
      messages.value = []
    }
    return false
  }

  function clearChatHistory() {
    messages.value = []
    localStorage.removeItem('chatbot_messages')
  }

  function addUserMessage(text) {
    messages.value.push({ type: 'user', text, timestamp: new Date().toISOString() })
    saveChatHistory()
    return messages.value.length - 1
  }

  function addBotTypingMessage() {
    messages.value.push({ type: 'bot', text: '', typing: true })
    saveChatHistory()
    return messages.value.length - 1
  }

  function updateBotMessage(index, data) {
    if (messages.value[index] && messages.value[index].type === 'bot') {
      const msg = messages.value[index]
      msg.typing = false
      msg.text = data.text || ''
      msg.timestamp = new Date().toISOString()
      if (data.pdf) msg.pdf = data.pdf
      if (data.contacts) msg.contacts = data.contacts
      if (data.results) msg.results = data.results
      if (data.multipleResults) msg.multipleResults = true
      if (data.questionId) msg.questionId = data.questionId
      if (data.found !== undefined) msg.found = data.found
      if (data.lowConfidence) msg.lowConfidence = true
      if (data.needsClarification) msg.needsClarification = true
      if (data.confidenceLevel) msg.confidenceLevel = data.confidenceLevel
      if (data.verificationWarnings?.length) msg.verificationWarnings = data.verificationWarnings
      if (data.suggestions) msg.suggestions = data.suggestions
      if (data.chatLogId) msg.chatLogId = data.chatLogId
      if (!msg.feedback) msg.feedback = null
      saveChatHistory()
    }
  }

  function setBotMessageError(index, errorText) {
    if (messages.value[index]) {
      messages.value[index].typing = false
      messages.value[index].text = errorText
      messages.value[index].timestamp = new Date().toISOString()
      saveChatHistory()
    }
  }

  function getVisibleSuggestions(msg) {
    if (!msg || !msg.results) return []
    const msgIndex = messages.value.indexOf(msg)
    const visibleCount = suggestionVisibleCounts.value[msgIndex] || 5
    return msg.results.slice(0, visibleCount)
  }

  function getVisibleCount(msg) {
    const msgIndex = messages.value.indexOf(msg)
    return suggestionVisibleCounts.value[msgIndex] || 5
  }

  function loadMoreSuggestions(msg) {
    const msgIndex = messages.value.indexOf(msg)
    const currentCount = suggestionVisibleCounts.value[msgIndex] || 5
    suggestionVisibleCounts.value[msgIndex] = currentCount + 5
    saveChatHistory()
  }

  function markSuggestionSelected(msg, item) {
    if (!item) return
    item._disabled = true
    item._selected = true
    saveChatHistory()
  }

  function updateMessageFeedback(msg, feedback, animation = null) {
    if (!msg) return
    msg.feedback = feedback
    if (animation) msg._anim = animation
    saveChatHistory()
    if (animation) {
      setTimeout(() => { if (msg) msg._anim = null }, 600)
    }
  }

  function getOriginalQueryForMessage(botMsg) {
    if (!botMsg) return ''
    const botIdx = messages.value.indexOf(botMsg)
    if (botIdx <= 0) return ''
    for (let i = botIdx - 1; i >= 0; i--) {
      if (messages.value[i] && messages.value[i].type === 'user') {
        return messages.value[i].text || ''
      }
    }
    return ''
  }

  function findMatchedSuggestion(userMessage) {
    for (const m of messages.value) {
      if (!m || !m.results || !Array.isArray(m.results)) continue
      for (const r of m.results) {
        const title = (typeof r === 'string') ? r : (r.title || r.name || r.question || '')
        if (title && title.trim() === userMessage) return r
      }
    }
    return null
  }

  const lastBotMessageIndex = computed(() => {
    if (!messages.value || messages.value.length === 0) return -1
    for (let i = messages.value.length - 1; i >= 0; i--) {
      if (messages.value[i].type === 'bot') return i
    }
    return -1
  })

  const hasBotMessages = computed(() => lastBotMessageIndex.value >= 0)

  const latestBotMessage = computed(() => {
    if (lastBotMessageIndex.value < 0) return null
    return messages.value[lastBotMessageIndex.value]
  })

  return {
    messages, suggestionVisibleCounts, saveChatHistory, loadChatHistory, clearChatHistory,
    addUserMessage, addBotTypingMessage, updateBotMessage, setBotMessageError,
    getVisibleSuggestions, getVisibleCount, loadMoreSuggestions, markSuggestionSelected,
    updateMessageFeedback, getOriginalQueryForMessage, findMatchedSuggestion,
    lastBotMessageIndex, hasBotMessages, latestBotMessage
  }
}
