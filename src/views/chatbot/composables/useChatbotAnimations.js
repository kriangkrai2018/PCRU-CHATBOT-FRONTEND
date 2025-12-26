/**
 * Chatbot Animations Composable
 */
export function useChatbotAnimations() {
  function animateOpen(el, done) {
    try {
      const panel = el.querySelector('.chat-panel')
      const overlay = el.querySelector('.overlay-backdrop')
      if (overlay) { overlay.style.opacity = '0'; overlay.style.backdropFilter = 'blur(0px)' }
      if (panel) {
        panel.style.opacity = '0'
        panel.style.transform = 'translate3d(28px,0,0) scale(.986)'
        panel.style.willChange = 'transform, opacity'
      }
      const overlayAnim = overlay ? overlay.animate([
        { opacity: 0, backdropFilter: 'blur(0px)' },
        { opacity: 1, backdropFilter: 'blur(2px)' }
      ], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }) : null
      const panelAnim = panel.animate([
        { transform: 'translate3d(28px,0,0) scale(.986)', opacity: 0, offset: 0 },
        { transform: 'translate3d(-8px,0,0) scale(1.03)', opacity: 1, offset: 0.55 },
        { transform: 'translate3d(4px,0,0) scale(.995)', offset: 0.75 },
        { transform: 'translate3d(0,0,0) scale(1)', opacity: 1, offset: 1 }
      ], { duration: 460, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' })
      Promise.all([overlayAnim ? overlayAnim.finished : Promise.resolve(), panelAnim.finished]).then(() => {
        if (panel) panel.style.willChange = ''
        done()
      }).catch(() => done())
    } catch (e) { done() }
  }

  function animateClose(el, done) {
    try {
      const panel = el.querySelector('.chat-panel')
      const overlay = el.querySelector('.overlay-backdrop')
      if (overlay) { overlay.style.opacity = '1'; overlay.style.backdropFilter = 'blur(2px)' }
      if (panel) {
        panel.style.opacity = '1'
        panel.style.transform = 'translate3d(0,0,0) scale(1)'
        panel.style.willChange = 'transform, opacity'
      }
      const overlayAnim = overlay ? overlay.animate([
        { opacity: 1, backdropFilter: 'blur(2px)' },
        { opacity: 0, backdropFilter: 'blur(0px)' }
      ], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }) : null
      const panelAnim = panel.animate([
        { transform: 'translate3d(0,0,0) scale(1)', opacity: 1, offset: 0 },
        { transform: 'translate3d(4px,0,0) scale(.995)', offset: 0.25 },
        { transform: 'translate3d(-8px,0,0) scale(1.02)', offset: 0.6 },
        { transform: 'translate3d(28px,0,0) scale(.986)', opacity: 0, offset: 1 }
      ], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' })
      Promise.all([overlayAnim ? overlayAnim.finished : Promise.resolve(), panelAnim.finished]).then(() => {
        if (panel) panel.style.willChange = ''
        done()
      }).catch(() => done())
    } catch (e) { done() }
  }

  return { animateOpen, animateClose }
}
