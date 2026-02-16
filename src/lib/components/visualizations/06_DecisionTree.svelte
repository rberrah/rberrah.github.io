<script>
  export let age = 52;
  export let smoker = false;

  /** @type {{label:string, branch:string}[]} */
  let path = [];
  $: path = [];
  $: {
    path = [];
    path.push({ label: 'Âge > 50 ?', branch: age > 50 ? 'oui' : 'non' });
    path.push({ label: 'Fumeur ?', branch: smoker ? 'oui' : 'non' });
  }
</script>

<div class="tree">
  <svg viewBox="0 0 320 220">
    <line x1="160" y1="20" x2="120" y2="80" stroke="#0f172a" />
    <line x1="160" y1="20" x2="200" y2="80" stroke="#0f172a" />
    <line x1="120" y1="80" x2="90" y2="150" stroke="#0f172a" />
    <line x1="120" y1="80" x2="150" y2="150" stroke="#0f172a" />
    <line x1="200" y1="80" x2="230" y2="150" stroke="#0f172a" />
    <line x1="200" y1="80" x2="270" y2="150" stroke="#0f172a" />

    <circle cx="160" cy="20" r="14" fill="#2563eb" />
    <circle cx="120" cy="80" r="12" fill="#22c55e" />
    <circle cx="200" cy="80" r="12" fill="#22c55e" />
    <circle cx="90" cy="150" r="10" fill="#e5e7eb" />
    <circle cx="150" cy="150" r="10" fill="#e5e7eb" />
    <circle cx="230" cy="150" r="10" fill="#e5e7eb" />
    <circle cx="270" cy="150" r="10" fill="#e5e7eb" />

    <text x="140" y="26" font-size="11" fill="#fff">Âge</text>
    <text x="100" y="86" font-size="10" fill="#0f172a">Fumeur</text>
    <text x="185" y="86" font-size="10" fill="#0f172a">Non fumeur</text>
    <text x="60" y="170" font-size="10" fill="#0f172a">CL basse</text>
    <text x="135" y="170" font-size="10" fill="#0f172a">CL moyenne</text>
    <text x="215" y="170" font-size="10" fill="#0f172a">CL élevée</text>
    <text x="258" y="170" font-size="10" fill="#0f172a">CL très élevée</text>

    <circle
      class="ball"
      cx={age > 50 ? 120 : 200}
      cy="80"
      r="7"
      fill="#f97316"
      style={`transform: translateY(${smoker ? 70 : 0}px) translateX(${smoker ? -30 : 30}px); transition: transform 0.3s ease;`}
    />
  </svg>

  <div class="legend">
    {#each path as step}
      <div class="step">
        <strong>{step.label}</strong>
        <span>{step.branch}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .tree {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 12px;
    align-items: center;
  }
  svg {
    width: 100%;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: #fff;
  }
  .legend {
    display: grid;
    gap: 8px;
    font-weight: 600;
  }
  .step {
    display: flex;
    justify-content: space-between;
    padding: 8px 10px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
  }
</style>
