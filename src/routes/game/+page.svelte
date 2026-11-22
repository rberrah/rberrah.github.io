<script>
  import { simulateGame } from '#lib/sim/game.js';
  import { language } from '#lib/stores/language.js';

  let compartments = $state(2);
  let route = $state('oral');
  let dose = $state(100);
  let f = $state(1);
  let ka = $state(1.2);
  let cl = $state(5);
  let vc = $state(20);
  let q1 = $state(3);
  let vp1 = $state(30);
  let q2 = $state(1.5);
  let vp2 = $state(60);
  let playTime = $state(2);
  let challenge = $state(false);
  let selected = $state('central');

  let isEnglish = $derived($language === 'en');
  let config = $derived({ compartments, route, dose, f, ka, cl, vc, q1, vp1, q2, vp2, horizon: 24 });
  let series = $derived(simulateGame(config));
  let current = $derived(series[Math.min(series.length - 1, Math.round(playTime / 24 * (series.length - 1)))]);
  let cmax = $derived(Math.max(...series.map((x) => x.concentration)));
  let auc = $derived(series.slice(1).reduce((sum, item, index) =>
    sum + (item.concentration + series[index].concentration) / 2 * (item.time - series[index].time), 0));
  let ymax = $derived(Math.max(0.1, cmax * 1.12));
  let points = $derived(series.filter((_, i) => i % 3 === 0).map((x) =>
    String(50 + x.time / 24 * 620) + ',' + String(224 - x.concentration / ymax * 180)).join(' '));
  let markerX = $derived(50 + playTime / 24 * 620);
  let markerY = $derived(224 - current.concentration / ymax * 180);
  let success = $derived(challenge && cmax >= 2 && cmax <= 4 && current.concentration >= 0.5);

  function reset() {
    compartments = 2; route = 'oral'; dose = 100; f = 1; ka = 1.2; cl = 5;
    vc = 20; q1 = 3; vp1 = 30; q2 = 1.5; vp2 = 60; playTime = 2; selected = 'central';
  }

  const fmt = (/** @type {number} */ x, decimals = 2) => Number(x).toFixed(decimals);
</script>

<svelte:head>
  <title>PMx Game — PMx Explain</title>
  <meta name="robots" content="noindex, nofollow, noarchive" />
  <meta name="description" content="Simulateur PK expérimental et pédagogique." />
</svelte:head>

<section class="game">
  <div class="heading">
    <div>
      <p class="eyebrow">PMx Explain / Experimental</p>
      <h1>PMx <span>Game</span></h1>
      <p>{isEnglish ? 'Build a compartment model and watch the drug move.' : 'Construisez un modèle compartimental et observez le devenir du médicament.'}</p>
    </div>
    <button class="secondary" onclick={reset}>{isEnglish ? 'Reset model' : 'Réinitialiser'}</button>
  </div>

  <div class="toolbar">
    <strong>{isEnglish ? 'Structure' : 'Structure'}</strong>
    {#each [1, 2, 3] as n}
      <button class:active={compartments === n} aria-pressed={compartments === n} onclick={() => { compartments = n; selected = 'central'; }}>{n}C</button>
    {/each}
    <span class="sep"></span>
    <strong>{isEnglish ? 'Administration' : 'Administration'}</strong>
    <button class:active={route === 'oral'} aria-pressed={route === 'oral'} onclick={() => route = 'oral'}>{isEnglish ? 'Oral' : 'Orale'}</button>
    <button class:active={route === 'iv'} aria-pressed={route === 'iv'} onclick={() => route = 'iv'}>IV bolus</button>
    <span class="sep"></span>
    <button class:active={challenge} aria-pressed={challenge} onclick={() => challenge = !challenge}>{isEnglish ? 'Challenge' : 'Défi'}: {challenge ? 'ON' : 'OFF'}</button>
  </div>

  {#if challenge}
    <div class="challenge" role="status">
      <strong>{isEnglish ? 'Challenge: tune the model' : 'Défi : ajustez votre modèle'}</strong>
      <span>{isEnglish ? 'Reach a Cmax of 2–4 mg/L and a concentration at the selected time ≥0.5 mg/L.' : 'Obtenez une Cmax de 2 à 4 mg/L et une concentration au temps sélectionné ≥ 0,5 mg/L.'}</span>
      <b>{success ? (isEnglish ? 'Objective reached' : 'Objectif atteint') : (isEnglish ? 'Keep trying' : 'À ajuster')}</b>
    </div>
  {/if}

  <div class="workspace">
    <section class="panel diagram">
      <div class="panel-title"><h2>{isEnglish ? 'Model editor' : 'Éditeur de modèle'}</h2><small>{isEnglish ? 'Select a compartment to edit its parameters' : 'Cliquez sur un compartiment pour modifier ses paramètres'}</small></div>
      <svg viewBox="0 0 710 340" role="img" aria-label={isEnglish ? 'Editable mammillary model with animated symbolic drug particles' : 'Modèle mammillaire éditable avec particules symboliques animées'}>
        <defs>
          <marker id="pk-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7" fill="none" stroke="#6f91a5" stroke-width="1.4" /></marker>
        </defs>
        {#if route === 'oral'}
          <path class="edge" d="M162 155 H275" marker-end="url(#pk-arrow)" />
          <circle class="particle" r="5"><animateMotion dur="2.8s" repeatCount="indefinite" path="M162 155 H275" /></circle>
          <g class="node" role="button" tabindex="0" onclick={() => selected = 'depot'} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') selected = 'depot'; }}>
            <rect x="20" y="111" width="140" height="88" rx="16" class:selected={selected === 'depot'} />
            <text x="90" y="139" text-anchor="middle">{isEnglish ? 'Gut / depot' : 'Tube digestif'}</text>
            <text x="90" y="165" text-anchor="middle" class="value">{fmt(current.depot, 1)} mg</text>
            <text x="90" y="184" text-anchor="middle" class="small">Ka {fmt(ka)} h⁻¹</text>
          </g>
        {:else}
          <text x="194" y="132" class="small">IV ↓</text>
          <path class="edge" d="M224 140 H275" marker-end="url(#pk-arrow)" />
        {/if}
        <g class="node" role="button" tabindex="0" onclick={() => selected = 'central'} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') selected = 'central'; }}>
          <rect x="279" y="107" width="161" height="96" rx="17" class:selected={selected === 'central'} />
          <text x="359" y="135" text-anchor="middle">{isEnglish ? 'Central' : 'Central'}</text>
          <text x="359" y="164" text-anchor="middle" class="value">{fmt(current.central, 1)} mg</text>
          <text x="359" y="185" text-anchor="middle" class="small">{fmt(current.concentration)} mg/L</text>
        </g>
        <path class="edge" d="M360 204 V283 H520" marker-end="url(#pk-arrow)" />
        <circle class="particle" r="4"><animateMotion dur="3.5s" repeatCount="indefinite" path="M360 204 V283 H520" /></circle>
        <text x="424" y="274" class="small">CL {fmt(cl)} L/h</text>
        <g class="node" role="button" tabindex="0" onclick={() => selected = 'elimination'} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') selected = 'elimination'; }}>
          <rect x="524" y="256" width="164" height="58" rx="14" class:selected={selected === 'elimination'} />
          <text x="606" y="279" text-anchor="middle">{isEnglish ? 'Eliminated' : 'Éliminé'}</text>
          <text x="606" y="300" text-anchor="middle" class="small">{fmt(current.eliminated, 1)} mg</text>
        </g>
        {#if compartments >= 2}
          <path class="edge" d="M440 135 H515" marker-end="url(#pk-arrow)" />
          <path class="edge" d="M515 182 H440" marker-end="url(#pk-arrow)" />
          <circle class="particle" r="4"><animateMotion dur="3s" repeatCount="indefinite" path="M440 135 H515" /></circle>
          <circle class="particle" r="4"><animateMotion dur="4s" repeatCount="indefinite" path="M515 182 H440" /></circle>
          <g class="node" role="button" tabindex="0" onclick={() => selected = 'p1'} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') selected = 'p1'; }}>
            <rect x="519" y="112" width="169" height="92" rx="16" class:selected={selected === 'p1'} />
            <text x="604" y="139" text-anchor="middle">{isEnglish ? 'Peripheral 1' : 'Périphérique 1'}</text>
            <text x="604" y="166" text-anchor="middle" class="value">{fmt(current.p1, 1)} mg</text>
            <text x="604" y="185" text-anchor="middle" class="small">Q₁ {fmt(q1)} L/h</text>
          </g>
        {/if}
        {#if compartments >= 3}
          <path class="edge" d="M326 108 V75 H218" marker-end="url(#pk-arrow)" />
          <path class="edge" d="M218 93 H299 V108" marker-end="url(#pk-arrow)" />
          <circle class="particle" r="4"><animateMotion dur="4s" repeatCount="indefinite" path="M326 108 V75 H218" /></circle>
          <g class="node" role="button" tabindex="0" onclick={() => selected = 'p2'} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') selected = 'p2'; }}>
            <rect x="30" y="13" width="185" height="89" rx="16" class:selected={selected === 'p2'} />
            <text x="122" y="42" text-anchor="middle">{isEnglish ? 'Peripheral 2' : 'Périphérique 2'}</text>
            <text x="122" y="69" text-anchor="middle" class="value">{fmt(current.p2, 1)} mg</text>
            <text x="122" y="88" text-anchor="middle" class="small">Q₂ {fmt(q2)} L/h</text>
          </g>
        {/if}
      </svg>
      <div class="time-control">
        <label for="pk-time">{isEnglish ? 'Simulation time' : 'Temps simulé'} : <strong>{fmt(playTime, 1)} h</strong></label>
        <input id="pk-time" type="range" min="0" max="24" step="0.1" bind:value={playTime} />
      </div>
      <p class="note">{isEnglish ? 'Dots illustrate flows, not individual molecules or their actual speed. Boxes are mathematical compartments, not organs.' : 'Les points illustrent les flux, pas des molécules individuelles ni leur vitesse réelle. Les compartiments sont mathématiques et non anatomiques.'}</p>
    </section>

    <section class="panel controls">
      <div class="panel-title"><h2>{isEnglish ? 'Parameters' : 'Paramètres'}</h2><small>{isEnglish ? 'Adjust sliders or edit numbers' : 'Modifiez les valeurs pour voir le résultat'}</small></div>
      <div class="fields">
        <label>{isEnglish ? 'Dose (mg)' : 'Dose (mg)'}<input type="number" min="1" max="1000" step="5" bind:value={dose} /></label>
        <label>{isEnglish ? 'Bioavailability F' : 'Biodisponibilité F'}<input type="number" min="0" max="1" step="0.05" bind:value={f} disabled={route === 'iv'} /></label>
        {#if route === 'oral'}<label>Ka (h⁻¹)<input type="number" min="0.05" max="10" step="0.1" bind:value={ka} /></label>{/if}
        <label>CL (L/h)<input type="number" min="0" max="50" step="0.5" bind:value={cl} /></label>
        <label>Vc (L)<input type="number" min="1" max="200" step="1" bind:value={vc} /></label>
        {#if compartments >= 2}
          <label>Q₁ (L/h)<input type="number" min="0" max="50" step="0.5" bind:value={q1} /></label>
          <label>Vp₁ (L)<input type="number" min="1" max="300" step="1" bind:value={vp1} /></label>
        {/if}
        {#if compartments >= 3}
          <label>Q₂ (L/h)<input type="number" min="0" max="50" step="0.5" bind:value={q2} /></label>
          <label>Vp₂ (L)<input type="number" min="1" max="300" step="1" bind:value={vp2} /></label>
        {/if}
      </div>
      <p class="selection">{isEnglish ? 'Selected' : 'Sélection'} : <strong>{selected}</strong></p>
      <p class="note">{isEnglish ? 'Parameter changes update the ODE solution. For education only; not for dose recommendations.' : 'Chaque modification recalcule les EDO. Usage pédagogique uniquement, sans recommandation posologique.'}</p>
    </section>
  </div>

  <section class="panel curve">
    <div class="panel-title"><h2>{isEnglish ? 'Central concentration over time' : 'Concentration centrale en fonction du temps'}</h2></div>
    <svg viewBox="0 0 710 265" role="img" aria-label={isEnglish ? 'Simulated concentration time curve' : 'Courbe simulée concentration temps'}>
      <line class="axis" x1="50" y1="224" x2="680" y2="224" />
      <line class="axis" x1="50" y1="28" x2="50" y2="224" />
      {#each [0, 6, 12, 18, 24] as t}
        <text class="tick" x={50 + t / 24 * 620} y="246" text-anchor="middle">{t}</text>
      {/each}
      <text class="tick" x="55" y="20">mg/L</text>
      <text class="tick" x="685" y="246">h</text>
      <text class="tick" x="43" y="45" text-anchor="end">{fmt(ymax, 1)}</text>
      <polyline class="pk-line" points={points} />
      <line class="cursor" x1={markerX} y1="32" x2={markerX} y2="224" />
      <circle cx={markerX} cy={markerY} r="6" fill="#0e8899" stroke="white" stroke-width="2"/>
    </svg>
    <div class="metrics">
      <div><small>Cmax</small><strong>{fmt(cmax)} mg/L</strong></div>
      <div><small>AUC₀–₂₄</small><strong>{fmt(auc)} mg·h/L</strong></div>
      <div><small>C({fmt(playTime, 1)} h)</small><strong>{fmt(current.concentration)} mg/L</strong></div>
    </div>
  </section>
</section>

<style>
  .game{max-width:1220px;margin:0 auto;padding:8px 0 56px;color:var(--text,#162a38)}
  .heading{display:flex;justify-content:space-between;align-items:center;gap:24px;margin-bottom:20px}
  .heading h1{font-size:clamp(2.2rem,5vw,3.4rem);margin:0 0 8px;letter-spacing:-.045em}
  .heading h1 span{color:#0e8899}.heading p{margin:0}.eyebrow{font-size:.7rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#0e8899;margin-bottom:6px!important}
  button{cursor:pointer;border:1px solid #aec4cd;background:transparent;color:inherit;border-radius:10px;padding:9px 14px;font:inherit;font-weight:650}
  button.active{background:#0d697b;color:white;border-color:#0d697b}.secondary{white-space:nowrap}
  .toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:9px;margin-bottom:18px}.toolbar strong{font-size:.85rem}
  .sep{height:24px;border-left:1px solid #bbcbd0;margin:0 8px}
  .workspace{display:grid;grid-template-columns:minmax(0,1.8fr) minmax(260px,1fr);gap:16px}
  .panel{min-width:0;border:1px solid #cad7db;border-radius:18px;padding:20px;background:var(--surface,#fff);margin-bottom:16px}
  .panel-title{margin-bottom:18px}.panel-title h2{font-size:1.15rem;margin:0 0 5px}.panel-title small,.note{font-size:.8rem;opacity:.73}
  .diagram svg,.curve svg{display:block;width:100%;height:auto}
  .node{cursor:pointer;outline:none}.node rect{fill:#e7f3f3;stroke:#8ab7ba;stroke-width:1.8}.node rect.selected{fill:#c6ebec;stroke:#0e8899;stroke-width:3}
  .node text{fill:#153c47;font-size:15px;font-weight:650;pointer-events:none}.node .value{font-size:19px;font-weight:800}.node .small,.small{font-size:12px;fill:#527682;font-weight:500}
  .edge{fill:none;stroke:#6f91a5;stroke-width:2.2}.particle{fill:#0e8899;opacity:.86}
  .fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
  .fields label{display:flex;flex-direction:column;gap:5px;font-size:.8rem;font-weight:650}
  .fields input{width:100%;min-width:0;box-sizing:border-box;border:1px solid #9aafb8;border-radius:8px;padding:9px;background:transparent;color:inherit;font:inherit}
  .fields input:disabled{opacity:.4}.selection{font-size:.8rem;margin:15px 0 0}
  .time-control{display:flex;flex-direction:column;gap:6px;margin-top:6px}.time-control input{width:100%;accent-color:#0e8899}
  .curve{margin-top:0}.axis{stroke:#8da6b0;stroke-width:1.2}.tick{font-size:12px;fill:#5c7781}.pk-line{fill:none;stroke:#0e8899;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
  .cursor{stroke:#b88c45;stroke-width:1.6;stroke-dasharray:4 5}.metrics{display:flex;gap:28px;flex-wrap:wrap;border-top:1px solid #d6e0e3;padding-top:12px}
  .metrics div{display:flex;flex-direction:column;gap:3px}.metrics small{opacity:.7}.metrics strong{font-size:1.12rem}
  .challenge{display:flex;flex-wrap:wrap;align-items:center;gap:12px;background:#e8f3f2;border:1px solid #91beba;padding:13px 18px;border-radius:12px;margin-bottom:16px;color:#194b50}
  .challenge span{flex:1;font-size:.85rem}.challenge b{font-size:.8rem}
  @media(max-width:820px){.workspace{grid-template-columns:1fr}.heading{align-items:start}.heading p{font-size:.9rem}.panel{padding:14px}.sep{display:none}}
  @media(prefers-reduced-motion:reduce){.particle{display:none}}
</style>
