/**
 * ch2-4-4 — Hợp chuyển động & Coriolis. coriolisAcceleration + coriolisAccelerationVec.
 * Slider ω, v_rel (hết hardcode) + playback (start paused). Canvas vẽ đường tuyệt đối (#15);
 * SVG vẽ a_cor (hổ phách) ⊥ v_rel (lục); nhãn DOM.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, K = root.SimPhysicsKinematics, Pal = root.Sim2Palette;

  Reg.register('ch2-4-4', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -5, minY: -5, maxX: 5, maxY: 5 }, canvas: true, reservePanel: true
    });
    const { svg, tf, overlay, render, canvas } = shell;
    const O = { x: 0, y: 0 };
    const params = { omega: 1.2, vRel: 1.5 }; // initial = giá trị hardcode cũ
    let t = 0;

    svg.appendChild(render.circle(tf, O, 4, { stroke: Pal.axis, width: 2, fill: 'rgba(124,58,237,0.06)' }));
    svg.appendChild(render.circle(tf, O, 5, { pixel: true, fill: Pal.axis, stroke: Pal.axis }));
    const ptMark = render.circle(tf, O, 5, { pixel: true, fill: Pal.force, stroke: Pal.force }); svg.appendChild(ptMark);
    const vrArrow = render.arrow(tf, svg, O, O, { stroke: Pal.v, width: 2.5 }); svg.appendChild(vrArrow);
    const acArrow = render.arrow(tf, svg, O, O, { stroke: Pal.coriolis, width: 2.5 }); svg.appendChild(acArrow);

    const lblVr = overlay.label('v_rel', O, { anchor: 'left', color: Pal.v });
    const lblAc = overlay.label('a_cor', O, { anchor: 'left', color: Pal.coriolis });

    let absTrail = [];
    function reset() { t = 0; absTrail = []; draw(); }
    function setArrow(ar, base, tip) {
      const b = tf.toScreen(base), tp = tf.toScreen(tip);
      ar.setAttribute('x1', b.x); ar.setAttribute('y1', b.y);
      ar.setAttribute('x2', tp.x); ar.setAttribute('y2', tp.y);
    }
    function draw() {
      const rRel = 2 + 1.5 * Math.sin(params.vRel * t * 0.5);
      const phi = params.omega * t;
      const p = { x: rRel * Math.cos(phi), y: rRel * Math.sin(phi) };
      absTrail.push(p);
      if (absTrail.length > 400) absTrail.shift();
      canvas.clear();
      canvas.drawTrail(absTrail, { stroke: 'rgba(124,58,237,0.5)', width: 1.5 });
      const ur = { x: Math.cos(phi), y: Math.sin(phi) };
      const sp = tf.toScreen(p);
      ptMark.setAttribute('cx', sp.x); ptMark.setAttribute('cy', sp.y);
      setArrow(vrArrow, p, { x: p.x + ur.x * params.vRel, y: p.y + ur.y * params.vRel });
      const vrx = ur.x * params.vRel, vry = ur.y * params.vRel;
      const ac = K.coriolisAccelerationVec(params.omega, vrx, vry);
      const acMag = K.coriolisAcceleration(params.omega, params.vRel);
      const VS = 0.3;
      setArrow(acArrow, p, { x: p.x + ac.ax * VS, y: p.y + ac.ay * VS });
      overlay.moveLabel(lblVr, { x: p.x + ur.x * params.vRel + 0.3, y: p.y + ur.y * params.vRel });
      overlay.moveLabel(lblAc, { x: p.x + ac.ax * VS + 0.3, y: p.y + ac.ay * VS });
      panel.setReadout([
        { label: 'ω:', value: params.omega.toFixed(2) + ' rad/s' },
        { label: 'v_rel:', value: params.vRel.toFixed(2) + ' m/s' },
        { label: '|a_cor|:', value: acMag.toFixed(2) + ' m/s²' }
      ]);
    }
    function frame() { t += 1 / 60; draw(); }

    const panel = shell.setTheory({
      formulas: ['\\textcolor{#d97706}{\\vec{a}_{cor}} = 2\\,\\vec{\\omega} \\times \\textcolor{#159c3a}{\\vec{v}_{rel}}', '|a_{cor}| = 2\\omega v_{rel}'],
      legend: [{ color: Pal.v, label: 'v_rel' }, { color: Pal.coriolis, label: 'a Coriolis' }],
      observe: 'Bấm ▶. Gia tốc Coriolis luôn vuông góc v_rel; tăng ω hoặc v_rel thấy |a_cor| lớn hơn.'
    });

    shell.addControls({
      sliders: [
        { id: 'omega', label: 'ω', min: 0.4, max: 2.5, step: 0.1, value: params.omega, unit: 'rad/s',
          onInput: v => { params.omega = v; } },
        { id: 'vRel', label: 'v_rel', min: 0.5, max: 3, step: 0.1, value: params.vRel, unit: 'm/s',
          onInput: v => { params.vRel = v; } }
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
