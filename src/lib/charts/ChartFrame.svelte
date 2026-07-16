<script>
  export let width = 360;
  export let height = 220;
  export let margin = { top: 20, right: 12, bottom: 36, left: 50 };
  export let background = 'var(--bg-tertiary)';
  export let grid = false;
  export let xScale;
  export let yScale;

  $: innerWidth = width - margin.left - margin.right;
  $: innerHeight = height - margin.top - margin.bottom;
</script>

<!-- viewBox + max-width:100% : le SVG se met à l'échelle de son conteneur au lieu de le forcer
     à sa largeur fixe. Sans cela, sur un téléphone la figure débordait et poussait la page en
     défilement horizontal. Fond et bordure passent par le thème (mode sombre). -->
<svg
  viewBox={`0 0 ${width} ${height}`}
  preserveAspectRatio="xMidYMid meet"
  style={`background:${background}; border:1px solid var(--border-subtle); border-radius:12px; width:100%; max-width:${width}px; height:auto`}
>
  <g transform={`translate(${margin.left},${margin.top})`}>
    {#if grid && xScale && yScale}
      {#each yScale.ticks(5) as t}
        <line x1="0" x2={innerWidth} y1={yScale(t)} y2={yScale(t)} stroke="var(--border-subtle)" stroke-width="1" />
      {/each}
      {#each xScale.ticks(6) as t}
        <line y1="0" y2={innerHeight} x1={xScale(t)} x2={xScale(t)} stroke="var(--hairline)" stroke-width="1" />
      {/each}
    {/if}
    <slot {innerWidth} {innerHeight} {xScale} {yScale} />
  </g>
</svg>
