const semanticScores = [
  [3, 0, 0, 0, 0, 0],
  [3, 2, 0, 0, 0, 0],
  [1, 2, 3, 0, 0, 0],
  [0.5, 0.7, 2.5, 2, 0, 0],
  [0.4, 0.8, 1.8, 1.2, 3, 0],
  [0.3, 0.8, 1.5, 0.8, 4, 2]
];

/**
 * Constructed attention weights for a six-token causal teaching example.
 * @param {number} target
 * @param {'local'|'relation'} [head]
 */
export function tokenAttentionWeights(target, head = 'relation') {
  if (!Number.isInteger(target) || target < 0 || target >= semanticScores.length) {
    throw new Error('Target token index is outside the teaching sequence');
  }
  if (!['local', 'relation'].includes(head)) throw new Error('Unknown attention head');
  const scores = semanticScores[target].map((score, source) => {
    if (source > target) return 0;
    return head === 'local' ? Math.exp(-0.9 * (target - source)) : score;
  });
  const total = scores.reduce((sum, score) => sum + score, 0);
  return scores.map((score) => score / total);
}
