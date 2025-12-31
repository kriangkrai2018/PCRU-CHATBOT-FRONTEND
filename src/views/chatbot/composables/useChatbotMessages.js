import { ref } from 'vue'
import { apiRanking } from '@/plugins/apiRanking'
import { useChatbotScroll } from './useChatbotScroll'

// Helper function to strictly deduplicate contacts
const deduplicateContacts = (contacts) => {
  if (!contacts || !Array.isArray(contacts)) return [];
  
  const uniqueContacts = [];
  const seenKeys = new Set();

  contacts.forEach(contact => {
    // 1. Prepare Key Components
    const phone = contact.phone_number ? contact.phone_number.replace(/\s|-/g, '') : '';
    const ext = contact.phone_extension ? contact.phone_extension.trim() : '';
    // Check for common URL fields
    const url = (contact.url || contact.facebook_url || contact.website || '').trim().toLowerCase();
    const org = contact.organization ? contact.organization.trim() : '';
    const officer = contact.officer_name ? contact.officer_name.trim() : '';

    // 2. Generate Unique Keys for checking
    // สร้าง Keys หลายแบบเพื่อดักจับความซ้ำทุกกรณี
    const keysToCheck = [];

    // Case A: มีเบอร์โทร (เช็คเบอร์ + เบอร์ต่อ)
    if (phone) {
        keysToCheck.push(`phone:${phone}|ext:${ext}`);
    }

    // Case B: มี URL (เช็ค URL ซ้ำ)
    if (url) {
        keysToCheck.push(`url:${url}`);
    }

    // Case C: Fallback ถ้าไม่มีทั้งเบอร์และ URL ให้เช็คชื่อหน่วยงาน + ชื่อเจ้าหน้าที่
    if (!phone && !url) {
        keysToCheck.push(`org:${org}|officer:${officer}`);
    }

    // 3. Check for duplicates
    // ถ้า Key ใด Key หนึ่งเคยเจอแล้ว ถือว่าเป็น "รายการซ้ำ" ทันที
    const isDuplicate = keysToCheck.some(key => seenKeys.has(key));

    if (!isDuplicate) {
      // ถ้าไม่ซ้ำ ให้เก็บรายการนี้ไว้ และบันทึก Keys ลงใน Set
      keysToCheck.forEach(key => seenKeys.add(key));
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

  const initWelcomeMessage = () => {
    // Logic moved to component or handled by initial API call
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
      const payload = {
        message: text,
        session_id: sessionId.value
      }
      
      if (categoryId) {
        payload.category_id = categoryId
        currentCategory.value = categoryId
      }

      const responseData = await apiRanking.getChatbotResponse(payload)
      
      if (responseData.session_id) {
        sessionId.value = responseData.session_id
      }

      // 5. Add Bot Message
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: responseData.answer || 'ขออภัย ฉันไม่เข้าใจคำถามนี้',
        timestamp: new Date(),
        // ใช้ฟังก์ชัน deduplicateContacts ที่ปรับปรุงแล้ว
        contacts: deduplicateContacts(responseData.contacts || []),
        related_questions: responseData.related_questions || [],
        confidence_score: responseData.confidence_score,
        intent: responseData.intent,
        pdf_url: responseData.pdf_url
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
