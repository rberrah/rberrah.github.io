#!/usr/bin/env node
/**
 * Produce a reviewable, source-pinned research-software supplementary artefact.
 * Not a statistical, biological, clinical or universal validation certificate.
 *
 * Usage: node scripts/build_multiomics_publication_artifact.mjs
 *          [--out tmp/multiomics/publication-artifact] [--require-r]
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const arg = name => argv.includes(name);
const option = (name, fallback) => {
  const i = argv.indexOf(name);
  if (i < 0) return fallback;
  if (!argv[i+1] || argv[i+1].startsWith('--')) throw Error('Missing value for '+name);
  return argv[i+1];
};
if (argv.some((x,i) => x.startsWith('--') &&
  !['--out','--require-r'].includes(x))) throw Error('Unknown option');
const OUT = path.resolve(ROOT, option('--out','tmp/multiomics/publication-artifact'));
const REQUIRE_R = arg('--require-r');
function execute(command,args,{timeout=180000}={}) {
  const p = spawnSync(command,args,{cwd:ROOT,encoding:'utf8',timeout,maxBuffer:16*1024*1024});
  return {
    exit_code:p.status ?? null,
    signal:p.signal || null,
    success:p.status===0 && !p.error,
    output:(p.stdout||'')+(p.stderr||''),
    error:p.error?.message || null
  };
}
function must(command,args) {
  const r = execute(command,args);
  if(!r.success)throw Error(command+' '+args.join(' ')+' failed: '+r.output.slice(-1000)+' '+(r.error||''));
  return r.output.trim();
}
const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const shaText = s => crypto.createHash('sha256').update(s).digest('hex');
const ensure = (ok,why) => { if(!ok) throw Error('PUBLICATION ARTIFACT BLOCKED: '+why); };
function isSourceFile(p) {
  if(['package.json','package-lock.json','LICENSE','LICENSE-CONTENT.md','README.md',
      'svelte.config.js','vite.config.js','site.config.js'].includes(p)) return true;
  if(p.startsWith('src/lib/multiomics/') || p.startsWith('src/routes/multiomics/'))
    return /\.(js|ts|svelte|json|md)$/.test(p);
  if(p.startsWith('multiomics-engine/'))return /\.(R|r|md|txt|json|yml|yaml)$/.test(p);
  if(p.startsWith('static/multiomics/'))
    return /\.(js|ts|md|txt|json)$/.test(p); // no measured matrices
  if(p.startsWith('scripts/'))
    return /\.(mjs|R|md)$/.test(p) && /(multiomics|omics|rnaseq|research_report|public_omics)/i.test(p);
  if(p.startsWith('tests/e2e/')) return /^tests\/e2e\/multiomics.*\.spec\.js$/.test(p);
  if(p.startsWith('docs/')) return /^docs\/multiomics.*\.md$/.test(p);
  if(p.startsWith('.github/workflows/')) return /multiomics.*\.yml$/.test(p);
  return false;
}
function summaryRVersions() {
  const r=execute('Rscript',['-e',
    'cat(paste0("R\\t",getRversion(),"\\n")); for (p in c("DESeq2","edgeR","limma","fgsea","MOFA2","mixOmics","xcms","lmerTest","plumber","jsonlite")) cat(paste0(p,"\\t",if (requireNamespace(p,quietly=TRUE)) as.character(packageVersion(p)) else "MISSING","\\n"))'
  ]);
  if(!r.success)return {status:'not_available',details:r.error||r.output.slice(0,400)};
  const packages={};let rVersion=null;
  for(const line of r.output.trim().split(/\r?\n/)) {
    const parts=line.split('\t');
    if(parts.length===2) {if(parts[0]==='R')rVersion=parts[1];else packages[parts[0]]=parts[1];}
  }
  return {status:'observed',version:rVersion,packages};
}
function runCheck(name,command,args) {
  const r=execute(command,args);
  const outputPath=path.join(OUT,'logs',name+'.log');
  fs.writeFileSync(outputPath,r.output+(r.error?'\n'+r.error:''));
  return {name,command:[command,...args],status:r.success?'pass':'fail',
    exit_code:r.exit_code,signal:r.signal,output_sha256:sha256(outputPath),
    log:'logs/'+name+'.log'};
}
function main() {
  const commit=must('git',['rev-parse','HEAD']);
  ensure(/^[a-f0-9]{40}$/.test(commit),'unresolved commit');
  ensure(must('git',['status','--porcelain']).length===0,
    'worktree is not clean; commit changes before archiving');
  ensure(!fs.existsSync(OUT),'output already exists (use a fresh --out directory)');
  const tracks=must('git',['ls-files','-z']).split('\0').filter(Boolean).sort();
  const sources=tracks.filter(isSourceFile);
  ensure(sources.length>=35,'too few tracked source files for a methods snapshot');
  ensure(sources.includes('package-lock.json') && sources.includes('multiomics-engine/advanced_methods.R'),
    'dependency lock or reference R engine absent');
  fs.mkdirSync(path.join(OUT,'logs'),{recursive:true});
  const sourceZip=path.join(OUT,'multiomics-research-source.zip');
  must('git',['archive','--format=zip','--output='+sourceZip,commit,...sources]);
  const sourceChecksums=Object.fromEntries(sources.map(p=>[p,sha256(path.join(ROOT,p))]));
  const rRuntime=summaryRVersions();
  const checks=[
    runCheck('js-omics-engine',process.execPath,['scripts/test_multiomics.mjs']),
    runCheck('js-research-methods-privacy',process.execPath,['scripts/test_multiomics_research_report.mjs']),
    runCheck('js-public-evidence-scope',process.execPath,['scripts/test_public_omics_evidence.mjs'])
  ];
  const rTests=[
    ['r-reference-backend','multiomics-engine/tests/backend_smoke.R'],
    ['r-browser-reference','multiomics-engine/tests/browser_reference_agreement.R'],
    ['r-ms-assurance','multiomics-engine/tests/test_ms_quantitative_assurance.R'],
    ['r-proteomics-assurance','multiomics-engine/tests/test_proteomics_quantitative_assurance.R']
  ];
  if(rRuntime.status==='observed')for(const [name,script] of rTests) {
    checks.push(runCheck(name,'Rscript',[script]));
  }
  else for(const [name,script] of rTests)checks.push({
    name,command:['Rscript',script],status:'not_run_missing_Rscript',
    exit_code:null,signal:null,log:null,output_sha256:null
  });
  const passed=checks.every(c=>c.status==='pass');
  const manifest={
    schema:'pmx-multiomics-publication-artifact/v1',
    generated_at:new Date().toISOString(),
    source:{repository:'https://github.com/rberrah/rberrah.github.io',
      commit,tree_clean:true,source_archive:'multiomics-research-source.zip',
      source_archive_sha256:sha256(sourceZip),source_file_count:sources.length,
      file_sha256:sourceChecksums},
    environment:{node:process.version,platform:process.platform,arch:process.arch,
      package_lock_sha256:sourceChecksums['package-lock.json'],
      r:rRuntime,renv_lock_present:tracks.includes('multiomics-engine/renv.lock') ||
        tracks.includes('renv.lock')},
    checks,
    assurance:{
      software_smoke_all_executed_and_passed:passed,
      experimental_design_and_fdr_calibration:'requires_independent_case_specific_review',
      external_biological_reproducibility:'not_assessed_by_this_artifact',
      clinical_validation:false,
      universal_statistical_validation:false,
      publication_acceptance_or_certificate:false
    },
    limitations:[
      'A source archive is not a complete deployable site; clone the pinned full repository.',
      'Passing software checks does not demonstrate nominal FDR or sample adequacy on every study.',
      'R package versions are observed, not installed from a project-wide lockfile.',
      'No patient matrices, raw MS instrument files or observational outputs are included.',
      'Any submitted figure and clinical/biological conclusion requires separate source evidence.'
    ]
  };
  fs.writeFileSync(path.join(OUT,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  const readme=[
    '# MultiOmics — research software reproducibility appendix',
    '',
    'Immutable source commit: '+commit,
    'Repository: '+manifest.source.repository,
    '',
    'Files: manifest.json (SHA-256 per source file, environment and actual checks),',
    'multiomics-research-source.zip (selected source code and documentation), logs/.',
    '',
    'The selected archive is NOT a standalone site release. To run in context:',
    '1. git clone https://github.com/rberrah/rberrah.github.io.git',
    '2. cd rberrah.github.io',
    '3. git checkout --detach '+commit,
    '4. npm ci',
    '5. npm run test:multiomics',
    '6. node scripts/test_multiomics_research_report.mjs',
    '7. node scripts/test_public_omics_evidence.mjs',
    '8. Rscript multiomics-engine/tests/backend_smoke.R (if R is installed)',
    '',
    'Reference R/Bioconductor packages MUST be explicitly version-locked in a',
    'separate archive/container before claiming a portable reference-method run.',
    'This package contains NO patient-level data or statistical calibration certification.',
    'Read docs/multiomics-research-qualification-2026.md and',
    'docs/multiomics-rnaseq-r1-validation.md for negative and inconclusive findings.',
    ''
  ];
  fs.writeFileSync(path.join(OUT,'README.md'),readme.join('\n'));
  console.log('MultiOmics publication source pinned: '+commit);
  console.log('Included source files: '+sources.length+'; executed checks passed: '+passed);
  console.log('R runtime: '+rRuntime.status+'; code archive SHA-256: '+manifest.source.source_archive_sha256);
  if(!passed || (REQUIRE_R && rRuntime.status!=='observed'))process.exitCode=1;
}
main();
