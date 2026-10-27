import assert from 'node:assert/strict';
import { tokenAttentionWeights } from '../src/lib/science/tokenAttentionLab.js';

for (const head of ['local', 'relation']) {
  for (let target = 0; target < 6; target += 1) {
    const weights = tokenAttentionWeights(target, head);
    assert.ok(Math.abs(weights.reduce((sum, value) => sum + value, 0) - 1) < 1e-12, 'Attention weights must sum to one');
    assert.ok(weights.slice(target + 1).every((value) => value === 0), 'The causal mask must hide future tokens');
  }
}
assert.notDeepEqual(tokenAttentionWeights(5, 'local'), tokenAttentionWeights(5, 'relation'), 'Heads must demonstrate different routing patterns');
assert.throws(() => tokenAttentionWeights(6), /outside/);
console.log('Token attention teaching model: PASS');
