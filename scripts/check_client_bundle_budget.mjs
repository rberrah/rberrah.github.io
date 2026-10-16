#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve('.svelte-kit/output/client/_app/immutable');
const budgets = {
  chunks: Number(process.env.PMX_MAX_SHARED_CHUNK_BYTES ?? 600_000),
  nodes: Number(process.env.PMX_MAX_ROUTE_NODE_BYTES ?? 1_150_000),
  entry: Number(process.env.PMX_MAX_ENTRY_BYTES ?? 250_000)
};

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const files = walk(root)
  .filter((file) => file.endsWith('.js'))
  .map((file) => ({
    file: path.relative(root, file).replaceAll('\\', '/'),
    bytes: statSync(file).size
  }))
  .sort((a, b) => b.bytes - a.bytes);

assert(files.length > 0, 'No PMx client JavaScript chunks found after build');

const groups = {
  chunks: files.filter(({ file }) => file.startsWith('chunks/')),
  nodes: files.filter(({ file }) => file.startsWith('nodes/')),
  entry: files.filter(({ file }) => file.startsWith('entry/'))
};

for (const [kind, limit] of Object.entries(budgets)) {
  const rows = groups[kind];
  assert(rows.length > 0, `No PMx client ${kind} JavaScript found after build`);
  const largest = rows[0];
  console.log(`PMx ${kind} budget: largest ${(largest.bytes / 1000).toFixed(1)} kB / ${(limit / 1000).toFixed(0)} kB — ${largest.file}`);
  assert(
    largest.bytes <= limit,
    `PMx client ${kind} budget exceeded: ${largest.file} is ${largest.bytes} bytes (> ${limit}). Keep shared code below the budget and route-specific corpora isolated.`
  );
}

console.log(
  'Largest PMx client JS assets:\n' +
  files.slice(0, 10).map(({ file, bytes }) => `${(bytes / 1000).toFixed(1)} kB  ${file}`).join('\n')
);
