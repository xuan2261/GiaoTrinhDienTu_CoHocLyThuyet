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
const DEFAULT_W = 760, DEFAULT_H = 440;
const W = templates.W || DEFAULT_W, H = templates.H || DEFAULT_H;
const COLORS = core.COLORS || {};
const fallback = {
  force: '#dc3545', velocity: '#0d6efd', accel: '#198754', result: '#fd7e14',
  mass: '#6f42c1', beam: '#495057', grid: '#dee2e6', text: '#212529', gold: '#b8860b'
};
const color = key => COLORS[key] || fallback[key] || '#495057';
const c = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));

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
    verify: state.status || 'OK',
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
    items.push({
      label,
      value: formatControlValue(control, state),
      unit: control.unit || '',
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
    if (display) display.textContent = `${formatControlValue(control, state)}${control.unit || ''}`;
  });
}

function formatReadoutItems(scene, state, d, handles, behavior) {
  const source = Object.assign({}, state, d, { mode: state.mode });
  const items = [];
  (scene.readouts || []).forEach(item => {
    let value = source[item.key];
    if (Number.isFinite(Number(value))) {
      value = Number(value) * (Number(item.scale) || 1);
      value = Number(value.toFixed(Number.isFinite(Number(item.digits)) ? Number(item.digits) : 1));
    }
    items.push({ label: item.label, value: displayValue(value), unit: item.unit || '', key: item.key || '', kind: item.kind || readoutKind(item) });
  });
  if (scene.appendGenericReadouts !== false && !hasReadout(items, 'mode', 'chế độ')) {
    items.push({ label: 'chế độ', value: String(state.mode || '—'), unit: '', key: 'mode', kind: 'mode' });
  }
  if (scene.appendGenericReadouts !== false && Number.isFinite(Number(d.alpha)) && !hasReadout(items, 'alpha', 'α')) {
    items.push({ label: 'α', value: Number(d.alpha).toFixed(0), unit: '°', key: 'alpha', kind: 'angle' });
  }
  appendControlReadouts(items, scene, source);
  appendTimeReadout(items, scene, source, behavior);
  return items;
}

function formatReadout(scene, state, d, handles) {
  return formatReadoutItems(scene, state, d, handles).map(item =>
    `${item.label}: ${item.value}${item.unit}`
  ).join(' | ');
}

function updateStateFromSlider(scene, state, key, value) {
  const routeId = String(scene.routeId || state.routeId || '');
  if (key === 'force') setForceMagnitude(state, value, scene.angle);
  else if (routeId.startsWith('ch2-') || routeId.startsWith('ch3-')) state[key] = value;
  else if (key === 'alpha') {
    state.alpha = c(value, 0, 55);
    state.primary.y = c(H - state.alpha * 5, 70, H - 65);
  }
  else if (key === 't') state.primary.x = c((Number(scene.tOrigin) || 80) + value * (Number(scene.tScale) || 75), 55, W - 55);
  else state[key] = value;
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

function setStructuralMetadata(lab) {
  const target = lab && lab.wrap;
  if (!target || typeof target.setAttribute !== 'function') return;
  const marks = primitives.marks ? primitives.marks() : [];
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
    val.textContent = `${item.value}${item.unit}`;
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
          state[key] = label;
          if (state.trail && Array.isArray(state.trail)) state.trail = [];
          syncButtons();
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

function ch2MotionPresetPoint(state) {
  const t = state.t || 0;
  const mode = state.mode || 'Thẳng';
  if (mode === 'Tròn') return { x: 286 + 42 * Math.cos(t), y: 168 - 42 * Math.sin(t) };
  if (mode === 'Parabol') {
    const prog = (t / (Math.PI * 2)) * 80;
    return { x: 394 + prog, y: 218 - prog * 1.5 + (prog * prog) / 60 };
  }
  const prog = (t / (Math.PI * 2)) * 92;
  return { x: 84 + prog, y: 210 - prog * (80 / 92) };
}

function setCh2MotionPresetPoint(state, point) {
  const mode = state.mode || 'Thẳng';
  if (mode === 'Tròn') state.t = Math.atan2(168 - point.y, point.x - 286);
  else if (mode === 'Parabol') state.t = c((point.x - 394) / 80, 0, 1) * Math.PI * 2;
  else state.t = c((point.x - 84) / 92, 0, 1) * Math.PI * 2;
  const next = ch2MotionPresetPoint(state);
  state.px = next.x; state.py = next.y; state.primary = next;
}

function ch2SolverPoint(state) {
  const step = c(Math.floor(state.step || 0), 0, 2);
  const t = state.t || 0;
  const x = 72 + step * 158 + (t / (Math.PI * 2)) * 60;
  const phase = (x - (72 + step * 158)) / (12 + step * 3) + t * 0.5;
  return { x, y: 198 - 20 * Math.sin(phase) - step * 5 };
}

function setCh2SolverPoint(state, point) {
  state.step = c(Math.round((point.x - 72) / 158), 0, 2);
  const baseX = 72 + state.step * 158;
  state.t = c((point.x - baseX) / 60, 0, 1) * Math.PI * 2;
  state.xVal = 5 + 3 * Math.sin(state.t);
  state.vVal = 3 * Math.cos(state.t);
  state.aVal = -3 * Math.sin(state.t);
  state.primary = boundedPoint(point);
}

function setCh2VerifierPoint(state, point) {
  state.t = c((point.y - 142) / 88, 0, 1) * Math.PI * 2;
  state.xVal = (state.x0 || 5) + (state.v0 || 0) * state.t + 0.5 * (state.a0 || 0) * state.t * state.t;
  state.vVal = (state.v0 || 0) + (state.a0 || 0) * state.t;
  state.errorV = Math.abs(state.vVal - 3 * Math.cos(state.t));
  state.status = state.errorV < 0.5 ? 'OK' : 'CHECK';
  state.primary = boundedPoint(point);
}

function setCh2GraphCursorPoint(state, point) {
  state.t = c((point.x - 82) / 170, 0, 1) * Math.PI * 2;
  state.cursorX = 82 + (state.t / (Math.PI * 2)) * 170;
  state.cursorY = 200 - 52 * Math.sin(state.t);
  state.xVal = 50 * Math.sin(state.t) + 10;
  state.vVal = 50 * Math.PI * Math.cos(state.t);
  state.aVal = -50 * Math.PI * Math.PI * Math.sin(state.t);
  state.cursorLocked = true;
}

function syncCh2TrajectoryState(state) {
  const omega = state.omega || 1.5;
  const mode = state.mode || 'Elip';
  if (mode === 'Tròn') {
    const r = 100;
    state.currentX = 280 + r * Math.cos(state.t);
    state.currentY = 170 - r * Math.sin(state.t);
    state.vx = -r * omega * Math.sin(state.t);
    state.vy = r * omega * Math.cos(state.t);
  } else if (mode === 'Parabol') {
    const u = c(state.t / (Math.PI * 2), 0, 1);
    state.currentX = 90 + 360 * u;
    state.currentY = 278 - 310 * u + 260 * u * u;
    state.vx = 360 * omega / (Math.PI * 2);
    state.vy = (310 - 520 * u) * omega / (Math.PI * 2);
  } else {
    state.currentX = 280 + 150 * Math.cos(state.t);
    state.currentY = 170 - 100 * Math.sin(state.t);
    state.vx = -150 * omega * Math.sin(state.t);
    state.vy = 100 * omega * Math.cos(state.t);
  }
  state.speed = Math.hypot(state.vx || 0, state.vy || 0);
  state.primary = { x: state.currentX, y: state.currentY };
}

function setCh2TrajectoryPoint(state, point) {
  const mode = state.mode || 'Elip';
  if (mode === 'Parabol') {
    state.t = c((point.x - 90) / 360, 0, 1) * Math.PI * 2;
  } else {
    const rx = mode === 'Tròn' ? 100 : 150;
    const ry = mode === 'Tròn' ? 100 : 100;
    const t = Math.atan2((170 - point.y) / ry, (point.x - 280) / rx);
    state.t = t < 0 ? t + Math.PI * 2 : t;
  }
  syncCh2TrajectoryState(state);
}

function setCh2NaturalPoint(state, point) {
  const omega = state.omega || 1.0;
  state.t = Math.atan2(point.y - 184, point.x - 250);
  state.px = 250 + 96 * Math.cos(state.t);
  state.py = 184 + 96 * Math.sin(state.t);
  state.vx = -96 * omega * Math.sin(state.t);
  state.vy = 96 * omega * Math.cos(state.t);
  const v = Math.hypot(state.vx, state.vy);
  state.an = v * v / 96;
  state.at = 0;
  state.primary = { x: state.px, y: state.py };
}

function setCh2CoriolisPoint(state, point) {
  setPointKeys(state, point, 'px', 'py');
  state.vrx = c((point.x - 280) / 2.5, -60, 60);
  state.vry = c((point.y - 180) / 2.5, -60, 60);
  state.vr = { vx: state.vrx, vy: state.vry };
  state.coriolis = 2 * (state.omega || 1) * Math.hypot(state.vrx, state.vry);
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
  const p1 = m1 * Math.hypot(b1.vx || 0, b1.vy || 0);
  const p2 = m2 * Math.hypot(b2.vx || 0, b2.vy || 0);
  state.pBefore = p1 + p2;
  state.pAfter = state.collision ? state.pAfter || state.pBefore : state.pBefore;
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
  if (routeId === 'ch3-7-1') return { x: 110 + c(Math.floor(state.problemType || 0), 0, 3) * 122, y: 158 };
  if (routeId === 'ch3-7-2') {
    const scale = Number.isFinite(Number(state.residualScale)) ? Number(state.residualScale) : 1;
    return { x: 250 + c(scale, 0, 2) * 80, y: 108 };
  }
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
  } else if (routeId === 'ch3-7-1') {
    state.problemType = c(Math.round((point.x - 110) / 122), 0, 3);
  } else if (routeId === 'ch3-7-2') {
    state.residualScale = c((point.x - 250) / 80, 0, 2);
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
    const theta = state.theta || 0; return { x: 266 + 86 * Math.cos(theta), y: 170 - 86 * Math.sin(theta) };
  }, point => { state.theta = Math.atan2(170 - point.y, point.x - 266); }, { visual: { stroke: color('velocity') } })];
  if (routeId === 'ch2-3-2') return [handle('pulley-radius', 'r1', () => ({ x: 190 + (state.r1 || 50), y: 174 }), point => {
    state.r1 = c(point.x - 190, 28, 82);
    state.omega2 = (state.omega || 1.5) * state.r1 / (state.r2 || 90);
  }, { visual: { stroke: color('force') } })];
  if (routeId === 'ch2-4-1') return [handle('velocity-resultant', 'v_a', () => {
    const origin = { x: 140, y: 248 };
    return vectorEndpoint(origin, state.va || { vx: 100, vy: 10 }, 1.8);
  }, point => {
    setVectorFromEndpoint(state, 'va', { x: 140, y: 248 }, point, 1.8);
    const ve = state.ve || { vx: 0, vy: 0 };
    state.vr = { vx: state.va.vx - ve.vx, vy: state.va.vy - ve.vy };
  }, { visual: { stroke: color('velocity') } })];
  if (routeId === 'ch2-4-2') return [handle('absolute-velocity', 'v_a', () => {
    const origin = { x: 92, y: 170 };
    return vectorEndpoint(origin, state.va || { vx: 55, vy: 0 }, 1.8);
  }, point => {
    setVectorFromEndpoint(state, 'va', { x: 92, y: 170 }, point, 1.8);
    const ve = state.ve || { vx: 0, vy: 0 };
    state.vr = { vx: state.va.vx - ve.vx, vy: state.va.vy - ve.vy };
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
  }, { visual: { stroke: color('velocity') } })];
  if (routeId === 'ch2-4-4') return [handle('coriolis-point', 'P', () => pointFromState(state, ['px', 'py'], { x: 360, y: 180 }), point => {
    setCh2CoriolisPoint(state, point);
  }, { visual: { stroke: color('accel') } })];
  if (routeId === 'ch2-5-1') return [handle('plane-point-b', 'B', () => pointFromState(state, ['bx', 'by'], { x: 420, y: 170 }), point => {
    state.bx = point.x; state.by = point.y; state.primary = point;
  }, { visual: { stroke: color('velocity') } })];
  if (routeId === 'ch2-5-2') return [handle('instant-center-point', 'IC', () => pointFromState(state, ['icX', 'icY'], state.primary || { x: 270, y: 245 }), point => {
    const next = setPointKeys(state, point, 'icX', 'icY');
    state.P = next;
  }, { visual: { stroke: color('result') } })];
  if (routeId === 'ch2-5-3') return [handle('bar-end', 'B', () => pointFromState(state, ['ex', 'ey'], { x: 338, y: 238 }), point => {
    state.ex = c(point.x, 190, 460); state.ey = c(point.y, 90, 270);
    state.ax = 118; state.ay = 238; state.bx = state.ex; state.by = state.ey;
    state.primary = { x: state.ex, y: state.ey };
  }, { visual: { stroke: color('velocity') } })];
  if (routeId === 'ch2-7-1') return [handle('solver-time-point', 't', () => ch2SolverPoint(state), point => {
    setCh2SolverPoint(state, point);
  }, { visual: { stroke: color('gold') } })];
  if (routeId === 'ch2-7-2') return [handle('verifier-time-row', 't', () => {
    const index = c(Math.round(((state.t || 0) / (Math.PI * 2)) * 4), 0, 4);
    return { x: 102, y: 142 + index * 22 };
  }, point => setCh2VerifierPoint(state, point), { visual: { stroke: color('gold') } })];
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
  return [handle(`${routeId}-body`, routeId.startsWith('ch3-7-') ? 'mốc' : 'vật', () => ch3BodyPoint(routeId, state), point => {
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

function legacyHandles(scene, state) {
  return [
    handle('legacy-primary', 'kéo', () => state.primary, point => setPrimary(state, point), { hitRadius: 52, visual: { stroke: color('result') } }),
    handle('legacy-vector', 'v/F', () => state.vector, point => { state.vector = boundedPoint(point); }, { hitRadius: 30, visual: { stroke: color('force') } })
  ];
}

function resolveHandles(scene, state, d, behavior, lab) {
  const raw = typeof behavior.handles === 'function' ? behavior.handles(scene, state, d, lab) : [];
  const handles = Array.isArray(raw) ? raw.filter(item => item && typeof item.get === 'function' && typeof item.set === 'function') : [];
  return handles.length ? handles : legacyHandles(scene, state);
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

function bindInteractions(lab, scene, state, draw, handles) {
  if (!interactions.createInteractionLayer) return null;
  const layer = interactions.createInteractionLayer(lab.canvas, { label: `${scene.title} canvas`, root: lab.wrap });
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
        if (window.SimVisualHelpers && window.SimVisualHelpers.emitEnergyBurst) {
          window.SimVisualHelpers.emitEnergyBurst(point.x, point.y, color('result'));
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

    // Smooth state for readouts
    const lerp = 0.15;
    Object.keys(state).forEach(key => {
      if (typeof state[key] === 'number') {
        if (lab.smoothedState[key] === undefined) lab.smoothedState[key] = state[key];
        lab.smoothedState[key] += (state[key] - lab.smoothedState[key]) * lerp;
      }
    });

    if (lab.anim && lab.anim.updateParticles) lab.anim.updateParticles(dt);

    if (typeof behavior.onTick === 'function') {
      behavior.onTick(scene, state, dt, time);
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
      setStructuralMetadata(lab);
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

    // Reset button — always available
    core.addButton(lab.controls, '↺ Đặt lại', () => { lab.reset(); });

    // Play/Pause — only for animated routes
    if (typeof behavior.onTick === 'function') {
      playButton = core.addButton(lab.controls, '▶ Chạy', () => {
        if (lab.isPlaying) { lab.pause(); } else { lab.resume(); }
      });
      updatePlayButton();
    }

    routeHandles = resolveHandles(scene, state, behavior.derived(scene, state), behavior, lab);
    lab.interactionLayer = bindInteractions(lab, scene, state, draw, routeHandles);
    draw();
    startBehaviorAnimation(lab, scene, state, draw, behavior, scope);
    updatePlayButton();
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
