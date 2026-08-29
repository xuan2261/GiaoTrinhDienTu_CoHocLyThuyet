/**
 * ch2-1-1 — Quỹ đạo chất điểm + v, a. parabolaPoint + đạo hàm số.
 * Slider v₀, α + playback (start paused). Canvas vẽ VẾT (#11); SVG vẽ v (lục) + a (lam).
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, K = root.SimPhysicsKinematics, Pal = root.Sim2Palette;

  Reg.register('ch2-1-1', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -1, minY: -1, maxX: 22, maxY: 12 }, canvas: true, reservePanel: true,
      meta: { name: 'Quỹ đạo chất điểm + v, a', section: '1.1', chapter: 2 }
    });
    const { svg, tf, overlay, render, canvas } = shell;
    const g = 9.81;
    const params = { v0: 14, alphaDeg: 55 };
    const V_SCALE = 0.25;
    const A_SCALE = 0.08;
    function trajectoryDisplayScale() {
      const alpha = params.alphaDeg * Math.PI / 180;
      const range = params.v0 * params.v0 * Math.sin(2 * alpha) / g;
      const height = Math.pow(params.v0 * Math.sin(alpha), 2) / (2 * g);
      return Math.min(1, 20 / Math.max(range, 1), 10 / Math.max(height, 1));
    }
    function displayPoint(p) {
      const scale = trajectoryDisplayScale();
      return { x: p.x * scale, y: p.y * scale };
    }
    function displayVector(v, factor, maxLength) {
      const x = v.x * factor, y = v.y * factor;
      const length = Math.hypot(x, y);
      const scale = length > maxLength ? maxLength / length : 1;
      return { x: x * scale, y: y * scale };
    }

    svg.appendChild(render.line(tf, { x: -1, y: 0 }, { x: 22, y: 0 }, { stroke: Pal.axis, width: 1 }));
    svg.appendChild(render.line(tf, { x: 0, y: -1 }, { x: 0, y: 12 }, { stroke: Pal.axis, width: 1 }));

    const ptMark = render.circle(tf, { x: 0, y: 0 }, 5, { pixel: true, fill: Pal.force, stroke: Pal.force, class: 'sim2-current-marker' });
    svg.appendChild(ptMark);
    const vArrow = render.arrow(tf, svg, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: Pal.v, width: 2.5 }); svg.appendChild(vArrow);
    const aArrow = render.arrow(tf, svg, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: Pal.a, width: 2.5 }); svg.appendChild(aArrow);

    const lblV = overlay.label('v', { x: 0, y: 0 }, { anchor: 'left', color: Pal.v });
    const lblA = overlay.label('a', { x: 0, y: 0 }, { anchor: 'left', color: Pal.a });

    let posFn, tFlight, trail, t;
    function reset() {
      posFn = tt => K.parabolaPoint(params.v0, params.alphaDeg, g, tt, 0, 0);
      tFlight = 2 * params.v0 * Math.sin(params.alphaDeg * Math.PI / 180) / g;
      trail = []; t = 0;
      shell.resetClock();
      draw();
    }
    function setArrow(ar, base, tip) {
      const b = tf.toScreen(base), tp = tf.toScreen(tip);
      ar.setAttribute('x1', b.x); ar.setAttribute('y1', b.y);
      ar.setAttribute('x2', tp.x); ar.setAttribute('y2', tp.y);
    }
    function draw() {
      const p = posFn(t);
      const displayP = displayPoint(p);
      canvas.clear();
      canvas.drawTrail(trail, { fade: true, stroke: 'rgba(224,48,48,0.72)', width: 2, minAlpha: 0.16, maxAlpha: 0.72 });
      const sp = tf.toScreen(displayP);
      ptMark.setAttribute('cx', sp.x); ptMark.setAttribute('cy', sp.y);
      const v = K.velocityFromTrajectory(posFn, t);
      const a = K.accelerationFromVelocity(tt => K.velocityFromTrajectory(posFn, tt), t);
      const displayV = displayVector({ x: v.vx, y: v.vy }, V_SCALE, 2.6);
      const displayA = displayVector({ x: a.ax, y: a.ay }, A_SCALE, 1.2);
      setArrow(vArrow, displayP, { x: displayP.x + displayV.x, y: displayP.y + displayV.y });
      setArrow(aArrow, displayP, { x: displayP.x + displayA.x, y: displayP.y + displayA.y });
      overlay.moveLabel(lblV, { x: displayP.x + displayV.x + 0.7, y: displayP.y + displayV.y + 0.5 });
      overlay.moveLabel(lblA, { x: displayP.x + displayA.x - 0.7, y: displayP.y + displayA.y - 0.4 });
      panel.setReadout([
        { key: 't', label: 't:', value: t.toFixed(2) + ' s' },
        { key: 'v', label: '|v|:', value: Math.hypot(v.vx, v.vy).toFixed(1) + ' m/s' },
        { key: 'a', label: '|a|:', value: Math.hypot(a.ax, a.ay).toFixed(1) + ' m/s²' }
      ]);
    }
    function update(dt) {
      t += dt;
      if (t > tFlight) { t = 0; trail.length = 0; }
      trail.push(displayPoint(posFn(t)));
    }

    const panel = shell.setTheory({
      formulas: ['x = v_0\\cos\\alpha \\cdot t', 'y = v_0\\sin\\alpha \\cdot t - \\tfrac{1}{2}gt^2'],
      legend: [{ color: Pal.v, label: 'v (vận tốc)' }, { color: Pal.a, label: 'a (gia tốc)' }],
      observe: 'Bấm ▶ để phóng. Readout giữ đại lượng vật lý; quỹ đạo và vectơ tự thu tỉ lệ hiển thị khi tham số cực đại.'
    });

    shell.addControls({
      sliders: [
        { id: 'v0', label: 'v₀', min: 8, max: 20, step: 1, value: params.v0, unit: 'm/s',
          onInput: v => { params.v0 = v; reset(); } },
        { id: 'alpha', label: 'α', min: 20, max: 80, step: 5, value: params.alphaDeg, unit: '°',
          onInput: v => { params.alphaDeg = v; reset(); } }
      ],
      playback: {
        playing: false,
        onPlay: () => shell.start(), onPause: () => shell.stop(),
        onStep: () => shell.stepOnce(), onReset: () => { shell.stop(); reset(); }
      }
    });

    reset();
    shell.onFrame(update, draw);
    shell.stop();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
