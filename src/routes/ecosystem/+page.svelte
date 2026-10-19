<script>
  import { asset } from '$app/paths';
  import { language } from '#lib/stores/language.js';
  /** @param {string} fr @param {string} en */
  const t=(fr,en)=>$language==='en'?en:fr;

  const tools=[
    {
      roleFr:'Apprendre',
      roleEn:'Learn',
      name:'PMx Explain',
      descriptionFr:'Comprendre la PK/PD, la PopPK, les covariables, le MIPD et les principes qui permettent d’interpréter correctement un signal biologique.',
      descriptionEn:'Understand PK/PD, PopPK, covariates, MIPD and the principles needed to interpret a biological signal correctly.',
      href:'/pharmacometrie/',
      internal:false
    },
    {
      roleFr:'Analyser',
      roleEn:'Analyze',
      name:'MultiOmics',
      descriptionFr:'Contrôler la qualité, analyser une ou plusieurs couches omiques et produire des résultats, signatures et exports traçables.',
      descriptionEn:'Quality-control and analyze one or more omics layers, producing traceable results, signatures and exports.',
      href:'https://rberrah.github.io/multiomics/',
      internal:false
    },
    {
      roleFr:'Intégrer',
      roleEn:'Integrate',
      name:'Omics2PK',
      descriptionFr:'Tester si des états moléculaires individuels apportent une information PK au-delà des données cliniques et pharmacogénétiques, avec validation hors-échantillon.',
      descriptionEn:'Test whether individual molecular states add PK information beyond clinical and pharmacogenetic data using held-out validation.',
      href:'https://rberrah.github.io/Omics2PK/',
      internal:false
    }
  ];
</script>

<svelte:head>
  <title>{t('Écosystème — PMx Explain','Ecosystem — PMx Explain')}</title>
  <meta name="description" content={t(
    'PMx Explain, MultiOmics et Omics2PK forment un écosystème de recherche cohérent : apprendre la pharmacométrie, analyser les omiques puis intégrer les signaux moléculaires à la recherche PK/PD.',
    'PMx Explain, MultiOmics and Omics2PK form a coherent research ecosystem: learn pharmacometrics, analyze omics, then integrate molecular signals into PK/PD research.'
  )} />
</svelte:head>

<section class="ecosystem-page" data-testid="ecosystem-page">
  <header class="hero">
    <p class="eyebrow">{t('ÉCOSYSTÈME DE RECHERCHE','RESEARCH ECOSYSTEM')}</p>
    <h1>{t('Apprendre. Analyser. Intégrer.','Learn. Analyze. Integrate.')}</h1>
    <p class="lede">{t(
      'PMx Explain, MultiOmics et Omics2PK sont trois outils séparés, avec des responsabilités scientifiques distinctes, reliés par une même logique de reproductibilité, de traçabilité et de niveaux de preuve explicites.',
      'PMx Explain, MultiOmics and Omics2PK are separate tools with distinct scientific responsibilities, connected by shared principles of reproducibility, provenance and explicit evidence levels.'
    )}</p>
  </header>

  <figure class="graphical-abstract">
    <img src={asset('/ecosystem-graphical-abstract.svg')} alt={t(
      'Schéma de l’écosystème : PMx Explain pour apprendre, MultiOmics pour analyser et Omics2PK pour intégrer les données moléculaires à la recherche pharmacocinétique.',
      'Ecosystem diagram: PMx Explain for learning, MultiOmics for analysis and Omics2PK for integrating molecular data into pharmacokinetic research.'
    )} />
    <figcaption>{t(
      'Parcours utilisateur et frontières scientifiques communes. Les trois dépôts restent indépendants.',
      'Shared user journey and scientific boundaries. The three repositories remain independent.'
    )}</figcaption>
  </figure>

  <section class="roles" aria-labelledby="roles-title">
    <div class="section-heading">
      <p class="eyebrow">{t('TROIS RÔLES COMPLÉMENTAIRES','THREE COMPLEMENTARY ROLES')}</p>
      <h2 id="roles-title">{t('Une même chaîne, sans mélanger les responsabilités.','One chain without mixing responsibilities.')}</h2>
    </div>
    <div class="cards">
      {#each tools as tool}
        <article class="tool-card">
          <p class="role">{t(tool.roleFr,tool.roleEn)}</p>
          <h3>{tool.name}</h3>
          <p>{t(tool.descriptionFr,tool.descriptionEn)}</p>
          <a class="btn btn-outline" href={tool.href}>
            {t('Ouvrir','Open')} {tool.name} ↗
          </a>
        </article>
      {/each}
    </div>
  </section>

  <section class="workflow">
    <div>
      <p class="eyebrow">{t('FLUX SCIENTIFIQUE','SCIENTIFIC FLOW')}</p>
      <h2>{t('Les données ne deviennent pas automatiquement une covariable PK.','Data do not automatically become a PK covariate.')}</h2>
      <p>{t(
        'MultiOmics peut produire un échange moléculaire individuel traçable. Omics2PK vérifie ensuite l’identité, la chronologie, les données cliniques/PGx et la présence de véritables doses et concentrations avant toute comparaison PK. PMx Explain fournit le cadre pédagogique pour comprendre ces choix.',
        'MultiOmics can produce a traceable individual molecular exchange. Omics2PK then checks identity, timing, clinical/PGx data and genuine dose/concentration records before any PK comparison. PMx Explain provides the learning framework needed to understand those choices.'
      )}</p>
    </div>
    <ol>
      <li><strong>PMx Explain</strong><span>{t('Comprendre les concepts et les hypothèses.','Understand concepts and assumptions.')}</span></li>
      <li><strong>MultiOmics</strong><span>{t('Analyser les données biologiques et conserver la provenance.','Analyze biological data and preserve provenance.')}</span></li>
      <li><strong>Omics2PK</strong><span>{t('Tester l’apport pour la PK sur des sujets et observations authentiques.','Test PK value using authentic subjects and observations.')}</span></li>
    </ol>
  </section>

  <section class="learning-link">
    <div>
      <p class="eyebrow">{t('COURS ASSOCIÉ','RELATED LESSONS')}</p>
      <h2>{t('Des omiques à la PK/PD','From omics to PK/PD')}</h2>
      <p>{t(
        'Le parcours interdisciplinaire détaillé reste disponible séparément pour apprendre comment transformer un signal moléculaire en hypothèse pharmacométrique testable.',
        'The detailed cross-disciplinary course remains available separately to learn how a molecular signal becomes a testable pharmacometric hypothesis.'
      )}</p>
    </div>
    <a class="btn btn-primary" href="/pharmacometrie/domaines/">{t('Ouvrir les cours','Open the lessons')} →</a>
  </section>

  <p class="boundary" role="note">{t(
    'Écosystème de recherche et d’enseignement : aucun passage entre les outils ne constitue à lui seul une validation causale, prédictive, clinique ou une recommandation de dose.',
    'Research and teaching ecosystem: moving between tools does not by itself establish causal, predictive or clinical validity or a dosing recommendation.'
  )}</p>
</section>

<style>
  .ecosystem-page{padding-block:clamp(2.5rem,6vw,5rem)}
  .hero{max-width:900px}
  .hero h1{max-width:18ch;font-size:clamp(2.6rem,6vw,5rem);line-height:.98}
  .lede{max-width:78ch;color:var(--text-secondary);font-size:var(--text-lg)}
  .graphical-abstract{margin:3rem 0 4rem;padding:1rem;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--bg-secondary)}
  .graphical-abstract img{display:block;width:100%;height:auto;border-radius:calc(var(--radius-lg) - 6px)}
  .graphical-abstract figcaption{margin-top:.75rem;color:var(--text-secondary);font-size:var(--text-sm);text-align:center}
  .section-heading{max-width:760px}
  .cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;margin-top:1.5rem}
  .tool-card{padding:1.4rem;border:1px solid var(--border-subtle);border-top:3px solid var(--accent-pk);border-radius:var(--radius-lg);background:var(--bg-tertiary)}
  .tool-card .role{font-family:var(--font-mono);font-size:var(--text-xs);font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--accent-pk)}
  .tool-card p{color:var(--text-secondary)}
  .workflow{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,.8fr);gap:2rem;margin-top:4rem;padding:clamp(1.5rem,3vw,2.4rem);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--bg-secondary)}
  .workflow p{color:var(--text-secondary)}
  .workflow ol{display:grid;gap:.75rem;margin:0;padding:0;list-style:none;counter-reset:step}
  .workflow li{counter-increment:step;padding:1rem;border:1px solid var(--border-strong);border-radius:var(--radius);background:var(--bg-primary)}
  .workflow li::before{content:counter(step,decimal-leading-zero);display:block;margin-bottom:.35rem;font-family:var(--font-mono);font-size:var(--text-xs);color:var(--accent-pk)}
  .workflow li span{display:block;margin-top:.25rem;color:var(--text-secondary);font-size:var(--text-sm)}
  .learning-link{display:flex;align-items:center;justify-content:space-between;gap:2rem;margin-top:2rem;padding:1.5rem;border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
  .learning-link p{max-width:66ch;color:var(--text-secondary)}
  .boundary{margin-top:2rem;padding:1rem 1.2rem;border-left:3px solid var(--accent-pk);background:var(--bg-secondary);color:var(--text-secondary)}
  @media(max-width:900px){.cards{grid-template-columns:1fr}.workflow{grid-template-columns:1fr}.learning-link{align-items:flex-start;flex-direction:column}}
</style>
