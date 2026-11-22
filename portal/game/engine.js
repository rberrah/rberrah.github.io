// PMx Game: bounded, browser-only educational ODE solver.
// Amounts in mg, time in h, concentrations in mg/L. No clinical model or patient inputs.
export const STEP = 0.025;
export const DEFAULTS = Object.freeze({
  model: 1, route: 'oral', dose: 100, doses: 1, tau: 24, horizon: 48,
  f: 0.8, ka: 1.2, cl: 5, vc: 25, q1: 8, vp1: 35, q2: 4, vp2: 50,
  targetLow: 1, targetHigh: 4
});
export const LIMITS = Object.freeze({
  dose: [1, 500], doses: [1, 4], tau: [6, 48], horizon: [12, 96],
  f: [0.1, 1], ka: [0.1, 6], cl: [0.1, 30], vc: [5, 150],
  q1: [0.1, 25], vp1: [5, 150], q2: [0.1, 25], vp2: [5, 150],
  targetLow: [0.1, 20], targetHigh: [0.2, 30]
});
export function validate(input) {
  const cfg = { ...DEFAULTS, ...input };
  if (![1, 2, 3].includes(cfg.model) || !['oral', 'iv'].includes(cfg.route))
    throw new RangeError('Unsupported structure or route');
  for (const [name, [lo, hi]] of Object.entries(LIMITS)) {
    if (!Number.isFinite(cfg[name]) || cfg[name] < lo || cfg[name] > hi)
      throw new RangeError(name + ' outside allowed educational range');
  }
  for (const name of ['doses', 'tau', 'horizon'])
    if (!Number.isInteger(cfg[name])) throw new RangeError(name + ' must be an integer');
  if (cfg.targetLow >= cfg.targetHigh) throw new RangeError('Target limits must be increasing');
  return cfg;
}
export function derivative(a, c) {
  const [gut, central, p1, p2] = a;
  const cc = central / c.vc;
  const exchange1 = c.model >= 2 ? c.q1 * (cc - p1 / c.vp1) : 0;
  const exchange2 = c.model >= 3 ? c.q2 * (cc - p2 / c.vp2) : 0;
  const absorption = c.route === 'oral' ? c.ka * gut : 0;
  const elimination = c.cl * cc;
  return [-absorption, absorption - elimination - exchange1 - exchange2,
    exchange1, exchange2, elimination];
}
function advance(a, c, dt) {
  const k1 = derivative(a, c);
  const k2 = derivative(a.map((x, i) => x + dt * k1[i] / 2), c);
  const k3 = derivative(a.map((x, i) => x + dt * k2[i] / 2), c);
  const k4 = derivative(a.map((x, i) => x + dt * k3[i]), c);
  return a.map((x, i) => {
    const next = x + dt * (k1[i] + 2*k2[i] + 2*k3[i] + k4[i]) / 6;
    if (next < -1e-7) throw new Error('Numerical integration outside positive amounts');
    return Math.max(0, next);
  });
}
export function simulate(input = {}) {
  const c = validate(input);
  const n = Math.round(c.horizon / STEP);
  let a = [0, 0, 0, 0, 0];
  let delivered = 0, auc = 0, peak = -1, tPeak = 0, inside = 0;
  const points = [];
  for (let i = 0; i <= n; i++) {
    const t = i * STEP;
    // The endpoint immediately before a bolus belongs to the preceding AUC interval.
    const predoseConcentration = a[1] / c.vc;
    const event = Math.round(t / c.tau);
    if (event < c.doses && Math.abs(t - event * c.tau) < STEP / 3) {
      const effective = c.dose * (c.route === 'oral' ? c.f : 1);
      a[c.route === 'oral' ? 0 : 1] += effective;
      delivered += effective;
    }
    const conc = a[1] / c.vc;
    if (conc > peak) { peak = conc; tPeak = t; }
    const p = { t, c: conc, gut: a[0], central: a[1], p1: a[2], p2: a[3], eliminated: a[4] };
    points.push(p);
    if (i > 0) {
      auc += (points[i-1].c + predoseConcentration) * STEP / 2;
      if (points[i-1].c >= c.targetLow && points[i-1].c <= c.targetHigh) inside += STEP;
    }
    if (i < n) a = advance(a, c, STEP);
  }
  return {
    config: c, points, peak, tPeak, auc, cEnd: points.at(-1).c, delivered,
    fractionInTarget: inside / c.horizon
  };
}
export function atTime(result, time) {
  const index = Math.max(0, Math.min(result.points.length-1, Math.round(time/STEP)));
  return result.points[index];
}
export function fitScore(result, reference) {
  // Shape and scale score, not an inferential/identifiability criterion.
  const samples = 120;
  let error = 0, normalizer = 0;
  for (let i = 0; i <= samples; i++) {
    const t = i * Math.min(result.config.horizon, reference.config.horizon) / samples;
    const a = atTime(result, t).c;
    const b = atTime(reference, t).c;
    error += (a-b)**2;
    normalizer += b*b;
  }
  return Math.max(0, Math.round(100*(1-Math.sqrt(error / Math.max(normalizer, 1e-12)))));
}
export const CHALLENGE = Object.freeze({
  ...DEFAULTS, model: 2, route: 'oral', dose: 100, doses: 1,
  ka: 1.8, cl: 7.2, vc: 18, q1: 11, vp1: 43
});
