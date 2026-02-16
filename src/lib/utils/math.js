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
