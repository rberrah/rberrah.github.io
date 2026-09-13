import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { defaults, validateParameters, stateAt, series, schedule, laboratorySpec, encodeScenario, decodeScenario, legoSpec, mrgsolveCode } from '../src/lib/labs/model.js';
import { particleJourneys, particlePosition, particleVisit, sceneLayout } from '../src/lib/labs/particles.js';
const close = (a, b, tolerance = 1e-8) => assert.ok(Math.abs(a - b) <= tolerance * Math.max(1, Math.abs(b)), `${a} != ${b}`);
const fixtures = [];
for (const lab of ['distribution', 'accumulation']) {
  for (const changes of [{}, { cl: 0.1, vc: 100, q: 0 }, { cl: 30, vc: 5, q: 50, vp: 5 }, { loading: 3, tau: 6, count: 12 }, { q: 0.000001 }]) {
    const p = validateParameters(lab, { ...defaults[lab], ...changes });
    const doses = schedule(lab, p), initial = stateAt(lab, p, 0);
    close(initial.central, doses[0].amount); close(initial.peripheral, 0); close(initial.auc, 0);
    const rows = series(lab, p);
    for (const r of rows) {
      close(r.central + r.peripheral + r.eliminated, r.administered);
      assert.ok([r.c, r.cp, r.central, r.peripheral, r.eliminated, r.auc].every(x => Number.isFinite(x) && x >= -1e-8));
      close(r.auc, r.eliminated / p.cl);
    }
    for (const d of doses.filter(d => d.time <= p.end)) {
      close(stateAt(lab, p, d.time).central - stateAt(lab, p, d.time, true).central, d.amount);
      assert.equal(rows.filter(r => r.t === d.time).length, 2);
    }
    const shared = laboratorySpec(lab, p, defaults[lab], true, true);
    assert.deepEqual(decodeScenario(encodeScenario(shared)), shared);
    assert.equal(legoSpec(lab, p).nodes.length, lab === 'distribution' ? 2 : 1);
    const times = [0, 0.01, 0.1, 1, 2, 5, 7.999, 8.001, 12.123, 24.123, 48.123, 72.123];
    fixtures.push({ lab, parameters: p, spec: legoSpec(lab, p), code: mrgsolveCode(lab, p), doses, points: times.map(t => stateAt(lab, p, t)) });
  }
}
const p = defaults.accumulation, k = p.cl / p.vc;
close(stateAt('accumulation', p, 7 * p.tau).c, p.dose / p.vc * (1 - Math.exp(-k * p.tau * 8)) / (1 - Math.exp(-k * p.tau)));
close(stateAt('distribution', { ...defaults.distribution, q: 0 }, 12).c, 10 * Math.exp(-6 / 15 * 12));
close(stateAt('distribution', defaults.distribution, 10000).auc, 150 / 6);
for (const hash of ['lab=evil', 'lab=distribution&code=abc', 'lab=distribution&cl=NaN', 'lab=distribution&cl=', 'lab=distribution&v=2', 'lab=distribution&dose=2&dose=3', 'lab=accumulation&count=1.5', 'lab=distribution&teacher=yes', 'lab=distribution&cl=Infinity']) assert.throws(() => decodeScenario(hash));
assert.equal(decodeScenario('lab=distribution&hide=1').hidden, false);
assert.throws(() => validateParameters('distribution', { patient: 1 }));
assert.throws(() => validateParameters('distribution', { dose: '100' }));
for (const lab of ['distribution', 'accumulation']) {
  for (const changes of [{}, { q: 0 }, { q: 50, vc: 5, vp: 5, cl: .1, end: 336, count: 20, loading: 4 }]) {
    const params = { ...defaults[lab], ...changes }, particles = particleJourneys(lab, params);
    assert.deepEqual(particleJourneys(lab, params), particles);
    assert.equal(new Set(particles.map(item => item.id)).size, particles.length);
    assert.ok(particles.length > 0 && particles.length <= 500);
    assert.ok(particles.reduce((n, item) => n + item.visits.length, 0) < 100000);
    for (const particle of particles) {
      assert.equal(particle.born, schedule(lab, params)[particle.dose].time);
      assert.equal(particleVisit(particle, particle.born - .0001), -1);
      for (const width of [288, 360, 700, 1240]) {
        const geometry = sceneLayout(width, lab);
        for (const time of [particle.born, particle.born + .1, params.end]) {
          const pos = particlePosition(particle, time, geometry);
          assert.ok(pos && Number.isFinite(pos.x) && Number.isFinite(pos.y));
          assert.ok(pos.x >= 0 && pos.x <= width && pos.y >= 0 && pos.y <= geometry.height);
          assert.deepEqual(particlePosition(particle, time, geometry), pos);
        }
      }
      for (let i = 1; i < particle.visits.length; i++) {
        const previous = particle.visits[i - 1], current = particle.visits[i];
        assert.ok(current.time > previous.time);
        assert.ok(previous.room === 'central' && ['peripheral', 'eliminated'].includes(current.room) || previous.room === 'peripheral' && current.room === 'central');
        if (lab === 'accumulation' || params.q === 0) assert.notEqual(current.room, 'peripheral');
        const geometry = sceneLayout(700, lab);
        const before = particlePosition(particle, current.time - 1e-8, geometry);
        const after = particlePosition(particle, current.time, geometry);
        assert.ok(Math.hypot(before.x - after.x, before.y - after.y) < .01, 'A particle must not teleport at a compartment boundary');
      }
    }
  }
}
if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify(fixtures));
console.log(`Laboratories: ${fixtures.length} scenarios, mass balance, dose jumps, analytical limits, share validation OK.`);
console.log('Particles: identity, dose timing, allowed paths, continuous transitions, deterministic seeking, bounded work and mobile geometry OK.');
