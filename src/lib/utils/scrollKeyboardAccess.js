/**
 * Give keyboard users access to genuine overflow regions without introducing
 * tab stops for every short code example or mathematical expression.
 * @param {HTMLElement} node
 * @param {boolean} descendants
 */
export function scrollKeyboardAccess(node, descendants) {
  /** @type {Set<HTMLElement>} */
  const added = new Set();
  /** @type {Set<HTMLElement>} */
  const watched = new Set();
  let frame = 0;
  const selector = 'pre, .math-rendered, .katex-display';
  const resize = new ResizeObserver(schedule);
  function refresh() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    const elements = descendants
      ? Array.from(node.querySelectorAll(selector)).filter(el => el instanceof HTMLElement).reverse()
      : [node];
    const current = new Set(elements);
    for (const el of watched) if (!current.has(el)) {
      resize.unobserve(el); watched.delete(el);
      if (added.delete(el)) el.removeAttribute('tabindex');
    }
    for (const el of elements) {
      if (!watched.has(el)) { watched.add(el); resize.observe(el); }
      const style = getComputedStyle(el);
      const scrolls = (/(auto|scroll)/.test(style.overflowX) && el.scrollWidth > el.clientWidth)
        || (/(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight);
      const focusableChild = Array.from(el.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')).some(child =>
        child instanceof HTMLElement && child.tabIndex >= 0 && !child.matches(':disabled')
        && !child.closest('[inert]') && child.getClientRects().length > 0
        && getComputedStyle(child).visibility === 'visible');
      if (scrolls && !focusableChild && !el.hasAttribute('tabindex')) {
        el.tabIndex = 0; added.add(el);
      } else if ((!scrolls || focusableChild) && added.delete(el)) {
        el.removeAttribute('tabindex');
      }
    }
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(refresh); }
  const mutations = new MutationObserver(schedule);
  mutations.observe(node, { childList: true, subtree: true, characterData: true, attributes: true,
    attributeFilter: ['class','style','hidden','disabled','inert','tabindex','href'] });
  resize.observe(node);
  // Late font substitution can change scrollWidth without resizing the box.
  document.fonts?.addEventListener('loadingdone', schedule);
  node.addEventListener('load', schedule, true);
  // Synchronous initial measurement, plus a frame after first layout.
  refresh(); schedule();
  return { destroy() {
    mutations.disconnect(); resize.disconnect(); cancelAnimationFrame(frame);
    document.fonts?.removeEventListener('loadingdone', schedule);
    node.removeEventListener('load', schedule, true);
    for (const el of added) el.removeAttribute('tabindex');
  }};
}
