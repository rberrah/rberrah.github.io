<script>
  // @ts-nocheck
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { language } from '$lib/stores/language';
  import { Play, Pause, RotateCcw, StepForward, Copy, Download, ImageDown, ArrowRight, GraduationCap, Eye, EyeOff } from '@lucide/svelte';
  import { defaults, limits, validateParameters, stateAt, series, laboratorySpec, encodeScenario, decodeScenario, schedule } from '$lib/labs/model.js';
  import { prepareHandoff } from '$lib/labs/handoff.js';
  import LabScene from './LabScene.svelte';
  import LabPlot from './LabPlot.svelte';
  let lab = 'distribution', p = { ...defaults.distribution }, reference = { ...p };
  let time = 0, playing = false, speed = 1, compare = true, mode = 'intuition';
  let teacher = false, hidden = false, prediction = '', answer = false, message = '', shared = '', loadError = '';
  let root, animationArea, raf = 0, last = 0, visible = true, ready = false;
  let animateParticles = true;
  $: en = $language === 'en';
  $: titles = en ? { distribution: 'Two-compartment distribution', accumulation: 'Accumulation and repeated doses' } : { distribution: 'Distribution à deux compartiments', accumulation: 'Accumulation et doses répétées' };
  $: validation = (() => { try { return { value: validateParameters(lab, p), error: '' }; } catch (e) { return { value: null, error: String(e.message) }; } })();
  $: valid = validation.value;
  $: end = valid ? valid.end : 48;
  $: state = valid ? stateAt(lab, valid, time) : null;
  $: refState = valid ? stateAt(lab, reference, time) : null;
  $: b = valid ? series(lab, valid, end) : [];
  $: a = valid ? series(lab, reference, end) : [];
  $: names = { dose: 'Dose (mg)', cl: 'CL (L/h)', vc: lab === 'distribution' ? 'Vc (L)' : 'V (L)', q: 'Q (L/h)', vp: 'Vp (L)', tau: en ? 'Interval (h)' : 'Intervalle (h)', count: en ? 'Number of doses' : 'Nombre de doses', loading: en ? 'First dose multiplier' : 'Multiplicateur premiere dose', end: en ? 'Horizon (h)' : 'Horizon (h)' };
  $: fields = lab === 'distribution' ? ['dose', 'cl', 'vc', 'q', 'vp', 'end'] : ['dose', 'cl', 'vc', 'tau', 'count', 'loading', 'end'];
  $: if (!teacher) hidden = false;
  $: if (hidden || !valid) pause();
  function pause() { playing = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
  function select(next) { pause(); lab = next; p = { ...defaults[next] }; reference = { ...p }; time = 0; prediction = ''; answer = false; loadError = ''; message = ''; shared = ''; }
  function change(key, event) { pause(); p = { ...p, [key]: event.currentTarget.valueAsNumber }; time = 0; answer = false; shared = ''; }
  function play() {
    if (!valid || hidden || playing) return;
    if (time >= end) time = 0;
    playing = true; visible = true; last = performance.now();
    const step = now => {
      if (!playing) return;
      const elapsed = Math.min(0.15, (now - last) / 1000); last = now;
      if (visible && !document.hidden) time = Math.min(end, time + elapsed * speed);
      if (time >= end) pause(); else raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }
  function load() {
    try {
      const query = new URLSearchParams(window.location.search); query.delete('lang');
      const spec = decodeScenario(window.location.hash || query.toString());
      if (!spec) return;
      pause(); lab = spec.lab; p = spec.parameters; reference = spec.reference; teacher = spec.teacher; hidden = spec.hidden; time = 0; loadError = ''; answer = false; prediction = '';
    } catch { loadError = en ? 'Invalid shared scenario. No values were applied.' : "Scenario partage invalide. Aucune valeur n'a ete appliquee."; }
  }
  onMount(() => {
    load(); ready = true; window.addEventListener('hashchange', load);
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (!visible) pause(); }); observer.observe(animationArea);
    const visibility = () => { if (document.hidden) pause(); };
    document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); window.removeEventListener('hashchange', load); document.removeEventListener('visibilitychange', visibility); };
  });
  onDestroy(pause);
  function blobDownload(blob, filename) {
    const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function share() {
    if (!valid) return;
    const url = new URL(`${base}/laboratoires/`, window.location.origin);
    url.searchParams.set('lang', en ? 'en' : 'fr'); url.hash = encodeScenario(laboratorySpec(lab, valid, reference, teacher, hidden)); shared = url.href;
    try { await navigator.clipboard.writeText(shared); message = en ? 'Scenario link copied.' : 'Lien du scenario copie.'; }
    catch { message = en ? 'Scenario link ready below.' : 'Lien du scenario disponible ci-dessous.'; }
  }
  function csv() {
    const data = [['scenario','time_h','concentration_mg_L','central_mg','peripheral_mg','eliminated_mg','auc_0_t_mg_h_L'], ...[['reference', a], ['current', b]].flatMap(([label, values]) => values.map(row => [label, row.t, row.c, row.central, row.peripheral, row.eliminated, row.auc]))];
    blobDownload(new Blob([data.map(row => row.join(',')).join('\n')], { type: 'text/csv' }), `${lab}.csv`);
  }
  function figure() {
    const source = root.querySelector('[data-testid="lab-plot"]'), logPlot = root.querySelector('[data-testid="lab-log-plot"]'), scene = root.querySelector('[data-testid="lab-scene"]');
    const output = document.createElement('canvas'); output.width = Math.max(1000, source.width); output.height = source.height + logPlot.height + scene.height + 210;
    const ctx = output.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, output.width, output.height);
    ctx.fillStyle = '#173b40'; ctx.font = '20px sans-serif'; ctx.fillText(titles[lab], 20, 32);
    ctx.font = '14px sans-serif'; ctx.fillText(`${compare ? (en ? 'Reference: dashed / ' : 'Reference : pointilles / ') : ''}${en ? 'Current: solid' : 'Modele actuel : continu'} | IV bolus | mg, L, h | t=${time.toFixed(2)} h`, 20, 57);
    ctx.fillText(`${en ? 'Current model' : 'Modele actuel'}: ${fields.map(key => `${key}=${p[key]}`).join('; ')}`, 20, 80);
    ctx.drawImage(scene, (output.width - scene.width) / 2, 100); ctx.drawImage(source, (output.width - source.width) / 2, 100 + scene.height);
    ctx.drawImage(logPlot, (output.width - logPlot.width) / 2, 100 + scene.height + source.height);
    ctx.fillText(`Reference: ${fields.map(key => `${key}=${reference[key]}`).join('; ')}`, 20, output.height - 30);
    output.toBlob(blob => { if (blob) blobDownload(blob, `${lab}.png`); });
  }
  function continueIn(destination, path) {
    prepareHandoff(destination, laboratorySpec(lab, valid, reference)); goto(`${base}${path}`);
  }
</script>

<section class="laboratory" bind:this={root} data-testid="laboratory" data-ready={ready}>
  <header class="lab-heading"><div><p class="eyebrow">{en ? 'Virtual pharmacokinetics laboratories' : 'Laboratoires virtuels de pharmacocinétique'}</p><h1>{en ? 'Explore pharmacokinetics' : 'Explorer la pharmacocinétique'}</h1></div><span class="research">{en ? 'Synthetic experiments' : 'Expériences synthétiques'}</span></header>
  <div class="lab-tabs" role="group" aria-label={en ? 'Laboratory' : 'Laboratoire'}>
    <button class:active={lab === 'distribution'} aria-pressed={lab === 'distribution'} on:click={() => select('distribution')}>{en ? '01 / Distribution' : '01 / Distribution'}</button>
    <button class:active={lab === 'accumulation'} aria-pressed={lab === 'accumulation'} on:click={() => select('accumulation')}>02 / Accumulation</button>
  </div>
  <div class="title-row"><h2>{titles[lab]}</h2><label class="check"><GraduationCap size={19}/><input type="checkbox" bind:checked={teacher}/>{en ? 'Teacher mode' : 'Mode enseignant'}</label></div>
  {#if loadError}<p class="error" role="alert">{loadError}</p>{/if}
  <div class="lab-grid">
    <aside class="parameters" aria-label={en ? 'Experiment parameters' : "Parametres de l'experience"}>
      <div class="parameter-head"><strong>{en ? 'Current model' : 'Modèle actuel'}</strong><span>IV bolus</span></div>
      <div class="numbers">{#each fields as key}<label for={`lab-${key}`}>{names[key]}<input id={`lab-${key}`} type="number" min={limits[key][0]} max={limits[key][1]} step={key === 'count' ? '1' : 'any'} value={p[key]} on:input={event => change(key, event)}/></label>{/each}</div>
      {#if validation.error}<p class="error" role="alert">{en ? 'Check the parameter range:' : 'Verifier la plage du parametre :'} {validation.error}</p>{/if}
      <label class="check"><input type="checkbox" bind:checked={compare}/>{en ? 'Compare with reference' : 'Comparer à la référence'}</label>
      <button class="command" disabled={!valid} on:click={() => { reference = { ...valid }; }}><Copy size={17}/>{en ? 'Use this model as the new reference' : 'Prendre ce modèle comme nouvelle référence'}</button>
      {#if compare}<details><summary>{en ? 'Reference parameters' : 'Paramètres de la référence'}</summary><dl>{#each fields.filter(key => key !== 'end') as key}<div><dt>{names[key]}</dt><dd>{reference[key]}</dd></div>{/each}</dl></details>{/if}
      <div class="question"><strong>{en ? 'Predict' : 'Predire'}</strong><p>{lab === 'distribution' ? (en ? 'If Q rises, what happens to the initial decline in central concentration? Keep CL and volumes fixed.' : 'Si Q augmente, que devient la chute initiale de concentration centrale ? Garder CL et les volumes fixes.') : (en ? 'At the same maintenance dose and clearance, shortening the interval changes steady-state mean concentration how?' : "A dose d'entretien et clairance constantes, raccourcir l'intervalle change comment la concentration moyenne a l'equilibre ?")}</p>
        <select bind:value={prediction} aria-label={en ? 'Your prediction' : 'Votre prediction'}><option value="">{en ? 'Choose a prediction' : 'Choisir une prediction'}</option><option value="up">{lab === 'distribution' ? (en ? 'Faster' : 'Plus rapide') : (en ? 'Higher' : 'Plus elevee')}</option><option value="same">{en ? 'Unchanged' : 'Identique'}</option><option value="down">{lab === 'distribution' ? (en ? 'Slower' : 'Plus lente') : (en ? 'Lower' : 'Plus faible')}</option></select>
        <button class="command" disabled={!prediction || hidden} on:click={() => answer = true}>{en ? 'Check prediction' : 'Verifier la prediction'}</button>
        {#if answer && !hidden}<p class="feedback" role="status">{prediction === 'up' ? (en ? 'Correct. ' : 'Exact. ') : (en ? 'Review the mechanism. ' : 'Revoir le mecanisme. ')}{lab === 'distribution' ? (en ? 'The initial outward transfer rises. Distribution is not elimination: drug can return from the peripheral compartment.' : "Le transfert sortant initial augmente. La distribution n'est pas une elimination : le medicament peut revenir du compartiment peripherique.") : (en ? 'The dose rate increases. For this linear model, Css,mean = dose / (CL * interval).' : 'Le debit de dose augmente. Pour ce modele lineaire, Cmoy,ss = dose / (CL * intervalle).')}</p>{/if}
      </div>
    </aside>
    <div class="experiment">
      <div class="display-modes" role="group" aria-label={en ? 'Representation' : 'Representation'}>{#each [['intuition','Intuition'], ['model','Equations']] as [key,label]}<button class:active={mode === key} aria-pressed={mode === key} on:click={() => mode = key}>{label}</button>{/each}</div>
      <div bind:this={animationArea}>
      {#if valid && !hidden}
        {#if mode === 'model'}<div class="equations"><code>{lab === 'distribution' ? 'dAc/dt = -(CL + Q) Ac/Vc + Q Ap/Vp\ndAp/dt = Q Ac/Vc - Q Ap/Vp\nCc = Ac/Vc; Cp = Ap/Vp' : 'dA/dt = -(CL/V) A\nA(tdose+) = A(tdose-) + dose\nC = A/V; Cmoy,ss = dose/(CL * interval)'}</code><p>{en ? 'Linear elimination. Fixed parameters. Instantaneous IV bolus input. No variability or measurement error.' : 'Elimination lineaire. Parametres fixes. Entree IV bolus instantanee. Sans variabilite ni erreur de mesure.'}</p></div>{/if}
        <LabScene {lab} p={valid} {state} {time} {en} {playing} bind:animateParticles on:play={() => playing ? pause() : play()} on:seek={event => { pause(); time = Math.min(end, event.detail); }}/>
        <p class="scene-note">{en ? 'Illustrative particle journeys, not exact molecule counts or anatomy. Concentrations, AUC and mass balance use the continuous PK model. IV bolus; mg, L, h.' : 'Trajectoires particulaires illustratives, sans comptage moléculaire exact ni représentation anatomique. Concentrations, AUC et bilan de masse issus du modèle PK continu. Bolus IV ; mg, L, h.'}</p>
      {:else}<div class="hidden-scene"><EyeOff size={28}/><strong>{hidden ? (en ? 'Results hidden' : 'Resultats masques') : (en ? 'Parameters to review' : 'Parametres a verifier')}</strong></div>{/if}
      <div class="timebar">
        <button class="icon-button" title={playing ? 'Pause' : (en ? 'Play' : 'Lecture')} aria-label={playing ? 'Pause' : (en ? 'Play' : 'Lecture')} disabled={!valid || hidden} on:click={() => playing ? pause() : play()}>{#if playing}<Pause size={19}/>{:else}<Play size={19}/>{/if}</button>
        <button class="icon-button" title={en ? 'Step forward one hour' : "Avancer d'une heure"} aria-label={en ? 'Step forward one hour' : "Avancer d'une heure"} disabled={!valid || hidden} on:click={() => { pause(); time = Math.min(end, time + 1); }}><StepForward size={19}/></button>
        <button class="icon-button" title={en ? 'Restart time' : 'Reprendre a t = 0'} aria-label={en ? 'Restart time' : 'Reprendre a t = 0'} on:click={() => { pause(); time = 0; }}><RotateCcw size={18}/></button>
        <label class="time-input">t (h)<input type="number" min="0" max={end} step="0.1" value={time.toFixed(1)} on:input={event => { pause(); const value = event.currentTarget.valueAsNumber; if (Number.isFinite(value)) time = Math.max(0, Math.min(end, value)); }} data-testid="lab-time"/></label>
        <label class="speed">{en ? 'Speed' : 'Vitesse'}<select bind:value={speed} aria-label={en ? 'Speed' : 'Vitesse'}><option value={0.1}>0.1 h/s</option><option value={0.25}>0.25 h/s</option><option value={0.5}>0.5 h/s</option><option value={1}>1 h/s</option><option value={4}>4 h/s</option><option value={12}>12 h/s</option></select></label>
      </div>
      <input class="timeline" aria-label={en ? 'Simulation time' : 'Temps de simulation'} type="range" min="0" max={end} step="0.1" value={time} disabled={!valid || hidden} on:input={event => { pause(); time = event.currentTarget.valueAsNumber; }}/>
      </div>
      {#if valid && !hidden}
        <div class="plot-legend"><span>{en ? 'Current model' : 'Modèle actuel'}</span>{#if compare}<span class="reference">{en ? 'Reference' : 'Référence'}</span>{/if}</div>
        <LabPlot {a} {b} {time} {en} {compare} concentration={state.c}/>
        <LabPlot {a} {b} {time} {en} {compare} concentration={state.c} logarithmic/>
        <div class="metrics"><div><span>C(t) · mg/L</span><strong data-testid="lab-concentration">{state.c.toFixed(2)}</strong></div><div><span>AUC 0-{time.toFixed(1)} h · mg.h/L</span><strong>{state.auc.toFixed(2)}</strong></div><div><span>{en ? 'Eliminated / given (mg)' : 'Elimine / administre (mg)'}</span><strong>{state.eliminated.toFixed(1)} / {state.administered.toFixed(0)}</strong></div></div>
        <details class="data"><summary>{en ? 'Quantities, flows and dose schedule' : 'Quantites, flux et administrations'}</summary><div class="table-scroll"><table><caption>{en ? 'State at selected time' : 'Etat au temps selectionne'}</caption><thead><tr><th>{en ? 'Quantity' : 'Grandeur'}</th><th>{en ? 'Current model' : 'Modèle actuel'}</th>{#if compare}<th>{en ? 'Reference' : 'Référence'}</th>{/if}</tr></thead><tbody>{#each [['central',en ? 'Central (mg)' : 'Central (mg)'], ['peripheral',en ? 'Peripheral (mg)' : 'Peripherique (mg)'], ['eliminated',en ? 'Eliminated (mg)' : 'Elimine (mg)'], ['forward','Q Cc (mg/h)'], ['backward','Q Cp (mg/h)'], ['eliminationRate','CL Cc (mg/h)']] as [key,label]}<tr><th>{label}</th><td>{state[key].toFixed(3)}</td>{#if compare}<td>{refState[key].toFixed(3)}</td>{/if}</tr>{/each}</tbody></table><table><caption>{en ? 'Planned IV bolus administrations' : 'Administrations IV bolus prevues'}</caption><thead><tr><th>h</th><th>mg</th></tr></thead><tbody>{#each schedule(lab, valid) as dose}<tr><td>{dose.time}</td><td>{dose.amount}</td></tr>{/each}</tbody></table></div></details>
      {/if}
      {#if teacher}<section class="teacher"><h3><GraduationCap size={20}/>{en ? 'Teacher scenario' : 'Scenario enseignant'}</h3><label class="check"><input type="checkbox" bind:checked={hidden}/>{en ? 'Hide results at opening' : "Masquer les resultats a l'ouverture"}</label><p>{en ? 'Synthetic parameters only. The learner may reveal the results; this is not a secure examination mode.' : "Parametres synthetiques uniquement. L'apprenant peut reveler les resultats ; ce n'est pas un examen verrouille."}</p><button class="command" on:click={() => hidden = !hidden}><Eye size={17}/>{hidden ? (en ? 'Reveal results' : 'Reveler les resultats') : (en ? 'Hide results' : 'Masquer les resultats')}</button></section>{/if}
      <div class="exports"><button class="command" disabled={!valid} on:click={share}><Copy size={17}/>{en ? 'Share scenario' : 'Partager le scenario'}</button><button class="command" disabled={!valid || hidden} on:click={csv}><Download size={17}/>CSV</button><button class="command" disabled={!valid || hidden} on:click={figure}><ImageDown size={17}/>{en ? 'Figure' : 'Figure'}</button><button class="command" on:click={() => select(lab)}><RotateCcw size={17}/>{en ? 'Reset experiment' : "Reinitialiser l'experience"}</button></div>
      {#if message}<p role="status">{message}</p>{/if}
      {#if shared}<label class="shared-link">{en ? 'Synthetic scenario link' : 'Lien du scenario synthetique'}<input readonly value={shared} on:focus={event => event.currentTarget.select()}/></label>{/if}
    </div>
  </div>
  <section class="continuity"><h2>{en ? 'Continue the experiment' : "Poursuivre l'experience"}</h2><div class="next-actions">
    <button class="command" disabled={!valid} on:click={() => continueIn('lego','/lego/')}><ArrowRight size={18}/>{en ? 'Build in Lego' : 'Construire dans Lego'}</button>
    <button class="command" disabled={!valid} on:click={() => continueIn('tdm','/tdm/')}><ArrowRight size={18}/>{en ? 'Open in TDM' : 'Ouvrir dans TDM'}</button>
    <button class="command" disabled={!valid} on:click={() => continueIn('ddi','/interactions/')}><ArrowRight size={18}/>{en ? 'Add an interaction' : 'Ajouter une interaction'}</button>
    <button class="command" disabled={!valid} on:click={() => continueIn('pd','/pharmacodynamie/')}><ArrowRight size={18}/>{en ? 'Add a PD response' : 'Ajouter une reponse PD'}</button>
  </div><a href={`${base}/chapitres/${lab === 'distribution' ? 'clairance-volume-demi-vie' : 'doses-repetees'}/`}>{en ? 'Return to the related chapter' : 'Revenir au chapitre associe'}</a></section>
</section>

<style>
  .laboratory { --teal: #087b83; --plum: #8c4c89; letter-spacing: 0; }
  .lab-heading, .title-row { display: flex; justify-content: space-between; gap: 20px; align-items: center; flex-wrap: wrap; }
  h1 { font-size: 32px; margin: 4px 0 20px; } h2 { font-size: 23px; margin: 22px 0; } h3 { font-size: 17px; }
  .eyebrow { font-size: 12px; color: var(--text-secondary); margin: 0; }
  .research { border-left: 3px solid var(--teal); padding-left: 12px; font-size: 13px; }
  button, input, select { font: inherit; letter-spacing: 0; } button { cursor: pointer; } button:disabled { cursor: default; opacity: .5; }
  button:focus-visible, input:focus-visible, select:focus-visible, summary:focus-visible { outline: 3px solid var(--teal); outline-offset: 3px; }
  .lab-tabs, .display-modes { display: flex; gap: 0; border-bottom: 1px solid var(--border-strong); }
  .lab-tabs button, .display-modes button { border: 0; border-bottom: 3px solid transparent; background: none; color: var(--text-secondary); padding: 14px 18px; font-size: 14px; }
  .lab-tabs button.active, .display-modes button.active { border-bottom-color: var(--teal); color: var(--text-primary); font-weight: 700; }
  .lab-grid { display: grid; grid-template-columns: 265px minmax(0,1fr); border-top: 1px solid var(--border-subtle); }
  .parameters { border-right: 1px solid var(--border-subtle); padding: 22px 20px 0 0; min-width: 0; }
  .parameter-head { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 18px; }
  .parameter-head span { color: var(--text-secondary); font-size: 12px; }
  .numbers { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 14px; }
  label { font-size: 12px; min-width: 0; } input[type=number], select, .shared-link input { width: 100%; min-width: 0; display: block; border: 1px solid var(--border-strong); border-radius: 4px; padding: 9px 8px; margin-top: 4px; color: var(--text-primary); background: var(--bg-tertiary); box-sizing: border-box; }
  .check { display: flex; align-items: center; gap: 7px; margin: 18px 0; font-size: 13px; }
  input[type=checkbox] { accent-color: var(--teal); }
  .command { display: inline-flex; gap: 8px; align-items: center; justify-content: center; min-height: 38px; padding: 8px 12px; border: 1px solid var(--border-strong); background: var(--bg-tertiary); color: var(--text-primary); border-radius: 4px; font-size: 13px; white-space: normal; }
  .command :global(svg) { flex-shrink: 0; } .command:hover:not(:disabled) { border-color: var(--teal); }
  .question { padding: 22px 0; margin-top: 24px; border-top: 1px solid var(--border-subtle); font-size: 13px; }
  .question select { margin-bottom: 10px; } .feedback { border-left: 3px solid var(--teal); padding-left: 10px; }
  .experiment { padding: 0 0 0 24px; min-width: 0; }
  .scene-note { font-size: 11px; color: var(--text-secondary); margin: 6px 0 12px; }
  .display-modes { margin-bottom: 16px; } .display-modes button { padding: 12px; }
  .timebar { display: flex; align-items: end; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
  .icon-button { width: 38px; height: 38px; display: grid; place-items: center; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-strong); border-radius: 4px; flex: 0 0 38px; }
  .time-input { width: 98px; margin-left: auto; } .speed { width: 110px; }
  .timeline { width: 100%; accent-color: var(--teal); margin: 18px 0; }
  .plot-legend { display: flex; gap: 20px; font-size: 12px; margin-bottom: 8px; flex-wrap: wrap; }
  .plot-legend span:before { content: ''; display: inline-block; width: 24px; border-top: 3px solid var(--teal); margin-right: 8px; vertical-align: middle; }
  .plot-legend .reference:before { border-color: var(--plum); border-top-style: dashed; }
  .metrics { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); border-top: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle); padding: 16px 0; gap: 12px; }
  .metrics span { display: block; font-size: 11px; color: var(--text-secondary); } .metrics strong { font-size: 21px; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
  .exports, .next-actions { display: flex; gap: 10px; flex-wrap: wrap; margin: 20px 0; }
  details { margin: 18px 0; font-size: 13px; } summary { cursor: pointer; padding: 7px 0; } dl div { display: flex; justify-content: space-between; } dd { margin: 0; }
  .table-scroll { overflow-x: auto; } table { width: 100%; border-collapse: collapse; font-size: 12px; font-variant-numeric: tabular-nums; } td, th { text-align: right; padding: 7px; border-bottom: 1px solid var(--border-subtle); } th:first-child { text-align: left; } caption { text-align: left; padding: 12px 0; }
  .teacher { border-top: 1px solid var(--border-subtle); margin-top: 20px; padding-top: 10px; } .teacher h3 { display: flex; align-items: center; gap: 8px; } .teacher p { font-size: 12px; }
  .equations { padding: 16px 0; border-bottom: 1px solid var(--border-subtle); margin-bottom: 16px; font-size: 13px; } code { white-space: pre-wrap; overflow-wrap: anywhere; font-size: 13px; }
  .hidden-scene { min-height: 285px; display: flex; gap: 12px; justify-content: center; align-items: center; background: var(--bg-secondary); }
  .error { color: var(--quiz-error-text); background: var(--quiz-error-bg); padding: 10px; font-size: 13px; }
  .continuity { border-top: 1px solid var(--border-strong); margin-top: 32px; padding-top: 10px; } .continuity a { font-size: 14px; }
  @media (max-width: 780px) { .lab-grid { grid-template-columns: 1fr; } .parameters { border-right: 0; padding: 16px 0; } .numbers { grid-template-columns: repeat(3,minmax(0,1fr)); } .experiment { padding: 0; } .question { margin-top: 16px; padding: 14px 0; } h1 { font-size: 26px; } .title-row { gap: 0; } .lab-tabs button { padding: 12px; } .metrics strong { font-size: 17px; } }
  @media (max-width: 400px) { .numbers { grid-template-columns: repeat(2,minmax(0,1fr)); } .metrics { grid-template-columns: 1fr; } .metrics div { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; } .timebar { gap: 5px; } .time-input { width: 80px; } }
</style>
