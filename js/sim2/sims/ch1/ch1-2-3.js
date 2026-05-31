/**
 * ch1-2-3 — Hình bình hành lực (2 lực đồng quy). R = F1 + F2.
 * Kéo đầu 2 véc tơ → hợp lực R theo quy tắc hình bình hành cập nhật realtime.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, P = root.SimPhysicsStatics;

  Reg.register('ch1-2-3', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -1, minY: -1, maxX: 6, maxY: 6 }
    });
    const { svg, tf, overlay, render } = shell;
    const VIS = 0.04;
    const O = { x: 0, y: 0 };

    svg.appendChild(render.line(tf, { x: -1, y: 0 }, { x: 6, y: 0 }, { stroke: '#ccc', width: 1 }));
    svg.appendChild(render.line(tf, { x: 0, y: -1 }, { x: 0, y: 6 }, { stroke: '#ccc', width: 1 }));

    // 2 lực đồng quy tại O
    let f1 = { fx: 80, fy: 20 }, f2 = { fx: 25, fy: 70 };
    const a1 = render.arrow(tf, svg, O, O, { stroke: '#3a8', width: 2.5 }); svg.appendChild(a1);
    const a2 = render.arrow(tf, svg, O, O, { stroke: '#38a', width: 2.5 }); svg.appendChild(a2);
    const aR = render.arrow(tf, svg, O, O, { stroke: '#e63', width: 3.5 }); svg.appendChild(aR);
    // cạnh hình bình hành (nét đứt)
    const e1 = render.line(tf, O, O, { stroke: '#bbb', width: 1, dash: '4 3' }); svg.appendChild(e1);
    const e2 = render.line(tf, O, O, { stroke: '#bbb', width: 1, dash: '4 3' }); svg.appendChild(e2);

    const lF1 = overlay.label('F₁', O, { anchor: 'left', color: '#178' });
    const lF2 = overlay.label('F₂', O, { anchor: 'left', color: '#147' });
    const lR = overlay.label('R', O, { anchor: 'left', color: '#c30' });
    const card = overlay.readoutCard([]);

    function set(ar, base, tip) {
      const b = tf.toScreen(base), t = tf.toScreen(tip);
      ar.setAttribute('x1', b.x); ar.setAttribute('y1', b.y);
      ar.setAttribute('x2', t.x); ar.setAttribute('y2', t.y);
    }
    function update() {
      const t1 = { x: f1.fx * VIS, y: f1.fy * VIS };
      const t2 = { x: f2.fx * VIS, y: f2.fy * VIS };
      const tR = { x: t1.x + t2.x, y: t1.y + t2.y };
      set(a1, O, t1); set(a2, O, t2); set(aR, O, tR);
      set(e1, t1, tR); set(e2, t2, tR);
      overlay.moveLabel(lF1, { x: t1.x + 0.3, y: t1.y });
      overlay.moveLabel(lF2, { x: t2.x + 0.3, y: t2.y });
      overlay.moveLabel(lR, { x: tR.x + 0.3, y: tR.y + 0.2 });
      const Rx = f1.fx + f2.fx, Ry = f1.fy + f2.fy;
      const ang = Math.acos((f1.fx * f2.fx + f1.fy * f2.fy) /
        (Math.hypot(f1.fx, f1.fy) * Math.hypot(f2.fx, f2.fy))) * 180 / Math.PI;
      card.__render([
        { label: '|F₁|:', value: Math.hypot(f1.fx, f1.fy).toFixed(0) + ' N' },
        { label: '|F₂|:', value: Math.hypot(f2.fx, f2.fy).toFixed(0) + ' N' },
        { label: '∠(F₁,F₂):', value: ang.toFixed(0) + '°' },
        { label: '|R|:', value: Math.hypot(Rx, Ry).toFixed(1) + ' N' }
      ]);
    }

    [[f1], [f2]].forEach(([f]) => {
      const tip0 = { x: f.fx * VIS, y: f.fy * VIS };
      const h = shell.addHandle(tip0, {
        onDrag(wp) {
          f.fx = Math.max(0, wp.x) / VIS; f.fy = Math.max(0, wp.y) / VIS;
          h.move({ x: f.fx * VIS, y: f.fy * VIS }); update();
        }
      });
    });
    update();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
