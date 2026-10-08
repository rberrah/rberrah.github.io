<script>
  // Bloc d'exercices interactifs réutilisable (page globale /exercices ET par chapitre).
  // Gère son propre état ; accepte une liste d'exercices et un titre optionnel.
  import { language } from '$lib/stores/language';
  import { ui } from '$lib/i18n/translations';
  import CaseExercise from './CaseExercise.svelte';
  import ScientificText from './ScientificText.svelte';

  /** @type {import('$lib/content/exercises').Exercise[]} */
  export let items = [];
  /** @type {string} */
  export let heading = '';
  /** @type {import('$lib/learning/types').Activity[]} */
  export let activities = [];
  /** Affiche les séparateurs de catégories sur les pages de chapitre/parcours. */
  export let showGroupHeading = true;

  $: copy = ui($language);

  // Vue localisée : en anglais, on utilise ex.en si présent (repli sur le FR).
  // L'ordre des options et l'index `correct` sont conservés entre les langues.
  $: shown = items.map((ex) =>
    $language === 'en' && ex.en
      ? { ...ex, q: ex.en.q, explain: ex.en.explain }
      : ex
  );
  $: guided = activities.filter(activity => activity.kind !== 'synthesis');
  $: syntheses = activities.filter(activity => activity.kind === 'synthesis');

  /** @type {{done:boolean,correct:boolean,input:string}[]} */
  let state = [];
  // (ré)initialise l'état si la liste change
  /** @type {import('$lib/content/exercises').Exercise[] | undefined} */
  let previousItems;
  $: if (previousItems !== items) { previousItems = items; state = items.map(() => ({ done: false, correct: false, input: '' })); }
  function checkNum(/** @type {number} */ i) {
    const ex = items[i];
    const v = parseFloat((state[i].input || '').replace(',', '.'));
    const tol = (ex.tol ?? 0.05) * Math.abs(ex.answer ?? 0) + 1e-9;
    const ok = Number.isFinite(v) && Math.abs(v - (ex.answer ?? 0)) <= tol;
    state[i] = { ...state[i], done: true, correct: ok };
    state = state;
  }
  function reset(/** @type {number} */ i) {
    state[i] = { done: false, correct: false, input: '' };
    state = state;
  }

  $: answered = state.filter((s) => s.done).length;
  $: score = state.filter((s) => s.done && s.correct).length;
</script>

<div class="block">
  {#if heading}<h3 class="heading">{heading}</h3>{/if}
  {#if guided.length && showGroupHeading}
    <header class="group-heading">
      <span>{$language === 'en' ? 'Guided activities' : 'Activités guidées'}</span>
      <p>{$language === 'en' ? 'Multi-step cases combining calculation, interpretation and reasoning.' : 'Cas en plusieurs étapes combinant calcul, interprétation et raisonnement.'}</p>
    </header>
  {/if}
  {#each guided as activity (activity.id)}<CaseExercise {activity}/>{/each}
  {#if syntheses.length && showGroupHeading}
    <header class="group-heading synthesis">
      <span>{$language === 'en' ? 'Synthesis case' : 'Cas de synthèse'}</span>
      <p>{$language === 'en' ? 'A cumulative problem combining several lessons in one justified decision.' : 'Un problème cumulatif mobilisant plusieurs cours dans une décision argumentée.'}</p>
    </header>
  {/if}
  {#each syntheses as activity (activity.id)}<CaseExercise {activity}/>{/each}
  {#if shown.length && showGroupHeading}
    <header class="group-heading calculations">
      <span>{$language === 'en' ? 'Calculations' : 'Calculs'}</span>
      <p>{$language === 'en' ? 'Short numerical problems with units and immediate worked solutions.' : 'Problèmes numériques courts avec unités et correction immédiate.'}</p>
    </header>
  {/if}
  {#each shown as ex, i}
    <article class="ex" class:ok={state[i]?.done && state[i]?.correct} class:ko={state[i]?.done && !state[i]?.correct}>
      <span class="exercise-type">{$language === 'en' ? 'Calculation' : 'Calcul'}</span>
      <p class="q"><ScientificText text={ex.q}/></p>

      <div class="num">
        <input
          type="text"
          inputmode="decimal"
          bind:value={state[i].input}
          aria-label={$language === 'en' ? 'Your value' : 'Votre valeur'}
          placeholder={$language === 'en' ? 'value' : 'valeur'}
          disabled={state[i]?.done}
          on:keydown={(e) => e.key === 'Enter' && checkNum(i)}
        />
        {#if ex.unit}<span class="unit">{ex.unit}</span>{/if}
        {#if !state[i]?.done}<button class="check" on:click={() => checkNum(i)}>{copy.pages.exercisesCheck}</button>{/if}
      </div>

      {#if state[i]?.done}
        <div class="feedback">
          <span class="badge">{state[i].correct ? '✓ ' + copy.pages.exercisesRight : '✗ ' + copy.pages.exercisesWrong}</span>
          <span class="answer">{copy.pages.exercisesAnswer}: {ex.answer} {ex.unit ?? ''}</span>
          <p class="explain"><ScientificText text={ex.explain}/></p>
          <button class="retry" on:click={() => reset(i)}>{copy.pages.exercisesRetry}</button>
        </div>
      {/if}
    </article>
  {/each}
  {#if answered > 0}<p class="score">{copy.pages.exercisesScore}: <strong>{score}</strong> / {answered}</p>{/if}
</div>

<style>
  .block { display: grid; gap: var(--space-4); }
  .heading { font-size: var(--text-sm); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent-pk); border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-2); margin: 0; }
  .group-heading { margin-top: var(--space-3); padding-bottom: var(--space-2); border-bottom: 2px solid var(--accent-ai); }
  .group-heading.calculations { margin-top: var(--space-6); border-color: var(--accent-pk); }
  .group-heading.synthesis { margin-top: var(--space-6); border-color: #087b83; }
  .group-heading span, .exercise-type { font-family: var(--font-mono); font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
  .group-heading p { margin: 4px 0 0; color: var(--text-secondary); font-size: var(--text-sm); }
  .exercise-type { display: block; margin-bottom: var(--space-2); color: var(--accent-pk); }
  .ex { border: 1px solid var(--border-subtle); border-left: 3px solid var(--border-strong); border-radius: var(--radius); padding: var(--space-4); background: var(--bg-tertiary); }
  .ex.ok { border-left-color: var(--accent-pd); }
  .ex.ko { border-left-color: var(--accent-pk); }
  .q { margin: 0 0 var(--space-3); color: var(--text-primary); font-weight: 600; }
  .num { display: flex; gap: var(--space-2); align-items: center; flex-wrap: wrap; }
  .num input { width: 130px; padding: var(--space-2) var(--space-3); border: 1px solid var(--border-strong); border-radius: var(--radius); background: var(--bg-primary); color: var(--text-primary); font-family: var(--font-mono); }
  .num .unit { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-secondary); }
  .check, .retry { font-family: var(--font-mono); font-size: var(--text-xs); padding: 6px 12px; border: 1px solid var(--border-strong); background: var(--bg-secondary); border-radius: var(--radius); cursor: pointer; }
  .check { background: var(--text-primary); color: var(--bg-primary); border-color: var(--text-primary); }
  .feedback { margin-top: var(--space-3); display: grid; gap: var(--space-2); }
  .badge { font-family: var(--font-mono); font-size: var(--text-xs); font-weight: 700; }
  .ex.ok .badge { color: var(--accent-pd); }
  .ex.ko .badge { color: var(--accent-pk); }
  .answer { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-secondary); }
  .explain { margin: 0; color: var(--text-secondary); font-size: var(--text-sm); line-height: 1.5; }
  .retry { justify-self: start; }
  .score { font-family: var(--font-mono); font-size: var(--text-sm); margin: 0; }
  .score strong { color: var(--accent-pd); }
</style>
