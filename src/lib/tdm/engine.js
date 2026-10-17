// @ts-nocheck
import { PUBLIC_TDM_ENGINE_URL } from '$app/env/public';

import { dev } from '$app/env';

const localEngineUrl = 'http://127.0.0.1:3838';
const productionEngineUrl = 'https://tdmhub.shinyapps.io/MIPD_Engine';

export const tdmEngineUrl = PUBLIC_TDM_ENGINE_URL || (dev ? localEngineUrl : productionEngineUrl);
