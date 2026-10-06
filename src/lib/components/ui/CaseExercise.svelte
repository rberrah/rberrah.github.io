<script>
  // @ts-nocheck
  import { onMount, tick } from 'svelte';
  import { base } from '$app/paths';
  import { afterNavigate } from '$app/navigation';
  import { ArrowLeft, ArrowRight, Check, RotateCcw, Lightbulb, Eye, BookOpen } from '@lucide/svelte';
  import { language } from '$lib/stores/language';
  import { learning, markLearning, loadLearning } from '$lib/stores/learning';
  import { assess, activityStatus, emptyStep } from '$lib/learning/assessment';
  import { displayUnit } from '$lib/learning/activityContent';
  import { resolveSources } from '$lib/content/references';
  import { defaults, covariateCurves } from '$lib/covariates/models';
  import CovariateLesson from '../CovariateLesson.svelte';
  import CovariatePlot from '../CovariatePlot.svelte';
  import ScientificText from './ScientificText.svelte';
  import ActivityExperiment from './ActivityExperiment.svelte';

  export let activity;
  const text = value => value?.[$language] ?? value?.fr ?? '';
  const t = (fr, en) => $language === 'en' ? en : fr;
  const number = value => new Intl.NumberFormat($language, { maximumSignificantDigits: 4 }).format(value);
  let states = activity.steps.map(emptyStep), index = 0, open = false, finished = false;
  let visuals = {}, root, heading, status = '', mounted = false;
  $: step = activity.steps[index];
  $: state = states[index];
  $: done = step.type === 'reflection' ? state.reviewed : state.correct || state.revealed;
  $: sourceList = resolveSources(activity.sources);
  $: savedStatus = $learning.activities[activity.id];
  $: skills = [
    activity.steps.some(item => item.type === 'numeric') && ['Calcul', 'Calculation'],
    activity.steps.some(item => item.type === 'select') && ['Décision', 'Decision'],
    activity.steps.some(item => item.type === 'reflection') && ['Interprétation', 'Interpretation'],
    activity.steps.some(item => item.type === 'tune' || item.experiment || item.visual) && ['Manipulation', 'Parameter exploration'],
    activity.steps.some(item => item.code) && ['Lecture de code', 'Code reading']
  ].filter(Boolean).map(item => item[$language === 'en' ? 1 : 0]);
  const labels = { attempted: ['Tenté', 'Attempted'], reviewed: ['Corrigé consulté', 'Solution reviewed'], passed: ['Réussi (étapes objectives)', 'Passed (objective steps)'] };
  $: resultLabel = labels[savedStatus] ? t(...labels[savedStatus]) : t('À commencer', 'Not started');
  const profiles = [50, 80].map(value => covariateCurves('transformed', { ...defaults('transformed'), value }).selected);

  function update(values) { states[index] = { ...states[index], ...values }; states = [...states]; }
  function record() {
    status = activityStatus(activity.steps, states);
    if (status) markLearning('activities', activity.id, status);
  }
  function check() {
    const input = step.type === 'select' ? state.selected : step.type === 'tune' ? (visuals[index]?.valid ? visuals[index].settings : null) : state.input;
    const result = assess(step, input, state.unit || (step.units ? '' : step.unit));
    update({ result, correct: result.correct, attempts: state.attempts + (result.valid ? 1 : 0) });
    record();
  }
  function reveal() { update({ revealed: true }); record(); }
  function choose(option, checked) {
    update({ selected: checked ? [...state.selected, option] : state.selected.filter(value => value !== option), correct: false, result: null });
  }
  function changeVisual(value) {
    if (JSON.stringify(visuals[index]) === JSON.stringify(value)) return;
    visuals[index] = value; visuals = { ...visuals };
    if (step.type === 'tune' && state.correct) { update({ correct: false, result: null }); record(); }
  }
  async function navigate(next) { index = next; await tick(); heading?.focus(); }
  function restart() {
    states = activity.steps.map(emptyStep); visuals = {}; index = 0; finished = false;
    markLearning('activities', activity.id, 'attempted');
  }
  function openFromHash() {
    if (mounted && location.hash === `#activity-${activity.id}`) {
      open = true;
      tick().then(() => root?.scrollIntoView({ block: 'start' }));
    }
  }
  afterNavigate(openFromHash);
  onMount(() => {
    mounted = true; loadLearning(); openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  });
</script>

<details class="activity" id={`activity-${activity.id}`} bind:this={root} bind:open data-testid={`activity-${activity.id}`}>
  <summary><div><span class="meta">{t('Activité guidée', 'Guided activity')} · {activity.minutes} min · {t('Niveau', 'Level')} {activity.difficulty}</span><h3>{text(activity.title)}</h3><span class="skills">{skills.join(' · ')}</span><span class="status">{resultLabel}</span></div></summary>
  {#if open}
    <div class="activity-body" inert={!mounted}>
      <p class="objective"><ScientificText text={text(activity.objective)}/></p>
      <p class="context"><ScientificText text={text(activity.context)}/></p>
      <p class="synthetic">{t('Données fictives pour l’enseignement, sans recommandation clinique.', 'Fictional teaching data, not a clinical recommendation.')}</p>
      {#if finished}
        <section class="completion" aria-live="polite" data-testid="activity-complete">
          <h4>{t('Activité parcourue', 'Activity completed')}</h4>
          <p>{resultLabel}</p>
          <p>{t('Le statut « réussi » porte uniquement sur les étapes à correction automatique. Les justifications sont autoévaluées ; ce statut ne certifie pas une maîtrise.', 'Passed status applies only to automatically checked steps. Reasoning is self-assessed; this status does not certify mastery.')}</p>
          <button on:click={() => { finished = false; navigate(0); }}><ArrowLeft size={16}/>{t('Revoir mes étapes', 'Review my steps')}</button>
        </section>
      {:else}
        <div class="step-head"><span>{t('Étape', 'Step')} {index + 1} / {activity.steps.length}</span><progress max={activity.steps.length} value={index} aria-label={t('Étapes parcourues', 'Completed steps')}></progress></div>
        <section class="task" aria-labelledby={`prompt-${activity.id}`}>
          <h4 id={`prompt-${activity.id}`} tabindex="-1" bind:this={heading}><ScientificText text={text(step.prompt)}/></h4>
          {#if step.code}<pre><code>{step.code}</code></pre>{/if}
          {#if step.table}
            <div class="data-table"><table><thead><tr>{#each step.table.columns as column}<th scope="col">{text(column)}</th>{/each}</tr></thead><tbody>{#each step.table.rows as row}<tr>{#each row as value}<td>{value}</td>{/each}</tr>{/each}</tbody></table></div>
          {/if}
          {#if step.experiment}
            {#key index}<div class="experiment"><ActivityExperiment experiment={step.experiment} initialSettings={visuals[index]?.settings} onchange={changeVisual}/></div>{/key}
          {/if}
          {#if activity.id === 'cov-synthesis' && index === 2}
            <CovariatePlot title={t('Profils après le bolus IV', 'Profiles after the IV bolus')} xLabel={t('Temps (h)', 'Time (h)')} yLabel="C (mg/L)" series={[
              { points: profiles[0], color: '#18998d', label: 'A · 50 kg' },
              { points: profiles[1], color: '#c45f88', dashed: true, label: 'B · 80 kg' }
            ]}/>
          {/if}
          {#if step.visual}
            {#key index}
              <div class="experiment">
                <CovariateLesson lesson={step.visual.lesson} initialSettings={visuals[index]?.settings ?? step.visual.settings ?? {}} initialValue={visuals[index]?.value ?? step.visual.value}
                  onchange={changeVisual} />
              </div>
            {/key}
          {/if}
          {#if step.type === 'numeric'}
            <form on:submit|preventDefault={check}>
              <div class="numeric">
                <label>{t('Votre valeur', 'Your value')}<input data-testid="case-number" inputmode="decimal" type="text" bind:value={state.input} disabled={done} required autocomplete="off" /></label>
                {#if step.units}<label>{t('Unité', 'Unit')}<select data-testid="case-unit" bind:value={state.unit} disabled={done} required><option value="">{t('Choisir', 'Choose')}</option>{#each step.units as unit}<option value={unit}>{displayUnit(unit, $language)}</option>{/each}</select></label>
                {:else if step.unit}<span class="unit">{displayUnit(step.unit, $language)}</span>{/if}
                <button type="submit" disabled={done}><Check size={16}/>{t('Vérifier', 'Check')}</button>
              </div>
              <p class="tolerance">{t('Tolérance', 'Tolerance')} : {step.tolerance.kind === 'relative' ? `${number(step.tolerance.value * 100)} % (${t('relative', 'relative')})` : `± ${number(step.tolerance.value)} ${displayUnit(step.unit, $language)} (${t('absolue', 'absolute')})`}</p>
            </form>
          {:else if step.type === 'select'}
            <fieldset disabled={done}><legend>{t('Toutes les propositions correctes', 'All correct statements')}</legend>
              {#each step.options as option, i}<label class="option"><input type="checkbox" checked={state.selected.includes(i)} on:change={e => choose(i, e.currentTarget.checked)} /><ScientificText text={text(option)}/></label>{/each}
            </fieldset>
            <button on:click={check} disabled={done}><Check size={16}/>{t('Vérifier', 'Check')}</button>
          {:else if step.type === 'tune'}
            <button on:click={check} disabled={done}><Check size={16}/>{t('Vérifier les paramètres', 'Check parameters')}</button>
          {:else}
            <label>{t('Votre raisonnement (non sauvegardé)', 'Your reasoning (not saved)')}<textarea rows="4" maxlength="4000" bind:value={state.input} disabled={state.revealed} data-testid="case-reasoning"></textarea></label>
          {/if}
          {#if state.result}
            <div class:correct={state.correct} class="feedback" role="status" data-testid="case-feedback">
              {#if state.correct}{t('Résultat correct.', 'Correct result.')}
              {:else if !state.result.valid}{t('Renseignez une réponse valide avant de vérifier.', 'Enter a valid answer before checking.')}
              {:else if state.result.reason === 'unit'}{t('L’unité ne correspond pas à la grandeur demandée. La valeur doit être donnée dans l’unité attendue, sans conversion implicite.', 'The unit does not match the requested quantity. Give the value in the expected unit; there is no implicit conversion.')}
              {:else if state.result.feedback}<ScientificText text={text(state.result.feedback)}/>
              {:else}{t('Ce résultat ne respecte pas encore les conditions de l’exercice. Vérifiez les hypothèses, les unités ou utilisez un indice.', 'This result does not yet meet the exercise conditions. Check assumptions, units or use a hint.')}{/if}
            </div>
          {/if}
          <div class="actions">
            {#if !done && state.hints < (step.hints?.length ?? 0)}<button on:click={() => update({ hints: state.hints + 1 })}><Lightbulb size={16}/>{t('Indice', 'Hint')} {state.hints + 1}</button>{/if}
            {#if !state.correct && !state.revealed}<button on:click={reveal}><Eye size={16}/>{step.type === 'reflection' ? t('Comparer au corrigé', 'Compare with the rubric') : t('Voir le corrigé', 'View solution')}</button>{/if}
          </div>
          {#each (step.hints ?? []).slice(0, state.hints) as hint}<p class="hint"><ScientificText text={text(hint)}/></p>{/each}
          {#if state.correct || state.revealed}
            <div class="correction" data-testid="case-correction">
              <h5>{t('Raisonnement attendu', 'Expected reasoning')}</h5><p><ScientificText text={text(step.correction)}/></p>
              {#if step.type === 'reflection'}
                <ul>{#each step.rubric as criterion}<li><ScientificText text={text(criterion)}/></li>{/each}</ul>
                <p>{t('Comparez votre réponse à ces critères. Aucun texte libre n’est noté automatiquement.', 'Compare your response with these criteria. Free text is not automatically graded.')}</p>
                <label class="option"><input type="checkbox" checked={state.reviewed} on:change={e => { update({ reviewed: e.currentTarget.checked }); record(); }} />{t('J’ai comparé mon raisonnement aux critères.', 'I have compared my reasoning with the criteria.')}</label>
              {:else if state.revealed}<p>{t('Corrigé consulté : cette étape ne compte pas comme une réussite autonome.', 'Solution viewed: this step does not count as an independent success.')}</p>{/if}
            </div>
          {/if}
          <nav class="step-nav" aria-label={t('Étapes de l’exercice', 'Exercise steps')}>
            <button on:click={() => navigate(index - 1)} disabled={index === 0}><ArrowLeft size={16}/>{t('Précédent', 'Previous')}</button>
            {#if index < activity.steps.length - 1}<button on:click={() => navigate(index + 1)} disabled={!done}>{t('Suivant', 'Next')}<ArrowRight size={16}/></button>
            {:else}<button on:click={() => { record(); finished = true; }} disabled={!done}>{t('Terminer', 'Finish')}<Check size={16}/></button>{/if}
          </nav>
        </section>
      {/if}
      <footer>
        <a href={`${base}/chapitres/${activity.chapter}/?lang=${$language}`}><BookOpen size={16}/>{t('Revoir le cours', 'Review the lesson')}</a>
        <button on:click={restart}><RotateCcw size={16}/>{t('Recommencer', 'Restart')}</button>
        <details class="sources"><summary>{t('Références et hypothèses', 'References and assumptions')}</summary><p>{t('Ces références étayent les concepts, pas les coefficients fictifs de l’exercice.', 'These references support the concepts, not the fictional exercise coefficients.')}</p><ul>{#each sourceList as source}<li><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></li>{/each}</ul></details>
      </footer>
    </div>
  {/if}
</details>

<style>
  .activity { border: 1px solid var(--border-strong); border-radius: 6px; background: var(--bg-primary); min-width: 0; scroll-margin-top: 100px; }
  summary { cursor: pointer; padding: 16px; color: var(--text-primary); }
  summary > div { display: inline; } h3 { margin: 5px 0; font-size: 1.05rem; } .meta, .status, .synthetic, .tolerance { font-size: .78rem; color: var(--text-secondary); }
  .skills { display: block; margin-bottom: 5px; color: var(--accent-ai); font-family: var(--font-mono); font-size: .72rem; }
  .activity-body { padding: 0 16px 16px; min-width: 0; } p { line-height: 1.6; } .objective { font-weight: 600; } .context { white-space: pre-line; }
  .step-head { display: flex; gap: 16px; align-items: center; margin-top: 24px; font-size: .85rem; } progress { width: 100px; height: 7px; accent-color: #18998d; }
  h4 { font-size: 1rem; line-height: 1.6; margin: 12px 0; scroll-margin-top: 100px; } h5 { font-size: .9rem; margin: 0; }
  .experiment { border-block: 1px solid var(--border-subtle); padding-block: 16px; margin-block: 16px; }
  label { display: grid; gap: 6px; font-size: .9rem; min-width: 0; } input, select, textarea { min-width: 0; box-sizing: border-box; padding: 9px; font: inherit; background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-strong); border-radius: 4px; }
  textarea { width: 100%; resize: vertical; } .numeric { display: flex; flex-wrap: wrap; gap: 12px; align-items: end; } .numeric input { width: 150px; max-width: 100%; } .unit { padding-bottom: 10px; }
  button, footer > a { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 38px; padding: 7px 10px; font: inherit; font-size: .85rem; color: var(--text-primary); background: var(--bg-secondary); border: 1px solid var(--border-strong); border-radius: 4px; cursor: pointer; text-decoration: none; }
  button:disabled { opacity: .5; cursor: not-allowed; } button :global(svg), a :global(svg) { flex-shrink: 0; }
  .actions, .step-nav, footer { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; } .step-nav { justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: 16px; }
  fieldset { border: 0; padding: 0; margin: 16px 0; } legend { font-size: .8rem; margin-bottom: 10px; color: var(--text-secondary); } .option { display: flex; align-items: start; gap: 9px; margin: 10px 0; line-height: 1.5; } .option input { flex-shrink: 0; margin-top: 4px; }
  .feedback, .correction { border-left: 3px solid #a14b64; padding: 12px; margin-top: 16px; background: var(--bg-secondary); line-height: 1.6; } .correct, .correction { border-color: #18998d; } .correction p:last-child { margin-bottom: 0; } .hint { padding-left: 12px; border-left: 2px solid var(--border-strong); }
  pre { overflow-x: auto; max-width: 100%; padding: 12px; background: var(--bg-secondary); font-size: .8rem; } .sources { width: 100%; overflow-wrap: anywhere; } .sources summary { padding: 8px 0; font-size: .85rem; } .sources p, .sources li { font-size: .8rem; }
  .data-table { overflow-x: auto; margin-block: 16px; } table { width: 100%; border-collapse: collapse; font-size: .85rem; } th, td { padding: 8px; text-align: left; border-bottom: 1px solid var(--border-strong); }
  :is(button, a, input, select, textarea, summary):focus-visible { outline: 2px solid #18998d; outline-offset: 3px; }
  @media (max-width: 480px) { .numeric { display: grid; grid-template-columns: minmax(0, 1fr); } .numeric input { width: 100%; } }
</style>
