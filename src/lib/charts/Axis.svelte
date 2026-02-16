<script>
  import { scaleLinear } from 'd3-scale';
  export let scale = scaleLinear();
  export let orient = 'bottom'; // bottom or left
  export let length = 300;
  export let tickCount = 6;
  /** @param {number} d */
  export let format = (d) => d;
  export let label = '';
</script>

{#if orient === 'bottom'}
  <g>
    {#each scale.ticks(tickCount) as t}
      <g transform={`translate(${scale(t)},0)`}>
        <line y1="0" y2="6" stroke="#0f172a" />
        <text y="18" text-anchor="middle" font-size="10" fill="#475569">{format(t)}</text>
      </g>
    {/each}
    <text x={length / 2} y="32" text-anchor="middle" font-size="11" fill="#0f172a">{label}</text>
  </g>
{:else}
  <g>
    {#each scale.ticks(tickCount) as t}
      <g transform={`translate(0,${scale(t)})`}>
        <line x1="0" x2="-6" stroke="#0f172a" />
        <text x="-10" y="4" text-anchor="end" font-size="10" fill="#475569">{format(t)}</text>
      </g>
    {/each}
    <text x="-42" y={length / 2} text-anchor="middle" font-size="11" fill="#0f172a" transform="rotate(-90 -42 {length / 2})">{label}</text>
  </g>
{/if}
