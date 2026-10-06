// Exercices numériques courts, distincts des QCM de cours et des activités guidées.
// Chaque exercice est bilingue et rattaché à un chapitre.

/** @typedef {{q:string, explain:string}} ExerciseI18n */
/** @typedef {{cat:string, chapter:string, type:'num', q:string, unit?:string, answer:number, tol:number, explain:string, en:ExerciseI18n}} Exercise */

/** @type {Exercise[]} */
export const exercises = [
  {
    "cat": "Pharmacocinétique de base",
    "chapter": "clairance-volume-demi-vie",
    "type": "num",
    "unit": "h",
    "answer": 3.47,
    "tol": 0.05,
    "q": "Après un bolus IV, la droite ln(C) vs temps a une pente de −0,20 /h. Quelle est la demi-vie d'élimination ?",
    "explain": "La pente donne ke = 0,20 /h. t½ = ln(2)/ke = 0,693/0,20 ≈ 3,47 h.",
    "en": {
      "q": "After an IV bolus, the ln(C) vs time line has a slope of −0.20 /h. What is the elimination half-life?",
      "explain": "The slope gives ke = 0.20 /h. t½ = ln(2)/ke = 0.693/0.20 ≈ 3.47 h."
    }
  },
  {
    "cat": "Pharmacocinétique de base",
    "chapter": "clairance-volume-demi-vie",
    "type": "num",
    "unit": "L",
    "answer": 5,
    "tol": 0.02,
    "q": "Bolus IV de 10 mg. L'ordonnée à l'origine de ln(C) donne C₀ = 2 mg/L. Quel est le volume de distribution Vd ?",
    "explain": "Vd = Dose / C₀ = 10 mg / 2 mg/L = 5 L.",
    "en": {
      "q": "IV bolus of 10 mg. The ln(C) intercept gives C₀ = 2 mg/L. What is the volume of distribution Vd?",
      "explain": "Vd = Dose / C₀ = 10 mg / 2 mg/L = 5 L."
    }
  },
  {
    "cat": "Pharmacocinétique de base",
    "chapter": "clairance-volume-demi-vie",
    "type": "num",
    "unit": "L/h",
    "answer": 1,
    "tol": 0.05,
    "q": "Avec ke = 0,20 /h et Vd = 5 L, quelle est la clairance CL ?",
    "explain": "CL = ke · Vd = 0,20 × 5 = 1 L/h.",
    "en": {
      "q": "With ke = 0.20 /h and Vd = 5 L, what is the clearance CL?",
      "explain": "CL = ke · Vd = 0.20 × 5 = 1 L/h."
    }
  },
  {
    "cat": "Pharmacocinétique de base",
    "chapter": "clairance-volume-demi-vie",
    "type": "num",
    "unit": "h",
    "answer": 3.47,
    "tol": 0.05,
    "q": "Un modèle donne CL = 6 L/h et V = 30 L. Quelle est la demi-vie ?",
    "explain": "t½ = ln(2)·V/CL = 0,693 × 30 / 6 ≈ 3,47 h.",
    "en": {
      "q": "A model gives CL = 6 L/h and V = 30 L. What is the half-life?",
      "explain": "t½ = ln(2)·V/CL = 0.693 × 30 / 6 ≈ 3.47 h."
    }
  },
  {
    "cat": "Absorption, perfusion & doses",
    "chapter": "perfusion",
    "type": "num",
    "unit": "mg/L",
    "answer": 6,
    "tol": 0.02,
    "q": "Perfusion IV à débit R₀ = 30 mg/h, clairance CL = 5 L/h. Quelle est la concentration à l'équilibre Css ?",
    "explain": "Css = R₀ / CL = 30 / 5 = 6 mg/L (indépendant du volume).",
    "en": {
      "q": "IV infusion at rate R₀ = 30 mg/h, clearance CL = 5 L/h. What is the steady-state concentration Css?",
      "explain": "Css = R₀ / CL = 30 / 5 = 6 mg/L (independent of volume)."
    }
  },
  {
    "cat": "Absorption, perfusion & doses",
    "chapter": "doses-repetees",
    "type": "num",
    "unit": "mg/L",
    "answer": 2.5,
    "tol": 0.02,
    "q": "Doses répétées : 100 mg toutes les 8 h, CL = 5 L/h. Quelle est la Css moyenne ?",
    "explain": "Css,moy = Dose / (CL · τ) = 100 / (5 × 8) = 2,5 mg/L.",
    "en": {
      "q": "Repeated doses: 100 mg every 8 h, CL = 5 L/h. What is the average Css?",
      "explain": "Css,avg = Dose / (CL · τ) = 100 / (5 × 8) = 2.5 mg/L."
    }
  },
  {
    "cat": "Absorption, perfusion & doses",
    "chapter": "doses-repetees",
    "type": "num",
    "unit": "",
    "answer": 1.82,
    "tol": 0.05,
    "q": "Bolus répétés, ke = 0,10 /h, intervalle τ = 8 h. Quel est le ratio d'accumulation Rac = 1/(1 − e^(−ke·τ)) ?",
    "explain": "e^(−0,10×8) = e^(−0,8) ≈ 0,449 ; Rac = 1/(1 − 0,449) ≈ 1,82.",
    "en": {
      "q": "Repeated boluses, ke = 0.10 /h, interval τ = 8 h. What is the accumulation ratio Rac = 1/(1 − e^(−ke·τ))?",
      "explain": "e^(−0.10×8) = e^(−0.8) ≈ 0.449; Rac = 1/(1 − 0.449) ≈ 1.82."
    }
  },
  {
    "cat": "Maths & covariables",
    "chapter": "allometrie",
    "type": "num",
    "unit": "L/h",
    "answer": 2.97,
    "tol": 0.05,
    "q": "Allométrie : CL₇₀ = 5 L/h (patient de 70 kg). Quelle CL pour un enfant de 35 kg (exposant 0,75) ?",
    "explain": "CL = 5 · (35/70)^0,75 = 5 · 0,5^0,75 ≈ 5 × 0,595 ≈ 2,97 L/h. Un enfant n'est pas un petit adulte.",
    "en": {
      "q": "Allometry: CL₇₀ = 5 L/h (70 kg patient). What CL for a 35 kg child (exponent 0.75)?",
      "explain": "CL = 5 · (35/70)^0.75 = 5 · 0.5^0.75 ≈ 5 × 0.595 ≈ 2.97 L/h. A child is not a small adult."
    }
  },
  {
    "cat": "Maths & covariables",
    "chapter": "math-edo",
    "type": "num",
    "unit": "mg",
    "answer": 36.8,
    "tol": 0.03,
    "q": "dA/dt = −k·A avec A₀ = 100 mg et k = 0,10 /h. Quelle quantité reste-t-il à t = 10 h ?",
    "explain": "A(t) = A₀·e^(−kt) = 100·e^(−1) ≈ 36,8 mg.",
    "en": {
      "q": "dA/dt = −k·A with A₀ = 100 mg and k = 0.10 /h. How much remains at t = 10 h?",
      "explain": "A(t) = A₀·e^(−kt) = 100·e^(−1) ≈ 36.8 mg."
    }
  },
  {
    "cat": "Maths & covariables",
    "chapter": "math-regression",
    "type": "num",
    "unit": "/h",
    "answer": 0.2,
    "tol": 0.05,
    "q": "Régression log-linéaire : ln(C) passe de 2,0 (t=0) à 0,0 (t=10 h). Quelle est la constante ke (−pente) ?",
    "explain": "pente = (0 − 2)/10 = −0,20 /h ⇒ ke = 0,20 /h.",
    "en": {
      "q": "Log-linear regression: ln(C) goes from 2.0 (t=0) to 0.0 (t=10 h). What is ke (−slope)?",
      "explain": "slope = (0 − 2)/10 = −0.20 /h ⇒ ke = 0.20 /h."
    }
  },
  {
    "cat": "Maths & covariables",
    "chapter": "math-stats",
    "type": "num",
    "unit": "L/h",
    "answer": 5.98,
    "tol": 0.02,
    "q": "Estimation CL = 5 L/h avec SE = 0,5. Quelle est la borne haute de l'IC à 95 % (≈ est + 1,96·SE) ?",
    "explain": "5 + 1,96 × 0,5 = 5,98 L/h. La borne basse serait 4,02.",
    "en": {
      "q": "Estimate CL = 5 L/h with SE = 0.5. What is the upper bound of the 95% CI (≈ est + 1.96·SE)?",
      "explain": "5 + 1.96 × 0.5 = 5.98 L/h. The lower bound would be 4.02."
    }
  },
  {
    "cat": "PK/PD & pharmacodynamie",
    "chapter": "pd-direct",
    "type": "num",
    "unit": "",
    "answer": 75,
    "tol": 0.02,
    "q": "Modèle Emax (n=1) : Emax = 100, EC50 = 2 mg/L. Quel effet à C = 6 mg/L (E = Emax·C/(EC50+C)) ?",
    "explain": "E = 100 × 6/(2+6) = 100 × 0,75 = 75.",
    "en": {
      "q": "Emax model (n=1): Emax = 100, EC50 = 2 mg/L. What effect at C = 6 mg/L (E = Emax·C/(EC50+C))?",
      "explain": "E = 100 × 6/(2+6) = 100 × 0.75 = 75."
    }
  },
  {
    "cat": "PK/PD & pharmacodynamie",
    "chapter": "pd-effect-compartment",
    "type": "num",
    "unit": "h",
    "answer": 1.98,
    "tol": 0.05,
    "q": "Compartiment d'effet avec ke0 = 0,35 /h. Quelle est la demi-vie d'équilibration (ln2/ke0) ?",
    "explain": "t½,ke0 = 0,693/0,35 ≈ 1,98 h : elle résume le retard plasma → site d'effet.",
    "en": {
      "q": "Effect compartment with ke0 = 0.35 /h. What is the equilibration half-life (ln2/ke0)?",
      "explain": "t½,ke0 = 0.693/0.35 ≈ 1.98 h: it summarises the plasma → effect-site delay."
    }
  },
  {
    "cat": "NCA",
    "chapter": "nca-auc",
    "type": "num",
    "unit": "mg·h/L",
    "answer": 12,
    "tol": 0.02,
    "q": "Trapèze : C = 8 mg/L à t = 1 h et C = 4 mg/L à t = 3 h. Quelle est l'aire de ce segment ?",
    "explain": "ΔAUC = (8+4)/2 × (3−1) = 6 × 2 = 12 mg·h/L.",
    "en": {
      "q": "Trapezoid: C = 8 mg/L at t = 1 h and C = 4 mg/L at t = 3 h. What is the area of this segment?",
      "explain": "ΔAUC = (8+4)/2 × (3−1) = 6 × 2 = 12 mg·h/L."
    }
  },
  {
    "cat": "NCA",
    "chapter": "nca-auc",
    "type": "num",
    "unit": "mg·h/L",
    "answer": 100,
    "tol": 0.02,
    "q": "AUC₀–last = 90, dernière concentration Clast = 2 mg/L, λz = 0,20 /h. Quelle est l'AUC₀–∞ ?",
    "explain": "AUC∞ = AUClast + Clast/λz = 90 + 2/0,20 = 90 + 10 = 100 mg·h/L.",
    "en": {
      "q": "AUC₀–last = 90, last concentration Clast = 2 mg/L, λz = 0.20 /h. What is AUC₀–∞?",
      "explain": "AUC∞ = AUClast + Clast/λz = 90 + 2/0.20 = 90 + 10 = 100 mg·h/L."
    }
  },
  {
    "cat": "NCA",
    "chapter": "nca-params",
    "type": "num",
    "unit": "L/h",
    "answer": 5,
    "tol": 0.02,
    "q": "Dose IV de 200 mg, AUC₀–∞ = 40 mg·h/L. Quelle est la clairance ?",
    "explain": "CL = Dose / AUC∞ = 200 / 40 = 5 L/h.",
    "en": {
      "q": "IV dose of 200 mg, AUC₀–∞ = 40 mg·h/L. What is the clearance?",
      "explain": "CL = Dose / AUC∞ = 200 / 40 = 5 L/h."
    }
  },
  {
    "cat": "NCA",
    "chapter": "nca-params",
    "type": "num",
    "unit": "L",
    "answer": 50,
    "tol": 0.02,
    "q": "Avec CL = 5 L/h et λz = 0,10 /h, quel est le volume Vz (= CL/λz) ?",
    "explain": "Vz = CL/λz = 5/0,10 = 50 L.",
    "en": {
      "q": "With CL = 5 L/h and λz = 0.10 /h, what is the volume Vz (= CL/λz)?",
      "explain": "Vz = CL/λz = 5/0.10 = 50 L."
    }
  },
  {
    "cat": "NCA",
    "chapter": "nca-absorption",
    "type": "num",
    "unit": "",
    "answer": 0.5,
    "tol": 0.05,
    "q": "Même dose PO et IV : AUC_orale = 40, AUC_IV = 80 mg·h/L. Quelle est la biodisponibilité absolue F ?",
    "explain": "F = AUC_orale / AUC_IV (dose égale) = 40/80 = 0,5 (50 %).",
    "en": {
      "q": "Same PO and IV dose: AUC_oral = 40, AUC_IV = 80 mg·h/L. What is the absolute bioavailability F?",
      "explain": "F = AUC_oral / AUC_IV (equal dose) = 40/80 = 0.5 (50%)."
    }
  },
  {
    "cat": "PBPK",
    "chapter": "pbpk-absorption",
    "type": "num",
    "unit": "",
    "answer": 0.405,
    "tol": 0.05,
    "q": "Biodisponibilité orale F = fa·Fg·Fh avec fa = 0,9, Fg = 0,9, Fh = 0,5. Quelle est F ?",
    "explain": "F = 0,9 × 0,9 × 0,5 = 0,405 (≈ 40 %). Un fort premier passage (Fh bas) peut dominer.",
    "en": {
      "q": "Oral bioavailability F = fa·Fg·Fh with fa = 0.9, Fg = 0.9, Fh = 0.5. What is F?",
      "explain": "F = 0.9 × 0.9 × 0.5 = 0.405 (≈ 40%). A strong first-pass (low Fh) can dominate."
    }
  },
  {
    "cat": "PBPK",
    "chapter": "pbpk-applications",
    "type": "num",
    "unit": "L/h",
    "answer": 22.5,
    "tol": 0.03,
    "q": "Modèle well-stirred : Qh = 90 L/h, fu·CLint = 30 L/h. Quelle est CLh = Qh·fu·CLint/(Qh + fu·CLint) ?",
    "explain": "CLh = 90 × 30 / (90 + 30) = 2700/120 = 22,5 L/h.",
    "en": {
      "q": "Well-stirred model: Qh = 90 L/h, fu·CLint = 30 L/h. What is CLh = Qh·fu·CLint/(Qh + fu·CLint)?",
      "explain": "CLh = 90 × 30 / (90 + 30) = 2700/120 = 22.5 L/h."
    }
  },
  {
    "cat": "Infectiologie",
    "chapter": "infectio-pkpd",
    "type": "num",
    "unit": "",
    "answer": 200,
    "tol": 0.02,
    "q": "AUC₂₄ = 400 mg·h/L, CMI = 2 mg/L. Quel est l'indice AUC₂₄/CMI ?",
    "explain": "AUC₂₄/CMI = 400/2 = 200. Pour la vancomycine, la cible est ≥ 400.",
    "en": {
      "q": "AUC₂₄ = 400 mg·h/L, MIC = 2 mg/L. What is the AUC₂₄/MIC index?",
      "explain": "AUC₂₄/MIC = 400/2 = 200. For vancomycin, the target is ≥ 400."
    }
  },
  {
    "cat": "Infectiologie",
    "chapter": "infectio-tdm",
    "type": "num",
    "unit": "mg·h/L",
    "answer": 500,
    "tol": 0.02,
    "q": "Vancomycine 2000 mg/j, clairance CL = 4 L/h. Quelle est l'AUC₂₄ (= dose/j ÷ CL) ?",
    "explain": "AUC₂₄ = 2000 / 4 = 500 mg·h/L. Avec CMI = 1, AUC/CMI = 500 ≥ 400 : cible atteinte.",
    "en": {
      "q": "Vancomycin 2000 mg/day, clearance CL = 4 L/h. What is the AUC₂₄ (= daily dose ÷ CL)?",
      "explain": "AUC₂₄ = 2000 / 4 = 500 mg·h/L. With MIC = 1, AUC/MIC = 500 ≥ 400: target met."
    }
  },
  {
    "cat": "Validation de modèle",
    "chapter": "valid-uncertainty",
    "type": "num",
    "unit": "%",
    "answer": 10,
    "tol": 0.02,
    "q": "Un paramètre est estimé à 5 L/h avec SE = 0,5. Quel est son RSE en % (SE/estimation ×100) ?",
    "explain": "RSE = 0,5/5 × 100 = 10 %. Un RSE faible = paramètre bien identifié.",
    "en": {
      "q": "A parameter is estimated at 5 L/h with SE = 0.5. What is its RSE in % (SE/estimate ×100)?",
      "explain": "RSE = 0.5/5 × 100 = 10%. A low RSE = a well-identified parameter."
    }
  },
  {
    "cat": "Validation de modèle",
    "chapter": "valid-shrinkage",
    "type": "num",
    "unit": "%",
    "answer": 30,
    "tol": 0.05,
    "q": "eta-shrinkage : SD(η̂) = 0,21 et ω = 0,30. Quel est le shrinkage en % (1 − SD/ω) ?",
    "explain": "1 − 0,21/0,30 = 1 − 0,70 = 0,30 = 30 %. Au-delà de ~20–30 %, les diagnostics par EBE trompent.",
    "en": {
      "q": "eta-shrinkage: SD(η̂) = 0.21 and ω = 0.30. What is the shrinkage in % (1 − SD/ω)?",
      "explain": "1 − 0.21/0.30 = 1 − 0.70 = 0.30 = 30%. Beyond ~20–30%, EBE-based diagnostics mislead."
    }
  },
  {
    "cat": "Validation de modèle",
    "chapter": "valid-objective",
    "type": "num",
    "unit": "",
    "answer": 432,
    "tol": 0.01,
    "q": "Un modèle a OFV = 420 et k = 6 paramètres. Quel est son AIC (= OFV + 2k) ?",
    "explain": "AIC = 420 + 2×6 = 432. Le modèle au plus petit AIC est préféré.",
    "en": {
      "q": "A model has OFV = 420 and k = 6 parameters. What is its AIC (= OFV + 2k)?",
      "explain": "AIC = 420 + 2×6 = 432. The model with the smallest AIC is preferred."
    }
  },
  {
    "cat": "Absorption, perfusion & doses",
    "chapter": "doses-repetees",
    "type": "num",
    "unit": "mg/h",
    "answer": 20,
    "tol": 0.02,
    "q": "On vise une Css de 10 mg/L avec CL = 2 L/h (perfusion). Quel débit R₀ (= Css·CL) ?",
    "explain": "R₀ = Css · CL = 10 × 2 = 20 mg/h. Le niveau dépend du débit et de la clairance.",
    "en": {
      "q": "Target a Css of 10 mg/L with CL = 2 L/h (infusion). What rate R₀ (= Css·CL)?",
      "explain": "R₀ = Css · CL = 10 × 2 = 20 mg/h. The level depends on the rate and the clearance."
    }
  }
];

/** Exercices numériques d'un chapitre donné. @param {string} slug */
export function exercisesForChapter(slug) {
  return exercises.filter((exercise) => exercise.chapter === slug);
}
