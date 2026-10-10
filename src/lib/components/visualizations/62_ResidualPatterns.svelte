<script>
  import { language } from '$lib/stores/language';
  // Galerie de motifs synthetiques de residus. Chaque forme suggere plusieurs
  // hypotheses a verifier; elle ne designe jamais seule une cause.
  /** @type {'good'|'u'|'invu'|'trumpet'|'trend'} */
  let mode = 'u';

  const modes = {
    good: { label: 'Aléatoire', interp: 'Aucun motif évident dans ce diagnostic.', fix: 'Croiser avec les autres diagnostics.' },
    u: { label: 'U', interp: 'Motif compatible avec un biais courbe.', fix: 'Tester structure, absorption, élimination, covariables et design.' },
    invu: { label: 'U inversé', interp: 'Motif compatible avec un biais courbe opposé.', fix: 'Tester les mêmes composantes et comparer les prédictions.' },
    trumpet: { label: 'Trompette', interp: 'Dispersion croissante avec la prédiction.', fix: 'Examiner variance conditionnelle, structure, données atypiques et shrinkage.' },
    trend: { label: 'Pente', interp: 'Dérive systématique avec la prédiction.', fix: 'Examiner structure, covariables, temps, dose et erreur.' }
  };
  $: cur = modes[mode];
  $: curEn = {
    good: { label: 'Random', interp: 'No obvious pattern in this diagnostic.', fix: 'Cross-check the other diagnostics.' },
    u: { label: 'U shape', interp: 'Pattern compatible with curved bias.', fix: 'Test structure, absorption, elimination, covariates and design.' },
    invu: { label: 'Inverted U', interp: 'Pattern compatible with opposite curved bias.', fix: 'Test the same components and compare predictions.' },
    trumpet: { label: 'Funnel', interp: 'Spread increases with prediction.', fix: 'Examine conditional variance, structure, unusual data and shrinkage.' },
    trend: { label: 'Trend', interp: 'Systematic drift with prediction.', fix: 'Examine structure, covariates, time, dose and error.' }
  }[mode];

  /** @param {number} a @returns {() => number} */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  /** @param {() => number} r @returns {number} */
  function gauss(r) { return Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r()); }

  const N = 90;
  /** @type {{xn:number,g:number}[]} */
  const base = [];
  const rng = mulberry32(5);
  for (let i = 0; i < N; i++) base.push({ xn: rng(), g: gauss(rng) });

  /** @param {{xn:number,g:number}} p @param {string} md @returns {number} */
  function resid(p, md) {
    const u2 = Math.pow(p.xn - 0.5, 2) * 4; // 0 au milieu, 1 aux bords
    if (md === 'good') return p.g;
    if (md === 'u') return 2.4 * (u2 - 0.35) + 0.5 * p.g;
    if (md === 'invu') return -2.4 * (u2 - 0.35) + 0.5 * p.g;
    if (md === 'trumpet') return p.g * (0.4 + 1.9 * p.xn);
    return -1.8 + 3.6 * p.xn + 0.5 * p.g; // trend
  }
  $: pts = base.map((p) => ({ xn: p.xn, r: Math.max(-4.2, Math.min(4.2, resid(p, mode))) }));

  const W = 480, H = 300, m = { top: 14, right: 14, bottom: 40, left: 40 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  const rMax = 4.5;
  $: px = (/** @type {number} */ xn) => xn * iW;
  $: py = (/** @type {number} */ r) => iH / 2 - (r / rMax) * (iH / 2);
</script>

<div class="wrap">
  <div class="controls">
    <div class="modes">
      <button class:on={mode === 'good'} on:click={() => (mode = 'good')}>{$language === 'en' ? 'Random' : 'Aléatoire'}</button>
      <button class:on={mode === 'u'} on:click={() => (mode = 'u')}>U</button>
      <button class:on={mode === 'invu'} on:click={() => (mode = 'invu')}>{$language === 'en' ? 'Inverted U' : 'U inversé'}</button>
      <button class:on={mode === 'trumpet'} on:click={() => (mode = 'trumpet')}>{$language === 'en' ? 'Funnel' : 'Trompette'}</button>
      <button class:on={mode === 'trend'} on:click={() => (mode = 'trend')}>{$language === 'en' ? 'Trend' : 'Pente'}</button>
    </div>
    <div class="readout" class:ok={mode === 'good'}>
      <div class="motif">{$language === 'en' ? curEn.label : cur.label}</div>
      <div class="line"><span>{$language === 'en' ? 'Interpretation' : 'Interprétation'}</span>{$language === 'en' ? curEn.interp : cur.interp}</div>
      <div class="line"><span>{$language === 'en' ? 'Checks' : 'Vérifications'}</span>{$language === 'en' ? curEn.fix : cur.fix}</div>
    </div>
    <p class="hint">{#if $language === 'en'}These are synthetic CWRES-like patterns. Their shape generates hypotheses but does not identify a unique defect; interpretation also depends on how the residual was constructed.{:else}Ces motifs synthétiques ressemblent à des CWRES. Leur forme génère des hypothèses sans identifier un défaut unique ; l’interprétation dépend aussi de la construction du résidu.{/if}</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label={$language === 'en' ? 'Residual patterns' : 'Motifs de résidus'}>
    <g transform={`translate(${m.left},${m.top})`}>
      <rect x="0" y="0" width={iW} height={iH} class="frame" />
      <line x1="0" x2={iW} y1={py(2)} y2={py(2)} class="band" />
      <line x1="0" x2={iW} y1={py(-2)} y2={py(-2)} class="band" />
      <line x1="0" x2={iW} y1={py(0)} y2={py(0)} class="zero" />
      {#each pts as p}<circle cx={px(p.xn)} cy={py(p.r)} r="3" class="pt" class:bad={Math.abs(p.r) > 2 && mode !== 'good'} />{/each}
      <text x={iW / 2} y={iH + 30} class="lbl">{$language === 'en' ? 'Predictions' : 'Prédictions'}</text>
      <text transform={`translate(-28,${iH / 2}) rotate(-90)`} class="lbl">CWRES</text>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); --valid: #8a7d3a; }
  @media (min-width: 720px) { .wrap { grid-template-columns: 220px 1fr; align-items: center; } }
  /* Le panneau de chapitre fait ~610 px meme sur grand ecran : on interroge le CONTENEUR,
     pas la fenetre, sinon les controles ecrasent la figure. */
  @container (max-width: 700px) { .wrap { grid-template-columns: 1fr; align-items: stretch; } }
  .controls { display: grid; gap: var(--space-2); }
  .modes { display: flex; flex-wrap: wrap; gap: var(--space-2); }
  .modes button { font-family: var(--font-mono); font-size: 10px; padding: 4px 6px; border: 1px solid var(--border-strong); background: var(--bg-tertiary); border-radius: var(--radius); cursor: pointer; }
  .modes button.on { background: var(--valid); color: var(--bg-tertiary); border-color: var(--valid); }
  .readout { padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-size: var(--text-xs); display: grid; gap: 4px; border-left: 3px solid var(--accent-pk); }
  .readout.ok { border-left-color: var(--accent-pd); }
  .motif { font-family: var(--font-mono); font-weight: 700; color: var(--text-primary); }
  .line { color: var(--text-secondary); line-height: 1.4; }
  .line span { display: block; font-family: var(--font-mono); font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .frame { fill: none; stroke: var(--border-strong); stroke-width: 1; }
  .zero { stroke: var(--valid); stroke-width: 1.4; }
  .band { stroke: var(--border-subtle); stroke-width: 1; stroke-dasharray: 3 3; }
  .pt { fill: var(--text-secondary); opacity: 0.6; }
  .pt.bad { fill: #b0392b; opacity: 0.85; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; text-anchor: middle; }
</style>
