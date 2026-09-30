import { defaults, clearance } from './models.js';
import { makeRng } from '../sim/random.js';

/** @type {[number, number]} */
export const symbolicStudyRange = [40, 90];

export function lessonDefaults() {
  return { beta: 0.75, omega: 0.3, eta: 0, grouping: 'category', low: 0.7, high: 1.3,
    half: 50, hill: 3, approximation: 'power', parameter: 'CL', genotype: 0 };
}

/** @typedef {ReturnType<typeof lessonDefaults>} Settings */
/** @param {string} lesson @param {Settings} p @returns {[number, number]} */
export function lessonDomain(lesson, p) {
  if (lesson === 'groups' && p.grouping === 'category') return [0, 2];
  if (lesson === 'physiology') return [20, 200];
  if (lesson === 'symbolic') return [20, 200];
  return [20, 120];
}

/** @param {Settings} p */
export function validLesson(p) {
  return [p.beta, p.omega, p.eta, p.low, p.high, p.half, p.hill, p.genotype].every(Number.isFinite) &&
    Math.abs(p.beta) <= 2 && p.omega >= 0 && p.omega <= 0.6 && Math.abs(p.eta) <= 1 &&
    p.low >= 0.1 && p.low <= 3 && p.high >= 0.1 && p.high <= 3 &&
    p.half >= 20 && p.half <= 100 && p.hill >= 0.5 && p.hill <= 6 && [0, 1].includes(p.genotype);
}

/** @param {string} lesson @param {number} x @param {Settings} p @param {number} genotype */
export function lessonTypical(lesson, x, p, genotype = p.genotype) {
  if (lesson === 'implementation') return p.parameter === 'V' ? 30 * x / 70 : 4 * (x / 70) ** 0.75 * 1.3 ** genotype;
  if (lesson === 'symbolic') return clearance('symbolic', x / 70, defaults('symbolic'));
  const method = lesson === 'basics' ? 'transformed' : lesson;
  return clearance(method, x, { ...defaults(method), ...p });
}

/** @param {number} x @param {Settings} p */
export function symbolicApproximation(x, p) {
  const z = x / 70;
  if (p.approximation === 'linear') return 4 * (1 + 0.75 * (z - 1));
  if (p.approximation === 'power') return 4 * z ** 0.75;
  return lessonTypical('symbolic', x, p);
}

// Fixed standard-normal draws keep the same illustrative people when controls change.
const rng = makeRng(20260930);
const normal = () => Math.sqrt(-2 * Math.log(Math.max(1e-9, rng()))) * Math.cos(2 * Math.PI * rng());
const individuals = Array.from({ length: 42 }, (_, i) => ({ u: (i + 0.5) / 42, z1: normal(), z2: normal() }));

/** @param {string} lesson @param {Settings} p */
export function lessonData(lesson, p) {
  if (!validLesson(p)) return { typical: [], comparison: [], cloud: [], yMax: 1, error: 0 };
  const [min, max] = lessonDomain(lesson, p);
  const categories = lesson === 'groups' && p.grouping === 'category';
  let xs = categories ? [0, 1, 2] : Array.from({ length: 161 }, (_, i) => min + (max - min) * i / 160);
  if (lesson === 'groups' && !categories) xs = [...new Set([...xs, 59.999, 60, 89.999, 90])].sort((a, b) => a - b);
  const typical = xs.map(x => ({ x, y: lessonTypical(lesson, x, p, 0) }));
  const comparison = lesson === 'symbolic' ? xs.map(x => ({ x, y: symbolicApproximation(x, p) })) :
    lesson === 'implementation' ? xs.map(x => ({ x, y: lessonTypical(lesson, x, p, 1) })) : [];
  const [cloudMin, cloudMax] = lesson === 'symbolic' ? symbolicStudyRange : [min, max];
  const cloud = individuals.map(({ u, z1, z2 }, i) => {
    const x = categories ? i % 3 : cloudMin + (cloudMax - cloudMin) * u;
    const eta = lesson === 'implementation' ? (p.parameter === 'V' ? 0.2 * (0.5 * z1 + Math.sqrt(0.75) * z2) : 0.3 * z1) : p.omega * z1;
    return { x, y: lessonTypical(lesson, x, p, lesson === 'implementation' ? p.genotype : 0) * Math.exp(eta) };
  });
  const error = lesson === 'symbolic' ? Math.sqrt(Array.from({ length: 101 }, (_, i) => {
    const x = symbolicStudyRange[0] + (symbolicStudyRange[1] - symbolicStudyRange[0]) * i / 100;
    return (symbolicApproximation(x, p) / lessonTypical(lesson, x, p) - 1) ** 2;
  }).reduce((a, b) => a + b, 0) / 101) * 100 : 0;
  const maxCurve = Math.max(...[...typical, ...comparison].map(point => point.y));
  return { typical, comparison, cloud, error,
    yMax: Math.max(maxCurve * (lesson === 'basics' ? Math.exp(Math.max(0, p.eta)) : 1), ...cloud.map(point => point.y)) * 1.12 };
}
