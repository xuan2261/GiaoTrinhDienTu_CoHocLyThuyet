/**
 * Route renderers for Ch2 particle kinematics.
 */
(function() {
'use strict';

const registry = window.SimRouteRenderers;
const P = window.SimRouteRendererPrimitives;
if (!registry || !P) return;

function drawGraphAxes(ctx, ox, oy, w, h) {
  P.arrow(ctx, ox, oy, ox + w, oy, P.tone(6), 't');
  P.arrow(ctx, ox, oy, ox, oy - h, P.tone(6), 'x');
}

function renderCh211ParticleVectorPath(ctx, scene, state, d) {
  P.frame(ctx, scene, `Quỹ đạo chất điểm: ${state.mode}`, P.tone(1));
  ctx.strokeStyle = P.tone(1);
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i <= 240; i += 8) {
    const x = 90 + i;
    const y = state.mode === 'Elip' ? 170 + 42 * Math.sin(i / 34) : state.mode === 'Parabol' ? 260 - i * 0.8 + i * i / 760 : 170 + 56 * Math.sin(i / 42);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  P.point(ctx, state.primary.x + 92, state.primary.y - 92, P.tone(0), 'P');
  P.arrow(ctx, state.primary.x + 92, state.primary.y - 92, state.vector.x + 72, state.vector.y - 48, P.tone(1), 'v');
  P.arrow(ctx, state.primary.x + 92, state.primary.y - 92, state.primary.x + 130, state.primary.y - 42, P.tone(2), 'a');
  P.domMath(ctx, 'particle-time', 412, 76, `t=${state.t.toFixed(2)}\\,\\mathrm{s}`, { color: P.tone(1) });
}

function renderCh212CartesianMotionGraphs(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Đồ thị Đề các: độ dốc cho vận tốc', P.tone(3));
  drawGraphAxes(ctx, 82, 248, 190, 130);
  drawGraphAxes(ctx, 326, 248, 170, 130);
  ctx.strokeStyle = P.tone(0);
  ctx.beginPath();
  for (let i = 0; i <= 160; i += 8) {
    const x = 92 + i, y = 200 - 52 * Math.sin(i / 45 + state.t);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.strokeStyle = P.tone(1);
  ctx.beginPath();
  for (let i = 0; i <= 150; i += 8) {
    const x = 336 + i, y = 206 - 0.35 * i + 26 * Math.sin(i / 36);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  P.dashedLine(ctx, 162, 116, 162, 252, P.tone(6));
  P.arrow(ctx, 150, 154, 202, 130, P.tone(2), 'dốc v');
}

function renderCh213NaturalCoordinateFrame(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Tọa độ tự nhiên: tau, n, bán kính cong', P.tone(2));
  ctx.strokeStyle = P.tone(2);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(250, 184, 96, 0.2, 1.65 * Math.PI);
  ctx.stroke();
  P.point(ctx, 300, 104, P.tone(0), 'P');
  P.arrow(ctx, 300, 104, 370, 132, P.tone(1), 'tau');
  P.arrow(ctx, 300, 104, 246, 168, P.tone(2), 'n');
  P.dashedLine(ctx, 250, 184, 300, 104, P.tone(6));
  P.point(ctx, 250, 184, P.tone(4), 'C');
  P.dimension(ctx, 250, 184, 300, 104, P.tone(6), 'rho');
  P.domMath(ctx, 'normal-acceleration', 342, 282, `a_n=\\frac{v^2}{\\rho}=${(d.force / 90).toFixed(2)}`, { color: P.tone(2) });
}

function renderCh214MotionPresetGallery(ctx, scene, state, d) {
  P.frame(ctx, scene, 'Thư viện mẫu chuyển động', P.tone(4));
  ['Thẳng', 'Tròn', 'Parabol'].forEach((mode, index) => {
    const x = 70 + index * 150;
    P.panel(ctx, x, 86, 116, 164, mode, P.tone(index));
    ctx.strokeStyle = P.tone(index);
    ctx.beginPath();
    if (mode === 'Thẳng') { ctx.moveTo(x + 18, 198); ctx.lineTo(x + 98, 134); }
    if (mode === 'Tròn') ctx.arc(x + 58, 166, 42, 0, Math.PI * 2);
    if (mode === 'Parabol') {
      for (let i = 0; i <= 80; i += 8) {
        const px = x + 18 + i, py = 218 - i * 1.5 + i * i / 60;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
    }
    ctx.stroke();
  });
  P.domLabel(ctx, 'active-motion', 366, 290, `đang chọn: ${state.mode}`, { color: P.tone(4) });
}

// Legacy draft renderers retained for reference. Canonical Ch2 registrations
// live in ch2-trajectory-graph-renderers.js.

})();
