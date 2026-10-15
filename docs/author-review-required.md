# Author review required

Automated checks do not replace author or independent scientific review. The
following content changed after its stored author-review hash and must be read
again by the author before a new hash is sealed.

## French chapters

- `src/content/chapters/nlmixr2-moteur.md`: distinction between ODE stiffness,
  SAEM/FOCEI estimation and post-SAEM FOCEi objective evaluation.
- `src/content/chapters/tools-nlmixr2.md`: neutral, non-promotional description
  of the software scope and limitations.
- `src/content/chapters/08c_pmetrics-nonparametric.md`: interpretation of
  support points and separated regions without cluster/phenotype claims.

## English chapters

- `src/content/chapters/en/nlmixr2-moteur.md`.
- `src/content/chapters/en/tools-nlmixr2.md`.
- `src/content/chapters/en/08c_pmetrics-nonparametric.md`.

## Communication content

- `src/lib/content/communications.js`: verify metadata, bilingual site summaries,
  publication status and the two pending classifications against the maintained
  source collection.
- Generated pages under `portal/communications/`: verify PDF/PPTX/preview pairing
  and the suggested citations.

## Cross-domain lessons

The four Omics → PK/PD lessons have independent FR and EN content hashes, but
no human review has yet been recorded. The eight language records remain
explicitly `pending`:

- `match` (FR and EN)
- `covariate` (FR and EN)
- `pd` (FR and EN)
- `mechanistic` (FR and EN)

## Visualizations

- `src/lib/components/visualizations/NPAGSupportPoints.svelte`: the labels and
  caveat now distinguish support-point weights and marginal masses from clinical
  clusters or phenotypes. Author review and independent review remain pending.

Do not change `review_type`, `reviewed_on` or stored review hashes until the
corresponding human review has actually occurred.
