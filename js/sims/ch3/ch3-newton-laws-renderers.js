/**
 * Route renderers for Ch3 Newton's laws and basic dynamics.
 * Routes: ch3-1-2, ch3-1-3, ch3-2-1, ch3-2-2, ch3-2-3, ch3-2-5
 */
(function() {
'use strict';

const registry = window.SimRouteRenderers;
const P = window.SimRouteRendererPrimitives;
if (!registry || !P) return;

// ─── ch3-1-2: Force to acceleration ─────────────────────────────────────────

function renderCh312ForceAcceleration(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Lực tổng → gia tốc: F = ma', P.tone(0));
  const a = (state.F || 50) / (state.m || 5);
  P.realisticGround(ctx, 72, 268, 492, { material: 'concrete' });
  const blockX = Math.min(300, 100 + a * 4);
  P.realisticBody(ctx, blockX, 194, 78, 50, `m=${state.m}`, { material: 'metal', radius: 4 });
  P.neonArrow(ctx, blockX + 78, 219, blockX + 78 + (state.F || 50) * 1.2, 178, P.tone(0), 'F');
  P.neonArrow(ctx, blockX + 78, 244, blockX + 78 + a * 12, 244, P.tone(2), `a=${a.toFixed(1)}`);
  P.panel(ctx, 58, 84, 148, 76, 'quan hệ lực-gia tốc', P.tone(0));
  P.domMath(ctx, '312-law', 74, 94, 'a = \\frac{\\sum F}{m}', { color: P.tone(0) });
}

function renderCh313InertialFrames(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Hệ quy chiếu quán tính vs phi quán tính', P.tone(4));
  P.panel(ctx, 56, 86, 188, 164, 'hệ quán tính', P.tone(1));
  P.realisticBody(ctx, 112, 170, 58, 38, 'm', { radius: 6, fill: 'rgba(13,110,253,.15)' });
  P.neonArrow(ctx, 170, 189, 220, 156, P.tone(0), 'F');
  P.domMath(ctx, '313-inertial-note', 66, 218, '\\sum F = ma', { color: P.tone(1) });

  P.panel(ctx, 310, 86, 188, 164, 'hệ phi quán tính', P.tone(4));
  P.realisticBody(ctx, 366, 170, 58, 38, 'm', { material: 'metal', radius: 6 });
  P.neonArrow(ctx, 424, 189, 474, 154, P.tone(0), 'F');
  P.neonArrow(ctx, 366, 189, 318, 218, P.tone(4), 'F*');
  P.domMath(ctx, '313-pseudo-note', 322, 218, `F^{*} = -ma_0`, { color: P.tone(4) });
}

// ─── ch3-2-1: Inertia law ────────────────────────────────────────────────────

function renderCh321InertiaLaw(ctx, scene, state, d) {
  const alpha = (state.alpha || 0) * Math.PI / 180;
  const Fnet = (state.F || 50) * Math.cos(alpha);
  P.frame(ctx, scene, 'Định luật quán tính: F=0 → v=const', P.tone(2));
  ctx.strokeStyle = '#6c757d'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(68, 264); ctx.lineTo(500, 264); ctx.stroke();
  const bodyX = 200 + (state.F || 50) * 0.3;
  P.body(ctx, bodyX, 196, 82, 44, 'rgba(25,135,84,.12)', P.tone(2), 'vật');
  P.arrow(ctx, bodyX + 82, 218, bodyX + 82 + (state.F || 50), 218 - (state.F || 50) * 0.4, P.tone(0), 'F₁');
  P.arrow(ctx, bodyX, 218, bodyX - 60, 218 + 24, P.tone(0), 'F₂');
  P.arrow(ctx, bodyX + 82, 218, bodyX + 82 + Fnet, 218, P.tone(2), `F_net=${Fnet.toFixed(0)}`);
  P.panel(ctx, 72, 84, 150, 68, 'quán tính', P.tone(2));
  P.domMath(ctx, '321-cond', 84, 92, '\\sum F=0', { color: P.tone(2) });
  P.domMath(ctx, '321-status', 90, 124, Math.abs(Fnet) < 1 ? 'v=const ✓' : 'a≠0', { color: P.tone(2) });
}

// ─── ch3-2-2: Newton II ──────────────────────────────────────────────────────

function renderCh322NewtonSecond(ctx, scene, state, d) {
  const a = (state.F || 50) / (state.m || 5);
  P.frame(ctx, scene, 'Định luật Newton II: F = ma', P.tone(1));
  ctx.strokeStyle = '#6c757d'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(68, 264); ctx.lineTo(500, 264); ctx.stroke();
  P.body(ctx, 192, 188, 92, 54, 'rgba(13,110,253,.12)', P.tone(1), `m=${state.m}`);
  P.arrow(ctx, 284, 215, 284 + (state.F || 50) * 1.4, 158, P.tone(0), 'F');
  P.arrow(ctx, 284, 242, 284 + a * 14, 242, P.tone(2), `a=${a.toFixed(2)}`);
  const v = a * (state._t || 0);
  P.panel(ctx, 400, 84, 130, 170, 'v(t)', P.tone(1));
  ctx.strokeStyle = P.tone(1); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(420, 230); ctx.lineTo(510, 230); ctx.moveTo(430, 100); ctx.lineTo(430, 244); ctx.stroke();
  ctx.strokeStyle = P.tone(2);
  ctx.beginPath(); ctx.moveTo(430, 230); ctx.lineTo(510, Math.max(100, 230 - v * 4)); ctx.stroke();
  P.panel(ctx, 68, 84, 138, 88, 'gia tốc', P.tone(1));
  P.domMath(ctx, '322-law', 78, 92, 'a=\\frac{F}{m}', { color: P.tone(1) });
  P.domMath(ctx, '322-ratio', 84, 140, `F/m=${a.toFixed(2)}`, { color: P.tone(1) });
}

// ─── ch3-2-3: Newton III ─────────────────────────────────────────────────────

function renderCh323NewtonThird(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Định luật Newton III: F_AB = -F_BA', P.tone(3));
  P.body(ctx, 128, 168, 86, 54, 'rgba(253,126,20,.12)', P.tone(3), 'A');
  P.body(ctx, 340, 168, 86, 54, 'rgba(13,110,253,.12)', P.tone(1), 'B');
  P.arrow(ctx, 214, 195, 326, 195, P.tone(0), 'FAB');
  P.arrow(ctx, 340, 195, 228, 195, P.tone(0), 'FBA');
  P.dashedLine(ctx, 178, 238, 376, 238, P.tone(6));
  P.panel(ctx, 204, 84, 158, 60, 'cặp lực', P.tone(3));
  P.domMath(ctx, '323-law', 222, 92, 'F_{AB}=-F_{BA}', { color: P.tone(3) });
  P.domMath(ctx, '323-value', 234, 122, `|F|=${(state.F||50).toFixed(1)}N`, { color: P.tone(3) });
}

// ─── ch3-2-5: Dynamic FBD ───────────────────────────────────────────────────

function renderCh325DynamicFbd(ctx, scene, state, d) {
  const a = (state.F || 50) / (state.m || 5);
  P.frame(ctx, scene, 'Sơ đồ FBD động lực: F + F* = 0', P.tone(6));
  P.panel(ctx, 68, 84, 180, 178, 'lực thật', P.tone(0));
  P.body(ctx, 124, 170, 64, 44, 'rgba(184,134,11,.12)', P.tone(6), 'm');
  P.arrow(ctx, 188, 192, 230, 142, P.tone(0), 'F');
  P.panel(ctx, 308, 84, 184, 178, "D'Alembert", P.tone(4));
  P.body(ctx, 364, 170, 64, 44, 'rgba(184,134,11,.12)', P.tone(6), 'm');
  P.arrow(ctx, 428, 192, 470, 150, P.tone(0), 'F');
  P.arrow(ctx, 364, 192, 320, 226, P.tone(4), '-ma');
  P.domMath(ctx, '325-ma', 348, 228, `ma=${(state.m*a).toFixed(1)}N`, { color: P.tone(4) });
  P.domMath(ctx, '325-sum', 354, 248, 'F+F*=0 ✓', { color: P.tone(4) });
}

// ─── Register ───────────────────────────────────────────────────────────────

registry.register('ch3-1-2', 'ch3-1-2-force-acceleration-renderer', renderCh312ForceAcceleration);
registry.register('ch3-1-3', 'ch3-1-3-inertial-frames-renderer', renderCh313InertialFrames);
registry.register('ch3-2-1', 'ch3-2-1-inertia-law-renderer', renderCh321InertiaLaw);
registry.register('ch3-2-2', 'ch3-2-2-newton-second-renderer', renderCh322NewtonSecond);
registry.register('ch3-2-3', 'ch3-2-3-newton-third-renderer', renderCh323NewtonThird);
registry.register('ch3-2-5', 'ch3-2-5-dynamic-fbd-renderer', renderCh325DynamicFbd);

})();
