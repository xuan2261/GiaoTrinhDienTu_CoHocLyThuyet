/**
 * ch1-1-6 — Ngẫu lực & mô men ngẫu. M = F·d (coupleMoment), độc lập điểm đặt.
 * Kéo 1 trong 2 lực → khoảng cách d đổi → M ngẫu cập nhật. Hợp lực luôn = 0.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, P = root.SimPhysicsStatics;

  Reg.register('ch1-1-6', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -4, minY: -3, maxX: 4, maxY: 3 }
    });
    const { svg, tf, overlay, render } = shell;
    const VIS = 0.04;
    const F = 50; // độ lớn mỗi lực, hướng ngược nhau theo trục y

    svg.appendChild(render.line(tf, { x: -4, y: 0 }, { x: 4, y: 0 }, { stroke: '#ccc', width: 1 }));

    // 2 điểm đặt đối xứng quanh gốc, cách nhau d theo trục x
    let half = 1.5; // nửa khoảng cách
    const upArrow = render.arrow(tf, svg, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: '#2a7', width: 3 });
    const dnArrow = render.arrow(tf, svg, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: '#2a7', width: 3 });
    const dLine = render.line(tf, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: '#888', width: 1.5, dash: '4 3' });
    svg.appendChild(dLine); svg.appendChild(upArrow); svg.appendChild(dnArrow);

    const lblF1 = overlay.label('F', { x: 0, y: 0 }, { anchor: 'right', color: '#178' });
    const lblF2 = overlay.label("F'", { x: 0, y: 0 }, { anchor: 'left', color: '#178' });
    const lblD = overlay.label('d', { x: 0, y: -0.6 }, { color: '#666' });
    const card = overlay.readoutCard([]);

    function setArrow(ar, base, tip) {
      const b = tf.toScreen(base), t = tf.toScreen(tip);
      ar.setAttribute('x1', b.x); ar.setAttribute('y1', b.y);
      ar.setAttribute('x2', t.x); ar.setAttribute('y2', t.y);
    }
    function update() {
      const left = { x: -half, y: 0 }, right = { x: half, y: 0 };
      setArrow(upArrow, left, { x: -half, y: F * VIS });   // lực trái hướng lên
      setArrow(dnArrow, right, { x: half, y: -F * VIS });  // lực phải hướng xuống
      const dl = tf.toScreen(left), dr = tf.toScreen(right);
      dLine.setAttribute('x1', dl.x); dLine.setAttribute('y1', dl.y);
      dLine.setAttribute('x2', dr.x); dLine.setAttribute('y2', dr.y);
      overlay.moveLabel(lblF1, { x: -half - 0.2, y: F * VIS });
      overlay.moveLabel(lblF2, { x: half + 0.2, y: -F * VIS });
      overlay.moveLabel(lblD, { x: 0, y: -0.6 });
      const d = 2 * half;
      card.__render([
        { label: 'F:', value: F + ' N' },
        { label: 'd:', value: d.toFixed(2) + ' m' },
        { label: 'M ngẫu:', value: P.coupleMoment(F, d).toFixed(1) + ' N·m' },
        { label: 'ΣF:', value: '0 (ngẫu lực)' }
      ]);
    }

    const handle = shell.addHandle({ x: half, y: 0 }, {
      onDrag(wp) {
        half = Math.min(3, Math.max(0.5, Math.abs(wp.x)));
        handle.move({ x: half, y: 0 });
        update();
      }
    });
    update();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
