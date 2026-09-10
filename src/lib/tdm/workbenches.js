/** Mechanism keys are shared with ddi_validate_mechanism in the R engine.
 * @type {{id: string, fr: string, en: string, equation: string, fields: ('factor'|'strength'|'c50'|'hill'|'kdeg'|'kinact')[], frNote: string, enNote: string}[]}
 */
export const ddiMechanisms = [
  { id: 'factor', fr: 'Facteur constant', en: 'Constant factor', equation: 'P = P0 * facteur', fields: ['factor'], frNote: 'Modification fixe pendant le traitement, sans relation avec la concentration.', enNote: 'Fixed change during treatment, independent of concentration.' },
  { id: 'reversible', fr: 'Inhibition reversible (Ki)', en: 'Reversible inhibition (Ki)', equation: 'P/P0 = 1 / (1 + C2/Ki)', fields: ['c50'], frNote: 'La diminution suit la concentration. Ki doit utiliser la meme unite et la meme definition de concentration que le modele 2.', enNote: 'The reduction follows concentration. Ki must use the same concentration unit and definition as model 2.' },
  { id: 'inhibition', fr: 'Inhibition Emax', en: 'Emax inhibition', equation: 'P/P0 = 1 - Imax*C2/(IC50+C2)', fields: ['strength', 'c50'], frNote: 'Imax fixe la diminution maximale, entre 0 et 1.', enNote: 'Imax sets the maximum reduction, between 0 and 1.' },
  { id: 'hill_inhibition', fr: 'Inhibition sigmoide (Hill)', en: 'Sigmoid inhibition (Hill)', equation: 'P/P0 = 1 - Imax*C2^h/(IC50^h+C2^h)', fields: ['strength', 'c50', 'hill'], frNote: 'Le coefficient de Hill regle la pente autour de IC50.', enNote: 'The Hill coefficient controls the slope around IC50.' },
  { id: 'induction', fr: 'Stimulation Emax instantanee', en: 'Instantaneous Emax stimulation', equation: 'P/P0 = 1 + Emax*C2/(EC50+C2)', fields: ['strength', 'c50'], frNote: 'Relation empirique instantanee : elle ne represente pas un renouvellement enzymatique.', enNote: 'Instantaneous empirical relationship: it does not represent enzyme turnover.' },
  { id: 'tdi', fr: 'Inhibition dependante du temps', en: 'Time-dependent inhibition', equation: 'dA/dt = kdeg*(1-A) - kinact*C2/(KI+C2)*A', fields: ['c50', 'kinact', 'kdeg'], frNote: 'A(0)=1. Inactivation progressive et recuperation apres arret, selon le renouvellement kdeg. P = P0*A.', enNote: 'A(0)=1. Progressive inactivation and recovery after stopping, governed by kdeg turnover. P = P0*A.' },
  { id: 'turnover_induction', fr: 'Induction avec renouvellement', en: 'Induction with turnover', equation: 'dA/dt = kdeg*(1+Emax*C2/(EC50+C2)-A)', fields: ['strength', 'c50', 'kdeg'], frNote: 'La synthese est stimulee; le delai de montee et de retour depend de kdeg. A(0)=1; P = P0*A.', enNote: 'Synthesis is stimulated; onset and recovery depend on kdeg. A(0)=1; P = P0*A.' }
];

/** @type {Record<string, number>} */
export const oncoDefaults = { V: 20, CL: 10, T0: 60, KG: 0.01, CAP: 300, KILL: 0.25, EC50: 1, RES: 0, ANC0: 4, MTT: 5, GAMMA: 0.17, SLOPE: 0.15 };
/** @type {Record<string, string>} */
export const oncoLabels = { V: 'V (L)', CL: 'CL (L/day)', T0: 'SLD(0) (mm)', KG: 'KG (1/day)', CAP: 'CAP (mm)', KILL: 'KILL max (1/day)', EC50: 'EC50 (mg/L)', RES: 'Resistance (1/day)', ANC0: 'ANC(0) (10^9/L)', MTT: 'MTT (day)', GAMMA: 'Gamma', SLOPE: 'SLOPE (L/mg)' };

/** @param {string} view @param {any} config @param {any[]} [models] */
export function workshopSpec(view, config, models) {
  return { type: 'pk-workbench', version: 1, view, config, ...(models ? { models } : {}) };
}

/** Session-only handoff; nothing is stored in URLs, browser storage or a database.
 * @param {string} engine @param {string} lang @param {any} spec
 * @param {(state: string, detail?: string) => void} status
 * @param {(result: any) => void} [receive]
 */
export function openWorkshop(engine, lang, spec, status, receive = () => {}) {
  const url = new URL(engine, window.location.href);
  url.searchParams.set('view', spec.view === 'ddi' ? 'ddi' : 'pd');
  url.searchParams.set('lang', lang);
  url.searchParams.set('bridge', 'workbench');
  url.searchParams.set('origin', window.location.origin);
  const target = window.open(url, '_blank');
  if (!target) { status('blocked'); return () => {}; }
  const payload = { ...spec, id: crypto.randomUUID() };
  let attempts = 0;
  let timer = 0;
  const cleanup = () => { window.clearInterval(timer); window.removeEventListener('message', acknowledge); };
  /** @param {MessageEvent} event */
  const acknowledge = (event) => {
    if (event.source !== target || event.origin !== url.origin || event.data?.id !== payload.id) return;
    if (event.data.type === 'pk-workbench-result') {
      const curves = event.data.curves;
      if (event.data.view !== 'onco' || !Array.isArray(curves) || curves.length !== 2 || !curves.every((/** @type {any} */ c) => ['untreated','treated'].includes(c.key) && Array.isArray(c.points) && c.points.length <= 2000 && c.points.every((/** @type {any} */ p) => Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= 0 && p.y >= 0))) return;
      receive({curves}); return;
    }
    if (event.data.type !== 'pk-workbench-ack') return;
    status(event.data.ok ? 'done' : 'error', event.data.error);
    window.clearInterval(timer);
    if (!event.data.ok) cleanup();
  };
  const transmit = () => {
    if (target.closed || attempts++ > 120) { status('timeout'); cleanup(); return; }
    target.postMessage(payload, url.origin);
  };
  status('sending');
  window.addEventListener('message', acknowledge);
  timer = window.setInterval(transmit, 500);
  transmit();
  return cleanup;
}
