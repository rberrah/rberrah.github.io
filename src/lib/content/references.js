// « Pour aller plus loin » — références curées (livres, articles fondateurs, logiciels,
// ressources). Les liens des articles pointent vers une recherche PubMed (toujours
// valide) ; les livres vers une recherche éditeur/Google Books ; les outils vers leur
// site officiel. kind: 'book' | 'article' | 'tool' | 'course'.

/** @typedef {{title:string, authors?:string, where?:string, url:string, kind:'book'|'article'|'tool'|'course'}} Reference */
/** @typedef {{id:string, title:{fr:string,en:string}, items:Reference[]}} ReferenceGroup */

const pubmed = (/** @type {string} */ q) => `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(q)}`;
const book = (/** @type {string} */ q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`;

/** @type {ReferenceGroup[]} */
export const referenceGroups = [
  {
    id: 'books',
    title: { fr: 'Livres de référence', en: 'Reference books' },
    items: [
      { kind: 'book', title: 'Pharmacokinetic and Pharmacodynamic Data Analysis: Concepts and Applications', authors: 'Gabrielsson J. & Weiner D.', where: '5e éd., Swedish Pharmaceutical Press', url: book('Gabrielsson Weiner Pharmacokinetic Pharmacodynamic Data Analysis') },
      { kind: 'book', title: 'Pharmacokinetic-Pharmacodynamic Modeling and Simulation', authors: 'Bonate P.L.', where: 'Springer', url: book('Bonate Pharmacokinetic Pharmacodynamic Modeling and Simulation Springer') },
      { kind: 'book', title: 'Pharmacometrics: The Science of Quantitative Pharmacology', authors: 'Ette E.I. & Williams P.J. (dir.)', where: 'Wiley', url: book('Ette Williams Pharmacometrics Science of Quantitative Pharmacology') },
      { kind: 'book', title: 'Introduction to Population Pharmacokinetic / Pharmacodynamic Analysis with Nonlinear Mixed Effects Models', authors: 'Owen J.S. & Fiedler-Kelly J.', where: 'Wiley', url: book('Owen Fiedler-Kelly Introduction Population Pharmacokinetic Pharmacodynamic NONMEM') },
      { kind: 'book', title: 'Clinical Pharmacokinetics and Pharmacodynamics: Concepts and Applications', authors: 'Rowland M. & Tozer T.N.', where: 'Wolters Kluwer', url: book('Rowland Tozer Clinical Pharmacokinetics and Pharmacodynamics') },
      { kind: 'book', title: 'Introduction à la pharmacocinétique et à la pharmacodynamie', authors: 'Simon N.', where: '(FR) Solal / Elsevier', url: book('Nicolas Simon Introduction à la pharmacocinétique pharmacodynamie') }
    ]
  },
  {
    id: 'tutorials',
    title: { fr: 'Tutoriels & mises au point', en: 'Tutorials & primers' },
    items: [
      { kind: 'article', title: 'Basic Concepts in Population Modeling, Simulation, and Model-Based Drug Development (Parties 1–3)', authors: 'Mould D.R. & Upton R.N.', where: 'CPT: Pharmacometrics Syst. Pharmacol. 2012–2013', url: pubmed('Mould Upton Basic concepts population modeling simulation model-based drug development') },
      { kind: 'article', title: 'Basic concepts in physiologically based pharmacokinetic (PBPK) modeling', authors: 'Jones H. & Rowland-Yeo K.', where: 'CPT: PSP 2013', url: pubmed('Jones Rowland-Yeo basic concepts PBPK modeling in drug discovery development') },
      { kind: 'course', title: 'MLU-Explain — explications visuelles du machine learning', authors: 'Amazon Machine Learning University', where: 'Random Forest, Decision Trees, Neural Networks…', url: 'https://mlu-explain.github.io' }
    ]
  },
  {
    id: 'pkpd',
    title: { fr: 'PK/PD & modèles pharmacodynamiques', en: 'PK/PD & pharmacodynamic models' },
    items: [
      { kind: 'article', title: 'Simultaneous modeling of pharmacokinetics and pharmacodynamics: the effect-compartment model', authors: 'Sheiner L.B. et al.', where: 'Clin. Pharmacol. Ther. 1979', url: pubmed('Sheiner 1979 effect compartment d-tubocurarine pharmacodynamics') },
      { kind: 'article', title: 'Comparison of four basic models of indirect pharmacodynamic responses', authors: 'Dayneka N.L., Garg V. & Jusko W.J.', where: 'J. Pharmacokinet. Biopharm. 1993', url: pubmed('Dayneka Garg Jusko four basic models indirect pharmacodynamic responses') },
      { kind: 'article', title: 'General pharmacokinetic model for indirect responses', authors: 'Jusko W.J. & Ko H.C.', where: 'Clin. Pharmacol. Ther. 1994', url: pubmed('Jusko Ko physiologic indirect response pharmacodynamic model') }
    ]
  },
  {
    id: 'estimation',
    title: { fr: 'Estimation, validation & design', en: 'Estimation, validation & design' },
    items: [
      { kind: 'article', title: 'Prediction-corrected visual predictive checks (pcVPC)', authors: 'Bergstrand M. et al.', where: 'AAPS J. 2011', url: pubmed('Bergstrand prediction-corrected visual predictive checks diagnosing') },
      { kind: 'article', title: 'Are your model predictions accurate? Shrinkage in empirical Bayes estimates', authors: 'Savic R.M. & Karlsson M.O.', where: 'AAPS J. 2009', url: pubmed('Savic Karlsson importance shrinkage empirical Bayes estimates diagnostics') },
      { kind: 'article', title: 'Metrics for external model evaluation with an application to NPDE', authors: 'Brendel K. et al.', where: 'Pharm. Res. 2006', url: pubmed('Brendel metrics external model evaluation normalized prediction distribution errors') },
      { kind: 'article', title: 'Conditional weighted residuals (CWRES): a diagnostic for population models', authors: 'Hooker A.C. et al.', where: 'Pharm. Res. 2007', url: pubmed('Hooker conditional weighted residuals CWRES model misspecification') },
      { kind: 'article', title: 'The importance of modeling interoccasion variability in population analyses', authors: 'Karlsson M.O. & Sheiner L.B.', where: 'J. Pharmacokinet. Biopharm. 1993', url: pubmed('Karlsson Sheiner interoccasion variability population pharmacokinetic') },
      { kind: 'tool', title: 'PFIM — design optimal en modèles non linéaires à effets mixtes (équipe IAME)', authors: 'Mentré F. et al.', where: 'Université Paris Cité / Inserm', url: pubmed('Mentre PFIM optimal design nonlinear mixed effects Fisher information') }
    ]
  },
  {
    id: 'onco',
    title: { fr: 'Oncologie', en: 'Oncology' },
    items: [
      { kind: 'article', title: 'Predictive pharmacokinetic-pharmacodynamic modeling of tumor growth (modèle de Simeoni)', authors: 'Simeoni M. et al.', where: 'Cancer Res. 2004', url: pubmed('Simeoni predictive pharmacokinetic pharmacodynamic tumor growth kinetics anticancer') },
      { kind: 'article', title: 'Model-based prediction of survival from tumor size (TGI-OS, modèle de Claret)', authors: 'Claret L. et al.', where: 'J. Clin. Oncol. 2009', url: pubmed('Claret model-based prediction of phase III overall survival tumor size') },
      { kind: 'article', title: 'Semi-mechanistic model of chemotherapy-induced myelosuppression (Friberg)', authors: 'Friberg L.E. et al.', where: 'J. Clin. Oncol. 2002', url: pubmed('Friberg model chemotherapy-induced myelosuppression neutropenia semi-mechanistic') },
      { kind: 'course', title: 'COMPO — Cancer, modélisation & pharmacologie (Marseille)', authors: 'Benzekry S., Ciccolini J. et al.', where: 'Inria / Inserm / AMU', url: book('COMPO Inria Marseille Benzekry Ciccolini mathematical oncology') }
    ]
  },
  {
    id: 'infectio',
    title: { fr: 'Infectiologie', en: 'Infectious diseases' },
    items: [
      { kind: 'article', title: 'Pharmacokinetic/pharmacodynamic parameters: the founding framework of PK/PD indices', authors: 'Craig W.A.', where: 'Clin. Infect. Dis. 1998', url: pubmed('Craig 1998 pharmacokinetic pharmacodynamic parameters antibacterial dosing') },
      { kind: 'article', title: 'Viral dynamics of hepatitis C under interferon therapy (biphasic decline)', authors: 'Neumann A.U. et al.', where: 'Science 1998', url: pubmed('Neumann hepatitis C viral dynamics interferon efficacy biphasic') },
      { kind: 'article', title: 'Vancomycin therapeutic monitoring: AUC-guided consensus guideline', authors: 'Rybak M.J. et al.', where: 'Am. J. Health-Syst. Pharm. 2020', url: pubmed('Rybak vancomycin therapeutic monitoring consensus guideline AUC 2020') },
      { kind: 'course', title: 'IAME — modélisation des maladies infectieuses (Bichat)', authors: 'Guedj J., Mentré F. et al.', where: 'Inserm / Université Paris Cité', url: book('IAME Inserm Bichat Guedj viral dynamics modeling') }
    ]
  },
  {
    id: 'mab',
    title: { fr: 'Anticorps monoclonaux', en: 'Monoclonal antibodies' },
    items: [
      { kind: 'article', title: 'Pharmacokinetics of monoclonal antibodies (revue)', authors: 'Ryman J.T. & Meibohm B.', where: 'CPT: PSP 2017', url: pubmed('Ryman Meibohm pharmacokinetics of monoclonal antibodies') },
      { kind: 'article', title: 'General pharmacokinetic model for target-mediated drug disposition (TMDD)', authors: 'Mager D.E. & Jusko W.J.', where: 'J. Pharmacokinet. Pharmacodyn. 2001', url: pubmed('Mager Jusko general pharmacokinetic model target-mediated drug disposition') }
    ]
  },
  {
    id: 'ai',
    title: { fr: 'IA & machine learning', en: 'AI & machine learning' },
    items: [
      { kind: 'article', title: 'Random Forests', authors: 'Breiman L.', where: 'Machine Learning 2001', url: book('Breiman 2001 Random Forests Machine Learning') },
      { kind: 'article', title: 'XGBoost: A Scalable Tree Boosting System', authors: 'Chen T. & Guestrin C.', where: 'KDD 2016', url: book('Chen Guestrin XGBoost scalable tree boosting system') },
      { kind: 'article', title: 'Attention Is All You Need (Transformer)', authors: 'Vaswani A. et al.', where: 'NeurIPS 2017', url: book('Vaswani Attention Is All You Need transformer') },
      { kind: 'article', title: 'Machine learning to predict tacrolimus AUC for therapeutic monitoring', authors: 'Woillard J.-B. et al.', where: 'Clin. Pharmacol. Ther. 2021', url: pubmed('Woillard machine learning tacrolimus area under the curve estimation') },
      { kind: 'course', title: 'van der Schaar Lab — machine learning pour la médecine (survie, AutoML)', authors: 'van der Schaar M. et al.', where: 'University of Cambridge', url: 'https://www.vanderschaar-lab.com' }
    ]
  },
  {
    id: 'trials',
    title: { fr: 'Design & essais cliniques', en: 'Design & clinical trials' },
    items: [
      { kind: 'article', title: 'Combining multiple comparisons and modeling for dose finding (MCP-Mod)', authors: 'Bretz F., Pinheiro J. & Branson M.', where: 'Biometrics 2005', url: pubmed('Bretz Pinheiro Branson combining multiple comparisons modeling dose-response') },
      { kind: 'article', title: 'FDA Guidance: Estimating the Maximum Safe Starting Dose (NOAEL/HED)', authors: 'U.S. FDA', where: '2005', url: book('FDA guidance estimating maximum safe starting dose initial clinical trials NOAEL') },
      { kind: 'article', title: 'EMA Guideline on strategies to identify and mitigate risks for first-in-human trials (MABEL)', authors: 'European Medicines Agency', where: 'révisé 2017', url: book('EMA guideline first-in-human clinical trials MABEL 2017') }
    ]
  },
  {
    id: 'software',
    title: { fr: 'Logiciels & communautés', en: 'Software & communities' },
    items: [
      { kind: 'tool', title: 'nlmixr2 — modélisation NLME open-source en R', url: 'https://nlmixr2.org' },
      { kind: 'tool', title: 'mrgsolve — simulation d\'ODE/PK-PD en R', url: 'https://mrgsolve.org' },
      { kind: 'tool', title: 'Monolix / MonolixSuite (SAEM)', where: 'Lixoft / Simulations Plus', url: 'https://lixoft.com' },
      { kind: 'tool', title: 'Certara — Phoenix NLME & Simcyp (PBPK)', url: 'https://www.certara.com' },
      { kind: 'course', title: 'ISoP — International Society of Pharmacometrics', url: 'https://www.go-isop.org' },
      { kind: 'course', title: 'PAGE — Population Approach Group in Europe', url: 'https://www.page-meeting.org' }
    ]
  }
];
