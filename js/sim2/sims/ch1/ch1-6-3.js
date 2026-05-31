/**
 * ch1-6-3 — Trọng tâm hình ghép / khoét. centroidComposite + centroidWithHole.
 * Kéo vị trí lỗ khoét → trọng tâm C dịch chuyển realtime. worldBox fit sát hình.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, P = root.SimPhysicsStatics;

  Reg.register('ch1-6-3', function(container) {
    // worldBox fit sát hình ghép (tấm 6×4) + lề nhỏ → không để canvas trống ~50% (defect cũ)
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -1, minY: -1, maxX: 7, maxY: 5 }
    });
    const { svg, tf, overlay, render } = shell;

    // Tấm chữ nhật 6×4 tại gốc (0,0)-(6,4), khoét lỗ tròn bán kính 1
    const plate = { area: 6 * 4, cx: 3, cy: 2 };
    let hole = { cx: 4.5, cy: 2.5, r: 1 };

    // Vẽ tấm
    svg.appendChild(render.poly(tf,
      [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 6, y: 4 }, { x: 0, y: 4 }],
      { closed: true, fill: 'rgba(120,170,90,0.35)', stroke: '#586' }));
    const holeCircle = render.circle(tf, { x: hole.cx, y: hole.cy }, hole.r, { fill: '#fff', stroke: '#a44', width: 2 });
    svg.appendChild(holeCircle);
    const cMark = render.circle(tf, { x: plate.cx, y: plate.cy }, 5, { pixel: true, fill: '#c30', stroke: '#c30' });
    svg.appendChild(cMark);

    const lblC = overlay.label('C', { x: plate.cx, y: plate.cy }, { anchor: 'left', color: '#c30' });
    const lblHole = overlay.label('lỗ', { x: hole.cx, y: hole.cy }, { color: '#a44' });
    const card = overlay.readoutCard([]);

    function update() {
      const holeArea = Math.PI * hole.r * hole.r;
      const c = P.centroidWithHole(plate, { area: holeArea, cx: hole.cx, cy: hole.cy });
      // Cập nhật lỗ
      const hc = tf.toScreen({ x: hole.cx, y: hole.cy });
      holeCircle.setAttribute('cx', hc.x); holeCircle.setAttribute('cy', hc.y);
      // Cập nhật mark trọng tâm
      const cs = tf.toScreen({ x: c.cx, y: c.cy });
      cMark.setAttribute('cx', cs.x); cMark.setAttribute('cy', cs.y);
      overlay.moveLabel(lblC, { x: c.cx + 0.3, y: c.cy + 0.3 });
      overlay.moveLabel(lblHole, { x: hole.cx, y: hole.cy });
      card.__render([
        { label: 'A tấm:', value: plate.area.toFixed(1) },
        { label: 'A lỗ:', value: holeArea.toFixed(2) },
        { label: 'Cx:', value: c.cx.toFixed(2) },
        { label: 'Cy:', value: c.cy.toFixed(2) }
      ]);
    }

    // Handle = tâm lỗ; dùng tf.toWorld nên rescale chỉ đổi transform, handle tự đúng
    const handle = shell.addHandle({ x: hole.cx, y: hole.cy }, {
      onDrag(wp) {
        hole.cx = Math.min(6 - hole.r, Math.max(hole.r, wp.x));
        hole.cy = Math.min(4 - hole.r, Math.max(hole.r, wp.y));
        handle.move({ x: hole.cx, y: hole.cy });
        update();
      }
    });
    update();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
