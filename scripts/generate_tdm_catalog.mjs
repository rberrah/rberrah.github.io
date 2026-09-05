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
const englishMetadataFile = path.join(root, 'static', 'tdm', 'model-i18n.en.json');

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

const drugLabelsEn = {
  amik: 'Amikacin',
  amox: 'Amoxicillin',
  cefazoline: 'Cefazolin',
  cefepime: 'Cefepime',
  ciclosporine: 'Cyclosporine',
  cobicistat: 'Cobicistat',
  dapto: 'Daptomycin',
  diltiazem: 'Diltiazem',
  erythromycine: 'Erythromycin',
  everolimus: 'Everolimus',
  fluconazole: 'Fluconazole',
  genta: 'Gentamicin',
  isavuconazole: 'Isavuconazole',
  levo: 'Levofloxacin',
  linez: 'Linezolid',
  posaconazole: 'Posaconazole',
  rifampicine: 'Rifampicin',
  ritonavir: 'Ritonavir',
  sirolimus: 'Sirolimus',
  tacrolimus: 'Tacrolimus',
  voriconazole: 'Voriconazole',
  amiodarone: 'Amiodarone',
  vanco: 'Vancomycin'
};

const populationTagEn = {
  'Adulte': 'Adult',
  'Âgé': 'Older adult',
  'Brûlé': 'Burn',
  'Cancer': 'Cancer',
  'Cardiologie': 'Cardiology',
  'CEC': 'CPB',
  'Chirurgie': 'Surgery',
  'Chirurgie orthopédique': 'Orthopedic surgery',
  'CRRT': 'CRRT',
  'Diabète': 'Diabetes',
  'Dialyse': 'Dialysis',
  'Endocardite': 'Endocarditis',
  'Hémodialyse': 'Hemodialysis',
  'Hors dialyse': 'Not on dialysis',
  'Hors ICU': 'Non-ICU',
  'Hors ICU non précisé': 'ICU status not specified',
  'Hospitalisé': 'Hospitalized',
  'ICU': 'ICU',
  'Infection fongique': 'Fungal infection',
  'Infection ostéo-articulaire': 'Bone and joint infection',
  'Insuffisance rénale': 'Renal impairment',
  'Néonatal': 'Neonatal',
  'Obèse': 'Obesity',
  'Pédiatrique': 'Pediatric',
  'Pneumonie': 'Pneumonia',
  'Population à confirmer': 'Population pending verification',
  'Population mixte': 'Mixed population',
  'Sepsis': 'Sepsis',
  'Transplantation rénale': 'Kidney transplantation',
  'Tuberculose': 'Tuberculosis',
  'Ventilé': 'Mechanically ventilated',
  'VIH': 'HIV',
  'Volontaire sain': 'Healthy volunteer'
};

const modelTypeEn = {
  'Module de sensibilité déterministe': 'Deterministic sensitivity module',
  'Module PK adapté': 'Adapted PK module',
  'Module PK déterministe': 'Deterministic PK module',
  'PK publié': 'Published PK',
  'PK publié adapté': 'Adapted published PK',
  'PopPK à vérifier': 'PopPK pending verification',
  'PopPK mécanistique adapté': 'Adapted mechanistic PopPK',
  'PopPK publié': 'Published PopPK',
  'PopPK publié adapté': 'Adapted published PopPK',
  'Prior PK à vérifier': 'PK prior pending verification'
};

const administrationModeLabels = {
  ORAL: { fr: 'Orale', en: 'Oral' },
  IV_INTERMITTENT: { fr: 'IV intermittente', en: 'Intermittent IV' },
  IV_CONTINUOUS: { fr: 'IV continue', en: 'Continuous IV' }
};

const additionallyAdaptedModels = new Set([
  'genta_hodiamont',
  'genta_rosario_clcr',
  'genta_rosario_clinical',
  'levo_gergs',
  'linez_sasaki'
]);

const drugKeys = Object.keys(drugLabels);

function titleCase(part) {
  if (part.toUpperCase() === 'IV') return 'IV';
  return `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`;
}

function administrationRoutes(code, stem) {
  const cmtBlock = code.match(
    /^\s*(?:\$CMT|\[CMT\])[^\r\n]*\r?\n([\s\S]*?)(?=^\s*(?:\$[A-Z]|\[[A-Z]+\])|(?![\s\S]))/m
  )?.[1] ?? '';
  const compartments = cmtBlock
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*([A-Za-z][A-Za-z0-9_]*)\s*:\s*(.*?)\s*\[([^\]]+)\]\s*$/))
    .filter(Boolean)
    .filter((match) => match[3].split(',').some((tag) => tag.trim() === 'ADM'))
    .map((match) => ({ name: match[1], description: match[2] }));

  if (!compartments.length) throw new Error(`No annotated [ADM] compartment found for ${stem}.`);

  const routeCompartments = {};
  for (const compartment of compartments) {
    const descriptor = `${compartment.name} ${compartment.description}`;
    const route = /oral|gut|depot|transit|absorp/i.test(descriptor) ? 'Oral' : 'IV';
    routeCompartments[route] ??= compartment.name;
  }

  const routes = ['IV', 'Oral'].filter((route) => routeCompartments[route]);
  return {
    routes,
    ivCmt: routeCompartments.IV ?? null,
    oralCmt: routeCompartments.Oral ?? null
  };
}

function administrationModes(routes, details, stem) {
  const defaults = routes.flatMap((route) => route === 'Oral' ? ['ORAL'] : ['IV_INTERMITTENT']);
  const modes = [...new Set(details.administrationModes ?? defaults)];
  const unknown = modes.filter((mode) => !administrationModeLabels[mode]);
  if (unknown.length) throw new Error(`Unknown administration mode for ${stem}: ${unknown.join(', ')}`);
  const modeRoutes = modes.map((mode) => mode === 'ORAL' ? 'Oral' : 'IV');
  if (modeRoutes.some((route) => !routes.includes(route)) || routes.some((route) => !modeRoutes.includes(route))) {
    throw new Error(`Administration modes do not cover the declared routes for ${stem}.`);
  }
  return {
    administrationModes: modes,
    administrationCategories: modes.map((mode) => administrationModeLabels[mode].fr),
    administrationCategoriesEn: modes.map((mode) => administrationModeLabels[mode].en)
  };
}

function implementationStatus(details, stem) {
  const adapted = additionallyAdaptedModels.has(stem) || /adapté|module/i.test(details.modelType);
  return adapted
    ? { implementationStatus: 'ADAPTED', implementationStatusLabel: 'Adaptation documentée', implementationStatusLabelEn: 'Documented adaptation' }
    : { implementationStatus: 'ARTICLE', implementationStatusLabel: "Implémentation de l'article", implementationStatusLabelEn: 'Article implementation' };
}

function parseModelFile(file, metadata, englishMetadata, code) {
  const stem = file.replace(/\.cpp$/i, '');
  const drugKey = drugKeys.find((key) => stem.startsWith(`${key}_`)) ?? stem.split('_')[0];
  const suffix = stem.slice(drugKey.length + 1);
  const model = suffix.split('_').filter((part) => part && part.toLowerCase() !== 'ddi').map(titleCase).join(' ');
  const drug = drugLabels[drugKey] ?? titleCase(drugKey);

  const details = metadata[stem];
  const english = englishMetadata[stem];
  if (!details) throw new Error(`Missing TDM metadata for ${stem}.`);
  if (!english?.population) throw new Error(`Missing English TDM population for ${stem}.`);
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
  const routeDetails = administrationRoutes(code, stem);
  const modeDetails = administrationModes(routeDetails.routes, details, stem);
  const implementationDetails = implementationStatus(details, stem);

  return {
    id: stem,
    file,
    drugKey,
    drug,
    drugEn: drugLabelsEn[drugKey] ?? drug,
    model: displayModel,
    format: 'mrgsolve/C++',
    href: `/tdm/models/${file}`,
    ...details,
    populationEn: english.population,
    populationTagsEn: (details.populationTags ?? []).map((tag) => populationTagEn[tag] ?? tag),
    modelTypeEn: modelTypeEn[details.modelType] ?? details.modelType,
    noteEn: english.note ?? '',
    ...routeDetails,
    ...modeDetails,
    ...implementationDetails,
    tags: Array.from(new Set([
      drug,
      model,
      details.modelType,
      details.citation,
      details.doi,
      english.population,
      drugLabelsEn[drugKey],
      ...routeDetails.routes,
      ...modeDetails.administrationModes,
      ...modeDetails.administrationCategories,
      ...modeDetails.administrationCategoriesEn,
      implementationDetails.implementationStatusLabel,
      implementationDetails.implementationStatusLabelEn,
      ...(details.populationTags ?? []),
      ...(details.populationTags ?? []).map((tag) => populationTagEn[tag] ?? tag)
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
  const englishMetadataDocument = JSON.parse(await fs.readFile(englishMetadataFile, 'utf8'));
  const englishMetadata = englishMetadataDocument.models ?? {};
  const allIds = new Set(allFiles.map((file) => file.replace(/\.cpp$/i, '')));
  const missingMetadata = [...allIds].filter((id) => !metadata[id]);
  if (missingMetadata.length) throw new Error(`Missing TDM metadata for: ${missingMetadata.join(', ')}`);

  const files = allFiles.filter((file) => metadata[file.replace(/\.cpp$/i, '')].listed !== false);
  const modelCode = new Map(await Promise.all(files.map(async (file) => [
    file,
    await fs.readFile(path.join(modelsDirectory, file), 'utf8')
  ])));
  const models = files.map((file) => parseModelFile(file, metadata, englishMetadata, modelCode.get(file)));
  const ids = new Set(models.map((model) => model.id));
  if (ids.size !== models.length) throw new Error('Duplicate TDM model identifiers detected.');
  const extraMetadata = Object.keys(metadata).filter((id) => !allIds.has(id));
  if (extraMetadata.length) throw new Error(`Metadata without a matching model: ${extraMetadata.join(', ')}`);

  const output = `${JSON.stringify({ version: 5, models }, null, 2)}\n`;
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
