---
id: "ai-ml-tdm"
slug: "ai-ml-tdm"
title: "Machine learning for TDM"
description: "Estimating exposure (AUC) from a few samples through machine learning."
summary: "ML applied to therapeutic drug monitoring: trees, hybridisation with PopPK, work from the Limoges team."
track: "ai"
order: 13
duration: "13 min"
level: "advanced"
tags: ["ai", "machine-learning", "tdm", "limoges"]
slides: []
quiz:
  - prompt: "The main contribution of ML to TDM is to..."
    options:
      - "predict exposure (AUC) from few samples"
      - "replace the clinician"
      - "remove external validation"
    correct: 0
  - prompt: "A hybrid PopPK + ML model aims to..."
    options:
      - "combine mechanistic structure and learning flexibility"
      - "abandon all pharmacology"
      - "ignore uncertainty"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Bayesian TDM (MAP) requires a **good PopPK model** as a prior. An alternative — or complement — is to **learn** directly, from large databases, the relationship between a few concentrations and **exposure** (AUC).

This is a very active research area, notably driven by the **Limoges** team.
<!-- /step -->

<!-- step:title="Intuition" viz="20_NeuralBox" -->
Rather than fitting a differential equation per patient, a **tree** model (Random Forest, XGBoost) learns a function: a few samples + covariates → **AUC**.

Fast and non-parametric, it captures complex interactions — but remains more of a **black box** than a mechanistic model.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="BayesUpdate" -->
Two families compare (and combine):

- **Bayesian (MAP)**: $posterior \propto likelihood \times prior$ — interpretable, depends on the PopPK model.
- **ML**: $\text{AUC} = f_{ML}(C_1, C_2, \text{covariates})$ — flexible, learned from thousands of profiles.
- **Hybrid**: keep the PopPK and let ML correct the poorly explained part.

**Ref (Limoges team) —** Woillard J.-B. et al., *Clin Pharmacol Ther* 2021 (ML estimation of tacrolimus AUC); Labriffe M. et al. (ML for immunosuppressant TDM); Destere A. et al., *Clin Pharmacokinet* 2022 (hybrid PopPK + ML, iohexol clearance); Sayadi H. et al. (role of ML models for optimised TDM); Berrah R. et al., *Ther Drug Monit* (residual error as a hidden lever in MIPD).
<!-- /step -->

<!-- step:title="Worked example" viz="BayesUpdate" -->
For **tacrolimus** (transplantation), estimating AUC₀₋₂₄ from 2–3 samples is crucial. ML models reach accuracy comparable to — or better than — classic Bayesian estimators, provided a **rich training database**.

The **hybrid** approach (Destere et al.) combines the best of both: PopPK structure + ML correction.
<!-- /step -->

<!-- step:title="Common pitfall" -->
A good internal score does not make a good clinical tool.

**Pitfall —** ML **extrapolates poorly** outside its training domain (new population, new schedule, extreme values). Without **external validation** or displayed uncertainty, performance on training data guarantees nothing at the bedside.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- ML predicts exposure (AUC) from few samples, complementing the Bayesian approach.
- Trees (XGBoost), hybrid PopPK + ML models (Destere), variable selection (Woillard, Labriffe).
- Flagship cases: tacrolimus, iohexol; work from the Limoges team (Woillard, Sayadi, Berrah).
- Requires external validation, uncertainty and caution when extrapolating.
<!-- /step -->
