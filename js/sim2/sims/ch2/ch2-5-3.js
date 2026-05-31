/**
 * ch2-5-3 — Phân bố vận tốc điểm trên vật rắn. instantCenterVelocity (field).
 * Vật rắn quay quanh IC; canvas vẽ TRƯỜNG vận tốc (#17) — v_P = ω × r_{P/IC},
 * độ lớn tỉ lệ khoảng cách tới IC. SVG vẽ IC + 1 điểm mẫu; nhãn DOM.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, K = root.SimPhysicsKinematics;

  Reg.register('ch2-5-3', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -5, minY: -4, maxX: 5, maxY: 4 }, canvas: true
    });
    const { svg, tf, overlay, render, canvas } = shell;
    let IC = { x: -1, y: -1 };
    const omega = 1.0;

    const icMark = render.circle(tf, IC, 6, { pixel: true, fill: '#c30', stroke: '#c30' });
    svg.appendChild(icMark);
    // điểm mẫu trên vật rắn để minh hoạ v_P riêng
    const sampMark = render.circle(tf, { x: 2, y: 1.5 }, 5, { pixel: true, fill: '#27a', stroke: '#27a' });
    svg.appendChild(sampMark);
    const sampV = render.arrow(tf, svg, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: '#27a', width: 2.5 });
    svg.appendChild(sampV);

    const lblIC = overlay.label('P (IC)', IC, { anchor: 'left', color: '#c30' });
    const lblSamp = overlay.label('M', { x: 2, y: 1.5 }, { anchor: 'left', color: '#27a' });
    const card = overlay.readoutCard([]);

    const samp = { x: 2, y: 1.5 };
    function setArrow(ar, base, tip) {
      const b = tf.toScreen(base), tp = tf.toScreen(tip);
      ar.setAttribute('x1', b.x); ar.setAttribute('y1', b.y);
      ar.setAttribute('x2', tp.x); ar.setAttribute('y2', tp.y);
    }
    function drawField() {
      canvas.clear();
      const VS = 0.18;
      for (let gx = -4; gx <= 4; gx += 1) {
        for (let gy = -3; gy <= 3; gy += 1) {
          const rx = gx - IC.x, ry = gy - IC.y;
          const v = K.instantCenterVelocity(omega, rx, ry);
          canvas.segment({ x: gx, y: gy }, { x: gx + v.vx * VS, y: gy + v.vy * VS },
            { stroke: 'rgba(80,140,255,0.55)', width: 1 });
          canvas.dot({ x: gx, y: gy }, { r: 1.5, fill: 'rgba(80,140,255,0.7)' });
        }
      }
    }
    function update() {
      drawField();
      const sIC = tf.toScreen(IC);
      icMark.setAttribute('cx', sIC.x); icMark.setAttribute('cy', sIC.y);
      const rx = samp.x - IC.x, ry = samp.y - IC.y;
      const v = K.instantCenterVelocity(omega, rx, ry);
      const VS = 0.4;
      setArrow(sampV, samp, { x: samp.x + v.vx * VS, y: samp.y + v.vy * VS });
      overlay.moveLabel(lblIC, { x: IC.x + 0.3, y: IC.y - 0.3 });
      overlay.moveLabel(lblSamp, { x: samp.x + 0.3, y: samp.y });
      card.__render([
        { label: 'ω:', value: omega.toFixed(2) + ' rad/s' },
        { label: 'r(M,IC):', value: Math.hypot(rx, ry).toFixed(2) },
        { label: '|v_M|:', value: Math.hypot(v.vx, v.vy).toFixed(2) }
      ]);
    }

    const handle = shell.addHandle(IC, {
      onDrag(wp) {
        IC = { x: Math.min(4, Math.max(-4, wp.x)), y: Math.min(3, Math.max(-3, wp.y)) };
        handle.move(IC);
        update();
      }
    });
    update();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
