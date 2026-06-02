/**
 * ch2-5-2 — Tâm vận tốc tức thời (IC). locateInstantCenter + instantCenterVelocity.
 * Bespoke (hình-học): kéo đầu thanh → IC dựng hình giao 2 đường pháp tuyến vận tốc.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, K = root.SimPhysicsKinematics, Pal = root.Sim2Palette;

  Reg.register('ch2-5-2', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -5, minY: -3, maxX: 5, maxY: 5 }, reservePanel: true,
      meta: { name: 'Tâm vận tốc tức thời (IC)', section: '5.2', chapter: 2 }
    });
    const { svg, tf, overlay, render } = shell;

    let A = { x: -2, y: 0 };
    const Llen = 5;
    const Bx = 2;
    const minAx = Bx - Llen;
    const maxAx = 1.5;

    const bar = render.line(tf, A, A, { stroke: Pal.axis, width: 4 }); svg.appendChild(bar);
    const vaArrow = render.arrow(tf, svg, A, A, { stroke: Pal.v, width: 2.5 }); svg.appendChild(vaArrow);
    const vbArrow = render.arrow(tf, svg, A, A, { stroke: Pal.v, width: 2.5 }); svg.appendChild(vbArrow);
    const perpA = render.line(tf, A, A, { stroke: Pal.moment, width: 1, dash: '5 4', class: 'sim2-guide-line sim2-ic-radius-guide' }); svg.appendChild(perpA);
    const perpB = render.line(tf, A, A, { stroke: Pal.moment, width: 1, dash: '5 4', class: 'sim2-guide-line sim2-ic-radius-guide' }); svg.appendChild(perpB);
    const icMark = render.circle(tf, { x: 0, y: 0 }, 5, { pixel: true, fill: Pal.force, stroke: Pal.force, class: 'sim2-current-marker' });
    svg.appendChild(icMark);

    const lblA = overlay.label('A', A, { anchor: 'right' });
    const lblB = overlay.label('B', A, { anchor: 'left' });
    const lblIC = overlay.label('P (IC)', { x: 0, y: 0 }, { anchor: 'left', color: Pal.force });

    function setLine(ln, a, b) {
      const pa = tf.toScreen(a), pb = tf.toScreen(b);
      ln.setAttribute('x1', pa.x); ln.setAttribute('y1', pa.y);
      ln.setAttribute('x2', pb.x); ln.setAttribute('y2', pb.y);
    }
    function render2() {
      const dx = Bx - A.x;
      const dyy = Math.sqrt(Math.max(0, Llen * Llen - dx * dx));
      const B = { x: Bx, y: dyy };
      setLine(bar, A, B);
      const va = { x: A.x + 1.2, y: 0 };
      const vb = { x: B.x, y: B.y + 1.2 };
      setLine(vaArrow, A, va); setLine(vbArrow, B, vb);
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
      handle.move(A);
      panel.setReadout([
        { key: 'A', label: 'A:', value: `(${A.x.toFixed(1)}, 0)` },
        { key: 'B', label: 'B:', value: `(${B.x.toFixed(1)}, ${B.y.toFixed(1)})` },
        { key: 'IC', label: 'IC:', value: ic ? `(${ic.x.toFixed(1)}, ${ic.y.toFixed(1)})` : '∞' }
      ]);
    }

    const panel = shell.setTheory({
      formulas: ['v_P = 0 \\text{ (tâm tức thời)}', '\\vec{v}_M = \\vec{\\omega} \\times \\vec{r}_{M/P}'],
      legend: [{ color: Pal.v, label: 'v_A, v_B' }, { color: Pal.moment, label: 'pháp tuyến v' }, { color: Pal.force, label: 'P (IC)' }],
      observe: 'Kéo đầu A; IC là giao 2 đường vuông góc với vận tốc tại A và B.'
    });

    const handle = shell.addHandle(A, {
      fill: Pal.handle,
      onDrag(wp) {
        A = { x: Math.min(maxAx, Math.max(minAx, wp.x)), y: 0 };
        render2();
      }
    });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
