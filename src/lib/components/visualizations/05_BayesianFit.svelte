<script>
  export let prior = 5;
  export let observation = 8;
  $: posterior = (prior * 0.4 + observation * 0.6).toFixed(1);
</script>

<div class="bayes">
  <div class="math">
    <div class="term prior">Prior: {prior} L/h</div>
    <div class="term like">Donnée: {observation} µg/L</div>
    <div class="term post">Posterior: {posterior}</div>
  </div>
  <svg viewBox="0 0 320 180">
    <defs>
      <linearGradient id="gradPost" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%" stop-color="#22c55e" />
        <stop offset="100%" stop-color="#2563eb" />
      </linearGradient>
    </defs>
    <rect x="30" y="130" width="60" height="30" fill="#cbd5e1" rx="6" />
    <rect x="140" y="90" width="60" height="70" fill="#fbbf24" rx="6" />
    <rect x="220" y="60" width="60" height="100" fill="url(#gradPost)" rx="6" />
    <text x="40" y="125" font-size="11" fill="#0f172a">Prior</text>
    <text x="145" y="85" font-size="11" fill="#0f172a">Likelihood</text>
    <text x="225" y="55" font-size="11" fill="#0f172a">Posterior</text>
  </svg>
</div>

<style>
  .bayes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 12px;
    align-items: center;
  }
  .math {
    display: grid;
    gap: 8px;
    font-weight: 700;
    color: #0f172a;
  }
  .term {
    padding: 8px 10px;
    border-radius: 10px;
  }
  .prior {
    background: #e0f2fe;
  }
  .like {
    background: #fef3c7;
  }
  .post {
    background: #e0f2fe;
    border: 1px solid #93c5fd;
  }
  svg {
    width: 100%;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: #fff;
  }
</style>
