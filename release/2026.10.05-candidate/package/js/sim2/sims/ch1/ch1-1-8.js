/**
 * ch1-1-8 — Phản lực liên kết + dựng FBD. beamReactions, đổi vị trí tải.
 * Slider P + kéo tải dọc dầm → Ra, Rb cập nhật. (Bespoke: dầm 2 gối, drag vị trí.)
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, P = root.SimPhysicsStatics, Pal = root.Sim2Palette;

  Reg.register('ch1-1-8', function(container) {
    const shell = Shell.createSimShell({
      // Extra top margin keeps the P=200 N arrowhead and label inside the legal viewport.
      container, worldBox: { minX: -1, minY: -1.2, maxX: 11, maxY: 4.5 }, reservePanel: true,
      meta: { name: 'Phản lực liên kết + dựng FBD', section: '1.8', chapter: 1 }
    });
    const { svg, tf, overlay, render } = shell;
    const L = 10, VIS = 0.02;
    const A = { x: 0, y: 0 }, B = { x: L, y: 0 };
    const state = { load: 100, pos: 4 };

    svg.appendChild(render.line(tf, A, B, { stroke: Pal.axis, width: 5 }));
    function support(pt) {
      svg.appendChild(render.poly(tf,
        [{ x: pt.x, y: 0 }, { x: pt.x - 0.4, y: -0.8 }, { x: pt.x + 0.4, y: -0.8 }],
        { closed: true, gradient: 'axis', depth: true, stroke: Pal.axis }));
    }
    support(A); support(B);

    const loadArrow = render.arrow(tf, svg, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: Pal.force, width: 3, class: 'sim2-load-line' });
    svg.appendChild(loadArrow);
    const raArrow = render.arrow(tf, svg, A, A, { stroke: Pal.reaction, width: 3, class: 'sim2-guide-line sim2-support-reaction' }); svg.appendChild(raArrow);
    const rbArrow = render.arrow(tf, svg, B, B, { stroke: Pal.reaction, width: 3, class: 'sim2-guide-line sim2-support-reaction' }); svg.appendChild(rbArrow);

    overlay.label('A', { x: 0, y: -1 }, { anchor: 'top' });
    overlay.label('B', { x: L, y: -1 }, { anchor: 'top' });
    const lblP = overlay.label('P', { x: state.pos, y: 1 }, { anchor: 'bottom', color: Pal.force });
    const lblRa = overlay.label('Rₐ', { x: 0, y: 1 }, { anchor: 'right', color: Pal.reaction });
    const lblRb = overlay.label('Rᵦ', { x: L, y: 1 }, { anchor: 'left', color: Pal.reaction });

    function set(ar, base, tip) {
      const b = tf.toScreen(base), t = tf.toScreen(tip);
      ar.setAttribute('x1', b.x); ar.setAttribute('y1', b.y);
      ar.setAttribute('x2', t.x); ar.setAttribute('y2', t.y);
    }
    function render2() {
      const r = P.beamReactions(state.load, state.pos, L);
      set(loadArrow, { x: state.pos, y: state.load * VIS }, { x: state.pos, y: 0 });
      set(raArrow, A, { x: 0, y: r.ra * VIS });
      set(rbArrow, B, { x: L, y: r.rb * VIS });
      overlay.moveLabel(lblP, { x: state.pos, y: state.load * VIS + 0.3 });
      overlay.moveLabel(lblRa, { x: -0.3, y: r.ra * VIS });
      overlay.moveLabel(lblRb, { x: L + 0.3, y: r.rb * VIS });
      handle.move({ x: state.pos, y: 0 });
      aInput.setValue(state.pos);
      panel.setReadout([
        { key: 'P', label: 'P:', value: state.load + ' N' },
        { key: 'a', label: 'a:', value: state.pos.toFixed(2) + ' m' },
        { key: 'Ra', label: 'Rₐ:', value: r.ra.toFixed(1) + ' N' },
        { key: 'Rb', label: 'Rᵦ:', value: r.rb.toFixed(1) + ' N' },
        { key: 'Ax', label: 'Aₓ:', value: '0 N' },
        { key: 'sumFy', label: 'ΣFᵧ = Rₐ + Rᵦ − P:', value: (r.ra + r.rb - state.load).toFixed(6) + ' N' },
        { key: 'sumMA', label: 'ΣMₐ = RᵦL − Pa:', value: (r.rb * L - state.load * state.pos).toFixed(6) + ' N·m' },
        { key: 'dimensions', label: 'Kích thước:', value: `a = ${state.pos.toFixed(1)} m; L−a = ${(L-state.pos).toFixed(1)} m; L = ${L} m` }
      ]);
    }

    const panel = shell.setTheory({
      formulas: ['\\textcolor{#b10dc9}{R_A} = \\textcolor{#e03030}{P}\\dfrac{L-a}{L}', '\\textcolor{#b10dc9}{R_B} = \\textcolor{#e03030}{P}\\dfrac{a}{L}'],
      legend: [{ color: Pal.force, label: 'P (tải)' }, { color: Pal.reaction, label: 'phản lực gối' }],
      observe: 'Ký hiệu gối giản lược: khớp A (Aₓ, Rₐ), gối lăn B (Rᵦ). Dầm nhẹ, tải đứng; Aₓ = 0. Tải càng gần gối nào, phản lực gối đó càng lớn. Bảng kích thước và tổng lực/mômen kiểm chứng cân bằng.'
    });

    const controls = shell.addControls({
      sliders: [
        { id: 'P', label: 'P', min: 20, max: 200, step: 10, value: state.load, unit: 'N',
          onInput: v => { state.load = Math.round(v/10)*10; controls.setValue('P', state.load); render2(); } }
      ]
    });

    const handle = shell.addHandle({ x: state.pos, y: 0 }, {
      fill: Pal.handle,
      a11y: { label: 'Vị trí tải a từ gối A', axis: 'x', min: 0.3, max: L - 0.3, valueText: wp => `a ${wp.x.toFixed(1)} m từ A` },
      bounds: { minX: 0.3, maxX: L - 0.3, minY: 0, maxY: 0 },
      keyboardStep: { x: 0.5, y: 0 },
      onDrag(wp) {
        state.pos = Math.round(Math.min(L - 0.3, Math.max(0.3, wp.x)) * 10) / 10;
        render2();
      }
    });
    const aInput = shell.addNumberControl({ id: 'a', label: 'Vị trí tải a', min: 0.3, max: 9.7, step: 0.1, value: 4, unit: 'm', onInput(v) { state.pos = Math.round(v*10)/10; render2(); } });
    shell.addAction({ id: 'reset', label: 'Đặt lại', onClick() { state.load = 100; state.pos = 4; controls.setValue('P', 100); render2(); } });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
