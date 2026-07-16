<script>
  // Atelier « Lego » — constructeur de modèles LIBRE.
  // On ajoute des compartiments (dépôt, transit, central, périphérique, métabolite, PD)
  // et des flèches (constantes de transfert) entre N'IMPORTE quels compartiments.
  // Sortie : diagramme éditable + EDO générées + code nlmixr2 + simulation (RK4).
  import { language } from '$lib/stores/language';
  import { ui } from '$lib/i18n/translations';
  $: copy = ui($language);

  /** @typedef {{id:number, kind:string, name:string, x:number, y:number, vol?:number, dose?:number, ke0?:number, kin?:number, kout?:number, smax?:number, sc50?:number, source?:number}} Node */
  /** @typedef {{id:number, from:number, to:number|'OUT', k:number}} Edge */

  /** @type {Record<string, {label:string, color:string, vol:boolean, plot:boolean, special?:string}>} */
  const KINDS = {
    depot:    { label: 'Dépôt',       color: '#2a4b7c', vol: false, plot: false },
    transit:  { label: 'Transit',     color: '#4f6f8f', vol: false, plot: false },
    central:  { label: 'Central',     color: '#b85c38', vol: true,  plot: true },
    periph:   { label: 'Périph.',     color: '#4a5d23', vol: true,  plot: false },
    metab:    { label: 'Métabolite',  color: '#9c4f6a', vol: true,  plot: true },
    effect:   { label: 'Effet (ke0)', color: '#7a8084', vol: false, plot: true, special: 'effect' },
    response: { label: 'Réponse',     color: '#5b8c3a', vol: false, plot: true, special: 'turnover' }
  };
  const order = ['depot', 'transit', 'central', 'periph', 'metab', 'effect', 'response'];

  let uid = 1;
  /** @type {Node[]} */
  let nodes = [];
  /** @type {Edge[]} */
  let edges = [];
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
    if (selectedId === id) selectedId = null;
  }
  /** @param {number} id */
  function nodeClick(id) {
    if (mode === 'connect') {
      if (connectFrom === null) connectFrom = id;
      else {
        if (connectFrom !== id) edges = [...edges, { id: uid++, from: connectFrom, to: id, k: 0.5 }];
        connectFrom = null; mode = 'select';
      }
    } else selectedId = id;
  }
  /** @param {number} id */
  function addElim(id) { edges = [...edges, { id: uid++, from: id, to: 'OUT', k: 0.2 }]; }
  /** @param {number} id */
  function deleteEdge(id) { edges = edges.filter((e) => e.id !== id); }
  function clearAll() { nodes = []; edges = []; selectedId = null; }

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
  $: plotNodes = nodes.filter((n) => KINDS[n.kind].plot);
  const concSources = () => nodes.filter((n) => KINDS[n.kind].vol);

  // ── simulation (RK4) ──
  $: sim = (() => {
    const N = nodes.length;
    if (!N) return { out: [], series: [] };
    const idx = new Map(nodes.map((n, i) => [n.id, i]));
    const y0 = nodes.map((n) => (n.kind === 'response' ? (n.kin ?? 0) / (n.kout || 1) : (n.dose ?? 0)));
    /** @param {number[]} y */
    function deriv(y) {
      const dy = new Array(N).fill(0);
      for (const e of edges) {
        const fi = idx.get(e.from); if (fi === undefined) continue;
        if (nodes[fi].kind === 'effect' || nodes[fi].kind === 'response') continue; // pas de transfert de masse depuis un bloc PD
        const rate = e.k * y[fi];
        dy[fi] -= rate;
        if (e.to !== 'OUT') { const ti = idx.get(e.to); if (ti !== undefined && nodes[ti].kind !== 'effect' && nodes[ti].kind !== 'response') dy[ti] += rate; }
      }
      nodes.forEach((n, i) => {
        if (n.kind === 'effect') { const si = idx.get(n.source ?? -1); const cp = si !== undefined ? (nodes[si].vol ? y[si] / (nodes[si].vol || 1) : y[si]) : 0; dy[i] = (n.ke0 ?? 0) * (cp - y[i]); }
        else if (n.kind === 'response') { const si = idx.get(n.source ?? -1); const cp = si !== undefined ? (nodes[si].vol ? y[si] / (nodes[si].vol || 1) : y[si]) : 0; dy[i] = (n.kin ?? 0) * (1 + (n.smax ?? 0) * cp / ((n.sc50 || 1) + cp)) - (n.kout ?? 0) * y[i]; }
      });
      return dy;
    }
    const steps = 800, dt = tMax / steps;
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
      const i = nodes.indexOf(n);
      const isResp = n.kind === 'response';
      const vals = out.map((o) => (n.vol ? o.y[i] / (n.vol || 1) : o.y[i]));
      return { name: n.name, color: KINDS[n.kind].color, resp: isResp, vals };
    });
    return { out, series };
  })();

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
    if (!nodes.length) return ['(ajoutez des compartiments)'];
    const nm = (/** @type {number} */ id) => nodes.find((n) => n.id === id)?.name ?? '?';
    return nodes.map((n) => {
      if (n.kind === 'effect') return `dCe/dt = ke0·(${nodes.find((s) => s.id === n.source)?.name ?? 'Cp'}/V − Ce)`;
      if (n.kind === 'response') return `dR/dt = kin·(1 + Smax·Cp/(SC50+Cp)) − kout·R`;
      const inflow = edges.filter((e) => e.to === n.id).map((e) => `+ k_${nm(e.from)}_${n.name}·${nm(e.from)}`);
      const outflow = edges.filter((e) => e.from === n.id).map((e) => `− k_${n.name}_${e.to === 'OUT' ? 'elim' : nm(e.to)}·${n.name}`);
      return `d${n.name}/dt = ${[...inflow, ...outflow].join(' ') || '0'}`;
    }).concat(concSources().map((n) => `C_${n.name} = ${n.name} / V_${n.name}`));
  })();

  // ── code nlmixr2 ──
  $: code = (() => {
    if (!nodes.length) return '# ajoutez des compartiments';
    const nm = (/** @type {number} */ id) => nodes.find((n) => n.id === id)?.name ?? '?';
    const L = ['model({'];
    for (const n of nodes) {
      if (n.kind === 'effect') { L.push(`  d/dt(${n.name}) = ke0*(C_${nm(n.source ?? -1)} - ${n.name})`); continue; }
      if (n.kind === 'response') { L.push(`  d/dt(${n.name}) = kin*(1+smax*Cp/(sc50+Cp)) - kout*${n.name}`); continue; }
      const terms = [];
      for (const e of edges.filter((e) => e.to === n.id)) terms.push(`+ k_${nm(e.from)}_${n.name}*${nm(e.from)}`);
      for (const e of edges.filter((e) => e.from === n.id)) terms.push(`- k_${n.name}_${e.to === 'OUT' ? 'e' : nm(e.to)}*${n.name}`);
      L.push(`  d/dt(${n.name}) = ${terms.join(' ') || '0'}`);
    }
    for (const n of concSources()) L.push(`  C_${n.name} = ${n.name}/v_${n.name}`);
    L.push('})');
    return L.join('\n');
  })();

  /** @param {Node} n */
  const cxn = (n) => n.x + NW / 2;
  /** @param {Node} n */
  const cyn = (n) => n.y + NH / 2;
</script>

<header class="head">
  <p class="eyebrow">{copy.pages.legoEyebrow}</p>
  <h1>{copy.pages.legoTitle}</h1>
  {#if $language === 'en'}
    <p class="lede">Build <strong>any</strong> model: add compartments and connect them with arrows (transfer rate constants). Transit chains, multiple peripherals, metabolite, PD blocks… no fixed library.</p>
  {:else}
    <p class="lede">Construisez <strong>n'importe quel</strong> modèle : ajoutez des compartiments et reliez-les par des flèches (constantes de transfert). Transit en chaîne, périphériques multiples, métabolite, blocs PD… sans bibliothèque figée.</p>
  {/if}
</header>

<div class="toolbar">
  <div class="tgroup">
    <span class="tlabel">Ajouter</span>
    {#each order as kind}
      <button class="add" style={`--c:${KINDS[kind].color}`} on:click={() => addNode(kind)}>+ {KINDS[kind].label}</button>
    {/each}
  </div>
  <div class="tgroup">
    <span class="tlabel">Flèche</span>
    <button class:on={mode === 'connect'} on:click={() => { mode = mode === 'connect' ? 'select' : 'connect'; connectFrom = null; }}>
      {mode === 'connect' ? (connectFrom === null ? 'Cliquez la source…' : 'Cliquez la cible…') : '↳ Relier deux compartiments'}
    </button>
  </div>
  <div class="tgroup">
    <span class="tlabel">Modèles types</span>
    <button on:click={() => preset('oral1')}>Oral 1-cpt</button>
    <button on:click={() => preset('iv2')}>IV 2-cpt</button>
    <button on:click={() => preset('transit')}>Transit ×3</button>
    <button on:click={() => preset('metab')}>Parent/métabolite</button>
    <button on:click={() => preset('effect')}>Effet (ke0)</button>
    <button class="clear" on:click={clearAll}>Effacer</button>
  </div>
  <label class="s"><span>Durée (h)</span><strong>{tMax}</strong><input type="range" min="6" max="72" step="6" bind:value={tMax} /></label>
</div>

<div class="builder">
  <div class="stage">
    <svg bind:this={svgEl} viewBox={`0 0 ${VBW} ${VBH}`} class="canvas" on:pointermove={moveDrag} on:pointerup={endDrag} on:pointerleave={endDrag} role="application" aria-label="Éditeur de modèle compartimental">
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
            <text x={cxn(from) - 6} y={from.y + NH + 34} class="elim">élim.</text>
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
          <text x={NW / 2} y={31} class="nkind">{KINDS[n.kind].label}{n.dose ? ` · ${n.dose}mg` : ''}</text>
        </g>
      {/each}
      {#if !nodes.length}<text x={VBW / 2} y={VBH / 2} class="hintxt">Ajoutez un compartiment, ou choisissez un modèle type ci-dessus.</text>{/if}
    </svg>

    <!-- courbe simulée -->
    <svg viewBox={`0 0 ${CW} ${CH}`} class="chart" role="img" aria-label="Simulation du modèle">
      <g transform={`translate(${cm.left},${cm.top})`}>
        <line x1="0" x2="0" y1="0" y2={ciH} class="axis" />
        <line x1="0" x2={ciW} y1={ciH} y2={ciH} class="axis" />
        {#each sim.series as s}
          <path d={pathOf(s)} style={`stroke:${s.color}`} class="serie" class:dash={s.resp} />
        {/each}
        <text x={ciW / 2} y={ciH + 24} class="lbl">Temps (h)</text>
        <g transform="translate(4,2)">
          {#each sim.series as s, i}
            <rect x="0" y={i * 13} width="12" height="3" style={`fill:${s.color}`} /><text x="17" y={i * 13 + 4} class="leg">{s.name}{s.resp ? ' (rééch.)' : ' (mg/L)'}</text>
          {/each}
        </g>
      </g>
    </svg>
  </div>

  <div class="side">
    {#if selected}
      <div class="editor">
        <div class="ehead"><strong>{selected.name}</strong><span>{KINDS[selected.kind].label}</span></div>
        <label class="s"><span>Nom</span><input class="txt" bind:value={selected.name} on:input={() => (nodes = nodes)} /></label>
        {#if KINDS[selected.kind].vol}<label class="s"><span>Volume (L)</span><strong>{selected.vol}</strong><input type="range" min="2" max="120" step="1" bind:value={selected.vol} on:input={() => (nodes = nodes)} /></label>{/if}
        {#if selected.kind === 'depot' || selected.kind === 'central'}<label class="s"><span>Dose (mg)</span><strong>{selected.dose}</strong><input type="range" min="0" max="500" step="10" bind:value={selected.dose} on:input={() => (nodes = nodes)} /></label>{/if}
        {#if selected.kind === 'effect'}
          <label class="s"><span>ke0 (1/h)</span><strong>{selected.ke0?.toFixed(2)}</strong><input type="range" min="0.05" max="2" step="0.05" bind:value={selected.ke0} on:input={() => (nodes = nodes)} /></label>
          <label class="s src"><span>Source</span><select bind:value={selected.source} on:change={() => (nodes = nodes)}>{#each concSources() as c}<option value={c.id}>{c.name}</option>{/each}</select></label>
        {/if}
        {#if selected.kind === 'response'}
          <label class="s"><span>kin</span><strong>{selected.kin}</strong><input type="range" min="1" max="30" step="1" bind:value={selected.kin} on:input={() => (nodes = nodes)} /></label>
          <label class="s"><span>kout (1/h)</span><strong>{selected.kout?.toFixed(2)}</strong><input type="range" min="0.02" max="1" step="0.02" bind:value={selected.kout} on:input={() => (nodes = nodes)} /></label>
          <label class="s"><span>Smax</span><strong>{selected.smax}</strong><input type="range" min="0" max="8" step="0.5" bind:value={selected.smax} on:input={() => (nodes = nodes)} /></label>
          <label class="s src"><span>Source</span><select bind:value={selected.source} on:change={() => (nodes = nodes)}>{#each concSources() as c}<option value={c.id}>{c.name}</option>{/each}</select></label>
        {/if}
        <div class="ebtns">
          <button on:click={() => addElim(selected.id)}>+ élimination</button>
          <button class="del" on:click={() => deleteNode(selected.id)}>Supprimer</button>
        </div>
      </div>
    {:else}
      <p class="tip">Cliquez un compartiment pour l'éditer (nom, volume, dose…), glissez-le pour le déplacer.</p>
    {/if}

    {#if edges.length}
      <div class="rates">
        <span class="rlabel">Constantes de transfert</span>
        {#each edges as e}
          {@const from = nodes.find((n) => n.id === e.from)}
          {@const to = e.to === 'OUT' ? { name: 'élim' } : nodes.find((n) => n.id === e.to)}
          {#if from && to}
            <div class="rate">
              <span class="rn">{from.name}→{to.name}</span>
              <input type="range" min="0.02" max="3" step="0.02" bind:value={e.k} on:input={() => (edges = edges)} aria-label={`Constante de vitesse ${from.name} vers ${to.name}`} />
              <strong>{e.k.toFixed(2)}</strong>
              <button class="rx" on:click={() => deleteEdge(e.id)}>×</button>
            </div>
          {/if}
        {/each}
      </div>
    {/if}
  </div>
</div>

<div class="outputs">
  <section class="out">
    <h2>{copy.pages.legoEquations}</h2>
    <pre class="eqs"><code>{odes.join('\n')}</code></pre>
  </section>
  <section class="out">
    <h2>{copy.pages.legoCode}</h2>
    <pre class="codeblk"><code>{code}</code></pre>
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
  .stage { display: grid; gap: var(--space-4); }
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
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .serie { fill: none; stroke-width: 2.4; }
  .serie.dash { stroke-dasharray: 5 3; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; text-anchor: middle; }
  .leg { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 9px; }
  .side { display: grid; gap: var(--space-4); align-content: start; }
  .editor, .rates { background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 12px; padding: var(--space-4); }
  .ehead { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-3); }
  .ehead strong { font-family: var(--font-mono); }
  .ehead span { font-size: var(--text-xs); color: var(--text-muted); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-family: var(--font-mono); font-size: var(--text-xs); margin-bottom: var(--space-2); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--accent-pk); }
  .s input[type=range] { grid-column: 1 / -1; }
  .txt, .s select { grid-column: 1 / -1; padding: 4px 6px; border: 1px solid var(--border-strong); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); font-family: var(--font-mono); font-size: var(--text-xs); }
  .src select { grid-column: auto; }
  .ebtns { display: flex; gap: var(--space-2); margin-top: var(--space-3); }
  .ebtns button { flex: 1; font-size: var(--text-xs); padding: 6px; border: 1px solid var(--border-strong); background: var(--bg-primary); border-radius: 6px; cursor: pointer; font-family: var(--font-mono); }
  .ebtns .del { color: #b0392b; border-color: #b0392b; }
  .tip { color: var(--text-muted); font-size: var(--text-sm); line-height: 1.5; }
  .rlabel { display: block; font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); margin-bottom: var(--space-2); }
  .rate { display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; gap: var(--space-2); font-family: var(--font-mono); font-size: var(--text-xs); margin-bottom: 4px; }
  .rn { color: var(--text-secondary); white-space: nowrap; }
  .rate strong { color: var(--accent-pk); min-width: 30px; text-align: right; }
  .rx { border: none; background: none; color: #b0392b; cursor: pointer; font-size: 15px; }
  .outputs { display: grid; gap: var(--space-4); margin-top: var(--space-6); }
  @media (min-width: 900px) { .outputs { grid-template-columns: 1fr 1fr; } }
  .out h2 { font-size: var(--text-sm); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--accent-pk); margin-bottom: var(--space-2); }
  .eqs, .codeblk { border-radius: var(--radius); padding: var(--space-4); overflow-x: auto; font-family: var(--font-mono); font-size: var(--text-xs); line-height: 1.6; }
  .eqs { background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-subtle); }
  .codeblk { background: #1a1f2b; color: #e6edf3; }
  .eqs code, .codeblk code { white-space: pre; }
</style>
