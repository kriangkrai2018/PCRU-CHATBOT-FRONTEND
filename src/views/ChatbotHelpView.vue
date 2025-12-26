<template>
  <div class="chatbot-help-root" v-if="visible">
    <!-- Backdrop overlay -->
    <transition name="backdrop-fade">
      <div v-if="visible" class="help-backdrop" @click="closeHelp"></div>
    </transition>

    <!-- Help panel - sized to match chatbot drawer -->
    <transition name="help-panel-slide">
      <div v-if="visible" class="help-panel">
        <!-- Header -->
        <div class="help-header">
          <h1 class="help-title">ช่วยเหลือ</h1>
          <button class="help-close" @click="closeHelp" aria-label="close help">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <!-- Scrollable content -->
        <div class="help-content">
          <!-- Section 1: What can the bot do -->
          <section class="help-section">
            <div class="section-icon">🤖</div>
            <h2 class="section-title">Bot นี้ทำอะไรได้?</h2>
            <p class="section-text">Bot ของ PCRU ช่วยตอบคำถามเกี่ยวกับ:</p>
            <ul class="feature-list">
              <li class="feature-item">
                <span class="feature-icon">💰</span>
                <div><strong>ทุนการศึกษา</strong> - ข้อมูลทุน เงื่อนไข วิธีสมัคร</div>
              </li>
              <li class="feature-item">
                <span class="feature-icon">🏠</span>
                <div><strong>หอพักนักศึกษา</strong> - ห้อง ราคา กฎระเบียบ</div>
              </li>
              <li class="feature-item">
                <span class="feature-icon">🎓</span>
                <div><strong>บริการนักศึกษา</strong> - แนะแนว สุขภาพ IT</div>
              </li>
              <li class="feature-item">
                <span class="feature-icon">📋</span>
                <div><strong>การสมัครและวิธีการ</strong> - ลิงก์ เอกสาร ขั้นตอน</div>
              </li>
            </ul>
          </section>

          <!-- Section 2: How to ask -->
          <section class="help-section">
            <div class="section-icon">❓</div>
            <h2 class="section-title">ถามอย่างไร?</h2>
            <p class="section-text">พิมพ์คำถามเป็นภาษาไทยธรรมชาติ ไม่ต้องใช้คำศัพท์พิเศษ</p>
            <div class="example-group">
              <h3 class="example-title">✅ คำถามที่ดี:</h3>
              <div class="example-card good">"ต้องทำอะไรเพื่อขอทุนเรียนดี"</div>
              <div class="example-card good">"หอพักเท่าไหร่ต่อเดือน"</div>
            </div>
            <div class="example-group">
              <h3 class="example-title">❌ หลีกเลี่ยง:</h3>
              <div class="example-card bad">"ทุน" (สั้นเกินไป)</div>
            </div>
          </section>

          <!-- Section 3: Tips -->
          <section class="help-section">
            <div class="section-icon">💡</div>
            <h2 class="section-title">เคล็ดลับ</h2>
            <ul class="tips-list">
              <li class="tip-item"><div class="tip-number">1</div><div><strong>ระบุชัดเจน</strong> - "ทุนเรียนดี" ดีกว่า "ทุน"</div></li>
              <li class="tip-item"><div class="tip-number">2</div><div><strong>ถามเฉพาะเรื่อง</strong> - เจาะจงสิ่งที่ต้องการ</div></li>
              <li class="tip-item"><div class="tip-number">3</div><div><strong>ลองหลายคำ</strong> - ถ้าผลไม่ตรง ลองใหม่</div></li>
            </ul>
          </section>

          <!-- Section 4: FAQ -->
          <section class="help-section">
            <div class="section-icon">🙋</div>
            <h2 class="section-title">คำถามที่พบบ่อย</h2>
            <div class="faq-item" v-for="(faq, idx) in faqs" :key="idx">
              <button class="faq-question" @click="toggleFaq(idx)">
                <span>{{ faq.q }}</span>
                <svg class="faq-chevron" :class="{ open: openFaqIndex === idx }" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <div v-show="openFaqIndex === idx" class="faq-answer">{{ faq.a }}</div>
            </div>
          </section>
        </div>

        <!-- Footer -->
        <div class="help-footer">
          <button class="help-close-btn" @click="closeHelp">เข้าใจแล้ว</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'ChatbotHelpView',
  props: {
    visible: { type: Boolean, default: false }
  },
  data() {
    return {
      openFaqIndex: null,
      faqs: [
        { q: 'Bot จำประวัติการสนทนาได้ไหม?', a: 'ใช่ค่ะ Bot จำประวัติในเซสชันนี้ได้' },
        { q: 'ถ้า Bot ตอบไม่ถูก ทำอย่างไร?', a: 'ลองถามใหม่ด้วยคำอื่น หรือติดต่อเจ้าหน้าที่' },
        { q: 'Bot ตอบได้ทุกเรื่องไหม?', a: 'Bot เชี่ยวชาญเรื่องทุน หอพัก บริการนักศึกษา และปฏิทินวิชาการ' }
      ]
    }
  },
  methods: {
    closeHelp() { this.$emit('close') },
    toggleFaq(idx) { this.openFaqIndex = this.openFaqIndex === idx ? null : idx }
  }
}
</script>

<style scoped>
.chatbot-help-root {
  position: fixed;
  inset: 0;
  z-index: 2000;
  pointer-events: none;
}

.help-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  pointer-events: auto;
  z-index: 2001;
}

/* Panel sized to match chatbot drawer - 400px width, right side */
.help-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
  max-width: 100vw;
  z-index: 2002;
  display: flex;
  flex-direction: column;
  background: #fff;
  pointer-events: auto;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
}

.help-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
  flex-shrink: 0;
}

.help-title {
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
}

.help-close {
  all: unset;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  color: #1d1d1f;
  transition: background 0.2s;
}
.help-close:hover { background: rgba(0, 0, 0, 0.06); }

.help-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  overscroll-behavior: contain;
}

.help-section { margin-bottom: 24px; }
.section-icon { font-size: 32px; margin-bottom: 8px; }
.section-title { font-size: 16px; font-weight: 700; color: #1d1d1f; margin: 0 0 8px 0; }
.section-text { color: #6e6e73; font-size: 14px; line-height: 1.5; margin: 0 0 12px 0; }

.feature-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.feature-item { display: flex; gap: 10px; padding: 10px; background: rgba(107, 44, 145, 0.04); border-radius: 10px; border: 1px solid rgba(107, 44, 145, 0.08); }
.feature-icon { font-size: 20px; flex-shrink: 0; }
.feature-item strong { color: #6B2C91; font-weight: 600; font-size: 13px; }
.feature-item div { font-size: 13px; color: #6e6e73; line-height: 1.4; }

.example-group { margin-top: 12px; }
.example-title { font-size: 12px; font-weight: 600; color: #1d1d1f; margin: 0 0 8px 0; }
.example-card { padding: 10px 12px; margin-bottom: 6px; border-radius: 8px; font-size: 13px; }
.example-card.good { background: rgba(76, 175, 80, 0.08); color: #2e7d32; border: 1px solid rgba(76, 175, 80, 0.15); }
.example-card.bad { background: rgba(244, 67, 54, 0.08); color: #c62828; border: 1px solid rgba(244, 67, 54, 0.15); }

.tips-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.tip-item { display: flex; gap: 10px; padding: 10px; background: rgba(139, 76, 184, 0.04); border-radius: 10px; }
.tip-number { width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #8B4CB8, #6B2C91); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 12px; flex-shrink: 0; }
.tip-item div { font-size: 13px; color: #6e6e73; line-height: 1.4; }
.tip-item strong { color: #6B2C91; font-weight: 600; }

.faq-item { margin-bottom: 6px; }
.faq-question { all: unset; width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 12px; background: rgba(107, 44, 145, 0.04); border: 1px solid rgba(107, 44, 145, 0.08); border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; color: #1d1d1f; text-align: left; }
.faq-question:hover { background: rgba(107, 44, 145, 0.08); }
.faq-chevron { flex-shrink: 0; color: #6B2C91; transition: transform 0.2s; }
.faq-chevron.open { transform: rotate(180deg); }
.faq-answer { padding: 10px 12px; background: rgba(107, 44, 145, 0.02); border-left: 2px solid rgba(107, 44, 145, 0.2); font-size: 13px; color: #6e6e73; line-height: 1.5; margin-top: 4px; }

.help-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
  flex-shrink: 0;
}

.help-close-btn {
  all: unset;
  display: block;
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  background: linear-gradient(135deg, #8B4CB8, #6B2C91);
  color: white;
  font-weight: 600;
  font-size: 15px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(107, 44, 145, 0.25);
}
.help-close-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(107, 44, 145, 0.35); }
.help-close-btn:active { transform: translateY(0); }

/* Transitions */
.backdrop-fade-enter-active, .backdrop-fade-leave-active { transition: opacity 0.3s; }
.backdrop-fade-enter-from, .backdrop-fade-leave-to { opacity: 0; }

.help-panel-slide-enter-active { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.help-panel-slide-leave-active { transition: transform 0.2s ease-in; }
.help-panel-slide-enter-from, .help-panel-slide-leave-to { transform: translateX(100%); }

/* Mobile */
@media (max-width: 480px) {
  .help-panel { width: 100%; }
}
</style>
