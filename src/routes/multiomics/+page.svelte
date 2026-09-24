<script>
  import { base } from '$app/paths';
  import { runDeterministicAnalysis, resultToCsv } from '$lib/multiomics/deterministic.js';

  /** @type {'explore' | 'groups' | 'outcome' | 'time'} */
  let objective = 'explore';
  let organism = 'human';
  let studyName = '';
  let groupVariable = '';
  let outcome = '';
  let unitType = 'participant';
  let studySetting = 'clinical_observational';
  let designType = 'independent';
  let groupCount = '2';
  let timepointCount = '1';
  let sampleOverlap = 'same_specimen';
  let technicalReplicatesExpected = 'unknown';
  let batchKnown = 'unknown';
  let outcomeType = 'none';
  let covariatesAvailable = 'yes';
  let partialOmicsExpected = 'no';
  let demoLoaded = false;
  let analysisStatus = 'idle';
  let analysisError = '';
  /** @type {any} */
  let analysisResult = null;
  let useReactome = true;
  let resolveIdentifiers = true;

  let transcriptomicsPlatform = 'bulk_rnaseq';
  let transcriptomicsValues = 'raw_counts';
  let transcriptomicsIdType = 'ensembl_gene';
  let proteomicsPlatform = 'label_free';
  let proteomicsValues = 'lfq_intensity';
  let proteomicsIdType = 'uniprot';
  let metabolomicsPlatform = 'untargeted_lcms';
  let metabolomicsValues = 'peak_area';
  let metabolomicsIdType = 'chebi';

  /** @type {number | undefined} */
  let subjectCount;
  let paired = 'no';
  let longitudinal = 'no';

  /** @type {Record<'transcriptomics' | 'proteomics' | 'metabolomics' | 'metadata', File | null>} */
  let files = {
    transcriptomics: null,
    proteomics: null,
    metabolomics: null,
    metadata: null
  };

  /** @type {string[]} */
  let metadataHeaders = [];
  /** @type {Record<string, string>[]} */
  let metadataRows = [];
  let metadataDelimiter = '';
  let metadataError = '';

  /** @type {Record<'transcriptomics' | 'proteomics' | 'metabolomics', {headers:string[], sampleIds:string[], rowIds:string[], featureColumn:string, error:string}>} */
  let matrixInfo = {
    transcriptomics: { headers: [], sampleIds: [], rowIds: [], featureColumn: '', error: '' },
    proteomics: { headers: [], sampleIds: [], rowIds: [], featureColumn: '', error: '' },
    metabolomics: { headers: [], sampleIds: [], rowIds: [], featureColumn: '', error: '' }
  };

  const omicLayers = /** @type {const} */ (['transcriptomics', 'proteomics', 'metabolomics']);
  const omicLabels = {
    transcriptomics: 'Transcriptomics',
    proteomics: 'Proteomics',
    metabolomics: 'Metabolomics'
  };

  /** @param {string} layer */
  function omicLabel(layer) {
    return layer === 'transcriptomics'
      ? omicLabels.transcriptomics
      : layer === 'proteomics'
        ? omicLabels.proteomics
        : layer === 'metabolomics'
          ? omicLabels.metabolomics
          : layer;
  }

  const fieldDefinitions = [
    {
      key: 'subject_id',
      label: 'Subject / experimental unit',
      required: true,
      aliases: ['subject_id', 'subject', 'patient_id', 'patient', 'participant_id', 'participant', 'individual_id', 'individual', 'donor_id', 'animal_id', 'unit_id', 'biological_unit', 'id_patient', 'id_sujet', 'sujet', 'participant_id', 'individu', 'id_individu', 'id_animal']
    },
    {
      key: 'sample_id',
      label: 'Biological sample',
      required: true,
      aliases: ['sample_id', 'sample', 'specimen_id', 'specimen', 'biospecimen_id', 'biosample_id', 'sample_name', 'id_echantillon', 'echantillon', 'id_prelevement', 'prelevement', 'nom_echantillon']
    },
    {
      key: 'assay_id',
      label: 'Assay / run identifier',
      required: true,
      aliases: ['assay_id', 'assay', 'run_id', 'run', 'measurement_id', 'library_id', 'file_id', 'assay_name', 'id_assay', 'id_mesure', 'mesure_id', 'id_run', 'id_fichier']
    },
    {
      key: 'omic',
      label: 'Omics layer',
      required: true,
      aliases: ['omic', 'omics', 'layer', 'modality', 'data_type', 'datatype', 'assay_type', 'omics_type', 'omique', 'type_omique', 'couche', 'modalite']
    },
    {
      key: 'condition',
      label: 'Condition / group',
      required: false,
      aliases: ['condition', 'group', 'treatment', 'arm', 'cohort', 'status', 'class', 'phenotype_group', 'condition_name', 'groupe', 'traitement', 'bras', 'cohorte', 'statut', 'condition_experimentale']
    },
    {
      key: 'timepoint',
      label: 'Time point',
      required: false,
      aliases: ['timepoint', 'time_point', 'time', 'visit', 'visit_id', 'visit_name', 'day', 'week', 'temps', 'temps_j', 'jour', 'semaine', 'visite', 'id_visite']
    },
    {
      key: 'batch',
      label: 'Technical batch',
      required: false,
      aliases: ['batch', 'batch_id', 'plate', 'run_batch', 'technical_batch', 'batch_name', 'lot', 'id_lot', 'plaque', 'batch_technique']
    },
    {
      key: 'technical_replicate',
      label: 'Technical replicate',
      required: false,
      aliases: ['technical_replicate', 'technical_rep', 'tech_rep', 'replicate', 'replicate_id', 'rep', 'replicat_technique', 'replicat', 'rep_technique', 'numero_replicat']
    },
    {
      key: 'outcome',
      label: 'Outcome / endpoint',
      required: false,
      aliases: ['outcome', 'endpoint', 'response', 'label', 'target', 'phenotype', 'clinical_outcome', 'reponse', 'critere', 'critere_jugement', 'phenotype_clinique', 'evenement']
    }
  ];

  /** @type {Record<string,string>} */
  let columnMapping = Object.fromEntries(fieldDefinitions.map((field) => [field.key, '']));

  const objectives = {
    explore: {
      title: 'Explore the shared multi-omics structure',
      method: 'Exploratory branch',
      detail: 'Data validation and mapping are available, but an unsupervised inferential engine is not yet exposed as a final analysis branch.'
    },
    groups: {
      title: 'Compare biological groups',
      method: 'Deterministic two-condition integration',
      detail: 'Permutation contrasts, BH-FDR, direct cross-omics correlation changes and Reactome pathway convergence.'
    },
    outcome: {
      title: 'Explain a clinical or experimental outcome',
      method: 'Not yet operational',
      detail: 'Outcome-targeted regression or survival modelling is intentionally blocked until the corresponding deterministic model-selection rules are implemented.'
    },
    time: {
      title: 'Describe change over time',
      method: 'Design-aware longitudinal workflow',
      detail: 'Two time points use within-subject change; three or more numeric-labelled time points use individual slopes before group comparison.'
    }
  };

  const omicAliases = {
    transcriptomics: ['transcriptomics', 'transcriptome', 'transcriptomique', 'rna', 'rnaseq', 'rna_seq', 'gene_expression', 'expression_genique', 'mrna', 'arn'],
    proteomics: ['proteomics', 'proteome', 'proteomique', 'protein', 'proteins', 'proteine', 'proteines', 'lfq'],
    metabolomics: ['metabolomics', 'metabolome', 'metabolomique', 'metabolite', 'metabolites', 'met']
  };

  const databaseRegistry = [
    {
      name: 'Ensembl',
      scope: 'genes',
      role: 'Resolve Ensembl IDs and gene symbols, confirm species and canonical gene annotations.',
      status: 'registry target · not called automatically yet',
      url: 'https://rest.ensembl.org/documentation/'
    },
    {
      name: 'UniProt',
      scope: 'proteins',
      role: 'Resolve protein accessions and cross-reference proteins to genes, Ensembl, Reactome and other resources.',
      status: 'registry target · not called automatically yet',
      url: 'https://www.uniprot.org/help/id_mapping'
    },
    {
      name: 'ChEBI',
      scope: 'metabolites',
      role: 'Resolve curated chemical entities, synonyms, structures and ontology relationships.',
      status: 'live in the current engine',
      url: 'https://www.ebi.ac.uk/chebi/tools'
    },
    {
      name: 'UniChem',
      scope: 'metabolites',
      role: 'Cross-reference chemical identifiers between databases when the uploaded metabolite identifier is not ChEBI.',
      status: 'registry target · not called automatically yet',
      url: 'https://www.ebi.ac.uk/unichem/'
    },
    {
      name: 'KEGG',
      scope: 'pathways · optional',
      role: 'Optional academic-use cross-reference and pathway/reaction annotation. KEGG REST access is rate-limited and is not used as the core engine of the public MVP.',
      status: 'optional registry target · not called automatically yet',
      url: 'https://www.kegg.jp/kegg/rest/'
    },
    {
      name: 'Reactome',
      scope: 'pathways',
      role: 'Map genes, proteins and ChEBI entities onto common pathways and reactions for integrated pathway interpretation.',
      status: 'live in the current engine',
      url: 'https://reactome.org/dev/analysis'
    },
    {
      name: 'STRING',
      scope: 'network',
      role: 'Build compact protein interaction modules after identifier resolution; not used as a substitute for the measured data.',
      status: 'registry target · not called automatically yet',
      url: 'https://string-db.org/help/api/'
    }
  ];

  /** @param {unknown} value */
  function normalise(value) {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * @param {string} line
   * @param {string} delimiter
   */
  function splitDelimitedLine(line, delimiter) {
    const out = [];
    let current = '';
    let quoted = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"') {
        if (quoted && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          quoted = !quoted;
        }
      } else if (char === delimiter && !quoted) {
        out.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    out.push(current.trim());
    return out;
  }

  /** @param {string} text */
  function detectDelimiter(text) {
    const line = text.split(/\r?\n/).find((row) => row.trim()) ?? '';
    const candidates = [',', '\t', ';'];
    return candidates
      .map((delimiter) => ({ delimiter, count: splitDelimitedLine(line, delimiter).length }))
      .sort((a, b) => b.count - a.count)[0]?.delimiter ?? ',';
  }

  /** @param {string} text */
  function parseTable(text) {
    const delimiter = detectDelimiter(text);
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    if (!lines.length) return { delimiter, headers: [], rows: [] };
    const headers = splitDelimitedLine(lines[0], delimiter);
    const rows = lines.slice(1).map((line) => {
      const values = splitDelimitedLine(line, delimiter);
      return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
    });
    return { delimiter, headers, rows };
  }

  /** @param {string[]} headers */
  function autoMapColumns(headers) {
    /** @type {Record<string,string>} */
    const next = {};
    const normalisedHeaders = headers.map((header) => ({ raw: header, normalised: normalise(header) }));
    for (const field of fieldDefinitions) {
      const aliases = new Set(field.aliases.map(normalise));
      const matches = normalisedHeaders.filter((header) => aliases.has(header.normalised));
      next[field.key] = matches.length === 1 ? matches[0].raw : '';
    }
    columnMapping = next;
  }

  /** @param {File | null} file */
  async function inspectMetadata(file) {
    metadataError = '';
    metadataHeaders = [];
    metadataRows = [];
    if (!file) return;
    try {
      const parsed = parseTable(await file.text());
      metadataDelimiter = parsed.delimiter === '\t' ? 'tab' : parsed.delimiter === ';' ? 'semicolon' : 'comma';
      metadataHeaders = parsed.headers;
      metadataRows = parsed.rows;
      autoMapColumns(parsed.headers);
      if (!parsed.headers.length || !parsed.rows.length) metadataError = 'The metadata file appears empty.';
    } catch (error) {
      metadataError = error instanceof Error ? error.message : 'Unable to read metadata.';
    }
  }

  /**
   * @param {'transcriptomics' | 'proteomics' | 'metabolomics'} layer
   * @param {File | null} file
   */
  async function inspectMatrix(layer, file) {
    if (!file) {
      matrixInfo = { ...matrixInfo, [layer]: { headers: [], sampleIds: [], rowIds: [], featureColumn: '', error: '' } };
      return;
    }
    try {
      const parsed = parseTable(await file.text());
      const featureColumn = parsed.headers[0] ?? '';
      const sampleIds = parsed.headers.slice(1);
      const rowIds = parsed.rows.map((row) => row[featureColumn] ?? '').filter(Boolean);
      matrixInfo = {
        ...matrixInfo,
        [layer]: {
          headers: parsed.headers,
          sampleIds,
          rowIds,
          featureColumn,
          error: sampleIds.length ? '' : 'No assay columns detected.'
        }
      };
    } catch (error) {
      matrixInfo = {
        ...matrixInfo,
        [layer]: {
          headers: [],
          sampleIds: [],
          rowIds: [],
          featureColumn: '',
          error: error instanceof Error ? error.message : 'Unable to read matrix.'
        }
      };
    }
  }

  /**
   * @param {'transcriptomics' | 'proteomics' | 'metabolomics' | 'metadata'} layer
   * @param {Event} event
   */
  async function selectFile(layer, event) {
    const input = /** @type {HTMLInputElement} */ (event.currentTarget);
    const file = input.files?.[0] ?? null;
    files = { ...files, [layer]: file };
    demoLoaded = false;
    analysisResult = null;
    analysisStatus = 'idle';
    analysisError = '';
    if (layer === 'metadata') await inspectMetadata(file);
    else await inspectMatrix(layer, file);
  }

  async function loadDemo() {
    /** @type {Array<['metadata'|'transcriptomics'|'proteomics'|'metabolomics', string]>} */
    const demoFiles = [
      ['metadata', 'demo_metadata.csv'],
      ['transcriptomics', 'demo_transcriptomics.csv'],
      ['proteomics', 'demo_proteomics.csv'],
      ['metabolomics', 'demo_metabolomics.csv']
    ];
    /** @type {Record<'metadata'|'transcriptomics'|'proteomics'|'metabolomics', File | null>} */
    const loaded = {
      metadata: null,
      transcriptomics: null,
      proteomics: null,
      metabolomics: null
    };
    for (const [layer, filename] of demoFiles) {
      const response = await fetch(`${base}/multiomics/${filename}`);
      const text = await response.text();
      loaded[layer] = new File([text], filename, { type: 'text/csv' });
    }
    files = {
      metadata: loaded.metadata,
      transcriptomics: loaded.transcriptomics,
      proteomics: loaded.proteomics,
      metabolomics: loaded.metabolomics
    };
    studyName = 'Demo — treatment × time';
    subjectCount = 8;
    groupVariable = 'condition';
    outcome = 'outcome';
    paired = 'yes';
    longitudinal = 'yes';
    objective = 'time';
    studySetting = 'clinical_interventional';
    designType = 'repeated';
    groupCount = '2';
    timepointCount = '2';
    sampleOverlap = 'same_specimen';
    technicalReplicatesExpected = 'yes';
    batchKnown = 'yes';
    outcomeType = 'binary';
    partialOmicsExpected = 'no';
    transcriptomicsValues = 'raw_counts';
    transcriptomicsIdType = 'gene_symbol';
    proteomicsValues = 'log_intensity';
    proteomicsIdType = 'uniprot';
    metabolomicsValues = 'peak_area';
    metabolomicsIdType = 'chebi';
    demoLoaded = true;
    await inspectMetadata(files.metadata);
    await inspectMatrix('transcriptomics', files.transcriptomics);
    await inspectMatrix('proteomics', files.proteomics);
    await inspectMatrix('metabolomics', files.metabolomics);
    await runAnalysis();
  }

  /**
   * @param {Record<string,string>} row
   * @param {string} key
   */
  function mappedValue(row, key) {
    const column = columnMapping[key];
    return column ? row[column] ?? '' : '';
  }

  /** @param {unknown} value */
  function canonicalOmic(value) {
    const key = normalise(value);
    for (const [omic, aliases] of Object.entries(omicAliases)) {
      if (aliases.map(normalise).includes(key)) return omic;
    }
    return '';
  }

  /** @param {string} key */
  function uniqueMapped(key) {
    return new Set(metadataRows.map((row) => mappedValue(row, key)).filter(Boolean));
  }

  function technicalReplicateGroups() {
    if (!columnMapping.sample_id || !columnMapping.omic) return [];
    /** @type {Record<string,number>} */
    const counts = {};
    for (const row of metadataRows) {
      const sample = mappedValue(row, 'sample_id');
      const omic = canonicalOmic(mappedValue(row, 'omic')) || normalise(mappedValue(row, 'omic'));
      if (!sample || !omic) continue;
      const key = `${sample}::${omic}`;
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return Object.entries(counts).filter(([, count]) => count > 1).map(([key, count]) => ({ key, count }));
  }

  /** @param {'transcriptomics' | 'proteomics' | 'metabolomics'} layer */
  function expectedAssays(layer) {
    if (!columnMapping.assay_id || !columnMapping.omic) return new Set();
    return new Set(
      metadataRows
        .filter((row) => canonicalOmic(mappedValue(row, 'omic')) === layer)
        .map((row) => mappedValue(row, 'assay_id'))
        .filter(Boolean)
    );
  }

  /**
   * @param {'transcriptomics' | 'proteomics' | 'metabolomics'} layer
   */
  function matrixMatch(layer) {
    const expected = expectedAssays(layer);
    const columns = new Set(matrixInfo[layer].sampleIds);
    const rows = new Set(matrixInfo[layer].rowIds);
    if (!expected.size || (!columns.size && !rows.size)) {
      return { matched: 0, expected: expected.size, observed: columns.size, missing: [], extra: [], orientation: 'unknown' };
    }
    const columnMatched = [...expected].filter((id) => columns.has(id));
    const rowMatched = [...expected].filter((id) => rows.has(id));
    const transposed = rowMatched.length > columnMatched.length;
    const observed = transposed ? rows : columns;
    const matched = transposed ? rowMatched : columnMatched;
    return {
      matched: matched.length,
      expected: expected.size,
      observed: observed.size,
      missing: [...expected].filter((id) => !observed.has(id)),
      extra: [...observed].filter((id) => !expected.has(id)),
      orientation: transposed ? 'transposed' : 'features-by-assays'
    };
  }

  /**
   * @param {string} key
   * @param {string} value
   */
  function setMapping(key, value) {
    columnMapping = { ...columnMapping, [key]: value };
  }

  /**
   * @param {'transcriptomics' | 'proteomics' | 'metabolomics'} layer
   */
  function inferFeatureIdType(layer) {
    const ids = matrixInfo[layer].rowIds.slice(0, 50).map((id) => id.trim()).filter(Boolean);
    if (!ids.length) return { type: 'unknown', confidence: 0 };
    /** @type {Record<string, (id:string) => boolean>} */
    const tests = {
      ensembl_gene: (id) => /^ENSG\d+(?:\.\d+)?$/i.test(id),
      ensembl_protein: (id) => /^ENSP\d+(?:\.\d+)?$/i.test(id),
      uniprot: (id) => /^(?:[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9][A-Z][A-Z0-9]{2}[0-9])(?:-\d+)?$/.test(id),
      hmdb: (id) => /^HMDB\d+$/i.test(id),
      chebi: (id) => /^CHEBI:\d+$/i.test(id),
      kegg_compound: (id) => /^C\d{5}$/i.test(id),
      entrez: (id) => /^\d+$/.test(id)
    };
    let best = { type: 'unknown', confidence: 0 };
    for (const [type, test] of Object.entries(tests)) {
      const score = ids.filter(test).length / ids.length;
      if (score > best.confidence) best = { type, confidence: score };
    }
    return best.confidence >= 0.6 ? best : { type: 'unknown', confidence: best.confidence };
  }

  function downloadGeneratedTemplate() {
    const headers = ['subject_id', 'sample_id', 'assay_id', 'omic', 'condition'];
    if (longitudinal === 'yes' || Number(timepointCount) > 1) headers.push('timepoint');
    if (batchKnown !== 'no') headers.push('batch');
    if (technicalReplicatesExpected !== 'no') headers.push('technical_replicate');
    if (outcomeType !== 'none') headers.push('outcome');
    if (covariatesAvailable === 'yes') headers.push('covariate_1');

    const omics = ['transcriptomics', 'proteomics', 'metabolomics'];
    const nTime = longitudinal === 'yes' ? Math.max(2, Number(timepointCount) || 2) : 1;
    const exampleRows = [];
    for (let subject = 1; subject <= 2; subject += 1) {
      for (let time = 0; time < nTime; time += 1) {
        for (const omic of omics) {
          const prefix = omic === 'transcriptomics' ? 'RNA' : omic === 'proteomics' ? 'PROT' : 'MET';
          /** @type {Record<string,string>} */
          const values = {
            subject_id: `SUBJ${String(subject).padStart(3, '0')}`,
            sample_id: `SUBJ${String(subject).padStart(3, '0')}_T${time}`,
            assay_id: `${prefix}${String((subject - 1) * nTime + time + 1).padStart(3, '0')}`,
            omic,
            condition: subject === 1 ? 'control' : 'treatment',
            timepoint: `T${time}`,
            batch: `${prefix}_B1`,
            technical_replicate: '1',
            outcome: '',
            covariate_1: ''
          };
          exampleRows.push(headers.map((header) => values[header] ?? '').join(','));
        }
      }
    }
    const csv = [headers.join(','), ...exampleRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = 'multiomics_metadata_from_protocol.csv';
    anchor.click();
    URL.revokeObjectURL(href);
  }

  async function runAnalysis() {
    analysisError = '';
    analysisResult = null;
    if (!ready) {
      analysisError = 'Complete the metadata mapping and load at least two omics matrices first.';
      return;
    }
    analysisStatus = 'running';
    try {
      analysisResult = await runDeterministicAnalysis({
        files,
        metadataRows,
        columnMapping,
        protocol: {
          organism,
          objective,
          longitudinal: longitudinal === 'yes',
          designType,
          studySetting,
          groupCount,
          sampleOverlap
        },
        dataTypes: {
          transcriptomics: transcriptomicsValues,
          proteomics: proteomicsValues,
          metabolomics: metabolomicsValues
        },
        identifierTypes: {
          transcriptomics: transcriptomicsIdType,
          proteomics: proteomicsIdType,
          metabolomics: metabolomicsIdType
        },
        resolveIdentifiers,
        useReactome
      });
      analysisStatus = 'done';
    } catch (error) {
      analysisStatus = 'error';
      analysisError = error instanceof Error ? error.message : 'Analysis failed.';
    }
  }

  function downloadAnalysisJson() {
    if (!analysisResult) return;
    const blob = new Blob([JSON.stringify(analysisResult, null, 2)], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = 'multiomics_deterministic_results.json';
    anchor.click();
    URL.revokeObjectURL(href);
  }

  /** @param {'transcriptomics'|'proteomics'|'metabolomics'} layer */
  function downloadLayerCsv(layer) {
    const rows = analysisResult?.layers?.[layer]?.rows;
    if (!rows?.length) return;
    const blob = new Blob([resultToCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = `${layer}_deterministic_results.csv`;
    anchor.click();
    URL.revokeObjectURL(href);
  }

  $: inferredTranscriptomicsId = inferFeatureIdType('transcriptomics');
  $: inferredProteomicsId = inferFeatureIdType('proteomics');
  $: inferredMetabolomicsId = inferFeatureIdType('metabolomics');
  $: selectedObjective = objectives[objective];
  $: omicsCount = omicLayers.filter((key) => Boolean(files[key])).length;
  $: requiredMappingsComplete = fieldDefinitions.filter((field) => field.required).every((field) => Boolean(columnMapping[field.key]));
  $: mappedSubjects = uniqueMapped('subject_id').size;
  $: mappedSamples = uniqueMapped('sample_id').size;
  $: mappedAssays = uniqueMapped('assay_id').size;
  $: replicateGroups = technicalReplicateGroups();
  $: objectiveOperational = objective === 'groups' || objective === 'time';
  $: ready = omicsCount >= 2 && Boolean(files.metadata) && requiredMappingsComplete && objectiveOperational;
  $: analysisPlan = objective === 'time'
    ? 'technical-replicate aggregation → declared-data preprocessing → batch-confounding audit → within-subject change/slope → deterministic inference → BH-FDR → cross-omics correlation change → Reactome over-representation'
    : objective === 'groups'
      ? 'technical-replicate aggregation → declared-data preprocessing → batch-confounding audit → group contrast → deterministic inference → BH-FDR → cross-omics correlation change → Reactome over-representation'
      : 'data-contract validation and mapping only; no inferential branch is run for this objective in the current MVP';
</script>

<svelte:head>
  <title>Multi-omics prototype — PMx Explain</title>
  <meta name="robots" content="noindex,nofollow,noarchive" />
  <meta name="description" content="Unlisted prototype for guided integration of transcriptomics, proteomics and metabolomics." />
</svelte:head>

<section class="hero">
  <p class="eyebrow">Experimental prototype · unlisted · v0.9</p>
  <h1>From multi-omics data to one biological interpretation.</h1>
  <p class="lede">
    Describe the protocol, map the samples once, then let the workflow integrate transcriptomics,
    proteomics and metabolomics around shared factors, pathways and mechanisms.
  </p>
  <div class="privacy">
    <strong>Prototype only.</strong>
    Matrix parsing, preprocessing and statistical contrasts run locally in the browser.
    When pathway analysis is enabled, only selected molecular identifiers are sent to Reactome; patient/sample metadata and abundance matrices are not sent.
  </div>
</section>

<section class="workflow" aria-label="Prototype workflow">
  <div><span>1</span><strong>Question</strong><small>Scientific objective</small></div>
  <div><span>2</span><strong>Protocol</strong><small>Closed design questions</small></div>
  <div><span>3</span><strong>Data type</strong><small>Platforms & identifiers</small></div>
  <div><span>4</span><strong>Map</strong><small>Template or recognised columns</small></div>
  <div><span>5</span><strong>Validate</strong><small>Samples & replicates</small></div>
  <div><span>6</span><strong>Integrate</strong><small>Databases & multi-omics</small></div>
</section>

<section class="panel">
  <div class="section-head">
    <div>
      <p class="eyebrow">Step 1 · Scientific question</p>
      <h2>What should the experiment answer?</h2>
    </div>
    <p>The question selects the analysis family. The researcher does not need to choose MOFA, DIABLO or another method by name.</p>
  </div>

  <div class="form-grid">
    <label class="wide">
      <span>Main objective</span>
      <select bind:value={objective}>
        <option value="explore">Explore the shared structure of the dataset · validation only</option>
        <option value="groups">Compare groups / conditions · operational</option>
        <option value="outcome">Explain an outcome or phenotype · not yet operational</option>
        <option value="time">Study change over time · operational</option>
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
      <p class="eyebrow">Step 2 · Protocol</p>
      <h2>Describe the design with closed questions</h2>
    </div>
    <p>The answers define the statistical structure before any omics method is selected.</p>
  </div>

  <div class="form-grid">
    <label>
      <span>Study setting</span>
      <select bind:value={studySetting}>
        <option value="clinical_observational">Human · observational cohort</option>
        <option value="clinical_interventional">Human · intervention / trial</option>
        <option value="animal">Animal experiment</option>
        <option value="cell">Cell culture / in vitro</option>
        <option value="organoid">Organoid / ex vivo model</option>
        <option value="other">Other</option>
      </select>
    </label>

    <label>
      <span>Independent biological unit</span>
      <select bind:value={unitType}>
        <option value="participant">Human participant</option>
        <option value="animal">Animal</option>
        <option value="culture">Independent culture / biological replicate</option>
        <option value="other">Other experimental unit</option>
      </select>
    </label>

    <label>
      <span>Design structure</span>
      <select bind:value={designType}>
        <option value="independent">Independent groups / units</option>
        <option value="paired">Paired samples</option>
        <option value="crossover">Crossover / within-subject comparison</option>
        <option value="repeated">Repeated measurements</option>
      </select>
    </label>

    <label>
      <span>Number of comparison groups</span>
      <select bind:value={groupCount}>
        <option value="1">One group / exploratory only</option>
        <option value="2">Two groups</option>
        <option value="3plus">Three or more groups</option>
      </select>
    </label>

    <label>
      <span>Longitudinal design?</span>
      <select bind:value={longitudinal}>
        <option value="no">No</option>
        <option value="yes">Yes</option>
      </select>
    </label>

    <label>
      <span>Number of time points</span>
      <select bind:value={timepointCount}>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4 or more</option>
      </select>
    </label>

    <label>
      <span>Do the omics come from the same biological specimen?</span>
      <select bind:value={sampleOverlap}>
        <option value="same_specimen">Yes, same specimen for all omics</option>
        <option value="same_subject">Same subject, different specimens</option>
        <option value="partial">Partially matched</option>
        <option value="unpaired">Different / unpaired samples</option>
        <option value="unknown">Unknown</option>
      </select>
    </label>

    <label>
      <span>Technical replicates expected?</span>
      <select bind:value={technicalReplicatesExpected}>
        <option value="no">No</option>
        <option value="yes">Yes</option>
        <option value="unknown">Unknown</option>
      </select>
    </label>

    <label>
      <span>Known technical batches?</span>
      <select bind:value={batchKnown}>
        <option value="yes">Yes</option>
        <option value="no">No</option>
        <option value="unknown">Unknown</option>
      </select>
    </label>

    <label>
      <span>Primary outcome type</span>
      <select bind:value={outcomeType}>
        <option value="none">No outcome / exploratory</option>
        <option value="binary">Binary</option>
        <option value="multiclass">Multiclass</option>
        <option value="continuous">Continuous</option>
        <option value="survival">Time-to-event / survival</option>
        <option value="count">Count</option>
      </select>
    </label>

    <label>
      <span>Important covariates available?</span>
      <select bind:value={covariatesAvailable}>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
    </label>

    <label>
      <span>Some subjects may miss an entire omics layer?</span>
      <select bind:value={partialOmicsExpected}>
        <option value="no">No / not expected</option>
        <option value="yes">Yes</option>
        <option value="unknown">Unknown</option>
      </select>
    </label>

    <label>
      <span>Number of biological units <small>optional consistency check</small></span>
      <input bind:value={subjectCount} type="number" min="1" placeholder="e.g. 48" />
    </label>

    <label>
      <span>Name of the group variable <small>optional</small></span>
      <input bind:value={groupVariable} type="text" placeholder="e.g. treatment" />
    </label>

    <label>
      <span>Name of the outcome <small>optional</small></span>
      <input bind:value={outcome} type="text" placeholder="e.g. response" />
    </label>
  </div>

  <div class="identity-grid">
    <article>
      <code>subject_id</code>
      <strong>Biological unit</strong>
      <p>Same participant / animal / independent culture across visits and samples.</p>
    </article>
    <article>
      <code>sample_id</code>
      <strong>Biological specimen</strong>
      <p>The physical specimen. RNA, protein and metabolite assays from the same specimen share this ID.</p>
    </article>
    <article>
      <code>assay_id</code>
      <strong>Technical measurement</strong>
      <p>The column name used in an omics matrix. Technical replicates have distinct assay IDs but the same sample ID.</p>
    </article>
  </div>
</section>

<section class="panel">
  <div class="section-head">
    <div>
      <p class="eyebrow">Step 3 · Data type</p>
      <h2>Tell the app what each matrix represents</h2>
    </div>
    <p>This prevents the same numbers from being interpreted incorrectly as raw counts, normalised intensities or absolute concentrations.</p>
  </div>

  <div class="omics-question-grid">
    <article>
      <h3>Transcriptomics</h3>
      <label>
        <span>Platform</span>
        <select bind:value={transcriptomicsPlatform}>
          <option value="bulk_rnaseq">Bulk RNA-seq</option>
          <option value="microarray">Microarray</option>
          <option value="targeted">Targeted expression panel</option>
          <option value="processed">Already processed matrix</option>
        </select>
      </label>
      <label>
        <span>Values</span>
        <select bind:value={transcriptomicsValues}>
          <option value="raw_counts">Raw integer counts</option>
          <option value="tpm">TPM / FPKM-like abundance</option>
          <option value="normalized">Normalised expression</option>
          <option value="log_expression">Log-transformed expression</option>
          <option value="unknown">Unknown</option>
        </select>
      </label>
      <label>
        <span>Feature identifier</span>
        <select bind:value={transcriptomicsIdType}>
          <option value="ensembl_gene">Ensembl gene ID</option>
          <option value="gene_symbol">Gene symbol</option>
          <option value="entrez">Entrez Gene ID</option>
          <option value="unknown">Unknown / detect automatically</option>
        </select>
      </label>
      {#if matrixInfo.transcriptomics.rowIds.length}
        <small>Detected from uploaded features: <strong>{inferredTranscriptomicsId.type}</strong> ({Math.round(inferredTranscriptomicsId.confidence * 100)}%).</small>
      {/if}
    </article>

    <article>
      <h3>Proteomics</h3>
      <label>
        <span>Platform</span>
        <select bind:value={proteomicsPlatform}>
          <option value="label_free">Label-free LC-MS/MS</option>
          <option value="tmt">TMT / multiplexed</option>
          <option value="dia">DIA</option>
          <option value="targeted">Targeted proteomics</option>
          <option value="processed">Already processed matrix</option>
        </select>
      </label>
      <label>
        <span>Values</span>
        <select bind:value={proteomicsValues}>
          <option value="lfq_intensity">LFQ / intensity</option>
          <option value="log_intensity">Log intensity</option>
          <option value="spectral_count">Spectral counts</option>
          <option value="normalized">Normalised abundance</option>
          <option value="unknown">Unknown</option>
        </select>
      </label>
      <label>
        <span>Feature identifier</span>
        <select bind:value={proteomicsIdType}>
          <option value="uniprot">UniProt accession</option>
          <option value="gene_symbol">Gene symbol</option>
          <option value="ensembl_protein">Ensembl protein ID</option>
          <option value="unknown">Unknown / detect automatically</option>
        </select>
      </label>
      {#if matrixInfo.proteomics.rowIds.length}
        <small>Detected from uploaded features: <strong>{inferredProteomicsId.type}</strong> ({Math.round(inferredProteomicsId.confidence * 100)}%).</small>
      {/if}
    </article>

    <article>
      <h3>Metabolomics</h3>
      <label>
        <span>Acquisition</span>
        <select bind:value={metabolomicsPlatform}>
          <option value="untargeted_lcms">Untargeted LC-MS</option>
          <option value="targeted_lcms">Targeted LC-MS</option>
          <option value="gcms">GC-MS</option>
          <option value="nmr">NMR</option>
          <option value="processed">Already processed matrix</option>
        </select>
      </label>
      <label>
        <span>Values</span>
        <select bind:value={metabolomicsValues}>
          <option value="peak_area">Peak area / intensity</option>
          <option value="normalized">Normalised abundance</option>
          <option value="concentration">Absolute concentration</option>
          <option value="log_abundance">Log abundance</option>
          <option value="unknown">Unknown</option>
        </select>
      </label>
      <label>
        <span>Feature identifier</span>
        <select bind:value={metabolomicsIdType}>
          <option value="chebi">ChEBI</option>
          <option value="hmdb">HMDB</option>
          <option value="kegg_compound">KEGG compound</option>
          <option value="pubchem">PubChem CID</option>
          <option value="name">Metabolite name</option>
          <option value="mz_rt">m/z + retention time only</option>
          <option value="unknown">Unknown / detect automatically</option>
        </select>
      </label>
      {#if matrixInfo.metabolomics.rowIds.length}
        <small>Detected from uploaded features: <strong>{inferredMetabolomicsId.type}</strong> ({Math.round(inferredMetabolomicsId.confidence * 100)}%).</small>
      {/if}
    </article>
  </div>
</section>

<section class="panel">
  <div class="section-head">
    <div>
      <p class="eyebrow">Step 4 · Data contract</p>
      <h2>Use the template, or let the app map your column names</h2>
    </div>
    <p>The template is the safest route, but it is not mandatory. Free-form metadata are matched against explicit aliases and then confirmed manually.</p>
  </div>

  <div class="contract">
    <div>
      <h3>Recommended long-format metadata</h3>
      <p>One row = one assay. This handles missing omics layers, repeated time points and technical replicates without changing the schema.</p>
      <pre>subject_id,sample_id,assay_id,omic,condition,timepoint,batch,technical_replicate,outcome</pre>
      <div class="actions">
        <button class="btn btn-primary" type="button" onclick={downloadGeneratedTemplate}>Generate template from my protocol</button>
        <a class="btn btn-outline" href={`${base}/multiomics/metadata_template.csv`} download>Generic metadata template</a>
        <a class="btn btn-outline" href={`${base}/multiomics/transcriptomics_template.csv`} download>RNA matrix template</a>
        <a class="btn btn-outline" href={`${base}/multiomics/proteomics_template.csv`} download>Protein matrix template</a>
        <a class="btn btn-outline" href={`${base}/multiomics/metabolomics_template.csv`} download>Metabolite matrix template</a>
      </div>
    </div>

    <div class="demo-card">
      <p class="eyebrow">Built-in demonstration</p>
      <h3>Treatment × time, three omics</h3>
      <p>8 subjects (4 control + 4 treatment), two time points, three matched omics layers, plus one RNA technical replicate for the same biological sample.</p>
      <button class="btn btn-primary" type="button" data-testid="multiomics-load-demo" onclick={loadDemo}>Load the demo locally</button>
      <div class="demo-links">
        <a href={`${base}/multiomics/demo_metadata.csv`} download>metadata</a>
        <a href={`${base}/multiomics/demo_transcriptomics.csv`} download>RNA</a>
        <a href={`${base}/multiomics/demo_proteomics.csv`} download>protein</a>
        <a href={`${base}/multiomics/demo_metabolomics.csv`} download>metabolites</a>
      </div>
    </div>
  </div>

  <details class="dictionary">
    <summary>Detailed metadata dictionary</summary>
    <div class="dictionary-table">
      <div><b>Column</b><b>Meaning</b><b>Example</b><b>Rule</b></div>
      <div><code>subject_id</code><span>Independent biological unit</span><span>P001</span><span>Same value across all visits/omics for one participant, animal or culture.</span></div>
      <div><code>sample_id</code><span>Physical biological specimen</span><span>P001_T0</span><span>Same value only when assays come from the same specimen.</span></div>
      <div><code>assay_id</code><span>Technical measurement / run</span><span>RNA001</span><span>Must match the corresponding matrix row/column identifier exactly.</span></div>
      <div><code>omic</code><span>Measured layer</span><span>transcriptomics</span><span>Canonical values: transcriptomics, proteomics, metabolomics.</span></div>
      <div><code>condition</code><span>Experimental group</span><span>treatment</span><span>Use one consistent vocabulary across subjects.</span></div>
      <div><code>timepoint</code><span>Visit / experimental time</span><span>T12</span><span>Required for longitudinal designs.</span></div>
      <div><code>batch</code><span>Technical batch</span><span>RNA_B1</span><span>Keep assay-specific batches even when different omics use different batches.</span></div>
      <div><code>technical_replicate</code><span>Repeated technical assay</span><span>1</span><span>Distinct assay_id, same sample_id + omic.</span></div>
      <div><code>outcome</code><span>Primary phenotype / endpoint</span><span>responder</span><span>Only if used by the scientific question.</span></div>
    </div>
  </details>

  <details class="aliases">
    <summary>How automatic column recognition works</summary>
    <p>Column names are normalised (case, spaces, hyphens and accents ignored), then compared with a controlled alias list. Automatic recognition is only accepted when exactly one column matches a field.</p>
    <div class="alias-grid">
      {#each fieldDefinitions as field}
        <article>
          <strong>{field.key}</strong>
          <span>{field.required ? 'required' : 'optional'}</span>
          <p>{field.aliases.join(', ')}</p>
        </article>
      {/each}
    </div>
    <p class="note">The alias list proposes a mapping; it does not silently redefine the study. Ambiguous or missing fields must be mapped manually.</p>
  </details>
</section>

<section class="panel">
  <div class="section-head">
    <div>
      <p class="eyebrow">Step 5 · Upload & mapping</p>
      <h2>Match metadata and matrices before analysis</h2>
    </div>
    <p>Matrix columns are interpreted as assay IDs and checked against the metadata. No relationship is inferred from similar-looking patient names.</p>
  </div>

  <div class="uploads">
    <label class:loaded={files.metadata}>
      <strong>Sample metadata</strong>
      <span>Long format preferred; arbitrary headers accepted if they can be mapped.</span>
      <input type="file" accept=".csv,.tsv,.txt" onchange={(event) => selectFile('metadata', event)} />
      <small>{files.metadata ? files.metadata.name : 'No file selected'}</small>
    </label>

    <label class:loaded={files.transcriptomics}>
      <strong>Transcriptomics</strong>
      <span>First column = feature ID; following columns = assay IDs.</span>
      <input type="file" accept=".csv,.tsv,.txt" onchange={(event) => selectFile('transcriptomics', event)} />
      <small>{files.transcriptomics ? files.transcriptomics.name : 'No file selected'}</small>
    </label>

    <label class:loaded={files.proteomics}>
      <strong>Proteomics</strong>
      <span>First column = feature ID; following columns = assay IDs.</span>
      <input type="file" accept=".csv,.tsv,.txt" onchange={(event) => selectFile('proteomics', event)} />
      <small>{files.proteomics ? files.proteomics.name : 'No file selected'}</small>
    </label>

    <label class:loaded={files.metabolomics}>
      <strong>Metabolomics</strong>
      <span>First column = feature ID; following columns = assay IDs.</span>
      <input type="file" accept=".csv,.tsv,.txt" onchange={(event) => selectFile('metabolomics', event)} />
      <small>{files.metabolomics ? files.metabolomics.name : 'No file selected'}</small>
    </label>
  </div>

  {#if metadataError}
    <p class="error">{metadataError}</p>
  {/if}

  {#if metadataHeaders.length}
    <div class="mapping">
      <div class="mapping-head">
        <div>
          <h3>Confirm column mapping</h3>
          <p>{metadataHeaders.length} columns detected · delimiter: {metadataDelimiter} · {metadataRows.length} assay rows</p>
        </div>
        <span class:ok={requiredMappingsComplete}>{requiredMappingsComplete ? 'Required fields mapped' : 'Mapping incomplete'}</span>
      </div>

      <div class="mapping-grid">
        {#each fieldDefinitions as field}
          <label>
            <span><strong>{field.label}</strong> <small>{field.required ? 'required' : 'optional'}</small></span>
            <select value={columnMapping[field.key]} onchange={(event) => setMapping(field.key, event.currentTarget.value)}>
              <option value="">— not mapped —</option>
              {#each metadataHeaders as header}
                <option value={header}>{header}</option>
              {/each}
            </select>
          </label>
        {/each}
      </div>
    </div>

    <div class="validation">
      <article>
        <span>Biological units</span>
        <strong>{mappedSubjects || '—'}</strong>
        {#if subjectCount && mappedSubjects && subjectCount !== mappedSubjects}
          <small class="warning">Declared {subjectCount}; metadata contains {mappedSubjects}.</small>
        {:else}
          <small>Unique mapped subject IDs.</small>
        {/if}
      </article>
      <article>
        <span>Biological samples</span>
        <strong>{mappedSamples || '—'}</strong>
        <small>Unique specimens across visits / conditions.</small>
      </article>
      <article>
        <span>Assays</span>
        <strong>{mappedAssays || '—'}</strong>
        <small>Unique technical measurement IDs.</small>
      </article>
      <article>
        <span>Technical replicate groups</span>
        <strong>{replicateGroups.length}</strong>
        <small>{replicateGroups.length ? replicateGroups.map((item) => item.key.replace('::', ' / ')).slice(0, 3).join(', ') : 'None detected from repeated sample + omic pairs.'}</small>
      </article>
    </div>

    <div class="matrix-checks">
      {#each omicLayers as layer}
        {@const match = matrixMatch(layer)}
        <article>
          <div>
            <strong>{omicLabels[layer]}</strong>
            <span>{matrixInfo[layer].sampleIds.length ? `${matrixInfo[layer].sampleIds.length} data columns` : 'not loaded'}</span>
          </div>
          {#if matrixInfo[layer].sampleIds.length}
            <p><b>{match.matched}/{match.expected}</b> expected assay IDs matched.</p>
            {#if match.orientation === 'transposed'}
              <small class="warning">Assay IDs match rows better than columns: the matrix appears transposed.</small>
            {/if}
            {#if match.missing.length}<small class="warning">Missing from matrix: {match.missing.slice(0, 5).join(', ')}</small>{/if}
            {#if match.extra.length && match.orientation !== 'transposed'}<small class="warning">Not declared in metadata: {match.extra.slice(0, 5).join(', ')}</small>{/if}
          {:else}
            <p class="muted">Load a matrix to validate assay IDs.</p>
          {/if}
        </article>
      {/each}
    </div>
  {/if}

  <div class="status" class:ready>
    <strong>{omicsCount}/3 omics selected</strong>
    <span>{ready
      ? 'The structural contract and scientific objective are sufficient to run the deterministic MVP.'
      : !objectiveOperational
        ? 'This objective is validation-only in the current MVP; no surrogate inferential analysis will be run.'
        : 'Select at least two omics layers and map subject_id, sample_id, assay_id and omic.'}</span>
  </div>

  <div class="run-box">
    <div>
      <p class="eyebrow">Deterministic engine</p>
      <h3>Run the analysis from the uploaded matrices</h3>
      <p>No LLM is used. The current MVP performs declared-data preprocessing, technical-replicate aggregation, technical-batch confounding checks, two-group or longitudinal inference, BH-FDR correction, cross-omics differential correlation and optional Reactome over-representation.</p>
      <label class="inline-check">
        <input type="checkbox" bind:checked={resolveIdentifiers} />
        <span>Resolve selected non-canonical metabolite labels with ChEBI before pathway analysis</span>
      </label>
      <label class="inline-check">
        <input type="checkbox" bind:checked={useReactome} />
        <span>Query Reactome with selected molecular identifiers only</span>
      </label>
    </div>
    <button class="btn btn-primary" type="button" data-testid="multiomics-run" disabled={!ready || analysisStatus === 'running'} onclick={runAnalysis}>
      {analysisStatus === 'running' ? 'Running…' : 'Run deterministic analysis'}
    </button>
  </div>
  {#if analysisError}<p class="error">{analysisError}</p>{/if}
</section>

{#if analysisResult}
<section class="panel demo-results" id="analysis-results" data-testid="multiomics-results">
  <div class="section-head">
    <div>
      <p class="eyebrow">{demoLoaded ? 'Demo results · computed now' : 'Analysis results · deterministic MVP'}</p>
      <h2>Computed multi-omics results</h2>
    </div>
    <div class="result-actions">
      <button class="btn btn-outline" type="button" onclick={downloadAnalysisJson}>Download JSON</button>
      {#if analysisResult.reactome?.combined?.token}
        <a class="btn btn-outline" href={`https://reactome.org/PathwayBrowser/#DTAB=AN&ANALYSIS=${analysisResult.reactome.combined.token}`} target="_blank" rel="noreferrer">Open in Reactome ↗</a>
      {/if}
    </div>
  </div>

  <div class="computed-summary">
    <article><span>Subjects</span><strong>{analysisResult.metadataSummary.subjects}</strong></article>
    <article><span>Biological samples</span><strong>{analysisResult.metadataSummary.samples}</strong></article>
    <article><span>Assays</span><strong>{analysisResult.metadataSummary.assays}</strong></article>
    <article><span>Conditions</span><strong>{analysisResult.metadataSummary.conditions.join(' / ') || '—'}</strong></article>
    <article><span>Time points</span><strong>{analysisResult.metadataSummary.timepoints.join(' / ') || '—'}</strong></article>
  </div>

  {#if analysisResult.metadataSummary.overlap?.pairwise?.length}
    <div class="overlap-box">
      <div>
        <p class="eyebrow">Sample overlap actually used</p>
        <strong>{analysisResult.metadataSummary.overlap.allMatched} subject(s) present in every loaded omics layer</strong>
      </div>
      <div class="overlap-pairs">
        {#each analysisResult.metadataSummary.overlap.pairwise as pair}
          <span>{omicLabel(pair.layerA)} ↔ {omicLabel(pair.layerB)}: <b>{pair.matchedSubjects}</b> matched</span>
        {/each}
      </div>
    </div>
  {/if}

  {#if analysisResult.metadataSummary.batchAudit}
    <div class="overlap-box">
      <div>
        <p class="eyebrow">Technical batch audit</p>
        <strong>Batch structure checked before biological inference</strong>
      </div>
      <div class="overlap-pairs">
        {#each omicLayers as layer}
          {#if analysisResult.metadataSummary.batchAudit[layer]}
            {@const audit = analysisResult.metadataSummary.batchAudit[layer]}
            <span>{omicLabel(layer)}: <b>{audit.status.replaceAll('_', ' ')}</b>{audit.batches?.length ? ' · ' + audit.batches.length + ' batch(es)' : ''}</span>
          {/if}
        {/each}
      </div>
    </div>
  {/if}

  {#if analysisResult.identifierResolution?.metabolomics}
    <div class="identifier-resolution">
      <div class="integration-head">
        <div>
          <p class="eyebrow">Metabolite identifier resolution</p>
          <h3>Original labels → canonical identifiers sent to pathway analysis</h3>
        </div>
        <span>{analysisResult.identifierResolution.metabolomics.resolvedCount} resolved · {analysisResult.identifierResolution.metabolomics.unresolvedCount} unresolved</span>
      </div>
      <div class="mapping-result-table">
        <div class="mapping-result-head"><b>Original</b><b>Query</b><b>Resolved ID</b><b>Status</b></div>
        {#each analysisResult.identifierResolution.metabolomics.mappings.slice(0, 20) as mapping}
          <div>
            <code>{mapping.original}</code>
            <span>{mapping.query || '—'}</span>
            <code>{mapping.resolved || '—'}</code>
            <span>{mapping.status}</span>
          </div>
        {/each}
      </div>
      <p class="note">Only exact ChEBI label matches or explicit deterministic lipid aliases are accepted automatically. Uncertain matches remain unresolved rather than being guessed.</p>
    </div>
  {/if}

  <div class="actual-layer-grid">
    {#each omicLayers as layer}
      {#if analysisResult.layers[layer]}
        {@const result = analysisResult.layers[layer]}
        <article>
          <div class="layer-title">
            <div>
              <span class="method-tag">{omicLabels[layer]}</span>
              <h3>{result.contrast || 'No valid contrast'}</h3>
            </div>
            <button class="text-button" type="button" onclick={() => downloadLayerCsv(layer)}>CSV ↓</button>
          </div>

          {#if result.error}
            <p class="error">{result.error}</p>
          {:else}
            <p class="muted">
              {result.mode === 'multi-group-permutation-anova'
                ? `group sizes: ${result.groupSizes.join(' / ')} · ${result.inferenceMethod || result.mode}`
                : `n=${result.groupSizes[0]} vs ${result.groupSizes[1]} · ${result.mode} · ${result.inferenceMethod || 'inference'}`}
            </p>
            <div class="preprocess-list">
              {#each result.steps as step}<span>{step}</span>{/each}
              {#if result.replicateGroups?.length}<span>{result.replicateGroups.length} technical-replicate group(s) averaged on the transformed scale</span>{/if}
            </div>
            <p class="selection-rule">{result.selectionRule}</p>
            {#if result.inferencePolicy}<p class="selection-rule"><strong>Inference:</strong> {result.inferencePolicy}</p>{/if}
            <div class="feature-table">
              <div class="feature-head"><b>Feature</b><b>{result.effectScale === 'log2' ? 'Fold ratio' : 'Effect'}</b><b>p perm.</b><b>q BH</b></div>
              {#each result.rows.slice(0, 10) as row}
                <div>
                  <code>{row.feature}</code>
                  {#if row.foldRatio != null}
                    <span class:negative={row.foldRatio != null && row.foldRatio < 1}>{row.foldRatio == null ? row.effect.toFixed(3) : `${row.foldRatio.toFixed(2)}×`}</span>
                  {:else}
                    <span class:negative={row.effect < 0}>{row.effect.toPrecision(3)}</span>
                  {/if}
                  <span>{row.pValue == null ? '—' : row.pValue.toPrecision(3)}</span>
                  <span>{row.qValue == null ? '—' : row.qValue.toPrecision(3)}</span>
                </div>
              {/each}
            </div>
          {/if}
        </article>
      {/if}
    {/each}
  </div>

  <div class="integration-result cross-result">
    <div class="integration-head">
      <div>
        <p class="eyebrow">Direct cross-omics integration</p>
        <h3>Which molecular relationships change between the biological conditions?</h3>
      </div>
      <span>Spearman + Fisher z + BH-FDR</span>
    </div>
    <div class="api-summary">
      <span><strong>{analysisResult.crossOmics?.testedPairs ?? 0}</strong> matched cross-omic pairs tested</span>
      <span><strong>{analysisResult.crossOmics?.significantPairs ?? 0}</strong> pairs with q ≤ 0.10</span>
    </div>
    {#if analysisResult.crossOmics?.pairs?.length}
      <div class="cross-table">
        <div class="cross-head"><b>Pair</b><b>Pattern</b><b>r reference</b><b>r comparison</b><b>Δr</b><b>q BH</b></div>
        {#each analysisResult.crossOmics.pairs.slice(0, 15) as pair}
          <div>
            <span><code>{pair.featureA}</code> <small>{pair.layerA}</small> ↔ <code>{pair.featureB}</code> <small>{pair.layerB}</small></span>
            <span class="pattern-tag">{pair.pattern.replaceAll('_', ' ')}</span>
            <span>{Number.isFinite(pair.rReference) ? pair.rReference.toFixed(2) : '—'}</span>
            <span>{Number.isFinite(pair.rComparison) ? pair.rComparison.toFixed(2) : '—'}</span>
            <strong>{Number.isFinite(pair.deltaR) ? pair.deltaR.toFixed(2) : '—'}</strong>
            <span>{pair.qValue == null ? '—' : pair.qValue.toPrecision(3)}</span>
          </div>
        {/each}
      </div>
      <p class="note">{analysisResult.crossOmics.method}. Only subjects represented in both layers contribute to a pair; no imputation is used here.</p>
    {:else}
      <p class="muted">No cross-omic correlation test was estimable with the current group sizes and matched subjects.</p>
    {/if}
  </div>

  <div class="integration-result">
    <div class="integration-head">
      <div>
        <p class="eyebrow">Integrated pathway result</p>
        <h3>Reactome receives the selected gene/protein/metabolite identifiers together</h3>
      </div>
      <span>deterministic ORA</span>
    </div>

    {#if analysisResult.reactome}
      <div class="api-summary">
        <span><strong>{analysisResult.reactome.combined.pathwaysFound}</strong> pathways found</span>
        <span><strong>{analysisResult.reactome.combined.identifiersNotFound}</strong> identifiers not found</span>
      </div>
      <div class="pathway-table" data-testid="multiomics-pathways">
        <div class="pathway-head"><b>Pathway</b><b>Combined FDR</b><b>RNA</b><b>Protein</b><b>Metabolite</b><b>Layers ≤0.10</b></div>
        {#each analysisResult.reactome.consensus.slice(0, 15) as pathway}
          <div>
            <a href={`https://reactome.org/content/detail/${pathway.id}`} target="_blank" rel="noreferrer">{pathway.name}</a>
            <span>{Number.isFinite(pathway.fdr) ? pathway.fdr.toPrecision(3) : '—'}</span>
            <span>{pathway.layerEvidence.transcriptomics?.fdr != null ? pathway.layerEvidence.transcriptomics.fdr.toPrecision(2) : '—'}</span>
            <span>{pathway.layerEvidence.proteomics?.fdr != null ? pathway.layerEvidence.proteomics.fdr.toPrecision(2) : '—'}</span>
            <span>{pathway.layerEvidence.metabolomics?.fdr != null ? pathway.layerEvidence.metabolomics.fdr.toPrecision(2) : '—'}</span>
            <strong>{pathway.supportingLayers}</strong>
          </div>
        {/each}
      </div>
      <p class="note">Ranking is deterministic: number of omics layers with pathway FDR ≤0.10, then combined Reactome FDR, then pathway coverage. This is an exploratory ranking, not a posterior probability or causal score.</p>
      <p class="note"><strong>Enrichment background:</strong> {analysisResult.reactome.backgroundPolicy}. {analysisResult.reactome.backgroundCaveat} For targeted or pre-filtered panels, pathway p-values/FDR should therefore be interpreted as exploratory until an assay-specific universe is supported.</p>
    {:else if analysisResult.reactomeError}
      <div class="api-error">
        <strong>Local statistics completed; Reactome could not be reached.</strong>
        <p>{analysisResult.reactomeError}</p>
        <p>The matrices have still not left the browser. Re-run later or disable Reactome to use the local statistical output only.</p>
      </div>
    {:else}
      <p class="muted">Reactome querying was disabled for this run.</p>
    {/if}
  </div>

  <div class="evidence-layers">
    <article>
      <strong>Observed</strong>
      <p>Values parsed from the uploaded matrices.</p>
    </article>
    <article>
      <strong>Statistical inference</strong>
      <p>Permutation contrasts plus cross-omics Spearman correlation differences, with Benjamini–Hochberg correction.</p>
    </article>
    <article>
      <strong>External knowledge</strong>
      <p>Reactome pathway mapping and over-representation from the selected molecular identifiers.</p>
    </article>
    <article>
      <strong>Not inferred</strong>
      <p>No LLM narrative, causal claim or invented biological mechanism is generated.</p>
    </article>
  </div>
</section>
{/if}

<section class="panel">
  <div class="section-head">
    <div>
      <p class="eyebrow">Step 6 · Proposed analysis & biological databases</p>
      <h2>The decision engine is deterministic and inspectable</h2>
    </div>
    <p>The statistical branch is selected from explicit study-design rules and remains inspectable.</p>
  </div>

  <div class="plan">
    <div>
      <span class="method-tag">Selected workflow</span>
      <h3>{analysisPlan}</h3>
      <p class="muted">Protocol: {studySetting.replaceAll('_', ' ')} · {designType} · {groupCount === '3plus' ? '≥3' : groupCount} group(s) · {sampleOverlap.replaceAll('_', ' ')}.</p>
    </div>
    <ul>
      <li><strong>Same specimen:</strong> assays are linked by <code>sample_id</code>, never by fuzzy name matching.</li>
      <li><strong>Repeated subject:</strong> two time points use within-subject change; ≥3 numeric-labelled times use an individual slope.</li>
      <li><strong>Paired design:</strong> within-subject differences use a sign-flip permutation test. Crossover designs are refused until period/sequence effects are modelled.</li>
      <li><strong>Technical replicate:</strong> multiple assays with the same <code>sample_id + omic</code> are flagged before analysis.</li>
      <li><strong>Technical batch:</strong> complete condition/time confounding with batch blocks inference. Multiple non-confounded batches are reported explicitly; the current browser MVP does not silently estimate a batch coefficient.</li>
      <li><strong>Covariates:</strong> their availability is recorded in the protocol, but covariate-adjusted outcome/regression models are not yet part of this deterministic MVP.</li>
      <li><strong>Partial omics:</strong> absent layers are distinguished from missing values inside an observed matrix.</li>
      <li><strong>Supervised methods:</strong> only proposed when a target exists and the effective sample size is compatible with the method.</li>
    </ul>
  </div>

  <div class="database-bridge">
    <div class="section-head compact">
      <div>
        <p class="eyebrow">Identifier → biology bridge</p>
        <h3>Public databases provide meaning after the measurements are validated</h3>
      </div>
      <p>Only molecular identifiers needed for annotation/pathway/network queries should be sent to public APIs. Subject IDs, metadata and abundance matrices remain outside these calls.</p>
    </div>
    <div class="database-grid">
      {#each databaseRegistry as db}
        <article>
          <span>{db.scope} · {db.status}</span>
          <h3>{db.name}</h3>
          <p>{db.role}</p>
          <a href={db.url} target="_blank" rel="noreferrer">Official API / documentation ↗</a>
        </article>
      {/each}
    </div>
    <div class="resolution-flow">
      <code>{transcriptomicsIdType}</code>
      <b>+</b>
      <code>{proteomicsIdType}</code>
      <b>+</b>
      <code>{metabolomicsIdType}</code>
      <span>→ current engine: conservative ChEBI resolution for metabolites (optional) → Reactome pathway integration. Ensembl, UniProt, UniChem, KEGG and STRING are explicit registry targets, not hidden automatic calls.</span>
    </div>

    <details class="aliases">
      <summary>Public validation suite used to test the deterministic engine</summary>
      <div class="alias-grid">
        <article><strong>Nutrimouse</strong><span>engine truth test</span><p>PPARα-dependent transcript/metabolite signal, CYP3A11 and lipid-pathway recovery.</p></article>
        <article><strong>TCGA breast</strong><span>engine truth test</span><p>HER2/LumA contrast plus Basal/Her2/LumA multi-group inference.</p></article>
        <article><strong>IntLIM NCI-60 + BRCA</strong><span>cross-omics truth test</span><p>Published condition-dependent gene–metabolite correlation changes.</p></article>
        <article><strong>AgingHFCD</strong><span>3-omics reference test</span><p>RNA, protein and metabolite effect directions checked against public reference results.</p></article>
        <article><strong>LRRK2 G2019S</strong><span>2-omics reference test</span><p>RNA/protein direction agreement plus RAB/endocytic biology.</p></article>
        <article><strong>STATegra</strong><span>time-course + replicates</span><p>Real Ikaros time course and 36-sample metabolomics replicate design; processed representations are checked for direction and scale consistency.</p></article>
        <article><strong>PaintOmics planted multi-omics</strong><span>known ground truth</span><p>RNA/protein convergence is checked against a planted molecular module and recorded pathway truth set.</p></article>
        <article><strong>Bioconductor missRows NCI-60</strong><span>partial-overlap test</span><p>Confirms that only genuinely shared biological units are matched across layers.</p></article>
      </div>
      <p class="note">The automated suite is intentionally heterogeneous: it tests biological truth, sample matching, multi-group inference, replicate structure and cross-omics statistics rather than only checking that code executes.</p>
      <a href="https://github.com/rberrah/rberrah.github.io/actions/workflows/multiomics-public-benchmark.yml" target="_blank" rel="noreferrer">Open the public benchmark workflow ↗</a>
    </details>
  </div>
</section>

<section class="results-preview">
  <div class="section-head">
    <div>
      <p class="eyebrow">Integrated output</p>
      <h2>One multi-omics result, not three separate reports</h2>
    </div>
  </div>

  <div class="result-grid">
    <article>
      <span class="num">01</span>
      <h3>Direct cross-omics relations</h3>
      <p>Matched-subject correlations and condition-dependent correlation changes identify relationships that would be invisible in three separate reports.</p>
      <div class="mini-factor"><i></i><i></i><i></i></div>
    </article>

    <article>
      <span class="num">02</span>
      <h3>Consensus pathways</h3>
      <p>Pathways ranked by convergent evidence from transcripts, proteins and metabolites, with concordance and mapping confidence visible.</p>
      <div class="layers"><span>RNA ↑↑</span><span>Protein ↑</span><span>Metabolite ↑↑↑</span></div>
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
      <table><tbody>
        <tr><th>RNA</th><td>↑</td><th>Protein</th><td>↑</td><th>Metabolite</th><td>↑</td></tr>
        <tr><th>RNA</th><td>↑</td><th>Protein</th><td>↓</td><th colspan="2">discordant</th></tr>
      </tbody></table>
    </article>

    <article>
      <span class="num">06</span>
      <h3>Research-ready report</h3>
      <p>Observed data, integrated inference, external biological knowledge and hypotheses remain explicitly separated, with a reproducible methods appendix.</p>
      <div class="evidence"><span>Observed</span><span>Integrated</span><span>Knowledge</span><span>Hypothesis</span></div>
    </article>
  </div>
</section>

<style>
  .hero { max-width: 920px; padding: var(--space-12) 0 var(--space-8); }
  h1 { font-size: clamp(2.4rem, 6vw, 4.8rem); line-height: .98; max-width: 14ch; margin: var(--space-3) 0 var(--space-6); letter-spacing: -.045em; }
  h2 { margin: 0; font-size: var(--text-2xl); }
  h3 { margin: 0 0 var(--space-2); font-size: var(--text-lg); }
  p { line-height: 1.65; }
  .lede { color: var(--text-secondary); font-size: var(--text-lg); max-width: 72ch; }
  .privacy { margin-top: var(--space-6); border-left: 3px solid var(--accent-ai); padding: var(--space-3) var(--space-4); background: var(--bg-secondary); color: var(--text-secondary); max-width: 76ch; }
  .privacy strong { color: var(--text-primary); }

  .workflow { display: grid; grid-template-columns: repeat(6, 1fr); border-block: 1px solid var(--border-strong); margin-bottom: var(--space-12); }
  .workflow div { padding: var(--space-4); border-right: 1px solid var(--border-subtle); }
  .workflow div:last-child { border-right: 0; }
  .workflow span { font-family: var(--font-mono); color: var(--accent-pk); display: block; margin-bottom: var(--space-2); }
  .workflow strong, .workflow small { display: block; }
  .workflow small { color: var(--text-muted); margin-top: 2px; }

  .panel, .results-preview { margin-top: var(--space-12); border-top: 1px solid var(--border-strong); padding-top: var(--space-6); }
  .section-head { display: flex; justify-content: space-between; align-items: end; gap: var(--space-6); margin-bottom: var(--space-6); }
  .section-head > p { max-width: 48ch; color: var(--text-secondary); margin: 0; font-size: var(--text-sm); }

  .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-4); max-width: 940px; }
  .form-grid label, .mapping-grid label { display: grid; gap: var(--space-2); }
  .form-grid label > span, .mapping-grid label > span { font-weight: 650; }
  small { color: var(--text-muted); font-weight: 400; }
  .wide { grid-column: 1 / -1; }
  input, select {
    width: 100%; box-sizing: border-box; padding: 11px 12px;
    color: var(--text-primary); background: var(--bg-primary);
    border: 1px solid var(--border-strong); border-radius: var(--radius); font: inherit;
  }
  input:focus, select:focus { outline: 2px solid var(--focus-ring); border-color: var(--accent-pk); }

  .method-card { max-width: 900px; margin-top: var(--space-6); padding: var(--space-5); background: var(--bg-secondary); border-left: 3px solid var(--accent-pd); }
  .method-card p { margin-bottom: 0; color: var(--text-secondary); }
  .method-tag { display: inline-block; margin-bottom: var(--space-2); font-family: var(--font-mono); font-size: var(--text-xs); color: var(--accent-pd); }

  .identity-grid, .validation { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); margin-top: var(--space-6); }
  .identity-grid article, .validation article { border: 1px solid var(--border-subtle); border-radius: var(--radius); padding: var(--space-4); }
  .identity-grid code { display: block; color: var(--accent-pk); margin-bottom: var(--space-2); }
  .identity-grid strong, .identity-grid p { display: block; }
  .identity-grid p, .validation small { color: var(--text-secondary); margin-bottom: 0; }

  .omics-question-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); }
  .omics-question-grid article { border: 1px solid var(--border-subtle); border-radius: var(--radius); padding: var(--space-4); background: var(--bg-secondary); }
  .omics-question-grid label { display: grid; gap: 6px; margin-top: var(--space-3); }
  .omics-question-grid label > span { font-weight: 650; font-size: var(--text-sm); }

  .contract { display: grid; grid-template-columns: 1.35fr .65fr; gap: var(--space-5); }
  .contract > div { border: 1px solid var(--border-subtle); border-radius: var(--radius); padding: var(--space-5); background: var(--bg-secondary); }
  pre { overflow-x: auto; padding: var(--space-3); background: var(--bg-primary); border: 1px solid var(--border-subtle); font-size: var(--text-xs); }
  .actions { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-top: var(--space-4); }
  .demo-card { background: linear-gradient(135deg, color-mix(in srgb, var(--accent-ai) 10%, transparent), var(--bg-secondary)) !important; }
  .demo-links { display: flex; flex-wrap: wrap; gap: 10px; margin-top: var(--space-4); font-size: var(--text-sm); }

  .dictionary, .aliases { margin-top: var(--space-5); border: 1px solid var(--border-subtle); border-radius: var(--radius); padding: var(--space-4); }
  .dictionary summary, .aliases summary { cursor: pointer; font-weight: 700; }
  .dictionary-table { margin-top: var(--space-4); }
  .dictionary-table > div { display: grid; grid-template-columns: .8fr 1.2fr .8fr 2fr; gap: var(--space-3); padding: 8px 0; border-bottom: 1px solid var(--border-subtle); font-size: var(--text-sm); }
  .dictionary-table > div:first-child { color: var(--text-muted); }

  .aliases summary { cursor: pointer; font-weight: 700; }
  .alias-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3); margin-top: var(--space-4); }
  .alias-grid article { background: var(--bg-secondary); padding: var(--space-3); border-radius: var(--radius); }
  .alias-grid article > span { margin-left: 8px; font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; }
  .alias-grid p { font-size: var(--text-xs); color: var(--text-secondary); word-break: break-word; margin-bottom: 0; }
  .note { color: var(--text-secondary); font-size: var(--text-sm); }

  .uploads { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-4); }
  .uploads label { display: grid; gap: var(--space-2); padding: var(--space-5); border: 1px dashed var(--border-strong); border-radius: var(--radius); background: var(--bg-secondary); }
  .uploads label.loaded { border-style: solid; border-color: var(--accent-pd); }
  .uploads label > span, .uploads label > small { color: var(--text-secondary); }
  .uploads input { background: var(--bg-primary); }

  .mapping { margin-top: var(--space-6); border: 1px solid var(--border-subtle); border-radius: var(--radius); padding: var(--space-5); }
  .mapping-head { display: flex; align-items: start; justify-content: space-between; gap: var(--space-4); margin-bottom: var(--space-4); }
  .mapping-head p { color: var(--text-secondary); margin: 0; }
  .mapping-head > span { font-family: var(--font-mono); font-size: var(--text-xs); border: 1px solid var(--border-strong); padding: 5px 8px; border-radius: 999px; }
  .mapping-head > span.ok { border-color: var(--accent-pd); color: var(--accent-pd); }
  .mapping-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); }

  .validation { grid-template-columns: repeat(4, 1fr); }
  .validation article > span, .validation article > strong, .validation article > small { display: block; }
  .validation article > span { color: var(--text-secondary); font-size: var(--text-sm); }
  .validation article > strong { font-size: var(--text-2xl); margin: 4px 0; }

  .matrix-checks { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); margin-top: var(--space-4); }
  .matrix-checks article { border-top: 2px solid var(--accent-pk); padding-top: var(--space-3); }
  .matrix-checks article > div { display: flex; justify-content: space-between; gap: 8px; }
  .matrix-checks article > div span { color: var(--text-muted); font-size: var(--text-xs); }
  .matrix-checks p { color: var(--text-secondary); margin-bottom: 4px; }
  .warning { color: var(--accent-ai) !important; }
  .error { color: var(--accent-ai); font-weight: 650; }

  .status { display: flex; gap: var(--space-3); align-items: baseline; margin-top: var(--space-5); padding: var(--space-3) var(--space-4); background: var(--bg-secondary); color: var(--text-secondary); }
  .status.ready strong { color: var(--accent-pd); }
  .run-box { display: flex; align-items: center; justify-content: space-between; gap: var(--space-6); margin-top: var(--space-4); padding: var(--space-5); border: 1px solid var(--border-strong); border-radius: var(--radius); background: var(--bg-secondary); }
  .run-box p { color: var(--text-secondary); max-width: 72ch; }
  .inline-check { display: flex; gap: 8px; align-items: center; font-size: var(--text-sm); }
  .inline-check input { width: auto; }
  .result-actions { display: flex; gap: 8px; flex-wrap: wrap; }
  .computed-summary { display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--space-3); }
  .overlap-box { display: flex; justify-content: space-between; gap: var(--space-4); align-items: start; margin-top: var(--space-4); padding: var(--space-4); border: 1px solid var(--border-subtle); border-radius: var(--radius); background: var(--bg-secondary); }
  .overlap-pairs { display: flex; flex-wrap: wrap; gap: 6px; justify-content: flex-end; }
  .overlap-pairs span { font-size: var(--text-xs); padding: 5px 7px; border: 1px solid var(--border-subtle); border-radius: 999px; }
  .identifier-resolution { margin-top: var(--space-5); padding: var(--space-4); border: 1px solid var(--border-subtle); border-radius: var(--radius); }
  .mapping-result-table { font-size: var(--text-xs); overflow-x: auto; }
  .mapping-result-table > div { display: grid; grid-template-columns: 1fr 1.2fr .8fr .7fr; gap: 8px; padding: 7px 0; border-bottom: 1px solid var(--border-subtle); min-width: 650px; }
  .mapping-result-head { color: var(--text-muted); }
  .computed-summary article { padding: var(--space-3); border: 1px solid var(--border-subtle); border-radius: var(--radius); background: var(--bg-secondary); }
  .computed-summary span, .computed-summary strong { display: block; }
  .computed-summary span { color: var(--text-muted); font-size: var(--text-xs); }
  .computed-summary strong { margin-top: 4px; }
  .actual-layer-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: var(--space-4); margin-top: var(--space-5); }
  .actual-layer-grid > article { border: 1px solid var(--border-subtle); border-radius: var(--radius); padding: var(--space-4); background: var(--bg-secondary); min-width: 0; }
  .layer-title { display: flex; justify-content: space-between; gap: 8px; align-items: start; }
  .text-button { background: transparent; border: 0; color: var(--link); cursor: pointer; padding: 0; font: inherit; font-size: var(--text-sm); }
  .preprocess-list { display: flex; flex-wrap: wrap; gap: 5px; margin: var(--space-3) 0; }
  .preprocess-list span { font-size: 10px; font-family: var(--font-mono); padding: 3px 5px; border: 1px solid var(--border-subtle); border-radius: 999px; }
  .selection-rule { color: var(--text-secondary); font-size: var(--text-xs); }
  .feature-table, .pathway-table { font-size: var(--text-xs); overflow-x: auto; }
  .feature-table > div { display: grid; grid-template-columns: 1.4fr .7fr .7fr .7fr; gap: 8px; padding: 7px 0; border-bottom: 1px solid var(--border-subtle); align-items: center; }
  .feature-head { color: var(--text-muted); }
  .feature-table .negative { color: var(--accent-ai); }
  .api-summary { display: flex; gap: var(--space-4); flex-wrap: wrap; margin: var(--space-3) 0; }
  .pathway-table > div { display: grid; grid-template-columns: minmax(220px,2fr) repeat(5,.65fr); gap: 8px; padding: 8px 0; border-bottom: 1px solid var(--border-subtle); align-items: center; min-width: 760px; }
  .pathway-head { color: var(--text-muted); }
  .cross-table { font-size: var(--text-xs); overflow-x: auto; }
  .cross-table > div { display: grid; grid-template-columns: minmax(280px,2.2fr) 1fr repeat(4,.65fr); gap: 8px; padding: 8px 0; border-bottom: 1px solid var(--border-subtle); align-items: center; min-width: 760px; }
  .cross-head { color: var(--text-muted); }
  .cross-table small { color: var(--text-muted); font-family: var(--font-mono); }
  .pattern-tag { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; }
  .api-error { padding: var(--space-4); border-left: 3px solid var(--accent-ai); background: var(--bg-primary); }


  .demo-results { scroll-margin-top: 90px; }
  .demo-story { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); }
  .demo-story article { padding: var(--space-4); border: 1px solid var(--border-subtle); border-radius: var(--radius); background: var(--bg-secondary); }
  .demo-story ul { margin: 0; padding-left: 1.1rem; color: var(--text-secondary); }
  .demo-story li { margin-bottom: 6px; }
  .replicate-flow { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin: var(--space-3) 0; }
  .replicate-flow code { padding: 4px 7px; border: 1px solid var(--border-strong); border-radius: 4px; background: var(--bg-primary); }

  .demo-omics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); margin-top: var(--space-5); }
  .demo-omics-grid > article { padding: var(--space-4); border: 1px solid var(--border-subtle); border-radius: var(--radius); }
  .effect-row { display: grid; grid-template-columns: 1fr auto; gap: 4px 10px; align-items: center; margin: 12px 0; }
  .effect-row > span { font-family: var(--font-mono); color: var(--accent-pd); }
  .effect-row > span.down { color: var(--accent-ai); }
  .effect-row > span.stable { color: var(--text-muted); }
  .effect-row > i { grid-column: 1 / -1; display: block; height: 6px; border-radius: 99px; background: var(--accent-pd); min-width: 4px; }
  .effect-row > i.down { background: var(--accent-ai); }
  .effect-row > i.stable { background: var(--text-muted); }

  .integration-result { margin-top: var(--space-6); padding: var(--space-5); border: 1px solid var(--border-strong); border-radius: var(--radius); background: var(--bg-secondary); }
  .integration-head { display: flex; justify-content: space-between; gap: var(--space-4); align-items: start; }
  .integration-head > span { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-muted); }
  .module-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); margin-top: var(--space-4); }
  .module-grid article { padding: var(--space-4); border: 1px solid var(--border-subtle); border-radius: var(--radius); background: var(--bg-primary); }
  .module-grid article.primary { border-color: var(--accent-pd); border-width: 2px; }
  .module-strength { font-family: var(--font-mono); font-size: 10px; color: var(--accent-pk); text-transform: uppercase; }
  .module-evidence { display: flex; flex-wrap: wrap; gap: 5px; margin: var(--space-3) 0; }
  .module-evidence span { font-family: var(--font-mono); font-size: 10px; padding: 4px 6px; border: 1px solid var(--border-subtle); border-radius: 999px; }

  .mechanism-demo { margin-top: var(--space-5); padding: var(--space-5); border-left: 3px solid var(--accent-pd); background: var(--bg-secondary); }
  .mechanism-flow { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
  .mechanism-flow > div { padding: var(--space-3); border: 1px solid var(--border-subtle); border-radius: var(--radius); background: var(--bg-primary); }
  .mechanism-flow small, .mechanism-flow strong { display: block; }
  .mechanism-flow small { color: var(--text-muted); }
  .mechanism-flow > b { color: var(--accent-pk); }

  .evidence-layers { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-3); margin-top: var(--space-5); }
  .evidence-layers article { padding: var(--space-3); border-top: 2px solid var(--accent-pd); background: var(--bg-secondary); }
  .evidence-layers article.future { border-top-color: var(--text-muted); }
  .evidence-layers p { color: var(--text-secondary); font-size: var(--text-sm); margin-bottom: 0; }

  .plan { display: grid; grid-template-columns: .9fr 1.1fr; gap: var(--space-6); padding: var(--space-5); background: var(--bg-secondary); border-left: 3px solid var(--accent-pk); }
  .plan li { margin-bottom: var(--space-2); color: var(--text-secondary); }
  .database-bridge { margin-top: var(--space-6); }
  .section-head.compact { align-items: start; margin-bottom: var(--space-4); }
  .database-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3); }
  .database-grid article { padding: var(--space-4); border: 1px solid var(--border-subtle); border-radius: var(--radius); background: var(--bg-secondary); }
  .database-grid article > span { font-family: var(--font-mono); font-size: 10px; color: var(--accent-pk); text-transform: uppercase; }
  .database-grid article p { color: var(--text-secondary); font-size: var(--text-sm); }
  .database-grid article a { font-size: var(--text-xs); }
  .resolution-flow { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: var(--space-4); padding: var(--space-4); background: var(--bg-secondary); border-left: 3px solid var(--accent-pd); }
  .resolution-flow code { border: 1px solid var(--border-strong); border-radius: 5px; padding: 4px 7px; background: var(--bg-primary); }


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
  .muted { color: var(--text-muted); }

  @media (max-width: 1000px) {
    .workflow, .result-grid { grid-template-columns: repeat(2, 1fr); }
    .contract, .plan { grid-template-columns: 1fr; }
    .alias-grid, .mapping-grid, .matrix-checks, .identity-grid, .omics-question-grid, .database-grid, .demo-story, .demo-omics-grid, .module-grid, .evidence-layers, .actual-layer-grid, .computed-summary { grid-template-columns: repeat(2, 1fr); }
    .validation { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 640px) {
    .section-head, .mapping-head { align-items: start; flex-direction: column; }
    .form-grid, .uploads, .result-grid, .workflow, .alias-grid, .mapping-grid, .matrix-checks, .identity-grid, .validation, .omics-question-grid, .database-grid, .demo-story, .demo-omics-grid, .module-grid, .evidence-layers, .actual-layer-grid, .computed-summary { grid-template-columns: 1fr; }
    .run-box, .overlap-box { align-items: stretch; flex-direction: column; }
    .overlap-pairs { justify-content: flex-start; }
    .dictionary-table > div { grid-template-columns: 1fr; gap: 2px; padding: 12px 0; }
    .workflow div { border-right: 0; border-bottom: 1px solid var(--border-subtle); }
    .workflow div:last-child { border-bottom: 0; }
    .wide { grid-column: auto; }
    .status { align-items: start; flex-direction: column; }
  }
</style>
