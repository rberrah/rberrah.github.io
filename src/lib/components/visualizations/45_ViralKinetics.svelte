<script>
  // Cinétique virale sous traitement (modèle à cellules cibles simplifié, type Neumann-Perelson).
  //   dI/dt = −δ·I                         (perte des cellules infectées)
  //   dV/dt = (1−ε)·p·I − c·V              (production bloquée à (1−ε), clairance c)
  // Donne une décroissance BIPHASIQUE. Attention à ne pas confondre les deux lectures de la
  // phase 1 : sa PENTE vaut c (clairance du virus libre), tandis que son AMPLITUDE — le palier
  // atteint, ≈ V0·(1−ε) — mesure l'efficacité ε. La phase 2, lente, donne δ.
  let eps = 0.99; // efficacité du traitement (blocage de la production)
  let delta = 0.14; // 1/j — perte des cellules infectées

  const c = 6; // 1/j — clairance du virus libre
  const V0 = 1e6; // copies/mL à l'équilibre pré-traitement
  const I0 = 1;
  const p = (c * V0) / I0; // production à l'équilibre
  const T = 28, dt = 0.02; // jours

  $: sim = (() => {
    const n = Math.round(T / dt);
    let I = I0, V = V0;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i * dt;
      pts.push({ t, V: Math.max(V, 1) });
      const dI = -delta * I;
      const dV = (1 - eps) * p * I - c * V;
      I += dI * dt; V += dV * dt;
    }
    return pts;
  })();

  $: logDrop = Math.log10(V0) - Math.log10(sim[sim.length - 1].V);

  const W = 480, H = 300, m = { top: 16, right: 14, bottom: 40, left: 46 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  const yTop = 7, yBot = 0; // log10 copies/mL
  $: xt = (/** @type {number} */ t) => (t / T) * iW;
  $: yv = (/** @type {number} */ v) => iH - ((Math.log10(v) - yBot) / (yTop - yBot)) * iH;
  $: pathV = sim.map((p2, i) => `${i ? 'L' : 'M'}${xt(p2.t).toFixed(1)},${yv(p2.V).toFixed(1)}`).join(' ');
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>Efficacité ε</span><strong>{eps.toFixed(3)}</strong><input type="range" min="0.5" max="0.999" step="0.001" bind:value={eps} /></label>
    <label class="s"><span>Perte cellules δ</span><strong>{delta.toFixed(2)}</strong><input type="range" min="0.05" max="0.5" step="0.01" bind:value={delta} /></label>
    <div class="readout">
      <div><span>Chute à J{T}</span><strong>{logDrop.toFixed(1)} log₁₀</strong></div>
      <div><span>Phase 1</span><strong>clairance virale (c)</strong></div>
      <div><span>Phase 2</span><strong>perte cellules (δ)</strong></div>
    </div>
    <p class="hint">Une efficacité forte donne une 1ʳᵉ phase rapide (clairance du virus) ; la 2ᵉ phase, plus lente, reflète l'élimination des cellules infectées (δ).</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label="Charge virale au cours du temps (échelle log)">
    <g transform={`translate(${m.left},${m.top})`}>
      {#each [0, 1, 2, 3, 4, 5, 6] as g}
        <line x1="0" x2={iW} y1={yv(Math.pow(10, g))} y2={yv(Math.pow(10, g))} class="grid" />
        <text x="-6" y={yv(Math.pow(10, g)) + 3} class="tick">10^{g}</text>
      {/each}
      <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      <path d={pathV} class="vline" />
      <text x={iW / 2} y={iH + 32} class="lbl">Temps (jours)</text>
      <text transform={`translate(-38,${iH / 2}) rotate(-90)`} class="lbl">Charge virale (copies/mL)</text>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); --infectio: #2f7d6e; }
  @media (min-width: 720px) { .wrap { grid-template-columns: 215px 1fr; align-items: center; } }
  /* Le panneau de chapitre fait ~610 px meme sur grand ecran : on interroge le CONTENEUR,
     pas la fenetre, sinon les controles ecrasent la figure. */
  @container (max-width: 700px) { .wrap { grid-template-columns: 1fr; align-items: stretch; } }
  .controls { display: grid; gap: var(--space-2); }
  .readout, .s { font-family: var(--font-mono); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--infectio); }
  .s input { grid-column: 1 / -1; }
  .readout { display: grid; gap: 3px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-size: var(--text-xs); }
  .readout div { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .grid { stroke: var(--border-subtle); stroke-width: 0.5; stroke-dasharray: 2 4; }
  .tick { fill: var(--text-muted); font-family: var(--font-mono); font-size: 8px; text-anchor: end; }
  .vline { fill: none; stroke: var(--infectio); stroke-width: 2.6; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 12px; text-anchor: middle; }
</style>
