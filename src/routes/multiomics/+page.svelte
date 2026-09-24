<script>
  let objective = 'explore';
  let organism = 'human';
  let studyName = '';
  let groupVariable = '';
  let outcome = '';
  let subjectCount = '';
  let paired = 'no';
  let longitudinal = 'no';

  let files = {
    transcriptomics: null,
    proteomics: null,
    metabolomics: null,
    metadata: null
  };

  const objectives = {
    explore: {
      title: 'Explore the shared multi-omics structure',
      method: 'MOFA-first',
      detail: 'Identify latent factors shared across transcriptomics, proteomics and metabolomics, then connect the strongest factors to pathways and cross-omics modules.'
    },
    groups: {
      title: 'Compare biological groups',
      method: 'MOFA + supervised integration',
      detail: 'Characterise the global multi-omics structure, then derive a compact integrated signature associated with the declared group variable.'
    },
    outcome: {
      title: 'Explain a clinical or experimental outcome',
      method: 'MOFA + outcome association',
      detail: 'Associate latent factors, consensus pathways and integrated modules with the declared continuous, categorical or time-to-event outcome.'
    },
    time: {
      title: 'Describe change over time',
      method: 'Design-aware longitudinal workflow',
      detail: 'Respect repeated measurements first, then integrate coordinated transcript, protein and metabolite changes across time.'
    }
  };

  function selectFile(layer, event) {
    const file = event.currentTarget.files?.[0] ?? null;
    files = { ...files, [layer]: file };
  }

  $: selectedObjective = objectives[objective];
  $: omicsCount = ['transcriptomics', 'proteomics', 'metabolomics'].filter((key) => files[key]).length;
  $: ready = omicsCount >= 2 && files.metadata;
</script>

<svelte:head>
  <title>Multi-omics prototype — PMx Explain</title>
  <meta name="robots" content="noindex,nofollow,noarchive" />
  <meta
    name="description"
    content="Private prototype for guided integration of transcriptomics, proteomics and metabolomics."
  />
</svelte:head>

<section class="hero">
  <p class="eyebrow">Experimental prototype · unlisted</p>
  <h1>From multi-omics data to one biological interpretation.</h1>
  <p class="lede">
    Describe the study first. The final workflow is intended to choose an appropriate analysis,
    integrate transcriptomics, proteomics and metabolomics, and return common factors, pathways
    and cross-omics mechanisms rather than three disconnected result tables.
  </p>
  <div class="privacy">
    <strong>Prototype only.</strong>
    The current page runs entirely in the browser. Selected files are not uploaded or analysed.
    A separate ephemeral Shiny backend will be connected later.
  </div>
</section>

<section class="workflow" aria-label="Planned workflow">
  <div><span>1</span><strong>Describe</strong><small>Study design & question</small></div>
  <div><span>2</span><strong>Upload</strong><small>Matched omics & metadata</small></div>
  <div><span>3</span><strong>Integrate</strong><small>Latent factors & pathways</small></div>
  <div><span>4</span><strong>Interpret</strong><small>One evidence-linked story</small></div>
</section>

<section class="panel">
  <div class="section-head">
    <div>
      <p class="eyebrow">Step 1</p>
      <h2>Describe your study</h2>
    </div>
    <p>Method names stay in the background; the scientific question drives the workflow.</p>
  </div>

  <div class="form-grid">
    <label class="wide">
      <span>Main question</span>
      <select bind:value={objective}>
        <option value="explore">Explore the shared structure of the dataset</option>
        <option value="groups">Compare groups / conditions</option>
        <option value="outcome">Explain an outcome or phenotype</option>
        <option value="time">Study change over time</option>
      </select>
    </label>

    <label>
      <span>Study name <small>optional</small></span>
      <input bind:value={studyName} type="text" placeholder="e.g. Treatment response cohort" />
    </label>

    <label>
      <span>Organism</span>
      <select bind:value={organism}>
        <option value="human">Human</option>
        <option value="mouse">Mouse</option>
        <option value="rat">Rat</option>
        <option value="other">Other / to define</option>
      </select>
    </label>

    <label>
      <span>Number of subjects / samples</span>
      <input bind:value={subjectCount} type="number" min="1" placeholder="e.g. 48" />
    </label>

    <label>
      <span>Group / condition variable</span>
      <input bind:value={groupVariable} type="text" placeholder="e.g. Treatment, response" />
    </label>

    <label>
      <span>Outcome <small>optional</small></span>
      <input bind:value={outcome} type="text" placeholder="e.g. response, fibrosis score, OS" />
    </label>

    <label>
      <span>Paired / repeated samples?</span>
      <select bind:value={paired}>
        <option value="no">No</option>
        <option value="yes">Yes</option>
      </select>
    </label>

    <label>
      <span>Longitudinal design?</span>
      <select bind:value={longitudinal}>
        <option value="no">No</option>
        <option value="yes">Yes</option>
      </select>
    </label>
  </div>

  <aside class="method-card">
    <span class="method-tag">{selectedObjective.method}</span>
    <h3>{selectedObjective.title}</h3>
    <p>{selectedObjective.detail}</p>
  </aside>
</section>

<section class="panel">
  <div class="section-head">
    <div>
      <p class="eyebrow">Step 2</p>
      <h2>Add the matched datasets</h2>
    </div>
    <p>At least two omics layers plus sample metadata will be required.</p>
  </div>

  <div class="uploads">
    <label class:loaded={files.transcriptomics}>
      <strong>Transcriptomics</strong>
      <span>Counts or processed expression matrix</span>
      <input type="file" accept=".csv,.tsv,.txt" onchange={(event) => selectFile('transcriptomics', event)} />
      <small>{files.transcriptomics ? files.transcriptomics.name : 'No file selected'}</small>
    </label>

    <label class:loaded={files.proteomics}>
      <strong>Proteomics</strong>
      <span>Protein abundance / intensity matrix</span>
      <input type="file" accept=".csv,.tsv,.txt" onchange={(event) => selectFile('proteomics', event)} />
      <small>{files.proteomics ? files.proteomics.name : 'No file selected'}</small>
    </label>

    <label class:loaded={files.metabolomics}>
      <strong>Metabolomics</strong>
      <span>Metabolite abundance / peak table</span>
      <input type="file" accept=".csv,.tsv,.txt" onchange={(event) => selectFile('metabolomics', event)} />
      <small>{files.metabolomics ? files.metabolomics.name : 'No file selected'}</small>
    </label>

    <label class:loaded={files.metadata}>
      <strong>Sample metadata</strong>
      <span>Sample IDs, groups, outcomes and covariates</span>
      <input type="file" accept=".csv,.tsv,.txt" onchange={(event) => selectFile('metadata', event)} />
      <small>{files.metadata ? files.metadata.name : 'No file selected'}</small>
    </label>
  </div>

  <div class="status" class:ready>
    <strong>{omicsCount}/3 omics selected</strong>
    <span>{ready ? 'Input structure ready for the future analysis engine.' : 'Select at least two omics layers and a metadata file.'}</span>
  </div>
</section>

<section class="results-preview">
  <div class="section-head">
    <div>
      <p class="eyebrow">Planned integrated output</p>
      <h2>One multi-omics result, not three separate reports</h2>
    </div>
  </div>

  <div class="result-grid">
    <article>
      <span class="num">01</span>
      <h3>Global multi-omics map</h3>
      <p>Latent factors showing which biological axes are shared across samples and how much each omics layer contributes.</p>
      <div class="mini-factor"><i></i><i></i><i></i></div>
    </article>

    <article>
      <span class="num">02</span>
      <h3>Consensus pathways</h3>
      <p>Pathways ranked by convergent evidence from transcripts, proteins and metabolites, with concordance and mapping confidence visible.</p>
      <div class="layers">
        <span>RNA ↑↑</span><span>Protein ↑</span><span>Metabolite ↑↑↑</span>
      </div>
    </article>

    <article>
      <span class="num">03</span>
      <h3>Cross-omics mechanisms</h3>
      <p>Small interpretable modules linking genes, proteins, reactions and metabolites instead of unreadable whole-network hairballs.</p>
      <div class="network-demo"><b>Gene</b><em>→</em><b>Protein</b><em>→</em><b>Metabolite</b></div>
    </article>

    <article>
      <span class="num">04</span>
      <h3>Phenotype association</h3>
      <p>Factors and pathways linked to the declared group, treatment, clinical phenotype or outcome when the design supports it.</p>
      <div class="association"><span>Factor 2</span><strong>↔</strong><span>{outcome || groupVariable || 'Outcome'}</span></div>
    </article>

    <article>
      <span class="num">05</span>
      <h3>Concordance & discordance</h3>
      <p>Highlight RNA–protein agreement, post-transcriptional discordance and metabolite changes consistent with known reactions.</p>
      <table>
        <tbody>
          <tr><th>RNA</th><td>↑</td><th>Protein</th><td>↑</td><th>Metabolite</th><td>↑</td></tr>
          <tr><th>RNA</th><td>↑</td><th>Protein</th><td>↓</td><th colspan="2">discordant</th></tr>
        </tbody>
      </table>
    </article>

    <article>
      <span class="num">06</span>
      <h3>Research-ready report</h3>
      <p>A concise biological interpretation separated into observed data, integrated inference, external knowledge and limitations, with a reproducible methods appendix.</p>
      <div class="evidence"><span>Observed</span><span>Integrated</span><span>Knowledge</span><span>Hypothesis</span></div>
    </article>
  </div>
</section>

<section class="principles">
  <h2>Design principles</h2>
  <div>
    <p><strong>Question-first.</strong> The user describes the protocol; the application chooses a defensible workflow.</p>
    <p><strong>Integrated by default.</strong> Single-omics results support quality control, but the main report is organised around shared factors, pathways and mechanisms.</p>
    <p><strong>Traceable.</strong> Every conclusion should be traceable to observed features, a statistical result and, where used, an external biological relationship.</p>
    <p><strong>Ephemeral.</strong> The intended Shiny deployment will process uploaded files within the session without a project database or persistent user workspace.</p>
  </div>
</section>

<style>
  .hero { max-width: 900px; padding: var(--space-12) 0 var(--space-8); }
  h1 { font-size: clamp(2.4rem, 6vw, 4.8rem); line-height: .98; max-width: 14ch; margin: var(--space-3) 0 var(--space-6); letter-spacing: -.045em; }
  h2 { margin: 0; font-size: var(--text-2xl); }
  h3 { margin: 0 0 var(--space-2); font-size: var(--text-lg); }
  .lede { color: var(--text-secondary); font-size: var(--text-lg); max-width: 70ch; }
  .privacy { margin-top: var(--space-6); border-left: 3px solid var(--accent-ai); padding: var(--space-3) var(--space-4); background: var(--bg-secondary); color: var(--text-secondary); max-width: 72ch; }
  .privacy strong { color: var(--text-primary); }

  .workflow { display: grid; grid-template-columns: repeat(4, 1fr); border-block: 1px solid var(--border-strong); margin-bottom: var(--space-12); }
  .workflow div { padding: var(--space-5); border-right: 1px solid var(--border-subtle); }
  .workflow div:last-child { border-right: 0; }
  .workflow span { font-family: var(--font-mono); color: var(--accent-pk); display: block; margin-bottom: var(--space-2); }
  .workflow strong, .workflow small { display: block; }
  .workflow small { color: var(--text-muted); margin-top: 2px; }

  .panel, .results-preview, .principles { margin-top: var(--space-12); }
  .panel { border-top: 1px solid var(--border-strong); padding-top: var(--space-6); }
  .section-head { display: flex; justify-content: space-between; align-items: end; gap: var(--space-6); margin-bottom: var(--space-6); }
  .section-head > p { max-width: 46ch; color: var(--text-secondary); margin: 0; font-size: var(--text-sm); }

  .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-4); max-width: 900px; }
  .form-grid label { display: grid; gap: var(--space-2); }
  .form-grid label > span { font-weight: 650; }
  .form-grid small { color: var(--text-muted); font-weight: 400; }
  .wide { grid-column: 1 / -1; }
  input, select {
    width: 100%; box-sizing: border-box; padding: 11px 12px;
    color: var(--text-primary); background: var(--bg-primary);
    border: 1px solid var(--border-strong); border-radius: var(--radius);
    font: inherit;
  }
  input:focus, select:focus { outline: 2px solid var(--focus-ring); border-color: var(--accent-pk); }

  .method-card { max-width: 860px; margin-top: var(--space-6); padding: var(--space-5); background: var(--bg-secondary); border-left: 3px solid var(--accent-pd); }
  .method-card p { margin-bottom: 0; color: var(--text-secondary); }
  .method-tag { display: inline-block; margin-bottom: var(--space-2); font-family: var(--font-mono); font-size: var(--text-xs); color: var(--accent-pd); }

  .uploads { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-4); }
  .uploads label { display: grid; gap: var(--space-2); padding: var(--space-5); border: 1px dashed var(--border-strong); border-radius: var(--radius); background: var(--bg-secondary); }
  .uploads label.loaded { border-style: solid; border-color: var(--accent-pd); }
  .uploads label > span, .uploads label > small { color: var(--text-secondary); }
  .uploads input { background: var(--bg-primary); }
  .status { display: flex; gap: var(--space-3); align-items: baseline; margin-top: var(--space-4); padding: var(--space-3) var(--space-4); background: var(--bg-secondary); color: var(--text-secondary); }
  .status.ready strong { color: var(--accent-pd); }

  .result-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-4); }
  .result-grid article { min-height: 240px; padding: var(--space-5); border: 1px solid var(--border-subtle); border-radius: var(--radius); background: var(--bg-secondary); }
  .result-grid article p { color: var(--text-secondary); }
  .num { display: inline-block; margin-bottom: var(--space-5); font-family: var(--font-mono); color: var(--accent-pk); }
  .mini-factor { display: grid; gap: 6px; margin-top: var(--space-5); }
  .mini-factor i { display: block; height: 7px; background: var(--accent-pk); border-radius: 10px; }
  .mini-factor i:nth-child(2) { width: 72%; opacity: .65; }
  .mini-factor i:nth-child(3) { width: 44%; opacity: .4; }
  .layers, .evidence { display: flex; flex-wrap: wrap; gap: 6px; margin-top: var(--space-4); }
  .layers span, .evidence span { font-family: var(--font-mono); font-size: var(--text-xs); border: 1px solid var(--border-strong); padding: 4px 7px; border-radius: 999px; }
  .network-demo, .association { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: var(--space-6); font-family: var(--font-mono); font-size: var(--text-xs); }
  .network-demo b, .association span { border: 1px solid var(--border-strong); padding: 7px; border-radius: 5px; background: var(--bg-primary); }
  .network-demo em { font-style: normal; color: var(--accent-pk); }
  table { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: var(--text-xs); }
  th, td { padding: 5px; border-bottom: 1px solid var(--border-subtle); text-align: left; }

  .principles { border-block: 1px solid var(--border-strong); padding: var(--space-7) 0; }
  .principles > div { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-3) var(--space-8); }
  .principles p { color: var(--text-secondary); }
  .principles strong { color: var(--text-primary); }

  @media (max-width: 900px) {
    .workflow, .result-grid { grid-template-columns: repeat(2, 1fr); }
    .workflow div:nth-child(2) { border-right: 0; }
    .workflow div:nth-child(-n+2) { border-bottom: 1px solid var(--border-subtle); }
  }

  @media (max-width: 640px) {
    .section-head { align-items: start; flex-direction: column; }
    .form-grid, .uploads, .result-grid, .principles > div, .workflow { grid-template-columns: 1fr; }
    .workflow div { border-right: 0; border-bottom: 1px solid var(--border-subtle); }
    .workflow div:last-child { border-bottom: 0; }
    .wide { grid-column: auto; }
    .status { align-items: start; flex-direction: column; }
  }
</style>
