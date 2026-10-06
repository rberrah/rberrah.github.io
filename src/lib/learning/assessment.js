/** Numeric input is deliberately not an expression evaluator. @param {unknown} input */
export function numericValue(input) {
  const text = String(input ?? '').trim().replace(',', '.').replace(/\u2212/g, '-');
  return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text) && Number.isFinite(Number(text)) ? Number(text) : null;
}

/** @param {number} value @param {number} answer @param {import('./types').Tolerance} tolerance */
export function withinTolerance(value, answer, tolerance) {
  const margin = tolerance.kind === 'relative' ? Math.abs(answer) * tolerance.value : tolerance.value;
  return Math.abs(value - answer) <= margin + Number.EPSILON * Math.max(1, Math.abs(answer)) * 8;
}

/** Grade only objective responses. Free reasoning is never automatically marked correct.
 * @param {import('./types').Step} step @param {any} input @param {string} unit @returns {import('./types').Assessment} */
export function assess(step, input, unit = '') {
  if (step.type === 'tune') {
    const keys = Object.keys(step.targets);
    const valid = input && keys.every(key => Number.isFinite(input[key]));
    return { valid: Boolean(valid), correct: Boolean(valid && keys.every(key => Math.abs(input[key] - step.targets[key]) < 1e-8)), reason: 'settings' };
  }
  if (step.type === 'numeric') {
    const value = numericValue(input);
    if (value === null) return { valid: false, correct: false, reason: 'number' };
    if (unit !== step.unit) return { valid: true, correct: false, reason: 'unit' };
    const correct = withinTolerance(value, step.answer, step.tolerance);
    const common = (step.commonErrors ?? []).find(error => withinTolerance(value, error.value, step.tolerance));
    return { valid: true, correct, reason: correct ? '' : 'value', feedback: common?.feedback };
  }
  if (step.type === 'select') {
    if (!Array.isArray(input) || !input.length) return { valid: false, correct: false, reason: 'selection' };
    const keys = new Set(input);
    return { valid: true, correct: keys.size === step.correct.length && step.correct.every(id => keys.has(id)), reason: 'selection' };
  }
  return { valid: false, correct: false, reason: 'self-assessment' };
}

/** @param {import('./types').Step[]} steps @param {import('./types').StepState[]} states */
export function activityStatus(steps, states) {
  if (!states.some(s => s.attempts || s.revealed)) return '';
  const complete = states.length === steps.length && steps.every((step, i) => step.type === 'reflection' ? states[i].reviewed : states[i].correct || states[i].revealed);
  if (!complete) return 'attempted';
  return steps.every((step, i) => step.type === 'reflection' || (states[i].correct && !states[i].revealed)) ? 'passed' : 'reviewed';
}

/** @returns {import('./types').StepState} */
export const emptyStep = () => ({ input: '', unit: '', selected: [], attempts: 0, correct: false, revealed: false, reviewed: false, hints: 0, result: null });

export const progressKey = 'pmx-learning-v1';
/** @returns {import('./types').Progress} */
export const emptyProgress = () => ({ version: 1, chapters: {}, activities: {} });

// Restore only whitelisted status fields, never arbitrary saved inputs or patient data.
/** @param {any} value */
export function cleanProgress(value) {
  const clean = emptyProgress();
  if (!value || value.version !== 1) return clean;
  for (const kind of /** @type {const} */ (['chapters', 'activities'])) {
    const statuses = kind === 'chapters' ? ['seen'] : ['attempted', 'reviewed', 'passed'];
    for (const [id, status] of Object.entries(value[kind] ?? {}).slice(0, 500)) {
      if (/^[a-z][a-z0-9-]{0,89}$/.test(id) && typeof status === 'string' && statuses.includes(status)) clean[kind][id] = status;
    }
  }
  return clean;
}
