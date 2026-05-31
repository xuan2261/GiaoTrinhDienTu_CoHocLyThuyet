/**
 * ch1-1-4 — Mô men lực & cánh tay đòn. M = F·d·sinθ (computeMoment).
 * Slider F + kéo điểm đặt lực → cánh tay đòn d đổi → M cập nhật realtime.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, P = root.SimPhysicsStatics, Pal = root.Sim2Palette;

  Reg.register('ch1-1-4', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -1, minY: -2, maxX: 7, maxY: 4 }, reservePanel: true
    });
    const { svg, tf, overlay, render } = shell;
    const O = { x: 0, y: 0 };

    svg.appendChild(render.line(tf, { x: -1, y: 0 }, { x: 7, y: 0 }, { stroke: Pal.axis, width: 1 }));
    svg.appendChild(render.circle(tf, O, 6, { pixel: true, fill: Pal.axis, stroke: Pal.axis }));

    const state = { F: 50, app: { x: 4, y: 0 } };
    const Fdir = 90;
    const VIS = 0.03;

    const armLine = render.line(tf, O, state.app, { stroke: Pal.moment, width: 2 });
    const forceArrow = render.arrow(tf, svg, state.app, state.app, { stroke: Pal.force, width: 3 });
    svg.appendChild(armLine); svg.appendChild(forceArrow);

    overlay.label('O', O, { anchor: 'right' });
    const lblArm = overlay.label('d', { x: 2, y: -0.5 }, { color: Pal.moment });
    const lblF = overlay.label('F', state.app, { anchor: 'bottom', color: Pal.force });

    function render2() {
      const d = Math.abs(state.app.x);
      const M = P.computeMoment(state.F, d, Fdir);
      const o = tf.toScreen(O), a = tf.toScreen(state.app);
      armLine.setAttribute('x1', o.x); armLine.setAttribute('y1', o.y);
      armLine.setAttribute('x2', a.x); armLine.setAttribute('y2', a.y);
      const tip = tf.toScreen({ x: state.app.x, y: state.app.y + state.F * VIS });
      forceArrow.setAttribute('x1', a.x); forceArrow.setAttribute('y1', a.y);
      forceArrow.setAttribute('x2', tip.x); forceArrow.setAttribute('y2', tip.y);
      overlay.moveLabel(lblArm, { x: state.app.x / 2, y: -0.5 });
      overlay.moveLabel(lblF, { x: state.app.x, y: state.app.y + state.F * VIS + 0.3 });
      handle.move(state.app);
      panel.setReadout([
        { label: 'F:', value: state.F.toFixed(0) + ' N' },
        { label: 'd:', value: d.toFixed(2) + ' m' },
        { label: 'M:', value: M.toFixed(1) + ' N·m' }
      ]);
    }

    const panel = shell.setTheory({
      formulas: ['M = \\textcolor{#e03030}{F} \\cdot \\textcolor{#7c3aed}{d}'],
      legend: [{ color: Pal.force, label: 'F' }, { color: Pal.moment, label: 'd (cánh tay đòn)' }],
      observe: 'Kéo điểm đặt lực để đổi cánh tay đòn d; dùng thanh trượt đổi độ lớn F.'
    });

    shell.addControls({
      sliders: [
        { id: 'F', label: 'F', min: 10, max: 100, step: 5, value: state.F, unit: 'N',
          onInput: v => { state.F = v; render2(); } }
      ]
    });

    const handle = shell.addHandle(state.app, {
      fill: Pal.handle,
      onDrag(wp) {
        state.app = { x: Math.min(6.5, Math.max(0.5, wp.x)), y: 0 };
        render2();
      }
    });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
