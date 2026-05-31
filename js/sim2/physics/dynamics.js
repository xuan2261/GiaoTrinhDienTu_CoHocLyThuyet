/**
 * Dynamics physics — port từ js/sim-physics-dynamics.js sang UMD (Node + browser).
 * Công thức GIỮ NGUYÊN (verified). rk4Step canonical. Chỉ đổi cơ chế export.
 */
(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.SimPhysicsDynamics = api;
})(typeof window !== 'undefined' ? window : this, function() {
  'use strict';

  function accelerationFromForce(F, m) { return m ? F / m : 0; }

  function inertialForce(m, ax, ay) { return { fx: -m * ax, fy: -m * ay }; }

  function frictionForce(mu, N) { return mu * N; }

  function staticLimitAngle(mu) { return Math.atan(mu); }

  function slipCondition(alphaDeg, mu) {
    const alpha = alphaDeg * Math.PI / 180;
    const phi = Math.atan(mu);
    return { slips: alpha > phi, phi: phi * 180 / Math.PI };
  }

  function eulerStep(state, dt, derivativeFn) {
    const d = derivativeFn(state);
    return { x: state.x + d.dx * dt, v: state.v + d.dv * dt };
  }

  function rk4Step(state, dt, derivativeFn) {
    const k1 = derivativeFn(state);
    const k2 = derivativeFn({ x: state.x + k1.dx * dt / 2, v: state.v + k1.dv * dt / 2 });
    const k3 = derivativeFn({ x: state.x + k2.dx * dt / 2, v: state.v + k2.dv * dt / 2 });
    const k4 = derivativeFn({ x: state.x + k3.dx * dt, v: state.v + k3.dv * dt });
    return {
      x: state.x + (k1.dx + 2 * k2.dx + 2 * k3.dx + k4.dx) * dt / 6,
      v: state.v + (k1.dv + 2 * k2.dv + 2 * k3.dv + k4.dv) * dt / 6
    };
  }

  function integrateMotion(m, k, F_ext, v0, x0, dt) {
    const deriv = s => ({ dx: s.v, dv: (F_ext(s.x, s.v) - k * s.x) / m });
    return rk4Step({ x: x0 || 0, v: v0 || 0 }, dt, deriv);
  }

  function elasticCollision(m1, m2, v1, v2) {
    const total = m1 + m2 || 1;
    return {
      v1: ((m1 - m2) * v1 + 2 * m2 * v2) / total,
      v2: ((m2 - m1) * v2 + 2 * m1 * v1) / total
    };
  }

  function inelasticCollision(m1, m2, v1, v2) {
    const total = m1 + m2 || 1;
    return { v: (m1 * v1 + m2 * v2) / total };
  }

  function restitutionVelocity(m1, m2, v1, v2, e) {
    const total = m1 + m2 || 1;
    return {
      v1: ((m1 - e * m2) * v1 + (1 + e) * m2 * v2) / total,
      v2: ((m2 - e * m1) * v2 + (1 + e) * m1 * v1) / total
    };
  }

  function momentumBefore(m1, m2, v1, v2) { return m1 * v1 + m2 * v2; }

  function momentumAfter(result, m1, m2) { return m1 * result.v1 + m2 * result.v2; }

  function momentum2d(bodies) {
    let x = 0, y = 0;
    for (const b of (bodies || [])) {
      const m = Number(b && b.m) || 0;
      x += m * (Number(b && b.vx) || 0);
      y += m * (Number(b && b.vy) || 0);
    }
    return { x, y };
  }

  function resolveCollision2D(m1, m2, p1, p2, v1, v2, e) {
    const nx = p2.x - p1.x, ny = p2.y - p1.y;
    const dist = Math.hypot(nx, ny);
    if (dist < 1e-9) return { v1, v2 };
    const nnx = nx / dist, nny = ny / dist;

    const vrx = v1.x - v2.x, vry = v1.y - v2.y;
    const vrn = vrx * nnx + vry * nny;
    if (vrn >= 0) return { v1, v2 };

    const j = -(1 + e) * vrn / (1 / m1 + 1 / m2);

    return {
      v1: { x: v1.x + (j / m1) * nnx, y: v1.y + (j / m1) * nny },
      v2: { x: v2.x - (j / m2) * nnx, y: v2.y - (j / m2) * nny }
    };
  }

  function kineticEnergy(m, v) { return 0.5 * m * v * v; }

  function potentialEnergy(m, g, h) { return m * (g || 9.81) * h; }

  function springEnergy(k, x) { return 0.5 * k * x * x; }

  function workDone(F, d, alphaDeg) {
    const alpha = (alphaDeg || 0) * Math.PI / 180;
    return F * d * Math.cos(alpha);
  }

  function powerInstant(F, v) { return F * v; }

  function angularMomentum(I, omega) { return I * omega; }

  function torqueFromForce(rx, ry, fx, fy) { return rx * fy - ry * fx; }

  function momentOfInertia(m, r) { return m * r * r; }

  function momentOfInertiaDisk(m, r) { return 0.5 * m * r * r; }

  function momentOfInertiaRodCenter(m, L) { return (1 / 12) * m * L * L; }

  function momentOfInertiaRodEnd(m, L) { return (1 / 3) * m * L * L; }

  function parallelAxis(I_cm, m, d) { return I_cm + m * d * d; }

  function dalembertForce(m, ax, ay) { return { fx: -m * ax, fy: -m * ay }; }

  function equilibriumWithInertia(F_ext, m, ax, ay) {
    let sumFx = 0, sumFy = 0;
    for (const f of (F_ext || [])) { sumFx += f.fx; sumFy += f.fy; }
    sumFx += -m * ax;
    sumFy += -m * ay;
    return { sumFx, sumFy, balanced: Math.abs(sumFx) < 1e-6 && Math.abs(sumFy) < 1e-6 };
  }

  return {
    accelerationFromForce, inertialForce, frictionForce, staticLimitAngle, slipCondition,
    eulerStep, rk4Step, integrateMotion,
    elasticCollision, inelasticCollision, restitutionVelocity,
    momentumBefore, momentumAfter, momentum2d, resolveCollision2D,
    kineticEnergy, potentialEnergy, springEnergy, workDone, powerInstant,
    angularMomentum, torqueFromForce, momentOfInertia, momentOfInertiaDisk,
    momentOfInertiaRodCenter, momentOfInertiaRodEnd, parallelAxis,
    dalembertForce, equilibriumWithInertia
  };
});
