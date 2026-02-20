import { readable } from 'svelte/store';

const items = [
  { term: 'CL', def: 'Clearance; plasma volume cleared per unit time.' },
  { term: 'V', def: 'Volume of distribution.' },
  { term: 'Q', def: 'Inter-compartmental clearance (exchange between V1 and V2).' },
  { term: 'Ka', def: 'Absorption rate constant.' },
  { term: 'IIV', def: 'Inter-individual variability (random effects η).' },
  { term: 'IOV', def: 'Inter-occasion variability (κ).' },
  { term: 'σ', def: 'Residual error (additive, proportional, mixed).' },
  { term: 'OFV', def: 'Objective Function Value, related to -2 log-likelihood.' },
  { term: 'VPC', def: 'Visual Predictive Check.' },
  { term: 'EBE', def: 'Empirical Bayes Estimate (a posteriori individual parameter).' },
  { term: 'Shrinkage', def: 'EBEs pulled toward the mean when information is weak.' },
  { term: 'SAEM', def: 'Stochastic Approximation EM, likelihood maximization algorithm.' }
];

export const glossary = readable(items);
