// @ts-nocheck
import jsep from 'jsep';

jsep.addBinaryOp('^', 11, true);
const literal = (value) => ({type:'Literal', value});
const binary = (operator, left, right) => ({type:'BinaryExpression', operator, left, right});
const one = () => literal(1);
const unsupported = (detail = '') => { const error = new Error('unsupportedEquation'); error.code = 'unsupportedEquation'; error.detail=detail; throw error; };

export function readExpression(text) {
  try {
    return jsep(String(text).replace(/\\([*^])/g, '$1').replace(/\*\*/g, '^').replace(/std::/g, ''));
  } catch { return unsupported(); }
}

function names(ast) {
  if (ast.type === 'Identifier') return [ast.name.toLowerCase()];
  if (ast.type === 'Literal') return [];
  if (ast.type === 'UnaryExpression') return names(ast.argument);
  if (ast.type === 'BinaryExpression') return [...names(ast.left), ...names(ast.right)];
  if (ast.type === 'CallExpression') return ast.arguments.flatMap(names);
  return unsupported();
}

function key(ast) {
  if (ast.type === 'Literal') return String(ast.value);
  if (ast.type === 'Identifier') return ast.name.toLowerCase();
  if (ast.type === 'UnaryExpression') return `${ast.operator}(${key(ast.argument)})`;
  if (ast.type === 'BinaryExpression') {
    const items = [key(ast.left), key(ast.right)];
    if (['*','+'].includes(ast.operator)) items.sort();
    return `(${items.join(ast.operator)})`;
  }
  if (ast.type === 'CallExpression') return `${ast.callee.name.toLowerCase()}(${ast.arguments.map(key).join(',')})`;
  return unsupported();
}

function factors(ast, power = 1, output = new Map()) {
  if (ast.type === 'BinaryExpression' && ['*','/'].includes(ast.operator)) {
    factors(ast.left, power, output); factors(ast.right, ast.operator === '/' ? -power : power, output);
  } else {
    const id = key(ast), previous = output.get(id);
    output.set(id, {ast, power:power + (previous?.power ?? 0)});
  }
  return output;
}

function product(entries) {
  let result = one();
  for (const {ast, power} of entries) {
    if (power === 0 || ast.type === 'Literal' && ast.value === 1) continue;
    result = binary(power > 0 ? '*' : '/', result, Math.abs(power) === 1 ? ast : binary('^', ast, literal(Math.abs(power))));
  }
  return result;
}

function flowKey(ast) {
  return [...factors(ast)].filter(([,f]) => f.power && !(f.ast.type === 'Literal' && f.ast.value === 1))
    .sort(([a],[b]) => a.localeCompare(b)).map(([id,f]) => `${id}:${f.power}`).join('|');
}

// Expand sums and products, but keep saturable denominators intact. Each term is a mass flux.
function terms(ast, budget = {count:0}) {
  if (++budget.count > 4000) return unsupported();
  if (ast.type === 'UnaryExpression') {
    if (!['+','-'].includes(ast.operator)) return unsupported();
    return terms(ast.argument, budget).map(t => ({...t, sign:t.sign * (ast.operator === '-' ? -1 : 1)}));
  }
  if (ast.type === 'BinaryExpression' && ['+','-'].includes(ast.operator)) {
    return [...terms(ast.left, budget), ...terms(ast.right, budget).map(t => ({...t, sign:t.sign * (ast.operator === '-' ? -1 : 1)}))];
  }
  if (ast.type === 'BinaryExpression' && ast.operator === '*') {
    return terms(ast.left, budget).flatMap(a => terms(ast.right, budget).map(b => ({sign:a.sign*b.sign, ast:binary('*',a.ast,b.ast)})));
  }
  if (ast.type === 'BinaryExpression' && ast.operator === '/') {
    return terms(ast.left, budget).map(t => ({...t, ast:binary('/', t.ast, ast.right)}));
  }
  if (ast.type === 'Literal' && ast.value === 0) return [];
  return [{sign:1, ast}];
}

export function equationReader(raw, builder, regressorNames = []) {
  const assignments = new Map();
  const invalid = new Set();
  const regressors = new Set(regressorNames.map(n => n.toLowerCase()));
  const parameterValue = builder.value;
  const references = new Map();
  const covariates = [];
  // Do not treat a conditional assignment as an unconditional population value.
  const markAssignments = text => {
    for (const m of text.matchAll(/\b([A-Za-z_]\w*)\s*(?:[+*/-]?=)(?!=)/g)) invalid.add(m[1].toLowerCase());
  };
  for (const match of raw.matchAll(/\b(?:if|else|while|for)\b/gi)) {
    let pos=match.index+match[0].length;
    while (/\s/.test(raw[pos] ?? '') && pos<raw.length) pos++;
    if (raw[pos]==='(') {
      let depth=1; pos++;
      while (pos<raw.length && depth) { if(raw[pos]==='(') depth++; if(raw[pos]===')') depth--; pos++; }
    }
    while (/\s/.test(raw[pos] ?? '') && pos<raw.length) pos++;
    const start=pos;
    if (raw[pos]==='{') {
      let depth=1; pos++;
      while (pos<raw.length && depth) { if(raw[pos]==='{') depth++; if(raw[pos]==='}') depth--; pos++; }
    } else if (/^then\b/i.test(raw.slice(pos))) {
      pos=raw.toLowerCase().indexOf('endif',pos); if(pos<0) pos=raw.length;
    } else { while(pos<raw.length && !/[;\r\n]/.test(raw[pos])) pos++; }
    markAssignments(raw.slice(start,pos));
  }
  for (const match of raw.matchAll(/(?:^|[;\r\n])\s*(?:double\s+|capture\s+)?([A-Za-z_]\w*)\s*=\s*([^;\r\n]+)/gim)) {
    if (match[2].includes('{') || /^(input|output|table|odeType)$/i.test(match[1])) continue;
    const name=match[1].toLowerCase();
    try {
      const ast=readExpression(match[2]);
      if (assignments.has(name) && key(assignments.get(name))!==key(ast)) invalid.add(name);
      assignments.set(name,ast);
    } catch { invalid.add(name); }
  }
  const resolve = (ast, stop = new Set(), path = [], budget = {count:0}) => {
    if (++budget.count > 10000 || path.length > 32) return unsupported();
    if (ast.type === 'Identifier') {
      const name = ast.name.toLowerCase();
      if (invalid.has(name)) return unsupported(ast.name);
      if (stop.has(name) || regressors.has(name) || !assignments.has(name)) return ast;
      if (path.includes(name)) return unsupported();
      return resolve(assignments.get(name), stop, [...path,name], budget);
    }
    if (ast.type === 'Literal') return ast;
    if (ast.type === 'UnaryExpression') return {...ast, argument:resolve(ast.argument,stop,path,budget)};
    if (ast.type === 'BinaryExpression' && ['+','-','*','/','^','=='].includes(ast.operator)) return {...ast,left:resolve(ast.left,stop,path,budget),right:resolve(ast.right,stop,path,budget)};
    if (ast.type === 'CallExpression' && ast.callee.type === 'Identifier') {
      if (/^(eta|eps)$/i.test(ast.callee.name)) return literal(0);
      if (/^theta$/i.test(ast.callee.name) && ast.arguments.length===1 && ast.arguments[0].type==='Literal') {
        const value=builder.hints.get(`theta(${ast.arguments[0].value})`);
        return Number.isFinite(value) ? literal(value) : unsupported();
      }
      const args = ast.arguments.map(a => resolve(a,stop,path,budget));
      if (ast.callee.name.toLowerCase() === 'pow' && args.length === 2) return binary('^',...args);
      if (['exp','log','sqrt','max','min'].includes(ast.callee.name.toLowerCase())) return {...ast,arguments:args};
    }
    return unsupported();
  };
  const numeric = (ast, overrides = references) => {
    if (ast.type === 'Literal' && typeof ast.value === 'number') return ast.value;
    if (ast.type === 'Identifier') {
      const name = ast.name.toLowerCase();
      if (overrides.has(name)) return overrides.get(name);
      if (builder.strictParameters && !builder.hints.has(name)) return unsupported(ast.name);
      return parameterValue(ast.name, /^(f\d*|fraction)$/i.test(name) ? 0.5 : /hill|gamma/i.test(name) ? 1 : undefined);
    }
    if (ast.type === 'UnaryExpression') return (ast.operator === '-' ? -1 : 1) * numeric(ast.argument,overrides);
    if (ast.type === 'BinaryExpression') {
      const a = numeric(ast.left,overrides), b = numeric(ast.right,overrides);
      return ({'+':()=>a+b,'-':()=>a-b,'*':()=>a*b,'/':()=>a/b,'^':()=>a**b,'==':()=>Number(a===b)}[ast.operator] ?? unsupported)();
    }
    if (ast.type === 'CallExpression') return Math[ast.callee.name.toLowerCase()](...ast.arguments.map(a=>numeric(a,overrides)));
    return unsupported();
  };
  const containsCov = ast => names(ast).some(n=>regressors.has(n));
  const covEffects = (ast, power = 1, output = []) => {
    if (!containsCov(ast)) return output;
    if (ast.type === 'BinaryExpression' && ['*','/'].includes(ast.operator)) {
      covEffects(ast.left,power,output); covEffects(ast.right,ast.operator === '/' ? -power : power,output); return output;
    }
    if (ast.type === 'BinaryExpression' && ast.operator === '^') {
      if (!containsCov(ast.right)) return covEffects(ast.left,power*numeric(ast.right),output);
      if (!containsCov(ast.left) && ast.right.type === 'Identifier' && regressors.has(ast.right.name.toLowerCase())) {
        const factor = numeric(ast.left);
        if (factor <= 0) return unsupported();
        output.push({name:ast.right.name.toUpperCase(),type:'categorical',reference:0,comparison:1,beta:power*Math.log(factor)}); return output;
      }
    }
    if (ast.type === 'Identifier' && regressors.has(ast.name.toLowerCase())) {
      const ref = references.get(ast.name.toLowerCase()) ?? 1;
      output.push({name:ast.name.toUpperCase(),type:'continuous',reference:ref,comparison:ref*1.25,beta:power}); return output;
    }
    if (ast.type==='CallExpression' && ast.callee.name.toLowerCase()==='exp' && ast.arguments.length===1) {
      const parts=[...factors(ast.arguments[0]).values()];
      const indicator=parts.find(f=>f.power===1 && f.ast.type==='BinaryExpression' && f.ast.operator==='==' && f.ast.left.type==='Identifier' && regressors.has(f.ast.left.name.toLowerCase()) && !containsCov(f.ast.right));
      if (indicator && parts.every(f=>f===indicator || !containsCov(f.ast))) {
        const comparison=numeric(indicator.ast.right);
        output.push({name:indicator.ast.left.name.toUpperCase(),type:'categorical',reference:comparison===0?1:0,comparison,beta:power*numeric(product(parts.filter(f=>f!==indicator)))}); return output;
      }
    }
    return unsupported(key(ast));
  };
  // Explicit normalization constants define the reference, including regressors used elsewhere without a ratio.
  const findReferences = (ast) => {
    if (ast.type === 'BinaryExpression') {
      if (ast.operator === '/' && ast.left.type === 'Identifier' && regressors.has(ast.left.name.toLowerCase()) && !containsCov(ast.right)) {
        const ref = numeric(ast.right); if (ref > 0) references.set(ast.left.name.toLowerCase(),ref);
      }
      findReferences(ast.left); findReferences(ast.right);
    } else if (ast.type === 'CallExpression') ast.arguments.forEach(findReferences);
    else if (ast.type === 'UnaryExpression') findReferences(ast.argument);
  };
  for (const ast of assignments.values()) {
    try { findReferences(resolve(ast)); } catch { /* Unused output equations do not define PK references. */ }
  }
  for (const name of regressors) if (!references.has(name)) references.set(name, /^(sex|insj|needle|cyp|st)$/.test(name) ? 0 : builder.hints.get(name) ?? 1);
  const expanded = expression => resolve(typeof expression === 'string' ? readExpression(expression) : expression);
  const value = (expression, fallback = 0) => {
    if (expression == null || expression === '') return fallback;
    const result = numeric(expanded(expression));
    if (!Number.isFinite(result)) return unsupported();
    return result;
  };
  const bind = (expression, target) => {
    const ast = product([...factors(expanded(expression)).values()]);
    const effects = covEffects(ast);
    const refs = new Map(references);
    for (const effect of effects) refs.set(effect.name.toLowerCase(),effect.reference);
    const result = numeric(ast,refs);
    if (!Number.isFinite(result)) return unsupported();
    for (const effect of effects) {
      const previous = covariates.find(c=>c.name===effect.name && c.target===target);
      if (previous) { if (previous.type !== effect.type) return unsupported(); previous.beta += effect.beta; }
      else covariates.push({...effect,scope:'patient',target});
    }
    for (const name of names(ast)) if (!regressors.has(name)) builder.register(name,target);
    if (typeof expression === 'string' && /^\w+$/.test(expression)) builder.register(expression,target);
    return result;
  };
  const assertUnconditional = name => { if (invalid.has(name.toLowerCase())) unsupported(); };
  for (const name of builder.missing) if (assignments.has(name.toLowerCase())) builder.missing.delete(name);
  return {assignments, expanded, numeric, value, bind, covariates, assertUnconditional};
}

export function codeOdeGraph(raw, builder, regressors = []) {
  const reader=equationReader(raw,builder,regressors);
  const volumes=new Map();
  for (const node of builder.nodes) {
    if (!['central','periph','metab'].includes(node.kind)) continue;
    const name=node.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const direct=raw.match(new RegExp(`\\b${name}\\s*\\/\\s*([A-Za-z_]\\w*)\\b`,'i'));
    const volume=direct?.[1] ?? (node.kind==='central' ? 'V' : null);
    if (volume) { volumes.set(node.id,volume); node.vol=reader.bind(volume,`v_${node.name}`); }
  }
  reconstructOdes(raw,builder,reader,volumes);
  builder.odeCovariates=reader.covariates;
  return reader;
}

export function reconstructOdes(raw, builder, reader, volumes = new Map()) {
  const states = new Map(builder.nodes.map(n=>[n.name.toLowerCase(),n]));
  const flows = [];
  const seen = new Set();
  for (const match of raw.matchAll(/\b(?:ddt_|dxdt_)([A-Za-z_]\w*)\s*=\s*([^;\r\n]+)/gi)) {
    reader.assertUnconditional(match[0].split('=')[0].trim());
    const node = states.get(match[1].toLowerCase());
    if (!node || seen.has(node.id)) return unsupported();
    seen.add(node.id);
    for (const term of terms(reader.expanded(match[2]))) flows.push({...term,node,key:flowKey(term.ast)});
  }
  if (!flows.length) return unsupported();
  const positive = flows.filter(f=>f.sign>0);
  for (const loss of flows.filter(f=>f.sign<0)) {
    const gains = positive.filter(f=>f.key===loss.key && !f.used);
    if (gains.length > 1) return unsupported();
    const gain = gains[0]; if (gain) gain.used = true;
    const to = gain?.node ?? 'OUT';
    // Multiple scalar contributions to the same edge need a summed parameter
    // expression, not duplicate Lego parameter names with silently merged betas.
    if (builder.edges.some(e=>e.from===loss.node.id && e.to===(to==='OUT'?'OUT':to.id))) return unsupported(`${loss.node.name} -> ${to==='OUT'?'OUT':to.name}: ${key(loss.ast)}`);
    const state = loss.node.name.toLowerCase();
    const entries = [...factors(loss.ast).values()].filter(f=>f.power);
    const numerator = entries.find(f=>f.power===1 && (f.ast.type==='Identifier' && f.ast.name.toLowerCase()===state || f.ast.type==='BinaryExpression' && f.ast.operator==='^' && f.ast.left.type==='Identifier' && f.ast.left.name.toLowerCase()===state));
    if (!numerator) return unsupported();
    const stateNames = ast => names(ast).filter(n=>states.has(n));
    const denominators = entries.filter(f=>f!==numerator && stateNames(f.ast).length);
    const coefficient = product(entries.filter(f=>f!==numerator && !denominators.includes(f)));
    const suffix = `${loss.node.name}_${to==='OUT'?'e':to.name}`;
    if (!denominators.length && numerator.ast.type==='Identifier') {
      const edge = builder.addEdge(loss.node,to);
      if (to==='OUT' && volumes.has(loss.node.id)) {
        edge.eliminationParameterization='clearance';
        edge.cl=reader.bind(binary('*',coefficient,reader.expanded(volumes.get(loss.node.id))),`cl_${loss.node.name}`);
      } else edge.k=reader.bind(coefficient,`k_${suffix}`);
    } else if (denominators.length===1 && denominators[0].power===-1) {
      const denominator = denominators[0].ast;
      if (denominator.type!=='BinaryExpression' || denominator.operator!=='+') return unsupported();
      const halves=[denominator.left,denominator.right];
      const km=halves.find(a=>!stateNames(a).length), amount=halves.find(a=>stateNames(a).length);
      if (!km || !amount || key(amount)!==key(numerator.ast)) return unsupported();
      const gamma=numerator.ast.type==='Identifier'?one():numerator.ast.right;
      const h=reader.value(gamma);
      if (!(h>0)) return unsupported();
      const edge=builder.addEdge(loss.node,to,{kinetics:numerator.ast.type==='Identifier'?'michaelis_menten':'hill',gamma:h});
      edge.vmax=reader.bind(coefficient,`vmax_${suffix}`);
      edge.km=reader.bind(binary('^',km,binary('/',one(),gamma)),`km_${suffix}`);
      if (h !== 1 && names(km).some(n=>reader.covariates.some(c=>c.name.toLowerCase()===n))) builder.derivedParameters = true;
      if (edge.kinetics==='hill') edge.gamma=reader.bind(gamma,`gamma_${suffix}`);
    } else return unsupported();
  }
  if (positive.some(f=>!f.used) || builder.nodes.some(n=>!seen.has(n.id))) return unsupported();
  return true;
}
