/**
 * ch3-5-4 — Định lý động năng (công–năng). W = ΔT = ½m(v₂²-v₁²). workDone/kineticEnergy.
 * Kéo lực F (quãng đường cố định) → công W và độ biến thiên động năng ΔT khớp nhau.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, D = root.SimPhysicsDynamics;

  Reg.register('ch3-5-4', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -1, minY: -3, maxX: 11, maxY: 4 }
    });
    const { svg, tf, overlay, render } = shell;
    const m = 2, dDist = 6, v1 = 1; let F = 4;

    svg.appendChild(render.line(tf, { x: -1, y: 0 }, { x: 11, y: 0 }, { stroke: '#ccc', width: 1 }));
    // vạch điểm đầu/cuối quãng đường
    svg.appendChild(render.line(tf, { x: 1, y: -0.3 }, { x: 1, y: 1.5 }, { stroke: '#bbb', width: 1, dash: '3 3' }));
    svg.appendChild(render.line(tf, { x: 1 + dDist, y: -0.3 }, { x: 1 + dDist, y: 1.5 }, { stroke: '#bbb', width: 1, dash: '3 3' }));
    const box = render.poly(tf,
      [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 1, y: 1 }],
      { closed: true, fill: 'rgba(90,140,200,0.4)', stroke: '#368' });
    svg.appendChild(box);
    const fArrow = render.arrow(tf, svg, { x: 2, y: 0.5 }, { x: 2, y: 0.5 }, { stroke: '#e63', width: 3 });
    svg.appendChild(fArrow);

    overlay.label('d', { x: 1 + dDist / 2, y: 1.7 }, { color: '#666' });
    const lblF = overlay.label('F', { x: 2, y: 0.5 }, { anchor: 'left', color: '#c30' });
    const card = overlay.readoutCard([]);

    function update() {
      const W = D.workDone(F, dDist, 0);
      // W = ΔT → v₂ = √(v₁² + 2W/m)
      const v2 = Math.sqrt(v1 * v1 + 2 * W / m);
      const dT = D.kineticEnergy(m, v2) - D.kineticEnergy(m, v1);
      const VIS = 0.15;
      const fb = tf.toScreen({ x: 2, y: 0.5 }), ft = tf.toScreen({ x: 2 + F * VIS, y: 0.5 });
      fArrow.setAttribute('x1', fb.x); fArrow.setAttribute('y1', fb.y);
      fArrow.setAttribute('x2', ft.x); fArrow.setAttribute('y2', ft.y);
      overlay.moveLabel(lblF, { x: 2 + F * VIS + 0.3, y: 0.7 });
      card.__render([
        { label: 'F:', value: F.toFixed(1) + ' N' },
        { label: 'd:', value: dDist + ' m' },
        { label: 'W = F·d:', value: W.toFixed(1) + ' J' },
        { label: 'ΔT:', value: dT.toFixed(1) + ' J' }
      ]);
    }

    const handle = shell.addHandle({ x: 2 + F * 0.15, y: 0.5 }, {
      onDrag(wp) {
        F = Math.min(15, Math.max(1, (wp.x - 2) / 0.15));
        handle.move({ x: 2 + F * 0.15, y: 0.5 });
        update();
      }
    });
    update();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
