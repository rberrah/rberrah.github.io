(() => {
  if (!window.location.pathname.includes('/multiomics/tool')) return;

  const language = () => document.documentElement.lang === 'en' ? 'en' : 'fr';

  function renderRunReadiness() {
    const runButton = document.querySelector('[data-testid="multiomics-run"]');
    if (!(runButton instanceof HTMLButtonElement)) return;
    const runBox = runButton.closest('.run-box');
    if (!runBox) return;
    const section = runBox.closest('section');
    const status = section?.querySelector('.status');
    if (!status) return;

    let panel = document.querySelector('[data-testid="multiomics-run-readiness"]');
    if (!panel) {
      panel = document.createElement('section');
      panel.className = 'licence-run-readiness';
      panel.dataset.testid = 'multiomics-run-readiness';
      runBox.insertAdjacentElement('beforebegin', panel);
    }

    const lang = language();
    const ready = !runButton.disabled;
    const statusTitle = status.querySelector('strong')?.textContent?.trim() || '';
    const statusMessage = status.querySelector('span')?.textContent?.trim() || '';
    const state = `${lang}|${ready}|${statusTitle}|${statusMessage}`;
    if (panel.dataset.state === state) return;

    panel.innerHTML = `
      <div class="licence-run-head">
        <div><span>${lang === 'en' ? 'Before running' : 'Avant de lancer'}</span><h3>${lang === 'en' ? 'Is the analysis ready?' : 'L’analyse est-elle prête ?'}</h3></div>
        <b class="${ready ? 'ready' : 'todo'}">${ready ? (lang === 'en' ? 'Ready to analyse' : 'Prêt à analyser') : (lang === 'en' ? 'To complete' : 'À compléter')}</b>
      </div>
      <p><strong>${statusTitle}</strong> — ${statusMessage}</p>
      <div class="licence-run-rules">
        <span>${lang === 'en' ? 'The tool unlocks the analysis only when:' : 'L’outil débloque l’analyse seulement lorsque :'}</span>
        <ul>
          <li>${lang === 'en' ? 'at least two omics layers are loaded — two layers are enough for a multi-omics analysis;' : 'au moins deux couches omiques sont chargées — deux couches suffisent pour une analyse multi-omique ;'}</li>
          <li>${lang === 'en' ? 'subject, specimen and assay identifiers connect the sample sheet to the matrices;' : 'les identifiants sujet, prélèvement et mesure relient correctement le tableau des échantillons aux matrices ;'}</li>
          <li>${lang === 'en' ? 'the variables required by the chosen biological question are declared;' : 'les variables nécessaires à la question biologique choisie sont déclarées ;'}</li>
          <li>${lang === 'en' ? 'the declared study design is supported and has no deterministic blocking confounding.' : 'le plan d’étude déclaré est pris en charge et ne présente pas de confusion déterministe bloquante.'}</li>
        </ul>
      </div>
      <small>${ready
        ? (lang === 'en' ? 'All mandatory structural checks have passed. Quality warnings may still appear after computation and must be interpreted.' : 'Tous les contrôles structurels obligatoires sont passés. Des avertissements de qualité peuvent encore apparaître après calcul et devront être interprétés.')
        : (lang === 'en' ? 'The sentence above tells you the next blocking item to fix.' : 'La phrase ci-dessus indique le prochain élément bloquant à corriger.')}</small>
    `;
    panel.dataset.state = state;
  }

  function installStyle() {
    if (document.getElementById('multiomics-run-readiness-style')) return;
    const style = document.createElement('style');
    style.id = 'multiomics-run-readiness-style';
    style.textContent = `
      .licence-run-readiness{margin:14px 0 18px;padding:15px;border:1px solid var(--border-subtle,#d4d4d4);border-radius:11px;background:var(--bg-secondary,#f7f7f7)}
      .licence-run-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px}.licence-run-head span{display:block;font-size:.74rem;text-transform:uppercase;letter-spacing:.08em;color:var(--text-secondary,#666)}.licence-run-head h3{margin:4px 0 0;font-size:1.02rem}.licence-run-head>b{border:1px solid var(--border-subtle,#ccc);border-radius:999px;padding:5px 9px;font-size:.8rem;white-space:nowrap}.licence-run-head>b.ready{font-weight:800}.licence-run-readiness>p{margin:10px 0;line-height:1.45}
      .licence-run-rules{display:grid;grid-template-columns:minmax(160px,.5fr) 1.5fr;gap:12px;align-items:start}.licence-run-rules>span{font-weight:700;font-size:.9rem}.licence-run-rules ul{margin:0;padding-left:18px}.licence-run-rules li{margin:0 0 5px;font-size:.88rem;line-height:1.4}.licence-run-readiness>small{display:block;margin-top:8px;color:var(--text-secondary,#555);line-height:1.4}
      @media(max-width:760px){.licence-run-head{flex-direction:column}.licence-run-rules{grid-template-columns:1fr}.licence-run-head>b{white-space:normal}}
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
      renderRunReadiness();
    });
  }

  const observer = new MutationObserver(refresh);
  observer.observe(document.documentElement, { childList:true, subtree:true, attributes:true, attributeFilter:['lang','disabled'] });
  document.addEventListener('change', refresh);
  document.addEventListener('DOMContentLoaded', refresh, { once:true });
  refresh();
})();
