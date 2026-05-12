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

// ─── ch2-5-1: Plane Translation + Rotation ─────────────────────────────────

function renderCh251PlaneTranslationRotation(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Chuyển động phẳng: v_B = v_A + ω × AB', P.tone(1));
  const ox = state.ox || 180, oy = state.oy || 170;
  const ax = state.ax || (ox + 80), ay = state.ay || oy;
  const bx = state.bx || (ax + 160), by = state.by || ay;
  const phi = state.phi || 0, omega = state.omega || 1.0;

  P.realisticBody(ctx, ox, oy - 28, bx - ox + 8, 56, 'vật rắn', { material: 'metal', radius: 8 });
  P.angleArc(ctx, ox + (bx - ox) / 2, oy, 36, -0.5, phi - 0.5, P.tone(6), 'ω');
  P.realisticPoint(ctx, ox, oy, { text: 'O', fill: P.tone(4) });
  P.realisticPoint(ctx, ax, ay, { text: 'A', fill: P.tone(0) });
  P.realisticPoint(ctx, bx, by, { text: 'B', fill: P.tone(1) });

  const vA = { vx: 0, vy: -omega * 30 };
  P.neonArrow(ctx, ax, ay, ax + vA.vx, ay + vA.vy, P.tone(0), 'v_A');
  const vB = { vx: 40 + omega * 20, vy: -omega * 30 };
  P.neonArrow(ctx, bx, by, bx + vB.vx, by + vB.vy, P.tone(1), 'v_B');

  P.domMath(ctx, 'plane-motion-eq', 360, 60, `\\vec{v}_B = \\vec{v}_A + \\vec{v}_{BA}`, { color: P.tone(1) });
  P.domMath(ctx, 'plane-omega', 360, 78, `\\omega = ${omega.toFixed(2)}`, { color: P.tone(6) });
}

// ─── ch2-5-2: Instant Center ───────────────────────────────────────────────

function renderCh252InstantCenter(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Tâm vận tốc tức thời: v_P = ω × r_P/IC', P.tone(3));
  const theta = state.theta || 0, omega = state.omega || 1.5, r = 80, L = 180;
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

  // IC focus pulse
  ctx.save();
  ctx.strokeStyle = P.tone(2);
  ctx.lineWidth = 2;
  const pulse = 1 + 0.15 * Math.sin(Date.now() / 250);
  ctx.beginPath(); ctx.arc(icX, icY, 10 * pulse, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();

  P.realisticPoint(ctx, icX, icY, { text: 'IC', fill: P.tone(2), radius: 6 });
  P.dashedLine(ctx, icX, icY, ax, ay, P.tone(2));
  P.dashedLine(ctx, icX, icY, bx, by, P.tone(2));

  const rBX = bx - icX, rBY = by - icY;
  const vBx = -omega * rBY, vBy = omega * rBX;
  P.neonArrow(ctx, bx, by, bx + vBx * 0.4, by + vBy * 0.4, P.tone(2), 'v_B');

  P.domMath(ctx, 'ic-omega', 376, 58, `\\omega = ${omega.toFixed(2)}`, { color: P.tone(3) });
  P.domMath(ctx, 'ic-vb', 376, 76, `|v_B| = ${Math.hypot(vBx, vBy).toFixed(1)}`, { color: P.tone(2) });
}

// ─── ch2-5-3: Velocity Distribution ────────────────────────────────────────

function renderCh253VelocityDistribution(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Phân bố vận tốc: v ∝ r từ IC', P.tone(2));
  const phi = state.phi || 0, omega = state.omega || 1.2, L = 220, ox = 118, oy = 238;
  const ex = state.ex || (ox + L), ey = state.ey || oy;

  P.realisticBeam(ctx, ox, oy, ex, ey, { material: 'metal', height: 12 });

  for (let i = 0; i <= 4; i++) {
    const t = i / 4, px = ox + (ex - ox) * t, py = oy + (ey - oy) * t;
    P.realisticPoint(ctx, px, py, { text: i === 0 ? 'O' : `P${i}`, fill: P.tone(i), radius: 4 });
    const rDist = Math.hypot(px - ox, py - oy), vMag = omega * rDist;
    const tangentX = -(ey - oy) / L, tangentY = (ex - ox) / L;
    if (vMag > 5) {
       P.neonArrow(ctx, px, py, px + tangentX * vMag * 0.5, py + tangentY * vMag * 0.5, P.tone(i), '');
    }
  }
  P.domLabel(ctx, 'ic-hint', 400, 280, 'IC ≡ O', { color: P.tone(6) });
  P.domMath(ctx, 'vel-dist-omega', 382, 58, `\\omega = ${omega.toFixed(2)}`, { color: P.tone(2) });
  P.domMath(ctx, 'vel-dist-relation', 382, 76, `v = \\omega r`, { color: P.tone(6) });
}

// ─── Registry ───────────────────────────────────────────────────────────────

registry.register('ch2-5-1', 'ch2-5-1-plane-translation-rotation-renderer', renderCh251PlaneTranslationRotation);
registry.register('ch2-5-2', 'ch2-5-2-instant-center-renderer', renderCh252InstantCenter);
registry.register('ch2-5-3', 'ch2-5-3-velocity-distribution-renderer', renderCh253VelocityDistribution);

})();
