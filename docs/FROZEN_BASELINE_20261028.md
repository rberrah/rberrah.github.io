# PMx Explain - frozen maintenance baseline

**Freeze decision:** 28 October 2026  
**Qualified code baseline:** `9d5d31bdb133f56fdb24f5f9319742d41e3b49f6`  
**Intended use:** teaching and research only  
**Repository:** `rberrah/rberrah.github.io`

## Decision

PMx Explain is feature-frozen again. The qualified baseline includes the final
ML validation correction, dependency maintenance, bilingual section metadata
and a live sitemap audit scoped to PMx-owned surfaces. No new teaching feature
is part of this freeze.

This freeze is a software and publication baseline. It does not claim
independent scientific review, clinical validation, medical-device status,
manual accessibility validation or user-testing completion.

## Repository boundary

PMx owns the academic portal, pharmacometrics teaching content, browser
teaching interfaces and immutable integration contracts. Executable engines
and their scientific libraries remain in their standalone repositories:

- MIPD-Engine: `fec16cbdf8e33ed6c791226ccf236761333f8de8`;
- MultiOmics: `6f480b4b60c9b9648f5378b12c5550e018e3f2e7`;
- Omics2PK site: `e34c3eacec4e5c173424f934f2025622df0a3572`;
- Stats: independently maintained and deployed from `rberrah/stats`.

PMx must not reintroduce executable copies of MIPD-Engine, MultiOmics,
Omics2PK or Stats. Updating an immutable integration pin is a maintenance
release and must pass the complete PMx consumer, build and browser gates.

## Qualification evidence

The exact code baseline `9d5d31bdb133f56fdb24f5f9319742d41e3b49f6`
passed:

- PMx qualification run
  [40598781928](https://github.com/rberrah/rberrah.github.io/actions/runs/40598781928):
  `build`, `scientific-js`, `scientific-r`, `scientific-pmetrics` and
  `mipd-consumer` successful;
- qualified Pages deployment run
  [40599749090](https://github.com/rberrah/rberrah.github.io/actions/runs/40599749090):
  successful;
- public sitemap and representative HTML audit: HTTP 200 with valid XML,
  canonical metadata and server-rendered content;
- npm audit: zero known advisories at low severity or above.

The active repository ruleset `Protect PMx main` (ID `25306480`) requires a
pull request, resolved review threads, an up-to-date branch and the five PMx
status checks. It blocks force pushes and branch deletion, with no bypass
actor.

## Human review debt retained explicitly

Automation did not alter any human-review record. The author-review queue is:

- 16 French chapters and their 16 English translations with changed hashes;
- 9 visualization components marked `pending`;
- 4 cross-domain lessons in each language marked `pending`;
- no chapter recorded as internally or externally reviewed.

The exact files are listed in
[author-review-required.md](author-review-required.md),
[content-inventory.md](content-inventory.md) and
[visualization-review.md](visualization-review.md). These items are
non-blocking for the software freeze and must remain pending until a person
reviews the exact content.

## Maintenance policy

After this freeze, accepted changes are limited to:

1. security and compatible dependency maintenance;
2. broken-link, deployment, accessibility or compatibility fixes;
3. objectively supported factual or scientific corrections;
4. immutable pin updates for separately qualified external releases;
5. explicit, separately approved maintenance requests.

Major laboratories, new engines, new course families and architecture rewrites
remain outside the frozen scope.

## Deliberately non-blocking work

- author and independent scientific review;
- Google indexing latency and Search Console follow-up;
- manual NVDA, VoiceOver, 200% zoom and physical-device accessibility checks;
- unguided user studies;
- future pedagogical improvements already recorded in the historical roadmap.

