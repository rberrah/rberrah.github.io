<script>
  // @ts-nocheck
  import { resolve } from '$app/paths';
  const base = resolve('/').replace(/\/$/, '');
  import { SITE_ORIGIN } from '#lib/site.js';
  import { language } from '#lib/stores/language.js';
  import { crossDomainLessons, calculateSignatureExposure } from '#lib/cross-domains/omics-pkpd-lessons.js';
  import { BookOpen, ArrowRight, FlaskConical, ShieldCheck } from '@lucide/svelte';

  let signature = 0;
  let beta = 0.25;
  let selected = {};

  $: english = $language === 'en';
  $: exposure = calculateSignatureExposure({signature,beta});
  $: completed = crossDomainLessons.filter(lesson =>
    selected[lesson.id] === lesson.quiz[$language].correct
  ).length;
  const tool = `${SITE_ORIGIN}/multiomics/tool/`;
  const presentation = `${SITE_ORIGIN}/multiomics/`;
  const t = (fr,en) => english ? en : fr;
  const number = (value, digits=1) => new Intl.NumberFormat(english?'en-US':'fr-FR',
    {minimumFractionDigits:digits,maximumFractionDigits:digits}).format(value);
</script>

<svelte:head>
  <title>{t('Cours Omics → PK/PD | PMx Explain','Omics → PK/PD lessons | PMx Explain')}</title>
  <meta name="description" content={t('Cours bilingues gratuits pour relier transcriptomique, protéomique et métabolomique aux modèles PK/PD, PopPK, PBPK et QSP.','Free bilingual lessons connecting transcriptomics, proteomics and metabolomics with PK/PD, PopPK, PBPK and QSP models.')} />
</svelte:head>

<div class="cross-domain" data-testid="cross-domain-courses">
  <header class="introduction">
    <p class="eyebrow">{t('ÉCOSYSTÈME · PARCOURS PÉDAGOGIQUE','ECOSYSTEM · LEARNING PATH')}</p>
    <h1>{t('Des omiques à la PK/PD','From omics to PK/PD')}</h1>
    <p class="lead">{t(
      'Comment transformer des mesures génétiques, transcriptomiques, protéomiques ou métabolomiques en hypothèses pharmacologiques testables ? Quatre cours progressifs relient les omiques à la pharmacocinétique, la pharmacodynamie et aux modèles mécanistiques.',
      'How can genetic, transcriptomic, proteomic and metabolomic data become testable pharmacological hypotheses? Four progressive lessons connect omics to pharmacokinetics, pharmacodynamics and mechanistic models.'
    )}</p>
    <p class="scope" role="note">{t(
      'Cours pédagogique, sans données patients ni recommandation de dose. Un biomarqueur associé à un effet n’est pas automatiquement causal ou validé cliniquement.',
      'Educational material without patient data or dose recommendations. An associated biomarker is not automatically causal or clinically validated.'
    )}</p>
  </header>

  <section class="connection" aria-labelledby="tool-title">
    <div>
      <span class="eyebrow">{t('L’OUTIL ASSOCIÉ','RELATED TOOL')}</span>
      <h2 id="tool-title">MultiOmics</h2>
      <p>{t(
        'La plateforme MultiOmics analyse une ou plusieurs couches biologiques, les contrôles qualité, les signatures et les voies associées. Les cours ci-dessous expliquent comment reprendre ces résultats dans une question PK/PD distincte.',
        'The MultiOmics platform analyzes one or more biological layers, quality checks, signatures and pathways. The lessons below show how those results can inform a separate PK/PD question.'
      )}</p>
      <div class="links">
        <a class="btn btn-primary" href={tool} data-testid="cross-domain-open-tool" target="_blank" rel="noopener noreferrer">{t('Ouvrir l’outil MultiOmics ↗','Open the MultiOmics tool ↗')}</a>
        <a class="btn btn-outline" href={presentation} target="_blank" rel="noopener noreferrer">{t('Comprendre MultiOmics ↗','About MultiOmics ↗')}</a>
      </div>
    </div>
    <div class="bridge" aria-label={t('Chaîne scientifique : données omiques, preuves, modèle PK/PD, validation','Scientific workflow: omics data, evidence, PK/PD model, validation')}>
      <div>{t('Données omiques','Omics data')}</div>
      <span aria-hidden="true">↓</span>
      <div>{t('Qualité + signature','QC + signature')}</div>
      <span aria-hidden="true">↓</span>
      <div>{t('Hypothèse PK/PD','PK/PD hypothesis')}</div>
      <span aria-hidden="true">↓</span>
      <div>{t('Validation indépendante','Independent validation')}</div>
    </div>
  </section>

  <section class="curriculum" id="cours" aria-labelledby="curriculum-title">
    <div class="heading">
      <h2 id="curriculum-title">{t('Quatre cours pour passer des omiques à la pharmacométrie','Four lessons from omics to pharmacometrics')}</h2>
      <p data-testid="cross-domain-progress" aria-live="polite">{t(`Compréhension vérifiée : ${completed} / 4 cours`,`Knowledge checks passed: ${completed} / 4 lessons`)}</p>
    </div>
    <div class="course-links" aria-label={t('Sommaire des cours','Lesson contents')}>
      {#each crossDomainLessons as lesson,i}
        <a href={`#cours-${lesson.id}`}>{String(i+1).padStart(2,'0')} · {lesson.title[$language]}</a>
      {/each}
    </div>

    {#each crossDomainLessons as lesson,i}
      <article class="lesson" id={`cours-${lesson.id}`} data-testid={`cross-domain-lesson-${lesson.id}`}>
        <div class="lesson-top">
          <span class="lesson-index">{t('COURS','LESSON')} {i+1} / 4 · {lesson.minutes} min</span>
          <BookOpen size={19} aria-hidden="true"/>
        </div>
        <h3>{lesson.title[$language]}</h3>
        <p class="tagline">{lesson.tagline[$language]}</p>
        <ol class="steps">
          {#each lesson.steps[$language] as step}
            <li>{step}</li>
          {/each}
        </ol>
        <p class="takeaway"><ShieldCheck size={18} aria-hidden="true"/> <span><strong>{t('À retenir :','Key point:')}</strong> {lesson.takeaway[$language]}</span></p>
        <div class="related">
          <span>{t('Approfondir avec PMx Explain :','Related PMx Explain chapters:')}</span>
          {#each lesson.links as link}
            <a href={`${base}/chapitres/${link.slug}/?lang=${$language}`}>{link.label[$language]} <ArrowRight size={14} aria-hidden="true"/></a>
          {/each}
        </div>
        <details class="lesson-sources">
          <summary>{t('Sources et lectures complémentaires','Sources & further reading')}</summary>
          <ul>
            {#each lesson.sources as source}
              <li><a href={source.url} target="_blank" rel="noopener noreferrer">{source.citation}</a> <span>{source.note[$language]}</span></li>
            {/each}
          </ul>
        </details>
        <div class="quiz" aria-label={t('Question de vérification','Knowledge check')}>
          <p class="quiz-head">{t('Vérifier ma compréhension','Check my understanding')}</p>
          <p class="question">{lesson.quiz[$language].q}</p>
          <div class="quiz-options" role="group" aria-label={lesson.quiz[$language].q}>
            {#each lesson.quiz[$language].a as option,j}
              <button type="button" class:chosen={selected[lesson.id]===j}
                aria-pressed={selected[lesson.id]===j}
                data-testid={`cross-domain-answer-${lesson.id}-${j}`}
                onclick={() => selected={...selected,[lesson.id]:j}}>{option}</button>
            {/each}
          </div>
          {#if selected[lesson.id]!==undefined}
            <p class="feedback" role="status" data-testid={`cross-domain-feedback-${lesson.id}`}>
              <strong>{selected[lesson.id]===lesson.quiz[$language].correct ? t('Correct.','Correct.') : t('À revoir.','Review needed.')}</strong>
              {lesson.quiz[$language].why}
            </p>
          {/if}
        </div>
      </article>
    {/each}
  </section>

  <section class="calculator" id="simulateur" aria-labelledby="calculator-title" data-testid="cross-domain-exposure-demo">
    <div class="heading">
      <span class="eyebrow">{t('MINI-LABORATOIRE','MINI LAB')}</span>
      <h2 id="calculator-title">{t('Une signature omique peut-elle modifier la prédiction de l’AUC ?','Can an omics signature change an AUC prediction?')}</h2>
    </div>
    <p>{t(
      'Fais varier une signature moléculaire standardisée S et son coefficient hypothétique β. Le modèle ci-dessous illustre une covariable sur la clairance apparente CL/F après une dose orale. Il ne provient d’aucune cohorte réelle.',
      'Adjust a standardized molecular signature S and an assumed coefficient β. The model below illustrates a covariate on apparent clearance CL/F after an oral dose. It is not fitted to a real cohort.'
    )}</p>
    <div class="parameters">
      <label for="omic-signature">{t('Score omique standardisé S','Standardized omics score S')} <output>{number(signature,1)}</output></label>
      <input id="omic-signature" type="range" min="-2" max="2" step="0.5" bind:value={signature} data-testid="cross-domain-signature"/>
      <label for="omic-beta">{t('Coefficient de covariable β','Covariate coefficient β')} <output>{number(beta,2)}</output></label>
      <input id="omic-beta" type="range" min="0" max="0.5" step="0.05" bind:value={beta} data-testid="cross-domain-beta"/>
    </div>
    <div class="results">
      <div><span>CL/F</span><strong data-testid="cross-domain-cl">{number(exposure.apparentClearanceLPerHour,1)} L/h</strong></div>
      <div><span>AUC</span><strong data-testid="cross-domain-auc">{number(exposure.aucNgHourPerMl,1)} ng·h/mL</strong></div>
      <div><span>{t('AUC / AUC de référence','AUC / reference AUC')}</span><strong data-testid="cross-domain-ratio">× {number(exposure.aucRatioToReference,2)}</strong></div>
    </div>
    <p class="equation" aria-label="CL/F égale 25 exponentielle beta fois S, AUC égale dose divisée par CL/F">CL/F = 25 × exp(β × S) L/h · AUC = Dose / (CL/F)</p>
    <p class="scope">{t(
      'Hypothèses pédagogiques : dose orale de 5 mg, pharmacocinétique linéaire, CL/F de référence de 25 L/h, AUC totale calculée. Le score est fixé indépendamment des résultats PK. L’exemple ne prédit ni dose optimale, ni biodisponibilité F séparée de CL.',
      'Educational assumptions: 5 mg oral dose, linear pharmacokinetics, reference CL/F of 25 L/h, total AUC. The score is fixed independently of PK outcomes. This example predicts neither an optimal dose nor bioavailability F separately from clearance.'
    )}</p>
  </section>

  <section class="workflow" aria-labelledby="workflow-title">
    <FlaskConical size={23} aria-hidden="true"/>
    <div>
      <h2 id="workflow-title">{t('Comment réaliser une véritable étude ?','How to conduct a real study?')}</h2>
      <p>{t(
        'Définir le biomarqueur et la fenêtre de mesure → harmoniser les identifiants patient/échantillon → mesurer la qualité → apprendre une signature dans l’entraînement → estimer un modèle PopPK/PKPD avec et sans signature → vérifier sur patients indépendants, avec incertitude et comparaison au standard clinique.',
        'Define the biomarker and its measurement window → align patient/specimen identities → assess data quality → build the signature within training data → fit PopPK/PKPD models with and without the signature → test in independent patients, including uncertainty and comparison with clinical standards.'
      )}</p>
      <p class="scope">{t(
        'Une analyse statistiquement significative ne suffit pas pour modifier une décision thérapeutique. Les biais de sélection, le shrinkage des ETA, les données longitudinales et la validité externe doivent être examinés.',
        'Statistical significance alone is insufficient to change treatment decisions. Selection bias, ETA shrinkage, longitudinal sampling and external validity require investigation.'
      )}</p>
    </div>
  </section>
</div>

<style>
  .cross-domain { max-width: 1060px; margin: 0 auto; }
  .introduction { padding: var(--space-7) 0 var(--space-8); max-width: 870px; }
  .eyebrow, .lesson-index, .quiz-head { font: 700 var(--text-xs)/1.5 var(--font-mono); letter-spacing: .045em; color: var(--accent-pk); }
  h1 { font-size: clamp(2rem,4vw,3rem); margin: 8px 0 18px; line-height: 1.15; }
  h2 { font-size: clamp(1.3rem,2.5vw,1.8rem); margin: 5px 0 13px; }
  h3 { font-size: 1.35rem; margin: 10px 0; }
  .lead { font-size: 1.12rem; line-height: 1.75; color: var(--text-secondary); }
  p { line-height: 1.65; }
  .scope { font-size: .91rem; color: var(--text-secondary); border-left: 3px solid var(--border-strong); padding: 10px 16px; background: var(--bg-secondary); }
  .connection { display: grid; grid-template-columns: minmax(0,1.45fr) minmax(230px, .7fr); align-items: center; gap: var(--space-8); border: 1px solid var(--border-strong); padding: var(--space-7); border-radius: var(--radius); background: var(--bg-secondary); }
  .connection p { max-width: 68ch; }
  .links { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
  .links a { white-space: normal; }
  .bridge { display: grid; justify-items: stretch; gap: 5px; text-align: center; }
  .bridge div { border: 1px solid var(--border-strong); border-radius: 7px; padding: 11px 8px; background: var(--bg-primary); font-size: .88rem; font-weight: 600; }
  .bridge span { color: var(--text-secondary); line-height: 1; }
  .curriculum { margin-top: var(--space-12); }
  .heading { display: flex; flex-wrap: wrap; align-items: baseline; gap: 9px 20px; justify-content: space-between; }
  .heading>p { color: var(--text-secondary); font-size: .86rem; margin: 0; }
  .course-links { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 10px; margin: 20px 0 30px; }
  .course-links a { display: block; border: 1px solid var(--border-strong); padding: 13px; border-radius: 6px; text-decoration: none; color: var(--text-primary); font-weight: 600; }
  .course-links a:hover { border-color: var(--accent-pk); }
  .lesson { scroll-margin-top: 95px; padding: var(--space-7) 0; border-top: 1px solid var(--border-strong); max-width: 870px; }
  .lesson-top { display: flex; justify-content: space-between; color: var(--text-secondary); }
  .tagline { color: var(--text-secondary); font-size: 1.04rem; margin-bottom: 20px; }
  .steps { list-style-position: outside; padding-left: 24px; }
  .steps li { padding: 0 0 15px 8px; line-height: 1.7; }
  .takeaway { display: flex; align-items: flex-start; gap: 10px; padding: 15px; background: var(--bg-secondary); border-left: 3px solid var(--accent-pk); }
  .takeaway :global(svg) { flex-shrink: 0; margin-top: 4px; }
  .related { display: flex; flex-wrap: wrap; align-items: center; gap: 9px 15px; font-size: .88rem; margin: 19px 0; }
  .related span { color: var(--text-secondary); }
  .related a { display: inline-flex; align-items: center; gap: 5px; }
  .lesson-sources { margin: 14px 0 20px; color: var(--text-secondary); }
  .lesson-sources summary { cursor: pointer; color: var(--text-primary); font-weight: 650; }
  .lesson-sources ul { padding-left: 22px; }
  .lesson-sources li { margin: 9px 0; line-height: 1.5; }
  .lesson-sources span { display: block; font-size: .86rem; }
  .quiz { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 18px; margin-top: 16px; }
  .quiz-head { margin: 0 0 8px; }
  .question { font-weight: 650; margin: 8px 0 14px; }
  .quiz-options { display: grid; gap: 8px; }
  .quiz-options button { background: var(--bg-primary); color: var(--text-primary); text-align: left; cursor: pointer; padding: 12px 14px; border: 1px solid var(--border-strong); border-radius: 6px; font: inherit; }
  .quiz-options button:hover, .quiz-options button.chosen { border-color: var(--accent-pk); }
  .quiz-options button:focus-visible, input:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 2px; }
  .feedback { color: var(--text-primary); margin-bottom: 0; }
  .feedback strong { margin-right: 8px; }
  .calculator { scroll-margin-top: 95px; margin-top: 20px; padding: var(--space-7); border: 1px solid var(--border-strong); border-radius: 8px; background: var(--bg-secondary); }
  .calculator > p { max-width: 80ch; }
  .parameters { display: grid; gap: 8px; max-width: 650px; margin: 25px 0; }
  .parameters label { display: flex; justify-content: space-between; gap: 15px; font-weight: 600; }
  .parameters output { font-variant-numeric: tabular-nums; }
  .parameters input { width: 100%; accent-color: var(--accent-pk); margin-bottom: 15px; }
  .results { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 10px; }
  .results > div { display: grid; gap: 9px; padding: 16px; background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: 6px; }
  .results span { font-size: .83rem; color: var(--text-secondary); }
  .results strong { font: 650 1.2rem/1.3 var(--font-mono); }
  .equation { font-family: var(--font-mono); font-size: .91rem; overflow-wrap: anywhere; }
  .workflow { display: flex; gap: 19px; margin: 40px 0 25px; padding: 25px 0; border-top: 1px solid var(--border-strong); }
  .workflow :global(svg) { flex-shrink: 0; margin-top: 8px; }
  @media(max-width:720px) {
    .connection { grid-template-columns: 1fr; padding: 18px; }
    .course-links { grid-template-columns: 1fr; }
    .results { grid-template-columns: 1fr; }
    .calculator { padding: 17px; }
    .results strong { font-size: 1.05rem; }
  }
</style>
