<script>
  // @ts-nocheck
  import { exercises } from '$lib/content/exercises';
  import { guidedActivities } from '$lib/content/guidedActivities';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import chapters from '$lib/content/loadChapters';
  import { learningTracks, chaptersForTrack } from '$lib/content/tracks';
  import { language } from '$lib/stores/language';
  import { ui, localizeTrack } from '$lib/i18n/translations';
  import ExerciseBlock from '$lib/components/ui/ExerciseBlock.svelte';
  import LearningProgress from '$lib/components/ui/LearningProgress.svelte';
  import Quiz from '$lib/components/ui/Quiz.svelte';

  $: copy = ui($language);
  // slug de chapitre -> parcours + ordre (pour trier les exercices par parcours)
  const chapMeta = new Map(chapters.map((c) => [c.slug, { track: c.track, order: c.order }]));

  $: groups = learningTracks
    .map((t) => {
      const loc = localizeTrack(t, $language);
      const trackChapters = chaptersForTrack(t, chapters);
      const chapterSlugs = new Set(trackChapters.map(chapter => chapter.slug));
      const items = exercises
        .filter((e) => chapterSlugs.has(e.chapter))
        .sort((a, b) => (chapMeta.get(a.chapter)?.order ?? 999) - (chapMeta.get(b.chapter)?.order ?? 999));
      const activities = guidedActivities.filter(e => !e.kind && chapterSlugs.has(e.chapter)).sort((a, b) => (chapMeta.get(a.chapter)?.order ?? 999) - (chapMeta.get(b.chapter)?.order ?? 999));
      const syntheses = guidedActivities.filter(e => e.kind === 'synthesis' && e.track === t.id);
      const quizzes = trackChapters
        .map((chapter) => {
          const localized = chapter.translations?.[$language === 'en' ? 'en' : 'fr'] ?? chapter;
          return { slug: chapter.slug, title: localized.title, questions: localized.quiz ?? [] };
        })
        .filter((chapter) => chapter.questions.length);
      return { id: t.id, accent: t.accent, label: loc.label, title: loc.title, items, activities, syntheses, quizzes, quizCount: quizzes.reduce((sum, chapter) => sum + chapter.questions.length, 0) };
    })
    .filter((g) => g.items.length || g.activities.length || g.syntheses.length || g.quizCount);
  let selectedTrack = '';
  let selectedKind = 'guided';
  let mounted = false;
  onMount(() => { mounted = true; });
  /** @type {string | null | undefined} */
  let lastQuery;
  $: if (mounted && lastQuery !== $page.url.searchParams.get('track')) { lastQuery = $page.url.searchParams.get('track'); if (lastQuery) selectedTrack = lastQuery; }
  $: if (!groups.some((group) => group.id === selectedTrack)) selectedTrack = groups[0]?.id ?? '';
  $: activeGroup = groups.find((group) => group.id === selectedTrack);
  $: if (activeGroup && selectedKind === 'calculations' && !activeGroup.items.length) selectedKind = 'guided';
  $: if (activeGroup && selectedKind === 'synthesis' && !activeGroup.syntheses.length) selectedKind = 'guided';
  $: quizCount = groups.reduce((sum, group) => sum + group.quizCount, 0);
  $: kinds = activeGroup ? [
    { id: 'guided', label: $language === 'en' ? 'Guided activities' : 'Activités guidées', count: activeGroup.activities.length, description: $language === 'en' ? 'Multi-step cases: calculate, interpret, manipulate parameters and justify decisions.' : 'Cas en plusieurs étapes : calculer, interpréter, manipuler des paramètres et justifier des décisions.' },
    { id: 'synthesis', label: $language === 'en' ? 'Synthesis cases' : 'Cas de synthèse', count: activeGroup.syntheses.length, description: $language === 'en' ? 'Cumulative problems requiring prediction, calculation, interpretation and a justified decision.' : 'Problèmes cumulatifs demandant de prédire, calculer, interpréter puis justifier une décision.' },
    { id: 'calculations', label: $language === 'en' ? 'Calculations' : 'Calculs', count: activeGroup.items.length, description: $language === 'en' ? 'Short numerical problems with units and immediate worked solutions.' : 'Problèmes numériques courts avec unités et correction immédiate.' },
    { id: 'quiz', label: 'QCM', count: activeGroup.quizCount, description: $language === 'en' ? 'Course knowledge checks, drawn from the single canonical quiz for each chapter.' : 'Questions de rappel issues du quiz canonique de chaque cours.' }
  ] : [];
</script>

<header class="head">
  <h1>{copy.pages.exercisesTitle}</h1>
  <p class="lede">{copy.pages.exercisesIntro}</p>
  <div class="score"><span class="muted">{guidedActivities.filter(activity => !activity.kind).length} {$language === 'en' ? 'guided activities' : 'activités guidées'} · {guidedActivities.filter(activity => activity.kind === 'synthesis').length} {$language === 'en' ? 'synthesis cases' : 'cas de synthèse'} · {exercises.length} {$language === 'en' ? 'calculations' : 'calculs'} · {quizCount} QCM</span></div>
</header>

<nav class="track-picker" aria-label={$language === 'en' ? 'Choose an exercise track' : "Choisir un parcours d'exercices"}>
  {#each groups as group}
    <button type="button" class:active={selectedTrack === group.id} aria-pressed={selectedTrack === group.id} style={`--track:${group.accent}`} on:click={() => (selectedTrack = group.id)}>
      <span>{group.label}</span><strong>{group.title}</strong><small>{group.activities.length} {$language === 'en' ? 'guided' : 'guidées'} · {group.syntheses.length} {$language === 'en' ? 'synthesis' : 'synthèse'} · {group.items.length} {$language === 'en' ? 'calculations' : 'calculs'} · {group.quizCount} QCM</small>
    </button>
  {/each}
</nav>

{#if activeGroup}
  <section class="track" style={`--track:${activeGroup.accent}`} data-testid={`exercise-track-${activeGroup.id}`}>
    <h2><span class="badge">{activeGroup.label}</span> {activeGroup.title}</h2>
    <p><a href={`${base}/parcours/${activeGroup.id}/?lang=${$language}`}>{$language === 'en' ? 'Open the track' : 'Ouvrir le parcours'}</a></p>
    <nav class="kind-picker" aria-label={$language === 'en' ? 'Choose a training type' : "Choisir un type d'entraînement"}>
      {#each kinds as kind}
        <button type="button" class:active={selectedKind === kind.id} aria-pressed={selectedKind === kind.id} disabled={!kind.count} on:click={() => (selectedKind = kind.id)} data-testid={`training-kind-${kind.id}`}>
          <strong>{kind.label}</strong><span>{kind.count}</span>
        </button>
      {/each}
    </nav>
    <p class="kind-description">{kinds.find((kind) => kind.id === selectedKind)?.description}</p>
    {#if selectedKind === 'guided'}
      {#if activeGroup.activities.length}<LearningProgress/>{/if}
      <ExerciseBlock activities={activeGroup.activities} showGroupHeading={false}/>
    {:else if selectedKind === 'synthesis'}
      {#if activeGroup.syntheses.length}<LearningProgress/>{/if}
      <ExerciseBlock activities={activeGroup.syntheses} showGroupHeading={false}/>
    {:else if selectedKind === 'calculations'}
      <ExerciseBlock items={activeGroup.items} showGroupHeading={false}/>
    {:else}
      <div class="quiz-list" data-testid="course-quiz-list">
        {#each activeGroup.quizzes as quiz}
          <details class="quiz-card">
            <summary><span>QCM · {quiz.questions.length} {$language === 'en' ? 'questions' : 'questions'}</span><strong>{quiz.title}</strong></summary>
            <div class="quiz-body">
              <Quiz title={$language === 'en' ? 'Course knowledge check' : 'Vérification du cours'} questions={quiz.questions}/>
              <a href={`${base}/chapitres/${quiz.slug}/?lang=${$language}`}>{$language === 'en' ? 'Review the lesson' : 'Revoir le cours'}</a>
            </div>
          </details>
        {/each}
      </div>
    {/if}
  </section>
{/if}

<style>
  .head { max-width: 760px; margin-bottom: var(--space-8); }
  h1 { font-size: var(--text-3xl); margin-bottom: var(--space-2); }
  .lede { color: var(--text-secondary); font-size: var(--text-lg); }
  .score { margin-top: var(--space-4); font-family: var(--font-mono); font-size: var(--text-sm); }
  .muted { color: var(--text-muted); }
  .track-picker { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; margin: 0 0 var(--space-8); }
  .track-picker button { display: grid; gap: 3px; min-width: 0; padding: 12px; text-align: left; color: var(--text-secondary); background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-left: 4px solid var(--track); border-radius: 6px; cursor: pointer; }
  .track-picker button.active { color: var(--text-primary); border-color: var(--track); background: var(--bg-tertiary); }
  .track-picker span, .track-picker small { font-family: var(--font-mono); font-size: var(--text-xs); }
  .track-picker strong { font-size: var(--text-sm); }
  .track { max-width: 760px; }
  .track h2 { display: flex; align-items: center; gap: var(--space-3); font-size: var(--text-xl); margin: 0 0 var(--space-4); padding-bottom: var(--space-2); border-bottom: 2px solid var(--track); }
  .badge { font-family: var(--font-mono); font-size: var(--text-xs); background: var(--track); color: #fff; padding: 2px 8px; border-radius: 4px; }
  .kind-picker { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin: var(--space-6) 0 var(--space-3); }
  .kind-picker button { display: flex; justify-content: space-between; gap: 8px; min-width: 0; padding: 10px 12px; color: var(--text-secondary); background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 4px; cursor: pointer; }
  .kind-picker button.active { color: var(--text-primary); border-color: var(--track); box-shadow: inset 0 -3px 0 var(--track); }
  .kind-picker button:disabled { opacity: .45; cursor: not-allowed; }
  .kind-picker strong { overflow-wrap: anywhere; }
  .kind-picker span { font-family: var(--font-mono); }
  .kind-description { min-height: 3em; color: var(--text-secondary); font-size: var(--text-sm); }
  .quiz-list { display: grid; gap: var(--space-3); }
  .quiz-card { border: 1px solid var(--border-strong); border-radius: 6px; background: var(--bg-primary); }
  .quiz-card > summary { display: grid; gap: 4px; padding: 14px 16px; cursor: pointer; }
  .quiz-card > summary span { color: var(--text-secondary); font-family: var(--font-mono); font-size: var(--text-xs); }
  .quiz-body { display: grid; gap: var(--space-3); padding: 0 16px 16px; }
  .quiz-body > a { justify-self: start; }
  @media (max-width: 560px) { .kind-picker { grid-template-columns: 1fr; } .kind-description { min-height: 0; } }
</style>
