/**
 * ch2-3-2 — Truyền động bánh răng / đai / puli. gearRatio, beltVelocity, no-slip.
 * Slider r₁, r₂ + playback (start paused). Bánh răng ngoài quay ngược;
 * bộ đai-puli hở quay cùng chiều, cùng vận tốc tiếp tuyến v.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, K = root.SimPhysicsKinematics, Pal = root.Sim2Palette;

  Reg.register('ch2-3-2', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -5.8, minY: -5.8, maxX: 9.2, maxY: 5.8 }, reservePanel: true,
      meta: { name: 'Truyền động bánh răng–đai–puli', section: '3.2', chapter: 2 }
    });
    const { svg, tf, overlay, render } = shell;
    const omega1 = 1.0;
    const params = { r1: 1.4, r2: 2.0 };
    let t = 0;

    const G1 = { x: -2.6, y: 2.7 };
    const P1 = { x: -2.6, y: -2.7 };
    const P2 = { x: 4.9, y: -2.7 };
    function G2() { return { x: G1.x + params.r1 + params.r2, y: G1.y }; }

    const gear1 = render.circle(tf, G1, params.r1, { stroke: Pal.v, width: 2, gradient: 'v', depth: true, class: 'sim2-transmission-gear' }); svg.appendChild(gear1);
    const gear2 = render.circle(tf, G2(), params.r2, { stroke: Pal.a, width: 2, gradient: 'a', depth: true, class: 'sim2-transmission-gear' }); svg.appendChild(gear2);
    svg.appendChild(render.circle(tf, G1, 4, { pixel: true, fill: Pal.axis, stroke: Pal.axis }));
    const gearHub2 = render.circle(tf, G2(), 4, { pixel: true, fill: Pal.axis, stroke: Pal.axis }); svg.appendChild(gearHub2);
    const gearSp1 = render.line(tf, G1, { x: G1.x + params.r1, y: G1.y }, { stroke: Pal.v, width: 3 }); svg.appendChild(gearSp1);
    const gearSp2 = render.line(tf, G2(), { x: G2().x + params.r2, y: G2().y }, { stroke: Pal.a, width: 3 }); svg.appendChild(gearSp2);

    const beltTop = render.line(tf, P1, P2, { stroke: Pal.resultant, width: 5, class: 'sim2-transmission-belt' }); svg.appendChild(beltTop);
    const beltBottom = render.line(tf, P1, P2, { stroke: Pal.resultant, width: 5, class: 'sim2-transmission-belt' }); svg.appendChild(beltBottom);
    beltTop.setAttribute('stroke-linecap', 'round');
    beltBottom.setAttribute('stroke-linecap', 'round');
    const pulley1 = render.circle(tf, P1, params.r1, { stroke: Pal.v, width: 2, gradient: 'v', depth: true, class: 'sim2-transmission-pulley' }); svg.appendChild(pulley1);
    const pulley2 = render.circle(tf, P2, params.r2, { stroke: Pal.a, width: 2, gradient: 'a', depth: true, class: 'sim2-transmission-pulley' }); svg.appendChild(pulley2);
    svg.appendChild(render.circle(tf, P1, 4, { pixel: true, fill: Pal.axis, stroke: Pal.axis }));
    svg.appendChild(render.circle(tf, P2, 4, { pixel: true, fill: Pal.axis, stroke: Pal.axis }));
    const pulleySp1 = render.line(tf, P1, { x: P1.x + params.r1, y: P1.y }, { stroke: Pal.v, width: 3 }); svg.appendChild(pulleySp1);
    const pulleySp2 = render.line(tf, P2, { x: P2.x + params.r2, y: P2.y }, { stroke: Pal.a, width: 3 }); svg.appendChild(pulleySp2);

    const beltMarker = render.circle(tf, P1, 4, { pixel: true, fill: Pal.force, stroke: Pal.force, class: 'sim2-belt-marker' }); svg.appendChild(beltMarker);
    const beltDirection = render.arrow(tf, svg, P1, P2, { stroke: Pal.force, width: 2, class: 'sim2-belt-direction' }); svg.appendChild(beltDirection);
    const lblZ1 = overlay.label('r₁ · dẫn', { x: G1.x, y: G1.y + params.r1 + 0.25 }, { anchor: 'bottom', color: Pal.v });
    const lblZ2 = overlay.label('r₂ · bị dẫn', { x: G2().x, y: G2().y + params.r2 + 0.25 }, { anchor: 'bottom', color: Pal.a });
    const lblBelt = overlay.label('đai', { x: (P1.x + P2.x) / 2, y: P1.y + Math.max(params.r1, params.r2) + 0.28 }, { anchor: 'bottom', color: Pal.resultant });
    const lblPulley = overlay.label('puli', { x: P2.x + params.r2 + 0.28, y: P2.y }, { anchor: 'left', color: Pal.a });

    function setSpoke(sp, C, r, ang) {
      const b = tf.toScreen(C);
      const e = tf.toScreen({ x: C.x + r * Math.cos(ang), y: C.y + r * Math.sin(ang) });
      sp.setAttribute('x1', b.x); sp.setAttribute('y1', b.y);
      sp.setAttribute('x2', e.x); sp.setAttribute('y2', e.y);
    }
    function draw() {
      const transferRatio = K.gearRatio(params.r1, params.r2);
      const gearOmega2 = -omega1 * transferRatio;
      const beltOmega2 = omega1 * transferRatio;
      const g2 = G2();
      // cập nhật hình học khi đổi bán kính
      gear1.setAttribute('r', params.r1 * tf.scale);
      gear2.setAttribute('r', params.r2 * tf.scale);
      pulley1.setAttribute('r', params.r1 * tf.scale);
      pulley2.setAttribute('r', params.r2 * tf.scale);
      const sg2 = tf.toScreen(g2);
      gear2.setAttribute('cx', sg2.x); gear2.setAttribute('cy', sg2.y);
      gearHub2.setAttribute('cx', sg2.x); gearHub2.setAttribute('cy', sg2.y);

      const centerDistance = P2.x - P1.x;
      const normalX = (params.r1 - params.r2) / centerDistance;
      const normalY = Math.sqrt(Math.max(0, 1 - normalX * normalX));
      const tangentPoint = (center, radius, side) => ({
        x: center.x + radius * normalX,
        y: center.y + radius * normalY * side
      });
      const beltA = tangentPoint(P1, params.r1, 1);
      const beltB = tangentPoint(P2, params.r2, 1);
      const beltC = tangentPoint(P1, params.r1, -1);
      const beltD = tangentPoint(P2, params.r2, -1);
      const sA = tf.toScreen(beltA), sB = tf.toScreen(beltB), sC = tf.toScreen(beltC), sD = tf.toScreen(beltD);
      beltTop.setAttribute('x1', sA.x); beltTop.setAttribute('y1', sA.y);
      beltTop.setAttribute('x2', sB.x); beltTop.setAttribute('y2', sB.y);
      beltBottom.setAttribute('x1', sC.x); beltBottom.setAttribute('y1', sC.y);
      beltBottom.setAttribute('x2', sD.x); beltBottom.setAttribute('y2', sD.y);

      // Follow the exact open-belt path by physical arc length (positive CCW driving wheel).
      const angle = Math.acos(normalX), span = Math.hypot(beltD.x - beltC.x, beltD.y - beltC.y);
      const leftArc = params.r1 * (2 * Math.PI - 2 * angle), rightArc = params.r2 * 2 * angle;
      const length = leftArc + rightArc + 2 * span;
      let distance = ((omega1 * params.r1 * t) % length + length) % length, markerPoint;
      if (distance < leftArc) { const q = angle + distance / params.r1; markerPoint = { x: P1.x + params.r1 * Math.cos(q), y: P1.y + params.r1 * Math.sin(q) }; }
      else if ((distance -= leftArc) < span) { const f = distance / span; markerPoint = { x: beltC.x + f * (beltD.x - beltC.x), y: beltC.y + f * (beltD.y - beltC.y) }; }
      else if ((distance -= span) < rightArc) { const q = -angle + distance / params.r2; markerPoint = { x: P2.x + params.r2 * Math.cos(q), y: P2.y + params.r2 * Math.sin(q) }; }
      else { distance -= rightArc; const f = distance / span; markerPoint = { x: beltB.x + f * (beltA.x - beltB.x), y: beltB.y + f * (beltA.y - beltB.y) }; }
      const mp = tf.toScreen(markerPoint); beltMarker.setAttribute('cx', mp.x); beltMarker.setAttribute('cy', mp.y);
      const mid = { x: (beltA.x + beltB.x) / 2, y: (beltA.y + beltB.y) / 2 };
      const directionBase = tf.toScreen({ x: mid.x + normalY * 0.5, y: mid.y - normalX * 0.5 });
      const directionTip = tf.toScreen({ x: mid.x - normalY * 0.5, y: mid.y + normalX * 0.5 });
      beltDirection.setAttribute('x1', directionBase.x); beltDirection.setAttribute('y1', directionBase.y); beltDirection.setAttribute('x2', directionTip.x); beltDirection.setAttribute('y2', directionTip.y);
      const phi1 = omega1 * t, gearPhi2 = gearOmega2 * t, beltPhi2 = beltOmega2 * t;
      setSpoke(gearSp1, G1, params.r1, phi1);
      setSpoke(gearSp2, g2, params.r2, gearPhi2);
      setSpoke(pulleySp1, P1, params.r1, phi1);
      setSpoke(pulleySp2, P2, params.r2, beltPhi2);
      overlay.moveLabel(lblZ2, { x: g2.x, y: g2.y + params.r2 + 0.25 });
      overlay.moveLabel(lblZ1, { x: G1.x, y: G1.y + params.r1 + 0.25 });
      overlay.moveLabel(lblBelt, { x: (P1.x + P2.x) / 2, y: P1.y + Math.max(params.r1, params.r2) + 0.28 });
      overlay.moveLabel(lblPulley, { x: P2.x + params.r2 + 0.28, y: P2.y });
      panel.setReadout([
        { key: 'r1', label: 'r₁:', value: params.r1.toFixed(1) + ' m' },
        { key: 'r2', label: 'r₂:', value: params.r2.toFixed(1) + ' m' },
        { key: 'omega1', label: 'ω₁ dẫn:', value: omega1.toFixed(2) + ' rad/s' },
        { key: 'gearRatio12', label: 'i₁₂ bánh răng = ω₁/ω₂:', value: (-1 / transferRatio).toFixed(3) },
        { key: 'gearRatio21', label: 'k₂₁ bánh răng = ω₂/ω₁:', value: (-transferRatio).toFixed(3) },
        { key: 'beltRatio12', label: 'i₁₂ đai = ω₁/ω₂:', value: (1 / transferRatio).toFixed(3) },
        { key: 'beltRatio21', label: 'k₂₁ đai = ω₂/ω₁:', value: transferRatio.toFixed(3) },
        { key: 'drivenSpeed', label: '|ω₂|r₂ = ω₁r₁:', value: (Math.abs(beltOmega2) * params.r2).toFixed(3) + ' m/s' },
        { key: 'gearOmega', label: 'ω₂ bánh răng:', value: gearOmega2.toFixed(2) + ' rad/s' },
        { key: 'beltOmega', label: 'ω₂ đai-puli:', value: beltOmega2.toFixed(2) + ' rad/s' },
        { key: 'beltV', label: 'v đai:', value: K.beltVelocity(omega1, params.r1).toFixed(2) + ' m/s' }
      ]);
      if (sim3) sim3.setState({
        time: t, r1: params.r1, r2: params.r2, omega1, gearOmega2, beltOmega2, gearRatio12: -1 / transferRatio, beltRatio12: 1 / transferRatio, beltSpeed: omega1 * params.r1, beltMarker: markerPoint,
        gearPhi1: phi1, gearPhi2, beltPhi2
      });
    }
    function update(dt) { t += dt; }
    function reset() { shell.stop(); t = 0; shell.resetClock(); draw(); }

    const panel = shell.setTheory({
      formulas: ['\\omega_{2,\\,gear} = -\\omega_1\\dfrac{r_1}{r_2}', '\\omega_{2,\\,belt} = \\omega_1\\dfrac{r_1}{r_2}', 'v = \\omega_1 r_1 = \\omega_2 r_2'],
      legend: [
        { color: Pal.v, label: 'bánh răng 1' },
        { color: Pal.a, label: 'bánh răng 2' },
        { color: Pal.resultant, label: 'đai' },
        { color: Pal.axis, label: 'puli' }
      ],
      observe: 'Không trượt; chiều dương ngược kim đồng hồ. Bánh răng ngoài ngược chiều; đai hở cùng chiều. r là bán kính vòng chia (m), không phải số răng Z; răng 3D chỉ minh họa, tỷ số tính theo bán kính. Chấm đỏ chạy theo chiều dài đường đai, mũi tên đỏ chỉ chiều. Đổi bán kính đặt lại và tạm dừng.'
    });
    const sim3 = root.Sim3Mode && root.Sim3Ch232 ? root.Sim3Mode.attach({
      container,
      shell2dRoot: shell.root,
      create3d: ctx => root.Sim3Ch232.create({ host: ctx.host, referenceEl: shell.root, onFallback: ctx.onFallback })
    }) : null;
    if (sim3) shell.addCleanup(() => sim3.dispose());

    shell.addControls({
      sliders: [
        { id: 'r1', label: 'r₁', min: 0.8, max: 2.5, step: 0.1, value: params.r1, unit: 'm',
          onInput: v => { params.r1 = v; reset(); } },
        { id: 'r2', label: 'r₂', min: 0.8, max: 2.5, step: 0.1, value: params.r2, unit: 'm',
          onInput: v => { params.r2 = v; reset(); } }
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
