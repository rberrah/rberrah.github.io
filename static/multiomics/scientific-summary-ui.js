(() => {
  if (!window.location.pathname.includes('/multiomics/tool')) return;

  const lang = () => document.documentElement.lang === 'en' ? 'en' : 'fr';
  const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

  function selectContaining(value) {
    const option = [...document.querySelectorAll('select option')].find((item) => item.value === value);
    return option?.parentElement instanceof HTMLSelectElement ? option.parentElement : null;
  }

  function objective() {
    return selectContaining('explore')?.value || 'explore';
  }

  function design() {
    return selectContaining('crossover')?.value || 'independent';
  }

  function endpoint() {
    return selectContaining('survival')?.value || 'none';
  }

  function parseNumeric(text) {
    const normalised = clean(text).replace(',', '.').replace(/[^0-9eE+\-.]/g, '');
    if (!normalised) return null;
    const value = Number(normalised);
    return Number.isFinite(value) ? value : null;
  }

  function qColumnIndex(headers) {
    const patterns = [
      /^q$/i,
      /q\s*bh/i,
      /fdr/i,
      /padj/i,
      /adj\.?\s*p/i,
      /adjusted\s*p/i,
      /q[-_ ]?value/i
    ];
    return headers.findIndex((header) => patterns.some((pattern) => pattern.test(header)));
  }

  function effectColumnIndex(headers) {
    const patterns = [
      /log2\s*fc/i,
      /log\s*fc/i,
      /fold\s*(change|ratio)/i,
      /^effect$/i,
      /^estimate$/i,
      /delta|Δ/i,
      /coefficient/i
    ];
    return headers.findIndex((header) => patterns.some((pattern) => pattern.test(header)));
  }

  function tableLabel(table, index) {
    const container = table.closest('section,article,div');
    const heading = container?.querySelector('h2,h3,h4,strong');
    return clean(heading?.textContent) || `table_${index + 1}`;
  }

  function collectStatisticalEvidence() {
    const results = document.querySelector('[data-testid="multiomics-results"]');
    if (!results) return [];
    const tables = [...results.querySelectorAll('table')];
    const evidence = [];

    tables.forEach((table, tableIndex) => {
      const headers = [...table.querySelectorAll('thead th')].map((node) => clean(node.textContent));
      if (!headers.length) return;
      const qIndex = qColumnIndex(headers);
      if (qIndex < 0) return;
      const effectIndex = effectColumnIndex(headers);
      const rows = [...table.querySelectorAll('tbody tr')];
      let tested = 0;
      let significant = 0;
      let positive = 0;
      let negative = 0;

      for (const row of rows) {
        const cells = [...row.querySelectorAll('td')];
        if (qIndex >= cells.length) continue;
        const q = parseNumeric(cells[qIndex]?.textContent);
        if (q == null) continue;
        tested += 1;
        if (q <= 0.05) {
          significant += 1;
          if (effectIndex >= 0 && effectIndex < cells.length) {
            const effect = parseNumeric(cells[effectIndex]?.textContent);
            if (effect != null) {
              if (effect > 0) positive += 1;
              if (effect < 0) negative += 1;
            }
          }
        }
      }

      evidence.push({
        label: tableLabel(table, tableIndex),
        qHeader: headers[qIndex],
        displayedRowsWithQ: tested,
        significantDisplayedRows: significant,
        positiveSignificantDisplayedRows: positive,
        negativeSignificantDisplayedRows: negative
      });
    });
    return evidence;
  }

  function collectVisibleWarnings() {
    const results = document.querySelector('[data-testid="multiomics-results"]');
    if (!results) return [];
    const selectors = [
      '.warning', '.error', '.alert', '.caution',
      '[role="alert"]', '.status.warn', '.status.error'
    ];
    const values = [];
    for (const node of results.querySelectorAll(selectors.join(','))) {
      const text = clean(node.textContent);
      if (text && text.length <= 500) values.push(text);
    }
    return [...new Set(values)].slice(0, 20);
  }

  function confidenceAssessment(evidence, warnings) {
    const readiness = clean(document.querySelector('[data-testid="multiomics-plain-readiness"]')?.textContent);
    const lower = `${readiness} ${warnings.join(' ')}`.toLowerCase();
    const blockingTokens = [
      'confond', 'impossible', 'bloqu', 'rank-deficient', 'rank deficient',
      'not identifiable', 'non identifiable', 'incompatible'
    ];
    const cautionTokens = [
      'prudence', 'attention', 'warning', 'caution', 'incomplet', 'missing',
      'manquant', 'faible', 'insufficient', 'exploratoire', 'exploratory'
    ];
    if (blockingTokens.some((token) => lower.includes(token))) return 'review_required';
    if (warnings.length || cautionTokens.some((token) => lower.includes(token))) return 'caution';
    if (!evidence.length) return 'descriptive';
    return 'interpretable';
  }

  function confidenceCopy(language, status) {
    const copy = {
      fr: {
        interpretable: ['Interprétable', 'Aucun signal d’alerte méthodologique visible n’a été détecté dans le résumé affiché. Cela ne prouve ni une puissance suffisante ni une validité externe.'],
        caution: ['Interpréter avec prudence', 'L’analyse peut être informative, mais au moins une limite de qualité, d’effectif, de recouvrement ou de structure doit rester visible dans la conclusion.'],
        review_required: ['Revue méthodologique requise', 'Une incompatibilité ou une confusion potentiellement bloquante est visible. Les conclusions biologiques ne doivent pas être mises en avant avant correction ou justification.'],
        descriptive: ['Exploratoire', 'Cette route ne fournit pas nécessairement de tests feature-by-feature avec FDR. Interprétez la structure et les associations comme descriptives.']
      },
      en: {
        interpretable: ['Interpretable', 'No visible methodological alert was detected in the displayed summary. This does not prove adequate power or external validity.'],
        caution: ['Interpret with caution', 'The analysis may be informative, but at least one quality, sample-size, overlap or design limitation should remain visible in the conclusion.'],
        review_required: ['Methodological review required', 'A potentially blocking incompatibility or confounding issue is visible. Biological conclusions should not be emphasised before correction or justification.'],
        descriptive: ['Exploratory', 'This route does not necessarily produce feature-wise FDR tests. Interpret structure and associations descriptively.']
      }
    };
    return copy[language][status] || copy[language].descriptive;
  }

  function conclusionFor(language, currentObjective, evidence) {
    const totalDisplayed = evidence.reduce((sum, item) => sum + item.displayedRowsWithQ, 0);
    const significant = evidence.reduce((sum, item) => sum + item.significantDisplayedRows, 0);
    const positive = evidence.reduce((sum, item) => sum + item.positiveSignificantDisplayedRows, 0);
    const negative = evidence.reduce((sum, item) => sum + item.negativeSignificantDisplayedRows, 0);

    const noEvidence = language === 'en'
      ? 'No feature-wise adjusted-q/FDR table is visible for this route. Read the multivariate structure, quality checks and pathway evidence instead of looking for a single “significant” variable.'
      : 'Aucun tableau feature-by-feature avec q/FDR ajusté n’est visible pour cette route. Lisez plutôt la structure multivariée, les contrôles qualité et les voies biologiques que la recherche d’une seule variable « significative ».';

    if (!evidence.length) return noEvidence;
    if (language === 'en') {
      const direction = (positive || negative) ? ` Among those significant displayed rows, ${positive} have a positive displayed effect and ${negative} a negative displayed effect.` : '';
      const base = `${significant} of ${totalDisplayed} displayed rows with an adjusted q/FDR value meet q/FDR ≤ 0.05.${direction}`;
      if (currentObjective === 'groups') return `${base} These are group-associated differences after the declared adjustments; they are not proof of causality.`;
      if (currentObjective === 'outcome') return `${base} These are endpoint associations; predictive performance must be read from held-out/cross-validated estimates, not from these q-values.`;
      if (currentObjective === 'time') return `${base} These are time- or trajectory-associated effects; temporal association alone is not causal evidence.`;
      return `${base} Corrected feature-wise evidence should be interpreted together with cross-omics convergence and data quality.`;
    }

    const direction = (positive || negative) ? ` Parmi ces lignes affichées significatives, ${positive} ont un effet affiché positif et ${negative} un effet négatif.` : '';
    const base = `${significant} lignes sur ${totalDisplayed} affichant un q/FDR ajusté satisfont q/FDR ≤ 0,05.${direction}`;
    if (currentObjective === 'groups') return `${base} Il s’agit de différences associées aux groupes après les ajustements déclarés ; ce n’est pas une preuve de causalité.`;
    if (currentObjective === 'outcome') return `${base} Il s’agit d’associations au critère ; la performance prédictive doit être lue sur les estimations hors-échantillon/validation croisée, pas sur ces q-values.`;
    if (currentObjective === 'time') return `${base} Il s’agit d’effets associés au temps ou aux trajectoires ; une association temporelle n’est pas une preuve causale.`;
    return `${base} Ces preuves corrigées doivent être interprétées avec la convergence entre omiques et la qualité des données.`;
  }

  function methodologicalRules(language) {
    const currentObjective = objective();
    const items = [];
    items.push(language === 'en'
      ? ['Biological independence', 'Technical repeats are not counted as new biological subjects; sample/subject identifiers define the experimental unit.']
      : ['Indépendance biologique', 'Les répétitions techniques ne sont pas comptées comme de nouveaux sujets biologiques ; les identifiants prélèvement/sujet définissent l’unité expérimentale.']);
    items.push(language === 'en'
      ? ['Multiple testing', 'Feature-wise inference is read with adjusted q/FDR values rather than raw p-values alone.']
      : ['Tests multiples', 'L’inférence feature-by-feature se lit avec les q/FDR ajustés et non avec les seules p-values brutes.']);
    items.push(language === 'en'
      ? ['Technical structure', 'Known technical series are checked because a technical series completely confounded with a biological group cannot be statistically separated from that group.']
      : ['Structure technique', 'Les séries techniques connues sont vérifiées car une série totalement confondue avec un groupe biologique ne peut pas être séparée statistiquement de ce groupe.']);
    items.push(language === 'en'
      ? ['Cross-omics matching', 'Subject-level integration uses the actual overlap between layers; absent layers are not silently invented.']
      : ['Appariement inter-omique', 'L’intégration au niveau sujet utilise le chevauchement réel entre couches ; les omiques absentes ne sont pas inventées silencieusement.']);
    if (currentObjective === 'outcome') {
      items.push(language === 'en'
        ? ['Prediction', 'Model selection and reported performance must stay separated: performance is interpreted from held-out or nested-cross-validation estimates.']
        : ['Prédiction', 'La sélection du modèle et l’évaluation de sa performance restent séparées : la performance s’interprète sur des estimations hors-échantillon ou issues d’une validation croisée imbriquée.']);
    }
    return items;
  }

  function controlSnapshot() {
    const controls = [...document.querySelectorAll('main select, main input, main textarea')];
    const output = [];
    controls.forEach((control, index) => {
      if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement)) return;
      if (control.type === 'file') return;
      if (control.type === 'button' || control.type === 'submit' || control.type === 'reset') return;
      const id = control.id || '';
      const name = control.name || '';
      const label = id ? clean(document.querySelector(`label[for="${CSS.escape(id)}"]`)?.textContent) : '';
      let value;
      if (control instanceof HTMLInputElement && ['checkbox','radio'].includes(control.type)) value = control.checked;
      else value = control.value;
      if (value === '' || value == null) return;
      output.push({
        key: name || id || label || `control_${index + 1}`,
        label: label || null,
        value
      });
    });
    return output;
  }

  function fileSnapshot() {
    const inputs = [...document.querySelectorAll('main input[type="file"]')];
    return inputs.flatMap((input, inputIndex) => {
      const id = input.id || '';
      const label = id ? clean(document.querySelector(`label[for="${CSS.escape(id)}"]`)?.textContent) : '';
      return [...(input.files || [])].map((file) => ({
        input: input.name || id || label || `file_input_${inputIndex + 1}`,
        name: file.name,
        size_bytes: file.size,
        last_modified_iso: Number.isFinite(file.lastModified) ? new Date(file.lastModified).toISOString() : null,
        type: file.type || null
      }));
    });
  }

  function resultHeadingSnapshot() {
    const results = document.querySelector('[data-testid="multiomics-results"]');
    if (!results) return [];
    return [...results.querySelectorAll('h2,h3,h4')].map((node) => clean(node.textContent)).filter(Boolean);
  }

  function buildManifest() {
    const evidence = collectStatisticalEvidence();
    const warnings = collectVisibleWarnings();
    const readiness = clean(document.querySelector('[data-testid="multiomics-plain-readiness"]')?.textContent);
    return {
      schema: 'pmx-explain-multiomics-reproducibility-manifest/v1',
      generated_at: new Date().toISOString(),
      application: {
        name: 'PMx Explain Multi-omics',
        page: window.location.pathname,
        origin: window.location.origin,
        language: lang()
      },
      scientific_question: {
        objective: objective(),
        design: design(),
        endpoint_type: endpoint()
      },
      controls: controlSnapshot(),
      input_files: fileSnapshot(),
      displayed_statistical_evidence: evidence,
      visible_warnings: warnings,
      visible_readiness_summary: readiness || null,
      result_sections: resultHeadingSnapshot(),
      reproducibility_notes: [
        'This manifest records interface choices and local file metadata, not the content of the input files.',
        'Retain the original immutable input files and their checksums in the study archive.',
        'A corrected q/FDR value is not a causal claim.',
        'Cross-validated performance is internal validation unless an external cohort was used.',
        'Advanced latent/supervised integration requires method-specific assumptions and should be reported with tuning/validation details.'
      ]
    };
  }

  function manifestMarkdown(manifest) {
    const lines = [];
    lines.push('# PMx Explain multi-omics — reproducibility report', '');
    lines.push(`Generated: ${manifest.generated_at}`);
    lines.push(`Objective: ${manifest.scientific_question.objective}`);
    lines.push(`Design: ${manifest.scientific_question.design}`);
    lines.push(`Endpoint type: ${manifest.scientific_question.endpoint_type}`, '');
    lines.push('## Interface parameters', '');
    for (const item of manifest.controls) lines.push(`- ${item.label || item.key}: ${String(item.value)}`);
    lines.push('', '## Input files', '');
    if (!manifest.input_files.length) lines.push('- No browser file metadata available (for example, the built-in demo may have been used).');
    for (const file of manifest.input_files) lines.push(`- ${file.input}: ${file.name} (${file.size_bytes} bytes; modified ${file.last_modified_iso || 'unknown'})`);
    lines.push('', '## Displayed adjusted evidence', '');
    if (!manifest.displayed_statistical_evidence.length) lines.push('- No visible feature-wise q/FDR table was detected for this route.');
    for (const table of manifest.displayed_statistical_evidence) {
      lines.push(`- ${table.label}: ${table.significantDisplayedRows}/${table.displayedRowsWithQ} displayed rows with ${table.qHeader} ≤ 0.05.`);
    }
    lines.push('', '## Visible warnings / cautions', '');
    if (!manifest.visible_warnings.length) lines.push('- None detected in visible alert elements.');
    for (const warning of manifest.visible_warnings) lines.push(`- ${warning}`);
    lines.push('', '## Reproducibility requirements', '');
    for (const note of manifest.reproducibility_notes) lines.push(`- ${note}`);
    lines.push('', '## Interpretation boundary', '');
    lines.push('This report separates observed data, statistical inference, prediction and causal interpretation. Statistical significance or multivariate separation alone does not establish causality or external validity.');
    return lines.join('\n');
  }

  function download(name, text, type) {
    const href = URL.createObjectURL(new Blob([text], { type }));
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  }

  function attachDownloadHandlers(panel) {
    panel.querySelector('[data-export-manifest-json]')?.addEventListener('click', () => {
      const manifest = buildManifest();
      download('multiomics-reproducibility-manifest.json', JSON.stringify(manifest, null, 2), 'application/json;charset=utf-8');
    });
    panel.querySelector('[data-export-method-report]')?.addEventListener('click', () => {
      const manifest = buildManifest();
      download('multiomics-methods-report.md', manifestMarkdown(manifest), 'text/markdown;charset=utf-8');
    });
  }

  function render() {
    const results = document.querySelector('[data-testid="multiomics-results"]');
    if (!results) return;
    const readingGuide = document.querySelector('[data-testid="multiomics-result-reading-guide"]');
    const readiness = document.querySelector('[data-testid="multiomics-plain-readiness"]');
    const anchor = readingGuide || readiness || results.firstElementChild || results;

    let panel = document.querySelector('[data-testid="multiomics-scientific-summary"]');
    if (!panel) {
      panel = document.createElement('section');
      panel.className = 'scientific-summary';
      panel.dataset.testid = 'multiomics-scientific-summary';
      anchor.insertAdjacentElement('afterend', panel);
    }

    const language = lang();
    const evidence = collectStatisticalEvidence();
    const warnings = collectVisibleWarnings();
    const confidence = confidenceAssessment(evidence, warnings);
    const [confidenceTitle, confidenceText] = confidenceCopy(language, confidence);
    const conclusion = conclusionFor(language, objective(), evidence);
    const rules = methodologicalRules(language);
    const evidenceSignature = JSON.stringify(evidence);
    const warningSignature = JSON.stringify(warnings);
    const state = `${language}|${objective()}|${design()}|${endpoint()}|${confidence}|${evidenceSignature}|${warningSignature}`;
    if (panel.dataset.state === state) return;

    const evidenceHtml = evidence.length
      ? evidence.map((item) => `<li><strong>${item.label}</strong><span>${item.significantDisplayedRows}/${item.displayedRowsWithQ} ${language === 'en' ? 'displayed rows with' : 'lignes affichées avec'} ${item.qHeader} ≤ 0.05</span></li>`).join('')
      : `<li><strong>${language === 'en' ? 'No visible feature-wise FDR table' : 'Aucun tableau FDR feature-by-feature visible'}</strong><span>${language === 'en' ? 'This can be normal for exploratory multivariate routes.' : 'Cela peut être normal pour une route multivariée exploratoire.'}</span></li>`;

    const rulesHtml = rules.map(([title, text]) => `<article><strong>${title}</strong><span>${text}</span></article>`).join('');
    const cautionHtml = warnings.length
      ? `<details><summary>${language === 'en' ? 'Visible warnings to retain in the report' : 'Avertissements visibles à conserver dans le rapport'}</summary><ul>${warnings.map((warning) => `<li>${warning}</li>`).join('')}</ul></details>`
      : '';

    panel.innerHTML = `
      <div class="scientific-summary-head">
        <div><span>${language === 'en' ? 'Scientific synthesis' : 'Synthèse scientifique'}</span><h3>${language === 'en' ? 'What do these results actually support?' : 'Que permettent réellement de conclure ces résultats ?'}</h3></div>
        <b class="confidence ${confidence}">${confidenceTitle}</b>
      </div>
      <p class="scientific-conclusion">${conclusion}</p>
      <p class="scientific-confidence">${confidenceText}</p>
      <div class="scientific-summary-grid">
        <article><span>${language === 'en' ? 'Adjusted evidence visible in the results' : 'Preuves corrigées visibles dans les résultats'}</span><ul>${evidenceHtml}</ul></article>
        <article><span>${language === 'en' ? 'Interpretation boundary' : 'Frontière d’interprétation'}</span><p>${language === 'en' ? 'Association ≠ prediction ≠ causality. A pathway enrichment organises evidence; it does not prove pathway activation. Internal cross-validation does not replace validation in an independent cohort.' : 'Association ≠ prédiction ≠ causalité. Un enrichissement de voie organise les preuves ; il ne prouve pas l’activation de la voie. Une validation croisée interne ne remplace pas une validation dans une cohorte indépendante.'}</p></article>
      </div>
      ${cautionHtml}
      <details class="methodology-checklist"><summary>${language === 'en' ? 'Why the statistical route is defensible' : 'Pourquoi la route statistique est défendable'}</summary><div>${rulesHtml}</div></details>
      <div class="reproducibility-export" data-testid="multiomics-methods-manifest">
        <div><strong>${language === 'en' ? 'Reproduce and report the analysis' : 'Reproduire et rapporter l’analyse'}</strong><span>${language === 'en' ? 'Export the choices, local file metadata, visible adjusted evidence and interpretation limits. Input data themselves are not embedded.' : 'Exportez les choix, les métadonnées locales des fichiers, les preuves corrigées visibles et les limites d’interprétation. Les données elles-mêmes ne sont pas intégrées.'}</span></div>
        <div class="reproducibility-actions"><button type="button" data-export-method-report>${language === 'en' ? 'Methods report (.md)' : 'Rapport méthodes (.md)'}</button><button type="button" data-export-manifest-json>${language === 'en' ? 'Manifest (.json)' : 'Manifeste (.json)'}</button></div>
      </div>
    `;
    panel.dataset.state = state;
    attachDownloadHandlers(panel);
  }

  function installStyle() {
    if (document.getElementById('multiomics-scientific-summary-style')) return;
    const style = document.createElement('style');
    style.id = 'multiomics-scientific-summary-style';
    style.textContent = `
      .scientific-summary{margin:18px 0;padding:18px;border:1px solid var(--border-strong,#c9c9c9);border-radius:12px;background:var(--bg-primary,#fff)}
      .scientific-summary-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px}.scientific-summary-head>div>span{display:block;font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;color:var(--text-secondary,#666)}.scientific-summary-head h3{margin:4px 0 0;font-size:1.1rem}.scientific-summary .confidence{border:1px solid var(--border-subtle,#ccc);border-radius:999px;padding:5px 9px;font-size:.8rem;white-space:nowrap}.scientific-summary .confidence.review_required{font-weight:800}.scientific-conclusion{font-size:1rem;line-height:1.55;margin:14px 0 6px}.scientific-confidence{font-size:.9rem;color:var(--text-secondary,#555);line-height:1.5;margin:0 0 14px}.scientific-summary-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.scientific-summary-grid>article{padding:12px;border:1px solid var(--border-subtle,#ddd);border-radius:9px;background:var(--bg-secondary,#f7f7f7)}.scientific-summary-grid>article>span{font-weight:700}.scientific-summary-grid p{margin:7px 0 0;font-size:.89rem;line-height:1.48}.scientific-summary-grid ul{margin:8px 0 0;padding-left:18px}.scientific-summary-grid li{margin:0 0 6px}.scientific-summary-grid li strong,.scientific-summary-grid li span{display:block}.scientific-summary-grid li span{font-size:.84rem;color:var(--text-secondary,#555)}
      .scientific-summary details{margin-top:11px;border-top:1px solid var(--border-subtle,#ddd);padding-top:10px}.scientific-summary summary{cursor:pointer;font-weight:700}.methodology-checklist>div{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:9px}.methodology-checklist article{padding:10px;border:1px solid var(--border-subtle,#ddd);border-radius:8px}.methodology-checklist article strong,.methodology-checklist article span{display:block}.methodology-checklist article span{margin-top:4px;font-size:.85rem;line-height:1.42;color:var(--text-secondary,#555)}
      .reproducibility-export{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-top:14px;padding:12px;border:1px solid var(--border-subtle,#ddd);border-radius:9px;background:var(--bg-secondary,#f7f7f7)}.reproducibility-export>div:first-child strong,.reproducibility-export>div:first-child span{display:block}.reproducibility-export>div:first-child span{margin-top:4px;max-width:70ch;font-size:.85rem;line-height:1.4;color:var(--text-secondary,#555)}.reproducibility-actions{display:flex;gap:8px;flex-wrap:wrap}.reproducibility-actions button{white-space:nowrap}
      @media(max-width:820px){.scientific-summary-head,.reproducibility-export{flex-direction:column;align-items:stretch}.scientific-summary-grid,.methodology-checklist>div{grid-template-columns:1fr}.scientific-summary .confidence{white-space:normal;align-self:flex-start}}
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
  document.addEventListener('change', refresh);
  document.addEventListener('DOMContentLoaded', refresh, { once: true });
  refresh();
})();
