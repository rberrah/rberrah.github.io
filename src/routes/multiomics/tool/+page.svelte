<script>
  import { base } from '$app/paths';
  import { language } from '$lib/stores/language';
  import { runDeterministicAnalysis, resultToCsv } from '$lib/multiomics/deterministic.js';

  /** @param {string} fr @param {string} en */
  const t = (fr, en) => $language === 'en' ? en : fr;

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
  let outcomeTimepoint = '';
  let covariatesAvailable = 'yes';
  let partialOmicsExpected = 'no';
  /** @type {string[]} */
  let selectedCovariates = [];
  let demoLoaded = false;
  let analysisStatus = 'idle';
  let analysisError = '';
  /** @type {any} */
  let analysisResult = null;
  let helpTooltip = { visible: false, text: '', left: 0, top: 0, placement: 'above' };
  let useReactome = true;
  let resolveIdentifiers = true;
  let referenceBackendMode = 'auto';
  let referenceBackendUrl = 'http://127.0.0.1:8787';
  let referenceBackendStatus = 'unchecked';
  let referenceBackendMessage = '';
  /** @type {any} */
  let referenceBackendHealth = null;

  let transcriptomicsPlatform = 'bulk_rnaseq';
  let transcriptomicsValues = 'raw_counts';
  let transcriptomicsIdType = 'ensembl_gene';
  let proteomicsPlatform = 'label_free';
  let proteomicsValues = 'lfq_intensity';
  let proteomicsIdType = 'uniprot';
  let metabolomicsPlatform = 'untargeted_lcms';
  let metabolomicsValues = 'peak_area';
  let metabolomicsIdType = 'chebi';
  let msBlankFilter = 'yes';
  let msBlankFold = 5;
  let msQcRsdFilter = 'yes';
  let msQcRsdThreshold = 0.30;
  let msDriftCorrection = 'yes';
  let msMnarStrategy = 'none';

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

  /** @param {Event} event */
  function showGlobalHelp(event) {
    const raw = event.target;
    if (!(raw instanceof Element)) return;
    const target = raw.closest('.help-tip');
    if (!target) return;
    const text = target.getAttribute('data-tooltip') || '';
    if (!text) return;
    const rect = target.getBoundingClientRect();
    const halfWidth = Math.min(170, Math.max(120, window.innerWidth * 0.38));
    const center = rect.left + rect.width / 2;
    const left = Math.min(window.innerWidth - halfWidth - 8, Math.max(halfWidth + 8, center));
    const above = rect.top > 150;
    helpTooltip = {
      visible: true,
      text,
      left,
      top: above ? rect.top - 9 : rect.bottom + 9,
      placement: above ? 'above' : 'below'
    };
  }

  /** @param {Event} event */
  function hideGlobalHelp(event) {
    const raw = event.target;
    if (!(raw instanceof Element) || !raw.closest('.help-tip')) return;
    helpTooltip = { ...helpTooltip, visible: false };
  }

  const omicLayers = /** @type {const} */ (['transcriptomics', 'proteomics', 'metabolomics']);
  /** @param {string} layer */
  function omicLabel(layer) {
    if (layer === 'transcriptomics') return t('Transcriptomique', 'Transcriptomics');
    if (layer === 'proteomics') return t('Protéomique', 'Proteomics');
    if (layer === 'metabolomics') return t('Métabolomique', 'Metabolomics');
    return layer;
  }

  /** @type {Record<string, [string,string]>} */
  const fieldLabels = {
    subject_id: ['Sujet / unité expérimentale', 'Subject / experimental unit'],
    sample_id: ['Échantillon biologique', 'Biological sample'],
    assay_id: ['Identifiant du dosage / run', 'Assay / run identifier'],
    omic: ['Couche omique', 'Omics layer'],
    condition: ['Condition / groupe', 'Condition / group'],
    timepoint: ['Temps / visite', 'Time point'],
    batch: ['Batch technique', 'Technical batch'],
    technical_replicate: ['Réplicat technique', 'Technical replicate'],
    outcome: ['Outcome / critère', 'Outcome / endpoint'],
    survival_time: ['Temps de survie / suivi', 'Survival / follow-up time'],
    survival_event: ['Événement de survie (0/1)', 'Survival event (0/1)'],
    sample_type: ['Type d’injection / échantillon', 'Injection / sample type'],
    injection_order: ['Ordre d’injection MS', 'MS injection order']
  };
  /** @param {string} key */
  const fieldLabel = (key) => {
    const labels = fieldLabels[key] || [key, key];
    return t(labels[0], labels[1]);
  };

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
    },
    {
      key: 'survival_time',
      label: 'Survival / follow-up time',
      required: false,
      aliases: ['survival_time', 'followup_time', 'follow_up_time', 'time_to_event', 'tte', 'duree_suivi', 'temps_survie', 'temps_evenement']
    },
    {
      key: 'survival_event',
      label: 'Survival event',
      required: false,
      aliases: ['survival_event', 'event', 'event_status', 'death', 'censor', 'status_event', 'evenement_survie', 'deces', 'censure']
    },
    {
      key: 'sample_type',
      label: 'Injection / sample type',
      required: false,
      aliases: ['sample_type','sample_class','sample_role','injection_type','qc_type','type_echantillon','type_injection','nature_echantillon']
    },
    {
      key: 'injection_order',
      label: 'MS injection order',
      required: false,
      aliases: ['injection_order','run_order','sequence_order','injection_number','order','ordre_injection','ordre_passage','numero_injection']
    }
  ];

  /** @type {Record<string,string>} */
  let columnMapping = Object.fromEntries(fieldDefinitions.map((field) => [field.key, '']));

  const objectives = {
    explore: {
      titleFr: 'Explorer la structure multi-omique partagée',
      titleEn: 'Explore the shared multi-omics structure',
      methodFr: 'ACP multi-blocs équilibrée',
      methodEn: 'Balanced multi-block PCA',
      detailFr: 'Les variables les plus informatives de chaque couche sont standardisées et pondérées par bloc afin d’extraire des axes latents communs sans variable cible.',
      detailEn: 'Top-variable features from each layer are standardized and block-balanced to extract shared latent axes without a target variable.'
    },
    groups: {
      titleFr: 'Comparer des groupes biologiques',
      titleEn: 'Compare biological groups',
      methodFr: 'Inférence déterministe ajustée',
      methodEn: 'Adjusted deterministic inference',
      detailFr: 'Ajustement explicite des batches/covariables, contrastes adaptés au design, BH-FDR, relations inter-omiques et convergence Reactome.',
      detailEn: 'Explicit batch/covariate adjustment, design-aware contrasts, BH-FDR, cross-omics relationships and Reactome convergence.'
    },
    outcome: {
      titleFr: 'Expliquer un outcome clinique ou expérimental',
      titleEn: 'Explain a clinical or experimental outcome',
      methodFr: 'Régression déterministe selon le type d’outcome',
      methodEn: 'Outcome-specific deterministic regression',
      detailFr: 'Régression linéaire, logistique, Poisson, ANCOVA multiclasse ou Cox selon l’outcome, plus validation prédictive nested-CV lorsque possible, avec covariables explicites et BH-FDR.',
      detailEn: 'Linear, logistic, Poisson, multiclass ANCOVA or Cox models are selected from the declared outcome, with nested-CV prediction when applicable, explicit covariates and BH-FDR.'
    },
    time: {
      titleFr: 'Étudier l’évolution au cours du temps',
      titleEn: 'Describe change over time',
      methodFr: 'Workflow longitudinal ajusté au design',
      methodEn: 'Design-aware longitudinal workflow',
      detailFr: 'Les mesures répétées utilisent un modèle à intercept aléatoire sujet avec interaction condition × temps, batch et covariables explicites.',
      detailEn: 'Repeated measurements use a subject random-intercept model with condition × time interaction and explicit batch/covariates.'
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
      scopeFr: 'gènes',
      role: 'Resolve Ensembl IDs and gene symbols, confirm species and canonical gene annotations.',
      roleFr: 'Résoudre les identifiants Ensembl et symboles de gènes, confirmer l’espèce et les annotations canoniques.',
      status: 'live when identifier resolution is enabled',
      statusFr: 'actif quand la résolution d’identifiants est activée',
      url: 'https://rest.ensembl.org/documentation/'
    },
    {
      name: 'UniProt',
      scope: 'proteins',
      scopeFr: 'protéines',
      role: 'Resolve protein accessions and cross-reference proteins to genes, Ensembl, Reactome and other resources.',
      roleFr: 'Résoudre les accessions protéiques et les relier aux gènes, à Ensembl, Reactome et d’autres ressources.',
      status: 'live when identifier resolution is enabled',
      statusFr: 'actif quand la résolution d’identifiants est activée',
      url: 'https://www.uniprot.org/help/id_mapping'
    },
    {
      name: 'ChEBI',
      scope: 'metabolites',
      scopeFr: 'métabolites',
      role: 'Resolve curated chemical entities, synonyms, structures and ontology relationships.',
      roleFr: 'Résoudre les entités chimiques curées, synonymes, structures et relations ontologiques.',
      status: 'live in the current engine',
      statusFr: 'actif dans le moteur actuel',
      url: 'https://www.ebi.ac.uk/chebi/tools'
    },
    {
      name: 'UniChem',
      scope: 'metabolites',
      scopeFr: 'métabolites',
      role: 'Cross-reference chemical identifiers between databases when the uploaded metabolite identifier is not ChEBI.',
      roleFr: 'Croiser les identifiants chimiques entre bases lorsque l’identifiant métabolite importé n’est pas ChEBI.',
      status: 'live for deterministic InChIKey → ChEBI resolution',
      statusFr: 'actif pour la résolution déterministe InChIKey → ChEBI',
      url: 'https://www.ebi.ac.uk/unichem/'
    },
    {
      name: 'KEGG',
      scope: 'pathways · optional',
      scopeFr: 'voies · optionnel',
      role: 'Optional academic-use cross-reference and pathway/reaction annotation. KEGG REST access is rate-limited and is not used as the core engine of the public MVP.',
      roleFr: 'Référence croisée et annotation de voies/réactions optionnelles pour usage académique. KEGG REST n’est pas le moteur central du prototype public.',
      status: 'optional registry target · not called automatically yet',
      statusFr: 'connecteur optionnel prévu · non appelé automatiquement',
      url: 'https://www.kegg.jp/kegg/rest/'
    },
    {
      name: 'Reactome',
      scope: 'pathways',
      scopeFr: 'voies',
      role: 'Map genes, proteins and ChEBI entities onto common pathways and reactions for integrated pathway interpretation.',
      roleFr: 'Mapper gènes, protéines et entités ChEBI sur des voies et réactions communes pour l’interprétation intégrée.',
      status: 'live in the current engine',
      statusFr: 'actif dans le moteur actuel',
      url: 'https://reactome.org/dev/analysis'
    },
    {
      name: 'STRING',
      scope: 'network',
      scopeFr: 'réseau',
      role: 'Build compact protein interaction modules after identifier resolution; not used as a substitute for the measured data.',
      roleFr: 'Construire des modules compacts d’interactions protéiques après résolution des identifiants, sans remplacer les données mesurées.',
      status: 'registry target · not called automatically yet',
      statusFr: 'connecteur prévu · non appelé automatiquement',
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
    resolveIdentifiers = false;
    referenceBackendMode = 'browser';
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

  /**
   * @param {Record<string,string>[]} rows
   * @param {Record<string,string>} mapping
   * @param {string} key
   */
  function uniqueMappedFrom(rows, mapping, key) {
    const column = mapping[key];
    return new Set(rows.map((row) => column ? row[column] ?? '' : '').filter(Boolean));
  }

  /**
   * @param {Record<string,string>[]} rows
   * @param {Record<string,string>} mapping
   */
  function technicalReplicateGroups(rows, mapping) {
    if (!mapping.sample_id || !mapping.omic) return [];
    /** @type {Record<string,number>} */
    const counts = {};
    for (const row of rows) {
      const sample = row[mapping.sample_id] ?? '';
      const rawOmic = row[mapping.omic] ?? '';
      const omic = canonicalOmic(rawOmic) || normalise(rawOmic);
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

  /** @param {string} column */
  function toggleCovariate(column) {
    selectedCovariates = selectedCovariates.includes(column)
      ? selectedCovariates.filter((item) => item !== column)
      : [...selectedCovariates, column];
  }

  /**
   * @param {'transcriptomics' | 'proteomics' | 'metabolomics'} layer
   * @param {{rowIds:string[]}} info
   */
  function inferFeatureIdType(layer, info) {
    const ids = info.rowIds.slice(0, 50).map((id) => id.trim()).filter(Boolean);
    if (!ids.length) return { type: 'unknown', confidence: 0 };
    /** @type {Record<string, (id:string) => boolean>} */
    const tests = {
      ensembl_gene: (id) => /^ENSG\d+(?:\.\d+)?$/i.test(id),
      ensembl_protein: (id) => /^ENSP\d+(?:\.\d+)?$/i.test(id),
      uniprot: (id) => /^(?:[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9][A-Z][A-Z0-9]{2}[0-9])(?:-\d+)?$/.test(id),
      hmdb: (id) => /^HMDB\d+$/i.test(id),
      chebi: (id) => /^CHEBI:\d+$/i.test(id),
      inchikey: (id) => /^[A-Z]{14}-[A-Z]{10}-[A-Z]$/i.test(id),
      pubchem: (id) => /^CID:?\d+$/i.test(id),
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
    if (outcomeType !== 'none' && outcomeType !== 'survival') headers.push('outcome');
    if (outcomeType === 'survival') headers.push('survival_time', 'survival_event');
    if (['untargeted_lcms','targeted_lcms','gcms'].includes(metabolomicsPlatform)) headers.push('sample_type', 'injection_order');
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
            survival_time: '',
            survival_event: '',
            sample_type: 'biological',
            injection_order: String((subject - 1) * nTime * 3 + time * 3 + omics.indexOf(omic) + 1),
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

  function backendBaseUrl() {
    return referenceBackendUrl.trim().replace(/\/$/, '');
  }

  /**
   * @param {string} url
   * @param {RequestInit} options
   * @param {number} timeoutMs
   */
  async function fetchWithTimeout(url, options = {}, timeoutMs = 1800) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  async function checkReferenceBackend(showMessage = true) {
    if (referenceBackendMode === 'browser') {
      referenceBackendStatus = 'disabled';
      referenceBackendHealth = null;
      if (showMessage) referenceBackendMessage = t('Backend R désactivé.', 'R backend disabled.');
      return null;
    }
    const url = backendBaseUrl();
    if (!url) {
      referenceBackendStatus = 'unavailable';
      referenceBackendHealth = null;
      if (showMessage) referenceBackendMessage = t('URL du backend R manquante.', 'R backend URL is missing.');
      return null;
    }
    referenceBackendStatus = 'checking';
    try {
      const response = await fetchWithTimeout(url + '/health', { headers: { Accept: 'application/json' } }, 1800);
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const health = await response.json();
      referenceBackendStatus = 'available';
      referenceBackendHealth = health;
      referenceBackendMessage = t('Backend R disponible.', 'R backend available.');
      return health;
    } catch (error) {
      referenceBackendStatus = 'unavailable';
      referenceBackendHealth = null;
      if (showMessage) {
        referenceBackendMessage = t(
          'Backend R indisponible ; le moteur navigateur reste utilisable.',
          'R backend unavailable; the browser engine remains usable.'
        );
      }
      return null;
    }
  }

  async function referenceBackendPayload() {
    if (!files.metadata) throw new Error('Metadata file is required.');
    /** @type {Record<string,string>} */
    const matrices = {};
    for (const layer of omicLayers) {
      if (files[layer]) matrices[layer] = await files[layer].text();
    }
    return {
      protocol: {
        organism,
        objective,
        longitudinal: longitudinal === 'yes',
        designType,
        studySetting,
        unitType,
        groupCount,
        timepointCount,
        sampleOverlap,
        technicalReplicatesExpected,
        batchKnown,
        outcomeType,
        outcomeTimepoint,
        covariatesAvailable,
        covariateColumns: selectedCovariates,
        partialOmicsExpected,
        msBlankFilter,
        msBlankFold: Number(msBlankFold),
        msQcRsdFilter,
        msQcRsdThreshold: Number(msQcRsdThreshold),
        msDriftCorrection,
        msMnarStrategy
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
      columnMapping,
      metadataCsv: await files.metadata.text(),
      matrices
    };
  }

  async function runReferenceBackend() {
    const health = await checkReferenceBackend(false);
    if (!health) {
      if (referenceBackendMode === 'required') {
        throw new Error('Reference R backend is required but unavailable at ' + backendBaseUrl() + '.');
      }
      return {
        status: 'unavailable',
        url: backendBaseUrl(),
        message: 'Reference R backend was not reachable; browser results were retained.'
      };
    }
    referenceBackendStatus = 'running';
    referenceBackendMessage = t('Méthodes R de référence en cours…', 'Reference R methods running…');
    const payload = await referenceBackendPayload();
    const response = await fetch(backendBaseUrl() + '/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.status === 'error') {
      referenceBackendStatus = 'error';
      referenceBackendMessage = body.message || ('HTTP ' + response.status);
      if (referenceBackendMode === 'required') throw new Error(referenceBackendMessage);
      return {
        status: 'error',
        url: backendBaseUrl(),
        message: referenceBackendMessage
      };
    }
    referenceBackendStatus = 'done';
    referenceBackendMessage = t('Méthodes R de référence terminées.', 'Reference R methods completed.');
    return { ...body, url: backendBaseUrl() };
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
          unitType,
          groupCount,
          timepointCount,
          sampleOverlap,
          technicalReplicatesExpected,
          batchKnown,
          outcomeType,
          outcomeTimepoint,
          covariatesAvailable,
          covariateColumns: selectedCovariates,
          partialOmicsExpected,
          msBlankFilter,
          msBlankFold: Number(msBlankFold),
          msQcRsdFilter,
          msQcRsdThreshold: Number(msQcRsdThreshold),
          msDriftCorrection,
          msMnarStrategy
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
      if (referenceBackendMode !== 'browser') {
        const referenceBackend = await runReferenceBackend();
        analysisResult = { ...analysisResult, referenceBackend };
      }
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

  /** @param {any} qc */
  function poorReplicateCount(qc) {
    const correlations = /** @type {any[]} */ (qc?.replicateCorrelations || []);
    return correlations.filter((item) => Boolean(item?.warning)).length;
  }

  /** @param {unknown} value */
  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function downloadReproducibleReport() {
    if (!analysisResult) return;
    const result = analysisResult;
    const layerSections = Object.entries(result.layers || {}).map(([layer, layerResult]) => {
      const layerRows = /** @type {any[]} */ (layerResult.rows || []);
      const rows = layerRows.slice(0, 50).map((row) =>
        '<tr><td>' + escapeHtml(row.feature) + '</td><td>' +
        escapeHtml(Number.isFinite(row.effect) ? Number(row.effect).toPrecision(4) : '') + '</td><td>' +
        escapeHtml(row.pValue == null ? '' : Number(row.pValue).toPrecision(4)) + '</td><td>' +
        escapeHtml(row.qValue == null ? '' : Number(row.qValue).toPrecision(4)) + '</td></tr>'
      ).join('');
      const qc = layerResult.qc || {};
      return '<section><h2>' + escapeHtml(omicLabel(layer)) + '</h2>' +
        '<p><strong>Model:</strong> ' + escapeHtml(layerResult.inferenceMethod || layerResult.mode || '') + '</p>' +
        '<p><strong>QC:</strong> ' + escapeHtml(qc.featuresAfter ?? '—') + '/' + escapeHtml(qc.featuresBefore ?? '—') +
        ' features retained; median missing ' + escapeHtml(Number.isFinite(qc.medianMissingFraction) ? (100 * qc.medianMissingFraction).toFixed(1) + '%' : '—') + '.</p>' +
        (qc.inferenceTier?.note ? '<p><strong>Inference tier:</strong> ' + escapeHtml(qc.inferenceTier.label || qc.inferenceTier.level) + ' — ' + escapeHtml(qc.inferenceTier.note) + '</p>' : '') +
        '<table><thead><tr><th>Feature</th><th>Effect</th><th>p</th><th>q BH</th></tr></thead><tbody>' + rows + '</tbody></table></section>';
    }).join('');

    const pathwayRows = /** @type {any[]} */ (result.reactome?.consensus || []);
    const pathways = pathwayRows.slice(0, 30).map((pathway) =>
      '<tr><td>' + escapeHtml(pathway.name) + '</td><td>' +
      escapeHtml(Number.isFinite(pathway.assayUniverseFdr) ? pathway.assayUniverseFdr.toPrecision(4) : Number.isFinite(pathway.fdr) ? pathway.fdr.toPrecision(4) : '') +
      '</td><td>' + escapeHtml(pathway.supportingLayers) + '</td></tr>'
    ).join('');

    const embeddedJson = JSON.stringify(result).replaceAll('<', '\\u003c');
    const html = '<!doctype html><html lang="' + ($language === 'en' ? 'en' : 'fr') + '"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1"><title>Multi-omics reproducible report</title>' +
      '<style>body{font:14px/1.55 system-ui,sans-serif;max-width:1100px;margin:40px auto;padding:0 24px;color:#161616}h1,h2{line-height:1.15}table{border-collapse:collapse;width:100%;margin:12px 0 28px}th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}th{background:#f4f4f4}code,pre{font-family:ui-monospace,monospace}pre{white-space:pre-wrap;background:#f6f6f6;padding:12px}section{margin:32px 0}.muted{color:#666}</style></head><body>' +
      '<h1>PMx Explain — multi-omics reproducible report</h1>' +
      '<p class="muted">Generated ' + escapeHtml(result.generatedAt) + ' · engine ' + escapeHtml(result.engine?.version || 'unknown') + '</p>' +
      '<section><h2>Provenance</h2><pre>' + escapeHtml(JSON.stringify(result.inputManifest, null, 2)) + '</pre></section>' +
      '<section><h2>Protocol</h2><pre>' + escapeHtml(JSON.stringify(result.protocol, null, 2)) + '</pre></section>' +
      '<section><h2>Sample structure</h2><pre>' + escapeHtml(JSON.stringify(result.metadataSummary, null, 2)) + '</pre></section>' +
      layerSections +
      (result.supervisedIntegration ? '<section><h2>Supervised multiblock integration</h2><pre>' + escapeHtml(JSON.stringify(result.supervisedIntegration, null, 2)) + '</pre></section>' : '') +
      (result.predictiveOutcome ? '<section><h2>Predictive validation</h2><pre>' + escapeHtml(JSON.stringify(result.predictiveOutcome, null, 2)) + '</pre></section>' : '') +
      (result.referenceBackend ? '<section><h2>Reference R backend</h2><pre>' + escapeHtml(JSON.stringify(result.referenceBackend, null, 2)) + '</pre></section>' : '') +
      '<section><h2>Reactome pathways</h2><table><thead><tr><th>Pathway</th><th>Assay-universe FDR</th><th>Supporting layers</th></tr></thead><tbody>' + pathways + '</tbody></table></section>' +
      '<section><h2>Interpretation limits</h2><p>This report separates observed data, statistical inference and external pathway knowledge. Associations are not causal claims. External validation is required for predictive use.</p></section>' +
      '<script type="application/json" id="multiomics-analysis-json">' + embeddedJson + '</scr' + 'ipt>' +
      '</body></html>';

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'multiomics_reproducible_report.html';
    link.click();
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

  /**
   * @param {number} value
   * @param {any[]} points
   * @param {'pc1'|'pc2'} key
   */
  function qcAxisPercent(value, points, key) {
    const values = points.map((point) => Number(point[key])).filter(Number.isFinite);
    if (!values.length) return 50;
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (max === min) return 50;
    return 6 + 88 * (value - min) / (max - min);
  }

  /** @param {any} result @param {string} lang */
  function buildInterpretation(result, lang) {
    /** @param {string} fr @param {string} en */
    const pick = (fr, en) => lang === 'en' ? en : fr;
    const items = [];
    if (result.protocol?.objective === 'explore' && result.exploration?.components?.length) {
      const pc1 = result.exploration.components[0];
      const pct = Number.isFinite(pc1.explainedFraction) ? (100 * pc1.explainedFraction).toFixed(1) : '—';
      items.push({
        title: pick('Axe latent principal', 'Main latent axis'),
        text: pick(
          'PC1 résume ' + pct + ' % de la variance multi-blocs pondérée chez ' + result.exploration.subjects + ' sujets communs. Les variables avec les plus grands |loadings| sont celles qui structurent le plus cet axe.',
          'PC1 summarizes ' + pct + '% of the balanced multi-block variance across ' + result.exploration.subjects + ' shared subjects. Features with the largest absolute loadings contribute most to this axis.'
        )
      });
      items.push({
        title: pick('Attention au signe', 'Sign is arbitrary'),
        text: pick('Le signe d’un axe de PCA peut être inversé sans changer le résultat. Interprétez surtout la magnitude des loadings, la séparation des scores et la contribution des différentes omiques.', 'A PCA axis can be sign-flipped without changing the result. Focus on loading magnitude, score separation and contributions from the different omics layers.')
      });
    } else if (result.protocol?.objective === 'outcome') {
      const mode = result.protocol?.outcomeType || 'continuous';
      /** @type {Record<string,string>} */
      const effectTexts = {
        binary: pick('exp(effect) est un odds ratio.', 'exp(effect) is an odds ratio.'),
        count: pick('exp(effect) est un rate ratio.', 'exp(effect) is a rate ratio.'),
        survival: pick('exp(effect) est un hazard ratio.', 'exp(effect) is a hazard ratio.'),
        continuous: pick('effect est la variation attendue de l’outcome pour une unité de la variable omique.', 'effect is the expected outcome change per one feature unit.'),
        multiclass: pick('effect est l’écart maximal entre moyennes ajustées des classes.', 'effect is the maximum difference between adjusted class means.')
      };
      const effectText = effectTexts[mode] || '';
      items.push({
        title: pick('Association avec l’outcome', 'Outcome association'),
        text: pick('Chaque variable est testée avec le modèle déterminé par le type d’outcome. ', 'Each feature is tested with the model selected from the outcome type. ') + effectText
      });
      items.push({
        title: pick('Covariables', 'Covariates'),
        text: result.protocol?.covariateColumns?.length
          ? pick('Le modèle ajuste explicitement : ', 'The model explicitly adjusts for: ') + result.protocol.covariateColumns.join(', ') + '.'
          : pick('Aucune covariable supplémentaire n’a été sélectionnée.', 'No additional covariates were selected.')
      });
      if (result.predictiveOutcome?.status === 'ok') {
        const metrics = result.predictiveOutcome.metrics || {};
        const predictionText = mode === 'survival' && Number.isFinite(metrics.cIndex)
          ? pick(
              'La performance pronostique est mesurée hors échantillon par un C-index de Harrell de ' + metrics.cIndex.toFixed(3) + '. Cette valeur provient uniquement des folds externes de la nested cross-validation.',
              'Prognostic performance is assessed out of sample with a Harrell C-index of ' + metrics.cIndex.toFixed(3) + '. This value uses only outer-fold predictions from nested cross-validation.'
            )
          : mode === 'binary' && Number.isFinite(metrics.auc)
            ? pick(
                'La discrimination hors échantillon est résumée par une AUC de ' + metrics.auc.toFixed(3) + ', calculée sur les folds externes.',
                'Out-of-sample discrimination is summarized by an AUC of ' + metrics.auc.toFixed(3) + ', computed on outer-fold predictions.'
              )
            : pick(
                'La performance prédictive affichée provient des folds externes de la nested cross-validation et doit rester distincte des p-values d’association.',
                'Displayed predictive performance comes from outer nested-CV folds and should be kept distinct from association p-values.'
              );
        items.push({
          title: pick('Prédiction hors échantillon', 'Out-of-sample prediction'),
          text: predictionText
        });
      }
    } else {
      items.push({
        title: pick('Effet biologique', 'Biological effect'),
        text: pick('L’effet indique la direction et l’amplitude du contraste après prétraitement et ajustement des facteurs techniques/covariables déclarés. Pour une échelle log2, le fold ratio est 2^effect.', 'The effect gives the direction and magnitude of the contrast after preprocessing and declared technical/covariate adjustment. On a log2 scale, fold ratio equals 2^effect.')
      });
      items.push({
        title: pick('Significativité', 'Statistical evidence'),
        text: pick('La colonne q BH corrige les tests multiples. q ≤ 0,10 est utilisé ici comme seuil exploratoire ; il ne remplace ni la taille d’effet ni la plausibilité biologique.', 'BH q-values adjust for multiple testing. q ≤ 0.10 is used here as an exploratory threshold; it does not replace effect size or biological plausibility.')
      });
    }

    const adjustedEntries = Object.entries(result.metadataSummary?.adjustment || {})
      .filter(([, value]) => value?.applied);
    if (adjustedEntries.length) {
      const adjusted = adjustedEntries.map(([layer]) => omicLabel(layer));
      const directOutcome = adjustedEntries.some(([, value]) => String(value?.method || '').includes('direct nuisance'));
      items.push({
        title: pick('Ajustement technique', 'Technical adjustment'),
        text: directOutcome
          ? pick('Batch et covariables sélectionnées entrent directement dans les modèles d’outcome pour : ', 'Batch and selected covariates enter the outcome models directly for: ') + adjusted.join(', ') + '.'
          : pick('Une résidualisation OLS a été appliquée avant l’inférence pour : ', 'OLS residualisation was applied before inference for: ') + adjusted.join(', ') + '.'
      });
    }

    if (result.crossOmics?.significantPairs > 0) {
      items.push({
        title: pick('Relations inter-omiques', 'Cross-omics relationships'),
        text: pick(
          result.crossOmics.significantPairs + ' paire(s) présentent un changement de corrélation avec q ≤ 0,10. Cela signale une relation condition-dépendante, pas une causalité.',
          result.crossOmics.significantPairs + ' pair(s) show a correlation change at q ≤ 0.10. This indicates condition-dependent coupling, not causality.'
        )
      });
    }

    const topPathway = result.reactome?.consensus?.[0];
    if (topPathway) {
      items.push({
        title: pick('Voies biologiques', 'Biological pathways'),
        text: pick(
          'La voie la mieux classée est « ' + topPathway.name + ' », soutenue par ' + topPathway.supportingLayers + ' couche(s) à FDR ≤ 0,10. Le classement Reactome reste exploratoire et dépend de l’univers d’annotation.',
          'The top-ranked pathway is “' + topPathway.name + '”, supported by ' + topPathway.supportingLayers + ' layer(s) at FDR ≤ 0.10. Reactome ranking remains exploratory and depends on the annotation universe.'
        )
      });
    }

    items.push({
      title: pick('Ce que le résultat ne prouve pas', 'What the result does not prove'),
      text: pick('Aucune causalité, mécanisme non mesuré ou vérité clinique n’est déduite automatiquement. Les résultats doivent être confrontés au design, à la qualité des données, à la taille d’échantillon et à la littérature.', 'No causality, unmeasured mechanism or clinical truth is inferred automatically. Results must be interpreted against study design, data quality, sample size and external evidence.')
    });
    return items;
  }

  $: inferredTranscriptomicsId = inferFeatureIdType('transcriptomics', matrixInfo.transcriptomics);
  $: inferredProteomicsId = inferFeatureIdType('proteomics', matrixInfo.proteomics);
  $: inferredMetabolomicsId = inferFeatureIdType('metabolomics', matrixInfo.metabolomics);
  $: selectedObjective = objectives[objective];
  $: omicsCount = omicLayers.filter((key) => Boolean(files[key])).length;
  $: requiredMappingsComplete = fieldDefinitions.filter((field) => field.required).every((field) => Boolean(columnMapping[field.key]));
  $: mappedSubjects = uniqueMappedFrom(metadataRows, columnMapping, 'subject_id').size;
  $: mappedSamples = uniqueMappedFrom(metadataRows, columnMapping, 'sample_id').size;
  $: mappedAssays = uniqueMappedFrom(metadataRows, columnMapping, 'assay_id').size;
  $: availableOutcomeTimepoints = [...uniqueMappedFrom(metadataRows, columnMapping, 'timepoint')];
  $: if (availableOutcomeTimepoints.length <= 1 && outcomeTimepoint) outcomeTimepoint = '';
  $: replicateGroups = technicalReplicateGroups(metadataRows, columnMapping);
  $: canonicalMappedColumns = new Set(Object.values(columnMapping).filter(Boolean));
  $: availableCovariateColumns = metadataHeaders.filter((header) => !canonicalMappedColumns.has(header));
  $: if (selectedCovariates.some((header) => !availableCovariateColumns.includes(header))) {
    selectedCovariates = selectedCovariates.filter((header) => availableCovariateColumns.includes(header));
  }
  $: outcomeMappingComplete = objective !== 'outcome'
    || (outcomeType !== 'none'
      && (availableOutcomeTimepoints.length <= 1 || Boolean(outcomeTimepoint))
      && (outcomeType === 'survival'
        ? Boolean(columnMapping.survival_time && columnMapping.survival_event)
        : Boolean(columnMapping.outcome)));
  $: objectiveOperational = designType !== 'crossover';
  $: ready = omicsCount >= 2 && Boolean(files.metadata) && requiredMappingsComplete && outcomeMappingComplete && objectiveOperational;
  $: interpretationItems = analysisResult ? buildInterpretation(analysisResult, String($language || 'fr')) : [];
  $: analysisPlan = objective === 'explore'
    ? t('prétraitement → agrégation des réplicats → ajustement batch/covariables → standardisation par couche → ACP multi-blocs équilibrée → loadings → Reactome',
        'preprocessing → replicate aggregation → batch/covariate adjustment → within-layer scaling → balanced multi-block PCA → loadings → Reactome')
    : objective === 'outcome'
      ? t('prétraitement → agrégation → régression selon l’outcome + batch/covariables → BH-FDR → nested CV prédictive → Reactome',
          'preprocessing → aggregation → outcome-specific regression + batch/covariates → BH-FDR → nested predictive CV → Reactome')
      : objective === 'time'
        ? t('agrégation des réplicats → prétraitement → modèle condition × temps à intercept aléatoire sujet + batch/covariables → BH-FDR → intégration inter-omique → Reactome',
            'replicate aggregation → preprocessing → condition × time random-intercept model + batch/covariates → BH-FDR → cross-omics integration → Reactome')
        : t('agrégation des réplicats → prétraitement → ajustement batch/covariables → contraste de groupes → inférence → BH-FDR → intégration inter-omique → Reactome',
            'replicate aggregation → preprocessing → batch/covariate adjustment → group contrast → inference → BH-FDR → cross-omics integration → Reactome');
</script>

<svelte:window
  onmouseover={showGlobalHelp}
  onfocusin={showGlobalHelp}
  onmouseout={hideGlobalHelp}
  onfocusout={hideGlobalHelp}
/>

<svelte:head>
  <title>{t('Outil multi-omique — PMx Explain', 'Multi-omics tool — PMx Explain')}</title>
  <meta name="robots" content="noindex,nofollow,noarchive" />
  <meta name="description" content="Unlisted prototype for guided integration of transcriptomics, proteomics and metabolomics." />
</svelte:head>

<section class="hero">
  <a class="tool-back" href={`${base}/multiomics`}>← {t('Présentation de l’outil', 'Tool overview')}</a>
  <p class="eyebrow">{t('Prototype expérimental · outil · v1.2', 'Experimental prototype · tool · v1.2')}</p>
  <h1>{t('Des données multi-omiques à une interprétation biologique.', 'From multi-omics data to one biological interpretation.')}</h1>
  <p class="lede">
    {t('Décrivez le protocole, mappez les échantillons une seule fois, puis laissez le workflow intégrer transcriptomique, protéomique et métabolomique autour de structures partagées, d’associations et de voies biologiques.', 'Describe the protocol, map the samples once, then let the workflow integrate transcriptomics, proteomics and metabolomics around shared factors, associations, pathways and mechanisms.')}
  </p>
  <div class="privacy">
    <strong>{t('Prototype de recherche.', 'Research prototype.')}</strong>
    {t('Le moteur navigateur reste local. Lorsque Reactome est activé, seuls les identifiants moléculaires sélectionnés sont envoyés. Si le backend R de référence est activé et disponible, les métadonnées et matrices sont envoyées uniquement à l’URL de backend affichée ci-dessous — par défaut 127.0.0.1 sur votre propre machine.', 'The browser engine remains local. When Reactome is enabled, only selected molecular identifiers are sent. If the reference R backend is enabled and available, metadata and matrices are sent only to the backend URL shown below — by default 127.0.0.1 on your own machine.')}
  </div>
</section>

<section class="workflow" aria-label="Prototype workflow">
  <div><span>1</span><strong>{t('Question', 'Question')}</strong><small>{t('Objectif scientifique', 'Scientific objective')}</small></div>
  <div><span>2</span><strong>{t('Protocole', 'Protocol')}</strong><small>{t('Questions fermées', 'Closed design questions')}</small></div>
  <div><span>3</span><strong>{t('Type de données', 'Data type')}</strong><small>{t('Plateformes & identifiants', 'Platforms & identifiers')}</small></div>
  <div><span>4</span><strong>{t('Mapper', 'Map')}</strong><small>{t('Template ou colonnes reconnues', 'Template or recognised columns')}</small></div>
  <div><span>5</span><strong>{t('Valider', 'Validate')}</strong><small>{t('Échantillons & réplicats', 'Samples & replicates')}</small></div>
  <div><span>6</span><strong>{t('Intégrer', 'Integrate')}</strong><small>{t('Bases & multi-omique', 'Databases & multi-omics')}</small></div>
</section>

<section class="panel">
  <div class="section-head">
    <div>
      <p class="eyebrow">{t('Étape 1 · Question scientifique', 'Step 1 · Scientific question')}</p>
      <h2>{t('À quelle question l’expérience doit-elle répondre ?', 'What should the experiment answer?')}</h2>
    </div>
    <p>{t('La question sélectionne automatiquement la famille d’analyse. Il n’est pas nécessaire de choisir soi-même MOFA, DIABLO ou une autre méthode par son nom.', 'The question selects the analysis family. The researcher does not need to choose MOFA, DIABLO or another method by name.')}</p>
  </div>

  <div class="form-grid">
    <label class="wide">
      <span>{t('Objectif principal', 'Main objective')}</span>
      <select bind:value={objective}>
        <option value="explore">{t('Explorer la structure multi-omique partagée', 'Explore the shared multi-omics structure')}</option>
        <option value="groups">{t('Comparer des groupes / conditions', 'Compare groups / conditions')}</option>
        <option value="outcome">{t('Expliquer un outcome / phénotype', 'Explain an outcome or phenotype')}</option>
        <option value="time">{t('Étudier l’évolution au cours du temps', 'Study change over time')}</option>
      </select>
    </label>

    <label>
      <span>{t('Nom de l’étude', 'Study name')} <small>{t('optionnel', 'optional')}</small></span>
      <input bind:value={studyName} type="text" placeholder="e.g. Treatment response cohort" />
    </label>

    <label>
      <span>{t('Organisme', 'Organism')}</span>
      <select bind:value={organism}>
        <option value="human">{t('Humain', 'Human')}</option>
        <option value="mouse">{t('Souris', 'Mouse')}</option>
        <option value="rat">Rat</option>
        <option value="other">{t('Autre / à définir', 'Other / to define')}</option>
      </select>
    </label>
  </div>

  <aside class="method-card">
    <span class="method-tag">{$language === 'en' ? selectedObjective.methodEn : selectedObjective.methodFr}</span>
    <h3>{$language === 'en' ? selectedObjective.titleEn : selectedObjective.titleFr}</h3>
    <p>{$language === 'en' ? selectedObjective.detailEn : selectedObjective.detailFr}</p>
  </aside>
</section>

<section class="panel">
  <div class="section-head">
    <div>
      <p class="eyebrow">{t('Étape 2 · Protocole', 'Step 2 · Protocol')}</p>
      <h2>{t('Décrivez le design avec des questions fermées', 'Describe the design with closed questions')}</h2>
    </div>
    <p>{t('Les réponses définissent la structure statistique avant toute sélection de méthode omique.', 'The answers define the statistical structure before any omics method is selected.')}</p>
  </div>

  <div class="form-grid">
    <label>
      <span>{t('Cadre de l’étude', 'Study setting')}</span>
      <select bind:value={studySetting}>
        <option value="clinical_observational">{t('Humain · cohorte observationnelle', 'Human · observational cohort')}</option>
        <option value="clinical_interventional">{t('Humain · intervention / essai', 'Human · intervention / trial')}</option>
        <option value="animal">{t('Expérience animale', 'Animal experiment')}</option>
        <option value="cell">{t('Culture cellulaire / in vitro', 'Cell culture / in vitro')}</option>
        <option value="organoid">{t('Organoïde / modèle ex vivo', 'Organoid / ex vivo model')}</option>
        <option value="other">{t('Autre', 'Other')}</option>
      </select>
    </label>

    <label>
      <span>{t('Unité biologique indépendante', 'Independent biological unit')}</span>
      <select bind:value={unitType}>
        <option value="participant">{t('Participant humain', 'Human participant')}</option>
        <option value="animal">Animal</option>
        <option value="culture">{t('Culture indépendante / réplicat biologique', 'Independent culture / biological replicate')}</option>
        <option value="other">{t('Autre unité expérimentale', 'Other experimental unit')}</option>
      </select>
    </label>

    <label>
      <span>{t('Structure du design', 'Design structure')}</span>
      <select bind:value={designType}>
        <option value="independent">{t('Groupes / unités indépendants', 'Independent groups / units')}</option>
        <option value="paired">{t('Échantillons appariés', 'Paired samples')}</option>
        <option value="crossover">{t('Crossover / comparaison intra-sujet', 'Crossover / within-subject comparison')}</option>
        <option value="repeated">{t('Mesures répétées', 'Repeated measurements')}</option>
      </select>
    </label>

    <label>
      <span>{t('Nombre de groupes comparés', 'Number of comparison groups')}</span>
      <select bind:value={groupCount}>
        <option value="1">{t('Un groupe / exploratoire', 'One group / exploratory')}</option>
        <option value="2">{t('Deux groupes', 'Two groups')}</option>
        <option value="3plus">{t('Trois groupes ou plus', 'Three or more groups')}</option>
      </select>
    </label>

    <label>
      <span>{t('Design longitudinal ?', 'Longitudinal design?')}</span>
      <select bind:value={longitudinal}>
        <option value="no">{t('Non', 'No')}</option>
        <option value="yes">{t('Oui', 'Yes')}</option>
      </select>
    </label>

    <label>
      <span>{t('Nombre de temps', 'Number of time points')}</span>
      <select bind:value={timepointCount}>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">{t('4 ou plus', '4 or more')}</option>
      </select>
    </label>

    <label>
      <span>{t('Les omiques proviennent-elles du même prélèvement biologique ?', 'Do the omics come from the same biological specimen?')}</span>
      <select bind:value={sampleOverlap}>
        <option value="same_specimen">{t('Oui, même prélèvement pour toutes les omiques', 'Yes, same specimen for all omics')}</option>
        <option value="same_subject">{t('Même sujet, prélèvements différents', 'Same subject, different specimens')}</option>
        <option value="partial">{t('Partiellement apparié', 'Partially matched')}</option>
        <option value="unpaired">{t('Échantillons différents / non appariés', 'Different / unpaired samples')}</option>
        <option value="unknown">{t('Inconnu', 'Unknown')}</option>
      </select>
    </label>

    <label>
      <span>{t('Réplicats techniques attendus ?', 'Technical replicates expected?')}</span>
      <select bind:value={technicalReplicatesExpected}>
        <option value="no">{t('Non', 'No')}</option>
        <option value="yes">{t('Oui', 'Yes')}</option>
        <option value="unknown">{t('Inconnu', 'Unknown')}</option>
      </select>
    </label>

    <label>
      <span>{t('Batches techniques connus ?', 'Known technical batches?')}</span>
      <select bind:value={batchKnown}>
        <option value="yes">{t('Oui', 'Yes')}</option>
        <option value="no">{t('Non', 'No')}</option>
        <option value="unknown">{t('Inconnu', 'Unknown')}</option>
      </select>
    </label>

    <label>
      <span>{t('Type d’outcome principal', 'Primary outcome type')}</span>
      <select bind:value={outcomeType}>
        <option value="none">{t('Pas d’outcome / exploratoire', 'No outcome / exploratory')}</option>
        <option value="binary">{t('Binaire', 'Binary')}</option>
        <option value="multiclass">{t('Multiclasse', 'Multiclass')}</option>
        <option value="continuous">{t('Continu', 'Continuous')}</option>
        <option value="survival">{t('Temps jusqu’à événement / survie', 'Time-to-event / survival')}</option>
        <option value="count">{t('Comptage', 'Count')}</option>
      </select>
    </label>

    {#if objective === 'outcome' && availableOutcomeTimepoints.length > 1}
      <label>
        <span>{t('Temps omique utilisé dans le modèle d’outcome', 'Omics time point used in the outcome model')}</span>
        <select bind:value={outcomeTimepoint}>
          <option value="">— {t('sélection requise', 'selection required')} —</option>
          {#each availableOutcomeTimepoints as timepoint}
            <option value={timepoint}>{timepoint}</option>
          {/each}
        </select>
        <small>{t('Choisissez explicitement le prélèvement moléculaire qui entre dans le modèle. Pour une prédiction pronostique, il s’agit souvent du baseline.', 'Explicitly choose the molecular sampling time used by the model. For prognostic prediction, this is often baseline.')}</small>
      </label>
    {/if}

    <label>
      <span>{t('Covariables importantes disponibles ?', 'Important covariates available?')}</span>
      <select bind:value={covariatesAvailable}>
        <option value="yes">{t('Oui', 'Yes')}</option>
        <option value="no">{t('Non', 'No')}</option>
      </select>
    </label>

    <label>
      <span>{t('Certains sujets peuvent-ils manquer une couche omique entière ?', 'Some subjects may miss an entire omics layer?')}</span>
      <select bind:value={partialOmicsExpected}>
        <option value="no">{t('Non / non attendu', 'No / not expected')}</option>
        <option value="yes">{t('Oui', 'Yes')}</option>
        <option value="unknown">{t('Inconnu', 'Unknown')}</option>
      </select>
    </label>

    <label>
      <span>{t('Nombre d’unités biologiques', 'Number of biological units')} <small>{t('contrôle optionnel', 'optional consistency check')}</small></span>
      <input bind:value={subjectCount} type="number" min="1" placeholder="e.g. 48" />
    </label>

    <label>
      <span>{t('Nom de la variable de groupe', 'Name of the group variable')} <small>{t('optionnel', 'optional')}</small></span>
      <input bind:value={groupVariable} type="text" placeholder="e.g. treatment" />
    </label>

    <label>
      <span>{t('Nom de l’outcome', 'Name of the outcome')} <small>{t('optionnel', 'optional')}</small></span>
      <input bind:value={outcome} type="text" placeholder="e.g. response" />
    </label>
  </div>

  <div class="identity-grid">
    <article>
      <code>subject_id</code>
      <strong>{t('Unité biologique', 'Biological unit')}</strong>
      <p>{t('Même participant / animal / culture indépendante entre les visites et prélèvements.', 'Same participant / animal / independent culture across visits and samples.')}</p>
    </article>
    <article>
      <code>sample_id</code>
      <strong>{t('Prélèvement biologique', 'Biological specimen')}</strong>
      <p>{t('Le prélèvement physique. Les dosages RNA, protéines et métabolites du même prélèvement partagent cet ID.', 'The physical specimen. RNA, protein and metabolite assays from the same specimen share this ID.')}</p>
    </article>
    <article>
      <code>assay_id</code>
      <strong>{t('Mesure technique', 'Technical measurement')}</strong>
      <p>{t('Le nom de colonne utilisé dans une matrice omique. Les réplicats techniques ont des assay_id distincts mais le même sample_id.', 'The column name used in an omics matrix. Technical replicates have distinct assay IDs but the same sample ID.')}</p>
    </article>
  </div>
</section>

<section class="panel">
  <div class="section-head">
    <div>
      <p class="eyebrow">{t('Étape 3 · Type de données', 'Step 3 · Data type')}</p>
      <h2>{t('Indiquez ce que représente chaque matrice', 'Tell the app what each matrix represents')}</h2>
    </div>
    <p>{t('Cela évite d’interpréter à tort les mêmes nombres comme counts bruts, intensités normalisées ou concentrations absolues.', 'This prevents the same numbers from being interpreted incorrectly as raw counts, normalised intensities or absolute concentrations.')}</p>
  </div>

  <div class="omics-question-grid">
    <article>
      <h3>{t('Transcriptomique', 'Transcriptomics')}</h3>
      <label>
        <span>{t('Plateforme', 'Platform')}</span>
        <select bind:value={transcriptomicsPlatform}>
          <option value="bulk_rnaseq">Bulk RNA-seq</option>
          <option value="microarray">Microarray</option>
          <option value="targeted">{t('Panel d’expression ciblé', 'Targeted expression panel')}</option>
          <option value="processed">{t('Matrice déjà prétraitée', 'Already processed matrix')}</option>
        </select>
      </label>
      <label>
        <span>{t('Valeurs', 'Values')}</span>
        <select bind:value={transcriptomicsValues}>
          <option value="raw_counts">{t('Counts entiers bruts', 'Raw integer counts')}</option>
          <option value="tpm">{t('Abondance TPM / type FPKM', 'TPM / FPKM-like abundance')}</option>
          <option value="normalized">{t('Expression normalisée', 'Normalised expression')}</option>
          <option value="log_expression">{t('Expression log-transformée', 'Log-transformed expression')}</option>
          <option value="unknown">{t('Inconnu', 'Unknown')}</option>
        </select>
      </label>
      <label>
        <span>{t('Identifiant des variables', 'Feature identifier')}</span>
        <select bind:value={transcriptomicsIdType}>
          <option value="ensembl_gene">Ensembl gene ID</option>
          <option value="gene_symbol">{t('Symbole de gène', 'Gene symbol')}</option>
          <option value="entrez">Entrez Gene ID</option>
          <option value="unknown">{t('Inconnu / détection automatique', 'Unknown / detect automatically')}</option>
        </select>
      </label>
      {#if matrixInfo.transcriptomics.rowIds.length}
        <small>Detected from uploaded features: <strong>{inferredTranscriptomicsId.type}</strong> ({Math.round(inferredTranscriptomicsId.confidence * 100)}%).</small>
      {/if}
    </article>

    <article>
      <h3>{t('Protéomique', 'Proteomics')}</h3>
      <label>
        <span>{t('Plateforme', 'Platform')}</span>
        <select bind:value={proteomicsPlatform}>
          <option value="label_free">Label-free LC-MS/MS</option>
          <option value="tmt">TMT / multiplexed</option>
          <option value="dia">DIA</option>
          <option value="targeted">{t('Protéomique ciblée', 'Targeted proteomics')}</option>
          <option value="processed">{t('Matrice déjà prétraitée', 'Already processed matrix')}</option>
        </select>
      </label>
      <label>
        <span>{t('Valeurs', 'Values')}</span>
        <select bind:value={proteomicsValues}>
          <option value="lfq_intensity">{t('LFQ / intensité', 'LFQ / intensity')}</option>
          <option value="log_intensity">{t('Intensité logarithmique', 'Log intensity')}</option>
          <option value="spectral_count">{t('Comptages spectraux', 'Spectral counts')}</option>
          <option value="normalized">{t('Abondance normalisée', 'Normalised abundance')}</option>
          <option value="unknown">{t('Inconnu', 'Unknown')}</option>
        </select>
      </label>
      <label>
        <span>{t('Identifiant des variables', 'Feature identifier')}</span>
        <select bind:value={proteomicsIdType}>
          <option value="uniprot">UniProt accession</option>
          <option value="gene_symbol">{t('Symbole de gène', 'Gene symbol')}</option>
          <option value="ensembl_protein">Ensembl protein ID</option>
          <option value="unknown">{t('Inconnu / détection automatique', 'Unknown / detect automatically')}</option>
        </select>
      </label>
      {#if matrixInfo.proteomics.rowIds.length}
        <small>Detected from uploaded features: <strong>{inferredProteomicsId.type}</strong> ({Math.round(inferredProteomicsId.confidence * 100)}%).</small>
      {/if}
    </article>

    <article>
      <h3>{t('Métabolomique', 'Metabolomics')}</h3>
      <label>
        <span>{t('Acquisition', 'Acquisition')}</span>
        <select bind:value={metabolomicsPlatform}>
          <option value="untargeted_lcms">{t('LC-MS non ciblée', 'Untargeted LC-MS')}</option>
          <option value="targeted_lcms">{t('LC-MS ciblée', 'Targeted LC-MS')}</option>
          <option value="gcms">GC-MS</option>
          <option value="nmr">NMR</option>
          <option value="processed">{t('Matrice déjà prétraitée', 'Already processed matrix')}</option>
        </select>
      </label>
      <label>
        <span>{t('Valeurs', 'Values')}</span>
        <select bind:value={metabolomicsValues}>
          <option value="peak_area">{t('Aire de pic / intensité', 'Peak area / intensity')}</option>
          <option value="normalized">{t('Abondance normalisée', 'Normalised abundance')}</option>
          <option value="concentration">{t('Concentration absolue', 'Absolute concentration')}</option>
          <option value="log_abundance">{t('Abondance logarithmique', 'Log abundance')}</option>
          <option value="unknown">{t('Inconnu', 'Unknown')}</option>
        </select>
      </label>
      {#if ['untargeted_lcms','targeted_lcms','gcms'].includes(metabolomicsPlatform)}
        <div class="ms-qc-controls">
          <strong>{t('QC MS avancé', 'Advanced MS QC')}
            <span class="help-tip" tabindex="0" data-tooltip={t('Utilise sample_type pour distinguer biological / qc / blank et injection_order pour corriger la dérive. Les blanks et pooled-QC sont exclus de l’inférence biologique.', 'Uses sample_type to distinguish biological / qc / blank and injection_order for drift correction. Blank and pooled-QC injections are excluded from biological inference.')}>?</span>
          </strong>
          <label>
            <span>{t('Filtre des blancs', 'Blank filter')}</span>
            <select bind:value={msBlankFilter}>
              <option value="yes">{t('Oui', 'Yes')}</option>
              <option value="no">{t('Non', 'No')}</option>
            </select>
          </label>
          <label>
            <span>{t('Ratio biologique / blank minimal', 'Minimum biological / blank ratio')}</span>
            <input type="number" min="1" step="0.5" bind:value={msBlankFold} />
          </label>
          <label>
            <span>{t('Filtre RSD pooled-QC', 'Pooled-QC RSD filter')}</span>
            <select bind:value={msQcRsdFilter}>
              <option value="yes">{t('Oui', 'Yes')}</option>
              <option value="no">{t('Non', 'No')}</option>
            </select>
          </label>
          <label>
            <span>{t('RSD QC maximal', 'Maximum QC RSD')}</span>
            <input type="number" min="0.05" max="1" step="0.05" bind:value={msQcRsdThreshold} />
          </label>
          <label>
            <span>{t('Correction de dérive', 'Drift correction')}</span>
            <select bind:value={msDriftCorrection}>
              <option value="yes">{t('Oui · si ≥5 pooled-QC ordonnés', 'Yes · when ≥5 ordered pooled-QCs')}</option>
              <option value="no">{t('Non', 'No')}</option>
            </select>
          </label>
          <label>
            <span>{t('Missing MNAR', 'MNAR missingness')}</span>
            <select bind:value={msMnarStrategy}>
              <option value="none">{t('Aucune imputation', 'No imputation')}</option>
              <option value="left_censored">{t('Bas de distribution déterministe', 'Deterministic low-tail imputation')}</option>
            </select>
          </label>
        </div>
      {/if}

      <label>
        <span>{t('Identifiant des variables', 'Feature identifier')}</span>
        <select bind:value={metabolomicsIdType}>
          <option value="chebi">ChEBI</option>
          <option value="hmdb">HMDB</option>
          <option value="kegg_compound">KEGG compound</option>
          <option value="pubchem">PubChem CID</option>
          <option value="inchikey">InChIKey (UniChem → ChEBI)</option>
          <option value="name">{t('Nom du métabolite', 'Metabolite name')}</option>
          <option value="mz_rt">{t('m/z + temps de rétention uniquement', 'm/z + retention time only')}</option>
          <option value="unknown">{t('Inconnu / détection automatique', 'Unknown / detect automatically')}</option>
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
      <p class="eyebrow">{t('Étape 4 · Contrat de données', 'Step 4 · Data contract')}</p>
      <h2>{t('Utilisez le template ou laissez l’outil mapper vos colonnes', 'Use the template, or let the app map your column names')}</h2>
    </div>
    <p>{t('Le template est la voie la plus sûre, mais il n’est pas obligatoire. Les métadonnées libres sont rapprochées d’une liste explicite d’alias puis confirmées manuellement.', 'The template is the safest route, but it is not mandatory. Free-form metadata are matched against explicit aliases and then confirmed manually.')}</p>
  </div>

  <div class="contract">
    <div>
      <h3>{t('Métadonnées recommandées au format long', 'Recommended long-format metadata')}</h3>
      <p>{t('Une ligne = une mesure. Ce format gère les couches omiques absentes, les temps répétés et les réplicats techniques sans changer de schéma.', 'One row = one assay. This handles missing omics layers, repeated time points and technical replicates without changing the schema.')}</p>
      <pre>subject_id,sample_id,assay_id,omic,condition,timepoint,batch,technical_replicate,outcome,survival_time,survival_event,covariate_1</pre>
      <div class="actions">
        <button class="btn btn-primary" type="button" onclick={downloadGeneratedTemplate}>{t('Générer un template depuis mon protocole', 'Generate template from my protocol')}</button>
        <a class="btn btn-outline" href={`${base}/multiomics/metadata_template.csv`} download>{t('Template générique de métadonnées', 'Generic metadata template')}</a>
        <a class="btn btn-outline" href={`${base}/multiomics/transcriptomics_template.csv`} download>{t('Template matrice RNA', 'RNA matrix template')}</a>
        <a class="btn btn-outline" href={`${base}/multiomics/proteomics_template.csv`} download>{t('Template matrice protéines', 'Protein matrix template')}</a>
        <a class="btn btn-outline" href={`${base}/multiomics/metabolomics_template.csv`} download>{t('Template matrice métabolites', 'Metabolite matrix template')}</a>
      </div>
    </div>

    <div class="demo-card">
      <p class="eyebrow">{t('Démonstration intégrée', 'Built-in demonstration')}</p>
      <h3>{t('Traitement × temps, trois omiques', 'Treatment × time, three omics')}</h3>
      <p>{t('8 sujets (4 contrôle + 4 traitement), deux temps, trois couches omiques appariées, avec un réplicat technique RNA sur le même prélèvement.', '8 subjects (4 control + 4 treatment), two time points, three matched omics layers, plus one RNA technical replicate for the same biological sample.')}</p>
      <button class="btn btn-primary" type="button" data-testid="multiomics-load-demo" onclick={loadDemo}>{t('Charger la démo localement', 'Load the demo locally')}</button>
      <div class="demo-links">
        <a href={`${base}/multiomics/demo_metadata.csv`} download>{t('métadonnées', 'metadata')}</a>
        <a href={`${base}/multiomics/demo_transcriptomics.csv`} download>RNA</a>
        <a href={`${base}/multiomics/demo_proteomics.csv`} download>{t('protéines', 'protein')}</a>
        <a href={`${base}/multiomics/demo_metabolomics.csv`} download>{t('métabolites', 'metabolites')}</a>
      </div>
    </div>
  </div>

  <details class="dictionary">
    <summary>{t('Dictionnaire détaillé des métadonnées', 'Detailed metadata dictionary')}</summary>
    <div class="dictionary-table">
      <div><b>Column</b><b>Meaning</b><b>Example</b><b>Rule</b></div>
      <div><code>subject_id</code><span>{t('Unité biologique indépendante', 'Independent biological unit')}</span><span>P001</span><span>Same value across all visits/omics for one participant, animal or culture.</span></div>
      <div><code>sample_id</code><span>Physical biological specimen</span><span>P001_T0</span><span>Same value only when assays come from the same specimen.</span></div>
      <div><code>assay_id</code><span>Technical measurement / run</span><span>RNA001</span><span>Must match the corresponding matrix row/column identifier exactly.</span></div>
      <div><code>omic</code><span>Measured layer</span><span>transcriptomics</span><span>Canonical values: transcriptomics, proteomics, metabolomics.</span></div>
      <div><code>condition</code><span>Experimental group</span><span>treatment</span><span>Use one consistent vocabulary across subjects.</span></div>
      <div><code>timepoint</code><span>Visit / experimental time</span><span>T12</span><span>Required for longitudinal designs.</span></div>
      <div><code>batch</code><span>Technical batch</span><span>RNA_B1</span><span>Keep assay-specific batches even when different omics use different batches.</span></div>
      <div><code>technical_replicate</code><span>Repeated technical assay</span><span>1</span><span>Distinct assay_id, same sample_id + omic.</span></div>
      <div><code>outcome</code><span>{t('Phénotype / critère principal', 'Primary phenotype / endpoint')}</span><span>responder</span><span>{t('Utilisé pour les outcomes binaires, continus, multiclasse ou de comptage.', 'Used for binary, continuous, multiclass or count outcomes.')}</span></div>
      <div><code>survival_time</code><span>{t('Temps de suivi / survie', 'Survival / follow-up time')}</span><span>365</span><span>{t('Requis uniquement pour la branche survie.', 'Required only for the survival branch.')}</span></div>
      <div><code>survival_event</code><span>{t('Événement 0/1', 'Event indicator 0/1')}</span><span>1</span><span>{t('1 = événement observé, 0 = censuré.', '1 = observed event, 0 = censored.')}</span></div>
      <div><code>covariate_*</code><span>{t('Covariable explicite', 'Explicit covariate')}</span><span>age</span><span>{t('Toute colonne supplémentaire peut être sélectionnée manuellement pour ajustement.', 'Any extra column can be selected manually for adjustment.')}</span></div>
    </div>
  </details>

  <details class="aliases">
    <summary>{t('Comment fonctionne la reconnaissance automatique des colonnes', 'How automatic column recognition works')}</summary>
    <p>{t('Les noms de colonnes sont normalisés (casse, espaces, tirets et accents ignorés), puis comparés à une liste contrôlée d’alias. La reconnaissance automatique n’est acceptée que si une seule colonne correspond au champ.', 'Column names are normalised (case, spaces, hyphens and accents ignored), then compared with a controlled alias list. Automatic recognition is only accepted when exactly one column matches a field.')}</p>
    <div class="alias-grid">
      {#each fieldDefinitions as field}
        <article>
          <strong>{field.key}</strong>
          <span>{field.required ? 'required' : 'optional'}</span>
          <p>{field.aliases.join(', ')}</p>
        </article>
      {/each}
    </div>
    <p class="note">{t('La liste d’alias propose un mapping ; elle ne redéfinit jamais silencieusement l’étude. Les champs ambigus ou absents doivent être mappés manuellement.', 'The alias list proposes a mapping; it does not silently redefine the study. Ambiguous or missing fields must be mapped manually.')}</p>
  </details>
</section>

<section class="panel">
  <div class="section-head">
    <div>
      <p class="eyebrow">{t('Étape 5 · Import & mapping', 'Step 5 · Upload & mapping')}</p>
      <h2>{t('Faites correspondre métadonnées et matrices avant l’analyse', 'Match metadata and matrices before analysis')}</h2>
    </div>
    <p>{t('Les colonnes des matrices sont interprétées comme des assay_id et comparées aux métadonnées. Aucun lien n’est inféré à partir de noms de patients simplement ressemblants.', 'Matrix columns are interpreted as assay IDs and checked against the metadata. No relationship is inferred from similar-looking patient names.')}</p>
  </div>

  <div class="uploads">
    <label class:loaded={files.metadata}>
      <strong>{t('Métadonnées échantillons', 'Sample metadata')}</strong>
      <span>{t('Format long recommandé ; noms de colonnes libres acceptés s’ils peuvent être mappés.', 'Long format preferred; arbitrary headers accepted if they can be mapped.')}</span>
      <input type="file" accept=".csv,.tsv,.txt" onchange={(event) => selectFile('metadata', event)} />
      <small>{files.metadata ? files.metadata.name : 'No file selected'}</small>
    </label>

    <label class:loaded={files.transcriptomics}>
      <strong>{t('Transcriptomique', 'Transcriptomics')}</strong>
      <span>{t('Première colonne = identifiant de variable ; colonnes suivantes = assay_id.', 'First column = feature ID; following columns = assay IDs.')}</span>
      <input type="file" accept=".csv,.tsv,.txt" onchange={(event) => selectFile('transcriptomics', event)} />
      <small>{files.transcriptomics ? files.transcriptomics.name : 'No file selected'}</small>
    </label>

    <label class:loaded={files.proteomics}>
      <strong>{t('Protéomique', 'Proteomics')}</strong>
      <span>{t('Première colonne = identifiant de variable ; colonnes suivantes = assay_id.', 'First column = feature ID; following columns = assay IDs.')}</span>
      <input type="file" accept=".csv,.tsv,.txt" onchange={(event) => selectFile('proteomics', event)} />
      <small>{files.proteomics ? files.proteomics.name : 'No file selected'}</small>
    </label>

    <label class:loaded={files.metabolomics}>
      <strong>{t('Métabolomique', 'Metabolomics')}</strong>
      <span>{t('Première colonne = identifiant de variable ; colonnes suivantes = assay_id.', 'First column = feature ID; following columns = assay IDs.')}</span>
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
          <h3>{t('Confirmez le mapping des colonnes', 'Confirm column mapping')}</h3>
          <p>{metadataHeaders.length} columns detected · delimiter: {metadataDelimiter} · {metadataRows.length} assay rows</p>
        </div>
        <span class:ok={requiredMappingsComplete}>{requiredMappingsComplete ? 'Required fields mapped' : 'Mapping incomplete'}</span>
      </div>

      <div class="mapping-grid">
        {#each fieldDefinitions as field}
          <label>
            <span><strong>{fieldLabel(field.key)}</strong> <small>{field.required ? t('requis', 'required') : t('optionnel', 'optional')}</small></span>
            <select value={columnMapping[field.key]} onchange={(event) => setMapping(field.key, event.currentTarget.value)}>
              <option value="">— {t('non mappé', 'not mapped')} —</option>
              {#each metadataHeaders as header}
                <option value={header}>{header}</option>
              {/each}
            </select>
          </label>
        {/each}
      </div>

      {#if covariatesAvailable === 'yes'}
        <div class="covariate-picker">
          <div>
            <h3>{t('Covariables à ajuster', 'Covariates to adjust')}</h3>
            <p>{t('Sélectionnez uniquement les variables de confusion ou facteurs de design à ajuster. Elles entrent explicitement dans le modèle ; elles ne sont pas devinées par l’outil.', 'Select only confounders or design variables that should be adjusted. They enter the model explicitly; the tool does not guess them.')}</p>
          </div>
          {#if availableCovariateColumns.length}
            <div class="covariate-options">
              {#each availableCovariateColumns as header}
                <label>
                  <input type="checkbox" checked={selectedCovariates.includes(header)} onchange={() => toggleCovariate(header)} />
                  <span>{header}</span>
                </label>
              {/each}
            </div>
          {:else}
            <p class="muted">{t('Aucune colonne supplémentaire disponible après le mapping canonique.', 'No extra columns remain after canonical mapping.')}</p>
          {/if}
          <p class="note">
            {t('Batches techniques :', 'Technical batches:')}
            {columnMapping.batch
              ? t(' la colonne batch mappée est ajustée automatiquement si plusieurs batches sont présents et non totalement confondus.', ' the mapped batch column is adjusted automatically when multiple non-confounded batches are present.')
              : t(' aucune colonne batch n’est mappée.', ' no batch column is mapped.')}
          </p>
        </div>
      {/if}
    </div>

    <div class="validation">
      <article>
        <span>{t('Unités biologiques', 'Biological units')}</span>
        <strong>{mappedSubjects || '—'}</strong>
        {#if subjectCount && mappedSubjects && subjectCount !== mappedSubjects}
          <small class="warning">Declared {subjectCount}; metadata contains {mappedSubjects}.</small>
        {:else}
          <small>{t('subject_id uniques mappés.', 'Unique mapped subject IDs.')}</small>
        {/if}
      </article>
      <article>
        <span>{t('Prélèvements biologiques', 'Biological samples')}</span>
        <strong>{mappedSamples || '—'}</strong>
        <small>{t('Prélèvements uniques entre visites / conditions.', 'Unique specimens across visits / conditions.')}</small>
      </article>
      <article>
        <span>{t('Mesures techniques', 'Assays')}</span>
        <strong>{mappedAssays || '—'}</strong>
        <small>{t('Identifiants uniques de mesures techniques.', 'Unique technical measurement IDs.')}</small>
      </article>
      <article>
        <span>{t('Groupes de réplicats techniques', 'Technical replicate groups')}</span>
        <strong>{replicateGroups.length}</strong>
        <small>{replicateGroups.length ? replicateGroups.map((item) => item.key.replace('::', ' / ')).slice(0, 3).join(', ') : 'None detected from repeated sample + omic pairs.'}</small>
      </article>
    </div>

    <div class="matrix-checks">
      {#each omicLayers as layer}
        {@const match = matrixMatch(layer)}
        <article>
          <div>
            <strong>{omicLabel(layer)}</strong>
            <span>{matrixInfo[layer].sampleIds.length ? `${matrixInfo[layer].sampleIds.length} data columns` : 'not loaded'}</span>
          </div>
          {#if matrixInfo[layer].sampleIds.length}
            <p><b>{match.matched}/{match.expected}</b> expected assay IDs matched.</p>
            {#if match.orientation === 'transposed'}
              <small class="warning">{t('Les assay_id correspondent mieux aux lignes qu’aux colonnes : la matrice semble transposée.', 'Assay IDs match rows better than columns: the matrix appears transposed.')}</small>
            {/if}
            {#if match.missing.length}<small class="warning">Missing from matrix: {match.missing.slice(0, 5).join(', ')}</small>{/if}
            {#if match.extra.length && match.orientation !== 'transposed'}<small class="warning">Not declared in metadata: {match.extra.slice(0, 5).join(', ')}</small>{/if}
          {:else}
            <p class="muted">{t('Chargez une matrice pour valider les assay_id.', 'Load a matrix to validate assay IDs.')}</p>
          {/if}
        </article>
      {/each}
    </div>
  {/if}

  <div class="status" class:ready>
    <strong>{omicsCount}/3 {t('omiques sélectionnées', 'omics selected')}</strong>
    <span>{ready
      ? t('Le contrat de données et l’objectif scientifique permettent de lancer l’analyse.', 'The data contract and scientific objective are sufficient to run the analysis.')
      : !objectiveOperational
        ? t('Les designs crossover restent bloqués tant que les effets de période et de séquence ne sont pas modélisés.', 'Crossover designs remain blocked until period and sequence effects are modelled.')
        : !outcomeMappingComplete
          ? t('Complétez le type et le mapping de l’outcome requis.', 'Complete the required outcome type and mapping.')
          : t('Chargez au moins deux couches omiques et mappez subject_id, sample_id, assay_id et omic.', 'Load at least two omics layers and map subject_id, sample_id, assay_id and omic.')}</span>
  </div>

  <div class="run-box">
    <div>
      <p class="eyebrow">{t('Moteur déterministe', 'Deterministic engine')}</p>
      <h3>{t('Lancer l’analyse à partir des matrices importées', 'Run the analysis from the uploaded matrices')}</h3>
      <p>{t('Aucun LLM n’est utilisé. Le moteur effectue le prétraitement déclaré, l’agrégation des réplicats, l’audit et l’ajustement des batches/covariables, puis sélectionne la branche exploratoire, groupes, temporelle ou outcome appropriée, avec BH-FDR et Reactome optionnel.', 'No LLM is used. The engine performs declared preprocessing, replicate aggregation, batch/covariate audit and adjustment, then selects the appropriate exploratory, group, longitudinal or outcome branch, with BH-FDR and optional Reactome.')}</p>
      <label class="inline-check">
        <input type="checkbox" bind:checked={resolveIdentifiers} />
        <span>{t('Résoudre les métabolites non canoniques sélectionnés avec ChEBI avant l’analyse de voies', 'Resolve selected non-canonical metabolite labels with ChEBI before pathway analysis')}</span>
      </label>
      <label class="inline-check">
        <input type="checkbox" bind:checked={useReactome} />
        <span>{t('Interroger Reactome uniquement avec les identifiants moléculaires sélectionnés', 'Query Reactome with selected molecular identifiers only')}</span>
      </label>

      <div class="reference-backend-box">
        <div>
          <strong>{t('Backend R de référence', 'Reference R backend')}</strong>
          <span class="help-tip" tabindex="0" data-tooltip={t('En mode Auto, l’outil teste le backend local. S’il répond, il exécute les implémentations de référence applicables : DESeq2, limma, lmerTest, fgsea, MOFA2 et/ou DIABLO. GitHub Pages ne peut pas démarrer R lui-même.', 'In Auto mode, the tool probes the local backend. If available, it runs applicable reference implementations: DESeq2, limma, lmerTest, fgsea, MOFA2 and/or DIABLO. GitHub Pages cannot start R itself.')}>?</span>
        </div>
        <div class="backend-controls">
          <select bind:value={referenceBackendMode} aria-label={t('Mode backend R', 'R backend mode')}>
            <option value="auto">{t('Auto · utiliser si disponible', 'Auto · use when available')}</option>
            <option value="browser">{t('Navigateur uniquement', 'Browser only')}</option>
            <option value="required">{t('R requis · bloquer si absent', 'Require R · fail if unavailable')}</option>
          </select>
          <input bind:value={referenceBackendUrl} aria-label={t('URL backend R', 'R backend URL')} />
          <button class="btn btn-outline btn-small" type="button" onclick={() => checkReferenceBackend(true)}>{t('Tester', 'Check')}</button>
        </div>
        <small class:backend-ok={referenceBackendStatus === 'available' || referenceBackendStatus === 'done'} class:backend-bad={referenceBackendStatus === 'error'}>
          {referenceBackendMessage || t('Par défaut : bridge local http://127.0.0.1:8787.', 'Default: local bridge http://127.0.0.1:8787.')}
        </small>
        {#if referenceBackendHealth?.packages}
          <div class="backend-packages">
            {#each Object.entries(referenceBackendHealth.packages) as [pkg, installed]}
              <span class:installed={installed}>{pkg}: {installed ? 'OK' : '—'}</span>
            {/each}
          </div>
        {/if}
      </div>
    </div>
    <button class="btn btn-primary" type="button" data-testid="multiomics-run" disabled={!ready || analysisStatus === 'running'} onclick={runAnalysis}>
      {analysisStatus === 'running' ? t('Analyse…', 'Running…') : t('Lancer l’analyse déterministe', 'Run deterministic analysis')}
    </button>
  </div>
  {#if analysisError}<p class="error">{analysisError}</p>{/if}
</section>

{#if analysisResult}
<section class="panel demo-results" id="analysis-results" data-testid="multiomics-results">
  <div class="section-head">
    <div>
      <p class="eyebrow">{demoLoaded ? t('Résultats de démo · calculés maintenant', 'Demo results · computed now') : t('Résultats · moteur déterministe', 'Analysis results · deterministic engine')}</p>
      <h2>{t('Résultats multi-omiques calculés', 'Computed multi-omics results')}</h2>
    </div>
    <div class="result-actions">
      <button class="btn btn-outline" type="button" onclick={downloadAnalysisJson}>{t('Télécharger JSON', 'Download JSON')}</button>
        <button class="btn btn-outline" type="button" onclick={downloadReproducibleReport}>{t('Rapport HTML reproductible', 'Reproducible HTML report')}</button>
      {#if analysisResult.reactome?.combined?.token}
        <a class="btn btn-outline" href={`https://reactome.org/PathwayBrowser/#DTAB=AN&ANALYSIS=${analysisResult.reactome.combined.token}`} target="_blank" rel="noreferrer">{t('Ouvrir dans Reactome ↗', 'Open in Reactome ↗')}</a>
      {/if}
    </div>
  </div>

  <div class="computed-summary">
    <article><span>{t('Sujets', 'Subjects')}</span><strong>{analysisResult.metadataSummary.subjects}</strong></article>
    <article><span>{t('Prélèvements biologiques', 'Biological samples')}</span><strong>{analysisResult.metadataSummary.samples}</strong></article>
    <article><span>{t('Mesures', 'Assays')}</span><strong>{analysisResult.metadataSummary.assays}</strong></article>
    <article><span>{t('Conditions', 'Conditions')}</span><strong>{analysisResult.metadataSummary.conditions.join(' / ') || '—'}</strong></article>
    <article><span>{t('Temps', 'Time points')}</span><strong>{analysisResult.metadataSummary.timepoints.join(' / ') || '—'}</strong></article>
  </div>

  {#if analysisResult.metadataSummary.overlap?.pairwise?.length}
    <div class="overlap-box">
      <div>
        <p class="eyebrow">{t('Chevauchement réellement utilisé', 'Sample overlap actually used')}</p>
        <strong>{analysisResult.metadataSummary.overlap.allMatched} {t('sujet(s) présents dans toutes les couches chargées', 'subject(s) present in every loaded omics layer')}</strong>
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
        <p class="eyebrow">{t('Audit des batches techniques', 'Technical batch audit')}</p>
        <strong>{t('Structure des batches vérifiée avant l’inférence biologique', 'Batch structure checked before biological inference')}</strong>
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

  {#if analysisResult.referenceBackend}
    <div class="integration-result reference-backend-result" data-testid="reference-backend-results">
      <div class="integration-head">
        <div>
          <p class="eyebrow">{t('Moteur R de référence', 'Reference R engine')}</p>
          <h3>{analysisResult.referenceBackend.status === 'ok' ? t('Méthodes de référence exécutées automatiquement', 'Reference methods executed automatically') : t('Backend R non utilisé', 'R backend not used')}</h3>
        </div>
        <span>{analysisResult.referenceBackend.status}</span>
      </div>
      {#if analysisResult.referenceBackend.status === 'ok'}
        <p class="note">{analysisResult.referenceBackend.engine?.name} · v{analysisResult.referenceBackend.engine?.version}</p>
        <div class="backend-method-grid">
          {#each Object.entries(analysisResult.referenceBackend.methods || {}) as [key, method]}
            <article>
              <strong>{method.method || key}</strong>
              <span class:installed={method.status === 'ok'}>{method.status}</span>
              {#if method.message}<small>{method.message}</small>{/if}
            </article>
          {/each}
        </div>
      {:else}
        <p class="muted">{analysisResult.referenceBackend.message}</p>
      {/if}
    </div>
  {/if}

  <div class="integration-result qc-result" data-testid="multiomics-qc">
    <div class="integration-head">
      <div>
        <p class="eyebrow">{t('Contrôle qualité', 'Quality control')}</p>
        <h3>{t('Qualité des données avant interprétation biologique', 'Data quality before biological interpretation')}</h3>
      </div>
      <span>{t('QC par couche', 'per-layer QC')}</span>
    </div>

    <div class="qc-grid">
      {#each Object.entries(analysisResult.layers) as [layer, result]}
        {#if result.qc}
          <article class="qc-card">
            <div class="qc-card-head">
              <div>
                <strong>{omicLabel(layer)}</strong>
                <small>{result.qc.featuresAfter}/{result.qc.featuresBefore} {t('variables conservées', 'features retained')}</small>
              </div>
              <div class="qc-badges">
                <span class:qc-warning={result.qc.warnings?.length}>{result.qc.warnings?.length ? t('à vérifier', 'review') : 'OK'}</span>
                {#if result.qc.inferenceTier?.level === 'screening'}
                  <span class="qc-screening">{t('screening', 'screening')} <span class="help-tip" tabindex="0" data-tooltip={t('Pour des counts RNA-seq bruts, la branche navigateur sert au screening reproductible. Pour une inférence différentielle publication-grade, utilisez l’adaptateur R DESeq2/limma avec le même design.', 'For raw RNA-seq counts, the browser branch is intended for reproducible screening. For publication-grade differential inference, use the DESeq2/limma R adapter with the same design.')}>?</span></span>
                {/if}
              </div>
            </div>

            <div class="qc-metrics">
              <div><b>{Number.isFinite(result.qc.medianMissingFraction) ? (100 * result.qc.medianMissingFraction).toFixed(1) + '%' : '—'}</b><span>{t('missing médian', 'median missing')}</span></div>
              <div><b>{result.qc.outlierSamples?.length || 0}</b><span>{t('assays suspects', 'flagged assays')}</span></div>
              <div><b>{poorReplicateCount(result.qc)}</b><span>{t('réplicats r<0,80', 'replicates r<0.80')}</span></div>
            </div>

            <div class="qc-bars" aria-label={t('Missingness par assay', 'Missingness by assay')}>
              {#each result.qc.sampleMetrics.slice(0, 16) as metric}
                <div title={metric.assayId + ' · missing=' + (metric.missingFraction == null ? 'NA' : (100 * metric.missingFraction).toFixed(1) + '%') + ' · detected=' + metric.detectedFeatures}>
                  <span>{metric.assayId}</span>
                  <i><em style={'width:' + Math.max(1, Math.min(100, 100 * (metric.missingFraction || 0))) + '%'}></em></i>
                </div>
              {/each}
            </div>

            {#if result.qc.pca?.scores?.length}
              <div class="qc-pca">
                <div class="qc-pca-head">
                  <b>PCA QC <span class="help-tip" tabindex="0" data-tooltip={t('Projection non supervisée utilisée uniquement pour contrôler la structure globale des échantillons après prétraitement : outliers, batch éventuel et séparation dominante. Elle ne constitue pas un test statistique.', 'Unsupervised projection used only to inspect the global sample structure after preprocessing: outliers, possible batch structure and dominant separation. It is not a statistical test.')}>?</span></b>
                  <small>
                    PC1 {Number.isFinite(result.qc.pca.explained?.[0]) ? (100 * result.qc.pca.explained[0]).toFixed(1) + '%' : '—'}
                    · PC2 {Number.isFinite(result.qc.pca.explained?.[1]) ? (100 * result.qc.pca.explained[1]).toFixed(1) + '%' : '—'}
                  </small>
                </div>
                <div class="qc-scatter" role="img" aria-label={t('PCA des échantillons après prétraitement', 'PCA of samples after preprocessing')}>
                  <span class="axis-x"></span><span class="axis-y"></span>
                  {#each result.qc.pca.scores as point}
                    <button
                      type="button"
                      class="qc-dot"
                      style={'left:' + qcAxisPercent(point.pc1, result.qc.pca.scores, 'pc1') + '%;bottom:' + qcAxisPercent(point.pc2, result.qc.pca.scores, 'pc2') + '%'}
                      title={point.sampleId + ' · ' + (point.condition || '—') + ' · batch ' + (point.batch || '—')}
                      aria-label={point.sampleId + ', ' + (point.condition || '') + ', ' + (point.batch || '')}
                    ></button>
                  {/each}
                </div>
                <p class="muted">{result.qc.pca.method}</p>
              </div>
            {/if}

            {#if result.qc.msQc?.applied}
              <div class="ms-qc-summary" data-testid="ms-qc-summary">
                <strong>{t('QC MS', 'MS QC')}</strong>
                <span>{result.qc.msQc.blankAssays} blanks</span>
                <span>{result.qc.msQc.qcAssays} pooled-QC</span>
                <span>{result.qc.msQc.blankFilteredFeatures} {t('retirées par blank', 'blank-filtered')}</span>
                <span>{result.qc.msQc.qcRsdFilteredFeatures} {t('retirées par RSD', 'RSD-filtered')}</span>
                <span>{result.qc.msQc.driftCorrection?.correctedFeatures || 0} {t('corrigées pour dérive', 'drift-corrected')}</span>
                <span>{result.qc.msQc.mnar?.imputedValues || 0} {t('MNAR imputées', 'MNAR-imputed')}</span>
              </div>
            {/if}

            <details>
              <summary>{t('Règles QC et prétraitement', 'QC and preprocessing rules')}</summary>
              <p>{result.qc.filterPolicy}</p>
              {#if result.qc.inferenceTier?.note}<p class="note">{result.qc.inferenceTier.note}</p>{/if}
              <ul>
                {#each result.qc.preprocessingSteps || [] as step}<li>{step}</li>{/each}
                {#each result.qc.warnings || [] as warning}<li class="warning">{warning}</li>{/each}
                {#each result.qc.msQc?.warnings || [] as warning}<li class="warning">{warning}</li>{/each}
              </ul>
            </details>
          </article>
        {/if}
      {/each}
    </div>
  </div>

  <div class="interpretation-box" data-testid="multiomics-interpretation">
    <div class="integration-head">
      <div>
        <p class="eyebrow">{t('Aide à l’interprétation', 'Interpretation guide')}</p>
        <h3>{t('Comment interpréter ces résultats ?', 'How should these results be interpreted?')}</h3>
      </div>
      <span>{t('règles déterministes', 'deterministic rules')}</span>
    </div>
    <div class="interpretation-grid">
      {#each interpretationItems as item}
        <article>
          <strong>{item.title}</strong>
          <p>{item.text}</p>
        </article>
      {/each}
    </div>
  </div>

  <details class="dictionary interpretation-glossary">
    <summary>{t('Glossaire pour lire les sorties statistiques', 'Glossary for reading statistical outputs')}</summary>
    <div class="dictionary-table">
      <div><b>{t('Terme', 'Term')}</b><b>{t('Lecture', 'Meaning')}</b><b>{t('À retenir', 'Key point')}</b><b>{t('Piège à éviter', 'Common pitfall')}</b></div>
      <div><code>effect / β</code><span>{t('Direction et amplitude du contraste ou coefficient de régression.', 'Direction and magnitude of the contrast or regression coefficient.')}</span><span>{t('Toujours lire son échelle et le contraste exact.', 'Always read its scale and exact contrast.')}</span><span>{t('Un grand effet n’implique pas automatiquement une faible q-value.', 'A large effect does not automatically imply a low q-value.')}</span></div>
      <div><code>fold ratio</code><span>{t('Pour une échelle log2 : 2^effect.', 'On a log2 scale: 2^effect.')}</span><span>{t('>1 : hausse ; <1 : baisse selon le contraste affiché.', '>1: increase; <1: decrease according to the displayed contrast.')}</span><span>{t('Ne pas l’interpréter si les valeurs ne sont pas sur une échelle log2 déclarée.', 'Do not interpret it if values are not on a declared log2 scale.')}</span></div>
      <div><code>p</code><span>{t('Évidence du test pour une variable avant correction multiple.', 'Test evidence for one feature before multiple-testing correction.')}</span><span>{t('Utile pour le calcul de q, pas pour sélectionner seule des milliers de variables.', 'Useful for computing q, not for selecting among thousands of features by itself.')}</span><span>{t('p < 0,05 n’est pas une probabilité que l’hypothèse soit vraie.', 'p < 0.05 is not the probability that a hypothesis is true.')}</span></div>
      <div><code>q BH</code><span>{t('p-value ajustée par Benjamini–Hochberg pour contrôler le FDR.', 'Benjamini–Hochberg adjusted p-value for FDR control.')}</span><span>{t('Le prototype utilise q ≤ 0,10 comme seuil exploratoire.', 'The prototype uses q ≤ 0.10 as an exploratory threshold.')}</span><span>{t('Ce seuil ne remplace pas la taille d’effet ni la validation externe.', 'This threshold does not replace effect size or external validation.')}</span></div>
      <div><code>OR / RR / HR</code><span>{t('exp(β) en logistique, Poisson ou Cox.', 'exp(β) in logistic, Poisson or Cox models.')}</span><span>{t('1 = absence d’association ; >1 et <1 donnent les deux directions.', '1 = no association; >1 and <1 indicate opposite directions.')}</span><span>{t('Une association n’est pas une causalité.', 'Association is not causation.')}</span></div>
      <div><code>95% CI</code><span>{t('Intervalle de confiance Wald autour de l’effet estimé.', 'Wald confidence interval around the estimated effect.')}</span><span>{t('La largeur renseigne sur la précision.', 'Width reflects estimation precision.')}</span><span>{t('Avec petits effectifs ou séparation logistique, l’approximation peut être fragile.', 'With small samples or logistic separation, the approximation can be fragile.')}</span></div>
      <div><code>loading</code><span>{t('Contribution d’une variable à un axe latent de l’ACP multi-blocs.', 'Feature contribution to a latent balanced multi-block PCA axis.')}</span><span>{t('Interpréter surtout |loading| et les variables qui covarient sur un axe.', 'Focus on |loading| and features co-varying along an axis.')}</span><span>{t('Le signe global d’un axe PCA est arbitraire.', 'The global sign of a PCA axis is arbitrary.')}</span></div>
      <div><code>Δr</code><span>{t('Différence de corrélation inter-omique entre deux conditions.', 'Difference in cross-omics correlation between two conditions.')}</span><span>{t('Peut révéler un couplage gagné, perdu ou inversé.', 'Can reveal gained, lost or reversed coupling.')}</span><span>{t('Une corrélation condition-dépendante ne prouve pas une interaction causale.', 'Condition-dependent correlation does not prove a causal interaction.')}</span></div>
    </div>
  </details>

  {#if analysisResult.exploration?.components?.length}
    <div class="integration-result">
      <div class="integration-head">
        <div>
          <p class="eyebrow">{t('Exploration multi-omique', 'Multi-omics exploration')}</p>
          <h3>{t('Axes latents partagés entre les couches', 'Shared latent axes across omics layers')}</h3>
        </div>
        <span>{analysisResult.exploration.subjects} {t('sujets communs', 'shared subjects')}</span>
      </div>
      <div class="api-summary">
        {#each analysisResult.exploration.components as component}
          <span><strong>PC{component.component}</strong> {Number.isFinite(component.explainedFraction) ? (100 * component.explainedFraction).toFixed(1) + '%' : '—'} {t('de variance pondérée', 'balanced variance')}</span>
        {/each}
      </div>
      <p class="note">{analysisResult.exploration.method}</p>
      <div class="cross-table">
        <div class="cross-head"><b>{t('Variable', 'Feature')}</b><b>{t('Omique', 'Omics')}</b><b>PC1 loading</b><b>{t('Contribution', 'Contribution')}</b><b></b><b></b></div>
        {#each analysisResult.exploration.components[0].topLoadings.slice(0, 15) as loading}
          <div>
            <code>{loading.feature}</code>
            <span>{omicLabel(loading.layer)}</span>
            <strong>{loading.loading.toPrecision(3)}</strong>
            <span>{Math.abs(loading.loading).toPrecision(3)}</span>
            <span></span><span></span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if analysisResult.supervisedIntegration}
    <div class="integration-result">
      <div class="integration-head">
        <div>
          <p class="eyebrow">{t('Intégration supervisée', 'Supervised integration')}</p>
          <h3>{t('Composante latente multiblocs liée à la cible', 'Target-linked multiblock latent component')}
  <span class="help-tip" tabindex="0" data-tooltip={t('Résumé supervisé descriptif : chaque couche est standardisée et équilibrée, puis une composante maximise la covariance avec la cible. Les poids indiquent les variables qui structurent cet axe. Ce n’est pas une validation prédictive.', 'Descriptive supervised summary: each block is standardized and balanced, then one component maximizes covariance with the target. Weights indicate features structuring this axis. This is not predictive validation.')}>?</span>
</h3>
        </div>
        <span>{analysisResult.supervisedIntegration.subjects} {t('sujets', 'subjects')}</span>
      </div>
      <div class="api-summary">
        <span><strong>{Number.isFinite(analysisResult.supervisedIntegration.scoreTargetCorrelation) ? analysisResult.supervisedIntegration.scoreTargetCorrelation.toFixed(2) : '—'}</strong> r score-cible</span>
        <span><strong>{Number.isFinite(analysisResult.supervisedIntegration.scoreTargetR2) ? (100 * analysisResult.supervisedIntegration.scoreTargetR2).toFixed(1) + '%' : '—'}</strong> R² descriptif</span>
      </div>
      <p class="note">{analysisResult.supervisedIntegration.method}</p>
      <div class="cross-table">
        <div class="cross-head"><b>{t('Variable', 'Feature')}</b><b>{t('Omique', 'Omics')}</b><b>{t('Poids', 'Weight')}</b><b>|weight|</b><b></b><b></b></div>
        {#each analysisResult.supervisedIntegration.topWeights.slice(0, 15) as item}
          <div>
            <code>{item.feature}</code>
            <span>{omicLabel(item.layer)}</span>
            <strong>{item.weight.toPrecision(3)}</strong>
            <span>{item.absoluteWeight.toPrecision(3)}</span>
            <span></span><span></span>
          </div>
        {/each}
      </div>
      <p class="note">{analysisResult.supervisedIntegration.caveat}</p>
    </div>
  {/if}

  {#if analysisResult.predictiveOutcome}
    <div class="integration-result predictive-result">
      <div class="integration-head">
        <div>
          <p class="eyebrow">{t('Validation prédictive', 'Predictive validation')}</p>
          <h3>{t('Performance hors échantillon', 'Out-of-sample performance')}
  <span class="help-tip" tabindex="0" data-tooltip={t('La nested cross-validation sépare des folds externes pour mesurer la performance et des folds internes pour choisir la pénalisation. La sélection de variables n’utilise jamais les sujets du fold externe testé.', 'Nested cross-validation uses outer folds for performance assessment and inner folds for penalty tuning. Feature selection never uses subjects from the held-out outer test fold.')}>?</span>
</h3>
        </div>
        <span>{analysisResult.predictiveOutcome.status === 'ok' ? t('nested CV', 'nested CV') : t('non estimable', 'not estimable')}</span>
      </div>
      {#if analysisResult.predictiveOutcome.status === 'ok'}
        <div class="api-summary">
          {#if analysisResult.predictiveOutcome.metrics.auc != null}<span><strong>{analysisResult.predictiveOutcome.metrics.auc.toFixed(3)}</strong> AUC</span>{/if}
          {#if analysisResult.predictiveOutcome.metrics.accuracy != null}<span><strong>{(100 * analysisResult.predictiveOutcome.metrics.accuracy).toFixed(1)}%</strong> accuracy</span>{/if}
          {#if analysisResult.predictiveOutcome.metrics.rmse != null}<span><strong>{analysisResult.predictiveOutcome.metrics.rmse.toPrecision(3)}</strong> RMSE</span>{/if}
          {#if analysisResult.predictiveOutcome.metrics.r2 != null}<span><strong>{analysisResult.predictiveOutcome.metrics.r2.toFixed(3)}</strong> R² CV</span>{/if}
          {#if analysisResult.predictiveOutcome.metrics.logLoss != null}<span><strong>{analysisResult.predictiveOutcome.metrics.logLoss.toFixed(3)}</strong> log-loss</span>{/if}
          {#if analysisResult.predictiveOutcome.metrics.cIndex != null}<span><strong>{analysisResult.predictiveOutcome.metrics.cIndex.toFixed(3)}</strong> C-index <span class="help-tip" tabindex="0" data-tooltip={t('Indice de concordance de Harrell calculé uniquement sur les prédictions des folds externes. 0,5 correspond approximativement au hasard ; plus il est proche de 1, mieux le score de risque ordonne les temps d’événement observables.', 'Harrell concordance index computed only from outer-fold predictions. About 0.5 corresponds to chance; values closer to 1 mean the risk score better orders observable event times.')}>?</span></span>{/if}
          {#if analysisResult.predictiveOutcome.metrics.events != null}<span><strong>{analysisResult.predictiveOutcome.metrics.events}</strong> {t('événements', 'events')}</span>{/if}
        </div>
        <p class="note">{analysisResult.predictiveOutcome.method}. {analysisResult.predictiveOutcome.caveat}</p>
        <details>
          <summary>{t('Détails des folds', 'Fold details')}</summary>
          <div class="fold-grid">
            {#each analysisResult.predictiveOutcome.foldSummaries as fold}
              <span>Fold {fold.fold}: n train={fold.trainingSubjects}, n test={fold.testSubjects}, λ={fold.lambda}, p={fold.selectedFeatures}</span>
            {/each}
          </div>
        </details>
      {:else}
        <p class="muted">{analysisResult.predictiveOutcome.reason}</p>
      {/if}
    </div>
  {/if}

  {#if analysisResult.identifierResolution?.metabolomics}
    <div class="identifier-resolution">
      <div class="integration-head">
        <div>
          <p class="eyebrow">{t('Résolution des identifiants métabolites', 'Metabolite identifier resolution')}</p>
          <h3>{t('Libellés originaux → identifiants canoniques envoyés à l’analyse de voies', 'Original labels → canonical identifiers sent to pathway analysis')}</h3>
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
      <p class="note">{t('Seules les correspondances exactes ChEBI ou les alias lipidiques déterministes explicites sont acceptés automatiquement. Une correspondance incertaine reste non résolue au lieu d’être devinée.', 'Only exact ChEBI label matches or explicit deterministic lipid aliases are accepted automatically. Uncertain matches remain unresolved rather than being guessed.')}</p>
    </div>
  {/if}

  <div class="actual-layer-grid">
    {#each omicLayers as layer}
      {#if analysisResult.layers[layer]}
        {@const result = analysisResult.layers[layer]}
        <article>
          <div class="layer-title">
            <div>
              <span class="method-tag">{omicLabel(layer)}</span>
              <h3>{result.contrast || 'No valid contrast'}</h3>
            </div>
            <button class="text-button" type="button" onclick={() => downloadLayerCsv(layer)}>CSV ↓</button>
          </div>

          {#if result.error}
            <p class="error">{result.error}</p>
          {:else}
            <p class="muted">
              {result.mode === 'exploratory-multiblock-pca'
                ? result.inferenceMethod
                : result.mode?.startsWith('outcome-')
                  ? `${result.mode} · ${result.inferenceMethod || 'model'}`
                  : result.mode?.includes('multi-group')
                    ? `${t('tailles des groupes', 'group sizes')}: ${result.groupSizes.join(' / ')} · ${result.inferenceMethod || result.mode}`
                    : result.mode === 'random-intercept-longitudinal-model'
                      ? `${result.mode} · ${result.inferenceMethod || 'mixed model'}`
                      : `n=${result.groupSizes[0]} vs ${result.groupSizes[1]} · ${result.mode} · ${result.inferenceMethod || 'inference'}`}
            </p>
            <div class="preprocess-list">
              {#each result.steps as step}<span>{step}</span>{/each}
              {#if result.replicateGroups?.length}<span>{result.replicateGroups.length} technical-replicate group(s) averaged on the transformed scale</span>{/if}
            </div>
            <p class="selection-rule">{result.selectionRule}</p>
            {#if result.inferencePolicy}<p class="selection-rule"><strong>Inference:</strong> {result.inferencePolicy}</p>{/if}
            <div class="feature-table">
              <div class="feature-head">
  <b>{t('Variable', 'Feature')}</b>
  <b>{result.effectScale === 'log2' ? 'Fold ratio' : t('Effet', 'Effect')}
    <span class="help-tip" tabindex="0" data-tooltip={result.effectScale === 'log2'
      ? t('Rapport comparaison/référence calculé comme 2^effect sur une échelle log2. 2 = deux fois plus, 0,5 = deux fois moins.', 'Comparison/reference ratio computed as 2^effect on a log2 scale. 2 = twice as high; 0.5 = half as high.')
      : t('Direction et amplitude du contraste ou du coefficient estimé. Toujours lire le contraste affiché et son échelle.', 'Direction and magnitude of the estimated contrast or coefficient. Always read the displayed contrast and its scale.')}>?</span>
  </b>
  <b>p
    <span class="help-tip" tabindex="0" data-tooltip={t('p-value brute du test pour cette variable, avant correction des tests multiples. Une petite p-value seule ne suffit pas lorsqu’on teste beaucoup de variables.', 'Raw p-value for this feature before multiple-testing correction. A small p-value alone is not sufficient when many features are tested.')}>?</span>
  </b>
  <b>q BH
    <span class="help-tip" tabindex="0" data-tooltip={t('p-value ajustée par Benjamini–Hochberg pour contrôler le taux de faux positifs parmi les résultats retenus. Ici q ≤ 0,10 est un seuil exploratoire.', 'Benjamini–Hochberg adjusted p-value controlling the false discovery rate among selected results. Here q ≤ 0.10 is an exploratory threshold.')}>?</span>
  </b>
</div>
              {#each result.rows.slice(0, 10) as row}
                <div>
                  <code>{row.feature}</code>
                  {#if row.foldRatio != null}
                    <span class:negative={row.foldRatio != null && row.foldRatio < 1}>{row.foldRatio == null ? row.effect.toFixed(3) : `${row.foldRatio.toFixed(2)}×`}</span>
                  {:else if row.exponentiatedEffect != null}
                    <span class:negative={row.exponentiatedEffect < 1}>
                      {row.exponentiatedEffect.toPrecision(3)}×
                      {#if row.exponentiatedCiLow != null && row.exponentiatedCiHigh != null}
                        <small>[{row.exponentiatedCiLow.toPrecision(3)}–{row.exponentiatedCiHigh.toPrecision(3)}]</small>
                      {/if}
                      <small>(β={row.effect.toPrecision(3)})</small>
                    </span>
                  {:else}
                    <span class:negative={row.effect < 0}>
                      {row.effect.toPrecision(3)}
                      {#if row.ciLow != null && row.ciHigh != null}
                        <small>[{row.ciLow.toPrecision(3)}–{row.ciHigh.toPrecision(3)}]</small>
                      {/if}
                    </span>
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

  {#if !['explore','outcome'].includes(analysisResult.protocol?.objective)}
  <div class="integration-result cross-result">
    <div class="integration-head">
      <div>
        <p class="eyebrow">{t('Intégration inter-omique directe', 'Direct cross-omics integration')}</p>
        <h3>{t('Quelles relations moléculaires changent entre les conditions biologiques ?', 'Which molecular relationships change between the biological conditions?')}</h3>
      </div>
      <span>Spearman + Fisher z + BH-FDR</span>
    </div>
    <div class="api-summary">
      <span><strong>{analysisResult.crossOmics?.testedPairs ?? 0}</strong> matched cross-omic pairs tested</span>
      <span><strong>{analysisResult.crossOmics?.significantPairs ?? 0}</strong> pairs with q ≤ 0.10</span>
    </div>
    {#if analysisResult.crossOmics?.pairs?.length}
      <div class="cross-table">
        <div class="cross-head">
  <b>{t('Paire', 'Pair')}</b>
  <b>Pattern <span class="help-tip" tabindex="0" data-tooltip={t('Résumé déterministe du changement de corrélation : gain, perte, renforcement, affaiblissement ou inversion de signe.', 'Deterministic summary of the correlation change: gained, lost, strengthened, weakened or sign reversal.')}>?</span></b>
  <b>r reference <span class="help-tip" tabindex="0" data-tooltip={t('Corrélation de Spearman entre les deux variables dans le groupe de référence.', 'Spearman correlation between the two features in the reference group.')}>?</span></b>
  <b>r comparison <span class="help-tip" tabindex="0" data-tooltip={t('Même corrélation de Spearman dans le groupe comparé.', 'The same Spearman correlation in the comparison group.')}>?</span></b>
  <b>Δr <span class="help-tip" tabindex="0" data-tooltip={t('Différence r_comparison − r_reference. Une grande valeur absolue indique un changement important de couplage entre les deux conditions.', 'Difference r_comparison − r_reference. A large absolute value indicates a strong change in coupling between conditions.')}>?</span></b>
  <b>q BH <span class="help-tip" tabindex="0" data-tooltip={t('FDR Benjamini–Hochberg appliqué à toutes les paires inter-omiques testées. Il indique si le changement de corrélation reste crédible après correction multiple.', 'Benjamini–Hochberg FDR across all tested cross-omics pairs. It indicates whether the correlation change remains credible after multiple-testing correction.')}>?</span></b>
</div>
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
      <p class="muted">{t('Aucun test de changement de corrélation inter-omique n’était estimable avec les tailles de groupes et sujets appariés actuels.', 'No cross-omic correlation test was estimable with the current group sizes and matched subjects.')}</p>
    {/if}
  </div>
  {/if}

  <div class="integration-result">
    <div class="integration-head">
      <div>
        <p class="eyebrow">{t('Résultat intégré par voies', 'Integrated pathway result')}</p>
        <h3>{t('Reactome reçoit ensemble les identifiants de gènes, protéines et métabolites sélectionnés', 'Reactome receives the selected gene/protein/metabolite identifiers together')}</h3>
      </div>
      <span>{t('ORA déterministe', 'deterministic ORA')}</span>
    </div>

    {#if analysisResult.reactome}
      <div class="api-summary">
        <span><strong>{analysisResult.reactome.combined.pathwaysFound}</strong> pathways found</span>
        <span><strong>{analysisResult.reactome.combined.identifiersNotFound}</strong> identifiers not found</span>
      </div>
      <div class="pathway-table" data-testid="multiomics-pathways">
        <div class="pathway-head">
  <b>{t('Voie', 'Pathway')}</b>
  <b>{t('FDR univers assay', 'Assay-universe FDR')}
    <span class="help-tip" tabindex="0" data-tooltip={t('FDR recalculée localement par test hypergéométrique en utilisant comme univers les variables réellement conservées après QC. Si cet univers ne peut pas être mappé, la FDR Reactome par défaut sert de repli.', 'FDR recalculated locally by a hypergeometric test using the features actually retained after QC as the background universe. Reactome default FDR is used only as a fallback when that universe cannot be mapped.')}>?</span>
  </b>
  <b>RNA <span class="help-tip" tabindex="0" data-tooltip={t('FDR Reactome calculée uniquement avec les variables transcriptomiques sélectionnées.', 'Reactome FDR using only selected transcriptomic features.')}>?</span></b>
  <b>{t('Protéine', 'Protein')} <span class="help-tip" tabindex="0" data-tooltip={t('FDR Reactome calculée uniquement avec les variables protéomiques sélectionnées.', 'Reactome FDR using only selected proteomic features.')}>?</span></b>
  <b>{t('Métabolite', 'Metabolite')} <span class="help-tip" tabindex="0" data-tooltip={t('FDR Reactome calculée uniquement avec les métabolites sélectionnés.', 'Reactome FDR using only selected metabolites.')}>?</span></b>
  <b>{t('Couches ≤0,10', 'Layers ≤0.10')}
    <span class="help-tip" tabindex="0" data-tooltip={t('Nombre de couches omiques qui soutiennent séparément cette voie avec une FDR Reactome ≤0,10. Une valeur élevée indique une convergence inter-omique.', 'Number of omics layers independently supporting this pathway at Reactome FDR ≤0.10. A higher value indicates cross-omics convergence.')}>?</span>
  </b>
</div>
        {#each analysisResult.reactome.consensus.slice(0, 15) as pathway}
          <div>
            <a href={`https://reactome.org/content/detail/${pathway.id}`} target="_blank" rel="noreferrer">{pathway.name}</a>
            <span>{Number.isFinite(pathway.assayUniverseFdr) ? pathway.assayUniverseFdr.toPrecision(3) : Number.isFinite(pathway.fdr) ? pathway.fdr.toPrecision(3) + '*' : '—'}</span>
            <span>{pathway.layerEvidence.transcriptomics?.fdr != null ? pathway.layerEvidence.transcriptomics.fdr.toPrecision(2) : '—'}</span>
            <span>{pathway.layerEvidence.proteomics?.fdr != null ? pathway.layerEvidence.proteomics.fdr.toPrecision(2) : '—'}</span>
            <span>{pathway.layerEvidence.metabolomics?.fdr != null ? pathway.layerEvidence.metabolomics.fdr.toPrecision(2) : '—'}</span>
            <strong>{pathway.supportingLayers}</strong>
          </div>
        {/each}
      </div>
      <p class="note">{t('Le classement est déterministe : nombre de couches avec FDR de voie ≤ 0,10, puis FDR Reactome combinée, puis couverture de la voie. Il s’agit d’un classement exploratoire, pas d’une probabilité postérieure ni d’un score causal.', 'Ranking is deterministic: number of omics layers with pathway FDR ≤0.10, then combined Reactome FDR, then pathway coverage. This is an exploratory ranking, not a posterior probability or causal score.')}</p>
      <p class="note"><strong>{t('Univers d’enrichissement :', 'Enrichment background:')} <span class="help-tip" tabindex="0" data-tooltip={t('L’univers est l’ensemble des variables qui auraient pu être sélectionnées après QC. Utiliser cet univers évite de comparer un panel ciblé à tous les gènes ou métabolites connus de la base.', 'The background universe is the set of features that could have been selected after QC. Using this universe avoids comparing a targeted panel against every gene or metabolite known to the database.')}>?</span></strong> {analysisResult.reactome.backgroundPolicy}. {analysisResult.reactome.backgroundCaveat} {t('Un astérisque après une FDR indique que la FDR Reactome par défaut a été utilisée comme repli.', 'An asterisk after an FDR indicates that Reactome default FDR was used as a fallback.')}</p>
    {:else if analysisResult.reactomeError}
      <div class="api-error">
        <strong>{t('Les statistiques locales sont terminées ; Reactome n’a pas pu être joint.', 'Local statistics completed; Reactome could not be reached.')}</strong>
        <p>{analysisResult.reactomeError}</p>
        <p>{t('Les matrices ne quittent toujours pas le navigateur. Relancez plus tard ou désactivez Reactome pour utiliser uniquement les résultats statistiques locaux.', 'The matrices have still not left the browser. Re-run later or disable Reactome to use the local statistical output only.')}</p>
      </div>
    {:else}
      <p class="muted">{t('L’interrogation de Reactome était désactivée pour cette analyse.', 'Reactome querying was disabled for this run.')}</p>
    {/if}
  </div>

  <div class="evidence-layers">
    <article>
      <strong>{t('Observé', 'Observed')}</strong>
      <p>{t('Valeurs lues directement dans les matrices importées.', 'Values parsed from the uploaded matrices.')}</p>
    </article>
    <article>
      <strong>{t('Inférence statistique', 'Statistical inference')}</strong>
      <p>{analysisResult.protocol?.objective === 'outcome'
  ? t('Régression adaptée au type d’outcome avec batch/covariables comme termes de nuisance et correction Benjamini–Hochberg.', 'Outcome-specific regression with batch/covariates as nuisance terms and Benjamini–Hochberg correction.')
  : analysisResult.protocol?.objective === 'explore'
    ? t('ACP multi-blocs équilibrée sur les sujets communs, sans variable cible.', 'Balanced multi-block PCA across shared subjects without a target variable.')
    : t('Contrastes déterministes adaptés au design, différences de corrélations inter-omiques de Spearman et correction Benjamini–Hochberg.', 'Design-aware deterministic contrasts, cross-omics Spearman correlation differences and Benjamini–Hochberg correction.')}</p>
    </article>
    <article>
      <strong>{t('Connaissance externe', 'External knowledge')}</strong>
      <p>{t('Mapping et sur-représentation Reactome à partir des identifiants moléculaires sélectionnés.', 'Reactome pathway mapping and over-representation from the selected molecular identifiers.')}</p>
    </article>
    <article>
      <strong>{t('Non inféré', 'Not inferred')}</strong>
      <p>{t('Aucun récit LLM, aucune causalité ni aucun mécanisme biologique inventé n’est généré.', 'No LLM narrative, causal claim or invented biological mechanism is generated.')}</p>
    </article>
  </div>
</section>
{/if}

<section class="panel">
  <div class="section-head">
    <div>
      <p class="eyebrow">{t('Étape 6 · Analyse & bases biologiques', 'Step 6 · Analysis & biological databases')}</p>
      <h2>{t('Le moteur de décision est déterministe et inspectable', 'The decision engine is deterministic and inspectable')}</h2>
    </div>
    <p>{t('La branche statistique est sélectionnée à partir de règles explicites liées au design et reste inspectable.', 'The statistical branch is selected from explicit study-design rules and remains inspectable.')}</p>
  </div>

  <div class="plan">
    <div>
      <span class="method-tag">{t('Workflow sélectionné', 'Selected workflow')}</span>
      <h3>{analysisPlan}</h3>
      <p class="muted">Protocol: {studySetting.replaceAll('_', ' ')} · {designType} · {groupCount === '3plus' ? '≥3' : groupCount} group(s) · {sampleOverlap.replaceAll('_', ' ')}.</p>
    </div>
    <ul>
      <li><strong>Same specimen:</strong> assays are linked by <code>sample_id</code>, never by fuzzy name matching.</li>
      <li><strong>{t('Sujet répété :', 'Repeated subject:')}</strong> {t('deux temps utilisent un changement intra-sujet ; ≥3 temps numériques utilisent une pente individuelle.', 'two time points use within-subject change; ≥3 numeric-labelled times use an individual slope.')}</li>
      <li><strong>{t('Design apparié :', 'Paired design:')}</strong> {t('les différences intra-sujet utilisent un test de permutation par inversion de signe. Les crossovers restent refusés tant que période et séquence ne sont pas modélisées.', 'within-subject differences use a sign-flip permutation test. Crossover designs are refused until period/sequence effects are modelled.')}</li>
      <li><strong>Technical replicate:</strong> multiple assays with the same <code>sample_id + omic</code> are flagged before analysis.</li>
      <li><strong>{t('Batch technique :', 'Technical batch:')}</strong> {t('une confusion complète batch–condition/temps/outcome bloque l’inférence. Les batches multiples non confondus sont ajustés explicitement par résidualisation OLS variable par variable.', 'complete batch–condition/time/outcome confounding blocks inference. Multiple non-confounded batches are explicitly adjusted by feature-wise OLS residualisation.')}</li>
      <li><strong>{t('Covariables :', 'Covariates:')}</strong> {t('les colonnes sélectionnées sont intégrées explicitement à l’ajustement ou au modèle d’outcome ; aucune covariable n’est choisie automatiquement.', 'selected columns enter adjustment or outcome models explicitly; no covariate is chosen automatically.')}</li>
      <li><strong>{t('Omiques partielles :', 'Partial omics:')}</strong> {t('une couche absente est distinguée d’une valeur manquante dans une matrice observée.', 'absent layers are distinguished from missing values inside an observed matrix.')}</li>
      <li><strong>{t('Outcome :', 'Outcome:')}</strong> {t('le type déclaré sélectionne régression linéaire, logistique, Poisson, ANOVA multiclasse ou Cox.', 'the declared type selects linear, logistic, Poisson, multiclass ANOVA or Cox regression.')}</li>
    </ul>
  </div>

  <div class="database-bridge">
    <div class="section-head compact">
      <div>
        <p class="eyebrow">{t('Identifiant → biologie', 'Identifier → biology bridge')}</p>
        <h3>{t('Les bases publiques apportent le contexte biologique après validation des mesures', 'Public databases provide meaning after the measurements are validated')}</h3>
      </div>
      <p>{t('Seuls les identifiants moléculaires nécessaires aux requêtes d’annotation, de voies ou de réseaux sont envoyés aux API publiques. Les identifiants sujets, métadonnées et matrices d’abondance restent hors de ces appels.', 'Only molecular identifiers needed for annotation/pathway/network queries should be sent to public APIs. Subject IDs, metadata and abundance matrices remain outside these calls.')}</p>
    </div>
    <div class="database-grid">
      {#each databaseRegistry as db}
        <article>
          <span>{$language === 'en' ? db.scope : db.scopeFr} · {$language === 'en' ? db.status : db.statusFr}</span>
          <h3>{db.name}</h3>
          <p>{$language === 'en' ? db.role : db.roleFr}</p>
          <a href={db.url} target="_blank" rel="noreferrer">{t('API officielle / documentation ↗', 'Official API / documentation ↗')}</a>
        </article>
      {/each}
    </div>
    <div class="resolution-flow">
      <code>{transcriptomicsIdType}</code>
      <b>+</b>
      <code>{proteomicsIdType}</code>
      <b>+</b>
      <code>{metabolomicsIdType}</code>
      <span>{t('→ moteur actuel : résolution ChEBI conservatrice des métabolites (optionnelle) → intégration de voies Reactome. Ensembl, UniProt, UniChem, KEGG et STRING sont des connecteurs explicitement prévus, pas des appels automatiques cachés.', '→ current engine: conservative ChEBI resolution for metabolites (optional) → Reactome pathway integration. Ensembl, UniProt, UniChem, KEGG and STRING are explicit registry targets, not hidden automatic calls.')}</span>
    </div>

    <details class="aliases">
      <summary>{t('Suite de validation publique du moteur déterministe', 'Public validation suite used to test the deterministic engine')}</summary>
      <div class="alias-grid">
        <article><strong>Nutrimouse</strong><span>engine truth test</span><p>PPARα-dependent transcript/metabolite signal, CYP3A11 and lipid-pathway recovery.</p></article>
        <article><strong>TCGA breast</strong><span>engine truth test</span><p>HER2/LumA contrast plus Basal/Her2/LumA multi-group inference.</p></article>
        <article><strong>TCGA breast · predictive outcome</strong><span>nested-CV test</span><p>Her2 vs LumA prediction: 5-fold outer nested CV, AUC 0.996; supervised multiblock score-target correlation r=0.915 across 105 tumours.</p></article>
        <article><strong>IntLIM NCI-60 + BRCA</strong><span>cross-omics truth test</span><p>Published condition-dependent gene–metabolite correlation changes.</p></article>
        <article><strong>AgingHFCD</strong><span>3-omics reference test</span><p>RNA, protein and metabolite effect directions checked against public reference results.</p></article>
        <article><strong>LRRK2 G2019S</strong><span>2-omics reference test</span><p>RNA/protein direction agreement plus RAB/endocytic biology.</p></article>
        <article><strong>STATegra</strong><span>time-course + replicates</span><p>Real Ikaros time course and 36-sample metabolomics replicate design; processed representations are checked for direction and scale consistency.</p></article>
        <article><strong>PaintOmics planted multi-omics</strong><span>known ground truth</span><p>RNA/protein convergence is checked against a planted molecular module and recorded pathway truth set.</p></article>
        <article><strong>Bioconductor missRows NCI-60</strong><span>partial-block integration test</span><p>60 subjects across the union of layers, 40 complete across RNA + protein; latent-only filling is used without inventing values for differential tests.</p></article>
      </div>
      <p class="note">{t('La suite automatisée est volontairement hétérogène : elle teste la vérité biologique, l’appariement des échantillons, l’inférence multi-groupes, la structure des réplicats et les statistiques inter-omiques, et pas seulement l’exécution du code.', 'The automated suite is intentionally heterogeneous: it tests biological truth, sample matching, multi-group inference, replicate structure and cross-omics statistics rather than only checking that code executes.')}</p>
      <a href="https://github.com/rberrah/rberrah.github.io/actions/workflows/multiomics-public-benchmark.yml" target="_blank" rel="noreferrer">{t('Ouvrir le benchmark public ↗', 'Open the public benchmark workflow ↗')}</a>
    </details>
  </div>
</section>

{#if helpTooltip.visible}
  <div
    class="global-help-tooltip {helpTooltip.placement}"
    data-testid="global-help-tooltip"
    role="tooltip"
    style={'left:' + helpTooltip.left + 'px;top:' + helpTooltip.top + 'px'}
  >
    {helpTooltip.text}
  </div>
{/if}

<style>
  .hero { max-width: 920px; padding: var(--space-12) 0 var(--space-8); }
  .tool-back { display: inline-block; margin-bottom: var(--space-4); font-size: var(--text-sm); }
  .help-tip { position: relative; display: inline-grid; place-items: center; width: 1.05rem; height: 1.05rem; margin-left: 3px; border: 1px solid var(--border-strong); border-radius: 50%; font: 700 0.72rem/1 var(--font-sans); color: var(--text-secondary); cursor: help; vertical-align: middle; }
  .help-tip::after { display:none; }
  .global-help-tooltip { position:fixed; z-index:10000; width:min(320px,76vw); padding:9px 11px; border:1px solid var(--border-strong); border-radius:8px; background:var(--bg-primary); box-shadow:0 10px 30px rgba(0,0,0,.22); color:var(--text-primary); font:400 var(--text-xs)/1.45 var(--font-sans); text-align:left; white-space:normal; pointer-events:none; }
  .global-help-tooltip.above { transform:translate(-50%,-100%); }
  .global-help-tooltip.below { transform:translate(-50%,0); }
  .help-tip:focus-visible { outline: 2px solid var(--accent-pk); outline-offset: 2px; }
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
  .covariate-picker { margin-top: var(--space-5); padding-top: var(--space-4); border-top: 1px solid var(--border-subtle); }
  .covariate-picker h3 { margin-bottom: 4px; }
  .covariate-picker > div > p { margin-top: 0; color: var(--text-secondary); }
  .covariate-options { display: flex; flex-wrap: wrap; gap: 8px; margin: var(--space-3) 0; }
  .covariate-options label { display: flex; align-items: center; gap: 7px; border: 1px solid var(--border-subtle); border-radius: 999px; padding: 6px 10px; background: var(--bg-primary); }
  .covariate-options input { width: auto; margin: 0; }
  .qc-result { margin-top: var(--space-5); }
  .qc-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:var(--space-4); margin-top:var(--space-4); }
  .qc-card { border:1px solid var(--border-subtle); border-radius:var(--radius); padding:var(--space-4); background:var(--bg-secondary); min-width:0; }
  .qc-card-head { display:flex; justify-content:space-between; gap:var(--space-3); align-items:start; }
  .qc-card-head div { display:grid; gap:2px; }
  .qc-card-head small { color:var(--text-secondary); }
  .qc-card-head > span { font-size:var(--text-xs); border:1px solid var(--border-subtle); border-radius:999px; padding:3px 7px; }
  .qc-card-head > span.qc-warning { border-color:var(--warning); color:var(--warning); }
  .qc-badges { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:5px; }
  .qc-badges > span { font-size:var(--text-xs); border:1px solid var(--border-subtle); border-radius:999px; padding:3px 7px; }
  .qc-badges > span.qc-warning { border-color:var(--warning); color:var(--warning); }
  .qc-badges > span.qc-screening { border-color:var(--accent-pk); color:var(--text-secondary); }
  .ms-qc-controls { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; padding:10px; border:1px solid var(--border-subtle); border-radius:var(--radius); background:var(--bg-primary); }
  .ms-qc-controls > strong { grid-column:1/-1; }
  .ms-qc-controls label { display:grid; gap:4px; }
  .ms-qc-summary { display:flex; flex-wrap:wrap; gap:5px; margin:10px 0; }
  .ms-qc-summary > strong, .ms-qc-summary > span { font-size:10px; font-family:var(--font-mono); padding:4px 6px; border:1px solid var(--border-subtle); border-radius:999px; }
  .qc-metrics { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin:var(--space-4) 0; }
  .qc-metrics div { display:grid; gap:2px; }
  .qc-metrics b { font-family:var(--font-mono); }
  .qc-metrics span { color:var(--text-secondary); font-size:var(--text-xs); }
  .qc-bars { display:grid; gap:5px; max-height:150px; overflow:auto; }
  .qc-bars > div { display:grid; grid-template-columns:minmax(50px,.8fr) 2fr; gap:7px; align-items:center; font-size:var(--text-xs); }
  .qc-bars span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .qc-bars i { display:block; height:6px; border-radius:99px; background:var(--border-subtle); overflow:hidden; }
  .qc-bars em { display:block; height:100%; background:var(--accent-pk); min-width:1px; }
  .qc-pca { margin-top:var(--space-4); }
  .qc-pca-head { display:flex; justify-content:space-between; gap:var(--space-2); margin-bottom:6px; }
  .qc-scatter { position:relative; height:180px; border:1px solid var(--border-subtle); background:var(--bg-primary); overflow:hidden; }
  .qc-scatter .axis-x { position:absolute; left:0; right:0; top:50%; height:1px; background:var(--border-subtle); }
  .qc-scatter .axis-y { position:absolute; top:0; bottom:0; left:50%; width:1px; background:var(--border-subtle); }
  .qc-dot { position:absolute; width:9px; height:9px; transform:translate(-50%,50%); border:1px solid var(--bg-primary); border-radius:50%; background:var(--accent-pd); padding:0; }
  .qc-dot:focus-visible { outline:2px solid var(--accent-pk); outline-offset:2px; }
  .interpretation-box { margin-top: var(--space-5); padding: var(--space-5); border-left: 3px solid var(--accent-pd); background: var(--bg-secondary); }
  .interpretation-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: var(--space-3); margin-top: var(--space-4); }
  .interpretation-grid article { padding: var(--space-4); border: 1px solid var(--border-subtle); border-radius: var(--radius); background: var(--bg-primary); }
  .interpretation-grid p { color: var(--text-secondary); font-size: var(--text-sm); margin-bottom: 0; }
  .reference-backend-box { margin-top:var(--space-4); padding:var(--space-4); border:1px solid var(--border-subtle); border-radius:var(--radius); background:var(--bg-primary); }
  .reference-backend-box > div:first-child { display:flex; align-items:center; gap:5px; }
  .backend-controls { display:grid; grid-template-columns:minmax(180px,.8fr) minmax(220px,1.4fr) auto; gap:8px; margin:10px 0 6px; }
  .btn-small { padding:8px 11px; }
  .backend-packages { display:flex; flex-wrap:wrap; gap:5px; margin-top:8px; }
  .backend-packages span, .backend-method-grid article > span { font:600 10px/1.2 var(--font-mono); border:1px solid var(--border-subtle); border-radius:999px; padding:4px 6px; }
  .backend-packages span.installed, .backend-method-grid article > span.installed { border-color:var(--accent-pd); }
  .backend-ok { color:var(--accent-pd); }
  .backend-bad { color:var(--accent-ai); }
  .backend-method-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; margin-top:var(--space-4); }
  .backend-method-grid article { display:grid; grid-template-columns:1fr auto; gap:4px 8px; padding:10px; border:1px solid var(--border-subtle); border-radius:var(--radius); background:var(--bg-primary); }
  .backend-method-grid small { grid-column:1/-1; }
  .predictive-result .api-summary { margin-top:var(--space-4); }
  .fold-grid { display:grid; gap:5px; font-family:var(--font-mono); font-size:var(--text-xs); margin-top:var(--space-3); }
  .interpretation-glossary { margin-top: var(--space-4); }
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
    .alias-grid, .mapping-grid, .matrix-checks, .identity-grid, .omics-question-grid, .database-grid, .demo-story, .demo-omics-grid, .module-grid, .evidence-layers, .actual-layer-grid, .computed-summary, .interpretation-grid, .qc-grid { grid-template-columns: repeat(2, 1fr); }
    .validation { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 640px) {
    .section-head, .mapping-head { align-items: start; flex-direction: column; }
    .form-grid, .uploads, .result-grid, .workflow, .alias-grid, .mapping-grid, .matrix-checks, .identity-grid, .validation, .omics-question-grid, .database-grid, .demo-story, .demo-omics-grid, .module-grid, .evidence-layers, .actual-layer-grid, .computed-summary, .interpretation-grid, .qc-grid { grid-template-columns: 1fr; }
    .run-box, .overlap-box { align-items: stretch; flex-direction: column; }
    .backend-controls, .backend-method-grid, .ms-qc-controls { grid-template-columns: 1fr; }
    .overlap-pairs { justify-content: flex-start; }
    .dictionary-table > div { grid-template-columns: 1fr; gap: 2px; padding: 12px 0; }
    .workflow div { border-right: 0; border-bottom: 1px solid var(--border-subtle); }
    .workflow div:last-child { border-bottom: 0; }
    .wide { grid-column: auto; }
    .status { align-items: start; flex-direction: column; }
  }
</style>
