import { defineEnvVars } from '@sveltejs/kit/env';

// Optional override; empty string intentionally activates the engine fallback.
export const variables = defineEnvVars({
	PUBLIC_SITE_ORIGIN: { public: true, static: true },
	PUBLIC_TDM_ENGINE_URL: { public: true, schema: (input) => input ?? '' }
});
