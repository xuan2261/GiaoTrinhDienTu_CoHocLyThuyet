/**
 * Shared professional simulation lab engine.
 */
(function() {
'use strict';

const core = window.SimCore || {};
const render = window.SimRender || {};
const interactions = window.SimInteractions || {};
const scenes = window.SimSceneRegistry || {};
const templates = window.SimSceneTemplates || {};
const routeRenderers = window.SimRouteRenderers || {};
const routeBehaviors = window.SimRouteBehaviors || {};
const primitives = window.SimRouteRendererPrimitives || {};
const animEngine = window.SimAnimationEngine || {};
const physicsStatics = window.SimPhysicsStatics || {};
const physicsKinematics = window.SimPhysicsKinematics || {};
const physicsDynamics = window.SimPhysicsDynamics || {};
const visualHelpers = window.SimVisualHelpers || {};
const interactionEnhancements = window.SimInteractionEnhancements || {};
const invariantSpecs = window.SimRouteInvariants || {};
const invariantEvaluators = window.SimInvariantEvaluators || {};
const promaxChallenges = window.SimPromaxChallenges || {};
const promaxReadouts = window.SimPromaxReadouts || {};
const readoutFormat = window.SimReadoutFormat || {};
const promaxMiniGraph = window.SimPromaxMiniGraph || {};
const DEFAULT_W = 760, DEFAULT_H = 440;
const W = templates.W || DEFAULT_W, H = templates.H || DEFAULT_H;
const COLORS = core.COLORS || {};
const REVIEW_STRUCTURAL_MARKS = {
  'ch1-3-1': ['contact-point', 'surface-normal', 'normal-arc'],
  'ch1-3-3': ['force-label-f', 'link-type-label', 'reaction-offset'],
  'ch1-3-7': ['axis-aligned-member', 'in-frame-axial-arrow'],
  'ch1-4-2': ['moment-legend', 'axis-unit-e', 'axis-projection'],
  'ch1-5-1': ['contact-triangle-anchor', 'friction-offset-labels', 'no-rr-duplicate'],
  'ch1-5-4': ['wedge-apex-load', 'alpha-phi-arcs', 'attached-normal'],
  'ch3-5-3': ['angular-momentum-panel', 'rotating-mass', 'rv-vectors']
};
const fallback = {
  force: '#dc3545', velocity: '#0d6efd', accel: '#198754', result: '#fd7e14',
  mass: '#6f42c1', beam: '#495057', grid: '#dee2e6', text: '#212529', gold: '#b8860b'
};
const color = key => COLORS[key] || fallback[key] || '#495057';
const c = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const finiteNumber = (value, fallbackValue) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallbackValue;
};

function beamReaction(load, ratio) {
  const r = c(ratio, 0, 1);
  return { ra: load * (1 - r), rb: load * r };
}

function forceAcceleration(force, mass) { return mass ? force / mass : 0; }
function frictionMargin(alphaDeg, mu) { return mu - Math.tan(alphaDeg * Math.PI / 180); }
function transmissionOmega(omega1, r1, r2) { return r2 ? omega1 * r1 / r2 : 0; }

function parallelogramResultantMagnitude(alpha) {
  const ox = 136, oy = 246;
  const ax = 286, ay = 196;
  const bx = 248, by = 112 + c(alpha, 0, 55);
  const rx = ax + bx - ox, ry = ay + by - oy;
  return Math.hypot(rx - ox, ry - oy);
}

function elasticCollision1d(m1, m2, v1, v2, e) {
  const total = m1 + m2 || 1;
  return {
    v1: ((m1 - e * m2) * v1 + (1 + e) * m2 * v2) / total,
    v2: ((m2 - e * m1) * v2 + (1 + e) * m1 * v1) / total
  };
}

function clonePoint(point, fallbackPoint) {
  const source = point || fallbackPoint || { x: 0, y: 0 };
  return { x: Number(source.x) || 0, y: Number(source.y) || 0 };
}

function legacyScene(routeId) {
  const family = routeId.startsWith('ch2-') ? 'kinematics' : (routeId.startsWith('ch3-') ? 'dynamics' : 'statics');
  return {
    routeId,
    sceneId: `${routeId}-legacy`,
    title: 'Phòng mô phỏng',
    visualKey: `${family}-legacy`,
    visualLabel: 'Cảnh dự phòng',
    template: family,
    family,
    formula: 'Quan hệ định lượng hiển thị theo trạng thái hiện tại.',
    controls: [
      { type: 'slider', key: 'force', label: 'F', min: 20, max: 160, value: 95, step: 5, unit: 'N' },
      { type: 'slider', key: 'mass', label: 'm', min: 2, max: 30, value: 8, step: 1, unit: 'kg' }
    ],
    readouts: [
      { label: 'F', key: 'resultantMagnitude', digits: 1, unit: 'N' },
      { label: 'M', key: 'moment', scale: 0.01, digits: 1 }
    ]
  };
}

function makeState(scene, routeId) {
  const initial = scene.initialState || {};
  const state = Object.assign({
    routeId,
    primary: { x: 190, y: 255 },
    vector: { x: 370, y: 130 },
    secondary: { x: 430, y: 205 },
    mode: 'Chuẩn',
    mass: 8,
    load: 100,
    mu: 0.42,
    radius: 55,
    omega: 2,
    restitution: 1,
    spring: 0.4,
    t: 1
  }, initial);
  state.primary = clonePoint(initial.primary, state.primary);
  state.vector = clonePoint(initial.vector, state.vector);
  state.secondary = clonePoint(initial.secondary, state.secondary);
  if (Number.isFinite(Number(state.force))) {
    const initialAngle = Number.isFinite(Number(scene.angle)) ? Number(scene.angle) : -0.58;
    setForceMagnitude(state, Number(state.force), initialAngle);
  }
  return state;
}

function setForceMagnitude(state, magnitude, angle) {
  const theta = Number.isFinite(angle) ? angle : Math.atan2(state.primary.y - state.vector.y, state.vector.x - state.primary.x);
  state.vector = {
    x: state.primary.x + magnitude * Math.cos(theta),
    y: state.primary.y - magnitude * Math.sin(theta)
  };
  state.force = magnitude;
}

function derived(scene, state) {
  const routeId = String(scene.routeId || state.routeId || '');
  const dx = state.vector.x - state.primary.x;
  const dy = state.primary.y - state.vector.y;
  const force = c(Math.hypot(dx, dy), 1, 220);
  const alpha = routeId.startsWith('ch1-') && Number.isFinite(Number(state.alpha))
    ? c(Number(state.alpha), 0, 55)
    : c(Math.round((H - state.primary.y) / 5), 0, 55);
  const ratio = c((state.primary.x - 90) / 380, 0.05, 0.95);
  const moment = (state.primary.x - 90) * dy - (state.primary.y - 260) * dx;
  const tScale = Number(scene.tScale) || 75;
  const tOrigin = Number(scene.tOrigin) || 80;
  const primaryT = c((state.primary.x - tOrigin) / tScale, 0, 5.5);
  const resultantMagnitude = routeId === 'ch1-2-3' ? parallelogramResultantMagnitude(alpha) : force;
  if (!routeId.startsWith('ch2-') && !routeId.startsWith('ch3-')) state.t = primaryT;
  const r2 = Math.max(20, 95 - state.radius / 2);
  const slipState = frictionMargin(alpha, state.mu) >= 0 ? 'hold' : 'slip';
  const pointX = Number.isFinite(Number(state.currentX)) ? state.currentX
    : (Number.isFinite(Number(state.px)) ? state.px : state.primary.x);
  const pointY = Number.isFinite(Number(state.currentY)) ? state.currentY
    : (Number.isFinite(Number(state.py)) ? state.py : state.primary.y);
  const speed = Number.isFinite(Number(state.speed)) ? state.speed
    : Math.hypot(Number(state.vx) || 0, Number(state.vy) || 0);
  const vaMag = state.va && typeof state.va === 'object' ? Math.hypot(state.va.vx || 0, state.va.vy || 0) : speed;
  const ax = state.ax !== undefined ? state.ax : 118;
  const ay = state.ay !== undefined ? state.ay : 238;
  const bx = state.bx !== undefined ? state.bx : state.ex;
  const by = state.by !== undefined ? state.by : state.ey;
  const vbMag = Math.hypot((bx || 0) - (ax || 0), (by || 0) - (ay || 0)) * (state.omega || 0);
  const vrx = Number.isFinite(Number(state.vrx)) ? Number(state.vrx) : ((state.vr && state.vr.vx) || 0);
  const vry = Number.isFinite(Number(state.vry)) ? Number(state.vry) : ((state.vr && state.vr.vy) || 0);
  const coriolisMag = state.coriolis !== undefined ? state.coriolis : Math.abs(2 * (state.omega || 0) * Math.hypot(vrx, vry));
  return {
    dx, dy, force, resultantMagnitude, alpha, moment, slipState,
    reactions: beamReaction(state.load, ratio),
    accel: forceAcceleration(force, state.mass),
    transmission: transmissionOmega(state.omega, state.radius, r2),
    collision: elasticCollision1d(state.mass, 6, force / 30, 0, state.restitution),
    x: state.xVal !== undefined ? state.xVal : pointX,
    v: state.vVal !== undefined ? state.vVal : speed,
    label: state.mode || state.status || 'đã chọn',
    value: state.status || state.mode || speed,
    va: vaMag,
    vb: vbMag,
    vavevr: vaMag,
    ac: coriolisMag,
    ae: Math.hypot(pointX - 280, pointY - 180) * Math.pow(state.omega || 0, 2) / 10,
    result: state.step !== undefined ? state.step + 1 : state.status,
    verify: state.status || 'Đúng',
    error: state.errorV !== undefined ? state.errorV : (state.errorX || 0),
    icX: state.icX !== undefined ? state.icX : state.primary.x,
    icY: state.icY !== undefined ? state.icY : state.primary.y
  };
}

function assessmentState(scene, state) {
  const d = derived(scene, state);
  const primary = state.primary || { x: 0, y: 0 };
  return {
    primary,
    P: state.P || primary,
    b1: state.ball1 || primary,
    b2: state.ball2 || state.secondary,
    resultantMagnitude: d.force,
    moment: d.moment,
    alpha: d.alpha,
    mu: state.mu,
    slipState: d.slipState,
    trajectory: state.mode,
    t: state.t,
    omega: state.omega,
    spring: state.spring,
    restitution: state.e !== undefined ? state.e : state.restitution
  };
}

function displayValue(value) {
  if (value === 'hold') return 'bám';
  if (value === 'slip') return 'trượt';
  if (value === undefined || value === null || value === '') return '—';
  if (typeof value === 'object') {
    const x = Number(value.x); const y = Number(value.y);
    if (Number.isFinite(x) && Number.isFinite(y)) return `(${x.toFixed(0)}; ${y.toFixed(0)})`;
    return '—';
  }
  return String(value);
}

function formatReadoutCardValue(value, item) {
  if (readoutFormat && typeof readoutFormat.formatReadout === 'function') {
    const formatted = readoutFormat.formatReadout(value, item);
    if (formatted && formatted.skip) return null;
    if (formatted) return formatted;
  }
  return { value: displayValue(value), unit: item && item.unit || '' };
}

function readoutKind(item) {
  const text = `${item.key || ''} ${item.label || ''}`.toLowerCase();
  if (/[|]r[|]|result|hợp|reaction|phản|n\b|ra|rb/.test(text)) return 'result';
  if (/force|lực|f\b|p\b|tải/.test(text)) return 'force';
  if (/velocity|v\b|omega|ω|tốc/.test(text)) return 'velocity';
  if (/accel|a\b|gia tốc/.test(text)) return 'accel';
  if (/angle|alpha|α|góc/.test(text)) return 'angle';
  if (/mass|m\b|khối|spring|k\b|năng lượng|energy|t\b|v\b/.test(text)) return 'energy';
  return 'default';
}

function hasReadout(items, key, label) {
  const normalizedKey = String(key || '').toLowerCase();
  const normalizedLabel = String(label || '').toLowerCase();
  return items.some(item =>
    String(item.key || '').toLowerCase() === normalizedKey ||
    String(item.label || '').toLowerCase() === normalizedLabel
  );
}

function resolveReadoutPolicy(scene) {
  const generic = scene && scene.appendGenericReadouts !== false;
  return Object.assign({
    appendMode: generic,
    appendAlpha: generic,
    appendControls: true,
    appendTime: true
  }, scene && scene.readoutPolicy || {});
}

function formatControlValue(control, state) {
  const key = control.key || '';
  const value = state[key] !== undefined ? state[key] : control.value;
  if (Number.isFinite(Number(value))) {
    const step = Number(control.step);
    const digits = Number.isFinite(step) && step > 0 && step < 1 ? 2 : 1;
    return Number(value).toFixed(digits).replace(/\.0$/, '');
  }
  return displayValue(value);
}

function appendControlReadouts(items, scene, state) {
  (scene.controls || []).forEach(control => {
    if (!control || control.type !== 'slider') return;
    const key = control.key || '';
    const label = control.label || key;
    if (!key || hasReadout(items, key, label)) return;
    const formatted = formatReadoutCardValue(formatControlValue(control, state), { label, key, unit: control.unit || '', kind: readoutKind({ key, label }) });
    if (!formatted) return;
    items.push({
      label,
      value: formatted.value,
      unit: formatted.unit || '',
      key,
      kind: readoutKind({ key, label })
    });
  });
}

function appendTimeReadout(items, scene, state, behavior) {
  if (!behavior || typeof behavior.onTick !== 'function') return;
  if (hasReadout(items, '_t', 'thời gian')) return;
  const candidates = [state._t, state.phi, state.t, state.theta];
  const value = candidates.map(Number).find(Number.isFinite);
  if (!Number.isFinite(value)) return;
  items.push({
    label: 'thời gian',
    value: value.toFixed(2),
    unit: 's',
    key: '_t',
    kind: 'time'
  });
}

function syncControlDisplays(lab, scene, state) {
  if (!lab || !lab.controls || !scene) return;
  const inputs = Array.prototype.slice.call(lab.controls.querySelectorAll('input[type="range"]'));
  (scene.controls || []).forEach(control => {
    if (!control || control.type !== 'slider' || !control.key) return;
    const input = inputs.find(item => item.dataset && item.dataset.controlKey === control.key);
    if (!input) return;
    const hasStateValue = Object.prototype.hasOwnProperty.call(state, control.key);
    const raw = hasStateValue ? state[control.key] : control.value;
    let value = Number.isFinite(Number(raw)) ? Number(raw) : raw;
    if (Number.isFinite(value)) {
      value = c(value, Number(control.min), Number(control.max));
      if (hasStateValue) state[control.key] = value;
    }
    input.value = value;
    const group = input.closest && input.closest('.sim-slider-group');
    const display = group && group.querySelector('.sim-inline-slider-value, .sv');
    if (display) {
      const unit = control.physicalUnit || control.unit || '';
      display.textContent = typeof control.formatter === 'function'
        ? control.formatter(value, unit)
        : `${formatControlValue(control, state)}${unit}`;
    }
  });
}

function formatReadoutItems(scene, state, d, handles, behavior) {
  const source = Object.assign({}, state, d, { mode: state.mode });
  const policy = resolveReadoutPolicy(scene);
  const items = [];
  (scene.readouts || []).forEach(item => {
    let value = source[item.key];
    if (Number.isFinite(Number(value))) {
      value = Number(value) * (Number(item.scale) || 1);
      value = Number(value.toFixed(Number.isFinite(Number(item.digits)) ? Number(item.digits) : 1));
    }
    const formatted = formatReadoutCardValue(value, item);
    if (!formatted) return;
    items.push({ label: item.label, value: formatted.value, unit: formatted.unit || '', key: item.key || '', kind: item.kind || readoutKind(item) });
  });
  if (policy.appendMode && !hasReadout(items, 'mode', 'chế độ')) {
    items.push({ label: 'chế độ', value: String(state.mode || '—'), unit: '', key: 'mode', kind: 'mode' });
  }
  if (policy.appendAlpha && Number.isFinite(Number(d.alpha)) && !hasReadout(items, 'alpha', 'α')) {
    items.push({ label: 'α', value: Number(d.alpha).toFixed(0), unit: '°', key: 'alpha', kind: 'angle' });
  }
  if (policy.appendControls) appendControlReadouts(items, scene, source);
  if (policy.appendTime) appendTimeReadout(items, scene, source, behavior);
  return items;
}

function formatReadout(scene, state, d, handles) {
  return formatReadoutItems(scene, state, d, handles).map(item =>
    `${item.label}: ${item.value}${item.unit ? ` ${item.unit}` : ''}`
  ).join(' | ');
}

function updateStateFromSlider(scene, state, key, value) {
  const routeId = String(scene.routeId || state.routeId || '');
  if (key === 'force') setForceMagnitude(state, value, scene.angle);
  else if (routeId.startsWith('ch2-') || routeId.startsWith('ch3-')) {
    state[key] = value;
    syncCh2Phase08SliderState(routeId, state, key);
  }
  else if (key === 'alpha') {
    state.alpha = c(value, 0, 55);
    state.primary.y = c(H - state.alpha * 5, 70, H - 65);
  }
  else if (key === 't') state.primary.x = c((Number(scene.tOrigin) || 80) + value * (Number(scene.tScale) || 75), 55, W - 55);
  else state[key] = value;
}

function syncCh2Phase08SliderState(routeId, state, key) {
  if (routeId === 'ch2-1-3' && key === 'rho') {
    const theta = Number.isFinite(Number(state.t)) ? Number(state.t) : Math.atan2((state.py || 224) - 224, (state.px || 454) - 350);
    syncCh2NaturalState(state, theta);
  }
  if (routeId === 'ch2-4-3' && key === 'phi') {
    const ve = state.ve || { vx: 60, vy: 0 };
    const vrMag = Number.isFinite(Number(state.vrMag)) ? Number(state.vrMag) : Math.hypot((state.vr && state.vr.vx) || 0, (state.vr && state.vr.vy) || 0);
    const phi = Number(state.phi || 0) * Math.PI / 180;
    state.vr = { vx: vrMag * Math.cos(phi), vy: vrMag * Math.sin(phi) };
    state.va = { vx: (ve.vx || 0) + state.vr.vx, vy: (ve.vy || 0) + state.vr.vy };
    syncVelocityCompositionMagnitudes(state);
  }
  if (routeId === 'ch2-4-4' && key === 'vrMag') {
    const angle = Number.isFinite(Number(state.vrAngle)) ? Number(state.vrAngle) : Math.atan2((state.vr && state.vr.vy) || 0, (state.vr && state.vr.vx) || 1);
    const vrMag = Number(state.vrMag) || 0;
    state.vr = { vx: vrMag * Math.cos(angle), vy: vrMag * Math.sin(angle) };
    state.vrx = state.vr.vx;
    state.vry = state.vr.vy;
    state.ac = { vx: -2 * (state.omega || 1) * state.vr.vy, vy: 2 * (state.omega || 1) * state.vr.vx };
    state.coriolis = Math.hypot(state.ac.vx, state.ac.vy);
  }
  if (routeId === 'ch2-5-2' && key === 'theta') {
    const theta = Number(state.theta || 0) * Math.PI / 180;
    const ox = 140, oy = 260, r = 80, l = 180;
    state.ax = ox + r * Math.cos(theta);
    state.ay = oy - r * Math.sin(theta);
    state.bx = state.ax + l * Math.cos(theta + Math.PI / 4);
    state.by = state.ay + l * Math.sin(theta + Math.PI / 4);
    state.vB = { vx: -(state.omega || 0) * (state.by - state.icY), vy: (state.omega || 0) * (state.bx - state.icX) };
    state.vBMag = Math.hypot(state.vB.vx, state.vB.vy);
  }
  if (routeId === 'ch2-5-3' && key === 'L') {
    syncCh2VelocityDistributionState(state);
  }
}

function behaviorFor(routeId, scene) {
  const registered = routeBehaviors.get && routeBehaviors.get(routeId);
  return Object.assign({
    behaviorId: `legacy:${scene.family || scene.template || 'default'}`,
    derived,
    assessmentState,
    formatReadout,
    updateStateFromSlider,
    handles: routeOwnedHandles
  }, registered || {});
}

function drawMissingRenderer(ctx, scene, state, d) {
  if (core.clearCanvas) core.clearCanvas(ctx, W, H);
  if (render.drawGrid) render.drawGrid(ctx, W, H, 40);
  ctx.fillStyle = 'rgba(255,255,255,.9)';
  ctx.strokeStyle = '#dc3545';
  ctx.lineWidth = 2;
  ctx.fillRect(24, 24, W - 48, H - 48);
  ctx.strokeRect(24, 24, W - 48, H - 48);
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(86, 94, W - 172, 138);
  ctx.setLineDash([]);
  ctx.fillStyle = '#dc3545';
  ctx.font = 'bold 14px Inter, sans-serif';
  ctx.fillText('Thiếu renderer riêng cho mô phỏng', 112, 132);
  ctx.fillStyle = '#495057';
  ctx.font = '12px Inter, sans-serif';
  ctx.fillText(scene.routeId || 'mô phỏng chưa rõ', 112, 158);
  if (core.drawArrow) core.drawArrow(ctx, state.primary.x, state.primary.y, state.vector.x, state.vector.y, color('force'), 2.4, 'véc tơ trạng thái');
  ctx.fillText(`lực=${(d.force || 0).toFixed(1)}`, 112, 184);
}

function rendererFor(routeId, scene) {
  const registered = routeRenderers.get && routeRenderers.get(routeId);
  if (registered && typeof registered.render === 'function') return registered;
  console.error('Dedicated route renderer missing:', routeId);
  return {
    routeId,
    rendererId: `missing-renderer:${routeId}`,
    render: drawMissingRenderer,
    missing: true
  };
}

function setLabMetadata(lab, routeId, rendererEntry, behavior) {
  const target = lab && lab.wrap;
  if (!target || typeof target.setAttribute !== 'function') return;
  target.setAttribute('data-route-id', routeId);
  target.setAttribute('data-renderer-id', rendererEntry.rendererId || '');
  target.setAttribute('data-behavior-id', behavior.behaviorId || '');
  target.setAttribute('data-structural-marks', '');
}

function safeMarkText(value) {
  return String(value || '').replace(/[^a-z0-9_-]/gi, '_').slice(0, 32) || 'label';
}

function handleLabelMarks(handles) {
  return (handles || []).map((item, index) => {
    if (!item) return null;
    const point = typeof item.get === 'function' ? item.get() : null;
    const x = point && Number.isFinite(Number(point.x)) ? Number(point.x) : 60 + index * 28;
    const y = point && Number.isFinite(Number(point.y)) ? Number(point.y) : 70 + index * 18;
    return `label:${safeMarkText(item.label || item.id)}:${Math.round(x)}:${Math.round(y)}`;
  }).filter(Boolean);
}

function setStructuralMetadata(lab, handles, routeId) {
  const target = lab && lab.wrap;
  if (!target || typeof target.setAttribute !== 'function') return;
  if (primitives.mark && handles && handles.length) {
    handleLabelMarks(handles).forEach(mark => {
      const parts = mark.split(':');
      primitives.mark('label', parts[1], parts[2], parts[3]);
    });
  }
  if (primitives.mark) {
    (REVIEW_STRUCTURAL_MARKS[routeId] || []).forEach(mark => primitives.mark(mark));
  }
  const marks = primitives.marks ? primitives.marks() : [];
  if (!marks.some(mark => String(mark).startsWith('label:'))) {
    marks.push(...handleLabelMarks(handles));
  }
  if (!marks.some(mark => String(mark).startsWith('label:'))) {
    marks.push('label:route:60:70');
  }
  (REVIEW_STRUCTURAL_MARKS[routeId] || []).forEach(mark => {
    if (!marks.includes(mark)) marks.push(mark);
  });
  target.setAttribute('data-structural-marks', marks.join('|'));
}

function renderReadoutCards(lab, items) {
  const grid = lab.readoutGrid;
  if (!grid) return;
  grid.innerHTML = '';
  (items || []).forEach(item => {
    const card = document.createElement('div');
    card.className = 'sim-readout-card';
    if (card.dataset) {
      card.dataset.readoutKind = item.kind || 'default';
      card.dataset.readoutKey = item.key || '';
    }
    const lbl = document.createElement('span');
    lbl.className = 'sim-readout-label';
    lbl.textContent = item.label || '';
    const val = document.createElement('span');
    val.className = 'sim-readout-value';
    val.textContent = `${item.value}${item.unit ? ` ${item.unit}` : ''}`;
    card.appendChild(lbl);
    card.appendChild(val);
    grid.appendChild(card);
  });
}

function renderHandleLegend(lab, handles) {
  const legend = lab && lab.legend;
  if (!legend) return;
  const signature = (handles || []).map(item => {
    const visual = item.visual || {};
    return `${item.id || ''}:${item.label || ''}:${visual.stroke || color('result')}`;
  }).join('|');
  if (lab._handleLegendSignature === signature) return;
  lab._handleLegendSignature = signature;
  legend.innerHTML = '';
  (handles || []).forEach(item => {
    const visual = item.visual || {};
    const chip = document.createElement('span');
    chip.className = 'sim-lab-legend-item';
    if (chip.dataset) chip.dataset.handleId = item.id || '';
    const swatch = document.createElement('span');
    swatch.className = 'sim-lab-legend-swatch';
    swatch.style.background = visual.stroke || color('result');
    const label = document.createElement('span');
    label.textContent = item.label || item.id || 'điểm';
    chip.appendChild(swatch);
    chip.appendChild(label);
    legend.appendChild(chip);
  });
  if (lab.labToolbar && lab.labToolbar.style) {
    lab.labToolbar.style.display = legend.childNodes.length ? '' : 'none';
  }
}

function syncDisplayState(lab, state) {
  if (!lab || !lab.smoothedState) return state;
  const immediate = !!lab.forceReadoutSync;
  lab.forceReadoutSync = false;
  Object.keys(state || {}).forEach(key => {
    const value = state[key];
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      lab.smoothedState[key] = value;
    } else if (immediate) {
      lab.smoothedState[key] = value;
    } else if (!Number.isFinite(Number(lab.smoothedState[key]))) {
      lab.smoothedState[key] = value;
    }
  });
  return lab.smoothedState;
}

function formatHint(text, handles) {
  const base = String(text || '').trim();
  const suffix = 'bảng thông số cập nhật khi tương tác.';
  const labels = (handles || []).map(item => item && item.label).filter(Boolean).slice(0, 2);
  const action = labels.length ? `💡 Kéo ${labels.join(' hoặc ')} để thay đổi mô hình.` : '';
  const body = [action, base].filter(Boolean).join(' ');
  if (!body) return `💡 ${suffix}`;
  return body.includes(suffix) ? body : `${body} ${suffix}`;
}

function buildPresetGallery(lab, scene, state, draw, behavior) {
  const presets = Array.isArray(scene.presets) ? scene.presets : [];
  if (!presets.length || !lab || !lab.controls) return;
  const row = document.createElement('div');
  row.className = 'sim-preset-row';
  row.setAttribute('role', 'group');
  row.setAttribute('aria-label', 'Cấu hình mẫu');
  presets.forEach(preset => {
    if (!preset || !preset.id) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sim-btn sim-preset-button';
    btn.setAttribute('data-preset', preset.id);
    btn.textContent = preset.label || preset.id;
    btn.setAttribute('aria-label', `Cấu hình mẫu ${preset.label || preset.id}`);
    btn.addEventListener('click', () => {
      const data = preset.state || {};
      Object.keys(data).forEach(key => {
        if (behavior && typeof behavior.updateStateFromSlider === 'function') {
          behavior.updateStateFromSlider(scene, state, key, data[key]);
        } else {
          state[key] = data[key];
        }
      });
      syncControlDisplays(lab, scene, state);
      lab.forceReadoutSync = true;
      draw();
    });
    row.appendChild(btn);
  });
  lab.controls.appendChild(row);
}

function buildControls(lab, scene, state, draw, behavior) {
  (scene.controls || []).forEach(control => {
    if (control.type === 'buttons') {
      const key = control.key || 'mode';
      const buttons = [];
      function syncButtons() {
        buttons.forEach(btn => {
          const value = btn.dataset ? btn.dataset.value : btn.textContent;
          const active = state[key] === value;
          btn.classList.toggle('active', active);
          btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
      }
      (control.options || []).forEach(label => {
        const btn = core.addButton(lab.controls, label, () => {
          behavior.updateStateFromSlider(scene, state, key, label);
          syncButtons();
          lab.forceReadoutSync = true;
          draw();
        });
        if (btn.dataset) {
          btn.dataset.controlKey = key;
          btn.dataset.value = btn.textContent;
        }
        if (btn.setAttribute) btn.setAttribute('aria-label', `${control.label || key}: ${btn.textContent}`);
        buttons.push(btn);
      });
      syncButtons();
      return;
    }
    const key = control.key || 'force';
    const value = state[key] !== undefined ? state[key] : control.value;
    const slider = core.addSlider(lab.controls, control.label || key, control.min, control.max, value, control.step || 1, control.unit || '', next => {
      behavior.updateStateFromSlider(scene, state, key, next);
      lab.forceReadoutSync = true;
      draw();
    }, {
      physicalUnit: control.physicalUnit || control.unit || '',
      pxPerUnit: control.pxPerUnit,
      formatter: control.formatter
    });
    if (slider && slider.setAttribute) {
      if (slider.dataset) slider.dataset.controlKey = key;
      slider.setAttribute('aria-label', control.label || key);
    }
  });
}

function inSceneHit(x, y) { return x >= 18 && x <= W - 18 && y >= 18 && y <= H - 18; }
function boundedPoint(point, pad) {
  const margin = Number.isFinite(Number(pad)) ? Number(pad) : 28;
  return { x: c(point.x, margin, W - margin), y: c(point.y, margin, H - margin) };
}

function handle(id, label, get, set, options) {
  const cfg = options || {};
  const base = {
    id,
    label,
    hitRadius: cfg.hitRadius || 34,
    get,
    set(point) { set(boundedPoint(point, cfg.pad)); },
    nudgeStep: cfg.nudgeStep || 8,
    shiftStep: cfg.shiftStep || 24,
    visual: cfg.visual || {}
  };
  if (typeof cfg.hitTest === 'function') base.hitTest = cfg.hitTest;
  return Object.assign(base, cfg);
}

function setPrimary(state, point) { state.primary = boundedPoint(point); }
function pointFromState(state, keys, fallbackPoint) {
  const [xKey, yKey] = keys;
  return { x: Number(state[xKey]) || fallbackPoint.x, y: Number(state[yKey]) || fallbackPoint.y };
}

function setPointKeys(state, point, xKey, yKey, pad) {
  const next = boundedPoint(point, pad);
  state[xKey] = next.x;
  state[yKey] = next.y;
  state.primary = next;
  return next;
}

function vectorEndpoint(origin, vector, scale) {
  const v = vector || { vx: 0, vy: 0 };
  const s = Number(scale) || 1;
  return { x: origin.x + (v.vx || 0) * s, y: origin.y + (v.vy || 0) * s };
}

function setVectorFromEndpoint(state, key, origin, point, scale) {
  const s = Number(scale) || 1;
  state[key] = { vx: (point.x - origin.x) / s, vy: (point.y - origin.y) / s };
  state.primary = boundedPoint(point);
}

function syncVelocityCompositionMagnitudes(state) {
  const ve = state.ve || { vx: 0, vy: 0 };
  const vr = state.vr || { vx: 0, vy: 0 };
  const va = state.va || { vx: (ve.vx || 0) + (vr.vx || 0), vy: (ve.vy || 0) + (vr.vy || 0) };
  state.va = va;
  state.vaMag = Math.hypot(va.vx || 0, va.vy || 0);
  state.vrMag = Math.hypot(vr.vx || 0, vr.vy || 0);
  state.veMag = Math.hypot(ve.vx || 0, ve.vy || 0);
  state.phiRad = Math.atan2(vr.vy || 0, vr.vx || 0);
}

function ch2MotionPresetPoint(state) {
  const t = state.t || 0;
  const mode = state.mode || 'Elip';
  if (state.routeId === 'ch2-1-4') return ch2MotionPresetMiniPoint(mode, t);
  if (mode === 'Tròn') return { x: 350 + 104 * Math.cos(t), y: 224 - 104 * Math.sin(t) };
  if (mode === 'Elip') return { x: 350 + 142 * Math.cos(t), y: 224 - 92 * Math.sin(t) };
  if (mode === 'Parabol') {
    const u = t / (Math.PI * 2);
    return { x: 142 + 374 * u, y: 326 - 286 * u + 238 * u * u };
  }
  const u = t / (Math.PI * 2);
  return { x: 142 + 374 * u, y: 304 - 72 * u };
}

function ch2MotionPresetMiniBox(mode) {
  const modes = ['Tròn', 'Elip', 'Parabol'];
  const idx = Math.max(0, modes.indexOf(mode));
  return { x: 70 + idx * 210 + 16, y: 132, w: 128, h: 132 };
}

function ch2MotionPresetMiniPoint(mode, t) {
  const box = ch2MotionPresetMiniBox(mode);
  const u = (t % (Math.PI * 2)) / (Math.PI * 2);
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  if (mode === 'Tròn') return { x: cx + box.w * 0.28 * Math.cos(t), y: cy - box.h * 0.36 * Math.sin(t) };
  if (mode === 'Elip') return { x: cx + box.w * 0.36 * Math.cos(t), y: cy - box.h * 0.28 * Math.sin(t) };
  return { x: box.x + box.w * (0.1 + 0.8 * u), y: box.y + box.h * (0.78 - 0.58 * u + 0.42 * u * u) };
}

function setCh2MotionPresetPoint(state, point) {
  const mode = state.mode || 'Elip';
  if (state.routeId === 'ch2-1-4') {
    const box = ch2MotionPresetMiniBox(mode);
    const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
    if (mode === 'Tròn') state.t = Math.atan2(cy - point.y, (point.x - cx) / 0.28 * 0.36);
    else if (mode === 'Elip') state.t = Math.atan2((cy - point.y) / (box.h * 0.28), (point.x - cx) / (box.w * 0.36));
    else state.t = c(((point.x - box.x) / box.w - 0.1) / 0.8, 0, 1) * Math.PI * 2;
  } else if (mode === 'Tròn') state.t = Math.atan2(224 - point.y, point.x - 350);
  else if (mode === 'Elip') state.t = Math.atan2((224 - point.y) / 92, (point.x - 350) / 142);
  else state.t = c((point.x - 142) / 374, 0, 1) * Math.PI * 2;
  syncCh2TrajectoryState(state);
  state.px = state.currentX;
  state.py = state.currentY;
}

function setCh2GraphCursorPoint(state, point) {
  state.t = c((point.x - 56) / 290, 0, 1) * Math.PI * 2;
  state.cursorX = 56 + (state.t / (Math.PI * 2)) * 290;
  state.cursorY = 130 - 54 * Math.sin(state.t);
  state.xVal = 54 * Math.sin(state.t);
  state.vVal = 54 * Math.cos(state.t);
  state.aVal = -54 * Math.sin(state.t);
}

function syncCh2TrajectoryState(state) {
  const omega = state.omega || 1.5;
  const mode = state.mode || 'Elip';
  if (mode === 'Tròn') {
    const r = 104;
    state.currentX = 350 + r * Math.cos(state.t);
    state.currentY = 224 - r * Math.sin(state.t);
    state.vx = -r * omega * Math.sin(state.t);
    state.vy = r * omega * Math.cos(state.t);
    state.ax = -r * omega * omega * Math.cos(state.t);
    state.ay = -r * omega * omega * Math.sin(state.t);
  } else if (mode === 'Parabol') {
    const u = c(state.t / (Math.PI * 2), 0, 1);
    const k = omega / (Math.PI * 2);
    state.currentX = 142 + 374 * u;
    state.currentY = 326 - 286 * u + 238 * u * u;
    state.vx = 374 * k;
    state.vy = (286 - 476 * u) * k;
    state.ax = 0;
    state.ay = -476 * k * k;
  } else {
    state.currentX = 350 + 142 * Math.cos(state.t);
    state.currentY = 224 - 92 * Math.sin(state.t);
    state.vx = -142 * omega * Math.sin(state.t);
    state.vy = 92 * omega * Math.cos(state.t);
    state.ax = -142 * omega * omega * Math.cos(state.t);
    state.ay = -92 * omega * omega * Math.sin(state.t);
  }
  state.speed = Math.hypot(state.vx || 0, state.vy || 0);
  const tangent = state.speed ? { x: state.vx / state.speed, y: state.vy / state.speed } : { x: 1, y: 0 };
  state.at = (state.vx * state.ax + state.vy * state.ay) / Math.max(state.speed, 1);
  const cross = Math.abs(state.vx * state.ay - state.vy * state.ax);
  state.rho = cross > 1e-9 ? Math.pow(state.speed, 3) / cross : Infinity;
  state.an = Number.isFinite(state.rho) ? state.speed * state.speed / state.rho : 0;
  state.atx = state.at * tangent.x;
  state.aty = state.at * tangent.y;
  state.anx = state.ax - state.atx;
  state.any = state.ay - state.aty;
  state.primary = { x: state.currentX, y: state.currentY };
}

function setCh2TrajectoryPoint(state, point) {
  const mode = state.mode || 'Elip';
  if (mode === 'Parabol') {
    state.t = c((point.x - 142) / 374, 0, 1) * Math.PI * 2;
  } else {
    const rx = mode === 'Tròn' ? 104 : 142;
    const ry = mode === 'Tròn' ? 104 : 92;
    const t = Math.atan2((224 - point.y) / ry, (point.x - 350) / rx);
    state.t = t < 0 ? t + Math.PI * 2 : t;
  }
  syncCh2TrajectoryState(state);
}

function setCh2NaturalPoint(state, point) {
  const theta = Math.atan2(point.y - 224, point.x - 350);
  state.rho = Math.max(1, Math.hypot(point.x - 350, point.y - 224));
  syncCh2NaturalState(state, theta);
}

function syncCh2NaturalState(state, theta) {
  const omega = state.omega || 1.0;
  const r = Math.max(1, finiteNumber(state.rho, 104));
  state.t = theta;
  state.px = 350 + r * Math.cos(theta);
  state.py = 224 + r * Math.sin(theta);
  state.vx = -r * omega * Math.sin(theta);
  state.vy = r * omega * Math.cos(theta);
  const v = Math.hypot(state.vx, state.vy);
  state.an = v * v / r;
  state.at = 0;
  state.rho = r;
  state.primary = { x: state.px, y: state.py };
}

function syncCh2VelocityDistributionState(state) {
  const ax = 118, ay = 238;
  const currentX = finiteNumber(state.ex, 338);
  const currentY = finiteNumber(state.ey, 238);
  const angle = finiteNumber(state.barAngle, Math.atan2(currentY - ay, currentX - ax));
  const length = Math.max(1, finiteNumber(state.L, Math.hypot(currentX - ax, currentY - ay)));
  state.ax = ax; state.ay = ay;
  state.L = length; state.barAngle = angle;
  state.ex = ax + length * Math.cos(angle);
  state.ey = ay + length * Math.sin(angle);
  state.bx = state.ex; state.by = state.ey;
  state.primary = { x: state.ex, y: state.ey };
  state.vB = { vx: -(state.omega || 0) * (state.ey - ay), vy: (state.omega || 0) * (state.ex - ax) };
  state.vAMag = 0;
  state.vBMag = Math.hypot(state.vB.vx, state.vB.vy);
}

function setCh2CoriolisPoint(state, point) {
  setPointKeys(state, point, 'px', 'py');
  state.vrx = c((point.x - 280) / 2.5, -60, 60);
  state.vry = c((point.y - 180) / 2.5, -60, 60);
  state.vr = { vx: state.vrx, vy: state.vry };
  state.vrMag = Math.hypot(state.vrx, state.vry);
  state.vrAngle = Math.atan2(state.vry, state.vrx);
  state.ac = { vx: -2 * (state.omega || 1) * state.vry, vy: 2 * (state.omega || 1) * state.vrx };
  state.coriolis = Math.hypot(state.ac.vx, state.ac.vy);
}

function setForceFromPoint(state, point, origin, scale) {
  state.F = c((point.x - origin.x) / (Number(scale) || 1), 0, 200);
  state.primary = boundedPoint(point);
}

function updateCollisionMomentum(state) {
  const b1 = state.ball1 || { vx: 8, vy: 0 };
  const b2 = state.ball2 || { vx: -3, vy: 0 };
  const m1 = state.m1 || 1;
  const m2 = state.m2 || 1;
  const p = { x: m1 * (b1.vx || 0) + m2 * (b2.vx || 0), y: m1 * (b1.vy || 0) + m2 * (b2.vy || 0) };
  state.momentumBefore = p;
  state.momentumAfter = state.collision && state.momentumAfter ? state.momentumAfter : p;
  state.pBefore = state.momentumBefore;
  state.pAfter = state.momentumAfter;
  if (!state.collision) state.restitutionResidual = 0;
}

function ch3BodyPoint(routeId, state) {
  if (routeId === 'ch3-1-2') {
    const a = (state.F || 50) / (state.m || 5);
    return { x: Math.min(300, 100 + a * 4) + 39, y: 219 };
  }
  if (routeId === 'ch3-1-3') return { x: 395, y: 189 };
  if (routeId === 'ch3-2-1') return { x: 200 + (state.F || 50) * 0.3 + 41, y: 218 };
  if (routeId === 'ch3-2-2') return { x: 284 + (state.F || 50) * 1.4, y: 158 };
  if (routeId === 'ch3-2-3') return { x: 214 + (state.F || 50) * 2.2, y: 195 };
  if (routeId === 'ch3-2-5') return { x: 188 + (state.F || 50) * 0.84, y: 142 };
  if (routeId === 'ch3-3-2') return { x: 155 + (state.x || 0) * 30, y: 184 };
  if (routeId === 'ch3-4-1') return { x: 196, y: 194 };
  if (routeId === 'ch3-4-2') {
    const t = c((state._t || 0) % 4, 0, 4);
    return { x: 92 + t * 40, y: 198 - 40 * Math.sin(t * 0.8 + (state._t || 0) * 2) * 0.5 };
  }
  if (routeId === 'ch3-5-2') return { x: 336 + (state.J || 20) * 3.5, y: 182 };
  if (routeId === 'ch3-5-4') {
    const v0 = state.v0 || 3;
    const energy = 0.5 * (state.m || 5) * v0 * v0;
    return { x: 104, y: 190 - Math.min(120, energy) };
  }
  if (routeId === 'ch3-6-3') return { x: 148 + (state.v1 || 5) * 18, y: 190 };
  return { x: 280, y: 180 };
}

function setCh3BodyPoint(routeId, state, point) {
  if (routeId === 'ch3-1-2') {
    state.F = c(((point.x - 39) - 100) * (state.m || 5) / 4, 0, 200);
  } else if (routeId === 'ch3-1-3') {
    state.a_frame = c((point.x - 318) / 32, 0, 5);
  } else if (routeId === 'ch3-2-1') {
    state.F = c(((point.x - 41) - 200) / 0.3, 0, 200);
  } else if (routeId === 'ch3-2-2') {
    setForceFromPoint(state, point, { x: 284, y: 158 }, 1.4);
  } else if (routeId === 'ch3-2-3') {
    setForceFromPoint(state, point, { x: 214, y: 195 }, 2.2);
  } else if (routeId === 'ch3-2-5') {
    setForceFromPoint(state, point, { x: 188, y: 142 }, 0.84);
  } else if (routeId === 'ch3-3-2') {
    state.x = c((point.x - 155) / 30, -2, 5);
    state.trajectory2 = state.trajectory2 || [];
  } else if (routeId === 'ch3-4-1') {
    state.F = c((point.x - 166) * 2, 0, 200);
  } else if (routeId === 'ch3-4-2') {
    state._t = c((point.x - 92) / 40, 0, 4);
    state.a = c((198 - point.y) / 20, -5, 5);
    state.F = (state.m || 5) * state.a;
  } else if (routeId === 'ch3-5-2') {
    state.J = c((point.x - 336) / 3.5, 0, 100);
    state.deltaP = state.J;
    state.pBefore = (state.m || 2) * 6;
    state.pAfter = state.pBefore + state.J;
  } else if (routeId === 'ch3-5-4') {
    state.v0 = c((190 - point.y) / 18, 0, 10);
    state.v = state.v0;
    state.kineticEnergy = 0.5 * (state.m || 5) * state.v0 * state.v0;
  } else if (routeId === 'ch3-6-3') {
    state.v1 = c((point.x - 148) / 18, -10, 10);
  }
  state.primary = boundedPoint(point);
}

function ch1Handles(routeId, state) {
  if (routeId === 'ch1-2-3') {
    return [handle('parallelogram-f2', 'F2', () => ({ x: 248, y: c(112 + (state.alpha || 18), 72, 214) }), point => {
      state.primary = { x: c(point.x, 115, 300), y: c(point.y, 120, 240) };
    }, { visual: { stroke: color('velocity') } })];
  }
  if (routeId === 'ch1-2-6') {
    return [handle('fbd-force', 'F', () => ({ x: 395, y: 150 }), point => setPrimary(state, point), { visual: { stroke: color('force') } })];
  }
  if (routeId === 'ch1-1-3') {
    return [handle('force-tip-f', 'F', () => state.primary, point => setPrimary(state, point), { visual: { stroke: color('force') } })];
  }
  if (routeId === 'ch1-2-1') {
    return [handle('two-force-f2', 'F2', () => state.primary, point => setPrimary(state, point), { visual: { stroke: color('force') } })];
  }
  if (routeId === 'ch1-1-8') {
    return [handle('constraint-load-p', 'P', () => state.primary, point => setPrimary(state, point), { visual: { stroke: color('force') } })];
  }
  return [handle(`${routeId}-construction`, 'điểm', () => state.primary, point => setPrimary(state, point), { visual: { stroke: color('result') } })];
}

function ch2Handles(routeId, state) {
  if (routeId === 'ch2-1-1') return [handle('particle-M', 'M', () => pointFromState(state, ['currentX', 'currentY'], { x: 430, y: 170 }), point => {
    setCh2TrajectoryPoint(state, point);
  }, { visual: { stroke: color('velocity') } })];
  if (routeId === 'ch2-1-2') return [handle('graph-cursor', 't', () => pointFromState(state, ['cursorX', 'cursorY'], { x: 82, y: 200 }), point => {
    setCh2GraphCursorPoint(state, point);
  }, { visual: { stroke: color('gold') } })];
  if (routeId === 'ch2-1-3') return [handle('natural-point', 'P', () => pointFromState(state, ['px', 'py'], { x: 346, y: 184 }), point => {
    setCh2NaturalPoint(state, point);
  }, { visual: { stroke: color('accel') } })];
  if (routeId === 'ch2-1-4') return [handle('motion-preset-point', 'P', () => ch2MotionPresetPoint(state), point => {
    setCh2MotionPresetPoint(state, point);
  }, { visual: { stroke: color('velocity') } })];
  if (routeId === 'ch2-2-2') return [handle('rotation-point', 'P', () => {
    const r = state.r || 92;
    const theta = state.theta || 0; return { x: 266 + r * Math.cos(theta), y: 178 - r * Math.sin(theta) };
  }, point => {
    state.theta = Math.atan2(178 - point.y, point.x - 266);
    state.theta0 = state.theta;
    state._t = 0;
    state.omegaCur = state.omega || 1.5;
    state.px = 266 + (state.r || 92) * Math.cos(state.theta);
    state.py = 178 - (state.r || 92) * Math.sin(state.theta);
  }, { visual: { stroke: color('velocity') } })];
  if (routeId === 'ch2-3-2') return [handle('pulley-radius', 'r1', () => ({ x: 190 + (state.r1 || 50), y: 174 }), point => {
    state.r1 = c(point.x - 190, 28, 80);
    state.omega2 = (state.omega || 1.5) * state.r1 / (state.r2 || 90);
    state.transmission = state.omega2;
  }, { visual: { stroke: color('force') } })];
  if (routeId === 'ch2-4-1') return [handle('velocity-resultant', 'v_a', () => {
    const origin = { x: 140, y: 248 };
    return vectorEndpoint(origin, state.va || { vx: 100, vy: 10 }, 1.8);
  }, point => {
    setVectorFromEndpoint(state, 'va', { x: 140, y: 248 }, point, 1.8);
    const ve = state.ve || { vx: 0, vy: 0 };
    state.vr = { vx: state.va.vx - ve.vx, vy: state.va.vy - ve.vy };
    syncVelocityCompositionMagnitudes(state);
  }, { visual: { stroke: color('velocity') } })];
  if (routeId === 'ch2-4-2') return [handle('absolute-velocity', 'v_a', () => {
    const origin = { x: 92, y: 170 };
    return vectorEndpoint(origin, state.va || { vx: 55, vy: 0 }, 1.8);
  }, point => {
    setVectorFromEndpoint(state, 'va', { x: 92, y: 170 }, point, 1.8);
    const ve = state.ve || { vx: 0, vy: 0 };
    state.vr = { vx: state.va.vx - ve.vx, vy: state.va.vy - ve.vy };
    syncVelocityCompositionMagnitudes(state);
  }, { visual: { stroke: color('velocity') } })];
  if (routeId === 'ch2-4-3') return [handle('velocity-triangle-va', 'v_a', () => {
    const origin = { x: 160, y: 258 };
    const ve = state.ve || { vx: 60, vy: 0 };
    const vr = state.vr || { vx: 0, vy: 40 };
    const va = state.va || { vx: ve.vx + vr.vx, vy: ve.vy + vr.vy };
    return vectorEndpoint(origin, va, 1.5);
  }, point => {
    const ve = state.ve || { vx: 60, vy: 0 };
    state.vr = { vx: (point.x - 160) / 1.5 - ve.vx, vy: (point.y - 258) / 1.5 - ve.vy };
    state.va = { vx: ve.vx + state.vr.vx, vy: ve.vy + state.vr.vy };
    state.primary = boundedPoint(point);
    syncVelocityCompositionMagnitudes(state);
  }, { visual: { stroke: color('velocity') } })];
  if (routeId === 'ch2-4-4') return [handle('coriolis-point', 'P', () => pointFromState(state, ['px', 'py'], { x: 360, y: 180 }), point => {
    setCh2CoriolisPoint(state, point);
  }, { visual: { stroke: color('accel') } })];
  if (routeId === 'ch2-5-1') return [handle('plane-point-b', 'B', () => pointFromState(state, ['bx', 'by'], { x: 420, y: 170 }), point => {
    state.bx = point.x; state.by = point.y; state.primary = point;
    state.vA = { vx: 46, vy: -8 };
    state.vBA = { vx: -(state.omega || 0) * (state.by - state.ay), vy: (state.omega || 0) * (state.bx - state.ax) };
    state.vB = { vx: state.vA.vx + state.vBA.vx, vy: state.vA.vy + state.vBA.vy };
    state.vAMag = Math.hypot(state.vA.vx, state.vA.vy);
    state.vBMag = Math.hypot(state.vB.vx, state.vB.vy);
  }, { visual: { stroke: color('velocity') } })];
  if (routeId === 'ch2-5-2') return [handle('instant-center-point', 'IC', () => pointFromState(state, ['icX', 'icY'], state.primary || { x: 270, y: 245 }), point => {
    const next = setPointKeys(state, point, 'icX', 'icY');
    state.P = next;
    const bx = Number.isFinite(Number(state.bx)) ? state.bx : 360;
    const by = Number.isFinite(Number(state.by)) ? state.by : 180;
    state.vB = { vx: -(state.omega || 0) * (by - state.icY), vy: (state.omega || 0) * (bx - state.icX) };
    state.vBMag = Math.hypot(state.vB.vx, state.vB.vy);
  }, { visual: { stroke: color('result') } })];
  if (routeId === 'ch2-5-3') return [handle('bar-end', 'B', () => pointFromState(state, ['ex', 'ey'], { x: 338, y: 238 }), point => {
    state.ex = c(point.x, 190, 460); state.ey = c(point.y, 90, 270);
    state.L = Math.hypot(state.ex - 118, state.ey - 238);
    state.barAngle = Math.atan2(state.ey - 238, state.ex - 118);
    syncCh2VelocityDistributionState(state);
  }, { visual: { stroke: color('velocity') } })];
  return [handle(`${routeId}-cursor`, 'điểm', () => state.primary || { x: 280, y: 180 }, point => setPrimary(state, point), { visual: { stroke: color('result') } })];
}

function ch3Handles(routeId, state) {
  if (routeId === 'ch3-6-2') return [handle('ball-2', 'bi 2', () => state.ball2 || { x: 380, y: 180 }, point => {
    const current = state.ball2 || { x: 380, y: 180, vx: -3, vy: 0 };
    const dragStart = state._ball2DragStart || current;
    const next = boundedPoint(point, 32);
    state.ball2 = Object.assign({}, current, next, {
      vx: c((next.x - dragStart.x) / 8, -12, 12),
      vy: c((next.y - dragStart.y) / 8, -12, 12)
    });
    state.collision = false;
    updateCollisionMomentum(state);
  }, {
    hitRadius: 90,
    pad: 32,
    onStart() { state._ball2DragStart = Object.assign({}, state.ball2 || { x: 380, y: 180 }); },
    onEnd() { delete state._ball2DragStart; },
    visual: { stroke: color('velocity') }
  }), handle('ball-1', 'bi 1', () => state.ball1 || { x: 150, y: 180 }, point => {
    const current = state.ball1 || { x: 150, y: 180, vx: 8, vy: 0 };
    const dragStart = state._ball1DragStart || current;
    const next = boundedPoint(point, 32);
    state.ball1 = Object.assign({}, current, next, {
      vx: c((next.x - dragStart.x) / 8, -12, 12),
      vy: c((next.y - dragStart.y) / 8, -12, 12)
    });
    state.collision = false;
    updateCollisionMomentum(state);
  }, {
    hitRadius: 90,
    pad: 32,
    onStart() { state._ball1DragStart = Object.assign({}, state.ball1 || { x: 150, y: 180 }); },
    onEnd() { delete state._ball1DragStart; },
    visual: { stroke: color('force') }
  })];
  if (routeId === 'ch3-3-1') return [handle('spring-mass', 'm', () => ({ x: 122 + (state.x || 0) * 50, y: 184 }), point => {
    state.x = c((point.x - 122) / 50, -1.2, 5.8); state.v = 0; state.spring = state.x;
  }, { visual: { stroke: color('mass') } })];
  if (routeId === 'ch3-5-1') return [handle('mass-center', 'm1', () => (state.masses && state.masses[0]) || { x: 130, y: 188 }, point => {
    state.masses = state.masses || [{ x: 130, y: 188, m: 2 }, { x: 238, y: 130, m: 1.5 }, { x: 332, y: 204, m: 1 }];
    state.masses[0] = Object.assign({}, state.masses[0], point);
  }, { visual: { stroke: color('velocity') } })];
  if (routeId === 'ch3-5-3') return [handle('orbit-radius', 'm', () => {
    const angle = (state._t || 0) * (state.omega || 2) * 2;
    return { x: 148 + Math.cos(angle) * (state.r || 60), y: 242 + Math.sin(angle) * (state.r || 60) };
  }, point => {
    state.r = c(Math.hypot(point.x - 148, point.y - 242), 30, 74);
    state.I = Math.max(0.1, Math.pow(state.r / 60, 2));
    state.L = state.I * (state.omega || 2);
  }, { visual: { stroke: color('mass') } })];
  return [handle(`${routeId}-body`, 'vật', () => ch3BodyPoint(routeId, state), point => {
    setCh3BodyPoint(routeId, state, point);
  }, { visual: { stroke: color('result') } })];
}

function routeOwnedHandles(scene, state, d, lab) {
  const routeId = scene.routeId || state.routeId || '';
  if (routeId.startsWith('ch1-')) return ch1Handles(routeId, state);
  if (routeId.startsWith('ch2-')) return ch2Handles(routeId, state);
  if (routeId.startsWith('ch3-')) return ch3Handles(routeId, state);
  return [];
}

function resolveHandles(scene, state, d, behavior, lab) {
  const raw = typeof behavior.handles === 'function' ? behavior.handles(scene, state, d, lab) : [];
  const handles = Array.isArray(raw) ? raw.filter(item => item && typeof item.get === 'function' && typeof item.set === 'function') : [];
  if (!handles.length) {
    const routeId = (scene && scene.routeId) || (state && state.routeId) || 'unknown';
    throw new Error(`[sim] route ${routeId} returned no handles — registry violation (legacy fallback removed in Phase 02)`);
  }
  return handles;
}

// Phase 08b (a11y): build keyboard-focusable overlay buttons for each handle plus an
// aria-live="polite" region. Buttons stay pointer-events:none so mouse drag passes
// through to the canvas; only on focus do they capture key events. This honors the
// pedagogy decision in plans/260518-2300-sim-correctness-realism-overhaul: ARIA in
// Vietnamese, keyboard nav, prefers-reduced-motion respected at the engine layer.
function setupA11yOverlay(lab, handles, scene) {
  if (!lab || !lab.wrap || typeof document === 'undefined') return null;
  if (typeof lab.wrap.querySelector !== 'function' || typeof lab.wrap.appendChild !== 'function') return null;
  let layer = lab.wrap.querySelector('.sim-handle-a11y-layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.className = 'sim-handle-a11y-layer';
    layer.setAttribute('aria-hidden', 'false');
    lab.wrap.appendChild(layer);
  }
  let live = lab.wrap.querySelector('.sim-aria-live');
  if (!live) {
    live = document.createElement('div');
    live.className = 'sim-aria-live sr-only';
    live.setAttribute('aria-live', 'polite');
    live.setAttribute('aria-atomic', 'true');
    lab.wrap.appendChild(live);
  }
  if (!lab.wrap.__simA11yMousedownInstalled && typeof lab.wrap.addEventListener === 'function') {
    // Capture-phase blur: when user starts a mouse drag while an overlay button
    // has focus, blur it BEFORE the canvas pointerdown so drag is not stolen.
    lab.wrap.addEventListener('mousedown', () => {
      const focused = document.activeElement;
      if (focused && focused.classList && focused.classList.contains('sim-handle-a11y')) {
        focused.blur();
      }
    }, true);
    lab.wrap.__simA11yMousedownInstalled = true;
  }
  layer.innerHTML = '';
  let liveTimer = null;
  function announce(text) {
    if (!live) return;
    if (liveTimer) clearTimeout(liveTimer);
    liveTimer = setTimeout(() => {
      live.textContent = text;
      liveTimer = null;
    }, 300);
  }
  handles.forEach(h => {
    const point = (typeof h.get === 'function' && h.get()) || { x: 0, y: 0 };
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sim-handle-a11y';
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
    btn.setAttribute('data-handle-id', h.id || '');
    const labelText = h.label || h.id || 'điểm';
    btn.setAttribute('aria-label', `Kéo ${labelText}, vị trí hiện tại x=${Math.round(point.x)} y=${Math.round(point.y)}`);
    btn.style.position = 'absolute';
    btn.style.left = `${Math.round(point.x) - 14}px`;
    btn.style.top = `${Math.round(point.y) - 14}px`;
    btn.style.width = '28px';
    btn.style.height = '28px';
    btn.addEventListener('keydown', evt => {
      const step = (evt.shiftKey ? (h.shiftStep || 24) : (h.nudgeStep || 8));
      let dx = 0, dy = 0;
      if (evt.key === 'ArrowLeft') dx = -step;
      else if (evt.key === 'ArrowRight') dx = step;
      else if (evt.key === 'ArrowUp') dy = -step;
      else if (evt.key === 'ArrowDown') dy = step;
      else if (evt.key === 'Escape') { btn.blur(); return; }
      else return;
      evt.preventDefault();
      const next = h.get() || { x: 0, y: 0 };
      const nx = next.x + dx, ny = next.y + dy;
      h.set({ x: nx, y: ny });
      btn.style.left = `${Math.round(nx) - 14}px`;
      btn.style.top = `${Math.round(ny) - 14}px`;
      btn.setAttribute('aria-label', `Kéo ${labelText}, vị trí hiện tại x=${Math.round(nx)} y=${Math.round(ny)}`);
      announce(`${labelText} tới x=${Math.round(nx)}, y=${Math.round(ny)}`);
    });
    layer.appendChild(btn);
  });
  return { layer, live };
}

// Phase 08b (a11y): expose prefers-reduced-motion so animation engine, preset
// tween, autoplay, and impulse flash can honor it. Listener stays subscribed for
// the lab lifetime — disposed by the route's mount scope.
function attachReducedMotion(lab, scope) {
  if (!lab || typeof window === 'undefined' || !window.matchMedia) {
    if (lab) lab.prefersReducedMotion = false;
    return;
  }
  if (typeof lab._reducedMotionTeardown === 'function') {
    try { lab._reducedMotionTeardown(); } catch (_) {}
    lab._reducedMotionTeardown = null;
  }
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  lab.prefersReducedMotion = !!mql.matches;
  const onChange = e => { lab.prefersReducedMotion = !!e.matches; };
  let teardown = null;
  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', onChange);
    teardown = () => mql.removeEventListener('change', onChange);
  } else if (typeof mql.addListener === 'function') {
    mql.addListener(onChange);
    teardown = () => mql.removeListener(onChange);
  }
  if (!teardown) return;
  lab._reducedMotionTeardown = teardown;
  if (scope && typeof scope.onDispose === 'function') {
    scope.onDispose(() => {
      try { teardown(); } catch (_) {}
      if (lab._reducedMotionTeardown === teardown) lab._reducedMotionTeardown = null;
    });
  }
}

function drawRouteHandles(ctx, handles, layer) {
  if (!render.drawHandle) return;
  const layerHandles = layer ? layer.handles() : [];
  handles.forEach(item => {
    const point = item.get();
    if (!point) return;
    const layerInfo = layerHandles.find(lh => lh.id === item.id) || {};
    const visual = item.visual || {};
    render.drawHandle(ctx, point.x, point.y, Object.assign({
      label: item.label || item.id,
      stroke: visual.stroke || color('result'),
      hitRadius: Math.min(item.hitRadius || 22, 25),
      isHovered: layerInfo.isHovered,
      isActive: layerInfo.isActive
    }, visual));
  });
}

function setStatus(lab, text) {
  if (lab && lab.status) lab.status.textContent = text;
}

function canvasA11yLabel(scene, routeId) {
  const title = (scene && scene.title) || routeId;
  return scene && scene.static ? `Sơ đồ tĩnh của ${title}` : `Khu vực mô phỏng động: ${title}`;
}

function invariantLabel(status) {
  if (status === 'pass') return 'Đạt';
  if (status === 'warn') return 'Cận biên';
  if (status === 'fail') return 'Lệch';
  return '';
}

function buildInvariantInput(routeId, state, d, initialState) {
  if (routeId === 'ch1-2-3') {
    const origin = { x: 200, y: 300 };
    return {
      origin,
      f1: d.f1 ? { x: d.f1.x - origin.x, y: d.f1.y - origin.y } : null,
      f2: d.f2 ? { x: d.f2.x - origin.x, y: d.f2.y - origin.y } : null,
      resultant: d.r ? { x: d.r.x - origin.x, y: d.r.y - origin.y } : null
    };
  }
  if (routeId === 'ch2-1-2') return { t: state.t, x: state.xVal, v: state.vVal, a: state.aVal, scale: 54 };
  if (routeId === 'ch2-5-2') {
    return {
      icX: state.icX,
      icY: state.icY,
      bx: state.bx,
      by: state.by,
      omega: state.omega,
      vB: state.vB || { vx: -(state.omega || 0) * ((state.by || 0) - (state.icY || 0)), vy: (state.omega || 0) * ((state.bx || 0) - (state.icX || 0)) }
    };
  }
  if (routeId === 'ch3-3-1') return {
    m: state.m,
    k: state.k,
    x: state.x,
    v: state.v || 0,
    x0: initialState && initialState.x,
    v0: initialState && (initialState.v || 0)
  };
  if (routeId === 'ch3-6-2') return {
    m1: state.m1,
    m2: state.m2,
    e: state.e,
    ball1: state.ball1,
    ball2: state.ball2,
    momentumBefore: state.momentumBefore || d.pBefore || d.momentumBefore,
    momentumAfter: state.momentumAfter || d.pAfter || d.momentumAfter,
    preRelativeNormal: state.preRelativeNormal,
    postRelativeNormal: state.postRelativeNormal,
    restitutionResidual: state.restitutionResidual
  };
  return Object.assign({}, state, d);
}

function syncPromaxState(routeId, lab, state, d, initialState) {
  if (!lab || typeof invariantEvaluators.evaluateRoute !== 'function') return null;
  const spec = invariantSpecs.get && invariantSpecs.get(routeId);
  if (!spec) {
    if (lab.setInvariantStatus) lab.setInvariantStatus('none', '');
    return null;
  }
  if (lab.setPromaxLevel) lab.setPromaxLevel('pilot');
  state.diagnostics = lab.getDiagnostics ? lab.getDiagnostics() : {};
  const outcome = invariantEvaluators.evaluateRoute(routeId, buildInvariantInput(routeId, state, d, initialState));
  const residual = Number(outcome.residual || 0).toExponential(2);
  const summary = `${invariantLabel(outcome.status)} invariant · sai số ${residual}`;
  if (lab.setInvariantStatus) lab.setInvariantStatus(outcome.status, summary);
  if (lab.setPromaxReadout && promaxReadouts.invariantFormula) {
    lab.setPromaxReadout(promaxReadouts.invariantFormula(routeId, outcome).summary);
  }
  if (lab.setPromaxGraph && promaxMiniGraph.routeSummary) {
    lab.setPromaxGraph(promaxMiniGraph.routeSummary(routeId, state, outcome), routeId);
  }
  if (lab.setChallengeFeedback && promaxChallenges.get) {
    const challenge = promaxChallenges.get(routeId);
    const feedback = promaxChallenges.evaluate ? promaxChallenges.evaluate(routeId, outcome) : null;
    lab.setChallengeFeedback(challenge ? `${challenge.prompt} ${feedback ? feedback.message : ''}` : '');
  }
  return outcome;
}

function bindInteractions(lab, scene, state, draw, handles) {
  if (!interactions.createInteractionLayer) return null;
  const layer = interactions.createInteractionLayer(lab.canvas, {
    label: canvasA11yLabel(scene, state && state.routeId),
    root: lab.wrap
  });
  const springHandles = [];
  const boundHandles = [];
  handles.forEach(item => {
    let finalHandle = item;
    if (item.spring) {
      finalHandle = interactionEnhancements.createSpringHandle(item, typeof item.spring === 'object' ? item.spring : {});
      springHandles.push(finalHandle);
    }
    const boundHandle = layer.addHandle(Object.assign({}, finalHandle, {
      onStart(point) {
        if (lab.isPlaying && typeof lab.pause === 'function') {
          lab.pause();
          lab.dragPausedAnimation = true;
          if (lab.status) lab.status.textContent = 'đang chỉnh tay';
        }
        setStatus(lab, `đang kéo ${finalHandle.label || finalHandle.id || 'điểm'}`);
        if (finalHandle.onStart) finalHandle.onStart(point);
        draw();
      },
      set(point, phase) {
        finalHandle.set(point, phase);
        lab.forceReadoutSync = true;
        syncControlDisplays(lab, scene, state);
        draw();
      },
      onEnd(event) {
        if (finalHandle.onEnd) finalHandle.onEnd(event);
        if (lab.status) {
          lab.status.textContent = lab.dragPausedAnimation
            ? 'đã tạm dừng'
            : 'tương tác trực tiếp';
        }
        lab.dragPausedAnimation = false;
        draw();
      },
      onHover(isHovered) {
        if (finalHandle.onHover) finalHandle.onHover(isHovered);
        if (!lab.isPlaying) {
          setStatus(lab, isHovered
            ? `sẵn sàng kéo ${finalHandle.label || finalHandle.id || 'điểm'}`
            : 'tương tác trực tiếp');
        }
        draw();
      }
    }));
    if (boundHandle) boundHandles.push(boundHandle);
  });
  if (boundHandles[0] && layer.focus) layer.focus(boundHandles[0]);
  lab.springHandles = springHandles;
  return layer;
}

function startBehaviorAnimation(lab, scene, state, draw, behavior, scope) {
  if (!lab.anim || typeof lab.anim.onFrame !== 'function') return;
  lab.smoothedState = Object.assign({}, state);
  const onFrame = (time, dt) => {
    let changed = false;
    if (lab.springHandles && lab.springHandles.length) {
      lab.springHandles.forEach(sh => {
        if (sh.update(dt)) changed = true;
      });
    }

    // Smooth state for readouts; reduced-motion snaps to target.
    const lerp = lab.prefersReducedMotion ? 1 : 0.15;
    Object.keys(state).forEach(key => {
      if (typeof state[key] === 'number') {
        if (lab.smoothedState[key] === undefined) lab.smoothedState[key] = state[key];
        lab.smoothedState[key] += (state[key] - lab.smoothedState[key]) * lerp;
      }
    });

    if (lab.anim && lab.anim.updateParticles) lab.anim.updateParticles(dt);

    if (typeof behavior.onTick === 'function') {
      behavior.onTick(scene, state, dt, time);
      if (lab.wrap && lab.wrap.dataset) lab.wrap.dataset.engineTime = String(time);
      changed = true;
    }
    if (changed || (lab.anim && lab.anim.hasActiveParticles && lab.anim.hasActiveParticles())) draw();
  };
  lab.anim.onFrame(onFrame);
  if (scope && typeof lab.anim.removeFrameCallback === 'function') {
    scope.onDispose(() => lab.anim.removeFrameCallback(onFrame));
  }
}

function sceneFor(routeId) {
  const scene = scenes.get && scenes.get(routeId);
  if (scene) return scene;
  console.warn('Thiếu scene mô phỏng, dùng cảnh dự phòng:', routeId);
  return legacyScene(routeId);
}

function mount(routeId) {
  return function(host) {
    const mountScope = core.createScope ? core.createScope() : null;
    let disposed = false;
    function disposeMountScope() {
      if (disposed) return;
      disposed = true;
      if (mountScope && typeof mountScope.dispose === 'function') mountScope.dispose();
    }
    function mountBody() {
    const scene = sceneFor(routeId);
    const state = makeState(scene, routeId);
    const rendererEntry = rendererFor(routeId, scene);
    const behavior = behaviorFor(routeId, scene);
    const meta = (window.SIM_ROUTE_MANIFEST && window.SIM_ROUTE_MANIFEST[routeId]) || {};
    const lab = window.SimLabUI.createLab(host, {
      routeId,
      title: `${routeId} - ${scene.title || 'Phòng mô phỏng'}`,
      width: W,
      height: H,
      formula: scene.formula,
      hint: meta.objective || scene.feedback || 'Điều chỉnh cảnh để đọc quan hệ cơ học.'
    });
    setLabMetadata(lab, routeId, rendererEntry, behavior);
    if (invariantSpecs.get && invariantSpecs.get(routeId) && lab.setPromaxLevel) lab.setPromaxLevel('pilot');

    // Get active scope BEFORE binding animation engine (avoids TDZ: scope is const declared below)
    const scope = core.getActiveScope && core.getActiveScope();

    // Capture initial state for reset
    const initialState = JSON.parse(JSON.stringify(state));

    // Bind animation engine (Phase 01)
    if (animEngine.bindToLab) {
      lab.anim = animEngine.bindToLab(lab, scope);
    } else {
      lab.anim = { start: function(){}, stop: function(){}, pause: function(){}, resume: function(){}, isRunning: function(){ return false; } };
    }
    lab.isPlaying = false;
    let playButton = null;
    function updatePlayButton() {
      if (!playButton) return;
      playButton.textContent = lab.isPlaying ? '⏸ Dừng' : '▶ Chạy';
      playButton.setAttribute('aria-pressed', lab.isPlaying ? 'true' : 'false');
    }

    // Reset action
    lab.reset = () => {
      Object.keys(state).forEach(key => {
        if (key !== 'routeId' && !Object.prototype.hasOwnProperty.call(initialState, key)) delete state[key];
      });
      Object.keys(initialState).forEach(key => {
        if (key === 'routeId') return;
        state[key] = JSON.parse(JSON.stringify(initialState[key]));
      });
      if (lab.smoothedState) lab.smoothedState = JSON.parse(JSON.stringify(state));
      if (lab.anim && typeof lab.anim.pause === 'function') lab.anim.pause();
      if (window.SimAnimationEngine && typeof window.SimAnimationEngine.clearParticles === 'function') {
        window.SimAnimationEngine.clearParticles();
      }
      lab.isPlaying = false;
      updatePlayButton();
      if (lab.status) lab.status.textContent = 'tương tác trực tiếp';
      syncControlDisplays(lab, scene, state);
      lab.forceReadoutSync = true;
      draw();
      if (scene.static && scene.tickWithoutButton && typeof behavior.onTick === 'function'
          && lab.anim && typeof lab.anim.start === 'function') {
        if (!lab.anim.isRunning || !lab.anim.isRunning()) {
          if (typeof lab.anim.resume === 'function') lab.anim.resume();
          if (!lab.anim.isRunning || !lab.anim.isRunning()) lab.anim.start();
        }
        lab.silentTicking = true;
      }
    };

    lab.pause = () => {
      if (lab.anim && typeof lab.anim.pause === 'function') lab.anim.pause();
      lab.isPlaying = false;
      updatePlayButton();
      if (lab.status) lab.status.textContent = 'đã tạm dừng';
    };

    lab.resume = () => {
      if (lab.anim && typeof lab.anim.resume === 'function') lab.anim.resume();
      if (lab.anim && typeof lab.anim.start === 'function' && !lab.anim.isRunning()) lab.anim.start();
      lab.isPlaying = true;
      updatePlayButton();
      if (lab.status) lab.status.textContent = 'đang chạy';
    };
    // Expose helpers for route renderers
    lab.statics = physicsStatics;
    lab.kinematics = physicsKinematics;
    lab.dynamics = physicsDynamics;
    lab.vis = visualHelpers;
    lab.snap = interactionEnhancements;
    let routeHandles = [];
    function draw() {
      const d = behavior.derived(scene, state);
      const invariant = syncPromaxState(routeId, lab, state, d, initialState);
      if (invariant) d.invariant = invariant;
      if (!routeHandles.length) routeHandles = resolveHandles(scene, state, d, behavior, lab);
      if (primitives.resetMarks) primitives.resetMarks(routeId);
      if (primitives.traceContext) primitives.traceContext(lab.ctx);
      if (primitives.beginOverlay) primitives.beginOverlay(lab.overlay, lab.canvas, routeId);
      try {
        rendererEntry.render(lab.ctx, scene, state, d);
      } finally {
        if (lab.anim && lab.anim.drawParticles) lab.anim.drawParticles(lab.ctx);
        drawRouteHandles(lab.ctx, routeHandles, lab.interactionLayer);
        if (primitives.endOverlay) primitives.endOverlay();
      }
      setStructuralMetadata(lab, routeHandles, routeId);
      if (lab.wrap && lab.wrap.setAttribute) {
        lab.wrap.setAttribute('data-handle-ids', routeHandles.map(item => item.id).join(','));
      }
      renderHandleLegend(lab, routeHandles);
      const displayState = syncDisplayState(lab, state);
      renderReadoutCards(lab, formatReadoutItems(scene, displayState, d, routeHandles, behavior));
      lab.info.textContent = `${behavior.formatReadout(scene, displayState, d, routeHandles)}`;
      if (lab.setHint) lab.setHint(formatHint(meta.objective || scene.feedback || scene.formula, routeHandles));
    }
    const redrawOnResize = () => draw();
    const redrawOnKatexReady = () => draw();
    window.addEventListener('resize', redrawOnResize);
    window.addEventListener('sim:katex-ready', redrawOnKatexReady);
    if (scope) scope.onDispose(() => {
      window.removeEventListener('resize', redrawOnResize);
      window.removeEventListener('sim:katex-ready', redrawOnKatexReady);
    });
    buildControls(lab, scene, state, draw, behavior);
    buildPresetGallery(lab, scene, state, draw, behavior);
    if (lab.canvas && typeof lab.canvas.setAttribute === 'function') {
      lab.canvas.setAttribute('aria-label', canvasA11yLabel(scene, routeId));
    }

    // Reset button — always available
    core.addButton(lab.controls, '↺ Đặt lại', () => { lab.reset(); });

    // Play/Pause — only for animated routes (Phase 09: scene.static suppresses
    // the Play affordance for concept-only diagrams; tickWithoutButton lets
    // the engine advance state._t silently for time-derived readouts).
    if (typeof behavior.onTick === 'function' && !scene.static) {
      playButton = core.addButton(lab.controls, '▶ Chạy', () => {
        if (lab.isPlaying) { lab.pause(); } else { lab.resume(); }
      });
      playButton.setAttribute('data-sim-play', 'true');
      updatePlayButton();
    } else if (scene.static) {
      // a11y: avoid orphan aria-pressed state on a non-existent Play button.
      if (lab.status) lab.status.textContent = 'tương tác trực tiếp';
    }

    routeHandles = resolveHandles(scene, state, behavior.derived(scene, state), behavior, lab);
    lab.interactionLayer = bindInteractions(lab, scene, state, draw, routeHandles);
    attachReducedMotion(lab, scope);
    lab.a11y = setupA11yOverlay(lab, routeHandles, scene);
    draw();
    startBehaviorAnimation(lab, scene, state, draw, behavior, scope);
    updatePlayButton();
    // Phase 09 sub-mode B — static + tickWithoutButton routes still need
    // engine ticks for time-derived readouts (e.g. ch3-1-3 inertial-frame
    // readout). The Play affordance stays hidden, but the engine runs.
    if (scene.static && scene.tickWithoutButton && typeof behavior.onTick === 'function'
        && lab.anim && typeof lab.anim.start === 'function' && !lab.anim.isRunning()) {
      lab.anim.start();
      lab.silentTicking = true;
    }
    // Boolean autoplay stays continuous.
    if (scene.autoplay && !lab.prefersReducedMotion && typeof lab.resume === 'function') {
      lab.resume();
    }
    }
    try {
      if (mountScope && core.withScope) core.withScope(mountScope, mountBody);
      else mountBody();
    } catch (err) {
      disposeMountScope();
      throw err;
    }
    return { dispose: disposeMountScope };
  };
}

function sceneSignature(routeId) {
  const scene = scenes.get && scenes.get(routeId);
  return scene && templates.signature ? templates.signature(scene) : `missing:${routeId}`;
}

window.SimProfessionalLab = {
  mount,
  sceneSignature,
  physics: { beamReaction, forceAcceleration, frictionMargin, elasticCollision1d, transmissionOmega },
  helpers: {
    statics: physicsStatics,
    kinematics: physicsKinematics,
    dynamics: physicsDynamics,
    visual: visualHelpers,
    interactions: interactionEnhancements,
    anim: animEngine
  }
};
})();
