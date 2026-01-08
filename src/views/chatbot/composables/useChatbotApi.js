/**
 * Chatbot API Composable
 * Handles all API calls for the chatbot
 */
import { ref } from 'vue'

export function useChatbotApi(axios) {
  const loading = ref(false)
  const loadError = ref('')

  /**
   * Send feedback to backend
   */
  async function sendFeedback(payload) {
    try {
      // Prefer axios (it attaches Authorization header and baseURL)
      if (axios && typeof axios.post === 'function') {
        const res = await axios.post('/chat/feedback', payload)
        return res.data
      }

      // Fallback to fetch if axios not provided
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${baseURL}/chat/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': (localStorage.getItem('userToken') ? `Bearer ${localStorage.getItem('userToken')}` : '') },
        body: JSON.stringify(payload)
      })
      const data = await response.json()
      return data
    } catch (err) {
      console.error('Feedback error:', err)
      return null
    }
  }

  /**
   * Send has-answer log to backend
   */
  async function sendHasAnswerLog(userQuery, questionId) {
    if (!userQuery || !axios || typeof axios.post !== 'function') return null
    const payload = {
      Timestamp: new Date().toISOString(),
      UserQuery: userQuery,
      Status: 1,
      QuestionsAnswersID: questionId || null
    }
    try {
      const response = await axios.post('/chat/logs/has-answer', payload)
      return response.data?.chatLogId || response.data?.ChatLogID || response.data?.id || null
    } catch (err) {
      console.warn('Failed to record has-answer log', err)
      return null
    }
  }

  /**
   * Send no-answer log to backend
   */
  async function sendNoAnswerLog(userQuery) {
    if (!userQuery || !axios || typeof axios.post !== 'function') return null
    const payload = {
      Timestamp: new Date().toISOString(),
      UserQuery: userQuery,
      Status: 0
    }
    try {
      const response = await axios.post('/chat/logs/no-answer', payload)
      return response.data?.chatLogId || response.data?.ChatLogID || response.data?.id || null
    } catch (err) {
      console.warn('Failed to record no-answer log', err)
      return null
    }
  }

  /**
   * Fetch categories from backend
   */
  async function fetchCategories(options = { onlySelfParent: false }) {
    // options.onlySelfParent - when true, only include rows where ParentCategoriesID === CategoriesID
    if (!axios) {
      loadError.value = 'axios plugin not available'
      return []
    }
    loading.value = true
    loadError.value = ''
    try {
      const res = await axios.get('/categories')
      let payload = res.data
      // support wrapper { categories: [...] } or { success: true, categories: [...], count: ... }
      if (payload && !Array.isArray(payload)) {
        if (Array.isArray(payload.categories)) {
          payload = payload.categories
        } else {
          console.error('Unexpected payload structure in useChatbotApi:', payload)
          throw new Error('Categories API returned unexpected structure. Expected array or object with categories array.')
        }
      }
      if (!Array.isArray(payload)) {
        console.error('Payload after processing in useChatbotApi:', payload)
        throw new Error('Unexpected categories response shape - payload is not an array')
      }
      if (payload.length && payload[0].hasOwnProperty('CategoriesID')) {
        return mapCategoriesFromSQL(payload, options)
      } else {
        return payload.map(c => {
          const title = c.title || c.name || c.category || 'Untitled'
          const subs = c.subcategories || c.children || c.items || c.options || []
          const items = Array.isArray(subs)
            ? subs.map(s => (typeof s === 'string' ? s : (s.title || s.name || s.label || 'Untitled')))
            : []
          return { title, items }
        })
      }
    } catch (err) {
      console.error('Failed to load categories from backend', err)
      loadError.value = err?.message || 'Failed to load categories'
      return []
    } finally {
      loading.value = false
    }
  }

  function mapCategoriesFromSQL(payload, options = { onlySelfParent: false }) {
    // options.onlySelfParent: when true, treat top-level only if ParentCategoriesID === CategoriesID
    const byId = {}
    const childrenByParent = {}
    payload.forEach(r => {
      const id = String(r.CategoriesID)
      const parentId = r.ParentCategoriesID == null ? null : String(r.ParentCategoriesID)
      const isTopLevel = options.onlySelfParent ? (parentId === id) : (!parentId || parentId === id)
      byId[id] = {
        id,
        title: r.CategoriesName || 'Untitled',
        parent: isTopLevel ? null : parentId,
        pdf: r.CategoriesPDF || null
      }
      if (parentId && parentId !== id) {
        if (!childrenByParent[parentId]) childrenByParent[parentId] = []
        childrenByParent[parentId].push(id)
      }
    })
    const mappedCategories = []
    Object.keys(byId).forEach(id => {
      const cat = byId[id]
      if (!cat.parent) {
        const children = childrenByParent[id] || []
        const items = children.map(childId => byId[childId].title)
        mappedCategories.push({ title: cat.title, items })
      }
    })
    return mappedCategories
  }

  /**
   * Send chat message to backend
   */
  async function sendChatMessage(payload) {
    if (!axios || typeof axios.post !== 'function') return { error: 'No backend available' }
    try {
      const res = await axios.post('/chat/respond', payload)
      return parseBackendResponse(res.data)
    } catch (err) {
      console.error('Chat API error', err)
      return { error: err.message || 'API Error' }
    }
  }

  function parseBackendResponse(data) {
    const result = {
      text: '', pdf: null, contacts: null, results: null, multipleResults: false,
      questionId: null, found: false, lowConfidence: false, needsClarification: false,
      confidenceLevel: null, verificationWarnings: [], suggestions: null
    }
    if (!data) {
      result.text = 'ขออภัยค่ะ ระบบมีปัญหา ลองอีกครั้งได้ไหมคะ?'
      return result
    }
    if (typeof data === 'string') { result.text = data; return result }
    if (data.lowConfidence) result.lowConfidence = true
    if (data.needsClarification) result.needsClarification = true
    if (data.confidenceLevel) result.confidenceLevel = data.confidenceLevel
    if (Array.isArray(data.verificationWarnings)) result.verificationWarnings = data.verificationWarnings
    if (Array.isArray(data.suggestions)) result.suggestions = data.suggestions
    const potentialResults = Array.isArray(data.results) ? data.results : (Array.isArray(data.alternatives) ? data.alternatives : null)
    if (potentialResults && potentialResults.length > 0) {
      result.questionId = potentialResults[0].id || null
      if (potentialResults.length > 1) {
        result.results = potentialResults
        result.multipleResults = true
        result.text = ''
      } else {
        const firstRes = potentialResults[0]
        result.pdf = extractPdfFromObject(firstRes)
        const resultTexts = potentialResults.map(r => typeof r === 'string' ? r : r.answer || r.message || r.text || r.title || '').filter(t => t && t.trim())
        if (resultTexts.length > 0) result.text = resultTexts.join('\n\n')
      }
    }
    if (!result.text) {
      result.text = data.message || data.text || data.answer || data.response || data.result || ''
      if (!result.text && data.data && typeof data.data === 'string') result.text = data.data
      if (!result.text && Array.isArray(data.messages) && data.messages.length > 0) result.text = data.messages.join('\n')
    }
    if (!result.pdf) {
      result.pdf = extractPdfFromObject(data)
      if (!result.pdf && Array.isArray(data.categories)) result.pdf = data.categories.map(c => extractPdfFromObject(c)).find(Boolean)
      if (!result.pdf && Array.isArray(data.attachments)) result.pdf = data.attachments.map(a => a && (a.pdf || a.url || a.link || a.href || a.file || a.path)).find(Boolean)
    }
    if (Array.isArray(data.contacts) && data.contacts.length) {
      // Map backend contact shape { organization, category, contact }
      result.contacts = data.contacts.map(c => ({
        organization: c.organization || c.org || c.department || '',
        category: c.category || c.CategoriesName || null,
        contact: c.contact || c.Contact || null
      }))
    }
    if (typeof data.found !== 'undefined') result.found = !!data.found
    if (data.questionId) result.questionId = data.questionId
    if (!result.text || result.text.trim() === '') {
      result.text = 'ดูเหมือนว่าคำถามนี้ยังเกินความสามารถของหนูค่ะ ลองติดต่อศูนย์บริการหรือลองระบุรายละเอียดเพิ่มเติมได้ไหมคะ?'
    }
    return result
  }

  function extractPdfFromObject(obj) {
    if (!obj) return null
    return obj.pdf || obj.pdfUrl || obj.attachment || obj.attachmentUrl || obj.categoriesPDF || obj.categoriesPdf || obj.fileUrl || obj.file || obj.url || null
  }

  async function fetchActiveBotImage() {
    if (!axios) return null
    try {
      const resp = await axios.get('/ai-image/active')
      if (resp?.data?.url) return resp.data.url + '?t=' + Date.now()
    } catch (e) {}
    return null
  }

  async function fetchBotPronoun() {
    if (!axios) return null
    try {
      const resp = await axios.get('/ai-image/bot-pronoun')
      if (resp?.data?.pronoun) return resp.data.pronoun
    } catch (e) {}
    return null
  }

  return {
    loading, loadError, sendFeedback, sendHasAnswerLog, sendNoAnswerLog,
    fetchCategories, sendChatMessage, parseBackendResponse, fetchActiveBotImage, fetchBotPronoun
  }
}
