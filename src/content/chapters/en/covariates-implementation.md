---
id: "covariates-implementation"
slug: "covariates-implementation"
title: "Implementing and validating covariate models"
description: "A reproducible mrgsolve and Monolix example with units, OMEGA, time-varying covariates and checks."
summary: "A reproducible mrgsolve and Monolix example with units, OMEGA, time-varying covariates and checks."
track: "covariates"
order: 5
duration: "20 min"
level: "advanced"
tags: ["covariates","mrgsolve","Monolix","validation"]
prerequisites: ["covariates-basics","covariates-groups","covariates-physiology","covariates-symbolic"]
glossary: ["Covariable","θ","η","IIV"]
slides: []
sources: ["monolix-covariates","simulx-individual","jonsson-covariates","pmetrics","hastie-esl","mrgsolve"]
reviewed_on: "2026-09-29"
review_type: "author"
quiz: [{"prompt":"With variances 0.09 and 0.04 and covariance 0.03, correlation is…","options":["0.5","0.03","1.5"],"correct":0},{"prompt":"In the structural Monolix example, IIV is configured on…","options":["Cl0 and V0","WT only","necessarily betaWT and ratioGENO"],"correct":0},{"prompt":"Prospective interpolation using a future measurement…","options":["can leak information","is always clinically more accurate","equals carrying the last value forward"],"correct":0}]
---

<!-- step:title="Why this chapter" viz="CovariateImplementation" -->
A correct equation can be duplicated, inverted or applied at the wrong time in software. This chapter connects data definitions, parameters and numerical checks. All values are **educational**, with no clinical target.
<!-- /step -->

<!-- step:title="Intuition" -->
A minimal dictionary specifies a unique name, unit, allowed categories, reference, measurement timing and missing-data handling. Each effect then specifies its target, function and coefficients.

Fixed references support comparison across cohorts. Data-driven centering or standardization must be fitted within training data and preserved for new individuals.
<!-- /step -->

<!-- step:title="The formula unpacked" -->
We combine weight and genotype:
$$ CL_i=4(WT_i/70)^{0.75}\,1.3^{GENO_i}\exp(\eta_{CL,i}),\qquad
V_i=30(WT_i/70)\exp(\eta_{V,i}). $$
$GENO$ is strictly 0 or 1. The matrix
$$ \Omega=\begin{pmatrix}0.09&0.03\\0.03&0.04\end{pmatrix} $$
has standard deviations 0.3 and 0.2 and correlation 0.5. Covariance is not correlation. Both eigenvalues must be nonnegative; here the determinant is positive.

These relationships modify parameters before PK simulation. Typical profiles set ETA and EPS to zero; population simulations add the draws specified by OMEGA and SIGMA.
<!-- /step -->

<!-- step:title="Worked example" viz="CovariateImplementation" -->
This complete mrgsolve model uses hours, mg and L. In an R project its filename is `covariates_example.cpp`:

```cpp
$PARAM TVCL=4, TVV=30, BWT=0.75, RGENO=1.3
$PARAM @annotated @covariate
WT : 70 : Weight (kg)
GENO : 0 : Genotype (0 or 1)
$CMT @annotated
CENT : Central [ADM, OBS]
$MAIN
double CL = TVCL*pow(WT/70.0,BWT)*pow(RGENO,GENO)*exp(ETA(1));
double V = TVV*(WT/70.0)*exp(ETA(2));
$OMEGA @block
0.09
0.03 0.04
$SIGMA 0.01 0
$ODE
dxdt_CENT = -(CL/V)*CENT;
$TABLE
double IPRED = CENT/V;
double DV = IPRED*(1+EPS(1))+EPS(2);
$CAPTURE CL V IPRED DV
```

This check verifies that weight affects both CL **and** V:

```r
library(mrgsolve)
mod <- mread("covariates_example", project = ".")
typical <- mod |> zero_re() |> param(WT = 35, GENO = 0)
out <- typical |> ev(amt = 100, cmt = 1) |>
  mrgsim(end = 24, delta = 0.1)
stopifnot(abs(out$CL[1] - 4*(35/70)^0.75) < 1e-8)
stopifnot(abs(out$V[1] - 15) < 1e-8)
plot(out)
```

Population simulation must also provide covariates by ID and draw ETA jointly according to OMEGA, not independently when covariance is nonzero. For longitudinal patients, event covariates must agree with their recorded history.
<!-- /step -->

<!-- step:title="Monolix implementation" -->
There are two mutually exclusive options for the same effect:
1. **Individual model**: transform the continuous covariate to `log(WT/70)`, with beta effects on Cl and V; use categorical genotype with reference 0. Ratio 1.3 corresponds to `log(1.3)` on Cl.
2. **Structural model**: read covariates as regressors and write their relationships explicitly:

```mlxtran
[LONGITUDINAL]
input = {Cl0, V0, WT, GENO, betaWT, ratioGENO}
WT = {use=regressor}
GENO = {use=regressor}
PK:
Cl = Cl0*(WT/70)^betaWT*ratioGENO^GENO
V = V0*(WT/70)
Cc = pkmodel(V, Cl)
OUTPUT:
output = {Cc}
```

To reproduce this example, set Cl0 = 4, V0 = 30, betaWT = 0.75 and ratioGENO = 1.3 in the project. Configure lognormal IIV on **Cl0 and V0**, with SDs 0.3 / 0.2 and correlation 0.5; covariate coefficients can be fixed. Do not add the same covariate effects again in the individual model.

A `[LONGITUDINAL]` file alone does not carry the complete Monolix statistical configuration. Simulx's documented `[INDIVIDUAL]` section defines distributions, but does not replace Monolix's interface configuration.
<!-- /step -->

<!-- step:title="Time, imperfect data and other methods" -->
Changing renal function must be tied to measurement dates. Last observation carried forward (LOCF) and linear interpolation make different assumptions. In prospective prediction, interpolating with a future measurement may leak information. Pmetrics `interp("none")` carries values forward, while `interp()` allows linear interpolation; the equations and a population distribution are still needed.

Other useful relationships:
- **Splines/GAMs**: $\log(CL)=\beta_0+\sum_j\beta_j B_j(x)+\eta$; preserve knots and penalize complexity.
- **Interactions**: an organ-function effect may depend on genotype; ensure sufficient subjects in each combination.
- **Regularized selection or prespecified effects**: alternatives to stepwise procedures. Repeat selection within each training fold.
- **Noisy or missing covariates**: appropriate imputation or explicit measurement-error modeling. Do not silently replace missingness with a normal physiological value.

Relationships can also modify PD parameters such as Emax, EC50 or growth rate, with suitable constraints.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Structure, coefficients, OMEGA and error model belong together. Exporting only the structure does not reconstruct the complete statistical model.

Test reference values, extremes, each category and units. Compare predictions numerically across software using identical doses, covariates and ETA. For selection or learned models, assess calibration, bias, precision and usefulness in patients excluded from development.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- One covariate definition can have several effects.
- Keep transformations and references identical across software.
- Do not duplicate the fixed effect or IIV.
- Validate numerical implementation separately from predictive relevance.
<!-- /step -->
