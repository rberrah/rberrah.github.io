<script>
  // @ts-nocheck
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { language } from '$lib/stores/language';
  import chapters from '$lib/content/loadChapters';
  import { ArrowLeft, BookOpen, Copy, Download, Eye, EyeOff, GraduationCap, Pause, Play, RotateCcw, StepForward } from '@lucide/svelte';
  import MolecularScene from './MolecularScene.svelte';
  import MolecularPlot from './MolecularPlot.svelte';
  import LabDebrief from './LabDebrief.svelte';
  import { molecularLabIds, molecularLabs, validateMolecularParameters, molecularSeries, molecularStateAt, encodeMolecularScenario, decodeMolecularScenario } from '$lib/labs/molecular.js';
  export let lab;
  const fundamentalLabs = [
    { id: 'distribution', number: '01', en: 'Two-compartment distribution', fr: 'Distribution à deux compartiments' },
    { id: 'accumulation', number: '02', en: 'Repeated doses and accumulation', fr: 'Doses répétées et accumulation' },
    { id: 'absorption', number: '03', en: 'Oral absorption and bioavailability', fr: 'Absorption orale et biodisponibilite' },
    { id: 'infusion', number: '04', en: 'Infusion and washout', fr: 'Perfusion et décroissance' }
  ];
  let activeLab = '', p = {}, reference = {}, time = 0, speed = 1, playing = false, compare = true, mode = 'intuition', prediction = '', learningMode = 'guided';
  let teacher = false, hidden = false, sourceChapter = '';
  let message = '', shared = '', loadError = '', animateParticles = true, raf = 0, last = 0, visible = true, animationArea;
  const chapterSlugs = new Set(chapters.map(chapter => chapter.slug));
  $: en = $language === 'en';
  $: config = molecularLabs[lab];
  $: relatedChapter = sourceChapter || config?.related;
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
  $: metric = state && valid ? config.metric?.(state, valid, time) ?? { label: { en: `AUC 0-${time.toFixed(1)} ${unit}`, fr: `AUC 0-${time.toFixed(1)} ${unit}` }, value: state.auc, unit: `mg·${config.unit}/L` } : null;
  const focusParameters = { 'parent-metabolite': 'kmet', 'long-acting': 'krel', saturable: 'dose', enterohepatic: 'kempty', tmdd: 'dose', 'effect-compartment': 'ke0', 'pd-general': 'model', 'pd-oncology': 'resistance', 'pd-infectiology': 'tau', 'covariate-volume': 'weight', 'covariate-clearance': 'gfr' };
  const applications = {
    'parent-metabolite': app('If metabolite clearance falls, what happens to its exposure?', 'Si la clairance du métabolite diminue, que devient son exposition ?', ['It increases', 'It decreases'], ['Elle augmente', 'Elle diminue'], 0, 'Slower metabolite removal increases its exposure.', 'Une élimination plus lente du métabolite augmente son exposition.'),
    'long-acting': app('A slower release mainly changes which feature?', 'Une libération plus lente modifie surtout quelle grandeur ?', ['The first peak', 'The administered dose'], ['Le premier pic', 'La dose administrée'], 0, 'Release controls the input profile, not the nominal dose.', "La libération contrôle le profil d'entrée, pas la dose nominale."),
    saturable: app('Above Km, can dose proportionality be assumed?', 'Au-dessus de Km, peut-on supposer la proportionnalité à la dose ?', ['No', 'Yes'], ['Non', 'Oui'], 0, 'Saturation makes exposure increase more than proportionally.', "La saturation peut faire augmenter l'exposition plus que proportionnellement."),
    enterohepatic: app('What can recirculation create on a concentration curve?', 'Que peut créer une recirculation sur la courbe de concentration ?', ['A secondary peak', 'An immediate zero concentration'], ['Un pic secondaire', 'Une concentration immédiatement nulle'], 0, 'Biliary release and reabsorption can generate secondary peaks.', 'La vidange biliaire et la réabsorption peuvent produire des pics secondaires.'),
    tmdd: app('At target saturation, which pathway becomes relatively less important?', 'Quand la cible est saturée, quelle voie devient relativement moins importante ?', ['Target-mediated elimination', 'Linear elimination'], ['Élimination médiée par la cible', 'Élimination linéaire'], 0, 'The saturable target-mediated pathway contributes less to total clearance.', 'La voie saturable médiée par la cible contribue relativement moins à la clairance totale.'),
    'effect-compartment': app('A smaller ke0 produces what pattern?', 'Un ke0 plus faible produit quel profil ?', ['A longer effect delay', 'No delay'], ["Un retard d'effet plus long", 'Aucun retard'], 0, 'Slower equilibration increases hysteresis and delays the effect peak.', "Un équilibrage plus lent augmente l'hystérèse et retarde le pic d'effet."),
    'pd-general': app('Which plot reveals hysteresis most directly?', "Quel graphique révèle le plus directement l'hystérèse ?", ['Effect versus concentration', 'Dose versus time'], ['Effet en fonction de la concentration', 'Dose en fonction du temps'], 0, 'A loop in the effect-concentration plane shows temporal dissociation.', 'Une boucle effet-concentration montre la dissociation temporelle.'),
    'pd-oncology': app('Does tumour shrinkage in this simulation prove a survival benefit?', 'La réduction tumorale simulée prouve-t-elle un bénéfice de survie ?', ['No', 'Yes'], ['Non', 'Oui'], 0, 'It is a model-conditional prediction, not causal proof.', "Il s'agit d'une prédiction conditionnelle au modèle, pas d'une preuve causale."),
    'pd-infectiology': app('Is time above MIC for one profile a PTA?', "Le temps au-dessus de la CMI d'un profil est-il une PTA ?", ['No', 'Yes'], ['Non', 'Oui'], 0, 'PTA is the proportion of a population attaining a defined target.', 'La PTA est la proportion d’une population atteignant une cible définie.'),
    'covariate-volume': app('At fixed amount, a larger volume gives what concentration?', 'À quantité fixe, un volume plus grand donne quelle concentration ?', ['Lower', 'Higher'], ['Plus faible', 'Plus élevée'], 0, 'C=A/V, so dilution lowers concentration.', 'C=A/V : la dilution diminue la concentration.'),
    'covariate-clearance': app('At fixed dose, a higher renal clearance gives what AUC?', 'À dose fixe, une clairance rénale plus élevée donne quelle AUC ?', ['Lower', 'Higher'], ['Plus faible', 'Plus élevée'], 0, 'Under linear PK, AUC=Dose/CL.', 'Sous PK linéaire, AUC=Dose/CL.')
  };
  function app(enQuestion, frQuestion, enOptions, frOptions, answer, enFeedback, frFeedback) { return { question: { en: enQuestion, fr: frQuestion }, options: enOptions.map((value, index) => ({ en: value, fr: frOptions[index] })), answer, feedback: { en: enFeedback, fr: frFeedback } }; }
  $: parameterEntries = Object.entries(config?.parameters ?? {});
  $: focusParameter = focusParameters[lab] ?? parameterEntries[0]?.[0];
  $: visibleParameters = learningMode === 'guided' ? parameterEntries.filter(([key]) => key === focusParameter) : parameterEntries;
  $: lockedParameters = parameterEntries.filter(([key]) => key !== focusParameter);
  $: if (!teacher) hidden = false;
  $: if (hidden || !valid) pause();

  function reset(next = lab) {
    pause(); activeLab = next; const defaults = molecularLabs[next]?.defaults ?? {};
    p = { ...defaults }; reference = { ...defaults }; time = 0; speed = molecularLabs[next]?.unit === 'day' ? 1 : 1;
    compare = molecularLabs[next]?.referenceMode !== 'intrinsic'; prediction = ''; message = ''; shared = ''; loadError = ''; teacher = false; hidden = false;
  }
  function change(key, event) {
    const rule = config.parameters[key], value = rule.options ? Number(event.currentTarget.value) : event.currentTarget.valueAsNumber;
    p = { ...p, [key]: value }; if (key === 'end' && Number.isFinite(value)) time = Math.min(time, value); prediction = ''; shared = '';
  }
  function directChange(event) {
    const { key, value } = event.detail;
    if (!config.parameters[key] || !Number.isFinite(value)) return;
    p = { ...p, [key]: value }; prediction = ''; shared = '';
  }
  function pause() { playing = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
  function play() {
    if (!valid || hidden || playing) return;
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
    sourceChapter = '';
    goto(`${base}/laboratoires/?lang=${en ? 'en' : 'fr'}&lab=${next}`);
  }
  function load() {
    if (!window.location.hash) return;
    try {
      const scenario = decodeMolecularScenario(window.location.hash);
      if (scenario.lab !== lab) return;
      p = scenario.parameters; reference = scenario.reference; teacher = scenario.teacher; hidden = scenario.hidden; time = 0; loadError = '';
    } catch { loadError = en ? 'Invalid shared scenario. No values were applied.' : "Scénario partagé invalide. Aucune valeur n'a été appliquée."; }
  }
  async function share() {
    if (!valid) return;
    const url = new URL(`${base}/laboratoires/`, window.location.origin);
    url.searchParams.set('lang', en ? 'en' : 'fr'); url.searchParams.set('lab', lab); url.hash = encodeMolecularScenario(lab, valid, reference, teacher, hidden); shared = url.href;
    try { await navigator.clipboard.writeText(shared); message = en ? 'Scenario link copied.' : 'Lien du scénario copié.'; }
    catch { message = en ? 'Scenario link ready below.' : 'Lien du scénario disponible ci-dessous.'; }
  }
  function csv() {
    if (!valid) return;
    const stateKeys = config.states.filter(key => key !== 'auc'), flowKeys = [...new Set(config.edges.map(edge => edge.flow))], extraKeys = config.exportKeys ?? [];
    const header = ['scenario', `time_${config.unit}`, 'primary_concentration_mg_L', 'secondary', `auc_mg_${config.unit}_L`, 'administered_amount', ...stateKeys, ...extraKeys, ...flowKeys.map(key => `flow_${key}`)];
    const scenarios = config.referenceMode === 'intrinsic' ? [['current', current]] : [['reference', referenceRows], ['current', current]];
    const rows = scenarios.flatMap(([scenario, values]) => values.map(row => [scenario, row.t, row.c, row.secondary, row.auc, row.administered, ...stateKeys.map(key => row[key]), ...extraKeys.map(key => row[key]), ...flowKeys.map(key => row.flows[key] ?? 0)]));
    const blob = new Blob([[header, ...rows].map(row => row.join(',')).join('\n')], { type: 'text/csv' }), url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = `${lab}-laboratory.csv`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  onMount(() => {
    const from = new URLSearchParams(window.location.search).get('from') ?? '';
    sourceChapter = chapterSlugs.has(from) ? from : '';
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
    <div><p class="eyebrow">{config.category ? (en ? config.category.en : config.category.fr) : (en ? 'Advanced molecular journey' : 'Parcours moleculaire avance')} · {config.number}</p><h1>{en ? config.title.en : config.title.fr}</h1><p>{en ? config.summary.en : config.summary.fr}</p></div>
    <label class="lab-selector">{en ? 'Interactive laboratory' : 'Laboratoire interactif'}<select value={lab} on:change={switchLab}>{#each fundamentalLabs as item}<option value={item.id}>{item.number} · {en ? item.en : item.fr}</option>{/each}{#each molecularLabIds as id}<option value={id}>{molecularLabs[id].number} · {en ? molecularLabs[id].title.en : molecularLabs[id].title.fr}</option>{/each}</select></label>
  </header>
  <div class="teacher-toggle"><label class="check"><GraduationCap size={19}/><input type="checkbox" bind:checked={teacher}/>{en ? 'Teacher mode' : 'Mode enseignant'}</label></div>
  {#if loadError}<p class="error" role="alert">{loadError}</p>{/if}
  <div class="lab-grid">
    <aside class="parameters" aria-label={en ? 'Experiment parameters' : "Paramètres de l'expérience"}>
      <div class="parameter-head"><strong>{en ? 'Current model' : 'Modèle actuel'}</strong><span>{en ? config.route.en : config.route.fr}</span></div>
      <section class="question first"><strong>01 · {en ? 'Predict before changing a parameter' : 'Prédire avant de modifier un paramètre'}</strong><p>{en ? config.question.en : config.question.fr}</p><select bind:value={prediction} aria-label={en ? 'Your prediction' : 'Votre prediction'}><option value="">{en ? 'Choose' : 'Choisir'}</option>{#each config.choices as choice, index}<option value={String(index)}>{en ? choice.en : choice.fr}</option>{/each}</select>{#if prediction !== '' && !hidden}<p class:correct={Number(prediction) === config.answer} class="feedback">{Number(prediction) === config.answer ? (en ? 'Correct. ' : 'Exact. ') : (en ? 'Review the mechanism. ' : 'Revoir le mecanisme. ')}{en ? config.explanation.en : config.explanation.fr}</p>{/if}</section>
      <div class="learning-mode" role="group" aria-label={en ? 'Learning mode' : "Mode d'apprentissage"}><button data-testid="molecular-learning-guided" type="button" class:active={learningMode === 'guided'} aria-pressed={learningMode === 'guided'} on:click={() => learningMode = 'guided'}>{en ? 'Discovery' : 'Découverte'}</button><button data-testid="molecular-learning-free" type="button" class:active={learningMode === 'free'} aria-pressed={learningMode === 'free'} on:click={() => learningMode = 'free'}>{en ? 'Free mode' : 'Mode libre'}</button></div>
      {#if learningMode === 'guided'}<p class="guided-note"><b>02 · {en ? 'Manipulate' : 'Manipuler'}</b> {en ? 'Change one mechanism, then observe both representations.' : 'Modifiez un seul mécanisme, puis observez les deux représentations.'}</p>{/if}
      <div class="numbers" class:guided={learningMode === 'guided'}>{#each visibleParameters as [key, rule]}<label for={`molecular-${key}`}>{en ? rule.label.en : rule.label.fr}{#if rule.unit}<small>{rule.unit}</small>{:else}<small></small>{/if}{#if rule.options}<select id={`molecular-${key}`} value={p[key]} on:change={event => change(key, event)}>{#each rule.options as option}<option value={option.value}>{en ? option.label.en : option.label.fr}</option>{/each}</select>{:else}<input id={`molecular-${key}`} type="number" min={rule.min} max={rule.max} step={rule.step} value={p[key]} on:input={event => change(key, event)}/>{/if}</label>{/each}</div>
      {#if learningMode === 'guided'}<details class="locked"><summary>{en ? 'Fixed parameters in discovery mode' : 'Paramètres fixés en mode découverte'}</summary><dl>{#each lockedParameters as [key, rule]}<div><dt>{en ? rule.label.en : rule.label.fr}</dt><dd>{p[key]} {rule.unit ?? ''}</dd></div>{/each}</dl></details>{/if}
      {#if validation.error}<p class="error" role="alert">{en ? 'Check the parameter range:' : 'Vérifier la plage du paramètre :'} {validation.error}</p>{/if}
      {#if config.referenceMode !== 'intrinsic'}
        <label class="check"><input type="checkbox" bind:checked={compare}/>{en ? 'Compare with reference' : 'Comparer à la référence'}</label>
        <button class="command" disabled={!valid} on:click={() => reference = { ...valid }}><Copy size={17}/>{en ? 'Use this model as reference' : 'Prendre ce modèle comme référence'}</button>
        {#if compare}<details><summary>{en ? 'Reference parameters' : 'Paramètres de référence'}</summary><dl>{#each Object.keys(config.defaults) as key}<div><dt>{en ? config.parameters[key].label.en : config.parameters[key].label.fr}</dt><dd>{reference[key]}</dd></div>{/each}</dl></details>{/if}
      {/if}
    </aside>
    <div class="experiment">
      {#if learningMode === 'guided'}<p class="stage"><b>03 · {en ? 'Observe' : 'Observer'}</b> {en ? 'Follow the mechanism and the curve, then compare the quantitative metrics.' : 'Suivez le mécanisme et la courbe, puis comparez les mesures quantitatives.'}</p>{/if}
      <div class="display-modes" role="group" aria-label={en ? 'Representation' : 'Représentation'}><button class:active={mode === 'intuition'} aria-pressed={mode === 'intuition'} on:click={() => mode = 'intuition'}>Intuition</button><button class:active={mode === 'model'} aria-pressed={mode === 'model'} on:click={() => mode = 'model'}>{en ? 'Equations' : 'Équations'}</button></div>
      <div bind:this={animationArea}>
        {#if valid && state && !hidden}
          {#if mode === 'model'}<div class="equations"><code>{config.equations}</code><p>{en ? 'Deterministic educational model with fixed parameters and no residual error.' : 'Modèle pédagogique déterministe, à paramètres fixes et sans erreur résiduelle.'}</p></div>{/if}
          <div class="visual-grid">
            <div class="scene-panel">
              <MolecularScene {lab} p={valid} {state} {time} {en} {playing} bind:animateParticles on:play={() => playing ? pause() : play()} on:parameter={directChange}/>
              <p class="scene-note">{en ? 'Particles illustrate active pathways; amounts, concentrations, exposure and mass balance come from the continuous ODE model.' : 'Les particules illustrent les voies actives ; quantités, concentrations, exposition et bilan de masse proviennent du modèle ODE continu.'} {en ? config.caveat.en : config.caveat.fr}</p>
            </div>
            <div class="curve-panel">
              <div class="plot-legend">{#if config.referenceMode === 'intrinsic'}<span class="treated">{en ? 'With treatment: solid' : 'Avec traitement : continu'}</span><span class="untreated">{en ? 'Without treatment: dashed' : 'Sans traitement : pointillés'}</span>{:else}<span>{en ? 'Current model: solid' : 'Modèle actuel : continu'}</span>{#if compare}<span class="reference">{en ? 'Reference: dashed' : 'Référence : pointillés'}</span>{/if}{/if}</div>
              <MolecularPlot a={referenceRows} b={current} {state} {time} {config} {en} {compare}/>
            </div>
          </div>
          <div class="timebar">
            <button class="icon-button" aria-label={playing ? 'Pause' : (en ? 'Play' : 'Lecture')} title={playing ? 'Pause' : (en ? 'Play' : 'Lecture')} on:click={() => playing ? pause() : play()}>{#if playing}<Pause size={19}/>{:else}<Play size={19}/>{/if}</button>
            <button class="icon-button" aria-label={en ? 'Step forward' : 'Avancer'} title={en ? 'Step forward' : 'Avancer'} on:click={() => { pause(); time = Math.min(end, time + (config.unit === 'day' ? 1 : 1)); }}><StepForward size={19}/></button>
            <button class="icon-button" aria-label={en ? 'Restart' : 'Recommencer'} title={en ? 'Restart' : 'Recommencer'} on:click={() => { pause(); time = 0; }}><RotateCcw size={18}/></button>
            <label class="time-input">t ({unit})<input data-testid="molecular-time" type="number" min="0" max={end} step="0.1" value={time.toFixed(1)} on:input={event => { pause(); const value = event.currentTarget.valueAsNumber; if (Number.isFinite(value)) time = Math.max(0, Math.min(end, value)); }}/></label>
            <label class="speed">{en ? 'Speed' : 'Vitesse'}<select bind:value={speed} aria-label={en ? 'Speed' : 'Vitesse'}>{#each (config.unit === 'day' ? [.1,.5,1,4,7] : [.1,.5,1,4,12]) as value}<option value={value}>{value} {config.unit === 'day' ? (en ? 'day/s' : 'jour/s') : 'h/s'}</option>{/each}</select></label>
          </div>
          <input class="timeline" aria-label={en ? 'Simulation time' : 'Temps de simulation'} type="range" min="0" max={end} step="0.1" value={time} on:input={event => { pause(); time = event.currentTarget.valueAsNumber; }}/>
        {:else if hidden}<div class="hidden-scene"><EyeOff size={28}/><strong>{en ? 'Results hidden' : 'Résultats masqués'}</strong></div>{/if}
      </div>
      {#if valid && state && !hidden}
        <div class:two={config.plotMode === 'primary'} class="metrics"><div><span>{en ? 'Primary concentration' : 'Concentration primaire'} · mg/L</span><strong data-testid="molecular-concentration">{state.c.toFixed(2)}</strong></div>{#if config.plotMode !== 'primary'}<div><span>{en ? config.secondary.en : config.secondary.fr} · {config.secondaryUnit}</span><strong>{state.secondary.toFixed(2)}</strong></div>{/if}<div><span>{en ? metric.label.en : metric.label.fr} · {metric.unit}</span><strong>{metric.value.toFixed(2)}</strong></div></div>
        <p id="molecular-plot-summary" class="sr-summary">{en ? `At ${time.toFixed(1)} ${unit}, primary concentration is ${state.c.toFixed(2)} mg/L and ${config.secondary.en.toLowerCase()} is ${state.secondary.toFixed(2)} ${config.secondaryUnit}.` : `À ${time.toFixed(1)} ${unit}, la concentration primaire vaut ${state.c.toFixed(2)} mg/L et ${config.secondary.fr.toLowerCase()} vaut ${state.secondary.toFixed(2)} ${config.secondaryUnit}.`}</p>
        {#key lab}<LabDebrief {en} explanation={config.explanation} application={applications[lab]}/>{/key}
        <details class="data"><summary>{en ? 'Amounts, flows and mass balance' : 'Quantités, flux et bilan de masse'}</summary><div class="table-scroll"><table><thead><tr><th>{en ? 'Quantity' : 'Grandeur'}</th><th>{en ? 'Current' : 'Actuel'}</th>{#if compare}<th>{en ? 'Reference' : 'Référence'}</th>{/if}</tr></thead><tbody>{#each config.states.filter(key => key !== 'auc') as key}<tr><th>{key}</th><td>{state[key].toFixed(3)}</td>{#if compare}<td>{referenceState[key].toFixed(3)}</td>{/if}</tr>{/each}{#each [...new Set(config.edges.map(edge => edge.flow))] as key}<tr><th>{key}</th><td>{state.flows[key].toFixed(3)}</td>{#if compare}<td>{referenceState.flows[key].toFixed(3)}</td>{/if}</tr>{/each}<tr><th>{en ? 'Mass-balance error' : 'Erreur du bilan de masse'} ({config.amountUnit ?? 'mg'})</th><td>{massError.toExponential(2)}</td>{#if compare}<td>{(Object.values(referenceState.mass).reduce((sum, value) => sum + value, 0) - referenceState.administered).toExponential(2)}</td>{/if}</tr></tbody></table></div></details>
      {/if}
      {#if teacher}<section class="teacher"><h3><GraduationCap size={20}/>{en ? 'Teacher scenario' : 'Scénario enseignant'}</h3><label class="check"><input type="checkbox" bind:checked={hidden}/>{en ? 'Hide results at opening' : "Masquer les résultats à l'ouverture"}</label><p>{en ? 'Synthetic parameters only. The learner may reveal the results; this is not a secure examination mode.' : "Paramètres synthétiques uniquement. L'apprenant peut révéler les résultats ; ce n'est pas un examen verrouillé."}</p><button class="command" on:click={() => hidden = !hidden}><Eye size={17}/>{hidden ? (en ? 'Reveal results' : 'Révéler les résultats') : (en ? 'Hide results' : 'Masquer les résultats')}</button></section>{/if}
      <div class="exports"><button class="command" disabled={!valid} on:click={share}><Copy size={17}/>{en ? 'Share scenario' : 'Partager le scénario'}</button><button class="command" disabled={!valid || hidden} on:click={csv}><Download size={17}/>CSV</button><button class="command" on:click={() => reset(lab)}><RotateCcw size={17}/>{en ? 'Reset experiment' : "Réinitialiser l'expérience"}</button></div>
      {#if message}<p role="status">{message}</p>{/if}
      {#if shared}<label class="shared-link">{en ? 'Synthetic scenario link' : 'Lien du scénario synthétique'}<input readonly value={shared} on:focus={event => event.currentTarget.select()}/></label>{/if}
    </div>
  </div>
  <section class="continuity"><BookOpen size={20}/><div><strong>{en ? 'Continue with the scientific context' : 'Poursuivre avec le contexte scientifique'}</strong><a data-testid="lab-return-course" href={`${base}/chapitres/${relatedChapter}/?lang=${en ? 'en' : 'fr'}`}>{sourceChapter ? (en ? 'Return to the originating course' : "Revenir au cours d'origine") : (en ? 'Open the related course' : 'Ouvrir le cours associé')}</a><a data-testid="lab-related-exercises" href={`${base}/chapitres/${relatedChapter}/?lang=${en ? 'en' : 'fr'}#chapter-exercises`}>{en ? 'Practice with the related exercises' : 'S’entraîner avec les exercices associés'}</a><p>{en ? 'This laboratory is educational and does not constitute a validated drug model or dosing recommendation.' : "Ce laboratoire est pédagogique et ne constitue ni un modèle médicamenteux validé ni une recommandation de dose."}</p></div></section>
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
  .teacher-toggle { display:flex; justify-content:flex-end; padding:10px 0 0; }
  .lab-grid { display:grid; grid-template-columns:280px minmax(0,1fr); }
  .parameters { min-width:0; padding:22px 20px 0 0; border-right:1px solid var(--border-subtle); }
  .experiment { min-width:0; padding:0 0 0 24px; }
  .parameter-head { display:flex; justify-content:space-between; gap:8px; margin-bottom:16px; font-size:14px; }.parameter-head span { color:var(--text-secondary); font-size:11px; }
  .numbers { display:grid; grid-template-columns:1fr 1fr; gap:10px; }.numbers label { min-width:0; color:var(--text-secondary); font-size:11px; }.numbers small { display:block; min-height:15px; color:var(--text-muted); }
  .numbers.guided { grid-template-columns:1fr; }
  .numbers input, .numbers select { width:100%; box-sizing:border-box; margin-top:4px; padding:7px; }
  button, input, select { font:inherit; letter-spacing:0; color:var(--text-primary); } input, select { border:1px solid var(--border-strong); border-radius:4px; background:var(--bg-primary); }
  select { padding:8px; } button { cursor:pointer; } button:disabled { cursor:default; opacity:.5; }
  button:focus-visible, input:focus-visible, select:focus-visible, summary:focus-visible, a:focus-visible { outline:3px solid var(--teal); outline-offset:3px; }
  .check { display:flex; align-items:center; gap:7px; margin:17px 0 10px; font-size:12px; }
  .learning-mode { display:grid; grid-template-columns:1fr 1fr; margin:12px 0; border:1px solid var(--border-strong); border-radius:4px; }
  .learning-mode button { padding:8px; border:0; background:transparent; color:var(--text-secondary); }
  .learning-mode button.active { background:var(--text-primary); color:var(--bg-primary); font-weight:700; }
  .guided-note, .stage { color:var(--text-secondary); font-size:12px; line-height:1.5; }
  .guided-note b, .stage b { color:var(--teal); font-family:var(--font-mono); }
  .locked { margin-bottom:14px; }
  .command { display:inline-flex; align-items:center; justify-content:center; gap:7px; min-height:36px; padding:8px 11px; border:1px solid var(--border-strong); border-radius:4px; background:var(--bg-tertiary); }
  details { margin-top:14px; } summary { cursor:pointer; font-size:12px; } dl { margin:8px 0; } dl div { display:flex; justify-content:space-between; gap:8px; padding:4px 0; border-bottom:1px solid var(--border-subtle); font-size:11px; } dt { color:var(--text-secondary); } dd { margin:0; font-family:var(--font-mono); }
  .question { margin-top:20px; padding-top:17px; border-top:1px solid var(--border-subtle); }.question strong { font-size:13px; }.question p { color:var(--text-secondary); font-size:12px; line-height:1.5; }.question select { width:100%; }.feedback { padding-left:9px; border-left:3px solid var(--warning); }.feedback.correct { border-left-color:var(--success); }
  .question.first { margin-top:0; }
  .display-modes { display:flex; border-bottom:1px solid var(--border-strong); }.display-modes button { padding:13px 17px; border:0; border-bottom:3px solid transparent; background:none; color:var(--text-secondary); }.display-modes button.active { border-bottom-color:var(--teal); color:var(--text-primary); font-weight:700; }
  .visual-grid { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:18px; align-items:start; padding-top:14px; }
  .scene-panel, .curve-panel { min-width:0; }
  .curve-panel { padding-left:18px; border-left:1px solid var(--border-subtle); }
  .equations { margin:16px 0; padding:15px; border-left:3px solid var(--teal); background:var(--bg-secondary); }.equations code { white-space:pre-wrap; font-size:12px; }.equations p, .scene-note { color:var(--text-secondary); font-size:11px; line-height:1.5; }
  .timebar { display:flex; align-items:center; gap:9px; flex-wrap:wrap; padding:13px 0 8px; }.icon-button { display:grid; place-items:center; width:38px; height:38px; padding:0; border:1px solid var(--border-strong); border-radius:4px; background:var(--bg-tertiary); }.time-input, .speed { display:flex; align-items:center; gap:6px; color:var(--text-secondary); font-size:11px; }.time-input input { width:78px; padding:7px; }.speed select { padding:7px; }
  .timeline { width:100%; accent-color:var(--teal); }.plot-legend { display:flex; flex-wrap:wrap; gap:8px 16px; min-height:38px; margin:0 0 4px; font-size:10px; }.plot-legend span:before { content:''; display:inline-block; width:20px; height:3px; margin-right:6px; background:var(--teal); vertical-align:middle; }.plot-legend .reference:before { background:repeating-linear-gradient(90deg,#8c4c89 0 6px,transparent 6px 10px); }.plot-legend .treated:before { background:#b2572e; }.plot-legend .untreated:before { background:repeating-linear-gradient(90deg,#65767b 0 6px,transparent 6px 10px); }
  .metrics { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); margin-top:10px; border-top:1px solid var(--border-strong); border-bottom:1px solid var(--border-strong); }.metrics div { padding:14px; border-right:1px solid var(--border-subtle); }.metrics div:last-child { border:0; }.metrics span { display:block; min-height:30px; color:var(--text-secondary); font-size:10px; }.metrics strong { font-size:21px; font-variant-numeric:tabular-nums; }
  .metrics.two { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .data { margin-top:18px; }.table-scroll { overflow:auto; } table { width:100%; margin-top:10px; border-collapse:collapse; font-size:11px; } th, td { padding:7px; border-bottom:1px solid var(--border-subtle); text-align:right; } th:first-child { text-align:left; } td { font-family:var(--font-mono); }
  .exports { display:flex; flex-wrap:wrap; gap:9px; margin-top:22px; }.shared-link { display:grid; gap:5px; margin-top:12px; font-size:11px; }.shared-link input { width:100%; box-sizing:border-box; padding:8px; }
  .error { color:var(--danger); font-size:12px; }
  .teacher { margin-top:20px; padding-top:10px; border-top:1px solid var(--border-subtle); }.teacher h3 { display:flex; align-items:center; gap:8px; }.teacher p { font-size:12px; }
  .hidden-scene { display:flex; align-items:center; justify-content:center; gap:12px; min-height:420px; background:var(--bg-secondary); }
  .continuity { display:flex; gap:12px; margin-top:34px; padding:22px 0; border-top:1px solid var(--border-strong); }.continuity div { display:grid; gap:5px; min-width:0; }.continuity a { width:auto; max-width:100%; color:var(--accent-pk); overflow-wrap:anywhere; }.continuity p { margin:3px 0 0; color:var(--text-secondary); font-size:11px; overflow-wrap:anywhere; }
  .sr-summary { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
  @media(max-width:840px) { .heading { align-items:start; flex-direction:column; }.lab-selector { width:100%; min-width:0; }.lab-grid { grid-template-columns:1fr; }.parameters { padding:20px 0; border-right:0; border-bottom:1px solid var(--border-subtle); }.experiment { padding:0; }.numbers { grid-template-columns:repeat(3,minmax(0,1fr)); }.visual-grid { grid-template-columns:1fr; }.curve-panel { padding:16px 0 0; border-top:1px solid var(--border-subtle); border-left:0; }.plot-legend { min-height:0; margin:10px 0 4px; } }
  @media(max-width:560px) { .heading h1 { font-size:27px; }.numbers { grid-template-columns:1fr 1fr; }.metrics { grid-template-columns:1fr; }.metrics div { border-right:0; border-bottom:1px solid var(--border-subtle); }.timebar { gap:6px; }.time-input input { width:64px; } }
</style>
