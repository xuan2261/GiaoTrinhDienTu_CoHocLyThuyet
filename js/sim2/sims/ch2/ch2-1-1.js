/**
 * ch2-1-1 — Quỹ đạo chất điểm + v, a. parabolaPoint + đạo hàm số.
 * Canvas underlay vẽ VẾT quỹ đạo (#11); SVG vẽ điểm + véc tơ v, a; nhãn DOM.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, K = root.SimPhysicsKinematics;

  Reg.register('ch2-1-1', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -1, minY: -1, maxX: 22, maxY: 12 }, canvas: true
    });
    const { svg, tf, overlay, render, canvas } = shell;
    const v0 = 14, alphaDeg = 55, g = 9.81;

    // Trục
    svg.appendChild(render.line(tf, { x: -1, y: 0 }, { x: 22, y: 0 }, { stroke: '#ccc', width: 1 }));
    svg.appendChild(render.line(tf, { x: 0, y: -1 }, { x: 0, y: 12 }, { stroke: '#ccc', width: 1 }));

    const ptMark = render.circle(tf, { x: 0, y: 0 }, 5, { pixel: true, fill: '#c30', stroke: '#c30' });
    svg.appendChild(ptMark);
    const vArrow = render.arrow(tf, svg, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: '#2a7', width: 2.5 }); svg.appendChild(vArrow);
    const aArrow = render.arrow(tf, svg, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: '#57e', width: 2.5 }); svg.appendChild(aArrow);

    const lblV = overlay.label('v', { x: 0, y: 0 }, { anchor: 'left', color: '#178' });
    const lblA = overlay.label('a', { x: 0, y: 0 }, { anchor: 'left', color: '#147' });
    const card = overlay.readoutCard([]);

    const posFn = t => K.parabolaPoint(v0, alphaDeg, g, t, 0, 0);
    const tFlight = 2 * v0 * Math.sin(alphaDeg * Math.PI / 180) / g;
    const trail = [];
    let t = 0;

    function setArrow(ar, base, tip) {
      const b = tf.toScreen(base), tp = tf.toScreen(tip);
      ar.setAttribute('x1', b.x); ar.setAttribute('y1', b.y);
      ar.setAttribute('x2', tp.x); ar.setAttribute('y2', tp.y);
    }
    function frame() {
      t += 1 / 60;
      if (t > tFlight) { t = 0; trail.length = 0; }
      const p = posFn(t);
      trail.push(p);
      // Canvas: vẽ vết qua CÙNG transform
      canvas.clear();
      canvas.drawTrail(trail, { stroke: 'rgba(200,60,40,0.55)', width: 2 });
      // SVG: điểm + v + a
      const sp = tf.toScreen(p);
      ptMark.setAttribute('cx', sp.x); ptMark.setAttribute('cy', sp.y);
      const v = K.velocityFromTrajectory(posFn, t);
      const a = K.accelerationFromVelocity(tt => K.velocityFromTrajectory(posFn, tt), t);
      const VS = 0.25;
      setArrow(vArrow, p, { x: p.x + v.vx * VS, y: p.y + v.vy * VS });
      setArrow(aArrow, p, { x: p.x + a.ax * VS, y: p.y + a.ay * VS });
      overlay.moveLabel(lblV, { x: p.x + v.vx * VS + 0.4, y: p.y + v.vy * VS });
      overlay.moveLabel(lblA, { x: p.x + a.ax * VS + 0.4, y: p.y + a.ay * VS });
      card.__render([
        { label: 't:', value: t.toFixed(2) + ' s' },
        { label: '|v|:', value: Math.hypot(v.vx, v.vy).toFixed(1) + ' m/s' },
        { label: '|a|:', value: Math.hypot(a.ax, a.ay).toFixed(1) + ' m/s²' }
      ]);
    }
    shell.onFrame(frame);
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
