/**
 * ch2-2-2 — Quay quanh trục cố định (ω, α). angularVelocity/Displacement.
 * Slider ω₀, α (gia tốc góc) + playback (start paused). v tiếp tuyến lục.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, K = root.SimPhysicsKinematics, Pal = root.Sim2Palette;

  Reg.register('ch2-2-2', function(container) {
    const shell = Shell.createSimShell({
      // GIỮ world R=3 (dính physics vt=ωR). Thu đĩa-trên-màn bằng worldBox nới ±4.6→±5.5:
      // đĩa R=3 từ ~65% còn ~55% khung, thôi nặng mắt. Coupling vt=ω·R không đổi.
      container, worldBox: { minX: -5.5, minY: -5.5, maxX: 5.5, maxY: 5.5 }, reservePanel: true,
      meta: { name: 'Quay quanh trục cố định (ω, α)', section: '2.2', chapter: 2 }
    });
    const { svg, tf, overlay, render } = shell;
    const O = { x: 0, y: 0 }, R = 3;
    const params = { omega0: 0.5, alphaAcc: 0.15 };
    let t = 0;
    let showTangential = true, showNormal = true;

    svg.appendChild(render.circle(tf, O, R, { stroke: Pal.axis, width: 2, gradient: 'moment', depth: true }));
    svg.appendChild(render.circle(tf, O, 5, { pixel: true, fill: Pal.axis, stroke: Pal.axis }));
    const spoke = render.line(tf, O, { x: R, y: 0 }, { stroke: Pal.moment, width: 3, class: 'sim2-angle-marker' }); svg.appendChild(spoke);
    const ptMark = render.circle(tf, { x: R, y: 0 }, 5, { pixel: true, fill: Pal.moment, stroke: Pal.moment, class: 'sim2-current-marker' });
    svg.appendChild(ptMark);
    const vArrow = render.arrow(tf, svg, O, O, { stroke: Pal.v, width: 2.5 }); svg.appendChild(vArrow);

    overlay.label('O', O, { anchor: 'right' });
    const lblP = overlay.label('M', { x: R, y: 0 }, { anchor: 'left', color: Pal.moment });

    const atArrow = render.arrow(tf, svg, O, O, { stroke: Pal.a, width: 2, class: 'sim2-acceleration-tangential' });
    const anArrow = render.arrow(tf, svg, O, O, { stroke: Pal.force, width: 2, class: 'sim2-acceleration-normal' });
    svg.appendChild(atArrow); svg.appendChild(anArrow);
    overlay.label('aτ: tiếp tuyến · aₙ: hướng tâm', { x: -4.2, y: -4.15 }, { anchor: 'left' });
    function setAcceleration(arrow, base, value, enabled) {
      const length = Math.hypot(value.x, value.y), scale = length > 0 ? Math.min(0.15, 1.2 / length) : 0;
      const b = tf.toScreen(base), e = tf.toScreen({ x: base.x + value.x * scale, y: base.y + value.y * scale });
      arrow.setAttribute('x1', b.x); arrow.setAttribute('y1', b.y); arrow.setAttribute('x2', e.x); arrow.setAttribute('y2', e.y);
      arrow.setAttribute('visibility', enabled && length > 1e-12 ? 'visible' : 'hidden');
    }
    function draw() {
      const phi = K.angularDisplacement(params.omega0, params.alphaAcc, t);
      const omega = K.angularVelocity(params.omega0, params.alphaAcc, t);
      const px = R * Math.cos(phi), py = R * Math.sin(phi);
      const sO = tf.toScreen(O), sP = tf.toScreen({ x: px, y: py });
      spoke.setAttribute('x1', sO.x); spoke.setAttribute('y1', sO.y);
      spoke.setAttribute('x2', sP.x); spoke.setAttribute('y2', sP.y);
      ptMark.setAttribute('cx', sP.x); ptMark.setAttribute('cy', sP.y);
      const vt = K.tangentialVelocity(omega, R);
      const aTangential = params.alphaAcc * R, aNormal = omega * omega * R;
      const velocity = { x: -vt * Math.sin(phi), y: vt * Math.cos(phi) };
      const accelerationTangential = { x: -aTangential * Math.sin(phi), y: aTangential * Math.cos(phi) };
      const accelerationNormal = { x: -aNormal * Math.cos(phi), y: -aNormal * Math.sin(phi) };
      const displayCaps = { velocity: Math.abs(vt) * 0.2 > 1.8, tangential: Math.abs(aTangential) * 0.15 > 1.2, normal: aNormal * 0.15 > 1.2 };
      setAcceleration(atArrow, { x: px, y: py }, accelerationTangential, showTangential);
      setAcceleration(anArrow, { x: px, y: py }, accelerationNormal, showNormal);
      vArrow.setAttribute('visibility', Math.abs(vt) > 1e-12 ? 'visible' : 'hidden');
      const displayLength = Math.min(Math.abs(vt) * 0.2, 1.8);
      const direction = vt < 0 ? -1 : 1;
      const vx = -Math.sin(phi) * displayLength * direction;
      const vy = Math.cos(phi) * displayLength * direction;
      const sV = tf.toScreen({ x: px + vx, y: py + vy });
      vArrow.setAttribute('x1', sP.x); vArrow.setAttribute('y1', sP.y);
      vArrow.setAttribute('x2', sV.x); vArrow.setAttribute('y2', sV.y);
      overlay.moveLabel(lblP, { x: px + 0.3, y: py + 0.2 });
      panel.setReadout([
        { key: 't', label: 't:', value: t.toFixed(3) + ' s' },
        { key: 'radius', label: 'R vật lý:', value: R + ' m' },
        { key: 'v', label: 'vτ = ωR:', value: vt.toFixed(3) + ' m/s' },
        { key: 'aTangential', label: 'aτ = αR:', value: aTangential.toFixed(3) + ' m/s²' },
        { key: 'aNormal', label: 'aₙ = ω²R:', value: aNormal.toFixed(3) + ' m/s²' },
        { key: 'acceleration', label: '|a|:', value: Math.hypot(aTangential, aNormal).toFixed(3) + ' m/s²' },
        { key: 'direction', label: 'Chiều:', value: omega === 0 ? 'đang đứng yên' : 'ngược chiều kim đồng hồ (+)' },
        { key: 'components', label: 'Thành phần hiện:', value: (showTangential ? 'aτ ' : '') + (showNormal ? 'aₙ' : '') || 'ẩn cả hai' },
        { key: 'cap', label: 'Đã rút ngắn (2D):', value: Object.keys(displayCaps).filter(k => displayCaps[k]).join(', ') || 'không' },
        { key: 'cap3d', label: 'Đã rút ngắn (3D):', value: [Math.abs(omega) * 0.6 > 1.6 ? 'ω' : '', Math.abs(vt) * 0.46 > 1.05 ? 'v' : '', Math.abs(aTangential) * 0.15 > 1.2 ? 'aτ' : '', aNormal * 0.15 > 1.2 ? 'aₙ' : ''].filter(Boolean).join(', ') || 'không' },
        { key: 'omega0', label: 'ω₀:', value: params.omega0.toFixed(2) + ' rad/s' },
        { key: 'alpha', label: 'α (gia tốc góc):', value: params.alphaAcc.toFixed(2) + ' rad/s²' },
        { key: 'omega', label: 'ω(t):', value: omega.toFixed(2) + ' rad/s' },
        { key: 'phi', label: 'φ(t):', value: phi.toFixed(2) + ' rad' }
      ]);
      if (sim3) sim3.setState({ time: t, phi, omega, omega0: params.omega0, alphaAcc: params.alphaAcc, radius: R, speed: vt, velocity, aTangential, aNormal, accelerationTangential, accelerationNormal, displayCaps, showTangential, showNormal });
    }
    function update(dt) { t += dt; }
    function reset() { shell.stop(); t = 0; shell.resetClock(); draw(); }

    const panel = shell.setTheory({
      formulas: ['\\textcolor{#7c3aed}{\\omega}(t) = \\omega_0 + \\alpha t', '\\varphi(t) = \\omega_0 t + \\tfrac{1}{2}\\alpha t^2'],
      legend: [{ color: Pal.moment, label: 'điểm M / φ' }, { color: Pal.v, label: 'v tiếp tuyến' }, { color: Pal.a, label: 'aτ tiếp tuyến' }, { color: Pal.force, label: 'aₙ hướng tâm' }],
      observe: 'R = 3 m; chiều dương ngược kim đồng hồ. Đổi tham số đặt lại và tạm dừng. Quay đều α = 0 vẫn có aₙ khi ω ≠ 0. Thang 2D: v ×0,2 cap 1,8; gia tốc ×0,15 cap 1,2. Thang 3D: R hình 1,22, ω ×0,6 cap 1,6; v ×0,46 cap 1,05; gia tốc ×0,15 cap 1,2. Caps chỉ rút ngắn hình, không đổi số đọc.'
    });
    const sim3 = root.Sim3Mode && root.Sim3Ch222 ? root.Sim3Mode.attach({
      container,
      shell2dRoot: shell.root,
      create3d: ctx => root.Sim3Ch222.create({ host: ctx.host, referenceEl: shell.root, onFallback: ctx.onFallback })
    }) : null;
    if (sim3) shell.addCleanup(() => sim3.dispose());

    shell.addControls({
      sliders: [
        { id: 'omega0', label: 'ω₀', min: 0, max: 2, step: 0.1, value: params.omega0, unit: 'rad/s',
          onInput: v => { params.omega0 = v; reset(); } },
        { id: 'alphaAcc', label: 'α', min: 0, max: 0.5, step: 0.05, value: params.alphaAcc, unit: 'rad/s²',
          onInput: v => { params.alphaAcc = v; reset(); } }
      ],
      actions: [
        { id: 'toggle-tangential', label: 'Ẩn/hiện aτ', onClick: () => { showTangential = !showTangential; draw(); } },
        { id: 'toggle-normal', label: 'Ẩn/hiện aₙ', onClick: () => { showNormal = !showNormal; draw(); } }
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
