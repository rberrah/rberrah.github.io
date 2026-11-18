import { limits, series, stateAt, validateParameters } from './model.js';

// Original one-at-a-time sensitivity calculation for the bounded teaching labs.
// This is a local deterministic simulation, not estimation, an EBE or a clinical PTA.
const knobs = {
  distribution: ['dose', 'cl', 'vc', 'q', 'vp'],
  accumulation: ['dose', 'cl', 'vc', 'tau', 'loading'],
  absorption: ['dose', 'cl', 'vc', 'ka', 'f'],
  infusion: ['dose', 'cl', 'vc', 'duration']
};

export const sensitivityMetrics = ['auc', 'cmax', 'cend'];

/**
 * AUC0–horizon is the model's exact eliminated-mass/CL identity.
 * Cmax uses the existing laboratory series (including dose discontinuities).
 * Cend is the *pre-dose* concentration at the fixed horizon.
 */
export function sensitivityMetric(lab, params, metric) {
  const p = validateParameters(lab, params);
  if (!sensitivityMetrics.includes(metric)) throw new Error('Unknown sensitivity metric');
  if (metric === 'auc') return stateAt(lab, p, p.end).auc;
  if (metric === 'cend') return stateAt(lab, p, p.end, true).c;
  return Math.max(...series(lab, p, p.end).map(point => point.c));
}

/**
 * One factor at a time with all other inputs and the horizon held fixed.
 * Requested ±fraction changes are clipped at the laboratory's physical bounds.
 * Parameters with no effective variation are omitted; discrete counts are not perturbed.
 */
export function sensitivityAnalysis(lab, params, metric = 'auc', fraction = 0.2) {
  const p = validateParameters(lab, params);
  if (!Number.isFinite(fraction) || fraction <= 0 || fraction > 0.5) throw new Error('Invalid sensitivity range');
  const reference = sensitivityMetric(lab, p, metric);
  const change = value => Math.abs(reference) > 1e-12 ? 100 * (value / reference - 1) : null;
  return knobs[lab].flatMap(parameter => {
    const current = p[parameter];
    const [minimum, maximum] = limits[parameter];
    const lowerValue = Math.max(minimum, current * (1 - fraction));
    const upperValue = Math.min(maximum, current * (1 + fraction));
    if (lowerValue === current && upperValue === current) return [];
    const lower = sensitivityMetric(lab, { ...p, [parameter]: lowerValue }, metric);
    const upper = sensitivityMetric(lab, { ...p, [parameter]: upperValue }, metric);
    const lowChange = change(lower), highChange = change(upper);
    return [{
      parameter, current, reference,
      lowerValue, upperValue, lower, upper,
      lowChange, highChange,
      range: Math.max(Math.abs(lowChange ?? lower - reference), Math.abs(highChange ?? upper - reference))
    }];
  }).sort((a, b) => b.range - a.range);
}
