---
id: "valid-objective"
slug: "valid-objective"
title: "Numeric diagnostics: OFV, AIC, BIC, χ²"
description: "Comparing two models objectively: objective function, likelihood-ratio test and penalised criteria."
summary: "OFV (−2 log L), the χ² test for nested models, and the AIC/BIC criteria that penalise complexity."
track: "valid"
order: 89
duration: "13 min"
level: "advanced"
tags: ["validation", "ofv", "aic", "bic", "likelihood-ratio"]
prerequisites: ["math-regression", "math-stats"]
glossary: ["OFV", "Vraisemblance", "AIC / BIC", "FOCE-I"]
slides: []
quiz:
  - prompt: "The objective function (OFV = −2 log L) of a good model is..."
    options:
      - "lower, meaning the data are more likely under it"
      - "higher: a good model maximises the objective function"
      - "near zero, a perfect model driving it to nothing"
    correct: 0
  - prompt: "Adding a parameter always..."
    options:
      - "lowers (or matches) the OFV, hence the need to penalise complexity"
      - "lowers the OFV by at least 3.84, the χ² threshold at 5%"
      - "leaves the OFV unchanged if the parameter is non-significant"
    correct: 0
  - prompt: "The likelihood-ratio test (ΔOFV ~ χ²) applies..."
    options:
      - "to nested models (one is a special case of the other)"
      - "to any two models, nested or not, on the same data"
      - "to models fitted with different estimation methods"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Plots tell you *how* a model is wrong; **numeric diagnostics** tell you *which* of two models to choose. They all rest on one quantity: the **likelihood** of the data under the model.

Without them, we would pile up parameters endlessly. With them, we arbitrate between fit and parsimony.
<!-- /step -->

<!-- step:title="Intuition" viz="59_ModelSelection" -->
The **objective function** (OFV = $-2\log L$) measures the data's "surprise": the **lower** it is, the more probable the model makes the observations.

The catch: adding a parameter **always** lowers the OFV, even a useless one. So we need a judge asking: is the drop **larger than chance**? And is it worth the added complexity?
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="59_ModelSelection" -->
For two **nested** models (one is a special case of the other), the **likelihood-ratio test** compares the OFV drop to a **χ²** law:

$$ \Delta OFV = OFV_{reduced} - OFV_{full} \;\sim\; \chi^2_{\Delta df} \quad (\text{under } H_0) $$

**How to read it — the courtroom metaphor.** $H_0$ = "the extra parameter is useless" (presumed guilty of uselessness). The χ² sets the **reasonable-doubt threshold** (3.84 for 1 parameter at 5%). If the OFV drop **exceeds** it, the evidence suffices: we keep the parameter.

**On the maths side.** 1 parameter ⇒ threshold $\chi^2_{1,\,0.05}=3.84$; 2 ⇒ 5.99; 3 ⇒ 7.81. For **non-nested** models, χ² does not apply: we use the penalised criteria
$$ AIC = OFV + 2k, \qquad BIC = OFV + k\ln(n) $$
where $k$ = number of parameters and $n$ = number of observations. The **lowest** wins; BIC penalises harder when $n$ is large.
<!-- /step -->

<!-- step:title="Worked example" viz="59_ModelSelection" -->
Warfarin: adding a **lag time** (1 parameter) drops the OFV by tens of points — far beyond 3.84: the Tlag is **clearly justified**, and AIC/BIC confirm it.

Conversely, moving to **2 compartments** may lower the OFV a little, but not enough to offset the penalty: the **AIC rises** — more complex is not better.
<!-- /step -->

<!-- step:title="Common pitfall" -->
The OFV cannot be compared any old way.

**Pitfall —** compare the OFV only on **exactly the same data**. The χ² test requires **nested** models estimated with the **same method** (mind FOCE-I approximations). Finally, a model can win on AIC yet have **poor plots**: the number never replaces the visual diagnostics.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- OFV = −2 log L; lower = more likely data. Adding a parameter always lowers the OFV.
- Nested models: ΔOFV ~ χ² (threshold 3.84 for 1 df at 5%) — the likelihood-ratio test.
- Non-nested models: AIC = OFV + 2k, BIC = OFV + k·ln(n); the lowest wins.
- Compare on the same data; numbers complement, not replace, the plots.
<!-- /step -->
