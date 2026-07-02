// @ts-nocheck
// Store réactif suivant la préférence système « prefers-reduced-motion ».
// Toutes les animations du site doivent s'y référer pour rester accessibles :
// si l'utilisateur a demandé moins de mouvement, on désactive les transitions.
import { readable } from 'svelte/store';

const QUERY = '(prefers-reduced-motion: reduce)';

export const reducedMotion = readable(false, (set) => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    set(false);
    return;
  }
  const mq = window.matchMedia(QUERY);
  set(mq.matches);
  const handler = (e) => set(e.matches);
  // addEventListener n'existe pas sur d'anciens Safari -> fallback addListener.
  if (mq.addEventListener) mq.addEventListener('change', handler);
  else mq.addListener(handler);
  return () => {
    if (mq.removeEventListener) mq.removeEventListener('change', handler);
    else mq.removeListener(handler);
  };
});

/** Valeur instantanée, hors composant Svelte (ex. dans un utilitaire). */
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}
