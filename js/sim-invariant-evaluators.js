(function() {
'use strict';

const statics = window.SimPhysicsStatics || {};
const kinematics = window.SimPhysicsKinematics || {};
const dynamics = window.SimPhysicsDynamics || {};
const specs = window.SimRouteInvariants || { get: () => null };
const DEG = Math.PI / 180;
const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const mag = vector => Math.hypot(vector.x || 0, vector.y || 0);
const isNum = value => Number.isFinite(Number(value));
const hasPoint = point => point && isNum(point.x) && isNum(point.y);
const hasVector = vector => vector && (isNum(vector.x) || isNum(vector.vx)) && (isNum(vector.y) || isNum(vector.vy));
const readVec = value => value && isNum(value.x) && isNum(value.y) ? { x: finite(value.x, 0), y: finite(value.y, 0) } : null;

function statusFor(residual, tolerance, margin) {
  const tol = finite(tolerance, 1e-6);
  if (Number.isFinite(margin) && margin < -tol) return 'fail';
  if (Math.abs(residual) <= tol) return 'pass';
  if (Math.abs(residual) <= tol * 5) return 'warn';
  return 'fail';
}

function result(routeId, residual, tolerance, values) {
  return { routeId, residual: Math.abs(residual || 0), status: statusFor(residual || 0, tolerance, values && values.margin), values: values || {} };
}

function missing(routeId, field, tolerance) {
  return { routeId, residual: finite(tolerance, 1e-6) * 10, status: 'fail', values: { missing: field } };
}

function vectorFromPoints(from, to) {
  return { x: finite(to && to.x, 0) - finite(from && from.x, 0), y: finite(to && to.y, 0) - finite(from && from.y, 0) };
}

function forceResultant(routeId, state, tolerance) {
  const origin = state.origin || { x: 200, y: 300 };
  const f1 = state.f1 || (hasPoint(state.primary) ? vectorFromPoints(origin, state.primary) : null);
  const f2 = state.f2 || (hasPoint(state.secondary) ? vectorFromPoints(origin, state.secondary) : null);
  const resultant = state.resultant || state.r || null;
  if (!hasVector(f1) || !hasVector(f2) || !hasVector(resultant)) return missing(routeId, 'f1/f2/resultant', tolerance);
  const expected = { x: f1.x + f2.x, y: f1.y + f2.y };
  const residual = Math.hypot(resultant.x - expected.x, resultant.y - expected.y);
  return result(routeId, residual, tolerance, {
    f1Magnitude: mag(f1),
    f2Magnitude: mag(f2),
    resultantMagnitude: mag(resultant),
    components: expected
  });
}

function frictionCone(routeId, state, tolerance) {
  if (!isNum(state.alpha) || !isNum(state.mu)) return missing(routeId, 'alpha/mu', tolerance);
  const alpha = finite(state.alpha, 0);
  const mu = finite(state.mu, 0);
  const margin = mu - Math.tan(alpha * DEG);
  return result(routeId, Math.max(0, -margin), tolerance, {
    alpha,
    mu,
    phi: Math.atan(mu) / DEG,
    margin,
    slipState: margin >= -finite(tolerance, 1e-6) ? 'hold' : 'slip'
  });
}

function derivativeChain(routeId, state, tolerance) {
  if (!isNum(state.t)) return missing(routeId, 't', tolerance);
  const t = finite(state.t, 0);
  const scale = finite(state.scale, 54);
  const expected = {
    x: scale * Math.sin(t),
    v: scale * Math.cos(t),
    a: -scale * Math.sin(t)
  };
  const xRaw = isNum(state.x) ? state.x : state.xVal;
  const vRaw = isNum(state.v) ? state.v : state.vVal;
  const aRaw = isNum(state.a) ? state.a : state.aVal;
  if (!isNum(xRaw) || !isNum(vRaw) || !isNum(aRaw)) return missing(routeId, 'x/v/a', tolerance);
  const x = finite(xRaw, 0);
  const v = finite(vRaw, 0);
  const a = finite(aRaw, 0);
  const residual = Math.max(Math.abs(x - expected.x), Math.abs(v - expected.v), Math.abs(a - expected.a));
  return result(routeId, residual, tolerance, { t, x, v, a, expected });
}

function instantCenter(routeId, state, tolerance) {
  const ic = state.ic || (isNum(state.icX) && isNum(state.icY) ? { x: finite(state.icX, 0), y: finite(state.icY, 0) } : null);
  const point = state.point || (isNum(state.bx) && isNum(state.by) ? { x: finite(state.bx, 0), y: finite(state.by, 0) } : null);
  if (!hasPoint(ic) || !hasPoint(point) || !isNum(state.omega)) return missing(routeId, 'ic/point/omega', tolerance);
  const omega = finite(state.omega, 1);
  const rx = point.x - ic.x, ry = point.y - ic.y;
  const expected = kinematics.instantCenterVelocity ? kinematics.instantCenterVelocity(omega, rx, ry) : { vx: -omega * ry, vy: omega * rx };
  const velocity = state.velocity || state.vB || null;
  if (!hasVector(velocity)) return missing(routeId, 'velocity', tolerance);
  const residual = Math.hypot((velocity.vx || 0) - expected.vx, (velocity.vy || 0) - expected.vy);
  const perpendicularResidual = Math.abs(rx * (velocity.vx || 0) + ry * (velocity.vy || 0));
  return result(routeId, residual, tolerance, {
    omega,
    radius: Math.hypot(rx, ry),
    velocityMagnitude: Math.hypot(velocity.vx || 0, velocity.vy || 0),
    perpendicularResidual
  });
}

function springEnergy(routeId, state, tolerance) {
  if (!isNum(state.x) || !isNum(state.v) || !isNum(state.x0) || !isNum(state.v0)) return missing(routeId, 'x/v/x0/v0', tolerance);
  const m = finite(state.m || state.mass, 1);
  const k = finite(state.k || state.stiffness, 10);
  const x = finite(state.x, 0);
  const v = finite(state.v, 0);
  const x0 = finite(state.x0, x);
  const v0 = finite(state.v0, v);
  const kinetic = dynamics.kineticEnergy ? dynamics.kineticEnergy(m, v) : 0.5 * m * v * v;
  const potential = dynamics.springEnergy ? dynamics.springEnergy(k, x) : 0.5 * k * x * x;
  const initial = 0.5 * m * v0 * v0 + 0.5 * k * x0 * x0;
  const energy = kinetic + potential;
  return result(routeId, Math.abs(energy - initial), tolerance, { x, v, kinetic, potential, energy, initial, energyDrift: energy - initial });
}

function collision(routeId, state, tolerance) {
  const m1 = finite(state.m1, finite(state.mass1, 1));
  const m2 = finite(state.m2, finite(state.mass2, 1));
  if (state.ball1 && state.ball2) return collision2d(routeId, state, tolerance, m1, m2);
  if (!isNum(state.v1) || !isNum(state.v2)) return missing(routeId, 'v1/v2 or ball1/ball2', tolerance);
  const v1 = finite(state.v1, state.ball1 && state.ball1.vx || 0);
  const v2 = finite(state.v2, state.ball2 && state.ball2.vx || 0);
  const e = finite(state.e !== undefined ? state.e : state.restitution, 1);
  const post = state.post || (dynamics.restitutionVelocity ? dynamics.restitutionVelocity(m1, m2, v1, v2, e) : { v1, v2 });
  const before = m1 * v1 + m2 * v2;
  const after = m1 * post.v1 + m2 * post.v2;
  const restitutionResidual = Math.abs((post.v2 - post.v1) + e * (v2 - v1));
  return result(routeId, Math.max(Math.abs(after - before), restitutionResidual), tolerance, {
    momentumBefore: before,
    momentumAfter: after,
    restitutionResidual,
    post
  });
}

function collision2d(routeId, state, tolerance, m1, m2) {
  const b1 = state.ball1, b2 = state.ball2;
  if (!isNum(b1.vx) || !isNum(b1.vy) || !isNum(b2.vx) || !isNum(b2.vy)) return missing(routeId, 'ball velocities', tolerance);
  const e = finite(state.e !== undefined ? state.e : state.restitution, 1);
  const nxRaw = finite(b2.x, 0) - finite(b1.x, 0);
  const nyRaw = finite(b2.y, 0) - finite(b1.y, 0);
  const dist = Math.hypot(nxRaw, nyRaw);
  if (dist < 1e-9) return missing(routeId, 'collision normal', tolerance);
  const nx = nxRaw / dist, ny = nyRaw / dist;
  const before = {
    x: m1 * b1.vx + m2 * b2.vx,
    y: m1 * b1.vy + m2 * b2.vy
  };
  const hasRuntimePair = state.momentumBefore !== undefined || state.momentumAfter !== undefined ||
    state.pBefore !== undefined || state.pAfter !== undefined;
  const runtimeBefore = readVec(state.momentumBefore || state.pBefore);
  const runtimeAfter = readVec(state.momentumAfter || state.pAfter);
  if (hasRuntimePair && (!runtimeBefore || !runtimeAfter)) return missing(routeId, 'signed vector momentum', tolerance);
  if (runtimeBefore && runtimeAfter) {
    const restitutionResidual = isNum(state.restitutionResidual)
      ? Math.abs(finite(state.restitutionResidual, 0))
      : (isNum(state.preRelativeNormal) && isNum(state.postRelativeNormal)
        ? Math.abs(finite(state.postRelativeNormal, 0) + e * finite(state.preRelativeNormal, 0))
        : 0);
    const momentumResidual = Math.hypot(runtimeAfter.x - runtimeBefore.x, runtimeAfter.y - runtimeBefore.y);
    return result(routeId, Math.max(momentumResidual, restitutionResidual), tolerance, {
      momentumBefore: runtimeBefore,
      momentumAfter: runtimeAfter,
      restitutionResidual
    });
  }
  const vrn = (b1.vx - b2.vx) * nx + (b1.vy - b2.vy) * ny;
  let post = {
    v1: { x: b1.vx, y: b1.vy },
    v2: { x: b2.vx, y: b2.vy }
  };
  let restitutionResidual = 0;
  if (vrn > 0) {
    const j = -(1 + e) * vrn / (1 / m1 + 1 / m2);
    post = {
      v1: { x: b1.vx + (j / m1) * nx, y: b1.vy + (j / m1) * ny },
      v2: { x: b2.vx - (j / m2) * nx, y: b2.vy - (j / m2) * ny }
    };
    const postRel = (post.v1.x - post.v2.x) * nx + (post.v1.y - post.v2.y) * ny;
    restitutionResidual = Math.abs(postRel + e * vrn);
  }
  const after = {
    x: m1 * post.v1.x + m2 * post.v2.x,
    y: m1 * post.v1.y + m2 * post.v2.y
  };
  const momentumResidual = Math.hypot(after.x - before.x, after.y - before.y);
  return result(routeId, Math.max(momentumResidual, restitutionResidual), tolerance, {
    momentumBefore: before,
    momentumAfter: after,
    restitutionResidual,
    post
  });
}

const evaluators = {
  'force-resultant': forceResultant,
  'friction-cone-margin': frictionCone,
  'derivative-chain': derivativeChain,
  'instant-center-velocity': instantCenter,
  'spring-energy-drift': springEnergy,
  'collision-momentum-restitution': collision
};

function evaluateRoute(routeId, state) {
  const spec = specs.get(routeId);
  if (!spec || !evaluators[spec.invariant]) return { routeId, status: 'none', residual: 0, values: {} };
  const outcome = evaluators[spec.invariant](routeId, state || {}, spec.tolerance);
  outcome.spec = spec;
  return outcome;
}

window.SimInvariantEvaluators = Object.assign({ evaluateRoute }, evaluators);
})();
