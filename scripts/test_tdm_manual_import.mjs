import assert from 'node:assert/strict';
import {parseCsv, validateAndStage} from './import_tdm_manual_catalog.mjs';

const csv = [
  'exam_id;exam_name;source_url;source_updated;discipline;stp_relevant',
  'X1;"Acide valproïque";https://chu-limoges.manuelprelevement.fr/DetailNew.aspx?id=A3693&redirect=home;2026-10-21;Pharmacologie;yes',
  'X2;"Dosage, complexe";https://chu-limoges.manuelprelevement.fr/DetailNew.aspx?id=A3912&redirect=home;2026-10-07;Pharmacologie;review',
  'X3;Analyse non médicamenteuse;https://chu-limoges.manuelprelevement.fr/DetailNew.aspx?id=A1234;2026-10-07;Biochimie;no'
].join('\n');
const rows=parseCsv(csv);
assert.equal(rows.length,3);
assert.equal(rows[1].exam_name,'Dosage, complexe');
const staged=validateAndStage(rows);
assert.equal(staged.publication_allowed,false);
assert.equal(staged.source_authorization_required,true);
assert.equal(staged.summary.total,3);
assert.equal(staged.summary.stp,1);
assert.equal(staged.summary.pending,1);
assert.equal(staged.summary.other,1);
assert.equal(staged.entries.length,2);
assert.ok(staged.entries.every((e) => !('min' in e) && !('max' in e) &&
  e.display_approved === false && e.target_status === 'not_assessed'));

assert.equal(parseCsv('exam_id,exam_name,source_url,source_updated,discipline,stp_relevant\n"A1","Name, value","https://chu-limoges.manuelprelevement.fr/DetailNew.aspx?id=A1",,"Pharmacologie","yes"').length,1);
assert.throws(()=>parseCsv('exam_id;exam_name\nA1'),/Missing required column/);
assert.throws(()=>parseCsv('exam_id;exam_name;source_url;source_updated;discipline;stp_relevant\n"A1'),/Unclosed CSV quotation/);
assert.throws(()=>validateAndStage([rows[0],rows[0]]),/Duplicate examination/);
assert.throws(()=>validateAndStage([{...rows[0],source_url:'http://chu-limoges.manuelprelevement.fr/DetailNew.aspx?id=A3693'}]),/unsafe/);
assert.throws(()=>validateAndStage([{...rows[0],source_url:'https://malicious.example/DetailNew.aspx?id=A3693'}]),/unsafe/);
assert.throws(()=>validateAndStage([{...rows[0],source_url:'https://chu-limoges.manuelprelevement.fr/Laboratory'}]),/unsafe/);
assert.throws(()=>validateAndStage([{...rows[0],stp_relevant:'maybe'}]),/yes\/no\/review/);
console.log('TDM manual authorized CSV staging test passed; no unsourced therapeutic targets emitted.');
