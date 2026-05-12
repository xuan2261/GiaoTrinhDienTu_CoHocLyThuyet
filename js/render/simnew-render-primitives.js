/**
 * SimNew Render — Low-level canvas drawing primitives
 * Arrow, arc, rect, circle, polygon, dashedLine, grid, text.
 */
(function(root) {
'use strict';

const R = {
  /** Arrow from (x1,y1) to (x2,y2) */
  arrow(ctx, x1, y1, x2, y2, color, lw, glowPx) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1) return;
    const a = Math.atan2(dy, dx);
    const hl = Math.min(14, len * 0.4);
    const ha = Math.PI / 7;

    if (glowPx > 0) { ctx.shadowColor = color; ctx.shadowBlur = glowPx; }
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lw || 2;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - hl * Math.cos(a - ha), y2 - hl * Math.sin(a - ha));
    ctx.lineTo(x2 - hl * Math.cos(a + ha), y2 - hl * Math.sin(a + ha));
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
  },

  /** Dashed arrow (ghost preview) */
  ghostArrow(ctx, x1, y1, x2, y2, color, lw) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lw || 2;
    ctx.setLineDash([6, 4]);
    ctx.globalAlpha *= 0.5;
    R.arrow(ctx, x1, y1, x2, y2, color, lw, 0);
    ctx.setLineDash([]);
    ctx.globalAlpha /= 0.5;
    ctx.restore();
  },

  /** Circle outline */
  circle(ctx, x, y, r, color, lw, fill) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (color) { ctx.strokeStyle = color; ctx.lineWidth = lw || 2; ctx.stroke(); }
  },

  /** Filled circle */
  filledCircle(ctx, x, y, r, color, strokeColor, lw) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha *= 0.85;
    ctx.fill();
    ctx.globalAlpha /= 0.85;
    if (strokeColor) { ctx.strokeStyle = strokeColor; ctx.lineWidth = lw || 2; ctx.stroke(); }
  },

  /** Rectangle outline */
  rect(ctx, x, y, w, h, color, lw, fill, radius) {
    radius = radius || 0;
    ctx.beginPath();
    if (radius > 0) {
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
    if (fill) { ctx.fillStyle = fill; ctx.globalAlpha *= 0.85; ctx.fill(); ctx.globalAlpha /= 0.85; }
    if (color) { ctx.strokeStyle = color; ctx.lineWidth = lw || 2; ctx.stroke(); }
  },

  /** Polygon (array of [x,y] points) */
  polygon(ctx, pts, color, lw, fill) {
    if (!pts || pts.length < 3) return;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.globalAlpha *= 0.3; ctx.fill(); ctx.globalAlpha /= 0.3; }
    if (color) { ctx.strokeStyle = color; ctx.lineWidth = lw || 1.5; ctx.stroke(); }
  },

  /** Dashed line */
  dashedLine(ctx, x1, y1, x2, y2, color, lw) {
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = color || '#888';
    ctx.lineWidth = lw || 1.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  },

  /** Grid lines */
  grid(ctx, w, h, step, color) {
    color = color || 'rgba(0,0,0,0.08)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= w; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y <= h; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
  },

  /** Text label */
  label(ctx, text, x, y, opts) {
    opts = opts || {};
    ctx.save();
    ctx.fillStyle = opts.color || '#333';
    ctx.font = (opts.bold ? 'bold ' : '') + (opts.size || 11) + 'px Segoe UI, sans-serif';
    ctx.textAlign = opts.align || 'center';
    ctx.textBaseline = opts.baseline || 'middle';
    if (opts.shadow) { ctx.shadowColor = opts.shadow; ctx.shadowBlur = 4; }
    ctx.fillText(text, x, y);
    ctx.restore();
  },

  /** Arc (angle from a1 to a2, radians) */
  arc(ctx, cx, cy, r, a1, a2, color, lw, fill) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, a1, a2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (color) { ctx.strokeStyle = color; ctx.lineWidth = lw || 2; ctx.stroke(); }
  },

  /** Angle arc (from angle1 to angle2 with fill arc + dashed line to center) */
  angleArc(ctx, cx, cy, r, a1, a2, color, lw) {
    ctx.save();
    ctx.strokeStyle = color || '#888';
    ctx.fillStyle = color || '#888';
    ctx.lineWidth = lw || 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + r * Math.cos(a1), cy + r * Math.sin(a1));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(cx, cy, r, a1, a2, a2 < a1);
    ctx.stroke();
    ctx.restore();
  },

  /** Dimension line (two end ticks + line) */
  dimension(ctx, x1, y1, x2, y2, offset, color) {
    offset = offset || 10;
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1) return;
    const nx = -dy / len * offset, ny = dx / len * offset;
    ctx.strokeStyle = color || '#888';
    ctx.lineWidth = 1;
    // Main line with offset
    ctx.beginPath();
    ctx.moveTo(x1 + nx, y1 + ny);
    ctx.lineTo(x2 + nx, y2 + ny);
    ctx.stroke();
    // End ticks
    const tick = 5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + nx * 2, y1 + ny * 2);
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 + nx * 2, y2 + ny * 2);
    ctx.stroke();
  },

  /** Spring coil (zigzag) between two points */
  spring(ctx, x1, y1, x2, y2, coils, color, lw) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * len);
    if (len < 1) return;
    coils = coils || 8;
    const nx = dx / len, ny = dy / len;
    const px = -ny, py = nx;
    const cw = Math.min(8, len / (coils * 2));
    ctx.strokeStyle = color || '#888';
    ctx.lineWidth = lw || 1.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    for (let i = 0; i < coils; i++) {
      const t0 = (i * 2 + 1) / (coils * 2);
      const t1 = (i * 2 + 2) / (coils * 2);
      const cx0 = x1 + nx * len * t0 + px * cw * (i % 2 === 0 ? 1 : -1);
      const cy0 = y1 + ny * len * t0 + py * cw * (i % 2 === 0 ? 1 : -1);
      const cx1 = x1 + nx * len * t1;
      const cy1 = y1 + ny * len * t1;
      ctx.lineTo(cx0, cy0);
      ctx.lineTo(cx1, cy1);
    }
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = R;
} else {
  root.SimNew = root.SimNew || {};
  root.SimNew.Primitives = R;
}

})(typeof window !== 'undefined' ? window : this);
