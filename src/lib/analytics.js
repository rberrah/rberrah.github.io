// Shared by SvelteKit and the static portal. Only callers' public route names
// are accepted: never pass patient/model state or a browser URL to this module.
import { SITE_ORIGIN } from './site-origin.js';
export const GOATCOUNTER_ENDPOINT = 'https://rberrah.goatcounter.com/count';
let lastPage = '';

export function isOptedOut() {
  try { return localStorage.getItem('skipgc') === 't'; }
  catch { return true; }
}

/** @param {boolean} disabled */
export function setOptOut(disabled) {
  try {
    if (disabled) localStorage.setItem('skipgc', 't');
    else localStorage.removeItem('skipgc');
    return true;
  } catch { return false; }
}

/** @param {string | null} path A known public route, not location.pathname. */
export function countPage(path) {
  if (typeof window === 'undefined') return;
  if (!path) { lastPage = ''; return; }
  if (!/^\/(?:[a-z0-9-]+\/)*$/.test(path) || path === lastPage) return;
  if (location.origin !== SITE_ORIGIN ||
      window !== window.top || isOptedOut()) return;
  lastPage = path;
  // count.js also sends location.search in `q`, even with an explicit path.
  // The documented pixel endpoint lets us omit query, title, referrer and screen.
  const query = new URLSearchParams({ p: path, rnd: Math.random().toString(36).slice(2) });
  if (navigator.webdriver) query.set('b', '153');
  void fetch(`${GOATCOUNTER_ENDPOINT}?${query}`, {
    mode: 'no-cors', credentials: 'omit', referrerPolicy: 'no-referrer', keepalive: true
  }).catch(() => {});
}
