<script>
  import { base } from '$app/paths';
  import { tdmModels, tdmModelStats } from '$lib/content/tdmModels';
  import { ui } from '$lib/i18n/translations';
  import { language } from '$lib/stores/language';
  import { tdmEngineUrl } from '$lib/tdm/engine';

  let query = $state('');
  let selectedDrug = $state('all');
  let selectedAdministration = $state('all');

  const repoIssueUrl = 'https://github.com/rberrah/rberrah.github.io/issues/new?template=tdm-model.yml';
  const tdmxUrl = 'https://www.tdmx.eu/';
  let copy = $derived(ui($language).tdm);
  /** @param {{ doi?: string | null, sourceUrl?: string | null }} model */
  const articleHref = (model) => model.doi ? `https://doi.org/${model.doi}` : model.sourceUrl;
  /** @param {any} model */
  const localizedModel = (model) => ({
    ...model,
    drug: $language === 'en' ? model.drugEn : model.drug,
    population: $language === 'en' ? model.populationEn : model.population,
    populationTags: $language === 'en' ? model.populationTagsEn : model.populationTags,
    modelType: $language === 'en' ? model.modelTypeEn : model.modelType,
    administrationCategories: $language === 'en' ? model.administrationCategoriesEn : model.administrationCategories,
    implementationStatusLabel: $language === 'en' ? model.implementationStatusLabelEn : model.implementationStatusLabel,
    note: $language === 'en' ? model.noteEn : model.note
  });
  let drugs = $derived([
    { key: 'all', label: copy.all },
    ...Array.from(new Set(tdmModels.map((model) => model.drugKey)))
      .map((key) => {
        const model = tdmModels.find((item) => item.drugKey === key);
        return { key, label: model ? ($language === 'en' ? model.drugEn : model.drug) : key };
      })
      .sort((a, b) => a.label.localeCompare(b.label, $language === 'en' ? 'en' : 'fr'))
  ]);
  let administrationModes = $derived([
    { key: 'all', label: copy.all },
    ...Object.entries(copy.administrationModes).map(([key, label]) => ({ key, label }))
  ]);
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
      const matchesDrug = selectedDrug === 'all' || model.drugKey === selectedDrug;
      const matchesAdministration = selectedAdministration === 'all' || model.administrationModes.includes(selectedAdministration);
      return matchesQuery && matchesDrug && matchesAdministration;
    })
  );
</script>

<svelte:head>
  <title>{copy.metaTitle}</title>
  <meta
    name="description"
    content={copy.metaDescription}
  />
</svelte:head>

<section class="tdm-hero">
  <div class="hero-copy">
    <p class="eyebrow">{copy.eyebrow}</p>
    <h1>{copy.title}</h1>
    <p class="lede">{copy.lede}</p>
    <div class="cta">
      <a class="btn btn-primary" href={`${tdmEngineUrl}/?lang=${$language}`} target="_blank" rel="noopener noreferrer">{copy.launch}</a>
      <a class="btn btn-outline" href="#modeles">{copy.choose}</a>
      <a class="btn btn-outline" href={`${base}/lego/`}>{copy.create}</a>
      <a class="btn btn-outline" href={repoIssueUrl} target="_blank" rel="noopener noreferrer">{copy.propose}</a>
    </div>
  </div>

  <div class="tdm-panel" aria-label={copy.panelAria}>
    <div class="panel-top">
      <span class="status-dot"></span>
      <span>{copy.panelStatus}</span>
    </div>
    <div class="stat-grid">
      <div>
        <strong>{tdmModelStats.total}</strong>
        <span>{copy.models}</span>
      </div>
      <div>
        <strong>{tdmModelStats.drugs}</strong>
        <span>{copy.molecules}</span>
      </div>
      <div>
        <strong>MAP</strong>
        <span>{copy.bayesian}</span>
      </div>
    </div>
    <p>{copy.privacy}</p>
  </div>
</section>

<section class="engine-band" aria-labelledby="engine-title">
  <div>
    <p class="eyebrow">{copy.engineEyebrow}</p>
    <h2 id="engine-title">{copy.engineTitle}</h2>
  </div>
  <div class="engine-features">
    {#each copy.features as feature}<span>{feature}</span>{/each}
  </div>
</section>

<section class="workflow" aria-labelledby="workflow-title">
  <div>
    <p class="eyebrow">{copy.contribution}</p>
    <h2 id="workflow-title">{copy.contributionTitle}</h2>
  </div>
  <div class="workflow-grid">
    {#each copy.workflow as item, index}
      <article>
        <span>{index + 1}</span>
        <h3>{item[0]}</h3>
        <p>{item[1]}</p>
      </article>
    {/each}
  </div>
</section>

<section id="modeles" class="models" aria-labelledby="models-title">
  <div class="section-head">
    <div>
      <p class="eyebrow">{copy.modelsEyebrow}</p>
      <h2 id="models-title">{copy.libraryTitle}</h2>
    </div>
    <span class="muted">{copy.modelCount(filteredModels.length, tdmModels.length)}</span>
  </div>

  <div class="filters">
    <label>
      <span>{copy.search}</span>
      <input bind:value={query} type="search" placeholder={copy.searchPlaceholder} />
    </label>
    <label>
      <span>{copy.molecule}</span>
      <select bind:value={selectedDrug}>
        {#each drugs as drug}
          <option value={drug.key}>{drug.label}</option>
        {/each}
      </select>
    </label>
    <label>
      <span>{copy.administration}</span>
      <select bind:value={selectedAdministration}>
        {#each administrationModes as mode}
          <option value={mode.key}>{mode.label}</option>
        {/each}
      </select>
    </label>
  </div>

  {#if filteredModels.length}
    <div class="model-grid">
      {#each filteredModels as model}
        {@const display = localizedModel(model)}
        <article class="model-card card">
          <div class="model-main">
            <div class="model-kicker">
              <span class="drug">{display.drug}</span>
              <span class="route">{display.administrationCategories.join(' + ')}</span>
            </div>
            <h3>{model.model}</h3>
            <p class="population">{display.population}</p>
            <div class="population-tags" aria-label={copy.populationAria}>
              {#each display.populationTags as tag}
                <span>{tag}</span>
              {/each}
            </div>
            <div class="article-source">
              <span>{copy.sourceArticle}</span>
              <p class="citation">{model.citation}</p>
              {#if articleHref(model)}
                <a href={articleHref(model)} target="_blank" rel="noopener noreferrer">
                  {model.doi ? `DOI ${model.doi}` : copy.consult}
                </a>
              {:else}
                <strong>{copy.referencePending}</strong>
              {/if}
            </div>
            {#if display.note}<p class="model-note">{display.note}</p>{/if}
          </div>
          <div class="model-meta">
            <div class="model-type">
              <span>{display.modelType}</span>
              <span>{display.implementationStatusLabel}</span>
            </div>
            <div class="model-actions">
              <a class="btn btn-primary sm" href={`${tdmEngineUrl}/?model=${encodeURIComponent(model.id)}&lang=${$language}`} target="_blank" rel="noopener noreferrer">{copy.use}</a>
              <a class="btn btn-outline sm" href={`${base}${model.href}`} download>{copy.download}</a>
            </div>
          </div>
        </article>
      {/each}
    </div>
  {:else}
    <p class="empty">{copy.empty}</p>
  {/if}
</section>

<section class="governance">
  <h2>{copy.governanceTitle}</h2>
  <div class="rule-grid">
    {#each copy.rules as rule}<div>{rule}</div>{/each}
  </div>
</section>

<p class="reference">
  {copy.inspiredPrefix} <a href={tdmxUrl} target="_blank" rel="noopener noreferrer">TDMx</a>.
  {copy.disclaimer}
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
    grid-template-columns: minmax(220px, 1fr) repeat(2, minmax(180px, 240px));
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
