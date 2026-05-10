/**
 * Interaction enhancements — snap guides, ghost states, visual feedback.
 * Phase 1 infrastructure for 58-route simulation rebuild.
 */
(function() {
'use strict';

// ─── Snap Guides ────────────────────────────────────────────────────────────────

/**
 * Create snap guide system.
 * @param {Array<{x: number, y: number, label: string}>} snapPoints
 * @param {number} tolerance - Snap radius px (default 12)
 * @returns {Object}
 */
function createSnapGuides(snapPoints, tolerance) {
  tolerance = tolerance || 12;
  const points = snapPoints || [];
  let activeSnap = null;
  let enabled = true;

  function getSnapTarget(x, y) {
    if (!enabled) return null;
    let best = null, bestDist = tolerance;
    for (const p of points) {
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bestDist) { bestDist = d; best = p; }
    }
    return best;
  }

  function drawGuides(ctx, ax, ay) {
    if (!activeSnap || !ctx) return;
    ctx.save();
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    const alpha = 0.4 + 0.2 * Math.sin(Date.now() / 150);
    ctx.globalAlpha = alpha;

    if (Math.abs(ax - activeSnap.x) < 2) {
      ctx.beginPath();
      ctx.moveTo(activeSnap.x, 0);
      ctx.lineTo(activeSnap.x, ctx.canvas.height);
      ctx.stroke();
    }
    if (Math.abs(ay - activeSnap.y) < 2) {
      ctx.beginPath();
      ctx.moveTo(0, activeSnap.y);
      ctx.lineTo(ctx.canvas.width, activeSnap.y);
      ctx.stroke();
    }
    
    // Draw snap point marker
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(activeSnap.x, activeSnap.y, 4 + 4 * (1 - alpha), 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
  }

  function setActive(point) { activeSnap = point; }
  function clearActive() { activeSnap = null; }
  function enable() { enabled = true; }
  function disable() { enabled = false; clearActive(); }

  return {
    getSnapTarget,
    drawGuides,
    setActive,
    clearActive,
    enable,
    disable,
    get activeSnap() { return activeSnap; }
  };
}

// ─── Ghost State ───────────────────────────────────────────────────────────────

/**
 * Ghost state — semi-transparent preview during drag.
 */
function createGhostState() {
  let opacity = 0.35;
  let visible = false;
  let ghostSnapshot = null;

  function setOpacity(a) { opacity = Math.max(0, Math.min(0.5, a)); }

  function capture(state) {
    ghostSnapshot = state ? JSON.parse(JSON.stringify(state)) : null;
    visible = !!ghostSnapshot;
  }

  function drawGhost(ctx, drawFn) {
    if (!visible || !ghostSnapshot || !ctx) return;
    ctx.save();
    ctx.globalAlpha = opacity;
    try { drawFn(ghostSnapshot); } catch (e) { /* ignore */ }
    ctx.restore();
  }

  function hide() {
    visible = false;
    ghostSnapshot = null;
  }

  function show() {
    visible = !!ghostSnapshot;
  }

  return { setOpacity, capture, drawGhost, hide, show, get visible() { return visible; } };
}

// ─── Visual Feedback ────────────────────────────────────────────────────────────

/**
 * Create highlight state for handles.
 * @param {string} normalColor - Default color
 * @param {string} hoverColor - Hover color
 * @param {string} activeColor - Active/dragging color
 * @returns {Object}
 */
function createHandleHighlight(normalColor, hoverColor, activeColor) {
  let state = 'normal';
  let currentColor = normalColor || '#b8860b';

  function normal() { state = 'normal'; currentColor = normalColor || '#b8860b'; }
  function hover() { state = 'hover'; currentColor = hoverColor || '#d4a017'; }
  function active() { state = 'active'; currentColor = activeColor || '#ffd700'; }

  function getColor() { return currentColor; }
  function getState() { return state; }
  function isHover() { return state === 'hover'; }
  function isActive() { return state === 'active'; }

  return { normal, hover, active, getColor, getState, isHover, isActive };
}

/**
 * Draw handle with highlight state.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x, y - Center
 * @param {number} r - Radius
 * @param {Object} highlight - HandleHighlight instance
 * @param {Object} opts - {fill, stroke, glow}
 */
function drawHandle(ctx, x, y, r, highlight, opts) {
  opts = opts || {};
  const color = highlight.getColor();
  ctx.save();
  if (opts.glow) { ctx.shadowColor = color; ctx.shadowBlur = opts.glow; }
  ctx.fillStyle = opts.fill || color;
  ctx.strokeStyle = opts.stroke || color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// ─── Cursor Helpers ────────────────────────────────────────────────────────────

/**
 * Update cursor based on interaction state.
 * @param {HTMLCanvasElement} canvas
 * @param {boolean} isHovering - Is cursor over interactive element
 * @param {boolean} isDragging - Is currently dragging
 */
function updateCursor(canvas, isHovering, isDragging) {
  if (!canvas) return;
  if (isDragging) canvas.style.cursor = 'grabbing';
  else if (isHovering) canvas.style.cursor = 'grab';
  else canvas.style.cursor = 'default';
}

// ─── Drag State Machine ────────────────────────────────────────────────────────

/**
 * Create drag state machine for route interactions.
 * @param {Object} config - {hitRadius, onDrag, onEnd}
 * @returns {Object}
 */
function createDragState(config) {
  config = config || {};
  const hitRadius = config.hitRadius || 20;
  let dragging = null;
  let ghost = createGhostState();
  let snapGuides = null;
  let lastX = 0, lastY = 0;

  function setSnapGuides(guides) { snapGuides = guides; }

  function hitTest(x, y, getPosition) {
    if (typeof getPosition !== 'function') return false;
    const pos = getPosition();
    return Math.hypot(pos.x - x, pos.y - y) <= hitRadius;
  }

  function startDrag(id, x, y, state, onDrag) {
    dragging = id;
    ghost.capture(state);
    lastX = x; lastY = y;
    if (typeof onDrag === 'function') onDrag(x, y);
  }

  function moveDrag(x, y, setPosition, onDrag) {
    if (!dragging) return null;
    let tx = x, ty = y;
    if (snapGuides) {
      const snap = snapGuides.getSnapTarget(x, y);
      if (snap) {
        snapGuides.setActive(snap);
        tx = snap.x; ty = snap.y;
      } else {
        snapGuides.clearActive();
      }
    }
    if (typeof setPosition === 'function') setPosition(tx, ty);
    if (typeof onDrag === 'function') onDrag(tx, ty);
    lastX = tx; lastY = ty;
    return { x: tx, y: ty };
  }

  function endDrag() {
    const result = { x: lastX, y: lastY };
    dragging = null;
    ghost.hide();
    if (snapGuides) snapGuides.clearActive();
    return result;
  }

  function isDragging() { return dragging !== null; }
  function getDragging() { return dragging; }
  function getGhost() { return ghost; }
  function getSnapGuides() { return snapGuides; }

  return {
    setSnapGuides,
    hitTest,
    startDrag,
    moveDrag,
    endDrag,
    isDragging,
    getDragging,
    getGhost,
    getSnapGuides
  };
}

// ─── Spring Drag ───────────────────────────────────────────────────────────────

/**
 * Create a spring-based handle that follows cursor with lag/elasticity.
 * @param {Object} base - Standard handle config
 * @param {Object} opts - {stiffness, damping, mass}
 */
function createSpringHandle(base, opts) {
  const cfg = opts || {};
  const k = cfg.stiffness || 0.15;
  const d = cfg.damping || 0.8;
  const m = cfg.mass || 1;
  
  let target = Object.assign({}, base.get ? base.get() : { x: 0, y: 0 });
  let current = Object.assign({}, target);
  let velocity = { x: 0, y: 0 };

  return Object.assign({}, base, {
    set(point, phase) {
      target = point;
      if (phase !== 'drag' && phase !== 'spring') {
        current = Object.assign({}, target);
        velocity = { x: 0, y: 0 };
        if (base.set) base.set(current, phase);
      }
    },
    update(dt) {
      const forceX = (target.x - current.x) * k;
      const forceY = (target.y - current.y) * k;
      
      const ax = forceX / m;
      const ay = forceY / m;
      
      velocity.x = (velocity.x + ax) * d;
      velocity.y = (velocity.y + ay) * d;
      
      current.x += velocity.x;
      current.y += velocity.y;
      
      if (base.set) base.set(current, 'spring');
      return Math.hypot(velocity.x, velocity.y) > 0.01;
    }
  });
}

// ─── Detach Guides ──────────────────────────────────────────────────────────────

/**
 * Draw a guide line showing distance from cursor to a handle.
 */
function drawDetachGuide(ctx, handleX, handleY, cursorX, cursorY, threshold) {
  const dist = Math.hypot(cursorX - handleX, cursorY - handleY);
  if (dist < (threshold || 40)) return;
  
  ctx.save();
  ctx.strokeStyle = 'rgba(108,117,125,0.4)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(handleX, handleY);
  ctx.lineTo(cursorX, cursorY);
  ctx.stroke();
  
  // Draw distance label
  ctx.fillStyle = '#6c757d';
  ctx.font = '10px Inter, sans-serif';
  ctx.fillText(`${Math.round(dist)}px`, (handleX + cursorX) / 2 + 5, (handleY + cursorY) / 2 - 5);
  ctx.restore();
}

// ─── Public API ────────────────────────────────────────────────────────────────

window.SimInteractionEnhancements = {
  createSnapGuides,
  createGhostState,
  createHandleHighlight,
  drawHandle,
  updateCursor,
  createDragState,
  createSpringHandle,
  drawDetachGuide
};

})();
