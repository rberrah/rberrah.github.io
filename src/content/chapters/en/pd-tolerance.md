---
id: "pd-tolerance"
slug: "pd-tolerance"
title: "Tolerance, rebound and precursor models"
description: "When effect fades or rebounds: tolerance, antagonistic-mediator models and precursor pools."
summary: "Modelling tolerance (fading effect), rebound on withdrawal and precursor-pool depletion."
track: "pd"
order: 63
duration: "12 min"
level: "advanced"
tags: ["pharmacodynamics", "tolerance", "rebound", "precursor"]
slides: []
quiz:
  - prompt: "Pharmacodynamic tolerance shows as..."
    options:
      - "an effect that decreases under constant exposure"
      - "an effect that increases indefinitely"
      - "modified PK"
    correct: 0
  - prompt: "A rebound on treatment withdrawal is often explained by..."
    options:
      - "a counter-regulator that rose during treatment"
      - "a dosing error"
      - "too small a volume"
    correct: 0
  - prompt: "A precursor-pool model can produce..."
    options:
      - "depletion then recovery of the response"
      - "a strictly linear effect"
      - "no dynamics"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Some effects **fade** over time despite a maintained concentration (**tolerance**), or **rebound** on withdrawal. A static Emax model cannot describe this.

We need **dynamic** models: counter-regulation, antagonistic mediator, precursor pool.
<!-- /step -->

<!-- step:title="Intuition" viz="57_Tolerance" -->
The body **adapts**: facing a prolonged stimulus, an opposing mechanism builds up and **dampens** the effect. When we stop, this still-elevated counter-regulator causes a **rebound**.

It is a story of two competing processes with different speeds.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="57_Tolerance" -->
A **mediator-tolerance** model couples the response $R$ and a moderator $M$ that curbs it:

$$ \frac{dR}{dt} = k_{in}\,[1 + f(C)] - k_{out}\,M\,R, \qquad \frac{dM}{dt} = k_{tol}\,(R - M) $$

The moderator $M$ **rises slowly** and gradually extinguishes the effect. On withdrawal, $M$ stays high → **rebound** below baseline.

**Precursor-pool** models (a limited store that empties then refills) produce a depletion/recovery profile.

**Math —** the rate ratio $k_{tol}/k_{out}$ sets the extent of tolerance and the depth of rebound.
<!-- /step -->

<!-- step:title="Worked example" viz="57_Tolerance" -->
**Nitrates** (angina): their vasodilatory effect dulls continuously — hence the need for a daily **nitrate-free interval** to restore sensitivity.

An abruptly stopped beta-blocker can give a blood-pressure/rhythm **rebound**, because the receptors up-regulated.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Do not confuse PD tolerance and falling exposure.

**Pitfall —** a fading effect can come from **tolerance** (PD) or from metabolic **auto-induction** (PK, exposure falls). Distinguishing them requires looking at the **concentrations**: if they are stable but the effect falls, it is tolerance.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Tolerance = fading effect under constant exposure (counter-regulation).
- Mediator model: a moderator M rises slowly and extinguishes the effect; rebound on withdrawal.
- Precursor-pool models produce depletion then recovery.
- Distinguish tolerance (PD) from auto-induction (PK) by looking at concentrations.
<!-- /step -->
