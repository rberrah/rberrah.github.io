<script>
  import { exercises, exerciseCategories } from '$lib/content/exercises';
  import { language } from '$lib/stores/language';
  import { ui } from '$lib/i18n/translations';
  import ExerciseBlock from '$lib/components/ui/ExerciseBlock.svelte';

  $: copy = ui($language);
  $: groups = exerciseCategories
    .map((cat) => ({ cat, items: exercises.filter((e) => e.cat === cat) }))
    .filter((g) => g.items.length);
</script>

<header class="head">
  <h1>{copy.pages.exercisesTitle}</h1>
  <p class="lede">{copy.pages.exercisesIntro}</p>
  <div class="score"><span class="muted">{exercises.length} exercices · {exerciseCategories.length} thèmes</span></div>
</header>

<div class="cats">
  {#each groups as g}
    <section class="cat">
      <ExerciseBlock items={g.items} heading={g.cat} />
    </section>
  {/each}
</div>

<style>
  .head { max-width: 760px; margin-bottom: var(--space-8); }
  h1 { font-size: var(--text-3xl); margin-bottom: var(--space-2); }
  .lede { color: var(--text-secondary); font-size: var(--text-lg); }
  .score { margin-top: var(--space-4); font-family: var(--font-mono); font-size: var(--text-sm); }
  .muted { color: var(--text-muted); }
  .cats { display: grid; gap: var(--space-8); max-width: 760px; }
</style>
