/**
 * ch1-1-3 — Véc tơ lực: điểm đặt / phương / độ lớn.
 * Kéo đầu mũi tên → Fx, Fy, |F|, α cập nhật realtime (resolveForceComponents).
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, P = root.SimPhysicsStatics;

  Reg.register('ch1-1-3', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -1, minY: -1, maxX: 6, maxY: 5 }
    });
    const { svg, tf, overlay, render } = shell;
    const VIS = 0.04; // 1N → 0.04 world

    // Trục
    svg.appendChild(render.line(tf, { x: -1, y: 0 }, { x: 6, y: 0 }, { stroke: '#ccc', width: 1 }));
    svg.appendChild(render.line(tf, { x: 0, y: -1 }, { x: 0, y: 5 }, { stroke: '#ccc', width: 1 }));

    let F = 100, alphaDeg = 35;
    const vecLine = render.arrow(tf, svg, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: '#2a7', width: 3 });
    svg.appendChild(vecLine);
    const fxLine = render.line(tf, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: '#e57', width: 1.5, dash: '4 3' });
    const fyLine = render.line(tf, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: '#57e', width: 1.5, dash: '4 3' });
    svg.appendChild(fxLine); svg.appendChild(fyLine);

    const lblF = overlay.label('F', { x: 0, y: 0 }, { anchor: 'left', color: '#178' });
    overlay.label('O', { x: 0, y: 0 }, { anchor: 'right' });
    const card = overlay.readoutCard([]);

    function tip() {
      const c = P.resolveForceComponents(F, alphaDeg);
      return { x: c.fx * VIS, y: c.fy * VIS, c };
    }
    function update() {
      const t = tip();
      const a = pa => `${pa.x},${pa.y}`;
      const ts = tf.toScreen(t), o = tf.toScreen({ x: 0, y: 0 });
      vecLine.setAttribute('x2', ts.x); vecLine.setAttribute('y2', ts.y);
      vecLine.setAttribute('x1', o.x); vecLine.setAttribute('y1', o.y);
      const fxEnd = tf.toScreen({ x: t.x, y: 0 });
      fxLine.setAttribute('x1', o.x); fxLine.setAttribute('y1', o.y);
      fxLine.setAttribute('x2', fxEnd.x); fxLine.setAttribute('y2', fxEnd.y);
      fyLine.setAttribute('x1', fxEnd.x); fyLine.setAttribute('y1', fxEnd.y);
      fyLine.setAttribute('x2', ts.x); fyLine.setAttribute('y2', ts.y);
      overlay.moveLabel(lblF, { x: t.x + 0.3, y: t.y + 0.2 });
      card.__render([
        { label: '|F|:', value: F.toFixed(0) + ' N' },
        { label: 'Fx:', value: t.c.fx.toFixed(1) + ' N' },
        { label: 'Fy:', value: t.c.fy.toFixed(1) + ' N' },
        { label: 'α:', value: alphaDeg.toFixed(0) + '°' }
      ]);
    }

    const handle = shell.addHandle(tip(), {
      onDrag(wp) {
        F = Math.min(120, Math.max(10, Math.hypot(wp.x, wp.y) / VIS));
        alphaDeg = Math.atan2(wp.y, wp.x) * 180 / Math.PI;
        if (alphaDeg < 0) alphaDeg = 0; if (alphaDeg > 90) alphaDeg = 90;
        handle.move(tip());
        update();
      }
    });
    update();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
