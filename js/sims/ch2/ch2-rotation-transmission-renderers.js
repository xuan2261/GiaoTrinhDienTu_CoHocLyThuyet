/**
 * Route renderers for Ch2 rotation and transmission.
 */
(function() {
'use strict';

const registry = window.SimRouteRenderers;
const P = window.SimRouteRendererPrimitives;
if (!registry || !P) return;

function renderCh222FixedAxisRotation(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Quay quanh trục cố định: v, at, an trên đĩa', P.tone(1));
  ctx.strokeStyle = P.tone(1);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(266, 170, 86, 0, Math.PI * 2);
  ctx.stroke();
  P.point(ctx, 266, 170, P.tone(4), 'O');
  P.point(ctx, 334, 118, P.tone(0), 'P');
  P.arrow(ctx, 334, 118, 386, 188, P.tone(1), 'v');
  P.arrow(ctx, 334, 118, 286, 154, P.tone(2), 'an');
  P.arrow(ctx, 334, 118, 368, 86, P.tone(3), 'at');
  P.angleArc(ctx, 266, 170, 44, -0.7, 0.9, P.tone(6), 'θ');
  P.domMath(ctx, 'omega-value', 374, 282, `\\omega=${state.omega.toFixed(2)}`, { color: P.tone(1) });
}

function renderCh232GearBeltTransmission(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Truyền động bánh/dây: tỉ số không trượt', P.tone(6));
  const r1 = 50 + state.radius * 0.15;
  const r2 = 92 - state.radius * 0.2;
  ctx.strokeStyle = P.tone(0);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(190, 174, r1, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = P.tone(1);
  ctx.beginPath();
  ctx.arc(370, 174, r2, 0, Math.PI * 2);
  ctx.stroke();
  P.dashedLine(ctx, 190, 174 - r1, 370, 174 - r2, P.tone(6));
  P.dashedLine(ctx, 190, 174 + r1, 370, 174 + r2, P.tone(6));
  P.arrow(ctx, 190, 174, 190 + r1, 144, P.tone(0), 'ω1');
  P.arrow(ctx, 370, 174, 370 - r2, 208, P.tone(1), 'ω2');
  P.panel(ctx, 222, 260, 154, 46, 'quan hệ truyền động', P.tone(6));
  P.domMath(ctx, 'no-slip-ratio', 230, 264, `\\omega_1 r_1=\\omega_2 r_2`, { color: P.tone(6) });
  P.domMath(ctx, 'transmission-ratio', 244, 292, `i=${d.transmission.toFixed(2)}`, { color: P.tone(6) });
}

// Legacy draft renderers retained for reference. Canonical Ch2 registrations
// live in ch2-rotation-gear-renderers.js.

})();
