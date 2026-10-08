// @ts-nocheck
import { parseDelimited } from './deterministic.js';

// Exact sample and feature identifiers are preserved. No implicit averaging,
// sample-group guessing, MS peak annotation, concentration conversion or
// biological interpretation occurs in this importer.
const aliases = {
  assay: ['assay_id','injection_id','file_name','filename','sample_name','sample_id','sample','injection','sampleid'],
  feature: ['feature_id','metabolite_id','compound_id','metabolite','compound','feature','analyte','peak_id','peak','name','identifier'],
  value: ['peak_area','auc','area','integrated_area','peakarea','area_under_curve','ms_auc','abundance','intensity'],
  subject: ['subject_id','subject','individual_id','patient_id','animal_id'],
  sample: ['sample_id','sample','specimen_id','biological_sample'],
  condition: ['condition','group','treatment','class','status'],
  batch: ['batch','batch_id','run_batch','plate'],
  timepoint: ['timepoint','time_point','time','visit'],
  type: ['sample_type','injection_type','sample_class','qc_type'],
  order: ['injection_order','run_order','injection_number','order'],
  replicate: ['technical_replicate','replicate','technical_rep']
};
const norm = (x)=>String(x??'').trim().toLowerCase().replace(/[\s-]+/g,'_');
const find = (headers, keys) => headers.find((h)=>keys.includes(norm(h))) || null;
const escapeCsv=(s)=>'"'+String(s??'').replace(/"/g,'""')+'"';
const csv=(header,rows)=>[header.map(escapeCsv).join(','),...rows.map((row)=>row.map(escapeCsv).join(','))].join('\n')+'\n';
function parseArea(raw) {
  if(String(raw??'').trim()==='') return null;
  const v=Number(String(raw).trim().replace(',','.'));
  if(!Number.isFinite(v)||v<0) throw new Error('MS AUC: peak areas must be non-negative finite numbers; invalid value: '+raw);
  return v;
}
function metadataRowsFromRecords(records, cols) {
  if(!cols.condition) return null;
  const assays=new Map();
  for(const record of records){
    const assay=String(record[cols.assay]??'').trim();
    const v=(key, fallback='')=>cols[key] ? String(record[cols[key]]??'').trim() : fallback;
    const entry={
      subject_id:v('subject',assay),sample_id:v('sample',assay),assay_id:assay,omic:'metabolomics',
      condition:v('condition'),timepoint:v('timepoint'),batch:v('batch'),
      technical_replicate:v('replicate','1'),sample_type:v('type','biological'),injection_order:v('order')
    };
    if(!entry.subject_id||!entry.sample_id)throw new Error('MS AUC: missing subject or sample identifier');
    const old=assays.get(assay);
    if(old && JSON.stringify(old)!==JSON.stringify(entry))
      throw new Error('MS AUC: contradictory metadata for injection '+assay);
    assays.set(assay,entry);
  }
  if(!assays.size)return null;
  return [...assays.values()];
}
/**
 * Convert an MS vendor peak-area export to the existing feature × injection
 * contract. Long exports require a feature ID, injection/sample ID, and AUC.
 * Optional per-row condition/group columns can generate a traceable metadata
 * table. Unknown feature IDs are preserved and never guessed.
 */
export function convertMsAucExport(text) {
  const parsed=parseDelimited(text);
  const heads=parsed.headers;
  const cols=Object.fromEntries(Object.entries(aliases).map(([k,options])=>[k,find(heads,options)]));
  if (!cols.feature || !cols.assay || !cols.value || new Set([cols.feature,cols.assay,cols.value]).size!==3) {
    return {format:'matrix',matrixCsv:text,metadataCsv:null,features:null,assays:null};
  }
  if(!parsed.rows.length)throw new Error('MS AUC: export contains no observations');
  const features=[], assays=[], vals=new Map();
  const seenFeature=new Set(),seenAssay=new Set();
  let observed=0,missing=0;
  for(const row of parsed.rows){
    const feature=String(row[cols.feature]??'').trim();
    const assay=String(row[cols.assay]??'').trim();
    if(!feature||!assay)throw new Error('MS AUC: each row must contain a feature and a sample/injection ID');
    const value=parseArea(row[cols.value]);
    const key=JSON.stringify([feature,assay]);
    if(vals.has(key))throw new Error('MS AUC: duplicate feature × injection: '+feature+' / '+assay+'; resolve technical duplicates before import');
    vals.set(key,value);
    if(!seenFeature.has(feature)){features.push(feature);seenFeature.add(feature);}
    if(!seenAssay.has(assay)){assays.push(assay);seenAssay.add(assay);}
    if(value===null)missing++;else observed++;
  }
  const matrixCsv=csv(['feature_id',...assays],features.map((feature)=>[
    feature,...assays.map((assay)=>vals.get(JSON.stringify([feature,assay]))??'')
  ]));
  const metadata=metadataRowsFromRecords(parsed.rows,cols);
  const metadataCsv=metadata?csv(
    ['subject_id','sample_id','assay_id','omic','condition','timepoint','batch','technical_replicate','sample_type','injection_order'],
    metadata.map((m)=>Object.values(m))
  ):null;
  return {format:'long_ms_auc',matrixCsv,metadataCsv,features:features.length,assays:assays.length,
    observed,missing,metadataGenerated:Boolean(metadata)};
}
