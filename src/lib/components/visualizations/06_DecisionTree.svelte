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
  // La CONCLUSION de l'arbre — la catégorie de clairance — n'était portée que par la position
  // de la bille orange : invisible pour un lecteur d'écran, ambiguë pour un daltonien. On la
  // calcule explicitement, on l'écrit en toutes lettres, et on la met dans l'aria-label du SVG.
  $: clx = age > 50 ? (smoker ? 90 : 150) : smoker ? 270 : 230;
  $: clLabel = age > 50 ? (smoker ? 'CL basse' : 'CL moyenne') : smoker ? 'CL très élevée' : 'CL élevée';
</script>

<div class="tree">
  <svg
    viewBox="0 0 320 220"
    role="img"
    aria-label={`Arbre de décision : ${age > 50 ? 'âge > 50' : 'âge ≤ 50'}, ${smoker ? 'fumeur' : 'non fumeur'} → ${clLabel}`}
  >
    <line x1="160" y1="20" x2="120" y2="80" stroke="var(--text-primary)" />
    <line x1="160" y1="20" x2="200" y2="80" stroke="var(--text-primary)" />
    <line x1="120" y1="80" x2="90" y2="150" stroke="var(--text-primary)" />
    <line x1="120" y1="80" x2="150" y2="150" stroke="var(--text-primary)" />
    <line x1="200" y1="80" x2="230" y2="150" stroke="var(--text-primary)" />
    <line x1="200" y1="80" x2="270" y2="150" stroke="var(--text-primary)" />

    <circle cx="160" cy="20" r="14" fill="#2563eb" />
    <circle cx="120" cy="80" r="12" fill="#22c55e" />
    <circle cx="200" cy="80" r="12" fill="#22c55e" />
    <circle cx="90" cy="150" r="10" fill="var(--bg-secondary)" />
    <circle cx="150" cy="150" r="10" fill="var(--bg-secondary)" />
    <circle cx="230" cy="150" r="10" fill="var(--bg-secondary)" />
    <circle cx="270" cy="150" r="10" fill="var(--bg-secondary)" />

    <text x="140" y="26" font-size="11" fill="var(--bg-tertiary)">Âge</text>
    <text x="100" y="86" font-size="10" fill="var(--text-primary)">Fumeur</text>
    <text x="185" y="86" font-size="10" fill="var(--text-primary)">Non fumeur</text>
    <text x="60" y="170" font-size="10" fill="var(--text-primary)">CL basse</text>
    <text x="135" y="170" font-size="10" fill="var(--text-primary)">CL moyenne</text>
    <text x="215" y="170" font-size="10" fill="var(--text-primary)">CL élevée</text>
    <text x="258" y="170" font-size="10" fill="var(--text-primary)">CL très élevée</text>

    <circle class="ball" cx={clx} cy="150" r="7" fill="#f97316" />
  </svg>

  <div class="legend">
    {#each path as step}
      <div class="step">
        <strong>{step.label}</strong>
        <span>{step.branch}</span>
      </div>
    {/each}
    <div class="step result">
      <strong>Résultat</strong>
      <span>{clLabel}</span>
    </div>
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
    border: 1px solid var(--bg-secondary);
    border-radius: 12px;
    background: var(--bg-tertiary);
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
    background: var(--bg-secondary);
    border: 1px solid var(--bg-secondary);
    border-radius: 10px;
  }
  .step.result {
    background: color-mix(in srgb, var(--accent-pk-vivid, #f97316) 14%, var(--bg-tertiary));
    border-color: var(--accent-pk-vivid, #f97316);
    color: var(--text-primary);
  }
  .ball {
    transition: cx 0.3s ease, cy 0.3s ease;
  }
  @media (prefers-reduced-motion: reduce) {
    .ball {
      transition: none;
    }
  }
</style>
