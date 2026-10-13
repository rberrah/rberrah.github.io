import { createHash } from 'node:crypto';
import matter from 'gray-matter';

const reviewFields = new Set(['reviewed_on', 'review_type', 'reviewed_hash', 'software_freshness_version']);

function normalizeText(value) {
  return value.replace(/\r\n/g, '\n').trimEnd() + '\n';
}

export function chapterReviewHash(raw) {
  const { data, content } = matter(raw);
  const scientificMetadata = Object.fromEntries(
    Object.entries(data).filter(([key]) => !reviewFields.has(key))
  );
  return createHash('sha256')
    .update(JSON.stringify(scientificMetadata))
    .update('\n---CONTENT---\n')
    .update(normalizeText(content))
    .digest('hex');
}

export function visualizationReviewHash(raw, description) {
  const localizedDescription = {
    fr: String(description?.fr ?? ''),
    en: String(description?.en ?? '')
  };
  return createHash('sha256')
    .update(normalizeText(raw))
    .update('\n---DESCRIPTION---\n')
    .update(JSON.stringify(localizedDescription))
    .digest('hex');
}

export function crossDomainReviewHash(lesson, language) {
  const content = {
    id: lesson.id,
    minutes: lesson.minutes,
    title: lesson.title[language],
    tagline: lesson.tagline[language],
    steps: lesson.steps[language],
    takeaway: lesson.takeaway[language],
    quiz: lesson.quiz[language],
    links: lesson.links.map(link => ({ slug: link.slug, label: link.label[language] })),
    sources: lesson.sources.map(source => ({ citation: source.citation, url: source.url, note: source.note[language] }))
  };
  return createHash('sha256').update(JSON.stringify(content)).digest('hex');
}
