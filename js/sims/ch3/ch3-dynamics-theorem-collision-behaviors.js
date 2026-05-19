/* Ch3 dynamics behaviors: theorems, collisions, exercises. */
(function() {
'use strict';

const registry = window.SimRouteBehaviors;
if (!registry) {
  console.warn('SimRouteBehaviors missing for Ch3 dynamics theorems');
  return;
}

const Phys = window.SimPhysicsDynamics || {};

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function finiteNumber(value, fallback) { const n = Number(value); return Number.isFinite(n) ? n : fallback; }
function momentum2d(b1, b2, m1, m2) {
  return { x: m1 * finiteNumber(b1.vx, 0) + m2 * finiteNumber(b2.vx, 0),
    y: m1 * finiteNumber(b1.vy, 0) + m2 * finiteNumber(b2.vy, 0) };
}
function setCollisionMomentum(state, before, after, residual) {
  state.momentumBefore = before; state.momentumAfter = after;
  state.pBefore = before; state.pAfter = after;
  state.restitutionResidual = residual || 0;
}

function onTick_ch351(scene, state, dt) {
  const masses = state.masses || [
    { x: 130, y: 188, m: 2 },
    { x: 238, y: 130, m: 1.5 },
    { x: 332, y: 204, m: 1 }
  ];
  let totalM = 0, xCM = 0, yCM = 0;
  for (const m of masses) { totalM += m.m; xCM += m.x * m.m; yCM += m.y * m.m; }
  state.xCM = xCM / totalM; state.yCM = yCM / totalM;
  state.aCM = (state.F || 50) / totalM;
  state._t = (state._t || 0) + dt;
}

function onTick_ch352(scene, state, dt) {
  const m = state.m || 2, J = state.J || 20;
  state.pBefore = m * 6; state.pAfter = state.pBefore + J; state.deltaP = J;
  state.impulseT = (state.impulseT || 0) + dt;
  state._t = (state._t || 0) + dt;
}

function onTick_ch353(scene, state, dt) {
  const I = state.I || 1, omega = state.omega || 2, r = state.r || 60;
  state.L = I * omega; state.angularMomentum = state.L;
  state._t = (state._t || 0) + dt;
}

function onTick_ch354(scene, state, dt) {
  const m = state.m || 5, k = state.k || 20, v0 = state.v0 || 3, t = (state._t || 0);
  const omega0 = Math.sqrt(k / m);
  state.x = v0 / omega0 * Math.cos(omega0 * t);
  state.v = -v0 * Math.sin(omega0 * t);
  state.kineticEnergy = 0.5 * m * state.v * state.v;
  state.potentialEnergy = 0.5 * k * state.x * state.x;
  state._t = t + dt;
}

function onTick_ch362(scene, state, dt) {
  const b1 = state.ball1 || { x: 150, y: 180, vx: 8, vy: 0 };
  const b2 = state.ball2 || { x: 380, y: 180, vx: -3, vy: 0 };
  const e = state.e || 1, m1 = state.m1 || 1, m2 = state.m2 || 1;
  b1.x += b1.vx; b1.y += b1.vy; b2.x += b2.vx; b2.y += b2.vy;
  if (b1.x < 25 || b1.x > 535) { b1.vx *= -1; b1.x = clamp(b1.x, 25, 535); }
  if (b1.y < 60 || b1.y > 290) { b1.vy *= -1; b1.y = clamp(b1.y, 60, 290); }
  if (b2.x < 20 || b2.x > 540) { b2.vx *= -1; b2.x = clamp(b2.x, 20, 540); }
  if (b2.y < 60 || b2.y > 290) { b2.vy *= -1; b2.y = clamp(b2.y, 60, 290); }
  const p0 = momentum2d(b1, b2, m1, m2);
  setCollisionMomentum(state, p0, p0, 0);
  const dist = Math.hypot(b1.x - b2.x, b1.y - b2.y);
  const r1 = 25, r2 = 20;
  if (dist > 1e-6 && dist < r1 + r2) {
    const nx = (b2.x - b1.x) / dist, ny = (b2.y - b1.y) / dist;
    const vrx = b1.vx - b2.vx, vry = b1.vy - b2.vy;
    const vrn = vrx * nx + vry * ny;
    if (vrn > 0) {
      const j = -(1 + e) * vrn / (1 / m1 + 1 / m2);
      const jx = j * nx, jy = j * ny;
      b1.vx += jx / m1; b1.vy += jy / m1;
      b2.vx -= jx / m2; b2.vy -= jy / m2;
      const postRel = (b1.vx - b2.vx) * nx + (b1.vy - b2.vy) * ny;
      state.preRelativeNormal = vrn; state.postRelativeNormal = postRel;
      setCollisionMomentum(state, p0, momentum2d(b1, b2, m1, m2), Math.abs(postRel + e * vrn));
      state.collision = true; state.collisionX = (b1.x + b2.x) / 2; state.collisionY = (b1.y + b2.y) / 2;
      state.impulseFlash = { arrows: [{ x: b1.x, y: b1.y, dx: jx, dy: jy }, { x: b2.x, y: b2.y, dx: -jx, dy: -jy }] };
    }
  } else { state.collision = false; }
  state.ball1 = b1; state.ball2 = b2; state._t = (state._t || 0) + dt;
}

function onTick_ch363(scene, state, dt) {
  const m1 = finiteNumber(state.m1, 1), m2 = finiteNumber(state.m2, 1), v1 = finiteNumber(state.v1, 5), v2 = finiteNumber(state.v2, -3), e = finiteNumber(state.e, 0.8);
  const result = Phys.restitutionVelocity ? Phys.restitutionVelocity(m1, m2, v1, v2, e) : { v1, v2 };
  state.v1After = result.v1; state.v2After = result.v2;
  state.pBefore = m1 * v1 + m2 * v2; state.pAfter = m1 * result.v1 + m2 * result.v2;
  state._t = (state._t || 0) + dt;
}

function onTick_ch371(scene, state, dt) {
  const theorems = ['Định lý khối tâm', 'Định lý động lượng', 'Định lý mô men động lượng', 'Định lý động năng'];
  const pt = Math.floor(state.problemType || 0) % 4;
  state.selectedTheorem = theorems[pt]; state.problemType = pt;
  state._t = (state._t || 0) + dt;
}

function onTick_ch372(scene, state, dt) {
  const t = (state._t || 0);
  const scale = Number.isFinite(Number(state.residualScale)) ? Number(state.residualScale) : 1;
  state.residual1 = (0.02 + 0.01 * Math.sin(t * 2)) * scale;
  state.residual2 = (0.03 + 0.01 * Math.cos(t * 1.5)) * scale;
  state.residual3 = (0.01 + 0.005 * Math.sin(t * 3)) * scale;
  state.residual4 = (0.04 + 0.015 * Math.cos(t * 2.5)) * scale;
  state.score = Math.max(0, Math.min(100, 100 -
    (state.residual1 + state.residual2 + state.residual3 + state.residual4) * 400));
  state._t = t + dt;
}

function derived_ch351(s, s2) {
  const masses = s.masses || [
    { x: 130, y: 188, m: 2 },
    { x: 238, y: 130, m: 1.5 },
    { x: 332, y: 204, m: 1 }
  ];
  let totalM = 0, xCM = 0, yCM = 0;
  masses.forEach(item => {
    const mass = item.m || 1;
    totalM += mass;
    xCM += (item.x || 0) * mass;
    yCM += (item.y || 0) * mass;
  });
  totalM = totalM || 1;
  return { xCM: xCM / totalM, yCM: yCM / totalM, aCM: (s.F || 50) / totalM, force: s.F || 50 };
}
function derived_ch352(s, s2) {
  const mass = s.m || 2, impulse = s.J || 20;
  const pBefore = mass * 6;
  return { pBefore, pAfter: pBefore + impulse, deltaP: impulse, force: impulse };
}
function derived_ch353(s, s2) {
  const I = Number.isFinite(Number(s.I)) ? Number(s.I) : 1;
  const omega = Number.isFinite(Number(s.omega)) ? Number(s.omega) : 2;
  const L = Number.isFinite(Number(s.L)) ? Number(s.L) : I * omega;
  return { L, I, omega, moment: L * 130 };
}
function derived_ch354(s, s2) {
  const mass = s.m || 5, speed = Number.isFinite(Number(s.v0)) ? Number(s.v0) : 3;
  const kinetic = Number.isFinite(Number(s.kineticEnergy)) ? Number(s.kineticEnergy) : 0.5 * mass * speed * speed;
  return { kineticEnergy: kinetic, potentialEnergy: s.potentialEnergy || 0, force: kinetic / 9 };
}
function derived_ch362(s, s2) {
  const b1 = s.ball1 || { vx: 8, vy: 0 };
  const b2 = s.ball2 || { vx: -3, vy: 0 };
  const pNow = momentum2d(b1, b2, s.m1 || 1, s.m2 || 1);
  const pBefore = s.momentumBefore || s.pBefore || pNow, pAfter = s.momentumAfter || s.pAfter || pNow;
  return { pBefore, pAfter, momentumBefore: pBefore, momentumAfter: pAfter,
    restitutionResidual: Number.isFinite(Number(s.restitutionResidual)) ? s.restitutionResidual : 0, collision: s.collision || false };
}
function derived_ch363(s, s2) {
  const m1 = finiteNumber(s.m1, 1), m2 = finiteNumber(s.m2, 1), v1 = finiteNumber(s.v1, 5), v2 = finiteNumber(s.v2, -3), e = finiteNumber(s.e, 0.8);
  const result = Phys.restitutionVelocity ?
    Phys.restitutionVelocity(m1, m2, v1, v2, e) :
    { v1, v2 };
  return { collision: result, pBefore: m1 * v1 + m2 * v2, pAfter: m1 * result.v1 + m2 * result.v2 };
}
function derived_ch371(s, s2) {
  const theorems = ['Định lý khối tâm', 'Định lý động lượng', 'Định lý mô men động lượng', 'Định lý động năng'];
  const index = Math.max(0, Math.min(3, Math.floor(s.problemType || 0)));
  return { selectedTheorem: theorems[index], force: s.F || 50 };
}
function derived_ch372(s, s2) {
  const scale = Number.isFinite(Number(s.residualScale)) ? Number(s.residualScale) : 1;
  const t = s._t || 0;
  const r1 = (0.02 + 0.01 * Math.sin(t * 2)) * scale;
  const r2 = (0.03 + 0.01 * Math.cos(t * 1.5)) * scale;
  const r3 = (0.01 + 0.005 * Math.sin(t * 3)) * scale;
  const r4 = (0.04 + 0.015 * Math.cos(t * 2.5)) * scale;
  const score = Math.max(0, Math.min(100, 100 - (r1 + r2 + r3 + r4) * 400));
  return { residual1: r1, residual2: r2, residual3: r3, residual4: r4,
    score, force: s.F || 50 };
}

function makeBehavior(routeId, onTickFn, derivedFn) {
  return {
    behaviorId: `ch3-behavior-${routeId}`,
    derivedModelId: `ch3-derived-${routeId}`,
    interactionSchemaId: `ch3-interactions-${routeId}`,
    onTick: onTickFn,
    derived(scene, state) { return derivedFn(state, scene); },
    onReset(scene, state) {
      state.x = 0; state.v = 0; state.t = 0; state._t = 0;
      state.trajectory = []; state.trajectory2 = [];
      delete state.ball1; delete state.ball2; delete state.collision; delete state.masses;
      if (routeId === 'ch3-5-1') {
        state.masses = [{ x: 130, y: 188, m: 2 }, { x: 238, y: 130, m: 1.5 }, { x: 332, y: 204, m: 1 }];
      }
      if (routeId === 'ch3-6-2') {
        state.ball1 = { x: 150, y: 180, vx: 8, vy: 0 };
        state.ball2 = { x: 380, y: 180, vx: -3, vy: 0 };
        const p = momentum2d(state.ball1, state.ball2, state.m1 || 1, state.m2 || 1);
        setCollisionMomentum(state, p, p, 0);
        state.collision = false;
      }
    }
  };
}
registry.registerMany({
  'ch3-5-1': makeBehavior('ch3-5-1', onTick_ch351, derived_ch351),
  'ch3-5-2': makeBehavior('ch3-5-2', onTick_ch352, derived_ch352),
  'ch3-5-3': makeBehavior('ch3-5-3', onTick_ch353, derived_ch353),
  'ch3-5-4': makeBehavior('ch3-5-4', onTick_ch354, derived_ch354),
  'ch3-6-2': makeBehavior('ch3-6-2', onTick_ch362, derived_ch362),
  'ch3-6-3': makeBehavior('ch3-6-3', onTick_ch363, derived_ch363),
  'ch3-7-1': makeBehavior('ch3-7-1', onTick_ch371, derived_ch371),
  'ch3-7-2': makeBehavior('ch3-7-2', onTick_ch372, derived_ch372)
});

})();
