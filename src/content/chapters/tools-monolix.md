---
id: "tools-monolix"
slug: "tools-monolix"
title: "Monolix — interface, mlxtran & SAEM"
description: "Le logiciel « au clic » : interface graphique, langage mlxtran et moteur SAEM avec diagnostics intégrés."
summary: "Monolix : workflow graphique, modèle en mlxtran et estimation SAEM, avec VPC et diagnostics fournis."
track: "tools"
order: 202
duration: "11 min"
level: "intermediate"
tags: ["tools", "monolix", "mlxtran", "saem"]
prerequisites: ["tools-algorithms"]
glossary: ["Monolix", "SAEM"]
slides: []
quiz:
  - prompt: "Le moteur d'estimation par défaut de Monolix est..."
    options:
      - "le SAEM (avec diagnostics et VPC intégrés)"
      - "uniquement FOCE"
      - "aucun"
    correct: 0
  - prompt: "mlxtran est..."
    options:
      - "le langage de description du modèle dans Monolix"
      - "un format de données brut"
      - "un tableur"
    correct: 0
  - prompt: "L'atout principal de Monolix par rapport à NONMEM est..."
    options:
      - "une interface graphique et des diagnostics prêts à l'emploi"
      - "l'absence de tout modèle statistique"
      - "l'impossibilité de simuler"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
**Monolix** (Lixoft / Simulations Plus) est le logiciel « **au clic** » : là où NONMEM demande d'écrire un fichier de contrôle, Monolix propose une **interface graphique** qui guide tout le workflow — données, modèle, estimation, diagnostics.

Son moteur, le **SAEM**, et ses graphiques intégrés en ont fait un standard, surtout en académique et en early phase.
<!-- /step -->

<!-- step:title="Intuition" viz="67_SAEMConvergence" -->
On charge les données, on choisit (ou on écrit) un modèle, on clique sur **Run**, et Monolix lance le **SAEM** puis affiche directement les **diagnostics** : VPC, distributions des paramètres, résidus.

L'estimation exacte (SAEM) + la visualisation immédiate raccourcissent la boucle « estimer → diagnostiquer → corriger ».
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="67_SAEMConvergence" -->
Le modèle s'écrit en **mlxtran**, un langage lisible séparant structure et statistique :

```
[LONGITUDINAL]
input = {ka, cl, v}
EQUATION:
  Cc = pkmodel(ka, V=v, Cl=cl)   ; 1-cpt oral
DEFINITION:
  y = {distribution=normal, prediction=Cc, errorModel=combined1(a,b)}

[INDIVIDUAL]
input = {cl_pop, omega_cl, v_pop, omega_v}
DEFINITION:
  cl = {distribution=logNormal, typical=cl_pop, sd=omega_cl}
  v  = {distribution=logNormal, typical=v_pop,  sd=omega_v}
```

L'estimation utilise le **SAEM** (voir le chapitre algorithmes), avec calcul de la vraisemblance par échantillonnage d'importance.

:::note
Réf. : Lixoft / Simulations Plus ; documentation Monolix. mlxtran est partagé par toute la MonolixSuite (Simulx pour la simulation).
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="67_SAEMConvergence" -->
Sur un modèle difficile (Emax raide, données éparses), le **SAEM** de Monolix converge là où FOCE peinerait, et la **VPC intégrée** confirme (ou infirme) le modèle en un clic.

Beaucoup d'équipes prototypent et enseignent avec Monolix pour sa **lisibilité**, puis traduisent en NONMEM si le dossier réglementaire l'exige.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
« Au clic » ne veut pas dire sans réflexion.

:::pitfall
La facilité de Monolix peut faire **enchaîner les runs** sans comprendre. Un SAEM qui converge et une belle VPC ne dispensent pas de vérifier le **sens** du modèle, l'identifiabilité et le shrinkage. Et l'**OFV** de Monolix (SAEM) n'est **pas comparable** à celui d'un run FOCE de NONMEM.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Monolix : logiciel graphique « au clic », moteur SAEM, diagnostics/VPC intégrés.
- Le modèle s'écrit en mlxtran (structure + statistique lisibles).
- Idéal pour prototyper, enseigner, itérer vite ; MonolixSuite pour la simulation (Simulx).
- Attention à ne pas enchaîner les runs sans diagnostic ; OFV non comparable à FOCE.
<!-- /step -->
