/**
 * Route renderers for Ch2 relative motion and velocity composition routes.
 * ch2-4-1: Velocity composition v_a = v_e + v_r
 * ch2-4-2: Absolute/relative/transport velocity definitions
 * ch2-4-3: Velocity triangle construction
 * ch2-4-4: Coriolis acceleration a_c = 2 omega x v_r
 */
(function() {
'use strict';

const registry = window.SimRouteRenderers;
const P = window.SimRouteRendererPrimitives;
if (!registry || !P) return;

// ─── ch2-4-1: Velocity Composition ─────────────────────────────────────────

function renderCh241VelocityComposition(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Hợp chuyển động: v_a = v_e + v_r', P.tone(1));
  const ox = 140, oy = 248, scale = 1.8;
  P.neonArrow(ctx, 80, 248, 450, 248, P.tone(6), 'x');
  P.neonArrow(ctx, 140, 300, 140, 90, P.tone(6), 'y');

  const ve = state.ve || { vx: 60, vy: -30 };
  const vr = state.vr || { vx: 40, vy: 40 };
  const ex2 = ox + ve.vx * scale, ey2 = oy + ve.vy * scale;
  const va = state.va || { vx: ve.vx + vr.vx, vy: ve.vy + vr.vy };
  const rx = ox + va.vx * scale, ry = oy + va.vy * scale;

  // Shaded composition parallelogram/triangle
  P.vectorTriangle(ctx, ox, oy, ex2, ey2, rx, ry, P.tone(4), 0.1);

  P.neonArrow(ctx, ox, oy, ex2, ey2, P.tone(1), 'v_e');
  P.neonArrow(ctx, ex2, ey2, rx, ry, P.tone(3), 'v_r');
  P.neonArrow(ctx, ox, oy, rx, ry, P.tone(0), 'v_a');

  P.dashedLine(ctx, ex2, ey2, rx, ry, P.tone(3));
  P.dashedLine(ctx, ox, oy, rx, ry, P.tone(6));
  P.realisticPoint(ctx, ox, oy, { text: 'O', fill: P.tone(4) });
  P.domMath(ctx, 'va-magnitude', 380, 60, `v_a=${Math.hypot(va.vx, va.vy).toFixed(1)}`, { color: P.tone(0) });
}

// ─── ch2-4-2: Absolute / Relative / Transport ─────────────────────────────

function renderCh242AbsoluteRelativeTransport(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Ba loại vận tốc: tuyệt đối, kéo theo, tương đối', P.tone(3));
  const scale = 1.8;
  const va = state.va || { vx: 55, vy: 0 };
  const ve = state.ve || { vx: 30, vy: 0 };
  const vr = state.vr || { vx: va.vx - ve.vx, vy: va.vy - ve.vy };
  P.panel(ctx, 72, 76, 130, 154, 'tuyệt đối v_a', P.tone(0));
  P.neonArrow(ctx, 92, 170, 92 + va.vx * scale, 170 + va.vy * scale, P.tone(0), 'v_a');
  P.panel(ctx, 222, 76, 130, 154, 'kéo theo v_e', P.tone(1));
  P.neonArrow(ctx, 242, 170, 242 + ve.vx * scale, 170 + ve.vy * scale, P.tone(1), 'v_e');
  P.panel(ctx, 372, 76, 130, 154, 'tương đối v_r', P.tone(3));
  P.neonArrow(ctx, 392, 170, 392 + vr.vx * scale, 170 + vr.vy * scale, P.tone(3), 'v_r');
  P.domMath(ctx, 'velocity-eq', 360, 290, `v_a=v_e+v_r`, { color: P.tone(3) });
}

// ─── ch2-4-3: Velocity Triangle ─────────────────────────────────────────────

function renderCh243VelocityTriangle(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Tam giác vận tốc: v_a = v_e + v_r', P.tone(2));
  const ox = 160, oy = 258, scale = 1.5;
  const ve = state.ve || { vx: 60, vy: 0 };
  const vr = state.vr || { vx: 0, vy: 40 };
  const ex2 = ox + ve.vx * scale, ey2 = oy + ve.vy * scale;
  const va = state.va || { vx: ve.vx + vr.vx, vy: ve.vy + vr.vy };
  const rx = ox + va.vx * scale, ry = oy + va.vy * scale;

  P.vectorTriangle(ctx, ox, oy, ex2, ey2, rx, ry, P.tone(2), 0.15);

  P.neonArrow(ctx, ox, oy, ex2, ey2, P.tone(1), 'v_e');
  P.neonArrow(ctx, ex2, ey2, rx, ry, P.tone(3), 'v_r');
  P.neonArrow(ctx, ox, oy, rx, ry, P.tone(0), 'v_a');

  P.realisticPoint(ctx, ox, oy, { text: 'A', fill: P.tone(4) });
  P.realisticPoint(ctx, ex2, ey2, { text: 'B', fill: P.tone(4) });
  P.realisticPoint(ctx, rx, ry, { text: 'C', fill: P.tone(4) });

  P.domMath(ctx, 'triangle-va', 360, 64, `v_a=${Math.hypot(va.vx, va.vy).toFixed(1)}`, { color: P.tone(0) });
  P.domMath(ctx, 'triangle-ve', 360, 82, `v_e=${Math.hypot(ve.vx, ve.vy).toFixed(1)}`, { color: P.tone(1) });
}

// ─── ch2-4-4: Coriolis Acceleration ────────────────────────────────────────

function renderCh244CoriolisAcceleration(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Gia tốc Coriolis: a_c = 2ω × v_r', P.tone(4));
  const cx = 280, cy = 180, theta = state.theta || 0, omega = state.omega || 1.0, r = 80;
  const px = state.px || (cx + r), py = state.py || cy;
  const vrx = state.vrx || (30 * Math.cos(theta)), vry = state.vry || (30 * Math.sin(theta));
  ctx.strokeStyle = P.tone(5); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, 120, 0, Math.PI * 2); ctx.stroke();
  P.dashedLine(ctx, cx, cy, px, py, P.tone(6));
  ctx.fillStyle = P.tone(3); ctx.font = '16px monospace'; ctx.fillText('ω ⊗', cx - 14, cy + 5);
  P.realisticPoint(ctx, px, py, { text: 'P', fill: P.tone(0) });
  P.neonArrow(ctx, px, py, px + vrx * 2.5, py + vry * 2.5, P.tone(1), 'v_r');
  P.neonArrow(ctx, px, py, px - (px - cx) / 10, py - (py - cy) / 10, P.tone(2), 'a_e');
  P.neonArrow(ctx, px, py, px + (-2 * omega * vry) * 2, py + (2 * omega * vrx) * 2, P.tone(0), 'a_c');
  const coriolis = state.coriolis || (2 * omega * Math.hypot(vrx, vry));
  P.domMath(ctx, 'coriolis-value', 380, 56, `a_c=${coriolis.toFixed(1)}`, { color: P.tone(0) });
}

// ─── Registry ───────────────────────────────────────────────────────────────

registry.register('ch2-4-1', 'ch2-4-1-velocity-composition-renderer', renderCh241VelocityComposition);
registry.register('ch2-4-2', 'ch2-4-2-absolute-relative-transport-renderer', renderCh242AbsoluteRelativeTransport);
registry.register('ch2-4-3', 'ch2-4-3-velocity-triangle-renderer', renderCh243VelocityTriangle);
registry.register('ch2-4-4', 'ch2-4-4-coriolis-acceleration-renderer', renderCh244CoriolisAcceleration);

})();
