// @ts-nocheck
// Public multi-omics entry point.
// The validated deterministic implementation lives in deterministic-impl.js.
// This thin browser-aware wrapper adds declared UI methodology context,
// external database provenance and publishes the final result synchronously
// before it is returned to Svelte.

import * as impl from './deterministic-impl.js';
export * from './deterministic-impl.js';

const REACTOME_VERSION_URL = 'https://reactome.org/ContentService/data/database/version';
const REACTOME_ANALYSIS_SERVICE = 'https://reactome.org/AnalysisService/';

function withBrowserMethodology(args) {
  if (typeof window === 'undefined') return args;
  const level = window.__PMX_METABOLOMICS_IDENTIFICATION_CONFIDENCE__;
  if (!level) return args;
  return {
    ...args,
    protocol: {
      ...(args?.protocol || {}),
      metabolomicsIdentificationConfidence: level
    }
  };
}

function reactomeAnalysisTokens(result) {
  const tokens = [];
  const visit = (value) => {
    if (!value || typeof value !== 'object') return;
    if (typeof value.token === 'string' && value.token.trim()) tokens.push(value.token.trim());
    for (const child of Object.values(value)) visit(child);
  };
  visit(result?.reactome);
  return [...new Set(tokens)];
}

async function attachExternalDatabaseProvenance(result) {
  if (typeof window === 'undefined' || !result?.reactome || typeof globalThis.fetch !== 'function') return result;
  const capturedAt = new Date().toISOString();
  let reactome;
  try {
    const response = await globalThis.fetch(REACTOME_VERSION_URL, {
      method: 'GET',
      headers: { Accept: 'text/plain' },
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const release = (await response.text()).trim();
    reactome = {
      database: 'Reactome',
      status: release ? 'recorded' : 'unavailable',
      release: release || null,
      versionEndpoint: REACTOME_VERSION_URL,
      analysisService: REACTOME_ANALYSIS_SERVICE,
      analysisTokens: reactomeAnalysisTokens(result),
      capturedAt
    };
  } catch (error) {
    reactome = {
      database: 'Reactome',
      status: 'unavailable',
      release: null,
      versionEndpoint: REACTOME_VERSION_URL,
      analysisService: REACTOME_ANALYSIS_SERVICE,
      analysisTokens: reactomeAnalysisTokens(result),
      capturedAt,
      error: error instanceof Error ? error.message : 'Reactome version request failed'
    };
  }

  result.externalDatabaseProvenance = {
    ...(result.externalDatabaseProvenance || {}),
    reactome,
    note: 'External database content can change independently of PMx Explain. Preserve database release identifiers alongside the analysis result whenever the service exposes them.'
  };

  // Keep the database release next to the pathway result as well as in the
  // generic reproducibility block. This ensures JSON/report exporters that
  // serialise either branch retain the exact external knowledge-base version.
  result.reactome.provenance = reactome;
  result.reproducibility = {
    ...(result.reproducibility || {}),
    externalDatabases: {
      ...(result.reproducibility?.externalDatabases || {}),
      reactome
    }
  };
  return result;
}

function publishFinalAnalysis(result) {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
  window.__PMX_MULTIOMICS_ANALYSIS__ = result;
  try {
    // CustomEvent dispatch is synchronous: methodology guards listening to this
    // event modify the same object that is then returned and exported.
    window.dispatchEvent(new CustomEvent('pmx-multiomics-analysis', { detail: result }));
  } catch {
    // Exported results remain valid even on a legacy browser without CustomEvent.
  }
}

export async function runDeterministicAnalysis(args) {
  const result = await impl.runDeterministicAnalysis(withBrowserMethodology(args));
  await attachExternalDatabaseProvenance(result);
  publishFinalAnalysis(result);
  return result;
}
