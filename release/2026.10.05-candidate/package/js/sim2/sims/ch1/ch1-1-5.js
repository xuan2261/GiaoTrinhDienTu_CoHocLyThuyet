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
    const rArrow = render.arrow(tf, svg, O, O, { stroke: Pal.resultant, width: 3.5, class: 'sim2-resultant-line' });
    svg.appendChild(rArrow);

    const momentArc = render.el('path', { class: 'sim2-moment-arc', fill: 'none', stroke: Pal.moment, 'stroke-width': 2.5, 'marker-end': `url(#${svg.__markerId})` });
    svg.appendChild(momentArc);
    const mLabel = overlay.label('M₀', { x: -0.7, y: -0.6 }, { color: Pal.moment });

    const fLabels = forces.map((f, i) => overlay.label('F' + (i + 1), O, { anchor: 'left', color: Pal.force }));
    const rLabel = overlay.label('R', O, { anchor: 'left', color: Pal.resultant });

    function setArrow(ar, base, tip) {
      const b = tf.toScreen(base), t = tf.toScreen(tip);
      ar.setAttribute('x1', b.x); ar.setAttribute('y1', b.y);
      ar.setAttribute('x2', t.x); ar.setAttribute('y2', t.y);
    }
    function render2() {
      forces.forEach((f, i) => {
        forceInputs[i].x.setValue(f.F.fx); forceInputs[i].y.setValue(f.F.fy);
        arrows[i].setAttribute('visibility', Math.hypot(f.F.fx, f.F.fy) < 1e-9 ? 'hidden' : 'visible');
        const tip = { x: f.r.x + f.F.fx * VIS, y: f.r.y + f.F.fy * VIS };
        setArrow(arrows[i], f.r, tip);
        overlay.moveLabel(fLabels[i], { x: tip.x + 0.3, y: tip.y });
        handles[i].move(tip);
      });
      const red = P.reduceToResultant(forces);
      const rTip = { x: red.Rx * VIS, y: red.Ry * VIS };
      setArrow(rArrow, O, rTip);
      rArrow.setAttribute('visibility', Math.hypot(red.Rx, red.Ry) < 1e-9 ? 'hidden' : 'visible');
      const c = tf.toScreen(O), radius = 18, ccw = red.Mo > 0;
      momentArc.setAttribute('d', `M ${c.x + radius} ${c.y} A ${radius} ${radius} 0 1 ${ccw ? 0 : 1} ${c.x} ${c.y + (ccw ? radius : -radius)}`);
      momentArc.setAttribute('data-dir', ccw ? 'ccw' : 'cw');
      momentArc.setAttribute('visibility', Math.abs(red.Mo) < 1e-9 ? 'hidden' : 'visible');
      mLabel.textContent = Math.abs(red.Mo) < 1e-9 ? 'M₀ = 0' : (ccw ? 'M₀ (+), CCW' : 'M₀ (−), CW');
      rLabel.textContent = Math.hypot(red.Rx, red.Ry) < 1e-9 ? 'R = 0' : 'R';
      overlay.moveLabel(rLabel, { x: rTip.x + 0.3, y: rTip.y + 0.2 });
      panel.setReadout([
        { key: 'Rx', label: 'Rx:', value: red.Rx.toFixed(1) + ' N' },
        { key: 'Ry', label: 'Ry:', value: red.Ry.toFixed(1) + ' N' },
        { key: 'R', label: '|R|:', value: Math.hypot(red.Rx, red.Ry).toFixed(1) + ' N' },
        { key: 'Mo', label: 'M₀ (CCW+):', value: (red.Mo > 0 ? '+' : '') + red.Mo.toFixed(1) + ' N·m' },
        { key: 'force1', label: 'F₁ tại (−2; 1) m:', value: `(${forces[0].F.fx.toFixed(1)}; ${forces[0].F.fy.toFixed(1)}) N` },
        { key: 'force2', label: 'F₂ tại (2; −1) m:', value: `(${forces[1].F.fx.toFixed(1)}; ${forces[1].F.fy.toFixed(1)}) N` },
        { key: 'system', label: 'Hệ thu gọn:', value: Math.hypot(red.Rx, red.Ry) < 1e-9 ? (Math.abs(red.Mo) < 1e-9 ? 'cân bằng: R = 0, M₀ = 0' : 'ngẫu lực thuần: R = 0, M₀ ≠ 0') : 'R tại O và M₀' },
        { key: 'inputLimit', label: 'Miền điều khiển:', value: 'Đầu lực và R trong ±3,5 đơn vị hình; nhập ngoài miền được giới hạn' }
      ]);
      if (sim3) sim3.setState({
        forces: forces.map(f => ({ r: { x: f.r.x, y: f.r.y }, F: { fx: f.F.fx, fy: f.F.fy } })),
        resultant: red,
        modelAssumptions: 'Hai điểm đặt cố định; CCW dương; tọa độ m, lực N, mômen N·m',
        displayScales: { force: VIS, resultant: VIS }
      });
    }

    const panel = shell.setTheory({
      formulas: ['\\textcolor{#e06a00}{\\vec{R}} = \\sum \\textcolor{#e03030}{\\vec{F_i}}', 'M_O = \\sum M_O(\\vec{F_i})'],
      legend: [{ color: Pal.force, label: 'lực thành phần' }, { color: Pal.resultant, label: 'R tại O' }, { color: Pal.moment, label: 'M₀ có dấu tại O' }],
      observe: 'Hệ thu gọn gồm R VÀ M₀ tại O; CCW dương. Điểm đặt hai lực cố định, kéo đầu chỉ đổi thành phần. Tọa độ m, lực N. F₁/F₂/R cùng thang trong mỗi chế độ; 2D 0,03 đơn vị hình/N. Cung M₀ chỉ chiều, không biểu thị góc quay.'
    });

    sim3 = root.Sim3Mode && root.Sim3Ch115 ? root.Sim3Mode.attach({
      container,
      shell2dRoot: shell.root,
      create3d: ctx => root.Sim3Ch115.create({ host: ctx.host, referenceEl: shell.root, onFallback: ctx.onFallback })
    }) : null;
    if (sim3) shell.addCleanup(() => sim3.dispose());

    function changeForce(index, fx, fy) {
      const f = forces[index], other = forces[1-index].F;
      function constrain(value, base, otherValue) {
        const low = Math.ceil(Math.max((-3.5-base)/VIS, -3.5/VIS-otherValue)*10)/10;
        const high = Math.floor(Math.min((3.5-base)/VIS, 3.5/VIS-otherValue)*10)/10;
        return Math.max(low, Math.min(high, Math.round(value*10)/10));
      }
      f.F.fx = constrain(fx, f.r.x, other.fx);
      f.F.fy = constrain(fy, f.r.y, other.fy);
    }
    const forceInputs = forces.map((f,index) => {
      const make = (axis,component) => shell.addNumberControl({ id: `F${index+1}${axis}`, label: `F${index+1}${axis}`, min: Math.ceil((-3.5-f.r[axis])/VIS*10)/10, max: Math.floor((3.5-f.r[axis])/VIS*10)/10, step: 0.1, value: f.F[component], unit: 'N', onInput(v) { changeForce(index, axis==='x' ? v : f.F.fx, axis==='y' ? v : f.F.fy); render2(); } });
      return { x: make('x','fx'), y: make('y','fy') };
    });

    const handles = forces.map((f, index) => {
      const tip0 = { x: f.r.x + f.F.fx * VIS, y: f.r.y + f.F.fy * VIS };
      return shell.addHandle(tip0, {
        fill: Pal.handle,
        a11y: { label: `Đầu vectơ lực F${index + 1}; điểm đặt cố định`, axis: 'both', valueText: () => `F${index + 1}x ${f.F.fx.toFixed(1)} N, F${index + 1}y ${f.F.fy.toFixed(1)} N; điểm đặt (${f.r.x}; ${f.r.y}) m` },
        keyboardStep: { x: VIS, y: VIS },
        onDrag(wp) {
          changeForce(index, (wp.x-f.r.x)/VIS, (wp.y-f.r.y)/VIS);
          render2();
        }
      });
    });
    shell.addAction({ id: 'reset', label: 'Đặt lại', onClick() { forces[0].F = { fx: 40, fy: 20 }; forces[1].F = { fx: -20, fy: 40 }; render2(); } });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
