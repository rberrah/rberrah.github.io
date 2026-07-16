<script>
  // Vrais points du jeu de données Warfarin (251 observations PK, 32 sujets, dose orale
  // unique ~100 mg) avec un modèle à 1 compartiment oral ajustable.
  //   C(τ) = D·ka / (V·(ka−ke)) · (e^(−ke·τ) − e^(−ka·τ)),  τ = t − Tlag,  ke = CL/V
  // Mode « Profil » : nuage réel + courbe du modèle. Mode « Obs vs préd » : GoF réel.
  import { warfarinPK } from '$lib/content/warfarinData';

  /** @type {'time'|'gof'} */
  export let initialMode = 'time';
  let mode = initialMode;

  let ka = 0.9;
  let cl = 0.135;
  let v = 8;
  let tlag = 0.8;
  const D = 100;

  // Fonction PURE : tous les paramètres sont des arguments explicites, de sorte que
  // les expressions réactives qui l'appellent recalculent bien quand un curseur bouge.
  /** @param {number} t @param {number} ka @param {number} cl @param {number} v @param {number} tlag @returns {number} */
  function conc(t, ka, cl, v, tlag) {
    const ke = cl / v;
    const tau = t - tlag;
    if (tau <= 0) return 0;
    if (Math.abs(ka - ke) < 1e-6) return (D * ka / v) * tau * Math.exp(-ke * tau);
    return (D * ka) / (v * (ka - ke)) * (Math.exp(-ke * tau) - Math.exp(-ka * tau));
  }

  $: thalf = Math.log(2) / (cl / v);
  // écart quadratique moyen aux vrais points (dépend explicitement des 4 paramètres)
  $: rmse = Math.sqrt(warfarinPK.reduce((s, p) => s + (p[2] - conc(p[1], ka, cl, v, tlag)) ** 2, 0) / warfarinPK.length);

  const W = 480, H = 300, m = { top: 16, right: 14, bottom: 40, left: 44 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  const tMax = 126, cMax = 18;
  $: xt = (/** @type {number} */ t) => (t / tMax) * iW;
  $: yc = (/** @type {number} */ c) => iH - (Math.min(c, cMax) / cMax) * iH;
  $: gx = (/** @type {number} */ p) => (Math.min(p, cMax) / cMax) * iW;
  $: gy = (/** @type {number} */ o) => iH - (Math.min(o, cMax) / cMax) * iH;

  // Dérivées réactives : elles nomment ka, cl, v, tlag → recalcul à chaque changement.
  $: curve = Array.from({ length: 127 }, (_, i) => i)
    .map((t, i) => `${i ? 'L' : 'M'}${xt(t).toFixed(1)},${yc(conc(t, ka, cl, v, tlag)).toFixed(1)}`)
    .join(' ');
  $: gofPts = warfarinPK.map((p) => ({ px: gx(conc(p[1], ka, cl, v, tlag)), py: gy(p[2]) }));
  $: timePts = warfarinPK.map((p) => ({ px: xt(p[1]), py: yc(p[2]) }));
</script>

<div class="wrap">
  <div class="controls">
    <div class="modes">
      <button class:on={mode === 'time'} on:click={() => (mode = 'time')}>Profil (DV vs temps)</button>
      <button class:on={mode === 'gof'} on:click={() => (mode = 'gof')}>Obs vs préd</button>
    </div>
    <label class="s"><span>Ka (1/h)</span><strong>{ka.toFixed(2)}</strong><input type="range" min="0.1" max="2" step="0.05" bind:value={ka} /></label>
    <label class="s"><span>CL (L/h)</span><strong>{cl.toFixed(3)}</strong><input type="range" min="0.05" max="0.3" step="0.005" bind:value={cl} /></label>
    <label class="s"><span>V (L)</span><strong>{v.toFixed(1)}</strong><input type="range" min="4" max="14" step="0.5" bind:value={v} /></label>
    <label class="s"><span>Tlag (h)</span><strong>{tlag.toFixed(1)}</strong><input type="range" min="0" max="2" step="0.1" bind:value={tlag} /></label>
    <div class="readout">
      <div><span>Demi-vie</span><strong>{thalf.toFixed(0)} h</strong></div>
      <div><span>RMSE</span><strong>{rmse.toFixed(2)} mg/L</strong></div>
      <div><span>Données</span><strong>{warfarinPK.length} pts · 32 sujets</strong></div>
    </div>
    <p class="hint">Points réels de la base Warfarin. Ajustez Ka, CL, V et Tlag pour rapprocher la courbe du nuage — le <strong>RMSE</strong> baisse quand l'ajustement s'améliore.</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label="Ajustement du modèle aux données Warfarin réelles">
    <g transform={`translate(${m.left},${m.top})`}>
      <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      {#if mode === 'time'}
        {#each timePts as p}<circle cx={p.px} cy={p.py} r="2.4" class="pt" />{/each}
        <path d={curve} class="fit" />
        <text x={iW / 2} y={iH + 32} class="lbl">Temps (h)</text>
        <text transform={`translate(-32,${iH / 2}) rotate(-90)`} class="lbl">Concentration (mg/L)</text>
      {:else}
        <line x1={gx(0)} y1={gy(0)} x2={gx(cMax)} y2={gy(cMax)} class="ident" />
        {#each gofPts as p}<circle cx={p.px} cy={p.py} r="2.6" class="pt" />{/each}
        <text x={iW / 2} y={iH + 32} class="lbl">Prédictions (mg/L)</text>
        <text transform={`translate(-32,${iH / 2}) rotate(-90)`} class="lbl">Observations (mg/L)</text>
      {/if}
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); }
  @media (min-width: 720px) { .wrap { grid-template-columns: 210px 1fr; align-items: center; } }
  .controls { display: grid; gap: var(--space-2); }
  .modes { display: flex; gap: var(--space-2); }
  .modes button, .readout, .s { font-family: var(--font-mono); }
  .modes button { flex: 1; font-size: 10px; padding: 4px 4px; border: 1px solid var(--border-strong); background: var(--bg-tertiary); border-radius: var(--radius); cursor: pointer; }
  .modes button.on { background: var(--accent-pk); color: var(--bg-tertiary); border-color: var(--accent-pk); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--accent-pk); }
  .s input { grid-column: 1 / -1; }
  .readout { display: grid; gap: 3px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-size: var(--text-xs); }
  .readout div { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .pt { fill: var(--accent-pk); opacity: 0.5; }
  .fit { fill: none; stroke: var(--accent-pk); stroke-width: 2.6; }
  .ident { stroke: var(--text-muted); stroke-width: 1.2; stroke-dasharray: 4 4; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 12px; text-anchor: middle; }
</style>
