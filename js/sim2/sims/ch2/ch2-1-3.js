/**
 * ch2-1-3 — Tiếp tuyến / pháp tuyến + bán kính cong. R = |v|³/|v×a| (radiusOfCurvature).
 * Pha θ=(1 rad/s)t; kéo/nhập pha → khung đơn vị τ,n và R + vòng mật tiếp.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, K = root.SimPhysicsKinematics, Pal = root.Sim2Palette;

  Reg.register('ch2-1-3', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -5, minY: -4, maxX: 5, maxY: 4 }, reservePanel: true,
      meta: { name: 'Tiếp/pháp tuyến + bán kính cong', section: '1.3', chapter: 2 }
    });
    const { svg, tf, overlay, render } = shell;
    const a = 4, b = 2.5;
    let tParam = 0.7;
    let displayScale = 1;
    let lastPathScale = null;
    let sim3 = null;
    let controls = null;
    let lockScale = false;

    const pts = [];
    for (let t = 0; t <= Math.PI * 2 + 0.05; t += 0.05) pts.push(K.ellipsePoint(a, b, t, 0, 0));
    const ellipsePath = render.path(tf, pts, { stroke: Pal.grid, width: 1.5 });
    svg.appendChild(ellipsePath);

    const tanLine = render.arrow(tf, svg, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: Pal.v, width: 2.5 });
    const norLine = render.arrow(tf, svg, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: Pal.a, width: 2.5 });
    const oscCircle = render.circle(tf, { x: 0, y: 0 }, 1, { stroke: Pal.moment, width: 1.5, dash: '5 4' });
    svg.appendChild(oscCircle); svg.appendChild(tanLine); svg.appendChild(norLine);
    const ptMark = render.circle(tf, { x: 0, y: 0 }, 4, { pixel: true, fill: Pal.force, stroke: Pal.force, class: 'sim2-current-marker' });
    svg.appendChild(ptMark);

    const lblT = overlay.label('τ', { x: 0, y: 0 }, { anchor: 'left', color: Pal.v });
    const lblN = overlay.label('n', { x: 0, y: 0 }, { anchor: 'left', color: Pal.a });

    function setArrow(ar, base, tip) {
      const bs = tf.toScreen(base), ts = tf.toScreen(tip);
      ar.setAttribute('x1', bs.x); ar.setAttribute('y1', bs.y);
      ar.setAttribute('x2', ts.x); ar.setAttribute('y2', ts.y);
    }
    function render2() {
      const posFn = t => K.ellipsePoint(a, b, t, 0, 0);
      const p = posFn(tParam);
      // Convention: phase θ = (1 rad/s)t, a/b in metres; these are physical derivatives.
      const v = { vx: -a * Math.sin(tParam), vy: b * Math.cos(tParam) };
      const acc = { ax: -a * Math.cos(tParam), ay: -b * Math.sin(tParam) };
      const speed = Math.hypot(v.vx, v.vy);
      const R = K.radiusOfCurvature(v.vx, v.vy, acc.ax, acc.ay);
      const ux = v.vx / speed, uy = v.vy / speed;
      const nx = -uy, ny = ux;
      const cx = p.x + nx * R, cy = p.y + ny * R;
      const maxAbsX = Math.max(a, Math.abs(cx - R), Math.abs(cx + R));
      const maxAbsY = Math.max(b, Math.abs(cy - R), Math.abs(cy + R));
      // Conservative fixed scale contains the entire family of osculating circles.
      displayScale = lockScale ? 0.3 : Math.min(1, 4.6 / maxAbsX, 3.6 / maxAbsY);
      const aTangential = acc.ax * ux + acc.ay * uy, aNormal = acc.ax * nx + acc.ay * ny;
      const scalePoint = point => ({ x: point.x * displayScale, y: point.y * displayScale });
      const displayP = scalePoint(p);
      setArrow(tanLine, displayP, scalePoint({ x: p.x + ux * 1.5, y: p.y + uy * 1.5 }));
      setArrow(norLine, displayP, scalePoint({ x: p.x + nx * 1.5, y: p.y + ny * 1.5 }));
      const displayCenter = scalePoint({ x: cx, y: cy });
      const oc = tf.toScreen(displayCenter);
      oscCircle.setAttribute('cx', oc.x); oscCircle.setAttribute('cy', oc.y); oscCircle.setAttribute('r', R * displayScale * tf.scale);
      const pm = tf.toScreen(displayP);
      ptMark.setAttribute('cx', pm.x); ptMark.setAttribute('cy', pm.y);
      if (lastPathScale !== displayScale) {
        lastPathScale = displayScale;
        ellipsePath.setAttribute('d', pts.map((point, index) => {
        const screen = tf.toScreen(scalePoint(point));
        return `${index ? 'L' : 'M'}${screen.x},${screen.y}`;
        }).join(' '));
      }
      overlay.moveLabel(lblT, scalePoint({ x: p.x + ux * 1.7, y: p.y + uy * 1.7 }));
      overlay.moveLabel(lblN, scalePoint({ x: p.x + nx * 1.7, y: p.y + ny * 1.7 }));
      handle.move(displayP);
      panel.setReadout([
        { key: 'phase', label: 'Pha θ:', value: (tParam * 180 / Math.PI).toFixed(2) + '°' },
        { key: 't', label: 't quy ước:', value: tParam.toFixed(3) + ' s' },
        { key: 'point', label: 'M (x,y):', value: '(' + p.x.toFixed(3) + ', ' + p.y.toFixed(3) + ') m' },
        { key: 'v', label: '|v| = vτ:', value: speed.toFixed(3) + ' m/s' },
        { key: 'aTangential', label: 'aτ:', value: aTangential.toFixed(3) + ' m/s²' },
        { key: 'aNormal', label: 'aₙ:', value: aNormal.toFixed(3) + ' m/s²' },
        { key: 'curvature', label: 'κ = 1/R:', value: (1 / R).toFixed(4) + ' m⁻¹' },
        { key: 'scale', label: 'Thang hình 2D:', value: displayScale.toFixed(3) + ' đơn vị hình/m · ' + (lockScale ? 'cố định' : 'tự vừa cảnh') },
        { key: 'a', label: '|a|:', value: Math.hypot(acc.ax, acc.ay).toFixed(3) + ' m/s²' },
        { key: 'R', label: 'R cong:', value: (isFinite(R) ? R.toFixed(4) + ' m' : '∞') }
      ]);
      if (sim3) sim3.setState({
        tParam, time: tParam, phaseDeg: tParam * 180 / Math.PI, speed, aTangential, aNormal, velocity: v, acceleration: acc, lockScale,
        point: p,
        tangent: { x: ux, y: uy },
        normal: { x: nx, y: ny },
        radius: R,
        center: { x: cx, y: cy }
      });
    }

    const panel = shell.setTheory({
      formulas: ['R = \\dfrac{|\\vec{v}|^3}{|\\vec{v} \\times \\vec{a}|}'],
      legend: [{ color: Pal.v, label: 'τ (tiếp tuyến)' }, { color: Pal.a, label: 'n (pháp tuyến)' }, { color: Pal.moment, label: 'vòng mật tiếp' }],
      observe: 'Elip a = 4 m, b = 2,5 m; θ = (1 rad/s)t là thời gian quy ước, không phải chuyển động đều theo cung. τ và n là vectơ đơn vị không đơn vị; n là pháp tuyến chính, khác hướng tổng a khi aτ ≠ 0. Pha dùng được trong cả 2D/3D; nút thang cố định chỉ khóa hình 2D.'
    });

    sim3 = root.Sim3Mode && root.Sim3Ch213 ? root.Sim3Mode.attach({
      container,
      shell2dRoot: shell.root,
      create3d: ctx => root.Sim3Ch213.create({ host: ctx.host, referenceEl: shell.root, onFallback: ctx.onFallback })
    }) : null;
    if (sim3) shell.addCleanup(() => sim3.dispose());

    controls = shell.addControls({ sliders: [{ id: 'phase', label: 'Pha θ', min: 0, max: 360, step: 0.1, value: tParam * 180 / Math.PI, unit: '°', onInput: deg => { tParam = deg * Math.PI / 180; render2(); } }], actions: [
      { id: 'reset-phase', label: 'Đặt lại pha', onClick: () => { tParam = 0.7; controls.setValue('phase', tParam * 180 / Math.PI); render2(); } },
      { id: 'toggle-scale', label: 'Đổi thang cố định/tự vừa (2D)', onClick: () => { lockScale = !lockScale; render2(); } }
    ] });
    const handle = shell.addHandle(K.ellipsePoint(a, b, tParam, 0, 0), {
      fill: Pal.handle,
      a11y: { label: 'Điểm chuyển động trên elip', axis: 'both', min: 0, max: 360, valueText: () => 'Pha ' + (tParam * 180 / Math.PI).toFixed(2) + ' độ', valueFromPoint: wp => (Math.atan2(wp.y / displayScale / b, wp.x / displayScale / a) * 180 / Math.PI + 360) % 360 },
      keyboardStep: { x: 0.1, y: 0.1 },
      onDrag(wp) {
        const physicalPoint = { x: wp.x / displayScale, y: wp.y / displayScale };
        tParam = (Math.atan2(physicalPoint.y / b, physicalPoint.x / a) + Math.PI * 2) % (Math.PI * 2);
        controls.setValue('phase', tParam * 180 / Math.PI);
        render2();
      }
    });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
