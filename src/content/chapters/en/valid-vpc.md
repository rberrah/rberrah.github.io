---
id: "valid-vpc"
slug: "valid-vpc"
title: "VPC and pcVPC: the visual predictive check"
description: "Does the model reproduce reality? Comparing observed percentiles to simulated ones."
summary: "The visual predictive check (VPC) and its corrected version (pcVPC): principle, reading and pitfalls."
track: "valid"
order: 93
duration: "13 min"
level: "advanced"
tags: ["validation", "vpc", "pcvpc", "simulation"]
slides: []
quiz:
  - prompt: "A VPC compares..."
    options:
      - "the percentiles of observations to those of many simulations"
      - "individual predictions to observations, patient by patient"
      - "observed percentiles to the typical prediction curve (PRED)"
    correct: 0
  - prompt: "The pcVPC (prediction-corrected) serves to..."
    options:
      - "correct variability from dose differences between subjects"
      - "group observations into optimal time intervals (binning)"
      - "correct the linearisation bias in the residual calculation"
    correct: 0
  - prompt: "If many observations fall outside the simulated intervals, then..."
    options:
      - "the model reproduces the observed trend or spread poorly"
      - "the simulated bands are too narrow and just need widening"
      - "too few simulations were run to draw any conclusion"
    correct: 0
---

<!-- step:title="Why this chapter" -->
The ultimate question: can the model **regenerate** data that resemble the real ones? The **VPC** (visual predictive check) answers visually, confronting observations with simulations.

It is the most used validation diagnostic and the one evaluators most expect.
<!-- /step -->

<!-- step:title="Intuition" viz="17_VPCCrashTest" -->
We **simulate** hundreds of datasets under the model, compute their percentiles (5th, 50th, 95th), then check whether the **observed percentiles** fall within the **simulated bands**.

If so, the model reproduces both the trend and the variability. If not, there is a structural or variability defect.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="17_VPCCrashTest" -->
The classic VPC compares, per time interval (**binning**):

- **observed** percentiles (median, 5%, 95%);
- **confidence intervals** of those percentiles from the simulations.

When doses or covariates **differ** between subjects, prediction variability blurs the VPC: the **pcVPC** normalises each observation by its typical prediction to remove that "expected" variability:

$$ Y^{pc}_{ij} = Y_{ij}\cdot\frac{\overline{PRED}_{\text{bin}}}{PRED_{ij}} $$

**Ref —** Karlsson & Holford (VPC); Bergstrand M. et al., *AAPS J* 2011 (prediction-corrected VPC).
<!-- /step -->

<!-- step:title="Worked example" viz="17_VPCCrashTest" -->
If the **observed median** leaves the simulated band in the terminal phase, the model describes elimination poorly. If the **extreme percentiles** (5/95) are too tight in the simulation, the **variability** (IIV or residual error) is underestimated.

The pcVPC clarifies these readings when the protocol mixes several doses.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Poor binning ruins everything.

**Pitfall —** poorly chosen **time intervals** (bins too wide or misplaced) create artefacts that mimic a model defect — or hide one. And an uncorrected VPC on multiple-dose data is **misleading**: prefer the pcVPC. The VPC checks consistency, it does not prove correctness.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- The VPC confronts observed and simulated percentiles (trend + variability).
- The pcVPC corrects dose/covariate differences between subjects.
- Out-of-band: structural defect (median) or variability defect (extremes).
- Beware binning; the VPC checks consistency, not truth.
<!-- /step -->
