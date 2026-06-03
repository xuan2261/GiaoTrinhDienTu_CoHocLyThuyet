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
      // worldBox nới ±5→±5.6: đĩa r=4 trước chiếm ~80% khung; nới biên còn ~71%, nhẹ mắt.
      // Hạt rRel max 3.5 vẫn nằm trong đĩa (không lệch ra rìa). Canvas dùng cùng tf nên vẫn khớp SVG.
      container, worldBox: { minX: -5.6, minY: -5.6, maxX: 5.6, maxY: 5.6 }, canvas: true, reservePanel: true,
      meta: { name: 'Hợp chuyển động & Coriolis', section: '4.4', chapter: 2 }
    });
    const { svg, tf, overlay, render, canvas } = shell;
    const O = { x: 0, y: 0 };
    const params = { omega: 1.2, vRel: 1.5 }; // initial = giá trị hardcode cũ
    let t = 0;

    svg.appendChild(render.circle(tf, O, 4, { stroke: Pal.axis, width: 2, gradient: 'moment', depth: true }));
    svg.appendChild(render.circle(tf, O, 5, { pixel: true, fill: Pal.axis, stroke: Pal.axis }));
    const ptMark = render.circle(tf, O, 5, { pixel: true, fill: Pal.force, stroke: Pal.force }); svg.appendChild(ptMark);
    const vrArrow = render.arrow(tf, svg, O, O, { stroke: Pal.v, width: 2.5, class: 'sim2-vector-vrel' }); svg.appendChild(vrArrow);
    const acArrow = render.arrow(tf, svg, O, O, { stroke: Pal.coriolis, width: 2.5, class: 'sim2-vector-coriolis' }); svg.appendChild(acArrow);

    const lblVr = overlay.label('v_rel', O, { anchor: 'left', color: Pal.v, class: 'sim2-vrel-callout' });
    const lblAc = overlay.label('a_cor', O, { anchor: 'left', color: Pal.coriolis, class: 'sim2-coriolis-callout' });

    let absTrail = [];
    function reset() { t = 0; absTrail = []; draw(); }
    function setArrow(ar, base, tip) {
      const b = tf.toScreen(base), tp = tf.toScreen(tip);
      ar.setAttribute('x1', b.x); ar.setAttribute('y1', b.y);
      ar.setAttribute('x2', tp.x); ar.setAttribute('y2', tp.y);
    }
    function draw() {
      const radialPhase = params.vRel * t * 0.5;
      const rRel = 2 + 1.5 * Math.sin(radialPhase);
      const radialSpeed = 0.75 * params.vRel * Math.cos(radialPhase);
      const phi = params.omega * t;
      const p = { x: rRel * Math.cos(phi), y: rRel * Math.sin(phi) };
      absTrail.push(p);
      if (absTrail.length > 400) absTrail.shift();
      canvas.clear();
      canvas.drawTrail(absTrail, { fade: true, stroke: 'rgba(124,58,237,0.75)', width: 1.5, minAlpha: 0.16, maxAlpha: 0.72 });
      const ur = { x: Math.cos(phi), y: Math.sin(phi) };
      const sp = tf.toScreen(p);
      ptMark.setAttribute('cx', sp.x); ptMark.setAttribute('cy', sp.y);
      setArrow(vrArrow, p, { x: p.x + ur.x * radialSpeed, y: p.y + ur.y * radialSpeed });
      const vrx = ur.x * radialSpeed, vry = ur.y * radialSpeed;
      const ac = K.coriolisAccelerationVec(params.omega, vrx, vry);
      const acMag = K.coriolisAcceleration(params.omega, Math.abs(radialSpeed));
      const VS = 0.3;
      setArrow(acArrow, p, { x: p.x + ac.ax * VS, y: p.y + ac.ay * VS });
      const acLen = Math.hypot(ac.ax, ac.ay) || 1;
      const acDir = { x: ac.ax / acLen, y: ac.ay / acLen };
      overlay.moveLabel(lblVr, { x: p.x + ur.x * 0.9, y: p.y + ur.y * 0.9 });
      overlay.moveLabel(lblAc, { x: p.x + acDir.x * 1.15, y: p.y + acDir.y * 1.15 });
      panel.setReadout([
        { key: 'omega', label: 'ω:', value: params.omega.toFixed(2) + ' rad/s' },
        { key: 'vRel', label: 'v_rel:', value: radialSpeed.toFixed(2) + ' m/s' },
        { key: 'aCor', label: '|a_cor|:', value: acMag.toFixed(2) + ' m/s²' }
      ]);
      if (sim3) sim3.setState({
        omega: params.omega,
        vRel: radialSpeed,
        phi,
        point: p,
        vRelVec: { x: vrx, y: vry },
        aCor: { x: ac.ax, y: ac.ay, mag: acMag }
      });
    }
    function frame() { t += 1 / 60; draw(); }

    const panel = shell.setTheory({
      formulas: ['\\textcolor{#d97706}{\\vec{a}_{cor}} = 2\\,\\vec{\\omega} \\times \\textcolor{#159c3a}{\\vec{v}_{rel}}', '|a_{cor}| = 2\\omega v_{rel}'],
      legend: [{ color: Pal.v, label: 'v_rel' }, { color: Pal.coriolis, label: 'a Coriolis' }],
      observe: 'Bấm ▶. Gia tốc Coriolis luôn vuông góc v_rel; tăng ω hoặc v_rel thấy |a_cor| lớn hơn.'
    });
    const sim3 = root.Sim3Mode && root.Sim3Ch244 ? root.Sim3Mode.attach({
      container,
      shell2dRoot: shell.root,
      create3d: ctx => root.Sim3Ch244.create({ host: ctx.host, referenceEl: shell.root, onFallback: ctx.onFallback })
    }) : null;
    if (sim3) shell.addCleanup(() => sim3.dispose());

    shell.addControls({
      sliders: [
        { id: 'omega', label: 'ω', min: 0.4, max: 2.5, step: 0.1, value: params.omega, unit: 'rad/s',
          onInput: v => { params.omega = v; absTrail.length = 0; draw(); } },
        { id: 'vRel', label: 'v_rel', min: 0.5, max: 3, step: 0.1, value: params.vRel, unit: 'm/s',
          onInput: v => { params.vRel = v; absTrail.length = 0; draw(); } }
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
