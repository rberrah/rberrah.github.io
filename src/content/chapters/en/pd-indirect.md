---
id: "pd-indirect"
slug: "pd-indirect"
title: "Indirect response models (turnover)"
description: "When the drug acts on the production or degradation of a response: Dayneka's four models."
summary: "Turnover models: inhibition/stimulation of kin or kout, and the resulting delay."
track: "pd"
order: 61
duration: "13 min"
level: "intermediate"
tags: ["pharmacodynamics", "indirect-response", "turnover"]
slides: []
quiz:
  - prompt: "In an indirect-response model, the effect delay comes from..."
    options:
      - "the turnover (kout) of the response, not the PK"
      - "the slow absorption of the drug into the plasma"
      - "the slow distribution of the drug into the tissues"
    correct: 0
  - prompt: "How many basic indirect-response models did Dayneka describe?"
    options:
      - "four (inhibition/stimulation of kin or kout)"
      - "two (inhibition or stimulation of a single rate)"
      - "six (inhibition/stimulation of kin, kout and R)"
    correct: 0
  - prompt: "At baseline, the response R0 equals..."
    options:
      - "kin / kout"
      - "kin × kout"
      - "kout / kin"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Many effects **do not follow** the concentration in real time: the drug acts on the **production** or **degradation** of a substance (glucose, cells, biomarker). The effect then appears **with a lag**.

**Indirect-response** (turnover) models capture this delay mechanistically.
<!-- /step -->

<!-- step:title="Intuition" viz="Turnover" -->
A response $R$ is produced (rate $k_{in}$) and eliminated (rate $k_{out}$). Without drug, it stays at equilibrium $R_0 = k_{in}/k_{out}$.

The drug pushes on one of the two rates. The response takes time to move: this **delay** comes from $k_{out}$, not from the pharmacokinetics.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="Turnover" -->
Dayneka & Jusko's **four models**, by the rate affected:

$$ \frac{dR}{dt} = k_{in}\,[1\pm f(C)] - k_{out}\,R \qquad\text{(acting on } k_{in}) $$
$$ \frac{dR}{dt} = k_{in} - k_{out}\,[1\pm g(C)]\,R \qquad\text{(acting on } k_{out}) $$

where $f,g$ are Emax functions of inhibition ($I_{max}$) or stimulation ($S_{max}$). Toggle between stimulation of $k_{in}$ and inhibition of $k_{out}$ in the panel.

**Ref —** Dayneka N.L., Garg V. & Jusko W.J., *J Pharmacokinet Biopharm* 1993 — the four basic indirect-response models.
<!-- /step -->

<!-- step:title="Worked example" viz="Turnover" -->
An oral anticoagulant (warfarin) **inhibits the synthesis** of clotting factors: the effect on INR appears several days late — the time for existing factors to disappear ($k_{out}$).

The effect nadir therefore does **not** coincide with the plasma peak.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Do not confuse PK delay and PD delay.

**Pitfall —** the lag of a turnover model comes from **biological** turnover, not absorption. Raising the dose does not shorten this delay (it depends on $k_{out}$) — it only deepens the effect.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Indirect response: the drug acts on kin (production) or kout (degradation).
- Four Dayneka models (inhibition/stimulation × kin/kout).
- R0 = kin/kout; the effect delay comes from kout, not the PK.
- The effect nadir does not coincide with the plasma peak.
<!-- /step -->
