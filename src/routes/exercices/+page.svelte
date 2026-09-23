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
  let selectedTrack = '';
  $: if (!groups.some((group) => group.id === selectedTrack)) selectedTrack = groups[0]?.id ?? '';
  $: activeGroup = groups.find((group) => group.id === selectedTrack);
</script>

<header class="head">
  <h1>{copy.pages.exercisesTitle}</h1>
  <p class="lede">{copy.pages.exercisesIntro}</p>
  <div class="score"><span class="muted">{exercises.length} exercices · {groups.length} parcours</span></div>
</header>

<nav class="track-picker" aria-label={$language === 'en' ? 'Choose an exercise track' : "Choisir un parcours d'exercices"}>
  {#each groups as group}
    <button type="button" class:active={selectedTrack === group.id} aria-pressed={selectedTrack === group.id} style={`--track:${group.accent}`} on:click={() => (selectedTrack = group.id)}>
      <span>{group.label}</span><strong>{group.title}</strong><small>{group.items.length} {$language === 'en' ? 'exercises' : 'exercices'}</small>
    </button>
  {/each}
</nav>

{#if activeGroup}
  <section class="track" style={`--track:${activeGroup.accent}`} data-testid={`exercise-track-${activeGroup.id}`}>
    <h2><span class="badge">{activeGroup.label}</span> {activeGroup.title}</h2>
    <ExerciseBlock items={activeGroup.items} />
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
</style>
