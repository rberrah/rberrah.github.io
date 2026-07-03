<script>
  // Illustration conceptuelle d'un SVM linéaire : deux classes, un hyperplan séparateur
  // à MARGE MAXIMALE, et les vecteurs de support (points dans la marge). Le paramètre C
  // arbitre marge large (soft, tolérante) vs marge étroite (hard, peu tolérante).
  let C = 1; // régularisation : grand C = marge étroite

  /** @param {number} a @returns {() => number} */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  /** @param {() => number} r @returns {number} */
  function gauss(r) { return Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r()); }

  const rnd = mulberry32(11);
  const mPos = { x: 3.2, y: 6.8 }, mNeg = { x: 6.8, y: 3.2 }, sd = 1.05;
  /** @type {{x:number,y:number,c:number}[]} */
  const pts = [];
  for (let i = 0; i < 18; i++) pts.push({ x: mPos.x + gauss(rnd) * sd, y: mPos.y + gauss(rnd) * sd, c: 1 });
  for (let i = 0; i < 18; i++) pts.push({ x: mNeg.x + gauss(rnd) * sd, y: mNeg.y + gauss(rnd) * sd, c: -1 });

  // hyperplan : normal w = m+ − m−, passant par le milieu
  const w = { x: mPos.x - mNeg.x, y: mPos.y - mNeg.y };
  const mid = { x: (mPos.x + mNeg.x) / 2, y: (mPos.y + mNeg.y) / 2 };
  const wn = Math.hypot(w.x, w.y);
  /** @param {{x:number,y:number}} p @returns {number} */
  function sdist(p) { return (w.x * (p.x - mid.x) + w.y * (p.y - mid.y)) / wn; }

  $: marginHalf = Math.max(0.35, Math.min(2.4, 2.6 / (0.6 + C)));
  $: support = pts.filter((p) => Math.abs(sdist(p)) <= marginHalf);

  const W = 360, H = 320, mrg = { top: 14, right: 14, bottom: 34, left: 34 };
  $: iW = W - mrg.left - mrg.right;
  $: iH = H - mrg.top - mrg.bottom;
  $: sx = (/** @type {number} */ x) => (x / 10) * iW;
  $: sy = (/** @type {number} */ y) => iH - (y / 10) * iH;

  // ligne pour une distance signée d : w·(X−mid) = d·|w|
  /** @param {number} d @returns {string} */
  function lineFor(d) {
    /** @param {number} X @returns {number} */
    const Y = (X) => mid.y + (d * wn - w.x * (X - mid.x)) / w.y;
    return `M${sx(0).toFixed(1)},${sy(Y(0)).toFixed(1)} L${sx(10).toFixed(1)},${sy(Y(10)).toFixed(1)}`;
  }
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>Régularisation C</span><strong>{C.toFixed(1)}</strong><input type="range" min="0.2" max="8" step="0.2" bind:value={C} /></label>
    <div class="readout">
      <div><span>Type de marge</span><strong>{C >= 4 ? 'étroite (hard)' : C <= 1 ? 'large (soft)' : 'intermédiaire'}</strong></div>
      <div><span>Vecteurs de support</span><strong>{support.length}</strong></div>
    </div>
    <p class="hint">Le SVM cherche la frontière qui <em>maximise la marge</em>. Seuls les points de la marge (les <em>vecteurs de support</em>) la définissent. C petit → marge large et tolérante.</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label="Frontière SVM à marge maximale">
    <g transform={`translate(${mrg.left},${mrg.top})`}>
      <clipPath id="svmbox"><rect x="0" y="0" width={iW} height={iH} /></clipPath>
      <rect x="0" y="0" width={iW} height={iH} class="frame" />
      <g clip-path="url(#svmbox)">
        <path d={lineFor(marginHalf)} class="margin" />
        <path d={lineFor(-marginHalf)} class="margin" />
        <path d={lineFor(0)} class="boundary" />
      </g>
      {#each pts as p}
        <circle cx={sx(p.x)} cy={sy(p.y)} r={support.includes(p) ? 5 : 3.5}
          class:pos={p.c === 1} class:neg={p.c === -1} class:sv={support.includes(p)} />
      {/each}
      <text x={iW / 2} y={iH + 26} class="lbl">Covariable 1</text>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); }
  @media (min-width: 720px) { .wrap { grid-template-columns: 220px 1fr; align-items: center; } }
  .controls { display: grid; gap: var(--space-2); }
  .readout, .s { font-family: var(--font-mono); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--accent-ai); }
  .s input { grid-column: 1 / -1; }
  .readout { display: grid; gap: 3px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-size: var(--text-xs); }
  .readout div { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; max-width: 360px; }
  .frame { fill: none; stroke: var(--border-strong); stroke-width: 1; }
  .boundary { stroke: var(--accent-ai); stroke-width: 2.4; }
  .margin { stroke: var(--accent-ai); stroke-width: 1; stroke-dasharray: 4 4; opacity: 0.7; }
  .pos { fill: var(--accent-pk); }
  .neg { fill: var(--accent-pd); }
  .sv { stroke: var(--text-primary); stroke-width: 1.6; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; text-anchor: middle; }
</style>
