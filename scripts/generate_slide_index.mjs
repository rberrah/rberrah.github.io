// Simple placeholder generator: copies existing slide_index.json if PPTX parsing not available.
// Extend later with real PPTX XML parsing.
import fs from 'fs';
import path from 'path';

const out = path.join('src', 'content', 'slide_index.json');
if (!fs.existsSync(out)) {
  const arr = Array.from({ length: 74 }, (_, i) => ({ slide: i + 1, title: '' }));
  fs.writeFileSync(out, JSON.stringify(arr, null, 2));
  console.log('slide_index.json créé (titre vide).');
} else {
  console.log('slide_index.json existe déjà, pas de modification.');
}
