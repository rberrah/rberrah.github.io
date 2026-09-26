// @ts-nocheck
// Public wrapper around the stable v1.3 deterministic engine.
// The core is kept byte-for-byte in deterministic-core.js; this layer only
// strengthens chemical identifier resolution before delegating to it.

import * as core from './deterministic-core.js';
export * from './deterministic-core.js';

const WRAPPER_ENGINE_VERSION = '1.4.0';
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
        // Deliberately expose no candidate to the legacy resolver: the wrapper
        // restores the explicit ambiguous status afterwards and never chooses
        // the first mapping silently.
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

// runDeterministicAnalysis in the stable core calls its internal resolver.
// A narrow fetch proxy lets that code keep all existing QC/statistical logic
// while replacing only external chemical-ID lookups. Calls are serialized so
// two analyses cannot compete for the temporary global fetch proxy.
let analysisQueue = Promise.resolve();

async function runWithStrictChemicalResolution(args) {
  const originalFetch = globalThis.fetch;
  if (typeof originalFetch !== 'function') return core.runDeterministicAnalysis(args);

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
    if (result?.engine) {
      result.engine = {
        ...result.engine,
        version: WRAPPER_ENGINE_VERSION,
        chemicalIdentifierResolution: 'strict UniChem external-ID mapping to ChEBI; ambiguous mappings are never forced'
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
