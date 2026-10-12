import assert from 'node:assert/strict';
import fs from 'node:fs';
import {calculateSignatureExposure,crossDomainLessons} from '../src/lib/cross-domains/omics-pkpd-lessons.js';

const ref=calculateSignatureExposure({signature:0,beta:.25});
assert.equal(ref.apparentClearanceLPerHour,25);
assert.equal(ref.aucNgHourPerMl,200);
assert.equal(ref.aucRatioToReference,1);
assert.equal(ref.educationalOnly,true);
const increased=calculateSignatureExposure({signature:2,beta:.25});
const decreased=calculateSignatureExposure({signature:-2,beta:.25});
assert.ok(increased.apparentClearanceLPerHour>ref.apparentClearanceLPerHour);
assert.ok(increased.aucNgHourPerMl<ref.aucNgHourPerMl);
assert.ok(decreased.aucNgHourPerMl>ref.aucNgHourPerMl);
assert.ok(Math.abs(increased.aucRatioToReference-Math.exp(-.5))<1e-12);
assert.ok(Math.abs(increased.apparentClearanceRatioToReference*increased.aucRatioToReference-1)<1e-12);
assert.ok(Math.abs(calculateSignatureExposure({signature:2,beta:0}).aucNgHourPerMl-200)<1e-12);
for(const args of [{signature:NaN,beta:.2},{signature:4,beta:.2},
  {signature:0,beta:-2},{signature:0,beta:0,doseMg:0},
  {signature:0,beta:0,apparentClearanceLPerHour:0}]){
  assert.throws(()=>calculateSignatureExposure(args));
}
assert.equal(crossDomainLessons.length,4);
assert.equal(new Set(crossDomainLessons.map(x=>x.id)).size,4);
const lessonOrder=crossDomainLessons.map(x=>x.id);
assert.deepEqual(lessonOrder,['match','covariate','pd','mechanistic']);
for(const lesson of crossDomainLessons){
  for(const lang of ['fr','en']){
    assert.ok(lesson.title[lang].length>10);
    assert.equal(lesson.steps[lang].length,3);
    assert.ok(lesson.takeaway[lang].length>15);
    const quiz=lesson.quiz[lang];
    assert.equal(quiz.a.length,3);
    assert.ok(quiz.correct>=0 && quiz.correct<3);
    assert.ok(quiz.why.length>15);
  }
  for(const link of lesson.links)
    assert.ok(fs.existsSync('src/content/chapters/'+link.slug+'.md'),
      'Unresolved actual PKPD reference lesson: '+link.slug);
}
const route=fs.readFileSync('src/routes/domaines/+page.svelte','utf8');
const nav=fs.readFileSync('src/routes/+layout.svelte','utf8');
assert.ok(route.includes('SITE_ORIGIN')&&route.includes('/multiomics/tool/'));
assert.ok(route.includes('educationalOnly')===false);
assert.ok(route.includes('data-testid="cross-domain-auc"'));
assert.ok(route.includes('role="status"'));
assert.ok(nav.includes("key: 'cross-domains'"));
assert.ok(nav.includes("label: $language === 'en' ? 'Other disciplines' : 'Liens avec les autres domaines'"));
console.log('CROSS-DOMAIN OMICS-PKPD COURSES: scientific calculator, curricula, references and nav contracts PASS');
