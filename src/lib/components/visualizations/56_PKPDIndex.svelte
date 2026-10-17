<script>
  import { language } from '#lib/stores/language.js';
  import { calculatePkpdProfile } from '#lib/science/visualizationMath.js';
  // Indices PK/PD des anti-infectieux : concentration au cours du temps vs la CMI.
  // Visualise T>CMI (temps au-dessus), Cmax/CMI (hauteur du pic) et AUC/CMI (aire).
  let dose = 750; // mg (bolus IV répété)
  let mic = 2; // mg/L
  let tau = 8; // h — intervalle entre doses
  let mode = 'time'; // 'time' | 'peak' | 'auc'
  /** @type {'total'|'free'} */
  let basis = 'free'; // concentration totale ou libre
  let fu = 0.8; // fraction libre

  const V = 20, ke = 0.35; // PK simple : t1/2 ≈ 2 h
  const T = 24, dt = 0.05;

  $: simulation = calculatePkpdProfile({ dose, mic, tau, V, ke, T, dt, fu, basis });
  $: ({ points: sim, cmax, pctTime, aucMic } = simulation);
  $: prefix = basis === 'free' ? 'f' : '';

  const W = 480, H = 300, m = { top: 16, right: 14, bottom: 42, left: 46 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  $: yMax = Math.max(cmax * 1.05, mic * 1.5);
  $: xt = (/** @type {number} */ t) => (t / T) * iW;
  $: yv = (/** @type {number} */ c) => iH - (c / yMax) * iH;
  $: pathC = sim.map((p, i) => `${i ? 'L' : 'M'}${xt(p.t).toFixed(1)},${yv(p.C).toFixed(1)}`).join(' ');
  // Aire totale sous la courbe pour le mode AUC/CMI.
  $: aucArea = (() => {
    const seg = sim.map((p) => ({ x: xt(p.t), yC: yv(p.C), yM: yv(0) }));
    const top = seg.map((s, i) => `${i ? 'L' : 'M'}${s.x.toFixed(1)},${s.yC.toFixed(1)}`).join(' ');
    const bot = seg.slice().reverse().map((s) => `L${s.x.toFixed(1)},${s.yM.toFixed(1)}`).join(' ');
    return `${top} ${bot} Z`;
  })();
  $: peak = sim.reduce((a, b) => (b.C > a.C ? b : a), sim[0]);
</script>

<div class="wrap">
  <div class="controls">
    <div class="modes">
      <button class:on={mode === 'time'} on:click={() => (mode = 'time')}>{prefix}T&gt;{$language === 'en' ? 'MIC' : 'CMI'}</button>
      <button class:on={mode === 'peak'} on:click={() => (mode = 'peak')}>{prefix}Cmax/{$language === 'en' ? 'MIC' : 'CMI'}</button>
      <button class:on={mode === 'auc'} on:click={() => (mode = 'auc')}>{prefix}AUC/{$language === 'en' ? 'MIC' : 'CMI'}</button>
    </div>
    <div class="basis" role="group" aria-label={$language === 'en' ? 'Concentration basis' : 'Base de concentration'}>
      <button class:on={basis === 'free'} on:click={() => (basis = 'free')}>{$language === 'en' ? 'Unbound' : 'Libre'}</button>
      <button class:on={basis === 'total'} on:click={() => (basis = 'total')}>{$language === 'en' ? 'Total' : 'Totale'}</button>
    </div>
    <label class="s"><span>Dose (mg)</span><strong>{dose}</strong><input type="range" min="250" max="1500" step="50" bind:value={dose} /></label>
    <label class="s"><span>{$language === 'en' ? 'MIC (mg/L)' : 'CMI (mg/L)'}</span><strong>{mic}</strong><input type="range" min="0.5" max="8" step="0.5" bind:value={mic} /></label>
    <label class="s"><span>{$language === 'en' ? 'Interval τ (h)' : 'Intervalle τ (h)'}</span><strong>{tau}</strong><input type="range" min="4" max="12" step="1" bind:value={tau} /></label>
    <label class="s"><span>{$language === 'en' ? 'Unbound fraction fu' : 'Fraction libre fu'}</span><strong>{fu.toFixed(2)}</strong><input type="range" min="0.1" max="1" step="0.05" bind:value={fu} disabled={basis === 'total'} /></label>
    <div class="readout">
      <div class:hi={mode === 'time'}><span>{prefix}T &gt; {$language === 'en' ? 'MIC' : 'CMI'}</span><strong>{pctTime.toFixed(0)} %</strong></div>
      <div class:hi={mode === 'peak'}><span>{prefix}Cmax / {$language === 'en' ? 'MIC' : 'CMI'}</span><strong>{(cmax / mic).toFixed(1)}</strong></div>
      <div class:hi={mode === 'auc'}><span>{prefix}AUC₂₄ / {$language === 'en' ? 'MIC' : 'CMI'}</span><strong>{aucMic.toFixed(0)}</strong></div>
    </div>
    <p class="hint">{$language === 'en' ? 'Illustrative one-compartment IV-bolus profile on [0, 24 h): a dose exactly at 24 h is excluded. Choose total concentration or the unbound approximation fu × Ctotal. Relevant index, target and MIC conditions depend on drug, pathogen, assay, site and population.' : "Profil illustratif à un compartiment après bolus IV sur [0, 24 h[ : une dose exactement à 24 h est exclue. Choisissez la concentration totale ou l’approximation libre fu × Ctotale. L’indice pertinent, sa cible et les conditions de CMI dépendent de la molécule, de la souche, de la méthode, du site et de la population."}</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label={$language === 'en' ? 'Concentration vs MIC' : 'Concentration vs CMI'}>
    <g transform={`translate(${m.left},${m.top})`}>
      {#if mode === 'auc'}<path d={aucArea} class="aucfill" />{/if}
      <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      <!-- CMI -->
      <line x1="0" x2={iW} y1={yv(mic)} y2={yv(mic)} class="mic" />
      <text x={iW - 2} y={yv(mic) - 4} class="miclbl">{$language === 'en' ? 'MIC' : 'CMI'}</text>
      <!-- bande T>CMI -->
      {#if mode === 'time'}
        {#each sim as p, i}{#if p.C >= mic}<rect x={xt(p.t)} y={iH - 6} width={iW / sim.length + 0.6} height="6" class="tband" />{/if}{/each}
      {/if}
      <path d={pathC} class="cline" />
      {#if mode === 'peak'}
        <circle cx={xt(peak.t)} cy={yv(peak.C)} r="5" class="peak" />
        <line x1={xt(peak.t)} x2={xt(peak.t)} y1={yv(peak.C)} y2={yv(mic)} class="peakline" />
      {/if}
      <text x={iW / 2} y={iH + 34} class="lbl">{$language === 'en' ? 'Time (h)' : 'Temps (h)'}</text>
      <text transform={`translate(-34,${iH / 2}) rotate(-90)`} class="lbl">Concentration (mg/L)</text>
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
  .modes, .basis { display: flex; gap: var(--space-2); }
  .modes button, .basis button, .readout, .s { font-family: var(--font-mono); }
  .modes button, .basis button { flex: 1; font-size: var(--text-xs); padding: 4px 2px; border: 1px solid var(--border-strong); background: var(--bg-tertiary); border-radius: var(--radius); cursor: pointer; }
  .modes button.on, .basis button.on { background: var(--infectio); color: var(--bg-tertiary); border-color: var(--infectio); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--infectio); }
  .s input { grid-column: 1 / -1; }
  .s input:disabled { opacity: 0.45; cursor: not-allowed; }
  .readout { display: grid; gap: 3px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-size: var(--text-xs); }
  .readout div { display: flex; justify-content: space-between; gap: var(--space-2); padding: 1px 4px; border-radius: 4px; }
  .readout div.hi { background: var(--infectio); color: var(--bg-tertiary); }
  .readout div.hi span, .readout div.hi strong { color: var(--bg-tertiary); }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .mic { stroke: #b0392b; stroke-width: 1.5; stroke-dasharray: 4 3; }
  .miclbl { fill: #b0392b; font-family: var(--font-mono); font-size: 10px; text-anchor: end; }
  .cline { fill: none; stroke: var(--infectio); stroke-width: 2.4; }
  .tband { fill: var(--infectio); opacity: 0.8; }
  .aucfill { fill: var(--infectio); opacity: 0.18; }
  .peak { fill: var(--infectio); }
  .peakline { stroke: var(--infectio); stroke-width: 1; stroke-dasharray: 2 2; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; text-anchor: middle; }
</style>
