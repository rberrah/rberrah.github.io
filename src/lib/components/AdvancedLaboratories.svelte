<script>
  // @ts-nocheck - responsive canvas rendering is covered by browser pixel tests.
  import { onMount, onDestroy } from 'svelte';
  import { Play, Pause, RotateCcw, StepForward, Copy, Download } from '@lucide/svelte';
  import { language } from '$lib/stores/language';
  import {
    populationDefaults, samplingDefaults, populationLimits, samplingLimits,
    validatePopulation, validateSampling, populationAt, populationSeries,
    syntheticSamples, clearancePosterior, concentrationAt, quantile
  } from '$lib/labs/population.js';

  let lab = 'population', pop = { ...populationDefaults }, reference = { ...populationDefaults }, sampling = { ...samplingDefaults };
  let time = 0, playing = false, speed = 2, showResidual = true, revealTruth = true, mounted = false;
  let canvas, stage, width = 760, raf = 0, last = 0;
  $: en = $language === 'en';
  $: popCheck = checked(() => validatePopulation(pop));
  $: samplingCheck = checked(() => validateSampling(sampling));
  $: valid = lab === 'population' ? popCheck.value : samplingCheck.value;
  $: error = lab === 'population' ? popCheck.error : samplingCheck.error;
  $: end = valid?.end ?? 24;
  $: popRows = popCheck.value ? populationAt(popCheck.value, time) : [];
  $: popCurve = popCheck.value ? populationSeries(popCheck.value) : [];
  $: refCurve = popCheck.value ? populationSeries(validatePopulation(reference)) : [];
  $: samples = samplingCheck.value ? syntheticSamples(samplingCheck.value) : [];
  $: posterior = samplingCheck.value ? clearancePosterior(samplingCheck.value, time) : null;
  $: collected = posterior?.samples.length ?? 0;
  $: popMedian = popRows.length ? quantile(popRows.map(row => row.concentration), 0.5) : 0;
  $: observedMedian = popRows.length ? quantile(popRows.map(row => row.observed), 0.5) : 0;
  $: nextSample = samples.find(sample => sample.time > time + 1e-8);

  const popLabels = {
    dose: ['Dose (mg)', 'Dose (mg)'], cl: ['Population CL (L/h)', 'CL population (L/h)'],
    v: ['Population V (L)', 'V population (L)'], omegaCl: ['CL log-SD', 'ET CL (écart-type log)'],
    omegaV: ['V log-SD', 'ET V (écart-type log)'], sigma: ['Residual log-SD', 'Erreur résiduelle (écart-type log)'],
    count: ['Virtual subjects', 'Sujets virtuels'], end: ['Horizon (h)', 'Horizon (h)']
  };
  const samplingLabels = {
    dose: ['Dose (mg)', 'Dose (mg)'], trueCl: ['Hidden individual CL (L/h)', 'CL individuelle cachée (L/h)'],
    popCl: ['Prior median CL (L/h)', 'Médiane a priori de CL (L/h)'], omegaCl: ['Prior log-SD', 'Écart-type log a priori'],
    v: ['Known V (L)', 'V connu (L)'], sigma: ['Residual log-SD', 'Erreur résiduelle (écart-type log)'],
    t1: ['Sample 1 (h)', 'Prélèvement 1 (h)'], t2: ['Sample 2 (h)', 'Prélèvement 2 (h)'], end: ['Horizon (h)', 'Horizon (h)']
  };

  function checked(callback) {
    try { return { value: callback(), error: '' }; } catch (caught) { return { value: null, error: String(caught.message) }; }
  }
  function pause() { playing = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
  function play() {
    if (!valid || playing) return;
    if (time >= end) time = 0;
    playing = true; last = performance.now();
    const step = now => {
      if (!playing) return;
      const elapsed = Math.min(0.15, (now - last) / 1000); last = now;
      time = Math.min(end, time + elapsed * speed);
      if (time >= end) pause(); else raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }
  function select(next) { pause(); lab = next; time = 0; }
  function changePopulation(key, event) { pause(); pop = { ...pop, [key]: event.currentTarget.valueAsNumber }; time = 0; }
  function changeSampling(key, event) { pause(); sampling = { ...sampling, [key]: event.currentTarget.valueAsNumber }; time = 0; }
  function reset() {
    pause(); time = 0;
    if (lab === 'population') { pop = { ...populationDefaults }; reference = { ...populationDefaults }; showResidual = true; }
    else { sampling = { ...samplingDefaults }; revealTruth = true; }
  }
  function setupCanvas(height) {
    if (!canvas || !mounted || width < 100) return null;
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== height * ratio) {
      canvas.width = Math.round(width * ratio); canvas.height = height * ratio;
    }
    const ctx = canvas.getContext('2d'); if (!ctx) return null;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0); ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f2f7f8'; ctx.fillRect(0, 0, width, height);
    return ctx;
  }
  function text(ctx, value, x, y, size = 12, color = '#294651', align = 'left') {
    ctx.fillStyle = color; ctx.font = `500 ${size}px Inter, sans-serif`; ctx.textAlign = align; ctx.fillText(value, x, y);
  }
  function line(ctx, points, x, y, color, dash = [], thickness = 2) {
    if (!points.length) return;
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = thickness; ctx.setLineDash(dash); ctx.beginPath();
    points.forEach((point, index) => index ? ctx.lineTo(x(point), y(point)) : ctx.moveTo(x(point), y(point)));
    ctx.stroke(); ctx.restore();
  }
  function axes(ctx, box, xLabel, yLabel, maxX, maxY) {
    ctx.strokeStyle = '#6e8790'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(box.x, box.y); ctx.lineTo(box.x, box.y + box.h); ctx.lineTo(box.x + box.w, box.y + box.h); ctx.stroke();
    for (let index = 0; index <= 4; index++) {
      const x = box.x + box.w * index / 4, y = box.y + box.h * index / 4;
      ctx.strokeStyle = '#d5e0e3'; ctx.beginPath(); ctx.moveTo(x, box.y); ctx.lineTo(x, box.y + box.h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(box.x, y); ctx.lineTo(box.x + box.w, y); ctx.stroke();
      text(ctx, (maxX * index / 4).toFixed(maxX > 30 ? 0 : 1), x, box.y + box.h + 18, 10, '#536e77', 'center');
      text(ctx, (maxY * (4 - index) / 4).toFixed(maxY > 20 ? 0 : 1), box.x - 8, y + 3, 10, '#536e77', 'right');
    }
    text(ctx, xLabel, box.x + box.w / 2, box.y + box.h + 38, 11, '#294651', 'center');
    ctx.save(); ctx.translate(14, box.y + box.h / 2); ctx.rotate(-Math.PI / 2); text(ctx, yLabel, 0, 0, 11, '#294651', 'center'); ctx.restore();
  }
  function layout() {
    const narrow = width < 600, height = narrow ? 610 : 410;
    return narrow
      ? { narrow, height, curve: { x: 49, y: 42, w: width - 67, h: 255 }, side: { x: 49, y: 385, w: width - 67, h: 155 } }
      : { narrow, height, curve: { x: 54, y: 38, w: width * 0.67, h: 302 }, side: { x: width * 0.78, y: 38, w: width * 0.19, h: 302 } };
  }
  function drawPopulation() {
    if (!popCheck.value) return;
    const g = layout(), ctx = setupCanvas(g.height); if (!ctx) return;
    const possibleObservationMax = showResidual ? Math.max(...populationAt(popCheck.value, 0).map(row => row.observed)) : 0;
    const allMax = Math.max(...popCurve.map(row => row.q90), ...refCurve.map(row => row.q90), possibleObservationMax, 0.01) * 1.12;
    const x = point => g.curve.x + point.time / pop.end * g.curve.w, y = point => g.curve.y + g.curve.h * (1 - Math.max(0, point.concentration ?? point.median ?? 0) / allMax);
    axes(ctx, g.curve, en ? 'Time (h)' : 'Temps (h)', en ? 'Concentration (mg/L)' : 'Concentration (mg/L)', pop.end, allMax);
    ctx.fillStyle = '#168d7125'; ctx.beginPath();
    popCurve.forEach((point, index) => index ? ctx.lineTo(x(point), g.curve.y + g.curve.h * (1 - point.q90 / allMax)) : ctx.moveTo(x(point), g.curve.y + g.curve.h * (1 - point.q90 / allMax)));
    [...popCurve].reverse().forEach(point => ctx.lineTo(x(point), g.curve.y + g.curve.h * (1 - point.q10 / allMax))); ctx.closePath(); ctx.fill();
    line(ctx, refCurve, x, point => g.curve.y + g.curve.h * (1 - point.median / allMax), '#8c4c89', [7, 5], 2);
    line(ctx, popCurve, x, point => g.curve.y + g.curve.h * (1 - point.median / allMax), '#087b83', [], 3);
    const cursorX = g.curve.x + time / pop.end * g.curve.w;
    ctx.strokeStyle = '#173b4077'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(cursorX, g.curve.y); ctx.lineTo(cursorX, g.curve.y + g.curve.h); ctx.stroke(); ctx.setLineDash([]);
    for (const row of popRows) {
      const py = y(row), phase = (row.id * 37 % 29) - 14, px = cursorX + phase * Math.min(1, g.curve.w / 500);
      ctx.fillStyle = '#087b83aa'; ctx.beginPath(); ctx.arc(px, py, g.narrow ? 2.2 : 2.8, 0, Math.PI * 2); ctx.fill();
      if (showResidual) {
        const oy = g.curve.y + g.curve.h * (1 - Math.max(0, row.observed) / allMax);
        ctx.strokeStyle = '#d66b37aa'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, oy); ctx.stroke();
        ctx.beginPath(); ctx.arc(px, oy, g.narrow ? 2.7 : 3.3, 0, Math.PI * 2); ctx.stroke();
      }
    }
    text(ctx, en ? 'Same virtual subjects and seed' : 'Mêmes sujets virtuels et même graine', g.curve.x, 22, 11, '#536e77');
    const concentrations = popRows.map(row => row.concentration), bins = 12, binMax = allMax;
    const counts = Array(bins).fill(0); concentrations.forEach(value => counts[Math.min(bins - 1, Math.floor(value / binMax * bins))]++);
    const maximum = Math.max(...counts, 1);
    text(ctx, en ? `Distribution at ${time.toFixed(1)} h` : `Distribution à ${time.toFixed(1)} h`, g.side.x, g.side.y - 13, 12, '#294651');
    for (let index = 0; index < bins; index++) {
      if (g.narrow) {
        const bw = g.side.w / bins - 2, bh = counts[index] / maximum * g.side.h;
        ctx.fillStyle = '#087b83aa'; ctx.fillRect(g.side.x + index * g.side.w / bins + 1, g.side.y + g.side.h - bh, bw, bh);
      } else {
        const bh = g.side.h / bins - 2, bw = counts[index] / maximum * g.side.w;
        ctx.fillStyle = '#087b83aa'; ctx.fillRect(g.side.x, g.side.y + g.side.h - (index + 1) * g.side.h / bins + 1, bw, bh);
      }
    }
    ctx.strokeStyle = '#6e8790'; ctx.strokeRect(g.side.x, g.side.y, g.side.w, g.side.h);
    text(ctx, g.narrow ? 'Concentration (mg/L)' : (en ? 'Subjects' : 'Sujets'), g.side.x + g.side.w / 2, g.side.y + g.side.h + 21, 10, '#536e77', 'center');
  }
  function drawSampling() {
    if (!samplingCheck.value || !posterior) return;
    const g = layout(), ctx = setupCanvas(g.height); if (!ctx) return;
    const maxY = sampling.dose / sampling.v * 1.12, points = Array.from({ length: 161 }, (_, index) => ({ time: sampling.end * index / 160 }));
    const x = point => g.curve.x + point.time / sampling.end * g.curve.w;
    const yc = concentration => g.curve.y + g.curve.h * (1 - concentration / maxY);
    axes(ctx, g.curve, en ? 'Time (h)' : 'Temps (h)', en ? 'Concentration (mg/L)' : 'Concentration (mg/L)', sampling.end, maxY);
    line(ctx, points, x, point => yc(concentrationAt(sampling, point.time, sampling.popCl)), '#8c4c89', [7, 5], 2);
    line(ctx, points, x, point => yc(concentrationAt(sampling, point.time, posterior.map)), '#087b83', [], 3);
    if (revealTruth) line(ctx, points, x, point => yc(concentrationAt(sampling, point.time)), '#d66b37', [2, 4], 2);
    const cursorX = g.curve.x + time / sampling.end * g.curve.w;
    ctx.strokeStyle = '#173b4077'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(cursorX, g.curve.y); ctx.lineTo(cursorX, g.curve.y + g.curve.h); ctx.stroke(); ctx.setLineDash([]);
    for (const sample of samples) {
      const collectedNow = sample.time <= time + 1e-8, sx = x(sample), sy = yc(sample.observed);
      ctx.fillStyle = collectedNow ? '#087b83' : '#f2f7f8'; ctx.strokeStyle = collectedNow ? '#075e65' : '#7d9299'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = collectedNow ? '#087b83' : '#9babb0'; ctx.beginPath(); ctx.moveTo(sx, g.curve.y + g.curve.h); ctx.lineTo(sx, g.curve.y + g.curve.h + 9); ctx.stroke();
      text(ctx, collectedNow ? (en ? 'collected' : 'prélevé') : (en ? 'planned' : 'prévu'), sx, g.curve.y + g.curve.h + 31, 9, collectedNow ? '#075e65' : '#667b82', 'center');
    }
    text(ctx, en ? 'The estimate updates when a sample is collected' : 'L’estimation se met à jour lors d’un prélèvement', g.curve.x, 22, 11, '#536e77');

    const posteriorMax = Math.max(...posterior.grid.map(row => row.clearance)), priorMax = Math.max(...posterior.grid.map(row => row.prior), 1e-12);
    const px = row => g.side.x + row.clearance / posteriorMax * g.side.w;
    const pyPost = row => g.side.y + g.side.h * (1 - row.density);
    const pyPrior = row => g.side.y + g.side.h * (1 - row.prior / priorMax);
    text(ctx, en ? `CL posterior · ${collected} sample${collected === 1 ? '' : 's'}` : `Posterior CL · ${collected} prélèvement${collected === 1 ? '' : 's'}`, g.side.x, g.side.y - 13, 12, '#294651');
    ctx.fillStyle = '#087b8323'; ctx.fillRect(px({ clearance: posterior.lower }), g.side.y, Math.max(1, px({ clearance: posterior.upper }) - px({ clearance: posterior.lower })), g.side.h);
    line(ctx, posterior.grid, px, pyPrior, '#8c4c89', [6, 4], 1.7);
    line(ctx, posterior.grid, px, pyPost, '#087b83', [], 2.5);
    ctx.strokeStyle = '#6e8790'; ctx.strokeRect(g.side.x, g.side.y, g.side.w, g.side.h);
    text(ctx, '0', g.side.x, g.side.y + g.side.h + 17, 10, '#536e77', 'center');
    text(ctx, `${posteriorMax.toFixed(0)} L/h`, g.side.x + g.side.w, g.side.y + g.side.h + 17, 10, '#536e77', 'center');
  }
  function download() {
    let rows, name;
    if (lab === 'population') {
      rows = [['id','time_h','cl_L_h','v_L','latent_concentration_mg_L','possible_observation_mg_L'], ...popRows.map(row => [row.id + 1, row.time, row.cl, row.v, row.concentration, row.observed])];
      name = 'population-variability.csv';
    } else {
      rows = [['sample','time_h','synthetic_truth_mg_L','observed_mg_L'], ...samples.map((sample, index) => [index + 1, sample.time, sample.truth, sample.observed])];
      name = 'bayesian-sampling.csv';
    }
    const blob = new Blob([rows.map(row => row.join(',')).join('\n')], { type: 'text/csv' }), url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  $: if (mounted) { width; time; lab; popRows; popCurve; refCurve; showResidual; posterior; samples; revealTruth; lab === 'population' ? drawPopulation() : drawSampling(); }
  onMount(() => {
    mounted = true; lab === 'population' ? drawPopulation() : drawSampling();
    const observer = new IntersectionObserver(entries => { if (!entries[0].isIntersecting) pause(); });
    observer.observe(stage);
    const visibility = () => { if (document.hidden) pause(); };
    document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visibility); };
  });
  onDestroy(pause);
</script>

<section class="advanced-labs" data-testid="advanced-laboratories">
  <header><p class="eyebrow">{en ? 'Population and information' : 'Population et information'}</p><h2>{en ? 'Go beyond the typical curve' : 'Dépasser la courbe typique'}</h2></header>
  <div class="lab-tabs" role="group" aria-label={en ? 'Advanced laboratory' : 'Laboratoire avancé'}>
    <button class:active={lab === 'population'} aria-pressed={lab === 'population'} on:click={() => select('population')}>05 / {en ? 'Variability' : 'Variabilité'}</button>
    <button class:active={lab === 'sampling'} aria-pressed={lab === 'sampling'} on:click={() => select('sampling')}>06 / {en ? 'Sampling & Bayes' : 'Prélèvements & Bayes'}</button>
  </div>
  <div class="lab-grid">
    <aside class="parameters">
      {#if lab === 'population'}
        <div class="parameter-head"><strong>{en ? 'Virtual population' : 'Population virtuelle'}</strong><span>IV bolus · 1 cpt</span></div>
        <div class="numbers">{#each Object.keys(populationDefaults) as key}<label for={`population-${key}`}>{popLabels[key][en ? 0 : 1]}<input id={`population-${key}`} type="number" min={populationLimits[key][0]} max={populationLimits[key][1]} step={key === 'count' ? 1 : 'any'} value={pop[key]} on:input={event => changePopulation(key, event)}/></label>{/each}</div>
        <label class="check"><input type="checkbox" bind:checked={showResidual}/>{en ? 'Show possible assay results' : 'Afficher des résultats de dosage possibles'}</label>
        <button class="command" disabled={!popCheck.value} on:click={() => reference = { ...popCheck.value }}><Copy size={17}/>{en ? 'Use as population reference' : 'Prendre comme référence populationnelle'}</button>
        <details><summary>{en ? 'Reference' : 'Référence'}</summary><dl><div><dt>CL</dt><dd>{reference.cl} L/h</dd></div><div><dt>V</dt><dd>{reference.v} L</dd></div><div><dt>ωCL</dt><dd>{reference.omegaCl}</dd></div><div><dt>ωV</dt><dd>{reference.omegaV}</dd></div></dl></details>
      {:else}
        <div class="parameter-head"><strong>{en ? 'Synthetic patient' : 'Patient synthétique'}</strong><span>IV bolus · 1 cpt</span></div>
        <div class="numbers">{#each ['dose','trueCl','popCl','omegaCl','v','sigma','t1','t2','end'] as key}<label class:hidden={key === 't2' && sampling.sampleCount === 1} for={`sampling-${key}`}>{samplingLabels[key][en ? 0 : 1]}<input id={`sampling-${key}`} type="number" min={samplingLimits[key][0]} max={key === 't1' || key === 't2' ? sampling.end : samplingLimits[key][1]} step="any" value={sampling[key]} disabled={key === 't2' && sampling.sampleCount === 1} on:input={event => changeSampling(key, event)}/></label>{/each}</div>
        <fieldset><legend>{en ? 'Sampling design' : 'Plan de prélèvement'}</legend><label><input type="radio" name="sample-count" value="1" checked={sampling.sampleCount === 1} on:change={() => { pause(); sampling = { ...sampling, sampleCount: 1 }; time = 0; }}/>{en ? 'One sample' : 'Un prélèvement'}</label><label><input type="radio" name="sample-count" value="2" checked={sampling.sampleCount === 2} on:change={() => { pause(); sampling = { ...sampling, sampleCount: 2 }; time = 0; }}/>{en ? 'Two samples' : 'Deux prélèvements'}</label></fieldset>
        <label class="check"><input type="checkbox" bind:checked={revealTruth}/>{en ? 'Reveal synthetic truth' : 'Révéler la vérité synthétique'}</label>
        <p class="assumption">{en ? 'Teaching MAP: CL is estimated; dose, V and the residual model are treated as known.' : 'MAP pédagogique : CL est estimée ; la dose, V et le modèle résiduel sont considérés connus.'}</p>
      {/if}
      {#if error}<p class="error" role="alert">{error}</p>{/if}
    </aside>
    <div class="experiment">
      <h3>{lab === 'population' ? (en ? 'Latent PK and possible measurements' : 'PK latente et mesures possibles') : (en ? 'Information arrives with each sample' : 'L’information arrive avec chaque prélèvement')}</h3>
      <div class="legend">
        {#if lab === 'population'}<span class="current">{en ? 'Current median' : 'Médiane actuelle'}</span><span class="band">80 %</span><span class="reference">{en ? 'Reference median' : 'Médiane de référence'}</span>{#if showResidual}<span class="measurement">{en ? 'Possible measurement' : 'Mesure possible'}</span>{/if}
        {:else}<span class="current">MAP</span><span class="reference">{en ? 'Prior curve' : 'Courbe a priori'}</span>{#if revealTruth}<span class="truth">{en ? 'Synthetic truth' : 'Vérité synthétique'}</span>{/if}{/if}
      </div>
      <div class="scene" bind:this={stage} bind:clientWidth={width} role="img" aria-label={lab === 'population' ? (en ? 'Animated virtual population concentration curves and distribution' : 'Courbes et distribution animées de la population virtuelle') : (en ? 'Animated sampling, concentration and clearance posterior' : 'Prélèvements, concentrations et posterior de clairance animés')}><canvas bind:this={canvas} style:height={`${layout().height}px`} data-testid={lab === 'population' ? 'population-lab-canvas' : 'sampling-lab-canvas'}></canvas></div>
      <div class="timebar">
        <button class="icon-button" title={playing ? 'Pause' : (en ? 'Start advanced laboratory' : 'Lancer le laboratoire avancé')} aria-label={playing ? 'Pause advanced laboratory' : (en ? 'Start advanced laboratory' : 'Lancer le laboratoire avancé')} disabled={!valid} on:click={() => playing ? pause() : play()}>{#if playing}<Pause size={19}/>{:else}<Play size={19}/>{/if}</button>
        <button class="icon-button" title={en ? 'Advance one hour' : 'Avancer d’une heure'} aria-label={en ? 'Advance one hour' : 'Avancer d’une heure'} disabled={!valid} on:click={() => { pause(); time = Math.min(end, time + 1); }}><StepForward size={19}/></button>
        <button class="icon-button" title={en ? 'Restart advanced laboratory' : 'Reprendre le laboratoire avancé à zéro'} aria-label={en ? 'Restart advanced laboratory' : 'Reprendre le laboratoire avancé à zéro'} on:click={() => { pause(); time = 0; }}><RotateCcw size={18}/></button>
        {#if lab === 'sampling'}<button class="command" disabled={!nextSample} on:click={() => { pause(); time = nextSample.time; }}><StepForward size={17}/>{en ? 'Next sample' : 'Prélèvement suivant'}</button>{/if}
        <label class="time-input">t (h)<input data-testid="advanced-lab-time" type="number" min="0" max={end} step="0.1" value={time.toFixed(1)} on:input={event => { pause(); const value = event.currentTarget.valueAsNumber; if (Number.isFinite(value)) time = Math.max(0, Math.min(end, value)); }}/></label>
        <label class="speed">{en ? 'Speed' : 'Vitesse'}<select bind:value={speed}><option value={0.5}>0.5 h/s</option><option value={2}>2 h/s</option><option value={6}>6 h/s</option><option value={12}>12 h/s</option></select></label>
      </div>
      <input class="timeline" aria-label={en ? 'Advanced laboratory time' : 'Temps du laboratoire avancé'} type="range" min="0" max={end} step="0.1" value={time} disabled={!valid} on:input={event => { pause(); time = event.currentTarget.valueAsNumber; }}/>
      {#if lab === 'population' && popCheck.value}<div class="metrics"><div><span>{en ? 'Latent median' : 'Médiane latente'}</span><strong data-testid="population-median">{popMedian.toFixed(2)} mg/L</strong></div><div><span>{en ? 'Possible observed median' : 'Médiane observée possible'}</span><strong>{observedMedian.toFixed(2)} mg/L</strong></div><div><span>{en ? 'Virtual subjects' : 'Sujets virtuels'}</span><strong>{pop.count}</strong></div></div>
      {:else if posterior}<div class="metrics"><div><span>{en ? 'Collected samples' : 'Prélèvements réalisés'}</span><strong data-testid="collected-samples">{collected} / {sampling.sampleCount}</strong></div><div><span>CL MAP</span><strong data-testid="posterior-map">{posterior.map.toFixed(2)} L/h</strong></div><div><span>90 % {en ? 'posterior interval' : 'intervalle postérieur'}</span><strong>{posterior.lower.toFixed(2)}–{posterior.upper.toFixed(2)}</strong></div></div>{/if}
      <div class="exports"><button class="command" disabled={!valid} on:click={download}><Download size={17}/>{en ? 'Export CSV' : 'Exporter CSV'}</button><button class="command" on:click={reset}><RotateCcw size={17}/>{en ? 'Reset experiment' : 'Réinitialiser l’expérience'}</button></div>
      <p class="note">{lab === 'population' ? (en ? 'The shaded area represents the 10th–90th percentiles of latent concentrations. Orange rings are illustrative assay outcomes, not additional patients.' : 'La zone ombrée représente les 10e–90e percentiles des concentrations latentes. Les anneaux orange sont des résultats de dosage illustratifs, pas des patients supplémentaires.') : (en ? 'This one-parameter example demonstrates information gain, not a clinical Bayesian estimator. Sampling times, known parameters and the error model determine the result.' : 'Cet exemple à un paramètre illustre le gain d’information, pas un estimateur bayésien clinique. Les temps de prélèvement, paramètres connus et le modèle d’erreur déterminent le résultat.')}</p>
    </div>
  </div>
</section>

<style>
  .advanced-labs { --teal:#087b83; --plum:#8c4c89; margin-top:56px; padding-top:28px; border-top:2px solid var(--border-strong); letter-spacing:0; }
  h2 { font-size:25px; margin:4px 0 20px; } h3 { font-size:17px; margin:16px 0 10px; }
  .eyebrow { font-size:12px; color:var(--text-secondary); margin:0; }
  .lab-tabs { display:flex; flex-wrap:wrap; border-bottom:1px solid var(--border-strong); }
  .lab-tabs button { border:0; border-bottom:3px solid transparent; background:none; color:var(--text-secondary); padding:14px 18px; font-size:14px; }
  .lab-tabs button.active { border-bottom-color:var(--teal); color:var(--text-primary); font-weight:700; }
  .lab-grid { display:grid; grid-template-columns:280px minmax(0,1fr); border-top:1px solid var(--border-subtle); }
  .parameters { border-right:1px solid var(--border-subtle); padding:22px 20px 0 0; min-width:0; }
  .experiment { padding-left:24px; min-width:0; }
  .parameter-head { display:flex; justify-content:space-between; gap:8px; font-size:14px; margin-bottom:18px; }
  .parameter-head span { color:var(--text-secondary); font-size:11px; }
  .numbers { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
  label { font-size:11px; min-width:0; } label.hidden { display:none; }
  input[type=number], select { width:100%; min-width:0; display:block; box-sizing:border-box; border:1px solid var(--border-strong); border-radius:4px; padding:8px; margin-top:4px; color:var(--text-primary); background:var(--bg-tertiary); font:inherit; }
  input[type=checkbox], input[type=radio] { accent-color:var(--teal); }
  .check { display:flex; align-items:center; gap:7px; margin:18px 0; font-size:12px; }
  fieldset { border:0; border-top:1px solid var(--border-subtle); margin:18px 0 0; padding:14px 0 0; }
  fieldset legend { font-size:12px; font-weight:700; padding:0; } fieldset label { display:flex; gap:6px; margin:8px 0; }
  button { cursor:pointer; font:inherit; letter-spacing:0; } button:disabled { cursor:default; opacity:.5; }
  button:focus-visible, input:focus-visible, select:focus-visible, summary:focus-visible { outline:3px solid var(--teal); outline-offset:3px; }
  .command { display:inline-flex; gap:8px; align-items:center; justify-content:center; min-height:38px; padding:8px 12px; border:1px solid var(--border-strong); background:var(--bg-tertiary); color:var(--text-primary); border-radius:4px; font-size:12px; white-space:normal; }
  details { margin:16px 0; font-size:12px; } summary { cursor:pointer; padding:6px 0; } dl div { display:flex; justify-content:space-between; } dd { margin:0; }
  .assumption, .note { font-size:11px; color:var(--text-secondary); line-height:1.5; }
  .error { color:var(--quiz-error-text); background:var(--quiz-error-bg); padding:10px; font-size:12px; }
  .legend { display:flex; flex-wrap:wrap; gap:9px 18px; font-size:11px; margin-bottom:10px; }
  .legend span:before { content:''; display:inline-block; width:20px; border-top:3px solid var(--teal); margin-right:6px; vertical-align:middle; }
  .legend .reference:before { border-color:var(--plum); border-top-style:dashed; } .legend .band:before { height:8px; border:0; background:#168d7140; }
  .legend .measurement:before, .legend .truth:before { border-color:#d66b37; border-top-style:dotted; }
  .scene { width:100%; min-width:0; background:#f2f7f8; } canvas { width:100%; display:block; }
  .timebar { display:flex; align-items:end; gap:8px; margin-top:12px; flex-wrap:wrap; }
  .icon-button { width:38px; height:38px; display:grid; place-items:center; background:var(--bg-tertiary); color:var(--text-primary); border:1px solid var(--border-strong); border-radius:4px; flex:0 0 38px; }
  .time-input { width:90px; margin-left:auto; } .speed { width:95px; }
  .timeline { width:100%; accent-color:var(--teal); margin:16px 0; }
  .metrics { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); border-top:1px solid var(--border-subtle); border-bottom:1px solid var(--border-subtle); padding:15px 0; gap:12px; }
  .metrics span { display:block; color:var(--text-secondary); font-size:10px; } .metrics strong { display:block; margin-top:3px; font-size:18px; font-variant-numeric:tabular-nums; overflow-wrap:anywhere; }
  .exports { display:flex; gap:10px; flex-wrap:wrap; margin:18px 0 10px; }
  @media(max-width:780px) { .lab-grid { grid-template-columns:1fr; } .parameters { border-right:0; padding:16px 0; } .experiment { padding:0; } .numbers { grid-template-columns:repeat(3,minmax(0,1fr)); } }
  @media(max-width:520px) { .numbers { grid-template-columns:repeat(2,minmax(0,1fr)); } .metrics { grid-template-columns:1fr; } .metrics div { display:flex; justify-content:space-between; align-items:baseline; gap:10px; } .time-input { margin-left:0; } }
</style>
