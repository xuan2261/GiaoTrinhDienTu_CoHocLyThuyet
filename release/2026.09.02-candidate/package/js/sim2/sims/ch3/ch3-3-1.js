/**
 * ch3-3-1 — Giải ODE chuyển động (con lắc/lò xo). rk4Step/integrateMotion.
 * Slider k, m + playback (start paused). Dao động x'' = -(k/m)x tích phân RK4; SVG + graph x(t).
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, D = root.SimPhysicsDynamics, Pal = root.Sim2Palette;

  Reg.register('ch3-3-1', function(container) {
    const shell = Shell.createSimShell({
      // minY -5→-5.25: nới margin để trace x(t) đáy (gy0=-3, biên độ tới gy0-gh≈-4.6) không chạm mép.
      container, worldBox: { minX: -1, minY: -5.25, maxX: 11, maxY: 4 }, reservePanel: true,
      meta: { name: 'Giải ODE chuyển động (RK4)', section: '3.1', chapter: 3 }
    });
    const { svg, tf, overlay, render } = shell;
    const params = { m: 1, k: 4 };
    const wallX = 0, eqX = 4;

    svg.appendChild(render.line(tf, { x: wallX, y: -1.5 }, { x: wallX, y: 1.5 }, { stroke: Pal.axis, width: 4 }));
    svg.appendChild(render.line(tf, { x: eqX, y: -0.8 }, { x: eqX, y: 0.8 }, { stroke: Pal.moment, width: 1.5, dash: '4 3', class: 'sim2-guide-line sim2-equilibrium-line' }));
    const spring = render.el('polyline', { points: '', fill: 'none', stroke: Pal.axis, 'stroke-width': 2 });
    svg.appendChild(spring);
    const box = render.poly(tf, [], { closed: true, gradient: 'a', depth: true, stroke: Pal.a });
    svg.appendChild(box);

    const gx0 = 0, gy0 = -3, gw = 9, gh = 1.6;
    svg.appendChild(render.line(tf, { x: gx0, y: gy0 }, { x: gx0 + gw, y: gy0 }, { stroke: Pal.grid, width: 1 }));
    const graphLine = render.el('polyline', { points: '', fill: 'none', stroke: Pal.v, 'stroke-width': 2, class: 'sim2-graph' });
    svg.appendChild(graphLine);
    const graphCursor = render.line(tf, { x: gx0, y: gy0 - gh }, { x: gx0, y: gy0 + gh }, {
      stroke: Pal.resultant, width: 1.5, dash: '3 3', class: 'sim2-graph-cursor'
    });
    svg.appendChild(graphCursor);

    overlay.label('x(t)', { x: gx0 + gw, y: gy0 }, { anchor: 'left', color: Pal.v });
    const lblBox = overlay.label('m', { x: eqX, y: 0.7 }, { color: Pal.a });

    let s, t, data;
    const tMax = 2 * Math.PI;
    function reset() { s = { x: 2, v: 0 }; t = 0; data = []; shell.resetClock(); draw(); }
    function draw() {
      const bx = eqX + s.x;
      const segs = 8, pts = [];
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
      const cx = gx0 + (t / tMax) * gw;
      const c0 = tf.toScreen({ x: cx, y: gy0 - gh }), c1 = tf.toScreen({ x: cx, y: gy0 + gh });
      graphCursor.setAttribute('x1', c0.x); graphCursor.setAttribute('y1', c0.y);
      graphCursor.setAttribute('x2', c1.x); graphCursor.setAttribute('y2', c1.y);
      panel.setReadout([
        { key: 'k', label: 'k:', value: params.k + ' N/m' },
        { key: 'm', label: 'm:', value: params.m + ' kg' },
        { key: 'omega', label: 'ω:', value: Math.sqrt(params.k / params.m).toFixed(2) + ' rad/s' },
        { key: 'x', label: 'x(t):', value: s.x.toFixed(2) + ' m' }
      ]);
    }
    function update(dt) {
      s = D.integrateMotion(params.m, params.k, () => 0, s.v, s.x, dt);
      t += dt; if (t > tMax) { t = 0; data = []; }
      data.push({ t, x: s.x });
    }

    const panel = shell.setTheory({
      formulas: ['m\\ddot{x} + kx = 0', '\\omega = \\sqrt{k/m}'],
      legend: [{ color: Pal.a, label: 'vật m' }, { color: Pal.v, label: 'x(t)' }],
      observe: 'Bấm ▶. Tăng k → dao động nhanh hơn (ω lớn); tăng m → chậm hơn. Giải bằng RK4.'
    });

    shell.addControls({
      sliders: [
        { id: 'k', label: 'k', min: 1, max: 12, step: 1, value: params.k, unit: 'N/m',
          onInput: v => { params.k = v; reset(); } },
        { id: 'm', label: 'm', min: 0.5, max: 4, step: 0.5, value: params.m, unit: 'kg',
          onInput: v => { params.m = v; reset(); } }
      ],
      playback: {
        playing: false,
        onPlay: () => shell.start(), onPause: () => shell.stop(),
        onStep: () => shell.stepOnce(), onReset: () => { shell.stop(); reset(); }
      }
    });

    reset();
    shell.onFrame(update, draw);
    shell.stop();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
