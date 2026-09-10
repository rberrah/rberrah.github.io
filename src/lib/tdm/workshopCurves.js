// Analytical teaching curves, deliberately separate from patient simulation in R.
/** @param {number} from @param {number} to @param {number} [n] */
const grid = (from, to, n = 201) => Array.from({ length: n }, (_, i) => from + (to - from) * i / (n - 1));

/** @param {any} config @param {number} c */
export function ddiEquilibrium(config, c) {
  const occupancy = c / (config.c50 + c);
  switch (config.type) {
    case 'factor': return config.factor;
    case 'reversible': return Math.max(0.01, 1 / (1 + c / config.c50));
    case 'inhibition': return Math.max(0.01, 1 - config.strength * occupancy);
    case 'hill_inhibition': return Math.max(0.01, 1 - config.strength / (1 + (config.c50 / Math.max(1e-300, c)) ** config.hill));
    case 'induction': case 'turnover_induction': return 1 + config.strength * occupancy;
    case 'tdi': return Math.max(0.01, config.kdeg / (config.kdeg + config.kinact * occupancy));
    default: return NaN;
  }
}

/** A rectangular external exposure, not the selected PK model's prediction.
 * @param {any} config @param {number} concentration @param {number} day
 */
export function ddiStepResponse(config, concentration, day) {
  if (day < config.start_day) return 1;
  if (!['tdi', 'turnover_induction'].includes(config.type)) return day < config.stop_day ? ddiEquilibrium(config, concentration) : 1;
  const rate = config.kdeg + (config.type === 'tdi' ? config.kinact * concentration / (config.c50 + concentration) : 0);
  const synthesis = config.kdeg * (config.type === 'turnover_induction' ? ddiEquilibrium(config, concentration) : 1);
  const equilibrium = synthesis / rate;
  const elapsed = 24 * (Math.min(day, config.stop_day) - config.start_day);
  let activity = equilibrium + (1 - equilibrium) * Math.exp(-rate * elapsed);
  if (day > config.stop_day) activity = 1 + (activity - 1) * Math.exp(-config.kdeg * 24 * (day - config.stop_day));
  return Math.max(0.01, activity);
}

/** @param {any} config @param {number} c */
export function pdEquilibrium(config, c) {
  const p = config.parameters;
  const effect = config.type === 'linear' ? p.SLOPE * c : p.EMAX / (1 + (p.EC50 / Math.max(1e-300, c)) ** (config.type === 'hill' ? p.HILL : 1));
  switch (config.type) {
    case 'inhibit_in': return p.E0 * (1 - effect);
    case 'stimulate_in': return p.E0 * (1 + effect);
    case 'inhibit_out': return p.E0 / (1 - effect);
    case 'stimulate_out': return p.E0 / (1 + effect);
    default: return p.E0 + effect;
  }
}

/** @param {any} config @param {number} time */
export function untreatedTumor(config, time) {
  const p = config.parameters;
  if (config.growth === 'logistic') return p.CAP / (1 + (p.CAP / p.T0 - 1) * Math.exp(-p.KG * time));
  if (config.growth === 'gompertz') return p.CAP * Math.exp(Math.log(p.T0 / p.CAP) * Math.exp(-p.KG * time));
  return p.T0 * Math.exp(p.KG * time);
}

/** Piecewise-constant killing with exact growth updates; illustration for the built-in PK only.
 * @param {any} config
 */
export function treatedTumor(config) {
  const p = config.parameters;
  const doses = [...(config.history ?? [])];
  const interval = config.interval ?? 21;
  if (!(interval >= 0.25) || !(config.horizon >= 1 && config.horizon <= 730) || !(config.decision >= 0 && config.decision < config.horizon) || doses.length > 500 || !(p.V > 0 && p.CL > 0 && p.T0 > 0 && p.EC50 > 0)) throw new Error('Invalid preview parameters');
  for (let t = config.decision; t < config.horizon; t += interval) doses.push({ time: t, amount: config.dose ?? 100, infusion: config.infusion ?? 1 });
  const times = [...new Set([...grid(0, config.horizon, Math.ceil(config.horizon * 240) + 1), ...doses.flatMap((d) => [d.time, d.time + d.infusion / 24])])].filter((t) => t >= 0 && t <= config.horizon).sort((a,b) => a-b);
  const stride = Math.max(1, Math.ceil(times.length / 700));
  let tumor = p.T0;
  const result = [{ x: 0, y: tumor }];
  for (let i = 1; i < times.length; i++) {
    const t = (times[i] + times[i-1]) / 2, dt = times[i] - times[i-1];
    const concentration = doses.reduce((sum, d) => {
      const elapsed = t - d.time, duration = d.infusion / 24, kel = p.CL / p.V;
      if (elapsed < 0) return sum;
      return sum + (duration === 0 ? d.amount / p.V * Math.exp(-kel * elapsed) : d.amount / (duration * p.CL) * -Math.expm1(-kel * Math.min(elapsed, duration)) * Math.exp(-kel * Math.max(0, elapsed - duration)));
    }, 0);
    const kill = p.KILL * concentration / (p.EC50 + concentration) * Math.exp(-p.RES * t);
    if (config.growth === 'gompertz' && p.KG > 0) {
      const equilibrium = Math.log(p.CAP) - kill / p.KG;
      tumor = Math.exp(equilibrium + (Math.log(tumor) - equilibrium) * Math.exp(-p.KG * dt));
    } else {
      const rate = p.KG - kill;
      const integral = Math.abs(rate) < 1e-12 ? dt : Math.expm1(rate * dt) / rate;
      tumor = tumor * Math.exp(rate * dt) / (1 + (config.growth === 'logistic' ? p.KG / p.CAP * tumor * integral : 0));
    }
    if (i % stride === 0 || i === times.length - 1) result.push({ x: times[i], y: tumor });
  }
  return result;
}

/** @param {string} view @param {any} config @param {number} concentration @param {any} [computed]
 * @returns {{key:string, x:string, y:string, series:{key:string, points:{x:number,y:number}[]}[]}[]}
 */
export function workshopCurves(view, config, concentration = 1, computed = null) {
  const p = config.parameters;
  if (view === 'ddi') {
    const horizon = config.stop_day + config.followup_days;
    const times = [...new Set([...grid(0, horizon), config.start_day - 1e-8, config.start_day, config.stop_day - 1e-8, config.stop_day])].filter((x) => x >= 0 && x <= horizon).sort((a,b) => a-b);
    return [
      { key: 'ddi_relation', x: 'C2', y: 'P / P0', series: [{ key: 'equilibrium', points: grid(0, Math.max(config.c50 * 5, concentration * 1.5, 1)).map((x) => ({ x, y: ddiEquilibrium(config, x) })) }] },
      { key: 'ddi_time', x: 'day', y: 'P / P0', series: [
        { key: 'reference', points: times.map((x) => ({ x, y: 1 })) },
        { key: 'interaction', points: times.map((x) => ({ x, y: ddiStepResponse(config, concentration, x) })) }
      ] }
    ];
  }
  if (view === 'onco') return [{ key: 'tumor_comparison', x: 'day', y: 'SLD (mm)', series: computed?.curves ?? [
    { key: 'untreated', points: grid(0, config.horizon).map((x) => ({ x, y: untreatedTumor(config, x) })) },
    ...(!config.free_pk ? [{ key: 'treated', points: treatedTumor(config) }] : [])
  ] }];
  const effectAtExposure = pdEquilibrium(config, concentration);
  const indirect = /_(in|out)$/.test(config.type);
  return [
    { key: 'pd_relation', x: 'C', y: 'E', series: [{ key: 'equilibrium', points: grid(0, Math.max(1, config.c0, p.EC50 * 5)).map((x) => ({ x, y: pdEquilibrium(config, x) })) }] },
    { key: config.delay ? 'effect_compartment' : 'pd_time', x: 'h', y: config.delay ? 'Ce' : 'E', series: [{ key: config.delay ? 'ce' : 'response', points: grid(0, config.horizon).map((x) => {
      if (config.delay) return { x, y: concentration * -Math.expm1(-p.KE0 * x) };
      const loss = /_out$/.test(config.type) ? p.KOUT * p.E0 / effectAtExposure : p.KOUT;
      return { x, y: indirect ? effectAtExposure + (p.E0 - effectAtExposure) * Math.exp(-loss * x) : effectAtExposure };
    }) }] }
  ];
}
