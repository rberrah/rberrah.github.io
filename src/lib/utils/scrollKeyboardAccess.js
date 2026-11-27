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
    frame = 0;
    const elements = descendants
      ? Array.from(node.querySelectorAll(selector)).filter(el => el instanceof HTMLElement)
      : [node];
    const current = new Set(elements);
    for (const el of watched) if (!current.has(el)) {
      resize.unobserve(el); watched.delete(el);
      if (added.delete(el)) el.removeAttribute('tabindex');
    }
    for (const el of elements) {
      if (!watched.has(el)) { watched.add(el); resize.observe(el); }
      const style = getComputedStyle(el);
      const scrolls = (/(auto|scroll)/.test(style.overflowX) && el.scrollWidth > el.clientWidth + 1)
        || (/(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight + 1);
      const focusableChild = el.querySelector('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]');
      if (scrolls && !focusableChild && !el.hasAttribute('tabindex')) {
        el.tabIndex = 0; added.add(el);
      } else if ((!scrolls || focusableChild) && added.delete(el)) {
        el.removeAttribute('tabindex');
      }
    }
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(refresh); }
  const mutations = new MutationObserver(schedule);
  mutations.observe(node, { childList: true, subtree: true, characterData: true });
  resize.observe(node);
  schedule();
  return { destroy() {
    mutations.disconnect(); resize.disconnect(); cancelAnimationFrame(frame);
    for (const el of added) el.removeAttribute('tabindex');
  }};
}
