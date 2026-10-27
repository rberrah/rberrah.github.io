<script>
  import { language } from '#lib/stores/language.js';
  import { tokenAttentionWeights } from '#lib/science/tokenAttentionLab.js';

  $: tokens = $language === 'en'
    ? ['Dose', 'adjustment', 'depends', 'on', 'renal', 'function']
    : ['Dose', 'ajustée', 'selon', 'la', 'fonction', 'rénale'];
  let target = 5;
  /** @type {'local'|'relation'} */
  let head = 'relation';
  $: weights = tokenAttentionWeights(target, head);
  $: strongest = weights.reduce((best, value, index) => value > weights[best] ? index : best, 0);
</script>

<div class="lab" data-testid="token-attention-lab">
  <div class="controls">
    <p>{$language === 'en' ? 'Choose the token that issues the query.' : 'Choisissez le token qui émet la requête.'}</p>
    <div class="tokens" role="group" aria-label={$language === 'en' ? 'Query token' : 'Token requête'}>
      {#each tokens as token, index}
        <button type="button" class:on={target === index} aria-pressed={target === index} on:click={() => (target = index)}>{token}</button>
      {/each}
    </div>
    <label>
      <span>{$language === 'en' ? 'Illustrative head' : 'Tête illustrative'}</span>
      <select bind:value={head}>
        <option value="relation">{$language === 'en' ? 'Simulated relation' : 'Relation simulée'}</option>
        <option value="local">{$language === 'en' ? 'Local context' : 'Contexte local'}</option>
      </select>
    </label>
  </div>

  <div class="bars" aria-live="polite">
    {#each tokens as token, index}
      <div class:masked={index > target} class:strongest={index === strongest} class="row">
        <span>{token}</span>
        <div class="track"><i style={`width:${100 * weights[index]}%`}></i></div>
        <strong>{(100 * weights[index]).toFixed(0)}%</strong>
      </div>
    {/each}
  </div>

  <p class="explanation">
    {#if $language === 'en'}
      The bars are constructed, not extracted from an LLM. They show normalized weights for one head and a causal mask: future tokens receive 0%. Attention weights describe information routing in this example; they are not a causal explanation of a model output.
    {:else}
      Les barres sont construites, pas extraites d’un LLM. Elles montrent des poids normalisés pour une tête et un masque causal : les tokens futurs reçoivent 0 %. Les poids d’attention décrivent ici un routage d’information, pas une explication causale de la sortie d’un modèle.
    {/if}
  </p>
</div>

<style>
  .lab { display: grid; gap: var(--space-4); font-size: var(--text-sm); }
  .controls { display: grid; gap: var(--space-2); }
  .controls p, .explanation { margin: 0; }
  .tokens { display: flex; flex-wrap: wrap; gap: 5px; }
  button, select { font: inherit; color: var(--text-primary); background: var(--bg-secondary); border: 1px solid var(--border-strong); border-radius: var(--radius); }
  button { padding: 7px 9px; cursor: pointer; }
  button.on { background: var(--accent-ai); border-color: var(--accent-ai); color: var(--bg-primary); font-weight: 700; }
  button:focus-visible, select:focus-visible { outline: 2px solid var(--accent-ai); outline-offset: 2px; }
  label { display: grid; grid-template-columns: 1fr minmax(140px, auto); align-items: center; gap: 8px; color: var(--text-secondary); }
  select { padding: 7px; }
  .bars { display: grid; gap: 7px; }
  .row { display: grid; grid-template-columns: minmax(72px, 1fr) minmax(120px, 3fr) 42px; gap: 8px; align-items: center; }
  .row > span { overflow-wrap: anywhere; }
  .row strong { text-align: right; font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
  .track { height: 14px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); overflow: hidden; }
  .track i { display: block; height: 100%; background: var(--accent-ai); transition: width .2s ease; }
  .strongest > span { color: var(--accent-ai); font-weight: 700; }
  .masked { opacity: .45; }
  .explanation { color: var(--text-secondary); font-size: var(--text-xs); line-height: 1.55; }
  @media (prefers-reduced-motion: reduce) { .track i { transition: none; } }
  @media (max-width: 420px) { label { grid-template-columns: 1fr; } .row { grid-template-columns: 70px 1fr 38px; } }
</style>
