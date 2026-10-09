(() => {
  if (!window.location.pathname.includes('/multiomics/tool')) return;

  const lang = () => document.documentElement.lang === 'en' ? 'en' : 'fr';

  function render() {
    const guide = document.querySelector('[data-testid="multiomics-beginner-guide"]')
      || document.querySelector('[data-testid="multiomics-sample-sheet-guide"]');
    if (!guide) return;

    let panel = document.querySelector('[data-testid="multiomics-validation-evidence"]');
    if (!panel) {
      panel = document.createElement('section');
      panel.dataset.testid = 'multiomics-validation-evidence';
      panel.className = 'multiomics-validation-evidence';
      guide.insertAdjacentElement('afterend', panel);
    }

    const language = lang();
    if (panel.dataset.language === language) return;
    panel.dataset.language = language;

    panel.innerHTML = language === 'en'
      ? `
        <details class="validation-evidence-details"><summary>How is this tool validated?</summary>
        <div class="validation-evidence-head">
          <div><span>Software validation</span><h3>How do we check that the pipeline behaves as intended?</h3></div>
          <b>Positive + negative controls</b>
        </div>
        <p>The tool is not considered trustworthy merely because it returns plausible-looking tables. Its automated benchmark replays public datasets with described biological structure, plus deliberately permuted-label controls. Some positive-control features were preselected using published statistical results.</p>
        <div class="validation-evidence-grid">
          <article><strong>1 · Known public signals</strong><p>Public multi-omics datasets are converted to the same input contract as user data. The engine checks selected genes, proteins, metabolites, correlations, trajectories and pathway families against known reference results. For AgingHFCD and LRRK2, reference-significant features were deliberately enriched: this is targeted reproduction, not an unbiased sensitivity or specificity estimate.</p></article>
          <article><strong>2 · Negative controls</strong><p>Phenotype labels are deterministically permuted while preserving the matrices and class sizes. Out-of-sample predictive discrimination must collapse toward chance and feature-wise FDR discoveries must remain sparse.</p></article>
          <article><strong>3 · Reproducible provenance</strong><p>External repositories are pinned to immutable Git commits and exported benchmark inputs are SHA-256 hashed. The PMx commit and runtime are retained with the benchmark report.</p></article>
          <article><strong>4 · Independent R checks and missing data</strong><p>A separate R implementation checks the browser's two-group HC3 model on 288 simulated studies. A further 2,000 null simulations (MCAR, age-related MAR, batch effects and MNAR) found at least one false BH discovery in 93% of the 200 MNAR datasets with 80 subjects, despite similar missingness rates between groups. Missing data always require methodological review; the software cannot identify MNAR from observed measurements or guarantee confirmatory validity.</p></article>
        </div>
        <div class="validation-evidence-limit"><strong>What this does not prove</strong><span>Passing software benchmarks does not validate your cohort, remove confounding, guarantee adequate power, establish causality, or provide external clinical validation for a biomarker or prediction model.</span></div>
        </details>
      `
      : `
        <details class="validation-evidence-details"><summary>Comment l’outil est-il validé ?</summary>
        <div class="validation-evidence-head">
          <div><span>Validation du logiciel</span><h3>Comment vérifie-t-on que la pipeline se comporte comme prévu ?</h3></div>
          <b>Contrôles positifs + négatifs</b>
        </div>
        <p>L’outil n’est pas considéré comme fiable simplement parce qu’il produit des tableaux plausibles. Son benchmark automatisé réanalyse des jeux multi-omiques publics, ainsi que des contrôles où les étiquettes biologiques sont volontairement permutées. Certaines variables des contrôles positifs ont été présélectionnées à partir des résultats publiés.</p>
        <div class="validation-evidence-grid">
          <article><strong>1 · Signaux publics connus</strong><p>Les jeux publics sont convertis exactement vers le même contrat d’entrée que les données utilisateur. Le moteur compare des gènes, protéines, métabolites, corrélations, trajectoires et voies ciblés à des résultats de référence. Pour AgingHFCD et LRRK2, la sélection enrichit volontairement les signaux significatifs connus : ce test ne mesure donc pas sans biais la sensibilité ni la spécificité.</p></article>
          <article><strong>2 · Contrôles négatifs</strong><p>Les labels phénotypiques sont permutés de façon déterministe tout en conservant les matrices et les effectifs de classes. La discrimination prédictive hors-échantillon doit retomber vers le hasard et les découvertes FDR doivent rester rares.</p></article>
          <article><strong>3 · Provenance reproductible</strong><p>Les dépôts externes sont figés sur des commits Git immuables et les fichiers de benchmark exportés sont hachés en SHA-256. Le commit PMx et l’environnement d’exécution sont conservés avec le rapport.</p></article>
          <article><strong>4 · Comparaison R et données manquantes</strong><p>Une implémentation R indépendante vérifie le modèle HC3 à deux groupes sur 288 études simulées. Sur 2 000 simulations nulles supplémentaires (MCAR, MAR selon l’âge, lots et MNAR), au moins une fausse découverte BH est apparue dans 93 % des 200 jeux MNAR à 80 sujets, malgré des taux de valeurs manquantes proches entre groupes. Toute analyse incomplète nécessite une revue méthodologique : le logiciel ne sait pas identifier le MNAR à partir des seules mesures ni garantir une validité confirmatoire.</p></article>
        </div>
        <div class="validation-evidence-limit"><strong>Ce que cela ne prouve pas</strong><span>Réussir ces benchmarks logiciels ne valide pas votre cohorte, ne supprime pas les facteurs de confusion, ne garantit pas la puissance, n’établit pas la causalité et ne constitue pas une validation clinique externe d’un biomarqueur ou d’un modèle prédictif.</span></div>
        </details>
      `;
  }

  function installStyle() {
    if (document.getElementById('multiomics-validation-evidence-style')) return;
    const style = document.createElement('style');
    style.id = 'multiomics-validation-evidence-style';
    style.textContent = `
      .validation-evidence-details>summary{cursor:pointer;font-weight:700}
      .multiomics-validation-evidence{max-width:1180px;margin:14px auto 20px;padding:16px;border:1px solid var(--border-subtle,#d4d4d4);border-radius:12px;background:var(--bg-secondary,#f7f7f7)}
      .validation-evidence-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.validation-evidence-head span{display:block;font-size:.74rem;text-transform:uppercase;letter-spacing:.08em;color:var(--text-secondary,#666)}.validation-evidence-head h3{margin:4px 0 0;font-size:1.04rem}.validation-evidence-head>b{border:1px solid var(--border-subtle,#ccc);border-radius:999px;padding:5px 9px;font-size:.8rem;white-space:nowrap}.multiomics-validation-evidence>p{max-width:88ch;line-height:1.48;color:var(--text-secondary,#555)}
      .validation-evidence-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.validation-evidence-grid article{padding:11px;border:1px solid var(--border-subtle,#ddd);border-radius:9px;background:var(--bg-primary,#fff)}.validation-evidence-grid p{margin:5px 0 0;font-size:.87rem;line-height:1.43;color:var(--text-secondary,#555)}
      .validation-evidence-limit{display:grid;grid-template-columns:minmax(150px,.35fr) 1.65fr;gap:12px;margin-top:10px;padding:11px;border:1px solid var(--border-subtle,#ddd);border-radius:9px;background:var(--bg-primary,#fff)}.validation-evidence-limit span{font-size:.87rem;line-height:1.43;color:var(--text-secondary,#555)}
      @media(max-width:850px){.validation-evidence-grid{grid-template-columns:1fr}.validation-evidence-head{flex-direction:column}.validation-evidence-limit{grid-template-columns:1fr}.validation-evidence-head>b{white-space:normal}}
    `;
    document.head.appendChild(style);
  }

  let queued = false;
  function refresh() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      installStyle();
      render();
    });
  }

  const observer = new MutationObserver(refresh);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['lang'] });
  document.addEventListener('DOMContentLoaded', refresh, { once: true });
  refresh();
})();
