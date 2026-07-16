---
id: "tools-nonmem"
slug: "tools-nonmem"
title: "NONMEM — the ancestor"
description: "Pharmacometrics' historical software: control files, FOCE, and regulatory status."
summary: "NONMEM: the founding reference, its control files and FOCE method — austere but proven."
track: "nonmem"
order: 1
duration: "11 min"
level: "intermediate"
tags: ["tools", "nonmem", "foce", "regulatory"]
prerequisites: ["tools-algorithms"]
glossary: ["NONMEM", "FOCE-I", "OFV", "Effets mixtes"]
slides: []
quiz:
  - prompt: "NONMEM is used mainly through..."
    options:
      - "a text control stream preprocessed by NM-TRAN"
      - "a drag-and-drop interface"
      - "a spreadsheet"
    correct: 0
  - prompt: "NONMEM's historical estimation method is..."
    options:
      - "FOCE (with interaction)"
      - "none"
      - "a neural network"
    correct: 0
---

<!-- step:title="Why this chapter" -->
**NONMEM** (NONlinear Mixed-Effects Modeling) is pharmacometrics' **founding software**, created by **Beal & Sheiner** in the late 1970s. It remains the **regulatory reference**: most marketing dossiers rely on it.

Austere but **proven**, it imposes a way of thinking every pharmacometrician knows.
<!-- /step -->

<!-- step:title="Intuition" viz="66_FOCELinearization" -->
No graphical interface: you **write** a **control stream** describing the data, the model and the method. A preprocessor (**NM-TRAN**) translates it into Fortran, then NONMEM **minimises the OFV**.

Everything is explicit — hence great control, at the cost of a learning curve.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="66_FOCELinearization" -->
A control stream is organised in blocks (`$`), for example:

```
$PROBLEM  Warfarin 1-cpt
$DATA     warfarin.csv IGNORE=@
$INPUT    ID TIME AMT DV
$SUBROUTINE ADVAN2 TRANS2      ; 1-cpt, first-order absorption
$PK       CL = THETA(1)*EXP(ETA(1))
          V  = THETA(2)*EXP(ETA(2))
          KA = THETA(3)
$ERROR    Y = F + F*EPS(1)     ; proportional error
$THETA    (0,0.13) (0,8) (0,1)
$OMEGA    0.1 0.1
$SIGMA    0.05
$ESTIMATION METHOD=1 INTER     ; FOCE with interaction
```

`METHOD=1 INTER` = **FOCE-I**; NONMEM also offers SAEM and importance sampling (IMP).

**Note —** ref.: Beal, Sheiner, Boeckmann — *NONMEM Users Guides*; distributed by ICON. Ecosystem: PsN, Xpose, Pirana.
<!-- /step -->

<!-- step:title="Worked example" viz="15_OFVGame" -->
For a **regulatory submission**, a NONMEM model (control stream + output tables) is the format expected by the FDA and EMA. Its robustness and track record make it the **standard** for dossiers.

Around it, R tools (**Xpose**, **PsN**) handle diagnostics, bootstraps and VPCs.
<!-- /step -->

<!-- step:title="Common pitfall" -->
The control file's rigour is a trap for beginners.

**Pitfall —** a **data-column** error, a unit slip or a wrong `$` block goes unnoticed and distorts everything. And FOCE-I can **fail** (minimisation not completed, covariance matrix not obtained) on difficult models — without necessarily signalling a bad model.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- NONMEM: the founding software (Beal & Sheiner), the regulatory reference.
- Used via a control stream (`$` blocks), preprocessed by NM-TRAN; historical method FOCE-I.
- R ecosystem around it (Xpose, PsN, Pirana) for diagnostics and bootstraps.
- Powerful and proven, but austere; beware data errors and non-convergence.
<!-- /step -->
