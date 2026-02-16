<script>
import Slider from '$lib/components/ui/Slider.svelte';
import { simulateOral1C } from '$lib/sim/pk_1c_oral';

let dose = 200;
let ka = 1.2;
let cl = 6;
let v = 40;
let lag = 0;
let order0 = false;
let transit = false;

const tEnd = 24;
const h = 0.1;

$: curve = order0 ? simulateZeroOrder() : simulateFirstOrder();

function simulateFirstOrder() {
  return simulateOral1C({ dose, ka, cl, v, lag, tEnd, h });
}

function simulateZeroOrder() {
  // simple perfusion zéro ordre : absorption constante sur 2h
  const rate = dose / 2;
  const points = [];
  let Acent = 0;
  for (let t = 0; t <= tEnd; t += h) {
    const k10 = cl / v;
    const inflow = t < 2 ? rate * h : 0;
    Acent += inflow - k10 * Acent * h;
    points.push({ t, c: Acent / v, agut: Math.max(0, dose - rate * t), acent: Acent });
  }
  return points;
}
</script>

<div class="ade">
  <div class="toggles">
    <label><input type="checkbox" bind:checked={order0} /> Ordre 0 (perfusion)</label>
    <label><input type="range" min="0" max="3" step="0.1" bind:value={lag} /> Lag {lag.toFixed(1)} h</label>
  </div>
  <div class="controls">
    <Slider label="Dose" min={50} max={600} step={10} bind:value={dose} />
    <Slider label="Ka (1/h)" min={0.2} max={3} step={0.1} bind:value={ka} />
    <Slider label="CL (L/h)" min={0.5} max={20} step={0.5} bind:value={cl} />
    <Slider label="V (L)" min={5} max={200} step={5} bind:value={v} />
  </div>
  <svg viewBox="0 0 360 200">
    <line x1="30" y1="170" x2="330" y2="170" stroke="#0f172a" />
    <line x1="30" y1="20" x2="30" y2="170" stroke="#0f172a" />
    <polyline
      fill="none"
      stroke="#2563eb"
      stroke-width="3"
      points={curve.map((p) => `${30 + p.t * 12},${170 - p.c * 8}`).join(' ')}
    ></polyline>
    <polyline
      fill="none"
      stroke="#22c55e"
      stroke-dasharray="4 4"
      stroke-width="2"
      points={curve.map((p) => `${30 + p.t * 12},${170 - (p.agut / dose) * 120}`).join(' ')}
    ></polyline>
  </svg>
</div>

<style>
  .ade {
    display: grid;
    gap: 10px;
  }
  .toggles {
    display: flex;
    gap: 12px;
    font-weight: 700;
    color: #0f172a;
  }
  svg {
    width: 100%;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
  }
</style>
