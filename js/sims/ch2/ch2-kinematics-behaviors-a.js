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
  if (mode === 'Tròn') {
    const r = 100;
    state.currentX = 280 + r * Math.cos(state.t);
    state.currentY = 170 - r * Math.sin(state.t);
    state.vx = -r * omega * Math.sin(state.t);
    state.vy = r * omega * Math.cos(state.t);
  } else if (mode === 'Parabol') {
    const u = state.t / (2 * Math.PI);
    state.currentX = 90 + 360 * u;
    state.currentY = 278 - 310 * u + 260 * u * u;
    state.vx = 360 * omega / (2 * Math.PI);
    state.vy = (310 - 520 * u) * omega / (2 * Math.PI);
  } else {
    const a = 150, b = 100;
    state.currentX = 280 + a * Math.cos(state.t);
    state.currentY = 170 - b * Math.sin(state.t);
    state.vx = -a * omega * Math.sin(state.t);
    state.vy = b * omega * Math.cos(state.t);
  }
  state.speed = Math.hypot(state.vx, state.vy);
  state.trail = state.trail || [];
  state.trail.push({ x: state.currentX, y: state.currentY });
  if (state.trail.length > 120) state.trail.shift();
}

function updateGraphState(state) {
  const t = state.t || 0;
  state.xVal = 50 * Math.sin(t) + 10;
  state.vVal = 50 * Math.PI * Math.cos(t);
  state.aVal = -50 * Math.PI * Math.PI * Math.sin(t);
}

registry.registerMany({
  'ch2-1-1': {
    behaviorId: 'ch2-1-1-trajectory-behavior',
    derivedModelId: 'ellipse-trajectory-derived',
    interactionSchemaId: 'trajectory-animation-interactions',
    onTick(scene, state, dt) {
      updateTrajectoryState(state, dt);
    }
  },
  'ch2-1-2': {
    behaviorId: 'ch2-1-2-graph-cursor-behavior',
    derivedModelId: 'graph-cursor-derived',
    interactionSchemaId: 'time-slider-interactions',
    onTick(scene, state, dt) {
      if (state.cursorLocked) return;
      const omega = state.omega || 1.5;
      state.t = ((state.t || 0) + omega * 0.08 * dt) % (Math.PI * 2);
      state.cursorX = 82 + ((state.t % (Math.PI * 2)) / (Math.PI * 2)) * 170;
      state.cursorY = 200 - 52 * Math.sin(state.t);
      updateGraphState(state);
    }
  },
  'ch2-1-3': {
    behaviorId: 'ch2-1-3-natural-coords-behavior',
    derivedModelId: 'natural-coords-derived',
    interactionSchemaId: 'curve-parameter-interactions',
    onTick(scene, state, dt) {
      const omega = state.omega || 1.0;
      state.t = ((state.t || 0) + omega * dt) % (Math.PI * 2);
      const cx = 250, cy = 184, r = 96;
      state.px = cx + r * Math.cos(state.t);
      state.py = cy + r * Math.sin(state.t);
      state.vx = -r * omega * Math.sin(state.t);
      state.vy = r * omega * Math.cos(state.t);
      const v = Math.hypot(state.vx, state.vy);
      state.an = v * v / r; state.at = 0;
    }
  },
  'ch2-1-4': {
    behaviorId: 'ch2-1-4-motion-presets-behavior',
    derivedModelId: 'motion-preset-derived',
    interactionSchemaId: 'preset-button-interactions',
    onTick(scene, state, dt) {
      const omega = state.omega || 1.5;
      state.t = ((state.t || 0) + omega * dt) % (Math.PI * 2);
      if (state.mode === 'Thẳng') {
        state.px = 100 + (state.t / (Math.PI * 2)) * 200;
        state.py = 200 - (state.t / (Math.PI * 2)) * 80;
      } else if (state.mode === 'Tròn') {
        state.px = 268 + 42 * Math.cos(state.t);
        state.py = 166 + 42 * Math.sin(state.t);
      } else {
        const prog = (state.t / (Math.PI * 2)) * 80;
        state.px = 178 + prog;
        state.py = 218 - prog * 1.5 + (prog * prog) / 60;
      }
    }
  },
  'ch2-2-2': {
    behaviorId: 'ch2-2-2-fixed-axis-behavior',
    derivedModelId: 'rotational-kinematics-derived',
    interactionSchemaId: 'rotation-slider-interactions',
    onTick(scene, state, dt) {
      const omega = state.omega || 1.5, alpha = state.alpha || 0;
      state._t = (state._t || 0) + dt;
      state.theta = (state.theta || 0) + (omega + alpha * (state._t) / 2) * dt;
      state.omegaCur = omega + alpha * state._t;
      state.r = 86;
      state.px = 266 + state.r * Math.cos(state.theta);
      state.py = 170 - state.r * Math.sin(state.theta);
    }
  },
  'ch2-3-2': {
    behaviorId: 'ch2-3-2-belt-gear-behavior',
    derivedModelId: 'gear-transmission-derived',
    interactionSchemaId: 'gear-slider-interactions',
    onTick(scene, state, dt) {
      state.phi1 = ((state.phi1 || 0) + (state.omega || 1.5) * dt) % (2 * Math.PI);
      const r1 = state.r1 || 50, r2 = state.r2 || 90;
      state.omega2 = (state.omega || 1.5) * r1 / r2;
      state.phi2 = ((state.phi2 || 0) + state.omega2 * dt) % (2 * Math.PI);
    }
  }
});

})();
