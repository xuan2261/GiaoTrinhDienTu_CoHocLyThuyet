(function() {
'use strict';
const W = 760, H = 440;
const palette = ['#dc3545', '#0d6efd', '#198754', '#fd7e14', '#6f42c1', '#0dcaf0', '#b8860b'];
const tracedMethods = ['fillRect', 'strokeRect', 'rect', 'roundRect', 'arc', 'ellipse', 'moveTo', 'lineTo', 'quadraticCurveTo', 'bezierCurveTo'];
const traceLimit = 360;
let currentRouteId = '';
let structuralMarks = [];
let traceActive = false, overlayFrame;
function tone(index) { return palette[Math.abs(index || 0) % palette.length]; }
function clean(value) { return String(value == null ? '' : value).replace(/[^a-z0-9_-]/gi, '_').slice(0, 64); }
function isDarkTheme() {
  return !!(typeof document !== 'undefined' && document.documentElement &&
    document.documentElement.getAttribute('data-theme') === 'dark');
}
function sceneColors() {
  return isDarkTheme()
    ? { bg: '#091a33', panel: 'rgba(13,36,71,.94)', grid: 'rgba(255,255,255,.045)', major: 'rgba(201,150,58,.12)', text: '#e8ecf1', border: 'rgba(201,150,58,.24)' }
    : { bg: '#ffffff', panel: 'rgba(255,255,255,.96)', grid: 'rgba(0,0,0,.06)', major: 'rgba(201,150,58,.18)', text: '#1a1a2e', border: 'rgba(13,36,71,.12)' };
}
function label(ctx, text, x, y, size, fill) {
  ctx.fillStyle = fill || sceneColors().text;
  ctx.font = `bold ${size || 12}px "Segoe UI", Inter, sans-serif`;
  ctx.fillText(text || '', x, y);
}
function mark(kind) {
  if (!traceActive || structuralMarks.length >= traceLimit) return;
  const vals = Array.prototype.slice.call(arguments, 1).map(function(v) {
    if (Number.isFinite(Number(v))) return Math.round(Number(v));
    return String(v || '').replace(/[^a-z0-9_-]/gi, '').slice(0, 24);
  });
  structuralMarks.push([kind].concat(vals).join(':'));
}
function traceContext(ctx) {
  if (!ctx || ctx.__simRouteTraceWrapped) return;
  tracedMethods.forEach(method => {
    if (typeof ctx[method] !== 'function') return;
    const original = ctx[method];
    ctx[method] = function() {
      mark(`ctx-${method}`, ...arguments);
      return original.apply(this, arguments);
    };
  });
  Object.defineProperty(ctx, '__simRouteTraceWrapped', { value: true });
}
function resetMarks(routeId) {
  currentRouteId = routeId || currentRouteId;
  structuralMarks = [];
  traceActive = true;
}
function marks() { return structuralMarks.slice(); }
function withoutTrace(fn) {
  const previous = traceActive;
  traceActive = false;
  try { fn(); } finally { traceActive = previous; }
}
function beginOverlay(root, canvas, routeId) {
  if (!root || !canvas) return;
  const rect = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : { width: W, height: H };
  const sx = rect.width / (canvas.width || W) || 1;
  const sy = rect.height / (canvas.height || H) || 1;
  root.style.width = `${Math.round(rect.width || W)}px`;
  root.style.height = `${Math.round(rect.height || H)}px`;
  root.__simOverlayNodes = root.__simOverlayNodes || {};
  overlayFrame = { root, routeId: routeId || currentRouteId || '', nodes: root.__simOverlayNodes, active: {}, sx, sy, scale: Math.min(sx, sy, 1) };
}
function overlayNode(kind, key, className) {
  if (!overlayFrame) return null;
  const id = `${overlayFrame.routeId}:${kind}:${clean(key)}`;
  let node = overlayFrame.nodes[id];
  overlayFrame.active[id] = true;
  if (!node) {
    node = document.createElement('div');
    node.setAttribute('data-sim-overlay-key', id);
    overlayFrame.nodes[id] = node;
    overlayFrame.root.appendChild(node);
  }
  node.className = className;
  return node;
}
function placeOverlay(node, x, y, options) {
  const cfg = options || {};
  node.style.transform = `translate(${Math.round(x * overlayFrame.sx)}px, ${Math.round(y * overlayFrame.sy)}px) scale(${overlayFrame.scale})`;
  node.style.color = cfg.color || '';
  node.style.textAlign = cfg.align || '';
  node.style.width = cfg.width ? `${Math.round(cfg.width)}px` : '';
  node.style.height = cfg.height ? `${Math.round(cfg.height)}px` : '';
}
function allowCanvasFormulaOverlay() {
  return !!(typeof window !== 'undefined' && window.SIM_ALLOW_CANVAS_FORMULA_OVERLAY === true);
}
function isShortOverlayLabel(text) {
  return /^(?:[A-Z]|[A-Z]\d|O|IC|F|F1|F2|v|a|N|T|x|y|α)$/u.test(String(text || '').trim());
}
function allowCanvasOverlayText(text) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  return !normalized || isShortOverlayLabel(normalized);
}
function domMath(ctx, key, x, y, latex, options) {
  if (!allowCanvasFormulaOverlay()) {
    mark('domMathSuppressed', key, x, y);
    return;
  }
  mark('domMath', key, x, y);
  const node = overlayNode('math', key, 'sim-overlay-formula');
  if (!node) return;
  const canRenderKatex = window.katex && typeof window.katex.render === 'function';
  if (node.__latex !== latex || (canRenderKatex && !node.querySelector('.katex'))) {
    node.textContent = latex || '';
    if (canRenderKatex) {
      try {
        window.katex.render(latex || '', node, { throwOnError: false });
        node.__latex = latex;
      } catch (_err) {
        node.textContent = latex || '';
        node.__latex = '';
      }
    } else {
      node.__latex = '';
    }
  }
  placeOverlay(node, x, y, options);
}
function domLabel(ctx, key, x, y, text, options) {
  if (!allowCanvasFormulaOverlay() && !allowCanvasOverlayText(text)) {
    mark('domLabelSuppressed', key, x, y);
    return;
  }
  mark('domLabel', key, x, y);
  const node = overlayNode('label', key, 'sim-overlay-label');
  if (!node) return;
  if (node.__text !== text) {
    node.textContent = text || '';
    node.__text = text;
  }
  placeOverlay(node, x, y, options);
}
function domPanel(ctx, key, x, y, w, h, text, options) {
  if (!allowCanvasFormulaOverlay() && !allowCanvasOverlayText(text)) {
    mark('domPanelSuppressed', key, x, y, w, h);
    return;
  }
  mark('domPanel', key, x, y, w, h);
  const node = overlayNode('panel', key, 'sim-overlay-panel');
  if (!node) return;
  if (node.__text !== text) {
    node.textContent = text || '';
    node.__text = text;
  }
  placeOverlay(node, x, y, Object.assign({ width: w, height: h }, options || {}));
}
function endOverlay() {
  if (!overlayFrame) return;
  Object.keys(overlayFrame.nodes).forEach(id => {
    if (overlayFrame.active[id]) return;
    const node = overlayFrame.nodes[id];
    if (node && node.parentNode) node.parentNode.removeChild(node);
    delete overlayFrame.nodes[id];
  });
  overlayFrame = null;
}
function drawSceneGrid(ctx, x, y, w, h) {
  const colors = sceneColors();
  ctx.save();
  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;
  for (let gx = x + 30; gx < x + w; gx += 30) {
    ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y + h); ctx.stroke();
  }
  for (let gy = y + 30; gy < y + h; gy += 30) {
    ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + w, gy); ctx.stroke();
  }
  ctx.strokeStyle = colors.major;
  for (let gx = x + 150; gx < x + w; gx += 150) {
    ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y + h); ctx.stroke();
  }
  for (let gy = y + 150; gy < y + h; gy += 150) {
    ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + w, gy); ctx.stroke();
  }
  ctx.restore();
}
function frame(ctx, scene, caption, accent) {
  traceContext(ctx);
  resetMarks(scene.routeId || currentRouteId);
  withoutTrace(() => {
    const colors = sceneColors();
    ctx.fillStyle = isDarkTheme() ? '#050c1a' : '#f8f9fa';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = colors.bg;
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1.2;
    ctx.fillRect(18, 18, W - 36, H - 36);
    ctx.strokeRect(18, 18, W - 36, H - 36);
    drawSceneGrid(ctx, 18, 18, W - 36, H - 36);
    ctx.fillStyle = colors.panel;
    ctx.fillRect(24, 24, W - 48, 28);
    ctx.strokeStyle = accent || tone(scene.seed);
    ctx.beginPath(); ctx.moveTo(24, 52); ctx.lineTo(W - 24, 52); ctx.stroke();
    label(ctx, caption || scene.title || scene.routeId, 30, 43, 13, accent || tone(scene.seed));
  });
}
function arrow(ctx, x1, y1, x2, y2, fill, text) { mark('arrow', x1, y1, x2, y2); if (window.SimCore && window.SimCore.drawArrow) window.SimCore.drawArrow(ctx, x1, y1, x2, y2, fill, 2.4, text); }
function supportTriangle(ctx, cx, cy, size, color) {
  mark('supportTriangle', cx, cy, size);
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - size, cy + size * 1.5); ctx.lineTo(cx + size, cy + size * 1.5); ctx.closePath();
  ctx.fillStyle = color || 'rgba(201,150,58,.2)';
  ctx.fill();
  ctx.strokeStyle = color || '#c9963a';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}
function vectorTriangle(ctx, x1, y1, x2, y2, x3, y3, color, alpha) {
  mark('vectorTriangle', x1, y1, x2, y2, x3, y3);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath();
  ctx.fillStyle = color || 'rgba(39,174,96,.1)';
  ctx.globalAlpha = alpha || 1;
  ctx.fill();
  ctx.strokeStyle = color || '#27ae60';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.globalAlpha = 1;
}
function barGraph(ctx, x, y, w, h, value, max, color, labelText) {
  mark('barGraph', x, y, w, h);
  const bw = (value / max) * w;
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color || '#0d6efd';
  ctx.fillRect(x, y, bw, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.strokeRect(x, y, w, h);
  if (labelText) label(ctx, labelText, x, y - 5, 11, sceneColors().text);
}
function body(ctx, x, y, w, h, fill, stroke, title, options) {
  const cfg = options || {};
  mark('body', x, y, w, h);
  ctx.save();
  if (cfg.shadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
  }
  ctx.fillStyle = fill || 'rgba(13,110,253,.12)';
  ctx.strokeStyle = stroke || '#0d6efd';
  ctx.lineWidth = cfg.lineWidth || 2;

  if (cfg.radius > 0 && ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, cfg.radius);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
  }
  ctx.restore();
  if (title) label(ctx, title, x + 8, y + 18, 12, stroke);
}
function spring(ctx, x1, y1, x2, y2, options) {
  mark('spring', x1, y1, x2, y2);
  const cfg = options || {};
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  const coils = cfg.coils || 10;
  const width = cfg.width || 12;

  ctx.save();
  ctx.translate(x1, y1);
  ctx.rotate(angle);
  ctx.strokeStyle = cfg.color || '#adb5bd';
  ctx.lineWidth = cfg.lineWidth || 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  const step = len / (coils * 4);
  for (let i = 0; i <= coils * 4; i++) {
    const px = i * step;
    const py = (i % 4 === 1) ? -width : (i % 4 === 3) ? width : 0;
    ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.restore();
}
function cable(ctx, x1, y1, x2, y2, options) {
  mark('cable', x1, y1, x2, y2);
  const cfg = options || {};
  const sag = cfg.sag || 15;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 + sag;

  ctx.save();
  ctx.strokeStyle = cfg.color || '#495057';
  ctx.lineWidth = cfg.lineWidth || 1.5;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(mx, my, x2, y2);
  ctx.stroke();
  ctx.restore();
}
function realisticBody(ctx, x, y, w, h, title, options) {
  const cfg = options || {};
  const fill = cfg.material === 'metal' ? window.SimVisualHelpers.metalGradient(ctx, x, y, w, h) : (cfg.fill || 'rgba(206,212,218,0.5)');
  body(ctx, x, y, w, h, fill, cfg.stroke || '#495057', title, Object.assign({ radius: 4, shadow: true }, cfg));
}
function realisticBeam(ctx, x1, y1, x2, y2, options) {
  mark('realisticBeam', x1, y1, x2, y2);
  const cfg = options || {};
  const w = x2 - x1, h = cfg.height || 12;
  const fill = cfg.material === 'metal' ? window.SimVisualHelpers.metalGradient(ctx, x1, y1, w, h, true) : (cfg.fill || '#dee2e6');
  ctx.save();
  if (cfg.shadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
  }
  ctx.fillStyle = fill;
  ctx.strokeStyle = cfg.stroke || '#6c757d';
  ctx.lineWidth = cfg.lineWidth || 2;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x1, y1 - h / 2, w, h, cfg.radius || 2);
  else ctx.rect(x1, y1 - h / 2, w, h);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
function realisticGround(ctx, x1, y, x2, options) {
  mark('realisticGround', x1, y, x2);
  const cfg = options || {};
  const h = cfg.height || 10;
  ctx.save();
  ctx.fillStyle = cfg.material === 'concrete' ? window.SimVisualHelpers.concretePattern(ctx) : (cfg.fill || '#e9ecef');
  ctx.fillRect(x1, y, x2 - x1, h);
  ctx.strokeStyle = cfg.stroke || '#adb5bd';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
  ctx.restore();
}
function realisticPoint(ctx, x, y, options) {
  const cfg = options || {};
  point(ctx, x, y, cfg.fill || '#212529', cfg.text);
}
function realisticWheel(ctx, x, y, r, angle, options) {
  mark('realisticWheel', x, y, r);
  const cfg = options || {};
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle || 0);

  // Outer shadow
  if (cfg.shadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
  }

  // Body gradient
  const grad = window.SimVisualHelpers.radialGradient(ctx, 0, 0, r, [
    { offset: 0, color: '#f8f9fa' },
    { offset: 0.8, color: '#dee2e6' },
    { offset: 0.95, color: '#adb5bd' },
    { offset: 1, color: '#495057' }
  ]);
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();

  // Rim
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#495057';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Spokes or teeth
  const count = cfg.spokes || 6;
  ctx.strokeStyle = 'rgba(73, 80, 87, 0.5)';
  ctx.lineWidth = 2;
  for (let i = 0; i < count; i++) {
    const a = (i * Math.PI * 2) / count;
    ctx.beginPath();
    ctx.moveTo(r * 0.2 * Math.cos(a), r * 0.2 * Math.sin(a));
    ctx.lineTo(r * 0.9 * Math.cos(a), r * 0.9 * Math.sin(a));
    ctx.stroke();
  }

  // Hub
  ctx.fillStyle = '#6c757d';
  ctx.beginPath(); ctx.arc(0, 0, r * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#343a40';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}
function point(ctx, x, y, fill, text) {
  mark('point', x, y);
  ctx.fillStyle = fill || tone(0);
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
  if (text) label(ctx, text, x + 8, y - 8, 12, fill);
}
function angleArc(ctx, x, y, radius, start, end, fill, text) {
  mark('angleArc', x, y, radius, start * 100, end * 100);
  ctx.strokeStyle = fill || tone(3);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius, start, end);
  ctx.stroke();
  if (text) label(ctx, text, x + radius + 6, y - 4, 12, fill);
}
function dimension(ctx, x1, y1, x2, y2, fill, text) {
  mark('dimension', x1, y1, x2, y2);
  ctx.setLineDash([5, 4]);
  arrow(ctx, x1, y1, x2, y2, fill || tone(6), text);
  ctx.setLineDash([]);
}
function ground(ctx, x1, y, x2) {
  mark('ground', x1, y, x2);
  ctx.strokeStyle = '#6c757d';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
  for (let x = x1; x < x2; x += 18) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 10, y + 14);
    ctx.stroke();
  }
}
function panel(ctx, x, y, w, h, title, color) {
  if (window.SimVisualHelpers && window.SimVisualHelpers.glassPanel) {
    window.SimVisualHelpers.glassPanel(ctx, x, y, w, h, { title, stroke: color });
    return;
  }
  mark('panel', x, y, w, h);
  ctx.fillStyle = 'rgba(248,249,250,.92)';
  ctx.strokeStyle = color || '#adb5bd';
  ctx.lineWidth = 1.5;
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);
  label(ctx, title, x + 10, y + 22, 12, color || '#495057');
}
function neonArrow(ctx, x1, y1, x2, y2, fill, text) {
  if (window.SimVisualHelpers && window.SimVisualHelpers.neonArrow) {
    window.SimVisualHelpers.neonArrow(ctx, x1, y1, x2, y2, fill, { label: text });
    return;
  }
  arrow(ctx, x1, y1, x2, y2, fill, text);
}
function dashedLine(ctx, x1, y1, x2, y2, fill) {
  mark('dashedLine', x1, y1, x2, y2);
  ctx.setLineDash([7, 5]);
  ctx.strokeStyle = fill || '#6c757d';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
}
function line(ctx, x1, y1, x2, y2, stroke, width) {
  mark('line', x1, y1, x2, y2);
  ctx.strokeStyle = stroke || '#6c757d';
  ctx.lineWidth = width || 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
window.SimRouteRendererPrimitives = {
  W, H, tone, label, mark, marks, resetMarks, traceContext, isDarkTheme,
  beginOverlay, endOverlay, domMath, domLabel, domPanel,
  frame, arrow, neonArrow, body, spring, cable,
  realisticBody, realisticBeam, realisticGround, realisticWheel, realisticPoint,
  point, angleArc, dimension, ground, panel, dashedLine, line,
  supportTriangle, vectorTriangle, barGraph
};
})();
