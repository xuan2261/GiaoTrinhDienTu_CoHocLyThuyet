/**
 * Ch3 dynamics behaviors — Part 1: Newton laws + ODE + D'Alembert (9 routes).
 * Routes: ch3-1-2, ch3-1-3, ch3-2-1, ch3-2-2, ch3-2-3, ch3-2-5,
 * ch3-3-1, ch3-3-2, ch3-4-1, ch3-4-2
 */
(function() {
'use strict';

const registry = window.SimRouteBehaviors;
if (!registry) {
  console.warn('SimRouteBehaviors missing for Ch3 dynamics');
  return;
}

const Phys = window.SimPhysicsDynamics || {};

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function rk4Step(state, dt, derivFn) {
  const k1 = derivFn(state);
  const k2 = derivFn({ x: state.x + k1.dx * dt / 2, v: state.v + k1.dv * dt / 2 });
  const k3 = derivFn({ x: state.x + k2.dx * dt / 2, v: state.v + k2.dv * dt / 2 });
  const k4 = derivFn({ x: state.x + k3.dx * dt, v: state.v + k3.dv * dt });
  return {
    x: state.x + (k1.dx + 2 * k2.dx + 2 * k3.dx + k4.dx) * dt / 6,
    v: state.v + (k1.dv + 2 * k2.dv + 2 * k3.dv + k4.dv) * dt / 6
  };
}

// ─── onTick functions (ch3-1-2 through ch3-4-2) ─────────────────────────────

function onTick_ch312(scene, state, dt) {
  const m = state.m || 5, F = state.F || 50;
  state.accel = F / m;
  state.v = (state.v || 0) + state.accel * dt;
  state.x += state.v * dt;
  state._t = (state._t || 0) + dt;
}

function onTick_ch313(scene, state, dt) {
  const m = state.m || 5, aFrame = state.a_frame || 2;
  state.pseudoForce = m * aFrame;
  state.accel = aFrame;
  state._t = (state._t || 0) + dt;
}

function onTick_ch321(scene, state, dt) {
  const alpha = ((state.alpha || 0) * Math.PI) / 180;
  const Fnet = (state.F || 50) * Math.cos(alpha);
  const m = state.m || 5;
  state.accel = Fnet / m;
  state.v = Math.abs(state.accel) < 0.01 ? (state.v || 5) : (state.v || 0) + state.accel * dt;
  state.x += (state.v || 0) * dt;
  state._t = (state._t || 0) + dt;
}

function onTick_ch322(scene, state, dt) {
  const m = state.m || 5, F = state.F || 50;
  state.accel = F / m;
  state.v = (state.v || 0) + state.accel * dt;
  state.x += state.v * dt;
  state._t = (state._t || 0) + dt;
}

function onTick_ch323(scene, state, dt) {
  const m1 = state.m || 5, m2 = state.m2 || 3, F = state.F || 50;
  state.a1 = F / m1; state.a2 = -F / m2;
  state.v1 = (state.v1 || 0) + state.a1 * dt;
  state.v2 = (state.v2 || 0) + state.a2 * dt;
  state._t = (state._t || 0) + dt;
}

function onTick_ch325(scene, state, dt) {
  const m = state.m || 5, F = state.F || 50;
  state.accel = F / m;
  state.inertiaForce = -m * state.accel;
  state.v = (state.v || 0) + state.accel * dt;
  state.x += state.v * dt;
  state._t = (state._t || 0) + dt;
}

function onTick_ch331(scene, state, dt) {
  const m = state.m || 2, k = state.k || 20;
  const deriv = s => ({ dx: s.v, dv: (-k / m) * s.x });
  const step = rk4Step({ x: state.x || 0, v: state.v || 0 }, dt, deriv);
  state.x = step.x; state.v = step.v;
  state.trajectory = state.trajectory || [];
  state.trajectory.push({ t: (state._t || 0), x: state.x, v: state.v });
  if (state.trajectory.length > 300) state.trajectory.shift();
  state._t = (state._t || 0) + dt;
  state.kinetic = 0.5 * m * state.v * state.v;
  state.potential = 0.5 * k * state.x * state.x;
}

function onTick_ch332(scene, state, dt) {
  const m1 = state.m || 2, m2 = state.m2 || 2, k = state.k || 20;
  const x1 = state.x || 0, x2 = state.x2 || 0;
  const a1 = (k / m1) * (x2 - x1);
  const a2 = (-k / m2) * (x2 - x1);
  state.v1 = (state.v1 || 0) + a1 * dt;
  state.v2 = (state.v2 || 0) + a2 * dt;
  state.x = x1 + state.v1 * dt;
  state.x2 = x2 + state.v2 * dt;
  (state.trajectory || []).push({ t: (state._t || 0), x: state.x });
  (state.trajectory2 || []).push({ t: (state._t || 0), x: state.x2 });
  if ((state.trajectory || []).length > 300) state.trajectory.shift();
  if ((state.trajectory2 || []).length > 300) state.trajectory2.shift();
  state._t = (state._t || 0) + dt;
}

function onTick_ch341(scene, state, dt) {
  const m = state.m || 5, F = state.F || 50;
  state.accel = F / m; state.F_inertia = -m * state.accel;
  state.v = (state.v || 0) + state.accel * dt;
  state.x += state.v * dt;
  state._t = (state._t || 0) + dt;
}

function onTick_ch342(scene, state, dt) {
  const m = state.m || 5, omega = 0.5, t = (state._t || 0);
  state.a = -omega * omega * Math.sin(omega * t) * 10;
  state.F = m * state.a;
  state._t = t + dt;
}

// ─── Derived functions ─────────────────────────────────────────────────────────

function derived_ch312(s, s2) {
  const force = s.F || 50, mass = s.m || 5;
  return { accel: force / mass, force, mass, v: s.v || 0 };
}
function derived_ch313(s, s2) {
  const mass = s.m || 5, accel = s.a_frame || 2;
  return { accel, pseudoForce: mass * accel, force: mass * accel };
}
function derived_ch321(s, s2) {
  const force = s.F || 50, mass = s.m || 5;
  const alpha = ((s.alpha || 0) * Math.PI) / 180;
  const net = force * Math.cos(alpha);
  return { accel: net / mass, force: net, v: s.v || 0 };
}
function derived_ch322(s, s2) {
  const force = s.F || 50, mass = s.m || 5;
  return { accel: force / mass, force, mass, velocity: s.v || 0, v: s.v || 0 };
}
function derived_ch323(s, s2) {
  const force = s.F || 50, m1 = s.m || 5, m2 = s.m2 || 3;
  return { force, a1: force / m1, a2: -force / m2 };
}
function derived_ch325(s, s2) {
  const force = s.F || 50, mass = s.m || 5, accel = force / mass;
  return { accel, inertiaForce: -mass * accel, force };
}
function derived_ch331(s, s2) {
  const m = s.m || 2;
  const k = s.k || 20;
  const kinetic = 0.5 * m * Math.pow(s.v || 0, 2);
  const potential = 0.5 * k * Math.pow(s.x || 0, 2);
  s.kinetic = kinetic;
  s.potential = potential;
  return { kinetic, potential, totalEnergy: kinetic + potential };
}
function derived_ch332(s, s2) { return { x1: s.x || 0, x2: s.x2 || 0, v1: s.v1 || 0, v2: s.v2 || 0 }; }
function derived_ch341(s, s2) {
  const force = s.F || 50, mass = s.m || 5, accel = force / mass;
  return { accel, F_inertia: -mass * accel, force };
}
function derived_ch342(s, s2) {
  const mass = s.m || 5;
  const accel = Number.isFinite(Number(s.a)) ? Number(s.a) : ((s.F || 0) / mass);
  return { accel, force: mass * accel };
}

// ─── Build and register (Part 1: ch3-1-2 through ch3-4-2) ─────────────────────

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
      state.ball1 = { x: 150, y: 180, vx: 8, vy: 0 };
      state.ball2 = { x: 380, y: 180, vx: -3, vy: 0 };
      state.collision = false;
      state.masses = [{ x: 130, y: 188, m: 2 }, { x: 238, y: 130, m: 1.5 }, { x: 332, y: 204, m: 1 }];
    }
  };
}

registry.registerMany({
  'ch3-1-2': makeBehavior('ch3-1-2', onTick_ch312, derived_ch312),
  'ch3-1-3': makeBehavior('ch3-1-3', onTick_ch313, derived_ch313),
  'ch3-2-1': makeBehavior('ch3-2-1', onTick_ch321, derived_ch321),
  'ch3-2-2': makeBehavior('ch3-2-2', onTick_ch322, derived_ch322),
  'ch3-2-3': makeBehavior('ch3-2-3', onTick_ch323, derived_ch323),
  'ch3-2-5': makeBehavior('ch3-2-5', onTick_ch325, derived_ch325),
  'ch3-3-1': makeBehavior('ch3-3-1', onTick_ch331, derived_ch331),
  'ch3-3-2': makeBehavior('ch3-3-2', onTick_ch332, derived_ch332),
  'ch3-4-1': makeBehavior('ch3-4-1', onTick_ch341, derived_ch341),
  'ch3-4-2': makeBehavior('ch3-4-2', onTick_ch342, derived_ch342)
});

})();
