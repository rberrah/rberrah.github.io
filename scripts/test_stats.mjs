import assert from 'node:assert/strict';
import {
  welchT, mannWhitney, pairedT, welchAnova, kruskalWallis,
  pearson, fisherExact2x2, describe
} from '../portal/stats/engine.js';

const near = (actual, expected, tolerance, label) => {
  assert.ok(Number.isFinite(actual), `${label}: expected a finite number, got ${actual}`);
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} != ${expected} within ${tolerance}`);
};

const control = [11.2, 10.8, 12.1, 9.9, 11.5, 10.4];
const treatment = [8.2, 9.1, 7.8, 8.7, 9.4, 8.5];
const welch = welchT(control, treatment);
near(welch.t, 5.906421348734698, 1e-9, 'Welch t statistic');
near(welch.p, 0.00020657150377175823, 2e-8, 'Welch p-value');
near(welch.df, 9.220994292149227, 1e-9, 'Welch df');

const mw = mannWhitney(control, treatment);
near(mw.U, 0, 1e-12, 'Mann-Whitney U');
near(mw.p, 0.005074868097940253, 5e-5, 'Mann-Whitney asymptotic p-value');

const before = [18.2, 16.9, 20.1, 17.5, 19.3, 15.8, 21.0, 18.7];
const after = [15.1, 15.7, 17.4, 16.2, 16.8, 14.9, 18.3, 16.5];
const paired = pairedT(before, after);
near(paired.t, 7.106003655931736, 1e-9, 'Paired t statistic');
near(paired.p, 0.0001926439879564317, 2e-8, 'Paired p-value');

const groups = [
  { name: 'A', values: [10.1, 11.2, 9.8, 10.7] },
  { name: 'B', values: [12.9, 13.5, 11.8, 14.1] },
  { name: 'C', values: [16.0, 15.2, 17.1, 16.4] }
];
const wa = welchAnova(groups);
near(wa.F, 57.976306631147644, 1e-8, 'Welch ANOVA F');
near(wa.p, 0.00014546223071036424, 2e-8, 'Welch ANOVA p-value');
const kw = kruskalWallis(groups);
near(kw.H, 9.846153846153847, 1e-10, 'Kruskal-Wallis H');
near(kw.p, 0.007276706499332492, 2e-8, 'Kruskal-Wallis p-value');

const x = [1,2,3,4,5,6,7,8,9,10];
const y = [2.2,2.8,4.1,4.8,6.2,6.5,8.1,8.6,10.1,10.7];
const pr = pearson(x,y);
near(pr.r, 0.9965373827758134, 1e-12, 'Pearson r');
near(pr.p, 6.263113706458101e-10, 2e-9, 'Pearson p-value');

const fisher = fisherExact2x2([[1,9],[11,3]]);
near(fisher.odds_ratio, 0.030303030303030304, 1e-12, 'Fisher odds ratio');
near(fisher.p, 0.0027594561852200836, 1e-12, 'Fisher exact p-value');

const d = describe([12.1,10.8,11.4,13.2,9.9,12.5,11.7,10.6]);
assert.equal(d.n, 8);
near(d.mean, 11.525, 1e-12, 'Descriptive mean');

console.log('Stats engine: reference vectors PASS');
