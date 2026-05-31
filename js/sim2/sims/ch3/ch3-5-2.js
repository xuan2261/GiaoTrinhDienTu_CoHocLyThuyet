/**
 * ch3-5-2 — Định lý động lượng & xung lượng. J = Δp = F·t.
 * Kéo lực F hoặc thời gian t → xung lượng J và độ biến thiên động lượng Δp cập nhật.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, D = root.SimPhysicsDynamics;

  Reg.register('ch3-5-2', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -1, minY: -3, maxX: 11, maxY: 4 }
    });
    const { svg, tf, overlay, render } = shell;
    const m = 2; let F = 6, tDur = 2; let v1 = 1;

    svg.appendChild(render.line(tf, { x: -1, y: 0 }, { x: 11, y: 0 }, { stroke: '#ccc', width: 1 }));
    const box = render.poly(tf,
      [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 1, y: 1 }],
      { closed: true, fill: 'rgba(90,140,200,0.4)', stroke: '#368' });
    svg.appendChild(box);
    const fArrow = render.arrow(tf, svg, { x: 2, y: 0.5 }, { x: 2, y: 0.5 }, { stroke: '#e63', width: 3 });
    svg.appendChild(fArrow);
    // graph p(t): trục
    const gx0 = 0, gy0 = -2, gw = 9, gh = 1.5;
    svg.appendChild(render.line(tf, { x: gx0, y: gy0 }, { x: gx0 + gw, y: gy0 }, { stroke: '#aaa', width: 1 }));
    const pLine = render.el('polyline', { points: '', fill: 'none', stroke: '#2a7', 'stroke-width': 2, class: 'sim2-graph' });
    svg.appendChild(pLine);

    overlay.label('p(t)', { x: gx0 + gw, y: gy0 }, { anchor: 'left', color: '#178' });
    const lblF = overlay.label('F', { x: 2, y: 0.5 }, { anchor: 'left', color: '#c30' });
    const card = overlay.readoutCard([]);

    function update() {
      const a = D.accelerationFromForce(F, m);
      const v2 = v1 + a * tDur;
      const J = F * tDur, dp = m * v2 - m * v1;
      const VIS = 0.12;
      const ft = tf.toScreen({ x: 2 + F * VIS, y: 0.5 }), fb = tf.toScreen({ x: 2, y: 0.5 });
      fArrow.setAttribute('x1', fb.x); fArrow.setAttribute('y1', fb.y);
      fArrow.setAttribute('x2', ft.x); fArrow.setAttribute('y2', ft.y);
      overlay.moveLabel(lblF, { x: 2 + F * VIS + 0.3, y: 0.7 });
      // p(t) = m(v1 + a t) tuyến tính
      const pts = [];
      const pMax = m * (v1 + a * tDur);
      for (let i = 0; i <= 20; i++) {
        const tt = tDur * i / 20, pp = m * (v1 + a * tt);
        const gx = gx0 + (tt / tDur) * gw, gy = gy0 + (pp / (pMax || 1)) * gh;
        const s = tf.toScreen({ x: gx, y: gy }); pts.push(`${s.x},${s.y}`);
      }
      pLine.setAttribute('points', pts.join(' '));
      card.__render([
        { label: 'F:', value: F.toFixed(0) + ' N' },
        { label: 't:', value: tDur.toFixed(1) + ' s' },
        { label: 'J = F·t:', value: J.toFixed(1) + ' N·s' },
        { label: 'Δp:', value: dp.toFixed(1) + ' kg·m/s' }
      ]);
    }

    const hF = shell.addHandle({ x: 2 + F * 0.12, y: 0.5 }, {
      onDrag(wp) { F = Math.min(20, Math.max(2, (wp.x - 2) / 0.12)); hF.move({ x: 2 + F * 0.12, y: 0.5 }); update(); }
    });
    update();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
