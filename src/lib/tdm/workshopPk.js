import { randomLcg, randomNormal } from 'd3';
import { rk4 } from '../sim/ode.js';

/** Repeated IV doses, starting at zero or at steady state. Time and infusion are in hours.
 * @param {number} time @param {any} p @param {boolean} [ss]
 */
export function ivConcentration(time, p, ss = false) {
  const { v, cl, dose, interval, infusion } = p;
  if (![v, cl, dose, interval, infusion, time].every(Number.isFinite) || v <= 0 || cl <= 0 || dose < 0 || interval < .25 || infusion < 0 || infusion > interval) throw new Error('Invalid IV regimen');
  if (time < 0) return 0;
  const k = cl / v, n = Math.floor(time / interval), age = time - n * interval;
  const prior = (ss ? 1 : -Math.expm1(-k * n * interval)) / -Math.expm1(-k * interval);
  if (infusion === 0) return dose / v * Math.exp(-k * age) * (1 + Math.exp(-k * interval) * prior);
  const plateau = dose / (infusion * cl);
  return plateau * (-Math.expm1(-k * Math.min(age, infusion)) * Math.exp(-k * Math.max(0, age - infusion)) +
    -Math.expm1(-k * infusion) * Math.exp(-k * (age + interval - infusion)) * prior);
}

/** @param {number} horizon @param {any} p */
function doseKnots(horizon, p) {
  if (!(horizon > 0 && horizon <= 2400) || !(p.interval >= .25) || horizon / p.interval > 10000) throw new Error('Preview size limit');
  const knots = [0, horizon];
  for (let i = 0; i * p.interval < horizon; i++) {
    const time = i * p.interval;
    knots.push(time);
    if (p.infusion > 0 && time + p.infusion < horizon) knots.push(time + p.infusion);
  }
  return [...new Set(knots)].sort((a, b) => a - b);
}

/** Uses the existing RK4 solver, restarting at dose/infusion events.
 * @param {any} config
 */
export function pdIvProfile(config) {
  const p = config.parameters, pk = { v: config.v, cl: config.cl, ...config.regimen };
  ivConcentration(0, pk);
  const indirect = /_(in|out)$/.test(config.type);
  const signal = (/** @type {number} */ c) => config.type === 'linear' ? p.SLOPE * c : p.EMAX / (1 + (p.EC50 / Math.max(1e-300, c)) ** (config.type === 'hill' ? p.HILL : 1));
  if (!(p.E0 > 0) || config.delay && !(p.KE0 > 0) || indirect && !(p.KOUT > 0) || /^inhibit/.test(config.type) && !(p.EMAX >= 0 && p.EMAX <= 1)) throw new Error('Invalid PD parameters');
  if (config.type !== 'linear' && !(p.EC50 > 0) || config.type === 'hill' && !(p.HILL > 0) || /^stimulate/.test(config.type) && p.EMAX < 0) throw new Error('Invalid PD parameters');
  const rate = Math.max(pk.cl / pk.v, config.delay ? p.KE0 : 0, indirect ? p.KOUT * (1 + Math.abs(p.EMAX)) : 0);
  const step = Math.min(config.horizon / 1000, .1 / rate);
  if (!(step > 0) || config.horizon / step > 200000) throw new Error('Use the R solver for these time scales');
  const knots = doseKnots(config.horizon, pk);
  let state = [0, p.E0];
  /** @type {{time:number,concentration:number,effect:number}[]} */
  const rows = [];
  for (let i = 1; i < knots.length; i++) {
    const left = knots[i-1], right = knots[i], end = right - Math.min(1e-9, (right - left) * 1e-6);
    const cp = (/** @type {number} */ t) => ivConcentration(Math.min(t, end), pk);
    const rhs = (/** @type {number} */ t, /** @type {number[]} */ y) => {
      const s = signal(config.delay ? y[0] : cp(t));
      const production = config.type === 'inhibit_in' ? 1 - s : config.type === 'stimulate_in' ? 1 + s : 1;
      const loss = config.type === 'inhibit_out' ? 1 - s : config.type === 'stimulate_out' ? 1 + s : 1;
      return [config.delay ? p.KE0 * (cp(t) - y[0]) : 0, indirect ? p.KOUT * (p.E0 * production - loss * y[1]) : 0];
    };
    const result = rk4(rhs, state, left, right, (right - left) / Math.ceil((right - left) / step), {});
    for (let j = 0; j < result.t.length; j++) {
      const time = Math.min(result.t[j], right), concentration = cp(time);
      rows.push({ time, concentration, effect: indirect ? result.y[j][1] : p.E0 + signal(config.delay ? result.y[j][0] : concentration) });
    }
    state = result.y.at(-1) ?? state;
  }
  return rows;
}

/** Exact stationary indices for the one-compartment teaching model.
 * @param {any} pk @param {any} config @param {number} mic
 */
export function ivIndex(pk, config, mic) {
  const fu = config.basis === 'free' ? config.fu : 1, k = pk.cl / pk.v;
  const cmax = ivConcentration(pk.infusion, pk, true) * fu;
  const cmin = cmax * Math.exp(-k * (pk.interval - pk.infusion));
  if (config.metric === 'peak') return cmax / mic;
  if (config.metric === 'time') {
    const threshold = mic * config.multiple;
    if (threshold >= cmax) return 0;
    if (threshold <= cmin) return 100;
    const plateau = pk.infusion > 0 ? pk.dose / (pk.infusion * pk.cl) * fu : 0;
    const rise = pk.infusion > 0 ? -Math.log((plateau - threshold) / (plateau - cmin)) / k : 0;
    const fall = pk.infusion + Math.log(cmax / threshold) / k;
    return 100 * Math.max(0, Math.min(pk.interval, fall) - rise) / pk.interval;
  }
  // Integrate exactly 24 hours from a dose, including a partial last interval.
  let auc = 0;
  for (let start = 0; start < 24; start += pk.interval) {
    const duration = Math.min(pk.interval, 24 - start), on = Math.min(duration, pk.infusion);
    if (on > 0) {
      const plateau = pk.dose / (pk.infusion * pk.cl) * fu;
      auc += plateau * on + (cmin - plateau) * -Math.expm1(-k * on) / k;
    }
    if (duration > pk.infusion) auc += cmax * -Math.expm1(-k * (duration - pk.infusion)) / k;
  }
  return auc / mic;
}

/** Same independent log-ETA variances (0.09) as basicIvModel. No residual error.
 * @param {any} config @param {any} regimen
 */
export function infectionIvCurves(config, regimen) {
  const normal = randomNormal.source(randomLcg(20260919))(0, .3);
  const n = config.replicates;
  if (!(n >= 50 && n <= 1000) || !(config.mic > 0 && config.target > 0 && config.fu > 0 && config.fu <= 1)) throw new Error('Invalid PTA preview');
  const pk = { v: config.v, cl: config.cl, ...regimen };
  ivConcentration(0, pk, true);
  const population = Array.from({ length: n }, () => ({ ...pk, v: pk.v * Math.exp(normal()), cl: pk.cl * Math.exp(normal()) }));
  const mics = [...new Set([...Array.from({ length: 65 }, (_, i) => 2 ** (-6 + i / 4)), config.mic])].sort((a,b) => a-b);
  const pta = mics.map(x => ({ x, y: 100 * population.filter(p => ivIndex(p, config, x) >= config.target - 1e-9).length / n }));
  const horizon = 24;
  const times = [...new Set([...Array.from({ length: 401 }, (_, i) => horizon * i / 400), ...doseKnots(horizon, pk).flatMap(t => t > 0 && pk.infusion === 0 ? [t - 1e-8, t] : [t])])].sort((a,b) => a-b);
  const exposure = times.map(x => {
    const values = population.map(p => ivConcentration(x, p, true) * (config.basis === 'free' ? config.fu : 1)).sort((a,b) => a-b);
    return { x, y: (values[Math.floor((n-1)/2)] + values[Math.ceil((n-1)/2)]) / 2 };
  });
  return { exposure, pta };
}
