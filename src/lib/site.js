// @ts-nocheck
// Public identity shared by canonical URLs, structured metadata and citations.
// The build origin is independent of BASE_PATH and the local development URL.
import { SITE_ORIGIN } from './site-origin.js';
export { SITE_ORIGIN };

/** Chemin public du cours sous cette origine (cf. .github/workflows : BASE_PATH=/pharmacometrie). */
export const SITE_BASE = '/pharmacometrie';

/** Racine publique du cours, barre oblique finale comprise (trailingSlash: 'always'). */
export const SITE_URL = `${SITE_ORIGIN}${SITE_BASE}/`;

/** Nom du cours, tel qu'il doit apparaître dans une citation. */
export const COURSE_NAME = 'PMx Explain';

/** Année portée par le site (citation d'une page sans date de révision). */
export const SITE_YEAR = 2026;

/** Licences de la version courante. Les versions antérieures conservent les droits déjà accordés. */
export const LICENSE_LABEL = 'CC BY-NC-SA 4.0';
export const LICENSE_URL = 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.fr';
export const CODE_LICENSE_LABEL = 'PolyForm Noncommercial 1.0.0';
export const CODE_LICENSE_URL = 'https://github.com/rberrah/rberrah.github.io/blob/main/LICENSE';

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
  url: `${SITE_ORIGIN}/a-propos/`
};

/**
 * Retire le préfixe de déploiement d'un chemin pour retrouver la route logique.
 *
 * On ne dérive pas ici le préfixe canonique depuis `$app/paths` : la valeur résolue
 * dépend du contexte de routage/prérendu et ne constitue pas le contrat public du site.
 * Une ancienne implémentation produisait ainsi des URL doublées
 * `/pharmacometrie/pharmacometrie/chapitres/…`. `SITE_BASE` est le préfixe public
 * versionné par PMx Explain : c'est donc lui seul qui est retiré.
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
