import { percentile } from '../utils/math.js';

/** @param {number} seed */
export function seededRng(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** @param {() => number} rng */
export function normalSample(rng) {
  const u = Math.max(rng(), 1e-12);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
}

/** @param {number[]} values */
export function sampleSd(values) {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1));
}

/** @param {number[]} values */
export function standardize(values) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const spread = sampleSd(values);
  return values.map((value) => (value - mean) / spread);
}

/** @param {number} seed @param {number} count */
export function shrinkagePopulation(seed, count) {
  const rng = seededRng(seed);
  const trueZ = standardize(Array.from({ length: count }, () => normalSample(rng)));
  const rawNoise = standardize(Array.from({ length: count }, () => normalSample(rng)));
  const covariance = rawNoise.reduce((sum, value, index) => sum + value * trueZ[index], 0) / (count - 1);
  const noiseZ = standardize(rawNoise.map((value, index) => value - covariance * trueZ[index]));
  return { trueZ, noiseZ };
}

/** @param {{omega:number,samples:number,residualSd:number,trueZ:number[],noiseZ:number[]}} input */
export function calculateShrinkage(input) {
  const measurementSe = input.residualSd / Math.sqrt(input.samples);
  const ebeWeight = input.omega ** 2 / (input.omega ** 2 + measurementSe ** 2);
  const trueEtas = input.trueZ.map((value) => input.omega * value);
  const individual = trueEtas.map((value, index) => value + measurementSe * input.noiseZ[index]);
  const ebe = individual.map((value) => ebeWeight * value);
  const ebeSd = sampleSd(ebe);
  const shrinkage = 1 - ebeSd / input.omega;
  return { measurementSe, ebeWeight, trueEtas, ebe, ebeSd, shrinkage };
}

/** @param {number} t @param {{rate:number,cl:number,v:number,duration:number}} input */
export function infusionConcentration(t, input) {
  const ke = input.cl / input.v;
  const css = input.rate / input.cl;
  const atStop = css * (1 - Math.exp(-ke * input.duration));
  return t <= input.duration
    ? css * (1 - Math.exp(-ke * t))
    : atStop * Math.exp(-ke * (t - input.duration));
}

/** @param {{dose:number,cl:number,v:number,tau:number}} input */
export function repeatedBolusSummary(input) {
  const ke = input.cl / input.v;
  const accumulationRatio = 1 / (1 - Math.exp(-ke * input.tau));
  const cMaxSs = (input.dose / input.v) * accumulationRatio;
  return {
    ke,
    accumulationRatio,
    cMaxSs,
    cMinSs: cMaxSs * Math.exp(-ke * input.tau),
    cAverageSs: input.dose / (input.cl * input.tau)
  };
}

/** @param {number} t @param {{dose:number,cl:number,v:number,tau:number,loading?:boolean}} input */
export function repeatedBolusConcentration(t, input) {
  const { ke, accumulationRatio } = repeatedBolusSummary(input);
  let concentration = 0;
  for (let doseTime = 0; doseTime <= t + 1e-9; doseTime += input.tau) {
    const amount = input.loading && doseTime === 0 ? input.dose * accumulationRatio : input.dose;
    concentration += (amount / input.v) * Math.exp(-ke * (t - doseTime));
  }
  return concentration;
}

/** @param {number} t @param {{parentRate:number,metaboliteRate:number,fraction:number,dose:number,volume:number}} input */
export function parentMetaboliteConcentrations(t, input) {
  const { parentRate: k, metaboliteRate: km, fraction: fm, dose, volume } = input;
  const parent = (dose / volume) * Math.exp(-k * t);
  const metabolite = Math.abs(km - k) < 1e-6
    ? (fm * k * dose / volume) * t * Math.exp(-k * t)
    : (fm * k * dose) / (volume * (km - k)) * (Math.exp(-k * t) - Math.exp(-km * t));
  return { parent, metabolite };
}

/** @param {number} concentration @param {{baseline:number,maximum:number,ec50:number,hill:number}} input */
export function emaxEffect(concentration, input) {
  const powered = concentration ** input.hill;
  return input.baseline + (input.maximum * powered) / (input.ec50 ** input.hill + powered);
}

/** @param {{dose:number,volume:number,time:number,observed:number,populationCl:number,omega:number,sigma:number,minCl?:number,maxCl?:number,step?:number}} input */
export function estimateOneCompartmentMapClearance(input) {
  const minCl = input.minCl ?? 1;
  const maxCl = input.maxCl ?? 15;
  const step = input.step ?? 0.05;
  let best = input.populationCl;
  let bestCost = Infinity;
  for (let cl = minCl; cl <= maxCl + 1e-9; cl += step) {
    const prediction = (input.dose / input.volume) * Math.exp(-(cl / input.volume) * input.time);
    const cost = ((Math.log(input.observed) - Math.log(prediction)) / input.sigma) ** 2
      + ((Math.log(cl) - Math.log(input.populationCl)) / input.omega) ** 2;
    if (cost < bestCost) {
      bestCost = cost;
      best = cl;
    }
  }
  return best;
}

/** @param {{dose:number,mtt:number,gamma:number,baseline?:number,slope?:number,volume?:number,ke?:number,horizon?:number,dt?:number,transits?:number}} input */
export function simulateMyelosuppression(input) {
  const baseline = input.baseline ?? 5;
  const slope = input.slope ?? 0.02;
  const volume = input.volume ?? 30;
  const ke = input.ke ?? 0.02;
  const horizon = input.horizon ?? 600;
  const dt = input.dt ?? 1;
  const transits = input.transits ?? 3;
  const ktr = (transits + 1) / input.mtt;
  let proliferating = baseline;
  const transit = Array(transits).fill(baseline);
  let circulating = baseline;
  const points = [];
  for (let t = 0; t <= horizon + 1e-9; t += dt) {
    const concentration = (input.dose / volume) * Math.exp(-ke * t);
    const drugEffect = Math.min(0.99, slope * concentration);
    const feedback = (baseline / Math.max(circulating, 0.01)) ** input.gamma;
    const dProliferating = ktr * proliferating * (1 - drugEffect) * feedback - ktr * proliferating;
    const dTransit = transit.map((value, index) => ktr * ((index === 0 ? proliferating : transit[index - 1]) - value));
    const dCirculating = ktr * transit.at(-1) - ktr * circulating;
    proliferating += dProliferating * dt;
    transit.forEach((value, index) => { transit[index] = value + dTransit[index] * dt; });
    circulating += dCirculating * dt;
    points.push({ t, C: concentration, Circ: Math.max(0.01, circulating) });
  }
  return points;
}

/** @param {{exposurePercent:number,growth:number,resistance:number,baseline?:number,drugRate?:number,horizon?:number,dt?:number}} input */
export function simulateTumorGrowth(input) {
  const baseline = input.baseline ?? 60;
  const drugRate = input.drugRate ?? 0.06;
  const horizon = input.horizon ?? 52;
  const dt = input.dt ?? 0.1;
  const exposure = input.exposurePercent / 100;
  let size = baseline;
  const points = [{ t: 0, ts: size }];
  for (let t = dt; t <= horizon + 1e-9; t += dt) {
    const shrinkage = drugRate * exposure * Math.exp(-input.resistance * t);
    size = Math.max(0.5, size + (input.growth - shrinkage) * size * dt);
    points.push({ t, ts: size });
  }
  return points;
}

/**
 * @param {number} seed
 * @param {{cl:number,v:number,omegaCl:number,omegaV:number,prop:number,add:number}} model
 * @param {{times:number[],subjects:number,dose:number}} design
 */
export function simulateVpcDataset(seed, model, design) {
  const rng = seededRng(seed);
  const rows = [];
  for (let id = 0; id < design.subjects; id += 1) {
    const cl = model.cl * Math.exp(model.omegaCl * normalSample(rng));
    const v = model.v * Math.exp(model.omegaV * normalSample(rng));
    for (const t of design.times) {
      const pred = (design.dose / v) * Math.exp(-(cl / v) * t);
      const c = Math.max(0, pred * (1 + model.prop * normalSample(rng)) + model.add * normalSample(rng));
      rows.push({ id, t, c });
    }
  }
  return rows;
}

/** @param {{t:number,c:number}[]} rows @param {number} count @param {number[]} times */
export function summarizeVpcDataset(rows, count, times) {
  /** @param {number} t */
  const binIndex = (t) => Math.min(count - 1, Math.floor((times.indexOf(t) * count) / times.length));
  return Array.from({ length: count }, (_, index) => {
    const bucketTimes = times.filter((t) => binIndex(t) === index);
    const values = rows.filter((row) => binIndex(row.t) === index).map((row) => row.c);
    return {
      t: bucketTimes.reduce((sum, value) => sum + value, 0) / bucketTimes.length,
      p5: percentile(values, 5),
      p50: percentile(values, 50),
      p95: percentile(values, 95),
      count: values.length,
      from: bucketTimes[0],
      to: bucketTimes[bucketTimes.length - 1]
    };
  });
}

/**
 * @param {{t:number,p5:number,p50:number,p95:number,count:number,from:number,to:number}[]} observed
 * @param {{p5:number,p50:number,p95:number}[][]} replicates
 */
export function combineVpcSummaries(observed, replicates) {
  return observed.map((observedBin, index) => {
    const band = (/** @type {'p5'|'p50'|'p95'} */ key) => {
      const values = replicates.map((replicate) => replicate[index][key]);
      return { low: percentile(values, 5), mid: percentile(values, 50), high: percentile(values, 95) };
    };
    return { ...observedBin, modelP5: band('p5'), modelP50: band('p50'), modelP95: band('p95') };
  });
}

/** @param {{tru:number,g:number}[]} base @param {number} misspecification @param {number} residualSd @param {number} maxValue */
export function calculateGofRows(base, misspecification, residualSd, maxValue) {
  return base.map((row) => {
    const pred = row.tru * (1 - misspecification * 0.45 * (row.tru / maxValue));
    const obs = row.tru * Math.exp(residualSd * row.g);
    return { pred, obs, residualProxy: (Math.log(obs) - Math.log(pred)) / residualSd };
  });
}

/** @param {{theta:number,onset:number,V:number,CL0:number,dose:number,tau:number,T:number,dt:number}} input */
export function simulateAdaProfile(input) {
  const n = Math.round(input.T / input.dt);
  const points = [];
  const troughs = [];
  let concentration = 0;
  let nextDose = 0;
  for (let i = 0; i <= n; i += 1) {
    const t = i * input.dt;
    if (nextDose < input.T - 1e-9 && t >= nextDose - 1e-9) {
      if (nextDose > 0) troughs.push({ t: nextDose, C: concentration });
      concentration += input.dose / input.V;
      nextDose += input.tau;
    }
    const ada = 1 / (1 + Math.exp(-(t - input.onset) * 1.2));
    const clearance = input.CL0 * (1 + input.theta * ada);
    points.push({ t, C: concentration, A: ada });
    if (i < n) concentration *= Math.exp(-(clearance / input.V) * input.dt);
  }
  return { points, troughs };
}

/** @param {{dose:number,mic:number,tau:number,V:number,ke:number,T:number,dt:number,fu:number,basis:'total'|'free'}} input */
export function calculatePkpdProfile(input) {
  /** @type {number[]} */
  const doseTimes = [];
  for (let t = 0; t < input.T - 1e-9; t += input.tau) doseTimes.push(t);
  const scale = input.basis === 'free' ? input.fu : 1;
  const amount = input.dose / input.V;
  /** @param {number} t @param {boolean} includeDoseAtTime */
  const concentrationAt = (t, includeDoseAtTime = true) => doseTimes.reduce((sum, doseTime) => {
    const elapsed = t - doseTime;
    if (elapsed < -1e-9 || (!includeDoseAtTime && Math.abs(elapsed) < 1e-9)) return sum;
    return sum + amount * Math.exp(-input.ke * Math.max(0, elapsed));
  }, 0);

  const points = [];
  const n = Math.round(input.T / input.dt);
  for (let i = 0; i <= n; i += 1) {
    const t = i * input.dt;
    const isDose = doseTimes.some((doseTime) => doseTime > 0 && Math.abs(doseTime - t) < 1e-9);
    if (isDose) points.push({ t, C: concentrationAt(t, false) * scale, totalC: concentrationAt(t, false) });
    points.push({ t, C: concentrationAt(t, true) * scale, totalC: concentrationAt(t, true) });
  }

  const aucTotal = doseTimes.reduce((sum, doseTime) => {
    const duration = input.T - doseTime;
    return sum + amount * (1 - Math.exp(-input.ke * duration)) / input.ke;
  }, 0);
  const auc = aucTotal * scale;
  const cmax = Math.max(...doseTimes.map((doseTime) => concentrationAt(doseTime, true) * scale));
  let timeAbove = 0;
  doseTimes.forEach((doseTime, index) => {
    const end = doseTimes[index + 1] ?? input.T;
    const duration = end - doseTime;
    const start = concentrationAt(doseTime, true) * scale;
    if (start > input.mic) timeAbove += Math.min(duration, Math.log(start / input.mic) / input.ke);
  });

  return {
    points,
    doseTimes,
    cmax,
    timeAbove,
    pctTime: (timeAbove / input.T) * 100,
    auc,
    aucMic: auc / input.mic
  };
}

/**
 * Deterministic batch-gradient fit of a two-dimensional linear soft-margin SVM.
 * Coordinates are centred and scaled internally; returned scores use that scale.
 * @param {{x:number,y:number,c:number}[]} points
 * @param {number} C
 */
export function fitLinearSvm(points, C) {
  let wx = 0;
  let wy = 0;
  let b = 0;
  const lambda = 1 / Math.max(C, 1e-6);
  for (let iteration = 0; iteration < 2400; iteration += 1) {
    let gwx = lambda * wx;
    let gwy = lambda * wy;
    let gb = 0;
    for (const point of points) {
      const x = (point.x - 5) / 5;
      const y = (point.y - 5) / 5;
      if (point.c * (wx * x + wy * y + b) < 1) {
        gwx -= (point.c * x) / points.length;
        gwy -= (point.c * y) / points.length;
        gb -= point.c / points.length;
      }
    }
    const rate = 0.12 / Math.sqrt(1 + iteration / 120);
    wx -= rate * gwx;
    wy -= rate * gwy;
    b -= rate * gb;
  }
  const score = (/** @type {{x:number,y:number}} */ point) => wx * ((point.x - 5) / 5) + wy * ((point.y - 5) / 5) + b;
  return { wx, wy, b, score };
}

/**
 * Normalize a discrete joint CL/V distribution and fail closed on malformed points.
 * @param {{cl:number,v:number,weight:number}[]} points
 */
export function normalizeSupportPoints(points) {
  if (!Array.isArray(points) || points.length === 0) throw new Error('At least one support point is required');
  for (const point of points) {
    if (![point.cl, point.v, point.weight].every(Number.isFinite) || point.cl <= 0 || point.v <= 0 || point.weight <= 0) {
      throw new Error('Support points require positive finite CL, V and weights');
    }
  }
  const total = points.reduce((sum, point) => sum + point.weight, 0);
  return points.map((point) => ({ ...point, weight: point.weight / total }));
}

/**
 * Update support-point probabilities from one concentration under a simple
 * proportional Gaussian observation model. Omitting the observation returns
 * the normalized population prior exactly.
 * @param {{cl:number,v:number,weight:number}[]} points
 * @param {number|null|undefined} observed
 * @param {{dose?:number,time?:number,residualCv?:number,residualFloor?:number}} [options]
 */
export function updateSupportPointWeights(points, observed, options = {}) {
  const prior = normalizeSupportPoints(points);
  if (observed === null || observed === undefined) return prior;
  if (!Number.isFinite(observed) || observed < 0) throw new Error('Observed concentration must be finite and non-negative');
  const dose = options.dose ?? 100;
  const time = options.time ?? 4;
  const residualCv = options.residualCv ?? 0.15;
  const residualFloor = options.residualFloor ?? 0.05;
  if (![dose, time, residualCv, residualFloor].every(Number.isFinite) || dose <= 0 || time < 0 || residualCv <= 0 || residualFloor <= 0) {
    throw new Error('Dose, time and residual-error settings are invalid');
  }
  const logWeights = prior.map((point) => {
    const prediction = (dose / point.v) * Math.exp(-(point.cl / point.v) * time);
    const sd = Math.max(residualFloor, residualCv * prediction);
    return Math.log(point.weight) - Math.log(sd) - 0.5 * ((observed - prediction) / sd) ** 2;
  });
  const maxLogWeight = Math.max(...logWeights);
  const relative = logWeights.map((value) => Math.exp(value - maxLogWeight));
  const total = relative.reduce((sum, value) => sum + value, 0);
  if (!Number.isFinite(total) || total <= 0) throw new Error('Posterior support-point weights could not be normalized');
  return prior.map((point, index) => ({ ...point, weight: relative[index] / total }));
}

/** @param {{cl:number,v:number,weight:number}[]} points */
export function summarizeSupportPoints(points) {
  const normalized = normalizeSupportPoints(points);
  const modal = normalized.reduce((best, point) => point.weight > best.weight ? point : best);
  return {
    meanCl: normalized.reduce((sum, point) => sum + point.weight * point.cl, 0),
    meanV: normalized.reduce((sum, point) => sum + point.weight * point.v, 0),
    modal
  };
}

/**
 * Population-mean concentration curve obtained by averaging predictions, not parameters.
 * @param {{cl:number,v:number,weight:number}[]} points
 * @param {number[]} times
 * @param {number} [dose]
 */
export function supportPointMeanCurve(points, times, dose = 100) {
  const normalized = normalizeSupportPoints(points);
  if (!Number.isFinite(dose) || dose <= 0 || !times.every((time) => Number.isFinite(time) && time >= 0)) {
    throw new Error('Curve times and dose are invalid');
  }
  return times.map((time) => ({
    time,
    concentration: normalized.reduce((sum, point) => sum + point.weight * (dose / point.v) * Math.exp(-(point.cl / point.v) * time), 0)
  }));
}
