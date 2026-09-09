// @ts-nocheck
const SPEC_MARKER = /^[ \t]*(?:;|\/\/)\s*PK_LEGO_SPEC_V1:(.+)$/m;
const NUMBER = '-?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?';

export class MlxtranImportError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

const cleanName = (value, fallback = 'x') => {
  const name = String(value ?? fallback)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9_]/g, '_').replace(/^(?=\d)/, 'c_').slice(0, 32);
  return name || fallback;
};

const splitList = (value) => {
  const text = String(value ?? '').trim().replace(/^\{([\s\S]*)\}$/, '$1');
  const items = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < text.length; index++) {
    if ('{('.includes(text[index])) depth++;
    else if ('})'.includes(text[index])) depth--;
    else if (text[index] === ',' && depth === 0) {
      items.push(text.slice(start, index).trim());
      start = index + 1;
    }
  }
  items.push(text.slice(start).trim());
  return items.filter(Boolean);
};

function parseArguments(raw) {
  const named = new Map();
  const positional = [];
  for (const item of splitList(raw)) {
    const match = item.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);
    if (match) named.set(match[1].toLowerCase(), match[2].trim());
    else positional.push(item);
  }
  return { named, positional };
}

function argument(args, ...names) {
  for (const name of names) {
    if (args.named.has(name.toLowerCase())) return args.named.get(name.toLowerCase());
  }
  const wanted = new Set(names.map((name) => name.toLowerCase()));
  return args.positional.find((item) => wanted.has(item.trim().toLowerCase()));
}

function calls(code, names) {
  const matcher = new RegExp(`\\b(${names.join('|')})\\s*\\(`, 'gi');
  const output = [];
  let match;
  while ((match = matcher.exec(code))) {
    const start = matcher.lastIndex;
    let end = start;
    let depth = 1;
    for (; end < code.length && depth; end++) {
      if (code[end] === '(') depth++;
      else if (code[end] === ')') depth--;
    }
    if (depth) throw new MlxtranImportError('unsupportedStructure');
    output.push({ name: match[1].toLowerCase(), args: parseArguments(code.slice(start, end - 1)) });
    matcher.lastIndex = end;
  }
  return output;
}

function collectNumericHints(raw) {
  const hints = new Map();
  const remember = (name, value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return;
    const key = name.toLowerCase();
    hints.set(key, number);
    hints.set(key.replace(/_pop$/, ''), number);
  };
  for (const match of raw.matchAll(new RegExp(`^\\s*;\\s*([A-Za-z_]\\w*)\\s*=\\s*(${NUMBER})`, 'gim'))) remember(match[1], match[2]);
  for (const match of raw.matchAll(new RegExp(`\\b([A-Za-z_]\\w*)\\s*=\\s*\\{\\s*value\\s*=\\s*(${NUMBER})`, 'gi'))) remember(match[1], match[2]);
  return hints;
}

function defaultValue(name) {
  const key = String(name ?? '').toLowerCase();
  if (/^(v|v\d|vc|vp)/.test(key)) return 30;
  if (/^(cl|clearance)/.test(key)) return 5;
  if (/^q/.test(key)) return 3;
  if (/^(ka|ktr)/.test(key)) return 1;
  if (/^(tk0|duration)/.test(key)) return 1;
  if (/^tlag/.test(key)) return 0;
  if (/^(f|p)$/.test(key)) return 1;
  if (/^vm/.test(key)) return 10;
  if (/^km/.test(key)) return 10;
  if (/^ke0/.test(key)) return 0.4;
  return 0.2;
}

function modelBuilder(raw) {
  const hints = collectNumericHints(raw);
  const missing = new Set();
  const nodes = [];
  const edges = [];
  const targets = new Map();
  let nextId = 1;

  const value = (expression, fallback) => {
    const text = String(expression ?? '').trim().replace(/^\((.*)\)$/, '$1');
    const direct = Number(text);
    if (Number.isFinite(direct)) return direct;
    if (/^1\s*-\s*[A-Za-z_]\w*$/.test(text)) return 1 - value(text.replace(/^1\s*-\s*/, ''), 0.5);
    if (/^[A-Za-z_]\w*$/.test(text)) {
      const key = text.toLowerCase();
      if (hints.has(key)) return hints.get(key);
      missing.add(text);
      return fallback ?? defaultValue(text);
    }
    const terms = text.replace(/[()]/g, '').split(/([*/])/).map((item) => item.trim()).filter(Boolean);
    if (terms.length > 1) {
      let result = value(terms[0], fallback);
      for (let index = 1; index < terms.length; index += 2) {
        const operand = value(terms[index + 1], defaultValue(terms[index + 1]));
        result = terms[index] === '*' ? result * operand : result / operand;
      }
      if (Number.isFinite(result)) return result;
    }
    missing.add(text);
    return fallback ?? defaultValue(text);
  };

  const addNode = (kind, name, extra = {}) => {
    const id = nextId++;
    const index = nodes.length;
    const node = {
      id, kind, name: cleanName(name, `${kind}${id}`),
      x: 35 + (index % 5) * 116, y: 45 + Math.floor(index / 5) * 92,
      dose: 0, inputType: 'bolus', inputDuration: 1, tlag: 0, doseFraction: 100,
      ...extra
    };
    nodes.push(node);
    return node;
  };
  const addEdge = (from, to, extra = {}) => {
    const edge = { from: from.id, to: to === 'OUT' ? 'OUT' : to.id, kinetics: 'first_order', k: 0.2, vmax: 10, km: 10, gamma: 1, eliminationParameterization: 'rate', cl: 5, ...extra };
    edges.push(edge);
    return edge;
  };
  const parameterName = (edge) => {
    const from = cleanName(nodes.find((node) => node.id === edge.from)?.name);
    const to = edge.to === 'OUT' ? 'e' : cleanName(nodes.find((node) => node.id === edge.to)?.name);
    if (edge.kinetics === 'michaelis_menten' || edge.kinetics === 'hill') return `vmax_${from}_${to}`;
    if (edge.to === 'OUT' && edge.eliminationParameterization === 'clearance') return `cl_${from}`;
    return `k_${from}_${to}`;
  };
  const register = (source, target, sign = 1) => {
    if (!source || !target) return;
    const key = source.trim().replace(/_pop$/i, '').toLowerCase();
    const entries = targets.get(key) ?? [];
    if (!entries.some((entry) => entry.target === target && entry.sign === sign)) entries.push({ target, sign });
    targets.set(key, entries);
  };
  const registerExpression = (expression, target) => {
    const parts = String(expression ?? '').replace(/[()]/g, '').split(/([*/])/).map((item) => item.trim()).filter(Boolean);
    let sign = 1;
    for (const part of parts) {
      if (part === '*') continue;
      if (part === '/') { sign = -1; continue; }
      if (/^[A-Za-z_]\w*$/.test(part)) register(part, target, sign);
    }
  };

  return { hints, missing, nodes, edges, targets, value, addNode, addEdge, parameterName, register, registerExpression };
}

function parsePkmodel(raw, builder) {
  const clean = raw.replace(/;.*$/gm, '');
  const match = clean.match(/(?:\{[^}]+\}|[A-Za-z_]\w*)\s*=\s*pkmodel\s*\(([^)]*)\)/i);
  if (!match) return false;
  const args = parseArguments(match[1]);
  const token = (...names) => argument(args, ...names);
  const { addNode, addEdge, parameterName, register, registerExpression, value } = builder;
  const volume = token('V', 'V1', 'Vc') ?? 'V';
  const central = addNode('central', 'central', { vol: value(volume, 30) });
  register(volume, `v_${central.name}`);

  const ka = token('ka');
  const ktr = token('Ktr');
  const mtt = token('Mtt');
  let administration = central;
  if (ktr && mtt) {
    const count = Math.max(1, Math.min(10, Math.round(value(mtt, 2) * value(ktr, 1) - 1)));
    let previous = addNode('transit', 'transit1', { dose: 100 });
    administration = previous;
    for (let index = 2; index <= count; index++) {
      const current = addNode('transit', `transit${index}`);
      const edge = addEdge(previous, current, { k: value(ktr, 1) });
      register(ktr, parameterName(edge));
      previous = current;
    }
    const edge = addEdge(previous, central, { k: value(ka ?? ktr, 1) });
    register(ka ?? ktr, parameterName(edge));
  } else if (ka) {
    const depot = addNode('depot', 'depot', { dose: 100 });
    const edge = addEdge(depot, central, { k: value(ka, 1) });
    register(ka, parameterName(edge));
    administration = depot;
  } else {
    central.dose = 100;
  }
  const tlag = token('Tlag');
  if (tlag) {
    administration.tlag = value(tlag, 0);
    register(tlag, `tlag_${administration.name}`);
  }
  const tk0 = token('Tk0');
  if (tk0) {
    administration.inputType = 'zero_order';
    administration.inputDuration = value(tk0, 1);
    register(tk0, `tk0_${administration.name}`);
  }

  const cl = token('Cl');
  const eliminationRate = token('k');
  const vm = token('Vm', 'Vmax');
  const km = token('Km');
  if (vm && km) {
    const edge = addEdge(central, 'OUT', { kinetics: 'michaelis_menten', vmax: value(vm, 10), km: value(km, 10) });
    register(vm, parameterName(edge));
    register(km, `km_${central.name}_e`);
  } else if (cl) {
    const edge = addEdge(central, 'OUT', { eliminationParameterization: 'clearance', cl: value(cl, 5) });
    register(cl, parameterName(edge));
  } else {
    const edge = addEdge(central, 'OUT', { k: value(eliminationRate ?? 'k', 0.2) });
    register(eliminationRate ?? 'k', parameterName(edge));
  }

  const addPeripheralRates = (number, outward, inward) => {
    if (!outward || !inward) return;
    const peripheral = addNode('periph', `periph${number}`, { vol: 40 });
    const forward = addEdge(central, peripheral, { k: value(outward, 0.1) });
    const backward = addEdge(peripheral, central, { k: value(inward, 0.1) });
    registerExpression(outward, parameterName(forward));
    registerExpression(inward, parameterName(backward));
  };
  addPeripheralRates(1, token('k12'), token('k21'));
  addPeripheralRates(2, token('k13'), token('k31'));

  const clearancePairs = [
    [1, token('Q', 'Q2'), token('V2')],
    [2, token('Q3'), token('V3')]
  ];
  for (const [number, q, peripheralVolume] of clearancePairs) {
    if (!q || !peripheralVolume || builder.nodes.some((node) => node.name === `periph${number}`)) continue;
    const peripheral = addNode('periph', `periph${number}`, { vol: value(peripheralVolume, 40) });
    register(peripheralVolume, `v_${peripheral.name}`);
    const forward = addEdge(central, peripheral, { k: value(q, 3) / central.vol });
    const backward = addEdge(peripheral, central, { k: value(q, 3) / peripheral.vol });
    register(q, parameterName(forward));
    register(q, parameterName(backward));
    register(volume, parameterName(forward), -1);
    register(peripheralVolume, parameterName(backward), -1);
  }

  const ke0 = token('ke0');
  if (ke0) {
    const effect = addNode('effect', 'effect', { ke0: value(ke0, 0.4), source: central.id });
    register(ke0, `ke0_${effect.name}`);
  }
  return true;
}

function parsePiecewise(raw, builder, warnings) {
  const clean = raw.replace(/;.*$/gm, '');
  const macros = calls(clean, ['compartment', 'absorption', 'oral', 'iv', 'depot', 'elimination', 'peripheral', 'transfer']);
  if (!macros.length) return false;
  const { addNode, addEdge, parameterName, register, registerExpression, value } = builder;
  const byCmt = new Map();
  const byAmount = new Map();
  const compartments = macros.filter((macro) => macro.name === 'compartment');
  for (const [index, macro] of compartments.entries()) {
    const cmt = Number(argument(macro.args, 'cmt') ?? index + 1);
    const amount = argument(macro.args, 'amount') ?? (cmt === 1 ? 'central' : `periph${cmt - 1}`);
    const volume = argument(macro.args, 'volume', 'V') ?? (cmt === 1 ? 'V' : `V${cmt}`);
    const node = addNode(cmt === 1 ? 'central' : 'periph', amount, { vol: value(volume, cmt === 1 ? 30 : 40) });
    byCmt.set(cmt, node);
    byAmount.set(String(amount).toLowerCase(), node);
    register(volume, `v_${node.name}`);
  }
  const concentrationEquations = [...clean.matchAll(/^\s*([A-Za-z_]\w*)\s*=\s*([A-Za-z_]\w*)\s*\/\s*([A-Za-z_]\w*)\s*$/gm)];
  for (const equation of concentrationEquations) {
    if (byAmount.has(equation[2].toLowerCase())) continue;
    // A parameter ratio (e.g. response_0 = kin/kout) is not a concentration.
    if (!new RegExp(`\\bddt_${equation[2]}\\s*=`, 'i').test(clean)) continue;
    const node = addNode(builder.nodes.length ? 'metab' : 'central', equation[2], { vol: value(equation[3], 30) });
    byAmount.set(equation[2].toLowerCase(), node);
    if (!byCmt.size) byCmt.set(1, node);
    register(equation[3], `v_${node.name}`);
  }
  for (const equation of clean.matchAll(/^\s*ddt_([A-Za-z_]\w*)\s*=/gm)) {
    const name = equation[1];
    if (byAmount.has(name.toLowerCase())) continue;
    const node = addNode('depot', name);
    byAmount.set(name.toLowerCase(), node);
  }
  if (/\bddt_/.test(clean)) {
    addNamedGraph(builder, builder.hints);
    recoverNamedNodeTypes(builder, clean, builder.hints);
  }
  if (!byCmt.size) {
    const central = addNode('central', 'central', { vol: 30 });
    byCmt.set(1, central);
  }

  const administrations = macros.filter((macro) => ['absorption', 'oral', 'iv', 'depot'].includes(macro.name));
  const administrationIds = [...new Set(administrations.map((macro) => Number(argument(macro.args, 'adm') ?? 1)))];
  const selectedAdministration = administrationIds[0] ?? 1;
  if (administrationIds.length > 1) warnings.push({ code: 'multipleAdministrations', detail: String(selectedAdministration) });
  const doseNodes = [];
  const fractionSources = new Map();
  const lagSources = new Map();
  const doseMacros = [];
  for (const [index, macro] of administrations.filter((item) => Number(argument(item.args, 'adm') ?? 1) === selectedAdministration).entries()) {
    const cmt = Number(argument(macro.args, 'cmt') ?? 1);
    const targetName = argument(macro.args, 'target');
    const target = targetName ? byAmount.get(targetName.toLowerCase()) : byCmt.get(cmt);
    if (!target) continue;
    const ka = argument(macro.args, 'ka');
    const tk0 = argument(macro.args, 'Tk0');
    const tlag = argument(macro.args, 'Tlag');
    const fraction = argument(macro.args, 'p', 'F')?.replace(/^\((.*)\)$/, '$1');
    let dosed = target;
    // depot(target=...) administers into an existing state, without an extra compartment.
    if ((macro.name === 'absorption' || macro.name === 'oral') && ka) {
      dosed = addNode('depot', `depot${index + 1}`, { dose: 100, tlag: value(tlag, 0) });
      const edge = addEdge(dosed, target, { k: value(ka ?? 'ka', 1) });
      register(ka ?? 'ka', parameterName(edge));
    } else {
      target.dose = 100;
      target.tlag = value(tlag, 0);
      if (tk0) {
        target.inputType = 'zero_order';
        target.inputDuration = value(tk0, 1);
        register(tk0, `tk0_${target.name}`);
      }
    }
    if (tlag) register(tlag, `tlag_${dosed.name}`);
    dosed.doseFraction = 100 * value(fraction ?? '1', 1);
    if (fraction && /^[A-Za-z_]\w*$/.test(fraction)) {
      fractionSources.set(fraction.toLowerCase(), dosed);
      register(fraction, `f_${dosed.name}`);
    }
    if (tlag) lagSources.set(tlag.toLowerCase(), dosed);
    doseMacros.push({ node: dosed, fraction, tk0 });
    doseNodes.push(dosed);
  }
  for (const { node, fraction, tk0 } of doseMacros) {
    const complement = fraction?.match(/^1\s*-\s*([A-Za-z_]\w*)$/);
    const fractionSource = complement && fractionSources.get(complement[1].toLowerCase());
    if (fractionSource) node.fractionComplementOf = fractionSource.id;
    const lagSource = tk0 && lagSources.get(tk0.toLowerCase());
    if (lagSource) {
      node.inputDurationTlagOf = lagSource.id;
      const targets = builder.targets.get(tk0.toLowerCase()) ?? [];
      builder.targets.set(tk0.toLowerCase(), targets.filter((target) => target.target !== `tk0_${node.name}`));
    }
  }
  if (doseNodes.length > 1) {
    const total = doseNodes.reduce((sum, node) => sum + node.doseFraction, 0) || doseNodes.length;
    for (const node of doseNodes) node.doseFraction = 100 * node.doseFraction / total;
  } else if (doseNodes[0]?.doseFraction < 99.999) {
    warnings.push({ code: 'bioavailabilityNotTransferred' });
    doseNodes[0].doseFraction = 100;
  }

  let peripheralNumber = 1;
  for (const macro of macros.filter((item) => item.name === 'peripheral')) {
    const central = byCmt.get(Number(argument(macro.args, 'from', 'cmt') ?? 1)) ?? byCmt.get(1);
    if (!central) continue;
    const outward = argument(macro.args, 'k12', `k1${peripheralNumber + 1}`);
    const inward = argument(macro.args, 'k21', `k${peripheralNumber + 1}1`);
    if (!outward || !inward) continue;
    const peripheral = addNode('periph', `periph${peripheralNumber++}`, { vol: 40 });
    const forward = addEdge(central, peripheral, { k: value(outward, 0.1) });
    const backward = addEdge(peripheral, central, { k: value(inward, 0.1) });
    registerExpression(outward, parameterName(forward));
    registerExpression(inward, parameterName(backward));
  }
  for (const macro of macros.filter((item) => item.name === 'transfer')) {
    const from = byCmt.get(Number(argument(macro.args, 'from')));
    const to = byCmt.get(Number(argument(macro.args, 'to')));
    const rate = argument(macro.args, 'kt', 'k');
    if (!from || !to || !rate) continue;
    const edge = addEdge(from, to, { k: value(rate, 0.1) });
    registerExpression(rate, parameterName(edge));
  }
  for (const macro of macros.filter((item) => item.name === 'elimination')) {
    const source = byCmt.get(Number(argument(macro.args, 'cmt') ?? 1));
    if (!source) continue;
    const cl = argument(macro.args, 'Cl');
    const rate = argument(macro.args, 'k');
    const vm = argument(macro.args, 'Vm', 'Vmax');
    const km = argument(macro.args, 'Km');
    if (vm && km) {
      const edge = addEdge(source, 'OUT', { kinetics: 'michaelis_menten', vmax: value(vm, 10), km: value(km, 10) });
      register(vm, parameterName(edge));
      register(km, `km_${source.name}_e`);
    } else if (cl) {
      const edge = addEdge(source, 'OUT', { eliminationParameterization: 'clearance', cl: value(cl, 5) });
      register(cl, parameterName(edge));
    } else if (rate) {
      const edge = addEdge(source, 'OUT', { k: value(rate, 0.2) });
      register(rate, parameterName(edge));
    }
  }
  return builder.edges.length > 0;
}

function balancedDefinitions(raw) {
  const definitions = [];
  const matcher = /\b([A-Za-z_]\w*)\s*=\s*\{/g;
  let match;
  while ((match = matcher.exec(raw))) {
    let depth = 1;
    let index = matcher.lastIndex;
    for (; index < raw.length && depth; index++) {
      if (raw[index] === '{') depth++;
      else if (raw[index] === '}') depth--;
    }
    if (!depth) definitions.push({ name: match[1], body: raw.slice(matcher.lastIndex, index - 1) });
    matcher.lastIndex = index;
  }
  return definitions;
}

function definitionField(body, field) {
  const match = new RegExp(`\\b${field}\\s*=\\s*`, 'i').exec(body);
  if (!match) return null;
  const start = match.index + match[0].length;
  if (body[start] !== '{') return body.slice(start).match(/^[^,}\r\n]+/)?.[0]?.trim() ?? null;
  let depth = 0;
  for (let index = start; index < body.length; index++) {
    if (body[index] === '{') depth++;
    else if (body[index] === '}' && --depth === 0) return body.slice(start, index + 1);
  }
  return null;
}

function defaultCovariateReference(name, builder) {
  const key = String(name).toLowerCase();
  for (const candidate of [key, `${key}_ref`, `ref_${key}`]) {
    if (builder.hints.has(candidate)) return builder.hints.get(candidate);
  }
  if (/^(wt|weight|bw|bodyweight)$/.test(key)) return 70;
  if (/^(age)$/.test(key)) return 50;
  return 1;
}

function parseCovariates(raw, builder, warnings) {
  const transformed = new Map();
  for (const match of raw.matchAll(new RegExp(`\\b([A-Za-z_]\\w*)\\s*=\\s*log\\(\\s*([A-Za-z_]\\w*)\\s*\\/\\s*([A-Za-z_]\\w*|${NUMBER})\\s*\\)`, 'gi'))) {
    transformed.set(match[1].toLowerCase(), { name: match[2], reference: builder.value(match[3], 1), exact: true });
  }
  for (const match of raw.matchAll(new RegExp(`\\b([A-Za-z_]\\w*)\\s*=\\s*([A-Za-z_]\\w*)\\s*\\/\\s*([A-Za-z_]\\w*|${NUMBER})`, 'gi'))) {
    if (!transformed.has(match[1].toLowerCase())) transformed.set(match[1].toLowerCase(), { name: match[2], reference: builder.value(match[3], 1), exact: false });
  }
  for (const match of raw.matchAll(new RegExp(`\\b([A-Za-z_]\\w*)\\s*=\\s*\\(?\\s*([A-Za-z_]\\w*)\\s*-\\s*([A-Za-z_]\\w*|${NUMBER})\\s*\\)?\\s*\\/\\s*([A-Za-z_]\\w*|${NUMBER})`, 'gi'))) {
    if (!transformed.has(match[1].toLowerCase())) transformed.set(match[1].toLowerCase(), { name: match[2], reference: builder.value(match[3], 1), exact: false });
  }
  const categories = new Map();
  for (const definition of balancedDefinitions(raw)) {
    if (!/type\s*=\s*categorical/i.test(definition.body)) continue;
    const match = definition.body.match(/categories\s*=\s*\{([^}]+)\}/i);
    if (match) categories.set(definition.name.toLowerCase(), splitList(match[1]));
  }
  const output = [];
  const seen = new Set();
  const warnedApproximations = new Set();
  for (const definition of balancedDefinitions(raw)) {
    const covariate = definitionField(definition.body, 'covariate');
    const coefficient = definitionField(definition.body, 'coefficient');
    if (!covariate || !coefficient) continue;
    const covariateTerms = splitList(covariate);
    const coefficientTerms = splitList(coefficient);
    const mappedTargets = builder.targets.get(definition.name.replace(/_pop$/i, '').toLowerCase());
    if (!mappedTargets?.length) {
      warnings.push({ code: 'covariateTargetNotMapped', detail: definition.name });
      continue;
    }
    covariateTerms.forEach((term, index) => {
      const continuous = transformed.get(term.toLowerCase());
      const categoricalValues = categories.get(term.toLowerCase());
      const coefficientTerm = covariateTerms.length === 1 && categoricalValues
        ? coefficient
        : coefficientTerms[index] ?? coefficientTerms.at(-1) ?? '0.2';
      const coefficientNames = coefficientTerm.replace(/[{}]/g, '').split(',').map((item) => item.trim()).filter(Boolean);
      const isCategorical = Boolean(categoricalValues);
      const betaExpression = coefficientNames.find((item) => !/^0(?:\.0+)?$/.test(item)) ?? coefficientNames[0] ?? '0.2';
      const beta = builder.value(betaExpression, isCategorical ? 0.2 : 0.75);
      const name = cleanName(continuous?.name ?? term).toUpperCase().slice(0, 24);
      const reference = continuous?.reference ?? defaultCovariateReference(name, builder);
      const numericCategories = (categoricalValues ?? []).map(Number).filter(Number.isFinite);
      if (categoricalValues?.length > 2) warnings.push({ code: 'categoricalCollapsed', detail: name });
      if (isCategorical && categoricalValues?.length && numericCategories.length !== categoricalValues.length) {
        warnings.push({ code: 'categoricalLabelsMapped', detail: name });
      }
      if (!isCategorical && !continuous?.exact && !warnedApproximations.has(name)) {
        warnings.push({ code: 'covariateFormApproximated', detail: name });
        warnedApproximations.add(name);
      }
      for (const target of mappedTargets) {
        const key = `${name}::${target.target}`;
        if (seen.has(key)) continue;
        seen.add(key);
        output.push({
          name,
          type: isCategorical ? 'categorical' : 'continuous',
          scope: 'patient',
          target: target.target,
          reference: isCategorical ? (numericCategories[0] ?? 0) : reference,
          comparison: isCategorical ? (numericCategories[1] ?? 1) : reference * 1.25,
          beta: beta * target.sign
        });
      }
    });
  }
  return output;
}

function parseStructuralCovariates(raw, builder) {
  const regressors = balancedDefinitions(raw)
    .filter((definition) => /\buse\s*=\s*regressor\b/i.test(definition.body))
    .map((definition) => definition.name);
  const output = [];
  const seen = new Set();
  const normalized = raw.replace(/\\([*^])/g, '$1');
  for (const line of normalized.split(/\r?\n/)) {
    const assignment = line.replace(/;.*$/, '').match(/^\s*([A-Za-z_]\w*)\s*=\s*(.+)$/);
    if (!assignment) continue;
    const targets = builder.targets.get(assignment[1].toLowerCase());
    if (!targets?.length) continue;
    for (const regressor of regressors) {
      const escaped = regressor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const effect = assignment[2].match(new RegExp(`\\(?\\s*${escaped}\\s*\\/\\s*([A-Za-z_]\\w*|${NUMBER})\\s*\\)?(?:\\s*\\^\\s*([A-Za-z_]\\w*|${NUMBER}))?`, 'i'));
      if (!effect) continue;
      const reference = builder.value(effect[1], defaultCovariateReference(regressor, builder));
      const beta = effect[2] ? builder.value(effect[2], 0.75) : 1;
      const name = cleanName(regressor).toUpperCase().slice(0, 24);
      for (const target of targets) {
        const key = `${name}::${target.target}`;
        if (seen.has(key)) continue;
        seen.add(key);
        output.push({
          name,
          type: 'continuous',
          scope: 'patient',
          target: target.target,
          reference,
          comparison: reference * 1.25,
          beta: beta * target.sign
        });
      }
    }
  }
  return output;
}

function validateSource(raw) {
  if (typeof raw !== 'string' || !raw.trim() || raw.length > 200000) throw new MlxtranImportError('emptyOrTooLarge');
}

function embeddedSpec(raw) {
  const marker = raw.match(SPEC_MARKER);
  if (!marker) return null;
  try {
    const spec = JSON.parse(decodeURIComponent(marker[1].trim()));
    if (!spec || !Array.isArray(spec.nodes) || !Array.isArray(spec.edges) || !Array.isArray(spec.covariates)) throw new Error('shape');
    return { spec, mode: 'exact', warnings: [] };
  } catch {
    throw new MlxtranImportError('invalidEmbeddedSpec');
  }
}

export function parseMlxtran(raw) {
  validateSource(raw);
  const exact = embeddedSpec(raw);
  if (exact) return exact;

  const builder = modelBuilder(raw);
  const warnings = [];
  const recognized = parsePkmodel(raw, builder) || parsePiecewise(raw, builder, warnings);
  if (!recognized || !builder.nodes.length || !builder.edges.length) throw new MlxtranImportError('unsupportedStructure');
  const covariates = parseCovariates(raw, builder, warnings);
  const existing = new Set(covariates.map((covariate) => `${covariate.name}::${covariate.target}`));
  for (const covariate of parseStructuralCovariates(raw, builder)) {
    const key = `${covariate.name}::${covariate.target}`;
    if (!existing.has(key)) covariates.push(covariate);
  }
  if (builder.missing.size) warnings.unshift({ code: 'populationDefaults', detail: [...builder.missing].join(', ') });
  if (/\bddt_[A-Za-z_]/i.test(raw)) warnings.push({ code: 'customOdeReview' });
  return {
    spec: { version: 3, nodes: builder.nodes, edges: builder.edges, covariates },
    mode: 'recognized',
    warnings
  };
}

function sourceBlocks(raw, name) {
  const headers = [...raw.matchAll(/^\s*\$([A-Za-z][A-Za-z0-9_]*)\b([^\r\n]*)/gim)];
  return headers.flatMap((header, index) => {
    if (header[1].toLowerCase() !== name.toLowerCase()) return [];
    const end = headers[index + 1]?.index ?? raw.length;
    return [`${header[2]}\n${raw.slice(header.index + header[0].length, end)}`];
  });
}

function normalizeMrgsolveSource(raw) {
  return raw
    .replace(/\u00a0/g, ' ')
    .replace(/\\([_*^])/g, '$1')
    .replace(/([^\r\n])(\$(?:PLUGIN|SET|PARAM|OMEGA|SIGMA|CMT|MAIN|PREAMBLE|GLOBAL|ODE|DES|TABLE|EVENT|CAPTURE|PKMODEL)\b)/gi, '$1\n$2');
}

function rememberValue(values, name, value) {
  const number = Number(value);
  if (name && Number.isFinite(number)) values.set(String(name).toLowerCase(), number);
}

function parseNamedValues(blocks) {
  const values = new Map();
  for (const block of blocks) {
    for (const match of block.matchAll(new RegExp(`\\b([A-Za-z_]\\w*)\\s*(?::|=)\\s*(${NUMBER})(?=\\s*(?::|,|$|\\r?\\n))`, 'gim'))) {
      rememberValue(values, match[1], match[2]);
    }
  }
  return values;
}

function canonicalValues(values) {
  const output = new Map();
  for (const [name, value] of values) {
    const canonical = name.replace(/^tv_/, '').replace(/_pop$/, '');
    if (!output.has(canonical)) output.set(canonical, value);
  }
  return output;
}

function recoverNamedNodeTypes(builder, raw, values) {
  const named = canonicalValues(values);
  const escape = (name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for (const node of builder.nodes) {
    const name = node.name.toLowerCase();
    const effect = named.has(`ke0_${name}`);
    const response = named.has(`kin_${name}`) && named.has(`kout_${name}`);
    if (effect || response) {
      node.kind = effect ? 'effect' : 'response';
      delete node.vol;
      node.dose = 0;
      for (const param of effect ? ['ke0'] : ['kin', 'kout', 'smax', 'sc50']) {
        node[param] = named.get(`${param}_${name}`);
        builder.register(`${param}_${name}`, `${param}_${node.name}`);
      }
      const equation = raw.match(new RegExp(`(?:dxdt_|ddt_)${escape(node.name)}\\s*=([^;\\r\\n]+)`, 'i'))?.[1] ?? '';
      const source = builder.nodes.find((candidate) => candidate !== node && new RegExp(`\\b${escape(candidate.name)}\\b`, 'i').test(equation));
      if (!source) throw new MlxtranImportError('unsupportedStructure');
      node.source = source.id;
    } else if (named.has(`v_${name}`)) {
      node.vol = named.get(`v_${name}`);
      if (node.kind !== 'central') node.kind = /^met(?:ab|_|$)/i.test(name) ? 'metab' : 'periph';
    } else if (builder.edges.some((edge) => edge.from === node.id || edge.to === node.id)) {
      // Only infer volume-free states when the graph uses explicit named parameters.
      if ([...named.keys()].some((key) => key.startsWith('v_'))) {
        node.kind = /^(t|tr|transit)\d+(?:_|$)/i.test(name) ? 'transit' : 'depot';
        delete node.vol;
      }
    }
  }
}

function applyDoseRoutes(builder, routes, values) {
  const named = canonicalValues(values);
  const resolve = (expression, fallback) => {
    const text = String(expression ?? '').trim().replace(/^\((.*)\)$/, '$1');
    const number = Number(text);
    if (text && Number.isFinite(number)) return number;
    if (/^1\s*-/.test(text)) return 1 - resolve(text.replace(/^1\s*-\s*/, ''), 0.5);
    if (named.has(text.toLowerCase())) return named.get(text.toLowerCase());
    if (text) builder.missing.add(text);
    return fallback;
  };
  const clean = (value) => String(value ?? '').replace(/^\((.*)\)$/, '$1').toLowerCase();
  for (const node of builder.nodes) node.dose = 0;
  for (const route of routes) {
    const node = route.node;
    node.dose = 100;
    node.tlag = resolve(route.lag, 0);
    node.doseFraction = resolve(route.fraction ?? '1', 1) * 100;
    node.inputType = route.duration ? 'zero_order' : 'bolus';
    node.inputDuration = resolve(route.duration, 1);
    if (route.lag) builder.register(clean(route.lag), `tlag_${node.name}`);
    if (route.fraction && !clean(route.fraction).startsWith('1-')) builder.register(clean(route.fraction), `f_${node.name}`);
    const complement = clean(route.fraction).match(/^1\s*-\s*([A-Za-z_]\w*)$/);
    const source = complement && routes.find((other) => clean(other.fraction) === complement[1]);
    if (source) node.fractionComplementOf = source.node.id;
    const durationSource = route.duration && routes.find((other) => clean(other.lag) === clean(route.duration));
    if (durationSource) node.inputDurationTlagOf = durationSource.node.id;
    else if (route.duration) builder.register(clean(route.duration), `tk0_${node.name}`);
  }
}

function mrgsolveDoseRoutes(raw, builder, definitions, values) {
  const eventCode = sourceBlocks(raw, 'EVENT').join('\n');
  const router = definitions.find((definition) => definition.name.toUpperCase() === 'LEGO_INPUT');
  if (!router) return;
  const index = definitions.indexOf(router) + 1;
  if (!new RegExp(`\\bCMT\\s*==\\s*${index}\\b`).test(eventCode) || !/F_LEGO_INPUT\s*=\s*0\s*;/.test(raw)) {
    throw new MlxtranImportError('unsupportedStructure');
  }
  const routes = [];
  const constructors = /evt::ev\s+([A-Za-z_]\w*)\s*=\s*evt::(bolus|infuse)\s*\(/g;
  for (const constructor of eventCode.matchAll(constructors)) {
    const start = constructor.index + constructor[0].length;
    let end = start;
    let depth = 1;
    for (; end < eventCode.length && depth; end++) {
      if (eventCode[end] === '(') depth++;
      else if (eventCode[end] === ')') depth--;
    }
    const [amount, cmt, rate] = splitList(eventCode.slice(start, end - 1));
    const definition = definitions[Number(cmt) - 1];
    const node = definition && findNode(builder.nodes, definition.name);
    if (!node || !/^AMT(?:\s*\*|$)/.test(amount)) throw new MlxtranImportError('unsupportedStructure');
    const fraction = amount.replace(/^AMT\s*\*?\s*/, '') || '1';
    const duration = constructor[2] === 'infuse' ? rate?.match(/\/\s*([A-Za-z_]\w*|[\d.]+)\s*$/)?.[1] : undefined;
    if (constructor[2] === 'infuse' && !duration) throw new MlxtranImportError('unsupportedStructure');
    const lag = eventCode.match(new RegExp(`evt::retime\\(\\s*${constructor[1]}\\s*,\\s*TIME\\s*\\+\\s*([A-Za-z_]\\w*|[\\d.]+)\\s*\\)`))?.[1];
    if (!new RegExp(`self\\.push\\(\\s*${constructor[1]}\\s*\\)`).test(eventCode)) throw new MlxtranImportError('unsupportedStructure');
    routes.push({ node, fraction, duration, lag });
  }
  if (!routes.length) throw new MlxtranImportError('unsupportedStructure');
  const input = findNode(builder.nodes, router.name);
  if (builder.edges.some((edge) => edge.from === input.id || edge.to === input.id)) throw new MlxtranImportError('unsupportedStructure');
  builder.nodes.splice(builder.nodes.indexOf(input), 1);
  applyDoseRoutes(builder, routes, values);
}

function knownEntry(values, names) {
  for (const name of names) {
    const key = String(name).toLowerCase();
    for (const candidate of [key, `tv${key}`, `tv_${key}`]) {
      if (values.has(candidate)) return [candidate, values.get(candidate)];
    }
  }
  for (const prefix of ['tv_?', '']) {
    for (const name of names) {
      const key = String(name).toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`^${prefix}${key}_[a-z][a-z0-9_]*$`, 'i');
      for (const entry of values) {
        if (pattern.test(entry[0])) return entry;
      }
    }
  }
  return undefined;
}

function knownValue(values, names) {
  return knownEntry(values, names)?.[1];
}

function expressionValue(expression, values, builder, fallback) {
  const text = String(expression ?? '').trim().replace(/^\((.*)\)$/, '$1');
  const direct = Number(text);
  if (Number.isFinite(direct)) return direct;
  if (values.has(text.toLowerCase())) return values.get(text.toLowerCase());
  const theta = text.match(/^THETA\s*\(\s*(\d+)\s*\)$/i);
  if (theta && values.has(`theta(${theta[1]})`)) return values.get(`theta(${theta[1]})`);
  builder.missing.add(text);
  return fallback;
}

function assignmentTargets(builder, name) {
  const raw = String(name).replace(/^TV_?/i, '');
  for (const candidate of [name, raw, raw.replace(/_pop$/i, '')]) {
    const targets = builder.targets.get(candidate.toLowerCase());
    if (targets?.length) return targets;
  }
  return [];
}

function inputNames(raw, format) {
  const standard = new Set(['id', 'time', 'dv', 'amt', 'evid', 'mdv', 'cmt', 'rate', 'ii', 'addl', 'ss']);
  const names = new Set();
  if (format === 'mrgsolve') {
    for (const block of sourceBlocks(raw, 'PARAM')) {
      if (!/@covariates?\b/i.test(block)) continue;
      for (const match of block.matchAll(/\b([A-Za-z_]\w*)\s*(?::|=)/g)) names.add(match[1].toLowerCase());
    }
  } else {
    for (const block of sourceBlocks(raw, 'INPUT')) {
      for (const match of block.matchAll(/\b([A-Za-z_]\w*)\b/g)) {
        if (!standard.has(match[1].toLowerCase())) names.add(match[1].toLowerCase());
      }
    }
  }
  return names;
}

function codeAssignments(code) {
  return [...code.matchAll(/(?:^|[;\r\n])\s*(?:double\s+)?([A-Za-z_]\w*)\s*=\s*([^;\r\n]+)/gim)]
    .map((match) => ({ name: match[1], expression: match[2].trim() }));
}

function expressionTargets(builder, expression) {
  const output = [];
  for (const match of String(expression).matchAll(/\b([A-Za-z_]\w*)\b/g)) {
    for (const target of assignmentTargets(builder, match[1])) {
      if (!output.some((entry) => entry.target === target.target && entry.sign === target.sign)) output.push(target);
    }
  }
  return output;
}

function parseExpressionCovariates(raw, builder, values, format, warnings) {
  const blocks = format === 'mrgsolve' ? sourceBlocks(raw, 'MAIN') : sourceBlocks(raw, 'PK');
  const allowed = inputNames(raw, format);
  const indicators = new Map();
  const output = [];
  const seen = new Set();
  const approximated = new Set();
  const normalized = blocks.join('\n').replace(/\.EQ\./gi, '==');
  for (const match of normalized.matchAll(/IF\s*\(\s*([A-Za-z_]\w*)\s*==\s*([-+.\deE]+)\s*\)\s*([A-Za-z_]\w*)\s*=\s*1/gi)) {
    indicators.set(match[3].toLowerCase(), { name: match[1], comparison: Number(match[2]) });
  }

  const add = (name, type, reference, comparison, beta, targets, approximate = false) => {
    const clean = cleanName(name).toUpperCase().slice(0, 24);
    if (approximate && !approximated.has(clean)) {
      warnings.push({ code: 'covariateFormApproximated', detail: clean });
      approximated.add(clean);
    }
    for (const target of targets) {
      const key = `${clean}::${target.target}`;
      if (seen.has(key)) continue;
      seen.add(key);
      output.push({
        name: clean,
        type,
        scope: 'patient',
        target: target.target,
        reference,
        comparison,
        beta: beta * target.sign
      });
    }
  };

  for (const assignment of codeAssignments(normalized)) {
    let targets = assignmentTargets(builder, assignment.name);
    if (!targets.length) targets = expressionTargets(builder, assignment.expression);
    if (!targets.length) continue;
    const expression = assignment.expression;

    for (const match of expression.matchAll(new RegExp(`(?:std::)?pow\\s*\\(\\s*([A-Za-z_]\\w*)\\s*\\/\\s*([A-Za-z_]\\w*|${NUMBER})\\s*,\\s*([A-Za-z_]\\w*|${NUMBER})\\s*\\)`, 'gi'))) {
      const reference = expressionValue(match[2], values, builder, defaultCovariateReference(match[1], builder));
      add(match[1], 'continuous', reference, reference * 1.25, expressionValue(match[3], values, builder, 0.75), targets);
    }
    for (const match of expression.matchAll(new RegExp(`\\(\\s*([A-Za-z_]\\w*)\\s*\\/\\s*([A-Za-z_]\\w*|${NUMBER})\\s*\\)\\s*\\*\\*\\s*(THETA\\s*\\(\\s*\\d+\\s*\\)|[A-Za-z_]\\w*|${NUMBER})`, 'gi'))) {
      const reference = expressionValue(match[2], values, builder, defaultCovariateReference(match[1], builder));
      add(match[1], 'continuous', reference, reference * 1.25, expressionValue(match[3], values, builder, 0.75), targets);
    }
    for (const match of expression.matchAll(new RegExp(`exp\\s*\\(\\s*(THETA\\s*\\(\\s*\\d+\\s*\\)|[A-Za-z_]\\w*|${NUMBER})\\s*\\*\\s*\\(?\\s*([A-Za-z_]\\w*)\\s*==\\s*(${NUMBER})\\s*\\)?\\s*\\)`, 'gi'))) {
      add(match[2], 'categorical', 0, Number(match[3]), expressionValue(match[1], values, builder, 0.2), targets);
    }
    for (const match of expression.matchAll(new RegExp(`exp\\s*\\(\\s*(THETA\\s*\\(\\s*\\d+\\s*\\)|[A-Za-z_]\\w*|${NUMBER})\\s*\\*\\s*([A-Za-z_]\\w*)\\s*\\)`, 'gi'))) {
      const indicator = indicators.get(match[2].toLowerCase());
      const covariate = indicator?.name ?? match[2];
      if (!indicator && !allowed.has(covariate.toLowerCase())) continue;
      add(covariate, 'categorical', 0, indicator?.comparison ?? 1, expressionValue(match[1], values, builder, 0.2), targets, !indicator);
    }
    for (const match of expression.matchAll(new RegExp(`(?:std::)?pow\\s*\\(\\s*([A-Za-z_]\\w*|${NUMBER})\\s*,\\s*([A-Za-z_]\\w*)\\s*\\)`, 'gi'))) {
      if (!allowed.has(match[2].toLowerCase())) continue;
      const factor = expressionValue(match[1], values, builder, 1);
      if (factor > 0) add(match[2], 'categorical', 0, 1, Math.log(factor), targets);
    }
  }
  return output;
}

function compartmentDefinitions(raw, format) {
  if (format === 'nonmem') {
    const definitions = [];
    for (const block of sourceBlocks(raw, 'MODEL')) {
      for (const match of block.matchAll(/COMP\s*=\s*\(([^)]+)\)/gi)) {
        const fields = splitList(match[1]);
        definitions.push({ name: fields[0].replace(/["']/g, '').trim(), tags: fields.slice(1).join(' ') });
      }
    }
    return definitions;
  }
  const definitions = [];
  for (const block of sourceBlocks(raw, 'CMT')) {
    for (const line of block.split(/\r?\n/)) {
      const clean = line.replace(/\/\/.*$/, '').trim();
      if (!clean || clean.startsWith('@')) continue;
      const annotated = clean.match(/^([A-Za-z_]\w*)\s*:\s*(.*)$/);
      if (annotated) definitions.push({ name: annotated[1], tags: annotated[2] });
      else for (const token of clean.split(/[\s,]+/).filter((item) => /^[A-Za-z_]\w*$/.test(item))) definitions.push({ name: token, tags: '' });
    }
  }
  if (!definitions.length) {
    for (const match of raw.matchAll(/\bdxdt_([A-Za-z_]\w*)\s*=/gi)) {
      if (!definitions.some((definition) => definition.name.toLowerCase() === match[1].toLowerCase())) {
        definitions.push({ name: match[1], tags: '' });
      }
    }
  }
  if (!definitions.length) {
    const cmt = raw.match(/\$PKMODEL[^\r\n]*\bcmt\s*=\s*["']([^"']+)["']/i);
    if (cmt) for (const name of cmt[1].trim().split(/\s+/)) definitions.push({ name, tags: '' });
  }
  return definitions;
}

function addCompartments(builder, definitions, values) {
  const cleaned = definitions.map((definition) => ({
    ...definition,
    name: cleanName(definition.name.replace(/^C\d+_/i, ''))
  }));
  const explicitCentral = cleaned.find((item) => /OBS|DEFOBS/i.test(item.tags)) ?? cleaned.find((item) => /cent|central/i.test(item.name));
  for (const [index, definition] of cleaned.entries()) {
    const central = definition === explicitCentral || (!explicitCentral && index === 0);
    const transit = !central && /(?:^|_)(?:tr|transit)\d*(?:_|$)/i.test(definition.name);
    const depot = !central && !transit && (/ADM|DEFDOSE/i.test(definition.tags) || /depot|gut|abs/i.test(definition.name));
    const kind = central ? 'central'
      : transit ? 'transit'
        : depot ? 'depot'
        : /metab/i.test(definition.name) ? 'metab' : 'periph';
    const volume = knownValue(values, [`v_${definition.name}`, definition.name === explicitCentral?.name ? 'v' : `v${index + 1}`]);
    builder.addNode(kind, definition.name, {
      ...(kind === 'central' || kind === 'periph' || kind === 'metab' ? { vol: volume ?? (kind === 'central' ? 30 : 40) } : {}),
      dose: depot || /ADM|DEFDOSE/i.test(definition.tags) ? 100 : 0
    });
  }
  const central = builder.nodes.find((node) => node.kind === 'central');
  if (central && !builder.nodes.some((node) => (node.dose ?? 0) > 0)) central.dose = 100;
}

function addTransitGraph(builder, values) {
  const central = builder.nodes.find((node) => node.kind === 'central');
  const depot = builder.nodes.find((node) => node.kind === 'depot');
  const transits = builder.nodes
    .filter((node) => node.kind === 'transit')
    .sort((left, right) => Number(left.name.match(/\d+/)?.[0] ?? 0) - Number(right.name.match(/\d+/)?.[0] ?? 0));
  const rate = knownEntry(values, ['ktr']);
  if (!central || !transits.length || !rate) return;
  if (!depot && !builder.nodes.some((node) => (node.dose ?? 0) > 0)) transits[0].dose = 100;
  const chain = [...(depot ? [depot] : []), ...transits, central];
  for (let index = 0; index < chain.length - 1; index++) {
    if (hasEdge(builder, chain[index], chain[index + 1])) continue;
    const edge = builder.addEdge(chain[index], chain[index + 1], { k: rate[1] });
    builder.register('ktr', builder.parameterName(edge));
    builder.register(rate[0], builder.parameterName(edge));
  }
}

function ensureClassicCompartments(builder, values, oral = false, peripheralCount = 0) {
  if (!builder.nodes.length) {
    if (oral || knownValue(values, ['ka', 'ktr']) !== undefined) builder.addNode('depot', 'depot', { dose: 100 });
    builder.addNode('central', 'central', { vol: knownValue(values, ['v', 'vc', 'v1']) ?? 30, dose: oral ? 0 : 100 });
    for (let index = 1; index <= peripheralCount; index++) builder.addNode('periph', `periph${index}`, { vol: knownValue(values, [`v${index + 1}`, `vp${index === 1 ? '' : index}`]) ?? 40 });
  }
}

function findNode(nodes, token) {
  const wanted = cleanName(token).toLowerCase();
  return nodes.find((node) => cleanName(node.name).toLowerCase() === wanted);
}

function graphEndpoints(suffix, nodes) {
  const names = nodes.map((node) => cleanName(node.name).toLowerCase()).sort((a, b) => b.length - a.length);
  for (const from of names) {
    if (!suffix.startsWith(`${from}_`)) continue;
    const rest = suffix.slice(from.length + 1);
    if (rest === 'e' || rest === 'out') return { from: findNode(nodes, from), to: 'OUT' };
    const to = findNode(nodes, rest);
    if (to) return { from: findNode(nodes, from), to };
  }
  return null;
}

function hasEdge(builder, from, to) {
  return builder.edges.some((edge) => edge.from === from.id && edge.to === (to === 'OUT' ? 'OUT' : to.id));
}

function addNamedGraph(builder, values) {
  const graphValues = new Map();
  for (const [name, value] of values) {
    const canonical = name.replace(/^tv_/, '');
    if (!graphValues.has(canonical)) graphValues.set(canonical, value);
  }
  for (const node of builder.nodes) {
    const name = cleanName(node.name).toLowerCase();
    const volume = graphValues.get(`v_${name}`);
    if (Number.isFinite(volume) && 'vol' in node) node.vol = volume;
    if (Number.isFinite(volume)) builder.register(`v_${name}`, `v_${node.name}`);
  }
  for (const [name, value] of graphValues) {
    const rate = name.match(/^k_(.+)$/);
    const clearance = name.match(/^cl_(.+)$/);
    const vmax = name.match(/^vmax_(.+)$/);
    if (rate) {
      const endpoints = graphEndpoints(rate[1], builder.nodes);
      if (endpoints && !hasEdge(builder, endpoints.from, endpoints.to)) {
        const edge = builder.addEdge(endpoints.from, endpoints.to, { k: value });
        builder.register(name, builder.parameterName(edge));
      }
    } else if (clearance) {
      const from = findNode(builder.nodes, clearance[1]);
      if (from && !hasEdge(builder, from, 'OUT')) {
        const edge = builder.addEdge(from, 'OUT', { eliminationParameterization: 'clearance', cl: value });
        builder.register(name, builder.parameterName(edge));
      }
    } else if (vmax) {
      const endpoints = graphEndpoints(vmax[1], builder.nodes);
      if (endpoints && !hasEdge(builder, endpoints.from, endpoints.to)) {
        const km = graphValues.get(`km_${vmax[1]}`) ?? 10;
        const gamma = graphValues.get(`gamma_${vmax[1]}`);
        const edge = builder.addEdge(endpoints.from, endpoints.to, { kinetics: Number.isFinite(gamma) ? 'hill' : 'michaelis_menten', vmax: value, km, gamma: gamma ?? 1 });
        const suffix = `${endpoints.from.name}_${endpoints.to === 'OUT' ? 'e' : endpoints.to.name}`;
        builder.register(name, builder.parameterName(edge));
        builder.register(`km_${vmax[1]}`, `km_${suffix}`);
        if (Number.isFinite(gamma)) builder.register(`gamma_${vmax[1]}`, `gamma_${suffix}`);
      }
    }
  }
}

function addClassicGraph(builder, values) {
  const central = builder.nodes.find((node) => node.kind === 'central');
  if (!central) return;
  const depot = builder.nodes.find((node) => node.kind === 'depot' || node.kind === 'transit');
  const transits = builder.nodes.filter((node) => node.kind === 'transit');
  const absorption = knownEntry(values, ['ka', 'ktr']);
  if (depot && !transits.length && absorption && !hasEdge(builder, depot, central)) {
    const edge = builder.addEdge(depot, central, { k: absorption[1] });
    builder.register('ka', builder.parameterName(edge));
    builder.register('ktr', builder.parameterName(edge));
    builder.register(absorption[0], builder.parameterName(edge));
  }
  const clearance = knownEntry(values, ['cl', 'clearance']);
  const elimination = knownValue(values, ['kel', 'ke', 'k10']);
  if (!hasEdge(builder, central, 'OUT')) {
    const edge = clearance
      ? builder.addEdge(central, 'OUT', { eliminationParameterization: 'clearance', cl: clearance[1] })
      : builder.addEdge(central, 'OUT', { k: elimination ?? 0.2 });
    builder.register(clearance ? 'cl' : 'kel', builder.parameterName(edge));
    if (clearance) builder.register(clearance[0], builder.parameterName(edge));
    builder.register('k10', builder.parameterName(edge));
  }
  const centralVolumeEntry = knownEntry(values, ['v', 'vc', 'v1']);
  const centralVolume = centralVolumeEntry?.[1] ?? central.vol ?? 30;
  central.vol = centralVolume;
  builder.register('v', `v_${central.name}`);
  builder.register('vc', `v_${central.name}`);
  builder.register('v1', `v_${central.name}`);
  if (centralVolumeEntry) builder.register(centralVolumeEntry[0], `v_${central.name}`);
  const peripherals = builder.nodes.filter((node) => node.kind === 'periph');
  peripherals.forEach((peripheral, index) => {
    const number = index + 2;
    const q = knownEntry(values, [index === 0 ? 'q' : `q${number}`, `q${number}`]);
    if (!q) return;
    const volumeEntry = knownEntry(values, [`v${number}`, index === 0 ? 'vp' : `vp${index + 1}`]);
    const volume = volumeEntry?.[1] ?? peripheral.vol ?? 40;
    peripheral.vol = volume;
    const forward = hasEdge(builder, central, peripheral) ? null : builder.addEdge(central, peripheral, { k: q[1] / centralVolume });
    const backward = hasEdge(builder, peripheral, central) ? null : builder.addEdge(peripheral, central, { k: q[1] / volume });
    builder.register(index === 0 ? 'q' : `q${number}`, forward ? builder.parameterName(forward) : `k_${central.name}_${peripheral.name}`);
    builder.register(index === 0 ? 'q' : `q${number}`, backward ? builder.parameterName(backward) : `k_${peripheral.name}_${central.name}`);
    builder.register(q[0], forward ? builder.parameterName(forward) : `k_${central.name}_${peripheral.name}`);
    builder.register(q[0], backward ? builder.parameterName(backward) : `k_${peripheral.name}_${central.name}`);
    builder.register(`v${number}`, `v_${peripheral.name}`);
    if (volumeEntry) builder.register(volumeEntry[0], `v_${peripheral.name}`);
  });
}

function populateAliases(raw, values, format) {
  const block = sourceBlocks(raw, format === 'mrgsolve' ? 'MAIN' : 'PK').join('\n').replace(/\.EQ\./gi, '==');
  for (let pass = 0; pass < 3; pass++) {
    for (const assignment of codeAssignments(block)) {
      const theta = assignment.expression.match(/THETA\s*\(\s*(\d+)\s*\)/i);
      const identifiers = [...assignment.expression.matchAll(/\b([A-Za-z_]\w*)\b/g)].map((item) => item[1].toLowerCase());
      const value = theta ? values.get(`theta(${theta[1]})`) : identifiers.map((name) => values.get(name)).find(Number.isFinite);
      if (Number.isFinite(value)) values.set(assignment.name.toLowerCase(), value);
    }
  }
}

export function parseMrgsolve(raw) {
  const source = normalizeMrgsolveSource(raw);
  validateSource(source);
  const exact = embeddedSpec(source);
  if (exact) return exact;
  const values = parseNamedValues(sourceBlocks(source, 'PARAM'));
  populateAliases(source, values, 'mrgsolve');
  const builder = modelBuilder(source);
  for (const [name, value] of values) builder.hints.set(name, value);
  const definitions = compartmentDefinitions(source, 'mrgsolve');
  addCompartments(builder, definitions, values);
  ensureClassicCompartments(builder, values, /depot\s*=\s*true/i.test(source));
  addNamedGraph(builder, values);
  if (!builder.edges.length) {
    addTransitGraph(builder, values);
    addClassicGraph(builder, values);
  }
  recoverNamedNodeTypes(builder, source, values);
  mrgsolveDoseRoutes(source, builder, definitions, values);
  if (!builder.nodes.length || !builder.edges.length) throw new MlxtranImportError('unsupportedStructure');
  const warnings = [];
  const covariates = parseExpressionCovariates(source, builder, values, 'mrgsolve', warnings);
  if (builder.missing.size) warnings.unshift({ code: 'populationDefaults', detail: [...builder.missing].join(', ') });
  if (/\{\{[A-Za-z0-9_]+\}\}/.test(source)) warnings.push({ code: 'templatePlaceholdersIgnored' });
  if (/\$ODE\b/i.test(source)) warnings.push({ code: 'customOdeReview' });
  return { spec: { version: 3, nodes: builder.nodes, edges: builder.edges, covariates }, mode: 'recognized', warnings };
}

function parseThetaValues(raw) {
  const values = new Map();
  let index = 0;
  for (const block of sourceBlocks(raw, 'THETA')) {
    for (const line of block.split(/\r?\n/)) {
      const [definition, comment = ''] = line.split(';', 2);
      if (!definition.trim() || definition.trim().startsWith('@')) continue;
      const numbers = [...definition.matchAll(new RegExp(NUMBER, 'gi'))].map((match) => Number(match[0]));
      if (!numbers.length) continue;
      index++;
      const value = definition.includes('(') ? (numbers.length >= 3 ? numbers[1] : numbers.at(-1)) : numbers[0];
      rememberValue(values, `theta(${index})`, value);
      const generated = comment.match(/->[^;]*=\s*([A-Za-z_]\w*)/);
      const label = generated?.[1] ?? comment.match(/\b([A-Za-z_][A-Za-z0-9_]*)\b/)?.[1];
      if (label && !/^theta$/i.test(label)) rememberValue(values, label, value);
    }
  }
  populateAliases(raw, values, 'nonmem');
  return values;
}

export function parseNonmem(raw) {
  validateSource(raw);
  const exact = embeddedSpec(raw);
  if (exact) return exact;
  const values = parseThetaValues(raw);
  const builder = modelBuilder(raw);
  for (const [name, value] of values) builder.hints.set(name, value);
  const advan = Number(raw.match(/\bADVAN\s*(\d+)/i)?.[1] ?? 0);
  const oral = [2, 4, 12].includes(advan);
  const peripheralCount = [3, 4].includes(advan) ? 1 : [11, 12].includes(advan) ? 2 : 0;
  addCompartments(builder, compartmentDefinitions(raw, 'nonmem'), values);
  ensureClassicCompartments(builder, values, oral, peripheralCount);
  addNamedGraph(builder, values);
  const aliases = new Map([...raw.matchAll(/->\s*(P\d+)\s*=\s*([A-Za-z_]\w*)/gi)].map((match) => [match[1].toLowerCase(), match[2]]));
  // Generated NM-TRAN uses indexed parameters/states. Resolve them before reading
  // dose routes, PD equations and covariate effects, just as for named ODEs.
  const namedSource = raw
    .replace(/\b(TV)?P\d+\b/gi, (token) => {
      const name = aliases.get(token.replace(/^TV/i, '').toLowerCase());
      return name ? `${/^TV/i.test(token) ? 'TV_' : ''}${name}` : token;
    })
    .replace(/\bDADT\((\d+)\)/gi, (_, index) => `ddt_${builder.nodes[Number(index) - 1]?.name ?? 'UNKNOWN'}`)
    .replace(/\bA\((\d+)\)/gi, (_, index) => builder.nodes[Number(index) - 1]?.name ?? 'UNKNOWN');
  if (!builder.edges.length) addClassicGraph(builder, values);
  recoverNamedNodeTypes(builder, namedSource, values);
  const pk = sourceBlocks(namedSource, 'PK').join('\n');
  const routes = builder.nodes.flatMap((node, index) => {
    const assignment = (prefix) => pk.match(new RegExp(`^\\s*${prefix}${index + 1}\\s*=([^;\\r\\n]+)`, 'im'))?.[1]?.trim();
    const fraction = assignment('F');
    const lag = assignment('ALAG');
    const duration = assignment('D');
    return node.dose > 0 || fraction || lag || duration ? [{ node, fraction, lag, duration }] : [];
  });
  if (routes.length) applyDoseRoutes(builder, routes, values);
  if (!builder.nodes.length || !builder.edges.length) throw new MlxtranImportError('unsupportedStructure');
  const warnings = [];
  const covariates = parseExpressionCovariates(namedSource, builder, values, 'nonmem', warnings);
  if (builder.missing.size) warnings.unshift({ code: 'populationDefaults', detail: [...builder.missing].join(', ') });
  if (/\$DES\b/i.test(raw)) warnings.push({ code: 'customOdeReview' });
  return { spec: { version: 3, nodes: builder.nodes, edges: builder.edges, covariates }, mode: 'recognized', warnings };
}

export function parseModelCode(raw, format) {
  if (format === 'mrgsolve') return parseMrgsolve(raw);
  if (format === 'nonmem') return parseNonmem(raw);
  return parseMlxtran(raw);
}
