/**
 * P1 — Transform world→screen round-trip + flip-y.
 * Chạy: node tests/sim2-transform.test.js
 */
'use strict';

const assert = require('assert');
const { makeTransform } = require('../js/sim2/core/transform.js');

const approx = (a, b, tol, msg) =>
  assert.ok(Math.abs(a - b) <= (tol || 1e-9), `${msg}: ${a} ≈ ${b}`);

// worldBox không vuông để bắt lỗi scale theo trục
const tf = makeTransform({
  worldBox: { minX: -5, minY: -2, maxX: 5, maxY: 8 }, // 10 × 10
  screenBox: { x: 0, y: 0, width: 400, height: 400 }
});

// 1. scale dương, giữ tỉ lệ (min của 2 trục)
assert.ok(tf.scale > 0, 'scale phải dương');
approx(tf.scale, 40, 1e-9, 'scale = min(400/10, 400/10) = 40');

// 2. round-trip screen→world→screen và world→screen→world < 1e-9
const worldPts = [
  { x: 0, y: 0 }, { x: -5, y: -2 }, { x: 5, y: 8 }, { x: 1.234, y: -1.111 }, { x: 3, y: 7 }
];
for (const p of worldPts) {
  const back = tf.toWorld(tf.toScreen(p));
  approx(back.x, p.x, 1e-9, `round-trip x @(${p.x},${p.y})`);
  approx(back.y, p.y, 1e-9, `round-trip y @(${p.x},${p.y})`);
}
const screenPts = [{ x: 0, y: 0 }, { x: 200, y: 200 }, { x: 399, y: 1 }];
for (const s of screenPts) {
  const back = tf.toScreen(tf.toWorld(s));
  approx(back.x, s.x, 1e-9, `round-trip sx @(${s.x},${s.y})`);
  approx(back.y, s.y, 1e-9, `round-trip sy @(${s.x},${s.y})`);
}

// 3. flip-y: world +y phải cho screen y NHỎ hơn (y màn hình hướng xuống)
const low = tf.toScreen({ x: 0, y: 0 });
const high = tf.toScreen({ x: 0, y: 5 });
assert.ok(high.y < low.y, `flip-y: world y cao hơn → screen y nhỏ hơn (${high.y} < ${low.y})`);

// 4. world +x → screen x lớn hơn (x không lật)
const left = tf.toScreen({ x: 0, y: 0 });
const right = tf.toScreen({ x: 5, y: 0 });
assert.ok(right.x > left.x, `world x lớn hơn → screen x lớn hơn (${right.x} > ${left.x})`);

console.log('sim2-transform: PASS');
