<script>
  // TMDD : PK non linéaire médiée par la cible (approximation Michaelis-Menten).
  //   dC/dt = −(CLlin/V)·C − (Vmax/V)·C/(Km + C)
  // À faible concentration, la voie cible (saturable) domine → élimination rapide.
  // À forte dose, la cible est saturée → PK quasi linéaire (pente plus lente).
  let dose = 100; // mg (dose mise en avant)

  const V = 4, CLlin = 0.15; // clairance linéaire lente (catabolisme)
  const Vmax = 8, Km = 0.5; // voie cible saturable
  const T = 28, dt = 0.02; // jours

  /** @param {number} d @returns {{t:number,C:number}[]} */
  function simulate(d) {
    const n = Math.round(T / dt);
    let C = d / V;
    const pts = [{ t: 0, C }];
    for (let i = 1; i <= n; i++) {
      const dC = -(CLlin / V) * C - (Vmax / V) * C / (Km + C);
      C = Math.max(1e-4, C + dC * dt);
      pts.push({ t: i * dt, C });
    }
    return pts;
  }

  const refDoses = [30, 100, 300];
  $: curves = refDoses.map((d) => ({ d, pts: simulate(d) }));
  $: sel = simulate(dose);
  // demi-vie apparente sur la dernière portion (jours)
  $: thalfEnd = (() => {
    const a = sel[Math.round(sel.length * 0.7)], b = sel[sel.length - 1];
    const k = (Math.log(a.C) - Math.log(b.C)) / (b.t - a.t);
    return k > 0 ? Math.log(2) / k : 0;
  })();

  const W = 480, H = 300, m = { top: 16, right: 14, bottom: 40, left: 48 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  const yTop = 3, yBot = -2; // log10
  $: xt = (/** @type {number} */ t) => (t / T) * iW;
  $: yv = (/** @type {number} */ c) => iH - ((Math.log10(Math.max(c, 1e-3)) - yBot) / (yTop - yBot)) * iH;
  /** @param {{t:number,C:number}[]} pts @returns {string} */
  const pathOf = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${xt(p.t).toFixed(1)},${yv(p.C).toFixed(1)}`).join(' ');
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>Dose (mg)</span><strong>{dose}</strong><input type="range" min="10" max="400" step="10" bind:value={dose} /></label>
    <div class="readout">
      <div><span>Demi-vie terminale</span><strong>{thalfEnd.toFixed(1)} j</strong></div>
      <div><span>Régime</span><strong>{dose >= 200 ? 'cible saturée (linéaire)' : 'cible active (rapide)'}</strong></div>
    </div>
    <p class="hint">À faible dose, la cible est <em>libre</em> : la voie cible domine → élimination rapide. À forte dose, la cible est <em>saturée</em> : il ne reste que le catabolisme lent → la pente terminale s'allonge, la clairance <em>diminue</em> quand la dose augmente.</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label="PK non linéaire (TMDD) en échelle log">
    <g transform={`translate(${m.left},${m.top})`}>
      {#each [-2, -1, 0, 1, 2, 3] as g}
        <line x1="0" x2={iW} y1={yv(Math.pow(10, g))} y2={yv(Math.pow(10, g))} class="grid" />
        <text x="-6" y={yv(Math.pow(10, g)) + 3} class="tick">10^{g}</text>
      {/each}
      <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      {#each curves as c}<path d={pathOf(c.pts)} class="ref" />{/each}
      <path d={pathOf(sel)} class="sel" />
      <text x={iW / 2} y={iH + 32} class="lbl">Temps (jours)</text>
      <text transform={`translate(-38,${iH / 2}) rotate(-90)`} class="lbl">Concentration (mg/L)</text>
      <g class="legend" transform={`translate(${iW - 150},2)`}>
        <rect x="0" y="0" width="12" height="3" class="sel" /><text x="18" y="4" class="leg">Dose choisie</text>
        <rect x="0" y="15" width="12" height="3" class="ref" /><text x="18" y="19" class="leg">30 / 100 / 300 mg</text>
      </g>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); --mab: #a06a2c; }
  @media (min-width: 720px) { .wrap { grid-template-columns: 215px 1fr; align-items: center; } }
  .controls { display: grid; gap: var(--space-2); }
  .readout, .s { font-family: var(--font-mono); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--mab); }
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
  .ref { fill: none; stroke: var(--text-muted); stroke-width: 1.3; opacity: 0.55; }
  .sel { fill: none; stroke: var(--mab); stroke-width: 2.6; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; text-anchor: middle; }
  .leg { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 10px; }
</style>
