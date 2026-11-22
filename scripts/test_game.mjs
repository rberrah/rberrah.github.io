// Deterministic numerical and hidden-route regression tests for PMx Game.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DEFAULTS, CHALLENGE, STEP, atTime, fitScore, simulate, validate } from '../portal/game/engine.js';

const near = (a,b,tol=1e-6) => assert.ok(Math.abs(a-b)<=tol, a + ' differs from ' + b);
const iv = simulate({ model:1, route:'iv', dose:100, vc:20, cl:4, horizon:24 });
for(const t of [0,1,5,10,20,24]) near(atTime(iv,t).c,5*Math.exp(-0.2*t),1e-8);
near(iv.auc,(100/4)*(1-Math.exp(-0.2*24)),0.001);
near(iv.delivered,100);
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

const page=readFileSync('portal/game/index.html','utf8');
for(const expected of ['name="robots" content="noindex,nofollow,noarchive"','src="./app.js"','id="diagram"','id="chart"','id="challenge"'])
  assert.ok(page.includes(expected), expected + ' missing');
for(const path of ['portal/index.html','portal/tools/index.html','portal/sitemap.xml']) {
  const text=readFileSync(path,'utf8');
  assert.ok(!text.includes('/game'), path + ' must not advertise the hidden route');
}
const injector=readFileSync('scripts/add_portal_analytics.mjs','utf8');
assert.match(injector,/directory === target && entry.name === 'game'/);
console.log('PASS: PMx Game analytic IV profile, AUC, mass conservation (6 structures/routes), linearity, bounds and unlisted URL.');
