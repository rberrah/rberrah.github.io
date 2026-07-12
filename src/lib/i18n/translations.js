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
      lego: 'Lego lab',
      playground: 'Playground',
      glossary: 'Glossary',
      references: 'Further reading',
      about: 'About',
      primary: 'Primary'
    },
    footer: {
      license: 'Pharmacométrie Explain · Text CC BY-NC-SA 4.0 · Code MIT · 2026',
      author: 'Written and maintained by Racym Berrah (PharmD)',
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
      tracksTitle: 'Two tracks',
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
      vizCaption: 'About this animation'
    },
    quiz: {
      correct: 'correct',
      wrong: 'not quite',
      score: 'Score'
    },
    pages: {
      glossaryTitle: 'Glossary',
      aboutTitle: 'About',
      aboutLede:
        'This site was built for students, by Racym Berrah — in the hope that it helps you learn pharmacometrics. Everything here is free and open-source, and improved over time.',
      aboutText:
        'An interactive course on pharmacometrics — PK/PD, population modelling, NCA, PBPK, therapeutic drug monitoring, model validation, clinical-trial design and applied AI. Each chapter pairs a scroll-driven explanation with a live visualization, a quiz and hands-on exercises.',
      aboutItems: [
        'For students, by a student: made to be clear before being exhaustive.',
        'Free and open-source (text CC BY-NC-SA 4.0, code MIT) — non-commercial reuse and contributions welcome.',
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
      legoIntro: 'Click the blocks to build your model — absorption, compartments, elimination, PD. The ODE system, the nlmixr2 code and the simulated curves update live.',
      legoEquations: 'Model (ODEs)',
      legoCode: 'nlmixr2 code',
      slidesTitle: 'Slides catalog',
      slidesIntro:
        'Source of truth: src/content/slides/slide_catalog.yaml. PNGs must live in static/slides/.',
      pptx: 'Download the PPTX',
      searchSlide: 'Search a slide',
      searchPlaceholder: 'Title, tag, module…',
      toFill: 'To fill',
      suggestedModule: 'Suggested module',
      keyPoints: 'Key points',
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
      lego: 'Atelier Lego',
      playground: 'Playground',
      glossary: 'Glossaire',
      references: 'Pour aller plus loin',
      about: 'À propos',
      primary: 'Navigation principale'
    },
    footer: {
      license: 'Pharmacométrie Explain · Texte CC BY-NC-SA 4.0 · Code MIT · 2026',
      author: 'Écrit et maintenu par Racym Berrah (PharmD)',
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
      tracksTitle: 'Deux parcours',
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
      vizCaption: 'À propos de cette animation'
    },
    quiz: {
      correct: 'correct',
      wrong: 'pas tout à fait',
      score: 'Score'
    },
    pages: {
      glossaryTitle: 'Glossaire',
      aboutTitle: 'À propos',
      aboutLede:
        "Ce site a été conçu pour les étudiants, par Racym Berrah — en espérant qu'il vous serve à apprendre la pharmacométrie. Tout est gratuit, open-source, et amélioré au fil du temps.",
      aboutText:
        "Un cours interactif de pharmacométrie — PK/PD, modélisation de population, NCA, PBPK, suivi thérapeutique, validation de modèle, design d'essais cliniques et IA appliquée. Chaque chapitre associe une explication défilante, une visualisation interactive, un quiz et des exercices.",
      aboutItems: [
        "Pour les étudiants, par un étudiant : pensé pour être clair avant d'être exhaustif.",
        'Gratuit et open-source (texte CC BY-NC-SA 4.0, code MIT) — réutilisation non commerciale et contributions bienvenues.',
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
      legoIntro: 'Cliquez les blocs pour construire votre modèle — absorption, compartiments, élimination, PD. Le système d’EDO, le code nlmixr2 et les courbes simulées se mettent à jour en direct.',
      legoEquations: 'Modèle (EDO)',
      legoCode: 'Code nlmixr2',
      slidesTitle: 'Catalogue des slides',
      slidesIntro:
        'Source de vérité : src/content/slides/slide_catalog.yaml. Les PNG doivent être dans static/slides/.',
      pptx: 'Télécharger le PPTX',
      searchSlide: 'Rechercher une slide',
      searchPlaceholder: 'Titre, tag, module…',
      toFill: 'À compléter',
      suggestedModule: 'Module suggéré',
      keyPoints: 'Points clés',
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
