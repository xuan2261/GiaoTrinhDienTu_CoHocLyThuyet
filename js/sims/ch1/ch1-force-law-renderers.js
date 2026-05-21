(function() {
'use strict';

const registry = window.SimRouteRenderers;
const P = window.SimRouteRendererPrimitives;
const R = window.SimRender || {};
if (!registry || !P) { console.warn('Route renderer registry missing for Ch1 force/law renderers'); return; }
const W = P.W || 760, H = P.H || 440, O = { x: 150, y: 300 };
const PARA_O = { x: 200, y: 300 };
// Phase 08 RC6: resolve through SimCore palette so dark/light themes pick the
// right variant. Keys f1/f2/r map to dedicated palette entries (paraF1/F2/R).
const PARA_COLORS = Object.create(null);
['f1', 'f2', 'r'].forEach(function(slot) {
  const paletteKey = slot === 'f1' ? 'paraF1' : slot === 'f2' ? 'paraF2' : 'paraR';
  Object.defineProperty(PARA_COLORS, slot, {
    enumerable: true,
    get: function() {
      return (window.SimCore && window.SimCore.color)
        ? window.SimCore.color(paletteKey)
        : '#000';
    }
  });
});
function label(ctx, text, x, y, color, size) {
  ctx.save(); ctx.fillStyle = color || (P.isDarkTheme() ? '#e8ecf1' : '#1a1a2e');
  ctx.font = `bold ${size || 13}px "Segoe UI", Inter, sans-serif`; ctx.fillText(text, x, y); ctx.restore();
}

function base(ctx, title, accent) {
  ctx.clearRect(0, 0, W, H);
  if (R.drawThemeGrid) R.drawThemeGrid(ctx, W, H, 30);
  ctx.strokeStyle = P.isDarkTheme() ? 'rgba(255,255,255,.16)' : 'rgba(13,36,71,.12)'; ctx.lineWidth = 1;
  ctx.strokeRect(18, 18, W - 36, H - 36); label(ctx, title, 30, 42, accent || P.tone(0), 13);
}

function arrow(ctx, x1, y1, x2, y2, color, text, width) {
  if (R.drawDeCuongArrow) R.drawDeCuongArrow(ctx, x1, y1, x2, y2, color, width || 3, 14);
  else P.arrow(ctx, x1, y1, x2, y2, color, text);
  if (text) label(ctx, text, (x1 + x2) / 2 + 8, (y1 + y2) / 2 - 8, color, 13);
}

function handle(ctx, x, y, color) { if (R.drawDragHandle) R.drawDragHandle(ctx, x, y, color); else P.point(ctx, x, y, color); }

function drawMomentArc(ctx, cx, cy, radius, color, labelText) {
  if (R.drawAngleArc) R.drawAngleArc(ctx, cx, cy, -0.55, 1.25, radius, color);
  else P.angleArc(ctx, cx, cy, radius, -0.55, 1.25, color);
  arrow(ctx, cx + radius * 0.25, cy + radius * 0.97, cx + radius * 0.62, cy + radius * 0.78, color, '');
  if (labelText) label(ctx, labelText, cx + radius + 8, cy + 6, color, 13);
}
function ground(ctx, x1, y, x2) {
  ctx.save();
  ctx.fillStyle = P.isDarkTheme() ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)'; ctx.strokeStyle = P.isDarkTheme() ? 'rgba(255,255,255,.16)' : 'rgba(0,0,0,.16)';
  ctx.fillRect(x1, y, x2 - x1, H - y - 22); ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
  for (let x = x1; x < x2; x += 18) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 10, y + 14); ctx.stroke(); }
  ctx.restore();
}

function renderCh113ForceVectorAnatomy(ctx, scene, state, d) {
  const p = state.primary, v = state.vector;
  base(ctx, 'Véc tơ lực: điểm đặt, phương, chiều', P.tone(0));
  P.dashedLine(ctx, 70, p.y, 610, p.y, P.tone(6));
  P.dashedLine(ctx, v.x, p.y, v.x, v.y, P.tone(6));
  arrow(ctx, p.x, p.y, v.x, v.y, P.tone(0), 'F', 3.5);
  arrow(ctx, p.x, p.y, v.x, p.y, P.tone(1), 'Fx', 2.4);
  arrow(ctx, v.x, p.y, v.x, v.y, P.tone(2), 'Fy', 2.4);
  P.angleArc(ctx, p.x, p.y, 46, 0, -Math.atan2(d.dy, d.dx), P.tone(3), 'α');
  handle(ctx, p.x, p.y, P.tone(1));
  handle(ctx, v.x, v.y, P.tone(0));
  label(ctx, 'A', p.x - 18, p.y + 4);
  P.domMath(ctx, 'force-vector-equation', 468, 76, '\\vec{F}=F(\\cos\\alpha\\,\\vec{i}+\\sin\\alpha\\,\\vec{j})', { color: P.tone(0), width: 248 });
  P.domMath(ctx, 'force-components', 468, 128, `F_x=${d.fx.toFixed(0)}\\,\\mathrm{N}\\quad F_y=${d.fy.toFixed(0)}\\,\\mathrm{N}`, { color: P.tone(1), width: 228 });
}

function renderCh114MomentArm(ctx, scene, state, d) {
  const p = state.primary, v = state.vector;
  base(ctx, 'Mô men lực quanh điểm O', P.tone(3));
  P.realisticPoint(ctx, O.x, O.y, { text: 'O', fill: P.tone(4) });
  P.dashedLine(ctx, O.x, O.y, p.x, O.y, P.tone(6));
  P.dashedLine(ctx, p.x, O.y, p.x, p.y, P.tone(6));
  P.dimension(ctx, O.x, O.y + 28, p.x, O.y + 28, P.tone(2), 'd');
  P.realisticBody(ctx, p.x - 38, p.y - 24, 76, 48, 'điểm đặt', { material: 'metal', stroke: P.tone(3), radius: 8 });
  arrow(ctx, p.x, p.y, v.x, v.y, P.tone(0), 'F', 3.2);
  drawMomentArc(ctx, O.x, O.y, 54, P.tone(3), 'M_O');
  handle(ctx, p.x, p.y, P.tone(3));
  P.domMath(ctx, 'moment-equation', 470, 78, 'M_O(\\vec{F})=\\pm F\\cdot d', { color: P.tone(3), width: 210 });
  P.domMath(ctx, 'moment-value', 470, 126, `M_O=${d.moment.toFixed(1)}\\,\\mathrm{N.m}`, { color: P.tone(0), width: 180 });
}

function renderCh115ForceSystemReducer(ctx, scene, state, d) {
  const p = state.primary, v = state.vector, analyze = state.mode === 'Phân tích';
  base(ctx, analyze ? 'Hệ lực phẳng: phân tích lực thành phần' : 'Hệ lực phẳng: thu gọn tại O', P.tone(2));
  P.realisticPoint(ctx, 250, 245, { text: 'O', fill: P.tone(4) });
  P.realisticBody(ctx, 315, 170, 150, 86, 'vật rắn', { material: 'metal', radius: 10, stroke: P.tone(2) });
  const forces = [[315, 198, 392, 135, P.tone(0), 'F1'], [430, 226, 485, 150, P.tone(1), 'F2'], [355, 252, 295, 190, P.tone(4), 'F3']];
  forces.forEach(f => arrow(ctx, f[0], f[1], f[2], f[3], f[4], f[5], 2.6));
  if (analyze) {
    forces.forEach(f => { P.dashedLine(ctx, f[0], f[1], f[2], f[1], f[4]); P.dashedLine(ctx, f[2], f[1], f[2], f[3], f[4]); });
    P.domMath(ctx, 'force-system-analysis', 520, 86, '\\sum F_x,\\ \\sum F_y,\\ \\sum M_O', { color: P.tone(4), width: 190 });
  } else {
    arrow(ctx, p.x, p.y, v.x, v.y, P.tone(2), 'R', 3.6);
    drawMomentArc(ctx, 250, 245, 46, P.tone(6), 'M_O');
    P.domMath(ctx, 'force-system-result', 520, 86, `\\vec{R}=\\sum\\vec{F}_i`, { color: P.tone(2), width: 190 });
  }
  handle(ctx, v.x, v.y, P.tone(2));
  P.domMath(ctx, 'force-system-moment', 520, 132, `M_O=${d.moment.toFixed(1)}\\,\\mathrm{N.m}`, { color: P.tone(6), width: 190 });
}

function renderCh116CoupleFreeVector(ctx, scene, state, d) {
  const cx = 380, yTop = 145, yBot = 275;
  const dist = Math.max(80, Math.min(260, (state.distance || 3) * 60));
  const left = cx - dist / 2, right = cx + dist / 2;
  base(ctx, 'Ngẫu lực: hai lực song song ngược chiều', P.tone(6));
  P.realisticBody(ctx, left - 35, 170, dist + 70, 72, 'vật tự do', { material: 'metal', radius: 10, stroke: P.tone(6) });
  arrow(ctx, left, yBot, left, yTop, P.tone(0), '+F', 3.2);
  arrow(ctx, right, yTop, right, yBot, P.tone(0), '-F', 3.2);
  P.dimension(ctx, left, 306, right, 306, P.tone(1), 'd');
  drawMomentArc(ctx, 592, 206, 48, P.tone(6), 'M');
  handle(ctx, right, 246, P.tone(6));
  P.domMath(ctx, 'couple-equation', 70, 78, 'M=F\\cdot d', { color: P.tone(6), width: 160 });
  P.domMath(ctx, 'couple-value', 70, 126, `M=${d.moment.toFixed(1)}\\,\\mathrm{N.m}`, { color: P.tone(0), width: 180 });
}

function renderCh118ConstraintRelease(ctx, scene, state, d) {
  const mode = state.mode || 'Tựa', p = state.primary, v = state.vector;
  base(ctx, `Phản lực liên kết: ${mode}`, P.tone(4));
  ground(ctx, 92, 305, 560);
  P.realisticBody(ctx, 325, 205, 112, 54, 'vật', { material: 'metal', radius: 8, stroke: P.tone(4) });
  arrow(ctx, p.x, p.y, v.x, v.y, P.tone(0), 'F', 3);
  if (mode === 'Dây') {
    P.cable(ctx, 168, 76, 381, 205, { sag: 10, color: P.tone(5), lineWidth: 2.4 });
    arrow(ctx, 381, 205, 214, 104, P.tone(5), 'T', 2.8);
  } else if (mode === 'Bản lề') {
    P.point(ctx, 381, 260, P.tone(4), 'A'); arrow(ctx, 381, 260, 318, 260, P.tone(1), 'Rx'); arrow(ctx, 381, 260, 381, 196, P.tone(2), 'Ry');
  } else if (mode === 'Gối') {
    P.supportTriangle(ctx, 381, 260, 16, P.tone(4)); arrow(ctx, 381, 262, 430, 210, P.tone(2), 'N');
  } else if (mode === 'Ngàm') {
    ctx.fillStyle = P.isDarkTheme() ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)';
    ctx.fillRect(292, 150, 22, 150); arrow(ctx, 314, 225, 366, 225, P.tone(1), 'Rx'); arrow(ctx, 314, 225, 314, 166, P.tone(2), 'Ry'); drawMomentArc(ctx, 315, 226, 32, P.tone(6), 'M');
  } else {
    arrow(ctx, 381, 262, 381, 198, P.tone(2), 'N', 2.8);
  }
  handle(ctx, p.x, p.y, P.tone(0));
  P.domPanel(ctx, 'constraint-equation', 506, 80, 166, 40, 'Liên kết tạo phản lực', { color: P.tone(4) });
  P.domPanel(ctx, 'constraint-state', 506, 130, 160, 46, `${d.supportDof}: ${d.supportReaction}`, { color: P.tone(4) });
}

function renderCh121TwoForceBody(ctx, scene, state, d) {
  const b = state.primary, tip = state.vector;
  const a = { x: 250, y: b.y };
  const dx = tip.x - b.x, dy = tip.y - b.y;
  const leftTip = { x: a.x - dx, y: a.y - dy };
  base(ctx, 'Cặp lực cân bằng: cùng đường tác dụng', P.tone(5));
  P.realisticBeam(ctx, a.x, a.y, b.x, b.y, { material: 'metal', height: 18, stroke: P.tone(5), shadow: true });
  P.realisticPoint(ctx, a.x, a.y, { text: 'A', fill: P.tone(1) });
  P.realisticPoint(ctx, b.x, b.y, { text: 'B', fill: P.tone(1) });
  P.dashedLine(ctx, leftTip.x - 20, leftTip.y, tip.x + 20, tip.y, P.tone(6));
  arrow(ctx, a.x, a.y, leftTip.x, leftTip.y, P.tone(0), 'F1', 3.2);
  arrow(ctx, b.x, b.y, tip.x, tip.y, P.tone(0), 'F2', 3.2);
  handle(ctx, tip.x, tip.y, P.tone(0));
  P.domMath(ctx, 'two-force-balance', 486, 82, '\\vec{F}_1+\\vec{F}_2=\\vec{0}', { color: P.tone(5), width: 210 });
  P.domMath(ctx, 'two-force-error', 486, 130, `e=${d.balanceError.toFixed(1)}\\,\\mathrm{px}`, { color: d.balanceError < 6 ? P.tone(2) : P.tone(0), width: 150 });
}

function renderCh123ParallelogramLaw(ctx, scene, state, d) {
  const f1 = state.primary || { x: 350, y: 180 };
  const f2 = state.secondary || { x: 380, y: 300 };
  const res = { x: f1.x + f2.x - PARA_O.x, y: f1.y + f2.y - PARA_O.y };
  const dark = P.isDarkTheme();
  ctx.clearRect(0, 0, W, H);
  if (R.drawThemeGrid) R.drawThemeGrid(ctx, W, H, 30);
  ctx.beginPath(); ctx.moveTo(PARA_O.x, PARA_O.y); ctx.lineTo(f1.x, f1.y); ctx.lineTo(res.x, res.y); ctx.lineTo(f2.x, f2.y); ctx.closePath();
  ctx.fillStyle = dark ? 'rgba(39,174,96,.08)' : 'rgba(39,174,96,.12)'; ctx.fill();
  ctx.strokeStyle = dark ? 'rgba(39,174,96,.25)' : 'rgba(39,174,96,.35)'; ctx.lineWidth = 1; ctx.stroke();
  if (R.drawDashed) { R.drawDashed(ctx, f1.x, f1.y, res.x, res.y, PARA_COLORS.f2); R.drawDashed(ctx, f2.x, f2.y, res.x, res.y, PARA_COLORS.f1); }
  else { P.dashedLine(ctx, f1.x, f1.y, res.x, res.y, PARA_COLORS.f2); P.dashedLine(ctx, f2.x, f2.y, res.x, res.y, PARA_COLORS.f1); }
  arrow(ctx, PARA_O.x, PARA_O.y, f1.x, f1.y, PARA_COLORS.f1, '', 3);
  arrow(ctx, PARA_O.x, PARA_O.y, f2.x, f2.y, PARA_COLORS.f2, '', 3);
  arrow(ctx, PARA_O.x, PARA_O.y, res.x, res.y, PARA_COLORS.r, '', 3.5);
  const a1 = Math.atan2(f1.y - PARA_O.y, f1.x - PARA_O.x);
  const a2 = Math.atan2(f2.y - PARA_O.y, f2.x - PARA_O.x);
  if (R.drawAngleArc) R.drawAngleArc(ctx, PARA_O.x, PARA_O.y, a1, a2, 35, dark ? 'rgba(201,150,58,.6)' : 'rgba(139,105,20,.6)');
  label(ctx, 'F₁', (PARA_O.x + f1.x) / 2 - 20, (PARA_O.y + f1.y) / 2 - 8, PARA_COLORS.f1, 14);
  label(ctx, 'F₂', (PARA_O.x + f2.x) / 2 + 10, (PARA_O.y + f2.y) / 2 + 18, PARA_COLORS.f2, 14);
  label(ctx, 'R', (PARA_O.x + res.x) / 2 + 8, (PARA_O.y + res.y) / 2 - 8, PARA_COLORS.r, 14);
  label(ctx, 'O', PARA_O.x - 15, PARA_O.y + 5, dark ? '#e8ecf1' : '#1a1a2e', 12);
  label(ctx, 'α', PARA_O.x + 45 * Math.cos((a1 + a2) / 2) - 4, PARA_O.y + 45 * Math.sin((a1 + a2) / 2) + 4, dark ? 'rgba(201,150,58,.8)' : 'rgba(139,105,20,.8)', 12);
  ctx.beginPath(); ctx.arc(PARA_O.x, PARA_O.y, 5, 0, Math.PI * 2); ctx.fillStyle = dark ? '#e8ecf1' : '#1a1a2e'; ctx.fill();
  handle(ctx, f1.x, f1.y, PARA_COLORS.f1); handle(ctx, f2.x, f2.y, PARA_COLORS.f2);
  P.domMath(ctx, 'parallelogram-equation', 470, 72, '\\vec{R}=\\vec{F}_1+\\vec{F}_2', { color: PARA_COLORS.r, width: 220 });
  P.domMath(ctx, 'parallelogram-resultant', 470, 120, `R=${d.resultantMagnitude.toFixed(1)}\\,\\mathrm{N}`, { color: PARA_COLORS.r, width: 170 });
}

function renderCh126FbdBuilder(ctx, scene, state, d) {
  const p = state.primary || { x: 468, y: 118 };
  base(ctx, 'Giải phóng liên kết: thay liên kết bằng phản lực', P.tone(4));
  P.panel(ctx, 54, 84, 214, 230, 'vật còn liên kết', P.tone(4));
  P.realisticBody(ctx, 116, 160, 88, 60, 'vật', { material: 'metal', radius: 8, stroke: P.tone(4) });
  P.ground(ctx, 86, 244, 234); P.supportTriangle(ctx, 160, 222, 12, P.tone(4));
  arrow(ctx, 160, 160, 160, 104, PARA_COLORS.f1, 'F', 3);
  P.panel(ctx, 342, 84, 250, 230, 'sơ đồ vật thể tự do', P.tone(1));
  P.realisticBody(ctx, 430, 176, 92, 62, 'đã tách', { material: 'metal', radius: 8, stroke: P.tone(1) });
  arrow(ctx, 476, 176, p.x, p.y, PARA_COLORS.f1, 'F', 3);
  arrow(ctx, 430, 238, 382, 274, P.tone(1), 'R_x', 2.8);
  arrow(ctx, 522, 238, 570, 274, PARA_COLORS.r, 'R_y', 2.8);
  drawMomentArc(ctx, 476, 238, 38, P.tone(6), 'M_O');
  handle(ctx, p.x, p.y, PARA_COLORS.f1);
  P.domMath(ctx, 'fbd-equations', 604, 94, '\\sum\\vec{F}=\\vec{0}\\quad \\sum M_O=0', { color: P.tone(4), width: 140 });
  P.domMath(ctx, 'fbd-result', 604, 150, `R=${d.resultantMagnitude.toFixed(1)}\\,\\mathrm{N}`, { color: PARA_COLORS.r, width: 120 });
}

[
  ['ch1-1-3', 'ch1-1-3-force-vector-anatomy-renderer', renderCh113ForceVectorAnatomy], ['ch1-1-4', 'ch1-1-4-moment-arm-renderer', renderCh114MomentArm],
  ['ch1-1-5', 'ch1-1-5-force-system-reducer-renderer', renderCh115ForceSystemReducer], ['ch1-1-6', 'ch1-1-6-couple-free-vector-renderer', renderCh116CoupleFreeVector],
  ['ch1-1-8', 'ch1-1-8-constraint-release-renderer', renderCh118ConstraintRelease], ['ch1-2-1', 'ch1-2-1-two-force-body-renderer', renderCh121TwoForceBody],
  ['ch1-2-3', 'ch1-2-3-parallelogram-law-renderer', renderCh123ParallelogramLaw], ['ch1-2-6', 'ch1-2-6-fbd-builder-renderer', renderCh126FbdBuilder]
].forEach(row => registry.register(row[0], row[1], row[2]));

})();
