---
id: "pd-survival"
slug: "pd-survival"
title: "Survival studies: OS, PFS and time-to-event"
description: "Modelling the time to an event: hazard, survival, Kaplan-Meier, censoring and parametric models."
summary: "Survival analysis in pharmacometrics: OS vs PFS, hazard function, censoring, parametric models and exposure links."
track: "pd"
order: 64
duration: "15 min"
level: "advanced"
tags: ["pharmacodynamics", "survival", "time-to-event", "os-pfs"]
slides: []
quiz:
  - prompt: "The difference between OS and PFS is that..."
    options:
      - "OS measures time to death, PFS time to progression or death"
      - "OS is always shorter than PFS"
      - "they are synonyms"
    correct: 0
  - prompt: "(Right) censoring occurs when..."
    options:
      - "the event has not happened by the end of follow-up"
      - "the patient has two events"
      - "the dose is unknown"
    correct: 0
  - prompt: "Linking exposure to survival via a hazard model allows one to..."
    options:
      - "predict a dose's effect on OS/PFS"
      - "compute the AUC"
      - "measure the Cmax"
    correct: 0
---

<!-- step:title="Why this chapter" -->
In oncology and beyond, the final endpoint is neither a concentration nor a size, but a **time to event**: death (**OS**, overall survival) or progression (**PFS**, progression-free survival).

Pharmacometrics links **exposure → biomarker → survival**, allowing us to anticipate a dose's effect on clinical benefit.
<!-- /step -->

<!-- step:title="Intuition" viz="44_Survival" -->
**Survival** $S(t)$ is the probability of not having had the event by time $t$: it starts at 1 and decreases. **PFS** falls before **OS** (progressing precedes dying).

An effective treatment **shifts** these curves to the right. Adjust the hazard ratio and watch the median survival rise.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="44_Survival" -->
Everything rests on the **hazard function** $h(t)$ — the instantaneous risk of the event:

$$ S(t) = \exp\!\left(-\int_0^t h(u)\,du\right), \qquad h(t) = -\frac{S'(t)}{S(t)} $$

We choose a parametric form (exponential, **Weibull**, Gompertz, log-logistic). A covariate or exposure enters via a proportional-hazards model:

$$ h(t) = h_0(t)\,\exp(\beta\,x) $$

where $x$ can be exposure or a dynamic biomarker (tumour size) — this is the **joint model**.

**Ref —** time-to-event methodology in NLME developed notably at **IAME** (Bichat) and **Leiden**; in mathematical oncology, the **COMPO** team (Marseille — Ciccolini, Benzekry) links mechanistic models to survival.
<!-- /step -->

<!-- step:title="Worked example" viz="44_Survival" -->
In a trial, we estimate a **hazard ratio** between arms: HR = 0.65 means 35% less instantaneous risk. The **median survival** (time where $S=0.5$) summarises the benefit.

By linking AUC to hazard, we **simulate** the effect of a dosing schedule on PFS before testing it — a key use of modelling.
<!-- /step -->

<!-- step:title="The link with machine learning" viz="44_Survival" -->
ML enriches survival analysis: models such as **DeepSurv** or **Dynamic-DeepHit** learn non-linear, time-dependent hazards from many covariates.

**Ref —** work from the **van der Schaar Lab** (Cambridge — Dynamic-DeepHit, AutoPrognosis) on machine-learning survival; in applied TDM/pharmacometrics, the team of **J.-B. Woillard** (Limoges).
<!-- /step -->

<!-- step:title="Common pitfall" -->
Censoring and surrogate endpoints mislead.

**Pitfall —** ignoring **censoring** (patients not followed to the event) biases estimation: survival models handle it explicitly. And a good effect on **PFS** does not guarantee an **OS** gain (imperfect surrogate) — to be validated, never assumed.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- OS = time to death; PFS = time to progression or death (falls earlier).
- S(t) = exp(−∫h); parametric forms (Weibull…); proportional hazards h0·exp(βx).
- Link exposure/biomarker to hazard (joint model) → predict a dose's OS/PFS.
- Handle censoring; PFS is not a guaranteed surrogate for OS.
<!-- /step -->
