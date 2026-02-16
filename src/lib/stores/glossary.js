import { readable } from 'svelte/store';

const items = [
  { term: 'CL', def: 'Clairance, volume de plasma épuré par unité de temps.' },
  { term: 'V', def: 'Volume de distribution.' },
  { term: 'Q', def: 'Clairance inter-compartimentale (échanges entre V1 et V2).' },
  { term: 'Ka', def: "Constante d'absorption." },
  { term: 'IIV', def: 'Variabilité inter-individuelle (effets aléatoires η).' },
  { term: 'IOV', def: 'Variabilité inter-occasion (κ).' },
  { term: 'σ', def: 'Erreur résiduelle (additive, proportionnelle, mixte).' },
  { term: 'OFV', def: "Objective Function Value, liée au -2 log-likelihood." },
  { term: 'VPC', def: 'Visual Predictive Check.' },
  { term: 'EBE', def: 'Empirical Bayes Estimate (paramètre individuel a posteriori).' },
  { term: 'Shrinkage', def: "Tendance des EBEs à revenir vers la moyenne quand l'information est faible." },
  { term: 'SAEM', def: 'Stochastic Approximation EM, algorithme de maximisation de vraisemblance.' }
];

export const glossary = readable(items);
