/**
 * ch1-1-6 — Ngẫu lực & mô men ngẫu. M = F·d (coupleMoment), độc lập điểm đặt.
 * Slider d + kéo 1 lực → khoảng cách đổi → M ngẫu cập nhật. Hợp lực luôn = 0.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, P = root.SimPhysicsStatics, Pal = root.Sim2Palette;

  Reg.register('ch1-1-6', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -3.8, minY: -2.6, maxX: 3.8, maxY: 2.6 }, reservePanel: true,
      meta: { name: 'Ngẫu lực & mô men ngẫu', section: '1.6', chapter: 1 }
    });
    const { svg, tf, overlay, render } = shell;
    const VIS = 0.04;
    const F = 50;
    const state = { half: 1.5 };

    svg.appendChild(render.line(tf, { x: -4, y: 0 }, { x: 4, y: 0 }, { stroke: Pal.axis, width: 1 }));

    const upArrow = render.arrow(tf, svg, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: Pal.force, width: 3 });
    const dnArrow = render.arrow(tf, svg, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: Pal.force, width: 3 });
    const dLine = render.line(tf, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: Pal.moment, width: 1.5, dash: '4 3', class: 'sim2-guide-line sim2-couple-distance' });
    svg.appendChild(dLine); svg.appendChild(upArrow); svg.appendChild(dnArrow);

    const lblF1 = overlay.label('F', { x: 0, y: 0 }, { anchor: 'right', color: Pal.force });
    const lblF2 = overlay.label("F'", { x: 0, y: 0 }, { anchor: 'left', color: Pal.force });
    const lblD = overlay.label('d', { x: 0, y: -0.6 }, { color: Pal.moment });

    function setArrow(ar, base, tip) {
      const b = tf.toScreen(base), t = tf.toScreen(tip);
      ar.setAttribute('x1', b.x); ar.setAttribute('y1', b.y);
      ar.setAttribute('x2', t.x); ar.setAttribute('y2', t.y);
    }
    function render2() {
      const left = { x: -state.half, y: 0 }, right = { x: state.half, y: 0 };
      setArrow(upArrow, left, { x: -state.half, y: F * VIS });
      setArrow(dnArrow, right, { x: state.half, y: -F * VIS });
      const dl = tf.toScreen(left), dr = tf.toScreen(right);
      dLine.setAttribute('x1', dl.x); dLine.setAttribute('y1', dl.y);
      dLine.setAttribute('x2', dr.x); dLine.setAttribute('y2', dr.y);
      overlay.moveLabel(lblF1, { x: -state.half - 0.2, y: F * VIS });
      overlay.moveLabel(lblF2, { x: state.half + 0.2, y: -F * VIS });
      overlay.moveLabel(lblD, { x: 0, y: -0.6 });
      handle.move({ x: state.half, y: 0 });
      const d = 2 * state.half;
      panel.setReadout([
        { key: 'F', label: 'F:', value: F + ' N' },
        { key: 'd', label: 'd:', value: d.toFixed(2) + ' m' },
        { key: 'M', label: 'M ngẫu:', value: P.coupleMoment(F, d).toFixed(1) + ' N·m' },
        { key: 'sumF', label: 'ΣF:', value: '0 (ngẫu lực)' }
      ]);
    }

    const panel = shell.setTheory({
      formulas: ['M = \\textcolor{#e03030}{F} \\cdot \\textcolor{#7c3aed}{d}', '\\sum \\vec{F} = 0'],
      legend: [{ color: Pal.force, label: 'cặp lực F' }, { color: Pal.moment, label: 'd' }],
      observe: 'Ngẫu lực: hợp lực = 0 nhưng mô men M = F·d khác 0, không phụ thuộc điểm đặt.'
    });

    const controls = shell.addControls({
      sliders: [
        { id: 'd', label: 'd', min: 1, max: 6, step: 0.5, value: 2 * state.half, unit: 'm',
          onInput: v => { state.half = v / 2; render2(); } }
      ]
    });

    const handle = shell.addHandle({ x: state.half, y: 0 }, {
      fill: Pal.handle,
      a11y: { label: 'Nửa khoảng cách giữa hai lực', axis: 'x', min: 1, max: 6, valueFromPoint: wp => 2 * Math.abs(wp.x) },
      keyboardStep: { x: 0.25, y: 0 },
      onDrag(wp) {
        state.half = Math.min(3, Math.max(0.5, Math.abs(wp.x)));
        controls.setValue('d', (2 * state.half).toFixed(1));
        render2();
      }
    });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
