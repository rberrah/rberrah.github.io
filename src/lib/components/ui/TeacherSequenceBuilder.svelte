<script>
  // @ts-nocheck
  import { resolve } from '$app/paths';
  const base = resolve('/').replace(/\/$/, '');
  import { ArrowDown, ArrowUp, Copy, GraduationCap } from '@lucide/svelte';
  import { language } from '#lib/stores/language.js';
  import { labByChapter, labNames } from '#lib/learning/labLinks.js';

  export let group;
  let sequence = [];
  let previousGroup = '';
  let previousLanguage = '';
  let message = '';
  const text = value => value?.[$language] ?? value?.fr ?? value ?? '';
  const t = (fr, en) => $language === 'en' ? en : fr;

  function buildSequence(value) {
    const result = [];
    const usedLabs = new Set();
    for (const chapter of value.chapters) {
      const localized = chapter.translations?.[$language === 'en' ? 'en' : 'fr'] ?? chapter;
      result.push({ id: `course-${chapter.slug}`, kind: 'course', label: localized.title, href: `/chapitres/${chapter.slug}/`, included: true });
      for (const activity of value.activities.filter(item => item.chapter === chapter.slug)) {
        result.push({ id: `activity-${activity.id}`, kind: 'activity', label: text(activity.title), href: `/chapitres/${chapter.slug}/#activity-${activity.id}`, included: true });
      }
      const lab = labByChapter[chapter.slug];
      if (lab && !usedLabs.has(lab)) {
        usedLabs.add(lab);
        result.push({ id: `lab-${lab}`, kind: 'lab', label: labNames[lab]?.[$language] ?? lab, href: `/laboratoires/?lab=${lab}&teacher=1&hide=1`, included: true });
      }
    }
    for (const activity of value.syntheses) {
      result.push({ id: `synthesis-${activity.id}`, kind: 'synthesis', label: text(activity.title), href: `/exercices/?track=${value.id}&kind=synthesis`, included: true });
    }
    return result;
  }

  $: if (group?.id && (group.id !== previousGroup || $language !== previousLanguage || !sequence.length)) {
    previousGroup = group.id;
    previousLanguage = $language;
    sequence = buildSequence(group);
    message = '';
  }

  const kindLabel = kind => ({
    course: t('cours', 'course'),
    activity: t('activité', 'activity'),
    lab: t('laboratoire', 'laboratory'),
    synthesis: t('synthèse', 'synthesis')
  })[kind];

  function move(index, offset) {
    const target = index + offset;
    if (target < 0 || target >= sequence.length) return;
    const next = [...sequence];
    [next[index], next[target]] = [next[target], next[index]];
    sequence = next;
  }

  function toggle(index, included) {
    sequence[index] = { ...sequence[index], included };
    sequence = [...sequence];
  }

  async function copySequence() {
    const selected = sequence.filter(item => item.included);
    const lines = selected.map((item, index) => `${index + 1}. ${item.label}\n${location.origin}${base}${item.href}`);
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      message = t('Séquence copiée.', 'Sequence copied.');
    } catch {
      message = t('La copie automatique est indisponible dans ce navigateur.', 'Automatic copy is unavailable in this browser.');
    }
  }
</script>

<details class="teacher-builder">
  <summary><GraduationCap size={18}/><span><strong>{t('Préparer une séquence', 'Prepare a sequence')}</strong><small>{t('Sélectionner et ordonner les ressources du parcours', 'Select and order track resources')}</small></span></summary>
  <div class="builder-body">
    <p>{t('Workflow léger local : cours, activité, laboratoire puis synthèse. Aucun compte élève et aucun résultat ne sont enregistrés.', 'Lightweight local workflow: course, activity, laboratory, then synthesis. No learner account or result is stored.')}</p>
    <ol>
      {#each sequence as item, index (item.id)}
        <li class:excluded={!item.included}>
          <label><input type="checkbox" checked={item.included} on:change={event => toggle(index, event.currentTarget.checked)}/><span class="kind">{kindLabel(item.kind)}</span><span>{item.label}</span></label>
          <span class="commands">
            <a href={`${base}${item.href}`} target="_blank" rel="noopener noreferrer">{t('Ouvrir', 'Open')}</a>
            <button type="button" on:click={() => move(index, -1)} disabled={index === 0} aria-label={t('Monter', 'Move up')} title={t('Monter', 'Move up')}><ArrowUp size={16}/></button>
            <button type="button" on:click={() => move(index, 1)} disabled={index === sequence.length - 1} aria-label={t('Descendre', 'Move down')} title={t('Descendre', 'Move down')}><ArrowDown size={16}/></button>
          </span>
        </li>
      {/each}
    </ol>
    <button class="copy" type="button" on:click={copySequence}><Copy size={16}/>{t('Copier la séquence sélectionnée', 'Copy selected sequence')}</button>
    {#if message}<p class="message" role="status">{message}</p>{/if}
  </div>
</details>

<style>
  .teacher-builder { margin: 18px 0 28px; border-block: 1px solid var(--border-strong); }
  summary { display: flex; align-items: center; gap: 10px; padding: 13px 0; cursor: pointer; }
  summary span { display: grid; gap: 2px; } summary small { color: var(--text-secondary); }
  .builder-body { padding: 0 0 16px; } .builder-body > p { color: var(--text-secondary); font-size: var(--text-sm); }
  ol { display: grid; gap: 5px; padding: 0; list-style: none; counter-reset: sequence; }
  li { counter-increment: sequence; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; align-items: center; min-width: 0; padding: 7px 0; border-bottom: 1px solid var(--border-subtle); }
  li label { display: grid; grid-template-columns: auto auto minmax(0, 1fr); align-items: center; gap: 8px; min-width: 0; }
  li label::before { content: counter(sequence) '.'; width: 2ch; color: var(--text-muted); font-family: var(--font-mono); font-size: var(--text-xs); }
  li.excluded { opacity: .55; } .kind { color: var(--text-secondary); font-family: var(--font-mono); font-size: var(--text-xs); text-transform: uppercase; }
  .commands { display: flex; align-items: center; gap: 5px; } .commands a, button { display: inline-flex; align-items: center; justify-content: center; min-height: 34px; padding: 6px 8px; color: var(--text-primary); background: var(--bg-secondary); border: 1px solid var(--border-strong); border-radius: 4px; font: inherit; font-size: var(--text-xs); text-decoration: none; cursor: pointer; }
  button:disabled { opacity: .35; cursor: not-allowed; } .copy { gap: 7px; margin-top: 10px; } .message { margin: 8px 0 0; font-size: var(--text-sm); }
  @media (max-width: 620px) { li { grid-template-columns: 1fr; } .commands { padding-left: 30px; } }
</style>
