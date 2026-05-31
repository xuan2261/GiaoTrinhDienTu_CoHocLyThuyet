/**
 * ch2-3-2 — Truyền động bánh răng / đai / puli. gearRatio, beltVelocity, no-slip.
 * Animation 2 bánh răng ăn khớp quay ngược; tỉ số truyền i = r1/r2 = ω2/ω1 ngược.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, K = root.SimPhysicsKinematics;

  Reg.register('ch2-3-2', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -4, minY: -3, maxX: 6, maxY: 3 }
    });
    const { svg, tf, overlay, render } = shell;
    const C1 = { x: -1.6, y: 0 }, r1 = 1.4;
    const C2 = { x: 1.8, y: 0 }, r2 = 2.0;
    const omega1 = 1.0;
    const omega2 = -omega1 * r1 / r2; // ăn khớp: ngược chiều, v đai chung
    let t = 0;

    svg.appendChild(render.circle(tf, C1, r1, { stroke: '#586', width: 2, fill: 'rgba(120,170,90,0.12)' }));
    svg.appendChild(render.circle(tf, C2, r2, { stroke: '#368', width: 2, fill: 'rgba(90,140,200,0.12)' }));
    svg.appendChild(render.circle(tf, C1, 4, { pixel: true, fill: '#333', stroke: '#333' }));
    svg.appendChild(render.circle(tf, C2, 4, { pixel: true, fill: '#333', stroke: '#333' }));
    const sp1 = render.line(tf, C1, { x: C1.x + r1, y: 0 }, { stroke: '#586', width: 3 }); svg.appendChild(sp1);
    const sp2 = render.line(tf, C2, { x: C2.x + r2, y: 0 }, { stroke: '#368', width: 3 }); svg.appendChild(sp2);

    overlay.label('Z₁', { x: C1.x, y: -r1 - 0.4 }, { anchor: 'top' });
    overlay.label('Z₂', { x: C2.x, y: -r2 - 0.4 }, { anchor: 'top' });
    const card = overlay.readoutCard([]);

    function setSpoke(sp, C, r, ang) {
      const e = tf.toScreen({ x: C.x + r * Math.cos(ang), y: C.y + r * Math.sin(ang) });
      sp.setAttribute('x2', e.x); sp.setAttribute('y2', e.y);
    }
    function frame() {
      t += 1 / 60;
      const phi1 = omega1 * t, phi2 = omega2 * t;
      setSpoke(sp1, C1, r1, phi1);
      setSpoke(sp2, C2, r2, phi2);
      const vBelt = K.beltVelocity(omega1, r1);
      card.__render([
        { label: 'r₁:', value: r1.toFixed(1) },
        { label: 'r₂:', value: r2.toFixed(1) },
        { label: 'i = r₁/r₂:', value: K.gearRatio(r1, r2).toFixed(3) },
        { label: 'v đai:', value: vBelt.toFixed(2) }
      ]);
    }
    shell.onFrame(frame);
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
