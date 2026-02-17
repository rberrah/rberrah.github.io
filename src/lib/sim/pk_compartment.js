// @ts-nocheck
import { rk4 } from './ode';

/**
 * Simulation PK 1–3 compartiments, routes IV bolus / perfusion / oral 1er ordre, lag ou transit.
 */
export function simulatePK(opt) {
  const {
    dose,
    route,
    nCompartments,
    cl,
    vc,
    q1 = 0,
    vp1 = 0,
    q2 = 0,
    vp2 = 0,
    ka = 1,
    lag = 0,
    infusionDuration = 1,
    tEnd = 24,
    h = 0.05,
    times,
    absorptionDelay = { type: 'none', nTransit: 0, mtt: 1 }
  } = opt;

  const nTransit = absorptionDelay.type === 'transit' ? Math.max(0, Math.round(absorptionDelay.nTransit || 0)) : 0;
  const grid = times ?? Array.from({ length: Math.floor(tEnd / h) + 1 }, (_, i) => Number((i * h).toFixed(6)));

  // state: transit[0..nTransit-1], gut, central, periph1?, periph2?
  const state0 = [];
  if (route === 'oral_1st' && absorptionDelay.type === 'transit') {
    state0.push(dose); // first transit
    for (let i = 1; i < nTransit; i++) state0.push(0);
    state0.push(0); // gut
  } else if (route === 'oral_1st') {
    state0.push(dose); // gut only (no transit)
  }
  // central
  state0.push(route === 'iv_bolus' ? dose : 0);
  if (nCompartments >= 2) state0.push(0);
  if (nCompartments >= 3) state0.push(0);

  const { t, y } = rk4((tt, state) => deriv(tt, state, opt, nTransit, absorptionDelay), state0, 0, tEnd, h, {});

  const samples = [];
  let idx = 0;
  for (const target of grid) {
    while (idx < t.length - 1 && t[idx + 1] < target - 1e-9) idx++;
    const a = t[idx];
    const b = t[idx + 1] ?? t[idx];
    const frac = b === a ? 0 : (target - a) / (b - a);
    const yA = y[idx];
    const yB = y[idx + 1] ?? y[idx];
    const interp = yA.map((v, i) => v + frac * (yB[i] - v));

    const centralIndex = (route === 'oral_1st' ? (absorptionDelay.type === 'transit' ? nTransit + 1 : 1) : 0);
    const central = interp[centralIndex];
    const gutIndex = route === 'oral_1st' ? (absorptionDelay.type === 'transit' ? nTransit : 0) : 0;
    const agut = route === 'oral_1st' ? interp[gutIndex] : 0;
    samples.push({ t: target, c: central / vc, agut });
  }
  return samples;
}

function deriv(t, y, opt, nTransit, absorptionDelay) {
  const {
    route,
    nCompartments,
    cl,
    vc,
    q1 = 0,
    vp1 = 0,
    q2 = 0,
    vp2 = 0,
    ka = 1,
    lag = 0,
    infusionDuration = 1,
    dose
  } = opt;

  let idx = 0;
  let transit = [];
  if (route === 'oral_1st' && absorptionDelay.type === 'transit') {
    transit = y.slice(0, nTransit);
    idx = nTransit;
  }
  const gut = route === 'oral_1st' ? y[idx++] : 0;
  let a1 = y[idx++];
  let a2 = nCompartments >= 2 ? y[idx++] : 0;
  let a3 = nCompartments >= 3 ? y[idx++] : 0;

  const k10 = cl / vc;
  const k12 = nCompartments >= 2 ? q1 / vc : 0;
  const k21 = nCompartments >= 2 && vp1 ? q1 / vp1 : 0;
  const k13 = nCompartments >= 3 ? q2 / vc : 0;
  const k31 = nCompartments >= 3 && vp2 ? q2 / vp2 : 0;

  const inputInfusion = route === 'iv_infusion' && t <= infusionDuration ? dose / infusionDuration : 0;

  let transitDerivs = [];
  let inputGut = 0;
  if (route === 'oral_1st' && absorptionDelay.type === 'transit') {
    const n = Math.max(1, nTransit);
    const ktr = (n + 1) / Math.max(0.01, absorptionDelay.mtt || 1);
    for (let i = 0; i < nTransit; i++) {
      const prev = i === 0 ? 0 : transit[i - 1];
      const curr = transit[i];
      const d = ktr * (prev - curr);
      transitDerivs.push(d);
    }
    inputGut = ktr * (transit[nTransit - 1] || 0);
  } else if (route === 'oral_1st') {
    inputGut = 0;
  }

  const allowAbs =
    route !== 'oral_1st'
      ? false
      : absorptionDelay.type === 'lag'
      ? t >= lag
      : true;
  const abs = route === 'oral_1st' && allowAbs ? ka * gut : 0;

  const dagut = route === 'oral_1st' ? inputGut - abs : 0;
  const da1 =
    inputInfusion +
    abs +
    k21 * a2 +
    k31 * a3 -
    (k12 + k13 + k10) * a1;
  const da2 = nCompartments >= 2 ? k12 * a1 - k21 * a2 : undefined;
  const da3 = nCompartments >= 3 ? k13 * a1 - k31 * a3 : undefined;

  return [...transitDerivs, dagut, da1, ...(da2 === undefined ? [] : [da2]), ...(da3 === undefined ? [] : [da3])];
}
