import { writable, derived } from 'svelte/store';

export const dose = writable(150);
export const volume = writable(25);
export const clearance = writable(6);

export const ke = derived([clearance, volume], ([$cl, $v]) => ($v ? $cl / $v : 0));

export const concCurve = derived([dose, volume, ke], ([$dose, $v, $ke]) => {
  const times = Array.from({ length: 25 }, (_, i) => i);
  return times.map((t) => ({
    t,
    c: $v ? ($dose / $v) * Math.exp(-$ke * t) : 0
  }));
});
