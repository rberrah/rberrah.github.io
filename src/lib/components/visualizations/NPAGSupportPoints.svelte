<script>
  import { language } from '#lib/stores/language.js';
  import {
    summarizeSupportPoints,
    supportPointMeanCurve,
    updateSupportPointWeights
  } from '#lib/science/visualizationMath.js';

  const populations = {
    unimodal: [
      { cl: 3.0, v: 30, weight: 0.12 }, { cl: 4.0, v: 35, weight: 0.22 },
      { cl: 5.0, v: 42, weight: 0.32 }, { cl: 6.2, v: 50, weight: 0.22 },
      { cl: 7.4, v: 58, weight: 0.12 }
    ],
    asymmetric: [
      { cl: 2.4, v: 25, weight: 0.08 }, { cl: 3.2, v: 31, weight: 0.24 },
      { cl: 4.1, v: 38, weight: 0.34 }, { cl: 5.4, v: 48, weight: 0.2 },
      { cl: 7.2, v: 61, weight: 0.1 }, { cl: 10.2, v: 76, weight: 0.04 }
    ],
    bimodal: [
      { cl: 2.5, v: 29, weight: 0.18 }, { cl: 3.2, v: 36, weight: 0.25 },
      { cl: 4.1, v: 42, weight: 0.12 }, { cl: 7.7, v: 46, weight: 0.13 },
      { cl: 9.0, v: 57, weight: 0.22 }, { cl: 10.0, v: 68, weight: 0.1 }
    ]
  };

  /** @type {'unimodal'|'asymmetric'|'bimodal'} */
  let population = 'bimodal';
  let includeObservation = false;
  let observed = 1.2;
  let showLognormal = false;
  let representation = 'discrete';

  const dose = 100;
  const sampleTime = 4;
  const times = Array.from({ length: 97 }, (_, index) => index / 4);
  const zPairs = [
    [-1.7, -0.7], [-1.4, 0.4], [-1.1, 1.2], [-0.8, -1.5], [-0.5, -0.1],
    [-0.3, 0.9], [0, -0.8], [0.2, 0.2], [0.4, 1.5], [0.7, -1.1],
    [0.9, 0.7], [1.1, -0.3], [1.35, 1.1], [1.6, 0.1]
  ];

  $: prior = populations[population];
  $: points = updateSupportPointWeights(prior, includeObservation ? Number(observed) : null, {
    dose,
    time: sampleTime,
    residualCv: 0.15
  });
  $: summary = summarizeSupportPoints(points);
  $: meanCurve = supportPointMeanCurve(points, times, dose);
  $: parameterMeanCurve = times.map((time) => ({
    time,
    concentration: (dose / summary.meanV) * Math.exp(-(summary.meanCl / summary.meanV) * time)
  }));
  $: modalCurve = times.map((time) => ({
    time,
    concentration: (dose / summary.modal.v) * Math.exp(-(summary.modal.cl / summary.modal.v) * time)
  }));
  $: parametricPoints = zPairs.map(([zCl, zV]) => ({
    cl: summary.meanCl * Math.exp(0.32 * zCl - 0.5 * 0.32 ** 2),
    v: summary.meanV * Math.exp(0.28 * zV - 0.5 * 0.28 ** 2)
  }));

  const scatter = { width: 470, height: 340, left: 50, right: 54, top: 36, bottom: 46 };
  /** @param {number} value */
  const sx = (value) => scatter.left + (value / 12) * (scatter.width - scatter.left - scatter.right);
  /** @param {number} value */
  const sy = (value) => scatter.height - scatter.bottom - ((value - 15) / 70) * (scatter.height - scatter.top - scatter.bottom);
  /** @param {number} weight */
  const radius = (weight) => 5 + Math.sqrt(weight) * 23;

  const curve = { width: 470, height: 340, left: 50, right: 18, top: 24, bottom: 46 };
  /** @param {number} value */
  const tx = (value) => curve.left + (value / 24) * (curve.width - curve.left - curve.right);
  $: curveMaximum = Math.max(...meanCurve.map((point) => point.concentration), ...parameterMeanCurve.map((point) => point.concentration)) * 1.08;
  /** @param {number} value */
  function cy(value) { return curve.height - curve.bottom - (value / curveMaximum) * (curve.height - curve.top - curve.bottom); }
  /** @param {{time:number,concentration:number}[]} series */
  function pathFor(series) { return series.map((point, index) => `${index ? 'L' : 'M'}${tx(point.time).toFixed(1)},${cy(point.concentration).toFixed(1)}`).join(' '); }
  $: observationMaximum = Math.max(...prior.map((point) => (dose / point.v) * Math.exp(-(point.cl / point.v) * sampleTime))) * 1.25;
</script>

<div class="npag-lab">
  <div class="toolbar">
    <label>
      <span>{$language === 'en' ? 'Synthetic support-point pattern' : 'Configuration synthétique des points'}</span>
      <select bind:value={population}>
        <option value="unimodal">{$language === 'en' ? 'One compact region' : 'Une région compacte'}</option>
        <option value="asymmetric">{$language === 'en' ? 'One skewed region' : 'Une région asymétrique'}</option>
        <option value="bimodal">{$language === 'en' ? 'Two separated regions' : 'Deux régions séparées'}</option>
      </select>
    </label>
    <label class="check"><input type="checkbox" bind:checked={showLognormal} /> {$language === 'en' ? 'Illustrative lognormal cloud' : 'Nuage log-normal illustratif'}</label>
    <label class="check"><input type="checkbox" bind:checked={includeObservation} /> {$language === 'en' ? 'Add one patient concentration' : 'Ajouter une concentration patient'}</label>
    {#if includeObservation}
      <label class="slider">
        <span>C({sampleTime} h) <strong>{Number(observed).toFixed(2)} mg/L</strong></span>
        <input type="range" min="0.15" max={observationMaximum} step="0.05" bind:value={observed} />
      </label>
    {/if}
    <div class="segmented" aria-label={$language === 'en' ? 'Distribution representation' : 'Représentation de la distribution'}>
      <button type="button" class:active={representation === 'discrete'} on:click={() => representation = 'discrete'}>{$language === 'en' ? 'Discrete points' : 'Points discrets'}</button>
      <button type="button" class:active={representation === 'local'} on:click={() => representation = 'local'}>{$language === 'en' ? 'Conceptual smoothing' : 'Lissage conceptuel'}</button>
    </div>
  </div>

  <div class="figures">
    <figure>
      <svg viewBox={`0 0 ${scatter.width} ${scatter.height}`} role="img" aria-label={$language === 'en' ? 'Weighted joint support points for clearance and volume' : 'Points de support joints pondérés de clairance et volume'}>
        <line x1={scatter.left} x2={scatter.width - scatter.right} y1={scatter.height - scatter.bottom} y2={scatter.height - scatter.bottom} class="axis" />
        <line x1={scatter.left} x2={scatter.left} y1={scatter.top} y2={scatter.height - scatter.bottom} class="axis" />
        {#each [0, 3, 6, 9, 12] as tick}
          <text x={sx(tick)} y={scatter.height - 25} class="tick">{tick}</text>
        {/each}
        {#each [20, 40, 60, 80] as tick}
          <text x={scatter.left - 10} y={sy(tick) + 4} class="tick end">{tick}</text>
        {/each}
        <text x={(scatter.left + scatter.width - scatter.right) / 2} y={scatter.height - 5} class="label">CL (L/h)</text>
        <text transform={`translate(14,${scatter.height / 2}) rotate(-90)`} class="label">V (L)</text>

        {#if showLognormal}
          {#each parametricPoints as point}
            <circle cx={sx(point.cl)} cy={sy(point.v)} r="3" class="parametric" />
          {/each}
        {/if}
        {#each points as point, index}
          {#if representation === 'local'}
            <ellipse cx={sx(point.cl)} cy={sy(point.v)} rx={radius(point.weight) + 12} ry={radius(point.weight) + 9} class="halo" />
          {/if}
          <circle cx={sx(point.cl)} cy={sy(point.v)} r={radius(point.weight)} class="support" class:modal={index === summary.modalIndex}>
            <title>CL {point.cl.toFixed(1)} L/h; V {point.v.toFixed(0)} L; w {(100 * point.weight).toFixed(1)}%</title>
          </circle>
          <text x={sx(point.cl)} y={sy(point.v) + 4} class="weight">{(100 * point.weight).toFixed(0)}%</text>
          <rect x={sx(point.cl) - 2} y={scatter.top - point.weight * 72} width="4" height={point.weight * 72} class="margin" />
          <rect x={scatter.width - scatter.right + 5} y={sy(point.v) - 2} width={point.weight * 72} height="4" class="margin" />
        {/each}
        <text x={scatter.left} y="14" class="caption">{$language === 'en' ? 'CL marginal mass' : 'Masse marginale CL'}</text>
        <text x={scatter.width - 4} y={scatter.top - 8} class="caption end">{$language === 'en' ? 'V marginal mass' : 'Masse marginale V'}</text>
      </svg>
      <figcaption>
        {#if representation === 'discrete'}
          {$language === 'en' ? 'NPAG estimates a discrete joint distribution: each circle is a complete CL–V vector and its area reflects its weight, a discrete probability mass.' : 'NPAG estime une distribution jointe discrète : chaque cercle est un vecteur CL–V complet et sa surface reflète son poids, une masse de probabilité discrète.'}
        {:else}
          {$language === 'en' ? 'The schematic halos illustrate the idea of local smoothing. No Pmetrics local-dispersion model is calculated, and this is not the original discrete NPAG distribution.' : "Les halos schématiques illustrent l'idée d'un lissage local. Aucun modèle quantitatif de dispersion locale Pmetrics n'est calculé, et il ne s'agit pas de la distribution NPAG discrète originale."}
        {/if}
      </figcaption>
    </figure>

    <figure>
      <svg viewBox={`0 0 ${curve.width} ${curve.height}`} role="img" aria-label={$language === 'en' ? 'Comparison of support-point prediction summaries' : 'Comparaison des résumés prédictifs des points de support'}>
        <line x1={curve.left} x2={curve.width - curve.right} y1={curve.height - curve.bottom} y2={curve.height - curve.bottom} class="axis" />
        <line x1={curve.left} x2={curve.left} y1={curve.top} y2={curve.height - curve.bottom} class="axis" />
        {#each [0, 6, 12, 18, 24] as tick}
          <text x={tx(tick)} y={curve.height - 25} class="tick">{tick}</text>
        {/each}
        <text x={(curve.left + curve.width - curve.right) / 2} y={curve.height - 5} class="label">{$language === 'en' ? 'Time (h)' : 'Temps (h)'}</text>
        <text transform={`translate(14,${curve.height / 2}) rotate(-90)`} class="label">Concentration (mg/L)</text>
        <path d={pathFor(meanCurve)} class="curve mean" />
        <path d={pathFor(parameterMeanCurve)} class="curve parameters" />
        <path d={pathFor(modalCurve)} class="curve mode" />
        {#if includeObservation}
          <circle cx={tx(sampleTime)} cy={cy(Number(observed))} r="5" class="observation" />
        {/if}
      </svg>
      <div class="legend">
        <span><i class="mean"></i>{includeObservation ? ($language === 'en' ? 'Posterior mean prediction' : 'Prédiction moyenne postérieure') : ($language === 'en' ? 'Population mean prediction' : 'Prédiction moyenne populationnelle')}</span>
        <span><i class="parameters"></i>{$language === 'en' ? 'Mean parameters' : 'Paramètres moyens'}</span>
        <span><i class="mode"></i>{$language === 'en' ? 'Highest-weight point' : 'Point de poids maximal'}</span>
      </div>
      <figcaption>{$language === 'en' ? 'Averaging curves, averaging parameters and selecting the highest-weight point are different summaries of the same distribution.' : 'Moyenner les courbes, moyenner les paramètres et choisir le point de poids maximal sont trois résumés différents de la même distribution.'}</figcaption>
    </figure>
  </div>

  <div class="readout">
    <span>{includeObservation ? ($language === 'en' ? 'Posterior mean' : 'Moyenne postérieure') : ($language === 'en' ? 'Population mean' : 'Moyenne populationnelle')} <strong>CL {summary.meanCl.toFixed(2)} L/h · V {summary.meanV.toFixed(1)} L</strong></span>
    <span>{$language === 'en' ? 'Highest-weight support point' : 'Point de support de poids maximal'} <strong>CL {summary.modal.cl.toFixed(1)} L/h · V {summary.modal.v.toFixed(0)} L · {(100 * summary.modal.weight).toFixed(0)}%</strong></span>
  </div>

  <p class="interpretation-note">
    {$language === 'en'
      ? 'These are synthetic teaching points, not points estimated from patient data. Separated regions do not establish clinical clusters or phenotypes. Adding one concentration applies a simplified Gaussian likelihood reweighting; it is not an NPAG refit or a call to PM_model$map().'
      : "Ces points sont synthétiques et pédagogiques ; ils ne sont pas estimés sur des patients. Des régions séparées ne démontrent ni clusters cliniques ni phénotypes. L'ajout d'une concentration applique une repondération simplifiée par vraisemblance gaussienne ; ce n'est ni un nouvel ajustement NPAG ni un appel à PM_model$map()."}
  </p>
</div>

<style>
  .npag-lab { display: grid; gap: var(--space-4); }
  .toolbar { display: flex; flex-wrap: wrap; align-items: end; gap: var(--space-3) var(--space-4); padding-bottom: var(--space-3); border-bottom: 1px solid var(--border); }
  label { display: grid; gap: 4px; color: var(--text-secondary); font-size: var(--text-sm); }
  select { min-width: 150px; }
  .check { display: flex; flex-direction: row; align-items: center; gap: var(--space-2); min-height: 38px; }
  .slider { flex: 1 1 230px; }
  .slider span { display: flex; justify-content: space-between; gap: var(--space-3); }
  .slider strong { color: var(--text-primary); font-family: var(--font-mono); }
  .segmented { display: flex; border: 1px solid var(--border-strong); border-radius: var(--radius); overflow: hidden; }
  .segmented button { border: 0; border-radius: 0; background: var(--bg-primary); color: var(--text-secondary); padding: 8px 10px; }
  .segmented button + button { border-left: 1px solid var(--border-strong); }
  .segmented button.active { background: var(--accent-pk); color: white; }
  .figures { display: grid; gap: var(--space-4); }
  @media (min-width: 900px) { .figures { grid-template-columns: 1fr 1fr; } }
  figure { min-width: 0; margin: 0; }
  svg { display: block; width: 100%; height: auto; }
  figcaption { margin-top: var(--space-2); color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .tick, .label, .caption, .weight { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; text-anchor: middle; }
  .tick.end, .caption.end { text-anchor: end; }
  .caption { font-size: 10px; text-anchor: start; }
  .support { fill: color-mix(in srgb, var(--accent-pk) 72%, transparent); stroke: var(--accent-pk); stroke-width: 2; }
  .support.modal { stroke: var(--text-primary); stroke-width: 3; }
  .weight { fill: white; font-size: 10px; pointer-events: none; }
  .margin { fill: var(--accent-pk); opacity: 0.65; }
  .parametric { fill: var(--text-muted); opacity: 0.55; }
  .halo { fill: color-mix(in srgb, var(--accent-pd) 12%, transparent); stroke: var(--accent-pd); stroke-width: 1; stroke-dasharray: 4 3; }
  .curve { fill: none; stroke-width: 2.6; }
  .curve.mean { stroke: var(--accent-pk); }
  .curve.parameters { stroke: var(--accent-pd); stroke-dasharray: 7 4; }
  .curve.mode { stroke: var(--text-secondary); stroke-dasharray: 2 4; }
  .observation { fill: var(--danger); stroke: white; stroke-width: 2; }
  .legend { display: flex; flex-wrap: wrap; gap: var(--space-2) var(--space-4); color: var(--text-secondary); font-size: var(--text-xs); }
  .legend span { display: inline-flex; align-items: center; gap: 6px; }
  .legend i { display: inline-block; width: 24px; border-top: 3px solid; }
  .legend i.mean { border-color: var(--accent-pk); }
  .legend i.parameters { border-color: var(--accent-pd); border-top-style: dashed; }
  .legend i.mode { border-color: var(--text-secondary); border-top-style: dotted; }
  .readout { display: flex; flex-wrap: wrap; justify-content: space-between; gap: var(--space-2) var(--space-4); padding-top: var(--space-3); border-top: 1px solid var(--border); color: var(--text-secondary); font-size: var(--text-sm); }
  .readout strong { color: var(--text-primary); font-family: var(--font-mono); }
  .interpretation-note { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.55; }
</style>
