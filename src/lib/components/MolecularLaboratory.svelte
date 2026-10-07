<script>
  // @ts-nocheck
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { language } from '$lib/stores/language';
  import { ArrowLeft, BookOpen, Copy, Download, Pause, Play, RotateCcw, StepForward } from '@lucide/svelte';
  import MolecularScene from './MolecularScene.svelte';
  import MolecularPlot from './MolecularPlot.svelte';
  import { molecularLabIds, molecularLabs, validateMolecularParameters, molecularSeries, molecularStateAt, encodeMolecularScenario, decodeMolecularScenario } from '$lib/labs/molecular.js';
  export let lab;
  let activeLab = '', p = {}, reference = {}, time = 0, speed = 1, playing = false, compare = true, mode = 'intuition', prediction = '';
  let message = '', shared = '', loadError = '', animateParticles = true, raf = 0, last = 0, visible = true, animationArea;
  $: en = $language === 'en';
  $: config = molecularLabs[lab];
  $: if (config && activeLab !== lab) reset(lab);
  $: validation = (() => { try { return { value: validateMolecularParameters(lab, p), error: '' }; } catch (error) { return { value: null, error: String(error.message) }; } })();
  $: valid = validation.value;
  $: current = valid ? molecularSeries(lab, valid) : [];
  $: referenceRows = valid ? molecularSeries(lab, reference) : [];
  $: state = valid ? molecularStateAt(current, time) : null;
  $: referenceState = valid ? molecularStateAt(referenceRows, time) : null;
  $: end = valid?.end ?? 24;
  $: unit = config?.unit === 'day' ? (en ? 'days' : 'jours') : 'h';
  $: massError = state ? Object.values(state.mass).reduce((sum, value) => sum + value, 0) - state.administered : 0;

  function reset(next = lab) {
    pause(); activeLab = next; const defaults = molecularLabs[next]?.defaults ?? {};
    p = { ...defaults }; reference = { ...defaults }; time = 0; speed = molecularLabs[next]?.unit === 'day' ? 1 : 1;
    prediction = ''; message = ''; shared = ''; loadError = '';
  }
  function change(key, event) {
    pause(); p = { ...p, [key]: event.currentTarget.valueAsNumber }; time = 0; prediction = ''; shared = '';
  }
  function pause() { playing = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
  function play() {
    if (!valid || playing) return;
    if (time >= end) time = 0;
    playing = true; visible = true; last = performance.now();
    const step = now => {
      if (!playing) return;
      const elapsed = Math.min(.15, (now - last) / 1000); last = now;
      if (visible && !document.hidden) time = Math.min(end, time + elapsed * speed);
      if (time >= end) pause(); else raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }
  function switchLab(event) {
    const next = event.currentTarget.value;
    goto(`${base}/laboratoires/?lang=${en ? 'en' : 'fr'}&lab=${next}`);
  }
  function load() {
    if (!window.location.hash) return;
    try {
      const scenario = decodeMolecularScenario(window.location.hash);
      if (scenario.lab !== lab) return;
      p = scenario.parameters; reference = scenario.reference; time = 0; loadError = '';
    } catch { loadError = en ? 'Invalid shared scenario. No values were applied.' : "Scenario partage invalide. Aucune valeur n'a ete appliquee."; }
  }
  async function share() {
    if (!valid) return;
    const url = new URL(`${base}/laboratoires/`, window.location.origin);
    url.searchParams.set('lang', en ? 'en' : 'fr'); url.searchParams.set('lab', lab); url.hash = encodeMolecularScenario(lab, valid, reference); shared = url.href;
    try { await navigator.clipboard.writeText(shared); message = en ? 'Scenario link copied.' : 'Lien du scenario copie.'; }
    catch { message = en ? 'Scenario link ready below.' : 'Lien du scenario disponible ci-dessous.'; }
  }
  function csv() {
    if (!valid) return;
    const stateKeys = config.states.filter(key => key !== 'auc'), flowKeys = [...new Set(config.edges.map(edge => edge.flow))];
    const header = ['scenario', `time_${config.unit}`, 'primary_concentration_mg_L', 'secondary', `auc_mg_${config.unit}_L`, 'administered_amount', ...stateKeys, ...flowKeys.map(key => `flow_${key}`)];
    const rows = [['reference', referenceRows], ['current', current]].flatMap(([scenario, values]) => values.map(row => [scenario, row.t, row.c, row.secondary, row.auc, row.administered, ...stateKeys.map(key => row[key]), ...flowKeys.map(key => row.flows[key] ?? 0)]));
    const blob = new Blob([[header, ...rows].map(row => row.join(',')).join('\n')], { type: 'text/csv' }), url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = `${lab}-laboratory.csv`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  onMount(() => {
    load(); window.addEventListener('hashchange', load);
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (!visible) pause(); });
    if (animationArea) observer.observe(animationArea);
    const visibility = () => { if (document.hidden) pause(); };
    document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); window.removeEventListener('hashchange', load); document.removeEventListener('visibilitychange', visibility); };
  });
  onDestroy(pause);
</script>

{#if config}
<section class="molecular-lab" data-testid="molecular-laboratory">
  <a class="back-home" href={`${base}/laboratoires/?lang=${en ? 'en' : 'fr'}`}><ArrowLeft size={16}/>{en ? 'All laboratories' : 'Tous les laboratoires'}</a>
  <header class="heading">
    <div><p class="eyebrow">{en ? 'Advanced molecular journey' : 'Parcours moleculaire avance'} · {config.number}</p><h1>{en ? config.title.en : config.title.fr}</h1><p>{en ? config.summary.en : config.summary.fr}</p></div>
    <label class="lab-selector">{en ? 'Advanced laboratory' : 'Laboratoire avance'}<select value={lab} on:change={switchLab}>{#each molecularLabIds as id}<option value={id}>{molecularLabs[id].number} · {en ? molecularLabs[id].title.en : molecularLabs[id].title.fr}</option>{/each}</select></label>
  </header>
  {#if loadError}<p class="error" role="alert">{loadError}</p>{/if}
  <div class="lab-grid">
    <aside class="parameters" aria-label={en ? 'Experiment parameters' : "Parametres de l'experience"}>
      <div class="parameter-head"><strong>{en ? 'Current model' : 'Modele actuel'}</strong><span>{en ? config.route.en : config.route.fr}</span></div>
      <div class="numbers">{#each Object.entries(config.parameters) as [key, rule]}<label for={`molecular-${key}`}>{en ? rule.label.en : rule.label.fr}{#if rule.unit}<small>{rule.unit}</small>{/if}<input id={`molecular-${key}`} type="number" min={rule.min} max={rule.max} step={rule.step} value={p[key]} on:input={event => change(key, event)}/></label>{/each}</div>
      {#if validation.error}<p class="error" role="alert">{en ? 'Check the parameter range:' : 'Verifier la plage du parametre :'} {validation.error}</p>{/if}
      <label class="check"><input type="checkbox" bind:checked={compare}/>{en ? 'Compare with reference' : 'Comparer a la reference'}</label>
      <button class="command" disabled={!valid} on:click={() => reference = { ...valid }}><Copy size={17}/>{en ? 'Use this model as reference' : 'Prendre ce modele comme reference'}</button>
      {#if compare}<details><summary>{en ? 'Reference parameters' : 'Parametres de reference'}</summary><dl>{#each Object.keys(config.defaults) as key}<div><dt>{en ? config.parameters[key].label.en : config.parameters[key].label.fr}</dt><dd>{reference[key]}</dd></div>{/each}</dl></details>{/if}
      <section class="question"><strong>{en ? 'Predict before changing a parameter' : 'Predire avant de modifier un parametre'}</strong><p>{en ? config.question.en : config.question.fr}</p><select bind:value={prediction} aria-label={en ? 'Your prediction' : 'Votre prediction'}><option value="">{en ? 'Choose' : 'Choisir'}</option>{#each config.choices as choice, index}<option value={String(index)}>{en ? choice.en : choice.fr}</option>{/each}</select>{#if prediction !== ''}<p class:correct={Number(prediction) === config.answer} class="feedback">{Number(prediction) === config.answer ? (en ? 'Correct. ' : 'Exact. ') : (en ? 'Review the mechanism. ' : 'Revoir le mecanisme. ')}{en ? config.explanation.en : config.explanation.fr}</p>{/if}</section>
    </aside>
    <div class="experiment">
      <div class="display-modes" role="group" aria-label={en ? 'Representation' : 'Representation'}><button class:active={mode === 'intuition'} aria-pressed={mode === 'intuition'} on:click={() => mode = 'intuition'}>Intuition</button><button class:active={mode === 'model'} aria-pressed={mode === 'model'} on:click={() => mode = 'model'}>{en ? 'Equations' : 'Equations'}</button></div>
      <div bind:this={animationArea}>
        {#if valid && state}
          {#if mode === 'model'}<div class="equations"><code>{config.equations}</code><p>{en ? 'Deterministic educational model with fixed parameters and no residual error.' : 'Modele pedagogique deterministe, a parametres fixes et sans erreur residuelle.'}</p></div>{/if}
          <MolecularScene {lab} p={valid} {state} {time} {en} {playing} bind:animateParticles on:play={() => playing ? pause() : play()}/>
          <p class="scene-note">{en ? 'Particles illustrate active pathways; amounts, concentrations, exposure and mass balance come from the continuous ODE model.' : 'Les particules illustrent les voies actives ; quantités, concentrations, exposition et bilan de masse proviennent du modèle ODE continu.'} {en ? config.caveat.en : config.caveat.fr}</p>
          <div class="timebar">
            <button class="icon-button" aria-label={playing ? 'Pause' : (en ? 'Play' : 'Lecture')} title={playing ? 'Pause' : (en ? 'Play' : 'Lecture')} on:click={() => playing ? pause() : play()}>{#if playing}<Pause size={19}/>{:else}<Play size={19}/>{/if}</button>
            <button class="icon-button" aria-label={en ? 'Step forward' : 'Avancer'} title={en ? 'Step forward' : 'Avancer'} on:click={() => { pause(); time = Math.min(end, time + (config.unit === 'day' ? 1 : 1)); }}><StepForward size={19}/></button>
            <button class="icon-button" aria-label={en ? 'Restart' : 'Recommencer'} title={en ? 'Restart' : 'Recommencer'} on:click={() => { pause(); time = 0; }}><RotateCcw size={18}/></button>
            <label class="time-input">t ({unit})<input data-testid="molecular-time" type="number" min="0" max={end} step="0.1" value={time.toFixed(1)} on:input={event => { pause(); const value = event.currentTarget.valueAsNumber; if (Number.isFinite(value)) time = Math.max(0, Math.min(end, value)); }}/></label>
            <label class="speed">{en ? 'Speed' : 'Vitesse'}<select bind:value={speed} aria-label={en ? 'Speed' : 'Vitesse'}>{#each (config.unit === 'day' ? [.1,.5,1,4,7] : [.1,.5,1,4,12]) as value}<option value={value}>{value} {config.unit === 'day' ? (en ? 'day/s' : 'jour/s') : 'h/s'}</option>{/each}</select></label>
          </div>
          <input class="timeline" aria-label={en ? 'Simulation time' : 'Temps de simulation'} type="range" min="0" max={end} step="0.1" value={time} on:input={event => { pause(); time = event.currentTarget.valueAsNumber; }}/>
        {/if}
      </div>
      {#if valid && state}
        <div class="plot-legend"><span>{en ? 'Current model: solid' : 'Modele actuel : continu'}</span>{#if compare}<span class="reference">{en ? 'Reference: dashed' : 'Reference : pointilles'}</span>{/if}</div>
        <MolecularPlot a={referenceRows} b={current} {state} {time} {config} {en} {compare}/>
        <div class="metrics"><div><span>{en ? 'Primary concentration' : 'Concentration primaire'} · mg/L</span><strong data-testid="molecular-concentration">{state.c.toFixed(2)}</strong></div><div><span>{en ? config.secondary.en : config.secondary.fr} · {config.secondaryUnit}</span><strong>{state.secondary.toFixed(2)}</strong></div><div><span>AUC 0-{time.toFixed(1)} {unit} · mg·{config.unit}/L</span><strong>{state.auc.toFixed(2)}</strong></div></div>
        <details class="data"><summary>{en ? 'Amounts, flows and mass balance' : 'Quantités, flux et bilan de masse'}</summary><div class="table-scroll"><table><thead><tr><th>{en ? 'Quantity' : 'Grandeur'}</th><th>{en ? 'Current' : 'Actuel'}</th>{#if compare}<th>{en ? 'Reference' : 'Référence'}</th>{/if}</tr></thead><tbody>{#each config.states.filter(key => key !== 'auc') as key}<tr><th>{key}</th><td>{state[key].toFixed(3)}</td>{#if compare}<td>{referenceState[key].toFixed(3)}</td>{/if}</tr>{/each}{#each [...new Set(config.edges.map(edge => edge.flow))] as key}<tr><th>{key}</th><td>{state.flows[key].toFixed(3)}</td>{#if compare}<td>{referenceState.flows[key].toFixed(3)}</td>{/if}</tr>{/each}<tr><th>{en ? 'Mass-balance error' : 'Erreur du bilan de masse'} ({config.amountUnit ?? 'mg'})</th><td>{massError.toExponential(2)}</td>{#if compare}<td>{(Object.values(referenceState.mass).reduce((sum, value) => sum + value, 0) - referenceState.administered).toExponential(2)}</td>{/if}</tr></tbody></table></div></details>
      {/if}
      <div class="exports"><button class="command" disabled={!valid} on:click={share}><Copy size={17}/>{en ? 'Share scenario' : 'Partager le scenario'}</button><button class="command" disabled={!valid} on:click={csv}><Download size={17}/>CSV</button><button class="command" on:click={() => reset(lab)}><RotateCcw size={17}/>{en ? 'Reset experiment' : "Reinitialiser l'experience"}</button></div>
      {#if message}<p role="status">{message}</p>{/if}
      {#if shared}<label class="shared-link">{en ? 'Synthetic scenario link' : 'Lien du scenario synthetique'}<input readonly value={shared} on:focus={event => event.currentTarget.select()}/></label>{/if}
    </div>
  </div>
  <section class="continuity"><BookOpen size={20}/><div><strong>{en ? 'Continue with the scientific context' : 'Poursuivre avec le contexte scientifique'}</strong><a href={`${base}/chapitres/${config.related}/`}>{en ? 'Open the related course' : 'Ouvrir le cours associe'}</a><p>{en ? 'This laboratory is educational and does not constitute a validated drug model or dosing recommendation.' : "Ce laboratoire est pedagogique et ne constitue ni un modele medicamenteux valide ni une recommandation de dose."}</p></div></section>
</section>
{/if}

<style>
  .molecular-lab { --teal:#087b83; letter-spacing:0; }
  .back-home { display:inline-flex; align-items:center; gap:6px; margin-bottom:14px; color:var(--text-secondary); font-size:12px; text-decoration:none; }
  .heading { display:flex; align-items:end; justify-content:space-between; gap:28px; padding-bottom:22px; border-bottom:1px solid var(--border-strong); }
  .heading h1 { margin:5px 0 7px; font-size:32px; } .heading p { max-width:720px; margin:0; color:var(--text-secondary); line-height:1.55; }
  .eyebrow { font-size:11px; text-transform:uppercase; }
  .lab-selector { display:grid; gap:6px; min-width:250px; color:var(--text-secondary); font-size:11px; }
  .lab-selector select { width:100%; }
  .lab-grid { display:grid; grid-template-columns:280px minmax(0,1fr); }
  .parameters { min-width:0; padding:22px 20px 0 0; border-right:1px solid var(--border-subtle); }
  .experiment { min-width:0; padding:0 0 0 24px; }
  .parameter-head { display:flex; justify-content:space-between; gap:8px; margin-bottom:16px; font-size:14px; }.parameter-head span { color:var(--text-secondary); font-size:11px; }
  .numbers { display:grid; grid-template-columns:1fr 1fr; gap:10px; }.numbers label { min-width:0; color:var(--text-secondary); font-size:11px; }.numbers small { display:block; min-height:15px; color:var(--text-muted); }
  .numbers input { width:100%; box-sizing:border-box; margin-top:4px; padding:7px; }
  button, input, select { font:inherit; letter-spacing:0; color:var(--text-primary); } input, select { border:1px solid var(--border-strong); border-radius:4px; background:var(--bg-primary); }
  select { padding:8px; } button { cursor:pointer; } button:disabled { cursor:default; opacity:.5; }
  button:focus-visible, input:focus-visible, select:focus-visible, summary:focus-visible, a:focus-visible { outline:3px solid var(--teal); outline-offset:3px; }
  .check { display:flex; align-items:center; gap:7px; margin:17px 0 10px; font-size:12px; }
  .command { display:inline-flex; align-items:center; justify-content:center; gap:7px; min-height:36px; padding:8px 11px; border:1px solid var(--border-strong); border-radius:4px; background:var(--bg-tertiary); }
  details { margin-top:14px; } summary { cursor:pointer; font-size:12px; } dl { margin:8px 0; } dl div { display:flex; justify-content:space-between; gap:8px; padding:4px 0; border-bottom:1px solid var(--border-subtle); font-size:11px; } dt { color:var(--text-secondary); } dd { margin:0; font-family:var(--font-mono); }
  .question { margin-top:20px; padding-top:17px; border-top:1px solid var(--border-subtle); }.question strong { font-size:13px; }.question p { color:var(--text-secondary); font-size:12px; line-height:1.5; }.question select { width:100%; }.feedback { padding-left:9px; border-left:3px solid var(--warning); }.feedback.correct { border-left-color:var(--success); }
  .display-modes { display:flex; border-bottom:1px solid var(--border-strong); }.display-modes button { padding:13px 17px; border:0; border-bottom:3px solid transparent; background:none; color:var(--text-secondary); }.display-modes button.active { border-bottom-color:var(--teal); color:var(--text-primary); font-weight:700; }
  .equations { margin:16px 0; padding:15px; border-left:3px solid var(--teal); background:var(--bg-secondary); }.equations code { white-space:pre-wrap; font-size:12px; }.equations p, .scene-note { color:var(--text-secondary); font-size:11px; line-height:1.5; }
  .timebar { display:flex; align-items:center; gap:9px; flex-wrap:wrap; padding:13px 0 8px; }.icon-button { display:grid; place-items:center; width:38px; height:38px; padding:0; border:1px solid var(--border-strong); border-radius:4px; background:var(--bg-tertiary); }.time-input, .speed { display:flex; align-items:center; gap:6px; color:var(--text-secondary); font-size:11px; }.time-input input { width:78px; padding:7px; }.speed select { padding:7px; }
  .timeline { width:100%; accent-color:var(--teal); }.plot-legend { display:flex; gap:20px; margin:22px 0 4px; font-size:11px; }.plot-legend span:before { content:''; display:inline-block; width:20px; height:3px; margin-right:6px; background:var(--teal); vertical-align:middle; }.plot-legend .reference:before { background:repeating-linear-gradient(90deg,#8c4c89 0 6px,transparent 6px 10px); }
  .metrics { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); margin-top:10px; border-top:1px solid var(--border-strong); border-bottom:1px solid var(--border-strong); }.metrics div { padding:14px; border-right:1px solid var(--border-subtle); }.metrics div:last-child { border:0; }.metrics span { display:block; min-height:30px; color:var(--text-secondary); font-size:10px; }.metrics strong { font-size:21px; font-variant-numeric:tabular-nums; }
  .data { margin-top:18px; }.table-scroll { overflow:auto; } table { width:100%; margin-top:10px; border-collapse:collapse; font-size:11px; } th, td { padding:7px; border-bottom:1px solid var(--border-subtle); text-align:right; } th:first-child { text-align:left; } td { font-family:var(--font-mono); }
  .exports { display:flex; flex-wrap:wrap; gap:9px; margin-top:22px; }.shared-link { display:grid; gap:5px; margin-top:12px; font-size:11px; }.shared-link input { width:100%; box-sizing:border-box; padding:8px; }
  .error { color:var(--danger); font-size:12px; }
  .continuity { display:flex; gap:12px; margin-top:34px; padding:22px 0; border-top:1px solid var(--border-strong); }.continuity div { display:grid; gap:5px; }.continuity a { width:max-content; color:var(--accent-pk); }.continuity p { margin:3px 0 0; color:var(--text-secondary); font-size:11px; }
  @media(max-width:840px) { .heading { align-items:start; flex-direction:column; }.lab-selector { width:100%; min-width:0; }.lab-grid { grid-template-columns:1fr; }.parameters { padding:20px 0; border-right:0; border-bottom:1px solid var(--border-subtle); }.experiment { padding:0; }.numbers { grid-template-columns:repeat(3,minmax(0,1fr)); } }
  @media(max-width:560px) { .heading h1 { font-size:27px; }.numbers { grid-template-columns:1fr 1fr; }.metrics { grid-template-columns:1fr; }.metrics div { border-right:0; border-bottom:1px solid var(--border-subtle); }.timebar { gap:6px; }.time-input input { width:64px; } }
</style>
