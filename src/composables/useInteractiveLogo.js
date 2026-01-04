import { ref, onMounted, onUnmounted } from 'vue';
import { useLogoState } from '@/stores/logoStore.js';

/**
 * A Vue Composable for creating an interactive 3D logo
 * that can be dragged and has physics-based inertia.
 */
export function useInteractiveLogo() {
  // --- ดึง Global State มาใช้งาน ---
  const { rotateX, rotateY } = useLogoState();
  const isDragging = ref(false);
  const lastX = ref(0);
  const lastY = ref(0);
  const velocityX = ref(0);
  const velocityY = ref(0);
  const animationFrameId = ref(null);

  // --- Event Handlers (Mouse) ---
  function handleMouseDown(event) {
    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value);
      animationFrameId.value = null;
    }
    isDragging.value = true;
    lastX.value = event.clientX;
    lastY.value = event.clientY;
    velocityX.value = 0;
    velocityY.value = 0;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  function handleMouseMove(event) {
    if (!isDragging.value) return;

    const dx = event.clientX - lastX.value;
    const dy = event.clientY - lastY.value;

    updateRotation(dx, dy);

    lastX.value = event.clientX;
    lastY.value = event.clientY;
  }

  function handleMouseUp() {
    isDragging.value = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    animate(); // Restart animation loop for inertia
  }

  // --- Event Handlers (Touch) ---
  function handleTouchStart(event) {
    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value);
      animationFrameId.value = null;
    }
    isDragging.value = true;
    const touch = event.touches[0];
    lastX.value = touch.clientX;
    lastY.value = touch.clientY;
    velocityX.value = 0;
    velocityY.value = 0;
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
  }

  function handleTouchMove(event) {
    if (!isDragging.value) return;
    // Prevent scrolling while dragging the logo
    if (event.cancelable) event.preventDefault();

    const touch = event.touches[0];
    const dx = touch.clientX - lastX.value;
    const dy = touch.clientY - lastY.value;

    updateRotation(dx, dy);

    lastX.value = touch.clientX;
    lastY.value = touch.clientY;
  }

  function handleTouchEnd() {
    isDragging.value = false;
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);
    animate();
  }

  // Shared rotation update logic
  function updateRotation(dx, dy) {
    // Update velocity using a moving average for smoother throws
    const throwSensitivity = 2.18; 
    velocityX.value = (velocityX.value * 0.7) + (dx * 0.3) * throwSensitivity; 
    velocityY.value = (velocityY.value * 0.7) + (dy * 0.3) * throwSensitivity; 

    // Rotate immediately based on drag
    rotateY.value += dx;
    rotateX.value -= dy;
  }

  function animate() {
    if (!isDragging.value) {
      const damping = 0.96;
      const autoRotateSpeed = 0.118; 

      if (Math.abs(velocityX.value) > 0.1 || Math.abs(velocityY.value) > 0.1) {
        rotateY.value += velocityX.value;
        rotateX.value -= velocityY.value;
        velocityX.value *= damping;
        velocityY.value *= damping;
      } else {
        rotateY.value += autoRotateSpeed;
      }
    }
    animationFrameId.value = requestAnimationFrame(animate);
  }

  onMounted(() => animate());

  onUnmounted(() => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);
    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value);
    }
  });

  // Expose the state and methods to the component
  return { isDragging, handleMouseDown, handleTouchStart };
}
