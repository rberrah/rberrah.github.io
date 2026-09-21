import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { getSiteOrigin, SITE_ORIGIN_TOKEN } from '../site.config.js';

const port = Number(process.argv[2] || 4181);
const appOnly = process.argv.includes('--app-only');
const publicOrigin = getSiteOrigin();
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.xml': 'application/xml',
  '.woff2': 'font/woff2', '.txt': 'text/plain', '.ico': 'image/x-icon', '.webp': 'image/webp' };

// Local preview only. Mirrors Pages' portal/app mount without modifying the build.
createServer(async (request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); }
  catch { response.writeHead(400).end(); return; }
  if (/^\/(internat|stats)(\/|$)/.test(pathname)) {
    response.writeHead(302, { Location: publicOrigin + url.pathname + url.search }).end();
    return;
  }
  const prefixedApp = pathname === '/pharmacometrie' || pathname.startsWith('/pharmacometrie/');
  const app = appOnly || prefixedApp;
  const root = path.resolve(app ? 'build' : 'portal');
  const relative = prefixedApp
    ? pathname.slice('/pharmacometrie'.length)
    : pathname;
  let file = path.resolve(root, '.' + relative);
  if (file !== root && !file.startsWith(root + path.sep)) {
    response.writeHead(403).end(); return;
  }
  try {
    if ((await stat(file)).isDirectory()) {
      if (!pathname.endsWith('/')) {
        response.writeHead(301, { Location: url.pathname + '/' + url.search }).end(); return;
      }
      file = path.join(file, 'index.html');
    }
    let body = await readFile(file);
    if (!app && ['.html', '.xml', '.txt'].includes(path.extname(file))) {
      body = Buffer.from(body.toString('utf8').replaceAll(SITE_ORIGIN_TOKEN, publicOrigin));
    }
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store' }).end(body);
  } catch {
    const fallback = appOnly ? 'build/404.html' : 'portal/404.html';
    const body = (await readFile(fallback, 'utf8')).replaceAll(SITE_ORIGIN_TOKEN, publicOrigin);
    response.writeHead(404, { 'Content-Type': types['.html'] }).end(body);
  }
}).listen(port, '127.0.0.1', () => console.log(`${appOnly ? 'App' : 'Portal'} preview: http://127.0.0.1:${port}`))
  .on('error', error => { console.error(error.message); process.exit(1); });
