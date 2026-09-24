import fs from 'node:fs/promises';
import { File } from 'node:buffer';
import { parseDelimited, runDeterministicAnalysis } from '../src/lib/multiomics/deterministic.js';

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
}

await fs.writeFile(`${root}/benchmark-report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
