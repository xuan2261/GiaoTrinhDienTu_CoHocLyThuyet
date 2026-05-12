/**
 * Route renderers for Ch2 kinematics exercise/checker routes.
 * ch2-7-1: Guided solver with graph + equation steps
 * ch2-7-2: Numeric verification table x(t), v(t), a(t)
 */
(function() {
'use strict';

const registry = window.SimRouteRenderers;
const P = window.SimRouteRendererPrimitives;
if (!registry || !P) return;

// ─── ch2-7-1: Kinematics Guided Checker ───────────────────────────────────

function drawMiniCurve(ctx, x, y, index, t) {
  ctx.strokeStyle = P.tone(index);
  ctx.lineWidth = 2;
  ctx.beginPath();
  const amp = index === 0 ? 20 : (index === 1 ? 28 : 30);
  for (let i = 0; i <= 60; i += 6) {
    const phase = i / 12 + t * 0.5;
    let normalized;
    if (index === 0) normalized = Math.sin(phase);
    else if (index === 1) normalized = Math.cos(phase);
    else normalized = -Math.sin(phase);
    const py = y - amp * normalized;
    const px = x + i;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();
}

function renderCh271KinematicsGuidedChecker(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Giải bài động học: x(t) → v(t) → a(t)', P.tone(4));

  const step = state.step || 0;
  const t = state.t || 0;

  // Three panels: x(t), v(t), a(t)
  const panels = ['x(t)', 'v(t)', 'a(t)'];
  panels.forEach((label, idx) => {
    const px = 58 + idx * 158;
    P.panel(ctx, px, 76, 132, 168, label, P.tone(idx));

    // Highlight active panel
    if (idx === step) {
      ctx.fillStyle = `rgba(${idx === 0 ? '220,53,69' : idx === 1 ? '13,110,253' : '25,135,84'},.08)`;
      ctx.fillRect(px + 2, 78, 128, 164);
    }

    // Mini curve
    drawMiniCurve(ctx, px + 14, 198, idx, t);

    // Equation
    const eqs = ['x=5+3\\sin(\\omega t)', 'v=3\\omega\\cos(\\omega t)', 'a=-3\\omega^2\\sin(\\omega t)'];
    P.domMath(ctx, `step-eq-${idx}`, px + 8, 258, eqs[idx], { color: P.tone(idx) });
  });

  // Step indicator
  P.domLabel(ctx, 'step-indicator', 430, 264,
    `buoc ${step + 1}/3`, { color: P.tone(step) });

  // Step description
  const stepLabels = ['Doc x(t) tai t', 'Tinh v=dx/dt', 'Tinh a=dv/dt'];
  P.domLabel(ctx, 'step-desc', 430, 282, stepLabels[step], { color: P.tone(4) });

  // Numeric values
  const xVal = state.xVal || 5;
  const vVal = state.vVal || 0;
  const aVal = state.aVal || 0;
  P.domMath(ctx, 'step-x', 430, 66, `x=${xVal.toFixed(2)}`, { color: P.tone(0) });
  P.domMath(ctx, 'step-v', 430, 84, `v=${vVal.toFixed(2)}`, { color: P.tone(1) });
  P.domMath(ctx, 'step-a', 430, 102, `a=${aVal.toFixed(2)}`, { color: P.tone(2) });
}

// ─── ch2-7-2: Numeric Verifier ─────────────────────────────────────────────

function renderCh272KinematicsNumericVerifier(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Kiểm tra số liệu x(t), v(t), a(t)', P.tone(6));

  const t = state.t || 0;
  const xVal = state.xVal || 5;
  const vVal = state.vVal || 0;
  const status = state.status || 'Đúng';
  const errorV = state.errorV || 0;
  const omega = state.omega || 1;
  const x0 = Number.isFinite(Number(state.x0)) ? Number(state.x0) : 5;
  const amplitude = Number.isFinite(Number(state.amplitude)) ? Number(state.amplitude) : 3;

  // Data table panel
  P.panel(ctx, 72, 76, 416, 168, 'bang so lieu', P.tone(6));

  // Table header
  P.label(ctx, 't (s)', 102, 118, 12, P.tone(6));
  P.label(ctx, 'x(t)', 182, 118, 12, P.tone(0));
  P.label(ctx, 'v(t)', 262, 118, 12, P.tone(1));
  P.label(ctx, 'a(t)', 342, 118, 12, P.tone(2));
  P.label(ctx, 'trang thai', 422, 118, 12, P.tone(6));

  // Horizontal line under header
  ctx.strokeStyle = P.tone(6);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(88, 124);
  ctx.lineTo(500, 124);
  ctx.stroke();

  // Data rows (5 rows)
  const rows = 5;
  for (let i = 0; i < rows; i++) {
    const ti = (i / rows) * Math.PI * 2;
    const xi = x0 + amplitude * Math.sin(ti);
    const vi = amplitude * omega * Math.cos(ti);
    const ai = -amplitude * omega * omega * Math.sin(ti);
    const isCurrent = Math.abs(ti - t) < 0.3;
    const rowY = 142 + i * 22;

    if (isCurrent) {
      ctx.fillStyle = 'rgba(255,193,7,.15)';
      ctx.fillRect(88, rowY - 12, 408, 20);
    }

    P.label(ctx, ti.toFixed(2), 102, rowY, 11, isCurrent ? P.tone(4) : P.tone(6));
    P.label(ctx, xi.toFixed(2), 182, rowY, 11, P.tone(0));
    P.label(ctx, vi.toFixed(2), 262, rowY, 11, P.tone(1));
    P.label(ctx, ai.toFixed(2), 342, rowY, 11, P.tone(2));
    P.label(ctx, Math.abs(vi - amplitude * omega * Math.cos(ti)) < 0.1 ? 'đúng' : '--', 422, rowY, 11, P.tone(4));
  }

  // Status panel
  P.panel(ctx, 72, 260, 416, 54, 'kiem tra dong bat dong', P.tone(6));
  P.domMath(ctx, 'verify-t', 102, 284, `t=${t.toFixed(2)}\\,\\mathrm{s}`, { color: P.tone(4) });
  P.domMath(ctx, 'verify-x', 194, 284, `x=${xVal.toFixed(2)}`, { color: P.tone(0) });
  P.domMath(ctx, 'verify-v', 286, 284, `v=${vVal.toFixed(2)}`, { color: P.tone(1) });
  P.domMath(ctx, 'verify-error', 378, 284,
    `\\Delta v=${errorV.toFixed(3)}`, { color: status === 'Đúng' ? P.tone(4) : P.tone(0) });
  P.domLabel(ctx, 'verify-status', 462, 284, status, { color: status === 'Đúng' ? P.tone(4) : P.tone(0) });
}

// ─── Registry ──────────────────────────────────────────────────────────────────

registry.register('ch2-7-1', 'ch2-7-1-kinematics-guided-checker-renderer', renderCh271KinematicsGuidedChecker);
registry.register('ch2-7-2', 'ch2-7-2-kinematics-numeric-verifier-renderer', renderCh272KinematicsNumericVerifier);

})();
