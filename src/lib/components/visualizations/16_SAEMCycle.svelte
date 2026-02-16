<script>
  const steps = ['S (Simulation)', 'A1 (Exploration)', 'A2 (Lissage)', 'M (Maximisation)'];
  let idx = 0;
  const next = () => (idx = (idx + 1) % steps.length);
  const bar = [20, 40, 70, 90];
</script>

<div class="saem">
  <div class="wheel">
    {#each steps as s, i}
      <div class:active={i === idx}>{s}</div>
    {/each}
  </div>
  <div class="llh">
    <div class="label">Log-likelihood</div>
    <div class="bar">
      <div class="fill" style={`width:${bar[idx]}%`}></div>
    </div>
  </div>
  <button on:click={next}>Suivant</button>
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
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    background: #fff;
  }
  .wheel .active {
    background: #2563eb;
    color: white;
    border-color: #2563eb;
  }
  .llh .bar {
    width: 220px;
    height: 10px;
    background: #e2e8f0;
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
</style>
