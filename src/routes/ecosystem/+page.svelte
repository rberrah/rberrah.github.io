<script>
  import { asset } from '$app/paths';
  import { language } from '#lib/stores/language.js';
  /** @param {string} fr @param {string} en */
  const t=(fr,en)=>$language==='en'?en:fr;
</script>

<svelte:head>
  <title>{t('Écosystème — PMx Explain','Ecosystem — PMx Explain')}</title>
  <meta name="description" content={t(
    'PMx Explain, MultiOmics et Omics2PK forment un écosystème de recherche cohérent : apprendre la pharmacométrie, analyser les omiques puis tester leur apport à la PK/PD.',
    'PMx Explain, MultiOmics and Omics2PK form a coherent research ecosystem: learn pharmacometrics, analyze omics, then test their value for PK/PD.'
  )} />
</svelte:head>

<section class="ecosystem-page" data-testid="ecosystem-page">
  <header class="intro">
    <p class="eyebrow">{t('ÉCOSYSTÈME DE RECHERCHE','RESEARCH ECOSYSTEM')}</p>
    <h1>{t('Apprendre. Analyser. Intégrer.','Learn. Analyze. Integrate.')}</h1>
    <p class="lede">{t(
      'Trois outils autonomes, une même logique : comprendre les concepts pharmacométriques avec PMx Explain, produire des analyses omiques traçables avec MultiOmics, puis tester séparément leur valeur pour la pharmacocinétique avec Omics2PK.',
      'Three autonomous tools, one shared logic: understand pharmacometric concepts with PMx Explain, produce traceable omics analyses with MultiOmics, then separately test their pharmacokinetic value with Omics2PK.'
    )}</p>
  </header>

  <figure class="ecosystem-figure">
    <img src={asset('ecosystem/ecosystem-graphical-abstract.svg')} alt={t(
      'Écosystème : PMx Explain pour apprendre, MultiOmics pour analyser et Omics2PK pour intégrer les signaux moléculaires à la recherche PK.',
      'Ecosystem: PMx Explain for learning, MultiOmics for analysis and Omics2PK for integrating molecular signals into PK research.'
    )} />
    <figcaption>{t(
      'Même logique éditoriale, dépôts séparés et frontières de preuve explicites.',
      'Shared editorial logic, separate repositories and explicit evidence boundaries.'
    )}</figcaption>
  </figure>

  <div class="roles">
    <article class="connection current">
      <p class="role">{t('01 · Apprendre','01 · Learn')}</p>
      <h2>PMx Explain</h2>
      <p>{t(
        'Cours, animations, exercices et outils pour comprendre PK/PD, PopPK, covariables, MIPD et les hypothèses nécessaires avant d’utiliser un signal biologique dans un modèle.',
        'Courses, animations, exercises and tools for understanding PK/PD, PopPK, covariates, MIPD and the assumptions required before using a biological signal in a model.'
      )}</p>
      <div class="actions">
        <a class="btn btn-primary" href="../chapitres/">{t('Commencer à apprendre','Start learning')} →</a>
        <a class="btn btn-outline" href="../domaines/">{t('Cours Omics → PK/PD','Omics → PK/PD lessons')} →</a>
      </div>
    </article>

    <article class="connection">
      <p class="role">{t('02 · Analyser','02 · Analyze')}</p>
      <h2>MultiOmics</h2>
      <p>{t(
        'QC, analyses mono- et multi-omiques, méthodes natives R lorsque qualifiées, niveaux de preuve visibles et exports reproductibles. Un résultat de groupe n’est pas automatiquement une covariable individuelle.',
        'QC, single- and multi-omics analyses, qualified native-R methods, visible evidence levels and reproducible exports. A group-level result is not automatically an individual covariate.'
      )}</p>
      <a class="btn btn-outline" href="https://rberrah.github.io/multiomics/">{t('Ouvrir MultiOmics','Open MultiOmics')} ↗</a>
    </article>

    <article class="connection">
      <p class="role">{t('03 · Intégrer','03 · Integrate')}</p>
      <h2>Omics2PK</h2>
      <p>{t(
        'Confronte des mesures ou signatures moléculaires individuelles à des données cliniques, pharmacogénétiques et PK authentiques afin de tester un gain au-delà des références usuelles.',
        'Confronts individual molecular measurements or signatures with genuine clinical, pharmacogenetic and PK data to test incremental value beyond usual reference information.'
      )}</p>
      <a class="btn btn-outline" href="https://rberrah.github.io/Omics2PK/">{t('Ouvrir Omics2PK','Open Omics2PK')} ↗</a>
    </article>
  </div>

  <section class="handoff">
    <p class="eyebrow">{t('CHAÎNE SCIENTIFIQUE','SCIENTIFIC HANDOFF')}</p>
    <h2>{t('Une continuité de workflow, pas un transfert automatique de preuve.','A continuous workflow, not an automatic transfer of evidence.')}</h2>
    <div class="flow" aria-label={t('Flux de recherche','Research flow')}>
      <span>PMx Explain<br><small>{t('comprendre','understand')}</small></span><b>→</b>
      <span>MultiOmics<br><small>{t('analyser','analyze')}</small></span><b>→</b>
      <span>{t('échange individuel','individual exchange')}</span><b>→</b>
      <span>Omics2PK<br><small>{t('tester','test')}</small></span><b>→</b>
      <span>{t('validation indépendante','independent validation')}</span>
    </div>
    <p>{t(
      'La compatibilité technique entre outils ne démontre ni causalité biologique, ni bénéfice PK, ni validité clinique. Chaque étape conserve ses propres contrôles, données et exigences de validation.',
      'Technical compatibility between tools demonstrates neither biological causality, PK benefit nor clinical validity. Each stage retains its own controls, data and validation requirements.'
    )}</p>
  </section>
</section>

<style>
  .ecosystem-page{padding-block:clamp(2rem,5vw,4rem)}
  .intro{max-width:920px}
  .intro h1{max-width:24ch}
  .lede{max-width:78ch;color:var(--text-secondary);font-size:var(--text-lg)}
  .ecosystem-figure{margin:2.5rem 0 3rem;padding:1rem;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--bg-secondary)}
  .ecosystem-figure img{display:block;width:100%;height:auto;border-radius:calc(var(--radius-lg) - 6px)}
  .ecosystem-figure figcaption{text-align:center;margin-top:.75rem;color:var(--text-secondary);font-size:var(--text-sm)}
  .roles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem}
  .connection{padding:1.4rem;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--bg-tertiary)}
  .connection.current{border-top:3px solid var(--accent-pk)}
  .connection p{color:var(--text-secondary)}
  .role{font-family:var(--font-mono);font-size:var(--text-xs);font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--accent-pk)!important}
  .actions{display:flex;flex-wrap:wrap;gap:.6rem}
  .handoff{margin-top:2rem;padding:clamp(1.3rem,3vw,2rem);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--bg-secondary)}
  .handoff>p:last-child{color:var(--text-secondary)}
  .flow{display:grid;grid-template-columns:1fr auto 1fr auto 1fr auto 1fr auto 1fr;gap:.5rem;align-items:center;margin:1.2rem 0;text-align:center}
  .flow span{padding:.75rem .55rem;border:1px solid var(--border-strong);border-radius:var(--radius);background:var(--bg-primary)}
  .flow small{color:var(--text-secondary)}
  .flow b{color:var(--accent-pk)}
  @media(max-width:900px){.roles{grid-template-columns:1fr}.flow{grid-template-columns:1fr}.flow b{transform:rotate(90deg)}}
</style>
