/**
 * ch1-1-3 — Véc tơ lực: điểm đặt / phương / độ lớn.
 * Nguồn trạng thái 1 chỗ {F, alphaDeg}; cả drag-handle lẫn slider ghi vào rồi render().
 * Drag → setValue (KHÔNG bắn input) → không vòng lặp; slider là nguồn khi kéo slider.
 * Màu: F đỏ (force), Fₓ rose (x), Fᵧ blue (y) — color-match KaTeX↔vector.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, P = root.SimPhysicsStatics, Pal = root.Sim2Palette;

  Reg.register('ch1-1-3', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -1, minY: -1, maxX: 6, maxY: 5 }, reservePanel: true
    });
    const { svg, tf, overlay, render } = shell;
    const VIS = 0.04; // 1N → 0.04 world

    // Trục
    svg.appendChild(render.line(tf, { x: -1, y: 0 }, { x: 6, y: 0 }, { stroke: Pal.axis, width: 1 }));
    svg.appendChild(render.line(tf, { x: 0, y: -1 }, { x: 0, y: 5 }, { stroke: Pal.axis, width: 1 }));

    const state = { F: 100, alphaDeg: 35 };

    const vecLine = render.arrow(tf, svg, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: Pal.force, width: 3 });
    svg.appendChild(vecLine);
    const fxLine = render.line(tf, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: Pal.x, width: 1.5, dash: '4 3' });
    const fyLine = render.line(tf, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: Pal.y, width: 1.5, dash: '4 3' });
    svg.appendChild(fxLine); svg.appendChild(fyLine);

    const lblF = overlay.label('F', { x: 0, y: 0 }, { anchor: 'left', color: Pal.force });
    overlay.label('O', { x: 0, y: 0 }, { anchor: 'right' });

    function tip() {
      const c = P.resolveForceComponents(state.F, state.alphaDeg);
      return { x: c.fx * VIS, y: c.fy * VIS, c };
    }

    function render2() {
      const t = tip();
      const ts = tf.toScreen(t), o = tf.toScreen({ x: 0, y: 0 });
      vecLine.setAttribute('x1', o.x); vecLine.setAttribute('y1', o.y);
      vecLine.setAttribute('x2', ts.x); vecLine.setAttribute('y2', ts.y);
      const fxEnd = tf.toScreen({ x: t.x, y: 0 });
      fxLine.setAttribute('x1', o.x); fxLine.setAttribute('y1', o.y);
      fxLine.setAttribute('x2', fxEnd.x); fxLine.setAttribute('y2', fxEnd.y);
      fyLine.setAttribute('x1', fxEnd.x); fyLine.setAttribute('y1', fxEnd.y);
      fyLine.setAttribute('x2', ts.x); fyLine.setAttribute('y2', ts.y);
      overlay.moveLabel(lblF, { x: t.x + 0.3, y: t.y + 0.2 });
      handle.move(t);
      panel.setReadout([
        { label: '|F|:', value: state.F.toFixed(0) + ' N' },
        { label: 'Fₓ:', value: t.c.fx.toFixed(1) + ' N' },
        { label: 'Fᵧ:', value: t.c.fy.toFixed(1) + ' N' },
        { label: 'α:', value: state.alphaDeg.toFixed(0) + '°' }
      ]);
    }

    const panel = shell.setTheory({
      formulas: [
        '\\textcolor{#d81b60}{F_x} = \\textcolor{#e03030}{F}\\cos\\alpha',
        '\\textcolor{#1565c0}{F_y} = \\textcolor{#e03030}{F}\\sin\\alpha'
      ],
      legend: [
        { color: Pal.force, label: 'F' },
        { color: Pal.x, label: 'Fₓ' },
        { color: Pal.y, label: 'Fᵧ' }
      ],
      observe: 'Kéo đầu mũi tên hoặc dùng thanh trượt để đổi độ lớn F và góc α.'
    });

    const controls = shell.addControls({
      sliders: [
        { id: 'F', label: 'F', min: 10, max: 120, step: 1, value: state.F, unit: 'N',
          onInput: v => { state.F = v; render2(); } },
        { id: 'alpha', label: 'α', min: 0, max: 90, step: 1, value: state.alphaDeg, unit: '°',
          onInput: v => { state.alphaDeg = v; render2(); } }
      ]
    });

    const handle = shell.addHandle(tip(), {
      fill: Pal.handle,
      onDrag(wp) {
        state.F = Math.min(120, Math.max(10, Math.hypot(wp.x, wp.y) / VIS));
        let a = Math.atan2(wp.y, wp.x) * 180 / Math.PI;
        state.alphaDeg = Math.min(90, Math.max(0, a));
        controls.setValue('F', state.F.toFixed(0));      // KHÔNG bắn input → không loop
        controls.setValue('alpha', state.alphaDeg.toFixed(0));
        render2();
      }
    });

    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
