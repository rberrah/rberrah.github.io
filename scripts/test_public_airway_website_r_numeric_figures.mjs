import assert from 'node:assert/strict';
import {File} from 'node:buffer';
import {readFileSync,writeFileSync,mkdtempSync,mkdirSync,rmSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {parseDelimited} from '../src/lib/multiomics/deterministic.js';
import {projectNativeRNumbers} from '../src/lib/multiomics/r-primary-results.js';
import {buildMultiomicsVisualizationData} from '../src/lib/multiomics/visualization-data.js';

const evidence=process.env.PMX_PAIRED_AIRWAY_REPORT_DIR;
if(!evidence)throw Error('PMX_PAIRED_AIRWAY_REPORT_DIR required for real public Airway test');
const input=JSON.parse(readFileSync(join(evidence,'paired_airway_original_request.json'),'utf8'));
const native=JSON.parse(readFileSync(join(evidence,'paired_airway_original_response.json'),'utf8'));
assert.equal(native.status,'ok');
assert.equal(native.methods.transcriptomics_differential_deseq2.referenceTableComplete,true);
const stub={
  protocol:{objective:'groups',designType:'paired'},
  layers:{transcriptomics:{
    rows:[{feature:'ENSG00000103196',effect:-999,qValue:0.99}],
    selected:[],steps:['Browser exploratory'],groupSizes:[4,4],effectScale:'log2',
    contrast:'dexamethasone treated vs untreated',
    qc:{preprocessingAudit:{declaredValueType:'raw_counts'}}
  }},
  referenceBackend:native
};
const result=projectNativeRNumbers(stub);
const rows=result.layers.transcriptomics.rows;
const raw= parseDelimited(native.methods.transcriptomics_differential_deseq2.referenceTableCsv);
assert.equal(rows.length,raw.rows.length);
assert(rows.length>10000);
assert.equal(result.numericSourceByLayer.transcriptomics,'native_r_complete_table');
assert.equal(result.browserExploratoryLayers.transcriptomics.rows[0].effect,-999);
function value(s){
  if(s==null||s===''||s==='NA')return null;
  const n=Number(s);return Number.isFinite(n)?n:null;
}
function nearly(a,b){
  if(a===null||b===null)return a===b;
  return Math.abs(a-b)<=1e-10*Math.max(1,Math.abs(a),Math.abs(b));
}
for(let i=0;i<rows.length;i++){
  const x=rows[i], r=raw.rows[i];
  assert.equal(x.feature,r.feature);
  assert(nearly(x.effect,value(r.log2FoldChange)), 'log2FC mismatch '+x.feature);
  assert(nearly(x.pValue,value(r.pvalue)), 'p mismatch '+x.feature);
  assert(nearly(x.qValue,value(r.padj)), 'q mismatch '+x.feature);
}
const marker=rows.find(row=>row.feature==='ENSG00000103196');
assert(marker&&marker.effect>0&&marker.qValue<0.05);
const metadataRows=parseDelimited(input.metadataCsv).rows;
const visualizations=await buildMultiomicsVisualizationData({
  files:{transcriptomics:new File([input.matrices.transcriptomics],'airway_counts.csv')},
  metadataRows,
  columnMapping:input.columnMapping,
  dataTypes:input.dataTypes,
  analysisResult:result,
  maxFeatures:30,maxSamples:48
});
const heatmap=visualizations?.heatmaps?.transcriptomics;
assert(heatmap?.rows?.length>0 && heatmap.samples.length===8);
const root=mkdtempSync(join(tmpdir(),'pmx-public-airway-r-figures-'));
try{
  const json=join(root,'site_display_from_r.json');
  const out=join(root,'figures');
  writeFileSync(json,JSON.stringify({...result,visualizations}));
  execFileSync('Rscript',['multiomics-engine/plot_research_figures.R',json,out],
    {timeout:180000,stdio:'pipe'});
  const csv=parseDelimited(readFileSync(join(out,'heatmap_transcriptomics_plot_values.csv'),'utf8'));
  assert.equal(csv.rows.length,heatmap.rows.length);
  assert.deepEqual(csv.headers.slice(1),heatmap.samples.map(s=>s.sampleId));
  for(let i=0;i<heatmap.rows.length;i++){
    assert.equal(csv.rows[i].feature_id,heatmap.rows[i].feature);
    for(let j=0;j<heatmap.samples.length;j++){
      const expected=heatmap.rows[i].z[j]??null;
      const actual=value(csv.rows[i][csv.headers[j+1]]);
      assert(nearly(expected,actual),
        'R figure plotted value differs from JS site figure at '+i+','+j);
    }
  }
  const figureManifest=JSON.parse(readFileSync(join(out,'figure_manifest.json'),'utf8'));
  assert(figureManifest.figures.some(f=>f.kind==='heatmap'&&f.filename.endsWith('.pdf')));
  assert(figureManifest.figures.every(f=>f.comparison_to_browser==='scientifically_similar_not_pixel_identical'));
  assert(existsSync(join(out,'heatmap_transcriptomics.pdf')));
  console.log('PASS: Airway/GSE52778',rows.length,
    'native R values reproduced feature-by-feature; browser & R figure plot data are identical for',
    heatmap.rows.length,'features ×',heatmap.samples.length,'samples');
}finally{rmSync(root,{recursive:true,force:true});}
