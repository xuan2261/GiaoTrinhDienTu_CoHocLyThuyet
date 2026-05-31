/**
 * ch3-3-1 — Giải ODE chuyển động (con lắc/lò xo). rk4Step/integrateMotion.
 * Autoplay: dao động lò xo x'' = -(k/m)x tích phân RK4; SVG quỹ đạo + graph x(t).
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, D = root.SimPhysicsDynamics;

  Reg.register('ch3-3-1', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -1, minY: -4, maxX: 11, maxY: 4 }
    });
    const { svg, tf, overlay, render } = shell;
    const m = 1, k = 4;            // ω = 2, T = π
    const dt = 1 / 60;

    // Tường + lò xo + vật (trục x dao động quanh x=2)
    const wallX = 0, eqX = 4;
    svg.appendChild(render.line(tf, { x: wallX, y: -1.5 }, { x: wallX, y: 1.5 }, { stroke: '#444', width: 4 }));
    const spring = render.el('polyline', { points: '', fill: 'none', stroke: '#888', 'stroke-width': 2 });
    svg.appendChild(spring);
    const box = render.poly(tf, [], { closed: true, fill: 'rgba(90,140,200,0.4)', stroke: '#368' });
    svg.appendChild(box);

    // Graph x(t)
    const gx0 = 0, gy0 = -3, gw = 9, gh = 1.6;
    svg.appendChild(render.line(tf, { x: gx0, y: gy0 }, { x: gx0 + gw, y: gy0 }, { stroke: '#aaa', width: 1 }));
    const graphLine = render.el('polyline', { points: '', fill: 'none', stroke: '#2a7', 'stroke-width': 2, class: 'sim2-graph' });
    svg.appendChild(graphLine);

    overlay.label('x(t)', { x: gx0 + gw, y: gy0 }, { anchor: 'left', color: '#178' });
    const lblBox = overlay.label('m', { x: eqX, y: 0.7 }, { color: '#368' });
    const card = overlay.readoutCard([]);

    let s = { x: 2, v: 0 }, t = 0; const data = []; const tMax = 2 * Math.PI;
    function frame() {
      s = D.integrateMotion(m, k, () => 0, s.v, s.x, dt);
      t += dt; if (t > tMax) { t = 0; data.length = 0; }
      data.push({ t, x: s.x });
      const bx = eqX + s.x; // vị trí vật
      // lò xo zigzag từ tường tới vật
      const segs = 8; const pts = [];
      for (let i = 0; i <= segs; i++) {
        const xx = wallX + (bx - 0.4 - wallX) * i / segs;
        const yy = (i > 0 && i < segs) ? (i % 2 ? 0.25 : -0.25) : 0;
        const sc = tf.toScreen({ x: xx, y: yy }); pts.push(`${sc.x},${sc.y}`);
      }
      spring.setAttribute('points', pts.join(' '));
      box.setAttribute('points', [
        { x: bx - 0.4, y: -0.4 }, { x: bx + 0.4, y: -0.4 }, { x: bx + 0.4, y: 0.4 }, { x: bx - 0.4, y: 0.4 }
      ].map(p => { const sc = tf.toScreen(p); return `${sc.x},${sc.y}`; }).join(' '));
      overlay.moveLabel(lblBox, { x: bx, y: 0.8 });
      const gpts = data.map(d => {
        const gx = gx0 + (d.t / tMax) * gw, gy = gy0 + (d.x / 2) * gh;
        const sc = tf.toScreen({ x: gx, y: gy }); return `${sc.x},${sc.y}`;
      }).join(' ');
      graphLine.setAttribute('points', gpts);
      card.__render([
        { label: 'k:', value: k + ' N/m' },
        { label: 'm:', value: m + ' kg' },
        { label: 'ω:', value: Math.sqrt(k / m).toFixed(2) + ' rad/s' },
        { label: 'x(t):', value: s.x.toFixed(2) + ' m' }
      ]);
    }
    shell.onFrame(frame);
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
