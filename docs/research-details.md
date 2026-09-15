# Research Details

The Publications & Talks page uses native HTML `details` elements, with no new
dependency, additional tracking or remote embed. Each detail has a stable fragment
identifier. JavaScript opens a directly linked detail; manual disclosure also
works without JavaScript. The existing DOI links and publication metadata stay
unchanged.

## Editorial Sources

Reviewed 15 September 2026:

- Published papers: paraphrased abstract summaries, with direct links to PubMed
  or the publisher for the original text. Findings and limitations are attributed
  to the particular study, not presented as universal clinical recommendations.
- Clindamycin correspondence: PubMed has no abstract. Provide bibliographic
  context and the DOI; do not invent findings from the reply.
- PAGE 2025: official abstract 11344, poster I-034. Its 11%, 5% and zero-error
  settings are distinct from those of the later multi-drug journal article.
- PAGE 2026: official abstract 11937, poster I-084; retain proof-of-concept status
  and code-generation/performance limitations.
- TacDDI: abstract reproduced from the author-provided
  `DDI_Manager2_260909_phases.docx`. The working presentation provides context,
  not the abstract text. Preserve the phase-specific caveats, especially plateau
  bias, and limit the clinical evaluation claim to tacrolimus/voriconazole.
- MissedDose: abstract reproduced from `Berrah_et_al_CPT_Manuscript.docx` inside
  the author-provided submission archive. Explain that the 11 models include
  three tacrolimus formulations. Simulation target attainment is not demonstrated
  clinical benefit.

At the author's request, the two sections use the heading "Abstract", without
the manuscript/review-date/status banner. Their source notes and study limitations
remain available. This presentation change does not imply acceptance or peer review;
do not infer publication status from a filename.

Only the requested abstracts and public-facing context belong in the portal.
Source archives, presentations, manuscript files, supporting information, draft
figures and patient records remain outside the repository. Reading the sources
must not copy them into any build directory.

## Future Video

When final Djamzi Studio videos are supplied and approved for publication, add a
video and transcript within the corresponding detail body. Keep the abstract and
stable identifier. Require an approved final export, captions and transcript;
avoid autoplay and third-party embeds loaded before a reader requests them.
No player or unpublished presentation is exposed until an actual asset exists.

## Verification

After building the app with `BASE_PATH=/pharmacometrie`, use the combined preview:

```sh
node scripts/preview_portal.mjs 4181
npx playwright test --config playwright.portal.config.js
node --test scripts/test_site_origin.mjs
```

Tests cover disclosure by mouse/keyboard, direct fragments, source links, expanded
mobile/desktop layout in both themes, reading without JavaScript, and absence of
links to draft Office/archive files or empty media players.
