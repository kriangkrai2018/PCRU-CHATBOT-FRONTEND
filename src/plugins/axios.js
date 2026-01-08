import axios from 'axios';
import router from '@/router'; // นำเข้า router เพื่อใช้ในการนำทาง
// ตัวแปรสำหรับเก็บ instance ของ SweetAlert2 (ถ้ามี)
let swalInstance = null; 

// สร้าง Axios instance
const axiosInstance = axios.create({
  // กำหนด Base URL ของ Backend API
  baseURL: import.meta.env.VITE_API_BASE_URL, // ตรวจสอบให้แน่ใจว่าเป็น URL ของ Backend ของคุณ
  timeout: parseInt(import.meta.env.VITE_AXIOS_TIMEOUT || '10000'), // 🕒 increase default timeout to avoid quick aborts
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
    } else {
      // If no token and the request is accidentally going to the protected '/getcategories',
      // rewrite it to the public '/categories' to avoid 401 on public pages
      try {
        if (config && typeof config.url === 'string' && config.url.includes('/getcategories')) {
          console.warn('[axios] No token present – rewriting request path /getcategories -> /categories to avoid 401');
          config.url = config.url.replace('/getcategories', '/categories');
        }
      } catch (e) {
        // ignore rewrite problems
      }
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
    // Handle Forbidden due to invalid/expired tokens (403)
    if (error.response && error.response.status === 403) {
      if (error.response.data?.message === 'Forbidden: Invalid or expired token.') {
        // Clear session and redirect to login
        localStorage.removeItem('userToken');
        localStorage.removeItem('userType');
        localStorage.removeItem('userInfo');

        if (swalInstance) {
          swalInstance.fire({
            toast: true,
            icon: 'error',
            title: 'Session หมดอายุ',
            text: 'โปรดเข้าสู่ระบบใหม่อีกครั้ง',
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
        } else {
          console.error('Session หมดอายุ: Invalid or expired token, redirecting to login...');
          alert('Session หมดอายุ: โปรดเข้าสู่ระบบใหม่อีกครั้ง');
        }

        router.push({ name: 'login' });
        return new Promise(() => {});
      }
    }

    // NEW: Handle 401 responses indicating session timeout or idle timeout
    if (error.response && error.response.status === 401) {
      const code = error.response.data?.code;
      const msg = error.response.data?.message || '';

      const isIdle = code === 'IDLE_TIMEOUT' || msg.toLowerCase().includes('inactivity') || msg.toLowerCase().includes('idle');
      const isSession = code === 'SESSION_TIMEOUT' || msg.toLowerCase().includes('session expired');

      if (isIdle || isSession) {
        // Clear session and show message
        localStorage.removeItem('userToken');
        localStorage.removeItem('userType');
        localStorage.removeItem('userInfo');

        if (swalInstance) {
          swalInstance.fire({
            toast: true,
            icon: 'error',
            title: 'Session หมดอายุ',
            text: 'เซสชันหมดอายุหรือไม่มีกิจกรรมล่าสุด โปรดเข้าสู่ระบบใหม่',
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true
          });
        } else {
          console.error('Session expired due to inactivity or session timeout. Redirecting to login...');
          alert('Session หมดอายุ: โปรดเข้าสู่ระบบใหม่อีกครั้ง');
        }

        router.push({ name: 'login' });
        return new Promise(() => {});
      }
    }

    // For other errors, propagate
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
