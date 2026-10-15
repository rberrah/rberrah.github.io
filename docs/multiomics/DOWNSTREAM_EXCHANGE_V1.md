# MultiOmics → downstream methods: exchange contract v1 (2026-10-15)

**Status: proposed integration in PR #110; generated as an optional subfolder of the research ZIP for compatible original CSV inputs.** This independent interchange layer does not change existing single-omic workflows or imply that network analyses are validated.

## Directory layout

```text
exchange/
  manifest.json
  samples.csv
  features.csv
  matrices/
    transcriptomics.csv
    proteomics.csv
    metabolomics.csv
```

Only include matrices actually supplied. One layer is valid. No network inference is run implicitly.

### samples.csv (one row per assay/measurement)

Required columns: `assay_id,sample_id,subject_id,omic`.
Recommended: `tissue,collection_time,collection_time_unit,condition,batch,technical_replicate_id,source_dataset_id`.

- `subject_id` is the biological unit (patient, animal, cell line); `sample_id` is the specimen; `assay_id` is the **unique matrix column key**. Never treat repeated assays from one subject as independent subjects.
- Pairing and temporal order must be explicit; unknown tissue/time are **empty with missingness documented**, never guessed.
- Use pseudonymous IDs, not names or direct patient identifiers.

### features.csv (one row per matrix row)

Required: `omic,feature_id,id_namespace`. Recommended: `display_name,organism,taxon_id,annotation_database,annotation_version,tissue_scope,mapping_status`.
`(omic,feature_id)` must be unique. Keep source IDs without auto-conversion: Ensembl, UniProt and ChEBI are different namespaces. Mapping to another namespace belongs in a separate provenance-bearing crosswalk; one-to-many mappings cannot be silently collapsed.

### matrices/*.csv

Header `feature_id,<assay_id>,...`; one row per feature, **all** analyzed features (not top 100), and measurement values on the declared scale. CSV NA is literally `NA` for missing values, not zero. No pre-filtered significance-only matrix, no imputed values mislabelled as raw.
Every matrix column must have exactly one matching `samples.csv` row for the same omic; every matrix feature must have a matching features row for the same omic. The converse may include explicitly excluded features, but exclusions require a QC record.

### manifest.json

See [JSON Schema](./DOWNSTREAM_EXCHANGE_V1.schema.json). The manifest enumerates all files with relative paths and SHA-256, the original dataset access conditions, sample-unit definition, values scale/normalization, producer commit, exact runtime/dependency versions **or explicit nulls when unavailable**, and per-method qualification. Neither a green pipeline nor `passed_technical` means inferential or biological confirmation.

**No inferred tissue/time** and **no invented lock versions**. For controlled/private data, local archiving and opt-in transfer only; clinical data must not enter public CI artifacts.

## Validation and compatibility

Run `python3 scripts/validate_multiomics_exchange.py exchange/` (Python standard library only). Checks file hashes, required columns, referential integrity, duplicate IDs, non-finite values, row counts and missingness. This is an **interchange validation**, not a biological benchmark.

The PR #110 browser dossier now attempts an optional `exchange/` directory from the archived **original** source CSV and writes `downstream_exchange.status` in its outer manifest. For incompatible layouts the original ZIP still exports and records a reason rather than misrepresenting the data. A successful ZIP/validator fixture test is not yet a public-dataset biological qualification or proof of lossless round-trip for every vendor format.

## Research qualification still outstanding

- Run independent reference comparisons for DESeq2, edgeR, limma, fgsea, MOFA2 and DIABLO, retaining failed and null tests; report sample design, exact contrast, effect orientation, full results and tolerances.
- Freeze **R/Bioconductor, Python, JS**, datasets, seeds and artifact SHA; do not assert that package-lock alone freezes R.
- DESeq2 FDR deviations remain an unresolved, *scenario-dependent* calibration investigation, not a reason to silently swap inference engines.
- User testing with novices and screen readers remains distinct from automated tests.

No claims of universally controlled FDR, cross-cohort transfer or independent biological confirmation are supported merely by this contract.

## Capturing exact runtime inventories (not yet a full freeze)

Run `Rscript multiomics-engine/capture_environment.R private-r-runtime.json` in the **actual** reference engine environment (requires jsonlite) and `python3 scripts/capture_multiomics_python_environment.py --output private-python-runtime.json --datasets path/to/public_dataset.csv` in the validation environment. The latter fingerprints only explicitly supplied dataset files; these tools never download or upload data. Keep patient/private files out of publicly uploaded CI artifacts.

Neither inventory is a true `renv.lock`, a Python hashes lock, nor a container digest. The deployment freeze remains incomplete until a real package restore succeeds on a clean runner, public dataset source versions and checksums are recorded, and independently reproduced results are archived.

## Native R differential analysis: transparent, inspectable code

The branch includes [`multiomics-engine/run_exchange_analysis.R`](../../multiomics-engine/run_exchange_analysis.R). This provides an **explicit R command** rather than treating JavaScript exploratory results as DESeq2/edgeR/limma results:

```bash
Rscript multiomics-engine/run_exchange_analysis.R exchange/ results/deseq2 DESeq2 control treated
# For a strictly complete-pair design:
Rscript multiomics-engine/run_exchange_analysis.R exchange/ results/paired DESeq2 control treated --paired
# With transformed, continuous, measured expression (not raw counts):
Rscript multiomics-engine/run_exchange_analysis.R exchange/ results/limma limma control treated
```

The runnable example uses **one transcriptomics matrix** and mandatory `condition`, `subject_id`, `sample_id` and `assay_id` in `samples.csv`. It rejects designs lacking subject independence or complete pairs. It refuses fractional counts and prevents direct limma fitting to raw counts without a suitable normalization/voom workflow.

R creates complete per-feature differential tables, `samples_used.csv`, `R_session_info.txt` and `README.txt`. The native method is selected **by the researcher**, never silently. Dependency and analysis validation remain necessary. This script does **not** yet reproduce every parameter of the interactive engine, nor execute fgsea, MOFA2 or DIABLO. Those require separately prespecified inputs and documented runners.

### Beginner workflow

1. Run the graphical tool with one omics layer, or explore the demo. Download the reproducible research ZIP.
2. Extract `exchange/` if the outer manifest reports `downstream_exchange.status = included`; if not, inspect the explicit incompatibility message rather than assuming a usable R matrix.
3. Run the offline Python verifier on `exchange/`. Only then run a native R reference command with the chosen contrast and study design.
4. Compare the output with the exploratory browser results cautiously: they are distinct methods, not guaranteed equal. Keep the complete table and R session information.

For future omics-to-PK/PD work, the subject/specimen/assay keys, units of collection time, namespace and tissue can provide a join contract. **Never join measured omics and drug-exposure records by row position, and never treat repeated observations as independent patients.** No PK/PD model is trained or fitted by this exchange component.
