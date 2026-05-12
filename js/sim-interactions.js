/**
 * Pointer, touch, and keyboard interaction helpers for professional labs.
 */
(function() {
'use strict';

const core = window.SimCore || {};
const math = window.SimMath || {};

function finite(value, fallback) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function clamp(value, min, max) {
  if (math.clamp) return math.clamp(value, min, max);
  return Math.max(min, Math.min(max, value));
}

function canvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / Math.max(1, rect.width);
  const scaleY = canvas.height / Math.max(1, rect.height);
  const source = event.touches && event.touches[0]
    ? event.touches[0]
    : (event.changedTouches && event.changedTouches[0] ? event.changedTouches[0] : event);
  return {
    x: (source.clientX - rect.left) * scaleX,
    y: (source.clientY - rect.top) * scaleY
  };
}

function normalizePoint(point, fallback) {
  const source = point || fallback || { x: 0, y: 0 };
  return { x: finite(source.x, 0), y: finite(source.y, 0) };
}

function applyConstraint(handle, point) {
  let next = normalizePoint(point);
  if (typeof handle.constraint === 'function') next = normalizePoint(handle.constraint(next), next);
  if (handle.bounds) {
    const b = typeof handle.bounds === 'function' ? handle.bounds() : handle.bounds;
    next.x = clamp(next.x, finite(b.minX, finite(b.x, next.x)), finite(b.maxX, finite(b.x + b.width, next.x)));
    next.y = clamp(next.y, finite(b.minY, finite(b.y, next.y)), finite(b.maxY, finite(b.y + b.height, next.y)));
  }
  if (typeof handle.snap === 'function') next = normalizePoint(handle.snap(next), next);
  return next;
}

function defaultHit(handle, x, y) {
  if (typeof handle.hitTest === 'function') return !!handle.hitTest(x, y);
  const point = typeof handle.get === 'function' ? normalizePoint(handle.get()) : normalizePoint(handle);
  const radius = finite(handle.hitRadius, 25);
  return core.dist ? core.dist(x, y, point.x, point.y) <= radius : Math.hypot(x - point.x, y - point.y) <= radius;
}

function createInteractionLayer(canvas, config) {
  const cfg = config || {};
  const scope = cfg.scope || (core.getActiveScope && core.getActiveScope());
  const handles = [];
  const root = cfg.root || (canvas && canvas.closest ? canvas.closest('.sim-lab') : null);
  let active = null;
  let focused = null;
  let hovered = null;
  let startPoint = null;

  function setActiveHandle(handle) {
    if (!root || typeof root.setAttribute !== 'function') return;
    if (handle && handle.id) root.setAttribute('data-active-handle-id', handle.id);
    else if (typeof root.removeAttribute === 'function') root.removeAttribute('data-active-handle-id');
    else root.setAttribute('data-active-handle-id', '');
  }

  function setHandle(handle, point, phase) {
    const next = applyConstraint(handle, point);
    if (typeof handle.set === 'function') handle.set(next, phase || 'drag');
    if (typeof handle.onChange === 'function') handle.onChange(next, phase || 'drag');
    return next;
  }

  const api = {
    addHandle(handle) {
      if (!handle) return null;
      handles.push(handle);
      return handle;
    },
    removeHandle(handle) {
      const index = handles.indexOf(handle);
      if (index >= 0) handles.splice(index, 1);
      if (hovered === handle) hovered = null;
      if (active === handle) {
        active = null;
        setActiveHandle(null);
      }
      if (focused === handle) focused = null;
    },
    hitTest(x, y) {
      for (let index = handles.length - 1; index >= 0; index -= 1) {
        if (defaultHit(handles[index], x, y)) return handles[index];
      }
      return null;
    },
    focus(handle) {
      focused = handle || null;
    },
    handleCount() {
      return handles.length;
    },
    handles() {
      return handles.map(handle => {
        const point = typeof handle.get === 'function' ? normalizePoint(handle.get()) : normalizePoint(handle);
        return {
          id: handle.id || '',
          label: handle.label || '',
          point,
          hitRadius: finite(handle.hitRadius, 25),
          isHovered: hovered === handle,
          isActive: active === handle
        };
      });
    },
    dispose() {
      handles.length = 0;
      active = null;
      focused = null;
      hovered = null;
      setActiveHandle(null);
    }
  };

  if (!canvas || typeof canvas.addEventListener !== 'function') return api;
  if (typeof canvas.tabIndex !== 'number' || canvas.tabIndex < 0) canvas.tabIndex = 0;
  if (typeof canvas.setAttribute === 'function') {
    canvas.setAttribute('aria-label', cfg.label || 'Canvas tương tác mô phỏng');
  }
  canvas.style.cursor = 'grab';
  canvas.__simInteractionLayer = api;

  function pointerDown(event) {
    const point = canvasPoint(canvas, event);
    const hit = api.hitTest(point.x, point.y);
    if (!hit) return;
    active = hit;
    focused = hit;
    setActiveHandle(hit);
    startPoint = typeof hit.get === 'function' ? normalizePoint(hit.get()) : point;
    canvas.style.cursor = 'grabbing';
    if (typeof canvas.focus === 'function') canvas.focus();
    if (typeof hit.onStart === 'function') hit.onStart(point);
    if (event.pointerId !== undefined && canvas.setPointerCapture) canvas.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function pointerMove(event) {
    const point = canvasPoint(canvas, event);
    if (active) {
      setHandle(active, point, 'drag');
      event.preventDefault();
      return;
    }
    const hit = api.hitTest(point.x, point.y);
    if (hit !== hovered) {
      if (hovered && typeof hovered.onHover === 'function') hovered.onHover(false);
      hovered = hit;
      if (hovered && typeof hovered.onHover === 'function') hovered.onHover(true);
    }
    canvas.style.cursor = hovered ? 'pointer' : 'grab';
  }

  function pointerEnd(event) {
    if (active && typeof active.onEnd === 'function') active.onEnd(event);
    active = null;
    startPoint = null;
    setActiveHandle(null);
    canvas.style.cursor = hovered ? 'pointer' : 'grab';
  }

  function keyDown(event) {
    if (!focused && handles.length) focused = handles[0];
    if (!focused) return;
    const arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (event.key === 'Escape' && startPoint) {
      setHandle(focused, startPoint, 'cancel');
      event.preventDefault();
      return;
    }
    if (event.key === 'Enter') {
      if (typeof focused.onEnd === 'function') focused.onEnd(event);
      event.preventDefault();
      return;
    }
    if (!arrows[event.key]) return;
    const current = typeof focused.get === 'function' ? normalizePoint(focused.get()) : { x: 0, y: 0 };
    const step = event.shiftKey ? finite(focused.shiftStep, 10) : finite(focused.nudgeStep, 2);
    setHandle(focused, { x: current.x + arrows[event.key][0] * step, y: current.y + arrows[event.key][1] * step }, 'keyboard');
    event.preventDefault();
  }

  const events = [
    ['pointerdown', pointerDown],
    ['pointermove', pointerMove],
    ['pointerup', pointerEnd],
    ['pointercancel', pointerEnd],
    ['lostpointercapture', pointerEnd],
    ['mousedown', pointerDown],
    ['mousemove', pointerMove],
    ['mouseup', pointerEnd],
    ['mouseleave', pointerEnd],
    ['touchstart', pointerDown, { passive: false }],
    ['touchmove', pointerMove, { passive: false }],
    ['touchend', pointerEnd, { passive: false }],
    ['touchcancel', pointerEnd, { passive: false }],
    ['keydown', keyDown]
  ];
  events.forEach(([type, handler, options]) => canvas.addEventListener(type, handler, options));
  if (scope && scope.onDispose) {
    scope.onDispose(() => {
      events.forEach(([type, handler, options]) => canvas.removeEventListener(type, handler, options));
      api.dispose();
    });
  }
  return api;
}

function addVectorHandle(layer, config) {
  const cfg = config || {};
  return layer && layer.addHandle ? layer.addHandle({
    id: cfg.id || 'vector-tip',
    hitRadius: finite(cfg.hitRadius, 28),
    get() {
      if (typeof cfg.getTip === 'function') return cfg.getTip();
      return cfg.tip || { x: 0, y: 0 };
    },
    set(point, phase) {
      if (typeof cfg.setTip === 'function') cfg.setTip(point, phase);
    },
    constraint: cfg.constraint,
    snap: cfg.snap,
    onStart: cfg.onStart,
    onEnd: cfg.onEnd,
    nudgeStep: cfg.nudgeStep,
    shiftStep: cfg.shiftStep
  }) : null;
}

function addBodyDrag(layer, config) {
  const cfg = config || {};
  return layer && layer.addHandle ? layer.addHandle({
    id: cfg.id || 'body',
    hitRadius: finite(cfg.hitRadius, 32),
    get: cfg.get,
    set(point, phase) {
      if (typeof cfg.setPosition === 'function') cfg.setPosition(point, phase);
    },
    hitTest: cfg.hitTest,
    bounds: cfg.bounds,
    constraint: cfg.constraint,
    snap: cfg.snap,
    nudgeStep: cfg.nudgeStep,
    shiftStep: cfg.shiftStep
  }) : null;
}

function addGraphCursor(layer, config) {
  const cfg = config || {};
  const domain = cfg.domain || {};
  const x0 = finite(domain.x0, 0);
  const x1 = finite(domain.x1, 1);
  const min = finite(domain.min, 0);
  const max = finite(domain.max, 1);
  function valueToPoint() {
    const value = typeof cfg.getValue === 'function' ? finite(cfg.getValue(), min) : min;
    const ratio = (value - min) / Math.max(1e-9, max - min);
    return { x: x0 + ratio * (x1 - x0), y: finite(domain.y, finite(domain.y0, 0)) };
  }
  return addBodyDrag(layer, {
    id: cfg.id || 'graph-cursor',
    hitRadius: finite(cfg.hitRadius, 28),
    get: valueToPoint,
    setPosition(point, phase) {
      const ratio = clamp((point.x - x0) / Math.max(1e-9, x1 - x0), 0, 1);
      const value = min + ratio * (max - min);
      if (typeof cfg.onChange === 'function') cfg.onChange(value, phase);
    },
    constraint(point) {
      return { x: clamp(point.x, Math.min(x0, x1), Math.max(x0, x1)), y: finite(domain.y, point.y) };
    }
  });
}

function syncControl(input, setter, formatter) {
  if (!input || typeof input.addEventListener !== 'function') return null;
  const scope = core.getActiveScope && core.getActiveScope();
  function listener() {
    const value = parseFloat(input.value);
    setter(Number.isFinite(value) ? value : 0);
    if (formatter) input.setAttribute('aria-valuetext', formatter(value));
  }
  input.addEventListener('input', listener);
  if (scope && scope.onDispose) scope.onDispose(() => input.removeEventListener('input', listener));
  return {
    setValue(value, trigger) {
      input.value = value;
      if (formatter) input.setAttribute('aria-valuetext', formatter(value));
      if (trigger) listener();
    }
  };
}

window.SimInteractions = {
  createInteractionLayer,
  addHandle(layer, handle) {
    return layer && layer.addHandle ? layer.addHandle(handle) : null;
  },
  addVectorHandle,
  addBodyDrag,
  addGraphCursor,
  syncControl
};

})();
