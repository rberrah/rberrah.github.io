<script>
  // Bootstrap : distribution d'un paramètre ré-estimé sur des jeux ré-échantillonnés.
  // Plus le jeu de données est grand, plus la distribution est étroite → RSE plus petit.
  let nData = 40; // taille du jeu de données (pilote la précision)

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

  const trueCL = 5; // L/h
  const B = 400; // ré-échantillons bootstrap
  /** @type {number[]} */
  const z = [];
  const rng = mulberry32(17);
  for (let i = 0; i < B; i++) z.push(gauss(rng));

  $: se = 1.6 / Math.sqrt(nData); // l'erreur type décroît en 1/√N
  $: est = z.map((g) => trueCL + se * g);
  $: sorted = [...est].sort((a, b) => a - b);
  $: mean = est.reduce((a, b) => a + b, 0) / B;
  $: lo = sorted[Math.floor(0.025 * B)];
  $: hi = sorted[Math.floor(0.975 * B)];
  $: rse = (se / trueCL) * 100;

  const nBins = 26, xLo = 2, xHi = 8;
  $: bins = (() => {
    const arr = new Array(nBins).fill(0);
    for (const e of est) {
      const idx = Math.floor(((e - xLo) / (xHi - xLo)) * nBins);
      if (idx >= 0 && idx < nBins) arr[idx]++;
    }
    return arr;
  })();
  $: bMax = Math.max(...bins, 1);

  const W = 480, H = 260, m = { top: 14, right: 14, bottom: 40, left: 40 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  $: bx = (/** @type {number} */ v) => ((v - xLo) / (xHi - xLo)) * iW;
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>Taille du jeu (N)</span><strong>{nData}</strong><input type="range" min="10" max="200" step="5" bind:value={nData} /></label>
    <div class="readout">
      <div><span>Estimation (moy.)</span><strong>{mean.toFixed(2)} L/h</strong></div>
      <div><span>IC 95 %</span><strong>{lo.toFixed(2)}–{hi.toFixed(2)}</strong></div>
      <div><span>RSE</span><strong>{rse.toFixed(1)} %</strong></div>
    </div>
    <p class="hint">Chaque barre = une ré-estimation sur un jeu ré-échantillonné. Plus N est grand, plus la distribution se resserre : l'IC 95 % et le RSE diminuent.</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label="Distribution bootstrap d'un paramètre">
    <g transform={`translate(${m.left},${m.top})`}>
      <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      {#each bins as b, i}
        <rect x={(i / nBins) * iW + 1} y={iH - (b / bMax) * iH} width={iW / nBins - 2} height={(b / bMax) * iH} class="bar" />
      {/each}
      <line x1={bx(trueCL)} x2={bx(trueCL)} y1="0" y2={iH} class="truth" />
      <text x={bx(trueCL)} y="10" class="truthlbl">vraie valeur</text>
      <line x1={bx(lo)} x2={bx(lo)} y1="0" y2={iH} class="ci" />
      <line x1={bx(hi)} x2={bx(hi)} y1="0" y2={iH} class="ci" />
      <text x={iW / 2} y={iH + 32} class="lbl">Clairance estimée (L/h)</text>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); --valid: #8a7d3a; }
  @media (min-width: 720px) { .wrap { grid-template-columns: 215px 1fr; align-items: center; } }
  .controls { display: grid; gap: var(--space-2); }
  .readout, .s { font-family: var(--font-mono); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--valid); }
  .s input { grid-column: 1 / -1; }
  .readout { display: grid; gap: 3px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-size: var(--text-xs); }
  .readout div { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .bar { fill: var(--valid); opacity: 0.55; }
  .truth { stroke: var(--text-primary); stroke-width: 1.6; }
  .truthlbl { fill: var(--text-primary); font-family: var(--font-mono); font-size: 9px; text-anchor: middle; }
  .ci { stroke: var(--accent-pk); stroke-width: 1.4; stroke-dasharray: 3 3; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; text-anchor: middle; }
</style>
