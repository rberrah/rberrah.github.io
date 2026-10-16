// Minimal local HTTP server for the *assembled dist*, not PMx's raw build/.
// Only used by Playwright during deployment acceptance tests.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
const port = Number(process.argv[2] || 4183);
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.csv': 'text/csv', '.svg': 'image/svg+xml', '.txt': 'text/plain',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.png': 'image/png',
  '.webp': 'image/webp', '.xml': 'application/xml', '.ico': 'image/x-icon'
};
createServer(async (request, response) => {
  let name;
  try { name = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname); }
  catch { response.writeHead(400).end(); return; }
  const file = path.resolve(root, '.' + name);
  if (!file.startsWith(root + path.sep) && file !== root) {
    response.writeHead(403).end(); return;
  }
  try {
    const metadata = await stat(file);
    const target = metadata.isDirectory() ? path.join(file, 'index.html') : file;
    const data = await readFile(target);
    response.writeHead(200, {
      'Content-Type': types[path.extname(target)] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    }).end(data);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log('Assembled Pages preview: http://127.0.0.1:' + port);
});
