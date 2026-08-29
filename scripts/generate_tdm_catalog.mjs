import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

await import('./generate_ddi_tdm_models.mjs');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const modelsDirectory = path.join(root, 'static', 'tdm', 'models');
const outputFile = path.join(root, 'src', 'lib', 'content', 'tdmModels.generated.json');
const engineModelsDirectory = path.join(root, 'tdm-engine', 'models');
const engineCatalogFile = path.join(engineModelsDirectory, 'catalog.json');
const metadataFile = path.join(root, 'static', 'tdm', 'model-metadata.json');

const drugLabels = {
  amik: 'Amikacine',
  amox: 'Amoxicilline',
  cefazoline: 'Cefazoline',
  cefepime: 'Cefepime',
  ciclosporine: 'Ciclosporine',
  cobicistat: 'Cobicistat',
  dapto: 'Daptomycine',
  diltiazem: 'Diltiazem',
  erythromycine: 'Érythromycine',
  everolimus: 'Évérolimus',
  fluconazole: 'Fluconazole',
  genta: 'Gentamicine',
  isavuconazole: 'Isavuconazole',
  levo: 'Levofloxacine',
  linez: 'Linezolide',
  posaconazole: 'Posaconazole',
  rifampicine: 'Rifampicine',
  ritonavir: 'Ritonavir',
  sirolimus: 'Sirolimus',
  tacrolimus: 'Tacrolimus',
  voriconazole: 'Voriconazole',
  amiodarone: 'Amiodarone',
  vanco: 'Vancomycine'
};

const drugKeys = Object.keys(drugLabels);

function titleCase(part) {
  if (part.toUpperCase() === 'IV') return 'IV';
  return `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`;
}

function parseModelFile(file, metadata) {
  const stem = file.replace(/\.cpp$/i, '');
  const drugKey = drugKeys.find((key) => stem.startsWith(`${key}_`)) ?? stem.split('_')[0];
  const suffix = stem.slice(drugKey.length + 1);
  const model = suffix.split('_').filter((part) => part && part.toLowerCase() !== 'ddi').map(titleCase).join(' ');
  const drug = drugLabels[drugKey] ?? titleCase(drugKey);

  const details = metadata[stem];
  if (!details) throw new Error(`Missing TDM metadata for ${stem}.`);
  if ('provenance' in details) throw new Error(`Application provenance is not an article source: ${stem}.`);
  if (!details.citation || (!details.doi && !details.sourceUrl)) {
    throw new Error(`Missing article citation or stable article link for ${stem}.`);
  }

  return {
    id: stem,
    file,
    drugKey,
    drug,
    model,
    format: 'mrgsolve/C++',
    href: `/tdm/models/${file}`,
    ...details,
    tags: Array.from(new Set([
      drug,
      model,
      details.modelType,
      details.citation,
      details.doi,
      ...(details.populationTags ?? [])
    ].filter(Boolean)))
  };
}

async function main() {
  const entries = await fs.readdir(modelsDirectory, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.cpp'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, 'en'));

  if (!files.length) throw new Error(`No .cpp model found in ${modelsDirectory}`);

  for (const file of files) {
    const filePath = path.join(modelsDirectory, file);
    const code = await fs.readFile(filePath, 'utf8');
    const normalized = code.replace(/[ \t]+$/gm, '');
    if (normalized !== code) await fs.writeFile(filePath, normalized, 'utf8');
  }

  const metadataDocument = JSON.parse(await fs.readFile(metadataFile, 'utf8'));
  const metadata = metadataDocument.models ?? {};
  const models = files.map((file) => parseModelFile(file, metadata));
  const ids = new Set(models.map((model) => model.id));
  if (ids.size !== models.length) throw new Error('Duplicate TDM model identifiers detected.');
  const extraMetadata = Object.keys(metadata).filter((id) => !ids.has(id));
  if (extraMetadata.length) throw new Error(`Metadata without a matching model: ${extraMetadata.join(', ')}`);

  const output = `${JSON.stringify({ version: 3, models }, null, 2)}\n`;
  const previous = await fs.readFile(outputFile, 'utf8').catch(() => '');
  if (previous !== output) await fs.writeFile(outputFile, output, 'utf8');

  await fs.mkdir(engineModelsDirectory, { recursive: true });
  const engineEntries = await fs.readdir(engineModelsDirectory, { withFileTypes: true });
  for (const entry of engineEntries) {
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.cpp') && !files.includes(entry.name)) {
      await fs.unlink(path.join(engineModelsDirectory, entry.name));
    }
  }
  for (const file of files) {
    await fs.copyFile(path.join(modelsDirectory, file), path.join(engineModelsDirectory, file));
  }
  const previousEngineCatalog = await fs.readFile(engineCatalogFile, 'utf8').catch(() => '');
  if (previousEngineCatalog !== output) await fs.writeFile(engineCatalogFile, output, 'utf8');

  console.log(`TDM catalog OK: ${models.length} models indexed and synced to the R engine.`);
}

await main();
