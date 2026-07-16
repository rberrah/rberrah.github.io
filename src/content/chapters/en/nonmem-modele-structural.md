---
id: "nonmem-modele-structural"
slug: "nonmem-modele-structural"
title: "NONMEM — the structural model"
description: "The control stream block by block: pre-programmed ADVANs against a hand-written ODE system, choosing the TRANS, and getting the scaling right."
summary: "Writing the deterministic skeleton of a NONMEM model: the map of blocks, ADVAN1 to ADVAN4 against ADVAN13 with DES, why we parameterise in CL and V, and why S2 decides everything."
track: "nonmem"
order: 211
duration: "10 min"
level: "intermediate"
tags: ["nonmem", "control-stream", "advan", "trans", "ode"]
prerequisites: ["tools-nonmem"]
glossary: []
slides: []
sources: ["nonmem", "bauer-nonmem-1", "owen-fiedler-kelly", "rowland-tozer"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "For a one-compartment oral model with linear elimination, why prefer ADVAN2 over ADVAN13?"
    options:
      - "ADVAN2 evaluates an exact closed-form solution, with no numerical integrator and no tolerance to tune."
      - "ADVAN2 allows between-subject variability on KA, which the general ADVAN13 routine does not permit."
      - "ADVAN2 infers the required scaling automatically from the volume estimated in the parameter block."
    correct: 0
  - prompt: "Why parameterise in CL and V (TRANS2) rather than in the elimination rate constant (TRANS1)?"
    options:
      - "CL and V are the primary parameters: covariates and allometry apply to each separately and stay interpretable."
      - "TRANS1 is incompatible with depot routines and therefore cannot describe first-order oral absorption at all."
      - "The elimination rate constant is estimated with lower precision because it spans several orders of magnitude."
    correct: 0
  - prompt: "Doses are in mg, the volume is in L, and the measured concentrations are reported in ng/mL. Which scaling of the central compartment is correct?"
    options:
      - "S2 = V/1000, because A(2)/V yields mg/L, which is 1000 times smaller than the same value read in ng/mL."
      - "S2 = V*1000, because the milligrams in which the dose is expressed must first be converted to micrograms."
      - "S2 = V, because NONMEM reconciles the units on its own from the columns declared in the input block."
    correct: 0
---

<!-- step:title="Why this chapter" -->
The **structural model** is the deterministic skeleton: the concentration the model would predict for a patient carrying no random effects at all. Everything else — variability, covariates, residual error — is grafted onto it. If the skeleton is wrong, no amount of statistical refinement will rescue it.

In NONMEM this skeleton is not picked from a menu: it is **declared**, spread across several blocks that must agree with one another. NM-TRAN checks **syntax**, never **intent**. A control stream can compile, run and converge while describing a model you never meant to write — and that is what this chapter is really about.
<!-- /step -->

<!-- step:title="Intuition" viz="OralAbsorptionExplorer" -->
Writing a structural model means answering two independent questions.

**Which shape?** How many compartments, which route of entry, linear or saturable elimination. That is pharmacology, and the data decide it.

**How do we compute it?** NONMEM offers two roads to the *same* prediction:

- a **pre-programmed ADVAN routine**, holding the closed-form solution of the system, solved once and for all;
- an **ODE system** you write by hand, which NONMEM integrates numerically at every evaluation.

The analogy: to evaluate an integral you can use the known antiderivative, or run a numerical quadrature. Both return the same value; the antiderivative is exact and instant, the quadrature is general but costs time and introduces a tolerance you have to tune.

:::key
The shape is pharmacology, the road is computing. Choose the shape first, then the cheapest road that can compute it — never the other way round.
:::
<!-- /step -->

<!-- step:title="The formula, unpacked" -->
### The map of blocks

A control stream is a sequence of blocks introduced by a dollar sign. Their order is not decoration: NM-TRAN reads them top to bottom, and some depend on the ones above.

| Block | Role |
|---|---|
| `$PROBLEM` | A free-text title echoed at the top of the listing. No effect on the computation. |
| `$INPUT` | Names the data columns **in the order they appear**. |
| `$DATA` | The file, and which lines to skip. |
| `$SUBROUTINE` | Picks the ADVAN routine and the TRANS parameterisation. |
| `$MODEL` | Declares the compartments — general routines only. |
| `$PK` | Computes the model parameters for each individual. The structural model lives here. |
| `$DES` | The derivatives, if you write your own ODEs. |
| `$ERROR` | Links the prediction to the observation. |
| `$THETA` | Initial values and bounds for the fixed effects. |
| `$OMEGA` | Variances of the between-subject random effects. |
| `$SIGMA` | Variances of the residual error. |
| `$ESTIMATION` | The method and its options. |
| `$COVARIANCE` | Standard errors of the estimates. |
| `$TABLE` | What gets written to disk for diagnostics. |

:::pitfall
Columns are matched **by position, not by name**. NM-TRAN never reads the CSV header — `IGNORE=@` exists precisely to skip it. Insert a column in the middle of the file without updating the block, and everything shifts silently: body weight becomes time, and the model converges anyway.
:::

### The system ADVAN2 solves

Take one compartment with first-order absorption. Two quantities evolve: $A_1$ at the absorption site, $A_2$ in the central compartment.

$$ \frac{dA_1}{dt} = -k_a A_1, \qquad \frac{dA_2}{dt} = k_a A_1 - \frac{CL}{V} A_2 $$

For a single dose $D$ with bioavailable fraction $F$, this system has a closed-form solution:

$$ C(t) = \frac{F D}{V} \cdot \frac{k_a}{k_a - k} \left( e^{-k t} - e^{-k_a t} \right), \qquad k = \frac{CL}{V} $$

That is exactly what ADVAN2 contains. The routine integrates nothing: at each event record it restarts from the current amounts and applies the analytical solution up to the next event. Hence its speed, and the complete absence of any integration tolerance.

### Choosing a routine

The analytical routines cover the usual shapes. The central-compartment column is the one that governs scaling, and that is the detail you pay for.

| Routine | Structure | Central compartment | Usual parameterisation |
|---|---|---|---|
| `ADVAN1` | 1 cpt, direct input (IV) | cmt 1 → `S1` | TRANS2: CL, V |
| `ADVAN2` | 1 cpt, depot + first-order absorption | cmt 2 → `S2` | TRANS2: CL, V, KA |
| `ADVAN3` | 2 cpt, direct input (IV) | cmt 1 → `S1` | TRANS4: CL, V1, Q, V2 |
| `ADVAN4` | 2 cpt, depot + first-order absorption | cmt 2 → `S2` | TRANS4: CL, V2, Q, V3, KA |

With the depot routines, the dose enters compartment 1 and the observation is read from compartment 2. Adding an absorption step therefore **shifts the whole numbering**.

### TRANS: why CL and V

The TRANS changes neither the model nor the prediction — only the parameters you must supply. For ADVAN2 there are two options:

- **TRANS1** expects `K` and `KA`;
- **TRANS2** expects `CL`, `V` and `KA`.

Note the asymmetry straight away: under TRANS1 the volume is not a parameter of the routine, yet you still have to supply it through the scaling. You end up writing it either way.

The real argument lies elsewhere. Clearance and volume are the **primary** parameters: they map onto two distinct physiological realities — a capacity to clear per unit time, and a space of dilution. The elimination rate constant is a **hybrid derived** from both:

$$ k = \frac{CL}{V} $$

Three practical consequences follow.

**Covariates.** Renal function acts on clearance, body size on the distribution space. Placed on clearance, a covariate says something testable. Placed on a hybrid constant, it blends two mechanisms and stops meaning anything.

**Allometry.** The canonical exponents are 0.75 on clearance and 1 on volume. They can only be written cleanly on primary parameters.

**Variability.** Under a log-normal parameterisation, the eta carried by the elimination rate constant is not a free eta — it is a **difference**:

$$ k_i = \frac{\theta_{CL} e^{\eta_1}}{\theta_V e^{\eta_2}} = \frac{\theta_{CL}}{\theta_V} e^{\eta_1 - \eta_2}, \qquad \operatorname{Var}(\eta_1 - \eta_2) = \omega_1^2 + \omega_2^2 - 2\,\omega_{12} $$

A single variance estimated on that difference **confounds** the variability of clearance, that of volume, and their covariance. The three become inseparable, and nothing recovers them afterwards.

### When to write your own ODEs

The general routines — ADVAN6, ADVAN8, ADVAN13 — numerically integrate a system you supply. ADVAN13 is the common choice today. It demands two extra blocks: the compartment declarations, and the derivatives.

Here is saturable elimination, which **no** analytical depot routine can describe:

```
$SUBROUTINE ADVAN13 TOL=6

$MODEL
  COMP=(DEPOT,DEFDOSE)
  COMP=(CENTRAL,DEFOBS)

$PK
  KA = THETA(1)*EXP(ETA(1))
  V  = THETA(2)*EXP(ETA(2))
  VM = THETA(3)*EXP(ETA(3))
  KM = THETA(4)
  S2 = V

$DES
  CONC    = A(2)/V
  DADT(1) = -KA*A(1)
  DADT(2) =  KA*A(1) - VM*CONC/(KM + CONC)
```

Two details that cost hours. Inside the derivatives the concentration has to be recomputed by hand: the scaled prediction is not available there. And `TOL` sets the precision demanded of the integrator — too loose, and numerical noise leaks into the gradient and derails the minimisation.

:::note
Between the two extremes sits a forgotten middle ground: ADVAN5 and ADVAN7 handle any **linear** structure algebraically, with no numerical integration. For a chain of transit compartments or a parent-metabolite scheme, they are far faster than ADVAN13 for an identical result. The rule: standard shape → analytical routine; linear but unusual → ADVAN5 or ADVAN7; non-linear → ADVAN13.
:::
<!-- /step -->

<!-- step:title="Worked example" viz="OralAbsorptionExplorer" -->
An oral antibiotic, single 500 mg dose, 40 volunteers, plasma concentrations in mg/L over 24 hours. One compartment is enough. The complete control stream:

```
$PROBLEM  Oral antibiotic - 1 cpt, first-order absorption, single 500 mg dose

$INPUT    ID TIME AMT DV MDV EVID WT
$DATA     oral500.csv IGNORE=@

$SUBROUTINE ADVAN2 TRANS2

$PK
  TVCL = THETA(1)
  TVV  = THETA(2)
  TVKA = THETA(3)

  CL = TVCL*EXP(ETA(1))
  V  = TVV *EXP(ETA(2))
  KA = TVKA*EXP(ETA(3))

  S2 = V

$ERROR
  IPRED = F
  Y     = IPRED*(1 + EPS(1)) + EPS(2)

$THETA
  (0, 12)     ; 1 CL/F (L/h)
  (0, 60)     ; 2 V/F  (L)
  (0, 1.2)    ; 3 KA   (1/h)

$OMEGA
  0.09        ; IIV CL - CV 31 %
  0.04        ; IIV V  - CV 20 %
  0.16        ; IIV KA - CV 42 %

$SIGMA
  0.01        ; proportional - 10 %
  0.0025      ; additive - SD 0.05 mg/L

$ESTIMATION METHOD=1 INTER MAXEVAL=9999 PRINT=5 NOABORT
$COVARIANCE PRINT=E
$TABLE      ID TIME DV IPRED CWRES ETA1 ETA2 ETA3 ONEHEADER NOPRINT FILE=sdtab001
```

Line by line, what actually matters:

`IGNORE=@` skips every line whose first non-blank character is a letter or an at-sign — so the header and the comments, in one option.

`ADVAN2 TRANS2` fixes the shape and the expected parameters at once: from then on the three names `CL`, `V` and `KA` are **mandatory**, spelling included. Write `CLE` instead of `CL` and the routine never finds its clearance.

In the parameter block, splitting `TVCL` from `CL` looks gratuitous in a model without covariates. It is not: this is the slot where covariates will later be inserted, upstream of the exponential. Adopting the habit now saves a rewrite later.

`S2 = V` is the decisive line. It states that the prediction is the amount in compartment 2 divided by the volume — therefore a concentration in mg/L, homogeneous with the data.

In the error block, `F` denotes the already-scaled prediction. We copy it into `IPRED` only so it can be written out to a table.

**The results.** Minimisation completes and the covariance matrix is obtained.

| Parameter | Estimate | RSE |
|---|---|---|
| CL/F (L/h) | 11.8 | 4.2 % |
| V/F (L) | 58.4 | 5.1 % |
| KA (1/h) | 1.31 | 9.7 % |

These values read back as pharmacology. The elimination rate constant is $k = 11.8 / 58.4 = 0.202\ \text{h}^{-1}$, a half-life of $\ln(2)/0.202 = 3.4$ hours. The peak falls at $t_{\max} = \ln(k_a/k)/(k_a - k) = 1.7$ hour, at roughly $6.1$ mg/L — consistent with the observed cloud.

:::note
With oral data alone, bioavailability is not identifiable: it appears in the solution only inside the product $F D / V$. The first two parameters are therefore ratios, $CL/F$ and $V/F$, and that is how they must be reported. Writing "V = 58.4 L" without the $F$ in the denominator is an over-interpretation, not a shorthand.
:::
<!-- /step -->

<!-- step:title="Common pitfall" -->
The structural-model trap is almost never the number of compartments — diagnostics flag that. It is the **scaling**, because scaling fails without a sound.

Take the same dataset with one detail changed: the laboratory reports its concentrations in **ng/mL**, not mg/L. The control stream is untouched, `S2 = V` still sits there. The dose is in mg and the volume in L, so the prediction comes out in mg/L — numerically **1000 times smaller** than the observation column.

NONMEM does not object. It knows nothing about units: it adjusts. The shape of the curve pins $k_a$ and $k$, which stay correct; only the scale has to give, and the volume is the only thing that can supply it.

| Parameter | Expected | Obtained with `S2 = V` |
|---|---|---|
| CL/F | 11.8 L/h | 0.0118 L/h |
| V/F | 58.4 L | 0.0584 L |
| Half-life | 3.4 h | 3.4 h |

The run is a "success". Minimisation completes, the covariance step passes, the RSEs are excellent, the observed-versus-predicted plots are flawless, and the half-life is **exact**. The only warning sign: a volume of distribution of 58 millilitres. The fix is three characters — `S2 = V/1000`.

:::pitfall
No statistical diagnostic catches a unit error, because it is not a statistical error: the model describes the data perfectly, on the wrong scale. The only safety net is the **physiological plausibility** of the absolute values. Before reading a single plot, ask whether the volume and clearance you obtained are the size of a human being.
:::

The numbering variant is noisier, but its message misleads. You move from an IV study to an oral one, hence from ADVAN1 to ADVAN2, and leave `S1 = V` in place. The central compartment is now number 2, and an unspecified scaling defaults to 1: the prediction becomes an **amount in mg**, and the volume survives only inside the ratio $CL/V$.

Symptom: clearance and volume are no longer separately identifiable — only their ratio is. The listing then reports a failed covariance step, or a correlation of 0.99 between the two. The classic reflex — fix a parameter, simplify the variability model — treats the symptom. The bug is one line above, in a `1` that should read `2`.

:::recall
The ADVAN routine decides the **number** of the central compartment; the data units decide the **factor**. The two meet on the scaling line, and that is the one line of the control stream NONMEM can never check on your behalf.
:::
<!-- /step -->

<!-- step:title="Key takeaways" -->
- The structural model is declared across several blocks that must agree; NM-TRAN validates syntax, never intent.
- Data columns are matched by **position**, not by name: inserting a column without updating the block shifts everything silently.
- The analytical routines (ADVAN1 to ADVAN4) carry the closed-form solution of the system: exact, fast, no tolerance to tune. Move to hand-written ODEs only when the shape forces you to.
- Non-linear — saturation, TMDD — forces ADVAN13. Linear but oddly shaped: ADVAN5 or ADVAN7 do the job with no integrator.
- TRANS2 changes no model, only the parameters supplied. We parameterise in clearance and volume because only those carry interpretable covariates, accept allometry, and keep their variabilities separate — an eta on the rate constant confounds them irreversibly.
- Adding a depot shifts the numbering: the central compartment moves from 1 to 2.
- Scaling is the most dangerous line in the file. A unit error yields a model that converges, fits perfectly, and is wrong by a factor of 1000 on the absolute values. The only guardrail is physiological plausibility.
- With oral data alone the estimates are ratios: report CL/F and V/F, never CL and V.
<!-- /step -->
