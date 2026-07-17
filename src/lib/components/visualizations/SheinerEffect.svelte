<script>
  // Modèle de Sheiner : compartiment d'effet relié au plasma par ke0.
  //   Cp(t) : concentration plasmatique (bolus IV)
  //   dCe/dt = ke0·(Cp − Ce) : concentration au site d'effet, en retard
  // Petit ke0 → gros retard et large hystérèse ; grand ke0 → Ce suit Cp.
  const C0 = 10, ke = 0.35, T = 24; // PK plasmatique fixe
  let ke0 = 0.4; // 1/h — vitesse d'équilibrage plasma ↔ site d'effet

  const cp = (/** @type {number} */ t) => C0 * Math.exp(-ke * t);

  $: sim = (() => {
    const dt = T / 1200;
    let Ce = 0;
    const pts = [{ t: 0, cp: C0, ce: 0 }];
    for (let s = 1; s <= 1200; s++) {
      const t = s * dt;
      const Cp = cp(t);
      Ce = Ce + ke0 * (Cp - Ce) * dt;
      pts.push({ t, cp: Cp, ce: Math.max(0, Ce) });
    }
    return pts;
  })();
  $: cePeak = sim.reduce((a, b) => (b.ce > a.ce ? b : a), sim[0]);
  $: thalfKe0 = Math.log(2) / ke0;

  // graphe temps
  const W = 300, H = 240, m = { top: 14, right: 12, bottom: 34, left: 34 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  const xt = (/** @type {number} */ t) => (t / T) * (W - m.left - m.right);
  $: yc = (/** @type {number} */ c) => iH - (c / (C0 * 1.05)) * iH;
  $: cpPath = sim.map((p, i) => `${i ? 'L' : 'M'}${xt(p.t).toFixed(1)},${yc(p.cp).toFixed(1)}`).join(' ');
  $: cePath = sim.map((p, i) => `${i ? 'L' : 'M'}${xt(p.t).toFixed(1)},${yc(p.ce).toFixed(1)}`).join(' ');

  // hystérèse Ce vs Cp
  const HW = 200, HH = 240, hm = { top: 14, right: 14, bottom: 34, left: 40 };
  $: hiW = HW - hm.left - hm.right;
  $: hiH = HH - hm.top - hm.bottom;
  const hx = (/** @type {number} */ c) => (c / (C0 * 1.05)) * (HW - hm.left - hm.right);
  $: hy = (/** @type {number} */ c) => hiH - (c / (C0 * 1.05)) * hiH;
  $: hystPath = sim.filter((_, i) => i % 6 === 0).map((p, i) => `${i ? 'L' : 'M'}${hx(p.cp).toFixed(1)},${hy(p.ce).toFixed(1)}`).join(' ');
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>ke0 (1/h)</span><strong>{ke0.toFixed(2)}</strong><input type="range" min="0.05" max="3" step="0.05" bind:value={ke0} /></label>
    <div class="readout">
      <div><span>t½ d'équilibrage</span><strong>{thalfKe0.toFixed(2)}</strong> h</div>
      <div><span>Pic Cp</span><strong>t = 0 h</strong></div>
      <div><span>Pic effet (Ce)</span><strong>t = {cePeak.t.toFixed(1)} h</strong></div>
    </div>
    <p class="hint">Le plasma pique à t=0, mais l'effet (site d'effet Ce) pique plus tard : le <em>délai</em> vient de ke0, pas de la PK. Cela crée l'<strong>hystérèse</strong> effet–concentration.</p>
  </div>

  <div class="stage">
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Concentration plasma et site d'effet">
      <g transform={`translate(${m.left},${m.top})`}>
        <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
        <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
        <path d={cpPath} class="cp" />
        <path d={cePath} class="ce" />
        <line x1={xt(cePeak.t)} x2={xt(cePeak.t)} y1={yc(cePeak.ce)} y2={iH} class="guide" />
        <text x={iW / 2} y={iH + 26} class="lbl">Temps (h)</text>
        <g transform="translate(4,2)">
          <rect x="0" y="0" width="12" height="3" class="cp" /><text x="16" y="4" class="leg">Cp (plasma)</text>
          <rect x="0" y="13" width="12" height="3" class="ce" /><text x="16" y="16" class="leg">Ce (effet)</text>
        </g>
      </g>
    </svg>

    <svg viewBox={`0 0 ${HW} ${HH}`} role="img" aria-label="Boucle d'hystérèse">
      <g transform={`translate(${hm.left},${hm.top})`}>
        <line x1="0" x2="0" y1="0" y2={hiH} class="axis" />
        <line x1="0" x2={hiW} y1={hiH} y2={hiH} class="axis" />
        <path d={hystPath} class="hyst" />
        <text x={hiW / 2} y={hiH + 26} class="lbl">Cp</text>
        <text transform={`translate(-28,${hiH / 2}) rotate(-90)`} class="lbl">Ce (effet)</text>
        <text x={hiW / 2} y={10} class="ann">hystérèse</text>
      </g>
    </svg>
  </div>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); }
  @media (min-width: 720px) { .wrap { grid-template-columns: 200px 1fr; align-items: center; } }
  /* Le panneau de chapitre fait ~610 px meme sur grand ecran : on interroge le CONTENEUR,
     pas la fenetre, sinon les controles ecrasent la figure. */
  @container (max-width: 700px) { .wrap { grid-template-columns: 1fr; align-items: stretch; } }
  .controls { display: grid; gap: var(--space-2); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-family: var(--font-mono); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--accent-pd); }
  .s input { grid-column: 1 / -1; }
  .readout { display: grid; gap: 2px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-family: var(--font-mono); font-size: var(--text-xs); }
  .readout div { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .stage { display: grid; grid-template-columns: 1fr; gap: var(--space-2); }
  @media (min-width: 520px) { .stage { grid-template-columns: 1.4fr 1fr; align-items: center; } }
  svg { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .cp { fill: none; stroke: var(--accent-pk); stroke-width: 2.5; }
  .ce { fill: none; stroke: var(--accent-pd); stroke-width: 2.5; }
  .hyst { fill: none; stroke: var(--accent-pd); stroke-width: 2; }
  .guide { stroke: var(--accent-pd); stroke-width: 1; stroke-dasharray: 2 3; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; text-anchor: middle; }
  .ann { fill: var(--text-muted); font-family: var(--font-mono); font-size: 10px; text-anchor: middle; }
  .leg { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 9px; }
</style>
