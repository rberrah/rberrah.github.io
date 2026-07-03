// Exercices interactifs de pharmacométrie (français), inspirés des corrigés M2
// (régression log-linéaire, NCA, perfusion, doses répétées, allométrie, PK/PD).
// type "num" : réponse numérique (tolérance relative tol) ; type "mcq" : choix.

/** @typedef {{cat:string, type:'num'|'mcq', q:string, unit?:string, answer?:number, tol?:number, options?:string[], correct?:number, explain:string}} Exercise */

/** @type {Exercise[]} */
export const exercises = [
  // ── Paramètres PK ──
  { cat: 'Paramètres PK', type: 'num', unit: 'h', answer: 3.47, tol: 0.05,
    q: "Après un bolus IV, la droite ln(C) vs temps a une pente de −0,20 /h. Quelle est la demi-vie d'élimination ?",
    explain: "La pente donne ke = 0,20 /h. t½ = ln(2)/ke = 0,693/0,20 ≈ 3,47 h." },
  { cat: 'Paramètres PK', type: 'num', unit: 'L', answer: 5, tol: 0.02,
    q: "Bolus IV de 10 mg. L'ordonnée à l'origine de ln(C) donne C₀ = 2 mg/L. Quel est le volume de distribution Vd ?",
    explain: "Vd = Dose / C₀ = 10 mg / 2 mg/L = 5 L." },
  { cat: 'Paramètres PK', type: 'num', unit: 'L/h', answer: 1, tol: 0.05,
    q: "Avec ke = 0,20 /h et Vd = 5 L, quelle est la clairance CL ?",
    explain: "CL = ke · Vd = 0,20 × 5 = 1 L/h." },
  { cat: 'Paramètres PK', type: 'num', unit: 'mg·h/L', answer: 100, tol: 0.02,
    q: "Dose IV de 100 mg, clairance CL = 1 L/h, cinétique linéaire. Quelle est l'AUC₀–∞ ?",
    explain: "AUC = Dose / CL = 100 / 1 = 100 mg·h/L." },
  { cat: 'Paramètres PK', type: 'num', unit: 'h', answer: 3.47, tol: 0.05,
    q: "Un modèle donne CL = 6 L/h et V = 30 L. Quelle est la demi-vie ?",
    explain: "t½ = ln(2)·V/CL = 0,693 × 30 / 6 ≈ 3,47 h." },

  // ── Ordres de cinétique ──
  { cat: 'Cinétique', type: 'mcq', correct: 1,
    q: "Une vitesse d'élimination CONSTANTE, quelle que soit la concentration, correspond à…",
    options: ["un ordre 1", "un ordre 0", "un ordre 2"],
    explain: "Ordre 0 : vitesse constante (ex. enzyme saturée, perfusion). Ordre 1 : vitesse proportionnelle à C." },
  { cat: 'Cinétique', type: 'mcq', correct: 0,
    q: "À forte concentration, une élimination michaélienne se comporte comme…",
    options: ["un ordre 0 (saturée)", "un ordre 1", "une absorption"],
    explain: "Michaelis-Menten : ordre 1 à basse [C], ordre 0 (saturée) à forte [C]. La saturation annonce souvent la toxicité." },

  // ── Perfusion & doses répétées ──
  { cat: 'Perfusion & doses', type: 'num', unit: 'mg/L', answer: 6, tol: 0.02,
    q: "Perfusion IV à débit R₀ = 30 mg/h, clairance CL = 5 L/h. Quelle est la concentration à l'équilibre Css ?",
    explain: "Css = R₀ / CL = 30 / 5 = 6 mg/L (indépendant du volume)." },
  { cat: 'Perfusion & doses', type: 'mcq', correct: 0,
    q: "Doubler le débit de perfusion R₀…",
    options: ["double la Css, sans changer le temps pour l'atteindre", "atteint la Css deux fois plus vite", "ne change pas la Css"],
    explain: "R₀ fixe le niveau (Css = R₀/CL) ; le temps d'atteinte (~4–5 t½) dépend de la demi-vie, pas du débit." },
  { cat: 'Perfusion & doses', type: 'num', unit: 'mg/L', answer: 2.5, tol: 0.02,
    q: "Doses répétées : 100 mg toutes les 8 h, CL = 5 L/h. Quelle est la Css moyenne ?",
    explain: "Css,moy = Dose / (CL · τ) = 100 / (5 × 8) = 2,5 mg/L." },
  { cat: 'Perfusion & doses', type: 'num', unit: '', answer: 1.82, tol: 0.05,
    q: "Bolus répétés, ke = 0,10 /h, intervalle τ = 8 h. Quel est le ratio d'accumulation Rac = 1/(1 − e^(−ke·τ)) ?",
    explain: "e^(−0,10×8) = e^(−0,8) ≈ 0,449 ; Rac = 1/(1 − 0,449) ≈ 1,82." },
  { cat: 'Perfusion & doses', type: 'mcq', correct: 2,
    q: "Une dose de charge sert surtout à…",
    options: ["diminuer la Css finale", "changer la demi-vie", "atteindre plus vite la fenêtre thérapeutique"],
    explain: "La dose de charge amène tout de suite dans la fenêtre ; l'entretien maintient la Css." },

  // ── Covariables ──
  { cat: 'Covariables', type: 'num', unit: 'L/h', answer: 2.97, tol: 0.05,
    q: "Allométrie : CL₇₀ = 5 L/h (patient de 70 kg). Quelle CL pour un enfant de 35 kg (exposant 0,75) ?",
    explain: "CL = 5 · (35/70)^0,75 = 5 · 0,5^0,75 ≈ 5 × 0,595 ≈ 2,97 L/h. Un enfant n'est pas un petit adulte." },
  { cat: 'Covariables', type: 'mcq', correct: 0,
    q: "Centrer le poids à 70 kg dans le modèle permet surtout de…",
    options: ["garder le paramètre typique interprétable", "rendre tous les patients à 70 kg", "supprimer les diagnostics"],
    explain: "Le centrage fait de CL₇₀ la clairance du patient de référence et décorrèle θ de l'effet covariable." },

  // ── PK/PD ──
  { cat: 'PK/PD', type: 'mcq', correct: 0,
    q: "L'EC50 est la concentration qui produit…",
    options: ["la moitié de l'effet maximal (Emax)", "un effet nul", "le double de l'effet de base"],
    explain: "EC50 = concentration donnant ½ Emax. Mal estimée si les données ne couvrent que 20–80 % de l'effet." },
  { cat: 'PK/PD', type: 'mcq', correct: 0,
    q: "Un pic d'effet qui survient APRÈS le pic plasmatique évoque…",
    options: ["un compartiment d'effet / une hystérèse", "une erreur de dosage", "une cinétique d'ordre 0"],
    explain: "Le décalage (modèle de Sheiner, ke0) crée une boucle d'hystérèse effet–concentration." },

  // ── Bayésien & diagnostics ──
  { cat: 'Bayésien & diagnostics', type: 'mcq', correct: 1,
    q: "Sur une VPC, les observations sortent nettement des bandes simulées. Cela signifie…",
    options: ["le modèle est validé", "le modèle ne reproduit pas les données (à revoir)", "il faut plus de patients seulement"],
    explain: "Si les percentiles observés sortent des tunnels simulés, le modèle ne peut pas simuler correctement — il faut le réviser." },
  { cat: 'Bayésien & diagnostics', type: 'mcq', correct: 0,
    q: "Un shrinkage élevé (> 30 %) sur les EBE implique que…",
    options: ["les diagnostics graphiques basés sur les EBE peuvent tromper", "le modèle est forcément excellent", "la dose doit être doublée"],
    explain: "Fort shrinkage = EBE tirés vers la population (données pauvres) ; s'appuyer plutôt sur la VPC et les résidus de population." }
];

export const exerciseCategories = [
  'Paramètres PK', 'Cinétique', 'Perfusion & doses', 'Covariables', 'PK/PD', 'Bayésien & diagnostics'
];
