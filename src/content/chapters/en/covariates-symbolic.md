---
id: "covariates-symbolic"
slug: "covariates-symbolic"
title: "From neural networks to symbolic covariate models"
description: "Learn a nonlinear relationship and propose an interpretable equation."
summary: "Learn a nonlinear relationship and propose an interpretable equation."
track: "covariates"
order: 4
duration: "13 min"
level: "intermediate"
tags: ["covariates","PK","PD"]
prerequisites: ["covariates-basics"]
glossary: []
slides: []
sources: ["wahlquist-symbolic-covariates","cranmer-symbolic","hastie-esl"]
reviewed_on: "2026-09-29"
quiz: [{"prompt":"An equation that mimics a network well…","options":["still needs validation against observations","must be causal","automatically inherits clinical validation"],"correct":0},{"prompt":"Training/test splitting should generally be…","options":["by patient","random across samples from the same patient","after final equation selection"],"correct":0},{"prompt":"Does a deterministic symbolic equation supply OMEGA?","options":["no, variability must be modeled and estimated","yes, always","only if the formula is short"],"correct":0}]
---

<!-- step:title="Why this chapter" -->
A network may learn relationships too complex for a few powers. The pharmacometric goal remains understanding which function modifies a parameter and predicting new individuals, not merely minimizing training error.
<!-- /step -->

<!-- step:title="Intuition" -->
There are two distinct routes: train a network and then approximate it with an equation, or directly learn a symbolic network built from interpretable operations.

Wahlquist and colleagues studied the latter with propofol data. Their structure discovery is deterministic; it does not automatically provide a random-effects distribution. Subsequent mixed-effects integration is additional work.
<!-- /step -->

<!-- step:title="The formula unpacked" -->
One architecture preserves mechanistic PK:
$$ \theta_i=g_\phi(x_i),\qquad \dot A_i=f(A_i,\theta_i,D_i). $$
Symbolic regression then seeks an expression $s(x)$ balancing fidelity to $g_\phi$ and simplicity. For example:
$$ CL_i=\theta\exp\{\beta\log(z_i)+b(z_i-1)^2+\eta_i\},\qquad z_i=REN_i/REN_{ref}. $$
This is **illustrative**, not a published propofol equation or a model learned in the workshop. Adding ETA requires an explicitly specified statistical modeling step.
<!-- /step -->

<!-- step:title="Worked example" -->
A reproducible protocol:
1. Split training, validation and test patients before transformations.
2. Train with positivity, unit and domain constraints.
3. Search equations using only data allowed for development.
4. Select complexity on validation, then freeze the structure.
5. Reestimate coefficients, variability and error in the full PK/PD model.
6. Evaluate untouched test patients, then an external population.

Measure equation–network disagreement separately from observation-prediction error. Faithfully imitating a poor network does not yield a good clinical model.
<!-- /step -->

<!-- step:title="Common pitfall" -->
A short formula can extrapolate badly: near-zero denominators, powers of negative inputs or explosive out-of-domain behavior. Readability establishes neither causality nor biology.

Choosing the final equation after inspecting test performance contaminates the test. Splitting samples from the same patient between training and test also leaks information.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Network distillation and directly learned symbolic networks are different routes.
- Keeping a PK/PD structure does not validate learned relationships.
- Freeze and test the final equation, not only the network.
- Document domain, transformations, version, uncertainty and limitations.
<!-- /step -->
