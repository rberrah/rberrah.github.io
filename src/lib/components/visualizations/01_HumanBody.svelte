<script>
  const zones = [
    { id: 'gut', label: 'Absorption', cx: 100, cy: 170, r: 28 },
    { id: 'blood', label: 'Distribution', cx: 100, cy: 110, r: 30 },
    { id: 'liver', label: 'Métabolisme', cx: 80, cy: 150, r: 18 },
    { id: 'kidney', label: 'Élimination', cx: 120, cy: 190, r: 16 }
  ];
  /** @type {string | null} */
  let active = null;
</script>

<div class="wrapper">
  <svg viewBox="0 0 200 360" class="body" aria-label="Silhouette humaine avec zones ADME">
    <g fill="#e2e8f0" stroke="#0f172a" stroke-width="2">
      <circle cx="100" cy="40" r="24" />
      <rect x="80" y="64" width="40" height="70" rx="10" />
      <rect x="60" y="134" width="80" height="90" rx="12" />
      <rect x="60" y="224" width="26" height="90" rx="8" />
      <rect x="114" y="224" width="26" height="90" rx="8" />
    </g>

    {#each zones as z}
      <circle
        class="hot"
        cx={z.cx}
        cy={z.cy}
        r={z.r}
        fill="rgba(59,130,246,0.12)"
        stroke={active === z.id ? '#2563eb' : 'transparent'}
        stroke-width="3"
        role="button"
        aria-label={z.label}
        tabindex="0"
        on:mouseenter={() => (active = z.id)}
        on:mouseleave={() => (active = null)}
        on:focus={() => (active = z.id)}
        on:blur={() => (active = null)}
      />
      {#if active === z.id}
        <text x={z.cx} y={z.cy} text-anchor="middle" dy="4" font-size="11" fill="#0f172a">
          {z.label}
        </text>
      {/if}
    {/each}
  </svg>
  <div class="legend">
    Survolez / tabulez : Gut → Absorption · Sang → Distribution · Foie → Métabolisme · Rein → Élimination
  </div>
</div>

<style>
  .wrapper {
    display: grid;
    gap: 8px;
    justify-items: center;
  }
  .body {
    width: 100%;
    max-width: 320px;
    background: radial-gradient(circle at 50% 10%, #f8fafc 0%, #e2e8f0 70%);
    border-radius: 16px;
    padding: 8px;
  }
  .hot {
    cursor: pointer;
    transition: 0.2s;
    outline: none;
  }
  .hot:focus {
    stroke: #2563eb;
  }
  .legend {
    font-size: 0.95rem;
    color: #334155;
    text-align: center;
  }
</style>
