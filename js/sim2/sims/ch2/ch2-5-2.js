/**
 * ch2-5-2 — Tâm vận tốc tức thời (IC). locateInstantCenter + instantCenterVelocity.
 * Thanh chuyển động phẳng; kéo đầu thanh → IC dựng hình giao 2 đường pháp tuyến vận tốc.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, K = root.SimPhysicsKinematics;

  Reg.register('ch2-5-2', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -5, minY: -3, maxX: 5, maxY: 5 }
    });
    const { svg, tf, overlay, render } = shell;

    // Thanh AB, A trượt ngang (v_A theo x), B trượt đứng (v_B theo y) — cơ cấu con trượt
    let A = { x: -2, y: 0 };
    const Llen = 5;

    const bar = render.line(tf, A, A, { stroke: '#444', width: 4 }); svg.appendChild(bar);
    const vaArrow = render.arrow(tf, svg, A, A, { stroke: '#2a7', width: 2.5 }); svg.appendChild(vaArrow);
    const vbArrow = render.arrow(tf, svg, A, A, { stroke: '#2a7', width: 2.5 }); svg.appendChild(vbArrow);
    const perpA = render.line(tf, A, A, { stroke: '#e9a', width: 1, dash: '5 4' }); svg.appendChild(perpA);
    const perpB = render.line(tf, A, A, { stroke: '#e9a', width: 1, dash: '5 4' }); svg.appendChild(perpB);
    const icMark = render.circle(tf, { x: 0, y: 0 }, 5, { pixel: true, fill: '#c30', stroke: '#c30' });
    svg.appendChild(icMark);

    const lblA = overlay.label('A', A, { anchor: 'right' });
    const lblB = overlay.label('B', A, { anchor: 'left' });
    const lblIC = overlay.label('P (IC)', { x: 0, y: 0 }, { anchor: 'left', color: '#c30' });
    const card = overlay.readoutCard([]);

    function setLine(ln, a, b) {
      const pa = tf.toScreen(a), pb = tf.toScreen(b);
      ln.setAttribute('x1', pa.x); ln.setAttribute('y1', pa.y);
      ln.setAttribute('x2', pb.x); ln.setAttribute('y2', pb.y);
    }
    function update() {
      // B nằm trên thanh, A trên trục x → B = A + chiều dài theo góc; ràng buộc B.x trên trục y=... đơn giản hóa:
      // A trượt ngang (y=0), B trượt đứng (x=2). Góc thanh suy từ A.
      const Bx = 2;
      const dx = Bx - A.x;
      const dyy = Math.sqrt(Math.max(0, Llen * Llen - dx * dx));
      const B = { x: Bx, y: dyy };
      setLine(bar, A, B);
      // v_A theo +x, v_B theo +y (con trượt)
      const va = { x: A.x + 1.2, y: 0 };
      const vb = { x: B.x, y: B.y + 1.2 };
      setLine(vaArrow, A, va); setLine(vbArrow, B, vb);
      // pháp tuyến vận tốc: qua A vuông góc v_A (đường đứng qua A); qua B vuông góc v_B (đường ngang qua B)
      setLine(perpA, { x: A.x, y: -3 }, { x: A.x, y: 5 });
      setLine(perpB, { x: -5, y: B.y }, { x: 5, y: B.y });
      const ic = K.locateInstantCenter(A, B, { vx: 1, vy: 0 }, { vx: 0, vy: 1 });
      if (ic) {
        const sIC = tf.toScreen(ic);
        icMark.setAttribute('cx', sIC.x); icMark.setAttribute('cy', sIC.y);
        overlay.moveLabel(lblIC, { x: ic.x + 0.3, y: ic.y + 0.2 });
      }
      overlay.moveLabel(lblA, { x: A.x - 0.3, y: A.y - 0.3 });
      overlay.moveLabel(lblB, { x: B.x + 0.3, y: B.y });
      card.__render([
        { label: 'A:', value: `(${A.x.toFixed(1)}, 0)` },
        { label: 'B:', value: `(${B.x.toFixed(1)}, ${B.y.toFixed(1)})` },
        { label: 'IC:', value: ic ? `(${ic.x.toFixed(1)}, ${ic.y.toFixed(1)})` : '∞' }
      ]);
    }

    const handle = shell.addHandle(A, {
      onDrag(wp) {
        A = { x: Math.min(1.5, Math.max(-4.5, wp.x)), y: 0 };
        handle.move(A);
        update();
      }
    });
    update();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
