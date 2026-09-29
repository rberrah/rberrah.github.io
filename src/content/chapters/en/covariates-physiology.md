---
id: "covariates-physiology"
slug: "covariates-physiology"
title: "Physiological covariates: allometry, Hill and PBPK"
description: "Represent size, maturation and organ function beyond a simple exponential."
summary: "Represent size, maturation and organ function beyond a simple exponential."
track: "covariates"
order: 3
duration: "14 min"
level: "intermediate"
tags: ["covariates","PK","PD"]
prerequisites: ["covariates-basics"]
glossary: []
slides: []
sources: ["anderson-holford-allometry","jones-rowland-yeo","goutelle-hill"]
reviewed_on: "2026-09-29"
quiz: [{"prompt":"At PMA = PMA50, maturation is…","options":["0.5","1","h"],"correct":0},{"prompt":"Adding Hill to CL…","options":["does not by itself create a PBPK model","automatically makes the model PBPK","removes individual variability"],"correct":0},{"prompt":"A renal-function factor should…","options":["respect units and the elimination component involved","always multiply total clearance","always be exponential"],"correct":0}]
---

<!-- step:title="Why this chapter" -->
An exponential is not mandatory. A covariate may modify flow, enzyme activity, volume or saturable capacity. A Hill relationship can describe maturation without drug concentration as its input.
<!-- /step -->

<!-- step:title="Intuition" -->
Separating size, maturation and organ function produces testable assumptions. Body-size allometry alone does not necessarily describe neonatal maturation. The exponent 0.75 is a common assumption, not a proven universal constant.

A PBPK model also represents organs, blood flows and physiological processes. Adding a sigmoid to compartmental CL does not make the model PBPK.
<!-- /step -->

<!-- step:title="The formula unpacked" -->
An example structure is:
$$ CL_i=CL_{70}\left(\frac{WT_i}{70}\right)^\alpha
\frac{PMA_i^h}{PMA_{50}^h+PMA_i^h}\,F_{\mathrm{organ},i}\exp(\eta_i). $$
PMA is postmenstrual age, using the same unit as $PMA_{50}$. Maturation is 0.5 at $PMA=PMA_{50}$; $h$ controls steepness. Here $CL_{70}$ is an asymptote at full maturation and reference organ function.

An Emax form $1+E_{\max}x/(EC_{50}+x)$ is another candidate, constrained to keep the factor positive. Its mathematical form does not establish a receptor mechanism.
<!-- /step -->

<!-- step:title="Worked example" -->
The workshop holds size fixed to isolate maturation. With CLmax = 4 L/h, PMA50 = 50 weeks and h = 3, PMA = 50 weeks gives CL = 2 L/h at zero ETA. These are teaching values, not estimates from a pediatric population.

In a full physiological model, renal function may modify a renal CL component rather than total clearance. Keeping renal and nonrenal contributions separate avoids imposing zero total CL arbitrarily.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Weight, age and maturation are correlated. Their contributions can be difficult to distinguish over a narrow population range. Do not substitute postnatal age for postmenstrual age without revising and reassessing the model.

Changing renal-function equations may change units or body-surface-area normalization. A saturable relationship fitted in adults does not justify pediatric extrapolation.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Define physiological components before choosing functions.
- Check units, bounds, asymptotes and reference values.
- A sigmoid is a possible relationship, not evidence of PBPK.
- Validate extrapolation in the intended population.
<!-- /step -->
