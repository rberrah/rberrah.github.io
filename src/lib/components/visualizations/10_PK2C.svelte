<script>
  // Modèle à 2 compartiments : phase de distribution (α, rapide) puis phase
  // d'élimination (β, lente). Vue semi-log pour révéler les deux pentes ;
  // courbe 1-compartiment en référence (même CL, même V central).
  import { scaleLinear, scaleLog } from 'd3-scale';
  import { concTwoComp, concMono } from '$lib/utils/math';
  import { language } from '$lib/stores/language';

  let dose = 150;
  let cl = 6;   // L/h
  let q = 8;    // L/h (clairance inter-compartimentale)
  let v1 = 15;  // L (central)
  let v2 = 40;  // L (périphérique)
  let logScale = true;
  let showMono = true;

  const W = 460, H = 300, m = { top: 20, right: 16, bottom: 46, left: 56 };
  const tEnd = 24;
  const times = Array.from({ length: 241 }, (_, i) => (i * tEnd) / 240);

  $: two = times.map((t) => ({ t, c: concTwoComp(t, dose, cl, q, v1, v2) }));
  $: mono = times.map((t) => ({ t, c: concMono(t, dose, cl, v1) }));
  $: c0 = dose / v1;

  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  $: x = scaleLinear().domain([0, tEnd]).range([0, iW]);
  $: yMax = c0 * 1.08 || 1;
  $: yMin = logScale ? Math.max(c0 / 500, 0.02) : 0;
  $: y = logScale
    ? scaleLog().domain([yMin, yMax]).range([iH, 0]).clamp(true)
    : scaleLinear().domain([0, yMax]).range([iH, 0]);

  /** @param {{t:number,c:number}[]} arr */
  const pathOf = (arr) =>
    arr.filter((p) => (logScale ? p.c > yMin : true))
      .map((p, i) => `${i ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p.c).toFixed(1)}`)
      .join(' ');
  $: twoPath = pathOf(two);
  $: monoPath = pathOf(mono);
  $: xTicks = x.ticks(6);
  $: yTicks = logScale ? y.ticks(4) : y.ticks(5);
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>Dose (mg)</span><strong>{dose}</strong><input type="range" min="25" max="400" step="5" bind:value={dose} /></label>
    <label class="s"><span>CL (L/h)</span><strong>{cl}</strong><input type="range" min="2" max="20" step="0.5" bind:value={cl} /></label>
    <label class="s"><span>Q (L/h)</span><strong>{q}</strong><input type="range" min="1" max="25" step="0.5" bind:value={q} /></label>
    <label class="s"><span>V1 {$language === 'en' ? 'central' : 'central'} (L)</span><strong>{v1}</strong><input type="range" min="5" max="40" step="1" bind:value={v1} /></label>
    <label class="s"><span>V2 {$language === 'en' ? 'peripheral' : 'périph.'} (L)</span><strong>{v2}</strong><input type="range" min="10" max="120" step="1" bind:value={v2} /></label>
    <div class="toggles">
      <button class:on={logScale} on:click={() => (logScale = !logScale)}>{logScale ? 'Semi-log' : ($language === 'en' ? 'Linear' : 'Linéaire')}</button>
      <label class="chk"><input type="checkbox" bind:checked={showMono} /> {$language === 'en' ? '1-cpt reference' : 'Réf. 1-cmt'}</label>
    </div>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label={$language === 'en' ? 'Two-compartment model' : 'Modèle bi-compartimental'}>
    <g transform={`translate(${m.left},${m.top})`}>
      {#each yTicks as t}
        <line x1="0" x2={iW} y1={y(t)} y2={y(t)} class="grid" />
        <text x="-8" y={y(t) + 4} class="ytick">{t >= 1 ? t.toFixed(0) : t.toFixed(2)}</text>
      {/each}
      {#each xTicks as t}<text x={x(t)} y={iH + 20} class="xtick">{t}</text>{/each}

      {#if showMono}<path d={monoPath} class="mono" />{/if}
      <path d={twoPath} class="two" />

      <!-- annotations de phases -->
      <text x={x(1.5)} y={14} class="ann alpha">{$language === 'en' ? 'α phase (distribution)' : 'phase α (distribution)'}</text>
      <text x={x(tEnd * 0.55)} y={y(c0 * (logScale ? 0.12 : 0.35)) - 6} class="ann beta">{$language === 'en' ? 'β phase (elimination)' : 'phase β (élimination)'}</text>

      <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      <text x={iW / 2} y={iH + 40} class="lbl">{$language === 'en' ? 'Time (h)' : 'Temps (h)'}</text>
      <text transform={`translate(-44,${iH / 2}) rotate(-90)`} class="lbl">Concentration{logScale ? ' (log)' : ''}</text>

      <g class="legend" transform={`translate(${iW - 130},2)`}>
        <rect x="0" y="0" width="14" height="3" class="two" /><text x="20" y="4" class="leg">2 {$language === 'en' ? 'compartments' : 'compartiments'}</text>
        {#if showMono}<rect x="0" y="15" width="14" height="3" class="mono" /><text x="20" y="19" class="leg">1 {$language === 'en' ? 'compartment' : 'compartiment'}</text>{/if}
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
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-family: var(--font-mono); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--accent-pk); }
  .s input { grid-column: 1 / -1; }
  .toggles { display: flex; gap: var(--space-2); align-items: center; flex-wrap: wrap; }
  .toggles button { font-family: var(--font-mono); font-size: var(--text-xs); padding: 4px 8px; border: 1px solid var(--border-strong); background: var(--bg-tertiary); border-radius: var(--radius); cursor: pointer; }
  .toggles button.on { background: var(--text-primary); color: var(--bg-primary); border-color: var(--text-primary); }
  .chk { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-secondary); display: flex; gap: 4px; align-items: center; }
  .chart { width: 100%; height: auto; }
  .grid { stroke: var(--border-subtle); stroke-width: 1; stroke-dasharray: 4 4; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .two { fill: none; stroke: var(--accent-pk); stroke-width: 3; stroke-linecap: round; }
  .mono { fill: none; stroke: var(--text-muted); stroke-width: 2; stroke-dasharray: 5 4; }
  .xtick, .ytick { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; }
  .xtick { text-anchor: middle; }
  .ytick { text-anchor: end; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 12px; text-anchor: middle; }
  .ann { font-family: var(--font-mono); font-size: 10px; }
  .ann.alpha { fill: var(--accent-pk); }
  .ann.beta { fill: var(--text-secondary); }
  .leg { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 10px; }
</style>
