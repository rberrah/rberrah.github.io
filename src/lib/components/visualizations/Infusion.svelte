<script>
  // Perfusion IV (entrée d'ordre 0, débit constant R0).
  //   Pendant la perfusion : C(t) = (R0/CL)·(1 − e^(−ke·t)),  Css = R0/CL
  //   Après l'arrêt (à Tinf) : décroissance exponentielle.
  let r0 = 30;   // mg/h — débit de perfusion (ordre 0)
  let cl = 5;    // L/h
  let v = 35;    // L
  let tinf = 8;  // h — durée de perfusion

  const W = 470, H = 300, m = { top: 18, right: 16, bottom: 44, left: 50 };
  $: ke = cl / v;
  $: thalf = Math.log(2) / ke;
  $: css = r0 / cl;
  $: tEnd = Math.min(48, Math.max(tinf + 5 * thalf, 24));
  $: cAtStop = css * (1 - Math.exp(-ke * tinf));

  /** @param {number} t */
  function conc(t) {
    if (t <= tinf) return css * (1 - Math.exp(-ke * t));
    return cAtStop * Math.exp(-ke * (t - tinf));
  }
  const N = 300;
  $: curve = Array.from({ length: N + 1 }, (_, i) => {
    const t = (i / N) * tEnd;
    return { t, c: conc(t) };
  });
  $: t90 = thalf * 3.32; // ~90 % de Css

  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  $: cMax = css * 1.12 || 1;
  const xt = (/** @type {number} */ t) => (t / tEnd) * (W - m.left - m.right);
  $: yc = (/** @type {number} */ c) => iH - (Math.min(c, cMax) / cMax) * iH;
  $: path = curve.map((p, i) => `${i ? 'L' : 'M'}${xt(p.t).toFixed(1)},${yc(p.c).toFixed(1)}`).join(' ');
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>Débit R₀ (mg/h)</span><strong>{r0}</strong><input type="range" min="5" max="100" step="5" bind:value={r0} /></label>
    <label class="s"><span>Durée perfusion (h)</span><strong>{tinf}</strong><input type="range" min="1" max="24" step="1" bind:value={tinf} /></label>
    <label class="s"><span>CL (L/h)</span><strong>{cl}</strong><input type="range" min="1" max="15" step="0.5" bind:value={cl} /></label>
    <label class="s"><span>V (L)</span><strong>{v}</strong><input type="range" min="10" max="70" step="1" bind:value={v} /></label>
    <div class="readout">
      <div><span>Css = R₀/CL</span><strong>{css.toFixed(2)}</strong> mg/L</div>
      <div><span>t½</span><strong>{thalf.toFixed(1)}</strong> h</div>
      <div><span>~90 % de Css</span><strong>{t90.toFixed(1)}</strong> h</div>
      <div><span>C à l'arrêt</span><strong>{cAtStop.toFixed(2)}</strong> mg/L</div>
    </div>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label="Perfusion IV">
    <g transform={`translate(${m.left},${m.top})`}>
      <line x1="0" x2={iW} y1={yc(css)} y2={yc(css)} class="css" />
      <text x={iW - 2} y={yc(css) - 4} class="csslabel">Css = R₀/CL</text>
      <!-- zone de perfusion -->
      <rect x="0" y="0" width={xt(tinf)} height={iH} class="infzone" />
      <text x={xt(tinf) / 2} y={iH - 6} class="inflabel">perfusion</text>
      {#if t90 < tinf}
        <line x1={xt(t90)} x2={xt(t90)} y1={yc(css)} y2={iH} class="t90" />
      {/if}
      <line x1={xt(tinf)} x2={xt(tinf)} y1="0" y2={iH} class="stop" />
      <path d={path} class="line" />
      <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      <text x={iW / 2} y={iH + 36} class="lbl">Temps (h)</text>
      <text transform={`translate(-40,${iH / 2}) rotate(-90)`} class="lbl">Concentration (mg/L)</text>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); }
  @media (min-width: 720px) { .wrap { grid-template-columns: 220px 1fr; align-items: center; } }
  .controls { display: grid; gap: var(--space-2); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-family: var(--font-mono); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--accent-pk); }
  .s input { grid-column: 1 / -1; }
  .readout { display: grid; gap: 2px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-family: var(--font-mono); font-size: var(--text-xs); }
  .readout div { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .line { fill: none; stroke: var(--accent-pk); stroke-width: 3; stroke-linejoin: round; stroke-linecap: round; }
  .css { stroke: var(--accent-pd); stroke-width: 1.5; stroke-dasharray: 6 4; }
  .csslabel { fill: var(--accent-pd); font-family: var(--font-mono); font-size: 10px; text-anchor: end; }
  .infzone { fill: color-mix(in srgb, var(--accent-pk) 6%, transparent); }
  .inflabel { fill: var(--text-muted); font-family: var(--font-mono); font-size: 10px; text-anchor: middle; }
  .stop { stroke: var(--text-muted); stroke-width: 1; stroke-dasharray: 3 3; }
  .t90 { stroke: var(--text-muted); stroke-width: 1; stroke-dasharray: 2 3; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 12px; text-anchor: middle; }
</style>
