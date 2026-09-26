(() => {
  if (!window.location.pathname.includes('/multiomics/tool')) return;

  const terms = {
    fr: new Map([
      ['Effet biologique', 'Différence observée'],
      ['Significativité', 'Résultat après correction statistique'],
      ['Relations inter-omiques', 'Relations entre les omiques'],
      ['Axe latent principal', 'Tendance principale commune'],
      ['Covariables', 'Facteurs d’ajustement'],
      ['Association avec l’outcome', 'Lien avec le critère étudié'],
      ['Prédiction hors échantillon', 'Prédiction chez de nouveaux sujets'],
      ['Moteur R de référence', 'Analyse R de référence'],
      ['QC par couche', 'Contrôle qualité par type de données'],
      ['PCA QC', 'Vue globale des échantillons (ACP)'],
      ['screening', 'exploratoire'],
      ['Fold ratio', 'Amplitude (rapport)'],
      ['q BH', 'Résultat corrigé (q)'],
      ['Pattern', 'Profil'],
      ['r reference', 'Corrélation · groupe de référence'],
      ['r comparison', 'Corrélation · groupe comparé'],
      ['Δr', 'Différence de corrélation (Δr)'],
      ['Combined FDR', 'Résultat corrigé combiné'],
      ['FDR univers assay', 'Résultat corrigé avec les variables mesurées'],
      ['Nombre de couches concordantes', 'Nombre d’omics qui soutiennent la même voie'],
      ['Loadings', 'Variables qui contribuent le plus'],
      ['loadings', 'contributions des variables'],
      ['Outcome / critère', 'Critère étudié'],
      ['Type d’outcome principal', 'Type de critère étudié'],
      ['Temps omique utilisé pour l’outcome', 'Temps des mesures moléculaires utilisé pour étudier le critère'],
      ['Covariables / facteurs d’ajustement', 'Facteurs d’ajustement'],
      ['Batch connu ?', 'Plusieurs séries techniques sont-elles présentes ?'],
      ['Batch', 'Série technique']
    ]),
    en: new Map([
      ['Biological effect', 'Observed difference'],
      ['Statistical evidence', 'Result after multiple-testing correction'],
      ['Cross-omics relationships', 'Relationships between omics'],
      ['Main latent axis', 'Main shared trend'],
      ['Covariates', 'Adjustment factors'],
      ['Outcome association', 'Association with the studied endpoint'],
      ['Out-of-sample prediction', 'Prediction in unseen subjects'],
      ['Reference R engine', 'Reference R analysis'],
      ['PCA QC', 'Global sample view (PCA)'],
      ['screening', 'exploratory'],
      ['Fold ratio', 'Magnitude (ratio)'],
      ['q BH', 'Adjusted result (q)'],
      ['Pattern', 'Profile'],
      ['r reference', 'Correlation · reference group'],
      ['r comparison', 'Correlation · comparison group'],
      ['Δr', 'Correlation difference (Δr)'],
      ['Combined FDR', 'Combined adjusted result'],
      ['Assay-universe FDR', 'Adjusted result using measured variables'],
      ['Covariates / adjustment factors', 'Adjustment factors']
    ])
  };

  function language() {
    return document.documentElement.lang === 'en' ? 'en' : 'fr';
  }

  function replaceText(root = document.body) {
    if (!root) return;
    const map = terms[language()];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const raw = node.nodeValue || '';
      const trimmed = raw.trim();
      const replacement = map.get(trimmed);
      if (!replacement) continue;
      const leading = raw.match(/^\s*/)?.[0] || '';
      const trailing = raw.match(/\s*$/)?.[0] || '';
      node.nodeValue = leading + replacement + trailing;
    }
  }

  let queued = false;
  const refresh = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      replaceText();
    });
  };

  new MutationObserver(refresh).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true
  });
  document.addEventListener('DOMContentLoaded', refresh, { once: true });
  refresh();
})();
