<script>
  const candidates = [
    { id: 'poids', label: 'Poids', delta: -5.0 },
    { id: 'age', label: 'Âge', delta: -2.5 },
    { id: 'creat', label: 'Créatinine', delta: -7.2 },
    { id: 'sexe', label: 'Sexe', delta: -1.0 }
  ];

  let selected = new Set();

  /** @param {string} id */
  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    selected = next;
  };

  $: totalDelta = Array.from(selected).reduce((acc, id) => {
    const c = candidates.find((x) => x.id === id);
    return acc + (c ? c.delta : 0);
  }, 0);

  $: decision =
    totalDelta <= -6.63 ? 'p < 0.01 (retient au backward)'
    : totalDelta <= -3.84 ? 'p < 0.05 (retient au forward)'
    : 'non significatif';
</script>

<div class="ofv">
  <div class="chips">
    {#each candidates as c}
      <button class:selected={selected.has(c.id)} on:click={() => toggle(c.id)}>
        {c.label} ({c.delta})
      </button>
    {/each}
  </div>
  <div class="result">
    ΔOFV total : {totalDelta.toFixed(2)} — {decision}
  </div>
</div>

<style>
  .chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  button {
    border: 1px solid #cbd5e1;
    background: #fff;
    padding: 6px 10px;
    border-radius: 999px;
    cursor: pointer;
  }
  .selected {
    background: #2563eb;
    color: white;
    border-color: #2563eb;
  }
  .result {
    margin-top: 10px;
    font-weight: 700;
    color: #0f172a;
  }
</style>
