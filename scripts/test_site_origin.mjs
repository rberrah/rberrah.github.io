import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getSiteOrigin, SITE_ORIGIN_TOKEN } from '../site.config.js';
import { configureSiteOrigin } from './configure_site_origin.mjs';

test('origin normalisation and invalid origins', () => {
  const previous = process.env.PUBLIC_SITE_ORIGIN;
  try {
    for (const [input, expected] of [
      ['https://example.org/', 'https://example.org'],
      ['https://EXAMPLE.org:443///', 'https://example.org'],
      ['https://example.org:8443', 'https://example.org:8443'],
      ['http://localhost:4173/', 'http://localhost:4173']
    ]) {
      process.env.PUBLIC_SITE_ORIGIN = input;
      assert.equal(getSiteOrigin(), expected);
    }
    for (const input of ['not a URL', 'ftp://example.org', 'https://example.org/path',
      'https://person:password@example.org', 'https://example.org/?x=1', 'https://example.org/#fragment']) {
      process.env.PUBLIC_SITE_ORIGIN = input;
      assert.throws(() => getSiteOrigin(), input);
    }
  } finally {
    if (previous === undefined) delete process.env.PUBLIC_SITE_ORIGIN;
    else process.env.PUBLIC_SITE_ORIGIN = previous;
  }
});

test('portal tokens, generated counter configuration, idempotence and unchanged sources', async () => {
  await mkdir('test-results', { recursive: true });
  const directory = await mkdtemp(path.resolve('test-results/origin-'));
  const original = await readFile('portal/index.html', 'utf8');
  await cp('portal', directory, { recursive: true });
  const origin = 'https://pharmacology.example:8443';
  await configureSiteOrigin(directory, origin);
  for (const file of ['index.html', 'publications/index.html', 'citer/index.html', '404.html',
    'research/index.html', 'robots.txt', 'sitemap.xml', 'sitemap-index.xml']) {
    const text = await readFile(path.join(directory, file), 'utf8');
    assert.ok(!text.includes(SITE_ORIGIN_TOKEN), file);
    assert.ok(text.includes(origin), file);
  }
  assert.match(await readFile(path.join(directory, 'tools/index.html'), 'utf8'),
    /https:\/\/tdmhub.shinyapps.io\/TacDDI\//);
  assert.equal(await readFile(path.join(directory, 'assets/site-origin.js'), 'utf8'),
    `// Generated from PUBLIC_SITE_ORIGIN.\nexport const SITE_ORIGIN = ${JSON.stringify(origin)};\n`);
  const rendered = await readFile(path.join(directory, 'index.html'), 'utf8');
  await configureSiteOrigin(directory, origin);
  assert.equal(await readFile(path.join(directory, 'index.html'), 'utf8'), rendered);
  assert.equal(await readFile('portal/index.html', 'utf8'), original);
  await assert.rejects(configureSiteOrigin('portal'), /never the portal sources/);
  await assert.rejects(configureSiteOrigin(directory, 'https://different.example'), /Origin mismatch/);
});

test('a stale application build or a missing sitemap destination blocks assembly', async () => {
  await mkdir('test-results', { recursive: true });
  const directory = await mkdtemp(path.resolve('test-results/origin-mismatch-'));
  await cp('portal', directory, { recursive: true });
  const origin = 'https://pharmacology.example';
  const app = path.join(directory, 'pharmacometrie');
  await mkdir(app);
  await writeFile(path.join(app, 'sitemap.xml'), '<urlset><url><loc>https://old.example/pharmacometrie/</loc></url></urlset>');
  await assert.rejects(configureSiteOrigin(directory, origin), /Origin mismatch/);
  await writeFile(path.join(app, 'sitemap.xml'), `<urlset><url><loc>${origin}/pharmacometrie/missing/</loc></url></urlset>`);
  await assert.rejects(configureSiteOrigin(directory, origin), { code: 'ENOENT' });
});
