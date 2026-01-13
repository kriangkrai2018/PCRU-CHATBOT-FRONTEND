import { ref } from 'vue'
import { apiRanking } from '@/plugins/apiRanking'
import { useChatbotScroll } from './useChatbotScroll'
import axios from 'axios'

// Helper function to strictly deduplicate contacts
const deduplicateContacts = (contacts) => {
  if (!contacts || !Array.isArray(contacts)) return [];
  
  const uniqueContactsMap = new Map();

  contacts.forEach(contact => {
    // 1. Clean data for comparison
    // Phone: Keep only digits
    const phoneProp = (contact.phone_number || contact.PhoneNumber || '').toString().replace(/\D/g, ''); 
    // URL: Lowercase, trim, remove trailing slash, remove query params
    const urlProp = (contact.url || contact.Url || contact.facebook_url || contact.FacebookURL || contact.website || contact.Website || '').toString().trim().toLowerCase().replace(/\/$/, '').split('?')[0];
    
    // Create keys for checking
    const keys = [];
    if (phoneProp) keys.push(`phone:${phoneProp}`);
    if (urlProp) keys.push(`url:${urlProp}`);

    // 2. Extract from 'Contact' string if API returns it
    const contactStr = (contact.Contact || '').toString();
    if (contactStr) {
        // Regex for landlines (02, 038, 056) and mobiles (08x)
        const phoneMatches = contactStr.match(/0(?:2|[3-9]\d)[-\s]?\d{3}[-\s]?\d{3,4}|0\d{2}[-\s]?\d{3}[-\s]?\d{4}/g);
        if (phoneMatches) {
            phoneMatches.forEach(p => keys.push(`phone:${p.replace(/\D/g, '')}`));
        }
        
        const urlMatches = contactStr.match(/https?:\/\/[^\s]+/g);
        if (urlMatches) {
            urlMatches.forEach(u => keys.push(`url:${u.trim().toLowerCase().replace(/\/$/, '').split('?')[0]}`));
        }
    }

    // 3. Fallback: Use name if no contact info
    if (keys.length === 0) {
        const name = (contact.CategoriesName || contact.organization || contact.Organization || '').toString().trim();
        if (name) keys.push(`name:${name}`);
    }

    // 4. Duplicate Check
    let isDuplicate = false;
    for (const key of keys) {
        if (uniqueContactsMap.has(key)) {
            isDuplicate = true;
            break;
        }
    }

    if (!isDuplicate && keys.length > 0) {
        keys.forEach(key => uniqueContactsMap.set(key, true));
        uniqueContactsMap.set(`obj_${uniqueContactsMap.size}`, contact); 
    }
  });

  return Array.from(uniqueContactsMap.values()).filter(v => typeof v === 'object');
}

export function useChatbotMessages() {
  const messages = ref([])
  const isBotTyping = ref(false)
  const sessionId = ref(null)
  const currentCategory = ref(null)
  
  const { scrollToBottom } = useChatbotScroll()

  const initWelcomeMessage = () => {
    // Logic moved to component
  }

  const sendMessage = async (text, categoryId = null) => {
    if (!text.trim()) return

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date()
    }
    messages.value.push(userMessage)
    scrollToBottom()

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
      
      // รับ sessionId จาก Backend (สำหรับโหมด AI)
      if (responseData.sessionId) {
        sessionId.value = responseData.sessionId
      }

      // 1. Filter Contacts (Categories Filter)
      let rawContacts = responseData.contacts || [];
      
      rawContacts = rawContacts.filter(contact => {
          // Check various name fields
          const name = (contact.CategoriesName || contact.CategoryName || contact.organization || contact.Organization || '').toString().trim();
          
          // Strict check for short names
          if (name === 'กยศ' || name === 'กยศ.') return false;
          
          // No other filters
          return true;
      });

      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: responseData.answer || 'ขออภัย ฉันไม่เข้าใจคำถามนี้',
        timestamp: new Date(),
        // 2. Call deduplicate function
        contacts: deduplicateContacts(rawContacts),
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

  const clearMessages = async () => {
    // 🔥 ลบ Gemini conversation history ถ้ามี sessionId
    if (sessionId.value) {
      try {
        console.log(`🗑️ Clearing Gemini conversation for session: ${sessionId.value}`)
        await axios.delete(`/api/gemini/conversation/${sessionId.value}`)
        console.log('✅ Gemini conversation cleared')
      } catch (error) {
        console.warn('⚠️ Failed to clear Gemini conversation:', error.message)
        // ไม่ throw error เพราะต้องการให้ clear local messages ต่อไปได้
      }
    }
    
    // ล้าง messages และ session ใน frontend
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
