// @ts-nocheck
// An editorial triage tool, not a claim of independent human scientific review.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { guidedActivities } from '../src/lib/content/guidedActivities.js';
import { choiceRationales } from '../src/lib/learning/choiceRationales.js';
import { quizRationales } from '../src/lib/learning/quizRationales.js';

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
      for (const sentence of plain.split(/(?<=[.!?])\s+(?=[A-ZÀ-Ü])/u)) {
        if (words(sentence) >= 42) add('long-sentence', file, lang, words(sentence), sentence);
      }
    }
    const highJargon = (main.match(/\b(?:asymptotique|hétéroscédasticité|régularisation|décorrélation|mécaniste|calibr(?:ation|ée)|transportabilité|shrinkage|likelihood|regularization|decorrelation)\b/gi) ?? []).length;
    tags.push({ file, lang, paragraphs: paragraphs.length, highJargon });
  }
}

const chapterIndex = JSON.parse(readFileSync(new URL('../src/lib/content/chapterIndex.generated.json', import.meta.url), 'utf8'));
let courseQuizTotal = 0;
let courseQuizExplained = 0;
for (const chapter of chapterIndex) {
  const frQuiz = chapter.quiz ?? [];
  const enQuiz = chapter.translations?.en?.quiz ?? [];
  assert.equal(frQuiz.length, enQuiz.length, `FR/EN quiz count differs: ${chapter.slug}`);
  courseQuizTotal += frQuiz.length;
  const explanations = quizRationales[chapter.slug] ?? [];
  assert.equal(frQuiz.length, explanations.length,
    `Missing question-specific, bilingual explanations: ${chapter.slug}`);
  for (let i = 0; i < frQuiz.length; i++) assert.equal(frQuiz[i].correct, enQuiz[i].correct,
    `Answer key differs between FR and EN: ${chapter.slug}/${i}`);
  if (explanations.length) assert.equal(explanations.length, frQuiz.length,
    `Per-question explanation count differs: ${chapter.slug}`);
  for (let i = 0; i < frQuiz.length; i++) {
    for (const q of [frQuiz[i], enQuiz[i]]) assert(Number.isInteger(q.correct) && q.options?.[q.correct],
      `Invalid course quiz answer: ${chapter.slug}/${i}`);
    if (explanations[i]) {
      courseQuizExplained++;
      for (const lang of ['fr', 'en']) assert(explanations[i][lang]?.length >= 35,
        `Course quiz needs a meaningful ${lang} explanation: ${chapter.slug}/${i}`);
    }
  }
}
for (const slug of Object.keys(quizRationales)) assert(chapterIndex.some(c => c.slug === slug),
  `Explanation references unknown chapter: ${slug}`);
assert.equal(courseQuizTotal, 282, 'Unexpected number of chapter quiz questions');
assert.equal(courseQuizExplained, courseQuizTotal, 'All course questions must have individual bilingual explanations');
const ratio = x => (1 + x) / Math.sqrt(1 + x*x);
const absoluteGap = x => 1 + x - Math.sqrt(1 + x*x);
assert(Math.abs(ratio(1) - Math.SQRT2) < 1e-12);
assert(ratio(1) > ratio(10) && ratio(1) > ratio(0.1), 'Maximal relative combined error ratio occurs at a = b*f');
assert(absoluteGap(10) > absoluteGap(1), 'Do not confuse maximum relative gap with absolute error gap');
const vpc = chapterIndex.find(ch => ch.slug === 'validation-vpc');
assert(vpc.quiz[2].options[0].includes('comparer plusieurs diagnostics'), 'VPC distractor must be a sound practice, not another pitfall');
console.log(`Course quizzes: ${courseQuizTotal} questions, all with individual FR/EN explanations; scientific distractor checks passed.`);

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
