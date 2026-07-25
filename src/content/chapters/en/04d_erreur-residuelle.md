---
id: "erreur-residuelle"
slug: "erreur-residuelle"
title: "Residual error"
description: "What remains between the individual prediction and the observation: additive, proportional, combined error."
summary: "Modelling the residual noise: additive, proportional, combined — and how to diagnose it."
track: "core"
order: 5.5
duration: "12 min"
level: "intermediate"
tags: ["error-model", "residual", "additive", "proportional"]
prerequisites: ["variabilite-iiv-iov"]
glossary: ["Erreur additive", "Erreur proportionnelle", "Erreur combinée", "ε / σ", "Résidus (WRES/CWRES/IWRES/NPDE)"]
slides: []
quiz:
  - prompt: "A proportional residual error means the noise..."
    options:
      - "grows in proportion to the predicted value"
      - "has a constant width at all concentrations"
      - "shrinks as the predicted concentration rises"
    correct: 0
  - prompt: "A funnel-shaped |IWRES| vs predictions plot indicates..."
    options:
      - "an error model unsuited to these data"
      - "a broadly satisfactory fit of the model"
      - "a systematic bias in the structural model"
    correct: 0
  - prompt: "The combined error model is useful because it..."
    options:
      - "combines an additive floor and a proportional %CV"
      - "removes the need for inter-individual variability"
      - "forces a constant error whatever the value"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Even with the right structural model and the right inter-individual variability, a patient's prediction **never** passes exactly through their points. A gap remains: the **residual error**.

It bundles the **measurement** error (assay), the **sampling-time** errors, and everything the model does not capture. Modelling it well is essential — otherwise prediction intervals and diagnostics are wrong.
<!-- /step -->

<!-- step:title="Intuition" viz="61_ResidualError" -->
Two opposite ways to "miss": with a **constant width** (the assay has a ±0.5 mg/L precision whatever the concentration) or with a **percentage** (±10% of the value, so wider when the concentration is high).

Toggle between additive, proportional and combined: the error band should contain ~95% of the real points. That is the trade-off we seek.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="61_ResidualError" -->
Around the individual prediction $f$, the observation is:

$$ y = f + \varepsilon_{add} \quad|\quad y = f\,(1 + \varepsilon_{prop}) \quad|\quad y = f + \sqrt{a^2 + (b\,f)^2}\,\varepsilon $$

- **additive**: $\varepsilon \sim \mathcal{N}(0, a^2)$ — constant noise (good near the quantification limit);
- **proportional**: standard deviation $= b\cdot f$ — constant %CV (good at high concentrations);
- **combined**: two ways to write the standard deviation — as a **simple sum** ($\sigma = a + b\,f$, called *combined1*) or in **quadrature** ($\sigma = \sqrt{a^2 + (b f)^2}$, called *combined2*). Both mix an additive **floor** and a proportional **percentage**.

**Note —** in practice the true residual error is **rarely** exactly the quadrature form (*combined2*) that the "clean" formulas suggest. The simple sum (*combined1*, $\sigma = a + b\,f$) often describes the data just as well, or better, and is more stable to estimate. The lesson: do not copy *combined2* by default — pick the form that actually matches the residuals.

**How to read it — the scales metaphor.** A kitchen scale has a **fixed** precision (±1 g): additive error. An industrial scale reads a **percentage** (±0.5% of the load): proportional error. A real scale combines both — a floor **and** a %.

**On the maths side.** On $|IWRES|$ vs predictions, additive error gives a **flat** cloud; proportional is flat once normalised. A **funnel** (residuals widening with the prediction) betrays an additive model where a **proportional/combined** one was needed.
<!-- /step -->

<!-- step:title="Worked example" viz="61_ResidualError" -->
An LC-MS/MS assay often has a roughly constant **%CV** (e.g. 10%) across its range — hence a **proportional** error — except very near the **limit of quantification**, where an **additive** term takes over.

Hence the frequent choice of a **combined** error in practice: it covers both low **and** high concentrations.
<!-- /step -->

<!-- step:title="Common pitfall" -->
A wrong error model distorts everything else.

**Pitfall —** an **additive** error on wide-range data over-weights high concentrations and underestimates precision at low ones. Result: wrong **weighting** in estimation and unrealistic prediction intervals. Always check the error model on the $|IWRES|$ vs predictions plot before concluding.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Residual error = the gap between individual prediction and observation (measurement, timing, unmodelled).
- Additive (constant width), proportional (constant %CV), combined (floor + %).
- Combined is the realistic default: additive floor near the LOQ, % at high concentrations.
- Diagnostic: |IWRES| vs predictions; a funnel = a wrong error model.
<!-- /step -->
