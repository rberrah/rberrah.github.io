// @ts-nocheck
// Lightweight validation helpers (no external deps)

export function validateChapter(ch) {
  const required = ['slug', 'title', 'tag', 'summary'];
  for (const key of required) {
    if (!ch[key]) throw new Error(`Champ manquant dans ${ch.slug || '??'} : ${key}`);
  }
  if (!Array.isArray(ch.slides)) throw new Error(`${ch.slug}: slides doit être un tableau`);
  if (ch.quiz && !Array.isArray(ch.quiz)) throw new Error(`${ch.slug}: quiz doit être un tableau`);
}

export function validateSlidesMapping(chapters) {
  const seen = new Map();
  for (const ch of chapters) {
    for (const s of ch.slides || []) {
      if (seen.has(s)) {
        throw new Error(`Slide ${s} dupliquée entre ${seen.get(s)} et ${ch.slug}`);
      }
      seen.set(s, ch.slug);
    }
  }
}
