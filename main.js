import '@fortawesome/fontawesome-free/css/all.min.css'

import { createApp } from 'vue'
import App from './src/App.vue'
import router from './src/router'

// Import Bootstrap CSS only (JS removed to prevent auto-init errors)
import 'bootstrap/dist/css/bootstrap.min.css'

// Import Bootstrap Icons
import 'bootstrap-icons/font/bootstrap-icons.css'

// Import AOS
import AOS from 'aos'
import 'aos/dist/aos.css'

// --- ส่วนที่เพิ่มเข้ามา ---
import axios from 'axios'
import Swal from 'sweetalert2'

const app = createApp(App)

// ตั้งค่า Axios instance แบบรวมศูนย์ (แนะนำ)
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
});

// กำหนด Global Properties
app.config.globalProperties.$axios = axiosInstance;
app.config.globalProperties.$swal = Swal;
// --- สิ้นสุดส่วนที่เพิ่ม ---

app.use(router)

app.mount('#app')

// Initialize AOS after mounting the app
AOS.init();
