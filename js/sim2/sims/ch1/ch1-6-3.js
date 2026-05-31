/**
 * ch1-6-3 — Trọng tâm hình ghép / khoét. centroidComposite + centroidWithHole.
 * Bespoke (hình-học): kéo vị trí lỗ khoét → trọng tâm C dịch chuyển realtime.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, P = root.SimPhysicsStatics, Pal = root.Sim2Palette;

  Reg.register('ch1-6-3', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -1, minY: -1, maxX: 7, maxY: 5 }, reservePanel: true
    });
    const { svg, tf, overlay, render } = shell;

    const plate = { area: 6 * 4, cx: 3, cy: 2 };
    let hole = { cx: 4.5, cy: 2.5, r: 1 };

    svg.appendChild(render.poly(tf,
      [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 6, y: 4 }, { x: 0, y: 4 }],
      { closed: true, fill: 'rgba(100,116,139,0.3)', stroke: Pal.axis }));
    const holeCircle = render.circle(tf, { x: hole.cx, y: hole.cy }, hole.r, { fill: '#fff', stroke: Pal.reaction, width: 2 });
    svg.appendChild(holeCircle);
    const cMark = render.circle(tf, { x: plate.cx, y: plate.cy }, 5, { pixel: true, fill: Pal.resultant, stroke: Pal.resultant });
    svg.appendChild(cMark);

    const lblC = overlay.label('C', { x: plate.cx, y: plate.cy }, { anchor: 'left', color: Pal.resultant });
    const lblHole = overlay.label('lỗ', { x: hole.cx, y: hole.cy }, { color: Pal.reaction });

    function render2() {
      const holeArea = Math.PI * hole.r * hole.r;
      const c = P.centroidWithHole(plate, { area: holeArea, cx: hole.cx, cy: hole.cy });
      const hc = tf.toScreen({ x: hole.cx, y: hole.cy });
      holeCircle.setAttribute('cx', hc.x); holeCircle.setAttribute('cy', hc.y);
      const cs = tf.toScreen({ x: c.cx, y: c.cy });
      cMark.setAttribute('cx', cs.x); cMark.setAttribute('cy', cs.y);
      overlay.moveLabel(lblC, { x: c.cx + 0.3, y: c.cy + 0.3 });
      overlay.moveLabel(lblHole, { x: hole.cx, y: hole.cy });
      handle.move({ x: hole.cx, y: hole.cy });
      panel.setReadout([
        { label: 'A tấm:', value: plate.area.toFixed(1) },
        { label: 'A lỗ:', value: holeArea.toFixed(2) },
        { label: 'Cx:', value: c.cx.toFixed(2) },
        { label: 'Cy:', value: c.cy.toFixed(2) }
      ]);
    }

    const panel = shell.setTheory({
      formulas: ['\\textcolor{#e06a00}{x_C} = \\dfrac{A x_1 - A_0 x_0}{A - A_0}'],
      legend: [{ color: Pal.resultant, label: 'C (trọng tâm)' }, { color: Pal.reaction, label: 'lỗ khoét' }],
      observe: 'Kéo lỗ khoét; trọng tâm C dịch ra xa lỗ (phần khoét trừ khỏi diện tích).'
    });

    const handle = shell.addHandle({ x: hole.cx, y: hole.cy }, {
      fill: Pal.handle,
      onDrag(wp) {
        hole.cx = Math.min(6 - hole.r, Math.max(hole.r, wp.x));
        hole.cy = Math.min(4 - hole.r, Math.max(hole.r, wp.y));
        render2();
      }
    });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
