# Référentiel PK/PD et modalités d’administration des molécules TDM
_État initial 10 novembre 2026 · fiche scientifique à valider avant fusion_

## Objectif
Afficher **quatre champs indépendants sur chaque fiche** :
1. **Indice biologiquement/pharmacodynamiquement pertinent** : AUC/AUC–CMI, Cmax/CMI, fT>CMI, C0 ou concentration horodatée.
2. **Prélèvement TDM praticable** : C0, C2, pic, suivi limité pour AUC, Css en perfusion continue, H24/H36/H42/H48 dans un protocole.
3. **Voies documentées** : PO, IV… **uniquement si étayées pour la molécule et le schéma cité**. Une voie d’administration n’est pas une autorisation de substitution d’une spécialité à une autre. Une liste « IV » peut se limiter à la perfusion du consensus ICU, et n’exclut pas nécessairement des formes orales.
4. **Proportionnalité dose–AUC** : `conditional_linear`, `nonlinear`, `complex`, `unassessed`. Aucune valeur `directRatioPermitted: true` : pas de calcul automatique de dose dans ce site pédagogique.

Cette séparation évite quatre erreurs fréquentes : confondre C0 et AUC ; considérer Cmax = meilleur indice pour tous les antibiotiques ; supposer que fT>CMI double avec la dose ; confondre PK linéaire et estimation sûre d’une nouvelle dose.

## Équation et conditions
À l’état stable, **AUCτ = F × dose / CL** pour l’administration extravasculaire à PK linéaire (pour IV, F=1). Si CL, F, intervalle et méthode de comparaison sont constants, AUC est proportionnelle à la dose. Le raisonnement ne s’applique pas directement à Cmax et Cmin, ni aux indices seuils (%fT>CMI), ni aux cibles de toxicité.

Une variation de clairance rénale/hépatique, une DDI, une modification alimentaire ou de biodisponibilité, une nouvelle formulation, une auto-induction, une liaison protéique saturable ou une perfusion différente invalidant ces conditions impose **un recalcul pharmacocinétique et une vérification STP**, jamais une règle de trois aveugle.

## Exemples scientifiques verrouillés
| Molécule / groupe | Indicateur privilégié | Mesure habituelle | Administration citée | Dose ×2 ⇒ AUC ×2 ? |
| --- | --- | --- | --- | --- |
| Bêta-lactamines | **fT>CMI** (libre) | Cmin intermittente ou Css libre en continu | IV dans recommandations aiguës | **Seulement si PK linéaire et CL stable** ; fT>CMI n’est pas proportionnel à AUC |
| Aminosides | **AUC24/CMI et Cmax/CMI** | pic, prélèvement tardif, résiduel pour toxicité | IV en ICU | conditionnel, clairance rénale variable |
| Fluoroquinolones | **(f)AUC24/CMI** | AUC par prélèvements chronométrés | IV en ICU | non documenté par spécialité |
| Vancomycine (SARM invasif) | **AUC24 / CMI** | AUC bayésienne préférée à C0 seule | IV | conditionnel, pas si fonction rénale change |
| Teicoplanine | AUC/CMI, **C0 pratique** | C0 et méthode HPLC/FPIA | IV | pas de règle chiffrée revue |
| Linézolide | **AUC24/CMI**, C0 proxy | C0, éventuellement AUC | PO/IV | pas de règle revérifiée |
| MPA | **AUC0–12** préférable à C0 | LSS ou MAP bayésien | PO/IV pour MMF, selon spécialité | **sous-proportionnel** observé dans 84 greffés rénaux (pente dose–AUC 0,513 ; ×2 dose ≈ ×1,43 AUC en moyenne), non transposable directement |
| Tacrolimus | AUC décrit mieux l’exposition, **C0 routine** | C0 selon LI/LP, AUC selon question | PO/IV selon spécialité | proportionnel à 3/7/10 mg PO dose unique chez des volontaires à jeun (FDA), **conditionnel** chez un greffé |
| Ciclosporine | AUC / C2 selon greffe | C0 ou C2 suivant protocole | Neoral PO microémulsion, spécialités à distinguer | **linéaire dans la plage thérapeutique Neoral** (FDA), sans généralisation à toute formulation |
| Évérolimus | **C0 bien corrélée à l’AUC** | C0 sang total | PO | PK généralement linéaire sous conditions |
| Voriconazole | **C0 routine** | C0 | PO/IV | **NON**, métabolisme saturable ; 200→300 mg q12h PO ~AUC ×2,5 |
| Phénytoïne | C0 totale/libre | résiduelle après équilibre | PO dans RCP consulté | **NON**, élimination saturable, +10 % de dose possiblement disproportionné |
| Valproate | C0 totale ou libre | résiduel et fraction libre si liaison altérée | PO, spécialité Depakote étudiée | **Concentration totale non proportionnelle** par liaison saturable ; libre plus linéaire |
| Carbamazépine | C0 parent ; 10,11-époxyde selon contexte | résiduel à l’équilibre | PO dans spécialité consultée | **Non stable** : auto-induction de la clairance |
| Rifampicine | AUC/CMI (et Cmax complémentaire) | AUC par prélèvements horodatés | PO dans études TB | **NON** : extraction saturable et auto-induction, exposition parfois plus que proportionnelle |
| Agomélatine | **Cmax** de référence historique | pic 1–2 h | voie non vérifiée dans cette fiche | non évalué |
| Busulfan | **AUC cumulée** | LSS AUC autour des perfusions | IV dans protocole étudié | non évalué |
| MTX haute dose | **Concentration horodatée** pour élimination retardée | H24/H36/H42/H48 depuis début de perfusion | IV haute dose | non évalué ; aucun seuil assimilé à une cible thérapeutique |

## Sources et hiérarchie
Chaque dimension renseignée dispose d’un identifiant de provenance vers :
- sociétés savantes et consensus (ACCP/ESCMID/IDSA/IATDMCT 2026 ; ESICM/ESCMID/IATDMCT 2020 ; vancomycine 2020 ; transplantation/IATDMCT) ;
- ANSM / EMA / FDA (voriconazole, amoxicilline, Dilantin, CellCept, Rapamune, Prograf) ;
- publications complémentaires pour les référentiels historiques des psychotropes et antiépileptiques.

Les modes d’administration issus d’un **papier de réanimation** sont étiquetés `studied_icu_iv` / `studied_systemic_infusion`, distincts de `product_authorised` lorsque le **RCP** a été directement consulté. Le référentiel public complet des présentations demeure à rapprocher du catalogue ANSM/EMA produit par produit ; aucune route absente n’est déduite d’une famille.

### Exemples de sources
- [Bêta-lactamines, consensus 2026](https://pmc.ncbi.nlm.nih.gov/articles/PMC13392062/) : cible 100 % fT>CMI **conditionnelle**.
- [Position paper antibiotiques 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC7223855/) : indices, pic/C0, AUC, contexte ICU.
- [Vancomycine, sociétés savantes 2020](https://www.idsociety.org/practice-guideline/vancomycin) : AUC, non C0 seule 15–20 mg/L pour SARM invasif.
- [MPA 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12456993/) : AUC plutôt que C0.
- [Évérolimus IATDMCT](https://pubmed.ncbi.nlm.nih.gov/26982492/) : C0 bonne corrélation AUC, PK linéaire.
- [Voriconazole ANSM](https://base-donnees-publique.medicaments.gouv.fr/medicament/69816080/extrait) : non-linéarité et exemple dose–AUC.
- [Phénytoïne FDA](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=f1d41925-3be0-42a8-86f8-181569399c5b) : CYP saturable et disproportion de taux.
- [Amoxicilline ANSM](https://base-donnees-publique.medicaments.gouv.fr/medicament/62607530/extrait) : proportionnalité 250–3000 mg PO **dans le contexte étudié**.

## Architecture et vérification
- Un enregistrement par molécule dans `tdmPharmacologyProfiles.js`, y compris `unassessed` pour les données non vérifiées.
- Champs `index`, `practical`, `administration`, `proportionality`, `review` ; source par dimension.
- 132/132 identifiants canoniques couverts, **sans combler les lacunes par des extrapolations arbitraires**.
- Vue simple avec 4 attributs et panneau de sources rétractable pour garder une page accessible aux non-pharmacologues.
- Tests machine : aucune règle automatique de doublement de dose, aucune voie sans référence, classification fT>CMI ≠ Cmin, C0 tacrolimus ≠ AUC, MPA AUC, phénytoïne/voriconazole nonlinéaires.
- Aucun changement au dépôt MIPD Engine ; contrat d’export/consommation pourra réutiliser les mêmes IDs et les sources verrouillées.

**À revoir scientifiquement** : doses et intervalles réellement linéaires par spécialité, routes autorisées pays/formulation, contextes pédiatriques, modalités de perfusion continue, perte de stabilité in vitro et provenance des cibles non numériques. La qualification CI ne tient pas lieu de validation pharmacologique humaine.

### Trois exceptions PK supplémentaires
- **Valproate** : [FDA / DailyMed Depakote](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=08a65cf4-7749-4ceb-6895-8f4805e2b01f), propriétés PK : les concentrations **totales** augmentent moins que proportionnellement à la dose par saturation de la liaison protéique, tandis que la **fraction libre** se comporte plus linéairement. Une correction automatique fondée sur le valproate total serait trompeuse en hypoalbuminémie.
- **Carbamazépine** : [Tegretol FDA](https://www.accessdata.fda.gov/drugsatfda_docs/label/2001/20234S17LBL.PDF), auto-induction du métabolisme, demi-vie changeante et comportement dépendant de la durée de traitement.
- **Rifampicine** : [modèle semi-mécaniste, Denti et al.](https://pubmed.ncbi.nlm.nih.gov/26552972/) et [revue STP antituberculeux](https://pmc.ncbi.nlm.nih.gov/articles/PMC7935699/), extraction hépatique saturable **et** auto-induction au fil des jours. Une dose plus forte peut générer une AUC plus que proportionnelle alors que les concentrations diminuent au cours de l’induction.

## Vérification complémentaire : relation dose–AUC chez les immunosuppresseurs

Les sources vérifiées montrent pourquoi il faut séparer « molécule ayant généralement une PK linéaire » de « règle de trois utilisable chez un patient particulier ».

- **Tacrolimus Prograf** : [RCP FDA / DailyMed, §12.3](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=7f667de1-9dfa-4bd6-8ba0-15ee2d78873b) rapporte une AUC et une Cmax approximativement proportionnelles après **3, 7 et 10 mg oraux en dose unique chez 18 volontaires à jeun**. Cette observation ne valide pas un doublement de dose chez un greffé ayant une interaction CYP3A, un nouvel hématocrite ou un changement LI/LP.
- **MPA sous MMF** : [Mohamed et al., *Clinical Pharmacokinetics*, 2026](https://pmc.ncbi.nlm.nih.gov/articles/PMC12960313/) : **84 greffés rénaux sous tacrolimus**, doses MMF **250–1 000 mg ×2/j**, pente du modèle log(AUC₀–₁₂)–log(dose) **0,513 (IC90 % 0,324–0,702)**, incompatible avec la proportionnalité. Dans **cette cohorte**, doubler la dose correspondrait à une AUC moyenne estimée ×**1,43** (2^0,513), et non ×2. Ceci **n'est pas une équation d’adaptation posologique individuelle**.
- **Ciclosporine Neoral microémulsion** : le [RCP FDA](https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=94461af3-11f1-4670-95d4-2965b9538ae3) indique une relation dose–AUC **linéaire dans la plage thérapeutique** de cette spécialité ; Neoral et Sandimmune ne sont **pas** des formulations interchangeables sans précaution. La [fiche Neoral solution orale 2026](https://www.medicines.org.uk/emc/product/5300/smpc) confirme le mode d’administration microémulsion.
