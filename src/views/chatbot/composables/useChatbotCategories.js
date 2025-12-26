/**
 * Chatbot Categories Composable
 */
import { ref, computed } from 'vue'

export function useChatbotCategories() {
  const categories = ref([
    { title: 'ทุนการศึกษา', items: ['ทุนเรียนดี', 'ทุนความสามารถพิเศษ', 'ทุนสร้างชื่อเสียง'] },
    { title: 'หอพักนักศึกษา', items: ['ข้อมูลหอพัก', 'การสมัคร', 'กฎระเบียบ'] },
    { title: 'บริการนักศึกษา', items: ['แนะแนว', 'บริการสุขภาพ', 'บริการ IT'] }
  ])
  const openIndexes = ref([])
  const showAllCategories = ref(false)

  const displayedCategories = computed(() => {
    if (!categories.value || !Array.isArray(categories.value)) return []
    return showAllCategories.value ? categories.value : categories.value.slice(0, 3)
  })

  function toggle(index) {
    const idx = openIndexes.value.indexOf(index)
    if (idx === -1) openIndexes.value.push(index)
    else openIndexes.value.splice(idx, 1)
    saveCategoryState()
  }

  function saveCategoryState() {
    try { localStorage.setItem('chatbot_category_state', JSON.stringify(openIndexes.value)) } catch (e) {}
  }

  function loadCategoryState() {
    try {
      const saved = localStorage.getItem('chatbot_category_state')
      if (saved) openIndexes.value = JSON.parse(saved)
    } catch (e) { openIndexes.value = [] }
  }

  function setCategories(newCats) {
    if (newCats && newCats.length > 0) categories.value = newCats
  }

  function disableCategoryItemByLabel(label) {
    if (!label || !Array.isArray(categories.value)) return false
    for (let ci = 0; ci < categories.value.length; ci++) {
      const cat = categories.value[ci]
      if (!cat || !Array.isArray(cat.items)) continue
      for (let ii = 0; ii < cat.items.length; ii++) {
        const it = cat.items[ii]
        const itemLabel = (typeof it === 'string') ? it : (it.label || it.text || it)
        if (itemLabel === label) {
          categories.value[ci].items[ii] = { label: itemLabel, _disabled: true }
          try { localStorage.setItem('chatbot_categories_disabled', JSON.stringify(categories.value)) } catch (e) {}
          return true
        }
      }
    }
    return false
  }

  function restoreCategoriesDisabledState() {
    try {
      const saved = localStorage.getItem('chatbot_categories_disabled')
      if (!saved || !Array.isArray(categories.value)) return
      const savedCats = JSON.parse(saved)
      if (!Array.isArray(savedCats)) return
      const disabledLabels = new Set()
      savedCats.forEach(cat => {
        if (!cat || !Array.isArray(cat.items)) return
        cat.items.forEach(item => {
          if (item && typeof item === 'object' && item._disabled === true) {
            const label = item.label || item.text || item
            if (label) disabledLabels.add(label)
          }
        })
      })
      categories.value.forEach((cat, ci) => {
        if (!cat || !Array.isArray(cat.items)) return
        cat.items.forEach((item, ii) => {
          const itemLabel = (typeof item === 'string') ? item : (item.label || item.text || item)
          if (disabledLabels.has(itemLabel)) {
            categories.value[ci].items[ii] = { label: itemLabel, _disabled: true }
          }
        })
      })
    } catch (e) {}
  }

  function resetCategories() {
    try { localStorage.removeItem('chatbot_categories'); localStorage.removeItem('chatbot_categories_disabled') } catch (e) {}
    try {
      if (Array.isArray(categories.value)) {
        categories.value = categories.value.map(c => ({
          title: c.title,
          items: Array.isArray(c.items) ? c.items.map(it => (typeof it === 'string') ? it : (it.label || it.text || '')) : []
        }))
      }
    } catch (e) {}
    openIndexes.value = []
    saveCategoryState()
  }

  function getItemLabel(item) {
    if (!item) return ''
    return (typeof item === 'string') ? item : (item.label || item.text || '')
  }

  function isItemDisabled(item) {
    return (item && typeof item === 'object') ? item._disabled === true : false
  }

  return {
    categories, openIndexes, showAllCategories, displayedCategories,
    toggle, saveCategoryState, loadCategoryState, setCategories,
    disableCategoryItemByLabel, restoreCategoriesDisabledState, resetCategories,
    getItemLabel, isItemDisabled
  }
}
