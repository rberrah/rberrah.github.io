# Course source material

This directory is reserved for raw teaching material used to build Pharmacométrie Explain.

Source files placed here are not meant to be served directly in production. They should be converted into:

- Markdown chapters in `src/content/chapters/`;
- reusable Svelte visualizations in `src/lib/components/visualizations/`;
- reusable simulation utilities in `src/lib/sim/`;
- slide metadata in `src/content/slides/slide_catalog.yaml`.

## Recommended structure

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

## File policy

Commit source files when they are useful for course reconstruction:

- `.pptx` teaching decks;
- `.Rmd` source notebooks;
- `.ipynb` source notebooks;
- `.csv` datasets;
- small exported assets that are intentionally used by the site.

Do not commit generated files unless explicitly needed:

- rendered `.html`;
- `.nb.html`;
- notebook cache folders;
- temporary figures;
- local build outputs.

## Naming rule

Prefer ASCII lowercase filenames with hyphens or underscores.

Good:

```text
pharmacometrie_pratique_grenoble.pptx
warfarin_data.csv
example_warfarin.Rmd
```

Avoid:

```text
Pharmacométrie Pratique_Grenoble.pptx
Example_Warfarin.nb.html
```
