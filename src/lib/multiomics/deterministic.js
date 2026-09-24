// @ts-nocheck
const LAYERS = ['transcriptomics', 'proteomics', 'metabolomics'];

function normaliseText(value) {
  return String(value ?? '').trim();
}

function canonicalOmic(value) {
  const key = normaliseText(value).toLowerCase().replace(/[^a-z0-9]+/g, '_');
  if (['transcriptomics','transcriptome','transcriptomique','rna','rnaseq','rna_seq','mrna','arn','gene_expression'].includes(key)) return 'transcriptomics';
  if (['proteomics','proteome','proteomique','protein','proteins','proteine','proteines','lfq'].includes(key)) return 'proteomics';
  if (['metabolomics','metabolome','metabolomique','metabolite','metabolites','met'].includes(key)) return 'metabolomics';
  return key;
}

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
      } else quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      out.push(current.trim());
      current = '';
    } else current += char;
  }
  out.push(current.trim());
  return out;
}

function detectDelimiter(text) {
  const first = text.split(/\r?\n/).find((line) => line.trim()) ?? '';
  return [',','\t',';']
    .map((delimiter) => ({ delimiter, n: splitDelimitedLine(first, delimiter).length }))
    .sort((a,b) => b.n - a.n)[0]?.delimiter ?? ',';
}

export function parseDelimited(text) {
  const delimiter = detectDelimiter(text);
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return { headers: [], rows: [], delimiter };
  const headers = splitDelimitedLine(lines[0], delimiter);
  const rows = lines.slice(1).map((line) => {
    const values = splitDelimitedLine(line, delimiter);
    return Object.fromEntries(headers.map((header, i) => [header, values[i] ?? '']));
  });
  return { headers, rows, delimiter };
}

function finiteNumber(value) {
  if (value === '' || value == null) return null;
  const x = Number(String(value).replace(',', '.'));
  return Number.isFinite(x) ? x : null;
}

function mean(values) {
  const x = values.filter(Number.isFinite);
  return x.length ? x.reduce((a,b) => a+b, 0) / x.length : NaN;
}

function median(values) {
  const x = values.filter(Number.isFinite).slice().sort((a,b) => a-b);
  if (!x.length) return NaN;
  const m = Math.floor(x.length / 2);
  return x.length % 2 ? x[m] : (x[m-1] + x[m]) / 2;
}

function hashString(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rngFromSeed(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(array, rng) {
  const out = array.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function chooseCount(n, k) {
  k = Math.min(k, n-k);
  let value = 1;
  for (let i = 1; i <= k; i += 1) value = value * (n-k+i) / i;
  return Math.round(value);
}

function combinations(n, k, limit = 5000) {
  const total = chooseCount(n,k);
  if (total > limit) return null;
  const out = [];
  const current = [];
  function walk(start, left) {
    if (left === 0) { out.push(current.slice()); return; }
    for (let i = start; i <= n-left; i += 1) {
      current.push(i);
      walk(i+1, left-1);
      current.pop();
    }
  }
  walk(0,k);
  return out;
}

function permutationPValue(groupA, groupB, seedKey) {
  const a = groupA.filter(Number.isFinite);
  const b = groupB.filter(Number.isFinite);
  if (a.length < 2 || b.length < 2) return null;
  const observed = Math.abs(mean(b) - mean(a));
  const all = [...a, ...b];
  const nA = a.length;
  const exact = combinations(all.length, nA, 4096);
  let extreme = 0;
  let total = 0;
  if (exact) {
    for (const indices of exact) {
      const set = new Set(indices);
      const pa = all.filter((_,i) => set.has(i));
      const pb = all.filter((_,i) => !set.has(i));
      if (Math.abs(mean(pb) - mean(pa)) >= observed - 1e-12) extreme += 1;
      total += 1;
    }
    return total ? extreme / total : null;
  }
  const rng = rngFromSeed(hashString(seedKey));
  total = 4096;
  for (let iter = 0; iter < total; iter += 1) {
    const perm = shuffled(all, rng);
    const pa = perm.slice(0,nA);
    const pb = perm.slice(nA);
    if (Math.abs(mean(pb) - mean(pa)) >= observed - 1e-12) extreme += 1;
  }
  return (extreme + 1) / (total + 1);
}

function bhAdjust(rows) {
  const valid = rows.map((row,index) => ({ index, p: row.pValue })).filter((x) => Number.isFinite(x.p)).sort((a,b) => a.p-b.p);
  const m = valid.length;
  let previous = 1;
  for (let i = m-1; i >= 0; i -= 1) {
    const q = Math.min(previous, valid[i].p * m / (i+1), 1);
    rows[valid[i].index].qValue = q;
    previous = q;
  }
  return rows;
}

function naturalOrder(values) {
  return [...new Set(values.filter(Boolean))].sort((a,b) => {
    const na = Number(String(a).match(/-?\d+(?:\.\d+)?/)?.[0]);
    const nb = Number(String(b).match(/-?\d+(?:\.\d+)?/)?.[0]);
    if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) return na-nb;
    return String(a).localeCompare(String(b), undefined, {numeric:true});
  });
}

function canonicalMetadata(metadataRows, columnMapping) {
  return metadataRows.map((row) => {
    const get = (key) => {
      const column = columnMapping[key];
      return column ? normaliseText(row[column]) : '';
    };
    return {
      subjectId: get('subject_id'),
      sampleId: get('sample_id'),
      assayId: get('assay_id'),
      omic: canonicalOmic(get('omic')),
      condition: get('condition'),
      timepoint: get('timepoint'),
      batch: get('batch'),
      technicalReplicate: get('technical_replicate'),
      outcome: get('outcome')
    };
  }).filter((row) => row.subjectId && row.sampleId && row.assayId && LAYERS.includes(row.omic));
}

function matrixFromText(text, expectedAssays) {
  const parsed = parseDelimited(text);
  if (parsed.headers.length < 2) throw new Error('Matrix requires a feature column and at least one assay.');
  const first = parsed.headers[0];
  const headerAssays = parsed.headers.slice(1);
  const rowIds = parsed.rows.map((row) => normaliseText(row[first])).filter(Boolean);
  const expected = new Set(expectedAssays);
  const columnMatches = headerAssays.filter((id) => expected.has(id)).length;
  const rowMatches = rowIds.filter((id) => expected.has(id)).length;

  if (rowMatches > columnMatches) {
    const featureHeaders = parsed.headers.slice(1);
    const assayRows = parsed.rows.filter((row) => expected.has(normaliseText(row[first])));
    const values = new Map();
    for (const feature of featureHeaders) {
      const featureValues = new Map();
      for (const row of assayRows) {
        const assay = normaliseText(row[first]);
        featureValues.set(assay, finiteNumber(row[feature]));
      }
      values.set(feature, featureValues);
    }
    return { features: featureHeaders, assays: assayRows.map((row) => normaliseText(row[first])), values, transposed: true };
  }

  const values = new Map();
  for (const row of parsed.rows) {
    const feature = normaliseText(row[first]);
    if (!feature) continue;
    const featureValues = new Map();
    for (const assay of headerAssays) featureValues.set(assay, finiteNumber(row[assay]));
    values.set(feature, featureValues);
  }
  return { features: [...values.keys()], assays: headerAssays, values, transposed: false };
}

function minimumPositive(matrix) {
  let min = Infinity;
  for (const values of matrix.values.values()) {
    for (const value of values.values()) if (Number.isFinite(value) && value > 0 && value < min) min = value;
  }
  return Number.isFinite(min) ? min : 1;
}

function preprocessMatrix(matrix, layer, valueType) {
  const assays = matrix.assays;
  const processed = new Map();
  const steps = [];
  const minPositive = minimumPositive(matrix);
  const pseudo = Math.max(minPositive / 2, 1e-12);
  const hasNegative = [...matrix.values.values()].some((values) =>
    [...values.values()].some((value) => Number.isFinite(value) && value < 0)
  );

  const isCounts = layer === 'transcriptomics' && valueType === 'raw_counts';
  const isSpectral = layer === 'proteomics' && valueType === 'spectral_count';
  const explicitlyLog = ['log_expression','log_intensity','log_abundance'].includes(valueType);
  const alreadyLog = explicitlyLog || (hasNegative && !isCounts && !isSpectral);
  const medianCenter = (layer === 'proteomics' && valueType === 'lfq_intensity') || (layer === 'metabolomics' && valueType === 'peak_area');

  const totals = new Map();
  if (isCounts || isSpectral) {
    for (const assay of assays) {
      let total = 0;
      for (const values of matrix.values.values()) {
        const v = values.get(assay);
        if (Number.isFinite(v) && v > 0) total += v;
      }
      totals.set(assay, total || 1);
    }
    steps.push(isCounts ? 'library-size normalisation to CPM + log2(CPM + 0.5)' : 'library-size normalisation + log2 transform');
  } else if (alreadyLog) {
    steps.push(explicitlyLog
      ? 'values treated as already log-transformed'
      : 'negative values detected: treated as already transformed/centred; no log transform applied');
  } else {
    steps.push(`log2(value + ${pseudo.toPrecision(3)})`);
  }

  for (const [feature, values] of matrix.values.entries()) {
    const next = new Map();
    for (const assay of assays) {
      const raw = values.get(assay);
      if (!Number.isFinite(raw)) { next.set(assay, null); continue; }
      if (isCounts || isSpectral) {
        const cpm = raw / totals.get(assay) * 1e6;
        next.set(assay, Math.log2(cpm + 0.5));
      } else if (alreadyLog) next.set(assay, raw);
      else next.set(assay, Math.log2(Math.max(0, raw) + pseudo));
    }
    processed.set(feature, next);
  }

  if (medianCenter) {
    const medians = new Map();
    for (const assay of assays) {
      const vals = [...processed.values()].map((values) => values.get(assay)).filter(Number.isFinite);
      medians.set(assay, median(vals));
    }
    const target = median([...medians.values()]);
    for (const values of processed.values()) {
      for (const assay of assays) {
        const v = values.get(assay);
        if (Number.isFinite(v)) values.set(assay, v - medians.get(assay) + target);
      }
    }
    steps.push('sample-wise median centering on the log scale');
  }

  return { ...matrix, values: processed, steps, scale: 'log2' };
}

function aggregateTechnicalReplicates(matrix, metadata, layer) {
  const rows = metadata.filter((row) => row.omic === layer);
  const bySample = new Map();
  for (const row of rows) {
    if (!bySample.has(row.sampleId)) bySample.set(row.sampleId, []);
    bySample.get(row.sampleId).push(row.assayId);
  }
  const values = new Map();
  for (const feature of matrix.features) {
    const source = matrix.values.get(feature);
    const next = new Map();
    for (const [sampleId, assays] of bySample.entries()) {
      const vals = assays.map((assay) => source.get(assay)).filter(Number.isFinite);
      next.set(sampleId, vals.length ? mean(vals) : null);
    }
    values.set(feature, next);
  }
  const sampleMeta = new Map();
  for (const row of rows) {
    if (!sampleMeta.has(row.sampleId)) sampleMeta.set(row.sampleId, row);
  }
  const replicateGroups = [...bySample.entries()].filter(([,assays]) => assays.length > 1).map(([sampleId,assays]) => ({sampleId, assays}));
  return { features: matrix.features, values, sampleMeta, replicateGroups, steps: matrix.steps };
}

function subjectFeatureValues(aggregated, feature, options) {
  const source = aggregated.values.get(feature);
  const perSubject = new Map();
  for (const [sampleId, row] of aggregated.sampleMeta.entries()) {
    const value = source.get(sampleId);
    if (!Number.isFinite(value)) continue;
    if (!perSubject.has(row.subjectId)) perSubject.set(row.subjectId, []);
    perSubject.get(row.subjectId).push({ value, row });
  }

  const conditions = naturalOrder([...aggregated.sampleMeta.values()].map((row) => row.condition));
  const timepoints = naturalOrder([...aggregated.sampleMeta.values()].map((row) => row.timepoint));
  if (conditions.length !== 2) return { error: 'Current deterministic inference requires exactly two conditions.', conditions, timepoints };

  if (options.longitudinal && timepoints.length >= 2) {
    const first = timepoints[0];
    const last = timepoints[timepoints.length - 1];
    const groups = [[],[]];
    for (const entries of perSubject.values()) {
      const baseline = entries.filter((x) => x.row.timepoint === first).map((x) => x.value);
      const endpoint = entries.filter((x) => x.row.timepoint === last).map((x) => x.value);
      if (!baseline.length || !endpoint.length) continue;
      const condition = entries.find((x) => x.row.timepoint === last)?.row.condition || entries[0].row.condition;
      const index = conditions.indexOf(condition);
      if (index >= 0) groups[index].push(mean(endpoint) - mean(baseline));
    }
    return { groups, conditions, timepoints, contrast: `Δ${last}−${first}: ${conditions[1]} vs ${conditions[0]}`, mode: 'difference-in-differences' };
  }

  const targetTime = timepoints.length ? timepoints[timepoints.length - 1] : '';
  const groups = [[],[]];
  for (const entries of perSubject.values()) {
    const eligible = targetTime ? entries.filter((x) => x.row.timepoint === targetTime) : entries;
    if (!eligible.length) continue;
    const condition = eligible[0].row.condition;
    const index = conditions.indexOf(condition);
    if (index >= 0) groups[index].push(mean(eligible.map((x) => x.value)));
  }
  return { groups, conditions, timepoints, contrast: `${conditions[1]} vs ${conditions[0]}${targetTime ? ` at ${targetTime}` : ''}`, mode: 'two-group' };
}

function analyseLayer(aggregated, layer, options) {
  const rows = [];
  let contrast = '';
  let mode = '';
  let groupSizes = [0,0];
  for (const feature of aggregated.features) {
    const data = subjectFeatureValues(aggregated, feature, options);
    if (data.error) return { error: data.error, rows: [], contrast: '', mode: '', groupSizes: [0,0], selected: [], steps: aggregated.steps };
    const [a,b] = data.groups;
    contrast = data.contrast;
    mode = data.mode;
    groupSizes = [a.length,b.length];
    if (!a.length || !b.length) continue;
    const effect = mean(b) - mean(a);
    const pValue = permutationPValue(a,b, `${layer}|${feature}|${contrast}`);
    rows.push({
      feature,
      effect,
      foldRatio: Math.pow(2,effect),
      pValue,
      qValue: null,
      nReference: a.length,
      nComparison: b.length
    });
  }
  bhAdjust(rows);
  rows.sort((a,b) => Math.abs(b.effect) - Math.abs(a.effect));
  const significant = rows.filter((row) => Number.isFinite(row.qValue) && row.qValue <= 0.10 && Math.abs(row.effect) >= Math.log2(1.2));
  const useConfirmedSet = significant.length >= 10;
  const selected = useConfirmedSet
    ? significant.slice(0, 50)
    : rows.slice().sort((a,b) => {
        const aq = Number.isFinite(a.qValue) ? a.qValue : 1;
        const bq = Number.isFinite(b.qValue) ? b.qValue : 1;
        if (aq !== bq) return aq - bq;
        return Math.abs(b.effect) - Math.abs(a.effect);
      }).slice(0, Math.min(25, rows.length));
  return {
    rows,
    selected,
    selectionRule: useConfirmedSet
      ? 'q ≤ 0.10 and |fold change| ≥ 1.2, capped at 50 features'
      : `only ${significant.length} FDR-qualified feature(s); top ${selected.length} ranked features used for exploratory pathway mapping`,
    contrast,
    mode,
    groupSizes,
    steps: aggregated.steps
  };
}

function pathwayField(pathway, path, fallback = null) {
  let value = pathway;
  for (const key of path) value = value?.[key];
  return value ?? fallback;
}

function normaliseReactomePathway(pathway) {
  return {
    id: pathway.stId || pathway.dbId || pathway.id || '',
    name: pathway.name || pathway.displayName || 'Unnamed pathway',
    species: pathway.species || pathway.speciesName || '',
    entitiesFound: Number(pathwayField(pathway,['entities','found'], pathway.entitiesFound ?? 0)),
    entitiesTotal: Number(pathwayField(pathway,['entities','total'], pathway.entitiesTotal ?? 0)),
    pValue: Number(pathwayField(pathway,['entities','pValue'], pathway.pValue ?? NaN)),
    fdr: Number(pathwayField(pathway,['entities','fdr'], pathway.fdr ?? NaN)),
    reactionsFound: Number(pathwayField(pathway,['reactions','found'], pathway.reactionsFound ?? 0)),
    raw: pathway
  };
}

export async function reactomeOverRepresentation(ids, { projectToHuman = true, pageSize = 100 } = {}) {
  const unique = [...new Set(ids.map((id) => normaliseText(id)).filter(Boolean))];
  if (!unique.length) return { pathways: [], summary: null, identifiersNotFound: 0, pathwaysFound: 0, token: null };
  const endpoint = projectToHuman
    ? 'https://reactome.org/AnalysisService/identifiers/projection/'
    : 'https://reactome.org/AnalysisService/identifiers/';
  const response = await fetch(`${endpoint}?pageSize=${pageSize}&page=1`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: ['#Identifiers', ...unique].join('\n')
  });
  if (!response.ok) throw new Error(`Reactome API returned HTTP ${response.status}`);
  const json = await response.json();
  return {
    pathways: (json.pathways || []).map(normaliseReactomePathway),
    summary: json.summary || null,
    identifiersNotFound: Number(json.identifiersNotFound ?? 0),
    pathwaysFound: Number(json.pathwaysFound ?? 0),
    token: json.summary?.token || null
  };
}

export function mergeReactomeResults(combined, perLayer) {
  const layerMaps = Object.fromEntries(Object.entries(perLayer).map(([layer,result]) => [
    layer,
    new Map((result?.pathways || []).map((pathway) => [pathway.id, pathway]))
  ]));
  return (combined?.pathways || []).map((pathway) => {
    const layerEvidence = {};
    let supportingLayers = 0;
    for (const layer of LAYERS) {
      const hit = layerMaps[layer]?.get(pathway.id);
      const fdr = hit && Number.isFinite(hit.fdr) ? hit.fdr : null;
      layerEvidence[layer] = hit ? { fdr, entitiesFound: hit.entitiesFound } : null;
      if (fdr != null && fdr <= 0.10) supportingLayers += 1;
    }
    return { ...pathway, layerEvidence, supportingLayers };
  }).sort((a,b) => {
    if (b.supportingLayers !== a.supportingLayers) return b.supportingLayers - a.supportingLayers;
    const af = Number.isFinite(a.fdr) ? a.fdr : 1;
    const bf = Number.isFinite(b.fdr) ? b.fdr : 1;
    if (af !== bf) return af-bf;
    return b.entitiesFound-a.entitiesFound;
  });
}

export async function runDeterministicAnalysis({ files, metadataRows, columnMapping, protocol, dataTypes, useReactome = true }) {
  const metadata = canonicalMetadata(metadataRows, columnMapping);
  if (!metadata.length) throw new Error('No valid metadata rows after mapping.');
  const loadedLayers = LAYERS.filter((layer) => files[layer]);
  if (loadedLayers.length < 2) throw new Error('At least two omics layers are required.');

  const layers = {};
  for (const layer of loadedLayers) {
    const expected = metadata.filter((row) => row.omic === layer).map((row) => row.assayId);
    const text = await files[layer].text();
    const matrix = matrixFromText(text, expected);
    const processed = preprocessMatrix(matrix, layer, dataTypes[layer]);
    const aggregated = aggregateTechnicalReplicates(processed, metadata, layer);
    layers[layer] = analyseLayer(aggregated, layer, { longitudinal: protocol.longitudinal });
    layers[layer].replicateGroups = aggregated.replicateGroups;
    layers[layer].matrixShape = { features: matrix.features.length, assays: matrix.assays.length, transposed: matrix.transposed };
  }

  const selectedIds = Object.fromEntries(loadedLayers.map((layer) => [layer, layers[layer].selected.map((row) => row.feature)]));
  const combinedIds = loadedLayers.flatMap((layer) => selectedIds[layer]);

  let reactome = null;
  let reactomeError = null;
  if (useReactome && combinedIds.length) {
    try {
      const projectToHuman = true;
      const entries = await Promise.all([
        reactomeOverRepresentation(combinedIds, {projectToHuman}),
        ...loadedLayers.map((layer) => reactomeOverRepresentation(selectedIds[layer], {projectToHuman}))
      ]);
      const combined = entries[0];
      const perLayer = Object.fromEntries(loadedLayers.map((layer,i) => [layer, entries[i+1]]));
      reactome = { combined, perLayer, consensus: mergeReactomeResults(combined, perLayer) };
    } catch (error) {
      reactomeError = error instanceof Error ? error.message : 'Reactome API request failed.';
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    protocol,
    metadataSummary: {
      subjects: new Set(metadata.map((row) => row.subjectId)).size,
      samples: new Set(metadata.map((row) => row.sampleId)).size,
      assays: new Set(metadata.map((row) => row.assayId)).size,
      conditions: naturalOrder(metadata.map((row) => row.condition)),
      timepoints: naturalOrder(metadata.map((row) => row.timepoint))
    },
    layers,
    selectedIds,
    reactome,
    reactomeError
  };
}

export function resultToCsv(rows) {
  const header = ['feature','effect_log2','fold_ratio','p_value','q_value','n_reference','n_comparison'];
  const lines = rows.map((row) => [
    row.feature,
    row.effect,
    row.foldRatio,
    row.pValue ?? '',
    row.qValue ?? '',
    row.nReference,
    row.nComparison
  ].join(','));
  return [header.join(','), ...lines].join('\n');
}
