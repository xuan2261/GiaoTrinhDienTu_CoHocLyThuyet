/**
 * ch3-2-3 — Định luật III: lực & phản lực. Cặp lực đối nhau cùng độ lớn, ngược chiều.
 * Slider F + kéo độ lớn lực → cặp F_AB / F_BA cập nhật, luôn đối nhau (inertialForce).
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, D = root.SimPhysicsDynamics, Pal = root.Sim2Palette;

  Reg.register('ch3-2-3', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -6, minY: -1.7, maxX: 6, maxY: 1.0 }, reservePanel: true,
      meta: { name: 'Định luật III: lực & phản lực', section: '2.3', chapter: 3 }
    });
    const { svg, tf, overlay, render } = shell;
    const A = { x: -1.5, y: 0 }, B = { x: 1.5, y: 0 };
    const VIS = 0.03;
    const state = { Fmag: 60 };

    function blockPts(c) {
      return [{ x: c.x - 0.6, y: -0.6 }, { x: c.x + 0.6, y: -0.6 },
              { x: c.x + 0.6, y: 0.6 }, { x: c.x - 0.6, y: 0.6 }];
    }
    svg.appendChild(render.poly(tf, blockPts(A), { closed: true, gradient: 'a', depth: true, stroke: Pal.a }));
    svg.appendChild(render.poly(tf, blockPts(B), { closed: true, gradient: 'force', depth: true, stroke: Pal.force }));

    const fAB = render.arrow(tf, svg, B, B, { stroke: Pal.force, width: 3, class: 'sim2-action-reaction-pair' }); svg.appendChild(fAB);
    const fBA = render.arrow(tf, svg, A, A, { stroke: Pal.reaction, width: 3, class: 'sim2-action-reaction-pair' }); svg.appendChild(fBA);

    overlay.label('A', { x: A.x, y: -0.9 }, { anchor: 'top' });
    overlay.label('B', { x: B.x, y: -0.9 }, { anchor: 'top' });
    const lblAB = overlay.label('F_AB', B, { anchor: 'left', color: Pal.force });
    const lblBA = overlay.label('F_BA', A, { anchor: 'right', color: Pal.reaction });

    function set(ar, base, tip) {
      const b = tf.toScreen(base), t = tf.toScreen(tip);
      ar.setAttribute('x1', b.x); ar.setAttribute('y1', b.y);
      ar.setAttribute('x2', t.x); ar.setAttribute('y2', t.y);
    }
    function render2() {
      const react = D.inertialForce(1, state.Fmag, 0);
      const tipAB = { x: B.x + state.Fmag * VIS, y: 0 };
      const tipBA = { x: A.x - state.Fmag * VIS, y: 0 };
      set(fAB, B, tipAB); set(fBA, A, tipBA);
      overlay.moveLabel(lblAB, { x: tipAB.x + 0.3, y: 0.4 });
      overlay.moveLabel(lblBA, { x: tipBA.x - 0.3, y: 0.4 });
      handle.move({ x: B.x + state.Fmag * VIS, y: 0 });
      panel.setFormulaHighlight(['pair']);
      panel.setReadout([
        { key: 'FAB', label: 'F_AB:', value: '+' + state.Fmag.toFixed(0) + ' N' },
        { key: 'FBA', label: 'F_BA:', value: react.fx.toFixed(0) + ' N' },
        { key: 'pairMag', label: '|F_AB|=|F_BA|:', value: state.Fmag.toFixed(0) + ' N' },
        { key: 'sum', label: 'ΣF cặp:', value: '0' }
      ]);
    }

    const panel = shell.setTheory({
      formulas: [{ key: 'pair', latex: '\\textcolor{#e03030}{\\vec{F}_{AB}} = -\\textcolor{#b10dc9}{\\vec{F}_{BA}}' }],
      legend: [{ color: Pal.force, label: 'F_AB (lên B)' }, { color: Pal.reaction, label: 'F_BA (lên A)' }],
      observe: 'Kéo hoặc đổi F; cặp lực–phản lực luôn cùng độ lớn, ngược chiều, tổng = 0.'
    });

    const controls = shell.addControls({
      sliders: [
        { id: 'F', label: 'F', min: 20, max: 80, step: 5, value: state.Fmag, unit: 'N',
          onInput: v => { state.Fmag = v; render2(); } }
      ]
    });

    const handle = shell.addHandle({ x: B.x + state.Fmag * VIS, y: 0 }, {
      fill: Pal.handle,
      onDrag(wp) {
        state.Fmag = Math.min(80, Math.max(20, (wp.x - B.x) / VIS));
        controls.setValue('F', state.Fmag.toFixed(0));
        render2();
      }
    });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
