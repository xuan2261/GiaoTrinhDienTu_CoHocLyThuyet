/**
 * Ch2 kinematics behaviors — Part 1: Trajectory + Graphs + Presets + Rotation.
 * Routes: ch2-1-1, ch2-1-2, ch2-1-3, ch2-1-4, ch2-2-2, ch2-3-2
 */
(function() {
'use strict';

const registry = window.SimRouteBehaviors;
if (!registry) return;

function updateTrajectoryState(state, dt) {
  const omega = state.omega || 1.5;
  const mode = state.mode || 'Elip';
  state.t = ((state.t || 0) + omega * dt) % (2 * Math.PI);
  syncParticleState(state, mode, omega);
}

function syncParticleState(state, mode, omega) {
  const t = state.t || 0;
  if (mode === 'Tròn') setCircularState(state, t, omega);
  else if (mode === 'Parabol') setParabolicState(state, t, omega);
  else setEllipseState(state, t, omega);
  const speed = Math.hypot(state.vx, state.vy);
  const tangent = speed ? { x: state.vx / speed, y: state.vy / speed } : { x: 1, y: 0 };
  state.speed = speed;
  state.at = (state.vx * state.ax + state.vy * state.ay) / Math.max(speed, 1);
  state.rho = radiusOfCurvature(state.vx, state.vy, state.ax, state.ay);
  state.an = Number.isFinite(state.rho) ? speed * speed / state.rho : 0;
  state.atx = state.at * tangent.x;
  state.aty = state.at * tangent.y;
  state.anx = state.ax - state.atx;
  state.any = state.ay - state.aty;
  state.primary = { x: state.currentX, y: state.currentY };
  pushTrail(state, state.primary);
}

function setCircularState(state, t, omega) {
  const r = 104;
  state.currentX = 350 + r * Math.cos(t);
  state.currentY = 224 - r * Math.sin(t);
  state.vx = -r * omega * Math.sin(t);
  state.vy = r * omega * Math.cos(t);
  state.ax = -r * omega * omega * Math.cos(t);
  state.ay = -r * omega * omega * Math.sin(t);
}

function setEllipseState(state, t, omega) {
  const a = 142, b = 92;
  state.currentX = 350 + a * Math.cos(t);
  state.currentY = 224 - b * Math.sin(t);
  state.vx = -a * omega * Math.sin(t);
  state.vy = b * omega * Math.cos(t);
  state.ax = -a * omega * omega * Math.cos(t);
  state.ay = -b * omega * omega * Math.sin(t);
}

function setParabolicState(state, t, omega) {
  const u = t / (Math.PI * 2);
  const k = omega / (Math.PI * 2);
  state.currentX = 142 + 374 * u;
  state.currentY = 326 - 286 * u + 238 * u * u;
  state.vx = 374 * k;
  state.vy = (286 - 476 * u) * k;
  state.ax = 0;
  state.ay = -476 * k * k;
}

function radiusOfCurvature(vx, vy, ax, ay) {
  const speed = Math.hypot(vx, vy);
  const cross = Math.abs(vx * ay - vy * ax);
  return cross > 1e-9 ? speed * speed * speed / cross : Infinity;
}

function pushTrail(state, point) {
  state.trail = Array.isArray(state.trail) ? state.trail : [];
  const last = state.trail[state.trail.length - 1];
  if (!last || Math.hypot(last.x - point.x, last.y - point.y) > 2) state.trail.push({ x: point.x, y: point.y });
  if (state.trail.length > 30) state.trail.splice(0, state.trail.length - 30);
}

function pushNamedTrail(state, key, point) {
  state[key] = Array.isArray(state[key]) ? state[key] : [];
  const trail = state[key];
  const last = trail[trail.length - 1];
  if (!last || Math.hypot(last.x - point.x, last.y - point.y) > 2) trail.push({ x: point.x, y: point.y });
  if (trail.length > 30) trail.splice(0, trail.length - 30);
}

function updateGraphState(state) {
  const t = state.t || 0;
  state.xVal = 54 * Math.sin(t);
  state.vVal = 54 * Math.cos(t);
  state.aVal = -54 * Math.sin(t);
  state.cursorX = 56 + ((t % (Math.PI * 2)) / (Math.PI * 2)) * 290;
  state.cursorY = 130 - 54 * Math.sin(t);
}

function updateStateFromSlider(scene, state, key, value) {
  const routeId = scene.routeId || state.routeId || '';
  state[key] = value;
  if (routeId === 'ch2-1-2') {
    updateGraphState(state);
  } else if (routeId === 'ch2-1-1' || routeId === 'ch2-1-4') {
    syncParticleState(state, state.mode || 'Elip', state.omega || 1.5);
    state.px = state.currentX;
    state.py = state.currentY;
  } else if (routeId === 'ch2-2-2') {
    state.omegaCur = state.omega || 1.5;
    state.r = 92;
    state.theta0 = state.theta || 0;
    state._t = 0;
    state.px = 266 + state.r * Math.cos(state.theta || 0);
    state.py = 178 - state.r * Math.sin(state.theta || 0);
    state.trail = [];
  } else if (routeId === 'ch2-3-2') {
    state.r1 = Math.max(28, Math.min(80, Number(state.r1) || 50));
    state.r2 = 90;
    state.omega2 = (state.omega || 1.5) * state.r1 / state.r2;
    state.transmission = state.omega2;
    state.trail1 = [];
    state.trail2 = [];
  }
}

registry.registerMany({
  'ch2-1-1': {
    behaviorId: 'ch2-1-1-trajectory-behavior',
    derivedModelId: 'ellipse-trajectory-derived',
    interactionSchemaId: 'trajectory-animation-interactions',
    updateStateFromSlider,
    onTick(scene, state, dt) {
      updateTrajectoryState(state, dt);
    }
  },
  'ch2-1-2': {
    behaviorId: 'ch2-1-2-graph-cursor-behavior',
    derivedModelId: 'graph-cursor-derived',
    interactionSchemaId: 'time-slider-interactions',
    updateStateFromSlider,
    onTick(scene, state, dt) {
      const omega = state.omega || 1.5;
      state.t = ((state.t || 0) + omega * 0.08 * dt) % (Math.PI * 2);
      updateGraphState(state);
      pushTrail(state, { x: state.cursorX, y: state.cursorY });
    }
  },
  'ch2-1-3': {
    behaviorId: 'ch2-1-3-natural-coords-behavior',
    derivedModelId: 'natural-coords-derived',
    interactionSchemaId: 'curve-parameter-interactions',
    onTick(scene, state, dt) {
      const omega = state.omega || 1.0;
      state.t = ((state.t || 0) + omega * dt) % (Math.PI * 2);
      const cx = 350, cy = 224;
      const r = Number.isFinite(Number(state.rho)) ? Math.max(1, Number(state.rho)) : 104;
      state.px = cx + r * Math.cos(state.t);
      state.py = cy + r * Math.sin(state.t);
      state.vx = -r * omega * Math.sin(state.t);
      state.vy = r * omega * Math.cos(state.t);
      const v = Math.hypot(state.vx, state.vy);
      state.an = v * v / r; state.at = 0; state.rho = r;
      pushTrail(state, { x: state.px, y: state.py });
    }
  },
  'ch2-1-4': {
    behaviorId: 'ch2-1-4-motion-presets-behavior',
    derivedModelId: 'motion-preset-derived',
    interactionSchemaId: 'preset-button-interactions',
    updateStateFromSlider,
    onTick(scene, state, dt) {
      const omega = state.omega || 1.5;
      state.t = ((state.t || 0) + omega * dt) % (Math.PI * 2);
      syncParticleState(state, state.mode || 'Elip', omega);
      state.px = state.currentX; state.py = state.currentY;
    }
  },
  'ch2-2-2': {
    behaviorId: 'ch2-2-2-fixed-axis-behavior',
    derivedModelId: 'rotational-kinematics-derived',
    interactionSchemaId: 'rotation-slider-interactions',
    onTick(scene, state, dt) {
      const omega = state.omega || 1.5, alpha = state.alpha || 0;
      if (state.theta0 === undefined) state.theta0 = state.theta || 0;
      state._t = (state._t || 0) + dt;
      state.theta = state.theta0 + omega * state._t + 0.5 * alpha * state._t * state._t;
      state.omegaCur = omega + alpha * state._t;
      state.r = 92;
      state.px = 266 + state.r * Math.cos(state.theta);
      state.py = 178 - state.r * Math.sin(state.theta);
      pushTrail(state, { x: state.px, y: state.py });
    }
  },
  'ch2-3-2': {
    behaviorId: 'ch2-3-2-belt-gear-behavior',
    derivedModelId: 'gear-transmission-derived',
    interactionSchemaId: 'gear-slider-interactions',
    onTick(scene, state, dt) {
      state.phi1 = ((state.phi1 || 0) + (state.omega || 1.5) * dt) % (2 * Math.PI);
      const r1 = Math.max(28, Math.min(80, Number(state.r1) || 50)), r2 = state.r2 || 90;
      state.r1 = r1;
      state.omega2 = (state.omega || 1.5) * r1 / r2;
      state.transmission = state.omega2;
      state.phi2 = ((state.phi2 || 0) + state.omega2 * dt) % (2 * Math.PI);
      pushNamedTrail(state, 'trail1', { x: 190 + r1 * Math.cos(state.phi1), y: 174 - r1 * Math.sin(state.phi1) });
      pushNamedTrail(state, 'trail2', { x: 370 + r2 * Math.cos(-state.phi2), y: 174 - r2 * Math.sin(-state.phi2) });
    }
  }
});

})();
