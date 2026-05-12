(function() {
'use strict';

const registry = window.SimRouteBehaviors;
if (!registry) {
  console.warn('Route behavior registry missing for Ch1 force/law behaviors');
  return;
}

const W = 760, H = 440, colors = { force: '#dc3545', result: '#fd7e14', support: '#0d6efd', moment: '#c9963a' };
const originO = { x: 150, y: 300 }, PX_PER_M = 60;
const parallelogramO = { x: 200, y: 300 };
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const bounded = point => ({ x: clamp(point.x, 28, W - 28), y: clamp(point.y, 28, H - 28) });
const ensurePrimary = state => state.primary || (state.primary = { x: 190, y: 255 });
const ensureVector = state => state.vector || (state.vector = { x: 370, y: 130 });
const ensureSecondary = state => state.secondary || (state.secondary = { x: 380, y: 300 });
const toDeg = rad => rad * 180 / Math.PI;
const toRad = deg => deg * Math.PI / 180;

function vectorAngle(state) {
  const p = ensurePrimary(state), v = ensureVector(state);
  return toDeg(Math.atan2(p.y - v.y, v.x - p.x));
}

function setForceByAngle(state, magnitude, angleDeg) {
  const p = ensurePrimary(state), mag = clamp(magnitude, 20, 300), angle = clamp(angleDeg, -90, 90);
  const dx = mag * Math.cos(toRad(angle)), dy = -mag * Math.sin(toRad(angle));
  const next = { x: clamp(p.x, Math.max(28, 28 - dx), Math.min(W - 28, W - 28 - dx)), y: clamp(p.y, Math.max(28, 28 - dy), Math.min(H - 28, H - 28 - dy)) };
  state.primary = next;
  state.force = mag; state.angle = angle;
  state.vector = { x: next.x + dx, y: next.y + dy };
}
function setVectorFromPoint(state, point, routeId) {
  const p = ensurePrimary(state), raw = bounded(point);
  const maxF = routeId === 'ch1-1-5' ? 180 : (routeId === 'ch1-2-1' ? 170 : 260);
  const minF = routeId === 'ch1-1-5' ? 50 : 40;
  const angle = clamp(toDeg(Math.atan2(p.y - raw.y, raw.x - p.x)), routeId === 'ch1-2-1' ? -30 : -45, routeId === 'ch1-2-1' ? 30 : 75);
  setForceByAngle(state, clamp(Math.hypot(raw.x - p.x, p.y - raw.y), minF, maxF), angle);
}
function setVerticalForce(state, point) {
  const force = clamp(state.force, 30, 220), source = bounded(point || ensurePrimary(state)), isMoment = state.routeId === 'ch1-1-4';
  const p = { x: clamp(source.x, isMoment ? originO.x + 60 : 28, isMoment ? originO.x + 220 : W - 28), y: clamp(source.y, 28, H - 28 - force) };
  state.primary = p; if (isMoment) state.load = p.x - originO.x; state.vector = { x: p.x, y: p.y + force };
}

function forceMagnitude(state) {
  const p = ensurePrimary(state), v = ensureVector(state);
  return Math.hypot(v.x - p.x, p.y - v.y);
}

function makeHandle(id, label, get, set, stroke, options) {
  const cfg = options || {};
  return { id, label, hitRadius: cfg.hitRadius || 25, nudgeStep: 8, shiftStep: 24, get, set(point) { set(cfg.raw ? point : bounded(point)); }, visual: { stroke } };
}

function setPrimary(state, point) { state.primary = bounded(point); }
function setFbdForcePoint(state, point) {
  const p = bounded(point), base = { x: 476, y: 176 };
  state.primary = p;
  state.force = clamp(Math.hypot(p.x - base.x, p.y - base.y), 20, 160);
}
function setFbdForceMagnitude(state, value) {
  const base = { x: 476, y: 176 }, p = ensurePrimary(state), dx = p.x - base.x, dy = p.y - base.y;
  const len = Math.hypot(dx, dy) || 1, mag = clamp(value, 20, 160);
  state.force = mag;
  state.primary = bounded({ x: base.x + dx / len * mag, y: base.y + dy / len * mag });
}
function moveForceTail(state, point) {
  const force = clamp(state.force || forceMagnitude(state), 40, 260);
  const angle = clamp(Number.isFinite(Number(state.angle)) ? state.angle : vectorAngle(state), -45, 75);
  const dx = force * Math.cos(toRad(angle)), dy = -force * Math.sin(toRad(angle));
  state.primary = {
    x: clamp(point.x, Math.max(28, 28 - dx), Math.min(W - 28, W - 28 - dx)),
    y: clamp(point.y, Math.max(28, 28 - dy), Math.min(H - 28, H - 28 - dy))
  };
  state.force = force; state.angle = angle; state.vector = { x: state.primary.x + dx, y: state.primary.y + dy };
}

function angleBetween(a1, a2) { const deg = Math.abs(toDeg(a2 - a1)) % 360; return deg > 180 ? 360 - deg : deg; }
function boundParallelogramPoint(state, key, point) { const other = key === 'secondary' ? ensurePrimary(state) : ensureSecondary(state); return { x: clamp(point.x, Math.max(28, 28 + parallelogramO.x - other.x), Math.min(W - 28, W - 28 + parallelogramO.x - other.x)), y: clamp(point.y, Math.max(28, 28 + parallelogramO.y - other.y), Math.min(H - 28, H - 28 + parallelogramO.y - other.y)) }; }

function parallelogramData(state) {
  const f1 = ensurePrimary(state), f2 = ensureSecondary(state);
  const a1 = Math.atan2(f1.y - parallelogramO.y, f1.x - parallelogramO.x);
  const a2 = Math.atan2(f2.y - parallelogramO.y, f2.x - parallelogramO.x);
  const r = { x: f1.x + f2.x - parallelogramO.x, y: f1.y + f2.y - parallelogramO.y };
  return { f1, f2, r, a1, a2, f1Magnitude: Math.hypot(f1.x - parallelogramO.x, f1.y - parallelogramO.y), f2Magnitude: Math.hypot(f2.x - parallelogramO.x, f2.y - parallelogramO.y), resultantMagnitude: Math.hypot(r.x - parallelogramO.x, r.y - parallelogramO.y), alpha: angleBetween(a1, a2) };
}

function setParallelogramPoint(state, key, point) { state[key] = boundParallelogramPoint(state, key, point); const data = parallelogramData(state); state.alpha = data.alpha; state.force = data.f1Magnitude; }

function setParallelogramMagnitude(state, key, magnitude) {
  const p = key === 'secondary' ? ensureSecondary(state) : ensurePrimary(state);
  const angle = Math.atan2(p.y - parallelogramO.y, p.x - parallelogramO.x);
  const mag = clamp(magnitude, 40, 260);
  setParallelogramPoint(state, key, { x: parallelogramO.x + mag * Math.cos(angle), y: parallelogramO.y + mag * Math.sin(angle) });
}

function setParallelogramAlpha(state, value) {
  const data = parallelogramData(state);
  const next = data.a1 + toRad(clamp(value, 0, 90));
  setParallelogramPoint(state, 'secondary', { x: parallelogramO.x + data.f2Magnitude * Math.cos(next), y: parallelogramO.y + data.f2Magnitude * Math.sin(next) });
}

function supportInfo(mode) {
  const map = {
    'Tựa': ['Tựa trơn', 'khóa pháp tuyến', 'N'], 'Dây': ['Dây mềm', 'chỉ chịu kéo', 'T'],
    'Bản lề': ['Bản lề cố định', 'khóa x, y', 'Rx, Ry'], 'Gối': ['Gối di động', 'khóa 1 phương', 'N nghiêng'], 'Ngàm': ['Ngàm chặt', 'khóa x, y, quay', 'Rx, Ry, M']
  };
  const row = map[mode] || map['Tựa'];
  return { supportKind: row[0], supportDof: row[1], supportReaction: row[2] };
}

function forceLawDerived(scene, state) {
  const routeId = scene.routeId || state.routeId || '';
  const p = ensurePrimary(state), v = ensureVector(state);
  const dx = v.x - p.x, dy = p.y - v.y;
  const baseForce = routeId === 'ch1-1-6' ? clamp(state.force, 20, 220) : clamp(Math.hypot(dx, dy), 1, 300);
  const angle = routeId === 'ch1-1-6' ? 90 : vectorAngle(state);
  let distance = Math.abs(p.x - originO.x) / PX_PER_M;
  let moment = routeId === 'ch1-1-4' ? baseForce * distance : ((p.x - 250) * dy - (p.y - 235) * dx) / PX_PER_M;
  let resultantMagnitude = baseForce;
  const info = supportInfo(state.mode);
  if (routeId === 'ch1-1-6') {
    distance = clamp(state.distance, 80, 260) / PX_PER_M;
    moment = baseForce * distance;
  }
  if (routeId === 'ch1-1-5') {
    resultantMagnitude = baseForce;
  }
  if (routeId === 'ch1-2-3') {
    return Object.assign({ dx, dy, force: parallelogramData(state).f1Magnitude, point: ensureSecondary(state) }, parallelogramData(state));
  }
  if (routeId === 'ch1-2-6') {
    const load = clamp(state.load, 0, 160);
    const fbdForce = clamp(state.force || Math.hypot(p.x - 476, p.y - 176), 20, 160);
    return Object.assign({ dx: p.x - 476, dy: 176 - p.y, fx: p.x - 476, fy: 176 - p.y, force: fbdForce, resultantMagnitude: Math.hypot(fbdForce, load), alpha: angle, forceAngle: angle, distance, moment: (p.x - 476) * fbdForce / PX_PER_M, balanceError: 0, balanceState: 'đã tách', point: p }, info);
  }
  return Object.assign({ dx, dy, fx: dx, fy: dy, force: baseForce, resultantMagnitude, alpha: angle, forceAngle: angle, distance, moment, balanceError: Math.abs(dy), balanceState: Math.abs(dy) < 6 ? 'đúng' : 'lệch', point: p }, info);
}

function updateForceLawState(scene, state, key, value) {
  const routeId = scene.routeId || state.routeId || '';
  if (routeId === 'ch1-2-3') {
    if (key === 'force') setParallelogramMagnitude(state, 'primary', value);
    else if (key === 'alpha') setParallelogramAlpha(state, value);
    else state[key] = value;
    return;
  }
  if (routeId === 'ch1-2-6' && key === 'force') { setFbdForceMagnitude(state, value); return; }
  if (key === 'force') {
    if (routeId === 'ch1-1-4' || routeId === 'ch1-1-8') {
      state.force = value;
      setVerticalForce(state, ensurePrimary(state));
    } else if (routeId === 'ch1-1-6') {
      state.force = value;
    } else {
      setForceByAngle(state, value, vectorAngle(state));
    }
  } else if (key === 'angle') {
    setForceByAngle(state, forceMagnitude(state), value);
  } else if (key === 'distance') {
    state.distance = clamp(value, 80, 260);
  } else if (key === 'load' && routeId === 'ch1-1-4') {
    setVerticalForce(state, { x: originO.x + clamp(value, 60, 220), y: ensurePrimary(state).y });
  } else {
    state[key] = value;
  }
}

function forceLawHandles(routeId, state) {
  const primary = () => ensurePrimary(state);
  const vector = () => ensureVector(state);
  const map = {
    'ch1-1-3': () => [
      makeHandle('force-tail-a', 'A', primary, point => moveForceTail(state, point), colors.support),
      makeHandle('force-tip-f', 'F', vector, point => setVectorFromPoint(state, point, 'ch1-1-3'), colors.force)
    ],
    'ch1-1-4': () => [makeHandle('moment-load-p', 'P', primary, point => setVerticalForce(state, point), colors.moment)],
    'ch1-1-5': () => [makeHandle('reducer-resultant-r', 'R', vector, point => setVectorFromPoint(state, point, 'ch1-1-5'), colors.result)],
    'ch1-1-6': () => [makeHandle('couple-arm-d', 'd', () => ({ x: 380 + clamp(state.distance, 80, 260) / 2, y: 246 }), point => { state.distance = clamp(Math.abs(point.x - 380) * 2, 80, 260); }, colors.moment, { raw: true })],
    'ch1-1-8': () => [makeHandle('constraint-load-p', 'P', primary, point => setVerticalForce(state, point), colors.force)],
    'ch1-2-1': () => [makeHandle('two-force-f2', 'F2', vector, point => setVectorFromPoint(state, point, 'ch1-2-1'), colors.force)],
    'ch1-2-3': () => [
      makeHandle('parallelogram-f1', 'F1', primary, point => setParallelogramPoint(state, 'primary', point), colors.force, { raw: true }),
      makeHandle('parallelogram-f2', 'F2', () => ensureSecondary(state), point => setParallelogramPoint(state, 'secondary', point), colors.support, { raw: true })
    ],
    'ch1-2-6': () => [makeHandle('fbd-force-f', 'F', primary, point => setFbdForcePoint(state, point), colors.force)]
  };
  return map[routeId] ? map[routeId]() : [];
}

function handlesFor(routeId) {
  return (_scene, state) => forceLawHandles(routeId, state);
}

const routedForceLaw = new Set(['ch1-1-3', 'ch1-1-4', 'ch1-1-5', 'ch1-1-6', 'ch1-1-8', 'ch1-2-1', 'ch1-2-3', 'ch1-2-6']);
const specs = [
  ['ch1-1-3', 'ch1-1-3-force-vector-anatomy-behavior', 'force-components-derived', 'point-vector-tip-interactions'],
  ['ch1-1-4', 'ch1-1-4-moment-arm-behavior', 'perpendicular-moment-arm-derived', 'point-load-moment-interactions'],
  ['ch1-1-5', 'ch1-1-5-force-system-reducer-behavior', 'resultant-plus-moment-derived', 'resultant-polygon-interactions'],
  ['ch1-1-6', 'ch1-1-6-couple-free-vector-behavior', 'couple-moment-invariant-derived', 'couple-translation-interactions'],
  ['ch1-1-8', 'ch1-1-8-constraint-release-behavior', 'dof-reaction-map-derived', 'constraint-release-interactions'],
  ['ch1-2-1', 'ch1-2-1-two-force-body-behavior', 'collinear-equilibrium-derived', 'member-line-alignment-interactions'],
  ['ch1-2-3', 'ch1-2-3-parallelogram-law-behavior', 'vector-diagonal-derived', 'parallelogram-angle-interactions'],
  ['ch1-2-6', 'ch1-2-6-fbd-builder-behavior', 'constraint-to-reaction-derived', 'fbd-reaction-builder-interactions']
];
const entries = {};
specs.forEach(([routeId, behaviorId, derivedModelId, interactionSchemaId]) => {
  entries[routeId] = { behaviorId, derivedModelId, interactionSchemaId, handles: handlesFor(routeId) };
  if (routedForceLaw.has(routeId)) {
    entries[routeId].derived = forceLawDerived;
    entries[routeId].updateStateFromSlider = updateForceLawState;
  }
});
registry.registerMany(entries);

})();
