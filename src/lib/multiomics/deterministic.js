// @ts-nocheck
// Public multi-omics entry point.
// The validated deterministic implementation lives in deterministic-impl.js.
// This thin browser-aware wrapper adds declared UI methodology context,
// external database provenance and publishes the final result synchronously
// before it is returned to Svelte.

import * as impl from './deterministic-impl.js';
export * from './deterministic-impl.js';

const REACTOME_VERSION_URL = 'https://reactome.org/ContentService/data/database/version';

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
      status: release ? 'recorded' : 'unavailable',
      release: release || null,
      endpoint: REACTOME_VERSION_URL,
      capturedAt
    };
  } catch (error) {
    reactome = {
      status: 'unavailable',
      release: null,
      endpoint: REACTOME_VERSION_URL,
      capturedAt,
      error: error instanceof Error ? error.message : 'Reactome version request failed'
    };
  }
  result.externalDatabaseProvenance = {
    ...(result.externalDatabaseProvenance || {}),
    reactome,
    note: 'External database content can change independently of PMx Explain. Preserve database release identifiers alongside the analysis result whenever the service exposes them.'
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
