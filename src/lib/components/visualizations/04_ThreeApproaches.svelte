<script>
  // NCA vs PopPK vs PBPK — trois cartes sélectionnables + mini-illustration fidèle
  // à chaque approche. Style aligné sur le deck (cartes propres, couleurs du thème).
  import { fade } from 'svelte/transition';
  import { reducedMotion } from '$lib/motion/reducedMotion';

  const approaches = [
    { id: 'nca', label: 'NCA', tag: 'Descriptif', accent: 'var(--accent-pk)',
      tagline: 'Analyse non compartimentale', blurb: "Laisse parler les données : AUC, Cmax, T½ par la règle des trapèzes. Robuste mais ne prédit pas." },
    { id: 'poppk', label: 'PopPK', tag: 'Prédictif', accent: 'var(--accent-pd)',
      tagline: 'PK de population', blurb: "Top-down : estime les paramètres typiques et la variabilité, permet la simulation. Le standard du cours." },
    { id: 'pbpk', label: 'PBPK', tag: 'Mécaniste', accent: 'var(--accent-ai)',
      tagline: 'Physiologiquement fondé', blurb: "Bottom-up : un compartiment par organe relié par les débits sanguins. Puissant mais gourmand en hypothèses." }
  ];
  let active = 'nca';
  $: current = approaches.find((a) => a.id === active) ?? approaches[0];

  // --- géométrie commune du graphe ---
  const W = 460, H = 220, m = { top: 16, right: 16, bottom: 34, left: 40 };
  const iW = W - m.left - m.right, iH = H - m.top - m.bottom;

  // --- NCA : vraie courbe orale échantillonnée + trapèzes ---
  const A = 100, ka = 1.1, ke = 0.28, tEnd = 16;
  const ncaC = (/** @type {number} */ t) => A * (Math.exp(-ke * t) - Math.exp(-ka * t));
  const ncaTimes = [0.5, 1, 2, 3.5, 6, 9, 13];
  const ncaMax = 42; // ~ pic de la courbe, pour l'échelle
  const nx = (/** @type {number} */ t) => (t / tEnd) * iW;
  const ny = (/** @type {number} */ c) => iH - (Math.min(c, ncaMax) / ncaMax) * iH;
  const ncaCurve = Array.from({ length: 121 }, (_, i) => {
    const t = (i / 120) * tEnd;
    return `${i ? 'L' : 'M'}${nx(t).toFixed(1)},${ny(ncaC(t)).toFixed(1)}`;
  }).join(' ');
  const ncaPts = ncaTimes.map((t) => ({ t, c: ncaC(t) }));

  // --- PopPK : spaghetti + médiane ---
  const C0 = 32;
  const etas = Array.from({ length: 11 }, (_, i) => -0.6 + (i * 1.2) / 10);
  const popCurve = (/** @type {number} */ k) =>
    Array.from({ length: 81 }, (_, i) => {
      const t = (i / 80) * tEnd;
      return `${i ? 'L' : 'M'}${nx(t).toFixed(1)},${ny(C0 * Math.exp(-k * t)).toFixed(1)}`;
    }).join(' ');

  // --- PBPK : schéma d'organes ---
  const organs = [
    { x: 250, y: 24, label: 'Poumon' },
    { x: 250, y: 150, label: 'Foie' },
    { x: 360, y: 60, label: 'Rein' },
    { x: 360, y: 120, label: 'Tissus' }
  ];
</script>

<div class="wrap">
  <div class="cards">
    {#each approaches as a}
      <button
        class:active={active === a.id}
        style={`--c:${a.accent}`}
        on:click={() => (active = a.id)}
      >
        <span class="tag">{a.tag}</span>
        <strong>{a.label}</strong>
        <span class="tagline">{a.tagline}</span>
      </button>
    {/each}
  </div>

  <div class="stage" style={`--c:${current.accent}`}>
    {#key active}
      <div in:fade={{ duration: $reducedMotion ? 0 : 200 }}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={current.label}>
          <g transform={`translate(${m.left},${m.top})`}>
            {#if active === 'nca'}
              {#each ncaPts.slice(1) as p, i}
                {@const p0 = ncaPts[i]}
                <polygon points={`${nx(p0.t)},${ny(0)} ${nx(p0.t)},${ny(p0.c)} ${nx(p.t)},${ny(p.c)} ${nx(p.t)},${ny(0)}`} class="area" />
              {/each}
              <path d={ncaCurve} class="line" />
              {#each ncaPts as p}<circle cx={nx(p.t)} cy={ny(p.c)} r="3.5" class="dot" />{/each}
              <text x={iW * 0.62} y={30} class="ann">AUC = Σ trapèzes</text>
            {:else if active === 'poppk'}
              {#each etas as e}
                <path d={popCurve(0.22 * Math.exp(e))} class="thin" />
              {/each}
              <path d={popCurve(0.22)} class="line" />
              <text x={iW * 0.5} y={20} class="ann">médiane + variabilité (spaghetti)</text>
            {:else}
              <!-- PBPK : sang central + organes -->
              <rect x="70" y="70" width="90" height="52" rx="8" class="node central" />
              <text x="115" y="100" class="nlabel">Sang</text>
              {#each organs as o}
                <line x1="160" y1="96" x2={o.x} y2={o.y + 16} class="flow" />
                <rect x={o.x} y={o.y} width="86" height="32" rx="6" class="node" />
                <text x={o.x + 43} y={o.y + 20} class="nlabel">{o.label}</text>
              {/each}
              <text x="70" y={iH + 6} class="ann">un compartiment par organe, relié par les débits</text>
            {/if}
            <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
            <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
          </g>
        </svg>
      </div>
    {/key}
  </div>

  <p class="blurb" style={`--c:${current.accent}`}>{current.blurb}</p>
</div>

<style>
  .wrap { display: grid; gap: var(--space-3); }
  .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-2); }
  .cards button {
    display: grid; gap: 2px; text-align: left; cursor: pointer;
    padding: var(--space-3); border-radius: var(--radius);
    border: 1px solid var(--border-subtle); background: var(--bg-tertiary);
    border-top: 3px solid var(--c); transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
  }
  .cards button.active { background: color-mix(in srgb, var(--c) 8%, var(--bg-primary)); box-shadow: 0 8px 22px color-mix(in srgb, var(--c) 22%, transparent); transform: translateY(-2px); }
  .cards .tag { font-family: var(--font-mono); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.06em; color: var(--c); }
  .cards strong { font-family: var(--font-heading); font-size: var(--text-lg); color: var(--text-primary); }
  .cards .tagline { font-size: var(--text-xs); color: var(--text-secondary); }
  .stage { background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius); padding: var(--space-2); }
  svg { width: 100%; height: auto; display: block; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .line { fill: none; stroke: var(--c); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
  .thin { fill: none; stroke: var(--c); stroke-width: 1.5; opacity: 0.28; }
  .area { fill: color-mix(in srgb, var(--c) 16%, transparent); stroke: var(--c); stroke-width: 1; }
  .dot { fill: var(--c); }
  .node { fill: var(--bg-tertiary); stroke: var(--c); stroke-width: 2; }
  .node.central { fill: color-mix(in srgb, var(--c) 12%, var(--bg-tertiary)); }
  .flow { stroke: var(--c); stroke-width: 2; opacity: 0.5; marker-end: url(#a); }
  .nlabel { fill: var(--text-primary); font-family: var(--font-mono); font-size: 11px; text-anchor: middle; }
  .ann { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; }
  .blurb { margin: 0; padding-left: var(--space-3); border-left: 3px solid var(--c); color: var(--text-secondary); font-size: var(--text-sm); line-height: 1.5; }
</style>
