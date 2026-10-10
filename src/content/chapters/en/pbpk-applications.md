---
id: "pbpk-applications"
slug: "pbpk-applications"
title: "IVIVE, interactions and special populations"
description: "What PBPK is used for: linking in-vitro clearance to in vivo and supporting DDI and special-population assessment."
summary: "IVIVE (in-vitro to in-vivo clearance), drug interactions and paediatric/pregnancy extrapolation."
track: "pbpk"
order: 73
duration: "12 min"
level: "advanced"
tags: ["pbpk", "ivive", "drug-interactions", "pediatrics"]
slides: []
prerequisites: ["pbpk-intro","pbpk-distribution"]
glossary: ["PBPK","CL","CLr","Allométrie"]
sources: ["rostami-hodjegan-ivive","fda-pbpk","ema-pbpk","anderson-holford-allometry","jones-pbpk-industry"]
updated_on: "2026-10-09"
reviewed_on: "2026-10-09"
review_type: "author"
reviewed_hash: "fcbf39c87edc43e926944c4a34d862137deb86f93b24a04c10b117ba193186eb"
quiz:
  - prompt: "IVIVE consists of..."
    options:
      - "extrapolating a clearance measured in vitro to in vivo"
      - "extrapolating PK from animal to human by allometric scaling"
      - "deducing in-vitro clearance from observed clinical data"
    correct: 0
  - prompt: "In a DDI scenario, a PBPK model represents the interaction by..."
    options:
      - "changing enzyme activity (inhibition/induction) in the modelled liver"
      - "changing the hepatic blood flow of the perpetrator and victim"
      - "simply adding the clearances of the two co-administered drugs"
    correct: 0
  - prompt: "For paediatrics, PBPK mainly adjusts..."
    options:
      - "volumes, flows and enzyme maturation by age"
      - "body weight only, keeping the other parameters fixed"
      - "mainly the tissue partition coefficients (Kp) by age"
    correct: 0
---

<!-- step:title="Why this chapter" -->
PBPK is not merely descriptive: it can **support conditional predictions** where a trial is difficult — first-in-human administration, children, pregnancy, interactions — when the model is qualified for the question.

Three flagship applications: **IVIVE**, **interactions** and **special populations**.
<!-- /step -->

<!-- step:title="Intuition" viz="01_HumanBody" -->
We measure a clearance in the lab on **microsomes** or **hepatocytes**, then "scale it up" to the whole organ, then the whole body: this is **IVIVE**.

By inserting this clearance into the model's liver, we obtain a systemic-PK prediction before clinical human exposure data are available. It remains conditional on the IVIVE assumptions and later verification.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="01_HumanBody" -->
In-vivo hepatic clearance is rebuilt by the **well-stirred model**:

$$ CL_h = \frac{Q_h\cdot f_u\cdot CL_{int}}{Q_h + f_u\cdot CL_{int}} $$

where $CL_{int}$ (intrinsic clearance) comes from in vitro. An **interaction** is modelled by changing $CL_{int}$: an inhibitor reduces it, an inducer increases it.

**Ref —** Rostami-Hodjegan A. (IVIVE, Simcyp); EMA/FDA guidance on regulatory use of PBPK for DDIs and paediatrics. Mechanistic modelling: the **Leiden** school (LACDR).
<!-- /step -->

<!-- step:title="Worked example" viz="01_HumanBody" -->
For a **paediatric dose**, we start from the adult model and adjust flows, volumes and enzyme **maturation** (an infant lacks an adult's CYP activity). The model informs selection of a dose to test; it does not replace clinical evaluation.

For an **interaction**, we simulate co-administration with a CYP3A inhibitor to estimate the exposure increase conditionally and inform a regulatory decision.
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
