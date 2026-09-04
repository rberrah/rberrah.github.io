<script>
  import { language } from '$lib/stores/language';
  // Modèle de myélosuppression de Friberg (2002).
  //   Prol → Transit1 → Transit2 → Transit3 → Circ
  //   dProl = ktr·Prol·(1 − Edrug)·(Circ0/Circ)^γ − ktr·Prol
  //   dTr_i = ktr·(Tr_{i-1} − Tr_i)         (maturation = délai du nadir)
  //   dCirc = ktr·Tr3 − ktr·Circ
  //   ktr = (n+1)/MTT ,  Edrug = slope·C(t)
  let dose = 100; // mg (bolus) → pilote l'exposition
  let mtt = 120; // h — temps moyen de transit (maturation)
  let gamma = 0.17; // rétrocontrôle

  const Circ0 = 5; // G/L — valeur de base des neutrophiles
  const slope = 0.02; // effet PD (par unité de C)
  const V = 30, ke = 0.02; // PK simple (bolus IV)
  const T = 600, dt = 1; // h (~25 jours)
  const nTr = 3;

  $: ktr = (nTr + 1) / mtt;
  $: c0 = dose / V;

  $: sim = (() => {
    const n = Math.round(T / dt);
    let Prol = Circ0, Tr1 = Circ0, Tr2 = Circ0, Tr3 = Circ0, Circ = Circ0;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i * dt;
      const C = c0 * Math.exp(-ke * t);
      const Edrug = Math.min(0.99, slope * C);
      const fb = Math.pow(Circ0 / Math.max(Circ, 0.01), gamma);
      const dProl = ktr * Prol * (1 - Edrug) * fb - ktr * Prol;
      const dTr1 = ktr * (Prol - Tr1);
      const dTr2 = ktr * (Tr1 - Tr2);
      const dTr3 = ktr * (Tr2 - Tr3);
      const dCirc = ktr * Tr3 - ktr * Circ;
      Prol += dProl * dt; Tr1 += dTr1 * dt; Tr2 += dTr2 * dt; Tr3 += dTr3 * dt; Circ += dCirc * dt;
      pts.push({ t, C, Circ: Math.max(0.01, Circ) });
    }
    return pts;
  })();

  $: nadir = sim.reduce((a, b) => (b.Circ < a.Circ ? b : a), sim[0]);
  /** @returns {string} */
  function grade(/** @type {number} */ anc) {
    if (anc < 0.5) return 'Grade 4';
    if (anc < 1.0) return 'Grade 3';
    if (anc < 1.5) return 'Grade 2';
    return 'Grade 0–1';
  }
  $: cMax = c0 * 1.05 || 1;

  const W = 480, H = 300, m = { top: 18, right: 16, bottom: 44, left: 46 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  $: circMax = Math.max(Circ0 * 1.3, ...sim.map((p) => p.Circ));
  $: xt = (/** @type {number} */ t) => (t / T) * iW;
  $: yC = (/** @type {number} */ c) => iH - (c / cMax) * iH;
  $: yN = (/** @type {number} */ v) => iH - (v / circMax) * iH;
  $: pathC = sim.map((p, i) => `${i ? 'L' : 'M'}${xt(p.t).toFixed(1)},${yC(p.C).toFixed(1)}`).join(' ');
  $: pathN = sim.map((p, i) => `${i ? 'L' : 'M'}${xt(p.t).toFixed(1)},${yN(p.Circ).toFixed(1)}`).join(' ');
  $: days = (/** @type {number} */ h) => (h / 24).toFixed(1);
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>Dose (mg)</span><strong>{dose}</strong><input type="range" min="20" max="300" step="10" bind:value={dose} /></label>
    <label class="s"><span>MTT (h)</span><strong>{mtt}</strong><input type="range" min="60" max="220" step="10" bind:value={mtt} /></label>
    <label class="s"><span>{$language === 'en' ? 'Feedback γ' : 'Rétrocontrôle γ'}</span><strong>{gamma.toFixed(2)}</strong><input type="range" min="0" max="0.4" step="0.01" bind:value={gamma} /></label>
    <div class="readout">
      <div><span>Nadir ANC</span><strong>{nadir.Circ.toFixed(2)} G/L</strong></div>
      <div><span>{$language === 'en' ? 'at' : 'à'}</span><strong>{$language === 'en' ? 'D' : 'J'}{days(nadir.t)}</strong></div>
      <div class="verdict" class:g3={nadir.Circ < 1.0} class:g4={nadir.Circ < 0.5}>{grade(nadir.Circ)}</div>
    </div>
    <p class="hint">{#if $language === 'en'}The nadir occurs <em>several days after</em> the plasma peak because of maturation (MTT), not PK.{:else}Le nadir survient <em>plusieurs jours après</em> le pic plasmatique : c'est la maturation (MTT), pas la PK.{/if}</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label={$language === 'en' ? 'Neutrophils and concentration over time' : 'Neutrophiles et concentration au cours du temps'}>
    <g transform={`translate(${m.left},${m.top})`}>
      <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      <!-- baseline & seuils -->
      <line x1="0" x2={iW} y1={yN(Circ0)} y2={yN(Circ0)} class="base" />
      <line x1="0" x2={iW} y1={yN(0.5)} y2={yN(0.5)} class="thr" />
      <text x={iW - 2} y={yN(0.5) - 3} class="thrlbl">Grade 4 (0,5 G/L)</text>
      <path d={pathC} class="cline" />
      <path d={pathN} class="nline" />
      <line x1={xt(nadir.t)} x2={xt(nadir.t)} y1={yN(nadir.Circ)} y2={iH} class="guide" />
      <circle cx={xt(nadir.t)} cy={yN(nadir.Circ)} r="4.5" class="ndot" />
      <text x={iW / 2} y={iH + 36} class="lbl">{$language === 'en' ? 'Time (h)' : 'Temps (h)'}</text>
      <g class="legend" transform={`translate(${iW - 128},4)`}>
        <rect x="0" y="0" width="12" height="3" class="nline" /><text x="18" y="4" class="leg">{$language === 'en' ? 'Neutrophils' : 'Neutrophiles'}</text>
        <rect x="0" y="16" width="12" height="3" class="cline" /><text x="18" y="20" class="leg">Concentration</text>
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
  .verdict.g3 { background: #fdf1e3; color: #8a5a1a; }
  .verdict.g4 { background: var(--quiz-error-bg); color: var(--quiz-error-text); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .base { stroke: var(--text-muted); stroke-width: 1; stroke-dasharray: 2 4; }
  .thr { stroke: #b0392b; stroke-width: 1; stroke-dasharray: 3 3; }
  .thrlbl { fill: #b0392b; font-family: var(--font-mono); font-size: 9px; text-anchor: end; }
  .cline { fill: none; stroke: var(--accent-pk); stroke-width: 2; }
  .nline { fill: none; stroke: var(--onco); stroke-width: 2.6; }
  .guide { stroke: var(--onco); stroke-width: 1; stroke-dasharray: 2 3; }
  .ndot { fill: var(--onco); }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 12px; text-anchor: middle; }
  .leg { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 10px; }
</style>
