// @ts-nocheck
import catalog from './tdmModels.generated.json';

export const tdmModels = catalog.models;

export const tdmModelStats = {
  total: tdmModels.length,
  drugs: new Set(tdmModels.map((model) => model.drug)).size,
  formats: Array.from(new Set(tdmModels.map((model) => model.format)))
};
