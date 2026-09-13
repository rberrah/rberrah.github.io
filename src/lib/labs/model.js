import { concMono, concTwoComp } from '../utils/math.js';

/** @typedef {Record<string, number>} Parameters */
/** @type {Record<string, Parameters>} */
export const defaults = {
  distribution: { dose: 150, cl: 6, vc: 15, q: 8, vp: 40, tau: 12, count: 1, loading: 1, end: 48 },
  accumulation: { dose: 100, cl: 4, vc: 40, q: 0, vp: 40, tau: 8, count: 8, loading: 1, end: 72 }
};
export const limits = { dose: [1, 1000], cl: [0.1, 30], vc: [5, 100], q: [0, 50], vp: [5, 200], tau: [1, 48], count: [1, 20], loading: [1, 4], end: [12, 336] };

/** @param {string} lab @param {any} supplied @returns {Parameters} */
export function validateParameters(lab, supplied) {
  if (!Object.hasOwn(defaults, lab) || !supplied || typeof supplied !== 'object' || Array.isArray(supplied)) throw new Error('Invalid laboratory');
  if (Object.keys(supplied).some(key => !Object.hasOwn(limits, key))) throw new Error('Unknown parameter');
  const result = { ...defaults[lab], ...supplied };
  for (const [key, [min, max]] of Object.entries(limits)) {
    const value = result[key];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || key === 'count' && !Number.isInteger(value)) throw new Error(`${key}: ${min} - ${max}`);
  }
  return result;
}

/** @param {string} lab @param {Parameters} p */
export function schedule(lab, p) {
  return Array.from({ length: lab === 'distribution' ? 1 : p.count }, (_, i) => ({
    time: i * p.tau, amount: p.dose * (lab === 'accumulation' && i === 0 ? p.loading : 1), infusion: 0
  }));
}

// Closed-form IV bolus states; use the existing central-concentration helpers.
// Eliminated mass also gives exact AUC(0,t) because dA_elim/dt = CL*Ccentral.
/** @param {string} lab @param {Parameters} p @param {number} time */
export function stateAt(lab, p, time, beforeDose = false) {
  const t = Math.max(0, time);
  let central = 0, peripheral = 0, administered = 0;
  for (const dose of schedule(lab, p)) {
    if (dose.time > t || beforeDose && dose.time === t) continue;
    const u = t - dose.time;
    administered += dose.amount;
    if (lab === 'distribution' && p.q > 0) {
      central += p.vc * concTwoComp(u, dose.amount, p.cl, p.q, p.vc, p.vp);
      const k12 = p.q / p.vc, k21 = p.q / p.vp, sum = p.cl / p.vc + k12 + k21;
      const gap = Math.sqrt(sum * sum - 4 * p.cl / p.vc * k21);
      const beta = (sum - gap) / 2;
      peripheral += dose.amount * k12 * Math.exp(-beta * u) * (-Math.expm1(-gap * u)) / gap;
    } else central += p.vc * concMono(u, dose.amount, p.cl, p.vc);
  }
  const eliminated = Math.max(0, administered - central - peripheral);
  const c = central / p.vc;
  return { t, central, peripheral, eliminated, administered, c, cp: peripheral / p.vp,
    auc: eliminated / p.cl, eliminationRate: p.cl * c,
    forward: lab === 'distribution' ? p.q * c : 0, backward: lab === 'distribution' ? p.q * peripheral / p.vp : 0 };
}

/** @param {string} lab @param {Parameters} p */
export function series(lab, p, end = p.end) {
  const times = new Set(Array.from({ length: 481 }, (_, i) => end * i / 480));
  const doses = schedule(lab, p).filter(d => d.time <= end);
  doses.forEach(d => times.add(d.time));
  return [...times].sort((a, b) => a - b).flatMap(t => doses.some(d => d.time === t)
    ? [stateAt(lab, p, t, true), stateAt(lab, p, t)] : [stateAt(lab, p, t)]);
}

/** @param {string} lab @param {Parameters} parameters */
export function laboratorySpec(lab, parameters, reference = parameters, teacher = false, hidden = false) {
  return { type: 'pk-teaching-lab', version: 1, lab, parameters: validateParameters(lab, parameters),
    reference: validateParameters(lab, reference), teacher: Boolean(teacher), hidden: Boolean(teacher && hidden) };
}

// Share only the bounded numeric teaching schema, never arbitrary code or text.
/** @param {ReturnType<typeof laboratorySpec>} spec */
export function encodeScenario(spec) {
  const checked = laboratorySpec(spec.lab, spec.parameters, spec.reference, spec.teacher, spec.hidden);
  const hash = new URLSearchParams({ lab: checked.lab, v: '1', teacher: checked.teacher ? '1' : '0', hide: checked.hidden ? '1' : '0' });
  for (const key of Object.keys(limits)) {
    hash.set(key, String(checked.parameters[key]));
    hash.set(`a_${key}`, String(checked.reference[key]));
  }
  return hash.toString();
}

/** @param {string} hash */
export function decodeScenario(hash) {
  const values = new URLSearchParams(hash.replace(/^#/, ''));
  if (!values.has('lab')) return null;
  const allowed = new Set(['lab', 'v', 'teacher', 'hide', ...Object.keys(limits), ...Object.keys(limits).map(k => `a_${k}`)]);
  if (hash.length > 2500 || [...values.keys()].some(k => !allowed.has(k) || values.getAll(k).length !== 1)) throw new Error('Invalid scenario');
  if (values.has('v') && values.get('v') !== '1') throw new Error('Unsupported version');
  for (const flag of ['teacher', 'hide']) if (values.has(flag) && !['0', '1'].includes(values.get(flag) ?? '')) throw new Error('Invalid setting');
  /** @type {Parameters} */ const p = {};
  /** @type {Parameters} */ const a = {};
  for (const key of Object.keys(limits)) {
    /** @type {[string, Parameters][]} */ const pairs = [['', p], ['a_', a]];
    for (const [prefix, target] of pairs) {
      if (values.has(prefix + key)) {
        const text = values.get(prefix + key);
        if (!text?.trim()) throw new Error('Empty parameter');
        target[key] = Number(text);
      }
    }
  }
  return laboratorySpec(values.get('lab') ?? '', p, Object.keys(a).length ? a : p, values.get('teacher') === '1', values.get('hide') === '1');
}

/** @param {string} lab @param {Parameters} parameters */
export function legoSpec(lab, parameters) {
  const p = validateParameters(lab, parameters);
  const nodes = [{ id: 1, kind: 'central', name: 'CENT', vol: p.vc, dose: schedule(lab, p)[0].amount, x: 70, y: 100 }];
  /** @type {{from:number,to:number|string,k:number,kinetics?:string,eliminationParameterization?:string,cl?:number}[]} */
  const edges = [{ from: 1, to: 'OUT', k: p.cl / p.vc, kinetics: 'first_order', eliminationParameterization: 'clearance', cl: p.cl }];
  if (lab === 'distribution') {
    nodes.push({ id: 2, kind: 'periph', name: 'PERI', vol: p.vp, dose: 0, x: 310, y: 100 });
    edges.push({ from: 1, to: 2, k: p.q / p.vc }, { from: 2, to: 1, k: p.q / p.vp });
  }
  return { version: 3, nodes, edges, covariates: [], simulation: { horizon: p.end } };
}

/** @param {string} lab @param {Parameters} parameters */
export function mrgsolveCode(lab, parameters) {
  const p = validateParameters(lab, parameters), two = lab === 'distribution';
  return `// Teaching PK. No fitted population data. OMEGA/SIGMA are illustrative.
// PK_LEGO_SPEC_V1:${encodeURIComponent(JSON.stringify(legoSpec(lab, p)))}
$PARAM @annotated
TV_cl_L1_CENT : ${p.cl} : Clearance (L/h)
TV_v_L1_CENT : ${p.vc} : Central volume (L)
${two ? `TV_k_L1_CENT_L2_PERI : ${p.q / p.vc} : Forward transfer (1/h)\nTV_k_L2_PERI_L1_CENT : ${p.q / p.vp} : Backward transfer (1/h)\nTV_v_L2_PERI : ${p.vp} : Peripheral volume (L)` : ''}
ETA1 : 0 : Individual clearance effect
ETA2 : 0 : Individual volume effect
$OMEGA 0.09 0.09
$SIGMA 0.04 0.01
$CMT @annotated
L1_CENT : Central [ADM, OBS]
${two ? 'L2_PERI : Peripheral' : ''}
$MAIN
double cl_CENT = TV_cl_L1_CENT * exp(ETA1 + ETA(1));
double v_CENT = TV_v_L1_CENT * exp(ETA2 + ETA(2));
$ODE
dxdt_L1_CENT = -cl_CENT*L1_CENT/v_CENT${two ? ' - TV_k_L1_CENT_L2_PERI*L1_CENT + TV_k_L2_PERI_L1_CENT*L2_PERI' : ''};
${two ? 'dxdt_L2_PERI = TV_k_L1_CENT_L2_PERI*L1_CENT - TV_k_L2_PERI_L1_CENT*L2_PERI;' : ''}
$TABLE
double IPRED = L1_CENT/v_CENT;
double DV = IPRED*(1+EPS(1))+EPS(2);
$CAPTURE DV IPRED
`;
}
