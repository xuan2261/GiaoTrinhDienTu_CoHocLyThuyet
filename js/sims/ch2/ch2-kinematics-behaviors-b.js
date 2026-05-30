/**
 * Ch2 kinematics behaviors — Part 2: Relative + IC.
 * Routes: ch2-4-1, ch2-4-2, ch2-4-3, ch2-4-4, ch2-5-1, ch2-5-2, ch2-5-3
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

function computePlaneVelocityState(state) {
  if (!state.vA || !Number.isFinite(Number(state.vA.vx))) state.vA = { vx: 46, vy: -8 };
  state.vBA = { vx: -(state.omega || 0) * (state.by - state.ay), vy: (state.omega || 0) * (state.bx - state.ax) };
  state.vB = vectorSum(state.vA, state.vBA);
  state.vAMag = magnitude(state.vA);
  state.vBMag = magnitude(state.vB);
}

// ch2-5-2 — instant centre of a bar sliding with both ends on guides (the
// classic ladder problem, muc-V-2). End A rides a vertical guide so v_A is
// vertical; end B rides a horizontal guide so v_B is horizontal. The IC is the
// geometric intersection of the two velocity normals — found by locateInstantCenter,
// NOT a free-drag point. Computed once in derived() because the scene is a
// static snapshot (no tick): v_B ⟂ (B−IC) is then a consequence, not a fit.
const IC_GUIDE = { gx: 200, gy: 330, L: 200 };
function instantCenterDerived(scene, state) {
  const K = window.SimPhysicsKinematics || {};
  const { gx, gy, L } = IC_GUIDE;
  const omega = finiteNumber(state.omega, 1.5);
  const thetaDeg = Math.max(12, Math.min(78, finiteNumber(state.theta, 40)));
  const theta = thetaDeg * Math.PI / 180;
  const A = { x: gx, y: gy - L * Math.sin(theta) };
  const B = { x: gx + L * Math.cos(theta), y: gy };
  // Velocity directions from the guides: A slides vertically, B horizontally.
  const vADir = { vx: 0, vy: -1 };
  const vBDir = { vx: 1, vy: 0 };
  const ic = (K.locateInstantCenter && K.locateInstantCenter(A, B, vADir, vBDir)) || { x: B.x, y: A.y };
  const rA = Math.hypot(A.x - ic.x, A.y - ic.y);
  const rB = Math.hypot(B.x - ic.x, B.y - ic.y);
  // Bar's instantaneous angular velocity from |v_A| = ω·|A−IC| (here |v_A| = ωL).
  const omegaBar = omega;
  const vB = K.instantCenterVelocity
    ? K.instantCenterVelocity(omegaBar, B.x - ic.x, B.y - ic.y)
    : { vx: -omegaBar * (B.y - ic.y), vy: omegaBar * (B.x - ic.x) };
  const perpendicularResidual = Math.abs((B.x - ic.x) * vB.vx + (B.y - ic.y) * vB.vy);
  return {
    ox: gx, oy: gy, ax: A.x, ay: A.y, bx: B.x, by: B.y,
    icX: ic.x, icY: ic.y, omega, theta: thetaDeg,
    vB, vBMag: magnitude(vB), radius: rB, radiusA: rA,
    velocityMagnitude: magnitude(vB), perpendicularResidual
  };
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
    }
  },
  'ch2-5-1': {
    behaviorId: 'ch2-5-1-plane-motion-behavior',
    derivedModelId: 'plane-motion-derived',
    interactionSchemaId: 'plane-drag-interactions',
    onTick(scene, state, dt) {
      state.ox = 180; state.oy = 170;
      if (!state.vA || !Number.isFinite(Number(state.vA.vx))) state.vA = { vx: 46, vy: -8 };
      // Plane motion = translation + rotation: pole A drifts along vA (bouncing
      // within a band) instead of spinning in place. B keeps a fixed offset from A
      // so the bar length is constant while it both translates and rotates.
      let ax = Number.isFinite(Number(state.ax)) ? state.ax : 260;
      ax += state.vA.vx * dt;
      if (ax < 220 || ax > 360) { state.vA.vx *= -1; ax = Math.max(220, Math.min(360, ax)); }
      state.ax = ax; state.ay = state.oy;
      state.bx = ax + 160; state.by = state.ay;
      const omega = state.omega || 1.0;
      state.phi = ((state.phi || 0) + omega * dt) % (2 * Math.PI);
      computePlaneVelocityState(state);
    }
  },
  'ch2-5-2': {
    behaviorId: 'ch2-5-2-instant-center-behavior',
    derivedModelId: 'ic-derived',
    interactionSchemaId: 'ic-slider-interactions',
    // Static snapshot: IC is derived from the mechanism geometry once per draw,
    // never integrated over time. No onTick — the scene carries static:true.
    derived: instantCenterDerived
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
      const rawLength = finiteNumber(state.L, Math.hypot(currentBx - ax, currentBy - ay) / 100);
      const legacyPxLength = rawLength > 20;
      const length = legacyPxLength ? Math.max(1, rawLength) : Math.max(0.8, rawLength);
      const lengthPx = legacyPxLength ? length : length * 100;
      const bx = ax + lengthPx * Math.cos(angle);
      const by = ay + lengthPx * Math.sin(angle);
      const dx = bx - ax, dy = by - ay;
      state.L = length;
      state.ax = ax; state.ay = ay; state.bx = bx; state.by = by;
      state.ex = bx; state.ey = by; state.barAngle = angle;
      state.velocitySamples = [0, 0.25, 0.5, 0.75, 1].map(ratio => {
        const x = ax + dx * ratio;
        const y = ay + dy * ratio;
        const vx = -omega * (y - ay) / (legacyPxLength ? 1 : 100);
        const vy = omega * (x - ax) / (legacyPxLength ? 1 : 100);
        return { x, y, vx, vy, speed: Math.hypot(vx, vy) };
      });
      const last = state.velocitySamples[state.velocitySamples.length - 1];
      state.vB = { vx: last.vx, vy: last.vy };
      state.vAMag = 0;
      state.vBMag = last.speed;
    }
  }
});
})();
