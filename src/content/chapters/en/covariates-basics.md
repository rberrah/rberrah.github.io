---
id: "covariates-basics"
slug: "covariates-basics"
title: "Covariates: fixed effects, ETA and transformations"
description: "Separate systematic patient relationships from remaining interindividual variability."
summary: "Separate systematic patient relationships from remaining interindividual variability."
track: "covariates"
order: 1
duration: "12 min"
level: "intermediate"
tags: ["covariates","PK","PD"]
prerequisites: ["variabilite-iiv-iov"]
glossary: []
slides: []
sources: ["monolix-covariates","simulx-individual","lavielle","sanghavi-covariates"]
reviewed_on: "2026-09-29"
updated_on: "2026-09-30"
quiz: [{"prompt":"A covariate beta represents…","options":["a systematic effect on a parameter","an observed individual ETA","a residual variance"],"correct":0},{"prompt":"A possible link for a fraction strictly between 0 and 1 is…","options":["logit","log alone","no link can bound it"],"correct":0},{"prompt":"Weight affects CL and V:","options":["the effects can have different coefficients","one shared beta is mandatory","ETA correlation must be 1"],"correct":0}]
---

<!-- step:title="Why this chapter" viz="CovariateEffects" -->
Weight, renal function, genotype or a biomarker can explain differences in PK **or PD** parameters. One covariate can affect several parameters, with different coefficients: weight on both CL and V, for example. This does not turn ETA into a covariate.
<!-- /step -->

<!-- step:title="Intuition" -->
Keep three levels separate: measured $x_i$, its systematic effect through $\beta$, and the remaining individual deviation $\eta_i$. ETA can be correlated across parameters through $\Omega$; that correlation is not the weight–clearance relationship.

The population distribution of weight is also distinct from a parameter's conditional lognormal distribution given weight.

A covariate–parameter relationship has an **applicability domain**, including the population and range studied. A formula developed between **40 and 90 kg** is not automatically applicable at **20 or 200 kg**: that is extrapolation, requiring separate justification and validation. Staying within the range does not guarantee validity for every patient either, particularly when other characteristics differ.
<!-- /step -->

<!-- step:title="The formula unpacked" -->
For a positive parameter:
$$ \log(CL_i)=\log(CL_{ref})+\beta_{WT}\log(WT_i/70)+\eta_{CL,i},\qquad \eta_i\sim\mathcal N(0,\Omega) $$
Thus $CL_i=CL_{ref}(WT_i/70)^{\beta_{WT}}\exp(\eta_{CL,i})$. The fixed effect and ETA are additive **on the transformed scale**, but serve different roles. The typical value at zero ETA is a conditional lognormal median, not its arithmetic mean.

An identity link suits an unconstrained normal parameter; a log link ensures positivity; a logit link keeps a fraction strictly between 0 and 1. Choose the link for the parameter, not for the covariate's name.
<!-- /step -->

<!-- step:title="Worked example" viz="CovariateEffects" -->
With $CL_{ref}=4$ L/h, weight 35 kg and $\beta=0.75$, typical CL is approximately 2.38 L/h. ETA = 0.2 multiplies this by $\exp(0.2)$, giving approximately 2.91 L/h.

In Monolix, declare weight as continuous, create the centered transformation, and associate it with CL in the individual model. Configure the CL random effect separately. A different coefficient can be estimated for V, or fixed with justification. [Explore these effects](../../covariates/?lang=en).
<!-- /step -->

<!-- step:title="Common pitfall" -->
Regressing estimated ETA against weight is exploratory, not a substitute for joint population-model estimation. Shrinkage, sampling design and correlated covariates can conceal or create apparent relationships. Adding a covariate does not guarantee that every estimated variance decreases.

A predictive association is not automatically causal. Independently sampling weight, age and renal function may generate physiologically impossible individuals.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Beta describes a systematic relationship; ETA describes remaining variability.
- One covariate can have several effects.
- Reference values, units and transformations belong to the model.
- OMEGA and the covariate distribution are different objects.
- Document the studied range and distinguish extrapolation from validation.
<!-- /step -->
