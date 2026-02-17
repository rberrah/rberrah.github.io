// @ts-nocheck
import { rk4 } from './ode';

/**
 * Simulation PK 1–3 compartiments, routes IV bolus / perfusion / oral 1er ordre + lag.
 * @param {object} opt
 * @param {number} opt.dose
 * @param {'iv_bolus'|'iv_infusion'|'oral_1st'} opt.route
 * @param {number} opt.nCompartments
 * @param {number} opt.cl
 * @param {number} opt.vc
 * @param {number} [opt.q1]
 * @param {number} [opt.vp1]
 * @param {number} [opt.q2]
 * @param {number} [opt.vp2]
 * @param {number} [opt.ka]
 * @param {number} [opt.lag]
 * @param {number} [opt.infusionDuration]
 * @param {number} [opt.tEnd]
 * @param {number} [opt.h]
 * @param {number[]} [opt.times]
 * @returns {{t:number, c:number, agut:number}[]}
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
    times
  } = opt;

  const grid = times ?? Array.from({ length: Math.floor(tEnd / h) + 1 }, (_, i) => Number((i * h).toFixed(6)));
  const state0 = buildInitialState({ route, dose, vc, nCompartments });

  const { t, y } = rk4((tt, state) => deriv(tt, state, opt), state0, 0, tEnd, h, {});

  // interpolate concentrations at requested times if times provided
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
    const central = interp[1];
    samples.push({ t: target, c: central / vc, agut: interp[0] });
  }
  return samples;
}

function buildInitialState({ route, dose, vc, nCompartments }) {
  const gut = route === 'oral_1st' ? dose : 0;
  const a1 = route === 'iv_bolus' ? dose : 0;
  const a2 = nCompartments >= 2 ? 0 : undefined;
  const a3 = nCompartments >= 3 ? 0 : undefined;
  return [gut, a1, ...(a2 === undefined ? [] : [a2]), ...(a3 === undefined ? [] : [a3])];
}

function deriv(t, y, opt) {
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

  let [agut, a1, a2 = 0, a3 = 0] = y;
  const k10 = cl / vc;
  const k12 = nCompartments >= 2 ? q1 / vc : 0;
  const k21 = nCompartments >= 2 && vp1 ? q1 / vp1 : 0;
  const k13 = nCompartments >= 3 ? q2 / vc : 0;
  const k31 = nCompartments >= 3 && vp2 ? q2 / vp2 : 0;

  const inputInfusion = route === 'iv_infusion' && t <= infusionDuration ? dose / infusionDuration : 0;
  const allowAbs = route === 'oral_1st' && t >= lag;
  const abs = allowAbs ? ka * agut : 0;

  const dagut = route === 'oral_1st' ? -abs : 0;
  const da1 =
    inputInfusion +
    abs +
    k21 * a2 +
    k31 * a3 -
    (k12 + k13 + k10) * a1;
  const da2 = nCompartments >= 2 ? k12 * a1 - k21 * a2 : undefined;
  const da3 = nCompartments >= 3 ? k13 * a1 - k31 * a3 : undefined;

  return [dagut, da1, ...(da2 === undefined ? [] : [da2]), ...(da3 === undefined ? [] : [da3])];
}
