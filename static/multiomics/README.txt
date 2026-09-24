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
