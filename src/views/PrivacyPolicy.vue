<template>
  <div class="privacy-page">
    <main class="card">
      <h1>นโยบายความเป็นส่วนตัว</h1>
      <p class="lead"><strong>สรุป:</strong> ระบบนี้เก็บและใช้ "ประวัติการสนทนา" เพื่อให้บริการแชตต่อเนื่อง ปรับปรุงคุณภาพ และตรวจสอบข้อผิดพลาด โดยข้อมูลจะไม่ถูกใช้เพื่อโฆษณาหรือส่งต่อให้บุคคลที่สาม เว้นแต่จะมีกฎหมายหรือคำสั่งศาลบังคับใช้</p>

      <h2>ข้อมูลที่เก็บ</h2>
      <ul>
        <li><strong>ประวัติการสนทนา:</strong> ข้อความที่ผู้ใช้ส่งและการตอบกลับของระบบ</li>
        <li><strong>ข้อมูลเทคนิค:</strong> ข้อมูลเช่น เวลา และรหัสผู้ใช้ (ถ้ามี) เพื่อการวิเคราะห์และแก้ปัญหา</li>
      </ul>

      <h2>วัตถุประสงค์การใช้ข้อมูล</h2>
      <ol>
        <li>ให้บริการการสนทนาอย่างต่อเนื่องและมีบริบท</li>
        <li>ปรับปรุงความถูกต้องและคุณภาพของคำตอบ</li>
        <li>วิเคราะห์และแก้ไขปัญหาทางเทคนิค</li>
      </ol>

      <h2>การเก็บรักษา</h2>
      <p>ข้อมูลจะเก็บไว้อย่างปลอดภัยเป็นระยะเวลาที่จำเป็นต่อการให้บริการและการปรับปรุงระบบ หากต้องการให้ลบข้อมูล ติดต่อผู้ดูแลระบบตามข้อมูลติดต่อด้านล่าง</p>

      <h2>การเปิดเผยข้อมูลแก่บุคคลที่สาม</h2>
      <p>เราไม่เปิดเผยข้อมูลส่วนบุคคลเพื่อการโฆษณาโดยบุคคลที่สาม แต่เราอาจเปิดเผยข้อมูลตามที่กฎหมายกำหนดหรือเพื่อตอบคำร้องขอของหน่วยงานที่มีอำนาจ</p>

      <h2>สิทธิของผู้ใช้</h2>
      <p>ผู้ใช้มีสิทธิในการขอเข้าถึง แก้ไข หรือลบข้อมูลส่วนบุคคล ตามกฎหมายที่เกี่ยวข้อง โปรดติดต่อผู้ดูแลระบบเพื่อดำเนินการ</p>

      <h2>ข้อมูลติดต่อ</h2>
      <p>ติดต่อผู้ดูแลระบบ: <a :href="`mailto:${privacyEmail}`">{{ privacyEmail }}</a></p>



    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
const props = defineProps({
  inModal: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])
const router = useRouter()
// Read privacy contact from Vite env (set VITE_PRIVACY_EMAIL), fallback to provided address
const privacyEmail = import.meta.env.VITE_PRIVACY_EMAIL || 'st651102064101@pcru.ac.th'
function handleClose() {
  if (props.inModal) {
    emit('close')
  } else {
    router.push('/')
  }
}
onMounted(() => {
  if (!props.inModal) {
    document.title = 'นโยบายความเป็นส่วนตัว — PCRU Chatbot'
    window.scrollTo({ top: 0 })
  }
})
</script>

<style scoped>
.privacy-page { display:flex; justify-content:center; padding:0; }
.card { max-width:820px; overflow-y: auto; width:100%; background: rgba(0, 0, 0, 0.239); backdrop-filter: blur(20px) saturate(120%); border-radius:10px; padding:22px; box-shadow: var(--cb-shadow) }
h1 { margin:0 0 12px 0 }
.lead { color: var(--cb-text-primary); margin-bottom:14px }
ul, ol { margin-left:18px; margin-bottom:14px }
.actions { display:flex; gap:8px; margin-top:18px }
.btn { padding:8px 12px; border-radius:8px; border:1px solid var(--cb-border-color); background:transparent; color: var(--cb-text-primary); cursor:pointer }

/* Links inside privacy page */
.card a { color: var(--cb-link); text-decoration: underline }
[data-theme="dark"] .card a { color: var(--cb-link); }

/* High-contrast text in dark mode for privacy content */
[data-theme="dark"] .privacy-page .card,
[data-theme="dark"] .privacy-page .card h1,
[data-theme="dark"] .privacy-page .card h2,
[data-theme="dark"] .privacy-page .card p,
[data-theme="dark"] .privacy-page .card li { color: var(--cb-text-inverse); }
[data-theme="dark"] .privacy-page .card .lead { color: rgba(255,255,255,0.94); }
</style>
