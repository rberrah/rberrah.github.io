---
id: "pbpk-applications"
slug: "pbpk-applications"
title: "IVIVE, interactions and special populations"
description: "What PBPK is really for: extrapolating in-vitro clearance, predicting DDIs and adapting to populations."
summary: "IVIVE (in-vitro to in-vivo clearance), drug interactions and paediatric/pregnancy extrapolation."
track: "pbpk"
order: 73
duration: "12 min"
level: "advanced"
tags: ["pbpk", "ivive", "drug-interactions", "pediatrics"]
slides: []
quiz:
  - prompt: "IVIVE consists of..."
    options:
      - "extrapolating a clearance measured in vitro to in vivo"
      - "measuring the AUC in animals"
      - "ignoring metabolism"
    correct: 0
  - prompt: "PBPK predicts an interaction (DDI) by..."
    options:
      - "changing enzyme activity (inhibition/induction) in the modelled liver"
      - "changing the drug colour"
      - "removing the dose"
    correct: 0
  - prompt: "For paediatrics, PBPK mainly adjusts..."
    options:
      - "volumes, flows and enzyme maturation by age"
      - "nothing, dose is proportional to weight"
      - "only the colour"
    correct: 0
---

<!-- step:title="Why this chapter" -->
PBPK is not just an elegant exercise: it **predicts** in situations where a trial is difficult or impossible — first-in-human, children, pregnant women, interactions.

Three flagship applications: **IVIVE**, **interactions** and **special populations**.
<!-- /step -->

<!-- step:title="Intuition" viz="01_HumanBody" -->
We measure a clearance in the lab on **microsomes** or **hepatocytes**, then "scale it up" to the whole organ, then the whole body: this is **IVIVE**.

By inserting this clearance into the model's liver, we predict systemic PK — without ever having dosed the human.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="01_HumanBody" -->
In-vivo hepatic clearance is rebuilt by the **well-stirred model**:

$$ CL_h = \frac{Q_h\cdot f_u\cdot CL_{int}}{Q_h + f_u\cdot CL_{int}} $$

where $CL_{int}$ (intrinsic clearance) comes from in vitro. An **interaction** is modelled by changing $CL_{int}$: an inhibitor reduces it, an inducer increases it.

**Ref —** Rostami-Hodjegan A. (IVIVE, Simcyp); EMA/FDA guidance on regulatory use of PBPK for DDIs and paediatrics. Mechanistic modelling: the **Leiden** school (LACDR).
<!-- /step -->

<!-- step:title="Worked example" viz="01_HumanBody" -->
For a **paediatric dose**, we start from the adult model and adjust flows, volumes and enzyme **maturation** (an infant lacks an adult's CYP activity). The model proposes a dose before any trial.

For an **interaction**, we simulate co-administration with a CYP3A inhibitor and predict the exposure rise — useful for the label.
<!-- /step -->

<!-- step:title="Common pitfall" -->
A prediction is only as good as its inputs.

**Pitfall —** IVIVE can **underestimate** clearance (scaling factors, uncaptured transporters). A DDI prediction depends strongly on $CL_{int}$ and $f_u$. Regulatory PBPK requires a **qualification** of the model on known data before any extrapolation.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- IVIVE: extrapolate in-vitro CL_int → in-vivo hepatic CL (well-stirred model).
- DDIs are modelled by changing enzyme activity (inhibition/induction).
- Paediatrics/pregnancy: adjust volumes, flows and enzyme maturation.
- Regulatory PBPK must be qualified on known data.
<!-- /step -->
