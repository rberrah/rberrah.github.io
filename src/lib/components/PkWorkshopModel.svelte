<script>
  import { untrack } from 'svelte';
  import { base } from '$app/paths';
  import { tdmModels } from '$lib/content/tdmModels';
  import { language } from '$lib/stores/language';
  import { mrgsolveParameterChoices } from '$lib/lego/mlxtran';
  let { model = $bindable(), regimen = $bindable({dose:100, interval:24, infusion:0}), side, showRegimen = true, units = false, onparameters = (/** @type {{name: string, value: number}[]} */ _values) => {} } = $props();
  let code = $state('');
  let error = $state('');
  let english = $derived($language === 'en');
  let record = $derived(tdmModels.find((item) => item.id === model.id));
  $effect(() => {
    const id = model.id;
    const source = model.source;
    const controller = new AbortController();
    if (source === 'library') {
      const selected = tdmModels.find((item) => item.id === id);
      if (selected) fetch(`${base}${selected.href}`, { signal: controller.signal })
        .then((response) => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.text(); })
        .then((value) => { code = value; error = ''; })
        .catch((e) => { if (e.name !== 'AbortError') { code = ''; error = String(e); } });
    }
    return () => controller.abort();
  });
  $effect(() => {
    const text = model.source === 'code' ? model.code : code;
    /** @type {{name: string, value: number}[]} */
    let parameters = [];
    try { parameters = mrgsolveParameterChoices(text); } catch { /* Compilation remains authoritative. */ }
    untrack(() => onparameters(parameters));
  });
  $effect(() => {
    if (model.source === 'library' && record && !record.routes.includes(model.route)) model.route = record.routes[0];
    if (showRegimen && (units || model.source === 'library') && model.route === 'Oral') regimen.infusion = 0;
  });
</script>

<div class="pk-model">
  <fieldset class="source"><legend>{english ? 'Model source' : 'Source du modele'} {side}</legend>
    <label><input type="radio" bind:group={model.source} value="library" /> {english ? 'MIPD library' : 'Bibliotheque MIPD'}</label>
    <label><input type="radio" bind:group={model.source} value="code" /> mrgsolve / Lego</label>
  </fieldset>
  {#if model.source === 'library'}
    <label for={`model-${side}`}>{english ? 'PK model' : 'Modele PK'} {side}</label>
    <select id={`model-${side}`} bind:value={model.id}>{#each tdmModels as item}<option value={item.id}>{english ? item.drugEn : item.drug} / {item.model}</option>{/each}</select>
    <label for={`route-${side}`}>{english ? 'Administration route' : "Voie d'administration"}</label>
    <select id={`route-${side}`} bind:value={model.route}>{#each record?.routes ?? [] as route}<option>{route}</option>{/each}</select>
    {#if record}<p class="source-note">{english ? record.populationEn : record.population} <a href={`https://doi.org/${record.doi}`} target="_blank" rel="noopener noreferrer">DOI {record.doi}</a></p>{/if}
  {:else}
    <label for={`cpp-${side}`}>mrgsolve / C++ {side}</label><textarea id={`cpp-${side}`} bind:value={model.code} rows="9" maxlength="200000" spellcheck="false"></textarea>
    <a href={`${base}/lego/`} target="_blank" rel="noopener noreferrer">{english ? 'PK Lego workshop' : 'Atelier Lego PK'}</a>
    {#if units}<label for={`route-${side}`}>{english ? 'Administration route' : "Voie d'administration"}</label><select id={`route-${side}`} bind:value={model.route}><option>IV</option><option>Oral</option></select>{/if}
  {/if}
  {#if units}<div class="numbers">
    <label>{english ? 'PK code time unit' : 'Unite de temps du code PK'}<select bind:value={model.time_unit}><option value="h">h</option><option value="day">{english ? 'Day' : 'Jour'}</option></select></label>
    <label>{english ? 'Concentration factor to PD units' : 'Facteur concentration vers unites PD'}<input type="number" bind:value={model.concentration_scale} min="0.000000001" step="any" required /></label>
  </div>{/if}
  {#if showRegimen}
  <div class="numbers">
    <label>{english ? 'Dose (model unit)' : 'Dose (unite du modele)'}<input type="number" bind:value={regimen.dose} min="0.001" required step="any" /></label>
    <label>{english ? 'Interval (h)' : 'Intervalle (h)'}<input type="number" bind:value={regimen.interval} min="0.25" required step="any" /></label>
    <label>{english ? 'Infusion (h)' : 'Perfusion (h)'}<input type="number" bind:value={regimen.infusion} min="0" max={regimen.interval} required step="any" disabled={(units || model.source === 'library') && model.route === 'Oral'} /></label>
  </div>
  {/if}
  <p class="source-note">{units ? (english ? 'PK parameters, covariates, concentration output and dosing compartment can be selected in R. Infusion = 0 for oral dosing.' : 'Parametres PK, covariables, sortie concentration et compartiment de dose sont selectionnables dans R. Perfusion = 0 pour la voie orale.') : (english ? 'Infusion = 0 for oral or IV bolus. Population values; either drug can independently use a TDM fit within the engine session.' : 'Perfusion = 0 pour oral ou bolus IV. Valeurs populationnelles ; chaque molecule peut reprendre independamment un ajustement TDM dans la session du moteur.')}</p>
  {#if error}<p role="alert">{error}</p>{/if}
</div>

<style>
  .pk-model { max-width: 850px; } label { display: block; font-size: 0.85rem; margin: 8px 0; }
  select, textarea, input[type=number] { display: block; width: 100%; min-width: 0; box-sizing: border-box; padding: 9px; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-strong); border-radius: 4px; font: inherit; }
  textarea { font-family: var(--font-mono); font-size: 0.8rem; }
  .source { border: 0; padding: 0; display: flex; gap: 20px; flex-wrap: wrap; } .source label { display: flex; gap: 8px; align-items: center; } legend { font-size: 0.8rem; }
  .numbers { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; }
  .source-note { font-size: 0.8rem; color: var(--text-secondary); } .source-note a { overflow-wrap: anywhere; }
  @media (max-width: 550px) { .numbers { grid-template-columns: 1fr; gap: 0; } }
</style>
