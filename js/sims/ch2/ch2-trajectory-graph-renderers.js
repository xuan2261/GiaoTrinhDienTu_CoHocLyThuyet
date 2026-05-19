/**
 * DeCuong-style renderers for Ch2 particle trajectory routes.
 */
(function() {
'use strict';

const registry = window.SimRouteRenderers;
const P = window.SimRouteRendererPrimitives;
const R = window.SimRender || {};
if (!registry || !P) return;

function pathPoint(mode, t) {
  const u = (t % (Math.PI * 2)) / (Math.PI * 2);
  if (mode === 'Tròn') return { x: 350 + 104 * Math.cos(t), y: 224 - 104 * Math.sin(t) };
  if (mode === 'Parabol') return { x: 142 + 374 * u, y: 326 - 286 * u + 238 * u * u };
  if (mode === 'Elip') return { x: 350 + 142 * Math.cos(t), y: 224 - 92 * Math.sin(t) };
  return { x: 142 + 374 * u, y: 304 - 72 * u };
}

function drawTrajectory(ctx, mode, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.setLineDash([5, 3]);
  ctx.beginPath();
  for (let i = 0; i <= 150; i++) {
    const p = pathPoint(mode, i / 150 * Math.PI * 2);
    if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
  ctx.restore();
}

function miniPoint(mode, t, box) {
  const u = (t % (Math.PI * 2)) / (Math.PI * 2);
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  if (mode === 'Tròn') return { x: cx + box.w * 0.28 * Math.cos(t), y: cy - box.h * 0.36 * Math.sin(t) };
  if (mode === 'Elip') return { x: cx + box.w * 0.36 * Math.cos(t), y: cy - box.h * 0.28 * Math.sin(t) };
  return { x: box.x + box.w * (0.1 + 0.8 * u), y: box.y + box.h * (0.78 - 0.58 * u + 0.42 * u * u) };
}

function drawMiniTrajectory(ctx, mode, box, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 3]);
  ctx.beginPath();
  for (let i = 0; i <= 80; i++) {
    const p = miniPoint(mode, i / 80 * Math.PI * 2, box);
    if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
  ctx.restore();
}

function arrow(ctx, x, y, vx, vy, color, label, scale) {
  if (Math.hypot(vx, vy) < 0.5) return;
  const s = scale || 1;
  const ex = Math.max(42, Math.min(718, x + vx * s));
  const ey = Math.max(60, Math.min(382, y - vy * s));
  if (R.drawDeCuongArrow) R.drawDeCuongArrow(ctx, x, y, ex, ey, color, 3, 14);
  else P.arrow(ctx, x, y, ex, ey, color, label);
  P.label(ctx, label, Math.max(42, Math.min(708, ex + 8)), Math.max(60, Math.min(382, ey - 6)), 12, color);
}

function drawParticle(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// Phase 08 RC2: fading trailBuffer renderer for ch2-1-1. The ring buffer is
// pushed by ch2-kinematics-behaviors-a; alpha decays linearly oldest→newest.
function drawTrailFromBuffer(ctx, buffer, dark) {
  if (!Array.isArray(buffer) || buffer.length < 2) return;
  ctx.save();
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  for (let i = 1; i < buffer.length; i++) {
    const a = buffer[i - 1], b = buffer[i];
    if (!a || !b) continue;
    const alpha = (i / buffer.length) * 0.55;
    ctx.strokeStyle = dark
      ? `rgba(231, 76, 60, ${alpha.toFixed(3)})`
      : `rgba(192, 57, 43, ${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.restore();
}

function renderCh211Trajectory(ctx, scene, state) {
  const mode = state.mode || 'Elip';
  const dark = P.isDarkTheme();
  P.frame(ctx, scene, 'Quỹ đạo chất điểm: v, aτ, an', '#e74c3c');
  drawTrajectory(ctx, mode, dark ? 'rgba(255,255,255,.15)' : 'rgba(0,0,0,.12)');
  drawTrailFromBuffer(ctx, state.trailBuffer, dark);
  const x = state.currentX || 500, y = state.currentY || 220;
  drawParticle(ctx, x, y);
  arrow(ctx, x, y, state.vx || 0, state.vy || 0, '#e74c3c', 'v', 0.6);
  arrow(ctx, x, y, state.atx || 0, state.aty || 0, '#e67e22', 'aτ', 0.15);
  arrow(ctx, x, y, state.anx || 0, state.any || 0, '#2980b9', 'an', 0.15);
  P.domMath(ctx, 'particle-a', 520, 74, '\\vec{a}=a_\\tau\\vec{\\tau}+a_n\\vec{n}', { color: '#e67e22' });
  P.domMath(ctx, 'particle-rho', 520, 104, 'a_n=\\frac{v^2}{\\rho}', { color: '#2980b9' });
  P.domLabel(ctx, 'particle-mode', 46, 386, `${mode} | t=${(state.t || 0).toFixed(2)}s`, { color: P.tone(6) });
}

function graphValue(kind, t) {
  if (kind === 'x') return 54 * Math.sin(t);
  if (kind === 'v') return 54 * Math.cos(t);
  return -54 * Math.sin(t);
}

function drawGraph(ctx, x, y, w, h, label, tone, t) {
  const zero = y + h / 2;
  ctx.strokeStyle = P.tone(6); ctx.lineWidth = 1.2;
  ctx.strokeRect(x, y, w, h);
  P.line(ctx, x, zero, x + w, zero, P.tone(6), 1);
  ctx.strokeStyle = P.tone(tone); ctx.lineWidth = 2.6;
  ctx.beginPath();
  for (let i = 0; i <= w; i += 4) {
    const py = zero - graphValue(label, i / w * Math.PI * 2);
    if (i === 0) ctx.moveTo(x + i, py); else ctx.lineTo(x + i, py);
  }
  ctx.stroke();
  const cx = x + ((t % (Math.PI * 2)) / (Math.PI * 2)) * w;
  P.dashedLine(ctx, cx, y, cx, y + h, P.tone(4));
  P.point(ctx, cx, zero - graphValue(label, t), P.tone(tone), label);
}

function renderCh212MotionGraphs(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Đồ thị x(t), v(t), a(t) có con trỏ kéo', P.tone(3));
  const t = state.t || 0;
  drawGraph(ctx, 56, 86, 290, 88, 'x', 0, t);
  drawGraph(ctx, 398, 86, 290, 88, 'v', 1, t);
  drawGraph(ctx, 56, 238, 290, 88, 'a', 2, t);
  if (state.diagnostics && (state.diagnostics.graph || state.diagnostics.components)) {
    const values = d && d.invariant && d.invariant.values || {};
    const cx = 56 + ((t % (Math.PI * 2)) / (Math.PI * 2)) * 290;
    const xVal = Number.isFinite(Number(values.x)) ? Number(values.x) : (state.xVal || 0);
    const vVal = Number.isFinite(Number(values.v)) ? Number(values.v) : (state.vVal || 0);
    const aVal = Number.isFinite(Number(values.a)) ? Number(values.a) : (state.aVal || 0);
    const cy = 130 - xVal;
    const slope = vVal / 54;
    P.dashedLine(ctx, cx - 48, cy + slope * 48, cx + 48, cy - slope * 48, P.tone(4));
    P.domLabel(ctx, 'graph-diagnostic', 420, 328,
      `tangent: v=${vVal.toFixed(1)}, a=${aVal.toFixed(1)}`,
      { color: P.tone(4), width: 250 });
  }
  P.domMath(ctx, 'graph-katex', 420, 258, 'v=\\dot{x},\\quad a=\\ddot{x}', { color: P.tone(3) });
  P.domLabel(ctx, 'graph-values', 420, 302,
    `x=${(state.xVal || 0).toFixed(1)} | v=${(state.vVal || 0).toFixed(1)} | a=${(state.aVal || 0).toFixed(1)}`,
    { color: P.tone(6), width: 260 });
}

function renderCh213NaturalCoords(ctx, scene, state) {
  P.frame(ctx, scene, 'Tọa độ tự nhiên: τ, n và bán kính cong ρ', P.tone(2));
  const cx = 350, cy = 224, r = 104;
  const t = state.t || 0, px = state.px || cx + r, py = state.py || cy;
  ctx.strokeStyle = P.tone(2); ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  P.point(ctx, cx, cy, P.tone(4), 'C');
  P.dashedLine(ctx, cx, cy, px, py, P.tone(6));
  P.dimension(ctx, cx, cy, px, py, P.tone(6), 'ρ');
  P.point(ctx, px, py, P.tone(0), 'P');
  arrow(ctx, px, py, -Math.sin(t) * 70, -Math.cos(t) * 70, '#e74c3c', 'τ', 1);
  arrow(ctx, px, py, (cx - px) / r * 72, (py - cy) / r * 72, '#2980b9', 'n', 1);
  P.domMath(ctx, 'natural-v', 494, 82, '\\vec{v}=v\\vec{\\tau}', { color: '#e74c3c' });
  P.domMath(ctx, 'natural-a', 494, 112, '\\vec{a}=\\dot{v}\\vec{\\tau}+\\frac{v^2}{\\rho}\\vec{n}', { color: '#2980b9' });
}

function renderCh214MotionPresets(ctx, scene, state) {
  const mode = state.mode || 'Elip';
  P.frame(ctx, scene, `Preset chuyển động: ${mode}`, P.tone(4));
  ['Tròn', 'Elip', 'Parabol'].forEach((name, idx) => {
    const x = 70 + idx * 210;
    P.panel(ctx, x, 82, 160, 230, name, P.tone(idx));
    drawMiniTrajectory(ctx, name, { x: x + 16, y: 132, w: 128, h: 132 }, P.tone(idx));
    const mini = miniPoint(name, state.t || 0, { x: x + 16, y: 132, w: 128, h: 132 });
    P.point(ctx, mini.x, mini.y, P.tone(0), '');
  });
  P.domLabel(ctx, 'preset-active', 86, 334, `đang chọn: ${mode}`, { color: P.tone(4) });
  P.domMath(ctx, 'preset-katex', 488, 348, '\\vec{r}=\\vec{r}(t),\\quad v=\\left|\\dot{\\vec{r}}\\right|', { color: P.tone(4) });
}

registry.register('ch2-1-1', 'ch2-1-1-decuong-particle-renderer', renderCh211Trajectory);
registry.register('ch2-1-2', 'ch2-1-2-graph-cursor-renderer', renderCh212MotionGraphs);
registry.register('ch2-1-3', 'ch2-1-3-natural-coordinates-renderer', renderCh213NaturalCoords);
registry.register('ch2-1-4', 'ch2-1-4-motion-preset-renderer', renderCh214MotionPresets);

})();
