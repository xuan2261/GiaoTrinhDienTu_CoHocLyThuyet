/**
 * ch1-1-5 — Thu gọn hệ lực phẳng → R + Mo (reduceToResultant).
 * Kéo đầu 2 lực thành phần → hợp lực R + mô men Mo cập nhật realtime.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, P = root.SimPhysicsStatics;

  Reg.register('ch1-1-5', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -4, minY: -4, maxX: 4, maxY: 4 }
    });
    const { svg, tf, overlay, render } = shell;
    const VIS = 0.03;
    const O = { x: 0, y: 0 };

    svg.appendChild(render.line(tf, { x: -4, y: 0 }, { x: 4, y: 0 }, { stroke: '#ccc', width: 1 }));
    svg.appendChild(render.line(tf, { x: 0, y: -4 }, { x: 0, y: 4 }, { stroke: '#ccc', width: 1 }));

    // 2 lực: F1 tại (-2,1), F2 tại (2,-1); kéo đầu mũi tên đổi vector
    const forces = [
      { r: { x: -2, y: 1 }, F: { fx: 40, fy: 20 } },
      { r: { x: 2, y: -1 }, F: { fx: -20, fy: 40 } }
    ];
    const arrows = forces.map(() => {
      const ar = render.arrow(tf, svg, O, O, { stroke: '#3a8', width: 2.5 });
      svg.appendChild(ar); return ar;
    });
    const rArrow = render.arrow(tf, svg, O, O, { stroke: '#e63', width: 3.5 });
    svg.appendChild(rArrow);

    const fLabels = forces.map((f, i) => overlay.label('F' + (i + 1), O, { anchor: 'left', color: '#178' }));
    const rLabel = overlay.label('R', O, { anchor: 'left', color: '#c30' });
    const card = overlay.readoutCard([]);

    function setArrow(ar, base, tip) {
      const b = tf.toScreen(base), t = tf.toScreen(tip);
      ar.setAttribute('x1', b.x); ar.setAttribute('y1', b.y);
      ar.setAttribute('x2', t.x); ar.setAttribute('y2', t.y);
    }
    function update() {
      forces.forEach((f, i) => {
        const tip = { x: f.r.x + f.F.fx * VIS, y: f.r.y + f.F.fy * VIS };
        setArrow(arrows[i], f.r, tip);
        overlay.moveLabel(fLabels[i], { x: tip.x + 0.3, y: tip.y });
      });
      const red = P.reduceToResultant(forces);
      const rTip = { x: red.Rx * VIS, y: red.Ry * VIS };
      setArrow(rArrow, O, rTip);
      overlay.moveLabel(rLabel, { x: rTip.x + 0.3, y: rTip.y + 0.2 });
      card.__render([
        { label: 'Rx:', value: red.Rx.toFixed(1) + ' N' },
        { label: 'Ry:', value: red.Ry.toFixed(1) + ' N' },
        { label: '|R|:', value: Math.hypot(red.Rx, red.Ry).toFixed(1) + ' N' },
        { label: 'Mo:', value: red.Mo.toFixed(1) + ' N·m' }
      ]);
    }

    forces.forEach((f, i) => {
      const tip0 = { x: f.r.x + f.F.fx * VIS, y: f.r.y + f.F.fy * VIS };
      const h = shell.addHandle(tip0, {
        onDrag(wp) {
          f.F.fx = (wp.x - f.r.x) / VIS;
          f.F.fy = (wp.y - f.r.y) / VIS;
          h.move(wp);
          update();
        }
      });
    });
    update();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
