/**
 * Route renderers for Ch2 instant center and plane motion routes.
 * ch2-5-1: Plane translation + rotation
 * ch2-5-2: Instant center (slider-crank IC)
 * ch2-5-3: Velocity distribution on rotating bar
 */
(function() {
'use strict';

const registry = window.SimRouteRenderers;
const P = window.SimRouteRendererPrimitives;
if (!registry || !P) return;

function mag(vector) {
  return Math.hypot((vector && vector.vx) || 0, (vector && vector.vy) || 0);
}

function arrowFromVector(ctx, point, vector, scale, color, label) {
  P.neonArrow(ctx, point.x, point.y, point.x + (vector.vx || 0) * scale, point.y + (vector.vy || 0) * scale, color, label);
}

function renderCh251PlaneTranslationRotation(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Chuyển động phẳng: v_B = v_A + ω × AB', P.tone(1));
  const ox = state.ox || 180, oy = state.oy || 170;
  const ax = state.ax || (ox + 80), ay = state.ay || oy;
  const bx = state.bx || (ax + 160), by = state.by || ay;
  const phi = state.phi || 0, omega = state.omega || 1.0;

  P.realisticBody(ctx, ox, oy - 28, bx - ox + 8, 56, 'vật rắn', { material: 'metal', radius: 8 });
  P.dashedLine(ctx, ax, ay, bx, by, P.tone(6));
  P.angleArc(ctx, ox + (bx - ox) / 2, oy, 36, -0.5, phi - 0.5, P.tone(6), 'ω');
  P.realisticPoint(ctx, ox, oy, { text: 'O', fill: P.tone(4) });
  P.realisticPoint(ctx, ax, ay, { text: 'A', fill: P.tone(0) });
  P.realisticPoint(ctx, bx, by, { text: 'B', fill: P.tone(1) });
  const vA = state.vA || { vx: 46, vy: -8 };
  const vBA = state.vBA || { vx: -omega * (by - ay), vy: omega * (bx - ax) };
  const vB = state.vB || { vx: vA.vx + vBA.vx, vy: vA.vy + vBA.vy };
  arrowFromVector(ctx, { x: ax, y: ay }, vA, 0.55, P.tone(0), 'v_A');
  arrowFromVector(ctx, { x: bx, y: by }, vBA, 0.18, P.tone(3), 'ω×AB');
  arrowFromVector(ctx, { x: bx, y: by }, vB, 0.28, P.tone(1), 'v_B');
  P.domMath(ctx, 'plane-motion-eq', 380, 60, `\\vec{v}_B=\\vec{v}_A+\\vec{\\omega}\\times\\overrightarrow{AB}`, { color: P.tone(1) });
  P.domMath(ctx, 'plane-omega', 380, 82, `\\omega=${omega.toFixed(2)};\\ |v_B|=${mag(vB).toFixed(1)}`, { color: P.tone(6) });
}

function renderCh252InstantCenter(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Tâm vận tốc tức thời: vận tốc vuông góc bán kính IC', P.tone(3));
  const theta = Number.isFinite(Number(state.theta)) ? Number(state.theta) * Math.PI / 180 : 0;
  const omega = state.omega || 1.5, r = 80, L = 180;
  const ox = 140, oy = 260;
  const ax = state.ax || (ox + r * Math.cos(theta));
  const ay = state.ay || (oy - r * Math.sin(theta));
  const bx = state.bx || (ax + L * Math.cos(theta + Math.PI / 4));
  const by = state.by || (ay + L * Math.sin(theta + Math.PI / 4));

  P.realisticGround(ctx, ox - 24, oy + 8, ox + 24, { material: 'concrete' });
  P.realisticBeam(ctx, ox, oy, ax, ay, { material: 'metal', height: 10 });
  P.realisticBeam(ctx, ax, ay, bx, by, { material: 'metal', height: 10 });

  P.realisticPoint(ctx, ox, oy, { text: 'O', fill: P.tone(4) });
  P.realisticPoint(ctx, ax, ay, { text: 'A', fill: P.tone(0) });
  P.realisticPoint(ctx, bx, by, { text: 'B', fill: P.tone(1) });

  const icX = Number.isFinite(Number(state.icX)) ? Number(state.icX) : ox;
  const icY = Number.isFinite(Number(state.icY)) ? Number(state.icY) : oy;

  ctx.save();
  ctx.strokeStyle = P.tone(2);
  ctx.lineWidth = 2;
  const pulse = 1 + 0.15 * Math.sin((state.phi || 0) * 3);
  ctx.beginPath(); ctx.arc(icX, icY, 10 * pulse, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();

  P.realisticPoint(ctx, icX, icY, { text: 'IC', fill: P.tone(2), radius: 6 });
  P.dashedLine(ctx, icX, icY, ax, ay, P.tone(2));
  P.dashedLine(ctx, icX, icY, bx, by, P.tone(2));

  const vB = state.vB || { vx: -omega * (by - icY), vy: omega * (bx - icX) };
  arrowFromVector(ctx, { x: bx, y: by }, vB, 0.38, P.tone(2), 'v_B');
  P.domMath(ctx, 'ic-eq', 376, 58, `\\vec{v}_B=\\vec{\\omega}\\times\\overrightarrow{IB}`, { color: P.tone(3) });
  P.domMath(ctx, 'ic-vb', 376, 80, `I(${icX.toFixed(0)},${icY.toFixed(0)});\\ |v_B|=${mag(vB).toFixed(1)}`, { color: P.tone(2) });
}

function renderCh253VelocityDistribution(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Phân bố vận tốc: v ∝ r từ IC', P.tone(2));
  const omega = state.omega || 1.2, L = 220, ox = 118, oy = 238;
  const ex = state.ex || (ox + L), ey = state.ey || oy;

  P.realisticBeam(ctx, ox, oy, ex, ey, { material: 'metal', height: 12 });
  const samples = state.velocitySamples || [0, 0.25, 0.5, 0.75, 1].map(t => {
    const px = ox + (ex - ox) * t, py = oy + (ey - oy) * t;
    return { x: px, y: py, vx: -omega * (py - oy), vy: omega * (px - ox), speed: omega * Math.hypot(px - ox, py - oy) };
  });
  samples.forEach((sample, i) => {
    P.realisticPoint(ctx, sample.x, sample.y, { text: i === 0 ? 'IC' : `P${i}`, fill: P.tone(i), radius: 4 });
    if (sample.speed > 5) arrowFromVector(ctx, sample, sample, 0.34, P.tone(i), i === samples.length - 1 ? 'v_B' : '');
  });
  P.domLabel(ctx, 'ic-hint', 400, 280, 'IC ≡ O', { color: P.tone(6) });
  P.domMath(ctx, 'vel-dist-eq', 382, 58, `\\vec{v}_A=\\vec{\\omega}\\times\\overrightarrow{IA}`, { color: P.tone(2) });
  P.domMath(ctx, 'vel-dist-relation', 382, 80, `v=\\omega r;\\ \\omega=${omega.toFixed(2)}`, { color: P.tone(6) });
}

// ─── Registry ───────────────────────────────────────────────────────────────

registry.register('ch2-5-1', 'ch2-5-1-plane-translation-rotation-renderer', renderCh251PlaneTranslationRotation);
registry.register('ch2-5-2', 'ch2-5-2-instant-center-renderer', renderCh252InstantCenter);
registry.register('ch2-5-3', 'ch2-5-3-velocity-distribution-renderer', renderCh253VelocityDistribution);

})();
