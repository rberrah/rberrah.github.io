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

const files = import.meta.glob('../../content/chapters/*.md', { query: '?raw', import: 'default', eager: true });
const translationFiles = import.meta.glob('../../content/chapters/fr/*.md', { query: '?raw', import: 'default', eager: true });

/**
 * @typedef {{title:string, slides?:string, viz?:string}} StepMeta
 * @typedef {{title:string, html:string, slides:string[], viz?:string}} Step
 * @typedef {{id:string, slug:string, title:string, description:string, order:number, tags:string[], slides:string[], quiz:{prompt:string,options:string[],correct:number}[], steps:Step[]}} Chapter
 */

const translationsBySlug = new Map(
  Object.entries(translationFiles).map(([path, raw]) => {
    const chapter = parseChapter(path, raw);
    return [chapter.slug, chapter];
  })
);

const chapters = Object.entries(files).map(([path, raw]) => {
  const chapter = parseChapter(path, raw);
  const fr = translationsBySlug.get(chapter.slug);
  return fr ? { ...chapter, translations: { fr } } : chapter;
});

function parseChapter(path, raw) {
  const { data, content } = matter(raw);
  /** @type {Step[]} */
  const steps = extractSteps(content);
  /** @type {Chapter} */
  const chapter = {
    id: data.id,
    slug: data.slug,
    title: data.title,
    description: data.description ?? '',
    order: Number(data.order ?? 999),
    tags: data.tags ?? [],
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
      html: md.render(renderMath(body)),
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
