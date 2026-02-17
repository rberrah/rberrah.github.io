<script>
  const cards = [
    { id: 'nca', title: 'NCA', subtitle: 'Trapèzes descriptifs' },
    { id: 'poppk', title: 'PopPK', subtitle: 'Variabilité + prédiction' },
    { id: 'pbpk', title: 'PBPK', subtitle: 'Organe par organe' }
  ];
  let active = 'nca';
</script>

<div class="grid">
  {#each cards as c}
    <button class:active={active === c.id} on:click={() => (active = c.id)}>
      <div class="title">{c.title}</div>
      <div class="subtitle">{c.subtitle}</div>
    </button>
  {/each}
</div>

<div class="canvas">
  {#if active === 'nca'}
    <svg viewBox="0 0 360 200">
      <path d="M30 160 Q120 40 330 150" fill="none" stroke="#2563eb" stroke-width="3" />
      <g fill="rgba(37,99,235,0.15)" stroke="#2563eb" stroke-width="1">
        <polygon points="30,160 70,160 70,120" />
        <polygon points="70,160 110,160 110,90" />
        <polygon points="110,160 150,160 150,75" />
        <polygon points="150,160 190,160 190,90" />
      </g>
      <text x="60" y="40" font-size="12" fill="#ef4444">AUC (trapèzes)</text>
    </svg>
  {:else if active === 'poppk'}
    <svg viewBox="0 0 360 200">
      {#each Array.from({ length: 12 }) as _, i}
        <path
          d={`M30 160 Q120 ${90 + (i - 6) * 6} 330 ${140 + (i - 6) * 6}`}
          fill="none"
          stroke="rgba(37,99,235,0.2)"
          stroke-width="2"
        />
      {/each}
      <path d="M30 150 Q120 90 330 130" fill="none" stroke="#2563eb" stroke-width="3" />
      <path d="M220 40 Q260 80 220 120" fill="none" stroke="#0f172a" stroke-width="2" />
      <path d="M220 40 Q180 80 220 120" fill="none" stroke="#0f172a" stroke-width="2" />
      <text x="200" y="35" font-size="12" fill="#0f172a">Distribution</text>
    </svg>
  {:else}
    <svg viewBox="0 0 360 200">
      <g stroke="#0f172a" stroke-width="2" fill="rgba(14,165,233,0.12)">
        <circle cx="120" cy="80" r="26" />
        <circle cx="220" cy="60" r="24" />
        <circle cx="260" cy="120" r="30" />
        <circle cx="160" cy="140" r="22" />
        <line x1="146" y1="82" x2="196" y2="70" />
        <line x1="140" y1="100" x2="240" y2="120" />
        <line x1="220" y1="84" x2="260" y2="96" />
        <line x1="160" y1="118" x2="120" y2="102" />
        <line x1="160" y1="158" x2="260" y2="140" />
      </g>
      <text x="70" y="180" font-size="12" fill="#0f172a">Organes reliés (débits sanguins)</text>
    </svg>
  {/if}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 8px;
    margin-bottom: 10px;
  }
  button {
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: #fff;
    padding: 10px;
    text-align: left;
    cursor: pointer;
    transition: 0.2s;
  }
  button.active {
    border-color: #2563eb;
    box-shadow: 0 8px 24px rgba(37, 99, 235, 0.15);
  }
  .title {
    font-weight: 700;
    color: #0f172a;
  }
  .subtitle {
    color: #475569;
    font-size: 0.9rem;
  }
  .canvas {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px;
  }
  svg {
    width: 100%;
  }
</style>
