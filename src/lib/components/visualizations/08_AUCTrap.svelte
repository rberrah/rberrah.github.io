<script>
  // NCA : aire sous la courbe (AUC) par la méthode des trapèzes.
  // On échantillonne une vraie courbe orale ; l'AUC des trapèzes dépend de la
  // densité de prélèvements. Extrapolation de la queue : + Clast / λz.
  import { aucTrap } from '$lib/utils/math';

  // Vraie courbe (Bateman orale) : C(t) = A·(e^-ke·t − e^-ka·t)
  const A = 12, ke = 0.25, ka = 1.1;
  /** @param {number} t */
  const trueC = (t) => A * (Math.exp(-ke * t) - Math.exp(-ka * t));
  const aucTrueInf = A * (1 / ke - 1 / ka); // AUC 0→∞ analytique

  const schemes = {
    riche: [0, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12],
    pauvre: [0, 1, 3, 6, 12],
    'tres-pauvre': [0, 2, 8]
  };
  let scheme = 'riche';
  let extrapolate = true;

  $: times = schemes[/** @type {keyof typeof schemes} */ (scheme)];
  $: pts = times.map((/** @type {number} */ t) => ({ t, c: trueC(t) }));
  $: aucObs = aucTrap(pts);
  $: clast = pts[pts.length - 1].c;
  $: tail = clast / ke; // AUC_last→∞ = Clast/λz
  $: aucTot = extrapolate ? aucObs + tail : aucObs;
  $: errPct = ((aucTot - aucTrueInf) / aucTrueInf) * 100;

  const W = 460, H = 300, m = { top: 18, right: 16, bottom: 44, left: 52 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  const tEnd = 14;
  $: cMax = A * 0.75;
  /** @param {number} t */
  const xt = (t) => (t / tEnd) * iW;
  /** @param {number} c */
  const yc = (c) => iH - (Math.min(c, cMax) / cMax) * iH;

  const NP = 160;
  $: truePath = Array.from({ length: NP + 1 }, (_, i) => {
    const t = (i / NP) * tEnd;
    return `${i ? 'L' : 'M'}${xt(t).toFixed(1)},${yc(trueC(t)).toFixed(1)}`;
  }).join(' ');
</script>

<div class="wrap">
  <div class="controls">
    <div class="seg">
      <button class:on={scheme === 'riche'} on:click={() => (scheme = 'riche')}>Riche (10 pts)</button>
      <button class:on={scheme === 'pauvre'} on:click={() => (scheme = 'pauvre')}>Pauvre (5)</button>
      <button class:on={scheme === 'tres-pauvre'} on:click={() => (scheme = 'tres-pauvre')}>Très pauvre (3)</button>
    </div>
    <label class="chk"><input type="checkbox" bind:checked={extrapolate} /> Extrapoler la queue (+ Clast/λz)</label>
    <div class="readout">
      <div><span>AUC trapèzes</span><strong>{aucObs.toFixed(1)}</strong></div>
      {#if extrapolate}<div><span>+ queue Clast/λz</span><strong>{tail.toFixed(1)}</strong></div>{/if}
      <div><span>AUC totale</span><strong>{aucTot.toFixed(1)}</strong></div>
      <div class="vrai"><span>AUC vraie (0→∞)</span><strong>{aucTrueInf.toFixed(1)}</strong></div>
      <div class:bad={Math.abs(errPct) > 5}><span>Écart</span><strong>{errPct >= 0 ? '+' : ''}{errPct.toFixed(1)} %</strong></div>
    </div>
    <p class="hint">Moins de points ⇒ les trapèzes recoupent moins bien la courbe : l'AUC dérive. La NCA est robuste mais <em>descriptive</em>.</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label="AUC par la méthode des trapèzes">
    <g transform={`translate(${m.left},${m.top})`}>
      <!-- trapèzes -->
      {#each pts.slice(1) as p, i}
        {@const p0 = pts[i]}
        <polygon
          points={`${xt(p0.t)},${yc(0)} ${xt(p0.t)},${yc(p0.c)} ${xt(p.t)},${yc(p.c)} ${xt(p.t)},${yc(0)}`}
          class="trap"
        />
      {/each}
      <!-- queue extrapolée -->
      {#if extrapolate}
        {@const last = pts[pts.length - 1]}
        <polygon points={`${xt(last.t)},${yc(0)} ${xt(last.t)},${yc(last.c)} ${xt(tEnd)},${yc(0)}`} class="tail" />
      {/if}
      <!-- vraie courbe -->
      <path d={truePath} class="cline" />
      {#each pts as p}
        <circle cx={xt(p.t)} cy={yc(p.c)} r="4" class="dot" />
      {/each}
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
  /* Le panneau de chapitre fait ~610 px meme sur grand ecran : on interroge le CONTENEUR,
     pas la fenetre, sinon les controles ecrasent la figure. */
  @container (max-width: 700px) { .wrap { grid-template-columns: 1fr; align-items: stretch; } }
  .controls { display: grid; gap: var(--space-2); }
  .seg { display: flex; flex-direction: column; gap: 4px; }
  .seg button { font-family: var(--font-mono); font-size: var(--text-xs); padding: 4px 8px; border: 1px solid var(--border-strong); background: var(--bg-tertiary); border-radius: var(--radius); cursor: pointer; text-align: left; }
  .seg button.on { background: var(--text-primary); color: var(--bg-primary); border-color: var(--text-primary); }
  .chk { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-secondary); display: flex; gap: 6px; align-items: center; }
  .readout { display: grid; gap: 2px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-family: var(--font-mono); font-size: var(--text-xs); }
  .readout div { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
  .readout .vrai strong { color: var(--accent-pd); }
  .readout .bad strong { color: var(--accent-pk); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .cline { fill: none; stroke: var(--accent-pd); stroke-width: 2.5; stroke-linecap: round; }
  .trap { fill: color-mix(in srgb, var(--accent-pk) 16%, transparent); stroke: var(--accent-pk); stroke-width: 1; }
  .tail { fill: color-mix(in srgb, var(--accent-pk) 8%, transparent); stroke: var(--accent-pk); stroke-width: 1; stroke-dasharray: 3 3; }
  .dot { fill: var(--accent-pk); }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 12px; text-anchor: middle; }
</style>
