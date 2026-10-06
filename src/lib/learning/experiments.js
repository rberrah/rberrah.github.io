import { concMono, concOral, concInfusion } from '../utils/math.js';
import { l } from './activityContent.js';

// Exact, explicitly simplified teaching relationships; not clinical simulators.
/** @type {Record<string, {defaults: Record<string, number>, end: number, x: import('./types').Localized, y: string, title: import('./types').Localized}>} */
export const experimentDefinitions = {
  bolus: { defaults: { dose: 100, cl: 5, v: 20 }, end: 12, x: l('Temps (h)', 'Time (h)'), y: 'C (mg/L)', title: l('Bolus IV, un compartiment', 'One-compartment IV bolus') },
  oral: { defaults: { dose: 100, cl: 5, v: 20, ka: 1, f: 1 }, end: 24, x: l('Temps (h)', 'Time (h)'), y: 'C (mg/L)', title: l('Dose orale unique, absorption du premier ordre', 'Single oral dose, first-order absorption') },
  infusion: { defaults: { dose: 100, cl: 5, v: 20, duration: 2 }, end: 12, x: l('Temps (h)', 'Time (h)'), y: 'C (mg/L)', title: l('Perfusion IV unique', 'Single IV infusion') },
  emax: { defaults: { baseline: 0, maximum: 100, ec50: 2, hill: 1 }, end: 12, x: l('Concentration (mg/L)', 'Concentration (mg/L)'), y: 'E', title: l('Relation concentration-effet', 'Concentration-effect relationship') },
  survival: { defaults: { hazard: 0.1 }, end: 24, x: l('Temps (mois)', 'Time (months)'), y: 'S(t)', title: l('Survie exponentielle fictive', 'Fictional exponential survival') },
  growth: { defaults: { initial: 100, growth: 0.02, kill: 0 }, end: 60, x: l('Temps (jours)', 'Time (days)'), y: 'T', title: l('Croissance et destruction constantes', 'Constant growth and killing') },
  error: { defaults: { additive: 1, proportional: 0.2 }, end: 20, x: l('Prédiction (mg/L)', 'Prediction (mg/L)'), y: 'SD (mg/L)', title: l('Écart-type résiduel combiné indépendant', 'Independent combined residual standard deviation') }
};
/** @type {Record<string, string>} */
export const parameterLabels = { dose: 'Dose (mg)', cl: 'CL (L/h)', v: 'V (L)', ka: 'Ka (1/h)', f: 'F', duration: 'Tinf (h)', baseline: 'E0', maximum: 'Emax', ec50: 'EC50 (mg/L)', hill: 'Hill', hazard: 'h (1/month)', initial: 'T0', growth: 'kg (1/day)', kill: 'kd (1/day)', additive: 'SDadd (mg/L)', proportional: 'SDprop' };
/** @type {Record<string, [number, number]>} */
export const parameterBounds = { dose: [0.01, 1000], cl: [0.01, 50], v: [0.1, 200], ka: [0.01, 5], f: [0, 1], duration: [0.01, 12], baseline: [0, 100], maximum: [1, 200], ec50: [0.01, 20], hill: [0.1, 5], hazard: [0.001, 1], initial: [1, 200], growth: [0, 0.1], kill: [0, 0.1], additive: [0, 10], proportional: [0, 1] };
/** @param {string} kind @param {Record<string, number>} p */
export function validExperiment(kind, p) {
  const definition = experimentDefinitions[kind];
  return !!definition && Object.keys(definition.defaults).every(key => Number.isFinite(p[key]) && p[key] >= parameterBounds[key][0] && p[key] <= parameterBounds[key][1]);
}
/** @param {string} kind @param {number} x @param {Record<string, number>} p */
export function experimentValue(kind, x, p) {
  switch (kind) {
    case 'bolus': return concMono(x, p.dose, p.cl, p.v);
    case 'oral': return concOral(x, p.dose, p.cl, p.v, p.ka, p.f);
    case 'infusion': return concInfusion(x, p.dose, p.cl, p.v, p.duration);
    case 'emax': return p.baseline + p.maximum * x ** p.hill / (p.ec50 ** p.hill + x ** p.hill);
    case 'survival': return Math.exp(-p.hazard * x);
    case 'growth': return p.initial * Math.exp((p.growth - p.kill) * x);
    case 'error': return Math.hypot(p.additive, p.proportional * x);
    default: return NaN;
  }
}
/** @param {string} kind @param {Record<string, number>} p */
export function experimentCurve(kind, p) {
  if (!validExperiment(kind, p)) return [];
  return Array.from({ length: 121 }, (_, i) => { const x = i * experimentDefinitions[kind].end / 120; return { x, y: experimentValue(kind, x, p) }; });
}
