/**
 * Route behavior contracts for Ch1 friction and centroid routes.
 */
(function() {
'use strict';

const registry = window.SimRouteBehaviors;
if (!registry) return;

const W = 760, H = 440;
const colors = { force: '#dc3545', friction: '#fd7e14', centroid: '#198754', angle: '#c9963a' };
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const bounded = point => ({ x: clamp(point.x, 36, W - 36), y: clamp(point.y, 64, H - 48) });
const toDeg = rad => rad * 180 / Math.PI;
const toRad = deg => deg * Math.PI / 180;
const primary = state => state.primary || (state.primary = { x: 310, y: 250 });
const inclineBase = routeId => routeId === 'ch1-5-4' ? { x: 176, y: 300 } : { x: 148, y: 310 };

function makeHandle(id, label, get, set, stroke, options) {
  const cfg = options || {};
  return { id, label, hitRadius: cfg.hitRadius || 26, nudgeStep: 8, shiftStep: 24,
    get, set(point) { set(cfg.raw ? point : bounded(point)); }, visual: { stroke } };
}

function pushTrail(state, point) {
  state.trail = Array.isArray(state.trail) ? state.trail : [];
  const last = state.trail[state.trail.length - 1];
  if (!last || Math.hypot(last.x - point.x, last.y - point.y) > 4) {
    state.trail.push({ x: point.x, y: point.y });
    if (state.trail.length > 34) state.trail.shift();
  }
}

function setInclineByAngle(state, angle, routeId) {
  state.alpha = clamp(angle, 5, 42);
  const base = inclineBase(routeId), len = routeId === 'ch1-5-4' ? 210 : 245, a = toRad(state.alpha);
  state.primary = { x: base.x + len * Math.cos(a), y: base.y - len * Math.sin(a) };
  pushTrail(state, state.primary);
}

function setFrictionPoint(routeId, state, point) {
  const p = bounded(point);
  if (routeId === 'ch1-5-3' || routeId === 'ch1-5-4') {
    const base = inclineBase(routeId);
    setInclineByAngle(state, clamp(toDeg(Math.atan2(base.y - p.y, p.x - base.x)), 5, 42), routeId);
  } else {
    state.primary = { x: clamp(p.x, 130, 560), y: clamp(p.y, 160, 292) };
    state.force = clamp(60 + Math.abs(312 - state.primary.x) * 0.35, 20, 180);
    pushTrail(state, state.primary);
  }
}

function setCentroidPoint(routeId, state, point) {
  const p = bounded(point);
  if (routeId === 'ch1-6-2') {
    state.primary = { x: clamp(p.x, 172, 510), y: clamp(p.y, 120, 286) };
    state._draggedCentroid = true;
  } else {
    state.primary = { x: clamp(p.x, 188, 420), y: clamp(p.y, 112, 232) };
  }
  pushTrail(state, state.primary);
}

function frictionDerived(scene, state) {
  const routeId = scene.routeId || state.routeId || '';
  const p = primary(state), mu = clamp(state.mu, 0.1, 1);
  const alpha = clamp(state.alpha !== undefined ? state.alpha : (routeId === 'ch1-5-2' ? 0 : 18), 0, 55);
  const normal = clamp(state.load || 120, 40, 220);
  const applied = clamp(state.force || 92, 20, 190);
  const limit = mu * normal;
  const fms = routeId === 'ch1-5-1' ? applied : (routeId === 'ch1-5-2' ? Math.min(applied, limit) : limit);
  const tanAlpha = Math.tan(toRad(alpha));
  const phi = toDeg(Math.atan(mu));
  const lockState = alpha <= phi ? 'tự hãm' : 'không tự hãm';
  const slipState = routeId === 'ch1-5-1' ? 'hold'
    : (routeId === 'ch1-5-4' ? (lockState === 'tự hãm' ? 'hold' : 'slip') : (tanAlpha <= mu && applied <= limit ? 'hold' : 'slip'));
  return {
    point: p, alpha, mu, normal, force: applied, friction: fms,
    resultantMagnitude: Math.hypot(normal, fms),
    threshold: limit, tanAlpha, phi, lockState,
    slipState, margin: routeId === 'ch1-5-2' ? limit - applied : mu - tanAlpha,
    mode: slipState === 'hold' ? 'bám' : 'trượt',
    trail: state.trail || []
  };
}

function centroidDerived(scene, state) {
  const routeId = scene.routeId || state.routeId || '';
  const p = primary(state), load = clamp(state.load, 20, 180);
  const s1 = 120, s2 = load, c1 = { x: 210, y: 178 }, c2 = { x: 402, y: 224 };
  let gx = (s1 * c1.x + s2 * c2.x) / (s1 + s2), gy = (s1 * c1.y + s2 * c2.y) / (s1 + s2);
  let hole = 0, shift = 0;
  if (routeId === 'ch1-6-2' && state._draggedCentroid) {
    gx = p.x;
    gy = p.y;
  }
  if (routeId === 'ch1-6-3') {
    const big = 260, holeArea = load * 0.72;
    hole = holeArea;
    gx = (big * 300 - holeArea * p.x) / Math.max(1, big - holeArea);
    gy = (big * 188 - holeArea * p.y) / Math.max(1, big - holeArea);
    shift = Math.hypot(gx - 300, gy - 188);
  }
  return { point: p, gx, gy, centroid: { x: gx, y: gy }, load, hole, shift,
    resultantMagnitude: Math.hypot(gx - 180, gy - 260), trail: state.trail || [] };
}

function updateFrictionState(scene, state, key, value) {
  const routeId = scene.routeId || state.routeId || '';
  if (key === 'alpha') setInclineByAngle(state, value, routeId);
  else if (key === 'force') state.force = clamp(value, 20, 190);
  else if (key === 'mu') state.mu = clamp(value, 0.1, 1);
  else if (key === 'load') state.load = clamp(value, 40, 220);
  if (routeId === 'ch1-5-3' || routeId === 'ch1-5-4') setInclineByAngle(state, state.alpha || 18, routeId);
}

function updateCentroidState(_scene, state, key, value) {
  if (key === 'load') state.load = clamp(value, 20, 180);
  else state[key] = value;
}

function handlesFor(routeId) {
  return (_scene, state) => {
    if (routeId.startsWith('ch1-6-')) {
      return [makeHandle(routeId === 'ch1-6-2' ? 'centroid-composite-g' : 'centroid-hole-c', routeId === 'ch1-6-2' ? 'G' : 'lỗ', () => primary(state), point => setCentroidPoint(routeId, state, point), colors.centroid)];
    }
    const labels = { 'ch1-5-1': ['contact-resultant-r', 'R'], 'ch1-5-2': ['friction-force-fms', 'Fms'], 'ch1-5-3': ['incline-angle-alpha', 'α'], 'ch1-5-4': ['self-locking-wedge-alpha', 'α'] };
    const spec = labels[routeId] || [`${routeId}-friction`, 'Fms'];
    return [makeHandle(spec[0], spec[1], () => primary(state), point => setFrictionPoint(routeId, state, point), routeId === 'ch1-5-1' ? colors.force : colors.friction)];
  };
}

registry.registerMany({
  'ch1-5-1': { behaviorId: 'ch1-5-1-contact-force-behavior', derivedModelId: 'contact-normal-friction-derived', derived: frictionDerived, updateStateFromSlider: updateFrictionState, handles: handlesFor('ch1-5-1') },
  'ch1-5-2': { behaviorId: 'ch1-5-2-friction-mode-behavior', derivedModelId: 'static-sliding-rolling-derived', derived: frictionDerived, updateStateFromSlider: updateFrictionState, handles: handlesFor('ch1-5-2') },
  'ch1-5-3': { behaviorId: 'ch1-5-3-friction-cone-behavior', derivedModelId: 'cone-hold-slip-derived', derived: frictionDerived, updateStateFromSlider: updateFrictionState, handles: handlesFor('ch1-5-3') },
  'ch1-5-4': { behaviorId: 'ch1-5-4-self-locking-behavior', derivedModelId: 'wedge-phi-boundary-derived', derived: frictionDerived, updateStateFromSlider: updateFrictionState, handles: handlesFor('ch1-5-4') },
  'ch1-6-2': { behaviorId: 'ch1-6-2-centroid-composite-behavior', derivedModelId: 'composite-area-centroid-derived', derived: centroidDerived, updateStateFromSlider: updateCentroidState, handles: handlesFor('ch1-6-2') },
  'ch1-6-3': { behaviorId: 'ch1-6-3-centroid-hole-behavior', derivedModelId: 'subtractive-area-centroid-derived', derived: centroidDerived, updateStateFromSlider: updateCentroidState, handles: handlesFor('ch1-6-3') }
});

})();
