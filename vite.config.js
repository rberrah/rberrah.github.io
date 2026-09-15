import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { getSiteOrigin } from './site.config.js';
// @ts-expect-error Node types are not installed in this browser-focused project.
import process from 'node:process';

export default defineConfig(({ mode }) => {
	process.env.PUBLIC_SITE_ORIGIN = getSiteOrigin(mode);
	return { plugins: [sveltekit()] };
});
