import { ref } from 'vue'
import { apiRanking } from '@/plugins/apiRanking'
import { useChatbotScroll } from './useChatbotScroll'

// Helper function to deduplicate contacts
const deduplicateContacts = (contacts) => {
  if (!contacts || !Array.isArray(contacts)) return [];
  
  const uniqueContacts = [];
  const seen = new Set();

  contacts.forEach(contact => {
    // สร้าง key สำหรับเช็คความซ้ำ โดยใช้เบอร์โทรและเบอร์ต่อเป็นหลัก
    // ถ้าไม่มีเบอร์ ใช้ชื่อหน่วยงานแทน
    const phoneKey = contact.phone_number ? contact.phone_number.replace(/\s|-/g, '') : '';
    const extKey = contact.phone_extension ? contact.phone_extension.trim() : '';
    const nameKey = contact.organization ? contact.organization.trim() : '';
    const officerKey = contact.officer_name ? contact.officer_name.trim() : '';

    // สร้าง Unique String Key
    // กรณีเน้นเบอร์โทร: ถ้าเบอร์และเบอร์ต่อเหมือนกัน ถือว่าซ้ำ
    // กรณีไม่มีเบอร์: ถ้าชื่อหน่วยงานและชื่อเจ้าหน้าที่เหมือนกัน ถือว่าซ้ำ
    let uniqueKey = '';
    
    if (phoneKey) {
        uniqueKey = `phone:${phoneKey}|ext:${extKey}`;
    } else {
        uniqueKey = `org:${nameKey}|officer:${officerKey}`;
    }

    if (!seen.has(uniqueKey)) {
      seen.add(uniqueKey);
      uniqueContacts.push(contact);
    }
  });

  return uniqueContacts;
}

export function useChatbotMessages() {
  const messages = ref([])
  const isBotTyping = ref(false)
  const sessionId = ref(null)
  const currentCategory = ref(null)
  
  const { scrollToBottom } = useChatbotScroll()

  // Initialize welcome message
  const initWelcomeMessage = () => {
    // Check if we already have messages, if not add welcome
    if (messages.value.length === 0) {
      // Welcome logic handled in view usually, but we can set initial state here
    }
  }

  const sendMessage = async (text, categoryId = null) => {
    if (!text.trim()) return

    // 1. Add User Message
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date()
    }
    messages.value.push(userMessage)
    scrollToBottom()

    // 2. Set Loading
    isBotTyping.value = true

    try {
      // 3. Prepare Payload
      const payload = {
        message: text,
        session_id: sessionId.value
      }
      
      if (categoryId) {
        payload.category_id = categoryId
        currentCategory.value = categoryId
      }

      // 4. Call API
      const responseData = await apiRanking.getChatbotResponse(payload)
      
      // Update Session ID if new
      if (responseData.session_id) {
        sessionId.value = responseData.session_id
      }

      // 5. Add Bot Message
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: responseData.answer || 'ขออภัย ฉันไม่เข้าใจคำถามนี้',
        timestamp: new Date(),
        // Deduplicate contacts before assigning
        contacts: deduplicateContacts(responseData.contacts || []),
        related_questions: responseData.related_questions || [],
        confidence_score: responseData.confidence_score,
        intent: responseData.intent,
        pdf_url: responseData.pdf_url // Handle PDF link if present
      }

      messages.value.push(botMessage)
      scrollToBottom()

    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง',
        timestamp: new Date(),
        isError: true
      }
      messages.value.push(errorMessage)
      scrollToBottom()
    } finally {
      isBotTyping.value = false
    }
  }

  const clearMessages = () => {
    messages.value = []
    sessionId.value = null
    currentCategory.value = null
  }

  return {
    messages,
    isBotTyping,
    sendMessage,
    clearMessages,
    initWelcomeMessage
  }
}
