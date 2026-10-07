/**
 * ch1-6-3 — Trọng tâm hình ghép / khoét. centroidComposite + centroidWithHole.
 * Bespoke (hình-học): kéo vị trí lỗ khoét → trọng tâm C dịch chuyển realtime.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, P = root.SimPhysicsStatics, Pal = root.Sim2Palette;

  Reg.register('ch1-6-3', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -0.8, minY: -0.8, maxX: 6.8, maxY: 4.8 }, reservePanel: true,
      meta: { name: 'Trọng tâm hình ghép / khoét', section: '6.3', chapter: 1 }
    });
    const { svg, tf, overlay, render } = shell;

    const plate = { area: 6 * 4, cx: 3, cy: 2 };
    let hole = { cx: 4.5, cy: 2.5, r: 1 };

    svg.appendChild(render.poly(tf,
      [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 6, y: 4 }, { x: 0, y: 4 }],
      { closed: true, gradient: 'axis', depth: true, stroke: Pal.axis }));
    const holeCircle = render.circle(tf, { x: hole.cx, y: hole.cy }, hole.r, { fill: '#fff', stroke: Pal.reaction, width: 2, class: 'sim2-negative-area-guide' });
    svg.appendChild(holeCircle);
    const cMark = render.circle(tf, { x: plate.cx, y: plate.cy }, 5, { pixel: true, fill: Pal.resultant, stroke: Pal.resultant });
    svg.appendChild(cMark);
    const cxGuide = render.line(tf, { x: 0, y: 0 }, { x: 0, y: 4 }, { stroke: Pal.resultant, width: 1, dash: '4 3', class: 'sim2-guide-line sim2-centroid-guide' });
    const cyGuide = render.line(tf, { x: 0, y: 0 }, { x: 6, y: 0 }, { stroke: Pal.resultant, width: 1, dash: '4 3', class: 'sim2-guide-line sim2-centroid-guide' });
    svg.appendChild(cxGuide); svg.appendChild(cyGuide);

    svg.appendChild(render.line(tf, { x: 0, y: 0 }, { x: 6.4, y: 0 }, { stroke: Pal.axis, width: 1 }));
    svg.appendChild(render.line(tf, { x: 0, y: 0 }, { x: 0, y: 4.4 }, { stroke: Pal.axis, width: 1 }));
    overlay.label('O', { x: -0.2, y: -0.2 });
    overlay.label('x (m)', { x: 6.1, y: -0.35 });
    overlay.label('y (m)', { x: -0.25, y: 4.4 });
    overlay.label('6 m', { x: 3, y: -0.4 });
    overlay.label('4 m', { x: -0.45, y: 2 });
    const lblC = overlay.label('C', { x: plate.cx, y: plate.cy }, { anchor: 'left', color: Pal.resultant });
    const lblHole = overlay.label('lỗ', { x: hole.cx, y: hole.cy }, { color: Pal.reaction });

    function render2() {
      const holeArea = Math.PI * hole.r * hole.r;
      const c = P.centroidWithHole(plate, { area: holeArea, cx: hole.cx, cy: hole.cy });
      const hc = tf.toScreen({ x: hole.cx, y: hole.cy });
      holeCircle.setAttribute('cx', hc.x); holeCircle.setAttribute('cy', hc.y);
      const cs = tf.toScreen({ x: c.cx, y: c.cy });
      cMark.setAttribute('cx', cs.x); cMark.setAttribute('cy', cs.y);
      const gx1 = tf.toScreen({ x: c.cx, y: 0 }), gx2 = tf.toScreen({ x: c.cx, y: 4 });
      const gy1 = tf.toScreen({ x: 0, y: c.cy }), gy2 = tf.toScreen({ x: 6, y: c.cy });
      cxGuide.setAttribute('x1', gx1.x); cxGuide.setAttribute('y1', gx1.y);
      cxGuide.setAttribute('x2', gx2.x); cxGuide.setAttribute('y2', gx2.y);
      cyGuide.setAttribute('x1', gy1.x); cyGuide.setAttribute('y1', gy1.y);
      cyGuide.setAttribute('x2', gy2.x); cyGuide.setAttribute('y2', gy2.y);
      overlay.moveLabel(lblC, { x: c.cx + 0.3, y: c.cy + 0.3 });
      overlay.moveLabel(lblHole, { x: hole.cx, y: hole.cy });
      handle.move({ x: hole.cx, y: hole.cy });
      holeX.setValue(hole.cx); holeY.setValue(hole.cy);
      panel.setReadout([
        { key: 'plateArea', label: 'A tấm:', value: plate.area.toFixed(1) + ' m²' },
        { key: 'holeArea', label: '-A lỗ:', value: '-' + holeArea.toFixed(2) + ' m²' },
        { key: 'Cx', label: 'Cx:', value: c.cx.toFixed(2) + ' m' },
        { key: 'Cy', label: 'Cy:', value: c.cy.toFixed(2) + ' m' },
        { key: 'netArea', label: 'A còn:', value: (plate.area-holeArea).toFixed(2) + ' m²' },
        { key: 'plateContribution', label: '+A(x₁; y₁):', value: `(${(plate.area*plate.cx).toFixed(2)}; ${(plate.area*plate.cy).toFixed(2)}) m³` },
        { key: 'holeContribution', label: '−A₀(x₀; y₀):', value: `(${(-holeArea*hole.cx).toFixed(2)}; ${(-holeArea*hole.cy).toFixed(2)}) m³` },
        { key: 'sumAx', label: 'ΣAᵢxᵢ:', value: (plate.area*plate.cx-holeArea*hole.cx).toFixed(2) + ' m³' },
        { key: 'sumAy', label: 'ΣAᵢyᵢ:', value: (plate.area*plate.cy-holeArea*hole.cy).toFixed(2) + ' m³' }
      ]);
    }

    const panel = shell.setTheory({
      formulas: ['\\textcolor{#e06a00}{x_C} = \\dfrac{A x_1 - A_0 x_0}{A - A_0}', '\\textcolor{#e06a00}{y_C} = \\dfrac{A y_1 - A_0 y_0}{A - A_0}'],
      legend: [{ color: Pal.resultant, label: 'C (trọng tâm)' }, { color: Pal.reaction, label: 'lỗ khoét' }],
      observe: 'Tấm đồng chất, chiều dày đều, trọng trường đều: trọng tâm trùng tâm diện tích. Kích thước 6 m × 4 m, lỗ r = 1 m luôn nằm trong tấm. Lỗ đóng góp diện tích âm; bảng +A/−A và mômen diện tích theo m³ cho cả x/y. C dịch ra xa phần bị trừ.'
    });

    const handle = shell.addHandle({ x: hole.cx, y: hole.cy }, {
      fill: Pal.handle,
      a11y: { label: 'Tâm lỗ khoét', axis: 'both', valueText: wp => `x lỗ ${wp.x.toFixed(1)} m, y lỗ ${wp.y.toFixed(1)} m; bán kính 1 m` },
      bounds: { minX: 1, maxX: 5, minY: 1, maxY: 3 },
      keyboardStep: { x: 0.1, y: 0.1 },
      onDrag(wp) {
        hole.cx = Math.round(Math.min(6-hole.r, Math.max(hole.r,wp.x))*10)/10;
        hole.cy = Math.round(Math.min(4-hole.r, Math.max(hole.r,wp.y))*10)/10;
        render2();
      }
    });
    const holeX = shell.addNumberControl({ id: 'holeX', label: 'x lỗ', min: 1, max: 5, step: 0.1, value: hole.cx, unit: 'm', onInput(v) { hole.cx = Math.round(v*10)/10; render2(); } });
    const holeY = shell.addNumberControl({ id: 'holeY', label: 'y lỗ', min: 1, max: 3, step: 0.1, value: hole.cy, unit: 'm', onInput(v) { hole.cy = Math.round(v*10)/10; render2(); } });
    shell.addAction({ id: 'reset', label: 'Đặt lại', onClick() { hole.cx = 4.5; hole.cy = 2.5; render2(); } });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
