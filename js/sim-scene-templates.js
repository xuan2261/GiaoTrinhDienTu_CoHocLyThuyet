/**
 * Deterministic scene renderers for route-specific simulation labs.
 */
(function() {
'use strict';

const core = window.SimCore || {};
const render = window.SimRender || {};
const W = 760, H = 440;
const palette = ['#dc3545', '#0d6efd', '#198754', '#fd7e14', '#6f42c1', '#0dcaf0', '#b8860b'];
const color = index => palette[Math.abs(index || 0) % palette.length];

function seed(scene) {
  return Number(scene.seed || 1);
}

function label(ctx, text, x, y, size, fill) {
  ctx.fillStyle = fill || '#212529';
  ctx.font = `bold ${size || 12}px Inter, sans-serif`;
  ctx.fillText(text || '', x, y);
}

function arrow(ctx, x1, y1, x2, y2, fill, text) {
  if (core.drawArrow) core.drawArrow(ctx, x1, y1, x2, y2, fill, 2.4, text);
}

function base(ctx, scene) {
  if (core.clearCanvas) core.clearCanvas(ctx, W, H);
  if (render.drawGrid) render.drawGrid(ctx, W, H, 40);
  ctx.fillStyle = 'rgba(255,255,255,.82)';
  ctx.strokeStyle = '#dee2e6';
  ctx.lineWidth = 1;
  ctx.fillRect(18, 18, W - 36, H - 36);
  ctx.strokeRect(18, 18, W - 36, H - 36);
  label(ctx, scene.visualLabel || scene.title || scene.sceneId, 30, 42, 13, color(seed(scene)));
}

function drawStatics(ctx, scene, state, d) {
  const y = 244 - seed(scene) % 18;
  ctx.strokeStyle = '#495057';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(66, y);
  ctx.lineTo(492, y + (seed(scene) % 3 - 1) * 8);
  ctx.stroke();
  ctx.fillStyle = 'rgba(111,66,193,.14)';
  ctx.strokeStyle = color(seed(scene) + 3);
  ctx.fillRect(state.primary.x - 42, state.primary.y - 26, 84, 52);
  ctx.strokeRect(state.primary.x - 42, state.primary.y - 26, 84, 52);
  arrow(ctx, 92, y + 52, 92, y + 8, color(2), 'RA');
  arrow(ctx, 468, y + 52, 468, y + 8, color(1), 'RB');
  arrow(ctx, state.primary.x, state.primary.y, state.vector.x, state.vector.y, color(seed(scene)), scene.forceLabel || 'F');
  arrow(ctx, 96, 264, state.primary.x, state.primary.y, color(6), 'r');
  label(ctx, `M=${(d.moment / 100).toFixed(1)}`, 34, 306, 12);
}

function drawSupport(ctx, scene, state, d) {
  ctx.strokeStyle = '#6c757d';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(80, 275);
  ctx.lineTo(480, 275);
  ctx.stroke();
  const x = 170 + seed(scene) * 9 % 190;
  if (scene.template.includes('cable')) {
    ctx.beginPath();
    ctx.moveTo(92, 58);
    ctx.lineTo(state.primary.x, state.primary.y);
    ctx.stroke();
    arrow(ctx, state.primary.x, state.primary.y, 92, 58, color(1), 'T');
  } else if (scene.template.includes('fixed')) {
    ctx.fillStyle = '#adb5bd';
    ctx.fillRect(78, 108, 24, 168);
    arrow(ctx, 102, 188, 170, 150, color(0), 'Rx');
    arrow(ctx, 112, 220, 112, 150, color(2), 'Ry');
    ctx.strokeStyle = color(6);
    ctx.beginPath();
    ctx.arc(128, 170, 32, .2, 1.7 * Math.PI);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(x - 24, 275);
    ctx.lineTo(x, 232);
    ctx.lineTo(x + 24, 275);
    ctx.stroke();
    arrow(ctx, x, 276, x + (seed(scene) % 2 ? 58 : 0), 206, color(5), scene.supportLabel || 'N');
  }
  ctx.fillStyle = color(seed(scene) + 2);
  ctx.beginPath();
  ctx.arc(state.primary.x, state.primary.y, 22, 0, Math.PI * 2);
  ctx.fill();
  label(ctx, `alpha=${d.alpha.toFixed(0)} deg`, 360, 62, 12);
}

function drawSpatial(ctx, scene, state, d) {
  const ox = 125, oy = 250;
  arrow(ctx, ox, oy, 470, oy - 10, color(0), 'X');
  arrow(ctx, ox, oy, 118, 64, color(2), 'Y');
  arrow(ctx, ox, oy, 292, 128, color(1), 'Z');
  arrow(ctx, 248, 210, state.vector.x, state.vector.y, color(seed(scene)), 'R');
  ctx.strokeStyle = color(6);
  ctx.strokeRect(314, 78, 145, 112);
  label(ctx, scene.projection || 'projection board', 326, 104, 12);
  label(ctx, `MO=${(d.moment / 120).toFixed(1)}`, 330, 130, 12);
}

function drawFriction(ctx, scene, state, d) {
  const alpha = Math.max(8, Math.min(38, d.alpha));
  ctx.save();
  ctx.translate(92, 272);
  ctx.rotate(-alpha * Math.PI / 180);
  ctx.fillStyle = '#e9ecef';
  ctx.fillRect(0, 0, 372, 10);
  ctx.fillStyle = 'rgba(253,126,20,.18)';
  ctx.strokeStyle = color(seed(scene));
  ctx.fillRect(160, -54, 78, 48);
  ctx.strokeRect(160, -54, 78, 48);
  ctx.restore();
  arrow(ctx, state.primary.x, state.primary.y, state.primary.x - 70, state.primary.y, color(0), 'Fms');
  arrow(ctx, state.primary.x, state.primary.y, state.primary.x + 18, state.primary.y - 78, color(5), 'N');
  label(ctx, `mu=${state.mu.toFixed(2)} | ${d.slipState}`, 340, 62, 12);
}

function drawCentroid(ctx, scene, state) {
  ctx.fillStyle = 'rgba(13,110,253,.18)';
  ctx.fillRect(120, 98, 128, 92);
  ctx.fillStyle = 'rgba(25,135,84,.18)';
  ctx.fillRect(244, 150, 138, 78);
  if (scene.template.includes('hole')) {
    ctx.fillStyle = '#f8f9fa';
    ctx.beginPath();
    ctx.arc(214, 142, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.strokeStyle = color(seed(scene));
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(state.primary.x - 24, state.primary.y);
  ctx.lineTo(state.primary.x + 24, state.primary.y);
  ctx.moveTo(state.primary.x, state.primary.y - 24);
  ctx.lineTo(state.primary.x, state.primary.y + 24);
  ctx.stroke();
  label(ctx, 'C', state.primary.x + 10, state.primary.y - 10, 13, color(seed(scene)));
}

function drawKinematics(ctx, scene, state, d) {
  ctx.strokeStyle = color(seed(scene));
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i <= 230; i += 1) {
    const x = 70 + i * 1.7;
    const y = 170 + 48 * Math.sin((i + seed(scene) * 12) / (28 + seed(scene) % 9));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  arrow(ctx, state.primary.x, state.primary.y, state.vector.x, state.vector.y, color(1), 'v');
  arrow(ctx, state.primary.x, state.primary.y, state.primary.x + 42, state.primary.y + 44, color(2), 'a');
  if (core.drawAxes) core.drawAxes(ctx, 330, 68, 150, 88, 't', scene.axisLabel || 'x');
  label(ctx, `mode=${state.mode}`, 34, 306, 12);
}

function drawRotation(ctx, scene, state, d) {
  const r1 = 48 + seed(scene) % 22;
  const r2 = 84 - seed(scene) % 18;
  ctx.strokeStyle = color(1);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(190, 172, r1, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(350, 172, r2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = color(6);
  ctx.strokeRect(190, 172 - r1 - 18, 160, r1 + r2 + 36);
  arrow(ctx, 190, 172, 190 + r1, 172 - 28, color(0), 'omega1');
  arrow(ctx, 350, 172, 350 - r2, 172 + 30, color(2), 'omega2');
  label(ctx, `omega=${state.omega.toFixed(2)} rad/s`, 330, 306, 12);
}

function drawRelative(ctx, scene, state) {
  ctx.strokeStyle = '#495057';
  ctx.strokeRect(78, 182, 170, 78);
  arrow(ctx, 102, 260, 232, 260, color(1), 've');
  arrow(ctx, 232, 260, state.primary.x, state.primary.y, color(0), 'vr');
  arrow(ctx, 102, 260, state.primary.x, state.primary.y, color(2), 'va');
  label(ctx, scene.frameLabel || 'moving frame', 96, 176, 12);
  ctx.strokeStyle = color(seed(scene));
  ctx.strokeRect(320, 78, 128, 128);
  label(ctx, 'vector triangle', 332, 104, 12);
}

function drawPlane(ctx, scene, state) {
  ctx.strokeStyle = color(seed(scene));
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(146, 232);
  ctx.lineTo(state.primary.x, state.primary.y);
  ctx.lineTo(430, 236);
  ctx.stroke();
  arrow(ctx, state.primary.x, state.primary.y, state.primary.x + 58, state.primary.y - 42, color(1), 'vB');
  label(ctx, scene.centerLabel || 'IC', state.primary.x - 16, state.primary.y - 18, 12, color(0));
}

function drawDynamics(ctx, scene, state, d) {
  ctx.strokeStyle = '#dee2e6';
  ctx.beginPath();
  ctx.moveTo(48, 262);
  ctx.lineTo(512, 262);
  ctx.stroke();
  ctx.fillStyle = 'rgba(220,53,69,.15)';
  ctx.strokeStyle = color(seed(scene));
  ctx.beginPath();
  ctx.arc(state.primary.x, 218, 24 + state.mass / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  arrow(ctx, state.primary.x, 170, state.vector.x, state.vector.y, color(0), 'F');
  arrow(ctx, state.primary.x, 260, state.primary.x + d.accel * 15, 260, color(2), 'a');
  label(ctx, `a=${d.accel.toFixed(2)} m/s2`, 354, 62, 12);
}

function drawOde(ctx, scene, state) {
  if (core.drawAxes) core.drawAxes(ctx, 76, 76, 220, 140, 't', 'x');
  ctx.strokeStyle = color(seed(scene));
  ctx.beginPath();
  for (let i = 0; i <= 200; i += 8) {
    const x = 86 + i, y = 148 - 42 * Math.sin(i / 30 + state.spring);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  arrow(ctx, state.primary.x, 76, state.primary.x, 216, color(0), 't');
  ctx.strokeStyle = color(1);
  ctx.strokeRect(350, 128, 82, 46);
  label(ctx, `k=${state.spring.toFixed(1)}`, 362, 158, 12);
}

function drawTheorem(ctx, scene, state) {
  const points = [[155, 150], [260, 100], [370, 180], [250, 245]];
  ctx.strokeStyle = color(seed(scene));
  points.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(p[0] + seed(scene) % 14, p[1], 18 + i * 2, 0, Math.PI * 2);
    ctx.stroke();
  });
  arrow(ctx, 160, 260, 440, 220, color(0), scene.vectorLabel || 'p');
  arrow(ctx, 280, 170, state.vector.x, state.vector.y, color(2), scene.resultLabel || 'd/dt');
  label(ctx, scene.boardLabel || 'theorem board', 352, 68, 12);
}

function drawCollision(ctx, scene, state) {
  ctx.fillStyle = 'rgba(13,110,253,.08)';
  ctx.strokeStyle = '#0d6efd';
  ctx.fillRect(82, 82, 396, 168);
  ctx.strokeRect(82, 82, 396, 168);
  ctx.fillStyle = color(0);
  ctx.beginPath();
  ctx.arc(state.primary.x, state.primary.y, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color(1);
  ctx.beginPath();
  ctx.arc(state.secondary.x, state.secondary.y, 28, 0, Math.PI * 2);
  ctx.fill();
  arrow(ctx, state.primary.x, state.primary.y, state.vector.x, state.vector.y, color(6), 'v');
  label(ctx, `e=${state.restitution.toFixed(2)}`, 374, 306, 12);
}

function drawChecker(ctx, scene, state, d) {
  ctx.strokeStyle = '#adb5bd';
  ctx.strokeRect(66, 66, 190, 180);
  ctx.strokeRect(306, 66, 190, 180);
  label(ctx, '1. FBD', 88, 100, 13, color(seed(scene)));
  label(ctx, '2. Equation', 328, 100, 13, color(seed(scene) + 2));
  label(ctx, scene.equation || 'Σ = target', 328, 138, 12);
  arrow(ctx, state.primary.x, state.primary.y, state.vector.x, state.vector.y, color(0), 'input');
  label(ctx, `score signal ${(d.force / 10).toFixed(1)}`, 332, 208, 12);
}

function renderScene(ctx, scene, state, derived) {
  base(ctx, scene);
  ctx.setLineDash([8, 6]);
  ctx.strokeStyle = '#dc3545';
  ctx.lineWidth = 2;
  ctx.strokeRect(86, 94, W - 172, 138);
  ctx.setLineDash([]);
  label(ctx, 'Missing dedicated route renderer', 112, 132, 14, '#dc3545');
  label(ctx, scene.routeId || scene.sceneId || 'unknown route', 112, 158, 12, '#495057');
  arrow(ctx, state.primary.x, state.primary.y, state.vector.x, state.vector.y, color(seed(scene)), 'state');
  label(ctx, `force=${((derived && derived.force) || 0).toFixed(1)}`, 112, 184, 12, '#495057');
}

function signature(scene) {
  const controls = (scene.controls || []).map(item => item.label || item.key).join(',');
  const readouts = (scene.readouts || []).map(item => item.label || item.key).join(',');
  return [scene.sceneId, scene.template, scene.visualKey, controls, readouts, scene.formula].join('|');
}

window.SimSceneTemplates = {
  W,
  H,
  render: renderScene,
  signature
};

})();
