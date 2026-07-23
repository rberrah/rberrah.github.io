---
id: "mab-pk"
slug: "mab-pk"
title: "Pharmacokinetics of monoclonal antibodies"
description: "Big proteins, small volume, slow clearance: why antibodies don't follow small-molecule rules."
summary: "The distinctive pharmacokinetics of monoclonal antibodies: FcRn, volume, long half-life."
track: "mab"
order: 50
duration: "12 min"
level: "advanced"
tags: ["mab", "biologics", "fcrn", "pk"]
slides: []
quiz:
  - prompt: "The long half-life (weeks) of IgG antibodies is mainly explained by..."
    options:
      - "recycling of IgG by the FcRn receptor"
      - "their strong binding to plasma proteins"
      - "their large size blocking renal filtration"
    correct: 0
  - prompt: "The volume of distribution of a monoclonal antibody is..."
    options:
      - "small (close to plasma and interstitium)"
      - "large, as the molecule diffuses into all tissues"
      - "close to total body water (~42 L)"
    correct: 0
---

<!-- step:title="Why this chapter" -->
**Monoclonal antibodies** (mAbs) are **large proteins** (~150 kDa). Their pharmacokinetics has almost nothing in common with small molecules: small volume, slow clearance, a half-life of **several weeks**.

Understanding these differences is essential for biologics (oncology, autoimmunity).
<!-- /step -->

<!-- step:title="Intuition" viz="10_PK2C" -->
A large molecule does not diffuse freely into tissues: it stays mostly in **plasma and interstitium** → **small volume** (~5–8 L).

It is not renally filtered nor CYP-metabolised: it is **catabolised** (degraded to amino acids), slowly.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="10_PK2C" -->
mAb PK is often **two-compartment linear** (at therapeutic doses), with low clearance and a half-life of **2 to 4 weeks**:

$$ t_{1/2} = \frac{\ln 2\cdot V}{CL} $$

The key: the **FcRn** receptor "rescues" IgG from degradation (recycling) — hence the long half-life. By the **subcutaneous** route, bioavailability is ~50–80% (slow lymphatic absorption).

**Ref —** Ryman J.T. & Meibohm B., *CPT Pharmacometrics Syst Pharmacol* 2017; Dirks N.L. & Meibohm B., *Clin Pharmacokinet* 2010 (antibody PK reviews).
<!-- /step -->

<!-- step:title="Worked example" viz="10_PK2C" -->
A half-life of ~3 weeks allows dosing **every 2 to 4 weeks** — very different from an antibiotic dosed several times a day.

The low clearance and small volume keep concentrations relatively stable between injections.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Antibody PK is not always linear.

**Pitfall —** at low doses, binding to the **target** can add saturable elimination (TMDD, next chapter) → **nonlinear** PK. Moreover, **immunogenicity** (anti-drug antibodies, ADA) can accelerate clearance in some patients.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- mAbs: large proteins, small volume (~plasma+interstitium), slow clearance.
- Half-life of 2–4 weeks thanks to FcRn recycling; catabolism, no kidney/CYP.
- SC route: bioavailability ~50–80%, slow lymphatic absorption.
- Possible nonlinearity (TMDD) and immunogenicity (ADA).
<!-- /step -->
