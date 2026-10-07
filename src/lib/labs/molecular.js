// @ts-nocheck

const ids = ['parent-metabolite', 'long-acting', 'saturable', 'enterohepatic', 'tmdd', 'effect-site'];
export const molecularLabIds = ids;

const l = (en, fr) => ({ en, fr });
const parameter = (label, unit, min, max, step) => ({ label, unit, min, max, step });

export const molecularLabs = {
  'parent-metabolite': {
    number: '05', unit: 'h', route: l('IV bolus', 'Bolus IV'),
    title: l('Parent and metabolite', 'Parent et métabolite'),
    summary: l('Follow parent drug as it is eliminated or transformed into a circulating metabolite.', 'Suivre le médicament parent éliminé ou transformé en métabolite circulant.'),
    defaults: { dose: 120, vp: 20, clp: 4, kmet: 0.18, vm: 35, clm: 2.5, end: 48 },
    parameters: {
      dose: parameter(l('Dose', 'Dose'), 'mg', 10, 1000, 10), vp: parameter(l('Parent volume', 'Volume parent'), 'L', 5, 100, 1),
      clp: parameter(l('Parent clearance', 'Clairance parent'), 'L/h', 0.1, 30, 0.1), kmet: parameter(l('Formation rate', 'Vitesse de formation'), '1/h', 0.01, 2, 0.01),
      vm: parameter(l('Metabolite volume', 'Volume metabolite'), 'L', 5, 200, 1), clm: parameter(l('Metabolite clearance', 'Clairance metabolite'), 'L/h', 0.1, 30, 0.1),
      end: parameter(l('Horizon', 'Horizon'), 'h', 12, 168, 1)
    },
    states: ['parent', 'metabolite', 'eliminated', 'auc'], mass: ['parent', 'metabolite', 'eliminated'],
    nodes: [
      { id: 'parent', label: l('Parent', 'Parent'), x: .2, y: .27, color: '#147ea5' },
      { id: 'metabolite', label: l('Metabolite', 'Metabolite'), x: .78, y: .27, color: '#c97532' },
      { id: 'eliminated', label: l('Eliminated', 'Elimine'), x: .5, y: .78, color: '#81758a' }
    ],
    equations: 'dAp/dt = -(CLp/Vp + kmet) Ap\ndAm/dt = kmet Ap - (CLm/Vm) Am\nCp = Ap/Vp ; Cm = Am/Vm',
    question: l('If metabolite formation is faster, what happens to early metabolite exposure?', "Si la formation est plus rapide, que devient l'exposition precoce au metabolite ?"),
    choices: [l('It increases', 'Elle augmente'), l('It is unchanged', 'Elle ne change pas'), l('It decreases', 'Elle diminue')], answer: 0,
    explanation: l('More parent drug is diverted toward the metabolite before parent elimination.', "Une plus grande part du parent est dirigee vers le metabolite avant l'elimination du parent."),
    secondary: l('Metabolite concentration', 'Concentration du métabolite'), secondaryUnit: 'mg/L', related: 'parent-metabolite',
    caveat: l('Formation conserves a 1:1 amount-equivalent; molecular-weight conversion is not represented.', 'La formation conserve un équivalent de quantité 1:1 ; la conversion liée aux masses moléculaires n’est pas représentée.'),
    derivative: (y, p) => {
      const [parent, metabolite] = y, formation = p.kmet * parent, parentElimination = p.clp / p.vp * parent, metaboliteElimination = p.clm / p.vm * metabolite;
      return [-formation - parentElimination, formation - metaboliteElimination, parentElimination + metaboliteElimination, parent / p.vp];
    },
    output: (y, p) => ({ c: y[0] / p.vp, secondary: y[1] / p.vm, flows: { formation: p.kmet * y[0], parentOut: p.clp / p.vp * y[0], metaboliteOut: p.clm / p.vm * y[1] } }),
    edges: [{ from: 'parent', to: 'metabolite', flow: 'formation', label: 'kmet Ap' }, { from: 'parent', to: 'eliminated', flow: 'parentOut', label: 'CLp Cp' }, { from: 'metabolite', to: 'eliminated', flow: 'metaboliteOut', label: 'CLm Cm' }],
    events: p => [{ time: 0, state: 'parent', amount: p.dose }]
  },
  'long-acting': {
    number: '06', unit: 'day', route: l('Long-acting depot', 'Dépôt longue action'),
    title: l('Long-acting depot', 'Dépôt longue action'),
    summary: l('Watch slow release create delayed peaks, accumulation and flip-flop kinetics.', "Observer la libération lente, les pics retardés, l’accumulation et la cinétique flip-flop."),
    defaults: { dose: 300, v: 40, cl: 4, krel: 0.08, tau: 28, count: 3, end: 112 },
    parameters: {
      dose: parameter(l('Dose', 'Dose'), 'mg', 10, 2000, 10), v: parameter(l('Volume', 'Volume'), 'L', 5, 200, 1), cl: parameter(l('Clearance', 'Clairance'), 'L/day', 0.1, 30, 0.1),
      krel: parameter(l('Release rate', 'Vitesse de liberation'), '1/day', 0.005, 1, 0.005), tau: parameter(l('Dosing interval', 'Intervalle'), 'days', 7, 90, 1),
      count: parameter(l('Number of injections', "Nombre d'injections"), '', 1, 8, 1), end: parameter(l('Horizon', 'Horizon'), 'days', 28, 365, 1)
    },
    states: ['depot', 'central', 'eliminated', 'auc'], mass: ['depot', 'central', 'eliminated'],
    nodes: [
      { id: 'depot', label: l('Injection depot', "Depot d'injection"), x: .2, y: .3, color: '#c97532' },
      { id: 'central', label: l('Central', 'Central'), x: .78, y: .3, color: '#147ea5' },
      { id: 'eliminated', label: l('Eliminated', 'Elimine'), x: .78, y: .78, color: '#81758a' }
    ],
    equations: 'dAdep/dt = -krel Adep\ndAc/dt = krel Adep - (CL/V) Ac\nC = Ac/V',
    question: l('If release becomes slower, what happens to the first peak?', 'Si la liberation ralentit, que devient le premier pic ?'),
    choices: [l('Lower and later', 'Plus bas et plus tardif'), l('Unchanged', 'Inchange'), l('Higher and earlier', 'Plus haut et plus precoce')], answer: 0,
    explanation: l('A slower depot input spreads the dose over time. At complete follow-up, linear total exposure remains dose/CL per injection.', "Une entree plus lente etale la dose. Sur un suivi complet, l'exposition totale lineaire reste dose/CL par injection."),
    secondary: l('Amount remaining in depot', 'Quantité restant dans le dépôt'), secondaryUnit: 'mg', related: 'voies-absorption',
    caveat: l('Release is first-order, bioavailability is complete and no initial burst is represented.', 'La libération est d’ordre 1, la biodisponibilité est complète et aucun burst initial n’est représenté.'),
    derivative: (y, p) => { const release = p.krel * y[0], elimination = p.cl / p.v * y[1]; return [-release, release - elimination, elimination, y[1] / p.v]; },
    output: (y, p) => ({ c: y[1] / p.v, secondary: y[0], flows: { release: p.krel * y[0], elimination: p.cl / p.v * y[1] } }),
    edges: [{ from: 'depot', to: 'central', flow: 'release', label: 'krel Adep' }, { from: 'central', to: 'eliminated', flow: 'elimination', label: 'CL C' }],
    events: p => Array.from({ length: p.count }, (_, i) => ({ time: i * p.tau, state: 'depot', amount: p.dose })).filter(event => event.time <= p.end)
  },
  saturable: {
    number: '07', unit: 'h', route: l('IV bolus', 'Bolus IV'),
    title: l('Saturable elimination', 'Élimination saturable'),
    summary: l('See a finite elimination capacity become saturated as concentration rises.', "Voir une capacité d’élimination finie se saturer lorsque la concentration augmente."),
    defaults: { dose: 500, v: 35, vmax: 28, km: 4, end: 72 },
    parameters: {
      dose: parameter(l('Dose', 'Dose'), 'mg', 10, 3000, 10), v: parameter(l('Volume', 'Volume'), 'L', 5, 200, 1),
      vmax: parameter(l('Maximum elimination rate', "Vitesse maximale d'elimination"), 'mg/h', 1, 200, 1), km: parameter(l('Michaelis constant', 'Constante de Michaelis'), 'mg/L', 0.1, 50, 0.1),
      end: parameter(l('Horizon', 'Horizon'), 'h', 12, 240, 1)
    },
    states: ['central', 'eliminated', 'auc'], mass: ['central', 'eliminated'],
    nodes: [{ id: 'central', label: l('Central', 'Central'), x: .25, y: .4, color: '#147ea5' }, { id: 'eliminated', label: l('Capacity-limited exit', 'Sortie a capacite limitee'), x: .77, y: .4, color: '#81758a' }],
    equations: 'rateout = Vmax C/(Km + C)\ndAc/dt = -rateout\nC = Ac/V',
    question: l('At concentrations well above Km, does doubling the dose double exposure?', "A concentration tres superieure a Km, doubler la dose double-t-il l'exposition ?"),
    choices: [l('Exposure increases more than two-fold', "L'exposition augmente de plus du double"), l('Exactly two-fold', 'Exactement du double'), l('Less than two-fold', 'Moins du double')], answer: 0,
    explanation: l('The elimination rate approaches Vmax, so additional drug cannot be cleared proportionally.', "La vitesse d'elimination approche Vmax : le surplus ne peut plus etre elimine proportionnellement."),
    secondary: l('Elimination rate', "Vitesse d’élimination"), secondaryUnit: 'mg/h', related: 'clairance-volume-demi-vie',
    caveat: l('This experiment uses pure Michaelis-Menten elimination without a parallel linear pathway.', 'Cette expérience utilise une élimination de Michaelis-Menten pure, sans voie linéaire parallèle.'),
    derivative: (y, p) => { const c = y[0] / p.v, elimination = p.vmax * c / (p.km + c); return [-elimination, elimination, c]; },
    output: (y, p) => { const c = y[0] / p.v; return { c, secondary: p.vmax * c / (p.km + c), flows: { elimination: p.vmax * c / (p.km + c) } }; },
    edges: [{ from: 'central', to: 'eliminated', flow: 'elimination', label: 'Vmax C/(Km+C)', gate: true }],
    events: p => [{ time: 0, state: 'central', amount: p.dose }]
  },
  enterohepatic: {
    number: '08', unit: 'h', route: l('IV bolus', 'Bolus IV'),
    title: l('Enterohepatic cycling', 'Cycle entérohépatique'),
    summary: l('Follow drug from plasma to bile, gut and back to plasma before final loss.', "Suivre le médicament du plasma vers la bile, l’intestin puis le plasma avant la perte finale."),
    defaults: { dose: 150, v: 25, cl: 2.5, kbile: 0.12, kempty: 0.18, kreabs: 0.7, kloss: 0.08, end: 72 },
    parameters: {
      dose: parameter(l('Dose', 'Dose'), 'mg', 10, 1000, 10), v: parameter(l('Central volume', 'Volume central'), 'L', 5, 100, 1), cl: parameter(l('Systemic clearance', 'Clairance systemique'), 'L/h', 0.1, 20, 0.1),
      kbile: parameter(l('Biliary transfer', 'Transfert biliaire'), '1/h', 0.01, 1, 0.01), kempty: parameter(l('Bile emptying', 'Vidange biliaire'), '1/h', 0.01, 1, 0.01),
      kreabs: parameter(l('Gut reabsorption', 'Reabsorption intestinale'), '1/h', 0.01, 3, 0.01), kloss: parameter(l('Gut loss', 'Perte intestinale'), '1/h', 0, 1, 0.01),
      end: parameter(l('Horizon', 'Horizon'), 'h', 24, 240, 1)
    },
    states: ['central', 'bile', 'gut', 'eliminated', 'auc'], mass: ['central', 'bile', 'gut', 'eliminated'],
    nodes: [
      { id: 'central', label: l('Plasma', 'Plasma'), x: .2, y: .25, color: '#147ea5' }, { id: 'bile', label: l('Bile', 'Bile'), x: .78, y: .25, color: '#d29a31' },
      { id: 'gut', label: l('Gut', 'Intestin'), x: .78, y: .75, color: '#c97532' }, { id: 'eliminated', label: l('Eliminated', 'Elimine'), x: .2, y: .75, color: '#81758a' }
    ],
    equations: 'dAc/dt = -CL/V Ac - kbile Ac + kreabs Agut\ndAbile/dt = kbile Ac - kempty Abile\ndAgut/dt = kempty Abile - (kreabs + kloss) Agut',
    question: l('If bile empties more slowly, what happens to a recirculation peak?', 'Si la bile se vide plus lentement, que devient un pic de recirculation ?'),
    choices: [l('It occurs later', 'Il survient plus tard'), l('It is unchanged', 'Il est inchange'), l('It occurs earlier', 'Il survient plus tot')], answer: 0,
    explanation: l('Drug reaches the gut later, delaying re-entry into plasma.', "Le medicament atteint l'intestin plus tard, ce qui retarde son retour plasmatique."),
    secondary: l('Bile plus gut amount', 'Quantité dans la bile et l’intestin'), secondaryUnit: 'mg', related: 'parent-metabolite',
    caveat: l('The cycle is a linear lumped model; meals and discrete gallbladder emptying events are not represented.', 'Le cycle est un modèle linéaire agrégé ; les repas et les vidanges discrètes de la vésicule ne sont pas représentés.'),
    derivative: (y, p) => {
      const systemic = p.cl / p.v * y[0], toBile = p.kbile * y[0], empty = p.kempty * y[1], reabsorb = p.kreabs * y[2], gutLoss = p.kloss * y[2];
      return [-systemic - toBile + reabsorb, toBile - empty, empty - reabsorb - gutLoss, systemic + gutLoss, y[0] / p.v];
    },
    output: (y, p) => ({ c: y[0] / p.v, secondary: y[1] + y[2], flows: { toBile: p.kbile * y[0], empty: p.kempty * y[1], reabsorb: p.kreabs * y[2], systemic: p.cl / p.v * y[0], gutLoss: p.kloss * y[2] } }),
    edges: [{ from: 'central', to: 'bile', flow: 'toBile', label: 'kbile Ac' }, { from: 'bile', to: 'gut', flow: 'empty', label: 'kempty Abile' }, { from: 'gut', to: 'central', flow: 'reabsorb', label: 'kreabs Agut', curved: true }, { from: 'central', to: 'eliminated', flow: 'systemic', label: 'CL C' }, { from: 'gut', to: 'eliminated', flow: 'gutLoss', label: 'kloss Agut' }],
    events: p => [{ time: 0, state: 'central', amount: p.dose }]
  },
  tmdd: {
    number: '09', unit: 'h', route: l('IV bolus', 'Bolus IV'),
    title: l('Target-mediated disposition', 'Disposition médiée par la cible'),
    summary: l('See reversible binding, target saturation, complex internalization and parallel linear clearance.', "Voir la liaison réversible, la saturation de la cible, l’internalisation du complexe et la clairance linéaire."),
    defaults: { dose: 80, v: 4, cl: 0.08, target0: 12, kon: 0.025, koff: 0.12, kint: 0.08, kdeg: 0.03, end: 168 },
    parameters: {
      dose: parameter(l('Dose', 'Dose'), 'mg-eq', 1, 500, 1), v: parameter(l('Central volume', 'Volume central'), 'L', 1, 20, 0.1), cl: parameter(l('Linear clearance', 'Clairance lineaire'), 'L/h', 0.001, 2, 0.001),
      target0: parameter(l('Baseline target', 'Cible initiale'), 'mg-eq', 0.1, 100, 0.1), kon: parameter(l('Association rate', "Vitesse d'association"), 'L/(mg.h)', 0.001, 1, 0.001),
      koff: parameter(l('Dissociation rate', 'Vitesse de dissociation'), '1/h', 0.001, 2, 0.001), kint: parameter(l('Internalization rate', "Vitesse d'internalisation"), '1/h', 0.001, 1, 0.001),
      kdeg: parameter(l('Target turnover', 'Turnover de la cible'), '1/h', 0.001, 0.5, 0.001), end: parameter(l('Horizon', 'Horizon'), 'h', 24, 720, 1)
    },
    states: ['free', 'target', 'complex', 'eliminated', 'internalized', 'auc'], mass: ['free', 'complex', 'eliminated', 'internalized'],
    nodes: [
      { id: 'free', label: l('Free drug', 'Medicament libre'), x: .18, y: .25, color: '#147ea5' }, { id: 'target', label: l('Free target', 'Cible libre'), x: .82, y: .25, color: '#36a36e', target: true },
      { id: 'complex', label: l('Drug-target complex', 'Complexe medicament-cible'), x: .5, y: .55, color: '#8c4c89' },
      { id: 'eliminated', label: l('Linear elimination', 'Elimination lineaire'), x: .18, y: .83, color: '#81758a' }, { id: 'internalized', label: l('Internalized', 'Internalise'), x: .82, y: .83, color: '#a24f68' }
    ],
    equations: 'bind = kon (Afree/V) R\ndAfree/dt = -CL/V Afree - bind + koff AR\ndR/dt = kdeg R0 - kdeg R - bind + koff AR\ndAR/dt = bind - (koff + kint) AR',
    question: l('When the target becomes saturated, how does free exposure change with an additional dose?', "Quand la cible est saturee, comment l'exposition libre evolue-t-elle avec une dose supplementaire ?"),
    choices: [l('More than proportionally', 'Plus que proportionnellement'), l('Strictly proportionally', 'Strictement proportionnellement'), l('Less than proportionally', 'Moins que proportionnellement')], answer: 0,
    explanation: l('A finite target cannot bind the same fraction at high dose, so a larger fraction remains free.', "Une cible finie ne peut pas lier la meme fraction a forte dose : une plus grande part reste libre."),
    secondary: l('Target occupancy', "Occupation de la cible"), secondaryUnit: '%', related: 'mab-tmdd', amountUnit: 'mg-eq',
    caveat: l('This reduced amount-equivalent model illustrates full binding dynamics; it is not a drug-specific QSS or QE model.', 'Ce modèle réduit en équivalents de quantité illustre la dynamique complète de liaison ; ce n’est pas un modèle QSS ou QE propre à un médicament.'),
    derivative: (y, p) => {
      const free = y[0], target = y[1], complex = y[2], bind = p.kon * (free / p.v) * target, dissociate = p.koff * complex, internalize = p.kint * complex, linear = p.cl / p.v * free;
      return [-linear - bind + dissociate, p.kdeg * p.target0 - p.kdeg * target - bind + dissociate, bind - dissociate - internalize, linear, internalize, free / p.v];
    },
    output: (y, p) => {
      const bind = p.kon * (y[0] / p.v) * y[1], totalTarget = y[1] + y[2];
      return { c: y[0] / p.v, secondary: totalTarget > 0 ? 100 * y[2] / totalTarget : 0, flows: { bind, dissociate: p.koff * y[2], internalize: p.kint * y[2], linear: p.cl / p.v * y[0] } };
    },
    edges: [{ from: 'free', to: 'complex', flow: 'bind', label: 'kon C R', labelOffset: -16 }, { from: 'complex', to: 'free', flow: 'dissociate', label: 'koff AR', curved: true, labelOffset: 24 }, { from: 'target', to: 'complex', flow: 'bind', label: 'binding', signal: true }, { from: 'complex', to: 'internalized', flow: 'internalize', label: 'kint AR' }, { from: 'free', to: 'eliminated', flow: 'linear', label: 'CL C' }],
    events: p => [{ time: 0, state: 'free', amount: p.dose }], initial: p => ({ target: p.target0 })
  },
  'effect-site': {
    number: '10', unit: 'h', route: l('IV bolus', 'Bolus IV'),
    title: l('Effect-site equilibration', "Équilibration au site d’effet"),
    summary: l('Watch plasma exposure drive a delayed biophase concentration and pharmacodynamic response.', "Observer l’exposition plasmatique entraîner une concentration dans la biophase et une réponse retardées."),
    defaults: { dose: 100, v: 20, cl: 4, ke0: 0.35, emax: 100, ec50: 2.5, end: 24 },
    parameters: {
      dose: parameter(l('Dose', 'Dose'), 'mg', 10, 1000, 10), v: parameter(l('Volume', 'Volume'), 'L', 5, 100, 1), cl: parameter(l('Clearance', 'Clairance'), 'L/h', 0.1, 30, 0.1),
      ke0: parameter(l('Effect-site equilibration', "Equilibration au site d'effet"), '1/h', 0.01, 5, 0.01), emax: parameter(l('Maximum effect', 'Effet maximal'), '%', 1, 200, 1),
      ec50: parameter(l('EC50', 'EC50'), 'mg/L', 0.01, 50, 0.01), end: parameter(l('Horizon', 'Horizon'), 'h', 8, 168, 1)
    },
    states: ['central', 'ce', 'eliminated', 'auc'], mass: ['central', 'eliminated'],
    nodes: [
      { id: 'central', label: l('Plasma', 'Plasma'), x: .2, y: .35, color: '#147ea5' }, { id: 'ce', label: l('Effect site', "Site d'effet"), x: .78, y: .35, color: '#d26b3a', signal: true },
      { id: 'eliminated', label: l('Eliminated', 'Elimine'), x: .2, y: .8, color: '#81758a' }
    ],
    equations: 'dAc/dt = -(CL/V) Ac\ndCe/dt = ke0 (Cp - Ce)\nEffect = Emax Ce/(EC50 + Ce)',
    question: l('If ke0 decreases, what happens to the effect peak?', "Si ke0 diminue, que devient le pic d'effet ?"),
    choices: [l('It occurs later', 'Il survient plus tard'), l('It is unchanged', 'Il est inchange'), l('It occurs earlier', 'Il survient plus tot')], answer: 0,
    explanation: l('A smaller ke0 slows equilibration between plasma and the conceptual biophase.', "Un ke0 plus faible ralentit l'equilibration entre le plasma et la biophase conceptuelle."),
    secondary: l('Effect', 'Effet'), secondaryUnit: '%', related: 'pd-effect-compartment',
    caveat: l('The effect compartment is a conceptual biophase and does not remove drug mass from plasma.', 'Le compartiment d’effet est une biophase conceptuelle et ne retire aucune masse de médicament du plasma.'),
    derivative: (y, p) => { const c = y[0] / p.v, elimination = p.cl / p.v * y[0]; return [-elimination, p.ke0 * (c - y[1]), elimination, c]; },
    output: (y, p) => ({ c: y[0] / p.v, secondary: p.emax * y[1] / (p.ec50 + y[1]), flows: { equilibration: p.ke0 * Math.abs(y[0] / p.v - y[1]), elimination: p.cl / p.v * y[0] }, ce: y[1] }),
    edges: [{ from: 'central', to: 'ce', flow: 'equilibration', label: 'ke0 (Cp-Ce)', signal: true, dashed: true }, { from: 'central', to: 'eliminated', flow: 'elimination', label: 'CL Cp' }],
    events: p => [{ time: 0, state: 'central', amount: p.dose }]
  }
};

export function validateMolecularParameters(lab, supplied) {
  const config = molecularLabs[lab];
  if (!config || !supplied || typeof supplied !== 'object' || Array.isArray(supplied)) throw new Error('Invalid molecular laboratory');
  if (Object.keys(supplied).some(key => !Object.hasOwn(config.defaults, key))) throw new Error('Unknown parameter');
  const result = { ...config.defaults, ...supplied };
  for (const [key, value] of Object.entries(result)) {
    const rule = config.parameters[key];
    if (!Number.isFinite(value) || value < rule.min || value > rule.max || key === 'count' && !Number.isInteger(value)) throw new Error(`${key}: ${rule.min} - ${rule.max}`);
  }
  return result;
}

const rk4Step = (derivative, y, t, h, p) => {
  const k1 = derivative(y, p, t), k2 = derivative(y.map((v, i) => v + h * k1[i] / 2), p, t + h / 2);
  const k3 = derivative(y.map((v, i) => v + h * k2[i] / 2), p, t + h / 2), k4 = derivative(y.map((v, i) => v + h * k3[i]), p, t + h);
  return y.map((value, i) => Math.max(0, value + h * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) / 6));
};

const keyTime = time => Number(time.toFixed(9));

export function molecularSeries(lab, supplied) {
  const config = molecularLabs[lab], p = validateMolecularParameters(lab, supplied), events = config.events(p).sort((a, b) => a.time - b.time);
  const outputTimes = Array.from({ length: 481 }, (_, i) => keyTime(p.end * i / 480));
  const times = [...new Set([...outputTimes, ...events.map(event => keyTime(event.time))])].sort((a, b) => a - b);
  const eventMap = new Map();
  for (const event of events) eventMap.set(keyTime(event.time), [...(eventMap.get(keyTime(event.time)) ?? []), event]);
  let y = config.states.map(state => Number(config.initial?.(p)?.[state] ?? 0)), previous = 0, administered = 0;
  const rows = [];
  for (const time of times) {
    const span = time - previous, steps = Math.max(1, Math.ceil(span / Math.max(p.end / 2400, 0.002))), h = span / steps;
    for (let step = 0; step < steps && span > 0; step++) y = rk4Step(config.derivative, y, previous + step * h, h, p);
    const makeRow = () => {
      const state = Object.fromEntries(config.states.map((name, index) => [name, y[index]])), derived = config.output(y, p);
      return { t: time, ...state, ...derived, administered, mass: Object.fromEntries(config.mass.map(name => [name, state[name]])) };
    };
    const due = eventMap.get(keyTime(time)) ?? [];
    if (due.length && time > 0) rows.push(makeRow());
    for (const event of due) { const index = config.states.indexOf(event.state); y[index] += event.amount; administered += event.amount; }
    rows.push(makeRow());
    previous = time;
  }
  return rows;
}

const interpolateObject = (a, b, fraction) => Object.fromEntries([...new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})])].map(key => [key, (a?.[key] ?? 0) + ((b?.[key] ?? 0) - (a?.[key] ?? 0)) * fraction]));

export function molecularStateAt(rows, time) {
  if (!rows.length) return null;
  if (time <= rows[0].t) return rows[0];
  if (time >= rows.at(-1).t) return rows.at(-1);
  let low = 0, high = rows.length - 1;
  while (high - low > 1) { const middle = Math.floor((low + high) / 2); if (rows[middle].t <= time) low = middle; else high = middle; }
  const a = rows[low], b = rows[high], fraction = (time - a.t) / (b.t - a.t);
  const row = { t: time, mass: interpolateObject(a.mass, b.mass, fraction), flows: interpolateObject(a.flows, b.flows, fraction) };
  for (const key of Object.keys(a)) if (typeof a[key] === 'number' && key !== 't') row[key] = a[key] + (b[key] - a[key]) * fraction;
  return row;
}

export function encodeMolecularScenario(lab, supplied, reference = supplied) {
  const p = validateMolecularParameters(lab, supplied), ref = validateMolecularParameters(lab, reference), values = new URLSearchParams({ lab, mv: '1' });
  for (const key of Object.keys(p)) { values.set(key, String(p[key])); values.set(`r_${key}`, String(ref[key])); }
  return values.toString();
}

export function decodeMolecularScenario(hash) {
  const values = new URLSearchParams(hash.replace(/^#/, '')), lab = values.get('lab') ?? '', config = molecularLabs[lab];
  if (!config || values.get('mv') !== '1' || hash.length > 3000) throw new Error('Invalid molecular scenario');
  const allowed = new Set(['lab', 'mv', ...Object.keys(config.defaults), ...Object.keys(config.defaults).map(key => `r_${key}`)]);
  if ([...values.keys()].some(key => !allowed.has(key) || values.getAll(key).length !== 1)) throw new Error('Invalid molecular scenario');
  const p = {}, reference = {};
  for (const key of Object.keys(config.defaults)) {
    for (const [prefix, target] of [['', p], ['r_', reference]]) if (values.has(prefix + key)) {
      const text = values.get(prefix + key); if (!text?.trim()) throw new Error('Invalid molecular scenario'); target[key] = Number(text);
    }
  }
  return { lab, parameters: validateMolecularParameters(lab, p), reference: validateMolecularParameters(lab, Object.keys(reference).length ? reference : p) };
}
