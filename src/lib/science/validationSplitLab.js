// Synthetic repeated-measures data for teaching validation design.
// The transparent 1-nearest-neighbour model is intentionally simple: the
// experiment is about the split, not about claiming clinical performance.

const CENTER_EFFECT = [0, 4, 18];

/** @typedef {{patient:number, center:number, visit:number, concentration:number, weight:number, auc:number}} ValidationRow */

/** @returns {ValidationRow[]} */
export function makeValidationData() {
  return Array.from({ length: 24 }, (_, patient) => {
    const center = patient % 3;
    const baseConcentration = 2.5 + ((patient * 7) % 17) * 0.34;
    const weight = 48 + ((patient * 13) % 41);
    const individualEffect = (((patient * 17) % 13) - 6) * 2.8;
    return [0, 1].map((visit) => {
      const concentration = baseConcentration + (visit === 0 ? -0.11 : 0.11);
      const measurementNoise = visit === 0 ? -1.2 : 1.2;
      return {
        patient,
        center,
        visit,
        concentration,
        weight,
        auc: 24 + 8.2 * concentration + 0.16 * weight + individualEffect + CENTER_EFFECT[center] + measurementNoise
      };
    });
  }).flat();
}

/**
 * @param {'rows'|'patients'|'center'} strategy
 * @param {ReturnType<typeof makeValidationData>} data
 */
export function splitValidationData(strategy, data = makeValidationData()) {
  if (strategy === 'rows') {
    return {
      train: data.filter((row) => row.visit === 0),
      test: data.filter((row) => row.visit === 1)
    };
  }
  if (strategy === 'patients') {
    return {
      train: data.filter((row) => row.patient % 4 !== 0),
      test: data.filter((row) => row.patient % 4 === 0)
    };
  }
  if (strategy === 'center') {
    return {
      train: data.filter((row) => row.center !== 2),
      test: data.filter((row) => row.center === 2)
    };
  }
  throw new Error('Unknown validation strategy');
}

/** @param {ValidationRow[]} rows */
function featureScale(rows) {
  const cMean = rows.reduce((sum, row) => sum + row.concentration, 0) / rows.length;
  const wMean = rows.reduce((sum, row) => sum + row.weight, 0) / rows.length;
  const cSd = Math.sqrt(rows.reduce((sum, row) => sum + (row.concentration - cMean) ** 2, 0) / rows.length) || 1;
  const wSd = Math.sqrt(rows.reduce((sum, row) => sum + (row.weight - wMean) ** 2, 0) / rows.length) || 1;
  return { cMean, wMean, cSd, wSd };
}

/**
 * Fit only on the training rows and predict each test row from its nearest
 * training neighbour in standardized concentration/weight space.
 * @param {ValidationRow[]} train
 * @param {ValidationRow[]} test
 */
export function predictValidationRows(train, test) {
  if (!train.length || !test.length) throw new Error('Validation requires nonempty train and test sets');
  const scale = featureScale(train);
  return test.map((row) => {
    const nearest = train.reduce((best, candidate) => {
      const dc = (candidate.concentration - row.concentration) / scale.cSd;
      const dw = (candidate.weight - row.weight) / scale.wSd;
      const distance = dc ** 2 + dw ** 2;
      return distance < best.distance ? { distance, candidate } : best;
    }, { distance: Infinity, candidate: train[0] }).candidate;
    return { ...row, predicted: nearest.auc, neighborPatient: nearest.patient };
  });
}

/** @param {{auc:number,predicted:number}[]} rows */
export function validationMetrics(rows) {
  if (!rows.length) throw new Error('Metrics require predictions');
  const errors = rows.map((row) => row.predicted - row.auc);
  return {
    rmse: Math.sqrt(errors.reduce((sum, error) => sum + error ** 2, 0) / rows.length),
    bias: errors.reduce((sum, error) => sum + error, 0) / rows.length,
    within20: 100 * rows.filter((row) => Math.abs(row.predicted - row.auc) <= 0.2 * row.auc).length / rows.length
  };
}

/** @param {'rows'|'patients'|'center'} strategy */
export function runValidationStrategy(strategy) {
  const split = splitValidationData(strategy);
  const predictions = predictValidationRows(split.train, split.test);
  return { ...split, predictions, metrics: validationMetrics(predictions) };
}
