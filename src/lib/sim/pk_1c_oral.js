import { rk4 } from './ode';

/**
 * 1C oral avec compartiment gut, absorption premier ordre, élimination linéaire.
 * dA_gut/dt = -Ka * A_gut
 * dA_c/dt   = Ka * A_gut - (CL/V) * A_c
 * C = A_c / V
 *
 * @param {{dose:number, ka:number, cl:number, v:number, tEnd?:number, h?:number, lag?:number}} p
 */
export function simulateOral1C(p) {
  const { dose, ka, cl, v, tEnd = 48, h = 0.1, lag = 0 } = p;
  const k10 = cl / v;
  const f = (/** @type {number} */ t, /** @type {number[]} */ y) => {
    const [Agut, Acent] = y;
    const kaEff = t < lag ? 0 : ka;
    const dAgut = -kaEff * Agut;
    const dAcent = kaEff * Agut - k10 * Acent;
    return [dAgut, dAcent];
  };
  const { t, y } = rk4(f, [dose, 0], 0, tEnd, h, {});
  const conc = y.map((arr) => arr[1] / v);
  return t.map((time, i) => ({ t: time, c: conc[i], agut: y[i][0], acent: y[i][1] }));
}
