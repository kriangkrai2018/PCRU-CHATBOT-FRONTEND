import { ref } from 'vue'
import { apiRanking } from '@/plugins/apiRanking'
import { getCategoryIcon } from '@/config/categoryIcons'

export function useChatbotCategories() {
  const categories = ref([])
  const isCategoriesLoading = ref(false)

  const fetchCategories = async () => {
    isCategoriesLoading.value = true
    try {
      const response = await apiRanking.getRanking()
      
      // หมวดหมู่ที่ไม่ต้องการให้แสดง (ใช้ keywords สำหรับ partial match)
      const hiddenKeywords = [
        "ข่าว",
        "กยศ",
        "ช่องทางการติดต่อ",
        "ชั่วโมงจิตอาสา",
        "สถานะผู้กู้",
        "ห้องคอมพิวเตอร์"
      ];

      // กรองข้อมูล: รับเฉพาะรายการที่มีอยู่จริงและไม่อยู่ในรายการ hiddenKeywords
      if (response && response.data) {
        // กรณี response.data เป็น Array โดยตรง
        let rawCategories = Array.isArray(response.data) ? response.data : [];
        
        // กรณี response.data ซ้อนอยู่ใน object อื่น (เผื่อไว้)
        if (!rawCategories.length && response.data.categories) {
            rawCategories = response.data.categories;
        }

        categories.value = rawCategories
          .filter(cat => {
            const name = (cat.name || cat.title || '').toString().trim().toLowerCase();
            return !hiddenKeywords.some(keyword => name.includes(keyword.toLowerCase()));
          })
          .map(cat => ({
            ...cat,
            icon: getCategoryIcon(cat.name) || 'fas fa-folder' // Map ไอคอน
          }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      isCategoriesLoading.value = false
    }
  }

  return {
    categories,
    isCategoriesLoading,
    fetchCategories
  }
}
