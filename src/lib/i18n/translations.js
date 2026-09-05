// @ts-nocheck
export const languages = ['en', 'fr'];

export const dictionary = {
  en: {
    meta: {
      description:
        'Pharmacométrie Explain — an interactive visual course on pharmacometrics: PK/PD, clearance, variability, TDM and applied AI. Educational content only.'
    },
    nav: {
      home: 'Home',
      course: 'Course',
      example: 'Case study',
      exercises: 'Exercises',
      tdm: 'TDM',
      lego: 'Lego lab',
      playground: 'Playground',
      glossary: 'Glossary',
      references: 'Further reading',
      about: 'About',
      primary: 'Primary'
    },
    footer: {
      // Licence du TEXTE (le code reste MIT) : intitulé et URL viennent de $lib/site.
      licenseIntro: 'Pharmacométrie Pratique · Text',
      licenseOutro: '· Code MIT · 2026',
      author: 'Written and maintained by Racym Berrah, PharmD, PhD student in pharmacometrics',
      report: 'Spotted an error? Report it',
      reportUrl: 'https://github.com/rberrah/rberrah.github.io/issues/new',
      built: 'Built with SvelteKit · static, no tracking',
      disclaimer: 'Educational content only. Not medical advice. No patient-specific dosing.'
    },
    home: {
      eyebrow: 'A visual course in pharmacometrics',
      titlePrefix: 'Reading the',
      titleHighlight: 'concentration-time',
      titleSuffix: 'curve, one idea at a time.',
      lede:
        'Scroll-driven essays that turn PK/PD theory into something you can see: clearance and volume, variability between and within patients, TDM, and where modern AI fits, always with units and uncertainty in view.',
      start: 'Start the course',
      browse: 'Browse chapters',
      disclaimer: 'Educational content only · not medical advice.',
      tracksTitle: 'The course, in four layers',
      layers: {
        tronc: { title: 'Core track — start here', desc: 'The trunk: what every pharmacometrician must know, read in order.' },
        approfondissement: { title: 'Deep dives', desc: 'Cross-cutting methods and concepts that go all the way — non-compartmental analysis, PBPK, pharmacodynamics, AI, model validation. They apply across every domain.' },
        domaine: { title: 'Application domains', desc: 'Zooms on a specific research area, each assuming the core track: oncology, infectious diseases, monoclonal antibodies, clinical trials.' },
        reference: { title: 'Reference', desc: 'You consult these when you need them — nobody reads them end to end.' }
      },
      featuredTitle: 'Core pharmacometrics',
      resourcesTitle: 'Teaching resources',
      resourcesText:
        "Download “Pharmacométrie Pratique”, the original slide deck written by this site's author, from which this course is drawn.",
      downloadSlides: 'Download the PowerPoint',
      chapterCount: (count) => `${count} chapter${count === 1 ? '' : 's'}`,
      openTrack: 'Open track →',
      inPreparation: 'In preparation',
      comingSoon: 'Coming soon'
    },
    chapters: {
      eyebrow: 'Course outline',
      title: 'Chapters',
      lede:
        'A guided path through pharmacometrics. Each chapter is a scroll-driven essay with a sticky, interactive visualization and a short checkpoint.',
      soon: 'Coming soon',
      meta: (steps, quiz) => `${steps} steps · ${quiz} quiz`,
      empty: 'Chapters for this track are in preparation.',
      search: 'Search a chapter, a keyword…',
      searchNone: 'No chapter matches your search.',
      searchResults: (n) => `${n} result${n === 1 ? '' : 's'}`
    },
    chapter: {
      missingTitle: 'Chapter not found',
      backMissing: 'Back to chapters',
      back: '← All chapters',
      label: (n) => `Chapter ${n}`,
      checkpoint: 'Checkpoint',
      quizTitle: 'Check your understanding',
      previous: '← Previous',
      next: 'Next →',
      emptyViz: 'Scroll to explore the interactive figures for this chapter.',
      fallbackNotice: 'English translation in progress — showing the French content.',
      exercisesTitle: 'Practice exercises',
      recallTitle: 'Before you start',
      prereqLabel: 'Prerequisites',
      glossaryLabel: 'Key terms',
      vizCaption: 'About this animation',
      vizMissing: 'Visualization not found:',
      vizCheck: 'Check the component name in',
      vizAvailable: 'Available keys:',
      // Signature d'auteur (en tête) et bloc de citation (en pied).
      reviewedOn: 'Last revised',
      citeTitle: 'Cite this page',
      citeCopy: 'Copy',
      citeCopied: 'Copied',
      citeNote: 'Text licensed under CC BY-SA 4.0'
    },
    quiz: {
      correct: 'correct',
      wrong: 'not quite',
      score: 'Score'
    },
    tdm: {
      metaTitle: 'TDM and PopPK model library | Practical Pharmacometrics',
      metaDescription: 'Shared PopPK model library for therapeutic drug monitoring and precision dosing.',
      eyebrow: 'Therapeutic drug monitoring',
      title: 'Precision dosing with mrgsolve, mapbayr and model averaging.',
      lede: 'Select a PopPK model, enter administrations, concentrations and covariates, then estimate individual parameters and compare dosing regimens in the R engine. Models can be combined using AIC or likelihood weights.',
      launch: 'Launch the R engine',
      choose: 'Choose a model',
      create: 'Build a model without coding',
      propose: 'Submit a model',
      panelAria: 'TDM library summary',
      panelStatus: 'R engine and open library',
      models: 'models',
      molecules: 'drugs',
      bayesian: 'Bayesian',
      privacy: 'Calculations run in a separate Shiny application using mrgsolve and mapbayr. Patient data and pasted C++ models remain limited to the computation session and are not retained by the site.',
      engineEyebrow: 'Pharmacometric engine',
      engineTitle: 'From an observed concentration to a dosing proposal',
      features: ['Individual MAP estimation', 'Population and individual predictions', 'AUC24, Cmin and Cmax', 'Dose by interval grid', 'AIC or likelihood model averaging', 'Custom mrgsolve/C++ model', 'Local JSON patient import and export'],
      contribution: 'Contribution',
      contributionTitle: 'Contribute through a reviewed GitHub workflow.',
      workflow: [
        ['GitHub submission', 'The contributor opens a structured issue with the model, reference, covariates and limitations.'],
        ['Validation', 'The file is reviewed before integration: units, compartments, variability, residual error and source article.'],
        ['Publication', 'A pull request or GitHub action adds the model to the static library, then redeploys the site.']
      ],
      modelsEyebrow: 'Published pharmacometric models',
      libraryTitle: 'Model library',
      modelCount: (shown, total) => `${shown} / ${total} models`,
      search: 'Search',
      searchPlaceholder: 'Drug, author, file...',
      molecule: 'Drug',
      administration: 'Administration',
      administrationModes: { ORAL: 'Oral', IV_INTERMITTENT: 'Intermittent IV', IV_CONTINUOUS: 'Continuous IV' },
      all: 'All',
      populationAria: 'Source population',
      sourceArticle: 'Source article',
      consult: 'View article',
      referencePending: 'Bibliographic reference pending confirmation',
      use: 'Use',
      download: 'Download',
      empty: 'No model matches these filters.',
      governanceTitle: 'Minimum requirements for accepting a model',
      rules: ['Identifiable bibliographic reference', 'Explicit typical parameters and units', 'Documented covariates', 'Described residual error and variability', 'Test case or simulation scenario', 'License compatible with public distribution'],
      inspiredPrefix: 'Application inspired by',
      disclaimer: 'Results are not a clinical recommendation and require local model validation. No patient record or pasted model is retained by the site.'
    },
    pages: {
      glossaryTitle: 'Glossary',
      aboutTitle: 'About',
      aboutLede:
        'Written and maintained by Racym Berrah, PharmD, PhD student in pharmacometrics. This course is drawn from my own teaching deck, “Pharmacométrie Pratique”. Everything here is free, open-source, sourced, and improved over time.',
      aboutText:
        'An interactive course on pharmacometrics — PK/PD, population modelling, NCA, PBPK, therapeutic drug monitoring, model validation, clinical-trial design and applied AI. Each chapter pairs a scroll-driven explanation with a live visualization, a quiz and hands-on exercises.',
      aboutItems: [
        'Written by a pharmacist (PharmD) who practises pharmacometrics: made to be clear before being exhaustive.',
        'Every chapter carries its SOURCES (an identifiable paper or reference), its last-revision date, and a link to report an error.',
        'Open-source and freely reusable (text CC BY-SA 4.0, code MIT): reuse in teaching, including paid teaching, is allowed provided you credit the source and share alike.',
        'Educational only — no medical advice and no dosing recommendation.',
        'Bilingual (French / English), built with SvelteKit and deployed on GitHub Pages.'
      ],
      aboutSignature: '— Racym Berrah',
      aboutThanks: 'Thank you for using it. If it helps you pass an exam or understand a model, it has done its job.',
      glossaryIntro: 'A pharmacometrics dictionary: parameters, models, estimation, diagnostics, Bayesian TDM and applied AI, with plain explanations.',
      glossarySearch: 'Search a term…',
      glossaryEmpty: 'No term matches your search.',
      referencesTitle: 'Further reading',
      referencesIntro: 'Curated books, landmark papers, software and communities to go deeper. Article links point to PubMed; tools link to their official sites.',
      exercisesTitle: 'Interactive exercises',
      exercisesIntro: 'Practice with numeric and multiple-choice problems drawn from the course and M2 corrections. Immediate feedback and explanations.',
      exercisesScore: 'Score',
      exercisesCheck: 'Check',
      exercisesRight: 'Correct',
      exercisesWrong: 'Not quite',
      exercisesAnswer: 'Answer',
      exercisesRetry: 'Try again',
      legoEyebrow: 'Build-a-model lab',
      legoTitle: 'Lego lab — assemble a PK/PD model',
      legoIntro: 'Click the blocks to build your model — absorption, compartments, elimination, PD. The ODE system, generated code and simulated curves update live.',
      legoEquations: 'Model (ODEs)',
      legoCode: 'Generated code',
      legoCopy: 'Copy',
      legoCopied: 'Copied',
      legoNoteNlmixr:
        'Ready to fit. Fixed effects are estimated on the log scale, between-subject variability is on clearance and volume, the residual error is combined, and a commented line shows where a covariate goes. Supply your own dataset as `data`.',
      legoNoteMrgsolve:
        'TDM-ready mrgsolve model: structural parameters, default inter-individual variability and residual error. Patient data and dosing are entered in the TDM engine.',
      legoNoteMlxtran:
        'Complete MLXTRAN model for MonolixSuite: covariate, individual, structural and combined-error sections. Suggested initial values are listed at the top; data mapping and estimation tasks remain configured in Monolix or Simulx.',
      legoNoteNonmem:
        'NONMEM ADVAN13 control stream with FOCE-I, covariates, inter-individual variability and combined residual error. Adapt the data.csv path and verify the generated CMT mapping before running it.',
      legoOpenTdm: 'Open in TDM',
      legoTdmSent: 'Sent to TDM',
      legoTdmUnavailable: 'Add a concentration compartment first',
      slidesTitle: 'Slides catalog',
      slidesIntro:
        'Source of truth: src/content/slides/slide_catalog.yaml. PNGs must live in static/slides/.',
      pptx: 'Download the PPTX',
      searchSlide: 'Search a slide',
      searchPlaceholder: 'Title, tag, module…',
      toFill: 'To fill',
      suggestedModule: 'Suggested module',
      keyPoints: 'Key points',
      tags: 'Tags',
      slideMissing: (number) => `Slide ${number} is unavailable`,
      openPptx: 'Open the PPTX',
      qaTitle: 'QA visualizations',
      qaIntro: 'Internal page to quickly verify modules with presets.'
    }
  },
  fr: {
    meta: {
      description:
        'Pharmacométrie Explain — un cours visuel et interactif sur la pharmacométrie : PK/PD, clairance, variabilité, TDM et IA appliquée. Contenu pédagogique uniquement.'
    },
    nav: {
      home: 'Accueil',
      course: 'Cours',
      example: 'Cas pratique',
      exercises: 'Exercices',
      tdm: 'TDM',
      lego: 'Atelier Lego',
      playground: 'Playground',
      glossary: 'Glossaire',
      references: 'Pour aller plus loin',
      about: 'À propos',
      primary: 'Navigation principale'
    },
    footer: {
      // Licence du TEXTE (le code reste MIT) : intitulé et URL viennent de $lib/site.
      licenseIntro: 'Pharmacométrie Pratique · Texte',
      licenseOutro: '· Code MIT · 2026',
      author: 'Écrit et maintenu par Racym Berrah, PharmD, doctorant en pharmacométrie',
      report: 'Une erreur ? Signalez-la',
      reportUrl: 'https://github.com/rberrah/rberrah.github.io/issues/new',
      built: 'Construit avec SvelteKit · statique, sans suivi',
      disclaimer: "Contenu pédagogique uniquement. Pas de conseil médical. Pas d'ajustement posologique patient-spécifique."
    },
    home: {
      eyebrow: 'Cours visuel de pharmacométrie',
      titlePrefix: 'Lire la courbe',
      titleHighlight: 'concentration-temps',
      titleSuffix: 'une idée à la fois.',
      lede:
        "Des chapitres interactifs qui rendent la théorie PK/PD visible : clairance et volume, variabilité entre patients et entre occasions, TDM, et place de l'IA moderne, toujours avec les unités et l'incertitude sous les yeux.",
      start: 'Commencer le cours',
      browse: 'Voir les chapitres',
      disclaimer: 'Contenu pédagogique uniquement · pas de conseil médical.',
      tracksTitle: 'Le cours, en quatre couches',
      layers: {
        tronc: { title: 'Tronc commun — commencez ici', desc: "L'essentiel, à lire dans l'ordre : ce que tout pharmacométricien doit savoir." },
        approfondissement: { title: 'Approfondissements', desc: "Des méthodes et concepts transversaux menés au bout : analyse non-compartimentale, PBPK, pharmacodynamie, IA, validation de modèle. Ils s'appliquent à tous les domaines." },
        domaine: { title: "Domaines d'application", desc: "Des zooms sur une aire de recherche, qui supposent le tronc acquis : oncologie, infectiologie, anticorps monoclonaux, essais cliniques." },
        reference: { title: 'Référence', desc: "On y va quand on en a besoin — personne ne les lit d'une traite." }
      },
      featuredTitle: 'Pharmacométrie fondamentale',
      resourcesTitle: 'Ressources pédagogiques',
      resourcesText:
        "Téléchargez « Pharmacométrie Pratique », le support de cours original rédigé par l'auteur de ce site, dont ce cours est tiré.",
      downloadSlides: 'Télécharger le PowerPoint',
      chapterCount: (count) => `${count} chapitre${count === 1 ? '' : 's'}`,
      openTrack: 'Ouvrir le parcours →',
      inPreparation: 'En préparation',
      comingSoon: 'Bientôt'
    },
    chapters: {
      eyebrow: 'Plan du cours',
      title: 'Chapitres',
      lede:
        'Un parcours guidé en pharmacométrie. Chaque chapitre associe un récit défilant, une visualisation interactive et un court point de contrôle.',
      soon: 'Bientôt',
      meta: (steps, quiz) => `${steps} étapes · ${quiz} quiz`,
      empty: 'Les chapitres de ce parcours sont en préparation.',
      search: 'Rechercher un chapitre, un mot-clé…',
      searchNone: 'Aucun chapitre ne correspond à votre recherche.',
      searchResults: (n) => `${n} résultat${n === 1 ? '' : 's'}`
    },
    chapter: {
      missingTitle: 'Chapitre introuvable',
      backMissing: 'Retour aux chapitres',
      back: '← Tous les chapitres',
      label: (n) => `Chapitre ${n}`,
      checkpoint: 'Point de contrôle',
      quizTitle: 'Vérifiez votre compréhension',
      previous: '← Précédent',
      next: 'Suivant →',
      emptyViz: 'Faites défiler pour explorer les figures interactives de ce chapitre.',
      fallbackNotice: 'Contenu en français (langue principale du cours).',
      exercisesTitle: "Exercices d'entraînement",
      recallTitle: 'Avant de commencer',
      prereqLabel: 'Prérequis',
      glossaryLabel: 'Termes clés',
      vizCaption: 'À propos de cette animation',
      vizMissing: 'Visualisation introuvable :',
      vizCheck: 'Vérifiez le nom du composant dans',
      vizAvailable: 'Clés disponibles :',
      // Signature d'auteur (en tête) et bloc de citation (en pied).
      reviewedOn: 'Dernière révision',
      citeTitle: 'Citer cette page',
      citeCopy: 'Copier',
      citeCopied: 'Copié',
      citeNote: 'Texte sous licence CC BY-SA 4.0'
    },
    quiz: {
      correct: 'correct',
      wrong: 'pas tout à fait',
      score: 'Score'
    },
    tdm: {
      metaTitle: 'TDM et bibliothèque de modèles PopPK | Pharmacométrie Pratique',
      metaDescription: 'Bibliothèque partagée de modèles PopPK pour le suivi thérapeutique pharmacologique et la médecine de précision.',
      eyebrow: 'Suivi thérapeutique pharmacologique',
      title: 'Ajustement de dose avec mrgsolve, mapbayr et model averaging.',
      lede: 'Sélectionnez un modèle PopPK, renseignez les administrations, concentrations et covariables, puis estimez les paramètres individuels et comparez les schémas de dose dans le moteur R. Plusieurs modèles peuvent être combinés par pondération AIC ou vraisemblance.',
      launch: 'Lancer le moteur R',
      choose: 'Choisir un modèle',
      create: 'Créer un modèle sans coder',
      propose: 'Proposer un modèle',
      panelAria: 'Résumé de la bibliothèque TDM',
      panelStatus: 'Moteur R et bibliothèque ouverte',
      models: 'modèles',
      molecules: 'molécules',
      bayesian: 'Bayésien',
      privacy: "Le calcul s'exécute dans une application Shiny séparée avec mrgsolve et mapbayr. Les données patient et les modèles C++ collés restent limités à la session de calcul et ne sont pas conservés par le site.",
      engineEyebrow: 'Moteur pharmacométrique',
      engineTitle: 'Du dosage observé à la proposition de dose',
      features: ['Estimation MAP individuelle', 'Prédictions population et individuelles', 'AUC24, Cmin et Cmax', 'Grille dose par intervalle', 'Model averaging AIC ou vraisemblance', 'Modèle mrgsolve/C++ personnalisé', 'Import et export local du dossier JSON'],
      contribution: 'Contribution',
      contributionTitle: 'Contribuer par un flux GitHub relu.',
      workflow: [
        ['Soumission GitHub', 'Le contributeur ouvre une issue structurée avec le modèle, sa référence, les covariables et les limites.'],
        ['Validation', "Le fichier est relu avant intégration : unités, compartiments, variabilité, erreur résiduelle et article source."],
        ['Publication', 'Une pull request ou une action GitHub ajoute le modèle à la bibliothèque statique, puis le site se redéploie.']
      ],
      modelsEyebrow: 'Modèles pharmacométriques publiés',
      libraryTitle: 'Bibliothèque de modèles',
      modelCount: (shown, total) => `${shown} / ${total} modèles`,
      search: 'Recherche',
      searchPlaceholder: 'Molécule, auteur, fichier...',
      molecule: 'Molécule',
      administration: "Voie d'administration",
      administrationModes: { ORAL: 'Orale', IV_INTERMITTENT: 'IV intermittente', IV_CONTINUOUS: 'IV continue' },
      all: 'Toutes',
      populationAria: 'Population source',
      sourceArticle: 'Article source',
      consult: "Consulter l'article",
      referencePending: 'Référence bibliographique à confirmer',
      use: 'Utiliser',
      download: 'Télécharger',
      empty: 'Aucun modèle ne correspond à ces filtres.',
      governanceTitle: 'Règles minimales pour accepter un modèle',
      rules: ['Référence bibliographique identifiable', 'Paramètres typiques et unités explicites', 'Covariables documentées', 'Erreur résiduelle et variabilité décrites', 'Jeu de test ou scénario de simulation', 'Licence compatible avec une diffusion publique'],
      inspiredPrefix: 'Application inspirée de',
      disclaimer: "Les résultats ne constituent pas une recommandation clinique et exigent une validation locale des modèles. Aucun dossier patient ni modèle collé n'est conservé par le site."
    },
    pages: {
      glossaryTitle: 'Glossaire',
      aboutTitle: 'À propos',
      aboutLede:
        "Écrit et maintenu par Racym Berrah, PharmD, doctorant en pharmacométrie. Ce cours est tiré de mon propre support d'enseignement, « Pharmacométrie Pratique ». Tout est gratuit, open-source, sourcé et amélioré au fil du temps.",
      aboutText:
        "Un cours interactif de pharmacométrie — PK/PD, modélisation de population, NCA, PBPK, suivi thérapeutique, validation de modèle, design d'essais cliniques et IA appliquée. Chaque chapitre associe une explication défilante, une visualisation interactive, un quiz et des exercices.",
      aboutItems: [
        "Écrit par un pharmacien (PharmD) qui pratique la pharmacométrie : pensé pour être clair avant d'être exhaustif.",
        "Chaque chapitre porte ses SOURCES (article ou référence identifiable), sa date de dernière révision, et un lien pour signaler une erreur.",
        "Open-source et librement réutilisable (texte CC BY-SA 4.0, code MIT) : la reprise en enseignement, y compris payant, est autorisée à condition de citer et de partager aux mêmes conditions.",
        'Usage pédagogique uniquement — aucun conseil médical ni recommandation posologique.',
        'Bilingue (français / anglais), construit avec SvelteKit et déployé sur GitHub Pages.'
      ],
      aboutSignature: '— Racym Berrah',
      aboutThanks: "Merci de l'utiliser. S'il vous aide à réussir un examen ou à comprendre un modèle, il a rempli sa mission.",
      glossaryIntro: 'Un dictionnaire de pharmacométrie : paramètres, modèles, estimation, diagnostics, TDM bayésien et IA appliquée, avec des explications claires.',
      glossarySearch: 'Rechercher un terme…',
      glossaryEmpty: 'Aucun terme ne correspond à votre recherche.',
      referencesTitle: 'Pour aller plus loin',
      referencesIntro: 'Livres, articles fondateurs, logiciels et communautés pour approfondir. Les liens d\'articles pointent vers PubMed ; les outils vers leur site officiel.',
      exercisesTitle: 'Exercices interactifs',
      exercisesIntro: 'Entraînez-vous avec des questions numériques et à choix multiples, inspirées du cours et des corrigés M2. Correction et explication immédiates.',
      exercisesScore: 'Score',
      exercisesCheck: 'Vérifier',
      exercisesRight: 'Correct',
      exercisesWrong: 'Pas tout à fait',
      exercisesAnswer: 'Réponse',
      exercisesRetry: 'Réessayer',
      legoEyebrow: 'Atelier « construire un modèle »',
      legoTitle: 'Atelier Lego — assemblez un modèle PK/PD',
      legoIntro: 'Cliquez les blocs pour construire votre modèle — absorption, compartiments, élimination, PD. Le système d’EDO, les codes générés et les courbes simulées se mettent à jour en direct.',
      legoEquations: 'Modèle (EDO)',
      legoCode: 'Code généré',
      legoCopy: 'Copier',
      legoCopied: 'Copié',
      legoNoteNlmixr:
        "Prêt à estimer. Les effets fixes sont sur l'échelle log, la variabilité inter-individuelle porte sur la clairance et le volume, l'erreur résiduelle est combinée, et une ligne commentée montre où placer une covariable. Fournissez votre jeu de données sous le nom `data`.",
      legoNoteMrgsolve:
        "Modèle mrgsolve prêt pour le TDM : structure, variabilité interindividuelle et erreur résiduelle par défaut. Les données patient et les doses sont renseignées dans le moteur TDM.",
      legoNoteMlxtran:
        "Modèle MLXTRAN complet pour MonolixSuite : covariables, modèle individuel, structure et erreur combinée. Les valeurs initiales suggérées figurent en tête ; l'association des données et les tâches d'estimation restent à régler dans Monolix ou Simulx.",
      legoNoteNonmem:
        "Control stream NONMEM ADVAN13 avec FOCE-I, covariables, variabilité interindividuelle et erreur combinée. Adaptez le chemin data.csv et vérifiez la correspondance des CMT générés avant l'exécution.",
      legoOpenTdm: 'Ouvrir dans TDM',
      legoTdmSent: 'Envoyé au TDM',
      legoTdmUnavailable: "Ajoutez d'abord un compartiment de concentration",
      slidesTitle: 'Catalogue des slides',
      slidesIntro:
        'Source de vérité : src/content/slides/slide_catalog.yaml. Les PNG doivent être dans static/slides/.',
      pptx: 'Télécharger le PPTX',
      searchSlide: 'Rechercher une slide',
      searchPlaceholder: 'Titre, tag, module…',
      toFill: 'À compléter',
      suggestedModule: 'Module suggéré',
      keyPoints: 'Points clés',
      tags: 'Tags',
      slideMissing: (number) => `Slide ${number} non fournie`,
      openPptx: 'Ouvrir le PPTX',
      qaTitle: 'QA des visualisations',
      qaIntro: 'Page interne pour vérifier rapidement les modules avec des préréglages.'
    }
  }
};

export function ui(lang) {
  return dictionary[lang] ?? dictionary.en;
}

// Langue principale du contenu : les fichiers .md racine sont en français.
export const PRIMARY_LANG = 'fr';

export function localizeChapter(chapter, lang) {
  if (!chapter) return { chapter: null, isFallback: false };
  // Langue principale (fr) : on rend directement le fichier principal.
  if (lang === PRIMARY_LANG) return { chapter, isFallback: false };
  // Autre langue (ex. en) : on rend la traduction si elle existe, sinon repli
  // sur le principal en signalant que la traduction est en cours.
  if (chapter.translations?.[lang]) {
    return { chapter: chapter.translations[lang], isFallback: false };
  }
  return { chapter, isFallback: true };
}

export function localizeTrack(track, lang) {
  return {
    ...track,
    ...(track.i18n?.[lang] ?? track.i18n?.en ?? {})
  };
}
