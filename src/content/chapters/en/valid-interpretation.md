---
id: "valid-interpretation"
slug: "valid-interpretation"
title: "Case study: read the GoF and improve the model"
description: "Each residual pattern (U, inverted U, trumpet, trend) points to correction hypotheses."
summary: "A troubleshooting guide: translating diagnostic-plot shapes into hypotheses to test."
track: "valid"
order: 96
duration: "13 min"
level: "advanced"
tags: ["validation", "interpretation", "residuals", "troubleshooting"]
prerequisites: ["valid-gof", "valid-diagnostics"]
glossary: ["Résidus (WRES/CWRES/IWRES/NPDE)", "GOF", "PRED / IPRED", "Erreur combinée"]
slides: []
quiz:
  - prompt: "U-shaped CWRES (negative in the middle, positive at the extremes) suggest..."
    options:
      - "a structural misspecification hypothesis"
      - "an unsuitable residual-error model (additive vs combined)"
      - "a mis-specified between-subject variability on clearance"
    correct: 0
  - prompt: "A 'trumpet'-shaped (flaring) residual cloud calls for..."
    options:
      - "revisiting the residual-error model (additive → combined)"
      - "adding a distribution compartment to the structural model"
      - "introducing a weight covariate on the volume of distribution"
    correct: 0
  - prompt: "A non-zero residual mean in a subgroup (e.g. renal impairment) suggests..."
    options:
      - "a missing covariate on a disposition parameter"
      - "mere sampling chance within this particular subgroup"
      - "a stronger residual error within this subgroup"
    correct: 0
---

<!-- step:title="Why this chapter" -->
A diagnostic plot is useless if you do not know **what to do with it**. This chapter is a **troubleshooting guide**: each residual shape maps to **likely hypotheses** and corrections to test on the model.

It is the reflex that separates the beginner ("the plot looks bad") from the modeller ("which hypotheses explain this pattern?").
<!-- /step -->

<!-- step:title="Intuition" viz="62_ResidualPatterns" -->
The **shape** of the residual cloud tells the defect. A good model leaves a **random** cloud, centred on 0, without structure.

Any **structure** — curvature, flaring, slope — is a message. Cycle through the patterns and read, for each, the interpretation and the fix.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="62_ResidualPatterns" -->
The **catalogue** pattern → hypotheses → tests:

- **Random cloud, centred on 0** → model compatible with the observed data. Nothing to change without another signal.
- **U shape** (residuals negative in the middle, positive at the extremes) → the model **underpredicts** at the extremes: structural **hypothesis**. Tests: add a **compartment**, revisit absorption/elimination, or a non-linearity.
- **Inverted U** → the opposite bias (overprediction at the extremes). Same hypothesis family: revisit the structural model.
- **Trumpet / funnel** (variance **growing** with the prediction) → possible unsuitable **residual-error model**. Tests: **proportional** or **combined** error, assay/matrix stratification if justified.
- **Slope / trend** (systematic drift) → bias compatible with a **missing covariate**, unsuitable structure or wrongly coded time.
- **Offset in a subgroup** (mean ≠ 0 in renal impairment, children…) → possible **missing covariate** on the relevant parameter (e.g. CrCl on clearance), to confirm in the model.

**How to read it — the medical-diagnosis metaphor.** The residual is a **symptom**, not the disease. A U = "curved fever" → think structure; a trumpet = "the measurement blurs when it's large" → think error model; a subgroup offset = "only some patients are affected" → think covariate, then test.

**On the maths side.** On $|IWRES|$ vs predictions, a **positive** slope = growing variance = insufficient additive error. On **CWRES vs time**, curvature = a phase (absorption or elimination) poorly described. On **η vs covariate**, a slope = a covariate to add.
<!-- /step -->

<!-- step:title="Worked example" viz="62_ResidualPatterns" -->
Warfarin: if the **CWRES vs time** draw a **U** (underprediction early and late), we **test a 2nd compartment** or a lag time. Here the Tlag already fixes most of it — the AIC confirms that 2 compartments add nothing.

If residuals **flare** at high concentrations, we **replace the additive error with a combined one** — often the best improvement on wide-range data.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Do not over-react to a pattern.

**Pitfall —** a **single** extreme point is not a pattern (check the data before adding complexity). A pattern on **individual** plots (IPRED, IWRES) may be a high-**shrinkage** artefact — rely first on **population** diagnostics (CWRES, VPC, NPDE). Finally, a fix must **improve the OFV/AIC**: otherwise you have added complexity for nothing.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- The shape of residuals translates into hypotheses: read the pattern, test the correction.
- U / inverted U → possible structure issue (compartment, absorption). Trumpet → possible error-model issue (combined).
- Slope or subgroup offset → possible missing covariate.
- Check the data before adding complexity; confirm any fix with the OFV/AIC and the VPC.
<!-- /step -->
