/**
 * @param {number[]} values
 * @param {number} paddingRatio
 */
export function paddedDomain(values, paddingRatio = 0.1) {
  const filtered = values.filter((v) => Number.isFinite(v));
  if (!filtered.length) return [0, 1];
  let min = Math.min(...filtered);
  let max = Math.max(...filtered);
  if (min === max) {
    min = min * 0.9;
    max = max * 1.1 + 1e-6;
  }
  const span = max - min;
  return [min - span * paddingRatio, max + span * paddingRatio];
}
