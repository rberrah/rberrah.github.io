# Authoring and Deployment Guide

Pharmacometrie Explain is a static SvelteKit course. Keep the architecture
simple: Markdown chapters, local Svelte visualizations, static assets, and
GitHub Pages deployment. There is no backend, database, authentication, or
runtime API.

Before pushing, always run:

```sh
npm run validate
npm run check
npm run build
```

## Add a Chapter

Copy `docs/templates/chapter.md` to `src/content/chapters/NN_my-chapter.md`,
then edit the frontmatter and step blocks.

Required frontmatter:

```yaml
id: "my-chapter"
slug: "my-chapter"
title: "My chapter title"
description: "One sentence shown on cards and the chapter header."
summary: "One sentence describing the learning goal."
track: "core"
order: 13
duration: "12 min"
level: "beginner"
tags: ["pk", "student-friendly"]
slides: []
quiz:
  - prompt: "A checkpoint question?"
    options: ["Correct answer", "Distractor", "Distractor"]
    correct: 0
```

`slides` must be an array. Any slide ID must exist in
`src/content/slides/slide_catalog.yaml`.

Each chapter must include these step titles because `npm run validate` checks
for them:

- `Why this matters`
- `Intuition`
- `Building-block metaphor`
- `Worked example`
- `Common trap`
- `Key takeaways`

Use `Minimal math` whenever the concept needs an equation. Keep equations short,
show units when useful, and explain the equation immediately in plain language.

## Use Visualizations

Visualizations live in `src/lib/components/visualizations/`. Register a new
component in `src/routes/chapitres/[slug]/+page.svelte`, then reference it from
a step:

```markdown
<!-- step:title="Building-block metaphor" viz="BuildingBlocksPKPD" -->
Narrative text.
<!-- /step -->
```

Prefer local Svelte/CSS/SVG-style visuals over remote images. Use the
building-block metaphor where it clarifies PK, PD, variability, diagnostics, or
TDM.

## Math

KaTeX is rendered locally from the npm package. Supported delimiters:

- inline: `$CL/V$`
- display: `$$ t_{1/2} = 0.693 V / CL $$`

Do not intentionally leave raw math delimiters visible in rendered content
unless the text is showing code.

## French Versions

English chapters are the canonical source for now. French chapters can be added
later in `src/content/chapters/fr/` with the same `slug`. The French version
should be rewritten for French-speaking students, not translated mechanically.

If a French chapter is missing, the site displays the English chapter and shows
the fallback notice.

## Source Material

`course_source/` contains raw teaching material such as the slide deck,
notebooks, R Markdown files, and datasets. Use it to distil explanations, but do
not paste slides verbatim into chapters.

The public PowerPoint download is served from:

```text
static/downloads/pharmacometrie-pratique.pptx
```

## Deploy

The GitHub Pages workflow runs:

1. `npm ci`
2. `npm run validate`
3. `npm run check`
4. `npm run build`
5. deploys the static `build/` artifact

For a user site named `rberrah.github.io`, `BASE_PATH` remains empty. For a
project site, the workflow sets `BASE_PATH` to the repository name.
