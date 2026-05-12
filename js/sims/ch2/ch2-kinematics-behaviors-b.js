/**
 * Ch2 kinematics behaviors — Part 2: Relative + IC + Exercises.
 * Routes: ch2-4-1, ch2-4-2, ch2-4-3, ch2-4-4, ch2-5-1, ch2-5-2, ch2-5-3, ch2-7-1, ch2-7-2
 */
(function() {
'use strict';

const registry = window.SimRouteBehaviors;
if (!registry) return;

registry.registerMany({
  'ch2-4-1': {
    behaviorId: 'ch2-4-1-velocity-composition-behavior',
    derivedModelId: 'velocity-comp-derived',
    interactionSchemaId: 'vector-drag-interactions',
    onTick(scene, state, dt) {
      const omega = state.omega || 1.0;
      state.t = ((state.t || 0) + omega * dt) % (Math.PI * 2);
      state.ve = { vx: 60 * Math.cos(state.t * 0.5), vy: -30 * Math.sin(state.t * 0.5) };
      state.vr = { vx: 40 * Math.cos(state.t + 1), vy: 40 * Math.sin(state.t + 1) };
      state.va = { vx: state.ve.vx + state.vr.vx, vy: state.ve.vy + state.vr.vy };
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
      state.va = { vx: 55 * Math.cos(phase), vy: 55 * Math.sin(phase) };
      state.ve = { vx: 30 * Math.cos(phase * 0.6 + 0.5), vy: 30 * Math.sin(phase * 0.6 + 0.5) };
      state.vr = { vx: state.va.vx - state.ve.vx, vy: state.va.vy - state.ve.vy };
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
      const phi = state.t * 0.7;
      state.vaMag = Math.sqrt(veMag * veMag + vrMag * vrMag + 2 * veMag * vrMag * Math.cos(phi));
    }
  },
  'ch2-4-4': {
    behaviorId: 'ch2-4-4-coriolis-behavior',
    derivedModelId: 'coriolis-derived',
    interactionSchemaId: 'coriolis-toggle-interactions',
    onTick(scene, state, dt) {
      const omega = state.omega || 1.0;
      state.t = ((state.t || 0) + omega * dt) % (Math.PI * 2);
      const r = state.r || 100;
      state.vr = { vx: 40 * Math.cos(state.t), vy: 40 * Math.sin(state.t) };
      const acMag = 2 * omega * Math.abs(state.vr.vy);
      state.coriolis = acMag;
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
    }
  },
  'ch2-7-1': {
    behaviorId: 'ch2-7-1-kinematics-solver-behavior',
    derivedModelId: 'kin-solver-derived',
    interactionSchemaId: 'step-by-step-interactions',
    onTick(scene, state, dt) {
      const omega = state.omega || 1.0;
      state.step = Math.floor(((state.t || 0) + omega * dt * 0.2) % 4);
      state.t = ((state.t || 0) + omega * dt * 0.2) % (Math.PI * 2);
      state.xVal = 5 + 3 * Math.sin(state.t);
      state.vVal = 3 * Math.cos(state.t);
      state.aVal = -3 * Math.sin(state.t);
    }
  },
  'ch2-7-2': {
    behaviorId: 'ch2-7-2-numeric-verifier-behavior',
    derivedModelId: 'numeric-verif-derived',
    interactionSchemaId: 'input-verify-interactions',
    onTick(scene, state, dt) {
      const omega = state.omega || 1.0;
      state.t = ((state.t || 0) + omega * 0.05 * dt) % (Math.PI * 2);
      state.xVal = state.x0 + state.v0 * state.t + 0.5 * (state.a0 || 0) * state.t * state.t;
      state.vVal = state.v0 + (state.a0 || 0) * state.t;
      const vExpected = 3 * Math.cos(state.t);
      state.errorX = Math.abs(state.xVal - (5 + 3 * Math.sin(state.t)));
      state.errorV = Math.abs(state.vVal - vExpected);
      state.status = state.errorV < 0.5 ? 'OK' : 'CHECK';
    }
  }
});

})();
