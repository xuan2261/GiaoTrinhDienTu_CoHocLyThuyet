/**
 * Visual helpers — glow effects, gradient fills, enhanced arrows, grid.
 * Phase 1 infrastructure for 58-route simulation rebuild.
 */
(function() {
'use strict';

const core = window.SimCore || {};

function isDarkTheme() {
  return !!(typeof document !== 'undefined' && document.documentElement &&
    document.documentElement.getAttribute('data-theme') === 'dark');
}

// ─── Glow Effects ──────────────────────────────────────────────────────────────

/**
 * Execute fn with glow effect active.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Function} fn - Drawing function to wrap
 * @param {string} color - Glow color
 * @param {number} blur - Blur radius px (default 6)
 */
function glow(ctx, fn, color, blur) {
  ctx.save();
  ctx.shadowColor = color || '#b8860b';
  ctx.shadowBlur = blur !== undefined ? blur : 6;
  fn();
  ctx.restore();
}

/**
 * Set glow on canvas context.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} color - Glow color
 * @param {number} blur - Blur radius px
 */
function setGlow(ctx, color, blur) {
  ctx.shadowColor = color || '#b8860b';
  ctx.shadowBlur = blur !== undefined ? blur : 6;
}

/**
 * Apply a standard shadow for depth.
 */
function applyShadow(ctx, options) {
  const cfg = options || {};
  ctx.shadowColor = cfg.color || 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = cfg.blur || 6;
  ctx.shadowOffsetX = cfg.x || 2;
  ctx.shadowOffsetY = cfg.y || 2;
}

/**
 * Clear glow (restore no-shadow state).
 * @param {CanvasRenderingContext2D} ctx
 */
function clearGlow(ctx) {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

// ─── Gradient Fills ───────────────────────────────────────────────────────────

/**
 * Create linear gradient.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x1, y1 - Start point
 * @param {number} x2, y2 - End point
 * @param {Array<{offset: number, color: string}>} stops - Gradient stops
 * @returns {CanvasGradient}
 */
function linearGradient(ctx, x1, y1, x2, y2, stops) {
  const g = ctx.createLinearGradient(x1, y1, x2, y2);
  for (const s of (stops || [])) {
    g.addColorStop(s.offset, s.color);
  }
  return g;
}

/**
 * Create a metallic gradient.
 */
function metalGradient(ctx, x, y, w, h, vertical) {
  const x2 = vertical ? x : x + w;
  const y2 = vertical ? y + h : y;
  return linearGradient(ctx, x, y, x2, y2, [
    { offset: 0, color: '#ced4da' },
    { offset: 0.3, color: '#e9ecef' },
    { offset: 0.5, color: '#f8f9fa' },
    { offset: 0.7, color: '#e9ecef' },
    { offset: 1, color: '#adb5bd' }
  ]);
}

/**
 * Create a concrete pattern.
 */
function concretePattern(ctx, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 32; canvas.height = 32;
  const pctx = canvas.getContext('2d');
  pctx.fillStyle = color || '#dee2e6';
  pctx.fillRect(0, 0, 32, 32);
  pctx.fillStyle = 'rgba(0,0,0,0.05)';
  for (let i = 0; i < 40; i++) {
    pctx.fillRect(Math.random() * 32, Math.random() * 32, 1, 1);
  }
  return ctx.createPattern(canvas, 'repeat');
}

/**
 * Draw a spring.
 */
function drawSpring(ctx, x1, y1, x2, y2, coils, width, color) {
  if (window.SimRouteRendererPrimitives && window.SimRouteRendererPrimitives.spring) {
    window.SimRouteRendererPrimitives.spring(ctx, x1, y1, x2, y2, { coils, width, color });
  }
}

/**
 * Draw a cable (catenary curve approximation).
 */
function drawCable(ctx, x1, y1, x2, y2, sag, color) {
  if (window.SimRouteRendererPrimitives && window.SimRouteRendererPrimitives.cable) {
    window.SimRouteRendererPrimitives.cable(ctx, x1, y1, x2, y2, { sag, color });
  }
}

/**
 * Create radial gradient.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx, cy - Center
 * @param {number} r - Radius
 * @param {Array<{offset: number, color: string}>} stops
 * @returns {CanvasGradient}
 */
function radialGradient(ctx, cx, cy, r, stops) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  for (const s of (stops || [])) {
    g.addColorStop(s.offset, s.color);
  }
  return g;
}

// ─── Enhanced Arrows ──────────────────────────────────────────────────────────

/**
 * Draw arrow with options.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x1, y1 - Start
 * @param {number} x2, y2 - End
 * @param {string} color
 * @param {Object} opts - {headSize, headAngle, lineWidth, glow, dash, label}
 */
function arrow(ctx, x1, y1, x2, y2, color, opts) {
  opts = opts || {};
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 2) return;

  ctx.save();
  if (opts.glow) { ctx.shadowColor = color; ctx.shadowBlur = opts.glow; }
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = opts.lineWidth || 2;
  ctx.setLineDash(opts.dash || []);

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  const headSize = opts.headSize || Math.min(12, len * 0.3);
  const headAngle = opts.headAngle || Math.PI / 7;
  const angle = Math.atan2(dy, dx);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headSize * Math.cos(angle - headAngle), y2 - headSize * Math.sin(angle - headAngle));
  ctx.lineTo(x2 - headSize * Math.cos(angle + headAngle), y2 - headSize * Math.sin(angle + headAngle));
  ctx.closePath();
  ctx.fill();

  if (opts.label) {
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillStyle = color;
    ctx.shadowBlur = 0;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    ctx.fillText(opts.label, mx + 5, my - 5);
  }

  ctx.restore();
}

/**
 * Neon Style Arrow — double glow effect.
 */
function neonArrow(ctx, x1, y1, x2, y2, color, opts) {
  opts = opts || {};
  const glowSize = opts.glow || 8;

  // Outer glow
  arrow(ctx, x1, y1, x2, y2, color, Object.assign({}, opts, { glow: glowSize, lineWidth: (opts.lineWidth || 2) + 1, label: null }));

  // Inner core
  arrow(ctx, x1, y1, x2, y2, '#ffffff', Object.assign({}, opts, { glow: 0, lineWidth: opts.lineWidth || 2 }));
}

/**
 * Draw double-headed arrow.
 */
function doubleArrow(ctx, x1, y1, x2, y2, color, opts) {
  opts = opts || {};
  arrow(ctx, x1, y1, x2, y2, color, opts);
  arrow(ctx, x2, y2, x1, y1, color, opts);
}

/**
 * Draw curved arrow (quadratic bezier).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x1, y1 - Start
 * @param {number} cx, cy - Control point
 * @param {number} x2, y2 - End
 * @param {string} color
 * @param {Object} opts
 */
function curvedArrow(ctx, x1, y1, cx, cy, x2, y2, color, opts) {
  opts = opts || {};
  ctx.save();
  if (opts.glow) { ctx.shadowColor = color; ctx.shadowBlur = opts.glow; }
  ctx.strokeStyle = color;
  ctx.lineWidth = opts.lineWidth || 2;
  ctx.setLineDash(opts.dash || []);

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(cx, cy, x2, y2);
  ctx.stroke();

  const dx = x2 - cx, dy = y2 - cy;
  const len = Math.hypot(dx, dy);
  const headSize = opts.headSize || Math.min(12, len * 0.3);
  const headAngle = opts.headAngle || Math.PI / 7;
  const angle = Math.atan2(dy, dx);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headSize * Math.cos(angle - headAngle), y2 - headSize * Math.sin(angle - headAngle));
  ctx.lineTo(x2 - headSize * Math.cos(angle + headAngle), y2 - headSize * Math.sin(angle + headAngle));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

/**
 * Draw grid with major and minor lines.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w, h - Canvas dimensions
 * @param {number} majorStep - Major grid spacing px (default 40)
 * @param {number} minorStep - Minor grid spacing px (default 10)
 */
function drawGrid(ctx, w, h, majorStep, minorStep) {
  majorStep = majorStep || 40;
  minorStep = minorStep || 10;

  ctx.lineWidth = 0.5;
  ctx.strokeStyle = '#f0f0f0';
  for (let x = 0; x <= w; x += minorStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += minorStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  ctx.lineWidth = 1;
  ctx.strokeStyle = '#dee2e6';
  for (let x = 0; x <= w; x += majorStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += majorStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

/**
 * Draw axes with major ticks and labels.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x, y - Origin
 * @param {number} w, h - Axis lengths
 * @param {string} xLabel - X-axis label
 * @param {string} yLabel - Y-axis label
 * @param {number} tickStep - Tick spacing px (default 40)
 */
function drawAxes(ctx, x, y, w, h, xLabel, yLabel, tickStep) {
  tickStep = tickStep || 40;
  ctx.strokeStyle = '#495057';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - h);
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.strokeStyle = '#495057';
  ctx.fillStyle = '#495057';
  ctx.font = '11px Inter, sans-serif';

  for (let tx = x; tx <= x + w; tx += tickStep) {
    ctx.beginPath();
    ctx.moveTo(tx, y);
    ctx.lineTo(tx, y + 5);
    ctx.stroke();
  }
  for (let ty = y; ty >= y - h; ty -= tickStep) {
    ctx.beginPath();
    ctx.moveTo(x, ty);
    ctx.lineTo(x - 5, ty);
    ctx.stroke();
  }

  if (xLabel) ctx.fillText(xLabel, x + w - 14, y + 16);
  if (yLabel) ctx.fillText(yLabel, x - 14, y - h + 12);
}

// ─── Body Fills ───────────────────────────────────────────────────────────────

/**
 * Filled rectangle with optional rounded corners.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x, y, w, h
 * @param {string} fill
 * @param {string} stroke
 * @param {number} radius - Corner radius px (default 0)
 */
function filledRect(ctx, x, y, w, h, fill, stroke, radius) {
  ctx.beginPath();
  if (radius > 0 && ctx.roundRect) {
    ctx.roundRect(x, y, w, h, radius);
  } else if (radius > 0) {
    const r = Math.min(radius, w / 2, h / 2);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  } else {
    ctx.rect(x, y, w, h);
  }
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}

/**
 * Glassmorphism Panel.
 */
function glassPanel(ctx, x, y, w, h, options) {
  const cfg = options || {};
  const dark = isDarkTheme();
  ctx.save();

  // Outer shadow for depth
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;

  // Semi-transparent base
  ctx.fillStyle = cfg.fill || (dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.92)');
  ctx.strokeStyle = cfg.stroke || (dark ? 'rgba(255,255,255,0.15)' : 'rgba(13,36,71,0.18)');
  ctx.lineWidth = 1;

  if (ctx.roundRect) ctx.roundRect(x, y, w, h, cfg.radius || 12);
  else ctx.rect(x, y, w, h);

  ctx.fill();
  ctx.stroke();

  // Highlight border (top-left)
  ctx.shadowBlur = 0;
  ctx.strokeStyle = dark ? 'rgba(255,255,255,0.25)' : 'rgba(13,36,71,0.12)';
  ctx.beginPath();
  const r = cfg.radius || 12;
  ctx.moveTo(x + w - r, y);
  ctx.lineTo(x + r, y);
  ctx.arcTo(x, y, x, y + r, r);
  ctx.lineTo(x, y + h - r);
  ctx.stroke();

  if (cfg.title) {
    ctx.fillStyle = cfg.textColor || (dark ? 'rgba(255,255,255,0.85)' : '#1f2a36');
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(cfg.title.toUpperCase(), x + 12, y + 18);
  }

  ctx.restore();
}

/**
 * Filled circle.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx, cy, r
 * @param {string} fill
 * @param {string} stroke
 */
function filledCircle(ctx, cx, cy, r, fill, stroke) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}

/**
 * Filled polygon.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<{x: number, y: number}>} points
 * @param {string} fill
 * @param {string} stroke
 */
function filledPolygon(ctx, points, fill, stroke) {
  if (!points || points.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}

// ─── Animation Helpers ────────────────────────────────────────────────────────

/**
 * Fade in effect.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} alpha - Current alpha (0-1)
 * @param {Function} fn - Drawing function
 */
function fadeIn(ctx, alpha, fn) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  fn();
  ctx.restore();
}

/**
 * Pulsing effect — returns scale factor based on sine wave.
 * @param {number} t - Time s
 * @param {number} period - Pulse period s (default 2)
 * @param {number} minScale - Min scale (default 0.8)
 * @param {number} maxScale - Max scale (default 1.2)
 * @returns {number}
 */
function pulse(t, period, minScale, maxScale) {
  period = period || 2;
  const s = Math.sin(2 * Math.PI * t / period);
  return ((minScale || 0.8) + (maxScale || 1.2) + s * ((maxScale || 1.2) - (minScale || 0.8))) / 2;
}

/**
 * Visual Ripple VFX.
 */
function vfxRipple(ctx, x, y, progress, color) {
  const r = progress * 60;
  const alpha = 1 - progress;
  ctx.save();
  ctx.strokeStyle = color || '#b8860b';
  ctx.globalAlpha = alpha * 0.5;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/**
 * Emit spark particles at a collision point.
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 */
function emitCollisionSparks(x, y) {
  if (!window.SimAnimationEngine) return;
  const emitter = window.SimAnimationEngine.createParticleEmitter(x, y, {
    count: 12,
    spread: Math.PI * 0.8,
    angleOffset: -Math.PI / 2,
    speedMin: 40,
    speedMax: 120,
    lifeMin: 0.2,
    lifeMax: 0.5,
    sizeMin: 1,
    sizeMax: 3,
    color: '#ffcc00',
    gravity: 150
  });
  window.SimAnimationEngine.emitParticles(emitter);
}

/**
 * Emit a burst of particles for energy transition or feedback.
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} color - Particle color
 */
function emitEnergyBurst(x, y, color) {
  if (!window.SimAnimationEngine) return;
  const emitter = window.SimAnimationEngine.createParticleEmitter(x, y, {
    count: 20,
    spread: Math.PI * 2,
    speedMin: 20,
    speedMax: 80,
    lifeMin: 0.4,
    lifeMax: 0.8,
    sizeMin: 2,
    sizeMax: 6,
    color: color || '#0d6efd',
    gravity: 0
  });
  window.SimAnimationEngine.emitParticles(emitter);
}

/**
 * Draw a glowing glassmorphism-style bar for energy or state visualization.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x, y, w, h - Bounds
 * @param {string} fill - Bar color
 * @param {string} label - Text label
 */
function drawGlassBar(ctx, x, y, w, h, fill, label) {
  ctx.save();

  // Background glass effect
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, 6);
  else ctx.rect(x, y, w, h);
  ctx.fill();
  ctx.stroke();

  // Progress fill with gradient and glow
  if (fill) {
    const grad = ctx.createLinearGradient(x, y, x + w, y);
    grad.addColorStop(0, fill);
    grad.addColorStop(1, glowColor(fill, 0.3));

    ctx.shadowColor = fill;
    ctx.shadowBlur = 10;
    ctx.fillStyle = grad;

    const fillH = Math.max(0, h);
    if (ctx.roundRect) ctx.roundRect(x, y + h - fillH, w, fillH, 6);
    else ctx.rect(x, y + h - fillH, w, fillH);
    ctx.fill();
  }

  // Label
  if (label) {
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#212529';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, y - 8);
  }

  ctx.restore();
}

/** Helper to lighten a color for gradients */
function glowColor(hex, amount) {
  if (!hex.startsWith('#')) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${amount})`;
}

// ─── Public API ────────────────────────────────────────────────────────────────

window.SimVisualHelpers = {
  glow, setGlow, applyShadow, clearGlow,
  linearGradient, radialGradient,
  metalGradient, concretePattern,
  arrow, neonArrow, doubleArrow, curvedArrow,
  drawGrid, drawAxes,
  drawSpring, drawCable,
  filledRect, filledCircle, filledPolygon,
  glassPanel, vfxRipple,
  fadeIn, pulse,
  emitCollisionSparks, emitEnergyBurst, drawGlassBar
};

})();
