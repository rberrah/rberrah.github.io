<script>
  // Ensembles d'arbres sur une régression 1D : arbre unique, forêt aléatoire, boosting.
  // Illustre pourquoi un ARBRE fait des marches, pourquoi une FORÊT lisse en moyennant,
  // et pourquoi le BOOSTING affine séquentiellement en corrigeant les résidus.
  let mode = 'tree'; // 'tree' | 'forest' | 'boost'
  let knob = 3; // profondeur (tree) | nb arbres (forest) | nb itérations (boost)

  // ---- données synthétiques déterministes ----
  /** @param {number} a @returns {() => number} */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rnd = mulberry32(42);
  const N = 44;
  const trueF = (/** @type {number} */ x) => 6 * Math.sin(0.6 * x) + 0.35 * x + 6;
  /** @type {{x:number,y:number}[]} */
  const data = [];
  for (let i = 0; i < N; i++) {
    const x = (i / (N - 1)) * 10;
    data.push({ x, y: trueF(x) + (rnd() - 0.5) * 4.5 });
  }

  // ---- arbre de régression CART 1D ----
  /** @param {{x:number,y:number}[]} pts @returns {number} */
  function mean(pts) { let s = 0; for (const p of pts) s += p.y; return pts.length ? s / pts.length : 0; }
  /** @param {{x:number,y:number}[]} pts @returns {number} */
  function sse(pts) { const m = mean(pts); let s = 0; for (const p of pts) s += (p.y - m) ** 2; return s; }
  /** @param {{x:number,y:number}[]} pts @param {number} depth @returns {any} */
  function buildTree(pts, depth) {
    if (depth <= 0 || pts.length <= 3) return { leaf: true, val: mean(pts) };
    const sorted = [...pts].sort((a, b) => a.x - b.x);
    let best = /** @type {number|null} */ (null), bestErr = Infinity;
    for (let i = 1; i < sorted.length; i++) {
      const s = (sorted[i - 1].x + sorted[i].x) / 2;
      const L = sorted.slice(0, i), R = sorted.slice(i);
      const err = sse(L) + sse(R);
      if (err < bestErr) { bestErr = err; best = s; }
    }
    if (best === null) return { leaf: true, val: mean(pts) };
    const bs = best;
    return { leaf: false, split: bs, L: buildTree(pts.filter((p) => p.x < bs), depth - 1), R: buildTree(pts.filter((p) => p.x >= bs), depth - 1) };
  }
  /** @param {any} node @param {number} x @returns {number} */
  function predTree(node, x) { return node.leaf ? node.val : (x < node.split ? predTree(node.L, x) : predTree(node.R, x)); }
  /** @param {() => number} r @param {{x:number,y:number}[]} pts @returns {{x:number,y:number}[]} */
  function bootstrap(r, pts) { const out = []; for (let i = 0; i < pts.length; i++) out.push(pts[Math.floor(r() * pts.length)]); return out; }

  const GRID = 140;
  $: xs = Array.from({ length: GRID + 1 }, (_, i) => (i / GRID) * 10);

  $: fit = (() => {
    if (mode === 'tree') {
      const tree = buildTree(data, knob);
      return xs.map((x) => predTree(tree, x));
    }
    if (mode === 'forest') {
      const r = mulberry32(7);
      /** @type {any[]} */ const trees = [];
      for (let b = 0; b < knob; b++) trees.push(buildTree(bootstrap(r, data), 3));
      return xs.map((x) => trees.reduce((a, t) => a + predTree(t, x), 0) / knob);
    }
    // boosting : F0 = moyenne, puis on ajoute des petits arbres sur les résidus
    const lr = 0.3, base = mean(data);
    /** @type {any[]} */ const boosters = [];
    let F = data.map(() => base);
    for (let m = 0; m < knob; m++) {
      const resid = data.map((p, i) => ({ x: p.x, y: p.y - F[i] }));
      const t = buildTree(resid, 2);
      boosters.push(t);
      F = data.map((p, i) => F[i] + lr * predTree(t, p.x));
    }
    return xs.map((x) => base + boosters.reduce((a, t) => a + lr * predTree(t, x), 0));
  })();

  $: knobMax = mode === 'tree' ? 6 : 40;
  $: knobLabel = mode === 'tree' ? 'Profondeur' : mode === 'forest' ? 'Nombre d’arbres' : 'Itérations';
  /** @param {string} m */
  function setMode(m) { mode = m; knob = m === 'tree' ? 3 : 20; }

  const W = 480, H = 300, mrg = { top: 16, right: 14, bottom: 40, left: 40 };
  $: iW = W - mrg.left - mrg.right;
  $: iH = H - mrg.top - mrg.bottom;
  const yMin = 0, yMax = 20;
  $: xt = (/** @type {number} */ x) => (x / 10) * iW;
  $: yv = (/** @type {number} */ v) => iH - ((Math.max(yMin, Math.min(yMax, v)) - yMin) / (yMax - yMin)) * iH;
  $: pathFit = fit.map((v, i) => `${i ? 'L' : 'M'}${xt(xs[i]).toFixed(1)},${yv(v).toFixed(1)}`).join(' ');
  $: pathTrue = xs.map((x, i) => `${i ? 'L' : 'M'}${xt(x).toFixed(1)},${yv(trueF(x)).toFixed(1)}`).join(' ');
</script>

<div class="wrap">
  <div class="controls">
    <div class="modes">
      <button class:on={mode === 'tree'} on:click={() => setMode('tree')}>Arbre</button>
      <button class:on={mode === 'forest'} on:click={() => setMode('forest')}>Forêt</button>
      <button class:on={mode === 'boost'} on:click={() => setMode('boost')}>Boosting</button>
    </div>
    <label class="s"><span>{knobLabel}</span><strong>{knob}</strong><input type="range" min="1" max={knobMax} step="1" bind:value={knob} /></label>
    <div class="readout">
      {#if mode === 'tree'}<p>Un seul arbre : fonction <em>en marches</em>. Plus profond = plus de marches, mais on colle au bruit (surajustement).</p>
      {:else if mode === 'forest'}<p>Forêt : on <em>moyenne</em> beaucoup d'arbres (bootstrap). Le résultat se lisse et généralise mieux.</p>
      {:else}<p>Boosting : chaque petit arbre corrige les <em>résidus</em> du précédent. L'ajustement s'affine itération après itération.</p>{/if}
    </div>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label="Ajustement d'un ensemble d'arbres">
    <g transform={`translate(${mrg.left},${mrg.top})`}>
      <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      <path d={pathTrue} class="truth" />
      {#each data as p}<circle cx={xt(p.x)} cy={yv(p.y)} r="3" class="pt" />{/each}
      <path d={pathFit} class="fit" />
      <text x={iW / 2} y={iH + 32} class="lbl">Variable x</text>
      <text transform={`translate(-30,${iH / 2}) rotate(-90)`} class="lbl">Réponse y</text>
      <g class="legend" transform="translate(6,2)">
        <rect x="0" y="0" width="12" height="3" class="fit" /><text x="18" y="4" class="leg">Modèle</text>
        <rect x="0" y="14" width="12" height="3" class="truth" /><text x="18" y="18" class="leg">Vraie fonction</text>
      </g>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); }
  @media (min-width: 720px) { .wrap { grid-template-columns: 210px 1fr; align-items: center; } }
  .controls { display: grid; gap: var(--space-2); }
  .modes { display: flex; gap: var(--space-2); }
  .modes button, .s { font-family: var(--font-mono); }
  .modes button { flex: 1; font-size: var(--text-xs); padding: 4px 4px; border: 1px solid var(--border-strong); background: var(--bg-tertiary); border-radius: var(--radius); cursor: pointer; }
  .modes button.on { background: var(--accent-ai); color: #fff; border-color: var(--accent-ai); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--accent-ai); }
  .s input { grid-column: 1 / -1; }
  .readout { padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-size: var(--text-xs); }
  .readout p { margin: 0; color: var(--text-secondary); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .pt { fill: var(--text-muted); opacity: 0.7; }
  .fit { fill: none; stroke: var(--accent-ai); stroke-width: 2.6; }
  .truth { fill: none; stroke: var(--accent-pk); stroke-width: 1.4; stroke-dasharray: 4 4; opacity: 0.8; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 12px; text-anchor: middle; }
  .leg { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 10px; }
</style>
