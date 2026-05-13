/**
 * Shared runtime helpers for interactive mechanics simulations.
 */
(function() {
'use strict';

const SIM_BG = '#f8f9fa';
const COLORS = {
  force: '#dc3545', velocity: '#0d6efd', accel: '#198754',
  result: '#fd7e14', mass: '#6f42c1', normal: '#0dcaf0',
  beam: '#495057', support: '#6c757d', grid: '#dee2e6',
  text: '#212529', label: '#495057', gold: '#b8860b'
};

let activeScope = null;

function createScope() {
  const cleanups = [];
  const frameIds = new Set();
  const mounts = [];
  const nativeRequestFrame = window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : (typeof setTimeout === 'function'
      ? function(callback) { return setTimeout(function() { callback(Date.now()); }, 16); }
      : function(callback) { callback(0); return 0; });
  const nativeCancelFrame = window.cancelAnimationFrame
    ? window.cancelAnimationFrame.bind(window)
    : (typeof clearTimeout === 'function' ? clearTimeout : function() {});
  let disposed = false;
  const api = {
    get disposed() { return disposed; },
    onDispose(fn) {
      if (disposed) { fn(); return; }
      cleanups.push(fn);
    },
    trackMount(element) {
      if (element) mounts.push(element);
    },
    requestFrame(callback) {
      if (disposed) return 0;
      const id = nativeRequestFrame(time => {
        frameIds.delete(id);
        if (!disposed) runWithScopedFrames(api, () => callback(time));
      });
      frameIds.add(id);
      return id;
    },
    cancelFrame(id) {
      if (!id) return;
      frameIds.delete(id);
      nativeCancelFrame(id);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      frameIds.forEach(id => nativeCancelFrame(id));
      frameIds.clear();
      while (cleanups.length) {
        try { cleanups.pop()(); }
        catch (err) { console.warn('Simulation cleanup failed:', err); }
      }
      while (mounts.length) {
        const element = mounts.pop();
        if (element && element.parentNode) element.parentNode.removeChild(element);
      }
    }
  };
  return api;
}

function runWithScopedFrames(scope, fn) {
  const root = typeof globalThis !== 'undefined' ? globalThis : window;
  const previousWindowRequest = window.requestAnimationFrame;
  const previousWindowCancel = window.cancelAnimationFrame;
  const previousRootRequest = root && root !== window ? root.requestAnimationFrame : previousWindowRequest;
  const previousRootCancel = root && root !== window ? root.cancelAnimationFrame : previousWindowCancel;
  if (scope && scope.requestFrame) {
    window.requestAnimationFrame = callback => scope.requestFrame(callback);
    window.cancelAnimationFrame = id => scope.cancelFrame(id);
    if (root && root !== window) {
      root.requestAnimationFrame = window.requestAnimationFrame;
      root.cancelAnimationFrame = window.cancelAnimationFrame;
    }
  }
  try {
    return fn();
  } finally {
    window.requestAnimationFrame = previousWindowRequest;
    window.cancelAnimationFrame = previousWindowCancel;
    if (root && root !== window) {
      root.requestAnimationFrame = previousRootRequest;
      root.cancelAnimationFrame = previousRootCancel;
    }
  }
}

function withScope(scope, fn) {
  const previous = activeScope;
  activeScope = scope;
  try { return runWithScopedFrames(scope, fn); }
  finally { activeScope = previous; }
}

function getActiveScope() { return activeScope; }

function requestSimFrame(scope, callback) {
  return scope && scope.requestFrame ? scope.requestFrame(callback) : window.requestAnimationFrame(callback);
}

function cancelSimFrame(scope, frameId) {
  if (scope && scope.cancelFrame) scope.cancelFrame(frameId);
  else if (frameId) window.cancelAnimationFrame(frameId);
}

function createSimContainer(hostEl, title, width, height) {
  const logicalWidth = Number(width) || 760;
  const logicalHeight = Number(height) || 440;
  const scope = getActiveScope();
  const wrap = document.createElement('div');
  wrap.className = 'sim-container';
  const header = document.createElement('div');
  header.className = 'sim-header';
  const icon = document.createElement('span');
  icon.className = 'sim-icon';
  icon.textContent = 'Mô phỏng';
  const titleEl = document.createElement('span');
  titleEl.className = 'sim-title';
  titleEl.textContent = title;
  header.appendChild(icon);
  header.appendChild(titleEl);
  const canvas = document.createElement('canvas');
  canvas.className = 'sim-canvas';
  canvas.width = logicalWidth;
  canvas.height = logicalHeight;
  const controls = document.createElement('div');
  controls.className = 'sim-controls';
  const info = document.createElement('div');
  info.className = 'sim-info';
  wrap.appendChild(header);
  wrap.appendChild(canvas);
  wrap.appendChild(controls);
  wrap.appendChild(info);
  hostEl.appendChild(wrap);
  if (scope) scope.trackMount(wrap);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  // Make responsive
  const resizeCanvas = () => {
    const parentW = Math.max(0, wrap.clientWidth - 32);
    if (parentW < logicalWidth) {
      canvas.style.width = parentW + 'px';
      canvas.style.height = (parentW * logicalHeight / logicalWidth) + 'px';
    } else {
      canvas.style.width = '';
      canvas.style.height = '';
    }
  };
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  if (scope) scope.onDispose(() => window.removeEventListener('resize', resizeCanvas));
  return { wrap, canvas, ctx, controls, info };
}

function addSlider(container, label, min, max, value, step, unit, onChange) {
  const div = document.createElement('div');
  div.className = 'sim-slider-group';
  const labelEl = document.createElement('label');
  const valueEl = document.createElement('strong');
  const input = document.createElement('input');
  const suffix = unit || '';
  valueEl.className = 'sv';
  valueEl.textContent = value + suffix;
  labelEl.appendChild(document.createTextNode(label + ': '));
  labelEl.appendChild(valueEl);
  input.type = 'range';
  input.min = min;
  input.max = max;
  input.step = step;
  input.value = value;
  div.appendChild(labelEl);
  div.appendChild(input);
  container.appendChild(div);
  input.addEventListener('input', () => {
    valueEl.textContent = input.value + suffix;
    onChange(parseFloat(input.value));
  });
  input.setSimValue = (next, trigger) => {
    input.value = next;
    valueEl.textContent = input.value + suffix;
    if (trigger) onChange(parseFloat(input.value));
  };
  return input;
}

function addButton(container, text, onClick) {
  const btn = document.createElement('button');
  btn.className = 'sim-btn';
  btn.textContent = text;
  btn.addEventListener('click', onClick);
  container.appendChild(btn);
  return btn;
}

function drawArrow(ctx, x1, y1, x2, y2, color, lineWidth, label) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 2) return;
  const headLen = Math.min(12, len * 0.3);
  const angle = Math.atan2(dy, dx);
  const arrowHeadAngle = Math.PI / 7;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth || 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - arrowHeadAngle), y2 - headLen * Math.sin(angle - arrowHeadAngle));
  ctx.lineTo(x2 - headLen * Math.cos(angle + arrowHeadAngle), y2 - headLen * Math.sin(angle + arrowHeadAngle));
  ctx.closePath();
  ctx.fill();
  if (label) {
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillStyle = color;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    ctx.fillText(label, mx + 5, my - 5);
  }
}

function clearCanvas(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
}

function drawAxes(ctx, x, y, w, h, xLabel, yLabel) {
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
  ctx.beginPath();
  ctx.moveTo(x, y + h / 2);
  ctx.lineTo(x + w, y + h / 2);
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.stroke();
  ctx.fillStyle = COLORS.label;
  ctx.font = '11px Inter, sans-serif';
  if (xLabel) ctx.fillText(xLabel, x + w - 22, y + h + 14);
  if (yLabel) ctx.fillText(yLabel, x + 4, y + 12);
}

function drawPolyline(ctx, points, color, width) {
  if (!points || points.length < 2) return;
  ctx.strokeStyle = color || COLORS.velocity;
  ctx.lineWidth = width || 2;
  ctx.beginPath();
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();
}

function integrateEuler(state, dt, accelerationFn) {
  const a = accelerationFn(state);
  return {
    x: state.x + state.v * dt,
    v: state.v + a * dt,
    a
  };
}

// ===== DRAG HELPER (mouse + touch) =====
function addCanvasDrag(canvas, hitTest, onDrag, onEnd) {
  const scope = getActiveScope();
  let dragging = null;
  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    const scaleX = canvas.width / r.width;
    const scaleY = canvas.height / r.height;
    if (e.touches) { return { x: (e.touches[0].clientX - r.left) * scaleX, y: (e.touches[0].clientY - r.top) * scaleY }; }
    return { x: (e.clientX - r.left) * scaleX, y: (e.clientY - r.top) * scaleY };
  }
  canvas.style.cursor = 'grab';
  const handlers = [
    ['mousedown', e => { const p = getPos(e); dragging = hitTest(p.x, p.y); if (dragging) { canvas.style.cursor = 'grabbing'; e.preventDefault(); } }],
    ['mousemove', e => { if (dragging) { const p = getPos(e); onDrag(dragging, p.x, p.y); e.preventDefault(); } else { const p = getPos(e); canvas.style.cursor = hitTest(p.x, p.y) ? 'grab' : 'default'; } }],
    ['mouseup', () => { if (dragging && onEnd) onEnd(dragging); dragging = null; canvas.style.cursor = 'grab'; }],
    ['mouseleave', () => { if (dragging && onEnd) onEnd(dragging); dragging = null; }],
    ['touchstart', e => { const p = getPos(e); dragging = hitTest(p.x, p.y); if (dragging) e.preventDefault(); }, { passive: false }],
    ['touchmove', e => { if (dragging) { const p = getPos(e); onDrag(dragging, p.x, p.y); e.preventDefault(); } }, { passive: false }],
    ['touchend', () => { if (dragging && onEnd) onEnd(dragging); dragging = null; }]
  ];
  handlers.forEach(([type, handler, options]) => canvas.addEventListener(type, handler, options));
  if (scope) scope.onDispose(() => {
    handlers.forEach(([type, handler, options]) => canvas.removeEventListener(type, handler, options));
  });
}

function dist(x1, y1, x2, y2) { return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2)); }

function createRegistry() {
  const routes = {};
  return {
    register(routeId, simFn) {
      if (!routeId || typeof simFn !== 'function') {
        console.warn('Invalid simulation registration:', routeId);
        return;
      }
      if (routes[routeId]) console.warn('Simulation route overwritten:', routeId);
      routes[routeId] = simFn;
    },
    registerMany(entries) {
      Object.keys(entries || {}).forEach(routeId => this.register(routeId, entries[routeId]));
    },
    get(routeId) { return routes[routeId] || null; },
    routes() { return Object.keys(routes).sort(); },
    entries() { return Object.assign({}, routes); }
  };
}

window.SimRegistry = window.SimRegistry || createRegistry();

window.SimCore = {
  SIM_BG,
  COLORS,
  createScope,
  withScope,
  getActiveScope,
  requestSimFrame,
  cancelSimFrame,
  createSimContainer,
  addSlider,
  addButton,
  drawArrow,
  clearCanvas,
  drawAxes,
  drawPolyline,
  integrateEuler,
  addCanvasDrag,
  dist,
  createRegistry
};

})();
