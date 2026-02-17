// Charge les chapitres Markdown, parse frontmatter + blocs step.
// Utilise import.meta.glob en mode eager pour un usage synchrone côté client.
// @ts-nocheck
import matter from 'gray-matter';
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

/**
 * @typedef {{title:string, slides?:string, viz?:string}} StepMeta
 * @typedef {{title:string, html:string, slides:string[], viz?:string}} Step
 * @typedef {{id:string, slug:string, title:string, description:string, order:number, tags:string[], slides:string[], steps:Step[]}} Chapter
 */

const chapters = Object.entries(files).map(([path, raw]) => {
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
    steps
  };
  return chapter;
});

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
      html: md.render(body),
      slides,
      viz: meta.viz
    });
  }
  return blocks;
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
