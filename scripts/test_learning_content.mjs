// @ts-nocheck
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import matter from 'gray-matter';
import { guidedActivities as activities, activitiesForChapter } from '../src/lib/content/guidedActivities.js';
import { learningTracks, tracks } from '../src/lib/content/tracks.js';
import { resolveSources } from '../src/lib/content/references.js';
import { assess, activityStatus, emptyStep, numericValue } from '../src/lib/learning/assessment.js';
import { displayUnit } from '../src/lib/learning/activityContent.js';
import { experimentDefinitions, experimentCurve, experimentValue, validExperiment, parameterBounds } from '../src/lib/learning/experiments.js';
import { glossaryDetails, glossaryEnglish } from '../src/lib/content/glossaryMeta.js';

const dir = new URL('../src/content/chapters/', import.meta.url);
const chapters = readdirSync(dir).filter(f => f.endsWith('.md') && !f.startsWith('_')).map(f => matter(readFileSync(new URL(f, dir), 'utf8')).data);
const glossarySource = readFileSync(new URL('../src/lib/stores/glossary.js', import.meta.url), 'utf8');
const glossaryTerms = [...glossarySource.matchAll(/term: '([^']+)'/g)].map(match => match[1]);
assert(glossaryTerms.length > 80);
assert.deepEqual(glossaryTerms.filter(term => !glossaryEnglish[term]), []);
for (const term of ['CL', 'V', 'Ka', 'Cmax / Tmax', 'AUC', 'RSE', 'VPC', 'Shrinkage', 'CMI', 'PTA']) assert(glossaryDetails[term], `Missing glossary details: ${term}`);
const syntheses = activities.filter(activity => activity.kind === 'synthesis');
assert.equal(syntheses.length, 13);
assert.equal(new Set(syntheses.map(activity => activity.track)).size, syntheses.length);
assert.equal(new Set(activities.map(a => a.id)).size, activities.length);
for (const chapter of chapters) assert(activitiesForChapter(chapter.slug).length > 0, `Missing guided activity: ${chapter.slug}`);
for (const track of tracks) assert(activities.some(a => chapters.some(c => c.slug === a.chapter && c.track === track.id)), track.id);
for (const track of learningTracks.filter(track => !['core', 'nonmem', 'monolix', 'nlmixr2'].includes(track.id))) {
  assert(syntheses.some(activity => activity.track === track.id), `Missing synthesis: ${track.id}`);
}
for (const activity of activities) {
  assert(chapters.some(c => c.slug === activity.chapter), activity.chapter);
  assert.equal(resolveSources(activity.sources).length, activity.sources.length, activity.id);
  assert(activity.steps.length >= 2);
  assert(activity.steps.some(s => s.type !== 'select'), `Only MCQs: ${activity.id}`);
  const checkLanguage = value => {
    if (!value || typeof value !== 'object') return;
    if ('fr' in value || 'en' in value) assert(value.fr?.trim() && value.en?.trim(), `Language: ${activity.id}`);
    for (const item of Object.values(value)) {
      if (typeof item === 'object') checkLanguage(item);
      if (typeof item === 'string') assert(!/[\uFFFD\uE000-\uF8FF]|Ã[©¨ª]|â€™/.test(item), `Broken encoding: ${activity.id}`);
    }
  };
  checkLanguage(activity);
  assert.equal(new Set(activity.steps.map(s => s.id)).size, activity.steps.length, activity.id);
  for (const step of activity.steps) {
    if (step.type === 'numeric') {
      assert(Number.isFinite(step.answer));
      assert(assess(step, String(step.answer), step.unit).correct);
      assert(!assess(step, 'invalid', step.unit).valid);
      assert(!assess(step, String(step.answer), 'incorrect unit').correct);
      const margin = step.tolerance.kind === 'absolute' ? step.tolerance.value : Math.abs(step.answer) * step.tolerance.value;
      assert(!assess(step, String(step.answer + 2 * margin), step.unit).correct);
    } else if (step.type === 'select') {
      assert(assess(step, step.correct).correct);
      assert(!assess(step, []).valid);
      assert(step.correct.every(i => step.options[i]));
      assert(step.correct.length < step.options.length);
    } else if (step.type === 'reflection') {
      assert(step.rubric.length >= 2);
      assert(!assess(step, 'This is not auto-graded').correct);
    } else {
      assert(step.visual || step.experiment);
      assert(assess(step, step.targets).correct);
      assert(!assess(step, null).valid);
    }
    if (step.experiment) {
      const spec = step.experiment;
      const defaults = { ...experimentDefinitions[spec.kind].defaults, ...spec.settings };
      assert(validExperiment(spec.kind, defaults), activity.id);
      assert(spec.controls.every(k => k in defaults && parameterBounds[k]), activity.id);
      assert(experimentCurve(spec.kind, defaults).every(p => Number.isFinite(p.y) && p.y >= 0));
      if (step.type === 'tune') {
        assert(Object.keys(step.targets).every(k => spec.controls.includes(k)));
        assert(validExperiment(spec.kind, { ...defaults, ...step.targets }));
      }
    }
  }
  const states = activity.steps.map(emptyStep);
  assert.equal(activityStatus(activity.steps, states), '');
  states.forEach(s => { s.correct = true; s.reviewed = true; s.attempts = 1; });
  assert.equal(activityStatus(activity.steps, states), 'passed');
  const objective = activity.steps.findIndex(s => s.type !== 'reflection');
  states[objective].revealed = true;
  assert.equal(activityStatus(activity.steps, states), 'reviewed');
}

// Independently rounded reference results, not generated from the answer catalogue.
const expected = {
  'pourquoi-pharmacometrie': [20, .5], 'trois-approches': [5], 'micro-macro': [.3, .1],
  'clairance-volume-demi-vie': [5, 1.386294], 'absorption-orale': [.25],
  'doses-repetees': [2.5, 1.156518], perfusion: [50, 3.934693], 'erreur-residuelle': [2.236068],
  'voies-absorption': [.6, 8.333333], 'parent-metabolite': [30, 10],
  'variabilite-iiv-iov': [5.525855, 1.221403], allometrie: [3.107878, 21.428571], pkpd: [50, 83.333333],
  'parametric-vs-nonparametric': [5.9, 23], 'pmetrics-nonparametric': [.2, 6.8],
  'outils-estimation': [128, 130], 'validation-vpc': [72], 'bayes-ebes': [7, 2], tdm: [1.25, 500],
  'math-edo': [80, 81.873075], 'math-regression': [17, 2], 'math-stats': [4], 'math-bayes': [.1, 4.4],
  'math-covariates': [.678072, 5], 'math-fisher': [2.25, 1], 'math-copula': [3, 19],
  'nca-intro': [12, 18], 'nca-auc': [10, 25], 'nca-params': [5, 5, 25], 'nca-absorption': [105],
  'pbpk-intro': [30, 6], 'pbpk-distribution': [1, 1], 'pbpk-absorption': [.3, 30], 'pbpk-applications': [5.5, 1.818182],
  'pd-direct': [40], 'pd-effect-compartment': [1.386294, 6.321206], 'pd-indirect': [50, 25],
  'pd-tolerance': [.5], 'pd-survival': [.548812, 6.931472], 'onco-models': [2, 1],
  'onco-tgi': [182.211880], 'onco-tox': [.033333, 1.125058], 'infectio-pkpd': [5.545177, 69.314718],
  'infectio-tdm': [75, 0], 'infectio-viral': [1.151293, .602060], 'mab-pk': [13.862944, 500],
  'mab-tmdd': [5, 1], 'mab-ada': [1.5, .666667], 'neural-ode': [10], 'ai-ml-tdm': [3.333333, 14.142136, 100],
  'ai-trees': [100], 'ai-boosting': [97, -17], 'ai-svm': [2, .4], 'ai-featselect': [20],
  'ai-clustering': [1, 2.236068], 'ai-llm': [5], 'valid-objective': [210, 211], 'valid-gof': [1],
  'valid-uncertainty': [40, 1.08], 'valid-npde': [0, 1.96], 'valid-vpc': [5], 'valid-shrinkage': [60, 84],
  'valid-diagnostics': [60], 'valid-interpretation': [.666667], 'trials-fih': [.2, 10],
  'trials-cts': [78, 70], 'trials-interpretation': [1.25, 1.538462], 'trials-adaptive': [80, 100],
  'tools-algorithms': [2], 'tools-simulation': [10, 250], 'tools-mipd': [11, 12], 'residual-mipd': [7, 8.2]
};
for (const tool of ['nonmem', 'monolix', 'nlmixr2']) {
  expected[`tools-${tool}`] = [48, 36];
  expected[`${tool}-modele-structural`] = [.25, 5];
  expected[`${tool}-variabilite`] = [.09, 6.749294];
  expected[`${tool}-erreur-residuelle`] = [tool === 'nonmem' ? .04 : .2, 2];
  expected[`${tool}-moteur`] = [4];
  expected[`${tool}-avance`] = [120, 85];
}
for (const activity of activities.filter(a => !a.id.startsWith('cov-') && a.kind !== 'synthesis')) {
  const answers = activity.steps.filter(s => s.type === 'numeric');
  assert.equal(answers.length, expected[activity.chapter]?.length, `Reference coverage: ${activity.id}`);
  answers.forEach((s, i) => assert(Math.abs(s.answer - expected[activity.chapter][i]) < .00002, `${activity.chapter}: ${s.answer} vs ${expected[activity.chapter][i]}`));
}

const defaults = kind => ({ ...experimentDefinitions[kind].defaults });
assert.equal(experimentValue('bolus', 0, defaults('bolus')), 5);
assert.equal(experimentValue('bolus', 0, { ...defaults('bolus'), v: 10 }), 10);
assert(Math.abs(experimentValue('oral', 2, { ...defaults('oral'), ka: .25 }) - 1.51632665) < 1e-7);
assert(Math.abs(experimentValue('infusion', 2, defaults('infusion')) - 3.9346934) < 1e-7);
assert.equal(experimentValue('emax', 3, { ...defaults('emax'), baseline: 10, maximum: 80, ec50: 3 }), 50);
assert.equal(experimentValue('growth', 60, { ...defaults('growth'), kill: .02 }), 100);
assert(Math.abs(experimentValue('survival', 6, defaults('survival')) - .548811636) < 1e-8);
assert.equal(experimentValue('error', 10, defaults('error')), Math.sqrt(5));
assert(!validExperiment('bolus', { ...defaults('bolus'), v: 0 }));
assert.equal(experimentCurve('emax', { ...defaults('emax'), ec50: NaN }).length, 0);
assert.equal(numericValue('−17'), -17);
assert.equal(displayUnit('mg.day/L', 'fr'), 'mg.j/L');
assert.equal(displayUnit('mg/day', 'en'), 'mg/day');
console.log(`Learning content: ${chapters.length} chapters / ${tracks.length} tracks / ${activities.length} activities / ${activities.reduce((n, a) => n + a.steps.length, 0)} steps. Reference answers, sources, languages, grading and curves OK.`);
