# Author review required

Automated checks do not replace author or independent scientific review. The
following content changed after its stored author-review hash and must be read
again by the author before a new hash is sealed.

## French chapters

- `src/content/chapters/nlmixr2-moteur.md`: current estimator-family overview.
- `src/content/chapters/tools-nlmixr2.md`: current estimator-family summary.
- `src/content/chapters/08c_pmetrics-nonparametric.md`: tested release versus
  development documentation and `block` to `occasion` compatibility note.

## English chapters

- `src/content/chapters/en/nlmixr2-moteur.md`.
- `src/content/chapters/en/tools-nlmixr2.md`.
- `src/content/chapters/en/08c_pmetrics-nonparametric.md`.

## Communication content

- `src/lib/content/communications.js`: verify metadata, bilingual site summaries,
  publication status and the two pending classifications against the maintained
  source repository.
- Generated pages under `portal/communications/`: verify PDF/PPTX/preview pairing
  and the suggested citations.

## Visualizations

No scientific visualization source or bilingual visualization description was
changed in this work. Independent review of `NPAGSupportPoints.svelte` remains
pending in the existing checklist.

Do not change `review_type`, `reviewed_on` or stored review hashes until the
corresponding human review has actually occurred.
