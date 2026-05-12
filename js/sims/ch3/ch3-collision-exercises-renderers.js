/**
 * Route renderers for Ch3 collisions and exercises.
 * Routes: ch3-6-2, ch3-6-3, ch3-7-1, ch3-7-2
 */
(function() {
'use strict';

const registry = window.SimRouteRenderers;
const P = window.SimRouteRendererPrimitives;
if (!registry || !P) return;

const visualHelpers = window.SimVisualHelpers || {};
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

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
    P.realisticPoint(ctx, state.collisionX || (b1.x + b2.x) / 2, state.collisionY || (b1.y + b2.y) / 2, { fill: P.tone(4), radius: 8, text: 'COLLISION' });
    ctx.restore();
  }

  P.domMath(ctx, '362-restitution', 376, 58, `e = ${(state.e||1).toFixed(2)}`, { color: P.tone(4) });
  P.domLabel(ctx, '362-p-cons', 60, 294, `Bảo toàn động lượng`, { color: P.tone(6) });
}

// ─── ch3-6-3: Collision solver ──────────────────────────────────────────────

function renderCh363CollisionSolver(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Giải bài va chạm: bảo toàn p, e', P.tone(3));
  const m1 = state.m1 || 1, m2 = state.m2 || 1;
  const v1 = state.v1 || 5, v2 = state.v2 || -3, e = state.e || 0.8;
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

// ─── ch3-7-1: Theorem selector ──────────────────────────────────────────────

function renderCh371TheoremSelector(ctx, scene, state, d) {
  const cases = [
    { key: 'xC', title: 'Khối tâm', formula: 'm_C a_C = \\sum F_{ext}' },
    { key: 'p',  title: 'Động lượng', formula: 'J = \\Delta p' },
    { key: 'L',  title: 'Mô men đ.lượng', formula: 'L_O = I\\omega' },
    { key: 'T',  title: 'Động năng', formula: 'A = \\Delta T' }
  ];
  const pt = state.problemType || 0;
  P.frame(ctx, scene, 'Chọn định lý phù hợp với bài toán', P.tone(4));
  cases.forEach((c, i) => {
    const x = 60 + i * 122, selected = i === pt;
    P.panel(ctx, x, 90, 100, 136, c.title, selected ? P.tone(i) : P.tone(6));
    if (selected) {
      ctx.strokeStyle = P.tone(i); ctx.lineWidth = 2.5; ctx.strokeRect(x - 2, 90 - 2, 104, 140);
    }
    P.domMath(ctx, `371-formula-${i}`, x + 6, 124, c.formula, { color: selected ? P.tone(i) : '#6c757d' });
  });
  P.domLabel(ctx, '371-problem', 400, 280, `Định lý: ${cases[pt].title}`, { color: P.tone(4) });
}

// ─── ch3-7-2: Numeric checker ───────────────────────────────────────────────

function renderCh372NumericChecker(ctx, scene, state, d) {
  const residuals = [
    { label: '\\sum F - ma', value: Number.isFinite(Number(d.residual1)) ? Number(d.residual1) : 0.02 },
    { label: '\\Delta T - A', value: Number.isFinite(Number(d.residual2)) ? Number(d.residual2) : 0.03 },
    { label: '\\Delta p - J', value: Number.isFinite(Number(d.residual3)) ? Number(d.residual3) : 0.01 },
    { label: '\\Delta L - Mdt', value: Number.isFinite(Number(d.residual4)) ? Number(d.residual4) : 0.04 }
  ];
  P.frame(ctx, scene, 'Kiểm tra số liệu động lực học', P.tone(6));
  P.panel(ctx, 78, 80, 400, 176, 'bảng sai lệch (residuals)', P.tone(6));
  residuals.forEach((r, i) => {
    const y = 122 + i * 34;
    P.domMath(ctx, `372-label-${i}`, 106, y - 10, r.label, { color: P.tone(i) });
    P.barGraph(ctx, 250, y - 14, 150, 16, Math.abs(r.value), 0.1, Math.abs(r.value) < 0.05 ? '#198754' : '#dc3545');
    P.domMath(ctx, `372-val-${i}`, 410, y - 10, r.value.toFixed(3), { color: P.tone(i) });
  });
  const score = Number.isFinite(Number(d.score)) ? Number(d.score) :
    Math.max(0, Math.min(100, 100 - (residuals.reduce((s, r) => s + Math.abs(r.value), 0) * 400)));
  P.domLabel(ctx, '372-score', 400, 280, `Độ chính xác: ${score.toFixed(0)}%`, { color: P.tone(6) });
}

// ─── Register ───────────────────────────────────────────────────────────────

registry.register('ch3-6-2', 'ch3-6-2-collision-2d-renderer', renderCh362Collision2D);
registry.register('ch3-6-3', 'ch3-6-3-collision-solver-renderer', renderCh363CollisionSolver);
registry.register('ch3-7-1', 'ch3-7-1-theorem-selector-renderer', renderCh371TheoremSelector);
registry.register('ch3-7-2', 'ch3-7-2-numeric-checker-renderer', renderCh372NumericChecker);

})();
