// @ts-nocheck
// Public multi-omics entry point.
// The validated deterministic implementation lives in deterministic-impl.js.
// This thin browser-aware wrapper adds declared UI methodology context and
// publishes the final result synchronously before it is returned to Svelte.

import * as impl from './deterministic-impl.js';
export * from './deterministic-impl.js';

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
  publishFinalAnalysis(result);
  return result;
}
