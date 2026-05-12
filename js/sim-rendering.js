/**
 * Rendering helpers that sit above SimCore drawing primitives.
 */
(function() {
'use strict';

const core = window.SimCore || {};

function isDarkTheme() {
  return !!(typeof document !== 'undefined' && document.documentElement &&
    document.documentElement.getAttribute('data-theme') === 'dark');
}

function colorAlpha(color, alpha) {
  const value = String(color || '').trim();
  const short = value.match(/^#([0-9a-f]{3})$/i);
  const full = value.match(/^#([0-9a-f]{6})$/i);
  let hex = '';
  if (short) hex = short[1].split('').map(ch => ch + ch).join('');
  if (full) hex = full[1];
  if (!hex) return `rgba(253,126,20,${alpha})`;
  const num = parseInt(hex, 16);
  return `rgba(${(num >> 16) & 255},${(num >> 8) & 255},${num & 255},${alpha})`;
}

function drawGrid(ctx, width, height, step) {
  const gap = step || 40;
  ctx.save();
  ctx.strokeStyle = (core.COLORS && core.COLORS.grid) || '#dee2e6';
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x += gap) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += gap) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawThemeGrid(ctx, width, height, step) {
  const gap = step || 30;
  ctx.save();
  ctx.strokeStyle = isDarkTheme() ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x += gap) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += gap) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawDragHandle(ctx, x, y, color) {
  ctx.save();
  ctx.fillStyle = color || ((core.COLORS && core.COLORS.result) || '#27ae60');
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawTrail(ctx, points, color, maxPoints) {
  if (!points || points.length < 2) return;
  const recent = points.slice(-(maxPoints || 30));
  ctx.save();
  ctx.strokeStyle = color || (isDarkTheme() ? 'rgba(231,76,60,.3)' : 'rgba(231,76,60,.25)');
  ctx.lineWidth = 3;
  ctx.beginPath();
  recent.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();
  ctx.restore();
}

function drawAngleArc(ctx, cx, cy, startAngle, endAngle, radius, color) {
  ctx.save();
  ctx.strokeStyle = color || ((core.COLORS && core.COLORS.gold) || '#c9963a');
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius || 35, startAngle, endAngle, endAngle < startAngle);
  ctx.stroke();
  ctx.restore();
}

function drawDeCuongArrow(ctx, x1, y1, x2, y2, color, lineWidth, headLength) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 2) return;
  const angle = Math.atan2(dy, dx);
  const headLen = Number(headLength) || 14;
  const stroke = color || ((core.COLORS && core.COLORS.force) || '#e74c3c');
  ctx.save();
  ctx.strokeStyle = stroke;
  ctx.fillStyle = stroke;
  ctx.lineWidth = lineWidth || 3;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 7), y2 - headLen * Math.sin(angle - Math.PI / 7));
  ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 7), y2 - headLen * Math.sin(angle + Math.PI / 7));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawDashed(ctx, x1, y1, x2, y2, color) {
  ctx.save();
  ctx.setLineDash([6, 4]);
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = color || ((core.COLORS && core.COLORS.label) || '#6c757d');
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function drawHandle(ctx, x, y, options) {
  const cfg = options || {};
  const active = !!cfg.isActive;
  const hovered = !!cfg.isHovered;
  const radius = cfg.radius || (active ? 11 : (hovered ? 10 : 8));
  const stroke = cfg.stroke || ((core.COLORS && core.COLORS.result) || '#fd7e14');
  const dark = isDarkTheme();
  const bubble = dark ? 'rgba(5,12,26,.94)' : 'rgba(255,255,255,.96)';
  const textColor = dark ? '#f8f9fa' : '#212529';
  ctx.save();
  if (cfg.hitRadius) {
    ctx.fillStyle = cfg.hitFill || colorAlpha(stroke, active ? 0.2 : (hovered ? 0.14 : 0.08));
    ctx.beginPath();
    ctx.arc(x, y, cfg.hitRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = colorAlpha(stroke, active ? 0.44 : 0.24);
  ctx.lineWidth = active ? 2 : 1.4;
  ctx.beginPath();
  ctx.arc(x, y, radius + 8, 0, Math.PI * 2);
  ctx.stroke();
  if (active || hovered) {
    ctx.strokeStyle = stroke;
    ctx.globalAlpha = active ? 0.64 : 0.42;
    ctx.lineWidth = active ? 4 : 2.5;
    ctx.beginPath();
    ctx.arc(x, y, radius + (active ? 8 : 5), 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = cfg.fill || stroke;
  ctx.beginPath();
  ctx.arc(x, y, cfg.radius || 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();
  if (cfg.label) {
    ctx.font = cfg.font || 'bold 11px Inter, sans-serif';
    const labelText = String(cfg.label);
    const lx = x + radius + 6;
    const ly = y - radius - 4;
    if (active || hovered) {
      const width = Math.ceil(ctx.measureText(labelText).width) + 10;
      ctx.fillStyle = bubble;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(lx - 4, ly - 13, width, 18, 5);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = cfg.labelColor || (active || hovered ? textColor : stroke);
    ctx.fillText(labelText, lx, ly);
  }
  ctx.restore();
}

function drawLabel(ctx, text, x, y, options) {
  const cfg = options || {};
  ctx.save();
  ctx.font = cfg.font || '12px Inter, sans-serif';
  ctx.fillStyle = cfg.color || ((core.COLORS && core.COLORS.label) || '#495057');
  ctx.textAlign = cfg.align || 'left';
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawMeter(ctx, x, y, width, value, options) {
  const cfg = options || {};
  const ratio = Math.max(0, Math.min(1, value));
  ctx.save();
  ctx.fillStyle = cfg.track || '#e9ecef';
  ctx.fillRect(x, y, width, cfg.height || 8);
  ctx.fillStyle = cfg.fill || ((core.COLORS && core.COLORS.velocity) || '#0d6efd');
  ctx.fillRect(x, y, width * ratio, cfg.height || 8);
  ctx.restore();
}

window.SimRender = {
  clearCanvas: core.clearCanvas,
  drawArrow: core.drawArrow,
  drawAxes: core.drawAxes,
  drawPolyline: core.drawPolyline,
  drawGrid,
  drawThemeGrid,
  drawDragHandle,
  drawTrail,
  drawAngleArc,
  drawDeCuongArrow,
  drawDashed,
  drawHandle,
  drawLabel,
  drawMeter
};

})();
