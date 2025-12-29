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
              <h1 class="title">ช่วยเหลือ</h1>
              <button class="close-btn" @click="closeHelp">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1L13 13M13 1L1 13" stroke="#86868b" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </header>

          <!-- Scrollable Content -->
          <div class="panel-content custom-scrollbar">
            
            <!-- Section 1: Features -->
            <section class="apple-section fade-in-stagger" style="--delay: 0.1s">
              <div class="section-icon-wrapper blue-gradient">
                <svg class="animated-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="10" rx="2" class="draw-path" style="--duration: 1s"/>
                  <circle cx="12" cy="5" r="2" class="draw-path" style="--duration: 0.5s; --delay: 0.5s"/>
                  <path d="M12 7v4" class="draw-path" style="--duration: 0.3s; --delay: 0.8s"/>
                  <line x1="8" y1="16" x2="8" y2="16" class="pop-in" style="--delay: 1.1s"/>
                  <line x1="16" y1="16" x2="16" y2="16" class="pop-in" style="--delay: 1.2s"/>
                </svg>
              </div>
              <h2 class="section-heading">ความสามารถของ Bot</h2>
              <p class="section-desc">ผู้ช่วยอัจฉริยะที่พร้อมตอบทุกข้อสงสัยเกี่ยวกับ PCRU</p>
              
              <div class="feature-grid">
                <div class="feature-card">
                  <div class="icon-circle purple">
                    <i class="bi bi-mortarboard-fill"></i>
                  </div>
                  <span>ทุนการศึกษา</span>
                </div>
                <div class="feature-card">
                  <div class="icon-circle orange">
                    <i class="bi bi-house-door-fill"></i>
                  </div>
                  <span>หอพัก</span>
                </div>
                <div class="feature-card">
                  <div class="icon-circle green">
                    <i class="bi bi-calendar-event-fill"></i>
                  </div>
                  <span>กิจกรรม</span>
                </div>
                <div class="feature-card">
                  <div class="icon-circle blue">
                    <i class="bi bi-file-earmark-text-fill"></i>
                  </div>
                  <span>เอกสาร</span>
                </div>
              </div>
            </section>

            <!-- Section 2: How to Ask -->
            <section class="apple-section fade-in-stagger" style="--delay: 0.2s">
              <div class="section-header">
                <div class="mini-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" class="draw-loop"/>
                  </svg>
                </div>
                <h3>เคล็ดลับการถาม</h3>
              </div>
              
              <div class="example-container">
                <div class="example-row good">
                  <div class="indicator">
                    <i class="bi bi-check-circle-fill"></i>
                  </div>
                  <div class="text">
                    <strong>แนะนำ:</strong> "ขอรายละเอียดทุนเรียนดีปีล่าสุด"
                  </div>
                </div>
                <div class="example-row bad">
                  <div class="indicator">
                    <i class="bi bi-x-circle-fill"></i>
                  </div>
                  <div class="text">
                    <strong>ไม่แนะนำ:</strong> "ทุน" (กว้างเกินไป)
                  </div>
                </div>
              </div>
            </section>

            <!-- Section 3: FAQ Accordion -->
            <section class="apple-section fade-in-stagger" style="--delay: 0.3s">
               <div class="section-header">
                <div class="mini-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" class="draw-loop"/>
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

          <!-- Footer -->
          <footer class="panel-footer">
            <button class="apple-btn-primary" @click="closeHelp">
              เข้าใจแล้ว
            </button>
          </footer>

        </div>
      </transition>
    </div>
  </teleport>
</template>

<script>
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
        { q: 'Bot ตอบคำถามเรื่องอะไรได้บ้าง?', a: 'สามารถตอบข้อมูลเกี่ยวกับทุนการศึกษา, หอพัก, การลงทะเบียนเรียน และบริการต่างๆ สำหรับนักศึกษา PCRU' },
        { q: 'ต้องพิมพ์ภาษาทางการไหม?', a: 'ไม่จำเป็นครับ สามารถพิมพ์ภาษาพูดปกติได้เลย เช่น "อยากรู้เรื่องหอพัก", "สมัครทุนยังไง"' },
        { q: 'ข้อมูลเชื่อถือได้หรือไม่?', a: 'ข้อมูลทั้งหมดถูกดึงมาจากฐานข้อมูลของมหาวิทยาลัยโดยตรง และมีการอัปเดตอย่างสม่ำเสมอ' }
      ]
    }
  },
  methods: {
    closeHelp() {
      this.$emit('close');
    },
    toggleFaq(index) {
      this.openFaq = this.openFaq === index ? null : index;
    }
  }
}
</script>

<style scoped>
/* Base Font & Variables */
.apple-help-overlay {
  --apple-font: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --panel-width: 400px;
  --bg-color: rgba(255, 255, 255, 0.88);
  --blur-amt: 25px;
  --primary-color: #0071e3;
  --text-primary: #1d1d1f;
  --text-secondary: #86868b;
  
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
  font-family: var(--apple-font);
}

/* Backdrop */
.backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
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
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

/* Header */
.panel-header {
  padding: 24px 28px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.01em;
  color: var(--text-primary);
}
/* Close Button with Animation */
.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(118, 118, 128, 0.12);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
}
/* Animation for Icon inside */
.close-btn svg {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.close-btn:hover {
  background: rgba(118, 118, 128, 0.24);
  transform: scale(1.05);
}
.close-btn:hover svg {
  transform: rotate(90deg);
}
.close-btn:active {
  transform: scale(0.95);
}
.close-btn:active svg {
  transform: rotate(180deg);
}

/* Content Area */
.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
  /* Hide scrollbar but keep functionality */
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,0.1) transparent;
}
.panel-content::-webkit-scrollbar {
  width: 6px;
}
.panel-content::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.1);
  border-radius: 3px;
}

/* Sections */
.apple-section {
  margin-bottom: 40px;
}
.section-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(0, 113, 227, 0.25);
}
.blue-gradient { background: linear-gradient(135deg, #0071e3, #42a1ff); }

.section-heading {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: var(--text-primary);
}
.section-desc {
  font-size: 15px;
  color: var(--text-secondary);
  margin: 0 0 24px 0;
  line-height: 1.4;
}

/* Feature Grid */
.feature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.feature-card {
  background: white;
  padding: 16px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  transition: transform 0.2s ease;
  border: 1px solid rgba(0,0,0,0.02);
}
.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}
.icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
.purple { background: rgba(175, 82, 222, 0.1); color: #AF52DE; }
.orange { background: rgba(255, 149, 0, 0.1); color: #FF9500; }
.green { background: rgba(52, 199, 89, 0.1); color: #34C759; }
.blue { background: rgba(0, 113, 227, 0.1); color: #0071e3; }

.feature-card span {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

/* Example Rows */
.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.mini-icon {
  color: var(--text-secondary);
  display: flex;
}
.section-header h3 {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.example-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.example-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 14px;
  font-size: 14px;
}
.example-row.good {
  background: rgba(52, 199, 89, 0.08);
  border: 1px solid rgba(52, 199, 89, 0.1);
}
.example-row.bad {
  background: rgba(255, 59, 48, 0.08);
  border: 1px solid rgba(255, 59, 48, 0.1);
}
.example-row.good .indicator { color: #34C759; font-size: 16px; }
.example-row.bad .indicator { color: #FF3B30; font-size: 16px; }
.example-row .text { color: var(--text-primary); }

/* FAQ Accordion */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.faq-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  transition: box-shadow 0.2s;
}
.faq-item.is-active {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.faq-toggle {
  width: 100%;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
}
.faq-toggle .chevron {
  color: var(--text-secondary);
  transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}
.faq-item.is-active .chevron {
  transform: rotate(180deg);
}
.faq-body {
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}
.faq-content {
  padding: 0 16px 16px 16px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-secondary);
}

/* Footer */
.panel-footer {
  padding: 20px 28px 28px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}
.apple-btn-primary {
  width: 100%;
  background: #0071e3;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.25);
}
.apple-btn-primary:hover {
  background: #0077ED;
  transform: scale(1.02);
}
.apple-btn-primary:active {
  transform: scale(0.98);
}

/* --- SVG Animations --- */
.draw-path {
  stroke-dasharray: 50;
  stroke-dashoffset: 50;
  animation: dash var(--duration) ease-out forwards;
  animation-delay: var(--delay, 0s);
}
.pop-in {
  opacity: 0;
  animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  animation-delay: var(--delay, 0s);
}
.draw-loop {
  stroke-dasharray: 100;
  animation: dash 3s ease-in-out infinite alternate;
}

@keyframes dash {
  to { stroke-dashoffset: 0; }
}
@keyframes popIn {
  0% { opacity: 0; transform: scale(0); transform-origin: center; }
  100% { opacity: 1; transform: scale(1); transform-origin: center; }
}

/* --- Vue Transitions (Apple Style) --- */
.apple-fade-enter-active, .apple-fade-leave-active {
  transition: opacity 0.4s ease;
}
.apple-fade-enter-from, .apple-fade-leave-to {
  opacity: 0;
}

.apple-slide-enter-active {
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); /* Apple's spring curve */
}
.apple-slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}
.apple-slide-enter-from, .apple-slide-leave-to {
  transform: translateX(100%);
}

.fade-in-stagger {
  opacity: 0;
  transform: translateY(10px);
  animation: fadeUp 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  animation-delay: var(--delay);
}
@keyframes fadeUp {
  to { opacity: 1; transform: translateY(0); }
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .apple-panel {
    width: 100%;
  }
}
</style>