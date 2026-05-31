/**
 * ch1-3-6 — Phản lực & mô men ngàm (cantilever, tải đổi vị trí).
 * Slider a + P, kéo tải dọc dầm → phản lực R = P, mô men ngàm M = P·a cập nhật realtime.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, Pal = root.Sim2Palette;

  Reg.register('ch1-3-6', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -1.5, minY: -2, maxX: 9, maxY: 3 }, reservePanel: true
    });
    const { svg, tf, overlay, render } = shell;
    const L = 8, VIS = 0.018;
    const wall = { x: 0, y: 0 };
    const state = { load: 80, pos: 5 };

    svg.appendChild(render.line(tf, { x: 0, y: -1.5 }, { x: 0, y: 1.5 }, { stroke: Pal.axis, width: 5 }));
    svg.appendChild(render.line(tf, wall, { x: L, y: 0 }, { stroke: Pal.axis, width: 5 }));
    for (let i = -1.2; i <= 1.2; i += 0.4) {
      svg.appendChild(render.line(tf, { x: -0.4, y: i + 0.2 }, { x: 0, y: i }, { stroke: Pal.grid, width: 1 }));
    }

    const loadArrow = render.arrow(tf, svg, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: Pal.force, width: 3 });
    svg.appendChild(loadArrow);
    const rArrow = render.arrow(tf, svg, wall, wall, { stroke: Pal.reaction, width: 3 }); svg.appendChild(rArrow);

    const lblP = overlay.label('P', { x: state.pos, y: 1 }, { anchor: 'bottom', color: Pal.force });
    const lblR = overlay.label('R', { x: 0, y: 0 }, { anchor: 'right', color: Pal.reaction });
    const lblM = overlay.label('M', { x: 0.2, y: -0.8 }, { color: Pal.moment });

    function set(ar, base, tip) {
      const b = tf.toScreen(base), t = tf.toScreen(tip);
      ar.setAttribute('x1', b.x); ar.setAttribute('y1', b.y);
      ar.setAttribute('x2', t.x); ar.setAttribute('y2', t.y);
    }
    function render2() {
      const R = state.load, M = state.load * state.pos;
      set(loadArrow, { x: state.pos, y: state.load * VIS }, { x: state.pos, y: 0 });
      set(rArrow, wall, { x: 0, y: R * VIS });
      overlay.moveLabel(lblP, { x: state.pos, y: state.load * VIS + 0.3 });
      overlay.moveLabel(lblR, { x: -0.3, y: R * VIS });
      handle.move({ x: state.pos, y: 0 });
      panel.setReadout([
        { label: 'P:', value: state.load + ' N' },
        { label: 'a:', value: state.pos.toFixed(2) + ' m' },
        { label: 'R:', value: R.toFixed(1) + ' N' },
        { label: 'M ngàm:', value: M.toFixed(1) + ' N·m' }
      ]);
    }

    const panel = shell.setTheory({
      formulas: ['\\textcolor{#b10dc9}{R} = \\textcolor{#e03030}{P}', '\\textcolor{#7c3aed}{M} = \\textcolor{#e03030}{P} \\cdot a'],
      legend: [{ color: Pal.force, label: 'P (tải)' }, { color: Pal.reaction, label: 'R ngàm' }, { color: Pal.moment, label: 'M ngàm' }],
      observe: 'Tải càng xa ngàm, mô men ngàm M = P·a càng lớn. Phản lực R luôn bằng P.'
    });

    const controls = shell.addControls({
      sliders: [
        { id: 'P', label: 'P', min: 20, max: 150, step: 10, value: state.load, unit: 'N',
          onInput: v => { state.load = v; render2(); } },
        { id: 'a', label: 'a', min: 0.5, max: L, step: 0.5, value: state.pos, unit: 'm',
          onInput: v => { state.pos = v; render2(); } }
      ]
    });

    const handle = shell.addHandle({ x: state.pos, y: 0 }, {
      fill: Pal.handle,
      onDrag(wp) {
        state.pos = Math.min(L, Math.max(0.5, wp.x));
        controls.setValue('a', state.pos.toFixed(1));
        render2();
      }
    });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
