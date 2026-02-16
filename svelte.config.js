import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		paths: {
			// Allows GitHub Pages deployment (set BASE_PATH=/repo-name in CI)
			base: process.env.BASE_PATH || ''
		},
		prerender: {
			entries: [
				'*',
				'/chapitres/introduction-variabilite',
				'/chapitres/trois-approches',
				'/chapitres/nca',
				'/chapitres/modele-pk-mecanistique',
				'/chapitres/ode-compartiments',
				'/chapitres/workflow-identifiabilite',
				'/chapitres/adme-structural',
				'/chapitres/poppk-variabilite',
				'/chapitres/erreur-residuelle',
				'/chapitres/covariables',
				'/chapitres/validation-diagnostics',
				'/chapitres/pkpd',
				'/chapitres/outils-estimation',
				'/chapitres/bayes-ebes',
				'/chapitres/clustering-ml-hybrides',
				'/chapitres/tdm-conclusion'
			],
			handleHttpError: ({ status, path }) => {
				if (status === 404 && path.startsWith('/slides/')) return;
				throw new Error(`Failed to prerender ${path}: ${status}`);
			}
		}
	}
};

export default config;
