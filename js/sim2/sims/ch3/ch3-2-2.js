/**
 * ch3-2-2 — Định luật II Newton F = m·a. accelerationFromForce + integrateMotion.
 * Slider F, m + playback (start paused). Graph v(t) DOM (.sim2-graph) cập nhật mỗi frame.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, D = root.SimPhysicsDynamics, Pal = root.Sim2Palette;

  Reg.register('ch3-2-2', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -1, minY: -3, maxX: 11, maxY: 5 }, reservePanel: true,
      meta: { name: 'Định luật II Newton F = m·a', section: '2.2', chapter: 3 }
    });
    const { svg, tf, overlay, render } = shell;
    const params = { m: 2, F: 6 };

    svg.appendChild(render.line(tf, { x: -1, y: 0 }, { x: 11, y: 0 }, { stroke: Pal.axis, width: 1 }));
    const box = render.poly(tf, [], { closed: true, gradient: 'a', depth: true, stroke: Pal.a });
    svg.appendChild(box);
    const fArrow = render.arrow(tf, svg, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: Pal.force, width: 3 });
    svg.appendChild(fArrow);

    const gx0 = 0, gy0 = -2.5, gw = 9, gh = 2;
    svg.appendChild(render.line(tf, { x: gx0, y: gy0 }, { x: gx0 + gw, y: gy0 }, { stroke: Pal.grid, width: 1 }));
    svg.appendChild(render.line(tf, { x: gx0, y: gy0 }, { x: gx0, y: gy0 + gh }, { stroke: Pal.grid, width: 1 }));
    const graphLine = render.el('polyline', {
      points: '', fill: 'none', stroke: Pal.v, 'stroke-width': 2, class: 'sim2-graph'
    });
    svg.appendChild(graphLine);
    const graphCursor = render.line(tf, { x: gx0, y: gy0 }, { x: gx0, y: gy0 + gh }, {
      stroke: Pal.resultant, width: 1.5, dash: '3 3', class: 'sim2-graph-cursor'
    });
    svg.appendChild(graphCursor);

    overlay.label('v(t)', { x: gx0 + gw, y: gy0 + gh }, { anchor: 'left', color: Pal.v });
    const lblBox = overlay.label('m', { x: 0, y: 0.6 }, { anchor: 'center', color: Pal.a });

    let t = 0, vData = [];
    const tMax = 2.8;
    function accel() { return D.accelerationFromForce(params.F, params.m); }
    function reset() { t = 0; vData = []; draw(); }
    function draw() {
      const a = accel(), vMax = a * tMax || 1;
      const x = 0.5 * a * t * t * 0.4;
      const v = a * t;
      const cx = Math.min(9, x);
      box.setAttribute('points', [
        { x: cx, y: 0 }, { x: cx + 0.8, y: 0 }, { x: cx + 0.8, y: 0.8 }, { x: cx, y: 0.8 }
      ].map(p => { const s = tf.toScreen(p); return `${s.x},${s.y}`; }).join(' '));
      const fb = tf.toScreen({ x: cx + 0.8, y: 0.4 }), ft = tf.toScreen({ x: cx + 2, y: 0.4 });
      fArrow.setAttribute('x1', fb.x); fArrow.setAttribute('y1', fb.y);
      fArrow.setAttribute('x2', ft.x); fArrow.setAttribute('y2', ft.y);
      overlay.moveLabel(lblBox, { x: cx + 0.4, y: 1.2 });
      const pts = vData.map(d => {
        const gx = gx0 + (d.t / tMax) * gw, gy = gy0 + (d.v / vMax) * gh;
        const s = tf.toScreen({ x: gx, y: gy }); return `${s.x},${s.y}`;
      }).join(' ');
      graphLine.setAttribute('points', pts);
      const c0 = tf.toScreen({ x: gx0 + Math.min(1, t / tMax) * gw, y: gy0 });
      const c1 = tf.toScreen({ x: gx0 + Math.min(1, t / tMax) * gw, y: gy0 + gh });
      graphCursor.setAttribute('x1', c0.x); graphCursor.setAttribute('y1', c0.y);
      graphCursor.setAttribute('x2', c1.x); graphCursor.setAttribute('y2', c1.y);
      panel.setReadout([
        { key: 'F', label: 'F:', value: params.F + ' N' },
        { key: 'm', label: 'm:', value: params.m + ' kg' },
        { key: 'a', label: 'a = F/m:', value: a.toFixed(1) + ' m/s²' },
        { key: 'v', label: 'v(t):', value: v.toFixed(1) + ' m/s' }
      ]);
    }
    function frame() {
      t += 1 / 60;
      if (t > tMax) { t = 0; vData = []; }
      vData.push({ t, v: accel() * t });
      draw();
    }

    const panel = shell.setTheory({
      formulas: ['\\textcolor{#e03030}{F} = \\textcolor{#0074d9}{m} \\cdot a', 'a = \\dfrac{F}{m}'],
      legend: [{ color: Pal.force, label: 'F (lực)' }, { color: Pal.a, label: 'vật m' }, { color: Pal.v, label: 'v(t)' }],
      observe: 'Bấm ▶. Cùng lực F, khối lượng m càng lớn → gia tốc a càng nhỏ (đồ thị v thoải hơn).'
    });

    shell.addControls({
      sliders: [
        { id: 'F', label: 'F', min: 2, max: 20, step: 1, value: params.F, unit: 'N',
          onInput: v => { params.F = v; reset(); } },
        { id: 'm', label: 'm', min: 1, max: 6, step: 0.5, value: params.m, unit: 'kg',
          onInput: v => { params.m = v; reset(); } }
      ],
      playback: {
        playing: false,
        onPlay: () => shell.start(), onPause: () => shell.stop(),
        onStep: () => frame(), onReset: () => { shell.stop(); reset(); }
      }
    });

    reset();
    shell.onFrame(frame);
    shell.stop();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
