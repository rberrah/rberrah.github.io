<script>
  import { language } from '#lib/stores/language.js';

  let { transferred = [], omitted = [], units = '', approximation = '' } = $props();
  let english = $derived($language === 'en');
</script>

<details class="contract" data-testid="transfer-contract">
  <summary>{english ? 'Transfer details' : 'Détails du transfert'}</summary>
  <dl>
    <div><dt>{english ? 'Transferred' : 'Transféré'}</dt><dd>{transferred.join(' · ')}</dd></div>
    <div><dt>{english ? 'Not transferred' : 'Non transféré'}</dt><dd>{omitted.join(' · ')}</dd></div>
    <div><dt>{english ? 'Units' : 'Unités'}</dt><dd>{units}</dd></div>
    <div><dt>{english ? 'Approximation / limit' : 'Approximation / limite'}</dt><dd>{approximation}</dd></div>
  </dl>
</details>

<style>
  .contract { width: 100%; border-top: 1px solid var(--border-subtle); padding-top: 10px; color: var(--text-secondary); }
  summary { width: fit-content; cursor: pointer; font: 700 var(--text-xs) var(--font-mono); color: var(--text-primary); }
  dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 18px; margin: 12px 0 2px; }
  dl div { min-width: 0; }
  dt { margin-bottom: 3px; font: 700 10px var(--font-mono); text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted); }
  dd { margin: 0; font-size: var(--text-xs); line-height: 1.5; overflow-wrap: anywhere; }
  @media (max-width: 620px) { dl { grid-template-columns: 1fr; } }
</style>
