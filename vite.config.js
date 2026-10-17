import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { getSiteOrigin } from './site.config.js';
// @ts-expect-error Node types are not installed in this browser-focused project.
import process from 'node:process';

export default defineConfig(({ mode }) => {
	process.env.PUBLIC_SITE_ORIGIN = getSiteOrigin(mode);

	return {
		plugins: [
			sveltekit({
				adapter: adapter({ fallback: '404.html' }),
				paths: {
					// Allows GitHub Pages deployment (set BASE_PATH=/repo-name in CI)
					base: process.env.BASE_PATH || ''
				},
				prerender: {
					// Les URLs de chapitres sont dérivées automatiquement via la fonction
					// `entries` de src/routes/chapitres/[slug]/+page.js — plus besoin de les
					// lister ici à la main. `*` fait explorer les liens statiques restants.
					entries: ['*'],

					handleHttpError: ({ status, path }) => {
						if (status === 404 && path.startsWith('/slides/')) return;

						throw new Error(`Failed to prerender ${path}: ${status}`);
					}
				}
			})
		]
	};
});
