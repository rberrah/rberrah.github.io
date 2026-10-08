<script>
  // @ts-nocheck
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { goto, afterNavigate } from '$app/navigation';
  import { ArrowRight, BookOpen, FlaskConical, ListChecks } from '@lucide/svelte';
  import chapters from '$lib/content/loadChapters';
  import { exercisesForChapter } from '$lib/content/exercises';
  import { activitiesForChapter } from '$lib/content/guidedActivities';
  import { covariateObjectives } from '$lib/content/covariateActivities';
  import { language } from '$lib/stores/language';
  import { learning, loadLearning } from '$lib/stores/learning';
  import { localizeChapter, localizeTrack } from '$lib/i18n/translations';
  import { chaptersForTrack } from '$lib/content/tracks';
  import { countPage } from '$lib/analytics';
  import ExerciseBlock from '$lib/components/ui/ExerciseBlock.svelte';
  import LearningProgress from '$lib/components/ui/LearningProgress.svelte';
  import Quiz from '$lib/components/ui/Quiz.svelte';
  export let data;
  let mounted = false;
  onMount(() => { mounted = true; });
  const t = (fr, en) => $language === 'en' ? en : fr;
  const localized = value => localizeChapter(value, $language).chapter;
  $: track = data.track;
  $: title = localizeTrack(track, $language);
  $: list = chaptersForTrack(track, chapters);
  $: beginner = track.id === 'start';
  $: pilot = track.id === 'covariates';
  $: trackActivities = list.flatMap(chapter => activitiesForChapter(chapter.slug, track.id));
  $: finalCase = beginner ? trackActivities.find(activity => activity.id === 'synthesis-start') : null;
  $: chapterQuery = mounted ? $page.url.searchParams.get('chapter') : null;
  $: selected = list.find(chapter => chapter.slug === chapterQuery) ?? list[0];
  $: activities = selected ? activitiesForChapter(selected.slug, track.id) : [];
  $: exercises = selected ? exercisesForChapter(selected.slug) : [];
  $: practiceCount = list.reduce((sum, chapter) => sum + activitiesForChapter(chapter.slug, track.id).length + exercisesForChapter(chapter.slug).length, 0);
  $: seenCount = list.filter(chapter => $learning.chapters[chapter.slug] === 'seen').length;
  $: passedCount = trackActivities.filter(activity => $learning.activities[activity.id] === 'passed').length;
  $: externalPrereqs = [...new Set(list.flatMap(chapter => chapter.prerequisites ?? []))].filter(slug => !list.some(chapter => chapter.slug === slug)).map(slug => chapters.find(chapter => chapter.slug === slug)).filter(Boolean);
  $: firstUnread = list.find(chapter => !$learning.chapters[chapter.slug]) ?? list[0];
  $: remainingActivity = trackActivities.find(activity => !['passed', 'reviewed'].includes($learning.activities[activity.id]));
  $: resume = seenCount === list.length && remainingActivity ? `${base}/parcours/${track.id}/?lang=${$language}&chapter=${remainingActivity.chapter}#activity-${remainingActivity.id}` : `${base}/chapitres/${firstUnread?.slug}/?lang=${$language}`;
  const statusText = id => ({ attempted: t('Tenté', 'Attempted'), reviewed: t('Corrigé consulté', 'Solution reviewed'), passed: t('Réussi (étapes objectives)', 'Passed (objective steps)') }[$learning.activities[id]] ?? t('À commencer', 'Not started'));
  afterNavigate(() => { loadLearning(); if ($page.route.id === '/parcours/[id]' && $page.status === 200) countPage(`/pharmacometrie/parcours/${data.track.id}/`); });
  function choose(slug) { goto(`${base}/parcours/${track.id}/?lang=${$language}&chapter=${slug}#practice`, { keepFocus: true }); }
  let baselineResult = null;
  let finalResult = null;
  const diagnosticBefore = {
    fr: [
      { prompt: "Si la clairance double à dose identique, que devient en général l'AUC sous PK linéaire ?", options: ['Elle double', 'Elle est divisée par deux', 'Elle ne change pas'], correct: 1 },
      { prompt: 'Une demi-vie longue signifie-t-elle toujours une faible clairance ?', options: ['Oui', 'Non, le volume intervient aussi'], correct: 1 },
      { prompt: "Une absorption plus lente modifie-t-elle nécessairement l'AUC si la biodisponibilité et la clairance restent identiques ?", options: ['Oui, toujours', "Non, elle modifie surtout la forme et le temps du pic"], correct: 1 },
      { prompt: 'Un écart entre une concentration observée et prédite prouve-t-il une variabilité interindividuelle ?', options: ['Oui', "Non, l'erreur résiduelle est aussi possible"], correct: 1 },
      { prompt: 'Deux patients ayant la même concentration ont-ils nécessairement le même effet ?', options: ['Oui', 'Non'], correct: 1 },
      { prompt: "Une estimation MAP utilise-t-elle uniquement la mesure du patient ?", options: ['Oui', "Non, elle la combine à l'information de population"], correct: 1 }
    ],
    en: [
      { prompt: 'If clearance doubles at the same dose, what generally happens to AUC under linear PK?', options: ['It doubles', 'It is halved', 'It is unchanged'], correct: 1 },
      { prompt: 'Does a long half-life always imply low clearance?', options: ['Yes', 'No, volume also matters'], correct: 1 },
      { prompt: 'Does slower absorption necessarily change AUC when bioavailability and clearance are unchanged?', options: ['Yes, always', 'No, it mainly changes curve shape and peak timing'], correct: 1 },
      { prompt: 'Does a difference between observed and predicted concentration prove between-patient variability?', options: ['Yes', 'No, residual error is also possible'], correct: 1 },
      { prompt: 'Do two patients with the same concentration necessarily have the same effect?', options: ['Yes', 'No'], correct: 1 },
      { prompt: 'Does a MAP estimate use only the patient measurement?', options: ['Yes', 'No, it combines it with population information'], correct: 1 }
    ]
  };
  const diagnosticAfter = {
    fr: [
      { prompt: "À dose identique, la clairance passe de 4 à 8 L/h. Quel patient aura l'AUC la plus élevée ?", options: ['Celui à 4 L/h', 'Celui à 8 L/h', 'Les deux'], correct: 0 },
      { prompt: 'Deux patients ont la même clairance mais des volumes différents. Leur demi-vie est-elle nécessairement identique ?', options: ['Oui', 'Non'], correct: 1 },
      { prompt: 'Ka diminue, tandis que F et CL ne changent pas. Quel résultat est le plus attendu ?', options: ['Un pic plus tardif', 'Une AUC nécessairement doublée'], correct: 0 },
      { prompt: 'Une concentration isolée est au-dessus de la prédiction. Quelle conclusion est défendable ?', options: ["Elle peut refléter variabilité, erreur de mesure ou horaire", 'Elle démontre une clairance individuelle plus faible'], correct: 0 },
      { prompt: 'Un même profil de concentration peut-il produire des réponses différentes selon le modèle PD ou le patient ?', options: ['Oui', 'Non'], correct: 0 },
      { prompt: 'Avec peu de données individuelles, vers quoi une estimation MAP est-elle davantage ramenée ?', options: ['Le modèle de population', 'La dernière mesure uniquement'], correct: 0 }
    ],
    en: [
      { prompt: 'At the same dose, clearance changes from 4 to 8 L/h. Which patient has the higher AUC?', options: ['The one at 4 L/h', 'The one at 8 L/h', 'Both'], correct: 0 },
      { prompt: 'Two patients have the same clearance but different volumes. Is their half-life necessarily identical?', options: ['Yes', 'No'], correct: 1 },
      { prompt: 'Ka decreases while F and CL remain unchanged. Which result is most expected?', options: ['A later peak', 'A necessarily doubled AUC'], correct: 0 },
      { prompt: 'One concentration is above its prediction. Which conclusion is defensible?', options: ['It may reflect variability, measurement error or timing', 'It proves lower individual clearance'], correct: 0 },
      { prompt: 'Can the same concentration profile produce different responses depending on the PD model or patient?', options: ['Yes', 'No'], correct: 0 },
      { prompt: 'With sparse individual data, what pulls a MAP estimate more strongly?', options: ['The population model', 'Only the latest measurement'], correct: 0 }
    ]
  };
</script>

<svelte:head><title>{title.title} | PMx Explain</title><meta name="description" content={title.tagline}/></svelte:head>

<header class="track-head">
  <a href={`${base}/chapitres/?lang=${$language}`}>{t('Tous les parcours', 'All tracks')}</a>
  <p class="eyebrow">{title.label}</p><h1>{title.title}</h1><p class="lede">{title.tagline}</p>
  <div class="counts"><span>{seenCount} / {list.length} {t('chapitres consultés', 'chapters viewed')}</span><span>{practiceCount} {t('activités', 'activities')}</span><span>{passedCount} / {trackActivities.length} {t('activités guidées réussies : étapes objectives', 'guided activities passed: objective steps')}</span></div>
  <a class="command" href={resume} data-testid="resume-track"><ArrowRight size={17}/>{seenCount ? t('Reprendre', 'Resume') : t('Commencer', 'Start')}</a>
  {#if pilot}<a class="command" href={`${base}/covariates/?lang=${$language}`}><FlaskConical size={17}/>{t('Atelier Covariables', 'Covariates workshop')}</a>{/if}
</header>

{#if beginner}
  <section class="diagnostic" data-testid="starter-diagnostic">
    <p class="eyebrow">{t('Avant de commencer', 'Before you start')}</p>
    <h2>{t('Six prédictions, sans note', 'Six predictions, no grade')}</h2>
    <p>{t("Répondez avec votre intuition. Le diagnostic final testera les mêmes concepts avec d'autres situations.", 'Answer from intuition. The final diagnostic tests the same concepts with different situations.')}</p>
    <Quiz title={t('Point de départ', 'Starting point')} questions={diagnosticBefore[$language]} onComplete={result => baselineResult = result}/>
  </section>
{/if}

{#if pilot}<section class="goals"><h2>{t('Objectifs du parcours', 'Track objectives')}</h2><ul>{#each covariateObjectives as objective}<li>{objective[$language]}</li>{/each}</ul><p>{t('Parcours intermédiaire. Les durées sont indicatives ; les activités peuvent être reprises sans limite.', 'Intermediate track. Times are approximate; activities can be repeated without limit.')}</p></section>{/if}
{#if externalPrereqs.length}<section class="prerequisites"><h2>{t('Prérequis', 'Prerequisites')}</h2>{#each externalPrereqs as chapter}<a href={`${base}/chapitres/${chapter.slug}/?lang=${$language}`}>{localized(chapter).title}</a>{/each}</section>{/if}
<LearningProgress/>

<section class="curriculum" aria-labelledby="curriculum-title">
  <h2 id="curriculum-title">{beginner ? t('Votre chemin en douze étapes', 'Your twelve-step path') : t('Cours et activités', 'Lessons and activities')}</h2>
  <ol>
    {#each list as chapter, i}
      {@const cases = activitiesForChapter(chapter.slug, track.id)}
      <li>
        <div class="lesson-line"><span class="number">{String(i + 1).padStart(2, '0')}</span><div><h3><a href={`${base}/chapitres/${chapter.slug}/?lang=${$language}`}>{localized(chapter).title}</a></h3><p>{localized(chapter).description}</p><span class="meta">{chapter.duration} · {$learning.chapters[chapter.slug] ? t('Consulté', 'Viewed') : t('À consulter', 'Not viewed')}</span></div></div>
        <div class="lesson-actions"><a href={`${base}/chapitres/${chapter.slug}/?lang=${$language}`}><BookOpen size={16}/>{t('Cours', 'Lesson')}</a><a href={`${base}/parcours/${track.id}/?lang=${$language}&chapter=${chapter.slug}#practice`}><ListChecks size={16}/>{t('Exercices', 'Exercises')}</a></div>
        {#if cases.length}<ul class="activity-list">{#each cases as activity}<li><a href={`${base}/parcours/${track.id}/?lang=${$language}&chapter=${chapter.slug}#activity-${activity.id}`}>{activity.title[$language]}</a><span>{activity.minutes} min · {statusText(activity.id)}</span></li>{/each}</ul>{/if}
      </li>
    {/each}
  </ol>
</section>

{#if finalCase}
  <section class="final-case" data-testid="starter-final-case">
    <p class="eyebrow">{t('Évaluation finale', 'Final assessment')}</p>
    <h2>{t('Les mêmes concepts, dans de nouvelles situations', 'The same concepts in new situations')}</h2>
    <Quiz title={t('Point d’arrivée', 'End point')} questions={diagnosticAfter[$language]} onComplete={result => finalResult = result}/>
    {#if baselineResult && finalResult}
      <p class="comparison" role="status" aria-live="polite">{t(`Au départ : ${baselineResult.score}/6 concepts correctement anticipés. Après le parcours : ${finalResult.score}/6.`, `At the start: ${baselineResult.score}/6 concepts anticipated correctly. After the track: ${finalResult.score}/6.`)}</p>
    {/if}
    <p class="eyebrow synthesis-label">{t('Cas intégratif', 'Integrative case')}</p>
    <h2>{finalCase.title[$language]}</h2>
    <p>{finalCase.objective[$language]}</p>
    <a class="command" href={`${base}/parcours/${track.id}/?lang=${$language}&chapter=${finalCase.chapter}#activity-${finalCase.id}`}><ListChecks size={17}/>{t('Résoudre le cas de synthèse', 'Solve the synthesis case')}</a>
  </section>
{/if}

<section id="practice" class="practice">
  <h2>{t('Mise en pratique', 'Practice')}</h2>
  <label>{t('Chapitre', 'Chapter')}<select value={selected?.slug} on:change={e => choose(e.currentTarget.value)} data-testid="practice-chapter">{#each list as chapter}<option value={chapter.slug}>{localized(chapter).title}</option>{/each}</select></label>
  {#each list as chapter (chapter.slug)}
    <div hidden={selected?.slug !== chapter.slug}><ExerciseBlock items={exercisesForChapter(chapter.slug)} activities={activitiesForChapter(chapter.slug, track.id)}/></div>
  {/each}
  {#if !activities.length && !exercises.length}<p>{t('Les questions de vérification se trouvent dans le chapitre.', 'Review questions are available in the chapter.')}</p><a href={`${base}/chapitres/${selected?.slug}/?lang=${$language}`}>{t('Ouvrir le chapitre', 'Open the chapter')}</a>{/if}
</section>

{#if pilot}<section class="links"><h2>{t('Concepts associés', 'Related concepts')}</h2>{#each ['ETA', 'OMEGA', 'Covariable', 'Shrinkage'] as term}<a href={`${base}/glossaire/?lang=${$language}&q=${encodeURIComponent(term)}`}>{term}</a>{/each}</section>{/if}

<style>
  .track-head, section, :global(.learning-options) { max-width: 920px; } h1 { font-size: 2rem; margin: 8px 0 12px; } .lede { font-size: 1.05rem; color: var(--text-secondary); line-height: 1.65; } h2 { font-size: 1.25rem; margin-top: 0; } h3 { font-size: 1rem; margin: 0 0 6px; }
  .eyebrow, .meta, .counts { font-size: .8rem; color: var(--text-secondary); } .counts { display: flex; flex-wrap: wrap; gap: 8px 24px; margin: 16px 0; }
  .command { display: inline-flex; gap: 8px; align-items: center; padding: 9px 12px; margin: 4px 8px 4px 0; border: 1px solid var(--border-strong); border-radius: 4px; color: var(--text-primary); text-decoration: none; }
  section { margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--border-subtle); } .goals li { margin-bottom: 8px; line-height: 1.5; } .goals p { color: var(--text-secondary); font-size: .85rem; }
  .prerequisites a, .links a { display: inline-block; margin: 0 16px 8px 0; }
  .curriculum > ol { list-style: none; padding: 0; } .curriculum > ol > li { padding: 18px 0; border-bottom: 1px solid var(--border-subtle); }
  .lesson-line { display: grid; grid-template-columns: 32px minmax(0, 1fr); gap: 12px; } .number { color: #a14b64; font-family: var(--font-mono); } .lesson-line p { color: var(--text-secondary); font-size: .86rem; line-height: 1.5; margin: 0 0 8px; } .lesson-line a { color: var(--text-primary); text-decoration: none; }
  .lesson-actions { display: flex; flex-wrap: wrap; gap: 20px; margin: 12px 0 0 44px; } .lesson-actions a { display: flex; gap: 6px; align-items: center; font-size: .85rem; }
  .activity-list { margin: 12px 0 0 44px; padding: 0; list-style: none; } .activity-list li { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px 16px; padding: 6px 0; font-size: .82rem; } .activity-list span { color: var(--text-secondary); }
  .practice { scroll-margin-top: 100px; } label { display: grid; gap: 8px; margin-bottom: 20px; font-size: .85rem; } select { width: 100%; max-width: 100%; min-width: 0; box-sizing: border-box; padding: 10px; font: inherit; color: var(--text-primary); background: var(--bg-primary); border: 1px solid var(--border-strong); border-radius: 4px; }
  .comparison { padding: 12px 14px; border-left: 4px solid var(--accent-pk); background: var(--bg-secondary); font-weight: 600; }
  .synthesis-label { margin-top: 28px; }
  @media (max-width: 520px) { h1 { font-size: 1.65rem; } .activity-list { margin-left: 0; } select { font-size: .78rem; } }
</style>
