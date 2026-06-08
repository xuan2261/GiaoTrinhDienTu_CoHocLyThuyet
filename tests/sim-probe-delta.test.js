/**
 * P1 — Pure delta/sign/parse helpers cho interaction-probe (DEV-ONLY triage).
 * TDD: viết test TRƯỚC, module tools/sim-probe/probe-delta.js dựng sau.
 * Chạy: node tests/sim-probe-delta.test.js
 */
'use strict';

const assert = require('assert');
const {
  computeDelta, signOf, parseReadout
} = require('../tools/sim-probe/probe-delta.js');

let passed = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); passed++; };
const eq = (a, b, msg) => { assert.strictEqual(a, b, `${msg}: got ${a}, want ${b}`); passed++; };
const approx = (a, b, msg, tol) =>
  { assert.ok(Math.abs(a - b) <= (tol || 1e-9), `${msg}: ${a} ≈ ${b}`); passed++; };

// ── computeDelta(before, after) ──────────────────────────────────────────
approx(computeDelta(10, 12), 2, 'computeDelta positive');
approx(computeDelta(12, 10), -2, 'computeDelta negative');
approx(computeDelta(5, 5), 0, 'computeDelta zero');
approx(computeDelta(-3, 2), 5, 'computeDelta crossing zero');
approx(computeDelta(2.5, 3.0), 0.5, 'computeDelta fractional');
// NaN-safe: non-numeric → NaN delta (caller decides finding)
ok(Number.isNaN(computeDelta(NaN, 1)), 'computeDelta NaN before → NaN');
ok(Number.isNaN(computeDelta(1, NaN)), 'computeDelta NaN after → NaN');

// ── signOf(delta) ─────────────────────────────────────────────────────────
eq(signOf(2), '+', 'signOf positive');
eq(signOf(-2), '-', 'signOf negative');
eq(signOf(0), '0', 'signOf exact zero');
eq(signOf(1e-12), '0', 'signOf within epsilon → 0');
eq(signOf(-1e-12), '0', 'signOf negative within epsilon → 0');
eq(signOf(0.5), '+', 'signOf small positive above epsilon');
eq(signOf(NaN), '0', 'signOf NaN → 0 (no spurious sign)');
// custom epsilon
eq(signOf(0.05, 0.1), '0', 'signOf custom epsilon swallows 0.05');
eq(signOf(0.2, 0.1), '+', 'signOf custom epsilon passes 0.2');

// ── parseReadout(str) ──────────────────────────────────────────────────────
approx(parseReadout('12 N·m'), 12, 'parseReadout leading int + unit');
approx(parseReadout('ω = 2.5 rad/s'), 2.5, 'parseReadout label = value + unit');
approx(parseReadout('−3.0'), -3.0, 'parseReadout unicode minus U+2212');
approx(parseReadout('M = 12'), 12, 'parseReadout KaTeX-ish label');
approx(parseReadout('-7.25 N'), -7.25, 'parseReadout ascii negative');
approx(parseReadout('Fₓ: 84.9 N'), 84.9, 'parseReadout subscript label');
approx(parseReadout('57.735 N'), 57.735, 'parseReadout many decimals');
approx(parseReadout('0'), 0, 'parseReadout bare zero');
approx(parseReadout('α: 90°'), 90, 'parseReadout degree unit');
approx(parseReadout('  3.14  '), 3.14, 'parseReadout surrounding whitespace');
// negative embedded after label with unicode minus
approx(parseReadout('Cx = −2.70 m'), -2.70, 'parseReadout label + unicode-minus value');
// non-numeric → NaN
ok(Number.isNaN(parseReadout('slip')), 'parseReadout non-numeric → NaN');
ok(Number.isNaN(parseReadout('')), 'parseReadout empty → NaN');
ok(Number.isNaN(parseReadout(null)), 'parseReadout null → NaN');
// scientific-ish / plus sign
approx(parseReadout('+5'), 5, 'parseReadout explicit plus');

console.log(`sim-probe-delta: ${passed} assertions passed`);
