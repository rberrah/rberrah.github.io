import { readFile } from 'node:fs/promises';

const metadata = JSON.parse(
  await readFile(new URL('../static/tdm/model-metadata.json', import.meta.url), 'utf8')
).models;
const catalog = JSON.parse(
  await readFile(new URL('../tdm-engine/models/catalog.json', import.meta.url), 'utf8')
).models;

function clean(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function comparable(value) {
  return clean(value).normalize('NFC').toLocaleLowerCase('en');
}

const failures = [];

for (const model of catalog) {
  const details = metadata[model.id];
  const endpoint = `https://api.crossref.org/works/${encodeURIComponent(details.doi)}`;

  try {
    const response = await fetch(endpoint, {
      headers: { 'User-Agent': 'TDMHub-reference-audit/1.0' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const work = (await response.json()).message;
    const year = work.published?.['date-parts']?.[0]?.[0]
      ?? work.issued?.['date-parts']?.[0]?.[0]
      ?? '';
    const firstAuthor = clean(work.author?.[0]?.family);
    const crossrefDoi = clean(work.DOI);

    if (comparable(model.model) !== comparable(firstAuthor)) {
      failures.push(`${model.id}: modèle ${model.model}, auteur Crossref ${firstAuthor}`);
    }
    if (comparable(details.doi) !== comparable(crossrefDoi)) {
      failures.push(`${model.id}: DOI ${details.doi}, DOI Crossref ${crossrefDoi}`);
    }

    console.log([
      model.id,
      model.model,
      firstAuthor,
      crossrefDoi,
      year,
      clean(work.volume),
      clean(work.page ?? work['article-number']),
      clean(work['short-container-title']?.[0] ?? work['container-title']?.[0]),
      clean(work.title?.[0])
    ].join('\t'));
  } catch (error) {
    failures.push(`${model.id}: ${error.message}`);
    console.log([
      model.id,
      model.model,
      'LOOKUP_ERROR',
      details.doi,
      error.message
    ].join('\t'));
  }
}

if (failures.length) {
  console.error(`\nReference audit failed (${failures.length}):\n${failures.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`\nReference audit OK: ${catalog.length}/${catalog.length} displayed names and DOIs match Crossref.`);
}
