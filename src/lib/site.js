// @ts-nocheck
// Identité PUBLIQUE du site : origine, chemin de déploiement, auteur, licence.
//
// Pourquoi ne pas se contenter de `base` ($app/paths) : `base` vaut '' en local et
// '/pharmacometrie' en CI (BASE_PATH). Il ne porte JAMAIS l'origine. Toute URL absolue
// écrite dans une balise <link rel="canonical">, un JSON-LD ou le plan du site doit
// pointer vers l'URL réellement publiée — d'où ces constantes, indépendantes du build.
/** Origine publique (GitHub Pages, compte rberrah). */
export const SITE_ORIGIN = 'https://rberrah.github.io';

/** Chemin public du cours sous cette origine (cf. .github/workflows : BASE_PATH=/pharmacometrie). */
export const SITE_BASE = '/pharmacometrie';

/** Racine publique du cours, barre oblique finale comprise (trailingSlash: 'always'). */
export const SITE_URL = `${SITE_ORIGIN}${SITE_BASE}/`;

/** Nom du cours, tel qu'il doit apparaître dans une citation. */
export const COURSE_NAME = 'Pharmacométrie Pratique';

/** Année portée par le site (citation d'une page sans date de révision). */
export const SITE_YEAR = 2026;

/** Licence du TEXTE. Le CODE reste sous licence MIT. */
export const LICENSE_LABEL = 'CC BY-SA 4.0';
export const LICENSE_URL = 'https://creativecommons.org/licenses/by-sa/4.0/deed.fr';

/** Auteur unique du corpus. */
export const AUTHOR = {
  name: 'Racym Berrah',
  credential: 'PharmD',
  /** Forme « Nom P. » utilisée dans les citations. */
  citationName: 'Berrah R.',
  /** Forme « Nom, Prénom » utilisée par BibTeX. */
  bibtexName: 'Berrah, Racym',
  orcid: 'https://orcid.org/0009-0001-6432-2880',
  /** Page « à propos » du portail, hors de ce sous-site. */
  url: 'https://rberrah.github.io/a-propos/'
};

/**
 * Retire le préfixe de déploiement d'un chemin pour retrouver la route logique.
 *
 * On NE se sert PAS de `base` ($app/paths) ici : avec `paths.relative` (actif par
 * défaut en SvelteKit 2), `base` vaut une valeur RELATIVE au prérendu (« . », « ../.. »)
 * et non « /pharmacometrie ». Le test `p.startsWith(base)` échouait donc en silence,
 * et l'URL canonique sortait doublée : /pharmacometrie/pharmacometrie/chapitres/…
 * SITE_BASE est le seul préfixe réellement publié : c'est lui qu'on retire.
 * @param {string} pathname
 * @returns {string}
 */
export function routePath(pathname) {
  let p = pathname || '/';
  if (SITE_BASE && p.startsWith(SITE_BASE)) p = p.slice(SITE_BASE.length) || '/';
  if (!p.startsWith('/')) p = `/${p}`;
  return p;
}

/**
 * URL canonique ABSOLUE d'une page, à partir du chemin rendu par le routeur.
 * Ne dépend d'aucune valeur lue dans le navigateur : sûr au prérendu.
 * @param {string} pathname — typiquement `$page.url.pathname`
 * @returns {string}
 */
export function canonicalUrl(pathname) {
  let p = routePath(pathname);
  // trailingSlash: 'always' — la forme canonique porte toujours la barre finale.
  if (!p.endsWith('/')) p = `${p}/`;
  return `${SITE_ORIGIN}${SITE_BASE}${p}`;
}

/**
 * Variante anglaise d'une URL canonique. La langue est un état d'interface (store),
 * pas un segment d'URL : `?lang=en` est le seul identifiant stable dont dispose un
 * moteur pour désigner la version anglaise d'une page.
 * @param {string} canonical
 * @returns {string}
 */
export function alternateUrl(canonical) {
  return `${canonical}?lang=en`;
}

/**
 * Sérialise un objet JSON-LD dans une balise <script> prête à injecter via {@html}.
 * L'échappement de « < » interdit qu'un titre de chapitre contenant une balise ferme
 * le script prématurément.
 * @param {Record<string, any>} data
 * @returns {string}
 */
export function jsonLdScript(data) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}
