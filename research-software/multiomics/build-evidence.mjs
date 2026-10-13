#!/usr/bin/env node
/**
 * Frozen MultiOmics research-software evidence, with optional independent
 * recomputation from ORIGINAL per-dataset R workflow artifacts.
 *
 * node research-software/multiomics/build-evidence.mjs --out tmp/omics-paper
 * node research-software/multiomics/build-evidence.mjs --out tmp/omics-paper \
 *   --pr52-dir extracted-PR52 --pr75-dir extracted-PR75
 *
 * Results are synthetic; a CI PASS is not a scientific certification.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

export const HOME=path.dirname(fileURLToPath(import.meta.url));
const validStudies = {
  PR52:{scenarios:['global_null_balanced','global_null_unbalanced','mixed_truth_balanced','mixed_truth_unbalanced'],
    methods:['DESeq2','edgeR_QL','limma_voom'],n:100},
  PR75:{scenarios:['original_null_balanced','original_null_unbalanced','fixed_dispersion_balanced',
    'fixed_libraries_balanced','no_batch_effect_balanced'],
    methods:['DESeq2_default_Wald','DESeq2_Wald_no_independent_filter','DESeq2_Wald_t_reference'],n:60}
};
const sha256=b=>crypto.createHash('sha256').update(b).digest('hex');
function assert(ok,message){if(!ok)throw Error('EVIDENCE CHECK FAILED: '+message)}
/** Handles quoted fields and doubled quotes; disallows ragged/duplicate-header CSV. */
export function readCSV(text){
  let rows=[],row=[],field='',quoted=false;
  text=String(text).replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(quoted){
      if(c==='"'&&text[i+1]==='"'){field+='"';i++}
      else if(c==='"')quoted=false;
      else field+=c;
    }else if(c==='"'){assert(!field,'Unexpected quote');quoted=true}
    else if(c===','){row.push(field);field=''}
    else if(c==='\n'){row.push(field);rows.push(row);row=[];field=''}
    else if(c!=='\r')field+=c;
  }
  assert(!quoted,'Unclosed quote');
  if(field.length||row.length){row.push(field);rows.push(row)}
  assert(rows.length>1,'No data rows');
  const headers=rows.shift();assert(new Set(headers).size===headers.length,'Duplicate CSV column');
  return rows.map((r,i)=>{assert(r.length===headers.length,'Ragged CSV row '+(i+2));return Object.fromEntries(headers.map((h,j)=>[h,r[j]]))});
}
function num(value,label){const v=Number(value);assert(value!==''&&Number.isFinite(v),'Invalid numeric '+label);return v}
function rowsFrom(file){return readCSV(fs.readFileSync(file,'utf8'))}
export function validateSummaries(rows,provenance){
  assert(provenance.schema==='pmx-multiomics-publication-evidence/v1','Unknown provenance version');
  assert(provenance.nominal_fdr===0.05,'Nominal alpha silently changed');
  const seen=new Set();
  for(const row of rows){
    const study=validStudies[row.study];assert(study,'Unknown study '+row.study);
    assert(study.scenarios.includes(row.scenario),'Unknown scenario '+row.scenario);
    assert(study.methods.includes(row.method),'Unknown method '+row.method);
    assert(num(row.n,'n')===study.n,'Missing simulation replicates');
    const fdr=num(row.empirical_fdr,'FDR');
    const lo=num(row.ci_low,'interval lower');
    const hi=num(row.ci_high,'interval upper');
    assert(lo>=0&&hi<=1&&lo<=fdr+1e-7&&fdr<=hi+1e-7,'Invalid confidence interval');
    assert(fdr>=0&&fdr<=1,'FDR outside unit interval');
    const isNull=row.study==='PR75'||row.scenario.startsWith('global_null');
    assert(row.ci_method===(row.study==='PR52'?'bootstrap_1000':'clopper_pearson'),'Incorrect CI description');
    if(row.power!==''){const v=num(row.power,'power');assert(!isNull&&v>=0&&v<=1,'Power on null or outside range')}
    else assert(isNull,'Missing mixed-truth power');
    const key=[row.study,row.scenario,row.method].join(':');
    assert(!seen.has(key),'Repeated evidence cell '+key);seen.add(key);
  }
  for(const [study,c] of Object.entries(validStudies))
    for(const scenario of c.scenarios)for(const method of c.methods)
      assert(seen.has([study,scenario,method].join(':')),'Missing evidence '+study+':'+scenario+':'+method);
  assert(rows.length===27,'Wrong frozen study cell count');
  const safety=provenance.software_outcomes;
  assert(safety&&safety.routine_nominal_fdr_5_percent_control_demonstrated===false
    &&safety.clinical_validation===false
    &&safety.biological_external_validation===false
    &&safety.journal_accepted===false,'Unjustified scientific certification');
  return true;
}
const close=(a,b,tol=1e-6)=>Math.abs(a-b)<=tol;
export function verifyRaw(rows,prov,key,folder){
  const entry=prov.reference_runs[key];
  const file=key==='PR52'?'r1_rnaseq_calibration_per_dataset.csv':'replicates.csv';
  const source=path.join(folder,file);
  assert(fs.existsSync(source),'Missing raw CSV '+source);
  const bytes=fs.readFileSync(source);
  assert(sha256(bytes)===entry.files[file],'Raw per-dataset source SHA-256 mismatch '+key);
  const per=readCSV(bytes.toString('utf8'));
  assert(per.length===entry.executed_fits,'Raw fit count mismatch '+key);
  const grouped=new Map();
  const unique=new Set();
  for(const x of per){
    const c=validStudies[key];
    assert(c.scenarios.includes(x.scenario)&&c.methods.includes(x.method),'Unexpected raw cell');
    const seed=num(x.seed,'seed');
    const keySeed=[x.scenario,x.method,seed].join(':');
    assert(!unique.has(keySeed),'Duplicate simulation seed in one method');unique.add(keySeed);
    const keyCell=x.scenario+':'+x.method;
    if(!grouped.has(keyCell))grouped.set(keyCell,[]);
    if(key==='PR52'){
      const R=num(x.discoveries,'discoveries'), V=num(x.false_discoveries,'false discoveries');
      assert(Number.isInteger(R)&&Number.isInteger(V)&&V>=0&&R>=V,'Impossible discovery count');
      const FDP=num(x.false_discovery_proportion,'FDP');
      assert(close(FDP,V/Math.max(1,R),1e-10),'FDP inconsistent with number of discoveries');
      grouped.get(keyCell).push({fdr:FDP,power:x.power===''?null:Number(x.power),seed});
    }else{
      const R=num(x.discoveries,'discoveries'),f=num(x.any_false_discovery,'false study flag');
      assert(Number.isInteger(R)&&R>=0&&f===Number(R>0),'Global-null false-call flag wrong');
      assert(num(x.actual_fdp,'actual FDP')===f,'Global-null FDP wrong');
      grouped.get(keyCell).push({fdr:f,power:null,seed});
    }
  }
  for(const row of rows.filter(x=>x.study===key)){
    const g=grouped.get(row.scenario+':'+row.method);
    assert(g?.length===validStudies[key].n,'Incomplete simulation cell '+row.scenario+':'+row.method);
    const actual=g.reduce((sum,a)=>sum+a.fdr,0)/g.length;
    assert(close(actual,num(row.empirical_fdr,'fdr'),1.1e-6),'Frozen summary disagrees with raw studies');
    if(row.power!==''){
      const power=g.reduce((sum,a)=>sum+a.power,0)/g.length;
      assert(close(power,num(row.power,'power'),1.1e-6),'Frozen power disagrees with raw studies');
    }
  }
  // Check all reference methods share exactly the same datasets in a scenario.
  const spec=validStudies[key];
  for(const scenario of spec.scenarios){
    const sets=spec.methods.map(method=>new Set(grouped.get(scenario+':'+method).map(x=>x.seed)));
    for(const seed of sets[0])assert(sets.every(s=>s.has(seed)),'Unpaired R method replicates');
  }
  const outcomes={verified:true,rows:per.length,sha256:sha256(bytes)};
  if(key==='PR75'){
    const wald=grouped, paired=[];
    for(const scenario of spec.scenarios){
      const a=new Map(wald.get(scenario+':DESeq2_default_Wald').map(x=>[x.seed,x.fdr]));
      const b=new Map(wald.get(scenario+':DESeq2_Wald_t_reference').map(x=>[x.seed,x.fdr]));
      const c=new Map(wald.get(scenario+':DESeq2_Wald_no_independent_filter').map(x=>[x.seed,x.fdr]));
      let waldOnly=0,tOnly=0,both=0;
      for(const [seed,flag] of a){
        assert(c.get(seed)===flag,'Filtering ablation disagreeing with frozen evidence');
        if(flag&&!b.get(seed))waldOnly++;
        if(!flag&&b.get(seed))tOnly++;
        if(flag&&b.get(seed))both++;
      }
      paired.push({scenario,waldOnly,tOnly,both,
        interpretation:'Exploratory paired comparison; no claim that the t-reference has validated power'});
    }
    outcomes.paired_null_comparisons=paired;
  }
  return outcomes;
}
function renderMarkdown(rows,raw,prov){
  const entries=rows.filter(r=>r.method==='DESeq2'||r.method==='DESeq2_default_Wald'
    ||r.method==='DESeq2_Wald_t_reference');
  const table=entries.map(r=>`| ${r.study} | ${r.scenario} | ${r.method} | ${(100*Number(r.empirical_fdr)).toFixed(2)}% | ${(100*Number(r.ci_low)).toFixed(2)}–${(100*Number(r.ci_high)).toFixed(2)}% | ${r.power||'—'} |`).join('\n');
  return `# MultiOmics: evidence register (synthetic simulations only)
Generated directly from versioned evidence and/or integrity-checked raw R outputs.
The PR52 bootstrap intervals and PR75 exact binomial intervals use DIFFERENT definitions.
**Not a clinical, biological, or 5% nominal-FDR certification.**

| Study | Scenario | Method | Mean FDP / null FWER | 95% interval | Power |
| --- | --- | --- | ---: | --- | --- |
${table}

## Source provenance
- PR52: ${prov.reference_runs.PR52.workflow_run} (commit ${prov.reference_runs.PR52.commit})
- PR75: ${prov.reference_runs.PR75.workflow_run} (commit ${prov.reference_runs.PR75.commit})
- Raw reanalysis: PR52 ${raw.PR52.verified?'SHA-256 verified':'NOT supplied'}; PR75 ${raw.PR75.verified?'SHA-256 verified':'NOT supplied'}.
- Frozen aggregate tables alone do **not** demonstrate raw verification in this run.
- Full original R per-dataset files must be durably archived before ephemeral CI artifacts expire.
- The t-reference has only been tested for false calls here, not mixed-truth power;
  changing the clinical or confirmatory default from this table would be unjustified.
- Methods are not interchangeable and gene expression is not enzyme activity.

## Publication readiness
- Software-level reproducibility: demonstrated for a restricted RNA-seq test in PR73.
- Nominal 5% RNA-seq FDR: not established in tested DESeq2 scenarios.
- Incremental multi-omics predictive utility, independent cohort replication, usability by novice researchers:
  still require independent validation.
- Automated certification: **disabled**.
`;
}
export function build({out=path.join(HOME,'tmp','evidence'),pr52=null,pr75=null}={}){
  const prov=JSON.parse(fs.readFileSync(path.join(HOME,'evidence','provenance.json'),'utf8'));
  const rows=rowsFrom(path.join(HOME,'evidence','verified-summaries.csv'));
  validateSummaries(rows,prov);
  const raw={PR52:pr52?verifyRaw(rows,prov,'PR52',pr52):{verified:false},
             PR75:pr75?verifyRaw(rows,prov,'PR75',pr75):{verified:false}};
  fs.mkdirSync(out,{recursive:true});
  const report={
    schema:'pmx-multiomics-evidence-report/v1',
    generated_at:new Date().toISOString(),total_cells:rows.length,
    source_frozen_verified:true,
    raw_workflow_files_integrity_checked:raw,
    nominal_fdr:prov.nominal_fdr,reference_runs:prov.reference_runs,
    certification:{
      software_research_ready_to_review:true,
      universal_fdr_control:false,clinical_validation:false,
      external_multimodal_benefit_demonstrated:false,
      JOSS_acceptance_or_publication:false
    },
    observed_cells:rows.map(x=>({
      study:x.study,scenario:x.scenario,method:x.method,n:Number(x.n),
      empirical_fdr:Number(x.empirical_fdr),
      ci_95:[Number(x.ci_low),Number(x.ci_high)],
      power:x.power===''?null:Number(x.power),ci_method:x.ci_method
    })),
    blockers:[
      'Under global null, DESeq2 apparent FDR exceeds nominal 5% in multiple simulated settings',
      'The t-Wald alternative requires prespecified independent mixed-truth power evaluation',
      'The time-limited workflow artifacts must be moved to a durable archive',
      'Real user accessibility evaluation and independent multi-omics predictive validation remain outstanding'
    ]
  };
  fs.writeFileSync(path.join(out,'evidence-report.json'),JSON.stringify(report,null,2)+'\n');
  fs.writeFileSync(path.join(out,'evidence-report.md'),renderMarkdown(rows,raw,prov));
  return report;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=process.argv.slice(2);
  const option=(flag)=>{const i=args.indexOf(flag);if(i<0)return null;
    assert(args[i+1]&&!args[i+1].startsWith('--'),'Missing option '+flag);
    return path.resolve(args[i+1]);};
  assert(args.every(x=>!x.startsWith('--')||['--out','--pr52-dir','--pr75-dir'].includes(x)),
    'Unknown option');
  const report=build({out:option('--out')||path.join(HOME,'tmp','evidence'),
    pr52:option('--pr52-dir'),pr75:option('--pr75-dir')});
  console.log('EVIDENCE REGISTRY CHECKED: '+report.total_cells+
    ' scientific cells; all certification claims remain disabled.');
  console.log('Raw PR52: '+report.raw_workflow_files_integrity_checked.PR52.verified+
    '; Raw PR75: '+report.raw_workflow_files_integrity_checked.PR75.verified);
}
