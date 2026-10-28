// Every checkpoint has a specific, bilingual scientific explanation.
// The question index is the original index; option display order may be shuffled.
import { coreQuizRationales } from './quizRationalesCore.js';
import { methodsQuizRationales } from './quizRationalesMethods.js';
import { validationQuizRationales } from './quizRationalesValidation.js';
import { softwareQuizRationales } from './quizRationalesSoftware.js';

/** @type {Record<string, Array<{fr: string, en: string}>>} */
export const quizRationales = {
  ...coreQuizRationales,
  ...methodsQuizRationales,
  ...validationQuizRationales,
  ...softwareQuizRationales
};
