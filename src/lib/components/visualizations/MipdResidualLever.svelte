<script>
  // @ts-nocheck
  // Le levier σ en MAPBE. L'estimation MAP arbitre entre le PRIOR (modèle de
  // population) et les DONNÉES (prélèvements du patient). Le poids des données
  // croît quand l'erreur résiduelle σ diminue. Curseurs : σ (RUV) et bruit de
  // mesure. On lit la courbe postérieure (compromis), l'AUC estimée et son écart
  // à la référence individuelle — et le risque de surajustement quand σ→0 sur des
  // données bruitées. Illustration pédagogique (pondération par précision).
  let sigma = 0.10;   // erreur résiduelle proportionnelle (RUV), fraction
  let bruit = 0.05;   // bruit de mesure des prélèvements, fraction

  // PK : absorption orale (Bateman). Le paramètre individuel varié = clairance CL.
  const Dose = 10, V = 30, ka = 1.2;
  const CLprior = 6.0;   // clairance TYPIQUE de la population (prior)
  const CLtrue = 3.0;    // vraie clairance de CE patient (référence, plus faible → exposition plus forte)
  const omega = 0.35;    // écart-type inter-individuel (prior) — fraction
  const nObs = 3;
  const tObs = [1, 3, 8];

  function makeRng(s) {
    let a = s >>> 0;
    return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  // écarts de mesure fixes (graine stable) — mis à l'échelle par `bruit`
  const noise0 = (() => { const r = makeRng(4242); return tObs.map(() => (r() - 0.5) * 2); })();

  const conc = (t, CL) => {
    const ke = CL / V;
    return (Dose * ka) / (V * (ka - ke)) * (Math.exp(-ke * t) - Math.exp(-ka * t));
  };

  // Les prélèvements observés : vraie courbe + bruit de mesure
  $: obs = tObs.map((t, i) => ({ t, c: Math.max(0, conc(t, CLtrue) * (1 + bruit * noise0[i])) }));
  // Clairance « impliquée par les données » (biaisée par le bruit moyen)
  $: meanNoise = (bruit * noise0.reduce((a, b) => a + b, 0)) / nObs;
  $: CLdata = CLtrue / (1 + meanNoise);
  // Pondération par précision : poids des données = 1 / (1 + (σ/ω)² / n)
  $: wData = 1 / (1 + (sigma / omega) ** 2 / nObs);
  // Clairance postérieure = compromis prior ↔ données
  $: CLpost = CLprior + wData * (CLdata - CLprior);

  // AUC = Dose / CL (analytique) ; écart à la référence individuelle
  $: aucPost = Dose / CLpost;
  $: aucRef = Dose / CLtrue;
  $: aucErr = (aucPost - aucRef) / aucRef * 100;
  $: overfit = bruit >= 0.15 && sigma <= 0.03;

  const W = 460, H = 250, m = { top: 14, right: 14, bottom: 34, left: 42 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  const Tmax = 14;
  $: Cmax = conc(1.0, CLtrue) * 1.35;
  $: xOf = (t) => (t / Tmax) * iW;
  $: yOf = (c) => iH - (c / Cmax) * iH;
  function curve(CL) {
    return Array.from({ length: 121 }, (_, i) => {
      const t = (i / 120) * Tmax;
      return `${i ? 'L' : 'M'}${xOf(t).toFixed(1)},${yOf(conc(t, CL)).toFixed(1)}`;
    }).join(' ');
  }
</script>

<div class="viz">
  <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Levier de l'erreur résiduelle en MAPBE">
    <g transform={`translate(${m.left},${m.top})`}>
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
      <path d={curve(CLprior)} class="prior" />
      <path d={curve(CLpost)} class="post" class:over={overfit} />
      {#each obs as o}
        <circle cx={xOf(o.t)} cy={yOf(o.c)} r="4" class="obs" />
      {/each}
      <text x={iW - 2} y={yOf(conc(2, CLprior)) - 4} class="lbl prior">prior (population)</text>
      <text x={iW - 2} y={yOf(conc(2, CLpost)) + 12} class="lbl post">postérieur</text>
      <text x={iW / 2} y={iH + 24} class="axlbl">temps (h)</text>
      <text transform={`translate(-30,${iH / 2}) rotate(-90)`} class="axlbl">concentration</text>
    </g>
  </svg>

  <div class="stats">
    <span class="pill w">poids sur les données : {(wData * 100).toFixed(0)} %</span>
    <span class="pill err" class:bad={Math.abs(aucErr) > 15}>écart AUC : {aucErr > 0 ? '+' : ''}{aucErr.toFixed(0)} %</span>
    {#if overfit}<span class="pill of">⚠ surajustement : le modèle suit le bruit</span>{/if}
  </div>

  <div class="controls">
    <label>Erreur résiduelle σ (RUV) <span>{(sigma * 100).toFixed(0)} %</span>
      <input type="range" min="0.01" max="0.5" step="0.01" bind:value={sigma} /></label>
    <label>Bruit de mesure des prélèvements <span>{(bruit * 100).toFixed(0)} %</span>
      <input type="range" min="0" max="0.25" step="0.01" bind:value={bruit} /></label>
  </div>
  <p class="hint">Baissez σ : le poids passe aux <strong>données</strong>, la courbe postérieure quitte le prior pour épouser les prélèvements du patient — l'AUC se rapproche de la vérité individuelle. Mais montez le <strong>bruit</strong> puis ramenez σ à 1 % : le modèle se met à <strong>poursuivre le bruit</strong> et l'AUC dérape. Tout l'art est de choisir un σ petit <em>mais non nul</em>.</p>
</div>

<style>
  .viz { border: 1px solid var(--border-subtle); border-radius: var(--radius, 8px); padding: var(--space-4); background: var(--bg-tertiary); }
  svg { width: 100%; height: auto; display: block; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .prior { fill: none; stroke: var(--text-muted); stroke-width: 2; stroke-dasharray: 5 3; }
  .post { fill: none; stroke: var(--accent-pk); stroke-width: 2.6; }
  .post.over { stroke: #c0392b; }
  .obs { fill: var(--accent-ai); stroke: var(--bg-tertiary); stroke-width: 1; }
  .lbl { font-size: 9px; font-family: var(--font-mono); text-anchor: end; }
  .lbl.prior { fill: var(--text-muted); }
  .lbl.post { fill: var(--accent-pk); }
  .axlbl { font-size: 10px; fill: var(--text-muted); text-anchor: middle; font-family: var(--font-mono); }
  .stats { display: flex; flex-wrap: wrap; gap: var(--space-2); justify-content: center; margin: var(--space-3) 0 var(--space-2); }
  .pill { font-family: var(--font-mono); font-size: var(--text-xs); padding: 3px 10px; border-radius: 999px; background: var(--bg-secondary); color: var(--text-secondary); }
  .pill.w { background: color-mix(in srgb, var(--accent-ai) 15%, var(--bg-primary)); color: var(--accent-ai); font-weight: 700; }
  .pill.err { background: color-mix(in srgb, var(--accent-pk) 15%, var(--bg-primary)); color: var(--accent-pk); font-weight: 700; }
  .pill.err.bad { background: color-mix(in srgb, #c0392b 15%, var(--bg-primary)); color: #c0392b; }
  .pill.of { background: color-mix(in srgb, #c0392b 15%, var(--bg-primary)); color: #c0392b; font-weight: 700; }
  .controls { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-2) var(--space-4); margin-top: var(--space-2); }
  label { font-size: var(--text-xs); color: var(--text-secondary); display: flex; flex-direction: column; gap: 2px; font-family: var(--font-mono); }
  label span { color: var(--accent-pk); font-weight: 700; }
  input[type=range] { width: 100%; accent-color: var(--accent-pk); }
  .hint { font-size: var(--text-xs); color: var(--text-muted); margin: var(--space-3) 0 0; text-align: center; line-height: 1.5; }
</style>
