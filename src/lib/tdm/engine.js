// @ts-nocheck
import { env } from '$env/dynamic/public';
import { dev } from '$app/environment';

const localEngineUrl = 'http://127.0.0.1:3838';
const productionEngineUrl = 'https://tdmhub.shinyapps.io/MIPD_Engine';

export const tdmEngineUrl = env.PUBLIC_TDM_ENGINE_URL || (dev ? localEngineUrl : productionEngineUrl);
