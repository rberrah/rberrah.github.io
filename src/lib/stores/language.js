// @ts-nocheck
import { browser } from '$app/environment';
import { replaceState } from '$app/navigation';
import { writable } from 'svelte/store';
import { ui } from '$lib/i18n/translations';

const STORAGE_KEY = 'pharmacometrie-language';
const DEFAULT_LANGUAGE = 'fr';
const supported = new Set(['en', 'fr']);

// La langue est un état d'INTERFACE, pas un segment d'URL : les deux versions d'une page
// partagent la même adresse. `?lang=en` est donc le seul identifiant stable dont dispose
// un moteur (ou un lien partagé) pour désigner la version anglaise — c'est ce que
// déclarent les balises <link rel="alternate" hreflang>. Le paramètre prime sur la
// préférence enregistrée : un lien reçu doit s'ouvrir dans la langue qu'il annonce.
function readInitialLanguage() {
  if (!browser) return DEFAULT_LANGUAGE;
  try {
    const fromUrl = new URLSearchParams(location.search).get('lang');
    if (supported.has(fromUrl)) return fromUrl;
  } catch (e) {
    // URL exotique : on retombe sur la préférence enregistrée.
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  return supported.has(stored) ? stored : DEFAULT_LANGUAGE;
}

// Garde l'URL cohérente avec le choix affiché, sinon un rechargement rétablirait la
// langue du paramètre et annulerait le clic du lecteur.
function syncUrl(/** @type {string} */ lang) {
  if (!browser) return;
  try {
    const url = new URL(location.href);
    if (lang === DEFAULT_LANGUAGE) url.searchParams.delete('lang');
    else url.searchParams.set('lang', lang);
    // `replaceState` de $app/navigation plutôt que celui de l'historique : SvelteKit
    // doit connaître le changement, sinon `$page.url` reste sur l'ancienne adresse.
    if (url.href !== location.href) replaceState(url, {});
  } catch (e) {
    // Routeur pas encore initialisé : sans conséquence, la langue reste appliquée.
  }
}

function createLanguageStore() {
  const store = writable(readInitialLanguage());

  if (browser) {
    store.subscribe((lang) => {
      const normalized = supported.has(lang) ? lang : DEFAULT_LANGUAGE;
      localStorage.setItem(STORAGE_KEY, normalized);
      document.documentElement.lang = normalized;
      const description = document.querySelector('meta[name="description"]');
      if (description) description.setAttribute('content', ui(normalized).meta.description);
    });
  }

  return {
    subscribe: store.subscribe,
    set(lang) {
      const normalized = supported.has(lang) ? lang : DEFAULT_LANGUAGE;
      store.set(normalized);
      syncUrl(normalized);
    }
  };
}

export const language = createLanguageStore();
