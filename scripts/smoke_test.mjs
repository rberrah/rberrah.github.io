// Smoke tests « contenu » exécutables sans navigateur (node scripts/smoke_test.mjs).
// Vérifie : résolution des viz, parité FR/EN, unicité des slugs, validité des parcours,
// intégrité + bilinguisme des exercices, RECALCUL des réponses numériques, et références.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chaptersDir = path.join(root, 'src', 'content', 'chapters');
const vizDir = path.join(root, 'src', 'lib', 'components', 'visualizations');

let failures = 0;
const fail = (/** @type {string} */ m) => { console.error('  ✗ ' + m); failures++; };
const ok = (/** @type {string} */ m) => console.log('  ✓ ' + m);

// ── utilitaires ──
const frFiles = fs.readdirSync(chaptersDir).filter((f) => f.endsWith('.md') && !f.startsWith('_'));
/** @param {string} raw */
const field = (raw, key) => (raw.match(new RegExp(`${key}:\\s*"([^"]+)"`)) || [])[1];

/** Alias d'un composant viz (réplique vizRegistry.js). @param {string} stem */
function aliases(stem) {
  const s = new Set([stem]);
  const noPrefix = stem.replace(/^\d+[_-]/, '');
  s.add(noPrefix);
  const noExplorer = noPrefix.replace(/Explorer$/, '');
  if (noExplorer) s.add(noExplorer);
  return [...s];
}

// ── 1. Résolution des visualisations ──
const vizKeys = new Set();
for (const f of fs.readdirSync(vizDir).filter((f) => f.endsWith('.svelte'))) {
  for (const k of aliases(f.replace(/\.svelte$/, ''))) vizKeys.add(k);
}
let vizRefs = 0, vizBad = 0;
for (const f of frFiles) {
  const raw = fs.readFileSync(path.join(chaptersDir, f), 'utf8');
  for (const m of raw.matchAll(/viz="([^"]+)"/g)) {
    vizRefs++;
    if (!vizKeys.has(m[1])) { fail(`viz introuvable "${m[1]}" dans ${f}`); vizBad++; }
  }
}
if (!vizBad) ok(`${vizRefs} références viz résolvent toutes (${vizKeys.size} clés)`);

// ── 2. Parité FR/EN + 3. unicité des slugs + 4. parcours valides ──
const { tracks } = await import(new URL('../src/lib/content/tracks.js', import.meta.url));
const trackIds = new Set(tracks.map((/** @type {any} */ t) => t.id));
const slugs = new Set();
let parityBad = 0;
for (const f of frFiles) {
  const raw = fs.readFileSync(path.join(chaptersDir, f), 'utf8');
  const slug = field(raw, 'slug');
  const track = field(raw, 'track') || 'core';
  if (slug) { if (slugs.has(slug)) fail(`slug dupliqué : ${slug}`); slugs.add(slug); }
  if (!trackIds.has(track)) fail(`track inconnu "${track}" dans ${f}`);
  if (!fs.existsSync(path.join(chaptersDir, 'en', f))) { fail(`traduction EN manquante : ${f}`); parityBad++; }
}
if (!parityBad) ok(`parité FR/EN complète (${frFiles.length} chapitres)`);
ok(`${slugs.size} slugs uniques, ${trackIds.size} parcours`);

// ── 5. Exercices : intégrité, bilinguisme, chapitre résolu ──
const { exercises } = await import(new URL('../src/lib/content/exercises.js', import.meta.url));
let exBad = 0;
for (const [i, e] of exercises.entries()) {
  const tag = `exercice #${i} (${e.chapter})`;
  if (!slugs.has(e.chapter)) { fail(`${tag} : chapitre inconnu`); exBad++; }
  if (e.type === 'mcq') {
    if (!Array.isArray(e.options) || e.options.length < 2) { fail(`${tag} : options invalides`); exBad++; }
    else if (!(e.correct >= 0 && e.correct < e.options.length)) { fail(`${tag} : index correct hors bornes`); exBad++; }
  } else if (e.type === 'num') {
    if (!Number.isFinite(e.answer) || !(e.tol > 0)) { fail(`${tag} : answer/tol invalides`); exBad++; }
  }
  if (!e.en || !e.en.q || !e.en.explain) { fail(`${tag} : traduction EN manquante`); exBad++; }
  else if (e.type === 'mcq' && e.en.options && e.en.options.length !== e.options.length) { fail(`${tag} : options EN de longueur différente`); exBad++; }
}
if (!exBad) ok(`${exercises.length} exercices : structure + bilinguisme OK`);

// ── 5b. RECALCUL indépendant des réponses numériques (accuracy) ──
const LN2 = Math.log(2);
/** @type {{find:string, expect:number}[]} */
const checks = [
  { find: 'pente de −0,20', expect: LN2 / 0.2 },
  { find: 'C₀ = 2 mg/L', expect: 10 / 2 },
  { find: 'ke = 0,20 /h et Vd = 5 L', expect: 0.2 * 5 },
  { find: 'CL = 6 L/h et V = 30 L', expect: (LN2 * 30) / 6 },
  { find: 'R₀ = 30 mg/h', expect: 30 / 5 },
  { find: '100 mg toutes les 8 h', expect: 100 / (5 * 8) },
  { find: "ratio d'accumulation", expect: 1 / (1 - Math.exp(-0.8)) },
  { find: 'enfant de 35 kg', expect: 5 * Math.pow(0.5, 0.75) },
  { find: 'A₀ = 100 mg', expect: 100 * Math.exp(-1) },
  { find: 'borne haute', expect: 5 + 1.96 * 0.5 },
  { find: 'EC50 = 2 mg/L', expect: (100 * 6) / (2 + 6) },
  { find: 'ke0 = 0,35', expect: LN2 / 0.35 },
  { find: 'Trapèze', expect: ((8 + 4) / 2) * 2 },
  { find: 'AUC₀–last = 90', expect: 90 + 2 / 0.2 },
  { find: 'Dose IV de 200 mg', expect: 200 / 40 },
  { find: 'quel est le volume Vz', expect: 5 / 0.1 },
  { find: 'AUC_orale = 40', expect: 40 / 80 },
  { find: 'fa = 0,9', expect: 0.9 * 0.9 * 0.5 },
  { find: 'Qh = 90 L/h', expect: (90 * 30) / (90 + 30) },
  { find: 'AUC₂₄ = 400', expect: 400 / 2 },
  { find: 'Vancomycine 2000', expect: 2000 / 4 },
  { find: 'estimé à 5 L/h avec SE = 0,5', expect: (0.5 / 5) * 100 },
  { find: 'SD(η̂) = 0,21', expect: (1 - 0.21 / 0.3) * 100 }
];
let numBad = 0;
for (const c of checks) {
  const e = exercises.find((/** @type {any} */ x) => x.type === 'num' && x.q.includes(c.find));
  if (!e) { fail(`recalcul : exercice introuvable ("${c.find}")`); numBad++; continue; }
  const tol = e.tol * Math.abs(e.answer) + 1e-9;
  if (Math.abs(e.answer - c.expect) > tol) { fail(`recalcul faux ("${c.find}") : stocké ${e.answer}, calculé ${c.expect.toFixed(3)}`); numBad++; }
}
if (!numBad) ok(`${checks.length} réponses numériques recalculées et confirmées`);

// ── 5c. Prérequis résolus + descriptions d'animations ──
let prereqBad = 0;
for (const f of frFiles) {
  const raw = fs.readFileSync(path.join(chaptersDir, f), 'utf8');
  const m = raw.match(/prerequisites:\s*\[([^\]]*)\]/);
  if (!m) continue;
  for (const s of m[1].split(',').map((x) => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean)) {
    if (!slugs.has(s)) { fail(`prérequis inconnu "${s}" dans ${f}`); prereqBad++; }
  }
}
if (!prereqBad) ok('prérequis des chapitres tous résolus');

const { describeViz } = await import(new URL('../src/lib/content/vizDescriptions.js', import.meta.url));
const usedViz = new Set();
for (const f of frFiles) {
  const raw = fs.readFileSync(path.join(chaptersDir, f), 'utf8');
  for (const m of raw.matchAll(/viz="([^"]+)"/g)) usedViz.add(m[1]);
}
let descBad = 0;
for (const v of usedViz) if (!describeViz(v, 'fr') || !describeViz(v, 'en')) { fail(`animation sans description : ${v}`); descBad++; }
if (!descBad) ok(`${usedViz.size} animations utilisées ont toutes une description (FR+EN)`);

// ── 6. Références ──
const { referenceGroups } = await import(new URL('../src/lib/content/references.js', import.meta.url));
let refCount = 0, refBad = 0;
for (const g of referenceGroups) for (const r of g.items) {
  refCount++;
  if (!r.title) { fail(`référence sans titre (groupe ${g.id})`); refBad++; }
  if (!/^https?:\/\//.test(r.url || '')) { fail(`URL invalide : ${r.title}`); refBad++; }
}
if (!refBad) ok(`${refCount} références avec liens valides (${referenceGroups.length} thèmes)`);

// ── Bilan ──
if (failures) { console.error(`\nSMOKE TEST ÉCHOUÉ : ${failures} problème(s).`); process.exit(1); }
console.log('\nSmoke tests OK : contenu cohérent, exactitude numérique vérifiée.');
