// @ts-nocheck
import { simulatePK } from './pk_compartment';
import { makeRng } from './random';

const TWO_PI = 2 * Math.PI;

function randn(rng) {
  const u1 = Math.max(rng(), 1e-9);
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(TWO_PI * u2);
}

function drawLogNormal(rng, typical, omega) {
  if (omega === 0) return typical;
  return typical * Math.exp(randn(rng) * omega);
}

/**
 * @typedef {Object} VariabilitySpec
 * @property {boolean} enabled
 * @property {Record<string, number>} omega
 */

/**
 * @typedef {Object} ResidualSpec
 * @property {boolean} enabled
 * @property {number} sigmaProp
 * @property {number} sigmaAdd
 */

/**
 * Simule une population PopPK simple avec IIV/IOV + erreur résiduelle.
 * @param {object} opt
 * @param {number} opt.n
 * @param {number} opt.seed
 * @param {object} opt.typicalParams
 * @param {VariabilitySpec} opt.iiv
 * @param {VariabilitySpec} opt.iov
 * @param {ResidualSpec} opt.residual
 * @param {object} opt.modelConfig
 * @param {number[]} opt.samplingTimes
 */
export function simulatePopulation(opt) {
  const {
    n,
    seed = 1,
    typicalParams,
    iiv,
    iov,
    residual,
    modelConfig,
    samplingTimes
  } = opt;

  const rng = makeRng(seed);
  const profiles = [];

  for (let i = 0; i < n; i++) {
    const occasionFactor = iov.enabled ? Math.exp(randn(rng) * (iov.omega.CL ?? 0)) : 1;
    const indivParams = {
      cl: drawLogNormal(rng, typicalParams.cl, iiv.enabled ? iiv.omega.CL ?? 0 : 0) * occasionFactor,
      vc: drawLogNormal(rng, typicalParams.vc, iiv.enabled ? iiv.omega.Vc ?? 0 : 0),
      q1: drawLogNormal(rng, typicalParams.q1 ?? 0, iiv.enabled ? iiv.omega.Q1 ?? 0 : 0),
      vp1: drawLogNormal(rng, typicalParams.vp1 ?? 0, iiv.enabled ? iiv.omega.Vp1 ?? 0 : 0),
      q2: drawLogNormal(rng, typicalParams.q2 ?? 0, iiv.enabled ? iiv.omega.Q2 ?? 0 : 0),
      vp2: drawLogNormal(rng, typicalParams.vp2 ?? 0, iiv.enabled ? iiv.omega.Vp2 ?? 0 : 0),
      ka: drawLogNormal(rng, typicalParams.ka ?? 1, iiv.enabled ? iiv.omega.Ka ?? 0 : 0)
    };

    const pkConfig = {
      ...modelConfig,
      cl: indivParams.cl,
      vc: indivParams.vc,
      q1: indivParams.q1,
      vp1: indivParams.vp1,
      q2: indivParams.q2,
      vp2: indivParams.vp2,
      ka: indivParams.ka,
      times: samplingTimes
    };

    const points = simulatePK(pkConfig).map((p) => {
      const propErr = residual.enabled ? (1 + residual.sigmaProp * randn(rng)) : 1;
      const addErr = residual.enabled ? residual.sigmaAdd * randn(rng) : 0;
      const dv = Math.max(0, p.c * propErr + addErr);
      return { t: p.t, ipred: p.c, dv };
    });

    profiles.push({ id: i + 1, points, params: indivParams });
  }

  const summaryBands = samplingTimes.map((t, idx) => {
    const vals = profiles.map((p) => p.points[idx].dv);
    const sorted = [...vals].sort((a, b) => a - b);
    const p5 = percentile(sorted, 0.05);
    const p50 = percentile(sorted, 0.5);
    const p95 = percentile(sorted, 0.95);
    return { t, p5, p50, p95 };
  });

  const kpis = computeKpi(profiles);

  return { profiles, summaryBands, kpis };
}

function percentile(sortedArr, p) {
  if (!sortedArr.length) return 0;
  const idx = (sortedArr.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sortedArr[lo];
  const frac = idx - lo;
  return sortedArr[lo] * (1 - frac) + sortedArr[hi] * frac;
}

function computeKpi(profiles) {
  const aucs = [];
  const cmaxs = [];
  const tmaxs = [];
  for (const p of profiles) {
    let auc = 0;
    let cmax = -Infinity;
    let tmax = 0;
    const pts = p.points;
    for (let i = 1; i < pts.length; i++) {
      const dt = pts[i].t - pts[i - 1].t;
      auc += ((pts[i].ipred + pts[i - 1].ipred) / 2) * dt;
      if (pts[i].ipred > cmax) {
        cmax = pts[i].ipred;
        tmax = pts[i].t;
      }
    }
    aucs.push(auc);
    cmaxs.push(cmax);
    tmaxs.push(tmax);
  }
  return {
    aucMed: median(aucs),
    cmaxMed: median(cmaxs),
    tmaxMed: median(tmaxs)
  };
}

function median(arr) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
