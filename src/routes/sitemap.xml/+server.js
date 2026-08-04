// Plan du site, prérendu au build : pages fixes + un chapitre = une URL.
// La liste des chapitres est DÉRIVÉE du chargeur existant — ajouter un fichier
// Markdown suffit, il n'y a rien à tenir à jour ici.
import chapters from '$lib/content/loadChapters';
import { SITE_BASE, SITE_ORIGIN } from '$lib/site';

export const prerender = true;

// Pages fixes indexables. Volontairement absentes :
//  - /qa/    : page interne de vérification des visualisations ;
//  - /slides/: listing de débogage des exports PPTX ;
//  - /chapitres/etat-equilibre/ : redirection en noindex vers /chapitres/doses-repetees/.
const FIXED_PAGES = [
  '/',
  '/chapitres/',
  '/exemple/',
  '/exercices/',
  '/lego/',
  '/playground/',
  '/glossaire/',
  '/references/',
  '/a-propos/'
];

/** @param {string} route */
const absolute = (route) => `${SITE_ORIGIN}${SITE_BASE}${route}`;

/** Échappe les caractères interdits dans un nœud texte XML. */
const xml = (/** @type {string} */ s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function GET() {
  /** @type {{loc: string, lastmod?: string}[]} */
  const entries = FIXED_PAGES.map((route) => ({ loc: absolute(route) }));

  for (const c of chapters) {
    entries.push({
      loc: absolute(`/chapitres/${c.slug}/`),
      // `lastmod` n'est posé que si le frontmatter porte une date de révision valide :
      // une date inventée vaut moins qu'une date absente.
      lastmod: /^\d{4}-\d{2}-\d{2}$/.test(c.reviewed_on ?? '') ? c.reviewed_on : undefined
    });
  }

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries
      .map(
        (e) =>
          '  <url>\n' +
          `    <loc>${xml(e.loc)}</loc>\n` +
          (e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>\n` : '') +
          '  </url>\n'
      )
      .join('') +
    '</urlset>\n';

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
