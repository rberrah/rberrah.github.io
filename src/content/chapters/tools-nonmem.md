---
id: "tools-nonmem"
slug: "tools-nonmem"
title: "NONMEM — l'ancêtre"
description: "Le logiciel historique de la pharmacométrie : fichiers de contrôle, FOCE, et statut réglementaire."
summary: "NONMEM : la référence fondatrice, ses fichiers de contrôle et sa méthode FOCE, austère mais éprouvée."
track: "tools"
order: 201
duration: "11 min"
level: "intermediate"
tags: ["tools", "nonmem", "foce", "regulatory"]
prerequisites: ["tools-algorithms"]
glossary: ["NONMEM", "FOCE-I", "OFV", "Effets mixtes"]
slides: []
sources: ["sheiner-beal-estimation", "wang-nonmem-methods", "keizer-psn-xpose", "fda-poppk"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "NONMEM s'utilise principalement via..."
    options:
      - "un fichier de contrôle texte (control stream) prétraité par NM-TRAN"
      - "une interface glisser-déposer"
      - "un tableur"
    correct: 0
  - prompt: "La méthode d'estimation historique de NONMEM est..."
    options:
      - "FOCE (avec interaction)"
      - "aucune"
      - "un réseau de neurones"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
**NONMEM** (NONlinear Mixed-Effects Modeling) est le **logiciel fondateur** de la pharmacométrie, créé par **Beal & Sheiner** à la fin des années 1970. Il reste la **référence réglementaire** : la plupart des dossiers d'AMM reposent sur lui.

Austère mais **éprouvé**, il impose une façon de penser que tout pharmacométricien connaît.
<!-- /step -->

<!-- step:title="Intuition" viz="66_FOCELinearization" -->
Pas d'interface graphique : on **écrit** un **fichier de contrôle** (control stream) qui décrit les données, le modèle et la méthode. Un préprocesseur (**NM-TRAN**) le traduit en Fortran, puis NONMEM **minimise l'OFV**.

Tout est explicite — d'où une grande maîtrise, au prix d'une courbe d'apprentissage.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="66_FOCELinearization" -->
Un control stream s'organise en blocs (`$`), par exemple :

```
$PROBLEM  Warfarine 1-cpt
$DATA     warfarin.csv IGNORE=@
$INPUT    ID TIME AMT DV
$SUBROUTINE ADVAN2 TRANS2      ; 1-cpt, absorption d'ordre 1
$PK       CL = THETA(1)*EXP(ETA(1))
          V  = THETA(2)*EXP(ETA(2))
          KA = THETA(3)
$ERROR    Y = F + F*EPS(1)     ; erreur proportionnelle
$THETA    (0,0.13) (0,8) (0,1)
$OMEGA    0.1 0.1
$SIGMA    0.05
$ESTIMATION METHOD=1 INTER     ; FOCE avec interaction
```

`METHOD=1 INTER` = **FOCE-I** ; NONMEM propose aussi SAEM et l'échantillonnage d'importance (IMP).

:::note
Réf. : Beal, Sheiner, Boeckmann — *NONMEM Users Guides* ; distribué par ICON. Écosystème : PsN, Xpose, Pirana.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="15_OFVGame" -->
Pour une **soumission réglementaire**, un modèle NONMEM (control stream + tables de sortie) est le format attendu par la FDA et l'EMA. Sa robustesse et son historique en font le **standard** des dossiers.

Autour de lui, des outils R (**Xpose**, **PsN**) gèrent les diagnostics, les bootstraps et les VPC.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
La rigueur du fichier de contrôle est un piège pour débutants.

:::pitfall
Une erreur de **colonne de données**, d'unité ou de bloc `$` passe inaperçue et fausse tout. Et FOCE-I peut **échouer** (minimisation non terminée, matrice de covariance non obtenue) sur les modèles difficiles — sans que cela signale forcément un mauvais modèle.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- NONMEM : le logiciel fondateur (Beal & Sheiner), référence réglementaire.
- Usage par fichier de contrôle (blocs `$`), prétraité par NM-TRAN ; méthode historique FOCE-I.
- Écosystème R autour (Xpose, PsN, Pirana) pour diagnostics et bootstraps.
- Puissant et éprouvé, mais austère ; attention aux erreurs de données et à la non-convergence.
<!-- /step -->
