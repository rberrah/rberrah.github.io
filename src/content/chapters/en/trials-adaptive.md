---
id: "trials-adaptive"
slug: "trials-adaptive"
title: "Dose finding and adaptive designs"
description: "Finding the right dose efficiently: model-based approaches, MCP-Mod and interim analyses."
summary: "Model-based dose finding, MCP-Mod and adaptive designs: learning during the trial to decide better."
track: "trials"
order: 103
duration: "12 min"
level: "advanced"
tags: ["clinical-trials", "adaptive-design", "dose-finding", "mcp-mod"]
slides: []
quiz:
  - prompt: "A model-based dose finding is more efficient because..."
    options:
      - "it uses the continuous dose–response relationship, not just pairwise comparisons"
      - "it compares each dose to placebo separately, correcting for the test multiplicity"
      - "it makes do with two doses only by assuming a strictly linear response"
    correct: 0
  - prompt: "An adaptive design allows one to..."
    options:
      - "modify the trial according to pre-specified interim analyses"
      - "freely revise the protocol after seeing the final results"
      - "extend the trial until a statistically significant result is reached"
    correct: 0
  - prompt: "MCP-Mod combines..."
    options:
      - "a dose–response trend test and modelling to estimate the dose"
      - "a pairwise comparison of the doses with a multiplicity correction"
      - "fitting a single Emax model chosen in advance, without model averaging"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Choosing the **dose** is the costliest decision in development. **Model-based** approaches use the whole dose–response curve instead of stacking isolated comparisons; **adaptive** designs can then reallocate information during the trial according to pre-specified rules.

The expected benefit is straightforward: learn faster which dose range deserves to move forward and avoid exposing too many patients to uninformative doses. The limitations come next: that gain depends on assumptions, readout timing, logistics and error-control simulations.

This is where pharmacometrics directly meets trial strategy.
<!-- /step -->

<!-- step:title="Intuition" viz="EmaxHill" -->
Dose-by-dose comparisons use the continuous structure of the dose–response relationship less directly. A model (often an Emax) links all doses and estimates the **target dose** (e.g. the one giving 80% of the effect).

An **adaptive** design goes further: it adjusts patient allocation across doses **during the trial**, based on what is learned.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="EmaxHill" -->
The target dose is read off the dose–response curve. For an Emax, the dose giving a fraction $f$ of the maximal effect:

$$ D_f = ED_{50}\cdot\frac{f}{1-f} $$

**MCP-Mod** combines two steps: a **multiple test** for the presence of a dose–response trend (MCP), then **modelling** (Mod) to estimate the dose. **Adaptive** designs (responsive allocation, early stopping for futility/efficacy) are pre-specified and simulated in advance.

**Ref —** Bretz F., Pinheiro J. & Branson M. (MCP-Mod), *Biometrics* 2005; approach qualified by EMA/FDA for phase II dose finding.
<!-- /step -->

<!-- step:title="Worked example" viz="EmaxHill" -->
Instead of comparing four doses with placebo in separate tests, MCP-Mod tests a trend across candidate shapes, then estimates the curve and target dose with the selected model or models, potentially using model averaging. Uncertainty in that estimate must accompany phase III selection.

An **interim** analysis can then drop ineffective doses and concentrate patients on the promising ones.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Adaptive does not mean improvised.

**Pitfall —** adaptations, decision rules and analyses should be **prospectively planned** and evaluated by simulation to preserve integrity and, where required, control type-I error. An unplanned change does not create the same inflation in every setting, but it requires justification and appropriate methods. Limitations are design-specific: sometimes larger maximum sample size, operational complexity, readout delays and model risk.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Model-based dose finding exploits the continuous dose–response curve (Emax).
- MCP-Mod: trend tests over candidate models + modelling or model averaging → target-dose estimation.
- Adaptive designs adjust the trial via pre-specified interim analyses.
- Adaptations and analysis rules should be planned and simulated according to the confirmatory or exploratory objective.
<!-- /step -->
