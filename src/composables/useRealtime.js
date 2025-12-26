import { inject, onMounted, onBeforeUnmount, ref } from 'vue'
import { createWebSocketConnection, WS_ENDPOINTS } from '@/config/websocket.js'

export function useRealtime(subscriptions = []) {
  const $axios = inject('$axios', null)
  const connections = []
  const statusMap = ref({})

  function connectOne(name, endpoint, onUpdate) {
    const conn = createWebSocketConnection(endpoint, {
      axios: $axios,
      onOpen: () => { statusMap.value[name] = true },
      onClose: () => { statusMap.value[name] = false },
      onError: () => { statusMap.value[name] = false },
      onMessage: (data) => {
        const type = (data?.type || '').toString().toLowerCase()
        const payload = data?.data || {}
        const action = (payload?.action || data?.action || '').toString().toLowerCase()
        const hasSignal = (
          type === 'update' || type === 'feedback_update' ||
          action === 'updated' || action === 'created' || action === 'deleted'
        )
        if (hasSignal && typeof onUpdate === 'function') onUpdate(data)
      },
      autoReconnect: true,
    })
    connections.push(conn)
  }

  onMounted(() => {
    subscriptions.forEach(sub => {
      if (!sub || !sub.name || !sub.endpoint || typeof sub.onUpdate !== 'function') return
      connectOne(sub.name, sub.endpoint, sub.onUpdate)
    })
  })

  onBeforeUnmount(() => {
    connections.forEach(c => { try { c.disconnect() } catch (_) {} })
  })

  return { statusMap }
}

export const REALTIME_ENDPOINTS = {
  feedbacks: WS_ENDPOINTS.FEEDBACKS,
  chatLogs: WS_ENDPOINTS.CHAT_LOGS,
  categories: WS_ENDPOINTS.CATEGORIES,
  keywords: WS_ENDPOINTS.KEYWORDS,
  questionsAnswers: WS_ENDPOINTS.QUESTIONS_ANSWERS,
}
