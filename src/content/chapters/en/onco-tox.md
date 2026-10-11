---
id: "onco-tox"
slug: "onco-tox"
title: "Haematological toxicity: the Friberg model"
description: "Modelling chemotherapy-induced neutropenia: proliferation, maturation and feedback."
summary: "Friberg's semi-mechanistic model of myelosuppression, a dose-limiting toxicity."
track: "onco"
order: 31
duration: "13 min"
level: "advanced"
tags: ["oncology", "toxicity", "neutropenia", "friberg"]
slides: []
prerequisites: ["onco-models"]
glossary: ["PD","Emax","Réponse indirecte / turnover"]
sources: ["friberg","savic-transit","sharma-jusko-indirect"]
reviewed_on: "2026-10-11"
review_type: "author"
reviewed_hash: "cfb63ab26e53b2f32c67a62c9e13a3cf0d14841c90de5bd0d5a6aedf5c6af1f7"
quiz:
  - prompt: "In the Friberg model, the neutrophil nadir occurs..."
    options:
      - "with a delay (maturation time), after the concentration peak"
      - "exactly at the drug's peak plasma concentration, with no delay"
      - "at the end of the infusion, before the marrow cells mature"
    correct: 0
  - prompt: "The feedback term (Circ₀/Circ)^γ serves to..."
    options:
      - "drive marrow production back up after the nadir"
      - "speed up the maturation of the transiting cells"
      - "amplify the drug's inhibitory effect on the marrow"
    correct: 0
---

<!-- step:title="Why this chapter" -->
**Neutropenia** is the **dose-limiting** toxicity of many chemotherapies. Modelling it predicts the depth and timing of the **nadir**, and helps adjust dose and schedule.

It is the "toxicity" counterpart of tumour exposure–response.
<!-- /step -->

<!-- step:title="Intuition" viz="32_Myelosuppression" -->
The marrow produces cells that **mature** before reaching the blood. The drug slows **proliferation**; the effect on circulating neutrophils therefore appears **with a delay** (the maturation time).

Then a **feedback** loop restarts production: neutrophils recover, sometimes above normal (rebound).
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="32_Myelosuppression" -->
The **Friberg** model (2002) chains a proliferation compartment, **transit** compartments (maturation) and the circulating cells:

$$ \frac{dProl}{dt} = k_{tr}\,Prol\,(1 - E_{drug})\left(\frac{Circ_0}{Circ}\right)^{\gamma} - k_{tr}\,Prol $$

- $E_{drug}$: effect (often linear, $slope\cdot C$) inhibiting proliferation;
- the **transits** ($k_{tr}$) create the main structural delay of the nadir (MTT);
- the $(Circ_0/Circ)^{\gamma}$ term is the homeostatic **feedback**.

**Ref —** Friberg L.E. et al., *J Clin Oncol* 2002 — semi-mechanistic model of myelosuppression, reusable for platelets and leukocytes.
<!-- /step -->

<!-- step:title="Worked example" viz="32_Myelosuppression" -->
The higher the **exposure**, the deeper the nadir; the nadir occurs ~1–2 weeks after the cycle (maturation time), not at the plasma peak.

One then simulates schedules (dose, interval) that keep the nadir above a safety threshold.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Do not confuse the timing of the **concentration peak** and of the **nadir**.

**Pitfall —** the characteristic nadir delay is created mainly by maturation through the transit compartments. PK nevertheless determines the timing and intensity of the exposure driving the system. Toxicity can also be **cumulative** across cycles: a single-cycle model underestimates the risk.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Neutropenia is often the dose-limiting toxicity; we model it to predict the nadir.
- Friberg model: proliferation (inhibited) → transits (maturation) → circulating + feedback.
- The nadir delay comes mainly from maturation time; the PK profile still contributes to its precise timing and depth.
- Beware cumulative multi-cycle toxicity.
<!-- /step -->
