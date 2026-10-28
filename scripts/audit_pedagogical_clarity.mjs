// @ts-nocheck
// An editorial triage tool, not a claim of independent human scientific review.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { guidedActivities } from '../src/lib/content/guidedActivities.js';
import { choiceRationales } from '../src/lib/learning/choiceRationales.js';

const root = new URL('../src/content/chapters/', import.meta.url);
const files = readdirSync(root).filter(name => name.endsWith('.md') && !name.startsWith('_')).sort();
const tags = [];
const findings = [];
const add = (kind, id, lang, words, value) => findings.push({ kind, id, lang, words, value: value.replace(/\s+/g, ' ').slice(0, 170) });
const words = s => s.trim().split(/\s+/).filter(Boolean).length;

for (const file of files) {
  for (const lang of ['fr', 'en']) {
    const raw = readFileSync(new URL(lang === 'fr' ? file : `en/${file}`, root), 'utf8');
    const main = raw.replace(/^---[\s\S]*?---/, '')
      .replace(/```[\s\S]*?```/g, '').replace(/\$\$[\s\S]*?\$\$/g, '')
      .replace(/<!--[^]*?-->/g, '').replace(/^\s*[-*#>|].*$/gm, '');
    const paragraphs = main.split(/\n\s*\n/g).filter(p => p.trim());
    for (const paragraph of paragraphs) {
      const plain = paragraph.replace(/\[[^\]]+\]\([^)]*\)/g, 'lien').replace(/[\*_~`]/g, ' ').trim();
      if (words(plain) >= 80) add('long-paragraph', file, lang, words(plain), plain);
    }
    const highJargon = (main.match(/\b(?:asymptotique|hétéroscédasticité|régularisation|décorrélation|mécaniste|calibr(?:ation|ée)|transportabilité|shrinkage|likelihood|regularization|decorrelation)\b/gi) ?? []).length;
    tags.push({ file, lang, paragraphs: paragraphs.length, highJargon });
  }
}

const seen = new Set();
for (const activity of guidedActivities) {
  for (const step of activity.steps) {
    for (const lang of ['fr', 'en']) {
      for (const key of ['prompt', 'correction']) {
        const v = step[key]?.[lang] ?? '';
        if (words(v) >= (key === 'prompt' ? 36 : 46)) add('long-' + key, activity.id + '/' + step.id, lang, words(v), v);
      }
    }
    if (step.type === 'select') {
      seen.add(activity.id + '/' + step.id);
      const rationales = choiceRationales[activity.id]?.[step.id];
      assert.equal(rationales?.length, step.options.length, `Missing rationale for ${activity.id}/${step.id}`);
      for (let i = 0; i < rationales.length; i++) for (const lang of ['fr', 'en']) {
        const phrase = rationales[i][lang];
        assert(phrase && !/^(Oui|Non|Yes|No)\s*:/i.test(phrase), `Redundant verdict in ${activity.id}/${step.id}`);
        if (words(phrase) >= 32) add('long-option', activity.id + '/' + step.id + '/' + i, lang, words(phrase), phrase);
      }
    }
  }
}
const source = readFileSync(new URL('../src/lib/components/ui/CaseExercise.svelte', import.meta.url), 'utf8');
assert(source.includes('Réponse incorrecte.'), 'Incorrect answers need a short, clear error message');
assert(!source.includes('Ce résultat ne respecte pas encore les conditions de l’exercice'), 'Obsolete generic feedback resurfaced');

const stats = findings.reduce((o, item) => {o[item.kind] = (o[item.kind] ?? 0) + 1; return o;}, {});
console.log(`Pedagogical style scan: ${files.length} FR + ${files.length} EN chapters; ${guidedActivities.length} activities, ${guidedActivities.reduce((n,a)=>n+a.steps.length,0)} steps, ${seen.size} multiselect corrections.`);
console.log('Editorial warnings (not errors):', JSON.stringify(stats));
for (const x of findings.filter(x => x.kind === 'long-correction')) console.log(`[guided-correction-review] ${x.id} ${x.lang} (${x.words} words): ${x.value}`);
for (const x of findings.sort((a,b) => b.words-a.words).slice(0,12)) console.log(`[editorial] ${x.kind} ${x.id} ${x.lang} (${x.words} words): ${x.value}`);
console.log('Highest technical-term density:', tags.sort((a,b)=>b.highJargon-a.highJargon).slice(0,8).map(t=>`${t.file}/${t.lang}: ${t.highJargon}`).join(', '));
console.log('Warnings are triage signals. They are not proof of scientific error, learner comprehension or human review.');
