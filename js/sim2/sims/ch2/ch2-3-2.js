/**
 * ch2-3-2 — Truyền động bánh răng / đai / puli. gearRatio, beltVelocity, no-slip.
 * Slider r₁, r₂ + playback (start paused). 2 bánh ăn khớp quay ngược; ω₂ = -ω₁·r₁/r₂.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, K = root.SimPhysicsKinematics, Pal = root.Sim2Palette;

  Reg.register('ch2-3-2', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -4, minY: -3, maxX: 6, maxY: 3 }, reservePanel: true
    });
    const { svg, tf, overlay, render } = shell;
    const omega1 = 1.0;
    const params = { r1: 1.4, r2: 2.0 };
    let t = 0;

    const C1 = { x: -1.6, y: 0 };
    function C2() { return { x: C1.x + params.r1 + params.r2, y: 0 }; }

    const gear1 = render.circle(tf, C1, params.r1, { stroke: Pal.v, width: 2, fill: 'rgba(21,156,58,0.10)' }); svg.appendChild(gear1);
    const gear2 = render.circle(tf, C2(), params.r2, { stroke: Pal.a, width: 2, fill: 'rgba(0,116,217,0.10)' }); svg.appendChild(gear2);
    svg.appendChild(render.circle(tf, C1, 4, { pixel: true, fill: Pal.axis, stroke: Pal.axis }));
    const hub2 = render.circle(tf, C2(), 4, { pixel: true, fill: Pal.axis, stroke: Pal.axis }); svg.appendChild(hub2);
    const sp1 = render.line(tf, C1, { x: C1.x + params.r1, y: 0 }, { stroke: Pal.v, width: 3 }); svg.appendChild(sp1);
    const sp2 = render.line(tf, C2(), { x: C2().x + params.r2, y: 0 }, { stroke: Pal.a, width: 3 }); svg.appendChild(sp2);

    const lblZ1 = overlay.label('Z₁', { x: C1.x, y: -params.r1 - 0.4 }, { anchor: 'top', color: Pal.v });
    const lblZ2 = overlay.label('Z₂', { x: C2().x, y: -params.r2 - 0.4 }, { anchor: 'top', color: Pal.a });

    function setSpoke(sp, C, r, ang) {
      const b = tf.toScreen(C);
      const e = tf.toScreen({ x: C.x + r * Math.cos(ang), y: C.y + r * Math.sin(ang) });
      sp.setAttribute('x1', b.x); sp.setAttribute('y1', b.y);
      sp.setAttribute('x2', e.x); sp.setAttribute('y2', e.y);
    }
    function draw() {
      const omega2 = -omega1 * params.r1 / params.r2;
      const c2 = C2();
      // cập nhật hình học khi đổi bán kính
      gear1.setAttribute('r', params.r1 * tf.scale);
      gear2.setAttribute('r', params.r2 * tf.scale);
      const sc2 = tf.toScreen(c2);
      gear2.setAttribute('cx', sc2.x); gear2.setAttribute('cy', sc2.y);
      hub2.setAttribute('cx', sc2.x); hub2.setAttribute('cy', sc2.y);
      const phi1 = omega1 * t, phi2 = omega2 * t;
      setSpoke(sp1, C1, params.r1, phi1);
      setSpoke(sp2, c2, params.r2, phi2);
      overlay.moveLabel(lblZ2, { x: c2.x, y: -params.r2 - 0.4 });
      overlay.moveLabel(lblZ1, { x: C1.x, y: -params.r1 - 0.4 });
      panel.setReadout([
        { label: 'r₁:', value: params.r1.toFixed(1) },
        { label: 'r₂:', value: params.r2.toFixed(1) },
        { label: 'i = r₁/r₂:', value: K.gearRatio(params.r1, params.r2).toFixed(3) },
        { label: 'v đai:', value: K.beltVelocity(omega1, params.r1).toFixed(2) }
      ]);
    }
    function frame() { t += 1 / 60; draw(); }
    function reset() { t = 0; draw(); }

    const panel = shell.setTheory({
      formulas: ['i = \\dfrac{r_1}{r_2} = \\dfrac{\\omega_2}{\\omega_1}', 'v = \\omega_1 r_1 = \\omega_2 r_2'],
      legend: [{ color: Pal.v, label: 'bánh Z₁' }, { color: Pal.a, label: 'bánh Z₂' }],
      observe: 'Bấm ▶. 2 bánh ăn khớp quay ngược chiều; v điểm tiếp xúc (v đai) chung.'
    });

    shell.addControls({
      sliders: [
        { id: 'r1', label: 'r₁', min: 0.8, max: 2.5, step: 0.1, value: params.r1, unit: '',
          onInput: v => { params.r1 = v; reset(); } },
        { id: 'r2', label: 'r₂', min: 0.8, max: 2.5, step: 0.1, value: params.r2, unit: '',
          onInput: v => { params.r2 = v; reset(); } }
      ],
      playback: {
        playing: false,
        onPlay: () => shell.start(), onPause: () => shell.stop(),
        onStep: () => frame(), onReset: () => { shell.stop(); reset(); }
      }
    });

    reset();
    shell.onFrame(frame);
    shell.stop();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
