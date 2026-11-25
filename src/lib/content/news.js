// Public editorial changelog. Dates are successful Pages deployment dates (Europe/Paris),
// not commit dates. Add only released changes, with matching FR/EN copy and evidence.
export const newsEntries = [
  {
    "date": "2026-11-25",
    "id": "pmetrics",
    "category": "learning",
    "path": "/game/?path=pmetrics",
    "pr": 269,
    "deploy": 45605298107,
    "fr": {
      "title": "Pmetrics : comprendre les distributions non paramétriques",
      "summary": "Un cinquième parcours complète PMx Game, avec un atelier sur les deux fonctions gamma, les points de support, leur pondération et l’actualisation bayésienne. Le cours d’absorption orale et le chapitre Pmetrics ont également été enrichis.",
      "action": "Découvrir le parcours Pmetrics"
    },
    "en": {
      "title": "Pmetrics: understanding nonparametric distributions",
      "summary": "A fifth learning pathway completes PMx Game, with an interactive workshop on two gamma functions, support points, their weights and Bayesian updating. The oral absorption and Pmetrics lessons have also been extended.",
      "action": "Explore the Pmetrics pathway"
    }
  },
  {
    "date": "2026-11-25",
    "id": "warfarin",
    "category": "learning",
    "path": "/game/",
    "pr": 267,
    "deploy": 45506179644,
    "fr": {
      "title": "Apprendre la PopPK à partir de données expérimentales",
      "summary": "Le parcours warfarine distingue les résultats archivés de nlmixr2 des simulations pédagogiques SAEM. Le mode exploration libre permet de parcourir les missions sans validation obligatoire.",
      "action": "Explorer PMx Game"
    },
    "en": {
      "title": "Learn PopPK using experimental data",
      "summary": "The warfarin pathway distinguishes archived nlmixr2 results from educational SAEM simulations. Free exploration lets learners visit activities without mandatory completion.",
      "action": "Explore PMx Game"
    }
  },
  {
    "date": "2026-11-24",
    "id": "navigation",
    "category": "maintenance",
    "path": "/game/",
    "pr": 266,
    "deploy": 45382077729,
    "fr": {
      "title": "Accès simplifié au jeu et continuité de la langue",
      "summary": "Les liens vers PMx Game ouvrent directement le jeu complet et conservent le choix français ou anglais.",
      "action": "Ouvrir le jeu"
    },
    "en": {
      "title": "Direct game access and consistent language",
      "summary": "PMx Game links now open the complete game directly and retain the selected French or English language.",
      "action": "Open the game"
    }
  },
  {
    "date": "2026-11-24",
    "id": "mipd",
    "category": "learning",
    "path": "/game/",
    "pr": 260,
    "deploy": 45285078879,
    "fr": {
      "title": "De l’analyse PopPK à l’individualisation posologique",
      "summary": "Le jeu propose une exploration de la warfarine et un cas fictif de greffe cardiaque pour interpréter les diagnostics, les distributions a priori et a posteriori, l’AUC du MPA et les changements de clairance. Les simulations ne constituent pas des prescriptions.",
      "action": "Découvrir les ateliers"
    },
    "en": {
      "title": "From population PK to individualized dosing",
      "summary": "The game offers warfarin exploration and a fictional heart-transplant case to interpret diagnostics, prior and posterior distributions, MPA AUC and clearance changes. Simulations are not prescribing recommendations.",
      "action": "Discover the workshops"
    }
  }
];

/** @param {string} path @param {string} lang */
export function newsHref(path, lang) {
  return path + (path.includes('?') ? '&' : '?') + 'lang=' + (lang === 'en' ? 'en' : 'fr');
}

/** @param {string} date @param {string} lang */
export function newsDate(date, lang) {
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'fr-FR', {dateStyle: 'long', timeZone: 'UTC'}).format(new Date(date + 'T12:00:00Z'));
}
