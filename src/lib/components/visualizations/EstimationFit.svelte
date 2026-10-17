<script>
  // Estimation : ajuster les paramètres (CL, V) pour faire coller le modèle aux
  // données. Le critère est ici une simple somme des carrés sur l'échelle log ;
  // ce n'est ni une vraisemblance NLME, ni une OFV FOCE/SAEM.
  import { onDestroy } from 'svelte';
  import { reducedMotion } from '#lib/motion/reducedMotion.js';
  import { language } from '#lib/stores/language.js';

  const dose = 100;
  // Données observées (générées depuis CL=5, V=30 + bruit, figées pour la démo).
  const obs = [
    { t: 0.5, c: 3.20 }, { t: 1, c: 2.65 }, { t: 2, c: 2.55 },
    { t: 4, c: 1.60 }, { t: 6, c: 1.30 }, { t: 8, c: 0.82 }, { t: 12, c: 0.49 }
  ];

  let cl = 10; // départ volontairement faux
  let v = 45;
  let running = false;
  /** @type {number | null} */
  let frame = null;

  /** @param {number} t @param {number} CL @param {number} V */
  const pred = (t, CL, V) => (dose / V) * Math.exp(-(CL / V) * t);
  /** @param {number} CL @param {number} V */
  function ofv(CL, V) {
    let s = 0;
    for (const o of obs) {
      const p = pred(o.t, CL, V);
      s += (Math.log(o.c) - Math.log(p)) ** 2;
    }
    return s;
  }
  $: currentOfv = ofv(cl, v);

  const logObs = obs.map((point) => ({ t: point.t, y: Math.log(point.c) }));
  const meanT = logObs.reduce((sum, point) => sum + point.t, 0) / logObs.length;
  const meanY = logObs.reduce((sum, point) => sum + point.y, 0) / logObs.length;
  const slope = logObs.reduce((sum, point) => sum + (point.t - meanT) * (point.y - meanY), 0)
    / logObs.reduce((sum, point) => sum + (point.t - meanT) ** 2, 0);
  const intercept = meanY - slope * meanT;
  const optimum = { v: dose / Math.exp(intercept), cl: -slope * dose / Math.exp(intercept) };
  const bestCriterion = ofv(optimum.cl, optimum.v);

  // Animation vers la solution analytique de la régression log-linéaire.
  function step() {
    const dCl = optimum.cl - cl;
    const dV = optimum.v - v;
    if (Math.abs(dCl) < 0.002 && Math.abs(dV) < 0.01) {
      cl = optimum.cl;
      v = optimum.v;
      return false;
    }
    cl += dCl * 0.12;
    v += dV * 0.12;
    return true;
  }

  function autofit() {
    if ($reducedMotion) {
      for (let i = 0; i < 400; i++) if (!step()) break;
      return;
    }
    running = true;
    let iter = 0;
    const loop = () => {
      if (!running) return;
      let moved = false;
      for (let k = 0; k < 3; k++) moved = step() || moved;
      iter++;
      if (!moved || iter > 300) { running = false; return; }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
  }
  function stop() { running = false; if (frame !== null) cancelAnimationFrame(frame); }
  function reset() { stop(); cl = 10; v = 45; }
  onDestroy(stop);

  const W = 460, H = 300, m = { top: 18, right: 16, bottom: 44, left: 50 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  const tEnd = 13, cMax = 4;
  /** @param {number} t */
  const xt = (t) => (t / tEnd) * iW;
  /** @param {number} c */
  const yc = (c) => iH - (Math.min(c, cMax) / cMax) * iH;
  const NP = 120;
  $: fitPath = Array.from({ length: NP + 1 }, (_, i) => {
    const t = (i / NP) * tEnd;
    return `${i ? 'L' : 'M'}${xt(t).toFixed(1)},${yc(pred(t, cl, v)).toFixed(1)}`;
  }).join(' ');
  $: excess = currentOfv - bestCriterion;
  $: quality = excess < 0.01 ? 'bon' : excess < 0.25 ? 'moyen' : 'mauvais';
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>{$language === 'en' ? 'Clearance CL' : 'Clairance CL'}</span><strong>{cl.toFixed(1)}</strong><input type="range" min="1" max="15" step="0.1" bind:value={cl} /></label>
    <label class="s"><span>Volume V</span><strong>{v.toFixed(0)}</strong><input type="range" min="10" max="60" step="0.5" bind:value={v} /></label>
    <div class="actions">
      <button on:click={autofit} disabled={running}>⚙ {$language === 'en' ? 'Fit' : 'Ajuster'}</button>
      <button on:click={stop} disabled={!running}>■ Stop</button>
      <button on:click={reset}>↺ {$language === 'en' ? 'Reset' : 'Réinit.'}</button>
    </div>
    <div class="readout">
      <div><span>{$language === 'en' ? 'Log-scale SSE' : 'SSE sur échelle log'}</span><strong>{currentOfv.toFixed(3)}</strong></div>
      <div><span>{$language === 'en' ? 'Analytical minimum' : 'Minimum analytique'}</span><strong>{bestCriterion.toFixed(3)}</strong></div>
      <div class:good={quality === 'bon'} class:bad={quality === 'mauvais'}><span>{$language === 'en' ? 'Fit' : 'Ajustement'}</span><strong>{$language === 'en' ? (quality === 'bon' ? 'good' : quality === 'moyen' ? 'moderate' : 'poor') : quality}</strong></div>
    </div>
    <p class="hint">{$language === 'en' ? 'Move CL and V or fit the log-linear one-compartment model analytically. This teaching SSE is not an NLME OFV or likelihood; a small value does not validate the model.' : "Déplacez CL et V ou ajustez analytiquement ce modèle log-linéaire à un compartiment. Ce SSE pédagogique n’est ni une OFV NLME ni une vraisemblance ; une petite valeur ne valide pas le modèle."}</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label={$language === 'en' ? 'Model fit to data' : 'Ajustement du modèle aux données'}>
    <g transform={`translate(${m.left},${m.top})`}>
      <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      <path d={fitPath} class="fit" />
      {#each obs as o}
        <line x1={xt(o.t)} x2={xt(o.t)} y1={yc(o.c)} y2={yc(pred(o.t, cl, v))} class="resid" />
        <circle cx={xt(o.t)} cy={yc(o.c)} r="4.5" class="obs" />
      {/each}
      <text x={iW / 2} y={iH + 36} class="lbl">{$language === 'en' ? 'Time (h)' : 'Temps (h)'}</text>
      <text transform={`translate(-38,${iH / 2}) rotate(-90)`} class="lbl">Concentration (mg/L)</text>
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
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-family: var(--font-mono); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--accent-pk); }
  .s input { grid-column: 1 / -1; }
  .actions { display: flex; gap: var(--space-2); flex-wrap: wrap; }
  .actions button { font-family: var(--font-mono); font-size: var(--text-xs); padding: 4px 8px; border: 1px solid var(--border-strong); background: var(--bg-tertiary); border-radius: var(--radius); cursor: pointer; }
  .actions button:disabled { opacity: 0.45; cursor: default; }
  .readout { display: grid; gap: 2px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-family: var(--font-mono); font-size: var(--text-xs); }
  .readout div { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
  .readout .good strong { color: var(--accent-pd); }
  .readout .bad strong { color: var(--accent-pk); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .fit { fill: none; stroke: var(--accent-pk); stroke-width: 2.5; stroke-linecap: round; }
  .resid { stroke: var(--text-muted); stroke-width: 1; stroke-dasharray: 2 2; }
  .obs { fill: var(--accent-pd); }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 12px; text-anchor: middle; }
</style>
