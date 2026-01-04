<template>
  <teleport to="body">
    <div class="apple-help-overlay" v-if="visible">
      <!-- Backdrop with Blur -->
      <transition name="apple-fade" appear>
        <div v-if="visible" class="backdrop" @click="closeHelp"></div>
      </transition>

      <!-- Main Panel (Slide Over) -->
      <transition name="apple-slide" appear>
        <div v-if="visible" class="apple-panel">
          
          <!-- Header with Glass Effect -->
          <header class="panel-header">
            <div class="header-content">
              <h1 class="title">ศูนย์ช่วยเหลือ</h1>
              <button class="close-btn" @click="closeHelp">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1L13 13M13 1L1 13" stroke="#86868b" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </header>

          <!-- Scrollable Content -->
          <div class="panel-content custom-scrollbar">
            
            <!-- Section 1: Features & Intro -->
            <section class="apple-section fade-in-stagger" style="--delay: 0.1s">
              <div class="section-hero">
                <div class="hero-icon-wrapper blue-gradient float-animation">
                  <svg class="animated-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="10" rx="2" class="draw-path" style="--duration: 1.2s"/>
                    <circle cx="12" cy="5" r="2" class="draw-path" style="--duration: 0.6s; --delay: 0.5s"/>
                    <path d="M12 7v4" class="draw-path" style="--duration: 0.4s; --delay: 0.8s"/>
                    <line x1="8" y1="16" x2="8" y2="16" class="pop-in" style="--delay: 1.2s"/>
                    <line x1="16" y1="16" x2="16" y2="16" class="pop-in" style="--delay: 1.3s"/>
                  </svg>
                </div>
                <div class="hero-text">
                  <h2 class="section-heading">ผู้ช่วยอัจฉริยะ PCRU</h2>
                  <p class="section-desc">พร้อมตอบคำถามเรื่องทุน, หอพัก, เอกสารต่างๆ และช่วยค้นหาสถานที่ในมหาวิทยาลัยได้</p>
                </div>
              </div>
              
              <div class="feature-grid">
                <!-- Loading placeholders -->
                <template v-if="categoriesLoading">
                  <div class="feature-card placeholder" v-for="i in 4" :key="'ph-'+i">
                    <div class="icon-circle skeleton-pulse"></div>
                    <span class="skeleton-text skeleton-pulse"></span>
                  </div>
                </template>

                <!-- Render categories -->
                <template v-else>
                  <div class="feature-card" v-for="(fc, idx) in featureCategories" :key="fc.title || fc.CategoriesID || idx">
                    <div class="icon-circle" :class="iconColor(fc)">
                      <i :class="iconClass(fc)"></i>
                    </div>
                    <span>{{ fc.title || fc.CategoriesName || fc.CategoriesID || '—' }}</span>
                  </div>
                  <div v-if="!featureCategories.length && !categoriesLoading" class="feature-card no-data">
                    <div class="icon-circle gray">
                      <i class="bi bi-inbox-fill"></i>
                    </div>
                    <span>ไม่มีหมวดหมู่</span>
                  </div>
                </template>
              </div>
            </section>

            <!-- 🆕 Section: Synonyms & Smart Search (New Feature) -->
            <section class="apple-section fade-in-stagger" style="--delay: 0.2s">
              <div class="section-header">
                <div class="mini-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M7 4v16M17 4v16M3 8h4M3 16h4M17 8h4M17 16h4" class="draw-path" style="--duration: 1.5s"/>
                  </svg>
                </div>
                <h3>พิมพ์คำพ้องก็เข้าใจนะ!</h3>
              </div>
              
              <div class="example-container">
                <div class="example-row magic">
                  <div class="indicator">
                    <i class="bi bi-stars"></i>
                  </div>
                  <div class="text">
                    <strong>คำพ้องเสียง:</strong> พิมพ์ "สามหกห้า" <i class="bi bi-arrow-right-short"></i> เข้าใจเป็น "365"
                  </div>
                </div>
                <div class="example-row magic">
                  <div class="indicator">
                    <i class="bi bi-translate"></i>
                  </div>
                  <div class="text">
                    <strong>คำทับศัพท์:</strong> พิมพ์ "อีบุ๊ค" <i class="bi bi-arrow-right-short"></i> เข้าใจเป็น "E-Book"
                  </div>
                </div>
                <p class="helper-text">
                  ระบบช่วยแปลงคำพูดภาษาไทยให้เป็นคำค้นที่ถูกต้องโดยอัตโนมัติ ไม่ต้องกังวลเรื่องสะกดผิด
                </p>
              </div>
            </section>

            <!-- Section: How to Ask -->
            <section class="apple-section fade-in-stagger" style="--delay: 0.3s">
              <div class="section-header">
                <div class="mini-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </div>
                <h3>เคล็ดลับการถาม</h3>
              </div>
              
              <div class="example-container">
                <div class="example-row good">
                  <div class="indicator"><i class="bi bi-check-circle-fill"></i></div>
                  <div class="text"><strong>แนะนำ:</strong> "ขอรายละเอียดทุนเรียนดีปีล่าสุด"</div>
                </div>
                <div class="example-row good">
                  <div class="indicator"><i class="bi bi-check-circle-fill"></i></div>
                  <div class="text"><strong>แนะนำ (นำทาง/สถานที่):</strong> "ไปอาคารเรียนรวมจากหอพักต้องเดินทางยังไง"</div>
                </div>
                <div class="example-row good">
                  <div class="indicator"><i class="bi bi-check-circle-fill"></i></div>
                  <div class="text"><strong>แนะนำ (นำทาง/สถานที่):</strong> "ห้องทะเบียนอยู่ตึกไหน"</div>
                </div>
                <div class="example-row bad">
                  <div class="indicator"><i class="bi bi-x-circle-fill"></i></div>
                  <div class="text"><strong>ไม่แนะนำ:</strong> "ทุน" (กว้างไป)</div>
                </div>
                <div class="example-row bad">
                  <div class="indicator"><i class="bi bi-x-circle-fill"></i></div>
                  <div class="text"><strong>ไม่แนะนำ (นำทาง/สถานที่):</strong> "ไปไหน" (ไม่ระบุจุดหมาย/จุดเริ่มต้น)</div>
                </div>
              </div>
            </section>

            <!-- Section: Limitations -->
            <section class="apple-section fade-in-stagger" style="--delay: 0.4s">
              <div class="section-header">
                <div class="mini-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </div>
                <h3>ข้อจำกัดและการปฏิเสธ</h3>
              </div>

              <div class="example-container">
                <div class="example-row neutral">
                  <div class="indicator"><i class="bi bi-hand-thumbs-down-fill"></i></div>
                  <div class="text">
                    <strong>ปฏิเสธการค้นหา:</strong> พิมพ์ "ไม่" หรือ "ไม่เอาทุน" บอทจะหยุดค้นหาเรื่องนั้นให้ทันที
                  </div>
                </div>
                <p class="helper-text">
                  หากบอทตอบไม่ตรง สามารถกดปุ่ม "ส่งต่อ" เพื่อส่งคำถามให้เจ้าหน้าที่ได้
                </p>
              </div>
            </section>

            <!-- 🆕 Section: Advanced Search with Rejection & Want -->
            <section class="apple-section fade-in-stagger" style="--delay: 0.45s">
              <div class="section-header">
                <div class="mini-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                    <path d="M3 6h18v3H3z" />
                  </svg>
                </div>
                <h3>วิธีการพิมพ์แบบปฏิเสธ + ค้นหา</h3>
              </div>

              <div class="example-container">
                <div class="example-row good">
                  <div class="indicator">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
                    </svg>
                  </div>
                  <div class="text">
                    <strong>ปฏิเสธก่อน:</strong> พิมพ์ "ไม่เอา <span style="color:#e74c3c">ทุน</span> และ <span style="color:#e74c3c">หอพัก</span> แต่หนูจะเอา <span style="color:#27ae60">เกณฑ์</span> และ <span style="color:#27ae60">กยศ</span>"
                  </div>
                </div>
                <div class="example-row good">
                  <div class="indicator">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
                    </svg>
                  </div>
                  <div class="text">
                    <strong>หลายคำปฏิเสธ:</strong> "ไม่ต้องการ <span style="color:#e74c3c">ทุนเรียนดี</span> ไม่เอา <span style="color:#e74c3c">หอพัก</span> แต่อยากรู้ <span style="color:#27ae60">IT</span> กับ <span style="color:#27ae60">คอมพิวเตอร์</span>"
                  </div>
                </div>
                <p class="helper-text" style="margin-top: 12px;">
                  🔴 <strong>สีแดง = คำที่ปฏิเสธ</strong> (ไม่แสดง)<br/>
                  🟢 <strong>สีเขียว = คำที่ต้องการค้นหา</strong> (แสดงผล)
                </p>
              </div>
            </section>

            <!-- Section: FAQ -->
            <section class="apple-section fade-in-stagger" style="--delay: 0.5s">
               <div class="section-header">
                <div class="mini-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <h3>คำถามที่พบบ่อย</h3>
              </div>

              <div class="faq-list">
                <div 
                  v-for="(item, index) in faqs" 
                  :key="index"
                  class="faq-item"
                  :class="{ 'is-active': openFaq === index }"
                >
                  <button class="faq-toggle" @click="toggleFaq(index)">
                    <span>{{ item.q }}</span>
                    <span class="chevron">
                      <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
                        <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </span>
                  </button>
                  <div class="faq-body" :style="{ maxHeight: openFaq === index ? '200px' : '0' }">
                    <div class="faq-content">
                      {{ item.a }}
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </div>



        </div>
      </transition>
    </div>
  </teleport>
</template>

<script>
import { useChatbotApi } from '@/views/chatbot/composables'

export default {
  name: 'ChatbotHelpView',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  data() {
    return {
      openFaq: 0,
      faqs: [
        { q: 'Bot ตอบอะไรได้บ้าง?', a: 'ตอบข้อมูลทุนการศึกษา, หอพัก, การลงทะเบียน, เอกสาร PDF และข่าวสารทั่วไปของ PCRU' },
        { q: 'ต้องพิมพ์ทางการไหม?', a: 'ไม่ต้องค่ะ พิมพ์ภาษาพูดได้เลย เช่น "อยากรู้เรื่องทุนกู้ยืม"' },
        { q: 'คำพ้องคืออะไร?', a: 'คือคำที่เขียนต่างกันแต่ความหมายเหมือนกัน เช่น พิมพ์ "สามหกห้า" บอทจะหา "365" ให้ หรือ "อีบุ๊ค" หา "E-Book" ให้' },
        { q: 'ข้อมูลอัปเดตไหม?', a: 'ข้อมูลดึงจากฐานข้อมูลมหาวิทยาลัย บางส่วนอาจต้องรอการประกาศอย่างเป็นทางการ' },
      ],
      categories: [],
      categoriesLoading: false
    }
  },
  computed: {
    featureCategories() {
      const list = Array.isArray(this.categories) ? [...this.categories] : [];
      list.sort((a, b) => {
        const aCount = Array.isArray(a.items) ? a.items.length : 0;
        const bCount = Array.isArray(b.items) ? b.items.length : 0;
        if (bCount !== aCount) return bCount - aCount;
        return (a.title || '').localeCompare(b.title || '', 'th');
      });
      return list.slice(0, 4);
    }
  },
  methods: {
    closeHelp() {
      this.$emit('close');
    },
    toggleFaq(index) {
      this.openFaq = this.openFaq === index ? null : index;
    },
    async loadCategories() {
      try {
        this.categoriesLoading = true;
        const res = await this.$axios.get('/categories', { params: { onlyWithAnswers: 1 } });
        const raw = res.data?.data ?? res.data;
        const rows = Array.isArray(raw) ? raw : (raw?.categories || []);

        if (rows.length && rows[0].hasOwnProperty('CategoriesID')) {
          const roots = rows
            .filter(r => String(r.ParentCategoriesID) === String(r.CategoriesID))
            .map(r => {
              const id = String(r.CategoriesID);
              const items = rows
                .filter(rr => String(rr.ParentCategoriesID) === id && String(rr.CategoriesID) !== id)
                .map(rr => rr.CategoriesName || rr.CategoriesID);
              return { title: r.CategoriesName || r.CategoriesID, items };
            });
          this.categories = roots;
        } else {
          const { fetchCategories } = useChatbotApi(this.$axios);
          const cats = await fetchCategories();
          this.categories = Array.isArray(cats) ? cats : [];
        }
      } catch (e) {
        console.error('Failed to load categories', e);
        this.categories = [];
      } finally {
        this.categoriesLoading = false;
      }
    },
    iconClass(cat) {
      const name = String(cat.title || cat.CategoriesName || '').toLowerCase();
      if (name.includes('ทุน')) return 'bi bi-mortarboard-fill';
      if (name.includes('หอ')) return 'bi bi-house-door-fill';
      if (name.includes('กิจ')) return 'bi bi-calendar-event-fill';
      if (name.includes('เอกสาร')) return 'bi bi-file-earmark-text-fill';
      return 'bi bi-grid-fill';
    },
    iconColor(cat) {
      const name = String(cat.title || cat.CategoriesName || '').toLowerCase();
      if (name.includes('ทุน')) return 'purple';
      if (name.includes('หอ')) return 'orange';
      if (name.includes('กิจ')) return 'green';
      return 'blue';
    }
  },
  mounted() {
    this.loadCategories();
  }
}
</script>

<style scoped>
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css");

/* --- Apple Style Variables --- */
.apple-help-overlay {
  --apple-font: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --panel-width: 363px;
  --bg-color: rgba(255, 255, 255, 0.85); /* More translucency */
  --blur-amt: 50px; /* Stronger blur like iOS/macOS */
  --primary-color: #0071e3;
  --text-primary: #1d1d1f;
  --text-secondary: #86868b;
  --radius-l: 24px;
  --radius-m: 16px;
  --radius-s: 12px;
  
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  justify-content: flex-end; /* Sidebar style */
  font-family: var(--apple-font);
}

/* Backdrop */
.backdrop {
  position: absolute;
  inset: 0;
  background: rgba(50, 50, 50, 0.2);
  backdrop-filter: blur(8px);
  z-index: 1;
}

/* Main Panel */
.apple-panel {
  position: relative;
  z-index: 2;
  width: var(--panel-width);
  height: 100%;
  background: var(--bg-color);
  backdrop-filter: blur(var(--blur-amt));
  -webkit-backdrop-filter: blur(var(--blur-amt));
  box-shadow: -10px 0 60px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
}

/* Header */
.panel-header {
  padding: 32px 32px 24px;
  background: rgba(255,255,255,0.5);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}
.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(118, 118, 128, 0.12);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
}
.close-btn:hover {
  background: rgba(118, 118, 128, 0.24);
  transform: scale(1.08);
}
.close-btn:active { transform: scale(0.95); }

/* Scrollable Content */
.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,0.1) transparent;
}
.panel-content::-webkit-scrollbar { width: 6px; }
.panel-content::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.1); border-radius: 3px; }

/* Sections */
.apple-section { margin-bottom: 48px; }

/* Section 1: Hero */
.section-hero {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
.hero-icon-wrapper {
  width: 80.90px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(0, 113, 227, 0.3);
  background: linear-gradient(135deg, #0071e3, #42a1ff);
}
.hero-text .section-heading {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px;
  color: var(--text-primary);
}
.hero-text .section-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

/* Feature Grid */
.feature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.feature-card {
  background: rgba(255, 255, 255, 0.6);
  padding: 16px;
  border-radius: var(--radius-m);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(0,0,0,0.03);
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
}
.feature-card:hover {
  transform: translateY(-4px) scale(1.02);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 12px 24px rgba(0,0,0,0.06);
}
.icon-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
.purple { background: rgba(175, 82, 222, 0.15); color: #AF52DE; }
.orange { background: rgba(255, 149, 0, 0.15); color: #FF9500; }
.green { background: rgba(52, 199, 89, 0.15); color: #34C759; }
.blue { background: rgba(0, 113, 227, 0.15); color: #0071e3; }
.gray { background: rgba(142, 142, 147, 0.15); color: #8E8E93; }

.feature-card span {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  text-align: center;
}

/* Section Header */
.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.mini-icon { color: var(--text-secondary); display: flex; }
.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
}

/* Example Rows */
.example-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.example-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  border-radius: var(--radius-m);
  font-size: 14px;
  line-height: 1.5;
  transition: transform 0.2s;
}
.example-row:hover { transform: scale(1.01); }

.example-row.good {
  background: rgba(52, 199, 89, 0.08);
  border: 1px solid rgba(52, 199, 89, 0.15);
}
.example-row.bad {
  background: rgba(255, 59, 48, 0.08);
  border: 1px solid rgba(255, 59, 48, 0.15);
}
.example-row.neutral {
  background: rgba(142, 142, 147, 0.08);
  border: 1px solid rgba(142, 142, 147, 0.15);
}
/* Magic Style for Synonyms */
.example-row.magic {
  background: linear-gradient(135deg, rgba(88, 86, 214, 0.08), rgba(175, 82, 222, 0.08));
  border: 1px solid rgba(88, 86, 214, 0.15);
}
.example-row.magic .indicator { color: #5856D6; }

.indicator { font-size: 18px; margin-top: 1px; }
.example-row.good .indicator { color: #34C759; }
.example-row.bad .indicator { color: #FF3B30; }
.example-row.neutral .indicator { color: #8E8E93; }

.example-row .text { color: var(--text-primary); }
.helper-text {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 4px 0 0 14px;
  line-height: 1.4;
}

/* FAQ Accordion */
.faq-list { display: flex; flex-direction: column; gap: 12px; }
.faq-item {
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-s);
  border: 1px solid rgba(0,0,0,0.03);
  overflow: hidden;
  transition: all 0.3s ease;
}
.faq-item.is-active {
  background: white;
  box-shadow: 0 8px 20px rgba(0,0,0,0.06);
  border-color: transparent;
}
.faq-toggle {
  width: 100%;
  padding: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: none;
  border: none;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
}
.faq-toggle .chevron {
  color: var(--text-secondary);
  transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}
.faq-item.is-active .chevron { transform: rotate(180deg); }
.faq-body {
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.33, 1, 0.68, 1);
}
.faq-content {
  padding: 0 18px 20px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
}

/* Footer */
.panel-footer {
  padding: 24px 32px 32px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  background: rgba(255,255,255,0.5);
}
.apple-btn-primary {
  width: 100%;
  background: #0071e3;
  color: white;
  border: none;
  padding: 16px;
  border-radius: var(--radius-m);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.3);
}
.apple-btn-primary:hover {
  background: #0077ED;
  transform: scale(1.01);
  box-shadow: 0 6px 16px rgba(0, 113, 227, 0.4);
}
.apple-btn-primary:active { transform: scale(0.98); }

/* --- Animations --- */
.draw-path {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: dash var(--duration) ease-out forwards;
  animation-delay: var(--delay, 0s);
}
.pop-in {
  opacity: 0;
  animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: var(--delay, 0s);
}
/* New Float Animation */
.float-animation {
  animation: float 6s ease-in-out infinite;
}

@keyframes dash { to { stroke-dashoffset: 0; } }
@keyframes popIn {
  0% { opacity: 0; transform: scale(0); transform-origin: center; }
  100% { opacity: 1; transform: scale(1); transform-origin: center; }
}
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
}

/* Vue Transitions */
.apple-fade-enter-active, .apple-fade-leave-active { transition: opacity 0.5s ease; }
.apple-fade-enter-from, .apple-fade-leave-to { opacity: 0; }

.apple-slide-enter-active { transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
.apple-slide-leave-active { transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1); }
.apple-slide-enter-from, .apple-slide-leave-to { transform: translateX(100%); }

.fade-in-stagger {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--delay);
}
@keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }

/* Skeleton Loading */
.skeleton-pulse {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton 1.5s infinite;
}
@keyframes skeleton {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.skeleton-text { width: 60%; height: 12px; border-radius: 4px; margin-top: 8px; }

/* Mobile */
@media (max-width: 480px) {
  .apple-panel { width: 100%; border-left: none; }
  .feature-grid { grid-template-columns: 1fr; }
}
</style>