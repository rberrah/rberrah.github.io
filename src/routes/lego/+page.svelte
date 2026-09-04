<script>
  // Atelier « Lego » — constructeur de modèles LIBRE.
  // On ajoute des compartiments (dépôt, transit, central, périphérique, métabolite, PD)
  // et des flèches (constantes de transfert) entre N'IMPORTE quels compartiments.
  // Sortie : diagramme éditable + EDO générées + nlmixr2/mrgsolve/MLXTRAN/NONMEM + simulation (RK4).
  import { language } from '$lib/stores/language';
  import { ui } from '$lib/i18n/translations';
  import { tdmEngineUrl } from '$lib/tdm/engine';
  $: copy = ui($language);

  const LEGO_UI = {
    fr: {
      lede: "Construisez n'importe quel modèle : ajoutez des compartiments et reliez-les par des flèches (constantes de transfert). Transit en chaîne, périphériques multiples, métabolite, blocs PD… sans bibliothèque figée.",
      kinds: { depot: 'Dépôt', transit: 'Transit', central: 'Central', periph: 'Périph.', metab: 'Métabolite', effect: 'Effet (ke0)', response: 'Réponse' },
      add: 'Ajouter', arrow: 'Flèche', templates: 'Modèles types', clickSource: 'Cliquez la source…', clickTarget: 'Cliquez la cible…', connect: 'Relier deux compartiments',
      parentMetabolite: 'Parent/métabolite', clear: 'Effacer', duration: 'Durée (h)', editorAria: 'Éditeur de modèle compartimental', eliminationShort: 'élim.',
      emptyCanvas: 'Ajoutez un compartiment, ou choisissez un modèle type ci-dessus.', chartAria: 'Simulation du modèle et comparaison des covariables', time: 'Temps (h)', legendAria: 'Légende des courbes',
      reference: 'référence', rescaled: 'rééch.', name: 'Nom', source: 'Source', addElimination: 'Ajouter une élimination', remove: 'Supprimer',
      editorTip: "Cliquez un compartiment pour l'éditer (nom, volume, dose…), puis glissez-le pour le déplacer.", transferRates: 'Constantes de transfert', rateAria: 'Constante de vitesse', to: 'vers',
      covariates: 'Covariables', addContinuousAria: 'Ajouter une covariable continue', addCategoricalAria: 'Ajouter une covariable catégorielle', continuous: 'Continue', categorical: 'Catégorielle',
      covariateHelp: 'Continue : P = TV × (COV/réf)^β. Catégorielle : P = TV × exp(β) pour la modalité comparée, sinon TV.', type: 'Type', targetParameter: 'Paramètre cible',
      categoryReference: 'Modalité réf.', referenceValue: 'Référence', categoryComparison: 'Modalité comparée', comparisonValue: 'Valeur comparée', compareCurve: 'Comparer sur la courbe',
      emptyEquations: '(ajoutez des compartiments)'
    },
    en: {
      lede: 'Build any model: add compartments and connect them with arrows (transfer rate constants). Transit chains, multiple peripheral compartments, metabolites and PD blocks are not restricted to a fixed library.',
      kinds: { depot: 'Depot', transit: 'Transit', central: 'Central', periph: 'Peripheral', metab: 'Metabolite', effect: 'Effect (ke0)', response: 'Response' },
      add: 'Add', arrow: 'Arrow', templates: 'Templates', clickSource: 'Select the source…', clickTarget: 'Select the target…', connect: 'Connect two compartments',
      parentMetabolite: 'Parent/metabolite', clear: 'Clear', duration: 'Duration (h)', editorAria: 'Compartmental model editor', eliminationShort: 'elim.',
      emptyCanvas: 'Add a compartment or choose a template above.', chartAria: 'Model simulation and covariate comparison', time: 'Time (h)', legendAria: 'Curve legend',
      reference: 'reference', rescaled: 'rescaled', name: 'Name', source: 'Source', addElimination: 'Add elimination', remove: 'Remove',
      editorTip: 'Select a compartment to edit its name, volume or dose, then drag it to reposition it.', transferRates: 'Transfer rate constants', rateAria: 'Rate constant', to: 'to',
      covariates: 'Covariates', addContinuousAria: 'Add a continuous covariate', addCategoricalAria: 'Add a categorical covariate', continuous: 'Continuous', categorical: 'Categorical',
      covariateHelp: 'Continuous: P = TV × (COV/ref)^β. Categorical: P = TV × exp(β) for the compared category, otherwise TV.', type: 'Type', targetParameter: 'Target parameter',
      categoryReference: 'Reference category', referenceValue: 'Reference', categoryComparison: 'Compared category', comparisonValue: 'Compared value', compareCurve: 'Compare on chart',
      emptyEquations: '(add compartments)'
    }
  };
  $: lego = LEGO_UI[$language === 'en' ? 'en' : 'fr'];

  /** @typedef {{id:number, kind:string, name:string, x:number, y:number, vol?:number, dose?:number, ke0?:number, kin?:number, kout?:number, smax?:number, sc50?:number, source?:number}} Node */
  /** @typedef {{id:number, from:number, to:number|'OUT', k:number}} Edge */
  /** @typedef {{id:number, name:string, type:'continuous'|'categorical', target:string, reference:number, comparison:number, beta:number, compare:boolean}} Covariate */

  /** @type {Record<string, {color:string, vol:boolean, plot:boolean, special?:string}>} */
  const KINDS = {
    depot:    { color: '#2a4b7c', vol: false, plot: false },
    transit:  { color: '#4f6f8f', vol: false, plot: false },
    central:  { color: '#b85c38', vol: true,  plot: true },
    periph:   { color: '#4a5d23', vol: true,  plot: false },
    metab:    { color: '#9c4f6a', vol: true,  plot: true },
    effect:   { color: '#7a8084', vol: false, plot: true, special: 'effect' },
    response: { color: '#5b8c3a', vol: false, plot: true, special: 'turnover' }
  };
  const kindLabel = (/** @type {string} */ kind) => /** @type {Record<string, string>} */ (lego.kinds)[kind] ?? kind;
  const order = ['depot', 'transit', 'central', 'periph', 'metab', 'effect', 'response'];

  let uid = 1;
  /** @type {Node[]} */
  let nodes = [];
  /** @type {Edge[]} */
  let edges = [];
  /** @type {Covariate[]} */
  let covariates = [];
  let mode = 'select'; // 'select' | 'connect'
  /** @type {number|null} */ let selectedId = null;
  /** @type {number|null} */ let connectFrom = null;
  let tMax = 24;

  const VBW = 620, VBH = 320, NW = 88, NH = 42;

  function firstPlotSource() {
    const c = nodes.find((n) => n.kind === 'central') ?? nodes.find((n) => KINDS[n.kind].vol);
    return c ? c.id : (nodes[0]?.id ?? 0);
  }
  /** @param {string} kind */
  function defaultName(kind) {
    const n = nodes.filter((x) => x.kind === kind).length + 1;
    return { depot: 'depot', transit: 'T' + n, central: 'centr', periph: 'p' + n, metab: 'met', effect: 'Ce', response: 'R' }[kind] ?? kind + n;
  }
  /** @param {string} kind */
  function addNode(kind) {
    const i = nodes.length;
    /** @type {Node} */
    const n = { id: uid++, kind, name: defaultName(kind), x: 40 + (i % 5) * 116, y: 40 + Math.floor(i / 5) * 100 };
    if (KINDS[kind].vol) n.vol = kind === 'central' ? 30 : kind === 'metab' ? 20 : 40;
    if (kind === 'depot') n.dose = 100;
    if (kind === 'central') n.dose = 0;
    if (kind === 'effect') { n.ke0 = 0.4; n.source = firstPlotSource(); }
    if (kind === 'response') { n.kin = 10; n.kout = 0.15; n.smax = 3; n.sc50 = 3; n.source = firstPlotSource(); }
    nodes = [...nodes, n];
    selectedId = n.id;
  }
  /** @param {number} id */
  function deleteNode(id) {
    nodes = nodes.filter((n) => n.id !== id);
    edges = edges.filter((e) => e.from !== id && e.to !== id);
    nodes = nodes.map((n) => (n.source === id ? { ...n, source: firstPlotSource() } : n));
    reconcileCovariates();
    if (selectedId === id) selectedId = null;
  }
  /** @param {number} id */
  function nodeClick(id) {
    if (mode === 'connect') {
      if (connectFrom === null) connectFrom = id;
      else {
        if (connectFrom !== id) edges = [...edges, { id: uid++, from: connectFrom, to: id, k: 0.5 }];
        reconcileCovariates();
        connectFrom = null; mode = 'select';
      }
    } else selectedId = id;
  }
  /** @param {number} id */
  function addElim(id) {
    edges = [...edges, { id: uid++, from: id, to: 'OUT', k: 0.2 }];
    reconcileCovariates();
  }
  /** @param {number} id */
  function deleteEdge(id) {
    edges = edges.filter((e) => e.id !== id);
    reconcileCovariates();
  }
  function clearAll() { nodes = []; edges = []; covariates = []; selectedId = null; }

  // ── presets (points de départ, entièrement modifiables ensuite) ──
  /** @param {string} name */
  function preset(name) {
    clearAll();
    const mk = (/** @type {string} */ kind, /** @type {number} */ x, /** @type {number} */ y, /** @type {any} */ extra = {}) => {
      const n = { id: uid++, kind, name: defaultName(kind), x, y, ...extra };
      if (KINDS[kind].vol && n.vol === undefined) n.vol = kind === 'central' ? 30 : 40;
      nodes = [...nodes, n];
      return n.id;
    };
    if (name === 'oral1') {
      const d = mk('depot', 40, 140, { dose: 100 }); const c = mk('central', 260, 140, { vol: 30 });
      edges = [{ id: uid++, from: d, to: c, k: 1.0 }, { id: uid++, from: c, to: 'OUT', k: 0.17 }];
    } else if (name === 'iv2') {
      const c = mk('central', 200, 140, { vol: 30, dose: 100 }); const p = mk('periph', 420, 140, { vol: 60 });
      edges = [{ id: uid++, from: c, to: p, k: 0.3 }, { id: uid++, from: p, to: c, k: 0.15 }, { id: uid++, from: c, to: 'OUT', k: 0.17 }];
    } else if (name === 'transit') {
      const t1 = mk('transit', 30, 140), t2 = mk('transit', 150, 140), t3 = mk('transit', 270, 140), c = mk('central', 420, 140, { vol: 30 });
      nodes = nodes.map((n) => (n.id === t1 ? { ...n, dose: 100 } : n));
      edges = [{ id: uid++, from: t1, to: t2, k: 1.5 }, { id: uid++, from: t2, to: t3, k: 1.5 }, { id: uid++, from: t3, to: c, k: 1.5 }, { id: uid++, from: c, to: 'OUT', k: 0.17 }];
    } else if (name === 'metab') {
      const c = mk('central', 180, 140, { vol: 30, dose: 100 }); const m = mk('metab', 420, 140, { vol: 20 });
      edges = [{ id: uid++, from: c, to: m, k: 0.12 }, { id: uid++, from: c, to: 'OUT', k: 0.1 }, { id: uid++, from: m, to: 'OUT', k: 0.05 }];
    } else if (name === 'effect') {
      const c = mk('central', 160, 90, { vol: 30, dose: 100 }); mk('effect', 400, 200, { ke0: 0.4, source: c });
      edges = [{ id: uid++, from: c, to: 'OUT', k: 0.2 }];
    }
    selectedId = null;
  }

  // ── drag ──
  /** @type {SVGSVGElement} */ let svgEl;
  let dragId = /** @type {number|null} */ (null);
  let dragOff = { x: 0, y: 0 };
  /** @param {PointerEvent} e */
  function toSvg(e) {
    const r = svgEl.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * VBW, y: ((e.clientY - r.top) / r.height) * VBH };
  }
  /** @param {PointerEvent} e @param {Node} n */
  function startDrag(e, n) {
    if (mode === 'connect') return;
    const p = toSvg(e); dragId = n.id; dragOff = { x: p.x - n.x, y: p.y - n.y };
    /** @type {Element} */ (e.target).setPointerCapture?.(e.pointerId);
  }
  /** @param {PointerEvent} e */
  function moveDrag(e) {
    if (dragId === null) return;
    const p = toSvg(e);
    nodes = nodes.map((n) => (n.id === dragId ? { ...n, x: Math.max(0, Math.min(VBW - NW, p.x - dragOff.x)), y: Math.max(0, Math.min(VBH - NH, p.y - dragOff.y)) } : n));
  }
  function endDrag() { dragId = null; }

  $: selected = nodes.find((n) => n.id === selectedId) ?? null;
  const concSources = () => nodes.filter((n) => KINDS[n.kind].vol);
  const SCENARIO_COLORS = ['#2a4b7c', '#4a5d23', '#9c4f6a', '#b85c38', '#59636e', '#7b5b2e'];

  // ── simulation (RK4) ──
  function covariateType(/** @type {Covariate} */ covariate) {
    return covariate.type === 'categorical' ? 'categorical' : 'continuous';
  }

  function covariateFactor(/** @type {Covariate} */ covariate, /** @type {number} */ value) {
    if (covariateType(covariate) === 'categorical') {
      return value === Number(covariate.comparison) ? Math.exp(Number(covariate.beta)) : 1;
    }
    return Math.pow(value / Number(covariate.reference), Number(covariate.beta));
  }

  function simulateModel(currentNodes = nodes, currentEdges = edges, currentCovariates = covariates, horizon = tMax, referenceLabel = 'reference') {
    const N = currentNodes.length;
    if (!N) return { out: [], series: [] };
    const parameters = modelParams(currentNodes, currentEdges);
    const usableCovariates = validCovariates(parameters, currentCovariates);
    const plotNodes = currentNodes.filter((node) => KINDS[node.kind].plot);

    const run = (/** @type {Map<string, number>} */ values) => {
      const adjusted = (/** @type {string} */ name, /** @type {number} */ base) => usableCovariates
        .filter((covariate) => covariate.target === name)
        .reduce((value, covariate) => value * covariateFactor(covariate, values.get(covariateName(covariate.name)) ?? Number(covariate.reference)), base);
      const localNodes = currentNodes.map((node) => {
        const name = rid(node.name);
        return {
          ...node,
          vol: node.vol === undefined ? undefined : adjusted(`v_${name}`, Number(node.vol)),
          ke0: node.ke0 === undefined ? undefined : adjusted(`ke0_${name}`, Number(node.ke0)),
          kin: node.kin === undefined ? undefined : adjusted(`kin_${name}`, Number(node.kin)),
          kout: node.kout === undefined ? undefined : adjusted(`kout_${name}`, Number(node.kout)),
          smax: node.smax === undefined ? undefined : adjusted(`smax_${name}`, Number(node.smax)),
          sc50: node.sc50 === undefined ? undefined : adjusted(`sc50_${name}`, Number(node.sc50))
        };
      });
      const localEdges = currentEdges.map((edge) => {
        const from = rid(currentNodes.find((node) => node.id === edge.from)?.name ?? 'x');
        const to = edge.to === 'OUT' ? 'e' : rid(currentNodes.find((node) => node.id === edge.to)?.name ?? 'x');
        return { ...edge, k: adjusted(`k_${from}_${to}`, Number(edge.k)) };
      });
      const idx = new Map(localNodes.map((node, index) => [node.id, index]));
      const y0 = localNodes.map((node) => (node.kind === 'response' ? (node.kin ?? 0) / (node.kout || 1) : (node.dose ?? 0)));

    /** @param {number[]} y */
    function deriv(y) {
      const dy = new Array(N).fill(0);
        for (const e of localEdges) {
        const fi = idx.get(e.from); if (fi === undefined) continue;
          if (localNodes[fi].kind === 'effect' || localNodes[fi].kind === 'response') continue;
        const rate = e.k * y[fi];
        dy[fi] -= rate;
          if (e.to !== 'OUT') { const ti = idx.get(e.to); if (ti !== undefined && localNodes[ti].kind !== 'effect' && localNodes[ti].kind !== 'response') dy[ti] += rate; }
      }
        localNodes.forEach((n, i) => {
          if (n.kind === 'effect') { const si = idx.get(n.source ?? -1); const cp = si !== undefined ? (localNodes[si].vol ? y[si] / (localNodes[si].vol || 1) : y[si]) : 0; dy[i] = (n.ke0 ?? 0) * (cp - y[i]); }
          else if (n.kind === 'response') { const si = idx.get(n.source ?? -1); const cp = si !== undefined ? (localNodes[si].vol ? y[si] / (localNodes[si].vol || 1) : y[si]) : 0; dy[i] = (n.kin ?? 0) * (1 + (n.smax ?? 0) * cp / ((n.sc50 || 1) + cp)) - (n.kout ?? 0) * y[i]; }
      });
      return dy;
    }
      const steps = 800, dt = horizon / steps;
    let y = y0.slice();
    /** @type {{t:number, y:number[]}[]} */
    const out = [];
    for (let s = 0; s <= steps; s++) {
      out.push({ t: s * dt, y: y.slice() });
      const k1 = deriv(y);
      const k2 = deriv(y.map((v, i) => v + (dt / 2) * k1[i]));
      const k3 = deriv(y.map((v, i) => v + (dt / 2) * k2[i]));
      const k4 = deriv(y.map((v, i) => v + dt * k3[i]));
      y = y.map((v, i) => v + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
    }
      const series = plotNodes.map((n) => {
        const i = localNodes.findIndex((node) => node.id === n.id);
        const local = localNodes[i];
      const isResp = n.kind === 'response';
        const vals = out.map((o) => (local.vol ? o.y[i] / (local.vol || 1) : o.y[i]));
      return { name: n.name, color: KINDS[n.kind].color, resp: isResp, vals };
    });
    return { out, series };
    };

    const referenceValues = new Map(usableCovariates.map((covariate) => [covariateName(covariate.name), Number(covariate.reference)]));
    const comparisons = usableCovariates.filter((covariate) => covariate.compare);
    const reference = run(referenceValues);
    const referenceSeries = reference.series.map((serie) => ({
      ...serie,
      label: comparisons.length ? `${serie.name} · ${referenceLabel}` : serie.name,
      dash: serie.resp
    }));
    const comparisonSeries = comparisons.flatMap((covariate, scenarioIndex) => {
      const values = new Map(referenceValues);
      values.set(covariateName(covariate.name), Number(covariate.comparison));
      return run(values).series.map((serie, serieIndex) => ({
        ...serie,
        color: SCENARIO_COLORS[(scenarioIndex * Math.max(1, plotNodes.length) + serieIndex) % SCENARIO_COLORS.length],
        label: `${serie.name} · ${covariateName(covariate.name)} = ${fmt(Number(covariate.comparison))}`,
        dash: true
      }));
    });
    return { out: reference.out, series: [...referenceSeries, ...comparisonSeries] };
  }

  $: sim = simulateModel(nodes, edges, covariates, tMax, lego.reference);

  // échelles : concentrations (mg/L) sur l'axe ; réponses (turnover) rééchelonnées
  $: concMax = Math.max(0.01, ...sim.series.filter((s) => !s.resp).flatMap((s) => s.vals));
  $: respMax = Math.max(0.01, ...sim.series.filter((s) => s.resp).flatMap((s) => s.vals));
  const CW = 560, CH = 240, cm = { top: 12, right: 12, bottom: 32, left: 42 };
  $: ciW = CW - cm.left - cm.right;
  $: ciH = CH - cm.top - cm.bottom;
  $: cx = (/** @type {number} */ t) => (t / tMax) * ciW;
  /** @param {{resp:boolean, vals:number[]}} s */
  function pathOf(s) {
    const mx = s.resp ? respMax : concMax;
    return s.vals.map((v, i) => `${i ? 'L' : 'M'}${cx((i / (s.vals.length - 1)) * tMax).toFixed(1)},${(ciH - (Math.min(v, mx) / (mx * 1.08)) * ciH).toFixed(1)}`).join(' ');
  }

  // ── EDO générées ──
  $: odes = (() => {
    if (!nodes.length) return [lego.emptyEquations];
    const nm = (/** @type {number} */ id) => nodes.find((n) => n.id === id)?.name ?? '?';
    return nodes.map((n) => {
      if (n.kind === 'effect') return `dCe/dt = ke0·(${nodes.find((s) => s.id === n.source)?.name ?? 'Cp'}/V − Ce)`;
      if (n.kind === 'response') return `dR/dt = kin·(1 + Smax·Cp/(SC50+Cp)) − kout·R`;
      const inflow = edges.filter((e) => e.to === n.id).map((e) => `+ k_${nm(e.from)}_${n.name}·${nm(e.from)}`);
      const outflow = edges.filter((e) => e.from === n.id).map((e) => `− k_${n.name}_${e.to === 'OUT' ? 'elim' : nm(e.to)}·${n.name}`);
      return `d${n.name}/dt = ${[...inflow, ...outflow].join(' ') || '0'}`;
    }).concat(concSources().map((n) => `C_${n.name} = ${n.name} / V_${n.name}`));
  })();

  // ── génération de code ───────────────────────────────────────────────────────────
  // Quatre cibles synchronisées : nlmixr2 et NONMEM pour l'estimation, mrgsolve pour
  // la simulation et le pont TDM, MLXTRAN pour MonolixSuite. Chaque sortie reprend
  // les paramètres, la variabilité, l'erreur résiduelle et les covariables du graphe.
  // L'ancien générateur n'émettait qu'un bloc `model({…})` : illisible pour R.

  /** Identifiant sûr en R comme en C++ : sans accent, sans espace, jamais initié par un chiffre. */
  const rid = (/** @type {string} */ s) =>
    String(s ?? 'x').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^A-Za-z0-9_]/g, '_').replace(/^(?=\d)/, 'c_').slice(0, 32) || 'x';

  /** Nombre lisible : ni notation exponentielle, ni décimales inutiles. */
  const fmt = (/** @type {number} */ v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return '0';
    return String(Math.round(n * 1e6) / 1e6);
  };

  const nmOf = (/** @type {number} */ id) => rid(nodes.find((n) => n.id === id)?.name ?? 'x');

  /**
   * Tous les paramètres du graphe courant, avec leur valeur, leur unité et un
   * commentaire. `iiv` marque ceux qui reçoivent une variabilité inter-individuelle
   * par défaut — clairance et volume, les deux seuls qu'un jeu de données ordinaire
   * permet d'identifier.
   */
  function modelParams(currentNodes = nodes, currentEdges = edges) {
    /** @type {{name:string, value:number, unit:string, note:string, iiv:boolean}[]} */
    const out = [];
    const localName = (/** @type {number} */ id) => rid(currentNodes.find((node) => node.id === id)?.name ?? 'x');
    for (const e of currentEdges) {
      const from = localName(e.from);
      const to = e.to === 'OUT' ? 'e' : localName(e.to);
      out.push({
        name: `k_${from}_${to}`, value: e.k, unit: '1/h',
        note: e.to === 'OUT' ? `elimination depuis ${from}` : `transfert ${from} -> ${to}`,
        iiv: e.to === 'OUT'
      });
    }
    for (const n of currentNodes.filter((node) => KINDS[node.kind].vol)) {
      out.push({ name: `v_${rid(n.name)}`, value: n.vol ?? 1, unit: 'L', note: `volume de ${rid(n.name)}`, iiv: n.kind === 'central' });
    }
    for (const n of currentNodes) {
      const b = rid(n.name);
      if (n.kind === 'effect') out.push({ name: `ke0_${b}`, value: n.ke0 ?? 0.4, unit: '1/h', note: `equilibrage du compartiment d'effet ${b}`, iiv: false });
      if (n.kind === 'response') {
        out.push({ name: `kin_${b}`, value: n.kin ?? 10, unit: 'u/h', note: `production de ${b}`, iiv: false });
        out.push({ name: `kout_${b}`, value: n.kout ?? 0.15, unit: '1/h', note: `degradation de ${b}`, iiv: false });
        out.push({ name: `smax_${b}`, value: n.smax ?? 3, unit: '-', note: `effet maximal sur ${b}`, iiv: false });
        out.push({ name: `sc50_${b}`, value: n.sc50 ?? 3, unit: 'mg/L', note: `concentration a 50 % de l'effet`, iiv: false });
      }
    }
    return out;
  }

  const covariateName = (/** @type {string} */ value) => rid(value).toUpperCase();

  /** @param {ReturnType<typeof modelParams>} [parameters] */
  function validCovariates(parameters = modelParams(), currentCovariates = covariates) {
    const targets = new Set(parameters.map((parameter) => parameter.name));
    return currentCovariates.filter((covariate) =>
      targets.has(covariate.target) &&
      ['continuous', 'categorical'].includes(covariateType(covariate)) &&
      String(covariate.name ?? '').trim().length > 0 &&
      /^[A-Z][A-Z0-9_]{0,23}$/.test(covariateName(covariate.name)) &&
      Number.isFinite(Number(covariate.reference)) &&
      (covariateType(covariate) === 'categorical' || Number(covariate.reference) > 0) &&
      Number.isFinite(Number(covariate.comparison)) &&
      (covariateType(covariate) === 'categorical'
        ? Number(covariate.comparison) !== Number(covariate.reference)
        : Number(covariate.comparison) > 0) &&
      Number.isFinite(Number(covariate.beta))
    );
  }

  /** @param {ReturnType<typeof modelParams>} [parameters] */
  function covariatesAreValid(parameters = modelParams(), currentCovariates = covariates) {
    const valid = validCovariates(parameters, currentCovariates);
    const names = valid.map((covariate) => covariateName(covariate.name));
    return valid.length === currentCovariates.length && new Set(names).size === names.length;
  }

  function reconcileCovariates() {
    const targets = modelParams().map((parameter) => parameter.name);
    if (!targets.length) {
      covariates = [];
      return;
    }
    covariates = covariates.map((covariate) => ({
      ...covariate,
      type: covariateType(covariate),
      target: targets.includes(covariate.target) ? covariate.target : targets[0],
      comparison: Number.isFinite(Number(covariate.comparison))
        ? Number(covariate.comparison)
        : covariateType(covariate) === 'categorical' ? 1 : Number(covariate.reference) * 1.25,
      compare: covariate.compare !== false
    }));
  }

  function addCovariate(/** @type {'continuous'|'categorical'} */ type = 'continuous') {
    const target = modelParams()[0]?.name;
    if (!target || covariates.length >= 10) return;
    let index = covariates.length + 1;
    const existing = new Set(covariates.map((covariate) => covariateName(covariate.name)));
    let name = type === 'categorical'
      ? (existing.has('SEX') ? `CAT${index}` : 'SEX')
      : (existing.has('WT') ? `COV${index}` : 'WT');
    while (existing.has(name)) name = `${type === 'categorical' ? 'CAT' : 'COV'}${++index}`;
    const reference = type === 'continuous' && name === 'WT' ? 70 : type === 'continuous' ? 1 : 0;
    covariates = [...covariates, {
      id: uid++, name, type, target, reference,
      comparison: type === 'continuous' ? reference * 1.25 : 1,
      beta: type === 'continuous' ? 0.75 : 0.2,
      compare: true
    }];
  }

  function resetCovariateType(/** @type {Covariate} */ covariate) {
    if (covariateType(covariate) === 'categorical') {
      covariate.reference = 0;
      covariate.comparison = 1;
      covariate.beta = 0.2;
    } else {
      covariate.reference = covariateName(covariate.name) === 'WT' ? 70 : 1;
      covariate.comparison = covariate.reference * 1.25;
      covariate.beta = 0.75;
    }
    covariates = [...covariates];
  }

  /** @param {number} id */
  function deleteCovariate(id) {
    covariates = covariates.filter((covariate) => covariate.id !== id);
  }

  $: parameterChoices = modelParams(nodes, edges);

  /** Termes de l'EDO d'un compartiment de masse, dans la syntaxe passée en argument. */
  function massTerms(/** @type {any} */ n) {
    const b = rid(n.name);
    const terms = [];
    for (const e of edges.filter((x) => x.to === n.id)) terms.push(`+ k_${nmOf(e.from)}_${b}*${nmOf(e.from)}`);
    for (const e of edges.filter((x) => x.from === n.id)) terms.push(`- k_${b}_${e.to === 'OUT' ? 'e' : nmOf(e.to)}*${b}`);
    return terms.join(' ') || '0';
  }

  /**
   * Concentration pilotant un bloc PD : celle de son compartiment source.
   * Toujours PARENTHÉSÉE — l'expression est insérée au milieu d'un produit et d'un
   * quotient (`smax*C/(sc50+C)`), où une division nue changerait le résultat dès que
   * la source cesse d'être un simple rapport.
   */
  function driverConc(/** @type {any} */ n) {
    const src = nodes.find((s) => s.id === n.source);
    if (!src) return '0';
    return KINDS[src.kind]?.vol ? `(${rid(src.name)}/v_${rid(src.name)})` : rid(src.name);
  }

  /** Compartiment observé : le central si présent, sinon la première concentration. */
  $: observed = nodes.find((n) => n.kind === 'central') ?? concSources()[0] ?? null;

  // Le serveur public ne compile jamais le texte C++ recu. Cette specification est
  // validee puis transformee en code mrgsolve cote R, ce qui rend le pont Lego sur.
  function tdmModelSpec() {
    const safeNodes = nodes.map((n) => {
      /** @type {Record<string, string|number>} */
      const item = { id: n.id, kind: n.kind, name: rid(n.name), dose: Number(n.dose ?? 0) };
      if (KINDS[n.kind].vol) item.vol = Number(n.vol ?? 1);
      if (n.kind === 'effect') {
        item.ke0 = Number(n.ke0 ?? 0.4);
        item.source = Number(n.source ?? 0);
      }
      if (n.kind === 'response') {
        item.kin = Number(n.kin ?? 10);
        item.kout = Number(n.kout ?? 0.15);
        item.smax = Number(n.smax ?? 3);
        item.sc50 = Number(n.sc50 ?? 3);
        item.source = Number(n.source ?? 0);
      }
      return item;
    });
    return {
      version: 1,
      nodes: safeNodes,
      edges: edges.map((e) => ({ from: e.from, to: e.to, k: Number(e.k) })),
      covariates: validCovariates(modelParams(), covariates).map((covariate) => ({
        name: covariateName(covariate.name),
        type: covariateType(covariate),
        target: covariate.target,
        reference: Number(covariate.reference),
        comparison: Number(covariate.comparison),
        beta: Number(covariate.beta)
      }))
    };
  }

  // ── nlmixr2 (estimation) ──
  $: codeNlmixr = (() => {
    if (!nodes.length) return '# Ajoutez des compartiments : le code se génère au fur et à mesure.';
    const P = modelParams();
    const C = validCovariates(P, covariates);
    const dosed = nodes.filter((n) => (n.dose ?? 0) > 0);
    const w = Math.max(...P.map((p) => p.name.length), 6);
    const L = [];

    L.push('library(nlmixr2)');
    L.push('');
    L.push('# ---------------------------------------------------------------------------');
    L.push('# Jeu de donnees attendu : une ligne par enregistrement, colonnes');
    L.push('#   ID, TIME, DV, AMT, EVID, CMT  (+ vos covariables, p. ex. WT)');
    if (dosed.length) {
      L.push(`#   Les lignes de dose portent EVID = 1 et CMT = "${rid(dosed[0].name)}"` +
        (dosed.length > 1 ? ` (autres compartiments dosés : ${dosed.slice(1).map((n) => rid(n.name)).join(', ')})` : ''));
    } else {
      L.push('#   Aucun compartiment ne porte de dose dans l\'atelier : réglez-en une.');
    }
    if (observed) L.push(`#   Les lignes d'observation portent EVID = 0 et CMT = "C_${rid(observed.name)}"`);
    L.push('# ---------------------------------------------------------------------------');
    L.push('');
    L.push('lego_model <- function() {');
    L.push('  ini({');
    L.push('    # Effets fixes estimes sur l\'echelle log : la valeur reste positive.');
    for (const p of P) L.push(`    l${p.name.padEnd(w)} <- log(${fmt(p.value)})${' '.repeat(Math.max(1, 10 - fmt(p.value).length))}# ${p.note} (${p.unit})`);
    const iiv = P.filter((p) => p.iiv);
    if (iiv.length) {
      L.push('');
      L.push('    # Variabilite inter-individuelle : variances des eta (0.09 ~ 30 % de CV).');
      for (const p of iiv) L.push(`    eta_${p.name.padEnd(w)} ~ 0.09`);
    }
    if (C.length) {
      L.push('');
      L.push('    # Covariables : effet puissance pour une continue, effet exponentiel pour une categorie.');
      for (const covariate of C) {
        const name = covariateName(covariate.name);
        L.push(`    beta_${name}_${covariate.target} <- ${fmt(covariate.beta)}`);
      }
    }
    L.push('');
    L.push('    # Erreur residuelle (combinee : additive + proportionnelle).');
    L.push('    add_err <- 0.05      # mg/L');
    L.push('    prop_err <- 0.2      # fraction');
    L.push('  })');
    L.push('');
    L.push('  model({');
    L.push('    # Retour a l\'echelle naturelle, eta compris.');
    for (const p of P) {
      const eta = p.iiv ? ` + eta_${p.name}` : '';
      const effects = C
        .filter((covariate) => covariate.target === p.name)
        .map((covariate) => {
          const name = covariateName(covariate.name);
          return covariateType(covariate) === 'categorical'
            ? ` + beta_${name}_${p.name}*(${name} == ${fmt(covariate.comparison)})`
            : ` + beta_${name}_${p.name}*log(${name}/${fmt(covariate.reference)})`;
        })
        .join('');
      L.push(`    ${p.name.padEnd(w)} <- exp(l${p.name}${effects}${eta})`);
    }
    const resp = nodes.filter((n) => n.kind === 'response');
    if (resp.length) {
      L.push('');
      L.push('    # Etat initial des reponses : le systeme part de son equilibre.');
      for (const n of resp) L.push(`    ${rid(n.name)}(0) <- kin_${rid(n.name)}/kout_${rid(n.name)}`);
    }
    L.push('');
    for (const n of nodes) {
      const b = rid(n.name);
      if (n.kind === 'effect') { L.push(`    d/dt(${b}) = ke0_${b}*(${driverConc(n)} - ${b})`); continue; }
      if (n.kind === 'response') { L.push(`    d/dt(${b}) = kin_${b}*(1 + smax_${b}*${driverConc(n)}/(sc50_${b} + ${driverConc(n)})) - kout_${b}*${b}`); continue; }
      L.push(`    d/dt(${b}) = ${massTerms(n)}`);
    }
    L.push('');
    for (const n of concSources()) L.push(`    C_${rid(n.name)} <- ${rid(n.name)}/v_${rid(n.name)}`);
    if (observed) {
      L.push('');
      L.push(`    C_${rid(observed.name)} ~ add(add_err) + prop(prop_err)`);
    }
    L.push('  })');
    L.push('}');
    L.push('');
    L.push('# ---------------------------------------------------------------------------');
    L.push('fit <- nlmixr2(lego_model, data, est = "saem",');
    L.push('               control = saemControl(print = 0),');
    L.push('               table   = tableControl(cwres = TRUE, npde = TRUE))');
    L.push('print(fit)');
    L.push('plot(fit)   # diagnostics : GOF, VPC-like, distributions des eta');
    return L.join('\n');
  })();

  // ── mrgsolve compatible avec le moteur TDM/mapbayr ──
  $: tdmReady = Boolean(observed && modelParams().length && covariatesAreValid(modelParams(), covariates));
  $: codeMrgsolve = (() => {
    if (!nodes.length) return '# Ajoutez des compartiments : le code se génère au fur et à mesure.';
    if (!observed) return '# Ajoutez un compartiment central, périphérique ou métabolite pour définir la concentration observée.';
    const P = modelParams();
    const C = validCovariates(P, covariates);
    const dosed = nodes.filter((n) => (n.dose ?? 0) > 0);
    const adm = dosed[0] ?? nodes.find((n) => n.kind !== 'effect' && n.kind !== 'response') ?? nodes[0];
    const randomParams = P.filter((p) => p.iiv);
    if (!randomParams.length && P.length) randomParams.push(P[0]);
    const etaIndex = new Map(randomParams.map((p, index) => [p.name, index + 1]));
    const w = Math.max(...P.map((p) => `TV_${p.name}`.length), 8);
    const L = [];

    L.push(`// PK_LEGO_SPEC_V1:${encodeURIComponent(JSON.stringify(tdmModelSpec()))}`);
    L.push('$PARAM @annotated');
    for (const p of P) L.push(`${`TV_${p.name}`.padEnd(w)} : ${fmt(p.value)} : valeur typique, ${p.note} (${p.unit})`);
    for (const covariate of C) {
      const name = covariateName(covariate.name);
      const effect = covariateType(covariate) === 'categorical' ? 'effet categoriel' : 'effet puissance';
      L.push(`BETA_${name}_${covariate.target} : ${fmt(covariate.beta)} : ${effect} de ${name} sur ${covariate.target}`);
    }
    for (const [index, p] of randomParams.entries()) {
      L.push(`${`ETA${index + 1}`.padEnd(w)} : 0 : effet individuel sur ${p.name}`);
    }
    if (C.length) {
      L.push('');
      L.push('$PARAM @covariates @annotated');
      for (const covariate of C) {
        const name = covariateName(covariate.name);
        const description = covariateType(covariate) === 'categorical'
          ? `covariable categorielle, reference ${fmt(covariate.reference)}, modalite avec effet ${fmt(covariate.comparison)}`
          : 'covariable continue, valeur de reference';
        L.push(`${name} : ${fmt(covariate.reference)} : ${description}`);
      }
    }
    L.push('');
    L.push('$OMEGA @annotated');
    for (const p of randomParams) L.push(`IIV_${p.name} : 0.09 : variance interindividuelle sur ${p.name}`);
    L.push('');
    L.push('$SIGMA @annotated');
    L.push('PROP : 0.04 : variance de l\'erreur proportionnelle');
    L.push('ADD  : 0.01 : variance de l\'erreur additive');
    L.push('');
    L.push('$CMT @annotated');
    for (const n of nodes) {
      const b = rid(n.name);
      const u = n.kind === 'effect' ? 'concentration a l\'effet (mg/L)'
        : n.kind === 'response' ? 'reponse (unites du marqueur)'
        : `quantite dans ${b} (mg)`;
      const tags = [];
      if (n.id === adm.id) tags.push('ADM');
      if (n.id === observed.id) tags.push('OBS');
      L.push(`${b.padEnd(w)} : ${u}${tags.length ? ` [${tags.join(', ')}]` : ''}`);
    }
    L.push('');
    L.push('$MAIN');
    L.push('// Parametres individuels et effets simples de covariables.');
    for (const p of P) {
      const eta = etaIndex.get(p.name);
      const effects = C
        .filter((covariate) => covariate.target === p.name)
        .map((covariate) => {
          const name = covariateName(covariate.name);
          return covariateType(covariate) === 'categorical'
            ? ` * exp(BETA_${name}_${p.name} * (${name} == ${fmt(covariate.comparison)}))`
            : ` * pow(${name}/${fmt(covariate.reference)}, BETA_${name}_${p.name})`;
        })
        .join('');
      L.push(`double ${p.name} = TV_${p.name}${effects}${eta ? ` * exp(ETA${eta} + ETA(${eta}))` : ''};`);
    }
    const resp = nodes.filter((n) => n.kind === 'response');
    if (resp.length) {
      L.push('');
      L.push('// Le systeme de turnover demarre a son equilibre, pas a zero.');
      for (const n of resp) L.push(`${rid(n.name)}_0 = kin_${rid(n.name)}/kout_${rid(n.name)};`);
    }
    L.push('');
    L.push('$ODE');
    // Les concentrations qui pilotent un bloc PD sont écrites en toutes lettres dans
    // l'équation : déclarer un `double` intermédiaire ici le laisserait inutilisé.
    for (const n of nodes) {
      const b = rid(n.name);
      if (n.kind === 'effect') { L.push(`dxdt_${b} = ke0_${b}*(${driverConc(n).replace('/', '/')} - ${b});`); continue; }
      if (n.kind === 'response') { L.push(`dxdt_${b} = kin_${b}*(1 + smax_${b}*${driverConc(n)}/(sc50_${b} + ${driverConc(n)})) - kout_${b}*${b};`); continue; }
      L.push(`dxdt_${b} = ${massTerms(n)};`);
    }
    if (concSources().length) {
      L.push('');
      L.push('$TABLE');
      for (const n of concSources()) L.push(`double CONC_${rid(n.name)} = ${rid(n.name)}/v_${rid(n.name)};`);
      L.push(`double IPRED = CONC_${rid(observed.name)};`);
      L.push('double DV = IPRED * (1 + EPS(1)) + EPS(2);');
      L.push('if (DV < 0) DV = 0;');
    }
    L.push('');
    L.push('$CAPTURE @annotated');
    L.push('DV : concentration simulee avec erreur residuelle (mg/L)');
    for (const n of concSources()) L.push(`CONC_${rid(n.name)} : concentration dans ${rid(n.name)} (mg/L)`);
    for (const n of nodes.filter((x) => x.kind === 'effect' || x.kind === 'response')) {
      L.push(`${rid(n.name)} : ${n.kind === 'effect' ? 'concentration au site d\'effet (mg/L)' : 'reponse'}`);
    }
    return L.join('\n');
  })();

  // ── MLXTRAN complet (Monolix / Simulx) ──
  $: codeMlxtran = (() => {
    if (!nodes.length) return '; Ajoutez des compartiments : le code se génère au fur et à mesure.';
    if (!observed) return '; Ajoutez un compartiment central, périphérique ou métabolite pour définir la concentration observée.';
    const P = modelParams();
    const C = validCovariates(P, covariates);
    const dosed = nodes.filter((n) => (n.dose ?? 0) > 0);
    const continuous = C.filter((covariate) => covariateType(covariate) === 'continuous');
    const categorical = C.filter((covariate) => covariateType(covariate) === 'categorical');
    const betaName = (/** @type {Covariate} */ covariate) => `beta_${covariateName(covariate.name)}_${covariate.target}`;
    const transformedName = (/** @type {Covariate} */ covariate) => `logt_${covariateName(covariate.name)}`;
    const individualInputs = [
      ...P.map((parameter) => `${parameter.name}_pop`),
      ...P.filter((parameter) => parameter.iiv).map((parameter) => `omega_${parameter.name}`),
      ...C.map(betaName),
      ...continuous.map(transformedName),
      ...categorical.map((covariate) => covariateName(covariate.name))
    ];
    const L = [];

    L.push('DESCRIPTION:');
    L.push('Modele genere par l\'Atelier Lego de Pharmacometrie Pratique.');
    L.push('');
    L.push('; Valeurs initiales suggerees pour les parametres de population :');
    for (const parameter of P) {
      L.push(`;   ${parameter.name}_pop = ${fmt(parameter.value)} ; ${parameter.note} (${parameter.unit})`);
      if (parameter.iiv) L.push(`;   omega_${parameter.name} = 0.3 ; ecart-type interindividuel`);
    }
    for (const covariate of C) L.push(`;   ${betaName(covariate)} = ${fmt(covariate.beta)}`);
    L.push(';   a = 0.1 ; erreur additive, b = 0.2 ; erreur proportionnelle');

    if (C.length) {
      L.push('');
      L.push('[COVARIATE]');
      L.push(`input = {${C.map((covariate) => covariateName(covariate.name)).join(', ')}}`);
      for (const covariate of categorical) {
        const name = covariateName(covariate.name);
        L.push(`${name} = {type=categorical, categories={${fmt(covariate.reference)}, ${fmt(covariate.comparison)}}}`);
      }
      if (continuous.length) {
        L.push('');
        L.push('EQUATION:');
        for (const covariate of continuous) {
          const name = covariateName(covariate.name);
          L.push(`${transformedName(covariate)} = log(${name}/${fmt(covariate.reference)})`);
        }
      }
    }

    L.push('');
    L.push('[INDIVIDUAL]');
    L.push(`input = {${individualInputs.join(', ')}}`);
    for (const covariate of categorical) {
      const name = covariateName(covariate.name);
      L.push(`${name} = {type=categorical, categories={${fmt(covariate.reference)}, ${fmt(covariate.comparison)}}}`);
    }
    L.push('');
    L.push('DEFINITION:');
    for (const parameter of P) {
      const effects = C.filter((covariate) => covariate.target === parameter.name);
      const options = [
        'distribution=logNormal',
        `typical=${parameter.name}_pop`
      ];
      if (effects.length) {
        const covariateTerms = effects.map((covariate) => covariateType(covariate) === 'continuous'
          ? transformedName(covariate)
          : covariateName(covariate.name));
        const coefficientTerms = effects.map((covariate) => covariateType(covariate) === 'continuous'
          ? betaName(covariate)
          : `{0, ${betaName(covariate)}}`);
        options.push(`covariate=${effects.length === 1 ? covariateTerms[0] : `{${covariateTerms.join(', ')}}`}`);
        options.push(`coefficient=${effects.length === 1 ? coefficientTerms[0] : `{${coefficientTerms.join(', ')}}`}`);
      }
      options.push(parameter.iiv ? `sd=omega_${parameter.name}` : 'no-variability');
      L.push(`${parameter.name} = {${options.join(', ')}}`);
    }

    L.push('');
    L.push('[LONGITUDINAL]');
    L.push(`input = {${[...P.map((parameter) => parameter.name), 'a', 'b'].join(', ')}}`);
    L.push('');
    L.push('PK:');
    if (dosed.length) {
      dosed.forEach((node, index) => {
        const administration = dosed.length > 1 ? `, adm=${index + 1}` : '';
        L.push(`depot(target=${rid(node.name)}${administration})`);
      });
    } else {
      L.push('; Aucun compartiment dose : attribuez une dose dans l\'atelier.');
    }
    L.push('');
    L.push('EQUATION:');
    L.push('odeType = stiff');
    L.push('t_0 = 0');
    for (const node of nodes) {
      const name = rid(node.name);
      const initial = node.kind === 'response' ? `kin_${name}/kout_${name}` : '0';
      L.push(`${name}_0 = ${initial}`);
    }
    L.push('');
    for (const node of nodes) {
      const name = rid(node.name);
      if (node.kind === 'effect') {
        L.push(`ddt_${name} = ke0_${name}*(${driverConc(node)} - ${name})`);
      } else if (node.kind === 'response') {
        L.push(`ddt_${name} = kin_${name}*(1 + smax_${name}*${driverConc(node)}/(sc50_${name} + ${driverConc(node)})) - kout_${name}*${name}`);
      } else {
        L.push(`ddt_${name} = ${massTerms(node)}`);
      }
    }
    L.push('');
    for (const node of concSources()) L.push(`C_${rid(node.name)} = ${rid(node.name)}/v_${rid(node.name)}`);
    L.push('');
    L.push('DEFINITION:');
    L.push(`DV = {distribution=normal, prediction=C_${rid(observed.name)}, errorModel=combined1(a, b)}`);
    L.push('');
    L.push('OUTPUT:');
    L.push('output = {DV}');
    const tableOutputs = [
      ...concSources().map((node) => `C_${rid(node.name)}`),
      ...nodes.filter((node) => node.kind === 'effect' || node.kind === 'response').map((node) => rid(node.name))
    ];
    if (tableOutputs.length) L.push(`table = {${tableOutputs.join(', ')}}`);
    return L.join('\n');
  })();

  // ── NONMEM / NM-TRAN : ODE générales avec ADVAN13 ──
  $: codeNonmem = (() => {
    if (!nodes.length) return '; Ajoutez des compartiments : le control stream se génère au fur et à mesure.';
    if (!observed) return '; Ajoutez un compartiment central, périphérique ou métabolite pour définir la concentration observée.';
    const P = modelParams();
    const C = validCovariates(P, covariates);
    const dosed = nodes.filter((node) => (node.dose ?? 0) > 0);
    const adm = dosed[0] ?? nodes.find((node) => node.kind !== 'effect' && node.kind !== 'response') ?? nodes[0];
    const nodeIndex = new Map(nodes.map((node, index) => [node.id, index + 1]));
    const parameterVariable = new Map(P.map((parameter, index) => [parameter.name, `P${index + 1}`]));
    const thetaIndex = new Map(P.map((parameter, index) => [parameter.name, index + 1]));
    const betaIndex = new Map(C.map((covariate, index) => [covariate.id, P.length + index + 1]));
    const randomParameters = P.filter((parameter) => parameter.iiv);
    const etaIndex = new Map(randomParameters.map((parameter, index) => [parameter.name, index + 1]));
    const categorical = C.filter((covariate) => covariateType(covariate) === 'categorical');
    const categoryIndicator = new Map(categorical.map((covariate, index) => [covariate.id, `CAT${index + 1}`]));
    const nonmemCovariate = new Map(C.map((covariate, index) => {
      const name = covariateName(covariate.name);
      return [covariate.id, name.length <= 20 ? name : `COV${index + 1}_${name.slice(0, 13)}`];
    }));
    const pvar = (/** @type {string} */ name) => parameterVariable.get(name) ?? '0';
    const state = (/** @type {number} */ id) => `A(${nodeIndex.get(id) ?? 1})`;
    const nonmemDriver = (/** @type {Node} */ node) => {
      const source = nodes.find((candidate) => candidate.id === node.source);
      if (!source) return '0';
      const amount = state(source.id);
      return KINDS[source.kind]?.vol ? `(${amount}/${pvar(`v_${rid(source.name)}`)})` : amount;
    };
    const nonmemMassTerms = (/** @type {Node} */ node) => {
      const terms = [];
      for (const edge of edges.filter((candidate) => candidate.to === node.id)) {
        terms.push(`+ ${pvar(`k_${nmOf(edge.from)}_${rid(node.name)}`)}*${state(edge.from)}`);
      }
      for (const edge of edges.filter((candidate) => candidate.from === node.id)) {
        terms.push(`- ${pvar(`k_${rid(node.name)}_${edge.to === 'OUT' ? 'e' : nmOf(edge.to)}`)}*${state(node.id)}`);
      }
      return terms.join(' ') || '0';
    };
    const L = [];

    L.push('$PROBLEM Atelier Lego - modele PK/PD genere');
    L.push('; Donnees attendues : une ligne par evenement dans data.csv.');
    L.push('; Colonnes minimales : ID TIME DV AMT EVID MDV CMT' + (C.length ? ` ${C.map((covariate) => nonmemCovariate.get(covariate.id)).join(' ')}` : ''));
    L.push(`; Compartiment dose par defaut : ${nodeIndex.get(adm.id)} (${rid(adm.name)}). Observation : ${nodeIndex.get(observed.id)} (${rid(observed.name)}).`);
    for (const covariate of C) {
      const sourceName = covariateName(covariate.name);
      const dataName = nonmemCovariate.get(covariate.id);
      if (sourceName !== dataName) L.push(`; Renommer la colonne ${sourceName} en ${dataName} pour NONMEM.`);
    }
    L.push(`$INPUT ID TIME DV AMT EVID MDV CMT${C.length ? ` ${C.map((covariate) => nonmemCovariate.get(covariate.id)).join(' ')}` : ''}`);
    L.push('$DATA data.csv IGNORE=@');
    L.push('$SUBROUTINES ADVAN13 TOL=9');
    L.push('$MODEL');
    for (const node of nodes) {
      const tags = [];
      if (node.id === adm.id) tags.push('DEFDOSE');
      if (node.id === observed.id) tags.push('DEFOBS');
      const compartmentName = `C${nodeIndex.get(node.id)}_${rid(node.name).toUpperCase().slice(0, 12)}`;
      L.push(`COMP=(${compartmentName}${tags.length ? `,${tags.join(',')}` : ''})`);
    }
    L.push('');
    L.push('$PK');
    L.push('; P1, P2, ... correspondent aux parametres listes dans $THETA.');
    for (const covariate of categorical) {
      const indicator = categoryIndicator.get(covariate.id);
      const name = nonmemCovariate.get(covariate.id);
      L.push(`${indicator}=0`);
      L.push(`IF (${name}.EQ.${fmt(covariate.comparison)}) ${indicator}=1`);
    }
    for (const parameter of P) {
      const typical = `TV${parameterVariable.get(parameter.name)}`;
      const effects = C
        .filter((covariate) => covariate.target === parameter.name)
        .map((covariate) => {
          const beta = `THETA(${betaIndex.get(covariate.id)})`;
          return covariateType(covariate) === 'categorical'
            ? `*EXP(${beta}*${categoryIndicator.get(covariate.id)})`
            : `*(${nonmemCovariate.get(covariate.id)}/${fmt(covariate.reference)})**${beta}`;
        })
        .join('');
      L.push(`${typical}=THETA(${thetaIndex.get(parameter.name)})${effects}`);
      const eta = etaIndex.get(parameter.name);
      L.push(`${parameterVariable.get(parameter.name)}=${typical}${eta ? `*EXP(ETA(${eta}))` : ''}`);
    }
    const responseNodes = nodes.filter((candidate) => candidate.kind === 'response');
    if (responseNodes.length) {
      L.push('IF (A_0FLG.EQ.1) THEN');
      for (const node of responseNodes) {
        const name = rid(node.name);
        L.push(`  A_0(${nodeIndex.get(node.id)})=${pvar(`kin_${name}`)}/${pvar(`kout_${name}`)}`);
      }
      L.push('ENDIF');
    }
    L.push('');
    L.push('$DES');
    for (const node of nodes) {
      const name = rid(node.name);
      const index = nodeIndex.get(node.id);
      if (node.kind === 'effect') {
        L.push(`DADT(${index})=${pvar(`ke0_${name}`)}*(${nonmemDriver(node)}-A(${index}))`);
      } else if (node.kind === 'response') {
        const driver = nonmemDriver(node);
        L.push(`DADT(${index})=${pvar(`kin_${name}`)}*(1+${pvar(`smax_${name}`)}*${driver}/(${pvar(`sc50_${name}`)}+${driver}))-${pvar(`kout_${name}`)}*A(${index})`);
      } else {
        L.push(`DADT(${index})=${nonmemMassTerms(node)}`);
      }
    }
    L.push('');
    L.push('$ERROR');
    L.push(`IPRED=A(${nodeIndex.get(observed.id)})/${pvar(`v_${rid(observed.name)}`)}`);
    L.push('Y=IPRED*(1+EPS(1))+EPS(2)');
    L.push('');
    L.push('$THETA');
    for (const parameter of P) {
      L.push(`(0, ${fmt(parameter.value)}) ; THETA(${thetaIndex.get(parameter.name)}) -> ${parameterVariable.get(parameter.name)} = ${parameter.name}, ${parameter.note} (${parameter.unit})`);
    }
    for (const covariate of C) {
      L.push(`(-10, ${fmt(covariate.beta)}, 10) ; THETA(${betaIndex.get(covariate.id)}) -> effet ${covariateName(covariate.name)} sur ${covariate.target}`);
    }
    L.push('');
    L.push('$OMEGA');
    if (randomParameters.length) {
      for (const parameter of randomParameters) L.push(`0.09 ; ETA(${etaIndex.get(parameter.name)}) -> IIV ${parameter.name}`);
    } else {
      L.push('0 FIX ; aucune variabilite interindividuelle selectionnee');
    }
    L.push('');
    L.push('$SIGMA');
    L.push('0.04 ; EPS(1), variance proportionnelle');
    L.push('0.01 ; EPS(2), variance additive');
    L.push('');
    L.push('$ESTIMATION METHOD=1 INTERACTION MAXEVAL=9999 PRINT=5 SIGDIGITS=3');
    L.push('$COVARIANCE PRINT=E MATRIX=S');
    L.push('$TABLE ID TIME DV IPRED CWRES NOPRINT ONEHEADER FILE=lego_results.csv');
    return L.join('\n');
  })();

  // ── onglets + copie ──
  // ATTENTION : ne PAS nommer cette fonction `copy` — ce nom est déjà celui de la
  // variable réactive d'internationalisation ci-dessus, et la collision casse
  // l'hydratation de toute la page.
  let codeTab = 'nlmixr2';
  let copiedTab = '';
  let transferredCode = '';
  /** @type {ReturnType<typeof setTimeout> | undefined} */ let copyTimer;
  $: activeCode = codeTab === 'nlmixr2' ? codeNlmixr
    : codeTab === 'mrgsolve' ? codeMrgsolve
      : codeTab === 'mlxtran' ? codeMlxtran
        : codeNonmem;
  $: activeCodeNote = codeTab === 'nlmixr2' ? copy.pages.legoNoteNlmixr
    : codeTab === 'mrgsolve' ? copy.pages.legoNoteMrgsolve
      : codeTab === 'mlxtran' ? copy.pages.legoNoteMlxtran
        : copy.pages.legoNoteNonmem;
  async function copierCode() {
    try {
      await navigator.clipboard.writeText(activeCode);
      copiedTab = codeTab;
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => (copiedTab = ''), 2000);
    } catch (e) {
      // Presse-papiers refusé : le texte reste sélectionnable à la main.
    }
  }

  async function ouvrirDansTdm() {
    if (!tdmReady) return;
    codeTab = 'mrgsolve';
    const code = codeMrgsolve;

    try {
      await navigator.clipboard.writeText(code);
      copiedTab = 'mrgsolve';
    } catch (e) {
      // Le transfert direct reste disponible si le presse-papiers est refusé.
    }

    const targetUrl = new URL(tdmEngineUrl, window.location.href);
    targetUrl.searchParams.set('source', 'custom');
    targetUrl.searchParams.set('bridge', 'lego');
    const targetWindow = window.open(targetUrl.toString(), 'pk_tdm_engine');
    if (!targetWindow) return;

    const targetOrigin = targetUrl.origin;
    const message = { type: 'pk-lego-model', name: 'lego_model', code, spec: tdmModelSpec() };
    let attempts = 0;
    /** @type {ReturnType<typeof setInterval> | undefined} */
    let transferTimer;

    const cleanup = () => {
      if (transferTimer) clearInterval(transferTimer);
      window.removeEventListener('message', acknowledge);
    };
    /** @param {MessageEvent} event */
    const acknowledge = (event) => {
      if (event.source !== targetWindow || event.origin !== targetOrigin || event.data?.type !== 'pk-lego-model-ack') return;
      transferredCode = code;
      cleanup();
    };
    const transmit = () => {
      attempts += 1;
      if (attempts > 40 || targetWindow.closed) return cleanup();
      targetWindow.postMessage(message, targetOrigin);
    };

    window.addEventListener('message', acknowledge);
    transmit();
    transferTimer = setInterval(transmit, 500);
  }

  /** @param {Node} n */
  const cxn = (n) => n.x + NW / 2;
  /** @param {Node} n */
  const cyn = (n) => n.y + NH / 2;
</script>

<header class="head">
  <p class="eyebrow">{copy.pages.legoEyebrow}</p>
  <h1>{copy.pages.legoTitle}</h1>
  <p class="lede">{lego.lede}</p>
</header>

<div class="toolbar">
  <div class="tgroup">
    <span class="tlabel">{lego.add}</span>
    {#each order as kind}
      <button class="add" style={`--c:${KINDS[kind].color}`} on:click={() => addNode(kind)}>+ {kindLabel(kind)}</button>
    {/each}
  </div>
  <div class="tgroup">
    <span class="tlabel">{lego.arrow}</span>
    <button class:on={mode === 'connect'} on:click={() => { mode = mode === 'connect' ? 'select' : 'connect'; connectFrom = null; }}>
      {mode === 'connect' ? (connectFrom === null ? lego.clickSource : lego.clickTarget) : `↳ ${lego.connect}`}
    </button>
  </div>
  <div class="tgroup">
    <span class="tlabel">{lego.templates}</span>
    <button on:click={() => preset('oral1')}>Oral 1-cpt</button>
    <button on:click={() => preset('iv2')}>IV 2-cpt</button>
    <button on:click={() => preset('transit')}>Transit ×3</button>
    <button on:click={() => preset('metab')}>{lego.parentMetabolite}</button>
    <button on:click={() => preset('effect')}>{kindLabel('effect')}</button>
    <button class="clear" on:click={clearAll}>{lego.clear}</button>
  </div>
  <label class="s"><span>{lego.duration}</span><input class="num" type="number" min="1" step="1" bind:value={tMax} /></label>
</div>

<div class="builder">
  <div class="stage">
    <svg bind:this={svgEl} viewBox={`0 0 ${VBW} ${VBH}`} class="canvas" on:pointermove={moveDrag} on:pointerup={endDrag} on:pointerleave={endDrag} role="application" aria-label={lego.editorAria}>
      <defs>
        <marker id="arw" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="var(--text-secondary)" /></marker>
      </defs>
      <!-- flèches -->
      {#each edges as e}
        {@const from = nodes.find((n) => n.id === e.from)}
        {#if from}
          {#if e.to === 'OUT'}
            <line x1={cxn(from)} y1={from.y + NH} x2={cxn(from)} y2={from.y + NH + 30} class="edge" marker-end="url(#arw)" />
            <text x={cxn(from) + 6} y={from.y + NH + 22} class="klbl">k={e.k.toFixed(2)}</text>
            <text x={cxn(from) - 6} y={from.y + NH + 34} class="elim">{lego.eliminationShort}</text>
          {:else}
            {@const to = nodes.find((n) => n.id === e.to)}
            {#if to}
              <line x1={cxn(from)} y1={cyn(from)} x2={cxn(to)} y2={cyn(to)} class="edge" marker-end="url(#arw)" />
              <text x={(cxn(from) + cxn(to)) / 2} y={(cyn(from) + cyn(to)) / 2 - 4} class="klbl">k={e.k.toFixed(2)}</text>
            {/if}
          {/if}
        {/if}
      {/each}
      <!-- compartiments -->
      {#each nodes as n}
        <g transform={`translate(${n.x},${n.y})`} class="node" class:sel={selectedId === n.id} class:cf={connectFrom === n.id}
           on:pointerdown={(e) => startDrag(e, n)} on:click={() => nodeClick(n.id)}
           on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nodeClick(n.id); } }} role="button" tabindex="0">
          <rect width={NW} height={NH} rx="7" style={`fill:color-mix(in srgb, ${KINDS[n.kind].color} 15%, var(--bg-tertiary)); stroke:${KINDS[n.kind].color}`} />
          <text x={NW / 2} y={17} class="nname">{n.name}</text>
          <text x={NW / 2} y={31} class="nkind">{kindLabel(n.kind)}{n.dose ? ` · ${n.dose}mg` : ''}</text>
        </g>
      {/each}
      {#if !nodes.length}<text x={VBW / 2} y={VBH / 2} class="hintxt">{lego.emptyCanvas}</text>{/if}
    </svg>

    <!-- courbe simulée -->
    <div class="chart-panel">
      <svg viewBox={`0 0 ${CW} ${CH}`} class="chart" role="img" aria-label={lego.chartAria}>
        <g transform={`translate(${cm.left},${cm.top})`}>
          <line x1="0" x2="0" y1="0" y2={ciH} class="axis" />
          <line x1="0" x2={ciW} y1={ciH} y2={ciH} class="axis" />
          {#each sim.series as s}
            <path d={pathOf(s)} style={`stroke:${s.color}`} class="serie" class:dash={s.dash} />
          {/each}
          <text x={ciW / 2} y={ciH + 24} class="lbl">{lego.time}</text>
        </g>
      </svg>
      {#if sim.series.length}
        <div class="chart-legend" aria-label={lego.legendAria}>
          {#each sim.series as s}
            <span class="legend-item">
              <i style={`--series-color:${s.color}`} class:dash={s.dash}></i>
              <span>{s.label}{s.resp ? ` (${lego.rescaled})` : ' (mg/L)'}</span>
            </span>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <div class="side">
    {#if selected}
      <div class="editor">
        <div class="ehead"><strong>{selected.name}</strong><span>{kindLabel(selected.kind)}</span></div>
        <label class="s"><span>{lego.name}</span><input class="txt" bind:value={selected.name} on:input={() => { nodes = nodes; reconcileCovariates(); }} /></label>
        {#if KINDS[selected.kind].vol}<label class="s"><span>Volume (L)</span><input class="num" type="number" min="0.001" step="0.1" bind:value={selected.vol} on:input={() => (nodes = nodes)} /></label>{/if}
        {#if selected.kind === 'depot' || selected.kind === 'central'}<label class="s"><span>Dose (mg)</span><input class="num" type="number" min="0" step="1" bind:value={selected.dose} on:input={() => (nodes = nodes)} /></label>{/if}
        {#if selected.kind === 'effect'}
          <label class="s"><span>ke0 (1/h)</span><input class="num" type="number" min="0" step="0.01" bind:value={selected.ke0} on:input={() => (nodes = nodes)} /></label>
          <label class="s src"><span>{lego.source}</span><select bind:value={selected.source} on:change={() => (nodes = nodes)}>{#each concSources() as c}<option value={c.id}>{c.name}</option>{/each}</select></label>
        {/if}
        {#if selected.kind === 'response'}
          <label class="s"><span>kin</span><input class="num" type="number" min="0" step="0.1" bind:value={selected.kin} on:input={() => (nodes = nodes)} /></label>
          <label class="s"><span>kout (1/h)</span><input class="num" type="number" min="0.0001" step="0.01" bind:value={selected.kout} on:input={() => (nodes = nodes)} /></label>
          <label class="s"><span>Smax</span><input class="num" type="number" step="0.1" bind:value={selected.smax} on:input={() => (nodes = nodes)} /></label>
          <label class="s"><span>SC50 (mg/L)</span><input class="num" type="number" min="0.0001" step="0.1" bind:value={selected.sc50} on:input={() => (nodes = nodes)} /></label>
          <label class="s src"><span>{lego.source}</span><select bind:value={selected.source} on:change={() => (nodes = nodes)}>{#each concSources() as c}<option value={c.id}>{c.name}</option>{/each}</select></label>
        {/if}
        <div class="ebtns">
          <button on:click={() => addElim(selected.id)}>+ {lego.addElimination}</button>
          <button class="del" on:click={() => deleteNode(selected.id)}>{lego.remove}</button>
        </div>
      </div>
    {:else}
      <p class="tip">{lego.editorTip}</p>
    {/if}

    {#if edges.length}
      <div class="rates">
        <span class="rlabel">{lego.transferRates}</span>
        {#each edges as e}
          {@const from = nodes.find((n) => n.id === e.from)}
          {@const to = e.to === 'OUT' ? { name: lego.eliminationShort } : nodes.find((n) => n.id === e.to)}
          {#if from && to}
            <div class="rate">
              <span class="rn">{from.name}→{to.name}</span>
              <input class="num" type="number" min="0" step="0.01" bind:value={e.k} on:input={() => (edges = edges)} aria-label={`${lego.rateAria} ${from.name} ${lego.to} ${to.name}`} />
              <button class="rx" on:click={() => deleteEdge(e.id)}>×</button>
            </div>
          {/if}
        {/each}
      </div>
    {/if}

    <div class="covariates-editor">
      <div class="cov-head">
        <strong>{lego.covariates}</strong>
        <div class="cov-add">
          <button on:click={() => addCovariate('continuous')} disabled={!parameterChoices.length || covariates.length >= 10} aria-label={lego.addContinuousAria}>+ {lego.continuous}</button>
          <button on:click={() => addCovariate('categorical')} disabled={!parameterChoices.length || covariates.length >= 10} aria-label={lego.addCategoricalAria}>+ {lego.categorical}</button>
        </div>
      </div>
      <p class="cov-help">{lego.covariateHelp}</p>
      {#each covariates as covariate}
        <div class="cov-row">
          <div class="cov-row-head">
            <label><span>{lego.name}</span><input class="txt" maxlength="24" bind:value={covariate.name} on:input={() => (covariates = [...covariates])} /></label>
            <button class="rx" on:click={() => deleteCovariate(covariate.id)} aria-label={`${lego.remove} ${covariate.name}`}>×</button>
          </div>
          <div class="cov-fields">
            <label><span>{lego.type}</span><select bind:value={covariate.type} on:change={() => resetCovariateType(covariate)}><option value="continuous">{lego.continuous}</option><option value="categorical">{lego.categorical}</option></select></label>
            <label class="cov-target"><span>{lego.targetParameter}</span><select bind:value={covariate.target} on:change={() => (covariates = [...covariates])}>{#each parameterChoices as parameter}<option value={parameter.name}>{parameter.name}</option>{/each}</select></label>
            <label><span>{covariate.type === 'categorical' ? lego.categoryReference : lego.referenceValue}</span><input class="num" type="number" min={covariate.type === 'continuous' ? 0.000001 : undefined} step={covariate.type === 'categorical' ? 1 : 0.1} bind:value={covariate.reference} on:input={() => (covariates = [...covariates])} /></label>
            <label><span>β</span><input class="num" type="number" step="0.05" bind:value={covariate.beta} on:input={() => (covariates = [...covariates])} /></label>
            <label class="cov-comparison"><span>{covariate.type === 'categorical' ? lego.categoryComparison : lego.comparisonValue}</span><input class="num" type="number" min={covariate.type === 'continuous' ? 0.000001 : undefined} step={covariate.type === 'categorical' ? 1 : 0.1} bind:value={covariate.comparison} on:input={() => (covariates = [...covariates])} /></label>
            <label class="cov-toggle"><input type="checkbox" bind:checked={covariate.compare} on:change={() => (covariates = [...covariates])} /><span>{lego.compareCurve}</span></label>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<div class="outputs">
  <section class="out">
    <h2>{copy.pages.legoEquations}</h2>
    <pre class="eqs"><code>{odes.join('\n')}</code></pre>
  </section>
  <section class="out">
    <div class="codehead">
      <h2>{copy.pages.legoCode}</h2>
      <div class="tabs" role="tablist" aria-label={copy.pages.legoCode}>
        <button role="tab" aria-selected={codeTab === 'nlmixr2'} class:on={codeTab === 'nlmixr2'} on:click={() => (codeTab = 'nlmixr2')}>nlmixr2</button>
        <button role="tab" aria-selected={codeTab === 'mrgsolve'} class:on={codeTab === 'mrgsolve'} on:click={() => (codeTab = 'mrgsolve')}>mrgsolve</button>
        <button role="tab" aria-selected={codeTab === 'mlxtran'} class:on={codeTab === 'mlxtran'} on:click={() => (codeTab = 'mlxtran')}>MLXTRAN</button>
        <button role="tab" aria-selected={codeTab === 'nonmem'} class:on={codeTab === 'nonmem'} on:click={() => (codeTab = 'nonmem')}>NONMEM</button>
      </div>
      <button class="cp" on:click={copierCode}>{copiedTab === codeTab ? copy.pages.legoCopied : copy.pages.legoCopy}</button>
      <button
        class="tdm-launch"
        disabled={!tdmReady}
        title={tdmReady ? copy.pages.legoOpenTdm : copy.pages.legoTdmUnavailable}
        on:click={ouvrirDansTdm}
      >{transferredCode === codeMrgsolve ? copy.pages.legoTdmSent : copy.pages.legoOpenTdm}</button>
    </div>
    <p class="codenote">{activeCodeNote}</p>
    <pre class="codeblk"><code>{activeCode}</code></pre>
  </section>
</div>

<style>
  .head { max-width: 800px; margin-bottom: var(--space-5); }
  .eyebrow { font-family: var(--font-mono); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent-pk); }
  h1 { font-size: var(--text-3xl); margin: var(--space-2) 0 var(--space-3); }
  .lede { color: var(--text-secondary); font-size: var(--text-lg); }
  .toolbar { display: flex; flex-wrap: wrap; gap: var(--space-3) var(--space-6); align-items: center; padding: var(--space-3) var(--space-4); background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 12px; margin-bottom: var(--space-4); }
  .tgroup { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); }
  .tlabel { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); }
  .toolbar button { font-size: var(--text-xs); padding: 5px 9px; border: 1px solid var(--border-strong); background: var(--bg-primary); border-radius: 999px; cursor: pointer; color: var(--text-secondary); font-family: var(--font-mono); }
  .toolbar button.add { border-color: var(--c); color: var(--c); }
  .toolbar button.on { background: var(--accent-pk); color: #fff; border-color: var(--accent-pk); }
  .toolbar button.clear { color: #b0392b; border-color: #b0392b; }
  .toolbar .s { display: grid; grid-template-columns: auto auto; gap: 0 var(--space-2); align-items: center; font-family: var(--font-mono); font-size: var(--text-xs); margin-left: auto; }
  .toolbar .s input { grid-column: 1 / -1; }
  .builder { display: grid; gap: var(--space-4); }
  @media (min-width: 980px) { .builder { grid-template-columns: 1fr 260px; align-items: start; } }
  .stage { display: grid; gap: var(--space-4); min-width: 0; }
  .canvas { width: 100%; height: auto; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 12px; touch-action: none; }
  .node { cursor: grab; }
  .node rect { stroke-width: 2; transition: filter 0.15s; }
  .node.sel rect { stroke-width: 3; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.2)); }
  .node.cf rect { stroke-dasharray: 4 3; }
  .nname { text-anchor: middle; font-family: var(--font-mono); font-size: 12px; font-weight: 700; fill: var(--text-primary); }
  .nkind { text-anchor: middle; font-family: var(--font-mono); font-size: 8px; fill: var(--text-muted); }
  .edge { stroke: var(--text-secondary); stroke-width: 1.6; }
  .klbl { font-family: var(--font-mono); font-size: 9px; fill: var(--text-secondary); text-anchor: middle; }
  .elim { font-family: var(--font-mono); font-size: 8px; fill: var(--accent-pk); text-anchor: middle; }
  .hintxt { text-anchor: middle; fill: var(--text-muted); font-size: 13px; }
  .chart-panel { min-width: 0; }
  .chart { display: block; width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .serie { fill: none; stroke-width: 2.4; }
  .serie.dash { stroke-dasharray: 5 3; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; text-anchor: middle; }
  .chart-legend { display: flex; flex-wrap: wrap; gap: 6px var(--space-4); padding: 0 var(--space-3); }
  .legend-item { display: inline-flex; align-items: center; gap: 6px; min-width: 0; color: var(--text-secondary); font-family: var(--font-mono); font-size: 10px; }
  .legend-item i { width: 18px; flex: 0 0 18px; border-top: 3px solid var(--series-color); }
  .legend-item i.dash { border-top-style: dashed; }
  .side { display: grid; gap: var(--space-4); align-content: start; min-width: 0; }
  .editor, .rates, .covariates-editor { background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 12px; padding: var(--space-4); }
  .ehead { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-3); }
  .ehead strong { font-family: var(--font-mono); }
  .ehead span { font-size: var(--text-xs); color: var(--text-muted); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-family: var(--font-mono); font-size: var(--text-xs); margin-bottom: var(--space-2); }
  .s span { color: var(--text-secondary); }
  .txt, .num, .s select, .cov-row select { padding: 5px 7px; border: 1px solid var(--border-strong); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); font-family: var(--font-mono); font-size: var(--text-xs); min-width: 0; }
  .txt, .s select { grid-column: 1 / -1; width: 100%; }
  .num { width: 92px; }
  .src select { grid-column: auto; }
  .ebtns { display: flex; gap: var(--space-2); margin-top: var(--space-3); }
  .ebtns button { flex: 1; font-size: var(--text-xs); padding: 6px; border: 1px solid var(--border-strong); background: var(--bg-primary); border-radius: 6px; cursor: pointer; font-family: var(--font-mono); }
  .ebtns .del { color: #b0392b; border-color: #b0392b; }
  .tip { color: var(--text-muted); font-size: var(--text-sm); line-height: 1.5; }
  .rlabel { display: block; font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); margin-bottom: var(--space-2); }
  .rate { display: grid; grid-template-columns: minmax(0, 1fr) 82px auto; align-items: center; gap: var(--space-2); font-family: var(--font-mono); font-size: var(--text-xs); margin-bottom: 6px; }
  .rn { color: var(--text-secondary); white-space: nowrap; }
  .rate .num { width: 82px; }
  .rx { border: none; background: none; color: #b0392b; cursor: pointer; font-size: 15px; }
  .cov-head { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: var(--space-2); margin-bottom: var(--space-2); }
  .cov-head strong { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); }
  .cov-add { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; width: 100%; }
  .cov-head button { min-width: 0; min-height: 28px; padding: 5px 7px; border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--accent-pk); border-radius: 6px; cursor: pointer; font-family: var(--font-mono); font-size: 10px; line-height: 1.2; }
  .cov-head button:disabled { opacity: 0.45; cursor: not-allowed; }
  .cov-help { margin: 0 0 var(--space-2); color: var(--text-muted); font-size: 11px; line-height: 1.45; }
  .cov-row { padding: 10px 0; border-top: 1px solid var(--border-subtle); }
  .cov-row-head { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: 7px; margin-bottom: 8px; }
  .cov-fields { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; }
  .cov-row label { display: grid; align-content: end; gap: 3px; min-width: 0; font-family: var(--font-mono); font-size: 10px; color: var(--text-secondary); }
  .cov-row .cov-target { grid-column: 1 / -1; }
  .cov-row .cov-comparison, .cov-row .cov-toggle { grid-column: 1 / -1; }
  .cov-row .txt, .cov-row select { width: 100%; }
  .cov-row .num { width: 100%; }
  .cov-toggle { grid-template-columns: auto minmax(0, 1fr); align-items: center; justify-content: start; padding-top: 2px; }
  .cov-toggle input { width: 16px; height: 16px; margin: 0; accent-color: var(--accent-pk); }
  .outputs { display: grid; gap: var(--space-4); margin-top: var(--space-6); min-width: 0; }
  @media (min-width: 900px) { .outputs { grid-template-columns: 1fr 1fr; } }
  .out { min-width: 0; }
  .out h2 { font-size: var(--text-sm); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--accent-pk); margin-bottom: var(--space-2); }
  .eqs, .codeblk { width: 100%; max-width: 100%; border-radius: var(--radius); padding: var(--space-4); overflow-x: auto; font-family: var(--font-mono); font-size: var(--text-xs); line-height: 1.6; }
  .eqs { background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-subtle); }
  .codeblk { background: #1a1f2b; color: #e6edf3; }
  .eqs code, .codeblk code { white-space: pre; }
  .codehead { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2) var(--space-3); margin-bottom: var(--space-2); }
  .codehead h2 { margin: 0; }
  .tabs { display: flex; flex-wrap: wrap; gap: 4px; }
  .tabs button {
    font-family: var(--font-mono); font-size: var(--text-xs); padding: 4px 10px; cursor: pointer;
    border: 1px solid var(--border-strong); background: var(--bg-primary);
    color: var(--text-secondary); border-radius: 999px;
  }
  .tabs button.on { background: var(--accent-pk); border-color: var(--accent-pk); color: #fff; }
  .cp {
    margin-left: auto; font-family: var(--font-mono); font-size: var(--text-xs);
    padding: 4px 10px; cursor: pointer; border: 1px solid var(--border-strong);
    background: var(--bg-primary); color: var(--text-secondary); border-radius: 6px;
  }
  .cp:hover { border-color: var(--accent-pk); color: var(--accent-pk); }
  .tdm-launch {
    font-family: var(--font-mono); font-size: var(--text-xs); padding: 5px 11px; cursor: pointer;
    border: 1px solid var(--accent-pd); border-radius: 6px; background: var(--accent-pd); color: #fff;
  }
  .tdm-launch:disabled { cursor: not-allowed; opacity: 0.45; }
  .codenote { font-size: var(--text-xs); color: var(--text-muted); margin: 0 0 var(--space-2); max-width: 70ch; }
  @media (max-width: 640px) {
    .codehead { align-items: flex-start; }
    .cp { margin-left: 0; }
  }
</style>
