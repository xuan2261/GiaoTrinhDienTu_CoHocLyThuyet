/**
 * Dynamics physics helpers — Newton's laws, ODE solvers, collision, energy, angular momentum.
 * Phase 1 infrastructure for 58-route simulation rebuild.
 */
(function() {
'use strict';

// ─── Newton's Laws ────────────────────────────────────────────────────────────

/**
 * Acceleration from force: a = F / m.
 * @param {number} F - Net force magnitude N
 * @param {number} m - Mass kg
 * @returns {number}
 */
function accelerationFromForce(F, m) { return m ? F / m : 0; }

/**
 * Inertial force (D'Alembert): F* = -m * a.
 * @param {number} m - Mass kg
 * @param {number} ax, ay - Acceleration components m/s^2
 * @returns {{fx: number, fy: number}}
 */
function inertialForce(m, ax, ay) {
  return { fx: -m * ax, fy: -m * ay };
}

// ─── Friction ─────────────────────────────────────────────────────────────────

/**
 * Kinetic/static friction force magnitude.
 * @param {number} mu - Friction coefficient
 * @param {number} N - Normal force N
 * @returns {number}
 */
function frictionForce(mu, N) { return mu * N; }

/**
 * Limiting static friction angle: tan(phi) = mu_s.
 * @param {number} mu - Static friction coefficient
 * @returns {number} phi in radians
 */
function staticLimitAngle(mu) { return Math.atan(mu); }

/**
 * Check if body slips on incline.
 * @param {number} alphaDeg - Incline angle degrees
 * @param {number} mu - Static friction coefficient
 * @returns {{slips: boolean, phi: number}}
 */
function slipCondition(alphaDeg, mu) {
  const alpha = alphaDeg * Math.PI / 180;
  const phi = Math.atan(mu);
  return { slips: alpha > phi, phi: phi * 180 / Math.PI };
}

// ─── ODE Solvers ─────────────────────────────────────────────────────────────

/**
 * Euler (forward) integration step.
 * @param {{x: number, v: number}} state - Current state
 * @param {number} dt - Time step s
 * @param {Function} derivativeFn - Returns {dx, dv} from state
 * @returns {{x: number, v: number}}
 */
function eulerStep(state, dt, derivativeFn) {
  const d = derivativeFn(state);
  return { x: state.x + d.dx * dt, v: state.v + d.dv * dt };
}

/**
 * RK4 (4th-order Runge-Kutta) integration step.
 * @param {{x: number, v: number}} state - Current state
 * @param {number} dt - Time step s
 * @param {Function} derivativeFn - Returns {dx, dv} from state
 * @returns {{x: number, v: number}}
 */
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

/**
 * Integrate spring-mass system: x'' + (k/m)*x = F_ext/m.
 * @param {number} m - Mass kg
 * @param {number} k - Spring constant N/m
 * @param {Function} F_ext - External force function F(x, v) -> N
 * @param {number} v0 - Initial velocity m/s
 * @param {number} x0 - Initial position m
 * @param {number} dt - Time step s
 * @returns {{x: number, v: number}}
 */
function integrateMotion(m, k, F_ext, v0, x0, dt) {
  const deriv = s => ({ dx: s.v, dv: (F_ext(s.x, s.v) - k * s.x) / m });
  return rk4Step({ x: x0 || 0, v: v0 || 0 }, dt, deriv);
}

// ─── Collision ────────────────────────────────────────────────────────────────

/**
 * 1D elastic collision (e = 1).
 * @param {number} m1, m2 - Masses kg
 * @param {number} v1, v2 - Initial velocities m/s
 * @returns {{v1: number, v2: number}}
 */
function elasticCollision(m1, m2, v1, v2) {
  const total = m1 + m2 || 1;
  return {
    v1: ((m1 - m2) * v1 + 2 * m2 * v2) / total,
    v2: ((m2 - m1) * v2 + 2 * m1 * v1) / total
  };
}

/**
 * 1D perfectly inelastic collision (e = 0).
 * @param {number} m1, m2 - Masses kg
 * @param {number} v1, v2 - Initial velocities m/s
 * @returns {{v: number}}
 */
function inelasticCollision(m1, m2, v1, v2) {
  const total = m1 + m2 || 1;
  return { v: (m1 * v1 + m2 * v2) / total };
}

/**
 * 1D collision with arbitrary restitution coefficient.
 * @param {number} m1, m2 - Masses kg
 * @param {number} v1, v2 - Initial velocities m/s
 * @param {number} e - Restitution coefficient [0, 1]
 * @returns {{v1: number, v2: number}}
 */
function restitutionVelocity(m1, m2, v1, v2, e) {
  const total = m1 + m2 || 1;
  return {
    v1: ((m1 - e * m2) * v1 + (1 + e) * m2 * v2) / total,
    v2: ((m2 - e * m1) * v2 + (1 + e) * m1 * v1) / total
  };
}

/**
 * Total momentum before collision.
 * @param {number} m1, m2 - Masses kg
 * @param {number} v1, v2 - Velocities m/s
 * @returns {number}
 */
function momentumBefore(m1, m2, v1, v2) { return m1 * v1 + m2 * v2; }

/**
 * Total momentum after collision.
 * @param {{v1: number, v2: number}} result - Post-collision velocities
 * @param {number} m1, m2 - Masses kg
 * @returns {number}
 */
function momentumAfter(result, m1, m2) { return m1 * result.v1 + m2 * result.v2; }

/**
 * 2D collision resolution with normal/tangential decomposition.
 * @param {number} m1, m2 - Masses kg
 * @param {{x: number, y: number}} p1, p2 - Positions
 * @param {{x: number, y: number}} v1, v2 - Velocities
 * @param {number} e - Restitution coefficient [0, 1]
 * @returns {{v1: {x: number, y: number}, v2: {x: number, y: number}}}
 */
function resolveCollision2D(m1, m2, p1, p2, v1, v2, e) {
  const nx = p2.x - p1.x, ny = p2.y - p1.y;
  const dist = Math.hypot(nx, ny);
  if (dist < 1e-9) return { v1, v2 };
  const nnx = nx / dist, nny = ny / dist;

  const vrx = v1.x - v2.x, vry = v1.y - v2.y;
  const vrn = vrx * nnx + vry * nny;
  if (vrn >= 0) return { v1, v2 };

  const tx = -nny, ty = nnx;
  const v1t = v1.x * tx + v1.y * ty;
  const v2t = v2.x * tx + v2.y * ty;
  const j = -(1 + e) * vrn / (1 / m1 + 1 / m2);

  return {
    v1: { x: v1.x + (j / m1) * nnx, y: v1.y + (j / m1) * nny },
    v2: { x: v2.x - (j / m2) * nnx, y: v2.y - (j / m2) * nny }
  };
}

// ─── Energy ──────────────────────────────────────────────────────────────────

/**
 * Kinetic energy: T = 0.5 * m * v^2.
 * @param {number} m - Mass kg
 * @param {number} v - Speed m/s
 * @returns {number}
 */
function kineticEnergy(m, v) { return 0.5 * m * v * v; }

/**
 * Potential energy: V = m * g * h.
 * @param {number} m - Mass kg
 * @param {number} g - Gravity m/s^2
 * @param {number} h - Height m
 * @returns {number}
 */
function potentialEnergy(m, g, h) { return m * (g || 9.81) * h; }

/**
 * Spring potential energy: V = 0.5 * k * x^2.
 * @param {number} k - Spring constant N/m
 * @param {number} x - Displacement m
 * @returns {number}
 */
function springEnergy(k, x) { return 0.5 * k * x * x; }

/**
 * Work done by constant force: A = F * d * cos(alpha).
 * @param {number} F - Force N
 * @param {number} d - Displacement m
 * @param {number} alphaDeg - Angle between force and displacement degrees
 * @returns {number}
 */
function workDone(F, d, alphaDeg) {
  const alpha = (alphaDeg || 0) * Math.PI / 180;
  return F * d * Math.cos(alpha);
}

/**
 * Instantaneous power: N = F * v.
 * @param {number} F - Force N
 * @param {number} v - Velocity m/s
 * @returns {number}
 */
function powerInstant(F, v) { return F * v; }

// ─── Angular Momentum ─────────────────────────────────────────────────────────

/**
 * Angular momentum: L = I * omega.
 * @param {number} I - Moment of inertia kg*m^2
 * @param {number} omega - Angular velocity rad/s
 * @returns {number}
 */
function angularMomentum(I, omega) { return I * omega; }

/**
 * Torque from force: M = r × F (2D signed).
 * @param {number} rx, ry - Position vector components from pivot
 * @param {number} fx, fy - Force components
 * @returns {number}
 */
function torqueFromForce(rx, ry, fx, fy) { return rx * fy - ry * fx; }

/**
 * Moment of inertia — point mass: I = m * r^2.
 * @param {number} m - Mass kg
 * @param {number} r - Distance from axis m
 * @returns {number}
 */
function momentOfInertia(m, r) { return m * r * r; }

/**
 * Moment of inertia — disk/cylinder about central axis: I = 0.5 * m * r^2.
 * @param {number} m - Mass kg
 * @param {number} r - Radius m
 * @returns {number}
 */
function momentOfInertiaDisk(m, r) { return 0.5 * m * r * r; }

/**
 * Moment of inertia — uniform thin rod about center: I = (1/12) * m * L^2.
 * @param {number} m - Mass kg
 * @param {number} L - Length m
 * @returns {number}
 */
function momentOfInertiaRodCenter(m, L) { return (1 / 12) * m * L * L; }

/**
 * Moment of inertia — uniform thin rod about end: I = (1/3) * m * L^2.
 * @param {number} m - Mass kg
 * @param {number} L - Length m
 * @returns {number}
 */
function momentOfInertiaRodEnd(m, L) { return (1 / 3) * m * L * L; }

/**
 * Parallel axis theorem: I_O = I_cm + m * d^2.
 * @param {number} I_cm - Moment of inertia about center of mass
 * @param {number} m - Mass kg
 * @param {number} d - Distance between axes m
 * @returns {number}
 */
function parallelAxis(I_cm, m, d) { return I_cm + m * d * d; }

// ─── D'Alembert ──────────────────────────────────────────────────────────────

/**
 * D'Alembert inertial force: F* = -m * a.
 * @param {number} m - Mass kg
 * @param {number} ax, ay - Acceleration m/s^2
 * @returns {{fx: number, fy: number}}
 */
function dalembertForce(m, ax, ay) { return { fx: -m * ax, fy: -m * ay }; }

/**
 * Equilibrium condition with inertia: ΣF + F* = 0.
 * @param {Array<{fx: number, fy: number}>} F_ext - External forces
 * @param {number} m - Mass kg
 * @param {number} ax, ay - Acceleration m/s^2
 * @returns {{sumFx: number, sumFy: number, balanced: boolean}}
 */
function equilibriumWithInertia(F_ext, m, ax, ay) {
  let sumFx = 0, sumFy = 0;
  for (const f of (F_ext || [])) { sumFx += f.fx; sumFy += f.fy; }
  sumFx += -m * ax;
  sumFy += -m * ay;
  return { sumFx, sumFy, balanced: Math.abs(sumFx) < 1e-6 && Math.abs(sumFy) < 1e-6 };
}

// ─── Public API ───────────────────────────────────────────────────────────────

window.SimPhysicsDynamics = {
  accelerationFromForce,
  inertialForce,
  frictionForce,
  staticLimitAngle,
  slipCondition,
  eulerStep,
  rk4Step,
  integrateMotion,
  elasticCollision,
  inelasticCollision,
  restitutionVelocity,
  momentumBefore,
  momentumAfter,
  resolveCollision2D,
  kineticEnergy,
  potentialEnergy,
  springEnergy,
  workDone,
  powerInstant,
  angularMomentum,
  torqueFromForce,
  momentOfInertia,
  momentOfInertiaDisk,
  momentOfInertiaRodCenter,
  momentOfInertiaRodEnd,
  parallelAxis,
  dalembertForce,
  equilibriumWithInertia
};

})();
