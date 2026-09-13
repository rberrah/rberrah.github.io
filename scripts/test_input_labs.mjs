import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { defaults, validateParameters, stateAt, series, singleDoseSummary, laboratorySpec, encodeScenario, decodeScenario, legoSpec, mrgsolveCode } from '../src/lib/labs/model.js';
import { particleJourneys, particlePosition, sceneLayout } from '../src/lib/labs/particles.js';
const close = (a, b, tol = 1e-8) => assert.ok(Math.abs(a-b) <= tol * Math.max(1,Math.abs(b)), `${a} != ${b}`);
const fixtures = [];
for (const lab of ['absorption', 'infusion']) {
  const cases = lab === 'absorption' ? [{}, { f: 0 }, { f: 1 }, { ka: .2 }, { ka: .20000000001 }, { ka: .01, cl: 30, vc: 5 }, { ka: 10, cl: .1, vc: 100 }] : [{}, { duration: .1 }, { duration: 72 }, { duration: 12, cl: 30, vc: 5 }];
  for (const changes of cases) {
    const p = validateParameters(lab, { ...defaults[lab], ...changes });
    const landmark = singleDoseSummary(lab, p), rows = series(lab, p);
    const initial = stateAt(lab,p,0);
    close(initial.c, 0); close(initial.auc,0);
    close(lab === 'absorption' ? initial.depot : initial.reservoir,p.dose);
    let previousAuc = 0;
    for (const row of rows) {
      assert.ok(Object.values(row).every(Number.isFinite));
      for (const key of ['c','depot','reservoir','lost','central','eliminated','auc']) assert.ok(row[key] >= -1e-10);
      close(row.depot+row.lost+row.central+row.eliminated,row.administered);
      if (lab === 'infusion') close(row.administered+row.reservoir,p.dose);
      assert.ok(row.auc >= previousAuc - 1e-9); previousAuc = row.auc;
      assert.ok(row.c <= landmark.cmax + 1e-9);
    }
    close(stateAt(lab,p,100000).auc,landmark.aucInfinity);
    const spec = laboratorySpec(lab,p);
    assert.deepEqual(decodeScenario(encodeScenario(spec)),spec);
    assert.throws(() => mrgsolveCode(lab,p), /not verified/);
    const particles = particleJourneys(lab,p);
    assert.ok(particles.length >= 12 && particles.length <= 500);
    assert.deepEqual(particles,particleJourneys(lab,p));
    for (const particle of particles) {
      assert.equal(particle.visits[0].room,lab==='absorption'?'depot':'reservoir');
      if (lab==='absorption' && p.f===0) assert.ok(particle.visits.every(v=>v.room!=='central'));
      if (lab==='absorption' && p.f===1) assert.ok(particle.visits.every(v=>v.room!=='lost'));
      if (lab==='infusion') assert.ok(particle.visits.every(v=>v.room!=='reservoir'||v.time===0));
      for (const width of [288,700,1240]) {
        const g = sceneLayout(width,lab);
        for (const t of [0,.1,2,12,1000]) {
          const pos = particlePosition(particle,t,g);
          assert.ok(pos && pos.x>=0 && pos.x<=width && pos.y>=0 && pos.y<=g.height);
        }
        for (const visit of particle.visits.slice(1)) {
          const before=particlePosition(particle,visit.time-1e-10,g), after=particlePosition(particle,visit.time,g);
          assert.ok(Math.hypot(before.x-after.x,before.y-after.y)<.01);
        }
      }
    }
    if (lab==='infusion') {
      assert.ok(rows.some(row=>row.t===p.duration) || p.duration>p.end);
      close(stateAt(lab,p,p.duration).c,stateAt(lab,p,p.duration+1e-9).c);
      close(stateAt(lab,p,p.duration+landmark.terminalHalfLife).c,landmark.cmax/2);
      close(stateAt(lab,p,Math.min(1,p.duration/2)).administered,p.dose/p.duration*Math.min(1,p.duration/2));
    }
    const times = [...new Set([0,.01,.1,1,2,5,12,24,72,landmark.tmax,landmark.tmax+.01])].sort((a,b)=>a-b);
    fixtures.push({ lab, parameters:p, spec:legoSpec(lab,p), points:times.map(t=>stateAt(lab,p,t)) });
  }
}
const p = defaults.absorption;
close(stateAt('absorption',{...p,ka:p.cl/p.vc},2).c,p.f*p.dose/p.vc*(p.cl/p.vc)*2*Math.exp(-p.cl/p.vc*2));
assert.throws(()=>validateParameters('distribution',{ka:1}));
assert.throws(()=>validateParameters('absorption',{f:1.1}));
assert.throws(()=>validateParameters('infusion',{duration:0}));
if (process.argv[2]) writeFileSync(process.argv[2],JSON.stringify(fixtures));
console.log(`Input laboratories: ${fixtures.length} scenarios, exact landmarks, mass balance, boundaries, shares and particle paths passed.`);
