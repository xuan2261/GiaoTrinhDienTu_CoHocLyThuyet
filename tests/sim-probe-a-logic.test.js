/**
 * P2 — Probe A logic: midValue (giá trị giữa snap step) + isLive (|Δ|>epsilon).
 * Chạy: node tests/sim-probe-a-logic.test.js
 */
'use strict';

const assert = require('assert');
const { midValue, isLive, DEFAULT_EPSILON } = require('../tools/sim-probe/probe-delta.js');

let passed = 0;
const approx = (a, b, msg, tol) =>
  { assert.ok(Math.abs(a - b) <= (tol || 1e-9), `${msg}: ${a} ≈ ${b}`); passed++; };
const eq = (a, b, msg) => { assert.strictEqual(a, b, `${msg}: got ${a}, want ${b}`); passed++; };
const ok = (c, msg) => { assert.ok(c, msg); passed++; };

// ── midValue(min, max, step) ────────────────────────────────────────────────
approx(midValue(10, 120, 1), 65, 'midValue F slider 10..120 step1');
approx(midValue(0, 90, 1), 45, 'midValue alpha 0..90');
approx(midValue(0.8, 2.5, 0.1), 1.6, 'midValue radius snap to 0.1');   // mid=1.65, (1.65-0.8)/0.1=8.4999 float→round 8→1.6
approx(midValue(1, 6, 0.5), 3.5, 'midValue couple distance step .5');
approx(midValue(0, 0.5, 0.05), 0.25, 'midValue angular accel snap');
approx(midValue(2, 20, 1), 11, 'midValue force N');
approx(midValue(0, 2, 0.1), 1, 'midValue omega0');
// degenerate
eq(midValue(5, 5, 1), 5, 'midValue equal min=max → min');
eq(midValue(8, 4, 1), 8, 'midValue max<min → returns lo (min arg)');
ok(Number.isNaN(midValue(NaN, 10, 1)), 'midValue NaN min → NaN');
// step missing/invalid → raw midpoint
approx(midValue(0, 10, 0), 5, 'midValue step 0 → raw midpoint');
approx(midValue(0, 10), 5, 'midValue step undefined → raw midpoint');
// snapped value stays within bounds
const m = midValue(0.1, 1, 0.05);
ok(m >= 0.1 && m <= 1, 'midValue within [min,max]');

// ── isLive(delta, epsilon) ──────────────────────────────────────────────────
ok(isLive(0.5), 'isLive 0.5 default eps');
ok(isLive(-0.5), 'isLive -0.5 default eps (abs)');
ok(!isLive(0), 'isLive 0 → dead');
ok(!isLive(DEFAULT_EPSILON / 2), 'isLive below default eps → dead');
ok(isLive(1e-3), 'isLive above default eps');
ok(!isLive(1e-5, 1e-4), 'isLive below custom eps → dead');
ok(isLive(2e-4, 1e-4), 'isLive above custom eps');
ok(!isLive(NaN), 'isLive NaN → dead (not live)');

console.log(`sim-probe-a-logic: ${passed} assertions passed`);
