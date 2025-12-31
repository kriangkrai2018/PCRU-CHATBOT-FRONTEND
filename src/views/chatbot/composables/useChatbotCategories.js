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
      
      // หมวดหมู่ที่ไม่ต้องการให้แสดง
      const hiddenCategories = [
        "ข่าวกยศ",
        "ช่องทางการติดต่อ กยศ", 
        "ชั่วโมงจิตอาสา กยศ",
        "สถานะผู้กู้ กยศ",
        "ห้องคอมพิวเตอร์"
      ];

      // กรองข้อมูล: รับเฉพาะรายการที่มีอยู่จริงและไม่อยู่ในรายการ hiddenCategories
      if (response && response.data) {
        // กรณี response.data เป็น Array โดยตรง
        let rawCategories = Array.isArray(response.data) ? response.data : [];
        
        // กรณี response.data ซ้อนอยู่ใน object อื่น (เผื่อไว้)
        if (!rawCategories.length && response.data.categories) {
            rawCategories = response.data.categories;
        }

        categories.value = rawCategories
          .filter(cat => {
            const name = cat.name || cat.title || ''; // ตรวจสอบชื่อ field ที่ใช้อาจเป็น name หรือ title
            return !hiddenCategories.some(hidden => name.includes(hidden));
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
