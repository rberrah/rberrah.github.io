// Charge les chapitres Markdown, parse frontmatter + blocs step.
// Utilise import.meta.glob en mode eager pour un usage synchrone côté client.
// @ts-nocheck
import matter from 'gray-matter';
import katex from 'katex';
import MarkdownIt from 'markdown-it';

// Polyfill Buffer pour le navigateur (gray-matter en a besoin).
const BufferPoly =
  typeof Buffer !== 'undefined'
    ? Buffer
    : class extends Uint8Array {
        static from(str) {
          return new TextEncoder().encode(str);
        }
        static isBuffer(b) {
          return b instanceof Uint8Array;
        }
      };
if (!globalThis.Buffer) globalThis.Buffer = BufferPoly;

const md = new MarkdownIt({ html: true, linkify: true, breaks: true });

// Encadrés pédagogiques : syntaxe `:::type … :::` en Markdown.
// Types reconnus (avec libellé affiché) :
const CALLOUTS = {
  pitfall: 'Piège',
  key: 'À retenir',
  clinical: 'En clinique',
  note: 'Note',
  math: 'Côté maths',
  howto: 'Comment la lire',
  recall: 'Rappel'
};

// Rend un segment Markdown : KaTeX au build (renderMath) PUIS MarkdownIt.
// (fusion patch « encadrés » + v2 « KaTeX server-side »)
function renderMd(src) {
  return md.render(renderMath(src));
}

/**
 * Rend un corps Markdown en HTML en gérant les encadrés `:::type … :::`.
 * Les équations sont rendues au build pour éviter tout flash côté client.
 * @param {string} body
 * @returns {string}
 */
function renderBody(body) {
  const re = /^:::(\w+)[ \t]*\n([\s\S]*?)\n:::[ \t]*$/gm;
  let out = '';
  let last = 0;
  let m;
  while ((m = re.exec(body)) !== null) {
    out += renderMd(body.slice(last, m.index));
    const type = m[1].toLowerCase();
    const label = CALLOUTS[type] ?? type;
    const inner = renderMd(m[2]);
    out += `<aside class="callout callout-${type}"><p class="callout-label">${label}</p>${inner}</aside>\n`;
    last = re.lastIndex;
  }
  out += renderMd(body.slice(last));
  return out;
}

// Langue PRINCIPALE = français : les fichiers `*.md` à la racine de chapters/ sont
// en français. Les traductions vivent dans des sous-dossiers par langue (`en/`, `fr/`).
const files = import.meta.glob('../../content/chapters/*.md', { query: '?raw', import: 'default', eager: true });
const enFiles = import.meta.glob('../../content/chapters/en/*.md', { query: '?raw', import: 'default', eager: true });
const frFiles = import.meta.glob('../../content/chapters/fr/*.md', { query: '?raw', import: 'default', eager: true });

/**
 * @typedef {{title:string, slides?:string, viz?:string}} StepMeta
 * @typedef {{title:string, html:string, slides:string[], viz?:string}} Step
 * @typedef {{id:string, slug:string, title:string, description:string, order:number, track:string, tags:string[], prerequisites:string[], glossary:string[], slides:string[], quiz:{prompt:string,options:string[],correct:number}[], steps:Step[]}} Chapter
 */

/** Construit une Map slug -> chapitre à partir d'un ensemble de fichiers traduits. */
function bySlug(globbed) {
  return new Map(
    Object.entries(globbed).map(([path, raw]) => {
      const chapter = parseChapter(path, raw);
      return [chapter.slug, chapter];
    })
  );
}

const enBySlug = bySlug(enFiles);
const frBySlug = bySlug(frFiles);

const chapters = Object.entries(files)
  // Les fichiers préfixés par « _ » sont des brouillons/modèles ignorés au build.
  // Ex. `_TEMPLATE.md` sert de point de départ à copier-coller.
  .filter(([path]) => !/\/_[^/]*\.md$/.test(path))
  .map(([path, raw]) => {
    const chapter = parseChapter(path, raw);
    /** @type {Record<string, Chapter>} */
    const translations = {};
    const en = enBySlug.get(chapter.slug);
    const fr = frBySlug.get(chapter.slug);
    if (en) translations.en = en;
    if (fr) translations.fr = fr;
    return Object.keys(translations).length ? { ...chapter, translations } : chapter;
  });

function parseChapter(path, raw) {
  const { data, content } = matter(raw);
  /** @type {Step[]} */
  const steps = extractSteps(content);
  /** @type {Chapter} */
  const chapter = {
    id: data.id,
    track: data.track ?? 'core',
    slug: data.slug,
    title: data.title,
    description: data.description ?? '',
    order: Number(data.order ?? 999),
    tags: data.tags ?? [],
    prerequisites: data.prerequisites ?? [],
    glossary: data.glossary ?? [],
    slides: data.slides ?? [],
    quiz: data.quiz ?? [],
    steps
  };
  return chapter;
}

/** @type {Chapter[]} */
const sorted = chapters.sort((a, b) => a.order - b.order);

export default sorted;

/**
 * @param {string} content
 * @returns {Step[]}
 */
function extractSteps(content) {
  /** @type {Step[]} */
  const blocks = [];
  const regex = /<!--\s*step:([^>]*)-->([\s\S]*?)<!--\s*\/step\s*-->/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    const metaRaw = m[1];
    const body = m[2].trim();
    const meta = parseMeta(metaRaw);
    const slides = meta.slides ? meta.slides.split(',').map((s) => s.trim()).filter(Boolean) : [];
    blocks.push({
      title: meta.title ?? 'Étape',
      html: renderBody(body),
      slides,
      viz: meta.viz
    });
  }
  return blocks;
}

/**
 * Rend les délimiteurs LaTeX usuels avant MarkdownIt pour éviter que Markdown
 * n'échappe les commandes comme \text{} ou \frac{} dans le HTML statique.
 * @param {string} source
 * @returns {string}
 */
function renderMath(source) {
  return source
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => {
      const html = katex.renderToString(tex.trim(), {
        displayMode: true,
        throwOnError: false
      });
      return `\n<div class="math-rendered math-display">${html}</div>\n`;
    })
    .replace(/\$([^$\n]+?)\$/g, (_, tex) => {
      return katex.renderToString(tex.trim(), {
        displayMode: false,
        throwOnError: false
      });
    });
}

/**
 * @param {string} str
 * @returns {Record<string, string>}
 */
function parseMeta(str) {
  /** @type {Record<string, string>} */
  const meta = {};
  // support key="value"
  const re = /(\w+)=["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(str)) !== null) {
    meta[m[1]] = m[2];
  }
  return meta;
}
