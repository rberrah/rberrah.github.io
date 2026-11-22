// Deterministic numerical and hidden-route regression tests for PMx Game.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DEFAULTS, CHALLENGE, STEP, atTime, fitScore, simulate, validate } from '../portal/game/engine.js';
import { QUESTS, profileFor, grade, logSlope, validateProgress, unlockedIndex } from '../portal/game/academy-core.js';

const near = (a,b,tol=1e-6) => assert.ok(Math.abs(a-b)<=tol, a + ' differs from ' + b);
const iv = simulate({ model:1, route:'iv', dose:100, vc:20, cl:4, horizon:24 });
for(const t of [0,1,5,10,20,24]) near(atTime(iv,t).c,5*Math.exp(-0.2*t),1e-8);
near(iv.auc,(100/4)*(1-Math.exp(-0.2*24)),0.001);
near(iv.delivered,100);
// An IV bolus at the last instant changes C(t), but adds zero AUC over [0, t].
const boundaryBolus = simulate({ model:1, route:'iv', dose:100, vc:20, cl:4, horizon:24, tau:24, doses:2 });
near(boundaryBolus.auc, iv.auc, 1e-9);
near(boundaryBolus.cEnd, iv.cEnd+5, 1e-8);
near(iv.points[0].c,5);
near(iv.points[0].gut,0);

for (const model of [1,2,3]) for(const route of ['oral','iv']) {
  const sim = simulate({ model, route, doses:3, tau:12, horizon:48, f:0.65 });
  near(sim.delivered, route === 'oral' ? 195 : 300);
  for(const p of sim.points) {
    near(p.gut+p.central+p.p1+p.p2+p.eliminated,sim.delivered >= 0 ? (
      p.t < 12 ? (route==='oral'?65:100) :
      p.t < 24 ? (route==='oral'?130:200) : (route==='oral'?195:300)
    ) : 0,0.001);
    for(const value of [p.gut,p.central,p.p1,p.p2,p.eliminated,p.c])
      assert.ok(Number.isFinite(value) && value>=0);
  }
  const mid = atTime(sim,5);
  assert.equal(mid.p1 > 0, model >= 2);
  assert.equal(mid.p2 > 0, model >= 3);
}
const oral = simulate({ ...DEFAULTS, route:'oral', doses:1 });
near(oral.points[0].c,0);
near(oral.points[0].gut,80);
const a = simulate({route:'oral',dose:80});
const b = simulate({route:'oral',dose:160});
near(2*a.auc,b.auc,1e-7);
near(2*a.peak,b.peak,1e-7);
assert.equal(fitScore(simulate(CHALLENGE),simulate(CHALLENGE)),100);
assert.ok(fitScore(simulate(DEFAULTS),simulate(CHALLENGE)) < 100);
for(const bad of [{dose:0},{ka:Infinity},{vc:0},{model:4},{route:'inject'},{horizon:12.3},{targetLow:5,targetHigh:3}])
  assert.throws(()=>validate(bad),RangeError);
near(STEP,0.025);

const delayed=simulate({model:1,route:'oral',lag:2,ka:1.5,horizon:24});
near(atTime(delayed,1.975).c,0);
near(atTime(delayed,2).gut,80);
assert.ok(atTime(delayed,2.05).c>0);
const immediate=simulate({model:1,route:'oral',lag:0,ka:1.5,horizon:24});
assert.ok(atTime(immediate,1).c>0);
assert.throws(()=>simulate({lag:6.25}),RangeError);
const ivWithLag=simulate({model:1,route:'iv',lag:2});
near(ivWithLag.points[0].c,100/25);

assert.equal(QUESTS.length,9);
assert.deepEqual(QUESTS.map(q=>q.id),['voyage','mono','bi','lag','slope','three','samples','flip','boss']);
for(const quest of QUESTS){
  const profile=profileFor(quest);
  assert.ok(profile.points.every(p=>p.c>=0 && Number.isFinite(p.c)));
  assert.equal(profile.config.doses,1);
  assert.equal(grade(quest,quest.answerMode==='number'?quest.answerValue:quest.answer).correct,true,quest.id);
  if(quest.answerMode==='number')assert.equal(grade(quest,quest.answerValue+1).correct,false,quest.id);
  else assert.equal(grade(quest,(quest.answer+1)%quest.options.length).correct,false,quest.id);
}
const slopeData=profileFor(QUESTS.find(q=>q.id==='slope'));
near(logSlope(slopeData,2,6),-0.25,1e-8);
const lagQuest=QUESTS.find(q=>q.id==='lag');
near(atTime(profileFor(lagQuest),1.975).c,0);
assert.equal(grade(lagQuest,2.25).correct,true);
assert.equal(grade(lagQuest,2.5).correct,false);
assert.equal(grade(QUESTS.find(q=>q.id==='slope'),0.25).correct,true);
assert.equal(grade(QUESTS.find(q=>q.id==='slope'),'').correct,false);
const cleaned=validateProgress({completed:['mono','mono','fake','voyage'],xp:999999});
assert.deepEqual(cleaned.completed,['mono','voyage']);
assert.equal(cleaned.xp,110);
assert.equal(unlockedIndex([]),0);
assert.equal(unlockedIndex(['voyage','mono']),2);
assert.equal(unlockedIndex(QUESTS.map(q=>q.id)),8);
assert.ok(profileFor(QUESTS[2]).points.length>profileFor(QUESTS[1]).points.length);


const page=readFileSync('portal/game/index.html','utf8');
for(const expected of ['name="robots" content="noindex,nofollow,noarchive"','src="./app.js"','src="./academy.js"','href="./academy.css"','id="academy-mode"','id="quest-list"','id="academy-chart"','id="diagram"','id="chart"','id="challenge"'])
  assert.ok(page.includes(expected), expected + ' missing');
for(const path of ['portal/index.html','portal/tools/index.html','portal/sitemap.xml']) {
  const text=readFileSync(path,'utf8');
  assert.ok(!text.includes('/game'), path + ' must not advertise the hidden route');
}
const injector=readFileSync('scripts/add_portal_analytics.mjs','utf8');
assert.match(injector,/directory === target && entry.name === 'game'/);
console.log('PASS: PMx Game analytic IV profile, AUC, mass conservation (6 structures/routes), linearity, bounds and unlisted URL.');
