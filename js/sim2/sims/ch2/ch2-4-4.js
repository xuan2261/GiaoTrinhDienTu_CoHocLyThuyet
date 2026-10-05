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
      // Đĩa thu 4→3.6 (vẫn ≥ rRel max 3.5 nên hạt không văng ra ngoài) + worldBox nới ±5.6→±6.4:
      // đĩa-trên-màn từ ~71% còn ~56% khung, thôi nuốt viewport. Canvas dùng cùng tf nên vẫn khớp SVG.
      container, worldBox: { minX: -6.4, minY: -6.4, maxX: 6.4, maxY: 6.4 }, canvas: true, reservePanel: true,
      meta: { name: 'Hợp chuyển động & Coriolis', section: '4.4', chapter: 2 }
    });
    const { svg, tf, overlay, render, canvas } = shell;
    const O = { x: 0, y: 0 };
    const params = { omega: 1.2, vRelMax: 1.5 };
    let t = 0;

    svg.appendChild(render.circle(tf, O, 3.6, { stroke: Pal.axis, width: 2, gradient: 'moment', depth: true }));
    svg.appendChild(render.circle(tf, O, 5, { pixel: true, fill: Pal.axis, stroke: Pal.axis }));
    const ptMark = render.circle(tf, O, 5, { pixel: true, fill: Pal.force, stroke: Pal.force }); svg.appendChild(ptMark);
    const vrArrow = render.arrow(tf, svg, O, O, { stroke: Pal.v, width: 2.5, class: 'sim2-vector-vrel' }); svg.appendChild(vrArrow);
    const acArrow = render.arrow(tf, svg, O, O, { stroke: Pal.coriolis, width: 2.5, class: 'sim2-vector-coriolis' }); svg.appendChild(acArrow);

    const lblVr = overlay.label('v_rel', O, { anchor: 'left', color: Pal.v, class: 'sim2-vrel-callout' });
    const lblAc = overlay.label('a_cor', O, { anchor: 'left', color: Pal.coriolis, class: 'sim2-coriolis-callout' });

    let absTrail = [];
    function reset() { shell.stop(); t = 0; absTrail = [currentPoint()]; shell.resetClock(); draw(); }
    function setArrow(ar, base, tip) {
      const b = tf.toScreen(base), tp = tf.toScreen(tip);
      ar.setAttribute('x1', b.x); ar.setAttribute('y1', b.y);
      ar.setAttribute('x2', tp.x); ar.setAttribute('y2', tp.y);
    }
    function displayVector(v, factor, maxLength) {
      const x = v.x * factor, y = v.y * factor;
      const length = Math.hypot(x, y);
      const scale = length > maxLength ? maxLength / length : 1;
      return { x: x * scale, y: y * scale };
    }
    function currentPoint() {
      const radialPhase = params.vRelMax * t / 1.5;
      const rRel = 2 + 1.5 * Math.sin(radialPhase);
      const phi = params.omega * t;
      return { x: rRel * Math.cos(phi), y: rRel * Math.sin(phi) };
    }
    function draw() {
      const radialPhase = params.vRelMax * t / 1.5;
      const rRel = 2 + 1.5 * Math.sin(radialPhase);
      const radialSpeed = params.vRelMax * Math.cos(radialPhase);
      const phi = params.omega * t;
      const p = currentPoint();
      canvas.clear();
      canvas.drawTrail(absTrail, { fade: true, stroke: 'rgba(124,58,237,0.75)', width: 1.5, minAlpha: 0.16, maxAlpha: 0.72 });
      const ur = { x: Math.cos(phi), y: Math.sin(phi) };
      const sp = tf.toScreen(p);
      ptMark.setAttribute('cx', sp.x); ptMark.setAttribute('cy', sp.y);
      // Chỉ giới hạn chiều dài hiển thị; readout và state Sim3 vẫn dùng radialSpeed/ac vật lý.
      const vrDisplay = displayVector({ x: ur.x * radialSpeed, y: ur.y * radialSpeed }, 1.6, 2.2);
      setArrow(vrArrow, p, { x: p.x + vrDisplay.x, y: p.y + vrDisplay.y });
      const vrx = ur.x * radialSpeed, vry = ur.y * radialSpeed;
      const ac = K.coriolisAccelerationVec(params.omega, vrx, vry);
      const acMag = K.coriolisAcceleration(params.omega, Math.abs(radialSpeed));
      const radialAcceleration = -params.vRelMax * params.vRelMax / 1.5 * Math.sin(radialPhase);
      const aRelative = { x: radialAcceleration * ur.x, y: radialAcceleration * ur.y };
      const aTransport = { x: -params.omega * params.omega * rRel * ur.x, y: -params.omega * params.omega * rRel * ur.y };
      const aAbsolute = { x: aRelative.x + aTransport.x + ac.ax, y: aRelative.y + aTransport.y + ac.ay };
      const vAbsolute = { x: vrx - params.omega * p.y, y: vry + params.omega * p.x };
      vrArrow.setAttribute('visibility', Math.abs(radialSpeed) > 1e-12 ? 'visible' : 'hidden');
      acArrow.setAttribute('visibility', acMag > 1e-12 ? 'visible' : 'hidden');
      const pair = (v, unit) => '(' + v.x.toFixed(3) + ', ' + v.y.toFixed(3) + ') ' + unit;
      const acDisplay = displayVector({ x: ac.ax, y: ac.ay }, 0.42, 2.3);
      setArrow(acArrow, p, { x: p.x + acDisplay.x, y: p.y + acDisplay.y });
      const acLen = Math.hypot(ac.ax, ac.ay) || 1;
      const acDir = { x: ac.ax / acLen, y: ac.ay / acLen };
      // Đẩy nhãn xa hơn theo 2 hướng vuông góc (v_rel dọc bán kính, a_cor dọc Coriolis) → không chồng khi vector ngắn.
      overlay.moveLabel(lblVr, { x: p.x + ur.x * 1.25, y: p.y + ur.y * 1.25 });
      overlay.moveLabel(lblAc, { x: p.x + acDir.x * 1.95, y: p.y + acDir.y * 1.95 });
      panel.setReadout([
        { key: 't', label: 't:', value: t.toFixed(3) + ' s' },
        { key: 'radius', label: 'r:', value: rRel.toFixed(3) + ' m' },
        { key: 'vAbs', label: 'v tuyệt đối (x,y):', value: pair(vAbsolute, 'm/s') },
        { key: 'aRel', label: 'a tương đối (x,y):', value: pair(aRelative, 'm/s²') },
        { key: 'aTransport', label: 'a kéo (x,y):', value: pair(aTransport, 'm/s²') },
        { key: 'aCorXY', label: 'a_cor (x,y):', value: pair({ x: ac.ax, y: ac.ay }, 'm/s²') },
        { key: 'aAbs', label: 'a tuyệt đối (x,y):', value: pair(aAbsolute, 'm/s²') },
        { key: 'direction', label: 'Hướng:', value: Math.abs(radialSpeed) < 1e-12 ? 'đổi chiều xuyên tâm; a_cor = 0' : (radialSpeed > 0 ? 'ra xa tâm' : 'vào tâm') + '; a_cor bên trái v_rel với ω dương' },
        { key: 'caps', label: 'Rút ngắn 2D:', value: [Math.abs(radialSpeed) * 1.6 > 2.2 ? 'v_rel' : '', acMag * 0.42 > 2.3 ? 'a_cor' : ''].filter(Boolean).join(', ') || 'không' },
        { key: 'caps3d', label: 'Rút ngắn 3D:', value: [Math.abs(radialSpeed) * 0.6 > 1.8 ? 'v_rel' : '', acMag * 0.13 > 1.8 ? 'a_cor' : ''].filter(Boolean).join(', ') || 'không' },
        { key: 'omega', label: 'ω:', value: params.omega.toFixed(2) + ' rad/s' },
        { key: 'vRelMax', label: 'v_rel,max:', value: params.vRelMax.toFixed(2) + ' m/s' },
        { key: 'vRel', label: 'v_rel(t):', value: radialSpeed.toFixed(2) + ' m/s' },
        { key: 'aCor', label: '|a_cor|:', value: acMag.toFixed(2) + ' m/s²' }
      ]);
      if (sim3) sim3.setState({
        time: t, radius: rRel, aRelative, aTransport, aAbsolute, vAbsolute,
        omega: params.omega,
        vRel: radialSpeed,
        phi,
        point: p,
        vRelVec: { x: vrx, y: vry },
        aCor: { x: ac.ax, y: ac.ay, mag: acMag }
      });
    }
    function update(dt) {
      t += dt;
      absTrail.push(currentPoint());
      if (absTrail.length > 400) absTrail.shift();
    }

    const panel = shell.setTheory({
      formulas: ['\\textcolor{#d97706}{\\vec{a}_{cor}} = 2\\,\\vec{\\omega} \\times \\textcolor{#159c3a}{\\vec{v}_{rel}}', '|a_{cor}| = 2\\omega |v_{rel}|'],
      legend: [{ color: Pal.v, label: 'v_rel' }, { color: Pal.coriolis, label: 'a Coriolis' }],
      observe: 'Chuyển động xuyên tâm bị cưỡng bức: r = 2 + 1,5 sin(v_max t/1,5) m; ω hằng, dương ngược kim đồng hồ. Đổi bất kỳ tham số nào đặt lại và tạm dừng. a_cor là thành phần gia tốc tuyệt đối; lực quán tính Coriolis trong hệ quay là −2mω×v_rel. Thang 2D: v_rel ×1,6 cap 2,2; a_cor ×0,42 cap 2,3. 3D: vị trí ×0,55; v_rel ×0,6, a_cor ×0,13, cap 1,8; ω ×0,55 cap 1,8. Không dùng chiều dài hình đã cap để tính vật lý.'
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
          onInput: v => { params.omega = v; reset(); } },
        { id: 'vRel', label: 'v_rel,max', min: 0.5, max: 3, step: 0.1, value: params.vRelMax, unit: 'm/s',
          onInput: v => { params.vRelMax = v; reset(); } }
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
