/**
 * Route renderers for Ch3 ODE solvers and D'Alembert dynamics.
 * Routes: ch3-3-1, ch3-3-2, ch3-4-1, ch3-4-2
 */
(function() {
'use strict';

const registry = window.SimRouteRenderers;
const P = window.SimRouteRendererPrimitives;
if (!registry || !P) return;

// ─── ch3-3-1: Spring-mass RK4 ────────────────────────────────────────────────

function renderCh331OdeSolver(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Dao động lò xo: RK4 integration', P.tone(0));
  P.realisticGround(ctx, 62, 120, 80, { material: 'concrete', height: 128 });
  const x = state.x || 0;
  const m = state.m || 2;
  const bodyX = 92 + x * 50;
  const bodyW = Math.round(Math.max(40, Math.min(96, 36 + m * 6)));
  const bodyAnchor = { x: bodyX, y: 184 };

  P.spring(ctx, 80, 184, bodyAnchor.x, bodyAnchor.y, {
    anchor: bodyAnchor,
    wallAnchor: { x: 80, y: 184 },
    coils: 8, width: 10, color: '#adb5bd', lineWidth: 3
  });
  P.realisticBody(ctx, bodyX, 166, bodyW, 36, 'm', { material: 'metal', radius: 4 });

  ctx.save();
  ctx.setLineDash([6, 4]); ctx.strokeStyle = P.tone(6); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(158, 120); ctx.lineTo(158, 270); ctx.stroke(); ctx.restore();

  P.realisticGround(ctx, 58, 270, 530, { material: 'concrete', height: 4 });

  const traj = state.trajectory || [];
  if (traj.length > 1) {
    ctx.save();
    ctx.strokeStyle = P.tone(1); ctx.lineWidth = 2.5;
    ctx.beginPath();
    const t0 = traj[0].t, tN = traj[traj.length - 1].t;
    const range = Math.max(0.1, tN - t0);
    for (let i = 0; i < traj.length; i++) {
      const pt = traj[i];
      const gx = 240 + ((pt.t - t0) / range) * 280;
      const gy = 194 - (pt.x || 0) * 40;
      if (i === 0) ctx.moveTo(gx, gy); else ctx.lineTo(gx, gy);
    }
    ctx.stroke();
    const last = traj[traj.length - 1];
    P.realisticPoint(ctx, 240 + ((last.t - t0) / range) * 280, 194 - (last.x || 0) * 40, { fill: P.tone(0), radius: 4 });
    ctx.restore();
  }
  if (state.diagnostics && (state.diagnostics.graph || state.diagnostics.error)) {
    const values = d && d.invariant && d.invariant.values || {};
    const kinetic = Number.isFinite(Number(values.kinetic)) ? Number(values.kinetic) : (Number(state.kinetic) || 0);
    const potential = Number.isFinite(Number(values.potential)) ? Number(values.potential) : (Number(state.potential) || 0);
    const energy = Number.isFinite(Number(values.energy)) ? Number(values.energy) : kinetic + potential;
    const drift = Number.isFinite(Number(values.energyDrift)) ? Number(values.energyDrift) : 0;
    P.barGraph(ctx, 330, 116, 150, 16, Math.min(Math.abs(drift), 1), 1, Math.abs(drift) < 0.05 ? '#198754' : '#dc3545');
    P.domLabel(ctx, '331-energy-band', 326, 142, `E=${energy.toFixed(2)}J, drift=${drift.toExponential(1)}`, { color: P.tone(4), width: 230 });
  }
  P.domMath(ctx, '331-state', 326, 62, `x = ${x.toFixed(3)}`, { color: P.tone(0) });
  P.domMath(ctx, '331-vel', 326, 84, `v = ${(state.v||0).toFixed(3)}`, { color: P.tone(2) });
}

// ─── ch3-3-2: Coupled spring-mass ────────────────────────────────────────────

function renderCh332CoupledSprings(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Cơ hệ 2 khối nối lò xo', P.tone(2));
  const x1 = state.x || 0, x2 = state.trajectory2 ? (state.trajectory2[state.trajectory2.length - 1] || { x: 0 }).x : 0;
  const m1 = state.m || 2;
  const m2 = state.m2 || m1;
  const body1W = Math.round(Math.max(36, Math.min(80, 32 + m1 * 5)));
  const body2W = Math.round(Math.max(36, Math.min(80, 32 + m2 * 5)));

  P.realisticGround(ctx, 58, 120, 76, { material: 'concrete', height: 130 });
  P.realisticGround(ctx, 492, 120, 510, { material: 'concrete', height: 130 });
  P.realisticGround(ctx, 54, 270, 526, { material: 'concrete', height: 4 });

  const body1X = 130 + x1 * 30;
  const body2X = 330 + x2 * 30;
  const body1Anchor = { x: body1X, y: 184 };
  const body2Anchor = { x: body2X, y: 184 };

  // Left spring: wall(76) → body1 left edge.
  P.spring(ctx, 76, 184, body1Anchor.x, body1Anchor.y, {
    anchor: body1Anchor,
    wallAnchor: { x: 76, y: 184 },
    coils: 8, width: 10, color: P.tone(0), lineWidth: 2.5
  });

  // Middle spring: body1 right edge → body2 left edge. Pass right-edge of body1 as wall.
  const body1RightEdge = { x: body1X + body1W, y: 184 };
  P.spring(ctx, body1RightEdge.x, body1RightEdge.y, body2Anchor.x, body2Anchor.y, {
    anchor: body2Anchor,
    wallAnchor: body1RightEdge,
    coils: 10, width: 8, color: P.tone(1), lineWidth: 2
  });

  // Right spring: body2 right edge → wall(490).
  const body2RightEdge = { x: body2X + body2W, y: 184 };
  P.spring(ctx, body2RightEdge.x, body2RightEdge.y, 490, 184, {
    anchor: { x: 490, y: 184 },
    wallAnchor: body2RightEdge,
    coils: 8, width: 10, color: P.tone(0), lineWidth: 2.5
  });

  P.realisticBody(ctx, body1X, 166, body1W, 36, 'm1', { material: 'metal', radius: 4 });
  P.realisticBody(ctx, body2X, 166, body2W, 36, 'm2', { material: 'metal', radius: 4 });

  P.panel(ctx, 68, 84, 280, 56, 'phương trình hệ', P.tone(2));
  P.domMath(ctx, '332-eq', 86, 92, 'm_1\\ddot{x}_1 = -k(x_1-x_2)', { color: P.tone(2) });
  P.domMath(ctx, '332-eq2', 86, 118, 'm_2\\ddot{x}_2 = -k(x_2-x_1)', { color: P.tone(1) });
}

// ─── ch3-4-1: D'Alembert equilibrium ─────────────────────────────────────────

function renderCh341DalembertEquilibrium(ctx, scene, state, d) {
  const a = (state.F || 50) / (state.m || 5);
  P.frame(ctx, scene, "Cân bằng động D'Alembert: F + F* = 0", P.tone(3));
  P.panel(ctx, 66, 84, 200, 178, 'sơ đồ lực', P.tone(3));
  P.realisticBody(ctx, 166, 172, 60, 44, 'm', { radius: 6, fill: 'rgba(253,126,20,.12)' });
  P.neonArrow(ctx, 226, 194, 276, 140, P.tone(0), 'F');
  P.neonArrow(ctx, 166, 194, 116, 244, P.tone(4), 'F*');
  P.realisticPoint(ctx, 196, 194, { fill: P.tone(3), radius: 4 });

  P.panel(ctx, 322, 84, 176, 178, 'cân bằng', P.tone(4));
  P.domMath(ctx, '341-eq', 338, 92, '\\vec{F} + \\vec{F}^{*} = \\vec{0}', { color: P.tone(3) });
  P.domMath(ctx, '341-ext', 340, 126, `F_{ext} = ${(state.F||50).toFixed(0)}`, { color: P.tone(0) });
  P.domMath(ctx, '341-inertia', 340, 158, `F^{*} = ${(-state.m*a).toFixed(0)}`, { color: P.tone(4) });
}

// ─── ch3-4-2: Inverse dynamics ───────────────────────────────────────────────

function renderCh342InverseDynamics(ctx, scene, state, d) {
  const t = state._t || 0;
  const a = -Math.pow(0.5, 2) * Math.sin(t * 2) * 10;
  const F = (state.m || 5) * a;
  P.frame(ctx, scene, 'Ngược động lực học: a(t) → F', P.tone(4));
  P.panel(ctx, 66, 84, 180, 170, 'biên dạng a(t)', P.tone(4));

  ctx.strokeStyle = P.tone(4); ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(92, 198);
  for (let i = 0; i <= 160; i += 4) {
    const u = i / 40;
    const ya = 198 - 40 * Math.sin(u * 0.8 + t * 2) * 0.5;
    ctx.lineTo(92 + i, ya);
  }
  ctx.stroke();

  P.panel(ctx, 308, 84, 176, 170, 'lực suy ra', P.tone(0));
  P.neonArrow(ctx, 390, 194, 450, 130, P.tone(0), `F`);
  P.dashedLine(ctx, 246, 168, 308, 168, P.tone(6));
  P.domMath(ctx, '342-law', 326, 92, 'F = ma', { color: P.tone(0) });
  P.domMath(ctx, '342-a', 328, 122, `a = ${a.toFixed(2)}`, { color: P.tone(4) });
  P.domMath(ctx, '342-F', 330, 152, `F = ${F.toFixed(1)}`, { color: P.tone(0) });
}

// ─── Register ───────────────────────────────────────────────────────────────

registry.register('ch3-3-1', 'ch3-3-1-ode-solver-renderer', renderCh331OdeSolver);
registry.register('ch3-3-2', 'ch3-3-2-coupled-springs-renderer', renderCh332CoupledSprings);
registry.register('ch3-4-1', 'ch3-4-1-dalembert-equilibrium-renderer', renderCh341DalembertEquilibrium);
registry.register('ch3-4-2', 'ch3-4-2-inverse-dynamics-renderer', renderCh342InverseDynamics);

})();
