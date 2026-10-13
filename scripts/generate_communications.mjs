import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { communications } from '../src/lib/content/communications.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.join(root, 'portal', 'communications');
const check = process.argv.includes('--check');

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;');

const labels = {
  en: {
    htmlLang: 'en', title: 'Scientific communications', eyebrow: 'Research output',
    intro: 'Posters and oral presentations, with source files and concise context.',
    all: 'All', posters: 'Posters', oral: 'Oral presentations', year: 'Year',
    allYears: 'All years', view: 'View', pdf: 'PDF', slides: 'Slides / PPTX',
    publication: 'Related publication', upcoming: 'Upcoming', presented: 'Presented',
    back: 'All communications', summary: 'Site summary', topics: 'Topics', files: 'Available files',
    download: 'Download', project: 'Related project', citation: 'Suggested citation',
    provenance: 'Source file maintained in the Communication repository.',
    language: 'Français', languageHref: '/communications/fr/', date: 'Date', place: 'Location',
    type: 'Type', authors: 'Authors', event: 'Event', poster: 'Poster', oralOne: 'Oral presentation',
    originalLanguage: 'Original language', source: 'Source provenance', noResults: 'No communication matches these filters.'
  },
  fr: {
    htmlLang: 'fr', title: 'Communications scientifiques', eyebrow: 'Production scientifique',
    intro: 'Posters et communications orales, avec les fichiers sources et un contexte concis.',
    all: 'Toutes', posters: 'Posters', oral: 'Communications orales', year: 'Année',
    allYears: 'Toutes les années', view: 'Voir', pdf: 'PDF', slides: 'Slides / PPTX',
    publication: 'Publication associée', upcoming: 'À venir', presented: 'Présentée',
    back: 'Toutes les communications', summary: 'Résumé du site', topics: 'Thèmes', files: 'Fichiers disponibles',
    download: 'Télécharger', project: 'Projet associé', citation: 'Citation proposée',
    provenance: 'Fichier source maintenu dans le dépôt Communication.',
    language: 'English', languageHref: '/communications/', date: 'Date', place: 'Lieu',
    type: 'Type', authors: 'Auteurs', event: 'Événement', poster: 'Poster', oralOne: 'Communication orale',
    originalLanguage: 'Langue originale', source: 'Provenance', noResults: 'Aucune communication ne correspond à ces filtres.'
  }
};

function formatDate(item, lang) {
  if (!item.date) return String(item.year);
  const formatter = new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const start = formatter.format(new Date(`${item.date}T00:00:00Z`));
  if (!item.dateEnd || item.dateEnd === item.date) return start;
  return `${start} – ${formatter.format(new Date(`${item.dateEnd}T00:00:00Z`))}`;
}

function nav(current = '') {
  const item = (href, text, key) => `<a href="${href}"${current === key || (current === 'communications' && key === 'publications') ? ' aria-current="page"' : ''}>${text}</a>`;
  return `<header class="site-header"><nav class="wrap navigation" aria-label="Main navigation"><a class="nav-name" href="/">Racym Berrah</a><div class="nav-links">${item('/#pharmacometrics', 'Pharmacometrics', 'pmx')}${item('/tools/', 'Tools &amp; Projects', 'tools')}${item('/publications/', 'Publications &amp; Talks', 'publications')}${item('/a-propos/', 'About', 'about')}</div></nav></header>`;
}

function footer() {
  return `<footer class="site"><div class="wrap footer-top"><div><a class="nav-name" href="/">Racym Berrah</a><p>Quantitative pharmacology, pharmacometrics &amp; AI.</p></div><nav class="footer-links" aria-label="Footer navigation"><a href="https://orcid.org/0009-0001-6432-2880" rel="me">ORCID</a><a href="https://github.com/rberrah" rel="me">GitHub</a><a href="/contact/">Contact</a><a href="/other-projects/">Other Projects</a><a href="/citer/">Citation &amp; reuse</a><a href="/pharmacometrie/confidentialite/">Privacy</a></nav></div><div class="wrap footer-bottom"><p>Text: <a href="https://creativecommons.org/licenses/by-sa/4.0/" rel="license">CC BY-SA 4.0</a>. Code: <a href="https://github.com/rberrah/rberrah.github.io/blob/main/LICENSE">MIT</a>.</p><p>Research and education. Not medical advice or a clinical medical device.</p><label class="theme-control" hidden>Appearance <select id="theme"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label></div></footer>`;
}

function head({ lang, title, description, canonical, image, jsonLd }) {
  const safeJson = JSON.stringify(jsonLd).replaceAll('<', '\\u003c');
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)} | Racym Berrah</title><meta name="description" content="${escapeHtml(description)}"><meta name="author" content="Racym Berrah"><link rel="canonical" href="__SITE_ORIGIN__${canonical}"><meta property="og:type" content="website"><meta property="og:title" content="${escapeHtml(title)} | Racym Berrah"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="__SITE_ORIGIN__${canonical}">${image ? `<meta property="og:image" content="__SITE_ORIGIN__${image}"><meta property="og:image:alt" content="${escapeHtml(title)}">` : ''}<meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="/assets/site.css"><script src="/assets/site.js"></script>${jsonLd ? `<script type="application/ld+json">${safeJson}</script>` : ''}</head>`;
}

function fileLinks(item, l, compact = false) {
  const links = [];
  if (!compact) links.push(`<a class="btn primary" href="${item.pdf || item.pptx}">${l.view}</a>`);
  if (item.pdf) links.push(`<a${compact ? '' : ' class="btn"'} href="${item.pdf}"${compact ? '' : ' download'}>${l.pdf}</a>`);
  if (item.pptx) links.push(`<a${compact ? '' : ' class="btn"'} href="${item.pptx}" download>${l.slides}</a>`);
  if (item.publication) links.push(`<a${compact ? '' : ' class="btn"'} href="${item.publication.url}">${compact ? l.publication : escapeHtml(item.publication.label[l.htmlLang])} <span aria-hidden="true">↗</span></a>`);
  return links.join('');
}

function card(item, lang) {
  const l = labels[lang];
  const base = lang === 'fr' ? '/communications/fr' : '/communications';
  const type = item.type === 'poster' ? l.poster : l.oralOne;
  return `<article class="communication-card" data-communication data-type="${item.type}" data-year="${item.year}"><a class="communication-preview" href="${base}/${item.slug}/"><img src="${item.image}" alt="${escapeHtml(lang === 'fr' ? `Aperçu de ${item.title}` : `Preview of ${item.title}`)}" width="1600" height="900" loading="lazy"></a><div class="communication-card-body"><p class="communication-meta"><span>${type}</span><span>${item.year}</span><span class="status ${item.status}">${l[item.status]}</span></p><h2><a href="${base}/${item.slug}/">${escapeHtml(item.title)}</a></h2><p class="authors">${escapeHtml(item.authors.join(', '))}</p><p>${escapeHtml(item.event)}${item.location ? ` · ${escapeHtml(item.location)}` : ''}</p><div class="topic-list">${item.topics.slice(0, 4).map(topic => `<span>${escapeHtml(topic)}</span>`).join('')}</div><div class="links communication-actions"><a class="btn primary" href="${base}/${item.slug}/">${l.view}</a>${fileLinks(item, l, true)}</div></div></article>`;
}

function indexPage(lang) {
  const l = labels[lang];
  const canonical = lang === 'fr' ? '/communications/fr/' : '/communications/';
  const sorted = [...communications].sort((a, b) => (b.date || `${b.year}` ).localeCompare(a.date || `${a.year}`));
  const years = [...new Set(sorted.map(item => item.year))].sort((a, b) => b - a);
  const graph = sorted.map(item => ({ '@type': 'PresentationDigitalDocument', name: item.title, author: item.authors.map(name => ({ '@type': 'Person', name })), dateCreated: item.date, inLanguage: item.language, url: `__SITE_ORIGIN__/communications/${item.slug}/` }));
  return `${head({ lang: l.htmlLang, title: l.title, description: l.intro, canonical, image: sorted[0]?.image, jsonLd: { '@context': 'https://schema.org', '@graph': graph } })}<body><a class="skip" href="#main">${lang === 'fr' ? 'Aller au contenu' : 'Skip to content'}</a>${nav('communications')}<main id="main" tabindex="-1"><div class="wrap page-heading communication-heading"><div><p class="eyebrow">${l.eyebrow}</p><h1>${l.title}</h1><p class="lede">${l.intro}</p></div><a class="language-link" href="${l.languageHref}" hreflang="${lang === 'fr' ? 'en' : 'fr'}">${l.language}</a></div><section class="wrap communication-browser" data-communications><div class="communication-filters" aria-label="${lang === 'fr' ? 'Filtres des communications' : 'Communication filters'}"><div class="segmented" role="group" aria-label="${l.type}"><button type="button" data-filter="all" aria-pressed="true">${l.all}</button><button type="button" data-filter="poster" aria-pressed="false">${l.posters}</button><button type="button" data-filter="oral" aria-pressed="false">${l.oral}</button></div><label>${l.year}<select data-year><option value="all">${l.allYears}</option>${years.map(year => `<option value="${year}">${year}</option>`).join('')}</select></label></div><p class="empty communication-empty" data-empty hidden>${l.noResults}</p><div class="communication-grid">${sorted.map(item => card(item, lang)).join('')}</div></section></main>${footer()}<script src="/assets/communications.js"></script></body></html>`;
}

function detailPage(item, lang) {
  const l = labels[lang];
  const base = lang === 'fr' ? '/communications/fr' : '/communications';
  const canonical = `${base}/${item.slug}/`;
  const type = item.type === 'poster' ? l.poster : l.oralOne;
  const languageName = item.language === 'en' ? (lang === 'fr' ? 'anglais' : 'English') : (lang === 'fr' ? 'français' : 'French');
  const citation = `${item.authors.join(', ')}. ${item.title}. ${item.event}; ${item.year}${item.location ? `; ${item.location}` : ''}. ${type}.`;
  const alternate = lang === 'fr' ? `/communications/${item.slug}/` : `/communications/fr/${item.slug}/`;
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'PresentationDigitalDocument', name: item.title,
    ...(item.subtitle ? { alternativeHeadline: item.subtitle } : {}),
    author: item.authors.map(name => ({ '@type': 'Person', name })),
    contributor: item.presenter ? { '@type': 'Person', name: item.presenter } : undefined,
    dateCreated: item.date, inLanguage: item.language, about: item.topics,
    contentUrl: item.pdf ? `__SITE_ORIGIN__${item.pdf}` : `__SITE_ORIGIN__${item.pptx}`,
    url: `__SITE_ORIGIN__${canonical}`
  };
  return `${head({ lang: l.htmlLang, title: item.title, description: item.summary[lang], canonical, image: item.image, jsonLd })}<body><a class="skip" href="#main">${lang === 'fr' ? 'Aller au contenu' : 'Skip to content'}</a>${nav('communications')}<main id="main" tabindex="-1"><article class="wrap communication-detail"><div class="communication-detail-nav"><a href="${base}/">← ${l.back}</a><a href="${alternate}" hreflang="${lang === 'fr' ? 'en' : 'fr'}">${l.language}</a></div><header><p class="communication-meta"><span>${type}</span><span>${item.year}</span><span class="status ${item.status}">${l[item.status]}</span></p><h1>${escapeHtml(item.title)}</h1>${item.subtitle ? `<p class="lede">${escapeHtml(item.subtitle)}</p>` : ''}<p class="authors">${escapeHtml(item.authors.join(', '))}</p><p><strong>${l.event}:</strong> ${item.eventUrl ? `<a href="${item.eventUrl}">${escapeHtml(item.event)} <span aria-hidden="true">↗</span></a>` : escapeHtml(item.event)}</p><p>${formatDate(item, lang)}${item.location ? ` · ${escapeHtml(item.location)}` : ''}</p></header><figure class="communication-hero"><a href="${item.pdf || item.pptx}"><img src="${item.image}" alt="${escapeHtml(lang === 'fr' ? `Aperçu de ${item.title}` : `Preview of ${item.title}`)}" width="1600" height="900"></a><figcaption>${lang === 'fr' ? 'Aperçu du support original.' : 'Preview of the original presentation.'}</figcaption></figure><div class="communication-detail-grid"><section><h2>${l.summary}</h2><p>${escapeHtml(item.summary[lang])}</p><h2>${l.topics}</h2><div class="topic-list">${item.topics.map(topic => `<span>${escapeHtml(topic)}</span>`).join('')}</div></section><aside><dl class="communication-facts"><dt>${l.type}</dt><dd>${type}</dd><dt>${l.date}</dt><dd>${formatDate(item, lang)}</dd>${item.location ? `<dt>${l.place}</dt><dd>${escapeHtml(item.location)}</dd>` : ''}<dt>${l.originalLanguage}</dt><dd>${languageName}</dd></dl><h2>${l.files}</h2><div class="communication-downloads">${fileLinks(item, l)}</div>${item.relatedProject ? `<h2>${l.project}</h2><a href="${item.relatedProject.url}">${escapeHtml(item.relatedProject.label[lang])} <span aria-hidden="true">↗</span></a>` : ''}</aside></div><section class="communication-citation"><h2>${l.citation}</h2><p class="cite">${escapeHtml(citation)}</p><p class="small">${l.provenance}</p><details><summary>${l.source}</summary><p class="small"><code>${escapeHtml(item.sourceRepository)}/${escapeHtml(item.sourcePath)}</code><br><code>${escapeHtml(item.sourceSha)}</code></p></details></section></article></main>${footer()}</body></html>`;
}

async function emit(relative, content) {
  const file = path.join(outputRoot, relative);
  if (check) {
    const current = await readFile(file, 'utf8').catch(() => '');
    if (current !== content) throw new Error(`Generated communication page is stale: ${path.relative(root, file)}`);
    return;
  }
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
}

await emit('index.html', indexPage('en'));
await emit(path.join('fr', 'index.html'), indexPage('fr'));
for (const item of communications) {
  await emit(path.join(item.slug, 'index.html'), detailPage(item, 'en'));
  await emit(path.join('fr', item.slug, 'index.html'), detailPage(item, 'fr'));
}
console.log(`${check ? 'Checked' : 'Generated'} ${2 + communications.length * 2} communication pages.`);
