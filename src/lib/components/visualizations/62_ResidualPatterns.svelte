<script>
  // Galerie de motifs de résidus (CWRES vs prédictions) : à chaque forme, une cause et un
  // remède. Aléatoire (bon), U / U inversé (biais structural), trompette (mauvaise erreur),
  // pente (biais systématique). Pédagogie : « lire la forme → améliorer le modèle ».
  /** @type {'good'|'u'|'invu'|'trumpet'|'trend'} */
  let mode = 'u';

  const modes = {
    good: { label: 'Aléatoire', interp: 'Résidus neutres, centrés sur 0.', fix: 'Modèle adéquat — rien à changer.' },
    u: { label: 'U', interp: 'Biais courbe : sous-prédit aux extrêmes.', fix: 'Structure : ajouter un compartiment, revoir l’absorption/élimination.' },
    invu: { label: 'U inversé', interp: 'Biais courbe opposé : sur-prédit aux extrêmes.', fix: 'Revoir le modèle structural (forme mal décrite).' },
    trumpet: { label: 'Trompette', interp: 'Variance qui croît avec la prédiction.', fix: 'Modèle d’erreur : additive → proportionnelle/combinée.' },
    trend: { label: 'Pente', interp: 'Biais systématique (dérive avec la prédiction).', fix: 'Covariable manquante ou structure inadaptée.' }
  };
  $: cur = modes[mode];

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

  const N = 90;
  /** @type {{xn:number,g:number}[]} */
  const base = [];
  const rng = mulberry32(5);
  for (let i = 0; i < N; i++) base.push({ xn: rng(), g: gauss(rng) });

  /** @param {{xn:number,g:number}} p @param {string} md @returns {number} */
  function resid(p, md) {
    const u2 = Math.pow(p.xn - 0.5, 2) * 4; // 0 au milieu, 1 aux bords
    if (md === 'good') return p.g;
    if (md === 'u') return 2.4 * (u2 - 0.35) + 0.5 * p.g;
    if (md === 'invu') return -2.4 * (u2 - 0.35) + 0.5 * p.g;
    if (md === 'trumpet') return p.g * (0.4 + 1.9 * p.xn);
    return -1.8 + 3.6 * p.xn + 0.5 * p.g; // trend
  }
  $: pts = base.map((p) => ({ xn: p.xn, r: Math.max(-4.2, Math.min(4.2, resid(p, mode))) }));

  const W = 480, H = 300, m = { top: 14, right: 14, bottom: 40, left: 40 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  const rMax = 4.5;
  $: px = (/** @type {number} */ xn) => xn * iW;
  $: py = (/** @type {number} */ r) => iH / 2 - (r / rMax) * (iH / 2);
</script>

<div class="wrap">
  <div class="controls">
    <div class="modes">
      <button class:on={mode === 'good'} on:click={() => (mode = 'good')}>Aléatoire</button>
      <button class:on={mode === 'u'} on:click={() => (mode = 'u')}>U</button>
      <button class:on={mode === 'invu'} on:click={() => (mode = 'invu')}>U inversé</button>
      <button class:on={mode === 'trumpet'} on:click={() => (mode = 'trumpet')}>Trompette</button>
      <button class:on={mode === 'trend'} on:click={() => (mode = 'trend')}>Pente</button>
    </div>
    <div class="readout" class:ok={mode === 'good'}>
      <div class="motif">{cur.label}</div>
      <div class="line"><span>Interprétation</span>{cur.interp}</div>
      <div class="line"><span>Remède</span>{cur.fix}</div>
    </div>
    <p class="hint">La <em>forme</em> du nuage de résidus révèle le défaut. Comparez « Aléatoire » (bon) aux motifs biaisés.</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label="Motifs de résidus">
    <g transform={`translate(${m.left},${m.top})`}>
      <rect x="0" y="0" width={iW} height={iH} class="frame" />
      <line x1="0" x2={iW} y1={py(2)} y2={py(2)} class="band" />
      <line x1="0" x2={iW} y1={py(-2)} y2={py(-2)} class="band" />
      <line x1="0" x2={iW} y1={py(0)} y2={py(0)} class="zero" />
      {#each pts as p}<circle cx={px(p.xn)} cy={py(p.r)} r="3" class="pt" class:bad={Math.abs(p.r) > 2 && mode !== 'good'} />{/each}
      <text x={iW / 2} y={iH + 30} class="lbl">Prédictions</text>
      <text transform={`translate(-28,${iH / 2}) rotate(-90)`} class="lbl">CWRES</text>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); --valid: #8a7d3a; }
  @media (min-width: 720px) { .wrap { grid-template-columns: 220px 1fr; align-items: center; } }
  .controls { display: grid; gap: var(--space-2); }
  .modes { display: flex; flex-wrap: wrap; gap: var(--space-2); }
  .modes button { font-family: var(--font-mono); font-size: 10px; padding: 4px 6px; border: 1px solid var(--border-strong); background: var(--bg-tertiary); border-radius: var(--radius); cursor: pointer; }
  .modes button.on { background: var(--valid); color: #fff; border-color: var(--valid); }
  .readout { padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-size: var(--text-xs); display: grid; gap: 4px; border-left: 3px solid var(--accent-pk); }
  .readout.ok { border-left-color: var(--accent-pd); }
  .motif { font-family: var(--font-mono); font-weight: 700; color: var(--text-primary); }
  .line { color: var(--text-secondary); line-height: 1.4; }
  .line span { display: block; font-family: var(--font-mono); font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .frame { fill: none; stroke: var(--border-strong); stroke-width: 1; }
  .zero { stroke: var(--valid); stroke-width: 1.4; }
  .band { stroke: var(--border-subtle); stroke-width: 1; stroke-dasharray: 3 3; }
  .pt { fill: var(--text-secondary); opacity: 0.6; }
  .pt.bad { fill: #b0392b; opacity: 0.85; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; text-anchor: middle; }
</style>
