<script>
  import { resolve } from '$app/paths';
  import { language } from '#lib/stores/language.js';

  const base = resolve('/').replace(/\/$/, '');
  const t = (fr,en) => $language === 'en' ? en : fr;

  const multiomics = 'https://rberrah.github.io/multiomics/';
  const omics2pk = 'https://rberrah.github.io/Omics2PK/';
</script>

<svelte:head>
  <title>{t('Écosystème de recherche | PMx Explain','Research ecosystem | PMx Explain')}</title>
  <meta name="description" content={t(
    'PMx Explain, MultiOmics et Omics2PK forment un écosystème cohérent : apprendre la pharmacométrie, analyser les omiques et tester leur apport pour la PK/PD.',
    'PMx Explain, MultiOmics and Omics2PK form a coherent ecosystem: learn pharmacometrics, analyze omics and test their contribution to PK/PD research.'
  )} />
</svelte:head>

<section class="ecosystem" data-testid="ecosystem-page">
  <header class="intro">
    <p class="eyebrow">{t('ÉCOSYSTÈME DE RECHERCHE','RESEARCH ECOSYSTEM')}</p>
    <h1>{t(
      'Apprendre, analyser, puis intégrer.',
      'Learn, analyze, then integrate.'
    )}</h1>
    <p class="lede">{t(
      'PMx Explain, MultiOmics et Omics2PK sont trois projets séparés mais complémentaires. Ils partagent la même logique de reproductibilité, de provenance et de niveaux de preuve explicites.',
      'PMx Explain, MultiOmics and Omics2PK are separate but complementary projects. They share the same principles of reproducibility, provenance and explicit evidence levels.'
    )}</p>
  </header>

  <figure class="ecosystem-figure">
    <img src={`${base}/ecosystem-graphical-abstract.svg`} alt={t(
      'Écosystème de recherche : PMx Explain pour apprendre, MultiOmics pour analyser, Omics2PK pour intégrer les signaux moléculaires dans la recherche PK.',
      'Research ecosystem: PMx Explain for learning, MultiOmics for analysis, and Omics2PK for integrating molecular signals into PK research.'
    )} />
    <figcaption>{t(
      'Un parcours commun ; des dépôts, responsabilités scientifiques et frontières de validation séparés.',
      'One shared journey; separate repositories, scientific responsibilities and validation boundaries.'
    )}</figcaption>
  </figure>

  <div class="roles">
    <article class="role-card current">
      <p class="role">{t('01 · Apprendre','01 · Learn')}</p>
      <h2>PMx Explain</h2>
      <p>{t(
        'Comprendre PK/PD, PopPK, covariables, MIPD, simulations et hypothèses de modélisation avant d’interpréter un signal biologique.',
        'Understand PK/PD, PopPK, covariates, MIPD, simulations and modeling assumptions before interpreting a biological signal.'
      )}</p>
      <div class="actions">
        <a class="btn btn-primary" href={`${base}/`}>{t('Explorer PMx Explain','Explore PMx Explain')} →</a>
        <a class="btn btn-outline" href={`${base}/domaines/`}>{t('Cours Omics → PK/PD','Omics → PK/PD lessons')}</a>
      </div>
    </article>

    <article class="role-card">
      <p class="role">{t('02 · Analyser','02 · Analyze')}</p>
      <h2>MultiOmics</h2>
      <p>{t(
        'Contrôler la qualité, analyser une ou plusieurs couches omiques, rendre visibles les niveaux de preuve et exporter des résultats traçables.',
        'Perform QC, analyze one or more omics layers, expose evidence levels and export traceable results.'
      )}</p>
      <a class="btn btn-outline" href={multiomics} target="_blank" rel="noopener noreferrer">{t('Ouvrir MultiOmics','Open MultiOmics')} ↗</a>
    </article>

    <article class="role-card">
      <p class="role">{t('03 · Intégrer','03 · Integrate')}</p>
      <h2>Omics2PK</h2>
      <p>{t(
        'Tester si des états moléculaires individuels améliorent une question PK au-delà des informations cliniques et pharmacogénétiques, sur des données PK authentiques.',
        'Test whether individual molecular states improve a PK question beyond clinical and pharmacogenetic information, using genuine PK data.'
      )}</p>
      <a class="btn btn-outline" href={omics2pk} target="_blank" rel="noopener noreferrer">{t('Ouvrir Omics2PK','Open Omics2PK')} ↗</a>
    </article>
  </div>

  <section class="handoff">
    <div>
      <p class="eyebrow">{t('CHAÎNE SCIENTIFIQUE','SCIENTIFIC HANDOFF')}</p>
      <h2>{t(
        'Une sortie d’un outil ne devient pas automatiquement une preuve dans le suivant.',
        'An output from one tool does not automatically become evidence in the next.'
      )}</h2>
      <p>{t(
        'MultiOmics peut produire un échange individuel traçable. Omics2PK doit encore vérifier les mêmes sujets, les doses, les concentrations, la chronologie, les covariables de référence et la validation hors échantillon avant de conclure à un apport PK.',
        'MultiOmics can produce a traceable individual exchange. Omics2PK must still verify subject identity, doses, concentrations, timing, reference covariates and held-out validation before claiming PK benefit.'
      )}</p>
    </div>
    <div class="flow" aria-label={t('Flux de l’écosystème','Ecosystem flow')}>
      <span>PMx Explain</span><b>→</b>
      <span>MultiOmics</span><b>→</b>
      <span>Omics2PK</span>
    </div>
  </section>

  <p class="boundary" role="note">{t(
    'Écosystème de recherche : aucune brique ne certifie automatiquement causalité biologique, validité clinique, PK-readiness ou recommandation de dose.',
    'Research ecosystem: no component automatically certifies biological causality, clinical validity, PK readiness or a dosing recommendation.'
  )}</p>
</section>

<style>
  .ecosystem{max-width:1120px;margin:0 auto;padding-block:clamp(2.5rem,6vw,5rem)}
  .intro{max-width:900px}
  .eyebrow,.role{font:700 var(--text-xs)/1.5 var(--font-mono);letter-spacing:.045em;color:var(--accent-pk)}
  h1{font-size:clamp(2.2rem,5vw,3.5rem);line-height:1.08;max-width:20ch;margin:.45rem 0 1rem}
  h2{font-size:clamp(1.35rem,2.3vw,1.8rem);margin:.35rem 0 .8rem}
  .lede{font-size:1.1rem;line-height:1.75;color:var(--text-secondary);max-width:76ch}
  .ecosystem-figure{margin:2.5rem 0 3rem}
  .ecosystem-figure img{display:block;width:100%;height:auto;border:1px solid var(--border-subtle);border-radius:16px;background:#fbfaf8}
  .ecosystem-figure figcaption{margin-top:.7rem;color:var(--text-secondary);font-size:.88rem;text-align:center}
  .roles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem}
  .role-card{display:flex;flex-direction:column;align-items:flex-start;border:1px solid var(--border-strong);border-radius:12px;padding:1.4rem;background:var(--bg-secondary)}
  .role-card.current{border-color:var(--accent-pk)}
  .role-card p{line-height:1.65;color:var(--text-secondary)}
  .role-card .btn{margin-top:auto}
  .actions{display:flex;flex-wrap:wrap;gap:.65rem;margin-top:auto}
  .handoff{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(250px,.8fr);gap:2rem;align-items:center;margin-top:2.5rem;padding:1.5rem;border-top:1px solid var(--border-strong);border-bottom:1px solid var(--border-strong)}
  .handoff p{line-height:1.65;color:var(--text-secondary)}
  .flow{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:.55rem}
  .flow span{padding:.7rem .9rem;border:1px solid var(--border-strong);border-radius:8px;background:var(--bg-secondary);font-weight:700}
  .flow b{color:var(--accent-pk)}
  .boundary{margin-top:1.5rem;padding:1rem 1.2rem;border-left:3px solid var(--accent-pk);background:var(--bg-secondary);color:var(--text-secondary)}
  @media(max-width:800px){.roles,.handoff{grid-template-columns:1fr}.ecosystem{padding-inline:.2rem}}
</style>
