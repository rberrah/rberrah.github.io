<script>
  import { base } from '$app/paths';
  import { language } from '$lib/stores/language';
  /** @param {string} fr @param {string} en */
  const t = (fr, en) => $language === 'en' ? en : fr;

  const branches = [
    {
      fr: 'Explorer sans outcome',
      en: 'Explore without an outcome',
      methodFr: 'ACP multi-blocs équilibrée',
      methodEn: 'Balanced multi-block PCA',
      detailFr: 'Recherche des axes latents partagés entre transcriptomique, protéomique et métabolomique après standardisation et équilibrage des blocs.',
      detailEn: 'Find shared latent axes across transcriptomics, proteomics and metabolomics after within-layer standardization and block balancing.'
    },
    {
      fr: 'Comparer des groupes',
      en: 'Compare groups',
      methodFr: 'Contrastes ajustés au design',
      methodEn: 'Design-aware adjusted contrasts',
      detailFr: 'Réplicats techniques, batches, covariables, groupes indépendants/appariés et longitudinalité sont traités selon des règles explicites.',
      detailEn: 'Technical replicates, batches, covariates, independent/paired groups and longitudinal structure are handled by explicit rules.'
    },
    {
      fr: 'Expliquer un outcome',
      en: 'Explain an outcome',
      methodFr: 'Régression selon le type de critère',
      methodEn: 'Outcome-specific regression',
      detailFr: 'Régression linéaire, logistique, Poisson, ANOVA multiclasse ou Cox selon le critère déclaré, avec correction BH-FDR.',
      detailEn: 'Linear, logistic, Poisson, multiclass ANOVA or Cox regression is selected from the declared endpoint, with BH-FDR correction.'
    },
    {
      fr: 'Étudier le temps',
      en: 'Study time',
      methodFr: 'Changement ou pente intra-sujet',
      methodEn: 'Within-subject change or slope',
      detailFr: 'Deux temps utilisent un changement individuel ; trois temps ou plus une pente individuelle avant comparaison entre conditions.',
      detailEn: 'Two time points use individual change; three or more use individual slopes before comparing conditions.'
    }
  ];
</script>

<svelte:head>
  <title>{t('Multi-omique — PMx Explain', 'Multi-omics — PMx Explain')}</title>
  <meta name="description" content={t('Présentation de l’outil déterministe d’intégration multi-omique de PMx Explain.', 'Presentation of PMx Explain deterministic multi-omics integration tool.')} />
</svelte:head>

<section class="hero">
  <p class="eyebrow">{t('Multi-omique · prototype de recherche', 'Multi-omics · research prototype')}</p>
  <h1>{t('Intégrer plusieurs omiques sans boîte noire narrative.', 'Integrate multiple omics without a narrative black box.')}</h1>
  <p class="lede">{t(
    'PMx Explain relie le design expérimental, les métadonnées, les matrices omiques et des bases scientifiques publiques dans un workflow déterministe. Aucun LLM ne décide de la méthode ou de l’interprétation statistique.',
    'PMx Explain connects study design, metadata, omics matrices and public scientific databases in a deterministic workflow. No LLM chooses the statistical method or interpretation.'
  )}</p>
  <div class="actions">
    <a class="btn btn-primary" href={`${base}/multiomics/tool`}>{t('Ouvrir l’outil', 'Open the tool')}</a>
    <a class="btn btn-outline" href={`${base}/multiomics/README.txt`} target="_blank">{t('Voir le contrat de données', 'Read the data contract')}</a>
  </div>
</section>

<section class="panel">
  <div class="section-head">
    <div>
      <p class="eyebrow">{t('Principe', 'Principle')}</p>
      <h2>{t('La question scientifique choisit la branche analytique', 'The scientific question selects the analytical branch')}</h2>
    </div>
    <p>{t('L’utilisateur décrit le protocole et les données. Le moteur applique ensuite des règles statistiques prédéfinies et auditables.', 'The user describes the study and data. The engine then applies predefined, auditable statistical rules.')}</p>
  </div>

  <div class="branch-grid">
    {#each branches as branch}
      <article>
        <span>{$language === 'en' ? branch.methodEn : branch.methodFr}</span>
        <h3>{$language === 'en' ? branch.en : branch.fr}</h3>
        <p>{$language === 'en' ? branch.detailEn : branch.detailFr}</p>
      </article>
    {/each}
  </div>
</section>

<section class="panel">
  <div class="section-head">
    <div>
      <p class="eyebrow">{t('De la donnée au résultat', 'From data to result')}</p>
      <h2>{t('Un contrat explicite pour éviter les rapprochements implicites', 'An explicit contract to avoid implicit matching')}</h2>
    </div>
  </div>
  <div class="flow">
    <article><b>subject_id</b><p>{t('Unité biologique indépendante.', 'Independent biological unit.')}</p></article>
    <article><b>sample_id</b><p>{t('Prélèvement biologique physique.', 'Physical biological specimen.')}</p></article>
    <article><b>assay_id</b><p>{t('Mesure technique correspondant à une colonne de matrice.', 'Technical assay corresponding to a matrix column.')}</p></article>
    <article><b>omic</b><p>{t('Transcriptomique, protéomique ou métabolomique.', 'Transcriptomics, proteomics or metabolomics.')}</p></article>
  </div>
  <p class="note">{t('Les réplicats techniques partagent sample_id + omic mais gardent des assay_id distincts. Les sujets partiellement couverts entre omiques ne sont jamais appariés par similarité de nom.', 'Technical replicates share sample_id + omic but keep distinct assay_id values. Partially covered subjects are never matched by fuzzy name similarity.')}</p>
</section>

<section class="panel">
  <div class="section-head">
    <div>
      <p class="eyebrow">{t('Ajustements', 'Adjustment')}</p>
      <h2>{t('Batches et covariables sont traités explicitement', 'Batches and covariates are handled explicitly')}</h2>
    </div>
  </div>
  <div class="two-col">
    <article>
      <h3>{t('Batch technique', 'Technical batch')}</h3>
      <p>{t('Un batch totalement confondu avec la condition, le temps ou un outcome catégoriel bloque l’analyse. Sinon, les batches multiples sont ajustés variable par variable avant l’inférence biologique.', 'A batch fully confounded with condition, time or a categorical outcome blocks analysis. Otherwise, multiple batches are adjusted feature by feature before biological inference.')}</p>
    </article>
    <article>
      <h3>{t('Covariables', 'Covariates')}</h3>
      <p>{t('L’utilisateur sélectionne les colonnes à ajuster. Les variables numériques sont standardisées ; les variables catégorielles sont encodées explicitement. L’outil ne choisit pas les confondeurs à votre place.', 'The user selects columns to adjust. Numeric variables are standardized and categorical variables are explicitly encoded. The tool does not choose confounders on your behalf.')}</p>
    </article>
  </div>
</section>

<section class="panel">
  <div class="section-head">
    <div>
      <p class="eyebrow">{t('Interprétation', 'Interpretation')}</p>
      <h2>{t('Le résultat inclut maintenant « Comment interpréter ces résultats ? »', 'Results now include “How should these results be interpreted?”')}</h2>
    </div>
    <p>{t('L’aide est générée par des règles déterministes à partir du type de modèle, des effets, des q-values, des ajustements, des relations inter-omiques et de Reactome.', 'Guidance is generated by deterministic rules from model type, effects, q-values, adjustments, cross-omics relations and Reactome.')}</p>
  </div>
  <div class="interpret">
    <div><b>{t('Effet', 'Effect')}</b><span>{t('direction + amplitude, pas seulement p-value', 'direction + magnitude, not only p-value')}</span></div>
    <div><b>q BH</b><span>{t('contrôle exploratoire des tests multiples', 'exploratory multiple-testing control')}</span></div>
    <div><b>{t('Multi-omique', 'Multi-omics')}</b><span>{t('convergence ou changement de couplage entre couches', 'convergence or changed coupling across layers')}</span></div>
    <div><b>Reactome</b><span>{t('connaissance externe, séparée des données observées', 'external knowledge, kept separate from observed data')}</span></div>
  </div>
</section>

<section class="panel validation">
  <div>
    <p class="eyebrow">{t('Validation publique', 'Public validation')}</p>
    <h2>{t('Testé sur plusieurs vérités biologiques et structures de données', 'Tested against multiple biological truths and data structures')}</h2>
  </div>
  <p>{t('La suite automatisée couvre notamment Nutrimouse, TCGA breast, IntLIM NCI-60/BRCA, AgingHFCD, STATegra, LRRK2, PaintOmics à signal planté et missRows.', 'The automated suite covers Nutrimouse, TCGA breast, IntLIM NCI-60/BRCA, AgingHFCD, STATegra, LRRK2, a planted-signal PaintOmics dataset and missRows.')}</p>
  <a class="btn btn-primary" href={`${base}/multiomics/tool`}>{t('Lancer une analyse', 'Run an analysis')}</a>
</section>

<style>
  .hero { max-width: 930px; padding: var(--space-12) 0 var(--space-10); }
  h1 { font-size: clamp(2.6rem, 6vw, 5rem); line-height: .98; max-width: 15ch; margin: var(--space-3) 0 var(--space-6); letter-spacing: -.045em; }
  h2 { margin: 0; font-size: var(--text-2xl); }
  h3 { margin: 0 0 var(--space-2); }
  p { line-height: 1.65; }
  .lede { max-width: 72ch; color: var(--text-secondary); font-size: var(--text-lg); }
  .actions { display:flex; flex-wrap:wrap; gap:var(--space-3); margin-top:var(--space-6); }
  .panel { border-top:1px solid var(--border-strong); padding-top:var(--space-6); margin-top:var(--space-10); }
  .section-head { display:flex; justify-content:space-between; gap:var(--space-6); align-items:end; margin-bottom:var(--space-5); }
  .section-head > p { color:var(--text-secondary); max-width:48ch; margin:0; }
  .branch-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:var(--space-4); }
  .branch-grid article, .two-col article { padding:var(--space-5); border:1px solid var(--border-subtle); border-radius:var(--radius); background:var(--bg-secondary); }
  .branch-grid article > span { font-family:var(--font-mono); font-size:var(--text-xs); color:var(--accent-pk); }
  .branch-grid p, .two-col p, .note { color:var(--text-secondary); }
  .flow { display:grid; grid-template-columns:repeat(4,1fr); gap:var(--space-3); }
  .flow article { padding:var(--space-4); border-top:2px solid var(--accent-pd); background:var(--bg-secondary); }
  .flow b { font-family:var(--font-mono); color:var(--accent-pk); }
  .two-col { display:grid; grid-template-columns:repeat(2,1fr); gap:var(--space-4); }
  .interpret { display:grid; grid-template-columns:repeat(2,1fr); gap:var(--space-3); }
  .interpret div { display:grid; grid-template-columns:.8fr 2fr; gap:var(--space-3); padding:var(--space-4); border:1px solid var(--border-subtle); }
  .interpret span { color:var(--text-secondary); }
  .validation { margin-bottom:var(--space-12); }
  .validation > p { max-width:70ch; color:var(--text-secondary); }
  @media (max-width:700px) {
    .section-head { align-items:start; flex-direction:column; }
    .branch-grid, .flow, .two-col, .interpret { grid-template-columns:1fr; }
  }
</style>
