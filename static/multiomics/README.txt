Multi-omics prototype data contract

Canonical metadata format: long format, one row per assay.

Required columns:
- subject_id: independent biological unit / participant.
- sample_id: biological specimen. The same sample_id links assays generated from the same specimen.
- assay_id: unique measurement/run identifier. Matrix sample columns must match assay_id.
- omic: transcriptomics, proteomics or metabolomics.

Optional but strongly recommended:
- condition: experimental group or treatment.
- timepoint: visit or experimental time.
- batch: technical batch.
- technical_replicate: replicate number for repeated measurements of the same sample and omic.
- outcome: phenotype or endpoint.

The application may recognise common aliases, but canonical templates are preferred. Automatic mappings must always be confirmed before analysis.

Current deterministic analysis contract

Operational objectives:
- groups: two-group, paired, or independent multi-group inference depending on the declared design.
- time: two-timepoint within-subject change or >=3-timepoint individual slope, then between-condition inference.

Validation-only / intentionally blocked objectives:
- explore: mapping and structural validation only; no surrogate group inference is substituted.
- outcome: no regression/survival surrogate is run until deterministic outcome models are implemented.
- crossover: blocked until period and sequence effects are modelled.

Technical safeguards:
- technical replicates are detected from repeated sample_id + omic pairs and aggregated before inference.
- technical batches are audited. If condition or longitudinal time is completely confounded with batch, inference is refused.
- when several non-confounded batches are present, the current browser MVP reports them but does not silently estimate a batch coefficient.
- covariate availability is recorded by the protocol, but covariate-adjusted models are not implemented yet.
- partial omics are matched explicitly by subject/sample IDs; names are never fuzzy-matched.

External scientific services currently called by the engine:
- ChEBI: optional conservative metabolite identifier resolution.
- Reactome: optional pathway over-representation and cross-layer pathway consensus.

Ensembl, UniProt, UniChem, KEGG and STRING are registry targets for future deterministic connectors; the current engine does not call them automatically.

Automated public validation suite

The GitHub Actions public-truth benchmark currently exercises:
- Nutrimouse: PPARalpha-dependent transcript/metabolite biology.
- TCGA breast: HER2/LumA contrasts and a three-subtype omnibus analysis.
- NCI-60 IntLIM and BRCA IntLIM: published condition-dependent gene-metabolite correlations.
- AgingHFCD: three-omics effect-direction agreement against reference differential results.
- STATegra: real Ikaros time-course biology plus the 36-sample/3-replicate metabolomics design.
- LRRK2 G2019S neurons: RNA/protein direction agreement and RAB/endocytic biology.
- PaintOmics planted multi-omics fixture: cross-layer convergence against a known planted module.
- Bioconductor missRows NCI-60: partial-overlap matching.

Important STATegra scale finding:
The sample-level replicate file and the six-timepoint public summary agree strongly in direction but are not numerically interchangeable in scale. The benchmark therefore checks biological direction while the application requires the uploaded value scale to be declared explicitly.
