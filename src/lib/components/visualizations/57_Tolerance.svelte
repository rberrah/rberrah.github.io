<script>
  import { language } from '$lib/stores/language';
  // Tolérance et rebond : sous exposition CONSTANTE, l'effet s'atténue (un modérateur M
  // monte lentement et augmente l'élimination de la réponse). À l'arrêt, M reste élevé
  // → la réponse chute sous la ligne de base (rebond) avant de récupérer.
  //   dR/dt = kin·(1+eff) − kout·M·R ,  dM/dt = ktol·(R/R0 − M)
  let ktol = 0.05; // vitesse d'installation de la tolérance
  let strength = 0.8; // intensité de l'effet du médicament

  const R0 = 100, kout = 0.1, kin = R0 * kout;
  const T = 240, dt = 0.1, tOff = 120; // exposition sur [0, 120] h

  $: sim = (() => {
    const n = Math.round(T / dt);
    let R = R0, M = 1;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i * dt;
      const eff = t < tOff ? strength : 0;
      const dR = kin * (1 + eff) - kout * M * R;
      const dM = ktol * (R / R0 - M);
      R = Math.max(1, R + dR * dt); M = Math.max(0.01, M + dM * dt);
      pts.push({ t, R });
    }
    return pts;
  })();

  $: peak = sim.reduce((a, b) => (b.R > a.R ? b : a), sim[0]);
  $: nadir = sim.slice(Math.round(tOff / dt)).reduce((a, b) => (b.R < a.R ? b : a), sim[Math.round(tOff / dt)]);
  $: reboundDepth = R0 - nadir.R;

  const W = 480, H = 300, m = { top: 16, right: 14, bottom: 40, left: 46 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  $: rMax = Math.max(...sim.map((p) => p.R)) * 1.05;
  $: rMin = Math.min(...sim.map((p) => p.R)) * 0.95;
  $: xt = (/** @type {number} */ t) => (t / T) * iW;
  $: yv = (/** @type {number} */ r) => iH - ((r - rMin) / (rMax - rMin || 1)) * iH;
  $: pathR = sim.map((p, i) => `${i ? 'L' : 'M'}${xt(p.t).toFixed(1)},${yv(p.R).toFixed(1)}`).join(' ');
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>{$language === 'en' ? 'Tolerance rate' : 'Vitesse tolérance'}</span><strong>{ktol.toFixed(2)}</strong><input type="range" min="0" max="0.2" step="0.01" bind:value={ktol} /></label>
    <label class="s"><span>{$language === 'en' ? 'Effect intensity' : 'Intensité effet'}</span><strong>{strength.toFixed(1)}</strong><input type="range" min="0.2" max="1.5" step="0.1" bind:value={strength} /></label>
    <div class="readout">
      <div><span>{$language === 'en' ? 'Peak effect' : "Pic d'effet"}</span><strong>{((peak.R / R0 - 1) * 100).toFixed(0)} %</strong></div>
      <div><span>{$language === 'en' ? 'Rebound (below baseline)' : 'Rebond (sous base)'}</span><strong>{reboundDepth > 0.5 ? '−' + ((reboundDepth / R0) * 100).toFixed(0) + ' %' : '—'}</strong></div>
    </div>
    <p class="hint">{#if $language === 'en'}Under constant exposure, the effect rises then <em>wanes</em> as tolerance develops. After treatment stops at the dashed line, response drops below baseline: this is <em>rebound</em>.{:else}Sous exposition constante, l'effet monte puis <em>s'émousse</em> (tolérance). À l'arrêt (ligne pointillée), la réponse plonge sous la base : c'est le <em>rebond</em>.{/if}</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label={$language === 'en' ? 'Tolerance and response rebound' : 'Tolérance et rebond de la réponse'}>
    <g transform={`translate(${m.left},${m.top})`}>
      <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      <rect x="0" y="0" width={xt(tOff)} height={iH} class="onzone" />
      <text x="6" y="12" class="zonelbl">{$language === 'en' ? 'exposure' : 'exposition'}</text>
      <line x1="0" x2={iW} y1={yv(R0)} y2={yv(R0)} class="base" />
      <text x="2" y={yv(R0) - 4} class="baselbl">{$language === 'en' ? 'baseline' : 'ligne de base'}</text>
      <line x1={xt(tOff)} x2={xt(tOff)} y1="0" y2={iH} class="off" />
      <path d={pathR} class="rline" />
      <text x={iW / 2} y={iH + 32} class="lbl">{$language === 'en' ? 'Time (h)' : 'Temps (h)'}</text>
      <text transform={`translate(-34,${iH / 2}) rotate(-90)`} class="lbl">{$language === 'en' ? 'Response' : 'Réponse'}</text>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); --pd: #5b8c3a; }
  @media (min-width: 720px) { .wrap { grid-template-columns: 215px 1fr; align-items: center; } }
  /* Le panneau de chapitre fait ~610 px meme sur grand ecran : on interroge le CONTENEUR,
     pas la fenetre, sinon les controles ecrasent la figure. */
  @container (max-width: 700px) { .wrap { grid-template-columns: 1fr; align-items: stretch; } }
  .controls { display: grid; gap: var(--space-2); }
  .readout, .s { font-family: var(--font-mono); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--pd); }
  .s input { grid-column: 1 / -1; }
  .readout { display: grid; gap: 3px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-size: var(--text-xs); }
  .readout div { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .onzone { fill: var(--pd); opacity: 0.07; }
  .zonelbl { fill: var(--pd); font-family: var(--font-mono); font-size: 9px; }
  .base { stroke: var(--text-muted); stroke-width: 1; stroke-dasharray: 2 4; }
  .baselbl { fill: var(--text-muted); font-family: var(--font-mono); font-size: 9px; }
  .off { stroke: #b0392b; stroke-width: 1; stroke-dasharray: 3 3; }
  .rline { fill: none; stroke: var(--pd); stroke-width: 2.6; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; text-anchor: middle; }
</style>
