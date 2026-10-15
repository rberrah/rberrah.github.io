import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,writeFileSync,rmSync,existsSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {RESEARCH_R_FIGURE_SOURCE} from '../src/lib/multiomics/r-figure-source.js';
import {RESEARCH_RUN_ALL_R_SOURCE} from '../src/lib/multiomics/r-run-all-source.js';

assert.equal(RESEARCH_R_FIGURE_SOURCE,readFileSync('multiomics-engine/plot_research_figures.R','utf8'),
  'Bundled R figure source differs from the repository R source');
assert.equal(RESEARCH_RUN_ALL_R_SOURCE,readFileSync('multiomics-engine/run_research_bundle.R','utf8'),
  'The downloadable R entrypoint is stale');
const root=mkdtempSync(join(tmpdir(),'pmx-r-figures-'));
try {
  const path=join(root,'analysis.json'),out=join(root,'figures');
  const data={
    engine:{name:'test',version:'v1'},protocol:{objective:'groups'},
    visualizations:{
      heatmaps:{transcriptomics:{
        samples:[{sampleId:'S1'},{sampleId:'S2'},{sampleId:'S3'}],
        rows:[{feature:'ENSG001',z:[-1,0,1]},{feature:'ENSG002',z:[0.5,null,-0.5]}]
      }},
      metabologram:{
        transcriptomics:[{feature:'ENSG001',labelFr:'Gene A',effect:1.3,effectScale:'log2'}],
        metabolomics:[{feature:'CHEBI:24996',labelFr:'Lactate',effect:-0.7,effectScale:'log2'}]
      },
      centralCarbon:{
        metabolites:[{id:'glucose',x:90,y:70,label:'Glucose',measurement:{status:'measured',effect:1,effectScale:'log2'}}],
        enzymes:[{id:'hk',x:155,y:48,label:'HK',measurement:{status:'unmeasured'}}],
        edges:[]
      }
    }
  };
  writeFileSync(path,JSON.stringify(data));
  execFileSync('Rscript',['multiomics-engine/plot_research_figures.R',path,out],
    {stdio:'pipe',timeout:120000});
  const zscores=readFileSync(join(out,'heatmap_transcriptomics_plot_values.csv'),'utf8');
  assert(zscores.includes('ENSG001,-1,0,1'));
  assert(zscores.includes('ENSG002,0.5,NA,-0.5'));
  const circular=readFileSync(join(out,'metabologram_plot_values.csv'),'utf8');
  assert(circular.includes('CHEBI:24996'));
  assert(circular.includes('-0.7'));
  const nodes=readFileSync(join(out,'central_carbon_plot_values.csv'),'utf8');
  assert(nodes.includes('Glucose'));
  const manifest=JSON.parse(readFileSync(join(out,'figure_manifest.json'),'utf8'));
  assert.equal(manifest.does_not_refit_model,true);
  assert.equal(manifest.pixel_identity_to_Svelte,false);
  assert.deepEqual([...new Set(manifest.figures.map(x=>x.kind))].sort(),
    ['central_carbon_map','heatmap','metabologram']);
  for(const item of manifest.figures){
    assert(existsSync(join(out,item.filename)));
    assert(item.bytes>300);
    assert.equal(item.generated_by,'R_base_graphics');
    assert.match(item.plotted_data_source,/visualizations/);
  }
  const copiedRoot=join(root,'research');
  mkdirSync(join(copiedRoot,'provenance'),{recursive:true});
  mkdirSync(join(copiedRoot,'figures_r'),{recursive:true});
  writeFileSync(join(copiedRoot,'run_all.R'),RESEARCH_RUN_ALL_R_SOURCE);
  writeFileSync(join(copiedRoot,'figures_r','generate_figures.R'),RESEARCH_R_FIGURE_SOURCE);
  writeFileSync(join(copiedRoot,'provenance','analysis_complete.json'),JSON.stringify(data));
  execFileSync('Rscript',['run_all.R'],{cwd:copiedRoot,stdio:'pipe',timeout:120000});
  const report=JSON.parse(readFileSync(join(copiedRoot,'research_reproduction_status.json'),'utf8'));
  assert.equal(report.r_numerical_replay,'NOT_AVAILABLE_BROWSER_RESULTS');
  assert.equal(report.r_figures,'GENERATED_SIMILAR_PDF_SVG');
  assert(existsSync(join(copiedRoot,'figures_r','output','figure_manifest.json')));
  console.log('PASS: R created scientific-similar heatmap, circular effect plot and metabolic schematic');
}finally{rmSync(root,{recursive:true,force:true});}
