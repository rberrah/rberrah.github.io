# Local / publication - 2026-09-13

## Site public

Le lot precedent `d638246`, apres `f2a72e3`, a publie : navigation par objectif,
mode enseignant, continuite entre outils et deux laboratoires Distribution /
Accumulation, puis options regroupees, suivi/sonde decoches, animation cochee et
courbe semi-log sous la courbe lineaire. Le PNG contient les deux courbes.

[Deploiement reussi](https://github.com/rberrah/rberrah.github.io/actions/runs/34762733686).
Les neuf tests navigateur ont passe sur
[le site public](https://rberrah.github.io/pharmacometrie/laboratoires/?lang=fr).

## Moteur Shiny

[Le moteur public](https://tdmhub.shinyapps.io/MIPD_Engine/) repond HTTP 200 apres
son reveil. Son HTML contient encore l'acquittement client `pk-lego-model-ack`,
sans gestionnaire `teaching-lab-ack` ni entree `teaching_lab_import`.

Les differences R depuis la reference de deploiement `0bf97dc` sont :

- `R/teaching_lab.R` : validation et regeneration du modele pedagogique, calendrier
  complet des bolus et premiere dose majoree.
- `app.R` : import du calendrier dans une nouvelle session sans observations et
  acquittement serveur correle, au lieu de confirmer uniquement la reception JS.
- `R/model_library.R` : nombres exportes avec 15 chiffres significatifs pour
  ne pas arrondir les petits taux a zero.
- Tests de regression associes. Aucun changement du ML dans ce lot.

Ces sources R sont deja sur GitHub, mais cette publication Pages ne redeploie
pas Shiny. L'absence du nouveau bridge est verifiee sur le service ; le contenu
integral du bundle distant n'a pas ete compare octet par octet. Aucun deploiement
Shiny n'a ete lance pendant cette intervention.

## Publication suivante

Deux laboratoires supplementaires, Absorption orale / biodisponibilite et
Perfusion IV / arret, rejoignent le lot Pages a la demande de l'utilisateur.
Le bouton Particule suivante est retire de tous les laboratoires, sans supprimer
la selection directe ni son equivalent clavier. Les nouveaux laboratoires incluent les animations,
reference, deux courbes, bilans, reperes PK, partage enseignant et exports.

Leur transfert vers Lego est pris en charge. Le transfert direct vers TDM, DDI
et PD est explicitement desactive en attendant verification du contrat de voie
et de calendrier. Aucune donnee patient ni aucun PDF institutionnel n'intervient.

Verification finale locale : check Svelte sans erreur/avertissement, build et
tests de contenu reussis ; 14 tests navigateur ; 21 scenarios numeriques et
42 comparaisons de courbes mrgsolve (deux formulations par scenario). Captures
ordinateur/mobile et francais/sombre inspectees. Ces controles logiciels ne
constituent pas une validation clinique ou pedagogique externe.
