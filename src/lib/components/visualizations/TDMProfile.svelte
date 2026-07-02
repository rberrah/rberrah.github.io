<script>
  // Precision dosing / TDM : à partir d'UNE concentration mesurée, on met à jour
  // (Bayes/MAP) la clairance individuelle → courbe IPRED (individuelle) vs PRED
  // (population, a priori). Cycle : Mesurer → Estimer → Ajuster.
  const V = 40; // L (fixé pour la démo)
  const CLpop = 5; // L/h (a priori population)
  const omega = 0.4; // écart-type a priori sur ln(CL)
  const sigma = 0.13; // erreur de mesure (log)
  const targetLo = 2, targetHi = 8; // fenêtre thérapeutique (mg/L)

  let dose = 300; // mg (bolus IV)
  let tObs = 6; // h — moment du prélèvement
  let cObs = 2.4; // mg/L — concentration mesurée

  const pred = (/** @type {number} */ t, /** @type {number} */ CL) => (dose / V) * Math.exp(-(CL / V) * t);

  // Estimation MAP de CL individuelle par recherche sur grille
  $: clInd = (() => {
    let best = CLpop, bestCost = Infinity;
    for (let CL = 1; CL <= 15; CL += 0.05) {
      const p = pred(tObs, CL);
      if (p <= 0) continue;
      const cost = ((Math.log(cObs) - Math.log(p)) / sigma) ** 2 + ((Math.log(CL) - Math.log(CLpop)) / omega) ** 2;
      if (cost < bestCost) { bestCost = cost; best = CL; }
    }
    return best;
  })();

  const W = 470, H = 300, m = { top: 16, right: 14, bottom: 40, left: 46 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  const tEnd = 24;
  $: cMax = Math.max((dose / V) * 1.1, targetHi * 1.2, cObs * 1.2);
  const xt = (/** @type {number} */ t) => (t / tEnd) * (W - m.left - m.right);
  $: yc = (/** @type {number} */ c) => iH - (Math.min(c, cMax) / cMax) * iH;

  const NP = 120;
  $: predPath = Array.from({ length: NP + 1 }, (_, i) => {
    const t = (i / NP) * tEnd;
    return `${i ? 'L' : 'M'}${xt(t).toFixed(1)},${yc(pred(t, CLpop)).toFixed(1)}`;
  }).join(' ');
  $: ipredPath = Array.from({ length: NP + 1 }, (_, i) => {
    const t = (i / NP) * tEnd;
    return `${i ? 'L' : 'M'}${xt(t).toFixed(1)},${yc(pred(t, clInd)).toFixed(1)}`;
  }).join(' ');

  $: verdict = clInd > CLpop * 1.15 ? 'élimine plus vite → envisager une dose plus élevée / rapprochée'
    : clInd < CLpop * 0.85 ? 'élimine plus lentement → envisager une dose plus basse / espacée'
    : 'proche du profil typique';
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>Dose (mg)</span><strong>{dose}</strong><input type="range" min="100" max="600" step="10" bind:value={dose} /></label>
    <label class="s"><span>Prélèvement t (h)</span><strong>{tObs.toFixed(1)}</strong><input type="range" min="0.5" max="18" step="0.5" bind:value={tObs} /></label>
    <label class="s"><span>Mesure (mg/L)</span><strong>{cObs.toFixed(1)}</strong><input type="range" min="0.3" max="12" step="0.1" bind:value={cObs} /></label>
    <div class="cycle"><span>Mesurer</span> → <span>Estimer</span> → <span>Ajuster</span></div>
    <div class="readout">
      <div><span>CL population</span><strong>{CLpop.toFixed(1)}</strong> L/h</div>
      <div><span>CL individuelle (EBE)</span><strong>{clInd.toFixed(2)}</strong> L/h</div>
    </div>
    <p class="hint">Le patient {verdict}.</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label="Profil TDM : population vs individuel">
    <g transform={`translate(${m.left},${m.top})`}>
      <!-- fenêtre thérapeutique -->
      <rect x="0" y={yc(targetHi)} width={iW} height={Math.max(0, yc(targetLo) - yc(targetHi))} class="target" />
      <text x={iW - 4} y={yc(targetHi) - 4} class="tlabel">fenêtre cible</text>
      <path d={predPath} class="pred" />
      <path d={ipredPath} class="ipred" />
      <line x1={xt(tObs)} x2={xt(tObs)} y1={yc(cObs)} y2={iH} class="obsguide" />
      <circle cx={xt(tObs)} cy={yc(cObs)} r="5" class="obs" />
      <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      <text x={iW / 2} y={iH + 32} class="lbl">Temps (h)</text>
      <text transform={`translate(-36,${iH / 2}) rotate(-90)`} class="lbl">Concentration (mg/L)</text>
      <g class="legend" transform="translate(6,2)">
        <rect x="0" y="0" width="14" height="3" class="pred" /><text x="20" y="4" class="leg">PRED (population)</text>
        <rect x="0" y="15" width="14" height="3" class="ipred" /><text x="20" y="19" class="leg">IPRED (individuel)</text>
        <circle cx="7" cy="32" r="4" class="obs" /><text x="20" y="35" class="leg">mesure</text>
      </g>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); }
  @media (min-width: 720px) { .wrap { grid-template-columns: 220px 1fr; align-items: center; } }
  .controls { display: grid; gap: var(--space-2); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-family: var(--font-mono); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--accent-pd); }
  .s input { grid-column: 1 / -1; }
  .cycle { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-muted); text-align: center; }
  .cycle span { color: var(--accent-pd); font-weight: 700; }
  .readout { display: grid; gap: 2px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-family: var(--font-mono); font-size: var(--text-xs); }
  .readout div { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .target { fill: color-mix(in srgb, var(--accent-pd) 12%, transparent); }
  .tlabel { fill: var(--accent-pd); font-family: var(--font-mono); font-size: 10px; text-anchor: end; }
  .pred { fill: none; stroke: var(--text-muted); stroke-width: 2; stroke-dasharray: 6 4; }
  .ipred { fill: none; stroke: var(--accent-pd); stroke-width: 3; stroke-linecap: round; }
  .obs { fill: var(--accent-pk); }
  .obsguide { stroke: var(--accent-pk); stroke-width: 1; stroke-dasharray: 2 3; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 12px; text-anchor: middle; }
  .leg { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 10px; }
</style>
