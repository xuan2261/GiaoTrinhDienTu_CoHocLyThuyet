/**
 * ch3-2-2 — Định luật II Newton F = m·a. accelerationFromForce + integrateMotion.
 * Autoplay: vật chịu lực không đổi, tích phân chuyển động; graph v(t) DOM cập nhật mỗi frame
 * (polyline .sim2-graph — defect cũ graph rỗng → đây vẽ dữ liệu thật).
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, D = root.SimPhysicsDynamics;

  Reg.register('ch3-2-2', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -1, minY: -3, maxX: 11, maxY: 5 }
    });
    const { svg, tf, overlay, render } = shell;
    const m = 2, F = 6;            // a = 3
    const a = D.accelerationFromForce(F, m);

    // Mặt sàn + vật
    svg.appendChild(render.line(tf, { x: -1, y: 0 }, { x: 11, y: 0 }, { stroke: '#ccc', width: 1 }));
    const box = render.poly(tf, [], { closed: true, fill: 'rgba(90,140,200,0.4)', stroke: '#368' });
    svg.appendChild(box);
    const fArrow = render.arrow(tf, svg, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: '#e63', width: 3 });
    svg.appendChild(fArrow);

    // Graph v(t): trục + polyline
    const gx0 = 0, gy0 = -2.5, gw = 9, gh = 2;
    svg.appendChild(render.line(tf, { x: gx0, y: gy0 }, { x: gx0 + gw, y: gy0 }, { stroke: '#aaa', width: 1 }));
    svg.appendChild(render.line(tf, { x: gx0, y: gy0 }, { x: gx0, y: gy0 + gh }, { stroke: '#aaa', width: 1 }));
    const graphLine = render.el('polyline', {
      points: '', fill: 'none', stroke: '#2a7', 'stroke-width': 2, class: 'sim2-graph'
    });
    svg.appendChild(graphLine);

    overlay.label('v(t)', { x: gx0 + gw, y: gy0 + gh }, { anchor: 'left', color: '#178' });
    const lblBox = overlay.label('m', { x: 0, y: 0.6 }, { anchor: 'center', color: '#368' });
    const card = overlay.readoutCard([]);

    let t = 0; const vData = [];
    const tMax = 2.8, vMax = a * tMax;
    function frame() {
      t += 1 / 60;
      if (t > tMax) { t = 0; vData.length = 0; }
      const x = 0.5 * a * t * t * 0.4;   // vị trí (thu nhỏ để nằm trong khung)
      const v = a * t;
      vData.push({ t, v });
      // Vật
      const cx = Math.min(9, x);
      box.setAttribute('points', [
        { x: cx, y: 0 }, { x: cx + 0.8, y: 0 }, { x: cx + 0.8, y: 0.8 }, { x: cx, y: 0.8 }
      ].map(p => { const s = tf.toScreen(p); return `${s.x},${s.y}`; }).join(' '));
      const fb = tf.toScreen({ x: cx + 0.8, y: 0.4 }), ft = tf.toScreen({ x: cx + 2, y: 0.4 });
      fArrow.setAttribute('x1', fb.x); fArrow.setAttribute('y1', fb.y);
      fArrow.setAttribute('x2', ft.x); fArrow.setAttribute('y2', ft.y);
      overlay.moveLabel(lblBox, { x: cx + 0.4, y: 1.2 });
      // Graph: map (t,v) → world trong khung
      const pts = vData.map(d => {
        const gx = gx0 + (d.t / tMax) * gw;
        const gy = gy0 + (d.v / vMax) * gh;
        const s = tf.toScreen({ x: gx, y: gy });
        return `${s.x},${s.y}`;
      }).join(' ');
      graphLine.setAttribute('points', pts);
      card.__render([
        { label: 'F:', value: F + ' N' },
        { label: 'm:', value: m + ' kg' },
        { label: 'a = F/m:', value: a.toFixed(1) + ' m/s²' },
        { label: 'v(t):', value: v.toFixed(1) + ' m/s' }
      ]);
    }
    shell.onFrame(frame);
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
