/**
 * Route renderers for Ch1 friction routes.
 */
(function() {
'use strict';

const registry = window.SimRouteRenderers;
const P = window.SimRouteRendererPrimitives;
const R = window.SimRender || {};
if (!registry || !P) return;

function block(ctx, x, y, label) {
  P.body(ctx, x - 42, y - 46, 84, 52, 'rgba(220,53,69,.12)', P.tone(0), label || 'vật', { radius: 5, shadow: true });
}

function thresholdBar(ctx, x, y, width, value, limit) {
  const ratio = Math.max(0, Math.min(1, value / Math.max(1, limit)));
  P.panel(ctx, x - 10, y - 28, width + 20, 56, 'ngưỡng μN', ratio < 1 ? P.tone(2) : P.tone(0));
  P.barGraph(ctx, x, y, width, 12, ratio, 1, ratio < 1 ? P.tone(2) : P.tone(0), '');
  P.domLabel(ctx, 'threshold-state', x + width + 20, y + 11, ratio < 1 ? 'bám' : 'trượt', { color: ratio < 1 ? P.tone(2) : P.tone(0) });
}

function renderCh151ContactForceDecomposition(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Lực tiếp xúc tách thành N và Fms', P.tone(0));
  R.drawTrail && R.drawTrail(ctx, d.trail, P.tone(0), 30);
  P.realisticGround(ctx, 92, 304, 560, { material: 'concrete' });
  block(ctx, 324, 252, 'vật');
  P.vectorTriangle(ctx, 324, 304, 324, 132, 214, 304, P.tone(4), 0.12);
  P.neonArrow(ctx, 324, 304, 324, 146, P.tone(2), 'N');
  P.neonArrow(ctx, 324, 304, 218, 304, P.tone(3), 'Fms');
  P.neonArrow(ctx, 324, 304, 246, 186, P.tone(4), 'R');
  P.realisticPoint(ctx, state.primary.x, state.primary.y, { text: 'R', fill: P.tone(0) });
  P.panel(ctx, 502, 92, 170, 116, 'tam giác tiếp xúc', P.tone(0));
  P.domMath(ctx, 'mu-contact', 520, 132, `F_{ms}\\le ${d.mu.toFixed(2)}N`, { color: P.tone(3), width: 140 });
  P.domMath(ctx, 'contact-values', 520, 174, `F_{ms}=${d.friction.toFixed(1)}\\,N`, { color: P.tone(3), width: 140 });
}

function renderCh152FrictionModeTabs(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Ma sát nghỉ, trượt và lăn', P.tone(3));
  R.drawTrail && R.drawTrail(ctx, d.trail, P.tone(3), 30);
  const labels = [['nghỉ', P.tone(2), 'Fms biến thiên'], ['trượt', P.tone(0), 'Fms = μN'], ['lăn', P.tone(6), 'mô men cản']];
  labels.forEach((item, index) => {
    const x = 70 + index * 186;
    P.panel(ctx, x, 84, 150, 164, item[0], item[1]);
    P.realisticGround(ctx, x + 22, 212, x + 128, { material: 'concrete' });
    block(ctx, x + 75, 184, '');
    if (index === 2) P.realisticWheel(ctx, x + 75, 196, 26, 0, { spokes: 6 });
    P.neonArrow(ctx, x + 75, 184, x + 75, 124, P.tone(2), 'N');
    P.neonArrow(ctx, x + 75, 212, x + 28, 212, P.tone(3), index === 2 ? 'Mr' : 'Fms');
    P.domLabel(ctx, `mode-${index}`, x + 26, 238, item[2], { color: item[1], width: 118 });
  });
  thresholdBar(ctx, 112, 306, 342, d.force, d.threshold);
  P.domMath(ctx, 'friction-boundary', 492, 302, `F=${d.force.toFixed(0)},\\ \\mu N=${d.threshold.toFixed(0)}`, { color: P.tone(3), width: 190 });
}

function renderCh153FrictionConeIncline(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Nón ma sát trên mặt nghiêng: tan alpha <= mu', P.tone(2));
  R.drawTrail && R.drawTrail(ctx, d.trail, P.tone(2), 30);
  const base = { x: 148, y: 310 }, len = 420, a = d.alpha * Math.PI / 180;
  const end = { x: base.x + len * Math.cos(a), y: base.y - len * Math.sin(a) };
  P.line(ctx, base.x, base.y, end.x, end.y, P.tone(2), 5);
  P.realisticGround(ctx, 112, 326, 606, { material: 'concrete' });
  block(ctx, state.primary.x, state.primary.y, 'vật');
  P.neonArrow(ctx, state.primary.x, state.primary.y, state.primary.x - 44 * Math.sin(a), state.primary.y - 96 * Math.cos(a), P.tone(1), 'N');
  P.neonArrow(ctx, state.primary.x, state.primary.y + 22, state.primary.x - 102 * Math.cos(a), state.primary.y + 22 + 102 * Math.sin(a), P.tone(3), 'Fms');
  P.angleArc(ctx, base.x, base.y, 64, -a, 0, P.tone(6), 'α');
  P.dashedLine(ctx, state.primary.x, state.primary.y, state.primary.x - 70, state.primary.y - 132, P.tone(6));
  P.dashedLine(ctx, state.primary.x, state.primary.y, state.primary.x + 70, state.primary.y - 132, P.tone(6));
  P.domMath(ctx, 'incline-state', 500, 92, `\\tan\\alpha=${d.tanAlpha.toFixed(2)}\\le\\mu=${d.mu.toFixed(2)}`, { color: P.tone(2), width: 220 });
  P.domLabel(ctx, 'incline-slip-state', 500, 144, d.slipState === 'hold' ? 'trạng thái: bám' : 'trạng thái: trượt', { color: d.slipState === 'hold' ? P.tone(2) : P.tone(0) });
}

function renderCh154SelfLockingWedge(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Nêm tự hãm: alpha nhỏ hơn phi', P.tone(6));
  R.drawTrail && R.drawTrail(ctx, d.trail, P.tone(6), 30);
  const base = { x: 176, y: 300 }, w = 300, h = 170 * Math.tan(d.alpha * Math.PI / 180);
  ctx.beginPath(); ctx.moveTo(base.x, base.y); ctx.lineTo(base.x + w, base.y); ctx.lineTo(base.x + w, base.y - h); ctx.closePath();
  ctx.fillStyle = P.isDarkTheme() ? 'rgba(201,150,58,.12)' : 'rgba(184,134,11,.16)';
  ctx.strokeStyle = P.tone(6); ctx.lineWidth = 2; ctx.fill(); ctx.stroke();
  P.body(ctx, 454, 116, 110, 76, 'rgba(13,110,253,.12)', P.tone(1), 'tải', { radius: 4, shadow: true });
  P.neonArrow(ctx, 230, 300, 330, 246, P.tone(0), 'đẩy');
  P.neonArrow(ctx, 476, 222, 476, 128, P.tone(2), 'N');
  P.angleArc(ctx, base.x + 18, base.y - 4, 58, -d.alpha * Math.PI / 180, 0, P.tone(6), 'α');
  P.angleArc(ctx, 596, 238, 48, -d.phi * Math.PI / 180, 0, P.tone(3), 'φ');
  P.domMath(ctx, 'phi-boundary', 500, 294, `\\alpha=${d.alpha.toFixed(0)}^\\circ,\\ \\varphi=${d.phi.toFixed(0)}^\\circ`, { color: P.tone(6), width: 220 });
  P.domLabel(ctx, 'lock-state', 500, 344, d.lockState, { color: d.lockState === 'tự hãm' ? P.tone(2) : P.tone(0) });
}

registry.register('ch1-5-1', 'ch1-5-1-contact-force-decomposition-renderer', renderCh151ContactForceDecomposition);
registry.register('ch1-5-2', 'ch1-5-2-friction-mode-tabs-renderer', renderCh152FrictionModeTabs);
registry.register('ch1-5-3', 'ch1-5-3-friction-cone-incline-renderer', renderCh153FrictionConeIncline);
registry.register('ch1-5-4', 'ch1-5-4-self-locking-wedge-renderer', renderCh154SelfLockingWedge);

})();
