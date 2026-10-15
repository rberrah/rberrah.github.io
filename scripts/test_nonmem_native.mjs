import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const command = process.env.NONMEM_COMMAND;
if (!command) {
  console.log('NONMEM_NATIVE_STATUS=not-executed; set NONMEM_COMMAND to a licensed NM-TRAN/NONMEM wrapper.');
  process.exit(0);
}
if (!existsSync('test-results/lego-export-audit.json')) throw new Error('Run scripts/audit_lego_roundtrip.mjs before the native NONMEM harness.');

const cases = JSON.parse(readFileSync('test-results/lego-export-audit.json', 'utf8')).filter((item) => item.format === 'nonmem').slice(0, 3);
const work = mkdtempSync(join(tmpdir(), 'pmx-nonmem-'));
for (const item of cases) {
  const directory = join(work, item.id); mkdirSync(directory);
  const control = join(directory, 'model.ctl'), report = join(directory, 'model.lst');
  writeFileSync(control, item.code);
  writeFileSync(join(directory, 'data.csv'), 'ID,TIME,AMT,EVID,MDV,DV\n1,0,100,1,1,.\n1,1,0,0,0,1\n');
  const [executable, ...prefix] = command.split(/\s+/);
  execFileSync(executable, [...prefix, control, report], { cwd: directory, stdio: 'inherit' });
  if (!existsSync(report)) throw new Error(`${item.id}: NONMEM did not create model.lst`);
  const output = readFileSync(report, 'utf8');
  if (/\b(ERROR|TERMINATED)\b/i.test(output)) throw new Error(`${item.id}: NONMEM report contains an error`);
}
console.log(`NONMEM_NATIVE_STATUS=passed; ${cases.length} licensed runs completed.`);
