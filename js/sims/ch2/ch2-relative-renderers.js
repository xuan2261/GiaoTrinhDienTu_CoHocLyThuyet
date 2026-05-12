/**
 * Route renderers for Ch2 relative motion.
 */
(function() {
'use strict';

const registry = window.SimRouteRenderers;
const P = window.SimRouteRendererPrimitives;
if (!registry || !P) return;

function renderCh241MovingFrameScenario(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Hệ quy chiếu chuyển động: cơ sở cộng tọa độ tương đối', P.tone(1));
  P.panel(ctx, 82, 156, 184, 94, 'hệ e chuyển động', P.tone(1));
  P.arrow(ctx, 102, 236, 232, 236, P.tone(1), 've');
  P.point(ctx, 184, 186, P.tone(4), 'Oe');
  P.arrow(ctx, 184, 186, state.primary.x + 130, state.primary.y - 54, P.tone(0), 'rr');
  P.arrow(ctx, 102, 236, state.primary.x + 130, state.primary.y - 54, P.tone(2), 'r');
  P.domMath(ctx, 'moving-frame-time', 396, 74, `t=${state.t.toFixed(2)}`, { color: P.tone(1) });
}

function renderCh242MotionDefinitionToggle(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Tuyệt đối = kéo theo + tương đối', P.tone(3));
  ['tuyệt đối va', 'kéo theo ve', 'tương đối vr'].forEach((text, index) => {
    P.panel(ctx, 64 + index * 150, 84, 122, 170, text, P.tone(index));
    P.arrow(ctx, 92 + index * 150, 206, 154 + index * 150, 148 + index * 8, P.tone(index), text.slice(-2));
  });
  P.arrow(ctx, 154, 286, 304, 286, P.tone(6), '+');
  P.arrow(ctx, 304, 286, 454, 286, P.tone(6), '=');
  P.domMath(ctx, 'relative-phase', 382, 294, `t=${state.t.toFixed(1)}`, { color: P.tone(3) });
}

function renderCh243VelocityCompositionTriangle(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Tam giác vận tốc khép kín tổng véc tơ', P.tone(2));
  const ax = 150, ay = 248, bx = 280, by = 180, cx = 390, cy = 112;
  P.arrow(ctx, ax, ay, bx, by, P.tone(1), 'vrel');
  P.arrow(ctx, bx, by, cx, cy, P.tone(0), 'vtrans');
  P.arrow(ctx, ax, ay, cx, cy, P.tone(2), 'vabs');
  P.dashedLine(ctx, ax, ay, bx + 18, by + 78, P.tone(6));
  P.panel(ctx, 62, 82, 132, 56, 'kiểm |vabs|', P.tone(2));
  P.domMath(ctx, 'velocity-abs-check', 104, 108, `|v_a|=${d.force.toFixed(1)}`, { color: P.tone(2) });
}

function renderCh244CoriolisAcceleration(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Coriolis: 2 omega nhân chéo vrel', P.tone(4));
  P.panel(ctx, 84, 92, 166, 156, 'rãnh quay', P.tone(4));
  P.arrow(ctx, 166, 208, 216, 148, P.tone(1), 'vr');
  P.angleArc(ctx, 166, 208, 46, -0.2, 1.4, P.tone(6), 'ω');
  P.arrow(ctx, 216, 148, 296, 148, P.tone(0), 'ac');
  P.panel(ctx, 328, 108, 142, 102, 'điều kiện triệt tiêu', P.tone(3));
  P.dashedLine(ctx, 348, 176, 452, 132, P.tone(6));
  P.domMath(ctx, 'coriolis-value', 350, 174, `2\\omega v=${(state.omega * d.force / 30).toFixed(1)}`, { color: P.tone(4) });
}

// Legacy draft renderers retained for reference. Canonical Ch2 registrations
// live in ch2-relative-motion-velocity-renderers.js.

})();
