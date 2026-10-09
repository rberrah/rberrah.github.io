// Scientific review provenance for interpretive visualizations.
// Every unlisted component remains explicitly pending in the generated registry.
/** @type {Record<string, { status: string, reviewed_on: string, review_type: string }>} */
export const visualizationReviews = {
  '07_NeuralODE': { status: 'reviewed', reviewed_on: '2026-10-09', review_type: 'author' },
  '17_VPCCrashTest': { status: 'reviewed', reviewed_on: '2026-10-09', review_type: 'author' },
  '42_VarImportance': { status: 'reviewed', reviewed_on: '2026-10-09', review_type: 'author' },
  '50_GOFPlots': { status: 'reviewed', reviewed_on: '2026-10-09', review_type: 'author' },
  '52_NPDE': { status: 'reviewed', reviewed_on: '2026-10-09', review_type: 'author' },
  '63_ClusterPCA': { status: 'reviewed', reviewed_on: '2026-10-09', review_type: 'author' },
  '64_RMT': { status: 'reviewed', reviewed_on: '2026-10-09', review_type: 'author' },
  CovariateEffects: { status: 'reviewed', reviewed_on: '2026-10-09', review_type: 'author' }
};

/** @param {string} stem */
export function visualizationReview(stem) {
  return visualizationReviews[stem] ?? { status: 'pending', reviewed_on: '', review_type: '' };
}
