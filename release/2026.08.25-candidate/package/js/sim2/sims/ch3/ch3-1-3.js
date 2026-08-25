/**
 * ch3-1-3 — HQC quán tính vs phi quán tính. dalembertForce + equilibriumWithInertia.
 * Slider a + kéo gia tốc toa → lực quán tính F* và góc lệch con lắc cập nhật.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, D = root.SimPhysicsDynamics, Pal = root.Sim2Palette;

  Reg.register('ch3-1-3', function(container) {
    const shell = Shell.createSimShell({
      // worldBox thu DỌC -1..6 → -0.5..5.5: thân toa (y 0..5) lấp ~83% chiều cao (hết dead-space
      // trên+dưới). GIỮ maxX=5: thu ngang sẽ clip thân toa (x ±3.5). pivot y=5, bob hạ xuống vẫn trong khung.
      container, worldBox: { minX: -5, minY: -0.5, maxX: 5, maxY: 5.5 }, reservePanel: true,
      meta: { name: 'HQC quán tính vs phi quán tính', section: '1.3', chapter: 3 }
    });
    const { svg, tf, overlay, render } = shell;
    const m = 1, g = 9.81, VIS = 0.12;
    const state = { aFrame: 3 };
    let sim3 = null;

    svg.appendChild(render.poly(tf,
      [{ x: -3.5, y: 0 }, { x: 3.5, y: 0 }, { x: 3.5, y: 5 }, { x: -3.5, y: 5 }],
      { closed: true, gradient: 'axis', depth: true, stroke: Pal.axis, width: 3.5 }));
    const pivot = { x: 0, y: 5 };
    const bob = render.circle(tf, pivot, 7, { pixel: true, fill: Pal.a, stroke: Pal.a }); svg.appendChild(bob);
    const cord = render.line(tf, pivot, pivot, { stroke: Pal.axis, width: 2 }); svg.appendChild(cord);
    const aArrow = render.arrow(tf, svg, { x: -2.5, y: 2.5 }, { x: -2.5, y: 2.5 }, { stroke: Pal.a, width: 3 }); svg.appendChild(aArrow);
    const finArrow = render.arrow(tf, svg, pivot, pivot, { stroke: Pal.force, width: 2.5 }); svg.appendChild(finArrow);

    const lblA = overlay.label('a (toa)', { x: -2.5, y: 2.5 }, { anchor: 'bottom', color: Pal.a });
    const lblF = overlay.label('F* qt', pivot, { anchor: 'left', color: Pal.force });

    function set(ar, base, tip) {
      const b = tf.toScreen(base), t = tf.toScreen(tip);
      ar.setAttribute('x1', b.x); ar.setAttribute('y1', b.y);
      ar.setAttribute('x2', t.x); ar.setAttribute('y2', t.y);
    }
    function render2() {
      const theta = Math.atan2(state.aFrame, g);
      const L = 3;
      const bobPt = { x: pivot.x - L * Math.sin(theta), y: pivot.y - L * Math.cos(theta) };
      const sp = tf.toScreen(pivot), sb = tf.toScreen(bobPt);
      cord.setAttribute('x1', sp.x); cord.setAttribute('y1', sp.y);
      cord.setAttribute('x2', sb.x); cord.setAttribute('y2', sb.y);
      bob.setAttribute('cx', sb.x); bob.setAttribute('cy', sb.y);
      set(aArrow, { x: -2.5, y: 2.5 }, { x: -2.5 + state.aFrame * VIS, y: 2.5 });
      const fIner = D.dalembertForce(m, state.aFrame, 0);
      set(finArrow, bobPt, { x: bobPt.x + fIner.fx * VIS, y: bobPt.y });
      overlay.moveLabel(lblA, { x: -2.5 + state.aFrame * VIS * 0.5, y: 2.9 });
      overlay.moveLabel(lblF, { x: bobPt.x + fIner.fx * VIS - 0.3, y: bobPt.y + 0.4 });
      handle.move({ x: -2.5 + state.aFrame * VIS, y: 2.5 });
      panel.setFormulaHighlight(['inertia']);
      panel.setReadout([
        { key: 'aFrame', label: 'a toa:', value: state.aFrame.toFixed(1) + ' m/s²' },
        { key: 'inertiaForce', label: 'F* = -m·a:', value: fIner.fx.toFixed(1) + ' N' },
        { key: 'theta', label: 'θ lệch:', value: (theta * 180 / Math.PI).toFixed(1) + '°' },
        { key: 'tan', label: 'tanθ = a/g:', value: (state.aFrame / g).toFixed(3) }
      ]);
      if (sim3) sim3.setState({
        aFrame: state.aFrame,
        theta,
        thetaDeg: theta * 180 / Math.PI,
        fIner,
        pivot,
        bob: bobPt
      });
    }

    const panel = shell.setTheory({
      formulas: [
        { key: 'inertia', latex: '\\textcolor{#e03030}{F^*} = -m\\,\\textcolor{#0074d9}{a}' },
        { key: 'inertia', latex: '\\tan\\theta = \\dfrac{a}{g}' }
      ],
      legend: [{ color: Pal.a, label: 'a (gia tốc toa)' }, { color: Pal.force, label: 'F* quán tính' }],
      observe: 'Trong HQC phi quán tính, con lắc lệch do lực quán tính F* = -m·a. Kéo hoặc đổi a.'
    });

    sim3 = root.Sim3Mode && root.Sim3Ch313 ? root.Sim3Mode.attach({
      container,
      shell2dRoot: shell.root,
      create3d: ctx => root.Sim3Ch313.create({ host: ctx.host, referenceEl: shell.root, onFallback: ctx.onFallback })
    }) : null;
    if (sim3) shell.addCleanup(() => sim3.dispose());

    const controls = shell.addControls({
      sliders: [
        { id: 'a', label: 'a', min: 0, max: 8, step: 0.5, value: state.aFrame, unit: 'm/s²',
          onInput: v => { state.aFrame = v; render2(); } }
      ]
    });

    const handle = shell.addHandle({ x: -2.5 + state.aFrame * VIS, y: 2.5 }, {
      fill: Pal.handle,
      a11y: { label: 'Đầu vectơ gia tốc toa', axis: 'x', min: 0, max: 8, valueFromPoint: wp => (wp.x + 2.5) / VIS },
      keyboardStep: { x: 0.5 * VIS, y: 0 },
      onDrag(wp) {
        state.aFrame = Math.min(8, Math.max(0, (wp.x - (-2.5)) / VIS));
        controls.setValue('a', state.aFrame.toFixed(1));
        render2();
      }
    });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
