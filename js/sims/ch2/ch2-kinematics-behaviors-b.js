/**
 * Ch2 kinematics behaviors — Part 2: Relative + IC + Exercises.
 * Routes: ch2-4-1, ch2-4-2, ch2-4-3, ch2-4-4, ch2-5-1, ch2-5-2, ch2-5-3, ch2-7-1, ch2-7-2
 */
(function() {
'use strict';

const registry = window.SimRouteBehaviors;
if (!registry) return;

function magnitude(vector) {
  return Math.hypot((vector && vector.vx) || 0, (vector && vector.vy) || 0);
}

function finiteNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function vectorSum(a, b) {
  return { vx: (a.vx || 0) + (b.vx || 0), vy: (a.vy || 0) + (b.vy || 0) };
}

function setVelocityComposition(state, ve, vr) {
  state.ve = ve;
  state.vr = vr;
  state.va = vectorSum(ve, vr);
  state.vaMag = magnitude(state.va);
  state.vrMag = magnitude(state.vr);
  state.veMag = magnitude(state.ve);
}

function pushTrail(state, point, limit) {
  state.trail = Array.isArray(state.trail) ? state.trail : [];
  state.trail.push({ x: point.x, y: point.y });
  while (state.trail.length > (limit || 34)) state.trail.shift();
}

function computePlaneVelocityState(state) {
  state.vA = { vx: 46, vy: -8 };
  state.vBA = { vx: -(state.omega || 0) * (state.by - state.ay), vy: (state.omega || 0) * (state.bx - state.ax) };
  state.vB = vectorSum(state.vA, state.vBA);
  state.vAMag = magnitude(state.vA);
  state.vBMag = magnitude(state.vB);
}

registry.registerMany({
  'ch2-4-1': {
    behaviorId: 'ch2-4-1-velocity-composition-behavior',
    derivedModelId: 'velocity-comp-derived',
    interactionSchemaId: 'vector-drag-interactions',
    onTick(scene, state, dt) {
      const omega = state.omega || 1.0;
      state.t = ((state.t || 0) + omega * dt) % (Math.PI * 2);
      setVelocityComposition(state,
        { vx: 60 * Math.cos(state.t * 0.5), vy: -30 * Math.sin(state.t * 0.5) },
        { vx: 40 * Math.cos(state.t + 1), vy: 40 * Math.sin(state.t + 1) }
      );
      pushTrail(state, { x: 140 + state.va.vx * 1.8, y: 248 + state.va.vy * 1.8 });
    }
  },
  'ch2-4-2': {
    behaviorId: 'ch2-4-2-absolute-relative-behavior',
    derivedModelId: 'velocity-types-derived',
    interactionSchemaId: 'mode-selector-interactions',
    onTick(scene, state, dt) {
      const omega = state.omega || 1.2;
      state.t = ((state.t || 0) + omega * dt) % (Math.PI * 2);
      const phase = state.t;
      const va = { vx: 55 * Math.cos(phase), vy: 55 * Math.sin(phase) };
      const ve = { vx: 30 * Math.cos(phase * 0.6 + 0.5), vy: 30 * Math.sin(phase * 0.6 + 0.5) };
      setVelocityComposition(state, ve, { vx: va.vx - ve.vx, vy: va.vy - ve.vy });
      pushTrail(state, { x: 92 + state.va.vx * 1.8, y: 170 + state.va.vy * 1.8 });
    }
  },
  'ch2-4-3': {
    behaviorId: 'ch2-4-3-velocity-triangle-behavior',
    derivedModelId: 'velocity-triangle-derived',
    interactionSchemaId: 'triangle-construction-interactions',
    onTick(scene, state, dt) {
      const omega = state.omega || 1.0;
      state.t = ((state.t || 0) + omega * dt) % (Math.PI * 2);
      const veMag = 60 + 20 * Math.sin(state.t);
      const vrMag = 40 + 15 * Math.cos(state.t * 1.3);
      const phiBase = Number.isFinite(Number(state.phi)) ? Number(state.phi) * Math.PI / 180 : 0;
      const phi = phiBase + state.t * 0.7;
      setVelocityComposition(state,
        { vx: veMag, vy: 0 },
        { vx: vrMag * Math.cos(phi), vy: vrMag * Math.sin(phi) }
      );
      state.phiRad = phi;
      pushTrail(state, { x: 160 + state.va.vx * 1.5, y: 258 + state.va.vy * 1.5 });
    }
  },
  'ch2-4-4': {
    behaviorId: 'ch2-4-4-coriolis-behavior',
    derivedModelId: 'coriolis-derived',
    interactionSchemaId: 'coriolis-toggle-interactions',
    onTick(scene, state, dt) {
      const omega = state.omega || 1.0;
      state.t = ((state.t || 0) + omega * dt) % (Math.PI * 2);
      const radius = state.r || 96;
      const px = Number.isFinite(Number(state.px)) ? state.px : 280 + radius * Math.cos(state.t);
      const py = Number.isFinite(Number(state.py)) ? state.py : 180 + radius * Math.sin(state.t);
      state.px = px; state.py = py;
      const vrMag = Number.isFinite(Number(state.vrMag)) ? Number(state.vrMag) : magnitude(state.vr) || 40;
      const baseAngle = Number.isFinite(Number(state.vrAngle)) ? Number(state.vrAngle) : state.t;
      const vrx = vrMag * Math.cos(baseAngle);
      const vry = vrMag * Math.sin(baseAngle);
      state.vr = { vx: vrx, vy: vry };
      state.vrMag = vrMag;
      state.ac = { vx: -2 * omega * vry, vy: 2 * omega * vrx };
      state.coriolis = magnitude(state.ac);
      pushTrail(state, { x: px, y: py });
    }
  },
  'ch2-5-1': {
    behaviorId: 'ch2-5-1-plane-motion-behavior',
    derivedModelId: 'plane-motion-derived',
    interactionSchemaId: 'plane-drag-interactions',
    onTick(scene, state, dt) {
      state.ox = 180; state.oy = 170;
      state.ax = (state.ax || 260); state.ay = state.oy;
      state.bx = (state.bx || 420); state.by = state.ay;
      const omega = state.omega || 1.0;
      state.phi = ((state.phi || 0) + omega * dt) % (2 * Math.PI);
      computePlaneVelocityState(state);
      pushTrail(state, { x: state.bx, y: state.by });
    }
  },
  'ch2-5-2': {
    behaviorId: 'ch2-5-2-instant-center-behavior',
    derivedModelId: 'ic-derived',
    interactionSchemaId: 'ic-slider-interactions',
    onTick(scene, state, dt) {
      const omega = state.omega || 1.0;
      state.icX = Number.isFinite(Number(state.icX)) ? state.icX : ((state.primary && state.primary.x) || 270);
      state.icY = Number.isFinite(Number(state.icY)) ? state.icY : ((state.primary && state.primary.y) || 245);
      state.P = state.P || { x: state.icX, y: state.icY };
      state.phi = ((state.phi || 0) + omega * dt) % (2 * Math.PI);
      const theta = Number.isFinite(Number(state.theta)) ? Number(state.theta) * Math.PI / 180 : 0;
      const ox = 140, oy = 260, r = 80, l = 180;
      state.ax = ox + r * Math.cos(theta);
      state.ay = oy - r * Math.sin(theta);
      state.bx = state.ax + l * Math.cos(theta + Math.PI / 4);
      state.by = state.ay + l * Math.sin(theta + Math.PI / 4);
      state.vB = { vx: -omega * (state.by - state.icY), vy: omega * (state.bx - state.icX) };
      state.vBMag = magnitude(state.vB);
      pushTrail(state, { x: state.icX, y: state.icY });
    }
  },
  'ch2-5-3': {
    behaviorId: 'ch2-5-3-velocity-distribution-behavior',
    derivedModelId: 'vel-dist-derived',
    interactionSchemaId: 'dist-slider-interactions',
    onTick(scene, state, dt) {
      const omega = state.omega || 1.5;
      state.omega = omega;
      state.phi = ((state.phi || 0) + omega * dt) % (2 * Math.PI);
      const ax = 118, ay = 238;
      const currentBx = finiteNumber(state.ex, 338);
      const currentBy = finiteNumber(state.ey, 238);
      const angle = finiteNumber(state.barAngle, Math.atan2(currentBy - ay, currentBx - ax));
      const length = Math.max(1, finiteNumber(state.L, Math.hypot(currentBx - ax, currentBy - ay)));
      const bx = ax + length * Math.cos(angle);
      const by = ay + length * Math.sin(angle);
      const dx = bx - ax, dy = by - ay;
      state.L = length;
      state.ax = ax; state.ay = ay; state.bx = bx; state.by = by;
      state.ex = bx; state.ey = by; state.barAngle = angle;
      state.velocitySamples = [0, 0.25, 0.5, 0.75, 1].map(ratio => {
        const x = ax + dx * ratio;
        const y = ay + dy * ratio;
        const vx = -omega * (y - ay);
        const vy = omega * (x - ax);
        return { x, y, vx, vy, speed: Math.hypot(vx, vy) };
      });
      const last = state.velocitySamples[state.velocitySamples.length - 1];
      state.vB = { vx: last.vx, vy: last.vy };
      state.vAMag = 0;
      state.vBMag = last.speed;
      pushTrail(state, { x: bx, y: by });
    }
  },
  'ch2-7-1': {
    behaviorId: 'ch2-7-1-kinematics-solver-behavior',
    derivedModelId: 'kin-solver-derived',
    interactionSchemaId: 'step-by-step-interactions',
    onTick(scene, state, dt) {
      const omega = state.omega || 1.0;
      state.t = ((state.t || 0) + omega * dt * 0.2) % (Math.PI * 2);
      state.step = Math.floor((state.t / (Math.PI * 2)) * 3) % 3;
      state.xVal = 5 + 3 * Math.sin(state.t);
      state.vVal = 3 * omega * Math.cos(state.t);
      state.aVal = -3 * omega * omega * Math.sin(state.t);
    }
  },
  'ch2-7-2': {
    behaviorId: 'ch2-7-2-numeric-verifier-behavior',
    derivedModelId: 'numeric-verif-derived',
    interactionSchemaId: 'input-verify-interactions',
    onTick(scene, state, dt) {
      const omega = state.omega || 1.0;
      const amplitude = finiteNumber(state.amplitude, 3);
      const x0 = finiteNumber(state.x0, 5);
      state.t = ((state.t || 0) + omega * 0.05 * dt) % (Math.PI * 2);
      const expectedX = x0 + amplitude * Math.sin(state.t);
      const expectedV = amplitude * omega * Math.cos(state.t);
      const expectedA = -amplitude * omega * omega * Math.sin(state.t);
      state.xVal = Number.isFinite(Number(state.userX)) ? Number(state.userX) : expectedX;
      state.vVal = Number.isFinite(Number(state.userV)) ? Number(state.userV) : expectedV;
      state.aVal = Number.isFinite(Number(state.userA)) ? Number(state.userA) : expectedA;
      state.errorX = Math.abs(state.xVal - expectedX);
      state.errorV = Math.abs(state.vVal - expectedV);
      state.errorA = Math.abs(state.aVal - expectedA);
      state.status = Math.max(state.errorX, state.errorV, state.errorA) < 0.5 ? 'Đúng' : 'Cần kiểm tra';
    }
  }
});

})();
