// @ts-nocheck
// RÉFÉRENCES — pool FERMÉ, à IDENTIFIANTS STABLES ET VÉRIFIÉS.
//
// Chaque entrée porte un identifiant qui résout vers UN SEUL document, pour toujours :
//   doi  -> https://doi.org/<doi>
//   pmid -> https://pubmed.ncbi.nlm.nih.gov/<pmid>/
//   isbn -> https://search.worldcat.org/isbn/<isbn>
//   url  -> page officielle (agence, éditeur) pour les textes réglementaires
// AUCUN lien de recherche : une recherche n'est ni stable, ni univoque, donc pas une citation.
// Chaque DOI a été RÉSOLU contre Crossref/DataCite et son titre confronté au titre attendu (2026-07).
//
// `citable: false` — LIENS UTILES, PAS DES SOURCES.
//   Une page de laboratoire, un site d'association ou une page produit ne peut soutenir
//   AUCUNE affirmation : elle ne dit rien de vérifiable et son contenu change. Ces entrées
//   restent affichées en bibliographie, mais un chapitre qui les cite dans `sources:`
//   fait ÉCHOUER le smoke test.
//
// Les chapitres se rattachent au pool via `sources: [<id>, ...]` dans leur frontmatter.
// Un id inconnu — ou non citable — fait ÉCHOUER le smoke test.

/** @typedef {{id:string, kind:string, title:string, authors?:string, where?:string, doi?:string, pmid?:string, isbn?:string, url:string, citable?:boolean}} Reference */

export const referenceGroups = [
  {
    id: 'books',
    title: { fr: 'Livres de référence', en: 'Reference books' },
    items: [
      { id: 'gabrielsson-weiner', kind: 'book', title: 'Pharmacokinetic and Pharmacodynamic Data Analysis: Concepts and Applications', authors: 'Gabrielsson J. & Weiner D.', where: '5e éd., Swedish Pharmaceutical Press', isbn: '9789198299106', url: 'https://search.worldcat.org/isbn/9789198299106' },
      { id: 'bonate', kind: 'book', title: 'Pharmacokinetic-Pharmacodynamic Modeling and Simulation', authors: 'Bonate P.L.', where: 'Springer', isbn: '9781441994844', url: 'https://search.worldcat.org/isbn/9781441994844' },
      { id: 'ette-williams', kind: 'book', title: 'Pharmacometrics: The Science of Quantitative Pharmacology', authors: 'Ette E.I. & Williams P.J. (dir.)', where: 'Wiley', isbn: '9780471677833', url: 'https://search.worldcat.org/isbn/9780471677833' },
      { id: 'owen-fiedler-kelly', kind: 'book', title: 'Introduction to Population Pharmacokinetic / Pharmacodynamic Analysis with Nonlinear Mixed Effects Models', authors: 'Owen J.S. & Fiedler-Kelly J.', where: 'Wiley', isbn: '9780470582299', url: 'https://search.worldcat.org/isbn/9780470582299' },
      { id: 'rowland-tozer', kind: 'book', title: 'Clinical Pharmacokinetics and Pharmacodynamics: Concepts and Applications', authors: 'Rowland M. & Tozer T.N.', where: 'Wolters Kluwer', isbn: '9780781750097', url: 'https://search.worldcat.org/isbn/9780781750097' },
      { id: 'gibaldi-perrier', kind: 'book', title: 'Pharmacokinetics', authors: 'Gibaldi M. & Perrier D.', where: '2e éd., Marcel Dekker — le classique de la PK compartimentale', isbn: '9780824710422', url: 'https://search.worldcat.org/isbn/9780824710422' },
      { id: 'davidian-giltinan', kind: 'book', title: 'Nonlinear Models for Repeated Measurement Data', authors: 'Davidian M. & Giltinan D.M.', where: 'Chapman & Hall — fondement statistique des modèles à effets mixtes', isbn: '9780412983412', url: 'https://search.worldcat.org/isbn/9780412983412' },
      { id: 'lavielle', kind: 'book', title: 'Mixed Effects Models for the Population Approach', authors: 'Lavielle M.', where: 'Chapman & Hall/CRC (SAEM)', isbn: '9781482226508', url: 'https://search.worldcat.org/isbn/9781482226508' },
      { id: 'nelsen-copulas', kind: 'book', title: 'An Introduction to Copulas (théorème de Sklar, copules archimédiennes, dépendances de queue)', authors: 'Nelsen R.B.', where: '2e éd., Springer Series in Statistics 2006', doi: '10.1007/0-387-28678-0', url: 'https://doi.org/10.1007/0-387-28678-0' },
      { id: 'hastie-esl', kind: 'book', title: 'The Elements of Statistical Learning (arbres, SVM, boosting, k-means, ACP)', authors: 'Hastie T., Tibshirani R. & Friedman J.', where: '2e éd., Springer — libre en ligne', isbn: '9780387848570', url: 'https://hastie.su.domains/ElemStatLearn/' }
    ]
  },
  {
    id: 'tutorials',
    title: { fr: 'Tutoriels & mises au point', en: 'Tutorials & primers' },
    items: [
      { id: 'mould-upton', kind: 'article', title: 'Basic Concepts in Population Modeling, Simulation, and Model-Based Drug Development (Parties 1–3)', authors: 'Mould D.R. & Upton R.N.', where: 'CPT: Pharmacometrics Syst. Pharmacol. 2012–2013', doi: '10.1038/psp.2012.4', pmid: '23835886', url: 'https://doi.org/10.1038/psp.2012.4' },
      { id: 'jones-rowland-yeo', kind: 'article', title: 'Basic concepts in physiologically based pharmacokinetic (PBPK) modeling', authors: 'Jones H. & Rowland-Yeo K.', where: 'CPT: PSP 2013', doi: '10.1038/psp.2013.41', pmid: '23945604', url: 'https://doi.org/10.1038/psp.2013.41' },
      { id: 'keizer-psn-xpose', kind: 'article', title: 'Modeling and simulation workbench for NONMEM: PsN, Xpose, Pirana', authors: 'Keizer R.J., Karlsson M.O. & Hooker A.', where: 'CPT: PSP 2013', doi: '10.1038/psp.2013.24', pmid: '23836189', url: 'https://doi.org/10.1038/psp.2013.24' }
    ]
  },
  {
    id: 'fondamentaux',
    title: { fr: 'Fondamentaux PK (articles)', en: 'PK fundamentals (papers)' },
    items: [
      { id: 'sheiner-beal-estimation', kind: 'article', title: 'Evaluation of methods for estimating population pharmacokinetic parameters (série I–III)', authors: 'Sheiner L.B. & Beal S.L.', where: 'J. Pharmacokinet. Biopharm. 1980–1983 — acte de naissance de la PK de population', doi: '10.1007/BF01060053', pmid: '7229908', url: 'https://doi.org/10.1007/BF01060053' },
      { id: 'sheiner-forecasting', kind: 'article', title: 'Forecasting individual pharmacokinetics (la prévision bayésienne individuelle, fondatrice du TDM modélisé)', authors: 'Sheiner L.B., Beal S., Rosenberg B. & Marathe V.V.', where: 'Clin. Pharmacol. Ther. 1979', doi: '10.1002/cpt1979263294', pmid: '498284', url: 'https://doi.org/10.1002/cpt1979263294' },
      { id: 'anderson-holford-allometry', kind: 'article', title: 'Mechanism-based concepts of size and maturity in pharmacokinetics (allométrie & maturation)', authors: 'Anderson B.J. & Holford N.H.G.', where: 'Annu. Rev. Pharmacol. Toxicol. 2008', doi: '10.1146/annurev.pharmtox.48.113006.094708', pmid: '17914927', url: 'https://doi.org/10.1146/annurev.pharmtox.48.113006.094708' },
      { id: 'beal-bql', kind: 'article', title: 'Ways to fit a PK model with some data below the quantification limit (méthodes M1–M7)', authors: 'Beal S.L.', where: 'J. Pharmacokinet. Pharmacodyn. 2001', doi: '10.1023/A:1012299115260', pmid: '11768292', url: 'https://doi.org/10.1023/A:1012299115260' },
      { id: 'holford-clearance', kind: 'article', title: 'Clearance: the concept and its use (mise au point)', authors: 'Holford N. & Yim D.-S.', where: 'Transl. Clin. Pharmacol. 2015', doi: '10.12793/tcp.2015.23.2.42', url: 'https://doi.org/10.12793/tcp.2015.23.2.42' },
      { id: 'savic-transit', kind: 'article', title: 'Implementation of a transit compartment model for describing drug absorption (chaîne de transit, k_tr, MTT = n/k_tr)', authors: 'Savic R.M., Jonker D.M., Kerbusch T. & Karlsson M.O.', where: 'J. Pharmacokinet. Pharmacodyn. 2007', doi: '10.1007/s10928-007-9066-0', pmid: '17653836', url: 'https://doi.org/10.1007/s10928-007-9066-0' },
      { id: 'yamaoka-moments', kind: 'article', title: 'Statistical moments in pharmacokinetics (AUMC, MRT, Vss = CL·MRT)', authors: 'Yamaoka K., Nakagawa T. & Uno T.', where: 'J. Pharmacokinet. Biopharm. 1978', doi: '10.1007/BF01062109', pmid: '731417', url: 'https://doi.org/10.1007/BF01062109' },
      { id: 'houston-metabolite', kind: 'article', title: 'Drug metabolite kinetics (formation-limitée vs élimination-limitée, pente terminale)', authors: 'Houston J.B.', where: 'Pharmacol. Ther. 1981', doi: '10.1016/0163-7258(81)90056-5', pmid: '7048350', url: 'https://doi.org/10.1016/0163-7258(81)90056-5' }
    ]
  },
  {
    id: 'pkpd',
    title: { fr: 'PK/PD & modèles pharmacodynamiques', en: 'PK/PD & pharmacodynamic models' },
    items: [
      { id: 'holford-sheiner-dose-effect', kind: 'article', title: 'Understanding the dose-effect relationship (la référence du modèle Emax et log-linéaire)', authors: 'Holford N.H.G. & Sheiner L.B.', where: 'Clin. Pharmacokinet. 1981', doi: '10.2165/00003088-198106060-00002', pmid: '7032803', url: 'https://doi.org/10.2165/00003088-198106060-00002' },
      { id: 'goutelle-hill', kind: 'article', title: 'The Hill equation: a review of its capabilities in pharmacological modelling (le coefficient de sigmoïdicité)', authors: 'Goutelle S., Maurin M., Rougier F. et al.', where: 'Fundam. Clin. Pharmacol. 2008', doi: '10.1111/j.1472-8206.2008.00633.x', pmid: '19049668', url: 'https://doi.org/10.1111/j.1472-8206.2008.00633.x' },
      { id: 'sheiner-effect-compartment', kind: 'article', title: 'Simultaneous modeling of pharmacokinetics and pharmacodynamics: the effect-compartment model', authors: 'Sheiner L.B. et al.', where: 'Clin. Pharmacol. Ther. 1979', doi: '10.1002/cpt1979253358', pmid: '761446', url: 'https://doi.org/10.1002/cpt1979253358' },
      { id: 'dayneka-jusko-indirect', kind: 'article', title: 'Comparison of four basic models of indirect pharmacodynamic responses', authors: 'Dayneka N.L., Garg V. & Jusko W.J.', where: 'J. Pharmacokinet. Biopharm. 1993', doi: '10.1007/BF01061691', pmid: '8133465', url: 'https://doi.org/10.1007/BF01061691' },
      { id: 'jusko-ko-indirect', kind: 'article', title: 'General pharmacokinetic model for indirect responses', authors: 'Jusko W.J. & Ko H.C.', where: 'Clin. Pharmacol. Ther. 1994', doi: '10.1038/clpt.1994.155', pmid: '7955802', url: 'https://doi.org/10.1038/clpt.1994.155' },
      { id: 'sharma-jusko-indirect', kind: 'article', title: 'Characteristics of indirect pharmacodynamic models (tolérance, rebond, modèle à modérateur)', authors: 'Sharma A. & Jusko W.J.', where: 'Br. J. Clin. Pharmacol. 1998', doi: '10.1046/j.1365-2125.1998.00676.x', pmid: '9517366', url: 'https://doi.org/10.1046/j.1365-2125.1998.00676.x' }
    ]
  },
  {
    id: 'survie',
    title: { fr: 'Survie & modèles joints', en: 'Survival & joint models' },
    items: [
      { id: 'kaplan-meier-1958', kind: 'article', title: 'Nonparametric Estimation from Incomplete Observations (l\'estimateur de Kaplan-Meier, la censure à droite)', authors: 'Kaplan E.L. & Meier P.', where: 'J. Am. Stat. Assoc. 1958', doi: '10.1080/01621459.1958.10501452', url: 'https://doi.org/10.1080/01621459.1958.10501452' },
      { id: 'cox-1972', kind: 'article', title: 'Regression Models and Life-Tables (le modèle à hasards proportionnels)', authors: 'Cox D.R.', where: 'J. R. Stat. Soc. B 1972', doi: '10.1111/j.2517-6161.1972.tb00899.x', url: 'https://doi.org/10.1111/j.2517-6161.1972.tb00899.x' },
      { id: 'holford-tte-tutorial', kind: 'article', title: 'A Time to Event Tutorial for Pharmacometricians (fonction de hasard, S(t), formes paramétriques)', authors: 'Holford N.', where: 'CPT: PSP 2013', doi: '10.1038/psp.2013.18', pmid: '23887725', url: 'https://doi.org/10.1038/psp.2013.18' },
      { id: 'wulfsohn-tsiatis-joint', kind: 'article', title: 'A Joint Model for Survival and Longitudinal Data Measured with Error (le formalisme des modèles joints)', authors: 'Wulfsohn M.S. & Tsiatis A.A.', where: 'Biometrics 1997', doi: '10.2307/2533118', pmid: '9147598', url: 'https://doi.org/10.2307/2533118' },
      { id: 'katzman-deepsurv', kind: 'article', title: 'DeepSurv: a Cox proportional hazards deep neural network (la survie par apprentissage profond)', authors: 'Katzman J.L. et al.', where: 'BMC Med. Res. Methodol. 2018', doi: '10.1186/s12874-018-0482-1', pmid: '29482517', url: 'https://doi.org/10.1186/s12874-018-0482-1' }
    ]
  },
  {
    id: 'estimation',
    title: { fr: 'Estimation, validation & design', en: 'Estimation, validation & design' },
    items: [
      { id: 'lindstrom-bates', kind: 'article', title: 'Nonlinear Mixed Effects Models for Repeated Measures Data (la linéarisation dont dérive FO/FOCE)', authors: 'Lindstrom M.J. & Bates D.M.', where: 'Biometrics 1990', doi: '10.2307/2532087', pmid: '2242409', url: 'https://doi.org/10.2307/2532087' },
      { id: 'wang-nonmem-methods', kind: 'article', title: 'Derivation of various NONMEM estimation methods (FO, FOCE, FOCE-I, Laplace : les formules)', authors: 'Wang Y.', where: 'J. Pharmacokinet. Pharmacodyn. 2007', doi: '10.1007/s10928-007-9060-6', pmid: '17620001', url: 'https://doi.org/10.1007/s10928-007-9060-6' },
      { id: 'kuhn-lavielle-saem', kind: 'article', title: 'Maximum likelihood estimation in nonlinear mixed effects models (l\'algorithme SAEM)', authors: 'Kuhn E. & Lavielle M.', where: 'Comput. Stat. Data Anal. 2005', doi: '10.1016/j.csda.2004.07.002', url: 'https://doi.org/10.1016/j.csda.2004.07.002' },
      { id: 'akaike-aic', kind: 'article', title: 'A new look at the statistical model identification (le critère AIC = −2 log L + 2p)', authors: 'Akaike H.', where: 'IEEE Trans. Automat. Contr. 1974', doi: '10.1109/TAC.1974.1100705', url: 'https://doi.org/10.1109/TAC.1974.1100705' },
      { id: 'wilks-1938', kind: 'article', title: 'The large-sample distribution of the likelihood ratio (ΔOFV ~ χ², le seuil 3,84 à 1 ddl)', authors: 'Wilks S.S.', where: 'Ann. Math. Statist. 1938', doi: '10.1214/aoms/1177732360', url: 'https://doi.org/10.1214/aoms/1177732360' },
      { id: 'schwarz-1978', kind: 'article', title: 'Estimating the dimension of a model (le critère BIC = OFV + k·ln n)', authors: 'Schwarz G.', where: 'Ann. Statist. 1978', doi: '10.1214/aos/1176344136', url: 'https://doi.org/10.1214/aos/1176344136' },
      { id: 'asa-pvalue', kind: 'guideline', title: 'The ASA Statement on p-Values: Context, Process, and Purpose (ce qu\'une p-value dit et ne dit pas)', authors: 'Wasserstein R.L. & Lazar N.A.', where: 'The American Statistician 2016', doi: '10.1080/00031305.2016.1154108', url: 'https://doi.org/10.1080/00031305.2016.1154108' },
      { id: 'efron-bootstrap', kind: 'article', title: 'Bootstrap Methods: Another Look at the Jackknife (le rééchantillonnage avec remise)', authors: 'Efron B.', where: 'Ann. Statist. 1979', doi: '10.1214/aos/1176344552', url: 'https://doi.org/10.1214/aos/1176344552' },
      { id: 'mentre-optimal-design', kind: 'article', title: 'Optimal design in random-effects regression models (matrice d\'information de Fisher en NLME)', authors: 'Mentré F., Mallet A. & Baccar D.', where: 'Biometrika 1997', doi: '10.1093/biomet/84.2.429', url: 'https://doi.org/10.1093/biomet/84.2.429' },
      { id: 'jonsson-karlsson-scm', kind: 'article', title: 'Automated Covariate Model Building Within NONMEM (la SCM : forward inclusion / backward elimination)', authors: 'Jonsson E.N. & Karlsson M.O.', where: 'Pharm. Res. 1998', doi: '10.1023/A:1011970125687', pmid: '9755901', url: 'https://doi.org/10.1023/A:1011970125687' },
      { id: 'ribbing-selection-bias', kind: 'article', title: 'Power, selection bias and predictive performance of the population pharmacokinetic covariate model', authors: 'Ribbing J. & Jonsson E.N.', where: 'J. Pharmacokinet. Pharmacodyn. 2004', doi: '10.1023/B:JOPA.0000034404.86036.72', pmid: '15379381', url: 'https://doi.org/10.1023/B:JOPA.0000034404.86036.72' },
      { id: 'bergstrand-pcvpc', kind: 'article', title: 'Prediction-corrected visual predictive checks (pcVPC)', authors: 'Bergstrand M. et al.', where: 'AAPS J. 2011', doi: '10.1208/s12248-011-9255-z', pmid: '21302010', url: 'https://doi.org/10.1208/s12248-011-9255-z' },
      { id: 'karlsson-holford-vpc', kind: 'article', title: 'A tutorial on visual predictive checks', authors: 'Karlsson M.O. & Holford N.H.G.', where: 'PAGE 2008 (abstr. 1434)', url: 'https://www.page-meeting.org/?abstract=1434' },
      { id: 'savic-karlsson-shrinkage', kind: 'article', title: 'Importance of shrinkage in empirical Bayes estimates for diagnostics', authors: 'Savic R.M. & Karlsson M.O.', where: 'AAPS J. 2009', doi: '10.1208/s12248-009-9133-0', pmid: '19649712', url: 'https://doi.org/10.1208/s12248-009-9133-0' },
      { id: 'brendel-npde', kind: 'article', title: 'Metrics for external model evaluation with an application to NPDE', authors: 'Brendel K. et al.', where: 'Pharm. Res. 2006', doi: '10.1007/s11095-006-9067-5', pmid: '16906454', url: 'https://doi.org/10.1007/s11095-006-9067-5' },
      { id: 'hooker-cwres', kind: 'article', title: 'Conditional weighted residuals (CWRES): a diagnostic for population models', authors: 'Hooker A.C. et al.', where: 'Pharm. Res. 2007', doi: '10.1007/s11095-007-9361-x', pmid: '17612795', url: 'https://doi.org/10.1007/s11095-007-9361-x' },
      { id: 'karlsson-sheiner-iov', kind: 'article', title: 'The importance of modeling interoccasion variability in population analyses', authors: 'Karlsson M.O. & Sheiner L.B.', where: 'J. Pharmacokinet. Biopharm. 1993', doi: '10.1007/BF01113502', pmid: '8138894', url: 'https://doi.org/10.1007/BF01113502' },
      { id: 'fidler-nlmixr', kind: 'article', title: 'Nonlinear Mixed-Effects Model Development and Simulation Using nlmixr and Related R Open-Source Packages', authors: 'Fidler M., Wilkins J.J., Hooijmaijers R. et al.', where: 'CPT: PSP 2019', doi: '10.1002/psp4.12445', pmid: '31207186', url: 'https://doi.org/10.1002/psp4.12445' }
    ]
  },
  {
    id: 'tdm',
    title: { fr: 'TDM & dosage de précision (MIPD)', en: 'TDM & precision dosing (MIPD)' },
    items: [
      { id: 'minichmayr-mipd', kind: 'article', title: 'Model-informed precision dosing: state of the art and future perspectives', authors: 'Minichmayr I.K., Dreesen E., Centanni M. et al.', where: 'Adv. Drug Deliv. Rev. 2024', doi: '10.1016/j.addr.2024.115421', pmid: '39159868', url: 'https://doi.org/10.1016/j.addr.2024.115421' },
      { id: 'berrah-residual', kind: 'article', title: 'Better Dosing Through Better Error: Residual Error as a Hidden Lever in Model-Informed Precision Dosing', authors: 'Berrah R., Minichmayr I.K. & Woillard J.-B. (IATDMCT Pharmacometrics Group)', where: 'Ther. Drug Monit. 2025', doi: '10.1097/FTD.0000000000001413', pmid: '41358610', url: 'https://doi.org/10.1097/FTD.0000000000001413' },
      { id: 'hughes-keizer', kind: 'article', title: 'A hybrid machine learning/pharmacokinetic approach outperforms MAP Bayesian estimation by selectively flattening model priors', authors: 'Hughes J.H. & Keizer R.J.', where: 'CPT: PSP 2021', doi: '10.1002/psp4.12684', pmid: '34270885', url: 'https://doi.org/10.1002/psp4.12684' },
      { id: 'mapbayr', kind: 'article', title: 'mapbayr — estimation bayésienne MAP en R', authors: 'Le Louedec F. et al.', where: 'CPT: PSP 2021', doi: '10.1002/psp4.12689', pmid: '34342170', url: 'https://doi.org/10.1002/psp4.12689' },
      { id: 'woillard-tacrolimus', kind: 'article', title: 'Population pharmacokinetic model and Bayesian estimator for two tacrolimus formulations', authors: 'Woillard J.-B. et al.', where: 'Br. J. Clin. Pharmacol. 2011', doi: '10.1111/j.1365-2125.2010.03837.x', pmid: '21284698', url: 'https://doi.org/10.1111/j.1365-2125.2010.03837.x' }
    ]
  },
  {
    id: 'pbpk',
    title: { fr: 'PBPK', en: 'PBPK' },
    items: [
      { id: 'kuepfer-pbpk', kind: 'article', title: 'Applied Concepts in PBPK Modeling: How to Build a PBPK/PD Model (tutoriel)', authors: 'Kuepfer L. et al.', where: 'CPT: PSP 2016', doi: '10.1002/psp4.12134', pmid: '27653238', url: 'https://doi.org/10.1002/psp4.12134' },
      { id: 'rowland-peck-tucker', kind: 'article', title: 'Physiologically-based pharmacokinetics in drug development and regulatory science', authors: 'Rowland M., Peck C. & Tucker G.', where: 'Annu. Rev. Pharmacol. Toxicol. 2011', doi: '10.1146/annurev-pharmtox-010510-100540', pmid: '20854171', url: 'https://doi.org/10.1146/annurev-pharmtox-010510-100540' },
      { id: 'jones-pbpk-industry', kind: 'article', title: 'PBPK modeling in drug discovery and development: a pharmaceutical industry perspective', authors: 'Jones H.M. et al.', where: 'Clin. Pharmacol. Ther. 2015', doi: '10.1002/cpt.37', pmid: '25670209', url: 'https://doi.org/10.1002/cpt.37' },
      { id: 'poulin-theil', kind: 'article', title: 'Prediction of pharmacokinetics prior to in vivo studies (prédiction mécaniste des Kp par composition tissulaire)', authors: 'Poulin P. & Theil F.-P.', where: 'J. Pharm. Sci. 2002', doi: '10.1002/jps.10005', pmid: '11782904', url: 'https://doi.org/10.1002/jps.10005' },
      { id: 'rodgers-rowland', kind: 'article', title: 'Physiologically based pharmacokinetic modelling 2: predicting the tissue distribution of acids, very weak bases, neutrals and zwitterions', authors: 'Rodgers T. & Rowland M.', where: 'J. Pharm. Sci. 2006', doi: '10.1002/jps.20502', pmid: '16639716', url: 'https://doi.org/10.1002/jps.20502' },
      { id: 'amidon-bcs', kind: 'article', title: 'A theoretical basis for a biopharmaceutic drug classification (le BCS : solubilité × perméabilité)', authors: 'Amidon G.L., Lennernäs H., Shah V.P. & Crison J.R.', where: 'Pharm. Res. 1995', doi: '10.1023/A:1016212804288', pmid: '7617530', url: 'https://doi.org/10.1023/A:1016212804288' },
      { id: 'yu-amidon-acat', kind: 'article', title: 'A compartmental absorption and transit model for estimating oral drug absorption (le modèle CAT/ACAT)', authors: 'Yu L.X. & Amidon G.L.', where: 'Int. J. Pharm. 1999', doi: '10.1016/S0378-5173(99)00147-7', pmid: '10486079', url: 'https://doi.org/10.1016/S0378-5173(99)00147-7' },
      { id: 'rostami-hodjegan-ivive', kind: 'article', title: 'Simulation and prediction of in vivo drug metabolism in human populations from in vitro data (l\'IVIVE)', authors: 'Rostami-Hodjegan A. & Tucker G.T.', where: 'Nat. Rev. Drug Discov. 2007', doi: '10.1038/nrd2173', pmid: '17268485', url: 'https://doi.org/10.1038/nrd2173' }
    ]
  },
  {
    id: 'onco',
    title: { fr: 'Oncologie', en: 'Oncology' },
    items: [
      { id: 'simeoni', kind: 'article', title: 'Predictive pharmacokinetic-pharmacodynamic modeling of tumor growth (modèle de Simeoni)', authors: 'Simeoni M. et al.', where: 'Cancer Res. 2004', doi: '10.1158/0008-5472.CAN-03-2524', pmid: '14871843', url: 'https://doi.org/10.1158/0008-5472.CAN-03-2524' },
      { id: 'claret-tgi-os', kind: 'article', title: 'Model-based prediction of survival from tumor size (TGI-OS, modèle de Claret)', authors: 'Claret L. et al.', where: 'J. Clin. Oncol. 2009', doi: '10.1200/JCO.2008.21.0807', pmid: '19636014', url: 'https://doi.org/10.1200/JCO.2008.21.0807' },
      { id: 'stein-tumor-growth', kind: 'article', title: 'Tumor growth rates derived from data for patients in a clinical trial (décomposition régression / recroissance)', authors: 'Stein W.D. et al.', where: 'The Oncologist 2008', doi: '10.1634/theoncologist.2008-0075', pmid: '19029201', url: 'https://doi.org/10.1634/theoncologist.2008-0075' },
      { id: 'wang-tumor-size-survival', kind: 'article', title: 'Elucidation of relationship between tumor size and survival in non-small-cell lung cancer patients', authors: 'Wang Y. et al.', where: 'Clin. Pharmacol. Ther. 2009', doi: '10.1038/clpt.2009.64', pmid: '19440188', url: 'https://doi.org/10.1038/clpt.2009.64' },
      { id: 'friberg', kind: 'article', title: 'Semi-mechanistic model of chemotherapy-induced myelosuppression (Friberg)', authors: 'Friberg L.E. et al.', where: 'J. Clin. Oncol. 2002', doi: '10.1200/JCO.2002.02.140', pmid: '12488418', url: 'https://doi.org/10.1200/JCO.2002.02.140' }
    ]
  },
  {
    id: 'infectio',
    title: { fr: 'Infectiologie', en: 'Infectious diseases' },
    items: [
      { id: 'craig-pkpd', kind: 'article', title: 'Pharmacokinetic/pharmacodynamic parameters: the founding framework of PK/PD indices', authors: 'Craig W.A.', where: 'Clin. Infect. Dis. 1998', doi: '10.1086/516284', pmid: '9455502', url: 'https://doi.org/10.1086/516284' },
      { id: 'rybak-vanco', kind: 'guideline', title: 'Vancomycin therapeutic monitoring: AUC-guided consensus guideline (cible AUC₂₄/CMI ≥ 400)', authors: 'Rybak M.J. et al.', where: 'Am. J. Health-Syst. Pharm. 2020', doi: '10.1093/ajhp/zxaa036', pmid: '32191793', url: 'https://doi.org/10.1093/ajhp/zxaa036' },
      { id: 'roberts-dali', kind: 'article', title: 'DALI: Defining Antibiotic Levels in Intensive Care Unit patients (sous-exposition des β-lactamines, clairance rénale augmentée)', authors: 'Roberts J.A. et al.', where: 'Clin. Infect. Dis. 2014', doi: '10.1093/cid/ciu027', pmid: '24429437', url: 'https://doi.org/10.1093/cid/ciu027' },
      { id: 'neumann-hcv', kind: 'article', title: 'Viral dynamics of hepatitis C under interferon therapy (décroissance biphasique)', authors: 'Neumann A.U. et al.', where: 'Science 1998', doi: '10.1126/science.282.5386.103', pmid: '9756471', url: 'https://doi.org/10.1126/science.282.5386.103' },
      { id: 'perelson-hiv', kind: 'article', title: 'HIV-1 dynamics in vivo (clairance des virions, durée de vie des cellules infectées)', authors: 'Perelson A.S. et al.', where: 'Science 1996', doi: '10.1126/science.271.5255.1582', pmid: '8599114', url: 'https://doi.org/10.1126/science.271.5255.1582' }
    ]
  },
  {
    id: 'mab',
    title: { fr: 'Anticorps monoclonaux', en: 'Monoclonal antibodies' },
    items: [
      { id: 'ryman-meibohm', kind: 'article', title: 'Pharmacokinetics of monoclonal antibodies (FcRn, absorption lymphatique, immunogénicité)', authors: 'Ryman J.T. & Meibohm B.', where: 'CPT: PSP 2017', doi: '10.1002/psp4.12224', pmid: '28653357', url: 'https://doi.org/10.1002/psp4.12224' },
      { id: 'dirks-meibohm', kind: 'article', title: 'Population pharmacokinetics of therapeutic monoclonal antibodies (impact PK des anticorps anti-médicament)', authors: 'Dirks N.L. & Meibohm B.', where: 'Clin. Pharmacokinet. 2010', doi: '10.2165/11535960-000000000-00000', pmid: '20818831', url: 'https://doi.org/10.2165/11535960-000000000-00000' },
      { id: 'mager-jusko-tmdd', kind: 'article', title: 'General pharmacokinetic model for target-mediated drug disposition (TMDD)', authors: 'Mager D.E. & Jusko W.J.', where: 'J. Pharmacokinet. Pharmacodyn. 2001', doi: '10.1023/A:1014414520282', pmid: '11999290', url: 'https://doi.org/10.1023/A:1014414520282' },
      { id: 'gibiansky-qss', kind: 'article', title: 'Approximations of the target-mediated drug disposition model (QSS, rapid-binding) et identifiabilité', authors: 'Gibiansky L., Gibiansky E., Kakkar T. & Ma P.', where: 'J. Pharmacokinet. Pharmacodyn. 2008', doi: '10.1007/s10928-008-9102-8', pmid: '18979205', url: 'https://doi.org/10.1007/s10928-008-9102-8' }
    ]
  },
  {
    id: 'ai',
    title: { fr: 'IA & machine learning', en: 'AI & machine learning' },
    items: [
      { id: 'cortes-vapnik-svm', kind: 'article', title: 'Support-Vector Networks (naissance des SVM)', authors: 'Cortes C. & Vapnik V.', where: 'Machine Learning 1995', doi: '10.1007/BF00994018', url: 'https://doi.org/10.1007/BF00994018' },
      { id: 'breiman-rf', kind: 'article', title: 'Random Forests', authors: 'Breiman L.', where: 'Machine Learning 2001', doi: '10.1023/A:1010933404324', url: 'https://doi.org/10.1023/A:1010933404324' },
      { id: 'friedman-gbm', kind: 'article', title: 'Greedy function approximation: a gradient boosting machine (l\'article fondateur du gradient boosting)', authors: 'Friedman J.H.', where: 'Ann. Statist. 2001', doi: '10.1214/aos/1013203451', url: 'https://doi.org/10.1214/aos/1013203451' },
      { id: 'chen-xgboost', kind: 'article', title: 'XGBoost: A Scalable Tree Boosting System (objectif régularisé au 2e ordre)', authors: 'Chen T. & Guestrin C.', where: 'KDD 2016', doi: '10.1145/2939672.2939785', url: 'https://doi.org/10.1145/2939672.2939785' },
      { id: 'prokhorenkova-catboost', kind: 'article', title: 'CatBoost: unbiased boosting with categorical features (boosting ordonné)', authors: 'Prokhorenkova L. et al.', where: 'NeurIPS 2018', doi: '10.48550/arXiv.1706.09516', url: 'https://doi.org/10.48550/arXiv.1706.09516' },
      { id: 'guyon-featsel', kind: 'article', title: 'An Introduction to Variable and Feature Selection', authors: 'Guyon I. & Elisseeff A.', where: 'JMLR 2003', url: 'https://www.jmlr.org/papers/v3/guyon03a.html' },
      { id: 'genuer-vsurf', kind: 'article', title: 'Variable selection using random forests (VSURF)', authors: 'Genuer R., Poggi J.-M. & Tuleau-Malot C.', where: 'Pattern Recognition Letters 2010', doi: '10.1016/j.patrec.2010.03.014', url: 'https://doi.org/10.1016/j.patrec.2010.03.014' },
      { id: 'hornung-ordinal-forests', kind: 'article', title: 'Ordinal Forests (forêts aléatoires pour une réponse ordinale : grades de toxicité, RECIST)', authors: 'Hornung R.', where: 'J. Classif. 2020', doi: '10.1007/s00357-018-9302-x', url: 'https://doi.org/10.1007/s00357-018-9302-x' },
      { id: 'marchenko-pastur', kind: 'article', title: 'Distribution of eigenvalues for some sets of random matrices (loi de Marchenko-Pastur)', authors: 'Marchenko V.A. & Pastur L.A.', where: 'Math. USSR Sbornik 1967', doi: '10.1070/SM1967v001n04ABEH001994', url: 'https://doi.org/10.1070/SM1967v001n04ABEH001994' },
      { id: 'pearson-1901-pca', kind: 'article', title: 'On lines and planes of closest fit to systems of points in space (naissance de l\'ACP)', authors: 'Pearson K.', where: 'Philosophical Magazine 1901', doi: '10.1080/14786440109462720', url: 'https://doi.org/10.1080/14786440109462720' },
      { id: 'hotelling-1933', kind: 'article', title: 'Analysis of a complex of statistical variables into principal components (l\'ACP moderne)', authors: 'Hotelling H.', where: 'J. Educ. Psychol. 1933', doi: '10.1037/h0071325', url: 'https://doi.org/10.1037/h0071325' },
      { id: 'vaswani-transformer', kind: 'article', title: 'Attention Is All You Need (Transformer, attention softmax(QKᵀ/√d)V)', authors: 'Vaswani A. et al.', where: 'NeurIPS 2017', doi: '10.48550/arXiv.1706.03762', url: 'https://doi.org/10.48550/arXiv.1706.03762' },
      { id: 'brown-gpt3', kind: 'article', title: 'Language Models are Few-Shot Learners (le passage à l\'échelle, l\'apprentissage en contexte)', authors: 'Brown T.B. et al.', where: 'NeurIPS 2020', doi: '10.48550/arXiv.2005.14165', url: 'https://doi.org/10.48550/arXiv.2005.14165' },
      { id: 'chen-neural-ode', kind: 'article', title: 'Neural Ordinary Differential Equations', authors: 'Chen R.T.Q., Rubanova Y., Bettencourt J. & Duvenaud D.', where: 'NeurIPS 2018', doi: '10.48550/arXiv.1806.07366', url: 'https://doi.org/10.48550/arXiv.1806.07366' },
      { id: 'woillard-ml-tacrolimus', kind: 'article', title: 'Machine learning to predict tacrolimus AUC for therapeutic monitoring', authors: 'Woillard J.-B. et al.', where: 'Clin. Pharmacol. Ther. 2021', doi: '10.1002/cpt.2123', pmid: '33253425', url: 'https://doi.org/10.1002/cpt.2123' }
    ]
  },
  {
    id: 'trials',
    title: { fr: 'Design & essais cliniques', en: 'Design & clinical trials' },
    items: [
      { id: 'bretz-mcp-mod', kind: 'article', title: 'Combining multiple comparisons and modeling for dose finding (MCP-Mod)', authors: 'Bretz F., Pinheiro J. & Branson M.', where: 'Biometrics 2005', doi: '10.1111/j.1541-0420.2005.00344.x', pmid: '16135025', url: 'https://doi.org/10.1111/j.1541-0420.2005.00344.x' }
    ]
  },
  {
    id: 'reglementaire',
    title: { fr: 'Textes réglementaires & recommandations', en: 'Regulatory texts & guidelines' },
    items: [
      { id: 'ema-bioequivalence', kind: 'guideline', title: 'Guideline on the Investigation of Bioequivalence (les critères 80–125 %, IC 90 % sur AUC et Cmax)', authors: 'European Medicines Agency (CHMP)', where: 'CPMP/EWP/QWP/1401/98 Rev. 1', url: 'https://www.ema.europa.eu/en/investigation-bioequivalence-scientific-guideline' },
      { id: 'fda-bioequivalence', kind: 'guideline', title: 'Bioequivalence Studies With Pharmacokinetic Endpoints for Drugs Submitted Under an ANDA', authors: 'U.S. FDA', where: 'Guidance for Industry', url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/bioequivalence-studies-pharmacokinetic-endpoints-drugs-submitted-under-abbreviated-new-drug' },
      { id: 'fda-poppk', kind: 'guideline', title: 'Guidance for Industry: Population Pharmacokinetics', authors: 'U.S. FDA', where: '2022 (révision)', url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/population-pharmacokinetics' },
      { id: 'ema-poppk', kind: 'guideline', title: 'Guideline on reporting the results of population pharmacokinetic analyses', authors: 'European Medicines Agency (CHMP)', where: '2007', url: 'https://www.ema.europa.eu/en/reporting-results-population-pharmacokinetic-analyses-scientific-guideline' },
      { id: 'ema-pbpk', kind: 'guideline', title: 'Guideline on the reporting of PBPK modelling and simulation', authors: 'European Medicines Agency', where: '2018', url: 'https://www.ema.europa.eu/en/documents/scientific-guideline/guideline-reporting-physiologically-based-pharmacokinetic-pbpk-modelling-and-simulation_en.pdf' },
      { id: 'fda-pbpk', kind: 'guideline', title: 'Physiologically Based Pharmacokinetic Analyses — Format and Content', authors: 'U.S. FDA', where: '2018', url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/physiologically-based-pharmacokinetic-analyses-format-and-content-guidance-industry' },
      { id: 'fda-immunogenicity', kind: 'guideline', title: 'Immunogenicity Testing of Therapeutic Protein Products (dosage des ADA, interférence du médicament circulant)', authors: 'U.S. FDA', where: 'Guidance for Industry', url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/immunogenicity-testing-therapeutic-protein-products-developing-and-validating-assays-anti-drug' },
      { id: 'fda-starting-dose', kind: 'guideline', title: 'Estimating the Maximum Safe Starting Dose (NOAEL / HED)', authors: 'U.S. FDA', where: '2005', url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/estimating-maximum-safe-starting-dose-initial-clinical-trials-therapeutics-adult-healthy-volunteers' },
      { id: 'ema-fih', kind: 'guideline', title: 'Strategies to identify and mitigate risks for first-in-human trials (MABEL)', authors: 'European Medicines Agency', where: 'révisé 2017', url: 'https://www.ema.europa.eu/en/documents/scientific-guideline/guideline-strategies-identify-and-mitigate-risks-first-human-and-early-clinical-trials-investigational-medicinal-products-revision-1_en.pdf' },
      { id: 'ich-e4', kind: 'guideline', title: 'ICH E4 — Dose-Response Information to Support Drug Registration', authors: 'ICH', where: '1994', url: 'https://database.ich.org/sites/default/files/E4_Guideline.pdf' },
      { id: 'eucast', kind: 'guideline', title: 'Clinical Breakpoint Tables (détermination des CMI, dilutions de raison 2)', authors: 'EUCAST', where: 'European Committee on Antimicrobial Susceptibility Testing', url: 'https://www.eucast.org/clinical_breakpoints' }
    ]
  },
  {
    id: 'liens',
    title: { fr: 'Liens utiles (ne sont pas des sources)', en: 'Useful links (not sources)' },
    note: {
      fr: 'Une page de laboratoire, un site d\'association ou une page produit ne peut soutenir aucune affirmation : son contenu change et ne dit rien de vérifiable. Ces liens sont donnés pour aller plus loin — aucun chapitre ne s\'en sert comme source.',
      en: 'A lab page, a society website or a product page cannot support any claim: its content changes and asserts nothing verifiable. These links are given for further reading — no chapter cites them as a source.'
    },
    items: [
      { id: 'mlu-explain', kind: 'course', citable: false, title: 'MLU-Explain — explications visuelles du machine learning', authors: 'Amazon Machine Learning University', url: 'https://mlu-explain.github.io' },
      { id: 'pfim', kind: 'tool', citable: false, title: 'PFIM — design optimal en modèles non linéaires à effets mixtes', authors: 'Mentré F. et al.', where: 'Université Paris Cité / Inserm', url: 'https://cran.r-project.org/package=PFIM' },
      { id: 'nonmem', kind: 'tool', citable: false, title: 'NONMEM — le logiciel historique de la PK de population', authors: 'Beal S.L. & Sheiner L.B.', where: 'ICON plc', url: 'https://www.iconplc.com/solutions/technologies/nonmem' },
      { id: 'monolix', kind: 'tool', citable: false, title: 'Monolix / MonolixSuite (SAEM)', where: 'Lixoft / Simulations Plus', url: 'https://lixoft.com' },
      { id: 'nlmixr2', kind: 'tool', citable: false, title: 'nlmixr2 — modélisation NLME open-source en R', url: 'https://nlmixr2.org' },
      { id: 'mrgsolve', kind: 'tool', citable: false, title: 'mrgsolve — simulation d\'ODE/PK-PD en R', authors: 'Elmokadem A., Riggs M.M. & Baron K.T.', url: 'https://mrgsolve.org' },
      { id: 'certara', kind: 'tool', citable: false, title: 'Certara — Phoenix NLME & Simcyp (PBPK)', url: 'https://www.certara.com' },
      { id: 'iatdmct', kind: 'course', citable: false, title: 'IATDMCT — International Association of Therapeutic Drug Monitoring and Clinical Toxicology', url: 'https://www.iatdmct.org' },
      { id: 'iame', kind: 'course', citable: false, title: 'IAME — modélisation des maladies infectieuses (Bichat)', authors: 'Guedj J., Mentré F. et al.', where: 'Inserm / Université Paris Cité', url: 'https://www.iame-research.center/' },
      { id: 'compo', kind: 'course', citable: false, title: 'COMPO — Cancer, modélisation & pharmacologie (Marseille)', authors: 'Benzekry S., Ciccolini J. et al.', where: 'Inria / Inserm / AMU', url: 'https://team.inria.fr/compo/' },
      { id: 'vanderschaar', kind: 'course', citable: false, title: 'van der Schaar Lab — machine learning pour la médecine', authors: 'van der Schaar M. et al.', where: 'University of Cambridge', url: 'https://www.vanderschaar-lab.com' },
      { id: 'isop', kind: 'course', citable: false, title: 'ISoP — International Society of Pharmacometrics', url: 'https://www.go-isop.org' },
      { id: 'page', kind: 'course', citable: false, title: 'PAGE — Population Approach Group in Europe', url: 'https://www.page-meeting.org' }
    ]
  }
];

/** Index plat : id → référence. */
export const refById = (() => {
  const idx = {};
  for (const g of referenceGroups) for (const it of g.items) idx[it.id] = it;
  return idx;
})();

/** Tous les identifiants du pool. */
export const allRefIds = Object.keys(refById);

/** Les identifiants réellement CITABLES : un lien utile n'est pas une source. */
export const citableRefIds = allRefIds.filter((id) => refById[id].citable !== false);

/** Étiquette courte de l'identifiant, à afficher à côté de la source. */
export function refIdentifier(r) {
  if (!r) return '';
  if (r.doi) return 'DOI ' + r.doi;
  if (r.pmid) return 'PMID ' + r.pmid;
  if (r.isbn) return 'ISBN ' + r.isbn;
  return '';
}

/** @param {string[]|undefined} ids */
export function resolveSources(ids) {
  if (!Array.isArray(ids)) return [];
  return ids.map((id) => refById[id]).filter(Boolean);
}
