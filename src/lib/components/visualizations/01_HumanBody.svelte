<script>
  import { language } from '#lib/stores/language.js';

  // The regions are schematic, not a diagnostic anatomical illustration.
  const zones = [
    { id: 'blood', fr: 'Distribution', en: 'Distribution', detailFr: 'Le sang transporte le médicament vers les tissus.', detailEn: 'Blood transports the medicine to the tissues.', cx: 120, cy: 116, r: 19 },
    { id: 'liver', fr: 'Métabolisme', en: 'Metabolism', detailFr: 'Le foie peut transformer le médicament.', detailEn: 'The liver can transform the medicine.', cx: 143, cy: 162, r: 17 },
    { id: 'gut', fr: 'Absorption', en: 'Absorption', detailFr: 'Après une prise orale, le médicament traverse le tube digestif.', detailEn: 'After an oral dose, the medicine crosses the digestive tract.', cx: 121, cy: 204, r: 17 },
    { id: 'kidney', fr: 'Élimination', en: 'Elimination', detailFr: 'Les reins peuvent éliminer le médicament dans les urines.', detailEn: 'The kidneys can eliminate the medicine in urine.', cx: 97, cy: 166, r: 14 }
  ];
  /** @type {string | null} */
  let active = null;
  $: selectedZone = zones.find((z) => z.id === active);
</script>

<div class="wrapper">
  <svg viewBox="0 0 240 340" class="body" role="group" aria-label={$language === 'en' ? 'Interactive schematic of the body showing ADME processes' : 'Schéma interactif du corps et des processus ADME'}>
    <title>{$language === 'en' ? 'Where drugs are absorbed, distributed, metabolized and eliminated' : 'Où les médicaments sont absorbés, distribués, métabolisés et éliminés'}</title>
    <g aria-hidden="true">
      <!-- Continuous human outline: shoulders, arms, torso and two legs. -->
      <circle cx="120" cy="35" r="22" class="silhouette"/>
      <rect x="109" y="52" width="22" height="19" rx="8" class="silhouette"/>
      <path class="silhouette" d="M99 67 C81 69 70 79 64 96 L48 169 Q44 181 53 184 Q62 187 66 176 L83 130 L83 194 Q83 210 92 229 L94 314 Q94 326 104 326 Q114 326 114 314 L120 241 L126 314 Q126 326 136 326 Q146 326 146 314 L148 229 Q157 210 157 194 L157 130 L174 176 Q178 187 187 184 Q196 181 192 169 L176 96 C170 79 159 69 141 67 Z"/>
      <!-- Simplified organ landmarks, deliberately illustrative rather than clinical. -->
      <path class="organ lung" d="M115 91 C105 81 94 91 93 111 Q91 133 108 138 L115 123 Z M125 91 C135 81 146 91 147 111 Q149 133 132 138 L125 123 Z"/>
      <path class="organ heart" d="M120 118 C116 109 105 114 109 123 Q113 129 120 134 Q127 129 131 123 C135 114 124 109 120 118 Z"/>
      <path class="organ liver" d="M125 151 Q146 143 155 158 Q158 168 149 172 L128 170 Q121 165 125 151 Z"/>
      <path class="organ kidney" d="M92 160 Q81 155 83 173 Q85 188 96 181 Q105 175 98 166 M148 160 Q159 155 157 173 Q155 188 144 181 Q135 175 142 166"/>
      <path class="organ gut" d="M109 192 Q131 186 133 195 Q135 203 111 203 Q102 210 114 215 Q128 220 134 208 M111 192 Q104 198 108 207"/>
    </g>
    {#each zones as z}
      <circle
        class:active={active === z.id}
        class="hot"
        cx={z.cx}
        cy={z.cy}
        r={z.r}
        role="button"
        aria-label={$language === 'en' ? z.en : z.fr}
        aria-pressed={active === z.id}
        tabindex="0"
        on:mouseenter={() => (active = z.id)}
        on:mouseleave={() => (active = null)}
        on:focus={() => (active = z.id)}
        on:click={() => (active = z.id)}
        on:keydown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            active = z.id;
          }
        }}
      >
        <title>{$language === 'en' ? z.en : z.fr}</title>
      </circle>
    {/each}
  </svg>
  <div class="zone-list" aria-label={$language === 'en' ? 'ADME stages' : 'Étapes ADME'}>
    {#each zones as z}
      <button type="button" class:active={active === z.id} aria-pressed={active === z.id} on:focus={() => (active = z.id)} on:click={() => (active = z.id)}>
        {$language === 'en' ? z.en : z.fr}
      </button>
    {/each}
  </div>
  <p class="legend" role="status" aria-live="polite">
    {#if selectedZone}
      <strong>{$language === 'en' ? selectedZone.en : selectedZone.fr}.</strong>
      {$language === 'en' ? selectedZone.detailEn : selectedZone.detailFr}
    {:else}
      {$language === 'en' ? 'Select a region to explore its role in ADME.' : 'Sélectionnez une région pour découvrir son rôle dans l’ADME.'}
    {/if}
  </p>
</div>

<style>
  .wrapper { display: grid; gap: var(--space-3); justify-items: center; }
  .body { width: 100%; max-width: 280px; height: auto; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius); }
  .silhouette { fill: var(--bg-tertiary); stroke: var(--text-secondary); stroke-width: 1.6; stroke-linejoin: round; }
  .organ { stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
  .lung { fill: var(--accent-pk); fill-opacity: 0.15; stroke: var(--accent-pk); stroke-opacity: 0.45; }
  .heart { fill: var(--accent-pd); fill-opacity: 0.45; stroke: var(--accent-pd); }
  .liver { fill: var(--accent-pd); fill-opacity: 0.16; stroke: var(--accent-pd); }
  .kidney { fill: none; stroke: var(--accent-pk); }
  .gut { fill: none; stroke: var(--accent-pd); }
  .hot { fill: var(--accent-pk); fill-opacity: 0.10; stroke: var(--accent-pk); stroke-width: 1.5; stroke-opacity: 0.7; cursor: pointer; }
  .hot:hover, .hot.active, .hot:focus { stroke-width: 3; fill-opacity: 0.23; outline: none; }
  .hot:focus-visible { stroke: var(--text-primary); stroke-width: 3.5; }
  .zone-list { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-2); }
  .zone-list button { padding: 6px 10px; color: var(--text-primary); font: inherit; font-size: var(--text-sm); border: 1px solid var(--border-strong); background: var(--bg-secondary); border-radius: var(--radius); cursor: pointer; }
  .zone-list button.active { border-color: var(--accent-pk); background: var(--bg-tertiary); }
  .zone-list button:focus-visible { outline: 2px solid var(--accent-pk); outline-offset: 2px; }
  .legend { font-size: var(--text-sm); color: var(--text-secondary); text-align: center; min-height: 2.8em; max-width: 34ch; margin: 0; }
  .legend strong { color: var(--text-primary); }
</style>
