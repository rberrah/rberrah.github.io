// Analytic identity requirements for TDM literature references.
// Source prose and placeholder strings never establish equivalence.
// Reused by the public presentation and independent semantic-readiness audit.
export const TDM_COMPARABILITY_FIELDS = Object.freeze([
  'analyteId', 'analyteBasis', 'matrixId', 'formulationId',
  'assayMethod', 'samplingTime'
]);
const invalid = new Set([
  'unknown', 'unassessed', 'not_assessed', 'not assessed',
  'unspecified', 'not specified', 'not_documented', 'pending',
  'n/a', 'na', 'none', 'null', 'undetermined', 'to_review',
  'non renseigné', 'inconnu', 'à vérifier', 'a verifier'
]);

export function isMeaningfulTdmIdentityValue(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return !invalid.has(trimmed.toLowerCase());
}
export function hasCompleteTdmIdentity(entry) {
  return TDM_COMPARABILITY_FIELDS.every((field) =>
    isMeaningfulTdmIdentityValue(entry?.[field]));
}
