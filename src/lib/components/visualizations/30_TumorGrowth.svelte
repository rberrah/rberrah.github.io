<script>
  // Modèle d'inhibition de la croissance tumorale (TGI) de type Claret.
  //   dTS/dt = KG·TS  −  K·exposition·exp(−λ·t)·TS
  //   • KG           : croissance tumorale exponentielle (sans traitement)
  //   • K·exposition : rétrécissement induit par le médicament (∝ exposition/AUC)
  //   • exp(−λ·t)    : apparition PROGRESSIVE d'une résistance (l'effet s'épuise)
  // TS en mm (somme des plus grands diamètres, SLD). Temps en semaines.
  let dose = 100; // exposition relative (100 = dose de référence)
  let kg = 0.035; // 1/sem — vitesse de croissance
  let lambda = 0.02; // 1/sem — vitesse d'apparition de la résistance

  const TS0 = 60; // mm — taille tumorale initiale (baseline SLD)
  const K = 0.06; // 1/sem par unité d'exposition
  const T = 52, dt = 0.1; // 1 an

  /**
   * @param {number} d exposition relative
   * @param {number} g croissance K_G
   * @param {number} lam résistance λ
   * @returns {{t:number,ts:number}[]}
   */
  function simulate(d, g, lam) {
    const expo = d / 100;
    const n = Math.round(T / dt);
    let ts = TS0;
    const pts = [{ t: 0, ts }];
    for (let i = 1; i <= n; i++) {
      const t = i * dt;
      const shrink = K * expo * Math.exp(-lam * t);
      const dTS = g * ts - shrink * ts;
      ts = Math.max(0.5, ts + dTS * dt);
      pts.push({ t, ts });
    }
    return pts;
  }

  // Toutes les variables (dose, kg, lambda) apparaissent dans l'expression
  // réactive : Svelte recalcule donc la courbe dès qu'un curseur bouge.
  $: treated = simulate(dose, kg, lambda);
  $: untreated = simulate(0, kg, lambda);
  $: nadir = treated.reduce((a, b) => (b.ts < a.ts ? b : a), treated[0]);
  $: bestChange = ((nadir.ts - TS0) / TS0) * 100; // % vs baseline
  /** @returns {string} */
  function recist(/** @type {number} */ pct) {
    if (pct <= -30) return 'Réponse partielle (RP)';
    if (pct >= 20) return 'Progression (PD)';
    return 'Stable (SD)';
  }

  const W = 480, H = 300, m = { top: 18, right: 16, bottom: 44, left: 48 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  $: yMax = Math.min(3 * TS0, Math.max(1.6 * TS0, ...treated.map((p) => p.ts)));
  $: xt = (/** @type {number} */ t) => (t / T) * iW;
  $: yv = (/** @type {number} */ v) => iH - (Math.min(v, yMax) / yMax) * iH;

  $: pathT = treated.map((p, i) => `${i ? 'L' : 'M'}${xt(p.t).toFixed(1)},${yv(p.ts).toFixed(1)}`).join(' ');
  $: pathU = untreated.map((p, i) => `${i ? 'L' : 'M'}${xt(p.t).toFixed(1)},${yv(p.ts).toFixed(1)}`).join(' ');
  $: yPR = yv(TS0 * 0.7); // seuil RP (−30%)
  $: yPD = yv(TS0 * 1.2); // seuil PD (+20%)
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>Exposition (AUC)</span><strong>{dose}%</strong><input type="range" min="0" max="220" step="5" bind:value={dose} /></label>
    <label class="s"><span>Croissance K<sub>G</sub></span><strong>{kg.toFixed(3)}</strong><input type="range" min="0.01" max="0.07" step="0.005" bind:value={kg} /></label>
    <label class="s"><span>Résistance λ</span><strong>{lambda.toFixed(3)}</strong><input type="range" min="0" max="0.06" step="0.005" bind:value={lambda} /></label>
    <div class="readout">
      <div><span>Nadir</span><strong>{nadir.ts.toFixed(0)} mm à {nadir.t.toFixed(0)} sem</strong></div>
      <div><span>Meilleure réponse</span><strong>{bestChange >= 0 ? '+' : ''}{bestChange.toFixed(0)}%</strong></div>
      <div class="verdict" class:pr={bestChange <= -30} class:pd={bestChange >= 20}>{recist(bestChange)}</div>
    </div>
    <p class="hint">Montez l'exposition : la tumeur régresse, puis peut <em>ré-échapper</em> quand la résistance (λ) épuise l'effet.</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label="Taille tumorale au cours du temps">
    <g transform={`translate(${m.left},${m.top})`}>
      <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      <!-- bandes RECIST -->
      <line x1="0" x2={iW} y1={yPR} y2={yPR} class="thr pr" />
      <text x={iW - 2} y={yPR - 4} class="thrlbl pr">RP −30%</text>
      <line x1="0" x2={iW} y1={yPD} y2={yPD} class="thr pd" />
      <text x={iW - 2} y={yPD - 4} class="thrlbl pd">PD +20%</text>
      <!-- courbes -->
      <path d={pathU} class="uline" />
      <path d={pathT} class="tline" />
      <!-- nadir -->
      <circle cx={xt(nadir.t)} cy={yv(nadir.ts)} r="4.5" class="ndot" />
      <text x={iW / 2} y={iH + 36} class="lbl">Temps (semaines)</text>
      <text transform={`translate(-36,${iH / 2}) rotate(-90)`} class="lbl">Taille tumorale (mm)</text>
      <g class="legend" transform={`translate(6,4)`}>
        <rect x="0" y="0" width="12" height="3" class="tline" /><text x="18" y="4" class="leg">Traité</text>
        <rect x="0" y="16" width="12" height="3" class="uline" /><text x="18" y="20" class="leg">Sans traitement</text>
      </g>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); --onco: #9c4f6a; }
  @media (min-width: 720px) { .wrap { grid-template-columns: 215px 1fr; align-items: center; } }
  /* Le panneau de chapitre fait ~610 px meme sur grand ecran : on interroge le CONTENEUR,
     pas la fenetre, sinon les controles ecrasent la figure. */
  @container (max-width: 700px) { .wrap { grid-template-columns: 1fr; align-items: stretch; } }
  .controls { display: grid; gap: var(--space-2); }
  .readout, .s { font-family: var(--font-mono); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--onco); }
  .s input { grid-column: 1 / -1; }
  .readout { display: grid; gap: 3px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-size: var(--text-xs); }
  .readout div:not(.verdict) { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
  .verdict { margin-top: 2px; padding: 3px 6px; border-radius: var(--radius); text-align: center; background: var(--bg-tertiary); color: var(--text-secondary); font-weight: 600; }
  .verdict.pr { background: var(--quiz-success-bg); color: var(--quiz-success-text); }
  .verdict.pd { background: var(--quiz-error-bg); color: var(--quiz-error-text); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .thr { stroke-width: 1; stroke-dasharray: 3 3; }
  .thr.pr { stroke: var(--accent-pd); }
  .thr.pd { stroke: #b0392b; }
  .thrlbl { font-family: var(--font-mono); font-size: 9px; text-anchor: end; }
  .thrlbl.pr { fill: var(--accent-pd); }
  .thrlbl.pd { fill: #b0392b; }
  .tline { fill: none; stroke: var(--onco); stroke-width: 2.6; }
  .uline { fill: none; stroke: var(--text-muted); stroke-width: 1.6; stroke-dasharray: 4 4; }
  .ndot { fill: var(--onco); }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 12px; text-anchor: middle; }
  .leg { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 10px; }
</style>
