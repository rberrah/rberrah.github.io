// @ts-nocheck
// Full chapter bodies are loaded only for the requested chapter.
// Navigation, tracks, exercises and sitemaps use the generated metadata index.
import matter from './frontmatter.js';
import chapterIndex from './chapterIndex.generated.json';
import katex from 'katex';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ html: true, linkify: true, breaks: true });

const CALLOUTS = {
  pitfall: 'Piège',
  key: 'À retenir',
  clinical: 'En clinique',
  note: 'Note',
  math: 'Côté maths',
  howto: 'Comment la lire',
  recall: 'Rappel'
};
const CALLOUTS_EN = {
  pitfall: 'Pitfall',
  key: 'Key point',
  clinical: 'Clinical context',
  note: 'Note',
  math: 'Mathematical detail',
  howto: 'How to read it',
  recall: 'Reminder'
};

const files = import.meta.glob('../../content/chapters/*.md', { query: '?raw', import: 'default' });
const enFiles = import.meta.glob('../../content/chapters/en/*.md', { query: '?raw', import: 'default' });

function renderMd(src) {
  return md.render(renderMath(src));
}

function renderBody(body, lang = 'fr') {
  const re = /^:::(\w+)[ \t]*\n([\s\S]*?)\n:::[ \t]*$/gm;
  let out = '';
  let last = 0;
  let m;
  while ((m = re.exec(body)) !== null) {
    out += renderMd(body.slice(last, m.index));
    const type = m[1].toLowerCase();
    const label = (lang === 'en' ? CALLOUTS_EN : CALLOUTS)[type] ?? type;
    const inner = renderMd(m[2]);
    out += `<aside class="callout callout-${type}"><p class="callout-label">${label}</p>${inner}</aside>\n`;
    last = re.lastIndex;
  }
  out += renderMd(body.slice(last));
  return out;
}

function parseChapter(raw, lang = 'fr') {
  const { data, content } = matter(raw);
  return {
    id: data.id,
    track: data.track ?? 'core',
    slug: data.slug,
    title: data.title,
    description: data.description ?? '',
    summary: data.summary ?? '',
    order: Number(data.order ?? 999),
    duration: data.duration ?? '',
    level: data.level ?? '',
    layer: data.layer ?? '',
    tags: data.tags ?? [],
    prerequisites: data.prerequisites ?? [],
    glossary: data.glossary ?? [],
    slides: data.slides ?? [],
    sources: data.sources ?? [],
    updated_on: data.updated_on ? String(data.updated_on) : '',
    software_verified_on: data.software_verified_on ? String(data.software_verified_on) : '',
    software_version: data.software_version ? String(data.software_version) : '',
    reviewed_on: data.reviewed_on ? String(data.reviewed_on) : '',
    reviewed_hash: data.reviewed_hash ?? '',
    review_type: data.review_type ?? '',
    review_pending: data.review_pending === true,
    status: data.status ?? '',
    quiz: data.quiz ?? [],
    steps: extractSteps(content, lang),
    translations: {}
  };
}

function rawLoader(globbed, file) {
  const pair = Object.entries(globbed).find(([key]) => key.endsWith('/' + file));
  return pair?.[1] ?? null;
}

async function readRaw(globbed, file) {
  const loader = rawLoader(globbed, file);
  if (!loader) return null;
  const raw = await loader();
  return typeof raw === 'string' ? raw : String(raw ?? '');
}

/**
 * Load one full FR chapter and its EN translation.
 * @param {string} slug
 */
export async function loadChapter(slug) {
  const meta = chapterIndex.find(chapter => chapter.slug === slug);
  if (!meta) return null;

  const raw = await readRaw(files, meta.sourceFile);
  if (!raw) return null;
  const chapter = parseChapter(raw, 'fr');

  const enFile = meta.translations?.en?.sourceFile;
  if (enFile) {
    const enRaw = await readRaw(enFiles, enFile);
    if (enRaw) chapter.translations = { en: parseChapter(enRaw, 'en') };
  }
  return chapter;
}

function extractSteps(content, lang = 'fr') {
  const blocks = [];
  const regex = /<!--\s*step:([^>]*)-->([\s\S]*?)<!--\s*\/step\s*-->/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    const meta = parseMeta(m[1]);
    const slides = meta.slides ? meta.slides.split(',').map(s => s.trim()).filter(Boolean) : [];
    blocks.push({
      title: meta.title ?? (lang === 'en' ? 'Step' : 'Étape'),
      html: renderBody(m[2].trim(), lang),
      slides,
      viz: meta.viz
    });
  }
  return blocks;
}

function renderMath(source) {
  const stash = [];
  const keep = m => {
    stash.push(m);
    return `${stash.length - 1}`;
  };
  const protectedSource = source
    .replace(/```[\s\S]*?```/g, keep)
    .replace(/`[^`\n]*`/g, keep);
  const rendered = protectedSource
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => {
      const html = katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false });
      return `\n<div class="math-rendered math-display">${html}</div>\n`;
    })
    .replace(/\$([^$\n]+?)\$/g, (_, tex) =>
      katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false })
    );
  return rendered.replace(/(\d+)/g, (_, i) => stash[Number(i)]);
}

function parseMeta(str) {
  const meta = {};
  const re = /(\w+)=["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(str)) !== null) meta[m[1]] = m[2];
  return meta;
}
