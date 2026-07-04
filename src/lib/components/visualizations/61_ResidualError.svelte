<script>
  // Modèle d'erreur résiduelle illustré sur les VRAIES données Warfarin.
  // Autour de la courbe du modèle, on trace une bande à ±1,96·SD (≈ 95 %) dont la forme
  // dépend du modèle d'erreur :  additive (largeur constante), proportionnelle (∝ prédiction),
  // combinée (plancher + pourcentage). On lit le % de points réels tombant dans la bande.
  import { warfarinPK } from '$lib/content/warfarinData';

  /** @type {'add'|'prop'|'comb'} */
  let mode = 'comb';
  let level = 1; // amplitude relative de l'erreur

  // modèle typique fixe (l'objet ici est le MODÈLE D'ERREUR, pas l'ajustement structural)
  const ka = 0.9, cl = 0.135, v = 8, tlag = 0.8, D = 100;
  /** @param {number} t @returns {number} */
  function conc(t) {
    const ke = cl / v, tau = t - tlag;
    if (tau <= 0) return 0;
    return (D * ka) / (v * (ka - ke)) * (Math.exp(-ke * tau) - Math.exp(-ka * tau));
  }
  const a0 = 0.6, b0 = 0.12; // erreur additive de base (mg/L) et proportionnelle de base
  /** @param {number} pred @param {'add'|'prop'|'comb'} md @param {number} lv @returns {number} */
  function sd(pred, md, lv) {
    const a = a0 * lv, b = b0 * lv;
    if (md === 'add') return a;
    if (md === 'prop') return b * pred;
    return Math.sqrt(a * a + (b * pred) * (b * pred));
  }

  $: inBand = warfarinPK.filter((p) => Math.abs(p[2] - conc(p[1])) <= 1.96 * sd(conc(p[1]), mode, level)).length;
  $: pct = (inBand / warfarinPK.length) * 100;

  const W = 480, H = 300, m = { top: 16, right: 14, bottom: 40, left: 44 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  const tMax = 126, cMax = 18;
  $: xt = (/** @type {number} */ t) => (t / tMax) * iW;
  $: yc = (/** @type {number} */ c) => iH - (Math.max(0, Math.min(c, cMax)) / cMax) * iH;

  $: grid = Array.from({ length: 127 }, (_, i) => i);
  $: curve = grid.map((t, i) => `${i ? 'L' : 'M'}${xt(t).toFixed(1)},${yc(conc(t)).toFixed(1)}`).join(' ');
  $: band = (() => {
    const up = grid.map((t) => ({ t, y: conc(t) + 1.96 * sd(conc(t), mode, level) }));
    const lo = grid.map((t) => ({ t, y: Math.max(0, conc(t) - 1.96 * sd(conc(t), mode, level)) }));
    const top = up.map((p, i) => `${i ? 'L' : 'M'}${xt(p.t).toFixed(1)},${yc(p.y).toFixed(1)}`).join(' ');
    const bot = lo.slice().reverse().map((p) => `L${xt(p.t).toFixed(1)},${yc(p.y).toFixed(1)}`).join(' ');
    return `${top} ${bot} Z`;
  })();
  $: pts = warfarinPK.map((p) => ({ px: xt(p[1]), py: yc(p[2]), in: Math.abs(p[2] - conc(p[1])) <= 1.96 * sd(conc(p[1]), mode, level) }));
</script>

<div class="wrap">
  <div class="controls">
    <div class="modes">
      <button class:on={mode === 'add'} on:click={() => (mode = 'add')}>Additive</button>
      <button class:on={mode === 'prop'} on:click={() => (mode = 'prop')}>Proportionnelle</button>
      <button class:on={mode === 'comb'} on:click={() => (mode = 'comb')}>Combinée</button>
    </div>
    <label class="s"><span>Amplitude</span><strong>×{level.toFixed(1)}</strong><input type="range" min="0.4" max="2" step="0.1" bind:value={level} /></label>
    <div class="readout">
      <div><span>Points dans la bande</span><strong>{pct.toFixed(0)} %</strong></div>
      <div class="verdict" class:ok={pct >= 90 && pct <= 98}>{pct >= 90 && pct <= 98 ? '≈ 95 % attendu : bon' : pct < 90 ? 'bande trop étroite' : 'bande trop large'}</div>
    </div>
    <p class="hint">Additive = largeur <em>constante</em> (bien à basse concentration). Proportionnelle = s'élargit avec la prédiction (bien à haute). La combinée fait les deux — visez ≈ 95 % des points dans la bande.</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label="Modèle d'erreur résiduelle sur données Warfarin">
    <g transform={`translate(${m.left},${m.top})`}>
      <path d={band} class="band" />
      <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      <path d={curve} class="fit" />
      {#each pts as p}<circle cx={p.px} cy={p.py} r="2.4" class:out={!p.in} class="pt" />{/each}
      <text x={iW / 2} y={iH + 32} class="lbl">Temps (h)</text>
      <text transform={`translate(-32,${iH / 2}) rotate(-90)`} class="lbl">Concentration (mg/L)</text>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); }
  @media (min-width: 720px) { .wrap { grid-template-columns: 210px 1fr; align-items: center; } }
  .controls { display: grid; gap: var(--space-2); }
  .modes { display: flex; gap: var(--space-2); }
  .modes button, .readout, .s { font-family: var(--font-mono); }
  .modes button { flex: 1; font-size: 9px; padding: 4px 2px; border: 1px solid var(--border-strong); background: var(--bg-tertiary); border-radius: var(--radius); cursor: pointer; }
  .modes button.on { background: var(--accent-pk); color: #fff; border-color: var(--accent-pk); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--accent-pk); }
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
  .band { fill: var(--accent-pk); opacity: 0.13; }
  .fit { fill: none; stroke: var(--accent-pk); stroke-width: 2.4; }
  .pt { fill: var(--text-secondary); opacity: 0.6; }
  .pt.out { fill: #b0392b; opacity: 0.9; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 12px; text-anchor: middle; }
</style>
