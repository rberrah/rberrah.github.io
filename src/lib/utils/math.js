// Pharmacometric helper formulas

/**
 * One-compartment IV bolus concentration at time t.
 * @param {number} t hours
 * @param {number} dose mg
 * @param {number} cl L/h
 * @param {number} v L
 */
export function concMono(t, dose, cl, v) {
  if (!v || !cl) return 0;
  const ke = cl / v;
  return (dose / v) * Math.exp(-ke * t);
}

/**
 * Half-life from clearance and volume (or ke directly).
 * @param {number} cl L/h
 * @param {number} v L
 */
export function halfLifeFromClV(cl, v) {
  if (!cl || !v) return 0;
  const ke = cl / v;
  return Math.log(2) / ke;
}

/**
 * Trapezoidal AUC for ordered {t,c} array.
 * @param {{t:number,c:number}[]} pts
 */
export function aucTrap(pts) {
  if (!pts || pts.length < 2) return 0;
  let auc = 0;
  for (let i = 1; i < pts.length; i++) {
    const dt = pts[i].t - pts[i - 1].t;
    auc += ((pts[i].c + pts[i - 1].c) / 2) * dt;
  }
  return auc;
}

/**
 * Two-compartment IV bolus using macro constants derived from CL, Q, V1, V2.
 * @param {number} t hours
 * @param {number} dose mg
 * @param {number} cl L/h
 * @param {number} q L/h (inter-compartmental clearance)
 * @param {number} v1 L
 * @param {number} v2 L
 */
export function concTwoComp(t, dose, cl, q, v1, v2) {
  if (!v1 || !v2 || !cl || !q) return 0;
  const k10 = cl / v1;
  const k12 = q / v1;
  const k21 = q / v2;

  const A = k12 + k21 + k10;
  const B = k21 * k10;
  const alpha = (A + Math.sqrt(A * A - 4 * B)) / 2;
  const beta = (A - Math.sqrt(A * A - 4 * B)) / 2;

  const C1 = (dose / v1) * (alpha - k21) / (alpha - beta);
  const C2 = (dose / v1) * (k21 - beta) / (alpha - beta);

  return C1 * Math.exp(-alpha * t) + C2 * Math.exp(-beta * t);
}

/**
 * Simple percentile helper.
 * @param {number[]} arr
 * @param {number} p 0-100
 */
export function percentile(arr, p) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  const w = idx - lo;
  return sorted[lo] * (1 - w) + sorted[hi] * w;
}

/**
 * Allometric scaling for clearance.
 * @param {number} clPop typical clearance
 * @param {number} weight patient weight (kg)
 */
export function clAllo(clPop, weight) {
  return clPop * Math.pow(weight / 70, 0.75);
}

/**
 * Simple Michaelis-Menten elimination rate.
 * @param {number} conc concentration
 * @param {number} vmax maximal rate
 * @param {number} km half-saturation
 */
export function mmElimination(conc, vmax, km) {
  return (vmax * conc) / (km + conc);
}
