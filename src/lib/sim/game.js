/** @typedef {{route?: string, dose?: number, f?: number, ka?: number, cl?: number, vc?: number, q1?: number, vp1?: number, q2?: number, vp2?: number, compartments?: number, horizon?: number}} GameConfig */
import { rk4 } from './ode.js';

// Amount-based mammillary PK model. Units: mg, L, h, mg/L.
// Peripheral exchanges use Q * (Acentral/Vc - Aperipheral/Vp).
/** @param {GameConfig} config */
export function simulateGame(config) {
  const { route = 'oral', dose = 100, f = 1, ka = 1.2, cl = 5, vc = 20,
    q1 = 3, vp1 = 30, q2 = 1.5, vp2 = 60, compartments = 2, horizon = 24 } = config;
  if (![dose, f, ka, cl, vc, q1, vp1, q2, vp2, horizon].every(Number.isFinite) ||
      dose <= 0 || f < 0 || f > 1 || ka <= 0 || cl < 0 || vc <= 0 ||
      q1 < 0 || vp1 <= 0 || q2 < 0 || vp2 <= 0 || horizon <= 0 ||
      ![1, 2, 3].includes(compartments) || !['oral', 'iv'].includes(route)) {
    throw new Error('Invalid PK parameters');
  }
  const init = [route === 'oral' ? dose * f : 0, route === 'iv' ? dose : 0, 0, 0, 0];
  /** @type {(t:number, y:number[]) => number[]} */
  const derivatives = (_t, y) => {
    const [depot, central, p1, p2] = y;
    const c = central / vc;
    const exchange1 = compartments >= 2 ? q1 * (c - p1 / vp1) : 0;
    const exchange2 = compartments >= 3 ? q2 * (c - p2 / vp2) : 0;
    const absorbed = ka * depot;
    const eliminated = cl * c;
    return [-absorbed, absorbed - eliminated - exchange1 - exchange2,
      exchange1, exchange2, eliminated];
  };
  const step = Math.min(0.05, horizon / 480);
  const solution = rk4(derivatives, init, 0, horizon, step, null);
  return solution.t.map((time, index) => {
    const [depot, central, p1, p2, eliminated] = solution.y[index];
    return { time, depot, central, p1, p2, eliminated, concentration: central / vc };
  });
}
