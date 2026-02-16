import { makeRng } from './random';

/**
 * Génère des profils individuels avec IIV/IOV + erreur résiduelle.
 * @param {Object} params
 * @param {number} params.n individus
 * @param {number[]} params.times
 * @param {(t:number)=>number} params.structFn retourne IPRED
 * @param {number} params.omega IIV log-norm
 * @param {number} params.kappa IOV log-norm
 * @param {number} params.sigmaProp erreur proportionnelle
 * @param {number} params.sigmaAdd erreur additive
 * @param {number} params.seed
 */
export function generateProfiles({
  n,
  times,
  structFn,
  omega = 0.3,
  kappa = 0,
  sigmaProp = 0.1,
  sigmaAdd = 0,
  seed = 1
}) {
  const rng = makeRng(seed);
  const profiles = [];
  for (let i = 0; i < n; i++) {
    const eta = omega * (rng() - 0.5) * 2; // approx small
    const kappaVal = kappa * (rng() - 0.5) * 2;
    const iovFactor = Math.exp(kappaVal);
    const indiv = times.map((t) => {
      const ipred = structFn(t) * Math.exp(eta) * iovFactor;
      const dv = ipred * (1 + sigmaProp * (rng() - 0.5) * 2) + sigmaAdd * (rng() - 0.5) * 2;
      return { t, ipred: Math.max(0, ipred), dv: Math.max(0, dv) };
    });
    profiles.push(indiv);
  }
  return profiles;
}
