import { laboratorySpec, legoSpec, mrgsolveCode } from './model.js';

/** Fresh Shiny session; a correlated server ACK confirms validation, not just receipt.
 * @param {string} engine @param {string} lang @param {any} value
 * @param {(state: string, detail?: string) => void} status
 */
export function openLaboratoryTdm(engine, lang, value, status) {
  const spec = laboratorySpec(value.lab, value.parameters);
  const url = new URL(engine, window.location.href);
  url.searchParams.set('source', 'custom'); url.searchParams.set('lang', lang);
  url.searchParams.set('bridge', 'lego'); url.searchParams.set('origin', window.location.origin);
  const target = window.open(url, '_blank');
  if (!target) { status('blocked'); return () => {}; }
  const payload = { type: 'pk-lego-model', id: crypto.randomUUID(), name: `teaching_${spec.lab}`,
    code: mrgsolveCode(spec.lab, spec.parameters), spec: legoSpec(spec.lab, spec.parameters), teaching: spec };
  let timer = 0, attempts = 0;
  const cleanup = () => { window.clearInterval(timer); window.removeEventListener('message', acknowledge); };
  /** @param {MessageEvent} event */
  function acknowledge(event) {
    if (event.source !== target || event.origin !== url.origin || event.data?.type !== 'pk-lego-model-ack' || event.data.id !== payload.id) return;
    status(event.data.ok ? 'done' : 'error', event.data.error); cleanup();
  }
  function transmit() {
    if (!target || target.closed || attempts++ > 120) { status('timeout'); cleanup(); return; }
    target.postMessage(payload, url.origin);
  }
  status('sending'); window.addEventListener('message', acknowledge);
  timer = window.setInterval(transmit, 500); transmit();
  return cleanup;
}
