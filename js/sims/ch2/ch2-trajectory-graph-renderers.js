/**
 * Route renderers for Ch2 trajectory, graph, and motion preset routes.
 * ch2-1-1: Ellipse trajectory with trail + velocity vector
 * ch2-1-2: x(t), v(t), a(t) graphs with time cursor
 * ch2-1-3: Natural coordinates: tangent, normal, radius of curvature
 * ch2-1-4: Motion presets: đều, biến đổi đều, bài tập
 */
(function() {
'use strict';

const registry = window.SimRouteRenderers;
const P = window.SimRouteRendererPrimitives;
if (!registry || !P) return;

// ─── ch2-1-1: Ellipse Trajectory ─────────────────────────────────────────────

function renderCh211Trajectory(ctx, scene, state, d) {
  const mode = state.mode || 'Elip';
  P.frame(ctx, scene, `Quỹ đạo ${mode.toLowerCase()} + vận tốc tức thời`, P.tone(1));
  P.realisticGround(ctx, 50, 295, 510, { material: 'concrete' });

  // Draw selected path
  ctx.save();
  ctx.strokeStyle = P.tone(6);
  ctx.lineWidth = 1.2;
  ctx.setLineDash([6, 4]);
  if (mode === 'Tròn') {
    ctx.beginPath(); ctx.arc(280, 170, 100, 0, Math.PI * 2);
  } else if (mode === 'Parabol') {
    ctx.beginPath();
    for (let i = 0; i <= 72; i += 1) {
      const u = i / 72;
      const x = 90 + 360 * u;
      const y = 278 - 310 * u + 260 * u * u;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
  } else {
    ctx.beginPath(); ctx.ellipse(280, 170, 150, 100, 0, 0, Math.PI * 2);
  }
  ctx.stroke();
  ctx.restore();

  // Trail
  const trail = state.trail || [];
  ctx.save();
  for (let i = 1; i < trail.length; i++) {
    const alpha = (i / trail.length) * 0.5;
    ctx.strokeStyle = P.isDarkTheme() ? `rgba(41,128,185,${alpha})` : `rgba(41,128,185,${alpha})`;
    ctx.lineWidth = 1 + 1.5 * (i / trail.length);
    ctx.beginPath(); ctx.moveTo(trail[i - 1].x, trail[i - 1].y); ctx.lineTo(trail[i].x, trail[i].y); ctx.stroke();
  }
  ctx.restore();

  const cx = state.currentX || 280;
  const cy = state.currentY || 170;
  P.realisticPoint(ctx, cx, cy, { text: 'M', fill: P.tone(0), radius: 6 });

  if (state.vx != null) {
    const vx = state.vx || 0, vy = state.vy || 0, vScale = 0.3;
    P.neonArrow(ctx, cx, cy, cx + vx * vScale, cy - vy * vScale, P.tone(1), 'v');
  }

  if (state.vx != null) {
    const ax = -(cx - 280) / 8, ay = -(cy - 170) / 8;
    P.neonArrow(ctx, cx, cy, cx + ax, cy + ay, P.tone(2), 'a');
  }
  P.domMath(ctx, 'trajectory-speed', 390, 62, `v=${(state.speed || 0).toFixed(1)}`, { color: P.tone(1) });
  P.domMath(ctx, 'trajectory-theta', 390, 82, `t=${(state.t || 0).toFixed(2)}`, { color: P.tone(6) });
}

// ─── ch2-1-2: Motion Graphs ───────────────────────────────────────────────────

function drawGraphPanel(ctx, ox, oy, w, h, yLabel, xMax, curveFn, cursorT, toneIdx) {
  // Mini Grid
  ctx.save();
  ctx.strokeStyle = P.isDarkTheme() ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)';
  ctx.lineWidth = 1;
  for (let gx = 0; gx <= w; gx += 40) {
    ctx.beginPath(); ctx.moveTo(ox + gx, oy); ctx.lineTo(ox + gx, oy - h); ctx.stroke();
  }
  for (let gy = 0; gy <= h; gy += 40) {
    ctx.beginPath(); ctx.moveTo(ox, oy - gy); ctx.lineTo(ox + w, oy - gy); ctx.stroke();
  }
  ctx.restore();

  // Axes
  P.neonArrow(ctx, ox, oy, ox + w + 10, oy, P.tone(6), '');
  P.neonArrow(ctx, ox, oy, ox, oy - h - 10, P.tone(6), '');
  P.label(ctx, yLabel, ox - 18, oy - h / 2, 11, P.tone(toneIdx));
  P.label(ctx, 't', ox + w + 12, oy + 5, 11, P.tone(6));

  // Curve
  ctx.strokeStyle = P.tone(toneIdx);
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i <= xMax; i += 4) {
    const px = ox + i, py = oy - curveFn(i / xMax);
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Cursor
  const ct = ((cursorT % (Math.PI * 2)) / (Math.PI * 2)) * xMax;
  const cy2 = oy - curveFn(ct / xMax);
  P.dashedLine(ctx, ox + ct, oy - h, ox + ct, oy, P.tone(4));
  P.realisticPoint(ctx, ox + ct, cy2, { fill: P.tone(0), radius: 4 });
}

function renderCh212MotionGraphs(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Đồ thị x(t), v(t), a(t) — con trỏ thời gian', P.tone(3));

  const t = state.t || 0;
  const xFn = (u) => 40 * Math.sin(u * Math.PI * 2) + 20;
  const vFn = (u) => 40 * Math.cos(u * Math.PI * 2);
  const aFn = (u) => 30 * (-Math.sin(u * Math.PI * 2));

  drawGraphPanel(ctx, 72, 150, 190, 80, 'x', 190, xFn, t, 0);
  drawGraphPanel(ctx, 310, 150, 190, 80, 'v', 190, vFn, t, 1);
  drawGraphPanel(ctx, 72, 290, 190, 80, 'a', 190, aFn, t, 2);

  P.domMath(ctx, 'graph-cursor-time', 400, 280, `t=${t.toFixed(2)}`, { color: P.tone(3) });
}

// ─── ch2-1-3: Natural Coordinates ─────────────────────────────────────────────

function renderCh213NaturalCoords(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Tọa độ tự nhiên: tiếp tuyến + pháp tuyến + bán kính cong', P.tone(2));

  const cx = 250, cy = 184, r = 96;
  const px = state.px || (cx + r);
  const py = state.py || cy;

  // Curve
  ctx.strokeStyle = P.tone(2);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0.1, 1.7 * Math.PI);
  ctx.stroke();

  // Point P
  P.point(ctx, px, py, P.tone(0), 'P');

  // Tangent (tau) — direction of velocity
  if (state.vx != null) {
    const vMag = Math.hypot(state.vx, state.vy);
    if (vMag > 0.01) {
      const tx = state.vx / vMag;
      const ty = -state.vy / vMag;
      P.arrow(ctx, px, py, px + tx * 60, py + ty * 60, P.tone(1), 'tau');
    }
  }

  // Normal (n) — inward toward center
  const nDirX = (cx - px) / r;
  const nDirY = (cy - py) / r;
  P.arrow(ctx, px, py, px + nDirX * 52, py + nDirY * 52, P.tone(2), 'n');

  // Center
  P.point(ctx, cx, cy, P.tone(4), 'C');

  // Radius of curvature (dashed)
  P.dashedLine(ctx, cx, cy, px, py, P.tone(6));

  // Dimension label
  P.dimension(ctx, cx, cy, px, py, P.tone(6), 'rho');

  // Acceleration components
  P.domMath(ctx, 'natural-an', 352, 268,
    `a_n=\\frac{v^2}{\\rho}=${(state.an || 0).toFixed(2)}`, { color: P.tone(2) });
  P.domMath(ctx, 'natural-curvature', 352, 288,
    `\\rho=${r}\\,\\mathrm{m}`, { color: P.tone(6) });
}

// ─── ch2-1-4: Motion Presets ─────────────────────────────────────────────────

function renderCh214MotionPresets(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Các dạng chuyển động: thẳng, tròn, parabol', P.tone(4));

  const modes = ['Thẳng', 'Tròn', 'Parabol'];
  modes.forEach((mode, idx) => {
    const x = 64 + idx * 156;
    P.panel(ctx, x, 76, 132, 178, mode, P.tone(idx));

    ctx.strokeStyle = P.tone(idx);
    ctx.lineWidth = 2;

    if (mode === 'Thẳng') {
      ctx.beginPath();
      ctx.moveTo(x + 20, 210);
      ctx.lineTo(x + 112, 130);
      ctx.stroke();
      const prog = ((state.t || 0) / (Math.PI * 2)) * 92;
      const ppx = x + 20 + prog;
      const ppy = 210 - prog * (80 / 92);
      P.point(ctx, ppx, ppy, P.tone(0), '');
    } else if (mode === 'Tròn') {
      ctx.beginPath();
      ctx.arc(x + 66, 168, 42, 0, Math.PI * 2);
      ctx.stroke();
      const angle = state.t || 0;
      const ppx = x + 66 + 42 * Math.cos(angle);
      const ppy = 168 - 42 * Math.sin(angle);
      P.point(ctx, ppx, ppy, P.tone(0), '');
    } else {
      for (let i = 0; i <= 80; i += 8) {
        const ppx = x + 18 + i;
        const ppy = 218 - i * 1.5 + (i * i) / 60;
        if (i === 0) ctx.moveTo(ppx, ppy); else ctx.lineTo(ppx, ppy);
      }
      ctx.stroke();
      const prog = ((state.t || 0) / (Math.PI * 2)) * 80;
      const ppx = x + 18 + prog;
      const ppy = 218 - prog * 1.5 + (prog * prog) / 60;
      P.point(ctx, ppx, ppy, P.tone(0), '');
    }
  });

  P.domLabel(ctx, 'active-preset', 430, 284,
    `đang chọn: ${state.mode || 'Thẳng'}`, { color: P.tone(4) });
}

// ─── Registry ──────────────────────────────────────────────────────────────────

registry.register('ch2-1-1', 'ch2-1-1-trajectory-renderer', renderCh211Trajectory);
registry.register('ch2-1-2', 'ch2-1-2-motion-graphs-renderer', renderCh212MotionGraphs);
registry.register('ch2-1-3', 'ch2-1-3-natural-coords-renderer', renderCh213NaturalCoords);
registry.register('ch2-1-4', 'ch2-1-4-motion-presets-renderer', renderCh214MotionPresets);

})();
