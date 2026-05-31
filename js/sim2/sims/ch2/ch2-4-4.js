/**
 * ch2-4-4 — Hợp chuyển động & Coriolis. coriolisAcceleration + coriolisAccelerationVec.
 * Đĩa quay (HQC động); điểm chạy theo bán kính (v_rel). Canvas vẽ ĐƯỜNG tương đối (#15);
 * SVG vẽ a_cor vuông góc v_rel; nhãn DOM.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, K = root.SimPhysicsKinematics;

  Reg.register('ch2-4-4', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -5, minY: -5, maxX: 5, maxY: 5 }, canvas: true
    });
    const { svg, tf, overlay, render, canvas } = shell;
    const O = { x: 0, y: 0 };
    const omega = 1.2;       // ω đĩa (rad/s) quanh O
    const vRel = 1.5;        // tốc độ tương đối dọc bán kính (m/s)
    let t = 0;

    svg.appendChild(render.circle(tf, O, 4, { stroke: '#888', width: 2, fill: 'rgba(120,160,220,0.08)' }));
    svg.appendChild(render.circle(tf, O, 5, { pixel: true, fill: '#333', stroke: '#333' }));
    const ptMark = render.circle(tf, O, 5, { pixel: true, fill: '#c30', stroke: '#c30' }); svg.appendChild(ptMark);
    const vrArrow = render.arrow(tf, svg, O, O, { stroke: '#2a7', width: 2.5 }); svg.appendChild(vrArrow);
    const acArrow = render.arrow(tf, svg, O, O, { stroke: '#e63', width: 2.5 }); svg.appendChild(acArrow);

    const lblVr = overlay.label('v_rel', O, { anchor: 'left', color: '#178' });
    const lblAc = overlay.label('a_cor', O, { anchor: 'left', color: '#c30' });
    const card = overlay.readoutCard([]);

    const absTrail = [];
    function setArrow(ar, base, tip) {
      const b = tf.toScreen(base), tp = tf.toScreen(tip);
      ar.setAttribute('x1', b.x); ar.setAttribute('y1', b.y);
      ar.setAttribute('x2', tp.x); ar.setAttribute('y2', tp.y);
    }
    function frame() {
      t += 1 / 60;
      // bán kính tương đối dao động 0.5..3.5
      const rRel = 2 + 1.5 * Math.sin(vRel * t * 0.5);
      const phi = omega * t;                    // góc quay đĩa
      // vị trí tuyệt đối: điểm trên bán kính quay
      const p = { x: rRel * Math.cos(phi), y: rRel * Math.sin(phi) };
      absTrail.push(p);
      if (absTrail.length > 400) absTrail.shift();
      // Canvas: đường tuyệt đối (hợp chuyển động)
      canvas.clear();
      canvas.drawTrail(absTrail, { stroke: 'rgba(80,140,255,0.5)', width: 1.5 });
      // v_rel hướng dọc bán kính
      const ur = { x: Math.cos(phi), y: Math.sin(phi) };
      const sp = tf.toScreen(p);
      ptMark.setAttribute('cx', sp.x); ptMark.setAttribute('cy', sp.y);
      setArrow(vrArrow, p, { x: p.x + ur.x * vRel, y: p.y + ur.y * vRel });
      // a_cor = 2ω×v_rel vuông góc v_rel
      const vrx = ur.x * vRel, vry = ur.y * vRel;
      const ac = K.coriolisAccelerationVec(omega, vrx, vry);
      const acMag = K.coriolisAcceleration(omega, vRel);
      const VS = 0.3;
      setArrow(acArrow, p, { x: p.x + ac.ax * VS, y: p.y + ac.ay * VS });
      overlay.moveLabel(lblVr, { x: p.x + ur.x * vRel + 0.3, y: p.y + ur.y * vRel });
      overlay.moveLabel(lblAc, { x: p.x + ac.ax * VS + 0.3, y: p.y + ac.ay * VS });
      card.__render([
        { label: 'ω:', value: omega.toFixed(2) + ' rad/s' },
        { label: 'v_rel:', value: vRel.toFixed(2) + ' m/s' },
        { label: '|a_cor|:', value: acMag.toFixed(2) + ' m/s²' }
      ]);
    }
    shell.onFrame(frame);
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
