/**
 * ch3-5-3 — Bảo toàn mô men động lượng. L = I·ω giữ nguyên khi không mô men ngoài.
 * Kéo bán kính r (co/giãn) → I đổi → ω đổi sao cho L = I·ω = const (momentOfInertia).
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, D = root.SimPhysicsDynamics;

  Reg.register('ch3-5-3', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -4, minY: -4, maxX: 4, maxY: 4 }
    });
    const { svg, tf, overlay, render } = shell;
    const O = { x: 0, y: 0 }, mPoint = 2;
    const r0 = 3, omega0 = 1;
    const L = D.angularMomentum(D.momentOfInertia(mPoint, r0), omega0); // bảo toàn
    let r = r0, t = 0, phi = 0;

    svg.appendChild(render.circle(tf, O, 5, { pixel: true, fill: '#333', stroke: '#333' }));
    const arm1 = render.line(tf, O, { x: r, y: 0 }, { stroke: '#586', width: 3 }); svg.appendChild(arm1);
    const arm2 = render.line(tf, O, { x: -r, y: 0 }, { stroke: '#586', width: 3 }); svg.appendChild(arm2);
    const m1 = render.circle(tf, { x: r, y: 0 }, 7, { pixel: true, fill: '#c30', stroke: '#c30' }); svg.appendChild(m1);
    const m2 = render.circle(tf, { x: -r, y: 0 }, 7, { pixel: true, fill: '#c30', stroke: '#c30' }); svg.appendChild(m2);

    overlay.label('O', O, { anchor: 'right' });
    const card = overlay.readoutCard([]);

    function frame() {
      const I = D.momentOfInertia(mPoint, r) * 2; // 2 khối
      const omega = L * 2 / I; // L tổng = 2·m·r²·ω... giữ L=const
      phi += omega * (1 / 60);
      const p1 = { x: r * Math.cos(phi), y: r * Math.sin(phi) };
      const p2 = { x: -r * Math.cos(phi), y: -r * Math.sin(phi) };
      const sO = tf.toScreen(O), s1 = tf.toScreen(p1), s2 = tf.toScreen(p2);
      arm1.setAttribute('x2', s1.x); arm1.setAttribute('y2', s1.y);
      arm2.setAttribute('x2', s2.x); arm2.setAttribute('y2', s2.y);
      m1.setAttribute('cx', s1.x); m1.setAttribute('cy', s1.y);
      m2.setAttribute('cx', s2.x); m2.setAttribute('cy', s2.y);
      card.__render([
        { label: 'r:', value: r.toFixed(2) + ' m' },
        { label: 'I:', value: I.toFixed(2) + ' kg·m²' },
        { label: 'ω:', value: omega.toFixed(2) + ' rad/s' },
        { label: 'L = I·ω:', value: (I * omega).toFixed(2) + ' (const)' }
      ]);
    }

    // Handle co/giãn bán kính (kéo khối m1 vào/ra)
    const handle = shell.addHandle({ x: r, y: 0 }, {
      onDrag(wp) {
        r = Math.min(3.5, Math.max(0.8, Math.hypot(wp.x, wp.y)));
        handle.move({ x: r * Math.cos(phi), y: r * Math.sin(phi) });
      }
    });
    shell.onFrame(frame);
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
