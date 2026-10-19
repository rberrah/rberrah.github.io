# PMx Explain — frozen maintenance baseline

**Freeze decision:** 19 October 2026  
**Intended use:** teaching and research only  
**Repository:** `rberrah/rberrah.github.io`

## Decision

PMx Explain is feature-frozen. The repository is considered complete for its
current educational scope once the pull request containing this document has
passed the normal protected-main qualification and Pages has published that
qualified merge.

The freeze does **not** claim independent scientific review of every chapter,
clinical validation of MIPD models, medical-device status, or completion of
manual user/accessibility studies. Those evidence levels remain explicitly
separate from software qualification.

## Frozen repository boundary

PMx owns only the academic portal, pharmacometrics teaching content, browser
teaching interfaces and immutable integration contracts.

It does **not** own executable copies of:

- MIPD-Engine;
- MultiOmics;
- Omics2PK;
- the standalone statistics application.

The current integration contracts intentionally pin immutable external
revisions:

- MIPD-Engine public runtime/source: `fec16cbdf8e33ed6c791226ccf236761333f8de8`;
- MultiOmics mounted source: `b02cc48e006abf5fd0200e9e2cf376af4cfae526`;
- Omics2PK published site: `5a9e404fcbd58a6ce1ce378c1d78432d152cb4da`.

A later MultiOmics or Omics2PK release does not silently change PMx. Updating an
external pin is a deliberate maintenance release and must pass the complete PMx
consumer/build/browser gate.

## Freeze evidence

Before this freeze documentation change, qualified and publicly deployed PMx
main was `cef14ddd781cbb1371e65412f15f8b985c9f7934`:

- PMx qualification run `39134570192`: success;
- qualified Pages deployment run `39135031213`: success;
- active main ruleset `Protect PMx main`;
- no open pull requests or issues at freeze preparation;
- no version-controlled executable MIPD mirror.

The merge containing this file becomes the maintenance baseline only after the
same protected-main checks pass again.

## Maintenance policy

After freeze, changes should be limited to:

1. security or dependency fixes required to keep the public site buildable;
2. broken-link, deployment or compatibility fixes;
3. factual/scientific corrections where leaving the current text would be
   misleading;
4. explicit user-requested teaching-content changes;
5. immutable dependency-pin updates for separately qualified releases of
   MultiOmics, Omics2PK or MIPD-Engine.

New major laboratories, architecture rewrites, new scientific engines and
feature expansion are outside the frozen PMx scope.

## Deliberately non-blocking evidence

The historical roadmap retains useful future evidence tasks such as independent
content review, manual accessibility testing, user testing and hosting-provider
privacy verification. They are not release blockers for this research/teaching
software baseline and must not be reinterpreted as missing implementation.
