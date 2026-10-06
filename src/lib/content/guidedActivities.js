import { covariateActivities } from './covariateActivities.js';
import { coreActivities } from './activities/core.js';
import { mathNcaActivities } from './activities/mathNca.js';
import { domainActivities } from './activities/domains.js';
import { evaluationActivities } from './activities/evaluation.js';
import { softwareActivities } from './activities/software.js';

/** @type {import('../learning/types').Activity[]} */
export const guidedActivities = [...covariateActivities, ...coreActivities, ...mathNcaActivities, ...domainActivities, ...evaluationActivities, ...softwareActivities];
/** @param {string} slug */
export const activitiesForChapter = slug => guidedActivities.filter(activity => activity.chapter === slug);
