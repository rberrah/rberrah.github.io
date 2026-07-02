import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	trailingSlash: 'always',
	kit: {
		adapter: adapter({
			fallback: '404.html'
		}),
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
	}
};

export default config;
