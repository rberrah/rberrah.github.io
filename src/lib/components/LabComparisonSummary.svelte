<script>
  export let en = false;
  export let time = 0;
  export let timeUnit = 'h';
  /** @type {{ label: string, reference: number, current: number, unit?: string }[]} */
  export let changes = [];
  /** @type {{ label: string, reference: number, current: number, unit?: string }[]} */
  export let outcomes = [];
  export let intrinsic = false;

  /** @param {number} value */
  const number = value => Number.isFinite(value) ? Number(value).toLocaleString(en ? 'en-GB' : 'fr-FR', { maximumFractionDigits: 3 }) : '--';
  /** @param {number} current @param {number} reference */
  const delta = (current, reference) => {
    if (!Number.isFinite(current) || !Number.isFinite(reference)) return '--';
    if (Math.abs(reference) < 1e-12) return `${current - reference >= 0 ? '+' : ''}${number(current - reference)}`;
    const value = 100 * (current - reference) / Math.abs(reference);
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };
</script>

<section class="comparison" data-testid="lab-comparison-summary" aria-label={en ? 'A/B comparison' : 'Comparaison A/B'}>
  <div class="heading">
    <strong>{en ? 'A/B comparison' : 'Comparaison A/B'}</strong>
    <span>t = {number(time)} {timeUnit}</span>
  </div>
  {#if !intrinsic}
    <div class="row">
      <span>{en ? 'Changed parameter' : 'Paramètre modifié'}</span>
      <div>
        {#if changes.length}
          {#each changes as item}
            <b>{item.label}</b> {number(item.reference)} → {number(item.current)} {item.unit ?? ''} <em>({delta(item.current, item.reference)})</em>
          {/each}
        {:else}
          <b>{en ? 'The current model matches the reference.' : 'Le modèle actuel est identique à la référence.'}</b>
        {/if}
      </div>
    </div>
  {:else}
    <div class="row"><span>{en ? 'Comparison' : 'Comparaison'}</span><div><b>{en ? 'Model counterfactual without treatment → with treatment' : 'Contrefactuel du modèle sans traitement → avec traitement'}</b></div></div>
  {/if}
  <div class="row">
    <span>{en ? 'Observed consequence' : 'Conséquence observée'}</span>
    <div>
      {#each outcomes as item}
        <b>{item.label}</b> {number(item.reference)} → {number(item.current)} {item.unit ?? ''} <em>({delta(item.current, item.reference)})</em>
      {/each}
    </div>
  </div>
  <p>{en ? 'Difference at the selected time under this teaching model. If several parameters changed, this comparison does not isolate a causal effect.' : "Écart au temps choisi dans ce modèle pédagogique. Si plusieurs paramètres ont changé, cette comparaison n'isole pas un effet causal."}</p>
</section>

<style>
  .comparison { margin-top:14px; border-top:1px solid var(--border-strong); border-bottom:1px solid var(--border-strong); }
  .heading, .row { display:grid; grid-template-columns:minmax(130px,.35fr) minmax(0,1fr); gap:14px; padding:10px 0; }
  .heading { align-items:baseline; font-size:12px; }
  .heading span { color:var(--text-secondary); font-family:var(--font-mono); }
  .row { border-top:1px solid var(--border-subtle); font-size:11px; }
  .row > span { color:var(--text-secondary); }
  .row div { display:flex; flex-wrap:wrap; gap:4px 7px; min-width:0; }
  .row b { font-weight:650; }
  .row em { color:var(--accent-pk); font-family:var(--font-mono); font-style:normal; }
  p { margin:8px 0 10px; color:var(--text-muted); font-size:10px; line-height:1.45; }
  @media(max-width:560px) { .heading, .row { grid-template-columns:1fr; gap:4px; } }
</style>
