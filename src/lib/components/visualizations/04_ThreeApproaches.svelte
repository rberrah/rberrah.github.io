<script>
  export let state = 0; // 0 NCA, 1 PopPK, 2 PBPK

  const labels = ['NCA : mesurer', 'PopPK : moyenne + variabilité', 'PBPK : organes et flux'];
</script>

<div class="panel">
  <div class="label">{labels[state] || labels[0]}</div>
  <svg viewBox="0 0 360 200">
    {#if state === 0}
      <path d="M30 160 Q120 40 330 150" fill="none" stroke="#2563eb" stroke-width="3" />
      <rect x="30" y="150" width="300" height="10" fill="rgba(37,99,235,0.08)" />
      <line x1="80" x2="80" y1="155" y2="60" stroke="#ef4444" stroke-width="3" />
      <text x="90" y="70" font-size="12" fill="#ef4444">AUC mesurée</text>
    {:else if state === 1}
      <path d="M30 150 Q120 80 330 140" fill="none" stroke="#2563eb" stroke-width="3" />
      <path d="M30 170 Q120 70 330 160" fill="none" stroke="rgba(37,99,235,0.35)" stroke-width="3" />
      <path d="M30 130 Q120 90 330 120" fill="none" stroke="rgba(37,99,235,0.35)" stroke-width="3" />
      <text x="40" y="40" font-size="12" fill="#111827">Nuage population</text>
    {:else}
      <g stroke="#0f172a" stroke-width="2">
        <circle cx="120" cy="80" r="26" fill="#e0f2fe" />
        <circle cx="220" cy="60" r="24" fill="#fee2e2" />
        <circle cx="260" cy="120" r="30" fill="#dcfce7" />
        <line x1="146" y1="82" x2="196" y2="70" />
        <line x1="140" y1="100" x2="240" y2="120" />
        <line x1="220" y1="84" x2="260" y2="96" />
      </g>
      <text x="60" y="180" font-size="12" fill="#0f172a">Organes reliés (PBPK)</text>
    {/if}
  </svg>
</div>

<style>
  .panel {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
  }
  .label {
    font-weight: 700;
    margin-bottom: 6px;
    color: #0f172a;
  }
  svg {
    width: 100%;
  }
</style>
