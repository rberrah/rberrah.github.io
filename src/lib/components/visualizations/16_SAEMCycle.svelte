<script>
  import { language } from '$lib/stores/language';
  const steps = ['S (Simulation)', 'SA (Approximation)', 'M (Maximisation)'];
  let idx = 0;
  const next = () => (idx = (idx + 1) % steps.length);
  const bar = [25, 60, 85];
</script>

<div class="saem">
  <div class="wheel">
    {#each steps as s, i}
      <div class:active={i === idx}>{s}</div>
    {/each}
  </div>
  <div class="llh">
    <div class="label">{$language === 'en' ? 'Log-likelihood' : 'Log-vraisemblance'}</div>
    <div class="bar">
      <div class="fill" style={`width:${bar[idx]}%`}></div>
    </div>
  </div>
  <button on:click={next}>{$language === 'en' ? 'Next' : 'Suivant'}</button>
  <p class="note">{$language === 'en' ? 'Conceptual iteration: simulate latent effects, update sufficient statistics by stochastic approximation, then maximize. Exploration and smoothing are step-size phases across iterations, not two extra operations in every cycle.' : "Itération conceptuelle : simuler les effets latents, actualiser les statistiques suffisantes par approximation stochastique, puis maximiser. Exploration et lissage sont des phases du pas au fil des itérations, pas deux opérations supplémentaires dans chaque cycle."}</p>
</div>

<style>
  .saem {
    display: grid;
    gap: 12px;
    justify-items: start;
  }
  .wheel {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .wheel div {
    padding: 6px 10px;
    border: 1px solid var(--border-subtle);
    border-radius: 10px;
    background: var(--bg-tertiary);
  }
  .wheel .active {
    background: #2563eb;
    color: white;
    border-color: #2563eb;
  }
  .llh .bar {
    width: 220px;
    height: 10px;
    background: var(--bg-secondary);
    border-radius: 6px;
    overflow: hidden;
  }
  .fill {
    height: 100%;
    background: linear-gradient(90deg, #22c55e, #2563eb);
  }
  button {
    border: 1px solid #2563eb;
    background: #2563eb;
    color: white;
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
  }
  .note { margin: 0; max-width: 620px; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
</style>
