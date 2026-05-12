/**
 * Route renderers for Ch3 dynamics theorems.
 * Routes: ch3-5-1, ch3-5-2, ch3-5-3, ch3-5-4
 */
(function() {
'use strict';

const registry = window.SimRouteRenderers;
const P = window.SimRouteRendererPrimitives;
if (!registry || !P) return;

// ─── ch3-5-1: Center of mass ────────────────────────────────────────────────

function renderCh351CenterOfMass(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Định lý khối tâm: m·a_CM = ΣF_ext', P.tone(1));
  const masses = state.masses || [
    { x: 130, y: 188, m: 2 },
    { x: 238, y: 130, m: 1.5 },
    { x: 332, y: 204, m: 1 }
  ];
  const totalM = masses.reduce((s, m) => s + m.m, 0);
  let xCM = 0, yCM = 0;
  for (const m of masses) { xCM += m.x * m.m; yCM += m.y * m.m; }
  xCM /= totalM; yCM /= totalM;

  masses.forEach((m, i) => {
    P.realisticPoint(ctx, m.x, m.y, { text: `m${i + 1}`, fill: P.tone(i), radius: 6 + m.m * 2 });
    P.dashedLine(ctx, m.x, m.y, xCM, yCM, P.tone(6));
  });

  P.realisticPoint(ctx, xCM, yCM, { text: 'C', fill: P.tone(0), radius: 8 });
  P.neonArrow(ctx, xCM, yCM, xCM + 120, yCM - 60, P.tone(0), 'ΣF_ext');
  P.neonArrow(ctx, xCM, yCM, xCM + 80, yCM + 10, P.tone(2), 'a_CM');

  P.domMath(ctx, '351-com', 330, 276, `x_C = ${xCM.toFixed(0)}`, { color: P.tone(1) });
  P.domMath(ctx, '351-eq', 330, 296, `m_C \\vec{a}_C = \\sum \\vec{F}_{ext}`, { color: P.tone(1) });
}

// ─── ch3-5-2: Impulse-momentum ───────────────────────────────────────────────

function renderCh352ImpulseMomentum(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Xung lượng - động lượng: J = Δp', P.tone(3));
  P.panel(ctx, 68, 82, 168, 152, 'F(t) xung lượng', P.tone(3));

  ctx.save();
  ctx.strokeStyle = P.tone(3); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(96, 214); ctx.lineTo(128, 136); ctx.lineTo(170, 122); ctx.lineTo(206, 214); ctx.closePath();
  ctx.fillStyle = P.isDarkTheme() ? 'rgba(253,126,20,.1)' : 'rgba(253,126,20,.15)'; ctx.fill(); ctx.stroke();
  ctx.restore();

  const pBefore = (state.m || 2) * 6;
  const pAfter = pBefore + (state.J || 20);

  P.panel(ctx, 268, 82, 244, 152, 'động lượng trước/sau', P.tone(1));
  P.barGraph(ctx, 290, 190, 60, 24, pBefore, 100, P.tone(1), 'p_truoc');
  P.barGraph(ctx, 380, 190, 60, 24, pAfter, 100, P.tone(0), 'p_sau');

  P.neonArrow(ctx, 336, 150, 406, 150, P.tone(6), `J`);
  P.domMath(ctx, '352-eq', 334, 274, `\\Delta p = ${(pAfter-pBefore).toFixed(1)}`, { color: P.tone(3) });
}

// ─── ch3-5-3: Angular momentum ───────────────────────────────────────────────

function renderCh353AngularMomentum(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Mô men động lượng: L = Iω', P.tone(4));
  const I = state.I || 1, omega = state.omega || 2, L = I * omega;
  const angle = (state._t || 0) * omega * 2;

  P.realisticPoint(ctx, 148, 242, { text: 'O', fill: P.tone(4) });
  const rx = 148 + Math.cos(angle) * (state.r || 60);
  const ry = 242 + Math.sin(angle) * (state.r || 60);
  P.dashedLine(ctx, 148, 242, rx, ry, P.tone(6));

  P.realisticPoint(ctx, rx, ry, { text: 'm', fill: P.tone(0), radius: 10 });

  const vx = -Math.sin(angle) * omega * (state.r || 60) * 0.5;
  const vy = Math.cos(angle) * omega * (state.r || 60) * 0.5;
  P.neonArrow(ctx, rx, ry, rx + vx * 0.8, ry + vy * 0.8, P.tone(1), 'mv');

  P.angleArc(ctx, 148, 242, 30, angle - 0.6, angle + 0.2, P.tone(4), 'r');

  P.panel(ctx, 308, 84, 192, 172, 'mô men động lượng', P.tone(4));
  P.domMath(ctx, '353-L', 324, 96, `\\vec{L}_O = \\vec{r} \\times m\\vec{v}`, { color: P.tone(4) });
  P.domMath(ctx, '353-I', 326, 130, `I = ${I.toFixed(2)}`, { color: P.tone(6) });
  P.domMath(ctx, '353-omega', 326, 160, `\\omega = ${omega.toFixed(2)}`, { color: P.tone(1) });
}

// ─── ch3-5-4: Work-energy theorem ───────────────────────────────────────────

function renderCh354WorkEnergy(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Định lý động năng: T + V = const', P.tone(3));
  const T = d.kineticEnergy || 0, V = d.potentialEnergy || 0;
  const E = Math.max(Math.abs(T + V), 1);

  P.panel(ctx, 60, 82, 210, 180, 'biểu đồ năng lượng', P.tone(3));
  P.barGraph(ctx, 80, 150, 170, 20, T, E, '#0d6efd', 'Động năng T');
  P.barGraph(ctx, 80, 200, 170, 20, V, E, '#fd7e14', 'Thế năng V');
  P.barGraph(ctx, 80, 250, 170, 20, T + V, E, P.tone(3), 'Cơ năng E');

  P.panel(ctx, 290, 82, 210, 180, 'các định lý', P.tone(1));
  P.domMath(ctx, '354-KE', 306, 96, 'T = \\frac12mv^2', { color: P.tone(1) });
  P.domMath(ctx, '354-PE', 306, 126, 'V = mgh', { color: P.tone(3) });
  P.domMath(ctx, '354-W', 306, 156, 'A = \\Delta T', { color: P.tone(2) });
  P.domMath(ctx, '354-cons', 306, 186, 'T + V = const', { color: P.tone(0) });
}

// ─── Register ───────────────────────────────────────────────────────────────

registry.register('ch3-5-1', 'ch3-5-1-center-of-mass-renderer', renderCh351CenterOfMass);
registry.register('ch3-5-2', 'ch3-5-2-impulse-momentum-renderer', renderCh352ImpulseMomentum);
registry.register('ch3-5-3', 'ch3-5-3-angular-momentum-renderer', renderCh353AngularMomentum);
registry.register('ch3-5-4', 'ch3-5-4-work-energy-renderer', renderCh354WorkEnergy);

})();
