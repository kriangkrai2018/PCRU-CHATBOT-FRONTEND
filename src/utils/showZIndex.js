// Dev-only utility to overlay z-index badges on elements.
// Activated when VITE_SHOW_ZINDEX === 'true'.
export default function showZIndex() {
  if (typeof window === 'undefined') return;
  if (window.__showZIndexCleanup) return; // already running

  const ID = 'zindex-overlay';
  let container = document.getElementById(ID);
  if (!container) {
    container = document.createElement('div');
    container.id = ID;
    Object.assign(container.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: '2147483647'
    });
    document.body.appendChild(container);
  }

  const style = document.createElement('style');
  style.textContent = `
    .zindex-badge {
      position: absolute;
      font-size: 11px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace;
      padding: 2px 6px;
      border-radius: 4px;
      color: white;
      background: rgba(0,0,0,0.6);
      pointer-events: none;
      transform-origin: top left;
      z-index: 2147483647;
      white-space: nowrap;
    }
    .zindex-badge.low { background: rgba(0,128,0,0.6); }
    .zindex-badge.medium { background: rgba(255,165,0,0.9); }
    .zindex-badge.high { background: rgba(200,0,0,0.9); }
  `;
  document.head.appendChild(style);

  const badges = new Map();

  function scan() {
    const els = Array.from(document.querySelectorAll('body *'));
    const now = new Set();

    els.forEach(el => {
      try {
        const cs = getComputedStyle(el);
        const zi = cs.zIndex;
        if (!zi || zi === 'auto') return;
        const n = parseInt(zi, 10);
        if (Number.isNaN(n) || n === 0) return; // skip neutral elements
        now.add(el);
        if (badges.has(el)) return;

        const badge = document.createElement('div');
        badge.className = 'zindex-badge';
        badge.textContent = `z: ${zi}`;

        const v = Math.abs(n);
        if (v >= 1000) badge.classList.add('high');
        else if (v >= 100) badge.classList.add('medium');
        else badge.classList.add('low');

        container.appendChild(badge);
        badges.set(el, badge);
      } catch (e) {
        // ignore cross-origin or other inspection errors
      }
    });

    // remove badges no longer applicable
    badges.forEach((badge, el) => {
      if (!now.has(el) || !document.body.contains(el)) {
        badge.remove();
        badges.delete(el);
      }
    });

    updatePositions();
  }

  function updatePositions() {
    badges.forEach((badge, el) => {
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const left = rect.left + window.scrollX;
      // place badge at top-left of element, slightly offset so it doesn't overlap
      badge.style.top = `${Math.max(0, top - 6)}px`;
      badge.style.left = `${Math.max(0, left)}px`;
    });
  }

  let raf = 0;
  function scheduleUpdate() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      updatePositions();
    });
  }

  const mo = new MutationObserver(() => scan());
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });

  window.addEventListener('resize', scheduleUpdate, { passive: true });
  window.addEventListener('scroll', scheduleUpdate, { passive: true });

  // initial run with a short delay to allow page paint
  setTimeout(scan, 50);

  // expose cleanup so developer can programmatically stop it
  window.__showZIndexCleanup = () => {
    mo.disconnect();
    window.removeEventListener('resize', scheduleUpdate);
    window.removeEventListener('scroll', scheduleUpdate);
    if (container) container.remove();
    if (style) style.remove();
    badges.clear();
    delete window.__showZIndexCleanup;
  };
}
