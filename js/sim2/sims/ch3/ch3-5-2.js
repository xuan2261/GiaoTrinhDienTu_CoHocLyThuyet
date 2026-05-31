/**
 * ch3-5-2 — Định lý động lượng & xung lượng. J = Δp = F·t.
 * Slider F, t + kéo lực → xung lượng J và độ biến thiên động lượng Δp cập nhật. Graph p(t).
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, D = root.SimPhysicsDynamics, Pal = root.Sim2Palette;

  Reg.register('ch3-5-2', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -1, minY: -3, maxX: 11, maxY: 4 }, reservePanel: true
    });
    const { svg, tf, overlay, render } = shell;
    const m = 2, v1 = 1;
    const state = { F: 6, tDur: 2 };

    svg.appendChild(render.line(tf, { x: -1, y: 0 }, { x: 11, y: 0 }, { stroke: Pal.axis, width: 1 }));
    svg.appendChild(render.poly(tf,
      [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 1, y: 1 }],
      { closed: true, fill: 'rgba(0,116,217,0.35)', stroke: Pal.a }));
    const fArrow = render.arrow(tf, svg, { x: 2, y: 0.5 }, { x: 2, y: 0.5 }, { stroke: Pal.force, width: 3 });
    svg.appendChild(fArrow);
    const gx0 = 0, gy0 = -2, gw = 9, gh = 1.5;
    svg.appendChild(render.line(tf, { x: gx0, y: gy0 }, { x: gx0 + gw, y: gy0 }, { stroke: Pal.grid, width: 1 }));
    const pLine = render.el('polyline', { points: '', fill: 'none', stroke: Pal.v, 'stroke-width': 2, class: 'sim2-graph' });
    svg.appendChild(pLine);

    overlay.label('p(t)', { x: gx0 + gw, y: gy0 }, { anchor: 'left', color: Pal.v });
    const lblF = overlay.label('F', { x: 2, y: 0.5 }, { anchor: 'left', color: Pal.force });

    function render2() {
      const a = D.accelerationFromForce(state.F, m);
      const v2 = v1 + a * state.tDur;
      const J = state.F * state.tDur, dp = m * v2 - m * v1;
      const VIS = 0.12;
      const ft = tf.toScreen({ x: 2 + state.F * VIS, y: 0.5 }), fb = tf.toScreen({ x: 2, y: 0.5 });
      fArrow.setAttribute('x1', fb.x); fArrow.setAttribute('y1', fb.y);
      fArrow.setAttribute('x2', ft.x); fArrow.setAttribute('y2', ft.y);
      overlay.moveLabel(lblF, { x: 2 + state.F * VIS + 0.3, y: 0.7 });
      const pts = [];
      const pMax = m * (v1 + a * state.tDur);
      for (let i = 0; i <= 20; i++) {
        const tt = state.tDur * i / 20, pp = m * (v1 + a * tt);
        const gx = gx0 + (tt / state.tDur) * gw, gy = gy0 + (pp / (pMax || 1)) * gh;
        const s = tf.toScreen({ x: gx, y: gy }); pts.push(`${s.x},${s.y}`);
      }
      pLine.setAttribute('points', pts.join(' '));
      handle.move({ x: 2 + state.F * VIS, y: 0.5 });
      panel.setReadout([
        { label: 'F:', value: state.F.toFixed(0) + ' N' },
        { label: 't:', value: state.tDur.toFixed(1) + ' s' },
        { label: 'J = F·t:', value: J.toFixed(1) + ' N·s' },
        { label: 'Δp:', value: dp.toFixed(1) + ' kg·m/s' }
      ]);
    }

    const panel = shell.setTheory({
      formulas: ['\\textcolor{#159c3a}{J} = \\textcolor{#e03030}{F} \\cdot t = \\Delta p'],
      legend: [{ color: Pal.force, label: 'F (lực)' }, { color: Pal.v, label: 'p(t) động lượng' }],
      observe: 'Xung lượng J = F·t bằng độ biến thiên động lượng Δp. Kéo F hoặc đổi t.'
    });

    const controls = shell.addControls({
      sliders: [
        { id: 'F', label: 'F', min: 2, max: 20, step: 1, value: state.F, unit: 'N',
          onInput: v => { state.F = v; render2(); } },
        { id: 't', label: 't', min: 0.5, max: 4, step: 0.5, value: state.tDur, unit: 's',
          onInput: v => { state.tDur = v; render2(); } }
      ]
    });

    const handle = shell.addHandle({ x: 2 + state.F * 0.12, y: 0.5 }, {
      fill: Pal.handle,
      onDrag(wp) {
        state.F = Math.min(20, Math.max(2, (wp.x - 2) / 0.12));
        controls.setValue('F', state.F.toFixed(0));
        render2();
      }
    });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
