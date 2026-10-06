/** @typedef {Record<string, number>} NumericParameters */

export const populationDefaults = {
  dose: 100,
  cl: 5,
  v: 25,
  omegaCl: 0.3,
  omegaV: 0.2,
  sigma: 0.15,
  count: 48,
  end: 24
};

export const samplingDefaults = {
  dose: 100,
  trueCl: 5,
  popCl: 6,
  omegaCl: 0.35,
  v: 25,
  sigma: 0.12,
  t1: 1,
  t2: 8,
  sampleCount: 2,
  end: 24
};

export const populationLimits = {
  dose: [1, 1000], cl: [0.1, 30], v: [5, 150], omegaCl: [0, 1], omegaV: [0, 1],
  sigma: [0, 0.8], count: [12, 120], end: [6, 168]
};

export const samplingLimits = {
  dose: [1, 1000], trueCl: [0.2, 20], popCl: [0.2, 20], omegaCl: [0.05, 1],
  v: [5, 150], sigma: [0.01, 0.8], t1: [0.1, 168], t2: [0.1, 168],
  sampleCount: [1, 2], end: [6, 168]
};

/** @param {NumericParameters} defaults @param {Record<string, number[]>} limits @param {Partial<NumericParameters>} supplied @returns {NumericParameters} */
function validate(defaults, limits, supplied) {
  if (!supplied || typeof supplied !== 'object' || Array.isArray(supplied)) throw new Error('Invalid parameters');
  if (Object.keys(supplied).some(key => !Object.hasOwn(defaults, key))) throw new Error('Unknown parameter');
  /** @type {NumericParameters} */
  const result = { ...defaults };
  for (const [key, value] of Object.entries(supplied)) if (value !== undefined) result[key] = value;
  for (const [key, value] of Object.entries(result)) {
    const range = limits[key]; if (!range) throw new Error('Unknown parameter');
    const [min, max] = range;
    if (!Number.isFinite(value) || value < min || value > max) throw new Error(`${key}: ${min} - ${max}`);
  }
  if (Object.hasOwn(result, 'count') && !Number.isInteger(result.count)) throw new Error('count must be an integer');
  if (Object.hasOwn(result, 'sampleCount') && !Number.isInteger(result.sampleCount)) throw new Error('sampleCount must be an integer');
  if (Object.hasOwn(result, 't1') && (result.t1 > result.end || result.sampleCount === 2 && result.t2 > result.end)) throw new Error('Sampling times must be within the horizon');
  return result;
}

/** @param {Partial<typeof populationDefaults>} supplied @returns {typeof populationDefaults} */
export const validatePopulation = supplied => /** @type {typeof populationDefaults} */ (validate(populationDefaults, populationLimits, supplied));
/** @param {Partial<typeof samplingDefaults>} supplied @returns {typeof samplingDefaults} */
export const validateSampling = supplied => /** @type {typeof samplingDefaults} */ (validate(samplingDefaults, samplingLimits, supplied));

/** @param {number} count @param {number} seed */
function seededNormals(count, seed = 260907) {
  let state = seed >>> 0;
  const uniform = () => ((state = (1664525 * state + 1013904223) >>> 0) + 0.5) / 4294967296;
  const values = [];
  while (values.length < count) {
    const radius = Math.sqrt(-2 * Math.log(Math.max(1e-12, uniform()))), angle = 2 * Math.PI * uniform();
    values.push(radius * Math.cos(angle));
    if (values.length < count) values.push(radius * Math.sin(angle));
  }
  return values;
}

const populationNormals = seededNormals(360);
const samplingNormals = seededNormals(4, 20260907);

/** @param {number[]} sorted @param {number} probability */
function quantileSorted(sorted, probability) {
  const position = (sorted.length - 1) * probability, lower = Math.floor(position), fraction = position - lower;
  return sorted[lower] + (sorted[Math.min(sorted.length - 1, lower + 1)] - sorted[lower]) * fraction;
}

/** @param {number[]} values @param {number} probability */
export function quantile(values, probability) {
  if (!values.length || probability < 0 || probability > 1) throw new Error('Invalid quantile');
  return quantileSorted([...values].sort((a, b) => a - b), probability);
}

/** @param {typeof populationDefaults} supplied */
export function virtualPopulation(supplied) {
  const p = validatePopulation(supplied);
  return Array.from({ length: p.count }, (_, id) => {
    const etaCl = populationNormals[id], etaV = populationNormals[120 + id], residual = populationNormals[240 + id];
    return { id, etaCl, etaV, residual, cl: p.cl * Math.exp(p.omegaCl * etaCl), v: p.v * Math.exp(p.omegaV * etaV) };
  });
}

/** @param {typeof populationDefaults} supplied @param {number} time */
export function populationAt(supplied, time) {
  const p = validatePopulation(supplied), t = Math.max(0, Math.min(p.end, time));
  return virtualPopulation(p).map(subject => {
    const concentration = p.dose / subject.v * Math.exp(-subject.cl / subject.v * t);
    const observed = concentration * Math.exp(p.sigma * subject.residual - 0.5 * p.sigma ** 2);
    return { ...subject, time: t, concentration, observed };
  });
}

/** @param {typeof populationDefaults} supplied */
export function populationSeries(supplied, steps = 160) {
  const p = validatePopulation(supplied), subjects = virtualPopulation(p);
  return Array.from({ length: steps + 1 }, (_, index) => {
    const time = p.end * index / steps;
    const values = subjects.map(subject => p.dose / subject.v * Math.exp(-subject.cl / subject.v * time)).sort((a, b) => a - b);
    return { time, q10: quantileSorted(values, 0.1), median: quantileSorted(values, 0.5), q90: quantileSorted(values, 0.9) };
  });
}

/** @param {typeof samplingDefaults} supplied @param {number} time */
export function concentrationAt(supplied, time, clearance = supplied.trueCl) {
  const p = validateSampling(supplied), t = Math.max(0, time);
  return p.dose / p.v * Math.exp(-clearance / p.v * t);
}

/** @param {typeof samplingDefaults} supplied */
export function syntheticSamples(supplied) {
  const p = validateSampling(supplied), times = p.sampleCount === 1 ? [p.t1] : [p.t1, p.t2];
  return times.map((time, index) => {
    const truth = concentrationAt(p, time);
    return { time, truth, observed: truth * Math.exp(p.sigma * samplingNormals[index] - 0.5 * p.sigma ** 2) };
  });
}

/** @param {number} value @param {number} median @param {number} logSd */
function logNormalDensity(value, median, logSd) {
  if (value <= 0 || median <= 0 || logSd <= 0) return 0;
  const z = (Math.log(value) - Math.log(median)) / logSd;
  return Math.exp(-0.5 * z * z) / (value * logSd * Math.sqrt(2 * Math.PI));
}

/** One-parameter teaching MAP: V, dose and residual model are treated as known.
 * @param {typeof samplingDefaults} supplied
 * @param {number} collectedTime
 */
export function clearancePosterior(supplied, collectedTime = Infinity) {
  const p = validateSampling(supplied), samples = syntheticSamples(p).filter(sample => sample.time <= collectedTime + 1e-10);
  const min = Math.max(0.05, p.popCl * Math.exp(-4 * p.omegaCl)), max = Math.min(60, p.popCl * Math.exp(4 * p.omegaCl));
  const grid = Array.from({ length: 801 }, (_, index) => min * Math.exp(Math.log(max / min) * index / 800));
  const logWeights = grid.map(clearance => {
    const prior = Math.log(Math.max(1e-300, logNormalDensity(clearance, p.popCl, p.omegaCl)));
    return prior + samples.reduce((sum, sample) => {
      const prediction = concentrationAt(p, sample.time, clearance);
      const z = (Math.log(sample.observed) - Math.log(prediction)) / p.sigma;
      return sum - 0.5 * z * z - Math.log(sample.observed * p.sigma * Math.sqrt(2 * Math.PI));
    }, 0);
  });
  const maximum = Math.max(...logWeights), raw = logWeights.map(value => Math.exp(value - maximum));
  let total = 0;
  const weighted = raw.map((value, index) => {
    const width = index === 0 ? grid[1] - grid[0] : index === grid.length - 1 ? grid[index] - grid[index - 1] : (grid[index + 1] - grid[index - 1]) / 2;
    const mass = value * width; total += mass; return mass;
  });
  const densityScale = raw.reduce((highest, value) => Math.max(highest, value), 0);
  let cumulative = 0, lower = grid[0], median = grid[0], upper = grid.at(-1);
  for (let index = 0; index < grid.length; index++) {
    cumulative += weighted[index] / total;
    if (cumulative >= 0.05 && lower === grid[0]) lower = grid[index];
    if (cumulative >= 0.5 && median === grid[0]) median = grid[index];
    if (cumulative >= 0.95) { upper = grid[index]; break; }
  }
  const mapIndex = logWeights.indexOf(Math.max(...logWeights));
  return {
    samples,
    grid: grid.map((clearance, index) => ({ clearance, density: raw[index] / densityScale, prior: logNormalDensity(clearance, p.popCl, p.omegaCl) })),
    map: grid[mapIndex], median, lower, upper
  };
}
