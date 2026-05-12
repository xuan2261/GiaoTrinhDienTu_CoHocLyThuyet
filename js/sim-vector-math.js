/**
 * Small vector/math helpers for simulation modules.
 */
(function() {
'use strict';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function vec(x, y) {
  return { x: Number(x) || 0, y: Number(y) || 0 };
}

function add(a, b) {
  return vec(a.x + b.x, a.y + b.y);
}

function sub(a, b) {
  return vec(a.x - b.x, a.y - b.y);
}

function scale(a, factor) {
  return vec(a.x * factor, a.y * factor);
}

function dot(a, b) {
  return a.x * b.x + a.y * b.y;
}

function length(a) {
  return Math.hypot(a.x, a.y);
}

function normalize(a) {
  const mag = length(a);
  return mag > 1e-9 ? scale(a, 1 / mag) : vec(0, 0);
}

function angleOf(a) {
  return Math.atan2(a.y, a.x);
}

function fromAngle(angle, radius) {
  return vec(Math.cos(angle) * radius, Math.sin(angle) * radius);
}

function toDegrees(rad) {
  return rad * 180 / Math.PI;
}

function toRadians(deg) {
  return deg * Math.PI / 180;
}

function project(a, onto) {
  const unit = normalize(onto);
  return scale(unit, dot(a, unit));
}

window.SimMath = {
  clamp,
  lerp,
  vec,
  add,
  sub,
  scale,
  dot,
  length,
  normalize,
  angleOf,
  fromAngle,
  toDegrees,
  toRadians,
  project
};

})();
