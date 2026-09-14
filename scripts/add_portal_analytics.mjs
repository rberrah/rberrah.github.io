import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const target = path.resolve(process.argv[2] || 'dist');
await mkdir(path.join(target, 'assets'), { recursive: true });
await cp('src/lib/analytics.js', path.join(target, 'assets/analytics.js'));

async function inject(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === 'pharmacometrie') continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { await inject(file); continue; }
    if (entry.name !== 'index.html') continue; // No counter on redirects/404s.
    let html = await readFile(file, 'utf8');
    if (html.includes('http-equiv="refresh"') || html.includes('data-portal-analytics')) continue;
    const relative = path.relative(target, directory).split(path.sep).join('/');
    const route = relative ? `/${relative}/` : '/';
    const snippet = `<script type="module" data-portal-analytics>import { countPage } from '/assets/analytics.js'; countPage(${JSON.stringify(route)});</script>`;
    html = html.replace('</head>', `${snippet}\n</head>`);
    html = html.replace('</footer>', '<p><a href="/pharmacometrie/confidentialite/">Confidentialité / Privacy</a></p>\n</footer>');
    await writeFile(file, html);
    console.log(`GoatCounter portal: ${route}`);
  }
}
await inject(target);
