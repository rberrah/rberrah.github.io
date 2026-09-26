// @ts-nocheck
// Public wrapper around the stable v1.3 deterministic engine.
// The core is kept byte-for-byte in deterministic-core.js; this layer adds
// strict chemical identifier resolution and transparent study-feasibility diagnostics.

import * as core from './deterministic-core.js';
export * from './deterministic-core.js';

const WRAPPER_ENGINE_VERSION = '1.5.0';
const CHEBI_SEARCH_HOST = 'www.ebi.ac.uk';
const CHEBI_SEARCH_PATH = '/chebi/backend/api/public/es_search/';
const UNICHEM_BASE = 'https://www.ebi.ac.uk/unichem/rest/src_compound_id/';

// UniChem source identifiers from the public UniChem source registry.
// KEGG Ligand = 6, ChEBI = 7, HMDB = 18, PubChem Compounds = 22.
const UNICHEM_SOURCE = Object.freeze({
  kegg: 6,
  kegg_compound: 6,
  chebi: 7,
  hmdb: 18,
  pubchem: 22
});

function cleanText(value) {
  return String(value ?? '').trim();
}

function traceKey(value) {
  return cleanText(value).toUpperCase();
}

function declaredSource(term, identifierType = 'unknown') {
  const value = cleanText(term);
  const type = cleanText(identifierType).toLowerCase();
  if (/^HMDB\d+$/i.test(value)) return { name: 'hmdb', srcId: UNICHEM_SOURCE.hmdb };
  if (/^C\d{5}$/i.test(value)) return { name: 'kegg', srcId: UNICHEM_SOURCE.kegg };
  if ((type === 'pubchem' || type === 'pubchem_cid') && /^\d+$/.test(value)) {
    return { name: 'pubchem', srcId: UNICHEM_SOURCE.pubchem };
  }
  return null;
}

function canonicalChebi(value) {
  const text = cleanText(value);
  if (/^CHEBI:\d+$/i.test(text)) return text.toUpperCase();
  if (/^\d+$/.test(text)) return 'CHEBI:' + text;
  return null;
}

function uniqueChebiIds(json) {
  const rows = Array.isArray(json) ? json : [];
  const values = rows.flatMap((row) => {
    if (typeof row === 'string' || typeof row === 'number') return [row];
    const value = row?.src_compound_id ?? row?.srcCompoundId ?? row?.compound_id ?? row?.id;
    return Array.isArray(value) ? value : [value];
  });
  return [...new Set(values.map(canonicalChebi).filter(Boolean))];
}

function syntheticChebiResponse(term, chebiIds) {
  const results = chebiIds.map((chebi) => ({
    _source: {
      chebi_accession: chebi,
      name: term,
      ascii_name: term,
      stars: null
    }
  }));
  return new Response(JSON.stringify({ results, total: results.length }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

function requestUrl(input) {
  try {
    if (typeof input === 'string' || input instanceof URL) return new URL(String(input));
    if (typeof Request !== 'undefined' && input instanceof Request) return new URL(input.url);
    if (input?.url) return new URL(String(input.url));
  } catch {
    return null;
  }
  return null;
}

function resolutionMethod(sourceName) {
  return `unichem_${sourceName}_to_chebi`;
}

function createStrictChemicalFetch(baseFetch, identifierType = 'unknown') {
  const trace = new Map();
  const safeFetch = typeof baseFetch === 'function'
    ? baseFetch
    : (...args) => globalThis.fetch(...args);

  const fetchFn = async (input, init) => {
    const url = requestUrl(input);
    if (!url || url.hostname !== CHEBI_SEARCH_HOST || url.pathname !== CHEBI_SEARCH_PATH) {
      return safeFetch(input, init);
    }

    const term = cleanText(url.searchParams.get('term'));
    const source = declaredSource(term, identifierType);
    if (!source) return safeFetch(input, init);

    const key = traceKey(term);
    const method = resolutionMethod(source.name);
    try {
      const mappingUrl = UNICHEM_BASE
        + encodeURIComponent(term)
        + '/' + source.srcId
        + '/' + UNICHEM_SOURCE.chebi;
      const response = await safeFetch(mappingUrl, { headers: { Accept: 'application/json' } });
      if (!response.ok) {
        trace.set(key, {
          status: response.status === 404 ? 'unresolved' : 'api_error',
          method,
          candidates: [],
          error: response.status === 404 ? null : `HTTP ${response.status}`
        });
        return syntheticChebiResponse(term, []);
      }

      const ids = uniqueChebiIds(await response.json());
      if (ids.length === 1) {
        trace.set(key, { status: 'resolved_external_id', method, candidates: ids, resolved: ids[0] });
        return syntheticChebiResponse(term, ids);
      }
      if (ids.length > 1) {
        trace.set(key, { status: 'ambiguous', method, candidates: ids, resolved: null });
        return syntheticChebiResponse(term, []);
      }
      trace.set(key, { status: 'unresolved', method, candidates: [], resolved: null });
      return syntheticChebiResponse(term, []);
    } catch (error) {
      trace.set(key, {
        status: 'api_error',
        method,
        candidates: [],
        resolved: null,
        error: error instanceof Error ? error.message : 'UniChem request failed'
      });
      // A failed cross-database lookup must not fall back to a fuzzy ChEBI
      // search that could convert an external identifier to the wrong entity.
      return syntheticChebiResponse(term, []);
    }
  };

  return { fetchFn, trace };
}

function applyChemicalTrace(resolution, trace) {
  if (!resolution?.mappings || !(trace instanceof Map) || trace.size === 0) return resolution;
  const mappings = resolution.mappings.map((mapping) => {
    const traced = trace.get(traceKey(mapping.original));
    if (!traced) return mapping;
    return {
      ...mapping,
      resolved: traced.resolved || null,
      status: traced.status,
      method: traced.method,
      candidates: traced.candidates || [],
      ...(traced.error ? { error: traced.error } : {})
    };
  });
  return {
    ...resolution,
    mappings,
    resolvedCount: mappings.filter((item) => item.resolved).length,
    unresolvedCount: mappings.filter((item) => !item.resolved).length,
    ambiguousCount: mappings.filter((item) => item.status === 'ambiguous').length
  };
}

function mappedValue(row, mapping, key) {
  const source = cleanText(mapping?.[key]);
  return source && Object.prototype.hasOwnProperty.call(row || {}, source)
    ? cleanText(row[source])
    : '';
}

function uniqueNonEmpty(values) {
  return [...new Set(values.map(cleanText).filter(Boolean))];
}

function levelFromRatio(ratio, good = 0.8, caution = 0.5) {
  if (!Number.isFinite(ratio)) return 'not_applicable';
  if (ratio >= good) return 'good';
  if (ratio >= caution) return 'caution';
  return 'warning';
}

function buildPreAnalysisDiagnostics(args, result) {
  const rows = Array.isArray(args?.metadataRows) ? args.metadataRows : [];
  const mapping = args?.columnMapping || {};
  const protocol = args?.protocol || {};
  const biologicalRows = rows.filter((row) => {
    const sampleType = mappedValue(row, mapping, 'sample_type').toLowerCase();
    return !['blank','qc','pooled_qc','quality_control','pooled'].includes(sampleType);
  });

  const canonicalRows = biologicalRows.map((row) => ({
    subject: mappedValue(row, mapping, 'subject_id'),
    sample: mappedValue(row, mapping, 'sample_id'),
    assay: mappedValue(row, mapping, 'assay_id'),
    omic: mappedValue(row, mapping, 'omic').toLowerCase(),
    condition: mappedValue(row, mapping, 'condition'),
    timepoint: mappedValue(row, mapping, 'timepoint'),
    batch: mappedValue(row, mapping, 'batch')
  })).filter((row) => row.subject || row.sample || row.assay);

  const conditions = uniqueNonEmpty(canonicalRows.map((row) => row.condition));
  const timepoints = uniqueNonEmpty(canonicalRows.map((row) => row.timepoint));
  const groupCounts = {};
  for (const condition of conditions) {
    groupCounts[condition] = new Set(
      canonicalRows.filter((row) => row.condition === condition).map((row) => row.subject).filter(Boolean)
    ).size;
  }
  const positiveGroupCounts = Object.values(groupCounts).filter((value) => value > 0);
  const minGroup = positiveGroupCounts.length ? Math.min(...positiveGroupCounts) : null;
  const maxGroup = positiveGroupCounts.length ? Math.max(...positiveGroupCounts) : null;
  const balanceRatio = minGroup != null && maxGroup ? minGroup / maxGroup : null;
  const groupBalanceStatus = conditions.length >= 2 ? levelFromRatio(balanceRatio) : 'not_applicable';

  const overlap = result?.metadataSummary?.overlap || {};
  const overlapRatio = overlap.totalSubjectsAnyLayer > 0
    ? overlap.allMatched / overlap.totalSubjectsAnyLayer
    : null;
  let overlapStatus = levelFromRatio(overlapRatio);
  if (protocol.partialOmicsExpected === 'yes' && overlapStatus === 'warning') overlapStatus = 'expected_partial';

  const perLayer = {};
  for (const [layer, layerResult] of Object.entries(result?.layers || {})) {
    const qc = layerResult?.qc || {};
    const medianMissing = Number.isFinite(qc.medianMissingFraction) ? qc.medianMissingFraction : null;
    const missingStatus = medianMissing == null
      ? 'not_available'
      : medianMissing <= 0.10 ? 'good' : medianMissing <= 0.30 ? 'caution' : 'warning';

    const layerRows = canonicalRows.filter((row) => row.omic === layer);
    const subjects = uniqueNonEmpty(layerRows.map((row) => row.subject));
    const observedTimes = uniqueNonEmpty(layerRows.map((row) => row.timepoint));
    let completeLongitudinalSubjects = null;
    let longitudinalCompleteness = null;
    if (timepoints.length > 1 && subjects.length) {
      completeLongitudinalSubjects = subjects.filter((subject) => {
        const subjectTimes = new Set(layerRows.filter((row) => row.subject === subject).map((row) => row.timepoint).filter(Boolean));
        return timepoints.every((time) => subjectTimes.has(time));
      }).length;
      longitudinalCompleteness = completeLongitudinalSubjects / subjects.length;
    }

    const batch = result?.metadataSummary?.batchAudit?.[layer] || null;
    perLayer[layer] = {
      subjects: subjects.length,
      observedTimepoints: observedTimes,
      medianMissingFraction: medianMissing,
      missingnessStatus: missingStatus,
      flaggedAssays: qc.outlierSamples?.length || 0,
      weakTechnicalReplicates: (qc.replicateCorrelations || []).filter((item) => item?.warning).length,
      completeLongitudinalSubjects,
      longitudinalCompleteness,
      batchStatus: batch?.status || 'not_available',
      batchCount: batch?.batchCount ?? batch?.batches?.length ?? 0,
      batchNote: batch?.note || ''
    };
  }

  const warnings = [];
  const notes = [];
  if (conditions.length >= 2 && balanceRatio != null && balanceRatio < 0.5) {
    warnings.push('One biological group contains less than half as many unique subjects as the largest group.');
  } else if (conditions.length >= 2 && balanceRatio != null && balanceRatio < 0.8) {
    notes.push('Group sizes are moderately unbalanced; adjusted models remain possible but precision may differ between groups.');
  }
  if (overlapRatio != null && overlapRatio < 0.5 && protocol.partialOmicsExpected !== 'yes') {
    warnings.push('Fewer than half of subjects are represented in every loaded omics layer.');
  } else if (overlapRatio != null && overlapRatio < 0.8 && protocol.partialOmicsExpected !== 'yes') {
    notes.push('Not all subjects are represented in every omics layer; paired cross-omics analyses use the actual overlap only.');
  }
  for (const [layer, diag] of Object.entries(perLayer)) {
    if (diag.missingnessStatus === 'warning') warnings.push(`${layer}: median missingness exceeds 30%.`);
    else if (diag.missingnessStatus === 'caution') notes.push(`${layer}: median missingness is between 10% and 30%.`);
    if (diag.longitudinalCompleteness != null && diag.longitudinalCompleteness < 0.8) {
      notes.push(`${layer}: ${Math.round(100 * diag.longitudinalCompleteness)}% of subjects have all declared time points.`);
    }
  }

  const batchProblems = Object.entries(result?.metadataSummary?.batchAudit || {})
    .filter(([, audit]) => ['confounded','incomplete'].includes(audit?.status));
  if (batchProblems.length) {
    warnings.push('Technical-series annotation is incomplete or confounded with the biological design in at least one omics layer.');
  }

  const smallestGroup = minGroup;
  const power = {
    status: 'not_calculated',
    smallestGroupSubjects: smallestGroup,
    note: 'Statistical power is not inferred from sample count alone. A defensible power calculation requires an expected effect size, variability and the intended model; simulation is recommended for complex multi-omics designs.'
  };
  if (smallestGroup != null && smallestGroup < 5) {
    notes.push('At least one group contains fewer than five unique subjects; treat inference as highly exploratory regardless of p-values.');
  }

  const overallStatus = warnings.length ? 'review_required' : notes.length ? 'usable_with_cautions' : 'ready';
  return {
    status: overallStatus,
    plainLanguageTitle: 'Study check before interpretation',
    groupBalance: {
      conditions,
      subjectsPerGroup: groupCounts,
      smallestGroup: minGroup,
      largestGroup: maxGroup,
      smallestToLargestRatio: balanceRatio,
      status: groupBalanceStatus
    },
    omicsOverlap: {
      subjectsInEveryLoadedLayer: overlap.allMatched ?? null,
      subjectsInAnyLoadedLayer: overlap.totalSubjectsAnyLayer ?? null,
      fractionInEveryLoadedLayer: overlapRatio,
      pairwise: overlap.pairwise || [],
      status: overlapStatus,
      partialOmicsExpected: protocol.partialOmicsExpected === 'yes'
    },
    repeatedMeasures: {
      declaredTimepoints: timepoints,
      longitudinal: Boolean(protocol.longitudinal),
      perLayer: Object.fromEntries(Object.entries(perLayer).map(([layer, diag]) => [layer, {
        completeSubjects: diag.completeLongitudinalSubjects,
        fractionComplete: diag.longitudinalCompleteness
      }]))
    },
    perLayer,
    power,
    warnings,
    notes,
    interpretation: {
      ready: 'No deterministic design/QC warning was detected. This does not prove adequate statistical power or external validity.',
      usable_with_cautions: 'The analysis can run, but the listed cautions should be considered when interpreting effect sizes, uncertainty and cross-omics integration.',
      review_required: 'At least one design/QC issue requires review before biological conclusions are emphasized.'
    }[overallStatus]
  };
}

export async function resolveMetaboliteIdentifier(
  identifier,
  { fetchFn = globalThis.fetch, identifierType = 'unknown' } = {}
) {
  const strict = createStrictChemicalFetch(fetchFn, identifierType);
  const result = await core.resolveMetaboliteIdentifier(identifier, { fetchFn: strict.fetchFn });
  const traced = strict.trace.get(traceKey(identifier));
  if (!traced) return result;
  return {
    ...result,
    resolved: traced.resolved || null,
    status: traced.status,
    method: traced.method,
    candidates: traced.candidates || [],
    ...(traced.error ? { error: traced.error } : {})
  };
}

export async function resolveMetaboliteIdentifiers(
  identifiers,
  { fetchFn = globalThis.fetch, maxQueries = 30, identifierType = 'unknown' } = {}
) {
  const strict = createStrictChemicalFetch(fetchFn, identifierType);
  const result = await core.resolveMetaboliteIdentifiers(identifiers, {
    fetchFn: strict.fetchFn,
    maxQueries
  });
  return applyChemicalTrace(result, strict.trace);
}

let analysisQueue = Promise.resolve();

async function runWithStrictChemicalResolution(args) {
  const originalFetch = globalThis.fetch;
  if (typeof originalFetch !== 'function') {
    const result = await core.runDeterministicAnalysis(args);
    const diagnostics = buildPreAnalysisDiagnostics(args, result);
    result.preAnalysisDiagnostics = diagnostics;
    result.metadataSummary = { ...result.metadataSummary, preAnalysisDiagnostics: diagnostics };
    return result;
  }

  const identifierType = args?.identifierTypes?.metabolomics || 'unknown';
  const strict = createStrictChemicalFetch(originalFetch.bind(globalThis), identifierType);
  globalThis.fetch = strict.fetchFn;
  try {
    const result = await core.runDeterministicAnalysis(args);
    if (result?.identifierResolution?.metabolomics) {
      result.identifierResolution.metabolomics = applyChemicalTrace(
        result.identifierResolution.metabolomics,
        strict.trace
      );
    }
    const diagnostics = buildPreAnalysisDiagnostics(args, result);
    result.preAnalysisDiagnostics = diagnostics;
    result.metadataSummary = { ...result.metadataSummary, preAnalysisDiagnostics: diagnostics };
    if (result?.engine) {
      result.engine = {
        ...result.engine,
        version: WRAPPER_ENGINE_VERSION,
        chemicalIdentifierResolution: 'strict UniChem external-ID mapping to ChEBI; ambiguous mappings are never forced',
        feasibilityDiagnostics: 'deterministic group-balance, cross-omics overlap, missingness, repeated-measure completeness and batch checks; power is not inferred from sample count alone'
      };
    }
    return result;
  } finally {
    globalThis.fetch = originalFetch;
  }
}

export function runDeterministicAnalysis(args) {
  const run = analysisQueue.then(
    () => runWithStrictChemicalResolution(args),
    () => runWithStrictChemicalResolution(args)
  );
  analysisQueue = run.catch(() => undefined);
  return run;
}
