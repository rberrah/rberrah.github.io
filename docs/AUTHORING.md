# Authoring & deployment guide

This guide explains how to extend **Pharmacométrie Explain** without touching the
core architecture. It covers four tasks:

1. [Adding a chapter](#1-add-a-chapter)
2. [Adding a visualization](#2-add-a-visualization)
3. [Using `course_source/`](#3-use-course_source)
4. [Deploying to GitHub Pages](#4-deploy-to-github-pages)

The stack is intentionally simple and **fully static**: SvelteKit + Vite,
Markdown chapters, Svelte visualizations, `adapter-static`. There is no backend,
database, authentication, or runtime API. Keep it that way.

Always run the full check before committing:

```sh
npm ci
npm run check      # svelte-check (types)
npm run validate   # content integrity (slides + chapters)
npm run build      # static build (must succeed for GitHub Pages)
```

---

## 1. Add a chapter

Chapters are Markdown files in `src/content/chapters/`. The filename prefix
(`NN_`) is only for ordering on disk; the real order comes from the `order`
frontmatter field.

### 1.1 Create the file

Create `src/content/chapters/NN_my-chapter.md`:

```markdown
---
id: "my-chapter"
slug: "my-chapter"
title: "My chapter title"
description: "One sentence shown on cards and the chapter header."
order: 4
tags: ["pk", "absorption"]
slides: []            # optional: catalog IDs like ["s17","s18"] — must exist in slide_catalog.yaml
quiz:                 # optional end-of-chapter checkpoint
  - prompt: "A question?"
    options: ["Option A", "Option B", "Option C"]
    correct: 1        # zero-based index of the correct option
---
```

> `slides` must be an **array**. Leave it as `[]` if the chapter has no slide
> references. Any slide ID you list must exist in
> `src/content/slides/slide_catalog.yaml`, or `npm run validate` will fail.

### 1.2 Write the narrative as `step` blocks

Each `step` becomes one scroll position in the narrative column. The `viz`
attribute selects which visualization is pinned in the sticky panel while that
step is active.

```markdown
<!-- step:title="One compartment" viz="IVBolus" -->
Narrative Markdown. Bold, lists, links all work.

Inline math with units: $C_0 = \dfrac{\text{Dose}}{V}\ [\text{mg/L}]$.

$$ \frac{dA}{dt} = -\frac{CL}{V}\,A $$
<!-- /step -->
```

Rules of thumb (see `docs/COURSE_BLUEPRINT.md` for the full pedagogical pattern):

- one idea per step;
- **always show units** in equations and readouts;
- distinguish *structural model*, *fixed effects*, *random effects*, *IIV*,
  *IOV*, *residual error*, *uncertainty* and *model bias* — never blur them;
- never give patient-specific dosing advice.

**Equations** use KaTeX, auto-rendered on the chapter page. Delimiters:
`$ … $` (inline), `$$ … $$` (display), `\( … \)`, `\[ … \]`. Inside `\text{}`
use `\cdot` rather than a literal `·` character.

### 1.3 Place the chapter in a track

Tracks are defined in `src/lib/content/tracks.js`. By default every chapter
belongs to the **Core** track. To assign a chapter to the **AI** track, add its
slug to the `aiSlugs` set:

```js
const aiSlugs = new Set(['neural-ode', 'my-ai-chapter']);
```

### 1.4 Register it for prerendering

`svelte.config.js` lists chapter routes under `prerender.entries`. Add your new
slug:

```js
'/chapitres/my-chapter',
```

(The `*` entry crawls linked pages, but listing the slug explicitly guarantees
it is generated even if no page links to it yet.)

### 1.5 Validate

```sh
npm run validate && npm run check && npm run build
```

---

## 2. Add a visualization

Visualizations are self-contained Svelte components in
`src/lib/components/visualizations/`. They must be **browser-safe**: any code
that touches `window`, `document`, `IntersectionObserver`, etc. has to run
inside `onMount` (or be guarded with `if (typeof window !== 'undefined')`), so
the static prerender does not crash.

### 2.1 Create the component

`src/lib/components/visualizations/MyExplorer.svelte`:

```svelte
<script>
  import { scaleLinear } from 'd3-scale';
  export let dose = 100;        // expose tweakable params as props
  let cl = 5;
  $: /* derived reactive state */ ;
</script>

<!-- sliders + inline SVG chart, using the design tokens -->
```

Guidelines:

- reuse simulation logic from `src/lib/sim/` (RK4 solver, PK models) instead of
  re-deriving ODEs;
- use the CSS variables from `src/lib/styles/theme.css`
  (`--accent-pk`, `--font-mono`, …) so it matches the design system;
- add `data-testid` attributes to sliders and the chart;
- keep it under ~150 lines; one concept per explorer.

Reference implementations:
`IVBolusExplorer.svelte` (one-compartment IV bolus) and
`OralAbsorptionExplorer.svelte` (first-order absorption / Bateman).

### 2.2 Register it in the chapter reader

Open `src/routes/chapitres/[slug]/+page.svelte`, import the component and add it
to `vizMap`:

```js
import MyExplorer from '$lib/components/visualizations/MyExplorer.svelte';

const vizMap = {
  /* … existing … */
  MyExplorer
};
```

Now any step can pin it with `viz="MyExplorer"`.

---

## 3. Use `course_source/`

`course_source/` holds **raw teaching material only** (slide decks, R Markdown,
notebooks, datasets). It is never served directly.

```text
course_source/
  slides/pharmacometrie_pratique_grenoble.pptx
  warfarin/example_warfarin.Rmd
  warfarin/warfarin_data.csv
  warfarin/warfarin_pkpd_nlmixr2_EN.ipynb
```

Workflow for turning source material into the site:

1. **Read** the relevant slides / notebook for the concept you want to teach.
2. **Distil**, do not copy. For each slide group produce: short narrative,
   clean formulas with units, one or two visual intuitions, one interactive
   component, and a checkpoint question.
3. **Implement** the intuition as a reusable Svelte visualization in
   `src/lib/components/visualizations/` and/or a simulation in `src/lib/sim/`.
4. **Write** the chapter Markdown referencing that visualization.

Do **not**:

- embed rendered notebook HTML (`.nb.html`) into the site;
- turn a notebook into an `<iframe>` page;
- commit generated artifacts (rendered HTML, caches, temp figures).

If you export slide PNGs, place them in `static/slides/slide-XX.png` and
describe them in `src/content/slides/slide_catalog.yaml` (the validator checks
that every referenced slide exists).

---

## 4. Deploy to GitHub Pages

The site builds to a static `build/` folder via `@sveltejs/adapter-static`
with `fallback: 404.html`, so client-side routing and page refreshes work on
GitHub Pages.

### 4.1 Base path

GitHub Pages serves project sites under `/<repo-name>/`. The base path is read
from the `BASE_PATH` environment variable in `svelte.config.js`:

- **User/organization site** (`<user>.github.io`): leave `BASE_PATH` empty.
- **Project site** (`<user>.github.io/<repo>`): set `BASE_PATH=/<repo>`.

Local production preview of a project-site build:

```sh
BASE_PATH=/rberrah.github.io npm run build
npm run preview
```

All internal links already use `import { base } from '$app/paths'`, so they
adapt automatically — never hard-code absolute `/` paths.

### 4.2 CI workflow

`.github/workflows/deploy-pages.yml` builds the site and publishes `build/` to
GitHub Pages. On push to the default branch it:

1. runs `npm ci`,
2. detects `BASE_PATH`,
3. runs `npm run build`,
4. uploads and deploys the `build/` artifact.

`static/.nojekyll` is present so GitHub Pages does not strip files beginning
with an underscore.

### 4.3 Enable Pages (one-time)

In the GitHub repository: **Settings → Pages → Build and deployment → Source:
GitHub Actions**. Push to the default branch and the workflow handles the rest.
