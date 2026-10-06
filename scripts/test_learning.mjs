// @ts-nocheck
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import matter from 'gray-matter';
import { get } from 'svelte/store';
import { covariateActivities as activities, activitiesForChapter } from '../src/lib/content/covariateActivities.js';
import { resolveSources } from '../src/lib/content/references.js';
import { numericValue, assess, activityStatus, emptyStep, cleanProgress, progressKey } from '../src/lib/learning/assessment.js';
import { lessonDefaults, lessonTypical, lessonData } from '../src/lib/covariates/lessons.js';
import { defaults, covariateCurves } from '../src/lib/covariates/models.js';

const ids = new Set();
for (const activity of activities) {
  assert(!ids.has(activity.id)); ids.add(activity.id);
  const file = new URL(`../src/content/chapters/${activity.chapter}.md`, import.meta.url);
  const chapter = matter(readFileSync(file, 'utf8')).data;
  assert.equal(chapter.track, 'covariates');
  assert(activity.minutes > 0 && activity.difficulty >= 1 && activity.difficulty <= 3);
  assert.equal(resolveSources(activity.sources).length, activity.sources.length);
  const bilingual = object => {
    if (!object || typeof object !== 'object') return;
    if ('fr' in object || 'en' in object) assert(object.fr?.trim() && object.en?.trim(), `Missing language: ${activity.id}`);
    Object.values(object).forEach(value => { if (typeof value === 'object') bilingual(value); });
  };
  bilingual(activity);
  assert(activity.steps.length >= 2);
  assert.equal(new Set(activity.steps.map(s => s.id)).size, activity.steps.length);
  for (const step of activity.steps) {
    if (step.type === 'numeric') {
      assert(Number.isFinite(step.answer)); assert(step.tolerance.value > 0);
      assert(['absolute', 'relative'].includes(step.tolerance.kind));
      assert(assess(step, String(step.answer), step.unit).correct);
      assert(!assess(step, 'NaN', step.unit).valid);
      assert(!assess(step, String(step.answer), 'wrong unit').correct);
      const margin = step.tolerance.kind === 'relative' ? Math.abs(step.answer) * step.tolerance.value : step.tolerance.value;
      assert(assess(step, String(step.answer + margin), step.unit).correct);
      assert(!assess(step, String(step.answer + margin * 1.1), step.unit).correct);
    } else if (step.type === 'select') {
      assert(step.correct.length > 0 && step.correct.every(i => i >= 0 && i < step.options.length));
      assert.equal(new Set(step.correct).size, step.correct.length);
      assert(assess(step, step.correct).correct);
      assert(!assess(step, []).valid);
      const wrong = Array.from({ length: step.options.length }, (_, i) => i).filter(i => !step.correct.includes(i));
      assert(!assess(step, wrong).correct);
    } else if (step.type === 'tune') {
      assert(assess(step, step.targets).correct);
      assert(!assess(step, null).valid);
      assert(!assess(step, { ...step.targets, [Object.keys(step.targets)[0]]: NaN }).valid);
    } else {
      assert.equal(step.type, 'reflection'); assert(step.rubric.length >= 2);
      assert(!assess(step, 'Any text').correct);
    }
    if (step.visual) assert(lessonData(step.visual.lesson, { ...lessonDefaults(), ...step.visual.settings }).typical.length > 0);
  }
  const states = activity.steps.map(emptyStep);
  assert.equal(activityStatus(activity.steps, states), '');
  states[0].attempts = 1;
  assert.equal(activityStatus(activity.steps, states), 'attempted');
  states.forEach(s => { s.attempts = 1; s.correct = true; s.reviewed = true; });
  assert.equal(activityStatus(activity.steps, states), 'passed');
  states[0].revealed = true;
  assert.equal(activityStatus(activity.steps, states), 'reviewed');
}
assert.equal(activities.length, 11);
for (const chapter of ['basics', 'groups', 'physiology', 'symbolic']) assert.equal(activitiesForChapter(`covariates-${chapter}`).length, 2);
assert.equal(activitiesForChapter('covariates-implementation').length, 3);

// Independently specified numerical reference cases and cross-checks against the plots.
const expected = {
  'cov-weight-eta': [3.108, 3.796], 'cov-dispersion': [0.09], 'cov-category-code': [-0.356675, 5.2],
  'cov-threshold': [1.2], 'cov-maturation': [2], 'cov-organ': [3.2, 2], 'cov-extrapolation': [2.3784],
  'cov-code-check': [4.040, 21.42857], 'cov-omega-time': [0.5], 'cov-synthesis': [3.33333, 1.42262]
};
for (const activity of activities) activity.steps.filter(s => s.type === 'numeric').forEach((step, i) => {
  assert(Math.abs(step.answer - expected[activity.id][i]) < 0.002, `${activity.id}: ${step.answer}`);
});
assert.equal(activities[0].steps[0].answer, lessonTypical('basics', 50, lessonDefaults()));
const matured = { ...lessonDefaults(), half: 60 };
assert.equal(lessonTypical('physiology', 60, matured), 2);
assert.equal(lessonData('basics', { ...lessonDefaults(), beta: 0, omega: 0 }).cloud.every(p => p.y === 4), true);
const a = covariateCurves('transformed', { ...defaults('transformed'), value: 50 }).selected;
const b = covariateCurves('transformed', { ...defaults('transformed'), value: 80 }).selected;
assert.equal(a[0].y, b[0].y); assert(a[50].y > b[50].y);
for (const bad of ['', ' ', '2 apples', '1+1', 'Infinity', '1e999', '0x10', '1,2,3']) assert.equal(numericValue(bad), null);
assert.equal(numericValue(' -0,3567 '), -0.3567); assert.equal(numericValue('1.2e-3'), 0.0012);
assert.equal(numericValue('0'), 0);

const dirty = { version: 1, patient: 'private', chapters: { 'covariates-basics': 'seen', bad: 'private' }, activities: { 'cov-weight-eta': 'passed', injection: { answer: 'private' } } };
assert.deepEqual(cleanProgress(dirty), { version: 1, chapters: { 'covariates-basics': 'seen' }, activities: { 'cov-weight-eta': 'passed' } });
assert.deepEqual(cleanProgress({ ...dirty, version: 99 }).activities, {});

// Persistence is opt-in and never stores answers; disabling removes the saved record.
const memory = new Map();
globalThis.window = {};
globalThis.localStorage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value), removeItem: key => memory.delete(key) };
const { loadLearning, enableLearning, markLearning, clearLearning, learning } = await import('../src/lib/stores/learning.js');
loadLearning(); markLearning('chapters', 'covariates-basics', 'seen');
assert.equal(memory.size, 0);
enableLearning(true); markLearning('activities', 'cov-weight-eta', 'passed');
assert.deepEqual(Object.keys(JSON.parse(memory.get(progressKey))).sort(), ['activities', 'chapters', 'version']);
enableLearning(false); assert.equal(memory.size, 0);
clearLearning(); assert.equal(Object.keys(get(learning).chapters).length, 0);
globalThis.localStorage.setItem = () => { throw new Error('Storage blocked'); };
enableLearning(true); assert.equal(get(learning).error, true);
delete globalThis.window; delete globalThis.localStorage;
console.log(`Learning checks passed: ${activities.length} guided activities, ${activities.reduce((n, a) => n + a.steps.length, 0)} steps, units, grading, plots and private opt-in progress.`);
