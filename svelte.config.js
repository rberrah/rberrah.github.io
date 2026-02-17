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
			entries: [
				'*',
				'/chapitres',
				'/chapitres/intro-pkpd',
				'/chapitres/trois-approches',
				'/chapitres/modele-compartimental',
				'/chapitres/absorption-orale',
				'/chapitres/variabilite-iiv-iov',
				'/chapitres/allometrie',
				'/chapitres/validation-vpc',
				'/chapitres/pkpd',
				'/chapitres/outils-estimation',
				'/chapitres/bayes-ebes',
				'/chapitres/neural-ode',
				'/chapitres/tdm'
			],
			handleHttpError: ({ status, path }) => {
				if (status === 404 && path.startsWith('/slides/')) return;
				throw new Error(`Failed to prerender ${path}: ${status}`);
			}
		}
	}
};

export default config;
