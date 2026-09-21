<script>
  import { onMount, onDestroy, flushSync } from 'svelte';
  import { ArrowRight, Download, Microscope, Activity, SlidersHorizontal } from '@lucide/svelte';
  import { language } from '$lib/stores/language';
  import { tdmEngineUrl } from '$lib/tdm/engine';
  import { openWorkshop, workshopSpec, basicIvModel } from '$lib/tdm/workbenches';
  import { readDraft, writeDraft } from '$lib/workshops/session.js';
  import PkWorkshopModel from './PkWorkshopModel.svelte';
  import WorkshopFigures from './WorkshopFigures.svelte';
  let { model = $bindable() } = $props();
  let english = $derived($language === 'en');
  /** @param {string} fr @param {string} en */
  const t = (fr, en) => english ? en : fr;
  let block = $state('pk');
  let cfg = $state({ source: 'pk', metric: 'time', basis: 'free', fu: 1, mic: 1, multiple: 1, target: 100,
    replicates: 1000, delta: .05, dose: 1000, interval: 12, infusion: 1, dose2: 1000, interval2: 8, infusion2: 1, pta_target: 90,
    grid: { min: 500, max: 1500, step: 500, intervals: [8,12], infusion: 1, continuous: false } });
  let computed = $state(null);
  let computedKey = $state('');
  let spec = $derived(workshopSpec('infection', { ...cfg, exposure: model.source === 'builtin' ? 'iv1' : 'pk', v: model.v, cl: model.cl },
    cfg.source === 'pk' ? [model.source === 'builtin' ? basicIvModel(model.v, model.cl) : model] : undefined));
  let compared = $state(0);
  let candidates = $derived.by(() => {
    const g = cfg.grid, count = Math.floor((g.max - g.min) / g.step + 1e-9) + 1;
    if (!(g.min > 0 && g.step > 0 && count > 0 && count * g.intervals.length <= 24)) return [];
    return Array.from({ length: count }, (_, i) => g.min + i * g.step).flatMap(dose => g.intervals.map(interval => ({ dose, interval, infusion: g.continuous ? interval : g.infusion })));
  });
  let preview = $derived({ ...spec.config, preview_regimen: candidates[compared] ?? candidates[0] });
  let transfer = $state('');
  let transferError = $state('');
  let cleanup = () => {};
  let mounted = false;
  onMount(() => { const draft = readDraft('workbench:infection'); if (draft) { cfg = { ...cfg, ...draft.cfg, grid: draft.cfg.grid ?? cfg.grid }; block = draft.block; } mounted = true; });
  onDestroy(() => { cleanup(); if (mounted) writeDraft('workbench:infection', { cfg, block }); });
  $effect(() => { if (cfg.source === 'pk' && model.route === 'Oral') { cfg.infusion = 0; cfg.infusion2 = 0; cfg.grid.infusion = 0; cfg.grid.continuous = false; } });
  $effect(() => { if (computedKey !== JSON.stringify(spec)) computed = null; });
  let equation = $derived(cfg.metric === 'time' ? `${cfg.basis === 'free' ? 'f' : ''}T > ${cfg.multiple} x MIC : >= ${cfg.target}%`
    : `${cfg.basis === 'free' ? 'f' : ''}${cfg.metric === 'auc' ? 'AUC24 / MIC' : 'Cmax / MIC'} >= ${cfg.target}${cfg.metric === 'auc' ? ' h' : ''}`);
  let feedback = $derived(({ sending: t('Transfert en cours...', 'Transfer in progress...'), done: t('Atelier transmis au moteur.', 'Workshop transferred to engine.'),
    blocked: t('Ouverture bloquee par le navigateur.', 'Browser blocked the new window.'), timeout: t('Moteur non joignable ou pas encore mis a jour.', 'Engine unreachable or not yet updated.'), error: transferError })[transfer] ?? '');
  function launch() { cleanup(); const key = JSON.stringify(spec); computed = null; cleanup = openWorkshop(tdmEngineUrl, $language ?? 'fr', JSON.parse(key), (state, detail) => { transfer = state; transferError = detail ?? ''; }, (result) => { if (key === JSON.stringify(spec)) { computedKey = key; computed = result; } }); }
  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(spec, null, 2)], {type: 'application/json'}));
    const link = document.createElement('a'); link.href = url; link.download = 'infection-workshop.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
</script>

<section data-testid="infection-workbench" aria-label={t('Atelier infectiologie', 'Infectiology workshop')}>
  <div class="chain" role="group" aria-label={t('Schema PK/PD infectiologie', 'Infectiology PK/PD diagram')}>
    <button type="button" class:active={block === 'pk'} aria-pressed={block === 'pk'} onclick={() => block = 'pk'}><Activity size={22}/><span>PK / TDM</span><strong>{t('Exposition', 'Exposure')}</strong><small>{cfg.basis === 'free' ? `C free = ${cfg.fu} x C total` : 'C total'}</small></button>
    <ArrowRight class="connector" size={22}/>
    <button type="button" class:active={block === 'mic'} aria-pressed={block === 'mic'} onclick={() => block = 'mic'}><Microscope size={22}/><span>{t('CMI', 'MIC')}</span><strong>{cfg.mic} mg/L</strong></button>
    <ArrowRight class="connector" size={22}/>
    <button type="button" class:active={block === 'target'} aria-pressed={block === 'target'} onclick={() => block = 'target'}><SlidersHorizontal size={22}/><span>PK/PD</span><strong>{t('Atteinte de cible', 'Target attainment')}</strong><small>{equation}</small></button>
  </div>
  <form onsubmit={(event) => { event.preventDefault(); launch(); }} oninvalidcapture={(event) => {
    const panel = event.target instanceof Element ? event.target.closest('[data-block]') : null;
    if (panel instanceof HTMLElement) flushSync(() => { block = panel.dataset.block ?? 'pk'; });
  }}>
    <div class="editor" data-block="pk" hidden={block !== 'pk'}>
      <h2>{t('Exposition et posologies', 'Exposure and regimens')}</h2>
      <fieldset class="source"><legend>{t('Source de l’exposition', 'Exposure source')}</legend>
        <label><input type="radio" bind:group={cfg.source} value="pk"/> {t('Modele populationnel', 'Population model')}</label>
        <label><input type="radio" bind:group={cfg.source} value="tdm"/> {t('Analyse TDM dans le moteur', 'TDM analysis in the engine')}</label>
      </fieldset>
      {#if cfg.source === 'pk'}
        <label>{t('Structure PK', 'PK structure')}<select value={model.source === 'builtin' ? 'iv1' : 'pk'} onchange={(e) => { model = e.currentTarget.value === 'iv1' ? { ...model, source: 'builtin', route: 'IV', v: model.v ?? 20, cl: model.cl ?? 4 } : { ...model, source: 'library', id: model.id || 'vanco_pkjust' }; }}>
          <option value="iv1">{t('IV 1 compartiment', 'IV one compartment')}</option><option value="pk">{t('Modele PK libre', 'Free PK model')}</option>
        </select></label>
        {#if model.source === 'builtin'}<div class="fields"><label>V (L)<input type="number" bind:value={model.v} min="0.000001" step="any" required/></label><label>CL (L/h)<input type="number" bind:value={model.cl} min="0.000001" step="any" required/></label></div>
        {:else}<PkWorkshopModel bind:model side="infection" showRegimen={false} units={true}/>{/if}
      {:else}<p>{t('L’analyse TDM doit exister dans la session Shiny utilisee. Les covariables et les poids des modeles de cette analyse sont conserves.', 'The TDM analysis must exist in the Shiny session being used. Its covariates and model weights are retained.')}</p>{/if}
      <div class="regimens">
        <fieldset><legend>{t('Posologie actuelle', 'Current regimen')}</legend>
            <label>{t('Dose (unite PK)', 'Dose (PK unit)')}<input type="number" bind:value={cfg.dose} min="0.000001" step="any" required/></label>
            <label>{t('Intervalle (h)', 'Interval (h)')}<input type="number" bind:value={cfg.interval} min="0.25" max="168" step="any" required/></label>
            <label>{t('Perfusion (h)', 'Infusion (h)')}<input type="number" bind:value={cfg.infusion} min="0" max={cfg.interval} step="any" required disabled={cfg.source === 'pk' && model.route === 'Oral'}/></label>
        </fieldset>
        <fieldset><legend>{t('Grille de doses', 'Dose grid')}</legend>
          <label>Dose min<input type="number" bind:value={cfg.grid.min} min="0.000001" step="any" required/></label>
          <label>Dose max<input type="number" bind:value={cfg.grid.max} min={cfg.grid.min} step="any" required/></label>
          <label>{t('Pas', 'Step')}<input type="number" bind:value={cfg.grid.step} min="0.000001" step="any" required/></label>
          <fieldset class="source"><legend>{t('Intervalles proposes (h)', 'Candidate intervals (h)')}</legend>{#each [4,6,8,12,24,48] as hours}<label><input type="checkbox" bind:group={cfg.grid.intervals} value={hours}/>{hours}</label>{/each}</fieldset>
          <label><input type="checkbox" bind:checked={cfg.grid.continuous} disabled={cfg.source === 'pk' && model.route === 'Oral'}/> {t('Perfusion continue', 'Continuous infusion')}</label>
          {#if !cfg.grid.continuous}<label>{t('Perfusion (h)', 'Infusion (h)')}<input type="number" bind:value={cfg.grid.infusion} min="0" max={Math.min(...cfg.grid.intervals)} step="any" required disabled={cfg.source === 'pk' && model.route === 'Oral'}/></label>{/if}
        </fieldset>
      </div>
      <p>{t('Perfusion = 0 pour oral / bolus IV. Comparaison a l’etat stationnaire, sans transition apres la derniere dose. Maximum 24 posologies candidates.', 'Infusion = 0 for oral / IV bolus. Steady-state comparison, without transition after the latest dose. Maximum 24 candidate regimens.')}</p>
    </div>
    <div class="editor" data-block="mic" hidden={block !== 'mic'}>
      <h2>{t('CMI', 'MIC')}</h2>
      <div class="fields"><label>{t('CMI (mg/L)', 'MIC (mg/L)')}<input type="number" bind:value={cfg.mic} min="0.000001" max="100000" step="any" required/></label></div>
      <p>{t('Une valeur censuree (> ou <=) n’est pas une CMI exacte. La sensibilite a une dilution est examinee avec CMI/2 et 2 x CMI.', 'A censored value (> or <=) is not an exact MIC. One-dilution sensitivity is assessed with MIC/2 and 2 x MIC.')}</p>
      <h3>EUCAST</h3>
      <p>{t('Les distributions et ECOFF caracterisent une reference microbiologique. Elles ne remplacent pas la CMI du patient et ne permettent pas de deduire un taux local de resistance. Les seuils cliniques S/I/R sont distincts.', 'Distributions and ECOFF characterize a microbiological reference. They do not replace the patient MIC and cannot establish a local resistance rate. S/I/R clinical breakpoints are separate.')}</p>
      <a href="https://mic.eucast.org/" target="_blank" rel="noopener noreferrer">EUCAST MIC distributions / ECOFF</a>
    </div>
    <div class="editor" data-block="target" hidden={block !== 'target'}>
      <h2>{t('Cible PK/PD', 'PK/PD target')}</h2>
      <div class="fields">
        <label>{t('Indice', 'Index')}<select bind:value={cfg.metric} onchange={() => { cfg.target = cfg.metric === 'time' ? 100 : cfg.metric === 'auc' ? 400 : 8; }}><option value="time">%T &gt; k x MIC</option><option value="auc">AUC24 / MIC (h)</option><option value="peak">Cmax / MIC</option></select></label>
        <label>{cfg.metric === 'time' ? t('Temps au-dessus de k x CMI (%)', 'Time above k x MIC (%)') : cfg.metric === 'auc' ? t('AUC24 / CMI visee (h)', 'Target AUC24 / MIC (h)') : t('Rapport Cmax / CMI vise', 'Target Cmax / MIC ratio')}<input type="number" bind:value={cfg.target} min="0.001" max={cfg.metric === 'time' ? 100 : 1000000} step="any" required/></label>
        <label>{t('Concentration cible', 'Target concentration')}<select bind:value={cfg.basis}><option value="free">{t('Libre', 'Unbound')}</option><option value="total">{t('Totale', 'Total')}</option></select></label>
        {#if cfg.basis === 'free'}<label>{t('Fraction libre fu', 'Unbound fraction fu')}<input type="number" bind:value={cfg.fu} min="0.000001" max="1" step="any" required/></label>{/if}
        {#if cfg.metric === 'time'}<label>k<input type="number" bind:value={cfg.multiple} min="0.01" max="1000" step="any" required/></label>{/if}
        <label>{t('Probabilite d’atteinte souhaitee (%)', 'Desired target attainment probability (%)')}<input type="number" bind:value={cfg.pta_target} min="0.001" max="100" step="any" required/></label>
        <label>{t('Tirages Monte Carlo', 'Monte Carlo draws')}<input type="number" bind:value={cfg.replicates} min="50" max="5000" step="1" required/></label>
      </div>
      <p class="equation">{equation}</p>
      <p>{t('Les valeurs initiales sont des exemples, pas des recommandations par molecule. L’indice, sa cible, la matrice et la fraction libre doivent correspondre a la reference scientifique choisie. Pour une sortie deja libre, fu = 1.', 'Initial values are examples, not drug-specific recommendations. The index, target, matrix and unbound fraction must match the chosen scientific reference. For an already unbound output, fu = 1.')}</p>
    </div>
    <div class="actions"><button class="primary" type="submit"><ArrowRight size={17}/>{t('Ouvrir dans le moteur', 'Open in engine')}</button><button type="button" onclick={download}><Download size={17}/>{t('Exporter l’atelier (.json)', 'Export workshop (.json)')}</button><span role="status">{feedback}</span></div>
  </form>
  {#if !computed && model.source === 'builtin' && cfg.source === 'pk'}<label class="comparison">{t('Posologie comparee', 'Compared regimen')}<select bind:value={compared}>{#each candidates as candidate, index}<option value={index}>{candidate.dose} mg / {candidate.interval} h; {t('perfusion', 'infusion')} {candidate.infusion} h</option>{/each}</select></label>{/if}
  <WorkshopFigures view="infection" config={preview} {computed}/>
  <section class="methods"><h2>{t('De l’exposition a la PTA', 'From exposure to PTA')}</h2>
    <div class="reading"><div><h3>{t('Interprétation TDM', 'TDM interpretation')}</h3><p>{t('Un profil individuel donne un indice PK/PD estime sur la fenetre disponible. Une AUC de 12 h n’est pas une AUC24 ; ce resultat ponctuel n’est pas une probabilite.', 'An individual profile yields an estimated PK/PD index over the available window. A 12-hour AUC is not an AUC24; this point estimate is not a probability.')}</p></div>
      <div><h3>{t('Population ou posterior', 'Population or posterior')}</h3><p>{t('La PTA compte les profils simules atteignant la cible. Avant TDM, la variabilite vient d’OMEGA. Apres TDM, elle vient de l’incertitude posterieure. L’erreur de mesure n’est pas ajoutee.', 'PTA counts simulated profiles attaining the target. Before TDM, variability comes from OMEGA. After TDM, it comes from posterior uncertainty. Measurement error is not added.')}</p></div>
      <div><h3>{t('Limites', 'Limitations')}</h3><p>{t('Fraction libre fixe, approximation du posterior, pas de modele de toxicite ou de resistance. Atteindre une cible n’est pas garantir un succes clinique. La precision Monte Carlo depend du nombre de tirages : 250 est rapide, 1000 ou plus est preferable pres d’une decision. Usage de recherche uniquement.', 'Fixed unbound fraction, approximate posterior, no toxicity or resistance model. Target attainment does not guarantee clinical success. Monte Carlo precision depends on the number of draws: 250 is fast, 1000 or more is preferable near a decision. Research use only.')}</p></div></div>
    <h3>{t('References pour comprendre', 'Background references')}</h3>
    <ul><li><a href="https://doi.org/10.1093/jac/dki079" target="_blank" rel="noopener noreferrer">Mouton et al., 2005</a> : {t('definitions des indices PK/PD, de la PTA et de la CFR.', 'definitions of PK/PD indices, PTA and CFR.')}</li>
      <li><a href="https://doi.org/10.1128/AAC.46.3.913-916.2002" target="_blank" rel="noopener noreferrer">Drusano et al., 2002</a> : {t('exemple de selection de dose par PK populationnelle et simulation Monte Carlo (antiviral).', 'a dose-selection example using population PK and Monte Carlo simulation (antiviral).')}</li>
      <li><a href="https://doi.org/10.1086/383320" target="_blank" rel="noopener noreferrer">Drusano et al., 2004</a> : {t('relation exposition AUC/CMI et eradication microbiologique dans la pneumonie nosocomiale; ces resultats ne sont pas une cible universelle.', 'AUC/MIC exposure and microbiological eradication in nosocomial pneumonia; these findings are not a universal target.')}</li></ul>
    <p>{t('Donnees microbiologiques :', 'Microbiology data:')} <a href="https://mic.eucast.org/" target="_blank" rel="noopener noreferrer">EUCAST</a>.</p>
  </section>
</section>

<style>
  [hidden] { display:none !important; }
  .chain { display:grid; grid-template-columns: minmax(0,1fr) 24px minmax(0,1fr) 24px minmax(0,1fr); align-items:center; gap:16px; margin:20px 0; }
  .chain button { display:flex; flex-direction:column; align-items:flex-start; gap:8px; min-height:155px; text-align:left; padding:18px; border-top:4px solid #147e81; }
  .chain button:nth-of-type(2) { border-top-color:#b08025; } .chain button:nth-of-type(3) { border-top-color:#b63563; }
  .chain button.active { outline:2px solid var(--text-primary); outline-offset:2px; }
  .chain span, .chain small { font-size:.8rem; } .chain strong { font-size:1.05rem; }
  button { border:1px solid var(--border-strong); border-radius:4px; background:var(--bg-secondary); color:var(--text-primary); font:inherit; cursor:pointer; }
  .editor { border-block:1px solid var(--border-subtle); padding:20px 0; } h2 { font-size:1.25rem; margin:0 0 16px; } h3 { font-size:1rem; } p { font-size:.9rem; line-height:1.6; }
  .source { display:flex; gap:20px; flex-wrap:wrap; border:0; padding:0; margin-bottom:16px; } .source label { display:flex; gap:8px; align-items:center; }
  label { display:block; font-size:.85rem; } input[type=number], select { display:block; width:100%; min-width:0; box-sizing:border-box; padding:10px; margin:8px 0; font:inherit; color:var(--text-primary); background:var(--bg-tertiary); border:1px solid var(--border-strong); border-radius:4px; }
  .fields, .regimens { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px 24px; max-width:850px; } .regimens { margin-top:24px; } .regimens fieldset { border:0; border-top:1px solid var(--border-subtle); padding:16px 0 0; min-width:0; }
  .comparison { max-width:420px; } li { font-size:.9rem; margin-block:8px; }
  .equation { border-block:1px solid var(--border-subtle); padding:12px 0; font-family:var(--font-mono); }
  .actions { display:flex; gap:12px; flex-wrap:wrap; align-items:center; padding:20px 0; } .actions button { display:inline-flex; gap:8px; align-items:center; padding:10px 14px; } .primary { background:#126e64; color:white; border-color:#126e64; }
  .actions span { font-size:.85rem; } .methods { border-top:1px solid var(--border-strong); padding-top:24px; margin-top:12px; } .reading { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:24px; }
  @media(max-width:760px) { .chain { grid-template-columns:1fr; gap:10px; } .chain :global(.connector) { transform:rotate(90deg); justify-self:center; } .chain button { min-height:125px; } .reading { grid-template-columns:1fr; gap:8px; } }
  @media(max-width:480px) { .fields,.regimens { grid-template-columns:1fr; } .actions button { width:100%; } }
</style>
