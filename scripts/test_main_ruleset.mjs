import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ruleset = JSON.parse(readFileSync('.github/rulesets/main-protection.json', 'utf8'));
assert.equal(ruleset.target, 'branch');
assert.equal(ruleset.source_type, 'Repository');
assert.equal(ruleset.enforcement, 'active');
assert.deepEqual(ruleset.conditions?.ref_name?.include, ['~DEFAULT_BRANCH']);
assert.deepEqual(ruleset.conditions?.ref_name?.exclude, []);
assert.deepEqual(ruleset.bypass_actors, []);

const byType = new Map(ruleset.rules.map((rule) => [rule.type, rule]));
assert.ok(byType.has('deletion'), 'main deletion protection is required');
assert.ok(byType.has('non_fast_forward'), 'force-push protection is required');

const pull = byType.get('pull_request')?.parameters;
assert.ok(pull, 'pull_request rule is required');
assert.equal(pull.required_approving_review_count, 0, 'single-maintainer repository must not require self-approval');
assert.equal(pull.require_code_owner_review, false);
assert.equal(pull.require_last_push_approval, false);
assert.equal(pull.required_review_thread_resolution, true);

const checks = byType.get('required_status_checks')?.parameters;
assert.ok(checks, 'required_status_checks rule is required');
assert.equal(checks.strict_required_status_checks_policy, true, 'PR branch must be current with main');
assert.deepEqual(
  checks.required_status_checks.map((item) => item.context),
  ['build', 'scientific-js', 'scientific-r', 'scientific-pmetrics', 'mipd-consumer']
);
console.log('Main ruleset recipe is internally consistent and matches PMx CI job names.');
