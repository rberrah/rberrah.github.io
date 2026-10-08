import { covariateActivities } from './covariateActivities.js';
import { coreActivities } from './activities/core.js';
import { mathNcaActivities } from './activities/mathNca.js';
import { domainActivities } from './activities/domains.js';
import { evaluationActivities } from './activities/evaluation.js';
import { softwareActivities } from './activities/software.js';
import { synthesisActivities } from './activities/synthesis.js';

/** @type {import('../learning/types').Activity[]} */
export const guidedActivities = [...covariateActivities, ...coreActivities, ...mathNcaActivities, ...domainActivities, ...evaluationActivities, ...softwareActivities, ...synthesisActivities];
/** @param {string} slug @param {string} [track] */
export const activitiesForChapter = (slug, track) => guidedActivities.filter(activity =>
  activity.chapter === slug && (track ? !activity.track || activity.track === track : !activity.track)
);
