/**
 * ch1-1-5 — Thu gọn hệ lực phẳng → R + Mo (reduceToResultant).
 * Bespoke (hình-học): kéo đầu 2 lực thành phần → hợp lực R + mô men Mo cập nhật realtime.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, P = root.SimPhysicsStatics, Pal = root.Sim2Palette;

  Reg.register('ch1-1-5', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -4, minY: -4, maxX: 4, maxY: 4 }, reservePanel: true,
      meta: { name: 'Thu gọn hệ lực phẳng → R + Mo', section: '1.5', chapter: 1 }
    });
    const { svg, tf, overlay, render } = shell;
    const VIS = 0.03;
    const O = { x: 0, y: 0 };
    let sim3 = null;

    svg.appendChild(render.line(tf, { x: -4, y: 0 }, { x: 4, y: 0 }, { stroke: Pal.axis, width: 1 }));
    svg.appendChild(render.line(tf, { x: 0, y: -4 }, { x: 0, y: 4 }, { stroke: Pal.axis, width: 1 }));

    const forces = [
      { r: { x: -2, y: 1 }, F: { fx: 40, fy: 20 } },
      { r: { x: 2, y: -1 }, F: { fx: -20, fy: 40 } }
    ];
    const arrows = forces.map(() => {
      const ar = render.arrow(tf, svg, O, O, { stroke: Pal.force, width: 2.5 });
      svg.appendChild(ar); return ar;
    });
    const rArrow = render.arrow(tf, svg, O, O, { stroke: Pal.resultant, width: 3.5 });
    svg.appendChild(rArrow);

    const fLabels = forces.map((f, i) => overlay.label('F' + (i + 1), O, { anchor: 'left', color: Pal.force }));
    const rLabel = overlay.label('R', O, { anchor: 'left', color: Pal.resultant });

    function setArrow(ar, base, tip) {
      const b = tf.toScreen(base), t = tf.toScreen(tip);
      ar.setAttribute('x1', b.x); ar.setAttribute('y1', b.y);
      ar.setAttribute('x2', t.x); ar.setAttribute('y2', t.y);
    }
    function render2() {
      forces.forEach((f, i) => {
        const tip = { x: f.r.x + f.F.fx * VIS, y: f.r.y + f.F.fy * VIS };
        setArrow(arrows[i], f.r, tip);
        overlay.moveLabel(fLabels[i], { x: tip.x + 0.3, y: tip.y });
        handles[i].move(tip);
      });
      const red = P.reduceToResultant(forces);
      const rTip = { x: red.Rx * VIS, y: red.Ry * VIS };
      setArrow(rArrow, O, rTip);
      overlay.moveLabel(rLabel, { x: rTip.x + 0.3, y: rTip.y + 0.2 });
      panel.setReadout([
        { label: 'Rx:', value: red.Rx.toFixed(1) + ' N' },
        { label: 'Ry:', value: red.Ry.toFixed(1) + ' N' },
        { label: '|R|:', value: Math.hypot(red.Rx, red.Ry).toFixed(1) + ' N' },
        { label: 'Mo:', value: red.Mo.toFixed(1) + ' N·m' }
      ]);
      if (sim3) sim3.setState({
        forces: forces.map(f => ({ r: { x: f.r.x, y: f.r.y }, F: { fx: f.F.fx, fy: f.F.fy } })),
        resultant: red
      });
    }

    const panel = shell.setTheory({
      formulas: ['\\textcolor{#e06a00}{\\vec{R}} = \\sum \\textcolor{#e03030}{\\vec{F_i}}', 'M_O = \\sum M_O(\\vec{F_i})'],
      legend: [{ color: Pal.force, label: 'lực thành phần' }, { color: Pal.resultant, label: 'R (hợp lực)' }],
      observe: 'Kéo đầu mỗi lực để đổi hệ; hợp lực R và mô men thu gọn Mo cập nhật theo.'
    });

    sim3 = root.Sim3Mode && root.Sim3Ch115 ? root.Sim3Mode.attach({
      container,
      shell2dRoot: shell.root,
      create3d: ctx => root.Sim3Ch115.create({ host: ctx.host, referenceEl: shell.root, onFallback: ctx.onFallback })
    }) : null;
    if (sim3) shell.addCleanup(() => sim3.dispose());

    const handles = forces.map((f) => {
      const tip0 = { x: f.r.x + f.F.fx * VIS, y: f.r.y + f.F.fy * VIS };
      return shell.addHandle(tip0, {
        fill: Pal.handle,
        onDrag(wp) {
          f.F.fx = (wp.x - f.r.x) / VIS;
          f.F.fy = (wp.y - f.r.y) / VIS;
          render2();
        }
      });
    });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
