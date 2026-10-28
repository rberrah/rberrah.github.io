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
prerequisites: ["tdm","ai-boosting"]
glossary: ["XGBoost","MAP-BE","TDM"]
sources: ["woillard-ml-tacrolimus","woillard-ml-simulation","destere-iohexol-hybrid","sayadi-ml-tdm-review","hughes-keizer","minichmayr-mipd"]
reviewed_on: "2026-07-09"
review_type: "author"
review_pending: true
reviewed_hash: "da8c27eb5fa65786e277fde06e81dc22e11bb6aaafa948cab7a3b94dba6ae8da"
quiz:
  - prompt: "The main contribution of ML to TDM is to..."
    options:
      - "predict exposure (AUC) from few samples"
      - "remove any need for a blood sample from the patient"
      - "estimate individual clearance by fitting a mechanistic ODE"
    correct: 0
  - prompt: "A hybrid PopPK + ML model aims to..."
    options:
      - "combine mechanistic structure and learning flexibility"
      - "replace the PopPK entirely with a network learned from the data"
      - "use the PopPK only to simulate ML training data"
    correct: 0
---

<!-- step:title="Why this chapter" -->
In **therapeutic drug monitoring (TDM)**, we often want to estimate a patient's drug exposure from just a few blood samples. The Bayesian (**MAP**) approach uses a population pharmacokinetic (**PopPK**) model together with the patient's measurements. That model must be suitable for the population studied. Another approach, **machine learning (ML)**, uses clinical or simulated data to learn how a few concentrations relate to drug exposure (**AUC**, the area under the concentration-time curve).

This is a very active research area, notably driven by the **Limoges** team.
<!-- /step -->

<!-- step:title="Intuition" viz="40_TreeEnsemble" -->
Rather than fitting a differential equation per patient, a **tree** model (Random Forest, XGBoost) learns a function: a few samples + covariates → **AUC**.

Once trained, the model can calculate AUC quickly and combine several pieces of information. But it does not necessarily describe how the body handles the drug. Predictions may be less reliable in patients or sampling schedules very different from those used for training.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="BayesUpdate" -->
Two families compare (and combine):

- **Bayesian (MAP)**: $posterior \propto likelihood \times prior$ — interpretable, depends on the PopPK model.
- **ML**: $\text{AUC} = f_{ML}(C_1, C_2, \text{covariates})$ — flexible, learned from a profile dataset whose size and representativeness must be documented.
- **Hybrid**: keep the PopPK and let ML correct the poorly explained part.

**Documented examples —** Woillard *et al.* studied tacrolimus AUC estimation using clinical data and then simulations from published PopPK models; Destere *et al.* evaluated a hybrid correction of iohexol clearance; Sayadi *et al.* review these uses in TDM. These studies do not evaluate the same targets or domains of use.
<!-- /step -->

<!-- step:title="Worked example" -->
For **tacrolimus**, Woillard *et al.* estimated **interdose AUC** from 2–3 concentrations: AUC₀₋₁₂ for BID and AUC₀₋₂₄ for QD dosing. In their test sets and six rich external datasets, their XGBoost models outperformed the compared MAP estimators; this result remains conditional on the formulations, sampling times and populations studied.

A **hybrid** approach (Destere et al.) combines a PopPK structure and an ML component. It must be compared with each component in independent data; "hybrid" does not automatically mean "better".
<!-- /step -->

<!-- step:title="Common pitfall" viz="46_ValidationSplit" -->
Good results in patients used to develop a model do not prove that it will work in other patients.

**Pitfall —** ML **extrapolates poorly** outside its training domain (new population, new schedule, extreme values). Without **external validation** or displayed uncertainty, performance on training data guarantees nothing at the bedside.

In the experiment, compare a random split of **rows**, a split by **patient**, and an **external center**. With repeated visits, randomly distributing rows leaves the same individual on both sides and makes evaluation overly optimistic.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- ML predicts exposure (AUC) from few samples, complementing the Bayesian approach.
- Trees can estimate AUC directly; an ML component can also correct a MAP estimate, as in the iohexol example.
- Published results concern defined uses, notably tacrolimus and iohexol; they do not establish a general superiority of ML.
- Requires validation suited to the use, ideally external, a documented training domain and uncertainty when it can be estimated.
<!-- /step -->
