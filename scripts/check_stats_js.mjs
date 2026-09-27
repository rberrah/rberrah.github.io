import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../portal/stats/tool/stats.js', import.meta.url), 'utf8');

// Parse the browser bundle without executing DOM-dependent code.
new vm.Script(source, { filename: 'portal/stats/tool/stats.js' });

const required = [
  'calcWelch', 'calcMannWhitney', 'calcPairedT', 'calcWilcoxon',
  'calcAnova', 'calcKruskal', 'calcCategorical', 'calcCorrelation', 'calcRegression'
];
for (const name of required) {
  if (!source.includes(`function ${name}`)) throw new Error(`Missing Stats method: ${name}`);
}

console.log(`Stats browser engine parses correctly and exposes ${required.length} calculation branches.`);
