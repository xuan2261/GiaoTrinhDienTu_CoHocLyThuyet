/**
 * ch2-1-3 — Tiếp tuyến / pháp tuyến + bán kính cong. R = |v|³/|v×a| (radiusOfCurvature).
 * Bespoke (hình-học): kéo điểm trên ellipse → v (lục), a (lam), R + vòng mật tiếp cập nhật.
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
    let sim3 = null;

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
      const v = K.velocityFromTrajectory(posFn, tParam);
      const acc = K.accelerationFromVelocity(tt => K.velocityFromTrajectory(posFn, tt), tParam);
      const speed = Math.hypot(v.vx, v.vy);
      const R = K.radiusOfCurvature(v.vx, v.vy, acc.ax, acc.ay);
      const ux = v.vx / speed, uy = v.vy / speed;
      const nx = -uy, ny = ux;
      const cx = p.x + nx * R, cy = p.y + ny * R;
      const maxAbsX = Math.max(a, Math.abs(cx - R), Math.abs(cx + R));
      const maxAbsY = Math.max(b, Math.abs(cy - R), Math.abs(cy + R));
      displayScale = Math.min(1, 4.6 / maxAbsX, 3.6 / maxAbsY);
      const scalePoint = point => ({ x: point.x * displayScale, y: point.y * displayScale });
      const displayP = scalePoint(p);
      setArrow(tanLine, displayP, scalePoint({ x: p.x + ux * 1.5, y: p.y + uy * 1.5 }));
      setArrow(norLine, displayP, scalePoint({ x: p.x + nx * 1.5, y: p.y + ny * 1.5 }));
      const displayCenter = scalePoint({ x: cx, y: cy });
      const oc = tf.toScreen(displayCenter);
      oscCircle.setAttribute('cx', oc.x); oscCircle.setAttribute('cy', oc.y); oscCircle.setAttribute('r', R * displayScale * tf.scale);
      const pm = tf.toScreen(displayP);
      ptMark.setAttribute('cx', pm.x); ptMark.setAttribute('cy', pm.y);
      ellipsePath.setAttribute('d', pts.map((point, index) => {
        const screen = tf.toScreen(scalePoint(point));
        return `${index ? 'L' : 'M'}${screen.x},${screen.y}`;
      }).join(' '));
      overlay.moveLabel(lblT, scalePoint({ x: p.x + ux * 1.7, y: p.y + uy * 1.7 }));
      overlay.moveLabel(lblN, scalePoint({ x: p.x + nx * 1.7, y: p.y + ny * 1.7 }));
      handle.move(displayP);
      panel.setReadout([
        { key: 'v', label: '|v|:', value: speed.toFixed(2) },
        { key: 'a', label: '|a|:', value: Math.hypot(acc.ax, acc.ay).toFixed(2) },
        { key: 'R', label: 'R cong:', value: (isFinite(R) ? R.toFixed(2) : '∞') }
      ]);
      if (sim3) sim3.setState({
        tParam,
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
      observe: 'Kéo điểm dọc ellipse; R giữ giá trị vật lý, toàn bộ ellipse và vòng mật tiếp tự thu tỉ lệ để luôn nhìn trọn.'
    });

    sim3 = root.Sim3Mode && root.Sim3Ch213 ? root.Sim3Mode.attach({
      container,
      shell2dRoot: shell.root,
      create3d: ctx => root.Sim3Ch213.create({ host: ctx.host, referenceEl: shell.root, onFallback: ctx.onFallback })
    }) : null;
    if (sim3) shell.addCleanup(() => sim3.dispose());

    const handle = shell.addHandle(K.ellipsePoint(a, b, tParam, 0, 0), {
      fill: Pal.handle,
      a11y: { label: 'Điểm chuyển động trên elip', axis: 'both', min: 0, max: 360, valueFromPoint: wp => (Math.atan2(wp.y / displayScale / b, wp.x / displayScale / a) * 180 / Math.PI + 360) % 360 },
      keyboardStep: { x: 0.1, y: 0.1 },
      onDrag(wp) {
        const physicalPoint = { x: wp.x / displayScale, y: wp.y / displayScale };
        tParam = Math.atan2(physicalPoint.y / b, physicalPoint.x / a);
        render2();
      }
    });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
