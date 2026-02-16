<script>
  let mode = 'white'; // white, grey, black
</script>

<div class="box">
  <div class="toggles">
    <button class:active={mode === 'white'} on:click={() => (mode = 'white')}>White box</button>
    <button class:active={mode === 'grey'} on:click={() => (mode = 'grey')}>Grey box</button>
    <button class:active={mode === 'black'} on:click={() => (mode = 'black')}>Black box</button>
  </div>
  <svg viewBox="0 0 360 160">
    <rect x="30" y="50" width="80" height="60" rx="10" fill="#e0f2fe" stroke="#2563eb"></rect>
    <text x="70" y="85" font-size="11" text-anchor="middle" fill="#0f172a">ODE</text>

    {#if mode !== 'white'}
      <rect x="150" y="40" width="60" height="80" rx="12" fill="#fef3c7" stroke="#f59e0b"></rect>
      <text x="180" y="85" font-size="11" text-anchor="middle" fill="#92400e">NN</text>
    {/if}

    {#if mode === 'black'}
      <rect x="240" y="30" width="80" height="100" rx="14" fill="#e5e7eb" stroke="#0f172a"></rect>
      <text x="280" y="85" font-size="11" text-anchor="middle" fill="#0f172a">End-to-end</text>
    {/if}

    <line x1="110" y1="80" x2={mode === 'white' ? 320 : 150} y2="80" stroke="#0f172a" stroke-width="2"></line>

    {#if mode !== 'white'}
      <line x1="210" y1="80" x2={mode === 'grey' ? 320 : 240} y2="80" stroke="#0f172a" stroke-width="2" stroke-dasharray="4 4"></line>
    {/if}
  </svg>
  <p class="legend">
    {#if mode === 'white'}
      Équations seules, physiologie pure.
    {:else if mode === 'grey'}
      On garde l’ODE connue et un NN corrige le terme manquant (digital twin).
    {:else}
      Boîte noire ML complète.
    {/if}
  </p>
</div>

<style>
  .box {
    display: grid;
    gap: 10px;
  }
  .toggles {
    display: flex;
    gap: 8px;
  }
  button {
    border: 1px solid #cbd5e1;
    background: #fff;
    padding: 6px 10px;
    border-radius: 8px;
    cursor: pointer;
  }
  .active {
    background: #2563eb;
    color: #fff;
    border-color: #2563eb;
  }
  svg {
    width: 100%;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: #fff;
  }
  .legend {
    color: #475569;
  }
</style>
