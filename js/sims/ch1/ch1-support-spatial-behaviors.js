/**
 * Route behavior contracts for Ch1 support and spatial routes.
 */
(function() {
'use strict';

const registry = window.SimRouteBehaviors;
if (!registry) return;

const W = 760, H = 440;
const colors = { force: '#dc3545', reaction: '#198754', support: '#0d6efd', moment: '#c9963a' };
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const bounded = point => ({ x: clamp(point.x, 28, W - 28), y: clamp(point.y, 28, H - 28) });
const primary = state => state.primary || (state.primary = { x: 190, y: 240 });
const toDeg = rad => rad * 180 / Math.PI;
const toRad = deg => deg * Math.PI / 180;
const cableAnchor = { x: 120, y: 76 };
const beam = { ax: 130, bx: 630, y: 240, pxPerM: 100 };
const twoForceA = { x: 142, y: 248 };
const spatialO = { x: 112, y: 286 };

function makeHandle(id, label, get, set, stroke) {
  return {
    id,
    label,
    hitRadius: 25,
    nudgeStep: 8,
    shiftStep: 24,
    get,
    set(point) { set(bounded(point)); },
    visual: { stroke }
  };
}

function setPrimary(state, point) {
  state.primary = bounded(point);
}

function setSupportPoint(routeId, state, point) {
  const p = bounded(point);
  if (routeId === 'ch1-3-2') {
    state.primary = p;
    state.force = clamp(Math.hypot(p.x - cableAnchor.x, p.y - cableAnchor.y) / 3.8, 20, 170);
    state.alpha = toDeg(Math.atan2(p.y - cableAnchor.y, p.x - cableAnchor.x));
  }
  else if (routeId === 'ch1-3-4') {
    state.primary = { x: clamp(p.x, beam.ax + 40, beam.bx - 40), y: clamp(p.y, 92, beam.y - 22) };
    state.force = clamp((beam.y - state.primary.y) * 1.4, 35, 190);
    state.load = state.primary.x - beam.ax;
  }
  else {
    state.primary = p;
    state.force = clamp(80 + (280 - p.y) * 0.45, 20, 170);
  }
}

function supportDerived(scene, state) {
  const routeId = scene.routeId || state.routeId || '';
  const p = primary(state);
  const force = clamp(state.force, 20, 170);
  const cableAngle = toDeg(Math.atan2(p.y - cableAnchor.y, p.x - cableAnchor.x));
  const span = beam.bx - beam.ax;
  const aPx = routeId === 'ch1-3-4' ? clamp(p.x - beam.ax, 40, span - 40) : clamp(state.load, 0, 180);
  const beamForce = routeId === 'ch1-3-4' ? clamp((beam.y - p.y) * 1.4, 35, 190) : force;
  const rb = beamForce * aPx / span;
  const ra = beamForce - rb;
  const dx = p.x - 150, dy = 226 - p.y;
  const axial = Math.hypot(dx, dy) || 1;
  const spatialX = clamp((p.x - 120) / 1.4, 20, 240);
  const spatialY = clamp((286 - p.y) / 1.2, -40, 180);
  const alphaDeg = clamp(state.alpha, 0, 55);
  const spatialZ = clamp(force * Math.sin(toRad(alphaDeg)) + 35, 20, 160);
  return {
    force: routeId === 'ch1-3-4' ? beamForce : force,
    resultantMagnitude: routeId === 'ch1-3-3' ? Math.hypot(force * 0.55, force * 0.83) : (routeId === 'ch1-4-1' ? Math.hypot(spatialX, spatialY, spatialZ) : force),
    alpha: routeId === 'ch1-3-2' ? cableAngle : clamp(state.alpha, 0, 55),
    moment: routeId === 'ch1-3-4' ? rb * (span / beam.pxPerM) : force * clamp(state.load, 0, 180) * Math.cos(toRad(routeId === 'ch1-4-2' ? alphaDeg : 0)) / 120,
    point: p,
    direction: routeId === 'ch1-3-2' ? 'dọc dây' : (routeId === 'ch1-3-7' ? 'dọc trục' : 'pháp tuyến'),
    rx: routeId === 'ch1-3-7' ? force * dx / axial : force * 0.55,
    ry: routeId === 'ch1-3-7' ? force * dy / axial : force * 0.83,
    ra, rb, a: aPx / beam.pxPerM, length: span / beam.pxPerM,
    dx: spatialX, dy: spatialY, dz: spatialZ,
    residual: Math.abs(spatialX - spatialY) / 100
  };
}

function updateSupportState(scene, state, key, value) {
  const routeId = scene.routeId || state.routeId || '';
  if (key === 'force') {
    state.force = clamp(value, routeId === 'ch1-3-4' ? 35 : 20, routeId === 'ch1-3-4' ? 190 : 170);
    if (routeId === 'ch1-3-4') {
      const p = primary(state);
      state.primary = { x: clamp(p.x, beam.ax + 40, beam.bx - 40), y: clamp(beam.y - state.force / 1.4, 92, beam.y - 22) };
    }
  }
  else if (key === 'alpha') {
    state.alpha = clamp(value, 0, 55);
    if (routeId === 'ch1-3-2') {
      const p = primary(state), len = Math.max(80, Math.hypot(p.x - cableAnchor.x, p.y - cableAnchor.y));
      state.primary = bounded({ x: cableAnchor.x + len * Math.cos(toRad(state.alpha)), y: cableAnchor.y + len * Math.sin(toRad(state.alpha)) });
    }
    else if (routeId === 'ch1-3-7') {
      const len = Math.max(160, Math.hypot(primary(state).x - twoForceA.x, primary(state).y - twoForceA.y));
      state.primary = bounded({ x: twoForceA.x + len * Math.cos(-toRad(state.alpha)), y: twoForceA.y + len * Math.sin(-toRad(state.alpha)) });
    }
    else if (routeId === 'ch1-4-2') {
      const len = Math.max(160, Math.hypot(primary(state).x - spatialO.x, primary(state).y - spatialO.y));
      state.primary = bounded({ x: spatialO.x + len * Math.cos(-toRad(state.alpha) * 0.75), y: spatialO.y + len * Math.sin(-toRad(state.alpha) * 0.75) });
    }
  }
  else if (key === 'load' && routeId === 'ch1-3-4') {
    const p = primary(state);
    state.load = clamp(value, 40, beam.bx - beam.ax - 40);
    state.primary = { x: beam.ax + state.load, y: p.y };
  } else state[key] = value;
}

function supportHandles(routeId, state) {
  const p = () => primary(state);
  const map = {
    'ch1-3-1': ['support-normal-n', 'N', colors.reaction],
    'ch1-3-2': ['cable-tension-t', 'T', colors.support],
    'ch1-3-3': ['hinge-load-p', 'P', colors.force],
    'ch1-3-4': ['beam-load-p', 'P', colors.force],
    'ch1-3-6': ['fixed-load-p', 'P', colors.force],
    'ch1-3-7': ['two-force-axial-n', 'N', colors.reaction],
    'ch1-4-1': ['spatial-resultant-r', 'R', colors.reaction],
    'ch1-4-2': ['spatial-moment-m', 'M', colors.moment],
    'ch1-4-4': ['spatial-load-p', 'P', colors.force]
  };
  const spec = map[routeId] || [`${routeId}-support`, 'R', colors.reaction];
  return [makeHandle(spec[0], spec[1], p, point => setSupportPoint(routeId, state, point), spec[2])];
}

function handlesFor(routeId) {
  return (_scene, state) => supportHandles(routeId, state);
}

registry.registerMany({
  'ch1-3-1': { behaviorId: 'ch1-3-1-smooth-normal-behavior', derivedModelId: 'normal-only-support-derived', derived: supportDerived, updateStateFromSlider: updateSupportState, handles: handlesFor('ch1-3-1') },
  'ch1-3-2': { behaviorId: 'ch1-3-2-cable-tension-behavior', derivedModelId: 'cable-axis-tension-derived', derived: supportDerived, updateStateFromSlider: updateSupportState, handles: handlesFor('ch1-3-2') },
  'ch1-3-3': { behaviorId: 'ch1-3-3-hinge-components-behavior', derivedModelId: 'pin-rx-ry-derived', derived: supportDerived, updateStateFromSlider: updateSupportState, handles: handlesFor('ch1-3-3') },
  'ch1-3-4': { behaviorId: 'ch1-3-4-roller-pin-behavior', derivedModelId: 'roller-pin-selector-derived', derived: supportDerived, updateStateFromSlider: updateSupportState, handles: handlesFor('ch1-3-4') },
  'ch1-3-6': { behaviorId: 'ch1-3-6-fixed-support-behavior', derivedModelId: 'fixed-rx-ry-moment-derived', derived: supportDerived, updateStateFromSlider: updateSupportState, handles: handlesFor('ch1-3-6') },
  'ch1-3-7': { behaviorId: 'ch1-3-7-two-force-member-behavior', derivedModelId: 'axial-member-line-derived', derived: supportDerived, updateStateFromSlider: updateSupportState, handles: handlesFor('ch1-3-7') },
  'ch1-4-1': { behaviorId: 'ch1-4-1-spatial-resultant-behavior', derivedModelId: 'xyz-resultant-derived', derived: supportDerived, updateStateFromSlider: updateSupportState, handles: handlesFor('ch1-4-1') },
  'ch1-4-2': { behaviorId: 'ch1-4-2-spatial-moment-behavior', derivedModelId: 'axis-projection-derived', derived: supportDerived, updateStateFromSlider: updateSupportState, handles: handlesFor('ch1-4-2') },
  'ch1-4-4': { behaviorId: 'ch1-4-4-spatial-equilibrium-behavior', derivedModelId: 'six-equation-board-derived', derived: supportDerived, updateStateFromSlider: updateSupportState, handles: handlesFor('ch1-4-4') }
});

})();
