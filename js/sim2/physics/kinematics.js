/**
 * Kinematics physics — port từ js/sim-physics-kinematics.js sang UMD (Node + browser).
 * Công thức GIỮ NGUYÊN (verified). Chỉ đổi cơ chế export.
 */
(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.SimPhysicsKinematics = api;
})(typeof window !== 'undefined' ? window : this, function() {
  'use strict';

  const DEG = Math.PI / 180;
  const DT = 1e-4;

  function ellipsePoint(a, b, t, cx, cy) {
    cx = cx || 0; cy = cy || 0;
    return { x: cx + a * Math.cos(t), y: cy + b * Math.sin(t) };
  }

  function parabolaPoint(v0, alphaDeg, g, t, cx, cy) {
    const alpha = (alphaDeg || 0) * DEG;
    g = g !== undefined ? g : 9.81;
    cx = cx || 0; cy = cy || 0;
    return {
      x: cx + v0 * Math.cos(alpha) * t,
      y: cy + v0 * Math.sin(alpha) * t - 0.5 * g * t * t
    };
  }

  function circlePoint(r, omega, t, cx, cy, theta0) {
    cx = cx || 0; cy = cy || 0;
    const theta = (theta0 || 0) + omega * t;
    return { x: cx + r * Math.cos(theta), y: cy + r * Math.sin(theta) };
  }

  function cycloidPoint(r, omega, t, cx, cy) {
    cx = cx || 0; cy = cy || 0;
    const theta = omega * t;
    return { x: cx + r * (theta - Math.sin(theta)), y: cy + r * (1 - Math.cos(theta)) };
  }

  function velocityFromTrajectory(posFn, t) {
    const p1 = posFn(t + DT);
    const p0 = posFn(t - DT);
    return { vx: (p1.x - p0.x) / (2 * DT), vy: (p1.y - p0.y) / (2 * DT) };
  }

  function accelerationFromVelocity(velFn, t) {
    const v1 = velFn(t + DT);
    const v0 = velFn(t - DT);
    return { ax: (v1.vx - v0.vx) / (2 * DT), ay: (v1.vy - v0.vy) / (2 * DT) };
  }

  function tangentialAcceleration(vx, vy, ax, ay) {
    const v = Math.hypot(vx, vy);
    if (v === 0) return 0;
    return (vx * ax + vy * ay) / v;
  }

  function normalAcceleration(vx, vy, rho) {
    const v = Math.hypot(vx, vy);
    return rho !== 0 && rho !== undefined ? (v * v) / rho : 0;
  }

  function totalAcceleration(ax, ay) {
    return Math.hypot(ax, ay);
  }

  function radiusOfCurvature(vx, vy, ax, ay) {
    const v = Math.hypot(vx, vy);
    const cross = Math.abs(vx * ay - vy * ax);
    return cross > 1e-12 ? (v * v * v) / cross : Infinity;
  }

  function angularVelocity(omega0, alpha, t) {
    return omega0 + alpha * t;
  }

  function angularDisplacement(omega0, alpha, t) {
    return omega0 * t + 0.5 * alpha * t * t;
  }

  function tangentialVelocity(omega, r) {
    return omega * r;
  }

  function centrifugalAcceleration(omega, r) {
    return omega * omega * r;
  }

  /**
   * Angular-velocity transfer magnitude for no-slip contact.
   * Returns ωDriven / ωDriver = rDriver / rDriven; callers apply direction explicitly.
   */
  function gearRatio(rDriver, rDriven) {
    return rDriven ? rDriver / rDriven : 0;
  }

  function beltVelocity(omega, r) {
    return omega * r;
  }

  function noSlipCondition(omega1, r1, omega2, r2) {
    const v1 = omega1 * r1;
    const v2 = omega2 * r2;
    return { noSlip: Math.abs(v1 - v2) < 0.001, v1, v2 };
  }

  function absoluteVelocity(ve, vr) {
    return { vx: ve.vx + vr.vx, vy: ve.vy + vr.vy };
  }

  function coriolisAcceleration(omega, vr) {
    return 2 * omega * vr;
  }

  function coriolisAccelerationVec(omega, vrx, vry) {
    return { ax: -2 * omega * vry, ay: 2 * omega * vrx };
  }

  function transportAcceleration(alpha, omega, r) {
    return { at: alpha * r, ac: omega * omega * r };
  }

  function instantCenterVelocity(omega, rx, ry) {
    return { vx: -omega * ry, vy: omega * rx };
  }

  /**
   * Unique finite instantaneous center from two point velocities of one rigid body.
   * Uses delta-v = omega * k cross delta-r, including parallel velocities and a
   * stationary endpoint. Returns null for translation, rest (nonunique center),
   * coincident points, nonfinite inputs or incompatible/non-rigid velocities.
   */
  function locateInstantCenter(a, b, va, vb) {
    if (![a.x, a.y, b.x, b.y, va.vx, va.vy, vb.vx, vb.vy].every(Number.isFinite)) return null;
    const dx = b.x - a.x, dy = b.y - a.y;
    const dvx = vb.vx - va.vx, dvy = vb.vy - va.vy;
    const r2 = dx * dx + dy * dy;
    if (!(r2 > 0) || !Number.isFinite(r2)) return null;
    const omega = (dx * dvy - dy * dvx) / r2;
    const velocityScale = Math.max(Math.hypot(va.vx, va.vy), Math.hypot(vb.vx, vb.vy));
    const residual = Math.hypot(dvx + omega * dy, dvy - omega * dx);
    if (residual > 1e-9 * velocityScale || omega === 0 || !Number.isFinite(omega)) return null;
    const center = { x: a.x - va.vy / omega, y: a.y + va.vx / omega };
    return Number.isFinite(center.x) && Number.isFinite(center.y) ? center : null;
  }

  function sliderCrankPos(r, L, theta) {
    return r * Math.cos(theta) + Math.sqrt(Math.max(0, L * L - r * r * Math.sin(theta) * Math.sin(theta)));
  }

  function sliderCrankVelocity(omega, r, theta, L) {
    const sinTheta = Math.sin(theta);
    const term = L * L - r * r * sinTheta * sinTheta;
    if (term <= 0) return 0;
    const sqrtTerm = Math.sqrt(term);
    return -omega * r * sinTheta * (1 + r * Math.cos(theta) / sqrtTerm);
  }

  function sliderCrankRodAngle(r, L, theta) {
    if (!Number.isFinite(r) || !Number.isFinite(L) || !Number.isFinite(theta) || L <= 0) return 0;
    const ratio = (r / L) * Math.sin(theta);
    if (Math.abs(ratio) > 1) return 0;
    return Math.asin(Math.max(-1, Math.min(1, ratio)));
  }

  return {
    ellipsePoint, parabolaPoint, circlePoint, cycloidPoint,
    velocityFromTrajectory, accelerationFromVelocity, tangentialAcceleration,
    normalAcceleration, totalAcceleration, radiusOfCurvature,
    angularVelocity, angularDisplacement, tangentialVelocity, centrifugalAcceleration,
    gearRatio, beltVelocity, noSlipCondition, absoluteVelocity,
    coriolisAcceleration, coriolisAccelerationVec, transportAcceleration,
    instantCenterVelocity, locateInstantCenter,
    sliderCrankPos, sliderCrankVelocity, sliderCrankRodAngle
  };
});
