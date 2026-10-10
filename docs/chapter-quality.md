# Chapter quality checklist

Use this checklist for every new chapter and during progressive review of the
existing catalogue. A chapter does not need a new bespoke widget when an
existing visualization or laboratory already teaches the objective.

## Required metadata

- One observable learning objective in the title, description or opening step.
- Explicit level, track, indicative duration and tags.
- Prerequisite chapter slugs when prior knowledge is necessary.
- Glossary terms needed to read the chapter.
- Primary or authoritative source identifiers.
- A scientific review date distinct from the editorial update date.
- A content hash sealed only after reviewing that exact language version.
- A matching English file before claiming bilingual coverage.
- Structured `scientific_values` and `units` for quantitative chapters whose
  thresholds or constants must remain identical in French and English.

## Required teaching sequence

1. State why the concept matters and what the learner should be able to do.
2. Give an intuition before the equation.
3. Define every symbol, unit, time horizon and scale used by the equation.
4. State the model assumptions and the population or covariate range.
5. Work through one concrete example.
6. Name one common misinterpretation and explain why it fails.
7. Add a checkpoint that tests reasoning, not wording recall.
8. Link a numerical exercise, guided activity or synthesis case where relevant.
9. Link an existing laboratory when direct manipulation helps the objective.
10. End with source-backed takeaways that do not overstate causality or validity.

## Review boundaries

- Browser and numerical tests establish software consistency, not scientific or
  clinical validity.
- A simulation illustrates consequences conditional on its equations and
  assumptions; it is not evidence that a dose causes a clinical outcome.
- Clinical targets must state population, indication, assay or MIC method and
  other conditions that determine applicability.
- Heuristic thresholds must be labelled as heuristics.
- Graphs require an accessible name and a nearby textual or tabular summary of
  the values needed to understand the conclusion.

The generated catalogue status is in [content-inventory.md](content-inventory.md).
After reviewing a changed French or English file, run `npm run review:seal`.
Do not use this command as an automatic formatting step: it records that the
current content, in each language, is the version that was reviewed.
