// @ts-nocheck
// RÉFÉRENCES — pool FERMÉ, à IDENTIFIANTS STABLES ET VÉRIFIÉS.
//
// Chaque entrée porte un identifiant qui résout vers UN SEUL document, pour toujours :
//   doi  -> https://doi.org/<doi>
//   pmid -> https://pubmed.ncbi.nlm.nih.gov/<pmid>/
//   isbn -> https://search.worldcat.org/isbn/<isbn>
//   url  -> page officielle (agence, éditeur, projet) pour les recommandations et outils
// AUCUN lien de recherche : une recherche n'est ni stable, ni univoque, donc pas une citation.
// Chaque identifiant a été RÉSOLU et son titre vérifié (2026-07).
//
// Les chapitres s'y rattachent via `sources: [<id>, ...]` dans leur frontmatter.
// Un id inconnu — ou un lien de recherche — fait ÉCHOUER le smoke test.

/** @typedef {{id:string, kind:string, title:string, authors?:string, where?:string, doi?:string, pmid?:string, isbn?:string, url:string}} Reference */

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
      { id: 'lavielle', kind: 'book', title: 'Mixed Effects Models for the Population Approach', authors: 'Lavielle M.', where: 'Chapman & Hall/CRC (SAEM)', isbn: '9781482226508', url: 'https://search.worldcat.org/isbn/9781482226508' }
    ]
  },
  {
    id: 'tutorials',
    title: { fr: 'Tutoriels & mises au point', en: 'Tutorials & primers' },
    items: [
      { id: 'mould-upton', kind: 'article', title: 'Basic Concepts in Population Modeling, Simulation, and Model-Based Drug Development (Parties 1–3)', authors: 'Mould D.R. & Upton R.N.', where: 'CPT: Pharmacometrics Syst. Pharmacol. 2012–2013', doi: '10.1038/psp.2012.4', pmid: '23835886', url: 'https://doi.org/10.1038/psp.2012.4' },
      { id: 'jones-rowland-yeo', kind: 'article', title: 'Basic concepts in physiologically based pharmacokinetic (PBPK) modeling', authors: 'Jones H. & Rowland-Yeo K.', where: 'CPT: PSP 2013', doi: '10.1038/psp.2013.41', pmid: '23945604', url: 'https://doi.org/10.1038/psp.2013.41' },
      { id: 'keizer-psn-xpose', kind: 'article', title: 'Modeling and simulation workbench for NONMEM: PsN, Xpose, Pirana', authors: 'Keizer R.J., Karlsson M.O. & Hooker A.', where: 'CPT: PSP 2013', doi: '10.1038/psp.2013.24', pmid: '23836189', url: 'https://doi.org/10.1038/psp.2013.24' },
      { id: 'mlu-explain', kind: 'course', title: 'MLU-Explain — explications visuelles du machine learning', authors: 'Amazon Machine Learning University', where: 'Random Forest, Decision Trees, Neural Networks…', url: 'https://mlu-explain.github.io' }
    ]
  },
  {
    id: 'fondamentaux',
    title: { fr: 'Fondamentaux PK (articles)', en: 'PK fundamentals (papers)' },
    items: [
      { id: 'sheiner-beal-estimation', kind: 'article', title: 'Evaluation of methods for estimating population pharmacokinetic parameters (série I–III)', authors: 'Sheiner L.B. & Beal S.L.', where: 'J. Pharmacokinet. Biopharm. 1980–1983 — acte de naissance de la PK de population', doi: '10.1007/BF01060053', pmid: '7229908', url: 'https://doi.org/10.1007/BF01060053' },
      { id: 'anderson-holford-allometry', kind: 'article', title: 'Mechanism-based concepts of size and maturity in pharmacokinetics (allométrie & maturation)', authors: 'Anderson B.J. & Holford N.H.G.', where: 'Annu. Rev. Pharmacol. Toxicol. 2008', doi: '10.1146/annurev.pharmtox.48.113006.094708', pmid: '17914927', url: 'https://doi.org/10.1146/annurev.pharmtox.48.113006.094708' },
      { id: 'beal-bql', kind: 'article', title: 'Ways to fit a PK model with some data below the quantification limit (méthodes M1–M7)', authors: 'Beal S.L.', where: 'J. Pharmacokinet. Pharmacodyn. 2001', doi: '10.1023/A:1012299115260', pmid: '11768292', url: 'https://doi.org/10.1023/A:1012299115260' },
      { id: 'holford-clearance', kind: 'article', title: 'Clearance: the concept and its use (mise au point)', authors: 'Holford N. & Yim D.-S.', where: 'Transl. Clin. Pharmacol. 2015', doi: '10.12793/tcp.2015.23.2.42', url: 'https://doi.org/10.12793/tcp.2015.23.2.42' }
    ]
  },
  {
    id: 'pkpd',
    title: { fr: 'PK/PD & modèles pharmacodynamiques', en: 'PK/PD & pharmacodynamic models' },
    items: [
      { id: 'sheiner-effect-compartment', kind: 'article', title: 'Simultaneous modeling of pharmacokinetics and pharmacodynamics: the effect-compartment model', authors: 'Sheiner L.B. et al.', where: 'Clin. Pharmacol. Ther. 1979', doi: '10.1002/cpt1979253358', pmid: '761446', url: 'https://doi.org/10.1002/cpt1979253358' },
      { id: 'dayneka-jusko-indirect', kind: 'article', title: 'Comparison of four basic models of indirect pharmacodynamic responses', authors: 'Dayneka N.L., Garg V. & Jusko W.J.', where: 'J. Pharmacokinet. Biopharm. 1993', doi: '10.1007/BF01061691', pmid: '8133465', url: 'https://doi.org/10.1007/BF01061691' },
      { id: 'jusko-ko-indirect', kind: 'article', title: 'General pharmacokinetic model for indirect responses', authors: 'Jusko W.J. & Ko H.C.', where: 'Clin. Pharmacol. Ther. 1994', doi: '10.1038/clpt.1994.155', pmid: '7955802', url: 'https://doi.org/10.1038/clpt.1994.155' }
    ]
  },
  {
    id: 'estimation',
    title: { fr: 'Estimation, validation & design', en: 'Estimation, validation & design' },
    items: [
      { id: 'bergstrand-pcvpc', kind: 'article', title: 'Prediction-corrected visual predictive checks (pcVPC)', authors: 'Bergstrand M. et al.', where: 'AAPS J. 2011', doi: '10.1208/s12248-011-9255-z', pmid: '21302010', url: 'https://doi.org/10.1208/s12248-011-9255-z' },
      { id: 'karlsson-holford-vpc', kind: 'article', title: 'A tutorial on visual predictive checks', authors: 'Karlsson M.O. & Holford N.H.G.', where: 'PAGE 2008 (abstr. 1434)', url: 'https://www.page-meeting.org/?abstract=1434' },
      { id: 'savic-karlsson-shrinkage', kind: 'article', title: 'Importance of shrinkage in empirical Bayes estimates for diagnostics', authors: 'Savic R.M. & Karlsson M.O.', where: 'AAPS J. 2009', doi: '10.1208/s12248-009-9133-0', pmid: '19649712', url: 'https://doi.org/10.1208/s12248-009-9133-0' },
      { id: 'brendel-npde', kind: 'article', title: 'Metrics for external model evaluation with an application to NPDE', authors: 'Brendel K. et al.', where: 'Pharm. Res. 2006', doi: '10.1007/s11095-006-9067-5', pmid: '16906454', url: 'https://doi.org/10.1007/s11095-006-9067-5' },
      { id: 'hooker-cwres', kind: 'article', title: 'Conditional weighted residuals (CWRES): a diagnostic for population models', authors: 'Hooker A.C. et al.', where: 'Pharm. Res. 2007', doi: '10.1007/s11095-007-9361-x', pmid: '17612795', url: 'https://doi.org/10.1007/s11095-007-9361-x' },
      { id: 'karlsson-sheiner-iov', kind: 'article', title: 'The importance of modeling interoccasion variability in population analyses', authors: 'Karlsson M.O. & Sheiner L.B.', where: 'J. Pharmacokinet. Biopharm. 1993', doi: '10.1007/BF01113502', pmid: '8138894', url: 'https://doi.org/10.1007/BF01113502' },
      { id: 'pfim', kind: 'tool', title: 'PFIM — design optimal en modèles non linéaires à effets mixtes (équipe IAME)', authors: 'Mentré F. et al.', where: 'Université Paris Cité / Inserm', url: 'https://cran.r-project.org/package=PFIM' },
      { id: 'fda-poppk', kind: 'guideline', title: 'Guidance for Industry: Population Pharmacokinetics', authors: 'U.S. FDA', where: '2022 (révision)', url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/population-pharmacokinetics' },
      { id: 'ema-poppk', kind: 'guideline', title: 'Guideline on reporting the results of population pharmacokinetic analyses', authors: 'European Medicines Agency (CHMP)', where: '2007', url: 'https://www.ema.europa.eu/en/reporting-results-population-pharmacokinetic-analyses-scientific-guideline' }
    ]
  },
  {
    id: 'tdm',
    title: { fr: 'TDM & dosage de précision (MIPD)', en: 'TDM & precision dosing (MIPD)' },
    items: [
      { id: 'minichmayr-mipd', kind: 'article', title: 'Model-informed precision dosing: state of the art and future perspectives', authors: 'Minichmayr I.K., Dreesen E., Centanni M. et al.', where: 'Adv. Drug Deliv. Rev. 2024', doi: '10.1016/j.addr.2024.115421', pmid: '39159868', url: 'https://doi.org/10.1016/j.addr.2024.115421' },
      { id: 'berrah-residual', kind: 'article', title: 'Better Dosing Through Better Error: Residual Error as a Hidden Lever in Model-Informed Precision Dosing', authors: 'Berrah R., Minichmayr I.K. & Woillard J.-B. (IATDMCT Pharmacometrics Group)', where: 'Ther. Drug Monit. 2025', doi: '10.1097/FTD.0000000000001413', pmid: '41358610', url: 'https://doi.org/10.1097/FTD.0000000000001413' },
      { id: 'hughes-keizer', kind: 'article', title: 'A hybrid machine learning/pharmacokinetic approach outperforms MAP Bayesian estimation by selectively flattening model priors', authors: 'Hughes J.H. & Keizer R.J.', where: 'CPT: PSP 2021', doi: '10.1002/psp4.12684', pmid: '34270885', url: 'https://doi.org/10.1002/psp4.12684' },
      { id: 'mapbayr', kind: 'tool', title: 'mapbayr — estimation bayésienne MAP en R', authors: 'Le Louedec F. et al.', where: 'CPT: PSP 2021', doi: '10.1002/psp4.12689', pmid: '34342170', url: 'https://doi.org/10.1002/psp4.12689' },
      { id: 'woillard-tacrolimus', kind: 'article', title: 'Population pharmacokinetic model and Bayesian estimator for two tacrolimus formulations', authors: 'Woillard J.-B. et al.', where: 'Br. J. Clin. Pharmacol. 2011', doi: '10.1111/j.1365-2125.2010.03837.x', pmid: '21284698', url: 'https://doi.org/10.1111/j.1365-2125.2010.03837.x' },
      { id: 'iatdmct', kind: 'course', title: 'IATDMCT — International Association of Therapeutic Drug Monitoring and Clinical Toxicology', url: 'https://www.iatdmct.org' }
    ]
  },
  {
    id: 'pbpk',
    title: { fr: 'PBPK', en: 'PBPK' },
    items: [
      { id: 'kuepfer-pbpk', kind: 'article', title: 'Applied Concepts in PBPK Modeling: How to Build a PBPK/PD Model (tutoriel)', authors: 'Kuepfer L. et al.', where: 'CPT: PSP 2016', doi: '10.1002/psp4.12134', pmid: '27653238', url: 'https://doi.org/10.1002/psp4.12134' },
      { id: 'rowland-peck-tucker', kind: 'article', title: 'Physiologically-based pharmacokinetics in drug development and regulatory science', authors: 'Rowland M., Peck C. & Tucker G.', where: 'Annu. Rev. Pharmacol. Toxicol. 2011', doi: '10.1146/annurev-pharmtox-010510-100540', pmid: '20854171', url: 'https://doi.org/10.1146/annurev-pharmtox-010510-100540' },
      { id: 'jones-pbpk-industry', kind: 'article', title: 'PBPK modeling in drug discovery and development: a pharmaceutical industry perspective', authors: 'Jones H.M. et al.', where: 'Clin. Pharmacol. Ther. 2015', doi: '10.1002/cpt.37', pmid: '25670209', url: 'https://doi.org/10.1002/cpt.37' },
      { id: 'ema-pbpk', kind: 'guideline', title: 'Guideline on the reporting of PBPK modelling and simulation', authors: 'European Medicines Agency', where: '2018', url: 'https://www.ema.europa.eu/en/documents/scientific-guideline/guideline-reporting-physiologically-based-pharmacokinetic-pbpk-modelling-and-simulation_en.pdf' },
      { id: 'fda-pbpk', kind: 'guideline', title: 'Physiologically Based Pharmacokinetic Analyses — Format and Content', authors: 'U.S. FDA', where: '2018', url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/physiologically-based-pharmacokinetic-analyses-format-and-content-guidance-industry' }
    ]
  },
  {
    id: 'onco',
    title: { fr: 'Oncologie', en: 'Oncology' },
    items: [
      { id: 'simeoni', kind: 'article', title: 'Predictive pharmacokinetic-pharmacodynamic modeling of tumor growth (modèle de Simeoni)', authors: 'Simeoni M. et al.', where: 'Cancer Res. 2004', doi: '10.1158/0008-5472.CAN-03-2524', pmid: '14871843', url: 'https://doi.org/10.1158/0008-5472.CAN-03-2524' },
      { id: 'claret-tgi-os', kind: 'article', title: 'Model-based prediction of survival from tumor size (TGI-OS, modèle de Claret)', authors: 'Claret L. et al.', where: 'J. Clin. Oncol. 2009', doi: '10.1200/JCO.2008.21.0807', pmid: '19636014', url: 'https://doi.org/10.1200/JCO.2008.21.0807' },
      { id: 'friberg', kind: 'article', title: 'Semi-mechanistic model of chemotherapy-induced myelosuppression (Friberg)', authors: 'Friberg L.E. et al.', where: 'J. Clin. Oncol. 2002', doi: '10.1200/JCO.2002.02.140', pmid: '12488418', url: 'https://doi.org/10.1200/JCO.2002.02.140' },
      { id: 'compo', kind: 'course', title: 'COMPO — Cancer, modélisation & pharmacologie (Marseille)', authors: 'Benzekry S., Ciccolini J. et al.', where: 'Inria / Inserm / AMU', url: 'https://team.inria.fr/compo/' }
    ]
  },
  {
    id: 'infectio',
    title: { fr: 'Infectiologie', en: 'Infectious diseases' },
    items: [
      { id: 'craig-pkpd', kind: 'article', title: 'Pharmacokinetic/pharmacodynamic parameters: the founding framework of PK/PD indices', authors: 'Craig W.A.', where: 'Clin. Infect. Dis. 1998', doi: '10.1086/516284', pmid: '9455502', url: 'https://doi.org/10.1086/516284' },
      { id: 'neumann-hcv', kind: 'article', title: 'Viral dynamics of hepatitis C under interferon therapy (biphasic decline)', authors: 'Neumann A.U. et al.', where: 'Science 1998', doi: '10.1126/science.282.5386.103', pmid: '9756471', url: 'https://doi.org/10.1126/science.282.5386.103' },
      { id: 'rybak-vanco', kind: 'guideline', title: 'Vancomycin therapeutic monitoring: AUC-guided consensus guideline', authors: 'Rybak M.J. et al.', where: 'Am. J. Health-Syst. Pharm. 2020', doi: '10.1093/ajhp/zxaa036', pmid: '32191793', url: 'https://doi.org/10.1093/ajhp/zxaa036' },
      { id: 'iame', kind: 'course', title: 'IAME — modélisation des maladies infectieuses (Bichat)', authors: 'Guedj J., Mentré F. et al.', where: 'Inserm / Université Paris Cité', url: 'https://www.iame-research.center/' }
    ]
  },
  {
    id: 'mab',
    title: { fr: 'Anticorps monoclonaux', en: 'Monoclonal antibodies' },
    items: [
      { id: 'ryman-meibohm', kind: 'article', title: 'Pharmacokinetics of monoclonal antibodies (revue)', authors: 'Ryman J.T. & Meibohm B.', where: 'CPT: PSP 2017', doi: '10.1002/psp4.12224', pmid: '28653357', url: 'https://doi.org/10.1002/psp4.12224' },
      { id: 'mager-jusko-tmdd', kind: 'article', title: 'General pharmacokinetic model for target-mediated drug disposition (TMDD)', authors: 'Mager D.E. & Jusko W.J.', where: 'J. Pharmacokinet. Pharmacodyn. 2001', doi: '10.1023/A:1014414520282', pmid: '11999290', url: 'https://doi.org/10.1023/A:1014414520282' }
    ]
  },
  {
    id: 'ai',
    title: { fr: 'IA & machine learning', en: 'AI & machine learning' },
    items: [
      { id: 'hastie-esl', kind: 'book', title: 'The Elements of Statistical Learning (arbres, SVM, clustering, sélection de variables)', authors: 'Hastie T., Tibshirani R. & Friedman J.', where: 'Springer — libre en ligne', url: 'https://hastie.su.domains/ElemStatLearn/' },
      { id: 'cortes-vapnik-svm', kind: 'article', title: 'Support-Vector Networks (naissance des SVM)', authors: 'Cortes C. & Vapnik V.', where: 'Machine Learning 1995', doi: '10.1007/BF00994018', url: 'https://doi.org/10.1007/BF00994018' },
      { id: 'guyon-featsel', kind: 'article', title: 'An Introduction to Variable and Feature Selection', authors: 'Guyon I. & Elisseeff A.', where: 'JMLR 2003', url: 'https://www.jmlr.org/papers/v3/guyon03a.html' },
      { id: 'genuer-vsurf', kind: 'article', title: 'Variable selection using random forests (VSURF)', authors: 'Genuer R., Poggi J.-M. & Tuleau-Malot C.', where: 'Pattern Recognition Letters 2010', doi: '10.1016/j.patrec.2010.03.014', url: 'https://doi.org/10.1016/j.patrec.2010.03.014' },
      { id: 'breiman-rf', kind: 'article', title: 'Random Forests', authors: 'Breiman L.', where: 'Machine Learning 2001', doi: '10.1023/A:1010933404324', url: 'https://doi.org/10.1023/A:1010933404324' },
      { id: 'chen-xgboost', kind: 'article', title: 'XGBoost: A Scalable Tree Boosting System', authors: 'Chen T. & Guestrin C.', where: 'KDD 2016', doi: '10.1145/2939672.2939785', url: 'https://doi.org/10.1145/2939672.2939785' },
      { id: 'vaswani-transformer', kind: 'article', title: 'Attention Is All You Need (Transformer)', authors: 'Vaswani A. et al.', where: 'NeurIPS 2017', doi: '10.48550/arXiv.1706.03762', url: 'https://doi.org/10.48550/arXiv.1706.03762' },
      { id: 'chen-neural-ode', kind: 'article', title: 'Neural Ordinary Differential Equations', authors: 'Chen R.T.Q., Rubanova Y., Bettencourt J. & Duvenaud D.', where: 'NeurIPS 2018', doi: '10.48550/arXiv.1806.07366', url: 'https://doi.org/10.48550/arXiv.1806.07366' },
      { id: 'woillard-ml-tacrolimus', kind: 'article', title: 'Machine learning to predict tacrolimus AUC for therapeutic monitoring', authors: 'Woillard J.-B. et al.', where: 'Clin. Pharmacol. Ther. 2021', doi: '10.1002/cpt.2123', pmid: '33253425', url: 'https://doi.org/10.1002/cpt.2123' },
      { id: 'vanderschaar', kind: 'course', title: 'van der Schaar Lab — machine learning pour la médecine (survie, AutoML)', authors: 'van der Schaar M. et al.', where: 'University of Cambridge', url: 'https://www.vanderschaar-lab.com' }
    ]
  },
  {
    id: 'trials',
    title: { fr: 'Design & essais cliniques', en: 'Design & clinical trials' },
    items: [
      { id: 'bretz-mcp-mod', kind: 'article', title: 'Combining multiple comparisons and modeling for dose finding (MCP-Mod)', authors: 'Bretz F., Pinheiro J. & Branson M.', where: 'Biometrics 2005', doi: '10.1111/j.1541-0420.2005.00344.x', pmid: '16135025', url: 'https://doi.org/10.1111/j.1541-0420.2005.00344.x' },
      { id: 'fda-starting-dose', kind: 'guideline', title: 'FDA Guidance: Estimating the Maximum Safe Starting Dose (NOAEL/HED)', authors: 'U.S. FDA', where: '2005', url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/estimating-maximum-safe-starting-dose-initial-clinical-trials-therapeutics-adult-healthy-volunteers' },
      { id: 'ema-fih', kind: 'guideline', title: 'EMA Guideline on strategies to identify and mitigate risks for first-in-human trials (MABEL)', authors: 'European Medicines Agency', where: 'révisé 2017', url: 'https://www.ema.europa.eu/en/documents/scientific-guideline/guideline-strategies-identify-and-mitigate-risks-first-human-and-early-clinical-trials-investigational-medicinal-products-revision-1_en.pdf' },
      { id: 'ich-e4', kind: 'guideline', title: 'ICH E4 — Dose-Response Information to Support Drug Registration', authors: 'ICH', where: '1994', url: 'https://database.ich.org/sites/default/files/E4_Guideline.pdf' }
    ]
  },
  {
    id: 'software',
    title: { fr: 'Logiciels & communautés', en: 'Software & communities' },
    items: [
      { id: 'nlmixr2', kind: 'tool', title: 'nlmixr2 — modélisation NLME open-source en R', url: 'https://nlmixr2.org' },
      { id: 'mrgsolve', kind: 'tool', title: 'mrgsolve — simulation d\'ODE/PK-PD en R', authors: 'Elmokadem A., Riggs M.M. & Baron K.T.', where: 'CPT: PSP 2019 (tutoriel)', url: 'https://mrgsolve.org' },
      { id: 'monolix', kind: 'tool', title: 'Monolix / MonolixSuite (SAEM)', where: 'Lixoft / Simulations Plus', url: 'https://lixoft.com' },
      { id: 'nonmem', kind: 'tool', title: 'NONMEM — le logiciel historique de la PK de population', authors: 'Beal S.L. & Sheiner L.B.', where: 'ICON plc', url: 'https://www.iconplc.com/solutions/technologies/nonmem' },
      { id: 'certara', kind: 'tool', title: 'Certara — Phoenix NLME & Simcyp (PBPK)', url: 'https://www.certara.com' },
      { id: 'isop', kind: 'course', title: 'ISoP — International Society of Pharmacometrics', url: 'https://www.go-isop.org' },
      { id: 'page', kind: 'course', title: 'PAGE — Population Approach Group in Europe', url: 'https://www.page-meeting.org' }
    ]
  }
];

/** Index plat : id → référence. */
export const refById = (() => {
  const idx = {};
  for (const g of referenceGroups) for (const it of g.items) idx[it.id] = it;
  return idx;
})();

/** Tous les identifiants valides (pool fermé). */
export const allRefIds = Object.keys(refById);

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
