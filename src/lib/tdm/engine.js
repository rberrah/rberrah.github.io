// @ts-nocheck
import { PUBLIC_TDM_ENGINE_URL } from '$app/env/public';

const productionEngineUrl = 'https://tdmhub.shinyapps.io/MIPD_Engine';

export const tdmEngineUrl = PUBLIC_TDM_ENGINE_URL || productionEngineUrl;
