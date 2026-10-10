<script>
  import { language } from '$lib/stores/language';

  /** @type {'add'|'prop'|'comb'} */
  let mode = 'comb';
  let level = 1;

  const a0 = 0.6;
  const b0 = 0.12;

  /** @param {number} pred @param {'add'|'prop'|'comb'} model @param {number} amplitude */
  function sd(pred, model, amplitude) {
    const additive = a0 * amplitude;
    const proportional = b0 * amplitude;
    if (model === 'add') return additive;
    if (model === 'prop') return proportional * pred;
    return Math.sqrt(additive ** 2 + (proportional * pred) ** 2);
  }

  const W = 480, H = 300, m = { top: 16, right: 14, bottom: 42, left: 48 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  const predMax = 20;
  const sdMax = 3.2;
  $: xp = (/** @type {number} */ pred) => (pred / predMax) * iW;
  $: ys = (/** @type {number} */ value) => iH - (Math.min(value, sdMax) / sdMax) * iH;
  $: predictions = Array.from({ length: 101 }, (_, i) => (i / 100) * predMax);
  $: curve = predictions
    .map((pred, i) => `${i ? 'L' : 'M'}${xp(pred).toFixed(1)},${ys(sd(pred, mode, level)).toFixed(1)}`)
    .join(' ');
  $: sdLow = sd(1, mode, level);
  $: sdHigh = sd(10, mode, level);
</script>

<div class="wrap">
  <div class="controls">
    <div class="modes">
      <button class:on={mode === 'add'} on:click={() => (mode = 'add')}>Additive</button>
      <button class:on={mode === 'prop'} on:click={() => (mode = 'prop')}>{$language === 'en' ? 'Proportional' : 'Proportionnelle'}</button>
      <button class:on={mode === 'comb'} on:click={() => (mode = 'comb')}>{$language === 'en' ? 'Combined' : 'Combinée'}</button>
    </div>
    <label class="s"><span>Amplitude</span><strong>×{level.toFixed(1)}</strong><input type="range" min="0.4" max="2" step="0.1" bind:value={level} /></label>
    <div class="readout">
      <div><span>{$language === 'en' ? 'SD at PRED = 1' : 'SD à PRED = 1'}</span><strong>{sdLow.toFixed(2)} mg/L</strong></div>
      <div><span>{$language === 'en' ? 'SD at PRED = 10' : 'SD à PRED = 10'}</span><strong>{sdHigh.toFixed(2)} mg/L</strong></div>
    </div>
    {#if $language === 'en'}
      <p class="hint">This graph shows only the assumed shape of residual SD versus prediction. It does not assess model adequacy: that requires individual predictions and residual diagnostics.</p>
    {:else}
      <p class="hint">Ce graphe montre uniquement la forme supposée de la SD résiduelle selon la prédiction. Il ne juge pas l'adéquation du modèle : cela nécessite des prédictions individuelles et des diagnostics de résidus.</p>
    {/if}
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label={$language === 'en' ? 'Residual standard deviation versus prediction' : 'Écart-type résiduel selon la prédiction'}>
    <g transform={`translate(${m.left},${m.top})`}>
      <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      <path d={curve} class="fit" />
      {#each [1, 10] as pred}
        <line x1={xp(pred)} x2={xp(pred)} y1={ys(sd(pred, mode, level))} y2={iH} class="guide" />
        <circle cx={xp(pred)} cy={ys(sd(pred, mode, level))} r="4" class="point" />
      {/each}
      <text x={iW / 2} y={iH + 34} class="lbl">PRED (mg/L)</text>
      <text transform={`translate(-36,${iH / 2}) rotate(-90)`} class="lbl">SD (mg/L)</text>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); }
  @media (min-width: 720px) { .wrap { grid-template-columns: 220px 1fr; align-items: center; } }
  @container (max-width: 700px) { .wrap { grid-template-columns: 1fr; align-items: stretch; } }
  .controls { display: grid; gap: var(--space-2); }
  .modes { display: flex; gap: var(--space-2); }
  .modes button, .readout, .s { font-family: var(--font-mono); }
  .modes button { flex: 1; font-size: 9px; padding: 4px 2px; border: 1px solid var(--border-strong); background: var(--bg-tertiary); border-radius: var(--radius); cursor: pointer; }
  .modes button.on { background: var(--accent-pk); color: var(--bg-tertiary); border-color: var(--accent-pk); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--accent-pk); }
  .s input { grid-column: 1 / -1; }
  .readout { display: grid; gap: 3px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-size: var(--text-xs); }
  .readout div { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .fit { fill: none; stroke: var(--accent-pk); stroke-width: 2.6; }
  .guide { stroke: var(--text-muted); stroke-width: 1; stroke-dasharray: 3 3; }
  .point { fill: var(--accent-pk); }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 12px; text-anchor: middle; }
</style>
