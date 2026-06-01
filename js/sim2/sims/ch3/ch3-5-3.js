/**
 * ch3-5-3 — Bảo toàn mô men động lượng. L = I·ω giữ nguyên khi không mô men ngoài.
 * Slider r + playback (start paused). Co/giãn bán kính → I đổi → ω đổi sao cho L = const.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, D = root.SimPhysicsDynamics, Pal = root.Sim2Palette;

  Reg.register('ch3-5-3', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -4, minY: -4, maxX: 4, maxY: 4 }, reservePanel: true,
      meta: { name: 'Bảo toàn mô men động lượng', section: '5.3', chapter: 3 }
    });
    const { svg, tf, overlay, render } = shell;
    const O = { x: 0, y: 0 }, mPoint = 2;
    const r0 = 3, omega0 = 1;
    const Ltot = D.angularMomentum(D.momentOfInertia(mPoint, r0), omega0) * 2; // L tổng 2 khối
    const state = { r: r0 };
    let phi = 0;

    svg.appendChild(render.circle(tf, O, 5, { pixel: true, fill: Pal.axis, stroke: Pal.axis }));
    const arm1 = render.line(tf, O, { x: state.r, y: 0 }, { stroke: Pal.moment, width: 3 }); svg.appendChild(arm1);
    const arm2 = render.line(tf, O, { x: -state.r, y: 0 }, { stroke: Pal.moment, width: 3 }); svg.appendChild(arm2);
    const mass1 = render.circle(tf, { x: state.r, y: 0 }, 7, { pixel: true, gradient: 'force', depth: true, stroke: Pal.force }); svg.appendChild(mass1);
    const mass2 = render.circle(tf, { x: -state.r, y: 0 }, 7, { pixel: true, gradient: 'force', depth: true, stroke: Pal.force }); svg.appendChild(mass2);

    overlay.label('O', O, { anchor: 'right' });

    function curOmega() {
      const I = D.momentOfInertia(mPoint, state.r) * 2;
      return Ltot / I;
    }
    function draw() {
      const I = D.momentOfInertia(mPoint, state.r) * 2;
      const omega = Ltot / I;
      const p1 = { x: state.r * Math.cos(phi), y: state.r * Math.sin(phi) };
      const p2 = { x: -state.r * Math.cos(phi), y: -state.r * Math.sin(phi) };
      const sO = tf.toScreen(O), s1 = tf.toScreen(p1), s2 = tf.toScreen(p2);
      arm1.setAttribute('x1', sO.x); arm1.setAttribute('y1', sO.y);
      arm1.setAttribute('x2', s1.x); arm1.setAttribute('y2', s1.y);
      arm2.setAttribute('x1', sO.x); arm2.setAttribute('y1', sO.y);
      arm2.setAttribute('x2', s2.x); arm2.setAttribute('y2', s2.y);
      mass1.setAttribute('cx', s1.x); mass1.setAttribute('cy', s1.y);
      mass2.setAttribute('cx', s2.x); mass2.setAttribute('cy', s2.y);
      handle.move(p1);
      panel.setReadout([
        { label: 'r:', value: state.r.toFixed(2) + ' m' },
        { label: 'I:', value: I.toFixed(2) + ' kg·m²' },
        { label: 'ω:', value: omega.toFixed(2) + ' rad/s' },
        { label: 'L = I·ω:', value: (I * omega).toFixed(2) + ' (const)' }
      ]);
    }
    function frame() { phi += curOmega() * (1 / 60); draw(); }
    function reset() { phi = 0; draw(); }

    const panel = shell.setTheory({
      formulas: ['\\textcolor{#7c3aed}{L} = I\\omega = \\text{const}', 'I = \\sum m_i r_i^2'],
      legend: [{ color: Pal.force, label: 'khối m' }, { color: Pal.moment, label: 'cánh tay r' }],
      observe: 'Bấm ▶ rồi kéo khối vào/ra: r giảm → I giảm → ω tăng (vũ công xoay co tay). L không đổi.'
    });

    const controls = shell.addControls({
      sliders: [
        { id: 'r', label: 'r', min: 0.8, max: 3.5, step: 0.1, value: state.r, unit: 'm',
          onInput: v => { state.r = v; draw(); } }
      ],
      playback: {
        playing: false,
        onPlay: () => shell.start(), onPause: () => shell.stop(),
        onStep: () => frame(), onReset: () => { shell.stop(); reset(); }
      }
    });

    const handle = shell.addHandle({ x: state.r, y: 0 }, {
      fill: Pal.handle,
      onDrag(wp) {
        state.r = Math.min(3.5, Math.max(0.8, Math.hypot(wp.x, wp.y)));
        controls.setValue('r', state.r.toFixed(1));
        draw();
      }
    });

    reset();
    shell.onFrame(frame);
    shell.stop();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
