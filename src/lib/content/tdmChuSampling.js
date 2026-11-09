// Only verified CHU Limoges sampling-TIME documents are exposed to users.
// Examination request forms, assay catalogue details, and outsourced-analysis
// pages are intentionally NOT treated as sampling-time instructions.
//
// 26 May 2026, PTP PREA 0059 C: "Liste des antibiotiques dosés ... et
// temps de prélèvements correspondants", two-page official CHU document.
// One document is intentionally shared by all 36 listed antibiotics.
// Gray rows (amikacin, gentamicin, tobramycin, vancomycin) are stated in
// the source to be immunochemical assays with sampling guidance maintained.
export const chuSamplingDocuments = Object.freeze({
  ptpAntibiotics2026: Object.freeze({
    titleFr: 'CHU Limoges · Temps de prélèvement des antibiotiques',
    titleEn: 'Limoges University Hospital · Antibiotic sampling times',
    url: 'https://chu-limoges.manuelprelevement.fr/DocumentNew.aspx?idDoc=41157',
    code: 'PTP PREA 0059 C',
    verifiedDate: '2026-11-09',
    documentDate: '2026-05-26',
    pageCount: 2,
    kind: 'sampling_times'
  })
});

// Every drug below appears explicitly in the two-page sampling-times PDF.
// This collection does NOT establish a therapeutic target.
export const antibioticsWithChuSamplingDocument = Object.freeze([
  'amikacin', 'amoxicillin', 'avibactam', 'azithromycin', 'aztreonam',
  'cefazolin', 'cefepime', 'cefotaxime', 'ceftaroline', 'ceftazidime',
  'ceftobiprole', 'ceftolozane', 'ceftriaxone', 'ciprofloxacin',
  'clindamycin', 'cloxacillin', 'dalbavancin', 'daptomycin', 'ertapenem',
  'gentamicin', 'isoniazid', 'linezolid', 'levofloxacin', 'meropenem',
  'moxifloxacin', 'ofloxacin', 'oxacillin', 'piperacillin', 'rifampicin',
  'sulfamethoxazole', 'tazobactam', 'ticarcillin', 'tigecycline',
  'tobramycin', 'trimethoprim', 'vancomycin'
]);

const qualifiedAntibioticIds = new Set(antibioticsWithChuSamplingDocument);

/** Return only official CHU documents describing sampling TIME for this drug.
 *  A missing result means "document not independently verified", NOT "no sampling".
 */
export function chuSamplingForDrug(drugId) {
  return qualifiedAntibioticIds.has(drugId)
    ? chuSamplingDocuments.ptpAntibiotics2026
    : null;
}
