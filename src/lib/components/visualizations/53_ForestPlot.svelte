<script>
  import { language } from '$lib/stores/language';
  // Forest plot des effets de covariables : chaque effet (ratio vs référence) avec son
  // IC 95 %. La ligne à 1 = pas d'effet ; la bande = zone « cliniquement non pertinente ».
  // Un effet est important s'il SORT de la bande ; il est incertain s'il CROISE 1.
  let bandPct = 20; // demi-largeur de la bande de non-pertinence (%)

  /** @type {{name:string, est:number, lo:number, hi:number}[]} */
  const effects = [
    { name: 'Poids 50 kg', est: 0.78, lo: 0.70, hi: 0.87 },
    { name: 'Poids 100 kg', est: 1.28, lo: 1.15, hi: 1.42 },
    { name: 'ClCr 30 mL/min', est: 0.62, lo: 0.54, hi: 0.71 },
    { name: 'ClCr 120 mL/min', est: 1.22, lo: 1.10, hi: 1.35 },
    { name: 'Âge 80 ans', est: 0.91, lo: 0.82, hi: 1.01 },
    { name: 'Génotype PM', est: 1.55, lo: 1.30, hi: 1.85 },
    { name: 'Sexe féminin', est: 1.05, lo: 0.96, hi: 1.15 }
  ];
  $: bLo = 1 - bandPct / 100;
  $: bHi = 1 + bandPct / 100;
  /** @param {{est:number,lo:number,hi:number}} e @returns {string} */
  function status(e) {
    if (e.lo <= 1 && e.hi >= 1) return 'incertain';
    if (e.est < bLo || e.est > bHi) return 'pertinent';
    return 'faible';
  }

  const W = 480, rowH = 30, m = { top: 16, right: 18, bottom: 34, left: 118 };
  $: H = m.top + m.bottom + effects.length * rowH;
  $: iW = W - m.left - m.right;
  const xLo = 0.4, xHi = 2.0;
  $: sx = (/** @type {number} */ v) => (Math.log(v / xLo) / Math.log(xHi / xLo)) * iW; // échelle log
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>{$language === 'en' ? 'No-effect zone' : 'Zone de non-pertinence'}</span><strong>±{bandPct}%</strong><input type="range" min="10" max="40" step="5" bind:value={bandPct} /></label>
    <div class="readout">
      <p><span class="dot pert"></span> {$language === 'en' ? 'relevant (outside band)' : 'pertinent (hors bande)'}</p>
      <p><span class="dot faible"></span> {$language === 'en' ? 'small effect' : 'effet faible'}</p>
      <p><span class="dot inc"></span> {$language === 'en' ? 'uncertain (crosses 1)' : 'incertain (croise 1)'}</p>
    </div>
    <p class="hint">{#if $language === 'en'}A covariate effect matters if it lies outside the clinically unimportant band <em>and</em> its 95% CI does not cross 1.{:else}Un effet de covariable compte s'il sort de la bande « sans conséquence clinique » <em>et</em> si son IC 95 % ne croise pas 1.{/if}</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label={$language === 'en' ? 'Forest plot of covariate effects' : 'Forest plot des effets de covariables'}>
    <g transform={`translate(${m.left},${m.top})`}>
      <rect x={sx(bLo)} y="0" width={sx(bHi) - sx(bLo)} height={effects.length * rowH} class="band" />
      <line x1={sx(1)} x2={sx(1)} y1="0" y2={effects.length * rowH} class="ref" />
      {#each [0.5, 1, 1.5, 2] as tick}
        <text x={sx(tick)} y={effects.length * rowH + 20} class="tick">×{tick}</text>
      {/each}
      {#each effects as e, i}
        {@const cy = i * rowH + rowH / 2}
        <text x="-10" y={cy + 3} class="name">{$language === 'en' ? e.name.replace('Poids', 'Weight').replace('Âge 80 ans', 'Age 80 years').replace('Génotype', 'Genotype').replace('Sexe féminin', 'Female sex') : e.name}</text>
        <line x1={sx(e.lo)} x2={sx(e.hi)} y1={cy} y2={cy} class="ci" />
        <circle cx={sx(e.est)} cy={cy} r="5"
          class:pert={status(e) === 'pertinent'} class:faible={status(e) === 'faible'} class:inc={status(e) === 'incertain'} />
      {/each}
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); --trials: #6a5a8c; }
  @media (min-width: 720px) { .wrap { grid-template-columns: 210px 1fr; align-items: center; } }
  /* Le panneau de chapitre fait ~610 px meme sur grand ecran : on interroge le CONTENEUR,
     pas la fenetre, sinon les controles ecrasent la figure. */
  @container (max-width: 700px) { .wrap { grid-template-columns: 1fr; align-items: stretch; } }
  .controls { display: grid; gap: var(--space-2); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-size: var(--text-sm); font-family: var(--font-mono); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--trials); }
  .s input { grid-column: 1 / -1; }
  .readout { display: grid; gap: 2px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-size: var(--text-xs); }
  .readout p { margin: 0; display: flex; align-items: center; gap: 6px; color: var(--text-secondary); }
  .dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
  .dot.pert { background: #b0392b; } .dot.faible { background: var(--text-muted); } .dot.inc { background: #c98a2e; }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .band { fill: var(--valid, #8a7d3a); opacity: 0.1; }
  .ref { stroke: var(--text-primary); stroke-width: 1.4; }
  .ci { stroke: var(--border-strong); stroke-width: 2; }
  .name { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 10px; text-anchor: end; }
  .tick { fill: var(--text-muted); font-family: var(--font-mono); font-size: 9px; text-anchor: middle; }
  circle.pert { fill: #b0392b; } circle.faible { fill: var(--text-muted); } circle.inc { fill: #c98a2e; }
</style>
