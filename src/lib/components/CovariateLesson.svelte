<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { Play, Pause, RotateCcw } from '@lucide/svelte';
  import { language } from '$lib/stores/language';
  import { reducedMotion } from '$lib/motion/reducedMotion';
  import CovariatePlot from './CovariatePlot.svelte';
  import { lessonDefaults, lessonDomain, lessonTypical, lessonData, validLesson, symbolicStudyRange } from '$lib/covariates/lessons';

  let { lesson }: { lesson: string } = $props();
  let p = $state(lessonDefaults());
  const initial = () => lesson === 'groups' ? 1 : lesson === 'physiology' ? 40 : lesson === 'symbolic' ? 60 : 70;
  let value = $state(initial());
  let playing = $state(false);
  let mounted = $state(false);
  let showCloud = $state(true);
  let root: HTMLElement;
  const t = (fr: string, en: string) => $language === 'en' ? en : fr;
  let limits = $derived(lessonDomain(lesson, p));
  let categories = $derived(lesson === 'groups' && p.grouping === 'category');
  let valid = $derived(validLesson(p) && Number.isFinite(value) && value >= limits[0] && value <= limits[1]);
  let extrapolation = $derived(lesson === 'symbolic' && valid && (value < symbolicStudyRange[0] || value > symbolicStudyRange[1]));
  let data = $derived(lessonData(lesson, p));
  let selected = $derived(valid ? lessonTypical(lesson, value, p) * (lesson === 'basics' ? Math.exp(p.eta) : 1) : 0);
  let volume = $derived(lesson === 'implementation' && p.parameter === 'V');
  let xLabel = $derived(categories ? t('Catégorie', 'Category') : lesson === 'physiology' ? t('PMA (semaines)', 'PMA (weeks)') : t('Poids (kg)', 'Weight (kg)'));
  let yLabel = $derived(volume ? 'V (L)' : 'CL (L/h)');
  let formula = $derived(lesson === 'basics' ? `CL = 4 (WT/70)^${p.beta} exp(η)` : lesson === 'groups' ? `CL = 4 × ratio(${categories ? 'A, B, C' : 'WT'}) × exp(η)` : lesson === 'physiology' ? `CL = 4 PMA^${p.hill} / (${p.half}^${p.hill} + PMA^${p.hill}) × exp(η)` : lesson === 'symbolic' ? 'CLtyp = 4 exp(0.75 log(z) + 0.15 (z−1)²), z = WT/70' : volume ? 'V = 30 (WT/70) exp(ηV)' : 'CL = 4 (WT/70)^0.75 × 1.3^GENO × exp(ηCL)');
  let series = $derived([
    ...(showCloud && data.cloud.length ? [{ points: data.cloud, color: 'var(--text-muted)', dots: true, label: lesson === 'symbolic' ? t('42 patients simulés · 40–90 kg', '42 simulated patients · 40–90 kg') : t('Individus synthétiques', 'Synthetic individuals') }] : []),
    { points: data.typical, color: '#18998d', label: lesson === 'symbolic' ? t('Relation génératrice', 'Generating relationship') : lesson === 'implementation' ? 'GENO = 0' : t('Paramètre typique · ETA = 0', 'Typical parameter · ETA = 0') },
    ...(data.comparison.length ? [{ points: data.comparison, color: '#c45f88', dashed: true, label: lesson === 'symbolic' ? t('Approximation symbolique', 'Symbolic approximation') : 'GENO = 1' }] : [])
  ]);

  function reset() { playing = false; p = lessonDefaults(); value = initial(); showCloud = true; }
  function changeGrouping() { playing = false; value = categories ? 1 : 70; }
  onMount(() => {
    mounted = true;
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) playing = false; });
    observer.observe(root);
    const pauseHidden = () => { if (document.hidden) playing = false; };
    document.addEventListener('visibilitychange', pauseHidden);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', pauseHidden); };
  });
  $effect(() => {
    if (!valid || $reducedMotion) playing = false;
  });
  $effect(() => {
    if (!playing) return;
    const [min, max] = limits;
    const discrete = categories;
    let progress = untrack(() => (value - min) / (max - min));
    let previous = performance.now();
    let frame: number;
    const animate = (time: number) => {
      progress = (progress + Math.min(100, time - previous) / 10000) % 1;
      previous = time;
      value = discrete ? Math.min(2, Math.floor(progress * 3)) : min + progress * (max - min);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  });
</script>

<div class="lesson" bind:this={root} data-testid="covariate-lesson" data-lesson={lesson} inert={!mounted}>
  <CovariatePlot title={t('Covariable → paramètre', 'Covariate → parameter')} {xLabel} {yLabel} {categories}
    series={valid ? series : []} xDomain={categories ? [-0.3, 2.3] : limits} yMax={data.yMax}
    highlight={valid ? { x: value, y: selected } : undefined}
    xTicks={lesson === 'symbolic' ? [20, 40, 90, 200] : undefined}
    bands={lesson === 'symbolic' ? [{ from: limits[0], to: symbolicStudyRange[0] }, { from: symbolicStudyRange[1], to: limits[1] }] : []} />
  <div class="playback">
    <button data-testid="covariate-play" onclick={() => playing = !playing} disabled={!mounted || !valid || $reducedMotion}
      aria-pressed={playing} aria-label={playing ? t('Pause', 'Pause') : t('Animer la covariable', 'Animate covariate')}
      title={$reducedMotion ? t('Mouvements réduits activés', 'Reduced motion enabled') : playing ? t('Pause', 'Pause') : t('Animer la covariable', 'Animate covariate')}>
      {#if playing}<Pause size={17}/>{:else}<Play size={17}/>{/if}
    </button>
    <button onclick={reset} title={t('Réinitialiser', 'Reset')} aria-label={t('Réinitialiser', 'Reset')}><RotateCcw size={17}/></button>
    <span data-testid="covariate-reading">{valid ? `${categories ? ['A', 'B', 'C'][value] : value.toFixed(2)} → ${selected.toFixed(2)} ${volume ? 'L' : 'L/h'}` : '—'}</span>
  </div>
  {#if lesson === 'symbolic'}
    <p class:outside={extrapolation} class="domain-note" data-testid="covariate-domain-status">
      {extrapolation ? t('Hors plage : extrapolation non validée.', 'Out of range: unvalidated extrapolation.') : t('Plage illustrée par les patients simulés : 40–90 kg.', 'Range represented by simulated patients: 40–90 kg.')}
    </p>
  {/if}
  <div class="controls">
    {#if lesson === 'groups'}
      <label>{t('Représentation', 'Representation')}<select data-testid="covariate-grouping" bind:value={p.grouping} onchange={changeGrouping}><option value="category">{t('Catégories A / B / C', 'Categories A / B / C')}</option><option value="threshold">{t('Paliers de poids', 'Weight thresholds')}</option></select></label>
    {/if}
    {#if categories}
      <label>{xLabel}<select bind:value={value} onchange={() => playing = false}><option value={0}>A</option><option value={1}>B</option><option value={2}>C</option></select></label>
    {:else}
      <label>{xLabel}<input data-testid="lesson-covariate-value" type="number" min={limits[0]} max={limits[1]} step="any" value={Number.isFinite(value) ? Number(value.toFixed(2)) : ''} oninput={(e) => { playing = false; value = e.currentTarget.valueAsNumber; }}/></label>
    {/if}
    {#if lesson === 'basics'}
      <label>β<input data-testid="lesson-beta" type="number" min="-2" max="2" step="0.05" bind:value={p.beta}/></label>
      <label>{t('Écart-type des ETA (ω)', 'ETA standard deviation (ω)')}<input data-testid="lesson-omega" type="number" min="0" max="0.6" step="0.05" bind:value={p.omega}/></label>
      <label>{t('ETA sélectionné', 'Selected ETA')}<input type="number" min="-1" max="1" step="0.05" bind:value={p.eta}/></label>
    {:else if lesson === 'groups'}
      <label>A / B<input type="number" min="0.1" max="3" step="0.1" bind:value={p.low}/></label>
      <label>C / B<input type="number" min="0.1" max="3" step="0.1" bind:value={p.high}/></label>
    {:else if lesson === 'physiology'}
      <label>{t('PMA50 (semaines)', 'PMA50 (weeks)')}<input data-testid="lesson-half" type="number" min="20" max="100" step="1" bind:value={p.half}/></label>
      <label>Hill h<input type="number" min="0.5" max="6" step="0.1" bind:value={p.hill}/></label>
    {:else if lesson === 'symbolic'}
      <label>{t('Formule candidate', 'Candidate formula')}<select data-testid="lesson-approximation" bind:value={p.approximation}><option value="linear">{t('Linéaire', 'Linear')} : 4 (1 + 0.75 (z−1))</option><option value="power">{t('Puissance', 'Power')} : 4 z^0.75</option><option value="full">{t('Expression complète', 'Full expression')}</option></select></label>
      <label>{t('Écart-type des ETA (ω)', 'ETA standard deviation (ω)')}<input data-testid="lesson-omega" type="number" min="0" max="0.6" step="0.05" bind:value={p.omega}/></label>
    {:else if lesson === 'implementation'}
      <label>{t('Paramètre', 'Parameter')}<select data-testid="lesson-parameter" bind:value={p.parameter}><option value="CL">CL (L/h)</option><option value="V">V (L)</option></select></label>
      <label>{t('Génotype sélectionné', 'Selected genotype')}<select data-testid="lesson-genotype" bind:value={p.genotype}><option value={0}>0</option><option value={1}>1</option></select></label>
    {/if}
  </div>
  <label class="check"><input data-testid="lesson-show-patients" type="checkbox" bind:checked={showCloud}/>{lesson === 'symbolic' ? t('Patients simulés', 'Simulated patients') : t('Individus synthétiques', 'Synthetic individuals')}</label>
  {#if !valid}<p role="alert">{t('Renseignez les valeurs dans les limites proposées.', 'Enter values within the specified bounds.')}</p>{/if}
  <p class="formula">{formula}</p>
  {#if lesson === 'basics'}
    <p>{t('Bêta change la relation typique ; ω change la dispersion des paramètres autour de cette relation. L’ETA sélectionné déplace un seul individu, pas la courbe typique.', 'Beta changes the typical relationship; ω changes parameter dispersion around it. The selected ETA shifts one individual, not the typical curve.')}</p>
  {:else if lesson === 'groups'}
    <p>{t('A/B/C sont des catégories, sans interpolation. Les seuils 60 et 90 kg créent des sauts fictifs : ils ne sont pas des seuils cliniques ni le résultat d’un clustering.', 'A/B/C are categories, with no interpolation. The 60 and 90 kg thresholds create illustrative jumps: these are neither clinical thresholds nor learned clusters.')}</p>
  {:else if lesson === 'physiology'}
    <p>{t('À PMA50, la CL typique atteint 50 % de CLmax (4 L/h). La taille est fixée ; cette fonction de maturation seule n’est pas un modèle PBPK complet.', 'At PMA50, typical CL reaches 50% of CLmax (4 L/h). Body size is fixed; this maturation function alone is not a complete PBPK model.')}</p>
  {:else if lesson === 'symbolic'}
    <p data-testid="symbolic-error">{t('Écart relatif RMS entre courbes sur 40–90 kg', 'Relative RMS deviation between curves over 40–90 kg')} : <strong>{data.error.toFixed(2)} %</strong></p>
    <p>{t('Les patients simulés suivent CLi = CLtyp × exp(ηi), avec ηi ~ N(0, ω²). Les formules sont construites : aucun réseau ni modèle n’est ajusté ici. L’écart RMS compare les courbes typiques, pas les patients ; zéro avec l’expression complète est une identité mathématique, pas une validation.', 'Simulated patients follow CLi = CLtyp × exp(ηi), with ηi ~ N(0, ω²). These are constructed formulas: no network or model is fitted here. RMS deviation compares typical curves, not patients; zero with the full expression is a mathematical identity, not validation.')}</p>
    <p>{t('Les zones grisées sont hors de 40–90 kg. Une relation étudiée dans cette plage ne peut pas être appliquée à 20 ou 200 kg sans justification et validation spécifiques, même si la formule renvoie un nombre.', 'Shaded regions are outside 40–90 kg. A relationship studied within that range cannot be applied at 20 or 200 kg without specific justification and validation, even if the formula returns a number.')}</p>
  {:else}
    <p>{t('Le poids agit sur CL et V ; GENO agit seulement sur CL. Les ETA simulés suivent OMEGA du cours : variances 0,09 / 0,04, covariance 0,03 (corrélation 0,5).', 'Weight affects CL and V; GENO affects CL only. Simulated ETAs follow the course OMEGA: variances 0.09 / 0.04, covariance 0.03 (correlation 0.5).')}</p>
  {/if}
  <small>{t('Illustration pédagogique. Les points représentent des paramètres individuels simulés, pas des concentrations observées.', 'Teaching illustration. Points represent simulated individual parameters, not observed concentrations.')}</small>
</div>

<style>
  .lesson { display: grid; gap: 12px; min-width: 0; }
  .controls { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  label { display: flex; flex-direction: column; gap: 5px; font-size: .82rem; color: var(--text-secondary); min-width: 0; }
  input, select { width: 100%; min-width: 0; min-height: 36px; box-sizing: border-box; background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-strong); border-radius: 4px; padding: 5px 7px; font: inherit; }
  .playback { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .playback span { font-variant-numeric: tabular-nums; font-size: .86rem; }
  button { display: grid; place-items: center; width: 36px; height: 36px; flex-shrink: 0; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-strong); border-radius: 4px; cursor: pointer; }
  button:disabled { opacity: .45; cursor: not-allowed; }
  .check { flex-direction: row; align-items: center; } .check input { width: 16px; min-height: 16px; }
  .formula { font-family: var(--font-mono); overflow-wrap: anywhere; color: var(--text-primary); }
  .domain-note { border-left: 3px solid #18998d; padding-left: 10px; }
  .domain-note.outside { border-color: #c45f88; font-weight: 650; }
  p { margin: 0; font-size: .84rem; line-height: 1.55; } small { color: var(--text-secondary); font-size: .76rem; line-height: 1.5; }
  :is(input, select, button):focus-visible { outline: 2px solid #18998d; outline-offset: 3px; }
</style>
