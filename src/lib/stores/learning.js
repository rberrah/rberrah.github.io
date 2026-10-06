import { writable, get } from 'svelte/store';
import { progressKey, emptyProgress, cleanProgress } from '../learning/assessment.js';

export const learning = writable({ ready: false, enabled: false, error: false, ...emptyProgress() });

export function loadLearning() {
  if (typeof window === 'undefined' || get(learning).ready) return;
  try {
    const raw = localStorage.getItem(progressKey);
    const parsed = raw ? JSON.parse(raw) : null;
    learning.set({ ready: true, enabled: parsed?.version === 1, error: false, ...cleanProgress(parsed) });
  } catch {
    learning.set({ ready: true, enabled: false, error: true, ...emptyProgress() });
  }
}

function persist() {
  const state = get(learning);
  try {
    if (state.enabled) localStorage.setItem(progressKey, JSON.stringify(cleanProgress(state)));
    else localStorage.removeItem(progressKey);
    learning.update(s => ({ ...s, error: false }));
  } catch { learning.update(s => ({ ...s, error: true })); }
}

/** @param {boolean} enabled */
export function enableLearning(enabled) {
  loadLearning();
  learning.update(s => ({ ...s, enabled }));
  persist();
}

export function clearLearning() {
  learning.update(s => ({ ...s, ...emptyProgress() }));
  persist();
}

/** @param {'chapters'|'activities'} kind @param {string} id @param {string} status */
export function markLearning(kind, id, status) {
  loadLearning();
  const state = get(learning);
  const next = cleanProgress({ ...state, [kind]: { ...state[kind], [id]: status } });
  learning.update(s => ({ ...s, ...next }));
  if (state.enabled) persist();
}
