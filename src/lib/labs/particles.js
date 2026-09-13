import { randomExponential, randomLcg, bisector, interpolateBasis } from 'd3';
import { schedule, validateParameters } from './model.js';

/** @typedef {{time:number,room:string}} Visit */
/** @typedef {{id:number,dose:number,born:number,seed:number,visits:Visit[]}} Particle */
/** @typedef {{x:number,y:number,w:number,h:number}} Room */
const visitIndex = bisector(/** @param {Visit} visit */ visit => visit.time).right;

// These seeded, finite particle journeys are illustrative, not concentration
// estimates. The continuous PK solver remains the sole source of all readouts.
/** @param {string} lab @param {Record<string,number>} supplied @returns {Particle[]} */
export function particleJourneys(lab, supplied) {
  const p = validateParameters(lab, supplied), doses = schedule(lab, p);
  const q = lab === 'distribution' ? p.q : 0;
  const rates = { central: (p.cl + q) / p.vc, peripheral: q / p.vp };
  const total = doses.reduce((sum, d) => sum + d.amount, 0);
  // Bound visual work even for fast exchange and the longest allowed horizon.
  const budget = Math.max(12, Math.min(480, Math.floor(60000 / (1 + p.end * Math.max(...Object.values(rates))))));
  const perDose = Math.min(lab === 'distribution' ? 150 : 90, budget * p.dose / total);
  /** @type {Particle[]} */ const result = [];
  for (const [dose, administration] of doses.entries()) {
    if (administration.time > p.end) continue;
    const count = Math.max(1, Math.round(perDose * administration.amount / p.dose));
    for (let i = 0; i < count; i++) {
      const id = result.length, seed = (id + 1) * 7919;
      const rng = randomLcg(seed), exponential = randomExponential.source(rng);
      const waitCentral = exponential(rates.central), waitPeripheral = rates.peripheral ? exponential(rates.peripheral) : () => Infinity;
      let room = 'central', time = administration.time;
      const visits = [{ time, room }];
      while (room !== 'eliminated' && visits.length < 12000) {
        time += Math.max(1e-9, room === 'central' ? waitCentral() : waitPeripheral());
        if (time > p.end) break;
        room = room === 'peripheral' ? 'central' : rng() < p.cl / (p.cl + q) ? 'eliminated' : 'peripheral';
        visits.push({ time, room });
      }
      result.push({ id, dose, born: administration.time, seed, visits });
    }
  }
  return result;
}

/** @param {Particle} particle @param {number} time */
export function particleVisit(particle, time) {
  return time < particle.born ? -1 : visitIndex(particle.visits, time) - 1;
}

/** @param {number} width @param {string} lab */
export function sceneLayout(width, lab) {
  const narrow = width < 560, height = narrow ? 570 : 510;
  const margin = narrow ? 16 : 36, gap = narrow ? 64 : Math.max(130, width * .18);
  const w = (width - 2 * margin - gap) / 2, y = 122, h = narrow ? 204 : 206;
  /** @type {Record<string,Room>} */
  const rooms = {
    central: { x: margin, y, w, h },
    peripheral: { x: width - margin - w, y, w, h },
    eliminated: { x: margin, y: height - 92, w: width - margin * 2, h: 68 }
  };
  const c = rooms.central, r = rooms.peripheral, e = rooms.eliminated;
  return { width, height, narrow, rooms, lab,
    forwardY: y + h * .34, backwardY: y + h * .70,
    drainX: c.x + c.w * .5,
    injection: { x: c.x + 18, y: c.y + 18 },
    gapCenter: (c.x + c.w + r.x) / 2,
    collectorPort: { x: c.x + c.w * .5, y: e.y + 10 }
  };
}
/** @typedef {ReturnType<typeof sceneLayout>} Layout */
const smooth = (/** @type {number} */ t) => t * t * (3 - 2 * t);
const mix = (/** @type {number} */ a, /** @type {number} */ b, /** @type {number} */ f) => a + (b - a) * f;

/** @param {Particle} particle @param {Room} room @param {number} time @param {boolean} still */
function wander(particle, room, time, still) {
  const phase = particle.seed * .173;
  const t = still ? 0 : time;
  return {
    x: room.x + 11 + (room.w - 22) * (.5 + .44 * Math.sin(phase + t * (1.1 + (particle.id % 7) * .13))),
    y: room.y + 14 + (room.h - 28) * (.5 + .44 * Math.sin(phase * 1.91 + t * (1.6 + (particle.id % 11) * .07)))
  };
}

/** @param {string} from @param {string} to @param {Layout} g */
export function journeyPorts(from, to, g) {
  const c = g.rooms.central, r = g.rooms.peripheral;
  if (to === 'eliminated') return [{ x: g.drainX, y: c.y + c.h - 8 }, g.collectorPort];
  if (from === 'central') return [{ x: c.x + c.w - 8, y: g.forwardY }, { x: r.x + 8, y: g.forwardY }];
  return [{ x: r.x + 8, y: g.backwardY }, { x: c.x + c.w - 8, y: g.backwardY }];
}

/** @param {Particle} particle @param {number} time @param {Layout} g */
export function particlePosition(particle, time, g, still = false) {
  const index = particleVisit(particle, time);
  if (index < 0) return null;
  const current = particle.visits[index], next = particle.visits[index + 1];
  const previous = particle.visits[index - 1];
  let pos = wander(particle, g.rooms[current.room], time, still || current.room === 'eliminated');
  if (still) return { ...pos, room: current.room, transit: false };
  const residence = next ? next.time - current.time : 100;
  const arrival = Math.min(.35, residence * .2);
  if (time - current.time < arrival && (previous || particle.born > 0)) {
    const entry = previous ? journeyPorts(previous.room, current.room, g)[1] : g.injection;
    const f = smooth((time - current.time) / arrival);
    pos = { x: mix(entry.x, pos.x, f), y: mix(entry.y, pos.y, f) };
  }
  const travel = Math.min(.8, residence * .45);
  if (next && time >= next.time - travel) {
    const start = wander(particle, g.rooms[current.room], next.time - travel, false);
    const [exit, entry] = journeyPorts(current.room, next.room, g);
    const f = (time - next.time + travel) / travel;
    // Three legs make the same particle approach, cross, then enter the port.
    const points = [start, exit, exit, entry, entry];
    const x = interpolateBasis(points.map(point => point.x));
    const y = interpolateBasis(points.map(point => point.y));
    return { x: x(f), y: y(f), room: current.room, transit: true };
  }
  return { ...pos, room: current.room, transit: false };
}
