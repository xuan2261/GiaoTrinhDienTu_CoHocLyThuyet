/**
 * Route renderers for Ch2 rotation and gear/belt transmission.
 * ch2-2-2: Fixed-axis rotation — bar AB rotating about O with omega/alpha
 * ch2-3-2: Belt/gear transmission — two pulleys with belt, omega2 = omega1 * r1/r2
 */
(function() {
'use strict';

const registry = window.SimRouteRenderers;
const P = window.SimRouteRendererPrimitives;
if (!registry || !P) return;

// ─── ch2-2-2: Fixed-Axis Rotation ───────────────────────────────────────────

function renderCh222FixedAxisRotation(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Quay quanh trục cố định: φ = ω₀t + ½αt²', P.tone(1));

  const cx = 266, cy = 170, r = 86;
  const theta = state.theta || 0;
  const omegaCur = state.omegaCur || state.omega || 1.5;
  const alpha = state.alpha || 0;

  P.realisticWheel(ctx, cx, cy, r, theta, { spokes: 4, shadow: true });
  P.realisticPoint(ctx, cx, cy, { text: 'O', fill: P.tone(4) });

  const px = cx + r * Math.cos(theta), py = cy - r * Math.sin(theta);
  P.realisticPoint(ctx, px, py, { text: 'P', fill: P.tone(0), radius: 5 });

  const vMag = omegaCur * r, tangentX = -Math.sin(theta), tangentY = -Math.cos(theta);
  P.neonArrow(ctx, px, py, px + tangentX * vMag / 6, py - tangentY * vMag / 6, P.tone(1), 'v');

  const anMag = omegaCur * omegaCur * r, radialX = -Math.cos(theta), radialY = Math.sin(theta);
  P.neonArrow(ctx, px, py, px + radialX * anMag / 12, py + radialY * anMag / 12, P.tone(2), 'an');

  if (Math.abs(alpha) > 0.01) {
    const atMag = alpha * r;
    P.neonArrow(ctx, px, py, px + tangentX * atMag / 8, py - tangentY * atMag / 8, P.tone(3), 'at');
  }

  P.angleArc(ctx, cx, cy, 44, -Math.PI / 2, theta - Math.PI / 2, P.tone(6), 'θ');
  P.ground(ctx, cx - 24, cy + r + 16, cx + 24);

  P.domMath(ctx, 'omega-display', 374, 58, `\\omega=${omegaCur.toFixed(2)}`, { color: P.tone(1) });
  P.domMath(ctx, 'alpha-display', 374, 76, `\\alpha=${alpha.toFixed(2)}`, { color: P.tone(3) });
}

function renderCh232GearBeltTransmission(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Truyền động bánh/dây: ω₁r₁ = ω₂r₂', P.tone(6));

  const phi1 = state.phi1 || 0, phi2 = state.phi2 || 0;
  const r1 = state.r1 || 50, r2 = state.r2 || 90;
  const omega1 = state.omega || 1.5, omega2 = state.omega2 || (omega1 * r1 / r2);
  const c1x = 190, c1y = 174, c2x = 370, c2y = 174;

  const dy = r2 - r1, dx = c2x - c1x, alpha = Math.asin(dy / dx);

  P.cable(ctx, c1x + r1 * Math.sin(alpha), c1y - r1 * Math.cos(alpha), c2x + r2 * Math.sin(alpha), c2y - r2 * Math.cos(alpha), { sag: 2, color: '#495057', lineWidth: 2 });
  P.cable(ctx, c1x + r1 * Math.sin(alpha), c1y + r1 * Math.cos(alpha), c2x + r2 * Math.sin(alpha), c2y + r2 * Math.cos(alpha), { sag: -2, color: '#495057', lineWidth: 2 });

  P.realisticWheel(ctx, c1x, c1y, r1, phi1, { spokes: 4, shadow: true });
  P.realisticWheel(ctx, c2x, c2y, r2, -phi2, { spokes: 6, shadow: true });

  P.realisticPoint(ctx, c1x, c1y, { text: 'O1', fill: P.tone(4) });
  P.realisticPoint(ctx, c2x, c2y, { text: 'O2', fill: P.tone(4) });

  P.panel(ctx, 210, 260, 180, 52, 'quan hệ truyền động', P.tone(6));
  P.domMath(ctx, 'no-slip-eq', 224, 268, `\\omega_1 r_1 = \\omega_2 r_2`, { color: P.tone(6) });
  P.domMath(ctx, 'omega2-val', 228, 286, `\\omega_2 = ${omega2.toFixed(2)}`, { color: P.tone(1) });
}

// ─── Registry ──────────────────────────────────────────────────────────────────

registry.register('ch2-2-2', 'ch2-2-2-fixed-axis-rotation-renderer', renderCh222FixedAxisRotation);
registry.register('ch2-3-2', 'ch2-3-2-belt-gear-transmission-renderer', renderCh232GearBeltTransmission);

})();
