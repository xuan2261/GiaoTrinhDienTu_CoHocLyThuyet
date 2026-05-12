/**
 * Route renderers for Ch1 support constraints.
 */
(function() {
'use strict';

const registry = window.SimRouteRenderers;
const P = window.SimRouteRendererPrimitives;
const R = window.SimRender || {};
if (!registry || !P) return;
const W = P.W || 760, H = P.H || 440;
const beam = { ax: 130, bx: 630, y: 240, h: 22 };

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
  ctx.lineWidth = 1;
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
function trail(state, point, max) {
  state.trail = Array.isArray(state.trail) ? state.trail : [];
  const last = state.trail[state.trail.length - 1];
  if (!last || Math.hypot(last.x - point.x, last.y - point.y) > 2) state.trail.push({ x: point.x, y: point.y });
  if (state.trail.length > (max || 30)) state.trail.splice(0, state.trail.length - (max || 30));
  return state.trail;
}
function groundHatch(ctx, x1, y, x2) {
  ctx.save();
  ctx.strokeStyle = P.isDarkTheme() ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.22)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
  for (let x = x1; x <= x2; x += 15) {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 11, y + 16); ctx.stroke();
  }
  ctx.restore();
}
function beamBody(ctx) {
  const dark = P.isDarkTheme();
  ctx.save();
  ctx.fillStyle = dark ? 'rgba(201,150,58,.15)' : 'rgba(201,150,58,.2)';
  ctx.strokeStyle = dark ? 'rgba(201,150,58,.5)' : 'rgba(139,105,20,.5)';
  ctx.lineWidth = 2;
  ctx.fillRect(beam.ax, beam.y - beam.h / 2, beam.bx - beam.ax, beam.h);
  ctx.strokeRect(beam.ax, beam.y - beam.h / 2, beam.bx - beam.ax, beam.h);
  ctx.restore();
}
function roller(ctx, x, y) {
  P.supportTriangle(ctx, x, y, 12, P.tone(3));
  ctx.beginPath(); ctx.arc(x, y + 26, 8, 0, Math.PI * 2); ctx.strokeStyle = P.tone(3); ctx.lineWidth = 2; ctx.stroke();
}
function fixedWall(ctx, x, y1, y2) {
  ctx.save();
  ctx.fillStyle = P.isDarkTheme() ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.07)';
  ctx.fillRect(x - 18, y1, 18, y2 - y1);
  groundHatch(ctx, x - 18, y1, x - 18, y2);
  ctx.restore();
}

function renderCh131SmoothSupportNormal(ctx, scene, state, d) {
  const p = state.primary || { x: 360, y: 258 };
  const a = -Number(d.alpha || 20) * Math.PI / 180, tx = Math.cos(a), ty = Math.sin(a), nx = ty, ny = -tx;
  base(ctx, scene, 'Liên kết tựa: phản lực vuông góc mặt tựa', P.tone(2));
  if (R.drawTrail) R.drawTrail(ctx, trail(state, p), 'rgba(39,174,96,.24)', 30);
  P.realisticGround(ctx, 84, 305, 602, { material: 'concrete' });
  P.dashedLine(ctx, p.x - 210 * tx, p.y - 210 * ty, p.x + 210 * tx, p.y + 210 * ty, P.tone(6));
  P.realisticBody(ctx, p.x - 42, p.y - 72, 92, 48, 'vật', { material: 'metal', radius: 7, stroke: P.tone(1) });
  arrow(ctx, p.x, p.y - 24, p.x + 80 * nx, p.y - 24 + 80 * ny, P.tone(2), 'N', 3);
  P.angleArc(ctx, p.x, p.y - 24, 42, a, a - Math.PI / 2, P.tone(3), '90°');
  handle(ctx, p.x, p.y, P.tone(2));
  P.domMath(ctx, 'normal-equation', 500, 76, '\\vec{N}\\perp\\text{mặt tựa}', { color: P.tone(2), width: 210 });
}

function renderCh132CableTension(ctx, scene, state, d) {
  const anchor = { x: 120, y: 76 }, load = state.primary || { x: 430, y: 238 };
  base(ctx, scene, 'Dây mềm: phản lực dọc theo trục dây', P.tone(5));
  if (R.drawTrail) R.drawTrail(ctx, trail(state, load), 'rgba(13,202,240,.24)', 30);
  P.realisticGround(ctx, 88, 52, 152, { material: 'concrete', height: 170 });
  P.realisticPoint(ctx, anchor.x, anchor.y, { text: 'A', fill: P.tone(4) });
  P.cable(ctx, anchor.x, anchor.y, load.x, load.y, { sag: 4, color: P.tone(5), lineWidth: 3 });
  P.realisticBody(ctx, load.x - 32, load.y - 18, 64, 46, 'tải', { material: 'metal', radius: 8, stroke: P.tone(1) });
  arrow(ctx, load.x, load.y, anchor.x + (load.x - anchor.x) * 0.38, anchor.y + (load.y - anchor.y) * 0.38, P.tone(5), 'T', 3);
  arrow(ctx, load.x, load.y + 4, load.x, load.y + 86, '#e74c3c', 'P', 2.8);
  handle(ctx, load.x, load.y, P.tone(5));
  P.domMath(ctx, 'cable-equation', 482, 76, '\\vec{T}\\parallel\\text{dây}', { color: P.tone(5), width: 190 });
}

function renderCh133HingeReactionComponents(ctx, scene, state, d) {
  const p = state.primary || { x: 340, y: 188 };
  base(ctx, scene, 'Bản lề: hai thành phần phản lực', P.tone(4));
  if (R.drawTrail) R.drawTrail(ctx, trail(state, p), 'rgba(220,53,69,.22)', 30);
  groundHatch(ctx, 82, 260, 250);
  P.supportTriangle(ctx, 150, 226, 14, P.tone(4));
  P.realisticPoint(ctx, 150, 226, { text: 'A', fill: P.tone(4) });
  P.realisticBeam(ctx, 150, 204, 480, 204, { material: 'metal', height: 28 });
  arrow(ctx, 150, 226, 94, 226, P.tone(1), 'A_x', 2.8);
  arrow(ctx, 150, 226, 150, 150, P.tone(2), 'A_y', 2.8);
  arrow(ctx, p.x, p.y, p.x + 66, p.y - 62, P.tone(0), 'P', 3);
  handle(ctx, p.x, p.y, P.tone(0));
  P.domMath(ctx, 'hinge-equation', 510, 80, '\\sum F_x=0,\\quad \\sum F_y=0', { color: P.tone(4), width: 210 });
  P.domMath(ctx, 'hinge-reactions', 510, 130, `A_x=${d.rx.toFixed(0)}\\,N\\quad A_y=${d.ry.toFixed(0)}\\,N`, { color: P.tone(2), width: 210 });
}

function renderCh134RollerPinBuilder(ctx, scene, state, d) {
  const p = state.primary || { x: 380, y: 150 };
  base(ctx, scene, 'Gối cố định - gối di động: cân bằng dầm', P.tone(6));
  if (R.drawTrail) R.drawTrail(ctx, trail(state, p), 'rgba(231,76,60,.24)', 30);
  beamBody(ctx); groundHatch(ctx, 90, beam.y + 52, 670);
  P.supportTriangle(ctx, beam.ax, beam.y + 11, 12, P.tone(1)); roller(ctx, beam.bx, beam.y + 11);
  label(ctx, 'A', beam.ax - 20, beam.y + 42, P.tone(1)); label(ctx, 'B', beam.bx + 14, beam.y + 42, P.tone(3));
  arrow(ctx, p.x, p.y, p.x, beam.y - 12, P.tone(0), 'P', 3.2);
  arrow(ctx, beam.ax, beam.y + 32, beam.ax, beam.y - 56, P.tone(2), 'R_A', 2.8);
  arrow(ctx, beam.bx, beam.y + 32, beam.bx, beam.y - 56, P.tone(2), 'R_B', 2.8);
  P.dashedLine(ctx, beam.ax, beam.y + 72, p.x, beam.y + 72, 'rgba(231,76,60,.45)');
  label(ctx, `a=${d.a.toFixed(1)} m`, (beam.ax + p.x) / 2 - 22, beam.y + 92, P.tone(0), 12);
  handle(ctx, p.x, p.y, P.tone(0));
  P.domMath(ctx, 'beam-force', 420, 70, '\\sum F_y=0:\\ R_A+R_B-P=0', { color: P.tone(2), width: 280 });
  P.domMath(ctx, 'beam-moment', 420, 118, '\\sum M_A=0:\\ R_B L-Pa=0', { color: P.tone(6), width: 260 });
  P.domMath(ctx, 'beam-values', 420, 166, `R_A=${d.ra.toFixed(0)}\\,N\\quad R_B=${d.rb.toFixed(0)}\\,N`, { color: P.tone(2), width: 250 });
}

function renderCh136FixedSupport(ctx, scene, state, d) {
  const p = state.primary || { x: 420, y: 128 };
  base(ctx, scene, 'Ngàm: phản lực lực và mô men', P.tone(6));
  if (R.drawTrail) R.drawTrail(ctx, trail(state, p), 'rgba(201,150,58,.25)', 30);
  fixedWall(ctx, 110, 100, 292);
  P.realisticBeam(ctx, 110, 192, 430, 192, { material: 'metal', height: 32 });
  arrow(ctx, 110, 192, 166, 150, P.tone(1), 'R_x');
  arrow(ctx, 110, 192, 110, 118, P.tone(2), 'R_y');
  P.angleArc(ctx, 142, 166, 42, 0.1, 1.7 * Math.PI, P.tone(6), 'M_A');
  arrow(ctx, p.x, p.y, p.x - 54, p.y + 62, P.tone(0), 'P');
  handle(ctx, p.x, p.y, P.tone(0));
  P.domMath(ctx, 'fixed-equation', 490, 82, 'R_x,\\ R_y,\\ M_A', { color: P.tone(6), width: 170 });
  P.domMath(ctx, 'fixed-moment', 490, 130, `M_A=${d.moment.toFixed(1)}\\,N.m`, { color: P.tone(6), width: 170 });
}

function renderCh137TwoForceMember(ctx, scene, state, d) {
  const b = state.primary || { x: 410, y: 118 }, a = { x: 142, y: 248 };
  const ux = (b.x - a.x) / (Math.hypot(b.x - a.x, b.y - a.y) || 1), uy = (b.y - a.y) / (Math.hypot(b.x - a.x, b.y - a.y) || 1);
  base(ctx, scene, 'Thanh hai lực: phản lực cùng đường tác dụng', P.tone(2));
  if (R.drawTrail) R.drawTrail(ctx, trail(state, b), 'rgba(39,174,96,.24)', 30);
  P.realisticBeam(ctx, a.x, a.y, b.x, b.y, { material: 'metal', height: 14 });
  P.realisticPoint(ctx, a.x, a.y, { text: 'A', fill: P.tone(4) });
  P.realisticPoint(ctx, b.x, b.y, { text: 'B', fill: P.tone(4) });
  P.dashedLine(ctx, a.x - 45 * ux, a.y - 45 * uy, b.x + 45 * ux, b.y + 45 * uy, P.tone(6));
  arrow(ctx, a.x, a.y, a.x - 70 * ux, a.y - 70 * uy, P.tone(2), 'N');
  arrow(ctx, b.x, b.y, b.x + 70 * ux, b.y + 70 * uy, P.tone(2), 'N');
  handle(ctx, b.x, b.y, P.tone(2));
  P.domMath(ctx, 'axial-equation', 488, 82, '\\vec{N}_A=-\\vec{N}_B', { color: P.tone(2), width: 180 });
}

[
  ['ch1-3-1', 'ch1-3-1-smooth-support-normal-renderer', renderCh131SmoothSupportNormal],
  ['ch1-3-2', 'ch1-3-2-cable-tension-renderer', renderCh132CableTension],
  ['ch1-3-3', 'ch1-3-3-hinge-reaction-components-renderer', renderCh133HingeReactionComponents],
  ['ch1-3-4', 'ch1-3-4-roller-pin-builder-renderer', renderCh134RollerPinBuilder],
  ['ch1-3-6', 'ch1-3-6-fixed-support-renderer', renderCh136FixedSupport],
  ['ch1-3-7', 'ch1-3-7-two-force-member-renderer', renderCh137TwoForceMember]
].forEach(row => registry.register(row[0], row[1], row[2]));

})();
