<script>
  import { resolve } from '$app/paths';
  import { language } from '#lib/stores/language.js';
  import ecosystemLinks from '#lib/content/ecosystem.json';

  const base = resolve('/').replace(/\/$/, '');
  /** @param {string} fr @param {string} en */
  $: t = $language === 'en' ? (/** @type {string} */ fr, /** @type {string} */ en) => en : (/** @type {string} */ fr, /** @type {string} */ en) => fr;

  const multiomics = 'https://rberrah.github.io/multiomics/';
  const omics2pk = 'https://rberrah.github.io/Omics2PK/';

  // Public-site editorial registry. Only public presentations link to results.
  // Research-in-progress entries contain no unpublished metrics or private repository URLs.
  const thesisProjects = [
    {
      id: 'netpk',
      name: 'NetPK',
      statusFr: 'Poster présenté · PEPR 2026',
      statusEn: 'Conference poster · PEPR 2026',
      summaryFr: 'Intégrer des connaissances pharmacologiques publiées à une modélisation PK mécaniste et évaluer ses limites.',
      summaryEn: 'Integrate published pharmacological knowledge into mechanistic PK modelling and evaluate its limitations.',
      source: 'https://rberrah.github.io/communications/netpk-peprsn-2026/',
      sourceFr: 'Poster et provenance',
      sourceEn: 'Poster and provenance'
    },
    {
      id: 'pillar-a',
      name: 'Ontologie et graphe de connaissances', nameEn: 'Ontology & knowledge graph',
      statusFr: 'À venir',
      statusEn: 'Coming soon'
    },
    {
      id: 'pillar-b',
      name: 'Pilier B', nameEn: 'Pillar B',
      statusFr: 'Poster présenté · PAGE 2026',
      statusEn: 'Conference poster · PAGE 2026',
      summaryFr: 'Explorer une assistance auditable à la construction de modèles PK de population, sous supervision pharmacométrique.',
      summaryEn: 'Investigate auditable assistance for population PK model development under pharmacometric supervision.',
      source: 'https://rberrah.github.io/communications/autonomous-pharmacometrics-page-2026/',
      sourceFr: 'Poster et provenance',
      sourceEn: 'Poster and provenance'
    },
    {
      id: 'pillar-c',
      name: 'Vérification', nameEn: 'Verification',
      statusFr: 'À venir',
      statusEn: 'Coming soon'
    },
    {
      id: 'pillar-d',
      name: 'Individualisation', nameEn: 'Individualisation',
      statusFr: 'À venir',
      statusEn: 'Coming soon'
    },
    {
      id: 'phenopass',
      name: 'PhenoPass',
      statusFr: 'Recherche en cours · résultats non publiés',
      statusEn: 'Research in progress · unpublished results',
      summaryFr: 'Travail sur la caractérisation phénotypique dynamique en pharmacocinétique. Aucune validation externe revendiquée ici.',
      summaryEn: 'Research on dynamic phenotypic characterisation in pharmacokinetics. No external validation is claimed here.'
    }
  ];
</script>
<svelte:head>
  <title>{t('Écosystème de recherche | PMx Explain','Research ecosystem | PMx Explain')}</title>
  <meta name="description" content={t('Carte des outils pédagogiques, plateformes analytiques et travaux de recherche en pharmacométrie et pharmacologie quantitative.','Explore the educational tools, analytical platforms and research programme in pharmacometrics and quantitative pharmacology.')} />
</svelte:head>

<section class="ecosystem" data-testid="ecosystem-page">
  <header class="intro">
    <div>
      <p class="eyebrow">{t('PHARMACOLOGIE QUANTITATIVE · ÉCOSYSTÈME','QUANTITATIVE PHARMACOLOGY · ECOSYSTEM')}</p>
      <h1>{t('Des disciplines complémentaires, des preuves distinctes.','Complementary disciplines, distinct evidence.')}</h1>
      <p class="lede">{t('Un écosystème qui relie la pharmacologie mécaniste, les données biologiques et la modélisation quantitative. Découvrez les outils disponibles, leurs relations et le programme de recherche qui les accompagne.','An ecosystem connecting mechanistic pharmacology, biological data and quantitative modelling. Explore the available tools, how they relate, and the research programme behind them.')}</p>
      <nav class="jump" aria-label={t('Sections de l’écosystème','Ecosystem sections')}>
        <a href="#platforms">{t('Plateformes','Platforms')} ↓</a>
        <a href="#research-flow">{t('Chaîne analytique','Research workflow')} ↓</a>
        <a href="#thesis-title">{t('Programme de thèse','Thesis programme')} ↓</a>
      </nav>
    </div>
    <aside class="principles">
      <span class="eyebrow">{t('PRINCIPES COMMUNS','SHARED PRINCIPLES')}</span>
      <strong>{t('Des hypothèses aux preuves','From hypotheses to evidence')}</strong>
      <ul><li>{t('Reproductibilité et provenance','Reproducibility and provenance')}</li><li>{t('Hypothèses et limites explicites','Explicit assumptions and limitations')}</li><li>{t('Évaluation indépendante','Independent evaluation')}</li></ul>
    </aside>
  </header>

  <section id="platforms" class="platforms" aria-labelledby="platforms-title">
    <div class="section-intro"><p class="eyebrow">{t('01 · LES PLATEFORMES','01 · THE PLATFORMS')}</p><h2 id="platforms-title">{t('Choisir sa plateforme','Choose a platform')}</h2></div>
    <nav class="shared-links" data-testid="ecosystem-links" aria-label={t('Plateformes publiques','Public platforms')}>
      {#each ecosystemLinks as item}<a href={item.url+(item.localized?'?lang='+$language:'')} data-sveltekit-reload>{t(item.fr,item.en)}</a>{/each}
    </nav>
    <p>{t('Ci-dessous, un exemple de collaboration entre pharmacométrie et omiques ; ce n’est pas un parcours obligatoire.','Below is one example of collaboration between pharmacometrics and omics; it is not a mandatory journey.')}</p>
    <div class="map" data-testid="ecosystem-platform-map">
      <article class="learning">
        <div class="node-heading"><span class="node-symbol" aria-hidden="true">PK</span><div><p class="role">{t('APPRENDRE ET MODÉLISER','LEARN AND MODEL')}</p><h3>PMx Explain</h3></div></div>
        <p>{t('Comprendre, construire et évaluer les modèles PK/PD : des notions fondamentales aux ateliers de modélisation et à l’individualisation posologique.','Understand, build and evaluate PK/PD models: from core principles to model-building workshops and dose individualisation.')}</p>
        <div class="actions"><a class="btn btn-primary" href={base+'/?lang='+$language}>{t('Explorer PMx Explain','Explore PMx Explain')} →</a><a href={base+'/game/?lang='+$language} data-sveltekit-reload>PMx Game ↗</a><a href={base+'/domaines/?lang='+$language}>{t('Cours Omics → PK/PD','Omics → PK/PD lessons')} →</a><a href={base+'/tdm/?lang='+$language}>MIPD Engine →</a></div>
      </article>
      <div class="interpretation"><span aria-hidden="true">↓</span><span>{t('Connaissances et interprétation transversales · pas une étape de traitement des données','Knowledge and interpretation across the workflow · not a data-processing step')}</span></div>
      <div class="analytical">
        <article class="omics">
          <div class="node-heading"><span class="node-symbol" aria-hidden="true">Ω</span><div><p class="role">{t('ANALYSER','ANALYZE')}</p><h3>MultiOmics</h3></div></div>
          <p>{t('Analyser une ou plusieurs couches omiques, contrôler la qualité et produire des signatures et résultats traçables.','Analyze one or more omics layers, perform quality control and produce traceable signatures and results.')}</p>
          <a class="btn btn-outline" href={multiomics+'?lang='+$language} target="_blank" rel="noopener noreferrer">{t('Ouvrir MultiOmics','Open MultiOmics')} ↗</a>
        </article>
        <div class="bridge"><span class="arrow" aria-hidden="true">→</span><span>{t('Export individuel traçable','Traceable individual export')}</span></div>
        <article class="integration">
          <div class="node-heading"><span class="node-symbol" aria-hidden="true">PK+</span><div><p class="role">{t('INTÉGRER ET ÉVALUER','INTEGRATE AND EVALUATE')}</p><h3>Omics2PK</h3></div></div>
          <p>{t('Tester l’apport de signatures moléculaires au-delà des informations cliniques et pharmacogénétiques pour des questions PK.','Test the contribution of molecular signatures beyond clinical and pharmacogenetic information for PK research questions.')}</p>
          <a class="btn btn-outline" href={omics2pk+'?lang='+$language} target="_blank" rel="noopener noreferrer">{t('Ouvrir Omics2PK','Open Omics2PK')} ↗</a>
        </article>
      </div>
    </div>
    <p class="map-note">{t('Les plateformes sont indépendantes : leurs responsabilités scientifiques et leurs validations restent distinctes.','The platforms are independent: their scientific responsibilities and validation boundaries remain separate.')}</p>
  </section>

  <section class="handoff" id="research-flow" aria-labelledby="handoff-title">
    <div class="section-intro"><p class="eyebrow">{t('02 · DU SIGNAL BIOLOGIQUE AU MODÈLE','02 · FROM BIOLOGICAL SIGNAL TO MODEL')}</p><h2 id="handoff-title">{t('Un flux de recherche, pas une preuve automatique','A research workflow, not automatic evidence')}</h2></div>
    <ol class="flow" aria-label={t('Chaîne analytique','Analytical workflow')}>
      <li><b>01</b><strong>{t('Données','Data')}</strong><span>{t('Omiques et mesures individuelles','Omics and individual measurements')}</span></li>
      <li><b>02</b><strong>{t('Analyse','Analysis')}</strong><span>{t('Qualité, signatures, provenance','QC, signatures, provenance')}</span></li>
      <li><b>03</b><strong>{t('Hypothèse PK','PK hypothesis')}</strong><span>{t('Appariement sujets, doses, concentrations et chronologie','Matched subjects, doses, concentrations and timing')}</span></li>
      <li><b>04</b><strong>{t('Évaluation','Evaluation')}</strong><span>{t('Comparateurs cliniques et validation hors échantillon','Clinical comparators and held-out validation')}</span></li>
    </ol>
    <p class="boundary" role="note">{t('Une sortie omique n’établit ni causalité biologique, ni validité clinique, ni recommandation posologique. Chaque hypothèse doit être évaluée sur les données et comparateurs appropriés.','An omics output establishes neither biological causality, clinical validity nor a dosing recommendation. Each hypothesis must be evaluated with appropriate data and comparators.')}</p>
  </section>

  <section class="thesis-program" aria-labelledby="thesis-title" data-testid="thesis-research-program">
    <header class="section-intro">
      <p class="eyebrow">{t('03 · PROGRAMME DE THÈSE','03 · THESIS RESEARCH PROGRAMME')}</p>
      <h2 id="thesis-title">{t('Programme de recherche','Research programme')}</h2>
      <p>{t('Les projets sont présentés au fil des communications et publications disponibles.','Projects are presented as public communications and publications become available.')}</p>
    </header>
    <div class="thesis-grid">
      <div class="pillar-lane" aria-label={t('Axes de recherche','Research axes')}>
        {#each thesisProjects.filter(p=>p.id.startsWith('pillar-')) as project (project.id)}
          <article class="thesis-card pillar" data-project={project.id}>
            <span class="pillar-letter" aria-hidden="true">{project.id.slice(-1).toUpperCase()}</span>
            <div><h3>{t(project.name,project.nameEn ?? project.name)}</h3>
              <p class="thesis-status">{t(project.statusFr,project.statusEn)}</p>
              {#if project.summaryFr && project.summaryEn}<p>{t(project.summaryFr,project.summaryEn)}</p>{/if}
              {#if project.source}<a href={$language==='fr'?project.source.replace('/communications/','/communications/fr/'):project.source}>{t(project.sourceFr ?? '',project.sourceEn ?? '')} →</a>{/if}
            </div>
          </article>
        {/each}
      </div>
      <aside class="project-lane">
        <h3>{t('Projets transversaux','Cross-cutting projects')}</h3>
        {#each thesisProjects.filter(p=>!p.id.startsWith('pillar-')) as project (project.id)}
          <article class="thesis-card" data-project={project.id}>
            <h3>{project.name}</h3><p class="thesis-status">{t(project.statusFr,project.statusEn)}</p>
            {#if project.summaryFr && project.summaryEn}<p>{t(project.summaryFr,project.summaryEn)}</p>{/if}
            {#if project.source}<a href={$language==='fr'?project.source.replace('/communications/','/communications/fr/'):project.source}>{t(project.sourceFr ?? '',project.sourceEn ?? '')} →</a>{/if}
          </article>
        {/each}
        <a class="profile-link" href="https://rberrah.github.io/a-propos/">{t('Profil scientifique et CV','Research profile and CV')} ↗</a>
      </aside>
    </div>
    <p class="map-note">{t('Une communication de congrès n’est pas un article évalué par les pairs ; aucun résultat non publié n’est présenté ici. La carte sera mise à jour au fil des publications vérifiables.','A conference presentation is not a peer-reviewed article; no unpublished results are presented here. The map will be updated as verifiable outputs become public.')}</p>
  </section>
</section>

<style>
  .ecosystem{max-width:1120px;margin:0 auto;padding-block:clamp(1.8rem,4vw,3.5rem)}
  .intro{display:grid;grid-template-columns:minmax(0,1.75fr) minmax(220px,.8fr);gap:2rem;align-items:center}
  .eyebrow,.role{font:700 var(--text-xs)/1.5 var(--font-mono);letter-spacing:.045em;color:var(--accent-pk);margin:0 0 .5rem}
  h1{font-size:clamp(2.2rem,5vw,3.7rem);line-height:1.06;max-width:22ch;margin:.45rem 0 1rem}
  h2{font-size:clamp(1.45rem,3vw,2.1rem);margin:.3rem 0 .65rem}
  h3{font-size:1.32rem;line-height:1.2;margin:0 0 .55rem}
  p{line-height:1.65;color:var(--text-secondary);margin:0 0 .8rem}
  .lede{font-size:1.05rem;max-width:72ch}
  .jump{display:flex;flex-wrap:wrap;gap:.5rem 1rem;margin-top:1.2rem;font-size:.86rem}
  .principles{border-left:3px solid var(--accent-pk);padding:1.3rem;background:var(--bg-secondary);border-radius:0 12px 12px 0}
  .principles strong{display:block;margin-top:.45rem;font-size:1.15rem}
  .principles ul{padding-left:1.05rem;margin:.8rem 0 0;color:var(--text-secondary);font-size:.9rem;line-height:1.65}
  .platforms,.handoff,.thesis-program{margin-top:2.6rem;scroll-margin-top:5rem}
  .section-intro{max-width:850px;margin-bottom:1.2rem}
  .map{border:1px solid var(--border-subtle);border-radius:16px;padding:clamp(.9rem,2.7vw,1.75rem);background:var(--bg-secondary)}
  .map article{background:var(--bg-primary);border:1px solid var(--border-strong);border-radius:12px;padding:1.2rem;min-width:0}
  .map .learning{border-top:4px solid var(--accent-pk);display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:.6rem 1.5rem;align-items:center}
  .learning .node-heading{grid-column:1/-1}
  .learning p:not(.role){margin:0}
  .node-heading{display:flex;align-items:center;gap:.85rem;margin-bottom:.75rem}
  .node-symbol{width:3rem;height:3rem;display:grid;place-items:center;flex-shrink:0;border:1px solid var(--border-strong);border-radius:10px;font:700 1rem var(--font-mono);color:var(--accent-pk);background:var(--bg-tertiary)}
  .node-heading h3,.node-heading .role{margin:0}
  .actions{display:flex;gap:.55rem .85rem;flex-wrap:wrap;align-items:center;font-size:.86rem}
  .interpretation{display:flex;align-items:center;justify-content:center;gap:.6rem;margin:.85rem 0;font-size:.82rem;color:var(--text-secondary);text-align:center}
  .interpretation span:first-child,.bridge .arrow{font-size:1.55rem;color:var(--accent-pk);font-weight:700}
  .analytical{display:grid;grid-template-columns:minmax(0,1fr) minmax(92px,.34fr) minmax(0,1fr);gap:.65rem;align-items:stretch}
  .analytical article{display:flex;flex-direction:column;align-items:flex-start}
  .analytical .omics{border-top:3px solid var(--accent-ai)}
  .analytical .integration{border-top:3px solid var(--accent-pd)}
  .analytical article .btn{margin-top:auto}
  .bridge{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:.25rem;color:var(--text-secondary);font-size:.78rem}
  .map-note{font-size:.87rem;color:var(--text-secondary);margin-top:.85rem}
  .flow{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.65rem;list-style:none;padding:0;margin:0}
  .flow li{min-width:0;position:relative;border-top:2px solid var(--accent-pk);padding:.9rem .7rem;background:var(--bg-secondary);display:grid;gap:.35rem}
  .flow li b{font:700 .8rem var(--font-mono);color:var(--accent-pk)}
  .flow li span{font-size:.84rem;color:var(--text-secondary)}
  .boundary{margin-top:1rem;padding:.9rem 1rem;border-left:3px solid var(--accent-pk);background:var(--bg-secondary);font-size:.9rem}
  .thesis-grid{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(0,1fr);gap:1.2rem}
  .pillar-lane{border-left:2px solid var(--border-strong);padding-left:1rem;display:grid;gap:.7rem}
  .thesis-card{border:1px solid var(--border-strong);border-radius:10px;padding:1rem;background:var(--bg-secondary);min-width:0}
  .thesis-card.pillar{display:grid;grid-template-columns:2.3rem minmax(0,1fr);gap:.7rem;align-items:start}
  .pillar-letter{font:700 1.25rem var(--font-mono);display:grid;place-items:center;width:2.25rem;height:2.25rem;background:var(--bg-tertiary);border:1px solid var(--border-strong);border-radius:8px;color:var(--accent-pk)}
  .thesis-card h3{font-size:1.12rem;margin:0 0 .35rem}
  .thesis-card p{font-size:.9rem;margin:0 0 .55rem}
  .thesis-card .thesis-status{font-size:.77rem;font-weight:700;color:var(--accent-pk)}
  .thesis-card a,.profile-link{font-size:.87rem;font-weight:600}
  .project-lane{display:flex;flex-direction:column;gap:.7rem}
  .project-lane>h3{font-size:1rem;margin:.15rem 0}
  @media(max-width:820px){.intro,.map .learning,.thesis-grid{grid-template-columns:1fr}.flow{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:560px){.analytical,.flow{grid-template-columns:1fr}.bridge .arrow{transform:rotate(90deg)}.map article{padding:.9rem}.ecosystem{padding-inline:0}.intro{gap:1rem}}
.shared-links{display:flex;flex-wrap:wrap;gap:.6rem;margin:1rem 0}.shared-links a{display:inline-flex;align-items:center;min-height:44px;padding:.5rem .85rem;border:1px solid var(--border-strong);border-radius:8px}
</style>
