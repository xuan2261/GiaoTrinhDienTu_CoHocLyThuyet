/**
 * ch2-2-2 — Quay quanh trục cố định (ω, α). angularVelocity/Displacement.
 * Animation tự quay; slider góc α cố định. Né gotcha tên readout 'alpha' trùng input.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, K = root.SimPhysicsKinematics;

  Reg.register('ch2-2-2', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -4, minY: -4, maxX: 4, maxY: 4 }
    });
    const { svg, tf, overlay, render } = shell;
    const O = { x: 0, y: 0 }, R = 3;
    const omega0 = 0.5, alphaAcc = 0.15; // ω0 rad/s, α rad/s² (gia tốc góc)
    let t = 0;

    // Đĩa + trục
    svg.appendChild(render.circle(tf, O, R, { stroke: '#888', width: 2, fill: 'rgba(120,160,220,0.12)' }));
    svg.appendChild(render.circle(tf, O, 5, { pixel: true, fill: '#333', stroke: '#333' }));
    const spoke = render.line(tf, O, { x: R, y: 0 }, { stroke: '#c30', width: 3 }); svg.appendChild(spoke);
    const ptMark = render.circle(tf, { x: R, y: 0 }, 5, { pixel: true, fill: '#c30', stroke: '#c30' });
    svg.appendChild(ptMark);
    const vArrow = render.arrow(tf, svg, O, O, { stroke: '#2a7', width: 2.5 }); svg.appendChild(vArrow);

    overlay.label('O', O, { anchor: 'right' });
    const lblP = overlay.label('M', { x: R, y: 0 }, { anchor: 'left', color: '#c30' });
    const card = overlay.readoutCard([]);

    function frame() {
      t += 1 / 60;
      const phi = K.angularDisplacement(omega0, alphaAcc, t);
      const omega = K.angularVelocity(omega0, alphaAcc, t);
      const px = R * Math.cos(phi), py = R * Math.sin(phi);
      const sO = tf.toScreen(O), sP = tf.toScreen({ x: px, y: py });
      spoke.setAttribute('x2', sP.x); spoke.setAttribute('y2', sP.y);
      ptMark.setAttribute('cx', sP.x); ptMark.setAttribute('cy', sP.y);
      // v tiếp tuyến: vuông góc bán kính, độ lớn ω·R
      const vt = K.tangentialVelocity(omega, R);
      const vx = -Math.sin(phi) * vt * 0.15, vy = Math.cos(phi) * vt * 0.15;
      const sV = tf.toScreen({ x: px + vx, y: py + vy });
      vArrow.setAttribute('x1', sP.x); vArrow.setAttribute('y1', sP.y);
      vArrow.setAttribute('x2', sV.x); vArrow.setAttribute('y2', sV.y);
      overlay.moveLabel(lblP, { x: px + 0.3, y: py + 0.2 });
      card.__render([
        { label: 'ω₀:', value: omega0.toFixed(2) + ' rad/s' },
        { label: 'gia tốc góc:', value: alphaAcc.toFixed(2) + ' rad/s²' },
        { label: 'ω(t):', value: omega.toFixed(2) + ' rad/s' },
        { label: 'φ(t):', value: phi.toFixed(2) + ' rad' }
      ]);
    }
    shell.onFrame(frame);
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
