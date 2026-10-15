'use strict';
/**
 * tests/test-planner.js
 * Test suite for modules/planner.js  generatePlan()
 *
 * Run with:  node tests/test-planner.js
 */

const { generatePlan } = require('../modules/planner');

// -- Tiny assertion helpers ----------------------------------------------------
let passed = 0;
let failed = 0;

function assert(label, condition, detail) {
  if (condition) {
    console.log('  PASS  ' + label);
    passed++;
  } else {
    console.error('  FAIL  ' + label + (detail ? ' — ' + detail : ''));
    failed++;
  }
}

function isNonEmptyStringArray(val) {
  return (
    Array.isArray(val) &&
    val.length > 0 &&
    val.every(function (s) { return typeof s === 'string' && s.trim() !== ''; })
  );
}

// -- Sample mentor object (food-waste domain) ----------------------------------
const SAMPLE_MENTOR = {
  problem_summary: 'Households waste 30% of purchased food due to poor tracking',
  users: ['Home cooks', 'Families'],
  user_needs: ['Easy meal logging', 'Expiry reminders', 'Recipe suggestions'],
  features: [
    'Meal/ingredient logging form',
    'Waste entry list with timestamps',
    'Personalised tips to reduce waste',
    'Weekly summary dashboard',
    'Barcode scanner integration',
  ],
};

// ----------------------------------------------------------------------------
// Test 1 – Normal case: food-waste, team 5, 90 min, mentor supplied
// ----------------------------------------------------------------------------
console.log('\n=== Test 1: Normal case with mentor object (food-waste, 5 people, 90 min) ===');
const r1 = generatePlan({
  problem_statement: 'Reduce household food waste by helping users track and plan meals more efficiently',
  team_size: 5,
  time_limit_minutes: 90,
  mentor: SAMPLE_MENTOR,
});

assert('Returns a non-null object',            typeof r1 === 'object' && r1 !== null);
assert('mvp_plan is non-empty string[]',       isNonEmptyStringArray(r1.mvp_plan));
assert('tech_stack is non-empty string[]',     isNonEmptyStringArray(r1.tech_stack));
assert('tasks is non-empty string[]',          isNonEmptyStringArray(r1.tasks));
assert('validation_checkpoints non-empty []',  isNonEmptyStringArray(r1.validation_checkpoints));
assert('90-min cap: <= 3 mentor features used',
  r1.mvp_plan.filter(function (s) { return /^\s+\d+\./.test(s); }).length <= 3);
assert('tech_stack contains HTML',     r1.tech_stack.includes('HTML'));
assert('tech_stack contains CSS',      r1.tech_stack.includes('CSS'));
assert('tech_stack contains JavaScript', r1.tech_stack.includes('JavaScript'));
assert('tech_stack contains Node.js',  r1.tech_stack.includes('Node.js'));
assert('tech_stack contains Express',  r1.tech_stack.includes('Express'));
assert('tasks[0] mentions scaffold',   r1.tasks[0].toLowerCase().includes('scaffold'));
assert('tasks includes integration',
  r1.tasks.some(function (s) { return s.toLowerCase().includes('integrat'); }));
assert('checkpoints include input-validation',
  r1.validation_checkpoints.some(function (s) { return s.toLowerCase().includes('input validation'); }));
assert('checkpoints include normal-case test',
  r1.validation_checkpoints.some(function (s) { return s.toLowerCase().includes('normal-case'); }));
assert('checkpoints include edge-case test',
  r1.validation_checkpoints.some(function (s) { return s.toLowerCase().includes('edge-case'); }));
assert('checkpoints include end-to-end check',
  r1.validation_checkpoints.some(function (s) { return s.toLowerCase().includes('end-to-end'); }));
assert('mentor summary included in mvp_plan',
  r1.mvp_plan.some(function (s) { return s.includes('30% of purchased food'); }));

console.log('  [mvp_plan]  ', r1.mvp_plan.length, 'items');
console.log('  [tech_stack]', r1.tech_stack);
console.log('  [tasks]     ', r1.tasks.length, 'items');
console.log('  [checkpoints]', r1.validation_checkpoints.length, 'items');

// ----------------------------------------------------------------------------
// Test 2 – No mentor object: derive from problem statement alone
// ----------------------------------------------------------------------------
console.log('\n=== Test 2: No mentor — derive from problem statement ===');
const r2 = generatePlan({
  problem_statement: 'Reduce household food waste by helping users track and plan meals',
  team_size: 5,
  time_limit_minutes: 90,
});

assert('Returns object without mentor',          typeof r2 === 'object' && r2 !== null);
assert('mvp_plan non-empty',                     isNonEmptyStringArray(r2.mvp_plan));
assert('tech_stack non-empty',                   isNonEmptyStringArray(r2.tech_stack));
assert('tasks non-empty',                        isNonEmptyStringArray(r2.tasks));
assert('validation_checkpoints non-empty',       isNonEmptyStringArray(r2.validation_checkpoints));
assert('Domain detection selects food template',
  r2.tasks.some(function (s) { return s.toLowerCase().includes('food'); }) ||
  r2.mvp_plan.some(function (s) { return s.toLowerCase().includes('food'); }));
assert('No mentor summary injected',
  !r2.mvp_plan.some(function (s) { return s.includes('30% of purchased food'); }));

// ----------------------------------------------------------------------------
// Test 3 – Larger time limit (240 min) allows up to 5 features
// ----------------------------------------------------------------------------
console.log('\n=== Test 3: Larger time limit (240 min) — up to 5 features ===');
const r3 = generatePlan({
  problem_statement: 'Reduce household food waste',
  team_size: 3,
  time_limit_minutes: 240,
  mentor: SAMPLE_MENTOR,
});
const featureLines3 = r3.mvp_plan.filter(function (s) { return /^\s+\d+\./.test(s); });
assert('240-min plan has > 3 and <= 5 features', featureLines3.length > 3 && featureLines3.length <= 5);
console.log('  Feature count (240 min):', featureLines3.length);

// ----------------------------------------------------------------------------
// Test 4 – Solo developer (team_size = 1)
// ----------------------------------------------------------------------------
console.log('\n=== Test 4: Solo developer ===');
const r4 = generatePlan({
  problem_statement: 'Track food waste at home',
  team_size: 1,
  time_limit_minutes: 60,
});
assert('Solo: task wording includes "sequentially"',
  r4.tasks.some(function (s) { return s.includes('sequentially'); }));
assert('Solo: mvp_plan mentions solo developer',
  r4.mvp_plan[0].includes('solo developer'));

// ----------------------------------------------------------------------------
// Test 5 – Pair team (team_size = 2)
// ----------------------------------------------------------------------------
console.log('\n=== Test 5: Pair team (team_size = 2) ===');
const r5 = generatePlan({
  problem_statement: 'Track food waste at home',
  team_size: 2,
  time_limit_minutes: 90,
});
assert('Pair: task wording includes "one member"',
  r5.tasks.some(function (s) { return s.includes('one member'); }));

// ----------------------------------------------------------------------------
// Test 6 – mentor is null (explicit null)
// ----------------------------------------------------------------------------
console.log('\n=== Test 6: mentor explicitly null ===');
const r6 = generatePlan({
  problem_statement: 'Track food waste at home',
  team_size: 3,
  time_limit_minutes: 90,
  mentor: null,
});
assert('null mentor handled gracefully',
  isNonEmptyStringArray(r6.mvp_plan) && isNonEmptyStringArray(r6.tasks));

// ----------------------------------------------------------------------------
// Test 7 – Generic domain (no matching keywords)
// ----------------------------------------------------------------------------
console.log('\n=== Test 7: Generic domain (no keyword match) ===');
const r7 = generatePlan({
  problem_statement: 'Make collaboration easier for distributed teams',
  team_size: 4,
  time_limit_minutes: 90,
});
assert('Generic domain still returns valid plan', isNonEmptyStringArray(r7.mvp_plan));
assert('Generic tech stack correct',              r7.tech_stack.includes('Express'));

// ----------------------------------------------------------------------------
// Invalid input tests
// ----------------------------------------------------------------------------

// Test 8 – null input
console.log('\n=== Test 8: Invalid input — null ===');
try {
  generatePlan(null);
  assert('Should have thrown on null', false);
} catch (e) {
  assert('Throws on null input', e.message.includes('non-null object'));
  console.log('  Error:', e.message);
}

// Test 9 – empty problem_statement
console.log('\n=== Test 9: Invalid input — empty problem_statement ===');
try {
  generatePlan({ problem_statement: '   ', team_size: 3, time_limit_minutes: 90 });
  assert('Should have thrown on whitespace-only problem_statement', false);
} catch (e) {
  assert('Throws on empty problem_statement', e.message.includes('problem_statement'));
  console.log('  Error:', e.message);
}

// Test 10 – team_size = 0
console.log('\n=== Test 10: Invalid input — team_size = 0 ===');
try {
  generatePlan({ problem_statement: 'Test', team_size: 0, time_limit_minutes: 90 });
  assert('Should have thrown on team_size 0', false);
} catch (e) {
  assert('Throws on team_size < 1', e.message.includes('team_size'));
  console.log('  Error:', e.message);
}

// Test 11 – negative time_limit_minutes
console.log('\n=== Test 11: Invalid input — negative time_limit_minutes ===');
try {
  generatePlan({ problem_statement: 'Test', team_size: 2, time_limit_minutes: -5 });
  assert('Should have thrown on negative time', false);
} catch (e) {
  assert('Throws on negative time_limit_minutes', e.message.includes('time_limit_minutes'));
  console.log('  Error:', e.message);
}

// Test 12 – non-numeric team_size
console.log('\n=== Test 12: Invalid input — string team_size ===');
try {
  generatePlan({ problem_statement: 'Test', team_size: 'five', time_limit_minutes: 90 });
  assert('Should have thrown on string team_size', false);
} catch (e) {
  assert('Throws on non-numeric team_size', e.message.includes('team_size'));
  console.log('  Error:', e.message);
}

// Test 13 – Infinity time_limit_minutes
console.log('\n=== Test 13: Invalid input — Infinity time_limit_minutes ===');
try {
  generatePlan({ problem_statement: 'Test', team_size: 2, time_limit_minutes: Infinity });
  assert('Should have thrown on Infinity time', false);
} catch (e) {
  assert('Throws on Infinity time_limit_minutes', e.message.includes('time_limit_minutes'));
  console.log('  Error:', e.message);
}

// Test 14 – mentor with empty/invalid features (graceful degradation)
console.log('\n=== Test 14: Mentor with empty features — fallback to template ===');
const r14 = generatePlan({
  problem_statement: 'Track food waste at home',
  team_size: 3,
  time_limit_minutes: 90,
  mentor: { problem_summary: 'Only summary, no features', users: [], user_needs: [], features: [] },
});
assert('Falls back to domain template when features empty',
  isNonEmptyStringArray(r14.mvp_plan));
assert('Mentor summary still included',
  r14.mvp_plan.some(function (s) { return s.includes('Only summary'); }));

// ----------------------------------------------------------------------------
// Summary
// ----------------------------------------------------------------------------
console.log('\n----------------------------------------------------------');
console.log('Test results: ' + passed + ' passed, ' + failed + ' failed.');
if (failed > 0) {
  console.error('Some tests FAILED.');
  process.exit(1);
} else {
  console.log('All tests passed!');
}
