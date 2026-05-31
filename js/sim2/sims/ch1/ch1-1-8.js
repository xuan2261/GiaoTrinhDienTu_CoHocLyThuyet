/**
 * ch1-1-8 — Phản lực liên kết + dựng FBD. beamReactions, đổi vị trí tải.
 * Dropdown chọn loại gối trái (cố định/di động). Kéo tải → Ra, Rb cập nhật.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, P = root.SimPhysicsStatics;

  Reg.register('ch1-1-8', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -1, minY: -2, maxX: 11, maxY: 4 }
    });
    const { svg, tf, overlay, render } = shell;
    const L = 10, VIS = 0.02;
    const A = { x: 0, y: 0 }, B = { x: L, y: 0 };

    // Dầm
    svg.appendChild(render.line(tf, A, B, { stroke: '#444', width: 5 }));
    // Gối A (tam giác), gối B (tam giác + con lăn)
    function support(pt) {
      svg.appendChild(render.poly(tf,
        [{ x: pt.x, y: 0 }, { x: pt.x - 0.4, y: -0.8 }, { x: pt.x + 0.4, y: -0.8 }],
        { closed: true, stroke: '#666', fill: 'rgba(120,120,120,0.3)' }));
    }
    support(A); support(B);

    let load = 100, pos = 4;
    const loadArrow = render.arrow(tf, svg, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: '#e63', width: 3 });
    svg.appendChild(loadArrow);
    const raArrow = render.arrow(tf, svg, A, A, { stroke: '#2a7', width: 3 }); svg.appendChild(raArrow);
    const rbArrow = render.arrow(tf, svg, B, B, { stroke: '#2a7', width: 3 }); svg.appendChild(rbArrow);

    overlay.label('A', { x: 0, y: -1 }, { anchor: 'top' });
    overlay.label('B', { x: L, y: -1 }, { anchor: 'top' });
    const lblP = overlay.label('P', { x: pos, y: 1 }, { anchor: 'bottom', color: '#c30' });
    const lblRa = overlay.label('Rₐ', { x: 0, y: 1 }, { anchor: 'right', color: '#178' });
    const lblRb = overlay.label('R_b', { x: L, y: 1 }, { anchor: 'left', color: '#178' });
    const card = overlay.readoutCard([]);

    function set(ar, base, tip) {
      const b = tf.toScreen(base), t = tf.toScreen(tip);
      ar.setAttribute('x1', b.x); ar.setAttribute('y1', b.y);
      ar.setAttribute('x2', t.x); ar.setAttribute('y2', t.y);
    }
    function update() {
      const r = P.beamReactions(load, pos, L);
      // Tải hướng xuống tại pos
      set(loadArrow, { x: pos, y: load * VIS }, { x: pos, y: 0 });
      set(raArrow, A, { x: 0, y: r.ra * VIS });
      set(rbArrow, B, { x: L, y: r.rb * VIS });
      overlay.moveLabel(lblP, { x: pos, y: load * VIS + 0.3 });
      overlay.moveLabel(lblRa, { x: -0.3, y: r.ra * VIS });
      overlay.moveLabel(lblRb, { x: L + 0.3, y: r.rb * VIS });
      card.__render([
        { label: 'P:', value: load + ' N' },
        { label: 'a:', value: pos.toFixed(2) + ' m' },
        { label: 'Rₐ:', value: r.ra.toFixed(1) + ' N' },
        { label: 'R_b:', value: r.rb.toFixed(1) + ' N' }
      ]);
    }

    const handle = shell.addHandle({ x: pos, y: 0 }, {
      onDrag(wp) {
        pos = Math.min(L - 0.3, Math.max(0.3, wp.x));
        handle.move({ x: pos, y: 0 });
        update();
      }
    });
    update();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
