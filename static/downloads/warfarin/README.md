# Warfarin case-study source

This folder is reserved for the Warfarin PK/PD case study.

The Warfarin material should be treated as an advanced practical module, not as the first entry point for the course.

## Provenance and redistribution

- Source family: classic Warfarin PK/PD teaching dataset, as used in Monolix examples and in `nlmixr2data`.
- Files in this folder: CSV plus teaching notebooks derived for this site.
- Transformations: keep only the variables needed for the teaching case and harmonise names/units for the notebooks and browser visualisations.
- Licence: third-party dataset rights are not re-licensed by this repository. Reuse outside this teaching context should cite the original Monolix/nlmixr2data source and follow its redistribution terms.
- Citation: cite this site for the adapted teaching material, and cite the original dataset/software source when using the data itself.

## Intended educational use

Use this material to build chapters and visualizations about:

- dataset structure for population PK/PD;
- one-compartment oral absorption model;
- lag time;
- model comparison;
- residual error;
- inter-individual variability;
- covariates;
- diagnostic plots;
- VPC;
- simulation.

## Conversion rule

Do not embed rendered notebook HTML in the Svelte site.

Instead, convert the material into:

1. a clean narrative chapter;
2. selected code excerpts where useful;
3. reusable visualizations;
4. simplified browser-side simulations;
5. short interpretation notes.

## Safety rule

The Warfarin material is for teaching pharmacometrics only. It must not be presented as clinical dosing guidance.
