export const methods = ['transformed', 'groups', 'physiology', 'symbolic'];

/** @param {string} method */
export function defaults(method) {
  return { theta: 4, volume: 30, dose: 100, eta: 0, beta: 0.75, curvature: 0.15,
    half: 50, hill: 3, low: 0.7, high: 1.3, grouping: 'category',
    reference: method === 'physiology' ? 52 : method === 'symbolic' ? 1 : method === 'groups' ? 1 : 70,
    value: method === 'physiology' ? 40 : method === 'symbolic' ? 0.6 : method === 'groups' ? 2 : 50 };
}

/** @typedef {ReturnType<typeof defaults>} CovariateParameters */
/** @param {string} method @param {CovariateParameters} p */
export function domain(method, p) {
  if (method === 'groups' && p.grouping === 'category') return [0, 2];
  if (method === 'physiology') return [20, 200];
  if (method === 'symbolic') return [0.2, 2];
  return [40, 120];
}

/** @param {string} method @param {CovariateParameters} p */
export function validParameters(method, p) {
  const [min, max] = domain(method, p);
  return methods.includes(method) && Object.entries(p).every(([key, value]) => key === 'grouping' || Number.isFinite(value)) &&
    p.theta > 0 && p.theta <= 100 && p.volume > 0 && p.volume <= 1000 && p.dose > 0 && p.dose <= 10000 &&
    Math.abs(p.beta) <= 3 && Math.abs(p.curvature) <= 2 && Math.abs(p.eta) <= 2 &&
    p.half > 0 && p.half <= 200 && p.hill > 0 && p.hill <= 8 && p.low > 0 && p.high > 0 && p.low <= 5 && p.high <= 5 &&
    p.value >= min && p.value <= max && p.reference >= min && p.reference <= max &&
    (method !== 'groups' || p.grouping !== 'category' || (Number.isInteger(p.value) && Number.isInteger(p.reference)));
}

/** @param {string} method @param {number} value @param {CovariateParameters} p */
export function covariateFactor(method, value, p) {
  if (method === 'transformed') return (value / p.reference) ** p.beta;
  if (method === 'groups') {
    const group = p.grouping === 'category' ? value : value < 60 ? 0 : value < 90 ? 1 : 2;
    return group === 0 ? p.low : group === 1 ? 1 : p.high;
  }
  if (method === 'physiology') return value ** p.hill / (p.half ** p.hill + value ** p.hill);
  const z = value / p.reference;
  return Math.exp(p.beta * Math.log(z) + p.curvature * (z - 1) ** 2);
}

/** @param {string} method @param {number} value @param {CovariateParameters} p @param {number} eta */
export function clearance(method, value, p, eta = 0) {
  return p.theta * covariateFactor(method, value, p) * Math.exp(eta);
}

/** @param {string} method @param {CovariateParameters} p */
export function covariateCurves(method, p) {
  if (!validParameters(method, p)) return { effect: [], selected: [], reference: [] };
  const [min, max] = domain(method, p);
  const values = method === 'groups' && p.grouping === 'category' ? [0, 1, 2] :
    [...new Set([...Array.from({ length: 161 }, (_, i) => min + (max - min) * i / 160), ...(method === 'groups' ? [59.999, 60, 89.999, 90] : [])])].sort((a, b) => a - b);
  const profile = (/** @type {number} */ value, /** @type {number} */ eta) => Array.from({ length: 121 }, (_, i) => ({ x: i / 5, y: p.dose / p.volume * Math.exp(-clearance(method, value, p, eta) * i / 5 / p.volume) }));
  return {
    effect: values.map(x => ({ x, y: clearance(method, x, p) })),
    selected: profile(p.value, p.eta), reference: profile(p.reference, 0)
  };
}

/** @param {string} method @param {CovariateParameters} p @param {string} format */
export function covariateCode(method, p, format = 'mrgsolve') {
  if (!validParameters(method, p)) return '';
  const n = (/** @type {number} */ value) => String(Number(value.toPrecision(8)));
  const variable = method === 'physiology' ? 'PMA' : method === 'symbolic' ? 'REN' : method === 'groups' && p.grouping === 'category' ? 'GROUP' : 'WT';
  const x = variable;
  const z = `(${x}/${n(p.reference)})`;
  const effect = method === 'transformed' ? `pow(${z}, ${n(p.beta)})` :
    method === 'groups' ? (p.grouping === 'category' ? `(${x} == 0 ? ${n(p.low)} : (${x} == 1 ? 1.0 : ${n(p.high)}))` : `(${x} < 60 ? ${n(p.low)} : (${x} < 90 ? 1.0 : ${n(p.high)}))`) :
    method === 'physiology' ? `pow(${x}, ${n(p.hill)}) / (pow(${n(p.half)}, ${n(p.hill)}) + pow(${x}, ${n(p.hill)}))` :
    `exp(${n(p.beta)}*log(${z}) + ${n(p.curvature)}*pow(${z}-1.0, 2))`;
  if (format === 'mlxtran') {
    const formula = method === 'transformed' ? `${z}^${n(p.beta)}` :
      method === 'physiology' ? `${x}^${n(p.hill)}/(${n(p.half)}^${n(p.hill)}+${x}^${n(p.hill)})` :
      `exp(${n(p.beta)}*log(${z})+${n(p.curvature)}*(${z}-1)^2)`;
    const relation = method === 'groups' ? `if ${x} ${p.grouping === 'category' ? '== 0' : '< 60'}\n  factor = ${n(p.low)}\nelseif ${x} ${p.grouping === 'category' ? '== 1' : '< 90'}\n  factor = 1\nelse\n  factor = ${n(p.high)}\nend` : `factor = ${formula}`;
    return `; Illustrative structural model, not fitted clinical coefficients.\n; Configure Cl0 lognormal IIV (omega = 0.3) in Monolix, not again on Cl.\n; Example typical Cl0 = ${n(p.theta)} L/h, V = ${n(p.volume)} L.\n; Tag ${variable} as a regressor; example value = ${n(p.value)}.\n[LONGITUDINAL]\ninput = {Cl0, V, ${variable}}\n${variable} = {use=regressor}\nPK:\n${relation}\nCl = Cl0 * factor\nCc = pkmodel(V, Cl)\nOUTPUT:\noutput = {Cc}\n`;
  }
  return `// Illustrative IV model; coefficients are not clinically validated.\n// The plot's selected ETA is ${n(p.eta)}; simulations sample ETA from OMEGA.\n$PARAM TVCL = ${n(p.theta)}, TVV = ${n(p.volume)}\n$PARAM @annotated @covariate\n${variable} : ${n(p.value)} : Covariate\n$CMT @annotated\nCENT : Central [ADM, OBS]\n$MAIN\ndouble CL = TVCL * (${effect}) * exp(ETA(1));\ndouble V = TVV;\n$OMEGA 0.09\n$SIGMA 0.01 0\n$ODE\ndxdt_CENT = -(CL/V)*CENT;\n$TABLE\ndouble IPRED = CENT/V;\ndouble DV = IPRED*(1+EPS(1))+EPS(2);\n$CAPTURE CL IPRED DV\n`;
}
