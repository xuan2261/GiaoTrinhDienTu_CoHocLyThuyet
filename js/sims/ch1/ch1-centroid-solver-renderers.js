/**
 * Route renderers for Ch1 centroid routes.
 */
(function() {
'use strict';

const registry = window.SimRouteRenderers;
const P = window.SimRouteRendererPrimitives;
if (!registry || !P) return;

function axes(ctx) {
  P.line(ctx, 92, 322, 640, 322, P.tone(6), 1.4);
  P.line(ctx, 92, 322, 92, 72, P.tone(6), 1.4);
  P.domLabel(ctx, 'axis-x', 646, 318, 'x', { color: P.tone(6) });
  P.domLabel(ctx, 'axis-y', 96, 66, 'y', { color: P.tone(6) });
}

function renderCh162CentroidComposite(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Trọng tâm diện tích ghép: trung bình có trọng số', P.tone(1));
  axes(ctx);
  P.body(ctx, 150, 112, 160, 132, 'rgba(13,110,253,.16)', P.tone(1), 'S1', { radius: 2 });
  P.body(ctx, 310, 184, 220, 96, 'rgba(25,135,84,.16)', P.tone(2), 'S2', { radius: 2 });
  P.realisticPoint(ctx, 210, 178, { text: 'G1', fill: P.tone(1) });
  P.realisticPoint(ctx, 402, 224, { text: 'G2', fill: P.tone(2) });
  P.realisticPoint(ctx, d.gx, d.gy, { text: 'G', fill: P.tone(0), radius: 6 });
  P.dashedLine(ctx, 210, 178, d.gx, d.gy, P.tone(6));
  P.dashedLine(ctx, 402, 224, d.gx, d.gy, P.tone(6));
  P.neonArrow(ctx, state.primary.x, state.primary.y, d.gx, d.gy, P.tone(0), 'chỉnh G');
  P.domMath(ctx, 'centroid-sum', 520, 92, `x_G=\\frac{S_1x_1+S_2x_2}{S_1+S_2}`, { color: P.tone(1), width: 210 });
  P.domMath(ctx, 'centroid-value', 520, 152, `G(${d.gx.toFixed(0)},${d.gy.toFixed(0)})`, { color: P.tone(0), width: 150 });
}

function renderCh163CentroidHoleShift(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Trọng tâm có lỗ khoét: trừ diện tích bị bỏ', P.tone(4));
  axes(ctx);
  P.body(ctx, 176, 96, 300, 184, 'rgba(111,66,193,.12)', P.tone(4), 'S', { radius: 4 });
  ctx.save();
  ctx.fillStyle = P.isDarkTheme() ? '#091a33' : '#fff';
  ctx.beginPath(); ctx.arc(state.primary.x, state.primary.y, 34 + d.load / 9, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = P.tone(6); ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
  P.dashedLine(ctx, 300, 188, d.gx, d.gy, P.tone(6));
  P.realisticPoint(ctx, 300, 188, { text: 'G0', fill: P.tone(4) });
  P.realisticPoint(ctx, state.primary.x, state.primary.y, { text: '-S', fill: P.tone(6) });
  P.realisticPoint(ctx, d.gx, d.gy, { text: 'G', fill: P.tone(0), radius: 6 });
  P.neonArrow(ctx, 300, 188, d.gx, d.gy, P.tone(0), 'dịch');
  P.domMath(ctx, 'hole-formula', 506, 92, `x_G=\\frac{Sx-S_hx_h}{S-S_h}`, { color: P.tone(4), width: 220 });
  P.domMath(ctx, 'hole-percent', 506, 152, `S_h=${d.hole.toFixed(0)},\\ \\Delta G=${d.shift.toFixed(1)}`, { color: P.tone(6), width: 220 });
}

registry.register('ch1-6-2', 'ch1-6-2-centroid-composite-renderer', renderCh162CentroidComposite);
registry.register('ch1-6-3', 'ch1-6-3-centroid-hole-shift-renderer', renderCh163CentroidHoleShift);

})();
