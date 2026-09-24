import fs from 'node:fs/promises';
import { File } from 'node:buffer';
import { parseDelimited, runDeterministicAnalysis, differentialCorrelationPair } from '../src/lib/multiomics/deterministic.js';

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
    foldRatio: Number(row.foldRatio.toFixed(4)),
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
    useReactome: true
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
    useReactome: true
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
