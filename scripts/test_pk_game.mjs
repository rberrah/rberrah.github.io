import assert from 'node:assert/strict';
import { simulateGame } from '../src/lib/sim/game.js';

const one = simulateGame({ compartments: 1, route: 'iv', dose: 100, cl: 5, vc: 20 });
assert.ok(Math.abs(one[0].concentration - 5) < 1e-10);
assert.ok(Math.abs(one.at(-1).concentration - 5 * Math.exp(-0.25 * 24)) < 0.005);
for (const n of [1, 2, 3]) {
  for (const route of ['iv', 'oral']) {
    const dose = 100, f = 0.8;
    const rows = simulateGame({ compartments: n, route, dose, f });
    assert.ok(rows.length > 100 && rows.every(x =>
      [x.depot, x.central, x.p1, x.p2, x.eliminated, x.concentration].every(Number.isFinite)));
    for (const row of rows.filter((_, index) => index % 31 === 0)) {
      assert.ok(Math.abs(row.depot + row.central + row.p1 + row.p2 + row.eliminated -
        dose * (route === 'oral' ? f : 1)) < 0.01, 'Mass balance');
    }
  }
}
assert.throws(() => simulateGame({ dose: -5 }), /Invalid/);
console.log('PMx game PK numerical tests passed.');
