<script>
  // Explorateur Emax / sigmoïde de Hill (chapitre PK/PD).
  //   E(C) = E0 + Emax · C^h / (EC50^h + C^h)
  // EC50 = concentration donnant la moitié de l'effet ; h (Hill) = raideur.
  let e0 = 5;
  let emax = 100;
  let ec50 = 20;
  let hill = 1;
  let logScale = false;

  const W = 460, H = 300;
  const m = { top: 20, right: 16, bottom: 46, left: 52 };
  $: innerW = W - m.left - m.right;
  $: innerH = H - m.top - m.bottom;

  $: cMin = logScale ? ec50 / 50 : 0;
  $: cMax = ec50 * 12;
  const NP = 200;

  /** @param {number} c */
  function effect(c) {
    const ch = Math.pow(c, hill);
    return e0 + (emax * ch) / (Math.pow(ec50, hill) + ch);
  }

  $: yMax = e0 + emax * 1.05;
  /** @param {number} c */
  function xpos(c) {
    if (logScale) {
      const a = Math.log10(Math.max(c, cMin)), lo = Math.log10(cMin), hi = Math.log10(cMax);
      return ((a - lo) / (hi - lo)) * innerW;
    }
    return (c / cMax) * innerW;
  }
  /** @param {number} e */
  function ypos(e) {
    return innerH - (e / yMax) * innerH;
  }

  $: pts = Array.from({ length: NP + 1 }, (_, i) => {
    const c = logScale
      ? Math.pow(10, Math.log10(cMin) + (i / NP) * (Math.log10(cMax) - Math.log10(cMin)))
      : (i / NP) * cMax;
    return { c, e: effect(c) };
  });
  $: path = pts.map((p, i) => `${i ? 'L' : 'M'}${xpos(p.c).toFixed(1)},${ypos(p.e).toFixed(1)}`).join(' ');
  // Courbe de référence hyperbolique (Hill = 1) pour visualiser la raideur.
  $: refPath = pts
    .map((p, i) => `${i ? 'L' : 'M'}${xpos(p.c).toFixed(1)},${ypos(e0 + (emax * p.c) / (ec50 + p.c)).toFixed(1)}`)
    .join(' ');
  $: halfE = e0 + emax / 2;
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>E₀ (base)</span><strong>{e0}</strong><input type="range" min="0" max="50" step="1" bind:value={e0} /></label>
    <label class="s"><span>Emax</span><strong>{emax}</strong><input type="range" min="20" max="150" step="5" bind:value={emax} /></label>
    <label class="s"><span>EC₅₀</span><strong>{ec50}</strong><input type="range" min="2" max="80" step="1" bind:value={ec50} /></label>
    <label class="s"><span>Hill h</span><strong>{hill.toFixed(1)}</strong><input type="range" min="0.5" max="5" step="0.1" bind:value={hill} /></label>
    <button class="toggle" class:on={logScale} on:click={() => (logScale = !logScale)}>{logScale ? 'Axe log C' : 'Axe linéaire'}</button>
    <div class="readout">
      <div><span>Effet à EC₅₀</span><strong>{halfE.toFixed(0)}</strong></div>
      <div><span>= E₀ + Emax/2</span><strong>{(e0 + emax / 2).toFixed(0)}</strong></div>
      <div><span>Plateau (C→∞)</span><strong>{(e0 + emax).toFixed(0)}</strong></div>
    </div>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label="Courbe effet-concentration Emax/Hill">
    <g transform={`translate(${m.left},${m.top})`}>
      <line x1="0" x2="0" y1="0" y2={innerH} class="axis" />
      <line x1="0" x2={innerW} y1={innerH} y2={innerH} class="axis" />
      <!-- demi-effet -->
      <line x1={xpos(ec50)} x2={xpos(ec50)} y1={ypos(halfE)} y2={innerH} class="guide" />
      <line x1="0" x2={xpos(ec50)} y1={ypos(halfE)} y2={ypos(halfE)} class="guide" />
      <text x={xpos(ec50) + 4} y={ypos(halfE) - 6} class="tag">EC₅₀ → ½ Emax</text>
      <!-- plateau -->
      <line x1="0" x2={innerW} y1={ypos(e0 + emax)} y2={ypos(e0 + emax)} class="plateau" />
      {#if Math.abs(hill - 1) > 0.05}
        <path d={refPath} class="refline" />
      {/if}
      <path d={path} class="cline" />
      <circle cx={xpos(ec50)} cy={ypos(halfE)} r="4.5" class="dot" />
      <text x={innerW / 2} y={innerH + 38} class="lbl">Concentration{logScale ? ' (log)' : ''}</text>
      <text transform={`translate(-40,${innerH / 2}) rotate(-90)`} class="lbl">Effet</text>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); }
  @media (min-width: 720px) { .wrap { grid-template-columns: 210px 1fr; align-items: center; } }
  .controls { display: grid; gap: var(--space-2); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-family: var(--font-mono); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--accent-pd); }
  .s input { grid-column: 1 / -1; }
  .toggle { font-family: var(--font-mono); font-size: var(--text-xs); padding: 4px 8px; border: 1px solid var(--border-strong); background: var(--bg-tertiary); border-radius: var(--radius); cursor: pointer; }
  .toggle.on { background: var(--text-primary); color: var(--bg-primary); border-color: var(--text-primary); }
  .readout { display: grid; gap: 2px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-family: var(--font-mono); font-size: var(--text-xs); }
  .readout div { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .cline { fill: none; stroke: var(--accent-pd); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
  .refline { fill: none; stroke: var(--text-muted); stroke-width: 1.5; stroke-dasharray: 4 4; opacity: 0.7; }
  .guide { stroke: var(--accent-pk); stroke-width: 1; stroke-dasharray: 3 3; }
  .plateau { stroke: var(--text-muted); stroke-width: 1; stroke-dasharray: 2 4; }
  .dot { fill: var(--accent-pk); }
  .tag { fill: var(--accent-pk); font-family: var(--font-mono); font-size: 10px; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 12px; text-anchor: middle; }
</style>
