<script lang="ts">
  import { scaleLinear } from 'd3-scale';
  import { line } from 'd3-shape';
  type Point = { x: number; y: number };
  type Series = { points: Point[]; color: string; label: string; dashed?: boolean; dots?: boolean };
  let { series = [], xLabel = '', yLabel = '', title = '', categories = false, highlight, xDomain, xTicks, yMax, bands = [] }: { series?: Series[]; xLabel?: string; yLabel?: string; title?: string; categories?: boolean; highlight?: Point; xDomain?: [number, number]; xTicks?: number[]; yMax?: number; bands?: { from: number; to: number }[] } = $props();
  let width = $state(600);
  const height = 280;
  let right = $derived(Math.max(260, width) - 20);
  let points = $derived(series.flatMap(s => s.points));
  let x = $derived(scaleLinear().domain(xDomain ?? (points.length ? [Math.min(...points.map(p => p.x)), Math.max(...points.map(p => p.x))] : [0, 1])).range([58, right]));
  let y = $derived(scaleLinear().domain([0, yMax ?? Math.max(0.1, ...points.map(p => p.y)) * 1.1]).nice().range([height - 46, 24]));
  let path = $derived(line().x((p: Point) => x(p.x)).y((p: Point) => y(p.y)));
  let ticks = $derived(categories ? [0, 1, 2] : (xTicks ?? x.ticks(width < 450 ? 3 : 6)));
  const format = (n: number) => Number(n.toPrecision(3)).toString();
</script>

<figure bind:clientWidth={width}>
  <figcaption>{title}</figcaption>
  <svg viewBox={`0 0 ${Math.max(280, width)} ${height}`} role="img" aria-label={title} data-testid="covariate-plot">
    {#each bands as band}<rect x={x(band.from)} y="24" width={x(band.to) - x(band.from)} height={height - 70} fill="var(--border-subtle)" opacity="0.5" />{/each}
    {#each y.ticks(4) as t}
      <line x1="58" x2={right} y1={y(t)} y2={y(t)} class="grid" />
      <text x="50" y={y(t) + 4} text-anchor="end">{format(t)}</text>
    {/each}
    {#each ticks as t}
      <text x={x(t)} y={height - 26} text-anchor="middle">{categories ? ['A', 'B', 'C'][t] : format(t)}</text>
    {/each}
    <text x="58" y="13">{yLabel}</text><text x={right} y={height - 5} text-anchor="end">{xLabel}</text>
    {#each series as s}
      {#if !categories && !s.dots}<path d={path(s.points) ?? ''} stroke={s.color} stroke-dasharray={s.dashed ? '7 5' : undefined} fill="none" stroke-width="2.5" />{/if}
      {#if categories || s.dots}{#each s.points as p}<circle cx={x(p.x)} cy={y(p.y)} r={s.dots ? 3 : 5} fill={s.color} opacity={s.dots ? 0.65 : 1} />{/each}{/if}
    {/each}
    {#if highlight}
      <path d={`M58,${y(highlight.y)} H${x(highlight.x)} V${height - 46}`} fill="none" stroke="var(--text-muted)" stroke-dasharray="3 4" />
      <circle data-testid="covariate-cursor" cx={x(highlight.x)} cy={y(highlight.y)} r="6" fill="var(--text-primary)" stroke="var(--bg-primary)" stroke-width="2" />
    {/if}
  </svg>
  <div class="legend">{#each series as s}<span><i class:dots={s.dots} style={`--line:${s.color};border-top-style:${s.dashed ? 'dashed' : 'solid'}`}></i>{s.label}</span>{/each}</div>
</figure>

<style>
  figure { margin: 0; min-width: 0; width: 100%; }
  figcaption { font-weight: 650; font-size: 1rem; margin: 4px 0 12px; }
  svg { width: 100%; height: auto; display: block; overflow: visible; }
  text { fill: var(--text-secondary); font: 11px 'Inter Variable', sans-serif; letter-spacing: 0; }
  .grid { stroke: var(--border-subtle); }
  .legend { display: flex; flex-wrap: wrap; gap: 8px 18px; font-size: .82rem; padding-top: 6px; }
  .legend span { display: inline-flex; align-items: center; gap: 7px; }
  i { width: 25px; border-top: 3px solid var(--line); }
  i.dots { width: 7px; height: 7px; border: 0; background: var(--line); border-radius: 50%; }
</style>
