<script>
  import { concMono } from '$lib/utils/math';
  import Slider from '$lib/components/ui/Slider.svelte';

  let dose = 100;
  let volume = 25;
  let cl = 6;
  let time = 0;
  let playing = false;
  /** @type {number | null} */
  let frame = null;

  $: ke = cl / volume;
  $: level = concMono(time, dose, cl, volume);
  const duration = 24;

  function play() {
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
</script>

<div class="bucket">
  <div class="tank" style={`--width:${volume}px;`}>
    <div class="liquid" style={`height:${Math.min(level * 6, 180)}px;`}></div>
    <div
      class="outflow"
      title="Outflow speed grows with clearance (CL)"
      style={`width:${cl * 4}px;`}
    ></div>
    <div class="patient" style={`transform: scale(${Math.min(volume / 20, 1.6)})`}>
      <span>Patient</span>
    </div>
  </div>
  <div class="controls">
    <Slider label="Dose (mg)" min={25} max={400} step={5} bind:value={dose} />
    <Slider label="Volume (L)" min={10} max={80} step={1} bind:value={volume} />
    <Slider label="Clearance (L/h)" min={1} max={20} step={0.5} bind:value={cl} />
    <Slider label="Time (h)" min={0} max={duration} step={0.1} bind:value={time} />
    <div class="actions">
      <button on:click={play} disabled={playing}>Play</button>
      <button on:click={pause}>Pause</button>
      <button on:click={() => (time = 0)}>Reset</button>
    </div>
    <div class="kpis">
      <span>C(t) = {level.toFixed(2)} mg/L</span>
      <span>t½ ≈ {(Math.log(2) * volume / cl).toFixed(2)} h</span>
    </div>
  </div>
</div>

<style>
  .bucket {
    display: grid;
    grid-template-columns: 1fr 260px;
    gap: 16px;
    height: 100%;
    align-items: center;
  }
  .tank {
    position: relative;
    height: 260px;
    border: 2px solid #0f172a;
    border-radius: 16px;
    overflow: hidden;
    background: linear-gradient(180deg, #e2e8f0, #f8fafc);
  }
  .liquid {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(180deg, #38bdf8, #0ea5e9);
    transition: height 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .outflow {
    position: absolute;
    bottom: 18px;
    right: -30px;
    height: 18px;
    background: #0ea5e9;
    border-radius: 9px;
    box-shadow: 0 0 12px rgba(14, 165, 233, 0.5);
    transition: width 0.2s ease;
  }
  .patient {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 70px;
    height: 120px;
    border: 2px dashed #cbd5e1;
    border-radius: 35px 35px 20px 20px;
    display: grid;
    place-items: center;
    color: #475569;
    font-weight: 700;
    transform-origin: bottom;
    transition: transform 0.2s ease;
  }
  .controls {
    display: grid;
    gap: 10px;
  }
  .actions {
    display: flex;
    gap: 8px;
  }
  .kpis {
    display: flex;
    gap: 12px;
    font-weight: 700;
    color: #0f172a;
  }
</style>
