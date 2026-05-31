/**
 * ch3-2-3 — Định luật III: lực & phản lực. Cặp lực đối nhau cùng độ lớn, ngược chiều.
 * Kéo độ lớn lực tương tác → cặp F_AB / F_BA cập nhật, luôn đối nhau (inertialForce).
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, D = root.SimPhysicsDynamics;

  Reg.register('ch3-2-3', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -5, minY: -3, maxX: 5, maxY: 3 }
    });
    const { svg, tf, overlay, render } = shell;
    const A = { x: -1.5, y: 0 }, B = { x: 1.5, y: 0 };
    let Fmag = 60; const VIS = 0.03;

    // 2 vật A, B
    function blockPts(c) {
      return [{ x: c.x - 0.6, y: -0.6 }, { x: c.x + 0.6, y: -0.6 },
              { x: c.x + 0.6, y: 0.6 }, { x: c.x - 0.6, y: 0.6 }];
    }
    svg.appendChild(render.poly(tf, blockPts(A), { closed: true, fill: 'rgba(90,140,200,0.4)', stroke: '#368' }));
    svg.appendChild(render.poly(tf, blockPts(B), { closed: true, fill: 'rgba(200,120,90,0.4)', stroke: '#863' }));

    // F_AB tác dụng lên B (hướng phải), F_BA tác dụng lên A (hướng trái)
    const fAB = render.arrow(tf, svg, B, B, { stroke: '#e63', width: 3 }); svg.appendChild(fAB);
    const fBA = render.arrow(tf, svg, A, A, { stroke: '#2a7', width: 3 }); svg.appendChild(fBA);

    overlay.label('A', { x: A.x, y: -0.9 }, { anchor: 'top' });
    overlay.label('B', { x: B.x, y: -0.9 }, { anchor: 'top' });
    const lblAB = overlay.label('F_AB', B, { anchor: 'left', color: '#c30' });
    const lblBA = overlay.label('F_BA', A, { anchor: 'right', color: '#178' });
    const card = overlay.readoutCard([]);

    function set(ar, base, tip) {
      const b = tf.toScreen(base), t = tf.toScreen(tip);
      ar.setAttribute('x1', b.x); ar.setAttribute('y1', b.y);
      ar.setAttribute('x2', t.x); ar.setAttribute('y2', t.y);
    }
    function update() {
      const react = D.inertialForce(1, Fmag, 0); // -F, minh hoạ cặp đối
      const tipAB = { x: B.x + Fmag * VIS, y: 0 };
      const tipBA = { x: A.x - Fmag * VIS, y: 0 };
      set(fAB, B, tipAB); set(fBA, A, tipBA);
      overlay.moveLabel(lblAB, { x: tipAB.x + 0.3, y: 0.4 });
      overlay.moveLabel(lblBA, { x: tipBA.x - 0.3, y: 0.4 });
      card.__render([
        { label: 'F_AB:', value: '+' + Fmag.toFixed(0) + ' N' },
        { label: 'F_BA:', value: react.fx.toFixed(0) + ' N' },
        { label: '|F_AB|=|F_BA|:', value: Fmag.toFixed(0) + ' N' },
        { label: 'ΣF cặp:', value: '0' }
      ]);
    }

    const handle = shell.addHandle({ x: B.x + Fmag * VIS, y: 0 }, {
      onDrag(wp) {
        Fmag = Math.min(80, Math.max(20, (wp.x - B.x) / VIS));
        handle.move({ x: B.x + Fmag * VIS, y: 0 });
        update();
      }
    });
    update();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
