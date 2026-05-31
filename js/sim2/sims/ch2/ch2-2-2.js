/**
 * ch2-2-2 — Quay quanh trục cố định (ω, α). angularVelocity/Displacement.
 * Slider ω₀, α (gia tốc góc) + playback (start paused). v tiếp tuyến lục.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, K = root.SimPhysicsKinematics, Pal = root.Sim2Palette;

  Reg.register('ch2-2-2', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -4, minY: -4, maxX: 4, maxY: 4 }, reservePanel: true
    });
    const { svg, tf, overlay, render } = shell;
    const O = { x: 0, y: 0 }, R = 3;
    const params = { omega0: 0.5, alphaAcc: 0.15 };
    let t = 0;

    svg.appendChild(render.circle(tf, O, R, { stroke: Pal.axis, width: 2, fill: 'rgba(124,58,237,0.10)' }));
    svg.appendChild(render.circle(tf, O, 5, { pixel: true, fill: Pal.axis, stroke: Pal.axis }));
    const spoke = render.line(tf, O, { x: R, y: 0 }, { stroke: Pal.moment, width: 3 }); svg.appendChild(spoke);
    const ptMark = render.circle(tf, { x: R, y: 0 }, 5, { pixel: true, fill: Pal.moment, stroke: Pal.moment });
    svg.appendChild(ptMark);
    const vArrow = render.arrow(tf, svg, O, O, { stroke: Pal.v, width: 2.5 }); svg.appendChild(vArrow);

    overlay.label('O', O, { anchor: 'right' });
    const lblP = overlay.label('M', { x: R, y: 0 }, { anchor: 'left', color: Pal.moment });

    function draw() {
      const phi = K.angularDisplacement(params.omega0, params.alphaAcc, t);
      const omega = K.angularVelocity(params.omega0, params.alphaAcc, t);
      const px = R * Math.cos(phi), py = R * Math.sin(phi);
      const sO = tf.toScreen(O), sP = tf.toScreen({ x: px, y: py });
      spoke.setAttribute('x1', sO.x); spoke.setAttribute('y1', sO.y);
      spoke.setAttribute('x2', sP.x); spoke.setAttribute('y2', sP.y);
      ptMark.setAttribute('cx', sP.x); ptMark.setAttribute('cy', sP.y);
      const vt = K.tangentialVelocity(omega, R);
      const vx = -Math.sin(phi) * vt * 0.15, vy = Math.cos(phi) * vt * 0.15;
      const sV = tf.toScreen({ x: px + vx, y: py + vy });
      vArrow.setAttribute('x1', sP.x); vArrow.setAttribute('y1', sP.y);
      vArrow.setAttribute('x2', sV.x); vArrow.setAttribute('y2', sV.y);
      overlay.moveLabel(lblP, { x: px + 0.3, y: py + 0.2 });
      panel.setReadout([
        { label: 'ω₀:', value: params.omega0.toFixed(2) + ' rad/s' },
        { label: 'α (gia tốc góc):', value: params.alphaAcc.toFixed(2) + ' rad/s²' },
        { label: 'ω(t):', value: omega.toFixed(2) + ' rad/s' },
        { label: 'φ(t):', value: phi.toFixed(2) + ' rad' }
      ]);
    }
    function frame() { t += 1 / 60; draw(); }
    function reset() { t = 0; draw(); }

    const panel = shell.setTheory({
      formulas: ['\\textcolor{#7c3aed}{\\omega}(t) = \\omega_0 + \\alpha t', '\\varphi(t) = \\omega_0 t + \\tfrac{1}{2}\\alpha t^2'],
      legend: [{ color: Pal.moment, label: 'điểm M / φ' }, { color: Pal.v, label: 'v tiếp tuyến' }],
      observe: 'Bấm ▶ để quay. Vận tốc tiếp tuyến v = ω·R tăng dần khi có gia tốc góc α.'
    });

    shell.addControls({
      sliders: [
        { id: 'omega0', label: 'ω₀', min: 0, max: 2, step: 0.1, value: params.omega0, unit: 'rad/s',
          onInput: v => { params.omega0 = v; reset(); } },
        { id: 'alphaAcc', label: 'α', min: 0, max: 0.5, step: 0.05, value: params.alphaAcc, unit: 'rad/s²',
          onInput: v => { params.alphaAcc = v; reset(); } }
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
