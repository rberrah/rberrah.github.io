<script>
  import { language } from '$lib/stores/language';
  // Modèle de réponse indirecte (turnover) : la concentration agit sur la
  // PRODUCTION ou l'ÉLIMINATION d'une variable de réponse R.
  //   dR/dt = kin·(1 + f(C)) − kout·R      (stimulation de kin)
  //   dR/dt = kin − kout·(1 − g(C))·R      (inhibition de kout)
  // R0 = kin/kout est maintenu à 100 pour que seul le DÉLAI change.
  let dose = 100;
  let kout = 0.3; // 1/h — vitesse de renouvellement (contrôle le délai)
  let strength = 0.8; // Emax/Imax de l'effet (0..1)
  let mode = 'stim'; // 'stim' | 'inhib'

  const V = 20, ke = 0.35; // PK simple (bolus IV)
  const R0 = 100;
  const T = 48, dt = 0.1;
  const SC50 = 3; // concentration de demi-effet PD

  $: kin = R0 * kout;
  $: c0 = dose / V;

  $: sim = (() => {
    const n = Math.round(T / dt);
    let R = R0;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i * dt;
      const C = c0 * Math.exp(-ke * t);
      const eff = strength * (C / (SC50 + C)); // 0..strength
      const dR = mode === 'stim'
        ? kin * (1 + eff) - kout * R
        : kin - kout * (1 - eff) * R;
      R = R + dR * dt;
      pts.push({ t, C, R });
    }
    return pts;
  })();

  $: cMax = c0 * 1.05 || 1;
  $: rVals = sim.map((p) => p.R);
  $: rMin = Math.min(R0, ...rVals);
  $: rMax = Math.max(R0, ...rVals);
  $: rExtremum = mode === 'stim'
    ? sim.reduce((a, b) => (b.R > a.R ? b : a), sim[0])
    : sim.reduce((a, b) => (b.R < a.R ? b : a), sim[0]);

  const W = 470, H = 300, m = { top: 18, right: 16, bottom: 44, left: 46 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  $: xt = (/** @type {number} */ t) => (t / T) * iW;
  $: yC = (/** @type {number} */ c) => iH - (c / cMax) * iH;
  $: yR = (/** @type {number} */ r) => iH - ((r - rMin) / (rMax - rMin || 1)) * iH;

  $: pathC = sim.map((p, i) => `${i ? 'L' : 'M'}${xt(p.t).toFixed(1)},${yC(p.C).toFixed(1)}`).join(' ');
  $: pathR = sim.map((p, i) => `${i ? 'L' : 'M'}${xt(p.t).toFixed(1)},${yR(p.R).toFixed(1)}`).join(' ');
</script>

<div class="wrap">
  <div class="controls">
    <div class="modes">
      <button class:on={mode === 'stim'} on:click={() => (mode = 'stim')}>{$language === 'en' ? 'Stimulate kin' : 'Stimule kin'}</button>
      <button class:on={mode === 'inhib'} on:click={() => (mode = 'inhib')}>{$language === 'en' ? 'Inhibit kout' : 'Inhibe kout'}</button>
    </div>
    <label class="s"><span>Dose (mg)</span><strong>{dose}</strong><input type="range" min="25" max="300" step="5" bind:value={dose} /></label>
    <label class="s"><span>kout (1/h)</span><strong>{kout.toFixed(2)}</strong><input type="range" min="0.05" max="1" step="0.05" bind:value={kout} /></label>
    <label class="s"><span>{$language === 'en' ? 'Effect strength' : 'Force effet'}</span><strong>{strength.toFixed(1)}</strong><input type="range" min="0" max="0.95" step="0.05" bind:value={strength} /></label>
    <div class="readout">
      <div><span>Pic C</span><strong>t = 0 h</strong></div>
      <div><span>{mode === 'stim' ? ($language === 'en' ? 'Peak R' : 'Pic R') : 'Nadir R'}</span><strong>t = {rExtremum.t.toFixed(1)} h</strong></div>
      <div><span>{$language === 'en' ? 'PD delay' : 'Délai PD'}</span><strong>{rExtremum.t.toFixed(1)} h</strong></div>
    </div>
    <p class="hint">{#if $language === 'en'}Concentration peaks at t=0, but the response takes time: this <em>delay</em> comes from kout, not PK.{:else}Le pic de concentration est à t = 0, mais la réponse met du temps : ce <em>délai</em> vient de kout, pas de la PK.{/if}</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label={$language === 'en' ? 'Concentration and response over time' : 'Concentration et réponse au cours du temps'}>
    <g transform={`translate(${m.left},${m.top})`}>
      <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      <!-- baseline R0 -->
      <line x1="0" x2={iW} y1={yR(R0)} y2={yR(R0)} class="base" />
      <path d={pathC} class="cline" />
      <path d={pathR} class="rline" />
      <!-- délai -->
      <line x1={xt(rExtremum.t)} x2={xt(rExtremum.t)} y1={yR(rExtremum.R)} y2={iH} class="guide" />
      <circle cx={xt(rExtremum.t)} cy={yR(rExtremum.R)} r="4.5" class="rdot" />
      <text x={iW / 2} y={iH + 36} class="lbl">{$language === 'en' ? 'Time (h)' : 'Temps (h)'}</text>
      <g class="legend" transform={`translate(${iW - 150},4)`}>
        <rect x="0" y="0" width="12" height="3" class="cline" /><text x="18" y="4" class="leg">Concentration</text>
        <rect x="0" y="16" width="12" height="3" class="rline" /><text x="18" y="20" class="leg">{$language === 'en' ? 'Response R' : 'Réponse R'}</text>
      </g>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); }
  @media (min-width: 720px) { .wrap { grid-template-columns: 210px 1fr; align-items: center; } }
  /* Le panneau de chapitre fait ~610 px meme sur grand ecran : on interroge le CONTENEUR,
     pas la fenetre, sinon les controles ecrasent la figure. */
  @container (max-width: 700px) { .wrap { grid-template-columns: 1fr; align-items: stretch; } }
  .controls { display: grid; gap: var(--space-2); }
  .modes { display: flex; gap: var(--space-2); }
  .modes button, .readout, .s { font-family: var(--font-mono); }
  .modes button { flex: 1; font-size: var(--text-xs); padding: 4px 6px; border: 1px solid var(--border-strong); background: var(--bg-tertiary); border-radius: var(--radius); cursor: pointer; }
  .modes button.on { background: var(--text-primary); color: var(--bg-primary); border-color: var(--text-primary); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--accent-pd); }
  .s input { grid-column: 1 / -1; }
  .readout { display: grid; gap: 2px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-size: var(--text-xs); }
  .readout div { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .base { stroke: var(--text-muted); stroke-width: 1; stroke-dasharray: 2 4; }
  .cline { fill: none; stroke: var(--accent-pk); stroke-width: 2.5; }
  .rline { fill: none; stroke: var(--accent-pd); stroke-width: 2.5; }
  .guide { stroke: var(--accent-pd); stroke-width: 1; stroke-dasharray: 2 3; }
  .rdot { fill: var(--accent-pd); }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 12px; text-anchor: middle; }
  .leg { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 10px; }
</style>
