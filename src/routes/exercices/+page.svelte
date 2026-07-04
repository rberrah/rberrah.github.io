<script>
  import { exercises } from '$lib/content/exercises';
  import chapters from '$lib/content/loadChapters';
  import { tracks } from '$lib/content/tracks';
  import { language } from '$lib/stores/language';
  import { ui, localizeTrack } from '$lib/i18n/translations';
  import ExerciseBlock from '$lib/components/ui/ExerciseBlock.svelte';

  $: copy = ui($language);
  // slug de chapitre -> parcours + ordre (pour trier les exercices par parcours)
  const chapMeta = new Map(chapters.map((c) => [c.slug, { track: c.track, order: c.order }]));

  $: groups = tracks
    .map((t) => {
      const loc = localizeTrack(t, $language);
      const items = exercises
        .filter((e) => (chapMeta.get(e.chapter)?.track ?? 'core') === t.id)
        .sort((a, b) => (chapMeta.get(a.chapter)?.order ?? 999) - (chapMeta.get(b.chapter)?.order ?? 999));
      return { id: t.id, accent: t.accent, label: loc.label, title: loc.title, items };
    })
    .filter((g) => g.items.length);
</script>

<header class="head">
  <h1>{copy.pages.exercisesTitle}</h1>
  <p class="lede">{copy.pages.exercisesIntro}</p>
  <div class="score"><span class="muted">{exercises.length} exercices · {groups.length} parcours</span></div>
</header>

<div class="tracks">
  {#each groups as g}
    <section class="track" style={`--track:${g.accent}`} data-testid={`exercise-track-${g.id}`}>
      <h2><span class="badge">{g.label}</span> {g.title}</h2>
      <ExerciseBlock items={g.items} />
    </section>
  {/each}
</div>

<style>
  .head { max-width: 760px; margin-bottom: var(--space-8); }
  h1 { font-size: var(--text-3xl); margin-bottom: var(--space-2); }
  .lede { color: var(--text-secondary); font-size: var(--text-lg); }
  .score { margin-top: var(--space-4); font-family: var(--font-mono); font-size: var(--text-sm); }
  .muted { color: var(--text-muted); }
  .tracks { display: grid; gap: var(--space-10); max-width: 760px; }
  .track h2 { display: flex; align-items: center; gap: var(--space-3); font-size: var(--text-xl); margin: 0 0 var(--space-4); padding-bottom: var(--space-2); border-bottom: 2px solid var(--track); }
  .badge { font-family: var(--font-mono); font-size: var(--text-xs); background: var(--track); color: #fff; padding: 2px 8px; border-radius: 4px; }
</style>
