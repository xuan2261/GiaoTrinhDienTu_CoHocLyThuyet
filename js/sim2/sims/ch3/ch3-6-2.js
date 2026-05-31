/**
 * ch3-6-2 — Va chạm với hệ số phục hồi e. resolveCollision2D (port, e đúng chuẩn).
 * 2 vật va chạm trực diện; canvas vẽ VẾT (#25). Slider e đổi → bảo toàn p, mất động năng đúng phần.
 * Nhãn khối m₁/m₂ 1 nguồn (né đúp nhãn).
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, D = root.SimPhysicsDynamics;

  Reg.register('ch3-6-2', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -6, minY: -3, maxX: 6, maxY: 3 }, canvas: true
    });
    const { svg, tf, overlay, render, canvas } = shell;
    const m1 = 2, m2 = 3, e = 0.7, R1 = 0.6, R2 = 0.8;

    svg.appendChild(render.line(tf, { x: -6, y: -1 }, { x: 6, y: -1 }, { stroke: '#ccc', width: 1 }));
    const b1 = render.circle(tf, { x: 0, y: 0 }, R1, { fill: 'rgba(200,60,40,0.5)', stroke: '#c30', width: 2 }); svg.appendChild(b1);
    const b2 = render.circle(tf, { x: 0, y: 0 }, R2, { fill: 'rgba(40,90,200,0.5)', stroke: '#27a', width: 2 }); svg.appendChild(b2);

    // Nhãn 1 nguồn cho mỗi khối (né đúp)
    const lblM1 = overlay.label('m₁', { x: 0, y: 0 }, { anchor: 'center', color: '#c30' });
    const lblM2 = overlay.label('m₂', { x: 0, y: 0 }, { anchor: 'center', color: '#27a' });
    const card = overlay.readoutCard([]);

    let p1 = { x: -4, y: 0 }, p2 = { x: 3, y: 0 };
    let v1 = { x: 2.2, y: 0 }, v2 = { x: -1.0, y: 0 };
    const trail1 = [], trail2 = [];
    let collided = false;

    function reset() {
      p1 = { x: -4, y: 0 }; p2 = { x: 3, y: 0 };
      v1 = { x: 2.2, y: 0 }; v2 = { x: -1.0, y: 0 };
      trail1.length = 0; trail2.length = 0; collided = false;
    }
    function frame() {
      const dt = 1 / 60;
      p1 = { x: p1.x + v1.x * dt, y: p1.y + v1.y * dt };
      p2 = { x: p2.x + v2.x * dt, y: p2.y + v2.y * dt };
      // va chạm khi chạm nhau
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      if (dist <= R1 + R2 && !collided) {
        const res = D.resolveCollision2D(m1, m2, p1, p2, v1, v2, e);
        v1 = res.v1; v2 = res.v2; collided = true;
      }
      if (p1.x > 6 || p2.x < -6) reset();
      trail1.push({ ...p1 }); trail2.push({ ...p2 });
      if (trail1.length > 300) { trail1.shift(); trail2.shift(); }
      canvas.clear();
      canvas.drawTrail(trail1, { stroke: 'rgba(200,60,40,0.45)', width: 1.5 });
      canvas.drawTrail(trail2, { stroke: 'rgba(40,90,200,0.45)', width: 1.5 });
      const s1 = tf.toScreen(p1), s2 = tf.toScreen(p2);
      b1.setAttribute('cx', s1.x); b1.setAttribute('cy', s1.y);
      b2.setAttribute('cx', s2.x); b2.setAttribute('cy', s2.y);
      overlay.moveLabel(lblM1, p1);
      overlay.moveLabel(lblM2, p2);
      const pTot = D.momentum2d([{ m: m1, vx: v1.x, vy: v1.y }, { m: m2, vx: v2.x, vy: v2.y }]);
      const T = D.kineticEnergy(m1, Math.hypot(v1.x, v1.y)) + D.kineticEnergy(m2, Math.hypot(v2.x, v2.y));
      card.__render([
        { label: 'e:', value: e.toFixed(2) },
        { label: 'm₁,m₂:', value: `${m1}, ${m2} kg` },
        { label: 'p tổng:', value: pTot.x.toFixed(2) + ' kg·m/s' },
        { label: 'T tổng:', value: T.toFixed(2) + ' J' }
      ]);
    }
    shell.onFrame(frame);
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
