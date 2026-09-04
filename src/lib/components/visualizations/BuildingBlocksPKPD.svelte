<script>
  import { language } from '$lib/stores/language';
  const pkBlocks = [
    { label: 'Dose', tone: 'dose' },
    { label: 'Absorption', tone: 'absorption' },
    { label: 'Distribution', tone: 'distribution' },
    { label: 'Clearance', tone: 'clearance' }
  ];

  const pdBlocks = [
    { label: 'Target', tone: 'target' },
    { label: 'Effect', tone: 'effect' },
    { label: 'Toxicity', tone: 'toxicity' }
  ];
</script>

<section class="viz" aria-label={$language === 'en' ? 'Building-block metaphor for PK and PD' : 'Métaphore des briques pour la PK et la PD'}>
  <div class="rail">
    <div class="side pk">
      <p class="kicker">PK</p>
      <h3>{$language === 'en' ? 'Where the blocks go' : 'Où vont les briques'}</h3>
      <div class="blocks">
        {#each pkBlocks as block}
          <span class={`block ${block.tone}`}>{$language === 'en' ? block.label : ({ Clearance: 'Clairance' }[block.label] ?? block.label)}</span>
        {/each}
      </div>
    </div>

    <div class="arrow" aria-hidden="true">-></div>

    <div class="side pd">
      <p class="kicker">PD</p>
      <h3>{$language === 'en' ? 'What the construction does' : 'Ce que produit la construction'}</h3>
      <div class="blocks">
        {#each pdBlocks as block}
          <span class={`block ${block.tone}`}>{$language === 'en' ? block.label : ({ Target: 'Cible', Effect: 'Effet', Toxicity: 'Toxicité' }[block.label] ?? block.label)}</span>
        {/each}
      </div>
    </div>
  </div>

  <div class="legend">
    <div>
      <strong>{$language === 'en' ? 'Model' : 'Modèle'}</strong>
      <span>{$language === 'en' ? 'the instruction sheet' : "la notice d'assemblage"}</span>
    </div>
    <div>
      <strong>{$language === 'en' ? 'Variability' : 'Variabilité'}</strong>
      <span>{$language === 'en' ? 'students build differently' : 'les étudiants construisent différemment'}</span>
    </div>
    <div>
      <strong>{$language === 'en' ? 'Uncertainty' : 'Incertitude'}</strong>
      <span>{$language === 'en' ? 'the photo is incomplete' : 'la photo est incomplète'}</span>
    </div>
  </div>
</section>

<style>
  .viz {
    display: grid;
    gap: var(--space-5);
    min-height: 360px;
    align-content: center;
  }

  .rail {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: var(--space-4);
    align-items: stretch;
  }

  .side {
    border: 1px solid var(--border-subtle);
    border-radius: 8px;
    background: var(--bg-primary);
    padding: var(--space-4);
    display: grid;
    gap: var(--space-3);
  }

  .kicker {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--accent-pk);
  }

  h3 {
    margin: 0;
    font-size: var(--text-lg);
  }

  .blocks {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-2);
  }

  .block {
    min-height: 58px;
    display: grid;
    place-items: center;
    text-align: center;
    color: var(--bg-tertiary);
    font-weight: 800;
    font-size: var(--text-sm);
    border-radius: 6px;
    box-shadow: inset 0 8px 0 rgba(255, 255, 255, 0.22);
  }

  .dose { background: #b85c38; }
  .absorption { background: #4f6f8f; }
  .distribution { background: #7f6a42; }
  .clearance { background: #384b34; }
  .target { background: #715c8c; }
  .effect { background: #2f7d74; }
  .toxicity { background: #9b3d45; }

  .arrow {
    align-self: center;
    font-family: var(--font-mono);
    font-weight: 900;
    color: var(--text-muted);
  }

  .legend {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-3);
  }

  .legend div {
    border-top: 3px solid var(--accent-ai);
    background: var(--bg-primary);
    border-radius: 6px;
    padding: var(--space-3);
  }

  .legend strong,
  .legend span {
    display: block;
  }

  .legend span {
    color: var(--text-secondary);
    font-size: var(--text-sm);
    margin-top: 2px;
  }

  @media (max-width: 620px) {
    .rail {
      grid-template-columns: 1fr;
    }

    .arrow {
      justify-self: center;
      transform: rotate(90deg);
    }

    .legend {
      grid-template-columns: 1fr;
    }
  }
</style>
