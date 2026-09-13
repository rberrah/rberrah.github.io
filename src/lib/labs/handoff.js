import { writable } from 'svelte/store';
import { laboratorySpec } from './model.js';

// Explicit navigation only; no URL payload or persistent browser storage.
export const labHandoff = writable(/** @type {{destination:string,spec:ReturnType<typeof laboratorySpec>} | null} */ (null));
/** @param {string} destination @param {ReturnType<typeof laboratorySpec>} spec */
export function prepareHandoff(destination, spec) {
  const value = laboratorySpec(spec.lab, spec.parameters, spec.reference, spec.teacher, spec.hidden);
  labHandoff.set({ destination, spec: value });
}
