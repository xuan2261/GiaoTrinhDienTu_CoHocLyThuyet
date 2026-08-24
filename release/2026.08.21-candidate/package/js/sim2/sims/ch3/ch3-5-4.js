/**
 * ch3-5-4 — Định lý động năng (công–năng). W = ΔT = ½m(v₂²-v₁²). workDone/kineticEnergy.
 * Slider F + kéo lực (quãng đường cố định) → công W và độ biến thiên động năng ΔT khớp nhau.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, D = root.SimPhysicsDynamics, Pal = root.Sim2Palette;

  Reg.register('ch3-5-4', function(container) {
    const shell = Shell.createSimShell({
      // minY -0.8→-0.4: bỏ nửa dưới trống (nét đứt mốc đáy y=-0.3 còn margin 0.1).
      container, worldBox: { minX: 0.3, minY: -0.4, maxX: 7.5, maxY: 2.2 }, reservePanel: true,
      meta: { name: 'Định lý động năng (công–năng)', section: '5.4', chapter: 3 }
    });
    const { svg, tf, overlay, render } = shell;
    const m = 2, dDist = 6, v1 = 1;
    const state = { F: 4 };

    svg.appendChild(render.line(tf, { x: -1, y: 0 }, { x: 11, y: 0 }, { stroke: Pal.axis, width: 1 }));
    svg.appendChild(render.line(tf, { x: 1, y: -0.3 }, { x: 1, y: 1.5 }, { stroke: Pal.grid, width: 1, dash: '3 3' }));
    svg.appendChild(render.line(tf, { x: 1 + dDist, y: -0.3 }, { x: 1 + dDist, y: 1.5 }, { stroke: Pal.grid, width: 1, dash: '3 3' }));
    svg.appendChild(render.poly(tf,
      [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 1, y: 1 }],
      { closed: true, gradient: 'a', depth: true, stroke: Pal.a }));
    const fArrow = render.arrow(tf, svg, { x: 2, y: 0.5 }, { x: 2, y: 0.5 }, { stroke: Pal.force, width: 3 });
    svg.appendChild(fArrow);

    const workLine = render.line(tf, { x: 1, y: 1.35 }, { x: 1 + dDist, y: 1.35 }, { stroke: Pal.moment, width: 2, dash: '5 4', class: 'sim2-guide-line sim2-work-distance' });
    svg.appendChild(workLine);
    const lblD = overlay.label('d', { x: 1 + dDist / 2, y: 1.7 }, { color: Pal.moment });
    const lblF = overlay.label('F', { x: 2, y: 0.5 }, { anchor: 'left', color: Pal.force });

    function render2() {
      const W = D.workDone(state.F, dDist, 0);
      const v2 = Math.sqrt(v1 * v1 + 2 * W / m);
      const dT = D.kineticEnergy(m, v2) - D.kineticEnergy(m, v1);
      const VIS = 0.15;
      const fb = tf.toScreen({ x: 2, y: 0.5 }), ft = tf.toScreen({ x: 2 + state.F * VIS, y: 0.5 });
      fArrow.setAttribute('x1', fb.x); fArrow.setAttribute('y1', fb.y);
      fArrow.setAttribute('x2', ft.x); fArrow.setAttribute('y2', ft.y);
      overlay.moveLabel(lblF, { x: 2 + state.F * VIS + 0.3, y: 0.7 });
      handle.move({ x: 2 + state.F * VIS, y: 0.5 });
      panel.setFormulaHighlight(['work']);
      panel.setReadout([
        { key: 'F', label: 'F:', value: state.F.toFixed(1) + ' N' },
        { key: 'd', label: 'd:', value: dDist + ' m' },
        { key: 'W', label: 'W = F·d:', value: W.toFixed(1) + ' J' },
        { key: 'dT', label: 'ΔT:', value: dT.toFixed(1) + ' J' }
      ]);
    }

    const panel = shell.setTheory({
      formulas: [
        { key: 'work', latex: '\\textcolor{#e03030}{W} = F \\cdot d = \\Delta T' },
        { key: 'work', latex: '\\Delta T = \\tfrac{1}{2}m(v_2^2 - v_1^2)' }
      ],
      legend: [{ color: Pal.force, label: 'F (lực)' }, { color: Pal.a, label: 'vật m' }],
      observe: 'Công của lực W = F·d đúng bằng độ biến thiên động năng ΔT. Kéo hoặc đổi F.'
    });

    const controls = shell.addControls({
      sliders: [
        { id: 'F', label: 'F', min: 1, max: 15, step: 1, value: state.F, unit: 'N',
          onInput: v => { state.F = v; render2(); } }
      ]
    });

    const handle = shell.addHandle({ x: 2 + state.F * 0.15, y: 0.5 }, {
      fill: Pal.handle,
      a11y: { label: 'Đầu vectơ lực sinh công', axis: 'x', min: 1, max: 15, valueFromPoint: wp => (wp.x - 2) / 0.15 },
      keyboardStep: { x: 0.15, y: 0 },
      onDrag(wp) {
        state.F = Math.min(15, Math.max(1, (wp.x - 2) / 0.15));
        controls.setValue('F', state.F.toFixed(0));
        render2();
      }
    });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
