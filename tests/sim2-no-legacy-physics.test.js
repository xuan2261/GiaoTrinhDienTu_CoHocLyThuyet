/**
 * P5 — Guard: physics cũ js/sim-physics-*.js đã xóa (sau khi port), js/sim2/physics/* require() được.
 * Chạy: node tests/sim2-no-legacy-physics.test.js
 */
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const exists = rel => fs.existsSync(path.join(ROOT, rel));

// 1. Physics cũ phải biến mất (đã port sang sim2)
for (const f of ['js/sim-physics-statics.js', 'js/sim-physics-kinematics.js', 'js/sim-physics-dynamics.js']) {
  assert.ok(!exists(f), `${f} phải bị xóa (đã port sang js/sim2/physics/)`);
}

// 2. js/sim2/physics/* tồn tại + require() được + có API
const Physics = require('../js/sim2/physics');
assert.ok(Physics.statics && typeof Physics.statics.computeMoment === 'function', 'sim2 statics require OK');
assert.ok(Physics.kinematics && typeof Physics.kinematics.gearRatio === 'function', 'sim2 kinematics require OK');
assert.ok(Physics.dynamics && typeof Physics.dynamics.rk4Step === 'function', 'sim2 dynamics require OK');

// 3. index.html không nạp lại physics cũ; không còn scaffold sim2-hello
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
assert.ok(!/js\/sim-physics-/.test(indexHtml), 'index.html không nạp physics cũ');
assert.ok(!/sim2-hello|hello-sim/.test(indexHtml), 'index.html không còn scaffold sim2-hello (gỡ ở P5)');
assert.ok(!exists('js/sim2/sims/ch1/hello-sim.js'), 'hello-sim.js scaffold đã xóa');

console.log('sim2-no-legacy-physics: PASS');
