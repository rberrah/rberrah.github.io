import { loadEnv } from 'vite';
// @ts-expect-error Node types are not installed in this browser-focused project.
import process from 'node:process';

/** Resolve the same build-time public origin for Vite and Node scripts. */
export function getSiteOrigin(mode = 'production') {
  const value = loadEnv(mode, process.cwd(), 'PUBLIC_').PUBLIC_SITE_ORIGIN || 'https://rberrah.github.io';
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password ||
      !/^\/+$/u.test(url.pathname) || url.search || url.hash) {
    throw new Error('PUBLIC_SITE_ORIGIN must be an HTTP(S) origin without credentials, path, query or fragment.');
  }
  return url.origin;
}

export const SITE_ORIGIN_TOKEN = '__SITE_ORIGIN__';
