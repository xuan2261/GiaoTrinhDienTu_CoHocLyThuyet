/**
 * Route renderers for Ch1 spatial equilibrium.
 */
(function() {
'use strict';

const registry = window.SimRouteRenderers;
const P = window.SimRouteRendererPrimitives;
const R = window.SimRender || {};
if (!registry || !P) return;
const W = P.W || 760, H = P.H || 440;

function label(ctx, text, x, y, color, size) {
  ctx.save();
  ctx.fillStyle = color || (P.isDarkTheme() ? '#e8ecf1' : '#1a1a2e');
  ctx.font = `bold ${size || 13}px "Segoe UI", Inter, sans-serif`;
  ctx.fillText(text || '', x, y);
  ctx.restore();
}
function base(ctx, scene, title, accent) {
  P.traceContext(ctx);
  P.resetMarks(scene.routeId);
  ctx.clearRect(0, 0, W, H);
  if (R.drawThemeGrid) R.drawThemeGrid(ctx, W, H, 30);
  ctx.strokeStyle = P.isDarkTheme() ? 'rgba(255,255,255,.16)' : 'rgba(13,36,71,.12)';
  ctx.strokeRect(18, 18, W - 36, H - 36);
  label(ctx, title, 30, 42, accent || P.tone(0), 13);
}
function arrow(ctx, x1, y1, x2, y2, color, text, width) {
  if (R.drawDeCuongArrow) R.drawDeCuongArrow(ctx, x1, y1, x2, y2, color, width || 3, 14);
  else P.arrow(ctx, x1, y1, x2, y2, color, text);
  if (text) label(ctx, text, (x1 + x2) / 2 + 8, (y1 + y2) / 2 - 8, color, 13);
}
function handle(ctx, x, y, color) {
  if (R.drawDragHandle) R.drawDragHandle(ctx, x, y, color);
  else P.point(ctx, x, y, color);
}
function axes(ctx, ox, oy) {
  arrow(ctx, ox, oy, ox + 210, oy + 10, P.tone(0), 'x', 2.4);
  arrow(ctx, ox, oy, ox - 14, oy - 158, P.tone(2), 'y', 2.4);
  arrow(ctx, ox, oy, ox + 126, oy - 94, P.tone(1), 'z', 2.4);
}
function project(ctx, ox, oy, p) {
  P.vectorTriangle(ctx, ox, oy, p.x, oy, p.x, p.y, P.tone(4), 0.14);
  P.dashedLine(ctx, p.x, p.y, p.x, oy, P.tone(6));
  P.dashedLine(ctx, ox, oy, p.x, oy, P.tone(0));
}

function renderCh141SpatialResultant(ctx, scene, state, d) {
  const p = state.primary || { x: 342, y: 146 }, o = { x: 120, y: 286 };
  base(ctx, scene, 'Hợp lực không gian: ba thành phần', P.tone(1));
  axes(ctx, o.x, o.y); project(ctx, o.x, o.y, p);
  arrow(ctx, o.x, o.y, p.x, p.y, P.tone(4), 'R', 3.4);
  arrow(ctx, o.x, o.y, p.x, o.y, P.tone(0), 'R_x', 2.2);
  arrow(ctx, p.x, o.y, p.x, p.y, P.tone(2), 'R_y', 2.2);
  arrow(ctx, p.x, p.y, p.x + 78, p.y - 58, P.tone(1), 'R_z', 2.2);
  handle(ctx, p.x, p.y, P.tone(4));
  P.domMath(ctx, 'spatial-resultant', 468, 76, '\\vec{R}=R_x\\vec{i}+R_y\\vec{j}+R_z\\vec{k}', { color: P.tone(4), width: 250 });
  P.domMath(ctx, 'spatial-components', 468, 126, `R= ${d.resultantMagnitude.toFixed(0)}\\,N`, { color: P.tone(2), width: 150 });
}

function renderCh142SpatialMomentProjection(ctx, scene, state, d) {
  const p = state.primary || { x: 310, y: 170 }, o = { x: 112, y: 286 };
  const axis = -Number(d.alpha || 25) * Math.PI / 180;
  const ex = 180 * Math.cos(axis), ey = 180 * Math.sin(axis);
  base(ctx, scene, 'Mô men chính: chiếu lên trục', P.tone(3));
  axes(ctx, o.x, o.y);
  P.realisticPoint(ctx, o.x, o.y, { text: 'O', fill: P.tone(4) });
  P.dashedLine(ctx, o.x, o.y, p.x, p.y, P.tone(6));
  arrow(ctx, p.x, p.y, p.x + 132, p.y - 76, P.tone(0), 'F', 3);
  arrow(ctx, o.x, o.y, o.x + ex, o.y + ey, P.tone(5), 'e', 2.8);
  P.angleArc(ctx, o.x, o.y, 58, 0, axis, P.tone(3), 'chiếu');
  handle(ctx, p.x, p.y, P.tone(3));
  P.domMath(ctx, 'axis-moment', 434, 82, '\\vec{M}_O=\\vec{r}\\times\\vec{F}', { color: P.tone(3), width: 230 });
  P.domMath(ctx, 'axis-projection', 434, 132, `M_e=${d.moment.toFixed(1)}\\,N.m`, { color: P.tone(5), width: 180 });
}

function renderCh144SpatialEquilibriumBoard(ctx, scene, state, d) {
  const p = state.primary || { x: 214, y: 126 }, o = { x: 88, y: 292 };
  base(ctx, scene, 'Cân bằng không gian: sáu phương trình', P.tone(4));
  axes(ctx, o.x, o.y);
  arrow(ctx, o.x, o.y - 72, p.x, p.y, P.tone(0), 'P', 3);
  arrow(ctx, o.x, o.y - 72, o.x + 64, o.y + 4, P.tone(2), 'R', 2.6);
  handle(ctx, p.x, p.y, P.tone(0));
  P.domPanel(ctx, 'equilibrium-panel', 292, 70, 260, 214, 'Bảng cân bằng', { color: P.tone(4) });
  ['F_x', 'F_y', 'F_z', 'M_x', 'M_y', 'M_z'].forEach((item, i) => {
    P.domMath(ctx, `spatial-eq-${i}`, 320 + (i % 2) * 106, 104 + Math.floor(i / 2) * 48, `\\sum ${item}=0`, { color: P.tone(i), width: 94 });
  });
  P.domMath(ctx, 'spatial-residual', 318, 246, `r=${d.residual.toFixed(2)}`, { color: d.residual < 0.5 ? P.tone(2) : P.tone(0), width: 120 });
}

[
  ['ch1-4-1', 'ch1-4-1-spatial-resultant-renderer', renderCh141SpatialResultant],
  ['ch1-4-2', 'ch1-4-2-spatial-moment-projection-renderer', renderCh142SpatialMomentProjection],
  ['ch1-4-4', 'ch1-4-4-spatial-equilibrium-board-renderer', renderCh144SpatialEquilibriumBoard]
].forEach(row => registry.register(row[0], row[1], row[2]));

})();
