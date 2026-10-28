# Author review required

Automated checks do not replace author or independent scientific review. The
items below changed after their stored human-review evidence or have never been
sealed. Their status must remain `pending` until a person reviews the exact
content.

## Chapters: 18 French and 18 English files

The same filenames are pending under `src/content/chapters/` and
`src/content/chapters/en/`:

- `01_intro-pkpd.md`
- `02_trois-approches.md`
- `02b_nca.md`
- `08c_pmetrics-nonparametric.md`
- `09_validation-vpc.md`
- `11_tdm.md`
- `12_neural-ode.md`
- `ai-boosting.md`
- `ai-clustering.md`
- `ai-featselect.md`
- `ai-llm.md`
- `ai-ml-tdm.md`
- `ai-svm.md`
- `ai-trees.md`
- `monolix-erreur-residuelle.md`
- `nlmixr2-moteur.md`
- `tools-nlmixr2.md`
- `valid-vpc.md`

`docs/content-inventory.md` is the generated source of truth for their current
hash status.

## Visualizations: 9 components

- `20_NeuralBox`
- `40_TreeEnsemble`
- `41_SVMMargin`
- `42_VarImportance`
- `46_ValidationSplit`
- `47_TokenAttention`
- `63_ClusterPCA`
- `64_RMT`
- `NPAGSupportPoints`

`docs/visualization-review.md` is the generated source of truth for this list.

## Cross-domain lessons: 4 per language

The `match`, `covariate`, `pd` and `mechanistic` Omics to PK/PD lessons remain
pending independently in French and English.

## Communication content

- `src/lib/content/communications.js`: verify metadata, bilingual summaries and
  publication status against the maintained source collection.
- Generated pages under `portal/communications/`: verify source-file pairing
  and suggested citations.

Do not change `review_type`, `reviewed_on`, stored review hashes or visualization
status until the corresponding human review has actually occurred.
