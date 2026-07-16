---
id: "monolix-erreur-residuelle"
slug: "monolix-erreur-residuelle"
title: "Monolix — the residual error model and censoring"
description: "The DEFINITION block: errorModel constant, proportional, combined1 and combined2, the role of distribution, native BLQ censoring and how to read IWRES."
summary: "Choosing g(f) in Monolix: the four errorModel keywords and their maths, combined1 versus combined2, normal versus logNormal, BLQ treated as censoring, and the IWRES that judge it all."
track: "monolix"
order: 4
duration: "12 min"
level: "intermediate"
tags: ["monolix", "mlxtran", "error-model", "bql", "residuals"]
prerequisites: ["tools-monolix"]
glossary: []
slides: []
sources: ["monolix", "lavielle", "beal-bql", "savic-karlsson-shrinkage"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "You switch a model from `combined1(a, b)` to `combined2(a, b)`, keeping the same values of a and b. The residual standard deviation changes most..."
    options:
      - "at the concentration f = a/b, where combined1 is exactly the square root of 2 times wider than combined2: that is their maximum gap"
      - "at high concentrations, where the proportional term b·f dominates and where combined1, adding standard deviations, runs away"
      - "at low concentrations, where the additive term a dominates and where the squaring in combined2 crushes the noise floor"
    correct: 0
  - prompt: "In `DEFINITION:`, you write `{distribution=logNormal, prediction=Cc, errorModel=constant(a)}` and SAEM returns a = 0.15. This means that..."
    options:
      - "a lives on the log scale: the error is y = f·exp(0.15·e), i.e. a CV of about 15 %, and not a noise floor of 0.15 mg/L"
      - "a lives on the observation scale: it is a noise floor of 0.15 mg/L, exactly as it would be with distribution=normal"
      - "a is indeed a standard deviation in mg/L, but referred to the median of the prediction rather than to its arithmetic mean"
    correct: 0
  - prompt: "A data row carries cens = 1 in a column declared with the censored type, and the LOQ in the observation column. Monolix brings that point into the likelihood..."
    options:
      - "through the probability that the concentration lies below the LOQ, i.e. Phi((LOQ - f)/g): this is Beal's M3, with nothing to code"
      - "through the normal density evaluated at LOQ/2, a value that Monolix imputes in place of the point just before estimation"
      - "not at all: the point is dropped from estimation, and the column only serves to flag it in the output diagnostic plots"
    correct: 0
  - prompt: "On the IWRES versus predictions plot, the cloud is wide at low predictions and narrows markedly at high ones. The most likely explanation is that..."
    options:
      - "the declared error is too small at the bottom of the range: the model is proportional only and the additive floor is missing"
      - "the declared error is too small at the top of the range: the model is constant only and the proportional term is missing"
      - "the structural model describes the terminal phase badly: the shape of the curve is at fault, not the residual error model"
    correct: 0
---

<!-- step:title="Why this chapter" -->
The residual error model fits in one keyword at the end of a `DEFINITION:` line. People often pick it last, out of habit, telling themselves it is "only noise".

That is a misreading. Every observation enters the likelihood **divided by its residual standard deviation**. So that keyword does not describe noise: it distributes the **weights** of the estimation. It decides which points SAEM must respect and which ones it is allowed to miss. Changing `constant` into `proportional` changes the question SAEM answers — and it will answer it perfectly, silently, never warning you that it is optimising something other than what you meant.

Monolix adds two things NONMEM does not offer in this form: a **second** combined model (`combined1` and `combined2` are not two spellings of the same thing), and **native** handling of censoring — BLQ is declared in the dataset, not in the code.
<!-- /step -->

<!-- step:title="Intuition" viz="61_ResidualError" -->
The error model answers a single question: **how far from its prediction does an observation have to be before it becomes surprising?**

A real assay has two noise regimes, and they have nothing to do with each other:

- a **floor**, in mg/L, indifferent to the concentration — background noise, baseline, everything that remains when there is almost nothing left to measure. That is `constant(a)`;
- a **percentage**, which grows with the concentration — dilutions, pipetting, calibration. That is `proportional(b)`.

A PK dataset routinely spans two or three orders of magnitude, from the peak to the last trough. So it crosses both regimes. No single-term model is right across the whole range: that is exactly why the **combined** models exist, and why they are the default answer.

:::key
The real lever is elsewhere: $g(f)$ is the **weight**. In the likelihood, a point costs $(y-f)^2/g^2$. Small $g$ = point declared precise = heavy point. Declaring a proportional error tells SAEM "the troughs are my precise points, obey them". Declaring a constant error tells it "the peak and the trough are equally precise" — and since only high points can produce large deviations in mg/L, they are the ones that will dominate the sum. You are not describing an assay: you are arbitrating which part of the profile the model is allowed to miss.
:::
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="61_ResidualError" -->
Monolix writes every observation in a single form:

$$ h(y_{ij}) = h(f_{ij}) + g(f_{ij}) \cdot \varepsilon_{ij}, \qquad \varepsilon_{ij} \sim \mathcal{N}(0,1) $$

A `DEFINITION:` line does nothing but fill the two slots of that formula:

- `distribution=` picks $h$, the **transformation** of the observation;
- `errorModel=` picks $g$, the **standard-deviation function**.

These are two **independent** settings, and half the misunderstandings come from conflating them.

**The four `errorModel` keywords.**

| errorModel | $g(f)$ | what it claims |
|---|---|---|
| `constant(a)` | $a$ | floor only, in mg/L |
| `proportional(b)` | $b \cdot f$ | percentage only |
| `combined1(a, b)` | $a + b \cdot f$ | **standard deviations** add |
| `combined2(a, b)` | $\sqrt{a^2 + (b \cdot f)^2}$ | **variances** add |

```
DEFINITION:
y1 = {distribution=normal, prediction=Cc, errorModel=constant(a)}
y1 = {distribution=normal, prediction=Cc, errorModel=proportional(b)}
y1 = {distribution=normal, prediction=Cc, errorModel=combined1(a, b)}
y1 = {distribution=normal, prediction=Cc, errorModel=combined2(a, b)}
```

**combined1 versus combined2.** This is not a matter of taste. `combined2` is the model you obtain by assuming **two independent noise sources** — a floor with standard deviation $a$ and a proportional term with standard deviation $b f$. Independence, therefore **variances** add: $g^2 = a^2 + (bf)^2$. That is the form with a statistical justification. `combined1` adds the **standard deviations**: no pair of independent sources produces that; it is a convenient linear parameterisation of the standard deviation, nothing more.

Their gap can be computed exactly. Writing $r = bf/a$ for the ratio of the two regimes:

$$ \frac{g_{\text{combined1}}}{g_{\text{combined2}}} = \frac{1+r}{\sqrt{1+r^2}} $$

That ratio equals 1 at both ends ($r \to 0$: both equal $a$; $r \to \infty$: both equal $bf$) and it is **maximal at $r = 1$**, that is, exactly at the concentration $f = a/b$ where the two regimes balance. There it equals $\sqrt{2}$. So: `combined1` is **never** narrower than `combined2`, and it is at most **41 % wider**, within a narrow band of concentrations in the middle of the range.

Two practical consequences, pulling in opposite directions:

1. The two models **fit almost identically**. Their difference is confined to the middle of the range. Choosing between them on a 2-point $\Delta$OFV is choosing between noise.
2. Their parameters are **not interchangeable**. An $a$ and a $b$ estimated under `combined1` do not describe the same error once copied into `combined2`.

:::key
This point decides translations from NONMEM. The canonical `Y = F + F*EPS(1) + EPS(2)` gives $\mathrm{Var}(y) = \sigma_1^2 F^2 + \sigma_2^2$, hence a standard deviation $\sqrt{\sigma_2^2 + (\sigma_1 F)^2}$: that is **`combined2`**, with $a = \sigma_2$ and $b = \sigma_1$. NONMEM's default combined model, and the `W = SQRT(THETA(4)**2 + (THETA(5)*IPRED)**2)` parameterisation from the NONMEM chapter, are both `combined2`. `combined1` would correspond to `W = THETA(4) + THETA(5)*IPRED`. Translating a NONMEM model into `combined1` because the name comes first in the list is a silent mistake.
:::

**`distribution`: normal versus logNormal.**

- `normal`: $h$ = identity, so $y = f + g\varepsilon$. The support is the whole of $\mathbb{R}$: the model grants non-zero probability to **negative** concentrations. Harmless while $f \gg g$, absurd as soon as $f$ approaches the LOQ — and it shows, the lower VPC band dips below zero.
- `logNormal`: $h = \log$, so $\log(y) = \log(f) + g\varepsilon$, i.e. $y = f \cdot e^{g\varepsilon}$. Strictly positive support, right-skewed distribution.

With `logNormal` **and** `constant(a)`, you recover exactly the **exponential** error model: $y = f \cdot e^{a\varepsilon}$. Since $e^{a\varepsilon} \approx 1 + a\varepsilon$ for small $a$, the standard deviation on the natural scale is about $a \cdot f$: the model behaves like a proportional one, but never returns a negative value.

:::pitfall
Under `logNormal`, the parameter `a` lives on the **log** scale. It is **dimensionless**: it is a CV, not a concentration. Exactly, $CV = \sqrt{e^{a^2}-1}$, i.e. 15.1 % for $a = 0.15$. The keyword is the same, the syntax is the same, the unit changes with `distribution`. Reading "$a = 0.15$" as a 0.15 mg/L floor while the distribution is logNormal produces a perfectly plausible and perfectly wrong number.
:::

Corollary: under `logNormal`, `constant(a)` **already produces** an error proportional to the prediction. Stacking a `proportional(b)` on top counts the same effect twice. The pairing is syntactically legal; it is rarely what you meant.

**Censoring (BLQ).** An observation "< LOQ" is neither a missing value nor a number: it is an **inequality**. It states that the true concentration lies somewhere in $(0, LOQ)$ — and that is real information, often the only information you hold about the terminal phase.

Monolix takes it at face value, and does so in the **dataset**, not in the model. You declare a column with the `censored` type (usually `cens`): `cens = 1` marks a left-censored point, and the observation column then carries the **LOQ itself**, not an imputed value. An optional `limit` column supplies the other bound of the interval.

What changes in the likelihood comes down to one word. An ordinary observation contributes a **density**:

$$ \frac{1}{g_{ij}}\,\varphi\!\left(\frac{y_{ij} - f_{ij}}{g_{ij}}\right) $$

a censored observation contributes a **probability**:

$$ P(y_{ij} < LOQ) = \Phi\!\left(\frac{LOQ - f_{ij}}{g_{ij}}\right) $$

This is Beal's **M3**, and that is all there is to it: you tick a column type, Monolix writes the likelihood. Where NONMEM asks for an `F_FLAG`, a hand-coded `PHI` and a `LAPLACIAN`, censoring is here an attribute of the **data**. This is not a convenience detail: since M3 now costs nothing to adopt, there is no excuse left for a LOQ/2.

Note that $g$ appears in the censored contribution **too**. The error model and censoring are not two independent choices: it is the additive term $a$ that governs how fast $\Phi((LOQ-f)/g)$ saturates as $f$ drops below the LOQ.

:::note
Ref.: Monolix / MonolixSuite documentation (Lixoft — Simulations Plus) for the `DEFINITION:` syntax and the column types; Lavielle M., *Mixed Effects Models for the Population Approach* (Chapman & Hall/CRC) for the $h(y) = h(f) + g\varepsilon$ formulation; Beal S.L., *J Pharmacokinet Pharmacodyn* 2001 for the M1-M7 methods of handling data below the LOQ.
:::
<!-- /step -->

<!-- step:title="Worked example" viz="62_ResidualPatterns" -->
An oral drug, rich profiles over 24 h, concentrations from 4 mg/L at the peak down to the LOQ at **0.05 mg/L** — nearly two orders of magnitude. SAEM runs with `combined2` and returns $a = 0.02$ mg/L and $b = 0.12$.

The two regimes, in numbers. The switch sits at $f = a/b = 0.167$ mg/L:

| prediction $f$ | $g$ under combined2 | $g$ under combined1 | gap |
|---|---|---|---|
| 0.05 (the LOQ) | 0.021 | 0.026 | +24 % |
| 0.167 ($=a/b$) | 0.028 | 0.040 | **+41 %** |
| 1.0 | 0.122 | 0.140 | +15 % |
| 4.0 (the peak) | 0.480 | 0.500 | +4 % |

You can read the previous section's result straight off the table: the gap peaks at $\sqrt{2}$ at the switching point and vanishes at both ends.

**Why the floor exists.** Take a late trough: observation $y = 0.09$ mg/L, individual prediction $f = 0.06$ mg/L. The gap is 0.03 mg/L — 30 ng/mL, roughly the assay's noise at that level. An unremarkable point.

- Under `combined2(0.02, 0.12)`: $g = \sqrt{0.02^2 + 0.0072^2} = 0.0213$, so $\text{IWRES} = 0.03/0.0213 = 1.41$. Nothing to report, and rightly so.
- Under `proportional(0.12)` alone: $g = 0.12 \times 0.06 = 0.0072$ mg/L, i.e. **7.2 ng/mL**. The model has just claimed it resolves this concentration to within 7 ng/mL — seven times finer than the assay's own LOQ. $\text{IWRES} = 0.03/0.0072 = 4.17$. A 4-sigma outlier, **manufactured entirely by the error model**.

This is not cosmetic. That single observation weighs about **13 more units of $-2LL$** under `proportional` than under `combined2`. SAEM does as it is told: it will distort $Cl$ and $V$ across the whole population to reach for that one trough. The additive term is not a nuisance parameter — it is the claim that the assay has a noise floor, and it is what stops the likelihood from taking near-zero predictions seriously.

**How you see it.** IWRES is the residual divided by the standard deviation the error model **claims**:

$$ \text{IWRES}_{ij} = \frac{y_{ij} - f_i(t_{ij})}{g(f_i(t_{ij}))} $$

That division is the whole point of the diagnostic: if $g$ is right, the IWRES form a normal cloud centred on 0, with a standard deviation of 1, and the **same width everywhere**. Hence the plot that judges the error model — IWRES against **predictions**, not against time — and the reading rule: read the **width**, not the centre.

- Cloud **opening** to the right (narrow at the bottom, wide at the top): $g$ is too small at high concentrations. You are on `constant`, the percentage is missing.
- Cloud **narrowing** to the right (wide at the bottom, narrow at the top): $g$ is too small at low concentrations. You are on `proportional`, the floor is missing — this is the 4-sigma trough above, repeated across every subject.
- **Curved** cloud, or one not centred on 0: this no longer speaks about the error model. A U against time accuses the **structural** model. No error model repairs a shape mistake: it merely widens the band until the misfit stops being flagged.

:::recall
A check that costs two seconds: $a$ should land in the neighbourhood of the assay's noise, hence the same order as the LOQ. Here $a = 0.02$ for a LOQ of 0.05 — consistent. If SAEM hands you $a = 0.6$ mg/L with the same LOQ, $a$ is no longer measuring the assay: it is **soaking up** a structural flaw. Look at the curve before accepting the number.
:::
<!-- /step -->

<!-- step:title="Common pitfall" -->
The obvious mistake — leaving `constant` on a dataset spanning two orders of magnitude — is **loud**: the IWRES cloud flares into a trumpet, and you see it in three seconds. Loud, therefore cheap.

:::pitfall
The real trap is the opposite: IWRES that look **too good**. Sparse design, three samples per subject, three random effects. You run `combined2`, you open the IWRES cloud: tight band, no trumpet, no trend, IWRES standard deviation at 0.55. It looks like the finest residual plot of your career. It is nothing of the sort. With three observations and three individual parameters, SAEM can nearly **interpolate** each subject's points: the individual predictions pass through the data, the individual residuals collapse toward zero, and the IWRES shrink with them. This is $\varepsilon$-shrinkage, and it is measurable: $\varepsilon\text{-shrinkage} = 1 - \mathrm{SD}(\text{IWRES}) = 45\ \%$. You are not looking at your error model, you are looking at your **design**. Nearly half of the signal that should have been in these residuals has been absorbed by the individual parameters — and with it, the plot's ability to detect anything at all. Under $\varepsilon$-shrinkage, a **wrong** error model yields the same beautiful cloud.
:::

Two reflexes follow.

**Read $\mathrm{SD}(\text{IWRES})$ before the shape of the cloud.** It is one line on the residuals Monolix exports. Far from 1, the plot has no detection power left, and the flatness of the cloud proves **nothing** about $g$. The sequence is: the number first, only then the shape.

**Then change diagnostic.** $\varepsilon$-shrinkage hits everything that conditions on the individual parameters. Move to **simulation-based** diagnostics — VPC, NPDE: they are built by simulating from the population model, so they see the error model you actually declared, and not the one that survives once each subject has been fitted to its own points.

:::note
Do not confuse the two shrinkages. The $\eta$-shrinkage of the previous chapter concerns the **random effects** and damages the ETA-versus-covariate plots. $\varepsilon$-shrinkage concerns the **residuals** and damages the IWRES. Same cause — a design that is uninformative per subject — but two different victims, and you have to read both.
:::
<!-- /step -->

<!-- step:title="Key takeaways" -->
- The error model does not describe noise: $g(f)$ is the **weight** of each point in the likelihood. It arbitrates which part of the profile SAEM is allowed to miss.
- A `DEFINITION:` line fills two **independent** slots of $h(y) = h(f) + g\varepsilon$: `distribution=` picks $h$, `errorModel=` picks $g$.
- The four $g$ functions: `constant(a)` $= a$; `proportional(b)` $= bf$; `combined1(a,b)` $= a+bf$; `combined2(a,b)` $= \sqrt{a^2+(bf)^2}$.
- `combined2` adds the **variances** (two independent sources) and is the equivalent of NONMEM's `Y = F + F*EPS(1) + EPS(2)`; `combined1` adds the standard deviations. `combined1` is never narrower, at most $\sqrt{2}$ times wider, exactly at $f = a/b$. The $(a, b)$ do not transfer from one to the other.
- `logNormal` + `constant(a)` = exponential error $y = f e^{a\varepsilon}$: positive support, and `a` on the **log** scale — a CV, not mg/L.
- BLQ: a `censored`-type column, the LOQ in the observation column. The point contributes $\Phi((LOQ-f)/g)$ — Beal's M3, native, no code, and therefore no reason left to impute LOQ/2.
- Judge $g$ on IWRES against **predictions**, reading the **width**: cloud opening = missing percentage; narrowing = missing floor; curved = structural, not residual.
- $\mathrm{SD}(\text{IWRES})$ before the shape. $\varepsilon\text{-shrinkage} = 1 - \mathrm{SD}(\text{IWRES})$: when it is high, a beautiful IWRES cloud proves nothing — move to the VPC and NPDE.
<!-- /step -->
</content>
</invoke>
