import axios from 'axios';
import router from '@/router'; // นำเข้า router เพื่อใช้ในการนำทาง
// ตัวแปรสำหรับเก็บ instance ของ SweetAlert2 (ถ้ามี)
let swalInstance = null; 

// สร้าง Axios instance
const axiosInstance = axios.create({
  // กำหนด Base URL ของ Backend API
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://project.3bbddns.com:36145', // ตรวจสอบให้แน่ใจว่าเป็น URL ของ Backend ของคุณ
  timeout: parseInt(import.meta.env.VITE_AXIOS_TIMEOUT || '3000'), // 🕒 short timeout to prevent slow reload
  headers: {
    'Content-Type': 'application/json',
  },
});

// เพิ่ม Request Interceptor เพื่อแนบ Authorization Token เข้าไปใน Header ก่อนส่ง Request
axiosInstance.interceptors.request.use(
  (config) => {
    // ดึง token ที่เก็บไว้ตอน Login ออกมาจาก localStorage
    const token = localStorage.getItem('userToken'); // หรือชื่อ key ที่คุณใช้เก็บ token

    // ถ้ามี token อยู่ ให้เพิ่ม Authorization header เข้าไปใน config ของ request
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 🛡️ Add session ID for context tracking
    let sessionId = localStorage.getItem('chatbot_session_id');
    if (!sessionId) {
      // Generate a unique session ID
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('chatbot_session_id', sessionId);
    }
    config.headers['X-Session-ID'] = sessionId;

    // Prevent accidental cleanup calls from other pages: only allow DELETE /feedbacks/cleanup-handled when on handled feedbacks page
    try {
      if (config && config.method === 'delete' && typeof config.url === 'string' && config.url.includes('/feedbacks/cleanup-handled')) {
        const allowedPath = '/reports/feedbacks-handled';
        const currentPath = (typeof window !== 'undefined' && window.location && window.location.pathname) ? window.location.pathname : '';
        if (currentPath !== allowedPath) {
          console.warn('Blocked cleanup request to /feedbacks/cleanup-handled from', currentPath);
          // Return a rejected Promise so calling code gets a clear error instead of performing deletion
          return Promise.reject(new Error('Cleanup operation is restricted to the Handled Feedbacks page'));
        }
      }
    } catch (err) {
      // If anything goes wrong with the guard, log and continue
      console.error('Error evaluating cleanup guard:', err);
    }

    // ส่ง config ที่แก้ไขแล้วออกไป เพื่อให้ request ทำงานต่อ
    return config;
  },
  (error) => {
    // จัดการกับข้อผิดพลาดของ request
    return Promise.reject(error);
  }
);

// เพิ่ม Response Interceptor เพื่อดักจับ Error Responses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // ตรวจสอบว่า Error มี Response จาก Server และเป็น Status 403 (Forbidden)
    if (error.response && error.response.status === 403) {
      // ตรวจสอบข้อความ Error เพื่อให้แน่ใจว่าเป็น "Invalid or expired token."
      // (อาจจะต้องปรับ string ให้ตรงกับข้อความจริงที่ Backend ส่งมา)
      if (error.response.data?.message === 'Forbidden: Invalid or expired token.') {
        // ล้างข้อมูล Session ทั้งหมด
        localStorage.removeItem('userToken');
        localStorage.removeItem('userType');
        localStorage.removeItem('userInfo');

        // แสดง SweetAlert2 Toast Alert (ไม่ใช่ Modal) กลางจอพร้อม Progress Bar
        if (swalInstance) {
          swalInstance.fire({
            toast: true, // เปลี่ยนกลับเป็น true เพื่อให้แสดงเป็น Toast
            icon: 'error',
            title: 'Session หมดอายุ',
            text: 'โปรดเข้าสู่ระบบใหม่อีกครั้ง',
            position: 'bottom-end', // changed: show at top-right
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
        } else {
          // Fallback ถ้า $swal ไม่พร้อมใช้งาน
          console.error('Session หมดอายุ: Invalid or expired token, redirecting to login...');
          alert('Session หมดอายุ: โปรดเข้าสู่ระบบใหม่อีกครั้ง');
        }
        
        // พาผู้ใช้ไปหน้า Login ทันที
        router.push({ name: 'login' });

        // หยุดการทำงานของ Error นี้ ไม่ให้ส่งต่อไปยัง catch block ใน Component
        return new Promise(() => {}); // Return a pending promise to halt further error propagation
      }
    }
    // สำหรับ Error อื่นๆ หรือ 403 ที่ไม่ใช่ token error ให้ส่ง Error ต่อไป
    return Promise.reject(error);
  }
);

// Export axiosInstance สำหรับใช้แบบ direct import
export { axiosInstance };

// สร้างเป็น Vue Plugin เพื่อให้สามารถใช้งาน $axios ได้ทั่วทั้ง App
export default {
  install: (app) => {
    app.config.globalProperties.$axios = axiosInstance;
    // เก็บ instance ของ $swal ถ้ามี เพื่อให้ Interceptor สามารถเรียกใช้ได้
    if (app.config.globalProperties.$swal) {
      swalInstance = app.config.globalProperties.$swal;
    } else {
        console.warn('SweetAlert2 ($swal) is not registered as a global property. Toast messages for session expiry will use console.error/alert.');
    }
  },
};
