<script>
  // Modèle hydraulique animé (analogie du deck, slide « ODE / concept de flux ») :
  //   largeur du réservoir = Volume V   |   niveau du liquide = concentration C(t)
  //   ouverture du robinet = Clairance CL   |   drainage exponentiel : C(t)=Dose/V·e^(-CL/V·t)
  import { onDestroy } from 'svelte';
  import { concMono } from '$lib/utils/math';
  import { reducedMotion } from '$lib/motion/reducedMotion';
  import Slider from '$lib/components/ui/Slider.svelte';

  let dose = 100; // mg
  let volume = 25; // L
  let cl = 6; // L/h
  let time = 0; // h
  let playing = false;
  /** @type {number | null} */
  let frame = null;

  const duration = 24;
  const Cref = 12; // mg/L → réservoir « plein » à l'écran

  $: k = cl / volume; // 1/h
  $: c0 = dose / volume; // mg/L
  $: level = concMono(time, dose, cl, volume); // mg/L
  $: thalf = (Math.log(2) * volume) / cl;

  // Géométrie du réservoir (SVG)
  const H = 210; // hauteur zone réservoir
  $: tankW = 70 + ((volume - 10) / 70) * 150; // V∈[10,80] → largeur∈[70,220]
  $: tankX = 30 + (220 - tankW) / 2; // centré dans la zone gauche
  const tankTop = 20;
  $: fill = Math.max(0, Math.min(1, level / Cref)); // fraction remplie
  $: liqH = fill * (H - 10);
  $: liqY = tankTop + (H - 10) - liqH;
  $: tapW = 4 + (cl / 20) * 16; // ouverture ∝ CL

  // Courbe C(t)
  const CW = 200, CH = 150, pad = 28;
  const N = 120;
  $: curve = Array.from({ length: N + 1 }, (_, i) => {
    const t = (i * duration) / N;
    return { t, c: concMono(t, dose, cl, volume) };
  });
  $: cMax = c0 * 1.05 || 1;
  $: cx = (/** @type {number} */ t) => pad + (t / duration) * (CW - pad - 6);
  $: cy = (/** @type {number} */ c) => (CH - pad) - (Math.min(c, cMax) / cMax) * (CH - pad - 6);
  $: path = curve.map((p, i) => `${i ? 'L' : 'M'}${cx(p.t).toFixed(1)},${cy(p.c).toFixed(1)}`).join(' ');

  function play() {
    if (time >= duration) time = 0;
    playing = true;
    const start = performance.now() - time * 1000;
    /** @param {number} now */
    const loop = (now) => {
      if (!playing) return;
      const t = Math.min(duration, (now - start) / 1000);
      time = t;
      if (t >= duration) playing = false;
      else frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
  }
  function pause() {
    playing = false;
    if (frame !== null) cancelAnimationFrame(frame);
  }
  function reset() {
    pause();
    time = 0;
  }
  onDestroy(pause);
</script>

<div class="hydro">
  <div class="stage">
    <svg viewBox="0 0 280 250" class="tank-svg" role="img" aria-label="Modèle hydraulique : réservoir et robinet">
      <!-- paroi du réservoir -->
      <rect x={tankX} y={tankTop} width={tankW} height={H - 10} rx="8" class="tank" />
      <!-- liquide -->
      <rect x={tankX + 2} y={liqY} width={tankW - 4} height={liqH} rx="4" class="liquid" />
      <!-- surface -->
      {#if liqH > 2}
        <rect x={tankX + 2} y={liqY} width={tankW - 4} height="3" class="surface" />
      {/if}
      <!-- robinet + écoulement -->
      <rect x={tankX + tankW} y={tankTop + H - 26} width="14" height={tapW} class="tap" />
      {#if playing && !$reducedMotion && level > 0.05}
        <g class="stream">
          <rect x={tankX + tankW + 12} y={tankTop + H - 24} width={tapW} height="30" class="flow" />
        </g>
      {/if}
      <!-- légendes -->
      <text x={tankX + tankW / 2} y={tankTop + H + 14} class="lbl">largeur = V ({volume} L)</text>
      <text x={tankX + tankW + 20} y={tankTop + H - 30} class="lbl small">robinet = CL</text>
      <text x={tankX + tankW / 2} y={tankTop - 6} class="lbl">niveau = C(t)</text>
    </svg>

    <svg viewBox={`0 0 ${CW} ${CH}`} class="curve-svg" role="img" aria-label="Courbe concentration-temps">
      <line x1={pad} y1={CH - pad} x2={CW - 4} y2={CH - pad} class="axis" />
      <line x1={pad} y1={4} x2={pad} y2={CH - pad} class="axis" />
      <path d={path} class="cline" />
      <circle cx={cx(time)} cy={cy(level)} r="4" class="dot" />
      <line x1={cx(time)} y1={cy(level)} x2={cx(time)} y2={CH - pad} class="guide" />
      <text x={CW / 2} y={CH - 6} class="lbl small">Temps (h)</text>
      <text transform={`translate(10,${CH / 2}) rotate(-90)`} class="lbl small">C (mg/L)</text>
    </svg>
  </div>

  <div class="controls">
    <Slider label="Dose (mg)" min={25} max={400} step={5} bind:value={dose} />
    <Slider label="Volume V (L) — largeur" min={10} max={80} step={1} bind:value={volume} />
    <Slider label="Clairance CL (L/h) — robinet" min={1} max={20} step={0.5} bind:value={cl} />
    <Slider label="Temps (h)" min={0} max={duration} step={0.1} bind:value={time} />
    <div class="actions">
      <button on:click={play} disabled={playing}>▶ Lecture</button>
      <button on:click={pause} disabled={!playing}>❚❚ Pause</button>
      <button on:click={reset}>↺ Réinit.</button>
    </div>
    <div class="readout">
      <div><span>C₀ = Dose/V</span><strong>{c0.toFixed(2)}</strong> mg/L</div>
      <div><span>C(t)</span><strong>{level.toFixed(2)}</strong> mg/L</div>
      <div><span>k = CL/V</span><strong>{k.toFixed(3)}</strong> 1/h</div>
      <div><span>t½ = ln2·V/CL</span><strong>{thalf.toFixed(2)}</strong> h</div>
    </div>
  </div>
</div>

<style>
  .hydro { display: grid; gap: var(--space-4); }
  @media (min-width: 720px) { .hydro { grid-template-columns: 1fr 240px; align-items: center; } }
  .stage { display: grid; grid-template-columns: 1fr; gap: var(--space-2); }
  @media (min-width: 520px) { .stage { grid-template-columns: 1.2fr 1fr; align-items: center; } }
  .tank-svg, .curve-svg { width: 100%; height: auto; }
  .tank { fill: var(--bg-primary); stroke: var(--border-strong); stroke-width: 2; }
  .liquid { fill: var(--accent-pk); opacity: 0.85; transition: y 0.15s linear, height 0.15s linear, width 0.2s ease, x 0.2s ease; }
  .surface { fill: #fff; opacity: 0.6; }
  .tap { fill: var(--border-strong); }
  .flow { fill: var(--accent-pk); opacity: 0.55; }
  .stream { animation: drip 0.6s linear infinite; }
  @keyframes drip { from { opacity: 0.2; } 50% { opacity: 0.7; } to { opacity: 0.2; } }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .cline { fill: none; stroke: var(--accent-pk); stroke-width: 2.5; stroke-linecap: round; }
  .dot { fill: var(--accent-pd); }
  .guide { stroke: var(--accent-pd); stroke-width: 1; stroke-dasharray: 2 3; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; text-anchor: middle; }
  .lbl.small { font-size: 9px; fill: var(--text-muted); }
  .controls { display: grid; gap: var(--space-2); }
  .actions { display: flex; gap: var(--space-2); flex-wrap: wrap; }
  .actions button { font-family: var(--font-mono); font-size: var(--text-xs); padding: 4px 8px; border: 1px solid var(--border-strong); background: var(--bg-tertiary); border-radius: var(--radius); cursor: pointer; }
  .actions button:disabled { opacity: 0.45; cursor: default; }
  .readout { display: grid; gap: 2px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-family: var(--font-mono); font-size: var(--text-xs); }
  .readout div { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
</style>
