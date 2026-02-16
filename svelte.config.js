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
			entries: ['*']
		}
	}
};

export default config;
