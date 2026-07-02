// @ts-nocheck
import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { ui } from '$lib/i18n/translations';

const STORAGE_KEY = 'pharmacometrie-language';
const DEFAULT_LANGUAGE = 'en';
const supported = new Set(['en', 'fr']);

function readInitialLanguage() {
  if (!browser) return DEFAULT_LANGUAGE;
  const stored = localStorage.getItem(STORAGE_KEY);
  return supported.has(stored) ? stored : DEFAULT_LANGUAGE;
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
      store.set(supported.has(lang) ? lang : DEFAULT_LANGUAGE);
    }
  };
}

export const language = createLanguageStore();
