import { ref } from 'vue';

// สร้าง State ที่เป็น Global สำหรับการหมุนของโลโก้
const rotateX = ref(0);
const rotateY = ref(0);

// Export ฟังก์ชันเพื่อให้ทุก Component สามารถดึง State นี้ไปใช้ได้
export function useLogoState() {
  return { rotateX, rotateY };
}

