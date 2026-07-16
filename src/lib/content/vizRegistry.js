// @ts-nocheck
// Registre AUTOMATIQUE des visualisations.
// -----------------------------------------------------------------------------
// Tout composant `.svelte` déposé dans `src/lib/components/visualizations/`
// est enregistré ici sans aucune autre modification de code. Pour l'utiliser
// dans un chapitre, il suffit d'écrire `viz="<clé>"` dans un bloc `step`.
//
// Chaque fichier génère plusieurs clés (alias) pointant vers le même composant,
// afin de rester tolérant sur la façon de le nommer côté Markdown :
//
//   09_PK1C.svelte            -> "09_PK1C", "PK1C"
//   IVBolusExplorer.svelte    -> "IVBolusExplorer", "IVBolus"
//   14_AllometryCentering.svelte -> "14_AllometryCentering", "AllometryCentering"
//
// Cela couvre l'historique (`viz="09_PK1C"`, `viz="IVBolus"`, ...) tout en
// autorisant des noms plus courts pour les nouveaux chapitres.

const modules = import.meta.glob('../components/visualizations/*.svelte', { eager: true });

/** @type {Record<string, any>} */
const registry = {};

/** @type {Array<{file:string, keys:string[]}>} */
const manifest = [];

/**
 * Dérive les alias d'un nom de fichier.
 * @param {string} stem  nom de fichier sans extension, ex. "14_AllometryCentering"
 * @returns {string[]}
 */
function aliasesFor(stem) {
  const keys = new Set();
  keys.add(stem); // ex. "14_AllometryCentering"

  const noPrefix = stem.replace(/^\d+[_-]/, ''); // "AllometryCentering"
  keys.add(noPrefix);

  const noExplorer = noPrefix.replace(/Explorer$/, ''); // "IVBolus", "OralAbsorption"
  if (noExplorer) keys.add(noExplorer);

  return [...keys];
}

// 1) Recenser quels ALIAS COURTS sont produits par plusieurs fichiers.
//    Ex. 13_ResidualError.svelte et 61_ResidualError.svelte donnent tous deux "ResidualError".
//    Résoudre un tel alias vers « le dernier chargé » afficherait silencieusement la mauvaise
//    figure. On préfère le rendre NON résolvable : le smoke test signale alors un viz introuvable.
const stems = Object.keys(modules).map((p) => p.split('/').pop().replace(/\.svelte$/, ''));
const shortAliasCount = {};
for (const stem of stems) {
  for (const key of aliasesFor(stem)) {
    if (key !== stem) shortAliasCount[key] = (shortAliasCount[key] || 0) + 1;
  }
}
const ambiguous = new Set(Object.keys(shortAliasCount).filter((k) => shortAliasCount[k] > 1));

for (const [path, mod] of Object.entries(modules)) {
  const stem = path.split('/').pop().replace(/\.svelte$/, '');
  const component = mod.default ?? mod;
  const keys = aliasesFor(stem).filter((key) => key === stem || !ambiguous.has(key));
  for (const key of keys) {
    // Le nom de fichier complet a toujours priorité en cas de collision d'alias.
    if (!(key in registry) || key === stem) registry[key] = component;
  }
  manifest.push({ file: `${stem}.svelte`, keys });
}

/** Toutes les clés disponibles, triées — pratique pour les messages d'aide. */
export const availableVizKeys = Object.keys(registry).sort();

/** Détail fichier -> alias, utile pour la doc et le débogage. */
export const vizManifest = manifest.sort((a, b) => a.file.localeCompare(b.file));

/**
 * Récupère un composant de visualisation par clé (nom de fichier ou alias).
 * @param {string | undefined | null} key
 * @returns {any | null}
 */
export function getViz(key) {
  if (!key) return null;
  return registry[key] ?? null;
}

export default registry;
