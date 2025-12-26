// Category Icon Configuration
// แก้ไขไฟล์นี้เพื่อเพิ่ม/แก้ไข icon pattern หรือเพิ่ม icon ใหม่

export const iconKeywords = {
  news: ['ข่าว', 'news', 'ประกาศ', 'announcement'],
  money: ['ทุน', 'scholarship', 'เงิน', 'money', 'ค่าใช้จ่าย'],
  user: ['บริการ', 'นักศึกษา', 'service', 'student', 'สมาชิก'],
  building: ['หอพัก', 'ที่พัก', 'บ้าน', 'ห้อง', 'room', 'dorm', 'house', 'residence', 'พัก'],
  book: ['การศึกษา', 'หลักสูตร', 'วิชา', 'education', 'course', 'curriculum', 'สอน'],
  phone: ['ติดต่อ', 'สอบถาม', 'contact', 'call', 'โทร'],
  clipboard: ['รับสมัคร', 'สมัคร', 'application', 'register', 'ลงทะเบียน'],
  calendar: ['อบรม', 'กิจกรรม', 'event', 'training', 'activity', 'ปฏิทิน', 'กำหนดการ']
}

export const iconSvgs = {
  news: `<svg class="cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect class="news-paper" x="4" y="5" width="16" height="16" rx="2" stroke="white" stroke-width="2" stroke-dasharray="60" stroke-dashoffset="60">
      <animate attributeName="stroke-dashoffset" to="0" dur="0.5s" fill="freeze"/>
    </rect>
    <line class="news-line-1" x1="7" y1="9" x2="17" y2="9" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="10" stroke-dashoffset="10">
      <animate attributeName="stroke-dashoffset" to="0" dur="0.3s" begin="0.2s" fill="freeze"/>
    </line>
    <line class="news-line-2" x1="7" y1="13" x2="13" y2="13" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="6" stroke-dashoffset="6">
      <animate attributeName="stroke-dashoffset" to="0" dur="0.3s" begin="0.3s" fill="freeze"/>
    </line>
    <line class="news-line-3" x1="7" y1="16" x2="17" y2="16" stroke="white" stroke-width="1" stroke-linecap="round" stroke-dasharray="10" stroke-dashoffset="10">
      <animate attributeName="stroke-dashoffset" to="0" dur="0.3s" begin="0.4s" fill="freeze"/>
    </line>
  </svg>`,
  
  money: `<svg class="cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle class="coin-outer" cx="12" cy="12" r="8" stroke="white" stroke-width="2" stroke-dasharray="50" stroke-dashoffset="50">
      <animate attributeName="stroke-dashoffset" to="0" dur="0.5s" fill="freeze"/>
    </circle>
    <circle class="coin-inner" cx="12" cy="12" r="5" stroke="white" stroke-width="1.5" stroke-dasharray="32" stroke-dashoffset="32">
      <animate attributeName="stroke-dashoffset" to="0" dur="0.4s" begin="0.2s" fill="freeze"/>
    </circle>
    <text x="12" y="15" text-anchor="middle" fill="white" font-size="10" font-weight="bold" opacity="0">
      <animate attributeName="opacity" to="1" dur="0.3s" begin="0.4s" fill="freeze"/>฿
    </text>
  </svg>`,
  
  user: `<svg class="cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle class="user-head" cx="12" cy="8" r="3" stroke="white" stroke-width="2" stroke-dasharray="19" stroke-dashoffset="19">
      <animate attributeName="stroke-dashoffset" to="0" dur="0.3s" fill="freeze"/>
    </circle>
    <path class="user-body" d="M5 20c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-dasharray="22" stroke-dashoffset="22">
      <animate attributeName="stroke-dashoffset" to="0" dur="0.5s" begin="0.2s" fill="freeze"/>
    </path>
  </svg>`,
  
  building: `<svg class="cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path class="building" d="M3 21h18M4 21V7l8-4 8 4v14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="70" stroke-dashoffset="70">
      <animate attributeName="stroke-dashoffset" to="0" dur="0.6s" fill="freeze"/>
    </path>
    <rect class="window-1" x="8" y="11" width="2" height="2" fill="white" opacity="0">
      <animate attributeName="opacity" to="1" dur="0.2s" begin="0.4s" fill="freeze"/>
    </rect>
    <rect class="window-2" x="14" y="11" width="2" height="2" fill="white" opacity="0">
      <animate attributeName="opacity" to="1" dur="0.2s" begin="0.5s" fill="freeze"/>
    </rect>
    <rect class="window-3" x="8" y="15" width="2" height="2" fill="white" opacity="0">
      <animate attributeName="opacity" to="1" dur="0.2s" begin="0.6s" fill="freeze"/>
    </rect>
    <rect class="window-4" x="14" y="15" width="2" height="2" fill="white" opacity="0">
      <animate attributeName="opacity" to="1" dur="0.2s" begin="0.7s" fill="freeze"/>
    </rect>
  </svg>`,
  
  book: `<svg class="cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path class="book" d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="20" stroke-dashoffset="20">
      <animate attributeName="stroke-dashoffset" to="0" dur="0.4s" fill="freeze"/>
    </path>
    <path class="book-cover" d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="80" stroke-dashoffset="80">
      <animate attributeName="stroke-dashoffset" to="0" dur="0.6s" begin="0.2s" fill="freeze"/>
    </path>
  </svg>`,
  
  phone: `<svg class="cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path class="phone" d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="100" stroke-dashoffset="100">
      <animate attributeName="stroke-dashoffset" to="0" dur="0.7s" fill="freeze"/>
    </path>
  </svg>`,
  
  clipboard: `<svg class="cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect class="clipboard" x="5" y="3" width="14" height="18" rx="2" stroke="white" stroke-width="2" stroke-dasharray="68" stroke-dashoffset="68">
      <animate attributeName="stroke-dashoffset" to="0" dur="0.6s" fill="freeze"/>
    </rect>
    <path class="clip-top" d="M9 3h6v2H9z" stroke="white" stroke-width="2" stroke-dasharray="14" stroke-dashoffset="14">
      <animate attributeName="stroke-dashoffset" to="0" dur="0.3s" begin="0.3s" fill="freeze"/>
    </path>
    <path class="checkmark" d="M9 12l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="10" stroke-dashoffset="10">
      <animate attributeName="stroke-dashoffset" to="0" dur="0.3s" begin="0.5s" fill="freeze"/>
    </path>
  </svg>`,
  
  calendar: `<svg class="cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect class="calendar" x="3" y="6" width="18" height="15" rx="2" stroke="white" stroke-width="2" stroke-dasharray="66" stroke-dashoffset="66">
      <animate attributeName="stroke-dashoffset" to="0" dur="0.5s" fill="freeze"/>
    </rect>
    <line class="cal-top" x1="3" y1="10" x2="21" y2="10" stroke="white" stroke-width="2" stroke-dasharray="18" stroke-dashoffset="18">
      <animate attributeName="stroke-dashoffset" to="0" dur="0.3s" begin="0.3s" fill="freeze"/>
    </line>
    <line class="cal-hook-1" x1="8" y1="3" x2="8" y2="7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-dasharray="4" stroke-dashoffset="4">
      <animate attributeName="stroke-dashoffset" to="0" dur="0.2s" begin="0.5s" fill="freeze"/>
    </line>
    <line class="cal-hook-2" x1="16" y1="3" x2="16" y2="7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-dasharray="4" stroke-dashoffset="4">
      <animate attributeName="stroke-dashoffset" to="0" dur="0.2s" begin="0.6s" fill="freeze"/>
    </line>
  </svg>`,
  
  default: `<svg class="cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle class="info-circle" cx="12" cy="12" r="9" stroke="white" stroke-width="2" stroke-dasharray="57" stroke-dashoffset="57">
      <animate attributeName="stroke-dashoffset" to="0" dur="0.5s" fill="freeze"/>
    </circle>
    <path class="info-i" d="M12 16v-4m0-4h.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="8" stroke-dashoffset="8">
      <animate attributeName="stroke-dashoffset" to="0" dur="0.3s" begin="0.3s" fill="freeze"/>
    </path>
  </svg>`
}

// Function to detect icon type from category title (no DB field needed)
export function getIconType(categoryTitle) {
  const title = categoryTitle?.toLowerCase() || ''

  for (const [iconType, keywords] of Object.entries(iconKeywords)) {
    if (keywords.some(keyword => title.includes(keyword))) {
      return iconType
    }
  }

  return 'default'
}

// Function to get icon SVG
export function getCategoryIcon(categoryTitle) {
  const iconType = getIconType(categoryTitle)
  return iconSvgs[iconType] || iconSvgs.default
}
