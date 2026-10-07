// @ts-nocheck

const ids = ['parent-metabolite', 'long-acting', 'saturable', 'enterohepatic', 'tmdd', 'effect-site', 'pd-general', 'pd-oncology', 'pd-infectiology', 'covariate-volume'];
export const molecularLabIds = ids;

const l = (en, fr) => ({ en, fr });
const parameter = (label, unit, min, max, step) => ({ label, unit, min, max, step });
const choice = (label, options) => ({ label, options, min: 1, max: options.length, step: 1 });

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
    number: '07', unit: 'h', route: l('IV bolus', 'Bolus IV'), scene: 'saturable',
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
    output: (y, p) => { const c = y[0] / p.v, rate = p.vmax * c / (p.km + c); return { c, secondary: rate, capacityPct: 100 * rate / p.vmax, flows: { elimination: rate } }; },
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
    number: '09', unit: 'h', route: l('IV bolus', 'Bolus IV'), scene: 'tmdd',
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
  },
  'pd-general': {
    number: '11', unit: 'h', route: l('IV bolus', 'Bolus IV'), category: l('Pharmacodynamic journey', 'Parcours pharmacodynamique'), scene: 'pd-general',
    title: l('From concentration to response', 'De la concentration a la reponse'),
    summary: l('Follow plasma concentration, target engagement and a delayed biological response.', "Suivre la concentration plasmatique, l'engagement de la cible et une reponse biologique retardee."),
    defaults: { model: 3, dose: 100, v: 20, cl: 4, keq: 0.5, ec50: 2, hill: 1.5, e0: 10, emax: 90, kout: 0.2, end: 36 },
    parameters: {
      model: choice(l('Response model', 'Modele de reponse'), [{ value: 1, label: l('Direct Emax', 'Emax direct') }, { value: 2, label: l('Effect compartment', "Compartiment d'effet") }, { value: 3, label: l('Turnover response', 'Reponse par turnover') }]),
      dose: parameter(l('Dose', 'Dose'), 'mg', 10, 1000, 10), v: parameter(l('Volume', 'Volume'), 'L', 5, 100, 1), cl: parameter(l('Clearance', 'Clairance'), 'L/h', 0.1, 30, 0.1),
      keq: parameter(l('Target equilibration', 'Equilibration de la cible'), '1/h', 0.01, 5, 0.01), ec50: parameter(l('EC50', 'EC50'), 'mg/L', 0.01, 50, 0.01),
      hill: parameter(l('Hill coefficient', 'Coefficient de Hill'), '', 0.2, 6, 0.1), e0: parameter(l('Baseline response', 'Reponse initiale'), 'units', 0, 200, 1),
      emax: parameter(l('Maximum increase', 'Augmentation maximale'), 'units', 1, 300, 1), kout: parameter(l('Response turnover', 'Turnover de la reponse'), '1/h', 0.01, 3, 0.01),
      end: parameter(l('Horizon', 'Horizon'), 'h', 8, 168, 1)
    },
    states: ['central', 'occupancy', 'response', 'eliminated', 'auc'], mass: ['central', 'eliminated'],
    nodes: [
      { id: 'central', label: l('Plasma', 'Plasma'), x: .12, y: .28, color: '#147ea5' },
      { id: 'occupancy', value: 'occupancyPct', label: l('Target engagement', 'Engagement de la cible'), x: .5, y: .28, color: '#8c4c89', signal: true, range: [0, 100], unit: '%' },
      { id: 'response', value: 'responseDisplay', label: l('Biological response', 'Reponse biologique'), x: .86, y: .28, color: '#d26b3a', signal: true, range: [0, p => p.e0 + p.emax], unit: 'units' },
      { id: 'eliminated', label: l('Eliminated', 'Elimine'), x: .12, y: .78, color: '#81758a' }
    ],
    equations: 'Occ_eq = C^Hill/(EC50^Hill + C^Hill)\nDirect: E = E0 + Emax Occ_eq\nEffect compartment: dOcc/dt = keq (Occ_eq - Occ)\nTurnover: dE/dt = kout [E0 + Emax Occ_eq - E]',
    question: l('Which model adds a response delay after target engagement?', "Quel modele ajoute un retard de reponse apres l'engagement de la cible ?"),
    choices: [l('Turnover response', 'Reponse par turnover'), l('Direct Emax', 'Emax direct'), l('All models equally', 'Tous les modeles de la meme facon')], answer: 0,
    explanation: l('The turnover state needs time to approach its concentration-dependent target.', 'Le compartiment de turnover met du temps a rejoindre sa cible dependante de la concentration.'),
    secondary: l('Biological response', 'Reponse biologique'), secondaryUnit: 'units', related: 'pd-direct',
    caveat: l('Target engagement and response are conceptual signals; they do not remove drug mass from plasma.', "L'engagement de la cible et la reponse sont des signaux conceptuels ; ils ne retirent aucune masse de medicament du plasma."),
    derivative: (y, p) => {
      const c = y[0] / p.v, hill = p.model === 1 ? 1 : p.hill, power = Math.pow(Math.max(0, c), hill), equilibrium = power / (Math.pow(p.ec50, hill) + power), target = p.e0 + p.emax * equilibrium, elimination = p.cl / p.v * y[0];
      return [-elimination, p.model === 2 ? p.keq * (equilibrium - y[1]) : 0, p.model === 3 ? p.kout * (target - y[2]) : 0, elimination, c];
    },
    output: (y, p) => {
      const c = y[0] / p.v, hill = p.model === 1 ? 1 : p.hill, power = Math.pow(Math.max(0, c), hill), equilibrium = power / (Math.pow(p.ec50, hill) + power), signal = p.model === 2 ? y[1] : equilibrium;
      const responseDisplay = p.model === 3 ? y[2] : p.e0 + p.emax * signal;
      return { c, secondary: responseDisplay, responseDisplay, occupancyPct: 100 * signal, flows: { engagement: p.model === 2 ? p.keq * Math.abs(equilibrium - y[1]) : equilibrium, transduction: Math.abs(responseDisplay - p.e0) / Math.max(1, p.emax), elimination: p.cl / p.v * y[0] } };
    },
    edges: [{ from: 'central', to: 'occupancy', flow: 'engagement', label: 'keq (Occ_eq-Occ)', signal: true, dashed: true }, { from: 'occupancy', to: 'response', flow: 'transduction', label: 'kout (Etarget-E)', signal: true, dashed: true }, { from: 'central', to: 'eliminated', flow: 'elimination', label: 'CL C' }],
    events: p => [{ time: 0, state: 'central', amount: p.dose }], initial: p => ({ response: p.e0 })
  },
  'pd-oncology': {
    number: '12', unit: 'day', route: l('Repeated IV boluses', 'Bolus IV repetes'), category: l('Pharmacodynamic journey', 'Parcours pharmacodynamique'), referenceMode: 'intrinsic', plotMode: 'comparison', exportKeys: ['untreated', 'resistantPct'], scene: 'oncology',
    title: l('Tumor growth inhibition', 'Inhibition de la croissance tumorale'),
    summary: l('Compare model-predicted tumor growth without treatment with the response under repeated exposure.', 'Comparer la croissance tumorale predite sans traitement a la reponse sous exposition repetee.'),
    defaults: { dose: 100, v: 20, cl: 4, tumor0: 60, resistant0: 1, kgrowth: 0.035, kkill: 0.08, ec50: 2, resistance: 0.02, resistantKill: 0.1, tau: 21, count: 4, end: 84 },
    parameters: {
      dose: parameter(l('Dose', 'Dose'), 'mg', 10, 1000, 10), v: parameter(l('Volume', 'Volume'), 'L', 5, 100, 1), cl: parameter(l('Clearance', 'Clairance'), 'L/day', 0.1, 30, 0.1),
      tumor0: parameter(l('Initial tumor size', 'Taille tumorale initiale'), 'mm', 1, 200, 1), resistant0: parameter(l('Initially resistant cells', 'Cellules resistantes initiales'), '%', 0, 50, 1), kgrowth: parameter(l('Tumor growth rate', 'Vitesse de croissance tumorale'), '1/day', 0.001, 0.2, 0.001),
      kkill: parameter(l('Maximum drug kill', 'Destruction maximale par le medicament'), '1/day', 0.001, 0.5, 0.001), ec50: parameter(l('Effect EC50', "EC50 de l'effet"), 'mg/L', 0.01, 50, 0.01),
      resistance: parameter(l('Sensitive-to-resistant conversion', 'Conversion sensible-resistante'), '1/day', 0, 0.1, 0.001), resistantKill: parameter(l('Drug effect on resistant cells', "Effet du medicament sur les resistantes"), 'fraction', 0, 1, 0.05), tau: parameter(l('Cycle interval', 'Intervalle entre les cycles'), 'days', 1, 42, 1),
      count: parameter(l('Number of cycles', 'Nombre de cycles'), '', 1, 12, 1), end: parameter(l('Horizon', 'Horizon'), 'days', 21, 180, 1)
    },
    states: ['central', 'sensitive', 'resistant', 'eliminated', 'auc'], mass: ['central', 'eliminated'],
    nodes: [
      { id: 'central', label: l('Plasma exposure', 'Exposition plasmatique'), x: .13, y: .25, color: '#147ea5' },
      { id: 'sensitive', label: l('Sensitive cells', 'Cellules sensibles'), x: .52, y: .25, color: '#39a883', signal: true, range: [0, p => p.tumor0 * 3], unit: 'mm-eq' },
      { id: 'resistant', label: l('Resistant cells', 'Cellules resistantes'), x: .84, y: .25, color: '#d26b3a', signal: true, range: [0, p => p.tumor0 * 3], unit: 'mm-eq' },
      { id: 'untreated', label: l('Without treatment', 'Sans traitement'), x: .86, y: .7, color: '#65767b', signal: true, range: [0, p => p.tumor0 * 3], unit: 'mm' },
      { id: 'eliminated', label: l('Eliminated', 'Elimine'), x: .13, y: .78, color: '#81758a' }
    ],
    equations: 'Edrug = kkill C/(EC50 + C)\ndS/dt = (kgrowth - Edrug) S - kres S\ndR/dt = (kgrowth - fres Edrug) R + kres S\nT = S + R ; Twithout = T0 exp(kgrowth t)',
    question: l('If resistance emerges faster, what happens to late tumor control?', 'Si la resistance apparait plus vite, que devient le controle tumoral tardif ?'),
    choices: [l('Regrowth occurs earlier', 'La reprise de croissance survient plus tot'), l('It is unchanged', 'Il ne change pas'), l('Control improves', "Le controle s'ameliore")], answer: 0,
    explanation: l('More sensitive cells enter the less drug-responsive resistant state, which can dominate late tumor burden.', 'Davantage de cellules sensibles entrent dans un etat resistant moins sensible au medicament, qui peut dominer tardivement la charge tumorale.'),
    secondary: l('Tumor size with treatment', 'Taille tumorale avec traitement'), secondaryUnit: 'mm', related: 'onco-tgi',
    caveat: l('Sensitive-to-resistant conversion is a reduced educational phenotype model, not a validated clonal evolution model or causal survival prediction.', "La conversion sensible-resistante est un modele phenotypique pedagogique reduit, et non un modele valide d'evolution clonale ou une prediction causale de survie."),
    metric: state => ({ label: l('Resistant cell fraction', 'Fraction de cellules resistantes'), value: state.resistantPct, unit: '%' }),
    derivative: (y, p) => {
      const c = y[0] / p.v, elimination = p.cl / p.v * y[0], effect = p.kkill * c / (p.ec50 + c), conversion = p.resistance * y[1];
      return [-elimination, (p.kgrowth - effect) * y[1] - conversion, (p.kgrowth - p.resistantKill * effect) * y[2] + conversion, elimination, c];
    },
    output: (y, p, time) => {
      const c = y[0] / p.v, effect = p.kkill * c / (p.ec50 + c), total = y[1] + y[2], conversion = p.resistance * y[1];
      return { c, secondary: total, untreated: p.tumor0 * Math.exp(p.kgrowth * time), resistantPct: total > 0 ? 100 * y[2] / total : 0, flows: { effectSensitive: effect * y[1], effectResistant: p.resistantKill * effect * y[2], conversion, elimination: p.cl / p.v * y[0] } };
    },
    edges: [{ from: 'central', to: 'sensitive', flow: 'effectSensitive', label: 'Edrug S', signal: true, dashed: true }, { from: 'central', to: 'resistant', flow: 'effectResistant', label: 'fres Edrug R', signal: true, dashed: true }, { from: 'sensitive', to: 'resistant', flow: 'conversion', label: 'kres S', signal: true }, { from: 'central', to: 'eliminated', flow: 'elimination', label: 'CL C' }],
    events: p => Array.from({ length: p.count }, (_, i) => ({ time: i * p.tau, state: 'central', amount: p.dose })).filter(event => event.time <= p.end), initial: p => ({ sensitive: p.tumor0 * (1 - p.resistant0 / 100), resistant: p.tumor0 * p.resistant0 / 100 })
  },
  'pd-infectiology': {
    number: '13', unit: 'h', route: l('Repeated IV boluses', 'Bolus IV repetes'), category: l('Pharmacodynamic journey', 'Parcours pharmacodynamique'), thresholdKey: 'mic', scene: 'infectiology',
    title: l('Antibiotic, MIC and bacterial response', 'Antibiotique, CMI et reponse bacterienne'),
    summary: l('Watch repeated exposure cross the MIC threshold and alter the predicted bacterial burden.', "Observer l'exposition repetee franchir la CMI et modifier la charge bacterienne predite."),
    defaults: { dose: 100, v: 20, cl: 4, mic: 2, growth: 0.2, hill: 2, tau: 8, count: 3, end: 24 },
    parameters: {
      dose: parameter(l('Dose', 'Dose'), 'mg', 10, 3000, 10), v: parameter(l('Volume', 'Volume'), 'L', 5, 100, 1), cl: parameter(l('Clearance', 'Clairance'), 'L/h', 0.1, 30, 0.1),
      mic: parameter(l('MIC', 'CMI'), 'mg/L', 0.01, 64, 0.01), growth: parameter(l('Bacterial growth rate', 'Vitesse de croissance bacterienne'), '1/h', 0.01, 1, 0.01),
      hill: parameter(l('Exposure-response Hill', 'Hill exposition-reponse'), '', 0.2, 8, 0.1), tau: parameter(l('Dosing interval', 'Intervalle entre les doses'), 'h', 1, 48, 1),
      count: parameter(l('Number of doses', 'Nombre de doses'), '', 1, 12, 1), end: parameter(l('Horizon', 'Horizon'), 'h', 8, 168, 1)
    },
    states: ['central', 'bacteria', 'above', 'eliminated', 'auc'], mass: ['central', 'eliminated'],
    nodes: [
      { id: 'central', label: l('Antibiotic exposure', "Exposition a l'antibiotique"), x: .12, y: .25, color: '#147ea5' },
      { id: 'mic', label: l('MIC threshold', 'Seuil de CMI'), x: .5, y: .25, color: '#a26c2a', signal: true, range: [0, p => p.mic * 2], unit: 'mg/L' },
      { id: 'bacteria', label: l('Bacterial burden', 'Charge bacterienne'), x: .86, y: .25, color: '#b2572e', signal: true, range: [0, 10], unit: 'log10' },
      { id: 'eliminated', label: l('Eliminated', 'Elimine'), x: .12, y: .78, color: '#81758a' }
    ],
    equations: 'dAc/dt = -(CL/V) Ac\nR = (C/MIC)^Hill\nnet growth = kgrowth [1 - 2R/(1+R)]\ndlog10(B)/dt = net growth/ln(10)',
    question: l('If the interval becomes shorter at the same dose and dosing continues over the same horizon, what usually happens to time above MIC?', "Si l'intervalle diminue a dose identique et que les doses couvrent le meme horizon, que devient en general le temps au-dessus de la CMI ?"),
    choices: [l('It increases', 'Il augmente'), l('It is unchanged', 'Il ne change pas'), l('It decreases', 'Il diminue')], answer: 0,
    explanation: l('More frequent dosing reduces the time spent below the concentration threshold.', 'Des doses plus frequentes reduisent le temps passe sous le seuil de concentration.'),
    secondary: l('Bacterial burden', 'Charge bacterienne'), secondaryUnit: 'log10 CFU/mL', related: 'infectio-pkpd',
    caveat: l('MIC is an in-vitro threshold and this individual deterministic response is not a population PTA analysis or a clinical dosing recommendation.', "La CMI est un seuil in vitro et cette reponse individuelle deterministe n'est ni une analyse de PTA en population ni une recommandation clinique."),
    metric: (state, p, time) => ({ label: l('Time above MIC', 'Temps au-dessus de la CMI'), value: time > 0 ? 100 * state.above / time : (state.c >= p.mic ? 100 : 0), unit: '%' }),
    derivative: (y, p) => {
      const c = y[0] / p.v, elimination = p.cl / p.v * y[0], ratio = Math.pow(Math.max(0, c / p.mic), p.hill), net = p.growth * (1 - 2 * ratio / (1 + ratio));
      return [-elimination, net / Math.LN10, c >= p.mic ? 1 : 0, elimination, c];
    },
    output: (y, p) => {
      const c = y[0] / p.v, ratio = Math.pow(Math.max(0, c / p.mic), p.hill), inhibition = p.growth * 2 * ratio / (1 + ratio);
      return { c, secondary: y[1], mic: p.mic, flows: { exposure: c, inhibition, elimination: p.cl / p.v * y[0] } };
    },
    edges: [{ from: 'central', to: 'mic', flow: 'exposure', label: 'C/MIC', signal: true, dashed: true, gate: true }, { from: 'mic', to: 'bacteria', flow: 'inhibition', label: 'E(C/MIC)', signal: true, dashed: true }, { from: 'central', to: 'eliminated', flow: 'elimination', label: 'CL C' }],
    events: p => Array.from({ length: p.count }, (_, i) => ({ time: i * p.tau, state: 'central', amount: p.dose })).filter(event => event.time <= p.end), initial: () => ({ bacteria: 6 })
  },
  'covariate-volume': {
    number: '14', unit: 'h', route: l('Oral first-order input', 'Entree orale d’ordre 1'), category: l('Covariate journey', 'Parcours covariable'), scene: 'covariate-volume',
    title: l('Body weight and distribution volume', 'Poids et volume de distribution'),
    summary: l('See body weight resize the apparent fluid space and change concentration after the same dose.', 'Voir le poids redimensionner l’espace liquidien apparent et modifier la concentration apres une meme dose.'),
    defaults: { dose: 100, weight: 70, referenceWeight: 70, vRef: 20, exponent: 1, cl: 4, ka: 1, end: 24 },
    parameters: {
      dose: parameter(l('Dose', 'Dose'), 'mg', 10, 1000, 10), weight: parameter(l('Body weight', 'Poids corporel'), 'kg', 40, 120, 1), referenceWeight: parameter(l('Reference weight', 'Poids de reference'), 'kg', 40, 120, 1),
      vRef: parameter(l('Reference volume', 'Volume de reference'), 'L', 5, 100, 1), exponent: parameter(l('Weight exponent on volume', 'Exposant du poids sur le volume'), '', 0.1, 2, 0.05),
      cl: parameter(l('Clearance', 'Clairance'), 'L/h', 0.1, 30, 0.1), ka: parameter(l('Absorption rate', "Vitesse d'absorption"), '1/h', 0.05, 5, 0.05), end: parameter(l('Horizon', 'Horizon'), 'h', 8, 72, 1)
    },
    states: ['depot', 'central', 'eliminated', 'auc'], mass: ['depot', 'central', 'eliminated'],
    nodes: [
      { id: 'depot', label: l('Dose reservoir', 'Reservoir de dose'), x: .12, y: .25, color: '#c97532' },
      { id: 'central', label: l('Apparent fluid space', 'Espace liquidien apparent'), x: .62, y: .32, color: '#147ea5' },
      { id: 'eliminated', label: l('Eliminated', 'Elimine'), x: .88, y: .78, color: '#81758a' }
    ],
    equations: 'V = Vref (weight/weightref)^betaV\ndAdep/dt = -ka Adep\ndAc/dt = ka Adep - (CL/V) Ac\nC = Ac/V',
    question: l('At the same dose, what happens to the early concentration when weight increases and volume scales with weight?', 'A dose identique, que devient la concentration precoce quand le poids et le volume augmentent ensemble ?'),
    choices: [l('It decreases', 'Elle diminue'), l('It is unchanged', 'Elle ne change pas'), l('It increases', 'Elle augmente')], answer: 0,
    explanation: l('The same amount is diluted in a larger apparent distribution volume.', 'La meme quantite est diluee dans un volume apparent de distribution plus grand.'),
    secondary: l('Central amount', 'Quantite centrale'), secondaryUnit: 'mg', related: 'allometrie',
    caveat: l('This covariate relation is only illustrated over 40-120 kg and must not be extrapolated beyond the population used to estimate it.', "Cette relation de covariable n'est illustree que de 40 a 120 kg et ne doit pas etre extrapolee au-dela de la population ayant servi a l'estimer."),
    metric: (state, p) => ({ label: l('Apparent distribution volume', 'Volume apparent de distribution'), value: p.vRef * Math.pow(p.weight / p.referenceWeight, p.exponent), unit: 'L' }),
    derivative: (y, p) => {
      const volume = p.vRef * Math.pow(p.weight / p.referenceWeight, p.exponent), absorption = p.ka * y[0], elimination = p.cl / volume * y[1];
      return [-absorption, absorption - elimination, elimination, y[1] / volume];
    },
    output: (y, p) => {
      const volume = p.vRef * Math.pow(p.weight / p.referenceWeight, p.exponent), c = y[1] / volume;
      return { c, secondary: y[1], volume, flows: { absorption: p.ka * y[0], elimination: p.cl / volume * y[1] } };
    },
    edges: [{ from: 'depot', to: 'central', flow: 'absorption', label: 'ka Adep' }, { from: 'central', to: 'eliminated', flow: 'elimination', label: 'CL C' }],
    events: p => [{ time: 0, state: 'depot', amount: p.dose }]
  }
};

export function validateMolecularParameters(lab, supplied) {
  const config = molecularLabs[lab];
  if (!config || !supplied || typeof supplied !== 'object' || Array.isArray(supplied)) throw new Error('Invalid molecular laboratory');
  if (Object.keys(supplied).some(key => !Object.hasOwn(config.defaults, key))) throw new Error('Unknown parameter');
  const result = { ...config.defaults, ...supplied };
  for (const [key, value] of Object.entries(result)) {
    const rule = config.parameters[key];
    if (!Number.isFinite(value) || value < rule.min || value > rule.max || (key === 'count' || rule.options) && !Number.isInteger(value) || rule.options && !rule.options.some(option => option.value === value)) throw new Error(`${key}: ${rule.min} - ${rule.max}`);
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
      const state = Object.fromEntries(config.states.map((name, index) => [name, y[index]])), derived = config.output(y, p, time);
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
