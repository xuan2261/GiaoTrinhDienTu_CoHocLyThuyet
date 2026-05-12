/**
 * Route renderers for Ch2 plane motion and checker routes.
 */
(function() {
'use strict';

const registry = window.SimRouteRenderers;
const P = window.SimRouteRendererPrimitives;
if (!registry || !P) return;

function renderCh251PlaneRigidBody(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Chuyển động phẳng: tịnh tiến cộng quay', P.tone(1));
  P.body(ctx, 166, 146, 202, 58, 'rgba(13,110,253,.12)', P.tone(1), 'vật rắn');
  P.point(ctx, 196, 175, P.tone(4), 'A');
  P.point(ctx, 338, 175, P.tone(4), 'B');
  P.arrow(ctx, 196, 175, 270, 132, P.tone(1), 'vA');
  P.arrow(ctx, 338, 175, 426, 120, P.tone(0), 'vB');
  P.angleArc(ctx, 266, 175, 48, 0.1, 1.6, P.tone(6), 'ω');
  P.domMath(ctx, 'plane-vb', 378, 276, `v_B=${d.force.toFixed(1)}`, { color: P.tone(1) });
}

function renderCh252InstantCenterFinder(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Tâm vận tốc tức thời: vận tốc vuông góc bán kính', P.tone(3));
  P.point(ctx, state.primary.x, state.primary.y, P.tone(0), 'IC');
  P.body(ctx, 170, 130, 196, 54, 'rgba(253,126,20,.12)', P.tone(3), 'thanh');
  P.point(ctx, 190, 157, P.tone(4), 'A');
  P.point(ctx, 346, 157, P.tone(4), 'B');
  P.dashedLine(ctx, state.primary.x, state.primary.y, 190, 157, P.tone(6));
  P.dashedLine(ctx, state.primary.x, state.primary.y, 346, 157, P.tone(6));
  P.arrow(ctx, 190, 157, 190, 98, P.tone(1), 'vA');
  P.arrow(ctx, 346, 157, 402, 157, P.tone(2), 'vB');
  P.domMath(ctx, 'instant-omega', 388, 282, `\\omega=${state.omega.toFixed(2)}`, { color: P.tone(3) });
}

function renderCh253VelocityDistribution(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Phân bố vận tốc dọc thanh cứng', P.tone(2));
  ctx.strokeStyle = P.tone(2);
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(118, 238);
  ctx.lineTo(440, 126);
  ctx.stroke();
  for (let i = 0; i < 5; i += 1) {
    const x = 142 + i * 66, y = 230 - i * 23;
    P.point(ctx, x, y, P.tone(i), `P${i}`);
    P.arrow(ctx, x, y, x + 16 + i * 12, y - 58 + i * 8, P.tone(i), 'v');
  }
  P.panel(ctx, 336, 238, 130, 54, 'tỉ lệ theo bán kính', P.tone(2));
  P.domMath(ctx, 'velocity-radius', 352, 250, `v\\propto r_{IC}`, { color: P.tone(2) });
}

function renderCh271KinematicsGuidedChecker(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Kiểm tra động học: x(t) đến v(t) đến a(t)', P.tone(4));
  ['x(t)', 'v(t)', 'a(t)', 'đơn vị'].forEach((text, index) => {
    P.panel(ctx, 58 + index * 118, 92, 98, 140, text, P.tone(index));
    drawMiniCurve(ctx, 78 + index * 118, 190, index);
  });
  P.domMath(ctx, 'kinematic-step-time', 348, 282, `t=${state.t.toFixed(1)}`, { color: P.tone(4) });
}

function renderCh272KinematicsNumericChecker(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Kiểm tra số: xác nhận x, v, a', P.tone(6));
  P.panel(ctx, 80, 84, 402, 174, 'bảng số liệu', P.tone(6));
  ['t nhập', 'x dự kiến', 'v dự kiến', 'a dự kiến', 'sai số'].forEach((text, index) => {
    P.label(ctx, text, 112, 126 + index * 28, 12, P.tone(index));
    P.domMath(ctx, `kinematic-number-${index}`, 306, 116 + index * 28, `${(d.force / (index + 2)).toFixed(2)}`, { color: P.tone(index) });
  });
  P.arrow(ctx, 110, 282, 448, 282, P.tone(6), 'con trỏ t');
}

function drawMiniCurve(ctx, x, y, index) {
  ctx.strokeStyle = P.tone(index);
  ctx.beginPath();
  for (let i = 0; i <= 58; i += 6) {
    const px = x + i, py = y - 18 * Math.sin(i / (12 + index * 3)) - index * 5;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();
}

// Legacy draft renderers retained for reference. Canonical Ch2 registrations
// live in ch2-instant-center-plane-motion-renderers.js and
// ch2-kinematics-exercises-renderers.js.

})();
