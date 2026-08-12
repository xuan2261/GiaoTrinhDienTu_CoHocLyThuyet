/**
 * ch1-1-8 — Phản lực liên kết + dựng FBD. beamReactions, đổi vị trí tải.
 * Slider P + kéo tải dọc dầm → Ra, Rb cập nhật. (Bespoke: dầm 2 gối, drag vị trí.)
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, P = root.SimPhysicsStatics, Pal = root.Sim2Palette;

  Reg.register('ch1-1-8', function(container) {
    const shell = Shell.createSimShell({
      // minY -1.5→-1.2: bỏ dead-space dưới dầm (gối chân y=-0.8 còn margin 0.4). GIỮ maxY=4 (P=200 sát mép trên).
      container, worldBox: { minX: -1, minY: -1.2, maxX: 11, maxY: 4 }, reservePanel: true,
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
      panel.setReadout([
        { label: 'P:', value: state.load + ' N' },
        { label: 'a:', value: state.pos.toFixed(2) + ' m' },
        { label: 'Rₐ:', value: r.ra.toFixed(1) + ' N' },
        { label: 'Rᵦ:', value: r.rb.toFixed(1) + ' N' }
      ]);
    }

    const panel = shell.setTheory({
      formulas: ['\\textcolor{#b10dc9}{R_A} = \\textcolor{#e03030}{P}\\dfrac{L-a}{L}', '\\textcolor{#b10dc9}{R_B} = \\textcolor{#e03030}{P}\\dfrac{a}{L}'],
      legend: [{ color: Pal.force, label: 'P (tải)' }, { color: Pal.reaction, label: 'phản lực gối' }],
      observe: 'Tải càng gần gối nào, phản lực gối đó càng lớn. Kéo tải hoặc đổi P.'
    });

    const controls = shell.addControls({
      sliders: [
        { id: 'P', label: 'P', min: 20, max: 200, step: 10, value: state.load, unit: 'N',
          onInput: v => { state.load = v; render2(); } }
      ]
    });

    const handle = shell.addHandle({ x: state.pos, y: 0 }, {
      fill: Pal.handle,
      onDrag(wp) {
        state.pos = Math.min(L - 0.3, Math.max(0.3, wp.x));
        render2();
      }
    });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
