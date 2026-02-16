// Petit solver RK4 générique pour systèmes ODE dy/dt = f(t, y, params)

/**
 * @param {(t:number, y:number[], params:any)=>number[]} f
 * @param {number[]} y0
 * @param {number} t0
 * @param {number} tEnd
 * @param {number} h
 * @param {any} params
 * @returns {{t:number[], y:number[][]}}
 */
export function rk4(f, y0, t0, tEnd, h, params) {
  const tArr = [];
  const yArr = [];
  let y = [...y0];
  for (let t = t0; t <= tEnd + 1e-9; t += h) {
    tArr.push(t);
    yArr.push([...y]);
    const k1 = f(t, y, params);
    const k2 = f(t + h / 2, y.map((v, i) => v + (h / 2) * k1[i]), params);
    const k3 = f(t + h / 2, y.map((v, i) => v + (h / 2) * k2[i]), params);
    const k4 = f(t + h, y.map((v, i) => v + h * k3[i]), params);
    y = y.map((v, i) => v + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
    y = y.map((v) => Math.max(0, v));
  }
  return { t: tArr, y: yArr };
}
