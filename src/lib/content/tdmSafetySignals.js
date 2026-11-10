// HD-methotrexate monitoring safety thresholds are NOT therapeutic target ranges.
// Provenance: European multidisciplinary consensus (2024), Table 1, §5.2.
// Time is counted from START of MTX infusion, not end. Conditional clinical
// context, renal function and protocol must be assessed by qualified clinicians.
// No prediction, dosing, treatment recommendation or automated alert is emitted.
export const nonStandardTdmDrugs = [
  { id: 'methotrexate', fr: 'Méthotrexate (haute dose)', en: 'High-dose methotrexate',
    aliases: ['methotrexate', 'méthotrexate', 'MTX', 'HDMTX', 'HD-MTX', 'méthotrexatémie'] }
];
export const tdmSafetyReferences = {
  europeanHdMtx2024: {
    citation: 'Consensus européen HD-MTX · 2024',
    title: 'A European consensus recommendation on management of delayed methotrexate elimination (2024)',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11446969/',
    evidenceSection: 'Table 1, statements 1.5 and 5.1–5.4, and Use of glucarpidase section',
    year: 2024, role: 'conditional_safety_threshold',
    verifiedOn: '2026-11-10'
  }
};
export const tdmSafetySignals = [
  { id: 'hdmtx-24h-50', drug: 'methotrexate', source: 'europeanHdMtx2024',
    timeHoursAfterInfusionStart: 24, relation: 'above', value: 50, unit: 'µmol/L',
    kind: 'glucarpidase_consideration',
    labelFr: 'H24 après début de perfusion', labelEn: '24 h from start of infusion' },
  { id: 'hdmtx-36h-30', drug: 'methotrexate', source: 'europeanHdMtx2024',
    timeHoursAfterInfusionStart: 36, relation: 'above', value: 30, unit: 'µmol/L',
    kind: 'glucarpidase_consideration',
    labelFr: 'H36 après début de perfusion', labelEn: '36 h from start of infusion' },
  { id: 'hdmtx-42h-10', drug: 'methotrexate', source: 'europeanHdMtx2024',
    timeHoursAfterInfusionStart: 42, relation: 'above', value: 10, unit: 'µmol/L',
    kind: 'glucarpidase_consideration',
    labelFr: 'H42 après début de perfusion', labelEn: '42 h from start of infusion' },
  { id: 'hdmtx-48h-5', drug: 'methotrexate', source: 'europeanHdMtx2024',
    timeHoursAfterInfusionStart: 48, relation: 'above', value: 5, unit: 'µmol/L',
    kind: 'glucarpidase_consideration',
    labelFr: 'H48 après début de perfusion', labelEn: '48 h from start of infusion' }
];
export function tdmSafetySignalsForDrug(drugId) {
  return tdmSafetySignals.filter((signal) => signal.drug === drugId);
}
