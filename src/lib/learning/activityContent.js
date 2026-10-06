/** @typedef {import('./types').Localized} Localized */
/** @param {string} fr @param {string} en */
export const l = (fr, en) => ({ fr, en });
/** @param {string} unit @param {string} language */
export function displayUnit(unit, language) {
  if (language !== 'fr') return unit;
  /** @type {Record<string, string>} */
  const labels = { day: 'j', days: 'jours', month: 'mois', months: 'mois', units: 'unités', vectors: 'vecteurs', draws: 'tirages', rows: 'lignes' };
  return unit.replace(/\b(days?|months?|units|vectors|draws|rows)\b/g, token => labels[token] ?? token);
}
/** @param {string} id @param {Localized} prompt @param {number} answer @param {string} unit @param {Localized} correction @param {Partial<import('./types').NumericStep>} extra @returns {import('./types').NumericStep} */
export const numeric = (id, prompt, answer, unit, correction, extra = {}) => ({ id, type: 'numeric', prompt, answer, unit, correction, tolerance: { kind: 'absolute', value: answer === 0 ? 0.02 : Math.min(0.02, Math.max(0.000001, Math.abs(answer) * 0.01)) }, ...extra });
/** @param {string} id @param {Localized} prompt @param {Localized[]} options @param {number[]} correct @param {Localized} correction @param {Partial<import('./types').SelectStep>} extra @returns {import('./types').SelectStep} */
export const select = (id, prompt, options, correct, correction, extra = {}) => ({ id, type: 'select', prompt, options, correct, correction, ...extra });
/** @param {string} id @param {Localized} prompt @param {Localized[]} rubric @param {Localized} correction @param {Partial<import('./types').ReflectionStep>} extra @returns {import('./types').ReflectionStep} */
export const reflect = (id, prompt, rubric, correction, extra = {}) => ({ id, type: 'reflection', prompt, rubric, correction, ...extra });
/** @param {string} chapter @param {Localized} title @param {Localized} objective @param {Localized} context @param {string[]} sources @param {import('./types').Step[]} steps @param {Partial<import('./types').Activity>} extra @returns {import('./types').Activity} */
export const activity = (chapter, title, objective, context, sources, steps, extra = {}) => ({ id: `practice-${chapter}`, chapter, title, objective, context, sources, steps, minutes: 10, difficulty: 2, ...extra });
