<script>
  import { base } from '$app/paths';
  import { tdmModels, tdmModelStats } from '$lib/content/tdmModels';
  import { tdmEngineUrl } from '$lib/tdm/engine';

  let query = $state('');
  let selectedDrug = $state('all');

  const repoIssueUrl = 'https://github.com/rberrah/rberrah.github.io/issues/new?template=tdm-model.yml';
  const tdmxUrl = 'https://www.tdmx.eu/';
  /** @param {{ doi?: string | null, sourceUrl?: string | null }} model */
  const articleHref = (model) => model.doi ? `https://doi.org/${model.doi}` : model.sourceUrl;
  let drugs = $derived(['all', ...Array.from(new Set(tdmModels.map((model) => model.drug))).sort()]);
  let filteredModels = $derived(
    tdmModels.filter((model) => {
      const haystack = [
        model.drug,
        model.model,
        model.file,
        model.format,
        model.citation,
        model.doi,
        model.population,
        ...model.tags
      ].filter(Boolean).join(' ').toLowerCase();
      const matchesQuery = haystack.includes(query.trim().toLowerCase());
      const matchesDrug = selectedDrug === 'all' || model.drug === selectedDrug;
      return matchesQuery && matchesDrug;
    })
  );
</script>

<svelte:head>
  <title>TDM et bibliotheque PopPK | Pharmacometrie Pratique</title>
  <meta
    name="description"
    content="Bibliotheque partagee de modeles PopPK pour le suivi therapeutique pharmacologique et la precision dosing."
  />
</svelte:head>

<section class="tdm-hero">
  <div class="hero-copy">
    <p class="eyebrow">Therapeutic drug monitoring</p>
    <h1>Precision dosing avec mrgsolve, mapbayr et model averaging.</h1>
    <p class="lede">
      Selectionnez un modele PopPK, renseignez les administrations, concentrations et covariables, puis
      estimez les parametres individuels et comparez les schemas de dose dans le moteur R. Plusieurs
      modeles peuvent etre combines par ponderation AIC ou vraisemblance.
    </p>
    <div class="cta">
      <a class="btn btn-primary" href={tdmEngineUrl} target="_blank" rel="noopener noreferrer">Lancer le moteur R</a>
      <a class="btn btn-outline" href="#modeles">Choisir un modele</a>
      <a class="btn btn-outline" href={`${base}/lego/`}>Creer un modele sans coder</a>
      <a class="btn btn-outline" href={repoIssueUrl} target="_blank" rel="noopener noreferrer">Proposer un modele</a>
    </div>
  </div>

  <div class="tdm-panel" aria-label="Resume de la bibliotheque TDM">
    <div class="panel-top">
      <span class="status-dot"></span>
      <span>Moteur R + bibliotheque ouverte</span>
    </div>
    <div class="stat-grid">
      <div>
        <strong>{tdmModelStats.total}</strong>
        <span>modeles</span>
      </div>
      <div>
        <strong>{tdmModelStats.drugs}</strong>
        <span>molecules</span>
      </div>
      <div>
        <strong>MAP</strong>
        <span>Bayesien</span>
      </div>
    </div>
    <p>
      Le calcul s'execute dans une application Shiny separee avec <code>mrgsolve</code> et
      <code>mapbayr</code>. Les donnees patient et les modeles C++ colles restent limites a la session
      de calcul et ne sont pas conserves par le site.
    </p>
  </div>
</section>

<section class="engine-band" aria-labelledby="engine-title">
  <div>
    <p class="eyebrow">Moteur pharmacometrique</p>
    <h2 id="engine-title">Du dosage observe a la proposition de dose</h2>
  </div>
  <div class="engine-features">
    <span>Estimation MAP individuelle</span>
    <span>Predictions population et individuelles</span>
    <span>AUC24, Cmin et Cmax</span>
    <span>Grille dose x intervalle</span>
    <span>Model averaging AIC ou LL</span>
    <span>Modele mrgsolve/C++ personnalise</span>
    <span>Import et export local du dossier JSON</span>
  </div>
</section>

<section class="workflow" aria-labelledby="workflow-title">
  <div>
    <p class="eyebrow">Contribution</p>
    <h2 id="workflow-title">Possible, mais pas en push direct depuis le navigateur.</h2>
  </div>
  <div class="workflow-grid">
    <article>
      <span>1</span>
      <h3>Soumission GitHub</h3>
      <p>Le contributeur ouvre une issue structuree avec le modele, sa reference, les covariables et les limites.</p>
    </article>
    <article>
      <span>2</span>
      <h3>Validation</h3>
      <p>Le fichier est relu avant integration: unitees, compartiments, variabilite, erreur residuelle et article source.</p>
    </article>
    <article>
      <span>3</span>
      <h3>Publication</h3>
      <p>Une PR ou une action GitHub ajoute le modele a la bibliotheque statique, puis le site se redeploie.</p>
    </article>
  </div>
</section>

<section id="modeles" class="models" aria-labelledby="models-title">
  <div class="section-head">
    <div>
      <p class="eyebrow">Modeles pharmacometriques publies</p>
      <h2 id="models-title">Bibliotheque de modeles</h2>
    </div>
    <span class="muted">{filteredModels.length} / {tdmModels.length} modeles</span>
  </div>

  <div class="filters">
    <label>
      <span>Recherche</span>
      <input bind:value={query} type="search" placeholder="Molecule, auteur, fichier..." />
    </label>
    <label>
      <span>Molecule</span>
      <select bind:value={selectedDrug}>
        {#each drugs as drug}
          <option value={drug}>{drug === 'all' ? 'Toutes' : drug}</option>
        {/each}
      </select>
    </label>
  </div>

  {#if filteredModels.length}
    <div class="model-grid">
      {#each filteredModels as model}
        <article class="model-card card">
          <div class="model-main">
            <div class="model-kicker">
              <span class="drug">{model.drug}</span>
              <span class="route">{model.routes.join(' + ')}</span>
            </div>
            <h3>{model.model}</h3>
            <p class="population">{model.population}</p>
            <div class="population-tags" aria-label="Population source">
              {#each model.populationTags as tag}
                <span>{tag}</span>
              {/each}
            </div>
            <div class="article-source">
              <span>Article source</span>
              <p class="citation">{model.citation}</p>
              {#if articleHref(model)}
                <a href={articleHref(model)} target="_blank" rel="noopener noreferrer">
                  {model.doi ? `DOI ${model.doi}` : 'Consulter l’article'}
                </a>
              {:else}
                <strong>Reference bibliographique a confirmer</strong>
              {/if}
            </div>
            {#if model.note}<p class="model-note">{model.note}</p>{/if}
          </div>
          <div class="model-meta">
            <div class="model-type">
              <span>{model.modelType}</span>
            </div>
            <div class="model-actions">
              <a class="btn btn-primary sm" href={`${tdmEngineUrl}/?model=${encodeURIComponent(model.id)}`} target="_blank" rel="noopener noreferrer">Utiliser</a>
              <a class="btn btn-outline sm" href={`${base}${model.href}`} download>Telecharger</a>
            </div>
          </div>
        </article>
      {/each}
    </div>
  {:else}
    <p class="empty">Aucun modele ne correspond a ces filtres.</p>
  {/if}
</section>

<section class="governance">
  <h2>Regles minimales pour accepter un modele</h2>
  <div class="rule-grid">
    <div>Reference bibliographique identifiable</div>
    <div>Parametres typiques et unitees explicites</div>
    <div>Covariables documentees</div>
    <div>Erreur residuelle et variabilite decrites</div>
    <div>Jeu de test ou scenario de simulation</div>
    <div>Licence compatible avec une diffusion publique</div>
  </div>
</section>

<p class="reference">
  Application inspiree de <a href={tdmxUrl} target="_blank" rel="noopener noreferrer">TDMx</a>.
  Les resultats ne constituent pas une recommandation clinique et exigent une validation locale des modeles.
  Aucun dossier patient ni modele colle n'est conserve par le site.
</p>

<style>
  .tdm-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
    gap: var(--space-8);
    align-items: center;
    padding: var(--space-12) 0 var(--space-10);
    border-bottom: 1px solid var(--border-subtle);
  }
  .hero-copy { max-width: 760px; }
  h1 { font-size: var(--text-4xl); margin: var(--space-3) 0 var(--space-5); }
  .lede { color: var(--text-secondary); font-size: var(--text-lg); max-width: 68ch; }
  .cta { display: flex; flex-wrap: wrap; gap: var(--space-3); margin-top: var(--space-7); }
  .tdm-panel {
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius);
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--accent-ai) 12%, transparent), transparent 45%),
      var(--bg-tertiary);
    padding: var(--space-6);
  }
  .panel-top { display: flex; align-items: center; gap: var(--space-2); font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-secondary); }
  .status-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--accent-pd); }
  .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3); margin: var(--space-6) 0; }
  .stat-grid div { border-left: 1px solid var(--border-subtle); padding-left: var(--space-3); }
  .stat-grid strong { display: block; font-family: var(--font-heading); font-size: var(--text-2xl); line-height: 1; }
  .stat-grid span { color: var(--text-muted); font-size: var(--text-sm); }
  .tdm-panel p { color: var(--text-secondary); margin-bottom: 0; }

  .engine-band, .workflow, .models, .governance { margin-top: var(--space-12); }
  .engine-band {
    display: grid;
    grid-template-columns: minmax(240px, 0.7fr) minmax(0, 1.3fr);
    gap: var(--space-8);
    padding: var(--space-7) 0;
    border-top: 1px solid var(--border-subtle);
    border-bottom: 1px solid var(--border-subtle);
  }
  .engine-band h2 { margin: 0; }
  .engine-features { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-3); }
  .engine-features span { padding-left: var(--space-3); border-left: 2px solid var(--accent-pd); color: var(--text-secondary); }
  .workflow { display: grid; grid-template-columns: 0.55fr 1.45fr; gap: var(--space-8); }
  .workflow h2, .models h2, .governance h2 { margin-top: 0; }
  .workflow-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); }
  .workflow-grid article { border-top: 2px solid var(--accent-pk); padding-top: var(--space-4); }
  .workflow-grid span { font-family: var(--font-mono); color: var(--accent-pk); }
  .workflow-grid h3 { margin: var(--space-2) 0; font-size: var(--text-lg); }
  .workflow-grid p { color: var(--text-secondary); margin: 0; }

  .section-head { display: flex; justify-content: space-between; gap: var(--space-4); align-items: end; }
  .filters {
    display: grid;
    grid-template-columns: minmax(220px, 1fr) minmax(180px, 260px);
    gap: var(--space-4);
    margin: var(--space-6) 0;
  }
  label { display: grid; gap: var(--space-2); font-weight: 650; color: var(--text-primary); }
  label span { font-size: var(--text-sm); }
  input, select {
    width: 100%;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius);
    background: var(--bg-tertiary);
    color: var(--text-primary);
    padding: var(--space-3);
    font: inherit;
  }
  .model-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-4); }
  .model-card { display: flex; flex-direction: column; justify-content: space-between; gap: var(--space-5); min-height: 330px; }
  .model-kicker { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); }
  .drug { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--accent-pk); text-transform: uppercase; }
  .route { border-left: 2px solid var(--accent-pd); color: var(--text-secondary); font-family: var(--font-mono); font-size: var(--text-xs); padding-left: var(--space-2); }
  .model-card h3 { margin: var(--space-2) 0; }
  .model-card p { color: var(--text-muted); margin: 0; overflow-wrap: anywhere; }
  .model-card .population { color: var(--text-secondary); margin-top: var(--space-3); }
  .population-tags { display: flex; flex-wrap: wrap; gap: var(--space-2); margin: var(--space-3) 0; }
  .population-tags span { border: 1px solid var(--border-subtle); border-radius: 3px; color: var(--text-secondary); font-size: var(--text-xs); padding: 2px var(--space-2); }
  .article-source { display: grid; gap: 4px; border-left: 2px solid var(--accent-ai); margin-top: var(--space-3); padding-left: var(--space-3); }
  .article-source > span { color: var(--text-secondary); font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; }
  .article-source a, .article-source strong { font-family: var(--font-mono); font-size: var(--text-xs); overflow-wrap: anywhere; }
  .article-source strong { color: var(--accent-pd); }
  .model-card .citation { font-size: var(--text-sm); }
  .model-card .model-note { border-left: 2px solid var(--accent-pd); font-size: var(--text-xs); margin-top: var(--space-3); padding-left: var(--space-3); }
  .model-meta { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); border-top: 1px solid var(--border-subtle); padding-top: var(--space-4); }
  .model-type { display: grid; gap: 3px; min-width: 0; }
  .model-type span { color: var(--text-secondary); font-family: var(--font-mono); font-size: var(--text-xs); overflow-wrap: anywhere; }
  .model-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: var(--space-2); }
  .btn.sm { padding: var(--space-2) var(--space-4); font-size: var(--text-sm); }
  .empty { color: var(--text-secondary); padding: var(--space-8) 0; }
  .rule-grid { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid var(--border-subtle); border-left: 1px solid var(--border-subtle); }
  .rule-grid div { padding: var(--space-4); border-right: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle); color: var(--text-secondary); }
  .reference { color: var(--text-muted); font-size: var(--text-sm); margin: var(--space-8) 0 var(--space-4); }

  @media (max-width: 880px) {
    .tdm-hero, .engine-band, .workflow { grid-template-columns: 1fr; }
    .workflow-grid, .rule-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .filters { grid-template-columns: 1fr; }
    .section-head { align-items: start; flex-direction: column; }
    .engine-features { grid-template-columns: 1fr; }
    .model-meta { align-items: flex-start; flex-direction: column; }
    .model-actions { width: 100%; justify-content: flex-start; }
  }
</style>
