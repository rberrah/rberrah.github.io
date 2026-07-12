// « Pour aller plus loin » — références curées (livres, articles fondateurs, logiciels,
// ressources). Les liens des articles pointent vers une recherche PubMed (toujours
// valide) ; les livres vers une recherche éditeur/Google Books ; les outils vers leur
// site officiel. kind: 'book' | 'article' | 'tool' | 'course' | 'guideline'.
//
// IMPORTANT — POOL FERMÉ. Chaque entrée porte un `id` stable. Les chapitres se
// rattachent à ces références via `sources: [<id>, ...]` dans leur frontmatter.
// Un id inconnu fait ÉCHOUER le smoke test : impossible d'inventer une source.

/** @typedef {{id:string, title:string, authors?:string, where?:string, url:string, kind:'book'|'article'|'tool'|'course'|'guideline'}} Reference */
/** @typedef {{id:string, title:{fr:string,en:string}, items:Reference[]}} ReferenceGroup */

const pubmed = (/** @type {string} */ q) => `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(q)}`;
const book = (/** @type {string} */ q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`;

/** @type {ReferenceGroup[]} */
export const referenceGroups = [
  {
    id: 'books',
    title: { fr: 'Livres de référence', en: 'Reference books' },
    items: [
      { id: 'gabrielsson-weiner', kind: 'book', title: 'Pharmacokinetic and Pharmacodynamic Data Analysis: Concepts and Applications', authors: 'Gabrielsson J. & Weiner D.', where: '5e éd., Swedish Pharmaceutical Press', url: book('Gabrielsson Weiner Pharmacokinetic Pharmacodynamic Data Analysis') },
      { id: 'bonate', kind: 'book', title: 'Pharmacokinetic-Pharmacodynamic Modeling and Simulation', authors: 'Bonate P.L.', where: 'Springer', url: book('Bonate Pharmacokinetic Pharmacodynamic Modeling and Simulation Springer') },
      { id: 'ette-williams', kind: 'book', title: 'Pharmacometrics: The Science of Quantitative Pharmacology', authors: 'Ette E.I. & Williams P.J. (dir.)', where: 'Wiley', url: book('Ette Williams Pharmacometrics Science of Quantitative Pharmacology') },
      { id: 'owen-fiedler-kelly', kind: 'book', title: 'Introduction to Population Pharmacokinetic / Pharmacodynamic Analysis with Nonlinear Mixed Effects Models', authors: 'Owen J.S. & Fiedler-Kelly J.', where: 'Wiley', url: book('Owen Fiedler-Kelly Introduction Population Pharmacokinetic Pharmacodynamic NONMEM') },
      { id: 'rowland-tozer', kind: 'book', title: 'Clinical Pharmacokinetics and Pharmacodynamics: Concepts and Applications', authors: 'Rowland M. & Tozer T.N.', where: 'Wolters Kluwer', url: book('Rowland Tozer Clinical Pharmacokinetics and Pharmacodynamics') },
      { id: 'gibaldi-perrier', kind: 'book', title: 'Pharmacokinetics', authors: 'Gibaldi M. & Perrier D.', where: '2e éd., Marcel Dekker — le classique de la PK compartimentale', url: book('Gibaldi Perrier Pharmacokinetics Marcel Dekker') },
      { id: 'davidian-giltinan', kind: 'book', title: 'Nonlinear Models for Repeated Measurement Data', authors: 'Davidian M. & Giltinan D.M.', where: 'Chapman & Hall — fondement statistique des modèles à effets mixtes', url: book('Davidian Giltinan Nonlinear Models for Repeated Measurement Data') },
      { id: 'lavielle', kind: 'book', title: 'Mixed Effects Models for the Population Approach', authors: 'Lavielle M.', where: 'Chapman & Hall/CRC (SAEM)', url: book('Lavielle Mixed Effects Models for the Population Approach') },
      { id: 'simon-pkpd', kind: 'book', title: 'Introduction à la pharmacocinétique et à la pharmacodynamie', authors: 'Simon N.', where: '(FR) Solal / Elsevier', url: book('Nicolas Simon Introduction à la pharmacocinétique pharmacodynamie') }
    ]
  },
  {
    id: 'tutorials',
    title: { fr: 'Tutoriels & mises au point', en: 'Tutorials & primers' },
    items: [
      { id: 'mould-upton', kind: 'article', title: 'Basic Concepts in Population Modeling, Simulation, and Model-Based Drug Development (Parties 1–3)', authors: 'Mould D.R. & Upton R.N.', where: 'CPT: Pharmacometrics Syst. Pharmacol. 2012–2013', url: pubmed('Mould Upton Basic concepts population modeling simulation model-based drug development') },
      { id: 'jones-rowland-yeo', kind: 'article', title: 'Basic concepts in physiologically based pharmacokinetic (PBPK) modeling', authors: 'Jones H. & Rowland-Yeo K.', where: 'CPT: PSP 2013', url: pubmed('Jones Rowland-Yeo basic concepts PBPK modeling in drug discovery development') },
      { id: 'keizer-psn-xpose', kind: 'article', title: 'Modeling and simulation workbench for NONMEM: PsN, Xpose, Pirana', authors: 'Keizer R.J., Karlsson M.O. & Hooker A.', where: 'CPT: PSP 2013', url: pubmed('Keizer Karlsson Hooker modeling simulation workbench NONMEM PsN Xpose Pirana') },
      { id: 'mlu-explain', kind: 'course', title: 'MLU-Explain — explications visuelles du machine learning', authors: 'Amazon Machine Learning University', where: 'Random Forest, Decision Trees, Neural Networks…', url: 'https://mlu-explain.github.io' }
    ]
  },
  {
    id: 'fondamentaux',
    title: { fr: 'Fondamentaux PK (articles)', en: 'PK fundamentals (papers)' },
    items: [
      { id: 'sheiner-beal-estimation', kind: 'article', title: 'Evaluation of methods for estimating population pharmacokinetic parameters (série I–III)', authors: 'Sheiner L.B. & Beal S.L.', where: 'J. Pharmacokinet. Biopharm. 1980–1983 — acte de naissance de la PK de population', url: pubmed('Sheiner Beal evaluation of methods for estimating population pharmacokinetic parameters') },
      { id: 'anderson-holford-allometry', kind: 'article', title: 'Mechanism-based concepts of size and maturity in pharmacokinetics (allométrie & maturation)', authors: 'Anderson B.J. & Holford N.H.G.', where: 'Annu. Rev. Pharmacol. Toxicol. 2008', url: pubmed('Anderson Holford mechanism-based concepts of size and maturity in pharmacokinetics') },
      { id: 'beal-bql', kind: 'article', title: 'Ways to fit a PK model with some data below the quantification limit (méthodes M1–M7)', authors: 'Beal S.L.', where: 'J. Pharmacokinet. Pharmacodyn. 2001', url: pubmed('Beal ways to fit a pharmacokinetic model with some data below the quantification limit') },
      { id: 'holford-clearance', kind: 'article', title: 'Clearance: the concept and its use (mise au point)', authors: 'Holford N.H.G.', where: 'Clin. Pharmacokinet. / Br. J. Clin. Pharmacol.', url: pubmed('Holford clearance concept pharmacokinetics') }
    ]
  },
  {
    id: 'pkpd',
    title: { fr: 'PK/PD & modèles pharmacodynamiques', en: 'PK/PD & pharmacodynamic models' },
    items: [
      { id: 'sheiner-effect-compartment', kind: 'article', title: 'Simultaneous modeling of pharmacokinetics and pharmacodynamics: the effect-compartment model', authors: 'Sheiner L.B. et al.', where: 'Clin. Pharmacol. Ther. 1979', url: pubmed('Sheiner 1979 effect compartment d-tubocurarine pharmacodynamics') },
      { id: 'dayneka-jusko-indirect', kind: 'article', title: 'Comparison of four basic models of indirect pharmacodynamic responses', authors: 'Dayneka N.L., Garg V. & Jusko W.J.', where: 'J. Pharmacokinet. Biopharm. 1993', url: pubmed('Dayneka Garg Jusko four basic models indirect pharmacodynamic responses') },
      { id: 'jusko-ko-indirect', kind: 'article', title: 'General pharmacokinetic model for indirect responses', authors: 'Jusko W.J. & Ko H.C.', where: 'Clin. Pharmacol. Ther. 1994', url: pubmed('Jusko Ko physiologic indirect response pharmacodynamic model') }
    ]
  },
  {
    id: 'estimation',
    title: { fr: 'Estimation, validation & design', en: 'Estimation, validation & design' },
    items: [
      { id: 'bergstrand-pcvpc', kind: 'article', title: 'Prediction-corrected visual predictive checks (pcVPC)', authors: 'Bergstrand M. et al.', where: 'AAPS J. 2011', url: pubmed('Bergstrand prediction-corrected visual predictive checks diagnosing') },
      { id: 'karlsson-holford-vpc', kind: 'article', title: 'A tutorial on visual predictive checks', authors: 'Karlsson M.O. & Holford N.H.G.', where: 'PAGE 2008 (abstr. 1434)', url: book('Karlsson Holford tutorial on visual predictive checks PAGE 2008') },
      { id: 'savic-karlsson-shrinkage', kind: 'article', title: 'Importance of shrinkage in empirical Bayes estimates for diagnostics', authors: 'Savic R.M. & Karlsson M.O.', where: 'AAPS J. 2009', url: pubmed('Savic Karlsson importance shrinkage empirical Bayes estimates diagnostics') },
      { id: 'brendel-npde', kind: 'article', title: 'Metrics for external model evaluation with an application to NPDE', authors: 'Brendel K. et al.', where: 'Pharm. Res. 2006', url: pubmed('Brendel metrics external model evaluation normalized prediction distribution errors') },
      { id: 'hooker-cwres', kind: 'article', title: 'Conditional weighted residuals (CWRES): a diagnostic for population models', authors: 'Hooker A.C. et al.', where: 'Pharm. Res. 2007', url: pubmed('Hooker conditional weighted residuals CWRES model misspecification') },
      { id: 'karlsson-sheiner-iov', kind: 'article', title: 'The importance of modeling interoccasion variability in population analyses', authors: 'Karlsson M.O. & Sheiner L.B.', where: 'J. Pharmacokinet. Biopharm. 1993', url: pubmed('Karlsson Sheiner interoccasion variability population pharmacokinetic') },
      { id: 'pfim', kind: 'tool', title: 'PFIM — design optimal en modèles non linéaires à effets mixtes (équipe IAME)', authors: 'Mentré F. et al.', where: 'Université Paris Cité / Inserm', url: pubmed('Mentre PFIM optimal design nonlinear mixed effects Fisher information') },
      { id: 'fda-poppk', kind: 'guideline', title: 'Guidance for Industry: Population Pharmacokinetics', authors: 'U.S. FDA', where: '2022 (révision)', url: book('FDA guidance for industry population pharmacokinetics 2022') },
      { id: 'ema-poppk', kind: 'guideline', title: 'Guideline on reporting the results of population pharmacokinetic analyses', authors: 'European Medicines Agency (CHMP)', where: '2007', url: book('EMA guideline reporting results population pharmacokinetic analyses CHMP') }
    ]
  },
  {
    id: 'tdm',
    title: { fr: 'TDM & dosage de précision (MIPD)', en: 'TDM & precision dosing (MIPD)' },
    items: [
      { id: 'minichmayr-mipd', kind: 'article', title: 'Model-informed precision dosing: state of the art and future perspectives', authors: 'Minichmayr I.K., Dreesen E., Centanni M. et al.', where: 'Adv. Drug Deliv. Rev. 2024', url: pubmed('Minichmayr model-informed precision dosing state of the art future perspectives') },
      { id: 'berrah-residual', kind: 'article', title: 'Better Dosing Through Better Error: Residual Error as a Hidden Lever in Model-Informed Precision Dosing', authors: 'Berrah R., Minichmayr I.K. & Woillard J.-B. (IATDMCT Pharmacometrics Group)', where: 'Ther. Drug Monit. 2025', url: pubmed('Berrah Woillard better dosing through better error residual error model-informed precision dosing') },
      { id: 'hughes-keizer', kind: 'article', title: 'A hybrid machine learning/pharmacokinetic approach outperforms MAP Bayesian estimation by selectively flattening model priors', authors: 'Hughes J.H. & Keizer R.J.', where: 'CPT: PSP 2021', url: pubmed('Hughes Keizer hybrid machine learning pharmacokinetic flattening model priors') },
      { id: 'mapbayr', kind: 'tool', title: 'mapbayr — estimation bayésienne MAP en R', authors: 'Le Louedec F. et al.', where: 'CPT: PSP 2021', url: pubmed('Le Louedec mapbayr maximum a posteriori Bayesian estimation R package') },
      { id: 'woillard-tacrolimus', kind: 'article', title: 'Population pharmacokinetic model and Bayesian estimator for two tacrolimus formulations', authors: 'Woillard J.-B. et al.', where: 'Br. J. Clin. Pharmacol. 2011', url: pubmed('Woillard population pharmacokinetic model Bayesian estimator tacrolimus Prograf Advagraf') },
      { id: 'iatdmct', kind: 'course', title: 'IATDMCT — International Association of Therapeutic Drug Monitoring and Clinical Toxicology', url: 'https://www.iatdmct.org' }
    ]
  },
  {
    id: 'pbpk',
    title: { fr: 'PBPK', en: 'PBPK' },
    items: [
      { id: 'kuepfer-pbpk', kind: 'article', title: 'Applied Concepts in PBPK Modeling: How to Build a PBPK/PD Model (tutoriel)', authors: 'Kuepfer L. et al.', where: 'CPT: PSP 2016', url: pubmed('Kuepfer applied concepts in PBPK modeling how to build a PBPK PD model') },
      { id: 'rowland-peck-tucker', kind: 'article', title: 'Physiologically-based pharmacokinetics in drug development and regulatory science', authors: 'Rowland M., Peck C. & Tucker G.', where: 'Annu. Rev. Pharmacol. Toxicol. 2011', url: pubmed('Rowland Peck Tucker physiologically-based pharmacokinetics in drug development and regulatory science') },
      { id: 'jones-pbpk-industry', kind: 'article', title: 'PBPK modeling in drug discovery and development: a pharmaceutical industry perspective', authors: 'Jones H.M. et al.', where: 'Clin. Pharmacol. Ther. 2015', url: pubmed('Jones physiologically based pharmacokinetic modeling in drug discovery and development pharmaceutical industry perspective') },
      { id: 'ema-pbpk', kind: 'guideline', title: 'Guideline on the reporting of PBPK modelling and simulation', authors: 'European Medicines Agency', where: '2018', url: book('EMA guideline on the reporting of physiologically based pharmacokinetic PBPK modelling and simulation 2018') },
      { id: 'fda-pbpk', kind: 'guideline', title: 'Physiologically Based Pharmacokinetic Analyses — Format and Content', authors: 'U.S. FDA', where: '2018', url: book('FDA guidance physiologically based pharmacokinetic analyses format and content 2018') }
    ]
  },
  {
    id: 'onco',
    title: { fr: 'Oncologie', en: 'Oncology' },
    items: [
      { id: 'simeoni', kind: 'article', title: 'Predictive pharmacokinetic-pharmacodynamic modeling of tumor growth (modèle de Simeoni)', authors: 'Simeoni M. et al.', where: 'Cancer Res. 2004', url: pubmed('Simeoni predictive pharmacokinetic pharmacodynamic tumor growth kinetics anticancer') },
      { id: 'claret-tgi-os', kind: 'article', title: 'Model-based prediction of survival from tumor size (TGI-OS, modèle de Claret)', authors: 'Claret L. et al.', where: 'J. Clin. Oncol. 2009', url: pubmed('Claret model-based prediction of phase III overall survival tumor size') },
      { id: 'friberg', kind: 'article', title: 'Semi-mechanistic model of chemotherapy-induced myelosuppression (Friberg)', authors: 'Friberg L.E. et al.', where: 'J. Clin. Oncol. 2002', url: pubmed('Friberg model chemotherapy-induced myelosuppression neutropenia semi-mechanistic') },
      { id: 'compo', kind: 'course', title: 'COMPO — Cancer, modélisation & pharmacologie (Marseille)', authors: 'Benzekry S., Ciccolini J. et al.', where: 'Inria / Inserm / AMU', url: book('COMPO Inria Marseille Benzekry Ciccolini mathematical oncology') }
    ]
  },
  {
    id: 'infectio',
    title: { fr: 'Infectiologie', en: 'Infectious diseases' },
    items: [
      { id: 'craig-pkpd', kind: 'article', title: 'Pharmacokinetic/pharmacodynamic parameters: the founding framework of PK/PD indices', authors: 'Craig W.A.', where: 'Clin. Infect. Dis. 1998', url: pubmed('Craig 1998 pharmacokinetic pharmacodynamic parameters antibacterial dosing') },
      { id: 'neumann-hcv', kind: 'article', title: 'Viral dynamics of hepatitis C under interferon therapy (biphasic decline)', authors: 'Neumann A.U. et al.', where: 'Science 1998', url: pubmed('Neumann hepatitis C viral dynamics interferon efficacy biphasic') },
      { id: 'rybak-vanco', kind: 'guideline', title: 'Vancomycin therapeutic monitoring: AUC-guided consensus guideline', authors: 'Rybak M.J. et al.', where: 'Am. J. Health-Syst. Pharm. 2020', url: pubmed('Rybak vancomycin therapeutic monitoring consensus guideline AUC 2020') },
      { id: 'iame', kind: 'course', title: 'IAME — modélisation des maladies infectieuses (Bichat)', authors: 'Guedj J., Mentré F. et al.', where: 'Inserm / Université Paris Cité', url: book('IAME Inserm Bichat Guedj viral dynamics modeling') }
    ]
  },
  {
    id: 'mab',
    title: { fr: 'Anticorps monoclonaux', en: 'Monoclonal antibodies' },
    items: [
      { id: 'ryman-meibohm', kind: 'article', title: 'Pharmacokinetics of monoclonal antibodies (revue)', authors: 'Ryman J.T. & Meibohm B.', where: 'CPT: PSP 2017', url: pubmed('Ryman Meibohm pharmacokinetics of monoclonal antibodies') },
      { id: 'mager-jusko-tmdd', kind: 'article', title: 'General pharmacokinetic model for target-mediated drug disposition (TMDD)', authors: 'Mager D.E. & Jusko W.J.', where: 'J. Pharmacokinet. Pharmacodyn. 2001', url: pubmed('Mager Jusko general pharmacokinetic model target-mediated drug disposition') }
    ]
  },
  {
    id: 'ai',
    title: { fr: 'IA & machine learning', en: 'AI & machine learning' },
    items: [
      { id: 'hastie-esl', kind: 'book', title: 'The Elements of Statistical Learning (arbres, SVM, clustering, sélection de variables)', authors: 'Hastie T., Tibshirani R. & Friedman J.', where: 'Springer — libre en ligne', url: 'https://hastie.su.domains/ElemStatLearn/' },
      { id: 'cortes-vapnik-svm', kind: 'article', title: 'Support-Vector Networks (naissance des SVM)', authors: 'Cortes C. & Vapnik V.', where: 'Machine Learning 1995', url: book('Cortes Vapnik Support-Vector Networks Machine Learning 1995') },
      { id: 'guyon-featsel', kind: 'article', title: 'An Introduction to Variable and Feature Selection', authors: 'Guyon I. & Elisseeff A.', where: 'JMLR 2003', url: book('Guyon Elisseeff An Introduction to Variable and Feature Selection JMLR 2003') },
      { id: 'genuer-vsurf', kind: 'article', title: 'Variable selection using random forests (VSURF)', authors: 'Genuer R., Poggi J.-M. & Tuleau-Malot C.', where: 'Pattern Recognition Letters 2010', url: book('Genuer Poggi Tuleau-Malot variable selection using random forests VSURF') },
      { id: 'breiman-rf', kind: 'article', title: 'Random Forests', authors: 'Breiman L.', where: 'Machine Learning 2001', url: book('Breiman 2001 Random Forests Machine Learning') },
      { id: 'chen-xgboost', kind: 'article', title: 'XGBoost: A Scalable Tree Boosting System', authors: 'Chen T. & Guestrin C.', where: 'KDD 2016', url: book('Chen Guestrin XGBoost scalable tree boosting system') },
      { id: 'vaswani-transformer', kind: 'article', title: 'Attention Is All You Need (Transformer)', authors: 'Vaswani A. et al.', where: 'NeurIPS 2017', url: book('Vaswani Attention Is All You Need transformer') },
      { id: 'chen-neural-ode', kind: 'article', title: 'Neural Ordinary Differential Equations', authors: 'Chen R.T.Q., Rubanova Y., Bettencourt J. & Duvenaud D.', where: 'NeurIPS 2018', url: book('Chen Rubanova Bettencourt Duvenaud Neural Ordinary Differential Equations NeurIPS 2018') },
      { id: 'woillard-ml-tacrolimus', kind: 'article', title: 'Machine learning to predict tacrolimus AUC for therapeutic monitoring', authors: 'Woillard J.-B. et al.', where: 'Clin. Pharmacol. Ther. 2021', url: pubmed('Woillard machine learning tacrolimus area under the curve estimation') },
      { id: 'vanderschaar', kind: 'course', title: 'van der Schaar Lab — machine learning pour la médecine (survie, AutoML)', authors: 'van der Schaar M. et al.', where: 'University of Cambridge', url: 'https://www.vanderschaar-lab.com' }
    ]
  },
  {
    id: 'trials',
    title: { fr: 'Design & essais cliniques', en: 'Design & clinical trials' },
    items: [
      { id: 'bretz-mcp-mod', kind: 'article', title: 'Combining multiple comparisons and modeling for dose finding (MCP-Mod)', authors: 'Bretz F., Pinheiro J. & Branson M.', where: 'Biometrics 2005', url: pubmed('Bretz Pinheiro Branson combining multiple comparisons modeling dose-response') },
      { id: 'fda-starting-dose', kind: 'guideline', title: 'FDA Guidance: Estimating the Maximum Safe Starting Dose (NOAEL/HED)', authors: 'U.S. FDA', where: '2005', url: book('FDA guidance estimating maximum safe starting dose initial clinical trials NOAEL') },
      { id: 'ema-fih', kind: 'guideline', title: 'EMA Guideline on strategies to identify and mitigate risks for first-in-human trials (MABEL)', authors: 'European Medicines Agency', where: 'révisé 2017', url: book('EMA guideline first-in-human clinical trials MABEL 2017') },
      { id: 'ich-e4', kind: 'guideline', title: 'ICH E4 — Dose-Response Information to Support Drug Registration', authors: 'ICH', where: '1994', url: book('ICH E4 dose-response information to support drug registration guideline') }
    ]
  },
  {
    id: 'software',
    title: { fr: 'Logiciels & communautés', en: 'Software & communities' },
    items: [
      { id: 'nlmixr2', kind: 'tool', title: 'nlmixr2 — modélisation NLME open-source en R', url: 'https://nlmixr2.org' },
      { id: 'mrgsolve', kind: 'tool', title: 'mrgsolve — simulation d\'ODE/PK-PD en R', authors: 'Elmokadem A., Riggs M.M. & Baron K.T.', where: 'CPT: PSP 2019 (tutoriel)', url: 'https://mrgsolve.org' },
      { id: 'monolix', kind: 'tool', title: 'Monolix / MonolixSuite (SAEM)', where: 'Lixoft / Simulations Plus', url: 'https://lixoft.com' },
      { id: 'nonmem', kind: 'tool', title: 'NONMEM — le logiciel historique de la PK de population', authors: 'Beal S.L. & Sheiner L.B.', where: 'ICON plc', url: book('NONMEM ICON nonlinear mixed effects modeling software') },
      { id: 'certara', kind: 'tool', title: 'Certara — Phoenix NLME & Simcyp (PBPK)', url: 'https://www.certara.com' },
      { id: 'isop', kind: 'course', title: 'ISoP — International Society of Pharmacometrics', url: 'https://www.go-isop.org' },
      { id: 'page', kind: 'course', title: 'PAGE — Population Approach Group in Europe', url: 'https://www.page-meeting.org' }
    ]
  }
];

/** Index plat : id → référence. */
export const refById = (() => {
  /** @type {Record<string, Reference>} */
  const idx = {};
  for (const g of referenceGroups) for (const it of g.items) idx[it.id] = it;
  return idx;
})();

/** Tous les identifiants valides (pool fermé). */
export const allRefIds = Object.keys(refById);

/**
 * Résout la liste `sources` d'un chapitre en références complètes.
 * Les identifiants inconnus sont ignorés ici (et rejetés par le smoke test).
 * @param {string[] | undefined} ids
 * @returns {Reference[]}
 */
export function resolveSources(ids) {
  if (!Array.isArray(ids)) return [];
  return ids.map((id) => refById[id]).filter(Boolean);
}
