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
  if (!details.citation || !details.doi) {
    throw new Error(`Missing primary article citation or DOI for ${stem}.`);
  }
  if (!/^10\.\d{4,9}\//i.test(details.doi)) throw new Error(`Invalid DOI for ${stem}: ${details.doi}`);

  const displayModel = details.model ?? model;
  if (!details.citation.toLocaleLowerCase('fr').startsWith(displayModel.toLocaleLowerCase('fr'))) {
    throw new Error(`Displayed model name must match the citation first author for ${stem}.`);
  }
  if (details.sourceStatus === 'secondary') {
    throw new Error(`Secondary references cannot be published in the TDM catalog: ${stem}.`);
  }

  return {
    id: stem,
    file,
    drugKey,
    drug,
    model: displayModel,
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
  const allFiles = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.cpp'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, 'en'));

  if (!allFiles.length) throw new Error(`No .cpp model found in ${modelsDirectory}`);

  for (const file of allFiles) {
    const filePath = path.join(modelsDirectory, file);
    const code = await fs.readFile(filePath, 'utf8');
    const normalized = code.replace(/[ \t]+$/gm, '');
    if (normalized !== code) await fs.writeFile(filePath, normalized, 'utf8');
  }

  const metadataDocument = JSON.parse(await fs.readFile(metadataFile, 'utf8'));
  const metadata = metadataDocument.models ?? {};
  const allIds = new Set(allFiles.map((file) => file.replace(/\.cpp$/i, '')));
  const missingMetadata = [...allIds].filter((id) => !metadata[id]);
  if (missingMetadata.length) throw new Error(`Missing TDM metadata for: ${missingMetadata.join(', ')}`);

  const files = allFiles.filter((file) => metadata[file.replace(/\.cpp$/i, '')].listed !== false);
  const models = files.map((file) => parseModelFile(file, metadata));
  const ids = new Set(models.map((model) => model.id));
  if (ids.size !== models.length) throw new Error('Duplicate TDM model identifiers detected.');
  const extraMetadata = Object.keys(metadata).filter((id) => !allIds.has(id));
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
