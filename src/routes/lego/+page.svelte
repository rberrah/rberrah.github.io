<script>
  // Atelier « Lego » : on assemble un modèle PK/PD bloc par bloc.
  // Sortie : diagramme de compartiments + équations (EDO) + code nlmixr2 + courbe simulée.
  import { language } from '$lib/stores/language';
  import { ui } from '$lib/i18n/translations';
  $: copy = ui($language);

  // ── choix de blocs ─────────────────────────────────────────────────────────
  let abs = 'oral';   // 'iv' | 'oral' | 'oral_tlag' | 'transit'
  let comp = 1;       // 1 | 2 | 3
  let elim = 'linear'; // 'linear' | 'mm'
  let pd = 'none';    // 'none' | 'emax' | 'sigmoid' | 'turnover' | 'effect'

  // quelques paramètres réglables (les autres sont fixes, pédagogiques)
  let cl = 5, v1 = 30, dose = 100;
  const P = { ka: 1.0, tlag: 0.5, mtt: 2, nT: 3, q: 8, v2: 40, q2: 4, v3: 100,
    vmax: 45, km: 2, ke0: 0.4, e0: 5, emax: 100, ec50: 8, hill: 2, kin: 10, kout: 0.15, smax: 3, sc50: 3 };

  const absOpts = [
    { id: 'iv', label: 'Bolus IV' }, { id: 'oral', label: 'Orale (Ka)' },
    { id: 'oral_tlag', label: 'Orale + Tlag' }, { id: 'transit', label: 'Transit (n)' }
  ];
  const pdOpts = [
    { id: 'none', label: 'Aucun (PK seul)' }, { id: 'emax', label: 'Emax direct' },
    { id: 'sigmoid', label: 'Emax sigmoïde' }, { id: 'turnover', label: 'Turnover' },
    { id: 'effect', label: 'Compartiment d’effet' }
  ];

  // ── simulation générique (RK4) ──────────────────────────────────────────────
  $: sim = (() => {
    const p = { ...P, cl, v1, dose };
    /** @type {string[]} */ const names = [];
    /** @type {number[]} */ const iT = [];
    const nT = abs === 'transit' ? p.nT : 0;
    let iDepot = -1, iP1 = -1, iP2 = -1, iCe = -1, iR = -1;
    if (nT > 0) for (let k = 0; k < nT; k++) { iT.push(names.length); names.push('T' + (k + 1)); }
    else if (abs !== 'iv') { iDepot = names.length; names.push('depot'); }
    const iC = names.length; names.push('centr');
    if (comp >= 2) { iP1 = names.length; names.push('p1'); }
    if (comp >= 3) { iP2 = names.length; names.push('p2'); }
    if (pd === 'effect') { iCe = names.length; names.push('ce'); }
    if (pd === 'turnover') { iR = names.length; names.push('R'); }

    const R0 = p.kin / p.kout;
    const y0 = new Array(names.length).fill(0);
    if (iR >= 0) y0[iR] = R0;
    if (nT > 0) y0[iT[0]] = p.dose; else if (iDepot >= 0) y0[iDepot] = p.dose; else y0[iC] = p.dose;
    const ktr = p.nT / p.mtt;

    /** @param {number[]} y */
    function f(y) {
      const dy = new Array(y.length).fill(0);
      const cp = y[iC] / p.v1;
      let inflow = 0;
      if (nT > 0) {
        dy[iT[0]] -= ktr * y[iT[0]];
        for (let k = 1; k < nT; k++) dy[iT[k]] += ktr * y[iT[k - 1]] - ktr * y[iT[k]];
        inflow = ktr * y[iT[nT - 1]];
      } else if (iDepot >= 0) { dy[iDepot] -= p.ka * y[iDepot]; inflow = p.ka * y[iDepot]; }
      dy[iC] += inflow;
      if (elim === 'mm') dy[iC] -= (p.vmax * cp) / (p.km + cp);
      else dy[iC] -= (p.cl / p.v1) * y[iC];
      if (iP1 >= 0) { dy[iC] += -(p.q / p.v1) * y[iC] + (p.q / p.v2) * y[iP1]; dy[iP1] += (p.q / p.v1) * y[iC] - (p.q / p.v2) * y[iP1]; }
      if (iP2 >= 0) { dy[iC] += -(p.q2 / p.v1) * y[iC] + (p.q2 / p.v3) * y[iP2]; dy[iP2] += (p.q2 / p.v1) * y[iC] - (p.q2 / p.v3) * y[iP2]; }
      if (iCe >= 0) dy[iCe] = p.ke0 * (cp - y[iCe]);
      if (iR >= 0) dy[iR] = p.kin * (1 + p.smax * cp / (p.sc50 + cp)) - p.kout * y[iR];
      return dy;
    }
    const T = 24, dt = T / 1200;
    let y = y0.slice();
    const out = [];
    for (let s = 0; s <= 1200; s++) {
      const t = s * dt;
      const cp = y[iC] / p.v1;
      let e = null;
      if (pd === 'emax') e = p.e0 + (p.emax * cp) / (p.ec50 + cp);
      else if (pd === 'sigmoid') e = p.e0 + (p.emax * cp ** p.hill) / (p.ec50 ** p.hill + cp ** p.hill);
      else if (pd === 'effect') e = p.e0 + (p.emax * y[iCe]) / (p.ec50 + y[iCe]);
      else if (pd === 'turnover') e = y[iR];
      out.push({ t, cp: Math.max(0, cp), e });
      // RK4
      const k1 = f(y);
      const k2 = f(y.map((v, i) => v + (dt / 2) * k1[i]));
      const k3 = f(y.map((v, i) => v + (dt / 2) * k2[i]));
      const k4 = f(y.map((v, i) => v + dt * k3[i]));
      y = y.map((v, i) => v + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
    }
    // Tlag : décalage temporel de la sortie
    const lag = abs === 'oral_tlag' ? p.tlag : 0;
    const shifted = out.map((o) => ({ t: o.t + lag, cp: o.cp, e: o.e })).filter((o) => o.t <= T);
    if (lag > 0) shifted.unshift({ t: 0, cp: 0, e: pd === 'turnover' ? R0 : pd !== 'none' ? p.e0 : null });
    return shifted;
  })();

  $: cMax = Math.max(...sim.map((o) => o.cp), 0.01);
  $: hasE = pd !== 'none';
  $: eMax = hasE ? Math.max(...sim.map((o) => o.e ?? 0), 0.01) : 1;

  const W = 470, H = 260, m = { top: 14, right: 14, bottom: 34, left: 44 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  const xt = (/** @type {number} */ t) => (t / 24) * (W - m.left - m.right);
  $: yc = (/** @type {number} */ c) => iH - (c / (cMax * 1.08)) * iH;
  $: ye = (/** @type {number} */ e) => iH - (e / (eMax * 1.08)) * iH;
  $: cpPath = sim.map((o, i) => `${i ? 'L' : 'M'}${xt(o.t).toFixed(1)},${yc(o.cp).toFixed(1)}`).join(' ');
  $: ePath = hasE ? sim.map((o, i) => `${i ? 'L' : 'M'}${xt(o.t).toFixed(1)},${ye(o.e ?? 0).toFixed(1)}`).join(' ') : '';

  // ── diagramme de blocs ──────────────────────────────────────────────────────
  $: blocks = (() => {
    const b = [];
    if (abs === 'transit') b.push({ k: 'abs', label: `Transit ×${P.nT}`, c: 'var(--accent-ai)' });
    else if (abs !== 'iv') b.push({ k: 'abs', label: abs === 'oral_tlag' ? 'Dépôt + Tlag' : 'Dépôt (Ka)', c: 'var(--accent-ai)' });
    b.push({ k: 'cent', label: 'Central (V1)', c: 'var(--accent-pk)' });
    if (comp >= 2) b.push({ k: 'p1', label: 'Périph. (V2)', c: 'var(--accent-pd)' });
    if (comp >= 3) b.push({ k: 'p2', label: 'Périph. 2 (V3)', c: 'var(--accent-pd)' });
    if (pd === 'effect') b.push({ k: 'ce', label: 'Effet (ke0)', c: 'var(--text-secondary)' });
    if (pd === 'turnover') b.push({ k: 'r', label: 'Réponse R', c: 'var(--text-secondary)' });
    return b;
  })();

  // ── équations (EDO) générées ────────────────────────────────────────────────
  $: odes = (() => {
    const eq = [];
    const inCentral = abs === 'transit' ? '+ ktr·Tn' : abs !== 'iv' ? '+ ka·depot' : '';
    if (abs === 'transit') { eq.push('dT1/dt = − ktr·T1'); eq.push('dTi/dt = ktr·(T(i−1) − Ti)'); }
    else if (abs !== 'iv') eq.push('ddepot/dt = − ka·depot');
    let central = `dcentr/dt = ${inCentral} `;
    central += elim === 'mm' ? '− Vmax·Cp/(Km+Cp)' : '− (CL/V1)·centr';
    if (comp >= 2) central += ' − Q/V1·centr + Q/V2·p1';
    if (comp >= 3) central += ' − Q2/V1·centr + Q2/V3·p2';
    eq.push(central);
    if (comp >= 2) eq.push('dp1/dt = Q/V1·centr − Q/V2·p1');
    if (comp >= 3) eq.push('dp2/dt = Q2/V1·centr − Q2/V3·p2');
    eq.push('Cp = centr / V1');
    if (pd === 'effect') { eq.push('dCe/dt = ke0·(Cp − Ce)'); eq.push('E = E0 + Emax·Ce/(EC50+Ce)'); }
    else if (pd === 'emax') eq.push('E = E0 + Emax·Cp/(EC50+Cp)');
    else if (pd === 'sigmoid') eq.push('E = E0 + Emax·Cp^h/(EC50^h+Cp^h)');
    else if (pd === 'turnover') eq.push('dR/dt = kin·(1 + Smax·Cp/(SC50+Cp)) − kout·R');
    return eq;
  })();

  // ── code nlmixr2 généré ─────────────────────────────────────────────────────
  $: code = (() => {
    const L = [];
    L.push('model({');
    if (abs !== 'iv') L.push('  ka  <- exp(tka)');
    L.push('  cl  <- exp(tcl)');
    L.push('  v   <- exp(tv)');
    if (comp >= 2) { L.push('  q   <- exp(tq)'); L.push('  vp  <- exp(tvp)'); }
    if (pd === 'effect') L.push('  ke0 <- exp(tke0)');
    L.push('');
    if (abs === 'transit') {
      L.push('  d/dt(depot)  = -ktr*depot');
      L.push('  d/dt(transit)= ktr*depot - ktr*transit   # chaîne ×n');
      L.push('  d/dt(centr)  = ktr*transit - (cl/v)*centr' + (comp >= 2 ? ' - q/v*centr + q/vp*periph' : ''));
    } else if (abs !== 'iv') {
      if (abs === 'oral_tlag') L.push('  alag(depot)  = tlag');
      L.push('  d/dt(depot)  = -ka*depot');
      L.push('  d/dt(centr)  = ka*depot ' + (elim === 'mm' ? '- vmax*(centr/v)/(km+centr/v)' : '- (cl/v)*centr') + (comp >= 2 ? ' - q/v*centr + q/vp*periph' : ''));
    } else {
      L.push('  d/dt(centr)  = ' + (elim === 'mm' ? '-vmax*(centr/v)/(km+centr/v)' : '-(cl/v)*centr') + (comp >= 2 ? ' - q/v*centr + q/vp*periph' : ''));
    }
    if (comp >= 2) L.push('  d/dt(periph) = q/v*centr - q/vp*periph');
    L.push('  cp = centr/v');
    if (pd === 'effect') { L.push('  d/dt(ce) = ke0*(cp - ce)'); L.push('  eff = e0 + emax*ce/(ec50+ce)'); }
    else if (pd === 'emax') L.push('  eff = e0 + emax*cp/(ec50+cp)');
    else if (pd === 'sigmoid') L.push('  eff = e0 + emax*cp^hill/(ec50^hill+cp^hill)');
    else if (pd === 'turnover') L.push('  d/dt(R) = kin*(1+smax*cp/(sc50+cp)) - kout*R');
    L.push('  cp ~ add(add.err)' + (pd !== 'none' ? '\n  eff ~ add(add.pd)' : ''));
    L.push('})');
    return L.join('\n');
  })();
</script>

<header class="head">
  <p class="eyebrow">{copy.pages.legoEyebrow}</p>
  <h1>{copy.pages.legoTitle}</h1>
  <p class="lede">{copy.pages.legoIntro}</p>
</header>

<div class="builder">
  <div class="panel picks">
    <div class="group">
      <span class="glabel">Absorption</span>
      <div class="chips">
        {#each absOpts as o}<button class:on={abs === o.id} on:click={() => (abs = o.id)}>{o.label}</button>{/each}
      </div>
    </div>
    <div class="group">
      <span class="glabel">Compartiments</span>
      <div class="chips">
        {#each [1, 2, 3] as n}<button class:on={comp === n} on:click={() => (comp = n)}>{n}</button>{/each}
      </div>
    </div>
    <div class="group">
      <span class="glabel">Élimination</span>
      <div class="chips">
        <button class:on={elim === 'linear'} on:click={() => (elim = 'linear')}>Linéaire (CL)</button>
        <button class:on={elim === 'mm'} on:click={() => (elim = 'mm')}>Michaelis-Menten</button>
      </div>
    </div>
    <div class="group">
      <span class="glabel">Modèle PD</span>
      <div class="chips">
        {#each pdOpts as o}<button class:on={pd === o.id} on:click={() => (pd = o.id)}>{o.label}</button>{/each}
      </div>
    </div>
    <div class="sliders">
      <label class="s"><span>Dose (mg)</span><strong>{dose}</strong><input type="range" min="25" max="300" step="5" bind:value={dose} /></label>
      <label class="s"><span>CL (L/h)</span><strong>{cl}</strong><input type="range" min="1" max="15" step="0.5" bind:value={cl} /></label>
      <label class="s"><span>V1 (L)</span><strong>{v1}</strong><input type="range" min="10" max="70" step="1" bind:value={v1} /></label>
    </div>
  </div>

  <div class="panel stage">
    <!-- diagramme de blocs -->
    <div class="lego">
      {#each blocks as blk, i}
        {#if i > 0}<span class="arrow">→</span>{/if}
        <div class="brick" style={`--bc:${blk.c}`}><span class="studs"></span>{blk.label}</div>
      {/each}
      <span class="arrow down">↧ {elim === 'mm' ? 'MM' : 'CL'}</span>
    </div>

    <!-- courbe simulée -->
    <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label="Simulation du modèle assemblé">
      <g transform={`translate(${m.left},${m.top})`}>
        <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
        <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
        <path d={cpPath} class="cp" />
        {#if hasE}<path d={ePath} class="eff" />{/if}
        <text x={iW / 2} y={iH + 26} class="lbl">Temps (h)</text>
        <g transform="translate(4,2)">
          <rect x="0" y="0" width="12" height="3" class="cp" /><text x="17" y="4" class="leg">Cp (mg/L)</text>
          {#if hasE}<rect x="0" y="13" width="12" height="3" class="eff" /><text x="17" y="16" class="leg">Effet (rééchelonné)</text>{/if}
        </g>
      </g>
    </svg>
  </div>
</div>

<div class="outputs">
  <section class="out">
    <h2>{copy.pages.legoEquations}</h2>
    <pre class="eqs"><code>{odes.join('\n')}</code></pre>
  </section>
  <section class="out">
    <h2>{copy.pages.legoCode}</h2>
    <pre class="code"><code>{code}</code></pre>
  </section>
</div>

<style>
  .head { max-width: 780px; margin-bottom: var(--space-6); }
  .eyebrow { font-family: var(--font-mono); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent-pk); }
  h1 { font-size: var(--text-3xl); margin: var(--space-2) 0 var(--space-3); }
  .lede { color: var(--text-secondary); font-size: var(--text-lg); }
  .builder { display: grid; gap: var(--space-4); }
  @media (min-width: 900px) { .builder { grid-template-columns: 300px 1fr; align-items: start; } }
  .panel { background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 12px; padding: var(--space-4); }
  .group { margin-bottom: var(--space-4); }
  .glabel { display: block; font-family: var(--font-mono); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); margin-bottom: var(--space-2); }
  .chips { display: flex; flex-wrap: wrap; gap: var(--space-2); }
  .chips button { font-size: var(--text-xs); padding: 5px 9px; border: 1px solid var(--border-strong); background: var(--bg-primary); border-radius: 999px; cursor: pointer; color: var(--text-secondary); }
  .chips button.on { background: var(--accent-pk); color: #fff; border-color: var(--accent-pk); }
  .sliders { display: grid; gap: var(--space-2); margin-top: var(--space-2); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-family: var(--font-mono); font-size: var(--text-xs); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--accent-pk); }
  .s input { grid-column: 1 / -1; }
  .stage { display: grid; gap: var(--space-4); }
  .lego { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); }
  .brick { position: relative; padding: var(--space-3) var(--space-4) var(--space-2); border-radius: 8px; background: color-mix(in srgb, var(--bc) 16%, var(--bg-primary)); border: 2px solid var(--bc); border-top-width: 8px; font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-primary); }
  .arrow { color: var(--text-muted); font-family: var(--font-mono); }
  .arrow.down { display: block; width: 100%; color: var(--accent-pk); font-size: var(--text-xs); }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .cp { fill: none; stroke: var(--accent-pk); stroke-width: 2.5; }
  .eff { fill: none; stroke: var(--accent-pd); stroke-width: 2.5; stroke-dasharray: 5 3; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; text-anchor: middle; }
  .leg { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 9px; }
  .outputs { display: grid; gap: var(--space-4); margin-top: var(--space-6); }
  @media (min-width: 900px) { .outputs { grid-template-columns: 1fr 1fr; } }
  .out h2 { font-size: var(--text-sm); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--accent-pk); margin-bottom: var(--space-2); }
  .eqs, .code { border-radius: var(--radius); padding: var(--space-4); overflow-x: auto; font-family: var(--font-mono); font-size: var(--text-xs); line-height: 1.6; }
  .eqs { background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-subtle); }
  .code { background: #1a1f2b; color: #e6edf3; }
  .eqs code, .code code { white-space: pre; }
</style>
