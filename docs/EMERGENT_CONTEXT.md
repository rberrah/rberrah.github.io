# Emergent context — Pharmacométrie Explain

This repository is an existing SvelteKit static educational site for an interactive pharmacometrics course.

## Non-negotiable constraints

Do **not** rebuild from scratch.
Do **not** replace SvelteKit.
Do **not** add a backend, database, authentication layer, server runtime, or API dependency.
Do **not** embed generated notebook HTML directly into the educational site.

Keep the project compatible with GitHub Pages static deployment.

## Current architecture

- Framework: SvelteKit + Vite.
- Static hosting: `@sveltejs/adapter-static` and GitHub Pages.
- Chapters: Markdown files in `src/content/chapters/*.md`.
- Chapter parser: `src/lib/content/loadChapters.js`.
- Scrollytelling unit: Markdown blocks delimited with:

```markdown
<!-- step:title="..." slides="s01,s02" viz="09_PK1C" -->
Text, equations, intuition, examples.
<!-- /step -->
```

- Visualizations: Svelte components in `src/lib/components/visualizations/`.
- Simulations: reusable numerical code in `src/lib/sim/`.
- Charts: reusable chart primitives in `src/lib/charts/`.
- Slide metadata: `src/content/slides/slide_catalog.yaml`.
- Static slides: `static/slides/slide-XX.png`.
- Utility documentation: `docs/AJOUTER_UN_CHAPITRE.md`.

## Product goal

Build a visual course inspired by MLU-Explain, but adapted to pharmacometrics:

- long-form visual essays;
- scroll-driven explanations;
- interactive PK/PD simulations;
- clinically cautious educational framing;
- reusable components rather than one-off pages;
- Markdown-first authoring so new chapters can be added without editing application code.

The course has two tracks:

1. Core pharmacometrics.
2. AI in pharmacometrics.

## Source material

The `course_source/` directory is reserved for raw teaching material.

Use raw source material only as input for conversion into clean chapters and visualizations. Do not render raw notebooks or generated HTML directly in production routes.

Recommended source hierarchy:

```text
course_source/
  README.md
  slides/
    pharmacometrie_pratique_grenoble.pptx
  warfarin/
    README.md
    warfarin_data.csv
    warfarin_pkpd_nlmixr2_EN.ipynb
    warfarin_monolix_nlmixr2_FR.ipynb
    example_warfarin.Rmd
```

Generated files such as `.html`, `.nb.html`, notebook cache folders, and rendered figure folders should stay out of the repository unless explicitly needed for documentation.

## Scientific and clinical guardrails

This site is educational only and must not provide medical advice.

Always:

- show units for model parameters and simulated outputs;
- distinguish intuition from implementation detail;
- distinguish structural variability, inter-individual variability, inter-occasion variability, and residual error;
- show assumptions when simulating PK/PD profiles;
- indicate that clinical decisions require expert review and validated tools.

Never:

- provide patient-specific dosing advice;
- imply that simulations are validated for clinical use;
- present AI as superior by default;
- hide uncertainty or extrapolation risk.

## Development acceptance checks

Before considering a change complete, run:

```sh
npm ci
npm run check
npm run validate
npm run build
```

A valid contribution should preserve static deployment and route refresh compatibility on GitHub Pages.

## Preferred Emergent workflow

1. Audit the current repo.
2. Preserve the SvelteKit/Markdown/scrollytelling architecture.
3. Improve the design system and chapter template.
4. Convert source material into structured chapters.
5. Implement reusable visualizations.
6. Validate the build.
7. Document how to add new chapters and visualizations.
