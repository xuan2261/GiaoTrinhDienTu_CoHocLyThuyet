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

function vec(value, fallback) {
  return value && typeof value === 'object' ? value : fallback;
}

function mag(vector) {
  return Math.hypot(vector.vx || 0, vector.vy || 0);
}

function tip(origin, vector, scale) {
  return { x: origin.x + (vector.vx || 0) * scale, y: origin.y + (vector.vy || 0) * scale };
}

function drawFrameAxes(ctx, ox, oy) {
  P.neonArrow(ctx, ox - 58, oy, ox + 330, oy, P.tone(6), 'x');
  P.neonArrow(ctx, ox, oy + 60, ox, oy - 174, P.tone(6), 'y');
}

function renderCh241VelocityComposition(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Hợp chuyển động: vận tốc tuyệt đối = kéo theo + tương đối', P.tone(1));
  const ox = 140, oy = 248, scale = 1.8;
  const origin = { x: ox, y: oy };
  const ve = vec(state.ve, { vx: 60, vy: -30 });
  const vr = vec(state.vr, { vx: 40, vy: 40 });
  const va = vec(state.va, { vx: ve.vx + vr.vx, vy: ve.vy + vr.vy });
  const e = tip(origin, ve, scale);
  const a = tip(origin, va, scale);
  drawFrameAxes(ctx, ox, oy);
  P.vectorTriangle(ctx, ox, oy, e.x, e.y, a.x, a.y, P.tone(4), 0.12);
  P.dashedLine(ctx, e.x, e.y, a.x, a.y, P.tone(3));
  P.neonArrow(ctx, ox, oy, e.x, e.y, P.tone(1), 'v_e');
  P.neonArrow(ctx, e.x, e.y, a.x, a.y, P.tone(3), 'v_r');
  P.neonArrow(ctx, ox, oy, a.x, a.y, P.tone(0), 'v_a');
  P.realisticPoint(ctx, ox, oy, { text: 'O', fill: P.tone(4) });
  P.realisticPoint(ctx, a.x, a.y, { text: 'M', fill: P.tone(0) });
  P.domMath(ctx, 'velocity-composition-eq', 380, 62, `\\vec{v}_a=\\vec{v}_e+\\vec{v}_r`, { color: P.tone(0) });
  P.domMath(ctx, 'velocity-composition-value', 380, 84, `|v_a|=${mag(va).toFixed(1)}`, { color: P.tone(0) });
}

function renderCh242AbsoluteRelativeTransport(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Tuyệt đối - kéo theo - tương đối', P.tone(3));
  const scale = 1.8;
  const va = vec(state.va, { vx: 55, vy: 0 });
  const ve = vec(state.ve, { vx: 30, vy: 0 });
  const vr = vec(state.vr, { vx: va.vx - ve.vx, vy: va.vy - ve.vy });
  const panels = [
    { x: 72, label: 'tuyệt đối', vector: va, color: P.tone(0), tag: 'v_a' },
    { x: 262, label: 'kéo theo', vector: ve, color: P.tone(1), tag: 'v_e' },
    { x: 452, label: 'tương đối', vector: vr, color: P.tone(3), tag: 'v_r' }
  ];
  panels.forEach(item => {
    const origin = { x: item.x + 24, y: 178 };
    const end = tip(origin, item.vector, scale);
    P.panel(ctx, item.x, 82, 154, 152, `${item.label} ${item.tag}`, item.color);
    P.neonArrow(ctx, origin.x, origin.y, end.x, end.y, item.color, item.tag);
    P.domMath(ctx, `${item.tag}-mag`, item.x + 16, 248, `|${item.tag}|=${mag(item.vector).toFixed(1)}`, { color: item.color });
  });
  P.domMath(ctx, 'velocity-definition-eq', 318, 310, `\\vec{v}_a=\\vec{v}_e+\\vec{v}_r`, { color: P.tone(3) });
}

function renderCh243VelocityTriangle(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Tam giác vận tốc: v_a = v_e + v_r', P.tone(2));
  const ox = 160, oy = 258, scale = 1.5;
  const ve = vec(state.ve, { vx: 60, vy: 0 });
  const vr = vec(state.vr, { vx: 0, vy: 40 });
  const va = vec(state.va, { vx: ve.vx + vr.vx, vy: ve.vy + vr.vy });
  const e = tip({ x: ox, y: oy }, ve, scale);
  const a = tip({ x: ox, y: oy }, va, scale);
  P.vectorTriangle(ctx, ox, oy, e.x, e.y, a.x, a.y, P.tone(2), 0.15);
  P.neonArrow(ctx, ox, oy, e.x, e.y, P.tone(1), 'v_e');
  P.neonArrow(ctx, e.x, e.y, a.x, a.y, P.tone(3), 'v_r');
  P.neonArrow(ctx, ox, oy, a.x, a.y, P.tone(0), 'v_a');
  P.realisticPoint(ctx, ox, oy, { text: 'A', fill: P.tone(4) });
  P.realisticPoint(ctx, e.x, e.y, { text: 'B', fill: P.tone(4) });
  P.realisticPoint(ctx, a.x, a.y, { text: 'C', fill: P.tone(4) });
  P.domMath(ctx, 'triangle-eq', 380, 64, `\\vec{v}_a=\\vec{v}_e+\\vec{v}_r`, { color: P.tone(0) });
  P.domMath(ctx, 'triangle-values', 380, 86, `|v_a|=${mag(va).toFixed(1)};\\ |v_r|=${mag(vr).toFixed(1)}`, { color: P.tone(1) });
}

function renderCh244CoriolisAcceleration(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Gia tốc Coriolis trong hệ quay', P.tone(4));
  const cx = 280, cy = 180, theta = state.theta || 0, omega = state.omega || 1.0, r = 80;
  const px = state.px || (cx + r), py = state.py || cy;
  const vr = vec(state.vr, { vx: state.vrx || (30 * Math.cos(theta)), vy: state.vry || (30 * Math.sin(theta)) });
  const ac = vec(state.ac, { vx: -2 * omega * vr.vy, vy: 2 * omega * vr.vx });
  ctx.strokeStyle = P.tone(5); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, 120, 0, Math.PI * 2); ctx.stroke();
  P.dashedLine(ctx, cx, cy, px, py, P.tone(6));
  ctx.fillStyle = P.tone(3); ctx.font = '16px monospace'; ctx.fillText('ω ⊗', cx - 14, cy + 5);
  P.realisticPoint(ctx, px, py, { text: 'P', fill: P.tone(0) });
  P.neonArrow(ctx, px, py, px + vr.vx * 2.5, py + vr.vy * 2.5, P.tone(1), 'v_r');
  P.neonArrow(ctx, px, py, px - (px - cx) / 10, py - (py - cy) / 10, P.tone(2), 'a_e');
  P.neonArrow(ctx, px, py, px + ac.vx * 2, py + ac.vy * 2, P.tone(0), 'a_c');
  P.domMath(ctx, 'coriolis-eq', 380, 56, `\\vec{a}_c=2\\vec{\\omega}\\times\\vec{v}_r`, { color: P.tone(0) });
  P.domMath(ctx, 'coriolis-value', 380, 78, `|a_c|=${(state.coriolis || mag(ac)).toFixed(1)}`, { color: P.tone(0) });
}

// ─── Registry ───────────────────────────────────────────────────────────────

registry.register('ch2-4-1', 'ch2-4-1-velocity-composition-renderer', renderCh241VelocityComposition);
registry.register('ch2-4-2', 'ch2-4-2-absolute-relative-transport-renderer', renderCh242AbsoluteRelativeTransport);
registry.register('ch2-4-3', 'ch2-4-3-velocity-triangle-renderer', renderCh243VelocityTriangle);
registry.register('ch2-4-4', 'ch2-4-4-coriolis-acceleration-renderer', renderCh244CoriolisAcceleration);

})();
