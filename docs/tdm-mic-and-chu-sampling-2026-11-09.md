# Cibles PK/PD dépendant de la CMI et documents CHU de prélèvement

Date de qualification bibliographique : 9 novembre 2026.

## Objectif du site

**Une seule recherche par molécule.** Montrer les cibles chiffrées correspondant à l'indication, les critères PK/PD dépendant de la CMI lorsqu'ils sont documentés, un lien direct vers la publication de chaque critère et, séparément, **un seul lien CHU vers un document explicitement consacré aux temps de prélèvement** lorsqu'il a pu être vérifié.

Ni le CHU ni le site ne « valident » les critères PK/PD internationaux par leur seule proximité. Aucun calcul ne constitue une recommandation posologique.

## Source principale des objectifs microbiologiques

[Abdul-Aziz et al., *Intensive Care Medicine*, 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC7223855/) ; DOI [10.1007/s00134-020-06050-1](https://doi.org/10.1007/s00134-020-06050-1), **Tableau 4**, sections Pharmacodynamics et TDM des classes. Position paper international ESICM / ESCMID / IATDMCT / ISAC, pour **adultes de réanimation**.

| Famille / médicament | Indice PK/PD visible | Si CMI fournie | Limitations explicites |
|---|---|---|---|
| 16 bêta-lactamines actives citées dans le document CHU | **100 % fT>CMI** (perfusion intermittente / prolongée), **fCss>CMI** (continue) | Exemple CMI 2 mg/L : **fCmin>2 mg/L** *comme repère sous condition de vrai minimum* ou **fCss>2 mg/L** à l'état stable | Seule la concentration **libre** est pertinente ; une concentration totale non corrigée n'est pas équivalente. Cmin ne démontre 100 % fT>CMI que si l'on connaît l'évolution intra-intervalle. Le consensus mentionne aussi 2–5×CMI comme exposition plus agressive proposée, **pas comme seuil standard commun à toutes les bêta-lactamines**. |
| Amikacine, gentamicine, tobramycine | **Cmax/CMI ≥8–10** | Exemple CMI 0,5 mg/L : Cmax objectif ≈ **4–5 mg/L** | Les minima de sécurité du même consensus sont **Cmin<2,5 mg/L amikacine** et **Cmin<0,5 mg/L gentamicine/tobramycine**, particulièrement si traitement >3 jours ; **les seuils de toxicité ne sont pas des cibles d'efficacité**. |
| Ciprofloxacine, lévofloxacine, moxifloxacine, ofloxacine | **fAUC24/CMI≥80** (tableau 4) | Exemple CMI 0,5 mg/L : fAUC24≥40 mg·h/L | Proposition de classe en réanimation, non consensus universel selon espèces Gram± ; le panel ne recommande ni ne déconseille le STP systématique. |
| Daptomycine | **AUC24/CMI>666** | Exemple CMI 0,5 mg/L : AUC24>333 mg·h/L | Valeur d'étude récapitulée par le position paper ; distinguer seuil de toxicité Cmin≈24 mg/L. Pas de recommandation systématique de STP. |
| Vancomycine, infection invasive grave à SARM | **AUC24/CMI 400–600**, sous hypothèse **CMI=1 mg/L** par microdilution | Pour CMI=1 : AUC24 400–600 mg·h/L. Pour une autre CMI, **aucune multiplication automatique n'est proposée** | Source propre : [Consensus ASHP/IDSA/PIDS/SIDP 2020](https://www.idsociety.org/practice-guideline/vancomycin/). Extrapoler AUC à CMI>1 accroît le risque de néphrotoxicité et n'est pas recommandé comme règle linéaire. |

**Ordre des précautions** : mesurer ou confirmer l'isolat et sa CMI, vérifier méthode de CMI (variabilité ±1 dilution), vérifier le mode d'administration, comparer la concentration libre et non la totale lorsque le critère est « f », puis considérer site d'infection / pathogène / risque toxique. Les sorties ne sont que l'**application arithmétique des objectifs publiés** au paramètre saisi, non l'estimation de la probabilité de réussite PK/PD ni l'interprétation d'un patient.

**Cas volontairement non extrapolés** : avibactam et tazobactam (inhibiteurs de bêta-lactamases, pas une cible de bêta-lactamine active autonome), sulfaméthoxazole/triméthoprime, clindamycine, azithromycine, isoniazide, rifampicine, tigécycline, dalbavancine. Un dosage réalisé au laboratoire ne signifie pas qu'une cible unique est établie.

## Unique document CHU autorisé comme guide de temps

[CHU de Limoges · PTP PREA 0059 C · Liste des antibiotiques dosés et temps de prélèvements (26/05/2026, 2 pages)](https://chu-limoges.manuelprelevement.fr/DocumentNew.aspx?idDoc=41157).

Les **36 antibiotiques** cités dans le tableau sont réconciliés par identifiant interne avec **un seul lien vers ce PDF par molécule**, indépendamment du nombre de cibles/indications affichées sur la page. Une même référence est légitimement réutilisée pour amoxicilline, céfépime, pipéracilline, méropénème, aminosides, etc. Les cas Cmax/Crés/T30/T6–8h et perfusion continue y sont explicités. Le document distingue les médicaments en gris analysés par immunochimie.

Les pages **DetailNew** du catalogue d'examens, le formulaire d'adaptation des immunosuppresseurs **PBH PREA 0055 B** et les demandes d'analyses externes ne sont **pas exposés** comme documents de temps de prélèvement. Ils restent disponibles en interne dans le catalogue pour assurer la traçabilité, mais ne sont pas des fiches horaires spécialisées vérifiées comme telles.

Pour les immunosuppresseurs, antidépresseurs, lithium, valproate et autres molécules **sans document CHU de temps de prélèvement isolé et vérifié**, le site n'affiche pas un faux document de prélèvement ; l'ajout d'un lien dépend de la découverte/validation d'une fiche officielle de temps. Le laboratoire devra fournir une liste autorisée des documents horodatés ou un export pour compléter la réconciliation au-delà du seul PDF antibiotique.

## Garanties de tests

- 36/36 molécules du document officiel mappées vers le même lien autorisé ; aucun autre document CHU n'apparaît en tant que document de temps.
- 41 situations PK/PD **issus d'un même consensus par classes**, non « 41 recommandations indépendantes ».
- CMI avec virgule ou point ; saisies invalides et CMI≤0 rejetées ; aucune extrapolation linéaire vancomycine si CMI≠1.
- Critères d'efficacité vs avertissements de toxicité clairement séparés.
- Conservation des 67 fiches existantes / 23 sources des cibles fixes, sans modification numérique.
- Recherche et détails FR/EN, tests unitaires et navigateur.

## Travail restant

Compléter l'**inventaire exhaustif** des dosages du CHU et les documents de temps par médicament sans inventer de liens ; compléter les objectifs différenciés par infection, microorganisme, MIC, voie et méthode pour les molécules à variabilité importante. Les cibles de *Cmax/CMI*, *fAUC/CMI* et *fT>CMI* ne doivent pas être transcrites en simple fenêtre de concentration sanguine générale.
