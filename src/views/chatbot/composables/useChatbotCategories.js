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
            const name = (cat.name || cat.title || cat.CategoriesName || '').toString().trim().toLowerCase();
            return !name.includes('กยศ');
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
