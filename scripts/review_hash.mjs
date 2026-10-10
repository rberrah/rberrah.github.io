import { createHash } from 'node:crypto';
import matter from 'gray-matter';

const reviewFields = new Set(['reviewed_on', 'review_type', 'reviewed_hash']);

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
