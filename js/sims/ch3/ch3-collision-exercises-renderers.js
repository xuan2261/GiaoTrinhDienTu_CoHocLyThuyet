/**
 * Route renderers for Ch3 collisions.
 * Routes: ch3-6-2, ch3-6-3
 */
(function() {
'use strict';

const registry = window.SimRouteRenderers;
const P = window.SimRouteRendererPrimitives;
if (!registry || !P) return;

const visualHelpers = window.SimVisualHelpers || {};
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function finiteNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

// ─── ch3-6-2: 2D collision ─────────────────────────────────────────────────

function renderCh362Collision2D(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Va chạm 2D: đàn hồi/ không đàn hồi', P.tone(4));
  const b1 = state.ball1 || { x: 150, y: 180, vx: 8, vy: 0 };
  const b2 = state.ball2 || { x: 380, y: 180, vx: -3, vy: 0 };

  P.realisticPoint(ctx, b1.x, b1.y, { text: 'm1', fill: P.tone(0), radius: 25 });
  P.realisticPoint(ctx, b2.x, b2.y, { text: 'm2', fill: P.tone(1), radius: 20 });

  P.neonArrow(ctx, b1.x, b1.y, clamp(b1.x + b1.vx * 6, 32, 528), clamp(b1.y + b1.vy * 6, 32, 308), P.tone(0), '');
  P.neonArrow(ctx, b2.x, b2.y, clamp(b2.x + b2.vx * 6, 32, 528), clamp(b2.y + b2.vy * 6, 32, 308), P.tone(1), '');

  if (state.collision) {
    ctx.save();
    ctx.shadowColor = P.tone(4); ctx.shadowBlur = 10;
    P.realisticPoint(ctx, state.collisionX || (b1.x + b2.x) / 2, state.collisionY || (b1.y + b2.y) / 2, { fill: P.tone(4), radius: 8, text: 'va chạm' });
    ctx.restore();
  }

  const flash = state.impulseFlash;
  if (flash && Array.isArray(flash.arrows) && flash.arrows.length >= 2) {
    const scale = 6;
    const a1 = flash.arrows[0], a2 = flash.arrows[1];
    const e1x = a1.x + a1.dx * scale, e1y = a1.y + a1.dy * scale;
    const e2x = a2.x + a2.dx * scale, e2y = a2.y + a2.dy * scale;
    P.mark('impulseArrow', a1.x, a1.y, e1x, e1y);
    P.mark('impulseArrow', a2.x, a2.y, e2x, e2y);
    P.neonArrow(ctx, a1.x, a1.y, e1x, e1y, P.tone(4), '');
    P.neonArrow(ctx, a2.x, a2.y, e2x, e2y, P.tone(4), '');
  }

  if (state.diagnostics && (state.diagnostics.error || state.diagnostics.graph)) {
    const values = d && d.invariant && d.invariant.values || {};
    const graph = window.SimPromaxMiniGraph && window.SimPromaxMiniGraph.buildBeforeAfterSummary ?
      window.SimPromaxMiniGraph.buildBeforeAfterSummary({
        label: 'p',
        before: values.momentumBefore,
        after: values.momentumAfter,
        residual: d && d.invariant && d.invariant.residual
      }) :
      null;
    if (graph && window.SimPromaxMiniGraph.drawBars) {
      window.SimPromaxMiniGraph.drawBars(ctx, 376, 104, 150, 34, graph);
      P.domLabel(ctx, '362-momentum-residual', 376, 144, graph.summary, { color: P.tone(4), width: 240 });
    }
  }
  P.domMath(ctx, '362-restitution', 376, 58, `e = ${(state.e||1).toFixed(2)}`, { color: P.tone(4) });
  P.domLabel(ctx, '362-p-cons', 60, 294, `Bảo toàn động lượng`, { color: P.tone(6) });
}

// ─── ch3-6-3: Collision solver ──────────────────────────────────────────────

function renderCh363CollisionSolver(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Giải bài va chạm: bảo toàn p, e', P.tone(3));
  const m1 = finiteNumber(state.m1, 1), m2 = finiteNumber(state.m2, 1);
  const v1 = finiteNumber(state.v1, 5), v2 = finiteNumber(state.v2, -3), e = finiteNumber(state.e, 0.8);
  const result = window.SimPhysicsDynamics ?
    window.SimPhysicsDynamics.restitutionVelocity(m1, m2, v1, v2, e) :
    { v1: v1, v2: v2 };

  P.realisticBody(ctx, 88, 168, 60, 44, 'm1', { material: 'metal', radius: 4 });
  P.realisticBody(ctx, 342, 168, 72, 50, 'm2', { material: 'metal', radius: 4 });

  P.neonArrow(ctx, 148, 190, 238, 190, P.tone(0), `v1`);
  P.neonArrow(ctx, 342, 190, 252, 190, P.tone(0), `v2`);

  P.dashedLine(ctx, 90, 268, 430, 268, P.tone(6));
  P.neonArrow(ctx, 88, 252, 168, 252, P.tone(2), `v1'`);
  P.neonArrow(ctx, 342, 252, 252, 252, P.tone(2), `v2'`);

  P.panel(ctx, 180, 82, 192, 72, 'kết quả', P.tone(3));
  P.domMath(ctx, '363-v1', 196, 96, `v_1' = ${result.v1.toFixed(2)}`, { color: P.tone(2) });
  P.domMath(ctx, '363-v2', 196, 126, `v_2' = ${result.v2.toFixed(2)}`, { color: P.tone(2) });
}

// ─── Register ───────────────────────────────────────────────────────────────

registry.register('ch3-6-2', 'ch3-6-2-collision-2d-renderer', renderCh362Collision2D);
registry.register('ch3-6-3', 'ch3-6-3-collision-solver-renderer', renderCh363CollisionSolver);

})();
