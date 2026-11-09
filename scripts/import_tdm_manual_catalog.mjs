// Usage: node scripts/import_tdm_manual_catalog.mjs <authorized-export.csv> [review-output.json]
// The CHU site is NOT scraped. Only authorised metadata exports can be staged.
// This script never invents numeric therapeutic targets or publishes to static/.
// Header: exam_id;exam_name;source_url;source_updated;discipline;stp_relevant
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const REQUIRED = ['exam_id','exam_name','source_url','source_updated','discipline','stp_relevant'];
const ALLOWED_HOST = 'chu-limoges.manuelprelevement.fr';

export function parseCsv(input) {
  const raw = input.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const firstLine = raw.split('\n',1)[0];
  const delimiter = (firstLine.match(/;/g) ?? []).length > (firstLine.match(/,/g) ?? []).length ? ';' : ',';
  const rows = [];
  let record = [], field = '', quoted = false;
  for (let i=0; i<raw.length; i++) {
    const char=raw[i];
    if (char === '"') {
      if (quoted && raw[i+1] === '"') { field += '"'; i++; }
      else if (quoted || field.length === 0) quoted = !quoted;
      else throw new Error('Unexpected quote in CSV field');
    } else if (!quoted && char === delimiter) { record.push(field); field=''; }
    else if (!quoted && char === '\n') { record.push(field); if (record.some(x=>x.trim())) rows.push(record); record=[]; field=''; }
    else { field+=char; }
  }
  if (quoted) throw new Error('Unclosed CSV quotation');
  record.push(field); if (record.some(x=>x.trim())) rows.push(record);
  const header=(rows.shift() ?? []).map(s=>s.trim().toLowerCase());
  for (const col of REQUIRED) if(!header.includes(col)) throw new Error(`Missing required column ${col}`);
  return rows.map((cells,idx) => {
    if (cells.length !== header.length) throw new Error(`Column count mismatch at CSV row ${idx+2}`);
    return Object.fromEntries(header.map((key,i)=>[key,cells[i].trim()]));
  });
}

export function validateAndStage(rows) {
  const seen=new Set(), candidates=[];
  const tally={total:rows.length, stp:0, other:0, pending:0};
  for (const [idx,row] of rows.entries()) {
    const id=row.exam_id?.trim();
    const label=row.exam_name?.trim();
    if (!id || !label || id.length>128 || label.length>256) throw new Error(`Invalid identifier or label at row ${idx+2}`);
    if (seen.has(id)) throw new Error(`Duplicate examination id ${id}`);
    seen.add(id);
    let url;
    try { url = new URL(row.source_url); } catch { throw new Error(`Invalid source URL for ${id}`); }
    if(url.protocol !== 'https:' || url.hostname !== ALLOWED_HOST || url.username || url.password ||
      !/^\/(?:DetailNew|DocumentNew)\.aspx$/i.test(url.pathname))
      throw new Error(`Unrecognised or unsafe laboratory source URL for ${id}`);
    if(!/^(?:\d{4}-\d\d-\d\d)?$/.test(row.source_updated))
      throw new Error(`Invalid source revision date for ${id}`);
    const relevant=row.stp_relevant.toLowerCase();
    if(!['yes','no','review'].includes(relevant))
      throw new Error(`stp_relevant must be yes/no/review for ${id}`);
    tally[relevant==='yes'?'stp':relevant==='no'?'other':'pending']++;
    // Deliberately omit non-TDM exam records and full clinical instructions from staged export.
    if (relevant==='no') continue;
    candidates.push({
      id, name:label, discipline:row.discipline.slice(0,128),
      source_url:url.href, source_updated:row.source_updated||null,
      source_review: relevant==='yes'?'STP-relevant candidate':'Classification pending',
      target_status:'not_assessed', display_approved:false
    });
  }
  return {
    schema:'pmx-tdm-manual-review-candidates.v1',
    origin:'CHU Limoges catalogue · authorized metadata export',
    source_authorization_required:true,
    publication_allowed:false,
    summary:tally,
    entries:candidates.sort((a,b)=>a.name.localeCompare(b.name,'fr'))
  };
}

async function main() {
  const [, ,input, output='docs/tdm-manual-import-review.json']=process.argv;
  if (!input) throw new Error('Provide an authorized CHU manual CSV metadata export; no remote crawling is performed.');
  const rows=parseCsv(await readFile(input,'utf8'));
  const doc=validateAndStage(rows);
  await writeFile(output,JSON.stringify(doc,null,2)+'\n','utf8');
  console.log(`Staged ${doc.entries.length} STP candidates from ${doc.summary.total} exam records in ${output}; none published and no targets created.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(err=>{console.error(err.message);process.exitCode=1;});
}
