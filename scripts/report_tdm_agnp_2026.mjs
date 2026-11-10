// Reproducible bibliographic reconciliation queue for historical neuro-TDM.
import { agnp2026Update, agnp2026ReviewQueue, agnp2026ReviewSummary } from '../src/lib/content/tdmAgnpReview2026.js';
export const report = {
  schema:'pmx.tdm.agnp-audit.v1',
  source:agnp2026Update,
  summary:agnp2026ReviewSummary(),
  note:'Historical ranges are NOT updated by this queue. A drug appearing here is a candidate for primary-source comparison, not a claim that an AGNP 2026 value is available for that molecule.',
  candidates:agnp2026ReviewQueue
};
if(process.argv[1]?.endsWith('report_tdm_agnp_2026.mjs')) {
  if(process.argv.includes('--json')) console.log(JSON.stringify(report,null,2));
  else {
    console.log('AGNP 2026 review candidate summary:',JSON.stringify(report.summary));
    console.log('Molecules awaiting 2026 primary-source reconciliation:');
    for(const item of agnp2026ReviewQueue)
      console.log('- '+item.drugId+': '+item.historicalReferenceIds.length+
        ' historical numeric reference(s), years '+item.historicalYears.join(','));
    console.log('No AGNP 2026 numerical value has been copied automatically.');
  }
}
