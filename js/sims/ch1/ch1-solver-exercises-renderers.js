/**
 * Route renderers for Ch1 solver exercise routes.
 */
(function() {
'use strict';

const registry = window.SimRouteRenderers;
const P = window.SimRouteRendererPrimitives;
if (!registry || !P) return;

function beam(ctx, d) {
  P.realisticGround(ctx, 104, 280, 620, { material: 'concrete' });
  P.realisticBeam(ctx, 150, 222, 572, 222, { material: 'metal', height: 30, shadow: true });
  P.supportTriangle(ctx, 150, 240, 14, P.tone(1));
  P.supportTriangle(ctx, 572, 240, 14, P.tone(2));
  P.realisticPoint(ctx, 150, 248, { text: 'A', fill: P.tone(1) });
  P.realisticPoint(ctx, 572, 248, { text: 'B', fill: P.tone(2) });
  P.neonArrow(ctx, d.point.x, 218, d.point.x, d.point.y, P.tone(0), 'P');
  P.neonArrow(ctx, 150, 240, 150, 170, P.tone(1), 'RA');
  P.neonArrow(ctx, 572, 240, 572, 170, P.tone(2), 'RB');
  P.dimension(ctx, 150, 270, d.point.x, 270, P.tone(6), 'a');
}

function stepCard(ctx, index, title, active) {
  const x = 42 + index * 170;
  P.panel(ctx, x, 82, 144, 92, `${index + 1} ${title}`, active ? P.tone(index) : P.tone(6));
  return x;
}

function renderCh171GuidedEquilibriumSolver(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Chuỗi giải: sơ đồ, phương trình, nghiệm', P.tone(2));
  beam(ctx, d);
  const step = Math.round(d.step);
  const x0 = stepCard(ctx, 0, 'FBD', step >= 1);
  P.domMath(ctx, 'step-fbd', x0 + 14, 126, 'P,\\ R_A,\\ R_B', { color: P.tone(0), width: 120 });
  const x1 = stepCard(ctx, 1, 'ΣFx=0', step >= 2);
  P.domMath(ctx, 'step-fx', x1 + 16, 126, 'R_x=0', { color: P.tone(1), width: 110 });
  const x2 = stepCard(ctx, 2, 'ΣFy=0', step >= 3);
  P.domMath(ctx, 'step-fy', x2 + 12, 118, `R_A+R_B=${d.force.toFixed(0)}`, { color: P.tone(3), width: 126 });
  P.domMath(ctx, 'step-m', x2 + 12, 148, `R_BL=Pa`, { color: P.tone(6), width: 126 });
  const x3 = stepCard(ctx, 3, 'nghiệm', step >= 4);
  P.domMath(ctx, 'sol-ra', x3 + 14, 116, `R_A=${d.ra.toFixed(1)}`, { color: P.tone(1), width: 110 });
  P.domMath(ctx, 'sol-rb', x3 + 14, 146, `R_B=${d.rb.toFixed(1)}`, { color: P.tone(2), width: 110 });
  P.domLabel(ctx, 'solver-progress', 52, 374, `Bước đang xem: ${d.progress}`, { color: P.tone(2) });
}

function renderCh172StaticsNumericChecker(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Kiểm tra số: so sánh RA, RB, MO', P.tone(3));
  beam(ctx, d);
  P.panel(ctx, 452, 72, 236, 120, 'bảng cân bằng', P.tone(4));
  P.domMath(ctx, 'eq-1', 472, 112, `R_A+R_B=${d.force.toFixed(0)}`, { color: P.tone(3), width: 190 });
  P.domMath(ctx, 'eq-2', 472, 150, `M_A=${d.moment.toFixed(1)}`, { color: P.tone(6), width: 190 });
  P.panel(ctx, 452, 304, 236, 72, d.verify === 'đúng' ? 'kết quả khớp' : 'còn sai lệch', d.verify === 'đúng' ? P.tone(2) : P.tone(0));
  P.domMath(ctx, 'input-ra-val', 472, 336, `R_A^*=${(state.inputRA || 0).toFixed(0)},\\ R_A=${d.ra.toFixed(1)}`, { color: P.tone(1), width: 190 });
  P.domMath(ctx, 'input-rb-val', 472, 366, `R_B^*=${(state.inputRB || 0).toFixed(0)},\\ R_B=${d.rb.toFixed(1)}`, { color: P.tone(2), width: 190 });
  P.domMath(ctx, 'residual', 86, 104, `\\varepsilon=${d.residual.toFixed(1)}\\,N`, { color: d.verify === 'đúng' ? P.tone(2) : P.tone(0), width: 150 });
}

registry.register('ch1-7-1', 'ch1-7-1-guided-equilibrium-solver-renderer', renderCh171GuidedEquilibriumSolver);
registry.register('ch1-7-2', 'ch1-7-2-statics-numeric-checker-renderer', renderCh172StaticsNumericChecker);

})();
