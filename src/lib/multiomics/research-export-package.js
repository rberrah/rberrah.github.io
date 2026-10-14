// @ts-nocheck
// Researcher-focused, offline ZIP dossier. No dependence on a remote service,
// publication API, or R backend. Browser statistics and R fits are identified
// separately. The ZIP contains raw study inputs and may be CONFIDENTIAL.
import {buildResearchMethodsManifest} from './research-report.js';
import {parseReferenceCsv} from './research-reference-csv.js';
import {RESEARCH_DOSSIER_VERIFY_PY,RESEARCH_DOSSIER_README} from './research-archive-verifier.js';

const encoder=new TextEncoder();
const CSV_COLUMNS=[
  ['feature','feature'],['effect','effect'],['effect_scale','effectScale'],
  ['ci95_low','ciLow'],['ci95_high','ciHigh'],
  ['exponentiated_effect','exponentiatedEffect'],
  ['exponentiated_ci95_low','exponentiatedCiLow'],
  ['exponentiated_ci95_high','exponentiatedCiHigh'],
  ['fold_ratio_if_log2','foldRatio'],['p_value','pValue'],
  ['q_value','qValue'],['n','n'],['n_reference','nReference'],
  ['n_comparison','nComparison'],['model','model']
];
const UTF8_FLAG=0x0800;
const MAX_ZIP_BYTES=130*1024*1024;
const LOCALES=['fr','en'];
/** The R backend currently exports method.top via top_frame(default 100).
 * It MUST NOT be passed off as complete reference R differential data.
 * This is separate from the complete browser exploratory result tables. */
export function referencePreviewAudit(result){
  const methods=result?.referenceBackend?.methods;
  if(!methods||typeof methods!=='object')return [];
  return Object.entries(methods).filter(([,m])=>m && typeof m==='object')
    .map(([key,m])=>{
      const table=m.referenceTable&&typeof m.referenceTable==='object'?m.referenceTable:m;
      const complete=table.referenceTableComplete===true &&
        table.referenceTableStatus==='complete';
      return {
        method_key:key,
        reported_name:typeof m.method==='string'?m.method:key,
        status:typeof m.status==='string'?m.status:'unknown',
        preview_rows:Array.isArray(m.top)?m.top.length:null,
        complete_reference_table_exported:complete,
        reference_table_rows:Number.isInteger(table.referenceTableRows)?
          table.referenceTableRows:null,
        reference_export_status:typeof table.referenceTableStatus==='string'?
          table.referenceTableStatus:'preview_only',
        local_archive_id:typeof table.referenceTableLocalArchiveId==='string' &&
          /^pmx_reference_[A-Za-z0-9._-]+$/.test(table.referenceTableLocalArchiveId)?
          table.referenceTableLocalArchiveId:null,
        local_archive_sha256:typeof table.referenceTableLocalArchiveSha256==='string' &&
          /^[a-f0-9]{64}$/.test(table.referenceTableLocalArchiveSha256)?
          table.referenceTableLocalArchiveSha256:null,
        paired_design:m.pairedDesignContract&&
          m.pairedDesignContract.pairing==='same_subject_two_conditions'
          ? {
              pairing:'same_subject_two_conditions',
              design:m.pairedDesignContract.design||null,
              independent_biological_subjects:m.pairedDesignContract.independent_biological_subjects??null,
              biological_pairs:m.pairedDesignContract.biological_pairs??null,
              model_samples:m.pairedDesignContract.model_samples??null,
              residual_degrees_of_freedom:m.pairedDesignContract.residual_degrees_of_freedom??null,
              contrast:m.pairedDesignContract.explicit_primary_contrast??null,
              contrast_was_prespecified:m.pairedDesignContract.contrast_was_prespecified===true,
              certified:false
            }:null,
        note:complete
          ?'Complete original-identifier R table is included in reference_r/, separate from browser exploration.'
          :'Not a complete fitted R feature table; top-frame previews cannot be cited as a full differential analysis.'
      };
    });
}
/** Extract only certified-complete-by-count R method CSV from a consented
 * local backend response, never mislabel browser tables as R output. */
export function fullReferenceMethodCsvs(result){
  const methods=result?.referenceBackend?.methods;
  if(!methods||typeof methods!=='object')return [];
  const collected=[];
  for(const [key,method] of Object.entries(methods)){
    if(!method||typeof method!=='object')continue;
    const table=method.referenceTable&&typeof method.referenceTable==='object'?
      method.referenceTable:method;
    if(table.referenceTableComplete===true && method.status!=='ok')
      throw Error('Reference '+key+' claims a complete fit with non-success status.');
    if(table.referenceTableComplete!==true){
      if(typeof table.referenceTableCsv==='string'&&table.referenceTableCsv.length)
        throw Error('Reference '+key+' has raw rows without verified completeness.');
      continue;
    }
    if(table.referenceTableStatus!=='complete'||typeof table.referenceTableCsv!=='string')
      throw Error('Reference '+key+' falsely claims a complete table.');
    if(!/^[A-Za-z0-9_]+$/.test(key))throw Error('Unsafe R method name in archive');
    const parsed=parseReferenceCsv(table.referenceTableCsv);
    if(!parsed.headers.includes('feature'))throw Error('Reference '+key+' has no original feature ID');
    if(!Number.isInteger(table.referenceTableRows)||table.referenceTableRows!==parsed.rows.length||
        table.referenceTableExportedRows!==parsed.rows.length)
      throw Error('Reference '+key+' row count mismatch');
    if(table.referenceTableBytes!==undefined &&
       table.referenceTableBytes!==encoder.encode(table.referenceTableCsv).length)
      throw Error('Reference '+key+' byte count mismatch');
    if(parsed.rows.some(row=>!row.feature)||new Set(parsed.rows.map(row=>row.feature)).size!==parsed.rows.length)
      throw Error('Reference '+key+' missing or duplicate fitted feature IDs');
    collected.push({name:'reference_r/'+key+'.csv',csv:table.referenceTableCsv,
      method_key:key,rows:parsed.rows.length,columns:parsed.headers,
      original_features:table.referenceTableOriginalFeatures??null,
      excluded_before_fit:table.referenceTableExcludedBeforeFit??null});
  }
  return collected;
}

function requireThat(value,message){if(!value)throw Error('Research dossier: '+message)}
function plain(value){return value==null||typeof value==='number'&&!Number.isFinite(value)?'':String(value)}
function decimal(value){return typeof value==='number'&&Number.isFinite(value)?value:''}
/** Preserve scientific identifiers in the JSON source. In the spreadsheet
 * CSV, avoid formula execution by explicitly prefixing unsafe text IDs.
 * This is disclosed in the manifest; it must never be a silent ID rewrite. */
function spreadsheetId(value){
  const s=plain(value);
  return /^[\s]*[=+@-]/.test(s)?"'"+s:s;
}
function cell(value){
  const s=plain(value);
  return /[",\r\n]/.test(s)?'"'+s.replaceAll('"','""')+'"':s;
}
/** Complete UTF-8 RFC 4180 compatible table, CRLF, Excel-safe identifiers. */
export function fullLayerCsv(rows){
  requireThat(Array.isArray(rows),'Results rows must be an array');
  const out=[CSV_COLUMNS.map(x=>x[0]).join(',')];
  for(const r of rows){
    requireThat(r&&typeof r.feature==='string'&&r.feature.length,
      'Missing measured feature identifier');
    for(const field of ['pValue','qValue']){
      if(r[field]!=null)
        requireThat(typeof r[field]==='number'&&Number.isFinite(r[field])&&
          r[field]>=0&&r[field]<=1,'Invalid '+field+' for '+r.feature);
    }
    out.push(CSV_COLUMNS.map(([heading,key])=>{
      const value=key==='feature'?spreadsheetId(r.feature):
        key==='effect'||key==='ciLow'||key==='ciHigh'||
        key==='exponentiatedEffect'||key==='exponentiatedCiLow'||
        key==='exponentiatedCiHigh'||key==='foldRatio'||
        key==='pValue'||key==='qValue'||key==='n'||
        key==='nReference'||key==='nComparison'?decimal(r[key]):r[key];
      return cell(value);
    }).join(','));
  }
  return '\uFEFF'+out.join('\r\n')+'\r\n';
}
const layerLabel={transcriptomics:['Transcriptomique','Transcriptomics'],
                  proteomics:['Protéomique','Proteomics'],
                  metabolomics:['Métabolomique','Metabolomics']};
function text(fr,en,lang){return lang==='en'?en:fr}
function print(v){if(Array.isArray(v))return v.join(', ')||'—';if(v===null||v===undefined||v==='')return '—';return String(v)}
/** A usable, conservative methods and interpretation document. */
export function methodsMarkdown(result,locale='fr'){
  requireThat(LOCALES.includes(locale),'Unknown language');
  requireThat(result?.engine&&result?.protocol&&result?.layers,
    'No completed omics analysis');
  const a=buildResearchMethodsManifest(result);
  const rPreviews=referencePreviewAudit(result);
  const fullR=fullReferenceMethodCsvs(result);
  const t=(fr,en)=>text(fr,en,locale);
  const h=[
    '# '+t('Analyse MultiOmics — méthodes et résultats','MultiOmics analysis — methods and results'),
    '',
    '> '+t('Dossier contenant des données potentiellement sensibles. Ne pas diffuser sans autorisation.',
      'This dossier may contain sensitive research data. Do not distribute without authorization.'),
    '',
    '## '+t('Résumé de l’étude','Study summary'),
    '',
    '| '+t('Champ','Field')+' | '+t('Valeur','Value')+' |',
    '| --- | --- |',
    '| '+t('Date du calcul','Analysis date')+' | '+print(result.generatedAt)+' |',
    '| '+t('Moteur réellement exécuté','Engine actually executed')+' | '+print(result.engine.name)+' |',
    '| '+t('Version du moteur','Engine version')+' | '+print(result.engine.version)+' |',
    '| '+t('Objectif déclaré','Declared objective')+' | '+print(a.objective)+' |',
    '| '+t('Type de plan','Study design')+' | '+print(a.experimental_design)+' |',
    '| '+t('Intention scientifique','Inference intent')+' | '+print(a.intended_inference)+' |',
    '| '+t('Sujets distincts','Distinct subjects')+' | '+print(a.independent_subjects)+' |',
    '| '+t('Groupes déclarés','Declared groups')+' | '+print(result.metadataSummary?.conditions)+' |',
    '| '+t('Statut de la revue','Review status')+' | '+print(a.scientific_assurance_status)+' |',
    '',
    '## '+t('Méthodes exécutées par type de données','Methods actually run for each data type'),
    '',
  ];
  for(const [layer,entry] of Object.entries(result.layers)){
    if(!layerLabel[layer])continue;
    const label=layerLabel[layer][locale==='en'?1:0];
    const audit=a.omics[layer]||{};
    const nrows=Array.isArray(entry?.rows)?entry.rows.length:0;
    h.push('### '+label,'',
      '- '+t('Calcul présenté','Reported calculation')+': '+print(audit.reported_model),
      '- '+t('Données déclarées','Declared value type')+': '+print(audit.declared_value_type),
      '- '+t('Variables avant / après filtrage','Features before / after QC')+': '+print(audit.features_input)+' / '+print(audit.features_after_filter),
      '- '+t('Lignes du tableau exporté','Exported table rows')+': '+nrows,
      '- '+t('Proportion médiane manquante','Median missing fraction')+': '+print(audit.median_missing_fraction),
      '- '+t('Valeur maximale manquante par échantillon','Worst missing fraction per sample')+': '+print(audit.maximum_sample_missing_fraction),
      '- '+t('Moteur R de référence pour cette analyse','R reference method for this analysis')+': '+
           (audit.reference_executed?t('exécuté (sans certification)','executed (not certified)'):
             t('non exécuté','not executed')),
      '- '+t('Contrôle de multiplicité déclaré','Declared multiple-testing policy')+': '+print(audit.fdr_family),
      '',
      t('Le tableau CSV contient toutes les variables renvoyées par le moteur navigateur, sans troncature. Une exécution R de référence, lorsqu’elle existe, est conservée séparément dans analysis_complete.json ; les lignes navigateur ne doivent jamais être attribuées à DESeq2, limma ou mixOmics par défaut.',
        'The CSV contains every feature returned by the browser engine without truncation. When R reference computations exist, they are preserved separately in analysis_complete.json; browser result rows must not be attributed to DESeq2, limma or mixOmics by default.'),
      '');
  }


  if(rPreviews.length){
    h.push('## '+t('Résultats de référence R — exhaustivité vérifiée par méthode',
      'R reference results — per-method completeness'),'',
      t('Les CSV de reference_r/ sont distincts des CSV exploratoires de tableaux/. Les identifiants R originaux sont conservés. Les fichiers R sont destinés à R/Python : un identifiant malveillant peut être interprété comme une formule par un tableur. N’ouvrez pas ces CSV non fiables directement dans Excel.',
        'The reference_r/ CSVs are distinct from exploratory tableaux/ CSVs. Exact original R identifiers are preserved. R CSVs are intended for R/Python; malicious identifiers can execute as spreadsheet formulas, so do not open untrusted R CSVs directly in Excel.'),
      '');
    for(const r of rPreviews)
      h.push('- '+r.method_key+': '+r.status+
        ', '+t('aperçu','preview')+'='+print(r.preview_rows)+
        ', '+t('export complet','complete export')+'='+
        (r.complete_reference_table_exported?t('oui','yes'):t('non','no'))+
        ', '+t('lignes','rows')+'='+print(r.reference_table_rows)+
        ', '+t('état','status')+'='+r.reference_export_status+
        (r.local_archive_id && r.reference_export_status==='too_large_archived_locally'?
          ', '+t('sauvegarde R locale (HORS ZIP)','local R-only archive (NOT IN ZIP)')+
          '='+r.local_archive_id+', SHA-256='+print(r.local_archive_sha256) :
          ''));
    h.push('');
    for(const r of rPreviews.filter(x=>x.paired_design)){
      const design=r.paired_design;
      h.push('**'+r.reported_name+' — '+t('plan apparié réel','actual paired design')+'**',
        '- '+t('Modèle','Model')+': \`'+print(design.design)+'\`',
        '- '+t('Unités biologiques indépendantes','Independent biological units')+': '+print(design.independent_biological_subjects),
        '- '+t('Paires','Pairs')+': '+print(design.biological_pairs),
        '- '+t('Prélèvements ajustés','Fitted samples')+': '+print(design.model_samples),
        '- '+t('Degrés de liberté résiduels','Residual degrees of freedom')+': '+print(design.residual_degrees_of_freedom),
        '- '+t('Contraste (comparaison vs référence)','Contrast (comparison vs reference)')+': '+print(design.contrast),
        '- '+t('Contraste déclaré avant calcul','Contrast declared before fitting')+': '+(design.contrast_was_prespecified?'yes':'no'),
        '- '+t('Certification scientifique automatique','Automatic scientific certification')+': **non / no**','');
    }
    if(rPreviews.some(r=>r.reference_export_status==='too_large_archived_locally'))
      h.push('> '+t('Des résultats R dépassant la limite JSON ont été conservés UNIQUEMENT sur le disque du backend local dans le dossier défini par PMX_MULTIOMICS_RESULTS_DIR. Ils ne sont PAS inclus dans ce ZIP. Récupérer le fichier fitted_reference.csv dans le sous-dossier ID indiqué et vérifier le SHA-256.',
        'Oversized R results were retained ONLY in the R backend operator\'s local PMX_MULTIOMICS_RESULTS_DIR. They are NOT included in this ZIP. Retrieve fitted_reference.csv from the recorded folder ID and verify SHA-256.'),'');
    if(rPreviews.some(r=>r.status==='ok'&&r.preview_rows!==null&&!r.complete_reference_table_exported))
      h.push('> '+t('Certaines analyses R ne disposent que d’un aperçu (ou dépassent la taille de transfert). Conserver leur CSV complet depuis le moteur R local avant toute publication.',
        'Some R analyses have only a preview (or exceed the transfer size limit). Preserve their full CSV from the local R engine before publication.'),'');
  }
  h.push('## '+t('Comprendre les colonnes exportées','Understanding exported columns'),'',
    '| '+t('Colonne','Column')+' | '+t('Définition','Definition')+' |',
    '| --- | --- |',
    '| \`feature\` | '+t('Identifiant de la mesure (valeur exacte dans le JSON).','Measured feature (exact identifier in JSON).')+' |',
    '| \`effect\` / \`effect_scale\` | '+t('Taille d’effet et échelle associée ; le signe dépend du contraste déclaré.','Effect size and associated scale; the sign depends on the declared contrast.')+' |',
    '| \`ci95_low\` / \`ci95_high\` | '+t('Bornes disponibles de l’intervalle, sinon vides.','Interval bounds if available, otherwise blank.')+' |',
    '| \`p_value\` | '+t('p-value du test indiqué, pas la probabilité que l’hypothèse soit vraie.','Reported test p-value, not the probability the hypothesis is true.')+' |',
    '| \`q_value\` | '+t('p-value ajustée pour tests multiples, sans prouver une découverte biologique.','Multiple-testing-adjusted p-value, not proof of a biological discovery.')+' |',
    '| \`n\` / \`n_reference\` / \`n_comparison\` | '+t('Observations contribuant au calcul : ne pas confondre avec les sujets indépendants.','Contributing observations: do not confuse with independent subjects.')+' |',
    '| \`model\` | '+t('Nom de la méthode correspondant à la ligne.','Method name corresponding to the row.')+' |',
    '',
    t('Les CSV sont directement importables dans R ou Python. Vérifier les hypothèses et les limites avant de reprendre les estimations dans un article.',
      'CSV tables can be imported in R or Python. Check assumptions and limitations before citing estimates in a paper.'),
    '');
  h.push('## '+t('Interprétation prudente','Interpretation boundaries'),'',
    '- '+t('Une p-value ou une q-value n’établit ni causalité ni validation biologique. Les comparaisons sont limitées au plan déclaré.',
      'A p-value or q-value does not demonstrate causality or biological validation. Comparisons are limited to the declared study design.'),
    '- '+t('Un résultat exploratoire ne devient pas confirmatoire parce qu’un moteur R est disponible.',
      'Exploratory evidence is not confirmatory solely because R is available.'),
    '- '+t('Les variables dont le nom peut exécuter une formule dans un tableur sont préfixées par une apostrophe dans le CSV ; les identifiants exacts sont préservés dans analysis_complete.json.',
      'Feature names that could execute spreadsheet formulas are prefixed by an apostrophe in CSV; exact names are preserved in analysis_complete.json.'),
    '- '+t('Les valeurs absentes sont des cellules vides, jamais des zéros inventés.',
      'Missing estimates are blank cells, never fabricated zeros.'),
    '- '+t('Les bases de données externes et leurs versions ne peuvent être reproduites que si leurs identifiants et versions sont capturés dans analysis_complete.json.',
      'External database results are only independently reproducible if their identifiers and releases are captured in analysis_complete.json.'),
    '- '+t('Une analyse utilisant un serveur R nécessite également ses versions de packages et son environnement pour un rejeu indépendant.',
      'Analyses using the R backend also require its package versions and environment for independent reruns.'),
    '',
    '## '+t('Organisation du dossier','Folder contents'),'',
    '- `tableaux/*.csv`: '+t('résultats exhaustifs du moteur navigateur','complete browser-engine tables'),
    '- `methods/methods.md`: '+t('ce texte modifiable','this editable text'),
    '- `methods/methods_audit.json`: '+t('méthodes et QC sans matrices brutes','method/QC summary without raw matrices'),
    '- `provenance/analysis_complete.json`: '+t('résultat complet, y compris traces éventuelles du backend R','complete analysis including any R backend trace'),
    '- `source/projet_reproductible.json`: '+t('fichiers originaux et paramètres pour réimport puis recalcul ; ne contient pas de résultat considéré nouveau','original input files and settings for manual rerun; no archived result reused as a new analysis'),
    '- `provenance/manifest.json`: '+t('empreintes SHA-256 des autres fichiers','SHA-256 digests of the other files'),
    '- `verification/verifier_dossier.py`: '+t('script autonome Python 3 de vérification sans internet','offline Python 3 script for independent integrity checks'),
    '',
    t('Le dossier ne constitue pas une certification statistique ni clinique.',
      'This dossier is not a statistical or clinical certification.'),
    ''
  );
  return h.join('\n');
}
let table=null;
function crc32(data){
  if(!table){table=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;table[n]=c>>>0}}
  let crc=0xffffffff;for(const v of data)crc=table[(crc^v)&255]^(crc>>>8);
  return (crc^0xffffffff)>>>0;
}
function u16(view,offset,x){view.setUint16(offset,x,true)}
function u32(view,offset,x){view.setUint32(offset,x>>>0,true)}
/** Stable, standards-compliant uncompressed ZIP with UTF-8 file names;
 * deliberately small-scope to avoid browser supply-chain dependencies. */
export function zipEntries(entries){
  requireThat(Array.isArray(entries)&&entries.length>0&&entries.length<=30,
    'Invalid number of research files');
  const names=new Set(),local=[],central=[];
  let offset=0,sourceBytes=0;
  for(const entry of entries){
    const name=entry?.name;
    requireThat(typeof name==='string'&&/^[A-Za-z0-9._/-]+$/.test(name)&&
      !name.startsWith('/')&&!name.split('/').includes('..')&&!names.has(name),
      'Unsafe or duplicate ZIP member path');
    names.add(name);
    const filename=encoder.encode(name);
    const data=entry.data instanceof Uint8Array?entry.data:encoder.encode(String(entry.data));
    requireThat(filename.length<=65535,'ZIP file name too long');
    sourceBytes+=data.length;
    requireThat(sourceBytes<=MAX_ZIP_BYTES,'Too much research data for browser ZIP; use individual exports');
    const crc=crc32(data),head=new Uint8Array(30+filename.length),v=new DataView(head.buffer);
    u32(v,0,0x04034b50);u16(v,4,20);u16(v,6,UTF8_FLAG);
    u16(v,8,0);u16(v,10,0);u16(v,12,0x0021); // 1980-01-01, ZIP DOS epoch
    u32(v,14,crc);u32(v,18,data.length);u32(v,22,data.length);
    u16(v,26,filename.length);u16(v,28,0);head.set(filename,30);
    local.push(head,data);
    const center=new Uint8Array(46+filename.length),c=new DataView(center.buffer);
    u32(c,0,0x02014b50);u16(c,4,20);u16(c,6,20);
    u16(c,8,UTF8_FLAG);u16(c,10,0);u16(c,12,0);u16(c,14,0x0021);
    u32(c,16,crc);u32(c,20,data.length);u32(c,24,data.length);
    u16(c,28,filename.length);u16(c,30,0);u16(c,32,0);
    u16(c,34,0);u16(c,36,0);u32(c,38,0);u32(c,42,offset);
    center.set(filename,46);central.push(center);
    offset+=head.length+data.length;
    requireThat(offset<0xffffffff,'ZIP size > 4 GiB not supported');
  }
  const centralBytes=central.reduce((sum,x)=>sum+x.length,0);
  const trailer=new Uint8Array(22),e=new DataView(trailer.buffer);
  u32(e,0,0x06054b50);u16(e,4,0);u16(e,6,0);
  u16(e,8,entries.length);u16(e,10,entries.length);
  u32(e,12,centralBytes);u32(e,16,offset);u16(e,20,0);
  return new Blob([...local,...central,trailer],{type:'application/zip'});
}
async function sha256(bytes){
  const result=await globalThis.crypto.subtle.digest('SHA-256',bytes);
  return [...new Uint8Array(result)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
/** PortableProject is constructed from the EXACT original source File objects,
 * keeping any sensitive rows exclusively in the user's downloaded archive. */
export async function buildResearchBundle({result,portableProject,locale='fr'}){
  requireThat(result?.engine&&result?.layers&&result?.protocol,'Missing completed analysis');
  requireThat(portableProject?.format==='pmx-multiomics-portable-project'&&
    portableProject?.schemaVersion===1&&portableProject?.inputs?.metadata,
    'Original study files required (no provenance-free package)');
  requireThat(!portableProject.archivedResult,
    'Bundle source project must not present archived results as a fresh analysis');
  const members=[];
  const add=(name,data)=>members.push({name,data});
  const count={};
  let num=0;
  for(const [layer,entry] of Object.entries(result.layers)){
    requireThat(Object.hasOwn(layerLabel,layer),'Unsupported data layer '+layer);
    requireThat(Array.isArray(entry?.rows),'Missing results table for '+layer);
    count[layer]=entry.rows.length;
    add('tableaux/'+layer+'.csv',fullLayerCsv(entry.rows));
    num++;
  }
  requireThat(num>0,'No analyzable layer');
  const fullR=fullReferenceMethodCsvs(result);
  for(const reference of fullR)add(reference.name,reference.csv);
  add('methods/methods.md',methodsMarkdown(result,locale));
  add('verification/verifier_dossier.py',RESEARCH_DOSSIER_VERIFY_PY);
  add('verification/LISEZ-MOI.txt',RESEARCH_DOSSIER_README);
  add('methods/methods_audit.json',JSON.stringify(buildResearchMethodsManifest(result),null,2)+'\n');
  add('provenance/analysis_complete.json',JSON.stringify(result,null,2)+'\n');
  add('source/projet_reproductible.json',JSON.stringify(portableProject,null,2)+'\n');
  const files={};
  for(const {name,data} of members){
    const bytes=encoder.encode(data);
    files[name]={sha256:await sha256(bytes),bytes:bytes.length};
  }
  const manifest={
    schema:'pmx-multiomics-research-dossier/v1',
    created_at:result.generatedAt||null,
    analysis_engine:result.engine.name,
    analysis_engine_version:result.engine.version,
    ui_language:locale,
    input_file_sha256:Object.fromEntries(
      Object.entries(portableProject.inputs).map(([key,f])=>[key,f.sha256])),
    browser_layer_rows:count,
    reference_method_previews:referencePreviewAudit(result),
    r_reference_full_feature_tables_exported:fullR.length>0,
    r_reference_full_tables:fullR.map(({name,method_key,rows,columns,original_features,excluded_before_fit})=>
      ({name,method_key,rows,columns,original_features,excluded_before_fit})),
    note_on_r_reference:'Only reference_r/*.csv with independently checked row counts are full R method tables. Missing or oversized R methods remain previews and are NOT publication-complete.',

    files,
    inference_scope:'browser exploratory tables; any R backend output is separately recorded in full JSON',
    clinical_validation:false,
    confirmatory_certification:false,
    real_backend_proved_by_this_package:false,
    original_inputs_included:true,
    sensitive_research_data:true,
    provenance_notes:[
      'File SHA-256 values refer to the uncompressed UTF-8 member bytes.',
      'Result CSV spreadsheet protection prefixes potentially executable feature identifiers with a single apostrophe; raw identifiers are unchanged in analysis_complete.json.',
      'All layer features are exported, not only the HTML preview top 50.',
      'Run the included offline Python verifier to check the original files and complete CSV counts; this does not certify statistical validity.',
      'ZIP source project contains exact original uploaded CSV/TSV and parameters, but not a fresh inference when re-imported.',
      'For R reference methods, also archive version-locked backend and package library.',
      'For R reference differential results, obtain full fitted tables separately; the backend currently returns top-frame previews of up to 100 rows, not exhaustive reference tables.',
      'Never publish the bundle publicly without reviewing subjects, assays and patient confidentiality.'
    ]
  };
  add('provenance/manifest.json',JSON.stringify(manifest,null,2)+'\n');
  return {
    filename:'multiomics_dossier_recherche_v1.zip',
    blob:zipEntries(members),
    manifest
  };
}
