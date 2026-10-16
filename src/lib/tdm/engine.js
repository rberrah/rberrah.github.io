// @ts-nocheck
import { env } from '$env/dynamic/public';
import { dev } from '$app/environment';

// Canonical scientific source: https://github.com/rberrah/MIPD-Engine
// The public URL is intentionally preserved during repository extraction.
const localEngineUrl = 'http://127.0.0.1:3838';
const productionEngineUrl = 'https://tdmhub.shinyapps.io/MIPD_Engine';

export const tdmEngineUrl = env.PUBLIC_TDM_ENGINE_URL || (dev ? localEngineUrl : productionEngineUrl);
