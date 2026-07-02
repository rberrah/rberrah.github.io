// Synchronise slide_catalog.json depuis slide_catalog.yaml (source de vérité).
// À lancer après toute édition du YAML : `npm run slides:catalog`.
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const dir = path.join('src', 'content', 'slides');
const yamlPath = path.join(dir, 'slide_catalog.yaml');
const jsonPath = path.join(dir, 'slide_catalog.json');

const data = yaml.load(fs.readFileSync(yamlPath, 'utf8'));
if (!Array.isArray(data)) {
  console.error('slide_catalog.yaml doit contenir une liste.');
  process.exit(1);
}
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n');
console.log(`slide_catalog.json synchronisé : ${data.length} slides.`);
