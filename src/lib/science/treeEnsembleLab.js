// Predictive ensemble lab: fixed, reproducible, fully synthetic one-dimensional data.
// No real patient data and no clinical validation. The holdout is never used to fit.

/** @param {number} x */
export const trueResponse = (x) => 6 * Math.sin(0.6 * x) + 0.35 * x + 6;

/** @param {number} seed */
function seededRandom(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Independent fixed random draws and nonoverlapping x coordinates. */
export function makeEnsembleLabData() {
  const trainRng = seededRandom(42);
  const testRng = seededRandom(31415);
  const train = Array.from({ length: 44 }, (_, i) => {
    const x = i / 43 * 10;
    return { x, y: trueResponse(x) + (trainRng() - 0.5) * 4.5 };
  });
  const test = Array.from({ length: 16 }, (_, i) => {
    const x = (i + 0.43) / 16 * 10;
    return { x, y: trueResponse(x) + (testRng() - 0.5) * 4.5 };
  });
  return { train, test };
}

/** @param {{x:number,y:number}[]} rows */
function mean(rows) {
  return rows.reduce((acc, row) => acc + row.y, 0) / rows.length;
}

/** @param {{x:number,y:number}[]} rows */
function sse(rows) {
  const mu = mean(rows);
  return rows.reduce((acc, row) => acc + (row.y - mu) ** 2, 0);
}

/** Actual one-dimensional CART least-squares splits (no duplicate split thresholds). 
 * @param {{x:number,y:number}[]} rows
 * @param {number} depth
 * @returns {any}
 */
export function buildRegressionTree(rows, depth) {
  if (!rows.length) throw new Error('CART requires nonempty training data');
  if (depth <= 0 || rows.length <= 3) return { leaf: true, value: mean(rows) };
  const sorted = [...rows].sort((a, b) => a.x - b.x);
  let bestIndex = -1, bestError = Infinity;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i - 1].x === sorted[i].x) continue;
    const error = sse(sorted.slice(0, i)) + sse(sorted.slice(i));
    if (error < bestError) { bestError = error; bestIndex = i; }
  }
  if (bestIndex < 0) return { leaf: true, value: mean(rows) };
  const split = (sorted[bestIndex - 1].x + sorted[bestIndex].x) / 2;
  return {
    leaf: false, split,
    left: buildRegressionTree(sorted.slice(0, bestIndex), depth - 1),
    right: buildRegressionTree(sorted.slice(bestIndex), depth - 1)
  };
}

/** @param {any} tree @param {number} x */
export function predictTree(tree, x) {
  if (tree.leaf) return tree.value;
  return predictTree(x < tree.split ? tree.left : tree.right, x);
}

/** @param {() => number} random @param {{x:number,y:number}[]} rows */
function bootstrap(random, rows) {
  return rows.map(() => rows[Math.floor(random() * rows.length)]);
}

/** All model fitting uses only train, never the holdout points.
 * "forest" is 1D bagging, not a feature-subsampled multidimensional random forest.
 * "boost" fits regression trees to negative gradients of squared-error loss (residuals).
 * @param {'tree'|'forest'|'boost'} mode
 * @param {number} complexity
 * @param {{x:number,y:number}[]} train
 */
export function fitEnsembleLab(mode, complexity, train) {
  if (!train.length) throw new Error('Training set cannot be empty');
  const n = Math.max(1, Math.min(40, Math.round(complexity)));
  if (mode === 'tree') {
    const tree = buildRegressionTree(train, Math.min(6, n));
    return { predict: (/** @type {number} */ x) => predictTree(tree, x) };
  }
  if (mode === 'forest') {
    const random = seededRandom(7);
    const trees = Array.from({ length: n }, () => buildRegressionTree(bootstrap(random, train), 3));
    return { predict: (/** @type {number} */ x) =>
      trees.reduce((acc, tree) => acc + predictTree(tree, x), 0) / trees.length };
  }
  if (mode !== 'boost') throw new Error('Unknown ensemble mode');
  const rate = 0.3;
  const baseline = mean(train);
  /** @type {any[]} */
  const trees = [];
  let current = train.map(() => baseline);
  for (let i = 0; i < n; i++) {
    const residuals = train.map((row, j) => ({ x: row.x, y: row.y - current[j] }));
    const tree = buildRegressionTree(residuals, 2);
    trees.push(tree);
    current = train.map((row, j) => current[j] + rate * predictTree(tree, row.x));
  }
  return { predict: (/** @type {number} */ x) =>
    baseline + trees.reduce((acc, tree) => acc + rate * predictTree(tree, x), 0) };
}

/** @param {{predict:(x:number)=>number}} model @param {{x:number,y:number}[]} rows */
export function ensembleRmse(model, rows) {
  if (!rows.length) throw new Error('RMSE requires nonempty data');
  return Math.sqrt(rows.reduce((acc, row) => acc + (model.predict(row.x) - row.y) ** 2, 0) / rows.length);
}
