(() => {
  if (!window.location.pathname.includes('/multiomics/tool')) return;

  const lang = () => document.documentElement.lang === 'en' ? 'en' : 'fr';
  const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

  function parseNumber(value) {
    const text = clean(value).replace(',', '.').replace(/[^0-9eE+\-.]/g, '');
    if (!text) return null;
    const number = Number(text);
    return Number.isFinite(number) ? number : null;
  }

  function qColumnIndex(headers) {
    const patterns = [/^q$/i, /q\s*bh/i, /fdr/i, /padj/i, /adj\.?\s*p/i, /adjusted\s*p/i, /q[-_ ]?value/i];
    return headers.findIndex((header) => patterns.some((pattern) => pattern.test(header)));
  }

  function displayedFdrCounts() {
    const results = document.querySelector('[data-testid="multiomics-results"]');
    if (!results) return { tested: 0, primary: 0, exploratoryOnly: 0 };
    let tested = 0;
    let primary = 0;
    let exploratoryOnly = 0;
    for (const table of results.querySelectorAll('table')) {
      const headers = [...table.querySelectorAll('thead th')].map((node) => clean(node.textContent));
      const qIndex = qColumnIndex(headers);
      if (qIndex < 0) continue;
      for (const row of table.querySelectorAll('tbody tr')) {
        const cells = [...row.querySelectorAll('td')];
        if (qIndex >= cells.length) continue;
        const q = parseNumber(cells[qIndex]?.textContent);
        if (q == null) continue;
        tested += 1;
        if (q <= 0.05) primary += 1;
        else if (q <= 0.10) exploratoryOnly += 1;
      }
    }
    return { tested, primary, exploratoryOnly };
  }

  function render() {
    const results = document.querySelector('[data-testid="multiomics-results"]');
    if (!results) return;
    const anchor = document.querySelector('[data-testid="multiomics-scientific-summary"]')
      || document.querySelector('[data-testid="multiomics-result-reading-guide"]')
      || document.querySelector('[data-testid="multiomics-plain-readiness"]');
    if (!anchor) return;

    let panel = document.querySelector('[data-testid="multiomics-fdr-policy"]');
    if (!panel) {
      panel = document.createElement('section');
      panel.dataset.testid = 'multiomics-fdr-policy';
      panel.className = 'multiomics-fdr-policy';
      anchor.insertAdjacentElement('afterend', panel);
    }

    const language = lang();
    const counts = displayedFdrCounts();
    const state = `${language}|${counts.tested}|${counts.primary}|${counts.exploratoryOnly}`;
    if (panel.dataset.state === state) return;

    if (language === 'en') {
      panel.innerHTML = `
        <div class="fdr-policy-head"><span>Multiple-testing policy</span><h3>Two FDR levels, with different meanings</h3></div>
        <div class="fdr-policy-grid">
          <article><strong>Primary evidence · q ≤ 0.05</strong><p>Used for the conservative result summary. A low q-value must still be interpreted with effect size, direction, confidence interval/precision and study design.</p></article>
          <article><strong>Exploratory evidence · 0.05 &lt; q ≤ 0.10</strong><p>Kept as a hypothesis-generating signal only. It should not be reported as equivalent to the primary FDR threshold.</p></article>
          <article><strong>Raw p-values</strong><p>Never used alone to select features from thousands of tests. Benjamini–Hochberg q/FDR values are the feature-wise multiplicity summary used by this tool.</p></article>
        </div>
        <p class="fdr-policy-count">${counts.tested ? `${counts.primary} displayed row(s) meet q ≤ 0.05; ${counts.exploratoryOnly} additional row(s) fall in 0.05 < q ≤ 0.10.` : 'No displayed feature-wise q/FDR table is applicable to this route.'}</p>
        <small>FDR control is a property of a family of tests under its assumptions; a q-value is not the probability that one individual biological hypothesis is false.</small>
      `;
    } else {
      panel.innerHTML = `
        <div class="fdr-policy-head"><span>Politique de tests multiples</span><h3>Deux niveaux de FDR, avec deux sens différents</h3></div>
        <div class="fdr-policy-grid">
          <article><strong>Preuve principale · q ≤ 0,05</strong><p>Utilisée pour le résumé conservateur. Une faible q-value doit toujours être lue avec la taille et le sens de l’effet, son incertitude et le plan d’étude.</p></article>
          <article><strong>Signal exploratoire · 0,05 &lt; q ≤ 0,10</strong><p>Conservé uniquement pour générer des hypothèses. Il ne doit pas être présenté comme équivalent au seuil FDR principal.</p></article>
          <article><strong>p-values brutes</strong><p>Elles ne sont jamais utilisées seules pour sélectionner des variables parmi des milliers de tests. L’outil utilise les q/FDR de Benjamini–Hochberg pour résumer la multiplicité.</p></article>
        </div>
        <p class="fdr-policy-count">${counts.tested ? `${counts.primary} ligne(s) affichée(s) satisfont q ≤ 0,05 ; ${counts.exploratoryOnly} ligne(s) supplémentaire(s) se situent entre 0,05 et 0,10.` : 'Aucun tableau feature-by-feature avec q/FDR affiché n’est applicable à cette route.'}</p>
        <small>Le contrôle du FDR concerne une famille de tests sous ses hypothèses ; une q-value n’est pas la probabilité qu’une hypothèse biologique individuelle soit fausse.</small>
      `;
    }
    panel.dataset.state = state;
  }

  function style() {
    if (document.getElementById('multiomics-fdr-policy-style')) return;
    const node = document.createElement('style');
    node.id = 'multiomics-fdr-policy-style';
    node.textContent = `
      .multiomics-fdr-policy{margin:14px 0 18px;padding:15px;border:1px solid var(--border-subtle,#d4d4d4);border-radius:11px;background:var(--bg-primary,#fff)}
      .fdr-policy-head span{display:block;font-size:.74rem;text-transform:uppercase;letter-spacing:.08em;color:var(--text-secondary,#666)}
      .fdr-policy-head h3{margin:4px 0 11px;font-size:1.02rem}
      .fdr-policy-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
      .fdr-policy-grid article{padding:11px;border:1px solid var(--border-subtle,#ddd);border-radius:9px;background:var(--bg-secondary,#f7f7f7)}
      .fdr-policy-grid p{margin:5px 0 0;font-size:.87rem;line-height:1.42;color:var(--text-secondary,#555)}
      .fdr-policy-count{margin:11px 0 5px;font-weight:700}.multiomics-fdr-policy>small{display:block;color:var(--text-secondary,#555);line-height:1.4}
      @media(max-width:850px){.fdr-policy-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(node);
  }

  let queued = false;
  function refresh() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      style();
      render();
    });
  }

  const observer = new MutationObserver(refresh);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['lang'] });
  document.addEventListener('change', refresh);
  window.addEventListener('pmx-multiomics-analysis', refresh);
  document.addEventListener('DOMContentLoaded', refresh, { once: true });
  refresh();
})();
