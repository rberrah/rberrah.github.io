<script>
  import { scaleLinear } from 'd3-scale';
  import ChartFrame from '$lib/charts/ChartFrame.svelte';
  import Axis from '$lib/charts/Axis.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import { paddedDomain } from '$lib/charts/domain';

  const clStd = 6; // CL population (L/h) à 70 kg
  const wtStd = 70;

  let weight = 70;
  let exponent = 0.75;
  let mode = 'allometric'; // 'allometric' | 'linear'

  // jeu de données synthétique mais déterministe
  const weights = Array.from({ length: 21 }, (_, i) => 40 + i * 4);
  const patients = weights.map((w, i) => {
    const noise = 1 + 0.12 * Math.sin(i * 1.7);
    const clAllo = clStd * Math.pow(w / wtStd, 0.75) * noise;
    return { w, cl: Number(clAllo.toFixed(2)) };
  });

  $: lineAllo = weights.map((w) => ({
    w,
    cl: clStd * Math.pow(w / wtStd, exponent)
  }));
  $: lineLinear = weights.map((w) => ({
    w,
    cl: clStd * (w / wtStd)
  }));

  $: selectedCL =
    mode === 'allometric'
      ? clStd * Math.pow(weight / wtStd, exponent)
      : clStd * (weight / wtStd);

  // échelles
  $: yDomain = paddedDomain(
    [
      ...lineAllo.map((p) => p.cl),
      ...lineLinear.map((p) => p.cl),
      ...patients.map((p) => p.cl),
      selectedCL
    ],
    0.15
  );
  $: xScale = scaleLinear().domain([40, 140]).range([0, 320]);
  $: yScale = scaleLinear().domain(yDomain).range([200, 0]);
</script>

<div class="allo">
  <div class="controls">
    <Slider label="Poids patient (kg)" min={40} max={140} step={1} bind:value={weight} />
    <Slider label="Exposant allométrique" min={0.5} max={1} step={0.05} bind:value={exponent} disabled={mode !== 'allometric'} />
    <div class="mode">
      <span>Modèle :</span>
      <button class:active={mode === 'allometric'} on:click={() => (mode = 'allometric')}>Allométrique</button>
      <button class:active={mode === 'linear'} on:click={() => (mode = 'linear')}>Linéaire (règle de 3)</button>
    </div>
    <div class="stat">
      CL patient estimée : <strong>{selectedCL.toFixed(2)} L/h</strong>
      {mode === 'allometric' ? ' (loi de Kleiber)' : ' (proportionnel au poids)'}
    </div>
  </div>

  <ChartFrame width={400} height={260} margin={{ top: 16, right: 16, bottom: 50, left: 60 }} xScale={xScale} yScale={yScale} grid={true}>
    <svelte:fragment let:xScale let:yScale let:innerWidth let:innerHeight>
      <!-- nuage de points patients -->
      {#each patients as p}
        <circle cx={xScale(p.w)} cy={yScale(p.cl)} r="4" fill="#94a3b8" opacity="0.7" />
      {/each}

      <!-- courbe allométrique -->
      <polyline
        fill="none"
        stroke="#2563eb"
        stroke-width={mode === 'allometric' ? 3 : 1.5}
        stroke-dasharray={mode === 'allometric' ? '0' : '6 4'}
        points={lineAllo.map((p) => `${xScale(p.w)},${yScale(p.cl)}`).join(' ')}
      />

      <!-- courbe linéaire -->
      <polyline
        fill="none"
        stroke="#f97316"
        stroke-width={mode === 'linear' ? 3 : 1.5}
        stroke-dasharray={mode === 'linear' ? '0' : '6 4'}
        points={lineLinear.map((p) => `${xScale(p.w)},${yScale(p.cl)}`).join(' ')}
      />

      <!-- patient sélectionné -->
      <circle cx={xScale(weight)} cy={yScale(selectedCL)} r="6" fill="#ef4444" />
      <text x={xScale(weight) + 6} y={yScale(selectedCL) - 6} font-size="11" fill="#0f172a">
        {selectedCL.toFixed(2)} L/h
      </text>

      <Axis orient="bottom" scale={xScale} length={innerWidth} label="Poids (kg)" />
      <g transform="translate(-8,0)">
        <Axis orient="left" scale={yScale} length={innerHeight} label="Clairance CL (L/h)" />
      </g>
    </svelte:fragment>
  </ChartFrame>

  <div class="callout">
    <strong>À retenir :</strong> l'exposant allométrique 0,75 fait que les enfants ne sont pas des “adultes miniatures”.
    Une règle de 3 linéaire surestime souvent la dose chez l'enfant et la sous-estime chez l'adulte obèse.
  </div>
</div>

<style>
  .allo {
    display: grid;
    gap: 12px;
  }
  .controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 10px;
    align-items: center;
  }
  .mode {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }
  button {
    border: 1px solid #cbd5e1;
    background: #fff;
    padding: 6px 10px;
    border-radius: 8px;
    cursor: pointer;
  }
  button.active {
    background: #2563eb;
    color: #fff;
    border-color: #2563eb;
  }
  .stat {
    font-weight: 600;
    color: #0f172a;
  }
  .callout {
    background: #eef2ff;
    border: 1px solid #c7d2fe;
    padding: 10px 12px;
    border-radius: 10px;
    color: #312e81;
    font-size: 0.95rem;
  }
</style>
