import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { methods, defaults, validParameters, clearance, covariateCurves, covariateCode } from '../src/lib/covariates/models.js';
import { lessonDefaults, lessonTypical, lessonData, symbolicApproximation, validLesson, symbolicStudyRange } from '../src/lib/covariates/lessons.js';

const lessonSettings = lessonDefaults();
assert.ok(!validLesson({ ...lessonSettings, omega: undefined }));
assert.equal(lessonTypical('basics', 70, lessonSettings), 4);
assert.equal(lessonTypical('physiology', 50, lessonSettings), 2);
assert.equal(lessonTypical('groups', 0, lessonSettings), 2.8);
assert.equal(lessonTypical('implementation', 35, { ...lessonSettings, parameter: 'V' }), 15);
assert.equal(lessonTypical('implementation', 70, lessonSettings, 1), 5.2);
assert.equal(lessonTypical('implementation', 70, { ...lessonSettings, parameter: 'V' }, 1), 30);
assert.ok(lessonData('symbolic', lessonSettings).error > 0);
assert.equal(lessonData('symbolic', { ...lessonSettings, approximation: 'full' }).error, 0);
assert.equal(symbolicApproximation(70, lessonSettings), 4);
const symbolic = lessonData('symbolic', lessonSettings);
assert.equal(symbolic.cloud.length, 42);
assert.ok(symbolic.cloud.every(p => p.x >= symbolicStudyRange[0] && p.x <= symbolicStudyRange[1]));
assert.ok(symbolic.cloud.some(p => Math.abs(p.y - lessonTypical('symbolic', p.x, lessonSettings)) > 0.01));
const symbolicZeroEta = lessonData('symbolic', { ...lessonSettings, omega: 0 });
assert.ok(symbolicZeroEta.cloud.every(p => p.y === lessonTypical('symbolic', p.x, lessonSettings)));
assert.equal(symbolic.error, symbolicZeroEta.error);
assert.deepEqual(symbolic.typical, symbolicZeroEta.typical);
for (const lesson of ['basics', 'groups', 'physiology', 'symbolic', 'implementation']) {
  const data = lessonData(lesson, lessonSettings);
  assert.ok([...data.typical, ...data.comparison, ...data.cloud].every(p => Number.isFinite(p.y) && p.y > 0 && p.y < data.yMax));
  assert.deepEqual(data, lessonData(lesson, lessonSettings));
  for (const lang of ['', 'en/']) {
    const chapter = fs.readFileSync(`src/content/chapters/${lang}covariates-${lesson}.md`, 'utf8');
    assert.equal((chapter.match(/viz="Covariate\w+"/g) || []).length, 2);
  }
}
const noVariation = lessonData('basics', { ...lessonSettings, beta: 0, omega: 0 });
assert.ok(noVariation.cloud.every(p => p.y === 4));
const steps = lessonData('groups', { ...lessonSettings, grouping: 'threshold' });
assert.equal(steps.typical.find(p => p.x === 60).y, 4);
assert.equal(steps.typical.find(p => p.x === 90).y, 5.2);

for (const method of methods) {
  const p = defaults(method);
  assert.ok(validParameters(method, p));
  assert.ok(!validParameters(method, { ...p, value: undefined }));
  assert.ok(!validParameters(method, { ...p, volume: 0 }));
  const curves = covariateCurves(method, p);
  assert.ok(curves.effect.length >= 3);
  assert.ok(curves.selected.every(point => Number.isFinite(point.y) && point.y >= 0));
  assert.equal(curves.selected[0].y, p.dose / p.volume);
  assert.ok(Math.abs(clearance(method, p.value, p, 0.2) / clearance(method, p.value, p) - Math.exp(0.2)) < 1e-12);
  assert.match(covariateCode(method, p), /\$SIGMA 0\.01 0/);
  assert.match(covariateCode(method, p, 'mlxtran'), /Cl = Cl0 \* factor/);
}
assert.equal(clearance('transformed', 70, defaults('transformed')), 4);
assert.equal(clearance('physiology', 50, defaults('physiology')), 2);
assert.equal(clearance('symbolic', 1, defaults('symbolic')), 4);
assert.equal(clearance('groups', 2, defaults('groups')), 5.2);
const thresholds = { ...defaults('groups'), grouping: 'threshold', value: 50, reference: 70 };
assert.equal(clearance('groups', 60, thresholds), 4);
assert.equal(clearance('groups', 90, thresholds), 5.2);
assert.ok(!validParameters('groups', { ...defaults('groups'), value: 1.5 }));

if (process.argv.includes('--native')) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pmx-covariates-'));
  try {
    const cases = methods.map(method => ({ method, p: defaults(method) }));
    cases.push({ method: 'groups', p: thresholds });
    const fixtures = cases.map(({ method, p }, index) => {
      const name = `covariate_${index}`;
      fs.writeFileSync(path.join(dir, `${name}.cpp`), covariateCode(method, p));
      return { name, cl: clearance(method, p.value, p), volume: p.volume };
    });
    const lesson = fs.readFileSync('src/content/chapters/covariates-implementation.md', 'utf8');
    fs.writeFileSync(path.join(dir, 'lesson.cpp'), lesson.match(/```cpp\s*([\s\S]*?)```/)[1]);
    fixtures.push({ name: 'lesson', cl: 4, volume: 30 });
    fs.writeFileSync(path.join(dir, 'fixtures.json'), JSON.stringify(fixtures));
    const run = spawnSync(process.env.RSCRIPT || 'Rscript', ['tdm-engine/tests/covariates_native_test.R', dir], { encoding: 'utf8', timeout: 300000 });
    process.stdout.write(run.stdout || ''); process.stderr.write(run.stderr || '');
    assert.equal(run.status, 0, run.error?.message || 'Native mrgsolve covariate checks failed');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}
console.log('Covariate functions, positivity, categories, reference values and code exports PASS');
