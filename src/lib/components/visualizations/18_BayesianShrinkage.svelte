<script>
  import { language } from '#lib/stores/language.js';
  import { calculateShrinkage, shrinkagePopulation } from '#lib/science/visualizationMath.js';

  const N = 100;
  const BINS = 17;
  let omega = 0.3;
  let samples = 2;
  let residualSd = 0.6;

  const { trueZ, noiseZ } = shrinkagePopulation(20261010, N);

  /** @param {number[]} values @param {number} limit */
  function histogram(values, limit) {
    const counts = Array(BINS).fill(0);
    for (const value of values) {
      const clipped = Math.max(-limit, Math.min(limit - Number.EPSILON, value));
      const index = Math.floor(((clipped + limit) / (2 * limit)) * BINS);
      counts[index] += 1;
    }
    return counts;
  }

  $: summary = calculateShrinkage({ omega, samples, residualSd, trueZ, noiseZ });
  $: ({ trueEtas, ebe, ebeSd, shrinkage } = summary);
  $: limit = Math.max(0.6, omega * 3.2);
  $: trueHistogram = histogram(trueEtas, limit);
  $: ebeHistogram = histogram(ebe, limit);
  $: maxCount = Math.max(...trueHistogram, ...ebeHistogram, 1);

  const W = 560;
  const H = 250;
  const PAD_X = 36;
  const PAD_Y = 34;
  const GAP = 32;
  const PANEL_W = (W - PAD_X * 2 - GAP) / 2;
  const PANEL_H = H - PAD_Y * 2;

  /** @param {number} index @param {number} panel */
  function barX(index, panel) {
    return PAD_X + panel * (PANEL_W + GAP) + (index / BINS) * PANEL_W;
  }
  /** @param {number} count */
  function barY(count) {
    return PAD_Y + PANEL_H - (count / maxCount) * PANEL_H;
  }
</script>

<div class="shrinkage">
  <div class="controls">
    <label>
      <span>{$language === 'en' ? 'Population omega' : 'Oméga population'}</span>
      <strong>{omega.toFixed(2)}</strong>
      <input type="range" min="0.15" max="0.6" step="0.05" bind:value={omega} />
    </label>
    <label>
      <span>{$language === 'en' ? 'Samples per patient' : 'Prélèvements par patient'}</span>
      <strong>{samples}</strong>
      <input type="range" min="1" max="12" step="1" bind:value={samples} />
    </label>
    <label>
      <span>{$language === 'en' ? 'Measurement SD' : 'SD de mesure'}</span>
      <strong>{residualSd.toFixed(2)}</strong>
      <input type="range" min="0.15" max="1" step="0.05" bind:value={residualSd} />
    </label>
  </div>

  <div class="metrics">
    <div><span>{$language === 'en' ? 'True eta SD' : 'SD des η vrais'}</span><strong>{omega.toFixed(3)}</strong></div>
    <div><span>{$language === 'en' ? 'EBE SD' : 'SD des EBE'}</span><strong>{ebeSd.toFixed(3)}</strong></div>
    <div><span>Eta-shrinkage</span><strong>{(shrinkage * 100).toFixed(1)}%</strong></div>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label={$language === 'en' ? 'True eta and empirical Bayes estimate distributions' : 'Distributions des eta vrais et des estimations bayésiennes empiriques'}>
    {#each [0, 1] as panel}
      <line x1={PAD_X + panel * (PANEL_W + GAP)} y1={PAD_Y + PANEL_H} x2={PAD_X + panel * (PANEL_W + GAP) + PANEL_W} y2={PAD_Y + PANEL_H} class="axis" />
      <line x1={PAD_X + panel * (PANEL_W + GAP) + PANEL_W / 2} y1={PAD_Y} x2={PAD_X + panel * (PANEL_W + GAP) + PANEL_W / 2} y2={PAD_Y + PANEL_H} class="zero" />
    {/each}

    {#each trueHistogram as count, index}
      <rect x={barX(index, 0) + 1} y={barY(count)} width={PANEL_W / BINS - 2} height={PAD_Y + PANEL_H - barY(count)} class="bar true" />
    {/each}
    {#each ebeHistogram as count, index}
      <rect x={barX(index, 1) + 1} y={barY(count)} width={PANEL_W / BINS - 2} height={PAD_Y + PANEL_H - barY(count)} class="bar ebe" />
    {/each}

    <text x={PAD_X + PANEL_W / 2} y="17" class="title">{$language === 'en' ? 'True eta distribution' : 'Distribution des η vrais'}</text>
    <text x={PAD_X + PANEL_W + GAP + PANEL_W / 2} y="17" class="title">{$language === 'en' ? 'EBE distribution' : 'Distribution des EBE'}</text>
    <text x={PAD_X + PANEL_W / 2} y={H - 8} class="label">η</text>
    <text x={PAD_X + PANEL_W + GAP + PANEL_W / 2} y={H - 8} class="label">η̂</text>
  </svg>

  <p class="formula">sh<sub>η</sub> = 1 − SD(η̂) / ω = <strong>{(shrinkage * 100).toFixed(1)}%</strong></p>
  <p class="note">
    {$language === 'en'
      ? `Illustrative Gaussian random-effects model with ${N} patients. Reducing individual information contracts the EBE distribution toward zero. In real analyses, negative values can occur when EBE dispersion exceeds omega and require interpretation with the model and sample.`
      : `Modèle illustratif gaussien à effets aléatoires avec ${N} patients. Réduire l’information individuelle contracte la distribution des EBE vers zéro. Dans une analyse réelle, une valeur négative peut apparaître si la dispersion des EBE dépasse oméga et doit être interprétée avec le modèle et l’échantillon.`}
  </p>
</div>

<style>
  .shrinkage { display: grid; gap: 10px; }
  .controls { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 8px; }
  label { display: grid; grid-template-columns: 1fr auto; gap: 4px 8px; font-size: var(--text-sm); font-weight: 700; }
  label span { color: var(--text-secondary); }
  label input { grid-column: 1 / -1; width: 100%; }
  .metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
  .metrics div { display: grid; gap: 2px; padding: 8px; background: var(--bg-secondary); border-radius: var(--radius); }
  .metrics span { color: var(--text-muted); font-size: var(--text-xs); }
  .metrics strong { font-family: var(--font-mono); }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .zero { stroke: var(--border-subtle); stroke-width: 1; stroke-dasharray: 3 3; }
  .bar.true { fill: #0f766e; opacity: 0.72; }
  .bar.ebe { fill: #b45309; opacity: 0.78; }
  .title, .label { fill: var(--text-secondary); text-anchor: middle; font-family: var(--font-mono); font-size: 11px; }
  .formula { margin: 0; text-align: center; font-family: var(--font-mono); }
  .note { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  @media (max-width: 520px) { .metrics { grid-template-columns: 1fr; } }
</style>
