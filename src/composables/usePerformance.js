/**
 * 🍎 Apple-style Performance Utilities
 * High-performance composable functions for Vue 3
 * 
 * Includes:
 * - requestAnimationFrame wrapper
 * - Throttle & Debounce
 * - Intersection Observer (lazy loading)
 * - Smooth scroll utilities
 * - Animation frame scheduler
 */

import { ref, onMounted, onUnmounted, watch } from 'vue'

/**
 * Request Animation Frame wrapper for smooth animations
 * Ensures 60fps by batching DOM updates
 */
export function useRAF() {
  let rafId = null
  const isRunning = ref(false)

  const start = (callback) => {
    if (isRunning.value) return
    isRunning.value = true

    const loop = (timestamp) => {
      if (!isRunning.value) return
      callback(timestamp)
      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)
  }

  const stop = () => {
    isRunning.value = false
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  // Single frame execution
  const once = (callback) => {
    return requestAnimationFrame(callback)
  }

  onUnmounted(stop)

  return { start, stop, once, isRunning }
}

/**
 * Throttle function - limit function calls
 * Apple uses this for scroll handlers
 */
export function useThrottle(fn, delay = 16) {
  let lastCall = 0
  let rafId = null

  const throttled = (...args) => {
    const now = performance.now()
    const remaining = delay - (now - lastCall)

    if (remaining <= 0) {
      if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
      lastCall = now
      fn(...args)
    } else if (!rafId) {
      rafId = requestAnimationFrame(() => {
        lastCall = performance.now()
        rafId = null
        fn(...args)
      })
    }
  }

  const cancel = () => {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  onUnmounted(cancel)

  return { throttled, cancel }
}

/**
 * Debounce function - delay function execution
 * Apple uses this for search inputs
 */
export function useDebounce(fn, delay = 300) {
  let timeoutId = null

  const debounced = (...args) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delay)
  }

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const flush = (...args) => {
    cancel()
    fn(...args)
  }

  onUnmounted(cancel)

  return { debounced, cancel, flush }
}

/**
 * Intersection Observer for lazy loading
 * Apple uses this to load images and animations when visible
 */
export function useIntersectionObserver(options = {}) {
  const isVisible = ref(false)
  const elementRef = ref(null)
  let observer = null

  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  }

  const observe = (element) => {
    if (!element) return

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isVisible.value = entry.isIntersecting
        
        // Optional: unobserve after first visible (for one-time animations)
        if (entry.isIntersecting && options.once) {
          observer.unobserve(entry.target)
        }
      })
    }, defaultOptions)

    observer.observe(element)
  }

  const unobserve = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  onMounted(() => {
    if (elementRef.value) {
      observe(elementRef.value)
    }
  })

  onUnmounted(unobserve)

  return { isVisible, elementRef, observe, unobserve }
}

/**
 * Smooth scroll utility
 * Apple-style smooth scrolling with easing
 */
export function useSmoothScroll() {
  const { once } = useRAF()

  const scrollTo = (target, options = {}) => {
    const {
      duration = 500,
      easing = (t) => t * (2 - t), // Apple's ease-out quad
      offset = 0,
      container = window
    } = options

    const isWindow = container === window
    const start = isWindow ? window.pageYOffset : container.scrollTop
    
    let targetPosition
    if (typeof target === 'number') {
      targetPosition = target
    } else if (target instanceof Element) {
      const rect = target.getBoundingClientRect()
      targetPosition = rect.top + (isWindow ? window.pageYOffset : container.scrollTop)
    } else {
      return
    }

    targetPosition += offset
    const distance = targetPosition - start
    let startTime = null

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easing(progress)

      const currentPosition = start + (distance * easedProgress)
      
      if (isWindow) {
        window.scrollTo(0, currentPosition)
      } else {
        container.scrollTop = currentPosition
      }

      if (progress < 1) {
        once(step)
      }
    }

    once(step)
  }

  const scrollToTop = (options = {}) => {
    scrollTo(0, options)
  }

  const scrollToBottom = (container, options = {}) => {
    const target = container === window 
      ? document.body.scrollHeight 
      : container.scrollHeight
    scrollTo(target, { ...options, container })
  }

  return { scrollTo, scrollToTop, scrollToBottom }
}

/**
 * Animation scheduler for complex animations
 * Batches multiple animations into single frame
 */
export function useAnimationScheduler() {
  const queue = []
  let isProcessing = false

  const schedule = (callback, priority = 0) => {
    queue.push({ callback, priority })
    queue.sort((a, b) => b.priority - a.priority)
    
    if (!isProcessing) {
      isProcessing = true
      requestAnimationFrame(processQueue)
    }
  }

  const processQueue = () => {
    const batch = queue.splice(0, queue.length)
    batch.forEach(({ callback }) => callback())
    isProcessing = false
  }

  return { schedule }
}

/**
 * Preload images for instant display
 * Apple preloads hero images before showing them
 */
export function useImagePreloader() {
  const loaded = ref(new Set())
  const loading = ref(new Set())
  const errors = ref(new Set())

  const preload = (src) => {
    return new Promise((resolve, reject) => {
      if (loaded.value.has(src)) {
        resolve(src)
        return
      }

      loading.value.add(src)
      const img = new Image()
      
      img.onload = () => {
        loading.value.delete(src)
        loaded.value.add(src)
        resolve(src)
      }
      
      img.onerror = () => {
        loading.value.delete(src)
        errors.value.add(src)
        reject(new Error(`Failed to load: ${src}`))
      }
      
      img.src = src
    })
  }

  const preloadAll = (sources) => {
    return Promise.allSettled(sources.map(preload))
  }

  const isLoaded = (src) => loaded.value.has(src)
  const isLoading = (src) => loading.value.has(src)
  const hasError = (src) => errors.value.has(src)

  return { preload, preloadAll, isLoaded, isLoading, hasError, loaded, loading, errors }
}

/**
 * Performance metrics observer
 * Track FPS and frame drops
 */
export function usePerformanceMetrics() {
  const fps = ref(60)
  const frameDrops = ref(0)
  let lastFrameTime = performance.now()
  let frameCount = 0
  let rafId = null

  const start = () => {
    const measureFPS = (timestamp) => {
      frameCount++
      const delta = timestamp - lastFrameTime

      if (delta >= 1000) {
        fps.value = Math.round((frameCount * 1000) / delta)
        
        // Count frame drops (below 55fps threshold)
        if (fps.value < 55) {
          frameDrops.value++
        }
        
        frameCount = 0
        lastFrameTime = timestamp
      }

      rafId = requestAnimationFrame(measureFPS)
    }

    rafId = requestAnimationFrame(measureFPS)
  }

  const stop = () => {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  const reset = () => {
    fps.value = 60
    frameDrops.value = 0
    frameCount = 0
    lastFrameTime = performance.now()
  }

  onUnmounted(stop)

  return { fps, frameDrops, start, stop, reset }
}

/**
 * Reduced motion detection
 * Respect user's accessibility preferences (Apple does this)
 */
export function useReducedMotion() {
  const prefersReducedMotion = ref(false)

  const updatePreference = () => {
    prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  onMounted(() => {
    updatePreference()
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.addEventListener('change', updatePreference)
    
    onUnmounted(() => {
      mediaQuery.removeEventListener('change', updatePreference)
    })
  })

  return { prefersReducedMotion }
}

/**
 * Idle callback for non-critical tasks
 * Apple uses this to defer non-essential work
 */
export function useIdleCallback() {
  const schedule = (callback, options = { timeout: 1000 }) => {
    if ('requestIdleCallback' in window) {
      return requestIdleCallback(callback, options)
    } else {
      // Fallback for Safari
      return setTimeout(callback, 1)
    }
  }

  const cancel = (id) => {
    if ('cancelIdleCallback' in window) {
      cancelIdleCallback(id)
    } else {
      clearTimeout(id)
    }
  }

  return { schedule, cancel }
}

export default {
  useRAF,
  useThrottle,
  useDebounce,
  useIntersectionObserver,
  useSmoothScroll,
  useAnimationScheduler,
  useImagePreloader,
  usePerformanceMetrics,
  useReducedMotion,
  useIdleCallback
}
