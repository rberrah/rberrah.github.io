<script>
  import { onDestroy } from 'svelte';
  import { language } from '$lib/stores/language';
  import { tdmEngineUrl } from '$lib/tdm/engine';
  import { tdmModels } from '$lib/content/tdmModels';
  import { ddiMechanisms, oncoDefaults, oncoLabels, openWorkshop, workshopSpec } from '$lib/tdm/workbenches';
  import PkWorkshopModel from './PkWorkshopModel.svelte';
  import WorkshopFigures from './WorkshopFigures.svelte';

  let { view } = $props();
  let english = $derived($language === 'en');
  /** @param {string} fr @param {string} en */
  const t = (fr, en) => english ? en : fr;
  let tab = $state('model1');
  let pdMode = $state('onco');
  let model1 = $state({ source: 'library', id: 'tacrolimus_woillard_ddi', route: 'Oral', code: '' });
  let model2 = $state({ source: 'library', id: 'voriconazole_vandenborn_ddi', route: 'Oral', code: '' });
  let pkOnco = $state({ source: 'library', id: 'vanco_revilla', route: 'IV', code: '', time_unit: 'h', concentration_scale: 1 });
  let pkPd = $state({ source: 'library', id: 'vanco_revilla', route: 'IV', code: '', time_unit: 'h', concentration_scale: 1 });
  let ddi = $state({ type: 'tdi', target: 'TVCL_TAC', factor: 0.5, strength: 1, c50: 1, hill: 2, kdeg: 0.02, kinact: 0.1,
    start_day: 3, stop_day: 10, followup_days: 3, affected: { dose: 3, interval: 12, infusion: 0 }, driver: { dose: 200, interval: 12, infusion: 0 } });
  /** @type {{name: string, value: number}[]} */
  let targets = $state([]);
  /** @param {{name:string,value:number}[]} values */
  function setTargets(values) {
    targets = values;
    if (values.length && !values.some((value) => value.name === ddi.target)) ddi.target = (values.find((value) => /CL/i.test(value.name)) ?? values[0]).name;
  }
  let mechanism = $derived(ddiMechanisms.find((item) => item.id === ddi.type) ?? ddiMechanisms[0]);
  let onco = $state({ growth: 'exponential', toxicity: true, free_pk: false, parameters: { ...oncoDefaults }, horizon: 84, decision: 42, dose: 100, interval: 21, infusion: 1, anc_floor: 1, tumor_goal: 0.8,
    history: [{ time: 0, amount: 100, infusion: 1 }, { time: 21, amount: 100, infusion: 1 }] });
  let pd = $state({ type: 'emax', delay: false, exposure: 'exponential', c0: 10, kel: 0.1, horizon: 24, regimen: {dose:100, interval:24, infusion:0}, parameters: /** @type {Record<string, number>} */ ({ E0: 100, SLOPE: 2, EMAX: 50, EC50: 2, HILL: 1.5, KE0: 0.5, KOUT: 0.15 }) });
  const pdTypes = ['linear', 'emax', 'hill', 'inhibit_in', 'stimulate_in', 'inhibit_out', 'stimulate_out'];
  const pdFr = ['Lineaire', 'Emax', 'Hill', 'Inhiber la production', 'Stimuler la production', 'Inhiber la degradation', 'Stimuler la degradation'];
  const pdEn = ['Linear', 'Emax', 'Hill', 'Inhibit production', 'Stimulate production', 'Inhibit loss', 'Stimulate loss'];
  let activePd = $derived(['E0', ...(pd.type === 'linear' ? ['SLOPE'] : ['EMAX', 'EC50']), ...(pd.type === 'hill' ? ['HILL'] : []), ...(pd.delay ? ['KE0'] : []), ...(/_(in|out)$/.test(pd.type) ? ['KOUT'] : [])]);
  let activeOnco = $derived(['V', 'CL', 'T0', 'KG', ...(onco.growth === 'exponential' ? [] : ['CAP']), 'KILL', 'EC50', 'RES', ...(onco.toxicity ? ['ANC0', 'MTT', 'GAMMA', 'SLOPE'] : [])]);
  let title = $derived(view === 'ddi' ? t('Interactions médicamenteuses', 'Drug interactions') : t('Pharmacodynamie', 'Pharmacodynamics'));
  let spec = $derived(view === 'ddi' ? workshopSpec('ddi', ddi, [model1, model2]) : workshopSpec(pdMode, pdMode === 'onco' ? onco : pd, pdMode === 'onco' ? (onco.free_pk ? [pkOnco] : undefined) : (pd.exposure === 'pk' ? [pkPd] : undefined)));
  let returned = $state(/** @type {{key: string, data: any} | null} */ (null));
  let computed = $derived(returned?.key === JSON.stringify(spec) ? returned?.data : null);
  let transfer = $state('');
  let transferError = $state('');
  let feedback = $derived({ sending: t('Transfert en cours...', 'Transfer in progress...'), done: t('Atelier transmis au moteur.', 'Workshop transferred to engine.'), blocked: t('Ouverture bloquee par le navigateur.', 'Browser blocked the new window.'), timeout: t('Moteur non joignable ou transfert non confirme.', 'Engine unreachable or transfer not confirmed.'), error: transferError }[transfer] ?? '');
  let cleanup = () => {};
  onDestroy(() => cleanup());
  function launch() {
    cleanup();
    const key = JSON.stringify(spec);
    cleanup = openWorkshop(tdmEngineUrl, $language ?? 'fr', JSON.parse(key), (state, detail) => { transfer = state; transferError = detail ?? ''; }, (data) => { returned = {key, data}; });
  }
  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `${spec.view}-workshop.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  /** @param {typeof model1} model */
  function modelLabel(model) {
    const record = tdmModels.find((item) => item.id === model.id);
    return model.source === 'code' ? 'mrgsolve / Lego' : `${english ? record?.drugEn : record?.drug} / ${record?.model}`;
  }
</script>

<svelte:head><title>{title} | Pharmacometrie Pratique</title><meta name="description" content={title} /></svelte:head>

<section class="workbench" data-testid={`${view}-workbench`}>
  <header><div><p class="eyebrow">{t('Atelier de modelisation', 'Modeling workshop')}</p><h1>{title}</h1></div><span class="status">{t('Recherche / en cours', 'Research / in development')}</span></header>
  <p class="intro">{view === 'ddi'
    ? t('Une interaction relie l’exposition d’une molecule a un parametre d’une autre. Assemblez les deux modeles PK et leur mecanisme, puis explorez les concentrations et la recuperation dans le moteur R.', 'An interaction links one drug’s exposure to another drug’s parameter. Assemble the two PK models and their mechanism, then explore concentrations and recovery in the R engine.')
    : pdMode === 'onco' ? t('De l’exposition a la reponse : assemblez croissance tumorale, effet du traitement et toxicite retardee. Le moteur R permet ensuite l’ajustement individuel et la comparaison des cycles futurs.', 'From exposure to response: assemble tumor growth, treatment effect and delayed toxicity. The R engine then supports individual fitting and comparison of future cycles.')
    : t('Reliez une exposition a un effet direct ou indirect, avec un compartiment d’effet optionnel. Le moteur R simule la reponse et ajuste les parametres sur les observations.', 'Link exposure to a direct or indirect effect, with an optional effect compartment. The R engine simulates the response and fits parameters to observations.')}</p>
  {#if view === 'pd'}<div class="modes" role="group" aria-label={t('Domaine', 'Domain')}>
    <button type="button" class:active={pdMode === 'onco'} aria-pressed={pdMode === 'onco'} onclick={() => pdMode = 'onco'}>{t('Oncologie', 'Oncology')}</button>
    <button type="button" class:active={pdMode === 'pd'} aria-pressed={pdMode === 'pd'} onclick={() => pdMode = 'pd'}>{t('PD generale', 'General PD')}</button>
  </div>{/if}
  <div class="assembly" aria-label={t('Schema du modele', 'Model diagram')}>
    {#if view === 'ddi'}
      <button class="block pk" class:selected={tab === 'model1'} onclick={() => tab = 'model1'}><span>PK 1</span><strong>{modelLabel(model1)}</strong><small>{t('Molecule affectee', 'Affected drug')}</small></button>
      <span class="connector" aria-hidden="true">&#8592;</span>
      <button class="block mechanism" class:selected={tab === 'mechanism'} onclick={() => tab = 'mechanism'}><span>{ddi.target}</span><strong>{english ? mechanism.en : mechanism.fr}</strong><small>{t('Parametre module', 'Modified parameter')}</small></button>
      <span class="connector" aria-hidden="true">&#8592;</span>
      <button class="block response" class:selected={tab === 'model2'} onclick={() => tab = 'model2'}><span>PK 2</span><strong>{modelLabel(model2)}</strong><small>{t('Molecule interagissante', 'Interacting drug')}</small></button>
    {:else if pdMode === 'onco'}
      <div class="block pk"><span>PK</span><strong>{t('Exposition par cycles', 'Exposure by cycles')}</strong><small>{onco.free_pk ? modelLabel(pkOnco) : 'IV / 1 CMT / mg/L'}</small></div><span class="connector" aria-hidden="true">&#8594;</span>
      <div class="block response"><span>TGI</span><strong>{t('Croissance + destruction', 'Growth + killing')}</strong><small>{onco.growth} / Emax / {t('resistance', 'resistance')}</small></div><span class="connector" aria-hidden="true">+</span>
      <div class="block mechanism" class:inactive={!onco.toxicity}><span>ANC</span><strong>{t('Myelosuppression', 'Myelosuppression')}</strong><small>{onco.toxicity ? 'Prol > T1 > T2 > T3 > ANC' : t('Desactivee', 'Disabled')}</small></div>
    {:else}
      <div class="block pk"><span>Cp</span><strong>{t('Exposition', 'Exposure')}</strong><small>{pd.exposure === 'pk' ? modelLabel(pkPd) : 'C(0) exp(-kel*t)'}</small></div><span class="connector" aria-hidden="true">&#8594;</span>
      <div class="block mechanism"><span>{pd.delay ? 'Ce' : 'Cp'}</span><strong>{pd.delay ? t('Compartiment d’effet', 'Effect compartment') : t('Sans delai', 'No delay')}</strong><small>{pd.delay ? 'dCe/dt = KE0*(Cp-Ce)' : 'Cdriver = Cp'}</small></div><span class="connector" aria-hidden="true">&#8594;</span>
      <div class="block response"><span>PD</span><strong>{(english ? pdEn : pdFr)[pdTypes.indexOf(pd.type)]}</strong><small>{(/_(in|out)$/.test(pd.type)) ? 'kin / kout' : 'E(C)'}</small></div>
    {/if}
  </div>
  <form onsubmit={(event) => { event.preventDefault(); launch(); }}>
    {#if view === 'ddi'}
      <nav class="tabs" aria-label={t('Blocs DDI', 'DDI blocks')}>{#each [['model1', t('Modele 1', 'Model 1')], ['mechanism', t('Interaction', 'Interaction')], ['model2', t('Modele 2', 'Model 2')]] as [id,label]}<button type="button" class:active={tab === id} aria-pressed={tab === id} onclick={() => tab = id}>{label}</button>{/each}</nav>
      <div hidden={tab !== 'model1'}><PkWorkshopModel bind:model={model1} bind:regimen={ddi.affected} side={1} onparameters={setTargets} /></div>
      <div hidden={tab !== 'model2'}><PkWorkshopModel bind:model={model2} bind:regimen={ddi.driver} side={2} /></div>
      <div hidden={tab !== 'mechanism'}>
        <div class="fields">
          <label>{t('Parametre cible (PK 1)', 'Target parameter (PK 1)')}{#if targets.length}<select bind:value={ddi.target}>{#each targets as target}<option value={target.name}>{target.name} ({target.value})</option>{/each}</select>{:else}<input bind:value={ddi.target} pattern="[A-Za-z_][A-Za-z0-9_]*" required />{/if}</label>
          <label>{t('Mecanisme', 'Mechanism')}<select bind:value={ddi.type} onchange={() => { if (ddi.type.includes('inhibition')) ddi.strength = Math.min(1, ddi.strength); }}>{#each ddiMechanisms as item}<option value={item.id}>{english ? item.en : item.fr}</option>{/each}</select></label>
          {#each mechanism.fields as field}<label>{({ factor: t('Facteur', 'Factor'), strength: 'Imax / Emax', c50: 'IC50 / EC50 / Ki / KI', hill: 'Hill', kdeg: 'kdeg (1/h)', kinact: 'kinact (1/h)' })[field]}<input type="number" bind:value={ddi[field]} step="any" required min={['strength', 'kinact'].includes(field) ? 0 : 0.000001} max={field === 'strength' && ddi.type.includes('inhibition') ? 1 : undefined} /></label>{/each}
        </div>
        <p class="equation"><code>{mechanism.equation}</code></p><p>{english ? mechanism.enNote : mechanism.frNote}</p>
        <div class="fields">
          <label>{t('Debut du modele 2 (jour)', 'Start model 2 (day)')}<input type="number" bind:value={ddi.start_day} min="0.25" max="180" step="any" required /></label>
          <label>{t('Arret du modele 2 (jour)', 'Stop model 2 (day)')}<input type="number" bind:value={ddi.stop_day} min={ddi.start_day + 0.25} max="365" step="any" required /></label>
          <label>{t('Suivi apres arret (jours)', 'Follow-up after stopping (days)')}<input type="number" bind:value={ddi.followup_days} min="0" max="180" step="any" required /></label>
        </div>
      </div>
    {:else if pdMode === 'onco'}
      <div class="fields structure"><label>{t('Croissance tumorale', 'Tumor growth')}<select bind:value={onco.growth}><option value="exponential">{t('Exponentielle', 'Exponential')}</option><option value="logistic">{t('Logistique', 'Logistic')}</option><option value="gompertz">Gompertz</option></select></label><label class="toggle"><input type="checkbox" bind:checked={onco.toxicity} /> {t('Myelosuppression avec retrocontrole', 'Myelosuppression with feedback')}</label></div>
      <div class="oncology-layout">
        <div class="parameter-sections">
          <fieldset><legend>{t('Conditions initiales', 'Initial conditions')}</legend><div class="fields compact">{#each activeOnco.filter((name) => ['T0','ANC0'].includes(name)) as name}<label>{oncoLabels[name]}<input type="number" bind:value={onco.parameters[name]} step="any" min="0.000001" required /></label>{/each}</div></fieldset>
          <fieldset><legend>{t('Modele et parametres PK', 'PK model and parameters')}</legend>
            <label class="toggle"><input type="checkbox" bind:checked={onco.free_pk} /> {t('Modele PK libre', 'Free PK model')}</label>
            {#if onco.free_pk}<PkWorkshopModel bind:model={pkOnco} side="onco" showRegimen={false} units={true} />
            {:else}<div class="fields compact">{#each ['V','CL'] as name}<label>{oncoLabels[name]}<input type="number" bind:value={onco.parameters[name]} step="any" min="0.000001" required /></label>{/each}</div>{/if}
          </fieldset>
          <fieldset><legend>{t('Parametres PD', 'PD parameters')}</legend><div class="fields compact">{#each activeOnco.filter((name) => !['T0','ANC0','V','CL'].includes(name)) as name}<label>{oncoLabels[name]}<input type="number" bind:value={onco.parameters[name]} step="any" min={['KG','KILL','RES','GAMMA','SLOPE'].includes(name) ? 0 : 0.000001} required /></label>{/each}</div></fieldset>
        </div>
        <fieldset><legend>{t('Cycles de reference', 'Reference cycles')}</legend><div class="fields compact">
          <label>{t('Prochaine dose (jour)', 'Next dose (day)')}<input type="number" bind:value={onco.decision} min="0" max={onco.horizon - 0.1} step="any" required /></label>
          <label>{t('Horizon (jours)', 'Horizon (days)')}<input type="number" bind:value={onco.horizon} min="1" max="730" step="any" required /></label>
          <label>{onco.free_pk ? t('Dose future (unite PK)', 'Future dose (PK unit)') : t('Dose future (mg)', 'Future dose (mg)')}<input type="number" bind:value={onco.dose} min="0" step="any" required /></label>
          <label>{t('Intervalle (jours)', 'Interval (days)')}<input type="number" bind:value={onco.interval} min="0.25" max="180" step="any" required /></label>
          <label>{t('Perfusion (h; 0 = oral / bolus IV)', 'Infusion (h; 0 = oral / IV bolus)')}<input type="number" bind:value={onco.infusion} min="0" max={Math.min(168,onco.interval * 24)} step="any" required /></label>
        </div><h3>{t('Doses passees', 'Past doses')}</h3>
          {#each onco.history as dose, index}<div class="dose-row">
            <label>{t('Jour', 'Day')}<input type="number" bind:value={dose.time} min="0" max={onco.decision - 0.000001} step="any" required /></label>
            <label>{onco.free_pk ? t('Unite PK', 'PK unit') : 'mg'}<input type="number" bind:value={dose.amount} min="0.001" step="any" required /></label>
            <label>{t('Perf. h', 'Inf. h')}<input type="number" bind:value={dose.infusion} min="0" max="168" step="any" required /></label>
            <button type="button" class="remove" title={t('Supprimer la dose', 'Remove dose')} aria-label={t('Supprimer la dose', 'Remove dose')} onclick={() => onco.history.splice(index,1)}>&times;</button>
          </div>{/each}
          <button type="button" onclick={() => onco.history.push({ time: 0, amount: onco.dose, infusion: onco.infusion })}>{t('Ajouter une dose passee', 'Add past dose')}</button>
        </fieldset>
      </div>
      <p class="equation"><code>dT/dt = growth(T) - KILL*C/(EC50+C)*exp(-RES*t)*T</code></p>
      <p>{t('Le traitement ralentit ou inverse la croissance. RES fait decroitre la sensibilite avec le temps. La maturation hematologique retarde le nadir par rapport au pic de concentration.', 'Treatment slows or reverses growth. RES reduces sensitivity with time. Hematological maturation delays the nadir relative to peak concentration.')}</p>
    {:else}
      <fieldset><legend>{t('Exposition PK', 'PK exposure')}</legend><label>{t('Source PK', 'PK source')}<select bind:value={pd.exposure}><option value="exponential">{t('Profil exponentiel', 'Exponential profile')}</option><option value="pk">{t('Modele PK libre', 'Free PK model')}</option></select></label>
      {#if pd.exposure === 'pk'}<PkWorkshopModel bind:model={pkPd} bind:regimen={pd.regimen} side="pd" units={true} />{/if}</fieldset>
      <div class="fields structure"><label>{t('Modele de reponse', 'Response model')}<select bind:value={pd.type} onchange={() => { if (/^inhibit/.test(pd.type)) pd.parameters.EMAX = Math.min(1, Math.max(0,pd.parameters.EMAX)); }}>{#each pdTypes as type,index}<option value={type}>{(english ? pdEn : pdFr)[index]}</option>{/each}</select></label><label class="toggle"><input type="checkbox" bind:checked={pd.delay} /> {t('Compartiment d’effet', 'Effect compartment')}</label></div>
      <div class="fields">{#each activePd as name}<label>{name}<input type="number" bind:value={pd.parameters[name]} step="any" required max={name === 'EMAX' && pd.type.startsWith('inhibit') ? 1 : undefined} /></label>{/each}
        {#if pd.exposure === 'exponential'}<label>C(0)<input type="number" bind:value={pd.c0} min="0" step="any" required /></label><label>kel (1/h)<input type="number" bind:value={pd.kel} min="0" step="any" required /></label>{/if}<label>{t('Horizon (h)', 'Horizon (h)')}<input type="number" bind:value={pd.horizon} min="0.01" max="2400" step="any" required /></label>
      </div><p>{t('Effet direct : reponse instantanee. Compartiment d’effet : delai de distribution. Reponse indirecte : modification de la production ou de la degradation d’un marqueur.', 'Direct effect: instantaneous response. Effect compartment: distribution delay. Indirect response: altered production or loss of a marker.')}</p>
    {/if}
    <div class="actions"><button class="primary" type="submit">{t('Ouvrir dans le moteur', 'Open in engine')}</button><button type="button" onclick={download}>{t('Exporter l’atelier (.json)', 'Export workshop (.json)')}</button><span role="status">{feedback}</span></div>
  </form>
  <WorkshopFigures view={spec.view} config={spec.config} {computed} />
  <section class="explanation">
    <h2>{t('Du schema a la simulation', 'From diagram to simulation')}</h2>
    <div class="reading-grid">
      {#if view === 'pd' && pdMode === 'pd'}
        <div><h3>{t('Construire', 'Build')}</h3><p>{t('L’effet direct depend de Cp ou de Ce. Les quatre reponses indirectes modifient la production ou la degradation d’un marqueur, par inhibition ou stimulation. Le compartiment d’effet ajoute un delai de distribution.', 'Direct effect depends on Cp or Ce. The four indirect responses modify marker production or loss through inhibition or stimulation. An effect compartment adds a distribution delay.')}</p></div>
        <div><h3>{t('Ajuster et comparer', 'Fit and compare')}</h3><p>{t('Les paires concentration-effet permettent l’ajustement des relations directes sans delai. Un modele avec delai ou reponse indirecte exige des observations datees et un profil d’exposition. Le moteur compare predictions et observations et affiche les residus.', 'Concentration-effect pairs support fitting direct relationships without delay. Delayed or indirect models require timed observations and an exposure profile. The engine compares predictions with observations and displays residuals.')}</p></div>
        <div><h3>{t('Interpreter avec les limites', 'Interpret within limits')}</h3><p>{t('Ajustement individuel par moindres carres, sans MAP-BE ni propagation de l’incertitude PK. Les parametres et les unites d’effet doivent correspondre au marqueur etudie. Ce module general ne propose pas de recommandation posologique.', 'Individual least squares, without MAP-BE or PK uncertainty propagation. Parameters and effect units must match the marker studied. This general module does not provide a dosing recommendation.')}</p></div>
      {:else}
      <div><h3>{t('Construire', 'Build')}</h3><p>{view === 'ddi' ? t('Le modele 2 fournit C2. La relation multiplie un parametre du modele 1. Une inhibition enzymatique exige un parametre compatible, par exemple une clairance : l’appliquer a un volume necessite une autre justification.', 'Model 2 supplies C2. The relationship multiplies a parameter of model 1. Enzyme inhibition requires a compatible parameter, for example clearance: applying it to volume requires a different justification.') : t('Les blocs definissent les equations. La PK provient du modele mrgsolve choisi ou de l’exemple IV. Les parametres PD par defaut sont illustratifs, sans attribution a un anticancereux. La taille est une somme des diametres (SLD), pas un volume.', 'Blocks define the equations. PK comes from the selected mrgsolve model or the IV example. Default PD parameters are illustrative, not attributed to an anticancer drug. Size is sum of longest diameters (SLD), not volume.')}</p></div>
      <div><h3>{t('Individualiser et comparer', 'Individualize and compare')}</h3><p>{view === 'ddi' ? t('Dans le moteur, chaque molecule peut conserver ses parametres populationnels ou reprendre son ajustement TDM. Les courbes comparent la molecule affectee avec et sans interaction. La recuperation enzymatique continue apres l’arret.', 'In the engine, each drug can retain population parameters or use its TDM fit. Curves compare the affected drug with and without interaction. Enzyme recovery continues after stopping.') : t('Renseignez les observations et n’estimez que les parametres identifiables. Comparez maintien, reduction, report ou nouvel intervalle a partir de la prochaine dose. L’historique et les etats sont conserves entre cycles.', 'Enter observations and estimate only identifiable parameters. Compare continuation, reduction, delay or a new interval from the next dose. History and states are preserved between cycles.')}</p></div>
      <div><h3>{t('Interpreter avec les limites', 'Interpret within limits')}</h3><p>{view === 'ddi' ? t('Couplage unidirectionnel, sans fraction metabolisee ni PBPK. Plancher inhibiteur de 1 %. Ki/IC50 utilisent la meme concentration que le modele 2, sans conversion libre/totale automatique. Le C++ attend des entrees externes ; le script R exporte integre l’activite enzymatique et simule les deux PK.', 'Unidirectional coupling, no fraction metabolized or PBPK. Inhibition floor: 1%. Ki/IC50 use the same concentration as model 2, without automatic unbound/total conversion. C++ expects external inputs; the exported R script integrates enzyme activity and simulates both PK models.') : t('Moindres carres individuels, pas de MAP-BE. La structure de Friberg est adaptee avec un effet lineaire borne. Cibles exploratoires, sans RECIST, survie, recommandation clinique ni probabilite de securite. Les scenarios futurs ne sont pas une optimisation validee.', 'Individual least squares, not MAP-BE. Friberg’s structure is adapted with a capped linear effect. Exploratory targets, without RECIST, survival, clinical recommendation or safety probability. Future scenarios are not validated optimization.')}</p></div>
      {/if}
    </div>
    <p class="privacy">{t('Session uniquement : aucun modele personnel ni aucune donnee patient ne sont sauvegardes automatiquement. Seuls vos telechargements sont conserves.', 'Session only: no personal model or patient data are saved automatically. Only your explicit downloads are retained.')}</p>
    <h3>{t('Sources', 'Sources')}</h3>
    {#if view === 'ddi'}<a href="https://www.fda.gov/regulatory-information/search-fda-guidance-documents/m12-drug-interaction-studies" target="_blank" rel="noopener noreferrer">ICH M12 / {t('Inhibition et induction enzymatique', 'Enzyme inhibition and induction')}</a>
    {:else if pdMode === 'onco'}<a href="https://doi.org/10.1200/JCO.2002.02.140" target="_blank" rel="noopener noreferrer">Friberg et al., 2002 / Myelosuppression</a>
    {:else}<a href="https://doi.org/10.1007/BF01061691" target="_blank" rel="noopener noreferrer">Dayneka, Garg &amp; Jusko, 1993 / {t('Reponses indirectes', 'Indirect responses')}</a>{/if}
  </section>
</section>

<style>
  .workbench { min-width: 0; letter-spacing: 0; }
  header { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
  h1 { font-size: 2rem; line-height: 1.2; margin: 0; letter-spacing: 0; } h2 { font-size: 1.4rem; letter-spacing: 0; } h3 { font-size: 1rem; letter-spacing: 0; }
  .eyebrow, .status { font-size: 0.8rem; color: var(--text-secondary); } .intro { max-width: 88ch; font-size: 0.95rem; margin: 16px 0 24px; }
  .assembly { display: grid; grid-template-columns: minmax(0,1fr) 28px minmax(0,1fr) 28px minmax(0,1fr); align-items: stretch; gap: 8px; margin: 22px 0; }
  .block { border: 1px solid var(--border-strong); border-top: 4px solid #11756c; border-radius: 4px; background: var(--bg-tertiary); padding: 18px; min-width: 0; min-height: 144px; display: flex; flex-direction: column; justify-content: center; text-align: left; color: var(--text-primary); overflow-wrap: anywhere; }
  .block span { font: 0.75rem var(--font-mono); color: var(--text-secondary); } .block strong { font-size: 1rem; line-height: 1.5; margin: 5px 0; } .block small { font-size: 0.75rem; color: var(--text-secondary); }
  .block.mechanism { border-top-color: #9e4162; } .block.response { border-top-color: #857125; } .block.selected { outline: 2px solid #11756c; outline-offset: 3px; } .block.inactive { opacity: 0.6; }
  .connector { align-self: center; text-align: center; font-size: 1.5rem; }
  button { font: inherit; font-size: 0.85rem; color: var(--text-primary); cursor: pointer; padding: 9px 14px; border-radius: 4px; border: 1px solid var(--border-strong); background: var(--bg-tertiary); }
  button:hover { background: var(--bg-secondary); } button:focus-visible { outline: 3px solid #168879; outline-offset: 2px; }
  .tabs, .modes { display: flex; gap: 6px; flex-wrap: wrap; border-bottom: 1px solid var(--border-subtle); margin-bottom: 18px; }
  .tabs button, .modes button { border: 0; border-bottom: 3px solid transparent; border-radius: 0; background: transparent; padding: 12px 16px; } .tabs button.active, .modes button.active { border-bottom-color: #11756c; font-weight: 650; }
  .fields { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; } .fields.compact { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 10px 16px; }
  .fields.structure { grid-template-columns: repeat(2,minmax(0,1fr)); padding-bottom: 18px; margin-bottom: 18px; border-bottom: 1px solid var(--border-subtle); }
  label { display: block; font-size: 0.8rem; } input:not([type=checkbox]), select { width: 100%; min-width: 0; display: block; box-sizing: border-box; padding: 9px; margin-top: 5px; border: 1px solid var(--border-strong); border-radius: 4px; font: inherit; background: var(--bg-tertiary); color: var(--text-primary); }
  .toggle { display: flex; align-items: center; gap: 9px; } .oncology-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 36px; }
  fieldset { border: 0; padding: 0; min-width: 0; } legend { font-size: 1rem; font-weight: 650; margin-bottom: 15px; }
  .parameter-sections { display: grid; gap: 24px; } .parameter-sections fieldset + fieldset { padding-top: 20px; border-top: 1px solid var(--border-subtle); }
  .dose-row { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)) 34px; align-items: end; gap: 8px; margin-bottom: 10px; } .remove { padding: 0; width: 34px; height: 36px; font-size: 1.2rem; }
  .equation { padding: 12px 0; border-block: 1px solid var(--border-subtle); overflow-wrap: anywhere; } .equation code { font-size: 0.8rem; white-space: normal; }
  .actions { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; margin-top: 24px; padding: 18px 0; border-top: 1px solid var(--border-subtle); } .actions .primary { background: #126e64; color: white; border-color: #126e64; } .actions span { font-size: 0.8rem; }
  .explanation { border-top: 1px solid var(--border-strong); margin-top: 32px; padding-top: 18px; } .reading-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 28px; }
  .reading-grid p, form p { font-size: 0.9rem; } .privacy { font-size: 0.85rem; padding: 16px 0; border-block: 1px solid var(--border-subtle); }
  @media (max-width: 760px) { .oncology-layout, .reading-grid { grid-template-columns: 1fr; gap: 22px; } .fields { grid-template-columns: repeat(2,minmax(0,1fr)); } .assembly { grid-template-columns: 1fr; } .connector { transform: rotate(90deg); width: 28px; height: 28px; justify-self: center; } .block { min-height: 110px; } h1 { font-size: 1.65rem; } }
  @media (max-width: 430px) { .fields.structure { grid-template-columns: 1fr; } .actions button { width: 100%; } }
</style>
