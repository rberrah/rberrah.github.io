# Prompt for Emergent

Use this repository as the source of truth.

Important constraints:

- Do not rebuild from scratch.
- Do not replace SvelteKit.
- Do not add backend, database, authentication, API service, or server runtime.
- Keep the SvelteKit + Markdown + Svelte visualization architecture.
- Keep GitHub Pages static deployment compatibility.
- Read `docs/EMERGENT_CONTEXT.md` first.
- Read `docs/COURSE_BLUEPRINT.md` second.
- Use `course_source/` as raw teaching material only.
- Do not embed generated notebook HTML into the production site.
- Convert source material into clean Markdown chapters and reusable Svelte visualizations.
- Educational only, no medical advice.

## First task

1. Audit the current repo.
2. Check whether `src/content/slides/slide_catalog.yaml` matches the current PowerPoint source.
3. Propose a clean course structure based on `docs/COURSE_BLUEPRINT.md`.
4. Implement only phase 1:
   - improved home page;
   - improved chapter template;
   - course track navigation;
   - first 2 complete chapters;
   - 2–3 polished visualizations;
   - updated docs.
5. Run:
   ```sh
   npm ci
   npm run check
   npm run validate
   npm run build
   ```
6. Fix all issues before returning the result.

## Design direction

The result should feel like a modern MLU-Explain-style visual essay, adapted to pharmacometrics:

- scientific but accessible;
- animations that explain concepts, not decoration;
- high-quality scrollytelling;
- sticky visualization panel on desktop;
- usable mobile layout;
- clear equations and units;
- quiz/checkpoint at the end of each chapter.

## Technical direction

Preserve and improve:

- Markdown chapter authoring;
- `step` blocks;
- visualization mapping;
- slide metadata;
- static deployment;
- reusable chart and simulation primitives.

Avoid:

- one-off generated pages;
- copied notebook HTML;
- large UI libraries unless clearly needed;
- backend dependencies;
- hidden clinical claims.

## Source files already placed in the repository

The source material has been organized as:

```text
course_source/slides/pharmacometrie_pratique_grenoble.pptx
course_source/warfarin/example_warfarin.Rmd
course_source/warfarin/warfarin_data.csv
course_source/warfarin/warfarin_monolix_nlmixr2.ipynb
course_source/warfarin/warfarin_pkpd_nlmixr2_EN.ipynb
```

Treat these as source material only. Do not embed rendered notebook HTML into production routes.

