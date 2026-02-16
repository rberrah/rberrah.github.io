<script>
  import { onMount } from 'svelte';
  export let width = 360;
  export let height = 220;
  export let margin = { top: 20, right: 12, bottom: 36, left: 50 };
  export let background = '#fff';
  export let grid = false;
  export let xScale;
  export let yScale;

  $: innerWidth = width - margin.left - margin.right;
  $: innerHeight = height - margin.top - margin.bottom;

  onMount(() => {
    // nothing extra; placeholder if future resize observer
  });
</script>

<svg {width} {height} style={`background:${background}; border:1px solid #e2e8f0; border-radius:12px`}>
  <g transform={`translate(${margin.left},${margin.top})`}>
    {#if grid && xScale && yScale}
      {#each yScale.ticks(5) as t}
        <line x1="0" x2={innerWidth} y1={yScale(t)} y2={yScale(t)} stroke="#e2e8f0" stroke-width="1" />
      {/each}
      {#each xScale.ticks(6) as t}
        <line y1="0" y2={innerHeight} x1={xScale(t)} x2={xScale(t)} stroke="#f1f5f9" stroke-width="1" />
      {/each}
    {/if}
    <slot {innerWidth} {innerHeight} {xScale} {yScale} />
  </g>
</svg>
