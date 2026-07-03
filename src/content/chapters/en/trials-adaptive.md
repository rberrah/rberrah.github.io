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
      - "it tests a single dose"
      - "it ignores efficacy"
    correct: 0
  - prompt: "An adaptive design allows one to..."
    options:
      - "modify the trial according to pre-specified interim analyses"
      - "change the protocol at random mid-way"
      - "remove the control group"
    correct: 0
  - prompt: "MCP-Mod combines..."
    options:
      - "a dose–response trend test and modelling to estimate the dose"
      - "two independent PK models"
      - "a simple average of the groups"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Choosing the **dose** is the costliest decision in development. **Model-based** approaches and **adaptive** designs find the right dose with fewer patients and more reliability than classic comparisons.

This is where pharmacometrics directly meets trial strategy.
<!-- /step -->

<!-- step:title="Intuition" viz="EmaxHill" -->
Comparing a few doses pairwise **wastes** information: the dose–response relationship is **continuous**. A model (often an Emax) links all doses and estimates the **target dose** (e.g. the one giving 80% of the effect).

An **adaptive** design goes further: it adjusts patient allocation across doses **during the trial**, based on what is learned.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="EmaxHill" -->
The target dose is read off the dose–response curve. For an Emax, the dose giving a fraction $f$ of the maximal effect:

$$ D_f = ED_{50}\cdot\frac{f}{1-f} $$

**MCP-Mod** combines two steps: a **multiple test** for the presence of a dose–response trend (MCP), then **modelling** (Mod) to estimate the dose. **Adaptive** designs (responsive allocation, early stopping for futility/efficacy) are pre-specified and simulated in advance.

**Ref —** Bretz F., Pinheiro J. & Branson M. (MCP-Mod), *Biometrics* 2005; approach qualified by EMA/FDA for phase II dose finding.
<!-- /step -->

<!-- step:title="Worked example" viz="EmaxHill" -->
Instead of comparing 4 doses vs placebo by separate tests, MCP-Mod establishes that a trend exists, fits an Emax and estimates the dose giving the target effect — with a usable **confidence interval** for phase III.

An **interim** analysis can then drop ineffective doses and concentrate patients on the promising ones.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Adaptive does not mean improvised.

**Pitfall —** an adaptive design must be **fully pre-specified** and validated by simulation: changing the rules mid-way inflates the type-I error risk. And estimating the dose from a **single** poorly chosen model biases the result — hence the value of MCP-Mod's model averaging.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Model-based dose finding exploits the continuous dose–response curve (Emax).
- MCP-Mod: trend test + modelling → estimation of the target dose.
- Adaptive designs adjust the trial via pre-specified interim analyses.
- Everything must be pre-specified and simulated, otherwise error inflation.
<!-- /step -->
