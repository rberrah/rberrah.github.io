<script>
  // Découvrir des sous-groupes : paramètres individuels (CL, V) de patients de 3 types de
  // cancer. Mode « Vrai type » (couleur = type) vs « Clusters » (k-means non supervisé).
  // Quand la clairance dépend du type de cancer, le clustering retrouve les groupes.
  let mode = 'true'; // 'true' | 'kmeans'
  let sep = 1; // séparation des groupes (0 = confondus, 1.5 = très distincts)
  let k = 3; // nombre de clusters k-means

  const groups = [
    { name: 'Poumon', color: '#b0392b' },
    { name: 'Sein', color: '#2a4b7c' },
    { name: 'Côlon', color: '#4a7d3a' }
  ];
  const kColors = ['#b0392b', '#2a4b7c', '#4a7d3a', '#a06a2c'];

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

  // bruit fixe par patient ; la position en CL dépend de `sep` (réactif)
  /** @type {{gi:number, nzc:number, nzv:number}[]} */
  const base = [];
  const rng = mulberry32(7);
  for (let gi = 0; gi < 3; gi++) for (let i = 0; i < 22; i++) base.push({ gi, nzc: gauss(rng), nzv: gauss(rng) });

  $: pts = base.map((p) => ({
    gi: p.gi,
    cl: 0.16 + (p.gi - 1) * 0.055 * sep + p.nzc * 0.017,
    v: 8 + p.nzv * 1.6
  }));

  // k-means sur coordonnées standardisées (CL et V ont des échelles différentes)
  $: km = (() => {
    const xs = pts.map((p) => p.cl), ys = pts.map((p) => p.v);
    const mx = xs.reduce((a, b) => a + b, 0) / xs.length, my = ys.reduce((a, b) => a + b, 0) / ys.length;
    const sx = Math.sqrt(xs.reduce((a, b) => a + (b - mx) ** 2, 0) / xs.length) || 1;
    const sy = Math.sqrt(ys.reduce((a, b) => a + (b - my) ** 2, 0) / ys.length) || 1;
    const Z = pts.map((p) => [(p.cl - mx) / sx, (p.v - my) / sy]);
    const r = mulberry32(99);
    let cen = Array.from({ length: k }, () => Z[Math.floor(r() * Z.length)].slice());
    const asg = new Array(Z.length).fill(0);
    for (let it = 0; it < 15; it++) {
      for (let i = 0; i < Z.length; i++) {
        let best = 0, bd = Infinity;
        for (let c = 0; c < k; c++) { const d = (Z[i][0] - cen[c][0]) ** 2 + (Z[i][1] - cen[c][1]) ** 2; if (d < bd) { bd = d; best = c; } }
        asg[i] = best;
      }
      const sum = Array.from({ length: k }, () => [0, 0, 0]);
      for (let i = 0; i < Z.length; i++) { sum[asg[i]][0] += Z[i][0]; sum[asg[i]][1] += Z[i][1]; sum[asg[i]][2]++; }
      cen = sum.map((s, c) => (s[2] ? [s[0] / s[2], s[1] / s[2]] : cen[c]));
    }
    return asg;
  })();

  // moyennes de CL par vrai groupe (pour le readout)
  $: means = groups.map((g, gi) => {
    const sub = pts.filter((p) => p.gi === gi);
    return { name: g.name, color: g.color, cl: sub.reduce((a, p) => a + p.cl, 0) / sub.length };
  });

  const W = 480, H = 300, m = { top: 14, right: 14, bottom: 40, left: 46 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  const xLo = 0.02, xHi = 0.32, yLo = 3, yHi = 14;
  $: sx = (/** @type {number} */ x) => ((x - xLo) / (xHi - xLo)) * iW;
  $: sy = (/** @type {number} */ y) => iH - ((y - yLo) / (yHi - yLo)) * iH;
</script>

<div class="wrap">
  <div class="controls">
    <div class="modes">
      <button class:on={mode === 'true'} on:click={() => (mode = 'true')}>Vrai type</button>
      <button class:on={mode === 'kmeans'} on:click={() => (mode = 'kmeans')}>Clusters (k-means)</button>
    </div>
    <label class="s"><span>Séparation</span><strong>{sep.toFixed(1)}</strong><input type="range" min="0" max="1.6" step="0.1" bind:value={sep} /></label>
    {#if mode === 'kmeans'}<label class="s"><span>Clusters k</span><strong>{k}</strong><input type="range" min="2" max="4" step="1" bind:value={k} /></label>{/if}
    <div class="readout">
      {#if mode === 'true'}
        {#each means as g}<div class="line"><span class="dot" style={`background:${g.color}`}></span>{g.name}<strong>CL {g.cl.toFixed(2)} L/h</strong></div>{/each}
      {:else}
        <div class="km">k-means regroupe sans connaître le type. Comparez au « Vrai type » : quand la séparation est forte, les clusters retrouvent les cancers.</div>
      {/if}
    </div>
    <p class="hint">Chaque point = un patient (ses paramètres individuels estimés). Baissez la séparation : les groupes se confondent et le clustering échoue.</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label="Clustering des paramètres individuels par type de cancer">
    <g transform={`translate(${m.left},${m.top})`}>
      <rect x="0" y="0" width={iW} height={iH} class="frame" />
      {#each pts as p, i}
        <circle cx={sx(p.cl)} cy={sy(p.v)} r="4" style={`fill:${mode === 'true' ? groups[p.gi].color : kColors[km[i]]}`} class="pt" />
      {/each}
      <text x={iW / 2} y={iH + 30} class="lbl">Clairance CL (L/h)</text>
      <text transform={`translate(-32,${iH / 2}) rotate(-90)`} class="lbl">Volume V (L)</text>
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
  .modes { display: flex; gap: var(--space-2); }
  .modes button, .readout, .s { font-family: var(--font-mono); }
  .modes button { flex: 1; font-size: 10px; padding: 4px 4px; border: 1px solid var(--border-strong); background: var(--bg-tertiary); border-radius: var(--radius); cursor: pointer; }
  .modes button.on { background: var(--accent-ai); color: var(--bg-tertiary); border-color: var(--accent-ai); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--accent-ai); }
  .s input { grid-column: 1 / -1; }
  .readout { display: grid; gap: 4px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-size: var(--text-xs); }
  .line { display: flex; align-items: center; gap: 6px; color: var(--text-secondary); }
  .line strong { margin-left: auto; color: var(--text-primary); }
  .dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
  .km { color: var(--text-secondary); line-height: 1.5; }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .frame { fill: none; stroke: var(--border-strong); stroke-width: 1; }
  .pt { opacity: 0.8; stroke: var(--bg-tertiary); stroke-width: 0.5; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; text-anchor: middle; }
</style>
