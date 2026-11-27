<script>
  import {language} from '#lib/stores/language.js';
  import {incidentProfiles} from '#lib/sim/doseIncidentEducation.js';
  /** @type {'adherence'|'vomiting'} */
  export let initialScenario='adherence';
  let scenario=initialScenario;
  let tau=12,delayPct=35,vomitPct=10,ka=1,popHalfLife=8,trueHalfLife=8,parts=10,loss=1,trialFraction=.5,window=0,showAlternative=true;
  $: en=$language==='en';
  $: t=en?(/** @type {string} */ fr,/** @type {string} */ eng)=>eng:(/** @type {string} */ fr,/** @type {string} */ eng)=>fr;
  $: delay=tau*(scenario==='adherence'?delayPct:vomitPct)/100;
  $: data=incidentProfiles({scenario,tau,delay,ka,popHalfLife,trueHalfLife,parts,loss,trialFraction});
  $: showFull=showAlternative&&(scenario==='vomiting'?trialFraction!==1:delay<tau);
  $: ymax=Math.max(.01,...data.points.map(p=>Math.max(p.reference,p.incident,p.corrected,showFull?p.alternative:0)))*1.1;
  $: x=(/** @type {number} */ value)=>48+(value+tau)/(3*tau)*440;
  $: y=(/** @type {number} */ value)=>204-value/ymax*184;
  $: series=[
    {key:'reference',label:t('Référence','Reference'),style:'ref'},
    {key:'incident',label:t('Incident sans compensation','Incident without compensation'),style:'incident'},
    {key:'corrected',label:scenario==='adherence'?t('Règle publiée, arrondie','Published rule, rounded'):t('Compensation testée','Tested compensation'),style:'candidate'},
    ...(showFull?[{key:'alternative',label:t('Comparaison : entrée complète','Comparison: full input'),style:'alt'}]:[])
  ];
  $: fmt=new Intl.NumberFormat(en?'en':'fr',{maximumFractionDigits:2});
  const percent=(/** @type {number} */ n)=>Math.round(n*1000)/10;
</script>
<section class="dose-incidents" data-testid="dose-incidents">
  <p class="notice">{t('Expérience fictive : état stationnaire, modèle oral linéaire à un compartiment, F = 1 et D/V = 1. Aucun médicament ou patient réel.','Fictional experiment: steady state, linear oral one-compartment model, F = 1 and D/V = 1. No actual drug or patient.')}</p>
  <div class="controls">
    <label>{t('Incident','Incident')}<select bind:value={scenario} data-testid="incident-type"><option value="adherence">{t('Retard ou oubli','Delayed or missed intake')}</option><option value="vomiting">{t('Vomissement','Vomiting')}</option></select></label>
    <label>τ (h) · {tau}<input type="range" min="8" max="24" step="4" bind:value={tau}/></label>
    <label>Ka (h⁻¹) · {fmt.format(ka)}<input type="range" min=".05" max="3" step=".05" bind:value={ka}/></label>
    <label>{t('Demi-vie réelle simulée','Simulated true half-life')} · {fmt.format(trueHalfLife)} h<input type="range" min="1" max="24" step=".5" bind:value={trueHalfLife}/></label>
    {#if scenario==='adherence'}
      <label>{t('Retard','Delay')} · {delayPct}% τ ({fmt.format(delay)} h)<input data-testid="incident-delay" type="range" min="0" max="100" step="5" bind:value={delayPct}/></label>
      <label>{t('Demi-vie populationnelle','Population half-life')} · {fmt.format(popHalfLife)} h<input type="range" min="1" max="24" step=".5" bind:value={popHalfLife}/></label>
      <label>{t('Granularité fictive','Fictional granularity')}<select bind:value={parts}><option value={2}>1/2 D</option><option value={10}>1/10 D</option><option value={20}>1/20 D</option></select></label>
    {:else}
      <label>{t('Délai du vomissement','Vomiting delay')} · {fmt.format(delay)} h<input type="range" min="0" max="50" step="5" bind:value={vomitPct}/></label>
      <label>{t('Fraction du dépôt perdue (supposée)','Fraction of depot lost (assumed)')} · {percent(loss)}%<input type="range" min="0" max="1" step=".05" bind:value={loss}/></label>
      <label>{t('Entrée compensatoire à tester','Compensating input to test')}<select bind:value={trialFraction}><option value={0}>0 D</option><option value={.5}>0.5 D</option><option value={1}>1 D</option></select></label>
    {/if}
  </div>
  {#if scenario==='adherence'}
    <div class="rule" data-testid="published-rule">
      <h3>{t('Du raisonnement PK à la règle publiée','From PK reasoning to the published rule')}</h3>
      <p>M = 2<sup>−d/t½</sup> ; S = (1 − 2<sup>−(τ−d)/t½</sup>) / (1 − 2<sup>−τ/t½</sup>)</p>
      <div class="rule-grid">
        {#each [{label:'M',value:data.rule.M,description:t('Fraction résiduelle théorique','Theoretical remaining fraction')},{label:'S',value:data.rule.S,description:t('Terme lié à l’intervalle restant','Remaining-interval term')}] as item}
          <div><strong>{item.label} = {fmt.format(item.value)}</strong><small>{item.description}</small><div class="track" aria-hidden="true"><span style:width={100*item.value+'%'}></span></div></div>
        {/each}
      </div>
      <p>{t('Maximum avant arrondi','Maximum before rounding')} : {fmt.format(data.rule.exact)} D · {t('Après arrondi inférieur','After rounding down')} : <strong>{fmt.format(data.rule.rounded)} D</strong></p>
      {#if delayPct===100}<p>{t('Oubli complet : la fraction simulée s’ajoute à l’entrée planifiée à τ.','Complete omission: the simulated fraction is added to the scheduled input at τ.')}</p>{/if}
      <p>{t('Les deux termes sont des approximations, pas des garanties de sécurité. La demi-vie individuelle peut différer de la valeur populationnelle.','Both terms are approximations, not safety guarantees. Individual half-life may differ from the population value.')}</p>
    </div>
  {:else}
    <div class="rule"><h3>{t('Que reste-t-il dans le dépôt ?','What remains in the depot?')}</h3><p>{t('Quantité totale encore absorbable, y compris les prises précédentes :','Total remaining absorbable amount, including previous intakes:')} {fmt.format(data.depot)} D. {t('Perte supposée :','Assumed loss:')} {fmt.format(data.removed)} D.</p><p>{t('La perte réelle est inconnue ; comparez les scénarios, sans déduire une dose à prendre.','True loss is unknown; compare scenarios without inferring an amount to take.')}</p></div>
  {/if}
  <label class="check"><input type="checkbox" bind:checked={showAlternative}/>{t('Afficher la comparaison avec une entrée complète','Show the full-input comparison')}</label>
  <figure>
    <svg viewBox="0 0 510 248" role="img" aria-label={t('Concentrations normalisées avant et après l’incident','Normalized concentrations before and after the incident')}>
      {#each [0,.25,.5,.75,1] as q}<line x1="48" x2="488" y1={y(q*ymax)} y2={y(q*ymax)} class="gridline"/><text x="43" y={y(q*ymax)+4} text-anchor="end">{fmt.format(q*ymax)}</text>{/each}
      {#each [-tau,0,tau,2*tau] as tick}<line x1={x(tick)} x2={x(tick)} y1="20" y2="204" class="gridline"/><text x={x(tick)} y="222" text-anchor="middle">{tick}</text>{/each}
      <path d="M48 20 V204 H488" class="axis"/>
      <line x1={x(data.removalTime)} x2={x(data.removalTime)} y1="20" y2="204" class="marker"/>
      <line x1={x(delay)} x2={x(delay)} y1="20" y2="204" class="marker delayed"/>
      {#each series as item}<polyline class={item.style} points={data.points.map(p=>x(p.t)+','+y(p[/** @type {'reference'|'incident'|'corrected'|'alternative'} */(item.key)])).join(' ')}/>{/each}
      <text x="270" y="243" text-anchor="middle">{t('Temps (h)','Time (h)')}</text><text x="13" y="112" text-anchor="middle" transform="rotate(-90 13 112)">C / (D/V)</text>
    </svg>
    <figcaption class="legend">{#each series as item}<span><i class={item.style}></i>{item.label}</span>{/each}</figcaption>
  </figure>
  <label class="window">{t('Intervalle comparé','Comparison interval')}<select bind:value={window}><option value={0}>0–τ</option><option value={1}>τ–2τ</option></select></label>
  <table><caption>{t('Rapports à la référence simulée (%)','Ratios to simulated reference (%)')}</caption><thead><tr><th scope="col">{t('Scénario','Scenario')}</th><th scope="col">AUC</th><th scope="col">Cmax</th><th scope="col">{t('C fin','End C')}</th></tr></thead><tbody>
  {#each series as item}
    {@const m=data.metrics[window][item.key]}
    {@const ref=data.metrics[window].reference}
    <tr><th scope="row">{item.label}</th><td>{fmt.format(percent(m.auc/ref.auc))}</td><td>{fmt.format(percent(m.cmax/ref.cmax))}</td><td>{fmt.format(percent(m.end/ref.end))}</td></tr>
  {/each}</tbody></table>
  <p>{t('AUC intégrée numériquement et pic échantillonné. Ces intervalles sont pédagogiques et ne reproduisent pas les critères cliniques de l’étude.','Numerically integrated AUC and sampled peak. These teaching intervals do not reproduce the study’s clinical criteria.')}</p>
  <aside class="notice">
    <h3>{t('La solution pharmacométrique','The pharmacometric solution')}</h3>
    {#if scenario==='adherence'}
      <p>{t('L’étude présente une règle graduée fondée sur la demi-vie, le délai et l’intervalle. Elle compare la récupération d’exposition et les pics dans des populations simulées.','The study presents a graded rule based on half-life, delay and dosing interval. It compares exposure recovery and peaks in simulated populations.')}</p>
      <p><a href={'https://rberrah.github.io/communications/'+(en?'':'fr/')+'missed-dose-iatdmct-sfpt-2026/'}>{t('Communication IATDMCT/SFPT 2026','IATDMCT/SFPT 2026 presentation')}</a> · <a href="https://tdmhub.shinyapps.io/MissedDoseApp/">{t('Application de recherche MissedDose','MissedDose research application')}</a></p>
    {:else}
      <p>{t('La communication de 2025 évalue la perte du dépôt et plusieurs compensations avec un modèle PopPK à l’état stationnaire. L’approche d’individualisation envisagée utilise les concentrations résiduelles récentes pour estimer les paramètres PK.','The 2025 communication evaluates depot loss and several compensations using a steady-state population PK model. The intended individualization approach uses recent trough measurements to estimate PK parameters.')}</p>
      <p><a href="https://www.iatdmct2025.org/wp-content/uploads/2025/09/IATDMCT2025-Abstract-book-2.pdf#page=35">{t('Résumé scientifique public, p. 226','Public scientific abstract, p. 226')}</a></p>
    {/if}
    <p>{t('Ce module n’est pas une reproduction du code des applications ni un outil de décision médicale. Aucun conseil individuel ; validation clinique prospective non établie.','This module does not reproduce the application code and is not a medical decision tool. No individual advice; prospective clinical validation not established.')}</p>
  </aside>
</section>
<style>
.dose-incidents{display:grid;gap:.8rem;min-width:0;font-size:.95rem;overflow-wrap:anywhere}
.controls{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,170px),1fr));gap:.9rem}
.controls label,.window{display:grid;gap:.3rem}
.controls select,.window select{min-height:44px;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border-strong);font:inherit;max-width:100%}
.controls input[type="range"]{min-height:24px}
.check{display:flex;align-items:center;gap:.5rem;min-height:44px}
.rule,.notice{padding:.8rem;border:1px solid var(--border-strong);border-radius:var(--radius);background:var(--bg-secondary)}
.rule-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem}
.rule-grid small{display:block;color:var(--text-secondary)}
.track{height:9px;border:1px solid var(--border-strong);margin:.4rem 0;border-radius:4px;overflow:hidden}.track span{display:block;height:100%;background:var(--accent-pk)}
figure{margin:0;min-width:0}svg{display:block;width:100%;height:auto}svg text{fill:var(--text-primary);font-size:10px}.gridline{stroke:var(--border-strong);opacity:.4}.axis{fill:none;stroke:var(--text-primary)}.marker{stroke:var(--text-secondary);stroke-dasharray:3 3}.delayed{stroke:var(--accent-pk)}
polyline{fill:none;stroke-width:2.1;stroke-linejoin:round}.ref{stroke:var(--text-primary)}.incident{stroke:var(--accent-pk);stroke-dasharray:4 4}.candidate{stroke:var(--accent-pd);stroke-dasharray:10 3}.alt{stroke:var(--accent-ai);stroke-dasharray:2 3}
.legend{display:flex;flex-wrap:wrap;gap:.6rem;font-size:.82rem}.legend span{display:inline-flex;align-items:center;gap:.3rem}.legend i{width:24px;border-top:3px solid var(--text-primary)}.legend .incident{border-top:3px dashed var(--accent-pk)}.legend .candidate{border-top:3px dashed var(--accent-pd)}.legend .alt{border-top:3px dotted var(--accent-ai)}
table{width:100%;table-layout:fixed;border-collapse:collapse;font-size:.82rem}th,td{text-align:left;padding:.35rem;border-bottom:1px solid var(--border-strong)}th:first-child{width:40%}caption{font-weight:600;text-align:left}
</style>
