/**
 * ch1-1-4 — Mô men lực & cánh tay đòn. M = F·d·sinθ (computeMoment).
 * Kéo điểm đặt lực → cánh tay đòn d đổi → M cập nhật realtime.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, P = root.SimPhysicsStatics;

  Reg.register('ch1-1-4', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -1, minY: -2, maxX: 7, maxY: 4 }
    });
    const { svg, tf, overlay, render } = shell;
    const O = { x: 0, y: 0 };

    // Trục + tâm quay O
    svg.appendChild(render.line(tf, { x: -1, y: 0 }, { x: 7, y: 0 }, { stroke: '#ccc', width: 1 }));
    svg.appendChild(render.circle(tf, O, 6, { pixel: true, fill: '#333', stroke: '#333' }));

    let app = { x: 4, y: 0 };       // điểm đặt lực (trên trục)
    const F = 50, Fdir = 90;        // lực hướng lên, độ lớn 50N
    const VIS = 0.03;

    const armLine = render.line(tf, O, app, { stroke: '#888', width: 2 });
    const forceArrow = render.arrow(tf, svg, app, app, { stroke: '#2a7', width: 3 });
    svg.appendChild(armLine); svg.appendChild(forceArrow);

    overlay.label('O', O, { anchor: 'right' });
    const lblArm = overlay.label('d', { x: 2, y: -0.5 }, { color: '#666' });
    const lblF = overlay.label('F', app, { anchor: 'bottom', color: '#178' });
    const card = overlay.readoutCard([]);

    function update() {
      const d = Math.abs(app.x);
      const M = P.computeMoment(F, d, Fdir); // θ giữa cánh tay (ngang) và F (đứng) = 90
      const o = tf.toScreen(O), a = tf.toScreen(app);
      armLine.setAttribute('x1', o.x); armLine.setAttribute('y1', o.y);
      armLine.setAttribute('x2', a.x); armLine.setAttribute('y2', a.y);
      const tip = tf.toScreen({ x: app.x, y: app.y + F * VIS });
      forceArrow.setAttribute('x1', a.x); forceArrow.setAttribute('y1', a.y);
      forceArrow.setAttribute('x2', tip.x); forceArrow.setAttribute('y2', tip.y);
      overlay.moveLabel(lblArm, { x: app.x / 2, y: -0.5 });
      overlay.moveLabel(lblF, { x: app.x, y: app.y + F * VIS + 0.3 });
      card.__render([
        { label: 'F:', value: F + ' N' },
        { label: 'd:', value: d.toFixed(2) + ' m' },
        { label: 'M:', value: M.toFixed(1) + ' N·m' }
      ]);
    }

    const handle = shell.addHandle(app, {
      onDrag(wp) {
        app = { x: Math.min(6.5, Math.max(0.5, wp.x)), y: 0 };
        handle.move(app);
        update();
      }
    });
    update();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
