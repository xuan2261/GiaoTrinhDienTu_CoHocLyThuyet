/**
 * P3 — Probe B logic: compareSign(observed, expect) → match boolean / null.
 * Chạy: node tests/sim-probe-b-sign.test.js
 */
'use strict';

const assert = require('assert');
const { compareSign } = require('../tools/sim-probe/probe-delta.js');

let passed = 0;
const eq = (a, b, msg) => { assert.strictEqual(a, b, `${msg}: got ${a}, want ${b}`); passed++; };

// match cases
eq(compareSign('+', '+'), true, 'compareSign + vs + → match');
eq(compareSign('-', '-'), true, 'compareSign - vs - → match');
eq(compareSign('0', '0'), true, 'compareSign 0 vs 0 → match');
// mismatch cases (the high-finding detector)
eq(compareSign('+', '-'), false, 'compareSign + vs - → mismatch');
eq(compareSign('-', '+'), false, 'compareSign - vs + → mismatch');
eq(compareSign('+', '0'), false, 'compareSign + vs 0 → mismatch');
eq(compareSign('0', '+'), false, 'compareSign 0 vs + → mismatch');
eq(compareSign('-', '0'), false, 'compareSign - vs 0 → mismatch');
// null expectSign → no expectation → null (not a match, not a mismatch)
eq(compareSign('+', null), null, 'compareSign expect null → null');
eq(compareSign('-', undefined), null, 'compareSign expect undefined → null');
// invalid observed → false (cannot confirm match)
eq(compareSign('x', '+'), false, 'compareSign invalid observed → false');
eq(compareSign(null, '+'), false, 'compareSign null observed → false');
eq(compareSign(undefined, '-'), false, 'compareSign undefined observed → false');
// invalid expect (non-null garbage) → false
eq(compareSign('+', 'x'), false, 'compareSign invalid expect string → false');

// ── SELF-VERIFY sensitivity: a flipped expectSign MUST be detected ──────────
// Simulate observed sign "+" from a live drive; flipping the expected to "-"
// must flip match true→false. Proves the probe is not stuck-true.
const observed = '+';
eq(compareSign(observed, '+'), true, 'sensitivity baseline: correct expect → match');
eq(compareSign(observed, '-'), false, 'sensitivity flip: wrong expect → mismatch DETECTED');

console.log(`sim-probe-b-sign: ${passed} assertions passed`);
