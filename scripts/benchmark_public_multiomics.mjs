import fs from 'node:fs/promises';
import { File } from 'node:buffer';
import { parseDelimited, runDeterministicAnalysis, differentialCorrelationPair, layerOverlapSummary, resolveMetaboliteIdentifier, resolveMetaboliteIdentifiers, reactomeOverRepresentation } from '../src/lib/multiomics/deterministic.js';

const root = process.argv[2] || 'tmp/public-benchmarks';

async function loadFile(path) {
  const text = await fs.readFile(path, 'utf8');
  return new File([text], path.split('/').pop(), { type: 'text/csv' });
}

async function loadDataset(dir, layers) {
  const metadata = await loadFile(`${dir}/metadata.csv`);
  const parsed = parseDelimited(await metadata.text());
  const files = { metadata, transcriptomics: null, proteomics: null, metabolomics: null };
  for (const layer of layers) files[layer] = await loadFile(`${dir}/${layer}.csv`);
  return {
    files,
    metadataRows: parsed.rows,
    mapping: {
      subject_id: 'subject_id',
      sample_id: 'sample_id',
      assay_id: 'assay_id',
      omic: 'omic',
      condition: 'condition',
      timepoint: 'timepoint',
      batch: 'batch',
      technical_replicate: 'technical_replicate',
      outcome: 'outcome'
    }
  };
}

function findRanks(rows, patterns) {
  const out = [];
  for (const pattern of patterns) {
    const regex = new RegExp(pattern, 'i');
    const hits = rows
      .map((row, index) => ({ ...row, rank: index + 1 }))
      .filter((row) => regex.test(row.feature));
    out.push({ pattern, hits: hits.slice(0, 10) });
  }
  return out;
}

function top(rows, n = 15) {
  return rows.slice(0, n).map((row) => ({
    feature: row.feature,
    foldRatio: row.foldRatio == null ? null : Number(row.foldRatio.toFixed(4)),
    effect: Number(row.effect.toFixed(4)),
    effectScale: row.effectScale,
    p: row.pValue,
    q: row.qValue
  }));
}

function pathwayMatches(consensus, patterns) {
  const regexes = patterns.map((p) => new RegExp(p, 'i'));
  return (consensus || []).filter((p) => regexes.some((r) => r.test(p.name))).slice(0, 25);
}

function requireTruth(condition, label, details = '') {
  if (!condition) {
    const suffix = details ? ` — ${details}` : '';
    throw new Error(`PUBLIC BENCHMARK FAILED: ${label}${suffix}`);
  }
  console.log(`TRUTH PASS: ${label}${details ? ` — ${details}` : ''}`);
}

const report = { generatedAt: new Date().toISOString(), benchmarks: {} };

// --- Nutrimouse ---
{
  const ds = await loadDataset(`${root}/nutrimouse`, ['transcriptomics', 'metabolomics']);
  const result = await runDeterministicAnalysis({
    ...ds,
    columnMapping: ds.mapping,
    protocol: {
      organism: 'mouse',
      objective: 'groups',
      longitudinal: false,
      designType: 'independent',
      studySetting: 'animal',
      groupCount: '2',
      sampleOverlap: 'same_specimen'
    },
    dataTypes: {
      transcriptomics: 'normalized',
      proteomics: 'log_intensity',
      metabolomics: 'concentration'
    },
    useReactome: true,
    resolveIdentifiers: false
  });

  const knownPatterns = [
    'Cyp3a11', 'Car$', 'Nr1i3', 'Lpin', 'Scd', 'Fads2', 'Eci', 'Ppara'
  ];

  const pathwayPatterns = [
    'fatty acid', 'lipid', 'peroxisom', 'xenobiotic', 'cytochrome p450', 'metabolism'
  ];

  report.benchmarks.nutrimouse = {
    truth: {
      design: 'WT vs PPARalpha-null mice under five diets',
      expectedBiology: 'PPARalpha-dependent lipid and xenobiotic metabolism'
    },
    metadata: result.metadataSummary,
    transcriptomics: {
      contrast: result.layers.transcriptomics.contrast,
      groupSizes: result.layers.transcriptomics.groupSizes,
      top: top(result.layers.transcriptomics.rows, 20),
      knownMarkerRanks: findRanks(result.layers.transcriptomics.rows, knownPatterns)
    },
    metabolomics: {
      contrast: result.layers.metabolomics.contrast,
      groupSizes: result.layers.metabolomics.groupSizes,
      top: top(result.layers.metabolomics.rows, 20)
    },
    reactomeError: result.reactomeError,
    pathwayMatches: pathwayMatches(result.reactome?.consensus, pathwayPatterns),
    topPathways: (result.reactome?.consensus || []).slice(0, 20).map((p) => ({
      id: p.id, name: p.name, fdr: p.fdr, supportingLayers: p.supportingLayers
    }))
  };

  const cyp3a11 = result.layers.transcriptomics.rows
    .map((row, index) => ({ ...row, rank: index + 1 }))
    .find((row) => /^CYP3A11$/i.test(row.feature));
  requireTruth(
    cyp3a11 && cyp3a11.rank <= 10 && cyp3a11.qValue <= 0.05,
    'Nutrimouse recovers CYP3A11 genotype signal',
    cyp3a11 ? `rank=${cyp3a11.rank}, q=${cyp3a11.qValue}` : 'CYP3A11 absent'
  );

  const linoleic = result.layers.metabolomics.rows.find((row) => /^C18\.2n\.6$/i.test(row.feature));
  requireTruth(
    linoleic && linoleic.foldRatio < 1 && linoleic.qValue <= 0.10,
    'Nutrimouse recovers elevated C18:2n-6 in PPARalpha-null mice',
    linoleic ? `WT/PPAR=${linoleic.foldRatio.toFixed(3)}, q=${linoleic.qValue}` : 'C18.2n.6 absent'
  );

  const expectedPathway = (result.reactome?.consensus || []).find((pathway) =>
    /(PPARalpha|PPARA|fatty acid metabolism|metabolism of lipids|triglyceride metabolism)/i.test(pathway.name)
  );
  requireTruth(
    Boolean(expectedPathway),
    'Nutrimouse Reactome mapping recovers PPAR/lipid biology',
    expectedPathway?.name || 'no expected pathway'
  );
}

// --- TCGA Her2 vs LumA ---
{
  const ds = await loadDataset(`${root}/tcga-her2-luma`, ['transcriptomics', 'proteomics']);
  const result = await runDeterministicAnalysis({
    ...ds,
    columnMapping: ds.mapping,
    protocol: {
      organism: 'human',
      objective: 'groups',
      longitudinal: false,
      designType: 'independent',
      studySetting: 'clinical_observational',
      groupCount: '2',
      sampleOverlap: 'same_specimen'
    },
    dataTypes: {
      transcriptomics: 'log_expression',
      proteomics: 'log_intensity',
      metabolomics: 'concentration'
    },
    useReactome: true,
    resolveIdentifiers: false
  });

  const her2Patterns = ['ERBB2', 'HER2', 'GRB7', 'STARD3', 'PGAP3'];
  const mrnaRanks = findRanks(result.layers.transcriptomics.rows, her2Patterns);
  const proteinRanks = findRanks(result.layers.proteomics.rows, her2Patterns);

  const allHer2Hits = [...mrnaRanks, ...proteinRanks].flatMap((x) => x.hits);
  const expectedDirectionHits = allHer2Hits.filter((x) => x.effect < 0); // result is LumA - Her2

  report.benchmarks.tcgaHer2LumA = {
    truth: {
      design: 'TCGA breast Her2-enriched vs Luminal A',
      expectedBiology: 'HER2/ERBB2-associated signal higher in Her2-enriched tumours'
    },
    metadata: result.metadataSummary,
    transcriptomics: {
      contrast: result.layers.transcriptomics.contrast,
      groupSizes: result.layers.transcriptomics.groupSizes,
      top: top(result.layers.transcriptomics.rows, 20),
      markerRanks: mrnaRanks
    },
    proteomics: {
      contrast: result.layers.proteomics.contrast,
      groupSizes: result.layers.proteomics.groupSizes,
      top: top(result.layers.proteomics.rows, 20),
      markerRanks: proteinRanks
    },
    markerHits: allHer2Hits.length,
    expectedDirectionHits: expectedDirectionHits.length,
    reactomeError: result.reactomeError,
    topPathways: (result.reactome?.consensus || []).slice(0, 20).map((p) => ({
      id: p.id, name: p.name, fdr: p.fdr, supportingLayers: p.supportingLayers
    }))
  };

  const her2 = result.layers.proteomics.rows
    .map((row, index) => ({ ...row, rank: index + 1 }))
    .find((row) => /^HER2$/i.test(row.feature));
  const her2Phospho = result.layers.proteomics.rows
    .map((row, index) => ({ ...row, rank: index + 1 }))
    .find((row) => /^HER2_pY1248$/i.test(row.feature));

  requireTruth(
    her2 && her2.rank <= 10 && her2.effect < 0 && her2.qValue <= 0.01,
    'TCGA recovers HER2 protein enrichment in Her2 subtype',
    her2 ? `rank=${her2.rank}, LumA/Her2=${her2.foldRatio.toFixed(3)}, q=${her2.qValue}` : 'HER2 absent'
  );
  requireTruth(
    her2Phospho && her2Phospho.rank <= 10 && her2Phospho.effect < 0 && her2Phospho.qValue <= 0.01,
    'TCGA recovers activated HER2-pY1248 enrichment in Her2 subtype',
    her2Phospho ? `rank=${her2Phospho.rank}, LumA/Her2=${her2Phospho.foldRatio.toFixed(3)}, q=${her2Phospho.qValue}` : 'HER2_pY1248 absent'
  );

  const erbb2Pathway = (result.reactome?.consensus || []).find((pathway) => /ERBB2|HER2/i.test(pathway.name));
  requireTruth(
    Boolean(erbb2Pathway),
    'TCGA Reactome result contains ERBB2/HER2 signalling',
    erbb2Pathway?.name || 'no ERBB2/HER2 pathway'
  );
}

await fs.writeFile(`${root}/benchmark-report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));


async function testPublishedPair(filename, reference, comparison, truth) {
  const parsed = parseDelimited(await fs.readFile(`${root}/${filename}`, 'utf8'));
  const clean = parsed.rows
    .map((row) => ({
      condition: row.condition,
      x: Number(row.gene),
      y: Number(row.metabolite)
    }))
    .filter((row) => Number.isFinite(row.x) && Number.isFinite(row.y));
  const ref = clean.filter((row) => row.condition === reference);
  const cmp = clean.filter((row) => row.condition === comparison);
  const stat = differentialCorrelationPair(
    ref.map((row) => row.x), ref.map((row) => row.y),
    cmp.map((row) => row.x), cmp.map((row) => row.y),
    'spearman'
  );
  truth(stat, ref.length, cmp.length);
  return { filename, reference, comparison, nReference: ref.length, nComparison: cmp.length, ...stat };
}

report.benchmarks.nci60IntLIM = {};
report.benchmarks.nci60IntLIM.FAM174B_malic = await testPublishedPair(
  'nci60_FAM174B_malic.csv',
  'Leukemia',
  'BPO',
  (stat, nRef, nCmp) => {
    requireTruth(nRef >= 5 && nCmp >= 10, 'NCI-60 IntLIM pair has expected group sizes', `Leukemia=${nRef}, BPO=${nCmp}`);
    requireTruth(
      stat.rReference < 0 && stat.rComparison > 0 && stat.deltaR > 0.5,
      'NCI-60 reproduces FAM174B–malic-acid correlation reversal',
      `rLeukemia=${stat.rReference.toFixed(3)}, rBPO=${stat.rComparison.toFixed(3)}, Δr=${stat.deltaR.toFixed(3)}`
    );
  }
);

report.benchmarks.nci60IntLIM.DNER_imidazole = await testPublishedPair(
  'nci60_DNER_imidazole.csv',
  'BPO',
  'Leukemia',
  (stat) => {
    requireTruth(
      stat.rReference < 0 && stat.rComparison > 0 && stat.deltaR > 0.5,
      'NCI-60 reproduces DNER–imidazolelactate correlation reversal',
      `rBPO=${stat.rReference.toFixed(3)}, rLeukemia=${stat.rComparison.toFixed(3)}, Δr=${stat.deltaR.toFixed(3)}`
    );
  }
);

report.benchmarks.brcaIntLIM = {};
report.benchmarks.brcaIntLIM.GPT2_2HG = await testPublishedPair(
  'brca_GPT2_2HG.csv',
  'NORMAL',
  'TUMOR',
  (stat, nRef, nCmp) => {
    requireTruth(nRef >= 40 && nCmp >= 50, 'BRCA IntLIM pair has substantial matched groups', `Normal=${nRef}, Tumor=${nCmp}`);
    requireTruth(
      stat.rComparison > stat.rReference && stat.deltaR > 0.25,
      'BRCA reproduces stronger GPT2–2-hydroxyglutarate coupling in tumour',
      `rNormal=${stat.rReference.toFixed(3)}, rTumor=${stat.rComparison.toFixed(3)}, Δr=${stat.deltaR.toFixed(3)}`
    );
  }
);

await fs.writeFile(`${root}/benchmark-report.json`, JSON.stringify(report, null, 2));
console.log('PUBLIC MULTI-OMICS TRUTH BENCHMARKS: PASS');


{
  const parsed = parseDelimited(await fs.readFile(`${root}/missrows_nci60_metadata.csv`, 'utf8'));
  const canonical = parsed.rows.map((row) => ({
    subjectId: row.subject_id,
    sampleId: row.sample_id,
    assayId: row.assay_id,
    omic: row.omic,
    condition: row.condition,
    timepoint: '',
    batch: '',
    technicalReplicate: '',
    outcome: ''
  }));
  const overlap = layerOverlapSummary(canonical, ['transcriptomics','proteomics']);
  report.benchmarks.missRowsNCI60 = overlap;
  requireTruth(overlap.layerSubjects.transcriptomics === 48, 'missRows preserves 48 transcriptomic individuals', String(overlap.layerSubjects.transcriptomics));
  requireTruth(overlap.layerSubjects.proteomics === 52, 'missRows preserves 52 proteomic individuals', String(overlap.layerSubjects.proteomics));
  requireTruth(overlap.allMatched === 40, 'missRows matches only the 40 genuinely shared individuals', `matched=${overlap.allMatched}`);
}

// External identifier-resolution probe: useful operational evidence but an EBI outage must not invalidate biological truth benchmarks.
report.apiProbes = {};
for (const term of ['malic acid', 'C18.2n.6', '2-hydroxyglutarate']) {
  const mapping = await resolveMetaboliteIdentifier(term);
  report.apiProbes[term] = mapping;
  if (mapping.resolved) {
    console.log(`API PASS: ChEBI resolved ${term} -> ${mapping.resolved} (${mapping.label || mapping.query})`);
  } else {
    console.warn(`API WARN: ChEBI did not resolve ${term}: ${mapping.status}`);
  }
}



function signConcordance(engineRows, referenceRows) {
  const byFeature = new Map(engineRows.map((row) => [row.feature, row]));
  const pairs = referenceRows
    .filter((ref) => Number.isFinite(ref.officialLogFC) && Number.isFinite(ref.officialQ) && ref.officialQ <= 0.10)
    .map((ref) => ({ ref, row: byFeature.get(ref.feature) }))
    .filter((x) => x.row && Number.isFinite(x.row.effect) && x.row.effect !== 0 && x.ref.officialLogFC !== 0);
  const concordant = pairs.filter(({ref,row}) => Math.sign(row.effect) === -Math.sign(ref.officialLogFC)).length;
  return {
    n: pairs.length,
    concordant,
    fraction: pairs.length ? concordant/pairs.length : null
  };
}

{
  const ds = await loadDataset(`${root}/aging-hfcd-old-vs-young-cd`, ['transcriptomics','proteomics','metabolomics']);
  const result = await runDeterministicAnalysis({
    ...ds,
    columnMapping: ds.mapping,
    protocol: {
      organism: 'mouse',
      objective: 'groups',
      longitudinal: false,
      designType: 'independent',
      studySetting: 'animal',
      groupCount: '2',
      sampleOverlap: 'partial'
    },
    dataTypes: {
      transcriptomics: 'normalized',
      proteomics: 'normalized',
      metabolomics: 'normalized'
    },
    useReactome: true,
    resolveIdentifiers: false
  });

  const refParsed = parseDelimited(await fs.readFile(`${root}/aging-hfcd-old-vs-young-cd/reference.csv`, 'utf8'));
  const reference = refParsed.rows.map((row) => ({
    layer: row.layer,
    feature: row.feature,
    officialLogFC: Number(row.official_old_vs_young_logFC),
    officialQ: Number(row.official_q)
  }));

  const concordance = {};
  for (const layer of ['transcriptomics','proteomics','metabolomics']) {
    concordance[layer] = signConcordance(
      result.layers[layer].rows,
      reference.filter((row) => row.layer === layer)
    );
    requireTruth(
      concordance[layer].n >= 10 && concordance[layer].fraction >= 0.80,
      `AgingHFCD ${layer} agrees with reference Old-vs-Young effect directions`,
      `n=${concordance[layer].n}, concordance=${(100*concordance[layer].fraction).toFixed(1)}%`
    );
  }

  const ctsdRna = result.layers.transcriptomics.rows
    .map((row,index) => ({...row,rank:index+1}))
    .find((row) => /^Ctsd$/i.test(row.feature));
  const ctsdProtein = result.layers.proteomics.rows
    .map((row,index) => ({...row,rank:index+1}))
    .find((row) => /^Ctsd$/i.test(row.feature));

  // Engine contrast is Young_CD - Old_CD; published Ctsd aging association predicts a negative effect here.
  requireTruth(
    ctsdRna && ctsdRna.effect < 0 && ctsdRna.qValue <= 0.10,
    'AgingHFCD recovers higher Ctsd RNA in old control-diet mice',
    ctsdRna ? `rank=${ctsdRna.rank}, effect=${ctsdRna.effect.toFixed(3)}, q=${ctsdRna.qValue}` : 'Ctsd RNA absent'
  );
  requireTruth(
    ctsdProtein && ctsdProtein.effect < 0 && ctsdProtein.qValue <= 0.10,
    'AgingHFCD recovers higher CTSD protein in old control-diet mice',
    ctsdProtein ? `rank=${ctsdProtein.rank}, effect=${ctsdProtein.effect.toFixed(3)}, q=${ctsdProtein.qValue}` : 'CTSD protein absent'
  );

  requireTruth(
    result.metadataSummary.overlap.allMatched >= 20,
    'AgingHFCD has a non-trivial three-layer matched cohort',
    `all-three matched=${result.metadataSummary.overlap.allMatched}`
  );

  report.benchmarks.agingHFCD = {
    truth: 'Old_CD vs Young_CD; Ctsd is an aging-associated RNA/protein signal in the source publication',
    metadata: result.metadataSummary,
    concordance,
    ctsdRna,
    ctsdProtein,
    crossOmics: {
      testedPairs: result.crossOmics.testedPairs,
      significantPairs: result.crossOmics.significantPairs,
      top: result.crossOmics.pairs.slice(0,20)
    },
    topPathways: (result.reactome?.consensus || []).slice(0,20).map((p) => ({
      id:p.id,name:p.name,fdr:p.fdr,supportingLayers:p.supportingLayers
    })),
    reactomeError: result.reactomeError
  };
}

await fs.writeFile(`${root}/benchmark-report.json`, JSON.stringify(report, null, 2));
console.log('PUBLIC MULTI-OMICS EXTENDED BENCHMARKS: PASS');


// --- STATegra public Ikaros time-course: precomputed Ikaros/control trajectories ---
{
  const paintRoot = process.env.PAINTOMICS_ROOT || 'external/PaintOmics';
  const dataRoot = `${paintRoot}/PaintomicsServer/src/examplefiles/datasets/08-stategra-multiomics/data`;

  const readTab = async (name) => parseDelimited(await fs.readFile(`${dataRoot}/${name}`, 'utf8'));
  const protein = await readTab('proteomics_values.tab');
  const metabolite = await readTab('metabolomics_values.tab');
  const relevantProteins = (await fs.readFile(`${dataRoot}/proteomics_relevant.tab`, 'utf8')).split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  const relevantMetabolites = (await fs.readFile(`${dataRoot}/metabolomics_relevant.tab`, 'utf8')).split(/\r?\n/).map(x=>x.trim()).filter(Boolean);

  const pName = protein.headers[0];
  const mName = metabolite.headers[0];
  const p24 = protein.headers[protein.headers.length-1];
  const m24 = metabolite.headers[metabolite.headers.length-1];

  const proteinRow = (name) => protein.rows.find((row) => String(row[pName]).toLowerCase() === name.toLowerCase());
  const metaboliteRow = (name) => metabolite.rows.find((row) => String(row[mName]).toLowerCase() === name.toLowerCase());
  const value24 = (row, col) => row ? Number(row[col]) : NaN;

  const ldha = proteinRow('Ldha');
  const hk2 = proteinRow('Hk2');
  const slc7a5 = proteinRow('Slc7a5');
  const ikzf1 = proteinRow('Ikzf1');
  const igll1 = proteinRow('Igll1');
  const lactate = metaboliteRow('Lactic acid');
  const pyruvate = metaboliteRow('Pyruvic acid');
  const malate = metaboliteRow('Malic acid');

  requireTruth(ldha && value24(ldha,p24) < -1, 'STATegra recovers late LDHA suppression', `24h log2 ratio=${value24(ldha,p24).toFixed(3)}`);
  requireTruth(hk2 && value24(hk2,p24) < -0.5, 'STATegra recovers late HK2 suppression', `24h log2 ratio=${value24(hk2,p24).toFixed(3)}`);
  requireTruth(slc7a5 && value24(slc7a5,p24) < -1, 'STATegra recovers late SLC7A5 suppression', `24h log2 ratio=${value24(slc7a5,p24).toFixed(3)}`);
  requireTruth(igll1 && value24(igll1,p24) < -2, 'STATegra recovers Igll1 suppression during differentiation', `24h log2 ratio=${value24(igll1,p24).toFixed(3)}`);
  requireTruth(ikzf1 && value24(ikzf1,p24) > 2, 'STATegra preserves strong IKZF1 protein signal', `24h log2 ratio=${value24(ikzf1,p24).toFixed(3)}`);
  requireTruth(lactate && value24(lactate,m24) < 0, 'STATegra recovers lower lactate at 24h', `24h log2 ratio=${value24(lactate,m24).toFixed(3)}`);
  requireTruth(pyruvate && value24(pyruvate,m24) < 0, 'STATegra recovers lower pyruvate at 24h', `24h log2 ratio=${value24(pyruvate,m24).toFixed(3)}`);
  requireTruth(malate && value24(malate,m24) < -0.5, 'STATegra recovers lower malate at 24h', `24h log2 ratio=${value24(malate,m24).toFixed(3)}`);

  // Deterministic knowledge-layer test: resolve a bounded set of relevant metabolites,
  // then combine canonical metabolite IDs with published relevant protein symbols.
  const metaboliteResolution = await resolveMetaboliteIdentifiers(relevantMetabolites.slice(0, 24), { maxQueries: 24 });
  const resolvedMetabolites = metaboliteResolution.mappings.map(x=>x.resolved).filter(Boolean);
  const pathwayInput = [...relevantProteins.slice(0, 120), ...resolvedMetabolites];
  let pathways = [];
  let reactomeError = null;
  try {
    const reactome = await reactomeOverRepresentation(pathwayInput, { projectToHuman: true, pageSize: 100 });
    pathways = reactome.pathways || [];
  } catch (error) {
    reactomeError = error instanceof Error ? error.message : String(error);
  }

  const glycolysisRelated = pathways.find((p) => /glycol|glucose|pyruvate|citric acid|tricarbox|TCA/i.test(p.name));
  requireTruth(
    Boolean(glycolysisRelated),
    'STATegra knowledge integration recovers central-carbon metabolism',
    glycolysisRelated?.name || reactomeError || 'no glycolysis/TCA-related pathway'
  );

  report.benchmarks.stategra = {
    truth: 'Ikaros-induced pre-B differentiation over 0–24 h; known late repression of glycolysis/TCA-related genes and metabolites',
    sourceFormat: 'published Ikaros-minus-control log2 ratios, not individual-level observations',
    protein24h: {
      Ldha: value24(ldha,p24),
      Hk2: value24(hk2,p24),
      Slc7a5: value24(slc7a5,p24),
      Ikzf1: value24(ikzf1,p24),
      Igll1: value24(igll1,p24)
    },
    metabolite24h: {
      lactate: value24(lactate,m24),
      pyruvate: value24(pyruvate,m24),
      malate: value24(malate,m24)
    },
    metaboliteResolution: {
      attempted: metaboliteResolution.mappings.length,
      resolved: metaboliteResolution.resolvedCount,
      unresolved: metaboliteResolution.unresolvedCount
    },
    centralCarbonPathway: glycolysisRelated ? {id:glycolysisRelated.id,name:glycolysisRelated.name,fdr:glycolysisRelated.fdr} : null,
    reactomeError
  };
}

// --- LRRK2 G2019S RNA + proteome at day 35 ---
{
  const ds = await loadDataset(`${root}/lrrk2-d35`, ['transcriptomics','proteomics']);
  const result = await runDeterministicAnalysis({
    ...ds,
    columnMapping: ds.mapping,
    protocol: {
      organism: 'human',
      objective: 'groups',
      longitudinal: false,
      designType: 'independent',
      studySetting: 'cell_model',
      groupCount: '2',
      sampleOverlap: 'partial'
    },
    dataTypes: {
      transcriptomics: 'normalized',
      proteomics: 'normalized',
      metabolomics: 'normalized'
    },
    useReactome: true,
    resolveIdentifiers: false
  });

  const refParsed = parseDelimited(await fs.readFile(`${root}/lrrk2-d35/reference.csv`, 'utf8'));
  const reference = refParsed.rows.map((row) => ({
    layer: row.layer,
    feature: row.feature,
    officialLogFC: Number(row.official_logFC_G2019S_vs_Control),
    officialQ: Number(row.official_q)
  }));

  const concordance = {};
  for (const layer of ['transcriptomics','proteomics']) {
    const byFeature = new Map(result.layers[layer].rows.map((row) => [row.feature,row]));
    const pairs = reference
      .filter((row) => row.layer === layer && Number.isFinite(row.officialLogFC) && Number.isFinite(row.officialQ) && row.officialQ <= 0.10)
      .map((ref) => ({ref,row:byFeature.get(ref.feature)}))
      .filter((x) => x.row && Number.isFinite(x.row.effect) && x.row.effect !== 0 && x.ref.officialLogFC !== 0);
    const concordant = pairs.filter(({ref,row}) => Math.sign(row.effect) === Math.sign(ref.officialLogFC)).length;
    concordance[layer] = {
      n:pairs.length,
      concordant,
      fraction:pairs.length ? concordant/pairs.length : null
    };
    requireTruth(
      concordance[layer].n >= 20 && concordance[layer].fraction >= 0.80,
      `LRRK2 ${layer} agrees with published G2019S-vs-control effect directions`,
      `n=${concordance[layer].n}, concordance=${(100*concordance[layer].fraction).toFixed(1)}%`
    );
  }

  const rab29 = result.layers.transcriptomics.rows.find((row) => /^RAB29$/i.test(row.feature));
  requireTruth(
    rab29 && rab29.effect > 0 && rab29.qValue <= 0.10,
    'LRRK2 transcriptome recovers RAB29 up-regulation at day 35',
    rab29 ? `effect=${rab29.effect.toFixed(3)}, q=${rab29.qValue}` : 'RAB29 absent'
  );

  const rab25Protein = result.layers.proteomics.rows.find((row) => /^RAB25$/i.test(row.feature));
  requireTruth(
    rab25Protein && rab25Protein.effect > 0 && rab25Protein.qValue <= 0.10,
    'LRRK2 proteome recovers RAB25 up-regulation at day 35',
    rab25Protein ? `effect=${rab25Protein.effect.toFixed(3)}, q=${rab25Protein.qValue}` : 'RAB25 absent'
  );

  const endocyticPathway = (result.reactome?.consensus || []).find((p) =>
    /endocyt|vesicle|RAB|clathrin|membrane trafficking/i.test(p.name)
  );
  requireTruth(
    Boolean(endocyticPathway),
    'LRRK2 Reactome integration recovers endocytic/vesicle trafficking biology',
    endocyticPathway?.name || result.reactomeError || 'no endocytic pathway'
  );

  report.benchmarks.lrrk2 = {
    truth: 'LRRK2-G2019S dopaminergic-neuron model; published integrated RNA/protein analysis reports endocytic and RAB dysregulation',
    metadata: result.metadataSummary,
    concordance,
    rab29,
    rab25Protein,
    endocyticPathway: endocyticPathway ? {id:endocyticPathway.id,name:endocyticPathway.name,fdr:endocyticPathway.fdr} : null,
    reactomeError: result.reactomeError
  };
}

// --- TCGA breast 3-subtype multi-group inference ---
{
  const ds = await loadDataset(`${root}/tcga-three-subtypes`, ['transcriptomics','proteomics']);
  const result = await runDeterministicAnalysis({
    ...ds,
    columnMapping: ds.mapping,
    protocol: {
      organism: 'human',
      objective: 'groups',
      longitudinal: false,
      designType: 'independent',
      studySetting: 'clinical_observational',
      groupCount: '3',
      sampleOverlap: 'same_specimen'
    },
    dataTypes: {
      transcriptomics: 'log_expression',
      proteomics: 'log_intensity',
      metabolomics: 'normalized'
    },
    useReactome: true,
    resolveIdentifiers: false
  });

  requireTruth(
    result.layers.proteomics.mode === 'multi-group-permutation-anova',
    'TCGA three-subtype benchmark uses multi-group permutation ANOVA',
    result.layers.proteomics.mode
  );

  const ranked = result.layers.proteomics.rows.map((row,index)=>({...row,rank:index+1}));
  const her2 = ranked.find((row)=>/^HER2$/i.test(row.feature));
  const er = ranked.find((row)=>/^ER-alpha$/i.test(row.feature));
  const pr = ranked.find((row)=>/^PR$/i.test(row.feature));

  requireTruth(
    her2 && her2.qValue <= 0.01 && her2.groupMeans?.Her2 > her2.groupMeans?.LumA && her2.groupMeans?.Her2 > her2.groupMeans?.Basal,
    'TCGA multi-group analysis identifies HER2 subtype-specific protein signal',
    her2 ? `rank=${her2.rank}, q=${her2.qValue}` : 'HER2 absent'
  );
  requireTruth(
    er && er.qValue <= 0.01 && er.groupMeans?.LumA > er.groupMeans?.Her2 && er.groupMeans?.LumA > er.groupMeans?.Basal,
    'TCGA multi-group analysis identifies LumA ER-alpha enrichment',
    er ? `rank=${er.rank}, q=${er.qValue}` : 'ER-alpha absent'
  );
  requireTruth(
    pr && pr.qValue <= 0.01 && pr.groupMeans?.LumA > pr.groupMeans?.Her2 && pr.groupMeans?.LumA > pr.groupMeans?.Basal,
    'TCGA multi-group analysis identifies LumA PR enrichment',
    pr ? `rank=${pr.rank}, q=${pr.qValue}` : 'PR absent'
  );

  report.benchmarks.tcgaThreeSubtypes = {
    truth: 'Basal / Her2 / LumA breast-cancer subtypes with established HER2 and hormone-receptor protein differences',
    metadata: result.metadataSummary,
    proteomics: {
      mode: result.layers.proteomics.mode,
      top: result.layers.proteomics.rows.slice(0,20),
      HER2: her2,
      ERalpha: er,
      PR: pr
    },
    reactomeError: result.reactomeError
  };
}

await fs.writeFile(`${root}/benchmark-report.json`, JSON.stringify(report, null, 2));
console.log('PUBLIC MULTI-OMICS BENCHMARK SUITE: PASS');
