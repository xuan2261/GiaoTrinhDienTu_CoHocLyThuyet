/**
 * ch1-3-6 — Phản lực & mô men ngàm (cantilever, tải đổi vị trí).
 * Kéo tải dọc dầm → phản lực R = P, mô men ngàm M = P·a cập nhật realtime.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell;

  Reg.register('ch1-3-6', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -1.5, minY: -2, maxX: 9, maxY: 3 }
    });
    const { svg, tf, overlay, render } = shell;
    const L = 8, VIS = 0.018;
    const wall = { x: 0, y: 0 };

    // Tường ngàm (hatch đơn giản) + dầm
    svg.appendChild(render.line(tf, { x: 0, y: -1.5 }, { x: 0, y: 1.5 }, { stroke: '#444', width: 5 }));
    svg.appendChild(render.line(tf, wall, { x: L, y: 0 }, { stroke: '#444', width: 5 }));
    for (let i = -1.2; i <= 1.2; i += 0.4) {
      svg.appendChild(render.line(tf, { x: -0.4, y: i + 0.2 }, { x: 0, y: i }, { stroke: '#888', width: 1 }));
    }

    let load = 80, pos = 5;
    const loadArrow = render.arrow(tf, svg, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: '#e63', width: 3 });
    svg.appendChild(loadArrow);
    // Mô men ngàm: cung tròn (vẽ path xấp xỉ) + phản lực R tại ngàm
    const rArrow = render.arrow(tf, svg, wall, wall, { stroke: '#2a7', width: 3 }); svg.appendChild(rArrow);

    const lblP = overlay.label('P', { x: pos, y: 1 }, { anchor: 'bottom', color: '#c30' });
    const lblR = overlay.label('R', { x: 0, y: 0 }, { anchor: 'right', color: '#178' });
    const lblM = overlay.label('M', { x: 0.2, y: -0.8 }, { color: '#85a' });
    const card = overlay.readoutCard([]);

    function set(ar, base, tip) {
      const b = tf.toScreen(base), t = tf.toScreen(tip);
      ar.setAttribute('x1', b.x); ar.setAttribute('y1', b.y);
      ar.setAttribute('x2', t.x); ar.setAttribute('y2', t.y);
    }
    function update() {
      const R = load, M = load * pos; // phản lực + mô men ngàm
      set(loadArrow, { x: pos, y: load * VIS }, { x: pos, y: 0 });
      set(rArrow, wall, { x: 0, y: R * VIS });
      overlay.moveLabel(lblP, { x: pos, y: load * VIS + 0.3 });
      overlay.moveLabel(lblR, { x: -0.3, y: R * VIS });
      card.__render([
        { label: 'P:', value: load + ' N' },
        { label: 'a:', value: pos.toFixed(2) + ' m' },
        { label: 'R:', value: R.toFixed(1) + ' N' },
        { label: 'M ngàm:', value: M.toFixed(1) + ' N·m' }
      ]);
    }

    const handle = shell.addHandle({ x: pos, y: 0 }, {
      onDrag(wp) {
        pos = Math.min(L, Math.max(0.5, wp.x));
        handle.move({ x: pos, y: 0 });
        update();
      }
    });
    update();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
