<script>
  import { scaleLinear, scaleLog } from 'd3-scale';
  import { line } from 'd3-shape';
  import { language } from '$lib/stores/language';
  import { workshopCurves } from '$lib/tdm/workshopCurves';
  let { view, config, computed = null } = $props();
  let concentration = $state(1);
  let width = $state(900);
  let plotWidth = $derived(width < 550 ? 245 : 430);
  let english = $derived($language === 'en');
  /** @param {string} fr @param {string} en */
  const t = (fr, en) => english ? en : fr;
  /** @type {Record<string, string>} */
  let titles = $derived({ ddi_relation: t('Relation a l’equilibre', 'Equilibrium relationship'), ddi_time: t('Installation et recuperation', 'Onset and recovery'),
    tumor_comparison: t('Croissance avec et sans traitement', 'Growth with and without treatment'),
    pd_relation: t('Effet selon la concentration E(C)', 'Effect versus concentration E(C)'), pd_time: t('Effet et concentration au cours du temps', 'Effect and concentration over time'),
    infection_exposure: t('Exposition a l’etat stationnaire', 'Steady-state exposure'), infection_pta: t('Probabilite d’atteinte de cible', 'Probability of target attainment') });
  /** @type {Record<string, string>} */
  let names = $derived({ equilibrium: t('Equilibre', 'Equilibrium'), reference: t('Sans interaction', 'No interaction'), interaction: t('Avec interaction', 'With interaction'),
    untreated: t('Sans traitement', 'Untreated'), treated: t('Avec traitement', 'Treated'), ce: 'Ce', response: 'E(t)', concentration: 'C(t)', trajectory: 'E(C)',
    mic_threshold: config.metric === 'time' ? t('k x CMI', 'k x MIC') : t('CMI', 'MIC'), example_exposure: t('Exemple de concentration', 'Example concentration'),
    exposure_current: `${t('Actuelle', 'Current')} · ${config.dose ?? ''} / ${config.interval ?? ''} h`, exposure_compare: `${t('Comparee', 'Compared')} · ${config.preview_regimen?.dose ?? ''} / ${config.preview_regimen?.interval ?? ''} h`,
    pta_current: `${t('Actuelle', 'Current')} · ${config.dose ?? ''} / ${config.interval ?? ''} h`, pta_compare: `${t('Comparee', 'Compared')} · ${config.preview_regimen?.dose ?? ''} / ${config.preview_regimen?.interval ?? ''} h` });
  const colors = ['var(--curve-primary)', 'var(--curve-secondary)'];
  /** @param {number} value */
  const number = (value) => Number(value.toPrecision(3)).toString();
  /** Keep logarithmic MIC labels readable, especially on narrow screens. */
  const ptaTicks = (/** @type {any} */ scale) => {
    const [lo, hi] = scale.domain();
    /** @type {number[]} */
    const values = [];
    for (let exponent = Math.ceil(Math.log2(lo)); exponent <= Math.floor(Math.log2(hi)); exponent += 1) values.push(2 ** exponent);
    const limit = width < 550 ? 4 : 7;
    if (values.length <= limit) return values;
    return [...new Set(Array.from({ length: limit }, (_, index) => values[Math.round(index * (values.length - 1) / (limit - 1))]))];
  };
  let charts = $derived.by(() => {
    try {
      const data = workshopCurves(view, config, concentration, computed);
      if (!Number.isFinite(concentration) || concentration < 0) return [];
      return data.map((chart) => {
        const points = chart.series.flatMap((series) => series.points);
        if (points.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y) || Math.abs(p.y) > 1e9)) throw new Error('Invalid preview');
        const x = chart.key === 'infection_pta'
          ? scaleLog().domain([Math.min(...points.map((p) => p.x)), Math.max(...points.map((p) => p.x))]).range([0, plotWidth])
          : scaleLinear().domain([0, Math.max(1e-6, ...points.map((p) => p.x))]).range([0, plotWidth]);
        const axis = (/** @type {string} */ side) => {
          const values = chart.series.filter(s => (s.axis ?? 'left') === side).flatMap(s => s.points.map(p => p.y));
          const lo = Math.min(0, ...values), hi = Math.max(1e-6, ...values);
          return scaleLinear().domain(chart.key === 'infection_pta' ? [0, 100] : [lo, hi + (hi - lo) * .08]).nice().range([230, 0]);
        };
        const y = axis('left'), yRight = axis('right');
        const xTicks = chart.key === 'infection_pta' ? ptaTicks(x) : x.ticks(width < 550 ? 3 : 5);
        return { ...chart, xLabel: chart.x, yLabel: chart.y, x, xTicks, y, yRight, series: chart.series.map((series) => ({ ...series,
          path: line().x((/** @type {any} */ p) => x(p.x)).y((/** @type {any} */ p) => (series.axis === 'right' ? yRight : y)(p.y))(/** @type {any} */ (series.points)) })) };
      });
    } catch { return []; }
  });
</script>

<section class="figures" bind:clientWidth={width} aria-label={t('Schemas et courbes pedagogiques', 'Teaching diagrams and curves')}>
  <div class="heading"><h2>{t('Lire le modele', 'Read the model')}</h2>
    {#if view === 'ddi'}<label>{t('Concentration d’illustration', 'Illustration concentration')}<input type="number" min="0" step="any" bind:value={concentration} /></label>{/if}
  </div>
  <p class="scope">{view === 'infection' ? (computed ? t('Resultats R : medianes des profils simules et PTA, selon la configuration calculee dans le moteur.', 'R results: median simulated profiles and PTA, using the configuration calculated in the engine.') : config.exposure === 'iv1' && config.source === 'pk' ? t('Modele IV 1 compartiment, a l’etat stationnaire. CL et V log-normaux independants, variances ETA = 0,09 (CV 30,7 %), sans erreur residuelle. Memes tirages pour les deux posologies. Exposition mediane et PTA Monte Carlo; parametres d’exemple, non valides pour une molecule.', 'Steady-state one-compartment IV model. Independent log-normal CL and V, ETA variances = 0.09 (CV 30.7%), without residual error. Both regimens use the same draws. Median exposure and Monte Carlo PTA; example parameters, not validated for a drug.') : t('Le modele choisi sera simule dans R. Les courbes d’exposition et de PTA reviendront ici apres calcul, sans substitution par une PK simplifiee.', 'The selected model will be simulated in R. Exposure and PTA curves return here after calculation, without substituting a simplified PK model.')) : view === 'ddi'
    ? t('Illustration analytique : C2 est maintenue constante entre le debut et l’arret, puis devient nulle. Ce n’est pas le profil PK de la molecule 2. Le moteur R utilise ses concentrations reelles simulees.', 'Analytical illustration: C2 is constant between start and stop, then zero. This is not the PK profile of drug 2. The R engine uses its actual simulated concentrations.')
    : view === 'onco' ? (computed ? t('Comparaison calculee dans R et renvoyee par le moteur : sans traitement et cycles de reference maintenus. Les parametres et covariables PK sont ceux du moteur.', 'Comparison computed in R and returned by the engine: untreated and maintained reference cycles. PK parameters and covariates are those of the engine.') : config.free_pk ? t('La courbe traitee sera renvoyee ici apres comparaison des cycles dans le moteur R. Aucun profil IV simplifie ne remplace votre PK libre.', 'The treated curve returns here after comparing cycles in the R engine. No simplified IV profile substitutes for your free PK.') : t('Apercu de la PK IV d’exemple : historique et cycles de reference, avec perte de sensibilite RES. Le calcul R reste la reference pour la reponse et les neutrophiles.', 'Built-in IV PK preview: history and reference cycles, including loss of sensitivity RES. R remains the reference calculation for response and neutrophils.'))
    : computed ? t('Simulation PK/PD renvoyee par R. E(C) suit la trajectoire temporelle, y compris l’hysteresis en presence de delai.', 'PK/PD simulation returned by R. E(C) follows the time trajectory, including hysteresis when a delay is present.') : config.exposure === 'iv1' ? t('PK IV selon CL, V et les doses saisies. La reponse depend de C(t), avec Ce(0)=0 et R(0)=E0 si ces etats sont actifs. E(C) suit la trajectoire temporelle, pas une relation d’equilibre imposee.', 'IV PK from CL, V and the entered doses. Response is driven by C(t), with Ce(0)=0 and R(0)=E0 when those states are active. E(C) follows the time trajectory, not an imposed equilibrium relationship.') : t('Ce modele mrgsolve ne peut pas etre execute dans le navigateur. Cliquez sur Ouvrir dans le moteur : R le compile, le simule automatiquement et renvoie les deux graphiques ici.', 'This mrgsolve model cannot run in the browser. Select Open in engine: R compiles and simulates it automatically, then returns both plots here.')}</p>
  {#if view === 'onco' && config.toxicity}
    <figure class="scheme"><figcaption>{t('Maturation hematologique et retrocontrole', 'Hematological maturation and feedback')}</figcaption>
      <svg class="desktop-scheme" viewBox="0 0 760 175" role="img" aria-label={t('Proliferation, trois transits, neutrophiles et retrocontrole', 'Proliferation, three transits, neutrophils and feedback')}>
        <defs><marker id="onco-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" /></marker></defs>
        {#each [0,1,2,3] as index}<path class="arrow" d={`M ${114 + index * 132} 86 H ${170 + index * 132}`} />{/each}
        <path class="feedback" d="M 608 112 V 145 H 76 V 112" />
        <text x="342" y="167" text-anchor="middle">(ANC0 / ANC)^gamma</text>
        {#each ['Prol', 'T1', 'T2', 'T3', 'ANC'] as label,index}
          <rect x={38 + index * 132} y="57" width="76" height="55" rx="4" class:anc={index === 4} />
          <text x={76 + index * 132} y="89" text-anchor="middle">{label}</text>
        {/each}
        <path class="inhibit" d="M 76 22 V 51 M 62 51 H 90" /><text x="102" y="27">{t('Concentration : inhibition de la proliferation', 'Concentration: inhibit proliferation')}</text>
        <text x="664" y="70">ktr</text><text x="642" y="95">= 4 / MTT</text>
      </svg>
      <svg class="mobile-scheme" viewBox="0 0 330 485" role="img" aria-label={t('Maturation hematologique avec retrocontrole ANC', 'Hematological maturation with ANC feedback')}>
        <defs><marker id="onco-mobile-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" /></marker></defs>
        {#each [0,1,2,3] as index}<path class="arrow" d={`M 155 ${108 + index * 80} V ${140 + index * 80}`} />{/each}
        <path class="feedback" d="M 230 404 H 290 V 84 H 230" />
        {#each ['Prol', 'T1', 'T2', 'T3', 'ANC'] as label,index}
          <rect x="80" y={60 + index * 80} width="150" height="48" rx="4" class:anc={index === 4} />
          <text x="155" y={89 + index * 80} text-anchor="middle">{label}</text>
        {/each}
        <path class="inhibit" d="M 25 84 H 74 M 74 72 V 96" />
        <text x="155" y="25" text-anchor="middle">{t('C inhibe la proliferation', 'C inhibits proliferation')}</text>
        <text x="165" y="451" text-anchor="middle">ktr = 4 / MTT</text>
        <text x="165" y="477" text-anchor="middle">(ANC0 / ANC)^gamma</text>
      </svg>
    </figure>
  {/if}
  {#if charts.length}
    <div class="chart-grid" class:single={charts.length === 1 || view === 'pd'}>{#each charts as chart}
      <figure><figcaption>{titles[chart.key]}</figcaption>
        <svg viewBox={`0 0 ${plotWidth + (chart.y2 ? 160 : 95)} 310`} role="img" aria-label={titles[chart.key]} data-testid={`curve-${chart.key}`}>
          <g transform="translate(72,22)">
            {#each chart.y.ticks(4) as tick}<line class="grid" x1="0" x2={plotWidth} y1={chart.y(tick)} y2={chart.y(tick)} /><text x="-10" y={chart.y(tick) + 4} text-anchor="end">{number(tick)}</text>{/each}
            {#if chart.y2}<g class="right-axis" data-testid="right-axis">{#each chart.yRight.ticks(4) as tick}<text x={plotWidth + 10} y={chart.yRight(tick) + 4}>{number(tick)}</text>{/each}<text transform={`translate(${plotWidth + 62},115) rotate(90)`} text-anchor="middle">{chart.y2}</text></g>{/if}
            {#each chart.xTicks as tick}<text class="x-tick" x={chart.x(tick)} y="252" text-anchor="middle">{number(tick)}</text>{/each}
            {#if chart.key === 'infection_pta'}<line class="target" x1="0" x2={plotWidth} y1={chart.y(config.pta_target)} y2={chart.y(config.pta_target)}/>{/if}
            {#each chart.series as series,index}<path class="curve" d={series.path} stroke={colors[index]} stroke-dasharray={series.key === 'untreated' || series.key === 'concentration' || view !== 'pd' && chart.series.length > 1 && index === 0 ? '7 5' : undefined} data-series={series.key} />{/each}
            <text x={plotWidth / 2} y="278" text-anchor="middle">{chart.xLabel === 'day' ? t('Jour', 'Day') : chart.xLabel === 'MIC (mg/L)' ? t('CMI (mg/L)', 'MIC (mg/L)') : chart.xLabel}</text>
            <text transform="translate(-52,115) rotate(-90)" text-anchor="middle">{chart.yLabel === '1/day' ? t('1/jour', '1/day') : chart.yLabel === 'C free (mg/L)' ? t('C libre (mg/L)', 'Unbound C (mg/L)') : chart.yLabel}</text>
          </g>
        </svg>
        <div class="legend" class:pta-legend={chart.key === 'infection_pta'}>{#each chart.series as series,index}<span><i style={`border-color:${colors[index]};border-top-style:${series.key === 'untreated' || series.key === 'concentration' || view !== 'pd' && chart.series.length > 1 && index === 0 ? 'dashed' : 'solid'}`}></i>{names[series.key]}</span>{/each}{#if chart.key === 'infection_pta'}<span><i class="target-key"></i>{t('Seuil PTA', 'PTA threshold')} · {config.pta_target}%</span>{/if}</div>
      </figure>
    {/each}</div>
  {:else}<p role="status">{!computed && view === 'pd' && config.exposure !== 'iv1' ? t('Ouvrez le moteur pour compiler et simuler automatiquement ce modele.', 'Open the engine to compile and simulate this model automatically.') : !computed && view === 'infection' && (config.source !== 'pk' || config.exposure !== 'iv1') ? t('En attente de la simulation du modele dans R.', 'Waiting for the model simulation in R.') : t('Valeurs hors du domaine de cet apercu; verifiez les parametres ou utilisez le moteur R.', 'Values outside this preview domain; check parameters or use the R engine.')}</p>{/if}
</section>

<style>
  .figures { --curve-primary: #a64430; --curve-secondary: #087b70; margin: 28px 0; padding: 20px 0; border-block: 1px solid var(--border-subtle); min-width: 0; scroll-margin-top: calc(var(--header-h) + 16px); }
  :global(:root[data-theme='dark']) .figures { --curve-primary: #f19c7f; --curve-secondary: #69cfb6; }
  @media (prefers-color-scheme: dark) { :global(:root:not([data-theme='light'])) .figures { --curve-primary: #f19c7f; --curve-secondary: #69cfb6; } }
  .heading { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
  h2 { font-size: 1.3rem; margin: 0; letter-spacing: 0; } label { font-size: 0.8rem; display: flex; align-items: center; gap: 12px; }
  input { width: 90px; min-width: 0; padding: 7px; font: inherit; color: var(--text-primary); background: var(--bg-tertiary); border: 1px solid var(--border-strong); border-radius: 4px; }
  .scope { font-size: 0.85rem; color: var(--text-secondary); max-width: 110ch; }
  .chart-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 28px; }
  .chart-grid.single { grid-template-columns: minmax(0,1fr); max-width: 900px; margin: 0 auto; }
  figure { margin: 0; min-width: 0; } figcaption { font-size: 0.9rem; font-weight: 600; margin: 8px 0; }
  svg { display: block; width: 100%; height: auto; overflow: visible; color: var(--text-primary); }
  text { font: 12px var(--font-body); fill: var(--text-secondary); } .grid { stroke: var(--border-subtle); }
  .curve { fill: none; stroke-width: 2.5; vector-effect: non-scaling-stroke; }
  .right-axis text { fill: var(--curve-secondary); } .target { stroke: var(--text-secondary); stroke-dasharray: 2 4; }
  .legend { display: flex; flex-wrap: wrap; gap: 8px 20px; font-size: 0.8rem; }
  .legend span { display: inline-flex; align-items: flex-start; gap: 6px; min-width: 0; overflow-wrap: anywhere; } .legend i { display: inline-block; width: 24px; flex: 0 0 24px; margin-top: .45em; border-top: 3px solid; }
  .legend.pta-legend { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); align-items:start; } .legend .target-key { border-color:var(--text-secondary); border-top-style:dotted; }
  .scheme { max-width: 850px; margin: 20px auto 26px; } .scheme rect { fill: var(--bg-tertiary); stroke: var(--curve-primary); stroke-width: 2; } .scheme rect.anc { stroke: var(--curve-secondary); }
  .arrow, .feedback { stroke: currentColor; stroke-width: 2; fill: none; marker-end: url(#onco-arrow); } .feedback { stroke: var(--curve-secondary); stroke-dasharray: 6 4; }
  .inhibit { stroke: var(--curve-primary); stroke-width: 2; fill: none; } .scheme text { font-size: 14px; }
  .mobile-scheme { display: none; }
  .mobile-scheme .arrow, .mobile-scheme .feedback { marker-end: url(#onco-mobile-arrow); }
  @media (max-width: 760px) { .chart-grid { grid-template-columns: 1fr; gap: 24px; } .legend.pta-legend { grid-template-columns:1fr; } .desktop-scheme { display: none; } .mobile-scheme { display: block; max-width: 370px; margin: 0 auto; } }
</style>
