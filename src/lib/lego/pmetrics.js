// @ts-nocheck
import { readExpression } from './odeImport.js';

const fail = (detail, code = 'unsupportedEquation') => {
  throw Object.assign(new Error(code), { code, detail });
};
const number = text => {
  const normalized = String(text).trim().replace(/([\d.])[dD]([+-]?\d+)/g, '$1e$2');
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized)) fail(text);
  const value = Number(normalized);
  if (!Number.isFinite(value)) fail(text);
  return value;
};

// Exact ODE forms from LAPKB/Pmetrics R/mod_lib.R. Pmetrics compiles these
// tokens internally; the translator expands them before reading the graph.
const LIBRARY_MODELS = {
  one_comp_iv: 'dX[1] = R[1] - Ke*X[1]',
  one_comp_iv_cl: 'Ke = CL/V\ndX[1] = R[1] - Ke*X[1]',
  one_comp_bolus: 'dX[1] = B[1] - Ka*X[1]\ndX[2] = R[1] + Ka*X[1] - Ke*X[2]',
  one_comp_bolus_cl: 'Ke = CL/V\ndX[1] = B[1] - Ka*X[1]\ndX[2] = R[1] + Ka*X[1] - Ke*X[2]',
  two_comp_iv: 'dX[1] = R[1] - (Ke + K12)*X[1] + K21*X[2]\ndX[2] = K12*X[1] - K21*X[2]',
  two_comp_iv_cl: 'Ke = CL/V1\nK12 = Q/V1\nK21 = Q/V2\ndX[1] = R[1] - (Ke + K12)*X[1] + K21*X[2]\ndX[2] = K12*X[1] - K21*X[2]',
  two_comp_bolus: 'dX[1] = B[1] - Ka*X[1]\ndX[2] = R[1] + Ka*X[1] - (Ke + K23)*X[2] + K32*X[3]\ndX[3] = K23*X[2] - K32*X[3]',
  two_comp_bolus_cl: 'Ke = CL/V2\nK23 = Q/V2\nK32 = Q/V3\ndX[1] = B[1] - Ka*X[1]\ndX[2] = R[1] + Ka*X[1] - (Ke + K23)*X[2] + K32*X[3]\ndX[3] = K23*X[2] - K32*X[3]',
  three_comp_iv: 'dX[1] = R[1] - (Ke + K12 + K13)*X[1] + K21*X[2] + K31*X[3]\ndX[2] = K12*X[1] - K21*X[2]\ndX[3] = K13*X[1] - K31*X[3]',
  three_comp_iv_cl: 'Ke = CL/V1\nK12 = Q2/V1\nK21 = Q2/V2\nK13 = Q3/V1\nK31 = Q3/V3\ndX[1] = R[1] - (Ke + K12 + K13)*X[1] + K21*X[2] + K31*X[3]\ndX[2] = K12*X[1] - K21*X[2]\ndX[3] = K13*X[1] - K31*X[3]',
  three_comp_bolus: 'dX[1] = B[1] - Ka*X[1]\ndX[2] = R[1] + Ka*X[1] - (Ke + K23 + K24)*X[2] + K32*X[3] + K42*X[4]\ndX[3] = K23*X[2] - K32*X[3]\ndX[4] = K24*X[2] - K42*X[4]',
  three_comp_bolus_cl: 'Ke = CL/V2\nK23 = Q3/V2\nK32 = Q3/V3\nK24 = Q4/V2\nK42 = Q4/V4\ndX[1] = B[1] - Ka*X[1]\ndX[2] = R[1] + Ka*X[1] - (Ke + K23 + K24)*X[2] + K32*X[3] + K42*X[4]\ndX[3] = K23*X[2] - K32*X[3]\ndX[4] = K24*X[2] - K42*X[4]'
};

const LIBRARY_ALIASES = {
  advan1: 'one_comp_iv', advan1_trans1: 'one_comp_iv', advan1_trans2: 'one_comp_iv_cl',
  advan2: 'one_comp_bolus', advan2_trans1: 'one_comp_bolus', advan2_trans2: 'one_comp_bolus_cl',
  advan3: 'two_comp_iv', advan3_trans1: 'two_comp_iv', advan3_trans4: 'two_comp_iv_cl',
  advan4: 'two_comp_bolus', advan4_trans1: 'two_comp_bolus', advan4_trans4: 'two_comp_bolus_cl',
  advan11: 'three_comp_iv', advan11_trans1: 'three_comp_iv', advan11_trans4: 'three_comp_iv_cl',
  advan12: 'three_comp_bolus', advan12_trans1: 'three_comp_bolus', advan12_trans4: 'three_comp_bolus_cl'
};

function expandLibraryModel(eqn) {
  const token = eqn.trim().toLowerCase();
  const canonical = LIBRARY_ALIASES[token] ?? token;
  return LIBRARY_MODELS[canonical] ?? eqn;
}

// Detect edits after export so metadata cannot override subsequently edited equations.
export function pmetricsBodyHash(raw) {
  const body = raw.replace(/\r\n/g, '\n').replace(/^\s*#\s*PK_LEGO_(?:SPEC|BODY)_V1:[^\n]*\n?/gm, '').trim();
  let hash = 2166136261;
  for (let i = 0; i < body.length; i++) hash = Math.imul(hash ^ body.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(16);
}

// Read the declarative R subset, never evaluate user-supplied R/JavaScript.
function splitTopLevel(text, separators = ',') {
  const items = [], stack = [];
  let start = 0, quote = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = '';
    } else if (c === '"' || c === "'") quote = c;
    else if ('([{'.includes(c)) stack.push(c);
    else if (')]}'.includes(c)) {
      if ('([{'.indexOf(stack.pop()) !== ')]}'.indexOf(c)) fail('Unbalanced delimiters');
    } else if (!stack.length && separators.includes(c)) {
      items.push(text.slice(start, i).trim()); start = i + 1;
    }
  }
  if (quote || stack.length) fail('Unbalanced delimiters');
  return [...items, text.slice(start).trim()].filter(Boolean);
}

function fields(text) {
  const result = new Map();
  for (const item of splitTopLevel(text)) {
    const match = item.match(/^([A-Za-z_]\w*)\s*=\s*([\s\S]+)$/);
    if (!match || result.has(match[1].toLowerCase())) fail(item);
    result.set(match[1].toLowerCase(), { name: match[1], value: match[2].trim() });
  }
  return result;
}

const unwrapList = text => {
  const match = text.trim().match(/^(?:list|c)\s*\(([\s\S]*)\)$/i);
  if (!match) fail('Expected a literal R list');
  splitTopLevel(match[1]);
  return match[1];
};
const body = text => {
  const match = text.trim().match(/^function\s*\(\s*\)\s*\{([\s\S]*)\}$/i);
  if (!match) fail('Expected function() { ... }');
  splitTopLevel(match[1]);
  return match[1];
};

function blocks(raw) {
  const result = new Map();
  if (/^\s*#pri\w*\s*$/im.test(raw)) {
    let block;
    for (const line of raw.split(/\r?\n/)) {
      const header = line.trim().match(/^#([a-z]+)\s*$/i);
      if (header) {
        const key = header[1].toLowerCase().slice(0, 3);
        block = key === 'dif' ? 'eqn' : key;
        if (result.has(block)) fail(`Duplicate #${header[1]}`);
        result.set(block, '');
      } else if (block && !/^\s*C\s/.test(line)) {
        result.set(block, `${result.get(block)}\n${line.replace(/;.*$|#.*$|\/\/.*$/g, '')}`);
      }
    }
    return { result, format: 'text' };
  }
  const source = raw.replace(/#.*$/gm, '').trim().replace(/^library\s*\(\s*Pmetrics\s*\)\s*;?\s*/i, '');
  // A literal list or a constructor is accepted; arbitrary R scripts are not executed.
  const constructor = source.match(/^(?:\w+\s*(?:<-|=)\s*)?(?:Pmetrics::)?PM_model\$new\s*\(([\s\S]*)\)\s*;?$/i);
  let contents = constructor ? constructor[1].trim() : unwrapList(source.replace(/^\w+\s*(?:<-|=)\s*/, ''));
  if (/^list\s*\(/i.test(contents)) contents = unwrapList(contents);
  for (const [key, entry] of fields(contents)) result.set(key, entry.value);
  return { result, format: 'r' };
}

function primary(block, format) {
  const values = new Map(), defaults = [], ranges = [];
  const add = (name, value) => {
    if (values.has(name.toLowerCase())) fail(`Duplicate parameter: ${name}`);
    values.set(name.toLowerCase(), { name, value });
  };
  if (format === 'text') {
    for (const line of block.split(/\r?\n/).filter(s => s.trim())) {
      const [name, ...parts] = line.replace(/!/g, '').trim().split(/\s*,\s*|\s+/);
      if (!/^[A-Za-z_]\w*$/.test(name) || parts.length > 2) fail(line);
      const numbers = parts.map(number);
      if (!numbers.length) defaults.push(name);
      if (numbers.length === 2 && numbers[1] < numbers[0]) fail(`Invalid range: ${line}`);
      if (numbers.length === 2) ranges.push(name);
      add(name, numbers.length === 2 ? (numbers[0] + numbers[1]) / 2 : numbers[0] ?? 1);
    }
  } else {
    for (const { name, value } of fields(unwrapList(block)).values()) {
      const call = value.match(/^(ab|msd)\s*\(([\s\S]*)\)$/i);
      if (!call) fail(`Unsupported primary definition: ${name}`);
      const args = splitTopLevel(call[2]);
      if (args.length !== 2) fail(value);
      const labels = call[1].toLowerCase() === 'ab' ? ['min', 'max'] : ['mean', 'sd'];
      const slots = [];
      args.forEach((arg, index) => {
        const named = arg.match(/^(\w+)\s*=\s*(.+)$/);
        const slot = named ? labels.indexOf(named[1].toLowerCase()) : index;
        if (slot < 0 || slots[slot] !== undefined) fail(value);
        slots[slot] = number(named ? named[2] : arg);
      });
      const [a, b] = slots;
      if (a === undefined || b === undefined || (labels[0] === 'min' ? b < a : b < 0)) fail(value);
      ranges.push(name);
      add(name, labels[0] === 'min' ? (a + b) / 2 : a);
    }
  }
  return { values, defaults, ranges };
}

function normalizedCode(text) {
  return text.replace(/<-/g, '=').replace(/\*\*/g, '^')
    .replace(/([\d.])[dD]([+-]?\d+)/g, '$1e$2')
    .replace(/\b(XP|DX|X|Y|BOLUS|BOL|B|RATEIV|R|TLAG|LAG|FA)\s*[([]\s*(\d+)\s*[)\]]/gi,
      (_, name, index) => {
        const key = name.toLowerCase();
        const prefix = ['xp', 'dx'].includes(key) ? 'dxdt_PM'
          : key === 'x' ? 'PM' : key === 'y' ? 'Y'
            : ['bolus', 'bol', 'b'].includes(key) ? 'PM_B'
              : ['rateiv', 'r'].includes(key) ? 'PM_R'
                : ['tlag', 'lag'].includes(key) ? 'PM_LAG' : 'PM_FA';
        return `${prefix}${Number(index)}`;
      });
}

function statements(text) {
  return splitTopLevel(normalizedCode(text), '\n;').map(line => {
    const match = line.match(/^([A-Za-z_]\w*)\s*=\s*([^=][\s\S]*)$/);
    if (!match) fail(line);
    readExpression(match[2]);
    return { name: match[1], expression: match[2].trim() };
  });
}

// Only a positive, unscaled dose term can be removed from a continuous ODE.
function withoutInputs(expression, routes, compartment) {
  const visit = (ast, sign = 1) => {
    if (ast.type === 'Identifier' && /^PM_[BR]\d+$/i.test(ast.name)) {
      if (sign !== 1) fail(expression, 'unsupportedAdministration');
      routes.push({ kind: ast.name[3].toUpperCase(), input: Number(ast.name.slice(4)), compartment });
      return '0';
    }
    if (ast.type === 'BinaryExpression' && ['+', '-'].includes(ast.operator))
      return `(${visit(ast.left, sign)} ${ast.operator} ${visit(ast.right, ast.operator === '-' ? -sign : sign)})`;
    if (ast.type === 'UnaryExpression' && ['+', '-'].includes(ast.operator))
      return `${ast.operator}(${visit(ast.argument, ast.operator === '-' ? -sign : sign)})`;
    const render = node => {
      if (node.type === 'Literal' && typeof node.value === 'number') return String(node.value);
      if (node.type === 'Identifier') {
        if (/^PM_[BR]\d+$/i.test(node.name)) fail(expression, 'unsupportedAdministration');
        return node.name;
      }
      if (node.type === 'BinaryExpression') return `(${render(node.left)} ${node.operator} ${render(node.right)})`;
      if (node.type === 'UnaryExpression') return `${node.operator}(${render(node.argument)})`;
      if (node.type === 'CallExpression' && node.callee.type === 'Identifier') return `${node.callee.name}(${node.arguments.map(render).join(',')})`;
      return fail(expression);
    };
    return render(ast);
  };
  return visit(readExpression(expression));
}

/** Normalize Pmetrics structure to the existing, non-executing ODE graph reader. */
export function pmetricsToMrgsolve(raw) {
  const { result: sections, format } = blocks(raw);
  for (const key of sections.keys()) if (!['pri', 'cov', 'sec', 'ini', 'fa', 'lag', 'eqn', 'out', 'err'].includes(key)) fail(`Unsupported block: ${key}`);
  if (!sections.has('pri') || !sections.has('out')) fail('Pmetrics requires PRI and OUT', 'unsupportedStructure');
  const { values, defaults, ranges } = primary(sections.get('pri'), format);
  const get = key => !sections.has(key) ? '' : format === 'r' ? body(sections.get(key)) : sections.get(key);
  const covariates = [];
  if (sections.has('cov')) {
    if (format === 'r') {
      for (const { name, value } of fields(unwrapList(sections.get('cov'))).values()) {
        if (!/^interp\s*\(\s*(?:["'](?:none|lm|linear)["'])?\s*\)$/i.test(value)) fail(value);
        covariates.push(name);
      }
    } else for (const line of sections.get('cov').split(/\r?\n/).filter(s => s.trim())) {
      const match = line.trim().match(/^([A-Za-z_]\w*)!?$/);
      if (!match) fail(line);
      covariates.push(match[1]);
    }
  }
  const unique = new Set([...values.keys(), ...covariates.map(n => n.toLowerCase())]);
  if (unique.size !== values.size + covariates.length) fail('Duplicate parameter/covariate');
  if ([...unique].some(n => /^pm\d+$|^pm_(?:b|r|lag|fa)\d+$|^dxdt_pm\d+$/i.test(n))) fail('Parameter name collides with an internal compartment symbol');
  const sec = statements(get('sec'));
  let eqn = expandLibraryModel(get('eqn').trim());
  // Legacy text files select the conventional algebraic model by parameter names.
  if (!eqn && format === 'text') {
    const names = new Set([...values.keys(), ...sec.map(e => e.name.toLowerCase())]);
    if (!names.has('ke') || !names.has('v') || names.has('kcp') !== names.has('kpc')) fail('Incomplete algebraic model', 'unsupportedStructure');
    const oral = names.has('ka'), central = oral ? 2 : 1, peripheral = central + 1;
    const distribution = names.has('kcp');
    eqn = [
      ...(oral ? ['dX[1] = B[1] - Ka*X[1]'] : []),
      `dX[${central}] = ${oral ? 'Ka*X[1]' : 'B[1]'} + R[1] - Ke*X[${central}]${distribution ? ` - Kcp*X[${central}] + Kpc*X[${peripheral}]` : ''}`,
      ...(distribution ? [`dX[${peripheral}] = Kcp*X[${central}] - Kpc*X[${peripheral}]`] : [])
    ].join('\n');
  }
  if (!eqn) fail('An explicit EQN/DIF block is required', 'unsupportedStructure');
  const equations = statements(eqn), outputs = statements(get('out'));
  const observations = outputs.filter(e => /^Y\d+$/i.test(e.name));
  if (observations.length !== 1 || !/^Y1$/i.test(observations[0].name)) fail('Only one concentration output (Y[1]) is supported');
  const output = observations[0].expression.match(/^PM(\d+)\s*\/\s*([A-Za-z_]\w*)$/i);
  if (!output) fail(`Output must be X[n]/V: ${observations[0].expression}`);
  const observed = Number(output[1]);
  const odes = equations.filter(e => /^dxdt_PM\d+$/i.test(e.name));
  const states = odes.map(e => Number(e.name.match(/\d+$/)[0]));
  if (!states.length || states.length > 20 || new Set(states).size !== states.length || !states.includes(observed) || states.some((n, i) => !states.includes(i + 1))) fail('Invalid compartment indices');
  const routes = [];
  const odeCode = odes.map(e => `${e.name} = ${withoutInputs(e.expression, routes, Number(e.name.match(/\d+$/)[0]))};`);
  // Pmetrics 3 also accepts implicit bolus dosing into compartment 1.
  if (!routes.length) routes.push({ kind: 'B', input: 1, compartment: 1 });
  const seenRoutes = new Set();
  for (const route of routes) {
    const key = `${route.kind}${route.input}`;
    if (route.input < 1 || route.input > 7 || seenRoutes.has(key)) fail('A dose input is mapped more than once', 'unsupportedAdministration');
    seenRoutes.add(key);
  }
  const chosen = routes.find(r => r.kind === 'B') ?? routes[0];
  const dose = chosen.compartment;
  for (const init of statements(get('ini'))) if (!/^PM\d+$/i.test(init.name) || !states.includes(Number(init.name.slice(2))) || number(init.expression) !== 0) fail('Non-zero initial conditions are not supported');
  for (const fa of statements(get('fa'))) if (!/^PM_FA\d+$/i.test(fa.name) || number(fa.expression) !== 1) fail('Non-unit bioavailability', 'unsupportedAdministration');
  const lag = statements(get('lag'));
  if (lag.some(e => e.name.toLowerCase() !== `pm_lag${chosen.input}`)) fail('Lag for an unselected input', 'unsupportedAdministration');
  const assignments = [...sec, ...equations.filter(e => !/^dxdt_PM\d+$/i.test(e.name)), ...outputs.filter(e => !/^Y\d+$/i.test(e.name))];
  const named = new Set();
  for (const entry of assignments) {
    if (named.has(entry.name.toLowerCase()) || unique.has(entry.name.toLowerCase()) || /^PM\d+$|^PM_[BR]\d+$/i.test(entry.name)) fail(`Redefined symbol: ${entry.name}`);
    named.add(entry.name.toLowerCase());
  }
  const code = [
    '$PARAM', ...[...values.values()].map(p => `${p.name} = ${p.value}`),
    ...(covariates.length ? ['$PARAM @covariates', ...covariates.map(n => `${n} = 1`)] : []),
    '$CMT @annotated', ...states.map(i => `PM${i} : ${i === observed ? '[OBS]' : i === dose ? 'depot' : 'peripheral'}${i === dose ? ' [ADM]' : ''}`),
    '$MAIN', ...assignments.map(e => `${e.name} = ${e.expression};`),
    ...lag.map(e => `ALAG_PM${dose} = ${e.expression};`),
    ...(chosen.kind === 'R' ? [`D_PM${dose} = 1;`] : []),
    '$ODE', ...odeCode, '$TABLE', `CONC = PM${observed}/${output[2]};`,
    ...states.filter(i => i !== observed).flatMap(i => {
      const reference = normalizedCode(eqn).match(new RegExp(`\\bPM${i}\\s*/\\s*([A-Za-z_]\\w*)`, 'i'));
      return reference ? [`CONC_PM${i} = PM${i}/${reference[1]};`] : [];
    })
  ].join('\n');
  const warnings = [{ code: 'pmetricsPopulation' }, { code: 'pmetricsDosing', detail: `INPUT=${chosen.input}; X[${dose}]; ${chosen.kind === 'B' ? 'bolus' : 'DUR=1 h (placeholder)'}; dose=100` }];
  if (routes.some(r => r.input !== chosen.input || r.compartment !== dose)) warnings.push({ code: 'multipleAdministrations', detail: `INPUT=${chosen.input}; ${chosen.kind} -> X[${dose}]` });
  if (ranges.length) warnings.push({ code: 'pmetricsRanges', detail: ranges.join(', ') });
  if (defaults.length) warnings.push({ code: 'populationDefaults', detail: defaults.join(', ') });
  if (covariates.length) warnings.push({ code: 'pmetricsCovariates' });
  return { code, warnings, dose, observed };
}

/** Pmetrics 3 R template. No invented search distribution or error equivalence. */
export function exportPmetrics({ spec, parameters, secondary, equations, observed }) {
  const dosed = spec.nodes.filter(n => n.dose > 0);
  if (!observed || !parameters.length) return { code: '', issue: 'pmetricsEmpty' };
  if (dosed.length !== 1 || spec.nodes.some(n => !['central', 'periph', 'depot', 'transit', 'metab'].includes(n.kind)))
    return { code: '', issue: 'pmetricsExportUnsupported' };
  const nodes = [dosed[0], ...spec.nodes.filter(n => n !== dosed[0])];
  const states = new Map(nodes.map((n, index) => [n.name.toLowerCase(), `X[${index + 1}]`]));
  const indexed = expression => expression.replace(/\b[A-Za-z_]\w*\b/g, token => states.get(token.toLowerCase()) ?? token);
  const covariates = [...new Map(spec.covariates.map(c => [c.name.toLowerCase(), c])).values()];
  const residual = spec.population?.residualError;
  const a = residual?.type !== 'proportional' ? Number(residual?.additive ?? 0) : 0;
  const b = residual?.type !== 'additive' ? Number(residual?.proportional ?? 0) : 0;
  const transferableError = !(a > 0 && b > 0);
  const lines = [
    `# PK_LEGO_SPEC_V1:${encodeURIComponent(JSON.stringify(spec))}`,
    '# Structural template for Pmetrics >= 3; review before estimation.',
    '# msd(value, 0) preserves only the current typical parameter value.',
    '# Replace these point ranges with justified search bounds for population fitting.',
    '# Builder OMEGA, correlations and distribution links are NOT Pmetrics priors.',
    '# https://lapkb.github.io/PM_tutorial/models.html',
    `# INPUT=1; AMT=${dosed[0].dose}; DUR=${dosed[0].inputType === 'zero_order' ? dosed[0].inputDuration : 0}. Define the schedule in PM_data.`,
    ...covariates.map(c => `# ${c.name}: reference=${c.reference}; enter values in PM_data.`),
    'library(Pmetrics)',
    'pmetrics_definition <- list(',
    '  pri = list(',
    parameters.map(p => `    TV_${p.name} = msd(${Number(p.value)}, 0)`).join(',\n'),
    '  ),'
  ];
  if (covariates.length) lines.push('  cov = list(', covariates.map(c => `    ${c.name} = interp("none")`).join(',\n'), '  ),');
  lines.push('  sec = function() {', ...secondary.map(line => `    ${line}`), '  },');
  if (dosed[0].tlag > 0) lines.push('  lag = function() {', `    LAG[1] = tlag_${dosed[0].name}`, '  },');
  lines.push('  eqn = function() {');
  nodes.forEach((node, index) => {
    const terms = indexed(equations[node.name]);
    lines.push(`    dX[${index + 1}] = ${index === 0 ? 'B[1] + R[1] + ' : ''}(${terms})`);
  });
  lines.push('  },', '  out = function() {', `    Y[1] = ${states.get(observed.toLowerCase())}/v_${observed}`, '  },');
  if (transferableError) lines.push(`  err = list(proportional(1, c(${a}, ${b}, 0, 0), fixed = TRUE))`);
  else lines.push(
    '  # Builder combined error: sqrt(add^2 + (prop*prediction)^2).',
    '  # This is NOT the Pmetrics polynomial SD add + prop*prediction.',
    '  # Supply a justified Pmetrics assay error before constructing/fitting the model.',
    '  err = NULL'
  );
  lines.push(')', '', '# After reviewing priors, covariate handling, dose data and assay error:', '# model <- PM_model$new(pmetrics_definition)');
  const code = lines.join('\n');
  lines.splice(1, 0, `# PK_LEGO_BODY_V1:${pmetricsBodyHash(code)}`);
  return { code: lines.join('\n'), issue: transferableError ? '' : 'pmetricsCombinedError' };
}
