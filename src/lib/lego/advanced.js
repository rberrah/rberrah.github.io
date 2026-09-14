import { ddiMechanisms } from '../tdm/workbenches.js';

export const advancedDefaults = {
  tumor: { growth: 'exponential', t0: 60, kg: 0.001, cap: 300, kill: 0.02, ec50: 1, res: 0 },
  interaction: { mechanism: 'reversible', factor: 0.5, strength: 1, c50: 1, hill: 2, kdeg: 0.02, kinact: 0.1 }
};

/** Parameters stay on the graph nodes, just like ke0 and turnover parameters.
 * @param {any} node @returns {{key:string, unit:string, min:number, max:number}[]}
 */
export function advancedFields(node) {
  const keys = node.kind === 'tumor'
    ? ['t0', 'kg', ...(node.growth === 'exponential' ? [] : ['cap']), 'kill', 'ec50', 'res']
    : node.kind === 'interaction' ? (ddiMechanisms.find(m => m.id === node.mechanism)?.fields ?? []) : [];
  return keys.map(key => ({
    key, unit: ['kg','kill','res','kdeg','kinact'].includes(key) ? '1/h' : ['t0','cap'].includes(key) ? 'mm' : ['ec50','c50'].includes(key) ? 'mg/L' : '-',
    min: ['kg','kill','res','strength','kinact'].includes(key) ? 0 : 0.000001,
    max: key === 'strength' && node.mechanism?.includes('inhibition') ? 1 : 1e6
  }));
}

/** @param {any} node @param {number} cp @param {number} activity */
export function interactionFactor(node, cp, activity) {
  const c = Math.max(0, cp), p = node;
  switch (p.mechanism) {
    case 'factor': return p.factor;
    case 'reversible': return Math.max(0.01, 1 / (1 + c/p.c50));
    case 'inhibition': return Math.max(0.01, 1 - p.strength*c/(p.c50+c));
    case 'hill_inhibition': return Math.max(0.01, 1 - p.strength*Math.pow(c,p.hill)/(Math.pow(p.c50,p.hill)+Math.pow(c,p.hill)));
    case 'induction': return 1 + p.strength*c/(p.c50+c);
    default: return Math.max(0.01, activity);
  }
}

/** @param {any} n @param {number} cp @param {number} state @param {number} time */
export function advancedDerivative(n, cp, state, time) {
  const c = Math.max(0, cp);
  if (n.kind === 'tumor') {
    const size = Math.max(0, state);
    const growth = n.growth === 'logistic' ? 1-size/n.cap : n.growth === 'gompertz' ? Math.log(n.cap/Math.max(size,1e-12)) : 1;
    return n.kg*size*growth - n.kill*c/(n.ec50+c)*Math.exp(-n.res*time)*size;
  }
  if (n.mechanism === 'tdi') return n.kdeg*(1-state)-n.kinact*c/(n.c50+c)*state;
  if (n.mechanism === 'turnover_induction') return n.kdeg*(1+n.strength*c/(n.c50+c)-state);
  return 0;
}

/** One symbolic definition for all four exporters; no user expression is evaluated.
 * @param {any} n @param {string} cp @param {string} state
 * @param {(key:string)=>string} parameter @param {'cpp'|'r'|'mlx'|'nonmem'} lang
 */
export function advancedExpressions(n, cp, state, parameter, lang) {
  const p = parameter, cpp = lang === 'cpp', nm = lang === 'nonmem';
  const call = (/** @type {string} */ name, /** @type {string} */ args) => `${nm ? name.toUpperCase() : name}(${args})`;
  const max = (/** @type {string} */ a, /** @type {string} */ b) => call(cpp ? 'fmax' : 'max', a + ',' + b);
  const pow = (/** @type {string} */ a) => cpp ? `pow(${a},${p('hill')})` : `(${a})${nm ? '**' : '^'}${p('hill')}`;
  const c = max('0.0', cp), time = cpp ? 'SOLVERTIME' : nm ? 'T' : 't';
  if (n.kind === 'tumor') {
    const size = max('0.0', state);
    const growth = n.growth === 'logistic' ? `*(1-${size}/${p('cap')})` : n.growth === 'gompertz' ? `*${call('log',p('cap')+'/'+max('1e-12',size))}` : '';
    return { initial: p('t0'), derivative: `${p('kg')}*${size}${growth}-${p('kill')}*${c}/(${p('ec50')}+${c})*${call('exp','-'+p('res')+'*'+time)}*${size}`, factor: '1' };
  }
  let factor = '1', derivative = '0';
  switch (n.mechanism) {
    case 'factor': factor = p('factor'); break;
    case 'reversible': factor = `1/(1+${c}/${p('c50')})`; break;
    case 'inhibition': factor = `1-${p('strength')}*${c}/(${p('c50')}+${c})`; break;
    case 'hill_inhibition': factor = `1-${p('strength')}*${pow(c)}/(${pow(p('c50'))}+${pow(c)})`; break;
    case 'induction': factor = `1+${p('strength')}*${c}/(${p('c50')}+${c})`; break;
    case 'tdi': factor = state; derivative = `${p('kdeg')}*(1-${state})-${p('kinact')}*${c}/(${p('c50')}+${c})*${state}`; break;
    case 'turnover_induction': factor = state; derivative = `${p('kdeg')}*(1+${p('strength')}*${c}/(${p('c50')}+${c})-${state})`; break;
  }
  return { initial: '1', derivative, factor: n.mechanism === 'factor' || n.mechanism === 'induction' ? `(${factor})` : max('0.01',factor) };
}

/** Reject missing information links instead of silently replacing a source.
 * @param {any[]} nodes @param {any[]} edges
 */
export function advancedGraphValid(nodes, edges) {
  const mass = (/** @type {any} */ n) => n && !['effect','response','tumor','interaction'].includes(n.kind);
  if (edges.some(e => !mass(nodes.find(n => n.id === e.from)) || (e.to !== 'OUT' && !mass(nodes.find(n => n.id === e.to))))) return false;
  return nodes.filter(n => !mass(n)).every(n => {
    const source = nodes.find(s => s.id === n.source);
    if (!source || source.id === n.id || !['central','periph','metab','effect'].includes(source.kind)) return false;
    // Ce -> Ce chains must not contain an algebraic/source cycle.
    const visited = new Set([n.id]);
    let upstream = source;
    while (upstream?.kind === 'effect') {
      if (visited.has(upstream.id)) return false;
      visited.add(upstream.id); upstream = nodes.find(s => s.id === upstream.source);
    }
    if (n.kind === 'tumor' && !['exponential','logistic','gompertz'].includes(n.growth)) return false;
    if (n.kind === 'interaction' && (!ddiMechanisms.some(m => m.id === n.mechanism) || !edges.some(e => e.from === n.targetFrom && e.to === n.targetTo))) return false;
    return advancedFields(n).every(f => Number.isFinite(n[f.key]) && n[f.key] >= f.min && n[f.key] <= f.max);
  });
}
