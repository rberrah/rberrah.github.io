<script>
  // Random Matrix Theory : spectre des valeurs propres d'une matrice de corrélation de
  // paramètres individuels. Sous l'hypothèse « pur bruit », les valeurs propres suivent la
  // loi de Marchenko-Pastur, bornée par λ± = (1 ± √(p/n))². Les vraies corrélations
  // (facteurs) produisent des valeurs propres AU-DESSUS de λ+ : c'est le signal.
  let kfac = 3; // nombre de vrais facteurs injectés
  let n = 90; // nombre de patients (échantillons)
  const p = 20; // nombre de paramètres

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

  /** @param {number[][]} M @param {number} nn @returns {number[]} */
  function jacobi(M, nn) {
    const a = M.map((r) => r.slice());
    for (let sweep = 0; sweep < 40; sweep++) {
      let off = 0;
      for (let i = 0; i < nn; i++) for (let j = i + 1; j < nn; j++) off += a[i][j] * a[i][j];
      if (off < 1e-10) break;
      for (let pp = 0; pp < nn; pp++) for (let qq = pp + 1; qq < nn; qq++) {
        if (Math.abs(a[pp][qq]) < 1e-14) continue;
        const th = (a[qq][qq] - a[pp][pp]) / (2 * a[pp][qq]);
        const t = (th >= 0 ? 1 : -1) / (Math.abs(th) + Math.sqrt(th * th + 1));
        const c = 1 / Math.sqrt(t * t + 1), s = t * c;
        for (let i = 0; i < nn; i++) { const aip = a[i][pp], aiq = a[i][qq]; a[i][pp] = c * aip - s * aiq; a[i][qq] = s * aip + c * aiq; }
        for (let i = 0; i < nn; i++) { const api = a[pp][i], aqi = a[qq][i]; a[pp][i] = c * api - s * aqi; a[qq][i] = s * api + c * aqi; }
      }
    }
    const ev = []; for (let i = 0; i < nn; i++) ev.push(a[i][i]);
    return ev;
  }

  $: ev = (() => {
    const rng = mulberry32(2024);
    /** @type {number[][]} */ const X = [];
    for (let i = 0; i < n; i++) {
      const f = []; for (let b = 0; b < kfac; b++) f.push(gauss(rng));
      const row = new Array(p);
      for (let j = 0; j < p; j++) {
        const b = Math.floor(j / 4);
        if (b < kfac) { const L = 0.6; row[j] = Math.sqrt(L) * f[b] + Math.sqrt(1 - L) * gauss(rng); }
        else row[j] = gauss(rng);
      }
      X.push(row);
    }
    for (let j = 0; j < p; j++) {
      let mean = 0; for (let i = 0; i < n; i++) mean += X[i][j]; mean /= n;
      let sd = 0; for (let i = 0; i < n; i++) sd += (X[i][j] - mean) ** 2; sd = Math.sqrt(sd / n) || 1;
      for (let i = 0; i < n; i++) X[i][j] = (X[i][j] - mean) / sd;
    }
    const C = Array.from({ length: p }, () => new Array(p).fill(0));
    for (let a = 0; a < p; a++) for (let b = a; b < p; b++) { let s = 0; for (let i = 0; i < n; i++) s += X[i][a] * X[i][b]; C[a][b] = C[b][a] = s / n; }
    return jacobi(C, p).sort((a, b) => a - b);
  })();

  $: q = p / n;
  $: lamP = (1 + Math.sqrt(q)) ** 2;
  $: lamM = Math.max(0, (1 - Math.sqrt(q)) ** 2);
  $: signal = ev.filter((e) => e > lamP + 1e-6).length;

  const nBins = 22;
  const W = 480, H = 300, m = { top: 16, right: 14, bottom: 40, left: 40 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  $: xMax = Math.max(lamP * 1.15, ev[ev.length - 1] * 1.05, 3);
  $: bins = (() => {
    const arr = new Array(nBins).fill(0);
    for (const e of ev) { const idx = Math.floor((e / xMax) * nBins); if (idx >= 0 && idx < nBins) arr[idx]++; }
    return arr;
  })();
  $: binW = xMax / nBins;
  /** @param {number} x @returns {number} */
  const mp = (x) => (x > lamM && x < lamP ? Math.sqrt((lamP - x) * (x - lamM)) / (2 * Math.PI * q * x) : 0);
  $: mpCounts = Array.from({ length: 121 }, (_, i) => (i / 120) * xMax).map((x) => p * mp(x) * binW);
  $: yMax = Math.max(...bins, ...mpCounts, 1) * 1.1;
  $: bx = (/** @type {number} */ x) => (x / xMax) * iW;
  $: by = (/** @type {number} */ c) => iH - (c / yMax) * iH;
  $: mpPath = Array.from({ length: 121 }, (_, i) => (i / 120) * xMax)
    .map((x, i) => `${i ? 'L' : 'M'}${bx(x).toFixed(1)},${by(p * mp(x) * binW).toFixed(1)}`)
    .join(' ');
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>Vrais facteurs</span><strong>{kfac}</strong><input type="range" min="0" max="5" step="1" bind:value={kfac} /></label>
    <label class="s"><span>Patients n</span><strong>{n}</strong><input type="range" min="30" max="180" step="10" bind:value={n} /></label>
    <div class="readout">
      <div><span>p / n (q)</span><strong>{q.toFixed(2)}</strong></div>
      <div><span>Seuil bruit λ₊</span><strong>{lamP.toFixed(2)}</strong></div>
      <div class="verdict" class:ok={signal === kfac}>{signal} valeur(s) &gt; λ₊ (signal) · {kfac} injecté(s)</div>
    </div>
    <p class="hint">Les valeurs propres sous λ₊ sont du <em>bruit</em> (loi de Marchenko-Pastur, courbe). Celles qui dépassent λ₊ sont de <em>vraies</em> corrélations. Plus de patients (n) resserre le bruit et fait ressortir le signal.</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label="Spectre des valeurs propres vs Marchenko-Pastur">
    <g transform={`translate(${m.left},${m.top})`}>
      <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      {#each bins as b, i}
        {@const xc = (i + 0.5) * binW}
        <rect x={bx(i * binW) + 1} y={by(b)} width={iW / nBins - 2} height={iH - by(b)} class:sig={xc > lamP} class="bar" />
      {/each}
      <path d={mpPath} class="mp" />
      <line x1={bx(lamP)} x2={bx(lamP)} y1="0" y2={iH} class="edge" />
      <text x={bx(lamP)} y="10" class="edgelbl">λ₊</text>
      <text x={iW / 2} y={iH + 32} class="lbl">Valeur propre</text>
      <text transform={`translate(-26,${iH / 2}) rotate(-90)`} class="lbl">Effectif</text>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); }
  @media (min-width: 720px) { .wrap { grid-template-columns: 220px 1fr; align-items: center; } }
  /* Le panneau de chapitre fait ~610 px meme sur grand ecran : on interroge le CONTENEUR,
     pas la fenetre, sinon les controles ecrasent la figure. */
  @container (max-width: 700px) { .wrap { grid-template-columns: 1fr; align-items: stretch; } }
  .controls { display: grid; gap: var(--space-2); }
  .readout, .s { font-family: var(--font-mono); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--accent-ai); }
  .s input { grid-column: 1 / -1; }
  .readout { display: grid; gap: 3px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-size: var(--text-xs); }
  .readout div:not(.verdict) { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
  .verdict { margin-top: 2px; padding: 3px 6px; border-radius: var(--radius); text-align: center; font-weight: 600; background: var(--bg-tertiary); color: var(--text-secondary); }
  .verdict.ok { background: var(--quiz-success-bg); color: var(--quiz-success-text); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .bar { fill: var(--text-muted); opacity: 0.5; }
  .bar.sig { fill: var(--accent-ai); opacity: 0.85; }
  .mp { fill: none; stroke: var(--accent-pk); stroke-width: 2.2; }
  .edge { stroke: var(--accent-pk); stroke-width: 1.4; stroke-dasharray: 3 3; }
  .edgelbl { fill: var(--accent-pk); font-family: var(--font-mono); font-size: 10px; text-anchor: middle; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; text-anchor: middle; }
</style>
