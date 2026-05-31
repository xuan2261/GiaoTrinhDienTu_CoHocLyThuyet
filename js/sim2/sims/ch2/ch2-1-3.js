/**
 * ch2-1-3 — Tiếp tuyến / pháp tuyến + bán kính cong. R = |v|³/|v×a| (radiusOfCurvature).
 * Kéo điểm trên quỹ đạo ellipse → v, a, R + vòng tròn mật tiếp cập nhật realtime.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, K = root.SimPhysicsKinematics;

  Reg.register('ch2-1-3', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -5, minY: -4, maxX: 5, maxY: 4 }
    });
    const { svg, tf, overlay, render } = shell;
    const a = 4, b = 2.5; // ellipse bán trục
    let tParam = 0.7;

    // Vẽ ellipse quỹ đạo (path)
    const pts = [];
    for (let t = 0; t <= Math.PI * 2 + 0.05; t += 0.05) pts.push(K.ellipsePoint(a, b, t, 0, 0));
    svg.appendChild(render.path(tf, pts, { stroke: '#bbb', width: 1.5 }));

    const tanLine = render.arrow(tf, svg, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: '#2a7', width: 2.5 });
    const norLine = render.arrow(tf, svg, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: '#57e', width: 2.5 });
    const oscCircle = render.circle(tf, { x: 0, y: 0 }, 1, { stroke: '#e9a', width: 1.5, dash: '5 4' });
    svg.appendChild(oscCircle); svg.appendChild(tanLine); svg.appendChild(norLine);
    const ptMark = render.circle(tf, { x: 0, y: 0 }, 4, { pixel: true, fill: '#c30', stroke: '#c30' });
    svg.appendChild(ptMark);

    const lblT = overlay.label('τ', { x: 0, y: 0 }, { anchor: 'left', color: '#178' });
    const lblN = overlay.label('n', { x: 0, y: 0 }, { anchor: 'left', color: '#147' });
    const card = overlay.readoutCard([]);

    function setArrow(ar, base, tip) {
      const bs = tf.toScreen(base), ts = tf.toScreen(tip);
      ar.setAttribute('x1', bs.x); ar.setAttribute('y1', bs.y);
      ar.setAttribute('x2', ts.x); ar.setAttribute('y2', ts.y);
    }
    function update() {
      const posFn = t => K.ellipsePoint(a, b, t, 0, 0);
      const p = posFn(tParam);
      const v = K.velocityFromTrajectory(posFn, tParam);
      const acc = K.accelerationFromVelocity(tt => K.velocityFromTrajectory(posFn, tt), tParam);
      const speed = Math.hypot(v.vx, v.vy);
      const R = K.radiusOfCurvature(v.vx, v.vy, acc.ax, acc.ay);
      const ux = v.vx / speed, uy = v.vy / speed;        // tiếp tuyến đơn vị
      const nx = -uy, ny = ux;                            // pháp tuyến đơn vị
      setArrow(tanLine, p, { x: p.x + ux * 1.5, y: p.y + uy * 1.5 });
      setArrow(norLine, p, { x: p.x + nx * 1.5, y: p.y + ny * 1.5 });
      // Tâm vòng mật tiếp = p + R·n (chọn hướng vào trong)
      const cx = p.x + nx * R, cy = p.y + ny * R;
      const oc = tf.toScreen({ x: cx, y: cy });
      const rr = Math.min(R, 12) * tf.scale;
      oscCircle.setAttribute('cx', oc.x); oscCircle.setAttribute('cy', oc.y); oscCircle.setAttribute('r', rr);
      const pm = tf.toScreen(p);
      ptMark.setAttribute('cx', pm.x); ptMark.setAttribute('cy', pm.y);
      overlay.moveLabel(lblT, { x: p.x + ux * 1.7, y: p.y + uy * 1.7 });
      overlay.moveLabel(lblN, { x: p.x + nx * 1.7, y: p.y + ny * 1.7 });
      card.__render([
        { label: '|v|:', value: speed.toFixed(2) },
        { label: '|a|:', value: Math.hypot(acc.ax, acc.ay).toFixed(2) },
        { label: 'R cong:', value: (isFinite(R) ? R.toFixed(2) : '∞') }
      ]);
    }

    const handle = shell.addHandle(K.ellipsePoint(a, b, tParam, 0, 0), {
      onDrag(wp) {
        tParam = Math.atan2(wp.y / b, wp.x / a);
        handle.move(K.ellipsePoint(a, b, tParam, 0, 0));
        update();
      }
    });
    update();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
