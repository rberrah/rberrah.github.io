// @ts-nocheck
const LAYERS = ['transcriptomics', 'proteomics', 'metabolomics'];
const CHEBI_SEARCH_URL = 'https://www.ebi.ac.uk/chebi/backend/api/public/es_search/';
const metaboliteResolutionCache = new Map();

const METABOLITE_ALIASES = new Map(Object.entries({
  'c14.0': 'myristic acid',
  'c16.0': 'palmitic acid',
  'c16.1n.7': 'palmitoleic acid',
  'c16.1n.9': 'cis-7-hexadecenoic acid',
  'c18.0': 'stearic acid',
  'c18.1n.9': 'oleic acid',
  'c18.1n.7': 'vaccenic acid',
  'c18.2n.6': 'linoleic acid',
  'c18.3n.6': 'gamma-linolenic acid',
  'c18.3n.3': 'alpha-linolenic acid',
  'c20.1n.9': 'gadoleic acid',
  'c20.2n.6': 'eicosadienoic acid',
  'c20.3n.6': 'dihomo-gamma-linolenic acid',
  'c20.4n.6': 'arachidonic acid',
  'c20.5n.3': 'eicosapentaenoic acid',
  'c22.4n.6': 'adrenic acid',
  'c22.5n.6': 'docosapentaenoic acid',
  'c22.5n.3': 'docosapentaenoic acid',
  'c22.6n.3': 'docosahexaenoic acid'
}));

function normaliseText(value) {
  return String(value ?? '').trim();
}

function lexicalKey(value) {
  return normaliseText(value)
    .toLowerCase()
    .replace(/[α]/g, 'alpha')
    .replace(/[β]/g, 'beta')
    .replace(/[γ]/g, 'gamma')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function directIdentifierType(value) {
  const id = normaliseText(value);
  if (/^CHEBI:\d+$/i.test(id)) return 'chebi';
  if (/^HMDB\d+$/i.test(id)) return 'hmdb';
  if (/^C\d{5}$/i.test(id)) return 'kegg';
  return null;
}

function candidateChebiSource(result) {
  return result?._source || result?.source || result || null;
}

export async function resolveMetaboliteIdentifier(identifier, { fetchFn = fetch } = {}) {
  const original = normaliseText(identifier);
  if (!original) return { original, resolved: null, status: 'empty', method: 'none', query: '' };

  const direct = directIdentifierType(original);
  if (direct === 'chebi') {
    return { original, resolved: original.toUpperCase(), status: 'canonical', method: 'input', query: original };
  }
  if (direct === 'hmdb' || direct === 'kegg') {
    return { original, resolved: original.toUpperCase(), status: 'external_id', method: 'input', query: original };
  }

  const alias = METABOLITE_ALIASES.get(original.toLowerCase());
  const query = alias || original;
  const cacheKey = lexicalKey(query);
  if (metaboliteResolutionCache.has(cacheKey)) {
    const cached = metaboliteResolutionCache.get(cacheKey);
    return { ...cached, original, query };
  }

  try {
    const url = new URL(CHEBI_SEARCH_URL);
    url.searchParams.set('term', query);
    url.searchParams.set('page', '1');
    url.searchParams.set('size', '8');
    const response = await fetchFn(url.toString(), { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    const results = Array.isArray(json?.results) ? json.results : [];
    const queryKey = lexicalKey(query);
    const exact = results
      .map(candidateChebiSource)
      .filter(Boolean)
      .find((source) => {
        const names = [source.name, source.ascii_name].filter(Boolean).map(lexicalKey);
        return names.includes(queryKey);
      });

    if (!exact?.chebi_accession) {
      const unresolved = {
        resolved: null,
        status: 'unresolved',
        method: alias ? 'chebi_exact_after_alias' : 'chebi_exact',
        query,
        label: null
      };
      metaboliteResolutionCache.set(cacheKey, unresolved);
      return { original, ...unresolved };
    }

    const resolved = {
      resolved: String(exact.chebi_accession).toUpperCase(),
      status: 'resolved',
      method: alias ? 'chebi_exact_after_alias' : 'chebi_exact',
      query,
      label: exact.ascii_name || exact.name || query,
      stars: exact.stars ?? null
    };
    metaboliteResolutionCache.set(cacheKey, resolved);
    return { original, ...resolved };
  } catch (error) {
    return {
      original,
      resolved: null,
      status: 'api_error',
      method: alias ? 'chebi_exact_after_alias' : 'chebi_exact',
      query,
      error: error instanceof Error ? error.message : 'ChEBI request failed'
    };
  }
}

export async function resolveMetaboliteIdentifiers(identifiers, { fetchFn = fetch, maxQueries = 30 } = {}) {
  const unique = [...new Set(identifiers.map(normaliseText).filter(Boolean))];
  const results = [];
  let networkQueries = 0;
  for (const identifier of unique) {
    const direct = directIdentifierType(identifier);
    const cached = metaboliteResolutionCache.has(lexicalKey(METABOLITE_ALIASES.get(identifier.toLowerCase()) || identifier));
    if (!direct && !cached && networkQueries >= maxQueries) {
      results.push({ original: identifier, resolved: null, status: 'query_limit', method: 'none', query: identifier });
      continue;
    }
    if (!direct && !cached) networkQueries += 1;
    results.push(await resolveMetaboliteIdentifier(identifier, { fetchFn }));
  }
  return {
    mappings: results,
    resolvedCount: results.filter((x) => x.resolved).length,
    unresolvedCount: results.filter((x) => !x.resolved).length,
    networkQueries
  };
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

function variance(values) {
  const x = values.filter(Number.isFinite);
  if (x.length < 2) return NaN;
  const m = mean(x);
  return x.reduce((sum, value) => sum + (value-m)*(value-m), 0) / (x.length-1);
}

function numericTime(value) {
  const match = String(value ?? '').match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : NaN;
}

function linearSlope(points) {
  const valid = points.filter((point) => Number.isFinite(point.time) && Number.isFinite(point.value));
  if (valid.length < 2) return NaN;
  const mt = mean(valid.map((point) => point.time));
  const my = mean(valid.map((point) => point.value));
  let numerator = 0;
  let denominator = 0;
  for (const point of valid) {
    numerator += (point.time-mt)*(point.value-my);
    denominator += (point.time-mt)*(point.time-mt);
  }
  return denominator > 0 ? numerator/denominator : NaN;
}

function median(values) {
  const x = values.filter(Number.isFinite).slice().sort((a,b) => a-b);
  if (!x.length) return NaN;
  const m = Math.floor(x.length / 2);
  return x.length % 2 ? x[m] : (x[m-1] + x[m]) / 2;
}

function ranks(values) {
  const indexed = values.map((value, index) => ({ value, index })).sort((a,b) => a.value-b.value);
  const out = new Array(values.length);
  let i = 0;
  while (i < indexed.length) {
    let j = i + 1;
    while (j < indexed.length && indexed[j].value === indexed[i].value) j += 1;
    const rank = (i + 1 + j) / 2;
    for (let k = i; k < j; k += 1) out[indexed[k].index] = rank;
    i = j;
  }
  return out;
}

function pearson(x, y) {
  if (x.length !== y.length || x.length < 3) return NaN;
  const mx = mean(x);
  const my = mean(y);
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < x.length; i += 1) {
    const a = x[i] - mx;
    const b = y[i] - my;
    num += a*b;
    dx += a*a;
    dy += b*b;
  }
  return dx > 0 && dy > 0 ? num / Math.sqrt(dx*dy) : NaN;
}

function spearman(x, y) {
  if (x.length !== y.length || x.length < 3) return NaN;
  return pearson(ranks(x), ranks(y));
}

function normalCdf(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804014327 * Math.exp(-x*x/2);
  const p = 1 - d*t*(0.319381530 + t*(-0.356563782 + t*(1.781477937 + t*(-1.821255978 + t*1.330274429))));
  return x >= 0 ? p : 1-p;
}

export function differentialCorrelationPair(referenceX, referenceY, comparisonX, comparisonY, method = 'spearman') {
  const corr = method === 'pearson' ? pearson : spearman;
  const rReference = corr(referenceX, referenceY);
  const rComparison = corr(comparisonX, comparisonY);
  if (!Number.isFinite(rReference) || !Number.isFinite(rComparison)) {
    return { rReference, rComparison, deltaR: NaN, z: NaN, pValue: null, method };
  }
  const clamp = (r) => Math.max(-0.999999, Math.min(0.999999, r));
  const zReference = Math.atanh(clamp(rReference));
  const zComparison = Math.atanh(clamp(rComparison));
  const se = referenceX.length > 3 && comparisonX.length > 3
    ? Math.sqrt(1/(referenceX.length-3) + 1/(comparisonX.length-3))
    : NaN;
  const z = Number.isFinite(se) && se > 0 ? (zComparison-zReference)/se : NaN;
  const pValue = Number.isFinite(z) ? Math.min(1, 2*(1-normalCdf(Math.abs(z)))) : null;
  return {
    rReference,
    rComparison,
    deltaR: rComparison-rReference,
    z,
    pValue,
    method
  };
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

function pairedPermutationPValue(differences, seedKey) {
  const d = differences.filter(Number.isFinite);
  if (d.length < 2) return null;
  const observed = Math.abs(mean(d));
  if (d.length <= 12) {
    const total = 2 ** d.length;
    let extreme = 0;
    for (let mask = 0; mask < total; mask += 1) {
      const signed = d.map((value, i) => (mask & (1 << i)) ? value : -value);
      if (Math.abs(mean(signed)) >= observed - 1e-12) extreme += 1;
    }
    return extreme / total;
  }
  const rng = rngFromSeed(hashString(seedKey));
  const total = 4096;
  let extreme = 0;
  for (let iter = 0; iter < total; iter += 1) {
    const signed = d.map((value) => rng() < 0.5 ? value : -value);
    if (Math.abs(mean(signed)) >= observed - 1e-12) extreme += 1;
  }
  return (extreme + 1)/(total + 1);
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
  const asSupplied = ['normalized','unknown'].includes(valueType) || (hasNegative && !isCounts && !isSpectral && !explicitlyLog);
  const logPositive = ['tpm','lfq_intensity','peak_area','concentration'].includes(valueType);
  const medianCenter = (layer === 'proteomics' && valueType === 'lfq_intensity') || (layer === 'metabolomics' && valueType === 'peak_area');
  let scale = 'as_supplied';

  const totals = new Map();
  if (isCounts || isSpectral) {
    scale = 'log2';
    for (const assay of assays) {
      let total = 0;
      for (const values of matrix.values.values()) {
        const v = values.get(assay);
        if (Number.isFinite(v) && v > 0) total += v;
      }
      totals.set(assay, total || 1);
    }
    steps.push(isCounts ? 'library-size normalisation to CPM + log2(CPM + 0.5)' : 'library-size normalisation + log2 transform');
  } else if (explicitlyLog) {
    scale = 'log2';
    steps.push('values treated as already log-transformed');
  } else if (asSupplied) {
    scale = hasNegative ? 'transformed_unknown' : 'as_supplied';
    steps.push(hasNegative
      ? 'negative values detected: values kept as supplied; effect is a difference on the supplied scale'
      : 'normalised/unknown values kept as supplied; effect is a difference on the supplied scale');
  } else if (logPositive) {
    scale = 'log2';
    steps.push(`log2(value + ${pseudo.toPrecision(3)})`);
  } else {
    scale = 'as_supplied';
    steps.push('values kept as supplied');
  }

  for (const [feature, values] of matrix.values.entries()) {
    const next = new Map();
    for (const assay of assays) {
      const raw = values.get(assay);
      if (!Number.isFinite(raw)) { next.set(assay, null); continue; }
      if (isCounts || isSpectral) {
        const cpm = raw / totals.get(assay) * 1e6;
        next.set(assay, Math.log2(cpm + 0.5));
      } else if (explicitlyLog || asSupplied || !logPositive) next.set(assay, raw);
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

  return { ...matrix, values: processed, steps, scale };
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
  return { features: matrix.features, values, sampleMeta, replicateGroups, steps: matrix.steps, scale: matrix.scale };
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

  if (options.paired && !options.longitudinal) {
    const differences = [];
    for (const entries of perSubject.values()) {
      const a = entries.filter((x) => x.row.condition === conditions[0]).map((x) => x.value);
      const b = entries.filter((x) => x.row.condition === conditions[1]).map((x) => x.value);
      if (!a.length || !b.length) continue;
      differences.push(mean(b)-mean(a));
    }
    return {
      groups: [differences.map(() => 0), differences],
      differences,
      conditions,
      timepoints,
      contrast: `paired ${conditions[1]} − ${conditions[0]}`,
      mode: 'paired-permutation'
    };
  }

  if (options.longitudinal && timepoints.length >= 2) {
    const first = timepoints[0];
    const last = timepoints[timepoints.length - 1];
    const groups = [[],[]];

    if (timepoints.length > 2) {
      for (const entries of perSubject.values()) {
        const byTime = new Map();
        for (const entry of entries) {
          const time = numericTime(entry.row.timepoint);
          if (!Number.isFinite(time)) continue;
          if (!byTime.has(time)) byTime.set(time, []);
          byTime.get(time).push(entry.value);
        }
        const points = [...byTime.entries()].map(([time, values]) => ({ time, value: mean(values) }));
        const slope = linearSlope(points);
        if (!Number.isFinite(slope)) continue;
        const condition = entries[0].row.condition;
        const index = conditions.indexOf(condition);
        if (index >= 0) groups[index].push(slope);
      }
      return {
        groups,
        conditions,
        timepoints,
        contrast: `individual time slope: ${conditions[1]} vs ${conditions[0]}`,
        mode: 'longitudinal-slope'
      };
    }

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
    const effect = data.mode === 'paired-permutation' ? mean(data.differences) : mean(b) - mean(a);
    const pValue = data.mode === 'paired-permutation'
      ? pairedPermutationPValue(data.differences, `${layer}|${feature}|${contrast}`)
      : permutationPValue(a,b, `${layer}|${feature}|${contrast}`);
    rows.push({
      feature,
      effect,
      foldRatio: aggregated.scale === 'log2' ? Math.pow(2,effect) : null,
      effectScale: aggregated.scale,
      pValue,
      qValue: null,
      nReference: a.length,
      nComparison: b.length
    });
  }
  bhAdjust(rows);
  rows.sort((a,b) => Math.abs(b.effect) - Math.abs(a.effect));
  const significant = rows.filter((row) =>
    Number.isFinite(row.qValue) &&
    row.qValue <= 0.10 &&
    (aggregated.scale !== 'log2' || Math.abs(row.effect) >= Math.log2(1.2))
  );
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
      ? (aggregated.scale === 'log2'
          ? 'q ≤ 0.10 and |fold change| ≥ 1.2, capped at 50 features'
          : 'q ≤ 0.10 on the supplied scale, capped at 50 features')
      : `only ${significant.length} FDR-qualified feature(s); top ${selected.length} ranked features used for exploratory pathway mapping`,
    effectScale: aggregated.scale,
    contrast,
    mode,
    groupSizes,
    steps: aggregated.steps
  };
}

function subjectFeatureSummary(aggregated, feature, options) {
  const source = aggregated.values.get(feature);
  if (!source) return [];
  const perSubject = new Map();
  for (const [sampleId, row] of aggregated.sampleMeta.entries()) {
    const value = source.get(sampleId);
    if (!Number.isFinite(value)) continue;
    if (!perSubject.has(row.subjectId)) perSubject.set(row.subjectId, []);
    perSubject.get(row.subjectId).push({ value, row });
  }

  const timepoints = naturalOrder([...aggregated.sampleMeta.values()].map((row) => row.timepoint));
  const first = timepoints[0] || '';
  const last = timepoints[timepoints.length-1] || '';
  const out = [];
  for (const [subjectId, entries] of perSubject.entries()) {
    if (options.longitudinal && timepoints.length >= 2) {
      if (timepoints.length > 2) {
        const byTime = new Map();
        for (const entry of entries) {
          const time = numericTime(entry.row.timepoint);
          if (!Number.isFinite(time)) continue;
          if (!byTime.has(time)) byTime.set(time, []);
          byTime.get(time).push(entry.value);
        }
        const slope = linearSlope([...byTime.entries()].map(([time, values]) => ({ time, value: mean(values) })));
        if (!Number.isFinite(slope)) continue;
        out.push({ subjectId, condition: entries[0].row.condition, value: slope });
      } else {
        const baseline = entries.filter((x) => x.row.timepoint === first).map((x) => x.value);
        const endpoint = entries.filter((x) => x.row.timepoint === last).map((x) => x.value);
        if (!baseline.length || !endpoint.length) continue;
        const endpointRow = entries.find((x) => x.row.timepoint === last)?.row || entries[0].row;
        out.push({ subjectId, condition: endpointRow.condition, value: mean(endpoint)-mean(baseline) });
      }
    } else {
      const eligible = last ? entries.filter((x) => x.row.timepoint === last) : entries;
      if (!eligible.length) continue;
      out.push({ subjectId, condition: eligible[0].row.condition, value: mean(eligible.map((x) => x.value)) });
    }
  }
  return out;
}

function topVariableFeatures(aggregated, n = 20) {
  return aggregated.features
    .map((feature) => ({
      feature,
      variance: variance([...aggregated.values.get(feature).values()])
    }))
    .filter((x) => Number.isFinite(x.variance) && x.variance > 0)
    .sort((a,b) => b.variance-a.variance)
    .slice(0,n)
    .map((x) => x.feature);
}

function integrationCandidates(aggregated, layerResult, max = 30) {
  const ordered = [
    ...(layerResult?.selected || []).map((x) => x.feature),
    ...topVariableFeatures(aggregated, 20)
  ];
  return [...new Set(ordered)].slice(0,max);
}

function analyseCrossOmics(aggregatedByLayer, layers, loadedLayers, options) {
  const pairs = [];
  const layerPairs = [];
  for (let i = 0; i < loadedLayers.length; i += 1) {
    for (let j = i+1; j < loadedLayers.length; j += 1) layerPairs.push([loadedLayers[i], loadedLayers[j]]);
  }

  for (const [layerA, layerB] of layerPairs) {
    const featuresA = integrationCandidates(aggregatedByLayer[layerA], layers[layerA], 30);
    const featuresB = integrationCandidates(aggregatedByLayer[layerB], layers[layerB], 30);
    const conditions = naturalOrder([
      ...aggregatedByLayer[layerA].sampleMeta.values(),
      ...aggregatedByLayer[layerB].sampleMeta.values()
    ].map((row) => row.condition));
    if (conditions.length !== 2) continue;

    for (const featureA of featuresA) {
      const a = subjectFeatureSummary(aggregatedByLayer[layerA], featureA, options);
      const aMap = new Map(a.map((x) => [x.subjectId, x]));
      for (const featureB of featuresB) {
        const b = subjectFeatureSummary(aggregatedByLayer[layerB], featureB, options);
        const matched = b.filter((x) => aMap.has(x.subjectId)).map((x) => ({
          subjectId: x.subjectId,
          condition: x.condition,
          x: aMap.get(x.subjectId).value,
          y: x.value
        }));
        const ref = matched.filter((x) => x.condition === conditions[0]);
        const cmp = matched.filter((x) => x.condition === conditions[1]);
        if (ref.length < 4 || cmp.length < 4) continue;
        const stat = differentialCorrelationPair(
          ref.map((x) => x.x), ref.map((x) => x.y),
          cmp.map((x) => x.x), cmp.map((x) => x.y),
          'spearman'
        );
        pairs.push({
          layerA, featureA, layerB, featureB,
          reference: conditions[0],
          comparison: conditions[1],
          nReference: ref.length,
          nComparison: cmp.length,
          ...stat,
          qValue: null
        });
      }
    }
  }

  bhAdjust(pairs);
  pairs.sort((a,b) => {
    const aq = Number.isFinite(a.qValue) ? a.qValue : 1;
    const bq = Number.isFinite(b.qValue) ? b.qValue : 1;
    if (aq !== bq) return aq-bq;
    return Math.abs(b.deltaR)-Math.abs(a.deltaR);
  });
  return {
    method: 'Candidate pool = differential features ∪ top-variable features; Spearman correlation by condition; Fisher z test for independent-group correlation difference; BH-FDR across tested cross-omic pairs',
    testedPairs: pairs.length,
    significantPairs: pairs.filter((x) => Number.isFinite(x.qValue) && x.qValue <= 0.10).length,
    pairs: pairs.slice(0,100)
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

function layerOverlapSummary(metadata, loadedLayers) {
  const subjectSets = Object.fromEntries(loadedLayers.map((layer) => [
    layer,
    new Set(metadata.filter((row) => row.omic === layer).map((row) => row.subjectId))
  ]));
  const layerSubjects = Object.fromEntries(loadedLayers.map((layer) => [layer, subjectSets[layer].size]));
  const pairwise = [];
  for (let i = 0; i < loadedLayers.length; i += 1) {
    for (let j = i+1; j < loadedLayers.length; j += 1) {
      const a = loadedLayers[i];
      const b = loadedLayers[j];
      const overlap = [...subjectSets[a]].filter((id) => subjectSets[b].has(id)).length;
      pairwise.push({ layerA: a, layerB: b, matchedSubjects: overlap, layerASubjects: subjectSets[a].size, layerBSubjects: subjectSets[b].size });
    }
  }
  const allMatched = loadedLayers.length
    ? [...subjectSets[loadedLayers[0]]].filter((id) => loadedLayers.every((layer) => subjectSets[layer].has(id))).length
    : 0;
  return { layerSubjects, pairwise, allMatched };
}

export async function runDeterministicAnalysis({ files, metadataRows, columnMapping, protocol, dataTypes, identifierTypes = {}, useReactome = true, resolveIdentifiers = true }) {
  const metadata = canonicalMetadata(metadataRows, columnMapping);
  if (!metadata.length) throw new Error('No valid metadata rows after mapping.');
  const loadedLayers = LAYERS.filter((layer) => files[layer]);
  if (loadedLayers.length < 2) throw new Error('At least two omics layers are required.');
  if (protocol.objective === 'outcome') {
    throw new Error('Outcome-targeted modelling is not implemented in the current deterministic engine. No surrogate group analysis was run.');
  }
  if (protocol.designType === 'crossover') {
    throw new Error('Crossover designs require period/sequence-aware inference and are not yet implemented. No simplified paired analysis was run.');
  }
  const conditions = naturalOrder(metadata.map((row) => row.condition));
  if (conditions.length !== 2) {
    throw new Error(`Current inferential engine requires exactly two biological conditions; found ${conditions.length}. No simplified analysis was run.`);
  }
  const timepoints = naturalOrder(metadata.map((row) => row.timepoint));
  if (protocol.longitudinal && timepoints.length > 2) {
    const numericTimes = timepoints.map((value) => Number(String(value).match(/-?\d+(?:\.\d+)?/)?.[0]));
    if (numericTimes.some((value) => !Number.isFinite(value))) {
      throw new Error('Longitudinal studies with >2 time points require numeric or numeric-labelled time points (for example 0, 6, 12 or T0, T6, T12).');
    }
  }

  const overlap = layerOverlapSummary(metadata, loadedLayers);
  const layers = {};
  const aggregatedByLayer = {};
  for (const layer of loadedLayers) {
    const expected = metadata.filter((row) => row.omic === layer).map((row) => row.assayId);
    const text = await files[layer].text();
    const matrix = matrixFromText(text, expected);
    const processed = preprocessMatrix(matrix, layer, dataTypes[layer]);
    const aggregated = aggregateTechnicalReplicates(processed, metadata, layer);
    aggregatedByLayer[layer] = aggregated;
    layers[layer] = analyseLayer(aggregated, layer, { longitudinal: protocol.longitudinal, paired: protocol.designType === 'paired' });
    layers[layer].replicateGroups = aggregated.replicateGroups;
    layers[layer].matrixShape = { features: matrix.features.length, assays: matrix.assays.length, transposed: matrix.transposed };
  }

  const crossOmics = protocol.designType === 'paired' && !protocol.longitudinal
    ? { method: 'Direct cross-omics correlation comparison is not run for paired designs in the current engine.', testedPairs: 0, significantPairs: 0, pairs: [] }
    : analyseCrossOmics(aggregatedByLayer, layers, loadedLayers, { longitudinal: protocol.longitudinal });
  const selectedIds = Object.fromEntries(loadedLayers.map((layer) => [layer, layers[layer].selected.map((row) => row.feature)]));
  let identifierResolution = null;
  if (resolveIdentifiers && selectedIds.metabolomics?.length) {
    identifierResolution = {
      metabolomics: await resolveMetaboliteIdentifiers(selectedIds.metabolomics)
    };
  }

  const reactomeIds = { ...selectedIds };
  if (identifierResolution?.metabolomics) {
    const map = new Map(identifierResolution.metabolomics.mappings.map((x) => [x.original, x.resolved || x.original]));
    reactomeIds.metabolomics = selectedIds.metabolomics.map((id) => map.get(id) || id);
  }
  const combinedIds = loadedLayers.flatMap((layer) => reactomeIds[layer] || []);

  let reactome = null;
  let reactomeError = null;
  if (useReactome && combinedIds.length) {
    try {
      const projectToHuman = true;
      const entries = await Promise.all([
        reactomeOverRepresentation(combinedIds, {projectToHuman}),
        ...loadedLayers.map((layer) => reactomeOverRepresentation(reactomeIds[layer], {projectToHuman}))
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
      conditions,
      timepoints,
      overlap
    },
    layers,
    crossOmics,
    selectedIds,
    reactomeIds,
    identifierResolution,
    reactome,
    reactomeError
  };
}

export function resultToCsv(rows) {
  const header = ['feature','effect','effect_scale','fold_ratio_if_log2','p_value','q_value','n_reference','n_comparison'];
  const lines = rows.map((row) => [
    row.feature,
    row.effect,
    row.effectScale ?? '',
    row.foldRatio ?? '',
    row.pValue ?? '',
    row.qValue ?? '',
    row.nReference,
    row.nComparison
  ].join(','));
  return [header.join(','), ...lines].join('\n');
}
