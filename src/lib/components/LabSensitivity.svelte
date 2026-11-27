<script>
  import { sensitivityAnalysis } from '#lib/labs/sensitivity.js';

  export let en = false;
  export let lab = 'distribution';
  export let parameters;

  let metric = 'auc';
  let fraction = 0.2;
  $: rows = parameters ? sensitivityAnalysis(lab, parameters, metric, fraction) : [];
  $: unit = metric === 'auc' ? 'mg·h/L' : 'mg/L';

  const format = value => Number.isFinite(value) ? value.toLocaleString(en ? 'en-GB' : 'fr-FR', { maximumFractionDigits: 3 }) : '—';
  const percent = value => value === null || !Number.isFinite(value) ? '—' : (value >= 0 ? '+' : '') + value.toFixed(1) + ' %';
  const label = name => ({
    dose: 'Dose (mg)', cl: 'CL (L/h)', vc: 'V (L)', q: 'Q (L/h)', vp: 'Vp (L)',
    tau: en ? 'Interval (h)' : 'Intervalle (h)', loading: en ? 'Loading factor' : 'Facteur de charge',
    ka: 'ka (1/h)', f: 'F', duration: en ? 'Infusion duration (h)' : 'Durée de perfusion (h)'
  })[name] ?? name;
</script>

<details class="sensitivity" data-testid="lab-sensitivity">
  <summary>{en ? 'What influences exposure? · sensitivity' : "Qu'est-ce qui influence l'exposition ? · sensibilité"}</summary>
  <div class="settings">
    <label>{en ? 'Metric' : 'Métrique'}
      <select bind:value={metric} aria-label={en ? 'Sensitivity metric' : 'Métrique de sensibilité'}>
        <option value="auc">AUC(0–{parameters.end} h)</option>
        <option value="cmax">Cmax (0–{parameters.end} h)</option>
        <option value="cend">{en ? 'C at horizon, pre-dose' : 'C à l’horizon, pré-dose'}</option>
      </select>
    </label>
    <label>{en ? 'Parameter variation' : 'Variation des paramètres'}
      <select bind:value={fraction} aria-label={en ? 'Sensitivity variation' : 'Variation de sensibilité'}>
        <option value={0.1}>±10 %</option>
        <option value={0.2}>±20 %</option>
        <option value={0.5}>±50 %</option>
      </select>
    </label>
  </div>
  <p class="intro">
    {en ? 'Local one-at-a-time changes. All other parameters and the time horizon stay fixed. The bounds may clip the requested variation; this is not a population uncertainty interval.' :
      'Modifications locales, un paramètre à la fois. Les autres paramètres et l’horizon sont fixes. Les bornes peuvent limiter la variation ; ceci n’est pas un intervalle d’incertitude populationnelle.'}
  </p>
  <div class="scroll">
    <table>
      <caption>{en ? 'Ranked effect on the selected metric' : 'Effet classé sur la métrique sélectionnée'} ({unit})</caption>
      <thead><tr>
        <th scope="col">{en ? 'Parameter' : 'Paramètre'}</th>
        <th scope="col">{en ? 'Reference' : 'Référence'}</th>
        <th scope="col">{en ? 'Lower input → metric (change)' : 'Borne basse → métrique (écart)'}</th>
        <th scope="col">{en ? 'Upper input → metric (change)' : 'Borne haute → métrique (écart)'}</th>
      </tr></thead>
      <tbody>
        {#each rows as row (row.parameter)}
          <tr>
            <th scope="row">{label(row.parameter)}</th>
            <td>{format(row.reference)}</td>
            <td><span>{format(row.lowerValue)} → {format(row.lower)}</span> <b>{percent(row.lowChange)}</b></td>
            <td><span>{format(row.upperValue)} → {format(row.upper)}</span> <b>{percent(row.highChange)}</b></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  {#if !rows.length}
    <p>{en ? 'No eligible continuous input can be varied.' : 'Aucun paramètre continu éligible ne peut varier.'}</p>
  {/if}
  <p class="note">{en ? 'Model-based, synthetic and deterministic. OAT rankings depend on the reference parameters, perturbation range, sampling horizon and selected metric. A zero reference makes a relative difference undefined (—).' :
    'Calcul déterministe sur un modèle synthétique. Le classement dépend des paramètres initiaux, de la plage de variation, de l’horizon et de la métrique. Une référence nulle rend l’écart relatif indéfini (—).'}</p>
</details>

<style>
  .sensitivity { border: 1px solid var(--border-strong); border-radius: 8px; margin: 18px 0; padding: 12px 16px; font-size: 12px; }
  summary { cursor: pointer; font-size: 13px; font-weight: 650; }
  .settings { display: flex; flex-wrap: wrap; gap: 14px; padding-top: 16px; }
  label { display: grid; gap: 4px; font-size: 12px; color: var(--text-secondary); }
  select { min-height: 34px; font: inherit; border: 1px solid var(--border-strong); border-radius: 5px; padding: 5px; background: var(--bg-surface, transparent); color: var(--text-primary); }
  select:focus-visible, summary:focus-visible { outline: 3px solid var(--accent-pk); outline-offset: 2px; }
  .intro, .note { color: var(--text-secondary); line-height: 1.5; margin: 12px 0; }
  .scroll { overflow-x: auto; }
  table { width: 100%; min-width: 520px; border-collapse: collapse; font-size: 12px; }
  caption { text-align: left; padding: 8px 0; font-weight: 650; }
  th, td { text-align: left; border-bottom: 1px solid var(--border-subtle); padding: 9px 7px; }
  td b { display: block; color: var(--accent-pk); font-variant-numeric: tabular-nums; }
  td span { font-variant-numeric: tabular-nums; white-space: nowrap; }
  th[scope="row"] { font-weight: 600; white-space: nowrap; }
</style>